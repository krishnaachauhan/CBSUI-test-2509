import * as API from "../../api";

export const categoryFormMetaData = {
  form: {
    name: "update_categ_meta_data",
    label: "Update Category",
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
        componentType: "textField",
      },
      name: "CUSTOMER_ID",
      label: "customerId",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      // CATEG_CD
      render: {
        componentType: "autocomplete",
      },
      name: "OLD_CATEG_CD",
      label: "OldCategory",
      options: (dependentValue, formState, _, authState) =>
        API.getCIFCategories({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          ENTITY_TYPE: formState?.ENTITY_TYPE ?? "",
        }),
      _optionsKey: "categOptions",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "NEW_CATEG_CD",
      label: "NewCategory",
      isFieldFocused: true,
      options: (dependentValue, formState, _, authState) =>
        API.getCIFCategories({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          ENTITY_TYPE: formState?.ENTITY_TYPE ?? "",
        }),
      _optionsKey: "categOptions",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.setCategCD?.(currentField?.optionData?.[0]);
        if (currentField?.value) {
          let reqParameters = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            CATEG_CD: currentField?.value,
            LF_NO:
              formState?.state?.personalOtherDtlLFno ??
              formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.LF_NO,
          };
          let postData = await API.validateNewCategory(reqParameters);
          for (const obj of postData ?? []) {
            if (obj?.O_STATUS === "999") {
              await formState.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "ValidationFailed",
                message: obj?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              return {
                NEW_CATEG_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
              };
            } else if (obj?.O_STATUS === "9") {
              await formState.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "Alert",
                message: obj?.O_MESSAGE ?? "",
                icon: "WARNING",
              });
              continue;
            } else if (obj?.O_STATUS === "99") {
              const buttonName = await formState.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "Confirmation",
                message: obj?.O_MESSAGE ?? "",
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                icon: "CONFIRM",
              });
              if (buttonName === "No") {
                break;
              }
            } else if (obj?.O_STATUS === "0") {
              return {
                NEW_CATEG_CD: {
                  value: currentField?.value,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {};
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
  ],
};
