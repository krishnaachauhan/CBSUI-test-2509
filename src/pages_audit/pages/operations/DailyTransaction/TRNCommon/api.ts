import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
import { format } from "date-fns"; //format(new Date(), "dd/MMM/yyyy")

export const deleteScrollByScrollNo = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DELETESCROLLDATA", reqData);
  if (status === "0") {
    let obj = {
      data,
      status,
      message,
      messageDetails,
    };
    return obj;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const deleteNPAEntryByScrollNo = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOVALIDATESCRILLDELETE", reqData);
  if (status === "0") {
    let obj = {
      data,
      status,
      message,
      messageDetails,
    };
    return obj;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const deleteNPAEntry = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DONPARECOVERYENTRYDML", reqData);
  if (status === "0") {
    let obj = {
      data,
      status,
      message,
      messageDetails,
    };
    return obj;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const deleteScrollByVoucherNo = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODAILYTRNDML", {
      DETAILS_DATA: { isDeleteRow: [reqData], isUpdatedRow: [], isNewRow: [] },
    });
  if (status === "0") {
    let obj = {
      data,
      status,
      message,
      messageDetails,
    };
    return obj;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAccDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCOUNTDTL", {
      // COMP_CD: reqData.COMP_CD,
      BRANCH_CD: reqData.BRANCH_CD,
      ACCT_TYPE: reqData.ACCT_TYPE,
      ACCT_CD: reqData.ACCT_CD.padEnd(20, " "),
      A_ASON_DT: format(new Date(), "dd/MMM/yyyy"), //"15/DEC/2023"
    });
  if (status === "0") {
    let responseData = data;
    if (responseData.length > 0) {
      return responseData[0];
    } else {
      return responseData;
    }
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

interface reqObjTypes {
  reqData: any;
  controllerFinal?: any;
  row?: any;
}

export const getCarousalCards = async (reqObj: reqObjTypes) => {
  const { reqData, controllerFinal } = reqObj;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DAILYTRNCARDDTL",
      {
        PARENT_TYPE: reqData?.PARENT_TYPE,
        COMP_CD: reqData?.COMP_CD,
        ACCT_TYPE: reqData?.ACCT_TYPE,
        ACCT_CD: reqData?.ACCT_CD,
        BRANCH_CD: reqData?.BRANCH_CD,
      },
      {},
      null,
      controllerFinal
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTabsByParentType = async (reqObj: reqObjTypes) => {
  const { reqData, controllerFinal } = reqObj;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "GETDLYTRNTABFIELDDISP",
      {
        // PARENT_TYPE: reqData?.PARENT_TYPE,
        COMP_CD: reqData?.COMP_CD,
        ACCT_TYPE: reqData?.ACCT_TYPE,
        BRANCH_CD: reqData?.BRANCH_CD,
      },
      {},
      null,
      controllerFinal
    ); // Pass signal as an option

  if (status === "0") {
    data?.map((a, i) => {
      a.index1 = i;
    });

    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
