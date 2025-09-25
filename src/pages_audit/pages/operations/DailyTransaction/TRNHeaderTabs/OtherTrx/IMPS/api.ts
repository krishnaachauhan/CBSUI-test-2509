import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getIMPSList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNIMPSTAB", {
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
      item.sr = index + 1;
      item.IFT = item?.IFT === "Y" ? true : false;
      item.RTGS = item?.RTGS === "Y" ? true : false;
      item.NEFT = item?.NEFT === "Y" ? true : false;
      item.IMPS = item?.IMPS === "Y" ? true : false;
      item.OWN_ACT = item?.OWN_ACT === "Y" ? true : false;
      item.BBPS = item?.BBPS === "Y" ? true : false;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
