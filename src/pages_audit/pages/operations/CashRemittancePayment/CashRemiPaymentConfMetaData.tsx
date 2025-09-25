import { GeneralAPI } from "registry/fns/functions";
import * as API from "../CashRemittancePayment/api";

import {
  handleBlurAcctCode,
  handleBlurAmount,
  handleBlurToBranch,
  handleButtonClick,
} from "./MetaDataHelper";
import { handleDisplayMessages } from "components/utilFunction/function";

export const cashRemiPaymentConfMetadata = {
  GridMetaDataType: {
    gridLabel: "",
  },
  columns: ({
    authState,
    setIsOpenDenomination,
    getData,
    setRemainingAmt,
    handleSaveData,
    currentRowData,
    retrieveDenoData,
    printLetterApiCall,
    setOpenPdfViewer,
    confirmOrReject,
    CloseMessageBox,
    docCD,
  }) => {
    return [
      {
        accessor: "TRAN_CD",
        columnName: "code",
        alignment: "right",
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        isReadOnly: true,
        sortable: false,
        cellRenderer: (params) => {
          if (params.node.data?.TRAN_CD) {
            return (
              <div className="cell-value">{params.node.data?.TRAN_CD}</div>
            );
          } else {
            return ">>>";
          }
        },
      },
      {
        name: "DISPLAY_FROM_ACCT_TYPE",
        accessor: "FROM_ACCT_TYPE",
        columnName: "From Account Type",
        headerTooltip: "From Account Type",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 150,
        maxWidth: 200,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        sortable: false,
        options: (params) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            USER_NAME: authState?.user?.id ?? "",
            DOC_CD: params.context?.gridContext?.docCD ?? "",
          });
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AccountTypeReqired"] }],
        },
        isReadOnly: ({ node }) => {
          if (node.data.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "FROM_ACCT_CD",
        columnName: "From Account code",
        headerTooltip: "From Account code",
        alignment: "left",
        minWidth: 110,
        maxWidth: 200,
        componentType: "NumberFormat",
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplayCell",
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["AccountNumberRequired"] },
            {
              name: "max",
              params: [20, "Account code should not exceed 20 digits"],
            },
          ],
        },
        FormatProps: {
          isAllowed: (values) => {
            if (values?.value?.length > 20) {
              return false;
            }

            return true;
          },
          isNumber: true,
          inputProps: {
            maxLength: 20,
            onInput: (event) => {
              const allowedKeys = ["j", "J"];
              const isSpecialKey =
                allowedKeys.includes(event.key) ||
                event.ctrlKey ||
                event.shiftKey;
              if (!isSpecialKey) {
                event.target.value = event.target.value.replace(
                  /[^0-9\s]/g,
                  ""
                );
              }
            },
          },
        },
        isReadOnly: ({ node }) => {
          if (node.data.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any,
          oldValue: any
        ) =>
          handleBlurAcctCode(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            oldValue,
            authState
          ),
      },
      {
        accessor: "ACCT_NM",
        columnName: "Account Name",
        headerTooltip: "Account Name",
        alignment: "left",
        minWidth: 100,
        maxWidth: 250,
        componentType: "NumberFormat",
        singleClickEdit: true,
        isReadOnly: true,
        sortable: false,
        displayComponentType: "DisplayCell",
      },
      {
        accessor: "REMARKS",
        columnName: "Remarks",
        headerTooltip: "Remarks",
        alignment: "left",
        minWidth: 120,
        maxWidth: 200,
        componentType: "NumberFormat",
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplayCell",
        FormatProps: {
          allowAlphaNumeric: true,
          uppercase: true,
        },
        isReadOnly: ({ node }) => {
          if (node.data.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "AMOUNT",
        columnName: "Amount",
        headerClass: "required",
        alignment: "right",
        sequence: 3,
        width: 100,
        minWidth: 100,
        maxWidth: 180,
        componentType: "amountField",
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AmountRequired"] }],
        },
        FormatProps: {
          maxLength: 15,
        },
        isReadOnly: ({ node }) => {
          if (node.data.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        name: "DISPLAY_TO_BRANCH",
        accessor: "TO_BRANCH",
        columnName: "To Branch",
        headerTooltip: "To Branch",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 150,
        maxWidth: 200,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        isReadOnly: ({ node }) => {
          if (node.data.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
        sortable: false,
        options: async () =>
          await GeneralAPI.getBranchCodeList({ COMP_CD: authState?.companyID }),
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["BranchCodeReqired"] }],
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any,
          oldValue: any
        ) =>
          handleBlurToBranch(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            oldValue,
            authState
          ),
      },
      {
        accessor: "SEND_THROUGH",
        columnName: "Send Through",
        headerTooltip: "Send Through",
        alignment: "left",
        minWidth: 120,
        maxWidth: 150,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        FormatProps: {
          allowAlphaNumeric: true,
          uppercase: true,
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["SendThroughRequired"] }],
        },
        isReadOnly: ({ node }) => {
          if (node.data.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
      },

      {
        accessor: "ENTERED_BY",
        columnName: "Entered By",
        headerTooltip: "Entered By",
        alignment: "left",
        minWidth: 100,
        maxWidth: 100,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        FormatProps: {
          allowAlphaNumeric: true,
          uppercase: true,
        },

        isReadOnly: true,
      },
      {
        accessor: "CHEQUE_NO",
        columnName: "Cheque No",
        headerTooltip: "Cheque No",
        alignment: "left",
        minWidth: 100,
        maxWidth: 100,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        FormatProps: {
          allowAlphaNumeric: true,
          uppercase: true,
        },

        isReadOnly: true,
      },
      {
        accessor: "ENTERED_DATE",
        columnName: "Date",
        headerTooltip: "Date",
        alignment: "center",
        minWidth: 120,
        maxWidth: 200,
        componentType: "DatePickerCell",
        displayComponentType: "DisplayDateCell",
        isReadOnly: true,
      },
      {
        accessor: "DENO_BTN",
        columnName: "Deno.",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        keepOneRowOnDelete: false,
        pinned: "right",
        shouldExclude: ({ node }) => {
          if (node.data.TRAN_CD && node.data?.VISIBLE_DENO_PRINT === "Y") {
            return false;
          } else {
            return true;
          }
        },
        cellRendererParams: {
          buttonName: "Deno.",
          handleButtonClick: async (params) => {
            setIsOpenDenomination(true);

            await retrieveDenoData({
              BRANCH_CD: authState?.user?.branchCode ?? "",
              COMP_CD: authState?.companyID ?? "",
              USER_NAME: authState?.user?.id ?? "",
              FROM_DT: authState?.workingDate,
              DTL_TRAN_CD: params.node?.data?.DAILY_TRN_CD,
            });
          },
        },
      },
      {
        accessor: "CONFIRM_ROW",
        columnName: "Confirm",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        keepOneRowOnDelete: false,
        pinned: "right",
        cellRendererParams: {
          buttonName: "Confirm",
          handleButtonClick: async ({ context, api, node }) => {
            if (
              (node.data?.ENTERED_BY || "").toLowerCase() ===
              (authState?.user?.id || "").toLowerCase()
            ) {
              await context.MessageBox({
                messageTitle: "ValidationFailed",
                message: "ConfirmRestrictMsg",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
            } else {
              let res = await context.MessageBox({
                messageTitle: "confirmation",
                message: "Are you sure want to confirm row ?",
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                icon: "CONFIRM",
                loadingBtnName: ["Yes"],
              });
              if (res === "Yes") {
                if (node.data?.TRAN_CD) {
                  const data = await confirmOrReject({
                    TRAN_CD: node.data?.TRAN_CD,
                    FLAG: "C",
                    SR_CD: node.data?.SR_CD ?? "",
                  });

                  const returnValue: any = await handleDisplayMessages(
                    data,
                    context?.MessageBox
                  );

                  if (returnValue?.O_STATUS === "0") {
                    api?.applyTransaction({ remove: [node.data] });
                  }
                  CloseMessageBox();
                } else {
                  api.applyTransaction({ remove: [node.data] });
                  CloseMessageBox();
                }
              }
            }
          },
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        keepOneRowOnDelete: false,
        cellRendererParams: {
          buttonName: () => (docCD === "TRN/623" ? "Reject" : "Delete"),
          handleButtonClick: (params) =>
            handleButtonClick(params, confirmOrReject, CloseMessageBox),
        },
        pinned: "right",
      },
      {
        accessor: "DENO_DTL",
        isVisible: false,
      },
    ];
  },
};
