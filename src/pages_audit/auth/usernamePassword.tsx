import { TextField, GradientButton } from "@acuteinfo/common-base";
import { Fragment, useState, useEffect, useRef } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { Container } from "@mui/material";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
// import { Language_App } from "pages_audit/appBar/language";
export const UsernamePasswordField = ({
  classes,
  loginState,
  verifyUsernamePassword,
}) => {
  const [input, setInput] = useState({ userName: "", password: "" });
  const [showPasswordTime, setShowPasswordTime] = useState(0);
  const showPassword = Date.now() < showPasswordTime;
  const [, forceUpdate] = useState<any | null>();
  const timerRef = useRef<any>(null);
  const { t } = useTranslation();
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "userName" && value) {
      loginState.isUsernameError = false;
    }
    if (name === "password" && value) {
      loginState.isPasswordError = false;
    }

    setInput((values) => ({ ...values, [name]: value }));
  };
  const inputRef = useRef<any>(null);
  const inputPassRef = useRef<any>(null);
  const inputButtonRef = useRef<any>(null);

  useEffect(() => {
    let timeoutCd;
    if (loginState.isUsernameError) {
      timeoutCd = setTimeout(() => {
        inputRef?.current?.focus?.();
      }, 1000);
    } else if (loginState.isPasswordError) {
      timeoutCd = setTimeout(() => {
        inputPassRef?.current?.focus?.();
      }, 1000);
    }
    return () => {
      if (timeoutCd) {
        clearTimeout(timeoutCd);
      }
    };
  }, [loginState.isUsernameError, loginState.isPasswordError]);
  useEffect(() => {
    let timeoutCd;
    if (loginState?.otpmodelClose ?? false) {
      setInput((values) => ({ ...values, password: "" }));
      timeoutCd = setTimeout(() => {
        inputPassRef?.current?.focus?.();
      }, 1500);
    }
    return () => {
      if (timeoutCd) {
        clearTimeout(timeoutCd);
      }
    };
  }, [loginState.otpmodelClose]);
  // useEffect(() => {
  //   if (loginState.isUsernameError) {
  //     setTimeout(() => {
  //       inputRef?.current?.focus?.();
  //     }, 1000);
  //   } else if (loginState.isPasswordError) {
  //     setTimeout(() => {
  //       inputPassRef?.current?.focus?.();
  //     }, 1000);
  //   }
  // }, [loginState.isUsernameError, loginState.isPasswordError]);
  // useEffect(() => {
  //   if (loginState?.otpmodelClose ?? false) {
  //     setInput((values) => ({ ...values, password: "" }));
  //     setTimeout(() => {
  //       inputPassRef?.current?.focus?.();
  //     }, 1500);
  //   }
  // }, [loginState.otpmodelClose]);

  return (
    <Fragment>
      <Container maxWidth="xs">
        <Grid alignItems="center" style={{ paddingTop: "20px" }}>
          <div
            style={{
              color: "#000000 !important",
              fontSize: "30px",
              fontWeight: "600",
              // fontFamily: "Poppins",
              alignItems: "center",
              fontStyle: "normal",
              lineHeight: "150%",
            }}
          >
            <h3>{t("SignIn")}</h3>
          </div>
          <div
            className=""
            style={{
              color: "#949597",
              fontSize: "16px",
              fontWeight: "400",
              // fontFamily: "Poppins",
              alignItems: "center",
              fontStyle: "normal",

              width: "360px",
            }}
          >
            {t("SignInWithUserIDandPassword")}
          </div>
          <div className={classes.formWrap}>
            <TextField
              // variant="filled"
              // color="secondary"
              autoFocus={true}
              label={t("UserID")}
              // placeholder="User ID"
              placeholder={String(t("UserID"))}
              style={{
                marginTop: "10px",
                marginBottom: "17px",
              }}
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
              disabled={loginState.loading}
              autoComplete="off"
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
              inputProps={{
                maxLength: "16",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                marginTop: "8px",
              }}
            >
              <TextField
                key="employee"
                label={t("Password")}
                // variant="filled"
                // color="secondary"

                placeholder={String(t("EnterPassword"))}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                type={showPassword ? "text" : "password"}
                name="password"
                value={input.password.trimStart() || ""}
                onChange={handleChange}
                error={loginState.isPasswordError}
                helperText={
                  loginState.isPasswordError
                    ? t(loginState.userMessageforpassword)
                    : ""
                }
                disabled={loginState.loading}
                ref={inputPassRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    inputButtonRef?.current?.click?.();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((old) => !old)}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={loginState.loading}
                      >
                        {showPassword ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
                      </IconButton> */}
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
                inputProps={{ maxLength: "16" }}
              />
            </div>
            <div style={{ marginTop: "20px", display: "flex" }}>
              <div style={{ flex: "auto", textAlign: "end" }}>
                <a
                  href="forgotpassword"
                  style={{ color: "var(--theme-color3)" }}
                >
                  {t("ForgotPassword")}
                </a>
              </div>
            </div>
            <div style={{ marginTop: "20px", display: "flex" }}>
              <div
                style={{
                  flex: "auto",
                  textAlign: "center",
                  marginTop: "5px",
                  marginBottom: "17px",
                }}
              >
                <GradientButton
                  style={{
                    borderRadius: loginState.loading ? "50%" : "10px",
                    height: loginState.loading ? "40px" : "100%",
                    width: loginState.loading ? "0px" : "100%",
                    minWidth: loginState.loading ? "40px" : "80px",
                  }}
                  fullWidth
                  disabled={loginState.loading}
                  onClick={() =>
                    verifyUsernamePassword(
                      (input.userName || "").toLowerCase(),
                      input.password
                    )
                  }
                  ref={inputButtonRef}
                  endicon={loginState.loading ? undefined : "East"}
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
        </Grid>
      </Container>
    </Fragment>
  );
};
