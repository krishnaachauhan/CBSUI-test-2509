import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const parametersListDD = async (PARENT_TYPE) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTODPARA", {
      PARENT_TYPE: PARENT_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_NM, DATA_VALUE, ...other }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_NM,
            ...other,
          };
        }
      );
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const documentsListDD = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTDOCUMENT", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, SR_CD, ...other }) => {
        return {
          value: SR_CD,
          label: DESCRIPTION,
          ...other,
        };
      });
      responseData.sort((a, b) => a.label.localeCompare(b.label));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const temporaryODdetails = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTODDATA", {
      ...Apireq,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      item.CONFIRMED = item?.CONFIRMED === "Y" ? "Yes" : "No";
      item.FLAG = item?.FLAG === "Y" ? "Yes" : "No";
      if (item?.FORCE_EXP_DT !== "") {
        item._rowColor = "var(--theme-color6)";
      }
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudTemoraryOD = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOTEMPODDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateTempOD = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATETEMPODDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const tempODConfirmation = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOTEMPODCONFIRMATION", { ...apireq });
  if (status === "99") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
