import { utilFunction } from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { ValidateEmailId } from "../acct-mst/api";
import { isEmpty } from "lodash";
export const formMetadata = {
  form: {
    name: "StatementEMailRegistration",
    label: "Statement E-Mail Registration",
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
      datePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REQ_DT",
      label: "RegistrationDate",
      placeholder: "RegistrationDate",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REG_BY",
      label: "by",
      fullWidth: true,
      isReadOnly: true,
      defaultValue: "BRANCH VISIT",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "STATUS",
      label: "activeStatus",
      placeholder: "activeStatus",
      options: API.getActiveStatusDDW,
      _optionsKey: "getRetrievalType",
      defaultValue: "C",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "space1",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 3,
        lg: 3,
        xl: 3,
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

        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
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
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
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

          if (currentField.value && !dependentFieldsValues?.ACCT_TYPE?.value) {
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
            return {};
          }

          if (
            currentField?.value &&
            dependentFieldsValues?.BRANCH_CD?.value &&
            dependentFieldsValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              GD_TODAY_DT: authState?.workingDate ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };

            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const messageResult = await handleDisplayMessages(
              postData?.MSG ?? [],
              formState.MessageBox
            );

            if (!isEmpty(messageResult)) {
              return {
                ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                  ),
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_NM: { value: postData?.ACCT_NM ?? "" },
                TRAN_BAL: { value: postData?.TRAN_BAL ?? "" },
              };
            } else {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                ACCT_NM: { value: "" },
                TRAN_BAL: { value: "" },
              };
            }
          }

          if (!currentField?.value) {
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
            };
          }

          return {};
        },

        fullWidth: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 4, xl: 4 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountHolder",
      placeholder: "AccountHolder",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "REQ_PERIOD",
      label: "emailPeriod",
      placeholder: "emailPeriod",
      options: (dependentValue, formState, _, authState) => {
        return API.getEmailPeriodDDW({
          FLAG: "E",
        });
      },
      _optionsKey: "mailPeriod",
      defaultValue: "M",
      required: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectInstallmentPeriod"] }],
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "spacer2",
      GridProps: {
        xs: 12,
        sm: 4,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },

    {
      render: { componentType: "autocomplete" },
      name: "PERIOD_VALUE",
      label: "statementPeriod",
      placeholder: "statementPeriod",
      options: (dependentValue, formState, _, authState) => {
        return API.getEmailPeriodDDW({
          FLAG: "",
        });
      },
      _optionsKey: "getEmailPeriodDDW",
      defaultValue: "M",
      required: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
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
      name: "MAIL_ID",
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
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "ZIP",
      defaultValue: true,
      label: "zip",
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
        componentType: "spacer",
      },
      name: "spacer2",
      GridProps: {
        xs: 2,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ZIP_PASS",
      label: "zipPassword",
      placeholder: "zipPassword",
      fullWidth: true,
      dependentFields: ["ZIP"],
      shouldExclude: (fieldData, dependentFieldsValues, formState) => {
        if (dependentFieldsValues?.ZIP?.value === true) {
          return false;
        }
        return true;
      },
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "FORMAT_CD",
      label: "statementFormat",
      placeholder: "statementFormat",
      shouldExclude: true,
      options: API.getStatementFormatDDW,
      _optionsKey: "getEmailPeriodDDW",
      defaultValue: "P",
      required: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectInstallmentPeriod"] }],
      },
    },
  ],
};
