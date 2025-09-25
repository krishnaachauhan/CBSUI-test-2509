import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
import LoaderImg from "../DailyTransaction/TRNHeaderTabs/HoldCharge/Loader.gif";

export const getAccountCloseList = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTTOBECLOSED", reqData);
  if (status === "0") {
    let responseData = data?.map((item, index) => {
      return {
        ...item,
        INDEX: index,
        _isReadOnly: item?.DISABLE_STATUS === "Y",
        PROCESS: LoaderImg,
        FLAG: "N",
      };
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const multipleAccountClose = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCLOSEACCT", reqData);
  if (status) {
    return { status, message, messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const multipleAccountCloseValidation = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCOUNTTOCLOSE", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
