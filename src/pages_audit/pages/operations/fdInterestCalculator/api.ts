import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getFDtype = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDTYPEDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...others }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
            ...others,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const gettypeDDWdata = async ({
  COMP_CD,
  BRANCH_CD,
  USER_NAME,
  DOC_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDDWACCTTYPE", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      USER_NAME: USER_NAME,
      DOC_CD: DOC_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ CONCDESCRIPTION, ACCT_TYPE, ...others }) => {
          return {
            value: ACCT_TYPE,
            label: CONCDESCRIPTION,
            ...others,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCategoryDDWdata = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTCATEGORYDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISPLAY_NM, CATEG_CD, ...others }) => {
        return {
          label: DISPLAY_NM,
          value: CATEG_CD,
          ...others,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFdDefinationDdw = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECTOFDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, DESCRIPTION, ...others }) => {
        return {
          value: TRAN_CD,
          label: DESCRIPTION,
          ...others,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFdinterest = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  CATEG_CD,
  MATURITY_DT,
  TRAN_DT,
  PERIOD_CD,
  PERIOD_NO,
  PRE_INT_FLAG,
  PRINCIPAL_AMT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDINTRATE", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      CATEG_CD: CATEG_CD,
      MATURITY_DT: MATURITY_DT,
      TRAN_DT: TRAN_DT,
      PERIOD_CD: PERIOD_CD,
      PERIOD_NO: PERIOD_NO,
      PRE_INT_FLAG: PRE_INT_FLAG,
      PRINCIPAL_AMT: PRINCIPAL_AMT,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFdMaturityAmount = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  CATEG_CD,
  MATURITY_DT,
  TRAN_DT,
  PERIOD_CD,
  PERIOD_NO,
  PRE_INT_FLAG,
  PRINCIPAL_AMT,
  INT_RATE,
  TERM_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDMATURITYAMT", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      CATEG_CD: CATEG_CD,
      MATURITY_DT: MATURITY_DT,
      TRAN_DT: TRAN_DT,
      PERIOD_CD: PERIOD_CD,
      PERIOD_NO: PERIOD_NO,
      PRE_INT_FLAG: PRE_INT_FLAG,
      PRINCIPAL_AMT: PRINCIPAL_AMT,
      INT_RATE: INT_RATE,
      TERM_CD: TERM_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFdRateDefination = async ({
  COMP_CD,
  BRANCH_CD,
  BASE_BRANCH,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDRATEDEFINITION", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      BASE_BRANCH: BASE_BRANCH,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, TRAN_CD, ...others }) => {
        return {
          value: TRAN_CD,
          label: DESCRIPTION,
          ...others,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCompareSheetReport = async ({
  COMP_CD,
  BRANCH_CD,
  HANDBOOK_FLG,
  TRAN_CD,
  PERIOD_CD,
  PERIOD_NO,
  AMOUNT,
  FR_DT,
  TO_DT,
  GD_TODAY,
  SPL_AMT_FLG,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("FDMATURITYCOMPAREJASPER", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      HANDBOOK_FLG: HANDBOOK_FLG,
      TRAN_CD: TRAN_CD,
      PERIOD_CD: PERIOD_CD,
      PERIOD_NO: PERIOD_NO,
      AMOUNT: AMOUNT,
      FR_DT: FR_DT,
      TO_DT: TO_DT,
      GD_TODAY: GD_TODAY,
      SPL_AMT_FLG: SPL_AMT_FLG,
      SCREEN_REF: SCREEN_REF,
    });
  if (status === "0") {
    console.log(data, "123");

    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRecurringFdReport = async ({
  COMP_CD,
  BRANCH_CD,
  ASON_DT,
  TRAN_CD,
  CATEG_CD,
  PROPOSED,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("RECCURRINGTOFDCALCULATORJASPER", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ASON_DT: ASON_DT,
      TRAN_CD: TRAN_CD,
      CATEG_CD: CATEG_CD,
      PROPOSED: PROPOSED,
      SCREEN_REF: SCREEN_REF,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, TRAN_CD, ...others }) => {
        return {
          value: TRAN_CD,
          label: DESCRIPTION,
          ...others,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
