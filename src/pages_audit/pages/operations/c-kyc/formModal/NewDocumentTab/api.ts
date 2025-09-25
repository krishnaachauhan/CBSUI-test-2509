import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

//validate documents date date
export const validateDocDate = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDOCVALIDUPTODT", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// retrieving document medatory docs in grid for new entry
export const getKYCDocumentGridData = async ({
  COMP_CD,
  BRANCH_CD,
  CUST_TYPE,
  CONSTITUTION_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDOCTEMPLATEDTL", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_TYPE: CUST_TYPE ?? null,
      ACCT_TYPE: null,
      // CONSTITUTION_TYPE: CONSTITUTION_TYPE,
      // TRAN_CD: "42"
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DOC_DESCRIPTION, TEMPLATE_CD, ...other }) => {
          return {
            ...other,
            DOC_DESCRIPTION: DOC_DESCRIPTION,
            TEMPLATE_CD: TEMPLATE_CD,
            // label: DOC_DESCRIPTION,
            // value: TEMPLATE_CD,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDocumentImagesList = async ({ TRAN_CD, SR_CD, REQ_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCDOCSCNHISDISP", {
      TRAN_CD: TRAN_CD,
      SR_CD: SR_CD,
      REQ_CD: REQ_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ LINE_CD, ...other }) => {
        return {
          ...other,
          LINE_CD: LINE_CD,
          LINE_ID: LINE_CD,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
