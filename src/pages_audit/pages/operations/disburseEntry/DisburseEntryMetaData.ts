import { validateHOBranch } from "components/utilFunction/function";
import * as API from "./api";
import { utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data?.MSG ?? []) {
    if (obj?.O_STATUS === "999") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      continue;
    } else if (obj?.O_STATUS === "99") {
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
      return data;
    }
  }
};

// Common Date Format
export const formatDateField = (field) =>
  Boolean(field)
    ? format(utilFunction.getParsedDate(field), "dd/MMM/yyyy")
    : "";

export const DisburseEntryMetadata = {
  form: {
    name: "disburse-entry-MetaData",
    label: "",
    validationRun: "onBlur",
    resetFieldOnUnmount: false,
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
      typography: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
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
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        runExternalFunction: true,
        runPostValidationHookAlways: true,
        isFieldFocused: true,
        validationRun: "onChange",
        dependentFields: ["BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value && !dependentFieldValues?.BRANCH_CD?.value) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
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
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          formState.setDataOnFieldChange("ACCT_CD", {
            value: currentField?.value,
          });
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
          if (currentField.value && !dependentFieldsValues?.ACCT_TYPE?.value) {
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
              BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              USERNAME: authState?.user?.id,
              USERROLE: authState?.role,
              WORKING_DATE: authState?.workingDate ?? "",
            };
            //   formState?.handleButtonDisable(true);
            const postData = await API.validateDisAcct(reqParameters);

            const returnValue = await handleDisplayMessages(
              postData?.[0],
              formState
            );

            return {
              ACCT_CD: returnValue
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
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
                value: returnValue?.ACCT_NM ?? "",
              },
              OP_DATE: {
                value: returnValue?.OP_DATE ?? "",
              },
              SANCTIONED_AMT: {
                value: returnValue?.SANCTIONED_AMT ?? "",
              },
              LIMIT_AMOUNT: {
                value: returnValue?.LIMIT_AMOUNT ?? "",
              },
              REMAIN_AMT: {
                value: returnValue?.REMAIN_AMT ?? "",
              },
              INT_RATE: {
                value: returnValue?.INT_RATE || "0",
              },
              INST_NO: {
                value: returnValue?.INST_NO ?? "",
              },
              INST_TYPE_DISP: {
                value: returnValue?.INST_TYPE_DISP ?? "",
              },
              TYPE_CD_DISP: {
                value: returnValue?.TYPE_CD_DISP ?? "",
              },
              INT_SKIP_FLAG_DISP: {
                value: returnValue?.INT_SKIP_FLAG_DISP ?? "",
              },
              INT_SKIP_REASON_TRAN_CD: {
                value: returnValue?.INT_SKIP_REASON_TRAN_CD ?? "",
              },
              INSTALLMENT_TYPE: {
                value: returnValue?.INSTALLMENT_TYPE ?? "",
              },
              TYPE_CD: {
                value: returnValue?.TYPE_CD ?? "",
              },
              INT_SKIP_FLAG: {
                value: returnValue?.INT_SKIP_FLAG ?? "",
              },
              PARA_162: {
                value: returnValue?.PARA_162 ?? "",
              },
              INS_START_DT: {
                value: returnValue?.INS_START_DT ?? "",
              },
              SANCTION_DT: {
                value: returnValue?.SANCTION_DT ?? "",
              },
              DISBURSEMENT_DT: {
                value: returnValue?.DISBURSEMENT_DT ?? "",
              },
              NEW_AMT: {
                value: "",
              },
            };
          } else if (!currentField?.value) {
            //   formState?.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
              OP_DATE: {
                value: "",
              },
              SANCTIONED_AMT: {
                value: "",
              },
              LIMIT_AMOUNT: {
                value: "",
              },
              REMAIN_AMT: {
                value: "",
              },
              INT_RATE: {
                value: "",
              },
              INST_NO: {
                value: "",
              },
              INST_TYPE_DISP: {
                value: "",
              },
              TYPE_CD_DISP: {
                value: "",
              },
              INT_SKIP_FLAG_DISP: {
                value: "",
              },
              INT_SKIP_REASON_TRAN_CD: {
                value: "",
              },
              INSTALLMENT_TYPE: {
                value: "",
              },
              TYPE_CD: {
                value: "",
              },
              INT_SKIP_FLAG: {
                value: "",
              },
              PARA_162: {
                value: "",
              },
              INS_START_DT: {
                value: "",
              },
              SANCTION_DT: {
                value: "",
              },
              DISBURSEMENT_DT: {
                value: "",
              },
              NEW_AMT: {
                value: "",
              },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "accountName",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: { componentType: "datePicker" },
      name: "OP_DATE",
      label: "OpenDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "amountField" },
      name: "SANCTIONED_AMT",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      label: "sanctionAmount",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "amountField" },
      name: "NEW_AMT",
      label: "NewDisbursementAmount",
      required: true,
      fullWidth: true,
      dependentFields: [
        "ACCT_TYPE",
        "BRANCH_CD",
        "ACCT_CD",
        "ENT_BRANCH_CD",
        "SANCTIONED_AMT",
        "LIMIT_AMOUNT",
        "NEW_AMT",
        "DISBURSEMENT_DT",
        "INS_START_DT",
        "INT_RATE",
        "INST_NO",
        "INT_SKIP_FLAG",
        "INT_SKIP_REASON_TRAN_CD",
        "REMAIN_AMT",
        "ACCT_NM",
        "OP_DATE",
        "INSTALLMENT_TYPE",
        "TYPE_CD",
        "DISBURSEMENT_DT",
        "SANCTION_DT",
        "INS_START_DT",
        "PARA_162",
        "INT_SKIP_FLAG",
      ],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        formState.setDataOnFieldChange("NEW_AMT", {
          value: currentField?.value,
        });
        if (!currentField?.value) return {};

        let reqParameters = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value ?? "",
          ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value ?? "",
          ACCT_CD: utilFunction.getPadAccountNumber(
            dependentFieldsValues?.ACCT_CD?.value,
            dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
          ),
          ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
          SANCTIONED_AMT: dependentFieldsValues?.SANCTIONED_AMT?.value,
          LIMIT_AMOUNT: dependentFieldsValues?.LIMIT_AMOUNT?.value,
          NEW_AMT: currentField?.value,
          INT_RATE: dependentFieldsValues?.INT_RATE?.value,
          INST_NO: dependentFieldsValues?.INST_NO?.value,
          INT_SKIP_REASON_TRAN_CD:
            dependentFieldsValues?.INT_SKIP_REASON_TRAN_CD?.value,
          REMAIN_AMT: dependentFieldsValues?.REMAIN_AMT?.value,
          WORKING_DATE: authState?.workingDate ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
          ACCT_NM: dependentFieldsValues?.ACCT_NM?.value,
          OP_DATE: formatDateField(dependentFieldsValues?.OP_DATE?.value),
          INSTALLMENT_TYPE: dependentFieldsValues?.INSTALLMENT_TYPE?.value,
          TYPE_CD: dependentFieldsValues?.TYPE_CD?.value,
          DISBURSEMENT_DT: formatDateField(
            dependentFieldsValues?.DISBURSEMENT_DT?.value
          ),
          SANCTION_DT: formatDateField(
            dependentFieldsValues?.SANCTION_DT?.value
          ),
          INS_START_DT: formatDateField(
            dependentFieldsValues?.INS_START_DT?.value
          ),
          PARA_162: dependentFieldsValues?.PARA_162?.value,
          INT_SKIP_FLAG: dependentFieldsValues?.INT_SKIP_FLAG?.value,
        };
        formState.dataRef.current = reqParameters;

        const postData = await API.validateNewDisbAmt(reqParameters);
        formState.setDataOnFieldChange("GRID_DATA", { GRID_DATA: postData });
        for (let i = 0; i < postData?.[0]?.MSG?.length; i++) {
          const msgObj = postData?.[0]?.MSG?.[i];
          const status = msgObj?.O_STATUS;

          if (status === "999" || status === "9") {
            await formState.MessageBox({
              messageTitle:
                msgObj?.O_MSG_TITLE ??
                (status === "999" ? "ValidationFailed" : "Alert"),
              message: msgObj?.O_MESSAGE,
              icon: status === "999" ? "ERROR" : "WARNING",
            });

            return {
              NEW_AMT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        }
        if (postData?.length > 0) {
          return {
            REMAIN_AMT: {
              value: postData?.[0]?.REMAIN_AMT,
            },
          };
        }
        return {};
      },
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["NewDisbursementAmountRequired"] },
        ],
      },
      runPostValidationHookAlways: true,
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "amountField" },
      name: "LIMIT_AMOUNT",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      label: "DisbursedAmount",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "amountField" },
      name: "REMAIN_AMT",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      label: "RemainingDisbursement",
      isReadOnly: true,
      fullWidth: true,
      FormatProps: {
        allowNegative: true,
      },
      GridProps: { xs: 12, sm: 5, md: 3, lg: 3, xl: 1.5 },
    },
    {
      render: { componentType: "rateOfInt" },
      name: "INT_RATE",
      label: "IntRate",
      defaultValue: "0",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 4, sm: 4, md: 1, lg: 1, xl: 0.7 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "INST_NO",
      label: "NoOfInstallment",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 4, sm: 4, md: 1, lg: 1, xl: 0.7 },
    },
    {
      render: { componentType: "textField" },
      name: "INST_TYPE_DISP",
      label: "InstallmentFrequency",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "textField" },
      name: "TYPE_CD_DISP",
      label: "InstallmentType",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "textField" },
      name: "INT_SKIP_FLAG_DISP",
      label: "IntFunded",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "INT_SKIP_REASON_TRAN_CD",
      label: "MoratoriumMonths",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "INSTALLMENT_TYPE",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INT_SKIP_FLAG",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_162",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INS_START_DT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SANCTION_DT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISBURSEMENT_DT",
      ignoreInSubmit: true,
    },
  ],
};
