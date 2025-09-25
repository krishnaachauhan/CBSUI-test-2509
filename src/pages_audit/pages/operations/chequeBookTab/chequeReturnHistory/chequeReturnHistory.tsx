import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { format, parse, subYears } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { getReturnHistory } from "../api";
import { ChequeReturnHistoryGridMetaData } from "../chequebookDetailMetadata";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

const returnHistoryActions: ActionTypes[] = [
  {
    actionName: "Close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const ChequeReturnHistoryGrid = ({
  setChequebookReturnHistoryOpen,
  reqData,
}) => {
  const { authState } = useContext(AuthContext);

  const formatWorkingDate = authState?.workingDate
    ? parse(authState?.workingDate, "dd/MMM/yyyy", new Date())
    : null;
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getReturnHistory", { reqData }],
    () =>
      getReturnHistory({
        COMP_CD: reqData?.COMP_CD ?? "",
        BRANCH_CD: reqData?.BRANCH_CD ?? "",
        ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
        FROM_ACCT_CD: reqData?.ACCT_CD ?? "",
        TO_ACCT_CD: reqData?.ACCT_CD ?? "",
        FROM_DATE: formatWorkingDate
          ? format(subYears(formatWorkingDate, 1), "dd/MMM/yyyy")
          : "",
        TO_DATE: authState?.workingDate ?? null,
      }),
    {}
  );
  const { trackDialogClass } = useDialogContext();

  ChequeReturnHistoryGridMetaData.gridConfig.gridLabel = `Cheque Return History A/c No.: ${
    reqData?.COMP_CD?.trim() ?? ""
  }/${reqData?.BRANCH_CD?.trim() ?? ""}/${reqData?.ACCT_TYPE?.trim() ?? ""}/${
    reqData?.ACCT_CD?.trim() ?? ""
  }-${reqData?.ACCT_NM?.trim() ?? ""}`;

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getReturnHistory"]);
    };
  }, []);

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail ?? ""}
          color="error"
        />
      )}
      <div className="chequeReturnHistory">
        <GridWrapper
          key={
            `ChequeReturnHistory` +
            data?.length +
            ChequeReturnHistoryGridMetaData?.gridConfig?.gridLabel
          }
          finalMetaData={ChequeReturnHistoryGridMetaData as GridMetaDataType}
          data={data ?? []}
          loading={isLoading || isFetching}
          setData={() => {}}
          actions={returnHistoryActions}
          setAction={(data) => {
            if (data?.name === "Close") {
              setChequebookReturnHistoryOpen(false);
              trackDialogClass("main");
            }
          }}
          refetchData={() => refetch()}
        />
      </div>
    </>
  );
};
export default ChequeReturnHistoryGrid;
