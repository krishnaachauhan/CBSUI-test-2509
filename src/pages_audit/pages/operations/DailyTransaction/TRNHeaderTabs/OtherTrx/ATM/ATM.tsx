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
import { ATMGridMetaData } from "./gridMetadata";
import { cloneDeep } from "lodash";
export const ATM = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getATMList", { reqData }], () => API.getATMList(reqData), {
    enabled: hasRequiredFields,
  });
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(ATMGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "ATM";
    }
    return metadata;
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getATMList", authState?.user?.branchCode]);
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
        key={`ATMGridMetaData ${data?.length}`}
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
