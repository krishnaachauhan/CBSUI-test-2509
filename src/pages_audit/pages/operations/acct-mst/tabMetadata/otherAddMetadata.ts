import { getCourtMasterArea } from "pages_audit/pages/master/courtmaster/api";
import { getPMISCData } from "../api";
import * as API from "../api";

export const otherAdd_tab_metadata = {
  form: {
    name: "otherAdd_tab_form",
    label: "",
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
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "OTHER_ADDRESS_DTL",
      // fixedRows: 1,
      changeRowOrder: true,
      hideRemoveIconOnSingleRecord: false,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          ignoreInSubmit: false,
          __NEW__: {
            ignoreInSubmit: true,
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "ADDRESS_TYPE",
          label: "AddressType",
          options: () => getPMISCData("ADDRESS_TYPE"),
          _optionsKey: "currentAddType",
          placeholder: "SelectAddressType",
          type: "text",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["AddressTypeIsRequired"] }],
          },
          //   GridProps: {xs:12, sm:4, md: 3, lg: 2.5, xl:1.5},
          GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "divider",
          },
          name: "AddDivider_ignoreField",
          label: "Address",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADD1",
          label: "Line1",
          maxLength: 50,
          placeholder: "EnterLine1",
          type: "text",
          txtTransform: "uppercase",
          autoComplete: "off",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3.2, xl: 3.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADD2",
          label: "Line2",
          placeholder: "EnterLine2",
          maxLength: 50,
          type: "text",
          txtTransform: "uppercase",
          autoComplete: "off",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3.2, xl: 3.3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADD3",
          label: "Line3",
          placeholder: "EnterLine3",
          maxLength: 50,
          type: "text",
          txtTransform: "uppercase",
          autoComplete: "off",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3.2, xl: 3.3 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "PIN_CD",
          label: "PIN",
          isReadOnly: true,
          type: "text",
          maxLength: 12,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          runPostValidationHookAlways: true,
          name: "AREA_CD",
          label: "Area",
          enableVirtualized: true,
          dependentFields: ["PIN_CD"],
          // disableCaching: true,
          options: getCourtMasterArea,
          _optionsKey: "OtherAddressAreaDDW",
          // setValueOnDependentFieldsChange: (dependentFields) => {
          //   console.log("dependentPin", dependentFields);
          //   const pincode = dependentFields.PIN_CODE.value;
          //   if (Boolean(pincode)) {
          //     if (pincode.length < 6) {
          //       return "";
          //     }
          //   } else return null;
          // },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              PIN_CD: {
                value: Boolean(field.value)
                  ? field?.optionData?.[0]?.PIN_CODE
                  : "",
              },
            };
          },
          placeholder: "selectArea",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CITY_ignoreField",
          label: "City",
          isReadOnly: true,
          placeholder: "",
          type: "text",
          dependentFields: ["AREA_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"]?.optionData;
            // console.log(dependentFields.AREA_CD, "siudbcsiudbcisbdc setvalue")
            if (optionData && optionData.length > 0) {
              return optionData[0].CITY_NM;
            } else return "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CITY_CD",
          dependentFields: ["AREA_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"]?.optionData;
            if (optionData && optionData.length > 0) {
              return optionData[0].CITY_CD;
            } else return "";
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DISTRICT_ignoreField",
          label: "DistrictName",
          ignoreInSubmit: true,
          isReadOnly: true,
          placeholder: "",
          type: "text",
          dependentFields: ["AREA_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"]?.optionData;
            if (optionData && optionData.length > 0) {
              return optionData[0].DIST_NM;
            } else return "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "DIST_CD",
          label: "hiddendistrict",
          dependentFields: ["AREA_CD"],
          // ignoreInSubmit: true,
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"]?.optionData;
            // console.log(dependentFields.AREA_CD, "siudbcsiudbcisbdc setvalue")
            if (optionData && optionData.length > 0) {
              return optionData[0].DISTRICT_CD;
            } else return "";
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STATE_ignoreField",
          label: "State",
          isReadOnly: true,
          ignoreInSubmit: true,
          placeholder: "",
          type: "text",
          dependentFields: ["AREA_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"]?.optionData;
            if (optionData && optionData.length > 0) {
              return optionData[0].STATE_NM;
            } else return "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "STATE_CD",
          label: "hiddenState",
          dependentFields: ["AREA_CD"],
          // ignoreInSubmit: true,
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"].optionData;
            if (optionData && optionData.length > 0) {
              return optionData[0].STATE_CD;
            } else return "";
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "COUNTRY_ignoreField",
          label: "Country",
          isReadOnly: true,
          ignoreInSubmit: true,
          placeholder: "",
          type: "text",
          dependentFields: ["AREA_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"]?.optionData;
            if (optionData && optionData.length > 0) {
              return optionData[0].COUNTRY_NM;
            } else return "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "COUNTRY_CD",
          label: "hiddenCountry",
          dependentFields: ["AREA_CD"],
          // ignoreInSubmit: true,
          setValueOnDependentFieldsChange: (dependentFields) => {
            const optionData =
              dependentFields?.["OTHER_ADDRESS_DTL.AREA_CD"].optionData;
            if (optionData && optionData.length > 0) {
              return optionData[0].COUNTRY_CD;
            } else return "";
          },
        },
        {
          render: {
            componentType: "divider",
          },
          name: "contactDivider_ignoreField",
          label: "Contact",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT1",
          label: "PhoneO",
          placeholder: "EnterPhoneO",
          autoComplete: "off",
          maxLength: 20,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
          },
          // ignoreInSubmit: true,
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          validate: (value) => {
            if (Boolean(value?.value) && value?.value.length < 11) {
              return "PhoneMinimumdigitValidation";
            }
            return "";
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
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT1",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT4",
          label: "PhoneR",
          // ignoreInSubmit: true,
          placeholder: "EnterPhoneR",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
          },
          autoComplete: "off",
          maxLength: 20,
          validate: (value) => {
            if (Boolean(value?.value) && value?.value.length < 11) {
              return "PhoneRMinimumdigitValidation";
            }
            return "";
          },
          type: "text",
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
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT4",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT2",
          label: "MobileNum",
          placeholder: "EnterMobileNo",
          autoComplete: "off",
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
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (field?.value) {
              const postData = await API.validateMobileNo(
                field,
                dependentFieldsValues,
                formState
              );
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
                    },
                  };
                }
              } else {
                return {
                  CONTACT2: { value: field?.value ?? "" },
                };
              }
            } else if (field?.value === "") {
              return {
                CONTACT2: { value: "" },
              };
            }
          },
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT2",
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_CONTACT3",
          label: "Alternate Phone",
          placeholder: "EnterAlternatePhone",
          autoComplete: "off",
          maxLength: 20,
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
          },
          validate: (value) => {
            if (Boolean(value?.value) && value?.value.length < 11) {
              return "AlternatePhoneMinimumdigitValidation";
            }
            return "";
          },
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
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
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONTACT3",
        },
      ],
    },
  ],
};
