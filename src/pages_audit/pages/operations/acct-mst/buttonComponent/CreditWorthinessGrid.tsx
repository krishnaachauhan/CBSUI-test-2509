import { AppBar, Dialog } from "@mui/material";
import { useCallback, useContext } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  Alert,
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { getJointCreditWorthinessData } from "../api";
import { CreditWorthinessGridMetadata } from "../buttonMetadata/creditWorthinessGridMetadata";
import { t } from "i18next";

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const CreditWorthinessBtnGrid = ({
  handleDialogClose,
  accountNumberDetails,
}) => {
  const { authState } = useContext(AuthContext);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    [
      "getJointCreditWorthinessData",
      accountNumberDetails?.A_COMP_CD,
      accountNumberDetails?.A_BRANCH_CD,
      accountNumberDetails?.A_ACCT_TYPE,
      accountNumberDetails?.A_ACCT_CD,
      accountNumberDetails?.TAB,
    ],
    () =>
      getJointCreditWorthinessData({
        A_COMP_CD: accountNumberDetails?.A_COMP_CD ?? "",
        A_BRANCH_CD: accountNumberDetails?.A_BRANCH_CD ?? "",
        A_ACCT_TYPE: accountNumberDetails?.A_ACCT_TYPE ?? "",
        A_ACCT_CD: accountNumberDetails?.A_ACCT_CD ?? "",
        A_WORKING_DATE: authState?.workingDate ?? "",
      })
  );

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      handleDialogClose();
    }
  }, []);

  let countSelfLoanee = 0;
  let countSelfJointLoanee = 0;
  let countGuarantor = 0;

  if (Array.isArray(data)) {
    countSelfLoanee = data.filter(
      (row) => row.PURPOSE === "SELF LOANEE"
    ).length;
    countSelfJointLoanee = data.filter(
      (row) => row.PURPOSE === "SELF JOINT LOANEE"
    ).length;
    countGuarantor = data.filter((row) => row.PURPOSE === "GUARANTOR").length;
  }
  let totalIRAmount = 0;
  if (Array.isArray(data)) {
    totalIRAmount = data
      .filter(
        (row) =>
          row.PURPOSE === "SELF JOINT LOANEE" ||
          row.PURPOSE === "JOINT LOANEE" ||
          row.PURPOSE === "GUARANTOR"
      )
      .reduce((sum, row) => {
        return sum + (parseFloat(row.IR_AMOUNT) || 0);
      }, 0);
  }
  if (CreditWorthinessGridMetadata?.columns) {
    CreditWorthinessGridMetadata.columns =
      CreditWorthinessGridMetadata?.columns?.map((column) => {
        if (column?.accessor === "SANCTION_DT") {
          return {
            ...column,
            footerLabel: `${t("MemShakhLimit")}: ${data?.[0]?.MEM_LIMIT ?? ""}`,
          };
        }
        if (column?.accessor === "INST_DUE_DT") {
          return {
            ...column,
            footerLabel: totalIRAmount.toString() ?? "",
          };
        }
        if (column?.accessor === "PURPOSE") {
          return {
            ...column,
            footerLabel: `${t("SELFLOANEE")}: ${countSelfLoanee ?? "0"}`,
          };
        }
        if (column?.accessor === "BRANCH_CD") {
          return {
            ...column,
            footerLabel: `${t("SELFJOINTLOANEE")}: ${
              countSelfJointLoanee ?? "0"
            }`,
          };
        }
        if (column?.accessor === "ACCT_TYPE") {
          return {
            ...column,
            footerLabel: `${t("GUARANTOR")}: ${countGuarantor ?? "0"}`,
          };
        }
        return column;
      });
  }

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "80%",
            overflow: "auto",
            padding: "10px",
          },
        }}
        maxWidth="xl"
      >
        {isError && (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={error?.error_msg ?? "Something went to wrong.."}
              errorDetail={error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        )}
        <GridWrapper
          key={
            "CreditWorthinessGridMetadata" +
            countSelfLoanee +
            countSelfJointLoanee +
            countGuarantor
          }
          finalMetaData={CreditWorthinessGridMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => {}}
          loading={isLoading || isFetching}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() => refetch()}
        />
      </Dialog>
    </>
  );
};
