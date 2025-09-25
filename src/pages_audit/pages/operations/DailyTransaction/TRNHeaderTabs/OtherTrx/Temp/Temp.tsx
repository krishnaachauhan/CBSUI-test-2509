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
import { TempGridMetaData } from "./gridMetadata";
import { cloneDeep } from "lodash";
export const Temp = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getTempList", { reqData }], () => API.getTempList(reqData), {
    enabled: hasRequiredFields,
  });
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(TempGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.gridLabel =
        reqData?.TAB_DISPL_NAME ?? "TempODAgainst";
    }
    return metadata;
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getTempList", authState?.user?.branchCode]);
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
        key={`TempGridMetaData ${data?.length}`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        loading={isLoading || isFetching}
        data={data ?? []}
        setData={() => null}
        refetchData={handleRefetch}
        enableExport={true}
      />
    </Fragment>
  );
};
