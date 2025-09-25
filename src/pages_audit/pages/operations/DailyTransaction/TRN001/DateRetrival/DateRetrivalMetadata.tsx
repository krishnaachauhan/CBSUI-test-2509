import { isValid } from "date-fns";

export const DateRetrievalFormMetaData = {
  form: {
    name: "retrievalParameters",
    label: "DateRetrievalParameters",
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
      datePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "fromDate",
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return formState?.reqData?.DISABLE_FROM_DT === "Y" ? true : false;
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "toDate",
      placeholder: "",
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      dependentFields: ["FROM_DT"],
      isFieldFocused: true,
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return formState?.reqData?.DISABLE_TO_DT === "Y" ? true : false;
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
