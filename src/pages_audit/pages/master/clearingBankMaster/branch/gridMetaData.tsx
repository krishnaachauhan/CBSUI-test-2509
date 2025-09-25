import { GridMetaDataType } from "@acuteinfo/common-base";

export const AddBranchGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Add in Branch(es)",
    rowIdColumn: "BRANCH_CD",
    defaultColumnConfig: {
      width: 440,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: false,
    containerHeight: {
      min: "46vh",
      max: "46vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    hideFooter: true,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      columnName: "Visiable",
      componentType: "default",
      accessor: "VISIBLE_YN",
      sequence: 0,
      alignment: "left",
      isVisible: false,
    },
    {
      accessor: "CHECK_BOX",
      columnName: "Select",
      sequence: 2,
      alignment: "left",
      dependentOptionField: "VISIBLE_YN",
      componentType: "editableCheckbox",
      enableColumnSelection: true,
      width: 120,
      minWidth: 80,
      maxWidth: 140,
      defaultValue: false,
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (!Boolean(original?.VISIBLE_YN === false)) {
          return false;
        }
        return true;
      },
    },
    {
      accessor: "BRANCH_CD",
      columnName: "Code",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "BRANCH_NM",
      columnName: "DisplayName",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 360,
      minWidth: 300,
      maxWidth: 400,
      showTooltip: true,
    },
  ],
};
