import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getFromUserDdw = async ({
  DEF_COMP_CD,
  DEF_BRANCH_CD,
  FLAG,
  A_USER,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHEXCHANGEUSERDDW", {
      DEF_COMP_CD: DEF_COMP_CD,
      DEF_BRANCH_CD: DEF_BRANCH_CD,
      FLAG: FLAG,
      A_USER: A_USER,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ USER_NAME }) => {
        return {
          value: USER_NAME,
          label: USER_NAME,
        };
      });
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCashDeno = async ({
  BRANCH_CD,
  COMP_CD,
  TRAN_DT,
  USER_NAME,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCASHDENO", {
      BRANCH_CD: BRANCH_CD,
      COMP_CD: COMP_CD,
      TRAN_DT: TRAN_DT,
      USER_NAME: USER_NAME,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const insertCashierEntry = async (request) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCASHEXCHANGENTRY", {
      ...request,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
