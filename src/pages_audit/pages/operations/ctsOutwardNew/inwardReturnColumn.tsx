import { getAgGridSRNo, handleDeleteButtonClick } from "@acuteinfo/common-base";
import {
  getReasonOptions,
  handleBlurBankCode,
  handleBlurCheckNo,
} from "./ctsOutwardColumnHelper";
import { validateChequeDate } from "utils/helper";

export const inwardReturnColumn = {
  gridConfig: {
    gridLabel: "Inward Return Entry",
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
        lockVisible: true,
        width: 70,
        resizable: false,
        unSortIcon: false,
        filter: false,
        pinned: "left",
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
      },
      { accessor: "CHQ_MICR_VISIBLE", isVisible: false },
      { accessor: "PAYEE_AC_MANDATORY", isVisible: false },
      { accessor: "TRAN_DT", isVisible: false },
      { accessor: "RANGE_DT", isVisible: false },

      {
        accessor: "BANK_CD",
        columnName: "BankCode",
        headerClass: "required",
        alignment: "left",
        sequence: 3,
        // width: 150,
        minWidth: 120,
        maxWidth: 200,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
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
        alignment: "left",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        isReadOnly: true,
        displayComponentType: "DisplayCell",
      },
      {
        accessor: "BRANCH",
        columnName: "Description",
        alignment: "left",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        displayComponentType: "DisplayCell",
      },
      {
        accessor: "REASON",
        columnName: "Reason",
        alignment: "left",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "autocomplete",
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        options: async () => await getReasonOptions(authState),
        name: "REASON_ID",
      },
      {
        accessor: "CHQ_MICR_CD",
        columnName: "CHQMicr",
        alignment: "left",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        cellClass: "currency",

        FormatProps: {
          isNumber: true,
          defaultValue: 10,
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
        accessor: "errors",
        isVisible: false,
      },
      {
        accessor: "CHEQUE_NO",
        columnName: "ChequeNo",
        headerClass: "required",
        sequence: 2,
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "NumberFormat",
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
        postValidationSetCrossAccessorValues: (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any,
          dependentaccessorsValues: any
        ) =>
          handleBlurCheckNo(
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

        displayComponentType: "DisplayCell",
        singleClickEdit: true,
        alignment: "right",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["ChequeNorequired"] }],
        },
      },
      {
        accessor: "CHEQUE_DATE",
        columnName: "ChequeDate",
        sequence: 6,
        alignment: "center",
        // width: 150,
        minWidth: 120,
        maxWidth: 200,
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
        accessor: "AMOUNT",
        columnName: "ChequeAmount",
        headerClass: "required",
        alignment: "right",
        // width: 200,
        minWidth: 120,
        maxWidth: 200,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Remove",
        sequence: 8,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        // width: 150,
        minWidth: 120,
        maxWidth: 200,
        cellClass: "numeric-cell-text-alignment",
        // pinned: "right",
        isReadOnly: true,
        cellRendererParams: {
          disabled: defaultView === "view",
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
      },
    ];
  },
};
