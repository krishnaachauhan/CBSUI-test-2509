import { GeneralAPI } from "registry/fns/functions";
import * as API from "../../api";
import { format, isValid } from "date-fns";

const commonHeaderTypographyProps = {
  variant: "subtitle2",
  style: {
    margin: "8px 0 10px 0",
    fontSize: "14px",
    width: "100%",
    textAlign: "center",
    background: "rgb(238, 238, 238)",
    borderRadius: "5px",
    padding: "6px 0",
  },
};
const labelListTypographyProps = {
  variant: "subtitle2",
  style: {
    margin: "18px 10px 0 0",
    fontSize: "14px",
    width: "100%",
    textAlign: "right",
  },
};
const labelTypographyProps = {
  variant: "subtitle2",
  style: {
    marginTop: "18px",
    fontSize: "14px",
    width: "100%",
    textAlign: "center",
  },
};
const setCommonAlign = {
  "& .MuiInputBase-root": {
    marginTop: "10px !important",
    "&:has(input[readonly])": {
      background: "#f3f3f3 !important",
    },
  },
};

const readOnlyStyle = {
  "& .MuiInputBase-root": {
    marginTop: "10px !important",
    background: "#f3f3f3 !important",
  },
};

//FD Payment/Renew buttons form metadata
export const PaymentRenewBtnsMetadata = {
  form: {
    name: "paymentbtns",
    label: "FDPaymentRenew",
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
      formbutton: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "formbutton",
      },
      name: "FD_PAYMENT",
      label: "FDPayment",
      endIcon: "CircularProgress",
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RENEW_FD",
      label: "RenewFD",
      endIcon: "CircularProgress",
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};

// FD Payment/Renew and Int payment form metadata
export const FDPaymentMetadata = {
  form: {
    name: "FDPayment",
    label: "FDDetails",
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
      render: {
        componentType: "spacer",
      },
      name: "SPACER_HEADER",
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "DATE_HEADER",
      label: "Date",
      ignoreInSubmit: true,
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "FIN_START_DATE_HEADER",
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "AMOUNT_HEADER",
      label: "Amount",
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 3.6,
        sm: 3.6,
        md: 3.6,
        lg: 3.6,
        xl: 3.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TDS_AND_SURCH_HEADER",
      label: "TDSAndSurcharge",
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TOTAL_HEADER",
      label: "Total",
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TDS_UPTO_TYPO",
      label: "TDSUpToWithColon",
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "TDS_DT",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: {
          paddingTop: "0px !important",
          "& .MuiInputBase-root": {
            marginTop: "10px !important",
          },
        },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACE_CM_TDS_FROM",
      dependentFields: ["TDS_APPLICABLE"],
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "CM_TDS_FROM",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      dependentFields: ["TDS_APPLICABLE"],
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return !Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: {
          paddingTop: "0px !important",
          "& .MuiInputBase-root": {
            marginTop: "10px !important",
          },
        },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TDS_INT_AMT",
      label: "",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.6,
        sm: 1.6,
        md: 1.6,
        lg: 1.6,
        xl: 1.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACE_INT_TDS_REST",
      dependentFields: ["TDS_APPLICABLE"],
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INT_TDS_REST",
      label: "",
      isReadOnly: true,
      dependentFields: ["TDS_APPLICABLE"],
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return !Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACE_TDS_INT_TRF",
      dependentFields: ["TDS_APPLICABLE"],
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TDS_INT_TRF",
      label: "",
      dependentFields: ["DISABLE_TDS", "TDS_APPLICABLE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(
          dependentFieldsValues?.DISABLE_TDS?.value?.trim() === "Y"
        );
      },
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return !Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: setCommonAlign,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACE_SUR_TDS_TRF",
      dependentFields: ["TDS_APPLICABLE"],
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SUR_TDS_TRF",
      label: "",
      dependentFields: ["DISABLE_TDS", "TDS_APPLICABLE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(
          dependentFieldsValues?.DISABLE_TDS?.value?.trim() === "Y"
        );
      },
      shouldExclude: (currentField, dependentFieldsValues, __) => {
        return !Boolean(
          dependentFieldsValues?.TDS_APPLICABLE?.value?.trim() === "Y"
        );
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: setCommonAlign,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TDS_UPTO_TOTAL",
      label: "",
      dependentFields: ["TDS_INT_TRF", "SUR_TDS_TRF"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.TDS_INT_TRF?.value ?? 0) +
          Number(dependentFieldsValues?.SUR_TDS_TRF?.value ?? 0);
        return value;
      },
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "INT_PAID_TYPO",
      label: "IntPaidWithColon",
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "INT_PAID_DT",
      label: "",
      placeholder: "",
      type: "text",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: {
          paddingTop: "0px !important",
          "& .MuiInputBase-root": {
            marginTop: "10px !important",
          },
        },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACE_INT_PAID_ONE",
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_PAID_AMT",
      label: "",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.6,
        sm: 1.6,
        md: 1.6,
        lg: 1.6,
        xl: 1.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "CASH_TYPO",
      label: "Cash",
      // TypographyProps: labelTypographyProps,
      textFieldStyle: setCommonAlign,
      TypographyProps: {
        variant: "subtitle2",
        color: "#00cc00 !important",
        style: {
          marginTop: "18px",
          fontSize: "14px",
          width: "100%",
          textAlign: "center",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TRANSFER_TYPO",
      label: "Transfer",
      textFieldStyle: setCommonAlign,
      TypographyProps: {
        variant: "subtitle2",
        color: "#0099ff !important",
        style: {
          marginTop: "18px",
          fontSize: "14px",
          width: "100%",
          textAlign: "center",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "AFT_MATURE_INT",
      label: "",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "INT_PROV_TYPO",
      label: "IntProvWithColon",
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "PROV_DT",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: {
          paddingTop: "0px !important",
          "& .MuiInputBase-root": {
            marginTop: "10px !important",
          },
        },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TOT_TDS_RECO_INT_AMT",
      label: "",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "PROV_INT_AMT",
      label: "",
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.6,
        sm: 1.6,
        md: 1.6,
        lg: 1.6,
        xl: 1.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_CASH",
      label: "",
      dependentFields: ["PROV_INT_AMT"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (Number(dependentFieldsValues?.PROV_INT_AMT?.value) >= 0) {
          if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.PROV_INT_AMT?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InvalidAmount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                INT_CASH: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else {
            let value =
              Number(dependentFieldsValues?.PROV_INT_AMT?.value ?? 0) -
              Number(currentField?.value ?? 0);
            return {
              INT_TRF: {
                value: value,
                ignoreUpdate: true,
              },
            };
          }
        } else {
          let value =
            Number(dependentFieldsValues?.PROV_INT_AMT?.value ?? 0) -
            Number(currentField?.value ?? 0);
          return {
            INT_TRF: {
              value: value,
              ignoreUpdate: true,
            },
          };
        }
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#d1ffd6 !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_TRF",
      label: "",
      dependentFields: ["PROV_INT_AMT"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (Number(dependentFieldsValues?.PROV_INT_AMT?.value) >= 0) {
          if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.PROV_INT_AMT?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InvalidAmount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                INT_TRF: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.PROV_INT_AMT?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InvalidAmount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                INT_TRF: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else {
            let value =
              Number(dependentFieldsValues?.PROV_INT_AMT?.value ?? 0) -
              Number(currentField?.value ?? 0);
            return {
              INT_CASH: {
                value: value,
                ignoreUpdate: true,
              },
            };
          }
        } else {
          let value =
            Number(dependentFieldsValues?.PROV_INT_AMT?.value ?? 0) -
            Number(currentField?.value ?? 0);
          return {
            INT_CASH: {
              value: value,
              ignoreUpdate: true,
            },
          };
        }
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#d1e7ff !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_PROV_TOTAL",
      label: "",
      isReadOnly: true,
      dependentFields: ["INT_TRF", "INT_CASH"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.INT_TRF?.value ?? 0) +
          Number(dependentFieldsValues?.INT_CASH?.value ?? 0);
        return value;
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "INT_FROM_TYPO",
      label: "IntFromWithColon",
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",
      isReadOnly: true,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: {
          paddingTop: "0px !important",
          "& .MuiInputBase-root": {
            marginTop: "10px !important",
          },
        },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DAYS_DTL",
      label: "",
      placeholder: "",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      textFieldStyle: readOnlyStyle,
      isReadOnly: true,
      GridProps: {
        xs: 2.7,
        sm: 2.7,
        md: 2.7,
        lg: 2.7,
        xl: 2.7,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_DAYS_DTL",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 2.7,
        sm: 2.7,
        md: 2.7,
        lg: 2.7,
        xl: 2.7,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "AFT_MAT_INT_TYPE",
      label: "",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      textFieldStyle: readOnlyStyle,
      isReadOnly: true,
      GridProps: {
        xs: 1.4,
        sm: 1.4,
        md: 1.4,
        lg: 1.4,
        xl: 1.4,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_AFT_MAT_INT_TYPE",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 1.4,
        sm: 1.4,
        md: 1.4,
        lg: 1.4,
        xl: 1.4,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "MAT_INT_RATE",
      label: "MatIntRateWithColon",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      TypographyProps: labelTypographyProps,
      GridProps: {
        xs: 1.3,
        sm: 1.3,
        md: 1.3,
        lg: 1.3,
        xl: 1.3,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_MAT_INT_RATE",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 1.3,
        sm: 1.3,
        md: 1.3,
        lg: 1.3,
        xl: 1.3,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "rateOfInt",
      },
      name: "AFT_MAT_INT_RATE",
      label: "",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_AFT_MAT_INT_RATE",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "AFT_MAT_INT_AMT",
      label: "",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_AFT_MAT_INT_AMT",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TO",
      label: "ToWithColon",
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "PAID_DT",
      label: "",
      placeholder: "",
      format: "dd/MM/yyyy",
      dependentFields: [
        "DISABLE_INT_RATE",
        "DISABLE_PAID_DT",
        "INT_RATE_REST",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "FD_NO",
        "IS_PREMATURE",
        "SPL_AMT",
        "TDS_METHOD",
        "INT_PAID_DT",
        "PROV_DT",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        try {
          const formattedCurField = currentField?.value
            ? format(new Date(currentField?.value), "dd/MMM/yyyy")
            : "";

          const formattedFormStVal = formState.paidDateIniValue
            ? format(new Date(formState.paidDateIniValue), "dd/MMM/yyyy")
            : "";

          if (
            formattedCurField === formattedFormStVal &&
            !formState.isChangePaidDate
          ) {
            return {};
          }

          const reqParameters = {
            A_LOGIN_BR: authState?.user?.branchCode ?? "",
            A_COMP_CD: authState?.companyID ?? "",
            A_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            A_ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
            A_ACCT_CD: dependentFieldValues?.ACCT_CD?.value ?? "",
            A_FD_NO: dependentFieldValues?.FD_NO?.value ?? "",
            A_FLAG: Boolean(formState?.openPayment)
              ? "P"
              : Boolean(formState?.openRenew)
              ? "R"
              : "I",
            A_IS_PREMATURE: dependentFieldValues?.IS_PREMATURE?.value ?? "",
            A_PRE_RATE: "",
            A_SPL_AMT: dependentFieldValues?.SPL_AMT?.value ?? "",
            A_TDS_METHOD: dependentFieldValues?.TDS_METHOD?.value ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            A_INT_RATE: dependentFieldValues?.INT_RATE_REST?.value ?? "",
            A_PAID_DT: currentField?.value
              ? format(new Date(currentField?.value), "dd/MMM/yyyy")
              : "",
          };

          const postData = await API.getFDPaymentDtl(reqParameters);
          formState.isChangePaidDate = true;

          let returnVal;
          for (const response of postData?.[0]?.MSG ?? []) {
            const continueProcess = await formState?.showMessageBox(response);
            if (!continueProcess) {
              break;
            } else if (
              response?.O_STATUS === "0" ||
              response?.O_STATUS === "999"
            ) {
              const keysToExclude = [
                "PAID_DT",
                "BAL_AMT",
                "PAY_CASH",
                "PAY_TRF",
                "DAYS_DTL",
                "AFT_MAT_INT_TYPE",
                "AFT_MAT_INT_RATE",
                "AFT_MAT_INT_AMT",
                "FD_REMARK",
              ];
              const filteredKeys = !formState?.openIntPayment
                ? keysToExclude.slice(0, 1)
                : keysToExclude;

              let filteredData = Object.keys(postData?.[0] || {}).reduce(
                (acc, key) => {
                  if (!filteredKeys.includes(key)) {
                    acc[key] = {
                      value: postData[0][key] ?? "",
                      ignoreUpdate: true,
                    };
                  }
                  return acc;
                },
                {}
              );
              returnVal =
                response?.O_STATUS !== "999"
                  ? {
                      ...filteredData,
                      PAID_DT: {
                        value: currentField?.value,
                        ignoreUpdate: true,
                        isFieldFocused: false,
                      },
                    }
                  : {
                      ...filteredData,
                      PAID_DT: {
                        value: "",
                        ignoreUpdate: false,
                        isFieldFocused: true,
                      },
                    };
            }
          }
          return {
            ...returnVal,
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
              PAID_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
            };
          }
        } finally {
          formState?.handleDisableButton(false);
        }
        return {};
      },
      validate: (currentField, dependentFields, formState) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(
          dependentFieldsValues?.DISABLE_PAID_DT?.value?.trim() === "Y"
        );
      },
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: {
          paddingTop: "0px !important",
          "& .MuiInputBase-root": {
            marginTop: "10px !important",
          },
        },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "RATE%",
      label: "RateWithColon",
      TypographyProps: labelTypographyProps,
      GridProps: {
        xs: 0.8,
        sm: 0.8,
        md: 0.8,
        lg: 0.8,
        xl: 0.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE_REST",
      label: "",
      dependentFields: [
        "DISABLE_INT_RATE",
        "PAID_DT",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "FD_NO",
        "IS_PREMATURE",
        "SPL_AMT",
        "TDS_METHOD",
      ],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        try {
          const formattedValue = parseFloat(
            formState?.intRateIniValue || 0
          ).toFixed(2);

          if (
            Number(currentField?.value) === Number(formattedValue) &&
            !formState.isChangeIntRate
          ) {
            if (!formState.isChangeIntRate) {
              formState.isChangeIntRate = true;
              return {};
            }
          }

          let reqParameters = {
            A_LOGIN_BR: authState?.user?.branchCode ?? "",
            A_COMP_CD: authState?.companyID ?? "",
            A_BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
            A_ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
            A_ACCT_CD: dependentFieldValues?.ACCT_CD?.value ?? "",
            A_FD_NO: dependentFieldValues?.FD_NO?.value ?? "",
            A_FLAG: Boolean(formState?.openPayment)
              ? "P"
              : Boolean(formState?.openRenew)
              ? "R"
              : "I",

            A_PRE_RATE: "",
            A_IS_PREMATURE: dependentFieldValues?.IS_PREMATURE?.value ?? "",
            A_SPL_AMT: dependentFieldValues?.SPL_AMT?.value ?? "",
            A_TDS_METHOD: dependentFieldValues?.TDS_METHOD?.value ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            A_INT_RATE: currentField?.value ?? "",
            A_PAID_DT: dependentFieldValues?.PAID_DT?.value
              ? format(
                  new Date(dependentFieldValues?.PAID_DT?.value),
                  "dd/MMM/yyyy"
                )
              : "",
          };
          const buttonName = await formState?.MessageBox({
            messageTitle: "Confirmation",
            message: "AsonCalculationRequired",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            reqParameters = { ...reqParameters, A_IS_PREMATURE: "Y" };
          }
          if (buttonName === "No") {
            reqParameters = { ...reqParameters, A_IS_PREMATURE: "N" };
          }
          const postData = await API.getFDPaymentDtl(reqParameters);

          let returnVal;
          for (const response of postData?.[0]?.MSG ?? []) {
            const continueProcess = await formState?.showMessageBox(response);
            if (!continueProcess) {
              break;
            } else if (
              response?.O_STATUS === "0" ||
              response?.O_STATUS === "999"
            ) {
              const keysToExclude = [
                "INT_RATE_REST",
                "BAL_AMT",
                "PAY_CASH",
                "PAY_TRF",
                "DAYS_DTL",
                "AFT_MAT_INT_TYPE",
                "AFT_MAT_INT_RATE",
                "AFT_MAT_INT_AMT",
                "FD_REMARK",
              ];
              const filteredKeys = !formState?.openIntPayment
                ? keysToExclude.slice(0, 1)
                : keysToExclude;

              let filteredData = Object.keys(postData?.[0] || {}).reduce(
                (acc, key) => {
                  if (!filteredKeys.includes(key)) {
                    acc[key] = {
                      value: postData[0][key] ?? "",
                      ignoreUpdate: true,
                    };
                  }
                  return acc;
                },
                {}
              );
              returnVal =
                response?.O_STATUS !== "999"
                  ? {
                      ...filteredData,
                      INT_RATE_REST: {
                        value: currentField?.value,
                        ignoreUpdate: true,
                        isFieldFocused: false,
                      },
                    }
                  : {
                      ...filteredData,
                      INT_RATE_REST: {
                        value: "",
                        ignoreUpdate: false,
                        isFieldFocused: true,
                      },
                    };
            }
          }
          return {
            ...returnVal,
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
              INT_RATE_REST: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
            };
          }
        } finally {
          formState?.handleDisableButton(false);
        }
        return {};
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(
          dependentFieldsValues?.DISABLE_INT_RATE?.value?.trim() === "Y"
        );
      },
      textFieldStyle: setCommonAlign,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_REST",
      label: "",
      dependentFields: ["DISABLE_INT_AMT"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return Boolean(
          dependentFieldsValues?.DISABLE_INT_AMT?.value?.trim() === "Y"
        );
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: setCommonAlign,
      GridProps: {
        xs: 1.6,
        sm: 1.6,
        md: 1.6,
        lg: 1.6,
        xl: 1.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_REST_CASH",
      label: "",
      dependentFields: ["INT_REST"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (Number(dependentFieldsValues?.INT_REST?.value) >= 0) {
          if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.INT_REST?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InvalidAmount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                INT_REST_CASH: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else {
            let value =
              Number(dependentFieldsValues?.INT_REST?.value ?? 0) -
              Number(currentField?.value ?? 0);
            return {
              INT_REST_TRF: {
                value: value,
                ignoreUpdate: true,
              },
            };
          }
        } else {
          let value =
            Number(dependentFieldsValues?.INT_REST?.value ?? 0) -
            Number(currentField?.value ?? 0);
          return {
            INT_REST_TRF: {
              value: value,
              ignoreUpdate: true,
            },
          };
        }
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#d1ffd6 !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_REST_TRF",
      label: "",
      dependentFields: ["INT_REST"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (Number(dependentFieldsValues?.INT_REST?.value) >= 0) {
          if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.INT_REST?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InvalidAmount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                INT_REST_TRF: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else {
            let value =
              Number(dependentFieldsValues?.INT_REST?.value ?? 0) -
              Number(currentField?.value ?? 0);
            return {
              INT_REST_CASH: {
                value: value,
                ignoreUpdate: true,
              },
            };
          }
        } else {
          let value =
            Number(dependentFieldsValues?.INT_REST?.value ?? 0) -
            Number(currentField?.value ?? 0);
          return {
            INT_REST_CASH: {
              value: value,
              ignoreUpdate: true,
            },
          };
        }
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#d1e7ff !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      FormatProps: {
        allowNegative: true,
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "INT_TO_TOTAL",
      label: "",
      dependentFields: ["INT_REST_CASH", "INT_REST_TRF"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.INT_REST_CASH?.value ?? 0) +
          Number(dependentFieldsValues?.INT_REST_TRF?.value ?? 0);
        return value;
      },
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "BALANCE_TYPO",
      label: "BalanceWithColon",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_BALANCE_TYPO",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 3.6,
        sm: 3.6,
        md: 3.6,
        lg: 3.6,
        xl: 3.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "BAL_AMT",
      label: "",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      isReadOnly: true,
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.6,
        sm: 1.6,
        md: 1.6,
        lg: 1.6,
        xl: 1.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "PAY_CASH",
      label: "",
      dependentFields: ["BAL_AMT"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (Number(dependentFieldsValues?.BAL_AMT?.value) >= 0) {
          if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.BAL_AMT?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "Invalid Amount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                PAY_CASH: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else {
            let value =
              Number(dependentFieldsValues?.BAL_AMT?.value ?? 0) -
              Number(currentField?.value ?? 0);
            return {
              PAY_TRF: {
                value: value,
                ignoreUpdate: true,
              },
            };
          }
        } else {
          let value =
            Number(dependentFieldsValues?.BAL_AMT?.value ?? 0) -
            Number(currentField?.value ?? 0);
          return {
            PAY_TRF: {
              value: value,
              ignoreUpdate: true,
            },
          };
        }
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#d1ffd6 !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "PAY_TRF",
      label: "",
      dependentFields: ["BAL_AMT"],
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (Number(dependentFieldsValues?.BAL_AMT?.value) >= 0) {
          if (
            Number(currentField?.value) < 0 ||
            Number(currentField?.value) >
              Number(dependentFieldsValues?.BAL_AMT?.value)
          ) {
            let btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "InvalidAmount",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                PAY_TRF: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          } else {
            let value =
              Number(dependentFieldsValues?.BAL_AMT?.value ?? 0) -
              Number(currentField?.value ?? 0);
            return {
              PAY_CASH: {
                value: value,
                ignoreUpdate: true,
              },
            };
          }
        }
        return {};
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#d1e7ff !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      FormatProps: {
        allowNegative: true,
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "BAL_TOTAL",
      label: "",
      isReadOnly: true,
      dependentFields: ["PAY_CASH", "PAY_TRF"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.PAY_CASH?.value ?? 0) +
          Number(dependentFieldsValues?.PAY_TRF?.value ?? 0);
        return value;
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TOTAL_AMT_TYPO",
      label: "TotalAmt",
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "TOKEN_NO_TYPO",
      label: "TokenNoWithColon",
      dependentFields: ["CASH_TOTAL"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        return !Boolean(dependentFieldsValues?.CASH_TOTAL?.value);
      },
      TypographyProps: labelTypographyProps,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_TOKEN_NO_TYPO",
      dependentFields: ["CASH_TOTAL"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        return Boolean(dependentFieldsValues?.CASH_TOTAL?.value);
      },
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "TOKEN_NO",
      label: "",
      className: "textInputFromRight",
      placeholder: "EnterTokenNumber",
      maxLength: 10,
      showMaxLength: false,
      autoComplete: "off",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          return !Boolean(
            values.value.startsWith("0") || values?.value?.length > 10
          );
        },
      },
      dependentFields: ["CASH_TOTAL", "ACCT_TYPE", "ACCT_CD", "BRANCH_CD"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.handleDisableButton(true);
        try {
          if (
            currentField?.value &&
            dependentFieldsValues?.ACCT_TYPE?.value &&
            dependentFieldsValues?.BRANCH_CD?.value &&
            dependentFieldsValues?.ACCT_CD?.value &&
            dependentFieldsValues?.CASH_TOTAL?.value
          ) {
            let reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value ?? "",
              ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD: dependentFieldsValues?.ACCT_CD?.value ?? "",
              ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
              SCROLL1: currentField?.value ?? "",
              TYPE_CD: "4",
              DOC_CD: formState?.docCD ?? "",
              AMOUNT: dependentFieldsValues?.CASH_TOTAL?.value ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };

            let postData = await GeneralAPI?.validateTokenScroll(reqParameters);

            let returnVal;
            for (const obj of postData) {
              const continueProcess = await formState?.showMessageBox(obj);
              if (!continueProcess) {
                formState?.handleDisableButton(false);
              }
              if (obj?.O_STATUS === "0") {
                formState?.handleDisableButton(false);
                returnVal = currentField?.value ?? "";
              }
            }
            return {
              TOKEN_NO: returnVal
                ? {
                    value: currentField?.value,
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
          return {};
        } catch (error: any) {
          const btn = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (btn === "Ok") {
            return {
              TOKEN_NO: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: true,
              },
            };
          }
        } finally {
          formState?.handleDisableButton(false);
        }
        return {};
      },
      shouldExclude: (_, dependentFieldsValues, __) => {
        return !Boolean(dependentFieldsValues?.CASH_TOTAL?.value);
      },
      textFieldStyle: setCommonAlign,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_TOKEN_NO",
      dependentFields: ["CASH_TOTAL"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        return Boolean(dependentFieldsValues?.CASH_TOTAL?.value);
      },
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "PROV_AMT",
      label: "",
      isReadOnly: true,
      dependentFields: ["PROV_INT_AMT", "INT_REST", "BAL_AMT"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.PROV_INT_AMT?.value ?? 0) +
          Number(dependentFieldsValues?.INT_REST?.value ?? 0) +
          Number(dependentFieldsValues?.BAL_AMT?.value ?? 0);
        return value;
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.6,
        sm: 1.6,
        md: 1.6,
        lg: 1.6,
        xl: 1.6,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "CASH_TOTAL",
      label: "",
      isReadOnly: true,
      dependentFields: ["INT_CASH", "INT_REST_CASH", "PAY_CASH"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.INT_CASH?.value ?? 0) +
          Number(dependentFieldsValues?.INT_REST_CASH?.value ?? 0) +
          Number(dependentFieldsValues?.PAY_CASH?.value ?? 0);
        return value;
      },
      runValidationOnDependentFieldsChange: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (Number(currentField?.value) <= 0) {
          return {
            TOKEN_NO: {
              value: "",
              ignoreUpdate: true,
            },
          };
        }
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#c0e9c5ff !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRANSFER_TOTAL",
      label: "",
      isReadOnly: true,
      dependentFields: ["INT_TRF", "INT_REST_TRF", "PAY_TRF"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.INT_TRF?.value ?? 0) +
          Number(dependentFieldsValues?.INT_REST_TRF?.value ?? 0) +
          Number(dependentFieldsValues?.PAY_TRF?.value ?? 0);
        return value;
      },
      runValidationOnDependentFieldsChange: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (Number(currentField?.value) <= 0) {
          return {
            PAYSLIP: {
              value: false,
              ignoreUpdate: true,
            },
            RTGS_NEFT: {
              value: false,
              ignoreUpdate: true,
            },
          };
        }
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#c3d8eeff !important",
          marginTop: "10px !important",
          border: "1px solid #BABABA !important",
        },
      },
      GridProps: {
        xs: 2,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "FINAL_TOT_AMT",
      label: "",
      isReadOnly: true,
      dependentFields: ["TRANSFER_TOTAL", "CASH_TOTAL"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.TRANSFER_TOTAL?.value ?? 0) +
          Number(dependentFieldsValues?.CASH_TOTAL?.value ?? 0);
        return value;
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: readOnlyStyle,
      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "typography",
      },
      name: "FD_REM_TYPO",
      label: "FDRemarkWithColon",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      TypographyProps: labelListTypographyProps,
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_FD_REM_TYPO",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        sx: { paddingTop: "0px !important" },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FD_REMARK",
      label: "",
      placeholder: "EnterFDRemark",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(formState?.openIntPayment);
      },
      textFieldStyle: setCommonAlign,
      GridProps: {
        xs: 6.2,
        sm: 6.2,
        md: 6.2,
        lg: 6.2,
        xl: 6.2,
        sx: { paddingTop: "0px !important" },
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_FD_REMARK_TYPO",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(formState?.openIntPayment);
      },
      GridProps: {
        xs: 6.2,
        sm: 6.2,
        md: 6.2,
        lg: 6.2,
        xl: 6.2,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: { componentType: "checkbox" },
      name: "PAYSLIP",
      label: "ByPayslipDD",
      dependentFields: ["TRANSFER_TOTAL", "RTGS_NEFT"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return !Boolean(
          Number(dependentFieldsValues?.TRANSFER_TOTAL?.value) > 0
        );
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return (
          Boolean(dependentFieldsValues?.RTGS_NEFT?.value) ||
          formState?.flag === "FDCNF"
        );
      },
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        if (Number(dependentFieldsValues?.TRANSFER_TOTAL?.value) <= 0) {
          return false;
        }
      },
      GridProps: {
        xs: 1.5,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_PAYSLIP",
      dependentFields: ["RTGS_NEFT"],
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(
          dependentFieldsValues?.RTGS_NEFT?.value || formState?.flag === "FDCNF"
        );
      },
      GridProps: {
        xs: 1.5,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },

    {
      render: { componentType: "checkbox" },
      name: "RTGS_NEFT",
      label: "ByNEFT",
      dependentFields: ["TRANSFER_TOTAL", "PAYSLIP"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        return !Boolean(
          Number(dependentFieldsValues?.TRANSFER_TOTAL?.value) > 0
        );
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return Boolean(
          dependentFieldsValues?.PAYSLIP?.value || formState?.flag === "FDCNF"
        );
      },
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        if (Number(dependentFieldsValues?.TRANSFER_TOTAL?.value) <= 0) {
          return false;
        }
      },
      GridProps: {
        xs: 1.5,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },

    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER_NEFT",
      dependentFields: ["PAYSLIP"],
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return !Boolean(dependentFieldsValues?.PAYSLIP?.value);
      },
      GridProps: {
        xs: 1.5,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRANSFER_TOTAL_FOR_NEXT_FORM",
      label: "",
      isReadOnly: true,
      dependentFields: ["TDS_INT_TRF", "SUR_TDS_TRF", "TRANSFER_TOTAL"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.TRANSFER_TOTAL?.value ?? 0) -
          (Number(dependentFieldsValues?.TDS_INT_TRF?.value ?? 0) +
            Number(dependentFieldsValues?.SUR_TDS_TRF?.value ?? 0));
        return value;
      },
      FormatProps: {
        allowNegative: true,
      },
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "var(--theme-color1) !important",
          fontWeight: "bold",
          "-webkit-text-fill-color": "var(--theme-color1) !important",
        },
        "& .MuiInputBase-root": {
          marginTop: "10px !important",
          background: "#f3f3f3 !important",
        },
      },

      GridProps: {
        xs: 1.8,
        sm: 1.8,
        md: 1.8,
        lg: 1.8,
        xl: 1.8,
        sx: { paddingTop: "0px !important" },
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_PAID_DT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_INT_AMT",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_TDS",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TDS_APPLICABLE",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_INT_RATE",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_NM",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "FD_NO",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "IS_PREMATURE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TDS_METHOD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SPL_AMT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PRE_RATE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MATURITY_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MATURITY_AMT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CUSTOMER_ID",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TDS_SUR_RATE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TDS_MSG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "MATURE_MSG",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PROV_INT_DT",
      dependentFields: ["PROV_DT"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        return dependentFieldsValues?.PROV_DT?.value;
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "R_INT_AMT",
      dependentFields: ["INT_REST", "AFT_MAT_INT_AMT"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.INT_REST?.value) -
          Number(dependentFieldsValues?.AFT_MAT_INT_AMT?.value);
        return value;
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LAST_TDS_AMT",
      dependentFields: ["TDS_INT_TRF", "SUR_TDS_TRF"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value =
          Number(dependentFieldsValues?.TDS_INT_TRF?.value) +
          Number(dependentFieldsValues?.SUR_TDS_TRF?.value);
        return value;
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LAST_RECOVERY",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PAN_NO",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LIABLE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERIOD_NO",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PERIOD_CD",
    },
  ],
};
