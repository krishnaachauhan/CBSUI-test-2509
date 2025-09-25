import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getActionTakenMasterGridData = async ({
  companyID,
  branchCode,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACTIONTAKENMSTDATADISP", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        LEGAL_PROCESS: item?.LEGAL_PROCESS === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSuitFldStdMstData = async (...reqData) => {
  reqData?.[1]?.handleButtonDisable(true);
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSUITFLDMSTDATADISP", {
      COMP_CD: reqData?.[3]?.companyID,
      BRANCH_CD: reqData?.[3]?.user?.branchCode,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DISPLAY_NM, SUIT_FILED_STATUS_CD, ...others }) => {
          return {
            ...others,
            value: SUIT_FILED_STATUS_CD,
            label: DISPLAY_NM,
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

export const actionTakenMasterDML = async (formdata: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOACTIONTAKENDML",
    formdata
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
