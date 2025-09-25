import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getLockerSizeList = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERSIZELIST", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ SIZE_CD, SIZE_NM, ...other }) => {
        return {
          value: SIZE_CD,
          label: `${SIZE_CD} ${SIZE_NM}`,
          sizeNm: SIZE_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getLockerWaitingList = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERWAITINGLIST", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getLockerAvailibility = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOCKERAVAILIBILITY", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data.map((d: any) => ({
      ...d,
      AVAILABLE:
        d.AVAILABLE?.toString().trim().toUpperCase() === "Y" ? true : false,
    }));
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateLockerAllocation = async (apiReq: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKERALLOCATION", {
      ...apiReq,
    });

  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
