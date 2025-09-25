import { GridMetaDataType, utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
import { GeneralAPI } from "registry/fns/functions";

export const accountFindmetaData = {
  form: {
    name: "accountNumber",
    label: "EnterParameters",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
      _accountNumber: {
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
            ACCT_TYPE: { value: "", ignoreUpdate: false },
            ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
            TRAN_BAL: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        isFieldFocused: true,
        dependentFields: ["BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountBranch",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });

            if (buttonName === "Ok") {
              return {
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_NM: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                TRAN_BAL: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "", ignoreUpdate: false },
            TRAN_BAL: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
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
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });

            if (buttonName === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                TRAN_BAL: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            Boolean(dependentFieldValues?.BRANCH_CD?.value) &&
            Boolean(dependentFieldValues?.ACCT_TYPE?.value) &&
            currentField?.value
          ) {
            formState?.handleButtonDisable(true);
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value ?? "",
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
            };
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);
            let btn99, returnVal;
            for (let i = 0; i < postData?.MSG.length; i++) {
              if (postData?.MSG[i]?.O_STATUS === "999") {
                const btnName = await formState.MessageBox({
                  messageTitle:
                    postData?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG[i]?.O_STATUS === "99") {
                const btnName = await formState.MessageBox({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
                  message: postData?.MSG[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.MSG[i]?.O_STATUS === "9") {
                const btnName = await formState.MessageBox({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE ?? "Alert",
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              } else if (postData?.MSG[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData;
                  formState.setFocus();
                } else {
                  returnVal = "";
                }
              }
            }
            formState.setDataOnFieldChange("fdPaymentInstrudtl", {
              COMP_CD: authState?.companyID ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value ?? "",
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            });
            formState?.handleButtonDisable(false);

            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value ?? "",
                        dependentFieldValues?.TRN_ACCT_TYPE?.optionData?.[0] ??
                          ""
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
              TRAN_BAL: {
                value: returnVal?.TRAN_BAL ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          } else if (!currentField?.value) {
            return {
              ACCT_NM: { value: "", ignoreUpdate: false },
              TRAN_BAL: { value: "", ignoreUpdate: false },
            };
          }
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
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
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Balance",
      placeholder: "Balance",
      type: "text",
      isReadOnly: true,
      textInputFromRight: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
export const FdInterestPaymentGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "FD_NO",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowRowSelection: true,
    allowColumnReordering: true,
    disableSorting: true,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    defaultPageSize: 15,
    pageSizes: [15, 30, 50],
    containerHeight: {
      min: "55vh",
      max: "55vh",
    },
    allowColumnHiding: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "CUSTOMER_ID",
      columnName: "CustomerId",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 150,
    },
    {
      accessor: "FULL_ACCOUNT",
      columnName: "AccountNum",
      sequence: 2,
      alignment: "right",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "HOLDER_ACCT_NM",
      columnName: "AccountHolder",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "FD_NO",
      columnName: "FDNum",
      sequence: 4,
      alignment: "right",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "TRAN_DT",
      columnName: "DepositDate",
      sequence: 5,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 190,
    },
    {
      accessor: "TOT_AMT",
      columnName: "DepositAmount",
      sequence: 6,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isCurrencyCode: false,
      isTotalWithCurrency: true,
      totalDecimalCount: 2,
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "MATURITY_DT",
      columnName: "MaturityDate",
      sequence: 7,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 190,
    },
    {
      accessor: "MATURITY_AMT",
      columnName: "MaturityAmount",
      sequence: 8,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isTotalWithCurrency: true,
      totalDecimalCount: 2,
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "MATURE_INST_DIS",
      columnName: "MatureInstruction",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 250,
      maxWidth: 350,
    },
    {
      accessor: "CREDIT_DTL",
      columnName: "CreditDetails",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "PAY_MODE_DISPLAY",
      columnName: "Instruction",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },
  ],
};
export const PaidFDGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "PaidFDDetails",
    rowIdColumn: "FD_NO",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    allowRowSelection: false,
    disableSorting: true,
    disableGroupBy: true,
    enablePagination: true,
    defaultPageSize: 15,
    pageSizes: [15, 30, 50],
    containerHeight: {
      min: "55vh",
      max: "55vh",
    },
    allowColumnHiding: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "TRAN_DT",
      columnName: "DepositDate",
      sequence: 1,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 190,
    },
    {
      accessor: "TOT_AMT",
      columnName: "PrincipalAmount",
      sequence: 2,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "PAID_DT",
      columnName: "PaidDate",
      sequence: 3,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 190,
    },
    {
      accessor: "PAYMENT_MODE",
      columnName: "PaymentMode",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "PAYMENT_AMT",
      columnName: "PaymentAmount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "MATURITY_DT",
      columnName: "MaturityDate",
      sequence: 6,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 190,
    },
    {
      accessor: "FD_NO",
      columnName: "FDNum",
      sequence: 7,
      alignment: "right",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "PERIOD_DIS",
      columnName: "Period",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 120,
    },
    {
      accessor: "INT_RATE",
      columnName: "Rate",
      sequence: 9,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 80,
      maxWidth: 150,
    },
    {
      accessor: "TERM_DIS",
      columnName: "Term",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "IssueDate",
      sequence: 11,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 140,
      minWidth: 90,
      maxWidth: 190,
    },
    {
      accessor: "MATURITY_AMT",
      columnName: "MaturityAmount",
      sequence: 12,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "TOT_TDS_RECO_INT_AMT",
      columnName: "TDSRecoverAmount",
      sequence: 13,
      alignment: "right",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "RENEW_REMARK",
      columnName: "RenewRemark",
      sequence: 14,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
  ],
};
