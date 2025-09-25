import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAcctPhotoSign = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  WORKING_DATE,
  USERNAME,
  USERROLE,
  DOC_CD,
  DISPLAY_LANGUAGE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTSIGNPHOTO", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      WORKING_DATE: WORKING_DATE,
      USERNAME: USERNAME,
      USERROLE: USERROLE,
      DOC_CD: DOC_CD,
      DISPLAY_LANGUAGE: DISPLAY_LANGUAGE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCarousalCards = async (reqData) => {
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

export const saveAccountPhotoDtl = async ({
  BRANCH_CD,
  COMP_CD,
  ACCT_TYPE,
  ACCT_PHOTO,
  ACCT_SIGN,
  ACCT_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVEACCOUNTPHOTODTL", {
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_PHOTO: ACCT_PHOTO,
      ACCT_SIGN: ACCT_SIGN,
      ACCT_CD: ACCT_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
