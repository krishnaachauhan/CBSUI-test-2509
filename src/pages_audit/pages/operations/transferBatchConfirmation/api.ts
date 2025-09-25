import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getScrollListData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTRFSCROLLDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const ScrollDetailsData = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTRANSCROLLDETAIL", { ...req });
  if (status === "0") {
    const updatedata = data;
    updatedata.map((item) => {
      item.TRAN_TYPE =
        item.TYPE_CD?.trim() === "3"
          ? "Credit"
          : item.TYPE_CD?.trim() === "6"
          ? "Debit"
          : item?.TYPE_CD;
      return item;
    });
    return updatedata;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
