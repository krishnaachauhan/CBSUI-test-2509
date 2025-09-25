import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getInterestCalculateReportDTL = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("INTERESTCALCULATIONFORSINGLEACCOUNTREPORT", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getHeaderDTL = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETHEADERDETAILS", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const applyAccountInt = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("APPLYACCTINT", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const revertAccountInt = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("REVERTBUTTONCTRI", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
