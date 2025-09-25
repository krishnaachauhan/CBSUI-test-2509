import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getBankimgAndProfileimgs = async ({ userID, companyID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("BANKPROFILEPICK", {
      COMP_CD: companyID,
      // COMP_CD: "132 ",
      APP_TRAN_CD: "51",
      USER_ID: userID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
