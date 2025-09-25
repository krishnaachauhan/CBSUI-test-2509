import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const lienCodeDropdown = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIENCODEDDW", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISPLAY_NM, LEAN_CD, ...other }) => {
        return {
          value: LEAN_CD,
          label: DISPLAY_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const reasonDropdown = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIENLIENREASONDDW", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISPLAY_NM, REASON_CD, ...other }) => {
        return {
          value: REASON_CD,
          label: DISPLAY_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const lienGridDetail = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIENGRIDDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;

    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.LIEN_STATUS === "A") {
        item.LIEN_STATUS_DISPLAY = "Active";
      } else {
        item.LIEN_STATUS_DISPLAY = "Expired";
        item._rowColor = "var(--theme-color7)";
        item.ignoreValue = true;
      }
      if (item?.CONFIRMED === "Y") {
        item.DISPLAY_CONFIRMED = "Confirmed";
      } else {
        item.DISPLAY_CONFIRMED = "Pending";
      }

      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudLien = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOLIENDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateInsert = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELIENDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const lienConfirmation = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOLIENCONFIRMATION", { ...apireq });
  if (status === "99") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
