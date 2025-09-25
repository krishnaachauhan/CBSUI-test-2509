// import { GetMiscValue } from "../../staticReports/api";

import { isValid } from "date-fns/esm";
import { t } from "i18next";

export const chequeBKRetrievalMetadata = {
  form: {
    name: "retrieve-para",
    label: "RetrieveParameters",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DATE",
      label: "FromDate",
      placeholder: "",
      // defaultValue: new Date(),
      isWorkingDate: true,
      isFieldFocused: true,
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: {
        xs: 12,
        md: 6,
        sm: 6,
      },
      onFocus: (date) => {
        date.target.select();
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return t("Mustbeavaliddate");
        }
        return "";
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DATE",
      label: "ToDate",
      placeholder: "",
      // defaultValue: new Date(),
      isWorkingDate: true,
      fullWidth: true,
      format: "dd/MM/yyyy",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return t("Mustbeavaliddate");
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DATE?.value)
        ) {
          return t("ToDateshouldbegreaterthanorequaltoFromDate");
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["FROM_DATE"],
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 12,
        md: 6,
        sm: 6,
      },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "FLAG",
      shouldExclude: (fieldData) => {
        if (fieldData?.value === "B" || fieldData?.value === "A") {
          return false;
        } else {
          return true;
        }
      },
      label: "Retrieve",
      RadioGroupProps: { row: true },
      defaultValue: "B",
      options: [
        { label: "BeforeChequeBookPrinting", value: "B" },
        { label: "AfterChequeBookPrinting", value: "A" },
      ],
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
  ],
};
