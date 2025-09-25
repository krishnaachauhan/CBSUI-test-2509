import * as API from "../api";
import { getPMISCData } from "../api";
import { format } from "date-fns";
import { greaterThanDate, utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";

export const current_tab_metadata = {
  form: {
    name: "current_tab_form",
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
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
      Divider: {
        fullWidth: true,
      },
      formbutton: {
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
      placeholder: "SelectName",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "D" }),
      _optionsKey: "directorNmCurrentOp",
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
      _optionsKey: "relationshipCurrentOp",
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
      autoComplete: "off",
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
      name: "INST_NO",
      label: "ChqSignAutho",
      options: (dependentValue, formState, _, authState) =>
        API.getCheqSignAuthoTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "chqSignAuthoCurrentOp",
      placeholder: "SelectChqSignAutho",
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
      _optionsKey: "categCurrentOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Categoryisrequired"] }],
      },
      dependentFields: ["SANCTIONED_AMT", "SANCTION_DT"],
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
          formState?.INT_RATE_BASE_ON &&
          formState?.INT_RATE_BASE_ON === "C"
        ) {
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
            SANCTIONED_AMT: dependentFieldValues?.SANCTIONED_AMT?.value ?? "",
            SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.SANCTION_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            SCREEN_REF: formState?.docCD ?? "",
          });

          let returnVal;

          for (const obj of postData?.[0]?.MSG) {
            const continueProcess = await formState?.showMessageBox(obj);
            if (!continueProcess) {
              break;
            }
            if (obj?.O_STATUS === "0") {
              returnVal = postData[0];
            }
          }

          return {
            INT_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.INT_RATE ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            PENAL_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.PENAL_RATE ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            AG_CLR_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.AG_CLR_RATE ?? "",
                    ignoreUpdate: true,
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
            PENAL_RATE: { value: "", ignoreUpdate: false },
            AG_CLR_RATE: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
      placeholder: "SelectCategory",
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
      _optionsKey: "riskCategCurrentOp",
      placeholder: "SelectRiskCategory",
      type: "text",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState.DISABLE_CLASS_CD),
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "recommendbydivider_ignoreField",
      label: "Rates",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "Interest",
      placeholder: "",
      validationRun: "onChange",
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "InterestRateisrequired";
      //   }
      //   return "";
      // },
      validate: (currentField, dependentField, formState) => {
        const isReadOnly = API.isReadOnlyOn320Flag(formState?.DISABLE_INT_RATE);
        if (!Boolean(isReadOnly)) {
          if (!Boolean(currentField.value)) {
            return "InterestRateisrequired";
          }
          return "";
        }
      },
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
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_RATE),
      type: "text",
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
        componentType: "rateOfInt",
      },
      name: "CR_INT",
      label: "Credit",
      placeholder: "",
      type: "text",
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
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "AG_CLR_RATE",
      label: "AgainstClearingRate",
      placeholder: "",
      type: "text",
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
        API.isReadOnlyOn320Flag(formState?.DISABLE_AG_CLR_RATE),
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
        componentType: "select",
      },
      name: "OD_APPLICABLE",
      label: "ODApplicable",
      __NEW__: {
        defaultValue: "T",
      },
      options: [
        { label: "Allow", value: "Y" },
        { label: "Not Allow", value: "N" },
        { label: "As per Type", value: "T" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      defaultOptionLabel: "SelectODApplicable",
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
        componentType: "select",
      },
      name: "TYPE_CD",
      label: "ChequeBook",
      __NEW__: {
        defaultValue: "Y",
      },
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
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
      name: "INT_TYPE",
      label: "IntType",
      // defaultValue: "M",
      options: [
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      defaultOptionLabel: "SelectIntType",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_TYPE),
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PTS",
      label: "SegmentPTS",
      options: (dependentValue, formState, _, authState) =>
        API.getSegmentPTSOp({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "ptsCurrentOp",
      placeholder: "SelectSegmentPTS",
      type: "text",
      dependentFields: ["SANCTIONED_AMT", "SANCTION_DT"],
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
          formState?.INT_RATE_BASE_ON &&
          formState?.INT_RATE_BASE_ON === "S"
        ) {
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
            SANCTIONED_AMT: dependentFieldValues?.SANCTIONED_AMT?.value ?? "",
            SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.SANCTION_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            SCREEN_REF: formState?.docCD ?? "",
          });

          let returnVal;

          for (const obj of postData?.[0]?.MSG) {
            const continueProcess = await formState?.showMessageBox(obj);
            if (!continueProcess) {
              break;
            }
            if (obj?.O_STATUS === "0") {
              returnVal = postData[0];
            }
          }

          return {
            INT_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.INT_RATE ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            PENAL_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.PENAL_RATE ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            AG_CLR_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.AG_CLR_RATE ?? "",
                    ignoreUpdate: true,
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
            PENAL_RATE: { value: "", ignoreUpdate: false },
            AG_CLR_RATE: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
      GridProps: { xs: 11, sm: 3.5, md: 2.5, lg: 2.2, xl: 1.8 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "PTS_ignoreField",
      label: "..",
      // type: "text",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.formMode) && formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          paddingRight: "4px",
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: { componentType: "spacer" },
      name: "SPACER1_ignoreField",
      __NEW__: {
        shouldExclude() {
          return false;
        },
      },
      shouldExclude() {
        return true;
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PURPOSE_CD",
      label: "Purpose",
      options: (dependentValue, formState, _, authState) =>
        API.getPurposeTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "purposeCurrentOp",
      placeholder: "SelectPurpose",
      type: "text",
      dependentFields: ["SANCTIONED_AMT", "SANCTION_DT"],
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
          formState?.INT_RATE_BASE_ON &&
          formState?.INT_RATE_BASE_ON === "P"
        ) {
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
            SANCTIONED_AMT: dependentFieldValues?.SANCTIONED_AMT?.value ?? "",
            SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.SANCTION_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            SCREEN_REF: formState?.docCD ?? "",
          });

          let returnVal;

          for (const obj of postData?.[0]?.MSG) {
            const continueProcess = await formState?.showMessageBox(obj);
            if (!continueProcess) {
              break;
            }
            if (obj?.O_STATUS === "0") {
              returnVal = postData[0];
            }
          }

          return {
            INT_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.INT_RATE ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            PENAL_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.PENAL_RATE ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            AG_CLR_RATE:
              returnVal !== ""
                ? {
                    value: returnVal?.AG_CLR_RATE ?? "",
                    ignoreUpdate: true,
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
            PENAL_RATE: { value: "", ignoreUpdate: false },
            AG_CLR_RATE: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
      GridProps: { xs: 10.5, sm: 3.2, md: 2.5, lg: 2.2, xl: 1.8 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "PURPOSE_ignoreField",
      label: "..",
      endsIcon: "",
      type: "text",
      rotateIcon: "scale(2)",
      placeholder: "",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.formMode) && formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          marginRight: "5px",
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: { componentType: "spacer" },
      name: "SPACER2_ignoreField",
      __NEW__: {
        shouldExclude() {
          return false;
        },
      },
      shouldExclude() {
        return true;
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PARENT_GROUP",
      label: "Priority",
      options: (dependentValue, formState, _, authState) =>
        API.getPrioritParentTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "parPriorityCurrentOp",
      placeholder: "SelectPriority",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.9, lg: 2.33, xl: 1.95 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PRIO_CD",
      label: "",
      dependentFields: ["PARENT_GROUP"],
      options: (dependentValue, formState, _, authState) =>
        API.getPrioritMainTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          dependentValue: dependentValue,
        }),
      _optionsKey: "mainPriorityCurrentOp",
      disableCaching: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.9, lg: 2.34, xl: 1.9 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SUB_PRIO_CD",
      label: "Weaker",
      dependentFields: ["PRIO_CD"],
      options: (dependentValue, formState, _, authState) =>
        API.getPriorityWeakerTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          dependentValue: dependentValue,
        }),
      _optionsKey: "weakerPrioCurrentOp",
      disableCaching: true,
      placeholder: "SelectWeaker",
      type: "text",
      GridProps: { xs: 10.5, sm: 3.2, md: 2.5, lg: 2.2, xl: 1.8 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "PRIORITY_ignoreField",
      label: "..",
      endsIcon: "",
      type: "text",
      rotateIcon: "scale(2)",
      placeholder: "",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.formMode) && formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          marginRight: "5px",
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: { componentType: "spacer" },
      name: "SPACER3_ignoreField",
      __NEW__: {
        shouldExclude() {
          return false;
        },
      },
      shouldExclude() {
        return true;
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PRIORITY_CD",
      label: "",
      isReadOnly: true,
      dependentFields: ["SUB_PRIO_CD", "PRIO_CD", "PARENT_GROUP"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        const subPrioCd: string = dependentFields.SUB_PRIO_CD.value ?? "";
        const prioCd: string = dependentFields.PRIO_CD.value ?? "";
        const parentGroup: string = dependentFields.PARENT_GROUP.value ?? "";
        if (Boolean(subPrioCd || prioCd || parentGroup)) {
          let newValue = prioCd.trim() + parentGroup.trim() + subPrioCd.trim();
          if (newValue.length < 12) {
            newValue = newValue?.padEnd(12, " ");
          }
          return newValue;
        } else {
          return null;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECURITY_CD",
      label: "Security",
      options: (dependentValue, formState, _, authState) =>
        API.getSecurityTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "securityCurrentOp",
      placeholder: "SelectSecurity",
      GridProps: { xs: 10.5, sm: 3.2, md: 2.5, lg: 2.17, xl: 1.8 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "SECURITY_ignoreField",
      label: "..",
      endsIcon: "",
      type: "text",
      rotateIcon: "scale(2)",
      placeholder: "",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.formMode) && formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          marginRight: "5px",
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: { componentType: "spacer" },
      name: "SPACER4_ignoreField",
      __NEW__: {
        shouldExclude() {
          return false;
        },
      },
      shouldExclude() {
        return true;
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INDUSTRY_CODE",
      label: "Industry",
      options: (dependentValue, formState, _, authState) =>
        API.getIndustryTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "industryCurrentOp",
      placeholder: "SelectIndustry",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.9, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RENRE_CD",
      label: "RECRE",
      options: (dependentValue, formState, _, authState) =>
        API.getRECRETypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "RECRECurrentOp",
      placeholder: "SelectRECRE",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BUSINESS_CD",
      label: "Business",
      options: (dependentValue, formState, _, authState) =>
        API.getBusinessypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "businessCurrentOp",
      placeholder: "SelectBusiness",
      listBoxMaxWidth: "100%",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SANCTIONED_AMT",
      label: "SanctionLimit",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["CATEG_CD", "PURPOSE_CD", "PTS", "SANCTION_DT"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        // current, hypo, TL
        if (formState?.isSubmitting) return {};
        if (Boolean(currentField?.value)) {
          const data = await API.validateANCAMT({
            COMP_CD: authState?.companyID,
            BRANCH_CD:
              formState?.formMode !== "new"
                ? formState?.BRANCH_CD ?? ""
                : authState?.user?.branchCode ?? "",
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
            ACCT_CD: formState?.ACCT_CD ?? "",
            CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
            CATEG_CD: dependentFieldValues?.CATEG_CD?.value ?? "",
            PURPOSE_CD: dependentFieldValues?.PURPOSE_CD?.value ?? "",
            PTS: dependentFieldValues?.PTS?.value ?? "",
            INT_RATE_BASE_ON: formState?.INT_RATE_BASE_ON ?? "",
            SHARE_ACCT_TYPE: formState?.SHARE_ACCT_TYPE ?? "",
            SHARE_ACCT_CD: formState?.SHARE_ACCT_CD ?? "",
            APPLIED_AMT: formState?.APPLIED_AMT ?? "",
            LIMIT_AMOUNT: formState?.LIMIT_AMOUNT ?? "",
            SANCTIONED_AMT: currentField?.value ?? "",
            SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.SANCTION_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            RECOMMENED_NM: formState?.RECOMMENED_NM ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            SCREEN_REF: formState?.docCD ?? "",
          });
          let response_messages: any[] = [];
          if (data && data?.[0]?.MSG && Array.isArray(data?.[0]?.MSG)) {
            response_messages = data?.[0]?.MSG;
          }
          if (response_messages?.length > 0) {
            const messagebox = async (msgTitle, msg, buttonNames, status) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon:
                  status === "9"
                    ? "WARNING"
                    : status === "99"
                    ? "CONFIRM"
                    : status === "999"
                    ? "ERROR"
                    : status === "0" && "SUCCESS",
              });
              return { buttonName, status };
            };

            for (let i = 0; i < response_messages?.length; i++) {
              if (response_messages[i]?.O_STATUS !== "0") {
                let btnName = await messagebox(
                  response_messages[i]?.O_MSG_TITLE ??
                    response_messages[i]?.O_STATUS === "999"
                    ? "ValidationFailed"
                    : response_messages[i]?.O_STATUS === "99"
                    ? "Confirmation"
                    : response_messages[i]?.O_STATUS === "9"
                    ? "Alert"
                    : "",
                  response_messages[i]?.O_MESSAGE,
                  response_messages[i]?.O_STATUS === "99"
                    ? ["Yes", "No"]
                    : ["Ok"],
                  response_messages[i]?.O_STATUS
                );
                if (btnName?.status === "999" || btnName?.buttonName === "No") {
                  return {
                    SANCTIONED_AMT: { value: "" },
                  };
                }
              } else {
                const AG_CLR_RATE = data?.[0]?.AG_CLR_RATE ?? "";
                const INSURANCE_EXPIRY_PENAL_RT =
                  data?.[0]?.INSURANCE_EXPIRY_PENAL_RT ?? "";
                const INT_RATE = data?.[0]?.INT_RATE ?? "";
                const PENAL_RATE = data?.[0]?.PENAL_RATE ?? "";
                const STOCK_EXPIRY_PENAL_RT =
                  data?.[0]?.STOCK_EXPIRY_PENAL_RT ?? "";
                return {
                  AG_CLR_RATE: { value: AG_CLR_RATE },
                  INSURANCE_EXPIRY_PENAL_RT: {
                    value: INSURANCE_EXPIRY_PENAL_RT,
                  },
                  INT_RATE: { value: INT_RATE },
                  PENAL_RATE: { value: PENAL_RATE },
                  STOCK_EXPIRY_PENAL_RT: { value: STOCK_EXPIRY_PENAL_RT },
                };
              }
            }
          }
        }
        return {};
      },
      autoComplete: "off",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "SANCTION_DT",
      label: "SanctionDate",
      placeholder: "DD/MM/YYYY",
      isMaxWorkingDate: true,
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        } else if (
          greaterThanDate(value?.value, value?._maxDt, {
            ignoreTime: true,
          })
        ) {
          return t("SanctionDateValidationMessage");
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INST_DUE_DT",
      label: "DueDate",
      placeholder: "DD/MM/YYYY",
      isMaxWorkingDate: true,
      dependentFields: ["SANCTION_DT"],
      validate: (value, dependent) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        } else if (
          greaterThanDate(dependent?.SANCTION_DT?.value, value?.value, {
            ignoreTime: true,
          })
        ) {
          return t("DueDateMoreThanSanctionalDate");
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "NPA_DT",
      label: "NPADate",
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
      __NEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "NPA_CD",
      label: "NPA",
      options: (dependentValue, formState, _, authState) =>
        API.getNPATypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "npaCurrentOp",
      placeholder: "SelectNPA",
      type: "text",
      __NEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      GridProps: { xs: 10.5, sm: 3.2, md: 2.5, lg: 2.2, xl: 1.8 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "NPA_ignoreField",
      label: "..",
      endsIcon: "",
      type: "text",
      rotateIcon: "scale(2)",
      placeholder: "",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.formMode) && formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 1,
        sm: 0.5,
        md: 0.5,
        lg: 0.2,
        xl: 0.2,
        sx: {
          marginRight: "5px",
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "NPA_REASON",
      label: "ForcefullyNPAReason",
      options: (dependentValue) => getPMISCData("npa_reason"),
      _optionsKey: "npaReasonCurrentOp",
      placeholder: "SelectForcefullyNPAReason",
      type: "text",
      __NEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 2.9, lg: 2.34, xl: 1.96 },
    },
  ],
};
