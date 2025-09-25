import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
//API
export const getDayendprocessFlag = async ({
  ENT_COMP_CD,
  ENT_BRANCH_CD,
  BASE_COMP_CD,
  BASE_BRANCH_CD,
  A_GD_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEODHANDOVER", {
      ENT_COMP_CD: ENT_COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
      BASE_COMP_CD: BASE_COMP_CD,
      BASE_BRANCH_CD: BASE_BRANCH_CD,
      A_GD_DATE: A_GD_DATE,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getpendingtrnReport = async ({
  COMP_CD,
  BRANCH_CD,
  TRAN_DT,
  VERSION,
  DOCU_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAYENDPENDINGTRNERRLOG", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      TRAN_DT: TRAN_DT,
      VERSION: VERSION,
      DOCU_CD: DOCU_CD,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ...items }) => {
        return {
          ...items,

          ACCT_CD_DISP: `${items?.BRANCH_CD}${items?.ACCT_TYPE} ${items?.ACCT_CD}`,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getPendingTrns = async ({
  COMP_CD,
  BRANCH_CD,
  BASE_BRANCH,
  TRAN_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("PENDINGTRANSACTION", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      BASE_BRANCH: BASE_BRANCH,
      TRAN_DT: TRAN_DT,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDocUrl = async ({ BASE_COMP, BASE_BRANCH, DOC_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTBGDOCURL", {
      BASE_COMP: BASE_COMP,
      BASE_BRANCH: BASE_BRANCH,
      DOC_CD: DOC_CD,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getVerifyDayEndCheksumsData = async ({
  COMP_CD,
  BASE_BRANCH_CD,
  ARG,
  CHKSM_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAYENDVERIFYBTN", {
      COMP_CD,
      BASE_BRANCH_CD,
      ARG,
      CHKSM_TYPE,
    });

  if (status === "0") {
    return data.map((item) => ({
      ...item,
      _rowColor:
        item.CLR === "P"
          ? "rgb(40, 180, 99)"
          : item.CLR === "Y"
          ? "rgb(130, 224, 170)"
          : item.CLR === "W"
          ? "rgb(244, 208, 63)"
          : item.CLR === "E"
          ? "rgb(241, 148, 138)"
          : "",
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDayEnderrLog = async ({
  COMP_CD,
  BRANCH_CD,
  TRAN_DT,
  VERSION,
  SR_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAYENDERRLOG", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      TRAN_DT: TRAN_DT,
      VERSION: VERSION,
      SR_CD: SR_CD,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getValidateEod = async ({ SCREEN_REF, FLAG }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEEOD", {
      SCREEN_REF,
      FLAG,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCheckSums = async ({
  SCREEN_REF,
  FLAG,
  EOD_EOS_FLG,
  FOR_BRANCH,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHECKSUM", {
      SCREEN_REF: SCREEN_REF,
      FLAG: FLAG,
      FOR_BRANCH: FOR_BRANCH,
      EOD_EOS_FLG: EOD_EOS_FLG,
    });

  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status, message };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const executeChecksums = async ({
  SCREEN_REF,
  FOR_BRANCH,
  EOD_EOS_FLG,
  CHKSM_TYPE,
  SR_CD,
  MENDETORY,
  EOD_VER_ID,
  FLAG,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("EXECUTECHECKSUM", {
      FLAG: FLAG,
      SCREEN_REF: SCREEN_REF,
      FOR_BRANCH: FOR_BRANCH,
      EOD_EOS_FLG: EOD_EOS_FLG,
      CHKSM_TYPE: CHKSM_TYPE,
      SR_CD: SR_CD,
      MENDETORY: MENDETORY,
      EOD_VER_ID: EOD_VER_ID,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSessionDtl = async ({
  COMP_CD,
  BRANCH_CD,
  BASE_BRANCH_CD,
  BASE_COMP_CD,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSESSIONDTL", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      BASE_BRANCH_CD: BASE_BRANCH_CD,
      BASE_COMP_CD: BASE_COMP_CD,
      WORKING_DATE: WORKING_DATE,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updateEodRunningStatus = async ({ COMP_CD, BRANCH_CD, FLAG }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("UPDEODRUNNINGSTATUS", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      FLAG: FLAG,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const doEod = async ({ FLAG, SCREEN_REF, NPA_CALC, NEW_SESSION }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOEOD", {
      FLAG: FLAG,
      SCREEN_REF: SCREEN_REF,
      NPA_CALC: NPA_CALC,
      NEW_SESSION: NEW_SESSION,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
