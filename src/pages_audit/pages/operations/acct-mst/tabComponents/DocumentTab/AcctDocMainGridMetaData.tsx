import {
  getAgGridSRNo,
  handleDeleteButtonClick,
  lessThanDate,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import * as API from "../../api";
import { handleBlurDocument, handleValidateDocNo } from "./MetaDataHelper";
import { format, isValid, parse } from "date-fns";
import { utilFunction } from "@acuteinfo/common-base";
import { handleDisplayMessages } from "components/utilFunction/function";
import { isEmpty } from "lodash";
import { checkDateGlobalPara } from "utils/helper";
import { t } from "i18next";

export const AcctDocMainGridMetaData = {
  GridMetaDataType: {
    gridLabel: "Documents",
  },
  columns: ({
    authState,
    formState,
    setIsOpen,
    setCurrentRowData,
    gridApiRef,
    validateDocuments,
    AcctMSTState,
    flag,
  }) => {
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
        name: "DISPLAY_TEMPLATE_CD",
        accessor: "TEMPLATE_CD",
        columnName: "document*",
        headerTooltip: "document",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 350,
        maxWidth: 600,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        isReadOnly: (params) => {
          if (
            params.node.data.IS_MANDATORY === "Y" ||
            (flag === "AcctDocuments" && params?.node?.data?.DOC_TYPE === "KYC")
          ) {
            return true;
          } else {
            return false;
          }
        },
        isOption: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["DocumentIsRequired"] }],
        },
        options: async () =>
          await API.getCustDocumentOpDtl({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            CUSTOMER_TYPE:
              flag === "AcctDocuments" ? "A" : AcctMSTState?.entityTypectx,
            formState: formState,
          }),
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any
        ) =>
          await handleBlurDocument(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            gridApiRef
          ),
        isSetDependantValueSet: (options) => {
          return {
            DOCUMENT_TYPE: options?.DOC_TYPE ?? "",
            DISPLAY_DOCUMENT_TYPE:
              options?.DOC_TYPE_DESC || options?.DOC_TYPE || "",
          };
        },
      },
      { accessor: "DOC_DESCRIPTION", isVisible: false },
      {
        accessor: "DOC_WEIGHTAGE",
        columnName: "Weightage",
        headerTooltip: "Weightage",
        alignment: "right",
        minWidth: 100,
        maxWidth: 200,
        singleClickEdit: true,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
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
        isReadOnly: (params) => params?.node?.data?.DOC_TYPE === "KYC",
      },
      {
        isCheckBox: true,
        accessor: "SUBMIT",
        columnName: "Submit",
        headerTooltip: "Submit",
        alignment: "center",
        minWidth: 80,
        maxWidth: 160,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        isReadOnly: (params) => {
          if (
            (flag === "AcctDocuments" &&
              params?.node?.data?.DOC_TYPE === "KYC") ||
            params.context?.gridContext?.mode === "view"
          ) {
            return true;
          } else {
            return false;
          }
        },
        cellRendererSelector: (params) => {
          const isPinned = params.node?.rowPinned;

          if (!isPinned) {
            return { component: "agCheckboxCellRenderer" };
          }
          return (params) => "";
        },
        postValidationSetCrossAccessorValues: async ({
          newValue,
          node,
          api,
          context,
        }) => {
          api.refreshCells({ force: true, columns: ["DELETE_ROW"] });
          if (newValue === false || newValue === "N") {
            node.setData({
              ...node.data,
              DOC_NO: "",
              VALID_UPTO: "",
            });
          }
          if (context?.gridContext?.mode === "new" && newValue === true) {
            node.setData({
              ...node.data,
              VALID_UPTO: node?.data?.VALID_UPTO_MONTHS
                ? format(
                    new Date(
                      new Date(
                        context?.gridContext?.authState?.workingDate
                      ).setMonth(
                        new Date(
                          context?.gridContext?.authState?.workingDate
                        ).getMonth() +
                          (Number(node?.data?.VALID_UPTO_MONTHS) || 0)
                      )
                    ),
                    "dd-MMM-yyyy"
                  )
                : "",
            });
          }
        },
      },

      {
        accessor: "DOC_NO",
        columnName: "DocumentNo",
        headerTooltip: "DocumentNo",
        alignment: "right",
        minWidth: 120,
        maxWidth: 450,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        FormatProps: {
          preventSpecialChars: sessionStorage.getItem("specialChar") || "",
          uppercase: true,
          allowAlphaNumeric: true,
          isAllowed: ({ value }) => {
            if (value?.length > 50) {
              return false;
            }
            return true;
          },
        },
        validate: handleValidateDocNo,
        isReadOnly: (params) => {
          if (
            flag === "AcctDocuments" &&
            params?.node?.data?.DOC_TYPE === "KYC"
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "ACTIVE",
        columnName: "Active",
        headerTooltip: "Active",

        alignment: "center",
        minWidth: 70,
        maxWidth: 120,
        singleClickEdit: true,
        isReadOnly: true,
        __EDIT__: {
          isReadOnly: (params) => {
            if (
              params?.node?.data?.DOC_TYPE === "KYC" ||
              params?.node?.data?._isNewRow
            ) {
              return true;
            } else {
              return false;
            }
          },
        },
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        cellRendererSelector: (params) => {
          const isPinned = params.node?.rowPinned;

          if (!isPinned) {
            return { component: "agCheckboxCellRenderer" };
          }
          return (params) => "";
        },
      },
      {
        accessor: "VALID_UPTO",
        columnName: "ValidTillDate",
        headerTooltip: "ValidTillDate",

        alignment: "center",
        minWidth: 135,
        maxWidth: 170,
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        FormatProps: {
          selectTodayDate: false,
          minDate: authState?.workingDate,
        },
        isReadOnly: (params) => {
          if (
            (flag === "AcctDocuments" &&
              params?.node?.data?.DOC_TYPE === "KYC") ||
            isEmpty(params?.node?.data?.TEMPLATE_CD)
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
              ? `${t("ValidTillDateCanNotBeLessThanOpeningDate")} ${
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
              const data = await validateDocuments.mutateAsync({
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
                      utilFunction.getParsedDate(node.data?.ENTERED_DATE),
                      "dd/MMM/yyyy"
                    ),
                CALL_FROM: flag === "CKYCDocuments" ? "DTLCUST" : "DTLACCT",
                WORKING_DATE: authState?.workingDate ?? "",
                TEMPLATE_CD:
                  node?.data?.TEMPLATE_CD_OPT?.SR_CD ||
                  node?.data?.TEMPLATE_CD ||
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
      },
      {
        accessor: "DOC_TYPE",
        headerTooltip: "EnteredFrom",
        columnName: "EnteredFrom",
        alignment: "left",
        minWidth: 115,
        maxWidth: 300,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        isReadOnly: true,
      },
      {
        accessor: "ENTERED_DATE",
        headerTooltip: "EnteredDate",

        columnName: "EnteredDate",
        alignment: "center",
        minWidth: 110,
        maxWidth: 200,
        componentType: "DatePickerCell",
        displayComponentType: "DisplayDateCell",
        isReadOnly: true,
      },
      {
        accessor: "DOC_AMOUNT",
        columnName: "DocumentAmount",
        headerTooltip: "DocumentAmount",
        alignment: "center",
        minWidth: 145,
        maxWidth: 200,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        singleClickEdit: true,
        isReadOnly: (params) => {
          if (params?.node?.data?.DOC_TYPE === "KYC") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        name: "DISPLAY_DOCUMENT_TYPE",
        accessor: "DOCUMENT_TYPE",
        columnName: "DocumentType",
        headerTooltip: "DocumentType",
        alignment: "left",
        minWidth: 130,
        maxWidth: 300,
        isReadOnly: true,
        componentType: "autocomplete",
        displayComponentType: "DisplaySelectCell",
      },
      {
        accessor: "UPLOAD_IMAGE",
        columnName: "ViewDocument",
        headerTooltip: "ViewDocument",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        minWidth: 150,
        maxWidth: 150,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",

        isReadOnly: true,
        cellRendererParams: {
          buttonName: t("UploadImage"),
          disabled: ({ node: { data } }) => !data?.TEMPLATE_CD,
          handleButtonClick: async (params) => {
            if (params.node.data?.SUBMIT) {
              setIsOpen(true);
              setCurrentRowData(params);
            } else {
              await params.context.MessageBox({
                messageTitle: t("InvalidAction"),
                message: t("PleaseCheckTheDocumentSubmittedOption"),
                icon: "INFO",
                buttonNames: ["Ok"],
              });
            }
          },
        },
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
        shouldExclude: (params) => {
          if (
            (flag === "AcctDocuments" &&
              params?.node?.data?.DOC_TYPE === "KYC") ||
            (flag === "CKYCDocuments" &&
              (params?.node?.data?.MANDATORY === "Y" ||
                params?.node?.data?.IS_MANDATORY === "Y" ||
                params.context?.gridContext?.mode === "view" ||
                (params.context?.gridContext?.mode === "edit" &&
                  params?.node?.data?.SUBMIT === true) ||
                (params.context?.gridContext?.mode === "new" &&
                  params?.node?.data?.SUBMIT === true)))
          ) {
            return true;
          } else {
            return false;
          }
        },
        cellRendererParams: {
          buttonName: t("Remove"),
          handleButtonClick: async (params) => {
            if (params.node.data.IS_MANDATORY === "Y") {
              await params.context.MessageBox({
                messageTitle: t("Stop"),
                message: t("YouCanNotDeleteMandatoryDocument"),
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
            } else {
              handleDeleteButtonClick(params);
            }
          },
          disabled: (params) => {
            if (
              flag === "AcctDocuments" &&
              (params.context?.gridContext?.mode === "view" ||
                (params.context?.gridContext?.mode === "edit" &&
                  !params.node?.data?._isNewRow))
            ) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      { accessor: "payload", isVisible: false },
    ];
  },
};
