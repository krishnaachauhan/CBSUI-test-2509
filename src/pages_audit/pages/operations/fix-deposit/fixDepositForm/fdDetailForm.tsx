import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FixDepositDetailFormMetadata } from "./metaData/fdDetailMetaData";
import { FDContext } from "../context/fdContext";
import { useLocation } from "react-router-dom";
import * as API from "../api";
import {
  extractMetaData,
  usePopupContext,
  GradientButton,
  InitialValuesType,
  utilFunction,
  SubmitFnType,
  MetaDataType,
  FormWrapper,
  LoaderPaperComponent,
  queryClient,
  Alert,
  formatCurrency,
  getCurrencySymbol,
  usePropertiesConfigContext,
} from "@acuteinfo/common-base";
import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../function";
import { FDDetailGridForArrayField } from "../fdDetailForArrayfieldGrid";
import { makeStyles } from "@mui/styles";
import { FDIntScheduleGrid } from "../fdIntScheduleGrid";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
import { cloneDeep } from "lodash";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "var(--theme-color5)",
  },
  appbarTitle: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  paperContainer: {
    height: "100%",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  paper: {
    overflowY: "auto",
    flex: 1,
    border: "2px solid var(--theme-color4)",
    boxShadow: "none",
    maxHeight: "calc(70vh - 150px)",
  },
  gridPaper: {
    overflowY: "auto",
    border: "2px solid var(--theme-color4)",
    boxShadow: "none",
    maxHeight: "calc(38vh - 110px)",
    marginTop: "5px !important",
  },
  footerNote: {
    color: "rgb(128, 0, 57)",
    fontSize: "1rem",
    fontWeight: "500",
  },
  footerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "var(--theme-color4)  !important",
    padding: "0 10px",
    height: "30px",
  },
  footerTypo: {
    backgroundColor: "var(--theme-color4)  !important",
    fontWeight: "700",
    color: "var(--theme-color3)",
  },
  formControl: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 0,
    cursor: "pointer",
    "& .MuiRadio-root": {
      padding: "4px 9px",
    },
  },
}));

export const FDDetailForm = forwardRef<any, any>(
  (
    {
      defaultView,
      handleDialogClose,
      screenFlag,
      isDataChangedRef,
      openDepositForRenew,
      openNewFdForScheme,
      setArrayFieldGridData,
      renewDetailsSubmitHandler,
    },
    ref: any
  ) => {
    const {
      FDState,
      updateIniDtlFormDataNewFD,
      updateInitialRenData,
      handleDisableButton,
      setIsBackButton,
      updateSavedFormFieldData,
    } = useContext(FDContext);
    const [fdDtlRefresh, setFdDtlRefresh] = useState<number>(0);
    const [gridData, setGridData] = useState<any>([]);
    const isInitialLoadRef = useRef<boolean>(true);
    const { state: rows }: any = useLocation();
    const finalSubmitDataRef = useRef<any>(null);
    const editingSRNORef = useRef<any>(null);
    const { t } = useTranslation();
    const { MessageBox, CloseMessageBox } = usePopupContext();
    const { authState } = useContext(AuthContext);
    let currentPath = useLocation().pathname;
    const docCD = getdocCD(currentPath, authState?.menulistdata);
    const { showMessageBox } = useCommonFunctions();
    const classes = useTypeStyles();
    const customParameter = usePropertiesConfigContext();
    const { dynamicAmountSymbol, currencyFormat, decimalCount } =
      customParameter;
    const [openIntSchedule, setOpenIntSchedule] = useState<boolean>(false);
    const apiReqDataRef = useRef<any>({});
    const { trackDialogClass } = useDialogContext();

    // Function to handle INT_SCHEDULE logic
    const handleIntSchedule = useCallback(
      (fields: any) => {
        if (
          fields?.BRANCH_CD?.value?.trim() &&
          fields?.ACCT_TYPE?.value?.trim() &&
          fields?.ACCT_CD?.value?.trim() &&
          fields?.MATURITY_DT?.value &&
          Number(fields?.INT_RATE?.value) > 0 &&
          fields?.TRAN_DT?.value &&
          fields?.PERIOD_NO?.value?.trim() &&
          fields?.PERIOD_CD?.value?.trim() &&
          fields?.TERM_CD?.value?.trim() &&
          (fields?.CASH_AMT?.value?.trim() || fields?.TRSF_AMT?.value?.trim())
        ) {
          apiReqDataRef.current = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: fields?.BRANCH_CD?.value ?? "",
            ACCT_TYPE: fields?.ACCT_TYPE?.value ?? "",
            ACCT_CD: fields?.ACCT_CD?.value ?? "",
            PERIOD_CD: fields?.PERIOD_CD?.value ?? "",
            PERIOD_NO: fields?.PERIOD_NO?.value ?? "",
            TERM_CD: fields?.TERM_CD?.value ?? "",
            TRAN_DT: fields?.TRAN_DT?.value
              ? format(fields?.TRAN_DT?.value, "dd-MMM-yyyy")
              : "",
            TOT_AMT:
              Number(fields?.TRSF_AMT?.value ?? 0) +
              Number(fields?.CASH_AMT?.value ?? 0),
            INT_RATE: fields?.INT_RATE?.value ?? "",
            MATURITY_DT: fields?.MATURITY_DT?.value
              ? format(fields?.MATURITY_DT?.value, "dd-MMM-yyyy")
              : "",
          };
          setOpenIntSchedule(true);
          trackDialogClass("fdIntSchedule");
        }
      },
      [authState?.companyID, setOpenIntSchedule, trackDialogClass]
    );

    // Optimized total amount calculation with memoization
    const { totalCashAmount, totalTrnsAmount } = useMemo(() => {
      const totalCashAmt = gridData?.reduce((accum, obj) => {
        const cashAmt = Number(obj?.CASH_AMT ?? 0);
        return accum + cashAmt;
      }, 0);

      const totalTrnsAmt = gridData?.reduce((accum, obj) => {
        const trsfAmt = Number(obj?.TRSF_AMT ?? 0);
        return accum + trsfAmt;
      }, 0);

      return {
        totalCashAmount: totalCashAmt.toFixed(2),
        totalTrnsAmount: totalTrnsAmt.toFixed(2),
      };
    }, [gridData]);

    useEffect(() => {
      if (defaultView === "new") {
        if (gridData.length > 0) {
          setArrayFieldGridData(gridData);
        } else {
          setArrayFieldGridData([]);
        }
      }
    }, [gridData, defaultView, setArrayFieldGridData]);

    // Restore previously saved data when navigating back from next step
    useEffect(() => {
      if (FDState?.isBackButton) {
        if (Array.isArray(FDState?.fdDetailArrayFGridData)) {
          setGridData(FDState.fdDetailArrayFGridData);
        }
        setIsBackButton(false);
        isInitialLoadRef.current = false;
        setTimeout(() => {
          updateSavedFormFieldData({});
        }, 100);
      }
    }, [
      FDState?.isBackButton,
      FDState?.fdDetailArrayFGridData,
      setIsBackButton,
      updateSavedFormFieldData,
    ]);

    // Initialize grid data from context only on first component mount (not when user manually clears the grid)
    useEffect(() => {
      if (
        isInitialLoadRef.current &&
        !FDState?.isBackButton &&
        Array.isArray(FDState?.fdDetailArrayFGridData) &&
        FDState?.fdDetailArrayFGridData.length > 0 &&
        gridData.length === 0
      ) {
        setGridData(FDState.fdDetailArrayFGridData);
        isInitialLoadRef.current = false;
      }
    }, [
      FDState?.fdDetailArrayFGridData,
      FDState?.isBackButton,
      gridData.length,
    ]);

    //Api for get para details
    const {
      data: paraDtlData,
      isLoading: paraDtlDataIsLoading,
      isError: paraDtlDataIsError,
      error: paraDtlDataError,
    } = useQuery<any, any>(
      ["getFDParaDetail"],
      () =>
        API.getFDParaDetail({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
          ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
          SCREEN_REF: docCD ?? "",
        }),
      {
        enabled: Boolean(openDepositForRenew),
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
            AGG_DEP_CUSTID: openNewFdForScheme
              ? FDState?.schemeSelecRowData?.MAX_IN_CUST_ID ?? ""
              : FDState?.acctNoData?.AGG_DEP_CUSTID ?? "",
            DEP_FAC: openNewFdForScheme
              ? FDState?.schemeSelecRowData?.FACTOR ?? ""
              : FDState?.acctNoData?.DEP_FAC ?? "",
            PERIOD_CD: openNewFdForScheme
              ? FDState?.schemeSelecRowData?.PERIOD_CD ?? ""
              : "",
            PERIOD_NO: openNewFdForScheme
              ? FDState?.schemeSelecRowData?.PERIOD_NO ?? ""
              : "",
            NOMINEE_NM: FDState?.acctNoData?.NOMINEE_NM ?? "",
            MATURITY_DT: "",
          };
          updateIniDtlFormDataNewFD(iniDtlData);
          updateInitialRenData(iniDtlData);
        },
      }
    );

    //Api for get FD renew data
    const {
      data: renewData,
      isLoading: renewDataLoading,
      isFetching: renewDataisFetching,
      isError: renewDataisError,
      error: renewDataError,
    } = useQuery<any, any>(
      ["getFDRenewData"],
      () =>
        API.getFDRenewData({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
          ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
          SCREEN_REF: docCD ?? "",
          CATEG_CD: FDState?.fdPaymentData.CATEG_CD ?? "",
          PAID_DT: FDState?.fdSavedPaymentData?.PAID_DT ?? "",
          PAID_FD_MAT_DT: rows?.[0]?.data?.MATURITY_DT
            ? format(new Date(rows?.[0]?.data?.MATURITY_DT), "dd/MMM/yyyy")
            : "",
          PERIOD_CD: rows?.[0]?.data?.PERIOD_CD ?? "",
          PERIOD_NO: rows?.[0]?.data?.PERIOD_NO ?? "",
          PRINCIPAL_AMT:
            Number(
              FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0
            ) - Number(FDState?.renewTrnsFormData?.RENEW_AMT ?? 0),
          WORKING_DATE: authState?.workingDate ?? "",
        }),
      { enabled: Boolean(paraDtlData) && Boolean(openDepositForRenew) }
    );

    //Api for get Maturity amount and Monthly int
    const {
      data: maturityAmtData,
      isLoading: maturityAmtDataLoading,
      isError: maturityAmtDataisError,
      error: maturityAmtDataError,
    } = useQuery<any, any>(
      ["getFDRenewMaturityAmt"],
      () =>
        API.getFDRenewMaturityAmt({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
          ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
          ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
          CATEG_CD: FDState?.fdPaymentData.CATEG_CD ?? "",
          TRAN_DT: renewData?.[0]?.TRAN_DT
            ? format(new Date(renewData?.[0]?.TRAN_DT), "dd/MMM/yyyy")
            : "",
          TRSF_AMT: Number(
            FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0
          ),
          PERIOD_CD: rows?.[0]?.data?.PERIOD_CD ?? "",
          PERIOD_NO: rows?.[0]?.data?.PERIOD_NO ?? "",
          MATURITY_DT: renewData?.[0]?.MATURITY_DT
            ? format(new Date(renewData?.[0]?.MATURITY_DT), "dd/MMM/yyyy")
            : "",
          PRE_INT_FLAG: "N",
          PRINCIPAL_AMT: Number(
            FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0
          ),
          TERM_CD: paraDtlData?.[0]?.TERM_CD ?? "",
          INT_RATE: renewData?.[0]?.INT_RATE ?? "",
        }),
      {
        enabled:
          Boolean(paraDtlData) &&
          Boolean(openDepositForRenew) &&
          Boolean(renewData),
      }
    );

    //Mutation for Validate and Update FD details
    const validAndUpdateFDDtlMutation = useMutation(API.validAndUpdateFDDtl, {
      onError: async (error: any) => {
        let errorMsg = "Unknownerroroccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        await MessageBox({
          messageTitle: "Error",
          message: errorMsg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
      onSuccess: (data) => {
        isDataChangedRef.current = true;
        enqueueSnackbar(t("DataUpdatedSuccessfully"), {
          variant: "success",
        });
        CloseMessageBox();
        handleDialogClose();
      },
    });

    //Mutation for save FD Lien details
    const saveFDLienEntryDtlMutation = useMutation(API.saveFDLienEntryDtl, {
      onError: async (error: any) => {
        let errorMsg = "Unknownerroroccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        await MessageBox({
          messageTitle: "Error",
          message: errorMsg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
      onSuccess: () => {
        isDataChangedRef.current = true;
        enqueueSnackbar(t("RecordInsertedMsg"), {
          variant: "success",
        });
        CloseMessageBox();
        handleDialogClose();
      },
    });

    const onSubmitHandler: SubmitFnType = async (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      actionFlag
    ) => {
      endSubmit(true);

      let newData = {
        CR_BRANCH_CD: data?.CR_BRANCH_CD ?? "",
        CR_ACCT_TYPE: data?.CR_ACCT_TYPE ?? "",
        CR_ACCT_CD: data?.CR_ACCT_CD ?? "",
        CR_ACCT_NM: data?.CR_ACCT_NM ?? "",
        MATURE_INST: data?.MATURE_INST ?? "",
        FD_NO: data?.FD_NO ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        NOMINEE_NM: data?.NOMINEE_NM ?? "",
        FD_REMARK: data?.FD_REMARK ?? "",
      };

      let oldData = {
        ...rows?.[0]?.data,
      };
      let upd = utilFunction?.transformDetailsData(newData, oldData);

      if (defaultView === "view" && screenFlag !== "openLienForm") {
        finalSubmitDataRef.current = {
          data: {
            ...newData,
            ...upd,
            IsNewRow: defaultView === "new" ? true : false,
            SCREEN_REF: docCD ?? "",
            COMP_CD: authState?.companyID ?? "",
            PAYMENT_TYPE: rows?.[0]?.data?.INT_PAYMENT_MODE ?? "",
            ...(Number(FDState?.acctNoData?.DEP_FAC) > 0
              ? { UNIT_AMOUNT: rows?.[0]?.data?.UNIT_AMOUNT ?? "" }
              : {}),
          },
        };

        if (finalSubmitDataRef.current?.data?._UPDATEDCOLUMNS?.length === 0) {
          return {};
        } else {
          const btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: "Proceed?",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (btnName === "Yes") {
            validAndUpdateFDDtlMutation?.mutate({
              ...finalSubmitDataRef.current?.data,
            });
          }
        }
      } else {
        const btnName = await MessageBox({
          messageTitle: "confirmation",
          message: "SaveData",
          buttonNames: ["Yes", "No"],
          defFocusBtnName: "Yes",
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          saveFDLienEntryDtlMutation?.mutate({
            ...data,
            LIEN_PARA: FDState?.checkAllowFDPayApiData?.LIEN_PARA ?? "",
            SCREEN_REF: docCD ?? "",
            COMP_CD: authState?.companyID ?? "",
          });
        }
      }
    };

    const clonedMetaData = useMemo(() => {
      const cloned = cloneDeep(FixDepositDetailFormMetadata);
      let label = utilFunction?.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        true
      );
      const label2 = `${label} of A/c No.: ${
        FDState?.retrieveFormData?.BRANCH_CD?.trim() ?? ""
      }-${FDState?.retrieveFormData?.ACCT_TYPE?.trim() ?? ""}-${
        FDState?.retrieveFormData?.ACCT_CD?.trim() ?? ""
      } ${FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""}`;

      cloned.form.label = Boolean(openDepositForRenew)
        ? t("RenewDepositDetails")
        : label2;
      return cloned;
    }, [
      currentPath,
      authState?.menulistdata,
      FDState?.retrieveFormData,
      openDepositForRenew,
      t,
    ]);

    // Memoized validation logic for better performance
    const validateFormData = useCallback((formData: any, authState: any) => {
      if (!formData || Object.keys(formData).length === 0) return false;

      const formatedTranDate = formData?.TRAN_DT
        ? format(new Date(formData?.TRAN_DT), "dd/MMM/yyyy")
        : "";
      const formatedWorkingDate = authState?.workingDate
        ? format(new Date(authState?.workingDate), "dd/MMM/yyyy")
        : "";

      const requiredFields = [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "TRAN_DT",
        "PERIOD_CD",
        "PERIOD_NO",
        "INT_RATE",
        "TERM_CD",
        "MATURITY_AMT",
      ];

      return (
        requiredFields.every((field) => {
          if (field === "MATURITY_AMT") {
            return (
              formData[field]?.trim() && parseFloat(formData[field]?.trim()) > 0
            );
          }
          return formData[field]?.trim();
        }) && formatedTranDate <= formatedWorkingDate
      );
    }, []);

    // Optimized grid operations using useCallback
    const addNewRow = useCallback(
      (formData: any) => {
        setGridData((prev) => {
          const newRow = {
            ...formData,
            SR_NO: prev.length + 1,
          };
          return [...prev, newRow];
        });

        // Set initial data for new row
        updateIniDtlFormDataNewFD({
          ...FDState?.initialRenData,
          FD_NO: Number(FDState?.iniDtlFormDataNewFD?.FD_NO) + 1,
        });
        setFdDtlRefresh((prev) => prev + 1);
      },
      [
        FDState?.initialRenData,
        FDState?.iniDtlFormDataNewFD?.FD_NO,
        updateIniDtlFormDataNewFD,
      ]
    );

    const updateRow = useCallback(
      (formData: any, rowSRNo: number) => {
        setGridData((prev) => {
          const rowIndex = prev.findIndex((item) => item?.SR_NO === rowSRNo);
          if (rowIndex === -1) return prev;

          const updatedGridData = [...prev];
          updatedGridData[rowIndex] = {
            ...updatedGridData[rowIndex],
            ...formData,
          };
          return updatedGridData;
        });

        // Reset form state after update
        const lastRow = gridData[gridData.length - 1];
        updateIniDtlFormDataNewFD({
          ...FDState?.initialRenData,
          FD_NO: Number(lastRow?.FD_NO || 0) + 1,
        });
        editingSRNORef.current = null;
      },
      [gridData, FDState?.initialRenData, updateIniDtlFormDataNewFD]
    );

    const handleCancel = useCallback(() => {
      const newRow = gridData[gridData?.length - 1];
      updateIniDtlFormDataNewFD({
        ...FDState?.initialRenData,
        FD_NO: Number(newRow?.FD_NO) + 1,
      });
      editingSRNORef.current = null;
      setFdDtlRefresh((prev) => prev + 1);
    }, [gridData, FDState?.initialRenData, updateIniDtlFormDataNewFD]);

    // Memoized form key for better performance
    const formKey = useMemo(
      () =>
        `FixDepositDetail_${defaultView}_${fdDtlRefresh}_${
          editingSRNORef?.current?.SR_NO || "new"
        }`,
      [defaultView, fdDtlRefresh, editingSRNORef?.current?.SR_NO]
    );

    const memoizedMetaData: any = useMemo(() => {
      return {
        ...FixDepositDetailFormMetadata,
        fields: FixDepositDetailFormMetadata?.fields.map((field) =>
          field?.name === "ROW_COUNT"
            ? {
                ...field,
                label: `Editing Row: ${editingSRNORef?.current?.SR_NO ?? ""}`,
              }
            : field
        ),
      };
    }, [editingSRNORef?.current?.SR_NO]);
    useEffect(() => {
      return () => {
        queryClient.removeQueries(["getFDRenewData"]);
        queryClient.removeQueries(["getFDParaDetail"]);
        queryClient.removeQueries(["getFDRenewMaturityAmt"]);
        queryClient.removeQueries(["getMatDtForScheme"]);
      };
    }, []);

    const carryForData = useCallback(async () => {
      const btnName = await MessageBox({
        messageTitle: "Confirmation",
        message: "WanttoCarryForwardDataEnteredAndCreateNewFDWithSameDetails",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });

      if (btnName === "Yes") {
        setGridData((prev) => {
          if (prev.length === 0) return prev;

          const lastRow = prev[prev.length - 1];
          const newRow = {
            ...lastRow,
            FD_NO: Number(lastRow?.FD_NO) + 1,
            SR_NO: prev.length + 1,
          };

          return [...prev, newRow];
        });

        const lastRow = gridData[gridData?.length - 1];
        updateIniDtlFormDataNewFD({
          ...FDState?.iniDtlFormDataNewFD,
          FD_NO: Number(lastRow?.FD_NO) + 2,
        });
        editingSRNORef.current = null;
        setFdDtlRefresh((prev) => prev + 1);
      }
    }, [
      MessageBox,
      gridData,
      FDState?.iniDtlFormDataNewFD,
      updateIniDtlFormDataNewFD,
    ]);

    return (
      <>
        {(paraDtlDataIsError || renewDataisError || maturityAmtDataisError) && (
          <Alert
            severity="error"
            errorMsg={
              maturityAmtDataError?.error_msg ||
              renewDataError?.error_msg ||
              paraDtlDataError?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              maturityAmtDataError?.error_detail ||
              renewDataError?.error_detail ||
              paraDtlDataError?.error_detail
            }
            color="error"
          />
        )}
        {defaultView === "view" ? (
          <FormWrapper
            key={"FixDepositDetail" + defaultView}
            metaData={
              extractMetaData(clonedMetaData, defaultView) as MetaDataType
            }
            initialValues={
              {
                ...rows?.[0]?.data,
                LIEN_FLAG: rows?.[0]?.data?.LEAN_FLAG ?? "N",
                LEAN_COMP_CD:
                  rows?.[0]?.data?.LEAN_FLAG === "Y"
                    ? authState?.companyID ?? ""
                    : "",
                LEAN_BRANCH_CD:
                  rows?.[0]?.data?.LEAN_FLAG === "Y"
                    ? authState?.user?.branchCode ?? ""
                    : "",
              } as InitialValuesType
            }
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            ref={ref}
            formState={{
              MessageBox: MessageBox,
              docCD: docCD ?? "",
              defaultView: defaultView,
              screenFlag: screenFlag,
              workingDate: authState?.workingDate ?? "",
              showMessageBox: showMessageBox,
              ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
              handleDisableButton,
              acctDtlReqPara: {
                CR_ACCT_CD: {
                  ACCT_TYPE: "CR_ACCT_TYPE",
                  BRANCH_CD: "CR_BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
                LEAN_ACCT_CD: {
                  ACCT_TYPE: "LEAN_ACCT_TYPE",
                  BRANCH_CD: "LEAN_BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton onClick={handleDialogClose} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        ) : Boolean(openDepositForRenew) ? (
          paraDtlDataIsLoading || maturityAmtDataLoading || renewDataLoading ? (
            <LoaderPaperComponent />
          ) : (
            <FormWrapper
              key={"FixDepositDetail" + defaultView}
              metaData={
                extractMetaData(clonedMetaData, defaultView) as MetaDataType
              }
              initialValues={
                {
                  ...rows?.[0]?.data,
                  ...paraDtlData?.[0],
                  ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
                  BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
                  ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
                  TRAN_DT: renewData?.[0]?.TRAN_DT ?? "",
                  MATURITY_DT: renewData?.[0]?.MATURITY_DT ?? "",
                  INT_RATE: renewData?.[0]?.INT_RATE ?? "",
                  MATURITY_AMT: maturityAmtData?.[0]?.MATURITY_AMT ?? "",
                  TRSF_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
                  CASH_AMT: "",
                  PERIOD_CD: rows?.[0]?.data?.PERIOD_CD ?? "",
                  CATEG_CD: FDState?.fdPaymentData.CATEG_CD ?? "",
                } as InitialValuesType
              }
              onSubmitHandler={renewDetailsSubmitHandler}
              formStyle={{
                background: "white",
                paddingTop: "0px",
              }}
              ref={ref}
              formState={{
                MessageBox: MessageBox,
                docCD: docCD ?? "",
                defaultView: defaultView,
                screenFlag: screenFlag,
                workingDate: authState?.workingDate ?? "",
                openDepositForRenew: openDepositForRenew,
                ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
                BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
                showMessageBox: showMessageBox,
                handleDisableButton,
                acctDtlReqPara: {
                  CR_ACCT_CD: {
                    ACCT_TYPE: "CR_ACCT_TYPE",
                    BRANCH_CD: "CR_BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                  LEAN_ACCT_CD: {
                    ACCT_TYPE: "LEAN_ACCT_TYPE",
                    BRANCH_CD: "LEAN_BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                },
              }}
              onFormButtonClickHandel={async (flag, fields) => {
                if (flag === "INT_SCHEDULE") {
                  handleIntSchedule(fields);
                }
                return;
              }}
            />
          )
        ) : (
          <Stack className={classes?.paperContainer}>
            <Paper className={classes?.paper}>
              <FormWrapper
                key={formKey}
                metaData={
                  extractMetaData(memoizedMetaData, defaultView) as MetaDataType
                }
                initialValues={
                  {
                    ...(FDState?.isBackButton &&
                    Object.keys(FDState?.savedFormFieldData || {}).length > 0
                      ? FDState.savedFormFieldData
                      : FDState?.iniDtlFormDataNewFD),
                  } as InitialValuesType
                }
                onSubmitHandler={() => {}}
                hideHeader={true}
                onFormButtonClickHandel={async (flag, fields) => {
                  if (flag === "INT_SCHEDULE") {
                    handleIntSchedule(fields);
                    return;
                  }

                  if (flag === "CANCEL") {
                    handleCancel();
                    return;
                  }

                  const formData = await ref?.current?.getFieldData();

                  // Validation check
                  if (!validateFormData(formData, authState)) {
                    return;
                  }

                  // Handle add/update operations
                  if (flag === "ADDNEWROW") {
                    addNewRow(formData);
                  } else if (flag === "UPDATE") {
                    const rowSRNo = editingSRNORef?.current?.SR_NO;
                    if (rowSRNo) {
                      updateRow(formData, rowSRNo);
                    }
                  }
                }}
                formStyle={{
                  background: "white",
                  paddingTop: "0px",
                }}
                ref={ref}
                formState={{
                  MessageBox: MessageBox,
                  docCD: docCD ?? "",
                  defaultView: defaultView,
                  workingDate: authState?.workingDate ?? "",
                  ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
                  BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
                  showMessageBox: showMessageBox,
                  CloseMessageBox: CloseMessageBox,
                  editingSRNORef: editingSRNORef?.current,
                  handleDisableButton,
                  acctDtlReqPara: {
                    CR_ACCT_CD: {
                      ACCT_TYPE: "CR_ACCT_TYPE",
                      BRANCH_CD: "CR_BRANCH_CD",
                      SCREEN_REF: docCD ?? "",
                    },
                    LEAN_ACCT_CD: {
                      ACCT_TYPE: "LEAN_ACCT_TYPE",
                      BRANCH_CD: "LEAN_BRANCH_CD",
                      SCREEN_REF: docCD ?? "",
                    },
                  },
                  openDepositForRenew: Boolean(openDepositForRenew),
                }}
              />
            </Paper>
            {Array.isArray(gridData) && gridData?.length > 0 ? (
              <>
                <Paper className={classes?.gridPaper}>
                  <FDDetailGridForArrayField
                    gridData={gridData}
                    setGridData={setGridData}
                    editingSRNORef={editingSRNORef}
                    setFdDtlRefresh={setFdDtlRefresh}
                  />
                </Paper>

                <Box className={classes?.footerContainer}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      className={classes?.footerTypo}
                      sx={{ minWidth: "200px" }}
                    >
                      {t("TotalRecordsWithCol")} {gridData?.length ?? 0}
                    </Typography>
                    <Typography className={classes?.footerTypo}>
                      Total:
                      {` Cash (${formatCurrency(
                        totalCashAmount,
                        getCurrencySymbol(dynamicAmountSymbol),
                        currencyFormat,
                        decimalCount
                      )}) + Transfer (${formatCurrency(
                        totalTrnsAmount,
                        getCurrencySymbol(dynamicAmountSymbol),
                        currencyFormat,
                        decimalCount
                      )}) = ${formatCurrency(
                        Number(totalCashAmount) + Number(totalTrnsAmount),
                        getCurrencySymbol(dynamicAmountSymbol),
                        currencyFormat,
                        decimalCount
                      )}`}
                    </Typography>
                  </Box>

                  <GradientButton
                    onClick={carryForData}
                    color={"primary"}
                    disabled={gridData?.length <= 0}
                    sx={{
                      minHeight: "20px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      minWidth: "fit-content",
                      padding: "2px 6px",
                    }}
                  >
                    Carry Forward
                  </GradientButton>
                </Box>
              </>
            ) : null}
          </Stack>
        )}
        {openIntSchedule ? (
          <FDIntScheduleGrid
            setOpenIntSchedule={setOpenIntSchedule}
            apiReqData={apiReqDataRef.current}
          />
        ) : null}
      </>
    );
  }
);
