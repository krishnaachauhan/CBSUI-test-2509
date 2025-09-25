import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getCashPaymentData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHPAYMENT", {
      ...reqData,
    });
  if (status === "0") {
    return data?.map((res) => ({ ...res, CHQ_BX_FLAG: "N" }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getParameters = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNPARAMF1", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
