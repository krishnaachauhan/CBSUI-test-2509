import * as API from "../api";
import { getPMISCData } from "../api";
import { format } from "date-fns";
import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
import { GeneralAPI } from "registry/fns/functions";

export const fixDeposit_tab_metadata = {
  form: {
    name: "fixdeposit_tab_form",
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
    // {
    //     render: {
    //         componentType: "autocomplete",
    //     },
    //     name: "INST_NO",
    //     label: "Chq. Sign Autho",
    //     placeholder: "",
    //     // defaultValue: "N",
    //     type: "text",
    //     GridProps: {xs:12, sm:4, md: 3, lg: 2.4, xl:2},
    //     options: [
    //         {label: "", value: ""}
    //     ],
    // },

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
      name: "AGENT_CD",
      label: "Agent",
      options: (dependentValue, formState, _, authState) =>
        API.getAgentTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "agentFDOp",
      placeholder: "SelectAgent",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "fddtldivider_ignoreField",
      label: "FDDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PACKET_NO",
      label: "FDNo",
      type: "text",
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(formState?.fdParaData?.FD_NO_DISABLED === "Y");
      },
      __NEW__: {
        defaultValue: (formState) => {
          return formState?.FD_NUMBER;
        },
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INSTALLMENT_TYPE",
      label: "PeriodTenor",
      dependentFields: [
        "INST_NO",
        "APPLIED_AMT",
        "SANCTIONED_AMT",
        "CATEG_CD",
        "INT_RATE",
        "MATURITY_DT",
      ],
      options: (dependentValue, formState, _, authState) => {
        return API?.getPeriodDDWData({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: formState?.BRANCH_CD
            ? formState?.BRANCH_CD
            : authState?.user?.branchCode ?? "",
          ACCT_TYPE: formState?.ACCT_TYPE ?? "",
          SCREEN_REF: formState?.docCD ?? "",
        });
      },
      _optionsKey: "getPeriodDDWData",
      defaultValueKey: "tenorDefaultVal",
      runPostValidationHookAlways: true,
      skipInitialDefaultValueKeyValidation: true,
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getFDIntRate(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          return {
            ...postData,
          };
        }
        return {};
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PeriodTenorIsRequired"] }],
      },
      placeholder: "SelectPeriodTenure",
      type: "text",
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "INST_NO",
      label: "Tenor",
      className: "textInputFromRight",
      placeholder: "EnterTenor",
      autoComplete: "off",
      dependentFields: [
        "INSTALLMENT_TYPE",
        "INST_NO",
        "APPLIED_AMT",
        "SANCTIONED_AMT",
        "CATEG_CD",
        "INT_RATE",
        "MATURITY_DT",
      ],
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getFDIntRate(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          return {
            ...postData,
          };
        }
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
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INST_DUE_DT",
      label: "MaturityDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      fullWidth: true,
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "IntRate",
      required: true,
      type: "text",
      autoComplete: "off",
      dependentFields: [
        "INT_TYPE",
        "INT_RATE",
        "APPLIED_AMT",
        "SANCTIONED_AMT",
        "CATEG_CD",
        "INSTALLMENT_TYPE",
        "INST_NO",
        "INST_DUE_DT",
        "DUE_AMT",
        "INST_RS",
      ],
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getFDMaturityAmt(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          return {
            ...postData,
          };
        }
        return {};
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestRateIsRequired"] }],
      },
      FormatProps: {
        allowNegative: false,
        placeholder: "0.00",
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
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INT_TYPE",
      label: "InterestTerm",
      options: API.getFDIntTermDDWData,
      _optionsKey: "getFDIntTermDDWData",
      defaultValue: (formState) => {
        return formState?.INT_TYPE;
      },
      required: true,
      dependentFields: [
        "INT_RATE",
        "APPLIED_AMT",
        "SANCTIONED_AMT",
        "CATEG_CD",
        "INSTALLMENT_TYPE",
        "INST_NO",
        "INST_DUE_DT",
        "DUE_AMT",
        "INST_RS",
      ],
      isReadOnly: (fieldValue, dependentFields, formState) =>
        API.isReadOnlyOn320Flag(formState?.DISABLE_INT_TYPE),
      postValidationSetCrossFieldValues: async (
        currField,
        formState,
        auth,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        let postData = await API.getFDMaturityAmt(
          currField,
          dependentFields,
          auth,
          formState
        );
        if (postData) {
          return {
            ...postData,
          };
        }
        return {};
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestTermRequired"] }],
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INST_RS",
      label: "MonthInt",
      dependentFields: ["INT_TYPE"],
      isReadOnly: true,
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(dependentFieldsValues?.INT_TYPE?.value === "M");
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 1.5 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "MONTHLY_INT_EXCLUDE",
      dependentFields: ["INT_TYPE"],
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(dependentFieldsValues?.INT_TYPE?.value === "M");
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "REF_COMP_CD",
      __NEW__: {
        defaultValue: (formState, authState) => {
          return authState?.companyID;
        },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "APPLIED_AMT",
      label: "Cash",
      type: "text",
      maxLength: 14,
      FormatProps: {
        isAllowed: (values) => {
          return !Boolean(
            (values?.value?.startsWith("0") && values?.value?.length > 4) ||
              values?.value?.length > 14
          );
        },
      },
      dependentFields: [
        "SANCTIONED_AMT",
        "DUE_AMT",
        "CATEG_CD",
        "INST_DUE_DT",
        "INSTALLMENT_TYPE",
        "INST_NO",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        // if (currentField?.value) {
        let postData = await API?.validateFDDepAmt(
          currentField,
          dependentFieldsValues,
          authState,
          formState
        );
        if (postData) {
          return postData;
        } else {
          return {
            INT_RATE: {
              value: dependentFieldsValues?.INT_RATE?.value ?? "",
            },
          };
        }
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SANCTIONED_AMT",
      label: "Transfer",
      type: "text",
      maxLength: 14,
      FormatProps: {
        isAllowed: (values) => {
          return !Boolean(
            (values?.value?.startsWith("0") && values?.value?.length > 4) ||
              values?.value?.length > 14
          );
        },
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      dependentFields: [
        "APPLIED_AMT",
        "DUE_AMT",
        "CATEG_CD",
        "INST_DUE_DT",
        "INSTALLMENT_TYPE",
        "INST_NO",
        "INT_RATE",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        // if (currentField?.value) {
        let postData = await API?.validateFDDepAmt(
          currentField,
          dependentFieldsValues,
          authState,
          formState
        );
        if (postData) {
          return postData;
        } else {
          return {
            INT_RATE: {
              value: dependentFieldsValues?.INT_RATE?.value ?? "",
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL",
      label: "Total",
      type: "text",
      FormatProps: {
        allowNegative: true,
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["TotalIsRequired"] }],
      },
      isReadOnly: true,
      dependentFields: ["SANCTIONED_AMT", "APPLIED_AMT"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        if (
          dependentFields?.SANCTIONED_AMT?.value?.trim() ||
          dependentFields?.APPLIED_AMT?.value?.trim()
        ) {
          return (
            Number(dependentFields?.SANCTIONED_AMT?.value) +
            Number(dependentFields?.APPLIED_AMT?.value)
          );
        } else return "";
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "DUE_AMT",
      label: "Maturity",
      type: "text",
      FormatProps: {
        allowNegative: true,
      },
      required: true,
      isReadOnly(_, dependentFieldsValues, formState) {
        return Boolean(formState?.fdParaData?.MATURITY_AMT_DISABLED === "Y");
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["MaturityIsRequired"] }],
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "REF_BRANCH_CD",
        label: "CreditAcctNo",
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
              REF_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            REF_ACCT_TYPE: { value: "" },
            REF_ACCT_CD: { value: "", ignoreUpdate: false },
            REF_ACCT_NM: { value: "" },
          };
        },
        shouldExclude: (fieldData, dependentFieldsValues, formState) =>
          API.excludeFDDetailsOnFlag({ formState }),
        GridProps: { xs: 12, sm: 4, md: 2.3, lg: 1.4, xl: 1.5 },
      },
      accountTypeMetadata: {
        name: "REF_ACCT_TYPE",
        label: "",
        required: false,
        validationRun: "onChange",
        schemaValidation: {},
        dependentFields: ["REF_BRANCH_CD", "MATURE_INST"],
        options: (dependentValue, formState, _, authState) => {
          try {
            return GeneralAPI?.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "MST/002",
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
            !dependentFieldValues?.REF_BRANCH_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                REF_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                REF_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            REF_ACCT_CD: { value: "", ignoreUpdate: false },
            REF_ACCT_NM: { value: "" },
          };
        },
        shouldExclude: (fieldData, dependentFieldsValues, formState) =>
          API.excludeFDDetailsOnFlag({ formState }),
        GridProps: { xs: 12, sm: 3, md: 2.3, lg: 1.4, xl: 1.5 },
      },
      accountCodeMetadata: {
        name: "REF_ACCT_CD",
        label: "",
        required: false,
        schemaValidation: {},
        autoComplete: "off",
        dependentFields: ["REF_BRANCH_CD", "REF_ACCT_TYPE", "MATURE_INST"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldsValues?.REF_ACCT_TYPE?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                REF_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                REF_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.REF_BRANCH_CD?.value &&
            dependentFieldsValues?.REF_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.REF_BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.REF_ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction?.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.REF_ACCT_TYPE?.optionData?.[0] ?? {}
              ),
              SCREEN_REF: "FD_CR_ACT",
            };
            let postData = await API.validateAccountAndGetDetail(reqParameters);

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
              REF_ACCT_CD: returnVal
                ? {
                    value: utilFunction?.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.REF_ACCT_TYPE?.optionData?.[0] ||
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
              REF_ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
              },
              WIDTH_BAL: {
                value: returnVal?.WIDTH_BAL ?? "",
              },
            };
          } else if (!currentField?.value) {
            return {
              REF_ACCT_NM: { value: "" },
              WIDTH_BAL: { value: "" },
            };
          }
          return {};
        },
        shouldExclude: (fieldData, dependentFieldsValues, formState) =>
          API.excludeFDDetailsOnFlag({ formState }),
        GridProps: { xs: 12, sm: 3, md: 1.8, lg: 2, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REF_ACCT_NM",
      label: "CreditAcctName",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 6, md: 3.2, lg: 4, xl: 3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "WIDTH_BAL",
      label: "Balance",
      isReadOnly: true,
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 7, md: 2.8, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "JOINT_DTLS",
      label: "Joint",
      dependentFields: [
        "REF_BRANCH_CD",
        "REF_ACCT_TYPE",
        "REF_ACCT_CD",
        "REF_ACCT_NM",
      ],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return !Boolean(
          dependentFieldsValues?.REF_BRANCH_CD?.value &&
            dependentFieldsValues?.REF_ACCT_TYPE?.value &&
            dependentFieldsValues?.REF_ACCT_CD?.value
        );
      },
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      ignoreInSubmit: true,
      GridProps: {
        xs: 12,
        sm: 5,
        md: 2.3,
        lg: 1.5,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ACTION_TAKEN_CD",
      label: "MatureInstruction",
      defaultValueKey: "matureInstDefaultVal",
      options: (dependentValue, formState, _, authState) => {
        return API?.getMatureInstDDWData({
          COMP_CD: authState?.companyID ?? "",
          BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
          ACCT_TYPE: formState?.ACCT_TYPE ?? "",
        });
      },
      _optionsKey: "getMatureInstDDW",
      placeholder: "SelectMatureInstruction",
      type: "text",
      shouldExclude: (fieldData, dependentFieldsValues, formState) =>
        API.excludeFDDetailsOnFlag({ formState }),
      GridProps: { xs: 12, sm: 9, md: 4.6, lg: 3.2, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "INT_SCHEDULE",
      label: "Int. Schedule",
      dependentFields: [
        "INST_DUE_DT",
        "INT_RATE",
        "TRAN_DT",
        "INST_NO",
        "INSTALLMENT_TYPE",
        "SANCTIONED_AMT",
        "APPLIED_AMT",
        "INT_TYPE",
      ],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return !Boolean(
          dependentFieldsValues?.INST_DUE_DT?.value &&
            Number(dependentFieldsValues?.INT_RATE?.value) > 0 &&
            formState?.TRAN_DT &&
            dependentFieldsValues?.INST_NO?.value &&
            dependentFieldsValues?.INSTALLMENT_TYPE?.value &&
            dependentFieldsValues?.INT_TYPE?.value &&
            (dependentFieldsValues?.SANCTIONED_AMT?.value ||
              dependentFieldsValues?.APPLIED_AMT?.value)
        );
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.formMode === "view");
      },
      ignoreInSubmit: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2.3,
        lg: 1.5,
        xl: 1,
      },
    },
  ],
};
