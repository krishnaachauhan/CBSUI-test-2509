import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";

export const limitEntryMetaData = {
  form: {
    name: "limit-Entry",
    label: " ",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    formStyle: {
      background: "white",
      height: "calc(100vh - 568px)",
      overflowY: "auto",
      overflowX: "hidden",
    },
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
              ACCT_BAL: { value: "" },
            };
          } else if (!field.value) {
            formState.setDataOnFieldChange("VALID_DATA", { VALID_DATA: false });
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
              ACCT_BAL: { value: "" },
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
        // _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: async (field, formState) => {
          formState.setDataOnFieldChange("VALID_DATA", { VALID_DATA: false });
          return {
            PARENT_TYPE: field?.optionData?.[0]?.PARENT_TYPE.trim(),
            ACCT_CD: { value: "" },
            SECURITY_CD: { value: "", isFieldFocused: false },
            ACCT_NM: { value: "" },
            ACCT_BAL: { value: "" },
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
        render: {
          componentType: "textField",
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
          if (
            field?.value &&
            dependentValue?.BRANCH_CD?.value &&
            dependentValue?.ACCT_TYPE?.value
          ) {
            let otherAPIRequestPara = {
              COMP_CD: authState?.companyID,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              GD_TODAY_DT: authState?.workingDate,
              SCREEN_REF: "EMST/046",
            };
            let postData = await API.getLimitEntryData(otherAPIRequestPara);
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
                    formState.setDataOnFieldChange("VALID_DATA", {
                      VALID_DATA: false,
                      HDN_CHARGE_AMT: "",
                      HDN_GST_AMT: "",
                      HDN_GST_ROUND: "",
                      HDN_TAX_RATE: "",
                      SHORT_LMT_VISIBLE: "",
                      SANCTIONED_AMT: "",
                    });
                    return {
                      ACCT_CD: { value: "", isFieldFocused: true },
                      ACCT_NM: { value: "" },
                      TRAN_BAL: { value: "" },
                      SANCTIONED_AMT: { value: "" },
                    };
                  }
                } else {
                  responseData.push(postData[i]);
                }
              }
            }
            if (responseData?.length) {
              formState.setDataOnFieldChange("VALID_DATA", {
                VALID_DATA: true,
                HDN_CHARGE_AMT: responseData?.[0]?.CHARGE_AMT || "0",
                HDN_GST_AMT: responseData?.[0]?.GST_AMT || "0",
                HDN_GST_ROUND: responseData?.[0]?.GST_ROUND || "",
                HDN_TAX_RATE: responseData?.[0]?.TAX_RATE || "0",
                SHORT_LMT_VISIBLE: responseData?.[0]?.SHORT_LMT_VISIBLE,
                SANCTIONED_AMT: responseData?.[0]?.SANCTIONED_AMT,
                COMP_CD: authState?.companyID,
                BRANCH_CD: dependentValue?.BRANCH_CD?.value,
                ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
                ACCT_CD: utilFunction.getPadAccountNumber(
                  field?.value,
                  dependentValue?.ACCT_TYPE?.optionData?.[0]
                ),
              });
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
                ACCT_NM: { value: responseData?.[0]?.ACCT_NM },
                TRAN_BAL: { value: responseData?.[0]?.TRAN_BAL },
                SANCTIONED_AMT: { value: responseData?.[0]?.SANCTIONED_AMT },
                BRANCH_CD: { value: responseData?.[0]?.BRANCH_CD },
                SECURITY_CD: { value: "", isFieldFocused: true },
              };
            }
          } else if (!field?.value) {
            formState.setDataOnFieldChange("VALID_DATA", { VALID_DATA: false });
            return {
              ACCT_NM: { value: "" },
              TRAN_BAL: { value: "" },
              SANCTIONED_AMT: { value: "" },
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
      label: "TranBalance",
      placeholder: "TranBalance",
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
        componentType: "amountField",
      },
      name: "SANCTIONED_AMT",
      label: "SanctionedLimit",
      placeholder: "SanctionedLimit",
      isReadOnly: true,
      sequence: 0,
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
      required: true,
      placeholder: "SelectSecurity",
      dependentFields: ["ACCT_TYPE", "BRANCH_CD", "LIMIT_TYPE"],
      options: (dependentValue, formState, _, authState) => {
        if (
          dependentValue?.ACCT_TYPE?.optionData.length &&
          dependentValue?.BRANCH_CD?.value
        ) {
          let apiReq = {
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.BRANCH_CD?.value,
            A_PARENT_TYPE:
              dependentValue?.ACCT_TYPE?.optionData?.[0]?.PARENT_TYPE.trim(),
          };
          return API.getSecurityListData(apiReq);
        }
        return [];
      },
      disableCaching: true,
      _optionsKey: "getSecurityListData",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        __,
        dependentValue
      ) => {
        if (
          field?.optionData?.[0]?.SECURITY_TYPE &&
          field?.value &&
          dependentValue?.LIMIT_TYPE?.value
        ) {
          formState.setDataOnFieldChange("SECURITY_CODE", {
            SECURITY_CD: field?.value,
            SECURITY_TYPE: field?.optionData?.[0]?.SECURITY_TYPE.trim(),
            LIMIT_MARGIN: field?.optionData?.[0]?.LIMIT_MARGIN,
            LIMIT_TYPE: dependentValue?.LIMIT_TYPE?.value,
          });
          return {
            SECURITY_TYPE: {
              value: field?.value,
            },
            PARENT_TYPE: {
              value:
                dependentValue?.ACCT_TYPE?.optionData?.[0]?.PARENT_TYPE.trim(),
            },
          };
        } else if (!field?.value) {
          formState.setDataOnFieldChange("SECURITY_CODE", {
            SECURITY_CD: "",
            SECURITY_TYPE: "",
            LIMIT_MARGIN: "",
            LIMIT_TYPE: "",
          });
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["SecurityCodeisrequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 5,
        md: 3,
        lg: 2.9,
        xl: 2.9,
      },
    },
    {
      render: {
        componentType: "select",
      },
      name: "LIMIT_TYPE",
      label: "LimitType",
      placeholder: "SelectLimitType",
      defaultValue: "N",
      required: true,
      options: () => {
        return [
          { value: "N", label: "Normal Limit" },
          { value: "A", label: "Ad-hoc Limit" },
        ];
      },
      _optionsKey: "limitTypeList",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["LimitTypeisrequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 3.5,
        md: 2,
        lg: 1.6,
        xl: 1.6,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: {
        xs: 12,
        sm: 0.1,
        md: 0.1,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "SECURITY_DETAIL",
      label: "SecurityDetail",
      dependentFields: ["SECURITY_CD"],
      shouldExclude(fieldData, dependentFields) {
        let value =
          dependentFields?.SECURITY_CD?.optionData?.[0]?.SECURITY_TYPE.trim();
        if (value === "OTH") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 3,
        md: 1.8,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARENT_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SECURITY_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "GET_LIMIT_RATE",
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

export const limitEntryDynamicMetaData = {
  form: {
    name: "limit-Entry-dy",
    label: "Limit5415Entry",
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
        componentType: "hidden",
      },
      name: "ABCNUDNHJ",
    },
  ],
};
