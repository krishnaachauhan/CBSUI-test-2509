import { DefaultErrorObject } from "@acuteinfo/common-base";
import { intervalToDuration } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getPmbyRegData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTATEMAILSTATUSDDW", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const savePmByEntry = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("PMBYREGISTRATIONENTRY", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const doEntryConfirm = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("PMBYENTRYCONFIRM", reqData);
  if (status === "0") {
    return data;
  }
  if (status === "999") {
    return { status, message };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validatePmByEntry = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEPMBYDATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validatePmbyAcctNo = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMBYREGACCTDATA", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getInsuaranceThroughDDW = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMBYINSURDDW", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ COMPANY_NM, TRAN_CD, ...other }) => {
        return {
          value: TRAN_CD,
          label: COMPANY_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAgentCdDDW = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAGENTMSTRETRIVE", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISPLAY_NM, AGENT_CD, ...other }) => {
        return {
          value: AGENT_CD,
          label: DISPLAY_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDisabilityDDW = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDEFAULTDDW", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISP_VAL, DATA_VAL, ...other }) => {
        return {
          value: DATA_VAL,
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
export const getRelationDDW = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", {
      CATEGORY_CD: "PMBY_RELATION",
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...other }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
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

export const getAge = (
  input: string | Date
): { years: number; months: number; days: number } | { error: string } => {
  const birthDate = typeof input === "string" ? new Date(input) : input;

  if (isNaN(birthDate.getTime())) {
    return { error: "Invalid date" };
  }

  const duration = intervalToDuration({ start: birthDate, end: new Date() });

  return {
    years: duration.years ?? 0,
    months: duration.months ?? 0,
    days: duration.days ?? 0,
  };
};
export const getDataToConfirm = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMBYREGDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData;
    if (Array.isArray(data) && data?.length > 0) {
      responseData = data.map((item, index) => {
        return {
          ...item,
          INDEX: `${index + 1}`,
          PENDING_FLAG: item?.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
