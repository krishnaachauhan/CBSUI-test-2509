import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getParameter = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMREGPARA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAcctAndCustId = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCOUNTANDCUSTID", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const cardStatusList = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMCARDSTATUSDDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DIS_VALUE, DATA_VALUE, ...other }) => {
        return {
          value: DATA_VALUE,
          label: DIS_VALUE,
          ...other,
        };
      });
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const cardTypeList = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMCARDTYPEDDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, CARD_TYPE, ...other }) => {
          return {
            value: CARD_TYPE,
            label: CARD_TYPE + " - " + DESCRIPTION,
            ...other,
          };
        }
      );
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const acctTypeList = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMACCTTYPEDDDW", { ...apiReq });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ACCT_TYPE, ...other }) => {
        return {
          value: ACCT_TYPE,
          label: ACCT_TYPE + " - " + other.DESCRIPTION,
          ...other,
        };
      });
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getATMcardDetails = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMDTLDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;
    let newData;
    if (Array.isArray(data) && data?.length > 0) {
      newData = data.map((item) => ({
        ...item,
        DISPLAY_CARD_ISSUE_TYPE:
          item?.CARD_ISSUE_TYPE === "A"
            ? "Account"
            : item?.CARD_ISSUE_TYPE === "J"
            ? "Join A/C"
            : "",
        DISPLAY_STATUS:
          item?.STATUS === "B"
            ? "Block"
            : item?.STATUS === "D"
            ? "Destroy"
            : item?.STATUS === "A"
            ? "Issued"
            : item?.STATUS === "L"
            ? "Lost"
            : item?.STATUS === "N"
            ? "OFF"
            : item?.STATUS === "P"
            ? "Pending Issue"
            : item?.STATUS === "R"
            ? "Reject (OFF)"
            : item?.STATUS === "C"
            ? "Replace"
            : "",
      }));
    }
    return newData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const retrieveData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("RETRIVEATMREGISTRATIONDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;
    let newData;
    if (Array.isArray(data) && data?.length > 0) {
      newData = data.map((item) => ({
        ...item,
        // ACCT_NM: item?.ORGINAL_NM,
        // ACCOUNT_NAME: item?.ACCT_NM,
      }));
    }
    return newData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateCitizenId = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECITIZENID", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCfmRetrieveData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETATMREGCONFGRID", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;
    let newData;
    if (Array.isArray(data) && data?.length > 0) {
      newData = data.map((item) => ({
        ...item,
        ACCOUNT_NAME: item?.ACCT_NM,
        DISPLAY_STATUS:
          item?.STATUS === "B"
            ? "Block"
            : item?.STATUS === "D"
            ? "Destroy"
            : item?.STATUS === "A"
            ? "Issued"
            : item?.STATUS === "L"
            ? "Lost"
            : item?.STATUS === "N"
            ? "OFF"
            : item?.STATUS === "P"
            ? "Pending Issue"
            : item?.STATUS === "R"
            ? "Reject (OFF)"
            : item?.STATUS === "C"
            ? "Replace"
            : "",
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

export const validateCardStatus = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECARDSTATUS", {
      ...apiReqPara,
    });
  if (status === "0") {
    return { resp: data[0], status: status };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateInsertData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEATMREGSAVEDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const crudData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOATMREGISTRATIONDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const confirmData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOATMREGCONFRIMATION", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
