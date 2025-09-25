import {
  // Button,
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
  greaterThanInclusiveDate,
  TextField,
  KeyboardDatePicker,
  utilFunction,
  RetrievalParametersProps,
} from "@acuteinfo/common-base";
import CircularProgress from "@mui/material/CircularProgress";
import { Fragment, useState, useRef, useEffect, FC } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { greaterThanInclusiveDate } from "registry/rulesEngine";
import { format } from "date-fns/esm";
// import { TextField } from "components/styledComponent";
// import { KeyboardDatePicker } from "components/styledComponent/datetime";
// import { isValidDate } from "components/utils/utilFunctions/function";
import { isValid } from "date-fns";
import { useTranslation } from "react-i18next";
// import { getThemeConfig } from "app/ibmb/theme=";
// const themeObj = unstable_createMuiStrictModeTheme(
//   getThemeConfig({ themeID: "2" })
// );

export const DateUserRetrievalDialog: FC<RetrievalParametersProps> = ({
  classes,
  open,
  handleClose,
  loginState,
  retrievalParaValues,
  defaultData,
  retrievalType,
}) => {
  const { t } = useTranslation();
  const inputButtonRef = useRef<any>(null);
  const cancleButtonRef = useRef<any>(null);
  const [selectedFromDate, setFromDate] = useState(
    defaultData?.A_FROM_DT ?? new Date(format(new Date(), "yyyy/MM/dd"))
  );
  const [selectedToDate, setToDate] = useState(
    defaultData?.A_TO_DT ?? new Date(format(new Date(), "yyyy/MM/dd"))
  );
  const fromDateRef = useRef<Date | null>(null);
  const toDateRef = useRef<Date | null>(null);
  const [loginID, setLoginID] = useState(defaultData?.A_CUSTOM_USER_NM ?? "");
  const [error, SetError] = useState({ isError: false, error: "" });
  const [fromerror, SetFromError] = useState({ isError: false, error: "" });
  const [errorLoginID, SetErrorLoginID] = useState({
    isError: false,
    error: "",
  });
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
        if (fromDateRef.current !== null) {
          SetFromError({
            isError: false,
            error: "",
          });
        }
        if (toDateRef.current !== null) {
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
            <ThemeProvider theme={{ themeID: "2" }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div style={{ display: "flex", gap: "1.25rem" }}>
                  <KeyboardDatePicker
                    key={refresh}
                    // @ts-ignore
                    format="dd/MM/yyyy"
                    label={t("FromDate")}
                    onChange={onFromDateChange}
                    value={selectedFromDate}
                    autoFocus={true}
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
                        "aria-label": "Select Date",
                        InputLabelProps: { shrink: true },
                        autoComplete: "off",
                      },
                      actionBar: {
                        actions: ["today", "accept", "cancel"],
                      },
                    }}
                  />
                  <KeyboardDatePicker
                    //@ts-ignore
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
                        variant: "standard",
                        error: error.isError,
                        helperText: error.error,
                        placeholder: "DD/MM/YYYY",
                        "aria-label": "Select Date",
                        InputLabelProps: { shrink: true },
                        autoComplete: "off",
                        onFocus: onFocusSelectDate,
                      },
                      actionBar: {
                        actions: ["today", "accept", "cancel"],
                      },
                    }}
                  />
                </div>
                <TextField
                  key={"login-id-static"}
                  id={"login-id-static"}
                  variant="standard"
                  name={"loginID"}
                  label={t("LoginID")}
                  required={retrievalType === "DATELOGINIDREQ" ? true : false}
                  value={loginID}
                  fullWidth={true}
                  style={{ marginTop: "15px" }}
                  placeholder={String(t("EnterLoginID"))}
                  onChange={(event) => {
                    const inputText = event.target.value;
                    if (inputText.length <= 16) {
                      const value = inputText.trimStart();
                      const inputValue = value.replace(/[^A-Za-z0-9]/g, "");
                      setLoginID(inputValue);
                      SetErrorLoginID({
                        isError: false,
                        error: "",
                      });
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={errorLoginID.isError}
                  helperText={errorLoginID.error}
                  autoComplete={"off"}
                />
              </LocalizationProvider>
            </ThemeProvider>
          </div>
        </DialogContent>
        <Grid item container justifyContent="center" alignItems="center">
          <DialogActions className={classes.verifybutton}>
            <GradientButton
              // disabled={loginState.loading}
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
                } else if (
                  !Boolean(loginID) &&
                  retrievalType === "DATELOGINIDREQ"
                ) {
                  SetErrorLoginID({
                    isError: true,
                    error: t("RequiredValueMissingForLoginID"),
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
                          "dd/MM/yyyy"
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
                          "dd/MM/yyyy"
                        ),
                        columnName: "ToDates",
                      },
                    },
                    {
                      id: "A_USER_NAME",
                      value: {
                        condition: "equal",
                        value: loginID,
                        columnName: "LoginID",
                      },
                    },
                  ];

                  retrievalParaValues(retrievalValues, {
                    A_FROM_DT: selectedFromDate,
                    A_TO_DT: selectedToDate,
                    A_CUSTOM_USER_NM: loginID,
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
