import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAcctScaningRetrieveData = async ({ BRANCH_CD, COMP_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIGNPHOTOCONFGRID", {
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
    });
  console.log(data);

  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map((items, index) => ({
        ...items,
        INDEX: index,
      }));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const doPhotoSignEntryConfirm = async ({
  BRANCH_CD,
  COMP_CD,
  SCREEN_REF,
  ACCT_TYPE,
  ACCT_CD,
  SR_CD,
  J_TYPE,
  FLAG,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CONFIRMACCTPHOTODATA", {
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
      //@ts-ignore
      SCREEN_REF: SCREEN_REF,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      SR_CD: SR_CD,
      J_TYPE: J_TYPE,
      FLAG: FLAG,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
