import { getProMiscData } from "pages_audit/pages/configuration/dynamicGridConfig/api";

export const searchAccountDataFormMetaData = {
  form: {
    name: "searchAccountDataForm", //Please do not change this name, as there is a condition based on it in the TSX file.
    label: " ",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    // allowColumnHiding: true,
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
        componentType: "autocomplete",
      },
      name: "COL_NM",
      label: "Search",
      defaultValue: "ACCT_NM",
      options: () => getProMiscData("F5SEARCHFIELD"),
      _optionsKey: "getProMiscData-F5SEARCHFIELD",
      fullWidth: true,
      defaultOptionLabel: "Select Search",
      required: true,
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (_, formState) => {
        if (formState?.isSubmitting) return {};
        return {
          COL_VAL: { value: "" },
        };
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COL_VAL",
      label: "Name",
      autoComplete: "off",
      required: true,
      dependentFields: ["COL_NM"],
      //@ts-ignore
      isFieldFocused: true,
      setFieldLabel(dependentFieldsValues) {
        const label =
          dependentFieldsValues["COL_NM"]?.optionData?.[0]?.label ?? "Name";
        return {
          label: label,
          placeholder: "Enter" + label,
        };
      },
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_TYPE",
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "SEARCH",
      label: "Search",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      ignoreInSubmit: true,
      type: "text",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 1,
        lg: 1,
        xl: 1,
      },
    },
  ],
};
