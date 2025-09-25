import React, { useContext, useEffect, useState } from "react";
import { AppBar, CircularProgress, Toolbar, Typography } from "@mui/material";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useQuery } from "react-query";
import { PendinGTrns } from "./pendingTransactions";
import { VerifyDayendChecksums } from "./verifyDayendChecksums";
import { t } from "i18next";
import {
  ClearCacheProvider,
  queryClient,
  GradientButton,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useLocation, useNavigate } from "react-router-dom";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));

const DayEndProcess = () => {
  let currentPath = useLocation().pathname;
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const [openPendingTrns, setOpenPendingTrns] = useState(false);
  const [openDayendProcess, setOpenDayendProcess] = useState(false);
  const [openVerifyChecksums, setOpenVerifyChecksums] = useState(false);
  const { MessageBox } = usePopupContext();

  const { data, isLoading } = useQuery(
    ["getDayendprocessFlag"],
    () =>
      API.getDayendprocessFlag({
        ENT_COMP_CD: authState?.companyID,
        ENT_BRANCH_CD: authState?.user?.branchCode,
        BASE_COMP_CD: authState?.baseCompanyID,
        BASE_BRANCH_CD: authState?.user?.baseBranchCode,
        A_GD_DATE: authState?.workingDate,
      }),
    {
      onError: async (error: any) => {
        await MessageBox({
          message: error?.error_msg,
          messageTitle: "Error",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDayendprocessFlag"]);
    };
  }, []);
  const navigate = useNavigate();

  const handleOpenPendingTrns = async () => {
    const btnName = await MessageBox({
      message: t("PendingTrnsProceed"),
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
    });
    if (btnName === "Yes") {
      // setOpenPendingTrns(true);
      //@ts-ignore
      navigate("../Pending-Transactions", { state: { BACK_FROM: "DAY_END" } });
    }
  };
  let isHOLoggined =
    authState?.user?.branchCode === authState?.user?.baseBranchCode;

  return (
    <>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {utilFunction.getDynamicLabel(
              currentPath,
              authState?.menulistdata,
              true
            )}
          </Typography>
          <GradientButton onClick={handleOpenPendingTrns} color={"primary"}>
            {t("PendingTransactions")}
          </GradientButton>
          <GradientButton
            onClick={() => setOpenDayendProcess(true)}
            endIcon={isLoading ? <CircularProgress size={20} /> : null}
            disabled={isLoading}
            color={"primary"}
          >
            {data && data[0]?.EOD_FLAG === "H" ? t("DayHandover") : t("DayEnd")}
          </GradientButton>
          <GradientButton
            onClick={() => setOpenVerifyChecksums(true)}
            color={"primary"}
          >
            {t("VerifyDayEndChecksums")}
          </GradientButton>
        </Toolbar>
      </AppBar>
      {openPendingTrns && (
        <PendinGTrns
          open={openPendingTrns}
          close={() => setOpenPendingTrns(false)}
        />
      )}
      {openDayendProcess && (
        <VerifyDayendChecksums
          open={openDayendProcess}
          close={() => {
            setOpenDayendProcess(false);
          }}
          reqFlag={data[0]?.EOD_FLAG}
          flag={"D"}
          processFlag={
            data && data[0]?.EOD_FLAG === "H" ? t("DayHandover") : t("DayEnd")
          }
          isHOLoggined={isHOLoggined}
        />
      )}
      {openVerifyChecksums && (
        <VerifyDayendChecksums
          open={openVerifyChecksums}
          close={() => {
            setOpenVerifyChecksums(false);
          }}
          flag={"C"}
          reqFlag={data[0]?.EOD_FLAG}
          processFlag={
            data && data[0]?.EOD_FLAG === "H" ? t("DayHandover") : t("DayEnd")
          }
          isHOLoggined={isHOLoggined}
        />
      )}
    </>
  );
};

export const DayEndProcessMain = () => (
  <ClearCacheProvider>
    <DayEndProcess />
  </ClearCacheProvider>
);
