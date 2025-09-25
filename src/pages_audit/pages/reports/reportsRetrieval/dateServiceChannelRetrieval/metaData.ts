import { faHeartPulse } from "@fortawesome/free-solid-svg-icons";
import { isValid } from "date-fns/esm";
import { t } from "i18next";

export const dateServiceChannelRetrievalMetadata = {
  form: {
    name: "enterRetrievalParamaters",
    label: "EnterRetrievalParameter",
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
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "FromDates",
      placeholder: "",
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      // __EDIT__: { isReadOnly: true },
      GridProps: {
        xs: 8,
        md: 6,
        sm: 6,
      },
      onFocus: (date) => {
        date.target.select();
      },
      required: true,
      dependentFields: ["RETRIVALTYPE"],
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
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATEWITHBRANCH" ||
          dependentFieldsValues?.RETRIVALTYPE?.value ===
            "ASONDATEWITHACCTTYPE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATESERVICE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT" ||
          dependentFieldsValues?.RETRIVALTYPE?.value ===
            "GLPLCLOSINGREGISTER" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "CREDITBALANCEREPORT"
        ) {
          return true;
        } else {
          return false;
        }
      },
      isFieldFocused: true,
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "ToDates",
      placeholder: "",
      format: "dd/MM/yyyy",
      defaultValue: new Date(),
      dependentFields: ["RETRIVALTYPE", "FROM_DT"],
      fullWidth: true,
      required: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATEWITHBRANCH" ||
          dependentFieldsValues?.RETRIVALTYPE?.value ===
            "ASONDATEWITHACCTTYPE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATESERVICE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT" ||
          dependentFieldsValues?.RETRIVALTYPE?.value ===
            "GLPLCLOSINGREGISTER" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "CREDITBALANCEREPORT"
        ) {
          return true;
        } else {
          return false;
        }
      },
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
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return t("ToDateshouldbegreaterthanorequaltoFromDate");
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 8,
        md: 6,
        sm: 6,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RETRIVALTYPE",
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "AS_ON_DT",
      label: "As on Date",
      placeholder: "",
      format: "dd/MM/yyyy",
      defaultValue: new Date(),
      dependentFields: ["RETRIVALTYPE", "FROM_DT"],
      fullWidth: true,
      required: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATEWITHBRANCH" ||
          dependentFieldsValues?.RETRIVALTYPE?.value ===
            "ASONDATEWITHACCTTYPE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "ASONDATESERVICE" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT" ||
          dependentFieldsValues?.RETRIVALTYPE?.value ===
            "GLPLCLOSINGREGISTER" ||
          dependentFieldsValues?.RETRIVALTYPE?.value === "CREDITBALANCEREPORT"
        ) {
          return false;
        } else {
          return true;
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },

      onFocus: (date) => {
        date.target.select();
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 8,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "SANCTIONED_LIMIT",
      label: "Sanctioned Limit",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "CREDITBALANCEREPORT"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "WITHOUT_INTEREST",
      label: "Without Int.",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "CREDITBALANCEREPORT"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "DBMR_BALANCE",
      label: "DBNR Balance",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "IR_BALANCE",
      label: "IR Balance",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "INTEREST_DETAIL",
      label: "Interest Detail",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "GENDER_DETAIL",
      label: "Gender Detail",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "ADDRESS",
      label: "Address",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "OPENING_DETAIL",
      label: "Opening Detail",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "DRAWING_POWER",
      label: "Drawing Power",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },

    {
      render: {
        componentType: "checkbox",
      },
      name: "SANCTION_DT",
      label: "Sanction Date",
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, md: 2, sm: 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "EXPIRY_DT",
      label: "Expiry Date",
      GridProps: { xs: 2, md: 2, sm: 2 },
      dependentFields: ["RETRIVALTYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "LIMIT",
      dependentFields: ["RETRIVALTYPE"],
      label: "Limit",
      defaultValue: "S",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "Sanction",
          value: "S",
        },
        {
          label: "Active",
          value: "A",
        },
      ],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.RETRIVALTYPE?.value === "BALANCEREPORT") {
          return false;
        } else {
          return true;
        }
      },

      GridProps: { xs: 6, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "LIMIT_GLPL",
      dependentFields: ["RETRIVALTYPE"],
      label: "Limit",
      defaultValue: "S",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "Summary",
          value: "S",
        },
        {
          label: "Detal",
          value: "D",
        },
      ],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "GLPLCLOSINGREGISTER"
        ) {
          return false;
        } else {
          return true;
        }
      },

      GridProps: { xs: 6, sm: 12, md: 8, lg: 5, xl: 5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NO_OF_DAYS",
      dependentFields: ["RETRIVALTYPE"],
      label: "No. Of Days",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.RETRIVALTYPE?.value === "GLPLCLOSINGREGISTER"
        ) {
          return false;
        } else {
          return true;
        }
      },

      GridProps: { xs: 6, sm: 12, md: 2, lg: 2, xl: 2 },
    },
  ],
};
