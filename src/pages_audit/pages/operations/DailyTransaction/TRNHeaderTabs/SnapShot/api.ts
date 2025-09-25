import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getSnapShotList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSNAPSHOTDTLF1", { ...reqData });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDailyScrollRegister = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYSCROLLREGF1", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
