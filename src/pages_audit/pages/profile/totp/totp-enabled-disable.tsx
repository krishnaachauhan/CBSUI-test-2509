import { GradientButton } from "@acuteinfo/common-base";
import { useSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { Alert, Transition } from "@acuteinfo/common-base";
import OTPInput from "otp-input-react";
import QRCode from "react-qr-code";
import { useStyles } from "../../../auth/style";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  AppBar,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContentText,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
interface UpdateTOTPAuthVerifyFnType {
  otpNumber?: string;
  secretToken?: string;
  userID?: string;
}
const updateTotpAuthVerifyFnWrapper =
  (updateTotpAuthVerify) =>
  async ({ userID, secretToken, otpNumber }: UpdateTOTPAuthVerifyFnType) => {
    return updateTotpAuthVerify({ userID, secretToken, otpNumber });
  };

const TotpEnbaledDisabled = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const authCtx = useContext(AuthContext);
  const failedCount = useRef(0);
  const inputButtonRef = useRef<any>(null);
  const [OTP, setOTP] = useState("");
  const [showPasswordTime, setShowPasswordTime] = useState(0);
  const showPassword = Date.now() < showPasswordTime;
  const [, forceUpdate] = useState<any | null>();
  const timerRef = useRef<any>(null);
  const classes = useStyles();
  const [isOTPError, setOTPError] = useState("");
  const { t } = useTranslation();
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
  const navigate = useNavigate();
  const { state: totpData }: any = useLocation();
  const { totpdata, flag } = props;

  const mutationAuth = useMutation(
    updateTotpAuthVerifyFnWrapper(API.updateTOTPAuthVerify),
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        failedCount.current = failedCount.current + 1;
        if (failedCount.current >= 3) {
          enqueueSnackbar(errorMsg, {
            variant: "error",
          });
          authCtx?.logout();
          navigate("/EnfinityCore/login");
        }
      },
      onSuccess: (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });
        authCtx?.logout();
        navigate("/EnfinityCore/login");
      },
    }
  );
  const ClickEventHandler = () => {
    if (!Boolean(OTP) || OTP.length < 6) {
      setOTPError("Please enter a 6 digit OTP number");
    } else {
      setOTPError("");
      mutationAuth.mutate({
        otpNumber: OTP,
        secretToken:
          flag === "reset" ? totpdata?.secretTocken : totpData?.secretTocken,
        userID:
          flag === "reset" ? totpdata?.userName : authCtx?.authState?.user?.id,
      });
    }
  };

  return (
    <Fragment>
      <Dialog
        open={true}
        //@ts-ignore
        TransitionComponent={Transition}
        fullWidth={false}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <div style={{ width: "97%", margin: "10px", marginRight: "0px" }}>
            <AppBar position="relative" color="secondary">
              <Toolbar variant="dense">
                <Typography component="div" variant="h6">
                  {flag === "reset" ? t("ResetTOTP") : t("TOTP_Registration")}
                </Typography>
              </Toolbar>
              {mutationAuth.isError ? (
                <Alert
                  severity="error"
                  errorMsg={mutationAuth.error?.error_msg}
                  errorDetail={mutationAuth.error?.error_detail}
                />
              ) : null}
            </AppBar>
          </div>
          <Grid
            container
            style={{ marginRight: 29, marginLeft: 29, width: "84%" }}
            spacing={0}
          >
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <Typography component="div" variant="h6">
                {t("TOTP_Note")}
              </Typography>
              <Typography component={"ol"} variant={"caption"}>
                <Typography component={"li"}>{t("TOTP_Line1")}</Typography>
                <Typography component={"li"}>{t("TOTP_Line2")}</Typography>
                <Typography component={"li"}>{t("TOTP_Line3")}</Typography>
                <Typography component={"li"}>{t("TOTP_Line4")}</Typography>
                <Typography component={"li"}>{t("TOTP_Line5")}</Typography>
              </Typography>
              <hr style={{ margin: "10px 0 10px 0" }} />
            </Grid>
            <Grid item lg={5} md={5} xl={5} xs={5}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <div
                      style={{
                        minHeight: 200,
                        // minWidth: 200,
                        maxHeight: 250,
                        maxWidth: 280,
                        margin: 0,
                      }}
                    >
                      <QRCode
                        size={150}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                        value={
                          flag === "reset"
                            ? totpdata?.secretTockenQR
                            : totpData?.secretTockenQR
                        }
                        viewBox={`0 0 150 150`}
                      />
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item lg={7} md={7} xl={7} xs={7} style={{ padding: 10 }}>
              <div
                style={{
                  paddingTop: "27%",
                  height: "100%",
                }}
              >
                <DialogContentText>{t("EnterOTP")}</DialogContentText>
                <div
                  className={classes.divflex}
                  onKeyPress={(e) => {
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
                    disabled={mutationAuth.isLoading}
                    secure={!showPassword}
                    // className={classes.otpinputformauth}
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
                    disabled={mutationAuth.isLoading}
                    className={classes.ibtnvisible}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </div>
                {Boolean(isOTPError) ? (
                  <Typography
                    component={"div"}
                    variant={"caption"}
                    style={{ color: "red" }}
                  >
                    {isOTPError}
                  </Typography>
                ) : null}
              </div>
            </Grid>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <DialogActions>
                <GradientButton
                  disabled={mutationAuth.isLoading}
                  onClick={() => {
                    authCtx?.logout();
                    navigate("/EnfinityCore/login");
                  }}
                  endicon="CancelOutlined"
                  rotateIcon="scale(1.4) rotateY(360deg)"
                >
                  {t("Close")}
                </GradientButton>
                <GradientButton
                  disabled={mutationAuth.isLoading}
                  endicon={mutationAuth.isLoading ? undefined : "VerifiedUser"}
                  rotateIcon="scale(1.4)"
                  onClick={ClickEventHandler}
                  ref={inputButtonRef}
                >
                  {t("otp.VerifyOTP")}{" "}
                  {mutationAuth.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null}
                </GradientButton>
              </DialogActions>
            </Grid>
          </Grid>
        </div>
      </Dialog>
    </Fragment>
  );
};

export default TotpEnbaledDisabled;
