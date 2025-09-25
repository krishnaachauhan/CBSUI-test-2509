import * as API from "../api";
import { isValid } from "date-fns";

export const savingsDeposit_metadata = {
  form: {
    name: "savingsDeposit_tab_form",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
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
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "divider",
      },
      name: "savingsdivider_ignoreField",
      label: "AcBelongsToDirector",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DAY_BOOK_GRP_CD",
      label: "Name",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "D" }),
      _optionsKey: "directorNmSavingsOp",
      placeholder: "SelectName",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DAY_BOOK_REVRS_GRP_CD",
      label: "Relationship",
      placeholder: "EnterRelationship",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      maxLength: 20,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PATH_SIGN",
      label: "NatureOfInterest",
      type: "text",
      maxLength: 100,
      placeholder: "EnterNatureOfInterest",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INST_NO",
      label: "ChqSignAutho",
      placeholder: "SelectChqSignAutho",
      options: (dependentValue, formState, _, authState) =>
        API.getCheqSignAuthoTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "chqSignAuthoSavingsOp",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "CATEG_CD",
      label: "Category",
      options: (dependentValue, formState, _, authState) =>
        API.getCategoryTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "categSavingsOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Categoryisrequired"] }],
      },
      placeholder: "SelectCategory",
      type: "text",
      runPostValidationHookAlways: true,
      __NEW__: {
        runValidationOnDependentFieldsChange: true,
        runPostValidationForInitValue: true,
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          let postData = await API.getInterestRate({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD:
              formState?.formMode !== "new"
                ? formState?.BRANCH_CD ?? ""
                : authState?.user?.branchCode ?? "",
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
            ACCT_CD: formState?.ACCT_CD ?? "",
            CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
            PARSE_CODE: currentField?.value ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            SANCTIONED_AMT: "",
            SANCTION_DT: "",
            SCREEN_REF: formState?.docCD ?? "",
          });

          let btn99, returnVal;

          const getButtonName = async (obj) => {
            let btnName = await formState.MessageBox(obj);
            return { btnName, obj };
          };

          for (let i = 0; i < postData?.[0]?.MSG?.length; i++) {
            if (postData?.[0]?.MSG?.[i]?.O_STATUS === "999") {
              await getButtonName({
                messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE
                  ? postData?.[0]?.MSG?.[i]?.O_MSG_TITLE
                  : "ValidationFailed",
                message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                icon: "ERROR",
              });
              returnVal = "";
            } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "9") {
              if (btn99 !== "No") {
                await getButtonName({
                  messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.[0]?.MSG?.[i]?.O_MSG_TITLE
                    : "Alert",
                  message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              }
              returnVal = postData;
            } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "99") {
              const { btnName } = await getButtonName({
                messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE
                  ? postData?.[0]?.MSG?.[i]?.O_MSG_TITLE
                  : "Confirmation",
                message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });

              btn99 = btnName;
              if (btnName === "No") {
                returnVal = "";
              }
            } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "0") {
              if (btn99 !== "No") {
                returnVal = postData;
              } else {
                returnVal = "";
              }
            }
          }

          btn99 = 0;
          return {
            INT_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.[0]?.INT_RATE ?? "",
                    ignoreUpdate: false,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
          };
        } else if (!currentField?.value) {
          return {
            INT_RATE: { value: "", ignoreUpdate: false },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "InterestRate",
      placeholder: "0",
      required: true,
      type: "text",
      validate: (columnValue, allField, flag) => {
        if (!Boolean(columnValue.value)) {
          return "InterestRateisrequired";
        }
        return "";
      },
      FormatProps: {
        isAllowed: (values) => {
          //@ts-ignore
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CLASS_CD",
      label: "RiskCategory",
      options: (dependentValue, formState, _, authState) =>
        API.getRiskCategTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_CLASS_CD),
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      _optionsKey: "riskCategSavingsOp",
      placeholder: "SelectRiskCategory",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "AGENT_CD",
      label: "Agent",
      options: (dependentValue, formState, _, authState) =>
        API.getAgentTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "agentSavingsOp",
      placeholder: "SelectAgent",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "TYPE_CD",
      label: "ChequeBook",
      __NEW__: {
        defaultValue: "Y",
      },
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ], //api
      // _optionsKey: "npaReasonTermLoanOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ChequeBookisrequired"] }],
      },
      defaultOptionLabel: "SelectChequeBook",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "AGAINST_CLEARING",
      label: "AgainstClearing",
      __NEW__: {
        defaultValue: "T",
      },
      options: [
        { label: "Allow", value: "Y" },
        { label: "Not Allow", value: "N" },
        { label: "As per Type", value: "T" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      defaultOptionLabel: "SelectAgainstClearing",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LST_INT_COMPUTE_DT",
      label: "LastIntAppliedDate",
      placeholder: "DD/MM/YYYY",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      shouldExclude({
        currentField,
        fieldData,
        dependentFieldsValues,
        formState,
      }) {
        if (currentField?.value === "") {
          return true;
        }
        return false;
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "INT_SKIP_FLAG",
      label: "InterestSkip",
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (!Boolean(currentField?.value)) {
          return {
            INT_SKIP_REASON_TRAN_CD: { value: "" },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INT_SKIP_REASON_TRAN_CD",
      label: "InterestSkipReason",
      options: (dependentValue, formState, _, authState) =>
        API.getIntSkipReasonTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "skipReasonSavingsOp",
      placeholder: "SelectInterestSkipReason",
      type: "text",
      dependentFields: ["INT_SKIP_FLAG"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(dependentFields?.INT_SKIP_FLAG?.value)) {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
