import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAccountCloseValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSEDPRDATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCarousalCards = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DAILYTRNCARDDTL", reqData);
  if (status === "0") {
    data?.map((a) => {
      if (a?.COMPONENT_TYPE == "amountField" && !a?.COL_VALUE.includes(".")) {
        a.COL_VALUE = a.COL_VALUE + ".00";
      }
    });
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTransactionTabData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSEPROCTRANTAB", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getHoldTransactionTabData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNHOLDCHRGF1", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getMembersTabData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSEPROCMEMTAB", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getParkedChargesTabData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSEPROCPARKEDTAB", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTRXList = async (reqData, formState) => {
  formState.handleButtonDisable(true);
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTRXLIST", reqData);
  if (status === "0") {
    let responseData = data;
    let TYPE_CD = formState?.TYPE_CD.split(",");
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CODE, DESCRIPTION, ...other }) => {
        return {
          ...other,
          value: CODE,
          label: DESCRIPTION,
        };
      });
      let RESULT = responseData.filter((item) => TYPE_CD.includes(item?.value));
      formState.handleButtonDisable(false);
      return RESULT;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getAccountCloseReason = async (...reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTCLOSEPROCREASON", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.branchCode ?? "",
      STATUS: "C",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ CODE, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          value: CODE,
          label: DISPLAY_NM,
        };
      });
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getSettleCharges = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSETTLECHARGES", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const valildateTransferAccount = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEOPPACCT", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const valildateAcctCloseBtn = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCTCLOSEBT", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const accountCloseEntry = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOACCTCLOSEENTRY", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const neftDDValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DONEFTDDENTRY", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
