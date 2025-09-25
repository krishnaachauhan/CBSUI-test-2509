import { DefaultErrorObject } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getDynamicBoxData = async (
  apiName,
  { COMP_CD, BRANCH_CD, USER_ID }
) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`/enfinityCommonServiceAPI/${apiName}`, {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      USER_ID: USER_ID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAccountStatusData = async ({ ...apiReq }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCOUNTSTATUS", { ...apiReq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDashboardMessageBoxData = async ({
  screenFlag,
  userID,
  transactionID,
}: any) => {
  let apiURL;
  let apiReq = {};
  if (screenFlag === "Announcement") {
    apiURL = "GETANNOUNCEMENT";
    apiReq = {
      USER_NAME: userID,
      // USER_NAME: "ajayj",
      // USER_NAME: userID,
      // USER_NAME: "ajayj",
    };
  } else if (screenFlag === "Tips") {
    apiURL = "GETTIPSDETAILS";
    apiReq = {
      USER_NAME: userID,
      TRAN_CD: transactionID,
      // USER_NAME: "anilt",
    };
    // } else if (screenFlag === "Notes") {
    //   apiReq = {
    //     USER_NAME: userID,
    //     // USER_NAME: "brij001",
    //   };
    //   apiURL = "GETNOTESDETAILSELECT";
    // }
  } else if (screenFlag === "Alert") {
    apiURL = "GETALERTDTL";
    apiReq = {
      USER_NAME: userID,
      // APP_TRAN_CD: "1",
    };
  }
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(apiURL, apiReq);
  if (status === "0") {
    return data;
    // let responseData = data;
    // if (Array.isArray(responseData)) {
    //   responseData = responseData.map(({ TRAN_CD, DESCRIPTION }) => {
    //     return {
    //       transactionID: TRAN_CD,
    //       label: DESCRIPTION,
    //     };
    //   });
    // }
    // return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNoteCountData = async ({ COMP_CD, userID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUSERNOTECNT", {
      USER_NAME: userID,
      COMP_CD: COMP_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAnnouncementListData = async ({ transactionID, userID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETECIRCULARDETAIL", {
      USER_NAME: userID,
      TRAN_CD: transactionID,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        IS_VIEW_NEXT: item.IS_VIEW_NEXT === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updateAnnouncementDetailsData = async (data) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOANNOUNCEMENT",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNoteDetailsData = async ({ userID, flag }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUSERNOTEDTL", {
      USER_ID: userID,
      FLAG: flag,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateNoteDetailsData = async ({ data }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOTNOTESDML",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const updateTipsDetailsData = async (data) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOTIPS",
    data
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
