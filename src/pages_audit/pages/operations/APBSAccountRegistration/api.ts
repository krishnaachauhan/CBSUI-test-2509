import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAPBSAcctRegistrationData = async ({
  A_LOG_COMP_CD,
  A_LOG_BRANCH_CD,
  A_BASE_BRANCH,
  WORKING_DATE,
  A_FROM_DT,
  A_TO_DT,
  A_SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAPBSGRIDDATA", {
      A_LOG_COMP_CD: A_LOG_COMP_CD,
      A_LOG_BRANCH_CD: A_LOG_BRANCH_CD,
      A_BASE_BRANCH: A_BASE_BRANCH,
      WORKING_DATE: WORKING_DATE,
      A_FROM_DT: A_FROM_DT,
      A_TO_DT: A_TO_DT,
      A_SCREEN_REF: A_SCREEN_REF,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAadhaarNumber = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEAPBSUID", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAccountNumber = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEAPBSACCTNO", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateCustomerId = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEAPBSCUSTID", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAPBSStatus = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEAPBSSTATUS", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPreviousBankIINDDW = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPREVBANKIINDDDW", {
      COMP_CD: reqData?.[3]?.companyID,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ BANK_IIN, BANK_NAME }) => {
        return {
          value: BANK_IIN,
          label: BANK_IIN + " - " + BANK_NAME,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const apbsAcctRegistrationDML = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOAPBSACREGISTRATIONDML", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAPBSUIDResponse = async ({
  A_LOG_COMP_CD,
  A_LOG_BRANCH_CD,
  ORG_UNIQUE_ID,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAPBSUIDRESPONSE", {
      A_LOG_COMP_CD: A_LOG_COMP_CD,
      A_LOG_BRANCH_CD: A_LOG_BRANCH_CD,
      ORG_UNIQUE_ID: ORG_UNIQUE_ID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const ConfirmAPBSAcctRegistration = async (formData) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOCONFIRMAPBSREGISTRATIONENTRY",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
