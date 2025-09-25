import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const CompanyTypeOP = async (COMP_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCYCOMPTYPEDDW", {
      COMP_CD: COMP_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ COMPANY_TYPE_NM, COMPANY_TYPE_CD, ...other }) => {
          return {
            ...other,
            COMPANY_TYPE_NM: COMPANY_TYPE_NM,
            COMPANY_TYPE_CD: COMPANY_TYPE_CD,
            value: COMPANY_TYPE_CD,
            label: COMPANY_TYPE_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const CityTypeOP = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAREAMSTCITYDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CITY_NM, CITY_CD, ...other }) => {
        return {
          ...other,
          CITY_NM: CITY_NM,
          CITY_CD: CITY_CD,
          value: CITY_CD,
          label: CITY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTabsDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCIFTABDTL", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustomerDetailsonEdit = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTOMERDETAILS", reqData);
  if (status === "0") {
    return data;
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

export const updateExtDocument = async (payload) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CUSTDOCUMENTDATADML", payload);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const leiNoValidation = async (payload) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELEINO", payload);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCIFCategories = async ({ COMP_CD, BRANCH_CD, ENTITY_TYPE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCIFCATEG", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ENTITY_TYPE: ENTITY_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ CATEG_CD, CATEG_NM, CONSTITUTION_NAME, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            CATEG_CD: CATEG_CD,
            CATEG_NM: CATEG_NM,
            CONSTITUTION_NAME: CONSTITUTION_NAME,
            value: CATEG_CD,
            label: DISPLAY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getOccupationDTL = async (COMP_CD, BRANCH_CD, CUSTOMER_TYPE) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTOCCUPATIONLIST", {
      COMP_CD: COMP_CD ?? "",
      BRANCH_CD: BRANCH_CD ?? "",
      CUSTOMER_TYPE: CUSTOMER_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ TRADE_CD, TRADE_NM, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            TRADE_CD: TRADE_CD,
            TRADE_NM: TRADE_NM,
            DISPLAY_NM: DISPLAY_NM,
            value: TRADE_CD,
            label: DISPLAY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRatingOpDTL = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTRATELIST", {
      COMP_CD: COMP_CD ?? "",
      BRANCH_CD: BRANCH_CD ?? "",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ RATE_CD, RATE_NM, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            RATE_CD: RATE_CD,
            RATE_NM: RATE_NM,
            value: RATE_CD,
            label: DISPLAY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPMISCData = async (CATEGORY_CD, otherParam?) => {
  let payload = {
    CATEGORY_CD: CATEGORY_CD,
  };
  if (CATEGORY_CD === "TDS_EXEMPTION") {
    const { dependentValue, formState } = otherParam;
    const formMode = formState?.formMode;
    if (formMode === "edit") {
      payload["FORM_TYPE"] = dependentValue?.FORM_TYPE?.value ?? "";
    }
  }
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", payload);
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      if (CATEGORY_CD === "CKYC_RELAT_PERS" && otherParam?.CUST_TYPE) {
        responseData = responseData.filter((element) =>
          otherParam.CUST_TYPE === "I"
            ? element?.REMARKS === "I" || element?.REMARKS === "B"
            : element?.REMARKS === "L" || element?.REMARKS === "B"
        );
      }
      if (CATEGORY_CD === "CKYC_ADD_PROOF" && otherParam?.CUST_TYPE) {
        responseData = responseData.filter((element) =>
          otherParam.CUST_TYPE === "I"
            ? element?.REMARKS === "I" || element?.REMARKS === "B"
            : element?.REMARKS === "L" || element?.REMARKS === "B"
        );
      }
      if (CATEGORY_CD === "CKYC_LOC_POA" && otherParam?.CUST_TYPE) {
        responseData = responseData.filter((element) =>
          otherParam.CUST_TYPE === "I"
            ? element?.REMARKS === "I" || element?.REMARKS === "B"
            : element?.REMARKS === "L" || element?.REMARKS === "B"
        );
      }

      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
            DATA_VALUE: DATA_VALUE,
            DISPLAY_VALUE: DISPLAY_VALUE,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const GetDynamicSalutationData = async (CATEGORY_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSALUTATIONDATA", {
      CATEGORY: CATEGORY_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
            DATA_VALUE: DATA_VALUE,
            DISPLAY_VALUE: DISPLAY_VALUE,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getGenderOp = (dependentValue) => {
  const genderString = dependentValue?.PREFIX_CD?.optionData?.[0]?.GENDER ?? "";
  const setGender =
    dependentValue?.PREFIX_CD?.optionData?.[0]?.SET_GENDER ?? "";
  const genderArr = genderString?.includes(",")
    ? genderString?.split(",")?.map((el) => el?.trim())
    : [genderString];

  let allOptions = [
    { label: "MALE", value: "M" },
    { label: "FEMALE", value: "F" },
    { label: "OTHER", value: "O" },
    { label: "TRANSGENDER", value: "T" },
  ];
  if (genderString && Array.isArray(genderArr)) {
    allOptions = allOptions?.filter((op) => genderArr?.includes(op.value));
  }
  allOptions = allOptions.map((op) => ({
    ...op,
    defaultValue: setGender,
  }));
  return allOptions;
};

export const getCountryOptions = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOUNTRYLIST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ COUNTRY_CD, COUNTRY_NM, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            COUNTRY_CD: COUNTRY_CD,
            COUNTRY_NM: COUNTRY_NM,
            value: COUNTRY_CD,
            label: DISPLAY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustomerGroupOptions = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTGROUPLIST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ GROUP_CD, DESCRIPTION, DISP_NM, ...other }) => {
          return {
            ...other,
            GROUP_CD: GROUP_CD,
            DISP_NM: DISP_NM,
            value: GROUP_CD,
            label: DISP_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCommunityList = async (COMP_CD, BRANCH_CD, CUSTOMER_TYPE) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTCOMMULIST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_TYPE: CUSTOMER_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CODE, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          CODE: CODE,
          DISPLAY_NM: DISPLAY_NM,
          value: CODE,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getParentAreaOptions = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPARENTAREALIST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ P_AREA_NM, P_AREA_CD, ...other }) => {
        return {
          ...other,
          P_AREA_NM: P_AREA_NM,
          P_AREA_CD: P_AREA_CD,
          value: P_AREA_CD,
          label: P_AREA_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateEmailID = async (columnValue) => {
  const EMAIL_ID = columnValue.value ?? columnValue;
  if (EMAIL_ID) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETEMAILSTATUS", {
        EMAIL_ID: EMAIL_ID,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const validateMobileNo = async (
  columnValue,
  dependentValue,
  formState
) => {
  const MOBILE_NO = columnValue.value;
  const SCREEN = formState?.docCD;
  const STD_CD = dependentValue ?? "";
  const FLAG = "Y";

  if (MOBILE_NO) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETMOBILESTATUS", {
        // EMAIL_ID: EMAIL_ID
        MOBILE_NO: MOBILE_NO,
        SCREEN: SCREEN,
        STD_CD: STD_CD ?? "",
        FLAG: FLAG,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const validateUniqueId = async (columnValue) => {
  const UNIQUEID = columnValue.value;

  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUNIQUEIDSTATUS", {
      UNIQUEID: UNIQUEID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateGSTIN = async (columnValue, allField, flag) => {
  const GSTIN = columnValue.value;

  if (GSTIN) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETGSTINSTATUS", {
        GSTIN: GSTIN,
      });
    if (status === "0") {
      const GSTIN_STATUS = data?.[0]?.GSTIN_STATUS;
      // const UID_STATUS = data?.[0]?.UID_STATUS
      if (GSTIN_STATUS) {
        return GSTIN_STATUS;
      } else return "";
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const validatePAN = async (columnValue) => {
  const PAN = columnValue?.value ?? columnValue;
  if (PAN) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETPANSTATUS", {
        PAN: PAN,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const checkDuplication = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKCUSTDUPLICATEDATA", req);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// for retrieveing data, in retrieve, personal/entity details, in grid
export const getRetrieveData = async ({ COMP_CD, BRANCH_CD, A_PARA }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SEARCHCUSTID", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      A_PARA: A_PARA,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// for getting pending entries, in grid
export const getPendingData = async (reqObj: {
  A_COMP_CD: string;
  A_BRANCH_CD: string;
  A_FLAG: string;
}) => {
  const { A_COMP_CD, A_BRANCH_CD, A_FLAG } = reqObj;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETREQCUSTLIST", {
      A_COMP_CD,
      A_BRANCH_CD,
      A_FLAG,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.CONFIRMED === "Y") {
        item._rowColor = "rgb(9 132 3 / 51%)";
      }
      if (item?.CONFIRMED === "R") {
        item._rowColor = "rgb(152 59 70 / 61%)";
      }
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const ConfirmPendingCustomers = async ({
  REQUEST_CD,
  REMARKS,
  CONFIRMED,
  REQ_FLAG,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CONFIRMCUSTOMERDATA", {
      REQUEST_CD: REQUEST_CD,
      REMARKS: REMARKS,
      CONFIRMED: CONFIRMED,
      REQ_FLAG: REQ_FLAG,
      SCREEN_REF: SCREEN_REF,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const ConfirmCustPhoto = async ({ REQUEST_CD, COMP_CD, CONFIRMED }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CONFIRMCUSTPHOTODATA", {
      REQUEST_CD: REQUEST_CD,
      COMP_CD: COMP_CD,
      CONFIRMED: CONFIRMED,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const ConfirmDocument = async ({
  REQUEST_CD,
  COMP_CD,
  CONFIRMED,
  REMARKS,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CONFIRMCUSTDOCDATA", {
      REQUEST_CD: REQUEST_CD,
      COMP_CD: COMP_CD,
      CONFIRMED: CONFIRMED,
      REQ_FROM: "CUST",
      REMARKS: REMARKS,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRangeOptions = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNNULINCOME", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          TRAN_CD: TRAN_CD,
          DISPLAY_NM: DISPLAY_NM,
          value: TRAN_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getEmpCompanyTypes = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMPTYPENM", {
      COMP_CD: COMP_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ COMPANY_TYPE_CD, DISPLAY_COMP_TYPE_NM, ...other }) => {
          return {
            ...other,
            COMPANY_TYPE_CD: COMPANY_TYPE_CD,
            DISPLAY_COMP_TYPE_NM: DISPLAY_COMP_TYPE_NM,
            value: COMPANY_TYPE_CD,
            label: DISPLAY_COMP_TYPE_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getEduQualiOptions = async (COMP_CD, BRANCH_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEDUCATIONDTL", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ ED_TYPE_CD, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            ED_TYPE_CD: ED_TYPE_CD,
            DISPLAY_NM: DISPLAY_NM,
            value: ED_TYPE_CD,
            label: DISPLAY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRelationshipManagerOptions = async (COMP_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCNRITABRMDDW", {
      COMP_CD: COMP_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ FULLNAME, EMP_ID, ...other }) => {
        return {
          ...other,
          FULLNAME: FULLNAME,
          EMP_ID: EMP_ID,
          label: FULLNAME,
          value: EMP_ID,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDocumentTypes = async ({ TRAN_CD, SR_CD, DOC_TYPE }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCCUMENTSCANHISTORY", {
      TRAN_CD: "189084",
      SR_CD: "1",
      DOC_TYPE: "KYC",
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
            label: DOC_DESCRIPTION,
            value: TEMPLATE_CD,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustDocumentOpDtl = async ({
  COMP_CD,
  BRANCH_CD,
  formState,
}) => {
  const { gridData, rowsData } = formState;
  let selectedDoc: any[] = [];
  if (rowsData && rowsData.length > 0) {
    selectedDoc = rowsData.map((el) => {
      return el.data.TEMPLATE_CD ?? "";
    });
  } else if (gridData && gridData.length > 0) {
    selectedDoc = gridData.map((el) => {
      return el.TEMPLATE_CD ?? "";
    });
  }
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTDOCUMENT", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (rowsData && rowsData.length > 0) {
      responseData = responseData.filter((el) =>
        selectedDoc.includes(el.SR_CD)
      );
    } else if (gridData && gridData.length > 0) {
      responseData = responseData.filter(
        (el) => !selectedDoc.includes(el.SR_CD)
      );
    }
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, SR_CD, ...other }) => {
        return {
          ...other,
          DESCRIPTION: DESCRIPTION,
          SR_CD: SR_CD,
          label: DESCRIPTION,
          value: SR_CD,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPhotoSignImage = async ({ COMP_CD, reqCD, customerID }) => {
  const reqObj = reqCD
    ? {
        COMP_CD: COMP_CD,
        REQUEST_CD: reqCD,
      }
    : {
        COMP_CD: COMP_CD,
        CUSTOMER_ID: customerID,
      };
  if (reqCD || customerID) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCUSTOMERHISTORY", reqObj);
    // GETCUSTIMGHISMST
    if (status === "0") {
      let responseData = data;
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};
export const updatePhotoSignData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUPDCUSTPHOTODATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustLatestDtl = async ({
  COMP_CD,
  BRANCH_CD,
  SCREEN_REF,
  CUSTOMER_ID,
  REQUEST_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTOMERPHOTODETAILS", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      SCREEN_REF: SCREEN_REF,
      CUSTOMER_ID: CUSTOMER_ID,
      REQUEST_CD: REQUEST_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPhotoSignHistory = async ({ COMP_CD, CUSTOMER_ID, REQ_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTSIGNPHOTOHISTORY", {
      COMP_CD: COMP_CD,
      CUSTOMER_ID: CUSTOMER_ID,
      REQ_CD: REQ_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateSpecialCharsAndSpaces = (columnValue) => {
  const value = columnValue?.value;
  if (!value) return "";
  let regex = /^[a-zA-Z\s]*$/;

  if (value?.startsWith(" ")) {
    return "SpacebeforeNameNotAllowed";
  } else if (value?.endsWith(" ")) {
    return "SpaceAfterNameNotAllowed";
  } else if (/  /.test(value)) {
    return "DoubleSpaceNotAllowed";
  } else if (/\s{2,}/.test(value)) {
    return "DoubleSpaceNotAllowed";
  } else if (!regex.test(value)) {
    return "PleaseEnterCharacterValue";
  }
  return "";
};

export const validateCharValue = (columnValue) => {
  const value = columnValue?.value;
  if (!value) return "";
  if (!/^[a-zA-Z\s]*$/.test(value)) {
    return "PleaseEnterCharacterValue";
  }
  return "";
};

export const validateCustData = async ({
  reqPara,
  deepRemoveKeysIfExist,
  deepUpdateKeys,
  authState,
}) => {
  const updatedReqObj = {
    ...reqPara,
    MAIN_DATA: {
      ...reqPara.MAIN_DATA,
      ENTERED_DATE: authState?.workingDate ?? "",
    },
  };
  const removedKeysData = await deepRemoveKeysIfExist(updatedReqObj, [
    "MASKED_DRIVING_LICENSE_NO",
    "MASKED_UNIQUE_ID",
    "MASKED_CONTACT1",
    "MASKED_CONTACT2",
    "MASKED_CONTACT3",
    "MASKED_CONTACT4",
    "MASKED_CONTACT5",
    "MASKED_OTHER_DOC_NO",
    "MASKED_PASSPORT_NO",
    "MASKED_NREGA_JOB_CARD",
    "MASKED_ELECTION_CARD_NO",
    "MASKED_PAN_NO",
    "PAN_NO_HIDDEN",
  ]);

  const updatedObj = deepUpdateKeys(
    removedKeysData,
    new Set([
      "CONFIRMED",
      "ACTIVE",
      "POLITICALLY_CONNECTED",
      "BLINDNESS",
      "REFERRED_BY_STAFF",
      "ACTIVE_FLAG",
      "SAME_AS_PER",
      "ADHAR_PAN_LINK",
    ]),
    (key, value) => (value === true ? "Y" : "N")
  );

  const updateDateFormat = deepUpdateKeys(
    updatedObj,
    new Set([
      "BIRTH_DT",
      "KYC_REVIEW_DT",
      "RISK_REVIEW_DT",
      "DATE_OF_DEATH",
      "INACTIVE_DT",
      "VALID_UPTO",
      "FATCA_DT",
      "DATE_OF_COMMENCEMENT",
      "PASSPORT_ISSUE_DT",
      "PASSPORT_EXPIRY_DT",
      "DRIVING_LICENSE_ISSUE_DT",
      "DRIVING_LICENSE_EXPIRY_DT",
      "VISA_ISSUE_DT",
      "VISA_EXPIRY_DT",
      "JOINING_DT",
      "RETIREMENT_DT",
      "COMMENCEMENT_DT",
      "LIQUIDATION_DT",
      "LEI_EXPIRY_DATE",
      "RECEIVED_DT",
      "EFFECTIVE_DT",
      "FORM_EXPIRY_DATE",
      "SUBMISSION_DT",
      "VERIFIED_DATE",
      "LAST_MODIFIED_DATE",
      "ENTERED_DATE",
    ]),
    (key, value) => {
      return Boolean(value)
        ? format(utilFunction.getParsedDate(value), "dd-MMM-yyyy")
        : "";
    }
  );

  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECUSTDATA", updateDateFormat);
  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateCustomerID = async ({
  reqPara,
  state,
  save_flag,
  authState,
  deepRemoveKeysIfExist,
  deepUpdateKeys,
}) => {
  //Fn calling for removing non-required keys from reqPara
  const removedKeysData = await deepRemoveKeysIfExist(reqPara, [
    "AGE",
    "CITY",
    "DISTRICT",
    "STATE",
    "COUNTRY",
    "LOC_DISTRICT",
    "LOC_STATE",
    "LOC_COUNTRY",
    "MASKED_DRIVING_LICENSE_NO",
    "MASKED_UNIQUE_ID",
    "MASKED_CONTACT1",
    "MASKED_CONTACT2",
    "MASKED_CONTACT3",
    "MASKED_CONTACT4",
    "MASKED_CONTACT5",
    "MASKED_OTHER_DOC_NO",
    "MASKED_PASSPORT_NO",
    "MASKED_NREGA_JOB_CARD",
    "MASKED_ELECTION_CARD_NO",
    "MASKED_PAN_NO",
    "CONSTITUTION_NAME",
    "CONSTITUTION_TYPE",
    "CATEG_NM",
    "CATEGORY_CONSTITUTIONS",
    "SOURCE_OF_INCOME_DDW",
    "HIDE_CHECK",
    "SOURCE_OF_INCOME_DDW",
    "COMPANY_NM_OPTION",
    "FILE_NAME",
    "IMG_TYPE",
    "COMPANY_NM_OPTION",
    "PAN_NO_HIDDEN",
  ]);
  const updatedObj = deepUpdateKeys(
    removedKeysData,
    new Set([
      "CONFIRMED",
      "ACTIVE",
      "POLITICALLY_CONNECTED",
      "BLINDNESS",
      "REFERRED_BY_STAFF",
      "ACTIVE_FLAG",
      "SAME_AS_PER",
      "ADHAR_PAN_LINK",
    ]),
    (key, value) => (value === true ? "Y" : "N")
  );

  const updateDateFormat = deepUpdateKeys(
    updatedObj,
    new Set([
      "BIRTH_DT",
      "KYC_REVIEW_DT",
      "RISK_REVIEW_DT",
      "DATE_OF_DEATH",
      "INACTIVE_DT",
      "VALID_UPTO",
      "FATCA_DT",
      "DATE_OF_COMMENCEMENT",
      "PASSPORT_ISSUE_DT",
      "PASSPORT_EXPIRY_DT",
      "DRIVING_LICENSE_ISSUE_DT",
      "DRIVING_LICENSE_EXPIRY_DT",
      "VISA_ISSUE_DT",
      "VISA_EXPIRY_DT",
      "JOINING_DT",
      "RETIREMENT_DT",
      "COMMENCEMENT_DT",
      "LIQUIDATION_DT",
      "LEI_EXPIRY_DATE",
      "RECEIVED_DT",
      "EFFECTIVE_DT",
      "FORM_EXPIRY_DATE",
      "SUBMISSION_DT",
      "VERIFIED_DATE",
      "LAST_MODIFIED_DATE",
      "ENTERED_DATE",
    ]),
    (key, value) => {
      if (state?.customerIDctx) {
        return Boolean(value)
          ? format(utilFunction.getParsedDate(value), "yyyy-MM-dd HH:mm:ss.S")
          : "";
      } else {
        return Boolean(value)
          ? format(utilFunction.getParsedDate(value), "dd-MMM-yyyy")
          : "";
      }
    }
  );
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVECUSTOMERDATA", {
      ...updateDateFormat,
      CUSTOMER_TYPE: state?.entityTypectx,
      IsNewRow: !Boolean(state?.req_cd_ctx),
      REQ_CD: state?.req_cd_ctx ?? "",
      REQ_FLAG: Boolean(state?.customerIDctx) ? "E" : "F",
      SAVE_FLAG: save_flag ?? "",
      ENTRY_TYPE: state?.req_cd_ctx ? "2" : "1",
      PAN_DUP_REASON: state?.panDuplicateReasonctx ?? "",
      CUSTOMER_ID: state?.customerIDctx ?? "",
      COMP_CD: !Boolean(state?.customerIDctx)
        ? authState?.companyID
        : state?.retrieveFormDataApiRes["PERSONAL_DETAIL"]?.COMP_CD ?? "",
      BRANCH_CD: !Boolean(state?.customerIDctx)
        ? authState?.user?.branchCode
        : state?.retrieveFormDataApiRes["PERSONAL_DETAIL"]?.BRANCH_CD ?? "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAlphaNumValue = (columnValue) => {
  if (!columnValue?.value) return "";
  if (!/^[a-zA-Z0-9\s]*$/.test(columnValue?.value)) {
    return "PleaseEnterAlphanumericValue";
  }
  return "";
};

export const getAttestHistory = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTATTESTHISDTL", {
      COMP_CD: COMP_CD,
      CUSTOMER_ID: CUSTOMER_ID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAttestData = async ({
  COMP_CD,
  BRANCH_CD,
  CUSTOMER_ID,
  USER_NAME,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTATTESTRITDTL", {
      CUSTOMER_ID: CUSTOMER_ID,
      USER_NAME: USER_NAME,
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((item) => {
        return {
          ...item,
          RISK_CATEG:
            item.hasOwnProperty("RISK_CATEG") &&
            typeof item.RISK_CATEG === "string"
              ? item.RISK_CATEG.trim()
              : "",
        };
      });
      return responseData;
    }
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getEmpCodeList = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERDDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ USER_NAME, ...other }) => {
        return {
          ...other,
          label: USER_NAME,
          value: USER_NAME,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAreaList = async (reqdata) => {
  if (Boolean(reqdata?.PIN_CODE) && reqdata?.PIN_CODE?.length > 5) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETAREALIST", reqdata);
    if (status == 0) {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ AREA_CD, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            label: DISPLAY_NM,
            value: AREA_CD,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } else return [];
};

// to get data, in grid
export const getInsuranceGridData = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINSURANCE", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });

  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// get bank detail data, in grid
export const getBankDTLGridData = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("OTHERBANKDETAIL", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// to get data, in grid
export const getCreditCardDTLGridData = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CUSTOMERCREDITCARDDTL", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// to get data, in grid
export const getOffencesDTLGridData = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("OFFENCESDTL", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// to get data, in grid
export const getControllingPersonDTLGridData = async ({
  COMP_CD,
  CUSTOMER_ID,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CONTROLLINGPERSONDTL", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });
  if (status == 0) {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ACTIVE, ...other }) => {
        return {
          ...other,
          ACTIVE: ACTIVE === "Y" ? true : false,
        };
      });
    }
    return responseData;
  }
};

// to get data, in grid
export const getAssetDTLGridData = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETASSETDTL", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// to get data, in grid
export const getFinancialDTLGridData = async ({ COMP_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFINANCIALDETAIL", {
      CUSTOMER_ID: CUSTOMER_ID,
      COMP_CD: COMP_CD,
    });
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCategoryDTL = async ({ COMP_CD, BRANCH_CD, CUSTOMER_ID }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCATEGORYDTL", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_ID: CUSTOMER_ID,
    });
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCalculatedRate = async (reqObj) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CALCULATEINTRATE", reqObj);
  return {
    data,
    status,
    message,
    messageDetails,
  };
};

export const saveCategUpdate = async (reqObj) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVECATEGORYDTL", reqObj);
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const TDSExemptionDTL = async ({
  COMP_CD,
  CUSTOMER_ID,
  USERNAME,
  BRANCH_CD,
  REQ_CD,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCTDSEXEMDTL", {
      COMP_CD,
      CUSTOMER_ID,
      USERNAME,
      BRANCH_CD,
      REQ_CD,
      WORKING_DATE,
    });
  if (status == 0) {
    if (Boolean(Array.isArray(data))) {
      return data.map((row, index) => ({
        ...row,
        IsNewRow: false,
        ORIGINALACTIVE: row?.ACTIVE,
      }));
    }
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const SaveTDSExemption = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVETDSEXEMPTION", reqPara);
  if (status == 0) {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getMinorMajorAgeData = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMINORMAJOR", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateCustIdonEdit = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEALLOWCUSTIDEDIT", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateActiveField = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECKYCUSTINACTIVE", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateNewCategory = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATENEWCATEG", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCkycRefCusDtl = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCREFCUSTDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  }
  if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateRefCustID = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEREFCUSTID", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCkycPanDupDtl = async (apiReq) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCPANDUPDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  }
  if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateName = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTBALCOUNT", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRiskCateg = async ({ CALLFROM }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRISKCATEGDDDW", { CALLFROM });
  if (status === "0") {
    let responseData = data;
    responseData = responseData.map(({ DATA_VALUE, DISPLAY_NM, ...other }) => {
      return {
        ...other,
        DATA_VALUE: DATA_VALUE,
        DISPLAY_VALUE: DISPLAY_NM,
        value: DATA_VALUE,
        label: DISPLAY_NM,
      };
    });

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
