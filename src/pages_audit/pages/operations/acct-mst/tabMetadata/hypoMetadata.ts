import * as API from "../api";
import { getPMISCData } from "../api";
import { format } from "date-fns";
import { greaterThanDate, utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";

export const hypothication_metadata = {
  form: {
    name: "hypothication_tab_form",
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
      name: "recommendbydivider1_ignoreField",
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
      _optionsKey: "recommendNmHypoOp",
      optionsGridColDef: {
        DIRECTOR_FLAG: { isVisible: false },
        SANCTION_LIMIT: { isVisible: false },
        DIRECTOR_CD: { isVisible: false },
        value: { isVisible: false },
      },
      // defaultValue: "N",
      type: "text",
      // required: true,
      // schemaValidation: {
      //   type: "string",
      //   rules: [{ name: "required", params: ["Nameisrequired"] }],
      // },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SANCTIONED_BY",
      label: "SanctionedBy",
      placeholder: "SelectSanctionedBy",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "S" }),
      _optionsKey: "sanctionByHypoOp",
      optionsGridColDef: {
        DIRECTOR_FLAG: { isVisible: false },
        SANCTION_LIMIT: { isVisible: false },
        DIRECTOR_CD: { isVisible: false },
        DIRECTOR_NM: { isVisible: false },
        value: { isVisible: false },
      },
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
      placeholder: "EnterResolutionNo",
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
      name: "recommendbydivider2_ignoreField",
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
      placeholder: "SelectName",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "D" }),
      _optionsKey: "directorNmHypoOp",
      optionsGridColDef: {
        DIRECTOR_FLAG: { isVisible: false },
        DIRECTOR_CD: { isVisible: false },
        value: { isVisible: false },
      },
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
      name: "DAY_BOOK_REVRS_GRP_CD",
      label: "Relationship",
      options: (dependentValue) => getPMISCData("RELATIONSHIP"),
      _optionsKey: "relationshipHypoOp",
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
      _optionsKey: "ptsHypoOp",
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
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "PTS_ignoreField",
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
        xs: 12,
        sm: 4,
        md: 3,
        lg: 2.4,
        xl: 2,
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
      name: "CATEG_CD",
      label: "Category",
      options: (dependentValue, formState, _, authState) =>
        API.getCategoryTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "categHypoOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Categoryisrequired"] }],
      },
      placeholder: "SelectCategory",
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
      _optionsKey: "securityHypoOp",
      placeholder: "SelectSecurity",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["SecurityIsRequired"] }],
      },
      type: "text",
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
      _optionsKey: "purposeHypoOp",
      placeholder: "SelectPurpose",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PurposeIsRequired"] }],
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
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
        xs: 12,
        sm: 4,
        md: 3,
        lg: 2.4,
        xl: 2,
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
      _optionsKey: "parPriorityHypoOp",
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
      _optionsKey: "mainPriorityHypoOp",
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
      _optionsKey: "weakerPrioHypoOp",
      disableCaching: true,
      // _optionsKey: "weakerTermLoanOp",
      placeholder: "SelectWeaker",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
      name: "INT_TYPE",
      label: "IntType",
      options: [
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
        { label: "On Expiry", value: "E" },
      ],
      // _optionsKey: "npaReasonTermLoanOp",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState.DISABLE_INT_TYPE),
      placeholder: "SelectIntType",
      type: "text",
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
      _optionsKey: "npaHypoOp",
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
      name: "NPA_REASON",
      label: "ForcefullyNPAReason",
      options: (dependentValue) => getPMISCData("npa_reason"),
      _optionsKey: "npaReasonHypoOp",
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
        componentType: "amountField",
      },
      name: "SANCTIONED_AMT",
      label: "SanctionLimit",
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
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["SanctionLimitIsRequired"] }],
      },
      dependentFields: [
        "CATEG_CD",
        "PURPOSE_CD",
        "PTS",
        "SANCTION_DT",
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
            RECOMMENED_NM: dependentFieldValues?.RECOMMENED_NM?.value ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            SCREEN_REF: formState?.docCD ?? "",
          });

          if (data && data?.[0]?.MSG) {
            for (const obj of data?.[0]?.MSG) {
              if (
                obj?.O_STATUS === "999" ||
                obj?.O_STATUS === "99" ||
                obj?.O_STATUS === "9"
              ) {
                const buttonName = await formState?.MessageBox({
                  messageTitle: obj?.O_MSG_TITLE?.length
                    ? obj?.O_MSG_TITLE
                    : obj?.O_STATUS === "9"
                    ? "Alert"
                    : obj?.O_STATUS === "99"
                    ? "Confirmation"
                    : "ValidationFailed",
                  message: obj?.O_MESSAGE ?? "",
                  buttonNames: obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                  icon:
                    obj?.O_STATUS === "999"
                      ? "ERROR"
                      : obj?.O_STATUS === "99"
                      ? "CONFIRM"
                      : obj?.O_STATUS === "9"
                      ? "WARNING"
                      : "INFO",
                });
                if (
                  (obj?.O_STATUS === "99" && buttonName === "No") ||
                  obj?.O_STATUS === "999"
                ) {
                  return {
                    SANCTIONED_AMT: { value: "" },
                  };
                }
              } else if (obj?.O_STATUS === "0") {
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
        if (Boolean(currentField?.value)) {
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
          let showData = postData?.[0]?.MSG?.[0]?.O_STATUS;
          let postValue = postData?.[0];
          if (showData === "0") {
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
          }
        }
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
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INST_DUE_DT),
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
        componentType: "autocomplete",
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
        componentType: "autocomplete",
      },
      name: "AGENT_CD",
      label: "Agent",
      options: (dependentValue, formState, _, authState) =>
        API.getAgentTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "agentHypoOp",
      placeholder: "SelectAgent",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "recommendbydivider3_ignoreField",
      label: "rates",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "IntRateWithPer",
      placeholder: "",
      type: "text",
      maxPercent: 1000,
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState.DISABLE_INT_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "CR_INT",
      label: "IntOnCreditBalance",
      placeholder: "",
      type: "text",
      maxPercent: 1000,
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      autoComplete: "off",
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
      maxPercent: 1000,
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      autoComplete: "off",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState.DISABLE_AG_CLR_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
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
        componentType: "rateOfInt",
      },
      name: "PENAL_RATE",
      label: "PenalRate",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      autoComplete: "off",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState.DISABLE_PENAL_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INSURANCE_EXPIRY_PENAL_RT",
      label: "InsuranceExpiryPenal",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      autoComplete: "off",
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState.DISABLE_INSU_DUE_RATE),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "STOCK_EXPIRY_PENAL_RT",
      label: "StockExpiryPenal",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue > 999.99) {
            return false;
          }
          return true;
        },
      },
      autoComplete: "off",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LST_INT_COMPUTE_DT",
      label: "LastIntApplied",
      isReadOnly: true,
      placeholder: "DD/MM/YYYY",
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
      name: "FILE_NO",
      label: "FileNo",
      type: "text",
      maxLength: 20,
      placeholder: "EnterFileNo",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      autoComplete: "off",
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
      _optionsKey: "riskCategHypoOp",
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
      name: "INST_NO",
      label: "ChqSignAutho",
      options: (dependentValue, formState, _, authState) =>
        API.getCheqSignAuthoTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "chqSignAuthoHypoOp",
      placeholder: "SelectChqSignAutho",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "letterofCont_ignoreField",
      label: "LetterOfContinuityDetail",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(formState?.formMode) && formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      placeholder: "",
      type: "text",
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
      _optionsKey: "industryHypoOp",
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
      _optionsKey: "RECREHypoOp",
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
      _optionsKey: "businessHypoOp",
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
      placeholder: "SelectProductionStart",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
