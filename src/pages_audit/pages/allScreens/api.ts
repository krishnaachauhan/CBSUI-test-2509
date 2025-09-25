import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const QuickAccessTableGridData = async ({
  COMP_CD,
  BASE_BRANCH_CD,
  GROUP_NAME,
  APP_TRAN_CD,
  FLAG,
  workingDate,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETQUICKACCESS", {
      COMP_CD: COMP_CD,
      BASE_BRANCH_CD: BASE_BRANCH_CD,
      ASON_DT: workingDate,
      GROUP_NAME: GROUP_NAME,
      FLAG: FLAG.toUpperCase(),
      APP_TRAN_CD: APP_TRAN_CD,
    });
  if (status === "0") {
    return data.map((item) => ({
      ...item,
      FAVOURITE: item?.FAVOURITE === "Y" ? true : false,
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const addToFavorite = async (payload: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "SAVEFVSCREENDATA",
    {
      ...(payload ?? {}),
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getrReportSqlQuery = async (payload: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETREPORTDETAIL", {
      ...(payload ?? {}),
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const generateReportMetadata = async (payload: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGENERATEREPORTMETADATA", {
      ...(payload ?? {}),
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const saveReportConfiguration = async (payload: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DYNAMICMETADADML", {
      ...(payload ?? {}),
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const verifyQueryData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOVERIFYQUERYPARAMETERSONLY", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const jrxmlDesignData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRPTTEMPLATEDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updateJrxmlDesignData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRPTTEMPLATEDETAILSDML", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
