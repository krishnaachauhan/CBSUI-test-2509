import {
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  Stack,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
  Theme,
} from "@mui/material";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { makeStyles } from "@mui/styles";
import { useMutation } from "react-query";
import * as API from "../api";
import { AuthContext } from "pages_audit/auth";
import {
  Alert,
  ColorlibConnector,
  ColorlibStepIconRoot,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import CommonSvgIcons from "assets/icons/commonSvg/commonSvgIcons";
import { FDContext } from "../context/fdContext";
import {
  GradientButton,
  usePopupContext,
  LoaderPaperComponent,
  SubmitFnType,
} from "@acuteinfo/common-base";
import { FDPayment } from "./fdPayment";
import { PayslipAndDDForm } from "../../recurringPaymentEntry/payslipAndNEFT/payslipAndDDForm";
import { BeneficiaryAcctDetailsForm } from "../../recurringPaymentEntry/payslipAndNEFT/beneficiaryAcctDetailsForm";
import { TransferAcctDetailForm } from "./trnsAcctDtlForm";
import { FDDetailForm } from "./fdDetailForm";
import { FdPaymentAdvicePrint } from "../../fixDepositConfirmation/form/fdPaymentAdvice";
import { getdocCD } from "components/utilFunction/function";
const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));

type FDPaymentStepperFormProps = {
  handleDialogClose?: any;
  screenFlag?: string;
  isDataChangedRef?: any;
  openPayment?: any;
  openRenew?: any;
  fdPmtDtlMutError?: any;
  openIntPayment?: boolean;
};

const FDPaymentStepperForm: React.FC<FDPaymentStepperFormProps> = ({
  handleDialogClose,
  isDataChangedRef,
  openIntPayment,
  openRenew,
  openPayment,
  fdPmtDtlMutError,
}) => {
  const { t } = useTranslation();
  const {
    FDState,
    updateFDPaymentData,
    updateFdSavedPaymentData,
    updateSourceAcctFormData,
    updateRenewTrnsFormData,
    updateValidatePaymetEntryData,
    updateRenewDataForDeposit,
    setIsBackButton,
    setActiveStep,
    updatePayslipAndDDData,
    updateBeneficiaryAcctData,
    handleDisableButton,
  } = useContext(FDContext);
  const { authState } = useContext(AuthContext);
  const headerClasses = useTypeStyles();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();
  const [steps, setSteps] = useState<string[]>([
    t("FD Details"),
    t("Credit A/c Details"),
  ]);
  const [openTrnsForm, setOpenTrnsForm] = useState<boolean>(false);
  const [openRenewTrnsForm, setOpenRenewTrnsForm] = useState<boolean>(false);
  const [openNeftForm, setOpenNeftForm] = useState<boolean>(false);
  const [openPayslipForm, setOpenPayslipForm] = useState<boolean>(false);
  const [openDepositForRenew, setOpenDepositForRenew] =
    useState<boolean>(false);
  const [openPaymentAdvice, setOpenPaymentAdvice] = useState<boolean>(false);
  const [renewTrnsVal, setRenewTrnsVal] = useState(0);
  const sourceAcctformRef = useRef<any>(null);
  const depositForRenewformRef = useRef<any>(null);
  const datesComObjRef = useRef<any>(null);
  const saveDataRef = useRef<any>(null);
  const fdPmtFormRef = useRef<any>(null);
  const payslipAndDDRef = useRef<any>(null);
  const beneficiaryAcctRef = useRef<any>(null);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  //Common function for format date
  const formatDate = (date) =>
    date ? format(new Date(date), "dd/MMM/yyyy") : "";

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    //Stepper icons
    const icons: { [index: string]: React.ReactElement } = {
      1: <CommonSvgIcons iconName={"DISBDTL"} />,
      2: Boolean(openRenew) ? (
        <CommonSvgIcons iconName={"ASBA"} />
      ) : (
        <CommonSvgIcons iconName={"ACHOW"} />
      ),
      3:
        Number(renewTrnsVal) > 0 ? (
          <CommonSvgIcons iconName={"ACHOW"} />
        ) : (
          <CommonSvgIcons iconName={"LIEN"} />
        ),
      4: <CommonSvgIcons iconName={"LIEN"} />,
    };
    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  const commonPayNEFTValue = {
    neftVal: {
      PAYMENT_AMOUNT: Boolean(openRenew)
        ? Number(FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM) -
          Number(FDState?.renewTrnsFormData?.RENEW_AMT)
        : Number(FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM),
      ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
      ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
      ENTRY_TYPE: "NEFT",
      SCREEN_NAME: t("BeneficiaryACDetails"),
    },
    payslipVal: {
      PAYMENT_AMOUNT: Boolean(openRenew)
        ? Number(FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM) -
          Number(FDState?.renewTrnsFormData?.RENEW_AMT)
        : Number(FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM),
      ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
      ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
      SCREEN_REF: docCD ?? "",
      SCREEN_NAME: t("PayslipAndDemandDraft"),
      COMP_CD: authState?.companyID ?? "",
    },
  };

  //Initial values For Beneficiary Form
  const accountDetailsForBen = {
    BENEFIACCTDTL: [
      {
        AMOUNT: Boolean(openRenew)
          ? Number(FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM) -
            Number(FDState?.renewTrnsFormData?.RENEW_AMT)
          : Number(FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM),
      },
    ],
    DEFAULT_REMARKS: `FD PAYMENT ${authState?.companyID?.trim() ?? ""}${
      rows?.[0]?.data?.BRANCH_CD?.trim() ?? ""
    }${rows?.[0]?.data?.ACCT_TYPE?.trim() ?? ""}${
      rows?.[0]?.data?.ACCT_CD?.trim() ?? ""
    }`,
    ...commonPayNEFTValue?.neftVal,
  };

  //Initial values for Payslip Form
  const accountDetailsForPayslip = {
    PAYSLIPDD: [
      {
        FROM_CERTI_NO: "",
      },
    ],
    INSTRUCTION_REMARKS: `FD PAYMENT:-${
      rows?.[0]?.data?.BRANCH_CD?.trim() ?? ""
    }-${rows?.[0]?.data?.ACCT_TYPE?.trim() ?? ""}-${
      rows?.[0]?.data?.ACCT_CD?.trim() ?? ""
    }`,
    DEFAULT_INFAVOUR_OF: FDState?.retrieveFormData?.ACCT_NM ?? "",
    ...commonPayNEFTValue?.payslipVal,
  };

  const getMergedPayslipData = () => {
    if (
      Boolean(FDState?.isBackButton) &&
      FDState?.payslipAndDDData?.PAYSLIPDD?.[0]?.PAYSLIP_NO
    ) {
      return {
        ...FDState?.payslipAndDDData,
        ...commonPayNEFTValue?.payslipVal,
      };
    } else {
      return accountDetailsForPayslip;
    }
  };

  const getMergedBeneficiaryData = () => {
    if (
      Boolean(FDState?.isBackButton) &&
      FDState?.beneficiaryAcctData?.BENEFIACCTDTL?.[0]?.TO_ACCT_NO
    ) {
      return {
        ...FDState?.beneficiaryAcctData,
        ...commonPayNEFTValue?.neftVal,
      };
    } else {
      return accountDetailsForBen;
    }
  };

  let reqParam = {
    A_LOGIN_BR: authState?.user?.branchCode ?? "",
    A_COMP_CD: authState?.companyID ?? "",
    A_BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
    A_ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
    A_ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
    A_FD_NO: rows?.[0]?.data?.FD_NO ?? "",
    A_IS_PREMATURE: FDState?.checkAllowFDPayApiData?.IS_PREMATURE ?? "",
    A_PRE_RATE:
      FDState?.checkAllowFDPayApiData?.IS_PREMATURE === "Y"
        ? FDState?.prematureRateData?.INT_RATE
        : "",
    A_SPL_AMT: FDState?.fdParaDetailData?.SPL_AMT ?? "",
    A_TDS_METHOD: FDState?.fdParaDetailData?.TDS_METHOD ?? "",
    WORKING_DATE: authState?.workingDate ?? "",
    A_INT_RATE: "",
    A_PAID_DT: "",
  };
  //Set data into ref for insert api
  saveDataRef.current = {
    data: {
      TRAN_CD: FDState?.fdParaDetailData?.DOUBLE_TRAN ?? "",
      COMM_TYPE_CD: "",
      TOT_DD_NEFT_AMT:
        Boolean(FDState?.fdSavedPaymentData.PAYSLIP) ||
        Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
          ? FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0
          : "",
      PAY_FOR: "",
      SDC: "",
      PAY_SLIP_NEFT_DTL: [],
      REMARKS: "",
      DD_NEFT: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
        ? "NEFT"
        : Boolean(FDState?.fdSavedPaymentData.PAYSLIP)
        ? "DD"
        : "",
      DD_NEFT_PAY_AMT:
        Boolean(FDState?.fdSavedPaymentData.PAYSLIP) ||
        Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
          ? FDState?.fdSavedPaymentData?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0
          : "",
      SCROLL1: FDState?.validatePaymetEntryData?.SCROLL1 ?? "",
      REQUEST_CD: "0",
      SCREEN_REF: docCD ?? "",
      FLAG: Boolean(openIntPayment) ? "I" : Boolean(openRenew) ? "R" : "P",
      BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
      ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
      ACCT_CD: FDState?.retrieveFormData?.ACCT_CD ?? "",
      ACCT_NM: FDState?.retrieveFormData?.ACCT_NM ?? "",
      COMP_CD: authState?.companyID ?? "",
    },
  };

  //Mutation for get Payment/Renew and Int payment form data
  const getFDPaymentDtlMutation: any = useMutation(
    "getFDPaymentDtl",
    API.getFDPaymentDtl,
    {
      onError: () => {},
      onSuccess: async (data) => {
        for (const response of data?.[0]?.MSG ?? []) {
          if (response?.O_STATUS === "999") {
            await MessageBox({
              messageTitle: response?.O_MSG_TITLE?.length
                ? response?.O_MSG_TITLE
                : "ValidationFailed",
              message: response?.O_MESSAGE ?? "",
              icon: "ERROR",
            });
          } else if (response?.O_STATUS === "9") {
            await MessageBox({
              messageTitle: response?.O_MSG_TITLE?.length
                ? response?.O_MSG_TITLE
                : "Alert",
              message: response?.O_MESSAGE ?? "",
              icon: "WARNING",
            });
          } else if (response?.O_STATUS === "99") {
            const buttonName = await MessageBox({
              messageTitle: response?.O_MSG_TITLE?.length
                ? response?.O_MSG_TITLE
                : "Confirmation",
              message: response?.O_MESSAGE ?? "",
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              icon: "CONFIRM",
            });
            if (buttonName === "No") {
              break;
            }
          } else if (response?.O_STATUS === "0") {
            updateFDPaymentData(data?.[0]);
          }
        }
        CloseMessageBox();
      },
    }
  );

  //Mutation for Validate Payment/Renew and Int payment entry
  const validatePaymetEntry: any = useMutation(
    "validatePaymetEntry",
    API.validatePaymetEntry,
    {
      onError: () => {},
      onSuccess: () => {},
    }
  );

  //Form Header title
  const formHeaderContent = useMemo(() => {
    const formName = Boolean(openRenew)
      ? t("Renew")
      : Boolean(openIntPayment)
      ? t("InterestPayment")
      : t("Payment");
    let label2 = `${formName} of A/c No.: ${
      FDState?.retrieveFormData?.BRANCH_CD?.trim() ?? ""
    }-${FDState?.retrieveFormData?.ACCT_TYPE?.trim() ?? ""}-${
      FDState?.retrieveFormData?.ACCT_CD?.trim() ?? ""
    } ${
      FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""
    }\u00A0\u00A0\u00A0\u00A0FD No.: ${rows?.[0]?.data?.FD_NO}`;
    return label2;
  }, [
    openRenew,
    openIntPayment,
    FDState?.retrieveFormData?.BRANCH_CD,
    FDState?.retrieveFormData?.ACCT_TYPE,
    FDState?.retrieveFormData?.ACCT_CD,
    rows?.[0]?.data?.FD_NO,
  ]);

  useEffect(() => {
    if (Boolean(openIntPayment)) {
      getFDPaymentDtlMutation.mutate({
        ...reqParam,
        A_FLAG: "I",
      });
    }
  }, []);

  //Mutation for Save FD payment details
  const saveFDPaymentDtlsMutation = useMutation(API.saveFDPaymentDtls, {
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
    onSuccess: async (data) => {
      for (const response of data ?? []) {
        if (response?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "ValidationFailed",
            message: response?.O_MESSAGE ?? "",
            icon: "ERROR",
          });
        } else if (response?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "VouchersConfirmation",
            message: response?.O_MESSAGE ?? "",
            icon: "WARNING",
          });
        } else if (response?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "Confirmation",
            message: response?.O_MESSAGE ?? "",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            if (response?.O_COLUMN_NM === "PRINTADVICE") {
              isDataChangedRef.current = true;
              updateSourceAcctFormData([
                {
                  ACCT_NAME: "",
                },
              ]);
              setOpenPaymentAdvice(true);
              CloseMessageBox();
              break;
            }
          } else {
            isDataChangedRef.current = true;
            CloseMessageBox();
            handleDialogClose();
            updateSourceAcctFormData([
              {
                ACCT_NAME: "",
              },
            ]);
            break;
          }
        } else if (response?.O_STATUS === "0") {
          isDataChangedRef.current = true;
          CloseMessageBox();
          handleDialogClose();
          updateSourceAcctFormData([
            {
              ACCT_NAME: "",
            },
          ]);
        }
      }
    },
  });

  //Payment form submit handler
  const paymentFormSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);
    const formData = data;

    datesComObjRef.current = {
      CM_TDS_FROM: formatDate(data.CM_TDS_FROM),
      FROM_DT: formatDate(data.FROM_DT),
      INT_PAID_DT: formatDate(data.INT_PAID_DT),
      PAID_DT: formatDate(data.PAID_DT),
      PROV_DT: formatDate(data.PROV_DT),
      TDS_DT: formatDate(data.TDS_DT),
      TRAN_DT: formatDate(data.TRAN_DT),
      MATURITY_DT: formatDate(data.MATURITY_DT),
      OPEN_DT: formatDate(rows?.[0]?.data?.ENTERED_DATE),
    };

    updateRenewTrnsFormData({
      PAYMENT_AMOUNT: data?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0,
      RENEW_AMT: data?.TRANSFER_TOTAL_FOR_NEXT_FORM ?? 0,
    });

    updateFdSavedPaymentData({
      ...data,
      ...datesComObjRef.current,
      CR_BRANCH_CD: rows?.[0]?.data?.CR_BRANCH_CD ?? "",
      CR_ACCT_CD: rows?.[0]?.data?.CR_ACCT_CD ?? "",
      CR_ACCT_TYPE: rows?.[0]?.data?.CR_ACCT_TYPE ?? "",
      CR_ACCT_NM: rows?.[0]?.data?.CR_ACCT_NM ?? "",
      CR_COMP_CD: rows?.[0]?.data?.CR_COMP_CD ?? "",
    });
    const openNextPageHandler = (response) => {
      if (response?.NEXT_PAGE === "CRTRF") {
        setOpenTrnsForm(true);
      } else if (response?.NEXT_PAGE === "DRTRF") {
        setOpenTrnsForm(true);
      } else if (response?.NEXT_PAGE === "NEFT") {
        setOpenNeftForm(true);
      } else if (response?.NEXT_PAGE === "PAYSLIP") {
        setOpenPayslipForm(true);
      } else if (response?.NEXT_PAGE === "RENEW") {
        setOpenRenewTrnsForm(true);
      }
      setActiveStep(FDState?.activeStep + 1);
    };
    const savedFormData = {
      ...saveDataRef?.current?.data,
      TRANSACTION_PMT_DTL: [],
      FD_DETAIL_PMT_DATA: {
        ...formData,
        ...datesComObjRef.current,
        COMP_CD: authState?.companyID ?? "",
        TERM_CD: FDState?.fdParaDetailData.TERM_CD ?? "",
        INT_RATE: FDState?.fdPaymentData.INT_RATE ?? "",
        TOT_AMT: FDState?.fdPaymentData.TOT_AMT ?? "",
        TDS_APPLICABLE: FDState?.fdPaymentData.TDS_APPLICABLE ?? "",
        TDS_RATE: FDState?.fdPaymentData.TDS_RATE ?? "",
        CATEG_CD: FDState?.fdPaymentData.CATEG_CD ?? "",
        PAYSLIP: Boolean(formData?.PAYSLIP) ? "Y" : "N",
        RTGS_NEFT: Boolean(formData?.RTGS_NEFT) ? "Y" : "N",
      },
    };

    if (Number(data?.PROV_AMT) === Number(data?.FINAL_TOT_AMT)) {
      const buttonName = await MessageBox({
        messageTitle: "Confirmation",
        message: "Proceed?",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        validatePaymetEntry.mutate(
          {
            A_COMP_CD: authState?.companyID ?? "",
            A_BRANCH_CD: authState?.user?.branchCode ?? "",
            A_DATA: {
              ...data,
              ...datesComObjRef.current,
              RTGS_NEFT: Boolean(data?.RTGS_NEFT) ? "Y" : "N",
              PAYSLIP: Boolean(data?.PAYSLIP) ? "Y" : "N",
              TOT_AMT: rows?.[0]?.data?.TOT_AMT ?? "",
            },
            A_FLAG: Boolean(openIntPayment)
              ? "I"
              : Boolean(openPayment)
              ? "P"
              : Boolean(openRenew)
              ? "R"
              : "",
            A_TDS_METHOD: data?.TDS_METHOD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            A_SCREEN_REF: docCD ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          },
          {
            onSuccess: async (data) => {
              updateValidatePaymetEntryData(data?.[0]);
              for (const response of data ?? []) {
                if (response?.O_STATUS === "999") {
                  await MessageBox({
                    messageTitle: response?.O_MSG_TITLE?.length
                      ? response?.O_MSG_TITLE
                      : "ValidationFailed",
                    message: response?.O_MESSAGE ?? "",
                    icon: "ERROR",
                  });
                } else if (response?.O_STATUS === "9") {
                  await MessageBox({
                    messageTitle: response?.O_MSG_TITLE?.length
                      ? response?.O_MSG_TITLE
                      : "Alert",
                    message: response?.O_MESSAGE ?? "",
                    icon: "WARNING",
                  });
                } else if (response?.O_STATUS === "99") {
                  const buttonName = await MessageBox({
                    messageTitle: response?.O_MSG_TITLE?.length
                      ? response?.O_MSG_TITLE
                      : "Confirmation",
                    message: response?.O_MESSAGE ?? "",
                    buttonNames: ["Yes", "No"],
                    defFocusBtnName: "Yes",
                    loadingBtnName: ["No"],
                    icon: "CONFIRM",
                  });
                  if (buttonName === "Yes") {
                    openNextPageHandler(response);
                    break;
                  } else {
                    if (!Boolean(openRenew)) {
                      saveFDPaymentDtlsMutation.mutate({
                        ...savedFormData,
                      });
                      break;
                    } else {
                      updateRenewDataForDeposit({ ...savedFormData });
                      setOpenDepositForRenew(true);
                      setActiveStep(FDState?.activeStep + 1);
                    }
                  }
                } else if (response?.O_STATUS === "0") {
                  if (Number(formData?.TRANSFER_TOTAL) <= 0) {
                    if (!Boolean(openRenew)) {
                      const btnName = await MessageBox({
                        messageTitle: "Confirmation",
                        message: "Proceed?",
                        buttonNames: ["Yes", "No"],
                        loadingBtnName: ["Yes"],
                        icon: "CONFIRM",
                      });
                      if (btnName === "Yes") {
                        saveFDPaymentDtlsMutation.mutate({
                          ...savedFormData,
                        });
                      }
                    } else {
                      updateRenewDataForDeposit({ ...savedFormData });
                      setOpenDepositForRenew(true);
                      setActiveStep(FDState?.activeStep + 1);
                    }
                  } else {
                    openNextPageHandler(response);
                  }
                }
              }
              CloseMessageBox();
            },
          }
        );
      }
    } else {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "TotalAmountShouldBeTally",
        icon: "ERROR",
      });
      return;
    }
  };

  //Payslip and Beneficiary form submit handler
  const paysBenefSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);
    const savedFormData = {
      ...FDState?.fdSavedPaymentData,
      ...datesComObjRef.current,
      COMP_CD: authState?.companyID ?? "",
      INT_RATE: FDState?.fdPaymentData.INT_RATE ?? "",
      TOT_AMT: FDState?.fdPaymentData.TOT_AMT ?? "",
      TERM_CD: FDState?.fdParaDetailData.TERM_CD ?? "",
      TDS_APPLICABLE: FDState?.fdPaymentData.TDS_APPLICABLE ?? "",
      TDS_RATE: FDState?.fdPaymentData.TDS_RATE ?? "",
      CATEG_CD: FDState?.fdPaymentData.CATEG_CD ?? "",
      PAYSLIP: Boolean(FDState?.fdSavedPaymentData.PAYSLIP) ? "Y" : "N",
      RTGS_NEFT: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT) ? "Y" : "N",
    };

    if (Boolean(FDState?.fdSavedPaymentData?.PAYSLIP)) {
      if (Number(data?.TOTAL_AMOUNT) !== Number(data?.PAYMENT_AMOUNT)) {
        await MessageBox({
          messageTitle: "PaymentAmountNotTally",
          message: "PayslipAmountShouldTallyWithPaymentAmount",
          icon: "ERROR",
        });
        return;
      } else {
        if (!Boolean(openRenew)) {
          const buttonName = await MessageBox({
            messageTitle: "Confirmation",
            message: "AreYouSureToContinue",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            saveFDPaymentDtlsMutation.mutate({
              ...saveDataRef?.current?.data,
              TRANSACTION_PMT_DTL: [],
              PAY_SLIP_NEFT_DTL: [...data?.PAYSLIPDD],
              FD_DETAIL_PMT_DATA: {
                ...savedFormData,
                RENEW_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
              },
              PAYMENT_TYPE: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
                ? "NEFT"
                : Boolean(FDState?.fdSavedPaymentData.PAYSLIP)
                ? "DD"
                : "",
            });
          }
        } else {
          updateRenewDataForDeposit({
            ...saveDataRef?.current?.data,
            TRANSACTION_PMT_DTL: [],
            PAY_SLIP_NEFT_DTL: [...data?.PAYSLIPDD],
            FD_DETAIL_PMT_DATA: {
              ...savedFormData,
              RENEW_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
            },
            PAYMENT_TYPE: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
              ? "NEFT"
              : Boolean(FDState?.fdSavedPaymentData.PAYSLIP)
              ? "DD"
              : "",
          });
          setOpenDepositForRenew(true);
          updatePayslipAndDDData([...data?.PAYSLIPDD]);
          setActiveStep(FDState?.activeStep + 1);
        }
      }
    } else if (Boolean(FDState?.fdSavedPaymentData?.RTGS_NEFT)) {
      if (Number(data?.TOTAL_AMOUNT) !== Number(data?.PAYMENT_AMOUNT)) {
        await MessageBox({
          messageTitle: "PaymentAmountNotTally",
          message: "NEFTAmountShouldTallyWithPaymentAmount",
          icon: "ERROR",
        });
        return;
      } else {
        const buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: "AreYouSureToContinue",
          buttonNames: ["Yes", "No"],
          defFocusBtnName: "Yes",
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          if (!Boolean(openRenew)) {
            saveFDPaymentDtlsMutation.mutate({
              ...saveDataRef?.current?.data,
              TRANSACTION_PMT_DTL: [],
              PAY_SLIP_NEFT_DTL: [...data?.BENEFIACCTDTL],
              FD_DETAIL_PMT_DATA: {
                ...savedFormData,
                RENEW_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
              },
              PAYMENT_TYPE: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
                ? "NEFT"
                : Boolean(FDState?.fdSavedPaymentData.PAYSLIP)
                ? "DD"
                : "",
            });
          } else {
            updateRenewDataForDeposit({
              ...saveDataRef?.current?.data,
              TRANSACTION_PMT_DTL: [],
              PAY_SLIP_NEFT_DTL: [...data?.BENEFIACCTDTL],
              FD_DETAIL_PMT_DATA: {
                ...savedFormData,
                RENEW_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
              },
              PAYMENT_TYPE: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
                ? "NEFT"
                : Boolean(FDState?.fdSavedPaymentData.PAYSLIP)
                ? "DD"
                : "",
            });
            setOpenDepositForRenew(true);
            updateBeneficiaryAcctData([...data?.BENEFIACCTDTL]);
            CloseMessageBox();
            setActiveStep(FDState?.activeStep + 1);
          }
        }
      }
    }
  };

  //Transfer form submit handler
  const trnsFormSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);

    const savedFormData = {
      ...FDState?.fdSavedPaymentData,
      ...datesComObjRef.current,
      COMP_CD: authState?.companyID ?? "",
      INT_RATE: FDState?.fdPaymentData.INT_RATE ?? "",
      TOT_AMT: FDState?.fdPaymentData.TOT_AMT ?? "",
      TERM_CD: FDState?.fdParaDetailData.TERM_CD ?? "",
      TDS_APPLICABLE: FDState?.fdPaymentData.TDS_APPLICABLE ?? "",
      TDS_RATE: FDState?.fdPaymentData.TDS_RATE ?? "",
      CATEG_CD: FDState?.fdPaymentData.CATEG_CD ?? "",
      PAYSLIP: Boolean(FDState?.fdSavedPaymentData.PAYSLIP) ? "Y" : "N",
      RTGS_NEFT: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT) ? "Y" : "N",
    };

    if (Boolean(openTrnsForm)) {
      const newData = data?.TRNDTLS?.map(
        ({ CHEQUE_DATE, TRAN_BAL, STATUS, TYPE_CD, CHEQUE_NO, ...rest }) => rest
      );

      if (parseFloat(data?.TOTAL_DR_AMOUNT) <= 0) {
        MessageBox({
          messageTitle: "ValidationFailed",
          message: "TotalCreditAmountCantBeZeroNegative",
          icon: "ERROR",
        });
      } else if (
        parseFloat(data?.TOTAL_DR_AMOUNT) !== parseFloat(data?.TOTAL_FD_AMOUNT)
      ) {
        MessageBox({
          messageTitle: "ValidationFailed",
          message: "TotalCreditAmountEqualToTotalFDAmount",
          icon: "ERROR",
        });
      } else if (parseFloat(data?.DIFF_AMOUNT) === 0) {
        if (!Boolean(openRenew)) {
          const buttonName = await MessageBox({
            messageTitle: "Confirmation",
            message: "Proceed?",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            saveFDPaymentDtlsMutation.mutate({
              ...saveDataRef?.current?.data,
              TRANSACTION_PMT_DTL: [...newData],
              FD_DETAIL_PMT_DATA: {
                ...savedFormData,
                RENEW_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
                PAYSLIP: Boolean(FDState?.fdSavedPaymentData.PAYSLIP)
                  ? "Y"
                  : "N",
                RTGS_NEFT: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
                  ? "Y"
                  : "N",
              },
            });
          }
        } else {
          updateRenewDataForDeposit({
            ...saveDataRef?.current?.data,
            TRANSACTION_PMT_DTL: [...newData],
            FD_DETAIL_PMT_DATA: {
              ...savedFormData,
              RENEW_AMT: FDState?.renewTrnsFormData.RENEW_AMT ?? "",
              PAYSLIP: Boolean(FDState?.fdSavedPaymentData.PAYSLIP) ? "Y" : "N",
              RTGS_NEFT: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
                ? "Y"
                : "N",
            },
          });
          setOpenDepositForRenew(true);
          setActiveStep(FDState?.activeStep + 1);
        }
      }
    } else if (Boolean(openRenewTrnsForm)) {
      updateRenewTrnsFormData(data);
      if (
        parseFloat(data?.PAYMENT_AMOUNT ?? 0) > parseFloat(data?.RENEW_AMT ?? 0)
      ) {
        const buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: `${t("AreYouSureToRenewLessThenPaymentAmountFDMsg", {
            paymentAmount: data?.PAYMENT_AMOUNT,
          })}`,
          buttonNames: ["Yes", "No"],
          defFocusBtnName: "Yes",
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });

        if (buttonName === "Yes") {
          if (Boolean(FDState?.fdSavedPaymentData?.PAYSLIP)) {
            setOpenPayslipForm(true);
            setRenewTrnsVal(
              Number(data?.PAYMENT_AMOUNT) - Number(data?.RENEW_AMT)
            );
          } else if (Boolean(FDState?.fdSavedPaymentData?.RTGS_NEFT)) {
            setOpenNeftForm(true);
            setRenewTrnsVal(
              Number(data?.PAYMENT_AMOUNT) - Number(data?.RENEW_AMT)
            );
          } else {
            setOpenTrnsForm(true);
            setRenewTrnsVal(
              Number(data?.PAYMENT_AMOUNT) - Number(data?.RENEW_AMT)
            );
          }
          setActiveStep(FDState?.activeStep + 1);
          CloseMessageBox();
        }
        return {};
      } else if (
        parseFloat(data?.PAYMENT_AMOUNT ?? 0) ===
        parseFloat(data?.RENEW_AMT ?? 0)
      ) {
        setRenewTrnsVal(Number(data?.PAYMENT_AMOUNT) - Number(data?.RENEW_AMT));
        updateRenewDataForDeposit({
          ...saveDataRef?.current?.data,
          TRANSACTION_PMT_DTL: [],
          FD_DETAIL_PMT_DATA: {
            ...savedFormData,
            RENEW_AMT: data?.RENEW_AMT ?? "",
            PAYSLIP: Boolean(FDState?.fdSavedPaymentData.PAYSLIP) ? "Y" : "N",
            RTGS_NEFT: Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)
              ? "Y"
              : "N",
          },
        });
        setOpenDepositForRenew(true);
        setActiveStep(FDState?.activeStep + 1);
      }
    }
  };

  //Call submit handler based on conditions
  const handleComplete = (e) => {
    if (!Boolean(openRenew)) {
      if (FDState.activeStep === 0) {
        fdPmtFormRef.current?.handleSubmit(e);
        setIsBackButton(false);
      } else if (FDState.activeStep === 1) {
        if (Boolean(openPayslipForm)) {
          payslipAndDDRef.current?.handleSubmit(e);
          setIsBackButton(false);
        } else if (Boolean(openNeftForm)) {
          beneficiaryAcctRef.current?.handleSubmit(e);
          setIsBackButton(false);
        } else {
          sourceAcctformRef.current?.handleSubmit(e);
        }
      }
    } else {
      if (FDState.activeStep === 0) {
        fdPmtFormRef.current?.handleSubmit(e);
      } else if (FDState.activeStep === 1) {
        if (Boolean(openPayslipForm)) {
          payslipAndDDRef.current?.handleSubmit(e);
        } else if (Boolean(openNeftForm)) {
          beneficiaryAcctRef.current?.handleSubmit(e);
        } else {
          sourceAcctformRef.current?.handleSubmit(e);
        }
      } else if (FDState.activeStep === 2) {
        if (Number(renewTrnsVal) > 0) {
          if (Boolean(FDState?.fdSavedPaymentData.PAYSLIP)) {
            payslipAndDDRef.current?.handleSubmit(e);
          } else if (Boolean(FDState?.fdSavedPaymentData.RTGS_NEFT)) {
            beneficiaryAcctRef.current?.handleSubmit(e);
          } else {
            sourceAcctformRef.current?.handleSubmit(e);
          }
        } else {
          depositForRenewformRef.current?.handleSubmit(e);
        }
      } else if (FDState.activeStep === 3) {
        depositForRenewformRef.current?.handleSubmit(e);
      }
    }
  };

  const handleBackBtn = () => {
    setOpenPayslipForm(false);
    if (FDState.activeStep === 1) {
      setActiveStep(FDState?.activeStep - 1);
      setOpenPayslipForm(false);
      setOpenNeftForm(false);
      setOpenTrnsForm(false);
      setOpenRenewTrnsForm(false);
      setIsBackButton(true);
    } else if (FDState.activeStep === 2) {
      setActiveStep(FDState?.activeStep - 1);
      setOpenPayslipForm(false);
      setOpenNeftForm(false);
      setOpenTrnsForm(false);
      setOpenDepositForRenew(false);
      setIsBackButton(true);
    } else if (FDState.activeStep === 3) {
      setActiveStep(FDState?.activeStep - 1);
      setOpenDepositForRenew(false);
      setIsBackButton(true);
    }
  };

  //Set form's name in stepper based on index
  useEffect(() => {
    if (!Boolean(openRenew)) {
      if (Boolean(openPayslipForm)) {
        setSteps([t("FD Details"), t("PayslipAndDemandDraft")]);
      } else if (Boolean(openNeftForm)) {
        setSteps([t("FD Details"), t("BeneficiaryACDetails")]);
      } else if (Boolean(openTrnsForm)) {
        setSteps([t("FD Details"), t("Credit A/c Details")]);
      } else {
        setSteps([t("FD Details"), t("Credit A/c Details")]);
      }
    } else if (Boolean(openRenew)) {
      if (FDState?.activeStep === 3) {
        if (Boolean(FDState?.fdSavedPaymentData?.PAYSLIP)) {
          setSteps([
            t("FD Details"),
            t("Renew Amount"),
            t("PayslipAndDemandDraft"),
            t("Renew Deposit Details"),
          ]);
        } else if (Boolean(FDState?.fdSavedPaymentData?.RTGS_NEFT)) {
          setSteps([
            t("FD Details"),
            t("Renew Amount"),
            t("BeneficiaryACDetails"),
            t("Renew Deposit Details"),
          ]);
        } else {
          setSteps([
            t("FD Details"),
            t("Renew Amount"),
            t("Credit A/c Details"),
            t("Renew Deposit Details"),
          ]);
        }
      } else if (FDState.activeStep === 2) {
        if (Number(renewTrnsVal) > 0) {
          if (Boolean(FDState?.fdSavedPaymentData?.PAYSLIP)) {
            setSteps([
              t("FD Details"),
              t("Renew Amount"),
              t("PayslipAndDemandDraft"),
              t("Renew Deposit Details"),
            ]);
          } else if (Boolean(FDState?.fdSavedPaymentData?.RTGS_NEFT)) {
            setSteps([
              t("FD Details"),
              t("Renew Amount"),
              t("BeneficiaryACDetails"),
              t("Renew Deposit Details"),
            ]);
          } else {
            setSteps([
              t("FD Details"),
              t("Renew Amount"),
              t("Credit A/c Details"),
              t("Renew Deposit Details"),
            ]);
          }
        } else {
          setSteps([
            t("FD Details"),
            t("Renew Amount"),
            t("Renew Deposit Details"),
          ]);
        }
      } else if (FDState.activeStep === 1) {
        if (Boolean(openRenewTrnsForm)) {
          setSteps([
            t("FD Details"),
            t("Renew Amount"),
            t("Renew Deposit Details"),
          ]);
        } else {
          setSteps([t("FD Details"), t("Renew Deposit Details")]);
        }
      } else {
        setSteps([t("FD Details"), t("Renew Deposit Details")]);
      }
    }
  }, [FDState]);

  //Mutation for Validate new FD details
  const validateFDDetailsMutationForRenew = useMutation(
    API?.validateFDDetails,
    {
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
      onSuccess: () => {},
    }
  );

  //Mutation for Save FD renew and deposit details
  const saveFDRenewDepositDtlMutation = useMutation(API.saveFDRenewDepositDtl, {
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
    onSuccess: async (data) => {
      for (const obj of data ?? []) {
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
            buttonNames: obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
            icon:
              obj?.O_STATUS === "999"
                ? "ERROR"
                : obj?.O_STATUS === "99"
                ? "CONFIRM"
                : obj?.O_STATUS === "9"
                ? "WARNING"
                : "INFO",
          });
          if (obj?.O_STATUS === "999") {
            break;
          }
          if (obj?.O_STATUS === "99" && buttonName === "No") {
            isDataChangedRef.current = true;
            CloseMessageBox();
            handleDialogClose();
            updateSourceAcctFormData([
              {
                ACCT_NAME: "",
              },
            ]);
            break;
          }
        } else if (obj?.O_STATUS === "0") {
          setOpenPaymentAdvice(true);
          CloseMessageBox();
        }
      }
    },
  });

  // Detail form submit handler for renew
  const renewDetailsSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);

    if (data) {
      const formatedData = {
        ...data,
        TRAN_DT: data?.TRAN_DT
          ? format(new Date(data?.TRAN_DT), "dd/MMM/yyyy")
          : "",
        MATURITY_DT: data?.MATURITY_DT
          ? format(new Date(data?.MATURITY_DT), "dd/MMM/yyyy")
          : "",
      };

      updateSourceAcctFormData([
        {
          ACCT_NAME: "",
        },
      ]);
      if (!Boolean(data?.MATURITY_AMT) || parseFloat(data?.MATURITY_AMT) <= 0) {
        MessageBox({
          messageTitle: t("ValidationFailed"),
          message: "TotalAmountCantbeZeroNegative",
          icon: "ERROR",
        });
      } else {
        await validateFDDetailsMutationForRenew?.mutate(
          {
            FD_DETAIL_DATA: [{ ...formatedData }],
            SCREEN_REF: docCD ?? "",
          },
          {
            onSuccess: async (data) => {
              for (const obj of data ?? []) {
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
                      obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                    loadingBtnName: ["Yes"],
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
                    obj?.O_STATUS === "999" ||
                    (obj?.O_STATUS === "99" && buttonName === "No")
                  ) {
                    break;
                  }
                } else if (obj?.O_STATUS === "0") {
                  saveFDRenewDepositDtlMutation?.mutate({
                    FD_DETAIL_DATA: [{ ...formatedData }],
                    ...FDState?.renewDataForDeposit,
                    TRANSACTION_DTL: [],
                  });
                }
              }
            },
          }
        );
      }
    }
  };

  const handleCloseAdvice = () => {
    isDataChangedRef.current = true;
    handleDialogClose();
  };

  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
            position: "relative",
            padding: "0 10px 10px 10px",
            height: "auto",
          },
        }}
        maxWidth="xl"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            handleDialogClose();
          }
        }}
        className="fdPmtDlg"
      >
        <>
          <Box
            sx={{
              position: "sticky",
              top: 0,
              minHeight: "118px",
              zIndex: 1,
              overflow: "hidden",
            }}
          >
            <AppBar
              style={{ marginBottom: "22px", position: "relative" }}
              className="form__header"
            >
              <Toolbar variant="dense" className={headerClasses.root}>
                <Typography
                  component="span"
                  variant="h5"
                  className={headerClasses.title}
                >
                  {formHeaderContent}
                </Typography>

                <GradientButton onClick={handleDialogClose}>
                  {t("Close")}
                </GradientButton>
              </Toolbar>
            </AppBar>
            <Stack
              sx={{
                width: "100%",
                position: "relative",
              }}
              spacing={4}
            />
            <Stepper
              alternativeLabel
              activeStep={FDState?.activeStep}
              connector={<ColorlibConnector />}
            >
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconComponent={ColorlibStepIcon}
                    componentsProps={{
                      label: {
                        style: {
                          marginTop: "2px",
                          color: "var(--theme-color1)",
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <div
            style={{
              marginTop: "0px",
              overflowY: "auto",
              maxHeight: "calc(80vh - 150px)",
              borderBottom: "2px solid var(--theme-color4)",
            }}
          >
            {FDState?.activeStep === 0 ? (
              !Object.keys(FDState?.fdPaymentData).length &&
              !getFDPaymentDtlMutation?.isError &&
              !fdPmtDtlMutError?.isError &&
              !saveFDRenewDepositDtlMutation?.isError &&
              !validateFDDetailsMutationForRenew?.isError ? (
                <LoaderPaperComponent />
              ) : (
                <>
                  {(getFDPaymentDtlMutation?.isError ||
                    fdPmtDtlMutError?.isError ||
                    validatePaymetEntry?.isError ||
                    saveFDRenewDepositDtlMutation?.isError ||
                    validateFDDetailsMutationForRenew?.isError) && (
                    <Alert
                      severity="error"
                      errorMsg={
                        (fdPmtDtlMutError?.error?.error_msg ||
                          getFDPaymentDtlMutation?.error?.error_msg ||
                          validatePaymetEntry?.error?.error_msg ||
                          saveFDRenewDepositDtlMutation?.error?.error_msg ||
                          validateFDDetailsMutationForRenew?.error
                            ?.error_msg) ??
                        t("Somethingwenttowrong")
                      }
                      errorDetail={
                        fdPmtDtlMutError?.error?.error_detail ||
                        getFDPaymentDtlMutation?.error?.error_detail ||
                        validatePaymetEntry?.error?.error_detail ||
                        saveFDRenewDepositDtlMutation?.error?.error_detail ||
                        validateFDDetailsMutationForRenew?.error?.error_detail
                      }
                      color="error"
                    />
                  )}
                  <Box style={{ minWidth: "1200px", overflowY: "auto" }}>
                    <AppBar style={{ position: "sticky" }}>
                      <Toolbar variant="dense" className={headerClasses.root}>
                        <Typography
                          component="span"
                          variant="h5"
                          className={headerClasses.title}
                        >
                          FD Details
                        </Typography>
                      </Toolbar>
                    </AppBar>
                    <FDPayment
                      isDataChangedRef={isDataChangedRef}
                      openRenew={openRenew}
                      openPayment={openPayment}
                      paymentFormSubmitHandler={paymentFormSubmitHandler}
                      ref={fdPmtFormRef}
                      reqParam={reqParam}
                      openIntPayment={openIntPayment}
                    />
                  </Box>
                </>
              )
            ) : FDState?.activeStep === 1 ? (
              Boolean(openPayslipForm) ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.title}
                      >
                        {t("PayslipAndDemandDraft")}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <PayslipAndDDForm
                    defaultView="new"
                    accountDetailsForPayslip={getMergedPayslipData()}
                    onSubmitHandler={paysBenefSubmitHandler}
                    ref={payslipAndDDRef}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : Boolean(openNeftForm) ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.title}
                      >
                        {t("BeneficiaryACDetails")}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <BeneficiaryAcctDetailsForm
                    defaultView="new"
                    onSubmitHandler={paysBenefSubmitHandler}
                    accountDetailsForBen={getMergedBeneficiaryData()}
                    ref={beneficiaryAcctRef}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : Boolean(openRenewTrnsForm) ? (
                <>
                  <TransferAcctDetailForm
                    onSubmitHandler={trnsFormSubmitHandler}
                    ref={sourceAcctformRef}
                    openRenewTrnsForm={openRenewTrnsForm}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.title}
                      >
                        {t("Credit A/c Details")}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <TransferAcctDetailForm
                    screenFlag="paymentTransfer"
                    onSubmitHandler={trnsFormSubmitHandler}
                    ref={sourceAcctformRef}
                    openTrnsForm={openTrnsForm}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              )
            ) : FDState?.activeStep === 2 ? (
              Boolean(FDState?.fdSavedPaymentData?.PAYSLIP) &&
              Number(renewTrnsVal) > 0 &&
              !Boolean(openDepositForRenew) ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.title}
                      >
                        {t("PayslipAndDemandDraft")}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <PayslipAndDDForm
                    defaultView="new"
                    accountDetailsForPayslip={getMergedPayslipData()}
                    onSubmitHandler={paysBenefSubmitHandler}
                    ref={payslipAndDDRef}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : Boolean(FDState?.fdSavedPaymentData?.RTGS_NEFT) &&
                Number(renewTrnsVal) > 0 &&
                !Boolean(openDepositForRenew) ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.title}
                      >
                        {t("BeneficiaryACDetails")}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <BeneficiaryAcctDetailsForm
                    defaultView="new"
                    onSubmitHandler={paysBenefSubmitHandler}
                    accountDetailsForBen={getMergedBeneficiaryData()}
                    ref={beneficiaryAcctRef}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : Boolean(openDepositForRenew) ? (
                <>
                  <FDDetailForm
                    isDataChangedRef={isDataChangedRef}
                    openDepositForRenew={true}
                    ref={depositForRenewformRef}
                    renewDetailsSubmitHandler={renewDetailsSubmitHandler}
                  />
                </>
              ) : (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.title}
                      >
                        {t("Credit A/c Details")}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <TransferAcctDetailForm
                    screenFlag="paymentTransfer"
                    onSubmitHandler={trnsFormSubmitHandler}
                    ref={sourceAcctformRef}
                    openTrnsForm={openTrnsForm}
                    renewTrnsVal={renewTrnsVal}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              )
            ) : FDState?.activeStep === 3 ? (
              <>
                <FDDetailForm
                  isDataChangedRef={isDataChangedRef}
                  openDepositForRenew={true}
                  ref={depositForRenewformRef}
                  renewDetailsSubmitHandler={renewDetailsSubmitHandler}
                />
              </>
            ) : (
              <></>
            )}
          </div>

          <Box
            sx={{
              display: "flex",
              margin: "0px !important",
              justifyContent: "right",
              paddingTop: "10px",
            }}
          >
            {FDState?.activeStep === 0 ? null : (
              <GradientButton onClick={handleBackBtn}>
                {t("Back")}
              </GradientButton>
            )}
            {FDState?.activeStep !== steps.length && (
              <>
                {FDState?.activeStep !== steps.length - 1 ? (
                  <GradientButton
                    onClick={handleComplete}
                    endIcon={
                      validatePaymetEntry?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    disabled={
                      validatePaymetEntry?.isLoading ||
                      getFDPaymentDtlMutation?.isError ||
                      fdPmtDtlMutError?.isError ||
                      validatePaymetEntry?.isError ||
                      FDState?.disableButton
                    }
                    color={"primary"}
                  >
                    {t("Next")}
                  </GradientButton>
                ) : (
                  <GradientButton
                    endIcon={
                      validateFDDetailsMutationForRenew?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    disabled={
                      validateFDDetailsMutationForRenew?.isLoading ||
                      FDState?.disableButton
                    }
                    onClick={handleComplete}
                    color={"primary"}
                  >
                    {t("Finish")}
                  </GradientButton>
                )}
              </>
            )}
          </Box>
        </>
      </Dialog>

      {/*Open Payment Advice component */}
      {openPaymentAdvice ? (
        <FdPaymentAdvicePrint
          closeDialog={handleCloseAdvice}
          requestData={{
            BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
            ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
            FD_NO: rows?.[0]?.data?.FD_NO ?? "",
            A_FLAG: "P",
          }}
          setOpenAdvice={setOpenPaymentAdvice}
          screenFlag={"FDEntry"}
        />
      ) : null}
    </>
  );
};
export default FDPaymentStepperForm;
