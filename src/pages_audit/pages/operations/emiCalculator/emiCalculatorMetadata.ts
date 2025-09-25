import { t } from "i18next";
import * as API from "./api";

export const EmiCalculatorFormMetadata = {
  form: {
    name: "EmiCalculatorForm",
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
          sm: 4,
          md: 4,
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
      amountField: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "select" },
      name: "INST_TYPE",
      label: "InstallmentType",
      placeholder: "select Installment Type",
      options: (currentField, dependentFields, __, authState) =>
        API.getEMIInstType({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getEMIInstType",
      defaultValue: "1",
      dependentFields: [
        "INT_RATE",
        "INST_PERIOD",
        "INSTALLMENT_NO",
        "DATA_VAL",
        "LOAN_AMT_MAIN",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        formState.setDataOnFieldChange("GET_DATA", {
          INST_TYPE: currentField?.value ?? "",
          INT_RATE: dependentFieldValues?.INT_RATE?.value ?? "",
          INST_PERIOD: dependentFieldValues?.INST_PERIOD?.value ?? "",
          INSTALLMENT_NO: dependentFieldValues?.INSTALLMENT_NO?.value ?? "",
          DATA_VAL: dependentFieldValues?.DATA_VAL?.value ?? "",
        });
        formState.setDataOnFieldChange("RESET_DATA", { RESET_DATA: false });
      },
      GridProps: { xs: 12, sm: 4.5, md: 2.75, lg: 2.25, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LOAN_AMT_MAIN",
      label: "LoanAmount",
      autoComplete: "off",
      type: "text",
      autoCompelete: "off",
      required: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("LoanAmountisrequired")] }],
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        return {
          INSTALLMENT_NO: {
            value: "",
            ignoreUpdate: true,
          },
        };
      },
      GridProps: { xs: 12, sm: 4.5, md: 3, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "Interest Rate",
      type: "text",
      fullWidth: true,
      autoComplete: "off",
      className: "textInputFromRight",
      required: true,
      FormatProps: {
        allowLeadingZeros: false,
        allowNegative: true,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      runPostValidationHookAlways: true,
      dependentFields: [
        "INST_TYPE",
        "INST_PERIOD",
        "INSTALLMENT_NO",
        "DATA_VAL",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        formState.setDataOnFieldChange("GET_DATA", {
          INST_TYPE: dependentFieldValues?.INST_TYPE?.value ?? "",
          INT_RATE: currentField?.value ?? "",
          INST_PERIOD: dependentFieldValues?.INST_PERIOD?.value ?? "",
          INSTALLMENT_NO: dependentFieldValues?.INSTALLMENT_NO?.value ?? "",
          DATA_VAL: dependentFieldValues?.DATA_VAL?.value ?? "",
        });
        formState.setDataOnFieldChange("RESET_DATA", { RESET_DATA: false });
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("InterestRateisrequired")] }],
      },
      GridProps: { xs: 6, sm: 3, md: 1.5, lg: 1, xl: 1 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "DATA_VAL",
      label: "InterestFunded",
      options: (currentField, dependentFields, __, authState) =>
        API.getEMICalcIntFund({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getEMICalcIntFund",
      dependentFields: [
        "INST_TYPE",
        "INT_RATE",
        "INST_PERIOD",
        "INSTALLMENT_NO",
        "DATA_VAL",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        formState.setDataOnFieldChange("GET_DATA", {
          INST_TYPE: dependentFieldValues?.INST_TYPE?.value ?? "",
          INT_RATE: dependentFieldValues?.INT_RATE?.value ?? "",
          DATA_VAL: currentField?.value ?? "",
          INST_PERIOD: dependentFieldValues?.INST_PERIOD?.value ?? "",
          INSTALLMENT_NO: dependentFieldValues?.INSTALLMENT_NO?.value ?? "",
        });
        formState.setDataOnFieldChange("RESET_DATA", { RESET_DATA: true });
      },
      GridProps: { xs: 6, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "INST_PERIOD",
      label: "Period",
      placeholder: "Select Period",
      options: (currentField, dependentFields, __, authState) =>
        API.getEMICalcPeriod({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getEMICalcPeriod",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: [t("InstallmentPeriodisrequired")] },
        ],
      },
      runPostValidationHookAlways: true,
      dependentFields: ["INST_TYPE", "INT_RATE", "INSTALLMENT_NO", "DATA_VAL"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        formState.setDataOnFieldChange("GET_DATA", {
          INST_TYPE: dependentFieldValues?.INST_TYPE?.value ?? "",
          INT_RATE: dependentFieldValues?.INT_RATE?.value ?? "",
          INST_PERIOD: currentField?.value ?? "",
          INSTALLMENT_NO: dependentFieldValues?.INSTALLMENT_NO?.value ?? "",
          DATA_VAL: dependentFieldValues?.DATA_VAL?.value ?? "",
        });
        formState.setDataOnFieldChange("RESET_DATA", { RESET_DATA: false });
      },
      GridProps: { xs: 6, sm: 4, md: 2.5, lg: 1.8, xl: 1.8 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "INSTALLMENT_NO",
      label: "No. of Installment",
      autoComplete: "off",
      required: true,
      fullWidth: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 3) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("NoofInstallmentisrequired")] }],
      },
      runPostValidationHookAlways: true,
      dependentFields: ["INST_TYPE", "INT_RATE", "INST_PERIOD", "DATA_VAL"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        formState.setDataOnFieldChange("GET_DATA", {
          INST_TYPE: dependentFieldValues?.INST_TYPE?.value ?? "",
          INT_RATE: dependentFieldValues?.INT_RATE?.value ?? "",
          INST_PERIOD: dependentFieldValues?.INST_PERIOD?.value ?? "",
          INSTALLMENT_NO: currentField?.value ?? "",
          DATA_VAL: dependentFieldValues?.DATA_VAL?.value ?? "",
        });
        formState.setDataOnFieldChange("RESET_DATA", { RESET_DATA: true });
      },
      GridProps: { xs: 6, sm: 4, md: 2, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "spacer",
      GridProps: { xs: 4, sm: 8, md: 6.8, lg: 8.3, xl: 9.3 },
    },
  ],
};
