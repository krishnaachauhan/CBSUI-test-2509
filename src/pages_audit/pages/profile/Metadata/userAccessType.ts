import { GridMetaDataType } from "@acuteinfo/common-base";

export const userAccesstypeMetadata: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "ProductAccessRights",
    rowIdColumn: "ACCT_TYPE",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    hideFooter: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [20, 40, 60],
    defaultPageSize: 20,
    containerHeight: {
      min: "calc(100vh - 457px)",
      max: "calc(100vh - 457px)",
    },
    allowRowSelection: false,
  },
  // filters: [],
  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "center",
      componentType: "default",
      width: 75,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },

    {
      accessor: "TYPE_NM",
      columnName: "Product",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 280,
      minWidth: 280,
      maxWidth: 300,
    },
    {
      accessor: "ACCESS",
      columnName: "Access",
      sequence: 3,
      alignment: "center",
      componentType: "editableCheckbox",
      isReadOnly: true,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
    },
  ],
};
