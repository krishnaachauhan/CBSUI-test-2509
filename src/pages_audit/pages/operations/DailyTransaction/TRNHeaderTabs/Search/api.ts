import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getSearchList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSEARCHDTL", {
      COMP_CD: reqData.COMP_CD,
      ACCT_TYPE: reqData.ACCT_TYPE,
      ACCT_CD: reqData.ACCT_CD,
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((a, i) => {
      a.index = i;
      a.sr = i + 1;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getChequeBookEntryData = async ({
  companyID,
  branchCD,
  acctType,
  accountNo,
}) => {
  if (!Boolean(branchCD)) {
    throw DefaultErrorObject(
      "Required value missing for Branch.",
      "",
      "warning"
    );
  } else if (!Boolean(acctType)) {
    throw DefaultErrorObject(
      "Required value missing for Account Type.",
      "",
      "warning"
    );
  } else if (!Boolean(accountNo)) {
    throw DefaultErrorObject(
      "Required value missing for Account Number.",
      "",
      "warning"
    );
  } else {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCHEQUEBOOK", {
        COMP_CD: companyID,
        BRANCH_CD: branchCD,
        ACCT_TYPE: acctType,
        ACCT_CD: accountNo,
      });

    if (status === "0") {
      let responsedata = data;
      return responsedata;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getChequeLeavesList88888 = async ({ NO_OF_CHEQUE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQLEAVESLIST", { COMP_CD: "132 " });
  if (status === "0") {
    return [
      {
        // CHEQUE_FROM: "8080808",
        // CHEQUE_TO: "9090909",
        SERVICE_CHARGE: "757754",
        GST: "4564564 ",
        FROM_CHEQUE_NO: "8080808",
        TO_CHEQUE_NO: "9090909",
        NO_OF_CHEQUE: NO_OF_CHEQUE,
        // SERVICE_CHARGE: "757754",
        // GST: "4564564 ",
      },
    ];
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustomerCardDetailThroughCB = async ({ clientID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUSERDTL360", {
      CUSTOMER_DTL_LIST: { CBNUMBER: clientID, APP_INDICATOR: "TRANZWARE" },
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveCustomerRegisterRequest = async ({ inputData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("INSCUSTREGREQ", {
      INPUT_DATA: inputData,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
