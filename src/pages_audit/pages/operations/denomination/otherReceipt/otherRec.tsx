import {
  ActionTypes,
  Alert,
  formatCurrency,
  getCurrencySymbol,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
  usePropertiesConfigContext,
  utilFunction,
} from "@acuteinfo/common-base";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import {
  Fragment,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { AuthContext } from "pages_audit/auth";
import { otherReceiptMetadata } from "./metadata";
import DailyTransTabs from "../../DailyTransaction/TRNHeaderTabs";
import { useLocation } from "react-router-dom";
import { useCacheWithMutation } from "../../DailyTransaction/TRNHeaderTabs/cacheMutate";
import * as CommonAPI from "../api";
import { format, parse } from "date-fns";
import { Box, Paper } from "@mui/material";
import TellerDenoTableCalc from "../tellerTransaction/singleTypeTable/tellerDenoTableCalc";
import DualTableCalc from "../tellerTransaction/dualTypeTable/dualTableCalc";
import { t } from "i18next";
import { cloneDeep } from "lodash";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
const OtherReceipt = ({ screenFlag, setCloseOthRec, parameter }) => {
  const rowDataRef = useRef<any>([]);
  const [cardTabsReq, setCardTabsReq] = useState({});
  const [cardDetails, setCardDetails] = useState([]);
  const [openDeno, setOpenDeno] = useState(false);
  const [denoData, setDenoData] = useState(false);
  const [datas, setDatas] = useState<any>([]);
  const [singleDenoAction, setSingleDenoAction] = useState<any>([]);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const controllerRef = useRef<AbortController>();
  const totalAmountRef = useRef<any>(0);
  const currentPath = useLocation()?.pathname;
  const customParameter = usePropertiesConfigContext();
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  const { dynamicAmountSymbol, currencyFormat, decimalCount } = customParameter;
  const {
    clearCache: clearTabsCache,
    error: tabsErorr,
    data: tabsDetails,
    setData: setTabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  }: any = useCacheWithMutation(
    "otherReceiptTabs",
    CommonAPI.getTabsByParentType
  );

  const actions: ActionTypes[] = [
    {
      actionName: "denomination",
      actionLabel: "Denomination",
      multiple: true,
      rowDoubleClick: screenFlag === "SINGLEOTHREC" ? true : false,
      alwaysAvailable: screenFlag === "SINGLEOTHREC" ? true : false,
    },
    {
      actionName: "NormalReceipt",
      actionLabel: "NormalReceipt",
      multiple: undefined,
      rowDoubleClick: undefined,
      alwaysAvailable: screenFlag !== "SINGLEOTHREC" ? true : false,
    },
  ];

  const otherRecGridReq = {
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: authState?.user?.branchCode ?? "",
    WORKING_DATE: authState?.workingDate ?? "",
  };

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["otherReceiptData", otherRecGridReq],
    () => API?.getOtherReceipt(otherRecGridReq),
    {
      onSuccess: (data) => {
        setDatas(data);
        setTabsDetails([]);
        setCardDetails([]);
      },
    }
  );

  const getCarousalCards = useMutation(CommonAPI.getCarousalCards, {
    onSuccess: (data) => {
      setCardDetails(data);
    },
    onError: (error: any) => {
      setCardDetails([]);
    },
  });

  const getDenoData: any = useMutation(CommonAPI.CashReceiptEntrysData, {
    onSuccess: (response: any, variables?: any) => {
      CloseMessageBox();
      setOpenDeno(true);
      if (response?.length > 0) {
        setDenoData(response);
      }
      trackDialogClass("main");
    },
    onError: (error: any, variables?: any) => {
      CloseMessageBox();
      trackDialogClass("main");
    },
  });

  const setCurrentAction = useCallback(async (data) => {
    let row = data?.rows[0]?.data;
    rowDataRef.current = row;
    if (data?.name === "_rowChanged") {
      let obj: any = {
        COMP_CD: row?.COMP_CD,
        ACCT_TYPE: row?.ACCT_TYPE,
        ACCT_CD: row?.ACCT_CD,
        PARENT_TYPE: row?.PARENT_TYPE ?? "",
        PARENT_CODE: row?.PARENT_CODE ?? "",
        BRANCH_CD: row?.BRANCH_CD,
      };
      setCardTabsReq(obj);
      let reqData = {
        COMP_CD: obj?.COMP_CD,
        ACCT_TYPE: obj?.ACCT_TYPE,
        BRANCH_CD: obj?.BRANCH_CD,
      };
      if (controllerRef?.current) {
        controllerRef?.current?.abort();
      }
      // Create a new AbortController
      controllerRef.current = new AbortController();
      fetchTabsData({
        cacheId: reqData?.ACCT_TYPE,
        reqData: reqData,
        controllerFinal: controllerRef?.current,
      });
      getCarousalCards.mutate({
        reqData: obj,
        controllerFinal: controllerRef?.current,
      });
    } else if (data?.name === "denomination") {
      rowDataRef.current = data?.rows?.map((item) => item?.data);
      if (data?.rows?.length <= 0) return;
      const totalAmount = data?.rows?.reduce((accum, crRow) => {
        return Number(accum) + Number(crRow?.data?.AMOUNT);
      }, 0);

      totalAmountRef.current = totalAmount;
      const msgBoxRes = await MessageBox({
        messageTitle: "Confirmation",
        message: "ProceedGen",
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (msgBoxRes === "Yes") {
        const formattedDate = format(
          parse(authState?.workingDate, "dd/MMM/yyyy", new Date()),
          "dd/MMM/yyyy"
        )?.toUpperCase();
        getDenoData?.mutate({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          USER_NAME: authState?.user?.id ?? "",
          TRAN_DT: formattedDate,
        });
      }
    } else if (data?.name === "NormalReceipt") {
      setCloseOthRec();
    }
  }, []);

  const onSaveData = (value) => {
    setOpenDeno(value);
    refetch();
  };

  const denoTableClose = () => {
    setOpenDeno(false);
    trackDialogClass("main");
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["otherReceiptData", otherRecGridReq]);
    };
  }, []);

  const getFomattedCurrency = (values) => {
    const formatedValue = formatCurrency(
      parseFloat(values || "0"),
      getCurrencySymbol(dynamicAmountSymbol),
      currencyFormat,
      decimalCount
    );
    return formatedValue;
  };

  const headingWithButton = (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {utilFunction?.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        true
      )}
      <Box>
        <GradientButton
          onClick={() => {
            setCloseOthRec();
          }}
        >
          {t("NormalReceipt")}
        </GradientButton>
      </Box>
    </Box>
  );
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(otherReceiptMetadata);
    if (metadata?.gridConfig) {
      metadata.gridConfig.allowRowSelection =
        screenFlag === "MULTIOTHREC" ? true : false;
      if (screenFlag !== "SINGLEOTHREC") {
        metadata.gridConfig.gridLabel = `${
          utilFunction?.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          ) ?? ""
        } || ${t("OtherReceiptTransactions")}`;
        metadata.gridConfig.containerHeight = {
          min: "55vh",
          max: "55vh",
        };
      }
    }
    return metadata;
  }, [datas]);

  return (
    <>
      {screenFlag === "SINGLEOTHREC" ? (
        <DailyTransTabs
          heading={headingWithButton as any}
          tabsData={tabsDetails}
          cardsData={cardDetails}
          reqData={cardTabsReq}
          screenFlag="OTHERREC"
        />
      ) : null}
      {isError ? (
        <Fragment>
          <Alert
            severity={error?.severity ?? "error"}
            errorMsg={error?.error_msg ?? "Error"}
            errorDetail={error?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      {getCarousalCards?.isError &&
      (!getCarousalCards?.error?.error_msg?.includes("Timeout") ||
        !getCarousalCards?.error?.error_msg?.includes("AbortError")) ? (
        <Fragment>
          <Alert
            severity={getCarousalCards?.error?.severity ?? "error"}
            errorMsg={getCarousalCards?.error?.error_msg ?? "Error"}
            errorDetail={getCarousalCards?.error?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      {getDenoData?.isError ? (
        <Fragment>
          <Alert
            severity={getDenoData?.error?.severity ?? "error"}
            errorMsg={getDenoData?.error?.error_msg ?? "Error"}
            errorDetail={getDenoData?.error?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      {isTabsError ? (
        <Fragment>
          <Alert
            severity={tabsErorr?.severity ?? "error"}
            errorMsg={tabsErorr?.error_msg ?? "Error"}
            errorDetail={tabsErorr?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      <Paper sx={{ margin: "10px" }}>
        <GridWrapper
          key={`otherReceipt` + isLoading + actions + singleDenoAction}
          finalMetaData={memoizedMetadata as GridMetaDataType}
          data={datas ?? []}
          loading={
            isLoading ||
            isFetching ||
            isTabsLoading ||
            getCarousalCards?.isLoading
          }
          setData={(data) => {
            setDatas(data);
          }}
          actions={actions}
          setAction={setCurrentAction}
          hideHeader={false}
          refetchData={() => refetch()}
          disableMultipleRowSelect={screenFlag === "SINGLEOTHREC"}
          enableExport={true}
          defaultSelectedRowId={
            screenFlag === "SINGLEOTHREC" && data?.length > 0
              ? data?.[0]?.TRAN_CD
              : ""
          }
        />
      </Paper>
      {Boolean(openDeno) && Boolean(parameter?.DENO_WINDOW !== "Y") ? (
        <div className="denoTable">
          <TellerDenoTableCalc
            displayTable={openDeno}
            setOpenDenoTable={onSaveData}
            formData={rowDataRef?.current}
            data={denoData ?? []}
            onCloseTable={denoTableClose}
            initRemainExcess={
              screenFlag === "SINGLEOTHREC"
                ? rowDataRef?.current?.[0]?.AMOUNT ?? "0"
                : totalAmountRef?.current?.toString() ?? "0"
            }
            gridLable={
              screenFlag === "SINGLEOTHREC"
                ? t("CashReceiptFullLable", {
                    remarks: rowDataRef?.current?.[0]?.REMARKS ?? "",
                    bank: rowDataRef?.current?.[0]?.COMP_CD?.trim() ?? "",
                    branch: rowDataRef?.current?.[0]?.BRANCH_CD?.trim() ?? "",
                    type: rowDataRef?.current?.[0]?.ACCT_TYPE?.trim() ?? "",
                    accountNo: rowDataRef?.current?.[0]?.ACCT_CD?.trim() ?? "",
                    name: rowDataRef?.current?.[0]?.ACCT_NM ?? "",
                    amount: getFomattedCurrency(
                      rowDataRef?.current?.[0]?.AMOUNT ?? "0"
                    ),
                  })
                : t("MultipleReceipt", {
                    totalAmount: getFomattedCurrency(
                      totalAmountRef?.current?.toString() ?? "0"
                    ),
                  })
            }
            screenFlag={screenFlag}
            typeCode={"1"}
            resetForm={() => {}}
            denoValidPara={rowDataRef?.current?.[0]?.DENO_VALIDATION}
          />
        </div>
      ) : null}
      {Boolean(openDeno) && Boolean(parameter?.DENO_WINDOW === "Y") ? (
        <div className="denoTable">
          <DualTableCalc
            data={denoData ?? []}
            displayTableDual={openDeno}
            formData={rowDataRef?.current}
            initRemainExcess={
              screenFlag === "SINGLEOTHREC"
                ? rowDataRef?.current?.[0]?.AMOUNT ?? "0"
                : totalAmountRef?.current?.toString() ?? "0"
            }
            gridLable={
              screenFlag === "SINGLEOTHREC"
                ? t("CashReceiptFullLable", {
                    remarks: rowDataRef?.current?.[0]?.REMARKS ?? "",
                    bank: rowDataRef?.current?.[0]?.COMP_CD?.trim() ?? "",
                    branch: rowDataRef?.current?.[0]?.BRANCH_CD?.trim() ?? "",
                    type: rowDataRef?.current?.[0]?.ACCT_TYPE?.trim() ?? "",
                    accountNo: rowDataRef?.current?.[0]?.ACCT_CD?.trim() ?? "",
                    name: rowDataRef?.current?.[0]?.ACCT_NM ?? "",
                    amount: getFomattedCurrency(
                      rowDataRef?.current?.[0]?.AMOUNT ?? "0"
                    ),
                  })
                : t("MultipleReceipt", {
                    totalAmount: getFomattedCurrency(
                      totalAmountRef?.current?.toString() ?? "0"
                    ),
                  })
            }
            onCloseTable={denoTableClose}
            screenFlag={screenFlag}
            typeCode={"1"}
            setOpenDenoTable={onSaveData}
            resetForm={() => {}}
            denoValidPara={rowDataRef?.current?.[0]?.DENO_VALIDATION}
          />
        </div>
      ) : null}
    </>
  );
};
export default OtherReceipt;
