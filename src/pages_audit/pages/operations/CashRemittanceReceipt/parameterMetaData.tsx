import { getCodeOptionData } from "./api";

export const codeMetaData: any = {
  form: {
    refID: 1667,
    name: "ActionsMetaData",
    label: "Enter Parameters",
    resetFieldOnUmnount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",

      gridConfig: {
        item: {
          xs: 1,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "BRANCH_CODE_SPACER",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DAILY_TRN_CD",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRAN_CD",
      label: "Code",
      options: async (dependentValue, formState, _, authState) =>
        await getCodeOptionData({
          ADT_TRAN_DT: authState?.workingDate ?? "",
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
        }),
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Code is required."] }],
      },
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
      // validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.optionData?.[0]) {
          return {
            DAILY_TRN_CD: {
              value: currentField?.optionData?.[0]?.DAILY_TRN_CD,
            },
          };
        }
        return {};
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_2",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
  ],
};

export const CashRemiRecMetaData: any = {
  form: {
    refID: 1668,
    name: "ActionsMetaData1",
    label: "",
    resetFieldOnUmnount: false,
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
          lg: 4,
          xl: 4,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "TRAN_CD",
      label: "Code",
      GridProps: {
        xs: 12,
        sm: 2.4,
        md: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FROM_BRANCH_CD",
      label: "BranchCode",
      GridProps: {
        xs: 12,
        sm: 2.4,
        md: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FROM_ACCT_TYPE",
      label: "AccountType",
      GridProps: {
        xs: 12,
        sm: 2.4,
        md: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FROM_ACCT_CD",
      label: "AccountCode",
      GridProps: {
        xs: 12,
        sm: 2.4,
        md: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account Name",
      dependentFields: ["MODE"],
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2.4,
        md: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "Amount",
      fullWidth: true,
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
      name: "REMARKS",
      label: "Remarks",
      placeholder: "",
      defaultValue: "",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
      },
    },
  ],
};
