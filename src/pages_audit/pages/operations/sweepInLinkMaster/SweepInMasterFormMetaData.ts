import { utilFunction } from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import {
  getAgGridSRNo,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import { handleBlurAccCode, handleButtonClick } from "./gridColumnHelper";
import { isEmpty } from "lodash";

export const SweepInMasterFormMetaData = {
  form: {
    name: "sweep-in-master-entry",
    label: "",
    validationRun: "onBlur",
    resetFieldOnUnmount: false,
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      typography: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          const isHOBranch = await validateHOBranch(
            currentField,
            formState?.MessageBox,
            authState
          );
          if (isHOBranch) {
            return {
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            ACCT_NM: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        runExternalFunction: true,
        runPostValidationHookAlways: true,
        isFieldFocused: true,
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SWEEPIN",
          });
        },
        _optionsKey: "get_Account_Type",
        dependentFields: ["BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value && !dependentFieldValues?.BRANCH_CD?.value) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            !Boolean(currentField?.displayValue) &&
            !Boolean(currentField?.value)
          ) {
            return {
              ACCT_NM: { value: "" },
            };
          } else if (!Boolean(currentField?.displayValue)) {
            return {};
          }
          if (currentField.value && !dependentFieldsValues?.ACCT_TYPE?.value) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.BRANCH_CD?.value &&
            dependentFieldsValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              P_COMP_CD: authState?.companyID,
              P_ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.ACCT_TYPE?.optionData?.[0]
              ),
              P_ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value,
              P_BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
              C_COMP_CD: "",
              C_BRANCH_CD: "",
              C_ACCT_TYPE: "",
              C_ACCT_CD: "",
              SWEEP_DTL: [],
              FLAG: "M",
              WORKING_DATE: authState?.workingDate,
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD,
            };

            const postData = await API.validateDisAcct(reqParameters);
            let returnValue;
            if (postData?.length > 0) {
              const response = await handleDisplayMessages(
                postData,
                formState?.MessageBox
              );
              if (Object.keys(response).length > 0) {
                returnValue = postData;
              } else {
                returnValue = "";
              }
            }
            return {
              ACCT_CD:
                returnValue !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
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
                value: returnValue?.[0]?.ACCT_NM ?? "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          } else if (!currentField?.value) {
            return {
              ACCT_NM: { value: "", ignoreUpdate: false },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      placeholder: "AccountName",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 6, sm: 5, md: 4, lg: 6, xl: 6 },
    },
  ],
};

export const SweepInAgGridMetadata = {
  GridMetaDataType: {
    gridLabel: "",
  },
  columns: ({ authState, formState, deleteRow, CloseMessageBox }) => {
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
        name: "DISPLAY_FD_SWEEP_IN_DEF_TRAN_CD",
        accessor: "FD_SWEEP_IN_DEF_TRAN_CD",
        columnName: "SweepDefinition",
        headerTooltip: "Type",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 250,
        maxWidth: 300,
        sortable: false,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        options: async () => {
          return await API.getSweepDefination({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.baseBranchCode ?? "",
          });
        },
        isReadOnly: (params) => {
          if (params?.data?.ROW_EXIST) {
            return true;
          }
          return false;
        },
        postValidationSetCrossAccessorValues: async (
          value,
          node,
          api,
          field,
          onValueChange,
          formState
        ) => {
          const flagValue = node?.data?.FD_SWEEP_IN_DEF_TRAN_CD_OPT?.ACCTFLAG;
          const sweepType = node?.data?.FD_SWEEP_IN_DEF_TRAN_CD_OPT?.FLAG;

          let displayValue = "";

          if (!isEmpty(flagValue)) {
            const options = await API.getAcctFlag({ SWEEP_TYPE: sweepType });
            const matchedOption = options.find(
              (opt) => opt.value === flagValue
            );
            displayValue = matchedOption?.label || "";
          }

          updateNodeDataAndFocus(
            node,
            {
              ACCT_FLAG: flagValue || "",
              ACCT_FLAG_DISP: displayValue || "",
            },
            api,
            { focusedAccessor: "ACCT_FLAG", isFieldFocused: false }
          );
        },
      },
      {
        name: "ACCT_FLAG_DISP",
        accessor: "ACCT_FLAG",
        columnName: "AcctFlag",
        headerTooltip: "Type",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 120,
        maxWidth: 200,
        sortable: false,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AcctFlagRequired"] }],
        },
        FormatProps: {
          refetchOnFocus: true,
        },
        options: async ({ value, node, kdata }) => {
          const data = await API.getAcctFlag({
            SWEEP_TYPE: node?.data?.FD_SWEEP_IN_DEF_TRAN_CD_OPT?.FLAG ?? "",
          });
          return data;
        },
        isReadOnly: (node) => {
          if (
            node?.data?.FD_SWEEP_IN_DEF_TRAN_CD_OPT?.ALLOWEDITBRANCH === "Y"
          ) {
            return true;
          }
          if (node?.context?.gridContext?.mode !== "new") {
            return true;
          }
          return false;
        },
      },
      {
        accessor: "C_BRANCH_CD",
        columnName: "SweepBranch",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 200,
        minWidth: 200,
        maxWidth: 250,
        componentType: "autocomplete",
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        options: (data) => {
          return GeneralAPI.getBranchCodeList({
            COMP_CD: authState?.companyID || "",
          });
        },
        isReadOnly: (params) => {
          if (params?.data?.ROW_EXIST) {
            return true;
          }
          return false;
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["SweepBranch"] }],
        },
        name: "C_BRANCH_CD_ID",
      },
      {
        accessor: "C_ACCT_TYPE",
        columnName: "SweepAcctType",
        sequence: 7,
        alignment: "left",
        headerClass: "required",
        width: 200,
        minWidth: 200,
        maxWidth: 250,
        sortable: false,
        componentType: "autocomplete",
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        options: () => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SWEEPOUT",
          });
        },
        isReadOnly: (params) => {
          if (params?.data?.ROW_EXIST) {
            return true;
          }
          return false;
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["SweepAcctType"] }],
        },
        name: "C_ACCT_TYPE_ID",
      },
      {
        accessor: "C_ACCT_CD",
        columnName: "SweepAcctCode",
        sequence: 8,
        alignment: "left",
        headerClass: "required",
        width: 200,
        minWidth: 200,
        maxWidth: 250,
        sortable: false,
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
        ) => {
          handleBlurAccCode(
            value,
            node,
            api,
            field,
            onValueChange,
            formState,
            authState
          );
        },
        isReadOnly: (params) => {
          if (params?.data?.ROW_EXIST) {
            return true;
          }
          return false;
        },
        // schemaValidation: {
        //   type: "string",
        //   rules: [{ name: "required", params: ["SweepAcctCode"] }],
        // },
        validate: (params) => {
          if (
            params?.data?.ACCT_FLAG === "N" ||
            params?.data?.ACCT_FLAG_DISP === "New"
          ) {
            return "";
          }
          if (!params?.data?.C_ACCT_CD) {
            return "SweepAcctCode";
          }
          return "";
        },
      },
      {
        accessor: "ACCT_NM",
        columnName: "SweepAcctName",
        sequence: 9,
        alignment: "left",
        width: 250,
        minWidth: 250,
        maxWidth: 250,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: true,
        componentType: "NumberFormat",
        FormatProps: {
          uppercase: true,
        },
      },
      {
        isCheckBox: true,
        accessor: "ACTIVE_STATUS",
        columnName: "activeStatus",
        headerTooltip: "Active",
        alignment: "center",
        minWidth: 120,
        maxWidth: 120,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        isReadOnly: (params) => {
          if (params.context?.gridContext?.mode === "view") {
            return true;
          } else {
            return false;
          }
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Remove",
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
          handleButtonClick: (params) =>
            handleButtonClick(params, deleteRow, CloseMessageBox),
          disabled: (params) => {
            if (params.context?.gridContext?.mode === "view") {
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
