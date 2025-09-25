import { useRef, useCallback, useContext, useState, useEffect } from "react";
import {
  Alert,
  GridWrapper,
  ActionTypes,
  ClearCacheProvider,
  queryClient,
  GradientButton,
  LoaderPaperComponent,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import {
  AppBar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles, styled } from "@mui/styles";
import { StrAcLevelBranchHistoryGridWrapper } from "./strHistoryGrid";
import { StrMarkAsPerSuspiciousGrid } from "./strAcLevelBranchForm/suspiciousTransactionGrid";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { strBranchLevelEntryGridMetaData } from "./girdMetadata";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate } from "react-router-dom";
import { StrBranchLevelFormWrapper } from "./strAcLevelBranchForm/strBranchLevelForm";
import { format } from "date-fns";
import { Theme } from "@mui/system";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
    "@media print": {
      display: "none !important",
    },
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.2rem",
  },
  refreshiconhover: {},
  printHidden: {
    "@media print": {
      display: "none !important",
    },
  },
}));
const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: t("EditDetail"),
    multiple: undefined,
    rowDoubleClick: true,
  },
  {
    actionName: "str-history",
    actionLabel: t("STRHistory"),
    multiple: false,
    rowDoubleClick: true,
  },
];

const StrBranchLevelEntryGrid = () => {
  const { authState } = useContext(AuthContext);
  const gridRef = useRef<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPrint, setIsPrint] = useState<any>(false);
  const [isRowsData, setIsRowsData] = useState<any>([]);
  const [rowData, setRowData] = useState<any>([]);
  const headerClasses = useTypeStyles();
  const [actionMenu, setActionMenu] = useState(actions);
  const [paraType, setParaType] = useState("S");
  const isDataChangedRef = useRef(false);
  const [suspiciousTran, IsSuspiciousTran] = useState<any>(false);

  useEffect(() => {
    if (authState?.hoLogin === "Y") {
      setActionMenu((prevActions) => {
        const newAction = {
          actionName: "suspicious",
          actionLabel: t("SuspiciousStatus"),
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
          shouldExclude: (rows) => {
            return true;
          },
        };
        // Check if the action already exists
        const actionExists = prevActions.some(
          (action) => action.actionName === "suspicious"
        );
        if (!actionExists) {
          // Add the new action if it does not exist
          return [...prevActions, newAction];
        }
        // Return the previous actions if the action already exists
        return prevActions;
      });
    } else {
      // Remove the action if authState.hoLogin is not "Y" or isLoading is false
      setActionMenu((prevActions) =>
        prevActions.filter((action) => action.actionName !== "suspicious")
      );
    }
  }, [authState?.hoLogin]);

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "view-detail") {
      navigate(data?.name, {
        state: data?.rows,
      });
    } else if (data?.name === "str-history") {
      navigate(data?.name, {
        state: data?.rows,
      });
    } else if (data.name === "suspicious") {
      setActionMenu((values: any) => {
        return values.map((item) => {
          if (item.actionName === "suspicious") {
            return {
              ...item,
              actionName: "extraction",
              actionLabel: t("AsperExtraction"),
            };
          } else {
            return item;
          }
        });
      });
      setParaType("E");
    } else if (data.name === "extraction") {
      setActionMenu((values: any) => {
        return values.map((item) => {
          if (item.actionName === "extraction") {
            return {
              ...item,
              actionName: "suspicious",
              actionLabel: t("SuspiciousStatus"),
            };
          } else {
            return item;
          }
        });
      });
      setParaType("S");
    }
  }, []);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getStrBranchLevelData", paraType], () =>
    API.getStrBranchLevelData({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      A_SUSPICIOUS_FLAG: paraType === "S" ? "N" : "B",
      USER_LEVEL: authState?.role,
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getStrBranchLevelData", paraType]);
    };
  }, []);

  const getGroundSuspicionData: any = useMutation(API.getGroundSuspicionData, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },

    onSuccess: (data) => {},
  });

  const handleDialogClose = () => {
    navigate(".");
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  };

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"strBranchLevelEntryGrid" + actionMenu + paraType}
        finalMetaData={strBranchLevelEntryGridMetaData}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actionMenu}
        setAction={setCurrentAction}
        ref={gridRef}
        enableExport={true}
        refetchData={() => refetch()}
        onClickActionEvent={async (index, id, data) => {
          if (id === "GROUND_OF_SUSPICION") {
            getGroundSuspicionData.mutate({
              ACCT_COMP_CD: data?.ACCT_COMP_CD,
              ACCT_BRANCH_CD: data?.ACCT_BRANCH_CD,
              ACCT_TYPE: data?.ACCT_TYPE,
              ACCT_CD: data?.ACCT_CD,
              ENTERED_DATE: format(new Date(data?.ENTERED_DATE), "dd-MMM-yyyy"),
              GD_TODAY: authState?.workingDate,
            });
            setIsPrint(true);
            setRowData(data);
          } else if (id === "TRANSACTION_DETAIL") {
            IsSuspiciousTran(true);
            setIsRowsData(data);
          }
        }}
      />
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <StrBranchLevelFormWrapper
              onClose={handleDialogClose}
              isDataChangedRef={isDataChangedRef}
            />
          }
        />
        <Route
          path="str-history/*"
          element={
            <StrAcLevelBranchHistoryGridWrapper onClose={handleDialogClose} />
          }
        />
      </Routes>
      <>
        {suspiciousTran ? (
          <>
            <StrMarkAsPerSuspiciousGrid
              onClose={() => {
                IsSuspiciousTran(false);
              }}
              rowsData={isRowsData}
            />
          </>
        ) : null}
      </>

      {isPrint ? (
        <>
          <Dialog
            open={true}
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
            maxWidth="md"
          >
            {getGroundSuspicionData?.isLoading ? (
              <LoaderPaperComponent />
            ) : (
              <>
                {getGroundSuspicionData?.isError && (
                  <Alert
                    severity="error"
                    errorMsg={
                      getGroundSuspicionData?.error?.error_msg ??
                      "Something went to wrong.."
                    }
                    errorDetail={getGroundSuspicionData?.error?.error_detail}
                    color="error"
                  />
                )}
                <AppBar position="relative" color="secondary">
                  <Toolbar className={headerClasses.root} variant={"dense"}>
                    <Typography
                      className={headerClasses.title}
                      color="inherit"
                      variant={"h4"}
                      component="div"
                    >
                      {"GOS Detail" +
                        " " +
                        "for" +
                        "-" +
                        rowData?.ACCT_CD_NEW +
                        " " +
                        rowData?.ACCT_NM}
                    </Typography>
                    <GradientButton
                      onClick={() => {
                        window.print();
                      }}
                      className={headerClasses.printHidden}
                    >
                      {t("Print")}
                    </GradientButton>
                    <GradientButton
                      className={headerClasses.printHidden}
                      onClick={() => {
                        setIsPrint(false);
                      }}
                    >
                      {t("Close")}
                    </GradientButton>
                  </Toolbar>
                </AppBar>
                <DialogContent dividers>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                  >
                    {getGroundSuspicionData?.data?.[0]?.GOS_DTL.split(
                      "\r\n"
                    )?.map((line, index) => (
                      <div
                        style={{ fontSize: "15px", fontWeight: "500" }}
                        key={index}
                      >
                        {line}
                      </div>
                    ))}
                  </pre>
                </DialogContent>
              </>
            )}
          </Dialog>
        </>
      ) : null}
    </>
  );
};
export const StrAcLevelBranchEntryGridWrapper = () => {
  return (
    <ClearCacheProvider>
      <StrBranchLevelEntryGrid />
    </ClearCacheProvider>
  );
};
