import * as API from "../api";
import { getPMISCData } from "../api";
import { utilFunction } from "@acuteinfo/common-base";

export const recurring_tab_metadata = {
  form: {
    name: "recurring_tab_form",
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
      _optionsKey: "directorNmFDOp",
      placeholder: "SelectName",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DAY_BOOK_REVRS_GRP_CD",
      label: "Relationship",
      options: (dependentValue) => getPMISCData("RELATIONSHIP"),
      _optionsKey: "relationshipFDOp",
      placeholder: "SelectRelationship",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
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
      _optionsKey: "categFDOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Categoryisrequired"] }],
      },
      dependentFields: [
        "INS_START_DT",
        "INSTALLMENT_TYPE",
        "INST_NO",
        "INST_RS",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getRecAcDetails(
          currentField,
          dependentFieldValues,
          authState,
          formState
        );
        return {
          ...postData,
        };
      },
      placeholder: "selectCategory",
      type: "text",
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
      _optionsKey: "riskCategFDOp",
      placeholder: "SelectRiskCategory",
      type: "text",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_CLASS_CD),
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INST_RS",
      label: "Amount",
      type: "text",
      FormatProps: {
        allowNegative: true,
        isAllowed: (values) => {
          if (values?.value?.length > 11) {
            return false;
          }
          return true;
        },
      },
      dependentFields: [
        "INS_START_DT",
        "CATEG_CD",
        "INST_NO",
        "INS_START_DT",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getRecAcDetails(
          currentField,
          dependentFieldValues,
          authState,
          formState
        );
        return {
          ...postData,
        };
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INSTALLMENT_TYPE",
      label: "InstallmentType",
      options: [
        { label: "Daily", value: "D" },
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
        { label: "On Expiry", value: "E" },
      ],
      _optionsKey: "InstallmentTypeRecurring",
      placeholder: "SelectInstallmentType",
      __NEW__: {
        defaultValue: "M",
      },
      type: "text",
      dependentFields: [
        "INS_START_DT",
        "CATEG_CD",
        "INST_NO",
        "INST_RS",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getRecAcDetails(
          currentField,
          dependentFieldValues,
          authState,
          formState
        );
        return {
          ...postData,
          INST_NO: { value: "", ignoreUpdate: true },
        };
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INSTALLMENT_TYPE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INST_NO",
      label: "Installment",
      placeholder: "SelectInstallment",
      type: "text",
      dependentFields: [
        "INSTALLMENT_TYPE",
        "INS_START_DT",
        "INST_RS",
        "INT_RATE",
        "CATEG_CD",
      ],
      options: (dependentValue, formState, _, authState) =>
        API.getRecurringInstallmentDDW({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          INSTALLMENT_TYPE: Boolean(dependentValue?.INSTALLMENT_TYPE?.value)
            ? dependentValue?.INSTALLMENT_TYPE?.value
            : "M",
        }),
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getRecAcDetails(
          currentField,
          dependentFieldValues,
          authState,
          formState
        );
        return {
          ...postData,
        };
      },
      disableCaching: true,
      _optionsKey: "InstallmentRecurring",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "Interest",
      placeholder: "",
      type: "text",
      // required: true,
      // schemaValidation: {
      //   type: "string",
      //   rules: [{ name: "required", params: ["InterestRateisrequired"] }],
      // },
      defaultValue: "0.00",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          //@ts-ignore
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      dependentFields: [
        "INS_START_DT",
        "CATEG_CD",
        "INST_NO",
        "INST_RS",
        "INSTALLMENT_TYPE",
        "DUE_AMT",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getRecAcDetails(
          currentField,
          dependentFieldValues,
          authState,
          formState
        );
        // delete postData.PENAL_RATE;
        // delete postData.DUE_AMT;
        return {
          ...postData,
        };
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "PENAL_RATE",
      label: "Penal",
      placeholder: "",
      type: "text",
      defaultValue: "0.00",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          //@ts-ignore
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_PENAL_RATE),
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
      _optionsKey: "agentCurrentOp",
      placeholder: "SelectAgent",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INS_START_DT",
      label: "StartDate",
      placeholder: "DD/MM/YYYY",
      __NEW__: {
        defaultValue: (formState) => {
          return formState?.intialStartDt;
        },
      },
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      dependentFields: [
        "INSTALLMENT_TYPE",
        "CATEG_CD",
        "INST_NO",
        "INST_RS",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getRecAcDetails(
          currentField,
          dependentFieldValues,
          authState,
          formState
        );
        return {
          ...postData,
        };
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INS_START_DT),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField", // check condition of readOnly
      },
      name: "DUE_AMT",
      label: "MaturityAmount",
      type: "text",
      FormatProps: {
        allowNegative: true,
        isAllowed: (values) => {
          if (values?.value?.length > 11) {
            // remain to check Length
            return false;
          }
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_DUE_AMT),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INST_DUE_DT",
      label: "DueDate",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INST_DUE_DT),
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
      _optionsKey: "skipReasonRecurringOp",
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
    {
      render: {
        componentType: "datePicker",
      },
      name: "LST_INT_COMPUTE_DT",
      label: "LastIntCompDate",
      placeholder: "DD/MM/YYYY",
      isReadOnly: true,
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
