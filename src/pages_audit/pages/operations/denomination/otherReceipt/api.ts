import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getOtherReceipt = async ({ COMP_CD, BRANCH_CD, WORKING_DATE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETOTHERCASHRECEIPT", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      WORKING_DATE: WORKING_DATE,
    });
  if (status === "0") {
    return data?.map((res) => ({ ...res, CHQ_BX_FLAG: "N" }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
