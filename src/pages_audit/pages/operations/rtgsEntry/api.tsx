import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getAccountDetail = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSACDTL", { ...Apireq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getEntryType = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSENTRYTYPEDDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({
          DISPLAY_VALUE,
          DEFAULT_VALUE,
          DATA_VALUE,
          DEFAULT_VAL,
          ...other
        }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
            entryTypeDefaultVal: DEFAULT_VAL,
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
export const getJointDetailsList = async (Apireq?) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNJOINTTAB", { ...Apireq });
  if (status === "0") {
    // return data;
    let responseData = data;
    responseData.map((a, i) => {
      a.index = i;
      a.phone1 = [a.MOBILE_NO, a.PHONE].filter(Boolean).join(", ");
      a.MEM_DISP_ACCT_TYPE = [a.MEM_ACCT_TYPE, a.MEM_ACCT_CD]
        .filter(Boolean)
        .join("-");
      a.REF_ACCT = [
        a.REF_BRANCH_CD,
        a.REF_COMP_CD,
        a.REF_ACCT_TYPE,
        a.MEM_ACCT_CD,
      ]
        .filter(Boolean)
        .join("-");

      return a;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsTransactionTypeList = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSTRANTYPEDDW", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, MSG_TYPE, DEFAULT_VAL, ...other }) => {
          return {
            value: MSG_TYPE,
            label: MSG_TYPE + "-" + DESCRIPTION,
            RtgsTransactionTypeDefaultVal: DEFAULT_VAL,
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
export const getCommTypeList = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, TRAN_CD, DEFAULT_VAL, ...other }) => {
          return {
            value: TRAN_CD,
            label: DESCRIPTION,
            getCommTypeDefaultVal: DEFAULT_VAL,
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
export const getIfscCodeList = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBRANCHIFSCCODE", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_VALUE, DEFAULT_VALUE, DATA_VALUE, ...other }) => {
          return {
            DEFAULT_VALUE: DEFAULT_VALUE,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
            getIfscCodeDefaultVal: DEFAULT_VALUE,
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
export const getRtgsBenfDtlList = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSBNFCRYDTL", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISP_VAL, TO_ACCT_NO, AC_UQ_ID, ...other }, i) => {
          return {
            value: TO_ACCT_NO,
            // value: TO_ACCT_NO,
            label: DISP_VAL,
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
export const getRtgsBenfData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSBNFCRYDTL", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getIfscBankDetail = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSCCODEACWISE", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getIfscBankGridData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSCCODEGRID", {
      ...ApiReq,
    });
  if (status === "0") {
    data.map((a, i) => {
      a.index = i;
      return a;
    });
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsChequeNoValidation = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHEQUENOVALIDATION", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsAmountChargeValidation = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSCHARGE", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getIfscBenDetail = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSCDTL", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAuditDml = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOBENEFICIARYACCTAUDITENTRY", {
      ...ApiReq,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateRtgsDetail = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATERTGSDATA", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateAmount = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATERTGSAMOUNT", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsEntryDML = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSAVERTGSENTRY", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsRetrieveData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSRTRIVEFRMDTTODTGRID", {
      ...ApiReq,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        HO_CONFIRMED:
          item.HO_CONFIRMED === "0"
            ? "Pending"
            : item.HO_CONFIRMED === "Y"
            ? "Confirm"
            : item.HO_CONFIRMED,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsOrderingData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSTRNHDRDATADISP", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRtgsBenDetailData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSTRNDTLDATADISP", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAcctTypeData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPAYMENTINSTRTOTYPEDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DATA_VALUE, DISPLAY_VALUE }) => {
        return {
          value: DATA_VALUE,
          label: DISPLAY_VALUE,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// export const getIfscBenDetail = async (reqObj: reqObjTypes) => {
//   const { reqData, controllerFinal } = reqObj;
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher(
//       "GETIFSCDETAILS",
//       {
//         // PARENT_TYPE: reqData?.PARENT_TYPE,
//         IFSC_CODE: reqData?.TO_IFSCCODE,
//         ENTRY_TYPE: "RTGS",
//       },
//       {},
//       null,
//       controllerFinal
//     ); // Pass signal as an option

//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

export const getIfscAllListData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSGCODEALL", {});
  if (status === "0") {
    data.map((a, i) => {
      a.index = i;
      a.bankBranchName = a?.BANK_NM + a?.BRANCH_NM;
      return a;
    });
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getChqDateValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECHQDATE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const verifyButton = async ({ ...reqData }) => {
  try {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("VALIDATERTGSBULK", {
        ...reqData,
      });

    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } catch (error) {
    throw error;
  }
};
