import {
  getAgGridSRNo,
  handleDeleteButtonClick,
  lessThanDate,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import { handleUploadButtonClick } from "./MetaDataHelper";
import { format, isValid, parse } from "date-fns";
import { utilFunction } from "@acuteinfo/common-base";
import { handleDisplayMessages } from "components/utilFunction/function";
import { isEmpty } from "lodash";
import { checkDateGlobalPara } from "utils/helper";
import { t } from "i18next";

export const AcctModalGridUploadMetaData = {
  GridMetaDataType: {
    gridLabel: "Documents",
  },
  columns: ({
    setOpenImage,
    setCurrentRowDatas,
    setIsFileViewOpen,
    currentRowData,
    handleScan,
    authState,
    AcctMSTState,
    validateDocuments,
    flag,
  }) => {
    return [
      {
        accessor: "LINE_ID",
        columnName: "SrNo",
        alignment: "left",
        width: 40,
        minWidth: 60,
        maxWidth: 80,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        accessor: "VALID_UPTO",
        columnName: "ValidUptoS",
        sequence: 5,
        alignment: "center",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        FormatProps: {
          selectTodayDate: false,
          minDate: authState?.workingDate,
        },
        isReadOnly: (params) => {
          if (
            params.context?.gridContext?.mode === "view" ||
            (params.context?.gridContext?.mode === "edit" &&
              !params.node?.data?.newRow)
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
          const colDef = { field: field };

          const errorMessage = await checkDateGlobalPara({
            node,
            api,
            value,
            colDef,
            context,
          });
          if (val !== "DD/MM/YYYY") {
            const currentDate = parse(val, "dd/MM/yyyy", new Date());
            const error = !isValid(currentDate)
              ? "Mustbeavaliddate"
              : undefined;
            if (error) {
              const existingErrors = node.data.errors || [];

              const updatedErrors = [
                ...existingErrors.filter((err) => err.field !== field),
                { field, message: error },
              ];

              node.setData({
                ...node.data,
                errors: updatedErrors,
              });
            } else {
              const updatedErrors = (node.data.errors || []).filter(
                (err) => err.field !== field
              );

              node.setData({
                ...node.data,
                errors: updatedErrors,
              });
            }
          }
          if (value) {
            const error = errorMessage
              ? errorMessage
              : lessThanDate(value, new Date(), { ignoreTime: true })
              ? `${t("ValidUptoDateCanNotBeLessThanOpeningDate")} ${
                  authState?.workingDate
                }`
              : undefined;
            if (error) {
              const btnName = await context.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: error,
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btnName === "Ok") {
                updateNodeDataAndFocus(node, { [field]: "" }, api, {
                  isFieldFocused: true,
                  focusedAccessor: field,
                });
              }
            } else {
              let mainDetail =
                AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"] ||
                AcctMSTState?.formDatactx?.["MAIN_DETAIL"];
              if (flag === "CKYCDocuments") {
                mainDetail =
                  AcctMSTState?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ||
                  AcctMSTState?.formDatactx?.["PERSONAL_DETAIL"];
              }
              const data = await validateDocuments?.mutateAsync({
                VALID_UPTO_DT: format(
                  utilFunction.getParsedDate(value),
                  "dd/MMM/yyyy"
                ),
                COMP_CD: authState?.companyID,
                BRANCH_CD: authState?.user?.branchCode,
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                CUSTOMER_TYPE:
                  flag === "CKYCDocuments" ? AcctMSTState?.entityTypectx : "",
                OP_DATE:
                  flag === "CKYCDocuments" && mainDetail?.ENTERED_DATE
                    ? format(
                        utilFunction.getParsedDate(mainDetail?.ENTERED_DATE),
                        "dd/MMM/yyyy"
                      )
                    : mainDetail?.OP_DATE
                    ? format(
                        utilFunction.getParsedDate(mainDetail?.OP_DATE),
                        "dd/MMM/yyyy"
                      )
                    : authState?.workingDate,
                ENTERED_DATE: AcctMSTState?.isFreshEntryctx
                  ? authState?.workingDate
                  : format(
                      utilFunction.getParsedDate(
                        currentRowData?.data?.ENTERED_DATE
                      ),
                      "dd/MMM/yyyy"
                    ),
                CALL_FROM:
                  flag === "CKYCDocuments" ? "SUBDTLCUST" : "SUBDTLACCT",
                WORKING_DATE: authState?.workingDate ?? "",
                TEMPLATE_CD:
                  currentRowData?.data?.TEMPLATE_CD_OPT?.SR_CD ||
                  currentRowData?.data?.TEMPLATE_CD ||
                  "",
              });

              const response = await handleDisplayMessages(
                data,
                context.MessageBox
              );

              if (isEmpty(response)) {
                updateNodeDataAndFocus(node, { [field]: "" }, api, {
                  isFieldFocused: true,
                  focusedAccessor: field,
                });
              }
            }
          }
        },

        validate: ({ value, node, api, colDef, context }) => {
          const currentDate = parse(value, "dd/MM/yyyy", new Date());
          const error = !value
            ? "ValidUptoIsRequired"
            : !isValid(currentDate)
            ? "Mustbeavaliddate"
            : undefined;
          return error;
        },
      },
      {
        accessor: "PAGE_NO",
        columnName: "PageNo",
        sequence: 2,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        isReadOnly: (params) => {
          if (
            params.context?.gridContext?.mode === "view" ||
            (params.context?.gridContext?.mode === "edit" &&
              !params.node?.data?.newRow)
          ) {
            return true;
          } else {
            return false;
          }
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
          allowDecimal: false,
          isAllowed: (values) => {
            if (values?.value?.length > 3) {
              return false;
            }
            if (values.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        alignment: "left",
        width: 150,
        minWidth: 100,
        maxWidth: 200,
        singleClickEdit: true,
      },
      {
        accessor: "SCAN_IMAGE",
        columnName: "Scan",
        sequence: 11,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 100,
        minWidth: 120,
        maxWidth: 150,
        sortable: false,
        cellClass: "numeric-cell-text-alignment no-ag-focus-border",
        isReadOnly: true,
        shouldExclude: () => {
          if (!currentRowData?.node?.data?.SUBMIT) {
            return true;
          } else {
            return false;
          }
        },
        cellRendererParams: {
          disabled: (params) => {
            if (
              params?.node?.data?.DOC_TYPE === "KYC" ||
              params?.context?.gridContext?.mode === "view"
            ) {
              return true;
            } else {
              return false;
            }
          },
          buttonName: "Scan",
          handleButtonClick: (params) => {
            setCurrentRowDatas(params);
            handleScan();
          },
        },
      },
      {
        accessor: "VIEW_IMAGE",
        columnName: "ViewDocument",
        sequence: 11,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 200,
        sortable: false,
        cellClass: "numeric-cell-text-alignment no-ag-focus-border",
        isReadOnly: true,
        shouldExclude: () => {
          if (!currentRowData?.node?.data?.SUBMIT) {
            return true;
          } else {
            return false;
          }
        },
        cellRendererParams: {
          buttonName: (params) => {
            if (!params?.node?.data?.DOC_IMAGE) {
              return t("UploadDocument");
            } else if (params?.node?.data?.DOC_IMAGE) {
              return t("ViewDocument");
            }
          },
          handleButtonClick: (params) =>
            handleUploadButtonClick(
              params,
              setIsFileViewOpen,
              setCurrentRowDatas,
              setOpenImage
            ),
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        sequence: 11,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 100,
        minWidth: 120,
        maxWidth: 150,
        sortable: false,
        cellClass: "numeric-cell-text-alignment no-ag-focus-border",
        isReadOnly: true,
        keepOneRowOnDelete: false,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
          disabled: (params) => {
            if (
              params.context?.gridContext?.mode === "view" ||
              params.node.data.DOC_TYPE === "KYC"
            ) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      { accessor: "DOC_IMAGE", isVisible: false },
    ];
  },
};
