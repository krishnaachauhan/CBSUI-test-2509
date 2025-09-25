import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import { getLoanScheduleDetails } from "pages_audit/pages/operations/loanSchedule/api";
import { LoanScheduleDetailsGridMetadata } from "pages_audit/pages/operations/loanSchedule/gridMetadata";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
const Actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const DetailDisbursement = ({ rowData, setOpenDetail }) => {
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const [detailsGridData, setDetailsGridData] = useState<any>([]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["getLoanScheduleDetails", { rowData }],
    () =>
      getLoanScheduleDetails({
        COMP_CD: rowData?.COMP_CD ?? "",
        BRANCH_CD: rowData?.BRANCH_CD ?? "",
        ACCT_TYPE: rowData?.ACCT_TYPE ?? "",
        ACCT_CD: rowData?.ACCT_CD ?? "",
        TRAN_CD: rowData?.SR_CD ?? "",
        GD_DATE: authState?.workingDate ?? "",
        USER_LEVEL: authState?.role ?? "",
      }),
    {
      enabled: Boolean(rowData?.SR_CD),

      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const updatedData = data.map((item) => ({
            ...item,
            INT_RATE: Number(item?.INT_RATE ?? 0).toFixed(2),
          }));
          setDetailsGridData(updatedData);
        }
      },
    }
  );

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(LoanScheduleDetailsGridMetadata);
    const { DISBURSEMENT_DT, DISBURSEMENT_AMT, REMARKS } = rowData;

    metadata.gridConfig = {
      ...metadata?.gridConfig,
      hideHeader: false,
      gridLabel: t("DisbursementDetailLabel", {
        date: format(new Date(DISBURSEMENT_DT), "dd-MMM-yyyy"),
        amount: DISBURSEMENT_AMT,
        remarks: REMARKS,
      }),
    };
    if (metadata?.columns) {
      metadata.columns = metadata?.columns?.map((column) => {
        if (column?.componentType === "buttonRowCell") {
          return {
            ...column,
            isVisible: false,
          };
        }
        return column;
      });
    }
    return metadata;
  }, [data]);

  const handleClose = useCallback(() => setOpenDetail(false), [setOpenDetail]);

  useEffect(() => {
    return () => queryClient.removeQueries(["getLoanScheduleDetails"]);
  }, []);
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
        key={`LoanScheduleDetailsGridMetadata`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={detailsGridData ?? []}
        setData={() => null}
        actions={Actions}
        setAction={({ name }) => name === "close" && handleClose()}
        loading={isLoading || isFetching}
      />
    </>
  );
};

export default DetailDisbursement;
