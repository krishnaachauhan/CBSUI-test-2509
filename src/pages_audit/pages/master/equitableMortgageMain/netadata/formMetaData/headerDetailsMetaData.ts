import { commonHeaderTypographyProps } from "../../helper";
import * as API from "../../api";
export const headerDetailsMetaData = {
  form: {
    name: "stepperForm 2",
    label: "Equitable Mortgage Header",
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
        componentType: "numberFormat",
      },
      name: "TRAN_CD",
      label: "emNo",
      placeholder: "emNo",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SR_CD",
      defaultValue: "1",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESCRIPTION",
      label: "propertyHoldersName",
      placeholder: "propertyHoldersName",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MORTGAGE_DATE",
      label: "mortgageRegistrationDate",
      placeholder: "mortgageRegistrationDate",
      format: "dd/MM/yyyy",

      GridProps: { xs: 12, sm: 6, md: 4, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MORT_EXP_DT",
      label: "mortgageExpiredDate",
      placeholder: "mortgageExpiredDate",
      format: "dd/MM/yyyy",

      GridProps: { xs: 12, sm: 6, md: 4, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "REGISTERED_VIDE",
      label: "registeredVide",
      placeholder: "registeredVide",
      options: (dependentValue, formState, _, authState) => {
        return API.getdropdownData({
          CATEGORY_CD: "REGISTERED_VIDE",
        });
      },
      _optionsKey: "getRegisteredVideData",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["registeredVideReuired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "STAMP_RS",
      label: "stampRs",
      placeholder: "stampRs",
      maxLength: 17,
      FormatProps: {
        allowNegative: false,
        decimalScale: 2,
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "typography",
      },
      name: "DATE_HEADER",
      label: "Property Holder Details",
      ignoreInSubmit: true,
      TypographyProps: commonHeaderTypographyProps,
      GridProps: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
        sx: { paddingTop: "0px !important" },
      },
      dependentFields: ["PARA_162"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PARA_162?.value === "Y") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "arrayField",
      },
      displayCountName: "",
      name: "HOLDER_DATA",
      removeRowFn: (fs, name, data, index) => {
        const rowData = data[name][index];

        if (rowData?.RAW_EXIST === "Y") {
          return {
            allow: false,
            reason: "Not Allowed To Delete.",
          };
        }
      },
      dependentFields: ["PARA_162"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PARA_162?.value === "Y") {
          return false;
        } else {
          return true;
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
          render: { componentType: "numberFormat" },
          name: "CUSTOMER_ID",
          sequence: 7,
          type: "text",
          maxLength: 12,
          label: "CustomerId",
          placeholder: "EnterCustomerID",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["CustomerIDisrequired"] }],
          },
          autoComplete: "off",
          FormatProps: {
            isAllowed: (values) => {
              if (values?.value?.length > 12) {
                return false;
              }
              return true;
            },
          },

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFields
          ) => {
            if (formState?.isSubmitting) return {};
            const key = currentField?.fieldKey;

            const match = key.match(/\[(\d+)\]/);
            const newNumber = parseInt(match[1]) + 1;
            if (currentField?.value.length > 0) {
              const CustomerIdAPI = await API.ValidateCustomerId(currentField, {
                COMP_CD: authState?.companyID,
                CUST_ID: currentField?.value,
                formState: formState,
              });
              if (!Boolean(CustomerIdAPI?.[0]?.CUST_STATUS)) {
                const setData = await API.getCustomerId(currentField, {
                  COMP_CD: authState?.companyID,
                  CUSTOMER_ID: currentField?.value,
                  formState: formState,
                });

                return {
                  HOLDER_NM: {
                    value: setData?.[0]?.ACCT_NM ?? "",
                    ignoreUpdate: true,
                  },
                  CONTACT2: {
                    value: setData?.[0]?.CONTACT2 ?? "",
                    ignoreUpdate: true,
                  },
                };
              } else {
                const btnName = await formState?.MessageBox({
                  message: CustomerIdAPI?.[0]?.CUST_STATUS,
                  messageTitle: "ValidationFailed",
                  icon: "ERROR",
                  buttonNames: ["Ok"],
                });
                if (btnName === "Ok") {
                  return {
                    CUSTOMER_ID: {
                      value: "",
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                    ACCT_NM: {
                      value: "",
                      ignoreUpdate: false,
                    },
                    CONTACT2: {
                      value: "",
                      ignoreUpdate: false,
                    },
                  };
                }
              }
            }
            return {
              SR_CD: { value: `${newNumber}` },
            };
          },
          isReadOnly(fieldData, dependentFieldsValues, formState) {
            if (formState?.authState < "4") {
              return true;
            } else {
              return false;
            }
          },
          GridProps: {
            xs: 12,
            sm: 2,
            md: 2,
            lg: 1.5,
            xl: 1.5,
          },
        },
        {
          render: { componentType: "textField" },
          name: "HOLDER_NM",
          sequence: 8,
          type: "text",
          label: "CustomerIdName",
          isReadOnly: true,
          dependentFields: ["CUSTOMER_ID"],
          GridProps: {
            xs: 12,
            sm: 3,
            md: 3,
            lg: 3,
            xl: 3,
          },
        },
        {
          render: { componentType: "hidden" },
          name: "SR_CD",
        },
      ],
    },
  ],
};
