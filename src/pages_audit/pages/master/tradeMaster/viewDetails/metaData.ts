import * as API from "../api";
export const TradeMasterMetaData = {
  form: {
    name: "Trade Master",
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
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        },
        container: {
          direction: "row",
          spacing: 0.5,
          width: 200,
          maxwidth: 500,
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
      autocomplete: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "TRADE_CD",
      label: "Code",
      placeholder: "Code",
      type: "text",
      required: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 4,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      __EDIT__: { isReadOnly: true },
    },
    {
      render: { componentType: "textField" },
      name: "TRADE_NM",
      label: "Description",
      type: "text",
      required: true,
      placeholder: "Description",
      maxLength: 100,
      multiline: true,
      isFieldFocused: true,
      txtTransform: "uppercase",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DescriptionisRequired"] }],
      },
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue, ...rest) => {
        const gridData = rest[1]?.gridData;
        const accessor: any = columnValue.fieldKey.split("/").pop();
        const fieldValue = columnValue.value?.trim().toLowerCase();
        const rowColumnValue = rest[1]?.rows?.[accessor]?.trim().toLowerCase();

        if (fieldValue === rowColumnValue) {
          return "";
        }

        if (gridData) {
          for (let i = 0; i < gridData.length; i++) {
            const ele = gridData[i];
            const trimmedColumnValue = ele?.[accessor]?.trim().toLowerCase();

            if (trimmedColumnValue === fieldValue) {
              return `${fieldValue} is already entered at Sr. No: ${i + 1}`;
            }
          }
        }
        return "";
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "CKYC_OCCUPATION",
      label: "CKYCGroup",
      placeholder: "CKYCGroup",
      options: () => API.getPMISCData("CKYC_OCCUPATION"),
      _optionsKey: "getDataForCkycGroup",
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "CONSTITUTION_TYPE",
      label: "Constitution",
      placeholder: "Constitution",
      options: () => API.getPMISCData("BANK_CONS_TYPE"),
      _optionsKey: "getDataForConstitution",
      defaultValue: "B",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
