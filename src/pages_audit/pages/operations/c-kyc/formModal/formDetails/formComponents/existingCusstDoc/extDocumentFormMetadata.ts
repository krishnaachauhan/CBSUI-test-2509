import { addMonths, format, isAfter } from "date-fns";
import * as API from "../../../../api";
import { t } from "i18next";
import { PREVENT_SPECIAL_CHAR } from "components/utilFunction/constant";

export const ExtDocumentFormMetadata = {
  form: {
    name: "EditDocuments",
    label: "Documents",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    // submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
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
    // {
    //   render: { componentType: "hidden" },
    //   name: "TRAN_CD",
    // },
    {
      render: { componentType: "hidden" },
      name: "SR_CD",
    },
    {
      render: { componentType: "hidden" },
      // name: "VALID_UPTO",
      name: "VALID_UPTO_HRS",
    },
    {
      render: { componentType: "select" },
      name: "TEMPLATE_CD",
      // name: "DOC_DESCRIPTION",
      label: "Document",
      // options: "getKYCDocTypes",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DocumentIsRequired"] }],
      },
      dependentFields: ["TRAN_CD", "SR_CD"],
      isReadOnly: false,
      options: (dependentValue?, formState?, _?, authState?) =>
        API.getCustDocumentOpDtl({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          formState,
        }),
      _optionsKey: "getKYCDocumentTypes",
      // options: () => [],
      // _optionsKey: "getDocumentOptionsDTL",
      disableCaching: true,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 3,
        xl: 2,
      },
      postValidationSetCrossFieldValues: (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (
          field.optionData &&
          field.optionData.length > 0 &&
          field.optionData[0].DESCRIPTION
        ) {
          return {
            DOC_DESCRIPTION: { value: field.optionData[0].DESCRIPTION ?? "" },
          };
        } else {
          return {};
        }
      },
      __EDIT__: { isReadOnly: true },
    },
    {
      render: { componentType: "hidden" },
      name: "DOC_DESCRIPTION",
    },
    {
      render: { componentType: "textField" },
      name: "DOC_NO",
      label: "Document No",
      required: true,
      txtTransform: "uppercase",
      preventSpecialChars: PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER,
      validate: (columnValue) => API.validateAlphaNumValue(columnValue),
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
      },
    },
    {
      render: { componentType: "datePicker" },
      // name: "VALID_TILL_DT",
      name: "VALID_UPTO",
      label: "ValidTillDate",
      required: true,
      dependentFields: ["VALID_UPTO_HRS"],
      minDate: new Date(),
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
      },
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["ValidTillDateisrequired"] },
          { name: "typeError", params: ["Mustbeavaliddate"] },
        ],
      },
      validate: (value, data, others) => {
        if (Boolean(value.value)) {
          // console.log(data, "WEfwedqwe", value)
          if (data.VALID_UPTO_HRS && Boolean(data.VALID_UPTO_HRS.value)) {
            const valid_upto = data.VALID_UPTO_HRS.value;
            const max_date = addMonths(
              new Date(),
              !isNaN(parseInt(valid_upto)) ? parseInt(valid_upto) : 0
            );
            // console.log(value.value, "dateasdasdas", max_date, isAfter(value.value, max_date))
            if (isAfter(value.value, max_date)) {
              return `${t("MaximumAllowedDate")} - ${format(
                new Date(max_date),
                "dd/MM/yyyy"
              )}`;
            }
          }
          return "";
          // if (!Boolean(value)) {
          //   return "From Date is required.";
          // }
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "USER_NAME",
      label: "User Name",
      placeholder: "",
      type: "text",
      fullWidth: true,
      // required: true,
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["This field is required"] },
          {
            name: "USER_NAME",
            params: ["Please Enter Review by Login ID."],
          },
        ],
      },
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
      },
    },
    // {
    //   render: {
    //     componentType: "datetimePicker",
    //   },
    //   name: "VALID_UPTO",
    //   label: "Expiry Date",
    //   placeholder: "",
    //   type: "date",
    //   fullWidth: true,
    //   format: "dd/MM/yyyy HH:mm:ss",
    //   required: true,
    //   schemaValidation: {
    //     type: "string",
    //     rules: [
    //       { name: "required", params: ["This field is required"] },
    //       { name: "VALID_UPTO", params: ["Please Enter Expiry Date."] },
    //     ],
    //   },
    //   GridProps: {
    //     xs: 12,
    //     md: 4,
    //     sm: 4,
    //   },
    // },
    {
      render: { componentType: "checkbox" },
      defaultValue: true,
      name: "SUBMIT",
      label: "Submit",
      GridProps: { xs: 12, md: 2, sm: 2 },
      // __EDIT__: { render: { componentType: "checkbox" } },
    },
  ],
};
