import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const validateCustId = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("IMPSCUSTIDVALIDATION", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const populateData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETIMPSACCTLIST", {
      ...apiReqPara,
    });
  if (status === "0") {
    let newResp = data.map((item) => {
      return {
        ...item,
        REG_DT: apiReqPara?.WORKING_DATE,
        _isNewRow: true,
        FULL_ACCT_NO_NM: `Account Number :-  ${(
          item?.COMP_CD +
          item?.BRANCH_CD +
          item?.ACCT_TYPE +
          item?.ACCT_CD
        ).replace(/\s/g, "")} \u00A0\u00A0\u00A0 Account Name :-  ${
          item?.ACCT_NM
        }`,
      };
    });
    return newResp;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const retrieveData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETIMPSHDRDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getImpsDetails = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETIMPSDTLDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;
    let newResp = data.map((item) => {
      return {
        ...item,
        RETRIEVE_DATA: true,
        FULL_ACCT_NO_NM: `Account Number :-  ${(
          item?.COMP_CD +
          item?.BRANCH_CD +
          item?.ACCT_TYPE +
          item?.ACCT_CD
        ).replace(/\s/g, "")} \u00A0\u00A0\u00A0 Account Name :-  ${
          item?.ACCT_NM
        }`,
        IFT: item?.IFT === "Y" ? true : false,
        RTGS: item?.RTGS === "Y" ? true : false,
        NEFT: item?.NEFT === "Y" ? true : false,
        OWN_ACT: item?.OWN_ACT === "Y" ? true : false,
        BBPS: item?.BBPS === "Y" ? true : false,
        PG_TRN: item?.PG_TRN === "Y" ? true : false,
        IMPS: item?.IMPS === "Y" ? true : false,
      };
    });
    return newResp;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const dayLimitData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("IMPSDAILYSPENDLIMIT", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;
    let newResp = data.map((item) => {
      return {
        ...item,
        IFT: item?.IFT === "Y" ? true : false,
        RTGS: item?.RTGS === "Y" ? true : false,
        UPI: item?.UPI === "Y" ? true : false,
        NEFT: item?.NEFT === "Y" ? true : false,
        OWN_ACT: item?.OWN_ACT === "Y" ? true : false,
        PG_TRN: item?.PG_TRN === "Y" ? true : false,
        POS: item?.POS === "Y" ? true : false,
        ECOM: item?.ECOM === "Y" ? true : false,
        ATM: item?.ATM === "Y" ? true : false,
        IMPS: item?.IMPS === "Y" ? true : false,
        BBPS: item?.BBPS === "Y" ? true : false,
      };
    });
    return newResp;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getimpsCfmRetrieveData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETIMPSREGCONFGRID", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;
    let newData;
    if (Array.isArray(data) && data?.length > 0) {
      newData = data.map((item) => ({
        ...item,
        DISPLAY_ACTIVE: item?.ACTIVE === "Y" ? "Yes" : "No",
        DISPLAY_CONFIRMED:
          item?.CONFIRMED === "Y"
            ? "Confirmed"
            : item?.CONFIRMED === "R"
            ? "Rejected"
            : item?.CONFIRMED === "N"
            ? "Confirmation Pending"
            : "",
        _rowColor: item?.CONFIRMED === "Y" ? "rgb(9 132 3 / 51%)" : "",
      }));
    }
    return newData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateDeleteData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDELETEIMPSENTRY", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudDataIMPS = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("IMPSREGISTRATIONDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudDayLimitDataIMPS = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODAILYLIMITIMPSREGDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const confirmIMPSdata = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOIMPSREGCONFRIMATION", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const viewChangesData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMIMPSAUDRPT", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
