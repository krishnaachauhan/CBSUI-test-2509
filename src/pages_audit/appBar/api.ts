import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getBankimgAndProfileimg = async ({ userID, companyID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("BANKPROFILEPICK", {
      COMP_CD: companyID,
      // COMP_CD: "132 ",
      APP_TRAN_CD: "51",
      USER_ID: userID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getQuickView = async ({ userID, companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETQUICKACCESSVIEW", {
      // COMP_CD: "473 ",
      // BRANCH_CD: "0002",
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      USER_NAME: userID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNotificationData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTNOTIFMST", {
      REQ_CD: "619",
      // COMP_CD: "473 ",
      // BRANCH_CD: "0002",
      // COMP_CD: companyID,
      // BRANCH_CD: branchCode,
      // USER_NAME: userID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
