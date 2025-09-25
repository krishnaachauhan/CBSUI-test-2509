import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { format, isValid } from "date-fns";
import {
  GridMetaDataType,
  formatCurrency,
  getCurrencySymbol,
} from "@acuteinfo/common-base";
import { t } from "i18next";

export const RecurringCalculatotMetaData = {
  form: {
    name: "recurringCalculator",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    // allowColumnHiding: true,
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
      select: {
        fullWidth: true,
      },
      textField: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      _accountNumber: {
        fullWidth: true,
      },
      arrayField: {
        fullWidth: true,
      },
      amountField: {
        fullWidth: true,
      },
      formbutton: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "autocomplete" },
      name: "ACCT_TYPE",
      label: "AccountType",
      placeholder: "AccountTypePlaceHolder",
      options: (dependentValue, formState, _, authState) =>
        GeneralAPI.get_Account_Type({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id,
          DOC_CD: formState?.docCd ?? "",
        }),
      _optionsKey: "getaccttype",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: [t("AccountTypeReqired")] }],
      },
      GridProps: { xs: 6, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "CATEG_CD",
      label: "Category",
      placeholder: "SelectCategoryPlaceHolder",
      options: (dependentValue, formState, _, authState) =>
        API.getCategoryType({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getcategory",
      GridProps: { xs: 6, sm: 3, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "START_DT",
      label: "StartDate",
      fullWidth: true,
      required: true,
      validate: (columnValue, dependentFields) => {
        if (Boolean(columnValue?.value) && !isValid(columnValue?.value)) {
          return "Mustbeavaliddate";
        } else {
          return "";
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["StartDateisrequired"] }],
      },
      GridProps: { xs: 6, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DATA_VAL",
      label: "IntType",
      placeholder: "IntType",
      defaultValueKey: "defaultValue",
      isReadOnly: true,
      options: (dependentValue, formState, _, authState) =>
        API.getIntType({
          ENT_COMP_CD: authState?.companyID,
          ENT_BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getIntType",
      GridProps: { xs: 6, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "INST_NO",
      label: "InstallmentType",
      placeholder: "SelectInstallmentTypePlaceHolder",
      options: (dependentValue, formState, _, authState) =>
        API.getInstallmentPeriodData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      _optionsKey: "getInstallPeriod",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["InstallmentTypeisrequired"] }],
      },
      dependentFields: ["START_DT", "DATA_VAL"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleButtonDisable(true);
        try {
          if (currentField?.value) {
            const reqParameters = {
              START_DATE: format(
                new Date(dependentFieldValues?.START_DT?.value),
                "dd/MMM/yyyy"
              ),
              INSTALLMENT_TYPE:
                currentField?.optionData?.[0]?.INSTALLMENT_TYPE ?? "",
              INSTALLMENT: currentField?.value,
            };

            const postData = await API.getDueDate(reqParameters);
            return {
              DUE_DATE: {
                value: postData[0].DUE_DATE ?? "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        } catch (error: any) {
          const btn = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (btn === "Ok") {
            return {
              INST_NO: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
              DUE_DATE: { value: "" },
            };
          }
        } finally {
          formState?.handleButtonDisable(false);
        }
        return {};
      },
      GridProps: { xs: 6, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INSTALLMENT_TYPE",
      label: "Int Type.",
      dependentFields: ["INST_NO"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields["INST_NO"]?.optionData?.[0]?.INSTALLMENT_TYPE;
      },
      GridProps: { xs: 6, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INST_AMT",
      label: "InstAmount",
      type: "text",
      fullWidth: true,
      GridProps: { xs: 6, sm: 3, md: 2, lg: 2, xl: 2 },
      dependentFields: ["ACCT_TYPE", "CATEG_CD", "START_DT", "INST_NO"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState.handleButtonDisable(true);
        try {
          if (Boolean(currentField?.value)) {
            const reqParameters = {
              ENT_COMP_CD: authState?.companyID,
              ENT_BRANCH_CD: authState?.user?.branchCode,
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value.trim(),
              START_DT: format(
                new Date(dependentFieldValues?.START_DT?.value),
                "dd/MMM/yyyy"
              ),
              CATAG_CD: dependentFieldValues?.CATEG_CD?.value.trim(),
              INSTALLMENT_TYPE: "M",
              INST_NO: dependentFieldValues?.INST_NO?.value,
              INST_AMT: currentField?.value,
            };

            const postData = await API.getIntRate(reqParameters);
            return {
              INT_RATE: {
                value: postData[0]?.INT_RATE,
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else {
            return {
              INT_RATE: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        } catch (error: any) {
          const btn = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (btn === "Ok") {
            return {
              INST_AMT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
              INT_RATE: { value: "", isFieldFocused: false },
            };
          }
        } finally {
          formState.handleButtonDisable(false);
        }
        return {};
      },
    },
    {
      render: {
        componentType: "rateOfIntWithoutValidation",
      },
      name: "INT_RATE",
      label: "IntRate",
      placeholder: "0.00",
      type: "text",
      fullWidth: true,
      className: "textInputFromRight",
      dependentFields: [
        "INST_NO",
        "DATA_VAL",
        "INST_AMT",
        "INT_RATE",
        "START_DT",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};
        formState.handleButtonDisable(true);
        try {
          const reqParameters = {
            ENT_COMP_CD: authState.companyID ?? "",
            ENT_BRANCH_CD: authState.user.branchCode ?? "",
            INT_TYPE: dependentFields?.DATA_VAL.value ?? "",
            INST_NO: dependentFields?.INST_NO.value ?? "",
            INST_TYPE:
              dependentFields?.INST_NO?.optionData?.[0]?.INSTALLMENT_TYPE ?? "",
            INST_AMT: dependentFields?.INST_AMT.value ?? "",
            INT_RATE: currentField?.value ?? "",
            START_DT: dependentFields?.START_DT.value
              ? format(new Date(dependentFields?.START_DT.value), "dd/MMM/yyyy")
              : "",
            SCREEN_REF: formState?.docCd ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          };

          const postData = await API.getRecurringCalculateData(reqParameters);

          return {
            DUE_AMT: {
              value: postData[0]?.DUE_AMT ?? "0",
              isFieldFocused: true,
              ignoreUpdate: false,
            },
          };
        } catch (error: any) {
          const btn = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (btn === "Ok") {
            return {
              INT_RATE: {
                value: "",
                ignoreUpdate: true,
                isFieldFocused: true,
              },
              DUE_AMT: { value: "" },
            };
          }
        } finally {
          formState.handleButtonDisable(false);
        }
        return {};
      },
      GridProps: { xs: 4, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DUE_DATE",
      label: "DueDate",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 4, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "DUE_AMT",
      label: "DueAmount",
      placeholder: "DueAmount",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 4, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENT_COMP_CD",
      label: "",
      type: "text",
      GridProps: { xs: 6, sm: 3, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENT_BRANCH_CD",
      label: "",
      type: "text",
      GridProps: { xs: 6, sm: 3, md: 2, lg: 2, xl: 2 },
    },
  ],
};

export const RecurringGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "INST_DT",
    defaultColumnConfig: {
      width: 200,
      maxWidth: 450,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    disableGlobalFilter: true,
    enablePagination: false,
    defaultPageSize: 20,
    containerHeight: {
      min: "35vh",
      max: "35vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 2,
      isAutoSequence: true,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 50,
      maxWidth: 100,
    },
    {
      accessor: "INST_DT",
      columnName: "Period",
      sequence: 4,
      alignment: "center",
      componentType: "date",
      width: 100,
      minWidth: 80,
      maxWidth: 120,
    },
    {
      accessor: "INST_AMT",
      columnName: "InstallmentAmount",
      sequence: 4,
      alignment: "right",
      componentType: "currency",
      width: 150,
      minWidth: 100,
      maxWidth: 180,
      isTotalWithCurrency: true,
      totalDecimalCount: 2,
    },
    {
      accessor: "BALANCE_AMT",
      columnName: "Balance",
      sequence: 4,
      alignment: "right",
      componentType: "currency",
      width: 200,
      minWidth: 180,
      maxWidth: 220,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: "{0}",
      setFooterValue: (_, rows, CustomProperties) => {
        let Balance = formatCurrency(
          parseFloat(rows?.[0]?.original?.DUE_AMT ?? "0").toFixed(2),
          getCurrencySymbol(CustomProperties?.dynamicAmountSymbol),
          CustomProperties?.currencyFormat,
          CustomProperties?.decimalCount
        );
        return [`${Balance}` || ""];
      },
    },
    {
      accessor: "MONTH_INT",
      columnName: "InterestAmount",
      sequence: 4,
      alignment: "right",
      componentType: "currency",
      width: 200,
      minWidth: 100,
      maxWidth: 300,
      isTotalWithCurrency: true,
      totalDecimalCount: 2,
    },
    {
      accessor: "CUM_INT",
      columnName: "RunningIntAmt",
      sequence: 4,
      alignment: "right",
      componentType: "currency",
      width: 150,
      minWidth: 100,
      maxWidth: 180,
    },
  ],
};
