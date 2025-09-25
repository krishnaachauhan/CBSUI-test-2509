import { AppBar, Button, Dialog } from "@mui/material";
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import * as API from "./api";
import { insuranceConfirmFormMetaData } from "./confirmMetadata";
import {
  RemarksAPIWrapper,
  ClearCacheProvider,
  Alert,
  usePopupContext,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
const InsuranceConfirmationForm = ({ closeDialog, result }) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const [isDeleteRemark, SetDeleteRemark] = useState(false);

  const insuranceEntryConfirmation: any = useMutation(
    "insuranceEntryConfirmation",
    API.insuranceEntryConfirmation,
    {
      onError: () => {
        CloseMessageBox();
      },
      onSuccess: (data, variables) => {
        CloseMessageBox();
        closeDialog();
        result.mutate({
          screenFlag: "insuranceCFM",
          ...result?.variables,
          ENT_COMP_CD: authState.companyID,
          ENT_BRANCH_CD: authState?.user?.branchCode,
          GD_DATE: result?.variables?.workingDate,
        });
        if (Boolean(variables?._isConfrimed)) {
          enqueueSnackbar(t("DataConfirmMessage"), {
            variant: "success",
          });
        } else if (!Boolean(variables?._isConfrimed)) {
          enqueueSnackbar(t("DataRejectMessage"), {
            variant: "success",
          });
        }
      },
    }
  );

  const deleteInsuranceMutation: any = useMutation(API.doInsuranceDml, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },

    onSuccess: (data) => {
      enqueueSnackbar(t("DataUpdatedSuccessfully"), {
        variant: "success",
      });
      CloseMessageBox();
      closeDialog();
      CloseMessageBox();
    },
  });

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      maxWidth="sm"
    >
      <>
        {insuranceEntryConfirmation.isError ||
        deleteInsuranceMutation?.isError ? (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={
                insuranceEntryConfirmation?.error?.error_msg ??
                deleteInsuranceMutation?.error?.error_msg ??
                "Unknow Error"
              }
              errorDetail={
                insuranceEntryConfirmation?.error?.error_detail ??
                deleteInsuranceMutation?.error?.error_detail ??
                ""
              }
              color="error"
            />
          </AppBar>
        ) : null}
        <FormWrapper
          key={"insuranceConfirmForm"}
          metaData={insuranceConfirmFormMetaData as MetaDataType}
          initialValues={rows?.[0]?.data ?? {}}
          onSubmitHandler={() => {}}
          displayMode="view"
          hideDisplayModeInTitle={true}
          formStyle={{
            background: "white",
            height: "auto",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                <Button
                  color="primary"
                  onClick={async () => {
                    let buttonName = await MessageBox({
                      messageTitle: t("confirmation"),
                      message:
                        t("Security") +
                        "" +
                        ":" +
                        rows?.[0]?.data?.SEC +
                        " " +
                        "\n" +
                        t("DoYouWantAllowTheTransaction"),
                      buttonNames: ["Yes", "No"],
                      defFocusBtnName: "Yes",
                      loadingBtnName: ["Yes"],
                      icon: "CONFIRM",
                    });
                    if (buttonName === "Yes") {
                      insuranceEntryConfirmation.mutate({
                        _isConfrimed: true,
                        ...rows?.[0]?.data,
                      });
                    }
                  }}
                >
                  {t("Confirm")}
                </Button>
                <Button
                  color="primary"
                  onClick={async () => {
                    if (rows?.[0]?.data?.RENEWED_FLAG === "0") {
                      SetDeleteRemark(true);
                    } else {
                      let buttonName = await MessageBox({
                        messageTitle: t("confirmation"),
                        message: t("AreYouSureToConfirm"),
                        buttonNames: ["Yes", "No"],
                        defFocusBtnName: "Yes",
                        loadingBtnName: ["Yes"],
                        icon: "CONFIRM",
                      });
                      if (buttonName === "Yes") {
                        insuranceEntryConfirmation.mutate({
                          _isConfrimed: false,
                          ...rows?.[0]?.data,
                        });
                      }
                    }
                  }}
                >
                  {t("Reject")}
                </Button>
                <Button color="primary" onClick={() => closeDialog()}>
                  {t("Close")}
                </Button>
              </>
            );
          }}
        </FormWrapper>
      </>
      {isDeleteRemark && (
        <RemarksAPIWrapper
          TitleText={t("EnterRemovalRemarksForInsuranceConfirmation")}
          onActionNo={() => SetDeleteRemark(false)}
          onActionYes={async (val) => {
            const buttonName = await MessageBox({
              messageTitle: t("Confirmation"),
              message: t("DoYouWantDeleteRow"),
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });
            if (buttonName === "Yes") {
              deleteInsuranceMutation.mutate({
                _isNewRow: false,
                _isDeleteRow: true,
                _isAllowRenewRow: false,
                _isConfrimed: true,
                ...rows?.[0]?.data,
                USER_DEF_REMARKS: val
                  ? val
                  : "WRONG ENTRY FROM INSURANCE CONFIRMATION (TRN/383)",

                ACTIVITY_TYPE: "INSURANCE CONFIRMATION SCREEN",
              });
            }
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isDeleteRemark}
          defaultValue={"WRONG ENTRY FROM INSURANCE CONFIRMATION"}
          rows={undefined}
        />
      )}
    </Dialog>
  );
};
export const InsuranceConfirmationFormWrapper = ({ closeDialog, result }) => {
  return (
    <ClearCacheProvider>
      <InsuranceConfirmationForm closeDialog={closeDialog} result={result} />
    </ClearCacheProvider>
  );
};
