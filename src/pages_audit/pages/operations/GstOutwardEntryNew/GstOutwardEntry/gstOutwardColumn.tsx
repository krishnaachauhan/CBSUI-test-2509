import {
  getGridRowData,
  handleDeleteButtonClick,
  removeExistingRowData,
} from "components/agGridTable/utils/helper";
import * as API from "../../gstOutwardEntry/api";

import {
  getTemplateOptions,
  handleBlurChargeAmount,
  handleBlurCheckNo,
} from "./gstOutwardMetaDataHelper";
import { validateChequeDate } from "utils/helper";
import { getAgGridSRNo } from "components/agGridTable/utils/helper";
import { utilFunction } from "@acuteinfo/common-base";

export const GstOutwardDetailGrid = {
  form: {
    name: "master-gst-form",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
          lg: 4,
          xl: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "MODE",
      label: "Mode",
      required: true,
      placeholder: "SelectMode",
      isFieldFocused: true,
      fullWidth: true,
      options: (dependentValue, formState, _, authState) => {
        return API.getGstOtwardModeDdw({
          BASE_COMP_CD: authState?.baseCompanyID,
          BASE_BRANCH_CD: authState?.user?.baseBranchCode,
          TEMPLATE_TYPE: "OUT",
        });
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (currentField?.value === "C") {
          formState.gridApi?.current?.setColumnsVisible(
            ["CHEQUE_NO", "CHEQUE_DT"],
            false
          );
          formState?.setDilogueOpen(true);
        } else {
          formState.gridApi?.current?.setColumnsVisible(
            ["CHEQUE_NO", "CHEQUE_DT"],
            true
          );
        }
        if (formState?.defaultView === "new") {
          const gridData = getGridRowData(formState.gridApi);
          const formattedData = gridData.map(({ TEMP_DISP, ...rest }) => rest);
          formState?.gridApi.current.setGridOption("rowData", formattedData);

          formState?.gridApi.current.setGridOption("pinnedBottomRowData", []);
        }
        await formState.setDataOnFieldChange("GET_DATA", {
          MODE_VALUE: currentField?.value,
        });
      },
      runPostValidationHookAlways: true,
      __EDIT__: {
        isReadOnly: true,
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (formState?.defaultView === "edit") {
          return true;
        }
      },
      defaultValue: "T",
      _optionsKey: "getGstOtwardModeDdw",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ModeisRequired"] }],
      },
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "ENTERED_DATE",
      label: "EntryDate",
      isWorkingDate: true,
      // __NEW__: {},
      fullWidth: true,
      format: "dd/MM/yyyy",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        dependentFields: ["MODE"],
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.["MODE"]?.value === "C") {
            return true;
          } else {
            return false;
          }
        },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.defaultView === "edit") {
            return true;
          }
        },
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: (
          currentField,
          formState,
          authState,
          dependentFieldValue,
          reqFlag
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value) {
            return {
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              WIDTH_BAL: { value: "" },
              ACCT_TYPE: { value: "" },
              GSTIN: { value: "" },
            };
          }
        },
        GridProps: {
          xs: 12,
          sm: 2.4,
          md: 2.4,
          lg: 2.4,
          xl: 2.4,
        },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        dependentFields: ["MODE"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.defaultView === "edit") {
            return true;
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.["MODE"]?.value === "C") {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossFieldValues: (
          currentField,
          formState,
          authState,
          dependentFieldValue,
          reqFlag
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value) {
            return {
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              WIDTH_BAL: { value: "" },
              GSTIN: { value: "" },
            };
          }
        },
        GridProps: {
          xs: 12,
          sm: 2.4,
          md: 2.4,
          lg: 2.4,
          xl: 2.4,
        },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["BRANCH_CD", "ACCT_TYPE", "MODE"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.defaultView === "edit") {
            return true;
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.["MODE"]?.value === "C") {
            return true;
          } else {
            return false;
          }
        },
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value &&
            currentField?.value &&
            dependentFieldValues?.MODE?.value === "T" &&
            formState?.defaultView === "new"
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                ) ?? "",
              SCREEN_REF: formState?.docCD ?? "",
              ENT_COMP_CD: authState?.companyID ?? "",
              ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            formState.handleButtonDisable(true);
            removeExistingRowData(formState?.gridApi);
            const postData = await API.getAccountDetail(reqParameters);
            let btn99, returnVal;
            for (let i = 0; i < postData?.length; i++) {
              if (postData?.[i]?.O_STATUS === "999") {
                formState?.handleButtonDisable(false);
                await formState.MessageBox({
                  messageTitle: postData?.O_MSG_TITLE?.length
                    ? postData?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.[i]?.O_STATUS === "99") {
                formState?.handleButtonDisable(false);
                const btnName = await formState.MessageBox({
                  messageTitle: postData?.O_MSG_TITLE?.length
                    ? postData?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.[i]?.O_STATUS === "9") {
                formState?.handleButtonDisable(false);
                await formState.MessageBox({
                  messageTitle: postData?.O_MSG_TITLE?.length
                    ? postData?.O_MSG_TITLE
                    : "Alert",
                  message: postData?.[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              } else if (postData?.[i]?.O_STATUS === "0") {
                formState?.handleButtonDisable(false);
                if (btn99 !== "No") {
                  returnVal = postData?.[i];
                  formState?.setDilogueOpen(true);
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.ACCT_TYPE?.optionData
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              WIDTH_BAL: {
                value: returnVal?.WIDTH_BAL ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              GSTIN: {
                value: returnVal?.GSTIN ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
            };
          }
        },
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 2.4,
          md: 2.4,
          lg: 2.4,
          xl: 2.4,
        },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "WIDTH_BAL",
      label: "Balance",
      fullWidth: true,
      dependentFields: ["MODE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.["MODE"]?.value === "C") {
          return true;
        } else {
          return false;
        }
      },
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account_Name",
      dependentFields: ["MODE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.["MODE"]?.value === "C") {
          return true;
        } else {
          return false;
        }
      },
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 4.8,
        sm: 4.8,
        lg: 4.8,
        xl: 4.8,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "GSTIN",
      label: "Gstin",
      dependentFields: ["MODE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.["MODE"]?.value === "C") {
          return true;
        } else {
          return false;
        }
      },
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.4,
        sm: 2.4,
        lg: 2.4,
        xl: 2.4,
      },
    },
  ],
};

export const GstOutwardColumn = {
  gridConfig: {
    gridLabel: "GST Outward Entry",
  },
  columns: (authState, formState, setSaveButton, defaultView) => {
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
      {
        accessor: "TEMP_DISP",
        columnName: "Template*",
        headerClass: "required",
        sequence: 2,
        alignment: "left",
        width: 200,
        minWidth: 180,
        maxWidth: 220,
        componentType: "autocomplete",
        options: async () => await getTemplateOptions(formState, authState),

        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["TemplateRequire"] }],
        },
        name: "TEMP_DISP_ID",
      },
      {
        accessor: "TAXABLE_VALUE",
        columnName: "ChargeAmount*",
        headerClass: "required",
        alignment: "right",
        sequence: 3,
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        componentType: "amountField",
        singleClickEdit: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          maxLength: 15,
        },
        postValidationSetCrossAccessorValues: (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any
        ) =>
          handleBlurChargeAmount(
            value,
            node,
            api,
            accessor,
            onValueChange,
            formState,
            authState
          ),

        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["ChargeAmountrequired"] }],
        },
      },
      {
        accessor: "TAX_AMOUNT",
        columnName: "taxAmount",
        sequence: 4,
        alignment: "right",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        isReadOnly: true,
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
      },
      {
        accessor: "disableChequeDate",
        isVisible: false,
      },

      {
        accessor: "CHEQUE_NO",
        columnName: "ChequeNo",
        sequence: 5,
        alignment: "right",
        width: 100,
        minWidth: 80,
        maxWidth: 120,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        cellClass: "currency",
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
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          accessor: any,
          onValueChange: any,
          context: any
        ) =>
          handleBlurCheckNo(
            value,
            node,
            api,
            accessor,
            onValueChange,
            context,
            formState,
            authState
          ),
      },
      {
        accessor: "CHEQUE_DT",
        columnName: "ChequeDate",
        sequence: 6,
        alignment: "left",
        width: 150,
        minWidth: 150,
        maxWidth: 150,
        isReadOnly: (params) => {
          if (params.node?.data?.disableChequeDate || params.value)
            return false;

          return true;
        },
        componentType: "DatePickerCell",
        singleClickEdit: true,
        displayComponentType: "DisplayDateCell",
        validate: validateChequeDate,
      },

      {
        accessor: "REMARKS",
        columnName: "Remarks*",
        headerClass: "required",
        sequence: 7,
        alignment: "left",
        width: 200,
        minWidth: 200,
        maxWidth: 200,
        displayComponentType: "DisplayCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["RemarksIsRequired"] }],
        },
        componentType: "NumberFormat",
        singleClickEdit: true,
        FormatProps: {
          uppercase: true,
          allowAlphaNumeric: true,
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        sequence: 8,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        cellClass: "numeric-cell-text-alignment",
        pinned: "right",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: (params) => {
            handleDeleteButtonClick(params);
            setSaveButton(false);
          },

          disabled: defaultView === "view",
        },
      },
    ];
  },
};
