import { GridMetaDataType } from "@acuteinfo/common-base";

export const InwardClearingRetrievalMetadata = {
  form: {
    name: "InwardClearingForm",
    label: "Parameters",
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
        componentType: "radio",
      },
      name: "FLAG",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: "Y",
      options: [
        {
          label: "OnlyError",
          value: "Y",
        },
        { label: "All", value: "N" },
        { label: "ConfirmationPending", value: "P" },
        { label: "DraftBankerCheques", value: "D" },
        { label: "ShareDividendWarrant", value: "S" },
      ],

      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "RETRIEVE",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: "E",
      options: [
        {
          label: "EnterBranch",
          value: "E",
        },
        { label: "ACBranch", value: "A" },
      ],

      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },
  ],
};

export const InwardCleaingGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "SR_NO",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 30, 50, 80],
    defaultPageSize: 15,
    containerHeight: {
      min: "60vh",
      max: "60vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hideActionBar: true,
  },
  filters: [],

  columns: [
    {
      accessor: "CHEQUE_NO",
      columnName: "ChequeNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 2,
      alignment: "right",
      componentType: "currency",
      width: 150,
      minWidth: 100,
      maxWidth: 350,
      isTotalWithCurrency: true,
    },
    {
      accessor: "BRANCH_CD",
      columnName: "BranchCode",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },

    {
      accessor: "ACCT_TYPE",
      columnName: "AccountType",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "ACCT_CD",
      columnName: "AccountNo",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "ACCT_NM",
      columnName: "AccountName",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 250,
      maxWidth: 350,
      showTooltip: true,
    },

    {
      columnName: "",
      componentType: "buttonRowCell",
      accessor: "WITH_SIGN",
      sequence: 7,
      isVisible: true,
      width: 100,
      minWidth: 120,
      maxWidth: 140,
      setButtonName: (initialValue) => {
        if (initialValue) {
          return initialValue === "Y" ? "ChequeSign" : "ViewCheque";
        }
      },
    },
    {
      columnName: "",
      componentType: "buttonRowCell",
      accessor: "POST_CONF",
      sequence: 8,
      isVisible: true,
      width: 100,
      minWidth: 50,
      maxWidth: 150,
      setButtonName: (initialValue) => {
        if (initialValue) {
          return initialValue === "C" ? "Confirm" : "Post";
        }
      },
    },
    {
      columnName: "",
      componentType: "buttonRowCell",
      accessor: "VIEW_DETAIL",
      sequence: 9,
      buttonLabel: "ViewDetail",
      isVisible: true,
      width: 130,
      minWidth: 150,
      maxWidth: 200,
    },
    {
      accessor: "CHEQUE_DT",
      columnName: "ChequeDate",
      sequence: 10,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 100,
      minWidth: 80,
      maxWidth: 300,
    },
    {
      accessor: "FROM_BANK_CD",
      columnName: "FromBank",
      sequence: 11,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "MICR_TRAN_CD",
      columnName: "MICR",
      sequence: 12,
      alignment: "left",
      componentType: "default",
      width: 75,
      minWidth: 80,
      maxWidth: 100,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 13,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 350,
      maxWidth: 450,
      showTooltip: true,
    },
    {
      accessor: "WIDTH_BAL",
      columnName: "WithdrawBalance",
      sequence: 14,
      alignment: "right",
      componentType: "currency",
      isTotalWithCurrency: true,
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "OTHER_REMARKS",
      columnName: "ModeOfOperation",
      sequence: 15,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 250,
      showTooltip: true,
    },
  ],
};
