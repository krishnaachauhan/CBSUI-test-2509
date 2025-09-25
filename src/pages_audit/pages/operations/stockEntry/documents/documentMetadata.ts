import { MasterDetailsMetaData } from "@acuteinfo/common-base";
export const stockViewEditMSTMetaData = {
  masterForm: {
    form: {
      name: "Upload-View-doc",
      label: "UploadViewDocument",
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
    fields: [
      {
        render: {
          componentType: "hidden",
        },
        name: "BRANCH_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACCT_TYPE",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACCT_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACCT_NM",
      },

      {
        render: {
          componentType: "amountField",
        },
        name: "TRAN_BAL",
        label: "Balance",
        fullWidth: true,
        isReadOnly: true,
        FormatProps: {
          allowNegative: true,
        },
        textFieldStyle: {
          "& .MuiInputBase-input": {
            color: "rgb(255, 0, 0) !important",
            "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
          },
        },
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },

      {
        render: {
          componentType: "textField",
        },
        fullWidth: true,
        name: "DESCRIPTION",
        label: "Security",
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 4,
          lg: 4,
          xl: 4,
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "SECURITY_CD",
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "ACCT_MST_LIMIT",
        fullWidth: true,
        label: "AccountLimitAmt",
        FormatProps: {
          allowNegative: true,
        },
        textFieldStyle: {
          "& .MuiInputBase-input": {
            color: "rgb(255, 0, 0) !important",
            "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
          },
        },
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      {
        render: {
          componentType: "datePicker",
        },
        fullWidth: true,
        name: "TRAN_DT",
        isReadOnly: true,
        label: "StatementDate",
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },

      {
        render: {
          componentType: "datePicker",
        },
        name: "ASON_DT",
        fullWidth: true,
        isReadOnly: true,
        label: "StatementValidTillDate",
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      {
        render: {
          componentType: "datePicker",
        },
        fullWidth: true,
        name: "WITHDRAW_DT",
        isReadOnly: true,
        label: "Withdraw Date",
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "SCRIPT_CD",
        fullWidth: true,
        label: "Script",
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 4,
          lg: 4,
          xl: 4,
        },
      },

      {
        render: {
          componentType: "numberFormat",
        },
        name: "NO_OF_SHARE",
        fullWidth: true,
        label: "NoOfShare",
        isReadOnly: true,
        textFieldStyle: {
          "& .MuiInputBase-input": {
            textAlign: "right",
          },
        },
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
      },

      {
        render: {
          componentType: "numberFormat",
        },
        name: "STOCK_VALUE",
        fullWidth: true,
        label: "StockValue",
        isReadOnly: true,
        textFieldStyle: {
          "& .MuiInputBase-input": {
            textAlign: "right",
          },
        },
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "NET_VALUE",
        fullWidth: true,
        label: "Net value",
        textFieldStyle: {
          "& .MuiInputBase-input": {
            textAlign: "right",
          },
        },
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
      },

      {
        render: {
          componentType: "rateOfInt",
        },
        name: "MARGIN",
        fullWidth: true,
        label: "Margin",
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "STOCK_DESC",
        label: "StockDescription",
        fullWidth: true,
        isReadOnly: true,
        GridProps: {
          xs: 12,
          md: 4,
          sm: 5,
          lg: 4,
          xl: 4,
        },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        fullWidth: true,
        name: "DRAWING_POWER",
        label: "DrawingPower",
        textFieldStyle: {
          "& .MuiInputBase-input": {
            textAlign: "right",
          },
        },
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "REMARKS",
        fullWidth: true,
        label: "Remarks",
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 4,
          lg: 4,
          xl: 4,
        },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "RECEIVED_DT",
        label: "RecievedDate",
        fullWidth: true,
        isReadOnly: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },

      {
        render: {
          componentType: "hidden",
        },
        name: "TRAN_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ENTERED_COMP_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ENTERED_BRANCH_CD",
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Document Detail",
      rowIdColumn: "SR_CD",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: true,
      hideHeader: true,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "29vh", max: "29vh" },
      allowRowSelection: false,
      hiddenFlag: "_hidden",
      disableLoader: false,
      // paginationText: "Configured Messages",
    },
    columns: [
      {
        accessor: "SR_CDZ",
        columnName: "SrNo",
        componentType: "default",
        sequence: 1,
        alignment: "center",
        width: 75,
        minWidth: 50,
        maxWidth: 100,
        isAutoSequence: true,
      },
      {
        accessor: "DOC_DEC",
        columnName: "DocumentDescription",
        componentType: "editableTextField",
        placeholder: " ",
        sequence: 2,
        alignment: "left",
        width: 300,
        minWidth: 200,
        maxWidth: 400,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["This field is required"] }],
        },
        // isReadOnly: true,
        // __EDIT__: { isReadOnly: false, componentType: "editableTextField" },
      },
      {
        accessor: "ACTIVE",
        columnName: "Active",
        componentType: "editableCheckbox",
        alignment: "center",
        // defaultValue: "Y",
        isReadOnly: true,
        sequence: 2,
        width: 80,
        minWidth: 70,
        maxWidth: 120,
      },
      {
        accessor: "DOC_DATA",
        columnName: "DocumentImage",
        componentType: "icondefault",
        sequence: 2,
        alignment: "center",
        width: 140,
        maxWidth: 180,
        minWidth: 90,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
        },
      },

      {
        columnName: "Scan",
        componentType: "buttonRowCell",
        accessor: "SCAN",
        alignment: "center",
        buttonLabel: "",
        sequence: 3,
        width: 100,
        maxWidth: 180,
        minWidth: 90,
        isVisible: true,
        isVisibleInNew: true,
        shouldExclude: (initialValue, original) => {
          if (original?.DOC_DEC && Boolean(original?._isNewRow)) {
            return false;
          }
          return true;
        },
      },
      {
        columnName: "Upload",
        componentType: "buttonRowCell",
        accessor: "UPLOAD_DOC",
        alignment: "center",
        buttonLabel: "",
        sequence: 3,
        width: 100,
        maxWidth: 180,
        minWidth: 90,
        isVisible: true,
        isVisibleInNew: true,
        shouldExclude: (initialValue, original) => {
          if (original?.DOC_DEC && Boolean(original?._isNewRow)) {
            return false;
          }
          return true;
        },
      },
      {
        columnName: "View",
        componentType: "buttonRowCell",
        accessor: "VIEW_DOC",
        alignment: "center",
        buttonLabel: "",
        sequence: 3,
        width: 100,
        maxWidth: 180,
        minWidth: 90,
        isVisible: true,
        isVisibleInNew: true,
        shouldExclude: (initialValue, original) => {
          if (original?.DOC_DATA) {
            return false;
          }
          return true;
        },
      },
      {
        columnName: "Download",
        componentType: "buttonRowCell",
        accessor: "DOWNLOAD",
        alignment: "center",
        buttonLabel: "Download",
        sequence: 3,
        width: 100,
        maxWidth: 220,
        minWidth: 90,
        isVisible: true,
        isVisibleInNew: true,
        shouldExclude: (initialValue, original) => {
          if (original?.DOC_DATA) {
            return false;
          }
          return true;
        },
      },
      {
        columnName: "Action",
        buttonLabel: "Delete",
        componentType: "deleteRowCell",
        accessor: "_hidden",
        sequence: 3,
        width: 90,
        alignment: "center",
        maxWidth: 120,
        minWidth: 90,
        shouldExclude: (initialValue, original) => {
          if (Boolean(original?._isNewRow)) {
            return false;
          }
          return true;
        },
      },
    ],
  },
};
