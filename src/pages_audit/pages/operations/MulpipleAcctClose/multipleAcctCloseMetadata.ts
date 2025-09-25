import { GridMetaDataType } from "@acuteinfo/common-base";
import { isValid } from "date-fns";

export const MultipleAcctCloseParameterMetadata = {
  form: {
    name: "MultipleAcctCloseParameterMetadata",
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
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "datePicker" },
      name: "ASON_DT",
      label: "fromDate",
      placeholder: "DD/MM/YYYY",
      isFieldFocused: true,
      required: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateIsRequired"] }],
      },
    },
  ],
};

export const MultipleAcctCloserGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "INDEX",
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
    // enablePagination: true,
    // defaultPageSize: 15,
    // pageSizes: [15, 30, 50],
    containerHeight: {
      min: "55vh",
      max: "55vh",
    },
    isCusrsorFocused: true,
  },
  filters: [],
  columns: [
    {
      accessor: "ACCT_TYPE",
      columnName: "AccountType",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 150,
    },
    {
      accessor: "ACCT_CD",
      columnName: "AcctNum",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "ACCT_NM",
      columnName: "AccountName",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 400,
      minWidth: 300,
      maxWidth: 600,
      showTooltip: true,
    },
    {
      accessor: "OP_DATE",
      columnName: "OpDate",
      sequence: 4,
      componentType: "date",
      alignment: "center",
      dateFormat: "dd/MM/yyyy",
      width: 130,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "LST_USER_OPER_DT",
      columnName: "LastOperatedDate",
      sequence: 5,
      componentType: "date",
      alignment: "center",
      dateFormat: "dd/MM/yyyy",
      width: 130,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      columnName: "",
      accessor: "STATUS",
      sequence: 6,
      componentType: "editableSelect",
      options: [
        { label: "Open", value: "O" },
        { label: "To be Close", value: "C" },
      ],
      width: 140,
      minWidth: 100,
      maxWidth: 180,
      __VIEW__: {
        isReadOnly: true,
      },
    },
    {
      accessor: "PROCESS",
      columnName: "",
      componentType: "icondefault",
      buttonLabel: "Open",
      sequence: 12,
      alignment: "center",
      width: 80,
      minWidth: 70,
      maxWidth: 100,
      isImageURL: true,
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (original?.FLAG === "Y") {
          return false;
        } else {
          return true;
        }
      },
    },
  ],
};
