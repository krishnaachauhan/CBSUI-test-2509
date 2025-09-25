import { utilFunction } from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { t } from "i18next";
import { isEmpty } from "lodash";
import { GeneralAPI } from "registry/fns/functions";

export const ShareAppEntryTransferFormMetaData = {
  form: {
    name: "RecurringPaymentTransfer",
    label: "",
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
          xl: 12,
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
      amountField: {
        fullWidth: true,
      },
    },
  },

  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER1",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 4.8,
        lg: 6.3,
        xl: 7.2,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TRF_AMT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
    },

    {
      render: {
        componentType: "arrayField",
      },
      name: "RECPAYTRANS",
      isScreenStyle: true,
      displayCountName: "Record",
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.RECPAYTRANS)
          ? data?.RECPAYTRANS
          : [];
        if (dataArray?.length > 0) {
          for (let i = 0; i < dataArray?.length; i++) {
            const item = dataArray[0];
            if (
              item?.BRANCH_CD?.trim() &&
              item?.ACCT_TYPE?.trim() &&
              item?.ACCT_CD?.trim() &&
              String(item?.AMOUNT)?.trim()
            ) {
              return true;
            }
          }
          return {
            reason: t("recurringPaymentTransferFormRequiredMsgForArrayfield"),
          };
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },

      _fields: [
        {
          render: { componentType: "_accountNumber" },
          branchCodeMetadata: {
            name: "BRANCH_CD",
            fullWidth: true,
            isFieldFocused: true,
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
                ACCT_TYPE: { value: "" },
                ACCT_CD: { value: "", ignoreUpdate: false },
                ACCT_NM: { value: "" },
              };
            },
            GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
          },
          accountTypeMetadata: {
            name: "ACCT_TYPE",
            dependentFields: ["BRANCH_CD"],
            runPostValidationHookAlways: true,
            validationRun: "onChange",
            options: (dependentValue, formState, _, authState) => {
              return GeneralAPI.get_Account_Type({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: dependentValue?.BRANCH_CD?.value ?? "",
                USER_NAME: authState?.user?.id ?? "",
                DOC_CD: "SHAREDR",
              });
            },
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              if (
                currentField?.value &&
                !dependentFieldValues?.["RECPAYTRANS.BRANCH_CD"]?.value
              ) {
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
            fullWidth: true,
            GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
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
                currentField?.value &&
                !dependentFieldsValues?.["RECPAYTRANS.ACCT_TYPE"]?.value
              ) {
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
                dependentFieldsValues?.["RECPAYTRANS.BRANCH_CD"]?.value &&
                dependentFieldsValues?.["RECPAYTRANS.ACCT_TYPE"]?.value
              ) {
                // typeof formState?.handleDisableButton === "function" &&
                // //   formState?.handleDisableButton(true);
                const reqParameters = {
                  BRANCH_CD:
                    dependentFieldsValues?.["RECPAYTRANS.BRANCH_CD"]?.value ??
                    "",
                  COMP_CD: authState?.companyID ?? "",
                  ACCT_TYPE:
                    dependentFieldsValues?.["RECPAYTRANS.ACCT_TYPE"]?.value ??
                    "",
                  ACCT_CD: utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldsValues?.["RECPAYTRANS.ACCT_TYPE"]
                      ?.optionData?.[0] ?? ""
                  ),
                  SCREEN_REF: formState?.docCD ?? "",
                  GD_TODAY_DT: authState?.workingDate ?? "",
                };
                let postData = await GeneralAPI.getAccNoValidation(
                  reqParameters
                );
                const isReturn = await handleDisplayMessages(
                  postData?.MSG,
                  formState?.MessageBox
                );
                const formData =
                  await formState?.formRef?.current?.getFieldData();
                const {
                  APP_AMT = 0,
                  FEES_AMT = 0,
                  STNRY_FEES_AMT = 0,
                  SERVICE_TAX = 0,
                } = formData || {};
                const debitAmount =
                  Number(APP_AMT) +
                  Number(FEES_AMT) +
                  Number(STNRY_FEES_AMT) +
                  Number(SERVICE_TAX);

                if (isEmpty(isReturn)) {
                  return {
                    ACCT_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    ACCT_NM: {
                      value: "",
                    },
                    AMOUNT: {
                      value: "",
                    },
                  };
                } else {
                  return {
                    ACCT_CD: {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldsValues?.["RECPAYTRANS.ACCT_TYPE"]
                          ?.optionData?.[0] ?? ""
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                    ACCT_NM: {
                      value: postData?.ACCT_NM ?? "",
                    },
                    ACCT_TRAN_BAL: {
                      value: postData?.TRAN_BAL ?? 0,
                    },
                    CHEQUE_NO: {
                      value: postData?.CHEQUE_NO ?? "",
                    },
                    AMOUNT: {
                      value: debitAmount ?? 0,
                    },
                  };
                }
              } else if (!currentField?.value) {
                return {
                  ACCT_NM: { value: "" },
                };
              }
              return {};
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
          },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          label: "AccountName",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 7, md: 7, lg: 4, xl: 4 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "ACCT_TRAN_BAL",
          label: "Tran. Bal",
          placeholder: "Enter Amount",
          autoComplete: "off",
          fullWidth: true,
          isReadOnly: true,
          GridProps: {
            xs: 12,
            sm: 5,
            md: 5,
            lg: 2,
            xl: 2,
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TYPE_CD",
          label: "Trx",
          placeholder: "Enter Amount",
          autoComplete: "off",
          fullWidth: true,
          isReadOnly: true,
          defaultValue: 6,
          GridProps: {
            xs: 12,
            sm: 5,
            md: 5,
            lg: 2,
            xl: 2,
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHEQUE_NO",
          label: "ChequeNumber",
          type: "text",
          placeholder: "EnterChequeNumber",
          maxLength: 10,
          autoComplete: "off",
          className: "textInputFromRight",
          FormatProps: {
            isAllowed: (values) => {
              if (values?.value.length > 10) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["TYPE_CD", "ACCT_TYPE", "ACCT_CD", "BRANCH_CD"],
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            // if (currentField?.displayValue === "") {
            //   return {};
            // }
            console.log("currentField: ", currentField, dependentFieldValues);
            if (
              Boolean(currentField.value) &&
              (dependentFieldValues?.["RECPAYTRANS.BRANCH_CD"]?.value
                ?.length === 0 ||
                dependentFieldValues?.["RECPAYTRANS.ACCT_TYPE"]?.value
                  ?.length === 0 ||
                dependentFieldValues?.["RECPAYTRANS.ACCT_CD"]?.value?.length ===
                  0)
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Alert",
                message: "EnterAccountInformation",
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
                  CHEQUE_NO: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              currentField?.value &&
              dependentFieldValues?.["RECPAYTRANS.ACCT_TYPE"]?.value &&
              dependentFieldValues?.["RECPAYTRANS.ACCT_CD"]?.value &&
              dependentFieldValues?.["RECPAYTRANS.BRANCH_CD"]?.value
            ) {
              const reqParameters = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD:
                  dependentFieldValues?.["RECPAYTRANS.BRANCH_CD"]?.value ?? "",
                ACCT_TYPE:
                  dependentFieldValues?.["RECPAYTRANS.ACCT_TYPE"]?.value ?? "",
                ACCT_CD:
                  dependentFieldValues?.["RECPAYTRANS.ACCT_CD"]?.value ?? "",
                CHEQUE_NO: currentField?.value,
                SCREEN_REF: formState?.docCD ?? "",
                TYPE_CD:
                  dependentFieldValues["RECPAYTRANS.TYPE_CD"]?.value ?? "",
              };
              //   formState?.handleButtonDisable(true);
              const postData = await GeneralAPI.getChequeNoValidation(
                reqParameters
              );
              const response = await handleDisplayMessages(
                postData,
                formState?.MessageBox
              );
              console.log("response: ", response);

              return {
                CHEQUE_NO: !isEmpty(response)
                  ? {
                      value: currentField?.value ?? "",
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
              };
              //   return {};
            } else if (!currentField?.value) {
              return {
                CHEQUE_NO: { value: "", ignoreUpdate: true },
              };
            }
            return {};
          },
          GridProps: { xs: 12, sm: 4, md: 2.5, lg: 1.75, xl: 1.75 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "Debit",
          placeholder: "Enter Amount",
          // autoComplete: "off",
          fullWidth: true,
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["amountRequired"] }],
          },
          GridProps: {
            xs: 12,
            sm: 5,
            md: 5,
            lg: 2,
            xl: 2,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "DC_COMP_CD",
          dependentFields: ["COMP_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            return dependentFields?.COMP_CD?.value;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "VALUE_DT",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "TRAN_DT",
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "SIGN_VIEW",
          label: "Signature",
          endsIcon: "",
          type: "text",
          rotateIcon: "scale(2)",
          placeholder: "",
          ignoreInSubmit: true,
          fullWidth: true,
          dependentFields: ["ACCT_TYPE", "ACCT_CD"],
          GridProps: {
            xs: 12,
            sm: 1.5,
            md: 1.2,
            lg: 1.2,
            xl: 1.2,
          },
        },
      ],
    },
  ],
};
