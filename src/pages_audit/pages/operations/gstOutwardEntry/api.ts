import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
export const getGstOutwardHeaderRetrive = async ({
  comp_cd,
  branch_cd,
  flag,
  gd_date,
  user_level,
  user_name,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTENTHDRGRID", {
      ENT_COMP_CD: comp_cd,
      ENT_BRANCH_CD: branch_cd,
      FLAG: flag,
      GD_DATE: gd_date,
      USER_LEVEL: user_level,
      A_USER: user_name,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.CONFIRMED === "N") {
        item._rowColor = "rgb(152 59 70 / 61%)";
      }
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGstOutwardGridRetrive = async ({
  comp_cd,
  branch_cd,
  ref_tran_cd,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTENTDTLGRID", {
      ENT_COMP_CD: comp_cd,
      ENT_BRANCH_CD: branch_cd,
      REF_TRAN_CD: ref_tran_cd,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAccountDetail = async (reqParameters) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTWARDACDTL", reqParameters);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGstOtwardModeDdw = async ({
  BASE_COMP_CD,
  BASE_BRANCH_CD,
  TEMPLATE_TYPE,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTENTMODEDDW", {
      COMP_CD: BASE_COMP_CD,
      BRANCH_CD: BASE_BRANCH_CD,
      TEMPLATE_TYPE: TEMPLATE_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...rest }) => {
          return { rest, value: DATA_VALUE, label: DISPLAY_VALUE };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGstOtwardTemplateDdw = async ({
  BASE_COMP_CD,
  BASE_BRANCH_CD,
  TEMPLATE_TYPE,
  GSTMODE,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTTEMPLATEDDW", {
      BASE_COMP_CD: BASE_COMP_CD,
      BASE_BRANCH_CD: BASE_BRANCH_CD,
      TEMPLATE_TYPE: TEMPLATE_TYPE,
      GSTMODE: GSTMODE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, CONFI_NAME, ...rest }) => {
        return { ...rest, value: TRAN_CD, label: CONFI_NAME };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getGstOutwardENtryDML = async (insertReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("DOGSTOUTWARDENTRYDML", { ...insertReq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const gstOutwardEntryConfirmation = async ({
  ENTERED_COMP_CD,
  ENTERED_BRANCH_CD,
  REF_TRAN_CD,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("DOGSTOUTWARDCONFIRMATION", {
      ENTERED_COMP_CD: ENTERED_COMP_CD,
      ENTERED_BRANCH_CD: ENTERED_BRANCH_CD,
      REF_TRAN_CD: REF_TRAN_CD,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
