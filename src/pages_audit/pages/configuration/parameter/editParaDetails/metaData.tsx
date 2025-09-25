export const ParaDetailMetadata = {
  form: {
    name: "paraDetail",
    label: "Parameter Master",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          xl: 6,
          md: 6,
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
        componentType: "hidden",
      },
      name: "COMP_CD",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PARA_CD",
      label: "Code",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        xl: 4,
        md: 4,
        sm: 4,
        lg: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PARA_NM",
      label: "Description",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        xl: 8,
        md: 8,
        sm: 8,
        lg: 8,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        xl: 8,
        md: 8,
        sm: 8,
        lg: 8,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: {
        xs: 12,
        xl: 4,
        md: 4,
        sm: 4,
        lg: 4,
      },
    },
    {
      render: {
        componentType: "select",
      },
      name: "DATATYPE_CD",
      label: "Data Type",
      required: true,
      options: [
        { label: "NUM/DECIMAL", value: "N" },
        { label: "CHARACTER/STRING", value: "C" },
        { label: "DATE", value: "D" },
      ],
      placeholder: "",
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["Data Type is required."] },
          { name: "DATATYPE_CD", params: ["Please select Data Type."] },
        ],
      },
      GridProps: {
        xs: 12,
        xl: 4,
        md: 4,
        sm: 4,
        lg: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PARA_VALUE",
      label: "Value",
      placeholder: "",
      type: "text",
      required: true,
      maxLength: 100,
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["Value is required."] },
          { name: "PARA_VALUE", params: ["Please enter Value."] },
        ],
      },
      dependentFields: ["DATATYPE_CD"],
      validate: (columnValue, ...rest) => {
        if (rest?.[0]?.DATATYPE_CD?.value === "C") {
          const noSpaceAtBeginningRegex = /^(?!\s)[\S]+$/;

          if (!noSpaceAtBeginningRegex.test(columnValue.value)) {
            return "Please Enter only Characters/Strings without space at the beginning";
          }
        } else if (rest?.[0]?.DATATYPE_CD?.value === "N") {
          const decimalNumberRegex = /^(\d+(\.\d*)?|\.\d+)$/;

          if (!decimalNumberRegex.test(columnValue.value)) {
            return "Please Enter only Numbers/Decimals";
          }
        }
      },
      GridProps: {
        xs: 12,
        xl: 8,
        md: 8,
        sm: 8,
        lg: 8,
      },
    },
  ],
};
