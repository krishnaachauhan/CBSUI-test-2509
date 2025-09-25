import * as API from "../api";
export const prioritymastersubformmetadata = {
  form: {
    name: "Priority Master - Sub",
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
      name: "SUB_PRIORITY_CD",
      label: "Code",
      placeholder: "Code",
      type: "text",
      maxLength: 4,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      preventSpecialCharInput: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "SUB_PARENT_PRIO",
      label: "ParentWeaker",
      placeholder: "ParentWeaker",
      enableDefaultOption: false,
      options: () => API.getPMISCData("WEAKER_PARENT"),
      _optionsKey: "getPMISCData",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
      __VIEW__: { isReadOnly: true },
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
    },
    {
      render: { componentType: "textField" },
      name: "DESCRIPTION",
      label: "Description",
      type: "text",
      required: true,
      placeholder: "Description",
      maxLength: 50,
      multiline: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DescriptionisRequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },

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
    },
  ],
};
