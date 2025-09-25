import { GeneralAPI } from "registry/fns/functions";
import {
  getBankCodeData,
  getRegionDDData2,
  getCustDocData,
  getInfavourOfData,
  getRegionDDData,
  getRetrievalType,
  getSignatureDdnData,
  getregioncommtype,
  validatePayslipNo,
  getCalculateGstComm,
  geTrxDdw,
} from "./api";
import { MasterDetailsMetaData, utilFunction } from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { t } from "i18next";
import { isValid } from "date-fns";
import { Icon } from "@mui/material";
import { isEmpty } from "lodash";

export const RetrieveGridMetaData = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "INDEX",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 30, 50],
    defaultPageSize: 50,
    containerHeight: {
      min: "80vh",
      max: "67vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    footerNote: "PressCtrlRtoRetrieveTheData",
  },
  filters: [],
  columns: [
    {
      accessor: "SR_NO",
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
      accessor: "REALIZE_FLAG_DISP",
      columnName: "status",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "TRAN_DT",
      columnName: "date",
      sequence: 3,
      alignment: "left",
      componentType: "date",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "AMOUNT",
      columnName: "amount",
      sequence: 4,
      alignment: "right",
      isTotalWithCurrency: true,
      componentType: "currency",
      width: 150,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "PENDING_FLAG",
      columnName: "ConfirmStatus",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
      color: (val, data) => {
        let PENDING_FLAG = data?.original?.CONFIRMED ?? "";
        return PENDING_FLAG === "Y" ? "green" : "red";
      },
    },
    {
      accessor: "CHEQUE_NO",
      columnName: "chequeNo",
      sequence: 6,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 50,
      maxWidth: 250,
    },

    {
      accessor: "INFAVOUR_OF",
      columnName: "inFavourOf",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "PAYSLIP_NO",
      columnName: "ddNo",
      sequence: 8,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "Type",
      sequence: 9,
      alignment: "right",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "ACCT_CD",
      columnName: "AcctNum",
      sequence: 10,
      alignment: "right",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "COMM_TYPE_DESC",
      columnName: "commissionType",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 100,
      maxWidth: 500,
    },
    {
      accessor: "ENTERED_BY",
      columnName: "enteredBy",
      sequence: 12,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
    {
      accessor: "VERIFIED_BY",
      columnName: "verifiedBy",
      sequence: 13,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 80,
      maxWidth: 200,
    },
  ],
};
export const RetrievalParameterFormMetaData = {
  form: {
    name: "retrievalParameters",
    label: "Retrieval Parameters",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "fromDate",
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "toDate",
      placeholder: "",
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",

      dependentFields: ["FROM_DT"],
      validate: (currentField, dependentField) => {
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return "dateValidationMessage";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "DESCRIPTION",
      placeholder: "type",
      label: "type",
      _optionsKey: "getRetrievalType",
      options: (dependentValue, formState, _, authState) => {
        return getRetrievalType({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["billtypeRequired"] }],
      },
      defaultValueKey: "defaultType",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      fullWidth: true,
      autoComplete: "on",
      isFieldFocused: false,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
      label: "TRAN_CD",
      dependentField: ["DESCRIPTION"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value = dependentFields?.DESCRIPTION?.value;

        return value;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER4",
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER5",
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
      },
    },
  ],
};
export const PayslipdetailsFormMetaData = {
  form: {
    name: "payslip entry",

    label: "PaySlip Isuue Entry RPT/14",
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
      amountField: {
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
      label: "issueDate",
      isReadOnly: true,
      alignment: "center",
      dateFormat: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "HIDDENSLIP_CD",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SLIP_CD",
      label: "slipNo",
      placeholder: "slipNo",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      dependentFields: [
        "PAYSLIP_MST_DTL",
        "PAYSLIP_DRAFT_DTL",
        "TRAN_DT",
        "HIDDENSLIP_CD",
      ],
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PENDING_FLAG",
      label: "Status",
      color: "error",
      placeholder: "Mode",
      type: "text",
      isReadOnly: true,

      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "red !important",
        },
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER6",
      GridProps: { xs: 0, sm: 0, md: 0, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MST_TOTAL",
      label: "Total",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      decimalScale: 2,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: false,
        decimalScale: 2,
      },
      dependentFields: ["PAYSLIP_MST_DTL", "PAYSLIP_DRAFT_DTL"],
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
      GridProps: { xs: 12, sm: 6, md: 6, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalValue = 0;

        dependentFields.PAYSLIP_MST_DTL.forEach((row) => {
          // Parse values as numbers, if not valid, assign 0
          const amount = parseFloat(row?.AMOUNT?.value) || 0;
          const commission = parseFloat(row?.COMMISSION?.value) || 0;
          const serviceCharge = parseFloat(row?.SERVICE_CHARGE?.value) || 0;

          // Check if C_C_T value is "R"
          const isCCtR = row?.C_C_T?.value === "R";

          // If is "R", subtract the amount; else, add the amount
          if (isCCtR) {
            totalValue -= amount;
          } else {
            totalValue += amount;
          }

          // Add commission and service charge to totalValue
          totalValue += commission + serviceCharge;
        });

        // If totalValue is negative, make it positive
        totalValue = Math.abs(totalValue);

        // Return totalValue as a string, preserving decimal places
        return totalValue.toFixed(2).toString(); // This ensures 2 decimal places are preserved
      },
    },
  ],
};
export const AccdetailsFormMetaData = {
  form: {
    name: "payslip entry",
    label: "Pay-Slip-Isuue Entry (RPT/14)",
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
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "PAYSLIP_MST_DTL",
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.PAYSLIP_MST_DTL)
          ? data?.PAYSLIP_MST_DTL
          : [];

        if (dataArray?.length > 0) {
          for (let i = 0; i < dataArray.length; i++) {
            const item = dataArray[i];
            if (!item.AMOUNT.trim()) {
              return {
                reason: "Please Enter Amount.",
              };
            }
            // if (!item.CHEQUE_NO) {
            //   return {
            //     reason: "Please Enter Cheque Number.",
            //   };
            // }
            if (!item.ACCT_CD.trim()) {
              return {
                reason: "Please Enter Account No.",
              };
            }
          }

          return true;
        } else {
          return true;
        }
      },

      __EDIT__: {
        fixedRows: true,
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: { componentType: "_accountNumber" },

          branchCodeMetadata: {
            name: "BRANCH_CD",
            GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
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
                ACCT_TYPE: { value: "" },
                ACCT_CD: { value: "", ignoreUpdate: false },
                ACCT_NM: { value: "" },
              };
            },
          },
          accountTypeMetadata: {
            validationRun: "onChange",
            name: "ACCT_TYPE",
            dependentFields: ["PAYSLIP_MST_DTL", "ACCT_TYPE", "BRANCH_CD"],
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              if (
                currentField?.value &&
                dependentFieldValues?.["PAYSLIP_MST_DTL.BRANCH_CD"]?.value
                  ?.length === 0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterBranchCode"),
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
              }
              return {
                ACCT_CD: { value: "", ignoreUpdate: false },
                ACCT_NM: { value: "" },
              };
            },
            GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          },
          accountCodeMetadata: {
            name: "ACCT_CD",
            autoComplete: "off",
            maxLength: 20,
            dependentFields: ["PAYSLIP_MST_DTL", "ACCT_TYPE", "BRANCH_CD"],
            runPostValidationHookAlways: true,

            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              if (
                currentField.value &&
                dependentFieldValues?.["PAYSLIP_MST_DTL.ACCT_TYPE"]?.value
                  ?.length === 0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterAccountType"),
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
                dependentFieldValues?.["PAYSLIP_MST_DTL.BRANCH_CD"]?.value &&
                dependentFieldValues?.["PAYSLIP_MST_DTL.ACCT_TYPE"]?.value
              ) {
                const reqParameters = {
                  BRANCH_CD:
                    dependentFieldValues?.["PAYSLIP_MST_DTL.BRANCH_CD"]?.value,
                  COMP_CD: authState?.companyID,
                  ACCT_TYPE:
                    dependentFieldValues?.["PAYSLIP_MST_DTL.ACCT_TYPE"]?.value,
                  ACCT_CD: utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                  ),
                  SCREEN_REF: "RPT/14",
                };
                let postData = await GeneralAPI.getAccNoValidation(
                  reqParameters
                );

                let btn99, returnVal;

                for (let i = 0; i < postData?.MSG.length; i++) {
                  if (postData?.MSG[i]?.O_STATUS === "999") {
                    const btnName = await formState.MessageBox({
                      messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                      message: postData?.MSG[i]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    returnVal = "";
                  } else if (postData?.MSG[i]?.O_STATUS === "99") {
                    const btnName = await formState.MessageBox({
                      messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                      message: postData?.MSG[i]?.O_MESSAGE,
                      icon: "CONFIRM",
                      buttonNames: ["Yes", "No"],
                    });
                    btn99 = btnName;
                    if (btnName === "No") {
                      returnVal = "";
                    }
                  } else if (postData?.MSG[i]?.O_STATUS === "9") {
                    const btnName = await formState.MessageBox({
                      messageTitle: postData?.MSG[i]?.O_MSG_TITLE,
                      message: postData?.MSG[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  } else if (postData?.MSG[i]?.O_STATUS === "0") {
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
                            currentField?.value,
                            dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ??
                              {}
                          ),
                          ignoreUpdate: true,
                          isFieldFocused: false,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: false,
                        },
                  ACCT_NM: {
                    value: postData?.ACCT_NM ?? "",
                  },
                  TYPE_CD: {
                    value: postData?.TYPE_CD ?? "",
                  },
                  TRAN_BAL: {
                    value: postData?.WIDTH_BAL ?? "",
                  },
                };
              } else if (!currentField?.value) {
                return {
                  ACCT_NM: { value: "" },
                  TRAN_BAL: { value: "" },
                };
              }
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          },
          __EDIT__: {
            branchCodeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              required: false,
              schemaValidation: {},
              GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
            },
            accountTypeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              required: false,
              schemaValidation: {},
              GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
            },
            accountCodeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              required: false,
              schemaValidation: {},
              postValidationSetCrossFieldValues: async (
                currentField,
                formState,
                authState,
                dependentFieldValues
              ) => {},

              GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
            },
          },
          __VIEW__: {
            branchCodeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
            },
            accountTypeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
            },
            accountCodeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
            },
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "COMP_CD",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          label: "accountName",
          isReadOnly: true,
          type: "text",
          fullWidth: true,
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: true },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "TRAN_BAL",
          label: "balance",
          isReadOnly: true,
          type: "text",
          fullWidth: true,
          FormatProps: {
            allowNegative: true,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
          // __NEW__: { isReadOnly: false },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "JOINT_DTL",
          label: "Joint Details",
          type: "text",
          GridProps: { lg: 1, xl: 1 },
          dependentFields: ["ACCT_CD"],
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.["PAYSLIP_MST_DTL.ACCT_CD"]?.value !== "") {
              return false;
            }
            return true;
          },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "TYPE_CD",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "narration",
          placeholder: "narration",
          type: "text",
          maxLength: 200,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
        },
        {
          render: { componentType: "autocomplete" },
          name: "C_C_T",
          placeholder: "selectTrxType",
          label: "",
          fullWidth: true,
          _optionsKey: "geTrxDdw",
          options: (dependentValue, formState, _, authState) => {
            return geTrxDdw();
          },
          setFieldLabel: (dependenet, currVal) => {
            return currVal === "C"
              ? { label: "By Cash" }
              : currVal === "T"
              ? { label: "By Trf" }
              : currVal === "R"
              ? { label: "By Cr. Trf" }
              : currVal === "G"
              ? { label: "By CLG" }
              : { label: "By" };
          },
          defaultValue: "T",
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            const payload = {
              C_C_T: currentField?.value,
            };

            formState.setDataOnFieldChange("BY_TRF", payload);
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHEQUE_NO",
          label: "chequeNo",
          placeholder: "Cheque No.",
          type: "text",
          fullWidth: true,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 12) {
                return false;
              }

              return true;
            },
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
          dependentFields: [
            "ACCT_CD",
            "ACCT_TYPE",
            "BRANCH_CD",
            "C_C_T",
            "TYPE_CD",
          ],
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ChequeNoisrequired"] }],
          },
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: false,
          },
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.["PAYSLIP_MST_DTL.C_C_T"]?.value === "C") {
              return true;
            }
            return false;
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (
              field.value &&
              dependentFieldsValues?.["PAYSLIP_MST_DTL.ACCT_CD"]?.value
                .length === 0
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
              dependentFieldsValues?.["PAYSLIP_MST_DTL.ACCT_CD"]?.value.length
            ) {
              if (formState?.isSubmitting) return {};
              let postData = await GeneralAPI.getChequeNoValidation({
                BRANCH_CD:
                  dependentFieldsValues?.["PAYSLIP_MST_DTL.BRANCH_CD"]?.value,
                ACCT_TYPE:
                  dependentFieldsValues?.["PAYSLIP_MST_DTL.ACCT_TYPE"]?.value,
                ACCT_CD: utilFunction.getPadAccountNumber(
                  dependentFieldsValues?.["PAYSLIP_MST_DTL.ACCT_CD"]?.value,
                  dependentFieldsValues?.["PAYSLIP_MST_DTL.ACCT_TYPE"]
                    ?.optionData?.[0] ?? {}
                ),
                CHEQUE_NO: field.value,
                TYPE_CD:
                  dependentFieldsValues?.["PAYSLIP_MST_DTL.TYPE_CD"]?.value,
                SCREEN_REF: "Rpt/14",
              });
              if (postData?.status === "999") {
                let btnName = await formState?.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: postData?.messageDetails?.length
                    ? postData?.messageDetails
                    : "Somethingwenttowrong",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    ACCT_CD: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                    ACCT_NM: { value: "" },
                  };
                }
              }

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
            }
          },
          __EDIT__: {
            isReadOnly: true,
            required: false,
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {},
          },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CHEQUE_DATE",
          label: "chequeDate",
          placeholder: "",
          format: "dd/MM/yyyy",
          // defaultValue: new Date(),
          type: "text",
          fullWidth: true,
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
          dependentFields: ["C_C_T", "TRAN_DT"],
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
          validate: (currentField, dependentField) => {
            const currentDate = new Date(currentField?.value);
            const rangeDate = new Date(
              dependentField?.["PAYSLIP_MST_DTL.TRAN_DT"]?.value
            );
            const transDate = new Date(
              dependentField?.["PAYSLIP_MST_DTL.TRAN_DT"]?.value
            );
            if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
              return "Mustbeavaliddate";
            }
            if (currentDate < rangeDate || currentDate > transDate) {
              return (
                "DateShouldBetween" +
                rangeDate.toLocaleDateString("en-IN") +
                " - " +
                transDate.toLocaleDateString("en-IN")
              );
            }
            return "";
          },
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.["PAYSLIP_MST_DTL.C_C_T"]?.value === "C") {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "amount",
          required: true,
          dependentFields: ["COMMISSION", "SERVICE_CHARGE", "C_C_T"],
          fullWidth: true,
          placeholder: "",
          type: "text",
          maxLength: 17,
          FormatProps: {
            allowNegative: false,
            decimalScale: 2,
          },
          __EDIT__: { isReadOnly: true, required: false },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["amountRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          runValidationOnDependentFieldsChange: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            const payload = {
              AMOUNT: currentField.value,
              COMMISSION:
                dependentFieldValues?.["PAYSLIP_MST_DTL.COMMISSION"]?.value,
              SERVICE_CHARGE:
                dependentFieldValues?.["PAYSLIP_MST_DTL.SERVICE_CHARGE"]?.value,
              C_C_T: dependentFieldValues?.["PAYSLIP_MST_DTL.C_C_T"]?.value,
            };
            formState.setDataOnFieldChange("MST_TOTAL", payload);
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "COMMISSION",
          label: "Comm.",
          fullWidth: true,
          placeholder: "",
          type: "text",
          maxLength: 13,
          FormatProps: {
            decimalScale: 2,
            allowNegative: false,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SERVICE_CHARGE",
          label: "GST",
          placeholder: "",
          type: "text",
          maxLength: 13,
          FormatProps: {
            decimalScale: 2,
            allowNegative: false,
          },
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
        },
        {
          render: { componentType: "hidden" },
          name: "isOldRow",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          dependentFields: ["FORM_MODE"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const fieldKey =
              dependentFields["PAYSLIP_MST_DTL.FORM_MODE"]?.fieldKey;
            const match = fieldKey ? fieldKey.match(/\[(\d+)\]/) : "";
            const newNumber = parseInt(match[1]) + 1;

            return `${newNumber}`;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "PENDING_FLAG",
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "DUMMY_CHECK",
          defaultValue: true,
          dependentFields: ["PAYSLIP_MST_DTL", "C_C_T"],
          __EDIT__: {
            isReadOnly: true,
          },
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields["PAYSLIP_MST_DTL"].length === 1) {
              return true;
            } else {
              const cctValue = dependentFields["PAYSLIP_MST_DTL.C_C_T"]?.value;

              if (cctValue === "R") {
                return true;
              }
              return false;
            }
          },
          GridProps: { xs: 12, sm: 2, md: 3, lg: 3, xl: 1.5 },
        },
      ],
    },
  ],
};
export const DraftdetailsFormMetaData = {
  form: {
    name: "payslip entry",
    label: "Pay-Slip-Isuue Entry (RPT/14)",
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
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "hidden",
      },
      name: "FORM_MODE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
    },
    {
      render: {
        componentType: "arrayField",
      },
      displayCountName: "Payslip & Demand Draft Row",
      name: "PAYSLIP_DRAFT_DTL",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      addRowFn: (data) => {
        const rows = Array.isArray(data?.PAYSLIP_DRAFT_DTL)
          ? data.PAYSLIP_DRAFT_DTL
          : [];

        const error = rows.find((item) => {
          if (!item.DEF_TRAN_CD?.trim())
            return { reason: "Please Select Bill Type" };
          if (!item.INFAVOUR_OF?.trim())
            return { reason: "Please Select Infavour Of" };
          if (!item.AMOUNT?.trim()) return { reason: "Please Enter Amount" };
          return null;
        });

        return error || true;
      },

      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "ENTERED_COMP_CD",
          dependentFields: ["FORM_MODE"],
          ignoreInSubmit: (dependentFields, formState, currentField) => {
            if (dependentFields?.FORM_MODE?.value !== "edit") return true;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "HIDDEN_PAYSLIPNO",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ENTERED_BRANCH_CD",
          dependentFields: ["FORM_MODE"],
          ignoreInSubmit: (dependentFields, formState, currentField) => {
            if (dependentFields?.FORM_MODE?.value !== "edit") return true;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "BILL_TYPE",
          label: "hiddem",
          dependentFields: ["DEF_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFieldsValues) => {
            const fieldValue =
              dependentFieldsValues?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]
                ?.optionData[0]?.TYPE_CD;

            return fieldValue;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "DEF_TRAN_CD",
          label: "billType",
          isFieldFocused: true,
          placeholder: "Select Bill Type",
          required: true,
          fullWidth: true,
          options: (dependentValue, formState, _, authState) => {
            return getRetrievalType({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              CODE: "DD",
            });
          },
          _optionsKey: "getCommonTypeList",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState
          ) => {
            const payload = {
              BILL_TYPE_CD: currentField.value,
              TYPE_CD: currentField.optionData[0]?.TYPE_CD,
            };

            formState.setDataOnFieldChange("DEF_TRAN_CD", payload);
            return {
              AMOUNT: { isFieldFocused: true },
              PAYSLIP_NO: {
                value: currentField?.optionData?.[0]?.MST_TRAN_CD,
              },
            };
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["billtypeRequired"] }],
          },
          dependentFields: ["PENDING_FLAG"],
          __EDIT__: {
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
            disableCaching: true,
          },
          __VIEW__: {
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
            disableCaching: true,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "COMM_TYPE_CD",
          label: "COMM_TYPE_CD",
          dependentFields: ["DEF_TRAN_CD"],
          runValidationOnDependentFieldsChange: true,
          disableCaching: true,
          setValueOnDependentFieldsChange: (dependentFields) => {
            const value =
              dependentFields["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"].optionData[0]
                ?.TYPE_CD;
            return value;
          },
        },
        {
          render: { componentType: "autocomplete" },
          name: "INFAVOUR_OF_OPTION",
          placeholder: "Select Infavour of",
          label: "SelectInfavourOf",
          options: getInfavourOfData,
          _optionsKey: "getInfavourOfData",
          defaultOptionLabel: "Select Commition Period",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          fullWidth: true,
          required: true,
          dependentFields: ["DEF_TRAN_CD", "FORM_MODE", "BILL_TYPE"],
          autoComplete: "on",
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value !== "view") {
              return false;
            }
            return true;
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              return {
                // REGION: {
                //   value: currentField?.optionData?.[0]?.REGION_NM ?? "",
                //   ignoreUpdate: false,
                // },
                INFAVOUR_OF: {
                  value: currentField?.optionData?.[0]?.label ?? "",
                  ignoreUpdate: false,
                },
              };
            }
            return {};
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "INFAVOUR_OF",
          label: "Infavour Of",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          placeholder: "EnterInfavourOf",
          maxLength: 300,
          txtTransform: "uppercase",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["InfavourOfRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADDRESS",
          label: "address",
          placeholder: "address",
          type: "text",
          maxLength: 200,
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "INSTRUCTION_REMARKS",
          label: "instRemarks",
          placeholder: "instRemarks",
          type: "text",
          maxLength: 300,
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "PAYSLIP_NO",
          label: "payslipNumber",
          placeholder: "payslipNumber",
          fullWidth: true,
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["payslipNoRequired"] }],
          },
          maxLength: 14,
          FormatProps: {
            allowLeadingZeros: true,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          dependentFields: ["DEF_TRAN_CD", "PENDING_FLAG"],
          runValidationOnDependentFieldsChange: false,

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.displayValue === "") {
              return {};
            }
            if (currentField.value) {
              if (
                dependentFieldsValues?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]
                  ?.optionData?.[0]?.BRANCH_CD &&
                dependentFieldsValues?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]
                  ?.optionData?.[0]?.TYPE_CD
              ) {
                let reqParameters = {
                  COMM_TYPE:
                    dependentFieldsValues?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]
                      ?.optionData?.[0]?.TYPE_CD ?? "",
                  PAYSLIP_NO: currentField?.value,
                  SCREEN_REF: "Rpt/14",
                  ENT_COMP_CD: authState?.companyID ?? "",
                  ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                };
                let postData = await validatePayslipNo(reqParameters);
                console.log("postData: ", postData);
                const msgDtl = await handleDisplayMessages(
                  postData,
                  formState?.MessageBox
                );
                return {
                  PAYSLIP_NO: {
                    value: !isEmpty(msgDtl) ? currentField?.value ?? "" : "",
                    ignoreUpdate: true,
                    isFieldFocused: true,
                  },
                };
              } else if (!currentField?.value) {
                return {};
              }
              return {};
            }
          },
          __EDIT__: {
            required: false,
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
          },
          __VIEW__: {
            required: false,
            render: {
              componentType: "textField",
            },
            setValueOnDependentFieldsChange: (dependentFields) => {},
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "amount",
          fullWidth: true,
          placeholder: "smount",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Amount is required"] }],
          },
          required: true,
          type: "text",
          maxLength: 17,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            decimalScale: 2,
          },
          dependentFields: [
            "PAYSLIP_MST_DTL",
            "COMMISSION",
            "SERVICE_CHARGE",
            "DEF_TRAN_CD",
            "PENDING_FLAG",
          ],
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          runPostValidationHookAlways: true,

          __EDIT__: {
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
          },
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: true,
          },

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (currentField.readOnly == false) {
              if (formState.isSubmitting) {
                return {};
              }

              if (!formState || !formState.refID || !formState.refID.current) {
                return {};
              }

              const { refID } = formState;

              if (
                !refID.current.paylod.BILL_TYPE_CD &&
                !refID.current.paylod.TYPE_CD
              ) {
                return {};
              }

              const reqParams = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                ACCT_CD:
                  dependentFieldsValues?.PAYSLIP_MST_DTL[0]?.ACCT_CD?.value ??
                  "",
                ACCT_TYPE:
                  dependentFieldsValues?.PAYSLIP_MST_DTL[0]?.ACCT_TYPE?.value ??
                  "",
                AMOUNT: currentField?.value,
                // TYPE_CD: refID.current.paylod.TYPE_CD,
                DEF_TRAN_CD: refID.current.paylod.BILL_TYPE_CD ?? "",
                COMM_TYPE: refID.current.paylod.TYPE_CD ?? "",
                ENT_COMP: authState?.companyID ?? "",
                ENT_BRANCH: authState?.user?.branchCode ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
                SCREEN_REF: "RPT/14",
              };

              if (
                reqParams.ACCT_CD !== "" &&
                reqParams.COMM_TYPE !== "" &&
                reqParams.DEF_TRAN_CD !== "" &&
                reqParams.AMOUNT !== ""
              ) {
                const gstApiData = await getCalculateGstComm(reqParams);

                return {
                  SERVICE_CHARGE: {
                    value: gstApiData?.[0]?.SERVICE_CHARGE ?? "",
                    ignoreUpdate: true,
                  },
                  COMMISSION: {
                    value: gstApiData?.[0]?.COMMISSION ?? "",
                    ignoreUpdate: true,
                    isReadOnly: (fieldValue, dependentFields, formState) => {
                      if (gstApiData?.[0]?.FLAG_ENABLE_DISABLE === "Y") {
                        return true;
                      } else return false;
                    },
                  },
                  OTHER_COMISSION: {
                    value: gstApiData?.[0]?.OTHER_COMISSION ?? "",
                    ignoreUpdate: true,
                  },
                  TAX_RATE: {
                    value: gstApiData?.[0]?.TAX_RATE ?? "",
                    ignoreUpdate: true,
                  },
                  GST_ROUND: {
                    value: gstApiData?.[0]?.GST_ROUND ?? "",
                    ignoreUpdate: true,
                  },
                };
              } else {
                return {};
              }
            }
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "BALANCE",
          label: "balance",
          placeholder: "balance",
          isReadOnly: true,
          type: "text",
          fullWidth: true,
          FormatProps: {
            allowNegative: true,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          dependentFields: ["DEF_TRAN_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const balance =
              dependentFields?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]
                ?.optionData?.[0]?.BALANCE;
            return balance;
          },
          __EDIT__: {
            isReadOnly: true,
          },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "TAX_RATE",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "GST_ROUND",
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "COMMISSION",
          label: "Commision",
          placeholder: "Enter Commision",
          fullWidth: true,
          maxLength: 15,
          FormatProps: {
            decimalScale: 2,
            allowNegative: false,
          },
          dependentFields: ["TAX_RATE", "GST_ROUND", "PENDING_FLAG"],
          AlwaysRunPostValidationSetCrossFieldValues: {
            alwaysRun: true,
            touchAndValidate: true,
          },
          runPostValidationHookAlways: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: {
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            const payload = {
              COMMISSION: currentField.value,
            };

            formState.setDataOnFieldChange("DRAFT_COMM", payload);
            if (formState?.isSubmitting) return {};

            if (Number(currentField?.value) > 0) {
              const taxRateValue =
                dependentFieldsValues?.["PAYSLIP_DRAFT_DTL.TAX_RATE"]?.value;
              const taxRate = parseInt(taxRateValue) || 0; // Default to 0 if undefined or NaN

              let gstValue;
              const commissionValue = parseInt(currentField.value) || 0; // Default to 0 if undefined or NaN
              const gstRoundValue =
                dependentFieldsValues?.["PAYSLIP_DRAFT_DTL.GST_ROUND"]?.value;

              if (gstRoundValue === "3") {
                gstValue = Math.floor((commissionValue * taxRate) / 100);
              } else if (gstRoundValue === "2") {
                gstValue = Math.ceil((commissionValue * taxRate) / 100);
              } else if (gstRoundValue === "1") {
                gstValue = Math.round((commissionValue * taxRate) / 100);
              } else {
                gstValue = (commissionValue * taxRate) / 100;
              }

              return {
                SERVICE_CHARGE: {
                  value: gstValue,
                  ignoreUpdate: true,
                },
              };
            } else {
              return {
                SERVICE_CHARGE: {
                  value: "0",
                },
              };
            }
          },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "OTHER_COMISSION",
          label: "otherComm",
          fullWidth: true,
          placeholder: "",
          type: "text",
          maxLength: 15,
          FormatProps: {
            decimalScale: 2,
            allowNegative: false,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          __NEW__: { isReadOnly: false },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SERVICE_CHARGE",
          label: "GST",
          placeholder: "",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          isReadOnly: true,
          dependentFields: ["COMMISSION", "AMOUNT"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            const payload = {
              SERVICE_CHARGE: currentField.value,
            };

            formState.setDataOnFieldChange("DRAFT_GST", payload);
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PARTY_NAME",
          label: "partyName",
          placeholder: "partyName",
          type: "text",
          maxLength: 300,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PARTY_ADDRESS",
          label: "partyAddress",
          placeholder: "partyAddress",
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          dependentFields: ["C_C_T"],

          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.["PAYSLIP_DRAFT_DTL.C_C_T"]?.value === "C") {
              return false;
            } else {
              return true;
            }
          },
          setValueOnDependentFieldsChange: (dependentFields) => {
            if (dependentFields?.["PAYSLIP_DRAFT_DTL.C_C_T"]?.value !== "C") {
              return "";
            } else return;
          },
        },
        {
          render: { componentType: "autocomplete" },
          name: "KYC_DOC",
          label: "kycDocument",
          // disableCaching: true,
          placeholder: "kycDocument",
          options: getCustDocData,
          _optionKey: "getCustDocData",
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          fullWidth: true,
          dependentFields: ["C_C_T"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.["PAYSLIP_DRAFT_DTL.C_C_T"]?.value === "C") {
              return false;
            } else {
              return true;
            }
          },
          setValueOnDependentFieldsChange: (dependentFields) => {
            if (dependentFields?.["PAYSLIP_DRAFT_DTL.C_C_T"]?.value !== "C") {
              return "";
            } else return;
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "KYC_DOC_NO",
          label: "kycDocumentNo",
          fullWidth: true,
          placeholder: "kycDocumentNo",
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          dependentFields: ["C_C_T"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.["PAYSLIP_DRAFT_DTL.C_C_T"]?.value === "C") {
              return false;
            } else {
              return true;
            }
          },
        },
        {
          render: { componentType: "autocomplete" },
          name: "COL_BANK_CD",
          placeholder: "Select Bank Code",
          label: "bankCode",
          options: getBankCodeData,
          _optionsKey: "getBankCodeData",
          defaultOptionLabel: "Select Bank Code",
          required: false,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          fullWidth: true,
          autoComplete: "on",
          isFieldFocused: false,
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "bankName",
          placeholder: "bankName",
          type: "text",
          dependentFields: ["COL_BANK_CD"],
          maxLength: 300,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          setValueOnDependentFieldsChange: (dependentFields) => {
            const value =
              dependentFields["PAYSLIP_DRAFT_DTL.COL_BANK_CD"].optionData[0]
                ?.BANK_NM;
            return value;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH_NM",
          label: "branch",
          placeholder: "branch",
          type: "text",
          maxLength: 100,
          dependentFields: ["COL_BANK_CD"],
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          setValueOnDependentFieldsChange: (dependentFields) => {
            const value =
              dependentFields["PAYSLIP_DRAFT_DTL.COL_BANK_CD"].optionData[0]
                ?.BRANCH_NM;
            return value;
          },
        },
        {
          render: { componentType: "select" },
          name: "C_C_T",
          placeholder: "byTransfer",
          label: "byTransfer",
          isReadOnly: true,
          fullWidth: true,
          options: [
            { label: "Cash", value: "C" },
            { label: "Clearing", value: "G" },
            { label: "Transfer", value: "T" },
            { label: "Credit Transfer", value: "R" },
          ],
          type: "text",
          dependentFields: ["PENDING_FLAG", "PAYSLIP_MST_DTL"],
          __EDIT__: {
            isReadOnly: (fieldValue, dependentFields, formState) => {
              return checkForUpdate(dependentFields);
            },
          },
          runValidationOnDependentFieldsChange: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          setValueOnDependentFieldsChange: (dependentFields) => {
            const check = dependentFields?.PAYSLIP_MST_DTL[0]?.C_C_T?.value;
            if (check === "C") {
              return "C";
            } else if (check === "G") {
              return "G";
            } else if (check === "T") {
              return "T";
            } else if (check === "R") {
              return "R";
            }
          },
          setFieldLabel: (dependenet, currVal) => {
            const cct = dependenet?.PAYSLIP_MST_DTL[0]?.C_C_T?.value;
            return cct === "C"
              ? { label: "By Cash" }
              : cct === "T"
              ? { label: "By Transfer" }
              : cct === "G"
              ? { label: "By Clearing" }
              : cct === "R"
              ? { label: "By Credit Transfer" }
              : "Transfer";
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "SIGNATURE1_CD",
          label: "signature1",
          placeholder: "signature1",
          defaultValueKey: "signature1",
          runValidationOnDependentFieldsChange: true,
          dependentFields: ["DEF_TRAN_CD", "FORM_MODE", "BILL_TYPE"],
          disableCaching: true,
          options: async (...arg) => {
            const branch = arg?.[3]?.user?.branchCode;
            const comp = arg?.[3]?.companyID;
            const billType =
              arg?.[2]?.["PAYSLIP_DRAFT_DTL.BILL_TYPE"]?.value ?? "";

            return branch && comp && billType
              ? await getSignatureDdnData({
                  BRANCH_CD: branch,
                  COMP_CD: comp,
                  COMM_TYPE_CD: billType,
                })
              : [];
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Signature 1 is required"] }],
          },
          _optionsKey: "getPayslipSignatureList1",
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value !== "view") {
              return false;
            }
            return true;
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISP_SIGN1",
          label: "signature1",
          dependentFields: ["FORM_MODE"],
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value === "view") {
              return false;
            }
            return true;
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "signature1",
          label: "...",
          type: "text",
          GridProps: { lg: 0.5, xl: 0.5 },
          dependentFields: ["INFAVOUR_OF"],
          shouldExclude: (val1, dependentFields) => {
            if (
              dependentFields?.INFAVOUR_OF?.optionData[0]?.REGION_BTN?.value ===
              "Y"
            ) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "SIGNATURE2_CD",
          label: "signature2",
          placeholder: "signature2",
          disableCaching: true,
          defaultValueKey: "signature2",
          runValidationOnDependentFieldsChange: true,
          dependentFields: ["DEF_TRAN_CD", "FORM_MODE", "BILL_TYPE"],
          options: (...arg) => {
            const branch = arg?.[3]?.user?.branchCode;
            const comp = arg?.[3]?.companyID;
            const billType =
              arg?.[2]?.["PAYSLIP_DRAFT_DTL.BILL_TYPE"]?.value ?? "";

            return branch && comp && billType
              ? getSignatureDdnData({
                  BRANCH_CD: branch,
                  COMP_CD: comp,
                  COMM_TYPE_CD: billType,
                })
              : [];
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Signature 2 is required"] }],
          },
          _optionsKey: "getPayslipSignatureList2",

          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value !== "view") {
              return false;
            }
            return true;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISP_SIGN2",
          label: "signature2",
          dependentFields: ["FORM_MODE"],
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value === "view") {
              return false;
            }
            return true;
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "signature2",
          label: "...",
          type: "text",
          GridProps: { lg: 0.5, xl: 0.5 },
          dependentFields: ["INFAVOUR_OF"],
          shouldExclude: (val1, dependentFields) => {
            if (
              dependentFields?.INFAVOUR_OF?.optionData[0]?.REGION_BTN?.value ===
              "Y"
            ) {
              return true;
            }
            return false;
          },
        },
        {
          render: { componentType: "autocomplete" },
          name: "REGION",
          placeholder: "region",
          label: "region",
          disableCaching: true,
          dependentFields: ["DEF_TRAN_CD", "FORM_MODE", "BILL_TYPE"],
          options: (...arg) => {
            const branch = arg?.[3]?.user?.branchCode;
            const comp = arg?.[3]?.companyID;
            const billType =
              arg?.[2]?.["PAYSLIP_DRAFT_DTL.BILL_TYPE"]?.value ?? "";

            return branch && comp && billType
              ? getRegionDDData({
                  BRANCH_CD: branch,
                  COMP_CD: comp,
                  COMM_TYPE_CD: billType,
                  FLAG: "R",
                })
              : [];
          },
          _optionsKey: "getRegionDDData",
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          fullWidth: true,
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value !== "view") {
              return false;
            }
            return true;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISP_REGION",
          label: "region",
          dependentFields: ["FORM_MODE"],
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.FORM_MODE?.value === "view") {
              return false;
            }
            return true;
          },
          GridProps: { sm: 5, xs: 12, md: 3, lg: 2, xl: 3 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "REGIONBTN",
          label: "regionBtn",
          type: "text",
          GridProps: { lg: 1, xl: 1 },
          dependentFields: ["INFAVOUR_OF", "FORM_MODE"],
          shouldExclude: (val1, dependentFields) => {
            if (
              dependentFields?.INFAVOUR_OF?.optionData[0]?.REGION_BTN?.value ===
                "Y" &&
              dependentFields?.FORM_MODE?.value !== "new"
            ) {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "PENDING_FLAG",
        },
        {
          render: { componentType: "hidden" },
          name: "isOldRow",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          dependentFields: ["FORM_MODE"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const fieldKey =
              dependentFields["PAYSLIP_DRAFT_DTL.FORM_MODE"]?.fieldKey;
            const match = fieldKey ? fieldKey.match(/\[(\d+)\]/) : "";
            const newNumber = parseInt(match[1]) + 1;

            return `${newNumber}`;
          },
        },
      ],
    },
  ],
};
export const TotaldetailsFormMetaData = {
  form: {
    name: "payslip entry",
    label: "Pay-Slip-Isuue Entry (RPT/14)",
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
      amountField: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "amountField",
      },
      name: "DRAFT_TOTAL",
      label: "Total : Amount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      dependentFields: ["PAYSLIP_DRAFT_DTL"],
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

      GridProps: { xs: 12, sm: 6, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalAmount = 0;

        if (dependentFields && dependentFields.PAYSLIP_DRAFT_DTL) {
          dependentFields.PAYSLIP_DRAFT_DTL.forEach((item) => {
            if (item && item.AMOUNT && item.AMOUNT.value) {
              totalAmount += parseFloat(item.AMOUNT.value);
            }
          });
        }

        return totalAmount;
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_COMM",
      label: "COMM :",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      dependentFields: ["PAYSLIP_DRAFT_DTL"],
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

      GridProps: { xs: 6, sm: 6, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalAmount = 0;
        if (dependentFields && dependentFields.PAYSLIP_DRAFT_DTL) {
          dependentFields.PAYSLIP_DRAFT_DTL.forEach((item) => {
            if (item && item.COMMISSION && item.COMMISSION.value) {
              totalAmount += parseFloat(item.COMMISSION.value);
            }
            if (item && item.OTHER_COMISSION && item.OTHER_COMISSION.value) {
              totalAmount += parseFloat(item.OTHER_COMISSION.value);
            }
          });
        }

        return totalAmount;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_GST",
      label: "GST :",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      dependentFields: ["PAYSLIP_DRAFT_DTL"],
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

      GridProps: { xs: 6, sm: 6, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalAmount = 0;

        if (dependentFields && dependentFields.PAYSLIP_DRAFT_DTL) {
          dependentFields.PAYSLIP_DRAFT_DTL.forEach((item) => {
            if (item && item.SERVICE_CHARGE && item.SERVICE_CHARGE.value) {
              totalAmount += parseFloat(item.SERVICE_CHARGE.value);
            }
          });
        }

        return totalAmount;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER7",
      GridProps: {
        xs: 0,
        sm: 0,
        md: 2,
        lg: 3,
        xl: 5.5,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FINAL_DRAFT_TOTAL",
      label: "Total :",
      placeholder: "",
      isReadOnly: true,
      FormatProps: {
        thousandSeparator: true,
        thousandsGroupStyle: "thousand",
        allowNegative: false,
        decimalScale: 2,
      },
      type: "text",
      dependentFields: ["TOTAL_GST", "DRAFT_TOTAL", "TOTAL_COMM"],
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
      setValueOnDependentFieldsChange: (dependentFields) => {
        const draftTotal = parseFloat(dependentFields?.DRAFT_TOTAL?.value) || 0;
        const totalGst = parseFloat(dependentFields?.TOTAL_GST?.value) || 0;
        const totalComm = parseFloat(dependentFields?.TOTAL_COMM?.value) || 0;

        let totalValue = draftTotal + totalGst + totalComm;

        totalValue = Math.abs(totalValue);

        return totalValue.toFixed(2).toString();
      },

      GridProps: { xs: 6, sm: 6, md: 3, lg: 2, xl: 1.5 },
    },
  ],
};
export const regionMasterMetaData: MasterDetailsMetaData = {
  masterForm: {
    form: {
      name: "Region",
      label: "Region Master",
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
      {
        render: { componentType: "textField" },
        name: "REGION_CD",
        label: "Code",
        placeholder: "Code",
        isReadOnly: true,
        type: "text",
        GridProps: { xs: 4, md: 4, sm: 4, lg: 2, xl: 2 },
        fullWidth: true,
        runValidationOnDependentFieldsChange: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          let value = await getRegionDDData2({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });

          let maxRegionCd = 0;

          value.forEach((item) => {
            const regionCd = parseInt(item.REGION_CD.trim(), 10);
            if (!isNaN(regionCd) && regionCd > maxRegionCd) {
              maxRegionCd = regionCd;
            }
          });

          const nextRegionCd = maxRegionCd + 1;

          return {
            REGION_CD: {
              value: nextRegionCd,
              ignoreUpdate: true,
            },
          };
        },
      },
      {
        render: { componentType: "textField" },
        name: "REGION_NM",
        label: "Description",
        placeholder: "designation",
        type: "text",
        GridProps: { xs: 4, md: 4, sm: 4, lg: 4, xl: 4 },
        fullWidth: true,
      },
      {
        render: { componentType: "autocomplete" },
        name: "COMM_TYPE_CD",
        placeholder: "selectBillType",
        label: "commType",
        _optionsKey: "getregioncommtype",
        options: (dependentValue, formState, _, authState) => {
          return getregioncommtype({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
          });
        },
        GridProps: { xs: 4, md: 4, sm: 4, lg: 6, xl: 6 },
        fullWidth: true,
        autoComplete: "on",
        isFieldFocused: false,
        dependentFields: ["COMM_TYPE_CD"],
        setValueOnDependentFieldsChange: (dependentFields) => {
          let value = dependentFields?.COMM_TYPE?.optionData[0]?.TYPE_CD.value;

          return value;
        },
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Reegion Maste",
      rowIdColumn: "REGION_CD",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: true,
      hideHeader: true,
      disableGroupBy: true,
      containerHeight: { min: "40vh", max: "40vh" },
      allowRowSelection: false,
      hiddenFlag: "_hidden",
      disableLoader: true,
      paginationText: "Records found",
    },
    columns: [
      {
        accessor: "REGION_CD",
        columnName: "Code",
        sequence: 1,
        alignment: "left",
        componentType: "default",
        width: 80,
        minWidth: 60,
        maxWidth: 120,
      },
      {
        accessor: "REGION_NM",
        columnName: "Description",
        sequence: 2,
        alignment: "left",
        componentType: "default",
        width: 220,
        minWidth: 200,
        maxWidth: 320,
      },
      {
        accessor: "MST_DESC",
        columnName: "commType",
        sequence: 3,
        alignment: "left",
        componentType: "default",
        width: 200,
        minWidth: 160,
        maxWidth: 500,
      },
    ],
  },
};
export const SlipJoinDetailGridMetaData = {
  gridConfig: {
    dense: true,
    gridLabel: "Joint Name Information",
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
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "50vh",
      max: "50vh",
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
      accessor: "JOINT_DISC",
      columnName: "type",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "REF_PERSON_NAME",
      columnName: "personName",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 350,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "DESIGNATION_NM",
      columnName: "designation",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 240,
      minWidth: 200,
      maxWidth: 300,
    },

    {
      accessor: "MEM_DISP_ACCT_TYPE",
      columnName: "memTypeAcNo",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "REF_ACCT",
      columnName: "referenceAccount",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 120,
      maxWidth: 250,
    },
    {
      accessor: "CONTACT_NO",
      columnName: "contactNo",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "CUSTOMER_ID",
      columnName: "customerId",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
  ],
};
export const DeleteDialogMetaData = {
  form: {
    name: "DeleteDialog",
    label: "Enter Removal Remarks For Payslip Issue Entry (RPT/014)",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "USER_DEF_REMARKS",
      label: "Removal Remarks",
      isReadOnly: false,
      defaultValue: "WRONG ENTRY FROM PAYSLIP ISSUE ENTRY (RPT/014)",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER3",
      GridProps: {
        xs: 5,
        sm: 5,
        md: 9,
        lg: 9,
        xl: 9,
      },
    },
  ],
};
export const DDtransactionsMetadata = {
  gridConfig: {
    dense: true,
    gridLabel: "Payslip/DD Transaction",
    rowIdColumn: "DOC_CD",
    defaultColumnConfig: {
      width: 300,
      maxWidth: 300,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    hideFooter: true,
    hideActionBar: true,
    disableGroupBy: true,
    enablePagination: false,
    pageSizes: [30, 50, 100],
    disableGlobalFilter: true,
    defaultPageSize: 10,
    containerHeight: {
      min: "auto",
      max: "auto",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    allowGlobalFilter: false,
  },
  filters: [],
  columns: [
    {
      accessor: "DOC_NM",
      columnName: "",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 300,
      maxWidth: 300,
      minWidth: 300,
    },
  ],
};
const checkForUpdate = (dependentFields) => {
  const insFlag = dependentFields?.["PAYSLIP_DRAFT_DTL.PENDING_FLAG"]?.value;
  return insFlag === "Y" || insFlag === "N" ? true : false;
};
