import { utilFunction } from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { GeneralAPI } from "registry/fns/functions";
import { commonHeaderTypographyProps } from "../equitableMortgageMain/helper";
import { ValidateEmailId } from "pages_audit/pages/operations/acct-mst/api";
import * as API from "./api";
import { isEmpty } from "lodash";
import { accountKeys } from "./hooks/usePmbyRegistrationForm";
export const formMetadata = {
  form: {
    name: "PmbyRegMst",
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
      numberFormat: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      autocomplete: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "numberFormat",
      },
      name: "TRAN_CD",
      label: "RegistrationNumber",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "date",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "INSURANCE_TRAN_CD",
      label: "insuaranceThrogh",
      placeholder: "insuaranceThrogh",
      options: (dependentValue, formState, _, authState) =>
        API.getInsuaranceThroughDDW({
          COMP_CD: authState?.baseCompanyID ?? "",
          BRANCH_CD: authState?.user?.baseBranchCode ?? "",
          WORKING_DATE: authState?.workingDate ?? "",
        }),
      _optionsKey: "getInsuaranceThroughDDW",
      defaultValue: "",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      fullWidth: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["requiredInsuranceCompany"] }],
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (formState?.isSubmitting) return {};

        if (field?.value) {
          return {
            PREMIUM_AMT: {
              value: field?.optionData?.[0]?.PREMIUM_AMT,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FORM_MODE",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "ACTIVE",
      defaultValue: true,

      label: "active",
      dependentFields: ["FORM_MODE"],
      shouldExclude: (val1, dependentFields) =>
        dependentFields?.FORM_MODE?.value === "new",
      GridProps: {
        xs: 1,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        required: false,
        schemaValidation: {},
        isReadOnly: true,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
          if (formState?.isSubmitting) return {};

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

          if (field.value !== undefined) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              CUSTOMER_ID: { value: "" },
              CONTACT2: { value: "" },
              PAN_NO: { value: "" },
            };
          }

          return {};
        },

        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
        runPostValidationHookAlways: true,
      },
      accountTypeMetadata: {
        dependentFields: ["BRANCH_CD"],
        validationRun: "onChange",
        required: false,
        schemaValidation: {},
        isFieldFocused: true,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value && !dependentFieldValues?.BRANCH_CD?.value) {
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
                ACCT_CD: { value: "", ignoreUpdate: false },
              };
            }
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "TRAN_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};

          const acctType = dependentFieldsValues?.ACCT_TYPE?.value;
          const branchCode = dependentFieldsValues?.BRANCH_CD?.value;
          const acctCdPadded = utilFunction.getPadAccountNumber(
            currentField?.value,
            dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
          );

          if (currentField?.value && !acctType) {
            const buttonName = await formState?.MessageBox({
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
          }

          if (currentField?.value && branchCode && acctType) {
            const reqParameters = {
              BRANCH_CD: branchCode,
              ENTERED_BRANCH_CD: branchCode,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: acctType,
              ACCT_CD: acctCdPadded,
              SCREEN_REF: formState?.docCD ?? "",
              WORKING_DATE: authState?.workingDate,
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };

            const postData: Record<string, any> = await API.validatePmbyAcctNo(
              reqParameters
            );

            formState.setDataOnFieldChange("SHORTCUTKEY_PARA", {
              ACCT_TYPE: acctType,
              ACCT_CD: acctCdPadded,
              BRANCH_CD: authState?.user?.branchCode ?? "",
              BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
              COMP_CD: authState?.companyID ?? "",
            });

            const rawData = postData[0] ?? {};
            const msgList = rawData?.MSG ?? [];

            const messageResponse: any = await handleDisplayMessages(
              msgList,
              formState.MessageBox
            );
            console.log("messageResponse: ", messageResponse);
            const result = accountKeys.reduce((acc, key) => {
              acc[key] = !isEmpty(messageResponse)
                ? { value: rawData?.[key] ?? "" }
                : { value: "" };
              return acc;
            }, {} as Record<string, any>);

            result["ACCT_CD"] = !isEmpty(messageResponse)
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
                };

            return result;
          }

          if (!currentField?.value) {
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              GENDER: { value: "" },
              EMAIL_ID: { value: "" },
              FATHER_NM: { value: "" },
              NOMINEE_NM: { value: "" },
              PAN_NO: { value: "" },
            };
          }

          return {};
        },

        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 1.5, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "APPLICANT_NM",
      label: "AccountHolder",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      placeholder: "EnterCustomerID",
      isReadOnly: true,
      className: "textInputFromRight",
      fullWidth: true,
      showMaxLength: false,
      maxLength: 12,
      textFieldStyle: {
        "& .MuiInputBase-input::placeholder": {
          textAlign: "left",
        },
      },
      FormatProps: {
        isAllowed: (values) => values?.value?.length <= 12,
      },
      required: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "applicantName",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 4,
        sm: 4,
        md: 3,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PREMIUM_AMT",
      label: "policyAmt",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      isReadOnly: true,
      fullWidth: true,
      placeholder: "policyAmt",
      maxLength: 17,
      FormatProps: {
        allowNegative: false,
        decimalScale: 2,
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "OP_DATE",
      label: "OpeningDate",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 2.3, md: 2.3, lg: 2.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "textField",
        sequence: 14,
      },
      name: "FATHER_NM",
      label: "FatherOrSpuuseName",
      placeholder: "FatherOrSpuuseName",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["requiredFatherOrSpuuseName"] }],
      },
      GridProps: { xs: 12, sm: 2.5, md: 2, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "balance",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      isReadOnly: true,
      type: "text",
      fullWidth: true,
      FormatProps: {
        allowNegative: true,
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "BIRTH_DT",
      label: "BirthDate",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 1.5 },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "APPLICANT_AGE_YEAR",
      label: "Year",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 0.5, lg: 0.7, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "APPLICANT_AGE_MONTH",
      label: "month",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 0.5, lg: 0.7, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "APPLICANT_AGE_DAYS",
      label: "day",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 0.5, lg: 0.7, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "Address1",
      placeholder: "Address1",
      maxLength: 100,
      showMaxLength: false,
      autoComplete: "off",
      isReadOnly: true,
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD2",
      label: "Address2",
      placeholder: "Address2",
      maxLength: 100,
      showMaxLength: false,
      autoComplete: "off",
      isReadOnly: true,
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "GENDER",
      label: "Gender",
      isReadOnly: true,
      options: [
        { label: "MALE", value: "M" },
        { label: "FEMALE", value: "F" },
        { label: "OTHER", value: "O" },
        { label: "TRANSGENDER", value: "T" },
      ],
      GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAN_NO",
      label: "PANNo",
      isReadOnly: true,
      type: "text",
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AREA_CD",
      label: "Area",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PIN_CODE",
      label: "PINCode",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "UNIQUE_ID",
      label: "UniqueId",
      maxLength: 12,
      isReadOnly: true,
      showMaxLength: false,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CITY_CD",
      label: "City",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE_CD",
      label: "State",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CONTACT2",
      label: "MobileNum",
      placeholder: "MobileNum",
      validate: (columnValue) =>
        columnValue.value && columnValue.value.length < 10
          ? "MobileNumberValidation"
          : "",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => values?.value?.length <= 10,
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "EMAIL_ID",
      label: "EmailID",
      showMaxLength: false,
      isReadOnly: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 200,
    },
    {
      render: { componentType: "autocomplete" },
      name: "AGENT_CD",
      label: "agentBc",
      placeholder: "agentBc",
      options: (dependentValue, formState, _, authState) =>
        API.getAgentCdDDW({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getAgentCdDDW",
      defaultValue: "",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      fullWidth: true,
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DISABILITY",
      label: "disability",
      options: (dependentValue, formState, _, authState) =>
        API.getDisabilityDDW({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getDisabilityDDW",
      placeholder: "disability",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ENTRY_FROM_BRANCH",
      label: "entryFromBranch",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "typography",
      },
      name: "DATE_HEADER",
      label: "nomineeDtl",
      ignoreInSubmit: true,
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMINEE_NM",
      label: "name",
      placeholder: "name",
      fullWidth: true,
      GridProps: {
        xs: 6,
        sm: 4,
        md: 4,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "NOMINEE_BIRTH_DT",
      placeholder: "DD/MM/YYYY",
      label: "BirthDate",
      fullWidth: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["requiredNomineeBirthDt"] }],
      },
      format: "dd/MM/yyyy",
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async ({ value }) => {
        const keys = ["NOMINEE_YE1AR", "NOMINEE_MO1NTH", "NOMINEE_DAYS"];
        const reset = () =>
          Object.fromEntries(
            keys.map((k) => [k, { value: "", ignoreUpdate: false }])
          );

        if (!value) return reset();

        const data = API.getAge(value);
        if ("error" in data) return reset();

        return {
          NOMINEE_AGE_YEAR: { value: `${data.years}`, ignoreUpdate: false },
          NOMINEE_AGE_MONTH: { value: `${data.months}`, ignoreUpdate: false },
          NOMINEE_AGE_DAYS: { value: `${data.days}`, ignoreUpdate: false },
        };
      },

      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMINEE_AGE_YEAR",
      label: "Year",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 0.5, lg: 0.7, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMINEE_AGE_MONTH",
      label: "month",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 0.5, lg: 0.7, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMINEE_AGE_DAYS",
      label: "day",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 0.5, lg: 0.7, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMINEE_ADDRESS",
      label: "Address1",
      placeholder: "Address1",
      maxLength: 100,
      showMaxLength: false,
      autoComplete: "off",
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: {
        xs: 6,
        sm: 4,
        md: 4,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "NOMINEE_RELATION_TYPE",
      label: "relation",
      placeholder: "relation",
      options: (dependentValue, formState, _, authState) =>
        API.getRelationDDW({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getRelationDDW",
      defaultValue: "",
      required: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["requiredNomineeRelationType"] }],
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "DOC_DUP_CHECK",
      defaultValue: false,
      label: "deDuplicationChecked",
      GridProps: {
        xs: 1,
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
      name: "NOMINEE_EMAIL_ID",
      label: "EmailID",
      placeholder: "EnterEmailID",
      showMaxLength: false,
      type: "text",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 200,
      validate: (columnValue, allField, flag) =>
        ValidateEmailId({ columnValue, flag: "Y" }),
      GridProps: {
        xs: 6,
        sm: 3,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "NOMINEE_MOBILE",
      label: "MobileNum",
      PlaceHolder: "MobileNum",
      validate: (columnValue) =>
        columnValue?.value && columnValue.value.length < 10
          ? "MobileNumberValidation"
          : "",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => values?.value?.length <= 10,
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "typography",
      },
      name: "APOINTEE_DTL",
      label: "appointeeDtl",
      ignoreInSubmit: true,
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "APPOINTEE_NM",
      label: "name",
      placeholder: "name",
      fullWidth: true,
      GridProps: {
        xs: 6,
        sm: 4,
        md: 4,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "APPOINTEE_MOBILE",
      label: "MobileNum",
      placeholder: "MobileNum",
      validate: (columnValue) =>
        columnValue.value && columnValue.value.length < 10
          ? "MobileNumberValidation"
          : "",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => values?.value?.length <= 10,
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "APPOINTEE_EMAIL_ID",
      label: "EmailID",
      placeholder: "EnterEmailID",
      showMaxLength: false,
      type: "text",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 200,
      validate: (columnValue, allField, flag) =>
        ValidateEmailId({ columnValue, flag: "Y" }),
      GridProps: {
        xs: 6,
        sm: 3,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "APPOINTEE_RELATION_TYPE",
      label: "relationWithNominee",
      placeholder: "relationWithNominee",
      options: (dependentValue, formState, _, authState) =>
        API.getRelationDDW({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "relationWithNominee",
      defaultValue: "",
      required: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectInstallmentPeriod"] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "Remarks",
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
    },
  ],
};
