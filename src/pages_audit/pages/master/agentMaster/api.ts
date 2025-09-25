import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAgentMasterGirdData = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAGENTMSTRETRIVE", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPMISCData = async (...reqData) => {
  reqData?.[1]?.handleButtonDisable(true);
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", {
      CATEGORY_CD: "AGENT_GROUP",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...others }) => {
          return {
            ...others,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        }
      );
    }
    reqData?.[1]?.handleButtonDisable(false);
    return responseData;
  } else {
    reqData?.[1]?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAgentMstConfigDDW = async (...reqData) => {
  reqData?.[1]?.handleButtonDisable(true);
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.baseBranchCode ?? "",
      CODE: "OTH",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ TRAN_CD, DESCRIPTION, ...others }) => {
          return {
            ...others,
            value: TRAN_CD,
            label: DESCRIPTION,
          };
        }
      );
    }
    reqData?.[1]?.handleButtonDisable(false);
    return responseData;
  } else {
    reqData?.[1]?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAgentMstConfigPigmyDDW = async (...reqData) => {
  reqData?.[1]?.handleButtonDisable(true);
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAGENTMSTCONFIGPIGMYDDW", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.baseBranchCode ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DESCRIPTION, TRAN_CD, ...others }) => {
          return {
            ...others,
            value: TRAN_CD,
            label: DESCRIPTION,
          };
        }
      );
    }
    reqData?.[1]?.handleButtonDisable(false);
    return responseData;
  } else {
    reqData?.[1]?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const agentMasterDML = async (formData: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "AGENTMASTERDML",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
