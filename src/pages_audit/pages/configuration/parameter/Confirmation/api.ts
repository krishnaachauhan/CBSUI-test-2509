import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject } from "@acuteinfo/common-base";

export const getParameterConfirm = async ({ comp_cd, branch_cd }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSYSPARAMSTCNF", {
      A_COMP_CD: comp_cd,
      A_BRANCH_CD: branch_cd,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const confirmStatus = async ({
  comp_cd,
  branch_cd,
  remarks,
  para_cd,
  confirmed,
}) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "PARAMSTCONFIRM",
    {
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
      REMARKS: remarks,
      PARA_CD: para_cd,
      CONFIRMED: confirmed,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
