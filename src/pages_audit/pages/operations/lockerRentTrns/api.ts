import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getTransactionsData = async ({
  BRANCH_CD,
  COMP_CD,
  ACCT_TYPE,
  ACCT_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERRENTPAIDTRAN", {
      BRANCH_CD,
      COMP_CD,
      ACCT_TYPE,
      ACCT_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getTodayTrnsData = async ({
  USERROLE,
  WORKING_DATE,
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  FROM_DT,
  TO_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERRENTTRAN", {
      USERROLE,
      WORKING_DATE,
      COMP_CD,
      BRANCH_CD,
      ACCT_TYPE,
      ACCT_CD,
      FROM_DT,
      TO_DT,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateLockerSize = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  LOCKER_NO,
  LST_ACCT_CD,
  LOC_SIZE_CD,
  RENT_PERIOD,
  TYPE_CD,
  AMOUNT,
  WORKING_DATE,
  USERNAME,
  USERROLE,
  SCREEN_REF,
  DISPLAY_LANGUAGE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKERSIZE", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      LOCKER_NO: LOCKER_NO,
      LST_ACCT_CD: LST_ACCT_CD,
      LOC_SIZE_CD: LOC_SIZE_CD,
      RENT_PERIOD: RENT_PERIOD,
      TYPE_CD: TYPE_CD,
      AMOUNT: AMOUNT,
      WORKING_DATE: WORKING_DATE,
      USERNAME: USERNAME,
      USERROLE: USERROLE,
      SCREEN_REF: SCREEN_REF,
      DISPLAY_LANGUAGE: DISPLAY_LANGUAGE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerRentPeriodData = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERRENTPERIODDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ PERIOD_DISP, PERIOD, ...items }) => {
        return {
          ...items,
          value: PERIOD,
          label: PERIOD_DISP,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateLockerRentPeriod = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  LOCKER_NO,
  LST_ACCT_CD,
  LOC_SIZE_CD,
  RENT_PERIOD,
  TYPE_CD,
  AMOUNT,
  RENT_FROM_DT,
  INST_DUE_DT,
  CATEG_CD,
  WORKING_DATE,
  USERNAME,
  USERROLE,
  SCREEN_REF,
  DISPLAY_LANGUAGE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKERRENTPERIOD", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      LOCKER_NO: LOCKER_NO,
      LST_ACCT_CD: LST_ACCT_CD,
      LOC_SIZE_CD: LOC_SIZE_CD,
      RENT_PERIOD: RENT_PERIOD,
      TYPE_CD: TYPE_CD,
      AMOUNT: AMOUNT,
      WORKING_DATE: WORKING_DATE,
      USERNAME: USERNAME,
      USERROLE: USERROLE,
      SCREEN_REF: SCREEN_REF,
      DISPLAY_LANGUAGE: DISPLAY_LANGUAGE,
      RENT_FROM_DT: RENT_FROM_DT,
      INST_DUE_DT: INST_DUE_DT,
      CATEG_CD: CATEG_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateAmountFields = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  LST_ACCT_CD,
  RENT_PERIOD,
  AMOUNT,
  INST_DUE_DT,
  FLAG,
  WORKING_DATE,
  USERNAME,
  USERROLE,
  SCREEN_REF,
  DISPLAY_LANGUAGE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKERRENTAMOUNT", {
      COMP_CD,
      BRANCH_CD,
      ACCT_TYPE,
      LST_ACCT_CD,
      RENT_PERIOD,
      AMOUNT,
      INST_DUE_DT,
      FLAG,
      WORKING_DATE,
      USERNAME,
      USERROLE,
      SCREEN_REF,
      DISPLAY_LANGUAGE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerInfoOnF5 = async ({ BRANCH_CD, COMP_CD, ACCT_TYPE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERNOONF5", {
      BRANCH_CD,
      COMP_CD,
      ACCT_TYPE,
      ALLOTED: "Y",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const lockerRentTransactionDML = async ({ ...reqpara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOLOCKERENTRANSACTIONDML", {
      ...reqpara,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
