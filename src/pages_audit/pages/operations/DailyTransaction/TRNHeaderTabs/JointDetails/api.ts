import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getJointDetailsList = async (reqData?) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNJOINTTAB", {
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
      item.MOBILE_NO = item?.MOBILE_NO ?? "" + "," + item?.PHONE ?? "";
      item.MEM_ACCT_CD =
        Boolean(item?.MEM_ACCT_TYPE) && Boolean(item?.MEM_ACCT_CD)
          ? item?.MEM_ACCT_TYPE?.trim() + " - " + item?.MEM_ACCT_CD?.trim()
          : "";
      item.REF_ACCT_CD =
        item?.REF_COMP_CD?.trim() ??
        "" + item?.REF_BRANCH_CD?.trim() ??
        "" + item?.REF_ACCT_TYPE?.trim() ??
        "" + item?.REF_ACCT_CD?.trim() ??
        "";
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
