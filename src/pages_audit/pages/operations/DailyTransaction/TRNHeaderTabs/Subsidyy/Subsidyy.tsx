import {
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { Fragment, useContext, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { SubsidyGridMetaData } from "./gridMetadata";
import { cloneDeep } from "lodash";
export const Subsidyy = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getSubsidyList", { reqData }], () => API.getSubsidyList(reqData), {
    enabled: hasRequiredFields,
  });
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(SubsidyGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "Subsidy";
    }
    return metadata;
  }, [data]);
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getSubsidyList",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  return (
    <Fragment>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`SubsidyGridMetaData`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={handleRefetch}
        enableExport={true}
      />
    </Fragment>
  );
};
