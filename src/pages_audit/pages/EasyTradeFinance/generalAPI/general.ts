import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import { AuthSDK } from "./../../../../registry/fns/auth";
import { format, isValid } from "date-fns";

const GeneralAPISDK = () => {
  const setDocumentName = (text) => {
    let titleText = document.title;
    document.title = titleText.split(" - ")[0] + " - " + text;
  };

  const getCurrencyList = async (Apireq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCURRENCYDDW", { ...Apireq });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map((row) => {
          return {
            value: row.CURRENCY_CODE,
            label: row?.CURRENCY_CODE,
            ...row,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const GetFPMiscValue = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETFPMISCVALUE", { ...ReqData });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map((row) => {
          return {
            label: row?.DISPLAY_VALUE,
            value: row.DATA_VALUE,
            ...row,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const GetFMiscList = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETFMISCLIST", { ...ReqData });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map((row) => {
          return {
            value: row.DATA_VALUE,
            label: row?.DISPLAY_VALUE,
            ...row,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getCustACCTList = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCUSTACCTLIST", { ...ReqData });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getCCYRate = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCCYRATE", { ...ReqData });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  return {
    setDocumentName,
    getCurrencyList,
    GetFPMiscValue,
    GetFMiscList,
    getCustACCTList,
    getCCYRate,
  };
};
export const ETFGeneralAPI = GeneralAPISDK();
