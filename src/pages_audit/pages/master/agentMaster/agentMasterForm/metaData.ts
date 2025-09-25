import { GeneralAPI } from "registry/fns/functions";
import {
  getPMISCData,
  getAgentMstConfigDDW,
  getAgentMstConfigPigmyDDW,
} from "../api";
import { utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";
import { validateHOBranch } from "components/utilFunction/function";

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data?.MSG ?? []) {
    if (obj?.O_STATUS === "999") {
      formState?.handleButtonDisable(false);
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      formState?.handleButtonDisable(false);
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      continue;
    } else if (obj?.O_STATUS === "99") {
      formState?.handleButtonDisable(false);
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
      formState?.handleButtonDisable(false);
      return data;
    }
  }
};

export const AgentMasterFormMetaData = {
  form: {
    name: "agentMaster",
    label: "",
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
      numberFormat: {
        fullWidth: true,
      },
      autocomplete: {
        fullWidth: true,
      },
      rateOfInt: {
        fullWidth: true,
      },
    },
  },

  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "AGENT_CD",
      label: "Code",
      placeholder: "EnterCode",
      type: "text",
      maxLength: 4,
      isFieldFocused: true,
      autoComplete: "off",
      required: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      validate: (columnValue, ...rest) => {
        const gridData = rest[1]?.gridData;
        const accessor: any = columnValue.fieldKey.split("/").pop();
        const fieldValue = columnValue.value?.trim().toLowerCase();
        const rowColumnValue = rest[1]?.rows?.[accessor]?.trim().toLowerCase();
        if (fieldValue === rowColumnValue) {
          return "";
        }
        if (gridData) {
          for (let i = 0; i < gridData.length; i++) {
            const ele = gridData[i];
            const trimmedColumnValue = ele?.[accessor]?.trim().toLowerCase();

            if (trimmedColumnValue === fieldValue) {
              return `${t(`DuplicateValidation`, {
                fieldValue: fieldValue,
                rowNumber: i + 1,
              })}`;
            }
          }
        }
        return "";
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "AGENT_NM",
      label: "Name",
      placeholder: "EnterName",
      maxLength: 50,
      type: "text",
      required: true,
      autoComplete: "off",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CategoryNameisrequired"] }],
      },

      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },

    {
      render: { componentType: "autocomplete" },
      name: "GROUP_CD",
      label: "Group",
      placeholder: "SelectGroup",
      options: getPMISCData,
      _optionsKey: "getPMISCData_AGENT_GROUP",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "AgentAccount",
      name: "AgentAccount",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "AGENT_BRANCH_CD",
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
              AGENT_BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            ACCT_NM: { value: "" },
            AGENT_TYPE_CD: { value: "" },
            AGENT_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountTypeMetadata: {
        name: "AGENT_TYPE_CD",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        dependentFields: ["AGENT_BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldValues?.AGENT_BRANCH_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                AGENT_TYPE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                AGENT_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            AGENT_ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountCodeMetadata: {
        name: "AGENT_ACCT_CD",
        autoComplete: "off",
        dependentFields: ["AGENT_TYPE_CD", "AGENT_BRANCH_CD"],
        runPostValidationHookAlways: true,
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
            !dependentFieldsValues?.AGENT_TYPE_CD?.value
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
                AGENT_TYPE_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.AGENT_BRANCH_CD?.value &&
            dependentFieldsValues?.AGENT_TYPE_CD?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.AGENT_BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.AGENT_TYPE_CD?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.AGENT_TYPE_CD?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
              GD_TODAY_DT: authState?.workingDate ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );
            return {
              AGENT_ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.AGENT_TYPE_CD?.optionData?.[0] ??
                        ""
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
            formState?.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      __EDIT__: { isReadOnly: true },
      __NEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "SecurityAccount",
      name: "SecurityAccount",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "_accountNumber" },
      __NEW__: {
        branchCodeMetadata: {
          name: "SECURITY_BRANCH",
          required: false,
          schemaValidation: {},
          validationRun: "onChange",
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              SECURITY_TYPE_CD: { value: "" },
              SECURITY_ACCT_CD: { value: "", ignoreUpdate: false },
              SECURITY_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        },
      },
      __VIEW__: {
        branchCodeMetadata: {
          name: "SECURITY_BRANCH",
          required: false,
          defaultValue: "",
          schemaValidation: {},
          validationRun: "onChange",
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              SECURITY_TYPE_CD: { value: "" },
              SECURITY_ACCT_CD: { value: "", ignoreUpdate: false },
              SECURITY_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        },
      },
      __EDIT__: {
        branchCodeMetadata: {
          name: "SECURITY_BRANCH",
          required: false,
          defaultValue: "",
          schemaValidation: {},
          validationRun: "onChange",
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              SECURITY_TYPE_CD: { value: "" },
              SECURITY_ACCT_CD: { value: "", ignoreUpdate: false },
              SECURITY_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        },
      },

      accountTypeMetadata: {
        name: "SECURITY_TYPE_CD",
        required: false,
        schemaValidation: {},
        dependentFields: ["SECURITY_BRANCH"],
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldValues?.SECURITY_BRANCH?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                SECURITY_TYPE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                SECURITY_BRANCH: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            SECURITY_ACCT_CD: { value: "", ignoreUpdate: false },
            SECURITY_ACCT_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        name: "SECURITY_ACCT_CD",
        autoComplete: "off",
        fullWidth: true,
        required: false,
        schemaValidation: {},
        dependentFields: ["SECURITY_TYPE_CD", "SECURITY_BRANCH"],
        runPostValidationHookAlways: true,
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
              SECURITY_ACCT_NM: { value: "" },
            };
          } else if (!Boolean(currentField?.displayValue)) {
            return {};
          }
          if (
            currentField.value &&
            !dependentFieldsValues?.SECURITY_TYPE_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                SECURITY_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                SECURITY_TYPE_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.SECURITY_BRANCH?.value &&
            dependentFieldsValues?.SECURITY_TYPE_CD?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.SECURITY_BRANCH?.value,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.SECURITY_TYPE_CD?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.SECURITY_TYPE_CD?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
              GD_TODAY_DT: authState?.workingDate ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );
            return {
              SECURITY_ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.SECURITY_TYPE_CD
                        ?.optionData?.[0] ?? ""
                    ),
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              SECURITY_ACCT_NM: {
                value: returnValue?.ACCT_NM ?? "",
              },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              SECURITY_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SECURITY_ACCT_NM",
      label: "AccountName",
      type: "text",
      __EDIT__: { isReadOnly: true },
      __NEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 7, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SECURITY_AMT",
      label: "SecurityAmount",
      defaultValue: "0.00",
      autoComplete: "off",
      runPostValidationHookAlways: true,
      dependentFields: ["SECURITY_TYPE_CD"],
      StartAdornment: (dependentFields) => {
        return (
          dependentFields?.SECURITY_TYPE_CD?.optionData?.[0]?.CURRENCY_CD ?? ""
        );
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (Number(currentField?.value) <= 0) {
          return {
            SECURITY_AMT: {
              value: "0",
              ignoreUpdate: true,
            },
          };
        }
        return {};
      },
      maxLength: 14,
      GridProps: {
        xs: 12,
        sm: 5,
        md: 2.5,
        lg: 1.5,
        xl: 1.5,
      },
    },

    {
      render: {
        componentType: "rateOfInt",
      },
      name: "SECURITY_PER",
      label: "SecurityPercentage",
      defaultValue: "0.00",
      autoComplete: "off",
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (Number(currentField?.value) <= 0) {
          return {
            SECURITY_PER: {
              value: "0.00",
              ignoreUpdate: true,
            },
          };
        }
        return {};
      },
      GridProps: {
        xs: 12,
        sm: 5,
        md: 2.5,
        lg: 1.5,
        xl: 1.5,
      },
    },

    {
      render: { componentType: "select" },
      name: "SECURITY_FLAG",
      label: "SecurityCalculationOn",
      defaultOptionLabel: "SelectSecurityCalculationOn",
      options: [
        { label: "On Commission Amount", value: "N" },
        { label: "On Collection Amount", value: "Y" },
      ],
      GridProps: { xs: 12, sm: 7, md: 3, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "OtherAccount",
      name: "OtherAccount",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: { componentType: "_accountNumber" },
      __VIEW__: {
        branchCodeMetadata: {
          name: "OTH_BRANCH_CD",
          required: false,
          schemaValidation: {},
          validationRun: "onChange",
          runPostValidationHookAlways: true,
          defaultValue: "",
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              OTH_ACCT_TYPE: { value: "" },
              OTH_ACCT_CD: { value: "", ignoreUpdate: false },
              OTHER_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
      },
      __EDIT__: {
        branchCodeMetadata: {
          name: "OTH_BRANCH_CD",
          required: false,
          schemaValidation: {},
          runPostValidationHookAlways: true,
          defaultValue: "",
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
                OTH_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              OTH_ACCT_TYPE: { value: "" },
              OTH_ACCT_CD: { value: "", ignoreUpdate: false },
              OTHER_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
      },
      __NEW__: {
        branchCodeMetadata: {
          name: "OTH_BRANCH_CD",
          required: false,
          schemaValidation: {},
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
                OTH_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              OTH_ACCT_TYPE: { value: "" },
              OTH_ACCT_CD: { value: "", ignoreUpdate: false },
              OTHER_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
      },
      accountTypeMetadata: {
        name: "OTH_ACCT_TYPE",
        required: false,
        schemaValidation: {},
        validationRun: "onChange",
        dependentFields: ["OTH_BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            !dependentFieldValues?.OTH_BRANCH_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                OTH_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                OTH_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            OTH_ACCT_CD: { value: "", ignoreUpdate: false },
            OTHER_ACCT_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountCodeMetadata: {
        name: "OTH_ACCT_CD",
        autoComplete: "off",
        dependentFields: ["OTH_ACCT_TYPE", "OTH_BRANCH_CD"],
        required: false,
        schemaValidation: {},
        runPostValidationHookAlways: true,
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
              OTHER_ACCT_NM: { value: "" },
            };
          } else if (!Boolean(currentField?.displayValue)) {
            return {};
          }
          if (
            currentField.value &&
            !dependentFieldsValues?.OTH_ACCT_TYPE?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                OTH_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                OTH_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.OTH_BRANCH_CD?.value &&
            dependentFieldsValues?.OTH_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.OTH_BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.OTH_ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.OTH_ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
              GD_TODAY_DT: authState?.workingDate ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );

            return {
              OTH_ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.OTH_ACCT_TYPE?.optionData?.[0] ??
                        ""
                    ),
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              OTHER_ACCT_NM: {
                value: returnValue?.ACCT_NM ?? "",
              },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              OTHER_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "OTHER_ACCT_NM",
      label: "AccountName",
      type: "text",
      __EDIT__: { isReadOnly: true },
      __NEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 4, xl: 4 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "ProfessionalTaxAccount",
      name: "ProfessionalTaxAccount",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: { componentType: "_accountNumber" },
      __NEW__: {
        branchCodeMetadata: {
          name: "PTAX_BRANCH_CD",
          required: false,
          schemaValidation: {},
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
                PTAX_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              PTAX_ACCT_TYPE: { value: "" },
              PTAX_ACCT_CD: { value: "", ignoreUpdate: false },
              PTAX_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        },
      },
      __VIEW__: {
        branchCodeMetadata: {
          name: "PTAX_BRANCH_CD",
          required: false,
          defaultValue: "",
          schemaValidation: {},
          validationRun: "onChange",
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              PTAX_ACCT_TYPE: { value: "" },
              PTAX_ACCT_CD: { value: "", ignoreUpdate: false },
              PTAX_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        },
      },
      __EDIT__: {
        branchCodeMetadata: {
          name: "PTAX_BRANCH_CD",
          required: false,
          defaultValue: "",
          schemaValidation: {},
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
                PTAX_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
            return {
              PTAX_ACCT_TYPE: { value: "" },
              PTAX_ACCT_CD: { value: "", ignoreUpdate: false },
              PTAX_ACCT_NM: { value: "" },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        },
      },
      accountTypeMetadata: {
        name: "PTAX_ACCT_TYPE",
        required: false,
        schemaValidation: {},
        dependentFields: ["PTAX_BRANCH_CD"],
        validationRun: "onChange",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            !dependentFieldValues?.PTAX_BRANCH_CD?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                PTAX_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                PTAX_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            PTAX_ACCT_CD: { value: "", ignoreUpdate: false },
            PTAX_ACCT_NM: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        name: "PTAX_ACCT_CD",
        autoComplete: "off",
        required: false,
        schemaValidation: {},
        dependentFields: ["PTAX_ACCT_TYPE", "PTAX_BRANCH_CD"],
        runPostValidationHookAlways: true,
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
              PTAX_ACCT_NM: { value: "" },
            };
          } else if (!Boolean(currentField?.displayValue)) {
            return {};
          }
          if (
            currentField.value &&
            !dependentFieldsValues?.PTAX_ACCT_TYPE?.value
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                PTAX_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                PTAX_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.PTAX_BRANCH_CD?.value &&
            dependentFieldsValues?.PTAX_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.PTAX_BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.PTAX_ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.PTAX_ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
              GD_TODAY_DT: authState?.workingDate ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );
            return {
              PTAX_ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.PTAX_ACCT_TYPE?.optionData?.[0] ??
                        ""
                    ),
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              PTAX_ACCT_NM: {
                value: returnValue?.ACCT_NM ?? "",
              },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              PTAX_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PTAX_ACCT_NM",
      label: "AccountName",
      type: "text",
      __EDIT__: { isReadOnly: true },
      __NEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "PTAX_DEF_TRAN_CD",
      label: "Configuration",
      placeholder: "SelectConfiguration",
      options: getAgentMstConfigDDW,
      _optionsKey: "getAgentMstConfigDDW",
      type: "text",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "HandHeldMachine",
      name: "HandHeldMachine",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "PIGMY_CONF_TRAN_CD",
      label: "Configuration",
      placeholder: "SelectConfiguration",
      options: getAgentMstConfigPigmyDDW,
      _optionsKey: "getAgentMstConfigPigmyDDW",
      type: "text",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "TDS_RATE",
      label: "TDSRate",
      autoComplete: "off",
      maxLength: 5,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 3,
        xl: 3,
      },
    },
  ],
};
