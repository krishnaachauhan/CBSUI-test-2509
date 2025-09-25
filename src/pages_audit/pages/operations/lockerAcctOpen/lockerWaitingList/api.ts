import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getLockerWaitingListDtl = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERWAITINGLISTDTL", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data.map((d: any) => ({
      ...d,
      ALLOTED:
        d.ALLOTED?.toString().trim().toUpperCase() === "Y" ? true : false,
    }));
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustomerValidate = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECUSTID", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustomerDtl = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTIDVAL", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const locTypeWaitListDml = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("LOCKERTYPEWAITINGLISTDML", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
