import React, { useMemo } from "react";
import { CircularProgress, Paper } from "@mui/material";
import {
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  RemarksAPIWrapper,
} from "@acuteinfo/common-base";
import { ddTransactionFormMetaData } from "./metaData";
import { EntryFormState } from "./entryForm";
import { t } from "i18next";
import { cloneDeep } from "lodash";

interface DDTransactionFormProps {
  entryFormState: EntryFormState;
  updateEntryFormState: (updates: Partial<EntryFormState>) => void;
  isLoading: boolean;
  onSubmitHandler: any;
  MessageBox: any;
  screenFlag: string;
  apiReqFlag: string;
  trans_type: string;
  draftDtlData: any[];
  acctDtlData: any[];
  cancelChargeData: any[];
  rowsData: any;
  stopPaymentHistory: any[];
  reasonData: any[];
  authState: any;
  formRef: any;
  handlePrev: () => void;
  handleNext: () => void;
  totalData: number;
  currentIndex: number;
  mutation: any;
  confirmMutation: any;
  onClose: () => void;
  rejectMutaion: any;
  headerLabel: string;
}

const DDTransactionForm: React.FC<DDTransactionFormProps> = (props) => {
  const {
    entryFormState,
    updateEntryFormState,
    isLoading,
    onSubmitHandler,
    MessageBox,
    screenFlag,
    apiReqFlag,
    trans_type,
    draftDtlData,
    acctDtlData,
    cancelChargeData,
    rowsData,
    stopPaymentHistory,
    reasonData,
    authState,
    formRef,
    handlePrev,
    handleNext,
    totalData,
    currentIndex,
    mutation,
    confirmMutation,
    onClose,
    rejectMutaion,
    headerLabel,
  } = props;

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(ddTransactionFormMetaData);
    if (metadata?.form) {
      metadata.form.label = headerLabel;
    }
    return metadata;
  }, [headerLabel]);

  if (isLoading) {
    return (
      <Paper sx={{ display: "flex", p: 2, justifyContent: "center" }}>
        <LoaderPaperComponent />
      </Paper>
    );
  }

  return (
    <>
      <FormWrapper
        key={"ddtransactionentrygrid" + entryFormState?.formMode}
        metaData={memoizedMetadata as MetaDataType}
        displayMode={entryFormState?.formMode}
        onSubmitHandler={onSubmitHandler}
        formState={{
          MessageBox,
          Mode: entryFormState?.formMode,
          docCd: "RPT/014",
          refID: formRef,
        }}
        initialValues={{
          SCREENFLAG: screenFlag,
          SCREEN_CODE: apiReqFlag,
          TRAN_TYPE: trans_type,
          CCTFLAG: draftDtlData?.length > 0 ? draftDtlData[0]?.C_C_T : "",
          REALIZE_AMT: draftDtlData?.length > 0 ? draftDtlData[0]?.AMOUNT : "",
          REALIZE_DATE_DISP: authState?.workingDate,
          TOKEN_NO: draftDtlData?.length > 0 ? draftDtlData[0]?.CHEQUE_NO : "",
          TRF_COMP_CD_DISP: authState?.companyID,
          CHEQUE_NO_DISP:
            acctDtlData?.length > 0 ? acctDtlData[0]?.CHEQUE_NO : "",
          ...((acctDtlData?.length > 0 ? acctDtlData[0] : {}) || {}),
          ...((draftDtlData?.length > 0 ? draftDtlData[0] : {}) || {}),
          COLLECT_COMISSION_CHARGE: cancelChargeData[0]?.COLLECT_COMISSION,
          COLLECT_COMISSION:
            entryFormState?.formMode === "new"
              ? cancelChargeData?.[0]?.COLLECT_COMISSION ?? ""
              : rowsData?.COLLECT_COMISSION ?? "",
          COL_SER_CHARGE:
            entryFormState?.formMode === "new"
              ? cancelChargeData?.[0]?.COL_SER_CHARGE ?? ""
              : rowsData?.COL_SER_CHARGE ?? "",
          COLLECT_COMISSION_FLAGE: cancelChargeData[0]?.FLAG_DISABLE ?? "",
          COL_SER_CANCEL_CHARGE: cancelChargeData[0]?.COL_SER_CHARGE ?? "",
          CANCEL_REASON:
            rowsData?.RETRIVE_ENTRY_MODE === "R"
              ? [...stopPaymentHistory]
              : [...reasonData],
          PAYSLIP_MST_DTL: acctDtlData,
          STOP_PAY_DATE: authState?.workingDate,
        }}
        formStyle={{ background: "white" }}
        ref={formRef}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {/* Navigation */}
            <GradientButton
              onClick={() => currentIndex > 0 && handlePrev()}
              disabled={isLoading}
            >
              {t("Previous")}
            </GradientButton>
            <GradientButton
              onClick={() => currentIndex !== totalData && handleNext()}
              disabled={isLoading}
            >
              {t("MoveForward")}
            </GradientButton>

            {/* Save */}
            {["E", "D", "S"].includes(rowsData?.RETRIVE_ENTRY_MODE) && (
              <GradientButton
                disabled={isSubmitting}
                endIcon={
                  mutation?.isLoading ? <CircularProgress size={20} /> : null
                }
                onClick={() =>
                  handleSubmit({ preventDefault: () => {} }, "SAVE")
                }
              >
                {t("save")}
              </GradientButton>
            )}

            {/* Confirm / Reject */}
            {(screenFlag === "CANCELCONFIRM" ||
              screenFlag === "REALIZECONFIRM") && (
              <>
                <GradientButton
                  onClick={async () => {
                    if (
                      trans_type === "TC" &&
                      rowsData?.PARA_812 === "N" &&
                      rowsData?.RETRIVE_ENTRY_MODE === "D"
                    ) {
                      if (
                        draftDtlData[0]?.ENTERED_BY ===
                        draftDtlData[0]?.REVALID_BY
                      ) {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("ConfirmRestrictMsg"),
                          icon: "CONFIRM",
                          buttonNames: ["Ok"],
                        });
                        return;
                      }
                      if (
                        draftDtlData[0]?.ENTERED_BY ===
                        draftDtlData[0]?.REALIZE_BY
                      ) {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("ConfirmRestrictMsg"),
                          buttonNames: ["Ok"],
                        });
                        return;
                      }
                    } else if (authState?.role === "1") {
                      await MessageBox({
                        messageTitle: t("ValidationFailed"),
                        message: t("authoeizationFailed"),
                        buttonNames: ["Yes", "No"],
                        loadingBtnName: ["Yes"],
                      });
                      return;
                    } else if (rowsData?.REALIZE_FLAG === "Y") {
                      await MessageBox({
                        messageTitle: t("ValidationFailed"),
                        message: t("payslipAlreadyConfirmed"),
                        buttonNames: ["Ok"],
                      });
                      return;
                    }

                    const buttonName = await MessageBox({
                      messageTitle: t("Confirmation"),
                      message: `${t(
                        "payslipRealizeconfirmRestrictNSG"
                      )} PAYSLIP No. ${rowsData?.PAYSLIP_NO}`,
                      buttonNames: ["Yes", "No"],
                      icon: "CONFIRM",
                      loadingBtnName: ["Yes"],
                    });
                    if (buttonName === "Yes") {
                      confirmMutation.mutate({
                        _isConfirmed: true,
                        TRAN_TYPE: trans_type,
                        ENTERED_COMP_CD: rowsData?.ENTERED_COMP_CD,
                        PARA_243: rowsData?.PARA_243,
                        ENETERED_COMP_CD: rowsData?.ENETERED_COMP_CD,
                        ENTERED_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD,
                        TRAN_CD: rowsData?.TRAN_CD,
                        SR_CD: rowsData?.SR_CD,
                        PARA_812: rowsData?.PARA_812,
                        A_ENTRY_MODE: rowsData?.RETRIVE_ENTRY_MODE,
                      });
                    }
                  }}
                >
                  {t("Confirm")}
                </GradientButton>
                <GradientButton
                  onClick={() => updateEntryFormState({ isDeleteRemark: true })}
                >
                  {t("Reject")}
                </GradientButton>
              </>
            )}

            {/* Release */}
            {rowsData?.RETRIVE_ENTRY_MODE === "R" && (
              <GradientButton
                onClick={() => updateEntryFormState({ isDeleteRemark: true })}
              >
                {t("Realease")}
              </GradientButton>
            )}

            <GradientButton onClick={onClose} color="primary">
              {t("close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
      {entryFormState?.isDeleteRemark ? (
        <RemarksAPIWrapper
          TitleText={
            "Enter Removal Remarks For PAYSLP REALIZE CONFIRMATION RPT/18"
          }
          onActionNo={() => {
            updateEntryFormState({ isDeleteRemark: false });
          }}
          onActionYes={async (val, rows) => {
            const buttonName = await MessageBox({
              messageTitle: t("Confirmation"),
              message: t("DoYouWantDeleteRow"),
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
            });
            if (buttonName === "Yes") {
              rejectMutaion.mutate({
                _isConfirmed: false,
                COMP_CD: authState?.companyID,
                ENTERED_BRANCH_CD: authState?.user?.branchCode,
                ENTERED_COMP_CD: authState?.companyID,
                TRAN_CD: rowsData?.TRAN_CD,
                SR_CD: rowsData?.SR_CD,
                PAYSLIP_NO: rowsData?.PAYSLIP_NO,
                TRAN_TYPE: trans_type,
                A_ENTRY_MODE: rowsData?.RETRIVE_ENTRY_MODE,
                REALIZE_DATE: draftDtlData[0]?.REALIZE_DATE,
                REVALID_DT: rowsData?.REVALID_DT,
                TRAN_DT: authState?.workingDate,
                REALIZE_FLAG: rowsData?.REALIZE_FLAG,
                PENDING_FLAG: rowsData?.PENDING_FLAG,
                STOP_REMARKS: "",
                PARA_243: rowsData?.PARA_243,
                PARA_812: rowsData?.PARA_812,
                A_REJECT_FLAG: "Y",
                BRANCH_CD: acctDtlData[0]?.BRANCH_CD,
                ACCT_TYPE: acctDtlData[0]?.ACCT_TYPE,
                ACCT_CD: acctDtlData[0]?.ACCT_CD,
                AMOUNT: rowsData?.TOTAL_AMT,
                USER_DEF_REMARKS: val,
                SCREEN_REF: apiReqFlag,
              });
            }
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={entryFormState?.isDeleteRemark}
          defaultValue={
            "WRONG ENTRY FROM PAYSLIP REALIZE CONFIRMATION (RPT/18)"
          }
          rows={rowsData}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default DDTransactionForm;
