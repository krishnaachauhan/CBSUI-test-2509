import * as API from "../../../../api";
import { getProMiscData } from "pages_audit/pages/configuration/dynamicGridConfig/api";
import { utilFunction } from "@acuteinfo/common-base";
import { validateShareMemAcct } from "pages_audit/pages/operations/acct-mst/api";
import i18n from "components/multiLanguage/languagesConfiguration";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
export const legal_reference_detail_meta_data = {
  form: {
    name: "reference_details_form",
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
      numberFormat: {
        fullWidth: true,
      },
      autocomplete: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "select",
      },
      name: "REFERENCE_TYPE",
      label: "Type",
      placeholder: "SelectType",
      options: () => getProMiscData("CKYC_REF_TYPE"),
      _optionsKey: "getProMiscData",
      type: "text",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value?.trim() === "B") {
          return {
            REFERENCE_CUST_ID: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            MEM_COMP_CD: {
              value: authState?.companyID ?? "",
              ignoreUpdate: true,
              isFieldFocused: false,
            },
            MEM_BRANCH_CD: {
              value: authState?.user?.branchCode ?? "",
              ignoreUpdate: false,
              isFieldFocused: true,
            },
            MEM_ACCT_TYPE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            MEM_ACCT_CD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            MEM_ACCT_NM: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            REF_RELATION: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            OTHER_REFERENCE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        } else {
          return {
            MEM_COMP_CD: {
              value: "",
              ignoreUpdate: true,
              isFieldFocused: false,
            },
            MEM_BRANCH_CD: {
              value: "",
              ignoreUpdate: true,
              isFieldFocused: false,
            },
            MEM_ACCT_TYPE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            MEM_ACCT_CD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            MEM_ACCT_NM: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            REF_RELATION: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            OTHER_REFERENCE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            REFERENCE_CUST_ID: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: currentField?.value?.trim() === "C",
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 3, md: 2.5, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "REFERENCE_CUST_ID",
      label: "CustID",
      placeholder: "RefCustID",
      dependentFields: ["REFERENCE_TYPE"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return !Boolean(dependentFields?.REFERENCE_TYPE?.value === "C");
      },
      maxLength: 12,
      FormatProps: {
        allowNegative: false,
        decimalScale: 0,
        isAllowed: (values) => {
          return !Boolean(
            values.value.startsWith("0") || values?.value?.length > 12
          );
        },
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (
          Boolean(field?.value) &&
          dependentFieldsValues?.REFERENCE_TYPE?.value === "C"
        ) {
          formState?.handleButtonDisable(true);
          const data = await API.validateRefCustID({
            COMP_CD: authState?.companyID ?? "",
            CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
            REF_CUST_ID: field?.value ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
          });
          formState?.handleButtonDisable(false);
          let returnVal;
          if (data?.[0]?.MSG?.length > 0) {
            const response = await handleDisplayMessages(
              data?.[0]?.MSG,
              formState?.MessageBox
            );

            if (Object.keys(response).length > 0) {
              returnVal = data?.[0];
            } else {
              returnVal = "";
            }
          }
          return {
            MEM_ACCT_NM: {
              value: returnVal?.MEM_ACCT_NM ?? "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },

            REFERENCE_CUST_ID:
              returnVal !== ""
                ? {
                    value: field?.value ?? "",
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
          };
        }
      },

      GridProps: { xs: 12, sm: 3, md: 2.5, lg: 1.5, xl: 1.5 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "MEM_COMP_CD",
      label: "MemberACNo",
      placeholder: "EnterBankCode",
      autoComplete: "off",
      maxLength: 4,
      dependentFields: ["REFERENCE_TYPE"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return !Boolean(dependentFields?.REFERENCE_TYPE?.value === "B");
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFieldValues?.REFERENCE_TYPE?.value === "B") {
          if (currentField?.value) {
            if (currentField?.value !== authState?.companyID?.trim()) {
              const buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "Company not matched.",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                MEM_COMP_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                MEM_BRANCH_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
                MEM_ACCT_TYPE: { value: "", ignoreUpdate: false },
                MEM_ACCT_CD: { value: "", ignoreUpdate: false },
                MEM_ACCT_NM: { value: "", ignoreUpdate: false },
                OTHER_REFERENCE: { value: "", ignoreUpdate: false },
                REFERENCE_CUST_ID: { value: "", ignoreUpdate: false },
              };
            }
          } else {
            return {
              MEM_BRANCH_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
              MEM_ACCT_TYPE: { value: "", ignoreUpdate: false },
              MEM_ACCT_CD: { value: "", ignoreUpdate: false },
              MEM_ACCT_NM: { value: "", ignoreUpdate: false },
              OTHER_REFERENCE: { value: "", ignoreUpdate: false },
              REFERENCE_CUST_ID: { value: "", ignoreUpdate: false },
            };
          }
        }
      },
      GridProps: { xs: 12, sm: 3, md: 1, lg: 1, xl: 1 },
    },

    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "MEM_BRANCH_CD",
        defaultValue: "",
        label: "",
        runPostValidationHookAlways: true,
        dependentFields: ["REFERENCE_TYPE"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (dependentFieldValues?.REFERENCE_TYPE?.value === "B") {
            formState?.handleButtonDisable(true);
            const isHOBranch = await validateHOBranch(
              currentField,
              formState?.MessageBox,
              authState
            );
            formState?.handleButtonDisable(false);
            if (isHOBranch) {
              return {
                MEM_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              MEM_ACCT_TYPE: { value: "", ignoreUpdate: false },
              MEM_ACCT_CD: { value: "", ignoreUpdate: false },
              MEM_ACCT_NM: { value: "", ignoreUpdate: false },
              OTHER_REFERENCE: { value: "", ignoreUpdate: false },
              REFERENCE_CUST_ID: { value: "", ignoreUpdate: false },
            };
          }
        },
        schemaValidation: {},
        required: false,
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return !Boolean(dependentFields?.REFERENCE_TYPE?.value === "B");
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 2.5 },
      },
      accountTypeMetadata: {
        name: "MEM_ACCT_TYPE",
        dependentFields: ["MEM_BRANCH_CD", "REFERENCE_TYPE"],
        runPostValidationHookAlways: true,
        label: "",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (dependentFieldValues?.REFERENCE_TYPE?.value === "B") {
            if (
              currentField?.value &&
              !dependentFieldValues?.MEM_BRANCH_CD?.value
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterBranchCode",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  MEM_ACCT_TYPE: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  MEM_BRANCH_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                };
              }
            }
            return {
              MEM_ACCT_CD: { value: "", ignoreUpdate: false },
              MEM_ACCT_NM: { value: "", ignoreUpdate: false },
              OTHER_REFERENCE: { value: "", ignoreUpdate: false },
              REFERENCE_CUST_ID: { value: "", ignoreUpdate: false },
            };
          }
        },
        schemaValidation: {},
        required: false,
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return !Boolean(dependentFields?.REFERENCE_TYPE?.value === "B");
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 2.5 },
      },
      accountCodeMetadata: {
        name: "MEM_ACCT_CD",
        dependentFields: [
          "MEM_ACCT_TYPE",
          "MEM_BRANCH_CD",
          "REFERENCE_TYPE",
          "MEM_COMP_CD",
        ],
        runPostValidationHookAlways: true,
        label: "",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (dependentFieldValues?.REFERENCE_TYPE?.value === "B") {
            if (
              currentField?.value &&
              dependentFieldValues?.MEM_ACCT_TYPE?.value?.length === 0
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Alert",
                message: "EnterAccountType",
                buttonNames: ["Ok"],
                icon: "WARNING",
              });

              if (buttonName === "Ok") {
                return {
                  MEM_ACCT_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  MEM_ACCT_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                  OTHER_REFERENCE: { value: "", ignoreUpdate: false },
                  REFERENCE_CUST_ID: { value: "", ignoreUpdate: false },
                };
              }
            } else if (
              dependentFieldValues?.MEM_BRANCH_CD?.value &&
              dependentFieldValues?.MEM_ACCT_TYPE?.value &&
              currentField?.value
            ) {
              const reqParameters = {
                COMP_CD: dependentFieldValues?.MEM_COMP_CD?.value ?? "",
                BRANCH_CD: dependentFieldValues?.MEM_BRANCH_CD?.value ?? "",
                ACCT_TYPE: dependentFieldValues?.MEM_ACCT_TYPE?.value ?? "",
                ACCT_CD: utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.MEM_ACCT_TYPE?.optionData?.[0] ?? {}
                ),
                SCREEN_REF: formState?.docCD,
                CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
              };
              formState?.handleButtonDisable(true);
              const postData = await validateShareMemAcct(reqParameters);
              formState?.handleButtonDisable(false);
              let returnVal;
              if (postData?.MSG?.length > 0) {
                const response = await handleDisplayMessages(
                  postData?.MSG,
                  formState?.MessageBox
                );

                if (Object.keys(response).length > 0) {
                  returnVal = postData;
                } else {
                  returnVal = "";
                }
              }
              return {
                MEM_ACCT_CD:
                  returnVal !== ""
                    ? {
                        value: utilFunction.getPadAccountNumber(
                          currentField?.value,
                          dependentFieldValues?.MEM_ACCT_TYPE
                            ?.optionData?.[0] ?? {}
                        ),
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                MEM_ACCT_NM: {
                  value: returnVal?.ACCT_NM ?? "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
                REFERENCE_CUST_ID: {
                  value: returnVal?.REFERENCE_CUST_ID ?? "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
                OTHER_REFERENCE: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
              };
            } else if (!currentField?.value) {
              return {
                MEM_ACCT_NM: { value: "", ignoreUpdate: false },
                REFERENCE_CUST_ID: { value: "", ignoreUpdate: false },
                OTHER_REFERENCE: { value: "", ignoreUpdate: false },
              };
            }
          }
        },
        required: false,
        schemaValidation: {},
        fullWidth: true,
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return !Boolean(dependentFields?.REFERENCE_TYPE?.value === "B");
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 2.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MEM_ACCT_NM",
      label: "",
      placeholder: "EnterAccountName",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 5, lg: 3.3, xl: 3.3 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "REF_RELATION",
      label: "Relation",
      placeholder: "SelectRelation",
      options: () => API.getPMISCData("REF_RELATION"),
      _optionsKey: "RefRelation",
      type: "text",
      GridProps: { xs: 12, sm: 4.5, md: 4, lg: 3, xl: 3 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "OTHER_REFERENCE",
      label: "OtherRef",
      placeholder: "EnterOtherRef",
      autoComplete: "off",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      dependentFields: ["REFERENCE_TYPE"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return !Boolean(dependentFields?.REFERENCE_TYPE?.value === "O");
      },
      GridProps: { xs: 12, sm: 6, md: 10.8, lg: 4.5, xl: 4.5 },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "SIGN_VIEW",
      label: "SignView",
      endsIcon: "",
      dependentFields: [
        "MEM_ACCT_TYPE",
        "MEM_BRANCH_CD",
        "MEM_ACCT_CD",
        "MEM_COMP_CD",
        "REFERENCE_CUST_ID",
        "REFERENCE_TYPE",
      ],
      type: "text",
      rotateIcon: "scale(2)",
      placeholder: "",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return formState?.state?.formmodectx === "view";
      },
      ignoreInSubmit: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 1.5,
        md: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },
  ],
};
