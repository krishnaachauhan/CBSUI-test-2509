import { getProMiscData } from "../../dynamicGridConfig/api";
import { getDynApiListData } from "../api";

export const DynamicDropdownConfigMetaData = {
  form: {
    name: "DynamicDropdownConfigure",
    label: "Dynamic Dropdown Configure",
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
          md: 6,
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
        componentType: "textField",
      },
      name: "DDLB_NAME",
      label: "Dropdown Name",
      placeholder: "Dropdown Name",
      maxLength: 40,
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Dropdown Name is required."] }],
      },
      GridProps: { xs: 6, sm: 2, md: 2, lg: 4, xl: 1.5 },
    },
    {
      render: { componentType: "select" },
      name: "SOURCE_TYPE",
      label: "Dropdown Source",
      options: [
        { label: "Dynamic SQL", value: "DS" },
        { label: "Register Function", value: "RF" },
        { label: "Default Option", value: "DO" },
      ],
      _optionsKey: "defualt",
      defaultValue: "DS",
      required: true,
      type: "text",
      GridProps: { xs: 12, sm: 2, md: 3, lg: 2.5, xl: 1.5 },
      fullWidth: true,
      autoComplete: "off",
      //@ts-ignore
      isFieldFocused: true,
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["Dropdown Source is required."] },
          { name: "SOURCE_TYPE", params: ["Please enter Dropdown Source."] },
        ],
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "SOURCE_NAME",
      label: "API List",
      type: "text",
      fullWidth: true,
      required: true,
      options: (value) => {
        if (value?.SOURCE_TYPE?.value === "DS") {
          return getDynApiListData();
        } else if (value?.SOURCE_TYPE?.value === "RF") {
          return getProMiscData("REGISTER_JS_FUNC");
        }
      },
      _optionsKey: "getProMiscData",
      dependentFields: ["SOURCE_TYPE"],
      disableCaching: true,
      GridProps: { xs: 12, sm: 2, md: 3, lg: 2.5, xl: 1.5 },
      runValidationOnDependentFieldsChange: true,
      shouldExclude: (val1, dependent) => {
        if (dependent["SOURCE_TYPE"]?.value === "DO") {
          return true;
        }
        return false;
      },
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["API List is required."] }],
      },
    },
    {
      render: {
        componentType: "arrayField",
      },
      name: "DDW_OPTION",
      removeRowFn: "deleteFormArrayFieldData",
      arrayFieldIDName: "DDW_OPTION",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      dependentFields: ["SOURCE_TYPE"],
      shouldExclude: (fieldData, dependentFieldsValues, formState) => {
        // console.log("dependentFieldsValues", dependentFieldsValues);
        if (dependentFieldsValues?.SOURCE_TYPE?.value === "DO") {
          return false;
        }
        return true;
      },
      _fields: [
        {
          render: {
            componentType: "textField",
          },
          name: "label",
          label: "Display Value",
          placeholder: "Display Value",
          GridProps: { xs: 12, sm: 3, md: 4, lg: 6, xl: 2.5 },
          maxLength: 40,
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: ["Display Value is required."] },
            ],
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "value",
          label: "Data Value",
          placeholder: "Data Value",
          maxLength: 40,
          GridProps: { xs: 12, sm: 3, md: 4, lg: 6, xl: 2.5 },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Data Value is required."] }],
          },
        },
      ],
    },
  ],
};
