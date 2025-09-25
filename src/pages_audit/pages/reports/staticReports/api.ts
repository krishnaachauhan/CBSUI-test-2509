import { DefaultErrorObject } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import { AuthSDK } from "registry/fns/auth";
import { GeneralAPI } from "registry/fns/functions";
// export const GetMiscValue = () => GeneralAPI.GetMiscValue("TRAN_TYPE");
export const GetMiscValue = (categoryCode) =>
  GeneralAPI.GetMiscValue(categoryCode);

export const getSecurityUserListData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECURITYUSERSLIST", {});
  if (status === "0") {
    // return data;
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ FULL_DTL, USER_NAME }) => {
        return {
          value: USER_NAME,
          label: FULL_DTL,
        };
      });
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getClubMemberGridData = async (entityType) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(`GETOTHERENTITYGRIDDATA`, {
      ENTITY_TYPE: entityType,
    });
  if (status === "0") {
    if (entityType === "C") {
      return data.map((item) => {
        return { ...item, value: item?.TRAN_CD, label: item?.DESCRIPTION };
      });
    }
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDynamicbillerSubCategorylist = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDBILLSUBCATEGORYLIST", {
      CATEGORY_ID: "UTL01",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ SUB_CATEGORY_ID, SUB_CATEGORY_DESC }) => {
          return {
            value: SUB_CATEGORY_ID,
            label: SUB_CATEGORY_DESC,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDynamicBillerList = async (SUB_CATEGORY_ID) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNBILLERLIST", {
      CATEGORY_ID: "UTL01",
      SUB_CATEGORY_ID: SUB_CATEGORY_ID,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ BILLER_ID, BILLER_DESC }) => {
        return {
          value: BILLER_ID,
          label: BILLER_DESC,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getMerchantList = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDDMERCHANTLIST", {
      // TRAN_CD: "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ MERCHANT, TRAN_CD }) => {
        return {
          value: TRAN_CD,
          label: MERCHANT,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTrnParticularsDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("reportServiceAPI/TRNPARTICULAR", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
  // return {};
};

// export personalization save/update api
export const saveUpdateTemplate = async (req) => {
  const { status, message } = await AuthSDK.internalFetcher(
    "GRIDUPDATEDTL",
    req
  );
  if (status === "0") {
    enqueueSnackbar(message, { variant: "success" });
  } else {
    enqueueSnackbar(message, { variant: "error" });
  }
};

// export personalization fetch api
export const getPersonalizedReportData = async (templateCode, userid) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GET_GRID_EXPORT_CONFIG", {
      REPORT_PERSONALIZATION_ID: templateCode,
      USER_ID: userid,
    });
  if (status === "0") {
    return data.map((item) => ({
      ...item,
      SHOW_HEADER: item.SHOW_HEADER === "Y" ? true : false,
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// export const getDateRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

// export const getDateUserNameRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       USER_NAME: filter?.[2]?.value?.value ?? "ALL",
//       A_CUSTOM_USER_NM: filter?.[2]?.value?.value ?? "ALL",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

// export const getFundTransferRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[2]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[4]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       USER_NAME: filter?.[0]?.value?.value ?? "ALL",
//       A_TRN_TYPE: filter?.[6]?.value?.value ?? "ALL",
//       A_STATUS: filter?.[5]?.value?.value ?? "ALL",
//       A_FR_AMT: filter?.[1]?.value?.value ?? "",
//       A_TO_AMT: filter?.[3]?.value?.value ?? "",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getOtpSmsEmailRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       // FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_FROM_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[5]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_KEY: filter?.[2]?.value?.value ?? "ALL",
//       A_STATUS: filter?.[6]?.value?.value ?? "ALL",
//       A_FLAG: filter?.[2]?.value?.value ?? "ALL",
//       A_FILTER_VALUE: filter?.[0]?.value?.value ?? "ALL",
//       A_PAGE_NO: filter?.[3]?.value?.value ?? "",
//       A_PAGE_SIZE: filter?.[4]?.value?.value ?? "",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getQrGeneratedRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[2]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_USER_ID: filter?.[0]?.value?.value ?? "ALL",
//       A_TRN_TYPE: filter?.[3]?.value?.value ?? "ALL",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getPaymentDetailsRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TRN_TYPE: filter?.[2]?.value?.value ?? "ALL",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getMonthlyServiceRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TRN_TYPE: filter?.[2]?.value?.value ?? "ALL",
//       V_CHANNEL: filter?.[3]?.value?.value ?? "ALL",
//       CHANNEL: filter?.[4]?.value?.value ?? "ALL",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getCustomerGlobalLimitRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       ASON_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[3]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_CUSTOM_USER_NM: filter?.[1]?.value?.value ?? "ALL",
//       A_FREQUENCY: filter?.[2]?.value?.value ?? "",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getCardActiveResetPinRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_STATUS: filter?.[2]?.value?.value ?? "ALL",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
// export const getUtilityBillRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[2]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[4]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       USER_NAME: filter?.[0]?.value?.value ?? "ALL",
//       A_STATUS: filter?.[5]?.value?.value ?? "ALL",
//       SUB_CATEGORY_ID: filter?.[1]?.value?.value ?? "",
//       BILLER_ID: filter?.[3]?.value?.value ?? "",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

// export const getMerchantTransaction = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_FROM_DT: filter?.[0]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_TO_DT: filter?.[1]?.value?.value ?? format(new Date(), "dd/MM/yyyy"),
//       A_MER_TRAN_CD: filter?.[2]?.value?.value ?? "",
//       A_FLAG: filter?.[3]?.value?.value ?? "DATE",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };

// export const getClubMemberRetrievalReportData = async (
//   reportID,
//   filter,
//   otherAPIRequestPara
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("reportServiceAPI/" + reportID, {
//       A_CLUB_NM: filter?.[0]?.value?.value ?? "ALL",
//       A_TRAN_CD: filter?.[0]?.value?.value ?? "0",
//       ...otherAPIRequestPara,
//     });
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
