import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import {
  AppBar,
  Paper,
  Dialog,
  Theme,
  Toolbar,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import { RecurringPaymentEntryForm } from "../recurringPaymentEntry/recurringPaymentEntryForm/recurringPaymentEntryForm";
import { VouchersDetailsGrid } from "./vouchersDetailsGrid";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { recurringPmtConfirmation } from "./api";
import {
  usePopupContext,
  GradientButton,
  utilFunction,
  Alert,
} from "@acuteinfo/common-base";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { getdocCD } from "components/utilFunction/function";
import { useDialogContext } from "../payslip-issue-entry/DialogContext";
const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "var(--theme-color5)",
  },
  appbarTitle: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  paperContainer: {
    height: "auto",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  paper: {
    overflow: "auto",
    border: "2px solid var(--theme-color4)",
    boxShadow: "none",
    maxHeight: "calc(70vh - 150px)",
  },
  footerNote: {
    color: "rgb(128, 0, 57)",
    fontSize: "1rem",
    fontWeight: "500",
  },
}));

export const RecurringPaymentConfirmation = ({
  handleDialogClose,
  setDeleteMessageBox,
  isDataChangedRef,
  validateDeleteRecurMutation,
  entryDeleteMutation,
}) => {
  const [openPhotoSign, setOpenPhotoSign] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const classes = useTypeStyles();
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const screenFlag = "recurringPmtConf";
  const { trackDialogClass } = useDialogContext();

  //Mutation for Confirm Entry
  const recurringPmtConfMutation = useMutation(
    "recurringPmtConfirmation",
    recurringPmtConfirmation,
    {
      onError: async (error: any) => {
        CloseMessageBox();
      },
      onSuccess: async (data) => {
        enqueueSnackbar(data?.[0]?.O_MESSAGE, {
          variant: "success",
        });
        if (Boolean(rows?.[0]?.data?.PAYSLIP)) {
          await MessageBox({
            messageTitle: "Information",
            message:
              "PayslipDraftNeedToConfirmFromPayslipDraftIssueConfirmationScreen",
          });
        } else if (Boolean(rows?.[0]?.data?.RTGS_NEFT)) {
          await MessageBox({
            messageTitle: "Information",
            message: "NEFTNeedToConfirmFromRTGSNEFTConfirmationScreen",
          });
        } else {
          CloseMessageBox();
        }
        isDataChangedRef.current = true;
        CloseMessageBox();
        handleDialogClose();
      },
    }
  );

  const entryConfirmHandler = async () => {
    if (rows?.[0]?.data?.ENTERED_BY === authState?.user?.id) {
      await MessageBox({
        messageTitle: "InvalidConfirmation",
        message: "ConfirmRestrictMsg",
        icon: "ERROR",
      });
    } else {
      const buttonName = await MessageBox({
        messageTitle: "Confirmation",
        message: "DoYouWantToAllowTheTransaction",
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        let reqParam = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
          ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
          ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
          TRAN_CD: rows?.[0]?.data?.TRAN_CD ?? "",
          SCREEN_REF: docCD ?? "",
          ACCOUNT_CLOSE: "",
          ENTERED_BY: rows?.[0]?.data?.ENTERED_BY ?? "",
          ENTERED_COMP_CD: rows?.[0]?.data?.ENTERED_COMP_CD ?? "",
          ENTERED_BRANCH_CD: rows?.[0]?.data?.ENTERED_BRANCH_CD ?? "",
        };
        const buttonName = await MessageBox({
          messageTitle: "AccountClose",
          message: "DoYouWantToCloseAccount",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          reqParam = { ...reqParam, ACCOUNT_CLOSE: "Y" };
        }
        if (buttonName === "No") {
          reqParam = { ...reqParam, ACCOUNT_CLOSE: "N" };
        }
        recurringPmtConfMutation.mutate(reqParam);
      }
    }
  };

  const validateDeleteRecurData = () => {
    const row = rows?.[0]?.data;
    validateDeleteRecurMutation.mutate(
      {
        COMP_CD: row?.COMP_CD ?? "",
        BRANCH_CD: row?.BRANCH_CD ?? "",
        ACCT_TYPE: row?.ACCT_TYPE ?? "",
        ACCT_CD: row?.ACCT_CD ?? "",
        TRAN_CD: row?.TRAN_CD ?? "",
        PAYSLIP: Boolean(row?.PAYSLIP) ? "Y" : "N",
        RTGS_NEFT: Boolean(row?.RTGS_NEFT) ? "Y" : "N",
        SCREEN_REF: docCD,
        STATUS: row?.STATUS ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      },
      {
        onSuccess: async (deletValidData) => {
          for (const response of deletValidData ?? []) {
            if (response?.O_STATUS === "999") {
              await MessageBox({
                messageTitle: response?.O_MSG_TITLE?.length
                  ? response?.O_MSG_TITLE
                  : "ValidationFailed",
                message: response?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
            } else if (response?.O_STATUS === "9") {
              await MessageBox({
                messageTitle: response?.O_MSG_TITLE?.length
                  ? response?.O_MSG_TITLE
                  : "Alert",
                message: response?.O_MESSAGE ?? "",
                icon: "WARNING",
              });
            } else if (response?.O_STATUS === "99") {
              const buttonName = await MessageBox({
                messageTitle: response?.O_MSG_TITLE?.length
                  ? response?.O_MSG_TITLE
                  : "Confirmation",
                message: response?.O_MESSAGE ?? "",
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                icon: "CONFIRM",
              });
              if (buttonName === "No") {
                break;
              }
            } else if (response?.O_STATUS === "0") {
              const buttonName = await MessageBox({
                messageTitle: "Confirmation",
                message: "DoYouWantDeleteRow",
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                icon: "CONFIRM",
              });
              if (buttonName === "Yes") {
                trackDialogClass("remarks__wrapper__base");
                setDeleteMessageBox(true);
              }
            }
          }
        },
      }
    );
  };

  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "100%",
            height: "auto",
            padding: "8px",
          },
        }}
        maxWidth="xl"
        className="recurConfFormDlg"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            handleDialogClose();
          }
        }}
      >
        {(recurringPmtConfMutation?.isError ||
          entryDeleteMutation?.isError ||
          validateDeleteRecurMutation?.isError) && (
          <Alert
            severity="error"
            errorMsg={
              recurringPmtConfMutation?.error?.error_msg ||
              entryDeleteMutation?.error?.error_msg ||
              validateDeleteRecurMutation?.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              recurringPmtConfMutation?.error?.error_detail ||
              entryDeleteMutation?.error?.error_detail ||
              validateDeleteRecurMutation?.error?.error_detail ||
              ""
            }
            color="error"
          />
        )}

        <AppBar
          className="form__header"
          style={{ marginBottom: "8px", position: "sticky", top: 0 }}
        >
          <Toolbar className={classes.root} variant="dense">
            <Typography
              className={classes.appbarTitle}
              color="inherit"
              variant={"h5"}
              component="div"
            >
              {utilFunction.getDynamicLabel(
                currentPath,
                authState?.menulistdata,
                false
              )}
              {`\u00A0\u00A0||\u00A0\u00A0${t("EnteredBy")}: ${
                rows?.[0]?.data?.ENTERED_BY ?? ""
              }\u00A0\u00A0||\u00A0\u00A0${t("Status")}: ${
                rows?.[0]?.data?.CONF_STATUS ?? ""
              }\u00A0\u00A0`}
            </Typography>

            <GradientButton
              endIcon={
                recurringPmtConfMutation?.isLoading ? (
                  <CircularProgress size={20} />
                ) : null
              }
              onClick={entryConfirmHandler}
              disabled={
                recurringPmtConfMutation?.isLoading ||
                rows?.[0]?.data?.ALLOW_CONFIRM !== "Y"
              }
            >
              {t("Confirm")}
            </GradientButton>
            <GradientButton onClick={validateDeleteRecurData}>
              {t("Reject")}
            </GradientButton>
            <GradientButton
              style={{ minWidth: "110px" }}
              onClick={() => setOpenPhotoSign(true)}
            >
              {t("ViewSignature")}
            </GradientButton>
            <GradientButton onClick={handleDialogClose}>Close</GradientButton>
          </Toolbar>
        </AppBar>
        <Stack className={classes.paperContainer}>
          <Paper className={classes.paper}>
            <RecurringPaymentEntryForm
              closeDialog={handleDialogClose}
              defaultView={"view"}
              screenFlag={screenFlag}
            />
          </Paper>
          <Paper className={classes.paper} sx={{ marginTop: "5px !important" }}>
            <VouchersDetailsGrid />
          </Paper>
          <Typography className={classes.footerNote}>
            {rows?.[0]?.data?.CONF_MSG ?? ""}
          </Typography>
        </Stack>
      </Dialog>

      {/*Open Photo Signature */}
      {openPhotoSign ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <PhotoSignWithHistory
            data={{
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
              ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
              ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
              AMOUNT:
                Number(rows?.[0]?.data?.TRAN_BA ?? 0) +
                Number(rows?.[0]?.data?.PROV_INT_AMT ?? 0) +
                Number(rows?.[0]?.data?.INT_AMOUNT ?? 0) -
                Number(rows?.[0]?.data?.TDS_AMT ?? 0),
            }}
            onClose={() => {
              setOpenPhotoSign(false);
            }}
            screenRef={docCD ?? ""}
          />
        </Dialog>
      ) : null}
    </>
  );
};
