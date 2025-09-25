import { GridMetaDataType } from "@acuteinfo/common-base";

export const ActionTakenMasterGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: false,
    gridLabel: "",
    rowIdColumn: "ACTION_TAKEN_CD",
    defaultColumnConfig: {
      width: 400,
      minWidth: 300,
      maxWidth: 450,
    },
    allowColumnReordering: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 30, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "55vh",
      max: "55vh",
    },
    isCusrsorFocused: true,
    allowRowSelection: false,
  },

  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 70,
      maxWidth: 90,
      isAutoSequence: true,
    },
    {
      accessor: "ACTION_TAKEN_CD",
      columnName: "Code",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 70,
      maxWidth: 90,
    },
    {
      accessor: "DESCRIPTION",
      columnName: "Description",
      sequence: 3,
      alignment: "left",
      componentType: "default",
    },
    {
      accessor: "LEGAL_PROCESS",
      columnName: "LegalProcess",
      sequence: 4,
      alignment: "left",
      componentType: "editableCheckbox",
      isReadOnly: true,
      width: 110,
      minWidth: 100,
      maxWidth: 120,
    },
    {
      accessor: "DATA_DISP",
      columnName: "A4SuitFileStatusCode",
      sequence: 5,
      alignment: "left",
      componentType: "default",
    },
  ],
};
