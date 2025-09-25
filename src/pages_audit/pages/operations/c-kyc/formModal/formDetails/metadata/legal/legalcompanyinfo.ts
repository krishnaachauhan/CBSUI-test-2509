import { isValid } from "date-fns";
import * as API from "../../../../api";
import { greaterThanDate } from "@acuteinfo/common-base";
import { t } from "i18next";
import { PREVENT_SPECIAL_CHAR } from "components/utilFunction/constant";

export const company_info_meta_data = (unique) => {
  return {
    form: {
      name: "company-info-kyc-details-form",
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
        divider: {
          fullWidth: true,
        },
      },
    },
    fields: [
      {
        render: {
          componentType: "datePicker",
        },
        name: "COMMENCEMENT_DT",
        label: "CommencementDate",
        placeholder: "CommencementDate",
        isFieldFocused: Boolean(unique?.entityTypectx === "C"),
        isMaxWorkingDate: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(currentField?.value)) {
            if (!isValid(currentField?.value)) {
              await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                COMMENCEMENT_DT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            } else if (
              greaterThanDate(
                new Date(currentField.value),
                new Date(authState?.workingDate),
                {
                  ignoreTime: true,
                }
              )
            ) {
              await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("CommencementDateCantBeGreaterThanTodaysDate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              return {
                COMMENCEMENT_DT: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
          return {};
        },
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "COMPANY_TYPE",
        label: "Type",
        options: (dependentValue, formState, _, authState) =>
          API.CompanyTypeOP(authState?.companyID),
        _optionsKey: "companyTypeOP",
        placeholder: "Type",
        defaultOptionLabel: "Type",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COMP_REG_NO",
        label: "RegNo",
        maxLength: 50,
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        placeholder: "RegNo",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COMP_SALES_TAX_NO",
        label: "SalesTaxNo",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        maxLength: 50,
        placeholder: "SalesTaxNo",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COMP_EXCISE_NO",
        label: "ExciseNo",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        maxLength: 50,
        placeholder: "ExciseNo",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COMP_IT_NO",
        label: "ITNo",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        maxLength: 50,
        placeholder: "ITNo",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COMP_TAN_NO",
        label: "TANNo",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        maxLength: 50,
        placeholder: "TANNo",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "COMP_CIN_NO",
        label: "CINNo",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        maxLength: 50,
        placeholder: "CINNo",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "LIQUIDATION_DT",
        label: "DateOfLiquidation",
        validate: (value) => {
          if (Boolean(value?.value) && !isValid(value?.value)) {
            return "Mustbeavaliddate";
          }
          return "";
        },
        placeholder: "DateOfLiquidation",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "WEBSITE_DTL",
        label: "Website",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        maxLength: 100,
        placeholder: "Website",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "COMPANY_SIZE",
        label: "Size",
        options: () => API.getPMISCData("CST_COMP_SZ"),
        _optionsKey: "getCompSizedtl",
        placeholder: "SelectSize",
        defaultOptionLabel: "Size",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "CEO_NAME",
        label: "CEOName",
        maxLength: 100,
        placeholder: "CEOName",
        type: "text",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue, allField, flag) => {
          if (!/^[a-zA-Z0-9_ ]*$/.test(columnValue?.value)) {
            return "SpecialCharactersAreNotAllowed";
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "STAFF_STRENGTH",
        label: "StaffStrength",
        maxLength: 10,
        placeholder: "StaffStrength",
        textFieldStyle: {
          "& .MuiInputBase-input": {
            textAlign: "right",
          },
        },
        FormatProps: {
          allowNegative: false,
          decimalScale: 0,
          isAllowed: (values) => {
            return !Boolean(
              values.value.startsWith("0") || values?.value?.length > 10
            );
          },
        },

        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "CIBIL_SCORE",
        label: "CIBILMSMERank",
        placeholder: "CIBILMSMERank",
        maxLength: 3,
        textFieldStyle: {
          "& .MuiInputBase-input": {
            textAlign: "right",
          },
        },
        FormatProps: {
          allowNegative: true,
          decimalScale: 0,
          allowLeadingZeros: false,
          isAllowed: (values) => {
            if (values?.value?.length > 3) {
              return false;
            }
            if (values.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          currentField,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value < 0 || field?.value > 10) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "HOBranchValidMessageTitle",
              message: "CIBILMSMEShouldBeBetween0To10",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                CIBIL_SCORE: {
                  value: "",
                  isFieldFocused: true,
                },
              };
            }
          }
        },
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },

      {
        render: {
          componentType: "textField",
        },
        name: "SPECIALIZATION_REMARKS",
        label: "Specialization",
        placeholder: "Specialization",
        maxLength: 100,
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "select",
        },
        name: "REL_PARTY_TRANS",
        label: "RelatedPartyTrans",
        defaultOptionLabel: "SelectRelatedPartyTrans",
        options: [
          { label: "YES", value: "Y" },
          { label: "NO", value: "N" },
        ],
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
    ],
  };
};
