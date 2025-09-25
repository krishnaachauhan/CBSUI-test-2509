import { AppBar, Dialog } from "@mui/material";
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { lienconfirmFormMetaData } from "./confirmFormMetadata";
import { lienConfirmation } from "../api";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import {
  usePopupContext,
  Alert,
  RemarksAPIWrapper,
  FormWrapper,
  MetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

export const LienConfirmationForm = ({ closeDialog, result }) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const lienConfirm: any = useMutation("lienConfirmation", lienConfirmation, {
    onError: () => {
      CloseMessageBox();
      setIsDelete(false);
    },
    onSuccess: (data, variables) => {
      CloseMessageBox();
      closeDialog();
      setIsDelete(false);
      result.mutate({
        screenFlag: "lienCFM",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
      if (variables?.IS_CONFIMED) {
        enqueueSnackbar(t("DataConfirmMessage"), {
          variant: "success",
        });
      } else if (!variables?.IS_CONFIMED) {
        enqueueSnackbar(t("RecordRemovedMsg"), {
          variant: "success",
        });
      }
    },
  });

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1035px",
        },
      }}
    >
      <>
        {lienConfirm.isError && (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={lienConfirm?.error?.error_msg ?? "Unknow Error"}
              errorDetail={lienConfirm?.error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        )}
        <FormWrapper
          key={"lien-confirmation-Form"}
          metaData={lienconfirmFormMetaData as MetaDataType}
          initialValues={rows?.[0]?.data ?? []}
          onSubmitHandler={() => {}}
          displayMode="view"
          hideDisplayModeInTitle={true}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                <GradientButton
                  color="primary"
                  onClick={async () => {
                    let buttonName = await MessageBox({
                      messageTitle: t("confirmation"),
                      message: t("DoYouWantAllowTransaction"),
                      buttonNames: ["Yes", "No"],
                      defFocusBtnName: "Yes",
                      loadingBtnName: ["Yes"],
                      icon: "CONFIRM",
                    });
                    if (buttonName === "Yes") {
                      lienConfirm.mutate({
                        IS_CONFIMED: true,
                        COMP_CD: authState?.companyID,
                        BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
                        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
                        ACCT_CD: rows?.[0]?.data?.ACCT_CD,
                        LIEN_STATUS: rows?.[0]?.data?.LIEN_STATUS,
                        ENTERED_BY: rows?.[0]?.data?.ENTERED_BY,
                        SR_CD: rows?.[0]?.data?.SR_CD,
                        REMOVAL_DT: rows?.[0]?.data?.REMOVAL_DT,
                        CONFIRMED: rows?.[0]?.data?.CONFIRMED,
                        USER_DEF_REMARKS:
                          "WRONG ENTRY FROM LIEN CONFIRMATION  (TRN/665)",
                        ACTIVITY_TYPE: "LIEN CONFIRMATION SCREEN",
                        LIEN_AMOUNT: rows?.[0]?.data?.LIEN_AMOUNT,
                        EFECTIVE_DT: rows?.[0]?.data?.EFECTIVE_DT,
                        LAST_ENTERED_BY: rows?.[0]?.data?.LAST_ENTERED_BY,
                      });
                    }
                  }}
                >
                  {t("Confirm")}
                </GradientButton>
                <GradientButton
                  color="primary"
                  onClick={() => {
                    setIsDelete(true);
                  }}
                >
                  {t("Reject")}
                </GradientButton>
                <GradientButton color="primary" onClick={() => closeDialog()}>
                  {t("Close")}
                </GradientButton>
              </>
            );
          }}
        </FormWrapper>
      </>

      {isDelete && (
        <RemarksAPIWrapper
          TitleText={t("RemovalRemarksLien", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          label={"RemovalRemarks"}
          onActionNo={() => setIsDelete(false)}
          onActionYes={(val, rows) => {
            let deleteReqPara = {
              IS_CONFIMED: false,
              COMP_CD: authState?.companyID,
              BRANCH_CD: rows?.BRANCH_CD,
              ACCT_TYPE: rows?.ACCT_TYPE,
              ACCT_CD: rows?.ACCT_CD,
              LIEN_STATUS: rows?.LIEN_STATUS,
              ENTERED_BY: rows?.ENTERED_BY,
              SR_CD: rows?.SR_CD,
              USER_DEF_REMARKS: val
                ? val
                : t("WrongLienCnf", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  }),
              REMOVAL_DT: rows?.REMOVAL_DT,
              CONFIRMED: rows?.CONFIRMED,
              ACTIVITY_TYPE: "LIEN CONFIRMATION SCREEN",
              LIEN_AMOUNT: rows?.LIEN_AMOUNT,
              EFECTIVE_DT: rows?.EFECTIVE_DT,
              LAST_ENTERED_BY: rows?.LAST_ENTERED_BY,
            };

            lienConfirm.mutate(deleteReqPara);
          }}
          isLoading={lienConfirm?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isDelete}
          rows={rows?.[0]?.data}
          defaultValue={t("WrongLienCnf", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </Dialog>
  );
};
