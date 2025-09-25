import { getAgGridSRNo } from "components/agGridTable/utils/helper";
import * as API from "../../api";
import { handleBlurUpdFlag } from "./updateCategoryGridHelper";
import { allowNumberLength } from "utils/helper";

export const CategoryGridMetaData = {
  GridMetaDataType: {
    gridLabel: "Documents",
  },
  columns: () => {
    return [
      {
        columnName: "Sr.",
        alignment: "left",
        width: 80,
        minWidth: 80,
        maxWidth: 100,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        accessor: "COMBINED_ACCT_NO",
        columnName: "AcctNum",
        headerTooltip: "AcctNum",
        alignment: "left",
        minWidth: 200,
        maxWidth: 250,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        FormatProps: {
          isCurrencySymbol: false,
          uppercase: true,
          allowAlphaNumeric: true,
        },
      },
      {
        name: "DISPLAY_OLD_CATEG_CD",
        accessor: "OLD_CATEG_CD",
        columnName: "OldCategory",
        headerTooltip: "OldCategory",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 120,
        maxWidth: 140,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        isReadOnly: true,
        options: async ({ context }) => {
          return await API.getCIFCategories({
            COMP_CD: context?.gridContext?.authState?.companyID ?? "",
            BRANCH_CD: context?.gridContext?.authState?.user?.branchCode ?? "",
            ENTITY_TYPE: context?.gridContext?.ENTITY_TYPE ?? "",
          });
        },
      },
      {
        accessor: "UPD_FLAG",
        columnName: "",
        headerTooltip: "",
        alignment: "center",
        minWidth: 50,
        maxWidth: 60,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        isReadOnly: ({ node, context }) => {
          const visibleFlag = node?.["APIDATA"]?.VISIBLE_UPD_FLAG;
          const newCategoryCode = context.gridContext?.categCD?.value;
          return visibleFlag === "N" || !newCategoryCode;
        },
        isCheckBox: true,
        postValidationSetCrossAccessorValues: async ({
          newValue,
          node,
          api,
          accessor,
          onValueChange,
          context,
        }) =>
          await handleBlurUpdFlag({
            newValue,
            node,
            api,
            accessor,
            onValueChange,
            context,
          }),
      },
      {
        columnName: "InterestRate",
        children: [
          {
            accessor: "OLD_INT_RATE",
            columnName: "Old",
            headerTooltip: "OldInterestRate",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
              isAllowed: allowNumberLength,
            },
            isReadOnly: true,
          },
          {
            accessor: "NEW_INT_RATE",
            columnName: "New",
            headerTooltip: "NewInterestRate",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
              isAllowed: allowNumberLength,
            },
            isReadOnly: ({ node }) => {
              const { DISABLE_INT_RATE } = node.data?.["APIDATA"] || {};

              if (DISABLE_INT_RATE === "N") {
                return false;
              }
              return true;
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_INT_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_INT_RT === "Y") {
                return false;
              }
              return true;
            },
          },
        ],
      },
      {
        columnName: "AgainstClearing",
        children: [
          {
            accessor: "OLD_AG_CL_RATE",
            columnName: "Old",
            headerTooltip: "OldAgainstClearing",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            isReadOnly: true,
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_AGCLR_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_AGCLR_RT === "Y") {
                return false;
              }
              return true;
            },
          },
          {
            accessor: "NEW_AG_CL_RATE",
            columnName: "New",
            headerTooltip: "NewAgainstClearing",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
              isAllowed: allowNumberLength,
            },
            isReadOnly: ({ node }) => {
              let isDisabled = node.data?.["APIDATA"]?.DISABLE_AGCLR_RATE;
              if (isDisabled === "N") {
                return false;
              } else {
                return true;
              }
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_AGCLR_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_AGCLR_RT === "Y") {
                return false;
              }
              return true;
            },
          },
        ],
      },
      {
        columnName: "PenalRate",
        children: [
          {
            accessor: "OLD_PENAL_RATE",
            columnName: "Old",
            headerTooltip: "OldPenalRate",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            isReadOnly: true,
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_PENAL_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_PENAL_RT === "Y") {
                return false;
              }
              return true;
            },
          },
          {
            accessor: "NEW_PENAL_RATE",
            columnName: "New",
            headerTooltip: "NewPenalRate",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
              isAllowed: allowNumberLength,
            },
            isReadOnly: ({ node }) => {
              let isDisabled = node.data?.["APIDATA"]?.DISABLE_PENAL;
              if (isDisabled === "N") {
                return false;
              } else {
                return true;
              }
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_PENAL_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_PENAL_RT === "Y") {
                return false;
              }
              return true;
            },
          },
        ],
      },
      {
        columnName: "InsExpPanel",
        children: [
          {
            accessor: "OLD_INS_EXPIRY_PENAL_RATE",
            columnName: "Old",
            headerTooltip: "OldInsExpPanel",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            isReadOnly: true,
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_INSU_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_INSU_RT === "Y") {
                return false;
              }
              return true;
            },
          },
          {
            accessor: "NEW_INS_EXPIRY_PENAL_RATE",
            columnName: "New",
            headerTooltip: "NewInsExpPanel",
            headerClass: "required",
            alignment: "right",
            minWidth: 80,
            maxWidth: 100,
            componentType: "amountField",
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
              isAllowed: allowNumberLength,
            },
            isReadOnly: ({ node }) => {
              let isDisabled = node.data?.["APIDATA"]?.DISABLE_INSU_PEN_RATE;
              if (isDisabled === "N") {
                return false;
              } else {
                return true;
              }
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_INSU_RT } = node.data?.["APIDATA"] || {};

              if (VISIBLE_INSU_RT === "Y") {
                return false;
              }
              return true;
            },
          },
        ],
      },
      {
        columnName: "EMI",
        children: [
          {
            accessor: "OLD_INST_RS",
            columnName: "Old",
            headerTooltip: "OldEMI",
            headerClass: "required",
            alignment: "right",
            minWidth: 100,
            maxWidth: 200,
            componentType: "amountField",
            isReadOnly: true,
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_INST_RS } = node.data?.["APIDATA"] || {};

              if (VISIBLE_INST_RS === "Y") {
                return false;
              }
              return true;
            },
          },
          {
            accessor: "NEW_INST_RS",
            columnName: "New",
            headerTooltip: "NewEMI",
            headerClass: "required",
            alignment: "right",
            minWidth: 100,
            maxWidth: 200,
            componentType: "amountField",
            displayComponentType: "DisplayCurrencyCell",
            cellClass: "currency",
            FormatProps: {
              isCurrencySymbol: false,
              isNumber: true,
              allowNegative: false,
              isAllowed: (val) => allowNumberLength(val, 999999999999),
            },
            isReadOnly: ({ node }) => {
              let isDisabled = node?.data?.["APIDATA"]?.DISABLE_INST_RS;
              if (isDisabled === "N") {
                return false;
              } else {
                return true;
              }
            },
            shouldExclude: ({ node }) => {
              const { VISIBLE_INST_RS } = node.data?.["APIDATA"] || {};

              if (VISIBLE_INST_RS === "Y") {
                return false;
              }
              return true;
            },
          },
        ],
      },
    ];
  },
};
