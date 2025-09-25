import {
  greaterThanDate,
  lessThanDate,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { expireDate, securityListDD } from "../../stockEntry/api";
import { format, isValid } from "date-fns";
import { t } from "i18next";
import { stockAccountValidation } from "../api";
import { debounce, isEmpty } from "lodash";

export const EntryFormMetaData = {
  form: {
    name: "Stock-entry",
    label: "",
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
        required: false,
        schemaValidation: {},
        isReadOnly: true,
        __EDIT__: { isReadOnly: true },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
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

          if (field.value !== undefined) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              CUSTOMER_ID: { value: "" },
              CONTACT2: { value: "" },
              PAN_NO: { value: "" },
            };
          }
        },

        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
        runPostValidationHookAlways: true,
      },
      accountTypeMetadata: {
        dependentFields: ["BRANCH_CD"],
        validationRun: "onChange",
        required: false,
        schemaValidation: {},
        isFieldFocused: true,
        __EDIT__: { isReadOnly: true },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value && !dependentFieldValues?.BRANCH_CD?.value) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
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
                ACCT_CD: { value: "", ignoreUpdate: false },
              };
            }
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "TRAN_CD"],
        runPostValidationHookAlways: true,
        __EDIT__: { isReadOnly: true },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const acctCd = currentField?.value;
          const acctType = dependentFieldValues?.ACCT_TYPE?.value;
          const branchCode = dependentFieldValues?.BRANCH_CD?.value;

          if (acctCd && !acctType) {
            const buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
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
          }

          if (acctCd && branchCode && acctType) {
            const paddedAcctCd = utilFunction.getPadAccountNumber(
              acctCd,
              dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
            );

            const reqParameters = {
              BRANCH_CD: branchCode,
              COMP_CD: authState?.companyID,
              ACCT_TYPE: acctType,
              ACCT_CD: paddedAcctCd,
              SCREEN_REF: formState?.docCD ?? "",
              SECURITY_CD: "",
              LIMIT_AMT: "",
              SANC_AMT: "",
              STOCK_MARGIN: "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              FLAG: "A",
              WORKING_DATE: authState?.workingDate,
              TRN_DATE:
                dependentFieldValues?.TRAN_DT?.value ?? authState?.workingDate,
            };

            const postData = await stockAccountValidation(reqParameters);
            const messageResult = await handleDisplayMessages(
              postData[0]?.MSG,
              formState.MessageBox,
              { onNo: () => "" }
            );

            formState.setDataOnFieldChange("GRID_DATA", postData);
            formState.setDataOnFieldChange("VIEW_ACCT_DTK", reqParameters);

            const shouldReset = isEmpty(messageResult);
            const lastData = postData[postData.length - 1] ?? {};

            const fieldMap = [
              "ACCT_NM",
              "INSU_AMT",
              "TYPE_CD",
              "TRAN_BAL",
              "ACCT_MST_LIMIT",
              "ACCT_SANCTIONED_AMT",
              "ASON_DT",
              "MAX_DP_PER_AMT",
              "DISABLE_ASON_DT",
              "MARGIN_PERC",
            ];
            const sourceRow = postData.find((item) => item.ROWFLAG === "A");

            const updatedFields = fieldMap.reduce((acc, key) => {
              acc[key] = { value: shouldReset ? "" : sourceRow?.[key] ?? "" };
              return acc;
            }, {} as Record<string, any>);

            return {
              ACCT_CD: {
                value: shouldReset ? "" : paddedAcctCd,
                isFieldFocused: shouldReset,
                ignoreUpdate: !shouldReset,
              },
              SECURITY_CD: {
                value: shouldReset ? "" : lastData.INSU_SECURITY_TYPE ?? "",
              },
              ...updatedFields,
            };
          }

          if (!currentField?.value) {
            const resetFields = [
              "ACCT_NM",
              "TYPE_CD",
              "TRAN_BAL",
              "ACCT_MST_LIMIT",
              "SANCTION_AMT",
              "ASON_DT",
              "MAX_DP_PER_AMT",
              "DISABLE_ASON_DT",
              "SECURITY_CD",
              "MARGIN_PERC",
            ];

            return resetFields.reduce((acc, key) => {
              acc[key] = { value: "" };
              return acc;
            }, {} as Record<string, any>);
          }

          return {};
        },

        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 1.5, xl: 1.5 },
      },
      __EDIT__: {
        branchCodeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          required: false,
          schemaValidation: {},
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        accountTypeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          required: false,
          schemaValidation: {},
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        accountCodeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          required: false,
          schemaValidation: {},
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {},

          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
      },
      __VIEW__: {
        branchCodeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        accountTypeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        accountCodeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountHolder",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Outstanding",
      fullWidth: true,
      isReadOnly: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },
      FormatProps: {
        allowNegative: true,
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1.9, xl: 1.5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "VIEW_ACCT_DTL",
      label: "viewAccountDtl",
      rotateIcon: "scale(1.5)",
      ignoreInSubmit: true,
      placeholder: "",
      type: "text",
      dependentFields: ["ACCT_TYPE", "ACCT_CD"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        const acctType = dependentFieldsValues?.ACCT_TYPE?.value?.trim();
        const acctCd = dependentFieldsValues?.ACCT_CD?.value?.trim();

        return !(acctType && acctCd);
      },

      GridProps: { xs: 12, sm: 1, md: 2, lg: 1.5, xl: 1.5 },
    },
    // {
    //   render: {
    //     componentType: "formbutton",
    //   },
    //   name: "FPRCE_EXPIRED",
    //   label: "ForceExpire",
    //   rotateIcon: "scale(1.5)",
    //   placeholder: "",
    //   type: "text",
    //   ignoreInSubmit: true,
    //   dependentFields: ["ACCT_TYPE", "ACCT_CD"],
    //   shouldExclude(fieldData, dependentFieldsValues, formState) {
    //     return (
    //       formState.ALLOW_FORCE_EXPIRE_FLAG !== "Y" ||
    //       formState?.refId?.current === true
    //     );
    //   },
    //   isReadOnly(fieldData, dependentFieldsValues, formState) {
    //     return formState?.formMode !== "edit";
    //   },
    //   GridProps: { xs: 12, sm: 1, md: 2, lg: 1.5, xl: 1.5 },
    // },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECURITY_CD",
      label: "Security",
      placeholder: "SelectSecurity",
      __EDIT__: { isReadOnly: true },
      __VIEW__: { isReadOnly: true },
      runExternalFunction: true,
      validate: (currentField) => {
        if (!currentField?.value) {
          return "SecuritycannotbeBlank";
        }
        return "";
      },
      disableCaching: true,
      _optionsKey: "stockSecurityListDD",
      defaultValueKey: "defaultValue",
      dependentFields: [
        "ACCT_TYPE",
        "ACCT_CD",
        "BRANCH_CD",
        "ACCT_MST_LIMIT",
        "TRAN_DT",
        "TRAN_DT",
        "SANCTION_AMT",
        "MARGIN_PERC",
      ],
      options: (dependentValue, formState, _, authState) => {
        if (
          dependentValue?.ACCT_TYPE?.value &&
          dependentValue?.ACCT_CD?.value
        ) {
          const apiReq = {
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
            ACCT_CD: dependentValue?.ACCT_CD?.value,
            SCREEN_REF: formState?.docCD,
          };
          return securityListDD(apiReq);
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
          let APIRequestPara = {
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
            ACCT_CD: dependentValue?.ACCT_CD?.value,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value ?? "",
            SECURITY_CD: field?.value,
            SCREEN_REF: formState?.docCD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            TRN_DATE: field?.value
              ? format(
                  utilFunction.getParsedDate(dependentValue?.TRAN_DT?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            LIMIT_AMT: dependentValue?.ACCT_MST_LIMIT?.value ?? "0",
            SANC_AMT: dependentValue?.SANCTION_AMT?.value ?? "",
            STOCK_MARGIN: dependentValue?.MARGIN_PERC?.value ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
            FLAG: "",
          };
          let postData = await stockAccountValidation(APIRequestPara);
          const sourceRow = postData.find((item) => item.ROWFLAG === "A");

          const detailRow = postData.find((item) => item.ROWFLAG === "D");
          if (postData?.length) {
            return {
              // ACCT_NM: {
              //   value: sourceRow?.ACCT_NM ?? "",
              // },
              TYPE_CD: {
                value: sourceRow?.TYPE_CD ?? "",
              },
              TRAN_BAL: {
                value: sourceRow?.TRAN_BAL ?? "",
              },
              ACCT_MST_LIMIT: {
                value: sourceRow?.ACCT_MST_LIMIT ?? "",
              },
              SANCTION_AMT: {
                value: sourceRow?.ACCT_SANCTIONED_AMT ?? "",
              },
              ASON_DT: {
                value: sourceRow?.ASON_DT ?? "",
              },
              MAX_DP_PER_AMT: {
                value: sourceRow?.MAX_DP_PER_AMT ?? "",
              },
              DISABLE_ASON_DT: {
                value: sourceRow?.DISABLE_ASON_DT ?? "",
              },

              MARGIN_PERC: {
                value: sourceRow?.MARGIN_PERC ?? "",
              },
              INSURANCE_AMOUNT: {
                value: sourceRow?.INSURANCE_AMOUNT ?? "",
              },
              INSURANCE_TYPE_DESC: {
                value: detailRow?.INSURANCE_TYPE_DESC ?? "",
              },
            };
          }
        } else if (!field?.value) {
          return {
            ACCT_NM: {
              value: "",
            },
            TYPE_CD: {
              value: "",
            },
            TRAN_BAL: {
              value: "",
            },
            ACCT_MST_LIMIT: {
              value: "",
            },
            SANCTION_AMT: {
              value: "",
            },
            ASON_DT: {
              value: "",
            },
            MAX_DP_PER_AMT: {
              value: "",
            },
            DISABLE_ASON_DT: {
              value: "",
            },

            MARGIN_PERC: {
              value: "",
            },
            INSURANCE_AMOUNT: {
              value: "",
            },
          };
        }
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
        componentType: "amountField",
      },
      name: "ACCT_MST_LIMIT",
      label: "dpAllowedTill",
      fullWidth: true,
      isReadOnly: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1.9, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_ASON_DT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MARGIN_PERC",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "datePicker",
      },
      fullWidth: true,
      name: "TRAN_DT",
      __EDIT__: { isReadOnly: true },
      __VIEW__: { isReadOnly: true },
      label: "StatementDate",
      placeholder: "DD/MM/YYYY",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
      required: true,
      isWorkingDate: true,
      isMaxWorkingDate: true,
      isFieldFocused: true,
      validate: (currentField, dependentField) => {
        let formatdate = new Date(currentField?.value);
        if (!currentField?.value) {
          return "PleaseEnterStatementDate";
        } else if (Boolean(formatdate) && !isValid(formatdate)) {
          return t("Mustbeavaliddate");
        } else if (
          greaterThanDate(formatdate, currentField?._maxDt, {
            ignoreTime: true,
          })
        ) {
          return t("DateShouldBeLessThanEqualToWorkingDT");
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      dependentFields: ["BRANCH_CD", "ACCT_MST_LIMIT"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (dependentValue?.SECURITY_CD?.value) {
          let APIRequestPara = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: dependentValue?.BRANCH_CD?.value ?? "",
            SECURITY_CD: dependentValue?.SECURITY_CD?.value ?? "",
            SCREEN_REF: formState?.docCD ?? "",
            GD_TD_DATE: authState?.workingDate ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            TRN_DATE: field?.value
              ? format(utilFunction.getParsedDate(field?.value), "dd/MMM/yyyy")
              : "",

            LIMIT_AMOUNT: dependentValue?.ACCT_MST_LIMIT?.value ?? "0",
          };
          let postData = await expireDate(APIRequestPara);
          if (postData?.length) {
            return {
              ASON_DT: { value: postData?.[0]?.ASON_DT },
              DISABLE_ASON_DT: {
                value: postData?.[0]?.DISABLE_ASON_DT,
              },
            };
          }
        } else if (!field?.value) {
          return {
            ASON_DT: { value: "" },
            DISABLE_ASON_DT: {
              value: "",
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "ASON_DT",
      fullWidth: true,
      __EDIT__: { isReadOnly: true },
      __VIEW__: { isReadOnly: true },
      label: "StatementValidTillDate",
      placeholder: "DD/MM/YYYY",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
      required: true,
      dependentFields: ["DISABLE_ASON_DT ", "TRAN_DT"],
      validate: (currentField, dependentField) => {
        let formatdate = new Date(currentField?.value);
        if (!currentField?.value) {
          return "PleaseEnterStatementValidTillDate";
        } else if (Boolean(formatdate) && !isValid(formatdate)) {
          return t("Mustbeavaliddate");
        } else if (
          lessThanDate(formatdate, dependentField?.TRAN_DT?.value, {
            ignoreTime: true,
          })
        ) {
          return t("StmtTillDateShouldBeGreterThanStmt");
        }
        return "";
      },

      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_ASON_DT?.value === "Y") {
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
      name: "RECEIVED_DT",
      label: "RecievedDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      __EDIT__: { isReadOnly: true },
      __VIEW__: { isReadOnly: true },
      isWorkingDate: true,
      isMaxWorkingDate: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        const receivedDateRaw = currentField?.value;
        const workingDateRaw = authState?.workingDate;

        const isReceivedDateValid = utilFunction?.isValidDate(receivedDateRaw);
        const isWorkingDateValid = utilFunction?.isValidDate(workingDateRaw);

        if (!isReceivedDateValid || !isWorkingDateValid) {
          return;
        }

        const receivedDate = new Date(receivedDateRaw);
        const workingDate = new Date(workingDateRaw);

        if (receivedDate > workingDate) {
          const buttonName = await formState?.MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("receivedDateValidationMsg"),
            buttonNames: ["Ok"],
            icon: "ERROR",
          });

          if (buttonName === "Ok") {
            return {
              RECEIVED_DT: {
                value: "",
                isFieldFocused: true,
              },
            };
          }
        }
      },
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FORM_MODE",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STOCK_DESC",
      label: "Description",
      dependentFields: ["FPRCE_EXPIRED", "FORM_MODE"],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DescriptionisRequired"] }],
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return formState?.formMode !== "new";
      },
      runValidationOnDependentFieldsChange: true,
      placeholder: "EnterDescription",
      type: "text",
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 5,
        lg: 5,
        xl: 5,
      },
      setValueOnDependentFieldsChange: (_, formState) => {
        if (formState?.refId?.current === true) {
          return "STOCK FORCEFULLY EXPIRED";
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "WITHDRAW_DT",
      label: "ExpireDate",
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 2,
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !formState?.refId?.current;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "ACCT_SANCTIONED_AMT",
      label: "SanctionedAmount",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },

      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INSU_AMT",
      label: "totalInsuranceAmt",
      type: "text",
      isReadOnly: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },

      fullWidth: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER",
      label: "",
      dependentFields: ["SCREENFLAG"],

      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "INSURANCE_TYPE_DESC",
      label: "InsuranceType",
      type: "text",
      isReadOnly: true,
      ignoreInSubmit: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER1",
      GridProps: { xs: 12, sm: 10, md: 10, lg: 8, xl: 8 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INSURANCE_AMOUNT",
      label: "InsuranceAmount",
      type: "text",
      isReadOnly: true,
      ignoreInSubmit: true,
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(255, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(255, 0, 0) !important",
        },
      },

      fullWidth: true,
      GridProps: { xs: 12, sm: 3.25, md: 2.5, lg: 2, xl: 2 },
    },
  ],
};
