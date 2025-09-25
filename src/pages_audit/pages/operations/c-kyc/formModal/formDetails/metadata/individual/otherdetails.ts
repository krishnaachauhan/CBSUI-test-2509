import { isValid } from "date-fns";
import * as API from "../../../../api";
import { greaterThanDate, lessThanDate } from "@acuteinfo/common-base";
import { t } from "i18next";
import { PREVENT_SPECIAL_CHAR } from "components/utilFunction/constant";
export const other_details_meta_data = {
  form: {
    name: "other_details_annual_income_details_form",
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
        componentType: "divider",
      },
      name: "AnnualIncomeDivider_ignoreField",
      label: "AnnualIncome",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ANNUAL_INCOME_SR_CD",
      label: "Range",
      options: (dependentValue, formState, _, authState) =>
        API.getRangeOptions(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "rangeOptions",
      isFieldFocused: true,
      placeholder: "SelectRange",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ANNUAL_TURNOVER_SR_CD",
      label: "Turnover",
      options: (dependentValue, formState, _, authState) =>
        API.getRangeOptions(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "turnoverOptions",
      placeholder: "SelectTurnover",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ANNUAL_OTHER_INCOME_SR_CD",
      label: "OtherIncome",
      options: (dependentValue, formState, _, authState) =>
        API.getRangeOptions(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "otherIncomeOptions",
      placeholder: "SelectOtherIncome",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SOURCE_OF_INCOME",
      label: "SourceOfIncome",
      maxLength: 200,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 200) {
            return false;
          }
          return true;
        },
      },
      placeholder: "SourceOfIncome",
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.state?.tabsApiResctx[0]?.SOI_DROPDOWN !== "N";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SOURCE_OF_INCOME_DDW",
      label: "SourceOfIncome",
      // ignoreInSubmit: true,
      options: () => API.getPMISCData("CKYC_SRC_OF_INC"),
      _optionsKey: "CKYC_SRC_OF_INC",
      placeholder: "SelectSourceOfIncome",
      type: "text",
      validationRun: "onChange",
      dependentFields: ["SOURCE_OF_INCOME"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        return {
          SOURCE_OF_INCOME: {
            value: currentField?.value,
          },
        };
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.state?.tabsApiResctx[0]?.SOI_DROPDOWN === "N";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "ExposureInfoDivider_ignoreField",
      label: "ExposureInfo",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FUNDED_AMT",
      label: "Funded",
      enableNumWords: false,
      placeholder: "Funded",
      type: "text",
      maxLength: 15,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "NON_FUNDED_AMT",
      label: "NonFunded",
      enableNumWords: false,
      placeholder: "NonFunded",
      type: "text",
      maxLength: 15,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "THRESHOLD_AMT",
      label: "ThresholdLimit",
      enableNumWords: false,
      placeholder: "ThresholdLimit",
      maxLength: 15,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "PersonalInfoDivider_ignoreField",
      label: "PersonalInfo",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "NO_OF_CHILDREN",
      label: "ChildrenCount",
      placeholder: "ChildrenCount",
      maxLength: 2,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 2) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }

          return true;
        },
      },
      validate: (columnValue, allField, flag) => {
        if (columnValue.value && columnValue.value < 0) {
          return "MinimumAllowedValueIsZero";
        }
        return "";
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "HOUSE_CD",
      label: "HouseType",
      options: () => API.getPMISCData("House"),
      _optionsKey: "HouseTypes",
      placeholder: "SelectHouseType",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "NO_OF_ADULTS",
      label: "AdultsCount",
      placeholder: "AdultsCount",
      maxLength: 2,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 2) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }

          return true;
        },
      },
      validate: (columnValue, allField, flag) => {
        if (columnValue.value && columnValue.value < 0) {
          return "MinimumAllowedValueIsZero";
        }
        return "";
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      defaultValue: false,
      name: "POLITICALLY_CONNECTED",
      label: "PoliticallyConnected",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "EARNING_MEMEBER",
      label: "EarningMembers",
      placeholder: "EarningMembers",
      maxLength: 3,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 3) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }
          return true;
        },
      },
      validate: (columnValue, allField, flag) => {
        if (columnValue.value && columnValue.value < 0) {
          return "MinimumAllowedValueIsZero";
        }
        return "";
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      defaultValue: false,
      name: "BLINDNESS",
      label: "Blind",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ID_MARK",
      label: "IDMark",
      placeholder: "IDMark",
      type: "text",
      txtTransform: "uppercase",
      maxLength: 100,
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 4 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "VehicleInfoDivider_ignoreField",
      label: "VehicleInfo",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "NO_OF_2_WHEELERS",
      label: "TwoWheelers",
      maxLength: 2,
      placeholder: "TwoWheelers",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 2) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }
          return true;
        },
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "NO_OF_4_WHEELERS",
      label: "FourWheelers",
      maxLength: 2,
      placeholder: "FourWheelers",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 2) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }
          return true;
        },
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CIBIL_SCORE",
      label: "CIBILScore",
      placeholder: "CIBILScore",
      type: "text",
      maxLength: 5,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      FormatProps: {
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        currentField,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value < -1 || field?.value > 900) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "HOBranchValidMessageTitle",
            message: "CIBILScoreShouldBeBetweenTo900",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          if (buttonName === "Ok") {
            return {
              CIBIL_SCORE: {
                value: "",
                isFieldFocused: true,
              },
            };
          }
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "EmpInfoDivider_ignoreField",
      label: "EmploymentInfo",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "EMPLOYMENT_STATUS",
      label: "EmpStatus",
      options: () => API.getPMISCData("Emp_Status"),
      _optionsKey: "EmpStatus",
      placeholder: "SelectEmpStatus",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      defaultValue: false,
      name: "REFERRED_BY_STAFF",
      label: "ReferredByStaff",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "EDUCATION_CD",
      label: "EduQualification",
      options: (dependentValue, formState, _, authState) =>
        API.getEduQualiOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "eduQualiOptions",
      placeholder: "SelectEduQualification",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COMPANY_NM_OPTION",
      label: "SelectCompanyName",
      placeholder: "SelectCompanyName",
      options: () => API.getPMISCData("COMPANY_NM"),
      _optionsKey: "getPMISCDataForCompanyName",
      // ignoreInSubmit: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            COMPANY_NM: {
              value: currentField?.optionData?.[0]?.label ?? "",
              ignoreUpdate: false,
            },
          };
        }
        return {};
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 1.8, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COMPANY_NM",
      label: "CompanyName",
      placeholder: "CompanyName",
      type: "text",
      txtTransform: "uppercase",
      maxLength: 100,
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      GridProps: { xs: 12, sm: 5, md: 4, lg: 3.0, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEPARTMENT_NM",
      label: "Department",
      placeholder: "Department",
      maxLength: 100,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 100) {
            return false;
          }
          return true;
        },
      },
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COMPANT_ADDRESS",
      label: "CompanyAdd",
      placeholder: "CompanyAdd",
      type: "text",
      txtTransform: "uppercase",
      maxLength: 100,
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "JOINING_DT",
      label: "JoiningDate",
      placeholder: "JoiningDate",
      type: "text",
      validate: (currentField, dependentFields, formState) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "RETIREMENT_DT",
      label: "RetirementDate",
      placeholder: "RetirementDate",
      type: "text",
      dependentFields: ["JOINING_DT"],
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
              RETIREMENT_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (!Boolean(dependentFieldValues?.JOINING_DT?.value)) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("PleaseenterJoiningDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              RETIREMENT_DT: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              JOINING_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            lessThanDate(
              new Date(currentField.value),
              new Date(dependentFieldValues?.JOINING_DT?.value),
              {
                ignoreTime: true,
              }
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("RetirementDatecantbelessthanJoiningDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              RETIREMENT_DT: {
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
              message: t("RetirementDatecantbelessthanTodayDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              RETIREMENT_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
        }
        return {};
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "EMP_COMPANY_TYPE",
      label: "EmpCompanyType",
      placeholder: "EmpCompanyType",
      type: "text",
      options: (dependentValue, formState, _, authState) =>
        API.getEmpCompanyTypes(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "PDPrefix",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SPECIALIZATION_REMARKS",
      label: "Specialization",
      placeholder: "Specialization",
      type: "text",
      txtTransform: "uppercase",
      maxLength: 100,
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      GridProps: { xs: 12, sm: 8, md: 6, lg: 4.8, xl: 6 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "WORK_EXP",
      label: "WorkExperienceYear",
      placeholder: "WorkExperienceYear",
      defaultValue: "0.00",
      maxLength: 5,
      FormatProps: {
        decimalScale: 2,
        fixedDecimalScale: true,
        allowNegative: false,
        isAllowed: ({ floatValue }) => {
          return floatValue === undefined || floatValue <= 99.99;
        },
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
