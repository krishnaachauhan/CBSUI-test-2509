import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getLangMessageHDR = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLANGMSGHDR", {});
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.DEFAULT_LANG_CODE === "en") {
        item.DEFAULT_LANG_CODE = "English";
      }
      if (item?.DEFAULT_LANG_CODE === "guj") {
        item.DEFAULT_LANG_CODE = "ગુજરાતી";
      }
      if (item?.DEFAULT_LANG_CODE === "spanish") {
        item.DEFAULT_LANG_CODE = "española";
      }
      if (item?.DEFAULT_LANG_CODE === "french") {
        item.DEFAULT_LANG_CODE = "Français";
      }
      if (item?.DEFAULT_LANG_CODE === "Indonesia") {
        item.DEFAULT_LANG_CODE = "Bahasa";
      }
      if (item?.DEFAULT_LANG_CODE === "Philippines") {
        item.DEFAULT_LANG_CODE = "Filipino";
      }
    });
    return dataStatus;
    // return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLangMessageDTL = async (transactionID, formMode) => {
  if (formMode === "new") {
    return [];
  } else {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETLANGMSGDTL", {
        TRAN_CD: transactionID + "",
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};
export const editLanguage = () => async (formData: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOLANGUAGECONFIG",
    // { formData, TRAN_CD: "48" }
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
