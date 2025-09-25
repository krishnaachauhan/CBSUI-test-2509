import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import {
  ThemeProvider,
  unstable_createMuiStrictModeTheme,
} from "@mui/material/styles";
import {
  GradientButton,
  KeyboardDatePicker,
  greaterThanInclusiveDate,
  utilFunction,
  TextField,
  RetrievalParametersProps,
} from "@acuteinfo/common-base";
import CircularProgress from "@mui/material/CircularProgress";
import { Fragment, useState, useRef, useEffect, FC } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns/esm";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import { theme } from "app/audit/theme";
// const themeObj = unstable_createMuiStrictModeTheme(
//   getThemeConfig({ themeID: "2" })
// );
export const DateRetrievalDialog: FC<RetrievalParametersProps> = ({
  classes,
  open,
  handleClose,
  loginState,
  retrievalParaValues,
  defaultData,
}) => {
  const { t } = useTranslation();
  const inputButtonRef = useRef<any>(null);
  const cancleButtonRef = useRef<any>(null);
  const [selectedFromDate, setFromDate] = useState(
    defaultData?.A_FROM_DT ?? new Date(format(new Date(), "yyyy/MM/dd"))
  );
  const fromDateRef = useRef<Date | null>(null);
  const toDateRef = useRef<Date | null>(null);
  const [selectedToDate, setToDate] = useState(
    defaultData?.A_TO_DT ?? new Date(format(new Date(), "yyyy/MM/dd"))
  );
  const [error, SetError] = useState({ isError: false, error: "" });
  const [fromerror, SetFromError] = useState({ isError: false, error: "" });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    setRefresh((old) => old + 1);
  }, []);
  const onFromDateChange = (date) => {
    if (date > new Date()) {
      SetFromError({
        isError: true,
        error: t("Futuredatesarenotallowed"),
      });
      return;
    }
    if (utilFunction.isValidDate(date)) {
      date = new Date(format(date, "yyyy/MM/dd"));
      setFromDate(date);
      fromDateRef.current = date;
      if (!greaterThanInclusiveDate(selectedToDate, date)) {
        SetFromError({
          isError: true,
          error: t("FromDateshouldbelessthanorequaltoToDate"),
        });
      } else {
        SetFromError({
          isError: false,
          error: "",
        });
        if (error.isError) {
          SetError({
            isError: false,
            error: "",
          });
        }
      }
    } else if (!date) {
      SetFromError({
        isError: true,
        error: t("ThisFieldisrequired"),
      });
      fromDateRef.current = null;
      return;
    } else if (!isValid(date)) {
      SetFromError({
        isError: true,
        error: t("Mustbeavaliddate"),
      });
      fromDateRef.current = null;
      return;
    } else {
      SetFromError({
        isError: true,
        error: t("Mustbeavaliddate"),
      });
    }
  };

  const onToDateChange = (date) => {
    if (utilFunction.isValidDate(date)) {
      date = new Date(format(date, "yyyy/MM/dd"));
      setToDate(date);
      toDateRef.current = date;
      if (!greaterThanInclusiveDate(date, selectedFromDate)) {
        SetError({
          isError: true,
          error: t("ToDateshouldbegreaterthanorequaltoFromDate"),
        });
      } else {
        SetError({
          isError: false,
          error: "",
        });
        if (fromerror.isError) {
          SetFromError({
            isError: false,
            error: "",
          });
        }
      }
    } else if (!date) {
      SetError({
        isError: true,
        error: t("ThisFieldisrequired"),
      });
      toDateRef.current = null;
      return;
    } else if (!isValid(date)) {
      SetError({
        isError: true,
        error: t("Mustbeavaliddate"),
      });
      toDateRef.current = null;
      return;
    } else {
      SetError({
        isError: true,
        error: t("Mustbeavaliddate"),
      });
    }
  };
  const onFocusSelectDate = (date) => {
    date.target.select();
  };

  return (
    <Fragment>
      <Dialog open={open} maxWidth="xs" sx={{ marginBottom: "12rem" }}>
        <DialogTitle>{t("EnterRetrievalParameters")}</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>Please Verify OTP</DialogContentText> */}
          <div
            className={classes.divflex}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                inputButtonRef?.current?.click?.();
              }
              if (e.key === "Escape") {
                cancleButtonRef?.current?.click?.();
              }
            }}
          >
            <ThemeProvider theme={theme}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div style={{ display: "flex", gap: "1.25rem" }}>
                  <KeyboardDatePicker
                    key={refresh}
                    autoFocus={true}
                    format="dd/MM/yyyy"
                    label={t("FromDate")}
                    onChange={onFromDateChange}
                    value={selectedFromDate}
                    disableFuture
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      textField: {
                        variant: "standard",
                        placeholder: "DD/MM/YYYY",
                        error: fromerror.isError,
                        helperText: fromerror.error,
                        onFocus: onFocusSelectDate,
                        InputLabelProps: { shrink: true },
                        autoComplete: "off",
                        "aria-label": "Select Date",
                      },
                      actionBar: {
                        actions: ["today", "accept", "cancel"],
                      },
                    }}
                  />

                  <KeyboardDatePicker
                    format="dd/MM/yyyy"
                    label={t("ToDate")}
                    onChange={onToDateChange}
                    // minDate={selectedFromDate}
                    value={selectedToDate}
                    slots={{
                      textField: TextField,
                    }}
                    slotProps={{
                      textField: {
                        onFocus: onFocusSelectDate,
                        variant: "standard",
                        error: error.isError,
                        helperText: error.error,
                        placeholder: "DD/MM/YYYY",
                        InputLabelProps: { shrink: true },
                        autoComplete: "off",
                        "aria-label": "Select Date",
                      },
                      actionBar: {
                        actions: ["today", "accept", "cancel"],
                      },
                    }}
                  />
                </div>
              </LocalizationProvider>
            </ThemeProvider>
          </div>
        </DialogContent>
        <Grid item container justifyContent="center" alignItems="center">
          <DialogActions className={classes.verifybutton}>
            <GradientButton
              disabled={
                loginState.loading || fromerror.isError || error.isError
              }
              endIcon={
                loginState.loading ? <CircularProgress size={20} /> : null
              }
              onClick={() => {
                if (
                  !greaterThanInclusiveDate(selectedToDate, selectedFromDate)
                ) {
                  SetError({
                    isError: true,
                    error: t("ToDateFromDate"),
                  });
                } else {
                  let retrievalValues = [
                    {
                      id: "A_FROM_DT",
                      value: {
                        condition: "equal",
                        value: format(
                          new Date(
                            selectedFromDate.toISOString() ?? new Date()
                          ),
                          "dd/MMM/yyyy"
                        ),
                        columnName: "FromDates",
                      },
                    },
                    {
                      id: "A_TO_DT",
                      value: {
                        condition: "equal",
                        value: format(
                          new Date(selectedToDate.toISOString() ?? new Date()),
                          "dd/MMM/yyyy"
                        ),
                        columnName: "ToDates",
                      },
                    },
                  ];
                  retrievalParaValues(retrievalValues, {
                    A_FROM_DT: selectedFromDate,
                    A_TO_DT: selectedToDate,
                  });
                }
              }}
              ref={inputButtonRef}
              style={{ marginTop: "15px" }}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton
              disabled={loginState.loading}
              onClick={() => handleClose()}
              style={{ marginTop: "15px" }}
              ref={cancleButtonRef}
            >
              {t("Cancel")}
            </GradientButton>
          </DialogActions>
        </Grid>
      </Dialog>
    </Fragment>
  );
};
