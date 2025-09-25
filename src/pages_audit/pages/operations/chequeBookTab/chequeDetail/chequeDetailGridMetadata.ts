import { GridMetaDataType } from "@acuteinfo/common-base";
export const ChequeDtlGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "ChequeDetail",
    rowIdColumn: "index",
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
      min: "56vh",
      max: "56vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    // footerNote: "",
  },
  filters: [],
  columns: [
    {
      accessor: "ID",
      columnName: "SrNo",
      sequence: 1,
      alignment: "center",
      componentType: "default",
      width: 76,
      minWidth: 70,
      maxWidth: 100,
      isAutoSequence: true,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "AccountType",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 111,
      minWidth: 90,
      maxWidth: 150,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Pending: {0}`,
      setFooterValue: (_, rows) => {
        const PendignCount = rows.filter(
          (item) => item?.original?.["FLAG"] === "N"
        ).length;

        return [PendignCount || "0"];
      },
    },
    {
      accessor: "ACCT_CD",
      columnName: "AccountNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Paid: {0}`,
      setFooterValue: (_, rows) => {
        const PaidCount = rows.filter(
          (item) => item?.original?.["FLAG"] === "P"
        ).length;

        return [PaidCount || "0"];
      },
    },
    {
      accessor: "TRAN_DT",
      columnName: "ProcessedDate",
      sequence: 2,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 170,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Stop Cheque: {0}`,
      setFooterValue: (_, rows) => {
        const StopChequeCount = rows.filter(
          (item) => item?.original?.["FLAG"] === "T"
        ).length;

        return [StopChequeCount || "0"];
      },
    },
    {
      accessor: "CHEQUE_NO",
      columnName: "ChequeNo",
      sequence: 4,
      alignment: "center",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Return: {0}`,
      setFooterValue: (_, rows) => {
        const ReturnCount = rows.filter(
          (item) => item?.original?.["FLAG"] === "R"
        ).length;

        return [ReturnCount || "0"];
      },
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 7,
      alignment: "right",
      componentType: "currency",
      width: 80,
      minWidth: 100,
      maxWidth: 130,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `PDC: {0}`,
      setFooterValue: (_, rows) => {
        const PDCCount = rows.filter(
          (item) => item?.original?.["FLAG"] === "D"
        ).length;

        return [PDCCount || "0"];
      },
    },

    {
      accessor: "FLAG_DISPLAY",
      columnName: "Status",
      sequence: 7,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 250,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Surrender: {0}`,
      setFooterValue: (_, rows) => {
        const SurrenderCount = rows.filter(
          (item) => item?.original?.["FLAG"] === "S"
        ).length;

        return [SurrenderCount || "0"];
      },
    },
  ],
};
