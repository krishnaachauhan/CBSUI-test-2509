import * as API from "../api";

export const lienExpireMetadata = {
  form: {
    name: "lien-expireMetadata",
    label: "LienExpire",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 3,
          md: 3,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      datePicker: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      numberFormat: {
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
      label: "BranchCode",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2.5,
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
      label: "AccountType",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNumber",
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
      name: "ACCT_NM",
      label: "AccountName",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 3.5,
        lg: 3.5,
        xl: 3.5,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "LIEN_CD",
      label: "LienCode",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    // {
    //   render: {
    //     componentType: "amountField",
    //   },
    //   name: "LIEN_AMOUNT",
    //   label: "LienAmount",
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 2.4,
    //     sm: 2.4,
    //     lg: 2.4,
    //     xl: 2.4,
    //   },
    // },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LIEN_STATUS",
      label: "LienStatus",
      defaultValue: "E",
      isReadOnly: true,
      options: () => {
        return [
          { value: "A", label: "Active" },
          { value: "E", label: "Expired" },
        ];
      },
      _optionsKey: "LIEN_STATUS",
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LIEN_PARENT",
      label: "ParentCodeName",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 7,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "EFECTIVE_DT",
      isReadOnly: true,
      label: "EffectiveDate",
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REMOVAL_DT",
      label: "RemovalDate",
      isWorkingDate: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LIEN_REASON_CD",
      label: "Reason",

      placeholder: "Select Reason",
      disableCaching: true,
      dependentFields: ["BRANCH_CD"],
      options: (dependentValue, formState, any, authState) => {
        if (dependentValue?.BRANCH_CD?.value) {
          return API.reasonDropdown({
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
          });
        }
        return [];
      },
      _optionsKey: "LIEN_REASON_CD",
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3.6,
        lg: 3.6,
        xl: 3.6,
      },
    },

    {
      render: {
        componentType: "Remark",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "Enter Remarks",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3.6,
        lg: 3.6,
        xl: 3.6,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SR_CD",
    },
  ],
};
