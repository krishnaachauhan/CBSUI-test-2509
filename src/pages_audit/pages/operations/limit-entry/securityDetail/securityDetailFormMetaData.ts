import { format, isValid } from "date-fns";
import { getFDdetailBRD, getLimitExpDate, getSecurityListData } from "../api";

export const securityDetailMetaData = {
  form: {
    name: "security-detail-form",
    label: "SecurityDetail",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    render: {
      ordering: "auto",
      // ordering: "sequence",
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
          height: "35vh",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECURITY_CD",
      label: "SecurityType",
      isReadOnly: true,
      fullWidth: true,
      options: (dependentValue, formState, _, authState) => {
        if (formState?.reqData?.PARENT_TYPE && formState?.reqData?.BRANCH_CD) {
          let apiReq = {
            COMP_CD: authState?.companyID,
            BRANCH_CD: formState?.reqData?.BRANCH_CD,
            A_PARENT_TYPE: formState?.reqData?.PARENT_TYPE,
          };
          return getSecurityListData(apiReq);
        }
        return [];
      },
      disableCaching: true,
      _optionsKey: "getSecurityListData",
      GridProps: {
        xs: 12,
        md: 3.5,
        sm: 3.5,
        lg: 3.5,
        xl: 3.5,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "FD_ACCT_CD",
      label: "CertificateNumber",
      isFieldFocused: true,
      placeholder: "EnterCertiNo",
      inputProps: {
        maxLength: 20,
      },
      dependentFields: ["SECURITY_CD", "TRAN_DT"],
      required: true,
      validate: (columnValue, allField, flag) => {
        if (!Boolean(columnValue.value)) {
          return "PleaseEnterCertificateNo";
        }
        return "";
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (field?.value) {
          if (
            field?.value &&
            formState?.reqData?.SECURITY_TYPE &&
            dependentValue?.SECURITY_CD?.value &&
            formState?.reqData?.PANEL_FLAG
          ) {
            let ApiReq = {
              FD_COMP_CD: "",
              FD_BRANCH_CD: "",
              FD_ACCT_TYPE: "",
              FD_ACCT_CD: field?.value,
              SECURITY_TYPE: formState?.reqData?.SECURITY_TYPE,
              SECURITY_CD: dependentValue?.SECURITY_CD?.value,
              SCREEN_REF: formState?.docCD,
              PANEL_FLAG: formState?.reqData?.PANEL_FLAG,
            };

            let postData = await getFDdetailBRD(ApiReq);

            let responseData: any = [];
            const messagebox = async (msgTitle, msg, buttonNames, icon) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon: icon,
              });
              return buttonName;
            };
            if (postData?.length) {
              for (let i = 0; i < postData?.length; i++) {
                if (postData[i]?.O_STATUS !== "0") {
                  let btnName = await messagebox(
                    postData[i]?.O_MSG_TITLE
                      ? postData[i]?.O_MSG_TITLE
                      : postData[i]?.O_STATUS === "999"
                      ? "ValidationFailed"
                      : postData[i]?.O_STATUS === "99"
                      ? "confirmation"
                      : "ALert",
                    postData[i]?.O_MESSAGE,
                    postData[i]?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                    postData[i]?.O_STATUS === "999"
                      ? "ERROR"
                      : postData[i]?.O_STATUS === "99"
                      ? "CONFIRM"
                      : "WARNING"
                  );
                  if (btnName === "No" || postData[i]?.O_STATUS === "999") {
                    return {
                      FD_ACCT_CD: { value: "", isFieldFocused: true },
                      SECURITY_VALUE: { value: "" },
                      SEC_AMT: { value: "" },
                      SEC_INT_MARGIN: { value: "" },
                      SEC_INT_AMT: { value: "" },
                      INT_AMT: { value: "" },
                      INT_RATE: { value: "" },
                      PENAL_RATE: { value: "" },
                    };
                  }
                } else {
                  responseData.push(postData[i]);
                }
              }
            }
            if (responseData?.length) {
              return {
                FD_ACCT_CD: {
                  value: field?.value,
                  ignoreUpdate: true,
                },
                SECURITY_VALUE: {
                  value: responseData?.[0]?.SECURITY_VALUE,
                },
                EXPIRY_DT: {
                  value: responseData?.[0]?.EXPIRY_DT,
                },
                TRAN_DT: {
                  value: responseData?.[0]?.TRAN_DT
                    ? responseData?.[0]?.TRAN_DT
                    : dependentValue?.TRAN_DT?.value,
                },
                INT_AMT: {
                  value: responseData?.[0]?.INT_AMT,
                },
                INT_RATE: {
                  value: responseData?.[0]?.INT_RATE,
                  ignoreUpdate: true,
                },
                PENAL_RATE: {
                  value: responseData?.[0]?.PENAL_RATE,
                  ignoreUpdate: true,
                },
              };
            }
          }
        } else if (!field?.value) {
          return {
            FD_NO: { value: "" },
            SECURITY_VALUE: { value: "" },
            SEC_AMT: { value: "" },
            SEC_INT_MARGIN: { value: "" },
            SEC_INT_AMT: { value: "" },
            // EXPIRY_DT: { value: "" },
            // TRAN_DT: { value: "" },
            INT_RATE: { value: "" },
            INT_AMT: { value: "" },
            PENAL_RATE: { value: "" },
          };
        }
      },
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COLLATERAL_NAME",
      label: "CollateralName",
      required: true,
      fullWidth: true,
      placeholder: "EnterCollateralName",
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "PleaseEnterCollateralName";
      //   }
      //   return "";
      // },
      GridProps: {
        xs: 12,
        md: 3.5,
        sm: 3.5,
        lg: 3.5,
        xl: 3.5,
      },
    },
    {
      render: {
        componentType: "select",
      },
      name: "LIEN_YEN_NO",
      label: "LienYesNo",
      required: true,
      defaultValue: "Y",
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "ISSUE_DATE",
      fullWidth: true,
      required: true,
      placeholder: "DD/MM/YYYY",
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "PleaseEnterIssueDate";
      //   } else if (
      //     Boolean(columnValue?.value) &&
      //     !isValid(columnValue?.value)
      //   ) {
      //     return "Mustbeavaliddate";
      //   }
      //   return "";
      // },
      label: "IssueDate",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "select",
      },
      name: "PERIOD_CD",
      label: "Period",
      required: true,
      defaultOptionLabel: "SelectPeriod",
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "PleaseSelectPeriod";
      //   }
      //   return "";
      // },
      options: [
        { label: "DAY(S)", value: "D" },
        { label: "MONTH(S)", value: "M" },
        { label: "YEAR(S)", value: "Y" },
      ],
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "PERIOD_NO",
      label: "PeriodNumber",
      fullWidth: true,
      dependentFields: ["SECURITY_CD", "TRAN_DT"],
      placeholder: "EnterPeriodNo",
      required: true,
      FormatProps: {
        allowNegative: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 5 || values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "PleaseEnterPeriodNo";
      //   }
      //   return "";
      // },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependent
      ) => {
        if (
          field?.value &&
          formState?.reqData?.SANCTIONED_AMT &&
          formState?.reqData?.LIMIT_TYPE &&
          formState?.reqData?.SHORT_LMT_FLAG &&
          formState?.reqData?.ACCT_CD
        ) {
          let apiReq = {
            COMP_CD: auth?.companyID,
            BRANCH_CD: formState?.reqData?.BRANCH_CD,
            ACCT_TYPE: formState?.reqData?.ACCT_TYPE,
            ACCT_CD: formState?.reqData?.ACCT_CD,
            SECURITY_CD: dependent?.SECURITY_CD?.value,
            SANCTIONED_AMT: formState?.reqData?.SANCTIONED_AMT,
            TRAN_DT: dependent?.TRAN_DT?.value
              ? format(new Date(dependent?.TRAN_DT?.value), "dd/MMM/yyyy")
              : "",
            LIMIT_TYPE: formState?.reqData?.LIMIT_TYPE,
            SHORT_LMT_FLAG: formState?.reqData?.SHORT_LMT_FLAG,
            WORKING_DATE: auth?.workingDate,
          };
          let respData = await getLimitExpDate(apiReq);

          if (respData?.length) {
            formState?.CloseMessageBox();
            return {
              EXP_DATE: {
                value:
                  respData?.[0]?.SET_EXP_DT === "Y" && respData?.[0]?.EXPIRY_DT,
              },
              EXPIRY_DT: {
                value:
                  respData?.[0]?.SET_EXP_DT === "Y" && respData?.[0]?.EXPIRY_DT,
              },

              EXP_DT_DISABLE: {
                value: respData?.[0]?.EXP_DT_DISABLE,
              },
            };
          }
        } else if (!field?.value) {
          return {
            EXP_DATE: {
              value: "",
            },
            EXPIRY_DT: { value: "" },
            EXP_DT_DISABLE: {
              value: "",
            },
          };
        }
      },
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "EXP_DATE",
      label: "ExpiryDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      dependentFields: ["EXP_DT_DISABLE"],
      isReadOnly: (fieldData, dependent) => {
        if (dependent?.EXP_DT_DISABLE?.value === "Y") {
          return true;
        }
        return false;
      },
      // validate: (value) => {
      //   if (Boolean(value?.value) && !isValid(value?.value)) {
      //     return "Mustbeavaliddate";
      //   }
      //   return "";
      // },
      postValidationSetCrossFieldValues: async (field) => {
        if (field?.value) {
          return {
            EXPIRY_DT: field?.value,
          };
        }
      },
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COLLATERAL_AMT",
      label: "CollateralAmount",
      required: true,
      fullWidth: true,
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "PleaseEnterCollateralAmt";
      //   }
      //   return "";
      // },
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MATURED_AMT",
      label: "MaturityAmount",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "rateOfInt",
      },
      name: "COLLATERAL_RATE",
      label: "CollateralRate",
      // validate: (columnValue, allField, flag) => {
      //   if (!Boolean(columnValue.value)) {
      //     return "PleaseEnterCollateralRate";
      //   }
      //   return "";
      // },
      FormatProps: { placeholder: "0.00%" },
      fullWidth: true,
      required: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ISSUE_COMPANY",
      label: "IssuedBy",
      fullWidth: true,
      placeholder: "EnterIssueBy",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "REGISTRATION_NO",
      label: "RegistrationNumber",
      placeholder: "EnterRegistrationNumber",
      fullWidth: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "Remark",
      },
      name: "COLLATERAL_REMARKS",
      fullWidth: true,
      placeholder: "EnterRemarks",
      label: "CollateralRemarks",
      GridProps: {
        xs: 12,
        md: 6,
        sm: 6,
        lg: 6,
        xl: 6,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "EXPIRY_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INT_AMT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INT_RATE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PENAL_RATE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SECURITY_VALUE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_DT",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "EXP_DT_DISABLE",
    },
  ],
};
