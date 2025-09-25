import {
  getAgGridSRNo,
  handleDeleteButtonClick,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import {
  handleBlurMobNo,
  handleBlurRegFlag,
  handleBlurRegType,
  isEditable,
  isEmailFieldEditable,
  isMobileFieldEditable,
  validateEmail,
} from "./MetaDataHelper";

export const mobileRegMetaData = {
  GridMetaDataType: {
    gridLabel: "Mobile Registration",
  },
  columns: () => {
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
        name: "DISPLAY_REG_TYPE",
        accessor: "REG_TYPE",
        columnName: "regType",
        headerTooltip: "regType",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 130,
        maxWidth: 140,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        validationRun: "all",
        options: () => [
          { label: "Email", value: "E" },
          { label: "Mobile", value: "M" },
        ],
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["RegTypeIsRequired"] }],
        },
        isReadOnly: ({ node, context }) => {
          if (context?.gridContext?.mode === "edit" && !node.data?._isNewRow) {
            return true;
          }
          return false;
        },
        postValidationSetCrossAccessorValues: async (
          value,
          node,
          api,
          accessor,
          onValueChange,
          context
        ) =>
          handleBlurRegType(value, node, api, accessor, onValueChange, context),
      },
      {
        accessor: "MASKED_MOBILE_NO",
        columnName: "MobileNum",
        headerTooltip: "MobileNum",
        alignment: "right",
        minWidth: 100,
        maxWidth: 150,
        singleClickEdit: true,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
          isAllowed: ({ value }) => {
            if (value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        isReadOnly: ({ node, context }) =>
          isEditable(
            node.data,
            isMobileFieldEditable,
            context?.gridContext?.mode
          ),

        postValidationSetCrossAccessorValues: async (
          value,
          node,
          api,
          accessor,
          onValueChange,
          context
        ) =>
          await handleBlurMobNo(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context
          ),
      },
      {
        accessor: "REG_NO",
        columnName: "RegistrationNumber",
        headerTooltip: "RegistrationNumber",
        alignment: "right",
        minWidth: 130,
        maxWidth: 180,
        singleClickEdit: true,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        validationRun: "onChange",
        FormatProps: {
          allowAlphaNumeric: true,
          isAllowed: ({ value }) => {
            if (value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        isReadOnly: ({ node, context }) =>
          isEditable(
            node.data,
            isMobileFieldEditable,
            context?.gridContext?.mode
          ),
      },
      {
        name: "DISPLAY_EMAIL_TYPE",
        accessor: "EMAIL_TYPE",
        columnName: "EmailType",
        headerTooltip: "document",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 120,
        maxWidth: 140,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        options: () => [
          { label: "Internal (CC)", value: "I" },
          { label: "External (TO)", value: "E" },
        ],
        isReadOnly: ({ node, context }) =>
          isEditable(
            node.data,
            isEmailFieldEditable,
            context?.gridContext?.mode
          ),
      },
      {
        accessor: "E_MAIL_ID",
        columnName: "EmailiD",
        headerTooltip: "EmailiD",
        alignment: "left",
        minWidth: 300,
        maxWidth: 400,
        singleClickEdit: true,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        FormatProps: {
          allowAlphaNumeric: true,
          isAllowed: (values) => {
            if (values?.value?.length > 200) {
              return false;
            }

            return true;
          },
        },
        isReadOnly: ({ node, context }) =>
          isEditable(
            node.data,
            isEmailFieldEditable,
            context?.gridContext?.mode
          ),
        validate: validateEmail,
      },
      {
        accessor: "MOBILE_REG_FLAG",
        columnName: "Registered",
        headerTooltip: "Registered",
        alignment: "center",
        minWidth: 70,
        maxWidth: 100,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        isCheckBox: true,
        valueGetter: ({ data }) =>
          data?.MOBILE_REG_FLAG === "Y" || data?.MOBILE_REG_FLAG === true,
        valueSetter: ({ data, newValue }) => {
          data.MOBILE_REG_FLAG = newValue ? "Y" : "N";
          return true;
        },
        isReadOnly: (params) => {
          if (params.context?.gridContext?.mode === "view") {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossAccessorValues: async ({
          newValue,
          node,
          api,
          context,
        }) =>
          handleBlurRegFlag({
            newValue,
            node,
            api,
            context,
          }),
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 95,
        minWidth: 100,
        maxWidth: 100,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        keepOneRowOnDelete: false,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
          disabled: (params) => {
            if (params.context?.gridContext?.mode === "view") {
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
