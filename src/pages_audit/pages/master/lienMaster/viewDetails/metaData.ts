export const metaData = {
  form: {
    name: "Lien Master",
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
      name: "LEAN_CD",
      label: "Code",
      placeholder: "Code",
      maxLength: 4,
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
      __EDIT__: { isReadOnly: true },
    },
    {
      render: { componentType: "select" },
      name: "PARENT_TYPE",
      placeholder: "ParentType",
      label: "ParentType",
      options: [
        { label: "NORMAL ", value: "00  " },
        { label: "NO TRANSACTION", value: "99  " },
        { label: "NO DEBIT ", value: "44  " },
        { label: "NO CREDIT", value: "11  " },
        { label: "AMT RESTRICT", value: "05  " },
        { label: "AMT ALERT", value: "06  " },
        { label: "NO CASH RECEIPT", value: "66  " },
        { label: "NO CASH PAYMENT", value: "77  " },
      ],
      _optionsKey: "Parent type",
      defaultValue: "00  ",
      required: true,
      type: "text",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
      fullWidth: true,
      autoComplete: "on",
      isFieldFocused: false,
      __EDIT__: { isReadOnly: true },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LEAN_NM",
      label: "Description",
      placeholder: "Description",
      maxLength: 50,
      type: "text",
      required: true,
      txtTransform: "uppercase",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DescriptionisRequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
    },
  ],
};
