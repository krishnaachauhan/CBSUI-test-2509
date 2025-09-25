import { utilFunction } from "@acuteinfo/common-base";
import { addDays, addMonths, addYears, format, isValid } from "date-fns";

export const LetterOfContinuityBtnMetadata = {
  form: {
    name: "LetterOfContinuityBtnMetadata",
    label: "Letter of Continuity Detail",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LETTER_DP_FLAG",
      label: "EntryType",
      options: [
        { label: "Letter of Continuity", value: "L" },
        { label: "D.P.Note", value: "D" },
      ],
      _optionsKey: "EntryTypeOpt",
      placeholder: "SelectEntryType",
      type: "text",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentValue
      ) => {
        if (formState?.isSubmitting) return {};
        if (Boolean(currentField?.value) && currentField?.value === "L") {
          return {
            DOC_VALUE: {
              value: "",
              ignoreUpdate: true,
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LETTER_DP_DISP",
      dependentFields: ["LETTER_DP_FLAG"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        console.log("dependentFields: ", dependentFields);
        return dependentFields?.LETTER_DP_FLAG?.optionData?.[0]?.label
          ? String(dependentFields?.LETTER_DP_FLAG?.optionData?.[0]?.label)
          : "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LC_START_DT",
      label: "Start Date",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Start Date is required."] }],
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LC_PERIOD_CD",
      label: "Period Code",
      options: [
        { label: "Day(s)", value: "D" },
        { label: "Month(s)", value: "M" },
        { label: "Year(s)", value: "Y" },
      ],
      _optionsKey: "PeriodLetterOfCntOpt",
      placeholder: "SelectPeriod",
      type: "text",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Period Code is required."] }],
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "LC_PERIOD_NO",
      label: "Period", // change according to condition
      placeholder: "Enter Day(s)", // change according to condition
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          return true;
        },
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Period is required."] }],
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "LC_DUE_DT",
      label: "DueDate",
      placeholder: "DD/MM/YYYY",
      isReadOnly: true,
      dependentFields: ["LC_START_DT", "LC_PERIOD_CD", "LC_PERIOD_NO"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let duration = dependentFields.LC_PERIOD_CD?.value;
        let periodNumber = parseInt(dependentFields.LC_PERIOD_NO?.value, 10);
        let tranDateValue = dependentFields?.LC_START_DT?.value;
        let newDate = "";

        if (
          utilFunction.isValidDate(utilFunction.getParsedDate(tranDateValue))
        ) {
          const tranDate = new Date(tranDateValue);

          if (utilFunction.isValidDate(utilFunction.getParsedDate(tranDate))) {
            let manipulatedDate;

            switch (duration) {
              case "D":
                manipulatedDate = addDays(tranDate, periodNumber);
                break;
              case "M":
                manipulatedDate = addMonths(tranDate, periodNumber);
                break;
              case "Y":
                manipulatedDate = addYears(tranDate, periodNumber);
                break;
              default:
                break;
            }
            if (
              utilFunction.isValidDate(
                utilFunction.getParsedDate(manipulatedDate)
              )
            ) {
              newDate = Boolean(manipulatedDate)
                ? format(
                    utilFunction.getParsedDate(manipulatedDate),
                    "dd/MMM/yyyy"
                  )
                : "";
            }
          }
        }
        if (utilFunction.isValidDate(utilFunction.getParsedDate(newDate))) {
          return newDate;
        } else return "";
      },

      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "DOC_VALUE",
      label: "NetCost",
      type: "text",
      autoComplete: "off",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["LETTER_DP_FLAG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.LETTER_DP_FLAG?.value === "D") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
  ],
};
