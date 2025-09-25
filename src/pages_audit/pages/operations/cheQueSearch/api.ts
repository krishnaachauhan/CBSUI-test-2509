import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getClearingTypeDDW = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQSEARCHTRANTYP", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISP_VAL, DATA_VALUE, ...items }) => {
        return {
          ...items,
          value: DATA_VALUE,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getClgZoneData = async ({
  COMP_CD,
  BRANCH_CD,
  ZONE_TRAN_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCLGZONELIST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ZONE_TRAN_TYPE: ZONE_TRAN_TYPE,
      CLG: "W",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISPLAY_NM, ZONE_CD, ...others }) => {
        return {
          value: ZONE_CD,
          label: DISPLAY_NM,
          ...others,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getReasonDdwData = async ({ COMP_CD, BRANCH_CD, RETURN_TYPE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINWREASONMSTDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      RETURN_TYPE: RETURN_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISLAY_REASON, REASON_CD, ...other }) => {
          return {
            value: REASON_CD,
            label: DISLAY_REASON,
            ...other,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getChequeSearchData = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQSEARCHDATA", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((items, index) => ({
        ...items,
        DISPLAY_ACC_NO: `${items.COMP_CD}-${items.BRANCH_CD}-${items.ACCT_TYPE}-${items.ACCT_CD}`,
        INDEX: `${index}`,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCheckDuplicate = async ({ ...reqpara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDUPLICATECLGENTRY", {
      ...reqpara,
    });
  if (status === "0") {
    let responseData = data;

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const cheQueReturn = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("RETURNCHEQUE", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
