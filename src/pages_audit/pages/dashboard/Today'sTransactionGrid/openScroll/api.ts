import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject } from "@acuteinfo/common-base";

export const ScrollDetailData = async (
  reportID,
  filter,
  otherAPIRequestPara
) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTRANSCROLLDETAIL", otherAPIRequestPara);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
