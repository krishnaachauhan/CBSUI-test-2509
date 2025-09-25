import { t } from "i18next";
import * as API from "../api";

export const ActionTakenMasterFormMetaData = {
  form: {
    name: "actionTakenMaster",
    label: "",
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
      autocomplete: {
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
      name: "ACTION_TAKEN_CD",
      label: "Code",
      placeholder: "EnterCode",
      type: "text",
      maxLength: 4,
      autoComplete: "off",
      isFieldFocused: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
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
      GridProps: { xs: 12, sm: 4, md: 2, lg: 1.5, xl: 1.5 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "Description",
      placeholder: "EnterDescription",
      maxLength: 100,
      type: "text",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue, ...rest) => {
        const gridData = rest[1]?.gridData;
        const accessor: any = columnValue.fieldKey.split("/").pop();
        const fieldValue = columnValue.value?.trim().toLowerCase();
        const rowColumnValue = rest[1]?.rows?.[accessor]?.trim().toLowerCase();

        if (Boolean(columnValue?.value?.trim())) {
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
        }
        return "";
      },
      GridProps: { xs: 12, sm: 8, md: 4, lg: 4.5, xl: 4.5 },
    },

    {
      render: { componentType: "autocomplete" },
      name: "SUIT_FILED_STATUS_CD",
      label: "A4SuitFileStatusCode",
      placeholder: "SelectA4SuitFileStatusCode",
      options: API.getSuitFldStdMstData,
      _optionsKey: "getSuitFldStdMstData",
      __NEW__: { defaultValue: "A " },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4.5, xl: 4.5 },
    },

    {
      render: { componentType: "checkbox" },
      name: "LEGAL_PROCESS",
      label: "LegalProcess",
      defaultValue: false,
      GridProps: { xs: 12, sm: 6, md: 2, lg: 1.5, xl: 1.5 },
    },
  ],
};
