import { GeneralAPI } from "registry/fns/functions";
import * as API from "../api";
import { t } from "i18next";
import { isValid } from "date-fns";
import { greaterThanDate, utilFunction } from "@acuteinfo/common-base";
import i18n from "components/multiLanguage/languagesConfiguration";
import { validateHOBranch } from "components/utilFunction/function";

export const ChequeBookEntryMetaData = {
  form: {
    name: "Cheque-book-entry",
    label: " ",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 3,
          md: 3,
        },
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
      select: {
        fullWidth: true,
      },
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
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2.5,
          lg: 2,
          xl: 2,
        },

        isReadOnly: (fieldValue, dependent, formState) => {
          if (formState?.isEditableBranch?.[0]?.ALLOW_INTER_BRANCH === "Y") {
            return false;
          }
          return true;
        },

        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
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
          if (field.value) {
            return {
              ACCT_TYPE: { value: "", isFieldFocused: true },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              ACCT_BAL: { value: "" },
              CHEQUE_FROM: { value: "" },
              CHEQUE_TO: { value: "" },
              SERVICE_TAX: { value: "" },
              GST: { value: "" },
              CHEQUE_TOTAL: { value: "" },
              AMOUNT: { value: "" },
              TOOLBAR_DTL: { value: "" },
              SR_CD: { value: "" },
              MAX_CHEQUE_NO: { value: "" },
              NEW_LEAF_ARR: { value: "" },
            };
          } else if (!field.value) {
            formState.setDataOnFieldChange("DTL_TAB", { DTL_TAB: false });
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              ACCT_BAL: { value: "" },
              CHEQUE_FROM: { value: "" },
              CHEQUE_TO: { value: "" },
              SERVICE_TAX: { value: "" },
              GST: { value: "" },
              CHEQUE_TOTAL: { value: "" },
              AMOUNT: { value: "" },
              TOOLBAR_DTL: { value: "" },
              SR_CD: { value: "" },
              MAX_CHEQUE_NO: { value: "" },
              NEW_LEAF_ARR: { value: "" },
              STATUS: { value: "" },
            };
          }
        },
        placeholder: "BranchCodePlaceHolder",
        runPostValidationHookAlways: true,
      },
      accountTypeMetadata: {
        validationRun: "all",
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2.5,
          lg: 2,
          xl: 2,
        },

        isFieldFocused: true,
        disableCaching: true,
        dependentFields: ["BRANCH_CD"],
        options: (dependent, formState, _, authState) => {
          if (dependent?.BRANCH_CD?.value) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD: dependent?.BRANCH_CD?.value,
              USER_NAME: authState?.user?.id,
              DOC_CD: formState?.docCD,
            });
          }
          return [];
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: (field, formState) => {
          formState.setDataOnFieldChange("DTL_TAB", { DTL_TAB: false });
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            ACCT_BAL: { value: "" },
            CHEQUE_FROM: { value: "" },
            CHEQUE_TO: { value: "" },
            SERVICE_TAX: { value: "" },
            GST: { value: "" },
            CHEQUE_TOTAL: { value: "" },
            AMOUNT: { value: "" },
            TOOLBAR_DTL: { value: "" },
            SR_CD: { value: "" },
            MAX_CHEQUE_NO: { value: "" },
            NEW_LEAF_ARR: { value: "" },
            STATUS: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
      },
      accountCodeMetadata: {
        // disableCaching: true,
        placeholder: "AccountNumberPlaceHolder",
        render: {
          componentType: "textField",
        },
        GridProps: {
          xs: 12,
          sm: 5,
          md: 3,
          lg: 2.5,
          xl: 2.5,
        },

        validate: (columnValue) => {
          let regex = /^[^!&]*$/;
          if (!regex.test(columnValue.value)) {
            return "Special Characters (!, &) not Allowed";
          }
          return "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (
            field?.value &&
            dependentValue?.BRANCH_CD?.value &&
            dependentValue?.ACCT_TYPE?.value
          ) {
            let otherAPIRequestPara = {
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              SCREEN_REF: formState?.docCD,
            };

            let postData = await API.getChequebookData({ otherAPIRequestPara });
            formState.setDataOnFieldChange("DTL_TAB", {
              DTL_TAB:
                postData.some((item) => item["O_STATUS"] === "0") ?? false,
            });

            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };

            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE
                    ? postData[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData[i]?.O_MSG_TITLE
                    ? postData[i]?.O_MSG_TITLE
                    : "confirmation",
                  message: postData[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE
                      ? postData[i]?.O_MSG_TITLE
                      : "Alert",
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
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentValue?.ACCT_TYPE?.optionData?.[0]
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_CD_COPY: { value: field?.value },
              CHEQUE_TOTAL: {
                value: "",
                isFieldFocused: returnVal !== "",
              },
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
              },
              ACCT_BAL: {
                value: returnVal?.ACCT_BAL ?? "",
              },
              CHEQUE_FROM: {
                value: returnVal?.CHEQUE_FROM ?? "",
                isFieldFocused: returnVal.AUTO_CHQBK_FLAG === "N",
              },
              NEW_LEAF_ARR: {
                value: returnVal?.LEAF_ARR ?? "",
              },
              AUTO_CHQBK_FLAG: {
                value: returnVal?.AUTO_CHQBK_FLAG ?? "",
              },
              JOINT_NAME_1: {
                value: returnVal?.JOINT_NAME_1 ?? "",
              },
              JOINT_NAME_2: {
                value: returnVal?.JOINT_NAME_2 ?? "",
              },
              SR_CD: {
                value: returnVal?.SR_CD ?? "",
              },
              STATUS: {
                value: returnVal?.STATUS ?? "",
              },
              MAX_CHEQUE_NO: {
                value: returnVal?.MAX_CHEQUE_NO ?? "",
              },
              PER_CHQ_ALLOW: {
                value: returnVal?.PER_CHQ_ALLOW ?? "",
              },
              TRAN_DT: {
                value: authState?.workingDate ?? "",
              },
              SERVICE_TAX: { value: "" },
              AMOUNT: { value: "" },
              NO_OF_CHQBK: { value: "1" },

              TOOLBAR_DTL: {
                value:
                  returnVal !== ""
                    ? `${t("NoOfchequebookIssued")} = ${
                        returnVal?.NO_CHEQUEBOOK_ISSUE
                      } \u00A0\u00A0\u00A0\u00A0 ${t("TotalChequeIssued")} = ${
                        returnVal?.TOTAL_NO_CHEQUE_ISSUED
                      } \u00A0\u00A0\u00A0\u00A0 ${t("NoOfChequeUsed")} = ${
                        returnVal?.NO_CHEQUE_USED
                      } \u00A0\u00A0\u00A0\u00A0 ${t("NoOfChequeStop")} = ${
                        returnVal?.NO_CHEQUE_STOP
                      } \u00A0\u00A0\u00A0\u00A0 ${t(
                        "NoOfChequeSurrender"
                      )} = ${
                        returnVal?.NO_CHEQUE_SURRENDER
                      } \u00A0\u00A0\u00A0\u00A0 ${t("NoOfUnusedCheque")} = ${
                        returnVal?.NO_OF_CHEQUE_UNUSED
                      }`
                    : "",
              },
            };
          } else if (!field?.value) {
            formState.setDataOnFieldChange("DTL_TAB", { DTL_TAB: false });
            return {
              ACCT_NM: { value: "" },
              ACCT_BAL: { value: "" },
              CHEQUE_FROM: { value: "" },
              CHEQUE_TO: { value: "" },
              SERVICE_TAX: { value: "" },
              CHEQUE_TOTAL: { value: "" },
              AMOUNT: { value: "" },
              TOOLBAR_DTL: { value: "" },
              JOINT_NAME_1: { value: "" },
              JOINT_NAME_2: { value: "" },
              NEW_LEAF_ARR: { value: "" },
              SR_CD: { value: "" },
              MAX_CHEQUE_NO: { value: "" },
              STATUS: { value: "" },
            };
          }

          return {};
        },
        runPostValidationHookAlways: true,
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
      GridProps: {
        xs: 12,
        sm: 4,
        md: 4,
        lg: 3.5,
        xl: 3.5,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "ACCT_BAL",
      label: "Balance",
      FormatProps: {
        allowNegative: true,
      },
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      isReadOnly: true,
      // dependentFields: ["AMOUNT", "NO_OF_CHQBK"],
      // runValidationOnDependentFieldsChange: true,
      // validate: (currentField, dependentFields, formState) => {
      //   if (
      //     Number(dependentFields.AMOUNT.value) *
      //       Number(dependentFields.NO_OF_CHQBK.value) >
      //     Number(currentField.value)
      //   ) {
      //     return t("BalanceIsLesThanServicecharge");
      //   }
      //   return "";
      // },
      GridProps: {
        xs: 12,
        sm: 3,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_FROM",
      label: "FromChequeNo",
      required: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      dependentFields: ["AUTO_CHQBK_FLAG"],
      FormatProps: {
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          const text = values?.value;
          const numericLength = text.match(/\d+/)?.[0]?.length || 0;

          if (numericLength > 10) {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: () => {
        return {
          CHEQUE_TOTALS: { value: "" },
          CHEQUE_TO: { value: "" },
        };
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
          return false;
        }
        return true;
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CHEQUE_TOTAL",
      label: "NoOfCheques",
      placeholder: "SelectNoOfChequeBook",
      required: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["NoOfChequesIsRequired"] }],
      },
      dependentFields: [
        "CHEQUE_FROM",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "NEW_LEAF_ARR",
        "AUTO_CHQBK_FLAG",
        "SR_CD",
        "MAX_CHEQUE_NO",
      ],
      disableCaching: true,
      options: (dependentValue) => {
        let newDD = dependentValue?.NEW_LEAF_ARR?.value;
        if (newDD) {
          newDD = newDD.split(",").map((item) => ({
            label: item,
            value: item,
          }));
          return newDD;
        }
        return [];
      },
      _optionsKey: "getChequebookDataDD",

      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value && dependentFieldsValues.ACCT_CD.value) {
          let Apireq = {
            A_COMP_CD: auth?.companyID,
            A_BRANCH_CD: dependentFieldsValues.BRANCH_CD.value,
            A_ACCT_TYPE: dependentFieldsValues.ACCT_TYPE.value,
            A_ACCT_CD: dependentFieldsValues.ACCT_CD.value,
            A_NO_OF_LEAVES: field.value,
            A_CHQ_FROM: dependentFieldsValues.CHEQUE_FROM.value,
            A_AUTO_CHQBK_FLAG: dependentFieldsValues.AUTO_CHQBK_FLAG.value,
            WORKING_DATE: auth?.workingDate,
            A_ENT_COMP: auth?.companyID,
            A_ENT_BRANCH: dependentFieldsValues.BRANCH_CD.value,
            DISPLAY_LANGUAGE: i18n.resolvedLanguage,
            A_SR_CD: dependentFieldsValues.SR_CD.value,
            A_MAX_CHEQUE_NO: dependentFieldsValues.MAX_CHEQUE_NO.value,
          };
          let postdata = await API.chequebookCharge(Apireq);

          return {
            SERVICE_C_FLAG: {
              value: postdata?.[0]?.FLAG_ENABLE_DISABLE ?? "",
            },
            ROUND_OFF_FLAG: {
              value: postdata?.[0]?.GST_ROUND ?? "",
            },
            GST: {
              value: postdata?.[0]?.TAX_RATE ?? "",
            },
            AMOUNT: {
              value: postdata?.[0]?.SERVICE_CHRG ?? "",
              isFieldFocused: postdata?.[0]?.FLAG_ENABLE_DISABLE === "N",
            },

            SERVICE_TAX: {
              value: postdata?.[0]?.GST_AMT,
            },

            CHEQUE_FROM: {
              value: postdata?.[0]?.CHEQUE_FROM,
              ignoreUpdate: true,
            },
            CHEQUE_TO: { value: postdata?.[0]?.CHEQUE_TO },
            SR_CD: { value: postdata?.[0]?.SR_CD },
          };
        }
        return {};
      },
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
          return true;
        } else {
          return false;
        }
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_TOTALS",
      label: "NoOfCheques",
      placeholder: "SelectNoOfChequeBook",
      required: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["NoOfChequesIsRequired"] }],
      },
      FormatProps: {
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          const text = values?.value;
          const numericLength = text.match(/\d+/)?.[0]?.length || 0;

          if (numericLength > 4) {
            return false;
          }
          return true;
        },
      },
      dependentFields: [
        "CHEQUE_FROM",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "AUTO_CHQBK_FLAG",
        "SR_CD",
        "MAX_CHEQUE_NO",
      ],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (
          field.value &&
          dependentFieldsValues.ACCT_CD.value &&
          dependentFieldsValues.CHEQUE_FROM.value
        ) {
          let Apireq = {
            A_COMP_CD: auth?.companyID,
            A_BRANCH_CD: dependentFieldsValues.BRANCH_CD.value,
            A_ACCT_TYPE: dependentFieldsValues.ACCT_TYPE.value,
            A_ACCT_CD: dependentFieldsValues.ACCT_CD.value,
            A_NO_OF_LEAVES: field.value,
            A_CHQ_FROM: dependentFieldsValues.CHEQUE_FROM.value,
            A_AUTO_CHQBK_FLAG: dependentFieldsValues.AUTO_CHQBK_FLAG.value,
            WORKING_DATE: auth?.workingDate,
            A_ENT_COMP: auth?.companyID,
            A_ENT_BRANCH: dependentFieldsValues.BRANCH_CD.value,
            DISPLAY_LANGUAGE: i18n.resolvedLanguage,
            A_SR_CD: dependentFieldsValues.SR_CD.value,
            A_MAX_CHEQUE_NO: dependentFieldsValues.MAX_CHEQUE_NO.value,
          };
          let postdata = await API.chequebookCharge(Apireq);

          return {
            SERVICE_C_FLAG: {
              value: postdata?.[0]?.FLAG_ENABLE_DISABLE ?? "",
            },
            ROUND_OFF_FLAG: {
              value: postdata?.[0]?.GST_ROUND ?? "",
            },
            GST: {
              value: postdata?.[0]?.TAX_RATE ?? "",
            },
            AMOUNT: {
              value: postdata?.[0]?.SERVICE_CHRG ?? "",
              isFieldFocused: postdata?.[0]?.FLAG_ENABLE_DISABLE === "N",
            },

            SERVICE_TAX: {
              value: postdata?.[0]?.GST_AMT,
            },
            CHEQUE_FROM: {
              value: postdata?.[0]?.CHEQUE_FROM,
              ignoreUpdate: true,
            },
            CHEQUE_TO: { value: postdata?.[0]?.CHEQUE_TO },
            SR_CD: { value: postdata?.[0]?.SR_CD },
          };
        }
        return {};
      },
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
          return false;
        } else {
          return true;
        }
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CHEQUE_TO",
      label: "ToChequeNo",
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
          background: "var(--theme-color7)",
        },
      },
      isReadOnly: true,
      GridProps: {
        sm: 2.5,
        xs: 12,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "ServiceCharge",
      placeholder: "ServiceCharge",
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 7 || values?.value === "-") {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["SERVICE_C_FLAG", "ROUND_OFF_FLAG", "GST", "ACCT_TYPE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.SERVICE_C_FLAG?.value === "N") {
          return false;
        } else {
          return true;
        }
      },
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFields
      ) => {
        if (field.value) {
          return {
            SERVICE_TAX: {
              value:
                dependentFields?.ROUND_OFF_FLAG?.value === "3"
                  ? Math.floor(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.GST?.value)) /
                        100
                    ) ?? ""
                  : dependentFields?.ROUND_OFF_FLAG?.value === "2"
                  ? Math.ceil(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.GST?.value)) /
                        100
                    ) ?? ""
                  : dependentFields?.ROUND_OFF_FLAG?.value === "1"
                  ? Math.round(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.GST?.value)) /
                        100
                    ) ?? ""
                  : (parseInt(field?.value) *
                      parseInt(dependentFields?.GST?.value)) /
                    100,
            },
          };
        } else if (!field.value) {
          return {
            SERVICE_TAX: { value: "" },
          };
        }
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX",
      label: "GST",
      FormatProps: {
        allowNegative: false,
      },
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "NO_OF_CHQBK",
      label: "NoOfChequeBooks",
      placeholder: "EnterNoOfChequeBooks",
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      defaultValue: "1",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["NoOfChequebooksIsRequired"] }],
      },
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 2 || values?.value === "0") {
            return false;
          }
          return true;
        },
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["AUTO_CHQBK_FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
          return true;
        } else {
          return false;
        }
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "PAYABLE_AT_PAR",
      label: "PayableAtPAR",
      placeholder: "SelectPayableAtPAR",
      defaultValue: "Y",
      options: () => {
        return [
          { value: "Y", label: "Yes" },
          { value: "N", label: "No" },
        ];
      },
      _optionsKey: "PAYABLE_AT_PAR",
      type: "text",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["AUTO_CHQBK_FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
          return true;
        } else {
          return false;
        }
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "CHARACTERISTICS",
      label: "Characteristics",
      placeholder: "SelectCharacteristics",
      type: "text",
      defaultValue: "B",
      options: () => {
        return [
          { value: "B", label: "Bearer" },
          { value: "O", label: "Order" },
        ];
      },
      _optionsKey: "CHARACTERISTICS",
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },

      dependentFields: ["AUTO_CHQBK_FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REQUISITION_DT",
      label: "RequisitionDate",
      isMaxWorkingDate: true,
      isWorkingDate: true,
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "RequisitionDateIsRequired";
        } else if (
          greaterThanDate(value?.value, value?._maxDt, {
            ignoreTime: true,
          })
        ) {
          return t("RequistionDtShouldBeLessThanOrEqualWorkingDt");
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "Remark",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemarks",
      GridProps: {
        xs: 12,
        sm: 7,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },
    // {
    //   render: {
    //     componentType: "spacer",
    //   },
    //   name: "SPACER",
    //   dependentFields: ["AUTO_CHQBK_FLAG"],
    //   shouldExclude(fieldData, dependentFields) {
    //     if (dependentFields?.AUTO_CHQBK_FLAG?.value === "N") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: {
    //     xs: 12,
    //     md: 2,
    //     sm: 2,
    //     lg: 2,
    //     xl: 2,
    //   },
    // },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalServiceCharge",
      isReadOnly: true,
      dependentFields: ["AMOUNT", "NO_OF_CHQBK", "ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.AMOUNT?.value) *
          Number(dependentFields?.NO_OF_CHQBK?.value);

        return value ?? "--";
      },
      shouldExclude(fieldData, dependentFields) {
        if (Number(dependentFields?.NO_OF_CHQBK?.value) > 1) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_SEVICE_TAX",
      label: "TotalGSTAmount",
      isReadOnly: true,
      dependentFields: ["SERVICE_TAX", "NO_OF_CHQBK", "ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.SERVICE_TAX?.value) *
          Number(dependentFields?.NO_OF_CHQBK?.value);

        return value ?? "--";
      },
      shouldExclude(fieldData, dependentFields) {
        if (Number(dependentFields?.NO_OF_CHQBK?.value) > 1) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "JOINT_NAME_1",
      label: "JointAccountName1",
      isReadOnly: true,
      type: "text",
      shouldExclude(fieldData) {
        if (fieldData?.value) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 7,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "JOINT_NAME_2",
      label: "JointAccountName2",
      isReadOnly: true,
      type: "text",
      shouldExclude(fieldData) {
        if (fieldData?.value) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 7,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "TOOLBAR_DTL",
      label: "",
      isReadOnly: true,
      multiline: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          WebkitTextFillColor: "rgb(255, 255, 255) !important",
          fontSize: "15px",
        },
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          boxShadow:
            "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
        },
      },
      shouldExclude(fieldData) {
        if (fieldData?.value) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        lg: 12,
        xl: 12,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "SERVICE_C_FLAG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "GST",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ROUND_OFF_FLAG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SR_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MAX_CHEQUE_NO",
    },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "AUTO_CHQBK_FLAG",
    // },
    {
      render: {
        componentType: "hidden",
      },
      name: "NEW_LEAF_ARR",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PER_CHQ_ALLOW",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "STATUS",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FLAG",
    },

    {
      render: {
        componentType: "textField",
      },
      name: "AUTO_CHQBK_FLAG",
      label: "AutoIssueFlag",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.FLAG?.value === "C") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      fullWidth: true,
      label: "IssueDate",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.FLAG?.value === "C") {
          return false;
        } else {
          return true;
        }
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ENTERED_BY",
      label: "EnteredBy",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.FLAG?.value === "C") {
          return false;
        } else {
          return true;
        }
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "VERIFIED_BY",
      fullWidth: true,
      label: "VerifiedBy",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields) {
        if (dependentFields?.FLAG?.value === "C") {
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
      name: "ACCT_CD_COPY",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TEMP",
      dependentFields: ["ACCT_CD", "ACCT_TYPE", "ACCT_CD_COPY"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields?.ACCT_CD?.value;
      },
      validationRun: "all",
      postValidationSetCrossFieldValues: (
        field,
        formState,
        auth,
        dependentFields
      ) => {
        let acctNo = utilFunction.getPadAccountNumber(
          dependentFields?.ACCT_CD_COPY?.value,
          dependentFields?.ACCT_TYPE?.optionData?.[0]
        );
        if (
          dependentFields?.ACCT_CD?.value &&
          acctNo &&
          acctNo != dependentFields?.ACCT_CD?.value
        ) {
          formState.setDataOnFieldChange("DTL_TAB", { DTL_TAB: false });
        } else if (acctNo == dependentFields?.ACCT_CD?.value) {
          formState.setDataOnFieldChange("DTL_TAB", { DTL_TAB: true });
        }
      },
    },
  ],
};
