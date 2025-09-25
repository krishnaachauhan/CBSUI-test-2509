import {
  AppBar,
  CircularProgress,
  Dialog,
  LinearProgress,
} from "@mui/material";
import React, { useContext, useEffect } from "react";
import { lienExpireMetadata } from "./expireLienMetadata";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import { crudLien } from "../api";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  Alert,
  utilFunction,
  FormWrapper,
  queryClient,
  MetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
export const ExpireLien = ({ navigate, getLienDetail }) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { t } = useTranslation();
  const { trackDialogClass } = useDialogContext();
  const expireLienData: any = useMutation("crudLien", crudLien, {
    onSuccess: (data) => {
      if (data?.[0]?.O_STATUS === "99" && data?.[0]?.O_MESSAGE) {
        MessageBox({
          messageTitle: "ValidationAlert",
          message: data?.[0]?.O_MESSAGE,
        });
      } else {
        enqueueSnackbar(t("LienExpiredSuccessfully"), {
          variant: "success",
        });

        getLienDetail.mutate({
          COMP_CD: authState?.companyID,
          ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
          ACCT_CD: rows?.[0]?.data?.ACCT_CD,
          BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
        });
      }
      navigate(".");
      trackDialogClass("main");
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["crudLien"]);
    };
  }, []);

  const onSubmitHandler = (
    data: Record<string, any>,
    displayData: unknown,
    endSubmit: (val: boolean) => void
  ) => {
    try {
      endSubmit(true);
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "")
      );
      let upd = utilFunction.transformDetailsData(
        filteredData,
        rows?.[0]?.data ?? {}
      );
      let apiReq = {
        _isNewRow: false,
        COMP_CD: authState?.companyID,
        BRANCH_CD: data?.BRANCH_CD,
        SR_CD: data?.SR_CD,
        ACCT_CD: data?.ACCT_CD,
        ACCT_TYPE: data?.ACCT_TYPE,
        LIEN_STATUS: data?.LIEN_STATUS,
        REMOVAL_DT: data?.REMOVAL_DT
          ? format(new Date(data?.REMOVAL_DT), "dd-MMM-yyyy")
          : "",
        REMARKS: data?.REMARKS,
        ...upd,
      };
      expireLienData.mutate(apiReq);
    } catch (error) {
      console.error("❌ Error in onSubmitHandler:", error);
    }
  };

  return (
    <Dialog
      open={true}
      className="lienExpire"
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1150px",
          padding: "5px",
        },
      }}
    >
      <>
        {expireLienData?.isError ? (
          <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={expireLienData?.error?.error_msg ?? "Unknow Error"}
                errorDetail={expireLienData?.error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          </div>
        ) : expireLienData.isLoading ? (
          <LinearProgress color="secondary" />
        ) : (
          <LinearProgressBarSpacer />
        )}
        <FormWrapper
          key={"Expire-Lien"}
          metaData={lienExpireMetadata as MetaDataType}
          initialValues={{
            ...rows?.[0]?.data,
            LIEN_STATUS: "E",
          }}
          onSubmitHandler={onSubmitHandler}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={expireLienData?.isLoading}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>

                <GradientButton
                  color="primary"
                  onClick={() => {
                    navigate(".");
                    trackDialogClass("main");
                  }}
                >
                  {t("Close")}
                </GradientButton>
              </>
            );
          }}
        </FormWrapper>
      </>
    </Dialog>
  );
};
