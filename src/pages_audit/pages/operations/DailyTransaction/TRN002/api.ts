import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
import { format, parse } from "date-fns"; //format(new Date(), "dd/MMM/yyyy")

//List
export const getTRN002List = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAILYTRNCNFF2", {
      COMP_CD: reqData?.COMP_CD,
      BRANCH_CD: reqData?.BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Boolean(responseData?.length)) {
      responseData.map((ele, i) => {
        ele.index = i;
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNPAList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNPARECOVERYCNFDATA", {
      COMP_CD: reqData?.COMP_CD,
      BRANCH_CD: reqData?.BRANCH_CD,
      TRAN_DT: reqData?.TRAN_DT,
      FLAG: reqData?.FLAG,
      USERNAME: reqData?.USERNAME,
    });
  if (status === "0") {
    let responseData = data;
    if (Boolean(responseData?.length)) {
      responseData.map((ele, i) => {
        ele.index = i;
        ele.TRX_NM = ele?.TRX_DESC;
        ele.TYPE_NM = ele?.ACCT_TYPE_DESC;
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

//Operations
export const confirmScroll = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODUALCONFIRMATION", {
      DETAILS_DATA: {
        isNewRow: [...reqData],
        isDeleteRow: [],
        isUpdatedRow: [],
      },
    });
  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

//validate
export const getConfirmDataValidation = async (reqData) => {
  const parsedDate = parse(reqData?.OP_DATE, "dd/MM/yyyy", new Date());
  const formattedDate = format(parsedDate, "dd/MMM/yyyy");
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECONFRIMEDDATA", {
      BRANCH_CD: reqData?.BRANCH_CD,
      ACCT_TYPE: reqData?.ACCT_TYPE,
      ACCT_CD: reqData?.ACCT_CD,
      TYPE_CD: reqData?.TYPE_CD,
      TRAN_CD: reqData?.TRAN_CD,
      CUSTOMER_ID: reqData?.CUSTOMER_ID,
      AVALIABLE_BAL: reqData?.AVALIABLE_BAL,
      SHADOW_CL: reqData?.SHADOW_CL,
      HOLD_BAL: reqData?.HOLD_BAL,
      LEAN_AMT: reqData?.LEAN_AMT,
      AGAINST_CLEARING: reqData?.AGAINST_CLEARING,
      MIN_BALANCE: reqData?.MIN_BALANCE,
      CONF_BAL: reqData?.CONF_BAL,
      TRAN_BAL: reqData?.TRAN_BAL,
      UNCL_BAL: reqData?.UNCL_BAL,
      LIMIT_AMOUNT: reqData?.LIMIT_AMOUNT,
      DRAWING_POWER: reqData?.DRAWING_POWER,
      OD_APPLICABLE: reqData?.OD_APPLICABLE,
      AMOUNT: reqData?.AMOUNT,
      OP_DATE: formattedDate,
      ENTERED_COMP_CD: reqData?.ENTERED_COMP_CD,
      ENTERED_BRANCH_CD: reqData?.ENTERED_BRANCH_CD,
      ENTERED_BY: reqData?.ENTERED_BY,
      INST_DUE_DT: reqData?.INST_DUE_DT ?? "",
      STATUS: reqData?.STATUS,
      TYPE: "O",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
