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
    await AuthSDK.internalFetcher("GETCASHDENO", {
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
