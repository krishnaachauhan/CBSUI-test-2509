import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getCustUpdDtl = async (reportId, _, reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(reportId, reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
