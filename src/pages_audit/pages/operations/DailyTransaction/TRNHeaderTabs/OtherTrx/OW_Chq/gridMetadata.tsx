import {
  formatCurrency,
  getCurrencySymbol,
  GridMetaDataType,
} from "@acuteinfo/common-base";
export const OwChqGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "OWChqOBCIBC",
    rowIdColumn: "index",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 120,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: true,
    hideFooter: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "23.7vh",
      max: "23.7vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
  },
  filters: [],
  columns: [
    {
      columnName: "SrNo",
      accessor: "sr",
      sequence: 0,
      componentType: "default",
      width: 80,
      maxWidth: 100,
      minWidth: 50,
    },
    {
      columnName: "TranDate",
      accessor: "TRAN_DT",
      sequence: 1,
      componentType: "date",
      alignment: "center",
      dateFormat: "dd/MM/yyyy",
      width: 120,
    },
    {
      columnName: "chequeNo",
      accessor: "CHEQUE_NO",
      sequence: 2,
      alignment: "right",
      componentType: "default",
      width: 120,
    },
    {
      columnName: "Description",
      accessor: "DESCRIPTION",
      sequence: 3,
      componentType: "default",
      showTooltip: true,
      width: 200,
    },
    {
      columnName: "OtherDetails",
      accessor: "STATUS",
      sequence: 4,
      componentType: "default",
      showTooltip: true,
      width: 250,
    },
    {
      columnName: "CR_DR",
      accessor: "CR_DR",
      sequence: 5,
      componentType: "default",
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: "{0}",
      setFooterValue: (_, rows, CustomProperties) => {
        let creditAmount = rows
          .filter((row) => row.values?.CR_DR === "Credit")
          .reduce((total, row) => {
            let amount = parseFloat(row?.values?.AMOUNT || 0);
            return total + amount;
          }, 0);
        creditAmount = parseFloat(creditAmount).toFixed(2);
        creditAmount = formatCurrency(
          parseFloat(creditAmount || "0"),
          getCurrencySymbol(CustomProperties?.dynamicAmountSymbol),
          CustomProperties?.currencyFormat,
          CustomProperties?.decimalCount
        );
        return [`${creditAmount} (Cr.)` || ""];
      },
      width: 150,
    },
    {
      columnName: "Amount",
      accessor: "AMOUNT",
      sequence: 6,
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      alignment: "right",
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: "{0}",
      setFooterValue: (_, rows, CustomProperties) => {
        let debitAmount = rows
          .filter((row) => row.values?.CR_DR === "Debit")
          .reduce((total, row) => {
            let amount = parseFloat(row?.values?.AMOUNT || 0);
            return total + amount;
          }, 0);
        debitAmount = formatCurrency(
          parseFloat(debitAmount || "0"),
          getCurrencySymbol(CustomProperties?.dynamicAmountSymbol),
          CustomProperties?.currencyFormat,
          CustomProperties?.decimalCount
        );
        return [`${debitAmount} (Dr.)` || ""];
      },
      width: 150,
    },
    {
      columnName: "Confirm",
      accessor: "CONFIRM_DISP",
      sequence: 7,
      componentType: "default",
      width: 120,
    },
    {
      columnName: "Branch",
      accessor: "ENTERED_BRANCH_CD",
      sequence: 8,
      componentType: "default",
      width: 120,
    },
  ],
};
