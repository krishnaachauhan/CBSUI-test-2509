import { GridMetaDataType } from "@acuteinfo/common-base";
import { utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "../api";

export const standingInsructionGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 200,
      maxWidth: 450,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [20, 30, 50],
    defaultPageSize: 20,
    containerHeight: {
      min: "33vh",
      max: "33vh",
    },
    allowFilter: false,
    allowColumnHiding: true,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "COMM_TYPE_DESC",
      columnName: "CommisionType",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 250,
      minWidth: 200,
      maxWidth: 300,
    },
    {
      accessor: "DESCRIPTION",
      columnName: "Decscription",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 250,
      minWidth: 150,
      maxWidth: 300,
    },
    {
      columnName: "",
      componentType: "default",
      isVisible: false,
      accessor: "TRAN_CD",
      sequence: 6,
      width: 160,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "ENTERED_BY",
      columnName: "EnteredBy",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 120,
    },
  ],
};

export const standingConfirmationViewGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "LINE_ID",
    defaultColumnConfig: {
      width: 200,
      maxWidth: 450,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [20, 30, 50],
    defaultPageSize: 20,
    containerHeight: {
      min: "33vh",
      max: "33vh",
    },
    allowFilter: false,
    allowColumnHiding: true,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "CR_BRANCH_CD",
      columnName: "CreditBranchCode",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "CR_ACCT_TYPE",
      columnName: "CreditAcctType",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "CR_ACCT_CD",
      columnName: "Credit A/c No.",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      columnName: "",
      componentType: "buttonRowCell",
      buttonLabel: "CreditPhotoSign",
      accessor: "credit",
      width: 180,
      sequence: 4,
      alignment: "center",
      isVisible: true,
    },
    {
      accessor: "START_DT",
      columnName: "StartDate",
      sequence: 5,
      alignment: "left",
      componentType: "date",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "EXECUTE_DAY",
      columnName: "ExecuteOnDay",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "FEQ_TYPE",
      columnName: "FrequncyType",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "FEQ_VALUE",
      columnName: "FrequencyValue",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "BRANCH_CD",
      columnName: "DebitBranchCode",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "DR_ACCT_TYPE",
      columnName: "DebitAcctType",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "DR_ACCT_CD",
      columnName: "DebitAcctNo",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      columnName: "",
      componentType: "buttonRowCell",
      buttonLabel: "DebitPhotoSign",
      accessor: "debit",
      width: 180,
      sequence: 12,
      alignment: "center",
      isVisible: true,
    },
    {
      accessor: "SI_AMOUNT",
      columnName: "SIAmount",
      sequence: 13,
      alignment: "left",
      componentType: "currency",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
      isTotalWithCurrency: true,
    },
    {
      accessor: "SI_CHARGE",
      columnName: "SICharge",
      sequence: 14,
      alignment: "left",
      componentType: "currency",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "REMARKS",
      columnName: "Remark",
      sequence: 15,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 150,
      maxWidth: 350,
    },
    {
      accessor: "VALID_UPTO",
      columnName: "ValidUpTo",
      sequence: 16,
      alignment: "left",
      componentType: "date",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "SI_COUNT",
      columnName: "",
      sequence: 17,
      alignment: "left",
      isVisible: false,
      componentType: "default",
      isReadOnly: true,
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "SI_NUMBER",
      columnName: "SINumber",
      sequence: 19,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "CR_ACCT_NM",
      columnName: "CreditAcctName",
      sequence: 20,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 50,
      maxWidth: 350,
    },
    {
      accessor: "DR_ACCT_NM",
      columnName: "DebitAcctName",
      sequence: 21,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 50,
      maxWidth: 350,
    },

    {
      columnName: "",
      componentType: "buttonRowCell",
      buttonLabel: "...",
      accessor: "edit",
      width: 80,
      sequence: 22,
      alignment: "center",
      isVisible: true,
    },
    {
      columnName: "",
      componentType: "buttonRowCell",
      buttonLabel: "Confirm",
      accessor: "confirm",
      width: 80,
      sequence: 23,
      alignment: "center",
      isVisible: true,
    },

    {
      accessor: "STATUS_DISP",
      columnName: "",
      sequence: 24,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 50,
      maxWidth: 150,
      isVisible: true,
      isReadOnly: true,
    },
  ],
};

export const EditSubDataMetaData = {
  form: {
    name: "",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    // allowColumnHiding: true,
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
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      _accountNumber: {
        fullWidth: true,
      },
      arrayField: {
        fullWidth: true,
      },
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "CreditBranchCode",
        name: "CR_BRANCH_CD",
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        isReadOnly: true,
      },
      accountTypeMetadata: {
        label: "CreditAcctType",
        name: "CR_ACCT_TYPE",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SICRTYPE",
          });
        },
        _optionsKey: "credit_acct_type",
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        isReadOnly: true,
      },
      accountCodeMetadata: {
        label: "CreditAcctNo",
        name: "CR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        isReadOnly: true,
        dependentFields: [
          "DR_ACCT_CD",
          "DR_ACCT_TYPE",
          "BRANCH_CD",
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
          "DEF_TRAN_CD",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const reqData = {
            BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_CD:
              utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ?? {}
              ) ?? "",
            DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
            EXECUTE_DAY: dependentFieldValues?.EXECUTE_DAY?.value ?? "",
            DR_ACCT_CD: dependentFieldValues?.DR_ACCT_CD?.value ?? "",
            DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
            DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
            SCREEN_REF: "TRN/394",
            ENT_BRANCH: authState?.user?.branchCode ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };

          if (
            dependentFieldValues?.CR_BRANCH_CD?.value &&
            dependentFieldValues?.CR_ACCT_TYPE?.value
          ) {
            const postData = await API.getCreditAccountvalidation({ reqData });

            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: "ValidationFailed",
                  message: postData[i]?.O_MESSAGE,
                });
                returnVal = postData[i];
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: "Confirmation",
                  message: postData[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: "Alert",
                    message: postData[i]?.O_MESSAGE,
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              CR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ??
                          {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              SI_AMOUNT: {
                value: returnVal?.SI_AMOUNT ?? "",
              },
              SI_CHARGE: {
                value: returnVal?.SI_CHARGE ?? "",
              },
              FEQ_VALUE: {
                value: returnVal?.FEQ_VALUE ?? "",
              },
              EXECUTE_DAY: {
                value: returnVal?.EXECUTE_DAY ?? "",
              },
              FEQ_TYPE: {
                value: returnVal?.FEQ_TYPE ?? "",
              },
              SI_AMOUNT_PROTECT: {
                value: returnVal?.SI_AMOUNT_PROTECT ?? "",
              },
              FLAG_ENABLE_DISABLE: {
                value: returnVal?.FLAG_ENABLE_DISABLE ?? "",
              },
            };
          }
        },

        runPostValidationHookAlways: false,
        AlwaysRunPostValidationSetCrossFieldValues: {
          alwaysRun: true,
          touchAndValidate: true,
        },
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "START_DT",
      label: "StartDate",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      required: true,
      isReadOnly: true,
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "EXECUTE_DAY",
      label: "ExecuteOnDay",
      placeholder: "EnterExecuteOnDay",
      type: "text",
      fullWidth: true,
      required: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "FEQ_TYPE",
      label: "FrequncyType",
      placeholder: "EnterFrequncyType",
      type: "text",
      options: [
        { label: "Day(s)", value: "D" },
        { label: "Month(s)", value: "M" },
        { label: "Quartely", value: "Q" },
        { label: "Half Yearly", value: "H" },
        { label: "Year(s)", value: "Y" },
      ],
      required: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      isReadOnly: true,
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "FEQ_VALUE",
      label: "FrequencyValue",
      placeholder: "EnterFrequncyValue",
      type: "text",
      fullWidth: true,
      required: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "DebitBranchCode",
        name: "BRANCH_CD",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        label: "DebitAcctType",
        name: "DR_ACCT_TYPE",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SIDRTYPE",
          });
        },
        _optionsKey: "debit_acct_type",
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        isReadOnly: true,
      },
      accountCodeMetadata: {
        label: "DebitAcctNo",
        name: "DR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        isReadOnly: true,
        dependentFields: [
          "DR_ACCT_TYPE",
          "BRANCH_CD",
          "CR_ACCT_CD",
          "DEF_TRAN_CD",
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.DR_ACCT_TYPE?.value
          ) {
            const reqData = {
              BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
              ACCT_CD: dependentFieldValues?.CR_ACCT_CD.value ?? "",
              DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
              DR_ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ?? {}
                ) ?? "",
              DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
              EXECUTE_DAY: dependentFieldValues?.["EXECUTE_DAY"]?.value ?? "",
              SCREEN_REF: "TRN/394",
              ENT_BRANCH: authState?.user?.branchCode ?? "",
              BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            const postData = await API.getDebitAccountvalidation({ reqData });
            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: "ValidationFailed",
                  message: postData[i]?.O_MESSAGE,
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: "Confirmation",
                  message: postData[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: "Alert",
                    message: postData[i]?.O_MESSAGE,
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              DR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ??
                          {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
            };
          }
        },

        runPostValidationHookAlways: false,
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_AMOUNT",
      label: "SIAmount",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_CHARGE",
      label: "SICharge",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      dependentFields: ["FLAG_ENABLE_DISABLE"],
      isReadOnly: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DEF_TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SI_AMOUNT_PROTECT",
      label: "Si_amount_protext",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FLAG_ENABLE_DISABLE",
      label: "FLAG_ENABLE_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      label: "compnay cd",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ORG",
      label: "ORG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SI_COUNT",
      label: "ORG",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remark",
      placeholder: "EnterRemark",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "VALID_UPTO",
      label: "ValidUpTo",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      required: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "DOC_STATUS",
      label: "Status",
      placeholder: "",
      fullWidth: true,
      dependentFields: ["ORG", "SI_COUNT"],
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (original?.SI_COUNT?.value > 0) {
          return false;
        } else {
          return true;
        }
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields.ORG.value === "Y") {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
  ],
};
