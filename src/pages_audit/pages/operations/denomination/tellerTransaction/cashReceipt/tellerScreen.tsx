import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { TellerScreenMetadata } from "./metaData";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "../../api";
import { Box, Dialog, LinearProgress, Paper } from "@mui/material";
import { cashReportMetaData } from "./metaData";
import { format, parse } from "date-fns";
import * as CommonApi from "../../api";
import { useCacheWithMutation } from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/cacheMutate";
import DailyTransTabs from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs";
import { useLocation } from "react-router-dom";
import {
  usePopupContext,
  GradientButton,
  SubmitFnType,
  InitialValuesType,
  FormWrapper,
  MetaDataType,
  usePropertiesConfigContext,
  ReportGrid,
  utilFunction,
  formatCurrency,
  getCurrencySymbol,
  Alert,
  ClearCacheProvider,
  queryClient,
} from "@acuteinfo/common-base";
import {
  SingleTableActionTypes,
  SingleTableDataReducer,
  SingleTableInititalState,
} from "../singleTypeTable/denoTableActionTypes";
import TellerDenoTableCalc from "../singleTypeTable/tellerDenoTableCalc";
import DualTableCalc from "../dualTypeTable/dualTableCalc";
import OtherReceipt from "../../otherReceipt/otherRec";
import { getdocCD } from "components/utilFunction/function";
import { t } from "i18next";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";

const TellerScreenMain = ({ screenFlag }) => {
  const formRef: any = useRef(null);
  const viewTrnRef = useRef<any>(null);
  const endSubmitRef: any = useRef(null);
  const cardDtlRef = useRef<any>(null);
  const [state, dispatch] = useReducer(
    SingleTableDataReducer,
    SingleTableInititalState
  );
  const [cardDetails, setCardDetails] = useState([]);
  const [cardTabsReq, setCardTabsReq] = useState({});
  const [extraAccDtl, setExtraAccDtl] = useState<any>({});
  const [otherReceipt, setOtherReceipt] = useState(false);
  const { authState }: any = useContext(AuthContext);
  let currentPath = useLocation().pathname;
  const customParameter = usePropertiesConfigContext();
  const { dynamicAmountSymbol, currencyFormat, decimalCount } = customParameter;
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
    "cashReceiptEntry",
    CommonApi.getTabsByParentType
  );
  const {
    data: fetchParameter,
    isLoading,
    isFetching,
    isError,
    error,
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
  const handleCardDetails = (cardDetails) => {
    cardDtlRef.current = cardDetails;
  };
  useEffect(() => {
    if (cardDtlRef.current) setCardDetails(cardDtlRef.current);
  }, [cardDtlRef.current]);

  useEffect(() => {
    // Check if cardStore and cardsInfo are present and cardsInfo is an array
    if (cardDetails?.length > 0 && Array.isArray(cardDetails)) {
      const extraAccDtl = cardDetails?.reduce((result, details: any) => {
        if (
          details?.COL_LABEL === "Name" ||
          details?.COL_LABEL === "A/c Number"
        ) {
          result[details?.COL_LABEL] = details?.COL_VALUE ?? "";
        }
        return result;
      }, {});

      setExtraAccDtl(extraAccDtl);
    }
  }, [cardDetails]);

  const getData: any = useMutation(API.CashReceiptEntrysData, {
    onSuccess: (response: any, variables?: any) => {
      CloseMessageBox();
      if (fetchParameter?.[0]?.DENO_WINDOW === "Y") {
        dispatch({
          type: SingleTableActionTypes?.SET_DISP_TABLE_DUAL,
          payload: true,
        });
      } else {
        dispatch({
          type: SingleTableActionTypes?.SET_DISP_TABLE,
          payload: true,
        });
      }
    },
    onError: (error: any, variables?: any) => {
      if (fetchParameter?.[0]?.DENO_WINDOW === "Y") {
        dispatch({
          type: SingleTableActionTypes?.SET_DISP_TABLE_DUAL,
          payload: false,
        });
      } else {
        dispatch({
          type: SingleTableActionTypes?.SET_DISP_TABLE,
          payload: false,
        });
      }
    },
  });

  const data: any = useMemo(() => {
    if (Array.isArray(getData?.data)) {
      endSubmitRef?.current?.endSubmit(true);
      return [...getData.data];
    }
  }, [getData?.data]);

  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmitRef.current = {
      data: { data },
      displayData,
      endSubmit,
      setFieldError,
    };
    if (actionFlag === "SAVE") {
      if (Boolean(data)) {
        dispatch({
          type: SingleTableActionTypes?.SET_FIELDS_DATA,
          payload: [data],
        });

        setExtraAccDtl((prevExtraAccDtl) => ({
          ...prevExtraAccDtl,
          ...extraAccDtl,
          TRN_TYPE: "1",
          REMARKS: data?.REMARKS ?? "",
        }));
      }
    }
  };

  const handleCloseDialog = () => {
    dispatch({
      type: SingleTableActionTypes?.SET_VIEWACCTDETAILS_VAL,
      payload: false,
    });
  };

  const onCloseTable = (newVal, flag) => {
    trackDialogClass("main");
    if (fetchParameter?.[0]?.DENO_WINDOW === "Y") {
      dispatch({
        type: SingleTableActionTypes?.SET_DISP_TABLE_DUAL,
        payload: newVal,
      });
      dispatch({
        type: SingleTableActionTypes?.SET_INPUT_VAL,
        payload: {},
      });
      dispatch({ type: SingleTableActionTypes?.SET_AMOUNT_VAL, payload: [] });
      dispatch({
        type: SingleTableActionTypes?.SET_REMAINEXCESS_VAL,
        payload: "",
      });
    } else {
      dispatch({
        type: SingleTableActionTypes?.SET_DISP_TABLE,
        payload: newVal,
      });
    }
  };

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
      "STATUS",
      "INST_RS",
      "SHADOW_CLEAR",
    ];

    const cardValues = keys?.reduce((acc, key) => {
      const item: any = cardDtlRef?.current?.find(
        (entry: any) => entry?.COL_NAME === key
      );
      acc[key] = item?.COL_VALUE;
      return acc;
    }, {});
    return cardValues;
  };

  useEffect(() => {
    if (cardDetails?.length) {
      cardDtlRef.current = cardDetails;
    }
  }, [cardDetails]);

  const headingWithButton = (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {utilFunction.getDynamicLabel(currentPath, authState?.menulistdata, true)}
      <Box>
        <GradientButton
          style={{ marginRight: "5px" }}
          onClick={(event) => {
            dispatch({
              type: SingleTableActionTypes?.SET_VIEWACCTDETAILS_VAL,
              payload: true,
            });
          }}
          color={"primary"}
          disabled={false}
          ref={viewTrnRef}
        >
          {t("ViewTrn")}
        </GradientButton>
        <GradientButton
          style={{ marginRight: "5px" }}
          onClick={() => setOtherReceipt(true)}
          color={"primary"}
          disabled={false}
          ref={viewTrnRef}
        >
          {t("OtherReceipt")}
        </GradientButton>
      </Box>
    </Box>
  );

  useEffect(() => {
    setTabsDetails([]);
    setCardDetails([]);
    setCardTabsReq({});
  }, [screenFlag]);

  const setOpenDenoTable = (value) => {
    dispatch({
      type: SingleTableActionTypes?.SET_DISP_TABLE,
      payload: value,
    });
  };

  const setOpenDualTable = (value) => {
    dispatch({
      type: SingleTableActionTypes?.SET_DISP_TABLE_DUAL,
      payload: value,
    });
  };

  const handleResetForm = () => {
    let event: any = { preventDefault: () => {} };
    formRef?.current?.handleFormReset(event, "Reset");
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
  const onClose = () => {
    setOtherReceipt(false);
    setCardDetails([]);
    setTabsDetails([]);
  };
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  const [className, setClassName] = useState<string>("main");
  const [commonClass, setCommonClass] = useState<string | null>(
    localStorage.getItem("commonClass")
  );

  setTimeout(() => {
    setCommonClass(localStorage.getItem("commonClass"));
  }, 1000);
  useEffect(() => {
    if (state?.viewAcctDetails) {
      trackDialogClass("ReportGrid");
    }
    return () => {
      trackDialogClass("main");
    };
  }, [state?.viewAcctDetails]);

  useEffect(() => {
    if (commonClass !== null) {
      setClassName(`${commonClass}`);
    } else if (dialogClassNames !== "") {
      setClassName(dialogClassNames);
    } else {
      setClassName("main");
    }
  }, [commonClass, dialogClassNames]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getParameters",
        authState?.user?.branchCode ?? "",
      ]);
    };
  }, []);
  useEnter(className);
  return (
    <>
      {isTabsError ? (
        <Fragment>
          <Alert
            severity={tabsErorr?.severity ?? "error"}
            errorMsg={tabsErorr?.error_msg ?? "Error"}
            errorDetail={tabsErorr?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      {getData?.isError ? (
        <Fragment>
          <Alert
            severity={getData?.error?.severity ?? "error"}
            errorMsg={getData?.error?.error_msg ?? "Error"}
            errorDetail={getData?.error?.error_detail ?? ""}
          />
        </Fragment>
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

      {!Boolean(otherReceipt) ? (
        <>
          <DailyTransTabs
            heading={headingWithButton as any}
            tabsData={tabsDetails}
            cardsData={cardDetails}
            reqData={cardTabsReq}
            occupiedHeight={{ min: "520px", max: "520px" }}
            screenFlag="TELLER"
          />

          {(isTabsLoading || getData?.isLoading || isLoading || isFetching) && (
            <LinearProgress
              color="secondary"
              sx={{ margin: "0px 10px 0px 10px" }}
            />
          )}
          <Paper sx={{ margin: "10px", marginBottom: "15px" }}>
            <FormWrapper
              key={`TellerScreen` + fetchParameter}
              metaData={TellerScreenMetadata as MetaDataType}
              initialValues={{} as InitialValuesType}
              onSubmitHandler={onSubmitHandler}
              hideHeader={true}
              formStyle={{
                background: "white",
                padding: "0px 10px 10px 10px !important",
              }}
              controlsAtBottom={false}
              onFormButtonClickHandel={(id) => {}}
              formState={{
                MessageBox: MessageBox,
                CloseMessageBox: CloseMessageBox,
                setCardDetails,
                setTabsDetails,
                docCd: docCD,
                getCardColumnValue,
                fetchTabsData,
                setCardTabsReq,
                acctDtlReqPara: {
                  ACCT_CD: {
                    ACCT_TYPE: "ACCT_TYPE",
                    BRANCH_CD: "BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                },
                handleCardDetails,
                fetchParameter,
              }}
              setDataOnFieldChange={async (action, payload) => {
                if (action === "RECEIPT" || action === "PAYMENT") {
                  let event: any = { preventDefault: () => {} };
                  formRef?.current?.handleSubmit(event, "SAVE");
                  const formattedDate = format(
                    parse(authState?.workingDate, "dd/MMM/yyyy", new Date()),
                    "dd/MMM/yyyy"
                  ).toUpperCase();
                  getData.mutate({
                    COMP_CD: authState?.companyID,
                    BRANCH_CD: authState?.user?.branchCode,
                    USER_NAME: authState?.user?.id,
                    TRAN_DT: formattedDate,
                  });
                }
              }}
              ref={formRef}
            ></FormWrapper>
          </Paper>
        </>
      ) : (
        <OtherReceipt
          screenFlag={"SINGLEOTHREC"}
          setCloseOthRec={onClose}
          parameter={fetchParameter?.[0]}
        />
      )}

      {state?.displayTable ? (
        <div className="denoTable">
          <TellerDenoTableCalc
            displayTable={state?.displayTable}
            setOpenDenoTable={setOpenDenoTable}
            formData={state?.fieldsData}
            data={data ?? []}
            onCloseTable={onCloseTable}
            initRemainExcess={state?.fieldsData?.[0]?.RECEIPT}
            gridLable={t("CashReceiptFullLable", {
              remarks: extraAccDtl?.REMARKS ?? "",
              bank: authState?.companyID?.trim() ?? "",
              branch: state?.fieldsData?.[0]?.BRANCH_CD?.trim() ?? "",
              type: state?.fieldsData?.[0]?.ACCT_TYPE?.trim() ?? "",
              accountNo: state?.fieldsData?.[0]?.ACCT_CD?.trim() ?? "",
              name: extraAccDtl?.Name ?? "",
              amount: getFomattedCurrency(
                state?.fieldsData?.[0]?.RECEIPT ?? "0"
              ),
            })}
            screenFlag={"SINGLEREC"}
            typeCode={"1"}
            resetForm={handleResetForm}
            denoValidPara={fetchParameter?.[0]?.DENO_VALIDATION}
          />
        </div>
      ) : null}
      {state?.displayTableDual ? (
        <div className="denoTable">
          <DualTableCalc
            displayTableDual={state?.displayTableDual}
            formData={state?.fieldsData}
            data={data ?? []}
            onCloseTable={onCloseTable}
            initRemainExcess={state?.fieldsData?.[0]?.RECEIPT}
            gridLable={t("CashReceiptFullLable", {
              remarks: extraAccDtl?.REMARKS ?? "",
              bank: authState?.companyID?.trim() ?? "",
              branch: state?.fieldsData?.[0]?.BRANCH_CD?.trim() ?? "",
              type: state?.fieldsData?.[0]?.ACCT_TYPE?.trim() ?? "",
              accountNo: state?.fieldsData?.[0]?.ACCT_CD?.trim() ?? "",
              name: extraAccDtl?.Name ?? "",
              amount: getFomattedCurrency(
                state?.fieldsData?.[0]?.RECEIPT ?? "0"
              ),
            })}
            screenFlag={"SINGLEREC"}
            typeCode={"1"}
            setOpenDenoTable={setOpenDualTable}
            resetForm={handleResetForm}
            denoValidPara={fetchParameter?.[0]?.DENO_VALIDATION}
          />
        </div>
      ) : null}
      {state?.viewAcctDetails ? (
        <Dialog
          className="ReportGrid"
          open={state?.viewAcctDetails}
          maxWidth={"xl"}
        >
          <ReportGrid
            reportID={"transactionServiceAPI/GETTODAYTRANDATA"}
            reportName={"GETTODAYTRANDATA"}
            dataFetcher={API.cashReportData}
            metaData={cashReportMetaData}
            maxHeight={window.innerHeight - 250}
            title={cashReportMetaData?.title}
            options={{
              disableGroupBy: cashReportMetaData?.disableGroupBy,
            }}
            hideFooter={cashReportMetaData?.hideFooter}
            hideAmountIn={cashReportMetaData?.hideAmountIn}
            retrievalType={cashReportMetaData?.retrievalType}
            initialState={{
              groupBy: cashReportMetaData?.groupBy ?? [],
            }}
            onClose={handleCloseDialog}
            otherAPIRequestPara={{
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            }}
          />
        </Dialog>
      ) : null}
    </>
  );
};

const TellerScreen = ({ screenFlag }) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <TellerScreenMain screenFlag={screenFlag} />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
export default TellerScreen;
