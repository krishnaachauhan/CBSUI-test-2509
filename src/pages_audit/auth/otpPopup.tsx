import { FormHelperText } from "@mui/material";
import { GradientButton } from "@acuteinfo/common-base";
import { Fragment, useState, useRef, useEffect } from "react";
import OTPInput, { ResendOTP } from "otp-input-react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { CircularProgress } from "@mui/material";
import { VerifyFinger } from "./verifyFinger";
import { Container } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { Grid } from "@mui/material";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { OTPResendRequest } from "./api";
export const OTPModel = ({
  classes,
  open,
  handleClose,
  loginState,
  VerifyOTP,
  OTPError,
  setOTPError,
  previousStep,
  setNewRequestID = (id) => {},
  otpresendCount = 0,
  resendFlag,
  marginCondition,
}) => {
  const [OTP, setOTP] = useState("");
  const [showPasswordTime, setShowPasswordTime] = useState(0);
  const showPassword = Date.now() < showPasswordTime;
  const [, forceUpdate] = useState<any | null>();
  const timerRef = useRef<any>(null);
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  const [btnshow, setbtnshow] = useState(false);
  const inputButtonRef = useRef<any>(null);
  const [resendotpLoading, setResendotpLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  // const renderButton = (buttonProps) => {
  //   let { remainingTime, ...other } = buttonProps;
  //   return resendotpLoading ? (
  //     <a
  //       remainingtime={remainingTime}
  //       {...other}
  //       className={clsx(
  //         classes.resendbtnLink,
  //         !btnshow && classes.btnvisibleoff
  //       )}
  //     >
  //       {t("otp.ResendOTP")}
  //     </a>
  //   ) : null;
  // };
  const renderButton = (buttonProps) => {
    let { remainingTime, ...other } = buttonProps;
    return resendotpLoading ? (
      <a
        className={clsx(
          classes.resendbtnLink,
          !btnshow && classes.btnvisibleoff
        )}
        style={{ cursor: "wait" }}
      >
        {/* {t("otp.ResendOTP")} {<CircularProgress size={20} color="secondary" />} */}
        {t("otp.GetNewOTP")} {<CircularProgress size={20} color="secondary" />}
      </a>
    ) : (
      <a
        remainingtime={remainingTime}
        {...other}
        className={clsx(
          classes.resendbtnLink,
          !btnshow && classes.btnvisibleoff
        )}
      >
        {/* {t("otp.ResendOTP")} */}
        {t("otp.GetNewOTP")}
      </a>
    );
  };

  const ClickEventHandler = () => {
    if (!Boolean(OTP) || OTP.length < 6) {
      setOTPError("otp.EnterOTPDigit");
    } else {
      setOTPError("");
      VerifyOTP(OTP);
    }
  };
  const handleResendClick = async () => {
    setResendotpLoading(true);
    const { status, data, message } = await OTPResendRequest(
      // resendFlag === "FORGET_PW" || resendFlag === "FORGT_TOTP"
      //   ? loginState?.requestCd
      //   : loginState?.transactionID,
      loginState?.comapanyCD,
      loginState?.branchCD,
      loginState?.contactUser,
      resendFlag,
      loginState?.otpValidFor,
      loginState?.username
    );
    setResendotpLoading(false);
    if (status === "0") {
      setNewRequestID(data?.TRAN_CD);
      setbtnshow(false);
      enqueueSnackbar(message, { variant: "success" });
    } else {
      enqueueSnackbar(message, { variant: "error" });
    }
  };
  const handleCloseEvent = () => {
    setOTPError("");
    setOTP("");
    handleClose("");
  };
  const renderTime = (remainingtime) => {
    if (parseInt(remainingtime) === 0) {
      setTimeout(() => {
        setbtnshow(true);
      }, 700);
    }
    return (
      <span className={clsx(btnshow && classes.btnvisibleoff)}>
        {t("otp.OtpExpired")} {remainingtime} {t("otp.second")}
        {/* {t("otp.ValidFor")} {remainingtime} */}
      </span>
    );
  };

  useEffect(() => {
    if (loginState?.otpmodelClose ?? false) {
      handleCloseEvent();
    } else if (Boolean(OTPError)) {
      setOTP("");
    }
  }, [loginState.otpmodelClose, OTPError]);
  return (
    <Fragment>
      <Container maxWidth="sm">
        <Grid alignItems="center" marginTop={marginCondition}>
          <div
            // className={classes.formWrap}
            style={
              {
                // marginRight: "25px",
                // width: "100%",
                // position: "relative",
                // right: "42px",
                // bottom: "13px",
              }
            }
          >
            <div
              style={{
                color: "#000000",
                fontSize: "30px",
                fontWeight: "600",
                // fontFamily: "Poppins",
                alignItems: "center",
                fontStyle: "normal",
                lineHeight: "150%",
                marginBottom: "10px",
              }}
            >
              {loginState?.authType === "OTP"
                ? t("otp.OTPAuthentication")
                : loginState?.authType === "TOTP"
                ? t("otp.TOTPAuthentication")
                : null}
            </div>
            <div
              style={{
                color: "#949597",
                fontSize: "16px",
                fontWeight: "400",
                alignItems: "center",
                fontStyle: "normal",
                lineHeight: "33px",
              }}
            >
              {loginState?.authType === "OTP" || resendFlag === "RN_HO_CONF"
                ? loginState?.otpSentText ?? ""
                : loginState?.authType === "TOTP"
                ? t("otp.PleaseEnterOTP")
                : null}
            </div>
            {/* <div
              style={{
                color: "#949597",
                fontSize: "16px",
                fontWeight: "400",
                alignItems: "center",
                fontStyle: "normal",
                lineHeight: "33px",
              }}
            >
              {t("otp.GenerateNewOTP")}
            </div> */}

            <div className={classes.OTPalignName}>
              {t("otp.Hello")}{" "}
              {loginState?.username
                ? loginState.username.charAt(0).toUpperCase() +
                  loginState.username.slice(1)
                : null}
              {/* {loginState?.authType === "OTP" && ( */}
              <ResendOTP
                // onResendClick={() => setbtnshow(false)}
                onResendClick={handleResendClick}
                // onTimerComplete={() => setbtnshow(true)}
                renderButton={renderButton}
                renderTime={renderTime}
                maxTime={loginState?.otpValidFor ?? 60}
                className={classes.resendOTPalign}
              />
              {/* )} */}
            </div>
            <div
              className={classes.divflex}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputButtonRef?.current?.click?.();
                }
              }}
            >
              <OTPInput
                value={OTP}
                onChange={setOTP}
                autoFocus
                OTPLength={6}
                otpType="number"
                disabled={false}
                secure={!showPassword}
                className={classes.otpinputpadding}
              />
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
                disabled={loginState.otploading}
                className={classes.ibtnvisible}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </div>
            {Boolean(OTPError) ? (
              <FormHelperText style={{ color: "red" }}>
                {OTPError}
              </FormHelperText>
            ) : null}
            {loginState?.authType === "TOTP" ? (
              <div style={{ flex: "auto" }}>
                <a href="forgot-totp" style={{ color: "var(--theme-color3)" }}>
                  Forgot TOTP
                </a>
              </div>
            ) : (
              <></>
            )}
            <div
              className={
                resendFlag === "RN_HO_CONF"
                  ? classes.rtgsHoClass
                  : classes.otpNormalClass
              }
              // style={{
              //   display:"flex",
              //   gap:  resendFlag==="RN_HO_CONF" ? "0" : "10px",
              //   marginTop: resendFlag==="RN_HO_CONF" ? "5px !important" :"42px",
              //   width: resendFlag==="RN_HO_CONF" ?"80%":"60%",
              //   marginRight :resendFlag==="RN_HO_CONF" ? "0" : "42px",
              //   margin : resendFlag==="RN_HO_CONF" ?"0 auto" :""
              // }}
            >
              <GradientButton
                // fullWidth
                disabled={loginState.otploading}
                onClick={() => {
                  previousStep(false, "");
                }}
                className={classes.otpButtons}
                textColor={"var(--theme-color3) "}
                style={{
                  border: "var(--theme-color3)1px solid",
                  minWidth: "50%",
                  background: "var(--theme-color2)",
                  borderRadius: "10px",
                  // hover: {
                  //   background: "var(--theme-color2) !important",
                  // },
                }}
                // customstyle = {{color : "var(--theme-color3) !important"}}
                starticon={"West"}
                rotateIcon="scale(1.4) rotateX(360deg)"
              >
                {t("otp.Back")}
              </GradientButton>
              <GradientButton
                style={{
                  borderRadius: loginState.loading ? "50%" : "10px",
                  height: loginState.loading ? "40px" : "100%",
                  width: loginState.loading ? "0px" : "100%",
                  minWidth: loginState.loading ? "40px" : "80px",
                }}
                fullWidth
                disabled={loginState.loading}
                onClick={ClickEventHandler}
                ref={inputButtonRef}
                className={classes.otpButtons}
                endicon={loginState.loading ? undefined : "TaskAlt"}
                rotateIcon="scale(1.4)"
              >
                {loginState.loading ? (
                  <CircularProgress size={25} thickness={4.6} />
                ) : (
                  t("otp.VerifyOTP")
                )}
              </GradientButton>
            </div>
          </div>
        </Grid>
      </Container>
    </Fragment>
  );
};

export const OTPModelForm = ({
  classes,
  handleClose,
  loginState,
  VerifyOTP,
  OTPError,
  setOTPError,
  resendFlag,
  setNewRequestID = (id) => {},
  otpresendCount = 0,
}) => {
  const [OTP, setOTP] = useState("");
  const [showPasswordTime, setShowPasswordTime] = useState(0);
  const showPassword = Date.now() < showPasswordTime;
  const [, forceUpdate] = useState<any | null>();
  const timerRef = useRef<any>(null);
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  const [btnshow, setbtnshow] = useState(false);
  const [resendotpLoading, setResendotpLoading] = useState(false);
  const inputButtonRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const renderButton = (buttonProps) => {
    let { remainingTime, ...other } = buttonProps;
    return resendotpLoading ? (
      <a
        className={clsx(
          classes.resendbtnLink,
          !btnshow && classes.btnvisibleoff
        )}
        style={{ cursor: "wait" }}
      >
        {/* {t("otp.ResendOTP")} {<CircularProgress size={20} color="secondary" />} */}
        {t("otp.GetNewOTP")} {<CircularProgress size={20} color="secondary" />}
      </a>
    ) : (
      <a
        remainingtime={remainingTime}
        {...other}
        className={clsx(
          classes.resendbtnLink,
          !btnshow && classes.btnvisibleoff
        )}
      >
        {/* {t("otp.ResendOTP")} */}
        {t("otp.GetNewOTP")}
      </a>
    );
  };
  const ClickEventHandler = () => {
    if (!Boolean(OTP) || OTP.length < 6) {
      setOTPError("otp.EnterOTPDigit");
    } else {
      setOTPError("");
      VerifyOTP(OTP);
    }
  };
  const handleResendClick = async () => {
    setResendotpLoading(true);
    const { status, data, message } = await OTPResendRequest(
      // resendFlag === "FORGET_PW"
      //   ? loginState?.requestCd
      //   : loginState?.transactionID,
      // resendFlag,
      loginState?.company_ID,
      loginState?.branch_cd,
      loginState?.contactUser,
      resendFlag,
      loginState?.otpValidFor,
      loginState?.username
    );
    setResendotpLoading(false);
    if (status === "0") {
      setNewRequestID(data?.TRAN_CD);
      setbtnshow(false);
      enqueueSnackbar(message, { variant: "success" });
    } else {
      enqueueSnackbar(message, { variant: "error" });
    }
  };
  const handleCloseEvent = () => {
    setOTPError("");
    setOTP("");
    handleClose();
  };
  const renderTime = (remainingtime) => {
    if (parseInt(remainingtime) === 0) {
      setTimeout(() => {
        setbtnshow(true);
      }, 700);
    }
    return (
      <span className={clsx(btnshow && classes.btnvisibleoff)}>
        {t("otp.OtpExpired")} {remainingtime}
      </span>
    );
  };
  useEffect(() => {
    if (loginState?.otpmodelClose ?? false) {
      handleCloseEvent();
    } else if (Boolean(OTPError)) {
      setOTP("");
    }
  }, [loginState.otpmodelClose, OTPError]);

  return (
    <Fragment>
      <Grid alignItems="center">
        <div>
          <div
            style={{
              color: "#000000",
              fontSize: "30px",
              fontWeight: "600",
              // fontFamily: "Poppins",
              alignItems: "center",
              fontStyle: "normal",
              lineHeight: "150%",
              marginBottom: "10px",
            }}
          >
            {t("otp.OTPAuthentication")}
          </div>
          {/* <div
            style={{
              color: "#949597",
              fontSize: "16px",
              fontWeight: "400",
              alignItems: "center",
              lineHeight: "33px",
            }}
          >
            {t("otp.GenerateNewOTP")}
          </div> */}
          <div
            style={{
              color: "#949597",
              fontSize: "16px",
              fontWeight: "400",
              alignItems: "center",
              fontStyle: "normal",
              lineHeight: "33px",
            }}
          >
            {loginState?.forgotOtpSentText ?? ""}
          </div>
          <div className={classes.OTPalignName}>
            {t("otp.Hello")}{" "}
            {loginState?.username
              ? loginState.username.charAt(0).toUpperCase() +
                loginState.username.slice(1)
              : null}
            {loginState.otploading ||
            otpresendCount >= 3 ||
            loginState?.auth_type === "TOTP" ? null : (
              <ResendOTP
                onResendClick={handleResendClick}
                // onTimerComplete={() => setbtnshow(true)}
                renderButton={renderButton}
                renderTime={renderTime}
                maxTime={loginState?.otpValidFor ?? 60}
                className={classes.resendOTPalign}
              />
            )}
          </div>
          <div
            className={classes.divflex}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputButtonRef?.current?.click?.();
              }
            }}
          >
            <OTPInput
              value={OTP}
              onChange={setOTP}
              autoFocus
              OTPLength={6}
              otpType="number"
              disabled={false}
              secure={!showPassword}
              className={classes.otpinputpadding}
            />

            {/* <IconButton
              aria-label="toggle password visibility"
              // onClick={() => {
              //   if (!showPassword) {
              //     setShowPasswordTime(Date.now() + 5000);
              //     timerRef.current = setTimeout(
              //       () => forceUpdate(Date.now()),
              //       5000
              //     );
              //   } else if (showPassword) setShowPasswordTime(0);
              // }}
              onMouseDown={(e) => e.preventDefault()}
              disabled={loginState.otploading}
              className={classes.ibtnvisible}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
              disabled={loginState.otploading}
              className={classes.ibtnvisible}
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </div>
          {Boolean(OTPError) ? (
            <FormHelperText style={{ color: "red" }}>{OTPError}</FormHelperText>
          ) : null}

          <div
            style={{
              display: "flex",
              gap: "10px",
              margin: "42px 0 0 42px",
              width: "60%",
            }}
          >
            <GradientButton
              fullWidth
              disabled={loginState.otploading}
              onClick={handleCloseEvent}
              className={classes.otpButtons}
              starticon={"West"}
              textColor={"var(--theme-color2) !important"}
              rotateIcon="scale(1.4) rotateX(360deg)"
              style={{
                border: "var(--theme-color3)1px solid",
                color: "var(--theme-color2)",
                // background: "var(--theme-color2)",
                borderRadius: "10px",
                minWidth: "48%",
              }}
            >
              {t("otp.Back")}
            </GradientButton>
            <GradientButton
              style={{
                borderRadius: loginState.otploading ? "50%" : "10px",
                height: loginState.otploading ? "40px" : "100%",
                width: loginState.otploading ? "0px" : "100%",
                minWidth: loginState.otploading ? "40px" : "80px",
              }}
              // fullWidth
              disabled={loginState.loading}
              onClick={ClickEventHandler}
              ref={inputButtonRef}
              className={classes.otpButtons}
            >
              {loginState.otploading ? (
                <CircularProgress size={25} thickness={4.6} />
              ) : (
                t("otp.VerifyOTP")
              )}
            </GradientButton>
          </div>
        </div>
      </Grid>
    </Fragment>
  );
};
