import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getCustSignPhoto = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTSIGNPHOTOCONFIMG", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const confirmationPhotoSignature = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("PHOTOSIGNATURESCANNINGCONFIRMATION", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
