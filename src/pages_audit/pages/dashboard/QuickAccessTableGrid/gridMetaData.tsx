import { GridMetaDataType } from "@acuteinfo/common-base";
export const QuickAccessTableGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "QuickAccess",
    rowIdColumn: "DOC_CD",

    defaultColumnConfig: {
      width: 200,
      maxWidth: 300,
      minWidth: 200,
    },

    allowColumnReordering: false,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: false,
    containerHeight: {
      min: "420px",
      max: "420px",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hideFooter: true,
  },
  columns: [
    {
      accessor: "DOC_NM",
      columnName: "ScreenName",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 200,
      maxWidth: 350,
    },
    {
      accessor: "USER_DEFINE_CD",
      columnName: "UserCode",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 90,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "DOC_CD",
      columnName: "SystemCode",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 180,
      maxWidth: 180,
    },
  ],
};
