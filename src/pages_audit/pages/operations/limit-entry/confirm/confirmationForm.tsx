import { AppBar, Dialog } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { limitconfirmFormMetaData } from "./confirmFormMetadata";
import { useMutation } from "react-query";
import { crudLimitEntryData, limitConfirm } from "../api";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  RemarksAPIWrapper,
  MetaDataType,
  FormWrapper,
  queryClient,
  GradientButton,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

export const LimitConfirmationForm = ({ closeDialog, result }) => {
  const { state: rows }: any = useLocation();
  const [deletePopup, setDeletePopup] = useState<any>(false);
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  const limitCfm: any = useMutation("limitConfirm", limitConfirm, {
    onError: () => {
      CloseMessageBox();
      setDeletePopup(false);
    },
    onSuccess: (data, variables) => {
      closeDialog();
      CloseMessageBox();
      setDeletePopup(false);
      result.mutate({
        screenFlag: "limitCFM",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
      if (Boolean(variables?.FLAG === "Y")) {
        enqueueSnackbar(t("DataConfirmMessage"), {
          variant: "success",
        });
      } else if (!Boolean(variables?.FLAG !== "Y")) {
        enqueueSnackbar(t("DataRejectMessage"), {
          variant: "success",
        });
      }
    },
  });
  // const crudLimitData: any = useMutation(
  //   "crudLimitEntryData",
  //   crudLimitEntryData,
  //   {
  //     onSuccess: () => {
  //       enqueueSnackbar(t("DataRejectMessage"), { variant: "success" });
  //       closeDialog();
  //       CloseMessageBox();
  //       setDeletePopup(false);
  //       result.mutate({
  //         screenFlag: "limitCFM",
  //         COMP_CD: authState.companyID,
  //         BRANCH_CD: authState?.user?.branchCode,
  //       });
  //     },
  //     onError: () => {
  //       CloseMessageBox();
  //       setDeletePopup(false);
  //     },
  //   }
  // );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["limitConfirm"]);
    };
  }, []);

  const onClickHandle = async ({ FLAG }) => {
    let buttonName = await MessageBox({
      messageTitle: "confirmation",
      message: `${t("Security")} : ${rows?.[0]?.data?.DESCRIPTION} \n${t(
        "DoYouWantAllowTheTransaction"
      )}`,
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      let apireq = {
        FLAG: FLAG, //for button YES ? Y : N
        COMP_CD: rows?.[0]?.data?.COMP_CD,
        BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
        TRAN_CD: rows?.[0]?.data?.TRAN_CD,
        STATUS_FLAG: rows?.[0]?.data?.STATUS_FLAG,
        ...(FLAG === "N"
          ? {
              FORCE_EXP_DT: rows?.[0]?.data?.FORCE_EXP_DT,
              ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
              ACCT_CD: rows?.[0]?.data?.ACCT_CD,
              LIMIT_AMOUNT: rows?.[0]?.data?.LIMIT_AMOUNT,
              ENT_COMP_CD: rows?.[0]?.data?.COMP_CD,
              ENT_BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
              REMARKS:
                "Reject Force Expire Entry From Limit Confirmation Screen", //static
              ACTIVITY_TYPE: "LIMIT CONFIRMATION", //screen name
              TRAN_DT: rows?.[0]?.data?.TRAN_DT,
              CONFIRM_FLAG: rows?.[0]?.data?.CONFIRMED,
              USER_DEF_REMARKS: t("WrongLimitConfiramtion", {
                docCD: docCD,
                interpolation: { escapeValue: false },
              }),
              ENTERED_BY: rows?.[0]?.data?.ENTERED_BY,
              TRAN_TYPE: "Force Expire",
            }
          : {}),
      };
      limitCfm.mutate(apireq);
    }
  };

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1335px",
        },
      }}
    >
      <>
        {limitCfm.isError ? (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={
                limitCfm?.error?.error_msg ??
                // crudLimitData?.error?.error_msg ??
                "Unknow Error"
              }
              errorDetail={
                limitCfm?.error?.error_detail ??
                // crudLimitData?.error?.error_detail ??
                ""
              }
              color="error"
            />
          </AppBar>
        ) : null}
        <FormWrapper
          key={"limit-confirmation-Form"}
          subHeaderLabel={`${(
            rows?.[0]?.data?.COMP_CD +
            "-" +
            rows?.[0]?.data?.BRANCH_CD +
            "-" +
            rows?.[0]?.data?.ACCT_TYPE +
            "-" +
            rows?.[0]?.data?.ACCT_CD
          ).replace(/\s/g, "")}   \u00A0\u00A0   ${
            rows?.[0]?.data?.ACCT_NM
          }   `}
          metaData={limitconfirmFormMetaData as MetaDataType}
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
                  onClick={() => onClickHandle({ FLAG: "Y" })}
                >
                  {t("Confirm")}
                </GradientButton>
                <GradientButton
                  color="primary"
                  onClick={() => {
                    if (rows?.[0]?.data?.STATUS_FLAG !== "E") {
                      setDeletePopup(true);
                    } else {
                      onClickHandle({ FLAG: "N" });
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
      </>

      {deletePopup && (
        <RemarksAPIWrapper
          TitleText={t("RemovalRemarksLimit", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          label={"RemovalRemarks"}
          onActionNo={() => setDeletePopup(false)}
          onActionYes={(val, rows) => {
            let ApiReq = {
              COMP_CD: rows.COMP_CD,
              BRANCH_CD: rows.BRANCH_CD,
              TRAN_CD: rows.TRAN_CD,
              FORCE_EXP_DT: rows?.FORCE_EXP_DT
                ? format(new Date(rows?.FORCE_EXP_DT), "dd-MMM-yyyy")
                : "",
              ACCT_TYPE: rows.ACCT_TYPE,
              ACCT_CD: rows.ACCT_CD,
              LIMIT_AMOUNT: rows.LIMIT_AMOUNT,
              ENT_COMP_CD: rows?.COMP_CD,
              ENT_BRANCH_CD: rows?.BRANCH_CD,
              REMARKS: rows?.REMARKS ?? "",
              ACTIVITY_TYPE: "LIMIT CONFIRMATION",
              TRAN_DT: rows?.TRAN_DT
                ? format(new Date(rows?.TRAN_DT), "dd-MMM-yyyy")
                : "",
              USER_DEF_REMARKS: val
                ? val
                : t("WrongLimitConfiramtion", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  }),
              CONFIRM_FLAG: rows.CONFIRMED,
              ENTERED_BY: rows.ENTERED_BY,
              STATUS_FLAG: rows?.STATUS_FLAG,
              TRAN_TYPE: "Delete",
              FLAG: "N",
            };
            limitCfm.mutate(ApiReq);
          }}
          isLoading={limitCfm?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={deletePopup}
          rows={rows?.[0]?.data}
          defaultValue={t("WrongLimitConfiramtion", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </Dialog>
  );
};
