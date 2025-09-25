import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getCourtMasterGridData = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOURTMSTGRID", {
      COMP_CD: reqData?.companyID,
      BRANCH_CD: reqData?.branchCode,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCourtMasterArea = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAREADDW", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.branchCode ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ AREA_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          value: AREA_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateCourtMasterData = async (data: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOCOURTMST",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
