import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAccountCloseConfDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSECNFDTL", reqData);
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.INDEX = index;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAccountDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DAILYTRNCARDDTL", reqData);
  if (status === "0") {
    data?.map((a) => {
      if (a?.COMPONENT_TYPE == "amountField" && !a?.COL_VALUE.includes(".")) {
        a.COL_VALUE = a.COL_VALUE + ".00";
      }
    });
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAccountCloseVoucherDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSECNFVOUCHERDTL", reqData);
  if (status === "0") {
    data?.map((a) => {
      if (a?.COMPONENT_TYPE == "amountField" && !a?.COL_VALUE.includes(".")) {
        a.COL_VALUE = a.COL_VALUE + ".00";
      }
    });
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const accountCloseConfirm = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOACCTCLOSECONFRIMREOPEN", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
