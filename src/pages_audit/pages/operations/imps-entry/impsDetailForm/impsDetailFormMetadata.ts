export const impsRegDetails = {
  form: {
    name: "imps-RegDetails",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    hideHeader: false,
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
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
    },
  },

  fields: [
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "BranchCode",
      isReadOnly: true,
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      isReadOnly: true,
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNumber",
      isReadOnly: true,
      GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      isReadOnly: true,
      GridProps: { xs: 12, md: 3.5, sm: 3.5, lg: 3.5, xl: 3.5 },
    },

    {
      render: { componentType: "datePicker" },
      name: "REG_DT",
      type: "date",
      label: "RegDate",
      required: true,
      isReadOnly: true,
      isWorkingDate: true,
      GridProps: {
        xs: 12,
        md: 1.5,
        sm: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required"] }],
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SR_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_COMP_CD",
    },
    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "IFT",
      label: "IFT",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },

    {
      render: { componentType: "amountField" },
      name: "PERDAY_IFT_LIMIT",
      type: "text",
      label: "IFTDailyLimit",
      dependentFields: ["IFT"],
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      // required: true,
      // schemaValidation: {
      //   type: "string",
      //   rules: [{ name: "required", params: ["This field is required"] }],
      // },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["IFT"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "IFT_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["IFT"],

      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["IFT"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },
    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "RTGS",
      label: "RTGS",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_RTGS_LIMIT",
      type: "text",
      label: "RTGSDayLimit",
      GridProps: { xs: 12, md: 3, sm: 4, lg: 2, xl: 1.5 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["RTGS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["RTGS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "RTGS_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["RTGS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["RTGS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },
    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "NEFT",
      label: "NEFT",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_NEFT_LIMIT",
      type: "text",
      label: "NEFTDayLimit",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["NEFT"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["NEFT"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "NEFT_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["NEFT"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["NEFT"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },

    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "OWN_ACT",
      label: "OwnAc",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "24px", alignSelf: "center" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_OWN_LIMIT",
      type: "text",
      label: "OWNDayLimit",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["OWN_ACT"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["OWN_ACT"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "OWN_ACT_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["OWN_ACT"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["OWN_ACT"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "SPACER_ST",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2, pt: "80px !important" },
      __VIEW__: {
        render: {
          componentType: "spacer",
        },
      },
    },

    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "BBPS",
      label: "BBPS",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_BBPS_LIMIT",
      type: "text",
      label: "BBPSDayLimit",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["BBPS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["BBPS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "BBPS_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",

      label: " ",
      dependentFields: ["BBPS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["BBPS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },
    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "PG_TRN",
      defaultValue: false,
      label: "PaymentGateway",
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_PG_AMT",
      type: "text",
      label: "PGatewayDailyLimit",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["PG_TRN"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["PG_TRN"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "PG_TRN_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["PG_TRN"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["PG_TRN"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },
    {
      render: { componentType: "checkbox" },
      type: "checkbox",
      name: "IMPS",
      label: "IMPS",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_P2P_LIMIT",
      type: "text",
      label: "IMPSP2PDayLimit",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["IMPS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["IMPS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "IMPS_LIMIT_SPACER",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["IMPS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["IMPS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PERDAY_P2A_LIMIT",
      type: "text",
      label: "IMPSP2ADayLimit",
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      FormatProps: {
        thousandSeparator: false,
        thousandsGroupStyle: "",
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["IMPS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["IMPS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "IMPS_LIMIT_SPACER2",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
        pt: "80px !important",
      },
      defaultValue: "",
      dependentFields: ["IMPS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["IMPS"]?.value
          .toString()
          .trim();
        if (dependentValue === "Y" || dependentValue === "true") {
          return true;
        }
        return false;
      },
    },
  ],
};
