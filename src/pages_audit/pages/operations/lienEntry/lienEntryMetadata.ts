import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { isValid } from "date-fns";
import { t } from "i18next";
import { lessThanDate, utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";

export const LienEntryMetadata = {
  form: {
    name: "Lien-entry",
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
          if (field?.value) {
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
              LIEN_CD: { value: "" },
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
              LIEN_CD: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2,
          xl: 2,
        },
      },
      accountTypeMetadata: {
        validationRun: "onChange",
        isFieldFocused: true,
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: formState?.docCD,
          });
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
            LIEN_CD: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2,
          xl: 2,
        },
      },
      accountCodeMetadata: {
        FormatProps: {
          allowNegative: false,
          allowLeadingZeros: true,
          isAllowed: (values) => {
            if (values?.value?.length > 20) {
              return false;
            }
            if (values?.value.includes(".")) {
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
                  value: postData?.WIDTH_BAL ?? "",
                },
                LIEN_CD: { value: "", isFieldFocused: true },
              };
            }
          } else if (!field?.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 4,
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
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 5,
        md: 4,
        lg: 3.6,
        xl: 3.6,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LIEN_STATUS",
      label: "LienStatus",
      isReadOnly: true,
      required: false,
      defaultValue: "A",
      options: () => {
        return [
          { value: "A", label: "Active" },
          { value: "E", label: "Expired" },
        ];
      },
      _optionsKey: "LIEN_STATUS",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.9,
        xl: 1.9,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LIEN_CD",
      label: "LienCode",
      placeholder: "SelectLienCode",
      disableCaching: true,
      required: true,
      dependentFields: ["BRANCH_CD"],
      options: (dependentValue, formState, any, authState) => {
        if (dependentValue?.BRANCH_CD?.value) {
          return API.lienCodeDropdown({
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
          });
        }
        return [];
      },
      _optionsKey: "LIEN_CD",
      postValidationSetCrossFieldValues: async (field) => {
        if (field?.value) {
          return {
            PARENT_CD: {
              value:
                field?.optionData?.[0]?.PARENT_TYPE +
                field?.optionData?.[0]?.PARENT_NM,
            },
          };
        }
        return {};
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["LienCodeIsRequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 4,
        md: 3,
        lg: 2.5,
        xl: 2.5,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "PARENT_CD",
      label: "ParentCodeName",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 5,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIEN_AMOUNT",
      label: "LienAmount",
      FormatProps: {
        allowNegative: false,
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 3,
        lg: 1.8,
        xl: 1.8,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "EFECTIVE_DT",
      isReadOnly: true,
      required: true,
      isWorkingDate: true,
      label: "EffectiveDate",
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 1.8,
        xl: 1.8,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REMOVAL_DT",
      label: "RemovalDate",
      isMinWorkingDate: true,
      placeholder: "DD/MM/YYYY",
      dependentFields: ["EFECTIVE_DT"],
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return t("Mustbeavaliddate");
        }
        if (
          lessThanDate(
            currentField?.value,
            dependentField?.EFECTIVE_DT?.value,
            {
              ignoreTime: true,
            }
          )
        ) {
          return t("RemovalDtShouldBeGreterThanEqualToEffDT");
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 1.9,
        xl: 1.9,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LIEN_REASON_CD",
      label: "Reason",
      placeholder: "SelectReason",
      disableCaching: true,
      dependentFields: ["BRANCH_CD"],
      options: (dependentValue, formState, any, authState) => {
        if (dependentValue?.BRANCH_CD?.value) {
          return API.reasonDropdown({
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
          });
        }
        return [];
      },
      _optionsKey: "LIEN_REASON_CD",
      GridProps: {
        xs: 12,
        sm: 4.5,
        md: 4,
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
      placeholder: "EnterRemarks",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      // validate: (columnValue) => {
      //   let regex = /^[^!&#]*$/;
      //   if (!regex.test(columnValue.value)) {
      //     return "Special Characters(! &) not Allowed in Remarks";
      //   }
      //   return "";
      // },
      GridProps: {
        xs: 12,
        sm: 4,
        md: 4,
        lg: 4.3,
        xl: 4.3,
      },
    },

    {
      render: {
        componentType: "checkbox",
      },
      name: "CYBER_FRAUD",
      label: "CyberFraud",
      defaultValue: false,
      validationRun: "all",
      postValidationSetCrossFieldValues: (field, formState, auth) => {
        if (
          (field?.value && typeof field?.value === "boolean") ||
          field?.value === "Y"
        ) {
          return {
            REPORTING_DATE: { value: auth?.workingDate },
          };
        } else {
          return {
            REPORTING_DATE: { value: "" },
          };
        }
      },
      GridProps: {
        xs: 3,
        sm: 3.5,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACKNOWLEDGEMENT_NO",
      label: "AcknowledgementNo",
      placeholder: "EnterAcknowledgementNo",

      dependentFields: ["CYBER_FRAUD"],
      shouldExclude(fieldData, dependent) {
        if (
          Boolean(dependent?.CYBER_FRAUD?.value) ||
          dependent?.CYBER_FRAUD?.value === "Y"
        ) {
          return false;
        }
        return true;
      },
      validate: (columnValue) => {
        let regex = /^[^!&]*$/;
        if (!regex.test(columnValue.value)) {
          return "Special Characters not Allowed in Remarks";
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 4,
        md: 3.2,
        lg: 3.2,
        xl: 3.2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TRANSACTION_ID",
      label: "TransactionId",
      placeholder: "EnterTransactionId",
      dependentFields: ["CYBER_FRAUD"],
      shouldExclude(fieldData, dependent) {
        if (
          Boolean(dependent?.CYBER_FRAUD?.value) ||
          dependent?.CYBER_FRAUD?.value === "Y"
        ) {
          return false;
        }
        return true;
      },
      GridProps: {
        xs: 12,
        sm: 4,
        md: 3.2,
        lg: 3.2,
        xl: 3.2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REPORTING_DATE",
      label: "ReportingDate",
      isMaxWorkingDate: true,
      validationRun: "all",
      placeholder: "DD/MM/YYYY",
      dependentFields: ["CYBER_FRAUD"],
      validate: (currentField, dependent, formState) => {
        let formatdate = new Date(currentField?.value);
        if (currentField?.value && !isValid(formatdate)) {
          return t("Mustbeavaliddate");
        } else if (formatdate > new Date(formState?.workingDate)) {
          return t("ReportingDatecantbegreaterthanworkingdate");
        }
        return "";
      },
      shouldExclude(fieldData, dependent) {
        if (
          Boolean(dependent?.CYBER_FRAUD?.value) ||
          dependent?.CYBER_FRAUD?.value === "Y"
        ) {
          return false;
        }
        return true;
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 1.9,
        xl: 1.9,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_CD_COPY",
      dependentFields: ["ACCT_CD", "ACCT_TYPE"],
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
          field?.value,
          dependentFields?.ACCT_TYPE?.optionData?.[0]
        );
        if (
          dependentFields?.ACCT_CD?.value &&
          acctNo &&
          acctNo !== dependentFields?.ACCT_CD?.value
        ) {
          formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
        } else if (acctNo == dependentFields?.ACCT_CD?.value) {
          formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: true });
        }
      },
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
