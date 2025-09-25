import { format, isValid } from "date-fns";
import * as API from "../../../../api";
import {
  greaterThanDate,
  lessThanDate,
  utilFunction,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { handleDisplayMessages } from "components/utilFunction/function";
import { PREVENT_SPECIAL_CHAR } from "components/utilFunction/constant";

export const entity_detail_legal_meta_data = (unique) => {
  return {
    form: {
      name: "personal_legal_detail_prefix_details_form",
      label: "",
      resetFieldOnUnmount: false,
      validationRun: "onBlur",
      submitAction: "home",
      render: {
        ordering: "auto",
        renderType: "simple",
        gridConfig: {
          item: {
            xs: 12,
            sm: 6,
          },
          container: {
            direction: "row",
            spacing: 0.5,
          },
        },
      },
      componentProps: {
        textField: {
          fullWidth: true,
        },
        select: {
          fullWidth: true,
        },
        datePicker: {
          fullWidth: true,
        },
        numberFormat: {
          fullWidth: true,
        },
        inputMask: {
          fullWidth: true,
        },
        datetimePicker: {
          fullWidth: true,
        },
        divider: {
          fullWidth: true,
        },
      },
    },
    fields: [
      {
        render: {
          componentType: "textField",
        },
        name: "SURNAME",
        label: "EntityName",
        required: true,
        isFieldFocused:
          unique?.customerIDctx !== "" || unique?.req_cd_ctx !== ""
            ? true
            : false,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["EntityNameIsRequired"] }],
        },
        maxLength: 100,
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        placeholder: "EntityName",
        type: "text",
        txtTransform: "uppercase",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (currentField?.value && currentField?.value?.trim()?.length < 2) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("lastNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                SURNAME: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
        GridProps: { md: 4.5, lg: 3.6, xl: 3 },
      },
      {
        render: {
          componentType: "formbutton",
        },
        name: "SEARCH_BTN",
        label: "Search",
        endsIcon: "Search",
        rotateIcon: "scale(1.5)",
        placeholder: "",
        type: "text",
        ignoreInSubmit: true,
        isReadOnly: (...arg) => {
          if (arg?.[2]?.state?.formmodectx === "view") {
            return true;
          }
          return false;
        },
        dependentFields: ["SURNAME"],
        GridProps: { md: 1.5, lg: 1.2, xl: 1 },
      },

      {
        render: {
          componentType: "autocomplete",
        },
        name: "COMMU_CD",
        label: "Religion",
        // required: true,
        // schemaValidation: {
        //   type: "string",
        //   rules: [{ name: "required", params: ["ReligionIsRequired"] }],
        // },
        options: (dependentValue, formState, _, authState) =>
          API.getCommunityList(
            authState?.companyID,
            authState?.user?.branchCode,
            formState?.CustomerType
          ),
        _optionsKey: "CommunityOptions",
        placeholder: "selectReligion",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "CASTE_CD",
        label: "Caste",
        placeholder: "selectCaste",
        options: () => API.getPMISCData("CASTE_CD"),
        _optionsKey: "casteCD",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },

      {
        render: {
          componentType: "autocomplete",
        },
        name: "TRADE_CD",
        label: "Occupation",
        options: (dependentValue, formState, _, authState) =>
          API.getOccupationDTL(
            authState?.companyID,
            authState?.user?.branchCode,
            formState?.CustomerType
          ),
        _optionsKey: "occupationOpdtl",
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["OccupationIsRequired"] }],
        },
        placeholder: "SelectOccupation",
        defaultOptionLabel: "Occupation",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "SUB_CUST_TYPE",
        label: "SubCustomerType",
        options: () => API.getPMISCData("SUB_CUST_TYPE"),
        _optionsKey: "getSubCustTypeOpdtl",
        placeholder: "SelectSubCustomerType",
        defaultOptionLabel: "SubCustomerType",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "GROUP_CD",
        label: "Group",
        options: (dependentValue, formState, _, authState) =>
          API.getCustomerGroupOptions(
            authState?.companyID,
            authState?.user?.branchCode
          ),
        _optionsKey: "GroupOptionsdtl",
        placeholder: "SelectGroup",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "RATE_CD",
        label: "Rating",
        options: (dependentValue, formState, _, authState) =>
          API.getRatingOpDTL(authState?.companyID, authState?.user?.branchCode),
        _optionsKey: "ratingOpdtl",
        placeholder: "SelectRating",
        defaultOptionLabel: "Rating",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "BIRTH_DT",
        label: "InceptionDate",
        isMaxWorkingDate: true,
        required: true,
        type: "text",
        placeholder: "InceptionDate",
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["InceptionDateIsRequired"] }],
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value) {
            if (!isValid(currentField?.value)) {
              await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                BIRTH_DT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            } else if (
              greaterThanDate(
                new Date(currentField?.value),
                new Date(authState?.workingDate ?? ""),
                {
                  ignoreTime: true,
                }
              )
            ) {
              await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("DateShouldBeLessThanTodaysDate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                BIRTH_DT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }

          if (
            currentField?.value &&
            utilFunction.isValidDate(
              utilFunction.getParsedDate(currentField?.value)
            )
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState.user.branchCode ?? "",
              BIRTH_DT: Boolean(currentField?.value)
                ? format(
                    new Date(currentField?.value),
                    "dd/MMM/yyyy"
                  ).toUpperCase()
                : "",
              WORKING_DATE: authState?.workingDate ?? "",
              CUSTOMER_TYPE: formState?.CustomerType ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await API?.getMinorMajorAgeData(reqParameters);
            formState?.handleButtonDisable(false);
            let returnVal;
            if (postData?.length > 0) {
              const response = await handleDisplayMessages(
                postData,
                formState?.MessageBox
              );

              if (Object.keys(response).length > 0) {
                returnVal = response;
              } else {
                returnVal = "";
              }
            }
            const ageFinal = Math.floor(
              Number(returnVal?.AGE ?? "0")
            ).toString();
            return {
              BIRTH_DT: returnVal
                ? {
                    value: currentField?.value,
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },

              AGE: { value: ageFinal ?? "", ignoreUpdate: false },
            };
          } else if (!currentField?.value) {
            return {
              AGE: { value: "", ignoreUpdate: false },
            };
          }
          return {};
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "AGE",
        label: "Age",
        placeholder: "Age",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        dependentFields: ["BIRTH_DT"],
        // ignoreInSubmit: true,
      },
      {
        render: {
          componentType: "select",
        },
        name: "EXPLICIT_TDS",
        label: "ExplicitTDS",
        defaultValue: "N",
        options: [
          { label: "YES", value: "T" },
          { label: "NO", value: "N" },
        ],
        // required: true,
        // schemaValidation: {
        //   type: "string",
        //   rules: [{ name: "required", params: ["ExplicitTDSIsRequired"] }],
        // },
        placeholder: "ExplicitTDS",
        defaultOptionLabel: "ExplicitTDS",
        type: "text",
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(field?.value)) {
            if (field?.value === "T") {
              const buttonName = await formState.MessageBox({
                messageTitle: "CONFIRMATION",
                message:
                  "SystemWillDeductTDSFromCustomersInterestEvenIfItIsUnderTDSLimit",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (buttonName === "No") {
                return {
                  EXPLICIT_TDS: {
                    value: "N",
                    // ignoreUpdate: true,
                  },
                };
              }
              if (buttonName === "Yes") {
                return {
                  GSTIN: {
                    value: "",
                    isFieldFocused: true,
                  },
                };
              }
            }
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "GSTIN",
        label: "GSTIN",
        placeholder: "GSTIN",
        maxLength: 15,
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        validate: (columnValue, allField, flag) => {
          const TIN_ISSUING_COUNTRY = flag?.TIN_ISSUING_COUNTRY;
          const TIN = flag?.TIN;
          if (!Boolean(columnValue?.value)) {
            if (Boolean(TIN_ISSUING_COUNTRY) && !Boolean(TIN)) {
              return "GSTINIsRequired";
            } else {
              return "";
            }
          } else {
            return API.validateGSTIN(columnValue, allField, flag);
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "KYC_REVIEW_DT",
        label: "KYCRevisedDt",
        placeholder: "KYCRevisedDt",
        isMaxWorkingDate: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (Boolean(currentField?.value)) {
            if (!isValid(currentField?.value)) {
              await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                KYC_REVIEW_DT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            } else if (
              greaterThanDate(
                new Date(currentField.value),
                new Date(formState?.WORKING_DATE),
                {
                  ignoreTime: true,
                }
              )
            ) {
              await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("KYCRevisedDateShouldBeLessThanTodaysDate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                KYC_REVIEW_DT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
          return {};
        },
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "RISK_CATEG",
        label: "RiskCategory",
        options: () => API.getRiskCateg({ CALLFROM: "MAINTAB" }),
        _optionsKey: "kycRiskCategOpdtl",
        placeholder: "SelectRiskCategory",
        defaultOptionLabel: "SelectRiskCategory",
        type: "text",
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !Boolean(formState?.state?.customerIDctx);
        },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return Boolean(
            formState?.state?.tabsApiResctx?.[0]?.DISABLE_RISK_CATEG === "Y"
          );
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "RISK_REVIEW_DT",
        label: "RiskReviewDate",
        placeholder: "DD/MM/YYYY",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(currentField?.value)) {
            if (!isValid(new Date(currentField?.value))) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  RISK_REVIEW_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              greaterThanDate(
                new Date(authState?.workingDate),
                new Date(currentField.value),
                {
                  ignoreTime: true,
                }
              )
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("RiskreviewdateshouldbegreaterthanTodaysDate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  RISK_REVIEW_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return Boolean(
            formState?.state?.tabsApiResctx?.[0]?.SHOW_RISK_REVIEW_DT === "N"
          );
        },
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return Boolean(
            formState?.state?.tabsApiResctx?.[0]?.SHOW_RISK_REVIEW_DT === "YY"
          );
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "NATIONALITY",
        label: "Nationality",
        options: (dependentValue, formState, _, authState) =>
          API.getCountryOptions(
            authState?.companyID,
            authState?.user?.branchCode
          ),
        _optionsKey: "countryOptionsdtl",
        placeholder: "selectNationality",
        defaultOptionLabel: "selectNationality",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "RESIDENCE_STATUS",
        label: "ResidenceStatus",
        options: () => API.getPMISCData("RESIDE_STATUS"),
        _optionsKey: "ResisdenceStatusdtl",
        placeholder: "selectResidenceStatus",
        defaultOptionLabel: "ResidenceStatus",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "CCIL_ID",
        label: "CCILID",
        maxLength: 20,
        placeholder: "CCILID",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        FormatProps: {
          isAllowed: (values) => {
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "LEI_NO",
        label: "LEINO",
        txtTransform: "uppercase",
        maxLength: 20,
        placeholder: "LEINO",
        FormatProps: {
          isAllowed: (values) => {
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value) {
            const reqParameters = {
              LEI_NO: currentField.value ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await API?.leiNoValidation(reqParameters);
            formState?.handleButtonDisable(false);

            let btn99, returnVal;
            const getButtonName = async (obj) =>
              await formState.MessageBox(obj);

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                await getButtonName({
                  messageTitle: postData?.[i]?.O_MSG_TITLE
                    ? postData?.[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  await getButtonName({
                    messageTitle: postData?.[i]?.O_MSG_TITLE
                      ? postData?.[i]?.O_MSG_TITLE
                      : "Alert",
                    message: postData?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData[i];
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName } = await getButtonName({
                  messageTitle: postData?.[i]?.O_MSG_TITLE
                    ? postData?.[i]?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            return {
              LEI_NO: returnVal
                ? {
                    value: currentField?.value,
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            };
          }
          return {};
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "LEI_EXPIRY_DATE",
        label: "LEIExpiryDate",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(currentField?.value)) {
            if (!isValid(new Date(currentField?.value))) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  LEI_EXPIRY_DATE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              greaterThanDate(
                new Date(authState?.workingDate),
                new Date(currentField.value),
                {
                  ignoreTime: true,
                }
              )
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("LEIexpirydateshouldbegreaterthanTodaysDate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  LEI_EXPIRY_DATE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        placeholder: "LEIExpiryDate",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "PARENT_COMPANY",
        label: "ParentCompany",
        options: [
          { label: "YES", value: "Y" },
          { label: "NO", value: "N" },
        ],
        placeholder: "ParentCompany",
        defaultOptionLabel: "ParentCompany",
        validationRun: "all",
        type: "text",
        postValidationSetCrossFieldValues: (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (field?.value === "N") {
            return {
              PARENT_COMP_NM: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          } else return null;
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (formState?.state?.tabsApiResctx?.[0]?.SHOW_ADDL_FIELDS === "Y") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "PARENT_COMP_NM",
        label: "ParentCompanyName",
        txtTransform: "uppercase",
        maxLength: 100,
        placeholder: "ParentCompanyName",
        dependentFields: ["PARENT_COMPANY"],
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.PARENT_COMPANY?.value === "N") {
            return true;
          }
          return false;
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (formState?.state?.tabsApiResctx?.[0]?.SHOW_ADDL_FIELDS === "Y") {
            return false;
          } else {
            return true;
          }
        },
        type: "text",
        GridProps: { xs: 12, sm: 12, md: 6, lg: 4.5, xl: 3 },
      },

      {
        render: {
          componentType: "autocomplete",
        },
        name: "PARNT_COMP_NATIONALITY",
        label: "COMPNATIONALITY",
        options: (dependentValue, formState, _, authState) =>
          API.getCountryOptions(
            authState?.companyID,
            authState?.user?.branchCode
          ),
        _optionsKey: "countryOptionsdtl",
        placeholder: "SelectCompNationality",
        defaultOptionLabel: "COMPNATIONALITY",
        type: "text",
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (formState?.state?.tabsApiResctx?.[0]?.SHOW_ADDL_FIELDS === "Y") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "HQ_CUST_ID",
        label: "HQCustID",
        maxLength: 15,
        placeholder: "HQCustID",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        FormatProps: {
          isAllowed: (values) => {
            if (values?.value?.length > 15) {
              return false;
            }
            return true;
          },
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (formState?.state?.tabsApiResctx?.[0]?.SHOW_ADDL_FIELDS === "Y") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "HQ_INDUSTRY",
        label: "HQIndustry",
        options: (dependentValue, formState, _, authState) =>
          API.getPMISCData("CST_HQ_IND"),
        _optionsKey: "HQindustrydtl",
        placeholder: "SelectHQIndustry",
        defaultOptionLabel: "HQIndustry",
        type: "text",
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (formState?.state?.tabsApiResctx?.[0]?.SHOW_ADDL_FIELDS === "Y") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 2 },
      },

      {
        render: {
          componentType: "textField",
        },
        name: "REMARKS",
        sequence: 1,
        type: "text",
        label: "OtherDetails",
        placeholder: "OtherDetails",
        multiline: true,
        minRows: 2,
        maxRows: 5,
        GridProps: { xs: 12, md: 12, sm: 12, xl: 12, lg: 12 },
        maxLength: 300,
      },
    ],
  };
};
