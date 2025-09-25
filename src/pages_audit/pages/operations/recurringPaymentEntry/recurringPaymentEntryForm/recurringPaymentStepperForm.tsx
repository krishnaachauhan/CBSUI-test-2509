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
  Chip,
} from "@mui/material";
import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { RecurringContext } from "../context/recurringPaymentContext";
import { RecurringPaymentEntryForm } from "./recurringPaymentEntryForm";
import { RecurringPaymentTransferForm } from "./recurringPaymentTransferForm";
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
import { PayslipAndDDForm } from "../payslipAndNEFT/payslipAndDDForm";
import { BeneficiaryAcctDetailsForm } from "../payslipAndNEFT/beneficiaryAcctDetailsForm";
import ClosingAdvice from "../closingAdvice";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import CommonSvgIcons from "assets/icons/commonSvg/commonSvgIcons";
import {
  GradientButton,
  usePopupContext,
  queryClient,
  utilFunction,
  SubmitFnType,
} from "@acuteinfo/common-base";
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
  formHeaderTitle: {
    margin: "0",
    fontWeight: "500",
    fontSize: "1.25rem",
    lineHeight: "1.6",
    letterSpacing: "0.0075em",
    color: "var(--theme-color2)",
  },
}));

const RecurringPaymentStepperForm = ({
  closeDialog,
  defaultView,
  isDataChangedRef,
  entryScreenFlagData,
}) => {
  const { t } = useTranslation();
  const {
    rpState,
    setActiveStep,
    resetAllData,
    setIsBackButton,
    updateRecurPmtEntryData,
    updateSaveValidationData,
    updateBeneficiaryAcctData,
    updatePayslipAndDDData,
    updateDataForJasperParam,
    updateRecurPmtTransferData,
    handleDisableButton,
  } = useContext(RecurringContext);
  const { authState } = useContext(AuthContext);
  const [steps, setSteps] = useState([
    t("RecurringPaymentEntry"),
    t("RecurringPaymentTransfer"),
  ]);
  const recPmtEntryRef: any = useRef(null);
  const recPmtTransferRef: any = useRef(null);
  const payslipAndDDRef: any = useRef(null);
  const beneficiaryAcctRef: any = useRef(null);
  const headerClasses = useTypeStyles();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const saveDataRef = useRef<any>(null);
  let currentPath = useLocation().pathname;
  const [openClosingAdvice, setOpenClosingAdvice] = useState(false);
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    //Stepper icons
    const icons: { [index: string]: React.ReactElement } = {
      1: <CommonSvgIcons iconName={"DISBDTL"} />,
      2: <CommonSvgIcons iconName={"ACHOW"} />,
      3: Boolean(rpState?.recurPmtEntryData?.PAYSLIP) ? (
        <CommonSvgIcons iconName={"CHQ"} />
      ) : (
        <CommonSvgIcons iconName={"TEMPOD"} />
      ),
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

  //Initial values For Beneficiary Form
  const accountDetailsForBen = {
    BENEFIACCTDTL: [
      {
        AMOUNT:
          Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
          Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0),
      },
    ],
    DEFAULT_REMARKS: `Recurring A/c Payment ${
      authState?.companyID?.trim() ?? ""
    }${rpState?.recurPmtEntryData?.BRANCH_CD?.trim() ?? ""}${
      rpState?.recurPmtEntryData?.ACCT_TYPE?.trim() ?? ""
    }${rpState?.recurPmtEntryData?.ACCT_CD?.trim() ?? ""}`,
    PAYMENT_AMOUNT:
      Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
      Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0),
    ACCT_TYPE: rpState?.recurPmtEntryData?.ACCT_TYPE ?? "",
    BRANCH_CD: rpState?.recurPmtEntryData?.BRANCH_CD ?? "",
    ACCT_CD: rpState?.recurPmtEntryData?.ACCT_CD ?? "",
    ENTRY_TYPE: "NEFT",
    SCREEN_NAME: t("BeneficiaryACDetails"),
  };

  //Initial values for Payslip Form
  const accountDetailsForPayslip = {
    PAYSLIPDD: [
      {
        FROM_CERTI_NO: "",
      },
    ],
    INSTRUCTION_REMARKS: `REC PAYMENT:-${
      rpState?.recurPmtEntryData?.BRANCH_CD?.trim() ?? ""
    }-${rpState?.recurPmtEntryData?.ACCT_TYPE?.trim() ?? ""}-${
      rpState?.recurPmtEntryData?.ACCT_CD?.trim() ?? ""
    }`,
    DEFAULT_INFAVOUR_OF: rpState?.recurPmtEntryData?.ACCT_NM ?? "",
    PAYMENT_AMOUNT:
      Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
      Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0),
    ACCT_TYPE: rpState?.recurPmtEntryData?.ACCT_TYPE ?? "",
    BRANCH_CD: rpState?.recurPmtEntryData?.BRANCH_CD ?? "",
    ACCT_CD: rpState?.recurPmtEntryData?.ACCT_CD ?? "",
    SCREEN_REF: docCD ?? "",
    SCREEN_NAME: t("PayslipAndDemandDraft"),
    COMP_CD: authState?.companyID ?? "",
  };

  // Memoized header title
  const payslipAccountTitle = useMemo(() => {
    if (!accountDetailsForPayslip) return "";
    return `${accountDetailsForPayslip.SCREEN_NAME ?? ""} for A/C No.:\u00A0${
      accountDetailsForPayslip.BRANCH_CD?.trim() ?? ""
    }-${accountDetailsForPayslip.ACCT_TYPE?.trim() ?? ""}-${
      accountDetailsForPayslip.ACCT_CD?.trim() ?? ""
    } `;
  }, [
    accountDetailsForPayslip.SCREEN_NAME,
    accountDetailsForPayslip.BRANCH_CD,
    accountDetailsForPayslip.ACCT_TYPE,
    accountDetailsForPayslip.ACCT_CD,
  ]);

  const beneficiaryAccountTitle = useMemo(() => {
    if (!accountDetailsForBen) return "";
    return `${accountDetailsForBen.SCREEN_NAME ?? ""} for A/C No.:\u00A0${
      accountDetailsForBen.BRANCH_CD?.trim() ?? ""
    }-${accountDetailsForBen.ACCT_TYPE?.trim() ?? ""}-${
      accountDetailsForBen.ACCT_CD?.trim() ?? ""
    } `;
  }, [
    accountDetailsForBen.SCREEN_NAME,
    accountDetailsForBen.BRANCH_CD,
    accountDetailsForBen.ACCT_TYPE,
    accountDetailsForBen.ACCT_CD,
  ]);

  //Set data into ref for insert api
  saveDataRef.current = {
    data: {
      isNewRow: true,
      ...rpState?.recurPmtEntryData,
      CASH_AMT:
        Number(rpState?.recurPmtEntryData?.CASH_AMT) > 0
          ? rpState?.recurPmtEntryData?.CASH_AMT
          : 0,
      COMP_CD: authState?.companyID ?? "",
      DD_AMT:
        (Boolean(rpState?.recurPmtEntryData?.PAYSLIP) ||
          Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT)) &&
        Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
          Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0) >
          0
          ? Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
            Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0)
          : "",
      TRF_AMT:
        Number(rpState?.recurPmtEntryData?.TRF_AMT ?? 0) > 0
          ? rpState?.recurPmtEntryData?.TRF_AMT
          : "0",
      PAYSLIP: Boolean(rpState?.recurPmtEntryData?.PAYSLIP) ? "Y" : "N",
      RTGS_NEFT: Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT) ? "Y" : "N",
      INT_FROM_DT: utilFunction.isValidDate(
        rpState?.recurPmtEntryData?.INT_FROM_DT
      )
        ? format(
            new Date(rpState?.recurPmtEntryData?.INT_FROM_DT),
            "yyyy-MMM-dd"
          ) ?? ""
        : format(new Date(), "yyyy-MMM-dd") ?? "",
      INT_TO_DT: utilFunction.isValidDate(rpState?.recurPmtEntryData?.INT_TO_DT)
        ? format(
            new Date(rpState?.recurPmtEntryData?.INT_TO_DT),
            "yyyy-MMM-dd"
          ) ?? ""
        : format(new Date(), "yyyy-MMM-dd") ?? "",
      SCREEN_REF: docCD ?? "",
      COMM_TYPE_CD: "",
      TOT_DD_NEFT_AMT:
        Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
        Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0),
      PAY_FOR: "",
      SDC: "",
      DD_NEFT: Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT)
        ? "NEFT"
        : Boolean(rpState?.recurPmtEntryData?.PAYSLIP)
        ? "DD"
        : "",
      REQUEST_CD: "0",
      THROUGH_CHANNEL: "",
      REMARKS: "",
      DD_NEFT_PAY_AMT:
        Number(rpState?.recurPmtEntryData?.TOTAL_AMOUNT ?? 0) -
        Number(rpState?.recurPmtEntryData?.PAYMENT_AMT ?? 0),
    },
  };

  //Mutation for Insert Data
  const recurringPaymentEntrySaveMutation = useMutation(
    API?.recurringPaymentEntryDML,
    {
      onError: async (error: any) => {
        CloseMessageBox();
      },
      onSuccess: async (data) => {
        for (const obj in data[0]) {
          if (obj === "NEFT_DD_MSG") {
            for (const ddNeftObj of data[0][obj] ?? []) {
              if (ddNeftObj?.O_STATUS === "999") {
                await MessageBox({
                  messageTitle: ddNeftObj?.O_MSG_TITLE?.length
                    ? ddNeftObj?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: ddNeftObj?.O_MESSAGE ?? "",
                  icon: "ERROR",
                });
              } else if (ddNeftObj?.O_STATUS === "9") {
                await MessageBox({
                  messageTitle: ddNeftObj?.O_MSG_TITLE?.length
                    ? ddNeftObj?.O_MSG_TITLE
                    : "Alert",
                  message: ddNeftObj?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              } else if (ddNeftObj?.O_STATUS === "99") {
                const buttonName = await MessageBox({
                  messageTitle: ddNeftObj?.O_MSG_TITLE?.length
                    ? ddNeftObj?.O_MSG_TITLE
                    : "Confirmation",
                  message: ddNeftObj?.O_MESSAGE ?? "",
                  buttonNames: ["Yes", "No"],
                  defFocusBtnName: "Yes",
                  icon: "CONFIRM",
                });
                if (buttonName === "No") {
                  break;
                }
              }
            }
          } else if (obj === "B_VOUCHER_MSG") {
            for (const voucherMsg of data[0][obj] ?? []) {
              if (voucherMsg?.O_STATUS === "999") {
                await MessageBox({
                  messageTitle: voucherMsg?.O_MSG_TITLE?.length
                    ? voucherMsg?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: voucherMsg?.O_MESSAGE ?? "",
                  icon: "ERROR",
                });
              } else if (voucherMsg?.O_STATUS === "9") {
                await MessageBox({
                  messageTitle: voucherMsg?.O_MSG_TITLE?.length
                    ? voucherMsg?.O_MSG_TITLE
                    : "VouchersConfirmation",
                  message: voucherMsg?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              } else if (voucherMsg?.O_STATUS === "99") {
                const buttonName = await MessageBox({
                  messageTitle: voucherMsg?.O_MSG_TITLE?.length
                    ? voucherMsg?.O_MSG_TITLE
                    : "Confirmation",
                  message: voucherMsg?.O_MESSAGE ?? "",
                  buttonNames: ["Yes", "No"],
                  defFocusBtnName: "Yes",
                  icon: "CONFIRM",
                });
                if (buttonName === "Yes") {
                  let reqParam = {
                    COMP_CD: authState?.companyID ?? "",
                    BRANCH_CD: rpState?.recurPmtEntryData?.BRANCH_CD ?? "",
                    ACCT_TYPE: rpState?.recurPmtEntryData?.ACCT_TYPE ?? "",
                    ACCT_CD: rpState?.recurPmtEntryData?.ACCT_CD ?? "",
                    INT_RATE: rpState?.recurPmtEntryData?.INT_RATE ?? "",
                    INT_AMOUNT: rpState?.recurPmtEntryData?.INT_AMOUNT ?? "",
                    REC_PENALTY_AMT:
                      rpState?.recurPmtEntryData?.REC_PENALTY_AMT ?? "",
                    PENAL_RATE: rpState?.recurPmtEntryData?.PENAL_RATE ?? "",
                    PAYMENT_TYPE:
                      rpState?.recurPmtEntryData?.PREMATURE_VAL ?? "",
                    TRAN_CD: rpState?.onSaveValidationData?.[0]?.TRAN_CD ?? "",
                  };
                  isDataChangedRef.current = true;
                  updateDataForJasperParam(reqParam);
                  setOpenClosingAdvice(true);
                  break;
                } else {
                  isDataChangedRef.current = true;
                  closeDialog();
                  break;
                }
              } else if (voucherMsg?.O_STATUS === "0") {
                isDataChangedRef.current = true;
                closeDialog();
                resetAllData();
              }
            }
          }
        }
        isDataChangedRef.current = true;
        CloseMessageBox();
      },
    }
  );

  //Mutation for Validate Entry form handler
  const onSaveValidationMutation: any = useMutation(
    "onSaveRecurValueValidation",
    API.onSaveRecurValueValidation,
    {
      onSuccess: () => {},
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  const handleCloseAdviceDetails = () => {
    setOpenClosingAdvice(false);
    resetAllData();
    closeDialog();
  };

  //Entry form submit handler
  const recurEntrySubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    let recurData = data;
    endSubmit(true);
    updateRecurPmtEntryData(data);
    updateRecurPmtTransferData([
      {
        TRANS_ACCT_NM: "",
      },
    ]);
    await onSaveValidationMutation.mutate(
      {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        PAYSLIP: Boolean(data?.PAYSLIP) ? "Y" : "N",
        RTGS_NEFT: Boolean(data?.RTGS_NEFT) ? "Y" : "N",
        INT_RATE: data?.INT_RATE ?? "",
        TRAN_BAL: data?.TRAN_BAL ?? "",
        CASH_AMT: data?.CASH_AMT ?? "",
        TRF_AMT: data?.TRF_AMT ?? "0",
        PROV_INT_AMT: data?.PROV_INT_AMT ?? "",
        INT_AMOUNT: data?.INT_AMOUNT ?? "",
        TDS_AMT: data?.TDS_AMT ?? "",
        TOKEN_NO: data?.TOKEN_NO ?? "",
        CR_AMT: data?.CR_AMT ?? "",
        CR_INT_AMT: data?.CR_INT_AMT ?? "",
        REC_PENALTY_AMT: data?.REC_PENALTY_AMT ?? "",
        PREMATURE: data?.PREMATURE_VAL ?? "",
        SCREEN_REF: docCD ?? "",
        TYPE: "C",
        STATUS: data?.STATUS ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      },
      {
        onSuccess: async (data, variables) => {
          let saveData = data;
          updateSaveValidationData(saveData);
          for (const obj of saveData) {
            if (obj?.O_STATUS === "0") {
              if (
                Number(recurData?.CASH_AMT) === Number(recurData?.TOTAL_AMOUNT)
              ) {
                const buttonName = await MessageBox({
                  messageTitle: "Confirmation",
                  message: "AreYouSureToContinue",
                  buttonNames: ["Yes", "No"],
                  defFocusBtnName: "Yes",
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
                if (buttonName === "Yes") {
                  recurringPaymentEntrySaveMutation.mutate({
                    ...saveDataRef.current?.data,
                    TRAN_CD: saveData?.[0]?.TRAN_CD ?? "",
                    CONFIRMED: saveData?.[0]?.CONFIRMED ?? "",
                    SCROLL1: saveData?.[0]?.SCROLL1 ?? "",
                    ACCOUNT_CLOSE: saveData?.[0]?.ACCOUNT_CLOSE ?? "",
                    PAY_SLIP_NEFT_DTL: [],
                    PAYSLIP_NO: "",
                    REC_DTL: [],
                  });
                }
              } else {
                setActiveStep(rpState?.activeStep + 1);
                CloseMessageBox();
              }
            } else if (obj?.O_STATUS === "9") {
              await MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "validationAlert",
                message: obj?.O_MESSAGE ?? "",
                icon: "WARNING",
              });
            } else if (obj?.O_STATUS === "99") {
              const buttonName = await MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "Confirmation",
                message: obj?.O_MESSAGE ?? "",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (buttonName === "Yes") {
                updateSaveValidationData({
                  ...saveData,
                  ACCOUNT_CLOSE: "Y",
                });
                if (
                  Number(recurData?.CASH_AMT) ===
                  Number(recurData?.TOTAL_AMOUNT)
                ) {
                  recurringPaymentEntrySaveMutation.mutate({
                    ...saveDataRef.current?.data,
                    TRAN_CD: saveData?.[0]?.TRAN_CD ?? "",
                    CONFIRMED: saveData?.[0]?.CONFIRMED ?? "",
                    SCROLL1: saveData?.[0]?.SCROLL1 ?? "",
                    ACCOUNT_CLOSE: saveData?.[0]?.ACCOUNT_CLOSE ?? "",
                    PAY_SLIP_NEFT_DTL: [],
                    PAYSLIP_NO: "",
                    REC_DTL: [],
                  });
                } else {
                  setActiveStep(rpState?.activeStep + 1);
                }
              }
              if (buttonName === "No") {
                updateSaveValidationData({
                  ...saveData,
                  ACCOUNT_CLOSE: "N",
                });
                if (
                  Number(recurData?.CASH_AMT) ===
                  Number(recurData?.TOTAL_AMOUNT)
                ) {
                  recurringPaymentEntrySaveMutation.mutate({
                    ...saveDataRef.current?.data,
                    TRAN_CD: saveData?.[0]?.TRAN_CD ?? "",
                    CONFIRMED: saveData?.[0]?.CONFIRMED ?? "",
                    SCROLL1: saveData?.[0]?.SCROLL1 ?? "",
                    ACCOUNT_CLOSE: saveData?.[0]?.ACCOUNT_CLOSE ?? "",
                    PAY_SLIP_NEFT_DTL: [],
                    PAYSLIP_NO: "",
                    REC_DTL: [],
                  });
                } else {
                  setActiveStep(rpState?.activeStep + 1);
                }
              }
            } else if (obj?.O_STATUS === "999") {
              await MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "ValidationFailed",
                message: obj?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
            }
          }
        },
      }
    );
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
    if (Boolean(rpState?.recurPmtEntryData?.PAYSLIP)) {
      if (Number(data?.TOTAL_AMOUNT) !== Number(data?.PAYMENT_AMOUNT)) {
        await MessageBox({
          messageTitle: "PaymentAmountNotTally",
          message: "PayslipAmountShouldTallyWithPaymentAmount",
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
          updatePayslipAndDDData([...data?.PAYSLIPDD]);
          recurringPaymentEntrySaveMutation.mutate({
            ...saveDataRef.current?.data,
            TRAN_CD: rpState?.onSaveValidationData?.[0]?.TRAN_CD ?? "",
            CONFIRMED: rpState?.onSaveValidationData?.[0]?.CONFIRMED ?? "",
            SCROLL1: rpState?.onSaveValidationData?.[0]?.SCROLL1 ?? "",
            ACCOUNT_CLOSE: rpState?.onSaveValidationData?.ACCOUNT_CLOSE ?? "",
            REC_DTL:
              Number(rpState?.recurPmtEntryData?.TRF_AMT) > 0
                ? [...rpState?.recurPmtTransferData.RECPAYTRANS]
                : [],
            PAY_SLIP_NEFT_DTL: [...data?.PAYSLIPDD],
            PAYSLIP_NO: data?.PAYSLIPDD?.[0]?.PAYSLIP_NO
              ? (data?.PAYSLIPDD[data?.PAYSLIPDD?.length - 1]).PAYSLIP_NO
              : "",
          });
        }
      }
    } else if (Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT)) {
      if (Number(data?.TOTAL_AMOUNT) !== Number(data?.PAYMENT_AMOUNT)) {
        await MessageBox({
          message: "NEFTAmountShouldTallyWithPaymentAmount",
          messageTitle: "PaymentAmountNotTally",
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
          updateBeneficiaryAcctData([...data?.BENEFIACCTDTL]);
          recurringPaymentEntrySaveMutation.mutate({
            ...saveDataRef.current?.data,
            TRAN_CD: rpState?.onSaveValidationData?.[0]?.TRAN_CD ?? "",
            CONFIRMED: rpState?.onSaveValidationData?.[0]?.CONFIRMED ?? "",
            SCROLL1: rpState?.onSaveValidationData?.[0]?.SCROLL1 ?? "",
            ACCOUNT_CLOSE: rpState?.onSaveValidationData?.ACCOUNT_CLOSE ?? "",
            REC_DTL:
              Number(rpState?.recurPmtEntryData?.TRF_AMT) > 0
                ? [...rpState?.recurPmtTransferData.RECPAYTRANS]
                : [],
            PAY_SLIP_NEFT_DTL: [...data?.BENEFIACCTDTL],
            PAYSLIP_NO: "",
          });
        }
      }
    }
  };

  //Call submit handler based on conditions
  const handleComplete = (e) => {
    if (rpState.activeStep === 0) {
      recPmtEntryRef.current?.handleSubmit(e);
    } else if (rpState.activeStep === 1) {
      if (
        Boolean(rpState?.recurPmtEntryData?.PAYSLIP) &&
        rpState?.recurPmtEntryData?.TRF_AMT <= 0
      ) {
        payslipAndDDRef.current?.handleSubmit(e);
      } else if (
        Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT) &&
        rpState?.recurPmtEntryData?.TRF_AMT <= 0
      ) {
        beneficiaryAcctRef.current?.handleSubmit(e);
      } else {
        recPmtTransferRef.current?.handleSubmit(e);
      }
    } else if (rpState.activeStep === 2) {
      if (Boolean(rpState?.recurPmtEntryData?.PAYSLIP)) {
        payslipAndDDRef.current?.handleSubmit(e);
      } else if (Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT)) {
        beneficiaryAcctRef.current?.handleSubmit(e);
      }
    }
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getRecurAdviceDtl"]);
    };
  }, []);

  //Set form's name in stepper based on index
  useEffect(() => {
    if (
      Boolean(rpState?.recurPmtEntryData?.PAYSLIP) &&
      rpState?.recurPmtEntryData?.TRF_AMT <= 0
    ) {
      setSteps([t("RecurringPaymentEntry"), t("PayslipAndDemandDraft")]);
    } else if (
      Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT) &&
      rpState?.recurPmtEntryData?.TRF_AMT <= 0
    ) {
      setSteps([t("RecurringPaymentEntry"), t("BeneficiaryACDetails")]);
    } else if (
      Boolean(rpState?.recurPmtEntryData?.PAYSLIP) &&
      rpState?.recurPmtEntryData?.TRF_AMT > 0
    ) {
      setSteps([
        t("RecurringPaymentEntry"),
        t("RecurringPaymentTransfer"),
        t("PayslipAndDemandDraft"),
      ]);
    } else if (
      Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT) &&
      rpState?.recurPmtEntryData?.TRF_AMT > 0
    ) {
      setSteps([
        t("RecurringPaymentEntry"),
        t("RecurringPaymentTransfer"),
        t("BeneficiaryACDetails"),
      ]);
    } else {
      setSteps([t("RecurringPaymentEntry"), t("RecurringPaymentTransfer")]);
    }
  }, [rpState]);

  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "hidden",
            position: "relative",
            padding: "0 10px 10px 10px",
            height: "auto",
          },
        }}
        maxWidth="xl"
        className="recurDlg"
      >
        <>
          {(recurringPaymentEntrySaveMutation.isError ||
            onSaveValidationMutation?.isError) && (
            <Alert
              severity="error"
              errorMsg={
                recurringPaymentEntrySaveMutation?.error?.error_msg ||
                onSaveValidationMutation?.error?.error_msg ||
                t("Somethingwenttowrong")
              }
              errorDetail={
                recurringPaymentEntrySaveMutation?.error?.error_detail ||
                onSaveValidationMutation?.error?.error_detail ||
                ""
              }
              color="error"
            />
          )}
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
              className="form__header"
              style={{ marginBottom: "22px", position: "relative" }}
            >
              <Toolbar variant="dense" className={headerClasses.root}>
                <Typography
                  component="span"
                  variant="h5"
                  className={headerClasses.title}
                >
                  {utilFunction.getDynamicLabel(
                    currentPath,
                    authState?.menulistdata,
                    true
                  )}
                </Typography>

                <GradientButton onClick={closeDialog}>
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
              activeStep={rpState?.activeStep}
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
              maxHeight: "calc(90vh - 150px)",
              borderBottom: "2px solid var(--theme-color4)",
            }}
          >
            {rpState?.activeStep === 0 ? (
              <RecurringPaymentEntryForm
                ref={recPmtEntryRef}
                defaultView={defaultView}
                recurEntrySubmitHandler={recurEntrySubmitHandler}
                entryScreenFlagData={entryScreenFlagData}
              />
            ) : rpState?.activeStep === 1 ? (
              Boolean(rpState?.recurPmtEntryData?.PAYSLIP) &&
              rpState?.recurPmtEntryData?.TRF_AMT <= 0 ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="div"
                        variant="h5"
                        className={headerClasses.formHeaderTitle}
                      >
                        {payslipAccountTitle}
                        <Chip
                          variant="outlined"
                          color="primary"
                          size="small"
                          label={`${defaultView} mode`}
                        />
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <PayslipAndDDForm
                    ref={payslipAndDDRef}
                    defaultView={defaultView}
                    accountDetailsForPayslip={accountDetailsForPayslip}
                    onSubmitHandler={paysBenefSubmitHandler}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT) &&
                rpState?.recurPmtEntryData?.TRF_AMT <= 0 ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.formHeaderTitle}
                      >
                        {beneficiaryAccountTitle}
                        <Chip
                          variant="outlined"
                          color="primary"
                          size="small"
                          label={`${defaultView} mode`}
                        />
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <BeneficiaryAcctDetailsForm
                    ref={beneficiaryAcctRef}
                    onSubmitHandler={paysBenefSubmitHandler}
                    accountDetailsForBen={accountDetailsForBen}
                    defaultView={defaultView}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : (
                <RecurringPaymentTransferForm
                  ref={recPmtTransferRef}
                  defaultView={defaultView}
                  recurringPaymentEntrySaveMutation={
                    recurringPaymentEntrySaveMutation
                  }
                  saveDataRef={saveDataRef}
                />
              )
            ) : rpState?.activeStep === 2 ? (
              Boolean(rpState?.recurPmtEntryData?.PAYSLIP) &&
              rpState?.recurPmtEntryData?.TRF_AMT > 0 ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.formHeaderTitle}
                      >
                        {payslipAccountTitle}
                        <Chip
                          variant="outlined"
                          color="primary"
                          size="small"
                          label={`${defaultView} mode`}
                        />
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <PayslipAndDDForm
                    ref={payslipAndDDRef}
                    defaultView={defaultView}
                    accountDetailsForPayslip={accountDetailsForPayslip}
                    onSubmitHandler={paysBenefSubmitHandler}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT) &&
                rpState?.recurPmtEntryData?.TRF_AMT > 0 ? (
                <>
                  <AppBar position="relative" style={{ marginBottom: "10px" }}>
                    <Toolbar variant="dense" className={headerClasses.root}>
                      <Typography
                        component="span"
                        variant="h5"
                        className={headerClasses.formHeaderTitle}
                      >
                        {beneficiaryAccountTitle}
                        <Chip
                          variant="outlined"
                          color="primary"
                          size="small"
                          label={`${defaultView} mode`}
                        />
                      </Typography>
                    </Toolbar>
                  </AppBar>
                  <BeneficiaryAcctDetailsForm
                    ref={beneficiaryAcctRef}
                    onSubmitHandler={paysBenefSubmitHandler}
                    accountDetailsForBen={accountDetailsForBen}
                    defaultView={defaultView}
                    handleDisableButton={handleDisableButton}
                  />
                </>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
          </div>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row-reverse",
              margin: "0px !important",
              paddingTop: "10px",
            }}
          >
            {rpState?.activeStep !== steps.length && (
              <>
                {rpState?.activeStep !== steps.length - 1 ? (
                  <GradientButton
                    onClick={handleComplete}
                    endIcon={
                      onSaveValidationMutation?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    disabled={
                      onSaveValidationMutation?.isLoading ||
                      rpState?.disableButton
                    }
                    color={"primary"}
                  >
                    {t("Next")}
                  </GradientButton>
                ) : (
                  <GradientButton
                    disabled={rpState?.disableButton}
                    onClick={handleComplete}
                    color={"primary"}
                  >
                    {t("Finish")}
                  </GradientButton>
                )}
              </>
            )}
            {rpState?.activeStep === 0 ? null : (
              <GradientButton
                onClick={() => {
                  setIsBackButton(true);
                  setActiveStep(rpState?.activeStep - 1);
                }}
              >
                {t("Back")}
              </GradientButton>
            )}
          </Box>
        </>
      </Dialog>

      {/*Open Closing Advice component */}
      {openClosingAdvice ? (
        <ClosingAdvice closeDialog={handleCloseAdviceDetails} />
      ) : null}
    </>
  );
};
export default RecurringPaymentStepperForm;
