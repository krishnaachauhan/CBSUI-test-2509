import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import {
  getAppTypeDropdownData,
  getDivModeOfPayData,
  getModeOfPayData,
  getPurposeApi,
  validateShareMemAcct,
} from "../api";
import { GeneralAPI } from "registry/fns/functions";
import { utilFunction } from "@acuteinfo/common-base";
import { getAcctTypeData, getIfscBenDetail } from "../../beneficiaryEntry/api";
import { handleBlurAppOrMemAcct, handleBlurBankCode } from "./MetaDataHelper";
import { isEmpty } from "lodash";
import { t } from "i18next";

export const AppDetailMetaData = {
  form: {
    name: "AppDetailMetaData",
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
        componentType: "autocomplete",
      },
      name: "APP_TYPE",
      label: "ApplicationType",
      placeholder: "EnterApplicationType",
      options: () => getAppTypeDropdownData("SHARE_APP_TYPE"),
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      runPostValidationHookAlways: true,
      dependentFields: ["MEM_TYPE"],
      postValidationSetCrossFieldValues: handleBlurAppOrMemAcct,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ApplicationTypeIsRequired"] }],
      },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "MEM_BRANCH_CD",
        label: "ExistingMemberAcBranchA",
        required: false,
        placeholder: "BranchCode",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["BranchCodeIsRequired"] }],
        },
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
              MEM_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            MEM_ACCT_NM: { value: "" },
            MEM_TYPE: { value: "" },
            MEM_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "MEM_TYPE",
        label: "ExistingMemberAcTypeA",
        placeholder: "AccountType",
        required: false,
        disableCaching: true,
        dependentFields: ["MEM_BRANCH_CD", "APP_TYPE"],
        options: (dependentValue, formState, _, authState) => {
          if (dependentValue?.MEM_BRANCH_CD?.value) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentValue?.MEM_BRANCH_CD?.value ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "SHARE",
            });
          }
          return [];
        },
        _optionsKey: "existingShareAccountType",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AccountTypeIsRequired"] }],
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            !dependentFieldValues?.MEM_BRANCH_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                MEM_TYPE: {
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

          const data = await handleBlurAppOrMemAcct(
            currentField,
            formState,
            authState,
            dependentFieldValues
          );

          return {
            MEM_CD: { value: "", ignoreUpdate: false },
            MEM_ACCT_NM: { value: "" },
            NEW_ACCT_TYPE: { value: currentField?.value ?? "" },
            ...data,
          };
        },
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "MEM_CD",
        dependentFields: [
          "MEM_TYPE",
          "MEM_CD",
          "MEM_BRANCH_CD",
          "MEM_CD_VISIBLE",
        ],
        label: "ExistingMemberAcCodeA",
        placeholder: "AccountNumber",
        required: false,
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AccountCodeIsRequired"] }],
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.MEM_CD_VISIBLE?.value !== "Y";
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.MEM_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                MEM_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                MEM_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.MEM_BRANCH_CD?.value &&
            dependentFieldValues?.MEM_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.MEM_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.MEM_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.MEM_TYPE?.optionData?.[0]
                ) ?? "",
              //TODO: Check if this is correct
              CUSTOMER_ID: formState?.CUSTOMER_ID,
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };

            const postData = await validateShareMemAcct(reqParameters);
            const isValid = await handleDisplayMessages(
              postData?.MSG,
              formState?.MessageBox
            );
            if (!isEmpty(isValid)) {
              return {
                MEM_CD: {
                  value:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.MEM_TYPE?.optionData?.[0]
                    ) ?? {},
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },

                MEM_ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                MEM_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                MEM_ACCT_NM: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              MEM_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      dependentFields: ["MEM_CD_VISIBLE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.MEM_CD_VISIBLE?.value !== "Y";
      },

      name: "MEM_ACCT_NM",
      label: "ExistingMemberAcName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "ShareDetails_ignoreField",
      label: "ShareDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "SHARE_BRANCH_CD",
        label: "ShareAppAcBranchA",
        required: false,
        placeholder: "BranchCode",
        dependantFields: ["SHARE_ACCT_DISABLE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.SHARE_ACCT_DISABLE?.value === "Y";
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["BranchCodeIsRequired"] }],
        },
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
              SHARE_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            SHARE_ACCT_NM: { value: "" },
            SHARE_TYPE: { value: "" },
            SHARE_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "SHARE_TYPE",
        label: "ShareAppAcTypeA",
        placeholder: "AccountType",
        required: false,
        disableCaching: true,
        dependentFields: [
          "SHARE_BRANCH_CD",
          "SHARE_ACCT_DISABLE",
          "HIDDEN_SHARE_TYPE",
        ],
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AccountTypeIsRequired"] }],
        },
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.SHARE_ACCT_DISABLE?.value === "Y";
        },
        options: (dependentValue, formState, _, authState) => {
          if (dependentValue?.SHARE_BRANCH_CD?.value) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentValue?.SHARE_BRANCH_CD?.value ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "GLPL",
            });
          }
          return [];
        },
        _optionsKey: "get_Account_Type",

        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            !dependentFieldValues?.SHARE_BRANCH_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                SHARE_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                SHARE_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            dependentFieldValues?.HIDDEN_SHARE_TYPE?.value?.trim() !==
            currentField?.value?.trim()
          ) {
            return {
              SHARE_ACCT_CD: { value: "", ignoreUpdate: true },
              SHARE_ACCT_NM: { value: "" },
            };
          }

          if (currentField?.value) {
            return {
              HIDDEN_SHARE_TYPE: {
                value: currentField?.value,
              },
            };
          }
        },
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "SHARE_ACCT_CD",
        dependentFields: [
          "SHARE_TYPE",
          "SHARE_ACCT_CD",
          "SHARE_ACCT_DISABLE",
          "SHARE_BRANCH_CD",
        ],
        label: "ShareAppAcNoA",
        placeholder: "AccountNumber",
        required: false,
        runPostValidationHookAlways: true,
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.SHARE_ACCT_DISABLE?.value === "Y";
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AccountCodeIsRequired"] }],
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.SHARE_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                SHARE_TYPE: {
                  value: "",
                  isFieldFocused: true,
                },
                SHARE_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.SHARE_BRANCH_CD?.value &&
            dependentFieldValues?.SHARE_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.SHARE_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.SHARE_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.SHARE_TYPE?.optionData?.[0]
                ) ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };

            let postData = await GeneralAPI.getAccNoValidation(reqParameters);
            const isReturn = await handleDisplayMessages(
              postData?.MSG,
              formState?.MessageBox
            );

            if (!isEmpty(isReturn)) {
              return {
                SHARE_ACCT_CD: {
                  value:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.SHARE_TYPE?.optionData?.[0]
                    ) ?? {},
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },

                SHARE_ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                SHARE_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                SHARE_ACCT_NM: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              SHARE_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SHARE_ACCT_NM",
      label: "ShareAppAcName",
      isReadOnly: true,
      ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "MODE_PAYMENT",
      label: "ModeOfPaymentA",
      placeholder: "EnterModePayment",
      options: () => getModeOfPayData({}),
      _optionsKey: "ModePayment",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      // runPostValidationHookAlways: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ModeOfPaymentIsRequired"] }],
      },

      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value) {
          formState?.setDataOnFieldChange("MODE_OF_PAY", {
            value: currentField?.value,
          });
          return {
            MODE_PAYMENT: {
              value: currentField?.value ?? "",
              isFieldFocused: true,
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: { componentType: "numberFormat" },
      name: "APP_QUANTITY",
      label: "APPForNoOfShareA",
      placeholder: "APPForNoOfShare",
      dependentFields: ["APP_QTY_VISIBLE"],
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          let regex = /^[0-9]+$/;
          if (values?.value?.length > 12) {
            return false;
          } else if (values.value === "") {
            return true;
          } else if (!regex.test(values.value)) {
            return false;
          } else if (values.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.APP_QTY_VISIBLE?.value !== "Y";
      },

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AppForNoOfShareIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          const APP_AMT =
            Number(formState?.parameter?.[0]?.SHARE_AMT ?? 0) *
            Number(currentField?.value ?? 0);
          return {
            APP_AMT: {
              value: APP_AMT,
            },
          };
        }
        return {
          APP_AMT: {
            value: 0,
          },
        };
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "APP_AMT",
      label: "Amount",
      placeholder: "EnterAmount",
      dependentFields: ["APP_AMT_VISIBLE"],
      autoComplete: "off",
      maxLength: 9,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      isReadOnly: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.APP_AMT_VISIBLE?.value !== "Y";
      },
    },
    {
      render: { componentType: "datePicker" },
      name: "MEETING_DT",
      label: "MeetingDate",
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "textField" },
      name: "MEETING_NO",
      label: "MeetingNo",
      placeholder: "MeetingNo",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PURPOSE",
      label: "PurposeA",
      placeholder: "EnterPurpose",
      //TODO:check this
      options: (dependentValue, formState, _, authState) => {
        return getPurposeApi({
          BASE_BRANCH_CD: authState?.user?.branchCode,
          BASE_COMP_CD: authState?.companyID,
        });
      },
      _optionsKey: "getPurposeApi",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PurposeIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      runPostValidationHookAlways: true,
    },
    {
      render: { componentType: "textField" },
      name: "NEW_BRANCH_CD",
      isReadOnly: true,
      placeholder: "BranchCode",
      label: "NewAcBranch",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "textField" },
      name: "NEW_ACCT_TYPE",
      placeholder: "AccountType",
      isReadOnly: true,
      label: "NewAcType",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "textField" },
      name: "ADVICE_NO",
      label: "AdviceNo",
      placeholder: "EnterAdviceNo",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "FeesDetails_ignoreField",
      label: "FeesDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "FEES_BRANCH_CD",
        label: "FeesAcBranch",
        required: false,
        placeholder: "BranchCode",
        dependentFields: ["FEES_ACCT_DISABLE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.FEES_ACCT_DISABLE?.value === "Y";
        },
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
              FEES_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            FEES_ACCT_NM: { value: "" },
            FEES_TYPE: { value: "" },
            FEES_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "FEES_TYPE",
        label: "FeesAcType",
        placeholder: "AccountType",
        required: false,
        disableCaching: true,
        dependentFields: ["FEES_BRANCH_CD", "FEES_ACCT_DISABLE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.FEES_ACCT_DISABLE?.value === "Y";
        },
        options: (dependentValue, formState, _, authState) => {
          if (dependentValue?.FEES_BRANCH_CD?.value) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentValue?.FEES_BRANCH_CD?.value ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "GLPL",
            });
          }
          return [];
        },
        _optionsKey: "get_Account_Type",

        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldValues?.FEES_BRANCH_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                FEES_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                FEES_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            FEES_ACCT_CD: { value: "", ignoreUpdate: false },
            FEES_ACCT_NM: { value: "" },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "FEES_ACCT_CD",
        label: "FeesAcCode",
        dependentFields: [
          "FEES_TYPE",
          "FEES_ACCT_CD",
          "FEES_ACCT_DISABLE",
          "FEES_BRANCH_CD",
        ],

        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.FEES_ACCT_DISABLE?.value === "Y";
        },
        placeholder: "AccountNumber",
        required: false,
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.FEES_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                FEES_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                FEES_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.FEES_BRANCH_CD?.value &&
            dependentFieldValues?.FEES_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.FEES_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.FEES_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.FEES_TYPE?.optionData?.[0]
                ) ?? "",

              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };

            let postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const isReturn = await handleDisplayMessages(
              postData?.MSG,
              formState?.MessageBox
            );
            if (!isEmpty(isReturn)) {
              return {
                FEES_ACCT_CD: {
                  value:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.FEES_TYPE?.optionData?.[0]
                    ) ?? {},
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },

                FEES_ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                FEES_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                FEES_ACCT_NM: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              FEES_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FEES_ACCT_NM",
      label: "FeesAcName",
      isReadOnly: true,
      ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FEES_AMT",
      label: "FeesAmount",
      dependentFields: ["FEES_AMOUNT_DISABLE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.FEES_AMOUNT_DISABLE?.value === "Y";
      },
      placeholder: "EnterFeesAmount",
      autoComplete: "off",
      maxLength: 9,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "datePicker" },
      name: "FEES_DT",
      label: "Date",
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRAD_INFO",
      label: "IssueBranchA",
      placeholder: "EnterIssueBranch",
      options: GeneralAPI.getBranchCodeList,
      _optionsKey: "getBranchCodeList",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      runPostValidationHookAlways: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["IssueBranchIsRequired"] }],
      },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "stationery_ignoreField",
      label: "StationeryOtherChargeDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "STNRY_BRANCH_CD",
        label: "StationeryAcBranch",
        required: false,
        dependentFields: ["STNRY_ACCT_DISABLE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.STNRY_ACCT_DISABLE?.value === "Y";
        },
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
              STNRY_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            STNRY_ACCT_NM: { value: "" },
            STNRY_ACCT_TYPE: { value: "" },
            STNRY_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "STNRY_ACCT_TYPE",
        label: "StationeryAcType",
        placeholder: "AccountType",
        required: false,
        disableCaching: true,
        dependentFields: ["STNRY_BRANCH_CD", "STNRY_ACCT_DISABLE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.STNRY_ACCT_DISABLE?.value === "Y";
        },
        options: (dependentValue, formState, _, authState) => {
          if (dependentValue?.STNRY_BRANCH_CD) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentValue?.STNRY_BRANCH_CD?.value ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "GLPL",
            });
          }
          return [];
        },

        _optionsKey: "get_Account_Type",

        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            !dependentFieldValues?.STNRY_BRANCH_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                STNRY_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                STNRY_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            STNRY_ACCT_CD: { value: "", ignoreUpdate: false },
            STNRY_ACCT_NM: { value: "" },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "STNRY_ACCT_CD",
        dependentFields: [
          "STNRY_ACCT_TYPE",
          "STNRY_ACCT_DISABLE",
          "STNRY_BRANCH_CD",
        ],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          return dependentFieldsValues?.STNRY_ACCT_DISABLE?.value === "Y";
        },
        label: "StationeryAcCode",
        placeholder: "AccountNumber",
        required: false,
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.STNRY_ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                STNRY_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                STNRY_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.STNRY_BRANCH_CD?.value &&
            dependentFieldValues?.STNRY_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.STNRY_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.STNRY_ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.STNRY_ACCT_TYPE?.optionData?.[0]
                ) ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };
            let postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const isReturn = await handleDisplayMessages(
              postData?.MSG,
              formState?.MessageBox
            );
            if (!isEmpty(isReturn)) {
              return {
                STNRY_ACCT_CD: {
                  value:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.STNRY_ACCT_TYPE?.optionData?.[0]
                    ) ?? {},
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },

                STNRY_ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                STNRY_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                STNRY_ACCT_NM: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              STNRY_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STNRY_ACCT_NM",
      label: "StationeryAcName",
      isReadOnly: true,
      ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "STNRY_FEES_AMT",
      label: "StationeryCharge",
      placeholder: "EnterStationeryCharge",
      autoComplete: "off",
      maxLength: 9,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      dependentFields: [
        "STNRY_AMT_DISABLE",
        "STNRY_BRANCH_CD",
        "STNRY_ACCT_TYPE",
        "STNRY_ACCT_CD",
      ],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.STNRY_AMT_DISABLE?.value === "Y";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        const postData = await GeneralAPI.getCalGstAmountData({
          BRANCH_CD: dependentFieldValues?.STNRY_BRANCH_CD?.value ?? "",
          ACCT_TYPE: dependentFieldValues?.STNRY_ACCT_TYPE?.value ?? "",
          ACCT_CD: dependentFieldValues?.STNRY_ACCT_CD?.value ?? "",
          AMOUNT: currentField?.value ?? 0,
          MODULE: "",
          ENT_BRANCH_CD: authState?.user?.branchCode,
          ASON_DT: authState?.workingDate,
          COMP_CD: authState?.companyID,
        });
        if (postData?.[0]?.TAX_AMOUNT) {
          return {
            SERVICE_TAX: { value: postData?.[0]?.TAX_AMOUNT },
          };
        }
        return {
          SERVICE_TAX: { value: 0 },
        };
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX",
      label: "GST",
      maxLength: 9,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "divider",
      },
      name: "dividend_ignoreField",
      label: "DividendDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      dependentFields: ["DIV_DTL_VISIBLE"],
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.DIV_DTL_VISIBLE?.value !== "Y";
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DIV_MODE_OF_PAY",
      label: "ModeOfPayment",
      placeholder: "EnterModePayment",
      dependentFields: ["DIV_DTL_VISIBLE"],

      options: () => getDivModeOfPayData({ CATEGORY_CD: "DIV_MODE" }),
      _optionsKey: "DivModePayment",

      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      runPostValidationHookAlways: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.DIV_DTL_VISIBLE?.value !== "Y";
      },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "DIV_CR_BRANCH_CD",
        label: "DividendAcBranch",
        required: false,
        placeholder: "BranchCode",
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
              DIV_CR_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            DIV_CR_ACCT_NM: { value: "" },
            DIV_CR_ACCT_TYPE: { value: "" },
            DIV_CR_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },

        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !(
            dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
            dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NORMAL"
          );
        },
      },
      accountTypeMetadata: {
        name: "DIV_CR_ACCT_TYPE",
        label: "DividendAcType",
        placeholder: "AccountType",
        required: false,
        disableCaching: true,
        dependentFields: [
          "DIV_CR_BRANCH_CD",
          "DIV_DTL_VISIBLE",
          "DIV_MODE_OF_PAY",
        ],
        options: (dependentValue, formState, _, authState) => {
          if (dependentValue?.DIV_CR_BRANCH_CD?.value) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentValue?.DIV_CR_BRANCH_CD?.value ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DOC_CD: "DIVCR",
            });
          }
          return [];
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !(
            dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
            dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NORMAL"
          );
        },
        _optionsKey: "divAccountType",

        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldValues?.DIV_CR_BRANCH_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                DIV_CR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                DIV_CR_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            DIV_CR_ACCT_CD: { value: "", ignoreUpdate: false },
            DIV_CR_ACCT_NM: { value: "" },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "DIV_CR_ACCT_CD",
        dependentFields: [
          "DIV_CR_ACCT_TYPE",
          "DIV_CR_BRANCH_CD",
          "DIV_DTL_VISIBLE",
          "DIV_MODE_OF_PAY",
        ],
        label: "DividendAcCode",
        placeholder: "AccountNumber",
        required: false,
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.DIV_CR_ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                DIV_CR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                DIV_CR_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.DIV_CR_BRANCH_CD?.value &&
            dependentFieldValues?.DIV_CR_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.DIV_CR_BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.DIV_CR_ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.DIV_CR_ACCT_TYPE?.optionData?.[0]
                ) ?? "",

              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };

            let postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const isReturn = await handleDisplayMessages(
              postData?.MSG,
              formState?.MessageBox
            );
            if (!isEmpty(isReturn)) {
              return {
                DIV_CR_ACCT_CD: {
                  value:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.DIV_CR_ACCT_TYPE?.optionData?.[0]
                    ) ?? {},
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },

                DIV_CR_ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                DIV_CR_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                DIV_CR_ACCT_NM: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              DIV_CR_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !(
            dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
            dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NORMAL"
          );
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DIV_CR_ACCT_NM",
      label: "DividendAcName",
      isReadOnly: true,
      ignoreInSubmit: true,
      dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !(
          dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
          dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NORMAL"
        );
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_IFSC_CODE",
      label: "IFSCCode",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !(
          dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
          dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NEFT"
        );
      },
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      maxLength: 11,
      validate: async (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.DIV_MODE_OF_PAY?.value === "NEFT"
        ) {
          return "IFSCCodeisRequired";
        }
        return "";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          let validateIFSC = await getIfscBenDetail({
            IFSC_CODE: currentField?.value ?? "",
            ENTRY_TYPE: "NEFT",
            USERNAME: auth?.user?.id ?? "",
            USERROLE: auth?.role ?? "",
          });
          if (validateIFSC?.[0]?.O_STATUS === "999") {
            let buttonName = await formState.MessageBox({
              messageTitle:
                validateIFSC?.[0]?.O_MSG_TITLE ?? "ValidationFailed",
              message: validateIFSC?.[0]?.O_MESSAGE ?? "",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                BANK: { value: "" },
                TO_IFSC_CODE: {
                  value: "",
                  isFieldFocused: true,
                },
                TO_IFSCCODE_HIDDEN: { value: "" },
              };
            }
          } else if (validateIFSC?.[0]?.O_STATUS === "0") {
            return {
              NEFT_BANK_NM: { value: validateIFSC?.[0]?.BANK_NM ?? "" },
              TO_IFSCCODE_HIDDEN: { value: currentField?.value ?? "" },
              TO_ACCT_NO: { value: "" },
            };
          }
        } else if (!currentField?.value) {
          return {
            NEFT_BANK_NM: { value: "" },
            TO_ACCT_NO: { value: "" },
            TO_IFSC_CODE: { value: "" },
          };
        }
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NEFT_BANK_NM",
      label: "Bank",
      isReadOnly: true,
      dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !(
          dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
          dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NEFT"
        );
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NO",
      label: "ACNumber",
      placeholder: "AccountNumber",
      type: "text",
      maxLength: 35,
      dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !(
          dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
          dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NEFT"
        );
      },
      validate: async (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.DIV_MODE_OF_PAY?.value === "NEFT"
        ) {
          return "AcNumberIsRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TO_ACCT_TYPE",
      label: "AcctType",
      placeholder: "AccountType",
      type: "text",
      txtTransform: "uppercase",
      options: () => {
        return getAcctTypeData();
      },
      dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !(
          dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
          dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NEFT"
        );
      },
      _optionsKey: "getAcctTypeData",
      validate: async (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.DIV_MODE_OF_PAY?.value === "NEFT"
        ) {
          return "AcTypeIsRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NM",
      label: "AccountName",
      placeholder: "EnterAcName",
      txtTransform: "uppercase",
      type: "text",
      dependentFields: ["DIV_DTL_VISIBLE", "DIV_MODE_OF_PAY"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !(
          dependentFieldsValues?.DIV_DTL_VISIBLE?.value === "Y" &&
          dependentFieldsValues?.DIV_MODE_OF_PAY?.value === "NEFT"
        );
      },
      validate: async (currentField, dependentFields) => {
        if (
          !Boolean(currentField?.value) &&
          dependentFields?.DIV_MODE_OF_PAY?.value === "NEFT"
        ) {
          return "AcNameIsRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "ignoreField",
      label: "",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      dependentFields: ["MODE_PAYMENT"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.MODE_PAYMENT?.value !== "G";
      },

      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      placeholder: "EnterBankCode",
      name: "BANK_CD",
      label: "BankCode",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      FormatProps: {
        isNumber: true,
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.MODE_PAYMENT?.value !== "G";
      },
      dependentFields: ["MODE_PAYMENT"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) =>
        await handleBlurBankCode(
          currentField,
          formState,
          authState,
          dependentFieldValues
        ),
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "BankName",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      isReadOnly: true,
      dependentFields: ["MODE_PAYMENT"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.MODE_PAYMENT?.value !== "G";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.bankName?.BANK_CD) {
          return {
            BANK_NM: {
              value: formState?.bankName?.BANK_CD,
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH",
      label: "Description",
      placeholder: "enterDescription",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.MODE_PAYMENT?.value === "G") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "EnterChequeNo",
      type: "text",
      autoComplete: "off",
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.MODE_PAYMENT?.value !== "G";
      },

      dependentFields: ["MODE_PAYMENT"],
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      runPostValidationHookAlways: true,

      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CHK_AMOUNT",
      label: "ChequeAmount",
      placeholder: "EnterChequeAmount",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return dependentFieldsValues?.MODE_PAYMENT?.value !== "G";
      },
      dependentFields: ["MODE_PAYMENT"],
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "APP_AMT_VISIBLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "APP_QTY_VISIBLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DIV_DTL_VISIBLE",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "FEES_ACCT_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SHARE_ACCT_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "STNRY_ACCT_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FEES_AMOUNT_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "STNRY_AMT_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DEFAULT_DIV_MODE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MEM_CD_VISIBLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HIDDEN_SHARE_TYPE",
    },
  ],
};
