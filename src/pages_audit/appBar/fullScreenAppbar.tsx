import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth";
import { useStyles } from "./style";
import bank_logo_default from "assets/images/BecomePartnerImg.svg";
import {
  Box,
  Button,
  Avatar,
  Stack,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import { checkDateAndDisplay } from "pages_audit/appBar/appBar";
import clsx from "clsx";
import Logo from "assets/images/easy_bankcore_Logo.png";
import { useTranslation } from "react-i18next";

export const MyFullScreenAppBar = () => {
  const authController = useContext(AuthContext);
  const navigate = useNavigate();
  const classes = useStyles();

  const appBarClasses = useStyles();
  const { t } = useTranslation();
  const urlObj = useRef<any>({ bank: "", profile: "" });

  const Greetings = () => {
    let hours = new Date().getHours();
    let greet;

    if (hours < 12) greet = "morning";
    else if (hours >= 12 && hours <= 16) greet = "afternoon";
    else if (hours >= 16 && hours <= 24) greet = "evening";

    return <span>Good {greet},</span>;
  };

  return (
    <AppBar
      position="sticky"
      color="primary"
      // style={{ marginBottom: "10px" }}
    >
      <Toolbar variant="dense" sx={{ display: "flex", alignItems: "center" }}>
        <div>
          <img
            src={Logo}
            alt="Enfinity"
            className={appBarClasses.logo}
            onClick={(e) => {
              e.preventDefault();
            }}
          />
          <p className={appBarClasses.version01}>V: 1.12.03.1</p>
        </div>
        <Stack direction="row" spacing={4} mx={2}>
          <Box className={appBarClasses.heading_user_img_border}>
            <Avatar
              className={appBarClasses.heading_user_img}
              alt="Remy Sharp"
              src={bank_logo_default}
            />
          </Box>
        </Stack>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          className={appBarClasses.title}
        >
          <Box
            style={{
              marginBottom: "8px",
              fontSize: "17px",
              color: "#1C1C1C",
              // overflowX: "auto",
              width: "555px",
            }}
            className={clsx({
              [appBarClasses.marquee]:
                authController?.authState?.companyName.length > 55,
            })}
          >
            {authController?.authState?.companyName || ""}
          </Box>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ color: "#949597" }}>
              <Typography
                variant="caption"
                display="block"
                lineHeight={0}
                fontSize={"11px"}
              >
                Branch: {authController?.authState?.user?.branchCode ?? "001 "}-
                {authController?.authState?.user?.branch ?? ""}
              </Typography>
              <Typography variant="caption" display="inline" fontSize={"11px"}>
                Working Date:{" "}
                {checkDateAndDisplay(
                  authController?.authState?.workingDate ?? ""
                )}
              </Typography>
              <Typography
                marginLeft={1}
                variant="caption"
                display="inline"
                fontSize={"11px"}
              >
                Last Login Date :{" "}
                {checkDateAndDisplay(
                  authController?.authState?.user?.lastLogin ?? "Vastrapur"
                )}
              </Typography>
            </div>
          </div>
        </Typography>
        <Typography fontSize={"17px"} color={"#1C1C1C"}>
          {/* Greetings....{" "} */}
          {Greetings()} {authController.authState.user.id}
        </Typography>

        <Button
          color="primary"
          // disabled={mutation.isLoading}
        >
          Close
        </Button>
      </Toolbar>
    </AppBar>
  );
};
