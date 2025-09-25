import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
import { t } from "i18next";
import { commonTextFieldStyle } from "pages_audit/pages/operations/fix-deposit/fixDepositForm/metaData/trnsAcctDtlMetaData";
import { GeneralAPI } from "registry/fns/functions";

export const RecurringPaymentTransferFormMetaData = {
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
        componentType: "amountField",
      },
      name: "PAYMENT_AMOUNT",
      label: "PaymentAmount",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      dependentFields: ["TRF_AMT"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        return Number(dependentFields?.TRF_AMT?.value ?? 0);
      },
      textFieldStyle: commonTextFieldStyle,
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 4, md: 2.4, lg: 1.9, xl: 1.6 },
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
      dependentFields: ["TRF_AMT", "RECPAYTRANS"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const totalAmount = (
          Array.isArray(dependentFieldsValues?.["RECPAYTRANS"])
            ? dependentFieldsValues?.["RECPAYTRANS"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.AMOUNT?.value ?? 0), 0);
        const formattedAmount = totalAmount?.toFixed(2);
        let diffAmount =
          Number(dependentFieldsValues?.TRF_AMT?.value ?? 0) -
          Number(formattedAmount);
        return diffAmount ?? "0";
      },
      textFieldStyle: commonTextFieldStyle,
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 4, md: 2.4, lg: 1.9, xl: 1.6 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL",
      label: "TotalAmount",
      placeholder: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      dependentFields: ["RECPAYTRANS"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const amount = (
          Array.isArray(dependentFieldsValues?.["RECPAYTRANS"])
            ? dependentFieldsValues?.["RECPAYTRANS"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.AMOUNT?.value ?? 0), 0);
        const formattedAmount = amount?.toFixed(2);
        return formattedAmount ?? "0";
      },
      textFieldStyle: commonTextFieldStyle,
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 4, md: 2.4, lg: 1.9, xl: 1.6 },
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
              item?.DC_BRANCH_CD?.trim() &&
              item?.DC_ACCT_TYPE?.trim() &&
              item?.DC_ACCT_CD?.trim() &&
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
            name: "DC_BRANCH_CD",
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
              formState?.handleDisableButton(true);
              try {
                const isHOBranch = await validateHOBranch(
                  currentField,
                  formState?.MessageBox,
                  authState
                );
                if (isHOBranch) {
                  return {
                    DC_BRANCH_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                  };
                }
                return {
                  DC_ACCT_TYPE: { value: "" },
                  DC_ACCT_CD: { value: "", ignoreUpdate: false },
                  ACCT_NM: { value: "" },
                };
              } catch (error: any) {
                const btn = await formState.MessageBox({
                  messageTitle: "Error",
                  message: error?.error_msg || "Unknownerroroccured",
                  icon: "ERROR",
                  buttonNames: ["Ok"],
                });
                if (btn === "Ok") {
                  return {
                    DC_BRANCH_CD: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                    DC_ACCT_TYPE: { value: "" },
                    DC_ACCT_CD: { value: "", ignoreUpdate: false },
                    ACCT_NM: { value: "" },
                  };
                }
              } finally {
                formState?.handleDisableButton(false);
              }
              return {};
            },
            GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
          },
          accountTypeMetadata: {
            name: "DC_ACCT_TYPE",
            dependentFields: ["DC_BRANCH_CD"],
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
                !dependentFieldValues?.["RECPAYTRANS.DC_BRANCH_CD"]?.value
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "enterBranchCode",
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (buttonName === "Ok") {
                  return {
                    DC_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                    DC_BRANCH_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              }
              return {
                DC_ACCT_CD: { value: "", ignoreUpdate: false },
                ACCT_NM: { value: "" },
              };
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
          },
          accountCodeMetadata: {
            name: "DC_ACCT_CD",
            autoComplete: "off",
            dependentFields: ["DC_ACCT_TYPE", "DC_BRANCH_CD"],
            runPostValidationHookAlways: true,
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
                  currentField?.value &&
                  !dependentFieldsValues?.["RECPAYTRANS.DC_ACCT_TYPE"]?.value
                ) {
                  let buttonName = await formState?.MessageBox({
                    messageTitle: "ValidationFailed",
                    message: "enterAccountType",
                    buttonNames: ["Ok"],
                    icon: "ERROR",
                  });

                  if (buttonName === "Ok") {
                    return {
                      DC_ACCT_CD: {
                        value: "",
                        isFieldFocused: false,
                        ignoreUpdate: false,
                      },
                      DC_ACCT_TYPE: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                    };
                  }
                } else if (
                  currentField?.value &&
                  dependentFieldsValues?.["RECPAYTRANS.DC_BRANCH_CD"]?.value &&
                  dependentFieldsValues?.["RECPAYTRANS.DC_ACCT_TYPE"]?.value
                ) {
                  const reqParameters = {
                    BRANCH_CD:
                      dependentFieldsValues?.["RECPAYTRANS.DC_BRANCH_CD"]
                        ?.value ?? "",
                    COMP_CD: authState?.companyID ?? "",
                    ACCT_TYPE:
                      dependentFieldsValues?.["RECPAYTRANS.DC_ACCT_TYPE"]
                        ?.value ?? "",
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.["RECPAYTRANS.DC_ACCT_TYPE"]
                        ?.optionData?.[0] ?? ""
                    ),
                    SCREEN_REF: formState?.screenRef ?? "",
                    GD_TODAY_DT: authState?.workingDate ?? "",
                  };
                  let postData = await GeneralAPI.getAccNoValidation(
                    reqParameters
                  );

                  let returnVal;
                  for (const obj of postData?.MSG) {
                    const continueProcess = await formState?.showMessageBox(
                      obj
                    );
                    if (!continueProcess) {
                      break;
                    }
                    if (obj?.O_STATUS === "0") {
                      returnVal = postData;
                    }
                  }
                  return {
                    DC_ACCT_CD: returnVal
                      ? {
                          value: utilFunction.getPadAccountNumber(
                            currentField?.value,
                            dependentFieldsValues?.["RECPAYTRANS.DC_ACCT_TYPE"]
                              ?.optionData?.[0] ?? ""
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
                  };
                } else if (!currentField?.value) {
                  return {
                    ACCT_NM: { value: "" },
                  };
                }
                return {};
              } catch (error: any) {
                const btn = await formState.MessageBox({
                  messageTitle: "Error",
                  message: error?.error_msg || "Unknownerroroccured",
                  icon: "ERROR",
                  buttonNames: ["Ok"],
                });
                if (btn === "Ok") {
                  return {
                    DC_ACCT_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                    ACCT_NM: { value: "" },
                  };
                }
              } finally {
                formState?.handleDisableButton(false);
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
          name: "AMOUNT",
          label: "Amount",
          placeholder: "Enter Amount",
          autoComplete: "off",
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
          name: "REMARKS",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CHEQUE_NO",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CHEQUE_DATE",
        },
      ],
    },
  ],
};
