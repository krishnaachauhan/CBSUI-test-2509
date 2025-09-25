import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getReportBlobdata = async ({ ...apiReqPara }) => {
  // console.log("<<<apireqpara", apiReqPara);
  let otherReqPara = apiReqPara?.OTHER_REQ_PARA;
  let parameters = {};
  if (
    otherReqPara?.SCREEN_REF === "RPT/1645" ||
    otherReqPara?.SCREEN_REF === "RPT/1647"
  ) {
    parameters = {
      BRANCH_CD: otherReqPara.BRANCH_CD,
      USERNAME: otherReqPara.USERNAME,
      LANG: otherReqPara.LANG,
    };
  } else if (otherReqPara?.SCREEN_REF === "RPT/1408") {
    parameters = {
      USERNAME: otherReqPara.USERNAME,
      LANG: otherReqPara.LANG,
    };
  } else if (otherReqPara?.SCREEN_REF === "RPT/1364") {
    parameters = {
      A_DTL_SUM: apiReqPara?.REQ_PARA?.DTL_SUM,
      A_FLAG: apiReqPara?.REQ_PARA?.FLAG,
    };
  } else if (otherReqPara?.SCREEN_REF === "RPT/1640") {
    parameters = {
      BRANCH_CD: otherReqPara.BRANCH_CD,
      USERNAME: otherReqPara.USERNAME,
      LANG: otherReqPara.LANG,
    };
  } else if (otherReqPara?.SCREEN_REF === "RPT/488") {
    parameters = {
      USERNAME: otherReqPara.USERNAME,
    };
  }

  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETREPORT", {
      SCREEN_REF: otherReqPara?.SCREEN_REF,
      COMP_CD: otherReqPara.COMP_CD,
      ...parameters,
      ...apiReqPara?.REQ_PARA,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDefaultValue = async ({ API_URL, ...apireq }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(API_URL, { ...apireq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRptData1364 = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRPT1364", { ...reqPara });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const bottomGridData = async (req) => {
  let { API_URL, ...otherReq } = req;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(API_URL, { ...otherReq });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      item.DISP_MSG_FLOW =
        item?.MSG_FLOW === "O"
          ? "OUTFLOW MESSAGE"
          : item?.MSG_FLOW === "I"
          ? "INFLOW MESSAGE"
          : item?.MSG_FLOW === "R"
          ? "RETURN MESSAGE"
          : item?.PERIOD_CD;
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const topGridData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(reqData?.API_URL, {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const filterData = (rows, filterValue, columnName) => {
  const inputValue = filterValue
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== ""); // Remove empty strings

  return rows.filter((row) => {
    const rowValue = row.values[columnName];
    return inputValue.some((item) => {
      return rowValue.toLowerCase().startsWith(item.toLowerCase());
    });
  });
};

export const getDynMetadata = async (docCode) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTATICMETADA", {
      DOC_CD: docCode.trim(),
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
