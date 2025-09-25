import { isValid } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";

export const retrieveCompoBMetadata = {
  defaultApiUrl: "GETFORM15GHFINDATE",
  formConfig: {
    formMetadata: {
      form: {
        name: "retrieveCompoBMetadata",
        label: "enterRetrivalPara",
        resetFieldOnUnmount: false,
        validationRun: "onBlur",
        render: {
          ordering: "auto",
          renderType: "simple",
          gridConfig: {
            container: {
              direction: "row",
              spacing: 0.5,
            },
          },
        },
        componentProps: {
          datePicker: {
            fullWidth: true,
          },
        },
      },
      fields: [
        {
          render: {
            componentType: "numberFormat",
          },

          name: "A_FROM_CUSTOMER",
          fullWidth: true,
          label: "CustomerId",
          FormatProps: {
            allowNegative: false,
            // allowLeadingZeros: false,
            decimalScale: 0,
            isAllowed: (values) => {
              console.log(values);
              if (values?.value?.length > 12 || values?.floatValue === 0) {
                return false;
              }
              return true;
            },
          },
          isFieldFocused: true,
          required: true,
          placeholder: "Enter Customer Id",
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState
          ) => {
            if (field?.value) {
              let respData = await GeneralAPI?.getCustomerIdValidate({
                COMP_CD: authState?.companyID,
                CUSTOMER_ID: field?.value,
              });
              if (respData?.length) {
                formState?.setIsValidate(true);
                return {
                  CUSTOMER_NM: { value: respData?.[0]?.ACCT_NM },
                };
              } else {
                let buttonName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "CustomerIDnotfound",
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  formState?.setIsValidate(false);
                  return {
                    CUSTOMER_ID: {
                      value: "",
                      // ignoreUpdate: true,
                      isFieldFocused: true,
                    },
                    CUSTOMER_NM: { value: "" },
                  };
                }
              }
            }
            return {};
          },
          runPostValidationHookAlways: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["CustomerIdisrequired"] }],
          },
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CUSTOMER_NM",
          label: "CustomerName",
          fullWidth: true,
          isReadOnly: true,
          GridProps: {
            xs: 12,
            md: 8.5,
            sm: 8.5,
            lg: 8.5,
            xl: 8.5,
          },
        },
        {
          render: { componentType: "datePicker" },
          name: "A_FROM_DT",
          label: "fromDate",
          placeholder: "DD/MM/YYYY",
          required: true,
          fullWidth: true,
          validate: (value) => {
            if (Boolean(value?.value) && !isValid(value?.value)) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["FromDateIsRequired"] }],
          },
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },
        {
          render: { componentType: "datePicker" },
          name: "A_TO_DT",
          label: "toDate",
          placeholder: "DD/MM/YYYY",
          dependentFields: ["FROM_DT"],
          fullWidth: true,
          required: true,
          runValidationOnDependentFieldsChange: true,
          validate: (currentField, dependentField) => {
            if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
              return "Mustbeavaliddate";
            }
            if (
              new Date(currentField?.value) <
              new Date(dependentField?.FROM_DT?.value)
            ) {
              return "ToDateshouldbegreaterthanorequaltoFromDate";
            }
            return "";
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["ToDateIsRequired"] }],
          },
          GridProps: {
            xs: 12,
            md: 3.5,
            sm: 3.5,
            lg: 3.5,
            xl: 3.5,
          },
        },
        {
          render: {
            componentType: "select",
          },
          name: "A_FLAG",
          label: "Type",
          required: true,
          options: [
            { label: "PAN Wise", value: "P" },
            { label: "Customer Wise", value: "C" },
          ],
          _optionsKey: "typeList",
          fullWidth: true,
          validationRun: "all",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["TypeIsRequired"] }],
          },
          GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "A_DTL_SUM",
          label: "Summary",
          fullWidth: true,
          defaultValue: "Y",
          GridProps: {
            style: { paddingTop: "40px" },
            xs: 12,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 2,
          },
          setFieldLabel: (dependenet, currVal) => {
            return currVal === "Y" || (currVal && Boolean(currVal))
              ? { label: "Summary" }
              : { label: "Detail" };
          },
        },
      ],
    },
  },
};
