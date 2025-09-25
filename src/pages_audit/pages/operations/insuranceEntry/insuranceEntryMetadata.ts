import { GeneralAPI } from "registry/fns/functions/general";
import * as API from "./api";
import { addMonths, format, isValid, subDays } from "date-fns";
import {
  GridMetaDataType,
  lessThanDate,
  utilFunction,
} from "@acuteinfo/common-base";
import { t } from "i18next";

export const InsuranceEntryFormMetaData = {
  masterForm: {
    form: {
      name: "InsuranceEntryMaster",
      label: "",
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
    },
    fields: [
      // {
      //   render: {
      //     componentType: "divider",
      //   },
      //   // dividerText: "IFSC Bank Detail",
      //   name: "AccountDetail",
      //   label: "Account Detail",
      //   GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      // },
      {
        render: {
          componentType: "_accountNumber",
        },
        branchCodeMetadata: {
          GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
          render: {
            componentType: "textField",
          },
          isReadOnly: true,
        },

        accountTypeMetadata: {
          GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
          isFieldFocused: true,
          defaultfocus: true,
          defaultValue: "",
          validationRun: "onChange",
          required: true,
          runPostValidationHookAlways: true,
          options: (dependentValue, formState, _, authState) => {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: "RPT/70",
            });
          },
          dependentFields: ["BRANCH_CD"],
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
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              ACCT_CD: { value: "", ignoreUpdate: true },
              ACCT_NM: { value: "" },
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
                SCREEN_REF: formState?.docCD,
                GD_TODAY_DT: auth?.workingDate,
              };
              formState?.handleDisableButton(true);
              let postData = await GeneralAPI.getAccNoValidation(Apireq);

              let btn99, returnVal;
              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };
              for (let i = 0; i < postData?.MSG?.length; i++) {
                if (postData?.MSG?.[i]?.O_STATUS === "999") {
                  formState.setDataOnFieldChange("IS_VISIBLE", {
                    IS_VISIBLE: false,
                  });
                  formState?.handleDisableButton(false);
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                  formState.setDataOnFieldChange("IS_VISIBLE", {
                    IS_VISIBLE: false,
                  });
                  formState?.handleDisableButton(false);
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                      message: postData?.MSG?.[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = postData;
                } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                  formState.setDataOnFieldChange("IS_VISIBLE", {
                    IS_VISIBLE: true,
                  });
                  formState?.handleDisableButton(false);
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });

                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
                  }
                } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                  formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", Apireq);
                  formState.setDataOnFieldChange("IS_VISIBLE", {
                    IS_VISIBLE: true,
                  });
                  formState?.handleDisableButton(false);
                  if (btn99 !== "No") {
                    returnVal = postData;
                  } else {
                    returnVal = "";
                  }
                }
              }
              formState?.handleDisableButton(false);
              btn99 = 0;
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
                ACCT_NM: {
                  value: returnVal?.ACCT_NM ?? "",
                },
              };
            } else if (!field.value) {
              formState.setDataOnFieldChange("IS_VISIBLE", {
                IS_VISIBLE: false,
              });
              formState?.handleDisableButton(false);
              return {
                ACCT_NM: { value: "" },
              };
            }
          },
          runPostValidationHookAlways: true,
          GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ACCT_NM",
        label: "Account_Name",
        type: "text",
        isReadOnly: true,
        fullWidth: true,
        GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COVER_NOTE",
        label: "CoverNote",
        type: "text",
        fullWidth: true,
        txtTransform: "uppercase",
        placeholder: "PleaseEnterCoverNote",
        // required: true,
        maxLength: 50,
        // schemaValidation: {
        //   type: "string",
        //   rules: [{ name: "required", params: ["PleaseEnterCoverNote"] }],
        // },
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
        GridProps: { xs: 12, sm: 3.1, md: 3.1, lg: 3.1, xl: 3.1 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "INSURANCE_DATE",
        fullWidth: true,
        label: "InsuranceDate",
        required: true,
        isWorkingDate: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["InsuranceRequired"] }],
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (!isNaN(currentField.value)) {
            let newDate = subDays(addMonths(currentField?.value, 12), 1);
            return {
              DUE_DATE: {
                value: newDate,
              },
            };
          }
        },
        validate: (value) => {
          if (Boolean(value?.value) && !isValid(value?.value)) {
            return "Mustbeavaliddate";
          }
          return "";
        },
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "DUE_DATE",
        fullWidth: true,
        label: "DueDate",
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["DueDateRequire"] }],
        },
        // dependentFields: ["INSURANCE_DATE"],
        // setValueOnDependentFieldsChange: (dependent) => {
        //   let date = dependent["INSURANCE_DATE"]?.value;
        //   if (!isNaN(date)) {
        //     let newDate = subDays(addMonths(date, 12), 1);
        //     // This will be your final date
        //     return newDate;
        //   } else {
        //     return null;
        //   }
        // },
        validate: (currentField, dependentField) => {
          if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
            return "Mustbeavaliddate";
          }
          if (
            new Date(currentField?.value) <=
            new Date(dependentField?.INSURANCE_DATE?.value)
          ) {
            return `DueDateShouldGreaterDateInsurance`;
          }
          return "";
        },
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        fullWidth: true,
        name: "TRAN_DT",
        isReadOnly: true,
        isWorkingDate: true,
        label: "EntryDate",
        validate: (value) => {
          if (Boolean(value?.value) && !isValid(value?.value)) {
            return "Mustbeavaliddate";
          }
          return "";
        },
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },

      {
        render: {
          componentType: "autocomplete",
        },
        name: "INSURANCE_COMP_CD",
        label: "Company",
        fullWidth: true,
        required: true,
        placeholder: "PleaseSelectCompny",
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterInsuranceCompany"] },
          ],
        },
        options: async (dependentValue, formState, _, authState) => {
          return API.getInsuranceCompanyData({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });
        },
        _optionsKey: "getInsuranceCompanyData",
        GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "INSURANCE_TYPE_CD",
        label: "InsuranceType",
        fullWidth: true,
        placeholder: "PleaseSelectInsuranceType",
        options: async (dependentValue, formState, _, authState) => {
          return API.getInsuranceTypeData({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });
        },
        _optionsKey: "getInsuranceTypeData",
        GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "POLICY_NO",
        label: "PolicyNo",
        fullWidth: true,
        // required: true,
        maxLength: 25,
        placeholder: "PleaseEnterPolicyNo",
        // schemaValidation: {
        //   type: "string",
        //   rules: [{ name: "required", params: ["PleaseEnterPolicyNo"] }],
        // },
        GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2.1 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "DESCRIPTION",
        label: "Description",
        fullWidth: true,
        txtTransform: "uppercase",
        placeholder: "PleaseEnterDescription",
        maxLength: 100,
        GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
      },

      {
        render: {
          componentType: "amountField",
        },
        name: "INSURANCE_AMOUNT",
        label: "InsuranceAmount",
        fullWidth: true,
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["PleaseEnterInsuranceAmount"] }],
        },
        FormatProps: {
          allowLeadingZeros: false,
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 17) {
              return false;
            }
            if (values?.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        dependentFields: ["NET_PREMIUM_AMOUNT"],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field.value) {
            if (
              Number(field.value) <
              Number(dependentFieldsValues?.NET_PREMIUM_AMOUNT?.value)
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Alert",
                message: `InsuranceAmountCannotLessPremiumAmount`,
                buttonNames: ["Ok"],
                icon: "WARNING",
              });
              if (buttonName === "Ok") {
                return {
                  INSURANCE_AMOUNT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                  NET_PREMIUM_AMOUNT: {
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                };
              }
            }
          }
        },
        GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2.1 },
      },

      {
        render: {
          componentType: "amountField",
        },
        name: "NET_PREMIUM_AMOUNT",
        fullWidth: true,
        label: "NetPremium",
        required: true,
        FormatProps: {
          allowLeadingZeros: false,
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 17) {
              return false;
            }
            if (values?.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterNetPremiumAmount"] },
          ],
        },
        GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2.1 },
        dependentFields: [
          "INSURANCE_AMOUNT",
          "ACCT_CD",
          "ACCT_TYPE",
          "BRANCH_CD",
        ],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field.value) {
            if (field.value && dependentFieldsValues?.INSURANCE_AMOUNT?.value) {
              if (
                Number(field.value) >
                Number(dependentFieldsValues?.INSURANCE_AMOUNT?.value)
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "Alert",
                  message: `NetPremiumAmountCanGreaterThanInsuranceAmount`,
                  buttonNames: ["Ok"],
                  icon: "WARNING",
                });
                if (buttonName === "Ok") {
                  return {
                    NET_PREMIUM_AMOUNT: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    SERVICE_CHARGE: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (
                field.value &&
                dependentFieldsValues?.["ACCT_CD"]?.value &&
                dependentFieldsValues?.["ACCT_TYPE"]?.value &&
                dependentFieldsValues?.["BRANCH_CD"]?.value &&
                dependentFieldsValues?.["INSURANCE_AMOUNT"]?.value
              ) {
                let postData = await GeneralAPI.getCalGstAmountData({
                  BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
                  ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
                  ACCT_CD: utilFunction.getPadAccountNumber(
                    dependentFieldsValues?.["ACCT_CD"]?.value,
                    dependentFieldsValues?.["ACCT_TYPE"]?.optionData
                  ),
                  AMOUNT: field.value,
                  MODULE: "INSU",
                  COMP_CD: auth?.companyID,
                  ENT_BRANCH_CD: auth?.user?.branchCode,
                  ASON_DT: auth?.workingDate,
                });
                return {
                  SERVICE_CHARGE: { value: postData?.[0]?.TAX_AMOUNT ?? "" },
                };
              } else if (!field?.value) {
                return {
                  SERVICE_CHARGE: { value: "" },
                };
              }
            }
          } else {
            return {
              SERVICE_CHARGE: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
      },

      {
        render: {
          componentType: "amountField",
        },
        name: "SERVICE_CHARGE",
        fullWidth: true,
        label: "GST",
        GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2.1 },
        dependentFields: ["NET_PREMIUM_AMOUNT"],
        FormatProps: {
          allowLeadingZeros: false,
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 17) {
              return false;
            }
            if (values?.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field.value && dependentFieldsValues?.NET_PREMIUM_AMOUNT?.value) {
            if (
              Number(field.value) >
              Number(dependentFieldsValues?.NET_PREMIUM_AMOUNT?.value)
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "Alert",
                message: `GSTShouldLessThanNetPremiumAmount`,
                buttonNames: ["Ok"],
                icon: "WARNING",
              });
              if (buttonName === "Ok") {
                return {
                  SERVICE_CHARGE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: true,
                  },
                  // TOTAL_PRE: {
                  //   value: "",
                  //   isFieldFocused: false,
                  //   ignoreUpdate: true,
                  // },
                };
              }
            }
          }
        },
        runPostValidationHookAlways: true,
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "PREMIUM_AMOUNT",
        fullWidth: true,
        isReadOnly: true,
        label: "TotalPremium",
        GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2.1 },
        dependentFields: ["NET_PREMIUM_AMOUNT", "SERVICE_CHARGE"],
        setValueOnDependentFieldsChange: (dependentFields) => {
          let value =
            parseFloat(dependentFields?.NET_PREMIUM_AMOUNT?.value || 0) +
            parseFloat(dependentFields?.SERVICE_CHARGE?.value || 0);
          return `${value}`;
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "REMARKS",
        label: "Remarks",
        fullWidth: true,
        txtTransform: "uppercase",
        maxLength: 100,
        placeholder: "EnterRemarks",
        GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "PROPOSER1",
        label: "Proposer1",
        maxLength: 100,
        fullWidth: true,
        placeholder: "PleaseEnterProposer1",
        GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "PROPOSER2",
        maxLength: 100,
        fullWidth: true,
        label: "Proposer2",
        placeholder: "PleaseEnterProposer2",
        GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Document Detail",
      rowIdColumn: "id",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: true,
      hideHeader: true,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "22vh", max: "22vh" },
      allowRowSelection: false,
      hiddenFlag: "_hidden",
      disableLoader: false,
      // paginationText: "Configured Messages",
    },
    columns: [
      {
        accessor: "id",
        columnName: "SrNo",
        componentType: "default",
        sequence: 1,
        alignment: "center",
        width: 75,
        minWidth: 50,
        maxWidth: 100,
        isAutoSequence: true,
      },
      {
        accessor: "SECURITY_TYPE",
        columnName: "SecurityType",
        componentType: "editableAutocomplete",
        placeholder: "PleaseEnterSecurityType",
        sequence: 2,
        alignment: "left",
        width: 250,
        minWidth: 300,
        maxWidth: 400,

        options: async (_, authState) => {
          return API.getSecurityTypeData({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });
        },
        _optionsKey: "getSecurityTypeData",

        // isReadOnly: true,
        // __EDIT__: { isReadOnly: false, componentType: "editableTextField" },
      },
      {
        accessor: "SECURITY_CD",
        columnName: "Security",
        componentType: "editableAutocomplete",
        placeholder: "PleaseEnterSecurity",
        sequence: 3,
        alignment: "left",
        width: 350,
        minWidth: 300,
        maxWidth: 400,
        options: async (_, authState) => {
          return API.getSecurityData({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });
        },
        _optionsKey: "getSecurityData",
        validation: (value, data, prev) => {
          if (Array.isArray(prev)) {
            let lb_error = false;
            let ls_msg = "";
            prev.forEach((item, index) => {
              if (value.trim() === item?.SECURITY_CD.trim()) {
                lb_error = true;
                ls_msg = t("SecurityAlreadyEnteredLine") + (index + 1);
                return ls_msg;
              }
            });
            if (lb_error) {
              return ls_msg;
            }
          }
          return "";
        },
      },
      {
        accessor: "AMOUNT",
        columnName: "Amount",
        componentType: "editableNumberFormat",
        alignment: "center",
        isReadOnly: true,
        sequence: 4,
        width: 250,
        minWidth: 200,
        maxWidth: 400,
        placeholder: "0.00",
        className: "textInputFromRight",
        FormatProps: {
          thousandSeparator: true,
          thousandsGroupStyle: "lakh",
          allowNegative: false,
          allowLeadingZeros: false,
          decimalScale: 2,
          fixedDecimalScale: true,
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
        isTotalWithCurrency: true,
        footerLabel: "Total Amount :",
      },
      {
        columnName: "Action",
        componentType: "deleteRowCell",
        accessor: "_hidden",
        sequence: 5,
        width: 120,
        minWidth: 100,
        maxWidth: 130,
        shouldExclude: (initialValue, original, prevRows, nextRows) => {
          let allRows: any[] = [];
          if (Array.isArray(prevRows) && prevRows.length > 0) {
            allRows = prevRows.filter(
              (row) =>
                !Boolean(Object.hasOwn(row, "_hidden") && Boolean(row?._hidden))
            );
          }
          if (allRows?.length > 1) {
            return false;
          }
          return true;
        },
      },
      {
        columnName: "Add Row",
        componentType: "buttonRowCell",
        accessor: "ADDROW",
        buttonLabel: "Add Row",
        sequence: 6,
        width: 120,
        minWidth: 100,
        maxWidth: 130,
        isVisibleInNew: true,
      },
    ],
  },
};

export const ViewInsuranceMetaData = {
  form: {
    name: "Insurance-View",
    label: "InsuranceView",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
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
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "BranchCode",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      type: "text",

      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNo",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "OP_DATE",
      label: "OpeningDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      type: "text",
      fullWidth: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "LF_NO",
      label: "LedgerNo",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "CONF_BAL",
      label: "CurrentBalance",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },

      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },

      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "MODE_NM",
      label: "Mode",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CATEG_NM",
      label: "Category",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },

    {
      render: {
        componentType: "divider",
      },
      dividerText: "Address",
      name: "Address",
      label: "Address",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "Address1",
      type: "text",
      fullWidth: true,
      required: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD2",
      label: "Address2",
      type: "text",
      fullWidth: true,
      required: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AREA_NM",
      label: "Area",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PIN_CODE",
      label: "PinCode",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CITY_NM",
      label: "City",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DIST_NM",
      label: "District",
      type: "text",
      fullWidth: true,
      required: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE_NM",
      label: "State",
      type: "text",
      fullWidth: true,
      required: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COUNTRY_NM",
      label: "Country",
      type: "text",
      fullWidth: true,
      required: true,
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT1",
      label: "Phone",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT2",
      label: "MobileNo",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
  ],
};
export const DetailInsuranceGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Insurance Detail",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    // hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    hideFooter: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "63vh",
      max: "63vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    hiddenFlag: "_hidden",
  },
  filters: [],
  columns: [
    {
      accessor: "ID",
      columnName: "SrNo",
      sequence: 1,
      alignment: "center",
      componentType: "default",
      width: 75,
      minWidth: 70,
      maxWidth: 100,
      isAutoSequence: true,
    },
    {
      accessor: "POLICY_NO",
      columnName: "PolicyNo",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 220,
      minWidth: 150,
      maxWidth: 290,
    },
    {
      accessor: "INSURANCE_DATE",
      columnName: "InsuranceDate",
      sequence: 3,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 150,
      minWidth: 100,
      maxWidth: 170,
    },
    {
      accessor: "DUE_DATE",
      columnName: "DueDate",
      sequence: 4,
      alignment: "center",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      width: 162,
      minWidth: 90,
      maxWidth: 170,
    },

    {
      accessor: "INSURANCE_AMOUNT",
      columnName: "InsuranceAmount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
      isTotalWithCurrency: true,
    },

    {
      accessor: "TOT_PREMIUM_AMT",
      columnName: "TotalPremium",
      sequence: 6,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      width: 150,
      minWidth: 150,
      maxWidth: 180,
      isTotalWithCurrency: true,
    },
    {
      accessor: "INSURANCE_TYPE",
      columnName: "InsuranceType",
      sequence: 7,
      alignment: "center",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },

    {
      accessor: "DESCRIPTION",
      columnName: "Company",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 220,
      minWidth: 150,
      maxWidth: 290,
    },
    {
      accessor: "SEC",
      columnName: "TypeOfSec",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 220,
      minWidth: 150,
      maxWidth: 290,
    },
    {
      accessor: "CONFIRMED",
      columnName: "Confirmed",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 150,
      maxWidth: 190,
    },
    {
      accessor: "CM_RENEW",
      columnName: "Status",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 150,
      maxWidth: 190,
    },
    {
      accessor: "INS_DESCRIPTION",
      columnName: "Description",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 150,
      maxWidth: 190,
    },
  ],
};

export const insuranceAccountRetrievemetaData = {
  form: {
    name: "accountNumber",
    label: "EnterParameters",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
      _accountNumber: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        GridProps: { xs: 12, sm: 12, md: 2.2, lg: 2.2, xl: 2.2 },
        runPostValidationHookAlways: true,
        render: {
          componentType: "textField",
        },
        isReadOnly: true,
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        GridProps: { xs: 12, sm: 12, md: 3, lg: 3, xl: 3 },
        isFieldFocused: true,
        dependentFields: ["BRANCH_CD"],
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
        },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
        runPostValidationHookAlways: true,
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
              SCREEN_REF: formState?.docCD,
              GD_TODAY_DT: auth?.workingDate,
            };
            let postData = await GeneralAPI.getAccNoValidation(Apireq);

            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.MSG?.length; i++) {
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                formState.setDataOnFieldChange("TAB_VISIBLE", {
                  TAB_VISIBLE: false,
                });
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                formState.setDataOnFieldChange("TAB_VISIBLE", {
                  TAB_VISIBLE: false,
                });
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData;
              } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                formState.setDataOnFieldChange("TAB_VISIBLE", {
                  TAB_VISIBLE: true,
                });
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", Apireq);
                formState.setDataOnFieldChange("TAB_VISIBLE", {
                  TAB_VISIBLE: true,
                });
                if (btn99 !== "No") {
                  returnVal = postData;
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;
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
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
              },
              WIDTH_BAL: {
                value: returnVal?.WIDTH_BAL ?? "",
              },
            };
          } else {
            // formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
            return {
              // ACCT_CD: {
              //   value: "",
              //   ignoreUpdate: true,
              // },
              ACCT_NM: { value: "" },
            };
          }
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 12, md: 3.3, lg: 3.3, xl: 3.3 },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "WIDTH_BAL",
      label: "WithdrawBalance",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ],
};
