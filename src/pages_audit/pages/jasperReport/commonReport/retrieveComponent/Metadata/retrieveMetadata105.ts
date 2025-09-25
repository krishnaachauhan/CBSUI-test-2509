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

export const retrieveMetaData105 = {
  formConfig: {
    formMetadata: {
      form: {
        name: "retrieve-compo-retrieve-MetaData",
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
          shouldExclude: true,
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
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "", ignoreUpdate: false },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
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
          name: "ACCT_CD",
          autoComplete: "off",
          label: "AccountNumber",
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
          GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          fullWidth: true,
          label: "AccountName",
          placeholder: "AccountName",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 5, md: 5, lg: 5, xl: 5 },
        },
        {
          render: { componentType: "datePicker" },
          name: "TRAN_DATE",
          label: "Date",
          placeholder: "DD/MM/YYYY",
          fullWidth: true,
          validate: (value) => {
            if (Boolean(value?.value) && !isValid(value?.value)) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["DateRequired"] }],
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
          render: {
            componentType: "select",
          },
          name: "PARA_CD",
          label: "ReportType",
          fullWidth: true,
          placeholder: "NocReportConf",
          options: [
            { label: "JointGuarantorSignatoryAcctwise", value: "Y" },
            { label: "Accountwise", value: "N" },
          ],
          defaultValue: "Y",
          _optionsKey: "PARA_CD",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
      ],
    },
  },
};
