import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getPriorityMainMasterData = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPRIORITYMSTDATADISP", {
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

export const getParentPriority = async (...reqdata) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPRIORITYMSTPARENTGRPDDW", {
      COMP_CD: reqdata?.[3]?.companyID,
      BRANCH_CD: reqdata?.[3]?.user?.branchCode,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ PRIORITY_CD, PRIORITY_NM, ...OTHER }) => {
          return {
            ...OTHER,
            value: PRIORITY_CD.trim(),
            label: PRIORITY_CD + PRIORITY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSubPriority = async (...reqdata) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPRIORITYMSTSUBPRIOGRPDDW", {
      COMP_CD: reqdata?.[3]?.companyID,
      BRANCH_CD: reqdata?.[3]?.user?.branchCode,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ SUB_PRIORITY_CD, DESCRIPTION, ...OTHER }) => {
          return {
            ...OTHER,
            value: SUB_PRIORITY_CD,
            label: SUB_PRIORITY_CD + "    " + DESCRIPTION,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updatePriorityMasterMainData = async ({ data: reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "PRIORITYMASTERMAINDML",
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

export const deletePriorityMasterMainData = async (data) => {
  const { status, message } = await AuthSDK.internalFetcher(
    "PRIORITYMASTERMAINDML",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message);
  }
};
