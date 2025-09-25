import {
  getPreviousBankIINDDW,
  validateAadhaarNumber,
  validateAccountNumber,
  validateAPBSStatus,
  validateCustomerId,
} from "../api";
import { validateHOBranch } from "components/utilFunction/function";
import { utilFunction } from "@acuteinfo/common-base";
import { isValid } from "date-fns";

export const APBSAcctRegristrationMetadata = {
  form: {
    name: "APBSAcctRegristrationMetadata",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "RegisterDate",
      placeholder: "DD/MM/YYYY",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3, md: 2, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ALLOW_EDIT",
      defaultValue: "",
    },
    {
      render: {
        componentType: "textField",
      },
      // name: "MASKED_UNIQUE_ID",
      name: "UNIQUE_ID",
      label: "AadhaarNo",
      placeholder: "EnterAadhaarNo",
      maxLength: 12,
      fullWidth: true,
      autoComplete: "off",
      isFieldFocused: true,
      required: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AadhaarNumberIsRequired"] }],
      },
      dependentFields: ["ALLOW_EDIT"],
      __EDIT__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.ALLOW_EDIT?.value === "Y") {
            return false;
          }
          return true;
        },
      },
      __VIEW__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.ALLOW_EDIT?.value === "Y") {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.displayValue === "") {
          return {};
        }
        if (currentField?.value) {
          const reqParameters = {
            COMP_CD: authState?.companyID ?? "",
            UNIQUE_ID: currentField?.value ?? "",
          };
          formState?.handleButtonDisable(true);
          const postData = await validateAadhaarNumber(reqParameters);

          let btn99, returnVal;

          const getButtonName = async (obj) => {
            let btnName = await formState.MessageBox(obj);
            return { btnName, obj };
          };
          for (let i = 0; i < postData.length; i++) {
            if (postData[i]?.O_STATUS === "999") {
              formState?.handleButtonDisable(false);
              await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE?.length
                  ? postData[i]?.O_MSG_TITLE
                  : "ValidationFailed",
                message: postData[i]?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              returnVal = "";
            } else if (postData[i]?.O_STATUS === "9") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE?.length
                    ? postData[i]?.O_MSG_TITLE
                    : "Alert",
                  message: postData[i]?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              }
            } else if (postData[i]?.O_STATUS === "99") {
              formState?.handleButtonDisable(false);
              const { btnName } = await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE?.length
                  ? postData[i]?.O_MSG_TITLE
                  : "Confirmation",
                message: postData[i]?.O_MESSAGE ?? "",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              btn99 = btnName;
              if (btnName === "No") {
                returnVal = "";
              }
            } else if (postData[i]?.O_STATUS === "0") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                returnVal = currentField?.value;
              } else {
                returnVal = "";
              }
            }
          }
          btn99 = 0;

          return {
            // MASKED_UNIQUE_ID:
            UNIQUE_ID:
              returnVal !== ""
                ? {
                    value: currentField?.value,
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  }
                : {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
          };
        } else if (!currentField?.value) {
          formState?.handleButtonDisable(false);
          return {
            // MASKED_UNIQUE_ID: { value: "", ignoreUpdate: false },
            UNIQUE_ID: { value: "", ignoreUpdate: false },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2.3, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        dependentFields: ["ALLOW_EDIT"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.formMode === "new") {
            return false;
          } else if (
            (formState?.formMode === "edit" ||
              formState?.formMode === "view") &&
            dependentFields?.ALLOW_EDIT?.value === "Y"
          ) {
            return false;
          }
          return true;
        },
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
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
            CUSTOMER_ID: { value: "", ignoreUpdate: false },
            CUSTOMER_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 5, md: 2.5, lg: 2.7, xl: 2.7 },
      },
      accountTypeMetadata: {
        dependentFields: ["BRANCH_CD", "ALLOW_EDIT"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.formMode === "new") {
            return false;
          } else if (
            (formState?.formMode === "edit" ||
              formState?.formMode === "view") &&
            dependentFields?.ALLOW_EDIT?.value === "Y"
          ) {
            return false;
          }
          return true;
        },
        validationRun: "onChange",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (currentField?.value) {
            formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
              ACCT_TYPE: currentField?.value,
              BRANCH_CD: dependentFieldValues?.["BRANCH_CD"]?.value,
              COMP_CD: authState?.companyID ?? "",
            });
          }
          return {
            ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
            CUSTOMER_ID: {
              value: "",
              ignoreUpdate: false,
            },
            CUSTOMER_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 6, md: 2.5, lg: 2.8, xl: 2.8 },
      },
      accountCodeMetadata: {
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "ALLOW_EDIT"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.formMode === "new") {
            return false;
          } else if (
            (formState?.formMode === "edit" ||
              formState?.formMode === "view") &&
            dependentFields?.ALLOW_EDIT?.value === "Y"
          ) {
            return false;
          }
          return true;
        },
        autoComplete: "off",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.displayValue === "") {
            return {};
          } else if (
            currentField.value &&
            dependentFieldValues?.ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "WARNING",
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
          } else if (
            currentField?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              WORKING_DATE: authState?.workingDate ?? "",
              DISPLAY_LANGUAGE: "en",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await validateAccountNumber(reqParameters);

            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                formState?.handleButtonDisable(false);
                await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE?.length
                    ? postData[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData[i]?.O_MESSAGE ?? "",
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "9") {
                formState?.handleButtonDisable(false);
                if (btn99 !== "No") {
                  await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE?.length
                      ? postData[i]?.O_MSG_TITLE
                      : "Alert",
                    message: postData[i]?.O_MESSAGE ?? "",
                    icon: "WARNING",
                  });
                }
                returnVal = postData[i];
              } else if (postData[i]?.O_STATUS === "99") {
                formState?.handleButtonDisable(false);
                const { btnName } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE?.length
                    ? postData[i]?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData[i]?.O_MESSAGE ?? "",
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "0") {
                formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
                  ...reqParameters,
                });
                formState?.handleButtonDisable(false);
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;

            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.ACCT_TYPE?.optionData?.[0]
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
              },
              CUSTOMER_ID: { value: "", ignoreUpdate: false },
              CUSTOMER_NM: { value: "" },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
              CUSTOMER_ID: { value: "", ignoreUpdate: false },
              CUSTOMER_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2.7, lg: 3, xl: 3 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "REG_FLAG",
      label: "ACHolder",
      defaultOptionLabel: "SelectAcHolder",
      fullWidth: true,
      defaultValue: "A",
      options: [
        { label: "Yes", value: "A" },
        { label: "No", value: "J" },
      ],
      dependentFields: ["ALLOW_EDIT"],
      __EDIT__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.ALLOW_EDIT?.value === "Y") {
            return false;
          }
          return true;
        },
      },
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.ALLOW_EDIT?.value === "Y") {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 3, md: 1.8, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      placeholder: "EnterCustomerID",
      className: "textInputFromRight",
      autoComplete: "off",
      fullWidth: true,
      maxLength: 12,
      textFieldStyle: {
        "& .MuiInputBase-input::placeholder": {
          textAlign: "left",
        },
      },
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CustomerIDisrequired"] }],
      },
      dependentFields: [
        "REG_FLAG",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "ALLOW_EDIT",
      ],
      __EDIT__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.ALLOW_EDIT?.value === "Y") {
            return false;
          }
          return true;
        },
      },
      __VIEW__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.ALLOW_EDIT?.value === "Y") {
            return false;
          }
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.REG_FLAG?.value === "J") {
          return false;
        } else {
          return true;
        }
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value) {
          const reqParameters = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
            ACCT_CD: dependentFieldValues?.ACCT_CD?.value ?? "",
            CUSTOMER_ID: currentField?.value ?? "",
            DISPLAY_LANGUAGE: "en",
          };
          formState?.handleButtonDisable(true);
          const postData = await validateCustomerId(reqParameters);

          let btn99, returnVal;

          const getButtonName = async (obj) => {
            let btnName = await formState.MessageBox(obj);
            return { btnName, obj };
          };
          for (let i = 0; i < postData.length; i++) {
            if (postData[i]?.O_STATUS === "999") {
              formState?.handleButtonDisable(false);
              await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE?.length
                  ? postData[i]?.O_MSG_TITLE
                  : "ValidationFailed",
                message: postData[i]?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              returnVal = "";
            } else if (postData[i]?.O_STATUS === "9") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE?.length
                    ? postData[i]?.O_MSG_TITLE
                    : "Alert",
                  message: postData[i]?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              }
              returnVal = postData[i];
            } else if (postData[i]?.O_STATUS === "99") {
              formState?.handleButtonDisable(false);
              const { btnName } = await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE?.length
                  ? postData[i]?.O_MSG_TITLE
                  : "Confirmation",
                message: postData[i]?.O_MESSAGE ?? "",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              btn99 = btnName;
              if (btnName === "No") {
                returnVal = "";
              }
            } else if (postData[i]?.O_STATUS === "0") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                returnVal = postData[i];
              } else {
                returnVal = "";
              }
            }
          }
          btn99 = 0;

          return {
            CUSTOMER_ID:
              returnVal !== ""
                ? {
                    value: currentField?.value,
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  }
                : {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
            CUSTOMER_NM: {
              value: returnVal?.CUSTOMER_NM ?? "",
            },
          };
        } else if (!currentField?.value) {
          formState?.handleButtonDisable(false);
          return {
            CUSTOMER_NM: { value: "", ignoreUpdate: false },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUSTOMER_NM",
      label: "CustomerName",
      isReadOnly: true,
      dependentFields: ["REG_FLAG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.REG_FLAG?.value === "J") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 5, md: 2.2, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER1",
      dependentFields: ["REG_FLAG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.REG_FLAG?.value !== "J") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 9, md: 4.2, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemarks",
      type: "text",
      autoComplete: "off",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "FRESH_REG",
      label: "FreshRegistration",
      defaultValue: "Y",
      defaultOptionLabel: "SelectFreshRegistration",
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FreshRegistrationIsRequired"] }],
      },
      dependentFields: ["UPLOAD"],
      __EDIT__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.UPLOAD?.value === "Y") {
            return true;
          }
          return false;
        },
      },
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.UPLOAD?.value === "Y") {
            return true;
          }
          return false;
        },
      },
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value === "Y") {
          return {
            PREV_IIN_NO: {
              value: "",
              isFieldFocused: false,
              ignoreUpdate: false,
            },
          };
        }
        return {
          PREV_IIN_NO: {
            value: "",
            isFieldFocused: false,
            ignoreUpdate: false,
          },
        };
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 3, md: 1.8, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PREV_IIN_NO",
      label: "PreviousBankIIN",
      fullWidth: true,
      placeholder: "SelectPreviousBankIIN",
      options: getPreviousBankIINDDW,
      _optionsKey: "getPreviousBankIINDDW",
      dependentFields: ["FRESH_REG", "UPLOAD"],
      __EDIT__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.UPLOAD?.value === "Y") {
            return true;
          }
          return false;
        },
      },
      __VIEW__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.UPLOAD?.value === "Y") {
            return true;
          }
          return false;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.FRESH_REG?.value === "N") {
          return false;
        } else {
          return true;
        }
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PreviousBankIINIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 9, md: 4.2, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER2",
      dependentFields: ["FRESH_REG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.FRESH_REG?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 9, md: 4.2, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "UPLOAD",
      defaultValue: "",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UPLOAD_DISP",
      label: "UploadNPCI",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3, md: 1.5, lg: 2, xl: 2 },
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "UPLOAD_DT",
      label: "UploadDate",
      isReadOnly: true,
      placeholder: "DD/MM/YYYY",
      dependentFields: ["UPLOAD"],
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.UPLOAD?.value === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      __VIEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.UPLOAD?.value === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER3",
      dependentFields: ["UPLOAD"],
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.UPLOAD?.value === "N") {
            return false;
          } else {
            return true;
          }
        },
      },
      __VIEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.UPLOAD?.value === "N") {
            return false;
          } else {
            return true;
          }
        },
      },
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "UNIQUE_ID_ORG",
      defaultValue: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
      defaultValue: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VALIDATE_ACTIVE",
      defaultValue: "",
    },
    {
      render: {
        componentType: "select",
      },
      name: "ACTIVE",
      label: "Status",
      defaultOptionLabel: "SelectStatus",
      fullWidth: true,
      options: [
        { label: "Active", value: "Y" },
        { label: "De-Active", value: "N" },
      ],
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
      },
      dependentFields: ["UNIQUE_ID_ORG", "UPLOAD", "VALIDATE_ACTIVE"],
      validationRun: "onChange", // If remove this it will not call api second time.
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (
          Boolean(currentField?.value) &&
          currentField?.value !== dependentFieldValues?.VALIDATE_ACTIVE?.value
        ) {
          const reqParameters = {
            COMP_CD: authState?.companyID ?? "",
            UNIQUE_ID: dependentFieldValues?.UNIQUE_ID_ORG?.value ?? "",
            ACTIVE: currentField?.value ?? "",
            UPLOAD: dependentFieldValues?.UPLOAD?.value ?? "",
            DISPLAY_LANGUAGE: "en",
          };
          formState?.handleButtonDisable(true);
          const postData = await validateAPBSStatus(reqParameters);

          let btn99, returnVal;

          const getButtonName = async (obj) => {
            let btnName = await formState.MessageBox(obj);
            return { btnName, obj };
          };
          for (let i = 0; i < postData.length; i++) {
            if (postData[i]?.O_STATUS === "999") {
              formState?.handleButtonDisable(false);
              await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE?.length
                  ? postData[i]?.O_MSG_TITLE
                  : "ValidationFailed",
                message: postData[i]?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              returnVal = "";
            } else if (postData[i]?.O_STATUS === "9") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE?.length
                    ? postData[i]?.O_MSG_TITLE
                    : "Alert",
                  message: postData[i]?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              }
            } else if (postData[i]?.O_STATUS === "99") {
              formState?.handleButtonDisable(false);
              const { btnName } = await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE?.length
                  ? postData[i]?.O_MSG_TITLE
                  : "Confirmation",
                message: postData[i]?.O_MESSAGE ?? "",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              btn99 = btnName;
              if (btnName === "No") {
                returnVal = "";
              }
            } else if (postData[i]?.O_STATUS === "0") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                returnVal = currentField?.value;
              } else {
                returnVal = "";
              }
            }
          }
          btn99 = 0;

          return {
            ACTIVE:
              returnVal !== ""
                ? {
                    value: currentField?.value,
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  }
                : {
                    value: dependentFieldValues?.VALIDATE_ACTIVE?.value,
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  },
            DEACTIVE_DT: {
              value: authState?.workingDate,
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        } else if (currentField?.value === "Y") {
          return {
            ACTIVE: {
              value: "Y",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            DEACTIVE_DT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        } else if (!currentField?.value) {
          return {
            ACTIVE: {
              value: "Y",
              ignoreUpdate: true,
              isFieldFocused: false,
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 3, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DEACTIVE_DT",
      label: "DeActiveDate",
      placeholder: "DD/MM/YYYY",
      dependentFields: ["ACTIVE"],
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACTIVE?.value === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      __VIEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACTIVE?.value === "Y") {
            return true;
          } else {
            return false;
          }
        },
      },
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      validationRun: "onChange",
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER4",
      dependentFields: ["ACTIVE"],
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACTIVE?.value === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      __VIEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACTIVE?.value === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UPLOAD_FILE_NM",
      label: "UploadFileName",
      type: "text",
      isReadOnly: true,
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 6, md: 5, lg: 4.5, xl: 4.5 },
    },
  ],
};

export const APBSRetriveFormMetadata = {
  form: {
    name: "APBSRetriveFormMetadata",
    label: "Parameters",
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
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "GeneralFromDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateIsRequired"] }],
      },
      dependentFields: ["TO_DT"],
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) > new Date(dependentField?.TO_DT?.value)
        ) {
          return "FromDateValidationMsg";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      validationRun: "onChange",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "GeneralToDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateIsRequired"] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
