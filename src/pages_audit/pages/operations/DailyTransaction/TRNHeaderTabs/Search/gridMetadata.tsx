import { GridMetaDataType } from "@acuteinfo/common-base";
export const searchGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Search",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: true,
    hideFooter: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "36vh",
      max: "30vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
  },
  filters: [],

  columns: [
    {
      accessor: "sr",
      columnName: "Sr ",
      sequence: 1,
      componentType: "default",
      width: 100,
    },
    {
      columnName: "A/C No. ",
      accessor: "acno",
      sequence: 2,
      componentType: "default",
      width: 100,
    },
    {
      columnName: "A/C Name ",
      accessor: "acname",
      sequence: 3,
      componentType: "default",
      width: 100,
    },
    {
      accessor: "TRAN_DT",
      columnName: "Issue Date",
      sequence: 4,
      componentType: "date",
      isVisible: true,
      dateFormat: "dd/MM/yyyy",
      width: 120,
    },

    {
      columnName: " From Chq",
      accessor: "CHEQUE_FROM",
      sequence: 5,
      componentType: "default",
      width: 200,
    },
    {
      columnName: " To Chq",
      accessor: "CHEQUE_TO",
      sequence: 6,
      componentType: "default",
      width: 200,
    },
    {
      columnName: "Chq(s) ",
      accessor: "CHEQUE_TO",
      sequence: 7,
      componentType: "default",
      width: 200,
    },

    {
      accessor: "REMARKS",
      columnName: "Remarks ",
      sequence: 8,
      componentType: "default",
      width: 120,
    },
  ],
};
