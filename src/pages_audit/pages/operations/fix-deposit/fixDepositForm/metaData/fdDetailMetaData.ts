import { format, isValid } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "../../api";
import { lessThanDate, utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";

export const FixDepositDetailFormMetadata = {
  form: {
    name: "fixDepositDetail",
    label: "",
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
      render: {
        componentType: "typography",
      },
      name: "ROW_COUNT",
      label: "",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return (
          !Boolean(formState?.editingSRNORef) || formState?.openDepositForRenew
        );
      },
      __VIEW__: {
        shouldExclude: true,
      },
      GridProps: {
        xs: 6,
        sm: 2.7,
        md: 1.8,
        lg: 1.3,
        xl: 1.1,
        container: true,
      },
      TypographyProps: {
        variant: "subtitle2",
        sx: {
          display: "flex",
          paddingLeft: "7px",
          alignItems: "center",
          fontSize: "14px",
          color: "var(--theme-color3)",
          backgroundColor: "var(--theme-color4)",
          fontWeight: "600",
          borderRadius: "5px",
          width: "100%",
          height: "34px",
        },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "TOTAL_FIELD_SPACE",
      GridProps: { xs: 2.2, sm: 7, md: 8, lg: 10, xl: 10 },
      __NEW__: {
        GridProps: { xs: 12, sm: 5.3, md: 6.6, lg: 8.7, xl: 8.9 },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "CANCEL_BTN_EXCLUDE",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.editingSRNORef);
      },
      GridProps: {
        xs: 2.2,
        sm: 2,
        md: 1.8,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "ROW_COUNT_EXCLUDE",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return (
          Boolean(formState?.editingSRNORef) || formState?.openDepositForRenew
        );
      },
      __VIEW__: {
        shouldExclude: true,
      },
      GridProps: {
        xs: 12,
        sm: 2.7,
        md: 1.8,
        lg: 1,
        xl: 1.1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "ADDNEWROW",
      label: "AddRow",
      ignoreInSubmit: true,
      placeholder: "",
      shouldExclude: () => {
        return true;
      },
      __NEW__: {
        shouldExclude: (_, dependentFieldsValues, formState) => {
          return Boolean(formState?.editingSRNORef);
        },
        GridProps: {
          xs: 6,
          sm: 2,
          md: 1.8,
          lg: 1.3,
          xl: 1,
          sx: { paddingTop: "0px !important", marginTop: "0" },
        },
      },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "UPDATE",
      label: "Update",
      placeholder: "",
      ignoreInSubmit: true,
      shouldExclude: () => {
        return true;
      },
      __NEW__: {
        shouldExclude: (_, dependentFieldsValues, formState) => {
          return !Boolean(formState?.editingSRNORef);
        },
        GridProps: {
          xs: 6,
          sm: 2,
          md: 1.8,
          lg: 1,
          xl: 1,
          sx: { paddingTop: "0px !important", marginTop: "0" },
        },
      },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "CANCEL",
      label: "Cancel",
      placeholder: "",
      ignoreInSubmit: true,
      shouldExclude: () => {
        return true;
      },
      __NEW__: {
        shouldExclude: (_, dependentFieldsValues, formState) => {
          return !Boolean(formState?.editingSRNORef);
        },
        GridProps: {
          xs: 6,
          sm: 2,
          md: 1.8,
          lg: 1,
          xl: 1,
          sx: { paddingTop: "0px !important", marginTop: "0" },
        },
      },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        isReadOnly: true,
        options: () => [],
        _optionsKey: "",
        GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2, xl: 1.5 },
      },
      accountTypeMetadata: {
        options: () => [],
        _optionsKey: "",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2, xl: 1.5 },
      },
      accountCodeMetadata: {
        postValidationSetCrossFieldValues: () => {},
        isReadOnly: true,
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2, xl: 1.5 },
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "FD_NO",
      label: "FDNum",
      className: "textInputFromRight",
      placeholder: "EnterFDNo",
      autoComplete: "off",
      dependentFields: ["FD_NO_DISABLED"],
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(dependentFieldsValues?.FD_NO_DISABLED?.value === "Y");
      },
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          const value = values?.value;
          if (value === "") return true;
          return Boolean(
            /^[0-9]+$/.test(value) &&
              !value?.startsWith("0") &&
              value?.length <= 10
          );
        },
      },
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "asonDate",
      placeholder: "DD/MM/YYYY",
      type: "text",
      autoComplete: "off",
      format: "dd/MM/yyyy",
      __NEW__: {
        defaultValue: (formState, authState) => {
          return authState?.workingDate ?? "";
        },
      },
      fullWidth: true,
      maxDate: new Date(),
      required: true,
      dependentFields: [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "PERIOD_NO",
        "PERIOD_CD",
        "TRSF_AMT",
        "TRAN_DT_DISABLED",
        "FROM_TRAN_DT",
        "MATURITY_DT",
        "CASH_AMT",
      ],
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(dependentFieldsValues?.TRAN_DT_DISABLED?.value === "Y");
      },
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        let postData = await API?.getFDIntRate(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          formState?.handleDisableButton(false);
          return {
            ...postData,
          };
        }
        formState?.handleDisableButton(false);
        return {};
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["asOnDateRequired"] }],
      },
      validate: (currentField, dependentFields, formState) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          lessThanDate(new Date(formState?.workingDate), currentField?.value, {
            ignoreTime: true,
          })
        ) {
          return "AsOnDateLessThanEqualWorkingDate";
        }
        return "";
      },
      __VIEW__: {
        isReadOnly: true,
        validate: () => {},
        postValidationSetCrossFieldValues: () => {},
        isFieldFocused: false,
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.9, xl: 1.5 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "PERIOD_CD",
      label: "PeriodTenor",
      dependentFields: [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "TRAN_DT",
        "PERIOD_NO",
        "TRSF_AMT",
        "MATURITY_DT",
        "CASH_AMT",
      ],
      options: (dependentValue, formState, _, authState) => {
        try {
          return API?.getPeriodDDWData({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: formState?.BRANCH_CD ?? "",
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
            SCREEN_REF: formState?.docCD ?? "",
          });
        } catch (error) {
          return [];
        }
      },
      _optionsKey: "getPeriodDDWData",
      defaultValueKey: "tenorDefaultVal",
      skipInitialDefaultValueKeyValidation: true,
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        let postData = await API?.getFDIntRate(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          formState?.handleDisableButton(false);
          return {
            ...postData,
          };
        }
        formState?.handleDisableButton(false);
        return {};
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Period/Tenor is required."] }],
      },
      __VIEW__: {
        isReadOnly: true,
        schemaValidation: {},
        postValidationSetCrossFieldValues: () => {},
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.1, xl: 1.5 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "PERIOD_NO",
      label: "Tenor",
      className: "textInputFromRight",
      placeholder: "EnterTenor",
      autoComplete: "off",
      required: true,
      dependentFields: [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "TRAN_DT",
        "PERIOD_CD",
        "TRSF_AMT",
        "MATURITY_DT",
        "CASH_AMT",
      ],
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        let postData = await API?.getFDIntRate(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          formState?.handleDisableButton(false);
          return {
            ...postData,
          };
        }
        formState?.handleDisableButton(false);
        return {};
      },
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          return !Boolean(
            values?.value?.startsWith("0") || values?.value?.length > 5
          );
        },
      },

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["TenorRequired"] }],
      },
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.2, xl: 1.5 },
    },

    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "InterestRate",
      required: true,
      type: "text",
      autoComplete: "off",
      dependentFields: [
        "INT_RATE_DISABLED",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "TRAN_DT",
        "PERIOD_CD",
        "TRSF_AMT",
        "MATURITY_DT",
        "CASH_AMT",
        "TERM_CD",
        "PERIOD_NO",
      ],
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        let postData = await API?.getFDMaturityAmt(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          formState?.handleDisableButton(false);
          return {
            ...postData,
          };
        }
        formState?.handleDisableButton(false);
        return {};
      },
      FormatProps: {
        placeholder: "0.00",
      },
      __VIEW__: { isReadOnly: true },
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(dependentFieldsValues?.INT_RATE_DISABLED?.value === "Y");
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestRateIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.7, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TERM_CD",
      label: "InterestTerm",
      options: API.getFDIntTermDDWData,
      _optionsKey: "getFDIntTermDDWData",
      required: true,
      dependentFields: [
        "TERM_CD_DISABLED",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "TRAN_DT",
        "PERIOD_CD",
        "TRSF_AMT",
        "MATURITY_DT",
        "CASH_AMT",
        "INT_RATE",
        "PERIOD_NO",
      ],
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(dependentFieldsValues?.TERM_CD_DISABLED?.value === "Y");
      },
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        let postData = await API?.getFDMaturityAmt(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          formState?.handleDisableButton(false);
          return {
            ...postData,
          };
        }
        formState?.handleDisableButton(false);
        return {};
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestTermRequired"] }],
      },
      __VIEW__: {
        isReadOnly: true,
        schemaValidation: {},
        postValidationSetCrossFieldValues: () => {},
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.7, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "MONTHLY_INT",
      label: "MonthInterest",
      dependentFields: ["TERM_CD"],
      isReadOnly: true,
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(dependentFieldsValues?.TERM_CD?.value === "M");
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.9, xl: 1.5 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "MONTHLY_INT_EXCLUDE",
      dependentFields: ["TERM_CD"],
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(dependentFieldsValues?.TERM_CD?.value === "M");
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.9, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MATURITY_DT",
      label: "MaturityDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.9, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "CASH_AMT",
      label: "Cash",
      placeholder: "",
      type: "text",
      autoComplete: "off",
      dependentFields: [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "MATURITY_DT",
        "TRAN_DT",
        "PERIOD_CD",
        "PERIOD_NO",
        "SPL_AMT",
        "DEP_FAC",
        "TRSF_AMT",
        "AGG_DEP_CUSTID",
        "MATURITY_AMT",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        if (
          Number(dependentFieldsValues?.AGG_DEP_CUSTID?.value) > 0 ||
          dependentFieldsValues?.SPL_AMT?.value?.trim() === "Y"
        ) {
          let postData = await API?.validateFDDepAmt(
            currentField,
            dependentFieldsValues,
            authState,
            formState
          );
          formState?.handleDisableButton(false);
          return postData;
        } else {
          formState?.handleDisableButton(false);
          return {
            INT_RATE: {
              value: dependentFieldsValues?.INT_RATE?.value ?? "",
            },
          };
        }
      },
      maxLength: 14,
      FormatProps: {
        isAllowed: (values) => {
          return !Boolean(
            (values?.value?.startsWith("0") && values?.value?.length > 4) ||
              values?.value?.length > 14
          );
        },
      },
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(formState?.openDepositForRenew);
      },
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 4, md: 3.1, lg: 1.8, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRSF_AMT",
      label: "TransferAmount",
      placeholder: "",
      autoComplete: "off",
      type: "text",
      dependentFields: [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "CATEG_CD",
        "MATURITY_DT",
        "TRAN_DT",
        "PERIOD_CD",
        "PERIOD_NO",
        "SPL_AMT",
        "DEP_FAC",
        "CASH_AMT",
        "AGG_DEP_CUSTID",
        "MATURITY_AMT",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        if (
          Number(dependentFieldsValues?.AGG_DEP_CUSTID?.value) > 0 ||
          dependentFieldsValues?.SPL_AMT?.value?.trim() === "Y"
        ) {
          let postData = await API?.validateFDDepAmt(
            currentField,
            dependentFieldsValues,
            authState,
            formState
          );
          formState?.handleDisableButton(false);
          return postData;
        } else {
          formState?.handleDisableButton(false);
          return {
            INT_RATE: {
              value: dependentFieldsValues?.INT_RATE?.value ?? "",
            },
          };
        }
      },
      maxLength: 14,
      FormatProps: {
        isAllowed: (values) => {
          return !Boolean(
            (values?.value?.startsWith("0") && values?.value?.length > 4) ||
              values?.value?.length > 14
          );
        },
      },
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(formState?.openDepositForRenew);
      },
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 4, md: 3.1, lg: 1.8, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_CASH_TRANSFER",
      label: "Total",
      dependentFields: ["CASH_AMT", "TRSF_AMT"],
      isReadOnly: true,
      ignoreInSubmit: true,
      setValueOnDependentFieldsChange: (dependentFields) => {
        if (
          dependentFields?.CASH_AMT?.value?.trim() ||
          dependentFields?.TRSF_AMT?.value?.trim()
        ) {
          return (
            Number(dependentFields?.CASH_AMT?.value) +
            Number(dependentFields?.TRSF_AMT?.value)
          );
        } else return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3.3, lg: 3.5, xl: 1.7 },
      __VIEW__: {
        GridProps: { xs: 12, sm: 4, md: 3.4, lg: 2.5, xl: 1.7 },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MATURITY_AMT",
      label: "MaturityAmount",
      type: "text",
      autoComplete: "off",
      required: true,
      dependentFields: ["MATURITY_AMT_DISABLED"],
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(
          dependentFieldsValues?.MATURITY_AMT_DISABLED?.value === "Y" ||
            formState?.screenFlag === "openLienForm"
        );
      },
      validate: (columnValue) => {
        if (!Boolean(columnValue?.value)) {
          return "MaturityAmountRequired";
        } else if (columnValue?.value <= 0) {
          return "MaturityAmountGreaterThanZero";
        }
        return "";
      },
      __VIEW__: {
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 3.3, lg: 2.5, xl: 1.5 },
      },
      GridProps: { xs: 12, sm: 4, md: 3.3, lg: 3.5, xl: 1.5 },
    },

    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "CR_BRANCH_CD",
        label: "CreditBranchCode",
        required: false,
        schemaValidation: {},
        dependentFields: ["MATURE_INST"],
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
              CR_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            CR_ACCT_TYPE: { value: "" },
            CR_ACCT_CD: { value: "", ignoreUpdate: false },
            CR_ACCT_NM: { value: "" },
          };
        },
        isReadOnly(fieldData, dependentFields, formState) {
          return Boolean(
            formState?.screenFlag === "openLienForm" ||
              dependentFields?.MATURE_INST?.optionData?.[0]?.CR_AC_DISABLE ===
                "Y"
          );
        },
        GridProps: { xs: 12, sm: 4, md: 2.8, lg: 2.5, xl: 1.3 },
        __VIEW__: {
          GridProps: { xs: 12, sm: 4, md: 2.8, lg: 2, xl: 1.3 },
        },
      },
      accountTypeMetadata: {
        name: "CR_ACCT_TYPE",
        label: "CreditAcctType",
        required: false,
        validationRun: "onChange",
        schemaValidation: {},
        dependentFields: ["CR_BRANCH_CD", "MATURE_INST"],
        options: (dependentValue, formState, _, authState) => {
          try {
            return GeneralAPI?.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "FDINSTRCRTYPE",
            });
          } catch (error) {
            return [];
          }
        },
        _optionsKey: "getCreditAccountType",
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
            !dependentFieldValues?.CR_BRANCH_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                CR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                CR_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            CR_ACCT_CD: { value: "", ignoreUpdate: false },
            CR_ACCT_NM: { value: "" },
          };
        },
        isReadOnly(fieldData, dependentFields, formState) {
          return Boolean(
            formState?.screenFlag === "openLienForm" ||
              dependentFields?.MATURE_INST?.optionData?.[0]?.CR_AC_DISABLE ===
                "Y"
          );
        },
        GridProps: { xs: 12, sm: 4, md: 2.8, lg: 2.5, xl: 1.2 },
        __VIEW__: {
          GridProps: { xs: 12, sm: 4, md: 2.8, lg: 2, xl: 1.2 },
        },
      },
      accountCodeMetadata: {
        name: "CR_ACCT_CD",
        label: "CreditAcctNo",
        required: false,
        schemaValidation: {},
        autoComplete: "off",
        dependentFields: ["CR_BRANCH_CD", "CR_ACCT_TYPE", "MATURE_INST"],
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
              !dependentFieldsValues?.CR_ACCT_TYPE?.value
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterAccountType",
                buttonNames: ["Ok"],
                icon: "ERROR",
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
                    ignoreUpdate: true,
                  },
                };
              }
            } else if (
              currentField?.value &&
              dependentFieldsValues?.CR_BRANCH_CD?.value &&
              dependentFieldsValues?.CR_ACCT_TYPE?.value
            ) {
              const reqParameters = {
                BRANCH_CD: dependentFieldsValues?.CR_BRANCH_CD?.value ?? "",
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE: dependentFieldsValues?.CR_ACCT_TYPE?.value ?? "",
                ACCT_CD: utilFunction?.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldsValues?.CR_ACCT_TYPE?.optionData?.[0] ?? {}
                ),
                SCREEN_REF: "FD_CR_ACT",
              };
              let postData = await API?.validateAccountAndGetDetail(
                reqParameters
              );

              let returnVal;
              for (const obj of postData?.[0]?.MSG) {
                const continueProcess = await formState?.showMessageBox(obj);
                if (!continueProcess) {
                  break;
                }
                if (obj?.O_STATUS === "0") {
                  returnVal = postData?.[0];
                }
              }
              return {
                CR_ACCT_CD: returnVal
                  ? {
                      value: utilFunction?.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldsValues?.CR_ACCT_TYPE?.optionData?.[0] ||
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
                CR_ACCT_NM: {
                  value: returnVal?.ACCT_NM ?? "",
                },
              };
            } else if (!currentField?.value) {
              return {
                CR_ACCT_NM: { value: "" },
              };
            }
          } catch (error: any) {
            let btn = await formState?.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg || "Unknownerroroccured",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (btn === "Ok") {
              return {
                CR_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                CR_ACCT_NM: { value: "" },
              };
            }
          } finally {
            formState?.handleDisableButton(false);
          }
          return {};
        },
        isReadOnly(fieldData, dependentFields, formState) {
          return Boolean(
            formState?.screenFlag === "openLienForm" ||
              dependentFields?.MATURE_INST?.optionData?.[0]?.CR_AC_DISABLE ===
                "Y"
          );
        },
        GridProps: { xs: 12, sm: 4, md: 3.1, lg: 2, xl: 1.3 },
        __VIEW__: {
          GridProps: { xs: 12, sm: 4, md: 3.1, lg: 3, xl: 1.3 },
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CR_ACCT_NM",
      label: "CreditAcctName",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 5, xl: 2 },
      __VIEW__: {
        GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 2 },
      },
    },

    {
      render: {
        componentType: "select",
      },
      name: "MATURE_INST",
      label: "MatureInstruction",
      validationRun: "onChange",
      options: async (dependentValue, formState, _, authState) => {
        try {
          return API?.getMatureInstDDWData({
            COMP_CD: authState?.companyID ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
          });
        } catch (error) {
          return [];
        }
      },
      _optionsKey: "getMatureInstDDWData",
      defaultValueKey: "matureInstDefaultVal",
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["FDMatureInstructionRequired"],
          },
        ],
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.screenFlag === "openLienForm");
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 5, xl: 2.2 },
      __VIEW__: {
        GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 2.2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FD_REMARK",
      label: "FDRemark",
      type: "text",
      autoComplete: "off",
      placeholder: "EnterFDRemark",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.screenFlag === "openLienForm");
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 12, md: 6, lg: 5.5, xl: 2.8 },
      __VIEW__: {
        GridProps: { xs: 12, sm: 12, md: 8, lg: 3, xl: 3.3 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMINEE_NM",
      label: "NomineeName",
      type: "text",
      placeholder: "EnterNomineeName",
      fullWidth: true,
      autoComplete: "off",
      GridProps: { xs: 12, sm: 9, md: 4, lg: 5, xl: 1.5 },
      __VIEW__: {
        GridProps: { xs: 12, sm: 12, md: 4, lg: 3, xl: 2 },
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "INT_SCHEDULE",
      label: "Int. Schedule",
      dependentFields: [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "MATURITY_DT",
        "INT_RATE",
        "TRAN_DT",
        "PERIOD_NO",
        "PERIOD_CD",
        "TRSF_AMT",
        "CASH_AMT",
        "TERM_CD",
      ],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return !Boolean(
          dependentFieldsValues?.BRANCH_CD?.value &&
            dependentFieldsValues?.ACCT_TYPE?.value &&
            dependentFieldsValues?.ACCT_CD?.value &&
            dependentFieldsValues?.MATURITY_DT?.value &&
            Number(dependentFieldsValues?.INT_RATE?.value) > 0 &&
            dependentFieldsValues?.TRAN_DT?.value &&
            dependentFieldsValues?.PERIOD_NO?.value &&
            dependentFieldsValues?.PERIOD_CD?.value &&
            dependentFieldsValues?.TERM_CD?.value &&
            (dependentFieldsValues?.TRSF_AMT?.value ||
              dependentFieldsValues?.CASH_AMT?.value)
        );
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !(
          Boolean(formState?.defaultView === "new") ||
          Boolean(formState?.openDepositForRenew)
        );
      },
      ignoreInSubmit: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CATEG_CD",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "AGG_DEP_CUSTID",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SPL_AMT",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INT_RATE_DISABLED",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MATURITY_AMT_DISABLED",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FD_NO_DISABLED",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_DT_DISABLED",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TERM_CD_DISABLED",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FROM_TRAN_DT",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TO_TRAN_DT",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DOUBLE_TRAN",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MIN_AMT",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MAX_AMT",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MIN_DAYS",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MAX_DAYS",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DEP_FAC",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      __VIEW__: {
        ignoreInSubmit: true,
      },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "LienSection",
      label: "Lien",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.screenFlag === "openLienForm");
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: { componentType: "select" },
      name: "LIEN_FLAG",
      label: "Lien",
      validationRun: "onChange",
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      defaultValue: "Y",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.screenFlag === "openLienForm");
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value === "Y") {
          return {
            LEAN_COMP_CD: { value: authState?.companyID ?? "" },
            LEAN_BRANCH_CD: { value: authState?.user?.branchCode ?? "" },
          };
        } else {
          return {
            LEAN_COMP_CD: { value: "" },
            LEAN_BRANCH_CD: { value: "" },
            LEAN_ACCT_TYPE: { value: "" },
            LEAN_ACCT_CD: { value: "" },
          };
        }
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 0.8, xl: 0.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARK",
      label: "Remark",
      type: "text",
      fullWidth: true,
      autoComplete: "off",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.screenFlag === "openLienForm");
      },
      GridProps: { xs: 12, sm: 5, md: 5, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LEAN_COMP_CD",
      label: "bankCode",
      type: "text",
      isReadOnly: true,
      autoComplete: "off",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.screenFlag === "openLienForm");
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 0.7, xl: 0.7 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "LEAN_BRANCH_CD",
        fullWidth: true,
        isFieldFocused: true,
        defaultValue: "",
        runPostValidationHookAlways: true,
        dependentFields: ["LIEN_FLAG"],
        required: false,
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
              LEAN_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            LEAN_ACCT_TYPE: { value: "" },
            LEAN_ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
        schemaValidation: {},
        shouldExclude: (_, dependentFieldsValues, formState) => {
          return !Boolean(formState?.screenFlag === "openLienForm");
        },
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return Boolean(dependentFieldsValues?.LIEN_FLAG?.value === "N");
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.5, xl: 1.5 },
      },
      accountTypeMetadata: {
        name: "LEAN_ACCT_TYPE",
        dependentFields: ["LEAN_BRANCH_CD", "LIEN_FLAG"],
        required: false,
        options: (dependentValue, formState, _, authState) => {
          try {
            return GeneralAPI?.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "FD_LIEN",
            });
          } catch (error) {
            return [];
          }
        },
        _optionsKey: "getCreditAccountType",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        schemaValidation: {},
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldValues?.LEAN_BRANCH_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                LEAN_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                LEAN_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else {
          }
          return {
            LEAN_ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
        fullWidth: true,
        shouldExclude: (_, dependentFieldsValues, formState) => {
          return !Boolean(formState?.screenFlag === "openLienForm");
        },
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return Boolean(dependentFieldsValues?.LIEN_FLAG?.value === "N");
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        name: "LEAN_ACCT_CD",
        autoComplete: "off",
        dependentFields: ["LEAN_ACCT_TYPE", "LEAN_BRANCH_CD", "LIEN_FLAG"],
        runPostValidationHookAlways: true,
        required: false,
        schemaValidation: {},
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
              !dependentFieldsValues?.LEAN_ACCT_TYPE?.value
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterAccountType",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  LEAN_ACCT_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  LEAN_ACCT_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                };
              }
            } else if (
              currentField?.value &&
              dependentFieldsValues?.LEAN_BRANCH_CD?.value &&
              dependentFieldsValues?.LEAN_ACCT_TYPE?.value
            ) {
              const reqParameters = {
                BRANCH_CD: dependentFieldsValues?.LEAN_BRANCH_CD?.value ?? "",
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE: dependentFieldsValues?.LEAN_ACCT_TYPE?.value ?? "",
                ACCT_CD: utilFunction?.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldsValues?.LEAN_ACCT_TYPE?.optionData?.[0] ?? {}
                ),
                SCREEN_REF: "FD_LIEN",
                GD_TODAY_DT: authState?.workingDate ?? "",
              };
              let postData = await GeneralAPI?.getAccNoValidation(
                reqParameters
              );

              let returnVal;
              for (const obj of postData?.MSG) {
                const continueProcess = await formState?.showMessageBox(obj);
                if (!continueProcess) {
                  break;
                }
                if (obj?.O_STATUS === "0") {
                  returnVal = postData;
                }
              }
              return {
                LEAN_ACCT_CD: returnVal
                  ? {
                      value: utilFunction?.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldsValues?.LEAN_ACCT_TYPE
                          ?.optionData?.[0] || {}
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                LEAN_ACCT_NM: {
                  value: returnVal?.ACCT_NM ?? "",
                },
              };
            } else if (!currentField?.value) {
              return {
                LEAN_ACCT_NM: { value: "" },
              };
            }
          } catch (error: any) {
            let btn = await formState?.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg || "Unknownerroroccured",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (btn === "Ok") {
              return {
                LEAN_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                LEAN_ACCT_NM: { value: "" },
              };
            }
          } finally {
            formState?.handleDisableButton(false);
          }
          return {};
        },
        fullWidth: true,
        shouldExclude: (_, dependentFieldsValues, formState) => {
          return !Boolean(formState?.screenFlag === "openLienForm");
        },
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return Boolean(dependentFieldsValues?.LIEN_FLAG?.value === "N");
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.5, xl: 1.5 },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "LEAN_ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.screenFlag === "openLienForm");
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 },
    },
  ],
};
