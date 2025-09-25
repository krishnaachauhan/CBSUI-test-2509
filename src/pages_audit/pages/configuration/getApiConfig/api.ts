import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getDynamicApiList = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNAPILIST", {});
  if (status === "0") {
    let responseData;
    if (Array.isArray(data) && data?.length > 0) {
      responseData = data.map((item) => {
        return {
          ...item,
          DISP_IS_COMPRESSED:
            item?.IS_COMPRESSED === "Y"
              ? "Yes"
              : item?.IS_COMPRESSED === "N"
              ? "No"
              : item?.IS_COMPRESSED,
          DISP_PAGINATION:
            item?.PAGINATION === "Y"
              ? "Yes"
              : item?.PAGINATION === "N"
              ? "No"
              : item?.PAGINATION,
          DISP_CACHING:
            item?.CACHING === "Y"
              ? "Yes"
              : item?.CACHING === "N"
              ? "No"
              : item?.CACHING,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const savedynamicAPIconfig = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOAPICONFIGDATA", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const flushRediskey = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("FLUSHALLREDISKEYS", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const checkRediskeyTtl = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKREDISKEYSANDTTL", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
