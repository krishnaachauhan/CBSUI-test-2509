import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getLCRecentQueue = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLCRECENTQUEUE", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const savelcdata = async ({ onboard, lcDtlData }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "FBLCDATADML",
    {
      IsNewRow: true,
      LC_TRADE_MAIN_MST: onboard,
      LC_DTL: { DETAILS_DATA: lcDtlData },
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// export const saveuserdata = async ({ onboard }) => {
//   const { status, message, messageDetails } = await AuthSDK.internalFetcher(
//     "USERACCESSDATADML",
//     {
//       IsNewRow: true,
//       USER_DTL: onboard,
//     }
//   );
//   if (status === "0") {
//     return message;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

export const saveuserdata = async ({ onboard }) => {
  // simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Always return dummy success response
  return "Success";
};

export const UpdateDMLData = async ({ onboard }) => {
  const grids = [onboard];
  const requestData = {};

  grids.forEach((grid, index) => {
    const gridKey = [
      "USER_DTL",
      "APPLICATION_ACCESS_DTL",
      "BRANCH_TYPE_ACCESS_DTL",
      "ACCT_TYPE_ACCESS_DTL",
      "USER_SHIFT_DTL",
      "BIOMETRIC_DATA_DTL",
    ][index];
    const gridConditions = [
      "isNewRow",
      "isDeleteRow",
      "isUpdatedRow",
      "_UPDATEDCOLUMNS",
    ];

    if (gridConditions.some((condition) => grid?.[condition]?.length > 0)) {
      if (gridKey === "USER_DTL") {
        requestData[gridKey] = grid;
      } else {
        requestData[gridKey] = { DETAILS_DATA: grid };
      }
    }
  });
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "USERACCESSDATADML",
    {
      IsNewRow: false,
      ...requestData,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDocStepper = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDOCSTEPPER", { ...Apireq });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTFChargeCal = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTFCHARGECAL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTFServiceTax = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTFSERVICETAX", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTFContingentac = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTFCONTINGENTAC", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDisAcct = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDISBACCT", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
