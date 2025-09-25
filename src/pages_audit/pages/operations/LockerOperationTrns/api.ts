import { DefaultErrorObject } from "@acuteinfo/common-base";
import i18n from "components/multiLanguage/languagesConfiguration";
import { AuthSDK } from "registry/fns/auth";

export const getLockerOperationTrnsData = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_CD,
  ACCT_TYPE,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKEROPERATIONTRN", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_CD: ACCT_CD,
      ACCT_TYPE: ACCT_TYPE,
      WORKING_DATE: WORKING_DATE,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((items, index) => ({
        ...items,
        INDEX: index,
        OPER_STATUS_DISPLAY:
          items?.OPER_STATUS === "I" ? "In Time" : "Exit Time",
      }));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerSizeDDWdata = async ({
  LOCKER_NO,
  ACCT_TYPE,
  BRANCH_CD,
  COMP_CD,
  ALLOTED,
  DEFAULT_VAL,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERSIZEDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      LOCKER_NO: LOCKER_NO,
      ACCT_TYPE: ACCT_TYPE,
      ALLOTED: ALLOTED,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ LOC_SIZE_CD, SIZE_NM, ...items }) => {
        return {
          ...items,
          value: LOC_SIZE_CD,
          label: SIZE_NM,
          DEFAULT_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerViewMst = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_CD,
  ACCT_TYPE,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERVIEWMST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_CD: ACCT_CD,
      ACCT_TYPE: ACCT_TYPE,
      WORKING_DATE: WORKING_DATE,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerOperationDDWdata = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKEROPERATIONDDDW", {});

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DATA_VAL, DISL_VAL, ...items }) => {
        return {
          ...items,
          value: DATA_VAL,
          label: DISL_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerTrxDDWdata = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERTRXDDDW", {});

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISP_VAL, DATA_VAL, ...items }) => {
        return {
          ...items,
          label: DISP_VAL,
          value: DATA_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateLockerNo = async ({
  COMP_CD,
  BRANCH_CD,
  LOCKER_NO,
  ACCT_TYPE,
  DOC_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKERNO", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      LOCKER_NO: LOCKER_NO,
      DISPLAY_LANGUAGE: i18n.resolvedLanguage,
      DOC_CD: DOC_CD,
    });

  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateLockerOperation = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  OPER_STATUS,
  WORKING_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKEROPERATION", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      OPER_STATUS: OPER_STATUS,
      WORKING_DATE: WORKING_DT,
      DISPLAY_LANGUAGE: i18n.resolvedLanguage,
    });

  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerTrnsReciept = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  WORKING_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKEROPERATIONRECEIPT", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      WORKING_DT: WORKING_DT,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerOperationReciept = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  WORKING_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKEROPERATIONRECEIPT", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      WORKING_DATE: WORKING_DT,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const saveLockerOperationEntry = async ({ ...reqpara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVELOCKEROPERATIONTRANSACTION", {
      ...reqpara,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCustomerLockerInfo = async ({ ...reqpara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKEROPERATIONLOG", {
      ...reqpara,
    });

  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map((items, index) => ({
        ...items,
        INDEX: index,
        _rowColor: items.LIMIT_EXCEED === "Y" ? "rgb(255, 0, 0)" : undefined,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLockerAccountType = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDDWACCTTYPE", {
      ...apiReq,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData) && responseData.length > 0) {
      const defaultAcType = responseData[0].ACCT_TYPE;

      responseData = responseData.map(
        ({ ACCT_TYPE, CONCDESCRIPTION, ...other }) => {
          return {
            value: ACCT_TYPE,
            label: CONCDESCRIPTION,
            defaultAcType,
            ...other,
          };
        }
      );
    }

    if (responseData && apiReq?.DOC_CD === "DIV") {
      responseData.sort((a, b) => {
        return parseInt(b.label) - parseInt(a.label);
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
