import { t } from "i18next";
import { getPMISCData } from "../api";
export const InsuTypeMasterFormMetadata = {
  form: {
    name: "insuranceTypeMaster",
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
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "INSURANCE_TYPE_CD",
      label: "Code",
      required: true,
      maxLength: 4,
      placeholder: "EnterCode",
      txtTransform: "uppercase",
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
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Description",
      required: true,
      maxLength: 75,
      placeholder: "EnterDescription",
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
        rules: [{ name: "required", params: ["DescriptionisRequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECURITY_TYPE",
      label: "SecurityType",
      defaultOptionLabel: "SelectSecurityType",
      options: getPMISCData,
      _optionsKey: "getInsuSecureType",
      defaultValue: "BCC",
      __VIEW__: {
        SelectProps: { IconComponent: () => null },
      },
      GridProps: {
        xs: 12,
        sm: 12,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },
  ],
};
