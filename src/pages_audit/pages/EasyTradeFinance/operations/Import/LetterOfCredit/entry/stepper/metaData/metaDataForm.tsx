import * as API from ".././api/api";
import { currencySymbol } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import { ETFGeneralAPI } from "../../../../../../generalAPI/general";
import { isValid } from "date-fns/esm";

export const LcDetails = {
  form: {
    name: "AddLCDetails",
    label: "",
    resetFieldOnUnmount: false,
    readonly: true,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      datePicker: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "lc_at",
      label: "LC At",
      sequence: 5,
      placeholder: "Select LC At",
      type: "text",
      options: [{ label: "sight", value: "S" }], //() => API.getsecmstgrpdrpdwn(),
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "lc_type",
      label: "Documentary Form(40A)",
      sequence: 3,
      placeholder: "Select LC Type",
      type: "text",
      options: [{ label: "IRREVOCABLE ", value: "I" }], //() => API.getsecmstgrpdrpdwn(),
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "actual_lc_amount",
      label: "Actual LC Amount",
      sequence: 4,
      placeholder: "Enter LC Amount",
      type: "text",
      StartAdornment: (formState) => {
        const currency = formState?.currency?.value;
        return currency ? currencySymbol[currency] : null;
      },
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      enableNumWords: false,
      dependentFields: [
        "notional_curr_rate",
        "tolerance_type",
        "tolerance_percent",
        "LIMIT_AMT",
        "MARGIN_PER",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return formState.Calculation(currentField, dependentFieldValues);
        }
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 2,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "select",
      },
      name: "tolerance_type",
      label: "Tolerance Type(39A)[%]:",
      sequence: 5,
      placeholder: "Enter Tolerance Type",
      type: "text",
      options: [
        { label: "PLUS ", value: "P" },
        { label: "MINUS", value: "M" },
        { label: "BOTH", value: "B" },
      ], //() => API.getsecmstgrpdrpdwn(),
      dependentFields: [
        "actual_lc_amount",
        "notional_curr_rate",
        "tolerance_percent",
        "LIMIT_AMT",
        "MARGIN_PER",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return formState.Calculation(currentField, dependentFieldValues);
        }
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "tolerance_percent",
      label: "",
      sequence: 6,
      placeholder: "0.00",
      type: "text",
      dependentFields: [
        "actual_lc_amount",
        "notional_curr_rate",
        "tolerance_type",
        "LIMIT_AMT",
        "MARGIN_PER",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return formState.Calculation(currentField, dependentFieldValues);
        }
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "tolerance_pr_minus",
      label: "",
      sequence: 7,
      placeholder: "0.00",
      type: "text",
      dependentFields: ["tolerance_type"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.tolerance_type?.value === "B") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "notional_curr_rate",
      label: "Conversion Rate",
      sequence: 8,
      placeholder: "0.0000",
      type: "text",
      decimalScale: 4,
      className: "textInputFromRight",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: [
        "actual_lc_amount",
        "tolerance_type",
        "tolerance_percent",
        "LIMIT_AMT",
        "MARGIN_PER",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return formState.Calculation(currentField, dependentFieldValues);
        }
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 1,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "MARGIN_PER",
      label: "Margin[%]",
      sequence: 9,
      type: "text",
      validationRun: "all",
      FormatProps: {
        placeholder: "0.00",
        allowNegative: false,
        allowLeadingZeros: false,
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 1,
      },
      dependentFields: [
        "actual_lc_amount",
        "notional_curr_rate",
        "tolerance_type",
        "tolerance_percent",
        "LIMIT_AMT",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value === 0) {
          return { MARGIN_AMT: 0 };
        }

        return formState.Calculation(currentField, dependentFieldValues);
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MARGIN_AMT",
      label: "Margin Amount",
      sequence: 10,
      placeholder: "Enter Margin Amount",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 6,
        sm: 4,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CASH_MARGIN",
      label: "Cash Margin Amount",
      sequence: 11,
      placeholder: "",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: true,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 6,
        sm: 4,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_MARGIN_AMT",
      label: "Total Margin Amount",
      sequence: 12,
      placeholder: "Enter Total Margin Amount",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 6,
        sm: 4,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LC_UTILIZE_AMT",
      label: "LC Utilize Amount",
      sequence: 14,
      placeholder: "",
      type: "text",
      isReadOnly: true,
      __NEW__: {
        shouldExclude: true,
        ignoreInSubmit: true,
      },
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LC_AMOUNT",
      label: "LC Amount",
      sequence: 15,
      placeholder: "",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LC_INR_AMT",
      label: "LC LCY Amount",
      sequence: 16,
      placeholder: "",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMT",
      label: "Available Limit Amount",
      sequence: 17,
      placeholder: "",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_USE_AMT",
      label: "Limit Use",
      sequence: 18,
      placeholder: "",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "lakh",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 2,
        fixedDecimalScale: true,
        placeholder: "00.00",
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "lc_tenor_days",
      label: "Tenor Days",
      sequence: 18,
      placeholder: "0",
      type: "text",
      className: "textInputFromRight",
      GridProps: {
        xs: 3,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.function_id === "LCS") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LC_EXPIRY_DT",
      label: "Expiry Date(31D)",
      sequence: 19,
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy",
      validationRun: "onChange",
      validate: (value, ...rest) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(value?.value) < new Date(rest?.[1]?.authState?.workingDate)
        ) {
          return "BackDatenotAllow";
        }
        return "";
      },
      GridProps: {
        xs: 6,
        md: 2,
        sm: 4,
        lg: 2,
        xl: 1,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LC_EXPIRY_PLACE",
      label: "Expiry Place(31D)",
      sequence: 20,
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      sequence: 21,
      placeholder: "Enter Remarks",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
  ],
};

export const lcBenficiary = {
  form: {
    name: "AddLCBENFICIARY",
    label: "",
    resetFieldOnUnmount: false,
    readonly: true,
    validationRun: "all",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      datePicker: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "divider",
        sequence: 20,
      },
      name: "benficiaryHeaderDivider",
      label: "Beneficiary/Exporter/Drawer Details(59)",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "B_PARTY_CD",
      label: "Party CODE",
      sequence: 5,
      placeholder: "Select Party Code",
      type: "text",
      options: (data, formState, _, authState) =>
        API.getCustBenDTl({
          A_COMP_CD: authState?.companyID ?? "",
          BASE_BRANCH: authState?.user?.branchCode ?? "",
          A_CUST_ID: formState?.customer_id ?? "",
        }),
      _optionsKey: "bpartycd",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            B_PARTY_IDENTIFIER: {
              value: currentField?.optionData[0]?.PARTY_IDENTIFIER,
            },
            B_NAME: { value: currentField?.optionData[0]?.BANK_NM },
            B_ADD1: { value: currentField?.optionData[0]?.ADD1 },
            B_CITY_CD: { value: currentField?.optionData[0]?.CITY_CD },
            B_STATE_CD: { value: currentField?.optionData[0]?.STATE_CD },
            B_COUNTRY_CD: { value: currentField?.optionData[0]?.COUNTRY_CD },
            B_POSTAL_CD: { value: currentField?.optionData[0]?.POSTAL_CD },
          };
        }
      },
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "B_PARTY_IDENTIFIER",
      label: "Party IDENTIFIER",
      sequence: 3,
      placeholder: "Select Party Identifier",
      type: "text",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "B_NAME",
      label: "Name",
      sequence: 4,
      placeholder: "Select Name",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "B_ADD1",
      label: "Address Line 1",
      sequence: 5,
      placeholder: "Enter Address Line 1",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "B_CITY_CD",
      label: "City",
      sequence: 6,
      placeholder: "Enter City",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "B_STATE_CD",
      label: "State",
      sequence: 7,
      placeholder: "Enter State",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "B_COUNTRY_CD",
      label: "Country",
      sequence: 8,
      placeholder: "Enter Country",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "COUNTRY" }),
      _optionsKey: "bcountrycd",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "B_POSTAL_CD",
      label: "Postal/Zip Code",
      sequence: 9,
      placeholder: "Enter Postal/Zip Code",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "divider",
        sequence: 20,
      },
      name: "availHeaderDivider",
      label: "Available With ... By ...(41)",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "AW_SUBFIELD",
      label: "Field",
      sequence: 5,
      placeholder: "Select Field",
      type: "text",
      options: () => ETFGeneralAPI.GetFPMiscValue({ CATEG_CD: "MT_AD" }),
      _optionsKey: "awsubfield",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      validationRun: "all",
      dependentFields: [
        "AW_PARTY_CD",
        "AW_IDENTIFIER_CD",
        "AW_CODES",
        "AW_NAME",
        "AW_ADD1",
        "AW_CITY_CD",
        "AW_STATE_CD",
        "AW_COUNTRY_CD",
        "AW_POSTAL_CD",
      ],
      validate: (value, data) => {
        const hasAnyValue =
          data?.AW_PARTY_CD?.value ||
          data?.AW_IDENTIFIER_CD?.value ||
          data?.AW_CODES?.value ||
          data?.AW_NAME?.value ||
          data?.AW_ADD1?.value ||
          data?.AW_CITY_CD?.value ||
          data?.AW_STATE_CD?.value ||
          data?.AW_COUNTRY_CD?.value ||
          data?.AW_POSTAL_CD?.value;

        if (hasAnyValue && !value?.value) {
          return "This field is required.";
        }
        return "";
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "AW_PARTY_CD",
      label: "Party CODE",
      sequence: 5,
      placeholder: "Select Party Code",
      type: "text",
      options: (data, formState, _, authState) =>
        API.getCustBenDTl({
          A_COMP_CD: authState?.companyID ?? "",
          BASE_BRANCH: authState?.user?.branchCode ?? "",
          A_CUST_ID: formState?.customer_id ?? "",
        }),
      _optionsKey: "awpartycd",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            AW_IDENTIFIER_CD: { value: currentField?.optionData[0]?.SWIFT_CD },
            AW_NAME: { value: currentField?.optionData[0]?.BANK_NM },
            AW_ADD1: { value: currentField?.optionData[0]?.ADD1 },
            AW_CITY_CD: { value: currentField?.optionData[0]?.CITY_CD },
            AW_STATE_CD: { value: currentField?.optionData[0]?.STATE_CD },
            AW_COUNTRY_CD: { value: currentField?.optionData[0]?.COUNTRY_CD },
            AW_POSTAL_CD: { value: currentField?.optionData[0]?.POSTAL_CD },
          };
        }
      },
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AW_IDENTIFIER_CD",
      label: "Swift/BIC Code",
      sequence: 3,
      placeholder: "Select Swift/BIC Code",
      type: "text",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "AW_CODES",
      label: "CODE",
      sequence: 3,
      placeholder: "Select Party Code",
      type: "text",
      options: () => ETFGeneralAPI.GetFPMiscValue({ CATEG_CD: "AVAILABLE_BY" }),
      _optionsKey: "awcodes",
      // required: true,
      // schemaValidation: {
      //   type: "string",
      //   rules: [{ name: "required", params: ["This field is required."] }],
      // },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AW_NAME",
      label: "Name",
      sequence: 4,
      placeholder: "Select Name",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
      validationRun: "all",
      dependentFields: ["AW_SUBFIELD"],
      validate: (value, data) => {
        if (data?.AW_SUBFIELD?.value === "D") {
          if (!value?.value) {
            return "This field is required";
          }
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AW_ADD1",
      label: "Address Line 1",
      sequence: 5,
      placeholder: "Enter Address Line 1",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AW_CITY_CD",
      label: "City",
      sequence: 6,
      placeholder: "Enter City",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AW_STATE_CD",
      label: "State",
      sequence: 7,
      placeholder: "Enter State",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "AW_COUNTRY_CD",
      label: "Country",
      sequence: 8,
      placeholder: "Enter Country",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "COUNTRY" }),
      _optionsKey: "awcountrycd",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AW_POSTAL_CD",
      label: "Postal/Zip Code",
      sequence: 9,
      placeholder: "Enter Postal/Zip Code",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "divider",
        sequence: 20,
      },
      name: "advice57HeaderDivider",
      label: "Advising Through Bank Details(57)",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BB_SUBFIELD",
      label: "Field",
      sequence: 5,
      placeholder: "Select Field",
      type: "text",
      validationRun: "all",
      options: () => ETFGeneralAPI.GetFPMiscValue({ CATEG_CD: "MT_ABD" }),
      _optionsKey: "bbsubfield",
      disableCaching: true,
      dependentFields: [
        "BB_PARTY_CD",
        "BB_PARTY_IDENTIFIER",
        "BB_IDENTIFIER_CD",
        "BB_NAME",
        "BB_ADD1",
        "BB_CITY_CD",
        "BB_STATE_CD",
        "BB_COUNTRY_CD",
        "BB_POSTAL_CD",
      ],
      validate: (value, data) => {
        const hasAnyValue =
          data?.BB_PARTY_CD?.value ||
          data?.BB_PARTY_IDENTIFIER?.value ||
          data?.BB_IDENTIFIER_CD?.value ||
          data?.BB_NAME?.value ||
          data?.BB_ADD1?.value ||
          data?.BB_CITY_CD?.value ||
          data?.BB_STATE_CD?.value ||
          data?.BB_COUNTRY_CD?.value ||
          data?.BB_POSTAL_CD?.value;
        if (hasAnyValue && !value?.value) {
          return "This field is required.";
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BB_PARTY_CD",
      label: "Party Code",
      sequence: 5,
      placeholder: "Select Party Code",
      type: "text",
      options: (data, formState, _, authState) =>
        API.getCustBenDTl({
          A_COMP_CD: authState?.companyID ?? "",
          BASE_BRANCH: authState?.user?.branchCode ?? "",
          A_CUST_ID: formState?.customer_id ?? "",
        }),
      _optionsKey: "bbpartycd",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            BB_IDENTIFIER_CD: { value: currentField?.optionData[0]?.SWIFT_CD },
            BB_PARTY_IDENTIFIER: {
              value: currentField?.optionData[0]?.PARTY_IDENTIFIER,
            },
            BB_NAME: { value: currentField?.optionData[0]?.BANK_NM },
            BB_ADD1: { value: currentField?.optionData[0]?.ADD1 },
            BB_CITY_CD: { value: currentField?.optionData[0]?.CITY_CD },
            BB_STATE_CD: { value: currentField?.optionData[0]?.STATE_CD },
            BB_COUNTRY_CD: { value: currentField?.optionData[0]?.COUNTRY_CD },
            BB_POSTAL_CD: { value: currentField?.optionData[0]?.POSTAL_CD },
          };
        }
      },
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_PARTY_IDENTIFIER",
      label: "Party Identifier",
      sequence: 3,
      placeholder: "Select Party Identifier",
      type: "text",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_IDENTIFIER_CD",
      label: "Swift/BIC Code",
      sequence: 3,
      placeholder: "Select Swift/BIC Code",
      type: "text",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      validationRun: "all",
      dependentFields: ["BB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.BB_SUBFIELD?.value === "A" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_NAME",
      label: "Name",
      sequence: 4,
      placeholder: "Select Name",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
      validationRun: "all",
      dependentFields: ["BB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.BB_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_ADD1",
      label: "Address Line 1",
      sequence: 5,
      placeholder: "Enter Address Line 1",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
      validationRun: "all",
      dependentFields: ["BB_IDENTIFIER_CD", "BB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.BB_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_CITY_CD",
      label: "City",
      sequence: 6,
      placeholder: "Enter City",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_STATE_CD",
      label: "State",
      sequence: 7,
      placeholder: "Enter State",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BB_COUNTRY_CD",
      label: "Country",
      sequence: 8,
      placeholder: "Enter Country",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "COUNTRY" }),
      disableCaching: true,
      _optionsKey: "bbcountrycd",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
      dependentFields: ["BB_SUBFIELD"],
      validationRun: "all",
      validate: (value, data) => {
        if (data?.BB_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BB_POSTAL_CD",
      label: "Postal/Zip Code",
      sequence: 9,
      placeholder: "Enter Postal/Zip Code",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "divider",
        sequence: 20,
      },
      name: "reqconf58HeaderDivider",
      label: "Request Confirmation Details(58)",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RC_SUBFIELD",
      label: "Field",
      sequence: 5,
      placeholder: "Select Field",
      type: "text",
      options: () =>
        ETFGeneralAPI.GetFPMiscValue({
          CATEG_CD: "MT_AD",
        }),
      _optionsKey: "rcsubfield",
      disableCaching: true,
      validationRun: "all",
      dependentFields: [
        "RC_PARTY_CD",
        "RC_IDENTIFIER_CD",
        "RC_NAME",
        "RC_ADD1",
        "RC_CITY_CD",
        "RC_STATE_CD",
        "RC_COUNTRY_CD",
        "RC_POSTAL_CD",
      ],
      validate: (value, data) => {
        const hasAnyValue =
          data?.RC_PARTY_CD?.value ||
          data?.RC_IDENTIFIER_CD?.value ||
          data?.RC_NAME?.value ||
          data?.RC_ADD1?.value ||
          data?.RC_CITY_CD?.value ||
          data?.RC_STATE_CD?.value ||
          data?.RC_COUNTRY_CD?.value ||
          data?.RC_POSTAL_CD?.value;

        if (hasAnyValue && !value?.value) {
          return "This field is required.";
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RC_PARTY_CD",
      label: "Party Code",
      sequence: 5,
      placeholder: "Select Party Code",
      type: "text",
      options: (data, formState, _, authState) =>
        API.getCustBenDTl({
          A_COMP_CD: authState?.companyID ?? "",
          BASE_BRANCH: authState?.user?.branchCode ?? "",
          A_CUST_ID: formState?.customer_id ?? "",
        }),
      _optionsKey: "rcpartycd",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            RC_IDENTIFIER_CD: { value: currentField?.optionData[0]?.SWIFT_CD },
            RC_NAME: { value: currentField?.optionData[0]?.BANK_NM },
            RC_ADD1: { value: currentField?.optionData[0]?.ADD1 },
            RC_CITY_CD: { value: currentField?.optionData[0]?.CITY_CD },
            RC_STATE_CD: { value: currentField?.optionData[0]?.STATE_CD },
            RC_COUNTRY_CD: { value: currentField?.optionData[0]?.COUNTRY_CD },
            RC_POSTAL_CD: { value: currentField?.optionData[0]?.POSTAL_CD },
          };
        }
      },
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RC_IDENTIFIER_CD",
      label: "Swift/BIC Code",
      sequence: 3,
      placeholder: "Select Swift/BIC Code",
      type: "text",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      validationRun: "all",
      dependentFields: ["RC_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RC_SUBFIELD?.value === "A" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RC_NAME",
      label: "Name",
      sequence: 4,
      placeholder: "Select Name",
      type: "text",
      validationRun: "all",
      dependentFields: ["RC_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RC_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RC_ADD1",
      label: "Address Line 1",
      sequence: 5,
      placeholder: "Enter Address Line 1",
      type: "text",
      validationRun: "all",
      dependentFields: ["RC_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RC_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RC_CITY_CD",
      label: "City",
      sequence: 6,
      placeholder: "Enter City",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RC_STATE_CD",
      label: "State",
      sequence: 7,
      placeholder: "Enter State",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RC_COUNTRY_CD",
      label: "Country",
      sequence: 8,
      placeholder: "Enter Country",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "COUNTRY" }),
      _optionsKey: "rccountrycd",
      disableCaching: true,
      validationRun: "all",
      dependentFields: ["RC_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RC_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RC_POSTAL_CD",
      label: "Postal/Zip Code",
      sequence: 9,
      placeholder: "Enter Postal/Zip Code",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "divider",
        sequence: 20,
      },
      name: "reimbank53HeaderDivider",
      label: "Reimbursing Bank (53)",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RB_SUBFIELD",
      label: "Field",
      sequence: 5,
      placeholder: "Select Field",
      type: "text",
      options: () =>
        ETFGeneralAPI.GetFPMiscValue({
          CATEG_CD: "MT_AD",
        }),
      _optionsKey: "rbsubfield",
      disableCaching: true,
      validationRun: "all",
      dependentFields: [
        "RB_PARTY_CD",
        "RB_IDENTIFIER_CD",
        "RB_NAME",
        "RB_ADD1",
        "RB_CITY_CD",
        "RB_STATE_CD",
        "RB_COUNTRY_CD",
        "RB_POSTAL_CD",
      ],
      validate: (value, data) => {
        const hasAnyValue =
          data?.RB_PARTY_CD?.value ||
          data?.RB_IDENTIFIER_CD?.value ||
          data?.RB_NAME?.value ||
          data?.RB_ADD1?.value ||
          data?.RB_CITY_CD?.value ||
          data?.RB_STATE_CD?.value ||
          data?.RB_COUNTRY_CD?.value ||
          data?.RB_POSTAL_CD?.value;

        if (hasAnyValue && !value?.value) {
          return "This field is required.";
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RB_PARTY_CD",
      label: "Party Code",
      sequence: 5,
      placeholder: "Select Party Code",
      type: "text",
      options: (data, formState, _, authState) =>
        API.getCustBenDTl({
          A_COMP_CD: authState?.companyID ?? "",
          BASE_BRANCH: authState?.user?.branchCode ?? "",
          A_CUST_ID: formState?.customer_id ?? "",
        }),
      _optionsKey: "rbpartycd",
      disableCaching: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            RB_IDENTIFIER_CD: { value: currentField?.optionData[0]?.SWIFT_CD },
            RB_NAME: { value: currentField?.optionData[0]?.BANK_NM },
            RB_ADD1: { value: currentField?.optionData[0]?.ADD1 },
            RB_CITY_CD: { value: currentField?.optionData[0]?.CITY_CD },
            RB_STATE_CD: { value: currentField?.optionData[0]?.STATE_CD },
            RB_COUNTRY_CD: { value: currentField?.optionData[0]?.COUNTRY_CD },
            RB_POSTAL_CD: { value: currentField?.optionData[0]?.POSTAL_CD },
          };
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RB_IDENTIFIER_CD",
      label: "Swift/BIC Code",
      sequence: 3,
      placeholder: "Select Swift/BIC Code",
      type: "text",
      disableCaching: true,
      validationRun: "all",
      dependentFields: ["RB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RB_SUBFIELD?.value === "A" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RB_NAME",
      label: "Name",
      sequence: 4,
      placeholder: "Select Name",
      type: "text",
      validationRun: "all",
      dependentFields: ["RB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RB_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RB_ADD1",
      label: "Address Line 1",
      sequence: 5,
      placeholder: "Enter Address Line 1",
      type: "text",
      validationRun: "all",
      dependentFields: ["RB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RB_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RB_CITY_CD",
      label: "City",
      sequence: 6,
      placeholder: "Enter City",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RB_STATE_CD",
      label: "State",
      sequence: 7,
      placeholder: "Enter State",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RB_COUNTRY_CD",
      label: "Country",
      sequence: 8,
      placeholder: "Enter Country",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "COUNTRY" }),
      _optionsKey: "rbcountrycd",
      disableCaching: true,
      validationRun: "all",
      dependentFields: ["RB_SUBFIELD"],
      validate: (value, data) => {
        if (data?.RB_SUBFIELD?.value === "D" && !value?.value) {
          return "This field is required";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RB_POSTAL_CD",
      label: "Postal/Zip Code",
      sequence: 9,
      placeholder: "Enter Postal/Zip Code",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
  ],
};

export const lcShipmentDtl = {
  form: {
    name: "AddShipmentDetails",
    label: "",
    resetFieldOnUnmount: false,
    readonly: true,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      datePicker: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "divider",
        sequence: 20,
      },
      name: "shipmentDivider",
      label: "Shipment Details",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PART_SHIPMENT",
      label: "Partial Shipment(43P)",
      sequence: 1,
      placeholder: "Select Partial Shipment",
      type: "text",
      options: [
        { value: "Y", label: "Yes" },
        { value: "N", label: "No" },
      ],
      _optionsKey: "partshipment",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRANSHIPMENT",
      label: "Transhipment(43T)",
      sequence: 2,
      placeholder: "Select Transhipment",
      type: "text",
      options: [
        { value: "Y", label: "Yes" },
        { value: "N", label: "No" },
      ],
      _optionsKey: "transhipment",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DISPATCH_FROM",
      label: "Dispatch From(44A)",
      sequence: 3,
      placeholder: "Enter Dispatch From",
      type: "text",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PORT_OF_LOADING",
      label: "Port of Loading(44E)",
      sequence: 4,
      placeholder: "Enter Port of Loading",
      type: "text",
      disableCaching: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PORT_OF_DISCHARGE",
      label: "Port of Discharge(44F)*",
      sequence: 5,
      placeholder: "Select Port of Discharge",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "PORT" }),
      _optionsKey: "portofdischarge",
      disableCaching: true,
      screenValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["Please select Port of Discharge"] },
        ],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "DATE_OF_SHIPMENT",
      label: "Latest Date of Shipment(44C) sadfgfdsadfg",
      sequence: 7,
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy",
      GridProps: {
        xs: 6,
        sm: 6,
        md: 1,
        lg: 1,
        xl: 1.5,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["This field is required."],
          },
        ],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SHIPMENT_PERIOD",
      label: "Shipment Period(44D)",
      sequence: 8,
      placeholder: "Enter Shipment Period",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INCO_TERMS",
      label: "INCO Terms*",
      sequence: 9,
      placeholder: "Select Inco Terms",
      type: "text",
      options: () => ETFGeneralAPI.GetFMiscList({ CATEG_CD: "INCO" }),
      _optionsKey: "incoterms",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      screenValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Please select Inco Terms"] }],
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PRESENTMENT_DAYS",
      label: "Presentment Days",
      sequence: 10,
      placeholder: "Enter Days",
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
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
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FROM_DATE_IND",
      label: "",
      sequence: 11,
      placeholder: "Enter Narrative",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CONFIRMATION_INST",
      label: "Confirmation Instructions(49)*",
      sequence: 12,
      placeholder: "Select Confirmation Instructions",
      type: "text",
      options: () => ETFGeneralAPI.GetFPMiscValue({ CATEG_CD: "CONF_INST" }),
      _optionsKey: "confirmationinst",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "divider",
        sequence: 13,
      },
      name: "commodityDivider",
      label: "Commodity Details",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COMMODITY_CD",
      label: "Commodity Code",
      sequence: 14,
      placeholder: "Select Commodity Code",
      type: "text",
      options: async (data) => {
        return await GeneralAPI.getTFCommodity();
      },
      _optionsKey: "commodity",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COM_DESCRIPTION",
      label: "Commodity Description",
      sequence: 15,
      placeholder: "Enter Commodity Description",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "IMP_LIC_TYPE",
      label: "Import Lic./OGL",
      sequence: 16,
      placeholder: "Enter Import Lic./OGL",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LIC_NO",
      label: "License No.",
      sequence: 17,
      placeholder: "Enter License Number",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["COMMODITY_CD"],
      validate: (value, ...rest) => {
        const OptionData = rest?.[0]?.COMMODITY_CD?.optionData?.[0]?.LICENSE;
        if (OptionData === "Y") {
          if (!value?.value) {
            return "This field is required";
          }
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LIC_DATE",
      label: "License Date",
      sequence: 18,
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy",
      dependentFields: ["COMMODITY_CD"],
      validate: (value, ...rest) => {
        const OptionData = rest?.[0]?.COMMODITY_CD?.optionData?.[0]?.LICENSE;
        if (OptionData === "Y") {
          if (!value?.value) {
            return "This field is required";
          }
        }
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(value?.value) < new Date(rest?.[1]?.authState?.workingDate)
        ) {
          return "BackDatenotAllow";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,

      GridProps: {
        xs: 6,
        sm: 6,
        md: 1,
        lg: 1,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PERMIT_NO",
      label: "Permit No.",
      sequence: 19,
      placeholder: "Enter Permit Number",
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        isAllowed: (values) => {
          return true;
        },
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "PERMIT_ISSUE_DT",
      label: "Permit Issue Date",
      sequence: 20,
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy",
      validate: (value, ...rest) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(value?.value) < new Date(rest?.[1]?.authState?.workingDate)
        ) {
          return "BackDatenotAllow";
        }
        return "";
      },
      GridProps: {
        xs: 6,
        sm: 6,
        md: 1,
        lg: 1,
        xl: 1.5,
      },
    },
  ],
};
