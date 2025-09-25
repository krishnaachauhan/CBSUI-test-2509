import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import * as API from "../api";
import { utilFunction } from "@acuteinfo/common-base";
import { isEmpty } from "lodash";
import i18n from "components/multiLanguage/languagesConfiguration";
import { GeneralAPI } from "registry/fns/functions";

export const locker_tab_metadata = {
  form: {
    name: "locker_tab_form",
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
      label: "LockerDetail",
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
      label: "LockerType",
      options: () => API.getAdvDirectorNameTypeOP({ A_ROLE_IND: "D" }),
      _optionsKey: "directorNmLockerOp",
      placeholder: "",
      type: "text",
      required: true,
      isReadOnly: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["LockerTypeisrequired"] }],
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
      _optionsKey: "categLockerOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Categoryisrequired"] }],
      },
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "lf_no",
      label: "lockerNumber",
      type: "text",
      maxLength: 8,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "OP_DATE",
      label: "OpDate",
      placeholder: "DD/MM/YYYY",
      isReadOnly: true,
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
        componentType: "textField",
      },
      name: "LOCKER_KEY_NO",
      label: "LocKeyNo",
      isReadOnly: true,
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
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PATH_SIGN",
      label: "KararNo",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "INT_SKIP_FLAG",
      label: "keyEmboss",
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      defaultValue: "Y",
      _optionsKey: "keyEmbossLockerOp",
      placeholder: "",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["keyEmbossIsRequired"] }],
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TYPE_CD",
      label: "Rent",
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      placeholder: "",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["RentIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LAST_INST_DT",
      label: "SurrDate",
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
        componentType: "rateOfInt",
      },
      name: "INT_RATE",
      label: "InterestRate",
      placeholder: "",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InterestRateIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
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
      _optionsKey: "riskCategLockerOp",
      placeholder: "",
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
      name: "savingsdivider_ignoreField",
      label: "FDReference",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "REF_COMP_CD",
      label: "FdType",
      placeholder: "COMPCD",
      maxLength: 4,
      GridProps: { xs: 12, sm: 2, md: 1, lg: 1, xl: 1 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "REF_BRANCH_CD",
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
            ACCT_NM: { value: "" },
            REF_ACCT_TYPE: { value: "" },
            REF_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 2.5, xl: 2.5 },
      },
      accountTypeMetadata: {
        name: "REF_ACCT_TYPE",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        dependentFields: ["REF_BRANCH_CD"],
        isFieldFocused: true,
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            USER_NAME: authState?.user?.id ?? "",
            DOC_CD: "LOC_FD",
          });
        },
        _optionsKey: "getLOckerFdRefAcctType",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};

          try {
            if (
              currentField?.value &&
              !dependentFieldsValues?.REF_BRANCH_CD?.value
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
            } else if (
              dependentFieldsValues?.REF_BRANCH_CD?.value &&
              currentField?.value
            ) {
              const reqParameters = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: dependentFieldsValues?.REF_BRANCH_CD?.value ?? "",
                ACCT_TYPE: currentField?.value ?? "",
                SCREEN_REF: "LOC_FD",
              };

              const postData = await API.getFDParaDetail(reqParameters);
              if (postData?.status === "999") {
                let btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: postData?.messageDetails?.length
                    ? postData?.messageDetails
                    : "Somethingwenttowrong",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    REF_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    REF_ACCT_CD: { value: "", ignoreUpdate: false },
                    ACCT_NM: { value: "" },
                  };
                }
              } else if (postData) {
                return {
                  REF_ACCT_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
            return {
              REF_ACCT_CD: { value: "", ignoreUpdate: false },
              ACCT_NM: { value: "" },
            };
          } catch (error: any) {
            const btn = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (btn === "Ok") {
              return {
                REF_ACCT_TYPE: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                REF_ACCT_CD: { value: "", ignoreUpdate: false },
                ACCT_NM: { value: "" },
              };
            }
          }
          return {};
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 2.5, xl: 2.5 },
      },
      accountCodeMetadata: {
        name: "REF_ACCT_CD",
        autoComplete: "off",
        dependentFields: ["REF_ACCT_TYPE", "REF_BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField.value &&
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
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldsValues?.REF_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldsValues?.REF_ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.REF_ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: "LOC_FD",
            };
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const messageResponse: any = await handleDisplayMessages(
              postData?.MSG,
              formState.MessageBox
            );

            if (!isEmpty(messageResponse)) {
              return {
                ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                  ),
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },

                ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                ACCT_NM: { value: "" },
                REF_ACCT_CD: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
            };
          }
          return {};
        },

        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 2.5, xl: 2.5 },
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "DUE_AMT",
      label: "FDNo",
      placeholder: "FDNo",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (field?.value) {
          const postData: Record<string, any> = await API.validateFdNo({
            FD_NO: field?.value ?? "",
            COMP_CD: authState?.companyID ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage,
            BRANCH_CD: dependentFieldsValues?.REF_BRANCH_CD?.value ?? "",
            ACCT_TYPE: dependentFieldsValues?.REF_ACCT_TYPE?.value ?? "",
            ACCT_CD: dependentFieldsValues?.REF_ACCT_CD?.value ?? "",
          });
          const messageResponse: any = await handleDisplayMessages(
            postData,
            formState.MessageBox
          );
          if (isEmpty(messageResponse)) {
            return {
              DUE_AMT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
            };
          }
        }
      },
      // required: true,
      // schemaValidation: {
      //   type: "string",
      //   rules: [{ name: "required", params: ["FDNoIsRequired"] }],
      // },
      GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2.5, xl: 2.5 },
    },
  ],
};
