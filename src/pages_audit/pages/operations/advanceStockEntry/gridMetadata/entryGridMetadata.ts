import { getAgGridSRNo } from "components/agGridTable/utils/helper";
import { getLimitSecDTL } from "../api";
import { ICellEditorParams } from "ag-grid-community";

export const entryGridMetadata = {
  GridMetaDataType: {
    gridLabel: "",
  },
  columns: ({ authState, formState, gridApiRef }) => {
    return [
      {
        columnName: "Sr.",
        alignment: "left",
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        accessor: "GOOD_SR_CD",
        headerTooltip: "Description",
        columnName: "Description",
        alignment: "left",
        headerClass: "required",
        componentType: "autocomplete",
        minWidth: 200,
        maxWidth: 300,
        isOption: true,
        singleClickEdit: true,
        isReadOnly: true,
        displayComponentType: "DisplaySelectCell",

        options: async () =>
          await getLimitSecDTL({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            SECURITY_CD: formState?.securityCd ?? "",
          }),
        name: "INSURANCE_TYPE_CD_ID",
      },

      {
        accessor: "STOCK_AMT",
        columnName: "StockValue",
        sequence: 3,
        alignment: "right",
        headerClass: "required",
        width: 180,
        minWidth: 180,
        maxWidth: 200,
        singleClickEdit: true,
        sortable: false,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",

        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const stock_amt = node?.data?.STOCK_AMT || 0;
          const margin_perc = parseFloat(node?.data?.MARGIN_PERC) || 0;

          const dp_amt = stock_amt - (stock_amt * margin_perc) / 100;
          if (margin_perc) {
            node.setData({
              ...node.data,
              DP_AMT: dp_amt,
            });
          } else {
            node.setData({
              ...node.data,
              DP_AMT: value,
            });
          }
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
        },
        isReadOnly: (params) => {
          return formState?.formMode !== "new";
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseEnterStockValue"] }],
        },
      },
      {
        accessor: "MARGIN_PERC",
        columnName: "Margin",
        sequence: 3,
        alignment: "right",
        width: 100,
        minWidth: 100,
        maxWidth: 130,
        singleClickEdit: true,
        sortable: false,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
        },
        validate: (param: ICellEditorParams) => {
          const { value } = param;

          if (value < 0 || value > 100) {
            return "margin_out_of_range_error";
          } else {
            return "";
          }
        },

        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const stock_amt = node?.data?.STOCK_AMT || 0;
          const margin_perc = parseFloat(value) || 0;

          const dp_amt = stock_amt - (stock_amt * margin_perc) / 100;

          node.setData({
            ...node.data,
            DP_AMT: dp_amt,
          });
        },
        isReadOnly: (params) => {
          return formState?.formMode !== "new";
        },
      },
      {
        accessor: "DP_AMT",
        columnName: "DrawingPower",
        sequence: 3,
        alignment: "right",
        headerClass: "required",
        width: 180,
        minWidth: 180,
        maxWidth: 200,
        sortable: false,
        singleClickEdit: true,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",

        isReadOnly: (params) => {
          return (
            formState?.screenPara?.[0]?.IS_READ_ONLY === "Y" ||
            formState?.formMode !== "new"
          );
        },

        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const stock_amt = parseFloat(node?.data?.STOCK_AMT) || 0;

          const recalculated_margin = stock_amt
            ? Math.round(((stock_amt - value) * 100) / stock_amt)
            : 0;

          node.setData({
            ...node.data,
            MARGIN_PERC: parseFloat(recalculated_margin.toFixed(2)),
          });
        },

        validate: (param: ICellEditorParams) => {
          const { value, node } = param;
          const stock_amt = parseFloat(node?.data?.STOCK_AMT) || 0;
          if (value > stock_amt) {
            return "dp_exceeds_stock_error";
          } else return "";
        },
      },
      {
        accessor: "REMARKS",
        columnName: "Remark",
        alignment: "left",
        singleClickEdit: true,
        width: 300,
        minWidth: 300,
        maxWidth: 400,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        FormatProps: {
          allowAlphaNumeric: true,
        },
        isReadOnly: (params) => {
          return formState?.formMode !== "new";
        },
      },
    ];
  },
};
