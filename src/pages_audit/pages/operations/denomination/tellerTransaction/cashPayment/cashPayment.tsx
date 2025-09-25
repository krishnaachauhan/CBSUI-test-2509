import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
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
import { AuthContext } from "pages_audit/auth";
import DailyTransTabs from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs";
import { useCacheWithMutation } from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/cacheMutate";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import * as API from "./api";
import * as CommonAPI from "../../api";
import { cashPaymentMetadata } from "./metadata";
import { useMutation, useQuery } from "react-query";
import { Box } from "@mui/material";
import { format, parse } from "date-fns";
import TellerDenoTableCalc from "../singleTypeTable/tellerDenoTableCalc";
import DualTableCalc from "../dualTypeTable/dualTableCalc";
import { t } from "i18next";
import { cloneDeep } from "lodash";
import {
  DialogProvider,
  useDialogContext,
} from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import { getdocCD } from "components/utilFunction/function";

interface cashPaymentTypes {
  screenFlag: string;
  setNormalEntry?: any;
}

const CashPaymentMain = ({ screenFlag, setNormalEntry }: cashPaymentTypes) => {
  const [cardDetails, setCardDetails] = useState([]);
  const [cardTabsReq, setCardTabsReq] = useState({});
  const [openDeno, setOpenDeno] = useState(false);
  const [denoData, setDenoData] = useState([]);
  const rowDataRef = useRef<any>([]);
  const [datas, setDatas] = useState<any>([]);
  const controllerRef = useRef<AbortController>();
  const currentPath = useLocation()?.pathname;
  const totalAmountRef = useRef<any>(0);
  const { authState } = useContext(AuthContext);
  const customParameter = usePropertiesConfigContext();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation()?.pathname, authState?.menulistdata);
  const {
    clearCache: clearTabsCache,
    error: tabsErorr,
    data: tabsDetails,
    setData: setTabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  }: any = useCacheWithMutation(
    "cashPaymentEntry",
    CommonAPI.getTabsByParentType
  );
  const {
    data: fetchParameter,
    isLoading: ParameterIsLoading,
    isFetching: ParameterIsFetching,
    isError: ParameterIsError,
    error: ParameterError,
    refetch,
  } = useQuery<any, any>(
    ["getParameters", authState?.user?.branchCode ?? ""],
    () =>
      API.getParameters({
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        ENT_COMP_CD: authState?.companyID ?? "",
        SCREEN_REF: docCD ?? "",
        USERROLE: authState?.role ?? "",
      })
  );
  const { dynamicAmountSymbol, currencyFormat, decimalCount } = customParameter;

  const actions: ActionTypes[] = [
    {
      actionName: "denomination",
      actionLabel: "Denomination",
      multiple: true,
      rowDoubleClick: screenFlag === "SINGLEPAY" ? true : false,
      alwaysAvailable: screenFlag !== "SINGLEPAY" ? true : false,
    },
    {
      actionName: "NormalPayment",
      actionLabel: "NormalPayment",
      multiple: undefined,
      rowDoubleClick: undefined,
      alwaysAvailable: screenFlag !== "SINGLEPAY" ? true : false,
    },
  ];

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchMainGrid,
    error,
    isError,
  } = useQuery<any, any>(
    [
      "cashPaymentEntry",
      {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
      },
    ],
    () =>
      API?.getCashPaymentData({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
      })
  );

  useEffect(() => {
    setDatas(data);
  }, [data]);

  const getDenoData: any = useMutation(CommonAPI.CashReceiptEntrysData, {
    onSuccess: (response: any, variables?: any) => {
      CloseMessageBox();
      setOpenDeno(true);
      trackDialogClass("denoTable");
      if (response?.length > 0) {
        setDenoData(response);
      }
    },
    onError: (error: any, variables?: any) => {
      CloseMessageBox();
    },
  });

  const getCarousalCards = useMutation(CommonAPI.getCarousalCards, {
    onSuccess: (data) => {
      setCardDetails(data);
    },
    onError: (error: any) => {
      setCardDetails([]);
    },
  });

  const setCurrentAction = useCallback(async (data) => {
    let row = data.rows[0]?.data;
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
      if (controllerRef.current) {
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
    } else if (data?.name === "NormalPayment") {
      setNormalEntry(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "cashPaymentEntry",
        {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
        },
      ]);
      queryClient.removeQueries([
        "getParameters",
        authState?.user?.branchCode ?? "",
      ]);
    };
  }, []);

  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const denoTableClose = () => {
    setOpenDeno(false);
    trackDialogClass("main");
  };

  const onSaveData = (value) => {
    setOpenDeno(value);
    trackDialogClass("main");
    refetchMainGrid();
  };

  const getFomattedCurrency = (values) => {
    const formatedValue = formatCurrency(
      parseFloat(values || "0"),
      getCurrencySymbol(dynamicAmountSymbol),
      currencyFormat,
      decimalCount
    );
    return formatedValue;
  };

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(cashPaymentMetadata);
    if (metadata?.gridConfig) {
      metadata.gridConfig.allowRowSelection =
        screenFlag === "MULTIPAY" ? true : false;
      metadata.gridConfig.hideActionBar = screenFlag === "SINGLEPAY";
      if (screenFlag !== "SINGLEPAY") {
        metadata.gridConfig.gridLabel = `${
          utilFunction?.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          ) ?? ""
        } || ${t("PaymentTrnasactions")}`;
        metadata.gridConfig.containerHeight = {
          min: "55vh",
          max: "55vh",
        };
      }
    }
    return metadata;
  }, [datas, screenFlag, cashPaymentMetadata]);
  const [dataClass, setDataClass] = useState("");

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
    <>
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
      {tabsErorr ? (
        <Fragment>
          <Alert
            severity={tabsErorr?.severity ?? "error"}
            errorMsg={tabsErorr?.error_msg ?? "Error"}
            errorDetail={tabsErorr?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      {ParameterError ? (
        <Fragment>
          <Alert
            severity={ParameterError?.severity ?? "error"}
            errorMsg={ParameterError?.error_msg ?? "Error"}
            errorDetail={ParameterError?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      {screenFlag === "SINGLEPAY" ? (
        <DailyTransTabs
          heading={
            utilFunction?.getDynamicLabel(
              currentPath,
              authState?.menulistdata,
              true
            ) ?? ""
          }
          tabsData={tabsDetails}
          cardsData={cardDetails}
          reqData={cardTabsReq}
          screenFlag="CASHPAY"
        />
      ) : null}
      <Box margin={"10px"}>
        <GridWrapper
          key={`cashPaymentEntry` + isLoading + actions}
          finalMetaData={memoizedMetadata as GridMetaDataType}
          data={datas ?? []}
          loading={
            isLoading ||
            isFetching ||
            isTabsLoading ||
            getCarousalCards?.isLoading ||
            ParameterIsLoading ||
            ParameterIsFetching
          }
          setData={(data) => {
            setDatas(data);
          }}
          actions={actions}
          setAction={setCurrentAction}
          hideHeader={false}
          refetchData={() => refetchMainGrid()}
          disableMultipleRowSelect={screenFlag === "SINGLEPAY"}
          defaultSelectedRowId={
            screenFlag === "SINGLEPAY" && data?.length > 0
              ? data?.[0]?.TRAN_CD
              : ""
          }
        />
      </Box>

      {Boolean(openDeno) &&
      Boolean(fetchParameter?.[0]?.DENO_WINDOW !== "Y") ? (
        <div className="denoTable">
          <TellerDenoTableCalc
            displayTable={openDeno}
            setOpenDenoTable={onSaveData}
            formData={rowDataRef?.current}
            data={denoData ?? []}
            onCloseTable={denoTableClose}
            initRemainExcess={
              screenFlag === "SINGLEPAY"
                ? rowDataRef?.current?.[0]?.AMOUNT ?? "0"
                : totalAmountRef?.current?.toString() ?? "0"
            }
            gridLable={
              screenFlag === "SINGLEPAY"
                ? t("CashPaymentFullLable", {
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
                : t("MultiplePayment", {
                    totalAmount: getFomattedCurrency(
                      totalAmountRef?.current?.toString() ?? "0"
                    ),
                  })
            }
            screenFlag={screenFlag}
            typeCode={"4"}
            resetForm={() => {}}
            denoValidPara={fetchParameter?.[0]?.DENO_VALIDATION}
          />
        </div>
      ) : null}
      {Boolean(openDeno) &&
      Boolean(fetchParameter?.[0]?.DENO_WINDOW === "Y") ? (
        <div className="denoTable">
          <DualTableCalc
            data={denoData ?? []}
            displayTableDual={openDeno}
            formData={rowDataRef?.current}
            initRemainExcess={
              screenFlag === "SINGLEPAY"
                ? rowDataRef?.current?.[0]?.AMOUNT ?? "0"
                : totalAmountRef?.current
            }
            gridLable={
              screenFlag === "SINGLEPAY"
                ? t("CashPaymentFullLable", {
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
                : t("MultiplePayment", {
                    totalAmount: getFomattedCurrency(
                      totalAmountRef?.current?.toString() ?? "0"
                    ),
                  })
            }
            onCloseTable={denoTableClose}
            screenFlag={screenFlag}
            typeCode={"4"}
            setOpenDenoTable={onSaveData}
            resetForm={() => {}}
            denoValidPara={fetchParameter?.[0]?.DENO_VALIDATION}
          />
        </div>
      ) : null}
    </>
  );
};
const CashPayment = ({ screenFlag, setNormalEntry }: cashPaymentTypes) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <CashPaymentMain
            screenFlag={screenFlag}
            setNormalEntry={setNormalEntry}
          />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
export default CashPayment;
