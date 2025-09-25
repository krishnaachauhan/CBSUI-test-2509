import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
import { format } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data?.MSG ?? []) {
    if (obj?.O_STATUS === "999") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      continue;
    } else if (obj?.O_STATUS === "99") {
      const buttonName = await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "Confirmation",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });
      if (buttonName === "No") {
        break;
      }
    } else if (obj?.O_STATUS === "0") {
      return data;
    }
  }
};

export const formatDateField = (field) =>
  Boolean(field)
    ? format(utilFunction.getParsedDate(field), "dd/MMM/yyyy")
    : "";

export const UnclPaymentRetrieveMetaData = {
  form: {
    name: "unclaim-payment-retrieve-MetaData",
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
      render: {
        componentType: "radio",
      },
      name: "FLAG",
      shouldExclude: (fieldData) => {
        if (fieldData?.value === "F" || fieldData?.value === "T") {
          return false;
        } else {
          return true;
        }
      },
      label: "Retrieve",
      RadioGroupProps: { row: true },
      defaultValue: "F",
      options: [
        { label: "FromAccount", value: "F" },
        { label: "ToAccount", value: "T" },
      ],
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COMP_CD",
      label: "Comp cd",
      placeholder: "",
      defaultValue: (fs, au) => {
        return au?.companyID;
      },
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 6, sm: 3, md: 3, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
          const isHOBranch = await validateHOBranch(
            field,
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
          if (field?.value) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
            };
          } else if (!field.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", {
              IS_VISIBLE: false,
            });
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 6, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        runExternalFunction: true,
        isFieldFocused: true,
        validationRun: "all",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: formState?.docCD,
          });
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: async (field, formState) => {
          formState.setDataOnFieldChange("IS_VISIBLE", {
            IS_VISIBLE: false,
          });
          if (field?.value) {
            return {
              ACCT_CD: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 6, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        render: {
          componentType: "textField",
        },
        validate: (columnValue) => {
          let regex = /^[^!&]*$/;
          if (!regex.test(columnValue.value)) {
            return "Special Characters (!, &) not Allowed";
          }
          return "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (
            field?.value &&
            dependentValue?.BRANCH_CD?.value &&
            dependentValue?.ACCT_TYPE?.value
          ) {
            let otherAPIRequestPara = {
              COMP_CD: authState?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              GD_TODAY_DT: authState?.workingDate,
              SCREEN_REF: formState?.docCD,
            };
            let postData = await GeneralAPI.getAccNoValidation(
              otherAPIRequestPara
            );

            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );
            return {
              ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      field?.value,
                      dependentValue?.ACCT_TYPE?.optionData?.[0]
                    ),
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              ACCT_NM: { value: returnValue?.ACCT_NM },
            };
          } else if (!field.value) {
            return {
              ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        fullWidth: true,
        GridProps: { xs: 6, sm: 3, md: 3, lg: 4, xl: 4 },
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
      GridProps: { xs: 12, sm: 12, md: 8, lg: 8, xl: 8 },
    },
  ],
};

export const UnclaimPaymentMetaData = {
  form: {
    name: "unclaim_payment_MetaData",
    label: "",
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
      render: {
        componentType: "textField",
      },
      name: "FROM_BRANCH_CD",
      fullWidth: true,
      isReadOnly: true,
      label: "FromBranchCode",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FROM_ACCT_TYPE",
      fullWidth: true,
      isReadOnly: true,
      label: "FromAccountType",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      label: "FromAccountCode",
      name: "FROM_ACCT_CD",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      label: "FromAccountName",
      name: "FROM_ACCT_NM",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 5,
        sm: 5,
        lg: 5,
        xl: 5,
      },
    },

    {
      render: { componentType: "spacer" },
      name: "SPACER1.5",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "TO_BRANCH_CD",
      fullWidth: true,
      isReadOnly: true,
      label: "ToBranchCode",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_TYPE",
      fullWidth: true,
      isReadOnly: true,
      label: "ToAccountType",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_CD",
      label: "ToAccountCode",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      label: "ToAccountName",
      name: "TO_ACCT_NM",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 5,
        sm: 5,
        lg: 5,
        xl: 5,
      },
    },

    {
      render: { componentType: "spacer" },
      name: "SPACER1.5",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },

    {
      render: { componentType: "amountField" },
      name: "BAL_AMT",
      label: "MoveTimeBal",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "datePicker" },
      name: "MOVE_DATE",
      label: "MoveDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "DEAF_DAYS",
      label: "MovedSinceDays",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "amountField" },
      name: "PAID_INT_AMT",
      label: "InterestAmt",
      fullWidth: true,
      isFieldFocused: true,
      __NEW__: { isReadOnly: true },
      __VIEW__: { isReadOnly: false },
      FormatProps: {
        allowNegative: true,
      },
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (formState?.columnNM) {
          return true;
        }
        return false;
      },
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "datePicker" },
      name: "LAST_OPERATE_DT",
      label: "LastOperateDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "amountField" },
      name: "TRAN_BAL",
      label: "ACBalance",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "amountField" },
      name: "PAYMENT_AMT",
      label: "PaymentAmt",
      isReadOnly: true,
      fullWidth: true,
      dependentFields: ["PAID_INT_AMT", "TRAN_BAL"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const tranBal = parseFloat(dependentFieldsValues?.TRAN_BAL?.value) || 0;
        const paidIntAmt =
          parseFloat(dependentFieldsValues?.PAID_INT_AMT?.value) || 0;

        if (!dependentFieldsValues?.PAID_INT_AMT?.value) {
          return tranBal;
        }

        return tranBal + paidIntAmt;
      },
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "datePicker" },
      name: "INT_FROM_DT",
      label: "IntFromDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "PaymentDetails",
      label: "PaymentDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "amountField" },
      name: "TRF_AMT",
      label: "byTrf",
      fullWidth: true,
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (formState?.columnNM) {
          return true;
        }
        return false;
      },
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
      required: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["TrfAmount"] }],
      },
    },
    {
      render: { componentType: "spacer" },
      name: "SPACER1.5",
      GridProps: {
        xs: 12,
        md: 9,
        sm: 7,
        lg: 9,
        xl: 10.5,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TRF_COMP_CD",
      label: "Comp cd",
      placeholder: "",
      defaultValue: (fs, au) => {
        return au?.companyID;
      },
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "TRF_BRANCH_CD",
        required: false,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: [""] }],
        },
        dependentFields: ["PAYSLIP", "TRF_AMT"],
        isReadOnly: (curr, dependentValue, formState) => {
          const isAmountInvalid =
            !Boolean(dependentValue?.TRF_AMT?.value) ||
            dependentValue?.TRF_AMT?.value === "" ||
            formState?.columnNM;
          const isActive = dependentValue?.PAYSLIP?.value === true;
          return isAmountInvalid || isActive;
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
          const isHOBranch = await validateHOBranch(
            field,
            formState?.MessageBox,
            authState
          );
          if (isHOBranch) {
            return {
              TRF_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          if (field?.value) {
            return {
              TRF_ACCT_TYPE: { value: "" },
              TRF_ACCT_CD: { value: "" },
            };
          } else if (!field.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", {
              IS_VISIBLE: false,
            });
            return {
              TRF_ACCT_TYPE: { value: "" },
              TRF_ACCT_CD: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "TRF_ACCT_TYPE",
        runExternalFunction: true,
        required: false,
        validationRun: "all",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: [""] }],
        },
        dependentFields: ["TRF_BRANCH_CD", "TRF_AMT", "PAYSLIP"],
        isReadOnly: (curr, dependentValue, formState) => {
          const isAmountInvalid =
            !Boolean(dependentValue?.TRF_AMT?.value) ||
            dependentValue?.TRF_AMT?.value === "" ||
            formState?.columnNM;
          const isActive = dependentValue?.PAYSLIP?.value === true;
          return isAmountInvalid || isActive;
        },
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "UNCLMTRFTYPE",
          });
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: async (field, formState) => {
          formState.setDataOnFieldChange("IS_VISIBLE", {
            IS_VISIBLE: false,
          });
          if (field?.value) {
            return {
              TRF_ACCT_CD: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "TRF_ACCT_CD",
        render: {
          componentType: "textField",
        },
        required: false,
        dependentFields: [
          "TRF_BRANCH_CD",
          "TRF_ACCT_TYPE",
          "TRF_AMT",
          "PAYSLIP",
        ],
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: [""] }],
        },
        isReadOnly: (curr, dependentValue, formState) => {
          const isAmountInvalid =
            !Boolean(dependentValue?.TRF_AMT?.value) ||
            dependentValue?.TRF_AMT?.value === "" ||
            formState?.columnNM;
          const isActive = dependentValue?.PAYSLIP?.value === true;
          return isAmountInvalid || isActive;
        },
        validate: (columnValue) => {
          let regex = /^[^!&]*$/;
          if (!regex.test(columnValue.value)) {
            return "Special Characters (!, &) not Allowed";
          }
          return "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (
            field?.value &&
            dependentValue?.TRF_BRANCH_CD?.value &&
            dependentValue?.TRF_ACCT_TYPE?.value
          ) {
            let otherAPIRequestPara = {
              COMP_CD: authState?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.TRF_ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.TRF_ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.TRF_BRANCH_CD?.value,
              GD_TODAY_DT: authState?.workingDate,
              SCREEN_REF: formState?.docCD,
            };
            let postData = await GeneralAPI.getAccNoValidation(
              otherAPIRequestPara
            );

            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );
            return {
              TRF_ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      field?.value,
                      dependentValue?.ACCT_TYPE?.optionData?.[0]
                    ),
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              TRF_ACCT_NM: { value: returnValue?.ACCT_NM },
            };
          } else if (!field.value) {
            return {
              TRF_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        fullWidth: true,
        GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "TRF_ACCT_NM",
      label: "AccountName",
      placeholder: "AccountName",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: { componentType: "spacer" },
      name: "SPACER1.5",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },

    {
      render: { componentType: "amountField" },
      name: "CASH_AMT",
      label: "ByCash",
      fullWidth: true,
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (formState?.columnNM) {
          return true;
        }
        return false;
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "TOTAL",
      label: "Total",
      fullWidth: true,
      isReadOnly: true,
      dependentFields: ["CASH_AMT", "TRF_AMT"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const bycash = parseFloat(dependentFieldsValues?.CASH_AMT?.value) || 0;
        const bytrf = parseFloat(dependentFieldsValues?.TRF_AMT?.value) || 0;

        if (!dependentFieldsValues?.TRF_AMT?.value) {
          return bycash;
        } else if (!dependentFieldsValues?.CASH_AMT?.value) {
          return bytrf;
        }
        return bytrf + bycash;
      },
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAYMENT_REMARKS",
      label: "Remarks",
      placeholder: "EnterRemarks",
      autoComplete: "off",
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (formState?.columnNM) {
          return true;
        }
        return false;
      },
      maxLength: 300,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 5, md: 4, lg: 6, xl: 4 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "PAYSLIP",
      label: "GeneratePayslipDD",
      dependentFields: ["TRF_AMT"],
      defaultValue: "N",
      isReadOnly: (curr, dependentValue, formState) => {
        if (
          !Boolean(dependentValue?.TRF_AMT?.value) ||
          dependentValue?.TRF_AMT?.value === "" ||
          formState?.columnNM
        ) {
          return true;
        } else {
          return false;
        }
      },
      postValidationSetCrossFieldValues: async (currentField, formState) => {
        if (currentField?.value) {
          return {
            TRF_BRANCH_CD: { value: "" },
            TRF_ACCT_TYPE: { value: "" },
            TRF_ACCT_CD: { value: "" },
            TRF_ACCT_NM: { value: "" },
          };
        }
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
  ],
};
