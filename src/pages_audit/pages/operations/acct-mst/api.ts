import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

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
      responseData = responseData.map(({ CATEG_CD, CATEG_NM, ...other }) => {
        return {
          ...other,
          CATEG_CD: CATEG_CD,
          CATEG_NM: CATEG_NM,
          value: CATEG_CD,
          label: CATEG_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAcctModeOptions = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTMODEDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ MODE_CD, MODE_NM, ...other }) => {
        return {
          ...other,
          MODE_CD: MODE_CD,
          CATEG_NM: MODE_NM,
          value: MODE_CD,
          label: MODE_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAccountList = async ({
  A_COMP_CD,
  A_BRANCH_CD,
  SELECT_COLUMN,
}) => {
  let A_PARA: any[] = [];
  Object.keys(SELECT_COLUMN).forEach((fieldKey) => {
    A_PARA.push({
      COL_NM: fieldKey,
      COL_VAL: SELECT_COLUMN[fieldKey],
    });
  });
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SEARCHACCTNO", {
      A_COMP_CD,
      A_BRANCH_CD,
      A_PARA,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCustomerData = async ({
  CUSTOMER_ID,
  ACCT_TYPE,
  COMP_CD,
  SCREEN_REF,
}) => {
  if (Boolean(CUSTOMER_ID)) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCUSTOMERDATA", {
        COMP_CD: COMP_CD,
        ACCT_TYPE: ACCT_TYPE,
        CUSTOMER_ID: CUSTOMER_ID,
        SCREEN_REF: SCREEN_REF,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getPendingAcct = async ({ A_COMP_CD, A_BRANCH_CD, A_FLAG }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETREQACCTLIST", {
      A_COMP_CD,
      A_BRANCH_CD,
      A_FLAG,
    });
  if (status === "0") {
    let responseData = data?.map((row) => {
      if (row?.CONFIRMED === "Y") {
        return { ...row, _rowColor: "rgb(9 132 3 / 51%)" };
      } else if (row?.CONFIRMED === "R") {
        return { ...row, _rowColor: "rgb(152 59 70 / 61%)" };
      } else {
        return { ...row };
      }
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTabsDetail = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_MODE,
  ALLOW_EDIT,
}) => {
  if (!ACCT_TYPE) {
    return [];
  }
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTTAB", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_MODE: ACCT_MODE,
      ALLOW_EDIT: ALLOW_EDIT,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// export const isReadOnlyonParam320 = ({ formState }) => {
//   const PARAM320 = formState?.PARAM320;
//   if (Boolean(PARAM320)) {
//     if (PARAM320 === "Y") {
//       return true;
//     } else if (PARAM320 === "N") {
//       return false;
//     }
//   }
//   return false;
// };

export const isReadOnlyOn320Flag = (fieldName) => {
  if (Boolean(fieldName)) {
    if (fieldName === "Y") {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

export const excludeFDDetailsOnFlag = ({ formState }) => {
  const OPEN_FD = formState?.OPEN_FD;
  if (Boolean(OPEN_FD) && OPEN_FD === "Y") {
    return false;
  }
  return true;
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

export const getTypeofAccountDDW = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTTYPEOFACDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DISP_VAL, DATA_VAL }) => {
        return {
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNomineeGuadianCustData = async ({
  COMP_CD,
  BRANCH_CD,
  CUSTOMER_ID,
  NG_CUSTOMER_ID,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATENOMGUACUSTID", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_ID: CUSTOMER_ID,
      NG_CUSTOMER_ID: NG_CUSTOMER_ID,
      WORKING_DATE: WORKING_DATE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validatePAN = async ({ columnValue, flag }) => {
  const PAN = columnValue?.value ?? columnValue;
  if (PAN) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETPANSTATUS", {
        PAN: PAN ?? "",
      });
    if (status === "0") {
      if (flag === "validate") {
        const PAN_STATUS = data?.[0]?.PAN_STATUS;
        if (PAN_STATUS && PAN_STATUS !== "Y") {
          return "Please Enter Valid PAN Number";
        }
      } else {
        return data;
      }
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};
export const ValidateEmailId = async ({ columnValue, flag }) => {
  const EmailId = columnValue?.value ?? "";
  if (EmailId) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETEMAILSTATUS", {
        EMAIL_ID: EmailId ?? "",
      });
    if (status === "0") {
      if (flag === "Y") {
        const EMAIL_STATUS = data?.[0]?.EMAIL_ID_STATUS;
        if (EMAIL_STATUS && EMAIL_STATUS !== "1") {
          return "PleaseEnterValidEmailID";
        }
      } else {
        return data;
      }
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getMortgageNoData = async ({ COMP_CD, TRAN_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEQUITABLEMORTDATA", {
      COMP_CD: COMP_CD,
      TRAN_CD: TRAN_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// export const getAreaListDDW = async (pinCode, formState, _, authState) => {
//   if (Boolean(pinCode) && pinCode?.length === 6) {
//     const { data, status, message, messageDetails } =
//       await AuthSDK.internalFetcher("GETAREADDW", {
//         COMP_CD: authState.companyID ?? "",
//         BRANCH_CD: authState?.user?.branchCode ?? "",
//       });
//     if (status == 0) {
//       let responseData = data;
//       // Filter the data based on PIN_CODE
//       if (Array.isArray(responseData)) {
//         responseData = responseData.filter((item) => item.PIN_CODE === pinCode);
//         responseData = responseData.map(({ AREA_CD, AREA_NM, ...other }) => {
//           return {
//             ...other,
//             AREA_CD: AREA_CD,
//             AREA_NM: AREA_NM,
//             label: AREA_NM,
//             value: AREA_CD,
//           };
//         });
//       }
//       return responseData;
//     }
//   } else {
//     const { data, status, message, messageDetails } =
//       await AuthSDK.internalFetcher("GETAREADDW", {
//         COMP_CD: authState.companyID ?? "",
//         BRANCH_CD: authState?.user?.branchCode ?? "",
//       });
//     if (status === "0") {
//       let responseData = data;
//       if (Array.isArray(responseData)) {
//         responseData = responseData.map(({ AREA_CD, AREA_NM, ...other }) => {
//           return {
//             ...other,
//             AREA_CD: AREA_CD,
//             AREA_NM: AREA_NM,
//             label: AREA_NM,
//             value: AREA_CD,
//           };
//         });
//       }
//       // formState.setDataOnFieldChange("RES_DATA", responseData);
//       return responseData;
//     } else {
//       throw DefaultErrorObject(message, messageDetails);
//     }
//   }
// };

let cachedAreaData = null;
export const fetchAreaData = async (authState) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETAREADDW", {
      COMP_CD: authState.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ AREA_CD, AREA_NM, ...other }) => ({
        ...other,
        AREA_CD: AREA_CD,
        AREA_NM: AREA_NM,
        label: AREA_NM,
        value: AREA_CD,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const filterAreaDataByPinCode = (responseData, pinCode) => {
  if (pinCode) {
    return responseData.filter((item) => item.PIN_CODE === pinCode);
  }
  return responseData;
};
export const getAreaListDDW = async (pinCode, formState, _, authState) => {
  if (!cachedAreaData) {
    cachedAreaData = await fetchAreaData(authState);
  }
  const filteredData = filterAreaDataByPinCode(cachedAreaData, pinCode);
  return filteredData;
};

export const getPropertyStateDDW = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTATEDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ STATE_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          value: STATE_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPropertyDistrictDDW = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDISTRICTDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DIST_CD, DIST_NM }) => {
        return {
          value: DIST_CD,
          label: DIST_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getMonthlyHouseHoldIncomeDDW = async (TAB_NAME) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMONTHLYHOUSEHOLDINCOME", {
      TAB_NAME: TAB_NAME,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DATA_VAL, DISP_VAL }) => {
        return {
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getMachineryDtlDefaultDW = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDEFAULTDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DATA_VAL, DISP_VAL }) => {
        return {
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAccountDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCOUNTDETAILS", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// get data in Letter of credit button in collateral dtl tab
export const getLetterOfCntGridData = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLCDPDATA", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getNextDisbursementData = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNEXTDISBDATA", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getInterestRate = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  CUSTOMER_ID,
  PARSE_CODE,
  WORKING_DATE,
  SANCTIONED_AMT,
  SANCTION_DT,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETINTERESTRATE", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      ACCT_TYPE: ACCT_TYPE,
      ACCT_CD: ACCT_CD,
      CUSTOMER_ID: CUSTOMER_ID,
      PARSE_CODE: PARSE_CODE,
      WORKING_DATE: WORKING_DATE,
      SANCTIONED_AMT: SANCTIONED_AMT,
      SANCTION_DT: SANCTION_DT,
      SCREEN_REF: SCREEN_REF,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateCurrentTabButtonData = async (apiReq) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOUPDATEMAINTABDTL",
    {
      ...apiReq,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getMortgageTypeOp = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTMORTGAGEDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
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

export const getAdvocateTypeOp = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTADVOCATEDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
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

export const getValuerTypeOp = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTVALUERNMDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
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

export const getGuardianorRelationTypeOp = async ({
  COMP_CD,
  BRANCH_CD,
  CUSTOMER_ID,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTGUARDIANDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_ID: CUSTOMER_ID,
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

export const getNPATypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTNPADDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ NPA_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          NPA_CD: NPA_CD,
          DISPLAY_NM: DISPLAY_NM,
          value: NPA_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSegmentPTSOp = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTPTSDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
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

export const getPurposeTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTPURPOSEDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ PURPOSE_CD, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            PURPOSE_CD: PURPOSE_CD,
            DISPLAY_NM: DISPLAY_NM,
            value: PURPOSE_CD,
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

export const getPrioritParentTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACTPRIORITYPARENTDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ PRIORITY_CD, PRIORITY_NM, ...other }) => {
          return {
            ...other,
            PRIORITY_CD: PRIORITY_CD,
            PRIORITY_NM: PRIORITY_NM,
            value: PRIORITY_CD,
            label: PRIORITY_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPrioritMainTypeOP = async ({
  COMP_CD,
  BRANCH_CD,
  dependentValue,
}) => {
  const PARENT_GROUP = dependentValue?.PARENT_GROUP?.value;
  if (Boolean(PARENT_GROUP)) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETACTPRIORITYMAINDDW", {
        COMP_CD: COMP_CD,
        BRANCH_CD: BRANCH_CD,
        PARENT_GROUP: PARENT_GROUP,
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ PRIORITY_CD, DISPLAY_NM, ...other }) => {
            return {
              ...other,
              PRIORITY_CD: PRIORITY_CD,
              DISPLAY_NM: DISPLAY_NM,
              value: PRIORITY_CD,
              label: DISPLAY_NM,
            };
          }
        );
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } else {
    return [];
  }
};

export const getPriorityWeakerTypeOP = async ({
  COMP_CD,
  BRANCH_CD,
  dependentValue,
}) => {
  const PRIO_CD = dependentValue?.PRIO_CD?.value;
  if (Boolean(PRIO_CD)) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETACTWEAKERSUBPRIODDW", {
        COMP_CD: COMP_CD,
        BRANCH_CD: BRANCH_CD,
        PRIORITY_CD: PRIO_CD,
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ SUB_PRIORITY_CD, DESCRIPTION, DISPLAY_NM, ...other }) => {
            return {
              ...other,
              SUB_PRIORITY_CD: SUB_PRIORITY_CD,
              DESCRIPTION: `${SUB_PRIORITY_CD} ${DESCRIPTION}`,
              value: SUB_PRIORITY_CD,
              label: DISPLAY_NM,
            };
          }
        );
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } else {
    return [];
  }
};

export const getCategoryTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTCATEGORYDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CATEG_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          CATEG_CD: CATEG_CD,
          DISPLAY_NM: DISPLAY_NM,
          value: CATEG_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAgentTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTAGENTDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ AGENT_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          AGENT_CD: AGENT_CD,
          DISPLAY_NM: DISPLAY_NM,
          value: AGENT_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFreezeReasonDDW = async ({ COMP_CD, BRANCH_CD, STATUS }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTSTATUSREASONDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      STATUS: STATUS,
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

export const getRecurringInstallmentDDW = async ({
  COMP_CD,
  BRANCH_CD,
  INSTALLMENT_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECINSTNODDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      INSTALLMENT_TYPE: INSTALLMENT_TYPE,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ INST_NO, PERIOD_NM, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            INST_NO: INST_NO,
            PERIOD_NM: PERIOD_NM,
            value: INST_NO,
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

export const getCurrentTabButtonsData = async ({
  companyID,
  branchCode,
  accountType,
  accountCode,
  columnName,
  workingDate,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACMSTMISCCDTRNDATA", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      ACCT_TYPE: accountType,
      ACCT_CD: accountCode,
      COL_NAME: columnName,
      WORKING_DATE: workingDate,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

interface RiskReqParam {
  COMP_CD: string;
  BRANCH_CD: string;
  FOR_SHARE?: string;
}
export const getRiskCategTypeOP = async (reqObj: RiskReqParam) => {
  const { COMP_CD, BRANCH_CD, FOR_SHARE } = reqObj;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACTRISKCLASSDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      FOR_SHARE: FOR_SHARE ?? "N",
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CLASS_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          CLASS_CD: CLASS_CD,
          DISPLAY_NM: DISPLAY_NM,
          value: CLASS_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getIndustryTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTINDUSTRYDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ INDUSTRY_CODE, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            INDUSTRY_CODE: INDUSTRY_CODE,
            DISPLAY_NM: DISPLAY_NM,
            value: INDUSTRY_CODE,
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

export const getRECRETypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTRECREDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ RENRE_CD, DISPLAY_NM, ...other }) => {
        return {
          ...other,
          RENRE_CD: RENRE_CD,
          DISPLAY_NM: DISPLAY_NM,
          value: RENRE_CD,
          label: DISPLAY_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getBusinessypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTBUSINESSDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ BUSINESS_CD, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            BUSINESS_CD: BUSINESS_CD,
            DISPLAY_NM: DISPLAY_NM,
            value: BUSINESS_CD,
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

export const getAdvDirectorNameTypeOP = async ({ A_ROLE_IND }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDIRECTORLIST", {
      ROLE: A_ROLE_IND,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DIRECTOR_CD, DIRECTOR_NM, ...other }) => {
          return {
            ...other,
            DIRECTOR_CD: DIRECTOR_CD,
            DIRECTOR_NM: DIRECTOR_NM,
            value: DIRECTOR_CD,
            label: DIRECTOR_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getCheqSignAuthoTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACTCHQSIGNAUTHODDW", {
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

export const getIntSkipReasonTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACTINSSKIPREASNDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, DESCRIPTION, ...other }) => {
        return {
          ...other,
          TRAN_CD: TRAN_CD,
          DESCRIPTION: DESCRIPTION,
          value: TRAN_CD,
          label: DESCRIPTION,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSecurityTypeOP = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTSECURITYCDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ SECURITY_CD, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            SECURITY_CD: SECURITY_CD,
            DISPLAY_NM: DISPLAY_NM,
            value: SECURITY_CD,
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

export const getCollateralSecurityDataDDW = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITSECMSTDDDW", { ...reqData });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_NM, SECURITY_CD, ...other }) => {
          return {
            value: SECURITY_CD,
            label: DISPLAY_NM,
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

export const getJointCreditWorthinessData = async ({
  A_WORKING_DATE,
  A_COMP_CD,
  A_BRANCH_CD,
  A_ACCT_TYPE,
  A_ACCT_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTMSTJOINTABCREDWORTH", {
      A_COMP_CD: A_COMP_CD,
      A_BRANCH_CD: A_BRANCH_CD,
      A_ACCT_TYPE: A_ACCT_TYPE,
      A_ACCT_CD: A_ACCT_CD,
      A_WORKING_DATE: A_WORKING_DATE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// for relative dtl marital status field only
export const getMaritalStatusOP = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMARITALSTATUSDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...other }) => {
          return {
            ...other,
            DISPLAY_VALUE: DISPLAY_VALUE,
            DATA_VALUE: DATA_VALUE,
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

// retrieving document medatory docs in grid for new entry
export const getKYCDocumentGridData = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  CONSTITUTION_TYPE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDOCTEMPLATEDTL", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_TYPE: null,
      ACCT_TYPE: ACCT_TYPE ?? null,
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

export const getCustDocumentOpDtl = async ({
  COMP_CD,
  BRANCH_CD,
  CUSTOMER_TYPE,
  formState,
}) => {
  const { gridData, rowsData } = formState;
  // console.log("qekuwhdiuwehdw", formState)
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
  // console.log(gridData, "auedhniuwehdwe", formMode)
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTDOCUMENT", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      CUSTOMER_TYPE: CUSTOMER_TYPE,
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
    // console.log("auedhniuwehdwe  qwed", data)
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, SR_CD, ...other }) => {
        // if(selectedDoc.includes(SR_CD)) {

        // } else {
        return {
          ...other,
          DESCRIPTION: DESCRIPTION,
          SR_CD: SR_CD,
          label: DESCRIPTION,
          value: SR_CD,
        };
        // }
        // }
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// export const validateNewAcct = async (reqData) => {
//   const { IsNewRow, formData, SCREEN_REF } = reqData;
//   console.log(" validate reqdata", formData);

//   const jointTabs = [
//     "JOINT_HOLDER_DTL",
//     "JOINT_NOMINEE_DTL",
//     "JOINT_GUARDIAN_DTL",
//     "JOINT_GUARANTOR_DTL",
//     "JOINT_HYPOTHICATION_DTL",
//     "JOINT_SIGNATORY_DTL",
//     "JOINT_INTRODUCTOR_DTL",
//   ];
//   let JOINT_ACCOUNT_DTL: any[] = [];
//   jointTabs.forEach((jointTab) => {
//     if (Object.hasOwn(formData, jointTab)) {
//       JOINT_ACCOUNT_DTL = [...JOINT_ACCOUNT_DTL, ...formData[jointTab]];
//     }
//   });
//   // Map DOC_MST if exists
//   let docPayload = formData["DOC_MST"]?.doc_mst_payload;
//   if (docPayload) {
//     docPayload = docPayload.map((row) => ({
//       VALID_UPTO: format(new Date(row?.VALID_UPTO), "dd/MMM/yyyy") ?? "",
//       DOC_TYPE: row?.DOC_TYPE,
//       TEMPLATE_CD: row?.TEMPLATE_CD ?? "",
//       DOC_WEIGHTAGE: row?.DOC_WEIGHTAGE ?? "",
//       ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
//       DOC_NO: row?.DOC_NO ?? "",
//       DOC_AMOUNT: row?.DOC_AMOUNT ?? "",
//       SUBMIT: row?.SUBMIT ?? "",
//     }));
//   }
//   let mainDetails = formData["MAIN_DETAIL"];
//   if (mainDetails) {
//     ["HANDICAP_FLAG", "MOBILE_REG", "SALARIED", "INT_SKIP_FLAG"].forEach(
//       (key) =>
//         (mainDetails[key] =
//           mainDetails[key] === true || mainDetails[key] === "Y" ? "Y" : "N")
//     );
//   }
//   const payload = {
//     IsNewRow,
//     SCREEN_REF,
//     JOINT_ACCOUNT_DTL,
//     MAIN_DETAIL: { ...mainDetails },
//     DOC_MST: docPayload ?? [],
//   };
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcher("VALIDATEACCOUNTDTL", payload);
//   if (status === "0") {
//     return data;
//   } else {
//     throw DefaultErrorObject(message, messageDetails);
//   }
// };
export const validateNewAcct = async (reqData) => {
  const {
    IsNewRow,
    formData,
    SCREEN_REF,
    COMP_CD,
    BRANCH_CD,
    ACCT_TYPE,
    oldData,
    oldDocData,
    oldJointData,
    updated_tab_format,
    REQ_CD,
    NEW_REQ_DATA,
    mainIntialVals,
    deepRemoveKeysIfExist,
    docObj,
  } = reqData;
  const jointTabs = [
    "JOINT_HOLDER_DTL",
    "JOINT_NOMINEE_DTL",
    "JOINT_GUARDIAN_DTL",
    "JOINT_GUARANTOR_DTL",
    "JOINT_HYPOTHICATION_DTL",
    "JOINT_SIGNATORY_DTL",
    "JOINT_INTRODUCTOR_DTL",
  ];
  let JointDetailsData: any[] = [];
  jointTabs.forEach((jointTab) => {
    if (Object.hasOwn(formData, jointTab)) {
      JointDetailsData = [
        ...JointDetailsData,
        ...formData[jointTab].map((item: any) => ({
          ...item,
          // ACTIVE_FLAG: "Y",
          ACTIVE_FLAG:
            item?.ACTIVE === true || item?.ACTIVE === "Y" ? "Y" : "N",
        })),
      ];
    }
  });
  const removedKeysJointData = deepRemoveKeysIfExist(JointDetailsData, "JOINT");
  if (Boolean(IsNewRow)) {
    let docPayload = docObj;
    if (docPayload?.length > 0) {
      docPayload = docPayload.map((row) => ({
        ...row,
        VALID_UPTO: Boolean(row?.VALID_UPTO)
          ? format(utilFunction.getParsedDate(row?.VALID_UPTO), "dd/MMM/yyyy")
          : "",
        DOC_TYPE: row?.DOC_TYPE,
        TEMPLATE_CD: row?.TEMPLATE_CD ?? "",
        DOC_WEIGHTAGE: row?.DOC_WEIGHTAGE ?? "",
        ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
        DOC_NO: row?.DOC_NO ?? "",
        DOC_AMOUNT: row?.DOC_AMOUNT ?? "",
        SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
        IsNewRow: row?._isNewRow ?? "",
      }));
    }
    let mainDetails = formData["MAIN_DETAIL"];
    if (mainDetails) {
      // ["HANDICAP_FLAG", "MOBILE_REG", "SALARIED", "INT_SKIP_FLAG"].forEach(
      //   (field) =>
      //     (mainDetails[field] =
      //       mainDetails[field] === true || mainDetails[field] === "Y" ? "Y" : "N")
      // );
      ["HANDICAP_FLAG", "MOBILE_REG", "SALARIED", "INT_SKIP_FLAG"].forEach(
        (field) => {
          mainDetails[field] =
            typeof mainDetails[field] === "boolean"
              ? Boolean(mainDetails[field])
                ? "Y"
                : "N"
              : Boolean(mainDetails[field])
              ? mainDetails[field]
              : "N";
        }
      );
    }
    const mainTabDetails = { ...mainIntialVals, ...mainDetails };
    const removedKeysMainData = deepRemoveKeysIfExist(mainTabDetails, "MAIN");
    const payload = {
      IsNewRow,
      SCREEN_REF,
      ...NEW_REQ_DATA,
      JOINT_ACCOUNT_DTL: [...removedKeysJointData],
      MAIN_DETAIL: { ...removedKeysMainData },
      DOC_MST: docPayload ?? [],
    };
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("VALIDATEACCOUNTDTL", payload);
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } else if (!Boolean(IsNewRow)) {
    let jointTabPayload = oldJointData;
    if (jointTabPayload) {
      jointTabPayload = jointTabPayload.map((row) => ({
        J_TYPE: row?.J_TYPE ?? "",
        CUSTOMER_ID: row?.CUSTOMER_ID ?? "",
        REF_PERSON_NAME: row?.REF_PERSON_NAME ?? "",
        MORT_AMT: row?.MORT_AMT ?? "",
        SR_CD: row?.SR_CD ?? "",
        SHARE_PER: row?.SHARE_PER ?? "",
        NG_CUSTOMER_ID: row?.NG_CUSTOMER_ID ?? "",
        BIRTH_DATE: Boolean(row?.BIRTH_DATE)
          ? format(utilFunction.getParsedDate(row?.BIRTH_DATE), "dd/MMM/yyyy")
          : "",
        NG_RELATION: row?.NG_RELATION ?? "",
        NG_NAME: row?.NG_NAME ?? "",
      }));
    }
    const dateFields: string[] = [
      "BIRTH_DT",
      "UDYAM_REG_DT",
      "APPLY_DT",
      "CLOSE_DT",
      "DATE_OF_DEATH",
      "DATE_OF_COMMENCEMENT",
      "DATE_OF_RETIREMENT",
      "DISBURSEMENT_DT",
      "ENTERED_DATE",
      "INST_DUE_DT",
      "INS_START_DT",
      "LAST_MODIFIED_DATE",
      "LST_STATEMENT_DT",
      "LST_INT_COMPUTE_DT",
      "LST_INT_APPLY_DT",
      "OP_DATE",
      "VERIFIED_DATE",
      "UDYAM_REG_DT",
      "SANCTION_DT",
    ];
    dateFields.forEach((field) => {
      if (Object.hasOwn(oldData, field)) {
        oldData[field] = Boolean(oldData[field])
          ? format(utilFunction.getParsedDate(oldData[field]), "dd-MMM-yyyy")
          : "";
      }
    });
    [
      "SALARIED",
      "HANDICAP_FLAG",
      "MOBILE_REG",
      "INT_SKIP_FLAG",
      "MOBILE_REG_FLAG",
      "SELF_EMPLOYED",
    ].forEach((field) => {
      oldData[field] =
        typeof oldData[field] === "boolean"
          ? Boolean(oldData[field])
            ? "Y"
            : "N"
          : Boolean(oldData[field])
          ? oldData[field]
          : "N";
    });

    let oldDocPayload = oldDocData;
    // console.log("uhwfueifhiwfewfwf myrmyr", oldDocData);
    if (oldDocPayload) {
      oldDocPayload = oldDocPayload.map((row) => ({
        DOC_AMOUNT: row?.DOC_AMOUNT ?? "",
        DOC_TYPE: row?.DOC_TYPE ?? "",
        DOC_NO: row?.DOC_NO ?? "",
        DOC_WEIGHTAGE: row?.DOC_WEIGHTAGE ?? "",
        VALID_UPTO: Boolean(row?.VALID_UPTO)
          ? format(utilFunction.getParsedDate(row?.VALID_UPTO), "dd/MMM/yyyy")
          : "",
        TEMPLATE_CD: row?.TEMPLATE_CD ?? "",
        ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
        SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
        SR_CD: row?.SR_CD ?? "",
        TRAN_CD: row?.TRAN_CD ?? "",
      }));
    }
    let newMainDetail = updated_tab_format?.MAIN_DETAIL;
    if (newMainDetail) {
      newMainDetail = updated_tab_format?.MAIN_DETAIL;
    } else {
      // Implement Empty request for main tab while update
      newMainDetail = {
        _UPDATEDCOLUMNS: [],
        _OLDROWVALUE: {},
        IsNewRow: false,
        COMP_CD: COMP_CD,
        BRANCH_CD: BRANCH_CD,
        ACCT_TYPE: ACCT_TYPE,
        ACCT_CD: NEW_REQ_DATA?.ACCT_CD,
        REQ_CD: REQ_CD,
      };
    }
    let newDocPayload = updated_tab_format?.DOC_MST;
    if (newDocPayload) {
      newDocPayload = newDocPayload.map((row) => ({
        // ...row,
        DOC_AMOUNT: row?.DOC_AMOUNT ?? "",
        DOC_TYPE: row?.DOC_TYPE ?? "",
        DOC_NO: row?.DOC_NO ?? "",
        TRAN_CD: row?.TRAN_CD ?? "",
        DOC_WEIGHTAGE: row?.DOC_WEIGHTAGE ?? "",
        VALID_UPTO: Boolean(row?.VALID_UPTO)
          ? format(utilFunction.getParsedDate(row?.VALID_UPTO), "dd/MMM/yyyy")
          : "",
        TEMPLATE_CD: row?.TEMPLATE_CD ?? "",
        ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
        SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
        SR_CD: row?.SR_CD ?? "",
        REQ_CD: REQ_CD ?? "",
        IsNewRow: row?._isDeleteRow ? true : false,
        _UPDATEDCOLUMNS: row?._UPDATEDCOLUMNS,
        _OLDROWVALUE: row?._OLDROWVALUE,
        DETAILS_DATA: row?.DETAILS_DATA,
      }));
    }
    // when their is not data in doc so not share new Update requerst
    // else {
    //   newDocPayload = [
    //     {
    //       _UPDATEDCOLUMNS: [],
    //       _OLDROWVALUE: {},
    //       IsNewRow: false,
    //       COMP_CD: COMP_CD,
    //       IS_FROM_MAIN: "N",
    //       NEW_FLAG: "N",
    //       BRANCH_CD: BRANCH_CD,
    //       ACCT_TYPE: ACCT_TYPE,
    //     },
    //   ];
    // }.
    const allNewRows =
      updated_tab_format?.JOINT_ACCOUNT_DTL?.flatMap((item) => item.isNewRow) ||
      [];
    const mappedNewRows = allNewRows?.map((row) => ({
      J_TYPE: row?.J_TYPE ?? "",
      CUSTOMER_ID: row?.CUSTOMER_ID ?? "",
      REF_PERSON_NAME: row?.REF_PERSON_NAME ?? "",
      MORT_AMT: row?.MORT_AMT ?? "",
      SR_CD: row?.SR_CD ?? "",
      SHARE_PER: row?.SHARE_PER ?? "",
      NG_CUSTOMER_ID: row?.NG_CUSTOMER_ID ?? "",
      BIRTH_DATE: Boolean(row?.BIRTH_DATE)
        ? format(utilFunction.getParsedDate(row?.BIRTH_DATE), "dd/MMM/yyyy")
        : "",
      NG_RELATION: row?.NG_RELATION ?? "",
      NG_NAME: row?.NG_NAME ?? "",
    }));
    const mergedPayload = [...(jointTabPayload || []), ...mappedNewRows];

    const allDocNewRows =
      updated_tab_format?.DOC_MST?.filter((row) => row?._isNewRow === true) ||
      [];

    const mappedNewDocData = allDocNewRows.map((row) => ({
      DOC_AMOUNT: row?.DOC_AMOUNT ?? "",
      DOC_TYPE: row?.DOC_TYPE ?? "",
      DOC_NO: row?.DOC_NO ?? "",
      DOC_WEIGHTAGE: row?.DOC_WEIGHTAGE ?? "",
      VALID_UPTO: Boolean(row?.VALID_UPTO)
        ? format(utilFunction.getParsedDate(row?.VALID_UPTO), "dd/MMM/yyyy")
        : "",
      TEMPLATE_CD: row?.TEMPLATE_CD ?? "",
      ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
      SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
      SR_CD: row?.SR_CD ?? "",
      TRAN_CD: row?.TRAN_CD ?? "",
    }));

    const mergedDocPayload = [...(oldDocPayload || []), ...mappedNewDocData];

    let payload = {
      IsNewRow,
      SCREEN_REF,
      ...NEW_REQ_DATA,
      OLD_MAIN_DATA: oldData ?? {},
      OLD_DOCUMENT_DATA: mergedDocPayload ?? [],
      OLD_JOINT_DATA: mergedPayload ?? [],
      MAIN_DETAIL: newMainDetail,
      DOC_MST: newDocPayload, /// get an error related to IsNewRow Not found
    };
    if (Object.hasOwn(updated_tab_format, "JOINT_ACCOUNT_DTL")) {
      payload["JOINT_ACCOUNT_DTL"] = updated_tab_format?.JOINT_ACCOUNT_DTL;
    }
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("VALIDATEACCOUNTDTL", payload);
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const accountSave = async (reqData) => {
  const {
    IsNewRow,
    REQ_CD,
    REQ_FLAG,
    SAVE_FLAG,
    CUSTOMER_ID,
    ACCT_TYPE,
    ACCT_CD,
    COMP_CD,
    BRANCH_CD,
    formData,
    OP_DATE,
    SCREEN_REF,
    mainIntialVals,
    btnData,
    deepRemoveKeysIfExist,
  } = reqData;

  // console.log("wefhiwheifhweihf", formData)
  const jointTabs = [
    "JOINT_HOLDER_DTL",
    "JOINT_NOMINEE_DTL",
    "JOINT_GUARDIAN_DTL",
    "JOINT_GUARANTOR_DTL",
    "JOINT_HYPOTHICATION_DTL",
    "JOINT_SIGNATORY_DTL",
    "JOINT_INTRODUCTOR_DTL",
  ];

  let payload = {};

  let joint_account_dtl: any[] = [];
  if (Object.keys(formData)?.length > 0) {
    Object.keys(formData).forEach(async (tab: string) => {
      if (jointTabs.includes(tab)) {
        joint_account_dtl = [...joint_account_dtl, ...formData[tab]];
      } else if (tab === "DOC_MST") {
        payload[tab] = formData[tab]?.doc_mst_payload?.map((row) => ({
          ...row,
          VALID_UPTO: Boolean(row?.VALID_UPTO)
            ? format(utilFunction.getParsedDate(row?.VALID_UPTO), "dd/MMM/yyyy")
            : "",
          DOC_TYPE: row?.DOC_TYPE,
          TEMPLATE_CD: row?.TEMPLATE_CD ?? "",
          DOC_WEIGHTAGE: row?.DOC_WEIGHTAGE ?? "",
          ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
          DOC_NO: row?.DOC_NO ?? "",
          DOC_AMOUNT: row?.DOC_AMOUNT ?? "",
          SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
          IsNewRow: row?._isNewRow ?? "",
        }));
      } else if (tab === "MAIN_DETAIL") {
        const mainTabDetails = {
          ...mainIntialVals,
          ...formData["MAIN_DETAIL"],
          COMP_CD: COMP_CD ?? "",
          BRANCH_CD: BRANCH_CD ?? "",
          OP_DATE,
        };
        const removedKeysMainData = deepRemoveKeysIfExist(
          mainTabDetails,
          "MAIN"
        );
        payload["MAIN_DETAIL"] = {
          ...removedKeysMainData,
        };
      } else {
        payload[tab] = formData[tab];
      }
    });
    const removedKeysJointData = deepRemoveKeysIfExist(
      joint_account_dtl,
      "JOINT"
    );
    payload["JOINT_ACCOUNT_DTL"] = removedKeysJointData?.map((row) => ({
      ...row,
      IsNewRow: IsNewRow,
      ACTIVE: row.ACTIVE === true || row.ACTIVE === "Y" ? "Y" : "N",
    }));
    const removedKeysOtherAddressData = deepRemoveKeysIfExist(
      formData?.OTHER_ADDRESS_DTL,
      "JOINT"
    );
    payload["OTHER_ADDRESS_DTL"] = removedKeysOtherAddressData?.map((row) => ({
      ...row,
      ACCT_TYPE,
    }));
    payload["MOBILE_REG_DTL"] = formData?.MOBILE_REG_DTL?.map((row) => ({
      ...row,
      MOBILE_REG_FLAG:
        row.MOBILE_REG_FLAG === true || row.MOBILE_REG_FLAG === "Y" ? "Y" : "N",
    }));
    const removedKeysRelativeDeatilsData = deepRemoveKeysIfExist(
      formData?.RELATIVE_DTL,
      "JOINT"
    );
    payload["RELATIVE_DTL"] = removedKeysRelativeDeatilsData?.map((row) => ({
      ...row,
      SALARIED: row.SALARIED === true || row.SALARIED === "Y" ? "Y" : "N",
      SELF_EMPLOYED:
        row.SELF_EMPLOYED === true || row.SELF_EMPLOYED === "Y" ? "Y" : "N",
    }));
    const btnDataList = btnData
      ? [btnData?.["TERMLOAN_BTN_MAC"], btnData?.["TERMLOAN_BTN_VEH"]].filter(
          (obj) => obj && Object.keys(obj).length > 0
        )
      : [];
    if (btnDataList.length > 0) {
      payload["TERMLOAN_BTN_DTL"] = btnDataList;
    }
    const ornamentBtnData = Array.isArray(btnData?.["ORNAMENT_BUTTON_DTL"])
      ? btnData["ORNAMENT_BUTTON_DTL"].filter(
          (obj) => obj && Object.keys(obj).length > 0
        )
      : [];
    if (ornamentBtnData.length > 0) {
      payload["ORNAMENT_BUTTON_DTL"] = ornamentBtnData;
    }
    const ENTRY_TYPE = "1";
    payload = {
      ...payload,
      SCREEN_REF,
      IsNewRow,
      REQ_CD,
      REQ_FLAG,
      SAVE_FLAG,
      CUSTOMER_ID,
      ACCT_TYPE,
      ACCT_CD,
      COMP_CD,
      BRANCH_CD,
      ENTRY_TYPE,
    };
    // console.log("AcctMSTContextwadqwdwq. woiuioehfiuwhefwef", payload)
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("SAVEACCOUNTDATA", payload);
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const accountModify = async (reqData) => {
  // console.log("account-modify asdasdasd", reqData)
  const {
    IsNewRow,
    REQ_CD,
    REQ_FLAG,
    SAVE_FLAG,
    CUSTOMER_ID,
    ACCT_TYPE,
    ACCT_CD,
    COMP_CD,
    BRANCH_CD,
    formData,
    updated_tab_format,
    OP_DATE,
  } = reqData;
  let payload = {};
  const dateFields = [
    "LC_START_DT",
    "LC_DUE_DT",
    "ENTERED_DATE",
    "EVENT_DT",
    "BIRTH_DATE",
    "VALUATION_DT",
    "TITLE_CLEAR_DT",
    "SANCTION_DT",
    "NPA_DT",
    "INST_DUE_DT",
    "RATE_WEF",
    "LST_INT_COMPUTE_DT",
    "DATE_OF_COMMENCEMENT",
    "OP_DATE",
    "LAST_INST_DT",
    "BIRTH_DT",
    "DATE_OF_RETIREMENT",
    "DATE_OF_DEATH",
    "UDYAM_REG_DT",
    "CLOSE_DT",
    "INS_START_DT",
    "DATE_OF_BIRTH",
    "APPLY_DT",
    "DISBURSEMENT_DT",
    "FROM_EFF_DATE",
    "TO_EFF_DATE",
    "VERIFIED_DATE",
    "LAST_MODIFIED_DATE",
    "VALID_UPTO",
  ];

  const isObject = (val: any) =>
    val && typeof val === "object" && !Array.isArray(val);

  const formatDate = (value: any) => {
    try {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return format(parsed, "yyyy-MM-dd HH:mm:ss.S");
      }
    } catch (err) {}
    return value;
  };

  const formatDatesRecursively = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(formatDatesRecursively);
    } else if (isObject(data)) {
      const formatted: any = {};
      for (const key in data) {
        if (dateFields.includes(key)) {
          formatted[key] = data[key] ? formatDate(data[key]) : "";
        } else if (
          key === "isNewRow" ||
          key === "isUpdatedRow" ||
          key === "isDeleteRow"
        ) {
          formatted[key] = Array.isArray(data[key])
            ? data[key].map(formatDatesRecursively)
            : formatDatesRecursively(data[key]);
        } else {
          formatted[key] = formatDatesRecursively(data[key]);
        }
      }
      return formatted;
    } else {
      return data;
    }
  };
  const updatedData = await formatDatesRecursively(updated_tab_format);
  const ENTRY_TYPE = "";
  payload = {
    ...payload,
    IsNewRow,
    REQ_CD,
    REQ_FLAG,
    SAVE_FLAG,
    CUSTOMER_ID,
    ACCT_TYPE,
    ACCT_CD,
    COMP_CD,
    BRANCH_CD,
    ENTRY_TYPE: ENTRY_TYPE,
    ...updatedData,
  };
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVEACCOUNTDATA", payload);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const confirmAccount = async ({ REQUEST_CD, REMARKS, CONFIRMED }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CONFIRMACCTDATA", {
      REQUEST_CD: REQUEST_CD,
      REMARKS: REMARKS,
      CONFIRMED: CONFIRMED,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const advConfCodeDD = async (payload) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETADVCONFIGCODEDDDW", { ...payload });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_NM, ...other }) => {
          return {
            ...other,
            value: DATA_VALUE.trim(),
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

export const advConfDefDD = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETADVCONFIGDEFINITION", { ...apiReq });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DATA_VAL, DISP_VAL, ...other }) => {
        return {
          ...other,
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const advConfDocdtl = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETADVCONFIGPARADOCDTL", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getOtherSecurityBtnDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMORTSECURITYDATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLimitSecDTL = async ({ COMP_CD, BRANCH_CD, SECURITY_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITSECDTLDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      SECURITY_CD: SECURITY_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DESCRIPTION, SR_CD, ...others }) => {
        return {
          ...others,
          value: SR_CD,
          label: DESCRIPTION,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDPIDDdw = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDPIDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DP_NAME, DP_ID, ...others }) => {
        return {
          ...others,
          value: DP_ID,
          label: DP_NAME,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getScriptDdw = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSCRIPTDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ SCRIPT_NM, SCRIPT_CD, ...others }) => {
          return {
            ...others,
            value: SCRIPT_CD,
            label: SCRIPT_NM,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const otherSecurityDTL = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSECURITYTYPEDTLDML", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getShareMemCardDdw = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSHAREMEMCARDDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...others }) => {
          return {
            ...others,
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

export const validateANCAMT = async ({
  COMP_CD,
  BRANCH_CD,
  ACCT_TYPE,
  ACCT_CD,
  CUSTOMER_ID,
  CATEG_CD,
  PURPOSE_CD,
  PTS,
  INT_RATE_BASE_ON,
  SHARE_ACCT_TYPE,
  SHARE_ACCT_CD,
  APPLIED_AMT,
  LIMIT_AMOUNT,
  SANCTIONED_AMT,
  SANCTION_DT,
  RECOMMENED_NM,
  WORKING_DATE,
  SCREEN_REF,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESANCAMT", {
      COMP_CD,
      BRANCH_CD,
      ACCT_TYPE,
      ACCT_CD,
      CUSTOMER_ID,
      CATEG_CD,
      PURPOSE_CD,
      PTS,
      INT_RATE_BASE_ON,
      SHARE_ACCT_TYPE,
      SHARE_ACCT_CD,
      APPLIED_AMT,
      LIMIT_AMOUNT,
      SANCTIONED_AMT,
      SANCTION_DT,
      RECOMMENED_NM,
      WORKING_DATE,
      SCREEN_REF,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// URNUAN format validation api
export const getUdyamRegNoStatus = async (UDYAMVal) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETUDYAMREGNOSTATUS", {
      UDYAMNO: UDYAMVal,
    });
  if (status === "0") {
    const UDYAM_STATUS = data?.[0]?.UDYAM_STATUS;
    if (Boolean(UDYAM_STATUS)) {
      return UDYAM_STATUS;
    }
    return "";
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getRecAcDetails = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let CategCd =
    fieldName === "CATEG_CD"
      ? currField?.value
      : dependentFields?.CATEG_CD?.value;
  let InsStartDate =
    fieldName === "INS_START_DT"
      ? currField?.value
      : dependentFields?.INS_START_DT?.value;
  let formattedInsStartDate = Boolean(InsStartDate)
    ? format(utilFunction.getParsedDate(InsStartDate), "dd/MMM/yyyy")
    : "";
  let InstallmentType =
    fieldName === "INSTALLMENT_TYPE"
      ? currField?.value
      : dependentFields?.INSTALLMENT_TYPE?.value;
  let InstNo =
    fieldName === "INST_NO"
      ? currField?.value
      : dependentFields?.INST_NO?.value;
  let InstRs =
    fieldName === "INST_RS"
      ? currField?.value
      : dependentFields?.INST_RS?.value;
  let IntRate = fieldName === "INT_RATE" ? currField?.value : "0";
  const Condition = formState?.ACCT_TYPE_CONDITION?.[0]?.TAB_NAME;
  if (Condition === "REC" || Condition === "RECD") {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETRECACDETAIL", {
        COMP_CD: auth?.companyID ?? "",
        BRANCH_CD: auth?.user?.branchCode ?? "",
        ACCT_TYPE: formState?.ACCT_TYPE ?? "",
        CATEG_CD: CategCd ?? "",
        INS_START_DT: formattedInsStartDate ?? "",
        INSTALLMENT_TYPE: InstallmentType ?? "",
        INST_NO: InstNo ?? "",
        INST_RS: InstRs ?? "",
        INT_RATE: IntRate ?? "",
        WORKING_DATE: auth?.workingDate ?? "",
      });
    if (status === "0") {
      return {
        INST_DUE_DT: {
          value: data?.[0]?.INST_DUE_DT,
          ignoreUpdate: true,
        },
        DUE_AMT: {
          value: data?.[0]?.DUE_AMT,
          ignoreUpdate: true,
        },
        INT_RATE: {
          value: data?.[0]?.INT_RATE,
          ignoreUpdate: true,
        },
        PENAL_RATE: {
          value: data?.[0]?.PENAL_RATE,
          ignoreUpdate: true,
        },
      };
    } else {
      return {
        [fieldName]: {
          value: "",
          error: message ?? "",
          ignoreUpdate: true,
        },
        INST_DUE_DT: {
          value: "",
          ignoreUpdate: true,
        },
        DUE_AMT: {
          value: "",
          ignoreUpdate: true,
        },
        INT_RATE: {
          value: "",
          ignoreUpdate: true,
        },
        PENAL_RATE: {
          value: "",
          ignoreUpdate: true,
        },
      };
    }
  } else {
    return {};
  }
};

export const validateDisbDT = async ({
  COMP_CD,
  BRANCH_CD,
  DISBURSEMENT_DT,
  SANCTION_DT,
  WORKING_DATE,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEDISBDT", {
      COMP_CD: COMP_CD ?? "",
      BRANCH_CD: BRANCH_CD ?? "",
      DISBURSEMENT_DT: DISBURSEMENT_DT ?? "",
      SANCTION_DT: SANCTION_DT ?? "",
      WORKING_DATE: WORKING_DATE ?? "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateApplyDT = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEAPPLYDT", { ...req });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateSanctionDT = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESANCTIONDT", { ...req });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getEmi = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEMI", { ...req });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateInstNo = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEINSTNO", { ...req });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateShareMemAcct = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESHAREMEMACCT", { ...reqData });
  if (status === "0") {
    let responseData = data;
    return responseData[0];
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAcctClose = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCOUNTTOCLOSE", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateAcctReOpen = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCOUNTTOREOPEN", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAcctUpdateDTL = async (reportId, _, reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(reportId, reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

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

export const getPMISCData = async (CATEGORY_CD) => {
  let payload = {
    CATEGORY_CD: CATEGORY_CD,
  };
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", payload);
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
            // DATA_VALUE: DATA_VALUE,
            // DISPLAY_VALUE: DISPLAY_VALUE,
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
        STD_CD: STD_CD,
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

export const getRiskCateg = async ({ CALLFROM }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRISKCATEGDDDW", { CALLFROM });
  if (status === "0") {
    let responseData = data;
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
export const getPeriodDDWData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPERIODLIST", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DESCR, PERIOD_CD, DEFAULT_VALUE }) => {
          return {
            value: PERIOD_CD,
            label: DESCR,
            tenorDefaultVal: DEFAULT_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getMatureInstDDWData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMATUREINSTDTL", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ MATURE_INST, DESCRIPTION, DEFAULT_VALUE, ...other }) => {
          return {
            value: MATURE_INST,
            label: DESCRIPTION,
            matureInstDefaultVal: DEFAULT_VALUE,
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
export const getFDIntRate = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let periodCode =
    fieldName === "INSTALLMENT_TYPE"
      ? currField?.value
      : dependentFields?.INSTALLMENT_TYPE?.value;
  let periodNo =
    fieldName === "INST_NO"
      ? currField?.value
      : dependentFields?.INST_NO?.value;
  let cashAmt =
    fieldName === "APPLIED_AMT"
      ? currField?.value
      : dependentFields?.APPLIED_AMT?.value;
  let transAmt =
    fieldName === "SANCTIONED_AMT"
      ? currField?.value
      : dependentFields?.SANCTIONED_AMT?.value;

  let principalAmt = Number(cashAmt) + Number(transAmt);
  if (currField?.value) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETFDINTRATE", {
        COMP_CD: auth?.companyID ?? "",
        BRANCH_CD: formState?.BRANCH_CD
          ? formState?.BRANCH_CD
          : auth?.user?.branchCode ?? "",
        ACCT_TYPE: formState?.ACCT_TYPE ?? "",
        ACCT_CD: formState?.ACCT_CD ?? "",
        CATEG_CD: dependentFields?.CATEG_CD?.value ?? "",
        TRAN_DT: Boolean(formState?.TRAN_DT)
          ? format(
              utilFunction.getParsedDate(formState?.TRAN_DT),
              "dd-MMM-yyyy"
            )
          : "",
        TRSF_AMT: transAmt ?? "",
        PERIOD_CD: periodCode ?? "",
        PERIOD_NO: periodNo ?? "",
        MATURITY_DT: "",
        PRE_INT_FLAG: "N",
        PRINCIPAL_AMT: String(principalAmt),
      });
    if (status === "0") {
      return {
        INT_RATE: {
          value: parseFloat(data?.[0]?.INT_RATE ?? "")?.toFixed(2),
        },
        INST_DUE_DT: {
          value: data?.[0]?.MATURITY_DT ?? "",
        },
      };
    } else {
      let buttonName = await formState?.MessageBox({
        messageTitle: "Error",
        message: message || "Unknownerroroccured",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });

      if (buttonName === "Ok") {
        return {
          [fieldName]: {
            value: "",
            error: message ?? "",
            ignoreUpdate: true,
          },
          INT_RATE: {
            value: "",
            ignoreUpdate: true,
          },
          MATURITY_DT: {
            value: "",
            ignoreUpdate: true,
          },
        };
      }
    }
  } else {
    return {};
  }
};

export const getFDMaturityAmt = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let termCd =
    fieldName === "INT_TYPE"
      ? currField?.value
      : dependentFields?.INT_TYPE?.value ?? "";
  let intRate =
    fieldName === "INT_RATE"
      ? currField?.value
      : dependentFields?.INT_RATE?.value ?? "";
  let principalAmt =
    Number(dependentFields?.APPLIED_AMT?.value ?? 0) +
    Number(dependentFields?.SANCTIONED_AMT?.value ?? 0);

  if (currField?.value) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETFDMATURITYAMT", {
        COMP_CD: auth?.companyID ?? "",
        BRANCH_CD: formState?.BRANCH_CD
          ? formState?.BRANCH_CD
          : auth?.user?.branchCode ?? "",
        ACCT_TYPE: formState?.ACCT_TYPE ?? "",
        ACCT_CD: formState?.ACCT_CD ?? "",
        CATEG_CD: dependentFields?.CATEG_CD?.value ?? "",
        PERIOD_CD: dependentFields?.INSTALLMENT_TYPE?.value ?? "",
        PERIOD_NO: dependentFields?.INST_NO?.value ?? "",
        MATURITY_DT: Boolean(dependentFields?.INST_DUE_DT?.value)
          ? format(
              utilFunction.getParsedDate(dependentFields?.INST_DUE_DT?.value),
              "dd-MMM-yyyy"
            )
          : "",
        PRE_INT_FLAG: "N",
        PRINCIPAL_AMT: principalAmt,
        TERM_CD: termCd,
        INT_RATE: intRate,
        TRAN_DT: Boolean(formState?.TRAN_DT)
          ? format(
              utilFunction.getParsedDate(formState?.TRAN_DT),
              "dd-MMM-yyyy"
            )
          : "",
      });

    if (status === "0") {
      return {
        DUE_AMT: {
          value: data?.[0]?.MATURITY_AMT ?? "",
        },
        INST_RS: {
          value: data?.[0]?.MONTHLY_INT ?? "",
        },
      };
    } else {
      let buttonName = await formState?.MessageBox({
        messageTitle: "Error",
        message: message || "Unknownerroroccured",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });

      if (buttonName === "Ok") {
        return {
          [fieldName]: {
            value: "",
            error: message ?? "",
            ignoreUpdate: true,
          },
          DUE_AMT: {
            value: "",
            ignoreUpdate: true,
          },
          INST_RS: {
            value: "",
            ignoreUpdate: true,
          },
          TOTAL: {
            value: "",
            ignoreUpdate: true,
          },
        };
      }
    }
  }
  return {};
};

export const validateFDDepAmt = async (
  currField,
  dependentFields,
  auth,
  formState
) => {
  let currFieldName = currField?.name?.split("/");
  let fieldName = currFieldName[currFieldName.length - 1];
  let cashAmt =
    fieldName === "APPLIED_AMT"
      ? currField?.value
      : dependentFields?.APPLIED_AMT?.value;
  let transAmt =
    fieldName === "SANCTIONED_AMT"
      ? currField?.value
      : dependentFields?.SANCTIONED_AMT?.value;
  let principalAmt = Number(cashAmt ?? 0) + Number(transAmt ?? 0);
  if (cashAmt || transAmt || Number(dependentFields?.DUE_AMT?.value) > 0) {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("VALIDATEFDDEPAMT", {
        A_COMP_CD: auth?.companyID ?? "",
        A_BRANCH_CD: formState?.BRANCH_CD
          ? formState?.BRANCH_CD
          : auth?.user?.branchCode ?? "",
        A_ACCT_TYPE: formState?.ACCT_TYPE ?? "",
        A_ACCT_CD: formState?.ACCT_CD ?? "",
        A_BASE_BRANCH: auth?.user?.branchCode ?? "",
        A_CATEG_CD: dependentFields?.CATEG_CD?.value ?? "",
        A_MATURITY_DT: Boolean(dependentFields?.INST_DUE_DT?.value)
          ? format(
              utilFunction.getParsedDate(dependentFields?.INST_DUE_DT?.value),
              "dd-MMM-yyyy"
            )
          : "",
        A_TRAN_DT: Boolean(formState?.TRAN_DT)
          ? format(
              utilFunction.getParsedDate(formState?.TRAN_DT),
              "dd-MMM-yyyy"
            )
          : "",
        A_PERIOD_CD: dependentFields?.INSTALLMENT_TYPE?.value ?? "",
        A_PERIOD_NO: dependentFields?.INST_NO?.value ?? "",
        A_CASH_AMT: cashAmt ?? "",
        A_TRSF_AMT: transAmt ?? "",
        A_SPL_AMT: formState?.fdParaData?.SPL_AMT ?? "",
        A_DEP_FAC: "",
        A_AGG_DEP_CUSTID: "",
        WORKING_DATE: auth?.workingDate ?? "",
      });

    if (status === "0") {
      return {
        INT_RATE: {
          value: data?.[0]?.INT_RATE ?? "",
        },
        // TOTAL: {
        //   value: principalAmt ?? "",
        // },
      };
    } else {
      let buttonName = await formState?.MessageBox({
        messageTitle: "Error",
        message: message || "Unknownerroroccured",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });

      if (buttonName === "Ok") {
        return {
          [fieldName]: {
            value: "",
            error: message ?? "",
            ignoreUpdate: true,
          },
          INT_RATE: {
            value: "",
            ignoreUpdate: true,
          },
          // TOTAL: {
          //   value: "",
          //   ignoreUpdate: true,
          // },
        };
      }
    }
  }
  return {};
};

export const getFDIntTermDDWData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDINTTERM", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(({ DISP_VAL, DATA_VAL }) => {
        return {
          value: DATA_VAL,
          label: DISP_VAL,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFDParaDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDPARADETAIL", { ...reqData });
  if (status === "0") {
    return data;
  } else if (status === "999") {
    return { status: status, messageDetails: message };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateAccountAndGetDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEACCOUNT", {
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
      SCREEN_REF: reqData?.SCREEN_REF ?? "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCustomerJointDetail = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTREFDTL", {
      COMP_CD: reqData?.COMP_CD ?? "",
      CUSTOMER_ID: reqData?.CUSTOMER_ID ?? "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getOrnamentTypeddw = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETORNAMTYPMSTDATADISP", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ CODE, DESCRIPTION, DEFAULT_VAL, ...other }) => {
          return {
            ...other,
            value: CODE,
            label: DESCRIPTION,
            test: DEFAULT_VAL,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getOrnamentValue = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETORNAMENTVALUE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getEmpIdDDW = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEMPDDDW", {
      ...reqData,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ EMP_ID, FULLNAME, ...other }) => {
        return {
          ...other,
          value: EMP_ID,
          label: FULLNAME,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getOrnamentGridData = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETORNAMENTDTL", {
      ...reqData,
    });
  if (status === "0") {
    let response = data;
    response = response?.map((item) => ({
      ...item,
      ACTIVE: item.ACTIVE === "Y" ? true : false,
      ACTIVE_VISIBLE: "Y",
    }));
    return response;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateSiExecuteDays = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESIEXECUTEDAY", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDebitAccountvalidation = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIDRACDTL", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSiCharge = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSICHARGE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateFdNo = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELOCKERFD", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getLimitEntryData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETACCTNOVALIDATEDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getFDTypeDDlist = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITFDTYPEDDW", {
      COMP_CD: apiReqPara.COMP_CD,
      BRANCH_CD: apiReqPara.BRANCH_CD,
      SECURITY_TYPE: apiReqPara.SECURITY_TYPE,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ACCT_TYPE, TYPE_NM, ...other }) => {
        return {
          value: ACCT_TYPE,
          label: TYPE_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(
      message +
        " Check the GETLIMITFDTYPEDDW API for the FD-Account-Type drop-down",
      messageDetails
    );
  }
};
export const getFDdetailBFD = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDBFDDETAIL", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getPaymentModeddw = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYMENTMODEDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
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
