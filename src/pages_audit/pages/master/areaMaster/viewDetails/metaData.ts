import { textTransform } from "@mui/system";
import * as API from "../api";
export const AreaMasterMetaData = {
  form: {
    name: "Area Master",
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
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        },
        container: {
          direction: "row",
          spacing: 0.5,
          width: 200,
          maxwidth: 500,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      autoComplete: {
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
      name: "AREA_CD",
      label: "Code",
      placeholder: "Code",
      type: "text",
      required: true,
      maxLength: 4,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CodeisRequired"] }],
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      __EDIT__: { isReadOnly: true },
    },
    {
      render: { componentType: "textField" },
      name: "AREA_NM",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Name",
      maxLength: 100,
      txtTransform: "uppercase",
      preventSpecialCharInput: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AreaNameisRequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: { componentType: "numberFormat" },
      name: "PIN_CODE",
      label: "PinCode",
      placeholder: "PinCode",
      maxLength: 6,
      FormatProps: {
        allowNegative: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      require: false,
      preventSpecialCharInput: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "CITY_CD",
      label: "City",
      placeholder: "City",
      options: API.GETAREAMSTCITYDDW,
      _optionsKey: "getAreaMstCityddw",
      __VIEW__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "PARENT_AREA",
      label: "ParentArea",
      placeholder: "ParentArea",
      options: API.GETAREAMSTPARENTDDW,
      __VIEW__: { isReadOnly: true },
      _optionsKey: "getAreaMstParentddw",
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
