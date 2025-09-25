import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";
import { validateHOBranch } from "components/utilFunction/function";

export const StockEntryMetaData = {
  form: {
    name: "Stock-entry",
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
        isReadOnly: true,
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
              ACCT_MST_LIMIT: { value: "" },
              SECURITY_CD: { value: "" },
            };
          } else if (!field.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              ACCT_MST_LIMIT: { value: "" },
              SECURITY_CD: { value: "" },
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
        options: (depen, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: formState?.docCD,
          });
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: (field, formState) => {
          formState.setDataOnFieldChange("IS_VISIBLE", {
            IS_VISIBLE: false,
          });
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            TRAN_BAL: { value: "" },
            ACCT_MST_LIMIT: { value: "" },
            SECURITY_CD: { value: "" },
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
                      ACCT_CD: {
                        value: "",
                        isFieldFocused: true,
                      },
                      ACCT_NM: { value: "" },
                      TRAN_BAL: { value: "" },
                      TRAN_DT: { value: "" },
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
                TRAN_DT: {
                  value: authState?.workingDate ?? "",
                },
                ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
                TRAN_BAL: {
                  value: postData?.TRAN_BAL ?? "",
                },
                ACCT_MST_LIMIT: {
                  value: postData?.LIMIT_AMT ?? "",
                },
                SECURITY_CD: {
                  isFieldFocused: true,
                },
              };
            }
          } else if (!field?.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              ACCT_MST_LIMIT: { value: "" },
              SECURITY_CD: { value: "" },
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
      FormatProps: {
        allowNegative: true,
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2.5,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "ACCT_MST_LIMIT",
      label: "AccountLimitAmt",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2.5,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECURITY_CD",
      label: "Security",
      placeholder: "SelectSecurity",
      validate: (currentField) => {
        if (!currentField?.value) {
          return "SecuritycannotbeBlank";
        }
        return "";
      },
      disableCaching: true,
      _optionsKey: "securityListDD",
      dependentFields: ["ACCT_TYPE", "ACCT_CD", "BRANCH_CD", "ACCT_MST_LIMIT"],
      options: (dependentValue, formState, _, authState) => {
        if (
          dependentValue?.ACCT_TYPE?.value &&
          dependentValue?.ACCT_CD?.value &&
          formState?.isVisible &&
          typeof formState?.isVisible === "boolean"
        ) {
          let apiReq = {
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
            ACCT_CD: dependentValue?.ACCT_CD?.value,
            SCREEN_REF: formState?.docCD,
          };
          return API.securityListDD(apiReq);
        }
        return [];
      },

      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (field?.value) {
          formState.setDataOnFieldChange("SECURITY_CD", {
            COMP_CD: authState?.companyID,
            SECURITY_CD: field?.value,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            ACCT_MST_LIMIT: dependentValue?.ACCT_MST_LIMIT?.value,
            STOCK_MARGIN: field?.optionData?.[0]?.STOCK_MARGIN,
            STK_MRG_DISABLE: field?.optionData?.[0]?.STK_MRG_DISABLE,
            WORKING_DATE: authState?.workingDate,
            docCD: formState?.docCD,
          });
        }
        return {
          STOCK_MONTH: { value: field?.optionData?.[0]?.STOCK_MONTH },
        };
      },
      GridProps: {
        xs: 12,
        sm: 5,
        md: 3,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_ASON_DT",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "STOCK_MONTH",
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
          formState.setDataOnFieldChange("isVisible", { isVisible: false });
        } else if (acctNo == dependentFields?.ACCT_CD?.value) {
          formState.setDataOnFieldChange("isVisible", { isVisible: true });
        }
      },
    },
  ],
};
