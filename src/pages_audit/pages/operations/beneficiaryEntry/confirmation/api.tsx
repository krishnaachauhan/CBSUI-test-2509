import {
  AddIDinResponseData,
  DefaultErrorObject,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getBenficiaryAccountGridDtlData = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSBNFCRYDTL", {
      ...ApiReq,
    });
  if (status === "0") {
    return data.map((a, i) => {
      a.index = i;
      return a;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getIfscBenDetail = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRTGSIFSCDTL", {
      ...ApiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const doConfirmBenAccount = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCONFIRMBENEFICIARYACCOUNT", {
      ...ApiReq,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
