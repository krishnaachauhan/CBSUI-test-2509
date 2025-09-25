import { greaterThanDate, lessThanInclusiveDate } from "@acuteinfo/common-base";
import * as API from "../../../../api";
import { isValid } from "date-fns";
import { t } from "i18next";

const checkResidenceStatus = (formState, currentFieldVal, message) => {
  const resStatus = {
    ...formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL,
    ...formState?.state?.updatedReq?.PERSONAL_DETAIL_OD,
  }?.RESIDENCE_STATUS;
  if ((resStatus === "02" || resStatus === "03") && !currentFieldVal?.value) {
    return message;
  }
};

export const nri_detail_meta_data = {
  form: {
    name: "nri_details_form",
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
        componentType: "textField",
      },
      name: "VISA_DETAIL",
      label: "VisaDetails",
      placeholder: "VisaDetails",
      maxLength: 50,
      type: "text",
      txtTransform: "uppercase",
      required: true,
      isFieldFocused: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "VisaDetailsIsRequired"
          ) || ""
        );
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "VISA_ISSUE_BY",
      label: "VisaIssueBy",
      placeholder: "VisaIssueBy",
      maxLength: 50,
      type: "text",
      txtTransform: "uppercase",
      required: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "VisaIssueByIsRequired"
          ) || ""
        );
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "VISA_ISSUE_DT",
      label: "VisaIssueDate",
      placeholder: "VisaIssueDate",
      dependentFields: ["VISA_EXPIRY_DT"],
      isMaxWorkingDate: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "VisaIssueDateIsRequired"
          ) || ""
        );
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        const passportIssueDt = {
          ...formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL,
          ...formState?.state?.updatedReq?.PERSONAL_DETAIL_KYC_POI,
        }?.PASSPORT_ISSUE_DT;
        if (Boolean(currentField?.value)) {
          if (!isValid(currentField?.value)) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("Mustbeavaliddate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_ISSUE_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(
              new Date(currentField?.value),
              new Date(dependentFieldValues?.VISA_EXPIRY_DT?.value ?? ""),
              {
                ignoreTime: true,
              }
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("VisaIssueDatecantbeGreaterThanVisaExpiryDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_ISSUE_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (currentField?._maxDt) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("VisaIssueDateCantBeGreaterThanTodayssDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_ISSUE_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(
              new Date(passportIssueDt ?? ""),
              new Date(currentField?.value),
              {
                ignoreTime: true,
              }
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("VisaIssueDatecantbeLessThanPassportIssueDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_ISSUE_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
        }
        return {};
      },
      required: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "VISA_EXPIRY_DT",
      label: "VisaExpiryDate",
      required: true,
      isMinWorkingDate: true,
      dependentFields: ["VISA_ISSUE_DT"],
      placeholder: "VisaExpiryDate",
      validate: (currentField, dependentField, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "VisaExpiryDateIsRequired"
          ) || ""
        );
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (Boolean(currentField?.value)) {
          const passportExpiryDt = {
            ...formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL,
            ...formState?.state?.updatedReq?.PERSONAL_DETAIL_KYC_POI,
          }?.PASSPORT_EXPIRY_DT;
          if (!isValid(currentField?.value)) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("Mustbeavaliddate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_EXPIRY_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(
              new Date(dependentFieldValues?.VISA_ISSUE_DT?.value ?? ""),
              new Date(currentField?.value),
              {
                ignoreTime: true,
              }
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("VisaExpiryDatecantbeLessThanVisaIssueDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_EXPIRY_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            lessThanInclusiveDate(
              new Date(currentField?.value).setHours(0, 0, 0, 0),
              new Date(authState?.workingDate).setHours(0, 0, 0, 0)
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("VisaExpiryDateCantBeLessThanOrEqualToTodaysDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_EXPIRY_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(
              new Date(currentField?.value),
              new Date(passportExpiryDt ?? ""),
              {
                ignoreTime: true,
              }
            )
          ) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("VisaExpiryDatecantbeGreaterThanPassportExpiryDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              VISA_EXPIRY_DT: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
        }
        return {};
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DOMESTIC_RISK",
      label: "DomesticRisk",
      options: () => API.getPMISCData("DOMESTIC_RISK"),
      _optionsKey: "DomesticRiskTypes",
      placeholder: "DomesticRisk",
      type: "text",
      required: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "DomesticRiskIsRequired"
          ) || ""
        );
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COUNTRY_OF_RISK",
      label: "CountryOfRisk",
      options: (dependentValue, formState, _, authState) =>
        API.getCountryOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "CountryRiskTypes",
      placeholder: "CountryOfRisk",
      type: "text",
      required: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "CountryofRiskIsRequired"
          ) || ""
        );
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CROSS_BORDER_RISK",
      label: "CrossBorderRisk",
      options: () => API.getPMISCData("CROSS_BORDER"),
      _optionsKey: "CrossBorderRiskTypes",
      placeholder: "CrossBorderRisk",
      type: "text",
      required: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "CrossBorderRiskIsRequired"
          ) || ""
        );
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "VISUALLY_IMPAIRED",
      label: "VisuallyImpaired",
      placeholder: "VisuallyImpaired",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      required: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "VisuallyImpairedIsRequired"
          ) || ""
        );
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      name: "CUSTOMER_EVALUATION_FLAG",
      label: "CustomerEvaluationRequired",
      required: true,
      validate: (currentField, dependentFields, formState) => {
        return (
          checkResidenceStatus(
            formState,
            currentField,
            "CustomerEvaluationRequired"
          ) || ""
        );
      },
      placeholder: "CustomerEvaluationRequired",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      options: (dependentValue, formState, _, authState) =>
        API.getRelationshipManagerOptions(authState?.companyID),
      _optionsKey: "RelManager",
      name: "RELATIONSHIP_MANAGER",
      label: "RelationshipManager",
      placeholder: "RelManager",
      type: "text",
      GridProps: { xs: 12, sm: 6, md: 5, lg: 4, xl: 3 },
    },
  ],
};
