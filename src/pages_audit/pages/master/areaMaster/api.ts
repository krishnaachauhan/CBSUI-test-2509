import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAreaMasterData = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAREAMSTRETRIVEGRID", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        ACTIVE_FLAG: item.ACTIVE_FLAG === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const GETAREAMSTCITYDDW = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAREAMSTCITYDDW", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.branchCode ?? "",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CITY_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          value: CITY_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const GETAREAMSTPARENTDDW = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAREAMSTPARENTDDW", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.branchCode ?? "",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ P_AREA_CD, P_AREA_NM, ...other }) => {
        return {
          ...other,
          value: P_AREA_CD,
          label: P_AREA_CD + P_AREA_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateAreaMasterData = async ({ data: reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOAREAMST",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const deleteAreaMasterData = async (data) => {
  const { status, message } = await AuthSDK.internalFetcher("DOAREAMST", data);
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message);
  }
};

export const GETMISCTABLECONFIG = async (TABLE_NM) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMISCTABLECONFIG", {
      TABLE_NM: TABLE_NM,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ FLAG, USER_LEVEL, ...other }) => {
        return {
          ...other,
          FLAG,
          USER_LEVEL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
