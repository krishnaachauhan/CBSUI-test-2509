import { t } from "i18next";

export const ClearingBankMstFormMetaData = {
  form: {
    name: "clearingBankMaster",
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
      checkbox: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "RBI_CD",
      label: "RBICode",
      placeholder: "EnterRBICode",
      maxLength: 10,
      required: true,
      autoComplete: "off",
      type: "text",
      isFieldFocused: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      __EDIT__: { isReadOnly: true },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["RBICodeIsRequired"] }],
      },
      runPostValidationHookAlways: true,
      __NEW__: {
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (currentField?.value) {
            return {
              BANK_CD: {
                value: currentField?.value,
                isFieldFocused: false,
              },
            };
          } else if (!currentField?.value) {
            return {
              BANK_CD: {
                value: "",
                isFieldFocused: false,
              },
            };
          }
        },
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_CD",
      label: "Code",
      placeholder: "EnterCode",
      maxLength: 10,
      required: true,
      type: "text",
      autoComplete: "off",
      __EDIT__: { isReadOnly: true },
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue, ...rest) => {
        const gridData = rest[1]?.gridData;
        const accessor: any = columnValue.fieldKey.split("/").pop();
        const fieldValue = columnValue.value?.trim().toLowerCase();
        const rowColumnValue = rest[1]?.rows?.[accessor]?.trim().toLowerCase();
        if (fieldValue === rowColumnValue) {
          return "";
        }
        if (gridData) {
          for (let i = 0; i < gridData.length; i++) {
            const ele = gridData[i];
            const trimmedColumnValue = ele?.[accessor]?.trim().toLowerCase();

            if (trimmedColumnValue === fieldValue) {
              return `${t(`DuplicateValidation`, {
                fieldValue: fieldValue,
                rowNumber: i + 1,
              })}`;
            }
          }
        }
        return "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "BankName",
      placeholder: "EnterBankName",
      maxLength: 50,
      required: true,
      type: "text",
      autoComplete: "off",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["BankNameIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "EXCLUDE",
      label: "Exclude",
      defaultValue: false,
      GridProps: { xs: 3, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "CTS",
      label: "CTS",
      defaultValue: false,
      GridProps: { xs: 3, sm: 2, md: 2, lg: 2, xl: 2 },
    },
  ],
};
