import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Toolbar,
  Typography,
} from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import AccDetails from "./AccountDetails";
import "./DailyTransTabs.css";
import { AuthContext } from "pages_audit/auth";
import { AccountDetailsGridMetadata } from "./TodayTransaction/gridMetadata";
import * as API from "./TodayTransaction/api";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import * as CommonApi from "../TRNCommon/api";
import CkycProvider from "../../c-kyc/CkycContext";
import { useCacheWithMutation } from "./cacheMutate";
import CommonSvgIcons from "assets/icons/commonSvg/commonSvgIcons";
import {
  GradientButton,
  GridWrapper,
  GridMetaDataType,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { Tabs } from "components/tabs";
import { Tab } from "components/tab";
import DynamicTabs from "./dynamicDailyTransTabs";
import { getInterestCalculatePara } from "../TRN001/api";
import { format } from "date-fns";
import {
  getHeaderDTL,
  getInterestCalculateReportDTL,
} from "../TRN001/DateRetrival/api";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
import { DateRetrival } from "../TRN001/DateRetrival/DataRetrival";
import { SingleAccountInterestReport } from "../TRN001/DateRetrival/singleAccountInterestReport";
import AcctMSTProvider from "../../acct-mst/AcctMSTContext";
import AcctModal from "../../acct-mst/AcctModal";
import { ViewStatement } from "pages_audit/acct_Inquiry/viewStatement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ padding: "0 10px 10px 10px" }}>{children}</Box>
      )}
    </div>
  );
}
interface DailyTransTabsProps {
  heading: string;
  tabsData: any;
  cardsData: any;
  reqData: any;
  hideCust360Btn?: boolean;
  parametres?: any;
  occupiedHeight?: { min: string; max: string };
  screenFlag?: string;
}

export const DailyTransTabs = ({
  heading,
  tabsData,
  cardsData,
  reqData,
  hideCust360Btn,
  parametres,
  occupiedHeight = { min: "680px", max: "680px" },
  screenFlag = "",
}: DailyTransTabsProps) => {
  const [tabValue, setTabValue] = React.useState(0);
  const navArray = tabsData || [];
  const { authState } = useContext(AuthContext);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setTabValue(0);
  }, [navArray]);
  useEffect(() => {
    if (reqData?.INSUR) {
      const insuIndex = navArray.findIndex((tab) => tab.TAB_NAME === "INSU");
      setTabValue(insuIndex !== -1 ? insuIndex : 0);
    }
  }, [reqData, navArray]);
  const getCardColumnValue = () => {
    const keys = [
      "WITHDRAW_BAL",
      "TRAN_BAL",
      "LIEN_AMT",
      "CONF_BAL",
      "UNCL_BAL",
      "DRAWING_POWER",
      "LIMIT_AMOUNT",
      "HOLD_BAL",
      "AGAINST_CLEARING",
      "MIN_BALANCE",
      "OD_APPLICABLE",
      "INST_NO",
      "INST_RS",
      "OP_DATE",
      "PENDING_AMOUNT",
      "ACCT_NM",
      "STATUS",
    ];

    const cardValues = keys?.reduce((acc, key) => {
      const item: any = cardsData?.find(
        (entry: any) => entry?.COL_NAME === key
      );
      acc[key] = item?.COL_VALUE;
      return acc;
    }, {});
    return cardValues;
  };
  useEffect(() => {
    if (reqData) {
      getCardColumnValue();
    }
  }, [reqData, cardsData]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries("getGridDataList");
    };
  }, []);

  return (
    <div
      style={{
        // padding: "8px 8px 0px 8px",
        background: "#fff",
        flex: 0.7,
      }}
    >
      {Boolean(heading) && (
        <AppBar
          position="static"
          sx={{
            background: "var(--theme-color5)",
            width: "auto",
            margin: "10px 10px 0px 10px",
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
              {heading}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* <AppBar component={} sx={{ background: "var(--theme-color5)" }}>
        {Boolean(heading) && <h4> {heading}</h4>}
      </AppBar> */}
      <Grid item xs="auto" id="dailyTabs" style={{ margin: "0px 10px" }}>
        <Tabs
          textColor="secondary"
          // className={classes?.tabs}
          // textColor="secondary"
          value={tabValue}
          onChange={handleTabChange}
          aria-label="ant example"
          variant="scrollable"
        >
          {navArray.length > 0 ? (
            navArray?.map((a, i) => (
              <Tab
                key={a?.TAB_NAME || i}
                className={a?.TAB_NAME}
                label={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ marginRight: "0.4rem" }}>
                      <CommonSvgIcons iconName={a?.ICON} />
                    </div>
                    {a?.TAB_DISPL_NAME}
                  </div>
                }
                aria-disabled={
                  parametres?.[0]?.CHQBK_TAB_ALLOW === "Y" &&
                  a?.TAB_NAME === "CHQ" &&
                  reqData?.BRANCH_CD?.trim() !==
                    authState?.user?.branchCode?.trim()
                }
                // icon={<CommonSvgIcons iconName={null} />}
                // iconPosition="top"
              />
            ))
          ) : (
            <Tab
              className="ACCOUNT"
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: "0.4rem" }}>
                    <CommonSvgIcons iconName={"ACCOUNT"} />
                  </div>
                  {"Account"}
                </div>
              }
            />
          )}
        </Tabs>
      </Grid>

      {navArray.length > 0 && navArray ? (
        navArray?.map((a, i) => (
          <TabPanel key={a?.TAB_NAME || i} value={tabValue} index={i}>
            {a?.TAB_NAME === "ACCOUNT" ? (
              <AccDetails
                cardsData={cardsData}
                hideCust360Btn={hideCust360Btn}
                occupiedHeight={occupiedHeight}
                screenFlag={screenFlag}
              />
            ) : (
              <DynamicTabs
                tabName={a?.TAB_NAME}
                reqData={{
                  ...reqData,
                  TAB_DISPL_NAME: a.TAB_DISPL_NAME,
                }}
                occupiedHeight={occupiedHeight}
                screenFlag={screenFlag}
              />
            )}
          </TabPanel>
        ))
      ) : (
        <TabPanel value={tabValue} index={0}>
          <AccDetails
            cardsData={cardsData}
            hideCust360Btn={hideCust360Btn}
            occupiedHeight={occupiedHeight}
            screenFlag={screenFlag}
          />
        </TabPanel>
      )}
    </div>
  );
};

export const DailyTransTabsWithDialogWrapper = ({
  handleClose,
  rowsData,
  setRowsData,
}) => {
  return (
    <CkycProvider>
      <DailyTransTabsWithDialog
        handleClose={handleClose}
        rowsData={rowsData}
        setRowsData={setRowsData}
        isViewGrid={true}
        isShowFilterButton={false}
      />
    </CkycProvider>
  );
};

export const DailyTransTabsWithDialog: any = ({
  handleClose,
  rowsData,
  setRowsData,
  occupiedHeight = { min: "325px", max: "325px" },
  screenFlag = "",
  isViewGrid = true,
  isShowFilterButton = false,
  label,
}) => {
  const [cardData, setCardsData] = useState<any>([]);
  const [actionMenu, setActionMenu] = useState<any[]>([]);
  const [filterData, setFilterData] = useState("Y");
  const [acctOpen, setAcctOpen] = useState(false);
  const [componentToShow, setComponentToShow] = useState("");
  const [interestCalReportDTL, setInterestCalReportDTL] = useState<any>([]);
  const [dateDialog, setDateDialog] = useState(false);
  const [singleAccountInterest, setSingleAccountInterest] = useState(false);
  const previousRowData = useRef(null);
  const controllerRef = useRef<AbortController>();
  const rowsDataRef = useRef<any>(null);
  const { authState }: any = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { trackDialogClass } = useDialogContext();

  const interestCalculateParaRef = useRef<any>(null);
  const {
    clearCache: clearTabsCache,
    error: tabsErorr,
    data: tabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  } = useCacheWithMutation(
    "getTabsByParentTypeKey",
    CommonApi.getTabsByParentType
  );

  const { data, isLoading, isFetching } = useQuery<any, any>(
    ["getAcctDtlList"],
    () => API.getAcctDtlList(rowsData?.[0]?.data)
  );

  const updatedMetadata = {
    ...AccountDetailsGridMetadata,
    gridConfig: {
      ...AccountDetailsGridMetadata.gridConfig,
      gridLabel:
        data?.length > 0
          ? t("AccountDetails") + "-" + t("TotalNoOfRecords") + data?.length
          : t("AccountDetails"),
    },
  };

  const getCarousalCards = useMutation(CommonApi.getCarousalCards, {
    onSuccess: (data) => {
      setCardsData(data);
    },
    onError: (error: any) => {
      if (
        error?.error_msg !==
        "Timeout : Your request has been timed out or has been cancelled by the user."
      ) {
        enqueueSnackbar(error?.error_msg, {
          variant: "error",
        });
      }
      setCardsData([]);
    },
  });

  const filteredData =
    data?.filter((item) => {
      if (filterData === "Y" && item?.DEFALUT_VIEW) {
        return item?.DEFALUT_VIEW === "Y";
      }
      return true;
    }) ?? [];

  const getHeaderDtlApi = useMutation(getHeaderDTL, {
    onSuccess: async (data: any, variables: any) => {
      CloseMessageBox();
    },
    onError: async (error: any, variables: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "Somethingwenttowrong",
        icon: "ERROR",
      });
    },
  });

  const getInterestCalculateReport = useMutation(
    getInterestCalculateReportDTL,
    {
      onSuccess: async (data: any, variables: any) => {
        for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
          if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
            await MessageBox({
              messageTitle:
                data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
            await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
            await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "0") {
            getHeaderDtlApi.mutate({ SCREEN_REF: "" });
          }
        }
        CloseMessageBox();
      },
      onError: async (error: any, variables: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
        getHeaderDtlApi.mutate({ SCREEN_REF: "" });
      },
    }
  );
  const getInterestCalculateParaMutation = useMutation(
    getInterestCalculatePara,
    {
      onSuccess: async (data: any, variables: any) => {
        const combinedData = { ...data?.rows?.[0]?.data, ...data?.[0] };
        interestCalculateParaRef.current = [
          ...(interestCalculateParaRef.current || []),
          combinedData,
        ];
        if (data?.[0]?.OPEN_DATE_PARA === "Y") {
          setDateDialog(true);
          trackDialogClass("Retrieve");
        } else if (data?.[0]?.OPEN_DATE_PARA === "N") {
          setSingleAccountInterest(true);
          getInterestCalculateReport.mutate({
            COMP_CD: rowsDataRef?.current?.COMP_CD ?? "",
            BRANCH_CD: rowsDataRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: rowsDataRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: rowsDataRef?.current?.ACCT_CD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
            FROM_DT: data?.[0]?.FROM_DT
              ? format(new Date(data?.[0]?.FROM_DT), "dd/MMM/yyyy")
              : "",
            TO_DT: data?.[0]?.TO_DT
              ? format(new Date(data?.[0]?.TO_DT), "dd/MMM/yyyy")
              : "",
            PARENT_CODE: data?.[0]?.PARENT_CODE ?? "",
            PARENT_TYPE: data?.[0]?.PARENT_TYPE ?? "",
            GD_DATE: authState?.workingDate ?? "",
            SCREEN_REF: "",
          });
        } else if (data?.[0]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE || "ValidationFailed",
            message: data?.[0]?.O_MESSAGE || "Somethingwenttowrong",
            icon: "ERROR",
          });
        }
      },
      onError: async (error: any, variables: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
      },
    }
  );

  const setCurrentAction = useCallback((data) => {
    if (data?.name === "_rowChanged") {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();
      const rowsData = data?.rows?.[0]?.data;
      if (
        Boolean(rowsData) &&
        JSON.stringify(rowsData) !== JSON.stringify(previousRowData?.current)
      ) {
        previousRowData.current = rowsData;
        setRowsData(data?.rows);
        fetchTabsData({
          cacheId: rowsData?.SR_NO,
          reqData: rowsData,
          controllerFinal: controllerRef.current,
        });
        getCarousalCards.mutate({
          reqData: { ...rowsData, PARENT_TYPE: "" },
          controllerFinal: controllerRef.current,
        });
      }
    } else if (data?.name === "viewOpen") {
      setActionMenu((values) =>
        values.map((item) =>
          item.actionName === "viewOpen"
            ? { ...item, actionName: "viewall", actionLabel: t("ViewAll") }
            : item
        )
      );
      setFilterData("Y");
    } else if (data?.name === "viewall") {
      setActionMenu((values) =>
        values.map((item) =>
          item.actionName === "viewall"
            ? { ...item, actionName: "viewOpen", actionLabel: "View Open" }
            : item
        )
      );
      setFilterData("N");
    } else if (data.name === "view-statement") {
      setComponentToShow("ViewStatement");
      setAcctOpen(true);
      setRowsData(data?.rows);
    } else if (data.name === "view-interest") {
      rowsDataRef.current = data?.rows?.[0]?.data;
      setInterestCalReportDTL([]);
      interestCalculateParaRef.current = [];
      getInterestCalculateParaMutation?.mutate({
        A_COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
        A_BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
        A_ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
        A_ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
        A_SCREEN_REF: "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      });
    } else if (data.name === "viewMaster") {
      setComponentToShow("viewMaster");
      setAcctOpen(true);
      setRowsData(data?.rows?.[0]?.data);
    }
  }, []);

  useEffect(() => {
    if (!isViewGrid) {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();
      const data = rowsData?.[0]?.data;

      previousRowData.current = rowsData;
      fetchTabsData({
        cacheId: data?.SR_NO,
        reqData: data,
        controllerFinal: controllerRef.current,
      });
      getCarousalCards.mutate({
        reqData: { ...data, PARENT_TYPE: "" },
        controllerFinal: controllerRef.current,
      });
    }
    if (isShowFilterButton) {
      setActionMenu([
        {
          actionName: "viewall",
          actionLabel: "ViewAll",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "viewMaster",
          actionLabel: "View A/c Master",
          multiple: false,
          rowDoubleClick: false,
        },
        {
          actionName: "view-statement",
          actionLabel: "View Statement/Passbook",
          multiple: false,
          rowDoubleClick: false,
        },
        {
          actionName: "view-interest",
          actionLabel: "View Interest",
          multiple: false,
          rowDoubleClick: false,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (isTabsError) {
      enqueueSnackbar((tabsErorr as any)?.error_msg, {
        variant: "error",
      });
    }
  }, [isTabsError]);

  useEffect(() => {
    return () => {
      clearTabsCache();
      queryClient.removeQueries("getAcctDtlList");
      queryClient.removeQueries("getSIDetailList");
      queryClient.removeQueries("getLienDetailList");
      queryClient.removeQueries("getOWChqList");
      queryClient.removeQueries("getTempList");
      queryClient.removeQueries("getATMList");
      queryClient.removeQueries("getASBAList");
      queryClient.removeQueries("getACH_IWList");
      queryClient.removeQueries("getACH_OWList");
      queryClient.removeQueries("getInstructionList");
      queryClient.removeQueries("getGroupList");
      queryClient.removeQueries("getAPYList");
      queryClient.removeQueries("getAPBSList");
      queryClient.removeQueries("getPMBYList");
      queryClient.removeQueries("getJointDetailsList");
      queryClient.removeQueries("getTodayTransList");
      queryClient.removeQueries("getCheckDetailsList");
      queryClient.removeQueries("getSnapShotList");
      queryClient.removeQueries("getHoldChargeList");
      queryClient.removeQueries("getDocTemplateList");
      queryClient.removeQueries("getStopPayList");
      queryClient.removeQueries("getInsuranceList");
      queryClient.removeQueries("getDisbursementList");
      queryClient.removeQueries("getSubsidyList");
      queryClient.removeQueries("getSearchList");
      queryClient.removeQueries("getLimitList");
      queryClient.removeQueries("getStockList");
    };
  }, []);

  return (
    <>
      <Dialog
        open={true}
        maxWidth={"xl"}
        PaperProps={{
          style: {
            // background: "var(--theme-color4)",
            width: "100%",
            overflow: "auto",
            margin: "0px",
            maxHeight: "95%",
          },
        }}
        onClose={handleClose}
      >
        <DialogTitle sx={{ padding: "10px 10px 2px 10px" }}>
          <AppBar
            position="static"
            sx={{
              background: "var(--theme-color5)",
              margin: "2px",
              width: "auto",
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
                {label ? label : t("Customer360lable")}
              </Typography>
              <div>
                <GradientButton onClick={() => handleClose()}>
                  {t("Close")}
                </GradientButton>
              </div>
            </Toolbar>
          </AppBar>
        </DialogTitle>
        <DialogContent style={{ padding: "0px" }}>
          {/* <Box border={"2px solid gray"} borderRadius={"5px"}> */}
          <DailyTransTabs
            heading={""}
            tabsData={tabsDetails}
            cardsData={cardData}
            reqData={rowsData?.[0]?.data}
            hideCust360Btn={true}
            occupiedHeight={occupiedHeight}
            screenFlag={screenFlag}
          />
          {Boolean(isTabsLoading) || Boolean(getCarousalCards?.isLoading) ? (
            <LinearProgress
              sx={{
                // margin: "4px 32px 0 32px",
                background: "var(--theme-color6)",
                "& .MuiLinearProgress-bar": {
                  background: "var(--theme-color1) !important",
                },
              }}
            />
          ) : null}
          {/* </Box> */}
          {Boolean(isViewGrid) && (
            <Box margin={"2px 10px"}>
              <GridWrapper
                key={
                  `TodaysTransactionTableGrid${isLoading}` +
                  actionMenu +
                  filterData
                }
                finalMetaData={updatedMetadata as GridMetaDataType}
                data={isShowFilterButton ? filteredData : data ?? []}
                setData={() => null}
                enableExport={true}
                actions={actionMenu}
                setAction={setCurrentAction}
                loading={isLoading || isFetching}
                disableMultipleRowSelect={true}
                variant={"standard"}
                defaultSelectedRowId={data?.length > 0 ? data?.[0]?.SR_NO : ""}
                hideFooter={true}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {componentToShow === "ViewStatement" ? (
        <ViewStatement
          rowsData={rowsData}
          open={acctOpen}
          onClose={() => setAcctOpen(false)}
          screenFlag={"ACCT_INQ"}
        />
      ) : componentToShow === "viewMaster" ? (
        <Dialog
          open={acctOpen}
          maxWidth="xl"
          PaperProps={{
            style: {
              width: "100%",
              padding: 10,
            },
          }}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setAcctOpen(false);
            }
          }}
        >
          <AcctMSTProvider>
            <AcctModal
              onClose={() => setAcctOpen(false)}
              asDialog={false}
              rowData={rowsData}
              formmodeState="view"
              fromState="pending-entry"
            />
          </AcctMSTProvider>
        </Dialog>
      ) : null}
      {dateDialog && (
        <DateRetrival
          closeDialog={() => {
            setDateDialog(false);
            trackDialogClass("");
          }}
          open={dateDialog}
          reqData={{
            COMP_CD: rowsDataRef?.current?.COMP_CD ?? "",
            BRANCH_CD: rowsDataRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: rowsDataRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: rowsDataRef?.current?.ACCT_CD ?? "",
            PARENT_CODE:
              getInterestCalculateParaMutation?.data?.[0]?.PARENT_CODE ?? "",
            PARENT_TYPE:
              getInterestCalculateParaMutation?.data?.[0]?.PARENT_TYPE ?? "",
            FROM_DT: getInterestCalculateParaMutation?.data?.[0]?.FROM_DT ?? "",
            TO_DT: getInterestCalculateParaMutation?.data?.[0]?.TO_DT ?? "",
            DISABLE_FROM_DT:
              getInterestCalculateParaMutation?.data?.[0]?.DISABLE_FROM_DT ??
              "",
            DISABLE_TO_DT:
              getInterestCalculateParaMutation?.data?.[0]?.DISABLE_TO_DT ?? "",
          }}
          reportDTL={setInterestCalReportDTL}
          openReport={() => {
            setDateDialog(false);
            setSingleAccountInterest(true);
          }}
        />
      )}

      {singleAccountInterest && (
        <SingleAccountInterestReport
          open={singleAccountInterest}
          date={
            interestCalReportDTL?.[0] ??
            getInterestCalculateParaMutation?.data?.[0]
          }
          reportHeading={
            interestCalReportDTL?.[2] ?? getHeaderDtlApi?.data?.[0]
          }
          reportDetail={
            interestCalReportDTL?.[1] ?? getInterestCalculateReport?.data?.[0]
          }
          acctInfo={{
            BRANCH_CD: rowsDataRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: rowsDataRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: rowsDataRef?.current?.ACCT_CD ?? "",
            PARENT_TYPE:
              getInterestCalculateParaMutation?.data?.[0]?.PARENT_TYPE ?? "",
          }}
          closeDialog={() => {
            setSingleAccountInterest(false);
            trackDialogClass("");
          }}
          isLoader={
            getInterestCalculateReport?.isLoading || getHeaderDtlApi?.isLoading
          }
        />
      )}
    </>
  );
};
