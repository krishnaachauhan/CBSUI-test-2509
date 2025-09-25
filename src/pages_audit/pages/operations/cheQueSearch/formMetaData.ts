import { format } from "date-fns";
import { getClearingTypeDDW, getClgZoneData, getReasonDdwData } from "./api";
import { t } from "i18next";

export const RetrievalParameterFormMetaData = {
  form: {
    name: "retrievalParameters",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "Spacer",
      GridProps: {
        xs: 0,
        md: 1,
        sm: 0,
        lg: 1,
        xl: 1,
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
      GridProps: { xs: 2, sm: 2, md: 2, lg: 1.4, xl: 1.4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired."] }],
      },
      dependentFields: ["TO_DT"],
      validate: (currentField, dependentField) => {
        if (
          new Date(currentField?.value) > new Date(dependentField?.TO_DT?.value)
        ) {
          return "ClearingDateshouldbelessthanorequaltoGdDate";
        }
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
      dependentFields: ["FROM_DT"],
      validate: (currentField, dependentField) => {
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 2, sm: 2, md: 2, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "Chequeno",
      required: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 9) {
            return false;
          }
          return true;
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ChequeNorequired"] }],
      },
      GridProps: { xs: 2, sm: 2, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "TRAN_TYPE",
      placeholder: "type",
      label: "type",
      _optionsKey: "getClearingTypeDDW",
      options: (dependentValue, formState, _, authState) => {
        return getClearingTypeDDW({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      defaultValue: "S",
      fullWidth: true,
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 1.4 },
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
  ],
};
export const returnChequeFormMetaData = {
  form: {
    name: "return cheque",

    label: "Enter Parameter",
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
        componentType: "textField",
      },
      name: "COMP_CD",
      label: "ACNo",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ZONE_TRAN_TYPE",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "ACCT_TYPE",
      label: "",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "ACCT_CD",
      label: "",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "BALANCE",
      label: "Balance",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
      GridProps: { xs: 0, sm: 0, md: 0, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PHONE",
      label: "phone",
      type: "text",
      maxlength: 10,
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 5, xl: 5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "Bank",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "Chequeno",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 6, sm: 6, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "ENTERED_BRANCH_CD",
      label: "from",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 6, sm: 6, md: 6, lg: 3, xl: 3 },
    },

    {
      render: { componentType: "autocomplete" },
      name: "ZONE_CD",
      label: "Zone",
      dependentFields: ["ZONE_TRAN_TYPE"],
      _optionsKey: "getClgZoneData",
      placeholder: "enterZone",
      options: (dependentValue, formState, _, authState) => {
        return getClgZoneData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          ZONE_TRAN_TYPE: "W",
        });
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value) {
          return {
            ZONE_TRAN_TYPE: {
              value: currentField?.optionData[0]?.ZONE_TRAN_TYPE ?? "",
              isFieldFocused: true,
              ignoreUpdate: false,
            },
          };
        }
      },
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
      fullWidth: true,
    },
    {
      render: { componentType: "autocomplete" },
      name: "REASON",
      label: "Reason",
      placeholder: "enterReason",
      _optionsKey: "getReasonDdwData",
      options: (dependentValue, formState, _, authState) => {
        return getReasonDdwData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          RETURN_TYPE: "CLG",
        });
      },
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
      fullWidth: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Description",
      maxLength: 25,
      type: "text",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ],
};
