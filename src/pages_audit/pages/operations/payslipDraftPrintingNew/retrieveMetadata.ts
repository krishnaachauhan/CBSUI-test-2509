import * as API from "./api";
export const retrievePayslip = {
  form: {
    name: "Payslip-Retrieve-Information",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
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
        componentType: "datePicker",
      },
      name: "FROM",
      label: "From",
      isWorkingDate: true,
      fullWidth: true,
      format: "dd/MM/yyyy",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (formState?.para?.[0]?.DISABLE_DATE === "Y") {
          return true;
        }
      },
      GridProps: {
        xs: 3,
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
      name: "TO",
      label: "To",
      isWorkingDate: true,
      fullWidth: true,
      format: "dd/MM/yyyy",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (formState?.para?.[0]?.DISABLE_DATE === "Y") {
          return true;
        }
      },
      GridProps: {
        xs: 3,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TYPE",
      label: "Type",
      fullWidth: true,
      options: (dependentValue, formState, _, authState) =>
        API.getPaySlipTypeDdw({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          CODE: "DD",
        }),
      defaultValue: "532",
      _optionsKey: "playslipType",
      GridProps: {
        xs: 6,
        md: 6,
        sm: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "Spacer1",
      GridProps: {
        xs: 5,
        md: 5,
        sm: 5,
        lg: 5,
        xl: 5,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "Retrieve_data",
      label: "Retrieve",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 2,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
  ],
};
