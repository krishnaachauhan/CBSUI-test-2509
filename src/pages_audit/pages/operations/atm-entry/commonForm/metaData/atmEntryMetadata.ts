import { GeneralAPI } from "registry/fns/functions";
import * as API from "../../api";
import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";

export const AtmEntryMetaData = {
  fields: [
    {
      render: {
        componentType: "typography",
      },
      name: "TOTAL",
      label: "",
      fullWidth: true,
      shouldExclude: (field) => {
        if (field?.value) {
          return false;
        }
        return true;
      },
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
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        isReadOnly: (fieldData, dependentFieldsValues, formState) => {
          if (
            Number(formState?.parameter?.USER_ROLE) <
              Number(formState?.parameter?.PARA_311) ||
            formState?.parameter?.FORM_MODE?.value !== "new"
          ) {
            return true;
          } else {
            return false;
          }
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
          return {
            ACCT_TYPE: { value: "" },
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            CUSTOMER_ID: { value: "" },
            MOBILE_NO: { value: "" },
            ORGINAL_NM: { value: "" },
            ACCOUNT_NAME: { value: "" },
            SMS_ALERT: { value: "" },
            SB_ACCT_TYPE: { value: "" },
            SB_ACCT_CD: { value: "" },
            CA_ACCT_TYPE: { value: "" },
            CA_ACCT_CD: { value: "" },
            CC_ACCT_TYPE: { value: "" },
            CC_ACCT_CD: { value: "" },
          };
        },
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        runPostValidationHookAlways: true,
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 4,
          md: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        validationRun: "onChange",
        isFieldFocused: true,
        dependentFields: ["BRANCH_CD"],
        __NEW__: {
          disableCaching: true,
        },
        __EDIT__: {
          disableCaching: true,
        },
        options: (dependent, formState, _, authState) => {
          let BranchCode = dependent?.CA_BRANCH_CD?.value
            ? dependent?.CA_BRANCH_CD?.value
            : authState?.user?.branchCode;
          if (BranchCode) {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD:
                dependent?.BRANCH_CD?.value ?? authState?.user?.branchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: formState?.docCD,
            });
          }
          return [];
        },
        _optionsKey: "securityDropDownListType",
        postValidationSetCrossFieldValues: () => {
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            CUSTOMER_ID: { value: "" },
            MOBILE_NO: { value: "" },
            ORGINAL_NM: { value: "" },
            ACCOUNT_NAME: { value: "" },
            SMS_ALERT: { value: "" },
            SB_ACCT_CD: { value: "" },
            CA_ACCT_CD: { value: "" },
            CC_ACCT_CD: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        isReadOnly: (fieldData, dependentFieldsValues, formState) => {
          if (formState?.parameter?.FORM_MODE !== "new") {
            return true;
          } else {
            return false;
          }
        },
      },
      accountCodeMetadata: {
        isReadOnly: (fieldData, dependent, formState) => {
          if (formState?.parameter?.FORM_MODE !== "new") {
            return true;
          } else {
            return false;
          }
        },
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 5,
          md: 3,
          lg: 3,
          xl: 3,
        },
        name: "ACCT_CD",
        render: {
          componentType: "textField",
        },
        validate: (columnValue) => {
          let regex = /^[^!&]*$/;
          if (!regex.test(columnValue.value)) {
            return "Special Characters (!, &) not Allowed";
          }
          return "";
        },
        dependentFields: ["BRANCH_CD", "ACCT_TYPE"],
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
            formState?.parameter?.FORM_MODE === "new"
          ) {
            let apiRequest = {
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              PARA_602: formState?.parameter?.PARA_602,
              PARA_946: formState?.parameter?.PARA_946,
              SCREEN_REF: formState?.docCD,
              CUSTOMER_ID: "",
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
                    formState.setDataOnFieldChange("RES_DATA", {});
                    return {
                      ACCT_CD: { value: "", isFieldFocused: true },
                      ACCT_NM: { value: "" },
                      CUSTOMER_ID: { value: "" },
                      MOBILE_NO: { value: "" },
                      ORGINAL_NM: { value: "" },
                      ACCOUNT_NAME: { value: "" },
                      SMS_ALERT: { value: "" },
                      CONFIRMED: { value: "" },
                      SB_BRANCH_CD: { value: "" },
                      CA_BRANCH_CD: { value: "" },
                      CC_BRANCH_CD: { value: "" },
                      SB_ACCT_TYPE: { value: "" },
                      CA_ACCT_TYPE: { value: "" },
                      CC_ACCT_TYPE: { value: "" },
                      SB_ACCT_CD: { value: "" },
                      CA_ACCT_CD: { value: "" },
                      CC_ACCT_CD: { value: "" },
                    };
                  } else {
                    formState.setDataOnFieldChange("RES_DATA", {
                      validateData: {
                        ...postData?.[0],
                        COMP_CD: authState?.companyID,
                        BRANCH_CD: dependentValue?.BRANCH_CD?.value,
                        ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
                        ACCT_CD: utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentValue?.ACCT_TYPE?.optionData?.[0]
                        ),
                      },
                      isVisible: true,
                    });
                    isReturn = true;
                  }
                } else {
                  formState.setDataOnFieldChange("RES_DATA", {
                    validateData: {
                      ...postData?.[0],
                      COMP_CD: authState?.companyID,
                      BRANCH_CD: dependentValue?.BRANCH_CD?.value,
                      ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
                      ACCT_CD: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentValue?.ACCT_TYPE?.optionData?.[0]
                      ),
                    },
                    isVisible: true,
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
                ACCT_NM: { value: postData?.[0]?.ACCT_NM },
                CUSTOMER_ID: { value: postData?.[0]?.CUSTOMER_ID },
                MOBILE_NO: { value: postData?.[0]?.MOBILE_NO },
                ORGINAL_NM: { value: postData?.[0]?.ORGINAL_NM },
                ACCOUNT_NAME: { value: postData?.[0]?.ACCOUNT_NAME },
                SMS_ALERT: {
                  value: postData?.[0]?.SMS_ALERT === "Y" ? true : false,
                },
                DISABLE_SMS_ALERT: { value: postData?.[0]?.DISABLE_SMS_ALERT },
                CONFIRMED: { value: postData?.[0]?.CONFIRMED },
                SB_BRANCH_CD: {
                  value: dependentValue?.BRANCH_CD?.value ?? "",
                },
                SB_ACCT_TYPE: {
                  value:
                    postData?.[0]?.PARENT_TYPE === "SB"
                      ? dependentValue?.ACCT_TYPE?.value
                      : "",
                },
                SB_ACCT_CD: {
                  value:
                    postData?.[0]?.PARENT_TYPE === "SB"
                      ? utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentValue?.ACCT_TYPE?.optionData?.[0]
                        )
                      : "",
                },
                CA_BRANCH_CD: {
                  value: dependentValue?.BRANCH_CD?.value ?? "",
                },
                CA_ACCT_TYPE: {
                  value:
                    postData?.[0]?.PARENT_TYPE === "CA"
                      ? dependentValue?.ACCT_TYPE?.value
                      : "",
                },
                CA_ACCT_CD: {
                  value:
                    postData?.[0]?.PARENT_TYPE === "CA"
                      ? utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentValue?.ACCT_TYPE?.optionData?.[0]
                        )
                      : "",
                },
                CC_BRANCH_CD: {
                  value: dependentValue?.BRANCH_CD?.value ?? "",
                },
                CC_ACCT_TYPE: {
                  value:
                    postData?.[0]?.PARENT_TYPE !== "SB" &&
                    postData?.[0]?.PARENT_TYPE !== "CA"
                      ? dependentValue?.ACCT_TYPE?.value
                      : "",
                },
                CC_ACCT_CD: {
                  value:
                    postData?.[0]?.PARENT_TYPE !== "SB" &&
                    postData?.[0]?.PARENT_TYPE !== "CA"
                      ? utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentValue?.ACCT_TYPE?.optionData?.[0]
                        )
                      : "",
                },
              };
            }
          } else if (!field?.value) {
            return {
              ACCT_NM: { value: "" },
              ACCT_BAL: { value: "" },
              CUSTOMER_ID: { value: "" },
              MOBILE_NO: { value: "" },
              ORGINAL_NM: { value: "" },
              ACCOUNT_NAME: { value: "" },
              SMS_ALERT: { value: "" },
              CONFIRMED: { value: "" },
              SB_BRANCH_CD: { value: "" },
              CA_BRANCH_CD: { value: "" },
              CC_BRANCH_CD: { value: "" },
              SB_ACCT_TYPE: { value: "" },
              CA_ACCT_TYPE: { value: "" },
              CC_ACCT_TYPE: { value: "" },
              SB_ACCT_CD: { value: "" },
              CA_ACCT_CD: { value: "" },
              CC_ACCT_CD: { value: "" },
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
      name: "ACCOUNT_NAME",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
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
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2.5,
        lg: 2.5,
        xl: 2.5,
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
        sm: 4.5,
        md: 4.5,
        lg: 4.5,
        xl: 4.5,
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
      placeholder: "EnterNameOnCard",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      maxLength: 18,
      GridProps: {
        xs: 12,
        sm: 4.5,
        md: 5,
        lg: 5,
        xl: 5,
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "MOBILE_NO",
      isReadOnly: true,
      fullWidth: true,
      label: "MobileNo",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "SMS_ALERT",
      label: "SMSAlert",
      fullWidth: true,
      dependentFields: ["DISABLE_SMS_ALERT", "FORM_MODE"],
      isReadOnly: (fieldData, dependentFieldsValues, formState) => {
        if (
          dependentFieldsValues?.DISABLE_SMS_ALERT?.value === "Y" ||
          formState?.FORM_MODE?.value !== "new"
        ) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: {
        xs: 6,
        sm: 3,
        md: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      fullWidth: true,
      name: "SPACER",
      GridProps: {
        xs: 0.9,
        sm: 3.5,
        md: 5,
        lg: 5.5,
        xl: 5.5,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "CARD_PRINT",
      label: "CardPrinting",
      fullWidth: true,
      ignoreInSubmit: true,
      GridProps: {
        xs: 5,
        sm: 2.5,
        md: 2,
        lg: 1.5,
        xl: 1.5,
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
      name: "CONFIRMED",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "SB_BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SB_ACCT_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SB_ACCT_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CA_BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CA_ACCT_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CA_ACCT_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CC_BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CC_ACCT_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CC_ACCT_CD",
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
      name: "ENTERED_BRANCH_CD",
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
      name: "ACCT_CD_COPY",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TEMP",
      ignoreInSubmit: true,
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
          formState.setDataOnFieldChange("IS_VISIBLE", { isVisible: false });
        } else if (acctNo == dependentFields?.ACCT_CD?.value) {
          formState.setDataOnFieldChange("IS_VISIBLE", { isVisible: true });
        }
      },
    },
  ],
};
