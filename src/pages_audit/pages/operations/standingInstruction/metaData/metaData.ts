import * as API from "../api";
import { GeneralAPI } from "registry/fns/functions";
import {
  greaterThanDate,
  greaterThanInclusiveDate,
  lessThanDate,
  lessThanInclusiveDate,
  utilFunction,
} from "@acuteinfo/common-base";
import { format, isValid, parse } from "date-fns";
import { t } from "i18next";
import i18n from "components/multiLanguage/languagesConfiguration";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { validateHOBranch } from "components/utilFunction/function";

export const StandingInstructionMainMetaData = {
  form: {
    name: "Standing Instruction Entry (TRN/394)",
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
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      _accountNumber: {
        fullWidth: true,
      },
      arrayField: {
        fullWidth: true,
      },
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "autocomplete" },
      name: "COMM_TYPE_DESC",
      label: "Comm. Type",
      placeholder: "CommisionType",
      options: API.getcommisiontype,
      _optionsKey: "getcommisiontype",
      // defaultValue: "B",
      GridProps: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.Value) {
          return {
            DEF_TRAN_CD: {
              value: currentField?.Value ?? "",
            },
          };
        }
      },
    },
    {
      render: { componentType: "textField" },
      name: "DESCRIPTION",
      label: "Description",
      type: "text",
      required: true,
      maxLength: 200,
      placeholder: "enterDescription",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("DescriptionisRequired")] }],
      },
      GridProps: { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "arrayField",
      },

      name: "SI_SDT",
      changeRowOrder: true,
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.SI_SDT) ? data.SI_SDT : [];

        if (dataArray.length > 0) {
          const firstItem = dataArray[0];

          const fieldMapping = {
            CR_ACCT_CD: "Credit Account Number",
            CR_ACCT_TYPE: "Credit Account Type",
            DR_ACCT_CD: "Debit Account Number",
            DR_ACCT_TYPE: "Debit Account Type",
            SI_AMOUNT: "SI Amount",
            EXECUTE_DAY: "Execute Day",
            FEQ_VALUE: "Frequency Value",
            FEQ_TYPE: "Frequency Type",
            START_DT: "Start Date",
            VALID_UPTO: "Valid Upto Date",
          };

          const requiredFields = [
            "CR_ACCT_CD",
            "CR_ACCT_TYPE",
            "DR_ACCT_CD",
            "DR_ACCT_TYPE",
            "SI_AMOUNT",
            "EXECUTE_DAY",
            "FEQ_VALUE",
            "FEQ_TYPE",
            "START_DT",
            "VALID_UPTO",
          ];

          for (const field of requiredFields) {
            const value = firstItem[field];

            if (typeof value === "string" && !value.trim()) {
              const fieldName = fieldMapping[field] || field;
              return {
                reason: `Please Enter ${fieldName}.`,
              };
            } else if (value == null) {
              const fieldName = fieldMapping[field] || field;
              return {
                reason: `Please Enter ${fieldName}.`,
              };
            }
          }

          return true;
        }

        return false;
      },

      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: { componentType: "_accountNumber" },
          branchCodeMetadata: {
            label: "EnterCreditBranchCode",
            name: "CR_BRANCH_CD",
            __VIEW__: { isReadOnly: true },
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
                  CR_BRANCH_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
              return {
                CR_ACCT_TYPE: { value: "" },
                CR_ACCT_CD: { value: "", ignoreUpdate: false },
                CR_ACCT_NM: { value: "" },
              };
            },
            GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
          },
          accountTypeMetadata: {
            label: "EnterCreditAccountType",
            name: "CR_ACCT_TYPE",
            dependentFields: ["CR_ACCT_TYPE", "CR_BRANCH_CD"],
            options: (dependentValue, formState, _, authState) => {
              return GeneralAPI.get_Account_Type({
                COMP_CD: authState?.companyID,
                BRANCH_CD: authState?.user?.branchCode,
                USER_NAME: authState?.user?.id,
                DOC_CD: "SICRTYPE",
              });
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
                dependentFieldValues?.["SI_SDT.CR_BRANCH_CD"]?.value?.length ===
                  0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterBranchCode"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (buttonName === "Ok") {
                  return {
                    CR_BRANCH_CD: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: false,
                    },
                    CR_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
                return {
                  CR_ACCT_CD: { value: "", ignoreUpdate: false },
                  CR_ACCT_NM: { value: "" },
                };
              }
            },
            _optionsKey: "credit_acct_type",
            GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
          },
          accountCodeMetadata: {
            label: "EnterCreditAccountNo",
            name: "CR_ACCT_CD",
            autoComplete: "off",
            maxLength: 20,
            dependentFields: [
              "CR_ACCT_TYPE",
              "CR_BRANCH_CD",
              "DR_ACCT_CD",
              "DR_ACCT_TYPE",
              "DEF_TRAN_CD",
              "EXECUTE_DAY",
              "BRANCH_CD",
            ],
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};

              const reqData = {
                BRANCH_CD:
                  dependentFieldValues?.["SI_SDT.CR_BRANCH_CD"]?.value ?? "",
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE:
                  dependentFieldValues?.["SI_SDT.CR_ACCT_TYPE"]?.value ?? "",
                ACCT_CD:
                  utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ?? {}
                  ) ?? "",
                DR_BRANCH_CD:
                  dependentFieldValues?.["SI_SDT.BRANCH_CD"]?.value ?? "",
                EXECUTE_DAY:
                  dependentFieldValues?.["SI_SDT.EXECUTE_DAY"]?.value ?? "",
                DR_ACCT_CD:
                  dependentFieldValues?.["SI_SDT.DR_ACCT_CD"]?.value ?? "",
                DR_ACCT_TYPE:
                  dependentFieldValues?.["SI_SDT.DR_ACCT_TYPE"]?.value ?? "",
                DEF_TRAN_CD:
                  dependentFieldValues?.["SI_SDT.DEF_TRAN_CD"]?.value ?? "",
                SCREEN_REF: formState?.docCd ?? "",
                ENT_BRANCH: authState?.user?.branchCode ?? "",
                BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
              };
              if (
                currentField.value &&
                dependentFieldValues?.["SI_SDT.CR_ACCT_TYPE"]?.value?.length ===
                  0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterAccountType"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (buttonName === "Ok") {
                  return {
                    CR_ACCT_CD: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: false,
                    },
                    CR_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (
                dependentFieldValues?.["SI_SDT.CR_BRANCH_CD"]?.value &&
                dependentFieldValues?.["SI_SDT.CR_ACCT_TYPE"]?.value
              ) {
                const postData = await API.getCreditAccountvalidation({
                  reqData,
                });

                let btn99, returnVal;

                const getButtonName = async (obj) => {
                  let btnName = await formState.MessageBox(obj);
                  return { btnName, obj };
                };

                for (let i = 0; i < postData.length; i++) {
                  if (postData[i]?.O_STATUS === "999") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    returnVal = "";
                  } else if (postData[i]?.O_STATUS === "99") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "CONFIRM",
                      buttonNames: ["Yes", "No"],
                    });
                    btn99 = btnName;
                    if (btnName === "No") {
                      returnVal = "";
                    }
                  } else if (postData[i]?.O_STATUS === "9") {
                    if (btn99 !== "No") {
                      const { btnName, obj } = await getButtonName({
                        messageTitle: postData[i]?.O_MSG_TITLE,
                        message: postData[i]?.O_MESSAGE,
                        icon: "WARNING",
                      });
                    }
                    returnVal = "";
                  } else if (postData[i]?.O_STATUS === "0") {
                    formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
                      ACCT_NM: dependentFieldValues?.["SI_SDT.ACCT_NM"]?.value,
                      BRANCH_CD: reqData?.BRANCH_CD,
                      COMP_CD: authState?.companyID,
                      ACCT_TYPE: reqData?.ACCT_TYPE,
                      ACCT_CD: reqData?.ACCT_CD,
                      SCREEN_REF: reqData?.SCREEN_REF,
                    });
                    if (btn99 !== "No") {
                      returnVal = postData[i];
                    } else {
                      returnVal = "";
                    }
                  }
                }
                btn99 = 0;
                return {
                  CR_ACCT_CD:
                    returnVal !== ""
                      ? {
                          value: utilFunction.getPadAccountNumber(
                            currentField?.value,
                            dependentFieldValues?.CR_ACCT_TYPE
                              ?.optionData?.[0] ?? {}
                          ),
                          ignoreUpdate: true,
                          isFieldFocused: false,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: true,
                        },
                  SI_AMOUNT: {
                    value: returnVal?.SI_AMOUNT ?? "",
                  },
                  SI_CHARGE: {
                    value: returnVal?.SI_CHARGE ?? "",
                  },
                  FEQ_VALUE: {
                    value: returnVal?.FEQ_VALUE ?? "",
                  },
                  EXECUTE_DAY: {
                    value: returnVal?.EXECUTE_DAY ?? "",
                  },
                  FEQ_TYPE: {
                    value: returnVal?.FEQ_TYPE ?? "",
                  },
                  START_DT: {
                    value: returnVal?.START_DT ?? "",
                  },
                  VALID_UPTO: {
                    value: returnVal?.VALID_UPTO ?? "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                  SI_AMOUNT_PROTECT_FLAG: {
                    value: returnVal?.SI_AMOUNT_PROTECT ?? "",
                  },
                  FLAG_ENABLE_DISABLE: {
                    value: returnVal?.FLAG_ENABLE_DISABLE ?? "",
                  },
                  CR_ACCT_NM: {
                    value: returnVal?.CR_ACCT_NM,
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                };
              }
            },

            runPostValidationHookAlways: false,
            FormatProps: {
              isAllowed: (values) => {
                //@ts-ignore
                if (values?.value?.length > 20) {
                  return false;
                }
                return true;
              },
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CR_ACCT_NM",
          label: "Credit Account Name",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "SI_AMOUNT_PROTECT_FLAG",
          GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "FLAG_ENABLE_DISABLE",
          label: "FLAG_ENABLE_DISABLE",
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "START_DT",
          label: "StartDate",
          defaultValue: new Date(),
          fullWidth: true,
          dateFormat: "dd/MMM/yyyy",
          placeholder: "selectStartDate",
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
          required: true,

          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: [t("StartDateisrequired")] }],
          },
          // isMaxWorkingDate: true,
          runPostValidationHookAlways: true,
          validate: (currentField, dependentField, formstate) => {
            const parsedDate = formstate.authState?.workingDate
              ? parse(
                  formstate?.authState?.workingDate,
                  "d/MMM/yyyy",
                  new Date()
                )
              : "";

            const startDate = currentField?.value ? currentField?.value : null;

            if (!utilFunction?.isValidDate(startDate)) {
              return t("Please Enter Valid Date");
            }

            if (startDate && parsedDate) {
              if (startDate < parsedDate) {
                return t("CompareDate");
              }
              return "";
            }

            return "";
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "EXECUTE_DAY",
          label: "ExecuteOnDay",
          placeholder: "EnterExecuteOnDay",
          type: "text",
          fullWidth: true,
          runPostValidationHookAlways: true,
          AlwaysRunPostValidationSetCrossFieldValues: {
            touchAndValidate: true,
            alwaysRun: true,
          },
          required: true,

          dependentFields: [
            "DR_ACCT_TYPE",
            "BRANCH_CD",
            "CR_ACCT_CD",
            "CR_ACCT_TYPE",
            "CR_BRANCH_CD",
            "ENT_COMP_CD",
            "ENT_BRANCH_CD",
            "DEF_TRAN_CD",
            "EXECUTE_DAY",
            "START_DT",
          ],
          FormatProps: {
            isAllowed: (values) => {
              if (values?.value.length > 2) {
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
            const CR_ACCT_CD =
              dependentFieldsValues?.["SI_SDT.CR_ACCT_CD"]?.value;
            const CR_ACCT_TYPE =
              dependentFieldsValues?.["SI_SDT.CR_ACCT_TYPE"]?.value;
            const START_DT = dependentFieldsValues?.["SI_SDT.START_DT"]?.value;

            if (!CR_ACCT_CD || !CR_ACCT_TYPE || !START_DT || !field.value) {
              return {};
            }

            if (formState?.isSubmitting) return {};

            let postData = await API.validateSiExecuteDays({
              //@ts-ignore
              CR_ACCT_CD,
              CR_ACCT_TYPE,
              CR_COMP_CD: auth?.companyID ?? "",
              CR_BRANCH_CD: auth?.user?.branchCode ?? "",
              //@ts-ignore
              EXECUTE_DAY: field.value ?? "",
              START_DT: format(START_DT, "dd/MMM/yyyy"),
              WORKING_DATE: auth?.workingDate ?? "",
              DISPLAY_LANGUAGE: i18n.resolvedLanguage,
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
                  EXECUTE_DAY: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                  FEQ_TYPE: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                };
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
                  return {
                    EXECUTE_DAY: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    FEQ_TYPE: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (obj?.O_STATUS === "0") {
                // Success scenario: Handle the success response (if necessary)
              }
            }
          },

          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ExecuteOnDayisRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "FEQ_TYPE",
          label: "FrequncyType",
          placeholder: "EnterFrequncyType",
          type: "text",
          options: [
            { label: "Day(s)", value: "D" },
            { label: "Month(s)", value: "M" },
            { label: "Quartely", value: "Q" },
            { label: "Half Yearly", value: "H" },
            { label: "Year(s)", value: "Y" },
          ],
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["FrequncyTypeisRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        },

        {
          render: {
            componentType: "numberFormat",
          },
          name: "FEQ_VALUE",
          label: "FrequencyValue",
          placeholder: "EnterFrequncyValue",
          type: "text",
          fullWidth: true,
          required: true,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: false,
            isAllowed: (values) => {
              if (values.floatValue === 0) {
                return false;
              }
              return true;
            },
          },
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: [t("FrequencyValueisRequired")] },
            ],
          },

          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        },
        {
          render: { componentType: "_accountNumber" },
          branchCodeMetadata: {
            label: "EnterDebitBranchCode",
            name: "BRANCH_CD",
            __VIEW__: { isReadOnly: true },
            GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
          },
          accountTypeMetadata: {
            label: "EnterDebitAccountType",
            name: "DR_ACCT_TYPE",
            dependentFields: ["BRANCH_CD"],
            options: (dependentValue, formState, _, authState) => {
              return GeneralAPI.get_Account_Type({
                COMP_CD: authState?.companyID,
                BRANCH_CD: authState?.user?.branchCode,
                USER_NAME: authState?.user?.id,
                DOC_CD: "SIDRTYPE",
              });
            },
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (currentField?.value) {
                formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA2", {
                  ACCT_TYPE: currentField?.value,
                  BRANCH_CD: dependentFieldValues?.["SI_SDT.BRANCH_CD"]?.value,
                  COMP_CD: authState?.companyID ?? "",
                });
              }
              if (formState?.isSubmitting) return {};
              if (
                currentField?.value &&
                dependentFieldValues?.["SI_SDT.DR_BRANCH_CD"]?.value?.length ===
                  0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterBranchCode"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (buttonName === "Ok") {
                  return {
                    DR_BRANCH_CD: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: false,
                    },
                    DR_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
                return {
                  DR_ACCT_CD: { value: "", ignoreUpdate: false },
                  DR_ACCT_NM: { value: "" },
                };
              }
            },
            _optionsKey: "debit_acct_type",
            GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
          },
          accountCodeMetadata: {
            label: "EnterDebitAccountNo",
            name: "DR_ACCT_CD",
            autoComplete: "off",
            maxLength: 20,
            dependentFields: [
              "DR_ACCT_TYPE",
              "BRANCH_CD",
              "CR_ACCT_CD",
              "CR_ACCT_TYPE",
              "CR_BRANCH_CD",
              "ENT_COMP_CD",
              "ENT_BRANCH_CD",
              "DEF_TRAN_CD",
              "EXECUTE_DAY",
            ],
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};

              const reqData = {
                BRANCH_CD:
                  dependentFieldValues?.["SI_SDT.CR_BRANCH_CD"]?.value ?? "",
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE:
                  dependentFieldValues?.["SI_SDT.CR_ACCT_TYPE"]?.value ?? "",
                ACCT_CD:
                  dependentFieldValues?.["SI_SDT.CR_ACCT_CD"].value ?? "",
                DR_BRANCH_CD:
                  dependentFieldValues?.["SI_SDT.BRANCH_CD"]?.value ?? "",
                DR_ACCT_TYPE:
                  dependentFieldValues?.["SI_SDT.DR_ACCT_TYPE"]?.value ?? "",
                DR_ACCT_CD:
                  utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ?? {}
                  ) ?? "",
                DEF_TRAN_CD:
                  dependentFieldValues?.["SI_SDT.DEF_TRAN_CD"]?.value ?? "",
                EXECUTE_DAY:
                  dependentFieldValues?.["SI_SDT.EXECUTE_DAY"]?.value ?? "",
                SCREEN_REF: formState?.docCd ?? "",
                ENT_BRANCH: authState?.user?.branchCode ?? "",
                BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
              };
              if (
                currentField?.value &&
                dependentFieldValues?.["SI_SDT.DR_BRANCH_CD"]?.value?.length ===
                  0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterBranchCode"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (buttonName === "Ok") {
                  return {
                    DR_BRANCH_CD: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: false,
                    },
                    DR_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
                return {
                  DR_ACCT_CD: { value: "", ignoreUpdate: false },
                  DR_ACCT_NM: { value: "" },
                };
              } else if (
                dependentFieldValues?.["SI_SDT.BRANCH_CD"]?.value &&
                dependentFieldValues?.["SI_SDT.DR_ACCT_TYPE"]?.value
              ) {
                const postData = await API.getDebitAccountvalidation({
                  reqData,
                });
                let btn99, returnVal;

                const getButtonName = async (obj) => {
                  let btnName = await formState.MessageBox(obj);
                  return { btnName, obj };
                };

                for (let i = 0; i < postData.length; i++) {
                  if (postData[i]?.O_STATUS === "999") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    returnVal = "";
                  } else if (postData[i]?.O_STATUS === "99") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "CONFIRM",
                      buttonNames: ["Yes", "No"],
                    });
                    btn99 = btnName;
                    if (btnName === "No") {
                      returnVal = "";
                    }
                  } else if (postData[i]?.O_STATUS === "9") {
                    if (btn99 !== "No") {
                      const { btnName, obj } = await getButtonName({
                        messageTitle: postData[i]?.O_MSG_TITLE,
                        message: postData[i]?.O_MESSAGE,
                        icon: "WARNING",
                      });
                    }
                    returnVal = "";
                  } else if (postData[i]?.O_STATUS === "0") {
                    formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
                      ACCT_NM: dependentFieldValues?.["SI_SDT.ACCT_NM"]?.value,
                      BRANCH_CD: reqData?.DR_BRANCH_CD,
                      COMP_CD: authState?.companyID,
                      ACCT_TYPE: reqData?.DR_ACCT_TYPE,
                      ACCT_CD: reqData?.DR_ACCT_CD,
                      SCREEN_REF: reqData?.SCREEN_REF,
                    });
                    returnVal = postData[i];
                  }
                }
                btn99 = 0;

                return {
                  DR_ACCT_CD:
                    returnVal !== ""
                      ? {
                          value: utilFunction.getPadAccountNumber(
                            currentField?.value,
                            dependentFieldValues?.DR_ACCT_TYPE
                              ?.optionData?.[0] ?? {}
                          ),
                          ignoreUpdate: true,
                          isFieldFocused: false,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: true,
                        },
                  DR_ACCT_NM: {
                    value: returnVal?.DR_ACCT_NM,
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                };
              }
            },

            runPostValidationHookAlways: false,
            FormatProps: {
              isAllowed: (values) => {
                //@ts-ignore
                if (values?.value?.length > 20) {
                  return false;
                }
                return true;
              },
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DR_ACCT_NM",
          label: "Debit Account Name",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 5.5, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SI_AMOUNT",
          label: "SIAmount",
          placeholder: "",
          type: "text",
          dependentFields: [
            "SI_AMOUNT_PROTECT_FLAG",
            "BRANCH_CD",
            "DR_ACCT_TYPE",
            "DR_ACCT_CD",
            "COMM_TYPE_DESC",
          ],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (
              dependentFields?.["SI_SDT.SI_AMOUNT_PROTECT_FLAG"]?.value === "Y"
            ) {
              return true;
            }
          },
          FormatProps: {
            allowNegative: false,
          },

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (currentField?.readOnly === true) {
              return {};
            }

            if (currentField?.value) {
              const branchCd =
                dependentFieldValues?.["SI_SDT.BRANCH_CD"]?.value;
              const acctType =
                dependentFieldValues?.["SI_SDT.DR_ACCT_TYPE"]?.value;
              const acctCd = dependentFieldValues?.["SI_SDT.DR_ACCT_CD"]?.value;
              const commTypeDesc = dependentFieldValues?.COMM_TYPE_DESC?.value;

              if (!branchCd || !acctType || !acctCd || !commTypeDesc) {
                return {};
              }

              const reqParameters = {
                COMP_CD: authState?.companyID,
                BRANCH_CD: branchCd ?? "",
                ACCT_TYPE: acctType ?? "",
                ACCT_CD: acctCd ?? "",
                AMOUNT: currentField?.value ?? "",
                DEF_TRAN_CD: commTypeDesc ?? "",
                SCREEN_REF: formState?.docCd ?? "",
                ENT_BRANCH: authState?.user?.branchCode ?? "",
                BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
              };

              const postData = await API.getSiCharge(reqParameters);

              return {
                SI_CHARGE: {
                  value: postData ? postData[0]?.SI_CHARGE ?? "" : "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }

            return {};
          },

          required: true,
          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["SIAmountisRequired"] }],
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SI_CHARGE",
          label: "SI Charge",
          type: "text",
          FormatProps: {
            allowNegative: false,
          },
          dependentFields: ["FLAG_ENABLE_DISABLE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (
              dependentFields?.["SI_SDT.FLAG_ENABLE_DISABLE"]?.value === "Y"
            ) {
              return true;
            }
          },
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "DEF_TRAN_CD",
          label: "",
          type: "text",
          dependentFields: ["COMM_TYPE_DESC"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            return dependentFields?.COMM_TYPE_DESC?.value;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "COMP_CD",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remark",
          placeholder: "EnterRemark",
          type: "text",
          maxLength: 100,
          GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "VALID_UPTO",
          label: "ValidUpTo",
          placeholder: "selectValidUptoDate",
          required: true,
          // validationRun: "onChange",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ValidUptoDateisrequired"] }],
          },
          dependentFields: ["START_DT"],
          runPostValidationHookAlways: true,
          AlwaysRunPostValidationSetCrossFieldValues: {
            touchAndValidate: true,
            alwaysRun: true,
          },
          validate: (currentField, dependentField) => {
            if (
              utilFunction?.isValidDate(currentField?.value) &&
              utilFunction?.isValidDate(
                dependentField?.["SI_SDT.START_DT"]?.value
              )
            ) {
              const validUptoDate = currentField?.value
                ? new Date(currentField?.value)
                : "";
              const startDate = dependentField?.["SI_SDT.START_DT"]?.value
                ? new Date(dependentField?.["SI_SDT.START_DT"]?.value)
                : "";

              if (validUptoDate <= startDate) {
                return t("StartDateValidDateCompare");
              }
            }

            return "";
          },

          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
      ],
    },
  ],
};

export const StandingInstructionViewMetaData: any = {
  form: {
    name: "Standing Instruction Entry (TRN/394)",
    label: "",
    resetFieldOnUmnount: false,
    hideHeader: false,
    validationRun: "onBlur",
    submitAction: "home",
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
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "EXECUTE_DT",
      label: "ExecuteDate",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "PROCESS_DT",
      label: "ProcessDate",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SI_EXECUTE_FLG_DIS",
      label: "SIExecuteProcess",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SI_EXECUTE_FLG",
      label: "SIExecuteFLAG",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REASON",
      label: "Reason",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      name: "data",
      branchCodeMetadata: {
        label: "DebitBranchCode",
        name: "BRANCH_CD",
        isReadOnly: true,
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 6, sm: 6, md: 3, lg: 3, xl: 3 },
      },
      accountTypeMetadata: {
        label: "DebitAcctType",
        name: "DR_ACCT_TYPE",
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SIDRTYPE",
          });
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
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterBranchCode"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                DR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
            return {
              DR_ACCT_CD: { value: "", ignoreUpdate: false },
              DR_ACCT_NM: { value: "" },
            };
          }
        },
        _optionsKey: "debit_acct_type",
        GridProps: { xs: 6, sm: 6, md: 3, lg: 3, xl: 3 },
      },
      accountCodeMetadata: {
        label: "DebitAcctNo",
        name: "DR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        dependentFields: [
          "CR_BRANCH_CD",
          "CR_ACCT_CD",
          "CR_ACCT_TYPE",
          "BRANCH_CD",
          "EXECUTE_DAY",
          "DR_ACCT_TYPE",
          "DEF_TRAN_CD",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const reqData = {
            BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
            ACCT_CD: dependentFieldValues?.CR_ACCT_CD?.value ?? "",
            DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
            DR_ACCT_CD:
              utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ?? {}
              ) ?? "",
            DEF_TRAN_CD: dependentFieldValues?.DEF_TRAN_CD?.value ?? "",
            EXECUTE_DAY: dependentFieldValues?.EXECUTE_DAY?.value ?? "",
            SCREEN_REF: formState?.docCd ?? "",
            ENT_BRANCH: authState?.user?.branchCode ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };
          if (
            currentField.value &&
            dependentFieldValues?.DR_ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterAccountType"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                DR_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                DR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.DR_ACCT_TYPE?.value
          ) {
            const postData = await API.getDebitAccountvalidation({
              reqData,
            });

            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE,
                  message: postData[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE,
                  message: postData[i]?.O_MESSAGE,
                  icon: "CONFIRM",
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              DR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: currentField?.value
                        .padStart(6, "0")
                        ?.padEnd(20, " "),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
            };
          }
        },

        runPostValidationHookAlways: false,
        runValidationOnDependentFieldsChange: false,
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 6, sm: 6, md: 3, lg: 2, xl: 2 },
      },
    },
    {
      render: { componentType: "_accountNumber" },
      name: "data",
      branchCodeMetadata: {
        label: "CreditBranchCode",
        name: "CR_BRANCH_CD",
        isReadOnly: true,
        __EDIT__: { isReadOnly: true },
        GridProps: { xs: 6, sm: 6, md: 3, lg: 3, xl: 3 },
      },
      accountTypeMetadata: {
        label: "CreditAcctType",
        isReadOnly: true,
        name: "CR_ACCT_TYPE",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SICRTYPE",
          });
        },
        _optionsKey: "credit_acct_type",
        GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        label: "CreditAcctNo",
        name: "CR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        isReadOnly: true,
        dependentFields: [
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
          "DR_ACCT_CD",
          "DR_ACCT_TYPE",
          "DEF_TRAN_CD",
          "BRANCH_CD",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField.readOnly === false) {
            const reqData = {
              BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ?? {}
                ) ?? "",
              DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              EXECUTE_DAY: dependentFieldValues?.EXECUTE_DAY?.value ?? "",
              DR_ACCT_CD: dependentFieldValues?.DR_ACCT_CD?.value ?? "",
              DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
              DEF_TRAN_CD: dependentFieldValues?.DEF_TRAN_CD?.value ?? "",
              SCREEN_REF: formState?.docCd ?? "",
              ENT_BRANCH: authState?.user?.branchCode ?? "",
              BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };

            if (
              dependentFieldValues?.["CR_BRANCH_CD"]?.value &&
              dependentFieldValues?.["CR_ACCT_TYPE"]?.value
            ) {
              const postData = await API.getCreditAccountvalidation({
                reqData,
              });

              let btn99, returnVal;

              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };

              for (let i = 0; i < postData.length; i++) {
                if (postData[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                    message: postData?.MSG[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "99") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                    message: postData?.MSG[i]?.O_MESSAGE,
                    icon: "CONFIRM",
                    buttonNames: ["Yes", "No"],
                  });
                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
                  }
                } else if (postData[i]?.O_STATUS === "9") {
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                      message: postData?.MSG[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = postData[i];
                  } else {
                    returnVal = "";
                  }
                }
              }
              btn99 = 0;

              return {
                CR_ACCT_CD:
                  postData[0] !== ""
                    ? {
                        value: currentField?.value
                          .padStart(6, "0")
                          ?.padEnd(20, " "),
                        ignoreUpdate: true,
                        isFieldFocused: false,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                VALID_UPTO: {
                  value: postData[0]?.VALID_UPTO,
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
        },
        runValidationOnDependentFieldsChange: false,
        runPostValidationHookAlways: true,
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_AMOUNT",
      label: "SIAmount",
      placeholder: "",
      type: "text",
      dependentFields: [
        "DR_ACCT_TYPE",
        "DR_ACCT_CD",
        "DEF_TRAN_CD",
        "BRANCH_CD",
        "COMP_CD",
      ],
      fullWidth: true,
      FormatProps: {
        allowNegative: false,
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        // if(formState.isButtonClick !== "N")
        // {
        if (formState?.isSubmitting) return {};

        const reqParameters = {
          COMP_CD: dependentFieldValues?.["COMP_CD"]?.value,
          BRANCH_CD: dependentFieldValues?.["BRANCH_CD"]?.value,
          ACCT_TYPE: dependentFieldValues?.["DR_ACCT_TYPE"]?.value,
          ACCT_CD: dependentFieldValues?.["DR_ACCT_CD"]?.value,
          AMOUNT: currentField?.value,
          DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value,
          SCREEN_REF: formState?.docCd ?? "",
          ENT_BRANCH: authState?.user?.branchCode ?? "",
          BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
          WORKING_DATE: authState?.workingDate ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
        };

        const postData = await API.getSiCharge(reqParameters);
        return {
          SI_CHARGE: {
            value: postData ? postData[0]?.SI_CHARGE ?? "" : "",
            ignoreUpdate: true,
          },
          // };
        };
      },
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
      runPostValidationHookAlways: false,
      runValidationOnDependentFieldsChange: false,
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_CHARGE",
      label: "SICharge",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remark",
      fullWidth: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 6, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "populate",
      label: "Populate",
      placeholder: "",
      GridProps: { xs: 3, sm: 3, md: 1, lg: 1, xl: 1 },
      dependentFields: ["SI_EXECUTE_FLG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.SI_EXECUTE_FLG?.value === "N") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DEF_TRAN_CD",
      label: "HIDDEN FLAG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      label: "HIDDEN FLAG",
    },
  ],
};

export const siasExecute = {
  form: {
    name: "Consider SI as Executed",
    label: "ConsiderSIasExecuted",
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
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "EnterDebitBranchCode",
        name: "BRANCH_CD",
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 2.5 },
      },
      accountTypeMetadata: {
        label: "EnterDebitAccountType",
        name: "ACCT_TYPE",
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: formState?.docCd ?? "",
          });
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
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterBranchCode"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                BRANCH_CD: {
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
            return {
              ACCT_CD: { value: "", ignoreUpdate: false },
              ACCT_NM: { value: "" },
            };
          }
        },
        _optionsKey: "Debit_acct_type",
        GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 1.5 },
      },
      accountCodeMetadata: {
        label: "EnterDebitAccountNo",
        name: "ACCT_CD",
        autoComplete: "off",

        maxLength: 20,
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const reqParameters = {
            BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value,
            COMP_CD: authState?.companyID,
            ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value,
            ACCT_CD: utilFunction.getPadAccountNumber(
              currentField?.value,
              dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
            ),
            SCREEN_REF: formState?.docCd ?? "",
          };
          if (
            currentField.value &&
            dependentFieldValues?.ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterAccountType"),
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
          } else if (
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            let btn99, returnVal;

            for (let i = 0; i < postData?.MSG.length; i++) {
              if (postData?.MSG[i]?.O_STATUS === "999") {
                const btnName = await formState.MessageBox({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG[i]?.O_STATUS === "99") {
                const btnName = await formState.MessageBox({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "CONFIRM",
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.MSG[i]?.O_STATUS === "9") {
                const btnName = await formState.MessageBox({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              } else if (postData?.MSG[i]?.O_STATUS === "0") {
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
                        dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_NM: { value: postData.ACCT_NM || "" },
            };
          }
        },

        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "DebitAccountHolderName",
      isReadOnly: true,
      placeholder: "AccountName",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 6,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "SUBMIT",
      label: "Submit",
      rotateIcon: "scale(1.4)",
      type: "text",
      fullWidth: true,
      autoComplete: false,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
      },
    },
  ],
};

export const AddSubDataMetaData = {
  form: {
    name: "Standing Instruction Entry",
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
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      _accountNumber: {
        fullWidth: true,
      },
      arrayField: {
        fullWidth: true,
      },
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "CreditBranchCode",
        name: "CR_BRANCH_CD",
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        label: "CreditAcctType",
        name: "CR_ACCT_TYPE",
        dependentFields: ["CR_BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SICRTYPE",
          });
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (currentField?.value) {
            formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
              ACCT_TYPE: currentField?.value,
              BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
            });
          }
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.CR_BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterBranchCode"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                CR_BRANCH_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                CR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
            return {
              CR_ACCT_CD: { value: "", ignoreUpdate: false },
              CR_ACCT_NM: { value: "" },
            };
          }
        },
        _optionsKey: "credit_acct_type",
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        label: "CreditAcctNo",
        name: "CR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        dependentFields: [
          "DR_ACCT_CD",
          "DR_ACCT_TYPE",
          "DR_BRANCH_CD",
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
          "DEF_TRAN_CD",
          "CR_ACCT_NM",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const reqData = {
            BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_CD:
              utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ?? {}
              ) ?? "",
            DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
            EXECUTE_DAY: dependentFieldValues?.EXECUTE_DAY?.value ?? "",
            DR_ACCT_CD: dependentFieldValues?.DR_ACCT_CD?.value ?? "",
            DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
            DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
            SCREEN_REF: formState?.docCD ?? "",
            ENT_BRANCH: authState?.user?.branchCode ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };
          if (
            currentField.value &&
            dependentFieldValues?.CR_ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterAccountType"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                CR_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                CR_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            dependentFieldValues?.CR_BRANCH_CD?.value &&
            dependentFieldValues?.CR_ACCT_TYPE?.value
          ) {
            const postData = await API.getCreditAccountvalidation({ reqData });

            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE,
                  message: postData[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE,
                  message: postData[i]?.O_MESSAGE,
                  icon: "CONFIRM",
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
                  ACCT_NM: dependentFieldValues?.CR_ACCT_NM?.value,
                  BRANCH_CD: reqData?.BRANCH_CD,
                  COMP_CD: authState?.companyID,
                  ACCT_TYPE: reqData?.ACCT_TYPE,
                  ACCT_CD: reqData?.ACCT_CD,
                  SCREEN_REF: reqData?.SCREEN_REF,
                });
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              CR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ??
                          {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              SI_AMOUNT: {
                value: returnVal?.SI_AMOUNT ?? "",
              },
              SI_CHARGE: {
                value: returnVal?.SI_CHARGE ?? "",
              },
              FEQ_VALUE: {
                value: returnVal?.FEQ_VALUE ?? "",
              },
              EXECUTE_DAY: {
                value: returnVal?.EXECUTE_DAY ?? "",
              },
              FEQ_TYPE: {
                value: returnVal?.FEQ_TYPE ?? "",
              },
              SI_AMOUNT_PROTECT: {
                value: returnVal?.SI_AMOUNT_PROTECT ?? "",
              },
              FLAG_ENABLE_DISABLE: {
                value: returnVal?.FLAG_ENABLE_DISABLE ?? "",
              },
              START_DT: {
                value: returnVal?.START_DT ?? "",
              },
              VALID_UPTO: {
                value: returnVal?.VALID_UPTO ?? "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
              SI_AMOUNT_PROTECT_FLAG: {
                value: returnVal?.SI_AMOUNT_PROTECT ?? "",
              },

              CR_ACCT_NM: {
                value: returnVal?.CR_ACCT_NM,
              },
            };
          }
        },

        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CR_ACCT_NM",
      label: "Credit Account Name",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 5.5, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "START_DT",
      label: "StartDate",
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      required: true,
      isMaxWorkingDate: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["StartDateisrequired."] }],
      },
      validate: (currentField, dependentField, formstate) => {
        const parsedDate = formstate.authState?.workingDate
          ? parse(formstate?.authState?.workingDate, "d/MMM/yyyy", new Date())
          : "";
        const startDate = currentField?.value
          ? format(currentField?.value, "dd/MMM/yyyy")
          : "";

        const formattedDate = parsedDate
          ? format(parsedDate, "dd/MMM/yyyy")
          : "";

        if (
          utilFunction?.isValidDate(startDate) &&
          utilFunction?.isValidDate(formattedDate)
        ) {
          if (startDate !== formattedDate) {
            return t("CompareDate");
          }

          return "";
        }

        return "";
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "EXECUTE_DAY",
      label: "ExecuteOnDay",
      placeholder: "EnterExecuteOnDay",
      type: "text",
      fullWidth: true,
      required: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },
      dependentFields: [
        "DR_ACCT_TYPE",
        "BRANCH_CD",
        "CR_ACCT_CD",
        "CR_ACCT_TYPE",
        "CR_BRANCH_CD",
        "ENT_COMP_CD",
        "ENT_BRANCH_CD",
        "DEF_TRAN_CD",
        "EXECUTE_DAY",
        "START_DT",
      ],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value) {
          if (formState?.isSubmitting) return {};

          let postData = await API.validateSiExecuteDays({
            //@ts-ignore
            CR_ACCT_CD: dependentFieldsValues?.CR_ACCT_CD?.value,
            CR_ACCT_TYPE: dependentFieldsValues?.CR_ACCT_TYPE?.value,
            CR_COMP_CD: auth?.companyID ?? "",
            CR_BRANCH_CD: auth?.user?.branchCode ?? "",
            //@ts-ignore
            EXECUTE_DAY: field.value ?? "",
            START_DT: format(
              dependentFieldsValues?.START_DT?.value,
              "dd/MMM/yyyy"
            ),
            WORKING_DATE: auth?.workingDate ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage,
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
                EXECUTE_DAY: {
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
            }
          }
        }
      },

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("ExecuteOnDayisRequired")] }],
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "FEQ_TYPE",
      label: "FrequncyType",
      placeholder: "EnterFrequncyType",
      type: "text",
      options: [
        { label: "Day(s)", value: "D" },
        { label: "Month(s)", value: "M" },
        { label: "Quartely", value: "Q" },
        { label: "Half Yearly", value: "H" },
        { label: "Year(s)", value: "Y" },
      ],
      required: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("FrequencyTypeisRequired")] }],
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "FEQ_VALUE",
      label: "FrequencyValue",
      placeholder: "EnterFrequncyValue",
      type: "text",
      fullWidth: true,
      required: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
        isAllowed: (values) => {
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("FrequencyValueisRequired")] }],
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "DebitBranchCode",
        name: "BRANCH_CD",
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        label: "DebitAcctType",
        name: "DR_ACCT_TYPE",
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SIDRTYPE",
          });
        },
        _optionsKey: "debit_acct_type",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (currentField?.value) {
            formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA2", {
              ACCT_TYPE: currentField?.value,
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
            });
          }
        },
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        label: "DebitAcctNo",
        name: "DR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        dependentFields: [
          "DR_ACCT_TYPE",
          "BRANCH_CD",
          "CR_ACCT_CD",
          "DEF_TRAN_CD",
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
          "DR_ACCT_NM",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.DR_ACCT_TYPE?.value
          ) {
            const reqData = {
              BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
              ACCT_CD: dependentFieldValues?.CR_ACCT_CD.value ?? "",
              DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
              DR_ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ?? {}
                ) ?? "",
              DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
              EXECUTE_DAY: dependentFieldValues?.["EXECUTE_DAY"]?.value ?? "",
              SCREEN_REF: formState?.docCd ?? "",
              ENT_BRANCH: authState?.user?.branchCode ?? "",
              BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            const postData = await API.getDebitAccountvalidation({ reqData });
            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE,
                  message: postData[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE,
                  message: postData[i]?.O_MESSAGE,
                  icon: "CONFIRM",
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA2", {
                  ACCT_NM: dependentFieldValues?.DR_ACCT_NM?.value,
                  BRANCH_CD: reqData?.DR_BRANCH_CD,
                  COMP_CD: authState?.companyID,
                  ACCT_TYPE: reqData?.DR_ACCT_TYPE,
                  ACCT_CD: reqData?.DR_ACCT_CD,
                  SCREEN_REF: reqData?.SCREEN_REF,
                });
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              DR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ??
                          {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              DR_ACCT_NM: {
                value: returnVal?.DR_ACCT_NM,
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        },
        AlwaysRunPostValidationSetCrossFieldValues: {
          alwaysRun: true,
          touchAndValidate: false,
        },
        runPostValidationHookAlways: false,
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_ACCT_NM",
      label: "Debit Account Name",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 5.5, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_AMOUNT",
      label: "SIAmount",
      placeholder: "",
      type: "text",
      dependentFields: [
        "DR_ACCT_TYPE",
        "DR_ACCT_CD",
        "DEF_TRAN_CD",
        "BRANCH_CD",
        "COMP_CD",
        "SI_AMOUNT_PROTECT",
      ],

      FormatProps: {
        allowNegative: false,
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields.SI_AMOUNT_PROTECT.value === "Y") {
          return true;
        }
      },

      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (
          currentField.value &&
          dependentFieldValues?.BRANCH_CD?.value &&
          dependentFieldValues?.DR_ACCT_TYPE?.value
        ) {
          if (formState?.isSubmitting) return {};

          const reqParameters = {
            COMP_CD: dependentFieldValues?.["COMP_CD"]?.value ?? "",
            BRANCH_CD: dependentFieldValues?.["BRANCH_CD"]?.value ?? "",
            ACCT_TYPE: dependentFieldValues?.["DR_ACCT_TYPE"]?.value ?? "",
            ACCT_CD: dependentFieldValues?.["DR_ACCT_CD"]?.value ?? "",
            AMOUNT: currentField?.value ?? "",
            DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
            SCREEN_REF: formState?.docCd ?? "",
            ENT_BRANCH: authState?.user?.branchCode ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };
          const postData = await API.getSiCharge(reqParameters);
          return {
            SI_CHARGE: {
              value: postData ? postData[0]?.SI_CHARGE ?? "" : "",
              ignoreUpdate: true,
            },
          };
        }
      },
      required: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("SIAmountisRequired")] }],
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_CHARGE",
      label: "SICharge",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      dependentFields: ["FLAG_ENABLE_DISABLE"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields.FLAG_ENABLE_DISABLE.value === "Y") {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DEF_TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SI_AMOUNT_PROTECT",
      label: "Si_amount_protext",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FLAG_ENABLE_DISABLE",
      label: "FLAG_ENABLE_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      label: "compnay cd",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remark",
      placeholder: "EnterRemark",
      type: "text",
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "VALID_UPTO",
      label: "ValidUpTo",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("ValidUptoDateisrequired.")] }],
      },
      dependentFields: ["START_DT"],

      validate: (currentField, dependentField) => {
        if (
          utilFunction?.isValidDate(currentField?.value) &&
          utilFunction?.isValidDate(dependentField?.["START_DT"]?.value)
        ) {
        }
        const currentDate = currentField?.value
          ? format(new Date(currentField?.value), "dd/MM/yyyy")
          : "";
        const transactionDate = dependentField?.["START_DT"]?.value
          ? format(new Date(dependentField?.["START_DT"]?.value), "dd/MM/yyyy")
          : "";
        if (currentDate <= transactionDate) {
          return t("StartDateValidDateCompare");
        }
        if (transactionDate > currentDate) {
          return t("StartDateLessThanValidUpto");
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
  ],
};

export const EditSubDataMetaData = {
  form: {
    name: "",
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
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      _accountNumber: {
        fullWidth: true,
      },
      arrayField: {
        fullWidth: true,
      },
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "CreditBranchCode",
        name: "CR_BRANCH_CD",
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        isReadOnly: true,
      },
      accountTypeMetadata: {
        label: "CreditAcctType",
        name: "CR_ACCT_TYPE",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SICRTYPE",
          });
        },
        _optionsKey: "credit_acct_type",
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        isReadOnly: true,
      },
      accountCodeMetadata: {
        label: "CreditAcctNo",
        name: "CR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        isReadOnly: true,
        dependentFields: [
          "DR_ACCT_CD",
          "DR_ACCT_TYPE",
          "DR_BRANCH_CD",
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
          "DEF_TRAN_CD",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const reqData = {
            BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_CD:
              utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ?? {}
              ) ?? "",
            DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
            EXECUTE_DAY: dependentFieldValues?.EXECUTE_DAY?.value ?? "",
            DR_ACCT_CD: dependentFieldValues?.DR_ACCT_CD?.value ?? "",
            DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
            DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
            SCREEN_REF: formState?.docCd ?? "",
            ENT_BRANCH: authState?.user?.branchCode ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };

          if (
            dependentFieldValues?.CR_BRANCH_CD?.value &&
            dependentFieldValues?.CR_ACCT_TYPE?.value
          ) {
            const postData = await API.getCreditAccountvalidation({ reqData });

            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "CONFIRM",
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                    message: postData?.MSG[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              CR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.CR_ACCT_TYPE?.optionData?.[0] ??
                          {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              SI_AMOUNT: {
                value: returnVal?.SI_AMOUNT ?? "",
              },
              SI_CHARGE: {
                value: returnVal?.SI_CHARGE ?? "",
              },
              FEQ_VALUE: {
                value: returnVal?.FEQ_VALUE ?? "",
              },
              EXECUTE_DAY: {
                value: returnVal?.EXECUTE_DAY ?? "",
              },
              FEQ_TYPE: {
                value: returnVal?.FEQ_TYPE ?? "",
              },
              SI_AMOUNT_PROTECT: {
                value: returnVal?.SI_AMOUNT_PROTECT ?? "",
              },
              FLAG_ENABLE_DISABLE: {
                value: returnVal?.FLAG_ENABLE_DISABLE ?? "",
              },
            };
          }
        },

        runPostValidationHookAlways: false,

        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "START_DT",
      label: "StartDate",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      required: true,
      isReadOnly: true,
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "EXECUTE_DAY",
      label: "ExecuteOnDay",
      placeholder: "EnterExecuteOnDay",
      type: "text",
      fullWidth: true,
      required: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "FEQ_TYPE",
      label: "FrequncyType",
      placeholder: "EnterFrequncyType",
      type: "text",
      options: [
        { label: "Day(s)", value: "D" },
        { label: "Month(s)", value: "M" },
        { label: "Quartely", value: "Q" },
        { label: "Half Yearly", value: "H" },
        { label: "Year(s)", value: "Y" },
      ],
      required: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      isReadOnly: true,
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "FEQ_VALUE",
      label: "FrequencyValue",
      placeholder: "EnterFrequncyValue",
      type: "text",
      fullWidth: true,
      required: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "DebitBranchCode",
        name: "BRANCH_CD",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        label: "DebitAcctType",
        name: "DR_ACCT_TYPE",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "SIDRTYPE",
          });
        },
        _optionsKey: "debit_acct_type",
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
        isReadOnly: true,
      },
      accountCodeMetadata: {
        label: "DebitAcctNo",
        name: "DR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        isReadOnly: true,
        dependentFields: [
          "DR_ACCT_TYPE",
          "BRANCH_CD",
          "CR_ACCT_CD",
          "DEF_TRAN_CD",
          "CR_ACCT_TYPE",
          "CR_BRANCH_CD",
          "EXECUTE_DAY",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.DR_ACCT_TYPE?.value
          ) {
            const reqData = {
              BRANCH_CD: dependentFieldValues?.CR_BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.CR_ACCT_TYPE?.value ?? "",
              ACCT_CD: dependentFieldValues?.CR_ACCT_CD.value ?? "",
              DR_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
              DR_ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ?? {}
                ) ?? "",
              DEF_TRAN_CD: dependentFieldValues?.["DEF_TRAN_CD"]?.value ?? "",
              EXECUTE_DAY: dependentFieldValues?.["EXECUTE_DAY"]?.value ?? "",
              SCREEN_REF: formState?.docCd ?? "",
              ENT_BRANCH: authState?.user?.branchCode ?? "",
              BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            const postData = await API.getDebitAccountvalidation({ reqData });
            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                  message: postData?.MSG[i]?.O_MESSAGE,
                  icon: "CONFIRM",
                  buttonNames: ["Yes", "No"],
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                    message: postData?.MSG[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
            return {
              DR_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ??
                          {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
            };
          }
        },

        runPostValidationHookAlways: false,
        FormatProps: {
          isAllowed: (values) => {
            //@ts-ignore
            if (values?.value?.length > 20) {
              return false;
            }
            return true;
          },
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_AMOUNT",
      label: "SIAmount",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_CHARGE",
      label: "SICharge",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      dependentFields: ["FLAG_ENABLE_DISABLE"],
      isReadOnly: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DEF_TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SI_AMOUNT_PROTECT",
      label: "Si_amount_protext",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FLAG_ENABLE_DISABLE",
      label: "FLAG_ENABLE_DISABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      label: "compnay cd",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ORG",
      label: "ORG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SI_COUNT",
      label: "ORG",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remark",
      placeholder: "EnterRemark",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "VALID_UPTO",
      label: "ValidUpTo",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      required: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "DOC_STATUS",
      label: "Status",
      placeholder: "",
      fullWidth: true,
      dependentFields: ["ORG", "SI_COUNT"],
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (original?.SI_COUNT?.value > 0) {
          return false;
        } else {
          return true;
        }
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields.ORG.value !== "Y") {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
    },
  ],
};
