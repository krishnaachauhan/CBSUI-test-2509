import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const delteRtgsBranchConfirm = async (formData) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOSAVERTGSENTRY",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const rtgsHoConfirmtionAndDelete = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DORTGSHOCONFIRMATION", {
      ...formData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRtgsBranchConfirmtion = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODUALCONFIRMATION", {
      ...apiReq,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRtgsRetrBranchConfirmData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSRTRIVEFRMDTTODTGRID", {
      ...ApiReq,
    });
  if (status === "0") {
    const sortedData = data.sort((a, b) => a.SR_NO - b.SR_NO);
    return sortedData.map((item) => {
      return {
        ...item,
        HO_CONFIRM:
          item.HO_CONFIRMED === "0"
            ? "Pending"
            : item.HO_CONFIRMED === "Y"
            ? "Confirm"
            : item.HO_CONFIRMED,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsBranchConfirmOrderingData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSTRNHDRDATADISP", {
      ...ApiReq,
    });
  if (status === "0") {
    // if (data?.BR_CONFIRMED === "Y") {
    if (Array.isArray(data) && data.length > 0) {
      const acBalanceData = await getHoconfirmationAcBanlaceData({
        MSG_FLOW: data?.[0]?.MSG_FLOW,
        ENTRY_TYPE: data?.[0]?.ENTRY_TYPE,
        BASE_BRANCH_CD: data?.[0]?.BRANCH_CD,
        COMP_CD: data?.[0]?.COMP_CD,
        ENT_BRANCH_CD: data?.[0]?.ENTERED_BRANCH_CD,
        MSG_TYPE: data?.[0]?.TRAN_TYPE,
      });
      return {
        hdrData: data[0],
        acBalanceData: acBalanceData[0],
      };
    }
    // }
    // return data
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsBenDetailBranchConfirmData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSTRNDTLDATADISP", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item) => {
      item.TO_ACCT_NO_DISP = [
        item.TO_ACCT_NO,
        // item.TO_IFSCCODE,
        // item.TO_ACCT_NM,
        // item.TO_ACCT_TYPE,
      ];
      // .filter(Boolean)
      // .join("-");

      return item;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGenerateOtp = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGENERATEOTP", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const rtgsVerifyOTP = async (
  transactionId,
  recvOtp,
  otpnumber,
  otpValidSec,
  sentDate
) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcherPreLogin("DOVERIFYOTP", {
      TRN_TYPE: "RN_HO_CONF",
      TRAN_CD: transactionId || "00",
      RECV_OTP: recvOtp,
      OTP: otpnumber,
      OTP_VALID_SEC: otpValidSec,
      SENT_DATE: sentDate,
    });
  if (status === "0") {
    return {
      data: data[0],
      status,
      message,
      messageDetails,
    };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

const getHoconfirmationAcBanlaceData = async ({
  MSG_FLOW,
  ENTRY_TYPE,
  BASE_BRANCH_CD,
  COMP_CD,
  ENT_BRANCH_CD,
  MSG_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSTRANTYPEDDW", {
      MSG_FLOW: MSG_FLOW,
      ENTRY_TYPE: ENTRY_TYPE,
      BASE_BRANCH_CD: BASE_BRANCH_CD,
      COMP_CD: COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
      MSG_TYPE: MSG_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item) => {
      item.HO_TRAN_TYPE = [item.MSG_TYPE, item.DESCRIPTION]
        .filter(Boolean)
        .join("-");
      item.HO_ACCT_CD = [
        item.DEF_BRANCH_CD,
        item.DEF_COMP_CD,
        item.DEF_ACCT_TYPE,
        item.DEF_ACCT_CD,
      ]
        .filter(Boolean)
        .join("-");

      return item;
    });
    return responseData;
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
    await AuthSDK.internalFetcher("GETCONFIRMEDHISTORY", {
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
