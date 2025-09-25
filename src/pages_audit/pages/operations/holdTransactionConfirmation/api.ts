import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getHoldTrnsData = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETHOLDTRNCONFGRID", {
      A_COMP_CD: COMP_CD,
      A_BRANCH_CD: BRANCH_CD,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ...items }) => {
        return {
          ...items,

          ACCT_CD_NM: `${items?.BRANCH_CD} ${items?.ACCT_TYPE} ${items?.ACCT_CD} ${items?.ACCT_NM}`,
          TO_ACCT_CD_NM: `${items?.TO_BRANCH_CD} ${items?.TO_ACCT_TYPE} ${items?.TO_ACCT_CD} ${items?.TO_ACCT_NM}`,
          PAID: items?.PAID === "Y" ? "Paid" : "Waive",
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getTransactionConfmReject = async ({ ...reqPara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DAILYHOLDTRANSACTIONCONFIRMATION", {
      ...reqPara,
    });
  console.log(message);

  if (status === "0") {
    const RESPONSE = {
      MESSAGE: message,
      STATUS: status,
    };
    return RESPONSE;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
