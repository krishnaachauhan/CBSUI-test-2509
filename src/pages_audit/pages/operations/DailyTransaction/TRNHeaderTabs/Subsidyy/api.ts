import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getSubsidyList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNSUBSIDYDTLF1", {
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
      item.sr = index + 1;
      item.ACTIVE_FLAG = item?.ACTIVE_FLAG === "Y" ? true : false;
      item.CR_TO_PARTY = item?.CR_TO_PARTY === "Y" ? true : false;
      item.FULL_ACCTNO = `${item?.TRF_BRANCH_CD?.trim() ?? ""} - ${
        item?.TRF_ACCT_TYPE?.trim() ?? ""
      }  - ${item?.TRF_ACCT_CD?.trim() ?? ""} `;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
