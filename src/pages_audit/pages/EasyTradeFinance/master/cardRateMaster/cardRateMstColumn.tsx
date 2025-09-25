import { ColDef } from "ag-grid-community";
import { getAgGridSRNo, handleDeleteButtonClick } from "@acuteinfo/common-base";
import { validateChequeDate } from "utils/helper";
import * as API from "./api";
import {
  handleBlurCurrency,
  handleBlurCardCal,
} from "./cardRateMstColumnHelper";

export interface cardRateMstColumnType {
  gridConfig: {
    gridLabel: string;
  };
  columns: (...args: any[]) => ColDef[];
}
export const cardRateMstColumn: cardRateMstColumnType = {
  gridConfig: {
    gridLabel: "Card Rate",
  },
  columns: ({ authState }) => {
    return [
      {
        columnName: "Sr.",
        headerTooltip: "Sr.No.",
        lockVisible: true,
        width: 70,
        resizable: false,
        unSortIcon: false,
        filter: false,
        pinned: "left",
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
      },
      { accessor: "TRAN_DT", isVisible: false },
      {
        accessor: "TRAN_DT",
        columnName: "Date",
        headerTooltip: "Date",
        sequence: 2,
        alignment: "left",
        minWidth: 150,
        maxWidth: 200,
        isReadOnly: false,
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["DateRequired"] }],
        },
        validate: validateChequeDate,
      },
      {
        accessor: "CURR_CD",
        columnName: "Currency",
        sequence: 3,
        alignment: "left",
        headerClass: "required",
        width: 100,
        minWidth: 100,
        maxWidth: 150,
        componentType: "autocomplete",
        sortable: true,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        options: (data) => {
          return API.getCurrencyList({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
          });
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const selectedType =
            value && typeof value === "object"
              ? value?.value?.trim?.() ?? ""
              : String(value ?? "").trim(); //
          await node.setData({
            ...node.data,
            currency: selectedType,
          });
          handleBlurCurrency(
            selectedType,
            node,
            api,
            field,
            onValueChange,
            context,
            {},
            {},
            authState,
            null
          );
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Please enter Currency"] }],
        },
        name: "CURR_CD",
      },
      {
        accessor: "CCY_RATE",
        columnName: "Inter Bank",
        headerTooltip: "Inter Bank Rate",
        headerClass: "required",
        alignment: "right",
        sequence: 4,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [
            { name: "required", params: ["Please enter Inter Bank Rate"] },
          ],
        },
      },
      {
        accessor: "CROSS_RATE",
        columnName: "CrossRate",
        headerTooltip: "CrossRate",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          handleBlurCardCal(
            value,
            node,
            api,
            field,
            onValueChange,
            context,
            {},
            {},
            authState,
            null
          );
        },

        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Cross Rate"] }],
        },
      },
      {
        accessor: "STT",
        columnName: "Sell TT",
        headerTooltip: "Sell TT",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Sell TT"] }],
        },
      },
      {
        accessor: "S_CCY",
        columnName: "Sell BC",
        headerTooltip: "Sell BC",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Sell BC"] }],
        },
      },
      {
        accessor: "STC",
        columnName: "Sell TC",
        headerTooltip: "Sell TC",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Sell TC"] }],
        },
      },
      {
        accessor: "BTT",
        columnName: "Buy TT",
        headerTooltip: "Buy TT",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Buy TT"] }],
        },
      },
      {
        accessor: "B_CCY",
        columnName: "Buy BC",
        headerTooltip: "Buy BC",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Buy BC"] }],
        },
      },
      {
        accessor: "BTC",
        columnName: "Buy TC",
        headerTooltip: "Buy TC",
        headerClass: "required",
        alignment: "right",
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        cellRendererParams: {
          decimalCount: 6,
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          decimalScale: 6,
        },
        schemaValidation: {
          type: "number",
          rules: [{ name: "required", params: ["Please enter Buy TC"] }],
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Remove",
        headerTooltip: "Remove",
        sequence: 8,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        minWidth: 120,
        maxWidth: 200,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
      },
    ];
  },
};
