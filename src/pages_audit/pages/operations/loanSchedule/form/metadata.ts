import { format } from "date-fns";
import {
  getDueDate,
  getFinalInstallment,
  getLoanInterestAmount,
  getNoOfInstallment,
  getRescheduleDropDown,
  getRescheduleLoanInterestAmount,
  updateInterestRate,
} from "../api";

export const LoanRegenerateFormMetaData = {
  form: {
    name: "loanRegenerateForm",
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
      name: "SANCTIONED_AMT",
      label: "SanctionedAmount",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VALIDATE_LIMIT_AMT",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "DisbursedAmount",
      type: "text",
      maxLength: 15,
      fullWidth: true,
      isFieldFocused: true,
      dependentFields: [
        "INT_RATE",
        "INST_NO",
        "TYPE_CD",
        "INSTALLMENT_TYPE",
        "SANCTIONED_AMT",
        "VALIDATE_LIMIT_AMT",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        const formattedValue = parseFloat(
          formState?.dtlData?.LIMIT_AMOUNT || 0
        ).toFixed(2);
        if (formattedValue === currentField?.value && !formState.flag) {
          return {};
        }
        if (
          Number(currentField?.value) >
          Number(dependentFieldsValues?.["SANCTIONED_AMT"]?.value)
        ) {
          const buttonName = await formState.MessageBox({
            messageTitle: "ValidationFailed",
            message: "DisburseAmounTValidationMsg",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          if (buttonName === "Ok") {
            return {
              LIMIT_AMOUNT: {
                value: dependentFieldsValues?.["VALIDATE_LIMIT_AMT"]?.value,
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        } else if (
          currentField?.value &&
          Number(currentField?.value) <=
            Number(dependentFieldsValues?.["SANCTIONED_AMT"]?.value) &&
          dependentFieldsValues?.["TYPE_CD"]?.value &&
          dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value
        ) {
          const reqParams = {
            LIMIT_AMOUNT: currentField?.value ?? "",
            INT_RATE: dependentFieldsValues?.["INT_RATE"]?.value ?? "",
            INST_NO: dependentFieldsValues?.["INST_NO"]?.value ?? "",
            TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value ?? "",
            INSTALLMENT_TYPE:
              dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
          };
          const getApiData = await getLoanInterestAmount(reqParams);
          formState.flag = true;
          return {
            INST_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
              ignoreUpdate: true,
            },
            VALIDATE_INT_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
            },
            VALIDATE_LIMIT_AMT: {
              value: currentField?.value ?? "",
            },
          };
        } else if (!currentField?.value) {
          return {
            INST_RS: {
              value: "",
              ignoreUpdate: true,
            },
            VALIDATE_LIMIT_AMT: {
              value: currentField?.value ?? "",
            },
          };
        }
      },
      FormatProps: {
        allowNegative: false,
      },
      GridProps: { xs: 12, sm: 3.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: { componentType: "datePicker" },
      name: "INS_START_DT",
      label: "InstallmentStartDate",
      placeholder: "",
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["Installment Start Date is Required."] },
        ],
      },
      isRequired: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "InterestRate",
      fullWidth: true,
      required: true,
      maxLength: 5,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestRateIsRequired"] }],
      },
      dependentFields: [
        "LIMIT_AMOUNT",
        "INST_NO",
        "TYPE_CD",
        "INSTALLMENT_TYPE",
        "RATE_WEF",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        const formattedValue = parseFloat(
          formState?.dtlData?.INT_RATE || 0
        ).toFixed(2);
        if (formattedValue === currentField?.value && !formState.intRateFlag) {
          return {};
        }
        if (
          currentField?.value &&
          dependentFieldsValues?.["TYPE_CD"]?.value &&
          dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value
        ) {
          const reqParams = {
            INT_RATE: currentField?.value ?? "",
            LIMIT_AMOUNT: dependentFieldsValues?.["LIMIT_AMOUNT"]?.value ?? "",
            INST_NO: dependentFieldsValues?.["INST_NO"]?.value ?? "",
            TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value ?? "",
            INSTALLMENT_TYPE:
              dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
          };
          const getApiData = await getLoanInterestAmount(reqParams);
          formState.intRateFlag = true;
          return {
            INST_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
              ignoreUpdate: true,
            },
            VALIDATE_INT_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
            },
            RATE_WEF: {
              value: authState?.workingDate
                ? format(new Date(authState?.workingDate), "dd/MMM/yyyy")
                : "",
            },
          };
        } else if (!currentField?.value) {
          return {
            INST_RS: {
              value: "",
              ignoreUpdate: true,
            },
            VALIDATE_INT_RS: {
              value: "",
            },
            RATE_WEF: {
              value: authState?.workingDate
                ? format(new Date(authState?.workingDate), "dd/MMM/yyyy")
                : "",
            },
          };
        }
      },
      FormatProps: {
        isAllowed: (values) => {
          //@ts-ignore
          if (values.floatValue > 99.99) {
            return false;
          }
          if (values.value.length > 5) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "datePicker" },
      name: "INST_DUE_DT",
      label: "DueDate",
      placeholder: "",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: { componentType: "datePicker" },
      name: "RATE_WEF",
      label: "W.E.F.",
      placeholder: "",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "INST_NO",
      label: "NoofInstallment",
      placeholder: "",
      fullWidth: true,
      autoComplete: "off",
      className: "textInputFromRight",
      maxLength: 5,
      FormatProps: {
        allowNegative: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["NoOfInstallmentIsRequired"] }],
      },
      dependentFields: [
        "LIMIT_AMOUNT",
        "INT_RATE",
        "TYPE_CD",
        "INSTALLMENT_TYPE",
        "INS_START_DT",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (
          formState?.dtlData?.INST_NO === currentField?.value &&
          !formState.noOfInstFlag
        ) {
          return {};
        }
        formState.noOfInstFlag = true;
        if (
          dependentFieldsValues?.["TYPE_CD"]?.value &&
          dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value
        ) {
          const reqParams = {
            INST_NO: currentField?.value ?? "",
            INT_RATE: dependentFieldsValues?.["INT_RATE"]?.value ?? "",
            LIMIT_AMOUNT: dependentFieldsValues?.["LIMIT_AMOUNT"]?.value ?? "",
            TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value ?? "",
            INSTALLMENT_TYPE:
              dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
          };
          const getApiData = await getLoanInterestAmount(reqParams);
          const reqestParams = {
            INST_NO: currentField?.value ?? "",
            INST_START_DATE: dependentFieldsValues?.["INS_START_DT"]?.value
              ? format(
                  new Date(dependentFieldsValues?.["INS_START_DT"]?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            INSTALLMENT_TYPE:
              dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
          };
          const getDataForDueDate = await getDueDate(reqestParams);
          return {
            INST_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
              ignoreUpdate: true,
            },
            VALIDATE_INT_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
            },
            INST_DUE_DT: {
              value: getDataForDueDate?.[0]?.DUE_DATE ?? "",
              ignoreUpdate: true,
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "amountField" },
      name: "INST_RS",
      label: "InstallmentAmount",
      placeholder: "",
      fullWidth: true,
      maxLength: 15,
      required: true,
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (formState?.rows?.[0]?.REG_INST_AMT_DISABLE === "Y") {
          return true;
        } else {
          return false;
        }
      },
      dependentFields: ["VALIDATE_INT_RS"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (
          Number(currentField?.value) <
          Number(dependentFieldsValues?.["VALIDATE_INT_RS"]?.value)
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "ValidationFailed",
            message: "InstallmentAmountValidation",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          if (buttonName === "Ok") {
            return {
              INST_RS: {
                value: dependentFieldsValues?.["VALIDATE_INT_RS"]?.value ?? "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        }
      },
      FormatProps: {
        allowNegative: false,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InstallmentAmountIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 3.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VALIDATE_INT_RS",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INSTALLMENT_TYPE",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      label: "",
      placeholder: "",
    },
  ],
};

export const LoanRescheduleFormMetaData = {
  form: {
    name: "loanRescheduleForm",
    label: "AccountLoanScheduleRateChange",
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
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "INST_START_DT",
      label: "InstallmentStartDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 1.6, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "RATE_WEF",
      label: "EffectiveDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 1.6, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INST_DUE_DT",
      label: "DueDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 1.6, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "OVERDUE_AMT",
      label: "OverDue",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "OUTSTANDING_BAL",
      label: "Outstanding",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1.9, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "IDEAL_BALANCE",
      label: "IdealBalance",
      fullWidth: true,
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1.9, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DUPLICATE_INST_AMT",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "EMI_AMT_CHANGE",
      label: "ChangeTenure",
      defaultValue: false,
      fullWidth: true,
      isFieldFocused: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
      },
      validationRun: "onChange",
      GridProps: {
        style: {
          paddingTop: "40px",
        },
        xs: 6,
        sm: 3,
        md: 2.2,
        lg: 1.6,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "InterestRate",
      fullWidth: true,
      required: true,
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestRateIsRequired"] }],
      },
      isFieldFocused: true,
      dependentFields: [
        "IDEAL_ACTUAL",
        "IDEAL_BALANCE",
        "OUTSTANDING_BAL",
        "OUT_SUBSIDY",
        "TYPE_CD",
        "FINAL_INST_NO",
        "INSTALLMENT_TYPE",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
        const formattedValue = parseFloat(
          formState?.headerData?.[0]?.INT_RATE || 0
        ).toFixed(2);
        if (formattedValue === currentField?.value && !formState.flag) {
          return {};
        }
        if (currentField?.value) {
          const reqParams = {
            IDEAL_ACTUAL: dependentFieldsValues?.["IDEAL_ACTUAL"]?.value ?? "",
            IDEAL_BALANCE:
              dependentFieldsValues?.["IDEAL_BALANCE"]?.value ?? "",
            OUTSTANDING_BAL:
              dependentFieldsValues?.["OUTSTANDING_BAL"]?.value ?? "",
            OUT_SUBSIDY: dependentFieldsValues?.["OUT_SUBSIDY"]?.value ?? "",
            TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value ?? "",
            FINAL_INST_NO:
              Number(dependentFieldsValues?.["FINAL_INST_NO"]?.value) > 0
                ? dependentFieldsValues?.["FINAL_INST_NO"]?.value
                : "0",
            INT_RATE:
              Number(currentField?.value) > 0 ? currentField?.value : "0",
            INSTALLMENT_TYPE:
              dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
          };
          const getApiData = await getRescheduleLoanInterestAmount(reqParams);
          formState.flag = true;
          return {
            INST_RS: {
              value: getApiData?.[0]?.INST_RS ?? "",
              ignoreUpdate: true,
            },
            VALIDATE_INT_AMT: {
              value: getApiData?.[0]?.INST_RS ?? "",
              ignoreUpdate: true,
            },
            IDEAL_ACTUAL: {
              isFieldFocused: true,
              ignoreUpdate: true,
            },
            DUPLICATE_INST_AMT: {
              value: getApiData?.[0]?.INST_RS ?? "",
              ignoreUpdate: true,
            },
          };
        } else {
          return {
            INST_RS: {
              value: "",
              ignoreUpdate: true,
            },
            VALIDATE_INT_AMT: {
              value: "",
            },
            IDEAL_ACTUAL: {
              isFieldFocused: true,
              ignoreUpdate: true,
            },
            DUPLICATE_INST_AMT: {
              value: "",
              ignoreUpdate: true,
            },
          };
        }
      },
      maxLength: 5,
      FormatProps: {
        isAllowed: (values) => {
          //@ts-ignore
          if (values.value.length > 5) {
            return false;
          }
          if (values.floatValue > 99.99) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 2, md: 1.5, lg: 1.2, xl: 1.5 },
    },
    {
      render: {
        componentType: "select",
      },
      options: getRescheduleDropDown,
      _optionsKey: "getRescheduleDropDown",
      defaultValue: "O",
      name: "IDEAL_ACTUAL",
      label: "RescheduleWith",
      fullWidth: true,
      dependentFields: [
        "IDEAL_BALANCE",
        "OUTSTANDING_BAL",
        "OUT_SUBSIDY",
        "TYPE_CD",
        "FINAL_INST_NO",
        "INT_RATE",
        "INSTALLMENT_TYPE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
        if (currentField?.displayValue.trim() === "") {
          return {};
        }
        const reqParams = {
          INT_RATE:
            Number(dependentFieldsValues?.["INT_RATE"]?.value) > 0
              ? dependentFieldsValues?.["INT_RATE"]?.value
              : "0",
          IDEAL_BALANCE: dependentFieldsValues?.["IDEAL_BALANCE"]?.value ?? "",
          OUTSTANDING_BAL:
            dependentFieldsValues?.["OUTSTANDING_BAL"]?.value ?? "",
          OUT_SUBSIDY: dependentFieldsValues?.["OUT_SUBSIDY"]?.value ?? "",
          TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value ?? "",
          FINAL_INST_NO:
            Number(dependentFieldsValues?.["FINAL_INST_NO"]?.value) > 0
              ? dependentFieldsValues?.["FINAL_INST_NO"]?.value
              : "0",
          IDEAL_ACTUAL: currentField?.value ?? "",
          INSTALLMENT_TYPE:
            dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
        };
        const getApiData = await getRescheduleLoanInterestAmount(reqParams);
        return {
          INST_RS: {
            value: getApiData?.[0]?.INST_RS ?? "",
            ignoreUpdate: true,
            isFieldFocused: true,
          },
          VALIDATE_INT_AMT: {
            value: getApiData?.[0]?.INST_RS ?? "",
            ignoreUpdate: true,
          },
          DUPLICATE_INST_AMT: {
            value: getApiData?.[0]?.INST_RS ?? "",
            ignoreUpdate: true,
          },
        };
      },
      GridProps: { xs: 12, sm: 4, md: 2.3, lg: 2, xl: 1.4 },
    },
    {
      render: { componentType: "amountField" },
      name: "INST_RS",
      label: "InstallmentAmount",
      placeholder: "",
      fullWidth: true,
      autoComplete: "off",
      required: true,
      FormatProps: {
        allowNegative: false,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InstallmentAmountIsRequired"] }],
      },
      dependentFields: [
        "EMI_AMT_CHANGE",
        "VALIDATE_INT_AMT",
        "OUTSTANDING_BAL",
        "INT_RATE",
        "DUPLICATE_INST_AMT",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
        if (
          currentField?.value ===
          parseFloat(
            dependentFieldsValues?.["DUPLICATE_INST_AMT"]?.value
          ).toFixed(2)
        ) {
          return {};
        }
        const formattedValue = parseFloat(
          formState?.headerData?.[0]?.INST_RS || 0
        ).toFixed(2);
        if (formattedValue === currentField?.value && !formState.instAmtFlag) {
          return {};
        }
        if (
          Number(currentField?.value) <
            Number(dependentFieldsValues?.["VALIDATE_INT_AMT"]?.value) &&
          !Boolean(dependentFieldsValues?.["EMI_AMT_CHANGE"]?.value)
        ) {
          const buttonName = await formState.MessageBox({
            messageTitle: "ValidationFailed",
            message: "InstallmentAmountValidation",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          formState.instAmtFlag = true;
          if (buttonName === "Ok") {
            return {
              INST_RS: {
                value: dependentFieldsValues?.["VALIDATE_INT_AMT"]?.value,
              },
              DUPLICATE_INST_AMT: {
                value: dependentFieldsValues?.["VALIDATE_INT_AMT"]?.value,
              },
            };
          }
        } else if (Boolean(dependentFieldsValues?.["EMI_AMT_CHANGE"]?.value)) {
          const reqParams = {
            INST_RS: currentField?.value ?? "0",
            OUTSTANDING_BAL:
              dependentFieldsValues?.["OUTSTANDING_BAL"]?.value ?? "",
            INT_RATE: dependentFieldsValues?.["INT_RATE"]?.value ?? "",
          };
          const getApiData = await getNoOfInstallment(reqParams);
          formState.instAmtFlag = true;
          return {
            INST_NO: {
              value: getApiData?.[0]?.INST_NO ?? "",
              ignoreUpdate: true,
            },
            FINAL_INST_NO: {
              value: getApiData?.[0]?.INST_NO ?? "",
            },
            VALIDATE_INT_AMT: {
              value: currentField?.value,
            },
            DUPLICATE_INST_AMT: {
              value: currentField?.value,
            },
            VALIDATE_INST_NO: {
              value: getApiData?.[0]?.INST_NO ?? "",
              ignoreUpdate: true,
            },
          };
        } else {
          return {
            VALIDATE_INT_AMT: {
              value: currentField?.value ?? "",
            },
            DUPLICATE_INST_AMT: {
              value: currentField?.value ?? "",
            },
            VALIDATE_INST_NO: {
              value: "",
              ignoreUpdate: true,
            },
          };
        }
      },
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: false,
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 1.4 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VALIDATE_INST_NO",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "INST_NO",
      label: "NoofInstallment",
      // maxLength: 5,
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          return true;
        },
      },
      className: "textInputFromRight",
      placeholder: "",
      type: "text",
      fullWidth: true,
      autoComplete: "off",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["NoOfInstallmentIsRequired"] }],
      },
      dependentFields: [
        "REMAINING_INST_NO",
        "IDEAL_ACTUAL",
        "IDEAL_BALANCE",
        "OUTSTANDING_BAL",
        "OUT_SUBSIDY",
        "TYPE_CD",
        "INT_RATE",
        "INSTALLMENT_TYPE",
        "INST_START_DT",
        "VALIDATE_INST_NO",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
        if (
          currentField?.value ===
            dependentFieldsValues?.["VALIDATE_INST_NO"]?.value &&
          currentField?.value !== ""
        ) {
          return {};
        }
        if (
          formState?.headerData?.[0]?.INST_NO === currentField?.value &&
          !formState.noOfInstFlag
        ) {
          return {};
        }
        const reqParams = {
          INST_NO: Number(currentField?.value) > 0 ? currentField?.value : "0",
          REMAINING_INST_NO:
            dependentFieldsValues?.["REMAINING_INST_NO"]?.value ?? "",
          ORG_INST_NO: formState?.headerData[0]?.INST_NO ?? "",
        };
        const getFinalInstallmentData = await getFinalInstallment(reqParams);
        formState.noOfInstFlag = true;
        const getFinalInstNumber = Boolean(
          getFinalInstallmentData?.[0]?.FINAL_INST_NO
        )
          ? getFinalInstallmentData?.[0]?.FINAL_INST_NO ?? ""
          : "";
        const installmentParams = {
          IDEAL_ACTUAL: dependentFieldsValues?.["IDEAL_ACTUAL"]?.value ?? "",
          IDEAL_BALANCE: dependentFieldsValues?.["IDEAL_BALANCE"]?.value ?? "",
          OUTSTANDING_BAL:
            dependentFieldsValues?.["OUTSTANDING_BAL"]?.value ?? "",
          OUT_SUBSIDY: dependentFieldsValues?.["OUT_SUBSIDY"]?.value ?? "",
          TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value ?? "",
          FINAL_INST_NO: getFinalInstNumber ?? "",
          INT_RATE:
            Number(dependentFieldsValues?.["INT_RATE"]?.value) > 0
              ? dependentFieldsValues?.["INT_RATE"]?.value
              : "0",
          INSTALLMENT_TYPE:
            dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
        };
        const getInstallmentAmtData = await getRescheduleLoanInterestAmount(
          installmentParams
        );
        const dueDatePara = {
          INSTALLMENT_TYPE:
            dependentFieldsValues?.["INSTALLMENT_TYPE"]?.value ?? "",
          INST_START_DATE: dependentFieldsValues?.["INST_START_DT"]?.value
            ? format(
                new Date(dependentFieldsValues?.["INST_START_DT"]?.value),
                "dd/MMM/yyyy"
              )
            : "",
          INST_NO: Number(currentField?.value) > 0 ? currentField?.value : "0",
        };
        const getDueDateData = await getDueDate(dueDatePara);

        return {
          FINAL_INST_NO: {
            value: getFinalInstallmentData?.[0]?.FINAL_INST_NO ?? "",
            ignoreUpdate: true,
          },
          INST_DUE_DT: {
            value: getDueDateData?.[0]?.DUE_DATE ?? "",
            ignoreUpdate: true,
          },
          INST_RS: {
            value: getInstallmentAmtData?.[0]?.INST_RS ?? "",
            ignoreUpdate: true,
          },
          VALIDATE_INT_AMT: {
            value: getInstallmentAmtData?.[0]?.INST_RS ?? "",
          },
          DUPLICATE_INST_AMT: {
            value: getInstallmentAmtData?.[0]?.INST_RS ?? "",
            ignoreUpdate: true,
          },
          VALIDATE_INST_NO: {
            value: currentField?.value,
            ignoreUpdate: true,
          },
        };
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 1.5, xl: 1.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemarks",
      type: "text",
      required: true,
      txtTransform: "uppercase",
      maxLength: 32,
      autoComplete: "off",
      // preventSpecialCharInput: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["RemarksIsRequired"] }],
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
      },
      GridProps: { xs: 12, sm: 9, md: 4, lg: 3.2, xl: 2.2 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "FINAL_INST_NO",
      label: "FinalInstallment",
      placeholder: "",
      fullWidth: true,
      isReadOnly: true,
      className: "textInputFromRight",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RESOLUTION_NO",
      label: "ResolutionNo",
      type: "text",
      fullWidth: true,
      txtTransform: "uppercase",
      maxLength: 50,
      autoComplete: "off",
      // preventSpecialCharInput: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("DELETE_DATA", { DELETE_DATA: true });
      },
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 3.2 },
    },
    {
      render: { componentType: "amountField" },
      name: "SUBSIDY_AMT",
      label: "Subsidy",
      placeholder: "",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "PROCEED",
      label: "Proceed",
      type: "text",
      placeholder: "",
      iconStyle: {
        fontSize: "25px !important",
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.disableButton)) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 3, sm: 3, md: 2, lg: 1.5, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "OUT_SUBSIDY",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INSTALLMENT_TYPE",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VALIDATE_INT_AMT",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "REMAINING_INST_NO",
      label: "",
      placeholder: "",
    },
  ],
};

export const LoanReviseMetaData = {
  masterForm: {
    form: {
      name: "loanReviseFormMetadata",
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
        numberFormat: {
          fullWidth: true,
        },
      },
    },
    fields: [
      {
        render: {
          componentType: "datePicker",
        },
        name: "HDR_DISBURSEMENT_DT",
        label: "DisbursementDate",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "HDR_DISBURSEMENT_AMT",
        label: "DisbursementAmount",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "HDR_INSTALLMENT_TYPE",
        label: "InstallmentType",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "HDR_INST_NO",
        label: "NoofInstallment",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "HDR_INS_START_DT",
        label: "NextInstallmentStartDate",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "HDR_INST_RS",
        label: "DisburseInstallmentAmount",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "divider",
          sequence: 1,
        },
        name: "loanScheduleDivider",
        label: "",
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "INS_START_DT",
        label: "InstallmentStartDate",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.75, xl: 1.75 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "BEGIN_BAL",
        label: "BeginningBalance",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.75, xl: 1.75 },
      },
      {
        render: {
          componentType: "rateOfInt",
        },
        name: "INT_RATE",
        label: "InterestRate",
        type: "text",
        maxLength: 5,
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values.value.length > 5) {
              return false;
            }
            if (values.floatValue > 99.99) {
              return false;
            }
            return true;
          },
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["InterestRateIsRequired"] }],
        },
        dependentFields: [
          "INS_START_DT",
          "BEGIN_BAL",
          "PRIN_DEMAND_AMT",
          "INSTALLMENT_TYPE",
          "INST_NO",
          "TYPE_CD",
          "REPAY_PRIN_AMT",
          "SR_CD",
          "TOTAL_RECORDS",
          "ACCT_CD",
          "ACCT_TYPE",
          "TRAN_CD",
          "VALIDATE_INT_RATE",
        ],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (
            Boolean(currentField?.value) &&
            currentField?.displayValue === ""
          ) {
            return {};
          }
          if (
            currentField?.value ===
              dependentFieldsValues["VALIDATE_INT_RATE"]?.value &&
            currentField?.value !== ""
          ) {
            return {};
          }
          if (currentField?.value) {
            const date = new Date(dependentFieldsValues["INS_START_DT"]?.value);
            const formattedDate = format(date, "dd/MMM/yyyy").toUpperCase();
            const reqPara = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_TYPE: dependentFieldsValues["ACCT_TYPE"]?.value ?? "",
              ACCT_CD: dependentFieldsValues["ACCT_CD"]?.value ?? "",
              TRAN_CD: dependentFieldsValues["TRAN_CD"]?.value ?? "",
              SR_CD: dependentFieldsValues["SR_CD"]?.value ?? "",
              INST_NO: dependentFieldsValues["TOTAL_RECORDS"]?.value ?? "",
              TYPE_CD: dependentFieldsValues["TYPE_CD"]?.value ?? "",
              INT_RATE: currentField?.value ?? "",
              INST_RS: "",
              INSTALLMENT_TYPE:
                dependentFieldsValues["INSTALLMENT_TYPE"]?.value ?? "",
              INS_START_DT: formattedDate ?? "",
              BEGIN_BAL: dependentFieldsValues["BEGIN_BAL"]?.value ?? "",
              PREV_PRIN_DEMAND_AMT:
                formState?.previousRowData?.PRIN_DEMAND_AMT ?? "",
              PREV_REPAY_PRIN_AMT:
                formState?.previousRowData?.REPAY_PRIN_AMT ?? "",
              SCREEN_REF: formState?.docCD ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            const getApiData = await updateInterestRate(reqPara);
            formState.setCount((prev) => prev + 1);
            formState.setDataOnFieldChange(
              "GRID_DATA",
              getApiData.map((item) => ({
                ...item,
                INT_RATE: currentField?.value,
              }))
            );
            return {
              INT_RATE: {
                value: currentField?.value,
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              VALIDATE_INT_RATE: {
                value: currentField?.value,
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INST_RS: {
                value: getApiData?.[0]?.INST_RS ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              VALIDATE_INST_RS: {
                value: getApiData?.[0]?.INST_RS ?? "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              PRIN_DEMAND_AMT: {
                value: getApiData?.[0]?.PRIN_DEMAND_AMT ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INT_DEMAND_AMT: {
                value: getApiData?.[0]?.INT_DEMAND_AMT ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              END_BAL: {
                value: getApiData?.[0]?.END_BAL ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          } else {
            formState.setCount((prev) => prev + 1);
            formState.setDataOnFieldChange("GRID_DATA", []);
            return {
              INT_RATE: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              VALIDATE_INT_RATE: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              INST_RS: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              VALIDATE_INST_RS: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              PRIN_DEMAND_AMT: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INT_DEMAND_AMT: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          }
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "INST_RS",
        label: "InstallmentAmount",
        type: "text",
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["InstallmentAmountIsRequired"] },
          ],
        },
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            //@ts-ignore
            if (values.value.length > 11) {
              return false;
            }
            return true;
          },
        },
        maxLength: 10,
        dependentFields: [
          "INS_START_DT",
          "BEGIN_BAL",
          "PRIN_DEMAND_AMT",
          "INSTALLMENT_TYPE",
          "INST_NO",
          "TYPE_CD",
          "REPAY_PRIN_AMT",
          "SR_CD",
          "TOTAL_RECORDS",
          "ACCT_CD",
          "ACCT_TYPE",
          "TRAN_CD",
          "INT_RATE",
          "VALIDATE_INST_RS",
        ],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (
            Boolean(currentField?.value) &&
            currentField?.displayValue === ""
          ) {
            return {};
          }
          if (
            currentField?.value ===
              dependentFieldsValues["VALIDATE_INST_RS"]?.value &&
            currentField?.value !== ""
          ) {
            return {};
          }
          if (currentField?.value) {
            const date = new Date(dependentFieldsValues["INS_START_DT"]?.value);
            const formattedDate = format(date, "dd/MMM/yyyy").toUpperCase();
            const reqPara = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ACCT_TYPE: dependentFieldsValues["ACCT_TYPE"]?.value ?? "",
              ACCT_CD: dependentFieldsValues["ACCT_CD"]?.value ?? "",
              TRAN_CD: dependentFieldsValues["TRAN_CD"]?.value ?? "",
              SR_CD: dependentFieldsValues["SR_CD"]?.value ?? "",
              INST_NO: dependentFieldsValues["TOTAL_RECORDS"]?.value ?? "",
              TYPE_CD: dependentFieldsValues["TYPE_CD"]?.value ?? "",
              INT_RATE: dependentFieldsValues["INT_RATE"]?.value ?? "",
              INST_RS: currentField?.value ?? "",
              INSTALLMENT_TYPE:
                dependentFieldsValues["INSTALLMENT_TYPE"]?.value ?? "",
              INS_START_DT: formattedDate ?? "",
              BEGIN_BAL: dependentFieldsValues["BEGIN_BAL"]?.value ?? "",
              PREV_PRIN_DEMAND_AMT:
                formState?.previousRowData?.PRIN_DEMAND_AMT ?? "",
              PREV_REPAY_PRIN_AMT:
                formState?.previousRowData?.REPAY_PRIN_AMT ?? "",
              SCREEN_REF: formState?.docCD ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            const getApiData = await updateInterestRate(reqPara);
            formState.setCount((prev) => prev + 1);
            formState.setDataOnFieldChange(
              "GRID_DATA",
              getApiData.map((item) => ({
                ...item,
                INT_RATE: dependentFieldsValues["INT_RATE"]?.value ?? "",
              }))
            );
            return {
              INT_RATE: {
                value: dependentFieldsValues["INT_RATE"]?.value ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              VALIDATE_INT_RATE: {
                value: dependentFieldsValues["INT_RATE"]?.value ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INST_RS: {
                value: currentField?.value,
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              VALIDATE_INST_RS: {
                value: currentField?.value,
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              PRIN_DEMAND_AMT: {
                value: getApiData?.[0]?.PRIN_DEMAND_AMT ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INT_DEMAND_AMT: {
                value: getApiData?.[0]?.INT_DEMAND_AMT ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              END_BAL: {
                value: getApiData?.[0]?.END_BAL ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          } else {
            formState.setCount((prev) => prev + 1);
            formState.setDataOnFieldChange("GRID_DATA", []);
            return {
              INT_RATE: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              VALIDATE_INT_RATE: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INST_RS: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              VALIDATE_INST_RS: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              PRIN_DEMAND_AMT: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
              INT_DEMAND_AMT: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          }
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.75, xl: 1.75 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "PRIN_DEMAND_AMT",
        label: "PrincipalDemand",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.75, xl: 1.75 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "INT_DEMAND_AMT",
        label: "InterestDemand",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.75, xl: 1.75 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "END_BAL",
        label: "EndingBalance",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.75, xl: 1.75 },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "VALIDATE_INST_RS",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "VALIDATE_INT_RATE",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "INSTALLMENT_TYPE",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "INST_NO",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACCT_TYPE",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACCT_CD",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "TRAN_CD",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "TYPE_CD",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "REPAY_PRIN_AMT",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "SR_CD",
        label: "",
        placeholder: "",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "TOTAL_RECORDS",
        label: "",
        placeholder: "",
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "LoanSchedule",
      rowIdColumn: "SR_CD",
      defaultColumnConfig: {
        width: 350,
        minWidth: 300,
        maxWidth: 400,
      },
      allowColumnReordering: true,
      disableSorting: false,
      hideHeader: true,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "40vh", max: "40vh" },
      allowRowSelection: false,
      disableLoader: false,
    },
    columns: [
      {
        accessor: "SR_CD",
        columnName: "SrNo",
        sequence: 1,
        alignment: "left",
        componentType: "default",
        width: 70,
        minWidth: 60,
        maxWidth: 100,
      },
      {
        accessor: "INS_START_DT",
        columnName: "InstallmentStartDate",
        sequence: 2,
        alignment: "center",
        componentType: "date",
        dateFormat: "dd/MM/yyyy",
        width: 150,
        minWidth: 140,
        maxWidth: 200,
      },
      {
        accessor: "BEGIN_BAL",
        columnName: "BeginningBalance",
        sequence: 3,
        alignment: "left",
        componentType: "default",
        width: 150,
        minWidth: 140,
        maxWidth: 200,
      },
      {
        accessor: "INT_RATE",
        columnName: "InterestRate",
        sequence: 4,
        alignment: "right",
        componentType: "default",
        width: 150,
        minWidth: 140,
        maxWidth: 200,
      },
      {
        accessor: "INST_RS",
        columnName: "InstallmentAmount",
        sequence: 5,
        alignment: "right",
        componentType: "default",
        width: 150,
        minWidth: 140,
        maxWidth: 200,
        isTotalWithCurrency: true,
        totalDecimalCount: 2,
      },
      {
        accessor: "PRIN_DEMAND_AMT",
        columnName: "PrincipalDemand",
        sequence: 6,
        alignment: "right",
        componentType: "default",
        width: 180,
        minWidth: 160,
        maxWidth: 200,
        isTotalWithCurrency: true,
        totalDecimalCount: 2,
      },
      {
        accessor: "INT_DEMAND_AMT",
        columnName: "InterestDemand",
        sequence: 7,
        alignment: "right",
        componentType: "default",
        width: 180,
        minWidth: 160,
        maxWidth: 200,
        isTotalWithCurrency: true,
        totalDecimalCount: 2,
      },
      {
        accessor: "END_BAL",
        columnName: "EndingBalance",
        sequence: 8,
        alignment: "right",
        componentType: "default",
        width: 200,
        minWidth: 150,
        maxWidth: 250,
      },
    ],
  },
};
