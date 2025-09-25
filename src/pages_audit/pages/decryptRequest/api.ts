import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const generateDecryptedReq = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDECRYPTEDRESPONSE", {
      ...reqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
