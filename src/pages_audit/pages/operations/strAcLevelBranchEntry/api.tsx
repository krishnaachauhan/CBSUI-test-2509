import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getStrBranchLevelData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETSTRDATA`, { ...Apireq });
  if (status === "0") {
    return data.map((a, i) => {
      a.index = i;
      return a;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getStrSuspiciousTransactionData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETSTRTRANDTL`, { ...Apireq });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        SUSPICIOUS_FLAG: item?.SUSPICIOUS_FLAG === "Y" ? true : false,
        _isNewRow: item["NEW_INSERT"] === "N" ? false : true,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGroundSuspicionData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETSTRGOSDTL`, { ...Apireq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updateBranhcDetailData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`UPDATESTRBRANCHDTL`, { ...Apireq });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const susTransactionDetailDML = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`DOSTRTRANDML`, { ...Apireq });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getStrAcHistoryData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETSTRACCTHISTORY`, { ...Apireq });
  if (status === "0") {
    return data.map((a, i) => {
      a.index = i;
      return a;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSuspStatusData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETSTRSUSPSTATUSDDDW`, { ...Apireq });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VAL, DISP_VAL, REMARKS2_MANDATORY }) => {
          return {
            value: DATA_VAL,
            label: DISP_VAL,
            REMARKS2_MANDATORY: REMARKS2_MANDATORY,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSuspReasonData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETSTRSUSPREASONDDDW`, { ...Apireq });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ REASON, REASON_TRAN_SR_CD }) => {
        return {
          value: REASON_TRAN_SR_CD,
          label: REASON,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
