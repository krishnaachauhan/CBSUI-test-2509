export const nscDetailFormMetaData = {
  form: {
    name: "nscDeatil",
    label: "NSCDetail",
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
      name: "SECURITY_CD",
      label: "SecurityCode",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CERTI_NO",
      label: "CertificateNumber",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "COLLATERAL_NAME",
      label: "AccountName",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 3.2,
        sm: 3.2,
        lg: 3.2,
        xl: 3.2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DISPLAY_PERIOD_CD",
      label: "PeriodType",
      isReadOnly: true,
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
      name: "PERIOD_NO",
      label: "PeriodNumber",
      isReadOnly: true,
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
        componentType: "datePicker",
      },
      name: "ISSUE_DATE",
      label: "IssueDate",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COLLATERAL_AMT",
      label: "CollateralAmount",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "rateOfInt",
      },
      name: "COLLATERAL_RATE",
      label: "CollateralRate",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MATURED_AMT",
      label: "MaturedAmount",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "EXP_DATE",
      label: "ExpiryDate",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ISSUE_COMPANY",
      label: "IssuedBy",
      isReadOnly: true,
      sequence: 0,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "REGISTRATION_NO",
      label: "RegistrationNumber",
      isReadOnly: true,
      sequence: 0,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "LIEN_YES_NO",
      label: "LienYesNo",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },

    {
      render: {
        componentType: "Remark",
      },
      name: "REMARK",
      label: "Remarks",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 4.8,
        sm: 4.8,
        lg: 4.8,
        xl: 4.8,
      },
    },
  ],
};
