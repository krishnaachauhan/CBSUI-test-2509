import {
  AppBar,
  CircularProgress,
  Dialog,
  LinearProgress,
} from "@mui/material";
import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { forceExpireMetaData } from "./forceExpireFormMetadata";
import { AuthContext } from "pages_audit/auth";
import { crudLimitEntryData } from "../api";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  utilFunction,
  Alert,
  FormWrapper,
  MetaDataType,
  GradientButton,
  usePopupContext,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { format, parse, subDays } from "date-fns";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

type LimitDtlCustomProps = {
  navigate?: any;
  getLimitDetail?: any;
};
export const ForceExpire: React.FC<LimitDtlCustomProps> = ({
  navigate,
  getLimitDetail,
}) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { trackDialogClass } = useDialogContext();
  const handleCloseDialog = () => {
    trackDialogClass("main");
    navigate(".");
  };

  const FORCE_EXP_DT = format(
    subDays(parse(authState?.workingDate, "dd/MMM/yyyy", new Date()), 1),
    "dd/MMM/yyyy"
  );

  const forceExpire: any = useMutation(
    "crudLimitEntryData",
    crudLimitEntryData,
    {
      onSuccess: (data) => {
        CloseMessageBox();
        navigate(".");

        enqueueSnackbar(t("ForceExpSuccessfully"), { variant: "success" });
        getLimitDetail.mutate({
          COMP_CD: authState?.companyID,
          ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
          ACCT_CD: rows?.[0]?.data?.ACCT_CD,
          BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
          GD_TODAY_DT: authState?.workingDate,
          USER_LEVEL: authState?.role,
        });
        if (data?.[0]?.O_STATUS === "9") {
          MessageBox({
            messageTitle: "Alert",
            message: data?.[0]?.O_MESSAGE,
            icon: "WARNING",
            defFocusBtnName: "Ok",
          });
        }
      },
    }
  );

  const onSubmitHandler = async (data: any, displayData, endSubmit) => {
    let Expflag =
      new Date(data?.FORCE_EXP_DT) < new Date(authState?.workingDate);
    let upd = utilFunction.transformDetailsData(
      {
        FORCE_EXP_DT: rows?.[0]?.data?.EXPIRY_DT,
        EXPIRY_DT: data?.FORCE_EXP_DT,
        EXPIRED_FLAG: Expflag ? "E" : rows?.[0]?.data?.EXPIRED_FLAG,
      },
      {
        FORCE_EXP_DT: rows?.[0]?.data?.FORCE_EXP_DT,
        EXPIRY_DT: rows?.[0]?.data?.EXPIRY_DT,
        EXPIRED_FLAG: rows?.[0]?.data?.EXPIRED_FLAG,
      }
    );

    let apiReq = {
      _isNewRow: false,
      _isDeleteRow: false,
      LIMIT_AMOUNT: rows?.[0]?.data?.LIMIT_AMOUNT,
      CONFIRMED_FLAG: rows?.[0]?.data?.CONFIRMED,
      TRAN_DT: rows?.[0]?.data?.TRAN_DT,
      TRAN_CD: rows?.[0]?.data?.TRAN_CD,
      ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
      ACCT_CD: rows?.[0]?.data?.ACCT_CD,
      ENTERED_BY: rows?.[0]?.data?.ENTERED_BY,
      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
      COMP_CD: rows?.[0]?.data?.COMP_CD,
      ENTERED_COMP_CD: rows?.[0]?.data?.ENTERED_COMP_CD,
      ENTERED_BRANCH_CD: rows?.[0]?.data?.ENTERED_BRANCH_CD,
      ACTIVITY_TYPE: "Limit Screen",
      USER_DEF_REMARKS: "",
      REMARKS: "Force Expire From Limit Entry Screen",
      EXPIRY_DT: data?.FORCE_EXP_DT,
      FORCE_EXP_DT: rows?.[0]?.data?.EXPIRY_DT,
      ...(Expflag ? { EXPIRED_FLAG: "E" } : {}),
      ...upd,
    };

    let buttonName = await MessageBox({
      messageTitle: "Confirmation",
      message: "AreYouSureToProceed",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });

    if (buttonName === "Yes") {
      forceExpire.mutate(apiReq);
    }

    //@ts-ignore
    endSubmit(true);
  };
  return (
    <Dialog
      open={true}
      fullWidth={true}
      className="LimitDetail"
      PaperProps={{
        style: {
          maxWidth: "1150px",
        },
      }}
    >
      <>
        {forceExpire?.isError && (
          <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={forceExpire?.error?.error_msg ?? "Unknow Error"}
                errorDetail={forceExpire?.error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          </div>
        )}
        <FormWrapper
          key={"limit-force-exp"}
          metaData={forceExpireMetaData as MetaDataType}
          initialValues={{ ...rows[0].data, FORCE_EXP_DT: FORCE_EXP_DT }}
          onSubmitHandler={onSubmitHandler}
          displayMode={
            rows?.[0]?.data?.ALLOW_FORCE_EXP === "Y" ? "edit" : "view"
          }
          subHeaderLabel={` ${
            rows?.[0]?.data?.ALLOW_FORCE_EXP === "Y"
              ? t("ForceExpireLimitDetail")
              : t("LimitDetail")
          }  \u00A0\u00A0\u00A0 ${(
            rows?.[0]?.data?.COMP_CD +
            "-" +
            rows?.[0]?.data?.BRANCH_CD +
            "-" +
            rows?.[0]?.data?.ACCT_TYPE +
            "-" +
            rows?.[0]?.data?.ACCT_CD
          ).replace(/\s/g, "")} — ${rows?.[0]?.data?.ACCT_NM}`}
          hideDisplayModeInTitle={true}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                {rows?.[0]?.data?.ALLOW_FORCE_EXP === "Y" && (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={forceExpire?.isLoading}
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                )}
                <GradientButton color="primary" onClick={handleCloseDialog}>
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
