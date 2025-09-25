import * as API from "../api";
import { getPMISCData } from "../api";
import { addMonths, format, isValid } from "date-fns";
import { utilFunction } from "@acuteinfo/common-base";
import { handleDisplayMessages } from "components/utilFunction/function";

export const termLoan_metadata = {
  form: {
    name: "termLoan_tab_form",
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
      name: "recommendbydivider_ignoreField",
      label: "RecommendedBy",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RECOMMENED_NM",
      label: "Name",
      placeholder: "SelectName",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "R" }),
      _optionsKey: "recommendNmTermLoanOp",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SANCTIONED_BY",
      label: "SanctionedBy",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "S" }),
      _optionsKey: "sanctionByTermLoanOp",
      placeholder: "SelectSanctionedBy",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RESOLUTION_NO",
      label: "ResolutionNo",
      type: "text",
      maxLength: 50,
      className: "textInputFromRight",
      placeholder: "EnterResolutionNo",
      textFieldStyle: {
        "& .MuiInputBase-input::placeholder": {
          textAlign: "left",
        },
      },
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "Advancesdivider_ignoreField",
      label: "AdvancesBelongsToDirector",
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
      _optionsKey: "directorNmTermLoanOp",
      placeholder: "SelectName",
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
      name: "DAY_BOOK_REVRS_GRP_CD",
      label: "Relationship",
      options: (dependentValue) => getPMISCData("RELATIONSHIP"),
      _optionsKey: "relationshipTermLoanOp",
      placeholder: "SelectRelationship",
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
            INSURANCE_EXPIRY_PENAL_RT:
              returnVal !== ""
                ? {
                    value: returnVal?.INSURANCE_EXPIRY_PENAL_RT ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            STOCK_EXPIRY_PENAL_RT:
              returnVal !== ""
                ? {
                    value: returnVal?.STOCK_EXPIRY_PENAL_RT ?? "",
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
            INSURANCE_EXPIRY_PENAL_RT: { value: "", ignoreUpdate: false },
            STOCK_EXPIRY_PENAL_RT: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
      _optionsKey: "ptsTermLoanOp",
      placeholder: "SelectSegmentPTS",
      type: "text",
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
        componentType: "textField",
      },
      name: "RATING_CD",
      label: "Rating",
      isReadOnly: true,
      placeholder: "",
      type: "text",
      // ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
      _optionsKey: "purposeTermLoanOpishewfiwef",
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
            INSURANCE_EXPIRY_PENAL_RT:
              returnVal !== ""
                ? {
                    value: returnVal?.INSURANCE_EXPIRY_PENAL_RT ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            STOCK_EXPIRY_PENAL_RT:
              returnVal !== ""
                ? {
                    value: returnVal?.STOCK_EXPIRY_PENAL_RT ?? "",
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
            INSURANCE_EXPIRY_PENAL_RT: { value: "", ignoreUpdate: false },
            STOCK_EXPIRY_PENAL_RT: { value: "", ignoreUpdate: false },
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
      _optionsKey: "parPriorityTermLoanOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Priorityisrequired"] }],
      },
      placeholder: "SelectPriority",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
      _optionsKey: "mainPriorityTermLoanOp",
      disableCaching: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
      _optionsKey: "weakerPrioTermLoanOp",
      disableCaching: true,
      // _optionsKey: "weakerTermLoanOp",
      placeholder: "SelectWeaker",
      type: "text",
      GridProps: { xs: 11, sm: 3.5, md: 2.5, lg: 2.2, xl: 1.8 },
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
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "PRIORITY_CD",
    //   label: "",
    //   isReadOnly: true,
    //   required: true,
    //   schemaValidation: {
    //     type: "string",
    //     rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
    //   },
    //   GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    // },
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
      _optionsKey: "securityTermLoanOp",
      placeholder: "SelectSecurity",
      type: "text",
      GridProps: { xs: 11, sm: 3.5, md: 2.5, lg: 2.2, xl: 1.8 },
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
      name: "NPA_CD",
      label: "NPA",
      options: (dependentValue, formState, _, authState) =>
        API.getNPATypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "npaTermLoanOp",
      placeholder: "SelectNPA",
      type: "text",
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
      GridProps: { xs: 11, sm: 3.5, md: 2.5, lg: 2.2, xl: 1.8 },
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
          "& .MuiButtonBase-root": {
            minWidth: "20px !important",
            maxWidth: "20px !important",
          },
        },
      },
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
        shouldExclude() {
          return true;
        },
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
      _optionsKey: "categTermLoanOp",
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
            INSURANCE_EXPIRY_PENAL_RT:
              returnVal !== ""
                ? {
                    value: returnVal?.INSURANCE_EXPIRY_PENAL_RT ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
            STOCK_EXPIRY_PENAL_RT:
              returnVal !== ""
                ? {
                    value: returnVal?.STOCK_EXPIRY_PENAL_RT ?? "",
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
            INSURANCE_EXPIRY_PENAL_RT: { value: "", ignoreUpdate: false },
            STOCK_EXPIRY_PENAL_RT: { value: "", ignoreUpdate: false },
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
      name: "NPA_REASON",
      label: "ForcefullyNPAReason",
      options: (dependentValue) => getPMISCData("npa_reason"),
      _optionsKey: "npaReasonTermLoanOp",
      placeholder: "SelectForcefullyNPAReason",
      type: "text",
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
      name: "loanDTLdivider_ignoreField",
      label: "LoanDetail",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "APPLY_DT",
      label: "Application",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ApplicationIsRequired"] }],
      },
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
      dependentFields: ["SANCTION_DT"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        const request = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD:
            formState?.formMode !== "new"
              ? formState?.BRANCH_CD ?? ""
              : authState?.user?.branchCode ?? "",
          APPLY_DT: Boolean(currentField?.value)
            ? format(
                utilFunction.getParsedDate(currentField?.value),
                "dd/MMM/yyyy"
              )
            : "",
          SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
            ? format(
                utilFunction.getParsedDate(
                  dependentFieldValues?.SANCTION_DT?.value
                ),
                "dd/MMM/yyyy"
              )
            : "",
          WORKING_DATE: authState?.workingDate ?? "",
        };
        let postData = await API.validateApplyDT({ ...request });
        let response_messages: any[] = [];
        if (postData && postData && Array.isArray(postData)) {
          response_messages = postData;
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
                  APPLY_DT: { isFieldFocused: true },
                };
              }
            }
          }
        } else {
          return {};
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "SANCTION_DT",
      label: "Sanction",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["SanctionIsRequired"] }],
      },
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
      dependentFields: [
        "CATEG_CD",
        "PURPOSE_CD",
        "PTS",
        "SANCTIONED_AMT",
        "APPLY_DT",
        "INS_START_DT",
        "DISBURSEMENT_DT",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        const sanctionDt = currentField?.value;
        if (Boolean(currentField?.value)) {
          const monthCount = !isNaN(Number(formState?.PARA_297))
            ? Number(formState?.PARA_297)
            : 0;
          const dueDt = addMonths(new Date(sanctionDt), monthCount);
          const request = {
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
            SANCTIONED_AMT: dependentFieldValues?.SANCTIONED_AMT?.value ?? "",
            SANCTION_DT: Boolean(currentField?.value)
              ? format(
                  utilFunction.getParsedDate(currentField?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            APPLY_DT: Boolean(dependentFieldValues?.APPLY_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.APPLY_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            INS_START_DT: Boolean(dependentFieldValues?.INS_START_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.INS_START_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            DISBURSEMENT_DT: Boolean(
              dependentFieldValues?.DISBURSEMENT_DT?.value
            )
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.DISBURSEMENT_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            WORKING_DATE: authState?.workingDate,
          };
          let postData = await API.validateSanctionDT({ ...request });
          let postValue = postData?.[0];
          if (postData?.length > 0) {
            const response: any = await handleDisplayMessages(
              postData?.[0]?.MSG,
              formState?.MessageBox
            );

            if (response?.O_STATUS === "0") {
              if (postData?.[0]?.SET_RATE === "Y") {
                return {
                  STOCK_EXPIRY_PENAL_RT: {
                    value: postValue?.STOCK_EXPIRY_PENAL_RT ?? "",
                  },
                  INT_RATE: { value: postValue?.INT_RATE ?? "" },
                  AG_CLR_RATE: { value: postValue?.AG_CLR_RATE ?? "" },
                  PENAL_RATE: { value: postValue?.PENAL_RATE ?? "" },
                  INSURANCE_EXPIRY_PENAL_RT: {
                    value: postValue?.INSURANCE_EXPIRY_PENAL_RT ?? "",
                  },
                  DISBURSEMENT_DT: { value: postValue?.DISBURSEMENT_DT ?? "" },
                  INST_DUE_DT: { value: postValue?.INST_DUE_DT ?? "" },
                  INS_START_DT: { value: postValue?.INS_START_DT ?? "" },
                };
              } else {
                return {
                  DISBURSEMENT_DT: { value: postValue?.DISBURSEMENT_DT ?? "" },
                  INST_DUE_DT: { value: postValue?.INST_DUE_DT ?? "" },
                  INS_START_DT: { value: postValue?.INS_START_DT ?? "" },
                };
              }
            } else {
              return {
                SANCTION_DT: { value: "", isFieldFocused: true },
              };
            }
          }
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DISBURSEMENT_DT",
      label: "Disbursement",
      required: true,
      placeholder: "DD/MM/YYYY",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DisbursementIsRequired"] }],
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (Boolean(formState?.GPARAM155) && formState?.GPARAM155 === "Y") {
          return true;
        }
        return false;
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
      dependentFields: ["SANCTION_DT"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.validateDisbDT({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD:
            formState?.formMode !== "new"
              ? formState?.BRANCH_CD ?? ""
              : authState?.user?.branchCode ?? "",
          DISBURSEMENT_DT: Boolean(currentField?.value)
            ? format(
                utilFunction.getParsedDate(currentField?.value),
                "dd/MMM/yyyy"
              )
            : "",
          SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
            ? format(
                utilFunction.getParsedDate(
                  dependentFieldValues?.SANCTION_DT?.value
                ),
                "dd/MMM/yyyy"
              )
            : "",
          WORKING_DATE: authState?.workingDate ?? "",
        });
        let response_messages: any[] = [];
        if (
          postData &&
          postData?.[0]?.MSG &&
          Array.isArray(postData?.[0]?.MSG)
        ) {
          response_messages = postData?.[0]?.MSG;
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
                  DISBURSEMENT_DT: { value: "", isFieldFocused: true },
                };
              }
            } else {
              return {
                INS_START_DT: { value: postData?.[0]?.INS_START_DT },
                INT_SKIP_REASON_TRAN_CD: {
                  value: postData?.[0]?.INT_SKIP_REASON_TRAN_CD,
                },
              };
            }
          }
        }
        return {};
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FILE_NO",
      label: "FileNo",
      type: "text",
      maxLength: 20,
      placeholder: "EnterFileNo",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
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
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InstallmentTypeisrequired"] }],
      },
      __NEW__: {
        defaultValue: "M",
      },
      defaultOptionLabel: "SelectInstallmentType",
      type: "text",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INSTALLMENT_TYPE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PACKET_NO",
      label: "PacketNo",
      type: "text",
      placeholder: "EnterPacketNo",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (Boolean(formState?.tabFlag) && formState?.tabFlag === "GDL") {
          return false;
        }
        return true;
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.tabFlag) && formState?.tabFlag === "GDL") {
          return true;
        }
        return false;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Description",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DescriptionisRequired"] }],
      },
      placeholder: "EnterDescription",
      ignoreInSubmit: (dependentField, formState, currentField) => {
        if (Boolean(formState?.tabFlag) && formState?.tabFlag === "GDL") {
          return false;
        }
        return true;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        /// Remain to add screen flag in formstate and also check gold loan tab
        if (Boolean(formState?.tabFlag) && formState?.tabFlag === "GDL") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "amountdivider_ignoreField",
      label: "Amount",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "APPLIED_AMT",
      label: "AppliedAmt",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AppliedIsRequired"] }],
      },
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 13) {
            return false;
          }
          return true;
        },
      },
      autoComplete: "off",
      // textFieldStyle: {
      //   "& .MuiInputLabel-formControl": {
      //     right: "0",
      //     left: "auto",
      //   },
      // },
      // isReadOnly: true,
      // dependentFields: ["SERVICE_TAX", "CHEQUE_TOTAL"],
      // runValidationOnDependentFieldsChange: true,
      // validate: (currentField, dependentFields, formState) => {
      //   if (
      //     Number(dependentFields.SERVICE_TAX.value) *
      //       Number(dependentFields.CHEQUE_TOTAL.value) >
      //     Number(currentField.value)
      //   ) {
      //     return "balance is less than service-charge";
      //   }
      //   return "";
      // },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SANCTIONED_AMT",
      label: "SanctionedAmt",
      type: "text",
      autoComplete: "off",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 13) {
            return false;
          }
          return true;
        },
      },
      // required: true,
      // schemaValidation: {
      //   type: "string",
      //   rules: [{ name: "required", params: ["Sanctionedisrequired"] }],
      // },
      dependentFields: [
        "CATEG_CD",
        "PURPOSE_CD",
        "PTS",
        "SANCTION_DT",
        "APPLIED_AMT",
        "LIMIT_AMOUNT",
        "RECOMMENED_NM",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
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
            APPLIED_AMT: dependentFieldValues?.APPLIED_AMT?.value ?? "",
            LIMIT_AMOUNT: dependentFieldValues?.LIMIT_AMOUNT?.value ?? "",
            SANCTIONED_AMT: currentField?.value ?? "",
            SANCTION_DT: Boolean(dependentFieldValues?.SANCTION_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.SANCTION_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            RECOMMENED_NM: dependentFieldValues?.RECOMMENED_NM?.value ?? "",
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
                    SANCTIONED_AMT: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
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
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "DisbursedAmount",
      autoComplete: "off",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 13) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DisbursedIsRequired"] }],
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          (Boolean(formState?.GPARAM155) && formState?.GPARAM155 === "Y") ||
          (Boolean(formState?.tabFlag) && formState?.tabFlag === "LTL")
        ) {
          return true;
        }
        return false;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "TYPE_CD",
      label: "Type",
      options: [
        { label: "EMI", value: "1" },
        { label: "SIMPLE", value: "2" },
        { label: "SIMPLE with Int.", value: "3" },
        { label: "SIMPLE with Flat", value: "4" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      defaultOptionLabel: "SelectType",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["typeRequired"] }],
      },
      dependentFields: [
        "DISBURSEMENT_DT",
        "INSTALLMENT_TYPE",
        "INST_NO",
        "INS_START_DT",
        "INT_RATE",
        "LIMIT_AMOUNT",
        "INT_SKIP_FLAG",
        "INT_SKIP_REASON_TRAN_CD",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value) {
          const request = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD:
              formState?.formMode !== "new"
                ? formState?.BRANCH_CD ?? ""
                : authState?.user?.branchCode ?? "",
            DISBURSEMENT_DT: Boolean(
              dependentFieldValues?.DISBURSEMENT_DT?.value
            )
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.DISBURSEMENT_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            INSTALLMENT_TYPE:
              dependentFieldValues?.INSTALLMENT_TYPE?.value ?? "",
            INST_NO: dependentFieldValues?.INST_NO?.value ?? "",
            INS_START_DT: Boolean(dependentFieldValues?.INS_START_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.INS_START_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            INT_RATE: dependentFieldValues?.INT_RATE?.value ?? "",
            LIMIT_AMOUNT: dependentFieldValues?.LIMIT_AMOUNT?.value ?? "",
            TYPE_CD: currentField?.value ?? "",
            INT_SKIP_FLAG: dependentFieldValues?.INT_SKIP_FLAG?.value ?? "",
            INT_SKIP_REASON_TRAN_CD:
              dependentFieldValues?.INT_SKIP_REASON_TRAN_CD?.value ?? "",
          };
          let postData = await API.getEmi({ ...request });
          if (Array.isArray(postData) && postData?.length > 0) {
            return {
              INST_RS: { value: postData?.[0]?.INST_RS ?? "" },
            };
          } else {
            return {
              INST_RS: { value: "" },
            };
          }
        }
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_TYPE_CD),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    // {
    //   render: {
    //     componentType: "formbutton",
    //   },
    //   name: "ornamentDTL_ignoreField",
    //   label: "OrnamentDetails",
    //   placeholder: "",
    //   type: "text",
    //   shouldExclude(fieldData, dependentFieldsValues, formState) {
    //     if (
    //       Boolean(formState?.tabFlag) &&
    //       formState?.tabFlag === "GDL"
    //     ) {
    //       return false;
    //     }
    //     return true;
    //   },
    //   GridProps: { lg: 1, xl: 1 },
    // },
    {
      render: {
        componentType: "formbutton",
      },
      name: "ornamentDTL_ignoreField",
      label: "OrnamentDetails",
      placeholder: "",
      type: "text",
      dependentFields: [
        "PACKET_NO",
        "APPLIED_AMT",
        "SANCTIONED_AMT",
        "DESCRIPTION",
      ],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (Boolean(formState?.tabFlag) && formState?.tabFlag === "GDL") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "INT_TYPE",
      label: "InterestType",
      options: [
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
        { label: "On Expiry", value: "E" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      defaultOptionLabel: "SelectIntType",
      type: "text",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_TYPE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "IntRateWithPer",
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
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "PENAL_RATE",
      label: "PenalRate",
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
      name: "INSURANCE_EXPIRY_PENAL_RT",
      label: "InsuranceExpiryPenalRate",
      placeholder: "",
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
        API.isReadOnlyOn320Flag(formState?.DISABLE_INSU_DUE_RATE),
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "RATE_WEF",
      label: "WEF",
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
        shouldExclude() {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DOCKET_NO",
      label: "DocketNumber",
      maxLength: 20,
      placeholder: "EnterDocketNo",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "NO_OF_LEAVES",
      label: "Insurance",
      options: [
        { label: "Bank", value: "0" },
        { label: "Waiver", value: "99999" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      defaultOptionLabel: "SelectInsurance",
      __NEW__: {
        defaultValue: "0",
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "nxtDisburse_ignoreField",
      label: "NextDisbursement",
      placeholder: "",
      type: "text",
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
      __VIEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          const opendate = new Date(formState?.OPEN_DATE);
          const formattedDate = isValid(opendate)
            ? format(
                utilFunction.getParsedDate(opendate),
                "dd/MMM/yyyy"
              ).toUpperCase()
            : "";
          if (formattedDate === formState?.WORKING_DATE) {
            return true;
          } else {
            return false;
          }
        },
      },
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          const opendate = new Date(formState?.OPEN_DATE);
          const formattedDate = isValid(opendate)
            ? format(
                utilFunction.getParsedDate(opendate),
                "dd/MMM/yyyy"
              ).toUpperCase()
            : "";
          if (formattedDate === formState?.WORKING_DATE) {
            return true;
          } else {
            return false;
          }
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "vhcleDTL_ignoreField",
      label: "VehicleDetail",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "machineryDTL_ignoreField",
      label: "MachineryDetails",
      placeholder: "",
      type: "text",
      // isReadOnly: (fieldValue, dependentFields, formState) => {
      //   if (Boolean(formState?.formMode) && formState?.formMode === "view") {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "numberFormat", //come back
      },
      name: "INST_NO",
      label: "NoOfInstallment",
      maxLength: 5,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          return true;
        },
      },
      dependentFields: [
        "CATEG_CD",
        "PURPOSE_CD",
        "PTS",
        "SANCTIONED_AMT",
        "SANCTION_DT",
        "DISBURSEMENT_DT",
        "INSTALLMENT_TYPE",
        "INS_START_DT",
        "INT_RATE",
        "LIMIT_AMOUNT",
        "TYPE_CD",
        "INT_SKIP_FLAG",
        "INT_SKIP_REASON_TRAN_CD",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          const request = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD:
              formState?.formMode !== "new"
                ? formState?.BRANCH_CD ?? ""
                : authState?.user?.branchCode ?? "",
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
            ACCT_CD: formState?.ACCT_CD ?? "",
            CATEG_CD: dependentFieldValues?.CATEG_CD?.value ?? "",
            PURPOSE_CD: dependentFieldValues?.PURPOSE_CD?.value ?? "",
            PTS: dependentFieldValues?.PTS?.value ?? "",
            INT_RATE_BASE_ON: formState?.INT_RATE_BASE_ON ?? "",
            CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
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
            DISBURSEMENT_DT: Boolean(
              dependentFieldValues?.DISBURSEMENT_DT?.value
            )
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.DISBURSEMENT_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            INSTALLMENT_TYPE:
              dependentFieldValues?.INSTALLMENT_TYPE?.value ?? "",
            INST_NO: currentField?.value ?? "",
            INS_START_DT: Boolean(dependentFieldValues?.INS_START_DT?.value)
              ? format(
                  utilFunction.getParsedDate(
                    dependentFieldValues?.INS_START_DT?.value
                  ),
                  "dd/MMM/yyyy"
                )
              : "",
            INT_RATE: dependentFieldValues?.INT_RATE?.value ?? "",
            LIMIT_AMOUNT: dependentFieldValues?.LIMIT_AMOUNT?.value ?? "",
            TYPE_CD: dependentFieldValues?.TYPE_CD?.value ?? "",
            INT_SKIP_FLAG: dependentFieldValues?.INT_SKIP_FLAG?.value ?? "",
            INT_SKIP_REASON_TRAN_CD:
              dependentFieldValues?.INT_SKIP_REASON_TRAN_CD?.value ?? "",
          };
          let postData = await API.validateInstNo({ ...request });
          let response_messages: any[] = [];
          if (
            postData &&
            postData?.[0]?.MSG &&
            Array.isArray(postData?.[0]?.MSG)
          ) {
            response_messages = postData?.[0]?.MSG;
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
                    INST_NO: { value: "", isFieldFocused: true },
                  };
                }
              } else {
                return {
                  INST_DUE_DT: { value: postData?.[0]?.INST_DUE_DT ?? "" },
                  INST_RS: { value: postData?.[0]?.INST_RS ?? "" },
                };
              }
            }
          }
        }
      },
      autoComplete: "off",
      className: "textInputFromRight",
      placeholder: "EnterNoofInstallment",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "installment_ignoreField",
      label: "",
      options: [
        { label: "Month(s)", value: "M" },
        { label: "Quarter(s)", value: "Q" },
        { label: "Half-year(s)", value: "H" },
        { label: "Year(s)", value: "Y" },
        { label: "On Expire", value: "E" },
        { label: "Day(s)", value: "D" },
      ],
      dependentFields: ["INSTALLMENT_TYPE"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        const InstallmentValue = dependentFields?.INSTALLMENT_TYPE?.value;
        if (InstallmentValue === "M") {
          return "M";
        } else if (InstallmentValue === "Q") {
          return "Q";
        } else if (InstallmentValue === "D") {
          return "D";
        } else if (InstallmentValue === "H") {
          return "H";
        } else if (InstallmentValue === "Y") {
          return "Y";
        } else if (InstallmentValue === "E") {
          return "E";
        } else {
          return "M";
        }
      },
      defaultOptionLabel: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INT_SKIP_FLAG",
      label: "IntFunded",
      options: [
        { label: "N/A", value: "" },
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      placeholder: "SelectIntFunded",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INS_START_DT",
      label: "InstStartDate",
      placeholder: "DD/MM/YYYY",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InstStartDateIsRequired"] }],
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (Boolean(formState?.GPARAM155) && formState?.GPARAM155 === "Y") {
          return true;
        }
        return false;
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
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "numberFormat", //come back
      },
      name: "INT_SKIP_REASON_TRAN_CD",
      label: "MoratoriumPeriod",
      maxLength: 6,
      dependentFields: ["INT_SKIP_FLAG"],
      shouldExclude: (fieldData, dependentFieldsValues, formState) => {
        if (!Boolean(dependentFieldsValues?.INT_SKIP_FLAG?.value)) {
          return true;
        }
        return false;
      },
      // FormatProps: {
      //     isAllowed: (values) => {
      //         if (values?.value?.length > 6) {
      //         return false;
      //         }
      //         return true;
      //     },
      // },
      // validate: (columnValue) => {
      //     const PIN = columnValue.value
      //     if(Boolean(PIN) && PIN.length<6) {
      //         return "Pin code should be of six digits"
      //     }
      // },
      placeholder: "EnterMoratoriumPeriod",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INST_RS",
      label: "InstallmentAmt",
      autoComplete: "off",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (Boolean(formState?.GPARAM155) && formState?.GPARAM155 === "Y") {
          return true;
        }
        return false;
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
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DueDateRequire"] }],
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (Boolean(formState?.GPARAM155) && formState?.GPARAM155 === "Y") {
          return true;
        }
        return false;
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
      _optionsKey: "agentTermLoanOp",
      placeholder: "SelectAgent",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "DUE_AMT",
      label: "OldCredit",
      type: "text",
      FormatProps: {
        allowNegative: true,
        isAllowed: (values) => {
          if (values?.value?.length > 13) {
            return false;
          }
          return true;
        },
      },
      __NEW__: {
        shouldExclude() {
          return true;
        },
      },
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
      _optionsKey: "riskCategTermLoanOp",
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
        componentType: "autocomplete",
      },
      name: "INDUSTRY_CODE",
      label: "Industry",
      options: (dependentValue, formState, _, authState) =>
        API.getIndustryTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "industryTermLoanOp",
      placeholder: "SelectIndustry",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
      _optionsKey: "RECRETermLoanOp",
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
      _optionsKey: "businessTermLoanOp",
      placeholder: "SelectBusiness",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DATE_OF_COMMENCEMENT",
      label: "CommencementDateOfCommercialOperation",
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
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PRODUCTION_YES_NO",
      label: "ProductionStart",
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      placeholder: "SelectProductionStart",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
