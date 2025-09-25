import { isValid } from "date-fns";
import {
  getMachineryDtlDefaultDW,
  getPropertyDistrictDDW,
  getPropertyStateDDW,
} from "../api";
import { getPMISCData } from "../api";
import { utilFunction } from "@acuteinfo/common-base";

export const PropertyMetadata = {
  form: {
    name: "PropertyMetadata",
    label: "Mortgage Detail",
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
        componentType: "textField",
      },
      name: "CITY_SURVEY_NO",
      label: "CitySurveyNo",
      placeholder: "EnterCitySurveyNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FINAL_PLOT_NO",
      label: "FinalPlotNo",
      placeholder: "EnterFinalPlotNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TP_SKIM_NO",
      label: "TPSchemeNo",
      placeholder: "EnterTPSchemeNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SUB_PLOT_NO",
      label: "SubPlotNo",
      placeholder: "EnterSubPlotNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REVENUE_SURVEY_NO",
      label: "RevenueSurveyNo",
      placeholder: "EnterRevenueSurveyNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SQUARE_FOOT",
      label: "SquareFoot",
      placeholder: "EnterSquareFoot",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BUILDING_SQUARE_FOOT",
      label: "BuildingSquareFoot",
      placeholder: "EnterBuildingSquareFoot",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PLOT_SQUARE_FOOT",
      label: "PlotSquareFoot",
      placeholder: "EnterPlotSquareFoot",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UN_SPREAD_AREA_SQRFT",
      label: "UnSpreadAreaSqrft",
      placeholder: "EnterUnSpreadAreaSqrft",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RECEIPT_NO",
      label: "PropertyUnderBankLiability",
      placeholder: "SelectPropertyUnderBankLiability",
      type: "text",
      options: getMachineryDtlDefaultDW,
      _optionsKey: "getMachineryDtlDefaultDW",
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "CERSAIDetails",
      name: "CERSAIDetails_ignoreField",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "REGISTRATION",
      label: "Registration",
      placeholder: "EnterRegistration",
      defaultValue: false,
      GridProps: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CERSAI_REGI_DT",
      label: "RegistrDate",
      placeholder: "DD/MM/YYYY",
      type: "text",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      dependentFields: ["REGISTRATION"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(dependentFields?.REGISTRATION?.value)) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CERSAI_REGI_NO_1",
      label: "RegNo",
      placeholder: "EnterRegNo",
      type: "text",
      maxLength: 100,
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      dependentFields: ["REGISTRATION"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(dependentFields?.REGISTRATION?.value)) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 6, md: 5, lg: 5, xl: 5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TITLE_DOC_NO",
      label: "TitleDocumentNo",
      placeholder: "EnterTitleDocumentNo",
      type: "text",
      maxLength: 200,
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SUB_REGISTER",
      label: "SubRegister",
      placeholder: "EnterSubRegister",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DIST_CD",
      label: "District",
      placeholder: "SelectDistrict",
      type: "text",
      options: (dependentValue, formState, _, authState) => {
        return getPropertyDistrictDDW({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
        });
      },
      _optionsKey: "getPropertyDistrict",
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "STATE_CD",
      label: "State",
      placeholder: "SelectState",
      type: "text",
      options: (dependentValue, formState, _, authState) => {
        return getPropertyStateDDW({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
        });
      },
      _optionsKey: "getPropertyState",
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "PIN_CODE",
      label: "PINCode",
      maxLength: 6,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      placeholder: "EnterPINCode",
      type: "text",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEALER_NAME",
      label: "DealerName",
      placeholder: "EnterDealerName",
      type: "text",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 12, md: 4, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DOCUMENT_TYPE",
      label: "DocumentType",
      placeholder: "SelectDocumentType",
      type: "text",
      options: (dependentValue) => getPMISCData("CERSAI_DOC_TYPE"),
      _optionsKey: "getPropertDocumentType",
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PROPERTY_TYPE",
      label: "PropertyType",
      placeholder: "SelectPropertyType",
      type: "text",
      options: (dependentValue) => getPMISCData("CERSAI_PROPERTY"),
      _optionsKey: "getPropertPropertyType",
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COST_AMT",
      label: "CostAmount",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          return true;
        },
      },
      runPostValidationHookAlways: true,
      dependentFields: ["MARGIN", "ELIGIBLE_VALUE"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          const costAmount = parseFloat(currentField?.value) || 0;
          const margin = parseFloat(dependentFieldValues?.MARGIN?.value) || 0;
          const netCost = costAmount - (costAmount * margin) / 100;
          return {
            ELIGIBLE_VALUE: {
              value: netCost,
            },
          };
        } else if (!currentField?.value) {
          return {
            ELIGIBLE_VALUE: {
              value: "",
              isFieldFocused: false,
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "MARGIN",
      label: "Margin",
      autoComplete: "off",
      fullWidth: true,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.floatValue > 100) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["COST_AMT", "ELIGIBLE_VALUE"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (Boolean(currentField?.value)) {
          const costAmount =
            parseFloat(dependentFieldValues?.COST_AMT?.value) || 0;
          const margin = parseFloat(currentField?.value) || 0;
          const netCost = costAmount - (costAmount * margin) / 100;
          return {
            ELIGIBLE_VALUE: {
              value: netCost,
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "ELIGIBLE_VALUE",
      label: "NetCost",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["COST_AMT"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value && dependentFieldValues?.COST_AMT?.value) {
          const netCost = parseFloat(currentField?.value) || 0;
          const costAmount =
            parseFloat(dependentFieldValues?.COST_AMT?.value) || 0;
          if (netCost > costAmount) {
            const buttonName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EligibleValueCannotBeMoreThanCostAmount",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                ELIGIBLE_VALUE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
  ],
};
