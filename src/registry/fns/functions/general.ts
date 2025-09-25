import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import { AuthSDK } from "../auth";
import { format, isValid } from "date-fns";

const GeneralAPISDK = () => {
  const GetMiscValue = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(
        "GETMISCVALUE",
        {
          CATEGORY_CD: ReqData,
          DISPLAY_LANGUAGE: "en",
          ACTION: "",
        },
        {
          UNIQUE_REQ_ID: "32627636893400",
          APITOKEN: "MzI2Mjc2MzY4OTM0MDA=",
        }
      );
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getValidateValue = async (fieldData) => {
    if (
      //fieldData.value === "X" || --if any issue doing validation uncomment and check
      fieldData.value === "" ||
      fieldData.value === "0" ||
      fieldData.value === false ||
      fieldData.value === null ||
      fieldData.value === "00" ||
      (Array.isArray(fieldData.value) && fieldData.value.length <= 0)
    ) {
      return "This field is required";
    } else {
      return "";
    }
  };
  const getTranslateDataFromGoole = async (data, fromLang, toLang) => {
    try {
      let response = await fetch(
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
          fromLang +
          "&tl=" +
          toLang +
          "&dt=t&q=" +
          data
      );
      if (String(response.status) === "200") {
        let resData: any = await response.json();
        if (Array.isArray(resData)) {
          return resData?.[0]?.[0]?.[0] ?? "";
        } else {
          return "";
        }
      } else {
        return "";
      }
    } catch (error) {
      console.log(error);
      return "";
    }
  };
  const setDocumentName = (text) => {
    let titleText = document.title;
    document.title = titleText.split(" - ")[0] + " - " + text;
  };
  const getCustType = () => {
    console.log("changed...");
  };
  const getAccountTypeList = async (...reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETUSERACCTTYPE", {
        USER_NAME: reqData?.[3]?.user.id
          ? reqData?.[3]?.user.id
          : reqData?.[1]?.user.id ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ ACCT_TYPE, TYPE_NM, ...others }) => {
          return {
            ...others,
            value: ACCT_TYPE,
            label: ACCT_TYPE + " - " + TYPE_NM,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getCustomerIdValidate = async (reqData) => {
    const { status, data, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCUSTIDVAL", {
        COMP_CD: reqData?.COMP_CD,
        CUSTOMER_ID: reqData?.CUSTOMER_ID,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const retrieveStatementDtlFullAcctNo = async (
    currentField,
    formState,
    authState,
    dependentFieldValue
  ) => {
    return retrieveStatementDetails(
      currentField,
      formState,
      authState,
      dependentFieldValue,
      "FULL_ACCT_NO"
    );
  };
  const retrieveStatementDtlAcctCd = async (
    currentField,
    formState,
    authState,
    dependentFieldValue
  ) => {
    return retrieveStatementDetails(
      currentField,
      formState,
      authState,
      dependentFieldValue,
      "ACCT_CD"
    );
  };
  const retrieveStatementDetails = async (
    currentField,
    formState,
    authState,
    dependentFieldValue,
    reqFlag
  ) => {
    Object.keys(dependentFieldValue).forEach((key) => {
      const dynamicPrefix = key.split(".")[0] + ".";
      const newKey = key.replace(new RegExp("^" + dynamicPrefix), "");

      dependentFieldValue[newKey] = { ...dependentFieldValue[key] };
      dependentFieldValue[newKey].fieldKey = dependentFieldValue[
        newKey
      ].fieldKey.replace(new RegExp("^" + dynamicPrefix), "");
      dependentFieldValue[newKey].name = dependentFieldValue[
        newKey
      ].name.replace(new RegExp("^" + dynamicPrefix), "");
    });

    let paddedAcctcode = (currentField?.value).padStart(
      dependentFieldValue?.ACCT_TYPE?.optionData?.[0]?.PADDING_NUMBER,
      0
    );

    const condition = Boolean(reqFlag === "ACCT_CD")
      ? currentField?.value &&
        dependentFieldValue?.BRANCH_CD?.value &&
        dependentFieldValue?.ACCT_TYPE?.value
      : currentField?.value;

    if (Boolean(condition)) {
      const { status, data } = await AuthSDK.internalFetcher("GETACCTDATA", {
        COMP_CD: authState?.companyID,
        BRANCH_CD:
          reqFlag === "ACCT_CD" ? dependentFieldValue?.BRANCH_CD?.value : "",
        ACCT_TYPE:
          reqFlag === "ACCT_CD" ? dependentFieldValue?.ACCT_TYPE?.value : "",
        ACCT_CD: reqFlag === "ACCT_CD" ? paddedAcctcode : "",
        FULL_ACCT_NO: reqFlag === "ACCT_CD" ? "" : currentField?.value,
      });

      if (status === "0") {
        if (data?.length > 0) {
          const { LST_STATEMENT_DT } = data[0];
          const originalDate: any = new Date(LST_STATEMENT_DT);
          return {
            ACCT_NM: {
              value: data?.[0]?.ACCT_NM,
            },
            STMT_FROM_DATE: {
              value: format(
                utilFunction.isValidDate(LST_STATEMENT_DT)
                  ? originalDate.setDate(originalDate.getDate() + 1)
                  : new Date(),
                "dd/MMM/yyyy"
              ),
            },
            WK_STMT_TO_DATE: {
              value: utilFunction.isValidDate(new Date())
                ? new Date()
                : new Date(),
            },
            ACCT_CD: {
              value: data?.[0]?.ACCT_CD,
              ignoreUpdate: true,
            },
            BALANCE: {
              value: data?.[0]?.WIDTH_BAL,
            },
          };
        }
      }
    }
  };
  const getBranchCodeList = async (...reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETBRANCHDDDW", {
        COMP_CD: reqData?.[3]?.companyID || reqData?.[0]?.COMP_CD || "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ ...other }) => {
          return {
            value: other?.BRANCH_CD,
            label: other?.BRANCH_CD?.trim() + " - " + other?.BRANCH_NM?.trim(),
            ...other,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getReportAccountType = async (...reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETACCTTYPELST", {
        COMP_CD: reqData?.[3]?.companyID ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ ACCT_TYPE, TYPE_NM }) => {
          return {
            value: ACCT_TYPE,
            label: ACCT_TYPE + " - " + TYPE_NM,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getTbgDocMstData = async (...reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETTBGDOCMSTDATA", {
        COMP_CD: reqData?.[3]?.companyID ?? "",
      });
    if (status === "0") {
      let responseData = data;
      const newObject = {
        DOC_CD: "DEFAULT",
        USER_DEFINE_CD: "DEFAULT",
      };
      responseData = [...responseData, newObject];
      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ DOC_TITLE, DOC_CD, USER_DEFINE_CD }) => {
            return {
              value: DOC_CD,
              label: DOC_TITLE
                ? USER_DEFINE_CD + " - " + DOC_TITLE
                : USER_DEFINE_CD,
            };
          }
        );
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const convertArraytoObject = (array, keyname, valuename) => {
    if (array && Array.isArray(array)) {
      return array.reduce((acuu, item) => {
        return { ...acuu, [item[keyname]]: item[valuename] };
      }, {});
    } else {
      return {};
    }
  };
  const getActionDetailsData = async (currentField, formState, authState) => {
    if (currentField?.value) {
      const { status, data, message, messageDetails } =
        await AuthSDK.internalFetcher("GETCOLMISCDATA", {
          CATEGORY_CD: currentField?.value ?? "",
        });

      if (status === "0") {
        let resData = convertArraytoObject(data, "DISPLAY_VALUE", "DATA_VALUE");

        return {
          ACTIONLABEL: { value: resData?.ACTIONLABEL },
          ACTIONICON: { value: resData?.ACTIONICON },
          ROWDOUBLECLICK: {
            value: resData?.ROWDOUBLECLICK === "Y" ? true : false,
          },
          ALWAYSAVAILABLE: {
            value: resData?.ALWAYSAVAILABLE === "Y" ? true : false,
          },
          MULTIPLE: { value: resData?.MULTIPLE === "Y" ? true : false },
          SHOULDEXCLUDE: { value: resData?.SHOULDEXCLUDE },
          ON_ENTER_SUBMIT: { value: resData?.ONENTERSUBMIT },
          STARTSICON: { value: resData?.STARTSICON },
          ENDSICON: { value: resData?.ENDSICON },
          ROTATEICON: { value: resData?.ROTATEICON },
          ISNODATATHENSHOW: {
            value: resData?.ISNODATATHENSHOW === "Y" ? true : false,
          },
          TOOLTIP: { value: resData?.TOOLTIP },
        };
      } else {
        return {
          ACTIONLABEL: { value: "" },
          ACTIONICON: { value: "" },
          ROWDOUBLECLICK: { value: "" },
          ALWAYSAVAILABLE: { value: "" },
          MULTIPLE: { value: "" },
          SHOULDEXCLUDE: { value: "" },
          ON_ENTERSUBMIT: { value: "" },
          STARTSICON: { value: "" },
          ENDSICON: { value: "" },
          ROTATEICON: { value: "" },
          ISNODATATHENSHOW: { value: "" },
          TOOLTIP: { value: "" },
        };
      }
    }
  };
  const getquickViewList = async (...reqData) => {
    const { status, data, message, messageDetails } =
      await AuthSDK.internalFetcher("GETUSRDOCLIST", {
        USER_NAME: reqData?.[1]?.user?.id,
        COMP_CD: reqData?.[1]?.companyID,
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ DOC_CD, DOC_NM, ...other }) => {
          return {
            value: DOC_CD,
            label: DOC_NM,
            ...other,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getMetadataList = async (...reqData) => {
    const { status, data, message, messageDetails } =
      await AuthSDK.internalFetcher("GETTBGFROMCONFIGLIST", {
        BRANCH_CD: reqData?.[3]?.user?.branchCode,
        COMP_CD: reqData?.[3]?.companyID,
        DOC_CD: reqData?.[1]?.docCD ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ DESCRIPTION, SR_CD }) => {
          return {
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

  const getKYCDocTypes = async (dependantFields, ...other) => {
    // console.log(">>dependantFields",dependantFields)
    // if (dependantFields.SR_CD.value && dependantFields.TRAN_CD.value) {
    const { status, data, message, messageDetails } =
      await AuthSDK.internalFetcher("DOCCUMENTSCANHISTORY", {
        // SR_CD: dependantFields.SR_CD?.value ?? "",
        // TRAN_CD: dependantFields.TRAN_CD?.value??"",
        SR_CD: "1",
        TRAN_CD: "189084",
        DOC_TYPE: "KYC",
      });
    if (status === "0") {
      let responseData = data;
      // if (Array.isArray(responseData)) {
      //   responseData = responseData.map(({ DOC_TITLE, USER_DEFINE_CD }) => {
      //     return {
      //       value: USER_DEFINE_CD,
      //       label: DOC_TITLE + " - " + USER_DEFINE_CD,
      //     };
      //   });
      // }

      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
    // }
    // return []
  };

  const getChequeLeavesList = async (...reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCHQLEAVESLIST", {
        COMP_CD: reqData?.[3]?.companyID ?? "",
      });

    if (status === "0") {
      let responseData = data;

      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ NO_OF_LEAF, TRAN_CD }) => {
          return {
            value: NO_OF_LEAF,
            label: NO_OF_LEAF,
          };
        });
      }

      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getTabelListData = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETDBTABLELIST", {
        OWNER: ReqData,
      });

    if (status === "0") {
      let responseData = data;

      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ TABLE_NAME }) => {
          return {
            value: TABLE_NAME,
            label: TABLE_NAME,
          };
        });
      }

      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getDynDropdownData = async (ReqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETDROPDOWNDATA", {
        ACTION: ReqData,
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ DATA_VALUE, DISPLAY_VALUE }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        });
      }

      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getDependentFieldList = async (...reqData) => {
    const { status, data, message, messageDetails } =
      await AuthSDK.internalFetcher("GETFIELDLIST", {
        DOC_CD: reqData?.[1]?.docCD ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ COLUMN_ACCESSOR }) => {
          return {
            value: COLUMN_ACCESSOR,
            label: COLUMN_ACCESSOR,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getProMiscData = async (...reqData) => {
    // console.log("ReqData", reqData);
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(`GETPROPMISCDATA`, {
        CATEGORY_CD: reqData?.[4] ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ DATA_VALUE, DISPLAY_VALUE }) => {
          return {
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getZoneListData = async (_, formState, __, auth) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(`GETCLGZONELIST`, {
        ZONE_TRAN_TYPE: formState?.ZONE_TRAN_TYPE ?? "",
        COMP_CD: auth?.companyID ?? "",
        BRANCH_CD: auth?.user?.branchCode ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ DISPLAY_NM, ZONE_CD, DEFAULT_VAL, ...others }) => {
            return {
              value: ZONE_CD,
              label: DISPLAY_NM,
              getZoneDefaultVal: DEFAULT_VAL,
              ...others,
            };
          }
        );
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getMatureInstDetail = async (_, __, dependantFields, authState) => {
    let branchCd = "";
    let acctType = "";
    Object.keys(dependantFields).forEach((key) => {
      if (key.startsWith("FDDTL") || key.startsWith("FDACCT")) {
        const fieldName = key.split(".")[1];
        if (fieldName === "BRANCH_CD") {
          branchCd = dependantFields[key].value;
        } else if (fieldName === "ACCT_TYPE") {
          acctType = dependantFields[key].value;
        }
      }
    });
    if (!Boolean(branchCd)) return [];
    if (!Boolean(acctType)) return [];
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETMATUREINSTDTL", {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: branchCd ?? "",
        ACCT_TYPE: acctType ?? "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ MATURE_INST, DESCRIPTION }) => {
          return {
            value: MATURE_INST,
            label: DESCRIPTION,
          };
        });
      }
      return responseData;
    } else {
    }
  };

  const getFDInterest = async (currField, dependentFields) => {
    let currFieldName = currField?.name?.split(".");
    let fieldName = currFieldName[currFieldName.length - 1];
    let tranDate =
      fieldName === "TRAN_DT"
        ? currField?.value
        : dependentFields?.["FDDTL.TRAN_DT"]?.value;
    let fdAmount =
      fieldName === "FD_AMOUNT"
        ? currField?.value
        : dependentFields?.["FDDTL.FD_AMOUNT"]?.value;
    let periodCode =
      fieldName === "PERIOD_CD"
        ? currField?.value
        : dependentFields?.["FDDTL.PERIOD_CD"]?.value;
    let periodNo =
      fieldName === "PERIOD_NO"
        ? currField?.value
        : dependentFields?.["FDDTL.PERIOD_NO"]?.value;
    if (
      !Boolean(tranDate) ||
      !Boolean(fdAmount) ||
      !Boolean(periodCode) ||
      !Boolean(periodNo)
    )
      return {};
    const { data, status, message } = await AuthSDK.internalFetcher(
      "GETFDINTEREST",
      {
        COMP_CD: dependentFields?.["FDDTL.COMP_CD"]?.value ?? "",
        BRANCH_CD: dependentFields?.["FDDTL.BRANCH_CD"]?.value ?? "",
        ACCT_TYPE: dependentFields?.["FDDTL.ACCT_TYPE"]?.value ?? "",
        ACCT_CD: dependentFields?.["FDDTL.ACCT_CD"]?.value ?? "",
        CATEG_CD: dependentFields?.["FDDTL.CATEG_CD"]?.value ?? "",
        // CATEG_CD: "",
        TRAN_DT: format(tranDate, "dd/MM/yyyy"),
        FD_AMOUNT: fdAmount,
        PERIOD_CD: periodCode,
        PERIOD_NO: periodNo,
      }
    );
    if (status === "0") {
      return {
        INT_RATE: {
          value: data?.[0]?.INT_RATE ?? "",
        },
        MATURITY_DT: {
          value: data?.[0]?.MATURITY_DT ?? "",
        },
      };
    } else {
      return {
        [fieldName]: {
          value: "",
          error: message ?? "",
          ignoreUpdate: true,
        },
        INT_RATE: {
          value: "",
        },
        MATURITY_DT: {
          value: "",
        },
      };
    }
  };
  const getAccNoValidation = async (reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("ACCTNOVALIDATION", {
        BRANCH_CD: reqData?.BRANCH_CD,
        COMP_CD: reqData?.COMP_CD,
        ACCT_TYPE: reqData?.ACCT_TYPE,
        ACCT_CD: reqData?.ACCT_CD,
        GD_TODAY_DT: reqData?.GD_TODAY_DT,
        SCREEN_REF: reqData?.SCREEN_REF, //depending on screen code
      });
    if (status === "0") {
      let responseData = data;

      return responseData[0];
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const get_Account_Type = async (apiReq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETDDDWACCTTYPE", {
        ...apiReq,
      });
    if (status === "0") {
      let responseData = data;

      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ ACCT_TYPE, CONCDESCRIPTION, ...other }) => {
            return {
              value: ACCT_TYPE,
              label: CONCDESCRIPTION,
              ...other,
            };
          }
        );
      }
      if (responseData && apiReq?.DOC_CD === "DIV") {
        responseData.sort((a, b) => {
          return parseInt(b.label) - parseInt(a.label);
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getChequeNoValidation = async (apiReq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("CHEQUENOVALIDATION", {
        ...apiReq,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getCommTypeList = async (apiReq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
        ...apiReq,
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ DESCRIPTION, TRAN_CD, ...other }) => {
            return {
              value: TRAN_CD,
              label: DESCRIPTION,
              ...other,
            };
          }
        );
      }
      return responseData;
    } else if (status === "999") {
      return { status: status, messageDetails: messageDetails };
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getCustAccountLatestDtl = async ({
    COMP_CD,
    BRANCH_CD,
    ACCT_TYPE,
    ACCT_CD,
    AMOUNT,
    SCREEN_REF,
    AC_CUST_LEVEL,
    CUSTOMER_ID,
    WORKING_DATE,
    BASE_BRANCH_CD,
    USERNAME,
    USERROLE,
    DISPLAY_LANGUAGE,
  }) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETSIGNPHOTOVIEW", {
        COMP_CD: COMP_CD,
        BRANCH_CD: BRANCH_CD,
        ACCT_TYPE: ACCT_TYPE,
        ACCT_CD: ACCT_CD,
        AMOUNT: AMOUNT,
        SCREEN_REF: SCREEN_REF,
        AC_CUST_LEVEL: AC_CUST_LEVEL,
        CUSTOMER_ID,
        WORKING_DATE,
        BASE_BRANCH_CD,
        USERNAME,
        USERROLE,
        DISPLAY_LANGUAGE,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const getPhotoSignHistory = async ({ COMP_CD, CUSTOMER_ID, REQ_CD }) => {
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
  const getCalGstAmountData = async (apiReq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCALCGSTAMT", {
        ...apiReq,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getDateWithCurrentTime = async (date) => {
    if (isValid(date)) {
      const selectedDate = new Date(date);
      selectedDate.setHours(new Date().getHours());
      selectedDate.setMinutes(new Date().getMinutes());
      selectedDate.setSeconds(new Date().getSeconds());
      const formattedDate = format(selectedDate, "dd/MM/yyyy HH:mm:ss");

      return formattedDate;
    }
    return "";
  };

  const validateTokenScroll = async (reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("VALIDATETOKENSCROLL", { ...reqData });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const doAccountFreeze = async (reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("DOACCTFREEZESTATUSUPD", {
        ENT_COMP_CD: reqData?.ENT_COMP_CD ?? "",
        ENT_BRANCH_CD: reqData?.ENT_BRANCH_CD ?? "",
        COMP_CD: reqData?.COMP_CD ?? "",
        BRANCH_CD: reqData?.BRANCH_CD ?? "",
        ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
        ACCT_CD: reqData?.ACCT_CD ?? "",
      });
    if (status === "0") {
      let responseData = data;
      return responseData[0];
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getDocDetails = async ({ REQ_CD, CUSTOMER_ID }) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCUSTMSTDOCDTL", {
        REQ_CD: REQ_CD,
        CUSTOMER_ID: CUSTOMER_ID,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getBussinessDate = async ({ SCREEN_REF }) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETBUSINESSDATE", {
        SCREEN_REF: SCREEN_REF,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getHoldChargeDropDown = async (reqData) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETF1HOLDCHRGTYPEDDW", reqData);
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData?.map(
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
  const getCurrencyList = async (Apireq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETCURRENCYDDW", { ...Apireq });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map((row) => {
          return {
            value: row.CURRENCY_CODE,
            label: row?.CURRENCY_CODE,
            ...row,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getChargeCodeList = async (...reqData) => {
    // console.log("<<<<reqData", reqData)
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETTFCHARGECD", {
        COMP_CD: "132 ",
        BRANCH_CD: "099 ",
        // COMP_CD: reqData?.[3]?.companyID || reqData?.[0]?.COMP_CD || "",
      });
    if (status === "0") {
      let responseData = data;
      // console.log("<<responseData", responseData)
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ ...other }) => {
          // console.log("<<<others", other)
          return {
            value: other?.CHARGE_CD,
            label: other?.DISPLAY_NM,
            ...other,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  const getTFCommodity = async (...reqData) => {
    // console.log("<<<<reqData", reqData)
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETTFCOMMODITY", {
        COMP_CD: "132 ",
        BRANCH_CD: "099 ",
        FLAG: "I",
        // COMP_CD: reqData?.[3]?.companyID || reqData?.[0]?.COMP_CD || "",
      });
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(({ ...other }) => {
          return {
            value: other?.COMM_CD,
            label: other?.COMM_DESC,
            ...other,
          };
        });
      }
      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  /**
   * Convert Windows font names or TTF files into proper CSS.
   * Falls back to Draft 10 CPI (Courier New 12pt, monospaced).
   */
  function getCssForFont(fontName) {
    let css: any = {
      fontFamily:
        '"CIDFont_F1", monospace, "Consolas", "Courier New", monospace',
      fontSize: "13.35px",
      lineHeight: "1.17",
      whiteSpace: "pre",
      letterSpacing: "0",
      padding: "0",
      margin: "0",
      color: "#000",
    };

    if (!fontName) return css;

    const name = fontName?.FONT_FACE?.toLowerCase?.() || "";

    if (!name) return css;

    /*css["fontSize"] = fontName?.FONT_HEIGHT
      ? pbToCssFontSize(fontName?.FONT_HEIGHT)
      : "inherit";*/

    css["fontWeight"] = `${fontName?.FONT_WEIGHT ?? ""}`;

    /*
        // Arial Bold Italic special case
        if (name === "arial bold italic") {
          css.fontFamily = '"ArialBI", Arial, sans-serif';
        }
        // Arial family
        else if (name.includes('arial')) {
          css.fontFamily = 'Arial, sans-serif';
          //if (name.includes('bold')) css.fontWeight = 'bold';
          //if (name.includes('italic')) css.fontStyle = 'italic';
        }
   
        // Times New Roman
        else if (name.includes('times new roman')) {
          css.fontFamily = '"Times New Roman", serif';
          //if (name.includes('bold')) css.fontWeight = 'bold';
          //if (name.includes('italic')) css.fontStyle = 'italic';
        }
   
        // Courier New
        else if (name.includes('courier')) {
          css.fontFamily = '"Courier New", monospace';
          //if (name.includes('bold')) css.fontWeight = 'bold';
          //if (name.includes('italic')) css.fontStyle = 'italic';
        }
   
        // Calibri
        else if (name.includes('calibri')) {
          css.fontFamily = 'Calibri, sans-serif';
          //if (name.includes('bold')) css.fontWeight = 'bold';
          //if (name.includes('italic')) css.fontStyle = 'italic';
        }
   
        // Segoe UI
        else if (name.includes('segoe ui')) {
          css.fontFamily = '"Segoe UI", sans-serif';
          //if (name.includes('bold')) css.fontWeight = 'bold';
          //if (name.includes('italic')) css.fontStyle = 'italic';
        }*/

    return css;
  }

  const verifyAccount = async (ApiReq) => {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("BENEFICIARYLOOKUP", {
        ...ApiReq,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

  return {
    GetMiscValue,
    getValidateValue,
    getTranslateDataFromGoole,
    setDocumentName,
    getCustType,
    getAccountTypeList,
    getCustomerIdValidate,
    retrieveStatementDtlFullAcctNo,
    retrieveStatementDtlAcctCd,
    retrieveStatementDetails,
    getBranchCodeList,
    getReportAccountType,
    getTbgDocMstData,
    getActionDetailsData,
    getquickViewList,
    getMetadataList,
    getKYCDocTypes,
    getTabelListData,
    getChequeLeavesList,
    getDynDropdownData,
    getDependentFieldList,
    getProMiscData,
    getZoneListData,
    getMatureInstDetail,
    getFDInterest,
    getAccNoValidation,
    get_Account_Type,
    getChequeNoValidation,
    getCommTypeList,
    getPhotoSignHistory,
    getCustAccountLatestDtl,
    getCalGstAmountData,
    getDateWithCurrentTime,
    validateTokenScroll,
    doAccountFreeze,
    getDocDetails,
    getBussinessDate,
    getHoldChargeDropDown,
    getCurrencyList,
    getChargeCodeList,
    getTFCommodity,
    getCssForFont,
    verifyAccount,
  };
};
export const GeneralAPI = GeneralAPISDK();
