import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getInstallmentPeriodData = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPERIODMSTDATADISP", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const deleteInstallmentPeriodData = async (data) => {
  const { status, message } = await AuthSDK.internalFetcher(
    "DOACCOUNTPERIODMST",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message);
  }
};

export const updateInstallmentPeriodData = async ({ data: reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOACCOUNTPERIODMST",
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
