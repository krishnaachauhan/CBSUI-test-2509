import { Box, Paper, Toolbar, Typography } from "@mui/material";
import "../DailyTransaction/TRN002/Trn002.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
  useMemo,
} from "react";
import { useMutation } from "react-query";
import { useSnackbar } from "notistack";

import * as CommonApi from "../DailyTransaction/TRNCommon/api";
import { AuthContext } from "pages_audit/auth";
import {
  queryClient,
  GridWrapper,
  ActionTypes,
  usePopupContext,
  utilFunction,
  ClearCacheProvider,
  Alert,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useTranslation } from "react-i18next";
import { TRN001Context } from "../DailyTransaction/TRN001/Trn001Reducer";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useCacheWithMutation } from "../DailyTransaction/TRNHeaderTabs/cacheMutate";
import {
  confirmScroll,
  getConfirmDataValidation,
} from "../DailyTransaction/TRN002/api";
import { TRN002_TableMetaData } from "../DailyTransaction/TRN002/gridMetadata";
import DailyTransTabs from "../DailyTransaction/TRNHeaderTabs";
import ScrollList from "./scrollList";
import { ScrollDetailsData } from "./api";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";

let action: ActionTypes[] = [
  {
    actionName: "batchConfirm",
    actionLabel: "Retrieve",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "confirm",
    actionLabel: "Confirm",
    actionIcon: "detail",
    multiple: undefined,
    rowDoubleClick: true,
  },
  {
    actionName: "Delete",
    actionLabel: "Remove",
    multiple: undefined,
    rowDoubleClick: false,
  },

  {
    actionName: "calculator",
    actionLabel: "Calculator",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "ScrollConfirm",
    actionLabel: "Confirm",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "ScrollRemove",
    actionLabel: "Remove",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
type Trn002Props = {
  screenFlag?: string;
};
const TransBatchCfmCustom: React.FC<Trn002Props> = () => {
  const { authState } = useContext(AuthContext);
  const { getConfirmValidationCtx } = useContext(TRN001Context);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myGridRef = useRef<any>(null);
  const cardsDataRef = useRef<any>(null);
  const controllerRef = useRef<AbortController>();
  const [dataRow, setDataRow] = useState<any>({});
  const [cardsData, setCardsData] = useState([]);
  const [reqData, setReqData] = useState([]);
  const [gridData, setGridData] = useState<any>([]);
  const [isOpenScrollList, setIsOpenScrollList] = useState(true);
  const isIgnoreScrollConfirmRef = useRef(true);
  const { trackDialogClass } = useDialogContext();
  const [openSignature, setOpenSignature] = useState(false);
  let currentPath = useLocation()?.pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  let remarks = `WRONG ENTRY FROM ${utilFunction
    .getDynamicLabel(useLocation()?.pathname, authState?.menulistdata, true)
    ?.toUpperCase()}`;
  const rowChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastObjRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateMetadata = useMemo(() => {
    const updatedColumns = TRN002_TableMetaData?.columns?.map((item) => {
      if (item?.accessor === "TRAN_TYPE") {
        return { ...item, isVisible: true };
      }
      return item;
    });
    return {
      ...TRN002_TableMetaData,
      columns: updatedColumns,
      gridConfig: {
        ...TRN002_TableMetaData?.gridConfig,
        hideActionBar: true,
        containerHeight: {
          min: "20vh",
          max: "20vh",
        },
      },
    };
  }, [TRN002_TableMetaData]);

  const batchdata: any = useMutation(ScrollDetailsData, {
    onSuccess: (res) => {
      setGridData(res);
    },
  });

  const {
    clearCache: clearTabsCache,
    error: tabsErorr,
    data: tabsDetails,
    setData: setTabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  }: any = useCacheWithMutation(
    "getTabsByParentTypeKeyTrn002",
    CommonApi.getTabsByParentType
  );

  const getConfirmDataValidationS: any = useMutation(getConfirmDataValidation, {
    onSuccess: async (data) => {
      CloseMessageBox();
      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      const returnFlg = await getConfirmValidationCtx({ data, getBtnName });
      if (Boolean(returnFlg)) {
        confirmScrolls.mutate([
          {
            ENTERED_COMP_CD: dataRow?.COMP_CD ?? "",
            ENTERED_BRANCH_CD: dataRow?.ENTERED_BRANCH_CD ?? "",
            TRAN_CD: dataRow?.TRAN_CD ?? "",
            COMP_CD: dataRow?.COMP_CD ?? "",
            BRANCH_CD: dataRow?.BRANCH_CD ?? "",
            ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
            ACCT_CD: dataRow?.ACCT_CD ?? "",
            CONFIRMED: dataRow?.CONFIRMED ?? "",
            TYPE_CD: dataRow?.TYPE_CD ?? "",
            TRN_FLAG: dataRow?.TRN_FLAG ?? "",
            TRN_DT: dataRow?.TRAN_DT ?? "",
            TRAN_BAL: dataRow?.AMOUNT ?? "",
            AMOUNT: dataRow?.AMOUNT ?? "",
            SCREEN_REF: docCD,
          },
        ]);
      }
    },
    onError: () => {
      CloseMessageBox();
    },
  });

  const getCarousalCards = useMutation(CommonApi.getCarousalCards, {
    onSuccess: async (data, { row }) => {
      setCardsData(data);
      const cardData: any = getCardColumnValue(data);
      if (!Boolean(row)) return;
      if (row?.CONFIRMED === "0") {
        const cardDataReq = {
          CUSTOMER_ID: cardData?.CUSTOMER_ID ?? "",
          AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "",
          SHADOW_CL: cardData?.SHADOW_CLEAR ?? "",
          HOLD_BAL: cardData?.HOLD_BAL ?? "",
          LEAN_AMT: cardData?.LIEN_AMT ?? "",
          AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "",
          MIN_BALANCE: cardData?.MIN_BALANCE ?? "",
          CONF_BAL: cardData?.CONF_BAL ?? "",
          TRAN_BAL: cardData?.TRAN_BAL ?? "",
          UNCL_BAL: cardData?.UNCL_BAL ?? "",
          LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "",
          DRAWING_POWER: cardData?.DRAWING_POWER ?? "",
          OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "",
          INST_DUE_DT: cardData?.INST_DUE_DT ?? "",
          OP_DATE: cardData?.OP_DATE ?? "",
          STATUS: cardData?.STATUS ?? "",
        };
        getConfirmDataValidationS?.mutate({ ...row, ...cardDataReq });
      } else {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: "RecordAlredyConfirmed",
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {
      setCardsData([]);
    },
  });

  const confirmScrolls: any = useMutation(confirmScroll, {
    onSuccess: () => {
      setIsOpenScrollList(true);
      setGridData([]);
      setCardsData([]);
      enqueueSnackbar(t("confirmMsg"), {
        variant: "success",
      });
      CloseMessageBox();
    },
    onError: () => {
      CloseMessageBox();
    },
  });

  const deleteByScrollNo = useMutation(CommonApi.deleteScrollByScrollNo, {
    onSuccess: async (data: any, varieble: any) => {
      enqueueSnackbar(t("RecordsRemovedMsg"), {
        variant: "success",
      });
      setIsOpenScrollList(true);
      setGridData([]);
      setCardsData([]);
      CloseMessageBox();
    },
    onError: (error: any) => {
      CloseMessageBox();
    },
  });

  useEffect(() => {
    if (cardsData?.length > 0) {
      cardsDataRef.current = cardsData;
    }
  }, [cardsData]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F9" && Object.keys(dataRow || {}).length > 0) {
        setOpenSignature(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dataRow]);

  const getCardColumnValue = useCallback((cards) => {
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
      "CUSTOMER_ID",
      "INST_DUE_DT",
      "OP_DATE",
      "STATUS",
      "SHADOW_CLEAR",
    ];

    const cardValues = keys?.reduce((acc, key) => {
      const item: any = cards?.find((entry: any) => entry?.COL_NAME === key);
      acc[key] = item?.COL_VALUE;
      return acc;
    }, {});
    return cardValues;
  }, []);

  const setCurrentAction = useCallback(async (data) => {
    let row = data?.rows[0]?.data ?? {};
    setDataRow(row);
    if (data?.name === "_rowChanged") {
      let obj: any = {
        COMP_CD: row?.COMP_CD ?? "",
        ACCT_TYPE: row?.ACCT_TYPE ?? "",
        ACCT_CD: row?.ACCT_CD ?? "",
        PARENT_TYPE: row?.PARENT_TYPE ?? "",
        PARENT_CODE: row?.PARENT_CODE ?? "",
        BRANCH_CD: row?.BRANCH_CD ?? "",
      };
      setReqData(obj);
      let reqData = {
        COMP_CD: obj?.COMP_CD ?? "",
        ACCT_TYPE: obj?.ACCT_TYPE ?? "",
        BRANCH_CD: obj?.BRANCH_CD ?? "",
      };
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const isSameObj =
        lastObjRef.current &&
        Object.keys(obj).every((key) => obj[key] === lastObjRef.current[key]);

      // Create a new AbortController
      controllerRef.current = new AbortController();
      fetchTabsData({
        cacheId: reqData?.ACCT_TYPE,
        reqData: reqData,
        controllerFinal: controllerRef.current,
      });

      if (!isSameObj) {
        lastObjRef.current = obj;
        // Debounce API call
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          getCarousalCards.mutate({
            reqData: obj,
            controllerFinal: controllerRef.current,
          });
        }, 1000); // 1000ms debounce
      }
    }

    if (data?.name === "batchConfirm") {
      setIsOpenScrollList(true);
    }
    // Reset lastObjRef after 30 seconds of inactivity
    if (rowChangeTimeoutRef.current) {
      clearTimeout(rowChangeTimeoutRef.current);
    }
    rowChangeTimeoutRef.current = setTimeout(() => {
      lastObjRef.current = null;
    }, 30000);

    if (data?.name === "calculator") {
      window.location.href = "Calculator:///";
    }

    if (data?.name === "ScrollRemove") {
      let result = myGridRef?.current?.cleanData?.();
      handleDeletByScroll(result?.[0]?.SCROLL1, result);
    }
    if (data?.name === "ScrollConfirm") {
      let result = myGridRef?.current?.cleanData?.();
      handleConfirmByScroll(result?.[0]?.SCROLL1, result);
    }
  }, []);

  const handleConfirmByScroll = async (scrollNo, filteredGridData) => {
    isIgnoreScrollConfirmRef.current = true;
    if (!Boolean(scrollNo)) {
    } else {
      trackDialogClass("main");
      if (filteredGridData?.length <= 0) return;

      const msgBoxRes = await MessageBox({
        messageTitle: "Confirmation",
        message: `Are you sure you want to confirm ${
          filteredGridData?.length ?? ""
        } records?`,
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });

      if (msgBoxRes === "Yes") {
        for (let i = 0; i < filteredGridData.length; i++) {
          if (!Boolean(isIgnoreScrollConfirmRef?.current)) break;
          let row = {
            ...filteredGridData[i],
            IS_LAST: Boolean(i === filteredGridData.length - 1),
          };

          let obj = {
            COMP_CD: row?.COMP_CD ?? "",
            ACCT_TYPE: row?.ACCT_TYPE ?? "",
            ACCT_CD: row?.ACCT_CD ?? "",
            PARENT_TYPE: row?.PARENT_TYPE ?? "",
            PARENT_CODE: row?.PARENT_CODE ?? "",
            BRANCH_CD: row?.BRANCH_CD ?? "",
          };

          try {
            // Wait for getCarousalCards API to complete
            const data = await CommonApi.getCarousalCards({
              reqData: obj,
              controllerFinal: controllerRef.current,
              row,
            });

            // Extract relevant data from response
            if (data?.length > 0) {
              setCardsData(data);
              const cardData: any = getCardColumnValue(data);
              if (row?.CONFIRMED === "0") {
                const cardDataReq = {
                  CUSTOMER_ID: cardData?.CUSTOMER_ID ?? "",
                  AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "",
                  SHADOW_CL: cardData?.SHADOW_CLEAR ?? "",
                  HOLD_BAL: cardData?.HOLD_BAL ?? "",
                  LEAN_AMT: cardData?.LIEN_AMT ?? "",
                  AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "",
                  MIN_BALANCE: cardData?.MIN_BALANCE ?? "",
                  CONF_BAL: cardData?.CONF_BAL ?? "",
                  TRAN_BAL: cardData?.TRAN_BAL ?? "",
                  UNCL_BAL: cardData?.UNCL_BAL ?? "",
                  LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "",
                  DRAWING_POWER: cardData?.DRAWING_POWER ?? "",
                  OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "",
                  INST_DUE_DT: cardData?.INST_DUE_DT ?? "",
                  OP_DATE: cardData?.OP_DATE ?? "",
                  STATUS: cardData?.STATUS ?? "",
                };
                const ValidateMessage = await getConfirmDataValidation({
                  ...row,
                  ...cardDataReq,
                });
                for (let i = 0; i < ValidateMessage?.length; i++) {
                  if (ValidateMessage?.[i]?.O_COLUMN_NM === "SKIP") {
                    continue;
                  }
                  if (ValidateMessage?.[i]?.O_STATUS === "999") {
                    await MessageBox({
                      messageTitle:
                        ValidateMessage?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                      message: ValidateMessage?.[i]?.O_MESSAGE ?? "",
                      icon: "ERROR",
                    });
                    isIgnoreScrollConfirmRef.current = false;
                    break;
                  } else if (ValidateMessage?.[i]?.O_STATUS === "99") {
                    const btnName = await MessageBox({
                      messageTitle:
                        ValidateMessage?.[i]?.O_MSG_TITLE ?? "Confirmation",
                      message: ValidateMessage?.[i]?.O_MESSAGE ?? "",
                      buttonNames: ["Yes", "No"],
                      defFocusBtnName: "Yes",
                      icon: "CONFIRM",
                    });
                    if (btnName === "No") {
                      isIgnoreScrollConfirmRef.current = false;
                      break;
                    }
                  } else if (ValidateMessage?.[i]?.O_STATUS === "9") {
                    await MessageBox({
                      messageTitle:
                        ValidateMessage?.[i]?.O_MSG_TITLE ?? "Alert",
                      message: ValidateMessage?.[i]?.O_MESSAGE ?? "",
                      icon: "WARNING",
                    });
                  } else if (ValidateMessage?.[i]?.O_STATUS === "0") {
                    isIgnoreScrollConfirmRef.current = true;
                    if (Boolean(row?.IS_LAST)) {
                      const result = filteredGridData?.filter(
                        (item: any) =>
                          item?.SCROLL1?.toString() ===
                            row?.SCROLL1?.toString() &&
                          (item?.TYPE_CD?.trim() === "3" ||
                            item?.TYPE_CD?.trim() === "6")
                      );
                      const TotalCredit = result
                        ?.reduce((acc, item) => {
                          const trimmedTypeCd = item?.TYPE_CD?.trim();
                          return trimmedTypeCd === "3"
                            ? acc + Number(item?.AMOUNT || 0)
                            : acc;
                        }, 0)
                        ?.toString();
                      const TotalDebit = result
                        ?.reduce((acc, item) => {
                          const trimmedTypeCd = item?.TYPE_CD?.trim();
                          return trimmedTypeCd === "6"
                            ? acc + Number(item?.AMOUNT || 0)
                            : acc;
                        }, 0)
                        ?.toString();
                      let tranBal;
                      if (TotalCredit > 0 && TotalDebit > 0) {
                        tranBal =
                          TotalCredit < TotalDebit ? TotalCredit : TotalDebit;
                      } else if (TotalCredit === 0) {
                        tranBal = TotalDebit;
                      } else if (TotalDebit === 0) {
                        tranBal = TotalCredit;
                      }
                      const mappedData = result?.map((item) => {
                        return {
                          ENTERED_COMP_CD: item?.COMP_CD ?? "",
                          ENTERED_BRANCH_CD: item?.ENTERED_BRANCH_CD ?? "",
                          TRAN_CD: item?.TRAN_CD ?? "",
                          COMP_CD: item?.COMP_CD ?? "",
                          BRANCH_CD: item?.BRANCH_CD ?? "",
                          ACCT_TYPE: item?.ACCT_TYPE ?? "",
                          ACCT_CD: item?.ACCT_CD ?? "",
                          CONFIRMED: item?.CONFIRMED ?? "",
                          TYPE_CD: item?.TYPE_CD ?? "",
                          TRN_FLAG: item?.TRN_FLAG ?? "",
                          TRN_DT: item?.TRAN_DT ?? "",
                          TRAN_BAL: tranBal ?? "",
                          AMOUNT: item?.AMOUNT ?? "",
                          SCREEN_REF: docCD,
                        };
                      });
                      confirmScrolls.mutate(mappedData);
                    }
                  }
                }
              } else {
                await MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "RecordAlredyConfirmed",
                  icon: "ERROR",
                });
              }
            }
          } catch (error) {
            console.error("Error in API calls", error);
          }
        }
      } else if (msgBoxRes === "No") {
        CloseMessageBox();
      }
    }
  };

  const handleDeletByScroll = async (scrollNo, filteredGridData) => {
    trackDialogClass("main");
    if (filteredGridData?.length <= 0) return;
    const msgBoxRes = await MessageBox({
      messageTitle: "Confirmation",
      message: `Are you sure you want to remove ${
        filteredGridData?.length ?? ""
      } records?`,
      defFocusBtnName: "Yes",
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });

    if (msgBoxRes === "Yes") {
      let reqPara = {
        COMP_CD: authState.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        SCROLL_NO: filteredGridData[0]?.SCROLL1 ?? "",
        USER_DEF_REMARKS: remarks ?? "",
        ACCT_TYPE: filteredGridData[0]?.ACCT_TYPE ?? "",
        ACCT_CD: filteredGridData[0]?.ACCT_CD ?? "",
        TRAN_AMOUNT: filteredGridData[0]?.AMOUNT ?? "",
        ENTERED_COMP_CD: filteredGridData[0]?.COMP_CD ?? "",
        ENTERED_BRANCH_CD: filteredGridData[0]?.ENTERED_BRANCH_CD ?? "",
        ACTIVITY_TYPE: "DAILY TRANSACTION CONFIRMATION",
        TRAN_DT: filteredGridData[0]?.TRAN_DT ?? "",
        CONFIRM_FLAG: filteredGridData[0]?.CONFIRMED ?? "",
        CONFIRMED: filteredGridData[0]?.CONFIRMED ?? "",
      };
      deleteByScrollNo?.mutate(reqPara);
    } else if (msgBoxRes === "No") {
      CloseMessageBox();
    }
  };

  useEffect(() => {
    const queries = [
      "getSIDetailList",
      "getLienDetailList",
      "getOWChqList",
      "getTempList",
      "getATMList",
      "getASBAList",
      "getACH_IWList",
      "getACH_OWList",
      "getInstructionList",
      "getGroupList",
      "getAPYList",
      "getAPBSList",
      "getPMBYList",
      "getJointDetailsList",
      "getTodayTransList",
      "getCheckDetailsList",
      "getSnapShotList",
      "getHoldChargeList",
      "getDocTemplateList",
      "getStopPayList",
      "getInsuranceList",
      "getDisbursementList",
      "getSubsidyList",
      "getSearchList",
      "getLimitList",
      "getStockList",
      "getTrnListF2",
    ];
    return () => {
      clearTabsCache();
      queries?.forEach((query) => queryClient?.removeQueries(query));
    };
  }, [queryClient, docCD]);

  const headingWithButton = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        position: "sticky",
        top: 0,
        background: "var(--theme-color5)",
        margin: "2px",
        width: "auto",
        marginBottom: "10px",
        height: "3vh",
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
          {utilFunction?.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          )}
        </Typography>
      </Toolbar>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "87vh",
        overflow: "auto",
      }}
    >
      <>
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--theme-color5)",
            padding: "4px 3px 0 3px",
            margin: "0 10px 0 10px",
            boxShadow:
              "rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px",
          }}
        >
          {headingWithButton}
        </div>
        <DailyTransTabs
          //@ts-ignore
          heading={undefined}
          tabsData={tabsDetails}
          cardsData={cardsData}
          reqData={reqData}
          occupiedHeight={{ min: "620px", max: "620px" }}
          screenFlag={"TRN/002"}
        />
        <Paper sx={{ margin: "8px", padding: "8px" }}>
          {getCarousalCards?.isError ||
          getConfirmDataValidationS?.isError ||
          batchdata?.isError ||
          confirmScrolls?.isError ||
          deleteByScrollNo?.isError ||
          isTabsError ? (
            <div style={{ width: "100%", paddingTop: "10px" }}>
              <Alert
                severity={"error"}
                errorMsg={
                  (getCarousalCards?.error?.error_msg ||
                    deleteByScrollNo?.error?.error_msg ||
                    confirmScrolls?.error?.error_msg ||
                    getConfirmDataValidationS?.error?.error_msg ||
                    batchdata?.error?.error_msg ||
                    tabsErorr?.error_msg) ??
                  "Error"
                }
                errorDetail={
                  (getCarousalCards?.error?.error_detail ||
                    deleteByScrollNo?.error?.error_detail ||
                    confirmScrolls?.error?.error_detail ||
                    getConfirmDataValidationS?.error?.error_detail ||
                    batchdata?.error?.error_detail ||
                    tabsErorr?.error_detail) ??
                  ""
                }
              />
            </div>
          ) : null}

          <Box
            sx={{
              "&>.MuiPaper-root .MuiTableContainer-root .MuiTable-root .MuiTableBody-root .MuiTableRow-root.Mui-selected":
                {
                  border: "2px solid #000 !important",
                },
            }}
            className="ENTRIES"
          >
            <GridWrapper
              key={`trasferBatchCnf ` + gridData}
              finalMetaData={updateMetadata}
              data={gridData ?? []}
              setData={setGridData}
              loading={batchdata?.isLoading || Boolean(isTabsLoading)}
              ref={myGridRef}
              actions={action}
              setAction={setCurrentAction}
              disableMultipleRowSelect={true}
              defaultSelectedRowId={
                gridData?.length > 0 ? gridData?.[0]?.TRAN_CD : ""
              }
              headerToolbarStyle={{
                minHeight: "40px !important",
              }}
            />
          </Box>
        </Paper>
        <>
          {isOpenScrollList ? (
            <ScrollList
              setIsOpenScrollList={setIsOpenScrollList}
              handleDeletByScroll={handleDeletByScroll}
              batchdata={batchdata}
            />
          ) : null}
          {openSignature ? (
            <PhotoSignWithHistory
              data={{
                COMP_CD: dataRow?.COMP_CD ?? "",
                BRANCH_CD: dataRow?.BRANCH_CD ?? "",
                ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
                ACCT_CD: dataRow?.ACCT_CD ?? "",
              }}
              onClose={() => setOpenSignature(false)}
              screenRef={docCD}
            />
          ) : null}
        </>
      </>
    </div>
  );
};
export const TransferBatchCfm: React.FC<Trn002Props> = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <TransBatchCfmCustom screenFlag={"screenFlag"} />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
