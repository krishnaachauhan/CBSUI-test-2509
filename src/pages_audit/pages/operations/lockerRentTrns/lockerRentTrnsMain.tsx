import { useContext, useEffect, useState } from "react";
import {
  ClearCacheProvider,
  GradientButton,
  utilFunction,
} from "@acuteinfo/common-base";
import { Fragment } from "react/jsx-runtime";
import { AppBar, Grid, Toolbar, Typography } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { t } from "i18next";
import { useTypeStyles } from "../LockerOperationTrns/lockerOperationTrns";
import { Box } from "@mui/system";
import { LockerTrnsFormView } from "../LockerOperationTrns/lockerTrnsForm";
import { LockerRentTrnsEntryForm } from "./lockerRentTrnsEntryForm";
import { ViewTrnsGrid } from "./viewTrnsGrid";
import JointDetails from "../DailyTransaction/TRNHeaderTabs/JointDetails";
import { useEnter } from "components/custom/useEnter";
import { DataProvider, useDataContext } from "./DataContext";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalParaForm/dateRetrievalPara";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";

const LockerRentTrns = () => {
  const { authState } = useContext(AuthContext);
  const { data, setContextState } = useDataContext();
  const headerClasses = useTypeStyles();
  let currentPath = useLocation().pathname;
  const [isRetrieve, setIsRetrieve] = useState(false);
  const [dataClass, setDataClass] = useState("main");
  const { commonClass, dialogClassNames } = useDialogContext();
  //@ts-ignore
  const { ACCT_CD, ACCT_TYPE, ACCT_NM } = data?.reqData;

  const getButtonStyle = (view) => ({
    border: data?.activeView === view ? "2px solid white" : "none",
  });

  const views = [
    { name: "master", label: t("ViewMaster") },
    { name: "TodaysTransaction", label: t("TodaysTransaction") },
    { name: "ViewTransactions", label: t("ViewTransactions") },
    { name: "JointDetail", label: t("JointDetail") },
  ];

  const renderViewContent = () => {
    switch (data?.activeView) {
      case "master":
        return <LockerTrnsFormView data={data?.formData} />;
      case "TodaysTransaction":
        return <ViewTrnsGrid />;
      case "ViewTransactions":
        return <ViewTrnsGrid />;
      case "JointDetail":
        return (
          <JointDetails
            hideHeader={true}
            reqData={{
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_CD: ACCT_CD ?? "",
              ACCT_TYPE: ACCT_TYPE ?? "",
              ACCT_NM: ACCT_NM ?? "",
              BTN_FLAG: "N",
            }}
            height={"350px"}
          />
        );
      default:
        return null;
    }
  };
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);
  return (
    <Fragment>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                {utilFunction.getDynamicLabel(
                  currentPath,
                  authState?.menulistdata,
                  true
                )}
              </Grid>
              <Grid item>
                {views.map((view) => (
                  <GradientButton
                    key={view.name}
                    onClick={() => {
                      setContextState({
                        activeView: view.name,
                      });
                    }}
                    style={getButtonStyle(view.name)}
                  >
                    {view.label}
                  </GradientButton>
                ))}
              </Grid>
            </Grid>
          </Typography>
          {data?.activeView === "TodaysTransaction" ? (
            <GradientButton
              onClick={() => {
                setIsRetrieve(true);
              }}
            >
              {t("BackDate")}
            </GradientButton>
          ) : null}
          <GradientButton
            onClick={() => {
              setContextState({
                isSubmit: true,
              });
            }}
          >
            {t("Save")}
          </GradientButton>
        </Toolbar>
      </AppBar>
      <Box className={headerClasses.mainContent}>
        <Box className={headerClasses.activeView}>{renderViewContent()}</Box>
        <Box className={headerClasses.entry}>
          <LockerRentTrnsEntryForm />
        </Box>
      </Box>
      {isRetrieve ? (
        <DateRetrievalDialog
          handleClose={() => {
            setIsRetrieve(false);
          }}
          retrievalParaValues={(data) => {
            setContextState({
              retrievalPara: data,
            });
          }}
        />
      ) : null}
    </Fragment>
  );
};

export const LockerRentTrnsMain = () => {
  return (
    <Fragment>
      <ClearCacheProvider>
        <DialogProvider>
          <DataProvider>
            <div className="main">
              <LockerRentTrns />
            </div>
          </DataProvider>
        </DialogProvider>
      </ClearCacheProvider>
    </Fragment>
  );
};
