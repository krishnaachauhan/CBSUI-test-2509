export const stockconfirmFormMetaData = {
  form: {
    name: "stock-confirmation-form",
    label: "stockDetail",
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
      isReadOnly: true,
      label: "BranchCode",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      isReadOnly: true,
      label: "AccountType",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      label: "accountCode",
      name: "ACCT_CD",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      label: "AccountName",
      name: "ACCT_NM",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 5,
        md: 3.5,
        lg: 3.5,
        xl: 3.5,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Balance",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      fullWidth: true,
      name: "SECURITY_CD_DISP",
      label: "Security",
      isReadOnly: true,
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
        componentType: "textField",
      },
      fullWidth: true,
      name: "SCRIPT_CD_DISP",
      label: "Script",
      isReadOnly: true,
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
        componentType: "hidden",
      },
      name: "SECURITY_CD",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "LimitAmount",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      fullWidth: true,
      name: "TRAN_DT",
      isReadOnly: true,
      label: "StatementDate",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "ASON_DT",
      fullWidth: true,
      isReadOnly: true,
      label: "StatementValidTillDate",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "WITHDRAW_DT",
      label: "ExpireDate",
      isWorkingDate: true,
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "STOCK_VALUE",
      fullWidth: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      label: "StockValue",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CREDITOR",
      fullWidth: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      label: "Creditor",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "NET_VALUE",
      fullWidth: true,
      label: "Net value",
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "MARGIN",
      fullWidth: true,
      label: "Margin",

      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "STOCK_DESC",
      label: "StockDescription",

      isReadOnly: true,
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
      fullWidth: true,
      name: "DRAWING_POWER",
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      label: "DrawingPower",

      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      fullWidth: true,
      label: "Remarks",
      isReadOnly: true,
      type: "text",
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
        componentType: "datePicker",
      },
      name: "RECEIVED_DT",
      label: "RecievedDate",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
  ],
};
