import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

// For Payslip and DD
export const getPayslipSignatureList = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPSIGNATUREDDW", {
      ...apiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ SIGNATURE_CD, DISLAY_SIGNATURE, ...other }) => {
          return {
            value: SIGNATURE_CD,
            label: DISLAY_SIGNATURE,
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

export const getPayslipBankCodeList = async (...apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPBANKCODEDDW", {
      COMP_CD: apiReq?.[3]?.companyID,
      BRANCH_CD: apiReq?.[3]?.user?.branchCode,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ COL_BANK_CD, BANK_NM, ...other }) => {
        return {
          value: COL_BANK_CD,
          label: COL_BANK_CD,
          BANK_NM: BANK_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPayslipRegionList = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPREGIONDDW", {
      ...apiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ REGION_CD, REGION_NM, ...other }) => {
        return {
          value: REGION_CD,
          label: REGION_CD.trim() + " - " + REGION_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validatePayslipNo = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEPAYSLIPNO", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPayslipInfavourOfList = async (...apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPINFAVOURDDW", {
      COMP_CD: apiReq?.[3]?.companyID,
      BRANCH_CD: apiReq?.[3]?.user?.branchCode,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ INFAVOUR_OF, TRAN_CD, ...other }) => {
        return {
          value: TRAN_CD,
          label: INFAVOUR_OF,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCalculateGstDtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPISSUECHARGE", reqData);
  if (status === "0") {
    return data;
  } else if (status === "999") {
    throw DefaultErrorObject(message, messageDetails);
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getNEFTFlags = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPARAMNEFTDD", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCommTypeList = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
      ...apiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, TRAN_CD, DEFAULT_VAL, ...other }) => {
          return {
            value: TRAN_CD,
            label: DESCRIPTION,
            billTypeDefaultVal: DEFAULT_VAL,
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

// For NEFT
export const getRtgsBenfDtlList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSBNFCRYDTL", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISP_VAL, TO_ACCT_NO, ...other }) => {
        return {
          value: TO_ACCT_NO,
          label: DISP_VAL,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getIfscBenDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSCDTL", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getIfscBankDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSCCODEACWISE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
