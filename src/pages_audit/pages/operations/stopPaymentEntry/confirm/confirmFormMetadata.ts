export const stopPayconfirmFormMetaData = {
  form: {
    name: "stopPay-confirmation-form",
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
        sm: 2,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
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
        sm: 2,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
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
        sm: 3.5,
        md: 2.5,
        lg: 3,
        xl: 3,
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
        sm: 4.5,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Balance",
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2.5,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_FROM",
      label: "FromChequeNo",
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_TO",
      label: "ToChequeNo",
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FLAG",
      label: "ChequeStopType",
      defaultValue: "P",
      placeholder: "Select one",
      options: () => {
        return [
          { value: "P", label: "Stop Payment" },
          { value: "S", label: "Surrender Cheque" },
          { value: "D", label: "PDC" },
        ];
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2.5,
        xl: 2.5,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "IntimateDate",
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "S") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        sm: 3.5,
        xs: 12,
        md: 3,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "SURR_DT",
      label: "SurrenderDate",
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "S") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        sm: 3.5,
        xs: 12,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX",
      label: "ChargeAmount",
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "GST",
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2.5,
        xl: 2.5,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "CHEQUE_AMOUNT",
      label: "ChequeAmount",
      placeholder: "ChequeAmount",
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "S") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2.5,
        xl: 2.5,
      },
    },
  ],
};
