import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getNpaCategoryMasterGridData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNPACATMSTDATADISP", {
      COMP_CD: reqData?.companyID,
      BRANCH_CD: reqData?.branchCode,
    });
  if (status === "0") {
    return data?.map((item: any) => {
      return {
        ...item,
        SECURE_PROV_PERC: parseFloat(item.SECURE_PROV_PERC).toFixed(2),
        UNSECURE_PROV_PERC: parseFloat(item.UNSECURE_PROV_PERC).toFixed(2),
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateNpaCategoryMasterData = async (reqdata) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DONPACATEGDML",
    reqdata
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const recoverIdDropDown = async ({ data: reqdata }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETADVRECOVERYDDDW", reqdata);
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ CONFIG_ID, ...other }) => {
        return {
          ...other,
          value: CONFIG_ID,
          label: CONFIG_ID,
        };
      });
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};
