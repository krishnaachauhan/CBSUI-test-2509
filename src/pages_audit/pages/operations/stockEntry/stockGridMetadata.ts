import { GridMetaDataType } from "@acuteinfo/common-base";
import { t } from "i18next";

export const StockGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "stockDetail",
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
      min: "calc(100vh - 282px)",
      max: "calc(100vh - 282px)",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    hiddenFlag: "_hidden",
    searchPlaceholder: "stockDetail",
    footerNote: "StockFooterNote",
  },
  filters: [],
  columns: [
    {
      accessor: "ID",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 75,
      minWidth: 70,
      maxWidth: 100,
      isAutoSequence: true,
    },
    {
      accessor: "TRAN_DT",
      columnName: "StartDate",
      sequence: 2,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 135,
      minWidth: 100,
      maxWidth: 150,
      isTotalWithCurrency: true,
      footerLabel: "{0}",
      footerIsMultivalue: true,
      setFooterValue(total, rows) {
        const maxDate: any =
          rows.length > 0
            ? new Date(
                Math.max(
                  ...rows.map(({ original }) => new Date(original?.ASON_DT))
                )
              )
            : null;
        return maxDate ? [new Date(maxDate).toLocaleDateString("en-UK")] : [""];
      },
    },
    {
      accessor: "ASON_DT",
      columnName: "StockTillDate",
      sequence: 2,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 124,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "STOCK_DESC",
      columnName: "StockDescription",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 220,
      minWidth: 150,
      maxWidth: 290,
      showTooltip: true,
    },
    {
      accessor: "MARGIN",
      columnName: "Margin",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CR_KEY",
      width: 85,
      minWidth: 60,
      maxWidth: 100,
    },
    {
      accessor: "STOCK_VALUE_DTL",
      columnName: "StockValue",
      sequence: 6,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 120,
      minWidth: 90,
      maxWidth: 150,
    },
    {
      accessor: "DRAWING_POWER",
      columnName: "DrawingPower",
      sequence: 6,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isTotalWithCurrency: true,
      totalDecimalCount: 2,
      footerLabel: " ",
      width: 135,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "DESCRIPTION",
      columnName: "SecurityDescription",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 160,
      minWidth: 100,
      maxWidth: 200,
      showTooltip: true,
    },

    {
      accessor: "ENTERED_DATE",
      columnName: "EnteredDate",
      sequence: 8,
      alignment: "center",
      componentType: "date",
      width: 139,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "DISPLAY_CONFIRM",
      columnName: "Status",
      sequence: 8,
      alignment: "center",
      componentType: "default",
      width: 90,
      minWidth: 80,
      maxWidth: 120,
    },
    {
      accessor: "RECEIVED_DT",
      columnName: "RecievedDate",
      sequence: 9,
      alignment: "center",
      componentType: "date",
      width: 125,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "VIEW_DETAIL",
      columnName: "ViewDetail",
      buttonLabel: "View",
      sequence: 9,
      alignment: "center",
      componentType: "buttonRowCell",
      width: 90,
      minWidth: 60,
      maxWidth: 130,
    },
    {
      accessor: "ALLOW_DELETE_FLAG",
      columnName: "Action",
      buttonLabel: "Delete",
      sequence: 9,
      alignment: "center",
      componentType: "buttonRowCell",
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (initialValue === "Y") {
          return false;
        }
        return true;
      },
      width: 90,
      minWidth: 60,
      maxWidth: 130,
    },

    {
      columnName: "UploadView",
      componentType: "buttonRowCell",
      accessor: "DOC_FLAG",
      sequence: 10,
      width: 120,
      maxWidth: 150,
      minWidth: 90,
      setButtonName: (initialValue) => {
        if (initialValue) {
          return initialValue === "U" ? "Upload" : "UploadView";
        }
      },
      // isVisible: false,
      // isVisibleInNew: true,
    },
  ],
};
