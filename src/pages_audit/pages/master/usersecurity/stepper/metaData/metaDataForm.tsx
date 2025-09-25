import { icon } from "@fortawesome/fontawesome-svg-core";
import * as API from "../api/api";
export const UserOnboardform = {
  form: {
    name: "AddSecurityUser",
    label: "UserOnboarding",
    resetFieldOnUnmount: false,
    readonly: true,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
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
      render: { componentType: "textField" },
      name: "USER_NAME",
      sequence: 1,
      type: "text",
      label: "UserID",
      placeholder: "EnterUserId",
      autoComplete: "off",
      txtTransform: "lowercase",
      maxLength: 16,
      isFieldFocused: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      __EDIT__: { isReadOnly: true, required: true },
      __NEW__: {
        required: true,
        postValidationSetCrossFieldValues: async (currentField, formState) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value !== undefined) {
            return API.checkUsername(currentField, {
              USER_NM: currentField?.value,
              formState: formState,
            });
          }
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["UsernameisRequired"] }],
        },
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "passwordField" },
      name: "USER_PASSWORD",
      sequence: 2,
      type: "password",
      label: "Password",
      required: true,
      maxLength: 16,
      placeholder: "EnterPassword",
      autoComplete: "off",
      allowToggleVisiblity: false,
      fullWidth: true,
      dependentFields: ["USER_NAME"],
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFields?.USER_NAME?.value.length > 0) {
          let request = {
            USER_ID: dependentFields?.USER_NAME?.value,
            PASSWORD: currentField?.value,
            SCREEN_REF: "MST/131",
          };
          formState?.handleButtonDisable(true);
          let postData = await API.validatePasswords({ request });
          if (postData.length > 0) {
            if (postData?.[0]?.O_STATUS === "999") {
              formState?.handleButtonDisable(false);
              let buttonName = await formState.MessageBox({
                messageTitle: "ValidationFailed",
                message: postData?.[0]?.O_MESSAGE,
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (buttonName === "Ok") {
                return {
                  USER_PASSWORD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else {
              formState?.handleButtonDisable(false);
            }
          }
        } else {
          const btnName = await formState?.MessageBox({
            messageTitle: "ValidationFailed",
            message: "EnterUserName",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          formState?.handleButtonDisable(false);
          if (btnName === "Ok") {
            return {
              USER_PASSWORD: {
                value: "",
                ignoreUpdate: false,
              },
              USER_NAME: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PasswordisRequired"] }],
      },
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      __VIEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "passwordField" },
      name: "CNF_PASSWORD",
      sequence: 3,
      type: "password",
      label: "ConfirmPassword",
      required: true,
      dependentFields: ["USER_PASSWORD"],
      placeholder: "EnterConfirmPassword",
      allowToggleVisiblity: false,
      ignoreInSubmit: false,
      maxLength: 16,
      fullWidth: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Confirmpasswordisrequired"] }],
      },
      __EDIT__: {
        ignoreInSubmit: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      __VIEW__: {
        ignoreInSubmit: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFields?.USER_PASSWORD?.value === "") {
          const btnName = await formState?.MessageBox({
            messageTitle: "ValidationFailed",
            message: "PleaseEnterPassword",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (btnName === "Ok") {
            return {
              CNF_PASSWORD: {
                value: "",
                ignoreUpdate: true,
              },
              USER_PASSWORD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        } else if (dependentFields?.USER_PASSWORD?.value?.length > 0) {
          if (dependentFields?.USER_PASSWORD?.value !== currentField?.value) {
            const btnName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "ConfirmPassworddoesnotmatch",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (btnName === "Ok") {
              return {
                CNF_PASSWORD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "textField" },
      name: "DESCRIPTION",
      sequence: 4,
      type: "text",
      label: "UserName",
      txtTransform: "uppercase",
      required: true,
      maxLength: 32,
      placeholder: "EnterUsernames",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["UsernameRequired"] }],
      },
      __EDIT__: {
        GridProps: {
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "GROUP_NAME",
      label: "GroupName",
      sequence: 5,
      placeholder: "SelectGroupName",
      type: "text",
      options: () => API.getsecmstgrpdrpdwn(),
      _optionsKey: "GetGroupList",
      autoComplete: "off",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "phoneNumberOptional" },
      name: "CONTACT2",
      sequence: 6,
      maxLength: 10,
      type: "text",
      label: "MobileNo",
      StartAdornment: "+91",
      placeholder: "EnterMobileNo",
      autoComplete: "off",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        let request = {
          MOBILE_NO: currentField?.value,
          SCREEN: "MST/131",
          STD_CD: "91",
          FLAG: "Y",
          formState: formState,
        };
        formState?.handleButtonDisable(true);
        let postData = await API.validateMobileNo({ request });
        if (postData?.[0]?.MOBILE_STATUS.length > 0) {
          let buttonName = await formState.MessageBox({
            messageTitle: "ValidationFailed",
            message: postData?.[0]?.MOBILE_STATUS,
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          formState?.handleButtonDisable(false);
          if (buttonName === "Ok") {
            return {
              CONTACT2: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "numberFormat" },
      name: "CUSTOMER_ID",
      sequence: 7,
      type: "text",
      maxLength: 12,
      label: "CustomerId",
      required: false,
      placeholder: "EnterCustomerID",
      schemaValidation: {},
      autoComplete: "off",
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value.length > 0) {
          formState?.handleButtonDisable(true);
          const CustomerIdAPI = await API.ValidateCustomerId(currentField, {
            COMP_CD: authState?.companyID,
            CUST_ID: currentField?.value,
            formState: formState,
          });
          if (!Boolean(CustomerIdAPI?.[0]?.CUST_STATUS)) {
            const setData = await API.getCustomerId(currentField, {
              COMP_CD: authState?.companyID,
              CUSTOMER_ID: currentField?.value,
              formState: formState,
            });

            return {
              ACCT_NM: {
                value: setData?.[0]?.ACCT_NM ?? "",
                ignoreUpdate: true,
              },
              CONTACT2: {
                value: setData?.[0]?.CONTACT2 ?? "",
                ignoreUpdate: true,
              },
            };
          } else {
            formState?.handleButtonDisable(false);
            const btnName = await formState?.MessageBox({
              message: CustomerIdAPI?.[0]?.CUST_STATUS,
              messageTitle: "ValidationFailed",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (btnName === "Ok") {
              return {
                CUSTOMER_ID: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                ACCT_NM: {
                  value: "",
                  ignoreUpdate: false,
                },
                CONTACT2: {
                  value: "",
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
        return {};
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "textField" },
      name: "ACCT_NM",
      sequence: 8,
      type: "text",
      label: "CustomerIdName",
      isReadOnly: true,
      dependentFields: ["CUSTOMER_ID"],
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "textField" },
      name: "REPORTING_NM",
      sequence: 9,
      type: "text",
      maxLength: 100,
      label: "ReportingName",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      placeholder: "EnterReportingName",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "USER_LEVEL",
      sequence: 10,
      type: "text",
      label: "UserLevel",
      required: true,
      options: [
        { label: "AUDITOR", value: "-2" },
        { label: "CASHIER", value: "-1" },
        { label: "CLERK", value: "1" },
        { label: "OFFICER", value: "2" },
        { label: "MANAGER", value: "3" },
        { label: "ADMIN", value: "4" },
      ],
      placeholder: "SelectUserLevel",
      __NEW__: { defaultValue: "1" },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["UserLevelRequired"] }],
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DEF_COMP_CD",
      label: "DefaultBank",
      sequence: 11,
      placeholder: "SelectDefaultBank",
      type: "text",
      required: true,
      options: API.getSecmstBankcd,
      _optionsKey: "GetBankList",
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DefaultBankRequired"] }],
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DEF_BRANCH_CD",
      label: "DefaultBranch",
      sequence: 12,
      placeholder: "SelectDefaultBranch",
      type: "text",
      required: true,
      options: API.getSecmstBranchcd,
      _optionsKey: "GetBranchList",
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DefaultBranchRequired"] }],
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "numberFormat" },
      name: "FROM_SLIP_CD",
      sequence: 13,
      type: "text",
      maxLength: 5,
      label: "ClgSlipNoStartFrom",
      placeholder: "EnterClearingSlipNumberStartFrom",
      autoComplete: "off",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          return true;
        },
      },
      __EDIT__: {
        GridProps: {
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: { componentType: "numberFormat" },
      name: "EMP_ID",
      sequence: 14,
      maxLength: 14,
      type: "text",
      ignoreInSubmit: true,
      label: "EmployeeId",
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.sharing) {
          if (formState?.sharing?.[0]?.ACUTE_PAYROLL === "Y") {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      __EDIT__: {
        GridProps: {
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      GridProps: {
        xs: 12,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DOC_SIGN_CONFIG",
      label: "DigitalSignConfig",
      sequence: 15,
      options: (dependentValue, formState, _, authState) =>
        API.getDigitalSignConfigddw(
          authState?.baseCompanyID,
          authState?.user?.baseBranchCode
        ),
      _optionsKey: "GetDigitalSignConfig",
      placeholder: "EnterDigitalSignConfig",
      type: "text",
      __EDIT__: {
        GridProps: {
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      __VIEW__: {
        GridProps: {
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      GridProps: {
        xs: 12,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: { componentType: "textField" },
      name: "ADUSER_NAME",
      sequence: 16,
      type: "text",
      label: "ADUsername",
      required: true,
      ignoreInSubmit: true,
      placeholder: "username@domain name",
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ADUsernameRequire"] }],
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.sharing) {
          if (formState?.sharing?.[0]?.AD_PARA === "Y") {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "checkbox" },
      name: "SIGN_VIEW",
      sequence: 17,
      label: "ViewSignature",
      autoComplete: "off",
      __EDIT__: {
        GridProps: {
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: { componentType: "checkbox" },
      name: "ALLOW_RELEASE",
      sequence: 18,
      label: "AllowRelease",
      autoComplete: "off",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "checkbox" },
      name: "ALLOW_DOC_SIGN",
      sequence: 19,
      label: "AllowDigitalSign",
      autoComplete: "off",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "checkbox" },
      name: "ACTIVE_FLAG",
      sequence: 20,
      label: "Active",
      autoComplete: "off",
      __NEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "checkbox" },
      name: "MULTI_APP_ACCESS",
      sequence: 21,
      label: "AllowConcurrentAppLogin",
      autoComplete: "off",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "INACTIVE_DATE2",
      dependentFields: ["ACTIVE_FLAG"],
      __EDIT__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (
            dependentFieldsValues?.ACTIVE_FLAG?.value === true ||
            dependentFieldsValues?.ACTIVE_FLAG?.value === "Y"
          ) {
            return false;
          } else {
            return true;
          }
        },
        GridProps: {
          sx: { height: "78.25px" },
          xs: 12,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "datePicker" },
      name: "INACTIVE_DATE",
      sequence: 22,
      label: "InactiveDate",
      isReadOnly: true,
      type: "text",
      __EDIT__: {
        isWorkingDate: true,
        ignoreInSubmit: (dependentFieldsValues) => {
          if (
            dependentFieldsValues?.ACTIVE_FLAG?.value === true ||
            dependentFieldsValues?.ACTIVE_FLAG?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
      autoComplete: "off",
      dependentFields: ["ACTIVE_FLAG"],
      __NEW__: {
        ignoreInSubmit: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.ACTIVE_FLAG?.value === true ||
          dependentFieldsValues?.ACTIVE_FLAG?.value === "Y"
        ) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "typography",
      },
      name: "DIVIDER",
      label: "",
      TypographyProps: {
        style: {
          whiteSpace: "pre-line",
          color: "var(--theme-color1)",
          fontSize: "1.2rem",
          borderBottom: "3px dashed #ccc",
          width: "100%",
          height: "0px",
        },
      },
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        style: { alignSelf: "center", paddingTop: "15px", display: "flex" },
      },
    },
    {
      render: { componentType: "amountField" },
      name: "DR_CASH_LIMIT",
      sequence: 23,
      type: "text",
      label: "DebitCashLimit",
      maxLength: 14,
      autoComplete: "off",
      placeholder: "",
      showMaxLength: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 2,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DebitCashLimitRequire"] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "DR_CLG_LIMIT",
      sequence: 24,
      type: "text",
      label: "DebitClearingLimit",
      maxLength: 14,
      autoComplete: "off",
      placeholder: "",
      showMaxLength: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 2,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DebitClearingLimitRequire"] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "DR_TRF_LIMIT",
      sequence: 25,
      type: "text",
      label: "DebitTransferLimit",
      maxLength: 14,
      autoComplete: "off",
      placeholder: "",
      showMaxLength: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 2,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DebitTransferLimitRequire"] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "CR_CASH_LIMIT",
      sequence: 26,
      type: "text",
      maxLength: 14,
      label: "CreditCashLimit",
      showMaxLength: true,
      placeholder: "",
      autoComplete: "off",
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 2,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CreditCashLimitRequire"] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "CR_CLG_LIMIT",
      sequence: 27,
      type: "text",
      label: "CreditClearingLimit",
      maxLength: 14,
      autoComplete: "off",
      placeholder: "",
      showMaxLength: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 2,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CreditClearingLimitRequire"] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: { componentType: "amountField" },
      name: "CR_TRF_LIMIT",
      sequence: 28,
      type: "text",
      label: "CreditTransferLimit",
      maxLength: 14,
      autoComplete: "off",
      placeholder: "",
      showMaxLength: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: true,
        allowLeadingZeros: false,
        decimalScale: 2,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.authState < "4") {
          return true;
        } else {
          return false;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CreditTransferLimitRequire"] }],
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
  ],
};
export const loginShift = {
  form: {
    name: "LoginShift",
    label: "LoginShift",
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
        componentType: "textField",
      },
      name: "DEMO",
      label: "Demo",
      placeholder: "",
      isReadOnly: true,
      ignoreInSubmit: true,
      type: "text",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
      shouldExclude() {
        return true;
      },
      dependentFields: ["LOGINSHIFT"],
      postValidationSetCrossFieldValues: async (
        currentFieldState,
        formState,
        auth,
        dependentFieldState,
        dependentFields
      ) => {
        const Data: any[] = [];
        const Test = Array.isArray(dependentFieldState?.["LOGINSHIFT"])
          ? dependentFieldState["LOGINSHIFT"].map((item, index) => {
              const values = item.SHIFT_TRAN_CD?.value;
              if (values) {
                if (Data.includes(values)) {
                  formState.MessageBox({
                    messageTitle: "ValidationFailed",
                    message: `Duplicate value found at row ${index + 1}`,
                    buttonNames: ["Ok"],
                  });
                  return {
                    ["dependentFieldState.LOGINSHIFT.SHIFT_TRAN_CD"]: {
                      value: "",
                    },
                  };
                } else {
                  Data.push(values);
                }
              }
              return values;
            })
          : [];

        return Test;
      },
    },
    {
      render: {
        componentType: "arrayField",
      },
      name: "LOGINSHIFT",
      enableGrid: true,
      changeRowOrder: true,
      hideRemoveIconOnSingleRecord: false,
      // removeRowFn: "deleteFormArrayFieldData",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "autocomplete",
          },
          name: "SHIFT_TRAN_CD",
          label: "Login Shift",
          options: (dependentValue, formState, _, authState) =>
            API.getLoginShiftddw({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            }),
          _optionsKey: "GetLoginShift",
          placeholder: "",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
          postValidationSetCrossFieldValues: async (
            currentFieldState,
            formState,
            dependentFieldState
          ) => {
            return { DEMO: { value: currentFieldState.value } };
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "START_TIME",
          label: "Start Time",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          format: "HH:mm:ss",
          dependentFields: ["SHIFT_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            let value =
              dependentFields[
                "LOGINSHIFT.SHIFT_TRAN_CD"
              ].optionData[0]?.rest?.START_TIME?.split(" ")[1];
            return value ? value : "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "END_TIME",
          label: "End Time",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          dependentFields: ["SHIFT_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            let value =
              dependentFields[
                "LOGINSHIFT.SHIFT_TRAN_CD"
              ].optionData[0]?.rest?.END_TIME?.split(" ")[1];
            return value ? value : "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          dependentFields: ["SHIFT_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            let value =
              dependentFields["LOGINSHIFT.SHIFT_TRAN_CD"].optionData[0]?.rest
                ?.ACTIVE === "Y"
                ? true
                : false;
            return value ? value : "";
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
      ],
    },
  ],
};
export const editloginShift = {
  form: {
    name: "EDITLoginShift",
    label: "LoginShift",
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
        componentType: "textField",
      },
      name: "DEMO",
      label: "Demo",
      placeholder: "",
      isReadOnly: true,
      ignoreInSubmit: true,
      type: "text",
      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
      shouldExclude() {
        return true;
      },
      dependentFields: ["EDITLOGINSHIFT"],
      postValidationSetCrossFieldValues: async (
        currentFieldState,
        formState,
        auth,
        dependentFieldState,
        dependentFields
      ) => {
        const Data: any[] = [];
        const Test = Array.isArray(dependentFieldState?.["EDITLOGINSHIFT"])
          ? dependentFieldState["EDITLOGINSHIFT"].map((item, index) => {
              const values = item.SHIFT_TRAN_CD?.value;
              if (values) {
                if (Data.includes(values)) {
                  formState.MessageBox({
                    messageTitle: "ValidationFailed",
                    message: `Duplicate value found at row ${index + 1}`,
                    buttonNames: ["Ok"],
                  });
                  return {
                    ["dependentFieldState.EDITLOGINSHIFT.SHIFT_TRAN_CD"]: {
                      value: "",
                    },
                  };
                } else {
                  Data.push(values);
                }
              }
              return values;
            })
          : [];

        return Test;
      },
    },
    {
      render: {
        componentType: "arrayField",
      },
      name: "EDITLOGINSHIFT",
      enableGrid: true,
      changeRowOrder: true,
      hideRemoveIconOnSingleRecord: false,
      // removeRowFn: "deleteFormArrayFieldData",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "DESCRIPTION",
          dependentFields: ["SHIFT_TRAN_CD"],
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "DATA",
          dependentFields: ["SHIFT_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const fieldKey =
              dependentFields["EDITLOGINSHIFT.SHIFT_TRAN_CD"]?.fieldKey;
            const match = fieldKey.match(/\[(\d+)\]/);
            const newNumber = parseInt(match[1]) + 1;
            return newNumber;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "SHIFT_TRAN_CD",
          label: "Login Shift",
          options: (dependentValue, formState, _, authState) =>
            API.getLoginShiftddw({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            }),
          _optionsKey: "GetLoginShift",
          placeholder: "",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
          postValidationSetCrossFieldValues: async (currentFieldState) => {
            return {
              DEMO: { value: currentFieldState.value },
              DESCRIPTION: { value: currentFieldState?.optionData?.[0]?.label },
            };
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "START_TIME",
          label: "Start Time",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          format: "HH:mm:ss",
          dependentFields: ["SHIFT_TRAN_CD"],
          runValidationOnDependentFieldsChange: true,
          setValueOnDependentFieldsChange: (dependentFields) => {
            return dependentFields["EDITLOGINSHIFT.SHIFT_TRAN_CD"]
              ?.optionData[0]?.rest?.START_TIME
              ? dependentFields[
                  "EDITLOGINSHIFT.SHIFT_TRAN_CD"
                ].optionData[0]?.rest?.START_TIME?.split(" ")[1]
              : "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "END_TIME",
          label: "End Time",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          dependentFields: ["SHIFT_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            let value =
              dependentFields[
                "EDITLOGINSHIFT.SHIFT_TRAN_CD"
              ].optionData[0]?.rest?.END_TIME?.split(" ")[1];
            return value ? value : "";
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          dependentFields: ["SHIFT_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            let value =
              dependentFields["EDITLOGINSHIFT.SHIFT_TRAN_CD"].optionData[0]
                ?.rest?.ACTIVE === "Y"
                ? true
                : false;
            return value ? value : "";
          },
          GridProps: {
            style: {
              paddingTop: "38px",
            },
            xs: 12,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 2,
          },
        },
      ],
    },
  ],
};

export const LoginBiometricForm = {
  form: {
    name: "LoginBoimetrics",
    label: "LoginBiometric",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          xl: 6,
          md: 6,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "USER_NAME",
      label: "User Name:",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        xl: 12,
        md: 12,
        sm: 12,
        lg: 12,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FINGER_NM",
      label: "Finger",
      placeholder: "",
      txtTransform: "uppercase",
      type: "text",
      GridProps: {
        xs: 12,
        xl: 12,
        md: 12,
        sm: 12,
        lg: 12,
      },
    },
  ],
};
