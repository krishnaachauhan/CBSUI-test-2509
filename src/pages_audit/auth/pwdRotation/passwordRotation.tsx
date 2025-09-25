import {
  CircularProgress,
  Container,
  FormHelperText,
  Grid,
} from "@mui/material";
import {
  TextField,
  GradientButton,
  utilFunction,
} from "@acuteinfo/common-base";
import { Fragment, useRef, useState } from "react";
import { ResetPassword, validatePasswords } from "../api";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

export const PasswordRotation = ({
  classes,
  open,
  username,
  accessToken,
  tokenType,
  handleClose,
}) => {
  const inputButtonRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [input, setInput] = useState({
    userName: username,
    oldpassword: "",
    password: "",
    confirmpassword: "",
  });
  const [pwdReset, setPasswordReset] = useState({
    isError: false,
    errorMessage: "",
    isLoading: false,
    isoldPwdError: false,
    oldpassworderror: "",
    isnewpwdError: false,
    newpassworderror: "",
    isconfirmnewpwdError: false,
    confirmnewpassworderror: "",
  });

  const handleCloseEvent = () => {
    handleClose("");
  };
  const ClickEventHandler = async () => {
    let isError = false;
    let setPwdData = {
      isError: false,
      errorMessage: "",
      isLoading: false,
      isoldPwdError: false,
      oldpassworderror: "",
      isnewpwdError: false,
      newpassworderror: "",
      isconfirmnewpwdError: false,
      confirmnewpassworderror: "",
    };

    // Local validation
    if (!Boolean(input.oldpassword)) {
      setPwdData.isoldPwdError = true;
      setPwdData.oldpassworderror = "Current Password is required.";
      isError = true;
    }

    let pwdData = utilFunction.ValidatePassword(input.password);
    if (Boolean(pwdData)) {
      setPwdData.isnewpwdError = true;
      setPwdData.newpassworderror = pwdData;
      isError = true;
    }
    if (
      Boolean(input.oldpassword) &&
      Boolean(input.password) &&
      input.oldpassword === input.password
    ) {
      setPwdData.isnewpwdError = true;
      setPwdData.newpassworderror =
        "The new password cannot be the same as the old password";
      isError = true;
    }
    if (!Boolean(input.confirmpassword)) {
      setPwdData.isconfirmnewpwdError = true;
      setPwdData.confirmnewpassworderror = "Confirm new password is required.";
      isError = true;
    } else if (
      Boolean(input.password) &&
      input.password !== input.confirmpassword
    ) {
      setPwdData.isconfirmnewpwdError = true;
      setPwdData.confirmnewpassworderror =
        "New Password and Confirm Password did not match";
      isError = true;
    }
    if (isError) {
      setPasswordReset(setPwdData);
      return;
    }

    // API validation
    setPasswordReset((values) => ({ ...values, isLoading: true }));
    const { validateStatus, validateData } = await validatePasswords({
      USER_ID: input.userName,
      PASSWORD: input.password,
      SCREEN_REF: "LOGIN",
    });
    setPasswordReset((values) => ({ ...values, isLoading: false }));

    if (validateStatus === "0") {
      switch (validateData?.O_STATUS) {
        case "999":
          setPwdData.isnewpwdError = true;
          setPwdData.newpassworderror = validateData?.O_MESSAGE;
          setPasswordReset(setPwdData);
          return;
        case "0":
          let response = await ResetPassword(
            input.userName,
            input.oldpassword,
            input.password,
            accessToken,
            tokenType
          );
          setPasswordReset((values) => ({ ...values, isLoading: true }));
          if (response.status === "0") {
            enqueueSnackbar("Password successfully changed.", {
              variant: "success",
            });
            handleClose("0");
            setPasswordReset((values) => ({ ...values, isLoading: false }));
          } else {
            setPasswordReset((values) => ({
              ...values,
              isError: true,
              errorMessage: response.message,
            }));
          }
          break;
      }
    }
  };

  const handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    if (name === "oldpassword" && Boolean(value)) {
      setPasswordReset((values) => ({ ...values, isoldPwdError: false }));
    } else if (name === "password" && Boolean(value)) {
      setPasswordReset((values) => ({ ...values, isnewpwdError: false }));
    } else if (name === "confirmpassword" && Boolean(value)) {
      setPasswordReset((values) => ({
        ...values,
        isconfirmnewpwdError: false,
      }));
    }
    setInput((values) => ({ ...values, [name]: value }));
  };

  return (
    <Fragment>
      <Container maxWidth="xs">
        <Grid alignItems="center">
          <div
            style={{
              color: "#000000 !important",
              fontSize: "30px",
              fontWeight: "600",
              alignItems: "center",
              fontStyle: "normal",
            }}
          >
            <h3>Password Rotation</h3>
          </div>
          <div
            className=""
            style={{
              color: "#949597",
              fontSize: "18px",
              fontWeight: "400",
              alignItems: "center",
              fontStyle: "normal",
              width: "360px",
            }}
          >
            Please Verify OTP
          </div>
          <div className={classes.formWrap}>
            <TextField
              label={"User ID"}
              placeholder="Enter User ID"
              fullWidth
              type={"text"}
              name="userName"
              value={input.userName || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={true}
              autoComplete="off"
              inputProps={{ maxLength: 16 }}
              style={{ paddingBottom: "8px" }}
            />
            <TextField
              autoFocus={true}
              label={"Current Password"}
              placeholder="Enter Current Password"
              fullWidth
              type={"password"}
              name="oldpassword"
              value={input.oldpassword || ""}
              onChange={handleChange}
              error={pwdReset.isoldPwdError}
              helperText={
                pwdReset.isoldPwdError ? t(pwdReset.oldpassworderror) : ""
              }
              InputLabelProps={{ shrink: true }}
              disabled={pwdReset.isLoading}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
              inputProps={{ maxLength: 16 }}
              style={{ paddingBottom: "8px" }}
            />
            <TextField
              label={"New Password"}
              placeholder="Enter New Password"
              fullWidth
              type={"password"}
              name="password"
              value={input.password || ""}
              onChange={handleChange}
              error={pwdReset.isnewpwdError}
              helperText={
                pwdReset.isnewpwdError ? t(pwdReset.newpassworderror) : ""
              }
              InputLabelProps={{ shrink: true }}
              disabled={pwdReset.isLoading}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
              inputProps={{ maxLength: 16 }}
              style={{ paddingBottom: "8px" }}
            />
            <TextField
              label={"Confirm New Password"}
              placeholder="Enter confirm new password"
              fullWidth
              type={"password"}
              name="confirmpassword"
              value={input.confirmpassword || ""}
              onChange={handleChange}
              error={pwdReset.isconfirmnewpwdError}
              helperText={
                pwdReset.isconfirmnewpwdError
                  ? t(pwdReset.confirmnewpassworderror)
                  : ""
              }
              InputLabelProps={{ shrink: true }}
              disabled={pwdReset.isLoading}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
              inputProps={{ maxLength: 16 }}
              style={{ paddingBottom: "8px" }}
            />
            {pwdReset.isError ? (
              <FormHelperText style={{ color: "red" }}>
                {pwdReset.errorMessage}
              </FormHelperText>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              margin: "20px 0 0 10px",
              width: "94%",
            }}
          >
            <GradientButton
              fullWidth
              disabled={pwdReset.isLoading}
              onClick={handleCloseEvent}
              className={classes.otpButtons}
              style={{
                border: "var(--theme-color3)1px solid",
                color: "var(--theme-color3)",
                // pebbackground: "var(--theme-color2)",
                borderRadius: "10px",
              }}
            >
              Back
            </GradientButton>
            <GradientButton
              style={{
                borderRadius: pwdReset.isLoading ? "50%" : "10px",
                height: pwdReset.isLoading ? "40px" : "100%",
                width: pwdReset.isLoading ? "0px" : "100%",
                minWidth: pwdReset.isLoading ? "40px" : "80px",
              }}
              fullWidth
              disabled={pwdReset.isLoading}
              onClick={ClickEventHandler}
              ref={inputButtonRef}
              className={classes.otpButtons}
            >
              {pwdReset.isLoading ? (
                <CircularProgress size={25} thickness={4.6} />
              ) : (
                "Update"
              )}
            </GradientButton>
          </div>
        </Grid>
      </Container>
    </Fragment>
  );
};
