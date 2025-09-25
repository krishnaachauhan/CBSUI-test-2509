import { Fragment, useState } from "react";
import { GradientButton } from "@acuteinfo/common-base";
import FingerprintSharpIcon from "@mui/icons-material/FingerprintSharp";
import * as API from "./api";
import { CircularProgress, Container, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import "./verify.css";
import { useTranslation } from "react-i18next";
export const VerifyFinger = ({
  classes,
  loginState,
  verifyFinger,
  previousStep,
}) => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <Container maxWidth="xs">
        <Grid alignItems="center">
          <div
            style={{
              marginRight: "25px",
              width: "102%",
              // marginBottom: "55px",
            }}
          >
            <br />
            <div
              style={{
                color: "#000000",
                fontSize: "34px",
                fontWeight: "600",
                // fontFamily: "Poppins",
                alignItems: "center",
                fontStyle: "normal",
                lineHeight: "150%",
                marginBottom: "10px",
              }}
            >
              {t("Biometric.BiometrixAuthentication")}
            </div>
            <div
              style={{
                color: "#949597",
                fontSize: "18px",
                fontWeight: "400",
                // fontFamily: "Poppins",
                alignItems: "center",
                fontStyle: "normal",
                lineHeight: "33px",
                // marginBottom: "10px",
              }}
            >
              {t("Biometric.Kindlyplaceyoufinger")}
            </div>
            <br />
            <Typography variant="h5" style={{ color: "#000000" }}>
              {t("otp.Hello")} {""}
              {` ${
                loginState?.username
                  ? loginState.username.charAt(0).toUpperCase() +
                    loginState.username.slice(1)
                  : null
              }`}
            </Typography>
            <br />
            <div
              className={
                loginState?.isBiometricError
                  ? classes.eFingerUi
                  : classes.fingerUi
              }
            >
              <div className="spinner-wrap">
                <FingerprintSharpIcon
                  sx={{
                    fontSize: "80px",
                    opacity: "0.4",
                    borderRadius: "50%",
                    display: "flex",
                    margin: "0 auto",
                    "&:after": {
                      borderBottom: "2px solid #26A456",
                    },
                  }}
                  className={
                    loginState?.isBiometricError ? classes.FingerIcon : null
                  }
                  color={loginState?.isBiometricError ? "error" : "inherit"}
                />
                {loginState?.isScanning ? (
                  <>
                    <div
                      className="spinner-item"
                      style={{
                        border: loginState?.isScanning
                          ? "1px solid #949597"
                          : " 1px solid red",
                      }}
                    ></div>
                    <div
                      className="spinner-item spinner-item--2"
                      style={{
                        border: loginState?.isScanning
                          ? "1px solid #949597"
                          : "1px solid red",
                      }}
                    ></div>
                    <div
                      className="spinner-item spinner-item--3"
                      style={{
                        border: loginState?.isScanning
                          ? "1px solid #949597"
                          : "1px solid red",
                      }}
                    ></div>
                  </>
                ) : null}
              </div>
            </div>

            <div className={classes.biometric}>
              <div style={{ marginTop: "50px" }}>
                <div className={loginState.isScanning ? "progress" : "hide"}>
                  <div
                    className="bar"
                    style={{ width: loginState.isScanning ? "30%" : "0%" }}
                  ></div>
                </div>
                <h3
                  style={{
                    display: "flex",
                    marginTop: "20px",
                    justifyContent: "space-around",
                    color: loginState?.isBiometricError
                      ? "rgb(255 0 0 / 65%)"
                      : "inherit",
                  }}
                >
                  {loginState?.isBiometricError
                    ? loginState?.userMessage
                    : loginState?.loading
                    ? t("Biometric.Loading")
                    : loginState?.isScanning
                    ? t("Biometric.Scanning")
                    : null}
                </h3>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "42px 0 0 42px",
              // margin: "38px 0 0 0",
              gap: "10px",
            }}
          >
            <GradientButton
              fullWidth
              disabled={loginState.loading}
              onClick={() => {
                previousStep(false, "");
              }}
              className={classes.otpButtons}
              starticon={"West"}
              rotateIcon="scale(1.4) rotateX(360deg)"
              textColor={"var(--theme-color3) !important"}
              style={{
                border: "var(--theme-color3)1px solid",
                color: "var(--theme-color3)",
                background: "var(--theme-color2)",
                borderRadius: "10px",
                minWidth: "48%",
              }}
            >
              {t("otp.Back")}
            </GradientButton>
            <GradientButton
              style={{
                borderRadius: loginState.loading ? "50%" : "10px",
                height: loginState.loading ? "40px" : "100%",
                width: loginState.loading ? "0px" : "100%",
                minWidth: loginState.loading ? "40px" : "80px",
                // width: loginState.loading ? "0px" : "90%",
                // minWidth: loginState.loading ? "40px" : "80px",
              }}
              disabled={loginState.loading}
              onKeyDown={(e) => e.keyCode === 13 && verifyFinger}
              onClick={verifyFinger}
              className={classes.otpButtons}
            >
              {loginState.loading ? (
                <CircularProgress
                  size={25}
                  thickness={4.6}
                  style={{ color: "#fff" }}
                />
              ) : (
                t("Biometric.Verify")
              )}
            </GradientButton>
          </div>
        </Grid>
      </Container>
    </Fragment>
  );
};
