import { Fragment, useState, useEffect, useRef } from "react";
import { GradientButton, TextField } from "@acuteinfo/common-base";
import {
  CircularProgress,
  FormHelperText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ForgotPasswordFields = ({
  classes,
  loginState,
  onSubmit,
  validatePassword,
}) => {
  const [input, setInput] = useState({
    userName: loginState.workingState === 1 ? loginState?.username : "",
    mobileno: "",
    password: "",
    confirmpassword: "",
  });
  const inputRef = useRef<any>(null);
  const inputPassRef = useRef<any>(null);
  const inputButtonRef = useRef<any>(null);
  const [showPasswordTime, setShowPasswordTime] = useState(0);
  const [showConfirmPasswordTime, setShowConfirmPasswordTime] = useState(0);
  const showPassword = Date.now() < showPasswordTime;
  const showConfirmPassword = Date.now() < showConfirmPasswordTime;
  const [, forceUpdate] = useState<any | null>();
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    if (name === "userName" && value) {
      loginState.isUsernameError = false;
    }
    if (name === "mobileno" && value) {
      value = value.replace(/\D/g, "");
      if (Boolean(value)) {
        loginState.isMobileError = false;
      }
    }
    setInput((values) => ({ ...values, [name]: value }));
  };
  useEffect(() => {
    if (loginState.workingState === 1) {
      setTimeout(() => {
        inputPassRef?.current?.focus?.();
      }, 2000);
    }
  }, [loginState.workingState]);
  return (
    <Fragment>
      <div className={classes.formWrap}>
        <TextField
          autoFocus={true}
          label={t("UserID")}
          placeholder={String(t("UserID"))}
          fullWidth
          type={"text"}
          name="userName"
          value={input.userName.trimStart() || ""}
          onChange={handleChange}
          error={loginState.isUsernameError}
          helperText={
            loginState.isUsernameError
              ? t(loginState.userMessageforusername)
              : ""
          }
          InputLabelProps={{ shrink: true }}
          disabled={
            loginState.loading
              ? true
              : loginState.workingState === 0
              ? false
              : true
          }
          autoComplete="off"
          ref={inputRef}
          inputProps={{ maxLength: 16 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputButtonRef?.current?.click?.();
            }
          }}
          style={{ paddingBottom: "8px" }}
        />
        {loginState.workingState === 0 ? (
          <TextField
            label={t("MobileNo")}
            placeholder="Enter Mobile No."
            // placeholder={String(t("EnterMobileNo"))}
            fullWidth
            type={"text"}
            name="mobileno"
            value={input.mobileno.trimStart() || ""}
            onChange={handleChange}
            error={loginState.isMobileError}
            helperText={
              loginState.isMobileError
                ? t(loginState.userMessageforMobileno)
                : ""
            }
            InputLabelProps={{ shrink: true }}
            disabled={
              loginState.loading
                ? true
                : loginState.workingState === 0
                ? false
                : true
            }
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputButtonRef?.current?.click?.();
              }
            }}
            inputProps={{ maxLength: 13 }}
            style={{ paddingBottom: "8px" }}
          />
        ) : null}
        {loginState.workingState === 1 ? (
          <>
            <TextField
              autoFocus={true}
              label={t("Password")}
              placeholder="Enter Password"
              fullWidth
              type={showPassword ? "text" : "password"}
              name="password"
              value={input.password.trimStart() || ""}
              onChange={handleChange}
              onBlur={async () => await validatePassword(input, "P")}
              error={loginState.isPasswordError}
              helperText={
                loginState.isPasswordError
                  ? t(loginState.userMessageforPassword)
                  : ""
              }
              InputLabelProps={{ shrink: true }}
              disabled={loginState.loading}
              autoComplete="off"
              ref={inputPassRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loginState.passwordValidateloading ? (
                      <CircularProgress
                        color="secondary"
                        variant="indeterminate"
                        size={25}
                        thickness={4.6}
                      />
                    ) : null}
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => {
                        if (!showPassword) {
                          setShowPasswordTime(Date.now() + 5000);
                          timerRef.current = setTimeout(
                            () => forceUpdate(Date.now()),
                            5000
                          );
                        } else if (showPassword) setShowPasswordTime(0);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={loginState.loading}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 16 }}
              style={{ paddingBottom: "8px" }}
            />
            <TextField
              label={t("ConfirmPassword")}
              placeholder={String(t("EnterConfirmPassword"))}
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              name="confirmpassword"
              value={input.confirmpassword.trimStart() || ""}
              onChange={handleChange}
              onBlur={async () => await validatePassword(input, "C")}
              error={loginState.isConfirmPasswordError}
              helperText={
                loginState.isConfirmPasswordError
                  ? t(loginState.userMessageforconfirmPassword)
                  : ""
              }
              InputLabelProps={{ shrink: true }}
              disabled={loginState.loading}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => {
                        if (!showConfirmPassword) {
                          setShowConfirmPasswordTime(Date.now() + 5000);
                          timerRef.current = setTimeout(
                            () => forceUpdate(Date.now()),
                            5000
                          );
                        } else if (showConfirmPassword)
                          setShowConfirmPasswordTime(0);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      disabled={loginState.loading}
                    >
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              inputProps={{ maxLength: 16 }}
              style={{ paddingBottom: "8px" }}
            />
          </>
        ) : null}
        {loginState.isApiError ? (
          <FormHelperText style={{ color: "red" }}>
            {loginState.apierrorMessage}
          </FormHelperText>
        ) : null}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "row-reverse",
          }}
        >
          <div
            style={{
              flex: "auto",
              textAlign: "center",
              marginTop: "5px",
              marginBottom: "17px",
            }}
          >
            <div>
              <GradientButton
                style={{ borderRadius: "10px", marginRight: "5px" }}
                // fullWidth

                disabled={loginState.loading}
                onClick={() => {
                  navigate("login");
                }}
                starticon={"West"}
                rotateIcon="scale(1.4) rotateX(360deg)"
              >
                {t("backtologin")}
              </GradientButton>

              <GradientButton
                style={{ borderRadius: "10px" }}
                disabled={loginState.loading}
                onClick={() => {
                  onSubmit(input, loginState.workingState);
                }}
                ref={inputButtonRef}
                endicon={loginState.loading ? undefined : "East"}
                // endicon={loginState.loading ? null : "East"}
                rotateIcon="scale(1.4) rotateX(360deg)"
              >
                {loginState.loading ? (
                  <CircularProgress size={25} thickness={4.6} />
                ) : (
                  t("Next")
                )}
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
