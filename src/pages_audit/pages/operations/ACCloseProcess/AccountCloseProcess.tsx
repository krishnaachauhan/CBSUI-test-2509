import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import {
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  Grid,
  Tab,
  Tabs,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import DailyTransTabs from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { BeneficiaryAcctDetailsForm } from "../recurringPaymentEntry/payslipAndNEFT/beneficiaryAcctDetailsForm";
import { PayslipAndDDForm } from "../recurringPaymentEntry/payslipAndNEFT/payslipAndDDForm";
import * as API from "./api";
import {
  FormWrapper,
  GridWrapper,
  GradientButton,
  SubmitFnType,
  utilFunction,
  GridMetaDataType,
  MetaDataType,
  usePopupContext,
  queryClient,
  Alert,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import {
  AccountCloseForm,
  accountFindmetaData,
  MembersGridMetaData,
  ParkedChargesGridMetaData,
  TransactionGridMetaData,
  TransactionHoldGridMetaData,
} from "./metaData";
import { useTranslation } from "react-i18next";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../fix-deposit/function";
import { DialogProvider } from "../payslip-issue-entry/DialogContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      marginBottom: "4px",
      position: "sticky",
    },
    headerRoot: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      background: "var(--theme-color5)",
    },
    headerTitle: {
      flex: "1 1 100%",
      color: "var(--theme-color2)",
      fontSize: "1.5rem",
    },
  })
);

const AccountCloseProcessMain = () => {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [disableButton, setDisableButton] = useState(false);
  const [isopenDDNeft, setIsopenDDNeft] = useState(false);
  const [tabValue, setTabValue] = useState("1");
  const [accountDetails, setAccountDetails] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [holdTransactionData, setHoldTransactionData] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [parkedChargesData, setParkedChargesData] = useState([]);
  const parameterRef = useRef<any>();
  const accountCloseRef = useRef<any>();
  const payslipAndDDRef = useRef<any>(null);
  const beneficiaryAcctRef = useRef<any>(null);
  const classes = useStyles();
  let currentPath = useLocation().pathname;
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { focusRef, setFocus } = useCommonFunctions();

  // Function for tab change
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  // Transactions Tab details api
  const getTransactionTabData: any = useMutation(
    "getTransactionTabData",
    API.getTransactionTabData,
    {
      onSuccess: (data) => {
        const updatedData = data?.map((item) => ({
          ...item,
          ACCT_NO: `${item?.BRANCH_CD?.trim()}/${item?.ACCT_TYPE?.trim()}/${item?.ACCT_CD?.trim()}`,
          OPP_ACCT:
            item?.OPP_BRANCH_CD && item?.OPP_ACCT_TYPE && item?.OPP_ACCT_CD
              ? `${item?.OPP_BRANCH_CD?.trim()}/${item?.OPP_ACCT_TYPE?.trim()}/${item?.OPP_ACCT_CD?.trim()}`
              : null,
        }));
        setTransactionData(updatedData);
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  const ACCredit = transactionData
    ?.reduce((sum, item: any) => {
      if (parseInt(item?.TYPE_CD?.trim()) < 4) {
        return sum + parseFloat(item?.AMOUNT);
      }
      return sum;
    }, 0)
    .toFixed(2);
  const ACDebit = transactionData
    ?.reduce((sum, item: any) => {
      if (parseInt(item?.TYPE_CD?.trim()) > 3) {
        return sum + parseFloat(item?.AMOUNT);
      }
      return sum;
    }, 0)
    .toFixed(2);
  // ------------------------------------------------------------------------------

  // Hold Transaction Tab details api
  const getHoldTransactionTabData: any = useMutation(
    "getHoldTransactionTabData",
    API.getHoldTransactionTabData,
    {
      onSuccess: (data) => {
        const updatedData = data?.map((item) => ({
          ...item,
          PAID: item?.PAID === "N" ? "Unpaid" : "paid",
        }));
        setHoldTransactionData(updatedData);
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // ------------------------------------------------------------------------------
  // Member(S) Tab details api
  const getMembersTabData: any = useMutation(
    "getMembersTabData",
    API.getMembersTabData,
    {
      onSuccess: (data) => {
        const updatedData = data?.map((item) => ({
          ...item,
          ACCT_NO: `${item?.BRANCH_CD?.trim()}${item?.ACCT_TYPE?.trim()}${item?.ACCT_CD?.trim()}`,
        }));
        setMembersData(updatedData);
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // ------------------------------------------------------------------------------
  // Parked charges Tab details api
  const getParkedChargesTabData: any = useMutation(
    "getParkedChargesTabData",
    API.getParkedChargesTabData,
    {
      onSuccess: (data) => {
        setParkedChargesData(data);
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  // ------------------------------------------------------------------------------
  // Settle charges details api
  const getSettleCharges: any = useMutation(
    "getSettleCharges",
    API.getSettleCharges,
    {
      onSuccess: async (data) => {
        if (data?.[0]?.O_STATUS === "999") {
          const btnName = await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[0]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data?.[0]?.O_STATUS === "99") {
          const btnName = await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[0]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
        } else if (data?.[0]?.O_STATUS === "9") {
          const btnName = await MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE ?? "Alert",
            message: data?.[0]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data?.[0]?.O_STATUS === "0") {
          parameterRef.current.TYPE_CD = data?.[0]?.TYPE_CD;
        }
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  // ------------------------------------------------------------------------------
  //Get Account close details
  const getAccountDetails: any = useMutation(
    "getCarousalCards",
    API.getCarousalCards,
    {
      onSuccess: (data) => {
        setAccountDetails(data);
        setIsFormOpen(false);
        getTransactionTabData.mutate({
          BRANCH_CD: authState?.user?.branchCode ?? "",
          ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
          ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
          COMP_CD: authState?.companyID ?? "",
        });
        {
          parameterRef?.current?.HOLD_TRN_VISIBLE === "Y" &&
            getHoldTransactionTabData.mutate({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
              ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
            });
        }
        {
          parameterRef?.current?.MEMBERS_VISIBLE === "Y" &&
            getMembersTabData.mutate({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
              ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
            });
        }
        {
          parameterRef?.current?.PARKED_CHARGES_VISIBLE === "Y" &&
            getParkedChargesTabData.mutate({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
              ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
              A_FROM_DT: format(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                "dd/MMM/yyyy"
              ),
              A_TO_DATE: authState?.workingDate ?? "",
            });
        }
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  //Validation call on close button
  const valildateAcctCloseBtn: any = useMutation(
    "valildateAcctCloseBtn",
    API.valildateAcctCloseBtn,
    {
      onSuccess: async (data) => {
        for (let i = 0; i < data?.length; i++) {
          if (data?.[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (data?.[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              icon: "CONFIRM",
            });
            if (btnName === "Yes") {
              accountCloseRef.current = {
                ...accountCloseRef?.current,
                ...data?.[i],
              };
            }
            if (btnName === "No") {
              break;
            }
          } else if (data?.[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.O_MSG_TITLE ?? "Alert",
              message: data?.[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data?.[i]?.O_STATUS === "0") {
            if (
              (Boolean(accountCloseRef?.current?.NEFT) ||
                Boolean(accountCloseRef?.current?.PAYSLIP)) &&
              accountCloseRef?.current?.AMOUNT > 0
            ) {
              setIsopenDDNeft(true);
              CloseMessageBox();
            } else {
              accountCloseEntry.mutate({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: accountCloseRef?.current?.BRANCH_CD ?? "",
                ACCT_TYPE: accountCloseRef?.current?.ACCT_TYPE ?? "",
                ACCT_CD: accountCloseRef?.current?.ACCT_CD ?? "",
                AMOUNT: accountCloseRef?.current?.AMOUNT ?? "",
                TYPE_CD: accountCloseRef?.current?.TYPE_CD ?? "",
                OPP_BRANCH: accountCloseRef?.current?.TRN_BRANCH_CD ?? "",
                OPP_ACCT_TYP: accountCloseRef?.current?.TRN_ACCT_TYPE ?? "",
                OPP_ACCT_CD: accountCloseRef?.current?.TRN_ACCT_CD ?? "",
                CLOSE_BAL: parameterRef?.current?.CLOSE_BAL ?? "",
                CONFIRMED: parameterRef?.current?.CONFIRMED ?? "",
                CLOSE_RES_CD: accountCloseRef?.current?.CLOSE_REASON_CD ?? "",
                CHARGE_AMT: parameterRef?.current?.CHARGE_AMT ?? "",
                REMARKS: accountCloseRef?.current?.REMARKS ?? "",
                SCROLL: parameterRef?.current?.SCROLL ?? "",
                TOKEN_NO: accountCloseRef?.current?.TOKEN_NO ?? "",
                CHEQUE_NO: accountCloseRef?.current?.CHEQUE_NO ?? "",
                TRAN_CD: accountCloseRef?.current?.TRAN_CD ?? "",
                LST_INT_DT: parameterRef?.current?.LST_INT_APPLY_DT ?? "",
                STATUS: parameterRef?.current?.STATUS ?? "",
                SCREEN_REF: docCD,
              });
            }
          }
        }
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // NEFT/DD entry validation
  const neftDDValidation: any = useMutation(
    "neftDDValidation",
    API.neftDDValidation,
    {
      onSuccess: async (data) => {
        for (let i = 0; i < data?.length; i++) {
          if (data?.[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (data?.[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data?.[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              icon: "CONFIRM",
            });
            if (btnName === "No") {
              break;
            }
          } else if (data?.[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
              message: data?.[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data?.[i]?.O_STATUS === "0") {
            accountCloseEntry.mutate({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: accountCloseRef?.current?.BRANCH_CD ?? "",
              ACCT_TYPE: accountCloseRef?.current?.ACCT_TYPE ?? "",
              ACCT_CD: accountCloseRef?.current?.ACCT_CD ?? "",
              AMOUNT: accountCloseRef?.current?.AMOUNT ?? "",
              TYPE_CD: accountCloseRef?.current?.TYPE_CD ?? "",
              OPP_BRANCH: accountCloseRef?.current?.TRN_BRANCH_CD ?? "",
              OPP_ACCT_TYP: accountCloseRef?.current?.TRN_ACCT_TYPE ?? "",
              OPP_ACCT_CD: accountCloseRef?.current?.TRN_ACCT_CD ?? "",
              CLOSE_BAL: parameterRef?.current?.CLOSE_BAL ?? "",
              CONFIRMED: parameterRef?.current?.CONFIRMED ?? "",
              CLOSE_RES_CD: accountCloseRef?.current?.CLOSE_REASON_CD ?? "",
              CHARGE_AMT: parameterRef?.current?.CHARGE_AMT ?? "",
              REMARKS: accountCloseRef?.current?.REMARKS ?? "",
              SCROLL: parameterRef?.current?.SCROLL ?? "",
              TOKEN_NO: accountCloseRef?.current?.TOKEN_NO ?? "",
              CHEQUE_NO: accountCloseRef?.current?.CHEQUE_NO ?? "",
              TRAN_CD: accountCloseRef?.current?.TRAN_CD ?? "",
              LST_INT_DT: parameterRef?.current?.LST_INT_APPLY_DT ?? "",
              STATUS: parameterRef?.current?.STATUS ?? "",
              SCREEN_REF: docCD,
            });
          }
        }
        CloseMessageBox();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // Final entry for Account close
  const accountCloseEntry: any = useMutation(
    "accountCloseEntry",
    API.accountCloseEntry,
    {
      onSuccess: async (data) => {
        // for (let i = 0; i < postData?.MSG?.length; i++) {
        //   if (postData?.MSG?.[i]?.O_STATUS === "999") {
        //     formState?.handleButtonDisable(false);
        //     const { btnName, obj } = await getButtonName({
        //       messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE?.length
        //         ? postData?.MSG?.[i]?.O_MSG_TITLE
        //         : "ValidationFailed",
        //       message: postData?.MSG?.[i]?.O_MESSAGE ?? "",
        //       icon: "ERROR",
        //     });
        //     returnVal = "";
        //   } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
        //     formState?.handleButtonDisable(false);
        //     if (btn99 !== "No") {
        //       const { btnName, obj } = await getButtonName({
        //         messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE?.length
        //           ? postData?.MSG?.[i]?.O_MSG_TITLE
        //           : "Alert",
        //         message: postData?.MSG?.[i]?.O_MESSAGE ?? "",
        //         icon: "WARNING",
        //       });
        //     }
        //     returnVal = postData;
        //   } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
        //     formState?.handleButtonDisable(false);
        //     const { btnName, obj } = await getButtonName({
        //       messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE?.length
        //         ? postData?.MSG?.[i]?.O_MSG_TITLE
        //         : "Confirmation",
        //       message: postData?.MSG?.[i]?.O_MESSAGE ?? "",
        //       buttonNames: ["Yes", "No"],
        //       icon: "CONFIRM",
        //     });

        //     btn99 = btnName;
        //     if (btnName === "No") {
        //       returnVal = "";
        //     }
        //   } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
        //     formState?.handleButtonDisable(false);
        //     if (btn99 !== "No") {
        //       returnVal = postData;
        //     } else {
        //       returnVal = "";
        //     }
        //   }
        // }

        const btnName = await MessageBox({
          messageTitle: data?.[0]?.MSG_TITLE ?? "",
          message: data?.[0]?.VOUCHER_MSG ?? "",
          icon: "SUCCESS",
        });
        setIsopenDDNeft(false);
        setIsFormOpen(true);
        setAccountDetails([]);
        setTransactionData([]);
        setHoldTransactionData([]);
        setMembersData([]);
        setParkedChargesData([]);
        accountCloseRef.current = [];
        CloseMessageBox();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  const onAccountFindSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    if (Object?.keys(parameterRef?.current)?.length > 0) {
      getAccountDetails.mutate({
        PARENT_TYPE: parameterRef?.current?.PARENT_TYPE,
        COMP_CD: parameterRef?.current?.COMP_CD,
        ACCT_TYPE: parameterRef?.current?.ACCT_TYPE,
        ACCT_CD: parameterRef?.current?.ACCT_CD,
        BRANCH_CD: parameterRef?.current?.BRANCH_CD,
      });
    }
    accountCloseRef.current = data;
    endSubmit(true);
  };

  const onAccountClosebtnSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    accountCloseRef.current = {
      ...accountCloseRef?.current,
      ...data,
      SCREEN_REF: docCD,
      INSTRUCTION_REMARKS: `A/c Close:-${accountCloseRef?.current?.BRANCH_CD?.trim()}-${accountCloseRef?.current?.ACCT_TYPE?.trim()}-${accountCloseRef?.current?.ACCT_CD?.trim()}`,
    };
    valildateAcctCloseBtn.mutate({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
      ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
      ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
      CONF_BAL: parameterRef?.current?.CONF_BAL ?? "",
      NPA_CD: parameterRef?.current?.NPA_CD ?? "",
      CUSTOMER_ID: parameterRef?.current?.CUSTOMER_ID ?? "",
      OP_DATE: parameterRef?.current?.OP_DATE ?? "",
      STATUS: parameterRef?.current?.STATUS ?? "",
      LST_INT_DT: parameterRef?.current?.LST_INT_APPLY_DT ?? "",
      TRAN_BAL: parameterRef?.current?.CLOSE_BAL ?? "",
      SCREEN_REF: docCD,
      TYPE_CD: accountCloseRef?.current?.TYPE_CD ?? "",
      NEFT: Boolean(accountCloseRef?.current?.NEFT) ? "Y" : "N",
      DD_PAYSLIP: Boolean(accountCloseRef?.current?.PAYSLIP) ? "Y" : "N",
      OPP_BRANCH: accountCloseRef?.current?.TRN_BRANCH_CD ?? "",
      OPP_ACCT_TYPE: accountCloseRef?.current?.TRN_ACCT_TYPE ?? "",
      OPP_ACCT_CD: accountCloseRef?.current?.TRN_ACCT_CD ?? "",
      AMOUNT: accountCloseRef?.current?.AMOUNT ?? "",
    });
    endSubmit(true);
  };

  const payslipNEFTSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    if (accountCloseRef?.current?.NEFT)
      neftDDValidation.mutate({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
        ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
        ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
        TRAN_CD: accountCloseRef?.current?.TRAN_CD ?? "",
        PAY_SLIP_NEFT_DTL: [...data?.BENEFIACCTDTL],
        COMM_TYPE_CD: accountCloseRef?.current?.TYPE_CD ?? "",
        TOT_DD_NEFT_AMT: data?.PAYMENT_AMOUNT ?? "",
        PAY_FOR: "",
        SDC: "",
        REMARKS: "",
        DD_NEFT: "NEFT",
        DD_NEFT_PAY_AMT: data?.TOTAL_AMOUNT ?? "",
        SCROLL1: parameterRef?.current?.SCROLL ?? "",
        REQUEST_CD: "0",
        SCREEN_REF: docCD,
      });
    if (accountCloseRef?.current?.PAYSLIP)
      neftDDValidation.mutate({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        TRAN_CD: accountCloseRef?.current?.TRAN_CD ?? "",
        PAY_SLIP_NEFT_DTL: data?.PAYSLIPDD.map((item) => ({
          ...item,
          FROM_CERTI_NO: accountCloseRef?.current?.TRAN_CD ?? "",
          FROM_COMP_CD: authState?.companyID ?? "",
          FROM_BRANCH_CD: accountCloseRef?.current?.BRANCH_CD ?? "",
          FROM_ACCT_TYPE: accountCloseRef?.current?.ACCT_TYPE ?? "",
          FROM_ACCT_CD: accountCloseRef?.current?.ACCT_CD ?? "",
        })),
        COMM_TYPE_CD: accountCloseRef?.current?.TYPE_CD ?? "",
        TOT_DD_NEFT_AMT: data?.PAYMENT_AMOUNT ?? "",
        PAY_FOR: "",
        SDC: "",
        REMARKS: "",
        DD_NEFT: "DD",
        DD_NEFT_PAY_AMT: data?.TOTAL_AMOUNT ?? "",
        SCROLL1: parameterRef?.current?.SCROLL ?? "",
        REQUEST_CD: "0",
        SCREEN_REF: docCD,
      });
    endSubmit(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSettleCharges = () => {
    getSettleCharges.mutate({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
      ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
      COMP_CD: authState?.companyID ?? "",
      CLOSE_BAL: parameterRef?.current?.CLOSE_BAL ?? "",
      CONF_BAL: parameterRef?.current?.CONF_BAL ?? "",
      SCREEN_REF: docCD,
    });
  };

  const handleCloseNEFTDDForm = () => {
    setIsopenDDNeft(false);
  };

  const handleRetrieve = () => {
    setIsFormOpen(true);
    setAccountDetails([]);
    setTransactionData([]);
    setHoldTransactionData([]);
    setMembersData([]);
    setParkedChargesData([]);
    accountCloseRef.current = [];
  };
  const handleCloseAccount = (e) => {
    (accountCloseRef?.current?.NEFT &&
      beneficiaryAcctRef.current?.handleSubmit(e)) ||
      (accountCloseRef?.current?.PAYSLIP &&
        payslipAndDDRef.current?.handleSubmit(e));
  };
  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  const headingWithButton = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {utilFunction.getDynamicLabel(currentPath, authState?.menulistdata, true)}
      <GradientButton
        onClick={handleRetrieve}
        color={"primary"}
        disabled={
          getTransactionTabData?.isLoading ||
          getHoldTransactionTabData?.isLoading ||
          getMembersTabData?.isLoading ||
          getParkedChargesTabData?.isLoading ||
          getSettleCharges?.isLoading ||
          valildateAcctCloseBtn?.isLoading ||
          disableButton
        }
      >
        {t("Retrieve")}
      </GradientButton>
    </div>
  );

  useEffect(() => {
    return () => {
      const keysToRemove = [
        "getCarousalCards",
        "getTransactionTabData",
        "getHoldTransactionTabData",
        "getMembersTabData",
        "getParkedChargesTabData",
        "getSettleCharges",
        "getAccountDetails",
        "valildateAcctCloseBtn",
        "accountCloseEntry",
        "neftDDValidation",
      ].map((key) => [key, authState?.user?.branchCode]);
      keysToRemove.forEach((key) => queryClient.removeQueries(key));
    };
  }, []);

  //Collection of required data for Beneficiary Form
  const accountDetailsForBen = {
    BENEFIACCTDTL: [
      {
        AMOUNT: accountCloseRef?.current?.AMOUNT ?? 0,
      },
    ],
    DEFAULT_REMARKS: `A/c Close:-${
      accountCloseRef?.current?.BRANCH_CD?.trim() ?? ""
    }-${accountCloseRef?.current?.ACCT_TYPE?.trim() ?? ""}-${
      accountCloseRef?.current?.ACCT_CD?.trim() ?? ""
    }`,
    PAYMENT_AMOUNT: accountCloseRef?.current?.AMOUNT ?? 0,
    ACCT_TYPE: accountCloseRef?.current?.ACCT_TYPE ?? "",
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: accountCloseRef?.current?.BRANCH_CD ?? "",
    ACCT_CD: accountCloseRef?.current?.ACCT_CD ?? "",
    ENTRY_TYPE: "NEFT",
  };
  //Collection of required data for Payslip Form
  const accountDetailsForPayslip = {
    PAYSLIPDD: [{ FROM_CERTI_NO: "" }],
    INSTRUCTION_REMARKS: `A/c Close:-${
      accountCloseRef?.current?.BRANCH_CD?.trim() ?? ""
    }-${accountCloseRef?.current?.ACCT_TYPE?.trim() ?? ""}-${
      accountCloseRef?.current?.ACCT_CD?.trim() ?? ""
    }`,
    PAYMENT_AMOUNT: accountCloseRef?.current?.AMOUNT ?? 0,
    COMP_CD: authState?.companyID ?? "",
    ACCT_TYPE: accountCloseRef?.current?.ACCT_TYPE ?? "",
    BRANCH_CD: accountCloseRef?.current?.BRANCH_CD ?? "",
    ACCT_CD: accountCloseRef?.current?.ACCT_CD ?? "",
    SCREEN_REF: docCD,
  };

  return (
    <Fragment>
      {/* Retrieve account dialog */}
      <Dialog
        open={isFormOpen}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="sm"
      >
        {getAccountDetails?.error && (
          <Alert
            severity="error"
            errorMsg={
              getAccountDetails?.error?.error_msg || t("Somethingwenttowrong")
            }
            errorDetail={getAccountDetails?.error?.error_detail || ""}
            color="error"
          />
        )}
        <FormWrapper
          key={"accountFindmetaData"}
          metaData={accountFindmetaData as MetaDataType}
          formStyle={{
            background: "white",
          }}
          controlsAtBottom={true}
          onSubmitHandler={onAccountFindSubmitHandler}
          formState={{
            MessageBox: MessageBox,
            handleButtonDisable: handleButtonDisable,
            docCD: docCD,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
            setFocus: setFocus,
          }}
          setDataOnFieldChange={(action, payload) => {
            if (action === "closeAccountDetails") {
              parameterRef.current = payload;
            }
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={
                  isSubmitting || getAccountDetails?.isLoading || disableButton
                }
                endIcon={
                  isSubmitting || getAccountDetails?.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color={"primary"}
                ref={focusRef}
              >
                {t("Submit")}
              </GradientButton>

              <GradientButton onClick={handleCloseForm} color={"primary"}>
                {t("Cancel")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>
      {/* Display account details in card */}
      <DailyTransTabs
        //@ts-ignore
        heading={headingWithButton}
        tabsData={[]}
        cardsData={accountDetails}
        reqData={[]}
        hideCust360Btn={true}
        occupiedHeight={{ min: "820px", max: "820px" }}
        screenFlag="ACCTCLOSEPROCESS"
      />
      {(getTransactionTabData?.error ||
        getHoldTransactionTabData?.error ||
        getParkedChargesTabData?.error ||
        getMembersTabData?.error) && (
        <Alert
          severity="error"
          errorMsg={
            getTransactionTabData?.error?.error_msg ||
            getHoldTransactionTabData?.error?.error_msg ||
            getMembersTabData?.error?.error_msg ||
            getParkedChargesTabData?.error?.error_msg ||
            t("Somethingwenttowrong")
          }
          errorDetail={
            getTransactionTabData?.error?.error_detail ||
            getHoldTransactionTabData?.error?.error_detail ||
            getMembersTabData?.error?.error_detail ||
            getParkedChargesTabData?.error?.error_detail ||
            ""
          }
          color="error"
        />
      )}
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="scrollable"
            style={{ minHeight: "35px" }}
          >
            <Tab
              label={t("Transactions")}
              value="1"
              sx={{ minHeight: "35px" }}
            />
            {parameterRef?.current?.HOLD_TRN_VISIBLE === "Y" && (
              <Tab
                label={t("HoldTransactions")}
                value="2"
                sx={{ minHeight: "35px" }}
              />
            )}
            {parameterRef?.current?.MEMBERS_VISIBLE === "Y" && (
              <Tab label={t("Members")} value="3" sx={{ minHeight: "35px" }} />
            )}
            {parameterRef?.current?.PARKED_CHARGES_VISIBLE === "Y" && (
              <Tab
                label={t("ParkedCharges")}
                value="4"
                sx={{ minHeight: "35px" }}
              />
            )}
          </Tabs>
        </Box>
        <TabPanel value="1" sx={{ padding: "0px 10px" }}>
          <GridWrapper
            key={"TransactionData"}
            finalMetaData={TransactionGridMetaData as GridMetaDataType}
            data={transactionData ?? []}
            setData={() => null}
            loading={
              getTransactionTabData?.isLoading ||
              getTransactionTabData?.isFetching
            }
          />
          <Grid
            item
            xs={12}
            sm={12}
            sx={{
              height: "23px",
              width: "60%",
              float: "right",
              position: "relative",
              top: "-2.67rem",
              display: "flex",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
              {t("accountCredit")} : {ACCredit}{" "}
            </Typography>
            <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
              {t("accountDebit")} : {ACDebit}{" "}
            </Typography>
          </Grid>
        </TabPanel>
        <TabPanel value="2">
          <GridWrapper
            key={"TransactionHoldData"}
            finalMetaData={TransactionHoldGridMetaData as GridMetaDataType}
            data={holdTransactionData ?? []}
            setData={() => null}
            loading={
              getHoldTransactionTabData?.isLoading ||
              getHoldTransactionTabData?.isFetching
            }
          />
        </TabPanel>
        <TabPanel value="3">
          <GridWrapper
            key={"MembersData"}
            finalMetaData={MembersGridMetaData as GridMetaDataType}
            data={membersData ?? []}
            setData={() => null}
            loading={
              getMembersTabData?.isLoading || getMembersTabData?.isFetching
            }
          />
        </TabPanel>
        <TabPanel value="4">
          <GridWrapper
            key={"ParkedChargesData"}
            finalMetaData={ParkedChargesGridMetaData as GridMetaDataType}
            data={parkedChargesData ?? []}
            setData={() => null}
            loading={
              getParkedChargesTabData?.isLoading ||
              getParkedChargesTabData?.isFetching
            }
          />
          <Grid
            item
            xs={12}
            sm={12}
            sx={{
              height: "23px",
              width: "60%",
              float: "right",
              position: "relative",
              top: "-2.67rem",
              display: "flex",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <GradientButton
              onClick={() => {}}
              color={"primary"}
              style={{ alignSelf: "center" }}
            >
              {t("WaiveAll")}
            </GradientButton>
            <GradientButton
              onClick={() => {}}
              color={"primary"}
              style={{ alignSelf: "center" }}
            >
              {t("PaidAll")}
            </GradientButton>
          </Grid>
        </TabPanel>
      </TabContext>

      {/* ------- Account Close form -------*/}
      {accountDetails && accountDetails.length > 0 ? (
        <>
          {(getSettleCharges?.error ||
            valildateAcctCloseBtn?.error ||
            ((!Boolean(accountCloseRef?.current?.NEFT) ||
              !Boolean(accountCloseRef?.current?.PAYSLIP)) &&
              accountCloseEntry?.error)) && (
            <Alert
              severity="error"
              errorMsg={
                getSettleCharges?.error?.error_msg ||
                valildateAcctCloseBtn?.error?.error_msg ||
                accountCloseEntry?.error?.error_msg ||
                t("Somethingwenttowrong")
              }
              errorDetail={
                getSettleCharges?.error?.error_detail ||
                valildateAcctCloseBtn?.error?.error_detail ||
                accountCloseEntry?.error?.error_detail ||
                ""
              }
              color="error"
            />
          )}
          <FormWrapper
            key={`AccountCloseForm`}
            metaData={AccountCloseForm as MetaDataType}
            initialValues={{
              AMOUNT: parameterRef?.current?.AMOUNT ?? 0,
            }}
            onSubmitHandler={onAccountClosebtnSubmitHandler}
            formState={{
              MessageBox: MessageBox,
              handleButtonDisable: handleButtonDisable,
              docCD: docCD,
              TYPE_CD: parameterRef?.current?.TYPE_CD ?? "",
              accountRef: accountCloseRef?.current ?? "",
              authState: authState ?? "",
              acctDtlReqPara: {
                TRN_ACCT_CD: {
                  ACCT_TYPE: "TRN_ACCT_TYPE",
                  BRANCH_CD: "TRN_BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            formStyle={{
              background: "white",
              height: "auto",
              padding: "0px",
              boxShadow:
                "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
              borderRadius: "4px",
            }}
            hideHeader={true}
            controlsAtBottom={true}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {parameterRef?.current?.SETTLE_VISIBLE === "Y" && (
                  <GradientButton
                    style={{ marginRight: "5px" }}
                    onClick={handleSettleCharges}
                    color={"primary"}
                    disabled={
                      getTransactionTabData?.isLoading ||
                      getHoldTransactionTabData?.isLoading ||
                      getMembersTabData?.isLoading ||
                      getParkedChargesTabData?.isLoading ||
                      getSettleCharges?.isLoading ||
                      valildateAcctCloseBtn?.isLoading ||
                      disableButton
                    }
                    endIcon={
                      getSettleCharges?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    {t("SettleCharges")}
                  </GradientButton>
                )}
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  color={"primary"}
                  disabled={
                    isSubmitting ||
                    getTransactionTabData?.isLoading ||
                    getHoldTransactionTabData?.isLoading ||
                    getMembersTabData?.isLoading ||
                    getParkedChargesTabData?.isLoading ||
                    getSettleCharges?.isLoading ||
                    valildateAcctCloseBtn?.isLoading ||
                    accountCloseEntry?.isLoading ||
                    disableButton
                  }
                  endicon="CancelOutlined"
                  endIcon={
                    valildateAcctCloseBtn?.isLoading ||
                    accountCloseEntry?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  rotateIcon="scale(1.4) rotateY(360deg)"
                >
                  {t("CloseAc")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        </>
      ) : (
        ""
      )}

      {/* Open NEFT/DD form */}
      {Boolean(accountCloseRef?.current?.NEFT) ||
      Boolean(accountCloseRef?.current?.PAYSLIP) ? (
        <Dialog
          open={isopenDDNeft}
          PaperProps={{
            style: {
              width: "auto",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          {(neftDDValidation?.error || accountCloseEntry?.error) && (
            <Alert
              severity="error"
              errorMsg={
                neftDDValidation?.error?.error_msg ||
                accountCloseEntry?.error?.error_msg ||
                t("Somethingwenttowrong")
              }
              errorDetail={
                neftDDValidation?.error?.error_detail ||
                accountCloseEntry?.error?.error_detail ||
                ""
              }
              color="error"
            />
          )}
          <AppBar className={classes.appBar}>
            <Toolbar variant="dense" className={classes.headerRoot}>
              <Typography
                component="span"
                variant="h5"
                className={classes.headerTitle}
              >
                {accountCloseRef?.current?.NEFT
                  ? t("BeneficiaryACDetails")
                  : accountCloseRef?.current?.PAYSLIP
                  ? t("PayslipAndDemandDraft")
                  : ""}
                {` ${t("ACNo")}:${authState?.companyID.trim() ?? ""}-${
                  accountCloseRef?.current?.BRANCH_CD.trim() ?? ""
                }-${accountCloseRef?.current?.ACCT_TYPE.trim() ?? ""}-${
                  accountCloseRef?.current?.ACCT_CD.trim() ?? ""
                }`}
              </Typography>

              <GradientButton
                onClick={handleCloseAccount}
                endIcon={
                  neftDDValidation?.isLoading ||
                  accountCloseEntry?.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                disabled={disableButton}
              >
                {t("Submit")}
              </GradientButton>
              <GradientButton onClick={handleCloseNEFTDDForm}>
                {t("Close")}
              </GradientButton>
            </Toolbar>
          </AppBar>

          {Boolean(accountCloseRef?.current?.NEFT) && (
            <BeneficiaryAcctDetailsForm
              ref={beneficiaryAcctRef}
              onSubmitHandler={payslipNEFTSubmitHandler}
              accountDetailsForBen={accountDetailsForBen}
              handleDisableButton={handleButtonDisable}
            />
          )}
          {Boolean(accountCloseRef?.current?.PAYSLIP) && (
            <PayslipAndDDForm
              ref={payslipAndDDRef}
              onSubmitHandler={payslipNEFTSubmitHandler}
              accountDetailsForPayslip={accountDetailsForPayslip}
              handleDisableButton={handleButtonDisable}
            />
          )}
        </Dialog>
      ) : null}
    </Fragment>
  );
};

export const AccountCloseProcess = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <AccountCloseProcessMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
