import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getCashDeno = async ({
  BRANCH_CD,
  COMP_CD,
  TRAN_DT,
  USER_NAME,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHDENO", {
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
      TRAN_DT: TRAN_DT,
      USER_NAME: USER_NAME,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const customerInsert = async (request) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CUSTOMERCASHEXCHANGE", {
      ...request,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCurrExchangeTypeDDW = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCURREXCHNGTYPEDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, DEFAULT_VAL, ...other }) => {
          return {
            ...other,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
            entryTypeDefaultVal: DEFAULT_VAL,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPMISCData = async (CATEGORY_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", {
      CATEGORY_CD: CATEGORY_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCurrExchngAcct = async (request) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCURREXCHNGACCTDATA", {
      ...request,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateUniqueId = async (columnValue, allField?, formState?) => {
  const UNIQUEID = columnValue.value;
  if (UNIQUEID) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETUNIQUEIDSTATUS", {
        UNIQUEID: UNIQUEID,
      });
    if (status === "0") {
      const UID_STATUS = data?.[0]?.UID_STATUS;
      if (UID_STATUS) {
        if (UID_STATUS === "I") {
          return "PleaseEnterValidUniqueID";
        } else if (UID_STATUS === "N") {
          return "UniqueIDLength";
        }
      } else return "";
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const validatePAN = async (columnValue) => {
  const PAN = columnValue?.value;
  if (PAN) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETPANSTATUS", {
        PAN: PAN ?? "",
      });
    if (status === "0") {
      const PAN_STATUS = data?.[0]?.PAN_STATUS;
      if (PAN_STATUS && PAN_STATUS !== "Y") {
        return "Please Enter Valid PAN Number";
      }
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const validateDenoAmount = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDENOAMOUNT", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
