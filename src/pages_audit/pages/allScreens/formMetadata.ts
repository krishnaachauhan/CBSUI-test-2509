import { MetaDataType } from "@acuteinfo/common-base";

export const reportConfigMetadata = {
  form: {
    name: "otpSmsConfigForm",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 1.52,
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
      render: { componentType: "checkbox" },
      name: "PAGINATION_ENABLE",
      label: "Enable Pagination",
      dependentFields: ["PAGINATION_ENABLE"],

      GridProps: { xs: 6, md: 2, sm: 2, lg: 1, xl: 1 },
    },

    {
      render: { componentType: "checkbox" },
      name: "DEFAULT_FILTER",
      label: "Default Filter",
      GridProps: { xs: 6, md: 2, sm: 2, lg: 1, xl: 1 },
    },

    {
      render: { componentType: "textField" },
      name: "id",
      label: "id",
      dependentFields: ["DEFAULT_FILTER"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DEFAULT_FILTER?.value === true) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 6, md: 4, sm: 1, lg: 1, xl: 1 },
    },
    {
      render: { componentType: "textField" },
      name: "columnName",
      label: "columnName",
      dependentFields: ["DEFAULT_FILTER"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DEFAULT_FILTER?.value === true) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 6, md: 4, sm: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: { componentType: "textField" },
      name: "type",
      label: "type",
      dependentFields: ["DEFAULT_FILTER"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DEFAULT_FILTER?.value === true) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 6, md: 4, sm: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: { componentType: "textField" },
      name: "value",
      label: "value",
      dependentFields: ["DEFAULT_FILTER"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DEFAULT_FILTER?.value === true) {
          return false;
        } else {
          return true;
        }
      },

      GridProps: { xs: 6, md: 4, sm: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: { componentType: "textField" },
      name: "condition",
      label: "condition",
      dependentFields: ["DEFAULT_FILTER"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DEFAULT_FILTER?.value === true) {
          return false;
        } else {
          return true;
        }
      },

      GridProps: { xs: 6, md: 4, sm: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: { componentType: "checkbox" },
      name: "isDisableDelete",
      label: "isDisableDelete",
      dependentFields: ["DEFAULT_FILTER"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DEFAULT_FILTER?.value === true) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 6, md: 4, sm: 2, lg: 1.5, xl: 1.5 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "RETRIEVAL_TYPE",
      label: "RetrievalType",
      fullWidth: true,
      defaultValue: "CUSTOMIZE",
      required: true,
      _optionsKey: "RETRIEVAL_TYPE",
      options: [
        {
          label: "Date",
          value: "DATE",
        },
        {
          label: "Static Retrieval Metadata",
          value: "STATIC",
        },

        {
          label: "Customize",
          value: "CUSTOMIZE",
        },
        {
          label: "Customize (As per query)",
          value: "AS_PER_QUERY",
        },
      ],
      validationRun: "all",
      postValidationSetCrossFieldValues: async (field, formState, __) => {
        if (
          field?.value &&
          formState.myRef.current.retrievalType !== field?.value &&
          formState.myRef.current.reportMetadata?.trim() !== ""
        ) {
          let buttonName = await formState.MessageBox({
            messageTitle: "Alert",
            message: "WantToResetReportMetadataandRetrievalMetadata",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            formState.myRef.current.reportMetadata = "";
            formState.myRef.current.retrieveMetadata = "";
            formState.myRef.current.retrievalType = field?.value;
            return {
              RETRIEVAL_TYPE: { value: field?.value },
            };
          } else {
            return {
              RETRIEVAL_TYPE: {
                value: formState.myRef.current.retrievalType ?? "CUSTOM",
                ignoreUpdate: true,
              },
            };
          }
        }
        return {};
      },
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["RetrievalTypeRequired"] },
          {
            name: "RETRIEVAL_TYPE",
            params: ["PleaseEnterRetrievalType"],
          },
        ],
      },
      runPostValidationHookAlways: true,
      GridProps: { xs: 12, md: 2, sm: 2, xl: 2, lg: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "GET_TYPE",
      label: "GetType",
      fullWidth: true,
      defaultValue: "SELECT",
      required: true,
      _optionsKey: "GET_TYPE",
      options: [
        {
          label: "Proc. With Cursor",
          value: "PROCWITHCURSOR",
        },
        {
          label: "Function with Cursor",
          value: "FUNCWITHCURSOR",
        },
        {
          label: "Select",
          value: "SELECT",
        },
      ],
      validationRun: "all",
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        __,
        dependent
      ) => {
        formState.myRef.current.getType = field?.value;

        return {};
      },
      dependentFields: ["RETRIEVAL_TYPE"],
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["GetTypeRequired"] },
          {
            name: "GET_TYPE",
            params: ["PleaseEnterGetType"],
          },
        ],
      },

      GridProps: { xs: 12, md: 2, sm: 2, xl: 2, lg: 2 },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "METADATA_SUGG",
      dependentFields: ["RETRIEVAL_TYPE"],
      label: "MetadataSuggestion",
      GridProps: { xs: 12, md: 1.5, sm: 1.5, xl: 1.5, lg: 1.5 },
    },

    {
      render: {
        componentType: "select",
      },
      name: "CACHING",
      label: "Caching",
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      defaultValue: "N",
      _optionsKey: "CACHING",
      GridProps: { xs: 12, md: 1.5, sm: 1.5, xl: 1.5, lg: 1.5 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "CACHING_INTERVAL",
      sequence: 6,
      label: "CachingInterval",
      // isReadOnly: true,
      placeholder: "PleaseEnterCachingInterval",
      dependentFields: ["CACHING"],
      shouldExclude(fieldData, dependent, formState) {
        if (dependent?.CACHING?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          let regex = /^[0-9]+$/;
          if (values?.value?.length > 3) {
            return false;
          } else if (values.value === "") {
            return true;
          } else if (!regex.test(values.value)) {
            return false;
          } else if (values.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CachingIntervalFieldRequired"] }],
      },
      GridProps: { xs: 12, md: 1.5, sm: 1.5, xl: 1.5, lg: 1.5 },
    },
  ],
};
