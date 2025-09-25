import { geTrxDdw } from "../payslip-issue-entry/api";
export const PayslipdetailsFormMetaData = {
  form: {
    name: "payslip entry confm",

    label: "",
    resetFieldOnUnmount: false,
    validationRun: "all",
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
      dateFormat: "dd/MM/yyyy",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
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
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
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
      placeholder: "Mode",
      isReadOnly: true,
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "#EEE",
          color: "red !important",
        },
        "& .MuiInputBase-input": {
          background: "#EEE",
          color: "red !important",
          "&.Mui-disabled": {
            color: "red !important",
            "-webkit-text-fill-color": "red !important",
          },
        },
      },
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER8",
      GridProps: { xs: 0, sm: 0, md: 0, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MST_TOTAL",
      label: "Total ",
      placeholder: "",
      isReadOnly: true,
      type: "text",
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
      GridProps: { xs: 6, sm: 6, md: 6, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalValue = 0;

        // Iterate through each row in PAYSLIP_MST_DTL
        dependentFields.PAYSLIP_MST_DTL.forEach((row) => {
          const amount = parseFloat(row?.AMOUNT?.value) || 0;
          const commission = parseFloat(row?.COMMISSION?.value) || 0;
          const serviceCharge = parseFloat(row?.SERVICE_CHARGE?.value) || 0;
          const isCCtR = row?.C_C_T?.value === "R";

          if (isCCtR) {
            totalValue -= amount;
          } else {
            totalValue += amount;
          }

          totalValue += commission + serviceCharge;
        });

        return totalValue;
      },
    },
  ],
};
export const AccdetailsFormMetaData = {
  form: {
    name: "payslip entry",
    label: " ",
    resetFieldOnUnmount: false,
    validationRun: "onChange",
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
          for (let i = 0; i < dataArray?.length; i++) {
            const item = dataArray[0];
            if (
              item.AMOUNT.trim() &&
              item.CHEQUE_NO.trim() &&
              item.ACCT_CD.trim()
            ) {
              return true;
            }
          }

          return false;
        } else return true;
      },
      __EDIT__: {
        fixedRows: true,
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },

      _fields: [
        {
          render: { componentType: "_accountNumber" },

          __VIEW__: {
            branchCodeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
            },
            accountTypeMetadata: {
              render: {
                componentType: "textField",
              },
              isReadOnly: true,
              GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
            },
            accountCodeMetadata: {
              render: {
                componentType: "textField",
              },
              name: "ACCT_CD",
              isReadOnly: true,
              GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
            },
          },
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
          __NEW__: { isReadOnly: false },
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
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
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
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
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "SIGN",
          label: "Sign",
          GridProps: { lg: 1, xl: 1 },
          dependentFields: ["ACCT_CD"],
          shouldExclude: (val1, dependentFields) => {
            if (dependentFields?.["PAYSLIP_MST_DTL.ACCT_CD"]?.value !== "") {
              return false;
            }
            return true;
          },
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
          setFieldLabel: (dependenet, currVal) => {
            return currVal === "C"
              ? "Cash"
              : currVal === "T"
              ? "Transfer"
              : currVal === "G"
              ? "Clearing"
              : null;
          },
          label: "narration",
          placeholder: "Mode",
          type: "text",
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
        },
        {
          render: { componentType: "autocomplete" },
          name: "C_C_T",
          placeholder: "",
          label: "byTrf",
          fullWidth: true,
          _optionsKey: "options",
          options: (dependentValue, formState, _, authState) => {
            return geTrxDdw();
          },
          setFieldLabel: (dependenet, currVal) => {
            return currVal === "C"
              ? "By Cash"
              : currVal === "T"
              ? "By Trf"
              : currVal === "R"
              ? "By Cr. Trf"
              : currVal === "G"
              ? "By CLG"
              : null;
          },
          defaultValue: "T",
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
          GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
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
              if (values?.value?.length > 6) {
                return false;
              }

              return true;
            },
          },
          GridProps: { xs: 6, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
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
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CHEQUE_DATE",
          label: "chequeDate",
          placeholder: "",
          format: "dd/MM/yyyy",
          defaultValue: new Date(),
          type: "text",
          fullWidth: true,
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
          dependentFields: ["C_C_T"],
          GridProps: { xs: 6, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
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
          FormatProps: {
            allowNegative: false,
          },
          __EDIT__: { isReadOnly: true, required: false },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["amountRequired"] }],
          },
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
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
          GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
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
          fullWidth: true,
          GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
        },

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
          name: "PENDING_FLAG",
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "WITHDRAWABLE",
          label: "withdrawable",
          placeholder: "",
          type: "text",
          textFieldStyle: {
            "& .MuiInputBase-root": {
              background: "#EEE",
              color: "red !important",
            },
            "& .MuiInputBase-input": {
              background: "#EEE",
              color: "red !important",
              "&.Mui-disabled": {
                color: "red !important",
                "-webkit-text-fill-color": "red !important",
              },
            },
          },
          fullWidth: true,
          isReadOnly: true,
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "LIMIT_AMOUNT",
          isReadOnly: true,
          textFieldStyle: {
            "& .MuiInputBase-root": {
              background: "#EEE",
              color: "red !important",
            },
            "& .MuiInputBase-input": {
              background: "#EEE",
              color: "red !important",
              "&.Mui-disabled": {
                color: "red !important",
                "-webkit-text-fill-color": "red !important",
              },
            },
          },
          label: "limitamount",
          placeholder: "",

          type: "text",
          fullWidth: true,
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "DRAWING_POWER",
          label: "drawingPower",

          placeholder: "",
          type: "text",
          fullWidth: true,
          isReadOnly: true,
          GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
          __EDIT__: { isReadOnly: true },
          __NEW__: { isReadOnly: false },
          textFieldStyle: {
            "& .MuiInputBase-root": {
              background: "#EEE",
              color: "red !important",
            },
            "& .MuiInputBase-input": {
              background: "#EEE",
              color: "red !important",
              "&.Mui-disabled": {
                color: "red !important",
                "-webkit-text-fill-color": "red !important",
              },
            },
          },
        },
      ],
    },
  ],
};
