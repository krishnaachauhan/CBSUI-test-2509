import { GridMetaDataType } from "@acuteinfo/common-base";
import { isValid } from "date-fns";

export const RetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
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
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: {
        xs: 0,
        md: 1,
        sm: 3.9,
        lg: 3.9,
        xl: 3.9,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "GeneralFromDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "GeneralToDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateRequired."] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["FROM_DT"],
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "VIEW_ALL",
      label: "ViewAll",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1, xl: 1 },
    },
  ],
};
export const RtgsConfirmGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "RetrieveGrid",
    rowIdColumn: "SR_NO",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 25, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "48vh",
      max: "48vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
  },
  filters: [],
  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },
    {
      accessor: "TRAN_TYPE",
      columnName: "EntryType",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "MSG_FLOW",
      columnName: "MsgFlow",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "TRAN_DT",
      columnName: "TranDate",
      sequence: 4,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },

    {
      accessor: "SLIP_NO",
      columnName: "SlipNo",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "BR_IFSCCODE",
      columnName: "BranchIfscCode",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "COMP_CD",
      columnName: "Bank",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "BRANCH_CD",
      columnName: "Branch",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "Type",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ACCT_CD",
      columnName: "ACNo",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "ACCT_NM",
      columnName: "Name",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 350,
      minWidth: 380,
      maxWidth: 400,
    },
    {
      accessor: "CHEQUE_NO",
      columnName: "Cheque",
      sequence: 12,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 150,
      minWidth: 120,
      maxWidth: 200,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 13,
      alignment: "right",
      componentType: "currency",
      isTotalWithCurrency: true,
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "COMM_AMT",
      columnName: "CommAmount",
      sequence: 14,
      alignment: "right",
      componentType: "currency",
      isTotalWithCurrency: true,
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "SER_CHRG_AMT",
      columnName: "ServiceChargeAmount",
      sequence: 15,
      alignment: "right",
      componentType: "currency",
      isTotalWithCurrency: true,
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },

    {
      accessor: "ENTERED_BY",
      columnName: "User",
      sequence: 16,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "BR_CONFIRMED",
      columnName: "BranchConfirmed",
      sequence: 17,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },

    {
      accessor: "VERIFIED_BY",
      columnName: "VerifiedBy",
      sequence: 18,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "VERIFIED_DATE",
      columnName: "VerifiedDate",
      sequence: 19,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      dateFormat: "dd/MM/yyyy HH:mm:ss",
    },
    {
      accessor: "HO_CONFIRM",
      columnName: "HoConfirmed",
      sequence: 20,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "HO_VERIFIED_BY",
      columnName: "HoVerifiedBy",
      sequence: 21,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "MSG_RELEASE",
      columnName: "MsgRelease",
      sequence: 22,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "DEF_TRAN_CD",
      columnName: "DefTranCd",
      sequence: 23,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
  ],
};

export const DualConfHistoryGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "DualConfirmationHistory",
    rowIdColumn: "TRAN_CD",
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
    pageSizes: [15, 25, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "50vh",
      max: "50vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
  },
  filters: [],
  columns: [
    {
      accessor: "ID",
      columnName: "SrNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 70,
      minWidth: 70,
      maxWidth: 200,
      isAutoSequence: true,
    },
    {
      accessor: "TRN_CONF_CNT",
      columnName: "EntryType",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ENTERED_BY",
      columnName: "User",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "Date",
      sequence: 4,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd-MM-yyyy HH:mm:ss a",
      width: 150,
      minWidth: 180,
      maxWidth: 200,
    },
    {
      accessor: "MACHINE_NM",
      columnName: "Machine",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },
  ],
};

export const RtgsOrderingBranchConfirmFormMetaData = {
  form: {
    name: "rtgsEntry",
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
        componentType: "autocomplete",
      },
      name: "ENTRY_TYPE",
      label: "RTGSNEFT",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "Date",
      placeholder: "",
      isReadOnly: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 6, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRAN_TYPE_DESC",
      label: "TransactionType",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "BR_CONFIRMED",
      label: "",
      type: "text",

      GridProps: { xs: 6, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SLIP_NO",
      label: "SlipNo",
      type: "text",
      GridProps: { xs: 6, sm: 1.1, md: 1.1, lg: 1.1, xl: 1.1 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COMM_TYPE_DESC",
      label: "CommType",
      GridProps: { xs: 12, sm: 2.4, md: 2.4, lg: 2.4, xl: 2.4 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "BR_IFSCCODE",
      label: "IFSC",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
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
      },
      accountTypeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
        isFieldFocused: true,
        defaultfocus: true,
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
      },
      accountCodeMetadata: {
        fullWidth: true,
        textFieldStyle: {
          "& .MuiInputBase-input": {
            background: "var(--theme-color5)",
            color: "var(--theme-color2) !important",
            "&.Mui-disabled": {
              color: "var(--theme-color2) !important",
              "-webkit-text-fill-color": "var(--theme-color2) !important",
            },
          },
        },
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_BNFCRY",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      label: "",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NAME",
      label: "Account_Name",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      align: "right",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "Limit",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_MODE",
      label: "ACMode",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "OrdACName",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
      required: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "ACAddress",
      type: "text",
      fullWidth: true,

      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 3.3 },
    },

    {
      render: {
        componentType: "phoneNumber",
      },
      name: "CONTACT_INFO",
      label: "ContactNo",
      placeholder: "Mobile Number",
      type: "string",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "Cheque No.",
      type: "text",
      autoComplete: "off",
      GridProps: { xs: 6, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      type: "text",
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      type: "text",
      GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "Amount",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COMM_AMT",
      label: "CommAmount",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENABLE_DISABLE",
      label: "",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SER_CHRG_AMT",
      label: "GST",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL",
      label: "TotalAmount",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },

      dependentFields: ["AMOUNT", "SER_CHRG_AMT", "COMM_AMT"],

      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          parseFloat(dependentFields?.SER_CHRG_AMT?.value) +
          parseFloat(dependentFields?.AMOUNT?.value) +
          parseFloat(dependentFields?.COMM_AMT?.value);
        return value ?? "--";
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BY",
      label: "Maker",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_DATE",
      label: "MakerTime",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      __VIEW__: { render: { componentType: "datetimePicker" } },
      __EDIT__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "CONF_STATUS",
      label: "ConfirmStatus",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
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
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },

    // {
    //   render: {
    //     componentType: "typography",
    //   },
    //   name: "A/C Balance",
    //   label: "A/C Balance",
    //   GridProps: { xs: 12, sm: 12, md: 12 },
    //   TypographyProps: {
    //     style: {
    //       // color: "red",
    //       whiteSpace: "pre-line",
    //       fontSize: "1rem",
    //       // position: "absolute",
    //       // bottom: 0,
    //     },
    //   },
    // },
    // {
    //   render: {
    //     componentType: "autocomplete",
    //   },
    //   name: "HO_TRAN_TYPE",
    //   label: "Transaction Type",
    //   defaultValue: "R42",
    //   GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    //   disableCaching: true,

    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "HO_ACCT_CD",
    //   label: "A/C No.",
    //   placeholder: "",
    //   type: "text",
    //   isReadOnly: true,
    //   GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "ACCT_NM",
    //   label: "A/C Name.",
    //   placeholder: "",
    //   type: "text",
    //   isReadOnly: true,
    //   GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "WITH_BAL",
    //   label: "A/C Balance",
    //   placeholder: "",
    //   type: "text",
    //   isReadOnly: true,
    //   GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    // },

    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "VERIFIED_BY",
    //   label: "Checker",
    //   placeholder: "",
    //   type: "text",
    //   fullWidth: true,
    //   isReadOnly: true,
    //   dependentFields: ["CONFIRMED"],
    //   __VIEW__: { render: { componentType: "textField" } },
    //   shouldExclude: (_, dependentFieldsValues, __) => {
    //     if (dependentFieldsValues?.CONFIRMED?.value === "Pending") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: { xs: 12, sm: 1.3, md: 1.2, lg: 1.2, xl: 1.5 },
    // },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "VERIFIED_DATE",
    //   label: "Checker Time",
    //   placeholder: "",
    //   type: "text",
    //   format: "dd/MM/yyyy HH:mm:ss",
    //   __VIEW__: { render: { componentType: "datetimePicker" } },
    //   fullWidth: true,
    //   isReadOnly: true,
    //   dependentFields: ["CONFIRMED"],
    //   shouldExclude: (_, dependentFieldsValues, __) => {
    //     if (dependentFieldsValues?.CONFIRMED?.value === "Pending") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    // },
  ],
};
export const RtgsOrderingHOConfirmFormMetaData = {
  form: {
    name: "rtgsEntry",
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
        componentType: "autocomplete",
      },
      name: "ENTRY_TYPE",
      label: "RTGSNEFT",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "Date",
      placeholder: "",
      isReadOnly: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 6, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRAN_TYPE_DESC",
      label: "TransactionType",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      disableCaching: true,
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "BR_CONFIRMED",
      label: "",
      type: "text",

      GridProps: { xs: 6, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SLIP_NO",
      label: "SlipNo",
      type: "text",
      GridProps: { xs: 6, sm: 1.1, md: 1.1, lg: 1.1, xl: 1.1 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "HO_COMM_TYPE_DESC",
      label: "HoCommType",
      GridProps: { xs: 12, sm: 2.4, md: 2.4, lg: 2.4, xl: 2.4 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "BR_IFSCCODE",
      label: "IFSC",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2.2 },
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
      },
      accountTypeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2.2 },
        isFieldFocused: true,
        defaultfocus: true,
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
      },
      accountCodeMetadata: {
        fullWidth: true,
        textFieldStyle: {
          "& .MuiInputBase-input": {
            background: "var(--theme-color5)",
            color: "var(--theme-color2) !important",
            "&.Mui-disabled": {
              color: "var(--theme-color2) !important",
              "-webkit-text-fill-color": "var(--theme-color2) !important",
            },
          },
        },
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_BNFCRY",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      label: "",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NAME",
      label: "Account_Name",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "Limit",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_MODE",
      label: "ACMode",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "OrdACName",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
      required: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "ACAddress",
      type: "text",
      fullWidth: true,

      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 3.3 },
    },

    {
      render: {
        componentType: "phoneNumber",
      },
      name: "CONTACT_INFO",
      label: "ContactNo",
      placeholder: "Mobile Number",
      type: "string",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "Cheque No.",
      type: "text",
      autoComplete: "off",
      GridProps: { xs: 6, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      type: "text",
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      type: "text",
      GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "Amount",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COMM_AMT",
      label: "CommAmount",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENABLE_DISABLE",
      label: "",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SER_CHRG_AMT",
      label: "GST",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL",
      label: "TotalAmount",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },

      dependentFields: ["AMOUNT", "SER_CHRG_AMT", "COMM_AMT"],

      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          parseFloat(dependentFields?.SER_CHRG_AMT?.value) +
          parseFloat(dependentFields?.AMOUNT?.value) +
          parseFloat(dependentFields?.COMM_AMT?.value);
        return value ?? "--";
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BY",
      label: "Maker",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_DATE",
      label: "MakerTime",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      __VIEW__: { render: { componentType: "datetimePicker" } },
      __EDIT__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VERIFIED_BY",
      label: "BrConfirmedBy",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HO_VERIFIED_BY",
      label: "HoVerifiedBy",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "CONF_STATUS",
      label: "ConfirmStatus",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
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
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "A/C Balance",
      label: "ACBalance",
      GridProps: { xs: 12, sm: 12, md: 12 },
      TypographyProps: {
        style: {
          // color: "red",
          whiteSpace: "pre-line",
          fontSize: "1rem",
          // position: "absolute",
          // bottom: 0,
        },
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "HO_TRAN_TYPE",
      label: "TransactionType",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      disableCaching: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "HO_ACCT_CD",
      label: "ACNo",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account_Name",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "WITH_BAL",
      label: "ACBalance",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },

    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "VERIFIED_BY",
    //   label: "Checker",
    //   placeholder: "",
    //   type: "text",
    //   fullWidth: true,
    //   isReadOnly: true,
    //   dependentFields: ["CONFIRMED"],
    //   __VIEW__: { render: { componentType: "textField" } },
    //   shouldExclude: (_, dependentFieldsValues, __) => {
    //     if (dependentFieldsValues?.CONFIRMED?.value === "Pending") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: { xs: 12, sm: 1.3, md: 1.2, lg: 1.2, xl: 1.5 },
    // },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "VERIFIED_DATE",
    //   label: "Checker Time",
    //   placeholder: "",
    //   type: "text",
    //   format: "dd/MM/yyyy HH:mm:ss",
    //   __VIEW__: { render: { componentType: "datetimePicker" } },
    //   fullWidth: true,
    //   isReadOnly: true,
    //   dependentFields: ["CONFIRMED"],
    //   shouldExclude: (_, dependentFieldsValues, __) => {
    //     if (dependentFieldsValues?.CONFIRMED?.value === "Pending") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    // },
  ],
};

export const rtgBenDetailConfirmFormMetaData: any = {
  form: {
    refID: 1667,
    name: "beneficiaryDtlFormMetaData",
    label: "BeneficiaryDetail",
    resetFieldOnUmnount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",

      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
      name: "SPACER",
      GridProps: { xs: 0, md: 8, sm: 8, lg: 8, xl: 8 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ORDERING_AMOUNT",
      label: "OrderingAmount",
      placeholder: "",
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
      __VIEW__: { render: { componentType: "hidden" } },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "BENIFICIARY_AMOUNT",
      label: "TotalBenificiaryAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      validationRun: "onBlur",
      defaultValue: "0",
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
      __VIEW__: { render: { componentType: "hidden" } },

      dependentFields: ["beneficiaryAcDetails"],
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["beneficiaryAcDetails"])
            ? dependentFieldState?.["beneficiaryAcDetails"]
            : []
        ).reduce((accum, obj) => accum + Number(obj.AMOUNT?.value), 0);

        return accumulatedTakeoverLoanAmount;
      },
      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      validationRun: "onBlur",
      dependentFields: ["ORDERING_AMOUNT", "BENIFICIARY_AMOUNT"],
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.ORDERING_AMOUNT?.value) -
          Number(dependentFields?.BENIFICIARY_AMOUNT?.value);
        return value ?? "0";
      },
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
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "ADDNEWROW",
      label: "AddRow",
      endsIcon: "AddCircleOutlineRounded",
      rotateIcon: "scale(1)",
      placeholder: "",
      type: "text",
      tabIndex: "-1",
      iconStyle: {
        fontSize: "25px !important",
      },
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 2.2, sm: 2, md: 1.8, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "arrayField",
      },
      isRemoveButton: true,
      displayCountName: "Beneficiary A/C Detail",
      fixedRows: true,
      isScreenStyle: true,
      disagreeButtonName: "No",
      agreeButtonName: "Yes",
      errorTitle: "deleteTitle",
      name: "beneficiaryAcDetails",
      removeRowFn: "deleteFormArrayFieldData",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "TRAN_CD",
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "FILED_HIDDEN",
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "TO_ACCT_NO_DISP",
          label: "ACNo",
          defaultValue: "",
          GridProps: { xs: 12, sm: 3.2, md: 3.2, lg: 3.2, xl: 3.2 },
          disableCaching: true,
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "BENEFICIARY",
          label: "AuditTrail",
          placeholder: "",
          type: "text",
          tabIndex: "-1",
          iconStyle: {
            fontSize: "25px !important",
          },
          shouldExclude(fieldData, dependentFields, formState) {
            if (formState?.isIfscCdData?.[0] === "Y") {
              return false;
            } else {
              return true;
            }
          },
          __VIEW__: { render: { componentType: "hidden" } },
          GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_NM",
          label: "Name",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_TYPE",
          label: "AccountType",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "CONTACT_NO",
          label: "MobileNo",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_EMAIL_ID",
          label: "EmailID",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3.2, md: 3.2, lg: 3.2, xl: 3.2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ADD1",
          label: "Address",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "BENEF_REM_EDIT",
        },

        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          type: "text",
          fullWidth: true,
          dependentFields: ["BENEF_REM_EDIT"],
          isReadOnly(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.BENEF_REM_EDIT?.value === "Y") {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMITTANCE_INFO",
          label: "RemittanceInfo",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 3.2, md: 3.2, lg: 3.2, xl: 3.2 },
          dependentFields: ["BENEF_REM_EDIT"],
          isReadOnly(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.BENEF_REM_EDIT?.value === "Y") {
              return true;
            } else {
              return false;
            }
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "Amount",
          placeholder: "",
          type: "text",
          __EDIT__: {
            dependentFields: ["FILED_HIDDEN"],
            isReadOnly: (field, dependentField, formState) => {
              if (
                dependentField?.["beneficiaryAcDetails.FILED_HIDDEN"]?.value ===
                "Y"
              ) {
                return true;
              } else {
                return false;
              }
            },
          },
          FormatProps: {
            allowNegative: false,
          },
          // postValidationSetCrossFieldValues: async (...arr) => {
          //   if (arr[0].value) {
          //     return {
          //       BENIFICIARY_AMOUNT: { value: arr[0].value ?? "0" },
          //     };
          //   } else {
          //     return {
          //       BENIFICIARY_AMOUNT: { value: "" },
          //     };
          //   }
          // },
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: false,
          },
          postValidationSetCrossFieldValues: async (...arr) => {
            if (arr[0].value) {
              arr?.[1].setDataOnFieldChange("AMOUNT", "");
              // return {
              //   TOTAL_DR_AMOUNT: { value: arr[0].value ?? "0" },
              // };
            } else {
              // return {
              //   TOTAL_DR_AMOUNT: { value: "" },
              // };
            }
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },

        {
          render: {
            componentType: "divider",
          },
          dividerText: "IFSC Bank Detail",
          name: "Address",
          label: "IFSCBankDetail",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_IFSCCODE",
          label: "IFSC",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            formState.setDataOnFieldChange("IFSC_CD", field?.value);
          },
          GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "IFSC",
          label: "IfscDetail",
          placeholder: "",
          type: "text",
          tabIndex: "-1",
          iconStyle: {
            fontSize: "25px !important",
          },
          __VIEW__: { render: { componentType: "hidden" } },
          GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "Bank",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH_NM",
          label: "Branch",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 2.7, md: 2.7, lg: 2.7, xl: 2.7 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CONTACT_DTL",
          label: "Contact",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CENTRE_NM",
          label: "Center",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADDR",
          label: "Address",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 4.3, md: 4.3, lg: 4.3, xl: 4.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISTRICT_NM",
          label: "District",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STATE_NM",
          label: "State",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
      ],
    },
  ],
};

export const BulkAccountDetailConfirmMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "BeneficiaryDetail",
    rowIdColumn: "SR_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    allowRowSelection: false,
    disableSorting: false,
    disableGroupBy: true,
    hideHeader: true,
    // hideFooter: true,
    containerHeight: {
      min: "25vh",
      max: "25vh",
    },
    allowColumnHiding: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "id",
      columnName: "SrNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },
    {
      accessor: "TO_ACCT_NO",
      columnName: "ACNo",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 190,
    },
    {
      accessor: "TO_ACCT_NM",
      columnName: "Name",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "TO_ACCT_TYPE",
      columnName: "AccountType",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 190,
    },
    {
      accessor: "CONTACT_NO",
      columnName: "contactNo",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "TO_EMAIL_ID",
      columnName: "EmailID",
      sequence: 6,
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "TO_IFSCCODE",
      columnName: "IFSCCode",
      sequence: 7,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 8,
      alignment: "right",
      componentType: "currency",
      width: 180,
      minWidth: 150,
      maxWidth: 200,
      isTotalWithCurrency: true,
      footerLabel: "Total Amt:",
    },
    {
      accessor: "TO_ADD1",
      columnName: "Address",
      sequence: 9,
      componentType: "default",
      width: 320,
      minWidth: 300,
      maxWidth: 400,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 250,
      maxWidth: 350,
      showTooltip: true,
      isTotalWithCurrency: true,
      footerLabel: "Erroneous:",
      setFooterValue(total, rows) {
        const errorCount = rows.filter(
          (row) => row?.original?.ERROR_FLAG === "Y"
        ).length;
        return errorCount;
      },
    },
  ],
};
