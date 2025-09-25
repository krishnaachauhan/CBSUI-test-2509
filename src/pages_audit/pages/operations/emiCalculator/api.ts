import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getEMIInstType = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEMICALCINSTTYPEDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getEMICalcPeriod = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEMICALCPERIODDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DATA_VAL, DISP_VAL, ...other }) => {
        return {
          ...other,
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

export const getEMICalcIntFund = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEMICALCINTFUNDEDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DATA_VAL, DISP_VAL, ...other }) => {
        return {
          ...other,
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

export const validateCheckEmiSchedule = async ({
  A_FLAG,
  A_INST_NO,
  A_FROM_INST,
  A_TO_INST,
  A_EMI_RS,
  A_PREV_FROM_INST,
  A_GD_DATE,
  A_SCREEN_REF,
  A_LANG,
  A_USER,
  A_USER_LEVEL,
}) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "CHECKEMISCHEDULEDTL",
    {
      A_FLAG: A_FLAG,
      A_INST_NO: A_INST_NO,
      A_FROM_INST: A_FROM_INST,
      A_TO_INST: A_TO_INST,
      A_EMI_RS: A_EMI_RS,
      A_PREV_FROM_INST: A_PREV_FROM_INST,
      A_GD_DATE: A_GD_DATE,
      A_SCREEN_REF: A_SCREEN_REF,
      A_LANG: A_LANG,
      A_USER: A_USER,
      A_USER_LEVEL: A_USER_LEVEL,
    }
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};

export const validateDisburseDetail = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKEMIDISBURSDTL", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const emiCalculateData = async ({ ...reqdata }) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "GETEMICACLCULATEDATA",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};

export const emiReportData = async ({ ...reqdata }) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "DOGETEMICALCULATEREPORT",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};
