import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../../api";
import { style } from "@mui/system";

export const atmentrymetadata = {
  fields: [
    {
      render: {
        componentType: "typography",
      },
      name: "TOTAL",
      label: "",
      shouldExclude: (field) => {
        if (field?.value) {
          return false;
        }
        return true;
      },
      fullWidth: true,
      TypographyProps: { variant: "subtitle2" },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
        pt: "6px !important",
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      fullWidth: true,
      // isFieldFocused: true,
      placeholder: "EnterCustomerId",
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (formState?.parameter?.FORM_MODE !== "new") {
          return true;
        } else {
          return false;
        }
      },
      FormatProps: {
        decimalScale: 0,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          const numericLength = values?.value?.replace(/[^0-9]/g, "").length;
          if (numericLength > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CustomerIDisrequired"] }],
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value) {
          let apiRequest = {
            ACCT_CD: "",
            ACCT_TYPE: "",
            BRANCH_CD: "",
            PARA_602: formState?.parameter?.PARA_602,
            PARA_946: formState?.parameter?.PARA_946,
            SCREEN_REF: formState?.docCD,
            CUSTOMER_ID: field?.value,
          };

          let postData = await API.validateAcctAndCustId(apiRequest);
          let apiRespMSGdata = postData?.[0]?.MSG;
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
                  apiRespMSGdata[i]?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                  apiRespMSGdata[i]?.O_STATUS,
                  apiRespMSGdata[i]?.O_STATUS === "999"
                    ? "ERROR"
                    : apiRespMSGdata[i]?.O_STATUS === "99"
                    ? "CONFIRM"
                    : "WARNING"
                );
                if (btnName.buttonName === "No" || btnName.status === "999") {
                  formState.setDataOnFieldChange("RES_DATA", {
                    validateData: {},
                    isVisible: false,
                  });
                  return {
                    CUSTOMER_ID: { value: "", isFieldFocused: true },
                    CUSTOMER_ID_COPY: { value: "" },
                    MOBILE_NO: { value: "" },
                    ORGINAL_NM: { value: "" },
                    ACCT_NM: { value: "" },
                    ACCOUNT_NAME: { value: "" },
                    SMS_ALERT: { value: "" },
                    DISABLE_SMS_ALERT: { value: "" },
                    CONFIRMED: { value: "" },
                    SB_ACCT_TYPE: { value: "" },
                    SB_ACCT_CD: { value: "" },
                    SB_ACCT_NM: { value: "" },
                    CA_ACCT_TYPE: { value: "" },
                    CA_ACCT_CD: { value: "" },
                    CA_ACCT_NM: { value: "" },
                    CC_ACCT_TYPE: { value: "" },
                    CC_ACCT_CD: { value: "" },
                    CC_ACCT_NM: { value: "" },
                  };
                } else {
                  formState.setDataOnFieldChange("RES_DATA", {
                    validateData: {
                      ...postData?.[0],
                    },
                  });
                  isReturn = true;
                }
              } else {
                formState.setDataOnFieldChange("RES_DATA", {
                  validateData: {
                    ...postData?.[0],
                  },
                  isVisible: true,
                });
                isReturn = true;
              }
            }
          }
          if (Boolean(isReturn)) {
            return {
              CUSTOMER_ID_COPY: { value: field?.value },
              ORGINAL_NM: { value: postData?.[0]?.ORGINAL_NM },
              ACCT_NM: { value: postData?.[0]?.ACCT_NM },
              ACCOUNT_NAME: { value: postData?.[0]?.ACCOUNT_NAME },
              MOBILE_NO: { value: postData?.[0]?.MOBILE_NO },
              SMS_ALERT: { value: postData?.[0]?.SMS_ALERT },
              DISABLE_SMS_ALERT: { value: postData?.[0]?.DISABLE_SMS_ALERT },
              CONFIRMED: { value: postData?.[0]?.CONFIRMED },
              SB_ACCT_TYPE: { value: "" },
              SB_ACCT_CD: { value: "" },
              SB_ACCT_NM: { value: "" },
              CA_ACCT_TYPE: { value: "" },
              CA_ACCT_CD: { value: "" },
              CA_ACCT_NM: { value: "" },
              CC_ACCT_TYPE: { value: "" },
              CC_ACCT_CD: { value: "" },
              CC_ACCT_NM: { value: "" },
            };
          }
        } else if (!field?.value) {
          return {
            CUSTOMER_ID_COPY: { value: "" },
            MOBILE_NO: { value: "" },
            ORGINAL_NM: { value: "" },
            ACCT_NM: { value: "" },
            ACCOUNT_NAME: { value: "" },
            SMS_ALERT: { value: "" },
            DISABLE_SMS_ALERT: { value: "" },
            CONFIRMED: { value: "" },
            SB_ACCT_TYPE: { value: "" },
            SB_ACCT_CD: { value: "" },
            SB_ACCT_NM: { value: "" },
            CA_ACCT_TYPE: { value: "" },
            CA_ACCT_CD: { value: "" },
            CA_ACCT_NM: { value: "" },
            CC_ACCT_TYPE: { value: "" },
            CC_ACCT_CD: { value: "" },
            CC_ACCT_NM: { value: "" },
          };
        }
        return {};
      },
      runPostValidationHookAlways: true,

      GridProps: {
        xs: 12,
        sm: 4,
        md: 2.5,
        lg: 1.7,
        xl: 1.7,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ORGINAL_NM",
      label: "AcctOrignalName",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 8,
        md: 3.5,
        lg: 2.8,
        xl: 2.8,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "NameOnCard",
      required: true,
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      //   maxLength: 18,
      GridProps: {
        xs: 12,
        sm: 8,
        md: 3.5,
        lg: 2.8,
        xl: 2.8,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "MOBILE_NO",
      fullWidth: true,
      isReadOnly: true,
      label: "MobileNo",
      GridProps: {
        style: { paddingTop: "40px !important" },
        xs: 12,
        sm: 4,
        md: 2.5,
        lg: 1.7,
        xl: 1.7,
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "SMS_ALERT",
      label: "SMSAlert",
      fullWidth: true,
      dependentFields: ["DISABLE_SMS_ALERT"],
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (
          dependentFieldsValues?.DISABLE_SMS_ALERT?.value === "Y" ||
          formState?.parameter?.FORM_MODE !== "new"
        ) {
          return true;
        } else {
          return false;
        }
      },

      GridProps: {
        style: { paddingTop: "40px" },
        xs: 12,
        sm: 4,
        md: 3,
        lg: 1.4,
        xl: 1.4,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
      label: "spacer",
      ignoreInSubmit: true,
      fullWidth: true,
      GridProps: {
        xs: 0,
        sm: 5,
        md: 7,
        lg: 0.1,
        xl: 0.1,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "CARD_PRINT",
      label: "CardPrinting",
      ignoreInSubmit: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.4,
        xl: 1.4,
      },
    },

    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        validationRun: "all",
        fullWidth: true,
        label: "SBAccountBranch",
        name: "SB_BRANCH_CD",
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        dependentFields: ["SB_PROTECT"],

        isReadOnly: (fieldData, dependent, formState) => {
          if (
            Number(formState?.auth?.role) <
              Number(formState?.parameter?.PARA_311) ||
            (formState?.parameter?.FORM_MODE !== "new" &&
              dependent?.SB_PROTECT?.value === "Y")
          ) {
            return true;
          } else {
            return false;
          }
        },

        postValidationSetCrossFieldValues: (field, formState) => {
          return {
            SB_ACCT_TYPE: { value: "" },
            SB_ACCT_CD: { value: "" },
            SB_ACCT_NM: { value: "" },
          };
        },

        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
      accountTypeMetadata: {
        label: "SBAccountType",
        fullWidth: true,
        name: "SB_ACCT_TYPE",
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        validationRun: "all",
        __NEW__: {
          disableCaching: true,
        },
        __EDIT__: {
          disableCaching: true,
        },
        dependentFields: ["SB_BRANCH_CD", "SB_PROTECT"],
        isReadOnly: (fieldData, dependent, formState) => {
          if (
            formState?.parameter?.FORM_MODE !== "new" &&
            dependent?.SB_PROTECT?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        options: (dependent, formState, _, authState) => {
          let BranchCode = dependent?.SB_BRANCH_CD?.value
            ? dependent?.SB_BRANCH_CD?.value
            : authState?.user?.branchCode;
          if (BranchCode) {
            return API.acctTypeList({
              COMP_CD: authState?.companyID,
              BRANCH_CD: BranchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: "SB",
            });
          }
          return [];
        },
        _optionsKey: "acctTypeList",
        postValidationSetCrossFieldValues: (field, formState) => {
          return {
            SB_ACCT_CD: { value: "" },
            SB_ACCT_NM: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
      accountCodeMetadata: {
        label: "SBAccountCode",
        name: "SB_ACCT_CD",
        fullWidth: true,
        isReadOnly: (fieldData, dependent, formState) => {
          if (
            formState?.parameter?.FORM_MODE !== "new" &&
            dependent?.SB_PROTECT?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        GridProps: {
          xs: 12,
          sm: 5,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        dependentFields: [
          "SB_BRANCH_CD",
          "SB_ACCT_TYPE",
          "CUSTOMER_ID",
          "SB_PROTECT",
        ],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            field?.value &&
            dependentValue?.CUSTOMER_ID?.value &&
            dependentValue?.SB_BRANCH_CD?.value &&
            dependentValue?.SB_ACCT_TYPE?.value
          ) {
            let apiRequest = {
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.SB_ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.SB_ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.SB_BRANCH_CD?.value,
              PARA_602: formState?.parameter?.PARA_602,
              PARA_946: formState?.parameter?.PARA_946,
              SCREEN_REF: formState?.docCD,
              CUSTOMER_ID: dependentValue?.CUSTOMER_ID?.value,
            };

            let postData = await API.validateAcctAndCustId(apiRequest);
            let apiRespMSGdata = postData?.[0]?.MSG;
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
                    return {
                      SB_ACCT_CD: { value: "", isFieldFocused: true },
                      SB_ACCT_NM: { value: "" },
                    };
                  } else {
                    isReturn = true;
                  }
                } else {
                  isReturn = true;
                }
              }
            }
            if (Boolean(isReturn)) {
              return {
                SB_ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    field?.value,
                    dependentValue?.ACCT_TYPE?.optionData?.[0]
                  ),
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },
                SB_ACCT_NM: { value: postData?.[0]?.ACCT_NM },
              };
            }
          } else if (!field?.value) {
            return {
              SB_ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "SB_ACCT_NM",
      label: "SBAccountName",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 7,
        md: 4.5,
        lg: 4.5,
        xl: 4.5,
      },
    },

    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        label: "CAAccountBranch",
        name: "CA_BRANCH_CD",
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        validationRun: "all",
        dependentFields: ["CA_PROTECT"],

        isReadOnly: (fieldData, dependent, formState) => {
          if (
            Number(formState?.auth?.role) <
              Number(formState?.parameter?.PARA_311) ||
            (formState?.parameter?.FORM_MODE !== "new" &&
              dependent?.CA_PROTECT?.value === "Y")
          ) {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossFieldValues: (field, formState) => {
          return {
            CA_TYPE_CD: { value: "" },
            CA_ACCT_CD: { value: "" },
            CA_ACCT_NM: { value: "" },
          };
        },

        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
      accountTypeMetadata: {
        label: "CAAccountType",
        name: "CA_ACCT_TYPE",
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        validationRun: "all",
        dependentFields: ["CA_BRANCH_CD", "CA_PROTECT"],
        __NEW__: {
          disableCaching: true,
        },
        __EDIT__: {
          disableCaching: true,
        },
        isReadOnly: (fieldData, dependent, formState) => {
          if (
            formState?.parameter?.FORM_MODE !== "new" &&
            dependent?.CA_PROTECT?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        options: (dependent, formState, _, authState) => {
          let BranchCode = dependent?.CA_BRANCH_CD?.value
            ? dependent?.CA_BRANCH_CD?.value
            : authState?.user?.branchCode;
          if (BranchCode) {
            return API.acctTypeList({
              COMP_CD: authState?.companyID,
              BRANCH_CD: BranchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: "CA",
            });
          }
          return [];
        },
        _optionsKey: "CAacctTypeList",
        postValidationSetCrossFieldValues: (field, formState) => {
          return {
            CA_ACCT_CD: { value: "" },
            CA_ACCT_NM: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
      accountCodeMetadata: {
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        label: "CAAccountCode",
        name: "CA_ACCT_CD",

        dependentFields: [
          "CA_BRANCH_CD",
          "CA_ACCT_TYPE",
          "CUSTOMER_ID",
          "CA_PROTECT",
        ],
        isReadOnly: (fieldData, dependent, formState) => {
          if (
            formState?.parameter?.FORM_MODE !== "new" &&
            dependent?.CA_PROTECT?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },

        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            field?.value &&
            dependentValue?.CUSTOMER_ID?.value &&
            dependentValue?.CA_BRANCH_CD?.value &&
            dependentValue?.CA_ACCT_TYPE?.value
          ) {
            let apiRequest = {
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.CA_ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.CA_ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.CA_BRANCH_CD?.value,
              PARA_602: formState?.parameter?.PARA_602,
              PARA_946: formState?.parameter?.PARA_946,
              SCREEN_REF: formState?.docCD,
              CUSTOMER_ID: dependentValue?.CUSTOMER_ID?.value,
            };

            let postData = await API.validateAcctAndCustId(apiRequest);
            let apiRespMSGdata = postData?.[0]?.MSG;
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
                    return {
                      CA_ACCT_CD: {
                        value: field?.value,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                      CA_ACCT_NM: { value: "" },
                    };
                  } else {
                    isReturn = true;
                  }
                } else {
                  isReturn = true;
                }
              }
            }
            if (Boolean(isReturn)) {
              return {
                CA_ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    field?.value,
                    dependentValue?.CA_ACCT_TYPE?.optionData?.[0]
                  ),
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },
                CA_ACCT_NM: { value: postData?.[0]?.ACCT_NM },
              };
            }
          } else if (!field?.value) {
            return {
              CA_ACCT_NM: { value: "" },
            };
          }

          return {};
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CA_ACCT_NM",
      label: "CAAccountName",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 7,
        md: 4.5,
        lg: 4.5,
        xl: 4.5,
      },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        label: "ODAccountBranch",
        fullWidth: true,
        name: "CC_BRANCH_CD",
        dependentFields: ["CC_PROTECT"],

        isReadOnly: (fieldData, dependent, formState) => {
          if (
            Number(formState?.auth?.role) <
              Number(formState?.parameter?.PARA_311) ||
            (formState?.parameter?.FORM_MODE !== "new" &&
              dependent?.CC_PROTECT?.value === "Y")
          ) {
            return true;
          } else {
            return false;
          }
        },
        validationRun: "all",
        postValidationSetCrossFieldValues: (field, formState) => {
          return {
            CC_ACCT_TYPE: { value: "" },
            CC_ACCT_CD: { value: "" },
            CC_ACCT_NM: { value: "" },
          };
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
        runPostValidationHookAlways: true,
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
      },
      accountTypeMetadata: {
        label: "ODAccountType",
        name: "CC_ACCT_TYPE",
        fullWidth: true,
        validationRun: "all",
        __NEW__: {
          disableCaching: true,
        },
        __EDIT__: {
          disableCaching: true,
        },
        dependentFields: ["CC_BRANCH_CD", "CC_PROTECT"],
        isReadOnly: (fieldData, dependent, formState) => {
          if (
            formState?.parameter?.FORM_MODE !== "new" &&
            dependent?.CC_PROTECT?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        options: (dependent, formState, _, authState) => {
          let BranchCode = dependent?.CC_BRANCH_CD?.value
            ? dependent?.CC_BRANCH_CD?.value
            : authState?.user?.branchCode;
          if (BranchCode) {
            return API.acctTypeList({
              COMP_CD: authState?.companyID,
              BRANCH_CD: BranchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: "OD",
            });
          }
          return [];
        },
        _optionsKey: "CCacctTypeList",
        postValidationSetCrossFieldValues: (field, formState) => {
          return {
            CC_ACCT_CD: { value: "" },
            CC_ACCT_NM: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
      },
      accountCodeMetadata: {
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        label: "ODAccountCode",
        name: "CC_ACCT_CD",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        isReadOnly: (fieldData, dependent, formState) => {
          if (
            formState?.parameter?.FORM_MODE !== "new" &&
            dependent?.CC_PROTECT?.value === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        dependentFields: [
          "CC_BRANCH_CD",
          "CC_ACCT_TYPE",
          "CUSTOMER_ID",
          "CC_PROTECT",
        ],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            field?.value &&
            dependentValue?.CUSTOMER_ID?.value &&
            dependentValue?.CC_BRANCH_CD?.value &&
            dependentValue?.CC_ACCT_TYPE?.value
          ) {
            let apiRequest = {
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.CC_ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.CC_ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.CC_BRANCH_CD?.value,
              PARA_602: formState?.parameter?.PARA_602,
              PARA_946: formState?.parameter?.PARA_946,
              SCREEN_REF: formState?.docCD,
              CUSTOMER_ID: dependentValue?.CUSTOMER_ID?.value,
            };
            let postData = await API.validateAcctAndCustId(apiRequest);
            let apiRespMSGdata = postData?.[0]?.MSG;
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
                    return {
                      CC_ACCT_CD: { value: "", isFieldFocused: true },
                      CC_ACCT_NM: { value: "" },
                    };
                  } else {
                    isReturn = true;
                  }
                } else {
                  isReturn = true;
                }
              }
            }
            if (Boolean(isReturn)) {
              return {
                CC_ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    field?.value,
                    dependentValue?.CC_ACCT_TYPE?.optionData?.[0]
                  ),
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },
                CC_ACCT_NM: { value: postData?.[0]?.ACCT_NM },
              };
            }
          } else if (!field?.value) {
            return {
              CC_ACCT_NM: { value: "" },
            };
          }

          return {};
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CC_ACCT_NM",
      label: "ODAccountName",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 7,
        md: 4.5,
        lg: 4.5,
        xl: 4.5,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_SMS_ALERT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SB_PROTECT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CA_PROTECT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CC_PROTECT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CUSTOMER_ID_COPY",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONFIRMED",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCOUNT_NAME",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_COMP_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TEMP",
      ignoreInSubmit: true,
      dependentFields: ["CUSTOMER_ID", "CUSTOMER_ID_COPY"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields?.CUSTOMER_ID?.value;
      },
      validationRun: "all",
      postValidationSetCrossFieldValues: (
        field,
        formState,
        auth,
        dependentFields
      ) => {
        if (
          dependentFields?.CUSTOMER_ID?.value &&
          dependentFields?.CUSTOMER_ID_COPY?.value !=
            dependentFields?.CUSTOMER_ID?.value
        ) {
          formState.setDataOnFieldChange("IS_VISIBLE", { isVisible: false });
        } else if (
          dependentFields?.CUSTOMER_ID?.value &&
          dependentFields?.CUSTOMER_ID_COPY?.value ==
            dependentFields?.CUSTOMER_ID?.value
        ) {
          formState.setDataOnFieldChange("IS_VISIBLE", { isVisible: true });
        }
      },
    },
  ],
};
