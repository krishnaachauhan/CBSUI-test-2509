import { shouldExcludeFnType } from "@acuteinfo/common-base";
import * as API from "../../api";
import i18n from "components/multiLanguage/languagesConfiguration";
export const CustHeaderFormMetadata = (unique) => {
  return {
    form: {
      name: "headerForm",
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
            // spacing: 0.5,
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
          componentType: "numberFormat",
        },
        name: "CUSTOMER_ID",
        label: "CustID",
        isReadOnly: true,
        placeholder: "CustomerID",
        GridProps: {
          xs: 3,
          sm: 1.5,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "REQ_CD",
        label: "ReqID",
        placeholder: "reqId",
        isReadOnly: true,
        GridProps: {
          xs: 3,
          sm: 1.5,
          md: 1.5,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "CATEG_CD",
        label: "CategoryConstitution",
        placeholder: "CategoryConstitution",
        required: true,
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (!Boolean(formState?.state?.isFreshEntryctx)) {
            return true;
          }
          return false;
        },
        options: async (dependentValue?, formState?, _?, authState?) => {
          if (Boolean(formState?.state?.entityTypectx)) {
            return await API.getCIFCategories({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              ENTITY_TYPE: formState?.state?.entityTypectx ?? "",
            });
          }
        },
        validate: (columnValue, dependent, formState) => {
          if (!Boolean(columnValue?.value)) {
            return "CategoryConstitutionReqired";
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
          if (currentField?.value)
            formState?.handleCategoryChangectx(
              {},
              currentField?.optionData?.[0]
            );
          // formState?.setDataOnFieldChange("CATEG_CD", {
          //   currentField,
          // });
        },
        isFieldFocused:
          unique?.customerIDctx === "" &&
          unique?.req_cd_ctx === "" &&
          unique?.constitutionValuectx === null
            ? true
            : false,
        _optionsKey: `categoryConstitution${unique?.entityTypectx}`,
        GridProps: {
          xs: 6,
          sm: 4,
          md: 3.5,
          lg: 2.5,
          xl: 2.5,
        },
      },
      {
        render: {
          componentType: "formbutton",
        },
        name: "UPD_CATEG",
        label: "...",
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return Boolean(formState?.state?.formmodectx === "view");
        },
        shouldExclude: (fieldData, dependentFieldsValues, formState) => {
          if (
            !formState?.state?.isFreshEntryctx &&
            !formState?.state?.isDraftSavedctx &&
            Boolean(formState?.state?.customerIDctx)
          ) {
            return false;
          }
          return true;
        },
        ignoreInSubmit: true,
        GridProps: {
          xs: 1,
          md: 1,
          sm: 2,
          lg: 1,
          xl: 1,
        },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "ACCT_TYPE",
        label: "AcctType",
        placeholder: "EnterAccountType",
        required: true,
        isFieldFocused:
          unique?.customerIDctx === "" &&
          unique?.req_cd_ctx === "" &&
          unique?.constitutionValuectx !== null &&
          unique?.accTypeValuectx === null
            ? true
            : false,
        options: async (dependentValue?, formState?, _?, authState?) => {
          if (Boolean(formState?.state?.entityTypectx)) {
            return await API.getPMISCData("CKYC_ACCT_TYPE");
          }
        },
        shouldExclude: (fieldData, dependentFieldsValues, formState) => {
          if (formState?.state?.entityTypectx !== "C") {
            return false;
          }
          return true;
        },
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return Boolean(formState?.state?.formmodectx === "view");
        },
        validate: (columnValue, dependent, formState) => {
          if (!Boolean(columnValue?.value)) {
            return "AccountTypeReqired";
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
          formState?.handleAccTypeVal(currentField?.value);
          // formState?.setDataOnFieldChange("CATEG_CD", {
          //   currentField,
          // });
        },
        _optionsKey: `acctTypePMISCData${unique?.entityTypectx}`,
        GridProps: {
          xs: 3,
          sm: 3,
          md: 2,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "KYC_NUMBER",
        label: "CkycNo",
        placeholder: "CkycNo",
        isReadOnly: true,
        GridProps: {
          xs: 3,
          sm: 2,
          md: 2,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: { componentType: "checkbox" },
        defaultValue: true,
        name: "ACTIVE_FLAG",
        label: "Active",
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (formState?.state?.formmodectx === "edit") {
            return false;
          }
          return true;
        },
        shouldExclude: (fieldData, dependentFieldsValues, formState) => {
          if (Boolean(formState?.state?.customerIDctx)) {
            return false;
          }
          return true;
        },
        validationRun: "all",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (!Boolean(currentField?.value)) {
            const validateActive = await API?.validateActiveField({
              COMP_CD: authState?.companyID ?? "",
              CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
              USER_NAME: authState?.user?.id ?? "",
              DISPLAY_LANGUAG: i18n.resolvedLanguage,
            });
            for (let i = 0; i < validateActive?.length; i++) {
              if (validateActive?.[i]?.STATUS === "999") {
                const btnName = await formState.MessageBox({
                  messageTitle:
                    validateActive?.[i]?.MSG_TITLE ?? "ValidationFailed",
                  message: validateActive?.[i]?.MSG,
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  formState?.setDependecyDialogOpen(true);
                  return {
                    ACTIVE_FLAG: {
                      value: true,
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                  };
                }
              } else if (validateActive?.[i]?.STATUS === "99") {
                const btnName = await formState.MessageBox({
                  messageTitle:
                    validateActive?.[i]?.MSG_TITLE ?? "Confirmation",
                  message: validateActive?.[i]?.MSG,
                  buttonNames: ["Yes", "No"],
                  defFocusBtnName: "Yes",
                  icon: "CONFIRM",
                });
                if (btnName === "No") {
                  return {
                    ACTIVE_FLAG: {
                      value: true,
                      ignoreUpdate: false,
                      isFieldFocused: true,
                    },
                  };
                }
                break;
              } else if (validateActive?.[i]?.STATUS === "9") {
                await formState.MessageBox({
                  messageTitle: validateActive?.[i]?.MSG_TITLE ?? "Alert",
                  message: validateActive?.[i]?.MSG,
                  icon: "WARNING",
                });
              } else if (validateActive?.[i]?.STATUS === "0") {
                return {
                  INACTIVE_DT: {
                    value: formState?.authState?.workingDate,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        GridProps: { xs: 1, md: 1, sm: 1, lg: 1, xl: 1 },
      },
      {
        render: { componentType: "datePicker" },
        name: "INACTIVE_DT",
        label: "InactiveDate",
        placeholder: "DD/MM/YYYY",
        dependentFields: ["ACTIVE_FLAG"],
        isReadOnly: true,
        shouldExclude: (fieldData, dependentFieldsValues, formState) => {
          if (
            !Boolean(dependentFieldsValues?.ACTIVE_FLAG?.value) ||
            Boolean(dependentFieldsValues?.ACTIVE_FLAG?.value === "N")
          ) {
            return false;
          } else {
            return true;
          }
        },
        GridProps: {
          xs: 3,
          sm: 2,
          md: 2.5,
          lg: 1.5,
          xl: 1.5,
        },
      },
    ],
  };
};
