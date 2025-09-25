import { REGEX } from "components/utilFunction/constant";
import { getPMISCData } from "../api";
import * as API from "../api";
import { greaterThanDate, utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";

export const relativeDtl_tab_metadata = {
  form: {
    name: "relativeDtl_tab_form",
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
        componentType: "arrayField",
      },
      name: "RELATIVE_DTL",
      changeRowOrder: true,
      hideRemoveIconOnSingleRecord: false,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "NAME_OF_THE_FIRM",
          label: "RelativeFirmName",
          required: true,
          maxLength: 100,
          autoComplete: "off",
          placeholder: "EnterRelativeFirmName",
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: ["RelativeFirmNameIsRequired"] },
            ],
          },
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "DATE_OF_BIRTH",
          label: "DateOfBirth",
          placeholder: "DD/MM/YYYY",
          isMaxWorkingDate: true,
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              greaterThanDate(value?.value, value?._maxDt, {
                ignoreTime: true,
              })
            ) {
              return t("DateShouldBeLessThanEqualToWorkingDT");
            }
            return "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "GENDER",
          label: "Gender",
          placeholder: "SelectGender",
          options: [
            { label: "MALE", value: "M" },
            { label: "FEMALE", value: "F" },
            { label: "OTHER", value: "O" },
            { label: "TRANSGENDER", value: "T" },
          ],
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
          options: () => API.getMaritalStatusOP(),
          _optionsKey: "maritalMainOp",
          placeholder: "SelectMaritalStatus",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "EDUCATIONAL_QUALIFICATION",
          label: "EduQualification",
          placeholder: "EnterEduQualification",
          type: "text",
          autoComplete: "off",
          maxLength: 200,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "RELATIVE_CD",
          label: "Relationship",
          options: (dependentValue) => getPMISCData("RELATIVE_CD"),
          optionsGridColDef: {
            VISIBILITY_FLAG: { isVisible: false },
            REMARKS: { isVisible: false },
            DISPLAY_NM: { isVisible: false },
            DATA_VALUE: { isVisible: false },
            DISPLAY_VALUE: { isVisible: false },
            REPORT_PERSONALIZATION_ID: { isVisible: false },
          },
          _optionsKey: "relationshipCurrentOp",
          placeholder: "SelectRelationship",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          defaultValue: false,
          name: "SALARIED",
          label: "Salaried",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PASSPORT_NO",
          label: "PassportNo",
          type: "text",
          maxLength: 20,
          autoComplete: "off",
          showMaxLength: false,
          txtTransform: "uppercase",
          // ignoreInSubmit: true,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          validate: (columnValue) => {
            if (columnValue?.value?.includes(" ")) {
              return "SpaceNotAllowed";
            }
            if (columnValue?.value) {
              if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
                return "PleaseEnterAlphanumericValue";
              }
            }
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "EMAIL",
          label: "EmailId",
          placeholder: "EnterEmailId",
          autoComplete: "off",
          maxLength: 60,
          // validate: (columnValue, allField, flag) =>
          //   API.ValidateEmailId(columnValue),
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            ___,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (field?.value) {
              const postData = await API.ValidateEmailId({
                columnValue: field,
                flag: "N",
              });
              const EMAIL_ID_STATUS = postData?.[0]?.EMAIL_ID_STATUS;
              if (EMAIL_ID_STATUS === "0") {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "PleaseEnterValidEmailID",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    EMAIL: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                  };
                }
              }
            }
          },
          type: "text",
          txtTransform: "lowercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 5, md: 6, lg: 4.8, xl: 2.7 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          defaultValue: false,
          name: "SELF_EMPLOYED",
          label: "SelfEmployed",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_PAN_NO",
          label: "PanType",
          placeholder: "AAAAA1111A",
          type: "text",
          txtTransform: "uppercase",
          autoComplete: "off",
          maxLength: 10,
          validate: (columnValue) => {
            if (columnValue?.value) {
              const pan = columnValue?.value?.trim?.();
              if (pan.length !== 10) {
                return "Panerror";
              }
              return "";
            }
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const value = field?.value ?? "";
            if (value) {
              if (!REGEX?.ALPHA_NUMERIC?.test(value)) {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "SpecialCharacterNotAllowed",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    MASKED_PAN_NO: { value: "", isFieldFocused: true },
                    PAN_NO: { value: "", ignoreUpdate: false },
                  };
                }
              } else {
                const postData = await API.validatePAN({
                  columnValue: field,
                  flag: "postValidate",
                });
                const panStatus = postData?.[0]?.PAN_STATUS;
                if (panStatus !== "Y") {
                  const btnName = await formState.MessageBox({
                    messageTitle: "ValidationFailed",
                    message: "PleaseEnterValidPAN",
                    icon: "ERROR",
                  });
                  if (btnName === "Ok") {
                    return {
                      MASKED_PAN_NO: { value: "", isFieldFocused: true },
                      PAN_NO: { value: "", ignoreUpdate: false },
                    };
                  }
                } else {
                  return {
                    PAN_NO: {
                      value: field?.value ?? "",
                    },
                  };
                }
              }
            } else if (field?.value === "") {
              return {
                PAN_NO: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "PAN_NO",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "NAME_OF_THE_EMPLOYER",
          label: "EmployerName",
          placeholder: "EnterEmployerName",
          type: "text",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          maxLength: 100,
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "MONTHLY_HOUSEHOLD_INCOME",
          label: "MonthlyIncome",
          options: () => API.getMonthlyHouseHoldIncomeDDW("REL_DTL"),
          _optionsKey: "monIncomeMainOp",
          placeholder: "SelectMonthlyIncome",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "SELF_EMPLOYEED_DETAILS",
          label: "SelfEmpDetails",
          placeholder: "EnterSelfEmpDetails",
          type: "text",
          txtTransform: "uppercase",
          maxLength: 25,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
      ],
    },
  ],
};
