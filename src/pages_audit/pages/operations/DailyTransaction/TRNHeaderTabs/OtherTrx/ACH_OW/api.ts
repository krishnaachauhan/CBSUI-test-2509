import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getACH_OWList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNNACHOTWRDTAB", {
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
      ENT_COMP_CD: reqData?.ENTERED_COMP_CD ?? "",
      ENT_BRANCH_CD: reqData?.ENTERED_BRANCH_CD ?? "",
    });
  if (status === "0") {
    let responseData = data?.map((item, index) => {
      return {
        ...item,
        index,
        sr: index + 1,
      };
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getACH_OWDetail = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNACHOTWDTLTAB", reqData);
  if (status === "0") {
    let responseData = data?.map((item, index) => {
      return {
        ...item,
        index,
        sr: index + 1,
        AMEND: item?.AMEND === "Y" ? true : false,
        DEST_PHNO:
          item?.DEST_AREA_PHNO || item?.DEST_PHNO
            ? `${item?.DEST_AREA_PHNO || ""}-${item?.DEST_PHNO || ""}`
            : "",
        DEST_MOBNO:
          item?.DEST_CNTRY_CD || item?.DEST_MOBNO
            ? `${item?.DEST_CNTRY_CD || ""}-${item?.DEST_MOBNO || ""}`
            : "",
      };
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
