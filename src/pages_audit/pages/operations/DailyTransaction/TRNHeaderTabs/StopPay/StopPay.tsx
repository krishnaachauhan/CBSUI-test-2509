import { Alert, GridMetaDataType, GridWrapper } from "@acuteinfo/common-base";
import { cloneDeep } from "lodash";
import { StopPayGridMetaData } from "pages_audit/pages/operations/stopPaymentEntry/stopPayGridMetadata";
import { useMemo } from "react";
import { useQuery } from "react-query";
import * as API from "./api";

export const StopPay = ({ reqData }) => {
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getStopPayList", { reqData }], () => API.getStopPayList(reqData), {
    enabled: hasRequiredFields,
  });
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(StopPayGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = {
        min: "23.7vh",
        max: "23.7vh",
      };
      metadata.gridConfig.gridLabel =
        reqData?.TAB_DISPL_NAME ?? "ChequeStopDetail";
      metadata.gridConfig.footerNote = "";
    }
    if (metadata?.columns) {
      metadata.columns = metadata.columns
        ?.filter(
          (column) =>
            column?.componentType !== "buttonRowCell" &&
            column?.columnName !== "Status"
        )
        ?.map((column) => {
          if (column?.columnName === "ChequeStopType") {
            return {
              ...column,
              accessor: "FLAG_DISP",
            };
          }
          return column;
        });
      metadata.columns.push(
        {
          accessor: "CHQ_STATUS",
          columnName: "Status",
          sequence: 9,
          alignment: "left",
          componentType: "default",
          width: 100,
          minWidth: 500,
          maxWidth: 130,
        },
        {
          accessor: "RELEASE_DATE",
          columnName: "ReleaseDate",
          sequence: 10,
          alignment: "center",
          componentType: "date",
          dateFormat: "dd/MM/yyyy",
          width: 120,
          minWidth: 100,
          maxWidth: 150,
        }
      );
    }
    return metadata;
  }, [data]);

  return (
    <>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`stopPayGridMetaData`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={handleRefetch}
        enableExport={true}
      />
    </>
  );
};
