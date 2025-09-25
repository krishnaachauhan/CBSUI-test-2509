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
        // isFieldFocused: true,
        // defaultfocus: true,
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
        // fullWidth: true,
        // FormatProps: {
        //   allowNegative: false,
        //   isAllowed: (values) => {
        //     if (values?.value?.length > 6) {
        //       return false;
        //     }
        //     return true;
        //   },
        // },
        // disableCaching: false,
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
                await getButtonName({
                  messageTitle: postData?.[0]?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.[0]?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
                formState.setDataOnFieldChange("ACCT_CD_BLANK");
                formState?.handleDisableButton(false);
              } else if (postData?.[0]?.MSG?.[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  await getButtonName({
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
                ignoreUpdate: true,
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
      GridProps: {
        xs: 12,
        md: 5,
        sm: 5,
        lg: 5,
        xl: 5,
      },
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
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
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
      // disableCaching: true,
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
      // __NEW__: {
      //   dependentFields: ["TRAN_DT", "ZONE", "ZONE_TRAN_TYPE"],
      //   setValueOnDependentFieldsChange: "getSlipNoData",
      //   disableCaching: true,
      // },
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
        // isFieldFocused: true,
        // defaultfocus: true,
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
                ignoreUpdate: true,
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
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: false,
      },
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
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
