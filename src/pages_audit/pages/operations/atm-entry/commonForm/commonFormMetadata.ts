export let commonFormMetaData = {
  masterForm: {
    form: {
      name: "atm-Confirm-MetaData",
      label: " ",
      resetFieldOnUnmount: false,
      validationRun: "onBlur",
      render: {
        ordering: "auto",
        renderType: "simple",
        gridConfig: {
          item: {
            xs: 12,
            sm: 4,
            md: 4,
          },
          container: {
            direction: "row",
            spacing: 0.5,
          },
        },
      },
    },
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: " ",
      rowIdColumn: "ID_SR_NO",
      searchPlaceholder: "Accounts",
      defaultColumnConfig: {
        width: 150,
        maxWidth: 250,
        minWidth: 100,
      },
      allowColumnReordering: true,
      disableSorting: false,
      // hideHeader: false,
      hideFooter: true,

      disableGroupBy: true,
      // hiddenFlag: "_hidden",
      enablePagination: false,
      pageSizes: [10, 20, 30],
      defaultPageSize: 10,
      containerHeight: {
        min: "calc(100vh - 505px)",
        max: "calc(100vh - 505px)",
      },
      allowFilter: false,
      allowColumnHiding: false,
      allowRowSelection: false,
    },
    // filters: [],
    columns: [
      {
        accessor: "SRNO",
        columnName: "SrNo",
        sequence: 1,
        componentType: "default",
        width: 75,
        minWidth: 50,
        maxWidth: 100,
        isAutoSequence: true,
      },
      {
        accessor: "REQ_DT",
        columnName: "RequestDate",
        sequence: 2,
        componentType: "date",
        dateFormat: "dd/MM/yyyy",
        width: 120,
        maxWidth: 200,
        minWidth: 150,
      },
      {
        accessor: "DISPLAY_STATUS",
        columnName: "CardStatus",
        componentType: "default",
        sequence: 2,
        alignment: "left",
        width: 100,
        minWidth: 200,
        maxWidth: 400,
      },

      {
        accessor: "DISPLAY_CARD_ISSUE_TYPE",
        columnName: "IssueTo",
        sequence: 4,
        componentType: "default",
        width: 120,
        alignment: "left",
      },
      {
        accessor: "CUSTOMER_ID",
        columnName: "CustomerId",
        sequence: 5,
        componentType: "default",
        width: 120,
        alignment: "left",
      },
      {
        accessor: "CUSTOMER_NM",
        columnName: "CustomerName",
        sequence: 6,
        componentType: "default",
        width: 130,
        maxWidth: 160,
        minWidth: 90,
        alignment: "left",
      },
      {
        accessor: "ISSUE_DT",
        columnName: "IssueRejectDate",
        sequence: 7,
        componentType: "date",
        width: 120,
        alignment: "center",
      },

      {
        accessor: "CITIZEN_ID",
        columnName: "CitizenId",
        sequence: 8,
        componentType: "default",
        width: 120,
        alignment: "left",
      },
      {
        accessor: "M_CARD_NO",
        columnName: "CardNo",
        sequence: 9,
        componentType: "default",
        width: 160,
        alignment: "left",
      },
      {
        accessor: "CARD_TYPE",
        columnName: "CardType",
        sequence: 10,
        componentType: "default",
        alignment: "left",
        width: 120,
      },
      {
        accessor: "EXPIRE_DT",
        columnName: "ExpireDate",
        sequence: 12,
        componentType: "date",
        alignment: "center",
        // dateFormat: "dd/MM/yyyy",
        width: 120,
      },
      {
        accessor: "REMARKS",
        columnName: "Remarks",
        sequence: 11,
        componentType: "default",
        alignment: "left",
        width: 220,
      },
      {
        accessor: "DEACTIVE_DT",
        columnName: "DeactiveDate",
        sequence: 12,
        componentType: "date",
        alignment: "center",
        // dateFormat: "dd/MM/yyyy",
        width: 155,
      },
      {
        accessor: "_hidden",
        columnName: "delete",
        sequence: 12,
        componentType: "deleteRowCell",
        width: 120,
        isVisible: false,
      },

      // {
      //   accessor: "ALLOW_DELETE",
      //   columnName: "Action",
      //   buttonLabel: "Delete",
      //   sequence: 14,
      //   alignment: "center",
      //   componentType: "buttonRowCell",
      //   shouldExclude: (initialValue, original) => {
      //     if (original?.EDIT_STATUS && original?.EDIT_STATUS === "N") {

      //       return true;
      //     } else {
      //       if (original.ALLOW_DELETE && original?.ALLOW_DELETE !== "Y") {
      //         return true;
      //       } else {
      //         return false;
      //       }
      //     }
      //   },
      //   width: 90,
      //   minWidth: 60,
      //   maxWidth: 130,
      // },
    ],
  },
};
