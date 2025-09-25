import * as API from "../../../../api";
export const other_details_legal_meta_data = {
  form: {
    name: "legal_other_details_annual_income_details_form",
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
      // required: true,
      isFieldFocused: true,
      placeholder: "rangeOptions",
      type: "text",
      //   GridProps: {xs:12, sm:4, md: 3, lg: 2.5, xl:1.5},
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: false,
      name: "POLITICALLY_CONNECTED",
    },
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: false,
      name: "REFERRED_BY_STAFF",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      // className: "textInputFromRight",
      name: "ANNUAL_TURNOVER_SR_CD",
      label: "Turnover",
      options: (dependentValue, formState, _, authState) =>
        API.getRangeOptions(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "turnoverOptions",
      placeholder: "Turnover",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      // maxLength: 3,
      // showMaxLength: false,
      // FormatProps: {
      //   allowNegative: false,
      //   allowLeadingZeros: true,
      //   decimalScale: 0,
      //   isAllowed: (values) => {
      //     if (values?.value?.length > 3) {
      //       return false;
      //     }
      //     if (values?.value > 100) {
      //       return false;
      //     }
      //     return true;
      //   },
      // },
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
      placeholder: "OtherIncome",
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
      placeholder: "SourceOfIncome",
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
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "amountField",
      },
      // className: "textInputFromRight",
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
      // className: "textInputFromRight",
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
        componentType: "numberFormat",
      },
      name: "IMP_EXP_CODE",
      label: "ImportExportCode",
      placeholder: "ImportExportCode",
      maxLength: 10,
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          if (values?.value === "0") {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      // className: "textInputFromRight",
      name: "THRESHOLD_AMT",
      label: "ThresholdLimit",
      enableNumWords: false,
      placeholder: "ThresholdLimit",
      type: "text",
      maxLength: 15,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
