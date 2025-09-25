import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
import { format } from "date-fns"; //format(new Date(), "dd/MMM/yyyy")

//lists

export const getSDCList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSDCLIST", {
      ...reqData,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((row) => {
        return {
          value: row.CODE,
          label: row.DISLAY_STANDARD,
          actLabel: row.DESCRIPTION,
          info: row,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNPASDCList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAGENTSDCDDW", {
      ...reqData,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((row) => {
        return {
          value: row.CODE,
          label: row.DISPLAY_STANDARD,
          actLabel: row.DESCRIPTION,
          info: row,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getBranchList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBRANCHDDDW", {
      COMP_CD: reqData?.COMP_CD ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((row) => {
        return {
          value: row.BRANCH_CD,
          label: row?.BRANCH_CD?.trim() + " - " + row.BRANCH_NM?.trim(),
          actLabel: row.BRANCH_NM,
          info: row,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAccTypeList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDDWACCTTYPE", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((row) => {
        return {
          value: row.ACCT_TYPE,
          label: row.CONCDESCRIPTION,
          actLabel: row.TYPE_NM,
          info: row,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTRXList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTRXLIST", {
      USER_NAME: reqData?.USER_ID ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      const shouldFilter = reqData?.screenFlag === "TRNF_BATCH";

      responseData = responseData
        .filter(
          (row) => !shouldFilter || row?.CODE === "3" || row?.CODE === "6"
        )
        .map((row) => ({
          value: row.CODE,
          code: row.CODE,
          label: `${row.CODE}-${row.DESCRIPTION}`,
          actLabel: row.DESCRIPTION,
          info: row,
        }));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNPATRXList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNPATRXLISTDDW", {
      USER_NAME: reqData?.USER_ID ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map((row) => ({
        value: row.CODE,
        code: row.CODE,
        label: `${row.CODE}-${row.DESCRIPTION}`,
        actLabel: row.DESCRIPTION,
        info: row,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTRN001List = async (reqData) => {
  //for table
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAILYTRNLIST", {
      COMP_CD: reqData?.COMP_CD,
      BRANCH_CD: reqData?.BRANCH_CD,
      USER_NAME: reqData?.USER_NAME ?? "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNPAList = async (reqData) => {
  //for table
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNPARECOVERYCNFDATA", {
      COMP_CD: reqData?.COMP_CD,
      BRANCH_CD: reqData?.BRANCH_CD,
      TRAN_DT: reqData?.TRAN_DT,
      FLAG: reqData?.FLAG,
      USERNAME: reqData?.USERNAME,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveScroll = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODAILYTRNDML", {
      DETAILS_DATA: { isDeleteRow: [], isUpdatedRow: [], isNewRow: reqData },
    });
  if (status === "0") {
    let obj = {
      data,
      status,
      messageDetails,
      message,
    };
    return obj;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const saveNPAEntry = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DONPARECOVERYENTRYDML", {
      ...reqData,
    });
  if (status === "0") {
    let obj = {
      data,
      status,
      messageDetails,
      message,
    };
    return obj;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

//validations

// export const getChqValidation = async (reqData) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("CHEQUENOVALIDATION", {
//       COMP_CD: reqData?.branch?.info?.COMP_CD,
//       BRANCH_CD: reqData?.branch?.value,
//       ACCT_TYPE: reqData?.accType?.value,
//       ACCT_CD: reqData.accNo.padEnd(20, " "),
//       CHEQUE_NO: reqData?.cNo,
//     });
//   if (status === "0") {
//     let responseData = data;

//     return responseData[0];
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
export const getChqDateValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECHQDATE", {
      BRANCH_CD: reqData?.BRANCH_CD ?? "", //099
      TYPE_CD: reqData?.TYPE_CD ?? "", //5
      CHEQUE_NO: reqData?.CHEQUE_NO ?? "", //33
      CHEQUE_DT: format(new Date(reqData?.CHEQUE_DT), "dd/MMM/yyyy"), //06/Mar/2024
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAmountValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECREDITDEBITAMT", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getParameters = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNPARAMF1", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getInterestCalculatePara = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINTCALCPARA", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTrxValidate = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKTYPECD", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getBranch_TypeValidate = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOVALIDATEBRANCHTYPE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
