import { isValid } from "date-fns";

export const retrieveFormMetaData = {
  form: {
    name: "atm-retrieve-cfm-metadata",
    label: "RetrieveInformation",
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
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "spacer",
      },
      dependentFields: ["A_RET_FLAG"],
      name: "SPACER",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return dependentFieldsValues?.A_RET_FLAG?.value === "A" ? true : false;
      },
      GridProps: {
        xs: 3,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "GeneralFromDate",
      isFieldFocused: true,
      fullWidth: true,
      isWorkingDate: true,
      placeholder: "DD/MM/YYYY",
      format: "dd/MM/yyyy",
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired."] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["A_RET_FLAG"],
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "GeneralToDate",
      fullWidth: true,
      isWorkingDate: true,
      placeholder: "DD/MM/YYYY",
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateRequired"] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["FROM_DT", "A_RET_FLAG"],
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACERS",
      dependentFields: ["A_RET_FLAG"],

      GridProps: {
        xs: 0.5,
        md: 0.5,
        sm: 0.5,
        lg: 0.5,
        xl: 0.5,
      },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      // endsIcon: "YoutubeSearchedFor",
      // rotateIcon: "scale(1.5)",
      dependentFields: ["A_RET_FLAG", "ACCT_CD"],
      isReadOnly: (fieldData, dependentFields, formState) => {
        return false;
      },
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "VIEW_ALL",
      label: "View All",
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },
  ],
};
