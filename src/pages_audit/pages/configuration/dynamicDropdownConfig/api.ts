import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useContext } from "react";
import { GeneralAPI } from "registry/fns/functions";

export const getDynApiListData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETDYNAPILIST`, {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ACTION }) => {
        return {
          value: ACTION,
          label: ACTION,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynamicDropdownGridData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDROPDOWNCONFIG", {});
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const dynamiDropdownConfigDML = async (formData: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DODROPDOWNDML",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
