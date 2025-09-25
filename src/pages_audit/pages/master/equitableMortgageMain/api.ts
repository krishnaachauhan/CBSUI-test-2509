import { DefaultErrorObject } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { cloneDeep } from "lodash";
import { AuthSDK } from "registry/fns/auth";

export const getEquitableMortgageData = async ({ BRANCH_CD, COMP_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLEMORTHDR", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...other }) => {
          return {
            SR_CD: "1",
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
export const getEquiyablePara = async ({ BRANCH_CD, COMP_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLEPARA", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getdropdownData = async ({ ...reqPara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", {
      ...reqPara,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...other }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
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
export const getEquitableMortgageDetails = async ({ TRAN_CD, COMP_CD }) => {
  const {
    data: originalData,
    status,
    message,
    messageDetails,
  } = await AuthSDK.internalFetcher("GETEQUITABLEMORTDTL", {
    COMP_CD,
    TRAN_CD,
  });

  if (status === "0") {
    const requiredKeys = [
      "PROPERTY_NO",
      "SR_CD",
      "STATE_NM",
      "COUNTRY_NM",
      "CITY_NM",
      "PROPERTY_TYPE",
      "TYPE_OF_CHARGE",
      "DESCRIPTION_SEC",
      "AREA_IN_METER",
      "AREA_IN_FTS",
      "ADDRESS_1",
      "ADDRESS_2",
      "ADDRESS_3",
      "AREA_CD",
      "PIN_CODE",
      "CITY_CD",
      "STATE_CD",
      "COUNTRY_CD",
      "MORT_CHG_DT",
      "MORT_CHG_SAT_DT",
      "CER_CHG_DT",
      "CER_CHG_SAT_DT",
      "CER_ID_NO",
      "CER_ASS_ID",
      "VALUAR",
      "VALUATION_DT",
      "VAL_EXP_DT",
      "ADVOCATE_CODE",
      "TITLE_DT",
      "EXPIRY_DATE",
      "FARE_VALUE",
      "FORCED_VALUE",
      "DIST_VAL",
    ];

    const dateKeys = [
      "MORT_CHG_DT",
      "MORT_CHG_SAT_DT",
      "CER_CHG_DT",
      "CER_CHG_SAT_DT",
      "VALUATION_DT",
      "VAL_EXP_DT",
      "TITLE_DT",
      "EXPIRY_DATE",
    ];

    const floatFormatKeys = [
      "AREA_IN_METER",
      "AREA_IN_FTS",
      "FARE_VALUE",
      "FORCED_VALUE",
    ];

    const formatDate = (value: string | Date) => {
      try {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          return format(parsedDate, "dd/MM/yyyy");
        }
        return value;
      } catch {
        return value;
      }
    };

    const ensureFloatFormat = (value: any) => {
      if (value == null || value === "") return value;
      const valStr = value.toString();
      return valStr.includes(".") ? valStr : `${valStr}.00`;
    };

    const filteredData: any = originalData.map((item) => {
      const filteredItem: any = Object.keys(item)
        .filter((key) => requiredKeys.includes(key))
        .reduce((obj, key) => {
          const value = item[key];

          if (dateKeys.includes(key)) {
            obj[key] = value ? formatDate(value) : value;
          } else if (floatFormatKeys.includes(key)) {
            obj[key] = ensureFloatFormat(value);
          } else {
            obj[key] = value;
          }

          return obj;
        }, {});

      filteredItem.RAW_EXIST = "Y";
      return filteredItem;
    });

    return filteredData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAreaDropdownData = async (
  dependentFields,
  formState,
  _,
  authState
) => {
  if (!dependentFields) {
    const { data, status } = await AuthSDK.internalFetcher("GETAREALIST", {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      PIN_CODE: dependentFields?.PIN_CODE?.value,
      FLAG: dependentFields?.PIN_CODE?.value ? "P" : "A",
      PARENT_AREA: "",
    });

    if (status == 0) {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ AREA_CD, AREA_NM, ...other }) => {
          return {
            ...other,
            AREA_CD: AREA_CD,
            AREA_NM: AREA_NM,
            label: AREA_NM,
            value: AREA_CD,
          };
        });
      }
      return responseData;
    }
  } else return [];
};
export const getPropertyHolderDetails = async ({ TRAN_CD, COMP_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLEMORTSDT", {
      COMP_CD: COMP_CD,
      TRAN_CD: TRAN_CD,
    });
  if (status === "0") {
    return data.map((item, index) => ({
      ...item,
      UNIQUE_KEY: `${item?.SR_CD}${item?.LINE_ID}`,
      RAW_EXIST: "Y",
      SECURITY_PER:
        item?.SECURITY_PER && !item.SECURITY_PER.toString().includes(".")
          ? `${item.SECURITY_PER}.00`
          : item.SECURITY_PER,
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateFareValueField = async ({
  SANCTION_AMT,
  TOT_SANCTION_AMT,
  FARE_VALUE,
  SUBCNT,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLESECURITYPER", {
      SANCTION_AMT: SANCTION_AMT,
      TOT_SANCTION_AMT: TOT_SANCTION_AMT,
      FARE_VALUE: FARE_VALUE,
      SUBCNT: SUBCNT,
    });
  if (status === "0") {
    return data;
  } else if (status === "999") {
    return {
      status,
      messageDetails,
      message,
    };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateDateField = async ({
  VALUATION_DT,
  PARA_162,
  FLAG,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEEQUITABLEVALTITDT", {
      VALUATION_DT,
      PARA_162,
      FLAG,
      WORKING_DATE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAcctDetail = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  TRAN_CD,
  PARA_162,
  TOT_SANCTION_AMT,
  FARE_VALUE,
  SUBCNT,
  WORKING_DATE,
  USERNAME,
  USERROLE,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLEMORTACDTL", {
      COMP_CD,
      BRANCH_CD,
      ACCT_TYPE,
      ACCT_CD,
      TRAN_CD,
      PARA_162,
      TOT_SANCTION_AMT,
      FARE_VALUE,
      SUBCNT,
      WORKING_DATE,
      USERNAME,
      USERROLE,
      SCREEN_REF,
    });
  if (status === "0") {
    return data;
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
export const getOptionsOnPinParentArea = async (
  pinCode,
  formState,
  _,
  authState
) => {
  if (Boolean(pinCode) && pinCode?.length > 5) {
    const { data, status } = await AuthSDK.internalFetcher("GETAREALIST", {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      PIN_CODE: pinCode,
      FLAG: "P",
      PARENT_AREA: "",
    });

    if (status == 0) {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ AREA_CD, AREA_NM, ...other }) => {
          return {
            ...other,
            AREA_CD: AREA_CD,
            AREA_NM: AREA_NM,
            label: `${AREA_CD}-${AREA_NM}`,
            value: AREA_CD,
          };
        });
      }
      return responseData;
    }
  } else return [];
};
export const getMortgageDetails = async ({ COMP_CD, TRAN_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLEMORTDTL1", {
      COMP_CD,
      TRAN_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CUST_NM, ...items }) => {
        return {
          ...items,
          HOLDER_NM: CUST_NM,
          RAW_EXIST: "Y",
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const ValidateCustomerId = async (...reqdata) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECUSTID", {
      COMP_CD: reqdata?.[1]?.COMP_CD,
      CUST_ID: reqdata?.[1]?.CUST_ID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCustomerId = async (...reqdata) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTIDVAL", {
      COMP_CD: reqdata?.[1]?.COMP_CD,
      CUSTOMER_ID: reqdata?.[1]?.CUSTOMER_ID,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const mergeDetails = (mortgage, holderDetails) => {
  const result = {
    isNewRow: [],
    isUpdatedRow: [],
    isDeleteRow: [],
  };

  const groupBySRCD = (rows) =>
    rows.reduce((acc, row) => {
      const key = row.SR_CD;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

  const holderNewMap = groupBySRCD(holderDetails.isNewRow);
  const holderUpdatedMap = groupBySRCD(holderDetails.isUpdatedRow);

  const removeSRCD = (obj) => {
    const { SR_CD, ...rest } = obj;
    return rest;
  };

  result.isNewRow = mortgage.isNewRow.map((entry) => {
    const { SR_CD, ...restEntry } = entry;
    return {
      ...restEntry,
      PROPERTY_HOLDER_DETAILS: {
        isNewRow: (holderNewMap[SR_CD] || []).map(removeSRCD),
        isUpdatedRow: [],
      },
    };
  });

  result.isUpdatedRow = mortgage.isUpdatedRow.map((entry) => {
    const { SR_CD, ...restEntry } = entry;
    return {
      ...restEntry,
      PROPERTY_HOLDER_DETAILS: {
        isNewRow: [],
        isUpdatedRow: (holderUpdatedMap[SR_CD] || []).map(removeSRCD),
      },
    };
  });

  return result;
};

export const removeKeysFromUpdateRows = (
  propertyDetail,
  keysToRemove,
  newKeys
) => {
  const incomingObj = cloneDeep(propertyDetail);

  // Clean new rows
  incomingObj.isNewRow.forEach((row) => {
    keysToRemove.forEach((key) => {
      if (key !== "ROW_ID" && key !== "SR_CD") {
        delete row[key];
      }
    });
    row["COMP_CD"] = newKeys.COMP_CD;
    row["TRAN_CD"] = newKeys.TRAN_CD;
  });

  // Clean updated rows
  incomingObj.isUpdatedRow = incomingObj.isUpdatedRow
    .map((row) => {
      keysToRemove.forEach((key) => {
        if (key !== "ROW_ID" && key !== "SR_CD") {
          delete row[key];
        }
      });

      row["COMP_CD"] = newKeys.COMP_CD;
      row["TRAN_CD"] = newKeys.TRAN_CD;

      if (row._OLDROWVALUE) {
        keysToRemove.forEach((key) => {
          delete row._OLDROWVALUE[key];
        });
      }

      if (row._UPDATEDCOLUMNS) {
        row._UPDATEDCOLUMNS = row._UPDATEDCOLUMNS.filter(
          (column) => !keysToRemove.includes(column)
        );
      }

      return row;
    })
    .filter((row) => {
      const isOldRowValueEmpty =
        row._OLDROWVALUE &&
        Object.keys(row._OLDROWVALUE).length === 0 &&
        row._OLDROWVALUE.constructor === Object;

      const isUpdatedColumnsEmpty =
        Array.isArray(row._UPDATEDCOLUMNS) && row._UPDATEDCOLUMNS.length === 0;

      // Only keep rows that don't have both empty
      return !(isOldRowValueEmpty && isUpdatedColumnsEmpty);
    });

  return incomingObj;
};

export const saveMortgageEntryData = async (reqdata) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("DOEQUITABLEMORTAGEDML", reqdata);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
