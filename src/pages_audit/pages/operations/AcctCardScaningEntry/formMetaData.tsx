import { utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import {
  getLockerSizeDDWdata,
  validateLockerNo,
} from "../LockerOperationTrns/api";

export const RetriveParameterFormMetaData = {
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
          label: "accountWise",
          value: "A",
        },
        // { label: "lockerWise", value: "L" },
      ],
      runValidationOnDependentFieldsChange: true,
      validationRun: "all",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "COMP_CD",
      label: "Bank",
      placeholder: "Bank",
      dependentFields: ["ACCT_TYPE_", "FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields["FLAG"]?.value === "L") {
          return false;
        } else {
          return true;
        }
      },
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 9) {
            return false;
          }

          return true;
        },
      },

      GridProps: { xs: 4, sm: 4, md: 4, lg: 3, xl: 3 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        dependentFields: ["FLAG"],

        runPostValidationHookAlways: true,

        validationRun: "onChange",
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
      accountTypeMetadata: {
        dependentFields: ["FLAG", "BRANCH_CD"],
        name: "ACCT_TYPE",
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
        shouldExclude(fieldData, dependentFields, formState) {
          if (dependentFields["FLAG"]?.value === "A") {
            return false;
          } else {
            return true;
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
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value,
              COMP_CD: authState?.companyID,
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
              ),
              SCREEN_REF: formState?.docCD ?? "",
            };
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);
            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.MSG?.length; i++) {
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
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
                        dependentFieldValues?.ACCT_TYPE?.optionData
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
        componentType: "numberFormat",
      },
      name: "ACCT_TYPE_",
      label: "type",
      placeholder: "type",
      dependentFields: ["FLAG"],
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: true,
      },
      runPostValidationHookAlways: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "L") {
          return false;
        } else {
          return true;
        }
      },
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 9) {
            return false;
          }

          return true;
        },
      },

      GridProps: { xs: 4, sm: 4, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "LOCKER_NO_",
      label: "lockerNumber",
      placeholder: "lockerNumber",
      dependentFields: ["ACCT_TYPE_", "FLAG"],
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: true,
      },
      runPostValidationHookAlways: true,
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields["FLAG"]?.value === "L") {
          return false;
        } else {
          return true;
        }
      },
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 9) {
            return false;
          }

          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value && dependentFieldsValues?.ACCT_TYPE_?.value.length) {
          if (formState?.isSubmitting) return {};
          let postData = await validateLockerNo({
            ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE_?.value,
            COMP_CD: auth?.companyID ?? "",
            BRANCH_CD: auth?.user?.branchCode ?? "",
            LOCKER_NO: field.value,
            DOC_CD: formState?.docCD,
          });

          for (const obj of postData ?? []) {
            if (obj?.O_STATUS === "999") {
              await formState.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "ValidationFailed",
                message: obj?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              return {
                LOC_SIZE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                LOCKER_NO_: {
                  value: "",
                },
              };
              break;
            } else if (obj?.O_STATUS === "9") {
              await formState.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "Alert",
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
              return {
                REMARKS: {
                  value: postData[0]?.ACCT_NM ?? "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                LOC_SIZE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                OPER_STATUS: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
        return {
          LOC_SIZE_CD: {
            value: "",
            isFieldFocused: false,
            ignoreUpdate: false,
          },
        };
      },
      GridProps: { xs: 4, sm: 4, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LOC_SIZE_CD",
      label: "lockerSize",
      placeholder: "AccountTypePlaceHolder",
      disableCaching: true,
      required: true,
      runPostValidationHookAlways: true,
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: true,
      },
      validationRun: "onBlur",
      dependentFields: ["LOCKER_NO_", "ACCT_TYPE_", "FLAG"],
      options: (dependentFields, formState, _, authState) => {
        return getLockerSizeDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          LOCKER_NO: dependentFields?.LOCKER_NO_?.value,
          ACCT_TYPE: dependentFields?.ACCT_TYPE_?.value,
          ALLOTED: "Y",
          DEFAULT_VAL: "",
        });
      },

      _optionsKey: "getLockerSizeDDWdata",
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields["FLAG"]?.value === "L") {
          return false;
        } else {
          return true;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectLockerSize"] }],
      },
      GridProps: { xs: 4, sm: 4, md: 4, lg: 3, xl: 3 },
    },
  ],
};
