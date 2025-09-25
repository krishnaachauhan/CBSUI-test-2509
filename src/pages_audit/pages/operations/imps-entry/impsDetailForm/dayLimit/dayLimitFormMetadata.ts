import { t } from "i18next";

export const dayLimitFormMetaData = {
  form: {
    name: "day-limit-metadatas",
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
      render: { componentType: "datetimePicker" },
      name: "EFFECTIVE_DT",
      type: "date",
      label: "EffectiveDate",
      format: "dd/MM/yyyy HH:mm:ss",
      required: true,
      isReadOnly: true,
      isWorkingDate: true,
      GridProps: { xs: 12, md: 2.5, sm: 2.5, lg: 2.5, xl: 2.5 },

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required"] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      isReadOnly: true,
      label: "BranchCode",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      isReadOnly: true,
      label: "AccountType",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      label: "AccountNumber",
      name: "ACCT_CD",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      label: "AccountName",
      name: "ACCT_NM",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 5.5,
        sm: 5.5,
        lg: 5.5,
        xl: 5.5,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "FLAG",
    },
    {
      render: {
        componentType: "hidden",
      },
      label: "",
      name: "COMMON",
      dependentFields: ["FLAG"],
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (typeof field?.value === "number") {
          formState.MessageBox({
            messageTitle: "ValidationFailed",
            message: `Account Level ${dependentFields?.FLAG?.incomingMessage?.value} Transaction rights not assign`,
            icon: "ERROR",
            defFocusBtnName: "Ok",
          });
        }
        return {};
      },
    },
    {
      render: { componentType: "checkbox" },
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
      validationRun: "onChange",
      dependentFields: ["DTL_IFT"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_IFT?.value === "N" && Boolean(field?.value)) {
          return {
            IFT: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "IFT" },
          };
        }
        return {};
      },
    },

    {
      render: { componentType: "amountField" },
      name: "IFT_LIMIT",
      type: "text",
      label: "IFT/Daily Limit",
      dependentFields: ["IFT", "PERDAY_IFT_LIMIT"],
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_IFT_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return ` ${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_IFT_LIMIT?.value
          )}`;
        }

        return "";
      },

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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      validationRun: "onChange",
      dependentFields: ["DTL_RTGS"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_RTGS?.value === "N" && Boolean(field?.value)) {
          return {
            RTGS: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "RTGS" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "RTGS_LIMIT",
      type: "text",
      label: "RTGSDayLimit",
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
      dependentFields: ["RTGS", "PERDAY_RTGS_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_RTGS_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_RTGS_LIMIT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      name: "NEFT",
      label: "NEFT",
      defaultValue: false,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
      validationRun: "onChange",
      dependentFields: ["DTL_NEFT"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_NEFT?.value === "N" && Boolean(field?.value)) {
          return {
            NEFT: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "NEFT" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "NEFT_LIMIT",
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
      dependentFields: ["NEFT", "PERDAY_NEFT_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_NEFT_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_NEFT_LIMIT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      validationRun: "onChange",
      dependentFields: ["DTL_OWN_ACT"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (
          dependentFields?.DTL_OWN_ACT?.value === "N" &&
          Boolean(field?.value)
        ) {
          return {
            OWN_ACT: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "OWN A/c" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "OWN_LIMIT",
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
      dependentFields: ["OWN_ACT", "PERDAY_OWN_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_OWN_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_OWN_LIMIT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      render: { componentType: "checkbox" },

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
      validationRun: "onChange",
      dependentFields: ["DTL_BBPS"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_BBPS?.value === "N" && Boolean(field?.value)) {
          return {
            BBPS: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "BBPS" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "BBPS_LIMIT",
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
      dependentFields: ["BBPS", "PERDAY_BBPS_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_BBPS_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_BBPS_LIMIT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      validationRun: "onChange",
      dependentFields: ["DTL_PG_TRN"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (
          dependentFields?.DTL_PG_TRN?.value === "N" &&
          Boolean(field?.value)
        ) {
          return {
            PG_TRN: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "Payment Gateway" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "PG_LIMIT",
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
      dependentFields: ["PG_TRN", "PERDAY_PG_AMT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_PG_AMT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_PG_AMT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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

      name: "ATM",
      defaultValue: false,
      label: "ATM",
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
      validationRun: "onChange",
      dependentFields: ["DTL_ATM"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_ATM?.value === "N" && Boolean(field?.value)) {
          return {
            ATM: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "ATM" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "ATM_LIMIT",
      type: "text",
      label: "ATMDailyLimit",
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
      dependentFields: ["ATM", "PERDAY_ATM_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_ATM_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_ATM_LIMIT?.value
          )}`;
        }

        return "";
      },
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["ATM"]?.value
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
      name: "ATM_LIMIT_SPACER",
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      defaultValue: "",
      dependentFields: ["ATM"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["ATM"]?.value
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

      name: "POS",
      defaultValue: false,
      label: "POS",
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
      validationRun: "onChange",
      dependentFields: ["DTL_POS"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_POS?.value === "N" && Boolean(field?.value)) {
          return {
            POS: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "POS" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "POS_LIMIT",
      type: "text",
      label: "POSDailyLimit",
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
      dependentFields: ["POS", "PERDAY_POS_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_POS_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_POS_LIMIT?.value
          )}`;
        }

        return "";
      },
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["POS"]?.value
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
      name: "POS_LIMIT_SPACER",
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      defaultValue: "",
      dependentFields: ["POS"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["POS"]?.value
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

      name: "ECOM",
      defaultValue: false,
      label: "ECOM",
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
      validationRun: "onChange",
      dependentFields: ["DTL_ECOM"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_ECOM?.value === "N" && Boolean(field?.value)) {
          return {
            ECOM: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "ECOM" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "ECOM_LIMIT",
      type: "text",
      label: "ECOMDailyLimit",
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
      dependentFields: ["ECOM", "PERDAY_ECOM_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_ECOM_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}  ${Number(
            allField?.PERDAY_ECOM_LIMIT?.value
          )}`;
        }

        return "";
      },
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["ECOM"]?.value
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
      name: "ECOM_LIMIT_SPACER",
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      defaultValue: "",
      dependentFields: ["ECOM"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["ECOM"]?.value
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

      name: "UPI",
      defaultValue: false,
      label: "UPI",
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 6,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
      validationRun: "onChange",
      dependentFields: ["DTL_UPI"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_UPI?.value === "N" && Boolean(field?.value)) {
          return {
            UPI: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "UPI" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "UPI_LIMIT",
      type: "text",
      label: "UPIDailyLimit",
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
      dependentFields: ["UPI", "PERDAY_UPI_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_UPI_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_UPI_LIMIT?.value
          )}`;
        }

        return "";
      },
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["UPI"]?.value
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
      name: "UPI_LIMIT_SPACER",
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
      defaultValue: "",
      dependentFields: ["UPI"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const dependentValue = dependentFieldsValues?.["UPI"]?.value
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
      validationRun: "onChange",
      dependentFields: ["DTL_IMPS"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (dependentFields?.DTL_IMPS?.value === "N" && Boolean(field?.value)) {
          return {
            IMPS: { value: false },
            COMMON: { value: Date.now() },
            FLAG: { value: "IMPS" },
          };
        }
        return {};
      },
    },
    {
      render: { componentType: "amountField" },
      name: "P2P_LIMIT",
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
      dependentFields: ["IMPS", "PERDAY_P2P_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_P2P_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_P2P_LIMIT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      name: "P2A_LIMIT",
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
      dependentFields: ["IMPS", "PERDAY_P2A_LIMIT"],
      validate: (columnValue, allField, flag) => {
        let limitValue = Number(allField?.PERDAY_P2A_LIMIT?.value);
        if (Number(columnValue.value) > limitValue && limitValue > 0) {
          return `${t("limitamountlessthan")}   ${Number(
            allField?.PERDAY_P2A_LIMIT?.value
          )}`;
        }

        return "";
      },
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
      GridProps: { pt: "80px !important", xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
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
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_IFT_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_RTGS_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_UPI_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_NEFT_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_OWN_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_PG_AMT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_POS_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_ECOM_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_ATM_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_P2A_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_P2P_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERDAY_BBPS_LIMIT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_IFT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_RTGS",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_UPI",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_NEFT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_OWN_ACT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_PG_TRN",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_POS",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_ECOM",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_ATM",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_IMPS",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DTL_BBPS",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_COMP_CD",
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
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SR_CD",
    },
  ],
};
