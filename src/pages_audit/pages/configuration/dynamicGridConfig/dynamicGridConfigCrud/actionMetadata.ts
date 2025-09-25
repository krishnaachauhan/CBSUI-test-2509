import { GeneralAPI } from "registry/fns/functions";
import { getProMiscData } from "../api";
export const ActionsMetaData: any = {
  form: {
    refID: 1667,
    name: "ActionsMetaData",
    label: "Actions",
    resetFieldOnUmnount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",

      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "actionsDetails",
      removeRowFn: "deleteFormArrayFieldData",
      disagreeButtonName: "No",
      agreeButtonName: "Yes",
      errorTitle: "Are you Sure you want to delete this action?",
      // label: "Actions",
      arrayFieldIDName: "DOC_CD",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          label: "sr.cd",
          placeholder: "",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "select",
          },
          name: "ACTIONNAME",
          label: "Action Name",
          options: [
            { label: "add", value: "Add" },
            { label: "view-detail", value: "View-Detail" },
            { label: "delete", value: "Delete" },
          ],
          _optionsKey: "GetActionName",
          postValidationSetCrossFieldValues: "getActionDetailsData",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
        },
        {
          render: {
            componentType: "select",
          },
          name: "FORM_METADATA_SR_CD",
          label: "Metadata List",
          options: "getMetadataList",
          _optionsKey: "getMetadataList",
          disableCaching: true,
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
          runValidationOnDependentFieldsChange: true,
          dependentFields: ["ACTIONNAME"],
          shouldExclude: (val1, dependent) => {
            if (dependent["actionsDetails.ACTIONNAME"]?.value === "Delete") {
              return true;
            }
            return false;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACTIONLABEL",
          label: "Action Label",
          placeholder: "Action Label",
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "ICON_TYPE",
          label: "Icon Type",
          defaultValue: "S",
          options: [
            { label: "Action Icon", value: "A" },
            { label: "Starts Icon", value: "S" },
            { label: "Ends Icon", value: "E" },
          ],

          GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "ACTIONICON",
          label: "Action Icon",
          options: () => getProMiscData("menu_icon"),
          _optionsKey: "getproMiscData",
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: ["Action Icon is required."] },
              { name: "ACTIONICON", params: ["Please enter Action Icon."] },
            ],
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ALRT_MSG",
          label: "Alert Message",
          placeholder: "Alert Message",
          GridProps: { xs: 12, sm: 3, md: 4, lg: 6, xl: 2.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "SHOULDEXCLUDE",
          label: "Should Exclude",
          placeholder: "Should Exclude",
          GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 1.5 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ONENTERSUBMIT",
          label: "OnEnter Submit",
          placeholder: "OnEnter Submit",
          defaultValue: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 1.5 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "MULTIPLE",
          label: "Multiple",
          defaultValue: true,
          GridProps: { xs: 12, sm: 2, md: 2, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ROWDOUBLECLICK",
          label: "Row Double Click",
          defaultValue: true,
          GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ALWAYSAVAILABLE",
          label: "Always Available",
          defaultValue: true,
          GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ISNODATATHENSHOW",
          label: "Is Nodata Then Show",
          defaultValue: true,
          GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
        },
      ],
    },
  ],
};
