import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getRecurPaymentMst = async ({
  companyID,
  branchCode,
  TDS_METHOD,
  GD_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECURPAYMENTMST", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      TDS_METHOD: TDS_METHOD,
      GD_DATE: GD_DATE,
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        PAYSLIP: item?.PAYSLIP === "Y" ? true : false,
        RTGS_NEFT: item?.RTGS_NEFT === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRecurPaymentScreenPara = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECURPAYMENTSCREENPARA", {
      COMP_CD: companyID,
      ENT_BRANCH_CD: branchCode,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRecurValidAcctDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECURRINGVALIDATEACCTDTL", reqData);
  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRecurAcctData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECURRINGACCTDATA", reqData);
  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRecurAdviceDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECURRINGADVICEDTL", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const onSaveRecurValueValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATERECURRINGDATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const lienGridDetail = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIENGRIDDATA", {
      ...apiReq,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.LIEN_STATUS === "A") {
        item.LIEN_STATUS = "Active";
      } else {
        item.LIEN_STATUS = "Expired";
        item._rowColor = "var(--theme-color7)";
      }
      if (item?.CONFIRMED === "Y") {
        item.CONFIRMED = "Confirmed";
      } else {
        item.CONFIRMED = "Pending";
      }

      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDeleteRecurData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDELRECURRPAYMENTENTRY", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const recurringPaymentEntryDML = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("RECURRINGPAYMENTENTRYDML", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRucurPmtAdviceDtlJasper = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("RECURRINGPAYMENTGETADVICEDTLJASPER", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
