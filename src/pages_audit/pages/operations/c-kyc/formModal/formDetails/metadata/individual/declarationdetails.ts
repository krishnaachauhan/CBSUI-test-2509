import { isValid } from "date-fns";
import * as API from "../../../../api";
import { utilFunction } from "@acuteinfo/common-base";

export const declaration_meta_data = {
  form: {
    name: "declaration_details_form",
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
        componentType: "divider",
        sequence: 1,
      },
      name: "FATCACRSDetailsDivider",
      label: "FATCACRSDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "FATCA_DEC_RECVD",
      label: "DeclarationReceived",
      placeholder: "DeclarationReceived",
      isFieldFocused: true,
      validationRun: "all",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      defaultValue: "N",
      options: [
        { label: "FOR FATCA", value: "Y" },
        { label: "FOR CRS", value: "C" },
        { label: "NO", value: "N" },
      ],
      postValidationSetCrossFieldValues: (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value !== "N") {
          return {
            FATCA_DT: {
              value: utilFunction.getParsedDate(authState?.workingDate ?? ""),
              ignoreUpdate: false,
              isFieldFocused: true,
            },
          };
        } else {
          return {
            FATCA_DT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: true,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FATCA_DT",
      label: "DeclarationReceivedDate",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "US_GIIN",
      label: "GIIN",
      placeholder: "GIIN",
      maxLength: 21,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 21) {
            return false;
          }
          return true;
        },
      },
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DATE_OF_COMMENCEMENT",
      label: "DateOfIncorporation",
      placeholder: "DateOfIncorporation",
      // type: "datePicker",
      validate: (value, dependent, formState) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        if (formState?.state?.entityTypectx === "C" && !Boolean(value?.value)) {
          return "DateOfIncorporationIsRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PLACE_OF_INCORPORATION",
      label: "PlaceOfIncorporation",
      placeholder: "PlaceOfIncorporation",
      type: "text",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue, allField, flag) => {
        if (
          flag?.state?.entityTypectx === "C" &&
          !Boolean(columnValue?.value)
        ) {
          return "PlaceOfIncorporationIsRequired";
        }
        return "";
      },
      maxLength: 20,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 20) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TIN",
      label: "TIN",
      placeholder: "TIN",
      maxLength: 20,
      dependentFields: ["TIN_ISSUING_COUNTRY"],
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 20) {
            return false;
          }
          return true;
        },
      },
      // required: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      runValidationOnDependentFieldsChange: true,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COUNTRY_OF_INCORPORATION",
      label: "CountryOfIncorporation",
      options: (dependentValue, formState, _, authState) =>
        API.getCountryOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "CountriesOfIncorporation",
      placeholder: "CountryOfIncorporation",
      validate: (columnValue, allField, flag) => {
        if (
          flag?.state?.entityTypectx === "C" &&
          !Boolean(columnValue?.value)
        ) {
          return "CountryOfIncorporationIsRequired";
        }
        return "";
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TIN_ISSUING_COUNTRY",
      label: "TINIssuingCountry",
      options: (dependentValue, formState, _, authState) =>
        API.getCountryOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "TINIssuingCountries",
      placeholder: "TINIssuingCountry",
      dependentFields: ["TIN"],
      // validate: (columnValue, allField, flag) => {
      //   const TIN = allField?.TIN?.value;
      //   const GSTIN = flag?.GSTIN;
      //   if (!Boolean(columnValue?.value)) {
      //     if (Boolean(TIN) || Boolean(GSTIN)) {
      //       return "ThisFieldisrequired";
      //     } else {
      //       return "";
      //     }
      //   } else {
      //     return "";
      //   }
      // },
      // runValidationOnDependentFieldsChange: true,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};
