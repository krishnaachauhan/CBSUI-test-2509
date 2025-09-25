import {
  AppBar,
  Avatar,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { checkDateAndDisplay } from "pages_audit/appBar/appBar";
import Logo from "assets/images/easy_bankcore_Logo.png";
import { useStyles } from "pages_audit/appBar/style";
import bank_logo_default from "assets/images/BecomePartnerImg.svg";
import clsx from "clsx";
import { AuthContext } from "pages_audit/auth";
import { memo, useContext } from "react";
import { t } from "i18next";
import { format } from "date-fns";

const Greetings = () => {
  let hours = new Date().getHours();
  let greet;

  if (hours < 12) greet = "morning";
  else if (hours >= 12 && hours <= 16) greet = "afternoon";
  else if (hours >= 16 && hours <= 24) greet = "evening";

  return <span>Good {greet},</span>;
};

const ExtractedHeader = memo(function ExtractedHeader() {
  const appBarClasses = useStyles();
  const { authState } = useContext(AuthContext);

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
            alt="Netbanking"
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
              [appBarClasses.marquee]: authState?.companyName.length > 55,
            })}
          >
            {authState?.companyName || ""}
          </Box>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ color: "#949597" }}>
              <Typography
                variant="caption"
                display="block"
                lineHeight={0}
                fontSize={"11px"}
              >
                {t("branch")}: {authState?.user?.branchCode ?? "001 "}-
                {authState?.user?.branch ?? ""}
              </Typography>
              <Typography variant="caption" display="inline" fontSize={"11px"}>
                {t("appBar.WorkingDate")} :{" "}
                {checkDateAndDisplay(
                  format(new Date(authState?.workingDate), "dd/MM/yyyy")
                )}
              </Typography>
              <Typography
                marginLeft={1}
                variant="caption"
                display="inline"
                fontSize={"11px"}
              >
                {t("appBar.LastLoginDate")} :{" "}
                {checkDateAndDisplay(authState?.user?.lastLogin ?? "Vastrapur")}
              </Typography>
            </div>
          </div>
        </Typography>
        <Typography fontSize={"17px"} color={"#1C1C1C"}>
          {/* Greetings....{" "} */}
          {/* {Greetings()} {authState.user.id} */}
        </Typography>
        {/* <Typography
              className={classes.title}
              color="inherit"
              variant={"h6"}
              component="div"
            >
              C-KYC Individual/Legal Entry
            </Typography> */}
        {/* <Button
              // onClick={handleFormModalClose}
              color="primary"
              // disabled={mutation.isLoading}
            >
              Close
            </Button> */}
      </Toolbar>
    </AppBar>
  );
});

export default ExtractedHeader;
