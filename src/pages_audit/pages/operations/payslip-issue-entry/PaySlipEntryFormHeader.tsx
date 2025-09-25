import { Alert, GradientButton, utilFunction } from "@acuteinfo/common-base";
import {
  AppBar,
  Toolbar,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { PayslipState } from "./PayslipIsuueEntryform";
import { useTypeStyles } from "../LockerOperationTrns/lockerOperationTrns";
import { t } from "i18next";

interface PaySlipEntryFormHeaderProps {
  rows: Record<string, any>;
  currentPath: string;
  isdraftDtlLoading: boolean;
  isAcctDtlLoading: boolean;
  validDataNutation: { isLoading: boolean };
  PayslipSaveMutation: { isLoading: boolean };
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  closeDialog: () => void;
  payslipState: PayslipState;
  updatePayslipState: (updates: Partial<PayslipState>) => void;
  authState: any;
  MessageBox: any;
  errorDataa: Record<string, any>;
}

export const PaySlipEntryFormHeader = ({
  rows,
  currentPath,
  isdraftDtlLoading,
  isAcctDtlLoading,
  validDataNutation,
  PayslipSaveMutation,
  handleClick,
  closeDialog,
  payslipState,
  updatePayslipState,
  authState,
  MessageBox,
  errorDataa,
}: PaySlipEntryFormHeaderProps) => {
  const headerClasses = useTypeStyles();

  return (
    <div style={{ padding: "10px 10px 0px 10px" }}>
      <AppBar position="static" sx={{ width: "inherit" }} color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {utilFunction.getDynamicLabel(
              currentPath,
              authState?.menulistdata,
              true
            )}
            <Chip
              style={{ color: "white", marginLeft: "8px" }}
              variant="outlined"
              color="primary"
              size="small"
              label={`${payslipState?.formMode} mode`}
            />
          </Typography>

          {payslipState?.formMode !== "new" &&
            !isdraftDtlLoading &&
            !isAcctDtlLoading &&
            rows?.[0]?.data.ALLOW_DEL === "Y" && (
              <GradientButton
                onClick={() => updatePayslipState({ openDltDialogue: true })}
                color="primary"
              >
                {t("delete")}
              </GradientButton>
            )}

          {payslipState?.formMode === "edit" ? (
            <>
              <GradientButton
                onClick={handleClick}
                endIcon={
                  validDataNutation.isLoading ||
                  PayslipSaveMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color="primary"
              >
                {t("Save")}
              </GradientButton>
              <GradientButton
                onClick={() => updatePayslipState({ formMode: "view" })}
              >
                {t("Cancel")}
              </GradientButton>
            </>
          ) : payslipState?.formMode === "new" ? (
            <>
              <GradientButton
                onClick={handleClick}
                endIcon={
                  validDataNutation.isLoading ||
                  PayslipSaveMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color="primary"
              >
                {t("Save")}
              </GradientButton>
              <GradientButton onClick={closeDialog} color="primary">
                {t("Close")}
              </GradientButton>
            </>
          ) : (
            <>
              {!isdraftDtlLoading && !isAcctDtlLoading && (
                <GradientButton
                  onClick={async () => {
                    if (rows?.length) {
                      if (rows[0]?.data?.CONFIRMED !== "Y") {
                        updatePayslipState({ formMode: "edit" });
                      } else {
                        await MessageBox({
                          message: t("confirmEntryRestrictionMsg"),
                          messageTitle: t("ValidationFailed"),
                          icon: "ERROR",
                          buttonNames: ["Ok"],
                        });
                      }
                    }
                  }}
                  color="primary"
                >
                  {t("edit")}
                </GradientButton>
              )}
              <GradientButton onClick={closeDialog} color="primary">
                {t("Close")}
              </GradientButton>
            </>
          )}
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
    </div>
  );
};
