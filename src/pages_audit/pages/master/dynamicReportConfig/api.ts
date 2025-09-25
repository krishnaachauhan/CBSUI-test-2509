import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getDynamicReportConfigGridData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNRPTCONFIGGRIDDATA", {});
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const dynamicRptConfigDML = () => async (formData: any, formMode) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DYNAMICREPORTCONFIGDML",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynamicReportConfigData = async (
  transactionID: number,
  formMode: string
) => {
  if (formMode === "add") {
    return [];
  }
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNRPTCONFIGDATA", {
      TRAN_CD: transactionID + "",
    });
  if (status === "0") {
    // return data;
    return data.map((item) => {
      return {
        ...item,
        ACTIVE: item.ACTIVE === "Y" ? true : false,
        DISABLE_GROUP_BY: item.DISABLE_GROUP_BY === "Y" ? true : false,
        HIDE_AMOUNT_IN: item.HIDE_AMOUNT_IN === "Y" ? true : false,
        HIDE_FOOTER: item.HIDE_FOOTER === "Y" ? true : false,
        DETAILS: item?.DETAILS.map((item2) => {
          return {
            ...item2,
            NEW_SR_CD: item2?.SR_CD ?? 0,
          };
        }),
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const verifyDynRptSqlSyntax = async ({ sqlSyntax, detailsData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VERIFYDYNREPORTQUERY", {
      SQL_SYNTAX: sqlSyntax,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDynReportAccessRightsGridData = async (tranCode, userName) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNRPTACCESSRIGHTSGRID", {
      TRAN_CD: tranCode,
      USER_NAME: userName,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updateUserAccessData = async ({ reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DYNRPTRIGHTSDTLDML",
    { ...reqdata }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
