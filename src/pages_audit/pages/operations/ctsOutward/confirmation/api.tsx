import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getBussinessDate = async ({ SCREEN_REF }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBUSINESSDATE", {
      SCREEN_REF: SCREEN_REF,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const outwardClearingConfigDML = async (formData) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOOWCLEARINGDML",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRetrievalClearingData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETCTSCNFRETRIEV`, { ...Apireq });
  if (status === "0") {
    const sortedData = data.sort((a, b) => a.SR_NO - b.SR_NO);
    return sortedData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getOutwardConfirmViewDetailData = async ({
  ENTERED_COMP_CD,
  ENTERED_BRANCH_CD,
  TRAN_CD,
  TRAN_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCLEARINGDETAILS", {
      COMP_CD: ENTERED_COMP_CD,
      TRAN_CD: TRAN_CD,
      BRANCH_CD: ENTERED_BRANCH_CD,
      TRAN_TYPE: TRAN_TYPE,
    });
  if (status === "0") {
    let sum = data
      ?.map((item) => Number(item?.AMOUNT))
      .reduce((acc, amount) => acc + amount, 0);
    return data.map((item) => {
      return {
        ...item,
        CONFIRMED: item.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        CONFIRMBUTTON: item.CONFIRMED,
        TOTAL_AMOUNT: sum,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getInwardChequeSignFormData = async ({
  COMP_CD,
  ENTERED_COMP_CD,
  ENTERED_BRANCH_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  DAILY_TRN_CD,
  TRAN_CD,
  TRAN_DT,
  TRAN_FLAG,
  WITH_SIGN,
  ENTERED_BY,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHEQUESIGNIMG", {
      COMP_CD: COMP_CD,
      ENTERED_COMP_CD: ENTERED_COMP_CD,
      ENTERED_BRANCH_CD: ENTERED_BRANCH_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      DAILY_TRN_CD: DAILY_TRN_CD,
      TRAN_CD: TRAN_CD,
      TRAN_DT: TRAN_DT,
      TRAN_FLAG: TRAN_FLAG,
      WITH_SIGN: WITH_SIGN,
      ENTERED_BY: ENTERED_BY,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const ctsConfirmtion = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCTSCONFIRMATION", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const outWardAndInwardConfirmtion = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("RETURNCONFIRMATION", {
      ...apiReq,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getConfirmHistoryData = async ({
  ENTERED_COMP_CD,
  ENTERED_BRANCH_CD,
  TRAN_DT,
  TRAN_CD,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCONFIMEDHISTORY", {
      ENTERED_COMP_CD: ENTERED_COMP_CD,
      TRAN_DT: TRAN_DT,
      ENTERED_BRANCH_CD: ENTERED_BRANCH_CD,
      SCREEN_REF: SCREEN_REF,
      TRAN_CD: TRAN_CD,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        TRN_CONF_CNT: item.TRN_CONF_CNT === "1" ? "Entry" : "Confirmation",
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
