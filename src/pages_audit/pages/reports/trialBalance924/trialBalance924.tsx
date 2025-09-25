import React, { useContext, useState } from "react";
import TrialBalanceVerticalReport from "../trial-balance-vertical-report";
import { AppBar, Box, Typography } from "@mui/material";
import { GradientButton, utilFunction } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { RetrieveData } from "./retrieveData/retrieveData";

export const TrialBalance924 = () => {
  const { authState } = useContext(AuthContext);
  const [retrieve, setRetrieve] = useState<any>(true);
  const [retrieveData, setRetrieveData] = useState<any>([]);
  return (
    <>
      <AppBar
        sx={{
          position: "relative",
          background: "var(--theme-color5)",
          color: "var(--theme-color2)",
          lineHeight: "40px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingRight: "15px",
          }}
        >
          <Typography
            sx={{ ml: 2, flex: 1, alignContent: "center" }}
            variant="h6"
            component="div"
          >
            {`${utilFunction.getDynamicLabel(
              useLocation().pathname,
              authState?.menulistdata,
              true
            )} Trial balance Report - 924`}
          </Typography>
          <Box>
            <GradientButton onClick={() => setRetrieve(true)} color="primary">
              {t("RetrieveData")}
            </GradientButton>
          </Box>
        </Box>
      </AppBar>
      <TrialBalanceVerticalReport />

      {retrieve && (
        <RetrieveData
          setRetrieve={setRetrieve}
          setRetrieveData={setRetrieveData}
        />
      )}
    </>
  );
};
