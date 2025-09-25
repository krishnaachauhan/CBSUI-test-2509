import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const retrivalListData = async (reqPara) => {
  try {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(reqPara?.API_URL, {
        ...reqPara,
      });

    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map((item) => {
          const DISPLAY_VALUE = item[`${reqPara?.DISPLAY_VALUE}`] || "";
          const DATA_VALUE = item[`${reqPara?.DATA_VALUE}`];
          return {
            ...item,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        });
      }

      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } catch (error) {
    console.error("Error occurred while fetching data:", error);
    throw error;
  }
};
