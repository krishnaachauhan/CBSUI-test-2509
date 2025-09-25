import { t } from "i18next";
import { recoverIdDropDown } from "../api";

export const NpaCategoryMasterFormMetadata = {
  form: {
    name: "npaCategoryMaster",
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
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
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
      Divider: {
        fullWidth: true,
      },
      rateOfIntWithoutValidation: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "NPA_CD",
      label: "Code",
      required: true,
      maxLength: 4,
      placeholder: "EnterCode",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      __EDIT__: { isReadOnly: true },
      __NEW__: { isFieldFocused: true },

      validate: (columnValue, ...rest) => {
        // Duplication validation

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
      GridProps: {
        xs: 12,
        sm: 6,
        md: 1.7,
        lg: 1.7,
        xl: 1.7,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "NPA_CD_PARENT",
      label: "Parent",
      placeholder: "SelectParent",
      __EDIT__: { isReadOnly: true },
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
      },
      options: [
        { label: "01 STANDARD", value: "01  " },
        { label: "02 SUB-STANDARD", value: "02  " },
        { label: "03 DOUBTFUL", value: "03  " },
        { label: "04 LOSS", value: "04  " },
      ],
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ParentRequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 2.3,
        lg: 2.3,
        xl: 2.3,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Name",
      required: true,
      maxLength: 100,
      placeholder: "EnterName",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      __EDIT__: { isFieldFocused: true },
      validate: (columnValue, ...rest) => {
        // Duplication validation

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
        rules: [{ name: "required", params: ["Nameisrequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "ASSET_CLS_CD",
      label: "AssetClassificationCode",
      placeholder: "SelectAssetClassification",
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
      },
      options: [
        { label: "A STANDARD", value: "A" },
        { label: "B SUB-STANDARD", value: "B" },
        { label: "C DOUTFUL", value: "C" },
        { label: "D LOSS", value: "D" },
        { label: "E SPECIAL MENTION", value: "E" },
      ],
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PENAL_ON_OD_OS",
      label: "CalculatePenalInterestOn",
      placeholder: "SelectCalculatePenal",
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
      },
      defaultValue: "D",
      options: [
        { label: "Overdue Amount", value: "D" },
        { label: "Outstanding Amount", value: "S" },
      ],
      GridProps: {
        xs: 12,
        sm: 6,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "SECURE_PROV_PERC",
      label: "ProvisionSecureRate",
      placeholder: "EnterSecureRate",
      defaultValue: "0",
      fullWidth: true,
      maxPercent: 999.99,
      FormatProps: {
        allowNegative: false,
        isAllowed: ({ floatValue, value, formattedValue }) =>
          value === "" || (!/^00/.test(value) && (floatValue ?? 0) <= 999.99),

        onBlur: (event) => {
          const { value } = event.target;
          if (value === "") {
            event.target.value = "0.00";
          }
        },
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "UNSECURE_PROV_PERC",
      label: "ProvisionUnSecureRate",
      placeholder: "EnterUnSecureRate",
      maxPercent: 999.99,
      defaultValue: "0",
      fullWidth: true,
      FormatProps: {
        allowNegative: false,
        isAllowed: ({ floatValue, value, formattedValue }) =>
          value === "" || (!/^00/.test(value) && (floatValue ?? 0) <= 999.99),
        onBlur: (event) => {
          const { value } = event.target;
          if (value === "") {
            event.target.value = "0.00";
          }
        },
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CONFIG_ID",
      label: "RecoveryID",
      placeholder: "SelectRecoveryID",
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
      },
      options: recoverIdDropDown,
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
  ],
};
