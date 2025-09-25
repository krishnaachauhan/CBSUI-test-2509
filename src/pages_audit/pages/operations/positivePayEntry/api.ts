import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getPositivePayGridData = async ({
  FLAG,
  ENT_COMP_CD,
  ENT_BRANCH_CD,
  FROM_DATE,
  TO_DATE,
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPOSITIVEPAYGRID", {
      FLAG: FLAG,
      ENT_COMP_CD: ENT_COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
      FROM_DATE: FROM_DATE,
      TO_DATE: TO_DATE,
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPMISCData = async (CATEGORY_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", {
      CATEGORY_CD: CATEGORY_CD,
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

export const validatePositivePayEntryDetail = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEPOSITIVEPAY", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const positivePayEntryDML = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("POSITIVEPAYENTRYDML", formData);
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPositivePayCnfDtl = async ({
  enterCompanyID,
  enterBranchCode,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPOSITIVEPAYCNF", {
      ENT_COMP_CD: enterCompanyID,
      ENT_BRANCH_CD: enterBranchCode,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const positivePayConfirmation = async (formData) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "POSITIVEPAYENTRYCONFIRMATION",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const GetPositivePayImportDdwn = async (...reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBANKIFSCIMPORTDDDW", {
      COMP_CD: reqData?.[0]?.COMP_CD,
      BRANCH_CD: reqData?.[0]?.BRANCH_CD,
      TABLE_NM: "RBI_POSITIVE_PAY_DATA",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, FILE_FORMAT, TRAN_CD, ...other }) => {
          return {
            ...other,
            value: `${FILE_FORMAT},${TRAN_CD}`,
            label: DESCRIPTION,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const importFileData = async ({ ...reqData }) => {
  try {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("IMPORTFILEDATA", {
        ...reqData,
      });
    if (status === "0") {
      const dataStatus = data;
      if (Boolean(dataStatus?.[0]?.PPS_DATA)) {
        dataStatus?.[0]?.PPS_DATA.map((item) => {
          if (item?.ERROR_FLAG === "Y") {
            item._rowColor = "red";
          }
        });
      }
      return dataStatus;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } catch (error) {
    throw error;
  }
};

export const getChequeImageData = async ({
  ENT_COMP_CD,
  ENT_BRANCH_CD,
  TRAN_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPOSITIVEPAYCHQIMG", {
      ENT_COMP_CD: ENT_COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
      TRAN_CD: TRAN_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
