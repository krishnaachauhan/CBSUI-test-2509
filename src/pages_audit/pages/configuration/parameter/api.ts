import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject } from "@acuteinfo/common-base";

export const getParametersGridData = async ({
  para_type,
  comp_cd,
  branch_cd,
  conf_type,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSYSPARAMSTDISP", {
      PARA_TYPE: para_type,
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
      CONF_PARA: conf_type,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.CONFIRMED_STATUS === "Pending") {
        item._rowColor = "rgb(152 59 70 / 61%)";
      }
    });
    return dataStatus;
    // return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getParaAuditHistory = async ({ para_cd, comp_cd, branch_cd }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSYSPARAAUDBTN", {
      PARA_CD: para_cd,
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
