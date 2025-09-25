import { GridMetaDataType } from "@acuteinfo/common-base";
import { format } from "date-fns";
export const FDDetailGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "FD_NO",
    defaultColumnConfig: {
      width: 250,
      maxWidth: 300,
      minWidth: 200,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: true,
    hideFooter: false,
    pageSizes: [50, 80, 100],
    defaultPageSize: 50,
    containerHeight: {
      min: "55vh",
      max: "55vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    footerNote: "FDDtlGridFooterNote",
    isCusrsorFocused: true,
  },

  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 70,
      minWidth: 50,
      maxWidth: 150,
      isAutoSequence: true,
    },
    {
      accessor: "TRAN_DT",
      columnName: "asonDate",
      sequence: 2,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 100,
      minWidth: 90,
      maxWidth: 150,
      isTotalWithCurrency: true,
      footerIsMultivalue: true,
      footerLabel: "{0}",
      setFooterValue(total, rows) {
        const validDates = rows
          ?.map(
            (item) => item?.values?.TRAN_DT && new Date(item?.values?.TRAN_DT)
          )
          .filter((date) => date && !isNaN(date?.getTime()));
        const earliestDueDate =
          validDates?.length > 0
            ? format(
                new Date(
                  Math.min(...validDates?.map((date) => date?.getTime()))
                ),
                "dd/MM/yyyy"
              )
            : "";
        return [earliestDueDate || ""];
      },
    },
    {
      accessor: "MATURITY_DT",
      columnName: "maturityDate",
      sequence: 3,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 100,
      minWidth: 90,
      maxWidth: 150,
      isTotalWithCurrency: true,
      footerIsMultivalue: true,
      footerLabel: "{0}",
      setFooterValue(total, rows) {
        const validDates = rows
          ?.map(
            (item) =>
              item?.values?.MATURITY_DT && new Date(item?.values?.MATURITY_DT)
          )
          .filter((date) => date && !isNaN(date?.getTime()));
        const earliestDueDate =
          validDates?.length > 0
            ? format(
                new Date(
                  Math.max(...validDates?.map((date) => date?.getTime()))
                ),
                "dd/MM/yyyy"
              )
            : "";
        return [earliestDueDate || ""];
      },
    },
    {
      accessor: "TOT_AMT",
      columnName: "PrincipalAmount",
      sequence: 4,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 140,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      accessor: "MATURITY_AMT",
      columnName: "MaturityAmount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 140,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      accessor: "FD_NO",
      columnName: "FDNo",
      sequence: 6,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 90,
      maxWidth: 180,
    },
    {
      accessor: "PERIOD_DISP",
      columnName: "Period",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 90,
      maxWidth: 110,
      showTooltip: true,
    },
    {
      accessor: "INT_RATE",
      columnName: "Rate",
      sequence: 8,
      alignment: "right",
      componentType: "default",
      width: 80,
      minWidth: 50,
      maxWidth: 200,
    },
    {
      accessor: "TERM_DISP",
      columnName: "Term",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 90,
      maxWidth: 110,
    },
    {
      accessor: "CR_AC_DTL",
      columnName: "CrTypeAcNo",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 130,
      minWidth: 100,
      maxWidth: 200,
      showTooltip: true,
    },
    {
      accessor: "INT_AMT",
      columnName: "FinIntAmt",
      sequence: 11,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 140,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "IssueDate",
      sequence: 12,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 100,
      minWidth: 90,
      maxWidth: 150,
    },
    {
      accessor: "BAL_AMT",
      columnName: "Balance",
      sequence: 13,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 140,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      accessor: "FD_REMARK",
      columnName: "FDRemark",
      sequence: 14,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 150,
      maxWidth: 300,
      showTooltip: true,
    },
    {
      accessor: "CONF_DISPLAY",
      columnName: "ConfStatus",
      sequence: 15,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 80,
      maxWidth: 250,
      showTooltip: true,
    },
    {
      accessor: "TOT_TDS_RECO_INT_AMT",
      columnName: "TDSRecoverAmt",
      sequence: 16,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 140,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      accessor: "RENEW_REMARK",
      columnName: "RenewRemark",
      sequence: 17,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 150,
      maxWidth: 300,
      showTooltip: true,
    },
    {
      accessor: "FD_LIEN_AMT",
      columnName: "LienAmount",
      sequence: 18,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 140,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      accessor: "NO_OF_UNIT",
      columnName: "NoOfUnit",
      sequence: 19,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 90,
      maxWidth: 140,
      isTotalWithCurrency: true,
      footerLabel: " ",
    },
    {
      accessor: "TOT_INVEST_AMT",
      columnName: "TotalInvestedAmount",
      sequence: 20,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 160,
      minWidth: 150,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },
    {
      columnName: "",
      componentType: "buttonRowCell",
      accessor: "LEAN_FLAG",
      sequence: 21,
      buttonLabel: "Lien",
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (initialValue === "Y") {
          return false;
        }
        return true;
      },
      width: 100,
      minWidth: 80,
      maxWidth: 110,
    },
  ],
};
