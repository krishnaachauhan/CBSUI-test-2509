import { isValid } from "date-fns";

export const DateRetrievalMetadata = {
  form: {
    name: "dateRetrievalparameters",
    label: "enterRetrivalPara",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      datePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "datePicker" },
      name: "FROM_DATE",
      label: "fromDate",
      placeholder: "DD/MM/YYYY",
      isFieldFocused: true,
      required: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateIsRequired"] }],
      },
    },
    {
      render: { componentType: "datePicker" },
      name: "TO_DATE",
      label: "toDate",
      placeholder: "DD/MM/YYYY",
      dependentFields: ["FROM_DATE"],
      required: true,
      runValidationOnDependentFieldsChange: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateIsRequired"] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DATE?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
    },
  ],
};
