import { useCallback, useContext, useState } from "react";
import { useTypeStyles } from "../LockerOperationTrns/lockerOperationTrns";
import { AppBar, Chip, Toolbar, Typography } from "@mui/material";
import {
  Alert,
  GradientButton,
  RemarksAPIWrapper,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { format } from "date-fns";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { ConFirmedHistory } from "./conFirmedHistory";

export const HeaderBar = ({
  rows,
  acctDtlData,
  draftDtlData,
  currentPath,
  closeDialog,
  confirmMutation,
  errorDataa,
  rejectMutaion,
  payslipUiState,
  updatePayslipUiState,
}) => {
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();

  const handleConfirm = useCallback(async () => {
    if (rows?.[0]?.data?.RESTRICT_CNFIRM_MSG) {
      await MessageBox({
        messageTitle: t("ValidationFailed"),
        message: rows[0]?.data?.RESTRICT_CNFIRM_MSG,
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      return;
    }
    if (authState?.user?.id === rows[0]?.data?.ENTERED_BY) {
      await MessageBox({
        messageTitle: t("ValidationFailed"),
        message: t("ConfirmRestrictMsg"),
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      return;
    }
    const buttonName = await MessageBox({
      messageTitle: t("Confirmation"),
      message: `${t("DoYouWantToAllowPayslipDD")}Slip No. ${
        rows?.[0]?.data?.SLIP_CD
      }`,
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });
    if (buttonName === "Yes") {
      confirmMutation.mutate({
        DETAILS_DATA: {
          isNewRow: [
            {
              ...rows[0].data,
              ENTERED_COMP_CD: draftDtlData?.[0]?.ENTERED_COMP_CD ?? "",
              ENTERED_BRANCH_CD: draftDtlData?.[0]?.ENTERED_BRANCH_CD ?? "",
              TRAN_CD: rows[0].data?.TRAN_CD,
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              ACCT_TYPE: rows[0].data?.ACCT_TYPE,
              ACCT_CD: rows[0].data?.ACCT_CD,
              TRN_DT: format(new Date(rows[0].data?.TRAN_DT), "dd/MMM/yyyy"),
              TYPE_CD: "",
              TRN_FLAG: "",
              AMOUNT: `${rows[0].data?.TOTAL_AMT}`,
              SCREEN_REF: "RPT/15",
              TRAN_BAL: acctDtlData?.[0]?.TRAN_BAL ?? "",
            },
          ],
        },
      });
    }
  }, [rows, acctDtlData, draftDtlData]);

  return (
    <>
      <AppBar position="sticky" sx={{ top: 0 }} color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography className={headerClasses.title} variant="h6">
            {utilFunction.getDynamicLabel(
              currentPath,
              authState?.menulistdata,
              true
            )}
            <Chip
              style={{ color: "white", marginLeft: 8 }}
              variant="outlined"
              size="small"
              label="view mode"
            />
          </Typography>

          {rows[0]?.data?.ALLOW_CONFIRM === "Y" &&
            draftDtlData &&
            acctDtlData && (
              <GradientButton color="primary" onClick={handleConfirm}>
                {t("Confirm")}
              </GradientButton>
            )}

          {draftDtlData && acctDtlData && (
            <>
              {rows?.[0]?.data?.ALLOW_DEL === "Y" && (
                <GradientButton
                  color="primary"
                  onClick={() =>
                    updatePayslipUiState({ isDeleteDialogOpen: true })
                  }
                >
                  {t("Reject")}
                </GradientButton>
              )}
              <GradientButton
                color="primary"
                onClick={() =>
                  updatePayslipUiState({ isConfirmHistoryOpen: true })
                }
              >
                {t("ConfHistory")}
              </GradientButton>
            </>
          )}
          <GradientButton onClick={closeDialog} color="primary">
            {t("Close")}
          </GradientButton>
        </Toolbar>
      </AppBar>
      {errorDataa.map(
        ({ error, isError }, index) =>
          isError && (
            <Alert
              key={error}
              severity="error"
              errorMsg={error?.error_msg || t("Somethingwenttowrong")}
              errorDetail={error?.error_detail ?? ""}
              color="error"
            />
          )
      )}
      {payslipUiState.isDeleteDialogOpen && (
        <RemarksAPIWrapper
          TitleText="Enter Removal Remarks For PAYSLP ISSUE CONFIRMATION (RPT/15) Confirmation"
          onActionNo={() => {
            updatePayslipUiState({ isDeleteDialogOpen: false });
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
              const deleteReqPara = {
                REQ_FLAG: "A",
                TRAN_TYPE: "Delete",
                COMP_CD: acctDtlData[0].ENTERED_COMP_CD,
                BRANCH_CD: acctDtlData[0].ENTERED_BRANCH_CD,
                ACCT_CD: rows[0]?.data?.ACCT_CD,
                ACCT_TYPE: rows[0]?.data?.ACCT_TYPE,
                AMOUNT: `${rows[0].data?.TOTAL_AMT}`,
                REMARKS: acctDtlData[0].REMARKS,
                SCREEN_REF: "RPT/15",
                CONFIRMED: rows[0]?.data?.CONFIRMED,
                USER_DEF_REMARKS: val,
                TRAN_CD: rows[0]?.data?.TRAN_CD,
                ENTERED_BY: draftDtlData[0].ENTERED_BY,
                PAYSLIP_NO: rows[0]?.data?.PAYSLIP_NO,
                DRAFT_MST_DATA: [
                  {
                    COMP_CD: "",
                    BRANCH_CD: "",
                    ACCT_CD: "",
                    ACCT_TYPE: "",
                  },
                ],
                ADD_DRAFT_DATA: "N",
                _isNewRow: false,
              };

              rejectMutaion.mutate(deleteReqPara);
            }
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={payslipUiState.isDeleteDialogOpen}
          defaultValue="WRONG ENTRY FROM PAYSLIP ISSUE CONFIRMATION (RPT/15) CONFIRMATION"
          rows={rows}
        />
      )}
      {payslipUiState.isPhotoSignOpen && (
        <div style={{ paddingTop: 10 }}>
          <PhotoSignWithHistory
            data={payslipUiState?.photoSignReqPara ?? {}}
            onClose={() => {
              updatePayslipUiState({ isPhotoSignOpen: false });
            }}
            screenRef="RPT/015"
          />
        </div>
      )}
      {payslipUiState.isConfirmHistoryOpen && (
        <ConFirmedHistory
          open={payslipUiState.isConfirmHistoryOpen}
          close={() => updatePayslipUiState({ isConfirmHistoryOpen: false })}
        />
      )}
    </>
  );
};
