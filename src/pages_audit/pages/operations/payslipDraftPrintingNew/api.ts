import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getPaySlipTypeDdw = async ({ COMP_CD, BRANCH_CD, CODE }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CODE: CODE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, DESCRIPTION, ...rest }) => {
        return { ...rest, value: TRAN_CD, label: DESCRIPTION };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const retrieveData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDPRINTDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDDPrintPara = async ({ comp_cd, branch_cd, user_level }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDPRINTPARA", {
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
      USER_LEVEL: user_level,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getPayslipPrintConfigDTL = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDPRINTCONFIGDTL", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
