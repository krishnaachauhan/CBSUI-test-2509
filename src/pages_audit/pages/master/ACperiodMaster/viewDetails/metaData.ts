export const metaData = {
  form: {
    name: "AC Period Master",
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
      name: "PERIOD_CD",
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
    {
      render: {
        componentType: "textField",
      },
      name: "PERIOD_NM",
      label: "PeriodName",
      placeholder: "PeriodName",
      maxLength: 100,
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PeriodNameisRequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      className: "textInputFromLeft",
      name: "INST_NO",
      maxLength: 5,
      label: "InstNo",
      placeholder: "InstNo",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
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
      required: true,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InstNoisRequired"] }],
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
    },
    {
      render: { componentType: "autocomplete" },
      name: "INSTALLMENT_TYPE",
      label: "InstallmentPeriod",
      placeholder: "InstallmentPeriod",
      options: [
        { label: "Daily ", value: "D" },
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
        { label: "On Expiry", value: "E" },
      ],
      _optionsKey: "Installment_period",
      defaultValue: "M",
      required: true,
      type: "text",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
      fullWidth: true,
      autoComplete: "on",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectInstallmentPeriod"] }],
      },
      //@ts-ignore
      isFieldFocused: false,
    },
  ],
};
