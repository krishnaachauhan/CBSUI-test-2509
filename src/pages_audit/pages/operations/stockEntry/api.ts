import { DefaultErrorObject } from "@acuteinfo/common-base";
import { endOfMonth, format, isEqual, isValid } from "date-fns";
import { t } from "i18next";
import { AuthSDK } from "registry/fns/auth";
import { greaterThanDate, lessThanDate } from "@acuteinfo/common-base";

export const securityListDD = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTKSECURITYDDW", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      const defaultValue =
        Array.isArray(responseData) && responseData.length > 0
          ? responseData[0].SECURITY_CD
          : "";

      responseData = responseData.map(
        ({ SECURITY_CD, SECURITY_TYPE, DESCRIPTION, ...other }) => {
          return {
            value: SECURITY_CD,
            label: DESCRIPTION,
            defaultValue,
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

export const scriptListDD = async (ApiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTKSCRIPTDDW", {
      ...ApiReq,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ SCRIPT_CD, SCRIPT_NM, ...other }) => {
        return {
          value: SCRIPT_CD,
          label: SCRIPT_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const securityFieldDTL = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTKSECFIELDDISP", {
      COMP_CD: apiReqPara?.COMP_CD,
      SECURITY_CD: apiReqPara?.SECURITY_CD,
      BRANCH_CD: apiReqPara?.BRANCH_CD,
    });
  if (status === "0") {
    let transformedSecurityData: any[] = [];

    let APIRequestPara = {
      COMP_CD: apiReqPara.COMP_CD ?? "",
      BRANCH_CD: apiReqPara.BRANCH_CD ?? "",
      SECURITY_CD: apiReqPara.SECURITY_CD ?? "",
      SCREEN_REF: apiReqPara?.docCD ?? "",
      GD_TD_DATE: apiReqPara.WORKING_DATE ?? "",
      TRN_DATE: apiReqPara.WORKING_DATE ?? "",
      WORKING_DATE: apiReqPara.WORKING_DATE ?? "",
      LIMIT_AMOUNT: apiReqPara?.ACCT_MST_LIMIT ?? "0",
    };
    let getAsonDate = await expireDate(APIRequestPara);

    if (Array.isArray(data)) {
      transformedSecurityData = await Promise.all(
        data
          .map((val, index) => ({
            render: {
              componentType: val?.COMPONENT_TYPE,
            },
            name: val?.FIELD_NAME,
            label: val?.FIELD_LABEL,
            sequence: val?.TAB_SEQ,
            placeholder: val?.PLACE_HOLDER,
            required: val?.FIELD_REQUIRED === "Y" ? true : false,
            isReadOnly: val?.IS_READ_ONLY === "Y" ? true : false,
            GridProps: {
              xs: val?.XS,
              md: val?.MD,
              sm: val?.SM,
              lg: val?.LG,
              xl: val?.XL,
            },
          }))
          .sort((a, b) => parseInt(a.sequence) - parseInt(b.sequence))
          .map(async (item) => {
            if (item.name === "TRAN_DT") {
              return {
                ...item,
                required: true,
                isWorkingDate: true,
                isMaxWorkingDate: true,
                isFieldFocused: true,
                validate: (currentField, dependentField) => {
                  let formatdate = new Date(currentField?.value);
                  if (!currentField?.value) {
                    return "PleaseEnterStatementDate";
                  } else if (Boolean(formatdate) && !isValid(formatdate)) {
                    return t("Mustbeavaliddate");
                  } else if (
                    greaterThanDate(formatdate, currentField?._maxDt, {
                      ignoreTime: true,
                    })
                  ) {
                    return t("DateShouldBeLessThanEqualToWorkingDT");
                  }
                  return "";
                },
                dependentFields: ["BRANCH_CD", "SECURITY_CD", "ACCT_MST_LIMIT"],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentValue
                ) => {
                  const areTimesEqual = isEqual(
                    new Date(authState?.workingDate),
                    new Date(field?.value)
                  );
                  if (
                    dependentValue?.SECURITY_CD?.value &&
                    !Boolean(areTimesEqual)
                  ) {
                    getAsonDate = [];
                    const formattedDate = format(
                      new Date(field?.value),
                      "dd-MMM-yyyy"
                    ).toUpperCase();
                    let APIRequestPara = {
                      COMP_CD: authState?.companyID ?? "",
                      BRANCH_CD: dependentValue?.BRANCH_CD?.value ?? "",
                      SECURITY_CD: dependentValue?.SECURITY_CD?.value ?? "",
                      SCREEN_REF: apiReqPara?.docCD ?? "",
                      GD_TD_DATE: authState?.workingDate ?? "",
                      WORKING_DATE: authState?.workingDate ?? "",
                      TRN_DATE: formattedDate ?? "",
                      LIMIT_AMOUNT: apiReqPara?.ACCT_MST_LIMIT ?? "0",
                    };
                    let postData = await expireDate(APIRequestPara);
                    if (postData?.length) {
                      return {
                        ASON_DT: { value: postData?.[0]?.ASON_DT },
                        DISABLE_ASON_DT: {
                          value: postData?.[0]?.DISABLE_ASON_DT,
                        },
                      };
                    }
                  } else if (!field?.value) {
                    getAsonDate = [];
                    return {
                      ASON_DT: { value: "" },
                      DISABLE_ASON_DT: {
                        value: "",
                      },
                    };
                  }
                },
              };
            } else if (item.name === "ASON_DT") {
              return {
                ...item,
                required: true,
                dependentFields: ["DISABLE_ASON_DT ", "TRAN_DT"],
                // isWorkingDate: true,
                defaultValue: getAsonDate?.[0]?.ASON_DT,
                validate: (currentField, dependentField) => {
                  let formatdate = new Date(currentField?.value);
                  if (!currentField?.value) {
                    return "PleaseEnterStatementValidTillDate";
                  } else if (Boolean(formatdate) && !isValid(formatdate)) {
                    return t("Mustbeavaliddate");
                  } else if (
                    lessThanDate(formatdate, dependentField?.TRAN_DT?.value, {
                      ignoreTime: true,
                    })
                  ) {
                    return t("StmtTillDateShouldBeGreterThanStmt");
                  }
                  return "";
                },

                isReadOnly(fieldData, dependentFieldsValues, formState) {
                  if (
                    dependentFieldsValues?.DISABLE_ASON_DT?.value === "Y" ||
                    getAsonDate?.[0]?.DISABLE_ASON_DT === "Y"
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                },
              };
            } else if (item.name === "SCRIPT_CD") {
              return {
                ...item,
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "PleaseSelectScript";
                  }
                  return "";
                },
                _optionsKey: "scriptListDD",
                dependentFields: ["ACCT_TYPE", "ACCT_CD"],
                options: (dependentValue, formState, _, authState, other) => {
                  let apiReq = {
                    COMP_CD: authState?.companyID,
                    BRANCH_CD: authState?.user?.branchCode,
                  };
                  return scriptListDD(apiReq);
                },
              };
            } else if (item.name === "NO_OF_SHARE") {
              return {
                ...item,
                FormatProps: {
                  allowNegative: false,
                  allowLeadingZeros: false,
                  decimalScale: 0,

                  isAllowed: (values) => {
                    //@ts-ignore
                    if (values.value?.length < 9) {
                      return true;
                    }
                    return false;
                  },
                },
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "PleaseEnterNoOfShare";
                  }
                  return "";
                },
                textFieldStyle: {
                  "& .MuiInputBase-input": {
                    textAlign: "right",
                  },
                },
              };
            } else if (item.name === "STOCK_VALUE") {
              return {
                ...item,
                required: true,
                FormatProps: {
                  isAllowed: (values) => {
                    //@ts-ignore
                    if (values.value?.length < 14) {
                      return true;
                    }
                    return false;
                  },
                },
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "PleaseEnterStockValue";
                  }
                  return "";
                },
                runPostValidationHookAlways: true,
                postValidationSetCrossFieldValues: async (field) => {
                  if (field?.value) {
                    let roundOff = Math.round(Number(field?.value));
                    return {
                      NET_VALUE: {
                        value: roundOff,
                      },
                      STOCK_VALUE: {
                        value: roundOff,
                        ignoreUpdate: true,
                      },
                      DRAWING_POWER: {
                        value: roundOff,
                      },
                    };
                  } else if (!field?.value) {
                    return {
                      NET_VALUE: {
                        value: "",
                      },
                      DRAWING_POWER: {
                        value: "",
                      },
                    };
                  }
                },
              };
            } else if (item.name === "CREDITOR") {
              return {
                ...item,
                // shouldExclude() {
                //   if (data?.[0]?.CREDITOR_VISIBLE === "Y") {
                //     return false;
                //   } else {
                //     return true;
                //   }
                // },

                dependentFields: ["STOCK_VALUE"],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentValue
                ) => {
                  if (field?.value) {
                    let roundOff = Math.round(Number(field?.value));
                    let drawingPower =
                      Number(dependentValue?.STOCK_VALUE?.value) - roundOff;

                    return {
                      NET_VALUE: {
                        value:
                          Number(dependentValue?.STOCK_VALUE?.value) < roundOff
                            ? ""
                            : drawingPower,
                      },
                      DRAWING_POWER: {
                        value:
                          Number(dependentValue?.STOCK_VALUE?.value) < roundOff
                            ? ""
                            : drawingPower,
                      },
                    };
                  }
                },
              };
            } else if (item.name === "NET_VALUE") {
              return {
                ...item,
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "NetValueisrequired";
                  }
                  return "";
                },
              };
            } else if (item.name === "MARGIN") {
              return {
                ...item,
                required: true,
                FormatProps: {
                  allowNegative: false,
                  placeholder: item?.placeholder,
                  allowLeadingZeros: false,
                  decimalScale: 0,
                  isAllowed: (values) => {
                    //@ts-ignore
                    if (values.value?.length < 3) {
                      return true;
                    }
                    return false;
                  },
                },
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "PleaseEnterMargin";
                  }
                  return "";
                },
                setValueOnDependentFieldsChange: (dependentFields) => {
                  return apiReqPara?.STOCK_MARGIN;
                },
                isReadOnly() {
                  if (apiReqPara?.STK_MRG_DISABLE === "Y") {
                    return true;
                  } else {
                    return false;
                  }
                },
                // dependentFields: ["NET_VALUE", "MARGIN"],
                // postValidationSetCrossFieldValues: async (
                //   field,
                //   formState,
                //   authState,
                //   dependentValue
                // ) => {
                //   if (field?.value) {
                //     // let roundOff = Math.round(Number(field?.value));
                //     // let drawingPower =
                //     //   Number(dependentValue?.STOCK_VALUE?.value) - roundOff;

                //     let val =
                //       (Number(dependentValue?.NET_VALUE?.value) *
                //         Number(field?.value)) /
                //       100;
                //     return {
                //       DRAWING_POWER: {
                //         value: Number(dependentValue?.NET_VALUE?.value) - val,
                //       },
                //     };
                //   }
                // },
              };
            } else if (item.name === "DRAWING_POWER") {
              return {
                ...item,
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "DrawingPowerisrequired";
                  }
                  return "";
                },
                FormatProps: { placeholder: item?.placeholder },
                dependentFields: ["NET_VALUE", "MARGIN", "CREDITOR"],
                setValueOnDependentFieldsChange: (dependentFields) => {
                  let netvalue = Number(dependentFields?.NET_VALUE?.value);
                  let margin = Number(dependentFields?.MARGIN?.value);
                  let creditor = Number(dependentFields?.CREDITOR?.value);

                  if (creditor > netvalue) {
                    return "";
                  } else if (margin) {
                    let value =
                      (Number(dependentFields?.NET_VALUE?.value) *
                        Number(dependentFields?.MARGIN?.value)) /
                      100;
                    return value
                      ? Number(dependentFields?.NET_VALUE?.value) - value
                      : "";
                  } else if (!margin) {
                    return netvalue;
                  }

                  // if (
                  //   Number(dependentFields?.NET_VALUE?.value) > 0 &&
                  //   Number(dependentFields?.MARGIN?.value) > 0
                  // ) {
                  //   let value =
                  //     (Number(dependentFields?.NET_VALUE?.value) *
                  //       Number(dependentFields?.MARGIN?.value)) /
                  //     100;

                  //   return value
                  //     ? Number(dependentFields?.NET_VALUE?.value) - value
                  //     : "";
                  // }
                },
              };
            } else if (item.name === "STOCK_DESC") {
              return {
                ...item,
                required: true,
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
                maxLength: 200,
                inputProps: {
                  maxLength: 200,
                },
                validate: (currentField) => {
                  if (!currentField?.value) {
                    return "PleaseEnterStockDesc";
                  }
                  return "";
                },
              };
            } else if (item.name === "RECEIVED_DT") {
              return {
                ...item,
                isWorkingDate: true,
                isMaxWorkingDate: true,
              };
            } else if (item.name === "REMARKS") {
              return {
                ...item,
                maxLength: 200,
                inputProps: {
                  maxLength: 200,
                },
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
              };
            } else {
              return item;
            }
          })
      );
    }
    return transformedSecurityData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const stockGridData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTOCKDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      // if (item?.ALLOW_FORCE_EXPIRE_FLAG === "Y") {
      //   item._rowColor = "rgb(255, 225, 225)";
      // }
      item.DISPLAY_CONFIRM = item?.CONFIRMED === "Y" ? "Confirm" : "Pending";
      item.CR_KEY = "BLANK";
      // item.MARGIN = parseFloat(item.MARGIN).toFixed(2);
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const expireDate = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETEXPIRYDATE", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const insertValidate = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESTOCKDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudStockData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSTOCKDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const viewDocument = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTKUPVEWBTNDOCDTLDISP", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const uploadDocument = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSTOCKDOCUMENTDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const stockConfirm = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSTOCKCONFIRMATION", { ...apireq });
  if (status === "99") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
