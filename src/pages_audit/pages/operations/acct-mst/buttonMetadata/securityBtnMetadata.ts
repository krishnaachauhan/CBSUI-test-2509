import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";
import { format, isAfter, isBefore } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "../api";
import { getPMISCData } from "../api";
import { t } from "i18next";
import i18n from "components/multiLanguage/languagesConfiguration";
import _ from "lodash";
export const securityBtnOTHMetadata = {
  form: {
    name: "securityBtnMetadata",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "SECURITY_OTH",
      removeRowFn: async (fs, name, data, index) => {
        const rowData = data[name][index];
        if (rowData?.TRAN_CD) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "TRAN_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ACTION",
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
          name: "LINE_ID",
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "SPACER1",
          GridProps: { xs: 12, sm: 10, md: 10, lg: 10, xl: 10 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          defaultValue: true,
          GridProps: { xs: 3, sm: 2, md: 1.5, lg: 1, xl: 1 },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            const index = Number(fieldData?.fieldKey?.split("[")[1][0]);
            const jointHolders = formState?.initialVal?.SECURITY_OTH;
            if (!Array?.isArray(jointHolders)) {
              return true;
            }
            if (index + 1 > jointHolders?.length) {
              return true;
            }
            const currentHolder = jointHolders[index];
            const srCd = currentHolder?.TRAN_CD;
            if (!srCd) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "COLLATERAL_NAME",
          label: "OwnerName",
          placeholder: "EnterOwnerName",
          type: "text",
          txtTransform: "uppercase",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["OwnerNameIsRequired"] }],
          },
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "OTH_SEC_TYPE",
          label: "SecurityType",
          required: true,
          options: (dependentValue) => getPMISCData("OTH_SEC"),
          _optionsKey: "getPMISCDatas",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["SecurityTypeIsRequired"] }],
          },
          placeholder: "SelectSecurityType",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CERTI_NO",
          label: "CertiNo",
          placeholder: "EnterCertificateNo",
          type: "text",
          maxLength: 20,
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["CertiNoIsRequired"] }],
          },
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REGISTRATION_NO",
          label: "RegistrationNo",
          placeholder: "EnterRegistrationNo",
          type: "text",
          txtTransform: "uppercase",
          maxLength: 20,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "ISSUE_DATE",
          label: "AsOfDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["AsOfDateIsRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "EXP_DATE",
          label: "DueDate",
          placeholder: "DD/MM/YYYY",
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isBefore(new Date(CurrentField), new Date(workingDate))
            ) {
              return "BackDatenotAllow";
            }
            return "";
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["DueDateRequire"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "COLLATERAL_AMT",
          label: "FaceValue",
          type: "text",
          FormatProps: {
            allowNegative: true,
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["FaceValueIsRequired"] }],
          },
          dependentFields: ["MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let FaceValue = currentField?.value ?? "";
            let Margin =
              dependentFieldValues?.["SECURITY_OTH.MARGIN"]?.value ?? "";
            let EligibleValue = FaceValue - (FaceValue * Margin) / 100;
            return {
              ELIGIBLE_VALUE: {
                value: EligibleValue ?? "",
              },
            };
          },
          GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "MATURED_AMT",
          label: "MaturityValue",
          type: "text",
          FormatProps: {
            allowNegative: true,
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MaturityValueIsRequired"] }],
          },
          GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "MARGIN",
          fullWidth: true,
          label: "Margin",
          required: true,
          defaultValue: (fs) => {
            return fs?.MarginDefaultValue;
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MarginisRequired"] }],
          },
          GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ELIGIBLE_VALUE",
          label: "EligibleValue",
          type: "text",
          FormatProps: {
            allowNegative: true,
          },
          dependentFields: ["COLLATERAL_AMT"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let FaceValue =
              dependentFieldValues?.["SECURITY_OTH.COLLATERAL_AMT"]?.value ??
              "";
            let EligibleValue = currentField?.value ?? "";
            if (
              formState?.isData?.securityType === "P" &&
              FaceValue?.length > 0
            ) {
              let MarginValue = Math.round(
                ((FaceValue - EligibleValue) * 100) / FaceValue
              );
              return {
                MARGIN: {
                  value: MarginValue ?? "",
                },
              };
            }
          },
          GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARK",
          label: "Remarks",
          placeholder: "EnterRemarks",
          autoComplete: "off",
          maxLength: 300,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 8, md: 6, lg: 6, xl: 4 },
        },
      ],
    },
  ],
};
export const securityBtnBFDMetadata = {
  form: {
    name: "securityBtnMetadata",
    label: "Prime Security Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "SECURITY_BFD",
      removeRowFn: async (fs, name, data, index) => {
        const rowData = data[name][index];
        if (rowData?.TRAN_CD) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
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
          name: "TRAN_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ACTION",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "LINE_ID",
        },
        {
          render: { componentType: "_accountNumber" },
          branchCodeMetadata: {
            name: "F_BRANCH_CD",
            runPostValidationHookAlways: true,
            isFieldFocused: true,
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              const isHOBranch = await validateHOBranch(
                currentField,
                formState?.MessageBox,
                authState
              );
              if (isHOBranch) {
                return {
                  F_BRANCH_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
              return {
                COLLATERAL_NAME: { value: "" },
                F_ACCT_TYPE: { value: "" },
                F_ACCT_CD: { value: "", ignoreUpdate: false },
              };
            },
            GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
          },
          accountTypeMetadata: {
            name: "F_ACCT_TYPE",
            dependentFields: ["F_BRANCH_CD"],
            runPostValidationHookAlways: true,
            options: (dependentValue, formState, _, authState) => {
              return API.getFDTypeDDlist({
                COMP_CD: authState?.companyID,
                BRANCH_CD:
                  dependentValue?.["SECURITY_BFD.F_BRANCH_CD"]?.value ??
                  authState?.user?.branchCode ??
                  "",
                SECURITY_TYPE: formState?.isData?.securityOption ?? "",
              });
            },
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              if (currentField?.displayValue !== currentField?.value) {
                return {};
              }
              if (
                currentField?.value &&
                dependentFieldValues?.["SECURITY_BFD?.F_BRANCH_CD"]?.value
                  ?.length === 0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "Alert",
                  message: "EnterAccountBranch",
                  buttonNames: ["Ok"],
                  icon: "WARNING",
                });

                if (buttonName === "Ok") {
                  return {
                    F_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                    F_BRANCH_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else {
                return {
                  F_ACCT_CD: { value: "", ignoreUpdate: false },
                  COLLATERAL_NAME: { value: "" },
                };
              }
            },
            GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
          },
          accountCodeMetadata: {
            name: "F_ACCT_CD",
            autoComplete: "off",
            dependentFields: ["F_ACCT_TYPE", "F_BRANCH_CD"],
            runPostValidationHookAlways: true,
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              if (currentField?.displayValue === "") {
                return {};
              } else if (
                currentField.value &&
                dependentFieldValues?.["SECURITY_BFD?.F_ACCT_TYPE"]?.value
                  ?.length === 0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "Alert",
                  message: "EnterAccountType",
                  buttonNames: ["Ok"],
                  icon: "WARNING",
                });
                if (buttonName === "Ok") {
                  return {
                    ACCT_CD: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: false,
                    },
                    F_ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (
                currentField?.value &&
                dependentFieldValues?.["SECURITY_BFD.F_BRANCH_CD"]?.value &&
                dependentFieldValues?.["SECURITY_BFD.F_ACCT_TYPE"]?.value
              ) {
                const reqParameters = {
                  BRANCH_CD:
                    dependentFieldValues?.["SECURITY_BFD.F_BRANCH_CD"]?.value ??
                    "",
                  COMP_CD: authState?.companyID ?? "",
                  ACCT_TYPE:
                    dependentFieldValues?.["SECURITY_BFD.F_ACCT_TYPE"]?.value ??
                    "",
                  ACCT_CD:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.["SECURITY_BFD.F_ACCT_TYPE"]
                        ?.optionData
                    ) ?? "",
                  SCREEN_REF: formState?.docCD ?? "",
                  GD_TODAY_DT: authState?.workingDate ?? "",
                };
                let postData = await API.getLimitEntryData(reqParameters);
                let btn99, returnVal;
                const getButtonName = async (obj) => {
                  let btnName = await formState.MessageBox(obj);
                  return { btnName, obj };
                };
                for (let i = 0; i < postData?.MSG?.length; i++) {
                  if (postData?.MSG?.[i]?.O_STATUS === "999") {
                    await getButtonName({
                      messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                        ? postData?.MSG?.[i]?.O_MSG_TITLE
                        : "ValidationFailed",
                      message: postData?.MSG?.[i]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    returnVal = "";
                  } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                    if (btn99 !== "No") {
                      await getButtonName({
                        messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                          ? postData?.MSG?.[i]?.O_MSG_TITLE
                          : "Alert",
                        message: postData?.MSG?.[i]?.O_MESSAGE,
                        icon: "WARNING",
                      });
                    }
                    returnVal = postData;
                  } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                    const { btnName } = await getButtonName({
                      messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                        ? postData?.MSG?.[i]?.O_MSG_TITLE
                        : "Confirmation",
                      message: postData?.MSG?.[i]?.O_MESSAGE,
                      buttonNames: ["Yes", "No"],
                      icon: "CONFIRM",
                    });

                    btn99 = btnName;
                    if (btnName === "No") {
                      returnVal = "";
                    }
                  } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                    if (btn99 !== "No") {
                      returnVal = postData;
                    } else {
                      returnVal = "";
                    }
                  }
                }
                btn99 = 0;

                return {
                  F_ACCT_CD:
                    returnVal !== ""
                      ? {
                          value: utilFunction.getPadAccountNumber(
                            currentField?.value,
                            dependentFieldValues?.["SECURITY_BFD?.F_ACCT_TYPE"]
                              ?.optionData
                          ),
                          ignoreUpdate: true,
                          isFieldFocused: false,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: false,
                        },
                  COLLATERAL_NAME: {
                    value: returnVal?.ACCT_NM ?? "",
                  },
                  HIDDEN_SANCTIONED_AMT: {
                    value: returnVal?.SANCTIONED_AMT ?? "",
                  },
                };
              } else if (!currentField?.value) {
                return {
                  COLLATERAL_NAME: { value: "", isFieldFocused: false },
                  CERTI_NO: { value: "" },
                };
              }
              return {};
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
          },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          defaultValue: true,
          GridProps: { xs: 3, sm: 2, md: 1.5, lg: 1, xl: 1 },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            const index = Number(fieldData?.fieldKey?.split("[")[1][0]);
            const jointHolders = formState?.initialVal?.SECURITY_BFD;
            if (!Array?.isArray(jointHolders)) {
              return true;
            }
            if (index + 1 > jointHolders?.length) {
              return true;
            }
            const currentHolder = jointHolders[index];
            const srCd = currentHolder?.TRAN_CD;
            if (!srCd) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "COLLATERAL_NAME",
          label: "AccountName",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "HIDDEN_SANCTIONED_AMT",
          label: "AccountName",
          isReadOnly: true,
          ignoreInSubmit: true,
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CERTI_NO",
          label: "FDNo",
          maxLength: 20,
          dependentFields: [
            "F_BRANCH_CD",
            "F_ACCT_CD",
            "F_ACCT_TYPE",
            "TRAN_DT",
            "SANCTIONED_AMT",
            "PANEL_FLAG",
          ],
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentValue
          ) => {
            if (
              field?.value &&
              dependentValue?.["SECURITY_BFD.F_ACCT_CD"]?.value
            ) {
              let ApiReq = {
                A_FD_COMP_CD: authState?.companyID ?? "",
                A_FD_BRANCH_CD:
                  dependentValue?.["SECURITY_BFD.F_BRANCH_CD"]?.value ?? "",
                A_FD_ACCT_TYPE:
                  dependentValue?.["SECURITY_BFD.F_ACCT_TYPE"]?.value ?? "",
                A_FD_ACCT_CD: utilFunction.getPadAccountNumber(
                  dependentValue?.["SECURITY_BFD.F_ACCT_CD"]?.value,
                  dependentValue?.["SECURITY_BFD.F_ACCT_TYPE"]?.optionData?.[0]
                ),
                A_FD_NO: field?.value ?? "",
                A_SECURITY_TYPE: formState?.isData?.securityOption ?? "",
                A_SECURITY_CD: formState?.isData?.securityCd ?? "",
                A_LOGIN_BRANCH: authState?.user?.branchCode ?? "",
                A_ACCT_MST_LIMIT_AMT:
                  dependentValue?.["SECURITY_BFD.HIDDEN_SANCTIONED_AMT"]
                    ?.value ?? "0",
                A_GD_DATE: authState?.workingDate,
                A_TRAN_DT: authState?.workingDate,
                A_PANEL_FLAG: "",
                A_SCREEN_REF: formState?.docCD,
                A_LANG: i18n.resolvedLanguage,
              };

              let postData = await API.getFDdetailBFD(ApiReq);
              let responseData: any = [];

              if (postData?.length) {
                for (let i = 0; i < postData?.length; i++) {
                  if (postData[i]?.O_STATUS !== "0") {
                    let btnName = await formState?.MessageBox({
                      messageTitle: postData[i]?.O_MSG_TITLE
                        ? postData[i]?.O_MSG_TITLE
                        : postData[i]?.O_STATUS === "999"
                        ? "ValidationFailed"
                        : postData[i]?.O_STATUS === "99"
                        ? "confirmation"
                        : "ALert",
                      message: postData[i]?.O_MESSAGE,
                      buttonNames:
                        postData[i]?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                      icon:
                        postData[i]?.O_STATUS === "999"
                          ? "ERROR"
                          : postData[i]?.O_STATUS === "99"
                          ? "CONFIRM"
                          : "WARNING",
                    });
                    if (btnName === "No" || postData[i]?.O_STATUS === "999") {
                      responseData.push([]);
                      return {
                        SECURITY_VALUE: {
                          value: "",
                        },
                        FD_NO: {
                          value: "",
                          isFieldFocused: true,
                        },
                        EXPIRY_DT: {
                          value: "",
                        },
                        INT_RATE: {
                          value: "",
                        },
                      };
                    }
                  } else {
                    responseData.push(postData[i]);
                  }
                }
              }
              if (responseData?.length) {
                return {
                  SECURITY_VALUE: {
                    value: postData?.[0]?.SECURITY_VALUE,
                  },
                  EXP_DATE: {
                    value: postData?.[0]?.EXPIRY_DT,
                  },
                  ISSUE_DATE: {
                    value: postData?.[0]?.ISSUE_DATE,
                  },
                  COLLATERAL_RATE: {
                    value: postData?.[0]?.INT_RATE,
                  },
                  MATURED_AMT: {
                    value: postData?.[0]?.MATURED_AMT,
                  },
                  TOTAL_VALUE: {
                    value: postData?.[0]?.TOTAL_VALUE,
                  },
                };
              }
            } else if (!field?.value) {
              return {
                SECURITY_VALUE: { value: "" },
                EXP_DATE: { value: "" },
                ISSUE_DATE: { value: "" },
                COLLATERAL_RATE: { value: "" },
                MATURED_AMT: { value: "" },
                TOTAL_VALUE: { value: "" },
                MARGIN: { value: "" },
                ELIGIBLE_VALUE: { value: "" },
              };
            }
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "MATURED_AMT",
          label: "MaturityValue",
          dependentFields: ["F_ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["SECURITY_BFD.F_ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "ISSUE_DATE",
          label: "AsDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "COLLATERAL_AMT",
          label: "FaceValue",
          dependentFields: ["F_ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["SECURITY_BFD.F_ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "EXP_DATE",
          label: "DueDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "ACC_INT",
          label: "AccrdInterest",
          defaultValue: "0.00",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "COLLATERAL_RATE",
          label: "IntRate",
          defaultValue: "0.00",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "TOTAL_VALUE",
          label: "TotalValue",
          isReadOnly: true,
          fullWidth: true,
          dependentFields: ["ELIGIBLE_VALUE", "MARGIN", "F_ACCT_TYPE"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let TotalValue = currentField?.value ?? "";
            let Margin =
              dependentFieldValues?.["SECURITY_BFD.MARGIN"]?.value ?? "";
            let EligibleValue = TotalValue - (TotalValue * Margin) / 100;
            return {
              ELIGIBLE_VALUE: {
                value: EligibleValue ?? "",
              },
            };
          },
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["SECURITY_BFD.F_ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "MARGIN",
          label: "Margin",
          isReadOnly: true,
          fullWidth: true,
          defaultValue: (fs) => {
            return fs?.MarginDefaultValue;
          },
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              if (values.floatValue > 100) {
                return false;
              }
              return true;
            },
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ELIGIBLE_VALUE",
          label: "EligibleValue",
          fullWidth: true,
          dependentFields: ["TOTAL_VALUE", "MARGIN", "F_ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["SECURITY_BFD.F_ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let EligibleValue = currentField?.value ?? "";
            let TotalValue =
              dependentFieldValues?.["SECURITY_BFD.TOTAL_VALUE"]?.value ?? "";
            if (
              formState?.isData?.securityType === "P" &&
              TotalValue?.length > 0
            ) {
              let Margin = Math.round(
                ((TotalValue - EligibleValue) * 100) / TotalValue
              );
              return {
                MARGIN: {
                  value: Margin ?? "",
                },
              };
            }
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARK",
          label: "Remarks",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
      ],
    },
  ],
};
export const securityBtnVEHMetadata = {
  form: {
    name: "securityBtnMetadata",
    label: "Prime Security Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "SECURITY_VEH",
      removeRowFn: async (fs, name, data, index) => {
        const rowData = data[name][index];
        if (rowData?.TRAN_CD) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
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
          name: "TRAN_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ACTION",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "LINE_ID",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "J_TYPE",
          defaultValue: "K   ", // Implement Static K for Vehicle
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          defaultValue: true,
          GridProps: { xs: 3, sm: 2, md: 1.5, lg: 1, xl: 1 },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            const index = Number(fieldData?.fieldKey?.split("[")[1][0]);
            const jointHolders = formState?.initialVal?.SECURITY_VEH;
            if (!Array?.isArray(jointHolders)) {
              return true;
            }
            if (index + 1 > jointHolders?.length) {
              return true;
            }
            const currentHolder = jointHolders[index];
            const srCd = currentHolder?.TRAN_CD;
            if (!srCd) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MAKER",
          label: "MakerName",
          placeholder: "EnterMakerName",
          type: "text",
          required: true,
          maxLength: 40,
          txtTransform: "uppercase",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["OwnerNameIsRequired"] }],
          },
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CITY_SURVEY_NO",
          label: "VehicleNo",
          placeholder: "EnterVehicleNo",
          txtTransform: "uppercase",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "MANUFACTURE",
          label: "YearOfManufacture",
          type: "text",
          maxLength: 4,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value > authState?.workingDate.split("/").pop()) {
              const Btn = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "Year of Mfg. can not be Future Year.",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (Btn === "Ok") {
                return {
                  MANUFACTURE: {
                    value: "",
                  },
                };
              }
            }
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TP_SKIM_NO",
          label: "ChasisNo",
          placeholder: "EnterChasisNo",
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "FINAL_PLOT_NO",
          label: "EngineNo",
          placeholder: "EnterEngineNo",
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REVENUE_SURVEY_NO",
          label: "OwnerName1",
          placeholder: "EnterOwnerName1",
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "select",
          },
          name: "SEIZE",
          label: "HPARTO",
          fullWidth: true,
          options: () => API.getMachineryDtlDefaultDW(),
          _optionsKey: "HPA_RTO",
          defaultValue: "Y",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "Spacer1",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "SQUARE_FOOT",
          label: "OwnerName2",
          placeholder: "EnterOwnerName2",
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "select",
          },
          name: "TC_BOOK",
          label: "TCBookObtained",
          fullWidth: true,
          options: () => API.getMachineryDtlDefaultDW(),
          _optionsKey: "TC_BOOK",
          defaultValue: "",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "Spacer2",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BUILDING_SQUARE_FOOT",
          label: "RCTCBook",
          placeholder: "EnterRCTCBook",
          type: "text",
          txtTransform: "uppercase",
          maxLength: 100,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "SUB_PLOT_NO",
          label: "ModelName",
          placeholder: "EnterModelName",
          type: "text",
          maxLength: 100,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "UN_SPREAD_AREA_SQRFT",
          label: "BillNo",
          placeholder: "EnterBillNo",
          type: "text",
          maxLength: 100,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PLOT_SQUARE_FOOT",
          label: "CertiRegistration",
          placeholder: "EnterCertiRegistration",
          type: "text",
          maxLength: 100,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PERMIT_NO",
          label: "PermitNo",
          placeholder: "EnterPermitNo",
          type: "text",
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "RECEIPT_NO",
          label: "ReceiptNo",
          placeholder: "EnterReceiptNo",
          type: "text",
          maxLength: 20,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "PERMIT_START_DT",
          label: "PermitStartDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "PERMIT_EXPIRY_DT",
          label: "PermitExpiryDate",
          placeholder: "DD/MM/YYYY",
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate ?? "";
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              new Date(CurrentField) < new Date(workingDate)
            ) {
              return "PermitExpiryDatecannotlessthantodaydate";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "PURCHASE_DT",
          label: "PurchaseDate",
          placeholder: "DD/MM/YYYY",
          require: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["PurchaseDateisRequired"] }],
          },
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isAfter(new Date(CurrentField), new Date(workingDate))
            ) {
              return "Futuredatesarenotallowed";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "MFG_DATE",
          label: "ManufacturingDate",
          placeholder: "DD/MM/YYYY",
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isAfter(new Date(CurrentField), new Date(workingDate))
            ) {
              return "Futuredatesarenotallowed";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "HORSE_POWER",
          label: "HorsePower",
          placeholder: "EnterHorsePower",
          type: "text",
          maxLength: 100,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 4.5, xl: 4.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CUBIC_CAPACIY",
          label: "CubicCapacity",
          placeholder: "EnterCubicCapacity",
          type: "text",
          maxLength: 100,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 4.5, xl: 4.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "PURCHASE_AMT",
          label: "CostValue",
          type: "text",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["RequireCostValue"] }],
          },
          dependentFields: ["MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let CostValue = currentField?.value ?? "";
            let Margin =
              dependentFieldValues?.["SECURITY_VEH.MARGIN"]?.value ?? "";
            let EligibleValue = CostValue - (CostValue * Margin) / 100;
            return {
              ELIGIBLE_AMT: {
                value: EligibleValue ?? "",
              },
            };
          },
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              if (values?.value?.length > 12) {
                return false;
              }
              return true;
            },
          },
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "MARGIN",
          fullWidth: true,
          label: "Margin",
          required: true,
          defaultValue: (fs) => {
            return fs?.MarginDefaultValue;
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MarginisRequired"] }],
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ELIGIBLE_AMT",
          label: "EligibleAmount",
          type: "text",
          fullWidth: true,
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              if (values?.value?.length > 15) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["PURCHASE_AMT"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let CostValue =
              dependentFieldValues?.["SECURITY_VEH.PURCHASE_AMT"]?.value ?? "";
            let EligibleValue = currentField?.value ?? "";
            if (
              formState?.isData?.securityType === "P" &&
              CostValue?.length > 0
            ) {
              let MarginValue = Math.round(
                ((CostValue - EligibleValue) * 100) / CostValue
              );
              return {
                MARGIN: {
                  value: MarginValue ?? "",
                },
              };
            }
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "VEHICLE_TYPE",
          label: "VehicleType",
          options: (dependentValue) => getPMISCData("VEHICLE_TYPE"),
          _optionsKey: "getPMISCDataVEH",
          placeholder: "SelectVehicleType",
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "VALUER_CODE",
          label: "ValuerName",
          options: (dependentValue, formState, _, authState) =>
            API.getValuerTypeOp({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            }),
          validate: (value, ...rest) => {
            if (value?.optionData?.[0]?.ACTIVE_FLAG === "N") {
              return "Selectedvaluercodeinactive";
            }
          },
          _optionsKey: "VALUE_CODE",
          placeholder: "SelectVehicleType",
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REGISTRATION_PLACE",
          label: "RegistrationPlace",
          placeholder: "EnterRegistrationPlace",
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "VALUE_AMT",
          label: "ValueAmount",
          type: "text",
          fullWidth: true,
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              if (values?.value?.length > 15) {
                return false;
              }
              return true;
            },
          },
          GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "VALUATION_DT",
          label: "ValuationDate",
          placeholder: "DD/MM/YYYY",
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isAfter(new Date(CurrentField), new Date(workingDate))
            ) {
              return "Futuredatesarenotallowed";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          placeholder: "EnterRemarks",
          autoComplete: "off",
          maxLength: 300,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
      ],
    },
  ],
};
export const securityBtnSTKMetadata = {
  form: {
    name: "securityBtnMetadata",
    label: "Prime Security Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "SECURITY_STK",
      removeRowFn: async (fs, name, data, index) => {
        const rowData = data[name][index];
        if (rowData?.TRAN_CD) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
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
          name: "ACTION",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "TRAN_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "LINE_ID",
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          defaultValue: true,
          GridProps: { xs: 3, sm: 2, md: 1.5, lg: 1, xl: 1 },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            const index = Number(fieldData?.fieldKey?.split("[")[1][0]);
            const jointHolders = formState?.initialVal?.SECURITY_STK;
            if (!Array?.isArray(jointHolders)) {
              return true;
            }
            if (index + 1 > jointHolders?.length) {
              return true;
            }
            const currentHolder = jointHolders[index];
            const srCd = currentHolder?.TRAN_CD;
            if (!srCd) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "GOODS_TYPE",
          label: "GoodsType",
          placeholder: "SelectGoodsType",
          required: true,
          disableCaching: true,
          options: (dependentValue, formState, _, authState) =>
            API.getLimitSecDTL({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              SECURITY_CD: formState?.isData?.securityCode?.value ?? "",
            }),
          _optionsKey: "goodsTypeDdw",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["GoodsTypeisRequired"] }],
          },
          GridProps: { xs: 12, md: 8, sm: 8, lg: 8, xl: 8 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "TOTAL_VALUE",
          label: "TotalValue",
          placeholder: "EnterTotalValue",
          required: true,
          maxLength: 13,
          fullWidth: true,
          dependentFields: ["ELIGIBLE_VALUE", "ABSOLUTE_STOCK", "MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let TotalValue = currentField?.value ?? 0;
            let AbsoluteValue =
              dependentFieldValues?.["SECURITY_STK.ABSOLUTE_STOCK"]?.value ?? 0;
            let Margin =
              dependentFieldValues?.["SECURITY_STK.MARGIN"]?.value ?? 0;
            if (parseFloat(AbsoluteValue) > parseFloat(TotalValue)) {
              const BtnName = await formState?.MessageBox({
                messageTitle: "Data Validation Failed",
                message: "Absolute Stock BD must be less than Total Value.",
                buttonName: ["Ok"],
                icon: "ERROR",
              });
              if (BtnName === "Ok") {
                return {
                  ABSOLUTE_STOCK: { value: "", isFieldFocused: true },
                };
              }
            } else {
              const ActualValues = TotalValue - AbsoluteValue;
              const EligibleValue =
                ActualValues - Math.round((ActualValues * Margin) / 100);
              return {
                ACTUAL_VALUE: {
                  value: ActualValues,
                },
                ELIGIBLE_VALUE: {
                  value: EligibleValue,
                  ignoreUpdate: true,
                },
              };
            }
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["TotalValueisrequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "Spacer1",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ABSOLUTE_STOCK",
          label: "AbsoluteStockBD",
          fullWidth: true,
          maxLength: 15,
          dependentFields: ["ELIGIBLE_VALUE", "TOTAL_VALUE", "MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let AbsoluteValue = currentField?.value;
            let TotalValue =
              dependentFieldValues?.["SECURITY_STK.TOTAL_VALUE"]?.value ?? 0;
            let Margin =
              dependentFieldValues?.["SECURITY_STK.MARGIN"]?.value ?? 0;
            if (parseFloat(AbsoluteValue) > parseFloat(TotalValue)) {
              const BtnName = await formState?.MessageBox({
                messageTitle: "Data Validation Failed",
                message: "Absolute Stock BD must be less than Total Value.",
                buttonName: ["Ok"],
                icon: "ERROR",
              });
              if (BtnName === "Ok") {
                return {
                  ABSOLUTE_STOCK: { value: "", isFieldFocused: true },
                };
              }
            } else {
              const ActualValues = TotalValue - AbsoluteValue;
              const EligibleValue =
                ActualValues - Math.round((ActualValues * Margin) / 100);
              return {
                ACTUAL_VALUE: {
                  value: ActualValues,
                },
                ELIGIBLE_VALUE: {
                  value: EligibleValue,
                  ignoreUpdate: true,
                },
              };
            }
          },
          placeholder: "EnterAbsoluteStockBD",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "Spacer2",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ACTUAL_VALUE",
          label: "ActualValue",
          placeholder: "EnterActualValue",
          required: true,
          fullWidth: true,
          isReadOnly: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ActualValueisRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "Spacer3",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "MARGIN",
          fullWidth: true,
          label: "Margin",
          defaultValue: (fs) => {
            return fs?.MarginDefaultValue;
          },
          required: true,
          dependentFields: ["ACTUAL_VALUE", "ELIGIBLE_VALUE"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let Margin = currentField?.value ?? 0;
            let ActualValue =
              dependentFieldValues?.["SECURITY_STK.ACTUAL_VALUE"]?.value ?? 0;
            if (ActualValue?.length > 0) {
              const EligibleValue = ActualValue - (ActualValue * Margin) / 100;
              return {
                ELIGIBLE_VALUE: {
                  value: EligibleValue,
                },
              };
            }
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MarginisRequired"] }],
          },
          GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ELIGIBLE_VALUE",
          label: "EligibleValue",
          type: "text",
          required: true,
          fullWidth: true,
          maxLength: 13,
          dependentFields: ["ACTUAL_VALUE", "MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let Eligible = currentField?.value ?? 0;
            let ActualValue =
              dependentFieldValues?.["SECURITY_STK.ACTUAL_VALUE"]?.value ?? 0;
            const Margin = ((ActualValue - Eligible) * 100) / ActualValue;
            return {
              MARGIN: {
                value: Margin,
                ignoreUpdate: true,
              },
            };
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MarginisRequired"] }],
          },
          GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "SEC_EXEC_DATE",
          label: "SecurityExecDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: ["SecurityExecDateisRequired"] },
            ],
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          placeholder: "EnterRemarks",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
      ],
    },
  ],
};
export const securityBtnSHMetadata = {
  form: {
    name: "securityBtnMetadata",
    label: "Prime Security Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "SECURITY_SH",
      removeRowFn: async (fs, name, data, index) => {
        const rowData = data[name][index];
        if (rowData?.TRAN_CD) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "TRAN_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
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
          name: "ACTION",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "LINE_ID",
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          defaultValue: true,
          GridProps: { xs: 3, sm: 2, md: 1.5, lg: 1, xl: 1 },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            const index = Number(fieldData?.fieldKey?.split("[")[1][0]);
            const jointHolders = formState?.initialVal?.SECURITY_SH;
            if (!Array?.isArray(jointHolders)) {
              return true;
            }
            if (index + 1 > jointHolders?.length) {
              return true;
            }
            const currentHolder = jointHolders[index];
            const srCd = currentHolder?.TRAN_CD;
            if (!srCd) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "SCRIPT_CD",
          label: "Script",
          options: (dependentValue, formState, _, authState) =>
            API.getScriptDdw({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
            }),
          _optionsKey: "scriptCd",
          placeholder: "PleaseSelectScript",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ScriptisRequired"] }],
          },
          GridProps: { xs: 12, md: 8, sm: 8, lg: 8, xl: 8 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "NO_OF_SHARE",
          label: "NoOfshare",
          placeholder: "EnterNoofShare",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["NoofShareisRequired"] }],
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "CREDITOR",
          label: "FaceValue",
          placeholder: "EnterFaceValue",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["FaceValueisRequired"] }],
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "STOCK_VALUE",
          label: "MarketValue",
          placeholder: "EnterMarketValue",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MarketValueisRequired"] }],
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "MARGIN",
          fullWidth: true,
          label: "Margin",
          defaultValue: (fs) => {
            return fs?.MarginDefaultValue;
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["MarginisRequired"] }],
          },
          GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "DRAWING_POWER",
          label: "EligibleValue",
          fullWidth: true,
          type: "text",
          FormatProps: {
            allowNegative: true,
          },
          GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "ISS_REC_CD",
          label: "DPID",
          placeholder: "SelectDPIP",
          required: true,
          options: (dependentValue, formState, _, authState) =>
            API.getDPIDDdw({
              COMP_CD: authState?.baseCompanyID ?? "",
              BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            }),
          _optionsKey: "DPID",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["DPIDisrequired"] }],
          },
          GridProps: { xs: 12, md: 6, sm: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STOCK_DESC",
          label: "DematAcNo",
          placeholder: "EnterDematAcNo",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "Spacer1",
          GridProps: { xs: 12, md: 6, sm: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          placeholder: "EnterRemarks",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
      ],
    },
  ],
};
export const securityBtnLICMetadata = {
  form: {
    name: "securityBtnMetadata",
    label: "Prime Security Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "SECURITY_LIC",
      removeRowFn: async (fs, name, data, index) => {
        const rowData = data[name][index];
        if (rowData?.TRAN_CD) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
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
          name: "TRAN_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ACTION",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "LINE_ID",
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          defaultValue: true,
          GridProps: { xs: 3, sm: 2, md: 1.5, lg: 1, xl: 1 },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            const index = Number(fieldData?.fieldKey?.split("[")[1][0]);
            const jointHolders = formState?.initialVal?.SECURITY_LIC;
            if (!Array?.isArray(jointHolders)) {
              return true;
            }
            if (index + 1 > jointHolders?.length) {
              return true;
            }
            const currentHolder = jointHolders[index];
            const srCd = currentHolder?.TRAN_CD;
            if (!srCd) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "NAME_OF_HOLDER",
          label: "NameOfHolder",
          placeholder: "EnterNameOfHolder",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ISSUING_AUTHORITY",
          label: "IssuingAuthority",
          placeholder: "EnterIssuingAuthority",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ISSUING_BRANCH",
          label: "IssuingBranch",
          placeholder: "EnterIssuingBranch",
          GridProps: { xs: 12, sm: 8, md: 8, lg: 8, xl: 8 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TERM_AND_TABLE",
          label: "TermandTable",
          placeholder: "EnterTermandTable",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ISSUE_BR_ADD1",
          label: "IssueBranchAdd1",
          placeholder: "EnterIssueBranchAdd1",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ISSUE_BR_ADD2",
          label: "IssueBranchAdd2",
          placeholder: "EnterIssueBranchAdd2",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "POLICY_TYPE",
          label: "PolicyType",
          placeholder: "EnterPolicyType",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "POLICY_NO",
          label: "PolicyNo",
          fullWidth: true,
          placeholder: "PleaseEnterPolicyNo",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "PAYMENT_MODE",
          label: "PaymentMode",
          placeholder: "SelectPaymentmode",
          options: () => API.getPaymentModeddw(),
          _optionsKey: "paymentMode",
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "REF_AMT",
          label: "RefAmt",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "SENT_DATE",
          label: "SentDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ASSURED_SUM",
          label: "AssuredSum",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "REFUND_DATE",
          label: "RefundDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "PREMIUM_AMT",
          label: "PremiumAmt",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "MATURITY_DATE",
          label: "MaturityDate",
          placeholder: "DD/MM/YYYY",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["maturityDateRequired"] }],
          },
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isBefore(new Date(CurrentField), new Date(workingDate))
            ) {
              return "BackDatenotAllow";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SURRENDER_VALUE",
          label: "SurrenderValue",
          type: "text",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["SurrenderValueisrequired"] }],
          },
          dependentFields: ["ELIGIBLE_VALUE", "MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let FaceValue = currentField?.value ?? "";
            let Margin =
              dependentFieldValues?.["SECURITY_LIC.MARGIN"]?.value ?? "";
            let EligibleValue = FaceValue - (FaceValue * Margin) / 100;
            return {
              ELIGIBLE_VALUE: {
                value: EligibleValue ?? "",
                ignoreUpdate: true,
              },
            };
          },
          fullWidth: true,
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "ENCASHMENT_DATE",
          label: "EncashmentDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "ENCASHMENT_DATE",
          label: "EncashmentDate",
          placeholder: "DD/MM/YYYY",
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isBefore(new Date(CurrentField), new Date(workingDate))
            ) {
              return "BackDatenotAllow";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "TOTAL_PREMIUM_PAID",
          label: "PremiumPaid",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "RECIEVED_DATE",
          label: "RecievedDate",
          placeholder: "DD/MM/YYYY",
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              isBefore(new Date(CurrentField), new Date(workingDate))
            ) {
              return "BackDatenotAllow";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "rateOfInt",
          },
          name: "MARGIN",
          fullWidth: true,
          label: "Margin",
          defaultValue: (fs) => {
            return fs?.MarginDefaultValue;
          },
          dependentFields: ["SURRENDER_VALUE", "ELIGIBLE_VALUE"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let Margin = currentField?.value ?? 0;
            let ActualValue =
              dependentFieldValues?.["SECURITY_STK.SURRENDER_VALUE"]?.value ??
              0;
            if (ActualValue?.length > 0) {
              const EligibleValue = ActualValue - (ActualValue * Margin) / 100;
              return {
                ELIGIBLE_VALUE: {
                  value: EligibleValue,
                  ignoreUpdate: true,
                },
              };
            }
          },
          GridProps: { xs: 12, md: 2, sm: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "COMMENCEMENT_DATE",
          label: "CommencementDate",
          placeholder: "DD/MM/YYYY",
          validate: (value) => {
            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "ELIGIBLE_VALUE",
          label: "EligibleValue",
          type: "text",
          FormatProps: {
            allowNegative: true,
          },
          dependentFields: ["SURRENDER_VALUE", "MARGIN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            let EligibleValue = currentField?.value ?? "";
            let SurrenderValue =
              dependentFieldValues?.["SECURITY_LIC.SURRENDER_VALUE"]?.value ??
              "";
            if (
              formState?.isData?.securityType === "P" &&
              SurrenderValue?.length > 0
            ) {
              let Margin = Math.round(
                ((SurrenderValue - EligibleValue) * 100) / SurrenderValue
              );
              return {
                MARGIN: {
                  value: Margin ?? "",
                  ignoreUpdate: true,
                },
              };
            }
          },
          fullWidth: true,
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ALWAYSAVAILABLE",
          label: "Endorsement Status",
          GridProps: { xs: 12, md: 3, sm: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          placeholder: "EnterRemarks",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
      ],
    },
  ],
};
