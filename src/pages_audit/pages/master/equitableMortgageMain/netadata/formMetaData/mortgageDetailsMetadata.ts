import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../../api";
import {
  getAdvocateTypeOp,
  getValuerTypeOp,
  getAreaListDDW,
} from "pages_audit/pages/operations/acct-mst/api";
import { handleDisplayMessages } from "../../../../operations/lockerRentTrns/formMetadata/entryFormMetadata";
import { format } from "date-fns";
export const mortgageDetailsMetadata = {
  form: {
    name: "stepperForm 1",
    label: "Equitable Mortgage Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      autocomplete: {
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
        componentType: "hidden",
      },
      name: "PARA_162",
      ignoreInSubmit: true,
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "FORM_MODE",
    },
    {
      render: {
        componentType: "arrayField",
      },
      displayCountName: "Equitable Mortgage Details",
      changeRowOrder: true,
      name: "EQUITABLE_MORTGAGE_DETAILS",
      removeRowFn: (fs, name, data, index) => {
        const rowData = data[name][index];

        if (rowData?.RAW_EXIST === "Y") {
          return {
            allow: false,
            reason: "Not Allowed To Delete.",
          };
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "RAW_EXIST",
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "PROPERTY_NO",
          label: "propertyNo",
          placeholder: "propertyNo",
          isFieldFocused: true,
          FormatProps: {
            allowLeadingZeros: true,
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["propertyNoRequired"] }],
          },
          dependentFields: ["FORM_MODE"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            const key = currentField?.fieldKey;

            let indexKey = dependentFieldValues?.FORM_MODE?.fieldKey;

            const match = key.match(/\[(\d+)\]/);
            const newNumber = parseInt(match[1]) + 1;
            return {
              ROW_ID: { value: `${newNumber}` },
              SR_CD: { value: `${newNumber}` },
            };
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "ROW_ID",
          dependentFields: ["SR_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            const value =
              dependentFields["EQUITABLE_MORTGAGE_DETAILS.SR_CD"]?.value;

            return `${value}`;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "PROPERTY_TYPE",
          label: "propertyType",
          placeholder: "propertyType",
          options: (dependentValue, formState, _, authState) => {
            return API.getdropdownData({
              CATEGORY_CD: "PROPERTY_TYPE",
            });
          },
          _optionsKey: "getpropertyTypeData",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["propertyTypeReuired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "TYPE_OF_CHARGE",
          label: "typeOfChargeCreation",
          options: (dependentValue, formState, _, authState) => {
            return API.getdropdownData({
              CATEGORY_CD: "TYPE_OF_CHARGE",
            });
          },
          _optionsKey: "gettypesOfCharge",
          placeholder: "typeOfChargeCreation",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DESCRIPTION_SEC",
          label: "securityDescription",
          multiline: true,
          placeholder: "securityDescription",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2.7, xl: 2.7 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "AREA_IN_METER",
          label: "areaInMeter",
          placeholder: "0.00",
          className: "textInputFromRight",
          FormatProps: {
            decimalScale: 2,
            fixedDecimalScale: true,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "AREA_IN_FTS",
          label: "areaInFts",
          className: "textInputFromRight",
          placeholder: "0.00",
          FormatProps: {
            decimalScale: 2,
            fixedDecimalScale: true,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADDRESS_1",
          label: "location",
          placeholder: "location",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["addressRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADDRESS_2",
          label: "",
          placeholder: "location",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ADDRESS_3",
          label: "",
          placeholder: "location",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CITY_NM",
          ignoreInSubmit: true,
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "STATE_NM",
          ignoreInSubmit: true,
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "COUNTRY_NM",
          ignoreInSubmit: true,
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "AREA_CD",
          label: "Area",
          dependentFields: ["PIN_CODE"],
          runPostValidationHookAlways: true,
          runValidationOnDependentFieldsChange: false,
          disableCaching: true,
          options: (dependentValue, formState, _, authState) =>
            getAreaListDDW(
              _?.["EQUITABLE_MORTGAGE_DETAILS.PIN_CODE"]?.value,
              formState,
              _,
              authState
            ),
          _optionsKey: "collateralDtlAreaDDW",
          enableVirtualized: true,
          placeholder: "selectArea",
          runPostValidationForInitValue: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (field?.value) {
              return {
                PIN_CODE: {
                  value: field?.optionData?.[0]?.PIN_CODE,
                },
                CITY_CD: {
                  value: field?.optionData?.[0]?.CITY_CD,
                },
                STATE_CD: {
                  value: field?.optionData?.[0]?.STATE_CD,
                },
                COUNTRY_CD: {
                  value: field?.optionData?.[0]?.COUNTRY_CD,
                },
                COUNTRY: {
                  value: field?.optionData?.[0]?.COUNTRY_NM,
                },
                STATE: {
                  value: field?.optionData?.[0]?.STATE_NM,
                },
                CITY: {
                  value: field?.optionData?.[0]?.CITY_NM,
                },
              };
            } else
              return {
                PIN_CODE: {
                  value: "",
                  ignoreUpdate: false,
                },
                CITY_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
                STATE_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
                COUNTRY_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
                COUNTRY: {
                  value: "",
                  ignoreUpdate: false,
                },
                STATE: {
                  value: "",
                  ignoreUpdate: false,
                },
                CITY: {
                  value: "",
                  ignoreUpdate: false,
                },
              };
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["areaIsRequired"] }],
          },

          GridProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2.3,
            xl: 2.3,
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PIN_CODE",
          label: "PinCode",
          placeholder: "EnterPinCode",
          maxLength: 12,

          validate: async (currentField, ...rest) => {
            if (rest?.[1]?.PinCode) {
              if (currentField?.value === "") {
                return "PincodeRequired";
              }
            }
            return "";
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: false,
            isAllowed: (values) => {
              if (values?.value?.length > 13) {
                return false;
              }
              if (values.floatValue === 0) {
                return false;
              }
              return true;
            },
          },
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2,
            lg: 1.5,
            xl: 1.5,
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CITY",
          label: "City",
          ignoreInSubmit: true,
          isReadOnly: true,
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2.5,
            lg: 2.5,
            xl: 2.5,
          },
          dependentFields: ["CITY_NM", "RAW_EXIST"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            console.log(dependentFields, "dependentFields");

            if (
              dependentFields?.["EQUITABLE_MORTGAGE_DETAILS.RAW_EXIST"]
                ?.value === "Y"
            ) {
              return dependentFields?.["EQUITABLE_MORTGAGE_DETAILS.CITY_NM"]
                ?.value;
            }
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "STATE",
          label: "State",
          ignoreInSubmit: true,
          isReadOnly: true,
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2.5,
            lg: 2.5,
            xl: 2.5,
          },
          dependentFields: ["STATE_NM", "RAW_EXIST"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            if (
              dependentFields?.["EQUITABLE_MORTGAGE_DETAILS.RAW_EXIST"]
                ?.value === "Y"
            ) {
              return dependentFields?.["EQUITABLE_MORTGAGE_DETAILS.STATE_NM"]
                ?.value;
            }
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "COUNTRY",
          label: "Country",
          ignoreInSubmit: true,
          isReadOnly: true,
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2.5,
            lg: 2.5,
            xl: 2.5,
          },
          dependentFields: ["COUNTRY_NM", "RAW_EXIST"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            if (
              dependentFields?.["EQUITABLE_MORTGAGE_DETAILS.RAW_EXIST"]
                ?.value === "Y"
            ) {
              return dependentFields?.["EQUITABLE_MORTGAGE_DETAILS.COUNTRY_NM"]
                ?.value;
            }
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CITY_CD",
          label: "City",
          isReadOnly: true,
          placeholder: "",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2.5, xl: 2.5 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "STATE_CD",
          label: "State",
          isReadOnly: true,
          ignoreInSubmit: true,
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2.5,
            lg: 2.5,
            xl: 2.5,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CITY_CD",
          label: "City",
          placeholder: "",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2.5, xl: 2.5 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "STATE_CD",
          label: "State",
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2.5,
            lg: 2.5,
            xl: 2.5,
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "COUNTRY_CD",
          label: "Country",
          GridProps: {
            xs: 12,
            sm: 4,
            md: 2.5,
            lg: 2.5,
            xl: 2.5,
          },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "MORT_CHG_DT",
          label: "cersaiChargeCreationDate",
          placeholder: "cersaiChargeCreationDate",
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "MORT_CHG_SAT_DT",
          label: "mortgageChargeSatisfactionDate",
          placeholder: "mortgageChargeSatisfactionDate",
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CER_CHG_DT",
          label: "mortgageChargeCreationDate",
          placeholder: "mortgageChargeCreationDate",
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CER_CHG_SAT_DT",
          label: "cersaiChargeSatisfactionDate",
          placeholder: "cersaiChargeSatisfactionDate",
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 1.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CER_ID_NO",
          label: "maturityIdNo",
          placeholder: "maturityIdNo",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CER_ASS_ID",
          label: "cersaiAsetId",
          placeholder: "cersaiAsetId",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "VALUAR",
          label: "valuer",
          placeholder: "valuer",
          options: (dependentValue, formState, _, authState) =>
            getValuerTypeOp({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            }),
          validate: (value, ...rest) => {
            if (value?.optionData?.[0]?.ACTIVE_FLAG === "N") {
              return "Selectedvaluercodeinactive";
            }
          },
          _optionsKey: "VALUE_CODE",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "VALUATION_DT",
          label: "valuationDate",
          placeholder: "valuationDate",
          format: "dd/MM/yyyy",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["valuationDateRequired"] }],
          },
          dependentFields: ["PARA_162"],
          validate: (value, ...rest) => {
            const CurrentField = Boolean(value?.value)
              ? format(utilFunction.getParsedDate(value?.value), "dd/MMM/yyyy")
              : "";
            const workingDate = rest?.[1]?.authState?.workingDate;

            if (
              Boolean(value?.value) &&
              !utilFunction.isValidDate(
                utilFunction.getParsedDate(value?.value)
              )
            ) {
              return "Mustbeavaliddate";
            } else if (
              Boolean(workingDate) &&
              new Date(CurrentField) > new Date(workingDate)
            ) {
              return "valuationDtValidMsg";
            }
            return "";
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value && dependentFieldsValues?.PARA_162?.value) {
              const reqParameters: any = {
                VALUATION_DT: format(
                  new Date(currentField?.value),
                  "dd/MMM/yyyy"
                ),
                PARA_162: dependentFieldsValues?.PARA_162?.value,
                FLAG: "V",
                WORKING_DATE: authState?.workingDate,
              };

              const postData = await API.validateDateField(reqParameters);

              const returnValue = await handleDisplayMessages(
                postData,
                formState
              );
              if (returnValue) {
                return {
                  VAL_EXP_DT: {
                    value: returnValue?.[0]?.VAL_EXP_DT,
                  },
                };
              } else {
                return {
                  VAL_EXP_DT: {
                    value: "",
                  },
                };
              }
            } else {
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "VAL_EXP_DT",
          label: "valuationExpiryDate",
          placeholder: "valuationExpiryDate",
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "ADVOCATE_CODE",
          label: "advocate",
          placeholder: "advocate",
          options: (dependentValue, formState, _, authState) =>
            getAdvocateTypeOp({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            }),

          _optionsKey: "getadvocateData",

          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "TITLE_DT",
          label: "titleDate",
          placeholder: "titleDate",
          format: "dd/MM/yyyy",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["titleDateRequired"] }],
          },
          dependentFields: ["PARA_162"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              const reqParameters: any = {
                VALUATION_DT: format(
                  new Date(currentField?.value),
                  "dd/MMM/yyyy"
                ),
                PARA_162: dependentFieldsValues?.PARA_162?.value,
                FLAG: "T",
                WORKING_DATE: authState?.workingDate,
              };

              const postData = await API.validateDateField(reqParameters);

              const returnValue = await handleDisplayMessages(
                postData,
                formState
              );
              if (returnValue) {
                return {
                  EXPIRY_DATE: {
                    value: returnValue?.[0]?.VAL_EXP_DT,
                  },
                };
              } else {
                return {
                  EXPIRY_DATE: {
                    value: "",
                  },
                };
              }
            }
          },
          GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.2, xl: 1.2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "EXPIRY_DATE",
          label: "titleExpiryDate",
          placeholder: "titleExpiryDate",
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.2, xl: 1.2 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "FARE_VALUE",
          label: "fareValue",
          maxLength: 17,
          placeholder: "0.00",
          className: "textInputFromRight",
          FormatProps: {
            decimalScale: 2,
            fixedDecimalScale: true,
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["fareValueRequired"] }],
          },
          dependentFields: ["SANCTION_AMT", "SR_CD", "PARA_162"],

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const parsedIndex = Number(
              dependentFieldsValues?.["EQUITABLE_MORTGAGE_DETAILS.SR_CD"]?.value
            );

            const allRows = formState?.propertyRows?.[parsedIndex];

            let totalSanctionAmount = 0;
            let sanctionAmountsStr = "0";

            if (Array.isArray(allRows)) {
              totalSanctionAmount = allRows.reduce(
                (sum, item) => sum + Number(item?.SANCTION_AMT || 0),
                0
              );

              sanctionAmountsStr = allRows.reduce((str, item, index) => {
                return (
                  str + (index > 0 ? "," : "") + (item?.SANCTION_AMT ?? "")
                );
              }, "");
            }

            if (
              currentField?.value &&
              dependentFieldsValues?.PARA_162?.value === "Y"
            ) {
              const reqParameters = {
                SANCTION_AMT: sanctionAmountsStr,
                TOT_SANCTION_AMT: `${totalSanctionAmount}`,
                FARE_VALUE: currentField.value,
                SUBCNT: `${Array.isArray(allRows) ? allRows.length : "1"}`,
              };

              const postData = await API.validateFareValueField(reqParameters);

              const errorStatus = postData?.status;
              const errorMessage = postData?.messageDetails?.trim()
                ? postData.messageDetails
                : postData?.message;

              if (errorStatus === "999") {
                const buttonName = await formState.MessageBox?.({
                  messageTitle: "Validation Failed",
                  message: errorMessage,
                  icon: "ERROR",
                  buttonNames: ["Ok"],
                });

                if (buttonName === "Ok") {
                  return {
                    FARE_VALUE: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                  };
                }
                return;
              } else {
                formState.setDataOnFieldChange("SECURITY_AUTOSET", {
                  sr_cd:
                    dependentFieldsValues?.["EQUITABLE_MORTGAGE_DETAILS.SR_CD"]
                      ?.value,
                  security_Per: postData[0]?.SECURITY_PER ?? "",
                });
                return {
                  SECURITY_PER_HIDDEM: {
                    value: postData[0]?.SECURITY_PER ?? "",
                    ignoreUpdate: true,
                  },
                };
              }

              // for (const obj of postData) {
              //   const status = obj?.O_STATUS;
              //   const title = obj?.O_MSG_TITLE?.length
              //     ? obj.O_MSG_TITLE
              //     : "Validation";
              //   const message = obj?.O_MESSAGE ?? "Something went wrong.";
              //   console.log(status, "status");

              //   if (status === "9") {
              //     await formState.MessageBox?.({
              //       messageTitle: title,
              //       message,
              //       icon: "WARNING",
              //     });
              //     continue;
              //   } else if (status === "99") {
              //     const buttonName = await formState.MessageBox?.({
              //       messageTitle: title,
              //       message,
              //       buttonNames: ["Yes", "No"],
              //       defFocusBtnName: "Yes",
              //       icon: "CONFIRM",
              //     });

              //     if (buttonName === "No") {
              //       break;
              //     }
              //   } else if (status === "0") {
              //     console.log("seted");

              //     return {
              //       SECURITY_PER_HIDDEM: {
              //         value: obj?.SECURITY_PER ?? "2",
              //         ignoreUpdate: true,
              //       },
              //     };
              //   }
              // }
            }
          },

          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "numberFormat",
          },
          name: "FORCED_VALUE",
          label: "forcedValue",
          maxLength: 17,
          placeholder: "0.00",
          className: "textInputFromRight",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["forcedValueRequired"] }],
          },
          FormatProps: {
            decimalScale: 2,
            fixedDecimalScale: true,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.2, xl: 1.2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "DIST_VAL",
          label: "distressValue",
          placeholder: "distressValue",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.3, xl: 1.3 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "ADD_PROPERTY",
          label: "Add Property Holder Details",
        },
      ],
    },
  ],
};
