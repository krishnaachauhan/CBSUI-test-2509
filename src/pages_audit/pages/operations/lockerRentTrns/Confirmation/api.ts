import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getLockerRentConfirnData = async ({
  COMP_CD,
  BRANCH_CD,
  TRAN_DT,
  FLAG,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERRENTCNF", {
      COMP_CD,
      BRANCH_CD,
      TRAN_DT,
      FLAG,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const confirmRejectLockerRentEntry = async ({ ...reqPara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOLOCKERENTRYCONFIRMATION", {
      ...reqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getTodatTrnsData = async ({ COMP_CD, BRANCH_CD, TRAN_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERRENTTODAYTRAN", {
      COMP_CD,
      BRANCH_CD,
      TRAN_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getViewAllRentPaidTabData = async ({
  COMP_CD,
  BRANCH_CD,
  TRAN_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERRENTTODAYTRAN", {
      COMP_CD,
      BRANCH_CD,
      TRAN_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
