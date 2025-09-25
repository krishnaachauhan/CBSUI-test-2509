export const TipsListMetadata = {
  form: {
    name: "TipsListMetadata",
    label: "Tips Description",
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
        componentType: "checkbox",
      },
      name: "IS_VIEW_NEXT",
      label: "",
      defaultValue: true,
      // __EDIT__: { render: { componentType: "checkbox" } },
      GridProps: { xs: 10, md: 10, sm: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Description",
      placeholder: "",
      defaultValue: "",
      isReadOnly: true,
      fullWidth: true,
      autoComplete: false,
      multiline: true,
      minRows: 3,
      maxRows: 3,
      schemaValidation: {
        type: "string",
      },
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
  ],
};
