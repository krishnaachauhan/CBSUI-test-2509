import React, { MutableRefObject, useRef } from "react";
import { Paper } from "@mui/material";
import {
  extractMetaData,
  FormWrapper,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";
import {
  AccdetailsFormMetaData,
  DraftdetailsFormMetaData,
  PayslipdetailsFormMetaData,
  TotaldetailsFormMetaData,
} from "./paySlipMetadata";
import { t } from "i18next";
import { PayslipState } from "./PayslipIsuueEntryform";

interface PayslipFormsSectionProps {
  authState: any;
  rows: Record<string, any>;
  isslipnoDataLoading: boolean;
  isAcctDtlLoading: boolean;
  isdraftDtlLoading: boolean;
  slipnoData: any[];
  acctDtlData: any[];
  updatedDraftDtlData: any[];
  docCD: string | null;
  MessageBox: any;
  trackDialogClass: (cls: string) => void;
  myChequeFormRef: MutableRefObject<any>;
  jointDetailMutation: any;
  onSubmitHandler: any;
  payslipState: PayslipState;
  updatePayslipState: (updates: Partial<PayslipState>) => void;
}

const PayslipFormsSection: React.FC<PayslipFormsSectionProps> = ({
  authState,
  rows,
  isslipnoDataLoading,
  isAcctDtlLoading,
  isdraftDtlLoading,
  slipnoData,
  acctDtlData,
  updatedDraftDtlData,
  docCD,
  MessageBox,
  trackDialogClass,
  myChequeFormRef,
  jointDetailMutation,
  onSubmitHandler,
  payslipState,
  updatePayslipState,
}) => {
  const billType = useRef<any>(null);
  const isReady =
    payslipState?.formMode === "new"
      ? !isslipnoDataLoading
      : ![isAcctDtlLoading, isdraftDtlLoading].some(Boolean);

  if (!isReady) {
    return (
      <Paper sx={{ display: "flex", justifyContent: "center" }}>
        <LoaderPaperComponent />
      </Paper>
    );
  }
  const handleAcctDtlFormButtonClick = async (id) => {
    const btnIndex = parseInt(
      id.substring(id.indexOf("[") + 1, id.indexOf("]"))
    );
    const formData = await myChequeFormRef?.current?.getFieldData();
    const paySlipDetails = formData?.PAYSLIP_MST_DTL;
    if (!paySlipDetails) return;

    const arrayIndex = paySlipDetails.length - 1 - btnIndex;
    if (arrayIndex < 0 || arrayIndex >= paySlipDetails.length) return;

    const selectedObject = paySlipDetails[arrayIndex] ?? {};
    const retrievedObj = acctDtlData?.[btnIndex] ?? {};

    const ACCT_CD =
      payslipState?.formMode === "new"
        ? selectedObject.ACCT_CD
        : retrievedObj.ACCT_CD;
    const ACCT_TYPE =
      payslipState?.formMode === "new"
        ? selectedObject.ACCT_TYPE
        : retrievedObj.ACCT_TYPE;

    jointDetailMutation.mutate({
      ACCT_CD,
      ACCT_TYPE,
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
    });

    updatePayslipState({ jointDtl: true });
  };
  const handleDraftDtlFormButtonClick = async (id) => {
    const field = id.slice(id.indexOf(".") + 1);
    if (field === "REGIONBTN") {
      const btnName = await MessageBox({
        message: t("addRegionMSG"),
        icon: "CONFIRM",
        messageTitle: t("Confirmation"),
        buttonNames: ["Yes", "No"],
      });
      if (btnName === "Yes") {
        updatePayslipState({ regionDialouge: true });

        trackDialogClass("masterDtl");
      }
    }
    if (field === "signature1" || field === "signature2") {
      updatePayslipState({ OpenSignature: true });
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* Payslip Details */}
      <FormWrapper
        ref={myChequeFormRef}
        key={`basicinfoform${payslipState?.formMode}`}
        hideHeader
        metaData={extractMetaData(
          PayslipdetailsFormMetaData,
          payslipState?.formMode
        )}
        displayMode={payslipState?.formMode}
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          TRAN_DT:
            payslipState?.formMode === "new"
              ? authState.workingDate
              : rows?.[0]?.data.TRAN_DT,
          SLIP_CD:
            payslipState?.formMode === "new"
              ? slipnoData?.[0]?.MAX_SLIP_CD
              : rows?.[0]?.data?.SLIP_CD,
          PENDING_FLAG:
            payslipState?.formMode === "new"
              ? "Pending"
              : rows?.[0]?.data.PENDING_FLAG,
        }}
        formStyle={{ background: "white", padding: "0px" }}
        containerstyle={{ padding: "0px 10px" }}
      />

      {/* Account Details */}
      <FormWrapper
        key={`accdetailsformst${payslipState?.formMode}`}
        metaData={extractMetaData(
          AccdetailsFormMetaData,
          payslipState?.formMode
        )}
        displayMode={payslipState?.formMode}
        onSubmitHandler={() => {}}
        onFormButtonClickHandel={handleAcctDtlFormButtonClick}
        initialValues={{
          PAYSLIP_MST_DTL:
            payslipState?.formMode === "new"
              ? payslipState?.mstState?.PAYSLIP_MST_DTL ?? []
              : acctDtlData ?? [],
        }}
        hideHeader
        formState={{
          MessageBox,
          Mode: payslipState?.formMode,
          docCD,
          openJointDetailfn: () => {},
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "PAYSLIP_MST_DTL.ACCT_TYPE",
              BRANCH_CD: "PAYSLIP_MST_DTL.BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        formStyle={{
          background: "white",
          height: "29vh",
          overflow: "scroll",
          padding: "0px",
        }}
        containerstyle={{
          padding: "0px",
        }}
      />

      {/* Draft Details */}
      <FormWrapper
        key={`draftmstdetails${payslipState?.formMode}`}
        metaData={extractMetaData(
          DraftdetailsFormMetaData,
          payslipState?.formMode
        )}
        displayMode={payslipState?.formMode}
        onSubmitHandler={() => {}}
        onFormButtonClickHandel={handleDraftDtlFormButtonClick}
        initialValues={{
          PAYSLIP_DRAFT_DTL:
            payslipState?.formMode === "new"
              ? payslipState?.draftState?.PAYSLIP_DRAFT_DTL ?? []
              : updatedDraftDtlData ?? [],
          FORM_MODE: payslipState?.formMode,
        }}
        hideHeader
        formStyle={{
          background: "white",
          height: "40vh",
          overflow: "scroll",
          padding: "0px",
        }}
        containerstyle={{
          padding: "0px",
        }}
        setDataOnFieldChange={async (action, paylod) => {
          if (action === "DEF_TRAN_CD") {
            billType.current = { paylod };
          }
        }}
        formState={{
          MessageBox,
          refID: billType,
        }}
      />

      {/* Total Details */}
      <FormWrapper
        key={`totaldetaisformst${payslipState?.formMode}`}
        metaData={extractMetaData(
          TotaldetailsFormMetaData,
          payslipState?.formMode
        )}
        displayMode={payslipState?.formMode}
        onSubmitHandler={() => {}}
        initialValues={{}}
        hideHeader
        formStyle={{
          background: "white",
          height: "auto",
          padding: "0px",
        }}
        containerstyle={{
          padding: "10px 10px 0px 10px",
        }}
        formState={{
          MessageBox,
          FLAG: rows?.[0]?.data.PENDING_FLAG === "Confirmed" ? "Y" : "N",
        }}
      />
    </div>
  );
};

export default PayslipFormsSection;
