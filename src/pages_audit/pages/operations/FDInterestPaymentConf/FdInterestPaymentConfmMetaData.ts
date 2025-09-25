import { GridMetaDataType } from "@acuteinfo/common-base";

export const FdInterestPaymentConfmGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "SR_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    allowRowSelection: false,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    defaultPageSize: 15,
    pageSizes: [15, 30, 50],
    containerHeight: {
      min: "55vh",
      max: "55vh",
    },
    isCusrsorFocused: true,
  },
  filters: [],
  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 80,
      minWidth: 100,
      maxWidth: 200,
      isAutoSequence: true,
    },
    {
      accessor: "COMP_CD",
      columnName: "CompanyCode",
      sequence: 2,
      alignment: "right",
      componentType: "default",
      width: 120,
      minWidth: 700,
      maxWidth: 170,
    },
    {
      accessor: "BRANCH_CD",
      columnName: "branchCode",
      sequence: 3,
      alignment: "right",
      componentType: "default",
      width: 120,
      minWidth: 700,
      maxWidth: 170,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "accountType",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 700,
      maxWidth: 170,
    },
    {
      accessor: "ACCT_CD",
      columnName: "accountCode",
      sequence: 5,
      alignment: "right",
      componentType: "default",
      width: 120,
      minWidth: 700,
      maxWidth: 170,
    },
    {
      accessor: "ACCT_NM",
      columnName: "accountName",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 400,
      minWidth: 300,
      maxWidth: 600,
      showTooltip: true,
    },
    {
      accessor: "LAST_ENTERED_BY",
      columnName: "EnteredBy",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 400,
      minWidth: 300,
      maxWidth: 600,
    },
  ],
};

export const FdInterestPaymentconfFormMetaData = {
  form: {
    name: "FdInterestPaymentconfForm",
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
      numberFormat: {
        fullWidth: true,
      },
      checkbox: {
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
      label: "branchCode",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNo",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 5, lg: 5, xl: 5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_DEPOSIT_AMOUNT",
      label: "DepositAmount",
      isReadOnly: true,
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.fdDetails?.length <= 0) {
          return true;
        } else {
          return false;
        }
      },

      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_MATURITY_AMOUNT",
      label: "MaturityAmount",
      isReadOnly: true,
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.fdDetails?.length <= 0) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "",
      name: "FD_CONFM_ROW_COUNT",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.fdDetails?.length <= 0) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "arrayField",
      },
      name: "FDINTPAYDTL",
      isScreenStyle: true,
      fixedRows: true,
      displayCountName: "",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.fdDetails?.length <= 0) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "numberFormat",
          },
          name: "FD_NO",
          label: "FDNum",
          type: "text",
          textFieldStyle: {
            "& .MuiInputBase-input": {
              textAlign: "right",
            },
          },
          fullWidth: true,

          GridProps: { xs: 12, sm: 4, md: 1.5, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "datePicker",
          },
          name: "TRAN_DT",
          label: "DepositDate",
          type: "text",

          format: "dd/MM/yyyy",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 2, lg: 1.6, xl: 1.6 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "TOT_AMT",
          label: "DepositAmount",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "MATURITY_DT",
          label: "MaturityDate",
          format: "dd/MM/yyyy",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 2, lg: 1.6, xl: 1.6 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "MATURITY_AMT",
          label: "MaturityAmount",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 1.5, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "MATURE_INST_DIS",
          label: "MatureInstruction",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 2, lg: 2.8, xl: 2.8 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "PAYMENT_MODE",
          label: "PaymentMode",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PAYMENT_MODE_DIS",
          label: "PaymentMode",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "divider",
          },
          label: "CreditBankAccount",
          name: "BankAccount",
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "NEFT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CR_BRANCH_CD",
          label: "branchCode",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "NEFT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CR_ACCT_TYPE",
          label: "AccountType",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "NEFT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CR_ACCT_CD",
          label: "AccountNo",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "NEFT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CR_ACCT_NM",
          label: "AccountName",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "NEFT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 5, lg: 5, xl: 5 },
        },
        {
          render: {
            componentType: "divider",
          },
          label: "NEFTDetails",
          name: "NEFT",
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          label: "OrderingAcName",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "ADD1",
          label: "OrderingAcAddress",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CONTACT_INFO",
          label: "OrderingAcContact",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_IFSCCODE",
          label: "IFSCCode",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_TYPE_DIS",
          label: "BeneficiaryAccountType",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_CONTACT_NO",
          label: "BeneficiaryContact",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_NO",
          label: "BeneficiaryAccountNumber",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_NM",
          label: "BeneficiaryAccountName",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ADD1",
          label: "BeneficiaryAddress",
          type: "text",
          fullWidth: true,
          dependentFields: ["PAYMENT_MODE"],
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (
              dependentFieldsValues?.["FDINTPAYDTL.PAYMENT_MODE"]?.value ===
              "BANKACCT"
            ) {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
        },
      ],
    },
  ],
};
