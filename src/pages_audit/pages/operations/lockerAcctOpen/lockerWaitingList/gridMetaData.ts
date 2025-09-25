import { validateChequeDate } from "utils/helper";
import { getAgGridSRNo } from "components/agGridTable/utils/helper";
import {
  handleCrossAccessorPostValidation,
  validateField,
} from "./metaDataHelper";

export const gridMetadata = {
  gridConfig: {
    gridLabel: "Locker Waiting List",
  },
  columns: (authState, gridRef, defaultMode, MessageBox, handleDelete) => {
    return [
      {
        minWidth: 70,
        maxWidth: 70,
        width: 70,
        displayComponentType: getAgGridSRNo,
        columnName: "Sr.No.",
        lockVisible: false,
        resizable: false,
        unSortIcon: false,
        filter: false,
        alignment: "right",
        isReadOnly: true,
        sortable: false,
      },
      {
        isCheckBox: true,
        accessor: "ALLOTED",
        columnName: "Alloted",
        headerTooltip: "Alloted",
        sortable: false,
        alignment: "right",
        minWidth: 90,
        maxWidth: 90,
        width: 90,
        isReadOnly: (params) => {
          const allowEdit = params?.data?.ALLOW_EDIT;
          const isNewRow = params?.node?.data?.isNewRow;

          return allowEdit === "N" || isNewRow === true;
        },
        singleClickEdit: true,
        cellEditorParams: {
          useFormatter: true,
        },
        postValidationSetCrossAccessorValues: (params) => {
          params.node.setData({
            ...params.node.data,
            ALLOTED: params.newValue,
          });
        },
        cellRendererSelector: (params) => {
          const isPinned = params.node?.rowPinned;
          const isNewRow = params.node?.data?.isNewRow;

          if (!isPinned && !isNewRow) {
            return { component: "agCheckboxCellRenderer" };
          }
          return (params) => "";
        },

        cellEditorSelector: (params) => {
          if (!params.node?.data?.isNewRow) {
            return {
              component: "agCheckboxCellEditor",
              params: { useFormatter: true },
            };
          }
          return null;
        },
      },
      {
        accessor: "TRAN_DT",
        columnName: "Entry Date",
        alignment: "left",
        dateFormat: "dd/MM/yyyy",
        minWidth: 110,
        maxWidth: 110,
        width: 110,
        displayComponentType: "DisplayDateCell",
        isReadOnly: true,
        componentType: "DatePickerCell",
        validate: validateChequeDate,
        sortable: false,
      },
      {
        accessor: "CUSTOMER_ID",
        columnName: "Customer Id",
        sortable: false,
        alignment: "right",
        minWidth: 140,
        maxWidth: 140,
        width: 140,
        isReadOnly: (params) => {
          if (!params || !params?.data) {
            return false;
          }
          const isAllotedPresent = Object.prototype.hasOwnProperty.call(
            params?.data,
            "ALLOTED"
          );
          if (!isAllotedPresent) {
            return false;
          } else if (
            params?.data?.ALLOTED === true &&
            params?.data?.ALLOW_EDIT === "Y"
          ) {
            return true;
          } else if (params?.data?.ALLOW_EDIT !== "N") {
            return false;
          } else {
            return true;
          }
        },
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        componentType: "NumberFormat",
        FormatProps: {
          isNumber: true,
          isAllowed: (values) => {
            if (values?.value?.length > 12) {
              return false;
            }
            return true;
          },
        },
        postValidationSetCrossAccessorValues: (value, node, api) =>
          handleCrossAccessorPostValidation({
            value,
            node,
            api,
            accessor: "CUSTOMER_ID",
            authState,
            MessageBox,
          }),
      },
      {
        accessor: "ID_CUST_NM",
        columnName: "Name",
        sortable: false,
        alignment: "left",
        minWidth: 200,
        maxWidth: 230,
        width: 200,
        singleClickEdit: true,
        isReadOnly: (params) => {
          const { ALLOW_EDIT, ALLOTED, CUSTOMER_ID } = params?.data || {};
          return !(ALLOW_EDIT === "Y" && ALLOTED !== true && !CUSTOMER_ID);
        },
        displayComponentType: "DisplayCell",
        componentType: "NumberFormat",
        FormatProps: {
          allowAlphaNumeric: true,
          isAllowed: (values) => {
            if (values?.value?.length > 100) {
              return false;
            }
            return true;
          },
        },
        validate: (params) => validateField(params, "ID_CUST_NM"),
        headerClass: "required",
      },
      {
        accessor: "ID_CONTACT2",
        columnName: "Mobile No",
        alignment: "left",
        minWidth: 130,
        maxWidth: 130,
        width: 130,
        sortable: false,
        singleClickEdit: true,
        isReadOnly: (params) => {
          const { ALLOW_EDIT, ALLOTED, CUSTOMER_ID } = params?.data || {};
          return !(ALLOW_EDIT === "Y" && ALLOTED !== true && !CUSTOMER_ID);
        },
        shouldExclude: (params) => {
          const error =
            params.node.data?.errors?.[params.node.rowIndex]?.field ===
            "ID_CONTACT2";
          if (params?.data?.TRAN_CD || error) {
            return false;
          } else if (
            (!params?.data?.ID_CONTACT2 && params?.data?.TRAN_CD) ||
            error
          ) {
            return true;
          } else {
            return false;
          }
        },
        displayComponentType: "DisplayCell",
        componentType: "NumberFormat",
        FormatProps: {
          isNumber: true,

          isAllowed: (values) => {
            if (values?.value?.length > 18) {
              return false;
            }
            return true;
          },
        },
        validate: (params) => validateField(params, "ID_CONTACT2"),
        headerClass: "required",
      },
      {
        accessor: "ID_ADDRESS",
        columnName: "Address",
        alignment: "left",
        sortable: false,
        minWidth: 200,
        maxWidth: 480,
        width: 450,
        flex: 1,
        singleClickEdit: true,
        isReadOnly: (params) => {
          const { ALLOW_EDIT, ALLOTED, CUSTOMER_ID } = params?.data || {};
          return !(ALLOW_EDIT === "Y" && ALLOTED !== true && !CUSTOMER_ID);
        },
        displayComponentType: "DisplayCell",
        componentType: "NumberFormat",
        FormatProps: {
          allowAlphaNumeric: true,
          isAllowed: (values) => {
            if (values?.value?.length > 1000) {
              return false;
            }
            return true;
          },
        },
        validate: (params) => validateField(params, "ID_ADDRESS"),
        headerClass: "required",
      },
      {
        accessor: "REMARKS",
        columnName: "Remark",
        alignment: "left",
        sortable: false,
        minWidth: 200,
        maxWidth: 480,
        width: 450,
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        componentType: "NumberFormat",
        FormatProps: {
          allowAlphaNumeric: true,
          isAllowed: (values) => {
            if (values?.value?.length > 1000) {
              return false;
            }
            return true;
          },
        },
        isReadOnly: (params) => {
          const { ALLOW_EDIT, ALLOTED } = params?.data || {};
          return !(ALLOW_EDIT === "Y" && ALLOTED !== true);
        },
        shouldExclude: (params) => {
          const { REMARKS, ALLOW_EDIT } = params?.data || {};
          return !REMARKS && ALLOW_EDIT === "N";
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Remove",
        headerTooltip: "Remove",
        alignment: "center",
        sortable: false,
        displayComponentType: "CustomButtonCellEditor",
        minWidth: 100,
        maxWidth: 110,
        width: 100,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        shouldExclude: (params) => {
          if (
            params?.data?.ALLOTED === true &&
            params?.data?.ALLOW_EDIT === "N"
          ) {
            return true;
          } else if (params?.data?.ALLOTED === true) {
            return true;
          } else if (params?.data?.ALLOW_EDIT === "N") {
            return true;
          } else {
            return false;
          }
        },
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDelete,
        },
      },
    ];
  },
};
