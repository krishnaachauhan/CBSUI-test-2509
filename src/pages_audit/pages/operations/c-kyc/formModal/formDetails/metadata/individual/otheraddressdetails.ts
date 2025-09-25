import { getCourtMasterArea } from "pages_audit/pages/master/courtmaster/api";
import * as API from "../../../../api";
import { PREVENT_SPECIAL_CHAR } from "components/utilFunction/constant";
import { t } from "i18next";

export const other_address_meta_data = {
  form: {
    name: "other_address_details_form",
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
        componentType: "arrayField",
      },
      name: "OTHER_ADDRESS",
      hideRemoveIconOnSingleRecord: false,
      removeRowFn: (formState, name, data, index) => {
        let maxSRCD =
          formState?.state?.retrieveFormDataApiRes["OTHER_ADDRESS"]?.reduce(
            (max, item) => {
              const srCdNum = parseInt(item.SR_CD, 10);
              return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
            },
            0
          ) ?? 0;

        if (
          data?.OTHER_ADDRESS?.[index]?.SR_CD <= maxSRCD &&
          data?.OTHER_ADDRESS?.[index]?.SR_CD !== ""
        ) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "divider",
          },
          name: "CurrentAddressDivider",
          label: "CurrentAddress",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "HIDE_CHECK",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONFIRMED",
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "ADDRESS_TYPE",
          label: "AddressType",
          placeholder: "AddressType",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
          options: () => API.getPMISCData("ADDRESS_TYPE"),
          _optionsKey: "currentAddType",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["AddressTypeIsRequired"] }],
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          dependentFields: ["HIDE_CHECK"],
          defaultValue: true,
          validationRun: "all",
          shouldExclude(fieldData, dependentFields) {
            return (
              !Boolean(fieldData?.value) ||
              !Boolean(dependentFields?.["OTHER_ADDRESS.HIDE_CHECK"]?.value)
            );
          },

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value === false) {
              const buttonName = await formState.MessageBox({
                messageTitle: "Confirmation",
                message: "RelatedPersonInActiveConfmMessage",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });

              return {
                ACTIVE: {
                  value: buttonName === "Yes" ? false : true,
                  ignoreUpdate: false,
                },
              };
            }
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 1.5, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADD1",
          label: "Line1",
          required: true,
          maxLength: 50,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Line1IsRequired"] }],
          },
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          inputProps: {
            onInput: (e) => {
              e.target.value = e.target.value.replace(/  +/g, " ");
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          validate: (columnValue) => API.validateAlphaNumValue(columnValue),
          placeholder: "Address1",
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 5, md: 3.2, lg: 3.2, xl: 3.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADD2",
          label: "Line2",
          placeholder: "Address2",
          maxLength: 50,
          type: "text",
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          inputProps: {
            onInput: (e) => {
              e.target.value = e.target.value.replace(/  +/g, " ");
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          validate: (columnValue) => API.validateAlphaNumValue(columnValue),
          GridProps: { xs: 12, sm: 5, md: 3.2, lg: 3.2, xl: 3.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADD3",
          label: "Line3",
          placeholder: "Address3",
          maxLength: 50,
          type: "text",
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          inputProps: {
            onInput: (e) => {
              e.target.value = e.target.value.replace(/  +/g, " ");
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          validate: (columnValue) => API.validateAlphaNumValue(columnValue),
          GridProps: { xs: 12, sm: 5, md: 3.2, lg: 3.2, xl: 3.3 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          runPostValidationHookAlways: false,
          name: "AREA_CD",
          label: "Area",
          enableVirtualized: true,
          options: getCourtMasterArea,
          _optionsKey: "indSubareaOp",
          postValidationSetCrossFieldValues: (
            field,
            formState,
            ___,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const currentdata = field?.optionData?.[0];
            return {
              PIN_CODE: {
                value: currentdata?.PIN_CODE ?? "",
              },
              CITY_CD: {
                value: currentdata?.CITY_CD ?? "",
              },
              CITY: {
                value: currentdata?.CITY_NM ?? "",
              },
              DISTRICT: {
                value: currentdata?.DIST_NM ?? "",
              },
              STATE: {
                value: currentdata?.STATE_NM ?? "",
              },
              COUNTRY: {
                value: currentdata?.COUNTRY_NM ?? "",
              },
              STATE_CD: {
                value: currentdata?.STATE_CD ?? "",
              },
              COUNTRY_CD: {
                value: currentdata?.COUNTRY_CD ?? "",
              },
            };
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          placeholder: "Area",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "PIN_CODE",
          label: "PinCode",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CITY",
          label: "City",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CITY_CD",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISTRICT",
          label: "DistrictName",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STATE",
          label: "State",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "COUNTRY",
          label: "Country",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STATE_CD",
          label: "UnionTerritoriesCode",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "COUNTRY_CD",
          label: "CountryCode",
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "divider",
          },
          name: "ContactDivider",
          label: "Contact",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT1",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT2",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT3",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT4",
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "STD_1",
          label: "PhoneO",
          placeholder: "countryCode",
          type: "text",
          maxLength: 5,
          GridProps: { xs: 12, sm: 4.5, md: 0.9, lg: 0.8, xl: 0.6 },
          FormatProps: {
            decimalScale: 0,
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values.value.includes(".")) return false;
              if (values?.value?.length > 5) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT1",
          label: "",
          placeholder: "EnterPhoneO",
          maxLength: 10,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 10) {
                return false;
              }
              return true;
            },
          },
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentField
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              CONTACT1: {
                value: currentField.value ?? "",
              },
            };
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "SPACER1",
          GridProps: {
            xs: 0,
            sm: 0.2,
            md: 0.1,
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "STD_4",
          label: "PhoneR",
          placeholder: "countryCode",
          maxLength: 5,
          FormatProps: {
            decimalScale: 0,
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values.value.includes(".")) return false;
              if (values?.value?.length > 5) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          type: "text",
          GridProps: { xs: 12, sm: 4.5, md: 0.9, lg: 0.8, xl: 0.6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT4",
          label: "",
          placeholder: "EnterPhoneR",
          maxLength: 10,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 10) {
                return false;
              }
              return true;
            },
          },
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentField
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              CONTACT4: {
                value: currentField.value ?? "",
              },
            };
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "SPACER2",
          GridProps: {
            xs: 0,
            sm: 0.2,
            md: 0.1,
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "STD_2",
          decimalScale: 0,
          label: "MobileNo",
          placeholder: "countryCode",
          defaultValue: "91",
          maxLength: 3,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values.value.includes(".")) return false;
              if (values?.value?.length > 3) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          type: "text",
          GridProps: { xs: 12, sm: 4.5, md: 0.9, lg: 0.8, xl: 0.6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT2",
          label: "",
          required: true,
          placeholder: "EnterMobileNo",
          maxLength: 20,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 20) {
                return false;
              }
              return true;
            },
          },
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          dependentFields: ["STD_2", "ACTIVE"],
          type: "text",
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            ___,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (field?.value) {
              formState?.handleButtonDisable(true);
              const postData = await API.validateMobileNo(
                field,
                dependentFieldsValues?.["OTHER_ADDRESS.STD_2"]?.value,
                formState
              );
              formState?.handleButtonDisable(false);
              if (
                Boolean(postData?.[0]?.MOBILE_STATUS) &&
                postData?.[0]?.MOBILE_STATUS !== ""
              ) {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: postData?.[0]?.MOBILE_STATUS,
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    MASKED_CONTACT2: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                    CONTACT2: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: false,
                    },
                  };
                }
              } else {
                return {
                  MASKED_CONTACT2: {
                    value: field?.value ?? "",
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                  CONTACT2: { value: field?.value ?? "" },
                };
              }
            } else if (field?.value === "") {
              return {
                CONTACT2: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
              };
            }
          },
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "SPACER3",
          GridProps: {
            xs: 0,
            sm: 0.2,
            md: 0.1,
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "STD_3",
          label: "Fax",
          placeholder: "countryCode",
          maxLength: 5,
          FormatProps: {
            decimalScale: 0,
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values.value.includes(".")) return false;
              if (values?.value?.length > 5) {
                return false;
              }
              return true;
            },
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          type: "text",
          GridProps: { xs: 12, sm: 4.5, md: 0.9, lg: 0.8, xl: 0.6 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT3",
          label: "",
          placeholder: "Fax",
          maxLength: 10,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 10) {
                return false;
              }
              return true;
            },
          },
          type: "text",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentField
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              CONTACT3: {
                value: currentField.value ?? "",
              },
            };
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["OTHER_ADDRESS.ACTIVE"]?.value;
          },
          GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          label: "Sr. No.",
          placeholder: "",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
        },
      ],
    },
  ],
};
