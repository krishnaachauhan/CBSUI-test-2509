import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getunclaimdata = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUNCLAIMPAYMENTDATA", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const unclaimConfirmationdata = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOUNCLAIMPAYMENTANDCONFIRMATION", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
