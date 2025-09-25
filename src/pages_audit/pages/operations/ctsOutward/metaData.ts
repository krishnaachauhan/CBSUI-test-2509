import { utilFunction } from "@acuteinfo/common-base";
import {
  BankMasterValidate,
  getAccountSlipJoinDetail,
  getBankChequeAlert,
  getBatchIDList,
} from "./api";
import { GridMetaDataType } from "@acuteinfo/common-base";
import { format, isValid } from "date-fns";
import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { validateHOBranch } from "components/utilFunction/function";
import { t } from "i18next";
export const CTSOutwardClearingFormMetaData = {
  form: {
    name: "ctsOWClearing",
    label: "",
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
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "PresentmentDate",
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      dependentFields: [
        "WORKING_DT",
        "ZONE_TRAN_TYPE",
        "DISABLE_TRAN_DATE",
        "ZONE",
      ],
      validate: (currentField, dependentField) => {
        let formatdate = new Date(currentField?.value);
        if (Boolean(formatdate) && !isValid(formatdate)) {
          return "Mustbeavaliddate";
        }
        if (dependentField?.ZONE_TRAN_TYPE?.value === "S") {
          if (
            new Date(currentField?.value) <
            new Date(dependentField?.WORKING_DT?.value)
          ) {
            return "ClearingDateshouldbegreaterthanorequaltoWorkingDate";
          }
        } else {
          if (
            new Date(currentField?.value) >
            new Date(dependentField?.WORKING_DT?.value)
          ) {
            return "ClearingReturnDateshouldbeLessthanorequaltoWorkingDate";
          }
        }
        return "";
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (
          field.value &&
          dependentFieldsValues?.["ZONE"]?.value &&
          dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value
        ) {
          const request = {
            TRAN_DT: format(new Date(field.value ?? ""), "dd/MMM/yyyy"),
            TRAN_TYPE: dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value ?? "",
            ZONE: dependentFieldsValues?.["ZONE"]?.value ?? "0   ",
          };
          let postData = await API.getSlipNumber(request);
          return {
            SLIP_CD: {
              value: postData?.[0]?.SLIP_NO ?? "",
              ignoreUpdate: true,
            },
          };
        }
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ZONE",
      label: "Zone",
      placeholder: "SelectZone",
      defaultValueKey: "getZoneDefaultVal",
      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
      skipDefaultOption: true,
      options: "getZoneListData",
      _optionsKey: "getZoneListData",
      runPostValidationHookAlways: true,
      dependentFields: ["TRAN_DT", "ZONE_TRAN_TYPE"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("ZONE_VALUE", field?.value);
        if (
          field.value &&
          dependentFieldsValues?.["TRAN_DT"]?.value &&
          dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value
        ) {
          const request = {
            TRAN_DT: format(
              new Date(dependentFieldsValues?.["TRAN_DT"]?.value ?? ""),
              "dd/MMM/yyyy"
            ),
            TRAN_TYPE: dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value ?? "",
            ZONE: field?.value ?? "0   ",
          };
          let postData = await API.getSlipNumber(request);
          return {
            SLIP_CD: {
              value: postData?.[0]?.SLIP_NO ?? "",
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BATCH_ID",
      label: "Session ID",
      placeholder: "",
      type: "text",
      dependentFields: ["DISABLE_BATCH_ID"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_BATCH_ID?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      options: async (dependentValue, formState, _, authState) => {
        return await API.getBatchIDList({
          BRANCH_CD: authState?.user?.baseBranchCode,
          COMP_CD: authState?.companyID,
        });

        return [];
      },
      _optionsKey: "getRtgsTransactionTypeList",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SLIP_CD",
      label: "SlipNo",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
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
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            ACCT_CD: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_NAME: { value: "" },
            TRAN_BAL: { value: "" },
          };
        },
      },

      accountTypeMetadata: {
        GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
        isFieldFocused: true,
        defaultfocus: true,
        defaultValue: "",
        validationRun: "all",
        runPostValidationHookAlways: true,
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "TRN/559",
          });
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (field?.value) {
            formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", {
              ACCT_TYPE: field?.value,
              BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
              COMP_CD: auth?.companyID ?? "",
            });
          }
          formState.setDataOnFieldChange("ACCT_CD_BLANK");

          return {
            ACCT_CD: { value: "", ignoreUpdate: true },
            ACCT_NAME: { value: "" },
            TRAN_BAL: { value: "" },
            AMOUNT: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        fullWidth: true,
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 6) {
              return false;
            }
            return true;
          },
        },
        disableCaching: false,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (
            field.value &&
            dependentFieldsValues?.["ACCT_TYPE"]?.value &&
            dependentFieldsValues?.["BRANCH_CD"]?.value
          ) {
            if (formState?.isSubmitting) return {};
            let Apireq = {
              COMP_CD: auth?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentFieldsValues?.["ACCT_TYPE"]?.optionData
              ),
              ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
              BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
              GD_TODAY_DT: auth?.workingDate,
              SCREEN_REF: formState?.docCD,
            };
            formState?.handleDisableButton(true);
            let postData = await getAccountSlipJoinDetail(Apireq);
            formState.setDataOnFieldChange("API_REQ", {
              ...Apireq,
              ...postData,
            });

            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.[0]?.MSG?.length; i++) {
              if (postData?.[0]?.MSG?.[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
                formState.setDataOnFieldChange("ACCT_CD_BLANK");
                formState?.handleDisableButton(false);
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                formState?.handleDisableButton(false);
                returnVal = postData?.[0];
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                formState?.handleDisableButton(false);
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "0") {
                formState.setDataOnFieldChange("ACCT_CD_VALID", postData?.[0]);
                formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", Apireq);
                if (btn99 !== "No") {
                  returnVal = postData?.[0];
                } else {
                  returnVal = "";
                }
                formState?.handleDisableButton(false);
              }
            }
            btn99 = 0;
            formState?.handleDisableButton(false);
            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentFieldsValues?.ACCT_TYPE?.optionData
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_NAME: {
                value: returnVal?.ACCT_NM ?? "",
              },
              TRAN_BAL: { value: returnVal.TRAN_BAL ?? "" },
            };
          } else {
            formState.setDataOnFieldChange("ACCT_CD_BLANK");
            return {
              ACCT_CD: {
                value: "",
              },
              ACCT_NAME: { value: "" },
              TRAN_BAL: { value: "" },
              AMOUNT: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NAME",
      label: "Account_Name",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "SlipAmount",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },

      postValidationSetCrossFieldValues: async (
        currentFieldState,
        formState
      ) => {
        if (currentFieldState?.value) {
          formState.setDataOnFieldChange(
            "AMOUNT",
            currentFieldState?.value ?? "0"
          );
        } else {
          formState.setDataOnFieldChange("AMOUNT", "");
        }
      },
      GridProps: { xs: 12, sm: 2.4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BY",
      label: "Maker",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_DATE",
      label: "MakerTime",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      __VIEW__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "CONFIRMED_FLAG",
      label: "ConfirmStatus",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 1.1, md: 1.1, lg: 1.1, xl: 1.1 },
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
      name: "VERIFIED_BY",
      label: "Checker",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      dependentFields: ["CONFIRMED_FLAG"],
      __VIEW__: { render: { componentType: "textField" } },
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.CONFIRMED_FLAG?.value === "Pending") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 1.3, md: 1.2, lg: 1.2, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VERIFIED_DATE",
      label: "CheckerTime",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      __VIEW__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      dependentFields: ["CONFIRMED_FLAG"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.CONFIRMED_FLAG?.value === "Pending") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ZONE_TRAN_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "WORKING_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_TRAN_DATE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_BATCH_ID",
    },
  ],
};
export const InwardReturnFormMetaData = {
  form: {
    name: "ctsOWClearing",
    label: "",
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
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "PresentmentDate",
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 1.7 },
      dependentFields: [
        "WORKING_DT",
        "ZONE_TRAN_TYPE",
        "DISABLE_TRAN_DATE",
        "ZONE",
      ],
      validate: (currentField, dependentField) => {
        let formatdate = new Date(currentField?.value);
        if (Boolean(formatdate) && !isValid(formatdate)) {
          return "Mustbeavaliddate";
        }
        if (dependentField?.ZONE_TRAN_TYPE?.value === "S") {
          if (
            new Date(currentField?.value) <
            new Date(dependentField?.WORKING_DT?.value)
          ) {
            return "ClearingDateshouldbegreaterthanorequaltoWorkingDate";
          }
        } else {
          if (
            new Date(currentField?.value) >
            new Date(dependentField?.WORKING_DT?.value)
          ) {
            return "ClearingReturnDateshouldbeLessthanorequaltoWorkingDate";
          }
        }
        return "";
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (
          field.value &&
          dependentFieldsValues?.["ZONE"]?.value &&
          dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value
        ) {
          const request = {
            TRAN_DT: format(new Date(field.value ?? ""), "dd/MMM/yyyy"),
            TRAN_TYPE: dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value ?? "",
            ZONE: dependentFieldsValues?.["ZONE"]?.value ?? "0   ",
          };
          let postData = await API.getSlipNumber(request);
          return {
            SLIP_CD: {
              value: postData?.[0]?.SLIP_NO ?? "",
              ignoreUpdate: true,
            },
          };
        }
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ZONE",
      label: "Zone",
      placeholder: "SelectZone",
      defaultValueKey: "getZoneDefaultVal",
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      skipDefaultOption: true,
      options: "getZoneListData",
      _optionsKey: "getZoneListData",
      dependentFields: ["TRAN_DT", "ZONE_TRAN_TYPE"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("ZONE_VALUE", field?.value);
        if (
          field.value &&
          dependentFieldsValues?.["TRAN_DT"]?.value &&
          dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value
        ) {
          const request = {
            TRAN_DT: format(
              new Date(dependentFieldsValues?.["TRAN_DT"]?.value ?? ""),
              "dd/MMM/yyyy"
            ),
            TRAN_TYPE: dependentFieldsValues?.["ZONE_TRAN_TYPE"]?.value ?? "",
            ZONE: field?.value ?? "0   ",
          };
          let postData = await API.getSlipNumber(request);
          return {
            SLIP_CD: {
              value: postData?.[0]?.SLIP_NO ?? "",
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SLIP_CD",
      label: "SlipNo",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
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
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            ACCT_CD: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_NAME: { value: "" },
            TRAN_BAL: { value: "" },
          };
        },
      },

      accountTypeMetadata: {
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
        isFieldFocused: true,
        defaultfocus: true,
        defaultValue: "",
        validationRun: "all",
        runPostValidationHookAlways: true,
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "TRN/559",
          });
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (field?.value) {
            formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", {
              ACCT_TYPE: field?.value,
              BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
              COMP_CD: auth?.companyID ?? "",
            });
          }
          formState.setDataOnFieldChange("ACCT_CD_BLANK");

          return {
            ACCT_CD: { value: "", ignoreUpdate: true },
            ACCT_NAME: { value: "" },
            TRAN_BAL: { value: "" },
            AMOUNT: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        fullWidth: true,
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 6) {
              return false;
            }
            return true;
          },
        },
        disableCaching: false,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (
            field.value &&
            dependentFieldsValues?.["ACCT_TYPE"]?.value &&
            dependentFieldsValues?.["BRANCH_CD"]?.value
          ) {
            if (formState?.isSubmitting) return {};
            let Apireq = {
              COMP_CD: auth?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentFieldsValues?.["ACCT_TYPE"]?.optionData
              ),
              ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
              BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
              GD_TODAY_DT: auth?.workingDate,
              SCREEN_REF: formState?.docCD,
            };
            formState?.handleDisableButton(true);
            let postData = await getAccountSlipJoinDetail(Apireq);
            formState.setDataOnFieldChange("API_REQ", {
              ...Apireq,
              ...postData,
            });

            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.[0]?.MSG?.length; i++) {
              if (postData?.[0]?.MSG?.[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
                formState.setDataOnFieldChange("ACCT_CD_BLANK");
                formState?.handleDisableButton(false);
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                formState?.handleDisableButton(false);
                returnVal = postData?.[0];
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                formState?.handleDisableButton(false);
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "0") {
                formState.setDataOnFieldChange("ACCT_CD_VALID", postData?.[0]);
                formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", Apireq);
                if (btn99 !== "No") {
                  returnVal = postData?.[0];
                } else {
                  returnVal = "";
                }
                formState?.handleDisableButton(false);
              }
            }
            btn99 = 0;
            formState?.handleDisableButton(false);
            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentFieldsValues?.ACCT_TYPE?.optionData
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_NAME: {
                value: returnVal?.ACCT_NM ?? "",
              },
              TRAN_BAL: { value: returnVal.TRAN_BAL ?? "" },
            };
          } else {
            formState.setDataOnFieldChange("ACCT_CD_BLANK");
            return {
              ACCT_CD: {
                value: "",
              },
              ACCT_NAME: { value: "" },
              TRAN_BAL: { value: "" },
              AMOUNT: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NAME",
      label: "Account_Name",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "SlipAmount",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },

      postValidationSetCrossFieldValues: async (
        currentFieldState,
        formState
      ) => {
        if (currentFieldState?.value) {
          formState.setDataOnFieldChange(
            "AMOUNT",
            currentFieldState?.value ?? "0"
          );
        } else {
          formState.setDataOnFieldChange("AMOUNT", "");
        }
      },
      GridProps: { xs: 12, sm: 2.4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BY",
      label: "Maker",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_DATE",
      label: "MakerTime",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      __VIEW__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "CONFIRMED_FLAG",
      label: "ConfirmStatus",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 1.1, md: 1.1, lg: 1.1, xl: 1.1 },
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
      name: "VERIFIED_BY",
      label: "Checker",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      dependentFields: ["CONFIRMED_FLAG"],
      __VIEW__: { render: { componentType: "textField" } },
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.CONFIRMED_FLAG?.value === "Pending") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 1.3, md: 1.2, lg: 1.2, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "VERIFIED_DATE",
      label: "CheckerTime",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy HH:mm:ss",
      __VIEW__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      dependentFields: ["CONFIRMED_FLAG"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.CONFIRMED_FLAG?.value === "Pending") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ZONE_TRAN_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "WORKING_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_TRAN_DATE",
    },
  ],
};

export const SlipJoinDetailGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "JointDetail",
    rowIdColumn: "GRID_SR_NO",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: false,
    disableGlobalFilter: true,
    hideFooter: false,
    hideHeader: true,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "28vh",
      max: "28vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
  },
  filters: [],
  columns: [
    {
      accessor: "SR_CD",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },
    {
      accessor: "J_TYPE_NM",
      columnName: "JointType",
      sequence: 4,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "REF_PERSON_NAME",
      columnName: "PersonName",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 300,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "DESIGNATION_NM",
      columnName: "Designation",
      sequence: 6,
      alignment: "center",
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 300,
    },

    {
      accessor: "MEM_DISP_ACCT_TYPE",
      columnName: "MemTypeACNo",
      sequence: 7,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "MOBILE_NO",
      columnName: "ContactNo",
      sequence: 8,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "CUSTOMER_ID",
      columnName: "CustomerId",
      sequence: 8,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
  ],
};

export const ctsOutwardChequeDetailFormMetaData: any = {
  form: {
    refID: 1667,
    name: "ChequeDetailFormMetaData",
    label: "",
    resetFieldOnUmnount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",

      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: {
        xs: 0,
        md: 1,
        sm: 4.7,
        lg: 4.7,
        xl: 4.7,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SLIP_AMOUNT",
      label: "TotalSlipAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      __VIEW__: { render: { componentType: "hidden" } },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FINALAMOUNT",
      label: "TotalChequeAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      validationRun: "onBlur",
      defaultValue: "0",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      __VIEW__: { render: { componentType: "hidden" } },

      dependentFields: ["chequeDetails"],
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["chequeDetails"])
            ? dependentFieldState?.["chequeDetails"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.AMOUNT?.value), 0);

        return accumulatedTakeoverLoanAmount ?? 0;
      },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      validationRun: "onBlur",
      dependentFields: ["SLIP_AMOUNT", "FINALAMOUNT"],
      FormatProps: {
        allowNegative: true,
        allowLeadingZeros: true,
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.SLIP_AMOUNT?.value) -
          Number(dependentFields?.FINALAMOUNT?.value);

        return value ?? "0";
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_DT",
      format: "dd/MM/yyyy",

      GridProps: { xs: 12, sm: 2, md: 1.8, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RANGE_DT",
      format: "dd/MM/yyyy",

      GridProps: { xs: 12, sm: 2, md: 1.8, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CHQ_MICR_VISIBLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PAYEE_AC_MANDATORY",
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "ADDNEWROW",
      label: "AddRow",
      endsIcon: "AddCircleOutlineRounded",
      rotateIcon: "scale(1)",
      placeholder: "",
      type: "text",
      tabIndex: "-1",
      iconStyle: {
        fontSize: "25px !important",
      },
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 2.2, sm: 2, md: 1.8, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "arrayField",
      },
      isRemoveButton: true,
      displayCountName: "Cheque Detail",
      fixedRows: true,
      isScreenStyle: true,
      disagreeButtonName: "No",
      agreeButtonName: "Yes",
      errorTitle: "deleteTitle",
      name: "chequeDetails",
      removeRowFn: "deleteFormArrayFieldData",
      __VIEW__: {
        noRecordMessage: "NoRecordsFound",
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHEQUE_NO",
          label: "ChequeNo",
          placeholder: "EnterChequeNo",
          type: "text",
          required: true,
          autoComplete: "off",
          dependentFields: ["TRAN_DT"],
          textFieldStyle: {
            "& .MuiInputBase-input": {
              textAlign: "right",
            },
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 6) {
                return false;
              }

              return true;
            },
          },
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (field.value) {
              return {
                CHEQUE_DATE: {
                  value: dependentFieldsValues?.TRAN_DT?.value,
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
              };
            }
          },
          GridProps: { xs: 6, sm: 2, md: 1.5, lg: 1.5, xl: 1.5 },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ChequeNorequired"] }],
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "BANK_CD",
          label: "BankCode",
          placeholder: "EnterBankCode",
          type: "text",
          required: true,
          autoComplete: "off",
          maxLength: 10,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 10) {
                return false;
              }
              return true;
            },
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["BankCodeRequired"] }],
          },

          dependentFields: ["TRAN_DT", "CHEQUE_NO"],
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: false,
          },
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (field.value) {
              let formData = {
                A_ENT_COMP_CD: auth.companyID ?? "",
                A_ENT_BRANCH_CD: auth.user.branchCode ?? "",
                A_BANK_CD:
                  field.value && Number.isNaN(Number(field.value))
                    ? ""
                    : field.value.padEnd(10, " "),
                A_SCREEN_REF: "TRN/559",
                USERROLE: auth?.role ?? "",
              };
              let postData = await BankMasterValidate(formData);
              let btn99, returnVal;

              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };

              for (let i = 0; i < postData.length; i++) {
                if (postData[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                  return {
                    BANK_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                } else if (postData[i]?.O_STATUS === "9") {
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "99") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "CONFIRM",
                    buttonNames: ["Yes", "No"],
                  });
                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
                    return {
                      BANK_CD: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                    };
                  } else {
                    formState.setDataOnFieldChange("MESSAGE", postData[i]);
                  }
                } else if (postData[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = postData[i];
                  } else {
                    returnVal = "";
                  }
                  if (
                    dependentFieldsValues?.["chequeDetails.CHEQUE_NO"]?.value &&
                    field.value
                  ) {
                    let data = await getBankChequeAlert({
                      ENTERED_COMP_CD: auth.companyID ?? "",
                      ENTERED_BRANCH_CD:
                        formState?.REQ_DATA?.BRANCH_CD ??
                        auth.user.branchCode ??
                        "",
                      BANK_CD:
                        field.value && Number.isNaN(Number(field.value))
                          ? ""
                          : field.value.padEnd(10, " "),
                      TRAN_TYPE: formState?.ZONE_TRAN_TYPE,
                      TRAN_DT: dependentFieldsValues?.TRAN_DT?.value ?? "",
                      CHEQUE_NO:
                        dependentFieldsValues?.["chequeDetails.CHEQUE_NO"]
                          ?.value,
                    });
                    if (data?.[0]?.O_STATUS === "99") {
                      let buttonNames = await formState?.MessageBox({
                        messageTitle: "Confirmation",
                        message: data?.[0]?.O_MESSAGE,
                        buttonNames: ["Yes", "No"],
                        icon: "CONFIRM",
                      });
                      if (buttonNames === "Yes") {
                        return {
                          BANK_NM: {
                            value: returnVal?.BANK_NM ?? "",
                          },
                        };
                      } else {
                        return {
                          BANK_CD: {
                            value: "",
                            ignoreUpdate: true,
                            isFieldFocused: true,
                          },
                          BANK_NM: {
                            value: "",
                          },
                        };
                      }
                    }
                  }
                }
              }
              btn99 = 0;
              return {
                BANK_NM: {
                  value: returnVal?.BANK_NM ?? "",
                },
              };
            } else if (!field?.value) {
              return {
                BANK_NM: { value: "" },
              };
            }
          },
          GridProps: { xs: 12, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "BankName",
          placeholder: "",
          type: "text",
          required: true,
          isReadOnly: true,
          showMaxLength: true,
          autoComplete: "off",
          dependentFields: ["BANK_CD"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            if (!dependentFieldsValues?.["chequeDetails.BANK_CD"]?.value) {
              return true;
            }
            return false;
          },
          GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.8, xl: 2.5 },
        },

        {
          render: {
            componentType: "numberFormat",
          },
          name: "ECS_SEQ_NO",
          label: "PayeeACNo",
          runExternalFunction: true,
          placeholder: "EnterPayeeACNo",
          textFieldStyle: {
            "& .MuiInputBase-input": {
              textAlign: "right",
            },
          },
          dependentFields: ["PAYEE_AC_MANDATORY"],
          validate: (columnValue, allField, flag) => {
            if (allField.PAYEE_AC_MANDATORY?.value === "Y") {
              return "PayeeACNorequired";
            }
            return "";
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 6) {
                return false;
              }
              return true;
            },
          },
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            // console.log("field",field,formState,
            //   auth,
            //   dependentFieldsValues)
            if (field.value?.length > 0) {
              return {
                ECS_SEQ_NO: {
                  value: field.value.padStart(6, "0"),
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
              };
            }
            // else{
            //   return {
            //     ECS_SEQ_NO: {
            //       value: "",
            //       isFieldFocused: false,
            //       ignoreUpdate: true,
            //     },
            //   };
            // }
          },
          type: "text",
          GridProps: { xs: 12, sm: 2, md: 1.9, lg: 1.9, xl: 1.5 },
        },

        {
          render: {
            componentType: "datePicker",
          },
          name: "CHEQUE_DATE",
          label: "ChequeDate",
          format: "dd/MM/yyyy",
          placeholder: "DD/MM/YYYY",
          type: "text",
          fullWidth: true,
          dependentFields: ["TRAN_DT", "RANGE_DT"],
          validate: (currentField, dependentField) => {
            const currentDate = new Date(currentField?.value);
            const rangeDate = new Date(dependentField?.RANGE_DT?.value);
            const transDate = new Date(dependentField?.TRAN_DT?.value);
            if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
              return "Mustbeavaliddate";
            }
            if (!rangeDate) {
              return "";
            }
            if (currentDate < rangeDate || currentDate > transDate) {
              return (
                t("DateShouldBetween") +
                " " +
                rangeDate.toLocaleDateString("en-IN") +
                " " +
                t("To") +
                " " +
                transDate.toLocaleDateString("en-IN")
              );
            }
          },

          required: true,
          maxLength: 6,

          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ChequeDateRequired"] }],
          },
          GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH",
          label: "Description",
          type: "text",
          fullWidth: true,
          maxLength: 100,
          placeholder: "EnterDescription",

          GridProps: { xs: 12, sm: 3, md: 3, lg: 4, xl: 1.5 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHQ_MICR_CD",
          label: "CHQMicr",
          type: "text",
          fullWidth: true,
          defaultValue: "10",
          required: true,
          placeholder: "CHQMicr",
          dependentFields: ["CHQ_MICR_VISIBLE"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            if (dependentFieldsValues?.CHQ_MICR_VISIBLE?.value === "Y") {
              return false;
            } else {
              return true;
            }
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 2) {
                return false;
              }
              return true;
            },
          },

          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["CHQMicrRequired"] }],
          },
          GridProps: { xs: 6, sm: 1, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ECS_USER_NO",
          label: "PayeeName",
          placeholder: "EnterPayeeName",
          type: "text",
          required: true,
          autoComplete: "off",
          maxLength: 100,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["PayeeNameRequired"] }],
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 1.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "ChequeAmount",
          placeholder: "",
          required: true,
          type: "text",
          FormatProps: {
            allowNegative: false,
          },
          GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
        },
      ],
    },
  ],
};
export const inwardReturnChequeDetailFormMetaData: any = {
  form: {
    refID: 1667,
    name: "ChequeDetailFormMetaData",
    label: "",
    resetFieldOnUmnount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",

      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: {
        xs: 0,
        md: 1,
        sm: 4.7,
        lg: 4.7,
        xl: 4.7,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SLIP_AMOUNT",
      label: "TotalSlipAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      __VIEW__: { render: { componentType: "hidden" } },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FINALAMOUNT",
      label: "TotalChequeAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",

      defaultValue: "0",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      __VIEW__: { render: { componentType: "hidden" } },
      dependentFields: ["chequeDetails"],
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["chequeDetails"])
            ? dependentFieldState?.["chequeDetails"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.AMOUNT?.value), 0);

        return accumulatedTakeoverLoanAmount ?? 0;
      },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      dependentFields: ["SLIP_AMOUNT", "FINALAMOUNT"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.SLIP_AMOUNT?.value) -
          Number(dependentFields?.FINALAMOUNT?.value);
        return value ?? "0";
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CHQ_MICR_VISIBLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PAYEE_AC_MANDATORY",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_DT",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",

      GridProps: { xs: 12, sm: 2, md: 1.8, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RANGE_DT",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",

      GridProps: { xs: 12, sm: 2, md: 1.8, lg: 1.8, xl: 1.5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "ADDNEWROW",
      label: "AddRow",
      endsIcon: "AddCircleOutlineRounded",
      rotateIcon: "scale(1)",
      placeholder: "",
      type: "text",
      tabIndex: "-1",
      iconStyle: {
        fontSize: "25px !important",
      },
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 2.2, sm: 2, md: 1.8, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "arrayField",
      },
      isRemoveButton: true,
      displayCountName: "Cheque Detail",
      fixedRows: true,
      isScreenStyle: true,
      disagreeButtonName: "No",
      agreeButtonName: "Yes",
      errorTitle: "deleteTitle",
      name: "chequeDetails",
      removeRowFn: "deleteFormArrayFieldData",
      __VIEW__: {
        noRecordMessage: "NoRecordsFound",
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "numberFormat",
          },
          name: "BANK_CD",
          label: "BankCode",
          placeholder: "EnterBankCode",
          type: "text",
          required: true,
          maxLength: 10,
          autoComplete: "off",
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 10) {
                return false;
              }
              return true;
            },
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["BankCodeRequired"] }],
          },
          dependentFields: ["TRAN_DT", "CHEQUE_NO"],
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: false,
          },
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (field.value) {
              let formData = {
                A_ENT_COMP_CD: auth.companyID ?? "",
                A_ENT_BRANCH_CD: auth.user.branchCode ?? "",
                A_BANK_CD:
                  field.value && Number.isNaN(Number(field.value))
                    ? ""
                    : field.value.padEnd(10, " "),
                A_SCREEN_REF: "TRN/028",
                USERROLE: auth?.role ?? "",
              };

              let postData = await BankMasterValidate(formData);
              let btn99, returnVal;

              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };

              for (let i = 0; i < postData.length; i++) {
                if (postData[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                  return {
                    BANK_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                } else if (postData[i]?.O_STATUS === "9") {
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "99") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "CONFIRM",
                    buttonNames: ["Yes", "No"],
                  });
                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
                    return {
                      BANK_CD: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                    };
                  } else {
                    formState.setDataOnFieldChange("MESSAGE", postData[i]);
                  }
                } else if (postData[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = postData[i];
                  } else {
                    returnVal = "";
                  }
                }
              }
              btn99 = 0;

              return {
                BANK_NM: {
                  value: returnVal?.BANK_NM ?? "",
                },
              };
              // else {
              //   return {
              //     BANK_CD: { value: "", isFieldFocused: true },
              //     BANK_NM: { value: "" },
              //   };
              // }
            } else if (!field?.value) {
              return {
                BANK_NM: { value: "" },
              };
            }
          },

          GridProps: { xs: 12, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "BankName",
          placeholder: "",
          type: "text",
          required: true,
          isReadOnly: true,
          showMaxLength: true,
          autoComplete: "off",
          dependentFields: ["BANK_CD"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            if (!dependentFieldsValues?.["chequeDetails.BANK_CD"]?.value) {
              return true;
            }
            return false;
          },
          GridProps: { xs: 12, sm: 3.2, md: 3.2, lg: 3.2, xl: 3.2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH",
          label: "Description",
          type: "text",
          fullWidth: true,
          maxLength: 100,
          placeholder: "EnterDescription",
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "REASON",
          label: "Reason",
          GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
          placeholder: "SelectReason",
          options: (dependentValue, formState, _, authState) => {
            let ApiReq = {
              BRANCH_CD: authState?.user?.branchCode,
              COMP_CD: authState?.companyID,
              RETURN_TYPE: "CLG",
            };
            return API.getInwardReasonTypeList(ApiReq);
          },
          _optionsKey: "getInwardReasonTypeList",
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHQ_MICR_CD",
          label: "CHQMicr",
          type: "text",
          fullWidth: true,
          placeholder: "CHQMicr",
          defaultValue: "10",
          required: true,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 2) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["CHQ_MICR_VISIBLE"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            if (dependentFieldsValues?.CHQ_MICR_VISIBLE?.value === "Y") {
              return false;
            } else {
              return true;
            }
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["CHQMicrRequired"] }],
          },
          GridProps: { xs: 6, sm: 1, md: 1, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHEQUE_NO",
          label: "ChequeNo",
          placeholder: "EnterChequeNo",
          type: "text",
          required: true,
          autoComplete: "off",
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 6) {
                return false;
              }

              return true;
            },
          },
          textFieldStyle: {
            "& .MuiInputBase-input": {
              textAlign: "right",
            },
          },
          runPostValidationHookAlways: true,
          dependentFields: ["BANK_CD", "TRAN_DT"],
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (
              field.value &&
              Object.entries(formState?.REQ_DATA).length === 0
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Information",
                message: "Enter Account Information",
                buttonNames: ["Ok"],
              });

              if (buttonName === "Ok") {
                let continueButtonName = await formState?.MessageBox({
                  messageTitle: "Confirmation",
                  message: "AreYouSureContinue",
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                if (continueButtonName === "Yes") {
                  return {
                    CHEQUE_DATE: {
                      value: dependentFieldsValues?.TRAN_DT?.value,
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                } else {
                  return {
                    CHEQUE_NO: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              }
            } else if (
              dependentFieldsValues?.["chequeDetails.BANK_CD"]?.value &&
              field.value
            ) {
              let postData = await getBankChequeAlert({
                ENTERED_COMP_CD: auth.companyID ?? "",
                ENTERED_BRANCH_CD:
                  formState?.REQ_DATA?.BRANCH_CD ?? auth.user.branchCode ?? "",
                CHEQUE_NO:
                  field.value && Number.isNaN(Number(field.value))
                    ? ""
                    : field.value.padEnd(10, " "),
                TRAN_TYPE: formState?.ZONE_TRAN_TYPE,
                TRAN_DT: dependentFieldsValues?.TRAN_DT?.value ?? "",
                BANK_CD:
                  dependentFieldsValues?.["chequeDetails.BANK_CD"]?.value,
              });

              let btn99, returnVal;

              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };
              async function handleChequeValidationAndMessages(
                formState,
                field
              ) {
                let postData = await GeneralAPI.getChequeNoValidation({
                  COMP_CD: formState?.REQ_DATA?.COMP_CD,
                  BRANCH_CD: formState?.REQ_DATA?.BRANCH_CD,
                  ACCT_TYPE: formState?.REQ_DATA?.ACCT_TYPE,
                  ACCT_CD: formState?.REQ_DATA?.ACCT_CD,
                  CHEQUE_NO: field.value,
                  SCREEN_REF: formState?.docCD,
                  TYPE_CD: formState?.REQ_DATA?.[0]?.TYPE_CD,
                });
                const buttonName = await formState?.MessageBox({
                  messageTitle: "Information",
                  message: postData?.[0]?.O_MESSAGE ?? "",
                  buttonNames: ["Ok"],
                  icon: "INFO",
                });
                if (buttonName === "Ok") {
                  let continueButtonName = await formState?.MessageBox({
                    messageTitle: "Confirmation",
                    message: "AreYouSureContinue",
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (continueButtonName === "Yes") {
                    return {
                      CHEQUE_DATE: {
                        value: dependentFieldsValues?.TRAN_DT?.value,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                    };
                  } else {
                    return {
                      CHEQUE_NO: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                    };
                  }
                }
              }
              for (let i = 0; i < postData.length; i++) {
                if (postData[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: "ValidationFailed",
                    message: postData[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "9") {
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: "Alert",
                      message: postData[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "99") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: "Confirmation",
                    message: postData[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });

                  btn99 = btnName;
                  if (btnName === "Yes") {
                    return await handleChequeValidationAndMessages(
                      formState,
                      field
                    );
                  }
                } else if (postData[i]?.O_STATUS === "0") {
                  return {
                    CHEQUE_DATE: {
                      value: dependentFieldsValues?.TRAN_DT?.value,
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              }
            }
          },
          GridProps: { xs: 6, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ChequeNorequired"] }],
          },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CHEQUE_DATE",
          label: "ChequeDate",
          placeholder: "DD/MM/YYYY",
          format: "dd/MM/yyyy",
          type: "text",
          fullWidth: true,
          dependentFields: ["TRAN_DT", "RANGE_DT"],
          validate: (currentField, dependentField) => {
            if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
              return "Mustbeavaliddate";
            }
            const currentDate = new Date(currentField?.value);
            const rangeDate = new Date(dependentField?.RANGE_DT?.value);
            const transDate = new Date(dependentField?.TRAN_DT?.value);
            if (!rangeDate) {
              return "";
            }
            if (currentDate < rangeDate || currentDate > transDate) {
              return (
                t("DateShouldBetween") +
                " " +
                rangeDate.toLocaleDateString("en-IN") +
                " " +
                t("To") +
                " " +
                transDate.toLocaleDateString("en-IN")
              );
            }
          },
          maxLength: 6,
          GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "ChequeAmount",
          placeholder: "",
          required: true,
          type: "text",
          FormatProps: {
            allowNegative: false,
          },
          GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
        },
      ],
    },
  ],
};

export const AddNewBankMasterFormMetadata = {
  form: {
    name: "ClearingBankMasterForm",
    label: "ClearingBankMaster",
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
      name: "RBI_CD",
      label: "RBICode",
      placeholder: "",
      type: "text",
      maxLength: 10,
      isFieldFocused: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["RBICodeIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_CD",
      label: "Code",
      placeholder: "",
      type: "text",
      maxLength: 10,
      required: true,
      dependentFields: ["RBI_CD"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields?.RBI_CD?.value ?? "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "BankName",
      placeholder: "",
      type: "text",
      required: true,
      txtTransform: "uppercase",
      maxLength: 100,
      showMaxLength: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["BankNameIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 4.5, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "EXCLUDE",
      label: "Exclude",
      GridProps: { xs: 12, sm: 3, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "CTS",
      label: "CTS",
      defaultValue: true,
      GridProps: { xs: 12, sm: 3, md: 1, lg: 1, xl: 1 },
    },
  ],
};
export const CtsOwRetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
    label: "Clearing Retrieve Information",
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
        componentType: "hidden",
      },
      name: "DISABLE_TRAN_DATE",
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_TRAN_DT",
      label: "GeneralFromDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["DISABLE_TRAN_DATE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
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
      name: "TO_TRAN_DT",
      label: "GeneralToDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["To Date is required."] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_TRAN_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      dependentFields: ["FROM_TRAN_DT", "DISABLE_TRAN_DATE"],
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ZONE",
      label: "Zone",
      defaultValueKey: "getZoneDefaultVal",
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      skipDefaultOption: true,
      options: "getZoneListData",
      _optionsKey: "getZoneListData",
      disableCaching: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("ZONE_VALUE", field?.value);
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BATCH_ID",
      label: "Session ID",
      placeholder: "",
      type: "text",
      dependentFields: ["DISABLE_BATCH_ID"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_BATCH_ID?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        if (formState?.ZONE_TRAN_TYPE === "S") {
          return false;
        } else {
          return true;
        }
      },
      options: async (dependentValue, formState, _, authState) => {
        return await getBatchIDList({
          BRANCH_CD: authState?.user?.baseBranchCode,
          COMP_CD: authState?.companyID,
        });

        return [];
      },
      _optionsKey: "getRtgsTransactionTypeList",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "SLIP_CD",
      label: "SlipNo",
      placeholder: "slipNo",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "EnterChequeNo",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "BANK_CD",
      label: "BankCode",
      placeholder: "EnterBankCode",
      maxLength: 10,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      GridProps: { xs: 12, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CHEQUE_AMOUNT",
      label: "ChequeAmount",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 1.7 },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_BATCH_ID",
    },
  ],
};
export const RetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
    label: "Clearing Retrieve Information",
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
        componentType: "hidden",
      },
      name: "DISABLE_TRAN_DATE",
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_TRAN_DT",
      label: "GeneralFromDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["DISABLE_TRAN_DATE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
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
      name: "TO_TRAN_DT",
      label: "GeneralToDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["To Date is required."] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_TRAN_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      dependentFields: ["FROM_TRAN_DT", "DISABLE_TRAN_DATE"],
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ZONE",
      label: "Zone",
      defaultValueKey: "getZoneDefaultVal",
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      skipDefaultOption: true,
      options: "getZoneListData",
      _optionsKey: "getZoneListData",
      disableCaching: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("ZONE_VALUE", field?.value);
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BATCH_ID",
      label: "Session ID",
      placeholder: "",
      type: "text",
      dependentFields: ["DISABLE_BATCH_ID"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_BATCH_ID?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        if (formState?.ZONE_TRAN_TYPE === "S") {
          return false;
        } else {
          return true;
        }
      },
      options: async (dependentValue, formState, _, authState) => {
        return await getBatchIDList({
          BRANCH_CD: authState?.user?.baseBranchCode,
          COMP_CD: authState?.companyID,
        });

        return [];
      },
      _optionsKey: "getRtgsTransactionTypeList",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "SLIP_CD",
      label: "SlipNo",
      placeholder: "slipNo",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.5 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "EnterChequeNo",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.5 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "BANK_CD",
      label: "BankCode",
      placeholder: "EnterBankCode",
      maxLength: 10,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },

      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.7, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CHEQUE_AMOUNT",
      label: "ChequeAmount",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.5 },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_BATCH_ID",
    },
  ],
};

export const RetrieveGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "RetrieveGrid",
    rowIdColumn: "SR_NO",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 25, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "48vh",
      max: "48vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
  },
  filters: [],
  columns: [
    // {
    //   accessor: "SR_NO",
    //   columnName: "Sr.No.",
    //   sequence: 1,
    //   alignment: "rigth",
    //   componentType: "default",
    //   width: 70,
    //   minWidth: 60,
    //   maxWidth: 120,
    //   isAutoSequence: true,
    // },
    {
      accessor: "SLIP_CD",
      columnName: "SlipNo",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
      isTotalWithCurrency: true,
      setFooterValue(total, rows) {
        return [rows.length ?? 0];
      },
    },
    {
      accessor: "CHQ_CNT",
      columnName: "ChequeCount",
      sequence: 3,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "CHQ_LIST",
      columnName: "ChequeNoList",
      sequence: 4,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "CHQ_AMT_LIST",
      columnName: "ChequeAmount",
      sequence: 5,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 150,
      maxWidth: 500,
      isTotalWithCurrency: true,
      setFooterValue(total, rows) {
        const filteredRows = rows?.filter(
          ({ original }) => original.CHQ_AMT_LIST
        );
        const sum =
          filteredRows?.reduce((acc, { original }) => {
            // Split the CHQ_AMT_LIST by commas, convert each to a number, and sum them
            const chqAmtListSum = original.CHQ_AMT_LIST.split(",")
              .map(Number) // Convert to numbers
              .reduce((a, b) => a + b, 0); // Sum the numbers in this row
            return acc + chqAmtListSum; // Add to the accumulator
          }, 0) ?? 0;
        const formattedSum = sum.toFixed(2);

        return [formattedSum];
      },
    },
    {
      accessor: "TRAN_DT",
      columnName: "CLGDate",
      sequence: 6,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 200,
      minWidth: 150,
      maxWidth: 250,
    },

    {
      accessor: "CONFIRM_DISP",
      columnName: "ConfirmStatus",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "THROUGH_CHANNEL",
      columnName: "EntryFrom",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "SESSION_NM",
      columnName: "Session",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "BATCH_ID",
      columnName: "Batch Id",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ENTERED_BY",
      columnName: "EnteredBy",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "EnteredDate",
      sequence: 12,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      dateFormat: "dd/MM/yyyy HH:mm:ss",
    },
    {
      accessor: "VERIFIED_BY",
      columnName: "VerifiedBy",
      sequence: 13,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "VERIFIED_DATE",
      columnName: "VerifiedDate",
      sequence: 14,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      dateFormat: "dd/MM/yyyy HH:mm:ss",
    },
  ],
};
