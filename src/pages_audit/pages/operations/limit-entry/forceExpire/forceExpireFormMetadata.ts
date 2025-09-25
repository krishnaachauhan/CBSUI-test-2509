export const forceExpireMetaData = {
  form: {
    name: "limit-force-expired",
    label: " ",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    formStyle: {
      background: "white",
      height: "calc(100vh - 390px)",
      overflowY: "auto",
      overflowX: "hidden",
    },
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
        componentType: "checkbox",
      },
      name: "SHORT_LMT_FLAG",
      isReadOnly: true,
      label: "ShortLimit",
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      isReadOnly: true,
      fullWidth: true,
      label: "TranBalance",
      placeholder: "TranBalance",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SANCTIONED_AMT",
      isReadOnly: true,
      fullWidth: true,
      label: "SanctionedLimit",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SECURITY_CD_DISP",
      isReadOnly: true,
      fullWidth: true,
      label: "Security",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 4.8,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "FD_BRANCH_CD",
      fullWidth: true,
      label: "FDBranchCode",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "FD_TYPE",
      label: "FDType",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FD_ACCT_CD",
      label: "FDAccountNumber",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FD_NO",
      label: "FDNumber",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "ENTRY_DT",
      label: "EntryDate",
      fullWidth: true,
      isReadOnly: true,
      placeholder: "DD/MM/YYYY",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "EffectiveDate",
      fullWidth: true,
      isReadOnly: true,
      placeholder: "DD/MM/YYYY",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "EXPIRY_DT",
      label: "ExpiryDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "RESOLUTION_DATE",
      isReadOnly: true,
      fullWidth: true,
      label: "ResolutionDate",
      placeholder: "DD/MM/YYYY",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SECURITY_VALUE",
      label: "SecurityValue",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "MARGIN",
      label: "Margin",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SEC_AMOUNT",
      label: "SecurityAmount",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "PENAL_RATE",
      isReadOnly: true,
      fullWidth: true,
      label: "OverDrawn",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INT_AMT",
      label: "InterestAmount",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_MARGIN",
      label: "IntrestMargin",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INT_SEC_AMOUNT",
      label: "SecurityInterstAmount",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "LimitAmount",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      isReadOnly: true,
      fullWidth: true,
      label: "IntRate",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "REMARK",
      isReadOnly: true,
      fullWidth: true,
      label: "Remarks",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 4.8,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SECURITY",
      label: "Description",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 4.8,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DOCKET_NO",
      label: "DocketNumber",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CHARGE_AMT",
      label: "Charge",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX",
      label: "GST",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "FORCE_EXP_DT",
      isWorkingDate: true,
      label: "ForcedExpiredDate",
      placeholder: "ForcedExpiredDate",
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
      name: "RESOLUTION_NO",
      label: "ResolutionNumber",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.4,
        lg: 2,
        xl: 2,
      },
    },
  ],
};
