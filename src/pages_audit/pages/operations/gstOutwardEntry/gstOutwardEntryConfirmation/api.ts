import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getGstOutwardConfirmationRetrive = async ({
  comp_cd,
  branch_cd,
  flag,
  gd_date,
  user_level,
  user_name,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTENTHDRGRID", {
      ENT_COMP_CD: comp_cd,
      ENT_BRANCH_CD: branch_cd,
      FLAG: flag,
      GD_DATE: gd_date,
      USER_LEVEL: user_level,
      A_USER: user_name,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGstOutwardHeaderRetrive = async ({
  comp_cd,
  branch_cd,
  flag,
  gd_date,
  user_level,
  user_name,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTENTHDRGRID", {
      ENT_COMP_CD: comp_cd,
      ENT_BRANCH_CD: branch_cd,
      FLAG: flag,
      GD_DATE: gd_date,
      USER_LEVEL: user_level,
      A_USER: user_name,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.CONFIRMED === "N") {
        item._rowColor = "rgb(152 59 70 / 61%)";
      }
    });
    return dataStatus;
    // return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getVoucherDetail = async ({
  ENT_COMP_CD,
  ENT_BRANCH_CD,
  GD_DATE,
  TRAN_CD,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGSTOUTVIEWVOUCHER", {
      ENT_COMP_CD: ENT_COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
      GD_DATE: GD_DATE,
      TRAN_CD: TRAN_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
