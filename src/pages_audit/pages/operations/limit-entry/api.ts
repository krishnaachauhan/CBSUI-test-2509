import {
  DefaultErrorObject,
  lessThanDate,
  utilFunction,
} from "@acuteinfo/common-base";
import i18n from "components/multiLanguage/languagesConfiguration";
import { format, isBefore, isEqual, isValid, startOfDay } from "date-fns";
import { t } from "i18next";
import { AuthSDK } from "registry/fns/auth";

export const getSecurityListData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITSECUMSTPARENT", {
      ...apiReq,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ...other }) => {
        return {
          value: other.SECURITY_CD,
          label: other.DISPLAY_NM,
          ...other,
        };
      });
    }
    return responseData;
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

export const fieldData = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITSECFIELDDISP", {
      // ...apiReqPara,
      COMP_CD: apiReqPara?.COMP_CD,
      SECURITY_CD: apiReqPara?.SECURITY_CD,
      BRANCH_CD: apiReqPara?.BRANCH_CD,
    });
  if (status === "0") {
    let getLimitExpDt = await getLimitExpDate({
      ...apiReqPara,
      TRAN_DT: apiReqPara?.WORKING_DATE,
      SHORT_LMT_FLAG: "N",
    });

    let prt = apiReqPara?.SECURITY_TYPE.trim() === "PRT" ? true : false;
    let oth = apiReqPara?.SECURITY_TYPE.trim() === "OTH" ? true : false;
    let bfd = apiReqPara?.SECURITY_TYPE.trim() === "BFD" ? true : false;
    let stk = apiReqPara?.SECURITY_TYPE.trim() === "STK" ? true : false;
    let blc = apiReqPara?.SECURITY_TYPE.trim() === "BLC" ? true : false;
    let brd = apiReqPara?.SECURITY_TYPE.trim() === "BRD" ? true : false;
    let bdc = apiReqPara?.SECURITY_TYPE.trim() === "BDC" ? true : false;
    let bcc = apiReqPara?.SECURITY_TYPE.trim() === "BCC" ? true : false;

    const shouldPushWithY = data.some(
      (item) =>
        item.COMPONENT_TYPE === "rateOfInt" && item.FIELD_NAME === "PENAL_RATE"
    );
    const newData = [
      ...data,
      {
        DEFAULT_VALUE: shouldPushWithY ? "Y" : "N",
        COMPONENT_TYPE: "hidden",
        FIELD_NAME: "PANEL_FLAG",
      },
      {
        DEFAULT_VALUE: apiReqPara?.SECURITY_TYPE,
        COMPONENT_TYPE: "hidden",
        FIELD_NAME: "SECURITY_TYPE",
      },
      {
        COMPONENT_TYPE: "hidden",
        FIELD_NAME: "LIMIT_RATE_API",
      },

      {
        COMPONENT_TYPE: "hidden",
        FIELD_NAME: "EXP_DT_DISABLE",
      },
      {
        COMPONENT_TYPE: "hidden",
        FIELD_NAME: "PENAL_INT_RATE",
      },
      ...(bfd || brd
        ? [
            {
              COMPONENT_TYPE: "hidden",
              FIELD_NAME: "FD_COMP_CD",
              DEFAULT_VALUE: apiReqPara?.COMP_CD,
            },
          ]
        : []),
    ];

    let transformedSecurityData: any[] = [];
    if (Array.isArray(newData)) {
      transformedSecurityData = await Promise.all(
        newData
          .map((val, index) => ({
            render: { componentType: val?.COMPONENT_TYPE },
            name: val?.FIELD_NAME,
            label: val?.FIELD_LABEL,
            sequence: val?.TAB_SEQ,
            defaultValue: val?.DEFAULT_VALUE,
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
            if (item.name === "FD_BRANCH_CD") {
              return {
                ...item,
                defaultValue: brd || bfd ? apiReqPara?.BRANCH_CD : "",
                options:
                  bfd || brd ? await getFDbranchDDlist(apiReqPara.COMP_CD) : [],
                postValidationSetCrossFieldValues: async (field) => {
                  if (field?.value) {
                    return {
                      FD_TYPE: { value: "" },
                      FD_ACCT_CD: { value: "" },
                      FD_NO: { value: "" },
                    };
                  }
                },
              };
            } else if (item.name === "FD_TYPE") {
              return {
                ...item,
                isFieldFocused: bfd || brd ? true : false,
                options:
                  (bfd && (await getFDTypeDDlist(apiReqPara))) ||
                  (brd && (await getFDTypeDDlist(apiReqPara))),
                postValidationSetCrossFieldValues: async (field) => {
                  if (field?.value) {
                    return {
                      FD_ACCT_CD: { value: "" },
                      FD_NO: { value: "" },
                    };
                  }
                },
              };
            } else if (item.name === "FD_ACCT_CD") {
              return {
                ...item,
                isFieldFocused: !bfd && !brd ? true : false,
                inputProps: {
                  maxLength: 20,
                },
                runPostValidationHookAlways: true,
                dependentFields: ["FD_TYPE", "FD_BRANCH_CD", "PANEL_FLAG"],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentValue
                ) => {
                  if (field?.value) {
                    if (
                      (!bfd && !brd) ||
                      (dependentValue?.FD_BRANCH_CD?.value &&
                        dependentValue?.FD_TYPE?.value)
                    ) {
                      let ApiReq = {
                        FD_COMP_CD: bfd && brd ? "" : authState?.companyID,
                        FD_BRANCH_CD:
                          bfd && brd ? "" : dependentValue?.FD_BRANCH_CD?.value,
                        FD_ACCT_TYPE:
                          bfd && brd ? "" : dependentValue?.FD_TYPE?.value,
                        FD_ACCT_CD:
                          bfd && brd
                            ? field?.value
                            : utilFunction.getPadAccountNumber(
                                field?.value,
                                dependentValue?.FD_TYPE?.optionData?.[0]
                              ),
                        SECURITY_TYPE: apiReqPara.SECURITY_TYPE ?? "",
                        SECURITY_CD: apiReqPara?.SECURITY_CD ?? "",
                        SCREEN_REF: formState?.docCD,
                        PANEL_FLAG: dependentValue?.PANEL_FLAG?.value ?? "",
                      };

                      let postData = await getFDdetailBRD(ApiReq);

                      let responseData: any = [];

                      if (postData?.length) {
                        for (let i = 0; i < postData?.length; i++) {
                          if (postData[i]?.O_STATUS !== "0") {
                            let btnName = await formState.MessageBox({
                              messageTitle: postData[i]?.O_MSG_TITLE
                                ? postData[i]?.O_MSG_TITLE
                                : postData[i]?.O_STATUS === "999"
                                ? "ValidationFailed"
                                : postData[i]?.O_STATUS === "99"
                                ? "confirmation"
                                : "ALert",
                              message: postData[i]?.O_MESSAGE,
                              buttonNames:
                                postData[i]?.O_STATUS === "99"
                                  ? ["Yes", "No"]
                                  : ["Ok"],
                              icon:
                                postData[i]?.O_STATUS === "999"
                                  ? "ERROR"
                                  : postData[i]?.O_STATUS === "99"
                                  ? "CONFIRM"
                                  : "WARNING",
                            });
                            if (
                              btnName === "No" ||
                              postData[i]?.O_STATUS === "999"
                            ) {
                              //   getLimitExpDt = [];
                              return {
                                FD_ACCT_CD: { value: "", isFieldFocused: true },
                                SECURITY_VALUE: { value: "" },
                                SEC_AMT: { value: "" },
                                SEC_INT_MARGIN: { value: "" },
                                SEC_INT_AMT: { value: "" },
                                EXPIRY_DT: { value: "" },
                                INT_AMT: { value: "" },
                                INT_RATE: { value: "" },
                                PENAL_RATE: { value: "" },
                                // TRAN_DT: { value: "" },
                                LIMIT_AMOUNT: { value: "" },
                              };
                            }
                          } else {
                            // getLimitExpDt = [];
                            responseData.push(postData[i]);
                          }
                        }
                      }
                      if (responseData?.length) {
                        return {
                          FD_ACCT_CD: {
                            value:
                              !bfd && !brd
                                ? field?.value
                                : utilFunction.getPadAccountNumber(
                                    field?.value,
                                    dependentValue?.FD_TYPE?.optionData?.[0]
                                  ),
                            ignoreUpdate: true,
                          },
                          FD_NO: {
                            value: "",
                            ignoreUpdate: true,
                            isFieldFocused: bfd ? true : false,
                          },
                          SECURITY_VALUE: {
                            value: !bfd
                              ? responseData?.[0]?.SECURITY_VALUE
                              : "",
                          },
                          EXPIRY_DT: {
                            value: !bfd ? responseData?.[0]?.EXPIRY_DT : "",
                          },
                          TRAN_DT: {
                            value: !bfd ? responseData?.[0]?.TRAN_DT : "",
                            isFieldFocused: !bfd && !brd ? true : false,
                          },
                          INT_AMT: {
                            value: !bfd ? responseData?.[0]?.INT_AMT : "",
                          },
                          INT_RATE: {
                            value:
                              !bfd && !brd ? null : responseData?.[0]?.INT_RATE,
                            ignoreUpdate: true,
                          },
                          PENAL_RATE: {
                            value: !bfd ? responseData?.[0]?.PENAL_RATE : "",
                            ignoreUpdate: true,
                          },
                          EXP_DT_DISABLE: {
                            value: !bfd
                              ? responseData?.[0]?.EXP_DT_DISABLE
                              : "",
                          },
                        };
                      }
                    }
                  } else if (!field?.value) {
                    return {
                      FD_NO: { value: "" },
                      SECURITY_VALUE: { value: "" },
                      SEC_AMT: { value: "" },
                      SEC_INT_MARGIN: { value: "" },
                      SEC_INT_AMT: { value: "" },
                      // EXPIRY_DT: { value: "" },
                      // TRAN_DT: { value: "" },
                      INT_RATE: { value: "" },
                      INT_AMT: { value: "" },
                      PENAL_RATE: { value: "" },
                      LIMIT_AMOUNT: { value: "" },
                    };
                  }
                },
              };
            } else if (item.name === "FD_NO") {
              return {
                ...item,
                inputProps: {
                  maxLength: 10,
                  onInput: (event) => {
                    event.target.value = event.target.value.replace(
                      /[^0-9\s]/g,
                      ""
                    );
                  },
                },
                isReadOnly: (fieldData, dependent) => {
                  if (dependent?.FD_ACCT_CD?.value) {
                    return false;
                  } else {
                    return true;
                  }
                },
                runPostValidationHookAlways: true,
                dependentFields: [
                  "FD_BRANCH_CD",
                  "FD_ACCT_CD",
                  "FD_TYPE",
                  "TRAN_DT",
                  "SANCTIONED_AMT",
                  "PANEL_FLAG",
                ],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentValue
                ) => {
                  if (field?.value && dependentValue?.FD_ACCT_CD?.value) {
                    let ApiReq = {
                      A_FD_COMP_CD: authState?.companyID ?? "",
                      A_FD_BRANCH_CD: dependentValue?.FD_BRANCH_CD?.value ?? "",
                      A_FD_ACCT_TYPE: dependentValue?.FD_TYPE?.value ?? "",
                      A_FD_ACCT_CD: utilFunction.getPadAccountNumber(
                        dependentValue?.FD_ACCT_CD?.value,
                        dependentValue?.FD_TYPE?.optionData?.[0]
                      ),
                      A_FD_NO: field?.value,
                      A_SECURITY_TYPE: apiReqPara.SECURITY_TYPE ?? "",
                      A_SECURITY_CD: apiReqPara?.SECURITY_CD ?? "",
                      A_LOGIN_BRANCH: authState?.user?.branchCode,
                      A_ACCT_MST_LIMIT_AMT: apiReqPara?.SANCTIONED_AMT ?? "",
                      A_GD_DATE: authState?.workingDate,
                      A_TRAN_DT: authState?.workingDate,
                      A_PANEL_FLAG: dependentValue?.PANEL_FLAG?.value ?? "",
                      A_SCREEN_REF: formState?.docCD,
                      A_LANG: i18n.resolvedLanguage,
                    };

                    let postData = await getFDdetailBFD(ApiReq);
                    let responseData: any = [];

                    if (postData?.length) {
                      for (let i = 0; i < postData?.length; i++) {
                        if (postData[i]?.O_STATUS !== "0") {
                          let btnName = await formState?.MessageBox({
                            messageTitle: postData[i]?.O_MSG_TITLE
                              ? postData[i]?.O_MSG_TITLE
                              : postData[i]?.O_STATUS === "999"
                              ? "ValidationFailed"
                              : postData[i]?.O_STATUS === "99"
                              ? "confirmation"
                              : "ALert",
                            message: postData[i]?.O_MESSAGE,
                            buttonNames:
                              postData[i]?.O_STATUS === "99"
                                ? ["Yes", "No"]
                                : ["Ok"],
                            icon:
                              postData[i]?.O_STATUS === "999"
                                ? "ERROR"
                                : postData[i]?.O_STATUS === "99"
                                ? "CONFIRM"
                                : "WARNING",
                          });
                          if (
                            btnName === "No" ||
                            postData[i]?.O_STATUS === "999"
                          ) {
                            responseData.push([]);
                            return {
                              SECURITY_VALUE: {
                                value: "",
                              },
                              FD_NO: {
                                value: "",
                                isFieldFocused: true,
                              },
                              EXPIRY_DT: {
                                value: "",
                              },
                              INT_RATE: {
                                value: "",
                              },
                            };
                          }
                        } else {
                          responseData.push(postData[i]);
                        }
                      }
                    }
                    if (responseData?.length) {
                      return {
                        SECURITY_VALUE: {
                          value: postData?.[0]?.SECURITY_VALUE,
                        },
                        EXPIRY_DT: {
                          value: postData?.[0]?.EXPIRY_DT,
                        },
                        INT_RATE: {
                          value: postData?.[0]?.INT_RATE,
                        },
                        TRAN_DT: {
                          isFieldFocused: true,
                        },
                      };
                    }
                  } else if (!field?.value && bfd) {
                    return {
                      SECURITY_VALUE: { value: "" },
                      // EXPIRY_DT: { value: "" },
                      INT_RATE: { value: "" },
                    };
                  }
                },
              };
            } else if (item.name === "ENTRY_DT") {
              return {
                ...item,
                isWorkingDate: true,
              };
            } else if (item.name === "TRAN_DT") {
              return {
                ...item,
                isWorkingDate: true,
                validate: (currentField) => {
                  let formatdate = new Date(currentField?.value);
                  if (!currentField?.value) {
                    return "PleaseEnterEffeDate";
                  } else if (Boolean(formatdate) && !isValid(formatdate)) {
                    return t("Mustbeavaliddate");
                  }
                  return "";
                },
                dependentFields: ["SHORT_LMT_FLAG"],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependent
                ) => {
                  const areTimesEqual = isEqual(
                    new Date(authState?.workingDate),
                    new Date(field?.value)
                  );

                  if (
                    isValid(field?.value) &&
                    !areTimesEqual &&
                    apiReqPara?.SANCTIONED_AMT &&
                    apiReqPara?.SECURITY_CD
                  ) {
                    let postData = await getLimitExpDate({
                      ...apiReqPara,
                      TRAN_DT: format(new Date(field?.value), "dd/MMM/yyyy"),
                      SHORT_LMT_FLAG:
                        dependent?.SHORT_LMT_FLAG?.value === "Y" ||
                        (typeof dependent?.SHORT_LMT_FLAG?.value ===
                          "boolean" &&
                          dependent?.SHORT_LMT_FLAG?.value)
                          ? "Y"
                          : "N",
                    });

                    let apiRespMSGdata = postData?.[0]?.MSG;
                    let isReturn;
                    const isLessThanDate = isBefore(
                      startOfDay(new Date(authState?.workingDate)),
                      startOfDay(new Date(field?.value))
                    );

                    if (apiRespMSGdata?.length) {
                      for (let i = 0; i < apiRespMSGdata?.length; i++) {
                        if (apiRespMSGdata[i]?.O_STATUS !== "0") {
                          let btnName = await formState.MessageBox({
                            messageTitle: apiRespMSGdata[i]?.O_MSG_TITLE
                              ? apiRespMSGdata[i]?.O_MSG_TITLE
                              : apiRespMSGdata[i]?.O_STATUS === "999"
                              ? "ValidationFailed"
                              : apiRespMSGdata[i]?.O_STATUS === "99"
                              ? "confirmation"
                              : "ALert",
                            message: apiRespMSGdata[i]?.O_MESSAGE,
                            buttonNames:
                              apiRespMSGdata[i]?.O_STATUS === "99"
                                ? ["Yes", "No"]
                                : ["Ok"],
                            icon:
                              apiRespMSGdata[i]?.O_STATUS === "999"
                                ? "ERROR"
                                : apiRespMSGdata[i]?.O_STATUS === "99"
                                ? "CONFIRM"
                                : "WARNING",
                          });
                          if (
                            btnName === "No" ||
                            apiRespMSGdata[i]?.O_STATUS === "999"
                          ) {
                            return {
                              EXPIRY_DT: { value: "", isFieldFocused: false },
                              TRAN_DT: { value: "", isFieldFocused: true },
                              EXP_DT_DISABLE: { value: "" },
                            };
                          } else if (
                            btnName === "Yes" ||
                            apiRespMSGdata[i]?.O_STATUS === "99"
                          ) {
                            isReturn = true;
                          }
                        } else {
                          isReturn = true;
                        }
                      }
                    } else if (
                      postData?.[0]?.SET_EXP_DT &&
                      postData?.[0]?.EXPIRY_DT
                    ) {
                      isReturn = true;
                    }

                    if (Boolean(isReturn)) {
                      return {
                        EXPIRY_DT: {
                          value:
                            postData?.[0]?.SET_EXP_DT === "Y" &&
                            postData?.[0]?.EXPIRY_DT,
                          isFieldFocused: true,
                        },
                        EXP_DT_DISABLE: {
                          value: postData?.[0]?.EXP_DT_DISABLE,
                        },
                        EXPIRED_FLAG: {
                          value:
                            typeof isLessThanDate === "boolean" &&
                            isLessThanDate
                              ? "P"
                              : "A",
                        },
                      };
                    }
                  }
                  return {};
                },
              };
            } else if (item.name === "RESOLUTION_DATE") {
              return {
                ...item,
                validate: (currentField) => {
                  let formatdate = new Date(currentField?.value);
                  if (currentField?.value && !isValid(formatdate)) {
                    return t("Mustbeavaliddate");
                  }
                  return "";
                },
              };
            } else if (item.name === "EXPIRY_DT") {
              return {
                ...item,
                defaultValue:
                  getLimitExpDt?.[0]?.SET_EXP_DT === "Y"
                    ? getLimitExpDt?.[0]?.EXPIRY_DT
                    : "",

                dependentFields: [
                  "FD_NO",
                  "LIMIT_TYPE",
                  "EXP_DT_DISABLE",
                  "TRAN_DT",
                ],
                validate: (currentField, dependentField) => {
                  let formatdate = new Date(currentField?.value);
                  if (!currentField?.value) {
                    return "PleaseEnterExpiryDate";
                  } else if (Boolean(formatdate) && !isValid(formatdate)) {
                    return t("Mustbeavaliddate");
                  } else if (
                    lessThanDate(
                      currentField?.value,
                      dependentField?.TRAN_DT?.value,
                      {
                        ignoreTime: true,
                      }
                    )
                  ) {
                    return t("ExpirydtshouldgreaterthanEffdt");
                  }
                  return "";
                },
                isReadOnly: (fieldData, dependent) => {
                  if (
                    getLimitExpDt?.[0]?.EXP_DT_DISABLE === "Y" ||
                    dependent?.EXP_DT_DISABLE?.value === "Y"
                  ) {
                    return true;
                  }
                  return false;
                },

                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (
                    isValid(field?.value) &&
                    isValid(dependentFields?.TRAN_DT?.value)
                  ) {
                    if (
                      new Date(dependentFields?.TRAN_DT?.value) >
                      new Date(field?.value)
                    ) {
                      let btnName = await formState?.MessageBox({
                        messageTitle: "DataValidationFailed",
                        message:
                          "ExpiryDateshouldbegreterthanorequalEffectiveDate",
                        buttonNames: ["Ok"],
                        icon: "WARNING",
                      });
                      if (btnName === "Ok") {
                        return {
                          EXPIRY_DT: {
                            value: "",
                            isFieldFocused: true,
                          },
                        };
                      }
                    }
                  }
                },
              };
            } else if (item.name === "SECURITY_VALUE") {
              return {
                ...item,
                dependentFields: ["MARGIN", "SEC_INT_AMT"],
                FormatProps: {
                  allowNegative: true,
                },
                postValidationSetCrossFieldValues: (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (field.value) {
                    let secamt = dependentFields?.MARGIN?.value
                      ? Number(field.value) -
                        (Number(field.value) *
                          Number(dependentFields?.MARGIN?.value)) /
                          100
                      : Number(field.value);

                    let lmtAmt =
                      secamt ?? 0 + Number(dependentFields?.SEC_INT_AMT?.value);
                    return {
                      SEC_AMT: {
                        value: secamt,
                        ignoreUpdate: true,
                      },
                      LIMIT_AMOUNT: {
                        value: lmtAmt.toString(),
                      },
                      LIMIT_RATE_API: {
                        value: lmtAmt.toString(),
                      },
                    };
                  }
                  return {};
                },
              };
            } else if (item.name === "MARGIN") {
              return {
                ...item,
                defaultValue: apiReqPara?.LIMIT_MARGIN,
                FormatProps: {
                  isAllowed: (values) => {
                    //@ts-ignore
                    if (values.floatValue <= 1000) {
                      return true;
                    }
                    return false;
                  },
                },
                dependentFields: [
                  "SECURITY_CD",
                  "SECURITY_VALUE",
                  "SEC_INT_AMT",
                ],
                // setValueOnDependentFieldsChange: () => {
                //   return apiReqPara?.LIMIT_MARGIN;
                // },
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (field.value) {
                    let secamt =
                      Number(dependentFields?.SECURITY_VALUE?.value) -
                      (Number(dependentFields?.SECURITY_VALUE?.value) *
                        Number(field?.value)) /
                        100;

                    let lmtAmt =
                      secamt + Number(dependentFields?.SEC_INT_AMT?.value);
                    return {
                      SEC_AMT: {
                        value: secamt,
                        ignoreUpdate: true,
                      },
                      LIMIT_AMOUNT: {
                        value: lmtAmt.toString(),
                      },
                      LIMIT_RATE_API: {
                        value: lmtAmt.toString(),
                      },
                    };
                  }
                  return {};
                },
              };
            } else if (item.name === "SEC_AMT") {
              return {
                ...item,
                dependentFields: ["SECURITY_VALUE", "SEC_INT_AMT"],
                FormatProps: {
                  allowNegative: true,
                },
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (
                    field.value &&
                    Number(field.value) <=
                      Number(dependentFields?.SECURITY_VALUE?.value)
                  ) {
                    let margin =
                      100 -
                      (Number(field?.value) * 100) /
                        Number(dependentFields?.SECURITY_VALUE?.value);

                    let limitamt =
                      Number(field?.value) +
                      Number(dependentFields?.SEC_INT_AMT?.value);

                    return {
                      MARGIN: {
                        value: margin.toString(),
                        ignoreUpdate: true,
                      },
                      LIMIT_AMOUNT: {
                        value: limitamt.toString(),
                      },
                      LIMIT_RATE_API: {
                        value: limitamt.toString(),
                      },
                    };
                  }
                  return {};
                },
                validate: (currentField, dependentFields) => {
                  if (
                    Number(currentField.value) >
                    Number(dependentFields?.SECURITY_VALUE?.value)
                  ) {
                    return "LimitAmountcantgreaterthanSecurityvalue";
                  }
                  return "";
                },
              };
            } else if (item.name === "INT_AMT") {
              return {
                ...item,
                dependentFields: ["SEC_INT_MARGIN", "SEC_AMT"],
                FormatProps: {
                  allowNegative: true,
                },
                postValidationSetCrossFieldValues: (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (field.value) {
                    let setIntAmt = dependentFields?.SEC_INT_MARGIN?.value
                      ? Number(field.value) -
                        (Number(field.value) *
                          Number(dependentFields?.SEC_INT_MARGIN?.value)) /
                          100
                      : Number(field.value);
                    return {
                      SEC_INT_AMT: {
                        value: setIntAmt,
                        ignoreUpdate: true,
                      },
                      LIMIT_AMOUNT: {
                        value:
                          setIntAmt + Number(dependentFields?.SEC_AMT?.value),
                      },
                      LIMIT_RATE_API: {
                        value:
                          setIntAmt + Number(dependentFields?.SEC_AMT?.value),
                      },
                    };
                  }
                  return {};
                },
              };
            } else if (item.name === "SEC_INT_MARGIN") {
              return {
                ...item,
                FormatProps: { placeholder: item?.placeholder },
                dependentFields: ["INT_AMT", "SEC_AMT"],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (field.value) {
                    let setIntAmt =
                      Number(dependentFields?.INT_AMT?.value) -
                      (Number(dependentFields?.INT_AMT?.value) *
                        Number(field?.value)) /
                        100;

                    let lmtAmt =
                      setIntAmt + Number(dependentFields?.SEC_AMT?.value);

                    return {
                      SEC_INT_AMT: {
                        value: setIntAmt,
                        ignoreUpdate: true,
                      },
                      LIMIT_AMOUNT: {
                        value: lmtAmt.toString(),
                      },
                      LIMIT_RATE_API: {
                        value: lmtAmt.toString(),
                      },
                    };
                  }
                  return {};
                },
              };
            } else if (item.name === "SEC_INT_AMT") {
              return {
                ...item,
                dependentFields: ["INT_AMT", "SEC_AMT"],
                FormatProps: {
                  allowNegative: true,
                },
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  if (
                    field.value &&
                    Number(field.value) <=
                      Number(dependentFields?.INT_AMT?.value)
                  ) {
                    let secIntMargin =
                      100 -
                      (Number(field?.value) * 100) /
                        Number(dependentFields?.INT_AMT?.value);
                    let limtamt =
                      Number(field?.value) +
                      Number(dependentFields?.SEC_AMT?.value);
                    return {
                      SEC_INT_MARGIN: {
                        value: secIntMargin.toString(),
                        ignoreUpdate: true,
                      },
                      LIMIT_AMOUNT: {
                        value: limtamt.toString(),
                      },
                      LIMIT_RATE_API: {
                        value: limtamt.toString(),
                      },
                    };
                  }
                  return {};
                },
                validate: (currentField, dependentFields) => {
                  if (
                    Number(currentField.value) >
                    Number(dependentFields?.INT_AMT?.value)
                  ) {
                    return "SecIntAmountcantgreaterthanIntrestAmount";
                  }
                  return "";
                },
              };
            } else if (item.name === "LIMIT_AMOUNT") {
              return {
                ...item,
                FormatProps: {
                  allowNegative: true,
                },
                validate: (currentField) => {
                  let formatdate = Number(currentField?.value);
                  if (!currentField?.value) {
                    return "LimitAmtisrequired";
                  } else if (formatdate < 0) {
                    return "Limitamountshouldbegreaterthanzero";
                  }
                  return "";
                },
                postValidationSetCrossFieldValues: async (field) => {
                  if (field?.value) {
                    return {
                      LIMIT_RATE_API: { value: field?.value.toString() },
                    };
                  }
                  return {};
                },
              };
            } else if (item.name === "LIMIT_RATE_API") {
              return {
                ...item,
                validationRun: "all",
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependentFields
                ) => {
                  const PENAL_FLAG =
                    data?.find((e) => e?.FIELD_NAME === "PENAL_RATE")
                      ?.COMPONENT_TYPE === "hidden"
                      ? "N"
                      : "Y";
                  if (
                    typeof field?.value === "string" &&
                    Number(field?.value) > 0 &&
                    apiReqPara?.ACCT_CD &&
                    apiReqPara?.SECURITY_CD
                  ) {
                    let ApiReq = {
                      COMP_CD: apiReqPara?.COMP_CD,
                      BRANCH_CD: apiReqPara?.BRANCH_CD,
                      ACCT_TYPE: apiReqPara?.ACCT_TYPE,
                      ACCT_CD: apiReqPara?.ACCT_CD,
                      PENAL_FLAG: PENAL_FLAG ?? "",
                      SECURITY_CD: apiReqPara?.SECURITY_CD,
                      SECURITY_TYPE: apiReqPara?.SECURITY_TYPE,
                      LIMIT_AMT: field?.value,
                      SCREEN_REF: formState?.docCD,
                      WORKING_DATE: authState?.workingDate ?? "",
                      USERNAME: authState?.user?.id ?? "",
                      USERROLE: authState?.role ?? "",
                    };

                    let postData = await limitRate(ApiReq);

                    let apiRespMSGdata = postData?.[0]?.MSG;
                    let isReturn;
                    const messagebox = async (
                      msgTitle,
                      msg,
                      buttonNames,
                      status,
                      icon
                    ) => {
                      let buttonName = await formState.MessageBox({
                        messageTitle: msgTitle,
                        message: msg,
                        buttonNames: buttonNames,
                        icon: icon,
                      });
                      return { buttonName, status };
                    };
                    if (apiRespMSGdata?.length) {
                      for (let i = 0; i < apiRespMSGdata?.length; i++) {
                        if (apiRespMSGdata[i]?.O_STATUS !== "0") {
                          let btnName = await messagebox(
                            apiRespMSGdata[i]?.O_MSG_TITLE
                              ? apiRespMSGdata[i]?.O_MSG_TITLE
                              : apiRespMSGdata[i]?.O_STATUS === "999"
                              ? "ValidationFailed"
                              : apiRespMSGdata[i]?.O_STATUS === "99"
                              ? "confirmation"
                              : "ALert",
                            apiRespMSGdata[i]?.O_MESSAGE,
                            apiRespMSGdata[i]?.O_STATUS === "99"
                              ? ["Yes", "No"]
                              : ["Ok"],
                            apiRespMSGdata[i]?.O_STATUS,
                            apiRespMSGdata[i]?.O_STATUS === "999"
                              ? "ERROR"
                              : apiRespMSGdata[i]?.O_STATUS === "99"
                              ? "CONFIRM"
                              : "WARNING"
                          );

                          if (
                            btnName.buttonName === "No" ||
                            btnName.status === "999"
                          ) {
                            return {
                              PENAL_RATE: { value: "" },
                              INT_RATE: { value: "" },
                            };
                          } else {
                            isReturn = true;
                          }
                        } else {
                          isReturn = true;
                        }
                      }
                    }
                    if (Boolean(isReturn)) {
                      return {
                        PENAL_RATE: { value: postData?.[0]?.PENAL_RATE ?? "" },
                        INT_RATE: {
                          value: !bfd && !brd && postData?.[0]?.INT_RATE,
                        },
                      };
                    }
                  }
                  // else if (!field?.value) {
                  //   return {
                  //     PENAL_RATE: { value: "" },
                  //     INT_RATE: { value: "" },
                  //   };
                  // }
                  return {};
                },
              };
            } else if (item.name === "CHARGE_AMT") {
              return {
                ...item,
                // dependentFields: ["SECURITY_CD"],
                defaultValue: apiReqPara?.HDN_CHARGE_AMT,

                // setValueOnDependentFieldsChange: () => {
                //   return apiReqPara?.HDN_CHARGE_AMT;
                // },
                postValidationSetCrossFieldValues: (field) => {
                  if (field.value) {
                    return {
                      SERVICE_TAX: {
                        value:
                          apiReqPara?.HDN_GST_ROUND === "3"
                            ? Math.floor(
                                (parseInt(field?.value) *
                                  parseInt(apiReqPara?.HDN_TAX_RATE)) /
                                  100
                              ) ?? ""
                            : apiReqPara?.HDN_GST_ROUND === "2"
                            ? Math.ceil(
                                (parseInt(field?.value) *
                                  parseInt(apiReqPara?.HDN_TAX_RATE)) /
                                  100
                              ) ?? ""
                            : apiReqPara?.HDN_GST_ROUND === "1"
                            ? Math.round(
                                (parseInt(field?.value) *
                                  parseInt(apiReqPara?.HDN_TAX_RATE)) /
                                  100
                              ) ?? ""
                            : (parseInt(field?.value) *
                                parseInt(apiReqPara?.HDN_TAX_RATE)) /
                              100,
                      },
                    };
                  }
                  return {};
                },
              };
            } else if (item.name === "SERVICE_TAX") {
              return {
                ...item,
                // dependentFields: ["SECURITY_CD"],
                defaultValue: apiReqPara?.HDN_GST_AMT,
                // setValueOnDependentFieldsChange: () => {
                //   return apiReqPara?.HDN_GST_AMT;
                // },
              };
            } else if (item.name === "REMARKS") {
              return {
                ...item,
                txtTransform: "uppercase",
                maxLength: 100,
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
              };
            } else if (item.name === "SECURITY") {
              return {
                ...item,
                maxLength: 50,
                txtTransform: "uppercase",
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
              };
            } else if (item.name === "DOCKET_NO") {
              return {
                ...item,
                maxLength: 16,
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
              };
            } else if (item.name === "RESOLUTION_NO") {
              return {
                ...item,
                maxLength: 15,
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
              };
            } else if (item.name === "INT_RATE") {
              return {
                ...item,
                FormatProps: { placeholder: item?.placeholder },
                maxLength: 100,
                preventSpecialChars:
                  sessionStorage.getItem("specialChar") || "",
                validate: (currentField) => {
                  let formatdate = Number(currentField?.value);
                  if (!currentField?.value) {
                    return "PleaseEnterIntrestrate";
                  } else if (formatdate < 0) {
                    return "Interestrateshouldbegreaterthanzero";
                  }
                  return "";
                },
              };
            } else if (item.name === "PENAL_INT_RATE") {
              return {
                ...item,
                dependentFields: ["FD_ACCT_CD"],
                setValueOnDependentFieldsChange: (dependentFields) => {
                  if (dependentFields?.FD_ACCT_CD?.value === "") {
                    return "N";
                  }
                  return "Y";
                },
              };
            } else if (
              item.name === "SHORT_LMT_FLAG" &&
              apiReqPara?.SHORT_LMT_VISIBLE === "Y"
            ) {
              return {
                ...item,
                render: {
                  componentType: "checkbox",
                },
                validationRun: "onChange",
                dependentFields: ["TRAN_DT"],
                postValidationSetCrossFieldValues: async (
                  field,
                  formState,
                  authState,
                  dependent
                ) => {
                  if (field?.value) {
                    let postData = await getLimitExpDate({
                      ...apiReqPara,
                      TRAN_DT:
                        dependent?.TRAN_DT?.value &&
                        isValid(dependent?.TRAN_DT?.value)
                          ? format(
                              new Date(dependent?.TRAN_DT?.value),
                              "dd/MMM/yyyy"
                            )
                          : apiReqPara?.WORKING_DATE,
                      SHORT_LMT_FLAG:
                        field?.value === "Y" ||
                        (typeof field?.value === "boolean" && field?.value)
                          ? "Y"
                          : "N",
                    });
                    if (postData?.length) {
                      return {
                        EXPIRY_DT: {
                          value:
                            postData?.[0]?.SET_EXP_DT === "Y" &&
                            postData?.[0]?.EXPIRY_DT,
                          isFieldFocused: true,
                        },
                        EXP_DT_DISABLE: {
                          value: postData?.[0]?.EXP_DT_DISABLE,
                        },
                      };
                    }
                  }
                },
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

export const getFDbranchDDlist = async (COMP_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITFDBRANCHDDW", {
      COMP_CD: COMP_CD,
    });

  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ BRANCH_CD, DISP_NM, ...other }) => {
        return {
          value: BRANCH_CD,
          label: DISP_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(
      message +
        " Check the GETLIMITFDBRANCHDDW API for the FD-Branch-List drop-down",
      messageDetails
    );
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
          label: ACCT_TYPE + " - " + TYPE_NM,
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

export const getFDdetailBRD = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDBRDDETAIL", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
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

export const getLimitNSCdetail = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITNSCDTLBTN", {
      ...apiReqPara,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      item.COLLATERAL_RATE = parseFloat(item.COLLATERAL_RATE).toFixed(2);
      item.DISPLAY_PERIOD_CD =
        item?.PERIOD_CD === "D"
          ? "DAY(S)"
          : item?.PERIOD_CD === "M"
          ? "MONTH(S)"
          : item?.PERIOD_CD === "Y"
          ? "YEAR(S)"
          : item?.PERIOD_CD;
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getLimitFDdetail = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDDTLS", {
      ...apiReqPara,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      item.RATE = parseFloat(item.RATE).toFixed(2);
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getLimitDTL = async (limitDetail) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITGRIDDATADISP", {
      ...limitDetail,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.ALLOW_FORCE_EXP === "Y") {
        item._rowColor = "rgb(255, 196, 225)";
      }
      item.CONFIRMED_DISPLAY =
        item?.CONFIRMED === "Y" ? "Confirmed" : "Pending";
      item.PENAL_RATE =
        !item.PENAL_RATE || item.PENAL_RATE === "0" ? 0 : item.PENAL_RATE;
      item.CR_KEY = "BLANK";
      item.ignoreValue = Boolean(item?.EXPIRED_FLAG !== "A");
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudLimitEntryData = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOLIMITENTRYDML", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateInsert = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATELIMITDATA", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDelete = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDDELETELIMITDATA", {
      ENT_DATE: apiReq.ENTERED_DATE
        ? format(new Date(apiReq.ENTERED_DATE), "dd/MMM/yyyy")
        : "",
      TRAN_CD: apiReq.TRAN_CD,
      EXP_FLAG: apiReq.EXPIRED_FLAG,
      BRANCH_CD: apiReq.BRANCH_CD,
      ACCT_TYPE: apiReq.ACCT_TYPE,
      ACCT_CD: apiReq.ACCT_CD,
      FD_TYPE: apiReq.FD_TYPE,
      FD_AC_NO: apiReq.FD_ACCT_CD,
      FD_NO: apiReq.FD_NO,
      FD_COMP_CD: apiReq.FD_COMP_CD,
      FD_BRANCH: apiReq.FD_BRANCH_CD,
      COMP_CD: apiReq.COMP_CD,
      FD_AC_TYP: apiReq.FD_TYPE,
      WORKING_DATE: apiReq.WORKING_DATE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const limitRate = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITRATE", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const limitConfirm = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOLIMITCONFRIMATION", { ...apireq });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getLimitExpDate = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLIMITEXPDATE", {
      COMP_CD: apireq?.COMP_CD,
      BRANCH_CD: apireq?.BRANCH_CD,
      ACCT_TYPE: apireq?.ACCT_TYPE,
      ACCT_CD: apireq?.ACCT_CD,
      SECURITY_CD: apireq?.SECURITY_CD,
      LIMIT_AMOUNT: apireq?.SANCTIONED_AMT,
      TRAN_DT: apireq?.TRAN_DT,
      AD_HOC_LIMIT_FLG: apireq?.LIMIT_TYPE,
      SHORT_LMT_FLAG: apireq?.SHORT_LMT_FLAG,
      WORKING_DATE: apireq?.WORKING_DATE,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(
      message + " Check the GETLIMITEXPDATE API",
      messageDetails
    );
  }
};
