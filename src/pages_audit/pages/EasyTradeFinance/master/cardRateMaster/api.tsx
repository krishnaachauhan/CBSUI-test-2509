import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

// export const getBussinessDate = async ({ SCREEN_REF }) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("GETBUSINESSDATE", {
//       SCREEN_REF: SCREEN_REF,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

export const cardrateConfigDML = async (formData) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOCARDRATEMST",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCurrencyList = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCURRENCYDDW", { ...Apireq });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((row) => {
        return {
          value: row.CURRENCY_CODE,
          label: row?.CURRENCY_CODE,
          actLabel: row.CURRENCY_CODE,
          info: row,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRetrievalCardRateData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETCARDRATEDTL`, { ...Apireq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCardRateDtl = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCARDRATEDTL", formData);
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        CONFIRMED_FLAG: item.CONFIRMED === "Y" ? "Confirmed" : "Pending",
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCardRateCalculation = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETCARDRATECAL`, { ...Apireq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
