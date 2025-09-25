import {
  getAgGridSRNo,
  handleDeleteButtonClick,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import {
  getEmpIdDDW,
  getOrnamentType,
  getOrnamentValue,
  getValuerTypeOp,
} from "./ornamentMetaDataHelper";
export const OrnamentColumn = {
  gridConfig: {
    gridLabel: "Ornament",
  },
  columns: ({ authState, AcctMSTState }) => {
    return [
      {
        minWidth: 60,
        maxWidth: 60,
        width: 60,
        displayComponentType: getAgGridSRNo,
        accessor: "LINE_ID",
        columnName: "SrNo",
        lockVisible: false,
        resizable: false,
        unSortIcon: false,
        filter: false,
        alignment: "left",
        isReadOnly: true,
        sortable: false,
      },
      { accessor: "SR_CD", isVisible: false },
      { accessor: "TRAN_CD", isVisible: false },
      {
        accessor: "ORN_TYPE",
        columnName: "Typereq",
        headerClass: "required",
        sequence: 2,
        alignment: "left",
        width: 200,
        minWidth: 180,
        maxWidth: 220,
        defaultValueKey: "test",
        componentType: "autocomplete",
        options: async () => await getOrnamentType(authState),
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["typeRequired"] }],
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          updateNodeDataAndFocus(node, {
            ORN_NAME: "",
            GROSS_WEIGHT: "",
            WEIGHT: "",
            CARET: "",
            MKT_RATE: "",
            MKT_VALUE: "",
            AMOUNT: "",
            VALUER_CD: "",
            EMP_ID: "",
          });
        },
        name: "DISPLAY_ORN_TYPE",
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "ORN_NAME",
        columnName: "Namereq",
        headerClass: "required",
        alignment: "left",
        sequence: 3,
        width: 180,
        minWidth: 150,
        maxWidth: 200,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Nameisrequired"] }],
        },
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
        FormatProps: {
          allowAlphaNumeric: true,
        },
      },
      {
        accessor: "NO_OF_ORN",
        columnName: "NoofQtyreq",
        headerClass: "required",
        alignment: "left",
        sequence: 3,
        width: 120,
        minWidth: 100,
        maxWidth: 150,
        componentType: "NumberFormat",
        singleClickEdit: true,
        sortable: false,
        FormatProps: {
          isNumber: true,
        },
        displayComponentType: "DisplayCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["NoofQtyreqis"] }],
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          await getOrnamentValue({
            node,
            api,
            value,
            context,
            authState,
            AcctMSTState,
            field,
          });
        },
        isReadOnly: (params) => {
          if (AcctMSTState?.NO_OF_ORN_VISIBLE === "N") {
            return true;
          } else if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "GROSS_WEIGHT",
        columnName: "WeightGross",
        sequence: 4,
        alignment: "right",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          decimalScale: 3,
          isAllowed: (values) => {
            if (values?.value?.length > 13) {
              return false;
            }
            return true;
          },
        },
        validate: ({ value, node, context, api }) => {
          if (value < (node?.data?.WEIGHT ?? "0")) {
            updateNodeDataAndFocus(node, { GROSS_WEIGHT: "" }, api, {
              focusedAccessor: "GROSS_WEIGHT",
              isFieldFocused: true,
            });
            return "Netweightshouldlessthanequaltogrossweight";
          }
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          if (value) {
            if (value < (node?.data?.WEIGHT ?? "0")) {
              api.stopEditing(true);
            }
          }
        },
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "WEIGHT",
        columnName: "Netname",
        sequence: 4,
        alignment: "right",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          decimalScale: 3,
          isAllowed: (values) => {
            if (values?.value?.length > 13) {
              return false;
            }
            return true;
          },
        },
        validate: ({ value, node, context, api }) => {
          const exists = node.data?.errors.some(
            (item) => item.field === "GROSS_WEIGHT"
          );
          if (value > (node?.data?.GROSS_WEIGHT ?? "0") && !exists) {
            updateNodeDataAndFocus(node, { WEIGHT: "" }, api, {
              focusedAccessor: "WEIGHT",
              isFieldFocused: true,
            });
            return "Netweightshouldlessthanequaltogrossweight";
          }
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          if (value) {
            if (value > (node?.data?.GROSS_WEIGHT ?? "0")) {
              api.stopEditing(true);

              return;
            } else {
              await getOrnamentValue({
                node,
                api,
                value,
                context,
                authState,
                AcctMSTState,
                field,
              });
            }
          }
        },
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "CARET",
        columnName: "Caret",
        sequence: 4,
        alignment: "right",
        width: 100,
        minWidth: 80,
        maxWidth: 120,
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
          isAllowed: (values) => {
            if (values?.value?.length > 2) {
              return false;
            }
            return true;
          },
        },
        componentType: "NumberFormat",
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplayCell",
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          await getOrnamentValue({
            node,
            api,
            value,
            context,
            authState,
            AcctMSTState,
            field,
          });
        },
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "MKT_RATE",
        columnName: "MarketRate",
        sequence: 4,
        alignment: "right",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          isAllowed: (values) => {
            if (values?.value?.length > 12) {
              return false;
            }
            return true;
          },
        },
        isReadOnly: (params) => {
          if (
            params?.data?.ACTIVE_VISIBLE === "Y" ||
            params?.data?.DISABLE_MKT_RATE_VALUE === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          await getOrnamentValue({
            node,
            api,
            value,
            context,
            authState,
            AcctMSTState,
            field,
          });
        },
      },
      {
        accessor: "MKT_VALUE",
        columnName: "MarketValue",
        sequence: 4,
        alignment: "right",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          isAllowed: (values) => {
            if (values?.value?.length > 13) {
              return false;
            }
            return true;
          },
        },
        isReadOnly: (params) => {
          if (
            params?.data?.ACTIVE_VISIBLE === "Y" ||
            params?.data?.DISABLE_MKT_RATE_VALUE === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        validate: ({ value, node, context, api }) => {
          const exists = node.data?.errors.some(
            (item) => item.field === "AMOUNT"
          );
          if (value < (node?.data?.AMOUNT ?? "0") && !exists) {
            updateNodeDataAndFocus(node, { MKT_VALUE: "" }, api, {
              focusedAccessor: "MKT_VALUE",
              isFieldFocused: true,
            });
            return "AmountshouldlessthanequaltoMarketValue";
          }
        },
      },
      {
        accessor: "AMOUNT",
        columnName: "AmountMargin",
        sequence: 4,
        alignment: "right",
        headerClass: "required",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["amountRequired"] }],
        },
        validate: ({ value, node, context, api }) => {
          if (value > (node?.data?.MKT_VALUE ?? "0")) {
            updateNodeDataAndFocus(node, { AMOUNT: "" }, api, {
              focusedAccessor: "AMOUNT",
              isFieldFocused: true,
            });
            return "AmountshouldlessthanequaltoMarketValue";
          }
        },
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "VALUER_CD",
        columnName: "Valuer",
        sequence: 2,
        alignment: "left",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "autocomplete",
        options: async () => await getValuerTypeOp(authState),
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        isOption: true,
        name: "DISPLAY_VALUER_CD",
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any,
          val: any
        ) => {
          if (node?.data?.VALUER_CD_OPT?.ACTIVE_FLAG === "N") {
            await context?.MessageBox({
              message: "Selectedvaluercodeinactive",
              messageTitle: "ValidationFailed",
              icon: "ERROR",
            });
            updateNodeDataAndFocus(node, { VALUER_CD: "" }, api, {
              focusedAccessor: "VALUER_CD",
              isFieldFocused: true,
            });
          }
        },
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "EMP_ID",
        columnName: "EmpName",
        sequence: 2,
        alignment: "left",
        width: 200,
        minWidth: 180,
        maxWidth: 220,
        componentType: "autocomplete",
        options: async () => await getEmpIdDDW(authState),
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        name: "DISPLAY_EMP_ID",
        isReadOnly: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "ACTIVE",
        columnName: "Active",
        headerTooltip: "Active",
        alignment: "center",
        minWidth: 70,
        maxWidth: 100,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        isCheckBox: true,
        __VIEW__: { isReadOnly: true },
        shouldExclude: (params) => {
          if (params?.data?.ACTIVE_VISIBLE === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "delete",
        sequence: 8,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        keepOneRowOnDelete: false,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
          disabled: (params) => {
            if (
              params.context?.gridContext?.mode === "view" ||
              params?.data?.ACTIVE_VISIBLE === "Y"
            ) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
    ];
  },
};
