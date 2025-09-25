import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const validateDisAcct = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDISBACCT", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateNewDisbAmt = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATENEWDISBAMT", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDisbtrnAmt = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDISBTRNAMT", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDisbentry = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDISBENTRY", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDisbSchedule = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDISBSCHEDULE", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSubmemifScac = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSUBMEMIFSCAC", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// --TRANSACTION grid data
export const getDisbConfTrn = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDISBCONFTRNDATA", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const insertAPi = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODISBURSEMENTENTRY", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// Confirm/Reject API
export const entryConfirm = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODISBENTRYCONFIRMATION", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// View Memo API
export const viewmemo = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VIEWMEMODETAILS", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// view Schedule API
export const viewschedule = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VIEWSCHEDULEDETAILS", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDebitAccountvalidation = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIDRACDTL", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateSiExecuteDays = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESIEXECUTEDAY", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSiCharge = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSICHARGE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveSiCharge = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSIENTRY", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
