import { AppBar, Dialog } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { stockconfirmFormMetaData } from "./confirmFormMetadata";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { crudStockData, stockConfirm } from "../api";
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

export const StockConfirmationForm = ({ closeDialog, result }) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const stockCfm: any = useMutation("stockConfirm", stockConfirm, {
    onError: () => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      if (data?.[0]?.STATUS === "9") {
        MessageBox({
          messageTitle: "Alert",
          message: data?.[0]?.MESSAGE,
          icon: "WARNING",
          defFocusBtnName: "Ok",
        });
      }
      CloseMessageBox();
      closeDialog();
      result.mutate({
        screenFlag: "stockCFM",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
      enqueueSnackbar(t("DataConfirmMessage"), {
        variant: "success",
      });
    },
  });

  const stockDataCRUD: any = useMutation("crudStockData", crudStockData, {
    onSuccess: (data) => {
      closeDialog();
      setDeletePopup(false);
      result.mutate({
        screenFlag: "stockCFM",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
      if (data?.[0]?.STATUS === "999") {
        MessageBox({
          messageTitle: "Alert",
          message: data?.[0]?.MESSAGE,
          icon: "WARNING",
          defFocusBtnName: "Ok",
        });
      } else {
        enqueueSnackbar(t("DataRejectMessage"), {
          variant: "success",
        });
      }
    },
    onError: () => {
      setDeletePopup(false);
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["stockConfirm"]);
      queryClient.removeQueries(["crudStockData"]);
    };
  }, []);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1100px",
        },
      }}
    >
      <>
        {stockCfm.isError ||
          (stockDataCRUD?.isError && (
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={
                  stockCfm?.error?.error_msg ??
                  stockDataCRUD?.error?.error_msg ??
                  "Unknow Error"
                }
                errorDetail={
                  stockCfm?.error?.error_detail ??
                  stockDataCRUD?.error?.error_detail ??
                  ""
                }
                color="error"
              />
            </AppBar>
          ))}
        <FormWrapper
          key={"stock-confirmation-Form"}
          metaData={stockconfirmFormMetaData as MetaDataType}
          initialValues={rows?.[0]?.data ?? []}
          displayMode="view"
          hideDisplayModeInTitle={true}
          onSubmitHandler={() => {}}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                {rows?.[0]?.data?.CONFIRMED !== "N" && (
                  <>
                    <GradientButton
                      color="primary"
                      onClick={async () => {
                        let buttonName = await MessageBox({
                          messageTitle: "confirmation",
                          message: "AreYouSureToConfirm",
                          buttonNames: ["Yes", "No"],
                          defFocusBtnName: "Yes",
                          loadingBtnName: ["Yes"],
                        });
                        if (buttonName === "Yes") {
                          stockCfm.mutate({
                            IS_CONFIMED: true,
                            COMP_CD: authState?.companyID,
                            BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
                            ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
                            ACCT_CD: rows?.[0]?.data?.ACCT_CD,
                            TRAN_CD: rows?.[0]?.data?.TRAN_CD,
                            LAST_ENTERED_BY: rows?.[0]?.data?.LAST_ENTERED_BY,
                            ASON_DT: rows?.[0]?.data?.ASON_DT,
                          });
                        }
                      }}
                    >
                      {t("Confirm")}
                    </GradientButton>
                    <GradientButton
                      color="primary"
                      onClick={() => setDeletePopup(true)}
                    >
                      {t("Reject")}
                    </GradientButton>
                  </>
                )}

                <GradientButton color="primary" onClick={() => closeDialog()}>
                  {t("Close")}
                </GradientButton>
              </>
            );
          }}
        </FormWrapper>

        {deletePopup && (
          <RemarksAPIWrapper
            TitleText={t("StockConfirmDeleteTitle", {
              docCD: docCD,
              interpolation: { escapeValue: false },
            })}
            onActionNo={() => setDeletePopup(false)}
            onActionYes={(val, rows) => {
              let deleteReqPara = {
                _isNewRow: false,
                _isDeleteRow: true,
                BRANCH_CD: rows.BRANCH_CD,
                TRAN_CD: rows.TRAN_CD,
                ACCT_TYPE: rows.ACCT_TYPE,
                ACCT_CD: rows.ACCT_CD,
                TRAN_DT: rows.TRAN_DT,
                ENTERED_DATE: rows.ENTERED_DATE,
                CONFIRMED: rows.CONFIRMED,
                USER_DEF_REMARKS: val
                  ? val
                  : t("WrongStockCnf", {
                      docCD: docCD,
                      interpolation: { escapeValue: false },
                    }),
                ACTIVITY_TYPE: "STOCK CONFIRMATION SCREEN",
                ENTERED_BY: rows.ENTERED_BY,
                STOCK_VALUE: rows?.STOCK_VALUE,
                ASON_DT: rows.ASON_DT,
              };
              stockDataCRUD.mutate(deleteReqPara);
            }}
            isLoading={stockDataCRUD?.isLoading}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={deletePopup}
            rows={rows?.[0]?.data}
            defaultValue={t("WrongStockCnf", {
              docCD: docCD,
              interpolation: { escapeValue: false },
            })}
          />
        )}
      </>
    </Dialog>
  );
};
