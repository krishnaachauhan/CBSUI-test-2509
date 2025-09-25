import { validateHOBranch } from "components/utilFunction/function";
import { CustomTableMetadataType } from "../cashierExchangeEntry/tableComponent/type";
import * as API from "./api";
import { utilFunction } from "@acuteinfo/common-base";

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data ?? []) {
    if (obj?.O_STATUS === "999") {
      formState?.handleButtonDisable(false);
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      formState?.handleButtonDisable(false);
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      continue;
    } else if (obj?.O_STATUS === "99") {
      formState?.handleButtonDisable(false);
      const buttonName = await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "Confirmation",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });
      if (buttonName === "No") {
        break;
      }
    } else if (obj?.O_STATUS === "0") {
      formState?.handleButtonDisable(false);
      return data;
    }
  }
};
export const CustomerFormMetadata = {
  form: {
    name: "CustomerFormMetadata",
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
        componentType: "textField",
      },
      name: "REMARKS",
      defaultValue: "CustomerDenominationExchange",
      label: "Remarks",
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
  ],
};
export const CurrencyFormMetadata = {
  form: {
    name: "CurrencyFormMetadata",
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
      name: "ACCOUNT_DOC_TYPE",
      label: "Type",
      options: () => API.getCurrExchangeTypeDDW(),
      _optionsKey: "CurrExchangeTypeDDE",
      placeholder: "enterType",
      defaultValueKey: "entryTypeDefaultVal",
      type: "text",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        dependentFields: ["ACCOUNT_DOC_TYPE"],
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
            ACCT_NM: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACCOUNT_DOC_TYPE?.value === "A") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        dependentFields: ["BRANCH_CD", "ACCOUNT_DOC_TYPE"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "Enter Account Branch.",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else {
            formState.setDataOnFieldChange("SHORTCUTKEY_REQPARA", {
              ACCT_TYPE: currentField?.value,
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
            });
          }
          return {
            ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACCOUNT_DOC_TYPE?.value === "A") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "ACCOUNT_DOC_TYPE"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            !Boolean(currentField?.displayValue) &&
            !Boolean(currentField?.value)
          ) {
            return {
              ACCT_NM: { value: "" },
            };
          } else if (!Boolean(currentField?.displayValue)) {
            return {};
          }
          if (
            currentField.value &&
            dependentFieldsValues?.ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.BRANCH_CD?.value &&
            dependentFieldsValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              A_BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
              A_COMP_CD: authState?.companyID ?? "",
              A_ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value,
              A_ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.userID ?? "",
              USERROLE: authState?.role ?? "",
              A_SCREEN_REF: formState?.docCD ?? "",
            };
            formState?.handleButtonDisable(true);
            const postData = await API.getCurrExchngAcct(reqParameters);
            const returnValue = await handleDisplayMessages(
              postData,
              formState
            );
            return {
              ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.ACCT_CD?.optionData?.[0] ?? ""
                    ),
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              ACCT_NM: {
                value: returnValue?.[0]?.ACCT_NM ?? "",
              },
              REF_DOC_NO: { value: returnValue?.[0]?.REF_DOC_NO ?? "" },
              REF_DOC_TYPE: { value: returnValue?.[0]?.REF_DOC_TYPE ?? "" },
            };
          } else if (!currentField?.value) {
            formState?.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
              REF_DOC_NO: { value: "" },
              REF_DOC_TYPE: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.ACCOUNT_DOC_TYPE?.value === "A") {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      required: true,
      dependentFields: ["ACCOUNT_DOC_TYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.ACCOUNT_DOC_TYPE?.value === "A") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "REF_DOC_TYPE",
      label: "DocumentType",
      options: () => API.getPMISCData("CASH_EX_DOC_TYP"),
      _optionsKey: "CASHPMISC_DATA",
      placeholder: "SelectDocumentType",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DocumentTypeIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 2.4, md: 2.4, lg: 2.4, xl: 2.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REF_DOC_NO",
      label: "DocumentNo",
      dependentFields: ["REF_DOC_TYPE"],
      txtTransform: "uppercase",
      validate: (columnValue, allField, flag) => {
        if (columnValue.value && allField?.REF_DOC_TYPE?.value === "AADHAR") {
          return API.validateUniqueId(columnValue, allField, flag);
        } else if (
          columnValue?.value &&
          allField?.REF_DOC_TYPE?.value === "PAN"
        ) {
          return API.validatePAN(columnValue);
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
        componentType: "textField",
      },
      name: "TENDERER",
      label: "Tenderer",
      txtTransform: "uppercase",
      required: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      defaultValue: "Customer Denomination Exchange",
      label: "Remarks",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },
  ],
};

export const CustomerEntryTableMetdata: CustomTableMetadataType = {
  key: "CustomerEntryMetaDataArrayField",
  Mainlabel: "Customer Exchange Entry",
  fields: [
    {
      name: "DENO_LABLE",
      label: "Denomination",
      componentType: "textField",
      isTotalWord: true,
      isExcess: true,
      align: "left",
      isReadOnly: true,
      isCalculation: true,
    },
    {
      name: "DENO_QTY",
      label: "Exchange Quantity",
      componentType: "numberFormat",
      align: "right",
      isReadOnly: false,
      maxLength: 10,
      dependentValue: ["DENO_VAL", "AVAIL_QTY"],
      onChange: async (
        currentFieldValue,
        rowData,
        dependentValues,
        setDependentValue,
        tableState,
        updateCurrentField
      ) => {
        const CurrentValue = parseFloat(currentFieldValue || 0);
        const DependentValue = parseFloat(dependentValues?.[0] || 0);
        const calculatedAmount = DependentValue * CurrentValue;
        if (!isNaN(calculatedAmount) && calculatedAmount) {
          setDependentValue("DENO_AMOUNT", calculatedAmount.toFixed(2));
        } else {
          setDependentValue("DENO_AMOUNT", "0.00");
        }
      },
      validation: async (
        currentFieldValue,
        rowData,
        dependentValues,
        setDependentValue,
        tableState,
        updateCurrentField,
        total,
        remaning,
        TableDatas
      ) => {
        const AvailableQty = dependentValues?.[1];
        const CurrentValue = parseFloat(currentFieldValue || 0);
        // const DependentValue = parseFloat(dependentValues?.[0] || 0);
        const MessageShow = tableState?.MessageBox;
        const FormRefData = await tableState?.FormRef?.current?.getFieldData();
        if (CurrentValue < 0 && AvailableQty === "0") {
          const CheckValidation = await MessageShow({
            messageTitle: "ValidationFailed",
            message: "DenominationshouldlessthanequalsBalanceAmount",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (CheckValidation === "Ok") {
            updateCurrentField?.("");
            setDependentValue("DENO_AMOUNT", "0.00");
          }
        } else if (currentFieldValue < 0) {
          if (Math.abs(currentFieldValue) > dependentValues?.[1]) {
            const Btn = await MessageShow({
              messageTitle: "ValidationFailed",
              message: `Denomination ${dependentValues?.[0]} should be less than or equal to Balance Amount.`,
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Btn === "Ok") {
              updateCurrentField?.("");
              setDependentValue("DENO_AMOUNT", "0.00");
            }
          }
        }
        if (
          Boolean(CurrentValue) &&
          total?.DENO_AMOUNT === 0 &&
          remaning?.DENO_AMOUNT === 0
        ) {
          const recordsWithDenoQty = TableDatas.filter(
            (record) =>
              record?.DENO_QTY &&
              record?.DENO_QTY !== "undefined" &&
              record?.DENO_QTY !== "" &&
              record?.DENO_QTY !== "0"
          );
          const TableDataMap = recordsWithDenoQty?.map((row) => ({
            DENO_TRAN_CD: row?.TRAN_CD ?? "",
            DENO_QTY: row?.DENO_QTY ?? "",
            DENO_VAL: row?.DENO_VAL ?? "",
          }));
          const Request = {
            ENTERED_COMP_CD: tableState?.authState?.companyID ?? "",
            ENTERED_BRANCH_CD: tableState?.authState?.user?.branchCode ?? "",
            REMARKS: FormRefData?.REMARKS ?? "",
            DENO_DTL: [...TableDataMap],
            SCREEN_REF: tableState?.docCD ?? "",
          };
          const Check = await tableState?.MessageBox({
            message: "SaveData",
            messageTitle: "Confirmation",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
          });
          if (Check === "Yes") {
            tableState?.insertCashierEntry.mutate(Request);
          }
        }
      },
    },
    {
      name: "DENO_AMOUNT",
      label: "Exchange Amount",
      componentType: "amountField",
      dependentValue: ["DENO_QTY"],
      align: "right",
      isCurrency: true,
      isExcess: true,
      isCalculation: true,
      isReadOnly: true,
    },
    {
      name: "AVAIL_QTY",
      label: "Available Quantity",
      componentType: "numberFormat",
      align: "right",
      isReadOnly: true,
    },
    {
      name: "AVAIL_VAL",
      label: "Available Amount",
      isCurrency: true,
      isCalculation: true,
      componentType: "amountField",
      align: "right",
      isReadOnly: true,
    },
  ],
};
export const CurrencyTableMetadata: CustomTableMetadataType = {
  key: "CashierEntryMetaDataArrayField",
  Mainlabel: "Cashier Exchange Entry",
  fields: [
    {
      name: "DENO_LABLE",
      label: "Denomination",
      componentType: "textField",
      isTotalWord: true,
      isExcess: true,
      align: "left",
      isReadOnly: true,
      isCalculation: true,
    },
    {
      name: "DENO_QTY",
      label: "Exchange Quantity",
      componentType: "numberFormat",
      align: "right",
      isReadOnly: false,
      maxLength: 10,
      dependentValue: ["DENO_VAL", "AVAIL_QTY"],
      onChange: async (
        currentFieldValue,
        rowData,
        dependentValues,
        setDependentValue,
        tableState,
        updateCurrentField
      ) => {
        const CurrentValue = parseFloat(currentFieldValue || 0);
        const DependentValue = parseFloat(dependentValues?.[0] || 0);
        const calculatedAmount = DependentValue * CurrentValue;
        if (!isNaN(calculatedAmount) && calculatedAmount) {
          setDependentValue("DENO_AMOUNT", calculatedAmount.toFixed(2));
        } else {
          setDependentValue("DENO_AMOUNT", "0.00");
        }
      },
      validation: async (
        currentFieldValue,
        rowData,
        dependentValues,
        setDependentValue,
        tableState,
        updateCurrentField,
        total,
        remaning,
        TableDatas
      ) => {
        const AvailableQty = dependentValues?.[1];
        const CurrentValue = parseFloat(currentFieldValue || 0);
        // const DependentValue = parseFloat(dependentValues?.[0] || 0);
        const MessageShow = tableState?.MessageBox;
        const FormRefData = await tableState?.FormRef?.current?.getFieldData();
        if (CurrentValue < 0 && AvailableQty === "0") {
          const CheckValidation = await MessageShow({
            messageTitle: "ValidationFailed",
            message: "DenominationshouldlessthanequalsBalanceAmount",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (CheckValidation === "Ok") {
            updateCurrentField?.("");
            setDependentValue("DENO_AMOUNT", "0.00");
          }
        } else if (currentFieldValue < 0) {
          if (Math.abs(currentFieldValue) > dependentValues?.[1]) {
            const Btn = await MessageShow({
              messageTitle: "ValidationFailed",
              message: `Denomination ${dependentValues?.[0]} should be less than or equal to Balance Amount.`,
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Btn === "Ok") {
              updateCurrentField?.("");
              setDependentValue("DENO_AMOUNT", "0.00");
            }
          }
        } else if (CurrentValue) {
          const request = {
            COMP_CD: tableState?.authState?.companyID ?? "",
            BASE_BRANCH: tableState?.authState?.user?.baseBranchCode ?? "",
            TOTAL_AMOUNT: total?.DENO_AMOUNT ?? "",
            REMAIN_AMOUNT: remaning?.DENO_AMOUNT ?? "",
            DENO_VALUE: rowData?.DENO_VAL ?? "",
            DENO_QTY: rowData?.DENO_QTY ?? "",
            DENO_TRAN_CD: rowData?.TRAN_CD ?? "",
            REF_BRANCH_CD: FormRefData?.BRANCH_CD ?? "",
            REF_ACCT_TYPE: FormRefData?.ACCT_TYPE ?? "",
            REF_ACCT_CD: FormRefData?.ACCT_CD ?? "",
            REF_DOC_TYPE: FormRefData?.REF_DOC_TYPE ?? "",
            REF_DOC_NO: FormRefData?.REF_DOC_NO ?? "",
            ACCOUNT_DOC_TYPE: FormRefData?.ACCOUNT_DOC_TYPE ?? "",
          };
          const postData = await API.validateDenoAmount({ ...request });
          if (postData?.[0]?.MSG?.length > 0) {
            const msg = await MessageShow({
              messageTitle: "Deno Validation",
              message: postData?.[0]?.MSG,
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (msg === "Ok") {
              setDependentValue("DENO_AMOUNT", "0.00");
              setDependentValue("DENO_QTY", "");
            }
          }
        }
        if (
          Boolean(CurrentValue) &&
          total?.DENO_AMOUNT === 0 &&
          remaning?.DENO_AMOUNT === 0
        ) {
          const formRefValues = {
            REF_DOC_NO: FormRefData?.REF_DOC_NO ?? "",
            REF_DOC_TYPE: FormRefData?.REF_DOC_TYPE ?? "",
            TENDERER: FormRefData?.TENDERER ?? "",
            BRANCH_CD: FormRefData?.BRANCH_CD ?? "",
            ACCT_TYPE: FormRefData?.ACCT_TYPE ?? "",
            ACCT_CD: FormRefData?.ACCT_CD ?? "",
          };
          const recordsWithDenoQty = TableDatas.filter(
            (record) =>
              record?.DENO_QTY &&
              record?.DENO_QTY !== "undefined" &&
              record?.DENO_QTY !== "" &&
              record?.DENO_QTY !== "0"
          );
          const TableDataMap = recordsWithDenoQty?.map((row) => ({
            ...formRefValues,
            DENO_TRAN_CD: row?.TRAN_CD ?? "",
            DENO_QTY: row?.DENO_QTY ?? "",
            DENO_VAL: row?.DENO_VAL ?? "",
          }));
          const Request = {
            ENTERED_COMP_CD: tableState?.authState?.companyID ?? "",
            ENTERED_BRANCH_CD: tableState?.authState?.user?.branchCode ?? "",
            REMARKS: FormRefData?.REMARKS ?? "",
            DENO_DTL: [...TableDataMap],
            SCREEN_REF: tableState?.docCD ?? "",
          };
          const Check = await tableState?.MessageBox({
            message: "SaveData",
            messageTitle: "Confirmation",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
          });
          if (Check === "Yes") {
            tableState?.insertCashierEntry.mutate(Request);
          }
        }
      },
    },
    {
      name: "DENO_AMOUNT",
      label: "Exchange Amount",
      componentType: "amountField",
      dependentValue: ["DENO_QTY"],
      align: "right",
      isCurrency: true,
      isExcess: true,
      isCalculation: true,
      isReadOnly: true,
    },
    {
      name: "AVAIL_QTY",
      label: "Available Quantity",
      componentType: "numberFormat",
      align: "right",
      isReadOnly: true,
    },
    {
      name: "AVAIL_VAL",
      label: "Available Amount",
      isCurrency: true,
      isCalculation: true,
      componentType: "amountField",
      align: "right",
      isReadOnly: true,
    },
  ],
};
