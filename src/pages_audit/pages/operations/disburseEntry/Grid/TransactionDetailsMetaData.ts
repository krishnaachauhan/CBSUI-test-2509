import { GeneralAPI } from "registry/fns/functions";
import * as API from "../api";
import { handleBlurAccCode } from "./gridColumnHelper";
import {
  getAgGridSRNo,
  handleDeleteButtonClick,
} from "components/agGridTable/utils/helper";

export function transaction_type() {
  return [
    { value: "6   ", label: "DEBIT" },
    { value: "3", label: "CREDIT" },
    { value: "NEFT", label: "NEFT" },
    { value: "DD", label: "DD" },
  ];
}

export const transactionMetadata = {
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
        sortable: false,
      },
      {
        accessor: "TYPE_CD",
        columnName: "TranType",
        sequence: 2,
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "center",
        width: 130,
        minWidth: 130,
        maxWidth: 170,
        singleClickEdit: true,
        sortable: false,
        isReadOnly: ({ data }) => data?.SDC?.trim() === "INT",
        options: transaction_type,
        displayComponentType: (params) => {
          let rawValue = params?.data?.TYPE_CD || "";
          const trimmedValue = rawValue.trim();

          const matchedOption = transaction_type().find(
            (opt) => opt.value.trim() === trimmedValue
          );

          return matchedOption?.label || trimmedValue;
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
              : String(value ?? "").trim();

          const sdc = node?.data?.SDC ?? "";
          if (["NEFT", "DD"].includes(selectedType) && sdc !== "DISB") {
            context?.MessageBox({
              message: "TransactionTypeNEFTDDIsNotAllowed",
              messageTitle: "Validation Failed",
              icon: "ERROR",
            });
            onValueChange("");
            return;
          }

          if (["NFET", "DD"].includes(selectedType)) {
            node.setData({
              ...node.data,
              OPP_BRANCH_CD: "",
              OPP_ACCT_TYPE: "",
              OPP_ACCT_CD: "",
              OPP_ACCT_NM: "",
              OPP_ACCT_TYPE_ID: "",
              OPP_BRANCH_CD_ID: "",
            });
          } else {
            node.setData({
              ...node.data,
              FROM_INST: "",
              FROM_INST_ID: "",
            });
          }

          context.updatePinnedBottomRow();
        },
        name: "TYPE_CD_ID",
      },
      {
        accessor: "DISB_AMT",
        columnName: "Amount",
        sequence: 3,
        alignment: "right",
        headerClass: "required",
        width: 130,
        minWidth: 180,
        maxWidth: 200,
        singleClickEdit: true,
        sortable: false,
        isReadOnly: ({ data }) => ["DISB", "INT"].includes(data?.SDC?.trim()),
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
          const rowData = await formRef?.current?.getFieldData();
          const gstResponse = await API.validateDisbtrnAmt({
            BASE_BRANCH_CD: authState?.user?.branch ?? "",
            LOGIN_BRANCH_CD: authState?.user?.branchCode ?? "",
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            ACCT_TYPE: rowData?.ACCT_TYPE,
            ACCT_CD: rowData?.ACCT_CD,
            NEW_AMT: value,
            TRN_AMT: value,
            SDC: rowData?.SDC ?? "",
          });
          node.setData({
            ...node.data,
            GST: gstResponse?.[0]?.GST,
          });
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
        },

        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseenterTransactionAmount"] },
          ],
        },
      },
      {
        accessor: "GST",
        columnName: "GST",
        sequence: 4,
        alignment: "right",
        width: 100,
        minWidth: 130,
        maxWidth: 180,
        singleClickEdit: true,
        sortable: false,
        isReadOnly: ({ data }) => ["DISB", "INT"].includes(data?.SDC?.trim()),
        displayComponentType: "DisplayCurrencyCell",
        componentType: "amountField",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
        },
      },
      {
        accessor: "REMARKS",
        columnName: "Remarks",
        headerClass: "required",
        sequence: 5,
        alignment: "left",
        width: 250,
        minWidth: 250,
        maxWidth: 250,
        displayComponentType: "DisplayCell",
        shouldExclude: true,
        componentType: "NumberFormat",
        singleClickEdit: true,
        FormatProps: {
          uppercase: true,
          allowAlphaNumeric: true,
        },
        sortable: false,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseEnterRemarks"] }],
        },
      },
      {
        accessor: "OPP_BRANCH_CD",
        columnName: "OppBranchCode",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 120,
        minWidth: 150,
        maxWidth: 220,
        componentType: "autocomplete",
        isReadOnly: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        options: (data) => {
          return GeneralAPI.getBranchCodeList({
            COMP_CD: authState?.companyID || "",
          });
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseenterOppBranchCode"] }],
        },
        name: "OPP_BRANCH_CD_ID",
      },
      {
        accessor: "OPP_ACCT_TYPE",
        columnName: "OppAcctType",
        sequence: 7,
        alignment: "left",
        headerClass: "required",
        width: 160,
        minWidth: 160,
        maxWidth: 200,
        sortable: false,
        isReadOnly: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        componentType: "autocomplete",
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        options: () => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: formRef?.current?.formDisplayLabel,
          });
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseenterOppAcctType"] }],
        },
        name: "OPP_ACCT_TYPE_ID",
      },
      {
        accessor: "OPP_ACCT_CD",
        columnName: "OppAcctCode",
        sequence: 8,
        alignment: "left",
        headerClass: "required",
        width: 150,
        minWidth: 150,
        maxWidth: 200,
        sortable: false,
        isReadOnly: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        displayComponentType: "DisplayCell",
        singleClickEdit: true,
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
          formState: any
        ) =>
          handleBlurAccCode(
            value,
            node,
            api,
            field,
            onValueChange,
            formState,
            authState
          ),
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseenterOppAcctCode"] }],
        },
      },
      {
        accessor: "OPP_ACCT_NM",
        columnName: "OppAcctName",
        sequence: 9,
        alignment: "left",
        width: 250,
        minWidth: 250,
        maxWidth: 250,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: () => true,
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        componentType: "NumberFormat",
        FormatProps: {
          uppercase: true,
        },
      },
      {
        accessor: "FROM_INST",
        columnName: "FromBank",
        sequence: 10,
        alignment: "left",
        headerClass: "required",
        width: 170,
        minWidth: 170,
        maxWidth: 200,
        singleClickEdit: true,
        sortable: false,
        isReadOnly: ({ data }) =>
          !["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        componentType: "autocomplete",
        displayComponentType: "DisplaySelectCell",
        shouldExclude: ({ data }) =>
          !["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        options: async () => {
          const data = await API.getSubmemifScac({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });
          return data.map((item) => ({
            label: item.BANK_ACCT_NO,
            value: item.SPN_ACCT_NO,
          }));
        },
        // schemaValidation: {
        //   type: "string",
        //   rules: [{ name: "required", params: ["PleaseEnterFromBank"] }],
        // },
        name: "FROM_INST_ID",
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
        pinned: "right",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
        shouldExclude: (params) => {
          if (params?.data?.SDC === "DISB") {
            return true;
          }
          return false;
        },
      },
    ];
  },
};
