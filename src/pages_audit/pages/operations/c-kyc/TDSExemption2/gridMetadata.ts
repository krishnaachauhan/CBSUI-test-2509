import { GridMetaDataType } from "@acuteinfo/common-base";

export const tds_exemption_dtl_grid_meta_data: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    allowRowSelection: false,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "60vh",
      max: "80vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    isCusrsorFocused: true,
  },
  // filters: [],
  columns: [
    {
      accessor: "SR_CD",
      columnName: "Number",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 50,
      isAutoSequence: true,
      minWidth: 50,
      maxWidth: 80,
    },
    {
      accessor: "FORM_TYPE",
      columnName: "ExemptionType",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "FORM_NM",
      columnName: "FormName",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "RECEIVED_DT",
      columnName: "ReceivedDate",
      sequence: 4,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 250,
      minWidth: 250,
      maxWidth: 400,
    },
    {
      accessor: "EFFECTIVE_DT",
      columnName: "EffectiveDate",
      sequence: 5,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 250,
      minWidth: 250,
      maxWidth: 400,
    },
    {
      accessor: "FORM_EXPIRY_DATE",
      columnName: "ExpiryDate",
      sequence: 6,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 250,
      minWidth: 250,
      maxWidth: 400,
    },
    {
      accessor: "TDS_LIMIT",
      columnName: "ExemptionLimit",
      sequence: 7,
      alignment: "right",
      componentType: "currency",
      width: 118,
      minWidth: 90,
      maxWidth: 160,
    },
    {
      accessor: "TDS_RATE",
      columnName: "Rate",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "TDS_CERTI_DETAILS",
      columnName: "ExemptionDetails",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "FIN_INT_AMT",
      columnName: "ProjectedFinInt",
      sequence: 10,
      alignment: "right",
      componentType: "currency",
      width: 118,
      minWidth: 90,
      maxWidth: 160,
    },
    {
      accessor: "SUBMISSION_DT",
      columnName: "SubimissionToIT",
      sequence: 11,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 250,
      minWidth: 250,
      maxWidth: 400,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "EnteredDate",
      sequence: 12,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 250,
      minWidth: 250,
      maxWidth: 400,
    },
    {
      accessor: "ACTIVE",
      columnName: "Active",
      sequence: 13,
      alignment: "center",
      componentType: "editableCheckbox",
      // isReadOnly: true,
      width: 110,
      minWidth: 100,
      maxWidth: 120,
      isReadOnly: (initialValue, original, prevRows, nextRows) => {
        const active = initialValue;
        const confirmed = original?.CONFIRMED;
        const upload = original?.UPLOAD;
        const originalActive = original?.ORIGINALACTIVE;
        if (
          Boolean(active && originalActive === "N") ||
          Boolean(confirmed && confirmed === "N") ||
          Boolean(upload && upload === "Y")
        ) {
          return true;
        }
        return false;
      },
    },
    {
      accessor: "INACTIVE_DT",
      columnName: "InactiveDate",
      sequence: 14,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 250,
      minWidth: 250,
      maxWidth: 400,
    },
    {
      accessor: "TRAN_CD",
      columnName: "TRANCD",
      sequence: 15,
      isVisible: true,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "DELETE",
      columnName: "Remove",
      buttonLabel: "Remove",
      componentType: "buttonRowCell",
      sequence: 16,
      width: 120,
      maxWidth: 120,
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        const isNewRow = original?.IsNewRow;
        if (Boolean(isNewRow)) {
          return false;
        }
        return true;
      },
    },
    {
      accessor: "VIEW_EDIT",
      columnName: "View/Edit",
      buttonLabel: "ViewEdit",
      componentType: "buttonRowCell",
      sequence: 16,
      width: 120,
      maxWidth: 120,
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        const isNewRow = original?.IsNewRow;
        if (Boolean(isNewRow)) {
          return false;
        }
        return true;
      },
    },
    {
      accessor: "ORIGINALACTIVE",
      columnName: "OriginalActive",
      sequence: 17,
      alignment: "center",
      componentType: "editableCheckbox",
      isReadOnly: true,
      width: 110,
      minWidth: 100,
      maxWidth: 120,
      isVisible: false,
    },
  ],
};
