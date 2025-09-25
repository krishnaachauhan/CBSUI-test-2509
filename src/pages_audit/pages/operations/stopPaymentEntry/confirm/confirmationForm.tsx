import { AppBar, Dialog } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { stopPayconfirmFormMetaData } from "./confirmFormMetadata";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { crudStopPayment, stopPaymentConfirm } from "../api";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  RemarksAPIWrapper,
  FormWrapper,
  queryClient,
  MetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

export const StopPayConfirmationForm = ({ closeDialog, result }) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const [isDelete, setIsDelete] = useState(false);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const stopPaymentCfm: any = useMutation(
    "stopPaymentConfirm",
    stopPaymentConfirm,
    {
      onError: () => {
        CloseMessageBox();
      },
      onSuccess: (data, variables) => {
        CloseMessageBox();
        closeDialog();
        result.mutate({
          screenFlag: "stopPaymentCFM",
          COMP_CD: authState.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });

        if (Boolean(variables?.IS_CONFIMED)) {
          enqueueSnackbar(t("DataConfirmMessage"), {
            variant: "success",
          });
        } else if (!Boolean(variables?.IS_CONFIMED)) {
          enqueueSnackbar(t("DataRejectMessage"), {
            variant: "success",
          });
        }
      },
    }
  );
  const crudStopPay: any = useMutation("crudStopPayment", crudStopPayment, {
    onSuccess: (data) => {
      closeDialog();
      setIsDelete(false);
      result.mutate({
        screenFlag: "stopPaymentCFM",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
      enqueueSnackbar(data?.[0]?.MESSAGE ?? t("DataDeletedSuccessfully"), {
        variant: "success",
      });
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["stopPaymentConfirm"]);
    };
  }, []);

  const onClickHandle = async ({ FLAG, IS_CONFIMED }) => {
    let apiReq = {
      IS_CONFIMED: IS_CONFIMED,
      COMP_CD: authState?.companyID,
      FLAG: FLAG,
      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
      TRAN_CD: rows?.[0]?.data?.TRAN_CD,
      LAST_ENTERED_BY: rows?.[0]?.data?.LAST_ENTERED_BY,
    };

    let buttonName = await MessageBox({
      messageTitle: "confirmation",
      message: "AreYouSureToConfirm",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
    });
    if (buttonName === "Yes") {
      stopPaymentCfm.mutate(apiReq);
    }
  };

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
        {stopPaymentCfm.isError && (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={stopPaymentCfm?.error?.error_msg ?? "Unknow Error"}
              errorDetail={stopPaymentCfm?.error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        )}
        <FormWrapper
          key={"stopPay-confirmation-Form"}
          metaData={stopPayconfirmFormMetaData as MetaDataType}
          initialValues={rows?.[0]?.data ?? {}}
          displayMode="view"
          onSubmitHandler={() => {}}
          hideDisplayModeInTitle={true}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                <GradientButton
                  color="primary"
                  onClick={() =>
                    onClickHandle({
                      IS_CONFIMED: true,
                      FLAG: "Y",
                    })
                  }
                >
                  {t("Confirm")}
                </GradientButton>
                <GradientButton
                  color="primary"
                  onClick={() => {
                    if (rows?.[0]?.data?.RELEASE_DATE === "") {
                      setIsDelete(true);
                    } else {
                      onClickHandle({
                        IS_CONFIMED: false,
                        FLAG: "N",
                      });
                    }
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

        {isDelete && (
          <RemarksAPIWrapper
            TitleText={t("StopConfirmDeleteTitle", {
              docCD: docCD,
              interpolation: { escapeValue: false },
            })}
            onActionNo={() => setIsDelete(false)}
            onActionYes={(val, rows) => {
              let deleteReqPara = {
                _isNewRow: false,
                _isDeleteRow: true,
                BRANCH_CD: rows.BRANCH_CD,
                TRAN_CD: rows.TRAN_CD,
                ACCT_TYPE: rows.ACCT_TYPE,
                ACCT_CD: rows.ACCT_CD,
                TRAN_AMOUNT: rows.CHEQUE_AMOUNT,
                TRAN_DT: rows.TRAN_DT,
                CONFIRMED: rows.CONFIRMED,
                USER_DEF_REMARKS: val
                  ? val
                  : t("WrongChequeStop", {
                      docCD: docCD,
                      interpolation: { escapeValue: false },
                    }),

                ACTIVITY_TYPE: "STOP PAYMENT ENTRY SCREEN",
                ENTERED_BY: rows.ENTERED_BY,
              };
              crudStopPay.mutate(deleteReqPara);
            }}
            isLoading={crudStopPay?.isLoading}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={isDelete}
            rows={rows?.[0]?.data}
            defaultValue={t("WrongChequeStop", {
              docCD: docCD,
              interpolation: { escapeValue: false },
            })}
          />
        )}
      </>
    </Dialog>
  );
};
