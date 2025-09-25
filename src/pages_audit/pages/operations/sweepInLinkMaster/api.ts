import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const retrievedata = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSWEEPLINKHDR", {
      ...req,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((item, index) => ({
        ...item,
        ROW_CD: `${index}`,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const sweepfacility = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSWEEPLINKPARA", {
      ...req,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((item, index) => ({
        ...item,
        ROW_CD: `${index}`,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getGriddata = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSWEEPLINKDTL", {
      ...req,
    });
  if (status === "0") {
    return data.map((rest) => ({
      ...rest,
      ROW_EXIST: "Y",
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAcctFlag = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSWEEPLINKFLAGDDW", {
      ...req,
    });

  if (status === "999") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data.map(({ DATA_VALUE, DISPLAY_VALUE }) => ({
      DATA_VALUE: DATA_VALUE,
      DISPLAY_VALUE: DISPLAY_VALUE,
      value: DATA_VALUE,
      label: DISPLAY_VALUE,
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSweepDefination = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSWEEPLINKDEFDDW", {
      ...req,
    });

  if (status === "999") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data.map(
      ({ TRAN_CD, DESCRIPTION, SWEEP_TYPE, ACCT_FLAG, ALLOW_EDIT_BRANCH }) => ({
        DATA_VALUE: TRAN_CD,
        DISPLAY_VALUE: DESCRIPTION,
        value: TRAN_CD,
        label: DESCRIPTION,
        FLAG: SWEEP_TYPE,
        ACCTFLAG: ACCT_FLAG,
        ALLOWEDITBRANCH: ALLOW_EDIT_BRANCH,
      })
    );
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const submitdata = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSWEEPLINKMSTDML", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDisAcct = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSWEEPLINKACCTDATA", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const savevalidation = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESWEEPLINKDATA", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
