import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
import { isValid } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data?.MSG ?? []) {
    if (obj?.O_STATUS === "999") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      continue;
    } else if (obj?.O_STATUS === "99") {
      const buttonName = await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "Confirmation",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });
      if (buttonName === "No") {
        break;
      }
    } else if (obj?.O_STATUS === "0") {
      return data;
    }
  }
};

export const retrieveMetaData1442 = {
  formConfig: {
    formMetadata: {
      form: {
        name: "retrieve-compo-retrieve-MetaData-1442",
        label: "enterRetrivalPara",
        resetFieldOnUnmount: false,
        validationRun: "onBlur",
        submitAction: "home",
        render: {
          ordering: "auto",
          renderType: "simple",
          gridConfig: {
            item: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
          _accountNumber: {
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
          label: "BranchCode",
          placeholder: "BranchCodePlaceHolder",
          options: GeneralAPI.getBranchCodeList,
          required: true,
          _optionsKey: "getBranchCodeList",
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
              TO_ACCT_NM: { value: "" },
              ACCT_TYPE: { value: "" },
              FROM_ACCT: { value: "", ignoreUpdate: false },
              TO_ACCT: { value: "", ignoreUpdate: false },
            };
          },
          GridProps: { xs: 12, md: 4, sm: 4, xl: 4, lg: 4 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          visibleInRetrieval: false,
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
                FROM_ACCT: { value: "" },
                TO_ACCT: { value: "" },
                ACCT_TYPE_NAME: { value: field?.optionData?.[0]?.TYPE_NM },
              };
            }
          },
          runPostValidationHookAlways: true,
          GridProps: { xs: 12, md: 4, sm: 4, xl: 4, lg: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_TYPE_NAME",
          fullWidth: true,
          label: "AccountTypeName",
          type: "text",
          isReadOnly: true,
          shouldExclude(fieldData, dependent, formState) {
            if (formState?.docCD === "RPT/103") {
              return false;
            } else {
              return true;
            }
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "SPACER1",
          ignoreInSubmit: true,
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (formState?.docCD === "RPT/103") {
              return true;
            } else {
              return false;
            }
          },
          GridProps: { xs: 0, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          required: true,
          placeholder: "EnterAccountNumber",

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
          name: "FROM_ACCT",
          autoComplete: "off",
          label: "FromAccountNumber",
          dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
          runPostValidationHookAlways: true,
          validate: (columnValue) => {
            let regex = /^[^!&]*$/;
            if (!regex.test(columnValue.value)) {
              return "Special Characters (!, &) not Allowed";
            }
            return "";
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
                  FROM_ACCT: {
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
                FROM_ACCT: returnValue
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
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
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
          GridProps: { xs: 12, sm: 8, md: 8, lg: 8, xl: 8 },
        },
        {
          render: {
            componentType: "textField",
          },
          required: true,
          placeholder: "EnterAccountNumber",

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
          name: "TO_ACCT",
          autoComplete: "off",
          label: "ToAccountNumber",
          dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
          runPostValidationHookAlways: true,
          validate: (columnValue) => {
            let regex = /^[^!&]*$/;
            if (!regex.test(columnValue.value)) {
              return "Special Characters (!, &) not Allowed";
            }
            return "";
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
                TO_ACCT_NM: { value: "" },
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
                  TO_ACCT: {
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
                TO_ACCT: returnValue
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
                TO_ACCT_NM: {
                  value: returnValue?.ACCT_NM ?? "",
                },
                TRAN_DATE: {
                  value: new Date(returnValue?.OP_DATE) ?? "",
                },
              };
            } else if (!currentField?.value) {
              formState?.setIsValidate(false);
              return {
                TO_ACCT_NM: { value: "" },
              };
            }
            return {};
          },
          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_NM",
          fullWidth: true,
          label: "AccountName",
          placeholder: "AccountName",
          ignoreInSubmit: true,
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 8, md: 8, lg: 8, xl: 8 },
        },

        {
          render: {
            componentType: "datePicker",
          },
          name: "A_FROM_DT",
          label: "GeneralFromDate",
          isFieldFocused: true,
          required: true,
          fullWidth: true,
          isWorkingDate: true,
          placeholder: "DD/MM/YYYY",
          format: "dd/MM/yyyy",
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
          validate: (currentField) => {
            let formatdate = new Date(currentField?.value);
            if (!currentField?.value) {
              return "PleaseEnterFromDate";
            } else if (Boolean(formatdate) && !isValid(formatdate)) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          onFocus: (date) => {
            date.target.select();
          },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "A_TO_DT",
          label: "GeneralToDate",
          required: true,
          fullWidth: true,
          isWorkingDate: true,
          format: "dd/MM/yyyy",
          placeholder: "DD/MM/YYYY",
          validate: (currentField, dependentField) => {
            let formatdate = new Date(currentField?.value);
            if (!currentField?.value) {
              return "PleaseEnterToDate";
            } else if (Boolean(formatdate) && !isValid(formatdate)) {
              return "Mustbeavaliddate";
            } else if (
              new Date(currentField?.value) <
              new Date(dependentField?.A_FROM_DT?.value)
            ) {
              return "ToDateshouldbegreaterthanorequaltoFromDate";
            }
            return "";
          },
          onFocus: (date) => {
            date.target.select();
          },
          dependentFields: ["A_FROM_DT"],
          runValidationOnDependentFieldsChange: true,
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },

        {
          render: {
            componentType: "select",
          },
          name: "BASE_BRANCH_CD",
          label: "SkipAcctClosed",
          options: [
            { label: "Yes", value: "Y" },
            { label: "No", value: "N" },
          ],
          defaultValue: "N",
          fullWidth: true,
          _optionsKey: "BASE_BRANCH_CD",
          GridProps: { xs: 12, md: 2.5, sm: 2.5, xl: 2.5, lg: 2.5 },
        },

        {
          render: {
            componentType: "select",
          },
          name: "PARA_CD",
          label: "OnlyTransAcct",
          options: [
            { label: "Yes", value: "Y" },
            { label: "No", value: "N" },
          ],
          fullWidth: true,
          shouldExclude(fieldData, dependent, formState) {
            if (formState?.docCD === "RPT/1442") {
              return false;
            } else {
              return true;
            }
          },
          defaultValue: "N",
          _optionsKey: "PARA_CD",
          GridProps: { xs: 12, md: 2.5, sm: 2.5, xl: 2.5, lg: 2.5 },
        },
      ],
    },
  },
};
