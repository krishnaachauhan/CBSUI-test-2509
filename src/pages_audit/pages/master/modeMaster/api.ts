import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getModeMasterData = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMODEMSTDATADISP", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const deleteModeMasterData = async (data) => {
  const { status, message } = await AuthSDK.internalFetcher(
    "MODEMASTERDML",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message);
  }
};

export const updateModeMasterData = async ({ data: reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "MODEMASTERDML",
    {
      ...reqdata,
      ALERT_TYPE: "E",
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
