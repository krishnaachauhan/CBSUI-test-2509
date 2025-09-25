import {
  greaterThanDate,
  GridMetaDataType,
  lessThanInclusiveDate,
  utilFunction,
} from "@acuteinfo/common-base";
import { differenceInYears, format, isValid } from "date-fns";
import { t } from "i18next";
import * as API from "../../../../api";
import {
  getMinorMajorAgeData,
  validateShareMemAcct,
} from "pages_audit/pages/operations/acct-mst/api";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { PREVENT_SPECIAL_CHAR } from "components/utilFunction/constant";

export const personal_detail_prefix_data = (unique) => {
  return {
    form: {
      name: "personal_detail_prefix_details_form",
      label: "",
      resetFieldOnUnmount: false,
      validationRun: "onBlur",
      submitAction: "home",
      render: {
        ordering: "sequence",
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
        Divider: {
          fullWidth: true,
        },
      },
    },
    fields: [
      {
        render: {
          componentType: "autocomplete",
          sequence: 2,
        },
        name: "PREFIX_CD",
        label: "Prefix",
        placeholder: "Prefix",
        validationRun: "onChange",
        options: () => API.GetDynamicSalutationData("Salutation"),
        _optionsKey: "PDPrefix",
        type: "text",
        required: true,
        GridProps: { xs: 12, sm: 4, md: 1, lg: 1, xl: 1 },
        isFieldFocused:
          unique?.customerIDctx !== "" || unique?.req_cd_ctx !== ""
            ? true
            : false,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PrefixIsRequired"] }],
        },
        postValidationSetCrossFieldValues: (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field.value) {
            return {
              GENDER: { value: field?.optionData[0]?.SET_GENDER ?? "" },
              MARITAL_STATUS: {
                value: field?.optionData[0]?.SET_MARITIAL_STATUS ?? "",
              },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
      },
      {
        render: {
          componentType: "textField",
          sequence: 3,
        },
        name: "FIRST_NM",
        label: "FirstName",
        placeholder: "First Name",
        type: "text",
        txtTransform: "uppercase",
        maxLength: 50,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["FirstNameIsRequired"] }],
        },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (currentField?.value && currentField?.value?.trim()?.length < 2) {
            const buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("firstNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                FIRST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
          if (
            currentField?.value &&
            currentField?.value?.trim()?.length >= 2 &&
            formState?.state?.isValidateCustCtx?.ALLOW_NAME_CHANGE === "N" &&
            formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
              ?.FIRST_NM !== currentField?.value
          ) {
            formState?.handleButtonDisable(true);
            const postData = await API.validateName({
              COMP_CD: authState?.companyID ?? "",
              CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
            });
            formState?.handleButtonDisable(false);
            if (Number(postData?.[0]?.TRN_CNT) > 0) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("TransactionsfoundNamecantbechanged"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  FIRST_NM: {
                    value:
                      formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
                        ?.FIRST_NM ?? "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 4,
        },
        name: "LAST_NM",
        label: "MiddleName",
        maxLength: 50,
        placeholder: "Middle Name",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            formState?.state?.isValidateCustCtx?.ALLOW_NAME_CHANGE === "N" &&
            formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
              ?.LAST_NM !== currentField?.value
          ) {
            formState?.handleButtonDisable(true);
            const postData = await API.validateName({
              COMP_CD: authState?.companyID ?? "",
              CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
            });
            formState?.handleButtonDisable(false);
            if (Number(postData?.[0]?.TRN_CNT) > 0) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("TransactionsfoundNamecantbechanged"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  LAST_NM: {
                    value:
                      formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
                        ?.LAST_NM ?? "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 6,
        },
        name: "SURNAME",
        label: "LastName",
        maxLength: 50,
        placeholder: "Last Name",
        type: "text",
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (currentField?.value && currentField?.value?.trim()?.length < 2) {
            const buttonName = await formState?.MessageBox({
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
          if (
            currentField?.value &&
            currentField?.value?.trim()?.length >= 2 &&
            formState?.state?.isValidateCustCtx?.ALLOW_NAME_CHANGE === "N" &&
            formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
              ?.SURNAME !== currentField?.value
          ) {
            formState?.handleButtonDisable(true);
            const postData = await API.validateName({
              COMP_CD: authState?.companyID ?? "",
              CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
            });
            formState?.handleButtonDisable(false);
            if (Number(postData?.[0]?.TRN_CNT) > 0) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("TransactionsfoundNamecantbechanged"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  SURNAME: {
                    value:
                      formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
                        ?.SURNAME ?? "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 7,
        },
        name: "ACCT_NM",
        isReadOnly: true,
        label: "FullName",
        placeholder: "FullName",
        maxLength: 100,
        showMaxLength: false,
        dependentFields: ["FIRST_NM", "LAST_NM", "SURNAME"],
        setValueOnDependentFieldsChange: (dependentFields, formState) => {
          let full_name =
            formState?.state?.tabsApiResctx?.[0]?.NAME_PARA === "Y"
              ? `${dependentFields?.FIRST_NM?.value} ${dependentFields?.LAST_NM?.value} ${dependentFields?.SURNAME?.value}`
              : `${dependentFields?.SURNAME?.value} ${dependentFields?.FIRST_NM?.value} ${dependentFields?.LAST_NM?.value}`;
          return full_name.trim();
        },
        type: "text",
        GridProps: { xs: 12, sm: 5, md: 4, lg: 2.8, xl: 3 },
      },
      {
        render: {
          componentType: "formbutton",
          sequence: 7,
        },
        name: "SEARCH_BTN",
        label: "Search",
        endsIcon: "Search",
        rotateIcon: "scale(1.5)",
        placeholder: "",
        ignoreInSubmit: true,
        type: "text",
        isReadOnly: (...arg) => {
          if (arg?.[2]?.state?.formmodectx === "view") {
            return true;
          }
          return false;
        },
        dependentFields: ["ACCT_NM"],
        GridProps: { lg: 1, xl: 1 },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ENTERED_DATE",
        label: "hiddenFields",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
          sequence: 7,
        },
        name: "GENDER",
        placeholder: "SelectGender",
        label: "Gender",
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["GenderIsRequired"] }],
        },
        dependentFields: ["PREFIX_CD"],
        disableCaching: true,
        options: (dependentValue) => API.getGenderOp(dependentValue),
        defaultValueKey: "defaultValue",
        _optionsKey: "genderOp",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
          sequence: 7,
        },
        name: "MARITAL_STATUS",
        label: "MaritalStatus",
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["MaritalStatusIsRequired"] }],
        },
        placeholder: "SelectMaritalStatus",
        options: () => API.getPMISCData("Marital"),
        _optionsKey: "maritalStatus",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },

      {
        render: {
          componentType: "divider",
          sequence: 8,
        },
        name: "maidenHeaderdivider",
        label: "Maidenname",
        DividerProps: {
          sx: { color: "var(--theme-color1)", fontWeight: "500" },
        },
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "autocomplete",
          sequence: 9,
        },
        name: "MAIDEN_PREFIX_CD",
        label: "Prefix",
        options: () => API.getPMISCData("Salutation"),
        _optionsKey: "getPMISCData-SALUTATION",
        defaultValue: "Miss",
        placeholder: "Prefix",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 1, lg: 1, xl: 1 },
      },
      {
        render: {
          componentType: "textField",
          sequence: 10,
        },
        accessor: "MAIDEN_FIRST_NM",
        name: "MAIDEN_FIRST_NM",
        label: "FirstName",
        maxLength: 50,
        placeholder: "FirstName",
        type: "text",
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (currentField?.value && currentField?.value?.trim()?.length < 2) {
            const buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("maidenFirstNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                MAIDEN_FIRST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 11,
        },
        name: "MAIDEN_MIDDLE_NM",
        label: "MiddleName",
        maxLength: 50,
        placeholder: "MiddleName",
        type: "text",
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 12,
        },
        name: "MAIDEN_LAST_NM",
        label: "LastName",
        maxLength: 50,
        placeholder: "LastName",
        type: "text",
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
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
              message: t("maidenLastNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                MAIDEN_LAST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
      },
      {
        render: {
          componentType: "spacer",
          sequence: 13,
        },
        name: "SPACER1",
        sequence: 14,
        GridProps: {
          xs: 12,
        },
      },
      {
        render: {
          componentType: "autocomplete",
          sequence: 14,
        },
        name: "FATHER_SPOUSE",
        label: "FatherOrSpuuseName",
        defaultValue: "01",
        options: [
          { label: "Father", value: "01" },
          { label: "Spouse", value: "02" },
        ],
        placeholder: "FatherOrSpuuseName",
        required: true,
        type: "text",
        GridProps: { xs: 12, sm: 2.5, md: 2, lg: 1.5, xl: 2 },
        postValidationSetCrossFieldValues: (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value == "01") {
            return { fatherHeaderDivider: { value: "Father Name" } };
          }
          if (field?.value == "02") {
            return { fatherHeaderDivider: { value: "Spouse Name" } };
          }
          return {};
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["requiredFatherOrSpuuseName"] }],
        },
        runPostValidationHookAlways: true,
      },

      {
        render: {
          componentType: "divider",
          sequence: 15,
        },
        name: "fatherHeaderDivider",
        label: "FatherName",
        placeholder: "FatherName",
        dependentFields: ["FATHER_SPOUSE"],
        setValueOnDependentFieldsChange: (dependentFields) => {
          let dividerText = dependentFields?.FATHER_SPOUSE?.optionData[0]?.label
            ? `${dependentFields?.FATHER_SPOUSE?.optionData[0]?.label} Name`
            : null;
          return dividerText;
        },
        DividerProps: {
          sx: { color: "var(--theme-color1)", fontWeight: "500" },
        },
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "autocomplete",
          sequence: 16,
        },
        name: "FATHER_PREFIX_CD",
        label: "Prefix",
        options: () => API.getPMISCData("Salutation"),
        _optionsKey: "getPMISCData-SALUTATION",
        defaultValue: "Mr",
        placeholder: "Prefix",
        type: "text",
        GridProps: { xs: 12, sm: 2.5, md: 1, lg: 1, xl: 1 },
      },
      {
        render: {
          componentType: "textField",
          sequence: 17,
        },
        name: "FATHER_FIRST_NM",
        label: "FirstName",
        maxLength: 50,
        placeholder: "FirstName",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
              message: t("fatherFirstNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                FATHER_FIRST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 18,
        },
        name: "FATHER_MIDDLE_NM",
        label: "MiddleName",
        maxLength: 50,
        placeholder: "MiddleName",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
          sequence: 19,
        },
        name: "FATHER_LAST_NM",
        label: "LastName",
        maxLength: 50,
        placeholder: "LastName",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
              message: t("fatherLastNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                FATHER_LAST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
      },

      {
        render: {
          componentType: "divider",
          sequence: 20,
        },
        name: "motherHeaderDivider",
        label: "MotherName",
        DividerProps: {
          sx: { color: "var(--theme-color1)", fontWeight: "500" },
        },
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "autocomplete",
          sequence: 21,
        },
        name: "MOTHER_PREFIX_CD",
        label: "Prefix",
        options: () => API.getPMISCData("Salutation"),
        _optionsKey: "getPMISCData-SALUTATION",
        defaultValue: "Mrs",
        placeholder: "Prefix",
        type: "text",
        GridProps: { xs: 12, sm: 2.5, md: 1, lg: 1, xl: 1 },
      },
      {
        render: {
          componentType: "textField",
          sequence: 22,
        },
        name: "MOTHER_FIRST_NM",
        label: "FirstName",
        maxLength: 50,
        placeholder: "FirstName",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
              message: t("motherFirstNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                MOTHER_FIRST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
      },
      {
        render: {
          componentType: "textField",
          sequence: 23,
        },
        name: "MOTHER_MIDDLE_NM",
        label: "MiddleName",
        maxLength: 50,
        placeholder: "MiddleName",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
          sequence: 24,
        },
        name: "MOTHER_LAST_NM",
        label: "LastName",
        maxLength: 50,
        placeholder: "LastName",
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) =>
          API?.validateSpecialCharsAndSpaces(columnValue),
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
              message: t("motherLastNmValidationMsg"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                MOTHER_LAST_NM: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        },
      },
      {
        render: {
          componentType: "divider",
          sequence: 25,
        },
        name: "MemberAccountDetails",
        label: "MemberAccountDetails",
        ignoreInSubmit: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !Boolean(formState?.state?.customerIDctx);
        },
        DividerProps: {
          sx: { color: "var(--theme-color1)", fontWeight: "500" },
        },
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "MEM_COMP_CD",
      },
      {
        render: { componentType: "_accountNumber" },
        branchCodeMetadata: {
          name: "MEM_BRANCH_CD",
          sequence: 26,
          runPostValidationHookAlways: true,
          required: false,
          schemaValidation: {},
          defaultValue: "",
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleButtonDisable(true);
            const isHOBranch = await validateHOBranch(
              currentField,
              formState?.MessageBox,
              authState
            );
            formState?.handleButtonDisable(false);
            if (isHOBranch) {
              return {
                MEM_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              MEM_ACCT_TYPE: { value: "", ignoreUpdate: false },
              MEM_ACCT_CD: { value: "", ignoreUpdate: false },
              MEM_ACCT_NM: { value: "", ignoreUpdate: false },
            };
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            return !Boolean(formState?.state?.customerIDctx);
          },

          GridProps: { xs: 12, sm: 6, md: 2, lg: 1.5, xl: 1.5 },
        },
        accountTypeMetadata: {
          name: "MEM_ACCT_TYPE",
          sequence: 27,
          dependentFields: ["MEM_BRANCH_CD"],
          runPostValidationHookAlways: true,
          required: false,
          schemaValidation: {},
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              MEM_ACCT_CD: { value: "", ignoreUpdate: false },
              MEM_ACCT_NM: { value: "", ignoreUpdate: false },
            };
          },

          shouldExclude(fieldData, dependentFieldsValues, formState) {
            return !Boolean(formState?.state?.customerIDctx);
          },

          GridProps: { xs: 12, sm: 6, md: 2, lg: 1.5, xl: 1.5 },
        },
        accountCodeMetadata: {
          name: "MEM_ACCT_CD",
          sequence: 28,
          dependentFields: ["MEM_ACCT_TYPE", "MEM_BRANCH_CD"],
          runPostValidationHookAlways: true,
          required: false,
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            return !Boolean(formState?.state?.customerIDctx);
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (
              currentField?.value &&
              dependentFieldValues?.MEM_BRANCH_CD?.value?.length === 0
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Alert",
                message: "EnterAccountBranch",
                buttonNames: ["Ok"],
                icon: "WARNING",
              });

              if (buttonName === "Ok") {
                return {
                  MEM_BRANCH_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                  MEM_ACCT_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  MEM_ACCT_TYPE: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              currentField?.value &&
              dependentFieldValues?.MEM_ACCT_TYPE?.value?.length === 0
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Alert",
                message: "EnterAccountType",
                buttonNames: ["Ok"],
                icon: "WARNING",
              });

              if (buttonName === "Ok") {
                return {
                  MEM_ACCT_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  MEM_ACCT_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              dependentFieldValues?.MEM_BRANCH_CD?.value &&
              dependentFieldValues?.MEM_ACCT_TYPE?.value &&
              currentField?.value
            ) {
              const acctCd = utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.MEM_ACCT_TYPE?.optionData?.[0] ?? ""
              );
              const reqParameters = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: dependentFieldValues?.MEM_BRANCH_CD?.value ?? "",
                ACCT_TYPE: dependentFieldValues?.MEM_ACCT_TYPE?.value ?? "",
                ACCT_CD: acctCd,
                SCREEN_REF: formState?.docCD,
                CUSTOMER_ID: formState?.customerIDctx ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
              };
              formState?.handleButtonDisable(true);
              const postData = await validateShareMemAcct(reqParameters);
              formState?.handleButtonDisable(false);
              let returnVal;
              if (postData?.MSG?.length > 0) {
                const response = await handleDisplayMessages(
                  postData?.MSG,
                  formState?.MessageBox
                );

                if (Object.keys(response).length > 0) {
                  returnVal = postData;
                } else {
                  returnVal = "";
                }
              }
              return {
                MEM_ACCT_CD:
                  returnVal !== ""
                    ? {
                        value: acctCd,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },

                MEM_ACCT_NM: {
                  value: returnVal?.ACCT_NM ?? "",
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },
              };
            } else if (!currentField?.value) {
              return {
                MEM_ACCT_NM: { value: "", ignoreUpdate: false },
              };
            }
          },

          schemaValidation: {},
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MEM_ACCT_NM",
        label: "AccountName",
        sequence: 28,
        placeholder: "AccountName",
        type: "text",
        isReadOnly: true,
        ignoreInSubmit: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !Boolean(formState?.state?.customerIDctx);
        },
        GridProps: { xs: 12, sm: 6, md: 5, lg: 6, xl: 6 },
      },
    ],
  };
};
export const personal_other_detail_meta_data = {
  form: {
    name: "personal_other_details_form",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "BIRTH_DT",
      label: "DateOfBirth",
      placeholder: "DateOfBirth",
      required: true,
      disableFuture: true,
      runPostValidationHookAlways: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      isMaxWorkingDate: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DateofBirthIsRequired"] }],
      },

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
          const postData = await getMinorMajorAgeData(reqParameters);
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
          const ageFinal = Math.floor(Number(returnVal?.AGE ?? "0")).toString();
          if (
            Object.keys(returnVal).length > 0 &&
            returnVal?.ACCT_TYPE !== ""
          ) {
            formState?.handleAccTypeVal(returnVal?.ACCT_TYPE);
          }
          formState?.handleMinorMajorVal(returnVal?.LF_NO);

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
            LF_NO: {
              value: returnVal?.LF_NO ?? "",
              ignoreUpdate: false,
            },
            AGE: { value: ageFinal ?? "", ignoreUpdate: false },
          };
        } else if (!currentField?.value) {
          return {
            LF_NO: {
              value: "",
              ignoreUpdate: false,
            },
            AGE: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
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
    },
    {
      render: {
        componentType: "autocomplete",
      },
      options: [
        { label: "Minor", value: "M" },
        { label: "Major", value: "J" },
        { label: "Sr. Citizen", value: "S" },
      ],
      isReadOnly: true,
      name: "LF_NO",
      label: "MinorMajor",
      defaultOptionLabel: "MinorMajor",
      type: "text",
      runExternalFunction: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BLOOD_GRP_CD",
      label: "BloodGroup",
      placeholder: "selectBllodGroup",
      options: () => API.getPMISCData("Blood"),
      _optionsKey: "bloodGroup",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "NATIONALITY",
      label: "Nationality",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["NationalityIsRequired"] }],
      },
      placeholder: "selectNationality",
      options: (dependentValue, formState, _, authState) =>
        API.getCountryOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "countryOptions",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RESIDENCE_STATUS",
      label: "ResidenceStatus",
      required: true,
      placeholder: "selectResidenceStatus",
      options: () => API.getPMISCData("RESIDE_STATUS"),
      _optionsKey: "ResisdenceStatus",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ResidenceStatusIsRequired"] }],
      },
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
      _optionsKey: "occupationOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["OccupationIsRequired"] }],
      },
      placeholder: "SelectOccupation",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "GROUP_CD",
      label: "Group",
      placeholder: "SelectGroup",
      options: (dependentValue, formState, _, authState) =>
        API.getCustomerGroupOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "GroupOptions",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COMMU_CD",
      label: "Religion",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ReligionIsRequired"] }],
      },
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
        componentType: "datePicker",
      },
      name: "KYC_REVIEW_DT",
      label: "KycRevisedDate",
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
      placeholder: "KycRevisedDate",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      options: () => API.getRiskCateg({ CALLFROM: "MAINTAB" }),
      _optionsKey: "ckycRiskCategOptions",
      name: "RISK_CATEG",
      label: "RiskCategory",
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
              RISK_REVIEW_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(
              new Date(formState?.WORKING_DATE),
              new Date(currentField.value),
              {
                ignoreTime: true,
              }
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("RiskreviewdateshouldbegreaterthanTodaysDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              RISK_REVIEW_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
        }
        return {};
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
        componentType: "datePicker",
      },
      name: "DATE_OF_DEATH",
      label: "DateOfDeath",
      placeholder: "DD/MM/YYYY",
      dependentFields: ["BIRTH_DT"],
      disableFuture: true,
      maxDate: new Date(),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !Boolean(formState?.state?.customerIDctx);
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        const birthDate = new Date(dependentFieldValues?.BIRTH_DT?.value);
        const deathDate = new Date(currentField?.value);
        if (Boolean(currentField?.value)) {
          if (!isValid(deathDate)) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("Mustbeavaliddate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              DATE_OF_DEATH: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(deathDate, new Date(formState?.WORKING_DATE), {
              ignoreTime: true,
            })
          ) {
            const buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("DateofDeathcannotbeFutureDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                DATE_OF_DEATH: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
          if (
            lessThanInclusiveDate(
              new Date(currentField?.value).setHours(0, 0, 0, 0),
              new Date(birthDate).setHours(0, 0, 0, 0)
            )
          ) {
            const buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("DateofDeathcannotbelessthanorequaltoDateofBirth"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                DATE_OF_DEATH: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
      },
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
