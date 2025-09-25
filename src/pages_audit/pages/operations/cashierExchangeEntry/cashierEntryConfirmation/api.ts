import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getCashierExchangeRetrieve = async ({
  comp_cd,
  branch_cd,
  doc_cd,
  acct_type,
  acct_cd,
  flag,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHEXCHANGECNF", {
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
      DOC_CD: doc_cd,
      ACCT_TYPE: acct_type,
      ACCT_CD: acct_cd,
      FLAG: flag,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCashierViewDetail = async ({
  comp_cd,
  branch_cd,
  scroll1,
  type_cd,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHEXCHANGEDTLCNF", {
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
      SCROLL1: scroll1,
      TYPE_CD: type_cd,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCashierExchangeEntryConfirmation = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCASHEXCHANGECONFIRMATION", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
