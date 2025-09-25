import {
  getAccountDetail,
  getIfscBankDetail,
  getIfscBenDetail,
  getJointDetailsList,
  getAcctTypeData,
} from "./api";
import {
  GridMetaDataType,
  SchemaValidateFnType,
  utilFunction,
} from "@acuteinfo/common-base";
import { format, isValid } from "date-fns";
import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { validateHOBranch } from "components/utilFunction/function";
import { t } from "i18next";
export const RtgsEntryFormMetaData = {
  form: {
    name: "rtgsEntry",
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
        componentType: "autocomplete",
      },
      name: "ENTRY_TYPE",
      label: "RTGSNEFT",
      defaultValueKey: "entryTypeDefaultVal",
      defaultOptionLabel: "SelectRTGSNEFTTransactionType",
      options: () => {
        return API.getEntryType();
      },
      _optionsKey: "getEntryType",
      required: true,
      placeholder: "SelectEntryType",
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["PleaseSelectOrderingTransaction"],
          },
        ],
      },
      runPostValidationHookAlways: true,
      validationRun: "all",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        formState?.setDataOnFieldChange("RTGS/NEFT", field?.value);
        return {
          TRAN_TYPE: { value: "", ignoreUpdate: false },
          DEF_TRAN_CD: { value: "", ignoreUpdate: false },
          AMOUNT: { value: "", ignoreUpdate: false },
          COMM_AMT: { value: "", ignoreUpdate: false },
          SER_CHRG_AMT: { value: "", ignoreUpdate: false },
        };
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      __EDIT__: { render: { componentType: "textField" }, isReadOnly: true },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "Date",
      placeholder: "",
      isReadOnly: true,
      isWorkingDate: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 6, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRAN_TYPE",
      label: "TransactionType",
      defaultValueKey: "RtgsTransactionTypeDefaultVal",
      required: true,
      placeholder: "SelectTheTransactionType",
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      // skipDefaultOption: true,
      dependentFields: ["ENTRY_TYPE"],
      options: async (dependentValue, formState, _, authState) => {
        if (dependentValue?.ENTRY_TYPE?.value) {
          return await API.getRtgsTransactionTypeList({
            MSG_FLOW: "O",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode,
            COMP_CD: authState?.companyID,
            ENT_BRANCH_CD: authState?.user?.branchCode,
            MSG_TYPE: "0",
            ENTRY_TYPE: dependentValue?.ENTRY_TYPE?.value,
          });
        }
        return [];
      },
      _optionsKey: "getRtgsTransactionTypeList",
      disableCaching: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PleaseSelectTransactionType"] }],
      },
      __EDIT__: { render: { componentType: "textField" }, isReadOnly: true },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "BR_CONFIRMED",
      label: "",
      type: "text",

      GridProps: { xs: 6, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "SLIP_NO",
      label: "SlipNo",
      placeholder: "SlipNo",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      validate: (columnValue, allField, flag) => {
        let regex = /^[a-zA-Z0-9 ]*$/;
        // special-character not allowed
        if (columnValue.value) {
          if (!regex.test(columnValue.value)) {
            return "PleaseEnterAlphabeticValueSlipNumber";
          }
        }
        return "";
      },
      __EDIT__: {
        isFieldFocused: true,
        dependentFields: ["BR_CONFIRMED"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 10) {
              return false;
            }
            return true;
          },
        },
        validate: (columnValue, allField, flag) => {
          let regex = /^[a-zA-Z0-9 ]*$/;
          // special-character not allowed
          if (columnValue.value) {
            if (!regex.test(columnValue.value)) {
              return "PleaseEnterAlphabeticValueSlipNumber";
            }
          }
          return "";
        },
      },

      GridProps: { xs: 6, sm: 1.1, md: 1.1, lg: 1.1, xl: 1.1 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DEF_TRAN_CD",
      label: "CommType",
      defaultValueKey: "getCommTypeDefaultVal",
      required: true,
      placeholder: "SelectCommType",
      dependentFields: ["ENTRY_TYPE"],
      GridProps: { xs: 12, sm: 2.4, md: 2.4, lg: 2.4, xl: 2.4 },
      options: (dependentValue, formState, _, authState) => {
        if (dependentValue?.ENTRY_TYPE?.value) {
          return API.getCommTypeList({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            CODE:
              dependentValue?.ENTRY_TYPE?.value === "RTGS" ? "RTGSO" : "NEFTO",
          });
        }
        return [];
      },
      __EDIT__: { render: { componentType: "textField" }, isReadOnly: true },
      _optionsKey: "getCommTypeList",
      disableCaching: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PleaseSelectCommDefinition"] }],
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "BR_IFSCCODE",
      label: "IFSC",
      defaultValueKey: "getIfscCodeDefaultVal",
      placeholder: "SelectIFSC",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
      options: async (dependentValue, formState, _, authState) => {
        const data = await API.getIfscCodeList({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
        formState.setDataOnFieldChange("IFSC_DATA", data);
        return data;
      },
      _optionsKey: "getIfscCodeList",
      disableCaching: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["PleaseEnterOrderingBranchIFSCode"],
          },
        ],
      },
      __EDIT__: {
        dependentFields: ["BR_CONFIRMED"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      render: {
        componentType: "_accountNumber",
      },

      __NEW__: {
        branchCodeMetadata: {
          GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
          schemaValidation: {
            type: "string",
            rules: [
              {
                name: "required",
                params: ["PleaseEnterOrderingAcBranch"],
              },
            ],
          },
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
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
            formState.setDataOnFieldChange("ACCT_CD_BLANK");
            return {
              ACCT_NM: { value: "" },
              LIMIT_AMOUNT: { value: "" },
              ACCT_NAME: { value: "" },
              CONTACT_INFO: { value: "" },
              ACCT_MODE: { value: "" },
              ADD1: { value: "" },
              TRAN_BAL: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_TYPE: { value: "" },
              SER_CHRG_AMT: { value: "" },
              COMM_AMT: { value: "" },
              CHEQUE_NO: { value: "" },
              AMOUNT: { value: "" },
              TOTAL: { value: "" },
            };
          },
        },
        accountTypeMetadata: {
          GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
          isFieldFocused: true,
          defaultfocus: true,
          defaultValue: "",
          validationRun: "onChange",
          runPostValidationHookAlways: true,
          dependentFields: ["BRANCH_CD"],
          options: (dependentValue, formState, _, authState) => {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: "MST/552",
            });
          },
          schemaValidation: {
            type: "string",
            rules: [
              {
                name: "required",
                params: ["PleaseEnterOrderingAcType"],
              },
            ],
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
            return {
              ACCT_CD: { value: "" },
              LIMIT_AMOUNT: { value: "" },
              ACCT_NM: { value: "" },
              ACCT_NAME: { value: "" },
              CONTACT_INFO: { value: "" },
              ACCT_MODE: { value: "" },
              ADD1: { value: "" },
              TRAN_BAL: { value: "" },
              PARA_BNFCRY: { value: "" },
              TYPE_CD: { value: "" },
              CHEQUE_NO: { value: "" },
              SER_CHRG_AMT: { value: "" },
              COMM_AMT: { value: "" },
              AMOUNT: { value: "" },
              TOTAL: { value: "" },
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
          schemaValidation: {
            type: "string",
            rules: [
              {
                name: "required",
                params: ["PleaseEnterOrderingAcNumber"],
              },
            ],
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (Boolean(formState?.isBackButton)) return {};
            formState?.setDisableBtn(true);
            try {
              if (
                field.value &&
                dependentFieldsValues?.["ACCT_TYPE"]?.value &&
                dependentFieldsValues?.["BRANCH_CD"]?.value
              ) {
                let Apireq = {
                  COMP_CD: auth?.companyID ?? "",
                  ACCT_CD:
                    utilFunction.getPadAccountNumber(
                      field?.value,
                      dependentFieldsValues?.["ACCT_TYPE"]?.optionData?.[0] ??
                        {}
                    ) ?? "",
                  ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value ?? "",
                  BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value ?? "",
                  AMOUNT: "",
                  SCREEN_REF: formState?.docCD ?? "",
                  WORKING_DATE: auth?.workingDate ?? "",
                  USERNAME: auth?.user?.id ?? "",
                  USERROLE: auth?.role ?? "",
                };
                formState.setDataOnFieldChange("API_REQ", Apireq);
                let postData = await getAccountDetail(Apireq);

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
                      buttonNames: ["Yes", "No"],
                      icon: "CONFIRM",
                    });

                    btn99 = btnName;
                    if (btnName === "No") {
                      returnVal = "";
                    }
                  } else if (postData[i]?.O_STATUS === "0") {
                    formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", Apireq);
                    if (btn99 !== "No") {
                      returnVal = postData[i];
                    } else {
                      returnVal = "";
                    }
                    let jointDetail = await getJointDetailsList({
                      COMP_CD: auth?.companyID,
                      BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
                      ACCT_CD: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentFieldsValues?.["ACCT_TYPE"]?.optionData
                      ),
                      ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
                    });
                    formState.setDataOnFieldChange("JOINT_DETAIL", jointDetail);
                  }
                }
                btn99 = 0;
                return {
                  ACCT_CD:
                    returnVal !== ""
                      ? {
                          value: field?.value.padStart(6, "0")?.padEnd(20, " "),
                          ignoreUpdate: true,
                          isFieldFocused: false,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: true,
                        },
                  TRAN_BAL: {
                    value: returnVal?.TRAN_BAL ?? "",
                  },
                  ACCT_NM: {
                    value: returnVal?.ACCT_NM ?? "",
                  },
                  ACCT_NAME: {
                    value: returnVal?.ACCT_NAME ?? "",
                  },
                  ADD1: {
                    value: returnVal?.ADD1 ?? "",
                  },
                  LIMIT_AMOUNT: {
                    value: returnVal?.LIMIT_AMOUNT ?? "",
                  },
                  CONTACT_INFO: {
                    value: returnVal?.CONTACT_INFO ?? "",
                  },
                  ACCT_MODE: {
                    value: returnVal?.ACCT_MODE ?? "",
                  },
                  PARA_BNFCRY: {
                    value: returnVal?.PARA_BNFCRY ?? "",
                  },
                  TYPE_CD: {
                    value: returnVal?.TYPE_CD ?? "",
                  },
                  PARA_UTR: {
                    value: returnVal?.PARA_UTR ?? "",
                  },
                  SER_CHRG_AMT: { value: "" },
                  COMM_AMT: { value: "" },
                  AMOUNT: { value: "" },
                  CHEQUE_NO: { value: "" },
                  TOTAL: { value: "" },
                };
              } else if (!field?.value) {
                return {
                  ACCT_NM: { value: "" },
                  LIMIT_AMOUNT: { value: "" },
                  ACCT_NAME: { value: "" },
                  CONTACT_INFO: { value: "" },
                  ACCT_MODE: { value: "" },
                  ADD1: { value: "" },
                  TRAN_BAL: { value: "" },
                  PARA_BNFCRY: { value: "" },
                  TYPE_CD: { value: "" },
                  PARA_UTR: { value: "" },
                  SER_CHRG_AMT: { value: "" },
                  COMM_AMT: { value: "" },
                  CHEQUE_NO: { value: "" },
                  AMOUNT: { value: "" },
                  TOTAL: { value: "" },
                };
              }
            } catch (error: any) {
              const Msg = await formState.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg ?? "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (Msg === "Ok") {
                return {
                  ACCT_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } finally {
              formState?.setDisableBtn(false);
            }
            return {};
          },
          runPostValidationHookAlways: true,
          GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 1.7 },
        },
      },
      __VIEW__: {
        branchCodeMetadata: {
          GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        accountTypeMetadata: {
          GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
        },
        accountCodeMetadata: {
          GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
          postValidationSetCrossFieldValues: (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {},
        },
      },
      __EDIT__: {
        branchCodeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        accountTypeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
        },
        accountCodeMetadata: {
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
          postValidationSetCrossFieldValues: (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {},
        },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_BNFCRY",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_UTR",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      label: "",
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
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
        decimalScale: 2,
      },
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LIMIT_AMOUNT",
      label: "Limit",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_MODE",
      label: "ACMode",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "OrdACName",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      type: "text",
      fullWidth: true,
      placeholder: "EnterOrderingAcName",
      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["PleaseEnterOrderingAcName"],
          },
        ],
      },
      __EDIT__: {
        dependentFields: ["BR_CONFIRMED"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "ACAddress",
      type: "text",
      placeholder: "EnterOrderingAcAddress",
      fullWidth: true,
      __EDIT__: {
        dependentFields: ["BR_CONFIRMED"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 3.3 },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["PleaseEnterOrderingAcAddress"],
          },
        ],
      },
    },

    {
      render: {
        componentType: "phoneNumberOptional",
      },
      name: "CONTACT_INFO",
      label: "ContactNo",
      placeholder: "MobileNo",
      type: "string",
      startsIcon: "PhoneAndroidSharp",
      iconStyle: {
        color: "var(--theme-color3)",
        height: 20,
        width: 20,
      },
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
      required: true,
      maxLength: 10,
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["PleaseEnterOrderingAcContactInformation"],
          },
        ],
      },
      validate: (columnValue, allField, flag) => {
        if (columnValue.value.length <= 0) {
          return "";
        } else if (columnValue.value.length >= 11) {
          return "MobileNumberGreaterThanValidation";
        } else if (columnValue.value.length <= 9) {
          return "MobileNumberLessThanValidation";
        }
        return "";
      },
      __EDIT__: {
        dependentFields: ["BR_CONFIRMED"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "ChequeNo",
      type: "text",
      autoComplete: "off",
      __EDIT__: { isReadOnly: true },
      __NEW__: {
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
          rules: [
            {
              name: "required",
              params: ["PleaseEnterChequeNumber"],
            },
          ],
        },
        dependentFields: ["ACCT_CD", "ACCT_TYPE", "BRANCH_CD", "TYPE_CD"],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          formState?.setDisableBtn(true);
          try {
            if (
              field.value &&
              dependentFieldsValues?.["ACCT_CD"]?.value.length === 0
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Information",
                message: "Enter Account Information",
                buttonNames: ["Ok"],
              });

              if (buttonName === "Ok") {
                return {
                  CHEQUE_NO: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                  ACCT_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                };
              }
            } else if (
              field.value &&
              dependentFieldsValues?.["ACCT_CD"]?.value?.length
            ) {
              let postData = await API.getRtgsChequeNoValidation({
                COMP_CD: auth?.companyID,
                BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
                ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
                ACCT_CD: utilFunction.getPadAccountNumber(
                  dependentFieldsValues?.["ACCT_CD"]?.value,
                  dependentFieldsValues?.["ACCT_TYPE"]?.optionData
                ),
                CHEQUE_NO: field.value,
                TYPE_CD: dependentFieldsValues?.["TYPE_CD"]?.value,
                SCREEN_REF: formState?.docCD,
              });

              let returnVal;
              for (const obj of postData) {
                if (
                  obj?.O_STATUS === "999" ||
                  obj?.O_STATUS === "99" ||
                  obj?.O_STATUS === "9"
                ) {
                  const buttonName = await formState?.MessageBox({
                    messageTitle: obj?.O_MSG_TITLE?.length
                      ? obj?.O_MSG_TITLE
                      : obj?.O_STATUS === "9"
                      ? "Alert"
                      : obj?.O_STATUS === "99"
                      ? "Confirmation"
                      : "ValidationFailed",
                    message: obj?.O_MESSAGE ?? "",
                    buttonNames:
                      obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                    loadingBtnName: ["Yes"],
                    icon:
                      obj?.O_STATUS === "999"
                        ? "ERROR"
                        : obj?.O_STATUS === "99"
                        ? "CONFIRM"
                        : obj?.O_STATUS === "9"
                        ? "WARNING"
                        : "INFO",
                  });
                  if (
                    obj?.O_STATUS === "999" ||
                    (obj?.O_STATUS === "99" && buttonName === "No")
                  ) {
                    break;
                  }
                } else if (obj?.O_STATUS === "0") {
                  returnVal = postData[0];
                }
              }
              return {
                CHEQUE_NO: returnVal
                  ? {
                      value: field?.value,
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
              };
            } else if (!field?.value) {
              return {
                CHEQUE_DT: { value: "" },
              };
            }
          } catch (error: any) {
            const Msg = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Msg === "Ok") {
              return {
                CHEQUE_NO: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          } finally {
            formState?.setDisableBtn(false);
          }
          return {};
        },
      },
      GridProps: { xs: 6, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      placeholder: "DD/MM/YYYY",
      format: "dd/MM/yyyy",
      type: "text",
      fullWidth: true,
      dependentFields: ["BR_CONFIRMED", "CHEQUE_NO", "BRANCH_CD", "TYPE_CD"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.setDisableBtn(true);
        try {
          if (field.value) {
            if (formState?.isSubmitting) return {};
            let postData = await API.getChqDateValidation({
              BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
              CHEQUE_NO: dependentFieldsValues?.["CHEQUE_NO"]?.value?.length
                ? dependentFieldsValues?.["CHEQUE_NO"]?.value
                : "",
              CHEQUE_DT: format(new Date(field.value), "dd/MMM/yyyy"),
              TYPE_CD: "6",
            });
            let btn99;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData.length; i++) {
              if (postData[i]?.STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: "ValidationFailed",
                  message: postData[i]?.MESSAGE1,
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    CHEQUE_DT: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    REMARKS: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (postData[i]?.STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: "Alert",
                    message: postData[i]?.MESSAGE1,
                    icon: "WARNING",
                  });
                }
              } else if (postData[i]?.STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: "Confirmation",
                  message: postData[i]?.MESSAGE1,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  return {
                    CHEQUE_DT: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    REMARKS: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (postData[i]?.STATUS === "0") {
                return {
                  CHEQUE_DT: {
                    value: field?.value,
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                };
              }
            }
          }
        } catch (error: any) {
          const Msg = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (Msg === "Ok") {
            return {
              CHEQUE_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
              REMARKS: { value: "" },
            };
          }
        } finally {
          formState?.setDisableBtn(false);
        }
        return {};
      },
      // validate: (currentField, dependentField) => {
      //   if (!currentField?.value) return "";
      //   const currentDate = format(new Date(currentField?.value), "dd/MM/yyyy");
      //   const transactionDate = format(
      //     new Date(dependentField?.TRAN_DT?.value),
      //     "dd/MM/yyyy"
      //   );
      //   if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
      //     return "Mustbeavaliddate";
      //   }
      //   if (currentDate < transactionDate || currentDate > transactionDate) {
      //     return (
      //       t("DateShouldBetween") +
      //       " " +
      //       transactionDate +
      //       " - " +
      //       transactionDate
      //     );
      //   }
      //   return "";
      // },
      __EDIT__: {
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      type: "text",
      fullWidth: true,
      placeholder: "EnterRemarks",
      __EDIT__: {
        dependentFields: ["BR_CONFIRMED"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.BR_CONFIRMED?.value === "0") {
            return false;
          } else {
            return true;
          }
        },
      },
      GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "Amount",
      placeholder: "",
      type: "text",
      required: true,
      __EDIT__: { isReadOnly: true },
      __NEW__: {
        FormatProps: {
          allowNegative: false,
        },
        dependentFields: [
          "ACCT_CD",
          "ACCT_TYPE",
          "BRANCH_CD",
          "ENTRY_TYPE",
          "DEF_TRAN_CD",
        ],
        schemaValidation: {
          type: "string",
          rules: [
            {
              name: "required",
              params: ["PleaseEnterRTGSNEFTOrderingAmount"],
            },
          ],
        },
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          formState?.setDisableBtn(true);
          try {
            if (
              field.value &&
              dependentFieldsValues?.["ACCT_CD"]?.value.length === 0
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Information",
                message: "EnterAccountInformation",
                buttonNames: ["Ok"],
              });

              if (buttonName === "Ok") {
                return {
                  AMOUNT: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                  ACCT_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                };
              }
            } else if (
              field.value &&
              dependentFieldsValues?.["ACCT_CD"]?.value &&
              dependentFieldsValues?.["ACCT_TYPE"]?.value &&
              dependentFieldsValues?.["BRANCH_CD"]?.value &&
              dependentFieldsValues?.["ENTRY_TYPE"]?.value &&
              dependentFieldsValues?.["DEF_TRAN_CD"]?.value
            ) {
              let Validate = await API.validateAmount({
                COMP_CD: auth?.companyID ?? "",
                BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
                ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
                ACCT_CD:
                  utilFunction.getPadAccountNumber(
                    dependentFieldsValues?.["ACCT_CD"]?.value,
                    dependentFieldsValues?.["ACCT_TYPE"]?.optionData?.[0] ?? ""
                  ) ?? "",
                AMOUNT: field.value,
                SCREEN_REF: formState?.docCD ?? "",
                WORKING_DATE: auth?.workingDate ?? "",
                USERNAME: auth?.user?.id ?? "",
                USERROLE: auth?.role ?? "",
                ENTRY_TYPE: dependentFieldsValues?.["ENTRY_TYPE"]?.value ?? "",
              });
              let btn99;

              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };
              for (let i = 0; i < Validate.length; i++) {
                if (Validate[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: Validate[i]?.O_MSG_TITLE,
                    message: Validate[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  if (btnName === "Ok") {
                    return {
                      AMOUNT: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                      COMM_AMT: {
                        value: "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                    };
                  }
                } else if (Validate[i]?.O_STATUS === "9") {
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: Validate[i]?.O_MSG_TITLE,
                      message: Validate[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                } else if (Validate[i]?.O_STATUS === "99") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: Validate[i]?.O_MSG_TITLE,
                    message: Validate[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });

                  btn99 = btnName;
                  if (btnName === "No") {
                    return {
                      COMM_AMT: {
                        value: "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                      AMOUNT: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                    };
                  }
                } else if (Validate[i]?.O_STATUS === "0") {
                  let postData = await API.getRtgsAmountChargeValidation({
                    COMP_CD: auth?.companyID ?? "",
                    BRANCH_CD:
                      dependentFieldsValues?.["BRANCH_CD"]?.value ?? "",
                    ACCT_TYPE:
                      dependentFieldsValues?.["ACCT_TYPE"]?.value ?? "",
                    ACCT_CD:
                      utilFunction.getPadAccountNumber(
                        dependentFieldsValues?.["ACCT_CD"]?.value,
                        dependentFieldsValues?.["ACCT_TYPE"]?.optionData?.[0] ??
                          {}
                      ) ?? "",
                    DEF_TRAN_CD:
                      dependentFieldsValues?.["DEF_TRAN_CD"]?.value ?? "",
                    ENTRY_TYPE:
                      dependentFieldsValues?.["ENTRY_TYPE"]?.value ?? "",
                    AMOUNT: field.value ?? "",
                    WORKING_DATE: auth?.workingDate ?? "",
                    BASE_BRANCH_CD: auth?.user?.baseBranchCode ?? "",
                    ENT_BRANCH: auth?.user?.branchCode ?? "",
                  });
                  return {
                    COMM_AMT: { value: postData?.[0]?.CHRG_AMT },
                    SER_CHRG_AMT: { value: postData?.[0]?.GST_AMT },
                    ENABLE_DISABLE: { value: postData?.[0]?.ENABLE_DISABLE },
                    TAX_RATE: { value: postData?.[0]?.TAX_RATE },
                  };
                }
              }
            } else if (!field?.value) {
              return {
                SER_CHRG_AMT: { value: "" },
                COMM_AMT: { value: "" },
                ENABLE_DISABLE: { value: "" },
                TAX_RATE: { value: "" },
              };
            }
          } catch (error: any) {
            const Msg = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Msg === "Ok") {
              return {
                AMOUNT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                COMM_AMT: { value: "" },
              };
            }
          } finally {
            formState?.setDisableBtn(false);
          }
          return {};
        },
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TAX_RATE",
      type: "text",
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COMM_AMT",
      label: "CommAmount",
      placeholder: "",
      type: "text",
      __EDIT__: { isReadOnly: true },
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
      dependentFields: ["ENABLE_DISABLE", "TAX_RATE"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        const taxAmount = Number(dependentFieldsValues?.TAX_RATE?.value) ?? "";
        if (!isNaN(taxAmount) && Number(field?.value) > 0) {
          const GstCal = (Number(field?.value) * Number(taxAmount)) / 100;
          return {
            SER_CHRG_AMT: {
              value: GstCal ?? "",
            },
          };
        } else {
          return {
            SER_CHRG_AMT: {
              value: "",
            },
          };
        }
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.ENABLE_DISABLE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENABLE_DISABLE",
      label: "",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SER_CHRG_AMT",
      label: "GST",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 1.2,
        sm: 1.2,
        lg: 1.2,
        xl: 1.2,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL",
      label: "TotalAmount",
      placeholder: "",
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },

      dependentFields: ["AMOUNT", "SER_CHRG_AMT", "COMM_AMT"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        const amount = parseFloat(dependentFields?.AMOUNT?.value) || 0;
        const serviceCharge =
          parseFloat(dependentFields?.SER_CHRG_AMT?.value) || 0;
        const commission = parseFloat(dependentFields?.COMM_AMT?.value) || 0;
        return amount + serviceCharge + commission;
      },
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
      __EDIT__: { render: { componentType: "textField" } },
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
      __EDIT__: { render: { componentType: "datetimePicker" } },
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "CONF_STATUS",
      label: "ConfirmStatus",
      placeholder: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      __VIEW__: { render: { componentType: "textField" } },
      __EDIT__: { render: { componentType: "textField" } },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "VERIFIED_BY",
    //   label: "Checker",
    //   placeholder: "",
    //   type: "text",
    //   fullWidth: true,
    //   isReadOnly: true,
    //   dependentFields: ["CONFIRMED"],
    //   __VIEW__: { render: { componentType: "textField" } },
    //   __EDIT__: { render: { componentType: "textField" } },
    //   shouldExclude: (_, dependentFieldsValues, __) => {
    //     if (dependentFieldsValues?.CONFIRMED?.value === "Pending") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: { xs: 12, sm: 1.3, md: 1.2, lg: 1.2, xl: 1.5 },
    // },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "VERIFIED_DATE",
    //   label: "Checker Time",
    //   placeholder: "",
    //   type: "text",
    //   format: "dd/MM/yyyy HH:mm:ss",
    //   __VIEW__: { render: { componentType: "datetimePicker" } },
    //   __EDIT__: { render: { componentType: "datetimePicker" } },
    //   fullWidth: true,
    //   isReadOnly: true,
    //   dependentFields: ["CONFIRMED"],
    //   shouldExclude: (_, dependentFieldsValues, __) => {
    //     if (dependentFieldsValues?.CONFIRMED?.value === "Pending") {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   },
    //   GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    // },
  ],
};

export const SlipJoinDetailGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "JointDetail",
    rowIdColumn: "index",
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
      accessor: "JOINT_DISC",
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
      accessor: "REF_ACCT",
      columnName: "ReferenceAccount",
      sequence: 7,
      alignment: "center",
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "phone1",
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
export const IFSCBankDetailGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "IFSCBankDetail",
    rowIdColumn: "index",
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
    hideHeader: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "40vh",
      max: "40vh",
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
      alignment: "left",
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },
    {
      accessor: "TO_ACCT_TYPE_DIS",
      columnName: "AcctType",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "TO_ACCT_NO",
      columnName: "ACNo",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "TO_ACCT_NM",
      columnName: "Account_Name",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 300,
    },

    {
      accessor: "TO_ADD1",
      columnName: "Address",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "TO_CONTACT_NO",
      columnName: "MobileNo",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "TO_EMAIL_ID",
      columnName: "EmailID",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 200,
      maxWidth: 220,
    },
  ],
};

export const rtgsAccountDetailFormMetaData: any = {
  form: {
    refID: 1667,
    name: "beneficiaryDtlFormMetaData",
    label: "Beneficiary Detail",
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
      Divider: {
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
      GridProps: { xs: 12, sm: 12, md: 6, lg: 6, xl: 8 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "ORDERING_AMOUNT",
      label: "OrderingAmount",
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

      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "BENIFICIARY_AMOUNT",
      label: "TotalBenificiaryAmount",
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

      dependentFields: ["beneficiaryAcDetails"],
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["beneficiaryAcDetails"])
            ? dependentFieldState?.["beneficiaryAcDetails"]
            : []
        ).reduce((accum, obj) => accum + Number(obj.AMOUNT?.value), 0);

        return accumulatedTakeoverLoanAmount;
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 2 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      validationRun: "onBlur",
      dependentFields: ["ORDERING_AMOUNT", "BENIFICIARY_AMOUNT"],
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value =
          Number(dependentFields?.ORDERING_AMOUNT?.value) -
          Number(dependentFields?.BENIFICIARY_AMOUNT?.value);
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
      // GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
    },
    // {
    //   render: {
    //     componentType: "formbutton",
    //   },
    //   name: "ADDNEWROW",
    //   label: "AddRow",
    //   endsIcon: "AddCircleOutlineRounded",
    //   rotateIcon: "scale(1)",
    //   placeholder: "",
    //   type: "text",
    //   tabIndex: "-1",
    //   iconStyle: {
    //     fontSize: "25px !important",
    //   },
    //   __VIEW__: { render: { componentType: "hidden" } },
    //   GridProps: { xs: 2.2, sm: 2, md: 1.8, lg: 1.2, xl: 1.2 },
    // },
    {
      render: {
        componentType: "arrayField",
      },
      isRemoveButton: true,
      displayCountName: "Beneficiary A/C Detail",
      // fixedRows: true,
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.beneficiaryAcDetails)
          ? data?.beneficiaryAcDetails
          : [];
        if (dataArray?.length > 0) {
          for (let i = 0; i < dataArray.length; i++) {
            const item = dataArray[i];
            if (!item.TO_ACCT_NO.trim()) {
              return {
                reason: t("PleaseEnterTheBeneficiaryAcNumber"),
              };
            }
            if (!item.AMOUNT.trim()) {
              return {
                reason: t("PleaseEnterCollateralAmt"),
              };
            }
          }

          return true;
        } else {
          return true;
        }
      },
      isScreenStyle: true,
      disagreeButtonName: "No",
      agreeButtonName: "Yes",
      errorTitle: "deleteTitle",
      name: "beneficiaryAcDetails",
      removeRowFn: "deleteFormArrayFieldData",
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
        },
        {
          render: { componentType: "hidden" },
          name: "isOldRow",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "FILED_HIDDEN",
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "TO_ACCT_NO",
          label: "ACNo",
          required: true,
          defaultValue: "",
          isFieldFocused: true,
          schemaValidation: {
            type: "string",
            rules: [
              {
                name: "required",
                params: ["PleaseEnterTheBeneficiaryAcNumber"],
              },
            ],
          },
          placeholder: "EnterBeneficiaryAccountNumber",
          GridProps: { xs: 12, sm: 8, md: 5, lg: 3.5, xl: 3 },
          __EDIT__: {
            dependentFields: ["FILED_HIDDEN"],
            isReadOnly: (field, dependentField, formState) => {
              if (
                dependentField?.["beneficiaryAcDetails.FILED_HIDDEN"]?.value ===
                "Y"
              ) {
                return true;
              } else {
                return false;
              }
            },
          },
          options: async (dependentValue, formState, _, authState) => {
            // return formState?.rtgsAcData
            return API.getRtgsBenfDtlList({
              COMP_CD: authState?.companyID,
              WORKING_DATE: authState?.workingDate,
              BRANCH_CD:
                formState?.rtgsAcData?.PARA_BNFCRY === "Y" ||
                formState?.rtgsAcData?.PARA_BNFCRY === "D"
                  ? formState?.rtgsAcData?.BRANCH_CD
                  : authState?.user?.branchCode ?? "",
              ACCT_TYPE:
                formState?.rtgsAcData?.PARA_BNFCRY === "Y"
                  ? formState?.rtgsAcData?.ACCT_TYPE ?? ""
                  : "",
              ACCT_CD:
                formState?.rtgsAcData?.PARA_BNFCRY === "Y"
                  ? formState?.rtgsAcData?.ACCT_CD.padStart(6, "0")?.padEnd(
                      20,
                      " "
                    ) ?? ""
                  : "",
              // FLAG: "N",
              FLAG: formState?.rtgsAcData?.PARA_BNFCRY,
            });
          },
          runPostValidationHookAlways: true,
          _optionsKey: "getRtgsBenfDtlList",
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.setDisableBtn(true);
            try {
              if (
                field?.value &&
                field.optionData &&
                field.optionData.length > 0
              ) {
                let validateIFSC = await getIfscBenDetail({
                  IFSC_CODE: field.optionData[0].TO_IFSCCODE ?? "",
                  ENTRY_TYPE: formState?.rtgsAcData?.ENTRY_TYPE ?? "",
                  USERNAME: auth?.user?.id ?? "",
                  USERROLE: auth?.role ?? "",
                });
                if (validateIFSC?.[0]?.O_STATUS === "999") {
                  let buttonName = await formState.MessageBox({
                    messageTitle: validateIFSC?.[0]?.O_MSG_TITLE,
                    message: validateIFSC?.[0]?.O_MESSAGE,
                    buttonNames: ["Ok"],
                    icon: "ERROR",
                  });
                  if (buttonName === "Ok") {
                    return {
                      TO_ACCT_NO: {
                        value: "",
                        isFieldFocused: true,
                      },
                      TO_ACCT_NM: { value: "" },
                      TO_ACCT_TYPE: {
                        value: "",
                      },
                      CONTACT_NO: {
                        value: "",
                      },
                      TO_EMAIL_ID: { value: "" },
                      TO_ADD1: { value: "" },
                      REMARKS: { value: "" },
                      TO_IFSCCODE: { value: "" },
                      BANK_NM: { value: "" },
                      BRANCH_NM: { value: "" },
                      CONTACT_DTL: { value: "" },
                      CENTRE_NM: { value: "" },
                      ADDR: { value: "" },
                      DISTRICT_NM: { value: "" },
                      STATE_NM: { value: "" },
                    };
                  }
                } else if (validateIFSC?.[0]?.O_STATUS === "0") {
                  let postData = await getIfscBankDetail({
                    AS_VALUE: field?.optionData[0].TO_IFSCCODE ?? "",
                    FLAG: "I",
                  });
                  return {
                    // TO_ACCT_NO: { value: field.value.split('-')[0] ?? "" },
                    TO_ACCT_NM: { value: field.optionData[0].TO_ACCT_NM ?? "" },
                    TO_ACCT_TYPE: {
                      value: field.optionData[0].TO_ACCT_TYPE ?? "",
                    },
                    CONTACT_NO: {
                      value: field.optionData[0].TO_CONTACT_NO ?? "",
                    },
                    TO_EMAIL_ID: {
                      value: field.optionData[0].TO_EMAIL_ID ?? "",
                    },
                    TO_ADD1: { value: field.optionData[0].TO_ADD1 ?? "" },
                    TO_IFSCCODE: { value: postData?.[0].IFSC_CODE ?? "" },
                    BANK_NM: { value: postData?.[0].BANK_NM ?? "" },
                    BRANCH_NM: { value: postData?.[0].BRANCH_NM ?? "" },
                    CONTACT_DTL: { value: postData?.[0].CONTACT_DTL ?? "" },
                    CENTRE_NM: { value: postData?.[0].CENTRE_NM ?? "" },
                    ADDR: { value: postData?.[0].ADD1 ?? "" },
                    DISTRICT_NM: { value: postData?.[0].DISTRICT_NM ?? "" },
                    STATE_NM: { value: postData?.[0].STATE_NM ?? "" },
                  };
                }
              } else if (!field?.value) {
                return {
                  TO_ACCT_NM: { value: "" },
                  TO_ACCT_TYPE: { value: "" },
                  CONTACT_NO: { value: "" },
                  TO_EMAIL_ID: { value: "" },
                  TO_ADD1: { value: "" },
                  TO_IFSCCODE: { value: "" },
                  BANK_NM: { value: "" },
                  BRANCH_NM: { value: "" },
                  CONTACT_DTL: { value: "" },
                  CENTRE_NM: { value: "" },
                  ADDR: { value: "" },
                  DISTRICT_NM: { value: "" },
                  STATE_NM: { value: "" },
                };
              }
            } catch (error: any) {
              const Msg = await formState.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg ?? "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (Msg === "Ok") {
                return {
                  TO_ACCT_NO: {
                    value: "",
                    isFieldFocused: true,
                  },
                  TO_ACCT_NM: { value: "" },
                  TO_ACCT_TYPE: {
                    value: "",
                  },
                  CONTACT_NO: {
                    value: "",
                  },
                  TO_EMAIL_ID: { value: "" },
                  TO_ADD1: { value: "" },
                  REMARKS: { value: "" },
                  TO_IFSCCODE: { value: "" },
                  BANK_NM: { value: "" },
                  BRANCH_NM: { value: "" },
                  CONTACT_DTL: { value: "" },
                  CENTRE_NM: { value: "" },
                  ADDR: { value: "" },
                  DISTRICT_NM: { value: "" },
                  STATE_NM: { value: "" },
                };
              }
            } finally {
              formState?.setDisableBtn(false);
            }
            return {};
          },
          disableCaching: true,
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "BENEFICIARY",
          label: "Add",
          placeholder: "",
          type: "text",
          tabIndex: "-1",
          iconStyle: {
            fontSize: "25px !important",
          },
          shouldExclude(fieldData, dependentFields, formState) {
            if (formState?.isIfscCdData?.[0] === "Y") {
              return false;
            } else {
              return true;
            }
          },
          __VIEW__: { render: { componentType: "hidden" } },
          GridProps: { xs: 1, sm: 4, md: 2, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_NM",
          label: "Name",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 7, md: 5, lg: 3, xl: 2.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_TYPE",
          label: "AccountType",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,

          GridProps: { xs: 12, sm: 5, md: 3, lg: 2.5, xl: 1.3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "CONTACT_NO",
          label: "MobileNo",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 1.2 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_EMAIL_ID",
          label: "EmailID",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,

          GridProps: { xs: 12, sm: 9, md: 6, lg: 3.5, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_ADD1",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          label: "Address",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          GridProps: { xs: 12, sm: 12, md: 6, lg: 4.5, xl: 3.4 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "BENEF_REM_EDIT",
        },

        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          type: "text",
          fullWidth: true,
          placeholder: "EnterRemarks",
          dependentFields: ["BENEF_REM_EDIT"],
          isReadOnly(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.BENEF_REM_EDIT?.value === "Y") {
              return true;
            } else {
              return false;
            }
          },
          // validate: (columnValue, allField, flag) => {
          //   let regex = /^[a-zA-Z0-9 ]*$/;
          //   // special-character not allowed
          //   if (columnValue.value) {
          //     if (!regex.test(columnValue.value)) {
          //       return "PleaseEnterAlphanumericValue";
          //     }
          //   }
          //   return "";
          // },
          GridProps: { xs: 12, sm: 12, md: 6, lg: 4, xl: 3.4 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMITTANCE_INFO",
          label: "RemittanceInfo",
          type: "text",
          fullWidth: true,
          placeholder: "EnterTheRemittanceInfo",
          GridProps: { xs: 12, sm: 8, md: 8, lg: 9, xl: 3.2 },
          dependentFields: ["BENEF_REM_EDIT"],
          isReadOnly(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.BENEF_REM_EDIT?.value === "Y") {
              return true;
            } else {
              return false;
            }
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "Amount",
          placeholder: "",
          type: "text",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["PleaseEnterTheBenAmount"] }],
          },
          __EDIT__: {
            dependentFields: ["FILED_HIDDEN"],
            isReadOnly: (field, dependentField, formState) => {
              if (
                dependentField?.["beneficiaryAcDetails.FILED_HIDDEN"]?.value ===
                "Y"
              ) {
                return true;
              } else {
                return false;
              }
            },
          },
          FormatProps: {
            allowNegative: false,
          },
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: false,
          },
          postValidationSetCrossFieldValues: async (...arr) => {
            if (arr[0].value) {
              arr?.[1].setDataOnFieldChange("AMOUNT", "");
            }
          },
          GridProps: { xs: 12, sm: 4, md: 4, lg: 3, xl: 2 },
        },

        {
          render: {
            componentType: "divider",
          },
          dividerText: "IFSC Bank Detail",
          name: "Address",
          label: "IFSCBankDetail",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_IFSCCODE",
          label: "IFSC",
          type: "text",
          fullWidth: true,
          required: true,
          isReadOnly: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            formState.setDataOnFieldChange("IFSC_CD", field?.value);
          },
          GridProps: { xs: 12, sm: 8, md: 3, lg: 2.5, xl: 2.2 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "IFSC",
          label: "IfscDetail",
          placeholder: "",
          type: "text",
          tabIndex: "-1",
          iconStyle: {
            fontSize: "25px !important",
          },
          __VIEW__: { render: { componentType: "hidden" } },
          GridProps: { xs: 1.2, sm: 4, md: 2, lg: 1.2, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "Bank",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3.5, xl: 3.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH_NM",
          label: "Branch",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CONTACT_DTL",
          label: "Contact",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 1.8, xl: 1.8 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CENTRE_NM",
          label: "Center",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 2.5, xl: 2.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADDR",
          label: "Address",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 12, md: 6, lg: 4.5, xl: 4.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISTRICT_NM",
          label: "District",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 6, lg: 2.5, xl: 2.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STATE_NM",
          label: "State",
          placeholder: "",
          type: "text",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 6, lg: 2.5, xl: 2.5 },
        },
      ],
    },
  ],
};

export const AddNewBenfiDetailGridMetadata: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "ListOfBeneficiaryAcOrdering",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: true,
    disableGlobalFilter: true,
    hideFooter: false,
    hideHeader: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "45vh",
      max: "45vh",
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
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },

    {
      accessor: "TO_IFSCCODE",
      columnName: "IFSCCode",
      sequence: 2,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "TO_ACCT_TYPE",
      columnName: "AcctType",
      sequence: 3,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },

    {
      accessor: "TO_ACCT_NO",
      columnName: "ACNo",
      sequence: 4,
      componentType: "default",
      width: 300,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "TO_ACCT_NM",
      columnName: "Account_Name",
      sequence: 5,
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 300,
    },

    {
      accessor: "TO_ADD1",
      columnName: "Address",
      sequence: 6,
      componentType: "default",
      width: 400,
      minWidth: 400,
      maxWidth: 450,
    },
    {
      accessor: "TO_CONTACT_NO",
      columnName: "MobileNo",
      sequence: 7,
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "TO_EMAIL_ID",
      columnName: "EmailID",
      sequence: 8,
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 250,
    },
    {
      accessor: "ACTIVE_FLAG",
      columnName: "Active",
      sequence: 9,
      componentType: "default",
      width: 150,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 10,
      componentType: "default",
      width: 250,
      minWidth: 250,
      maxWidth: 300,
    },
    {
      accessor: "TO_LEI_NO",
      columnName: "LEI No.",
      sequence: 11,
      componentType: "default",
      width: 250,
      minWidth: 250,
      maxWidth: 300,
    },
  ],
};
export const AuditBenfiDetailFormMetadata = {
  form: {
    name: "BeneficiaryAccountAuditTrail",
    label: "BeneficiaryAccountMaster",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
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
      name: "TO_IFSCCODE",
      label: "IFSCCode",
      placeholder: "EnterIFSCCode",
      type: "text",
      txtTransform: "uppercase",
      maxLength: 11,
      handleKeyDown: (e, dependenet, authstate, formstate) => {
        if (e.key === "F5") {
          e.preventDefault();
          formstate.setDataOnFieldChange("F5");
        }
      },
      __EDIT__: {
        isReadOnly: true,
      },
      __NEW__: {
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterTheBeneficiaryIFSCCode"] },
          ],
        },
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          formState?.setDisableBtn(true);
          try {
            if (field?.value) {
              let postData = await getIfscBenDetail({
                IFSC_CODE: field?.value ?? "",
                ENTRY_TYPE: "",
                USERNAME: auth?.user?.id ?? "",
                USERROLE: auth?.role ?? "",
              });
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
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });

                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
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
                TO_IFSCCODE:
                  returnVal !== ""
                    ? {
                        value: field?.value,
                        ignoreUpdate: true,
                        isFieldFocused: false,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                BANK_NM: { value: returnVal.BANK_NM ?? "" },
                BRANCH_NM: { value: returnVal.BRANCH_NM ?? "" },
                CONTACT_DTL: { value: returnVal.CONTACT_DTL ?? "" },
                CENTRE_NM: { value: returnVal.CENTRE_NM ?? "" },
                ADDR: { value: returnVal.ADDR ?? "" },
                DISTRICT_NM: { value: returnVal.DISTRICT_NM ?? "" },
                STATE_NM: { value: returnVal.STATE_NM ?? "" },
                MICR_CODE: { value: returnVal.MICR_CODE ?? "" },
                PARA_162: { value: returnVal.PARA_162 ?? "" },
              };
            } else if (!field?.value) {
              return {
                MICR_CODE: { value: "" },
                BANK_NM: { value: "" },
                BRANCH_NM: { value: "" },
                CONTACT_DTL: { value: "" },
                CENTRE_NM: { value: "" },
                ADDR: { value: "" },
                DISTRICT_NM: { value: "" },
                STATE_NM: { value: "" },
                PARA_162: { value: "" },
              };
            }
          } catch (error: any) {
            const Msg = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Msg === "Ok") {
              return {
                TO_IFSCCODE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          } finally {
            formState?.setDisableBtn(false);
          }
          return {};
        },
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_162",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TO_ACCT_TYPE",
      label: "AcctType",
      placeholder: "AccountTypePlaceHolder",
      type: "text",
      txtTransform: "uppercase",
      options: () => {
        return API.getAcctTypeData();
      },
      _optionsKey: "getAcctTypeData",
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NO",
      label: "ACNumber",
      placeholder: "AccountNumberPlaceHolder",
      type: "text",
      txtTransform: "uppercase",
      required: true,
      maxLength: 35,
      __NEW__: {
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterTheBeneficiaryAcNumber"] },
          ],
        },
        validate: (columnValue, allField, flag) => {
          let regex = /^[a-zA-Z0-9 ]*$/;
          // special-character not allowed
          if (columnValue.value) {
            if (!regex.test(columnValue.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
          return "";
        },
        txtTransform: "uppercase",
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4, xl: 2.5 },
      __EDIT__: {
        isReadOnly: true,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NM",
      label: "Account_Name",
      placeholder: "EnterAcName",
      txtTransform: "uppercase",
      type: "text",
      __NEW__: {
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterTheBeneficiaryAcName"] },
          ],
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 6, md: 4.5, lg: 4, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ADD1",
      label: "Address",
      placeholder: "EnterAddress",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      type: "text",
      txtTransform: "uppercase",
      __NEW__: {
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            {
              name: "required",
              params: ["PleaseEnterTheBeneficiaryAcAddress"],
            },
          ],
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 12, md: 4.5, lg: 5, xl: 4 },
    },

    {
      render: {
        componentType: "phoneNumberOptional",
      },
      name: "TO_CONTACT_NO",
      label: "MobileNo",
      placeholder: "EnterMobileNo",
      type: "text",
      startsIcon: "PhoneAndroidSharp",
      iconStyle: {
        color: "var(--theme-color3)",
        height: 20,
        width: 20,
      },
      maxLength: 10,
      __NEW__: {
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["PARA_162"],
        validate: (currentField, dependentFields) => {
          if (
            dependentFields?.PARA_162?.value === "Y" &&
            !currentField?.value.trim()
          ) {
            return "PleaseEnterBeneficiaryMobileNo";
          }
          if (currentField?.value.trim()) {
            if (currentField.value.length >= 11) {
              return "MobileNumberGreaterThanValidation";
            } else if (currentField.value.length <= 9) {
              return "MobileNumberLessThanValidation";
            }
            return "";
          }
          return "";
        },
      },
      __EDIT__: {
        isReadOnly: true,
        render: {
          componentType: "textField",
        },
      },
      GridProps: { xs: 12, sm: 5, md: 3, lg: 2, xl: 1.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_EMAIL_ID",
      label: "EmailID",
      placeholder: "EnterEmailID",
      type: "text",
      __EDIT__: {
        isReadOnly: true,
      },
      __NEW__: {
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["PARA_162"],
        validate: (currentField, dependentFields) => {
          let emailRegex =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (
            dependentFields?.PARA_162?.value === "Y" &&
            !currentField?.value.trim()
          ) {
            return "PleaseEnterTheBeneficiaryAcEmailID";
          } else if (
            currentField.value &&
            !emailRegex.test(currentField.value)
          ) {
            return "PleaseEnterValidEmailID";
          }
          return "";
        },
      },
      GridProps: { xs: 12, sm: 7, md: 4, lg: 5, xl: 3.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemark",
      txtTransform: "uppercase",
      type: "text",
      validate: (columnValue, allField, flag) => {
        let regex = /^[a-zA-Z0-9 ]*$/;
        // special-character not allowed
        if (columnValue.value) {
          if (!regex.test(columnValue.value)) {
            return "PleaseEnterAlphanumericValue";
          }
        }
        return "";
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 12, md: 4, lg: 7, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_LEI_NO",
      label: "LEINo",
      placeholder: "EnterTheLEINo",
      type: "text",
      maxLength: 20,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 20) {
            return false;
          }
          return true;
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      txtTransform: "uppercase",
      __NEW__: {
        validate: (columnValue, allField, flag) => {
          let regex = /^[a-zA-Z0-9]*$/;
          if (!regex.test(columnValue.value)) {
            return "LEINoShouldBeAlphaNumeric";
          } else if (columnValue?.value && columnValue?.value?.length < 20) {
            return "LEINoShouldBeExactlyCharacters";
          } else {
            return "";
          }
        },
      },
      GridProps: { xs: 12, sm: 9, md: 3, lg: 4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INACTIVE",
    },

    {
      render: {
        componentType: "hidden",
      },
      defaultValue: true,
      name: "FLAG",
      label: "Flag",
      __NEW__: {
        render: {
          componentType: "checkbox",
        },
      },
      postValidationSetCrossFieldValues: (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value === false) {
          formState?.MessageBox({
            messageTitle: "Alert",
            message: "ThisRecordWillNotSaveBeneficiaryMaster",
            icon: "WARNING",
          });
        }
        return {};
      },
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: { componentType: "spacer" },
      defaultValue: true,
      name: "ACTIVE_FLAG",
      label: "Active",
      __EDIT__: {
        render: {
          componentType: "checkbox",
        },
        dependentFields: ["INACTIVE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.INACTIVE?.value === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      GridProps: { xs: 12, sm: 3, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "divider",
      },
      dividerText: "IFSC Bank Detail",
      name: "Address",
      label: "IFSCBankDetail",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "Bank",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 6, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADDR",
      label: "Address",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 8, md: 6, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_NM",
      label: "Branch",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 7, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE_NM",
      label: "State",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 5, md: 4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DISTRICT_NM",
      label: "District",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2.4 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CENTRE_NM",
      label: "Center",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MICR_CODE",
      label: "MICRCode",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT_DTL",
      label: "Contact",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2.4 },
    },
  ],
};

export const RetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
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
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: {
        xs: 0,
        md: 1,
        sm: 3.9,
        lg: 3.9,
        xl: 3.9,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "GeneralFromDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired."] }],
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
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "GeneralToDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateRequired"] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["FROM_DT"],
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
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
        componentType: "formbutton",
      },
      name: "VIEW_ALL",
      label: "ViewAll",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1, xl: 1 },
    },
  ],
};

export const RetrieveGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "RetrieveGrid",
    rowIdColumn: "TRAN_CD",
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
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 60,
      minWidth: 50,
      maxWidth: 70,
      isAutoSequence: true,
    },
    {
      accessor: "TRAN_TYPE",
      columnName: "EntryType",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 80,
      minWidth: 60,
      maxWidth: 90,
    },
    {
      accessor: "MSG_FLOW",
      columnName: "MsgFlow",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 80,
      minWidth: 60,
      maxWidth: 90,
    },
    {
      accessor: "TRAN_DT",
      columnName: "TranDate",
      sequence: 4,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 90,
      minWidth: 100,
      maxWidth: 110,
    },

    {
      accessor: "SLIP_NO",
      columnName: "SlipNo",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 65,
      minWidth: 40,
      maxWidth: 70,
    },
    {
      accessor: "BR_IFSCCODE",
      columnName: "BranchIfscCode",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 120,
      minWidth: 100,
      maxWidth: 150,
    },

    {
      accessor: "COMP_CD",
      columnName: "Bank",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 50,
      minWidth: 40,
      maxWidth: 70,
    },
    {
      accessor: "BRANCH_CD",
      columnName: "Branch",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 60,
      minWidth: 50,
      maxWidth: 70,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "Type",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 50,
      minWidth: 40,
      maxWidth: 70,
    },
    {
      accessor: "ACCT_CD",
      columnName: "ACNo",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 80,
      minWidth: 60,
      maxWidth: 90,
    },
    {
      accessor: "ACCT_NM",
      columnName: "Name",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 190,
      maxWidth: 350,
    },

    {
      accessor: "CHEQUE_NO",
      columnName: "Cheque",
      sequence: 12,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 60,
      minWidth: 40,
      maxWidth: 70,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 13,
      alignment: "right",
      componentType: "currency",
      placeholder: "",
      isTotalWithCurrency: true,
      width: 80,
      minWidth: 110,
      maxWidth: 200,
    },
    {
      accessor: "COMM_AMT",
      columnName: "CommAmount",
      sequence: 14,
      alignment: "right",
      componentType: "currency",
      isTotalWithCurrency: true,
      placeholder: "",
      width: 80,
      minWidth: 110,
      maxWidth: 200,
    },
    {
      accessor: "SER_CHRG_AMT",
      columnName: "ServiceChargeAmount",
      sequence: 15,
      alignment: "right",
      componentType: "currency",
      isTotalWithCurrency: true,
      placeholder: "",
      width: 80,
      minWidth: 110,
      maxWidth: 200,
    },

    {
      accessor: "ENTERED_BY",
      columnName: "User",
      sequence: 16,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "BR_CONFIRMED",
      columnName: "BranchConfirmed",
      sequence: 17,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },

    {
      accessor: "VERIFIED_BY",
      columnName: "VerifiedBy",
      sequence: 18,
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
      sequence: 19,
      alignment: "left",
      componentType: "date",
      placeholder: "",
      width: 150,
      minWidth: 120,
      maxWidth: 200,
      dateFormat: "dd/MM/yyyy HH:mm:ss",
    },
    {
      accessor: "HO_CONFIRMED",
      columnName: "HoConfirmed",
      sequence: 20,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "HO_VERIFIED_BY",
      columnName: "HoVerifiedBy",
      sequence: 21,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "MSG_RELEASE",
      columnName: "MsgRelease",
      sequence: 22,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "DEF_TRAN_CD",
      columnName: "DefTranCd",
      sequence: 23,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
  ],
};
export const IfscCodeSearchGridMetadata: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Search",
    rowIdColumn: "index",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: true,
    hideFooter: false,
    pageSizes: [20, 30, 50],
    defaultPageSize: 20,
    containerHeight: {
      min: "67vh",
      max: "67vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    hideActionBar: true,
  },
  filters: [],
  columns: [
    {
      accessor: "SR_CD",
      columnName: "SrNo",
      sequence: 1,
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },

    {
      accessor: "IFSC_CODE",
      columnName: "BrIFSCCode",
      sequence: 2,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },

    {
      accessor: "bankBranchName",
      columnName: "BankNmBranchNm",
      sequence: 5,
      componentType: "default",
      width: 250,
      minWidth: 200,
      maxWidth: 350,
    },
    // {
    //   accessor: "BRANCH_NM",
    //   columnName: "Branch_Name",
    //   sequence: 5,
    //   componentType: "default",
    //   width: 200,
    //   minWidth: 200,
    //   maxWidth: 300,
    // },

    {
      accessor: "ADD1",
      columnName: "Add1",
      sequence: 6,
      componentType: "default",
      width: 400,
      minWidth: 400,
      maxWidth: 450,
    },
    {
      accessor: "CONTACT_DTL",
      columnName: "ContactDetail",
      sequence: 7,
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "CENTRE_NM",
      columnName: "CentreName",
      sequence: 8,
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 250,
    },
    {
      accessor: "DISTRICT_NM",
      columnName: "DistrictName",
      sequence: 9,
      componentType: "default",
      width: 150,
      minWidth: 160,
      maxWidth: 200,
    },
    {
      accessor: "STATE_NM",
      columnName: "StateName",
      sequence: 10,
      componentType: "default",
      width: 250,
      minWidth: 250,
      maxWidth: 300,
    },
  ],
};
