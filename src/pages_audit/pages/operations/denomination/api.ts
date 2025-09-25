import { format } from "date-fns";
import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const CashReceiptEntrysData = async ({
  COMP_CD,
  BRANCH_CD,
  USER_NAME,
  TRAN_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHDENO", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      USER_NAME: USER_NAME,
      TRAN_DT: TRAN_DT,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSDCList = async (...authDTL) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSDCLIST", {
      COMP_CD: authDTL[1]?.companyID
        ? authDTL[1]?.companyID
        : authDTL[3]?.companyID,
      BRANCH_CD: authDTL[1]?.user?.branchCode
        ? authDTL[1]?.user?.branchCode
        : authDTL[3]?.user?.branchCode,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISLAY_STANDARD, CODE, DESCRIPTION, CASH_RECEIPT_CD, ...other }) => {
          return {
            ...other,
            CODE: CODE,
            DISLAY_STANDARD: DISLAY_STANDARD,
            value: CODE,
            label: DISLAY_STANDARD,
            defRemark: DESCRIPTION,
            defSdc: CASH_RECEIPT_CD,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAcctDTL = async ({
  ACCT_CD,
  ACCT_TYPE,
  BRANCH_CD,
  COMP_CD,
  FULL_ACCT_NO,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTDATA", {
      ACCT_CD: ACCT_CD,
      ACCT_TYPE: ACCT_TYPE,
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
      FULL_ACCT_NO: FULL_ACCT_NO,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const cashReportData = async (reportID, filter, otherAPIRequestPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTODAYTRANDATA", otherAPIRequestPara);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getChqValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHEQUENOVALIDATION", {
      COMP_CD: reqData?.COMP_CD,
      BRANCH_CD: reqData?.BRANCH_CD,
      ACCT_TYPE: reqData?.ACCT_TYPE,
      ACCT_CD: reqData.ACCT_CD,
      CHEQUE_NO: reqData?.CHEQUE_NO,
      TYPE_CD: reqData?.TYPE_CD,
      SCREEN_REF: reqData?.SCREEN_REF,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveDenoData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVERECEIPTPAYMENTDTL", {
      SCREEN_REF: reqData?.SCREEN_REF ?? "",
      ENTRY_TYPE: reqData?.ENTRY_TYPE ?? "",
      TRANSACTION_DTL: {
        isNewRow: [...reqData?.TRN_DTL],
        isUpdatedRow: [],
        isDeleteRow: [],
      },
      CASH_DENOMINATION_DTL: {
        isNewRow: [...reqData?.DENO_DTL],
        isUpdatedRow: [],
        isDeleteRow: [],
      },
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

export const getChqDateValidation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECHQDATE", {
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
      TYPE_CD: reqData?.TYPE_CD ?? "",
      CHEQUE_NO: reqData?.CHEQUE_NO ?? "",
      CHEQUE_DT: format(new Date(reqData?.CHEQUE_DT), "dd/MMM/yyyy"),
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

interface reqObjTypes {
  reqData: any;
  controllerFinal?: any;
}

export const getTabsByParentType = async (reqObj: reqObjTypes) => {
  const { reqData, controllerFinal } = reqObj;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "GETDLYTRNTABFIELDDISP",
      {
        COMP_CD: reqData?.COMP_CD,
        ACCT_TYPE: reqData?.ACCT_TYPE,
        BRANCH_CD: reqData?.BRANCH_CD,
      },
      {},
      null,
      controllerFinal
    );

  if (status === "0") {
    data?.map((a, i) => {
      a.index1 = i;
    });

    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCarousalCards = async (reqObj: reqObjTypes) => {
  const { reqData, controllerFinal } = reqObj;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DAILYTRNCARDDTL",
      {
        PARENT_TYPE: reqData?.PARENT_TYPE,
        COMP_CD: reqData?.COMP_CD,
        ACCT_TYPE: reqData?.ACCT_TYPE,
        ACCT_CD: reqData?.ACCT_CD,
        BRANCH_CD: reqData?.BRANCH_CD,
      },
      {},
      null,
      controllerFinal
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTRXList = async (reqData, formState) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTRXLIST", {
      USER_NAME: reqData?.USER_ID ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      const shouldFilter = formState?.docCD === "TRN/041";

      responseData = responseData
        .filter(
          (row) => !shouldFilter || row?.CODE === "1" || row?.CODE === "4"
        )
        .map((row) => ({
          value: row?.CODE,
          code: row?.CODE,
          label: `${row?.CODE}-${row?.DESCRIPTION}`,
          actLabel: row?.DESCRIPTION,
          info: row,
        }));
    }

    return responseData;
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
export const getParameters = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNPARAMF1", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
