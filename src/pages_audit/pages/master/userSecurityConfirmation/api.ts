import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getPendingSecurityUserData = async () => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERPENDINGUSERGRID", {});
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const confirmSecurityUserData = async ({ confirm, usera_name }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("CONFIRMUSERADATA", {
      CONFIRMED: confirm,
      USER_NAME: usera_name,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLoginShiftAccess = async ({ userid, comp_cd }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERLOGINSHIFTEXIST", {
      USER_NAME: userid,
      COMP_CD: comp_cd,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getBiometric = async ({ userid }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERBIODTL", {
      USER_NAME: userid,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
