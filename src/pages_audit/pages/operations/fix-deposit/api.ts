import { DefaultErrorObject } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getFDViewDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDVIEWDTL", reqData);
  if (status === "0") {
    return data?.map((item: any) => {
      const updatedItem = {
        ...item,
        INT_RATE: Number(item?.INT_RATE ?? 0).toFixed(2),
        TOT_AMT: Number(item?.TOT_AMT ?? 0).toFixed(2),
      };
      if (updatedItem?.LEAN_FLAG.trim() === "Y") {
        updatedItem._rowColor = "rgb(255, 225, 225)";
      }
      return updatedItem;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPaidFDViewDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAIDFDVIEWDTL", reqData);
  if (status === "0") {
    return data?.map((item: any) => {
      const updatedItem = {
        ...item,
        INT_RATE: Number(item?.INT_RATE ?? 0).toFixed(2),
      };
      return updatedItem;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDViewMasterDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDVIEWMASTER", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAcctDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOVALIDATEACCOUNT", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDParaDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPARADETAIL", { ...reqData });
  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status: status, messageDetails: message };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDParaDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPARADETAIL", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDIntDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDINTDTL", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const checkAllowModifyFDData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKALLOWMODIFYFD", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDIntTermDDWData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDINTTERM", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DISP_VAL, DATA_VAL }) => {
        return {
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPeriodDDWData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPERIODLIST", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DESCR, PERIOD_CD, DEFAULT_VALUE }) => {
          return {
            value: PERIOD_CD,
            label: DESCR,
            tenorDefaultVal: DEFAULT_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getMatureInstDDWData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMATUREINSTDTL", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ MATURE_INST, DESCRIPTION, DEFAULT_VALUE, ...other }) => {
          return {
            value: MATURE_INST,
            label: DESCRIPTION,
            matureInstDefaultVal: DEFAULT_VALUE,
            ...other,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDIntRate = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let tranDate =
    fieldName === "TRAN_DT"
      ? currField?.value
      : dependentFields?.TRAN_DT?.value;
  let periodCode =
    fieldName === "PERIOD_CD"
      ? currField?.value
      : dependentFields?.PERIOD_CD?.value;
  let periodNo =
    fieldName === "PERIOD_NO"
      ? currField?.value
      : dependentFields?.PERIOD_NO?.value;
  let cashAmt =
    fieldName === "CASH_AMT"
      ? currField?.value
      : dependentFields?.CASH_AMT?.value;
  let transAmt =
    fieldName === "TRSF_AMT"
      ? currField?.value
      : dependentFields?.TRSF_AMT?.value;

  let principalAmt = Number(cashAmt) + Number(transAmt);

  if (
    currField?.value &&
    dependentFields?.BRANCH_CD?.value &&
    dependentFields?.ACCT_TYPE?.value &&
    dependentFields?.ACCT_CD?.value
  ) {
    const { data, status, message } = await AuthSDK.internalFetcher(
      "GETFDINTRATE",
      {
        COMP_CD: auth?.companyID ?? "",
        BRANCH_CD: dependentFields?.BRANCH_CD?.value ?? "",
        ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
        ACCT_CD: dependentFields?.ACCT_CD?.value ?? "",
        CATEG_CD: dependentFields?.CATEG_CD?.value ?? "",
        TRAN_DT: tranDate ? format(tranDate, "dd-MMM-yyyy") : "",
        TRSF_AMT: transAmt,
        PERIOD_CD: periodCode,
        PERIOD_NO: periodNo,
        MATURITY_DT: "",
        PRE_INT_FLAG: "N",
        PRINCIPAL_AMT: String(principalAmt),
      }
    );
    if (status === "0") {
      formState?.handleDisableButton(false);
      return {
        INT_RATE: {
          value: parseFloat(data?.[0]?.INT_RATE ?? "")?.toFixed(2),
        },
        MATURITY_DT: {
          value: data?.[0]?.MATURITY_DT ?? "",
          ignoreUpdate: true,
        },
        MIN_AMT: {
          value: data?.[0]?.MIN_AMT ?? "",
          ignoreUpdate: true,
        },
        MAX_AMT: {
          value: data?.[0]?.MAX_AMT ?? "",
          ignoreUpdate: true,
        },
        MIN_DAYS: {
          value: data?.[0]?.MIN_DAYS ?? "",
          ignoreUpdate: true,
        },
        MAX_DAYS: {
          value: data?.[0]?.MAX_DAYS ?? "",
          ignoreUpdate: true,
        },
      };
    } else {
      let buttonName = await formState?.MessageBox({
        messageTitle: "Error",
        message: message || "Unknownerroroccured",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });

      if (buttonName === "Ok") {
        formState?.handleDisableButton(false);
        return {
          [fieldName]: {
            value: "",
            error: message ?? "",
            ignoreUpdate: true,
          },
          INT_RATE: {
            value: "",
            ignoreUpdate: true,
          },
          MATURITY_DT: {
            value: "",
            ignoreUpdate: true,
          },
        };
      }
    }
  } else {
    formState?.handleDisableButton(false);
    return {};
  }
};

export const getFDMaturityAmt = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let termCd =
    fieldName === "TERM_CD"
      ? currField?.value
      : dependentFields?.TERM_CD?.value ?? "";
  let intRate =
    fieldName === "INT_RATE"
      ? currField?.value
      : dependentFields?.INT_RATE?.value ?? "";
  let principalAmt =
    Number(dependentFields?.CASH_AMT?.value ?? 0) +
    Number(dependentFields?.TRSF_AMT?.value ?? 0);

  if (
    currField?.value &&
    dependentFields?.BRANCH_CD?.value &&
    dependentFields?.ACCT_TYPE?.value &&
    dependentFields?.ACCT_CD?.value
  ) {
    const { data, status, message } = await AuthSDK.internalFetcher(
      "GETFDMATURITYAMT",
      {
        COMP_CD: auth?.companyID ?? "",
        BRANCH_CD: dependentFields?.BRANCH_CD?.value ?? "",
        ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
        ACCT_CD: dependentFields?.ACCT_CD?.value ?? "",
        CATEG_CD: dependentFields?.CATEG_CD?.value ?? "",
        TRAN_DT: dependentFields?.TRAN_DT?.value
          ? format(dependentFields?.TRAN_DT?.value, "dd-MMM-yyyy")
          : "",
        TRSF_AMT: dependentFields?.TRSF_AMT?.value ?? "",
        PERIOD_CD: dependentFields?.PERIOD_CD?.value ?? "",
        PERIOD_NO: dependentFields?.PERIOD_NO?.value ?? "",
        MATURITY_DT: dependentFields?.MATURITY_DT?.value
          ? format(dependentFields?.MATURITY_DT?.value, "dd-MMM-yyyy")
          : "",
        PRE_INT_FLAG: "N",
        PRINCIPAL_AMT: principalAmt,
        TERM_CD: termCd,
        INT_RATE: intRate,
      }
    );
    if (status === "0") {
      formState?.handleDisableButton(false);
      return {
        MATURITY_AMT: {
          value: data?.[0]?.MATURITY_AMT ?? "",
          ignoreUpdate: false,
        },
        MONTHLY_INT: {
          value: data?.[0]?.MONTHLY_INT ?? "",
          ignoreUpdate: true,
        },
      };
    } else {
      let buttonName = await formState?.MessageBox({
        messageTitle: "Error",
        message: message || "Unknownerroroccured",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });

      if (buttonName === "Ok") {
        formState?.handleDisableButton(false);
        return {
          [fieldName]: {
            value: "",
            error: message ?? "",
            ignoreUpdate: true,
          },
          MATURITY_AMT: {
            value: "",
            ignoreUpdate: false,
          },
          MONTHLY_INT: {
            value: "",
            ignoreUpdate: true,
          },
        };
      }
    }
  } else {
    formState?.handleDisableButton(false);
    return {};
  }
};

export const validateFDDepAmt = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let cashAmt =
    fieldName === "CASH_AMT"
      ? currField?.value
      : dependentFields?.CASH_AMT?.value;
  let transAmt =
    fieldName === "TRSF_AMT"
      ? currField?.value
      : dependentFields?.TRSF_AMT?.value;

  if (
    (cashAmt || transAmt || Number(dependentFields?.MATURITY_AMT?.value) > 0) &&
    dependentFields?.BRANCH_CD?.value &&
    dependentFields?.ACCT_TYPE?.value &&
    dependentFields?.ACCT_CD?.value
  ) {
    const { data, status, message } = await AuthSDK.internalFetcher(
      "VALIDATEFDDEPAMT",
      {
        A_COMP_CD: auth?.companyID ?? "",
        A_BRANCH_CD: dependentFields?.BRANCH_CD?.value ?? "",
        A_ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
        A_ACCT_CD: dependentFields?.ACCT_CD?.value ?? "",
        A_BASE_BRANCH: auth?.user?.branchCode ?? "",
        A_CATEG_CD: dependentFields?.CATEG_CD?.value ?? "",
        A_MATURITY_DT: dependentFields?.MATURITY_DT?.value
          ? format(dependentFields?.MATURITY_DT?.value, "dd-MMM-yyyy")
          : "",
        A_TRAN_DT: dependentFields?.TRAN_DT?.value
          ? format(dependentFields?.TRAN_DT?.value, "dd-MMM-yyyy")
          : "",

        A_PERIOD_CD: dependentFields?.PERIOD_CD?.value ?? "",
        A_PERIOD_NO: dependentFields?.PERIOD_NO?.value ?? "",
        A_CASH_AMT: cashAmt ?? "",
        A_TRSF_AMT: transAmt ?? "",
        A_SPL_AMT: dependentFields?.SPL_AMT?.value ?? "",
        A_DEP_FAC: dependentFields?.DEP_FAC?.value ?? "",
        A_AGG_DEP_CUSTID: dependentFields?.AGG_DEP_CUSTID.value ?? "",
        WORKING_DATE: auth?.workingDate ?? "",
      }
    );
    if (status === "0") {
      formState?.handleDisableButton(false);
      return {
        INT_RATE: {
          value: data?.[0]?.INT_RATE ?? "",
        },
      };
    } else {
      let buttonName = await formState?.MessageBox({
        messageTitle: "Error",
        message: message || "Unknownerroroccured",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
      if (buttonName === "Ok") {
        formState?.handleDisableButton(false);
        return {
          [fieldName]: {
            value: "",
            error: message ?? "",
            isFieldFocused: true,
            ignoreUpdate: true,
          },
          INT_RATE: {
            value: "",
            ignoreUpdate: true,
          },
        };
      }
    }
  } else {
    formState?.handleDisableButton(false);
    return {};
  }
};

export const getFDRenewMaturityAmt = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDMATURITYAMT", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const checkLienAcct = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKLIEN", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validAndUpdateFDDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEUPDATEFDDETAILS", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateFDDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEFDDETAILS", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveFDDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVEFDDETAILS", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const checkAllowFDPay = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKALLOWFDPAY", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPrematureRate = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPREMATRATE", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDPaymentDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPAYMENTDTL", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validatePaymetEntry = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEFDPAYMENT", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveFDPaymentDtls = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVEFDPAYMENTFDDETAILS", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDRenewData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDRENEWDATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveFDRenewDepositDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSAVEPAYMENTANDFDDEPOSITEDTL", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveFDLienEntryDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVELIENENTRYDTL", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAccountAndGetDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCOUNT", {
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
      SCREEN_REF: reqData?.SCREEN_REF ?? "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDButtons = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDBUTTONS", {});
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDRelatedAcDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDRELATEDAC", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateFDRelatedAc = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEFDRELATEDAC", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const doFDRelatedAcEntry = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOFDENTRY", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDDoubleScheme = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDDOUBLESCHEME", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const finInterestJasper = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFININTEREST", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDMaturityDtForScheme = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDINTRATE", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDIntSchedule = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDINTSCHEDULE", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
