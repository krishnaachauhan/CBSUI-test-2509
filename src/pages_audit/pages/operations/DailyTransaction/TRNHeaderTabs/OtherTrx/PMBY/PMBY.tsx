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
import { PMBYGridMetaData } from "./gridMetadata";
import { cloneDeep } from "lodash";
export const PMBY = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getPMBYList", { reqData }],
    () =>
      API.getPMBYList({
        ...reqData,
        BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
      }),
    {
      enabled: hasRequiredFields,
    }
  );
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(PMBYGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "PMBY";
    }
    return metadata;
  }, [data]);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPMBYList", authState?.user?.branchCode]);
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
        key={`PMBYGridMetaData`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        refetchData={handleRefetch}
        loading={isLoading || isFetching}
        enableExport={true}
      />
    </Fragment>
  );
};
