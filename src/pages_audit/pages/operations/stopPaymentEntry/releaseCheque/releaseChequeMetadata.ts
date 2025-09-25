import * as API from "../api";

export const releaseChequeMetadata = {
  form: {
    name: "release-Cheque-Metadata",
    label: "ReleaseChequeDetail",
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
      fullWidth: true,
      label: "BranchCode",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 1.5,
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
        sm: 2,
        md: 1.5,
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
        sm: 3.5,
        md: 2.5,
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
        sm: 4.5,
        md: 4.5,
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
      name: "FLAG",
      label: "ChequeStopType",
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
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "IntimateDate",
      isReadOnly: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (fieldData?.value) {
          return false;
        } else {
          return true;
        }
      },
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
      name: "SURR_DT",
      label: "SurrenderDate",
      isReadOnly: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (fieldData?.value) {
          return false;
        } else {
          return true;
        }
      },
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
        componentType: "numberFormat",
      },
      name: "CHEQUE_FROM",
      label: "FromChequeNo",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
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
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX",
      label: "ChargeAmount",
      isReadOnly: true,
      // shouldExclude(fieldData, dependentFields, formState) {
      //   if (fieldData?.value) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // },
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "GST",
      isReadOnly: true,
      // shouldExclude(fieldData, dependentFields, formState) {
      //   if (fieldData?.value) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // },
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "REASON_CD",
      label: "Reason",
      disableCaching: true,
      dependentFields: ["FLAG", "BRANCH_CD", "ALLOW_RELEASE"],

      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.ALLOW_RELEASE?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
      options: (dependentValue, formState, any, authState) => {
        if (
          dependentValue?.BRANCH_CD?.value &&
          dependentValue?.FLAG?.value &&
          dependentValue?.ALLOW_RELEASE?.value === "Y"
        ) {
          return API.reasonDropdown({
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            RETURN_TYPE:
              dependentValue?.FLAG?.value === "Stop Payment"
                ? "STOP"
                : dependentValue?.FLAG?.value === "Surrender Cheque"
                ? "SURR"
                : dependentValue?.FLAG?.value === "PDC"
                ? "PDC"
                : null,
          });
        }
        return [];
      },
      _optionsKey: "reasonDropdown",
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
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
      name: "CHEQUE_AMOUNT",
      label: "ChequeAmount",
      isReadOnly: true,
      // shouldExclude(fieldData, dependentFields, formState) {
      //   if (fieldData?.value) {
      //     return false;
      //   } else {
      //     return true;
      //   }
      // },
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
      name: "INFAVOUR_OF",
      label: "Infavour",
      dependentFields: ["ALLOW_RELEASE"],
      isReadOnly(fieldData, dependentFields, formState) {
        if (dependentFields?.ALLOW_RELEASE?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
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
        componentType: "Remark",
      },
      name: "REMARKS",
      label: "Remarks",
      dependentFields: ["ALLOW_RELEASE"],
      isReadOnly(fieldData, dependentFields, formState) {
        if (dependentFields?.ALLOW_RELEASE?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
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
      name: "RELEASE_DATE",
      label: "ReleaseDate",
      isMaxWorkingDate: true,
      isWorkingDate: true,
      dependentFields: ["ALLOW_RELEASE"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.ALLOW_RELEASE?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
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
        componentType: "hidden",
      },
      name: "ALLOW_RELEASE",
    },
  ],
};
