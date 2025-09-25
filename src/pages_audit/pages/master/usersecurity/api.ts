import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getSecurityUserGrid = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECMSTRETRIVE", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const saveuserdata = async ({
  onboard,
  applicationdata,
  branchdata,
  productdata,
  loginshiftdata,
  biometricdata,
}) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "USERACCESSDATADML",
    {
      IsNewRow: true,
      USER_DTL: onboard,
      APPLICATION_ACCESS_DTL: { DETAILS_DATA: applicationdata },
      BRANCH_TYPE_ACCESS_DTL: { DETAILS_DATA: branchdata },
      ACCT_TYPE_ACCESS_DTL: { DETAILS_DATA: productdata },
      USER_SHIFT_DTL: loginshiftdata,
      BIOMETRIC_DATA_DTL: { DETAILS_DATA: biometricdata },
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const UpdateDMLData = async ({
  onboard,
  applicationdata,
  branchdata,
  productdata,
  loginshiftdata,
  biometricdata,
}) => {
  const grids = [
    onboard,
    applicationdata,
    branchdata,
    productdata,
    loginshiftdata,
    biometricdata,
  ];
  const requestData = {};

  grids.forEach((grid, index) => {
    const gridKey = [
      "USER_DTL",
      "APPLICATION_ACCESS_DTL",
      "BRANCH_TYPE_ACCESS_DTL",
      "ACCT_TYPE_ACCESS_DTL",
      "USER_SHIFT_DTL",
      "BIOMETRIC_DATA_DTL",
    ][index];
    const gridConditions = [
      "isNewRow",
      "isDeleteRow",
      "isUpdatedRow",
      "_UPDATEDCOLUMNS",
    ];

    if (gridConditions.some((condition) => grid?.[condition]?.length > 0)) {
      if (gridKey === "USER_DTL") {
        requestData[gridKey] = grid;
      } else {
        requestData[gridKey] = { DETAILS_DATA: grid };
      }
    }
  });
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "USERACCESSDATADML",
    {
      IsNewRow: false,
      ...requestData,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAduserParavalue = async ({ comp_cd, branch_cd }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERPARAS", {
      COMP_CD: comp_cd,
      BRANCH_CD: branch_cd,
    });
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

export const updateDetailsUserData = async ({ comp_cd, usera_name }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERAUDITDETAIL", {
      COMP_CD: comp_cd,
      USERNAME: usera_name,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
