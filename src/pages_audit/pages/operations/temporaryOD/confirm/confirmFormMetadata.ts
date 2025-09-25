export const tempODConfirmFormMetaData = {
  form: {
    name: "temporaryOD-confirmation-form",
    label: "ConfirmationDetail",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    render: {
      ordering: "auto",
      // ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
          height: "35vh",
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
      name: "BRANCH_CD",
      fullWidth: true,
      label: "BranchCode",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      fullWidth: true,
      label: "AccountType",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      label: "AccountNumber",
      name: "ACCT_CD",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      label: "AccountName",
      name: "ACCT_NM",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 5,
        sm: 5,
        lg: 5,
        xl: 5,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CODE_DESC",
      label: "Parameters",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_EFF_DATE",
      fullWidth: true,
      label: "EffectiveFromDate",
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_EFF_DATE",
      fullWidth: true,
      label: "EffectiveToDate",
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FORCE_EXP_DT",
      fullWidth: true,
      label: "ForceExpDate",
      placeholder: "DD/MM/YYYY",
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT_UPTO",
      label: "AmountUpTo",
      required: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "FLAG",
      label: "Flag",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        style: { paddingTop: "40px" },
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
  ],
};
