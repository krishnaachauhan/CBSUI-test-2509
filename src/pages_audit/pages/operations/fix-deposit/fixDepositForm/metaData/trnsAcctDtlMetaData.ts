import { utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "../../api";
import { validateHOBranch } from "components/utilFunction/function";
import { t } from "i18next";
import { isValid } from "date-fns";

export const commonTextFieldStyle = {
  "& .MuiInputAdornment-root": {
    WebkitTextFillColor: "rgb(255, 255, 255) !important",
  },
  "& .MuiInputBase-root": {
    background: "var(--theme-color5)",
  },
  "& .MuiInputBase-input": {
    WebkitTextFillColor: "rgb(255, 255, 255) !important",
  },
};

export const TransferAcctDetailFormMetadata = {
  form: {
    name: "transferAcctDetail",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
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
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
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
      name: "CR_COMP_CD",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_FD_AMOUNT",
      label: "PaymentAmount",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      textFieldStyle: commonTextFieldStyle,
      GridProps: { xs: 6, sm: 6, md: 2.4, lg: 1.9, xl: 1.6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "DIFF_AMOUNT",
      label: "DiffAmount",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      dependentFields: ["TOTAL_FD_AMOUNT", "TOTAL_DR_AMOUNT"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.TOTAL_FD_AMOUNT?.value) -
          Number(dependentFields?.TOTAL_DR_AMOUNT?.value);

        return value ?? "0";
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: commonTextFieldStyle,
      GridProps: { xs: 6, sm: 6, md: 2.4, lg: 1.9, xl: 1.6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_DR_AMOUNT",
      label: "",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      dependentFields: ["TRNDTLS"],
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["TRNDTLS"])
            ? dependentFieldState?.["TRNDTLS"]
            : []
        ).reduce((accum, obj) => accum + Number(obj.AMOUNT?.value), 0);

        return accumulatedTakeoverLoanAmount;
      },
      textFieldStyle: commonTextFieldStyle,
      GridProps: { xs: 6, sm: 6, md: 2.4, lg: 1.9, xl: 1.6 },
    },

    {
      render: {
        componentType: "arrayField",
      },
      name: "TRNDTLS",
      fixedRows: false,
      isDisplayCount: true,
      isRemoveButton: false,
      isScreenStyle: false,
      displayCountName: "Record",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.TRNDTLS) ? data?.TRNDTLS : [];
        if (dataArray?.length > 0) {
          for (let i = 0; i < dataArray?.length; i++) {
            const item = dataArray[0];
            if (
              item.BRANCH_CD.trim() &&
              item.ACCT_TYPE.trim() &&
              item.ACCT_CD.trim() &&
              item.AMOUNT.trim()
            ) {
              return true;
            }
          }
          return {
            reason: t("fdTransferFormRequiredMsgForArrayfield"),
          };
        } else {
          return true;
        }
      },
      _fields: [
        {
          render: {
            componentType: "_accountNumber",
          },
          branchCodeMetadata: {
            name: "BRANCH_CD",
            isFieldFocused: true,
            fullWidth: true,
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

            GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 1.3 },
          },
          accountTypeMetadata: {
            name: "ACCT_TYPE",
            dependentFields: ["BRANCH_CD"],
            runPostValidationHookAlways: true,
            validationRun: "onChange",
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              if (
                currentField?.value &&
                !dependentFieldValues?.["TRNDTLS.BRANCH_CD"]?.value
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
            GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 1.3 },
          },
          accountCodeMetadata: {
            name: "ACCT_CD",
            dependentFields: ["BRANCH_CD", "ACCT_TYPE"],
            runPostValidationHookAlways: true,
            autoComplete: "off",
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldsValues
            ) => {
              if (formState?.isSubmitting) return {};
              formState?.handleDisableButton(true);
              try {
                if (
                  currentField.value &&
                  !dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]?.value
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
                  dependentFieldsValues?.["TRNDTLS.BRANCH_CD"]?.value &&
                  dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]?.value
                ) {
                  const reqParameters = {
                    BRANCH_CD:
                      dependentFieldsValues?.["TRNDTLS.BRANCH_CD"]?.value,
                    COMP_CD: authState?.companyID,
                    ACCT_TYPE:
                      dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]?.value,
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]
                        ?.optionData?.[0] ?? {}
                    ),
                    SCREEN_REF: "FD_DR_ACT",
                  };
                  let postData = await API.validateAccountAndGetDetail(
                    reqParameters
                  );

                  let returnVal;
                  for (const obj of postData?.[0]?.MSG) {
                    const continueProcess = await formState?.showMessageBox(
                      obj
                    );
                    if (!continueProcess) {
                      break;
                    }
                    if (obj?.O_STATUS === "0") {
                      returnVal = postData[0];
                    }
                  }
                  return {
                    ACCT_CD: returnVal
                      ? {
                          value: utilFunction.getPadAccountNumber(
                            currentField?.value,
                            dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ??
                              {}
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
                    },
                    WIDTH_BAL: {
                      value: returnVal?.WIDTH_BAL ?? "",
                    },
                    TYPE_CD: {
                      value: returnVal?.TYPE_CD ?? "",
                    },
                    CHEQUE_NO: {
                      value: returnVal?.CHEQUE_NO ?? "",
                    },
                    STATUS: {
                      value: returnVal?.STATUS ?? "",
                    },
                    AMOUNT: {
                      value: "",
                    },
                  };
                } else if (!currentField?.value) {
                  return {
                    ACCT_NM: { value: "" },
                    WIDTH_BAL: { value: "" },
                    TYPE_CD: { value: "" },
                    CHEQUE_NO: { value: "" },
                    STATUS: { value: "" },
                    AMOUNT: { value: "" },
                  };
                }
                return {};
              } catch (error: any) {
                const btn = await formState?.MessageBox({
                  messageTitle: "Error",
                  message: error?.error_msg || "Unknownerroroccured",
                  icon: "ERROR",
                  buttonNames: ["Ok"],
                });
                if (btn === "Ok") {
                  return {
                    ACCT_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                    ACCT_NM: { value: "" },
                    WIDTH_BAL: { value: "" },
                    TYPE_CD: { value: "" },
                    CHEQUE_NO: { value: "" },
                    STATUS: { value: "" },
                    AMOUNT: { value: "" },
                  };
                }
              } finally {
                formState?.handleDisableButton(false);
              }
              return {};
            },
            GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 1.3 },
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          label: "AccountName",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 4.5, md: 4.5, lg: 4.5, xl: 2.6 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "WIDTH_BAL",
          label: "Balance",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 1.5 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHEQUE_NO",
          label: "ChequeNo",
          placeholder: "FromChequeNo",
          type: "text",
          autoComplete: "off",
          required: true,
          maxLength: 6,
          dependentFields: ["BRANCH_CD", "ACCT_TYPE", "ACCT_CD", "TYPE_CD"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleDisableButton(true);
            try {
              if (
                currentField.value &&
                dependentFieldsValues?.["TRNDTLS.ACCT_CD"]?.value.length === 0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "EnterAccountInformation",
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  return {
                    CHEQUE_NO: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                    ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (
                currentField.value &&
                dependentFieldsValues?.["TRNDTLS.ACCT_CD"]?.value.length
              ) {
                if (formState?.isSubmitting) return {};
                let postData = await GeneralAPI.getChequeNoValidation({
                  BRANCH_CD:
                    dependentFieldsValues?.["TRNDTLS.BRANCH_CD"]?.value ?? "",
                  ACCT_TYPE:
                    dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]?.value ?? "",
                  ACCT_CD:
                    dependentFieldsValues?.["TRNDTLS.ACCT_CD"]?.value ?? "",
                  CHEQUE_NO: currentField.value,
                  TYPE_CD:
                    dependentFieldsValues?.["TRNDTLS.TYPE_CD"]?.value ?? "",
                  SCREEN_REF: formState?.screenRef ?? "",
                });

                let returnVal;
                for (const obj of postData) {
                  if (
                    obj?.O_STATUS === "999" ||
                    obj?.O_STATUS === "99" ||
                    obj?.O_STATUS === "9"
                  ) {
                    const buttonName = await formState?.MessageBox({
                      messageTitle: obj?.O_MSG_TITLE?.length
                        ? obj?.O_MSG_TITLE
                        : obj?.O_STATUS === "9"
                        ? "Alert"
                        : obj?.O_STATUS === "99"
                        ? "Confirmation"
                        : "ValidationFailed",
                      message: obj?.O_MESSAGE ?? "",
                      buttonNames:
                        obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                      loadingBtnName: ["Yes"],
                      icon:
                        obj?.O_STATUS === "999"
                          ? "ERROR"
                          : obj?.O_STATUS === "99"
                          ? "CONFIRM"
                          : obj?.O_STATUS === "9"
                          ? "WARNING"
                          : "INFO",
                    });
                    if (
                      obj?.O_STATUS === "999" ||
                      (obj?.O_STATUS === "99" && buttonName === "No")
                    ) {
                      break;
                    }
                  } else if (obj?.O_STATUS === "0") {
                    returnVal = postData[0];
                  }
                }
                return {
                  CHEQUE_NO: returnVal
                    ? {
                        value: currentField?.value,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                };
              }
            } catch (error: any) {
              const btn = await formState?.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg || "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btn === "Ok") {
                return {
                  CHEQUE_NO: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } finally {
              formState?.handleDisableButton(false);
            }
            return {};
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
          },
          shouldExclude: (_, dependentFieldsValues, formState) => {
            return Boolean(formState?.screenFlag === "paymentTransfer");
          },
          validate: (columnValue) => {
            if (!Boolean(columnValue.value.trim())) {
              return "ChequeNorequired";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 1.2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CHEQUE_DATE",
          label: "ChequeDate",
          placeholder: "",
          defaultValue: new Date(),
          isWorkingDate: true,
          format: "dd/MM/yyyy",
          type: "text",
          fullWidth: true,
          shouldExclude: (_, dependentFieldsValues, formState) => {
            return Boolean(formState?.screenFlag === "paymentTransfer");
          },
          validate: (currentField, dependentFields, formState) => {
            if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 1.3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "",
          placeholder: "",
          type: "text",
          autoComplete: "off",
          dependentFields: [
            "WIDTH_BAL",
            "STATUS",
            "BRANCH_CD",
            "ACCT_TYPE",
            "ACCT_CD",
          ],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleDisableButton(true);
            try {
              if (
                Number(currentField?.value) >
                  Number(dependentFieldsValues?.["TRNDTLS.WIDTH_BAL"]?.value) &&
                formState?.screenFlag !== "paymentTransfer"
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "NotEnterAmountMoreThanWithdrawableBalance",
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  return {
                    AMOUNT: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else {
                if (
                  dependentFieldsValues?.["TRNDTLS.BRANCH_CD"]?.value &&
                  dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]?.value &&
                  dependentFieldsValues?.["TRNDTLS.ACCT_CD"]?.value
                ) {
                  const reqParameters = {
                    A_COMP_CD: authState?.companyID ?? "",
                    A_BRANCH_CD:
                      dependentFieldsValues?.["TRNDTLS.BRANCH_CD"]?.value ?? "",
                    A_ACCT_TYPE:
                      dependentFieldsValues?.["TRNDTLS.ACCT_TYPE"]?.value ?? "",
                    A_ACCT_CD:
                      dependentFieldsValues?.["TRNDTLS.ACCT_CD"]?.value ?? "",
                    A_TYPE_CD: "6",
                    A_AMOUNT: currentField?.value ?? "",
                    A_TYPE: "C",
                    WORKING_DATE: authState?.workingDate ?? "",
                    A_STATUS:
                      dependentFieldsValues?.["TRNDTLS.STATUS"]?.value ?? "",
                    USERNAME: authState?.user?.id ?? "",
                    USERROLE: authState?.role ?? "",
                    A_SCREEN_REF: formState?.screenRef ?? "",
                  };
                  const postData = await API.checkLienAcct(reqParameters);

                  if (postData?.[0]?.STATUS === "999") {
                    let buttonName = await formState?.MessageBox({
                      messageTitle: "ValidationFailed",
                      message: postData?.[0]?.MSG ?? "",
                      buttonNames: ["Ok"],
                      icon: "ERROR",
                    });
                    if (buttonName === "Ok") {
                      return {
                        AMOUNT: {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: true,
                        },
                      };
                    }
                  } else if (postData?.[0]?.STATUS === "0") {
                    return {
                      AMOUNT: {
                        value: currentField?.value,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                    };
                  }
                }
                return {};
              }
              return {};
            } catch (error: any) {
              const btn = await formState?.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg || "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btn === "Ok") {
                return {
                  AMOUNT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } finally {
              formState?.handleDisableButton(false);
            }
            return {};
          },
          FormatProps: {
            allowNegative: false,
          },
          validate: (columnValue) => {
            if (!Boolean(columnValue.value)) {
              return "amountRequired";
            } else if (columnValue.value <= 0) {
              return "AmountMustGreaterThanZero";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 1.5 },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "TYPE_CD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "STATUS",
        },
      ],
    },
  ],
};

//FD Renew transfer form metadata
export const RenewTransferMetadata = {
  form: {
    name: "renewTransfer",
    label: "RenewAmount",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
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
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "amountField",
      },
      name: "PAYMENT_AMOUNT",
      label: "PaymentAmount",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      textFieldStyle: commonTextFieldStyle,
      GridProps: { xs: 12, sm: 6, md: 2.5, lg: 2.5, xl: 2.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "RENEW_AMT",
      label: "RenewAmount",
      isFieldFocused: true,
      placeholder: "",
      type: "text",
      dependentFields: ["PAYMENT_AMOUNT"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (
          Number(currentField?.value) >
          Number(dependentFieldsValues?.PAYMENT_AMOUNT?.value)
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "ValidationFailed",
            message: "RenewalAmountShouldLessOrEqualsPaymentAmount",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          if (buttonName === "Ok") {
            return {
              RENEW_AMT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        }

        return {};
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      validate: (columnValue) => {
        if (!Boolean(columnValue.value)) {
          return "AmountIsRequired";
        } else if (columnValue.value <= 0) {
          return "AmountCantNegativeOrZero";
        }
        return "";
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 2.5, lg: 2.5, xl: 2.5 },
    },
  ],
};
