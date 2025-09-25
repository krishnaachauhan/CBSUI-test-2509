import { useCallback, useContext, useRef, useState } from "react";
import { AppBar, Grid, Tab, Toolbar, Typography } from "@mui/material";
import { CustomTabs } from "../c-kyc/Ckyc";
import { t } from "i18next";
import { TabPanel } from "../c-kyc/formModal/formModal";
import RetrieveAcct from "./RetrieveAcct";
import PendingAcct from "./PendingAcct";
import { utilFunction } from "@acuteinfo/common-base";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import AcctModal from "./AcctModal";
import { useMutation } from "react-query";
import * as API from "./api";

const AcctMST = () => {
  const [tabValue, setTabValue] = useState(0);
  const { authState } = useContext(AuthContext);
  const gridApiReqDataRef = useRef<any>({});
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const navigate = useNavigate();
  const name = utilFunction.getDynamicLabel(
    useLocation().pathname,
    authState?.menulistdata,
    true
  );
  const routeLocation = useLocation();
  const path = routeLocation.pathname;
  const shouldHideMainUI =
    path.includes("new-account") || path.includes("view-detail");
  const isCallFinalSaveRef = useRef<boolean>(false);
  const mutation: any = useMutation(API.getAccountList, {
    onSuccess: () => {},
    onError: (error) => {},
  });
  const handleDialogClose = useCallback(() => {
    navigate(".");
    if (
      isCallFinalSaveRef.current === true &&
      Object.keys(gridApiReqDataRef.current)?.length > 0
    ) {
      mutation.mutate(gridApiReqDataRef.current ?? {});
      isCallFinalSaveRef.current = false;
      const segments = path.split("/");
      segments.pop();
      const basePath = segments.join("/");

      navigate(basePath);
    }
  }, [navigate]);
  return (
    <>
      {!shouldHideMainUI && (
        <div style={{ padding: "0px 10px" }}>
          <AppBar
            position="static"
            className="PRINT_DTL"
            sx={{
              background: "var(--theme-color5)",
              margin: "2px",
              width: "auto",
              marginBottom: "10px",
            }}
          >
            <Toolbar
              sx={{
                paddingLeft: "24px",
                paddingRight: "24px",
                minHeight: "48px !important",
              }}
            >
              <Typography
                style={{ flexGrow: 1 }}
                sx={{
                  color: "var(--theme-color2)",
                  fontSize: "1.25rem",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  fontWeight: 500,
                  lineHeight: "1.6px",
                  letterSpacing: "0.0075em",
                }}
              >
                {name}
              </Typography>
            </Toolbar>
          </AppBar>
          <Grid item xs="auto">
            <CustomTabs
              textColor="secondary"
              value={tabValue}
              onChange={handleTabChange}
              aria-label="acct-mst-tabs"
            >
              {/* <Tab label="Add New" /> */}
              <Tab label={t("Retrieve")} />
              <Tab label={t("Pending")} />
            </CustomTabs>
          </Grid>
          <TabPanel value={tabValue} index={0}>
            <RetrieveAcct gridApiReqDataRef={gridApiReqDataRef} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PendingAcct />
          </TabPanel>
        </div>
      )}
      <Routes>
        {path.includes("new-account") && (
          <Route
            path="new-account/*"
            element={
              <AcctModal
                onClose={handleDialogClose}
                isCallFinalSaveRef={isCallFinalSaveRef}
                asDialog={false}
              />
            }
          />
        )}
        {path.includes("view-detail") && (
          <Route
            path="view-detail/*"
            element={
              <AcctModal
                onClose={handleDialogClose}
                isCallFinalSaveRef={isCallFinalSaveRef}
                asDialog={false}
              />
            }
          />
        )}
      </Routes>
    </>
  );
};

export default AcctMST;
