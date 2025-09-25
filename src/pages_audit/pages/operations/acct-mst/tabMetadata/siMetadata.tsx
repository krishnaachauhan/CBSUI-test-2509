import { utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "../api";
import { format, parse } from "date-fns";
import i18n from "components/multiLanguage/languagesConfiguration";
export const si_metadata = {
  form: {
    name: "si_tab_form",
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
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        label: "DrBranch",
        name: "DR_BRANCH_CD",
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        label: "DrType",
        name: "DR_ACCT_TYPE",
        dependentFields: ["DR_BRANCH_CD"],
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
            dependentFieldValues?.DR_BRANCH_CD?.value?.length === 0
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
        label: "DrAcNo",
        name: "DR_ACCT_CD",
        autoComplete: "off",
        maxLength: 20,
        dependentFields: [
          "DR_ACCT_TYPE",
          "DR_BRANCH_CD",
          "ENT_COMP_CD",
          "ENT_BRANCH_CD",
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
            BRANCH_CD: formState?.BRANCH_CD ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
            ACCT_CD: formState?.ACCT_CD ?? "",
            DR_BRANCH_CD: dependentFieldValues?.DR_BRANCH_CD?.value ?? "",
            DR_ACCT_TYPE: dependentFieldValues?.DR_ACCT_TYPE?.value ?? "",
            DR_ACCT_CD:
              utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.DR_ACCT_TYPE?.optionData?.[0] ?? {}
              ) ?? "",
            DEF_TRAN_CD: "",
            EXECUTE_DAY: dependentFieldValues?.EXECUTE_DAY?.value ?? "",
            SCREEN_REF: formState?.docCD ?? "",
            ENT_BRANCH: authState?.user?.branchCode ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };
          if (
            currentField?.value &&
            dependentFieldValues?.DR_BRANCH_CD?.value?.length === 0
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
            dependentFieldValues?.DR_BRANCH_CD?.value &&
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
      label: "DrAccountName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SI_AMOUNT",
      label: "SIAmount",
      placeholder: "",
      type: "text",
      dependentFields: ["DR_BRANCH_CD", "DR_ACCT_TYPE", "DR_ACCT_CD"],
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
          const branchCd = dependentFieldValues?.DR_BRANCH_CD?.value;
          const acctType = dependentFieldValues?.DR_ACCT_TYPE?.value;
          const acctCd = dependentFieldValues?.DR_ACCT_CD?.value;
          if (!branchCd || !acctType || !acctCd) {
            return {};
          }

          const reqParameters = {
            COMP_CD: authState?.companyID,
            BRANCH_CD: branchCd ?? "",
            ACCT_TYPE: acctType ?? "",
            ACCT_CD: acctCd ?? "",
            AMOUNT: currentField?.value ?? "",
            DEF_TRAN_CD: "",
            SCREEN_REF: formState?.docCD ?? "",
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
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
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
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "START_DT",
      label: "StartDate",
      fullWidth: true,
      dateFormat: "dd/MMM/yyyy",
      placeholder: "selectStartDate",
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("StartDateisrequired")] }],
      },
      runPostValidationHookAlways: true,
      validate: (currentField, dependentField, formstate) => {
        const parsedDate = formstate.authState?.workingDate
          ? parse(formstate?.authState?.workingDate, "d/MMM/yyyy", new Date())
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
        "DR_BRANCH_CD",
        "ENT_COMP_CD",
        "ENT_BRANCH_CD",
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
        const CR_ACCT_CD = formState?.ACCT_CD ?? "";
        const CR_ACCT_TYPE = formState?.ACCT_TYPE ?? "";
        const START_DT = dependentFieldsValues?.START_DT?.value;
        if (!CR_ACCT_TYPE || !START_DT || !field.value) {
          return {};
        }

        if (formState?.isSubmitting) return {};
        const reqData = {
          CR_ACCT_CD: CR_ACCT_CD,
          CR_ACCT_TYPE: CR_ACCT_TYPE,
          CR_COMP_CD: auth?.companyID ?? "",
          CR_BRANCH_CD: formState?.BRANCH_CD ?? "",
          EXECUTE_DAY: field.value ?? "",
          START_DT: format(START_DT, "dd/MMM/yyyy"),
          WORKING_DATE: auth?.workingDate ?? "",
          DISPLAY_LANGUAGE: i18n.resolvedLanguage,
        };
        let postData = await API.validateSiExecuteDays({ reqData });

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
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
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
      validate: (currentField, dependentField) => {
        if (
          utilFunction?.isValidDate(currentField?.value) &&
          utilFunction?.isValidDate(dependentField?.START_DT?.value)
        ) {
          const validUptoDate = currentField?.value
            ? new Date(currentField?.value)
            : "";
          const startDate = dependentField?.START_DT?.value
            ? new Date(dependentField?.START_DT?.value)
            : "";
          if (validUptoDate <= startDate) {
            return t("StartDateValidDateCompare");
          }
        }
        return "";
      },

      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FEQ_TYPE",
      label: "InstallmentType",
      placeholder: "SelectInstallmentTypePlaceHolder",
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
        rules: [{ name: "required", params: ["InstallmentTypeisrequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
      isReadOnly: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      __NEW__: {
        defaultValue: (formState, authState) => {
          return authState?.companyID ?? "";
        },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DR_COMP_CD",
      __NEW__: {
        defaultValue: (formState, authState) => {
          return authState?.companyID ?? "";
        },
      },
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
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
