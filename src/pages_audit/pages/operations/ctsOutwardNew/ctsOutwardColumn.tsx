import { ColDef } from "ag-grid-community";
import { handleBlurBankCode, handleBlurPayee } from "./ctsOutwardColumnHelper";
import { handleDeleteButtonClick } from "@acuteinfo/common-base";
import { validateChequeDate } from "utils/helper";
import { getAgGridSRNo } from "components/agGridTable/utils/helper";

export interface CtsOutwardColumnType {
  gridConfig: {
    gridLabel: string;
  };
  columns: (...args: any[]) => ColDef[];
}
export const CtsOutwardColumn: CtsOutwardColumnType = {
  gridConfig: {
    gridLabel: "Cheque Details",
  },
  columns: (
    formState,
    authState,
    setOpenAddBankForm,
    setBankData,
    setCurrentRowIndex,
    defaultView
  ) => {
    return [
      {
        columnName: "Sr.",
        headerTooltip: "Sr.No.",
        width: 40,
        maxWidth: 40,
        minWidth: 40,

        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      { accessor: "CHQ_MICR_VISIBLE", isVisible: false },
      { accessor: "PAYEE_AC_MANDATORY", isVisible: false },
      { accessor: "TRAN_DT", isVisible: false },
      { accessor: "RANGE_DT", isVisible: false },
      {
        accessor: "CHEQUE_NO",
        columnName: "ChequeNo",
        headerTooltip: "ChequeNo",
        headerClass: "required",
        sequence: 2,
        minWidth: 80,
        // width: 50,
        maxWidth: 80,
        componentType: "NumberFormat",
        addNewRow: true,
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
          isAllowed: (values) => {
            if (values?.value?.length > 6) {
              return false;
            }

            return true;
          },
        },
        sortable: false,
        displayComponentType: "DisplayCell",
        singleClickEdit: true,
        alignment: "right",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["ChequeNorequired"] }],
        },
      },
      {
        accessor: "BANK_CD",
        columnName: "BankCode",
        headerTooltip: "BankCode",
        headerClass: "required",
        alignment: "left",
        sequence: 3,
        // width: 150,
        minWidth: 70,
        maxWidth: 80,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        sortable: false,
        postValidationSetCrossAccessorValues: (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any,
          dependentaccessorsValues: any
        ) =>
          handleBlurBankCode(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            dependentaccessorsValues,
            formState,
            authState,
            setOpenAddBankForm,
            setBankData,
            setCurrentRowIndex
          ),

        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          isAllowed: (values) => {
            if (values?.value?.length > 10) {
              return false;
            }
            return true;
          },
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["BankCodeRequired"] }],
        },
      },
      {
        accessor: "BANK_NM",
        columnName: "BankName",
        headerTooltip: "BankName",
        sequence: 4,
        alignment: "left",
        sortable: false,
        minWidth: 200,
        maxWidth: 270,
        isReadOnly: true,
        displayComponentType: "DisplayCell",
      },
      {
        accessor: "errors",
        isVisible: false,
      },
      {
        accessor: "disableChequeDate",
        isVisible: false,
      },
      {
        accessor: "ECS_SEQ_NO",
        columnName: "PayeeACNo",
        headerTooltip: "PayeeACNo",
        sequence: 5,
        alignment: "right",
        sortable: false,
        minWidth: 98,
        maxWidth: 120,
        isReadOnly: false,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        cellClass: "currency",
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any,
          dependentaccessorsValues: any
        ) =>
          handleBlurPayee(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            dependentaccessorsValues
          ),
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          isAllowed: (values) => {
            if (values?.value?.length > 6) {
              return false;
            }
            return true;
          },
        },

        validate: (params) => {
          const allaccessor = params.node?.data || {};

          if (allaccessor.PAYEE_AC_MANDATORY === "Y" && !params.value) {
            return "PayeeACNorequired";
          }
          return "";
        },
      },
      {
        accessor: "CHEQUE_DATE",
        columnName: "ChequeDate",
        headerTooltip: "ChequeDate",
        sequence: 6,
        alignment: "left",
        sortable: false,
        minWidth: 95,
        maxWidth: 120,
        isReadOnly: false,
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["ChequeDateRequired"] }],
        },

        validate: validateChequeDate,
      },
      {
        accessor: "BRANCH",
        columnName: "Description",
        headerTooltip: "Description",
        alignment: "left",
        minWidth: 120,
        maxWidth: 200,
        sortable: false,
        displayComponentType: "DisplayCell",
        componentType: "NumberFormat",
      },
      {
        accessor: "CHQ_MICR_CD",
        columnName: "CHQMicr",
        headerTooltip: "CHQMicr",
        alignment: "left",
        minWidth: 70,
        maxWidth: 70,
        sortable: false,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: true,
          isAllowed: (values) => {
            if (values?.value?.length > 2) {
              return false;
            }
            return true;
          },
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["CHQMicrRequired"] }],
        },
      },
      {
        accessor: "ECS_USER_NO",
        columnName: "PayeeName",
        headerTooltip: "PayeeName",
        headerClass: "required",
        alignment: "left",
        sortable: false,
        minWidth: 190,
        width: 210,
        maxWidth: 270,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PayeeNameRequired"] }],
        },
      },
      {
        accessor: "AMOUNT",
        columnName: "ChequeAmount",
        headerTooltip: "ChequeAmount",
        headerClass: "required",
        alignment: "right",
        sortable: false,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Remove",
        headerTooltip: "Remove",
        sequence: 8,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        sortable: false,
        minWidth: 120,
        maxWidth: 200,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        // pinned: "right",
        cellRendererParams: {
          disabled: defaultView === "view",
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
      },
    ];
  },
};
