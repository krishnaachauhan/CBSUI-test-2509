import { GeneralAPI } from "registry/fns/functions";

export const acctMSTHeaderFormMetadata = {
  form: {
    name: "acctHeaderForm",
    label: "",
    resetFieldOnUnmount: true,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    formStyle: {
      background: "white",
      height: "calc(100vh - 390px)",
      overflowY: "auto",
      overflowX: "hidden",
    },
    render: {
      ordering: "auto",
      // ordering: "sequence",
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
          height: "35vh",
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
        componentType: "textField",
      },
      name: "REQ_ID",
      label: "RequestID",
      isReadOnly: true,
      shouldExclude: () => {
        return false;
      },
      __NEW__: {
        shouldExclude: () => {
          return true;
        },
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "Branch Code",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      isFieldFocused: true,
      required: true,
      // options: API.GetDynamicSalutationData("Salutation")
      options: (dependentValue, formState, _, authState) => {
        // console.log("<<<<fnef", dependentValue, formState, _, authState);
        return GeneralAPI.get_Account_Type({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id,
          DOC_CD: formState.docCD,
        });
      },
      _optionsKey: "acctTypesOp",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AccountTypeReqired"] }],
      },
      isReadOnly: (_, dependentFieldsValues, formState) => {
        if (formState?.docCD === "RPT/48" && formState?.formMode === "new") {
          return true;
        } else if (formState?.formMode === "new") {
          return false;
        } else {
          return true;
        }
      },

      GridProps: {
        xs: 12,
        sm: 3,
        md: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "Account Code",
      isReadOnly: true,
      shouldExlude: false,
      __NEW__: {
        shouldExlude: true,
      },
      GridProps: {
        xs: 12,
        sm: 2,
        md: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARENT_CODE",
      dependentFields: ["ACCT_TYPE"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        const optionData = dependentFields?.ACCT_TYPE?.optionData;
        if (Array.isArray(optionData) && optionData.length > 0) {
          return optionData[0]?.PARENT_CODE;
        } else return "";
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "BUTTON_CLICK",
      label: "Submit",
      // endsIcon: "YoutubeSearchedFor",
      // rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 2,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
      shouldExclude: () => {
        return true;
      },
      __NEW__: {
        shouldExclude: () => {
          return false;
        },
      },
    },
  ],
};
