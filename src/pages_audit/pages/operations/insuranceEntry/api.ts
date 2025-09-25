import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getInsuranceTypeData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINSUTYPMSTDATADISP", { ...reqData });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, INSURANCE_TYPE_CD, ...other }) => {
          return {
            value: INSURANCE_TYPE_CD,
            label: INSURANCE_TYPE_CD + "-" + DESCRIPTION,
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
export const getInsuranceCompanyData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINSUCOMPMSTDATADISP", { ...reqData });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, INSURANCE_COMP_CD, ...other }) => {
          return {
            value: INSURANCE_COMP_CD,
            label: INSURANCE_COMP_CD + "-" + DESCRIPTION,
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
export const getSecurityTypeData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECURITYTYPEDDDW", { ...reqData });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DATA_VAL, DISP_VAL }) => {
        return {
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSecurityData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITSECMSTDDDW", { ...reqData });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_NM, SECURITY_CD, ...other }) => {
          return {
            value: SECURITY_CD,
            label: DISPLAY_NM,
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

export const getInsuranceViewData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINSUENTRYMSTVIEW", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getInsuranceDetailData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNINSURANCETAB", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateInsuranceEntryData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEINSURANCEDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const doInsuranceDml = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOINSURANCEDML", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getInsuranceEntryDetail = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINSUENTRYDTL", {
      ...apiReq,
    });
  if (status === "0") {
    const detailData = await getInsuranceEntryDetailData({
      BRANCH_CD: data?.[0]?.BRANCH_CD,
      COMP_CD: data?.[0]?.COMP_CD,
      TRAN_CD: data?.[0]?.TRAN_CD,
    });
    return {
      ...data.map((item) => {
        return {
          ...item,
          RENEWED_FLAG: item.RENEWED_FLAG === "I" ? true : item.RENEWED_FLAG,
        };
      }),
      detailData,
    };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

const getInsuranceEntryDetailData = async ({ TRAN_CD, BRANCH_CD, COMP_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINSUENTRYSECDTL", {
      TRAN_CD: TRAN_CD,
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
