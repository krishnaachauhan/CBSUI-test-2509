import { FDDetailGridMetaData } from "./fdDetailgridMetaData";
import { useLocation, useNavigate } from "react-router-dom";
import { FDRetriveForm } from "./fixDepositForm/fdRetriveForm";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FixDepositForm } from "./fixDepositForm/fdStepperForm";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { PaidFDGrid } from "./paidFDGrid";
import { Box, Dialog } from "@mui/material";
import { ViewMasterForm } from "./fixDepositForm/viewMasterForm";
import { FDContext } from "./context/fdContext";
import { FDDetailForm } from "./fixDepositForm/fdDetailForm";
import { AuthContext } from "pages_audit/auth";
import { IntPaidDtlGrid } from "./intPaidDtlGrid";
import JointDetails from "../DailyTransaction/TRNHeaderTabs/JointDetails";
import Document from "../DailyTransaction/TRNHeaderTabs/Document";
import {
  LoaderPaperComponent,
  GridWrapper,
  usePopupContext,
  ActionTypes,
  utilFunction,
  GridMetaDataType,
  Alert,
  GradientButton,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import FDPaymentStepperForm from "./fixDepositForm/fdPaymentStepper";
import { FDPaymentBtns } from "./fixDepositForm/fdPaymentBtnsForm";
import { getdocCD } from "components/utilFunction/function";
import { RelatedAcGrid } from "./relatedAcGrid";
import { useCommonFunctions } from "./function";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { CustomGridHeader } from "./customGridHeader";
import { SchemeSelectionGrid } from "./schemeSelectionGrid";
import FinInterest from "./fixDepositForm/finInterest";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { cloneDeep } from "lodash";

const FDDetailGridMain = () => {
  const {
    FDState,
    resetAllData,
    updateViewDtlGridData,
    setActiveStep,
    updateCheckAllowFDPayApiData,
    updatePrematureRateData,
    updateFDPaymentData,
    updateRenewTrnsFormData,
    updateFdSavedPaymentData,
    updateSourceAcctFormData,
    updateBeneficiaryAcctData,
    updatePayslipAndDDData,
    setIsBackButton,
    updateFDDetailArrayFGridData,
    updateIniDtlFormDataNewFD,
    updateInitialRenData,
    updateSavedFormFieldData,
  } = useContext(FDContext);
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { showMessageBox } = useCommonFunctions();
  const isDataChangedRef = useRef<boolean>(false);
  const paramDataRef = useRef<any>({});
  const accountDtlsDataRef = useRef<any>({});
  const [className, setClassName] = useState<string>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const [commonState, setCommonState] = useState<any>({
    openFDPmtBtns: false,
    openIntPayment: false,
    openLienForm: false,
    displayAllActions: false,
    apiData: [],
    actionFlag: null,
    openExport: false,
    openFinInterest: false,
  });

  const {
    openFDPmtBtns,
    openIntPayment,
    openLienForm,
    displayAllActions,
    apiData,
    openExport,
    actionFlag,
    openFinInterest,
  } = commonState;

  //For Enter key
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  useEffect(() => {
    accountDtlsDataRef.current = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
      ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
      ACCT_CD: FDState?.retrieveFormData?.ACCT_CD ?? "",
    };
  }, [
    authState?.companyID,
    FDState?.retrieveFormData?.BRANCH_CD,
    FDState?.retrieveFormData?.ACCT_TYPE,
    FDState?.retrieveFormData?.ACCT_CD,
  ]);

  // API call to fetch FD Action button's label
  const {
    data: actionButtonData,
    isLoading,
    isError,
    error,
  } = useQuery<any, any>(["getFDButtons"], () => API.getFDButtons());

  //Render static actions
  const staticActionConfigs = [
    { actionName: "retrieve", actionLabel: "Retrieve" },
    {
      actionName: "view-details",
      actionLabel: "View Detail",
    },
    {
      actionName: "payment/renew",
      actionLabel: "Payment/Renew",
    },
    {
      actionName: "int-payment",
      actionLabel: "Int. Payment",
    },
    { actionName: "lien", actionLabel: "Lien" },
  ];
  const staticActions = staticActionConfigs.map(
    ({ actionName, actionLabel }) => ({
      actionName,
      actionLabel,
      multiple: actionName === "retrieve" ? undefined : false,
      rowDoubleClick: actionName === "view-details" ? true : false,
      alwaysAvailable: actionName === "retrieve" ? true : false,
    })
  );
  const actions: ActionTypes[] = [...staticActions];

  useEffect(() => {
    paramDataRef.current = {
      ...FDState?.acctNoData,
      ...FDState?.fdParaDetailData,
    };
  }, [FDState?.acctNoData?.AC_STATUS, FDState?.fdParaDetailData?.SPL_AMT]);

  // Mutation to get View Detail grid data
  const getFDViewDtlMutation: any = useMutation(
    "getFDViewDtl",
    API.getFDViewDtl,
    {
      onError: async (error: any) => {
        CloseMessageBox();
      },
      onSuccess: (data) => {
        setCommonState((prev) => ({
          ...prev,
          displayAllActions: true,
        }));
        updateViewDtlGridData(data);
        CloseMessageBox();
      },
    }
  );

  const getFDParaDetails: any = useMutation(
    "getFDParaDetails",
    API.getFDParaDetails,
    {
      onError: async (error: any) => {
        CloseMessageBox();
      },
      onSuccess: (data) => {
        const iniDtlData = {
          ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
          BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
          ACCT_CD: FDState?.retrieveFormData?.ACCT_CD ?? "",
          FD_NO_DISABLED: data?.[0]?.FD_NO_DISABLED ?? "",
          INT_RATE_DISABLED: data?.[0]?.INT_RATE_DISABLED ?? "",
          MATURITY_AMT_DISABLED: data?.[0]?.MATURITY_AMT_DISABLED ?? "",
          TERM_CD_DISABLED: data?.[0]?.TERM_CD_DISABLED ?? "",
          TRAN_DT_DISABLED: data?.[0]?.TRAN_DT_DISABLED ?? "",
          FD_NO: data?.[0]?.FD_NO ?? "",
          TERM_CD: data?.[0]?.TERM_CD ?? "",
          SPL_AMT: data?.[0]?.SPL_AMT ?? "",
          DOUBLE_TRAN: data?.[0]?.DOUBLE_TRAN ?? "",
          COMP_CD: authState?.companyID ?? "",
          CATEG_CD: FDState?.acctNoData?.CATEG_CD ?? "",
          AGG_DEP_CUSTID: FDState?.acctNoData?.AGG_DEP_CUSTID ?? "",
          DEP_FAC: FDState?.acctNoData?.DEP_FAC ?? "",
          NOMINEE_NM: FDState?.acctNoData?.NOMINEE_NM ?? "",
          PERIOD_CD: "",
          PERIOD_NO: "",
          MATURITY_DT: "",
        };
        updateIniDtlFormDataNewFD(iniDtlData);
        updateInitialRenData(iniDtlData);
      },
    }
  );

  //Mutation for allow modify FD data
  const checkAllowModifyFDDataMutation: any = useMutation(
    "checkAllowModifyFDData",
    API.checkAllowModifyFDData,
    {
      onError: () => {},
      onSuccess: () => {},
    }
  );

  //Mutation for allow FD payment
  const checkAllowFDPayMutation: any = useMutation(
    "checkAllowFDPay",
    API.checkAllowFDPay,
    {
      onError: () => {},
      onSuccess: () => {},
    }
  );

  //Mutation for get premature rate
  const getPrematureRateMutation: any = useMutation(
    "getPrematureRate",
    API.getPrematureRate,
    {
      onError: async (error: any) => {
        let errorMsg = "Unknownerroroccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        await MessageBox({
          messageTitle: "ERROR",
          message: errorMsg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
      onSuccess: () => {},
    }
  );

  // Function to handle actions when a button is clicked
  const getReqParam = (data) => {
    const rowData = data?.rows?.[0]?.data || {};
    return {
      A_COMP_CD: rowData.COMP_CD ?? "",
      A_BRANCH_CD: rowData.BRANCH_CD ?? "",
      A_ACCT_TYPE: rowData.ACCT_TYPE ?? "",
      A_ACCT_CD: rowData.ACCT_CD ?? "",
      A_FD_NO: rowData.FD_NO ?? "",
      A_LEAN_FLAG: rowData.LEAN_FLAG ?? "",
      A_MATURITY_DT: rowData.MATURITY_DT
        ? format(new Date(rowData.MATURITY_DT), "dd/MMM/yyyy")
        : "",
      A_TRAN_DT: rowData.TRAN_DT
        ? format(new Date(rowData.TRAN_DT), "dd/MMM/yyyy")
        : "",
      A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
      A_SCREEN_REF: docCD ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERROLE: authState?.role ?? "",
      USERNAME: authState?.user?.id ?? "",
      A_PRIN_AMT: rowData.TOT_AMT ?? "",
      A_INT_RATE: rowData.INT_RATE ?? "",
      A_SPL_AMT: paramDataRef?.current?.SPL_AMT ?? "",
      COMP_CD: rowData.COMP_CD ?? "",
      LOGIN_COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: rowData.BRANCH_CD ?? "",
      LOGIN_BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: rowData.ACCT_TYPE ?? "",
      ACCT_CD: rowData.ACCT_CD ?? "",
      WORKING_DT: authState?.workingDate ?? "",
      USER_NM: authState?.user?.id ?? "",
      USER_LEVEL: authState?.role ?? "",
      FD_NO: rowData.FD_NO ?? "",
      CONFIRMED: rowData.CONFIRMED ?? "",
      LAST_ENT_BY: rowData.LAST_ENTERED_BY ?? "",
      DOC_CD: docCD ?? "",
      STATUS: paramDataRef?.current?.AC_STATUS ?? "",
    };
  };

  const handleStatusCheck = async (data, actionData) => {
    const allowModifyMutData = data[0];
    if (allowModifyMutData?.O_STATUS === "999") {
      await MessageBox({
        messageTitle: allowModifyMutData?.O_MSG_TITLE?.length
          ? allowModifyMutData?.O_MSG_TITLE
          : "ValidationFailed",
        message: allowModifyMutData?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      return false;
    }
    navigate("", { state: actionData?.rows });
    return true;
  };

  const handlePaymentProcess = async (
    reqParam,
    A_FLAG,
    stateKey,
    rateMutation
  ) => {
    checkAllowFDPayMutation.mutate(
      { ...reqParam, A_FLAG },
      {
        onSuccess: async (checkAllowFDPayData) => {
          updateCheckAllowFDPayApiData(checkAllowFDPayData?.[0]);
          for (const obj of checkAllowFDPayData) {
            const continueProcess = await showMessageBox(obj);
            if (!continueProcess) break;

            if (obj?.O_STATUS === "0") {
              if (obj?.IS_PREMATURE === "Y") {
                rateMutation.mutate(
                  { ...reqParam },
                  {
                    onSuccess: (rateMutationData) => {
                      updatePrematureRateData(rateMutationData?.[0]);
                      setCommonState((prev) => ({
                        ...prev,
                        [stateKey]: true,
                      }));
                    },
                  }
                );
              } else {
                setCommonState((prev) => ({
                  ...prev,
                  [stateKey]: true,
                }));
              }
            }
          }
          CloseMessageBox();
        },
      }
    );
  };

  const setCurrentAction = useCallback(
    async (data) => {
      const reqParam = getReqParam(data);
      const actionData = data;

      if (data?.name === "view-details") {
        trackDialogClass("fdCommDlg");
        checkAllowModifyFDDataMutation.mutate(
          { ...reqParam },
          {
            onSuccess: async (data) => {
              const isSuccess = await handleStatusCheck(data, actionData);
              if (isSuccess) {
                setCommonState((prevState) => ({
                  ...prevState,
                  actionFlag: "view-details",
                }));
              }
              CloseMessageBox();
            },
          }
        );
      } else if (data?.name === "payment/renew") {
        trackDialogClass("fdCommDlg");
        checkAllowModifyFDDataMutation.mutate(
          { ...reqParam },
          {
            onSuccess: async (data) => {
              const isSuccess = await handleStatusCheck(data, actionData);
              if (isSuccess) {
                handlePaymentProcess(
                  reqParam,
                  "P",
                  "openFDPmtBtns",
                  getPrematureRateMutation
                );
              }
              CloseMessageBox();
            },
          }
        );
      } else if (data?.name === "int-payment") {
        trackDialogClass("fdPmtDlg");
        checkAllowModifyFDDataMutation.mutate(
          { ...reqParam },
          {
            onSuccess: async (data) => {
              const isSuccess = await handleStatusCheck(data, actionData);
              if (isSuccess) {
                handlePaymentProcess(
                  reqParam,
                  "I",
                  "openIntPayment",
                  getPrematureRateMutation
                );
              }
              CloseMessageBox();
            },
          }
        );
      } else if (data?.name === "lien") {
        trackDialogClass("fdCommDlg");
        checkAllowModifyFDDataMutation.mutate(
          { ...reqParam },
          {
            onSuccess: async (data) => {
              const isSuccess = await handleStatusCheck(data, actionData);
              if (isSuccess) {
                handlePaymentProcess(
                  reqParam,
                  "L",
                  "openLienForm",
                  getPrematureRateMutation
                );
              }
              CloseMessageBox();
            },
          }
        );
      } else {
        navigate("", { state: data?.rows });
      }
    },
    [navigate]
  );

  //Set the header title for the grid and display dates into footer, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    const cloned = cloneDeep(FDDetailGridMetaData);
    // Dynamically set the grid label
    const label = utilFunction?.getDynamicLabel(
      currentPath,
      authState?.menulistdata,
      true
    );
    cloned.gridConfig.gridLabel = Boolean(displayAllActions)
      ? label +
        " " +
        `of A/c No.: ${FDState?.retrieveFormData?.BRANCH_CD?.trim() ?? ""}-${
          FDState?.retrieveFormData?.ACCT_TYPE?.trim() ?? ""
        }-${FDState?.retrieveFormData?.ACCT_CD?.trim() ?? ""} ${
          FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""
        }`
      : label;

    return cloned;
  }, [
    FDState?.retrieveFormData?.BRANCH_CD,
    FDState?.retrieveFormData?.ACCT_TYPE,
    FDState?.retrieveFormData?.ACCT_CD,
    authState?.menulistdata,
    currentPath,
    displayAllActions,
  ]);

  // Dynamically set the grid label
  const customGridHeader = useMemo(() => {
    const label = utilFunction?.getDynamicLabel(
      currentPath,
      authState?.menulistdata,
      true
    );
    return Boolean(displayAllActions)
      ? label +
          " " +
          `of A/c No.: ${FDState?.retrieveFormData?.BRANCH_CD?.trim() ?? ""}-${
            FDState?.retrieveFormData?.ACCT_TYPE?.trim() ?? ""
          }-${FDState?.retrieveFormData?.ACCT_CD?.trim() ?? ""} ${
            FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""
          }`
      : label;
  }, [
    FDState?.retrieveFormData?.BRANCH_CD,
    FDState?.retrieveFormData?.ACCT_TYPE,
    FDState?.retrieveFormData?.ACCT_CD,
    authState?.menulistdata,
    currentPath,
    displayAllActions,
  ]);

  // Function to refetch FD details api based on actions
  const handleGetDataMutation = () => {
    const reqParam = {
      ...accountDtlsDataRef?.current,
      WORKING_DT: authState?.workingDate ?? "",
    };
    getFDViewDtlMutation?.mutate(reqParam);
  };

  const handleDialogClose = useCallback(() => {
    trackDialogClass("main");
    updateFDPaymentData({});
    updateFdSavedPaymentData({});
    updateRenewTrnsFormData({});
    updateIniDtlFormDataNewFD([]);
    updateFDDetailArrayFGridData([]);
    updateInitialRenData([]);
    updateSavedFormFieldData({});
    updateSourceAcctFormData([
      {
        ACCT_NAME: "",
      },
    ]);
    updatePayslipAndDDData([
      {
        ACCT_NAME: "",
      },
    ]);
    updateBeneficiaryAcctData([
      {
        ACCT_NAME: "",
      },
    ]);
    setActiveStep(0);
    setCommonState((prev) => ({
      ...prev,
      openFDPmtBtns: false,
      openIntPayment: false,
      openLienForm: false,
      actionFlag: null,
    }));
    setIsBackButton(false);
    navigate(".");
    if (isDataChangedRef.current === true) {
      handleGetDataMutation();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  // Navigate to the "retrieve" form when the component is rendered for the first time.
  useEffect(() => {
    setCommonState((prev) => ({
      ...prev,
      actionFlag: "retrieve",
    }));
    trackDialogClass("fdCommDlg");
  }, []);

  // Helper function to get button configuration based on FLAG and default values
  const getButtonConfig = (FLAG, defaultLabel) => {
    const buttonConfig = actionButtonData?.find((item) => item.FLAG === FLAG);
    if (!buttonConfig) {
      return {
        label: defaultLabel,
        flag: FLAG,
      };
    }
    const { ACTIONLABEL } = buttonConfig;
    const label =
      FLAG === "PAIDFD" ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          {t(ACTIONLABEL) ?? ""}
          {FDState?.acctNoData?.PAID_FD_CNT > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-9px",
                right: "-9px",
                backgroundColor: "var(--theme-color1)",
                borderRadius: "50%",
                minHeight: "16px",
                minWidth: "16px",
                fontSize: "0.65rem",
                color: "#fff",
                padding: "0 3px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "fit-content",
                height: "fit-content",
              }}
            >
              {FDState?.acctNoData?.PAID_FD_CNT}
            </span>
          )}
        </div>
      ) : (
        t(ACTIONLABEL) || t(defaultLabel)
      );
    return {
      label,
      flag: FLAG,
    };
  };

  // Dynamically create buttons based on static configurations and conditions
  const createActionButtons = () => {
    if (!displayAllActions) {
      return [getButtonConfig("retrieve", "Retrieve")];
    }
    const buttons = [
      getButtonConfig("VIEWM", "View M"),
      getButtonConfig("JOINT", "Joint"),
      getButtonConfig("INTPAID", "Int Paid Dtl"),
      getButtonConfig("RELATEDACCT", "Related A/c"),
      getButtonConfig("DOC", "Docs"),
      getButtonConfig("FININT", "Fin Interest"),
      getButtonConfig("NEWFD", "New FD"),
      getButtonConfig("retrieve", "Retrieve"),
      getButtonConfig("export", "Export"),
    ];

    // Conditionally add the "Paid FD" button if FD count is greater than 0
    if (Number(FDState?.acctNoData?.PAID_FD_CNT) > 0) {
      buttons.splice(1, 0, getButtonConfig("PAIDFD", "Paid FD"));
    }
    return buttons;
  };

  const actionButtons = createActionButtons();

  const handleButtonClick = useCallback(
    (actionFlag) => {
      trackDialogClass("fdCommDlg");
      if (
        actionFlag === "NEWFD" &&
        FDState?.acctNoData?.OPEN_DOUBLE_POPUP !== "Y"
      ) {
        const reqParam = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
          ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
          SCREEN_REF: docCD ?? "",
        };
        getFDParaDetails?.mutate(reqParam);
      }
      setCommonState((prev) => {
        if (actionFlag === "retrieve") {
          resetAllData();
          return {
            ...prev,
            openFDPmtBtns: false,
            openIntPayment: false,
            openLienForm: false,
            displayAllActions: false,
            apiData: [],
            actionFlag: "retrieve",
          };
        } else if (actionFlag === "export") {
          return {
            ...prev,
            openExport: true,
          };
        } else if (actionFlag === "FININT") {
          return {
            ...prev,
            openFinInterest: true,
          };
        } else {
          return {
            ...prev,
            actionFlag,
          };
        }
      });
    },
    [
      authState?.companyID,
      FDState?.retrieveFormData?.BRANCH_CD,
      FDState?.retrieveFormData?.ACCT_TYPE,
      FDState?.acctNoData?.OPEN_DOUBLE_POPUP,
      docCD,
    ]
  );

  const setApiData = (newData: any[]) => {
    setCommonState((prevState) => ({
      ...prevState,
      apiData: newData,
    }));
  };

  useEnter(`${className}`);

  return (
    <>
      {(checkAllowModifyFDDataMutation.isLoading ||
        checkAllowFDPayMutation.isLoading ||
        getPrematureRateMutation.isLoading) && (
        <Dialog open={true} fullWidth={true}>
          <LoaderPaperComponent size={30} />
        </Dialog>
      )}

      {(checkAllowModifyFDDataMutation?.isError ||
        checkAllowFDPayMutation?.isError ||
        getFDViewDtlMutation?.isError ||
        isError) && (
        <Alert
          severity="error"
          errorMsg={
            checkAllowModifyFDDataMutation?.error?.error_msg ||
            checkAllowFDPayMutation?.error?.error_msg ||
            getFDViewDtlMutation?.error?.error_msg ||
            error?.error_msg ||
            t("Somethingwenttowrong")
          }
          errorDetail={
            checkAllowModifyFDDataMutation?.error?.error_detail ||
            checkAllowFDPayMutation?.error?.error_detail ||
            getFDViewDtlMutation?.error?.error_detail ||
            error?.error_detail
          }
          color="error"
        />
      )}

      <CustomGridHeader
        isLoading={getFDViewDtlMutation?.isLoading || isLoading}
        setApiData={setApiData}
        gridData={getFDViewDtlMutation?.data}
        headerContent={customGridHeader}
        metaData={memoizedMetadata}
        refetchData={getFDViewDtlMutation.data && handleGetDataMutation}
        filterPlaceHolder={`Search in ${apiData?.length} FDs`}
      />
      {/* Render all buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          padding: "0.5rem",
          backgroundColor: "var(--theme-color4)",
        }}
      >
        <LinearProgressBarSpacer />
        {actionButtons.map((button) => (
          <GradientButton
            key={button.flag}
            onClick={() => handleButtonClick(button.flag)}
            disabled={getFDViewDtlMutation?.isLoading}
            style={{
              minHeight: "20px",
              borderRadius: "8px",
              fontSize: "12px",
              minWidth: "fit-content",
              padding: "2px 6px",
            }}
          >
            {button.label}
          </GradientButton>
        ))}
      </Box>

      <GridWrapper
        key={
          "fdDetailGrid" +
          Object.keys(FDState?.retrieveFormData).length +
          FDState?.viewDtlGridData?.length +
          displayAllActions
        }
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={apiData ?? []}
        setData={setApiData}
        externalExportState={openExport}
        onExportModalClose={() =>
          setCommonState((prev) => ({
            ...prev,
            openExport: false,
          }))
        }
        loading={getFDViewDtlMutation?.isLoading || isLoading}
        actions={actions}
        setAction={setCurrentAction}
        hideHeader={true}
        refetchData={() => handleGetDataMutation()}
        onClickActionEvent={async (index, id, data) => {
          if (id === "LEAN_FLAG") {
            let rowData = data;
            const reqParam = {
              A_COMP_CD: data?.COMP_CD ?? "",
              A_BRANCH_CD: data?.BRANCH_CD ?? "",
              A_ACCT_TYPE: data?.ACCT_TYPE ?? "",
              A_ACCT_CD: data?.ACCT_CD ?? "",
              A_FD_NO: data?.FD_NO ?? "",
              A_LEAN_FLAG: data?.LEAN_FLAG ?? "",
              A_MATURITY_DT: data?.MATURITY_DT
                ? format(new Date(data?.MATURITY_DT), "dd/MMM/yyyy")
                : "",
              A_TRAN_DT: data?.TRAN_DT
                ? format(new Date(data?.TRAN_DT), "dd/MMM/yyyy")
                : "",
              A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
              A_SCREEN_REF: docCD ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERROLE: authState?.role ?? "",
              USERNAME: authState?.user?.id ?? "",
              A_PRIN_AMT: data?.TOT_AMT ?? "",
              A_INT_RATE: data?.INT_RATE ?? "",
              A_SPL_AMT: paramDataRef?.current?.SPL_AMT ?? "",
              COMP_CD: data?.COMP_CD ?? "",
              LOGIN_COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: data?.BRANCH_CD ?? "",
              LOGIN_BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_TYPE: data?.ACCT_TYPE ?? "",
              ACCT_CD: data?.ACCT_CD ?? "",
              WORKING_DT: authState?.workingDate ?? "",
              USER_NM: authState?.user?.id ?? "",
              USER_LEVEL: authState?.role ?? "",
              FD_NO: data?.FD_NO ?? "",
              CONFIRMED: data?.CONFIRMED ?? "",
              LAST_ENT_BY: data?.LAST_ENTERED_BY ?? "",
              DOC_CD: docCD ?? "",
              STATUS: paramDataRef?.current?.AC_STATUS ?? "",
            };

            checkAllowModifyFDDataMutation.mutate(
              {
                ...reqParam,
              },
              {
                onSuccess: async (data) => {
                  const allowModifyMutData = data[0];
                  if (allowModifyMutData?.O_STATUS === "999") {
                    await MessageBox({
                      messageTitle: allowModifyMutData?.O_MSG_TITLE?.length
                        ? allowModifyMutData?.O_MSG_TITLE
                        : "ValidationFailed",
                      message: allowModifyMutData?.O_MESSAGE ?? "",
                      icon: "ERROR",
                    });
                  } else {
                    checkAllowFDPayMutation.mutate(
                      {
                        ...reqParam,
                        A_FLAG: "L",
                      },
                      {
                        onSuccess: async (data) => {
                          const checkAllowFDPayData = data;
                          updateCheckAllowFDPayApiData(
                            checkAllowFDPayData?.[0]
                          );

                          for (const obj of checkAllowFDPayData) {
                            if (
                              obj?.O_STATUS === "999" ||
                              obj?.O_STATUS === "99" ||
                              obj?.O_STATUS === "9"
                            ) {
                              const buttonName = await MessageBox({
                                messageTitle: obj?.O_MSG_TITLE?.length
                                  ? obj?.O_MSG_TITLE
                                  : obj?.O_STATUS === "9"
                                  ? "Alert"
                                  : obj?.O_STATUS === "99"
                                  ? "Confirmation"
                                  : "ValidationFailed",
                                message: obj?.O_MESSAGE ?? "",
                                buttonNames:
                                  obj?.O_STATUS === "99"
                                    ? ["Yes", "No"]
                                    : ["Ok"],
                                icon:
                                  obj?.O_STATUS === "999"
                                    ? "ERROR"
                                    : obj?.O_STATUS === "99"
                                    ? "CONFIRM"
                                    : obj?.O_STATUS === "9"
                                    ? "WARNING"
                                    : "INFO",
                              });
                              if (
                                obj?.O_STATUS === "99" &&
                                buttonName === "No"
                              ) {
                                break;
                              }
                            } else if (obj?.O_STATUS === "0") {
                              navigate("", {
                                state: [{ data: rowData }],
                              });
                              trackDialogClass("fdCommDlg");
                              setCommonState((prev) => ({
                                ...prev,
                                openLienForm: true,
                              }));
                            }
                          }
                          CloseMessageBox();
                        },
                      }
                    );
                  }
                  CloseMessageBox();
                },
              }
            );
          }
        }}
      />

      {actionFlag === "retrieve" ? (
        <FDRetriveForm
          handleDialogClose={handleDialogClose}
          getFDViewDtlMutation={getFDViewDtlMutation}
        />
      ) : null}

      {actionFlag === "VIEWM" ? (
        <ViewMasterForm
          handleDialogClose={handleDialogClose}
          requestData={{
            ...FDState?.retrieveFormData,
            TDS_METHOD: FDState?.fdParaDetailData?.TDS_METHOD,
          }}
        />
      ) : null}

      {actionFlag === "PAIDFD" ? (
        <PaidFDGrid handleDialogClose={handleDialogClose} />
      ) : null}

      {actionFlag === "INTPAID" ? (
        <IntPaidDtlGrid handleDialogClose={handleDialogClose} />
      ) : null}

      {actionFlag === "DOC" ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
              padding: "8px",
            },
          }}
          maxWidth="lg"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
            }
          }}
          className="fdCommDlg"
        >
          <Document
            reqData={{
              ...accountDtlsDataRef?.current,
              ACCT_NM: FDState?.retrieveFormData?.ACCT_NM ?? "",
              custHeader: true,
            }}
            handleDialogClose={handleDialogClose}
            isDisplayClose={true}
          />
        </Dialog>
      ) : null}

      {actionFlag === "RELATEDACCT" ? (
        <RelatedAcGrid handleDialogClose={handleDialogClose} />
      ) : null}

      {actionFlag === "NEWFD" ? (
        FDState?.acctNoData?.OPEN_DOUBLE_POPUP === "Y" ? (
          <SchemeSelectionGrid
            handleDialogClose={handleDialogClose}
            isDataChangedRef={isDataChangedRef}
          />
        ) : getFDParaDetails?.isLoading ? (
          <Dialog
            open={true}
            fullWidth={true}
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
            maxWidth="md"
          >
            <LoaderPaperComponent />
          </Dialog>
        ) : (
          <FixDepositForm
            isDataChangedRef={isDataChangedRef}
            handleDialogClose={handleDialogClose}
            defaultView={"new"}
            getFDParaDetails={getFDParaDetails}
          />
        )
      ) : null}

      {actionFlag === "view-details" ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
            }
          }}
          className="fdCommDlg"
        >
          <FDDetailForm
            handleDialogClose={handleDialogClose}
            defaultView={"view"}
            isDataChangedRef={isDataChangedRef}
          />
        </Dialog>
      ) : null}

      {actionFlag === "JOINT" ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
              padding: "8px",
            },
          }}
          maxWidth="lg"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
            }
          }}
          className="fdCommDlg"
        >
          <JointDetails
            reqData={{
              ...accountDtlsDataRef?.current,
              ACCT_NM: FDState?.retrieveFormData?.ACCT_NM ?? "",
              BTN_FLAG: "Y",
              custHeader: true,
            }}
            closeDialog={handleDialogClose}
          />
        </Dialog>
      ) : null}

      {openLienForm ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
            }
          }}
          className="fdCommDlg"
        >
          <FDDetailForm
            isDataChangedRef={isDataChangedRef}
            handleDialogClose={handleDialogClose}
            defaultView={"view"}
            screenFlag="openLienForm"
          />
        </Dialog>
      ) : null}

      {openFDPmtBtns ? (
        <FDPaymentBtns
          handleDialogClose={handleDialogClose}
          isDataChangedRef={isDataChangedRef}
        />
      ) : null}

      {openIntPayment ? (
        <FDPaymentStepperForm
          handleDialogClose={handleDialogClose}
          isDataChangedRef={isDataChangedRef}
          openIntPayment={openIntPayment}
        />
      ) : null}

      {openFinInterest ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          className="fdCommDlg"
        >
          <FinInterest
            closeDialog={() =>
              setCommonState((prev) => ({
                ...prev,
                openFinInterest: false,
              }))
            }
          />
        </Dialog>
      ) : null}
    </>
  );
};

export const FDDetailGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <FDDetailGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
