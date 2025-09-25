import { useContext, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import * as API from "./api";
import { t } from "i18next";
import { RemarksAPIWrapper, usePopupContext } from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

export const DeleteDialog = ({
  open,
  onClose,
  rowData,
  siRefetch,
  mainRefetch,
}) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const deleteMutation: any = useMutation(API.addStandingInstructionTemplate, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
      onClose();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("deleteSuccessfully"), {
        variant: "success",
      });
      CloseMessageBox();
      onClose();
      siRefetch();
      mainRefetch();
      onClose();
    },
  });

  return (
    <>
      <RemarksAPIWrapper
        TitleText={t("EnterRemovalRemarksForSI")}
        onActionNo={onClose}
        customRequiredMessage="RemovalRemarkRequire"
        onActionYes={async (val, rows) => {
          const buttonName = await MessageBox({
            messageTitle: t("Confirmation"),
            message: t("DoYouWantDeleteRow"),
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            loadingBtnName: ["Yes"],
          });
          if (buttonName === "Yes") {
            deleteMutation.mutate({
              _isDeleteRow: true,
              COMP_CD: rows?.COMP_CD,
              BRANCH_CD: rows?.BRANCH_CD,
              ENT_COMP_CD: rows?.ENT_COMP_CD,
              ENT_BRANCH_CD: rows?.ENT_BRANCH_CD,
              TRAN_CD: rows?.TRAN_CD,
              SR_CD: rows?.SR_CD,
              LINE_ID: rows?.LINE_ID,
              ACCT_TYPE: rows?.DR_ACCT_TYPE,
              ACCT_CD: rows?.DR_ACCT_CD,
              AMOUNT: rows?.SI_AMOUNT,
              CONFIRMED: rows?.CONFIRMED,
              CR_ACCT_TYPE: rows?.CR_ACCT_TYPE,
              CR_ACCT_CD: rows?.CR_ACCT_CD,
              TRAN_DT: authState.workingDate,
              ENTERED_BY: rows?.ENTERED_BY,
              USER_DEF_REMARKS: val,
              ACTIVITY_TYPE: "SI_ENTRY",
            });
          }
        }}
        isEntertoSubmit={true}
        AcceptbuttonLabelText="Ok"
        CanceltbuttonLabelText="Cancel"
        open={open}
        defaultValue={t("WRONGENTRYFROMSTANDING", {
          docCD: docCD,
          interpolation: { escapeValue: false },
        })}
        rows={rowData}
      />
    </>
  );
};
