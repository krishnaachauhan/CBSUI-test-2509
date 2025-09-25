export const PhotoSignatureMetaData = {
  form: {
    name: "photo_signature_MetaData",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
      _accountNumber: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "CUSTOMER_ID",
      fullWidth: true,
      isReadOnly: true,
      label: "CustomerID",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUST_NM",
      fullWidth: true,
      isReadOnly: true,
      label: "CustomerName",
      GridProps: {
        xs: 12,
        md: 5,
        sm: 5,
        lg: 5,
        xl: 5,
      },
    },
  ],
};
