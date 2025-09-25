import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const fetchFDPaymentConfAcct = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPAYMENTINSTRDTLCNF", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDPaymentInstruConfAcctDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPAYMENTINSTRHDRCNF", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const doFDPaymentInstruEntryConfm = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DOFDINTERESTPAYMENTINSTRUCTIONMASTERCONFIRMATION",
      {
        ...reqData,
      }
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
