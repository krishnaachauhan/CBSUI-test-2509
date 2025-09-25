import {
  getAgGridSRNo,
  getGridRowData,
  handleDeleteButtonClick,
} from "components/agGridTable/utils/helper";
import React from "react";
import { advConfCodeDD, advConfDefDD } from "../../api";
import { lessThanDate, utilFunction } from "@acuteinfo/common-base";
import { format, isBefore } from "date-fns";
import { commonDateValidator } from "utils/helper";
import { handleBlurCode, handleBlurFlag } from "./AdvConfigMetaDataHelper";

export const advConfGridMetaData = {
  GridMetaDataType: {
    gridLabel: "",
  },
  columns: ({
    authState,
    setOpenDialg,
    setInitialData,
    gridApiRef,
    acctType,
  }) => {
    return [
      {
        columnName: "SrNo",
        alignment: "left",
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        name: "DISPLAY_CODE",
        accessor: "CODE",
        columnName: "ParameterA",
        headerTooltip: "ParameterA",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 300,
        maxWidth: 350,
        displayComponentType: "DisplaySelectCell",
        isReadOnly: true,
        __NEW__: { isReadOnly: false },
        __EDIT__: {
          isReadOnly: (params) => {
            if (params?.node?.data?.IsNewRow) {
              return false;
            } else {
              return true;
            }
          },
        },
        options: async () =>
          await advConfCodeDD({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            ACCT_TYPE: acctType,
          }),
        isOption: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Parametersrequired"] }],
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
          await handleBlurCode(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            oldValue,
            gridApiRef
          ),
      },
      {
        isCheckBox: true,
        accessor: "FLAG",
        columnName: "",
        headerTooltip: "",
        alignment: "center",
        minWidth: 60,
        maxWidth: 60,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        __VIEW__: { isReadOnly: true },
        __EDIT__: {
          isReadOnly: ({ node }) => {
            if (node.data.FLAG_ALLOW_EDIT === "N") {
              return true;
            } else {
              return false;
            }
          },
        },
        postValidationSetCrossAccessorValues: async ({
          newValue,
          node,
          api,
          colDef,
          onValueChange,
          context,
          oldValue,
        }) =>
          handleBlurFlag({
            newValue,
            node,
            api,
            colDef,
            onValueChange,
            context,
            oldValue,
            gridApiRef,
          }),
      },
      {
        name: "DEF_DESC",
        accessor: "DEF_TRAN_CD",
        columnName: "Defination",
        headerTooltip: "Defination",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 300,
        maxWidth: 300,
        displayComponentType: "DisplaySelectCell",
        __VIEW__: { isReadOnly: true },
        FormatProps: {
          refetchOnFocus: true,
        },
        options: ({ node }) => {
          if (node?.data?.CODE) {
            return advConfDefDD({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              BASE_BRANCH: authState?.user?.baseBranchCode,
              CODE: node?.data?.CODE,
            });
          }
          return [];
        },
        shouldExclude({ node }) {
          if (node.data?.CODE_OPT?.DEFINITION_VISIBLE === "N") {
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
          context: any
        ) => {
          await context.updateState("DEF_TRAN_CD", []);
        },
      },
      {
        accessor: "FROM_EFF_DATE",
        columnName: "EffectiveFromDate",
        headerTooltip: "EffectiveFromDate",

        alignment: "center",
        minWidth: 125,
        maxWidth: 150,
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        FormatProps: {
          selectTodayDate: false,
        },
        isReadOnly: true,
        __NEW__: { isReadOnly: false },
        __EDIT__: {
          isReadOnly: (params) => {
            if (params?.node?.data?.IsNewRow) {
              return false;
            } else {
              return true;
            }
          },
        },
        validate: (params) => {
          const errorMessage = commonDateValidator(
            params,
            "EffectiveFromDateRequired"
          );

          if (errorMessage) {
            return errorMessage;
          }
          if (
            params?.value &&
            lessThanDate(params?.value, authState?.workingDate, {
              ignoreTime: true,
            })
          ) {
            return "EffectiveFromDateMustBeGreaterThanWorkingDate";
          }
          return "";
        },
      },
      {
        accessor: "TO_EFF_DATE",
        columnName: "EffectiveToDate",
        headerTooltip: "EffectiveToDate",
        alignment: "center",
        minWidth: 125,
        maxWidth: 150,
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        FormatProps: {
          selectTodayDate: false,
        },
        isReadOnly: true,
        __NEW__: { isReadOnly: false },
        __EDIT__: {
          isReadOnly: (params) => {
            if (params?.node?.data?.IsNewRow) {
              return false;
            } else {
              return true;
            }
          },
        },
        validate: (params) => {
          const { value, node } = params;
          const errorMessage = commonDateValidator(params);
          if (errorMessage) {
            return errorMessage;
          }

          let dependentField = Boolean(node.data?.["FROM_EFF_DATE"])
            ? format(
                utilFunction.getParsedDate(node.data?.["FROM_EFF_DATE"]),
                "dd/MMM/yyyy"
              )
            : "";

          if (
            value &&
            lessThanDate(value, authState?.workingDate, { ignoreTime: true })
          ) {
            return "EffectiveToDateMustBeGreaterThanWorkingDate";
          } else if (
            value &&
            lessThanDate(value, dependentField, { ignoreTime: true })
          ) {
            return "EffectiveToDateMustBeGreaterThanFromDate";
          }
          return "";
        },
      },
      {
        accessor: "AMOUNT_UPTO",
        columnName: "AmountDaysUpToA",
        headerTooltip: "AmountDaysUpTo",
        headerClass: "required",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        isReadOnly: true,
        __NEW__: { isReadOnly: false },

        shouldExclude({ node }) {
          if (node.data?.CODE_OPT?.AMT_UPTO_VISIBLE === "Y") {
            return false;
          } else {
            return true;
          }
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AmountDaysUpToIsRequiered"] }],
        },
      },
      {
        accessor: "",
        columnName: "",
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
          buttonName: "..",
          handleButtonClick: (params) => {
            setOpenDialg(true);
            setInitialData(params?.node?.data);
          },
          disabled: (params) => {
            if (
              params?.node?.data?.IsNewRow ||
              params?.node?.data?.DOC_VISIBLE === "N"
            ) {
              return true;
            } else {
              return false;
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
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
          disabled: (params) => {
            if (!params?.node?.data?.IsNewRow) {
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
