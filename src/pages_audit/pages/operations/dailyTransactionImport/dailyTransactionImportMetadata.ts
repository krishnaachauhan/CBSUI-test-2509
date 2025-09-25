import { utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions/general";
import * as API from "./api";
import { GridMetaDataType } from "@acuteinfo/common-base";

export const DailyTransactionImportMetadata = {
  form: {
    name: "DailyTransactionImport",
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
    // {
    //   render: {
    //     componentType: "divider",
    //   },
    //   name: "AccountDetail",
    //   label: "Please Enter Details",
    //   GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    // },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "FROM_BRANCH_CD",
        GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
        runPostValidationHookAlways: true,
        render: {
          componentType: "textField",
        },
        isReadOnly: true,
      },

      accountTypeMetadata: {
        name: "FROM_ACCT_TYPE",
        GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
        isFieldFocused: true,
        defaultfocus: true,
        defaultValue: "",
        runPostValidationHookAlways: true,
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "MST/454",
          });
        },
        dependentFields: ["FROM_BRANCH_CD"],
        postValidationSetCrossFieldValues: (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          formState.setDataOnFieldChange("GRID_DETAIL", []);
          if (field?.value) {
            formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", {
              ACCT_TYPE: field?.value,
              BRANCH_CD: dependentFieldsValues?.FROM_BRANCH_CD?.value,
              COMP_CD: auth?.companyID ?? "",
            });
          }
          return {
            FROM_ACCT_CD: { value: "", ignoreUpdate: true },
            ACCT_NM: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        name: "FROM_ACCT_CD",
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
        dependentFields: ["FROM_ACCT_TYPE", "FROM_BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (
            field.value &&
            dependentFieldsValues?.["FROM_ACCT_TYPE"]?.value &&
            dependentFieldsValues?.["FROM_BRANCH_CD"]?.value
          ) {
            if (formState?.isSubmitting) return {};
            let Apireq = {
              COMP_CD: auth?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentFieldsValues?.["FROM_ACCT_TYPE"]?.optionData?.[0] ?? {}
              ),
              ACCT_TYPE: dependentFieldsValues?.["FROM_ACCT_TYPE"]?.value,
              BRANCH_CD: dependentFieldsValues?.["FROM_BRANCH_CD"]?.value,
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
              formState.setDataOnFieldChange("GRID_DETAIL", []);
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData;
              } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
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
                if (btn99 !== "No") {
                  returnVal = postData;
                } else {
                  returnVal = "";
                }
                formState.setDataOnFieldChange("ACSHRTCTKEY_REQ", Apireq);
                formState.setDataOnFieldChange("API_REQ", Apireq);
              }
            }
            btn99 = 0;
            return {
              FROM_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentFieldsValues?.FROM_ACCT_TYPE
                          ?.optionData?.[0] ?? {}
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
              TYPE_CD: {
                value: returnVal?.TYPE_CD ?? "",
              },
            };
          } else {
            formState.setDataOnFieldChange("GRID_DETAIL", []);
            return {
              ACCT_NM: { value: "" },
              WIDTH_BAL: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
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
      GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "WIDTH_BAL",
      label: "Balance",
      dependentFields: ["FROM_ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return (
          dependentFields?.FROM_ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? ""
        );
      },
      placeholder: "",
      isReadOnly: true,
      GridProps: { xs: 6, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DESCRIPTION",
      label: "Configuration",
      fullWidth: true,
      options: async (dependentValue, formState, _, authState) => {
        return API.getDailyImportConfigData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      _optionsKey: "getDailyImportConfigData",
      required: true,
      placeholder: "PleaseSelectConfi",
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["ConfigurationRequired"],
          },
        ],
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (field.value) {
          return {
            TABLE_NM: {
              value: field?.optionData?.[0]?.TABLE_NM,
            },
            TRAN_CD: {
              value: field?.optionData?.[0]?.value,
            },
            FILE_FORMAT: {
              value: field?.optionData?.[0]?.FILE_FORMAT,
            },
          };
        } else {
          return {
            TABLE_NM: { value: "" },
            TRAN_CD: { value: "" },
            FILE_FORMAT: { value: "" },
          };
        }
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "FILE_FORMAT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TABLE_NM",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "Cheque No.",
      type: "text",
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
      // schemaValidation: {
      //   type: "string",
      //   rules: [
      //     {
      //       name: "required",
      //       params: ["PleaseEnterChequeNumber"],
      //     },
      //   ],
      // },
      dependentFields: [
        "FROM_ACCT_CD",
        "FROM_ACCT_TYPE",
        "FROM_BRANCH_CD",
        "TYPE_CD",
      ],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (
          field.value &&
          dependentFieldsValues?.["FROM_ACCT_CD"]?.value.length === 0
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "Information",
            message: "EnterAccountInformation",
            buttonNames: ["Ok"],
            icon: "INFO",
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
          dependentFieldsValues?.["FROM_ACCT_CD"]?.value?.length
        ) {
          if (formState?.isSubmitting) return {};
          let postData = await GeneralAPI.getChequeNoValidation({
            COMP_CD: auth?.companyID,
            BRANCH_CD: dependentFieldsValues?.["FROM_BRANCH_CD"]?.value,
            ACCT_TYPE: dependentFieldsValues?.["FROM_ACCT_TYPE"]?.value,
            ACCT_CD: utilFunction.getPadAccountNumber(
              dependentFieldsValues?.["FROM_ACCT_CD"]?.value,
              dependentFieldsValues?.["FROM_ACCT_TYPE"]?.optionData?.[0] ?? {}
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
                buttonNames: obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
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
      GridProps: { xs: 6, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      fullWidth: true,
      txtTransform: "uppercase",
      placeholder: "EnterRemarks",
      GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "OPP_ENT",
      label: "GenerateOppositeEntry",
      defaultValue: true,
      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "IGNR_INSUF",
      label: "IgnoreInsufficientBalance",
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "SELECT",
      label: "Select File",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        md: 1,
        sm: 1,
        lg: 1,
        xl: 1,
      },
    },
  ],
};
export const DailyTransactionImportGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Debit From Account",
    rowIdColumn: "index",
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
      min: "30vh",
      max: "30vh",
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
      accessor: "CREDIT_AC",
      columnName: "CreditToAccount",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 220,
      minWidth: 150,
      maxWidth: 290,
      isTotalWithCurrency: true,
      footerLabel: "Total Entries :",
      setFooterValue(total, rows) {
        return [rows.length ?? 0];
      },
    },
    {
      accessor: "SDC",
      columnName: "SDC",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 50,
      maxWidth: 120,
      isTotalWithCurrency: true,
      footerLabel: "Total Errors :",
      setFooterValue(total, rows) {
        const proccessedCount = rows?.filter(
          ({ original }) => !(original.STATUS === "Y")
        ).length;
        return [proccessedCount ?? 0];
      },
    },
    {
      accessor: "TYPE_CD",
      columnName: "Trx",
      sequence: 4,
      alignment: "right",
      componentType: "default",
      width: 80,
      minWidth: 50,
      maxWidth: 120,
    },

    {
      accessor: "CHEQUE_NO",
      columnName: "ChequeNo",
      sequence: 5,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 100,
      maxWidth: 130,
    },

    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 6,
      alignment: "right",
      componentType: "currency",
      width: 150,
      minWidth: 150,
      maxWidth: 180,
      isTotalWithCurrency: true,
      footerLabel: "Total Credit :",
      setFooterValue(total, rows) {
        // Filter rows where TYPE_CD is 1, 2, or 3
        const filteredRows = rows?.filter(({ original }) =>
          [1, 2, 3].includes(Number(original.TYPE_CD))
        );
        const sum =
          filteredRows?.reduce(
            (acc, { original }) => acc + Number(original.AMOUNT),
            0
          ) ?? 0;
        const formattedSum = sum.toFixed(2);
        return [formattedSum];
      },
    },

    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 220,
      minWidth: 150,
      maxWidth: 290,
      isTotalWithCurrency: true,
      footerLabel: "Total Debit :",
      setFooterValue(total, rows) {
        const filteredRows = rows?.filter(({ original }) =>
          [4, 5, 6].includes(Number(original.TYPE_CD))
        );
        const sum =
          filteredRows?.reduce(
            (acc, { original }) => acc + Number(original.AMOUNT),
            0
          ) ?? 0;
        const formattedSum = sum.toFixed(2);
        return [formattedSum];
      },
    },
    {
      accessor: "STATUS",
      columnName: "Status",
      sequence: 8,
      alignment: "left",
      width: 250,
      minWidth: 250,
      maxWidth: 300,
      componentType: "editableAutocomplete",
      options: (_, auth) => {
        return API.getDailyTranStatus();
      },
      _optionsKey: "getDailyTranStatus",
    },
  ],
};
