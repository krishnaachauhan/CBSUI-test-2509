import {
  Alert,
  ClearCacheProvider,
  GradientButton,
  LoaderPaperComponent,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { AppBar, Grid, Toolbar, Typography, Box } from "@mui/material";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "pages_audit/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { t } from "i18next";
import { LockerTrnsFormView } from "./lockerTrnsForm";
import { LockerViewDetailsGrid } from "./lockerViewDetailsGrid";
import JointDetails from "../DailyTransaction/TRNHeaderTabs/JointDetails";
import { useMutation, useQuery } from "react-query";
import { getLockerOperationTrnsData, getLockerViewMst } from "./api";
import { LockerTrnsEntry } from "./lockerTrnsEntry";
import CustomerInfo from "./customerInfo";
export const dataContext = createContext<any>(null);

export const useTypeStyles = makeStyles((theme: Theme) => ({
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
  mainContent: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "auto",
  },
  activeView: {
    height: "410px",
    overflowY: "auto",
  },
  entry: {
    height: "auto",
    overflowY: "scroll",
  },
}));
export interface SaveEntryHandle {
  saveEntry: (formData: any, gridData: any) => Promise<void>;
}
const LockerOperationTrns = () => {
  let currentPath = useLocation().pathname;
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  type LockerState = {
    payload: Record<string, unknown>;
    activeView: "master" | "detail" | "joint";
    formData: Record<string, any>[];
    gridData: any[];
    isOpencustomerInfoGrid: boolean;
  };
  const [state, setState] = useState<LockerState>({
    payload: {},
    activeView: "master",
    formData: [],
    gridData: [],
    isOpencustomerInfoGrid: false,
  });

  const childRef = React.useRef<SaveEntryHandle>(null);
  const handleSubmit = () => {
    childRef.current?.saveEntry(state.formData, state.gridData);
  };

  const viewMasterMutation = useMutation(getLockerViewMst, {
    onError: async (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      await MessageBox({
        message: errorMsg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        activeView: "master",
        formData: data,
      }));
    },
  });

  const reqData = useMemo(
    () => ({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_CD: state.payload?.ACCT_CD ?? "",
      ACCT_TYPE: state.payload?.ACCT_TYPE ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
    }),
    [authState, state.payload]
  );

  useEffect(() => {
    if (state.payload?.ACCT_CD && state.payload?.ACCT_TYPE) {
      viewMasterMutation.mutate({
        ...reqData,
      });
    }
  }, [state.payload?.ACCT_CD, state.payload?.ACCT_TYPE, reqData]);

  interface APIError {
    error_msg?: string;
    error_detail?: string;
  }

  const { isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    APIError
  >(
    ["getLockerDetails", state.payload?.ACCT_CD, state.payload?.ACCT_TYPE],
    () => getLockerOperationTrnsData(reqData),
    {
      enabled:
        state.activeView === "detail" &&
        Boolean(state.payload?.ACCT_CD && state.payload?.ACCT_TYPE),
      onSuccess: (data) => {
        setState((prev) => ({
          ...prev,
          gridData: data,
        }));
      },
    }
  );

  const getButtonStyle = useCallback(
    (view: "master" | "detail" | "joint" | "custInfo") => ({
      border: state.activeView === view ? "2px solid white" : "none",
    }),
    [state.activeView]
  );
  const hadleDialogueClose = () => {
    setState((prev) => ({
      ...prev,
      isOpencustomerInfoGrid: false,
    }));
  };

  const contextValue = useMemo(
    () => ({
      state,
      setState,
    }),
    [state]
  );

  return (
    <dataContext.Provider value={contextValue}>
      <div>
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
                  <GradientButton
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        activeView: "master",
                      }))
                    }
                    style={getButtonStyle("master")}
                  >
                    {t("ViewMaster")}
                  </GradientButton>
                  <GradientButton
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        activeView: "detail",
                      }))
                    }
                    style={getButtonStyle("detail")}
                  >
                    {t("ViewDetails")}
                  </GradientButton>
                  <GradientButton
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        activeView: "joint",
                      }))
                    }
                    style={getButtonStyle("joint")}
                  >
                    {t("JointDetail")}
                  </GradientButton>
                  <GradientButton
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        isOpencustomerInfoGrid: true,
                      }))
                    }
                    style={getButtonStyle("custInfo")}
                  >
                    {t("operationLog")}
                  </GradientButton>
                </Grid>
              </Grid>
            </Typography>

            <GradientButton onClick={() => handleSubmit()}>
              {t("Save")}
            </GradientButton>
          </Toolbar>
        </AppBar>
        <Box className={headerClasses.mainContent}>
          <Box className={headerClasses.activeView}>
            {state?.activeView === "master" ? (
              viewMasterMutation.isLoading ? (
                <LoaderPaperComponent />
              ) : (
                <LockerTrnsFormView data={viewMasterMutation?.data} />
              )
            ) : null}

            {state?.activeView === "detail" && (
              <>
                {(isError || viewMasterMutation.isError) && (
                  <Alert
                    severity="error"
                    errorMsg={
                      error?.error_msg ||
                      viewMasterMutation?.error?.error_msg ||
                      t("Somethingwenttowrong")
                    }
                    errorDetail={
                      error?.error_detail ||
                      viewMasterMutation?.error?.error_detail ||
                      ""
                    }
                    color="error"
                  />
                )}

                <LockerViewDetailsGrid
                  data={state?.gridData}
                  refetch={refetch}
                  loading={isLoading || isFetching}
                />
              </>
            )}
            {state?.activeView === "joint" && (
              <JointDetails
                hideHeader={true}
                reqData={{
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  ACCT_CD: state.payload?.ACCT_CD ?? "",
                  ACCT_TYPE: state.payload?.ACCT_TYPE ?? "",
                  ACCT_NM: state.payload?.ACCT_NM ?? "",
                  BTN_FLAG: "N",
                  WORKING_DATE: authState?.workingDate ?? "",
                }}
                height={"350px"}
              />
            )}
          </Box>

          <Box className={headerClasses.entry}>
            <LockerTrnsEntry ref={childRef} />
          </Box>
        </Box>
      </div>
      {state?.isOpencustomerInfoGrid && (
        <CustomerInfo
          open={state?.isOpencustomerInfoGrid}
          closeDialog={hadleDialogueClose}
        />
      )}
    </dataContext.Provider>
  );
};

export const LockerOperationTrnsMain = () => {
  return (
    <ClearCacheProvider>
      <LockerOperationTrns />
    </ClearCacheProvider>
  );
};
