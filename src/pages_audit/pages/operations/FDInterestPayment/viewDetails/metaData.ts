import { utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { validateHOBranch } from "components/utilFunction/function";

export const FdInterestPaymentFormMetaData = {
  form: {
    name: "FdInterestPaymentFormUpdate",
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
          sm: 12,
          md: 12,
          lg: 12,
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
      select: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      checkbox: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "hidden",
      },
      name: "CR_COMP_CD",
      // ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CR_BRANCH_CD_1",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CR_ACCT_TYPE_1",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CR_ACCT_CD_1",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CR_ACCT_NM_1",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HOLDER_ACCT_NM",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HOLDER_ADD1",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HOLDER_CONTACT_INFO",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "BANK_FORM_HIDDEN",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "NEFT_FORM_HIDDEN",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TO_ACCT_TYPE_DIS",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FD_NO",
    },

    // Account details

    {
      render: {
        componentType: "divider",
      },
      label: "RDAC_NO",
      name: "RDAccount",
      ignoreInSubmit: true,
      isReadOnly: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "branchCode",

      placeholder: "EnterBranchCode",
      ignoreInSubmit: true,
      isReadOnly: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "accountType",

      placeholder: "EnterAccountType",
      ignoreInSubmit: true,
      isReadOnly: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNum",

      placeholder: "EnterAccountNumber",
      ignoreInSubmit: true,
      isReadOnly: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      // name: "ACCT_NAME",
      name: "HOLDER_ACCT_NM",
      label: "AccountName",
      placeholder: "EnterAccountName",
      ignoreInSubmit: true,
      isReadOnly: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Balance",

      isReadOnly: true,
      ignoreInSubmit: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.SCREEN_FLAG === "REC_ENT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOT_AMT_REC_CONF",
      label: "DepositAmount",
      isReadOnly: true,
      ignoreInSubmit: true,
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.SCREEN_FLAG === "REC_CONF") {
          return false;
        } else {
          return true;
        }
      },

      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "MATURITY_AMT_REC_CONF",
      label: "MaturityAmount",
      isReadOnly: true,
      type: "text",
      ignoreInSubmit: true,
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.SCREEN_FLAG === "REC_CONF") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    // FD/RD etail
    {
      render: {
        componentType: "divider",
      },
      label: "FDRDDtl",
      name: "FDRDDtl",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PAYMENT_MODE",
      label: "PaymentMode",
      placeholder: "SelectPaymentmode",
      options: API.getPMISCData,
      _optionsKey: "getPMISCData_PAYMENT_MODE",
      required: true,
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.SCREEN_FLAG === "REC_ENT") {
          if (Object.keys(formState?.fdDetails)?.length <= 0) {
            return true;
          } else {
            return false;
          }
        }
      },
      dependentFields: [
        "CR_BRANCH_CD_1",
        "CR_BRANCH_CD",
        "CR_ACCT_TYPE_1",
        "CR_ACCT_TYPE",
        "CR_ACCT_CD_1",
        "CR_ACCT_CD",
        "CR_ACCT_NM_1",
        "CR_ACCT_NM",
        "HOLDER_ACCT_NM",
        "ADD1",
        "HOLDER_ADD1",
        "CONTACT_INFO",
        "HOLDER_CONTACT_INFO",
        "TO_IFSCCODE",
        "BANK",
        "TO_ACCT_NO",
        "TO_ACCT_TYPE",
        "TO_ACCT_TYPE_DIS",
        "TO_ACCT_NM",
        "TO_CONTACT_NO",
        "TO_ADD1",
        "BANK_FORM_HIDDEN",
        "NEFT_FORM_HIDDEN",
      ],
      validationRun: "all",
      isFieldFocused: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value === "NEFT") {
          if (
            (formState?.fdDetails?.PAYMENT_MODE ||
              formState?.rowsData?.[0]?.data?.PAYMENT_MODE) &&
            (formState?.fdDetails?.CR_BRANCH_CD ||
              formState?.rowsData?.[0]?.data?.CR_BRANCH_CD ||
              formState?.fdDetails?.CR_ACCT_TYPE ||
              formState?.rowsData?.[0]?.data?.CR_ACCT_TYPE ||
              formState?.fdDetails?.CR_ACCT_CD ||
              formState?.rowsData?.[0]?.data?.CR_ACCT_CD ||
              Boolean(formState?.fdDetails?.ACCT_NM) ||
              Boolean(formState?.fdDetails?.ADD1) ||
              Boolean(formState?.fdDetails?.CONTACT_INFO) ||
              Boolean(formState?.fdDetails?.TO_IFSCCODE) ||
              Boolean(formState?.fdDetails?.BANK) ||
              Boolean(formState?.fdDetails?.TO_ACCT_NO) ||
              Boolean(formState?.fdDetails?.TO_ACCT_TYPE) ||
              Boolean(formState?.fdDetails?.TO_ACCT_NM) ||
              Boolean(formState?.fdDetails?.TO_CONTACT_NO) ||
              Boolean(formState?.fdDetails?.TO_ADD1) ||
              Boolean(formState?.rowsData?.[0]?.data?.ACCT_NM) ||
              Boolean(formState?.rowsData?.[0]?.data?.ADD1) ||
              Boolean(formState?.rowsData?.[0]?.data?.CONTACT_INFO) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_IFSCCODE) ||
              Boolean(formState?.rowsData?.[0]?.data?.BANK) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ACCT_NO) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ACCT_TYPE) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ACCT_NM) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_CONTACT_NO) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ADD1)) &&
            dependentFieldValues?.BANK_FORM_HIDDEN?.value === "SHOW"
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "Confirmation",
              message: "PaymentModeChangeConf",
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnName === "Yes") {
              return {
                CR_BRANCH_CD: { value: "", ignoreUpdate: true },
                CR_ACCT_TYPE: { value: "", ignoreUpdate: true },
                CR_ACCT_CD: { value: "", ignoreUpdate: true },
                CR_ACCT_NM: { value: "", ignoreUpdate: false },
                ACCT_NM: {
                  value: dependentFieldValues?.HOLDER_ACCT_NM?.value
                    ? dependentFieldValues?.HOLDER_ACCT_NM?.value
                    : "",
                },
                ADD1: {
                  value: dependentFieldValues?.HOLDER_ADD1?.value
                    ? dependentFieldValues?.HOLDER_ADD1?.value
                    : "",
                },
                CONTACT_INFO: {
                  value: dependentFieldValues?.HOLDER_CONTACT_INFO?.value
                    ? dependentFieldValues?.HOLDER_CONTACT_INFO?.value
                    : "",
                },
                NEFT_FORM_HIDDEN: {
                  value: "SHOW",
                },
                BANK_FORM_HIDDEN: {
                  value: "HIDE",
                },
              };
            }
            if (btnName === "No") {
              return {
                PAYMENT_MODE: { value: "BANKACCT" },
              };
            }
          } else {
            return {
              CR_BRANCH_CD: { value: "", ignoreUpdate: true },
              CR_ACCT_TYPE: { value: "", ignoreUpdate: true },
              CR_ACCT_CD: { value: "", ignoreUpdate: true },
              CR_ACCT_NM: { value: "", ignoreUpdate: false },
              ACCT_NM: {
                value: dependentFieldValues?.ACCT_NM?.value
                  ? dependentFieldValues?.ACCT_NM?.value
                  : dependentFieldValues?.HOLDER_ACCT_NM?.value ?? "",
              },
              ADD1: {
                value: dependentFieldValues?.ADD1?.value
                  ? dependentFieldValues?.ADD1?.value
                  : dependentFieldValues?.HOLDER_ADD1?.value ?? "",
              },
              CONTACT_INFO: {
                value: dependentFieldValues?.CONTACT_INFO?.value
                  ? dependentFieldValues?.CONTACT_INFO?.value
                  : dependentFieldValues?.HOLDER_CONTACT_INFO?.value ?? "",
              },
              NEFT_FORM_HIDDEN: {
                value: "SHOW",
              },
              BANK_FORM_HIDDEN: {
                value: "HIDE",
              },
            };
          }
        }
        if (currentField?.value === "BANKACCT") {
          if (
            (formState?.fdDetails?.PAYMENT_MODE ||
              formState?.rowsData?.[0]?.data?.PAYMENT_MODE) &&
            (formState?.fdDetails?.CR_BRANCH_CD ||
              formState?.rowsData?.[0]?.data?.CR_BRANCH_CD ||
              formState?.fdDetails?.CR_ACCT_TYPE ||
              formState?.rowsData?.[0]?.data?.CR_ACCT_TYPE ||
              formState?.fdDetails?.CR_ACCT_CD ||
              formState?.rowsData?.[0]?.data?.CR_ACCT_CD ||
              Boolean(formState?.fdDetails?.ACCT_NM) ||
              Boolean(formState?.fdDetails?.ADD1) ||
              Boolean(formState?.fdDetails?.CONTACT_INFO) ||
              Boolean(formState?.fdDetails?.TO_IFSCCODE) ||
              Boolean(formState?.fdDetails?.BANK) ||
              Boolean(formState?.fdDetails?.TO_ACCT_NO) ||
              Boolean(formState?.fdDetails?.TO_ACCT_TYPE) ||
              Boolean(formState?.fdDetails?.TO_ACCT_NM) ||
              Boolean(formState?.fdDetails?.TO_CONTACT_NO) ||
              Boolean(formState?.fdDetails?.TO_ADD1) ||
              Boolean(formState?.rowsData?.[0]?.data?.ACCT_NM) ||
              Boolean(formState?.rowsData?.[0]?.data?.ADD1) ||
              Boolean(formState?.rowsData?.[0]?.data?.CONTACT_INFO) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_IFSCCODE) ||
              Boolean(formState?.rowsData?.[0]?.data?.BANK) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ACCT_NO) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ACCT_TYPE) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ACCT_NM) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_CONTACT_NO) ||
              Boolean(formState?.rowsData?.[0]?.data?.TO_ADD1)) &&
            dependentFieldValues?.NEFT_FORM_HIDDEN?.value === "SHOW"
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "Confirmation",
              message: "PaymentModeChangeConf",
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnName === "Yes") {
              return {
                ACCT_NM: { value: "" },
                ADD1: { value: "" },
                CONTACT_INFO: { value: "" },
                TO_IFSCCODE: { value: "" },
                BANK: { value: "" },
                TO_ACCT_NO: { value: "" },
                TO_ACCT_TYPE: { value: "" },
                TO_ACCT_TYPE_DIS: { value: "" },
                TO_ACCT_NM: { value: "" },
                TO_CONTACT_NO: { value: "" },
                TO_ADD1: { value: "" },
                CR_BRANCH_CD: {
                  value: dependentFieldValues?.CR_BRANCH_CD_1?.value
                    ? dependentFieldValues?.CR_BRANCH_CD_1?.value
                    : "",
                  ignoreUpdate: true,
                },
                CR_ACCT_TYPE: {
                  value: dependentFieldValues?.CR_ACCT_TYPE_1?.value
                    ? dependentFieldValues?.CR_ACCT_TYPE_1?.value
                    : "",
                  ignoreUpdate: true,
                },
                CR_ACCT_CD: {
                  value: dependentFieldValues?.CR_ACCT_CD_1?.value
                    ? dependentFieldValues?.CR_ACCT_CD_1?.value
                    : "",
                  ignoreUpdate: true,
                },
                CR_ACCT_NM: {
                  value: dependentFieldValues?.CR_ACCT_NM_1?.value
                    ? dependentFieldValues?.CR_ACCT_NM_1?.value
                    : "",
                  ignoreUpdate: false,
                },

                NEFT_FORM_HIDDEN: {
                  value: "HIDE",
                },
                BANK_FORM_HIDDEN: {
                  value: "SHOW",
                },
              };
            }
            if (btnName === "No") {
              return { PAYMENT_MODE: { value: "NEFT" } };
            }
          } else {
            return {
              CR_BRANCH_CD: {
                value: dependentFieldValues?.CR_BRANCH_CD?.value
                  ? dependentFieldValues?.CR_BRANCH_CD?.value
                  : dependentFieldValues?.CR_BRANCH_CD_1?.value ?? "",
                ignoreUpdate: true,
              },
              CR_ACCT_TYPE: {
                value: dependentFieldValues?.CR_ACCT_TYPE?.value
                  ? dependentFieldValues?.CR_ACCT_TYPE?.value
                  : dependentFieldValues?.CR_ACCT_TYPE_1?.value ?? "",
                ignoreUpdate: true,
              },
              CR_ACCT_CD: {
                value: dependentFieldValues?.CR_ACCT_CD?.value
                  ? dependentFieldValues?.CR_ACCT_CD?.value
                  : dependentFieldValues?.CR_ACCT_CD_1?.value ?? "",
                ignoreUpdate: true,
              },
              CR_ACCT_NM: {
                value: dependentFieldValues?.CR_ACCT_NM?.value
                  ? dependentFieldValues?.CR_ACCT_NM?.value
                  : dependentFieldValues?.CR_ACCT_NM_1?.value ?? "",
                ignoreUpdate: true,
              },
              ACCT_NM: { value: "" },
              ADD1: { value: "" },
              CONTACT_INFO: { value: "" },
              TO_IFSCCODE: { value: "" },
              BANK: { value: "" },
              TO_ACCT_NO: { value: "" },
              TO_ACCT_TYPE: { value: "" },
              TO_ACCT_TYPE_DIS: { value: "" },
              TO_ACCT_NM: { value: "" },
              TO_CONTACT_NO: { value: "" },
              TO_ADD1: { value: "" },
              NEFT_FORM_HIDDEN: {
                value: "HIDE",
              },
              BANK_FORM_HIDDEN: {
                value: "SHOW",
              },
            };
          }
        }
      },

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PaymentModerequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "DepositDate",

      placeholder: "EnterDepositeDate",
      ignoreInSubmit: true,
      isReadOnly: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOT_AMT",
      label: "Inst. Amount",

      isReadOnly: true,
      ignoreInSubmit: true,
      textInputFromRight: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MATURITY_DT",
      label: "MaturityDate",

      placeholder: "EnterMaturityDate",
      ignoreInSubmit: true,
      isReadOnly: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MATURITY_AMT",
      label: "MaturityAmount",

      isReadOnly: true,
      ignoreInSubmit: true,
      textInputFromRight: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MATURE_INST",
      label: "MatureInstruction",

      ignoreInSubmit: true,
      isReadOnly: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.SCREEN_FLAG === "REC_ENT" ||
          formState?.SCREEN_FLAG === "REC_CONF"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "PAYMENT_MODE_SPACER",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.SCREEN_REF === "TRN/584") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 0, sm: 6, md: 9, lg: 9, xl: 9 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "FDBankDetail",
      name: "BankAccount",
      dependentFields: ["PAYMENT_MODE", "BANK_FORM_HIDDEN"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.BANK_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HIDDEN_CR_BRANCH_CD",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HIDDEN_CR_ACCT_TYPE",
      ignoreInSubmit: true,
    },

    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "CR_BRANCH_CD",
        dependentFields: ["PAYMENT_MODE", "BANK_FORM_HIDDEN"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          formState.handleButtonDisable(true);
          try {
            const isHOBranch = await validateHOBranch(
              currentField,
              formState?.MessageBox,
              authState
            );
            if (isHOBranch) {
              return {
                CR_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              CR_ACCT_TYPE: { value: "", ignoreUpdate: false },
              CR_ACCT_CD: { value: "", ignoreUpdate: false },
              CR_ACCT_NM: { value: "", ignoreUpdate: false },
            };
          } catch (error: any) {
            const btn = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (btn === "Ok") {
              return {
                CR_BRANCH_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                CR_ACCT_TYPE: { value: "", ignoreUpdate: false },
                CR_ACCT_CD: { value: "", ignoreUpdate: false },
                CR_ACCT_NM: { value: "", ignoreUpdate: false },
              };
            }
          } finally {
            formState.handleButtonDisable(false);
          }
          return {};
        },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BANK_FORM_HIDDEN?.value === "SHOW") {
            return false;
          } else {
            return true;
          }
        },
        validate: (currentField, dependentFields) => {
          if (
            !Boolean(currentField?.value) &&
            dependentFields?.PAYMENT_MODE?.value !== "NEFT"
          ) {
            return "BranchCodeReqired";
          }
          return "";
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      accountTypeMetadata: {
        name: "CR_ACCT_TYPE",
        dependentFields: ["PAYMENT_MODE", "CR_BRANCH_CD", "BANK_FORM_HIDDEN"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          return {
            CR_ACCT_CD: { value: "", ignoreUpdate: false },
            CR_ACCT_NM: { value: "", ignoreUpdate: false },
          };
        },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BANK_FORM_HIDDEN?.value === "SHOW") {
            return false;
          } else {
            return true;
          }
        },
        validate: (currentField, dependentFields) => {
          if (
            !Boolean(currentField?.value) &&
            dependentFields?.PAYMENT_MODE?.value === "BANKACCT"
          ) {
            return "AccountTypeReqired";
          }
          return "";
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        name: "CR_ACCT_CD",
        dependentFields: [
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "PAYMENT_MODE",
          "BANK_FORM_HIDDEN",
        ],
        runPostValidationHookAlways: true,
        required: true,
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BANK_FORM_HIDDEN?.value === "SHOW") {
            return false;
          } else {
            return true;
          }
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
            dependentFieldValues?.CR_ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });

            if (buttonName === "Ok") {
              return {
                CR_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                CR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            dependentFieldValues?.CR_BRANCH_CD?.value &&
            dependentFieldValues?.CR_ACCT_TYPE?.value &&
            currentField?.value &&
            dependentFieldValues?.PAYMENT_MODE?.value === "BANKACCT"
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.SCREEN_REF,
            };
            formState.handleButtonDisable(true);
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
                  break;
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
            formState.handleButtonDisable(false);
            return {
              CR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ??
                          "`  "
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },

              CR_ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
                ignoreUpdate: true,
                isFieldFocused: false,
              },
            };
          } else if (!currentField?.value) {
            return {
              CR_ACCT_NM: { value: "", ignoreUpdate: false },
            };
          }
        },

        validate: (currentField, dependentFields) => {
          if (
            !Boolean(currentField?.value) &&
            dependentFields?.PAYMENT_MODE?.value === "BANKACCT" &&
            !Boolean(currentField?.readOnly)
          ) {
            return "AccountNumberRequired";
          }
          return "";
        },
        schemaValidation: {},
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CR_ACCT_NM",
      label: "AccountName",
      placeholder: "AccountName",

      isReadOnly: true,
      dependentFields: ["PAYMENT_MODE", "BANK_FORM_HIDDEN"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.BANK_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "FDNEFTDetail",
      name: "NEFT",
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "OrderingAcName",
      placeholder: "EnterOrderingAcName",
      required: true,
      maxLength: 100,
      txtTransform: "uppercase",
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN"],
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "OrderingNameRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "OrderingAcAddress",
      placeholder: "EnterOrderingAcAddress",
      required: true,
      maxLength: 100,
      txtTransform: "uppercase",
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "OrderingAddressRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT_INFO",
      label: "OrderingAcContact",
      placeholder: "EnterOrderingAcContact",
      required: true,
      maxLength: 35,
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN"],
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "OrderingContactRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_IFSCCODE",
      label: "IFSCCode",
      placeholder: "EnterIFSCCode",
      required: true,
      maxLength: 11,
      // runValidationOnDependentFieldsChange: true,
      runPostValidationHookAlways: true,
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN"],
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: async (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "IFSCCodeisRequired";
        }
        return "";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState.handleButtonDisable(true);
        try {
          if (currentField?.value) {
            let validateIFSC = await API.getIfscBenDetail({
              IFSC_CODE: currentField?.value ?? "",
              ENTRY_TYPE: "NEFT",
              USERNAME: auth?.user?.id ?? "",
              USERROLE: auth?.role ?? "",
            });
            if (validateIFSC?.[0]?.O_STATUS === "999") {
              let buttonName = await formState.MessageBox({
                messageTitle:
                  validateIFSC?.[0]?.O_MSG_TITLE ?? "ValidationFailed",
                message: validateIFSC?.[0]?.O_MESSAGE,
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  BANK: { value: "" },
                  TO_IFSCCODE: {
                    value: "",
                    isFieldFocused: true,
                  },
                  TO_IFSCCODE_HIDDEN: { value: "" },
                };
              }
            } else if (validateIFSC?.[0]?.O_STATUS === "0") {
              return {
                BANK: { value: validateIFSC?.[0]?.BANK_NM ?? "" },
                TO_IFSCCODE_HIDDEN: { value: currentField?.value ?? "" },
                TO_ACCT_NO: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              BANK: { value: "" },
              TO_ACCT_NO: { value: "" },
              TO_IFSCCODE_HIDDEN: { value: "" },
            };
          }
        } catch (error: any) {
          const btn = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (btn === "Ok") {
            return {
              TO_IFSCCODE: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
              BANK: { value: "" },
              TO_ACCT_NO: { value: "" },
              TO_IFSCCODE_HIDDEN: { value: "" },
            };
          }
        } finally {
          formState.handleButtonDisable(false);
        }
        return {};
      },

      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK",
      label: "Bank",
      isReadOnly: true,
      // placeholder: "EnterBankName",
      required: true,
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      // validate: (currentField, dependentFields) => {
      //   if (
      //     !Boolean(currentField?.value) &&
      //     dependentFields?.PAYMENT_MODE?.value === "NEFT"
      //   ) {
      //     return "BankRequired";
      //   }
      //   return "";
      // },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TO_IFSCCODE_HIDDEN",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TO_ACCT_NO",
      label: "BeneficiaryAccountNumber",
      placeholder: "EnterBeneficiaryAccountNumber",
      required: true,
      disableCaching: true,
      runPostValidationHookAlways: true,
      dependentFields: [
        "PAYMENT_MODE",
        "TO_IFSCCODE_HIDDEN",
        "NEFT_FORM_HIDDEN",
      ],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      options: (dependentValue, formState, _, authState) => {
        if (Boolean(dependentValue?.TO_IFSCCODE_HIDDEN?.value)) {
          return API.getBankDtlList({
            TO_IFSCCODE: dependentValue?.TO_IFSCCODE_HIDDEN?.value,
          });
        } else {
          return [];
        }
      },

      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },

      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value) {
          return {
            TO_ACCT_NO: {
              value: currentField?.optionData?.[0]?.TO_ACCT_NO,
            },
            TO_ACCT_TYPE: {
              value: currentField?.optionData?.[0]?.TO_ACCT_TYPE,
            },
            TO_ACCT_NM: {
              value: currentField?.optionData?.[0]?.TO_ACCT_NM,
            },
            TO_CONTACT_NO: {
              value: currentField?.optionData?.[0]?.TO_CONTACT_NO,
            },
            TO_ADD1: {
              value: currentField?.optionData?.[0]?.TO_ADD1,
            },
          };
        }
        return {
          TO_ACCT_TYPE: { value: "" },
          TO_ACCT_NM: { value: "" },
          TO_CONTACT_NO: { value: "" },
          TO_ADD1: { value: "" },
        };
      },

      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT" &&
          !Boolean(currentField?.readOnly)
        ) {
          return "BeneficiaryAcctNumRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TO_ACCT_TYPE",
      label: "BeneficiaryAccountType",
      placeholder: "EnterBeneficiaryAccountType",
      options: API.getAccountTypeList,
      _optionsKey: "getAccountTypeList",
      required: true,
      dependentFields: ["PAYMENT_MODE", "TO_ACCT_NO", "NEFT_FORM_HIDDEN"],
      runValidationOnDependentFieldsChange: true,
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT" &&
          !Boolean(currentField?.readOnly)
        ) {
          return "BeneficiaryAcctTypeRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NM",
      label: "BeneficiaryAccountName",
      placeholder: "EnterBeneficiaryAccountName",
      maxLength: 100,
      required: true,
      txtTransform: "uppercase",
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      dependentFields: ["PAYMENT_MODE", "TO_ACCT_NO", "NEFT_FORM_HIDDEN"],
      runValidationOnDependentFieldsChange: true,
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "BeneficiaryAcctNameRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_CONTACT_NO",
      label: "BeneficiaryContact",
      placeholder: "EnterBeneficiaryContact",
      maxLength: 50,
      required: true,
      txtTransform: "uppercase",
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN", "TO_ACCT_NO"],
      runValidationOnDependentFieldsChange: true,

      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "BeneficiaryContactRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ADD1",
      label: "BeneficiaryAddress",
      placeholder: "EnterBeneficiaryAddress",
      maxLength: 200,
      required: true,
      txtTransform: "uppercase",
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      dependentFields: ["PAYMENT_MODE", "NEFT_FORM_HIDDEN", "TO_ACCT_NO"],
      runValidationOnDependentFieldsChange: true,
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.PAYMENT_MODE?.value === "" ? true : false;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.NEFT_FORM_HIDDEN?.value === "SHOW") {
          return false;
        } else {
          return true;
        }
      },
      validate: (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.PAYMENT_MODE?.value === "NEFT"
        ) {
          return "BeneficiaryAddressRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2.4, lg: 2.4, xl: 2.4 },
    },
  ],
};
