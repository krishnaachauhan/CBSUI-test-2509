import { GridMetaDataType } from "@acuteinfo/common-base";
import * as API from "../api";
export const retrieveForm = {
  form: {
    name: "fd-printing-information",
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
      name: "PRINT_TEMPLATE",
      label: "Print Template",
      fullWidth: true,
      options: API.getFdPrintTempDdw,
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.current?.FD_ALLOW_DUPLICATE === "0") {
          return true;
        } else {
          return false;
        }
      },
      _optionsKey: "fdPrintTemplate",
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
      name: "FROM",
      label: "From",
      isWorkingDate: true,
      fullWidth: true,
      format: "dd/MM/yyyy",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.current?.FD_DISABLE_DATE === "Y") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 2,
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
      name: "TO",
      label: "To",
      isWorkingDate: true,
      fullWidth: true,
      format: "dd/MM/yyyy",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.current?.FD_DISABLE_DATE === "Y") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 2,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
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

export const RetrieveGrid: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "SR_NO",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "38vh",
      max: "38vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "ACCT_TYPE",
      columnName: "Type",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 80,
      maxWidth: 100,
    },
    {
      accessor: "ACCT_CD",
      columnName: "ACNumber",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 100,
      maxWidth: 120,
    },
    {
      accessor: "ACCT_NM",
      columnName: "AccountName",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 180,
      maxWidth: 200,
    },
    {
      accessor: "FD_NO",
      columnName: "FDNo",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "EnteredDate",
      sequence: 5,
      alignment: "left",
      componentType: "date",
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    },
    {
      accessor: "STATUS",
      columnName: "Status",
      alignment: "left",
      sequence: 6,
      componentType: "default",
      width: 100,
      minWidth: 100,
      maxWidth: 120,
    },
    {
      accessor: "PRINT_CNT",
      columnName: "PrintCnt",
      sequence: 7,
      alignment: "right",
      componentType: "default",
      width: 80,
      minWidth: 80,
      maxWidth: 100,
    },
    {
      accessor: "CASH_DENO_FLG",
      columnName: "CashDeno",
      sequence: 8,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 150,
    },
    {
      accessor: "AUTO_MANUAL",
      columnName: "Renew",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 80,
      maxWidth: 100,
    },
    {
      accessor: "PRINT_DT",
      columnName: "Print Dt",
      sequence: 10,
      alignment: "left",
      componentType: "date",
      width: 150,
      minWidth: 150,
      maxWidth: 180,
    },
  ],
};
