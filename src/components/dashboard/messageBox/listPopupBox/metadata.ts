export const MessageDescriptionMetadata = {
  form: {
    name: "MessageDescriptionMetadata",
    label: "MessageBox Description",
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
      name: "C_TYPE",
      label: "CircularType",
      placeholder: "",
      defaultValue: "",
      isReadOnly: true,
      fullWidth: true,
      autoComplete: false,
      schemaValidation: {
        type: "string",
      },
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "IDENTITY_NO",
      label: "Number",
      placeholder: "",
      // isReadOnly: true,
      fullWidth: true,
      type: "text",
      schemaValidation: {
        type: "string",
      },
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "EFFECTIVE_DT",
      label: "OpenDate",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",

      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "ENTERED_DATE",
      label: "ExpiryDate",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",

      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
      },
    },
    // {
    //   render: {
    //     componentType: "accountType",
    //   },
    //   name: "ACCT_TYPE",
    //   placeholder: "",
    //   // isReadOnly: true,
    //   fullWidth: true,
    //   type: "text",

    //   GridProps: {
    //     xs: 12,
    //     md: 3,
    //     sm: 3,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "customerID",
    //   },
    //   name: "CUSTOMER_ID",
    //   placeholder: "",
    //   // isReadOnly: true,
    //   fullWidth: true,
    //   type: "text",

    //   GridProps: {
    //     xs: 12,
    //     md: 3,
    //     sm: 3,
    //   },
    // },
    {
      render: {
        componentType: "checkbox",
      },
      name: "IS_VIEW_NEXT",
      label: "",
      // defaultValue: true,
      // __EDIT__: { render: { componentType: "checkbox" } },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
  ],
};
