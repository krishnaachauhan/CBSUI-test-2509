import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject } from "@acuteinfo/common-base";
export const getForm15GHDetail = async ({
  workingDate,
  enterCompanyID,
  enterBranchCode,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHDTL", {
      GD_DATE: workingDate,
      ENT_COMP_CD: enterCompanyID,
      ENT_BRANCH_CD: enterBranchCode,
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        ACTIVE: item?.ACTIVE === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCutomerDetail = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHACDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDDtl = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHFDRDDTL", {
      ...apiReq,
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.SR_CD = index + 1;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFinDate = async ({ GD_DATE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHFINDATE", { GD_DATE: GD_DATE });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getEntry15GHRetrieveData = async ({
  COMP_CD,
  BRANCH_CD,
  TRAN_TYPE,
  CUSTOMER_ID,
  FROM_DT,
  TO_DT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHRETRIVEDATA", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      TRAN_TYPE: TRAN_TYPE,
      CUSTOMER_ID: CUSTOMER_ID,
      FROM_DT: FROM_DT,
      TO_DT: TO_DT,
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        ACTIVE: item?.ACTIVE === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRetrieveFDData = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHFDDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const form15GHEntryDML = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("FORM15GHENTRYDML", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const printForm15G = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPRINT15GFORMDETAILS", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const printAnnexureForm = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPRINT15GANNEXUREFORMDETAILS", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const printForm15H = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPRINT15HFORMDETAILS", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getForm15GHConfirmationDetail = async ({
  enterCompanyID,
  enterBranchCode,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORM15GHCONFPENDING", {
      ENT_COMP_CD: enterCompanyID,
      ENT_BRANCH_CD: enterBranchCode,
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        ACTIVE: item?.ACTIVE === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const form15GHConfirmationDML = async (formData) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "FORM15GHENTRYCONFIRMATION",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
