import { isValid } from "date-fns";

export const insuranceConfirmFormMetaData = {
  form: {
    name: "insurance-confirmation-form",
    label: "InsuranceConfirmationDetail",
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
      name: "AC_DTL_DISP",
      label: "AccountDetails",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 8.8, md: 8.8, lg: 8.8, xl: 8.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "POLICY_NO",
      label: "PolicyNo",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.1, md: 3.1, lg: 3.1, xl: 3.1 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INSURANCE_DATE",
      label: "InsuranceDate",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DUE_DATE",
      label: "DueDate",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INSURANCE_AMOUNT",
      label: "InsuranceAmount",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4.8, md: 4.8, lg: 4.8, xl: 4.8 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOT_PREMIUM",
      label: "TotalPremium",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SEC",
      label: "TypeOfSec",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 7.9, md: 7.9, lg: 7.9, xl: 7.9 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Company",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6.3, md: 6.3, lg: 6.3, xl: 6.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATUS_DISP",
      label: "Status",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.1, md: 3.1, lg: 3.1, xl: 3.1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ENTERED_BY",
      label: "User",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
  ],
};
