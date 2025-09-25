import { isBefore } from "date-fns";
import {
  getAgGridSRNo,
  handleDeleteButtonClick,
} from "components/agGridTable/utils/helper";

export const loanRepaymentMetadata = {
  GridMetaDataType: {
    gridLabel: "",
  },
  columns: ({ authState, formRef }) => {
    return [
      {
        columnName: "Sr.",
        alignment: "left",
        width: 40,
        minWidth: 60,
        maxWidth: 80,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
      },
      {
        accessor: "INS_START_DT",
        columnName: "InstStartDate",
        alignment: "center",
        sequence: 2,
        width: 120,
        minWidth: 120,
        maxWidth: 150,
        sortable: false,
        displayComponentType: "DisplayDateCell",
        componentType: "DatePickerCell",
        isReadOnly: (params) => {
          if (params?.data?.DISABLE_INS_START_DT === "N") {
            return false;
          } else {
            return true;
          }
        },
        FormatProps: {
          authState: authState,
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const rowData = await formRef?.current;
          if (isBefore(new Date(value), new Date(rowData?.SANCTION_DT))) {
            await context?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InstallmentStartDateLessThanSanctionDate",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            node.setData({
              ...node.data,
              INS_START_DT: rowData?.INS_START_DT,
            });
          }
        },
      },
      {
        accessor: "FROM_INST",
        columnName: "FromInst",
        sequence: 3,
        alignment: "right",
        width: 140,
        minWidth: 140,
        maxWidth: 180,
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: (params) => params?.data?.INS_START_DT,
        componentType: "NumberFormat",
        FormatProps: {
          isNumber: true,
        },
      },
      {
        accessor: "TO_INST",
        columnName: "ToInst",
        headerClass: "required",
        sequence: 4,
        alignment: "right",
        width: 100,
        minWidth: 130,
        maxWidth: 180,
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplayCell",
        shouldExclude: false,
        componentType: "NumberFormat",
        FormatProps: {
          isNumber: true,
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const fromInst = Number(node.data?.FROM_INST) || 0;
          const toInst = value ? Number(value) : 0;
          const instNo = toInst ? toInst - fromInst + 1 : 0;
          node.setData({
            ...node.data,
            INST_NO: instNo,
          });
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseenterToInst"] }],
        },
      },
      {
        accessor: "INST_NO",
        columnName: "NoOfInstallment",
        sequence: 5,
        alignment: "right",
        width: 160,
        minWidth: 160,
        maxWidth: 180,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: true,
        componentType: "NumberFormat",
      },
      {
        accessor: "INST_RS",
        columnName: "InstAmount",
        sequence: 6,
        alignment: "right",
        width: 160,
        minWidth: 180,
        maxWidth: 220,
        componentType: "amountField",
        sortable: false,
        isReadOnly: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        sequence: 11,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
        shouldExclude: (params) => params?.data?.FROM_INST === "1",
      },
    ];
  },
};
