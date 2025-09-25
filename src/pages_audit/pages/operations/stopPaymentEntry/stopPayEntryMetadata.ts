import { utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { t } from "i18next";
import { isValid } from "date-fns";
import { validateHOBranch } from "components/utilFunction/function";

export const StopPayEntryMetadata = {
  form: {
    name: "Cheque-stop-entry",
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
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
          if (field?.value) {
            if (formState?.isSubmitting) return {};
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
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              CHEQUE_FROM: { value: "" },
              CHEQUE_TO: { value: "" },
              AMOUNT: { value: "" },
              SERVICE_TAX: { value: "" },
              CHEQUE_DT: { value: "" },
              CHEQUE_AMOUNT: { value: "" },
            };
          } else if (!field.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              CHEQUE_FROM: { value: "" },
              CHEQUE_TO: { value: "" },
              AMOUNT: { value: "" },
              SERVICE_TAX: { value: "" },
              CHEQUE_DT: { value: "" },
              CHEQUE_AMOUNT: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2.5,
          lg: 2,
          xl: 2,
        },
      },
      accountTypeMetadata: {
        validationRun: "all",
        isFieldFocused: true,
        disableCaching: true,
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          if (dependentValue?.BRANCH_CD?.value) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              USER_NAME: authState?.user?.id,
              DOC_CD: formState?.docCD,
            });
          }
          return [];
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: (field, formState) => {
          formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            TRAN_BAL: { value: "" },
            CHEQUE_FROM: { value: "" },
            CHEQUE_TO: { value: "" },
            AMOUNT: { value: "" },
            SERVICE_TAX: { value: "" },
            CHEQUE_DT: { value: "" },
            CHEQUE_AMOUNT: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2.5,
          lg: 2,
          xl: 2,
        },
      },
      accountCodeMetadata: {
        inputProps: {
          onInput: (event) => {
            if (event.target.value.length > 20) {
              return;
            }
          },
        },
        maxLength: 20,
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
              COMP_CD: authState?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              GD_TODAY_DT: authState?.workingDate,
              SCREEN_REF: formState?.docCD,
            };
            let postData = await GeneralAPI.getAccNoValidation(
              otherAPIRequestPara
            );
            let apiRespMSGdata = postData?.MSG;
            let isReturn;
            const messagebox = async (
              msgTitle,
              msg,
              buttonNames,
              status,
              icon
            ) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon: icon,
              });
              return { buttonName, status };
            };
            if (apiRespMSGdata?.length) {
              for (let i = 0; i < apiRespMSGdata?.length; i++) {
                if (apiRespMSGdata[i]?.O_STATUS !== "0") {
                  let btnName = await messagebox(
                    apiRespMSGdata[i]?.O_MSG_TITLE
                      ? apiRespMSGdata[i]?.O_MSG_TITLE
                      : apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ValidationFailed"
                      : apiRespMSGdata[i]?.O_STATUS === "99"
                      ? "confirmation"
                      : "ALert",
                    apiRespMSGdata[i]?.O_MESSAGE,
                    apiRespMSGdata[i]?.O_STATUS === "99"
                      ? ["Yes", "No"]
                      : ["Ok"],
                    apiRespMSGdata[i]?.O_STATUS,
                    apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ERROR"
                      : apiRespMSGdata[i]?.O_STATUS === "99"
                      ? "CONFIRM"
                      : "WARNING"
                  );

                  if (btnName.buttonName === "No" || btnName.status === "999") {
                    formState.setDataOnFieldChange("IS_VISIBLE", {
                      IS_VISIBLE: false,
                    });
                    return {
                      ACCT_CD: { value: "", isFieldFocused: true },
                      ACCT_NM: { value: "" },
                      TRAN_BAL: { value: "" },
                    };
                  } else {
                    formState.setDataOnFieldChange("IS_VISIBLE", {
                      IS_VISIBLE: true,
                    });
                    isReturn = true;
                  }
                } else {
                  formState.setDataOnFieldChange("IS_VISIBLE", {
                    IS_VISIBLE: true,
                  });
                  isReturn = true;
                }
              }
            }
            if (Boolean(isReturn)) {
              return {
                ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    field?.value,
                    dependentValue?.ACCT_TYPE?.optionData?.[0]
                  ),
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },
                ACCT_CD_COPY: { value: field?.value },
                ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
                TRAN_BAL: {
                  value: postData?.TRAN_BAL ?? "",
                },
              };
            }
          } else if (!field?.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              CHEQUE_FROM: { value: "" },
              CHEQUE_TO: { value: "" },
              AMOUNT: { value: "" },
              SERVICE_TAX: { value: "" },
              CHEQUE_DT: { value: "" },
              CHEQUE_AMOUNT: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 3,
          lg: 2.5,
          xl: 2.5,
        },
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
        sm: 5,
        md: 4,
        lg: 3.5,
        xl: 3.5,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Balance",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "select",
      },
      name: "FLAG",
      label: "ChequeStopType",
      defaultValue: "P",
      placeholder: "SelectChequeStopType",
      options: () => {
        return [
          { value: "P", label: "Stop Payment" },
          { value: "S", label: "Surrender Cheque" },
          { value: "D", label: "PDC" },
        ];
      },
      _optionsKey: "FLAG",
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (field) => {
        // if (field?.value) {
        return {
          CHEQUE_FROM: { value: "", error: "" },
          CHEQUE_TO: { value: "", error: "" },
          AMOUNT: { value: "" },
          SERVICE_TAX: { value: "" },
          CHEQUE_DT: { value: "" },
          CHEQUE_AMOUNT: { value: "" },
          REASON_CD: { value: "" },
        };
        // }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "IntimateDate",
      isWorkingDate: true,
      dependentFields: ["FLAG"],
      placeholder: "DD/MM/YYYY",
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "S") {
          return true;
        } else {
          return false;
        }
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return t("Mustbeavaliddate");
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "SURR_DT",
      label: "SurrenderDate",
      placeholder: "DD/MM/YYYY",
      isWorkingDate: true,
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "S") {
          return false;
        } else {
          return true;
        }
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return t("Mustbeavaliddate");
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2,
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
      placeholder: "EnterFromChequeNo",
      dependentFields: ["ACCT_TYPE", "BRANCH_CD", "ACCT_CD", "FLAG", "TYPE_CD"],
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values.floatValue === 0 || values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (field?.value && !dependentValue?.ACCT_CD?.value) {
          let btnName = await formState.MessageBox({
            messageTitle: "ChequeBook",
            message: "EnterAccountInformation",
          });
          if (btnName === "Ok") {
            return {
              CHEQUE_FROM: { value: "", isFieldFocused: true },
              CHEQUE_TO: { value: "" },
            };
          }
        } else if (
          field?.value &&
          dependentValue?.BRANCH_CD?.value &&
          dependentValue?.ACCT_TYPE?.value
        ) {
          let apiReq = {
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
            ACCT_CD: dependentValue?.ACCT_CD?.value,
            SCREEN_REF: formState?.docCD,
            CHEQUE_FROM: field?.value,
            CHEQUE_TO: "",
            CHQ_SERIES: true,
            CHRG_CAL: false,
            FLAG: dependentValue?.FLAG?.value,
            TYPE_CD: dependentValue?.TYPE_CD?.value,
            ENTERED_COMP_CD: authState?.companyID,
            ENTERED_BRANCH_CD: authState?.user?.branchCode,
          };
          let postData = await API.chequeValidate(apiReq);

          if (postData?.[0]?.O_STATUS !== "0") {
            let res = await formState.MessageBox({
              messageTitle: postData?.[0]?.O_MSG_TITLE
                ? postData?.[0]?.O_MSG_TITLE
                : "ValidationFailed",
              message: postData?.[0]?.O_MESSAGE,
              icon: "ERROR",
            });
            if (res === "Ok") {
              return {
                CHEQUE_FROM: { value: "", isFieldFocused: true },
                SERVICE_TAX: { value: "" },
                AMOUNT: { value: "" },
                CHEQUE_TO: {
                  value: "",
                  isFieldFocused: false,
                },
              };
            }
          } else if (postData?.[0]?.OPEN_GRID === "Y") {
            formState.setDataOnFieldChange("STOPPED_CHEQUE", {
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              ACCT_CD: dependentValue?.ACCT_CD?.value,
              FROM_CHEQUE: field?.value,
              TO_CHEQUE: "",
            });
            return {
              CHEQUE_FROM: { value: "", isFieldFocused: true },
              CHEQUE_TO: { value: "" },
            };
          } else {
            return {
              CHEQUE_TO: { value: field?.value },
              SERVICE_TAX: { value: "" },
              AMOUNT: { value: "" },
              SERVICE_C_FLAG: { value: "" },
              ROUND_OFF_FLAG: { value: "" },
              GST: { value: "" },
            };
          }
        } else if (!field?.value) {
          return {
            CHEQUE_TO: { value: "", isErrorBlank: true },
            SERVICE_TAX: { value: "" },
            AMOUNT: { value: "" },
            SERVICE_C_FLAG: { value: "" },
            ROUND_OFF_FLAG: { value: "" },
            GST: { value: "" },
          };
        }
        return {};
      },
      runPostValidationHookAlways: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromChequenorequired"] }],
      },
      required: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_TO",
      label: "ToChequeNo",
      placeholder: "EnterToChequeNo",
      dependentFields: [
        "ACCT_TYPE",
        "BRANCH_CD",
        "ACCT_CD",
        "FLAG",
        "CHEQUE_FROM",
        "TYPE_CD",
      ],
      validate: (field, dependentFields) => {
        if (!field?.value) {
          return "ToChequenorequired";
        } else if (
          Number(dependentFields?.CHEQUE_FROM?.value) > Number(field?.value)
        ) {
          return t("ChequeToValidateMsg");
        }
        return "";
      },
      FormatProps: {
        allowNegative: false,
        isAllowed: (values, dependentFields, formState) => {
          if (values.floatValue === 0 || values?.value?.length > 10) {
            return false;
          }
          return true;
        },
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
          dependentValue?.ACCT_TYPE?.value &&
          dependentValue?.ACCT_CD?.value &&
          dependentValue?.CHEQUE_FROM?.value
          // && field?.value !== dependentValue?.CHEQUE_FROM?.value
        ) {
          let apiReq = {
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
            ACCT_CD: dependentValue?.ACCT_CD?.value,
            SCREEN_REF: formState?.docCD,
            CHEQUE_FROM: dependentValue?.CHEQUE_FROM?.value,
            CHEQUE_TO: field?.value,
            CHQ_SERIES: true,
            CHRG_CAL: true,
            FLAG: dependentValue?.FLAG?.value,
            TYPE_CD: dependentValue?.TYPE_CD?.value,
            ENTERED_COMP_CD: authState?.companyID,
            ENTERED_BRANCH_CD: authState?.user?.branchCode,
          };
          let postData = await API.chequeValidate(apiReq);

          if (postData?.[0]?.O_STATUS !== "0") {
            let res = await formState.MessageBox({
              messageTitle: postData?.[0]?.O_MSG_TITLE
                ? postData?.[0]?.O_MSG_TITLE
                : "ChequeStopped",
              message: postData?.[0]?.O_MESSAGE,
            });

            if (res === "Ok") {
              return {
                CHEQUE_TO: { value: "", isFieldFocused: true },
                SERVICE_TAX: { value: "" },
                AMOUNT: { value: "" },
                SERVICE_C_FLAG: { value: "" },
                ROUND_OFF_FLAG: { value: "" },
                GST: { value: "" },
              };
            }
          } else {
            return {
              SERVICE_C_FLAG: {
                value: postData?.[0]?.FLAG_ENABLE_DISABLE ?? "",
              },
              ROUND_OFF_FLAG: {
                value: postData?.[0]?.GST_ROUND ?? "",
              },
              GST: {
                value: postData?.[0]?.TAX_RATE ?? "",
              },
              SERVICE_TAX: {
                value: postData?.[0]?.GST_AMT ?? "",
              },
              AMOUNT: {
                value: postData?.[0]?.CHRG_AMT ?? "",
              },
            };
          }
        } else if (!field?.value) {
          return {
            CHEQUE_TO: { value: dependentValue?.CHEQUE_FROM?.value },
            SERVICE_TAX: { value: "" },
            AMOUNT: { value: "" },
            SERVICE_C_FLAG: { value: "" },
            ROUND_OFF_FLAG: { value: "" },
            GST: { value: "" },
          };
        }
        return {};
      },
      // runPostValidationHookAlways: true,
      required: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "REASON_CD",
      label: "Reason",
      placeholder: "SelectReason",
      disableCaching: true,
      dependentFields: ["FLAG", "BRANCH_CD"],
      options: (dependentValue, formState, any, authState) => {
        if (dependentValue?.BRANCH_CD?.value && dependentValue?.FLAG?.value) {
          return API.reasonDropdown({
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            RETURN_TYPE:
              dependentValue?.FLAG?.value === "P"
                ? "STOP"
                : dependentValue?.FLAG?.value === "S"
                ? "SURR"
                : dependentValue?.FLAG?.value === "D"
                ? "PDC"
                : null,
          });
        }
        return [];
      },
      _optionsKey: "reasonDropdown",
      GridProps: {
        xs: 12,
        sm: 5,
        md: 6,
        lg: 5,
        xl: 5,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 7) {
            return false;
          }
          return true;
        },
      },
      label: "ChargeAmount",
      dependentFields: ["FLAG", "ROUND_OFF_FLAG", "GST", "SERVICE_C_FLAG"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.SERVICE_C_FLAG?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (field?.value) {
          return {
            SERVICE_TAX: {
              value:
                dependentValue?.ROUND_OFF_FLAG?.value === "3"
                  ? Math.floor(
                      (parseInt(field?.value) *
                        parseInt(dependentValue?.GST?.value)) /
                        100
                    ) ?? ""
                  : dependentValue?.ROUND_OFF_FLAG?.value === "2"
                  ? Math.ceil(
                      (parseInt(field?.value) *
                        parseInt(dependentValue?.GST?.value)) /
                        100
                    ) ?? ""
                  : dependentValue?.ROUND_OFF_FLAG?.value === "1"
                  ? Math.round(
                      (parseInt(field?.value) *
                        parseInt(dependentValue?.GST?.value)) /
                        100
                    ) ?? ""
                  : (parseInt(field?.value) *
                      parseInt(dependentValue?.GST?.value)) /
                    100,
            },
          };
        }
        return {};
      },
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX",
      label: "GST",
      isReadOnly: true,

      FormatProps: {
        allowNegative: false,
      },
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return t("Mustbeavaliddate");
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "CHEQUE_AMOUNT",
      label: "ChequeAmount",
      placeholder: "Cheque Amount",
      FormatProps: {
        allowNegative: false,
      },
      dependentFields: ["FLAG"],
      shouldExclude(fieldData, dependentFields, formState) {
        if (dependentFields?.FLAG?.value === "S") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "INFAVOUR_OF",
      label: "Infavour",
      type: "text",
      placeholder: "EnterInfavour",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      inputProps: {
        onInput: (event) => {
          if (event.target.value.length > 100) {
            return;
          }
        },
      },
      maxLength: 100,
      GridProps: {
        xs: 12,
        sm: 5,
        md: 4.5,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "Remark",
      },
      name: "REMARKS",
      label: "Remarks",
      txtTransform: "uppercase",
      placeholder: "EnterRemarks",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      inputProps: {
        onInput: (event) => {
          if (event.target.value.length > 100) {
            return;
          }
        },
      },
      GridProps: {
        xs: 12,
        sm: 5,
        md: 4.5,
        lg: 4,
        xl: 4,
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
      name: "TYPE_CD",
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
          formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
        } else if (acctNo == dependentFields?.ACCT_CD?.value) {
          formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: true });
        }
      },
    },
  ],
};
