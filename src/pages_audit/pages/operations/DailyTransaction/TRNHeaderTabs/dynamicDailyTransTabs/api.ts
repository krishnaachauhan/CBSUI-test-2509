import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
import LoaderImg from "assets/loaders/Loader.gif";

export const getDynamicMetaData = async (tabName) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDAILYTRNTABMETADATA", {
      TAB_NAME: tabName,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getGridDataList = async ({
  tabName,
  apiEndPoint,
  reqData,
}: {
  tabName: string;
  apiEndPoint: string;
  reqData?: any;
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(apiEndPoint, reqData);
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
      item.sr = index + 1;
      if (tabName === "TODAYS") {
        item.ignoreValue = item?.STATUS !== "CONFIRMED";
      } else if (tabName === "HOLDCHRG") {
        item.PROCESS = LoaderImg;
        item.FLAG = "N";
      } else if (tabName === "DOCS") {
        item.TEMPLATE_DESCRIPTION =
          item?.TEMPLATE_CD + " - " + item?.DESCRIPTION;
      } else if (tabName === "SI") {
        item.DOC_STATUS = item?.DOC_STATUS === "Y";
      } else if (tabName === "LIEN") {
        item.ignoreValue = item?.LIEN_STATUS === "Expired";
      } else if (tabName === "LIMIT") {
        item.ignoreValue = item?.EXPIRED_FLAG !== "A";
      }
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
