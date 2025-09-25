import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAccountDetail = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTWARDACDTL", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCashPaymentData = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIPAYDATA", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getParameterData = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIPARA", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCashDeno = async ({
  BRANCH_CD,
  COMP_CD,
  TRAN_DT,
  USER_NAME,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIRECPENDENO", {
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
      TRAN_DT: TRAN_DT,
      USER_NAME: USER_NAME,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveCashRemiPayment = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DOCASHREMITTANCEPAYMENTENTRY",
      reqParameters
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const printReport = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMITTANCEPAYLETTER", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const retrieveDenoDtl = async (reqParameters) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIPAYDENODTL", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const confirmOrRejectEntry = async (reqParameters) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DOCASHREMITTANCECONFIRMATION",
      reqParameters
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCodeOptionData = async ({
  BRANCH_CD,
  COMP_CD,
  ADT_TRAN_DT,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIRECDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ADT_TRAN_DT: ADT_TRAN_DT,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, ...rest }) => {
        return { value: TRAN_CD, label: TRAN_CD, ...rest };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFirstSectionFormdata = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIRECHDR", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSecondSectionGridData = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIRECDTL", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveCashRemiReciept = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DOCASHREMITTANCERECEIPTENTRY",
      reqParameters
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const amountValidate = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECASHREMIRECAMT", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const retrieveCashReceiptData = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIRECCNFDATA", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getInitialPendingDeno = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHREMIRECPENDENO", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getBranch_TypeValidate = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOVALIDATEBRANCHTYPE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
