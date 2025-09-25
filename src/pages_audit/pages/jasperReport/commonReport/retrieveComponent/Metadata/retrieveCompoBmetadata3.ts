import { utilFunction } from "@acuteinfo/common-base";
import { isValid } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";
import { handleDisplayMessages } from "./retrieveMetadata105";
import { validateHOBranch } from "components/utilFunction/function";

export const retrieveCompoBMetadata3 = {
  formConfig: {
    formMetadata: {
      form: {
        name: "retrieveCompoBMetadata",
        label: "enterRetrivalPara",
        resetFieldOnUnmount: false,
        validationRun: "onBlur",
        render: {
          ordering: "auto",
          renderType: "simple",
          gridConfig: {
            container: {
              direction: "row",
              spacing: 0.5,
            },
          },
        },
        componentProps: {
          datePicker: {
            fullWidth: true,
          },
        },
      },
      fields: [
        {
          render: {
            componentType: "autocomplete",
          },
          name: "BRANCH_CD",
          runPostValidationHookAlways: true,
          fullWidth: true,
          validationRun: "onChange",
          defaultBranchTrue: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState
          ) => {
            if (formState?.isSubmitting) return {};
            const isHOBranch = await validateHOBranch(
              currentField,
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
            return {
              ACCT_NM: { value: "" },
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "", ignoreUpdate: false },
            };
          },
          label: "BranchCode",
          placeholder: "BranchCodePlaceHolder",
          options: GeneralAPI.getBranchCodeList,
          required: true,
          _optionsKey: "getBranchCodeList",
          GridProps: {
            xs: 3.5,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "ACCT_TYPE",
          runExternalFunction: true,
          fullWidth: true,
          isFieldFocused: true,
          validationRun: "all",
          label: "AccountType",
          placeholder: "AccountTypePlaceHolder",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["AccountTypeReqired"] }],
          },
          options: (dependentValue, formState, _, authState) => {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: formState?.docCD,
            });
          },
          _optionsKey: "get_Account_Type",
          postValidationSetCrossFieldValues: async (field, formState) => {
            formState.setDataOnFieldChange("IS_VISIBLE", {
              IS_VISIBLE: false,
            });
            if (field?.value) {
              return {
                ACCT_CD: { value: "" },
              };
            }
          },
          runPostValidationHookAlways: true,
          GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          label: "AccountNumber",
          name: "ACCT_CD",
          required: true,
          placeholder: "EnterAccountNumber",
          autoComplete: "off",
          dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
          runPostValidationHookAlways: true,
          validate: (columnValue) => {
            let regex = /^[^!&]*$/;
            if (!regex.test(columnValue.value)) {
              return "Special Characters (!, &) not Allowed";
            }
            return "";
          },
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: ["AccountNumberRequired"] },
              {
                name: "max",
                params: [20, "Account code should not exceed 20 digits"],
              },
            ],
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (
              !Boolean(currentField?.displayValue) &&
              !Boolean(currentField?.value)
            ) {
              return {
                ACCT_NM: { value: "" },
              };
            } else if (!Boolean(currentField?.displayValue)) {
              return {};
            }
            if (
              currentField.value &&
              !dependentFieldsValues?.ACCT_TYPE?.value
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterAccountType",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  AGENT_ACCT_CD: {
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
            } else if (
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
                SCREEN_REF: formState?.docCD ?? "",
                GD_TODAY_DT: authState?.workingDate ?? "",
              };
              const postData = await GeneralAPI.getAccNoValidation(
                reqParameters
              );

              const returnValue = await handleDisplayMessages(
                postData,
                formState
              );
              return {
                ACCT_CD: returnValue
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                ACCT_NM: {
                  value: returnValue?.ACCT_NM ?? "",
                },
                TRAN_DATE: {
                  value: new Date(returnValue?.OP_DATE) ?? "",
                },
              };
            } else if (!currentField?.value) {
              formState?.setIsValidate(false);
              return {
                ACCT_NM: { value: "" },
              };
            }
            return {};
          },
          fullWidth: true,
          GridProps: { xs: 12, sm: 5, md: 5, lg: 5, xl: 5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          fullWidth: true,
          label: "AccountName",
          ignoreInSubmit: true,
          placeholder: "AccountName",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 5, md: 5, lg: 5, xl: 5 },
        },
        {
          render: { componentType: "datePicker" },
          name: "FROM_DT",
          label: "fromDate",
          placeholder: "DD/MM/YYYY",
          required: true,
          isWorkingDate: true,
          fullWidth: true,
          validate: (value) => {
            if (Boolean(value?.value) && !isValid(value?.value)) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["FromDateIsRequired"] }],
          },
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },
        {
          render: { componentType: "datePicker" },
          name: "TO_DT",
          label: "toDate",
          placeholder: "DD/MM/YYYY",
          dependentFields: ["FROM_DT"],
          fullWidth: true,
          required: true,
          isWorkingDate: true,
          runValidationOnDependentFieldsChange: true,
          validate: (currentField, dependentField) => {
            if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
              return "Mustbeavaliddate";
            }
            if (
              new Date(currentField?.value) <
              new Date(dependentField?.FROM_DT?.value)
            ) {
              return "ToDateshouldbegreaterthanorequaltoFromDate";
            }
            return "";
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ToDateIsRequired"] }],
          },
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },
      ],
    },
  },
};
