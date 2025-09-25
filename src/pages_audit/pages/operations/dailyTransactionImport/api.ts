import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getDailyImportConfigData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAILYIMPDDDW", { ...reqData });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, TRAN_CD, ...other }) => {
        return {
          value: TRAN_CD,
          label: DESCRIPTION,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDailyTransactionImportData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      "DODAILYTRNIMPORT",
      {
        ...apiReq,
      },
      {},
      600000
    );
  if (status === "0") {
    // return data;
    let responseData = data;
    responseData.map((item, i) => {
      item.index = i;
      item.DEBIT_AC = [
        item.FROM_BRANCH_CD,
        item.FROM_ACCT_TYPE,
        item.FROM_ACCT_CD,
      ]
        .filter(Boolean)
        .join("-");
      item.CREDIT_AC = [item.TO_BRANCH_CD, item.TO_ACCT_TYPE, item.TO_ACCT_CD]
        .filter(Boolean)
        .join("-");

      return item;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getValidateToSelectFile = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATETOSELECTFILE", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const deleteImportedData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DELETEIMPORTEDDATA", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const dailyTranimportFileData = async ({ ...reqData }) => {
  try {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(
        "IMPORTFILEDATA",
        {
          ...reqData,
        },
        {},
        600000
      );
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
export const getDailyTranStatus = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETERRSTATUSDDDW", {});
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
