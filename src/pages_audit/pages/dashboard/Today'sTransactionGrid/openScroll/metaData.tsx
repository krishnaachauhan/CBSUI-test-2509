import { components } from "@acuteinfo/common-base";

export const scrollMetaData = {
  title: "",
  disableGroupBy: "",
  hideFooter: false,
  hideAmountIn: true,
  retrievalType: "",
  groupBy: [""],
  columns: [
    {
      columnName: "V.No.",
      accessor: "TRAN_CD",
      width: 100,
    },
    {
      columnName: "ACNumber",
      accessor: "ACCT_NO",
      width: 180,
    },
    {
      columnName: "ACHolder",
      accessor: "ACCT_NM",
      width: 310,
    },
    {
      columnName: "Remarks",
      accessor: "REMARKS",
      width: 310,
    },
    //

    {
      columnName: "ChequeNo",
      accessor: "CHEQUE_NO",
      width: 120,
      type: "default",
    },

    {
      columnName: "Debit",
      accessor: "DEBIT",
      width: 150,
      color: "red",
      Cell: components.NumberCell,
      alignment: "right",
      isTotalWithCurrency: true,
      // isCurrencyCode: true,
      // currencyRefColumn: "CURR_CD",
      // symbolPosi: "end",
    },
    {
      columnName: "Credit",
      accessor: "CREDIT",
      width: 150,
      color: "green",
      Cell: components.NumberCell,
      alignment: "right",
      isTotalWithCurrency: true,
      // currencyRefColumn: "CURR_CD",
      // isCurrencyCode: true,
      // symbolPosi: "end",
    },
    {
      columnName: "TrBranch",
      accessor: "BRANCH_CD",
      width: 100,
    },
    {
      columnName: "EntryTime",
      accessor: "TIME",
      Cell: components.DateTimeCell,
      width: 120,
      format: "HH:mm:ss",
    },
    {
      columnName: "Maker",
      accessor: "MAKER",
      // Filter: filters.SelectColumnFilter,
      width: 150,
    },
    {
      columnName: "Checker",
      accessor: "CHECKER",
      // Filter: filters.SelectColumnFilter,
      width: 150,
    },
  ],
};
