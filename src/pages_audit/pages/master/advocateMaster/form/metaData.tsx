import { isValid } from "date-fns";
import { t } from "i18next";

export const AdvocateMstFormMetaData = {
  form: {
    name: "advocateMaster",
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
      phoneNumberOptional: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "CODE",
      label: "Code",
      placeholder: "EnterCode",
      type: "text",
      required: true,
      maxLength: 4,
      autoComplete: "off",
      isFieldFocused: true,
      __EDIT__: { isReadOnly: true },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      validate: (columnValue, ...rest) => {
        let regex = /^[^~`!@#$%^&*()\-+_=\\"';:?/<>,.{}[\]|]+$/;
        if (columnValue.value && !regex.test(columnValue.value)) {
          return `${t(`SpecialCharacterNotAllowed`)}`;
        }
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
      GridProps: { xs: 12, sm: 2, md: 1.5, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "AdvocateName",
      placeholder: "EnterAdvocateName",
      type: "text",
      autoComplete: "off",
      required: true,
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AdvocateNameisrequired"] }],
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
      GridProps: { xs: 12, sm: 10, md: 7.5, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "phoneNumberOptional",
      },
      name: "CONTACT1",
      label: "MobileNo",
      placeholder: "EnterMobileNo",
      required: true,
      maxLength: 10,
      fullWidth: true,
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["MobileNoisRequired"] }],
      },
      validate: (columnValue, allField, flag) => {
        if (columnValue.value.length <= 9) {
          return "MobileNumberValidation";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "Address",
      placeholder: "EnterAddress",
      autoComplete: "off",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 9, md: 12, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "EMAIL",
      label: "EmailID",
      placeholder: "EnterEmailID",
      type: "text",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 200,
      validate: (columnValue, allField, flag) => {
        let emailRegex =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (columnValue.value && !emailRegex.test(columnValue.value)) {
          return "Please enter valid Email ID";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 8, xl: 8 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "STATUS",
      label: "Inactive",
      defaultValue: false,
      dependentFields: ["INACTIVE_DATE"],
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (Boolean(currentField?.value)) {
          return {
            INACTIVE_DATE: {
              value: authState?.workingDate ?? "",
            },
          };
        } else {
          return {
            INACTIVE_DATE: {
              value: "",
            },
          };
        }
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 1.5, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INACTIVE_DATE",
      label: "Inactive Date",
      dependentFields: ["STATUS"],
      __NEW__: {
        validate: (currentField, dependentField) => {
          if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
            return t("Mustbeavaliddate");
          }
        },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (Boolean(dependentFields?.STATUS?.value)) {
            return false;
          } else {
            return true;
          }
        },
      },
      __EDIT__: { isReadOnly: true },
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 2.5, xl: 2 },
    },
  ],
};
