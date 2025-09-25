import { GeneralAPI } from "registry/fns/functions";

import {
  handleBlurAcctCode,
  handleBlurAmount,
  handleBlurToBranch,
  handleButtonClick,
} from "./MetaDataHelper";

export const cashRemiPaymentMetadata = {
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
    setDenoDisplayMode,
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
          if (params.node?.data?.TRAN_CD) {
            return <div className="cell-value">{params.node.data.TRAN_CD}</div>;
          } else {
            return ">>>";
          }
        },
      },
      {
        name: "DISPLAY_FROM_ACCT_TYPE",
        accessor: "FROM_ACCT_TYPE",
        columnName: "From Account Type*",
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
          if (node?.data?.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "FROM_ACCT_CD",
        columnName: "From Account code*",
        headerTooltip: "From Account code",
        alignment: "left",
        minWidth: 110,
        maxWidth: 200,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        sortable: false,
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
          if (node?.data?.TRAN_CD) {
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
        maxWidth: 200,
        componentType: "NumberFormat",
        singleClickEdit: true,
        isReadOnly: true,
        displayComponentType: "DisplayCell",
        sortable: false,
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
        displayComponentType: "DisplayCell",
        sortable: false,
        FormatProps: {
          allowAlphaNumeric: true,
          uppercase: true,
        },
        isReadOnly: ({ node }) => {
          if (node?.data?.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "AMOUNT",
        columnName: "Amount*",
        headerClass: "required",
        alignment: "right",
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
          rules: [{ name: "required", params: ["amountRequired"] }],
        },
        FormatProps: {
          maxLength: 15,
        },
        isReadOnly: ({ node }) => {
          if (node?.data?.TRAN_CD) {
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
          await handleBlurAmount(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            oldValue,
            currentRowData,
            setIsOpenDenomination,
            setRemainingAmt,
            getData,
            authState,
            setDenoDisplayMode
          ),
      },
      {
        name: "DISPLAY_TO_BRANCH",
        accessor: "TO_BRANCH",
        columnName: "To Branch*",
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
        columnName: "Send Through*",
        headerTooltip: "Send Through",
        alignment: "left",
        minWidth: 120,
        maxWidth: 150,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        sortable: false,
        FormatProps: {
          allowAlphaNumeric: true,
          uppercase: true,
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["SendThroughRequired"] }],
        },
        isReadOnly: ({ node }) => {
          if (node?.data?.TRAN_CD) {
            return true;
          } else {
            return false;
          }
        },
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
        sortable: false,
        keepOneRowOnDelete: false,
        shouldExclude: ({ node }) => {
          if (node?.data?.TRAN_CD && node?.data?.VISIBLE_DENO_PRINT === "Y") {
            return false;
          } else {
            return true;
          }
        },
        cellRendererParams: {
          buttonName: "Deno.",
          handleButtonClick: async (params) => {
            try {
              setDenoDisplayMode("view");
              setIsOpenDenomination(true);
              setTimeout(() => {
                retrieveDenoData({
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  COMP_CD: authState?.companyID ?? "",
                  USER_NAME: authState?.user?.id ?? "",
                  FROM_DT: authState?.workingDate,
                  DTL_TRAN_CD: params.node?.data?.DAILY_TRN_CD,
                });
              }, 0);
            } catch (e) {
              console.error({ e });
            }
          },
        },
      },

      {
        accessor: "PRINT_BTN",
        columnName: "Print",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        sortable: false,
        keepOneRowOnDelete: false,
        shouldExclude: ({ node }) => {
          if (node?.data?.TRAN_CD && node?.data?.VISIBLE_DENO_PRINT === "Y") {
            return false;
          } else {
            return true;
          }
        },
        cellRendererParams: {
          buttonName: "Print",
          handleButtonClick: async ({ node }) => {
            try {
              if (node?.data?.TRAN_CD) {
                await printLetterApiCall(node.data.TRAN_CD);
                setOpenPdfViewer(true);
              }
            } catch (e) {
              console.error({ e });
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
          handleButtonClick: (params) => {
            try {
              handleButtonClick(params, confirmOrReject, CloseMessageBox);
            } catch (e) {
              console.error({ e });
            }
          },
        },
      },
      {
        accessor: "DENO_DTL",
        isVisible: false,
      },
    ];
  },
};
