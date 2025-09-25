export const limitconfirmFormMetaData = {
  form: {
    name: "limit-confirmation-form",
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
        componentType: "checkbox",
      },
      name: "SHORT_LMT_FLAG",
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
      name: "SECURITY_CD",
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
      name: "AD_HOC_LIMIT_FLG",
      label: "LimitType",
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
        componentType: "textField",
      },
      name: "FD_BRANCH_CD",
      label: "FDBranchCode",
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
        componentType: "textField",
      },
      name: "FD_TYPE",
      label: "FDType",
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
        componentType: "textField",
      },
      name: "FD_ACCT_CD",
      label: "FDAccountNumber",
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
        componentType: "textField",
      },
      name: "FD_NO",
      label: "FDNumber",
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
      name: "ENTRY_DT",
      label: "EntryDate",
      fullWidth: true,
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
      placeholder: "DD/MM/YYYY",
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
      name: "EXPIRY_DT",
      label: "ForceExpDt",
      fullWidth: true,
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
      name: "RESOLUTION_DATE",
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
      name: "SEC_AMOUNT",
      label: "SecurityAmount",
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
      name: "DESCRIPTION",
      label: "Description",
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
      label: "ActualExpiredDate",
      placeholder: "DD/MM/YYYY",
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
        componentType: "textField",
      },
      name: "RESOLUTION_NO",
      label: "ResolutionNumber",
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
