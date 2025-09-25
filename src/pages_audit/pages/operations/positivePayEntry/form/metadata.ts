import { format, isValid } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";
import { getPMISCData, GetPositivePayImportDdwn } from "../api";
import { utilFunction, GridMetaDataType } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
export const PositivePayEntryFormMetadata = {
  form: {
    name: "positivePayEntry",
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
      numberFormat: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        isFieldFocused: true,
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
            CHEQUE_NO: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
      },
      accountTypeMetadata: {
        dependentFields: ["BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (currentField?.displayValue !== currentField?.value) {
            return {};
          }
          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountBranch",
              buttonNames: ["Ok"],
              icon: "WARNING",
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
                CHEQUE_NO: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else {
            return {
              ACCT_CD: { value: "", ignoreUpdate: false },
              ACCT_NM: { value: "" },
              CHEQUE_NO: { value: "", ignoreUpdate: false },
            };
          }
        },
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
      },
      accountCodeMetadata: {
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
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
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                ) ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);
            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.MSG?.length; i++) {
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                formState?.handleButtonDisable(false);
                await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                formState?.handleButtonDisable(false);
                if (btn99 !== "No") {
                  await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                      ? postData?.MSG?.[i]?.O_MSG_TITLE
                      : "Alert",
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData;
              } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                formState?.handleButtonDisable(false);
                const { btnName } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                formState?.handleButtonDisable(false);
                if (btn99 !== "No") {
                  returnVal = postData;
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
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
                ignoreUpdate: true,
              },
              TYPE_CD: { value: returnVal?.TYPE_CD ?? "" },
              CHEQUE_NO: { value: "", ignoreUpdate: false },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "", isFieldFocused: false },
              CHEQUE_NO: {
                value: "",
                ignoreUpdate: false,
              },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4.5, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      label: "TypeCD",
      GridProps: { xs: 12, sm: 6, md: 4.5, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNumber",
      type: "text",
      placeholder: "EnterChequeNumber",
      maxLength: 10,
      autoComplete: "off",
      className: "textInputFromRight",
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value.length > 10) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ChequeNumberIsRequired"] }],
      },
      dependentFields: ["TYPE_CD", "ACCT_TYPE", "ACCT_CD", "BRANCH_CD"],
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
        }
        if (
          Boolean(currentField.value) &&
          dependentFieldValues?.BRANCH_CD?.value?.length === 0
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "Alert",
            message: "EnterAccountNumber",
            buttonNames: ["Ok"],
            icon: "WARNING",
          });
          if (buttonName === "Ok") {
            return {
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
              CHEQUE_NO: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        } else if (
          Boolean(currentField.value) &&
          dependentFieldValues?.ACCT_TYPE?.value?.length === 0
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "Alert",
            message: "EnterAccountNumber",
            buttonNames: ["Ok"],
            icon: "WARNING",
          });
          if (buttonName === "Ok") {
            return {
              ACCT_TYPE: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
              CHEQUE_NO: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        } else if (
          Boolean(currentField.value) &&
          dependentFieldValues?.ACCT_CD?.value?.length === 0
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "Alert",
            message: "EnterAccountNumber",
            buttonNames: ["Ok"],
            icon: "WARNING",
          });
          if (buttonName === "Ok") {
            return {
              ACCT_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
              CHEQUE_NO: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        } else if (
          currentField?.value &&
          dependentFieldValues?.ACCT_TYPE?.value &&
          dependentFieldValues?.ACCT_CD?.value &&
          dependentFieldValues?.BRANCH_CD?.value
        ) {
          const reqParameters = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: dependentFieldValues["BRANCH_CD"]?.value ?? "",
            ACCT_TYPE: dependentFieldValues["ACCT_TYPE"]?.value ?? "",
            ACCT_CD: dependentFieldValues["ACCT_CD"]?.value ?? "",
            CHEQUE_NO: currentField?.value,
            SCREEN_REF: formState?.docCD ?? "",
            TYPE_CD: dependentFieldValues["TYPE_CD"]?.value ?? "",
          };
          formState?.handleButtonDisable(true);
          const postData = await GeneralAPI.getChequeNoValidation(
            reqParameters
          );

          let btn99, returnVal;

          const getButtonName = async (obj) => {
            let btnName = await formState.MessageBox(obj);
            return { btnName, obj };
          };

          for (let i = 0; i < postData.length; i++) {
            if (postData[i]?.O_STATUS === "999") {
              formState?.handleButtonDisable(false);
              await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE ?? "ValidationFailed",
                message: postData[i]?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              returnVal = "";
            } else if (postData[i]?.O_STATUS === "9") {
              formState?.handleButtonDisable(false);
              if (btn99 !== "No") {
                await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE ?? "Alert",
                  message: postData[i]?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              }
              returnVal = postData;
            } else if (postData[i]?.O_STATUS === "99") {
              formState?.handleButtonDisable(false);
              const { btnName } = await getButtonName({
                messageTitle: postData[i]?.O_MSG_TITLE ?? "Confirmation",
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
                returnVal = postData;
              } else {
                returnVal = "";
              }
            }
          }

          btn99 = 0;
          return {
            CHEQUE_NO:
              returnVal !== ""
                ? {
                    value: currentField?.value ?? "",
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
          };
        } else if (!currentField?.value) {
          formState?.handleButtonDisable(false);
          return {
            CHEQUE_NO: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
      GridProps: { xs: 12, sm: 4, md: 2.5, lg: 1.75, xl: 1.75 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      __NEW__: {
        validate: (value) => {
          if (Boolean(value?.value) && !isValid(value?.value)) {
            return "Mustbeavaliddate";
          }
          return "";
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ChequeDateIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CHEQUE_AMT",
      label: "Amount",
      type: "text",
      maxLength: 15,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value.length > 15) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AmountIsRequired"] }],
      },
      autoComplete: "off",
      GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2.25, xl: 2.25 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAYEE_NM",
      label: "PayeeName",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      placeholder: "EnterPayeeName",
      type: "text",
      autoComplete: "off",
      maxLength: 200,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemarks",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      type: "text",
      autoComplete: "off",
      maxLength: 200,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datetimePicker",
      },
      name: "ENTERED_DATE",
      label: "EnteredDate",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      fullWidth: true,
      isReadOnly: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (formState?.formMode === "view" || formState?.formMode === "edit") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2.5, lg: 3.6, xl: 3.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "TransactionDate",
      isReadOnly: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (formState?.formMode === "view" || formState?.formMode === "edit") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2.4, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ENTERED_BY",
      label: "EnteredBy",
      type: "text",
      isReadOnly: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (formState?.formMode === "view" || formState?.formMode === "edit") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3.5, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "REQ_CHANNEL",
      label: "RequestFrom",
      options: () => getPMISCData("POSITIVE_PAY"),
      _optionsKey: "getRequestFromOp",
      defaultValue: "B",
      isReadOnly: true,
      fullWidth: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (formState?.formMode === "view" || formState?.formMode === "edit") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3.5, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "UPLOAD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CHEQUE_IMG",
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "UPLOAD_IMG",
      label: "UploadImage",
      endsIcon: "",
      rotateIcon: "scale(2)",
      placeholder: "",
      iconStyle: {
        fontSize: "25px !important",
      },
      shouldExclude(fieldData, dependentFields, formState) {
        if (formState?.formMode === "view") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 3, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "VIEW",
      label: "View",
      endsIcon: "",
      type: "text",
      rotateIcon: "scale(2)",
      placeholder: "",
      iconStyle: {
        fontSize: "25px !important",
      },
      shouldExclude(fieldData, dependentFields, formState) {
        if (formState?.formMode === "edit" || formState?.formMode === "view") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 3, sm: 3, md: 2, lg: 1.5, xl: 1.5 },
    },
  ],
};

export const ResponseParameterFormMetaData = {
  form: {
    name: "responseParameterData",
    label: "ResponseParameters",
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
        componentType: "radio",
      },
      name: "FLAG",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: "A",
      options: [
        {
          label: "AccountNum",
          value: "A",
        },
        { label: "TransactionDate", value: "D" },
      ],
      runValidationOnDependentFieldsChange: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (currentField?.value === "D") {
          return {
            FROM_DATE: {
              value: authState?.workingDate
                ? format(new Date(authState?.workingDate), "dd/MMM/yyyy")
                : "",
              ignoreUpdate: true,
            },
            TO_DATE: {
              value: authState?.workingDate
                ? format(new Date(authState?.workingDate), "dd/MMM/yyyy")
                : "",
              ignoreUpdate: true,
            },
            ACCT_NM: { value: "", ignoreUpdate: true },
            ACCT_CD: { value: "", ignoreUpdate: true },
            ACCT_TYPE: { value: "", ignoreUpdate: true },
          };
        }
      },
      validationRun: "all",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        dependentFields: ["FLAG"],
        shouldExclude(fieldData, dependentFields, formState) {
          if (dependentFields["FLAG"]?.value === "A") {
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
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
      accountTypeMetadata: {
        dependentFields: ["FLAG", "BRANCH_CD"],
        shouldExclude(fieldData, dependentFields, formState) {
          if (dependentFields["FLAG"]?.value === "A") {
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
          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountBranch",
              buttonNames: ["Ok"],
              icon: "WARNING",
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
              };
            }
          } else {
            return {
              ACCT_CD: { value: "", ignoreUpdate: false },
              ACCT_NM: { value: "" },
            };
          }
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
      accountCodeMetadata: {
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "FLAG"],
        shouldExclude(fieldData, dependentFields, formState) {
          if (dependentFields["FLAG"]?.value === "A") {
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
          if (
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
                  ignoreUpdate: true,
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
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
            };
            formState.handleButtonDisable(true);
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);
            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.MSG?.length; i++) {
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                formState.handleButtonDisable(false);
                await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                formState.handleButtonDisable(false);
                if (btn99 !== "No") {
                  await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                      ? postData?.MSG?.[i]?.O_MSG_TITLE
                      : "Alert",
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData;
              } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                formState.handleButtonDisable(false);
                const { btnName } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                formState.handleButtonDisable(false);
                if (btn99 !== "No") {
                  returnVal = postData;
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
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
              },
            };
          } else if (!currentField?.value) {
            formState.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields["FLAG"]?.value === "A") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DATE",
      label: "FromDate",
      fullWidth: true,
      required: true,
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
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields["FLAG"]?.value === "A") {
          return true;
        } else {
          return false;
        }
      },
      runValidationOnDependentFieldsChange: true,
      validationRun: "onChange",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DATE",
      label: "ToDate",
      placeholder: "",
      fullWidth: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateIsRequired"] }],
      },
      dependentFields: ["FROM_DATE", "FLAG"],
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DATE?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields["FLAG"]?.value === "A") {
          return true;
        } else {
          return false;
        }
      },
      validationRun: "onChange",
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};

export const positivePayImportData = {
  form: {
    name: "positivepayData",
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
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DESCRIPTION",
      label: "SelectConfiguration",
      fullWidth: true,
      placeholder: "SelectConfiguration",
      options: (dependentValue, formState, _, authState) => {
        return GetPositivePayImportDdwn({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      _optionsKey: "GetPositivePayImportDdwn",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ],
};

export const ImportGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Positive Pay File Error",
    rowIdColumn: "LINE",
    defaultColumnConfig: {
      width: 350,
      minWidth: 300,
      maxWidth: 400,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [20, 50, 100],
    defaultPageSize: 20,
    containerHeight: {
      min: "50vh",
      max: "50vh",
    },
    isCusrsorFocused: true,
    allowRowSelection: false,
  },
  columns: [
    {
      accessor: "LINE",
      columnName: "SrNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 40,
      maxWidth: 100,
      isAutoSequence: true,
    },
    {
      accessor: "BRANCH_CD",
      columnName: "Branch",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 90,
      minWidth: 50,
      maxWidth: 120,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "AccType",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 90,
      minWidth: 50,
      maxWidth: 120,
    },
    {
      accessor: "ACCT_CD",
      columnName: "AccCode",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      accessor: "CHEQUE_AMT",
      columnName: "Amount",
      sequence: 5,
      alignment: "right",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "CHEQUE_NO",
      columnName: "ChequeNo",
      sequence: 6,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 60,
      maxWidth: 150,
    },
    {
      accessor: "CHEQUE_DT",
      columnName: "ChequeDate",
      sequence: 7,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 120,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "REASON",
      columnName: "Reason",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 850,
      minWidth: 500,
      maxWidth: 950,
    },
  ],
};
