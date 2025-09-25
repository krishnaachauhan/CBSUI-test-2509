import {
  DefaultErrorObject,
  greaterThanDate,
  lessThanInclusiveDate,
} from "@acuteinfo/common-base";
import * as API from "../../../../api";
import { isValid } from "date-fns";
import { t } from "i18next";
import { PREVENT_SPECIAL_CHAR, REGEX } from "components/utilFunction/constant";
import { handleDisplayMessages } from "components/utilFunction/function";
import { getUdyamRegNoStatus } from "pages_audit/pages/operations/acct-mst/api";

export const kyc_proof_of_identity_meta_data = (unique) => {
  return {
    form: {
      name: "kyc_poi_details_form",
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
          componentType: "autocomplete",
        },
        name: "FORM_60",
        label: "Form6061",
        placeholder: "selectForm6061",
        defaultValue: "N",
        type: "text",
        required: true,
        dependentFields: ["PAN_NO_HIDDEN"],
        isFieldFocused: Boolean(unique?.entityTypectx === "I"),
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        options: [
          { label: "Form60", value: "Y" },
          { label: "Form 61", value: "F" },
          { label: "No", value: "N" },
        ],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value === "F" || field?.value === "Y") {
            return {
              PAN_NO: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          } else {
            return {
              PAN_NO: {
                value: dependentFieldsValues?.PAN_NO_HIDDEN?.value ?? "",
              },
            };
          }
        },
        validate: (columnValue, dependentFieldsValues) => {
          if (!columnValue?.value) {
            return "Form6061IsRequired";
          }
          return "";
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "VISIBLE_DUP_PAN",
        ignoreInSubmit: true,
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "PAN_NO",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "PAN_NO_HIDDEN",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "UNIQUE_ID",
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ELECTION_CARD_NO",
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "NREGA_JOB_CARD",
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "OTHER_DOC_NO",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "PASSPORT_NO",
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "DRIVING_LICENSE_NO",
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_PAN_NO",
        label: "PANNo",
        placeholder: "AAAAA1111A",
        type: "text",
        txtTransform: "uppercase",
        dependentFields: ["FORM_60"],
        required: true,
        runPostValidationHookAlways: true,
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          const value = field?.value ?? "";
          const clearPANFields = {
            MASKED_PAN_NO: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: true,
            },
            PAN_NO: { value: "", ignoreUpdate: false, isFieldFocused: false },
            PAN_NO_HIDDEN: {
              value: "",
            },
          };
          const setPANFields = {
            MASKED_PAN_NO: {
              value: value,
              ignoreUpdate: true,
              isFieldFocused: false,
            },
            PAN_NO: {
              value: value,
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            PAN_NO_HIDDEN: {
              value: value,
            },
          };

          if (value) {
            if (!REGEX?.ALPHA_NUMERIC?.test(value)) {
              const btnName = await formState.MessageBox({
                messageTitle: "ValidationFailed",
                message: "SpecialCharacterNotAllowed",
                icon: "ERROR",
              });
              if (btnName === "Ok") {
                return clearPANFields;
              }
            } else if (value?.length < 10) {
              const btnName = await formState.MessageBox({
                messageTitle: "ValidationFailed",
                message: "Pleaseenter10characterPAN",
                icon: "ERROR",
              });
              if (btnName === "Ok") {
                return clearPANFields;
              }
            } else {
              formState?.handleButtonDisable(true);
              const postData = await API.validatePAN(field);
              formState?.handleButtonDisable(false);
              const panStatus = postData?.[0]?.PAN_STATUS;
              if (panStatus !== "Y") {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "PleaseEnterValidPAN",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return clearPANFields;
                }
              } else if (postData?.[0]?.PAN_STATUS === "Y") {
                formState?.handleButtonDisable(true);
                const DuplicatValidation: any = await API.checkDuplication({
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  CATEG_CD: formState?.CATEG_CD ?? "",
                  CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
                  DATAVALUE: value ?? "",
                  CHECK_FOR: "1",
                });
                formState?.handleButtonDisable(false);
                let returnVal;
                if (DuplicatValidation?.length > 0) {
                  const response = await handleDisplayMessages(
                    DuplicatValidation,
                    formState?.MessageBox
                  );

                  if (Object.keys(response).length > 0) {
                    returnVal = DuplicatValidation;
                  } else {
                    returnVal = "";
                  }
                }
                if (returnVal) {
                  const isDuplicate = returnVal?.[0]?.OPEN_REASON === "Y";

                  if (isDuplicate) {
                    const result = await formState?.asyncFunction();
                    if (result === "Clear") {
                      return clearPANFields;
                    } else if (result === "Saved") {
                      return setPANFields;
                    }
                    return result;
                  } else if (!isDuplicate) {
                    return setPANFields;
                  }
                } else {
                  return clearPANFields;
                }
              }
            }
          } else if (field?.value === "") {
            return {
              PAN_NO: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              PAN_NO_HIDDEN: {
                value: "",
              },
            };
          }
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        validate: (columnValue, dependentFieldsValues) => {
          if (
            dependentFieldsValues?.FORM_60?.value === "N" &&
            !columnValue?.value
          ) {
            return "PanNoIsRequired";
          }
          return "";
        },

        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !Boolean(dependentFieldsValues?.FORM_60?.value === "N");
        },
        maxLength: 10,
      },
      {
        render: {
          componentType: "formbutton",
        },
        name: "PAN_DUP_DTL_BTN",
        label: ". . .",
        dependentFields: ["PAN_NO", "VISIBLE_DUP_PAN"],
        ignoreInSubmit: true,
        isReadOnly: (fieldValue, dependentFields, formState) => {
          return !Boolean(formState?.state?.formmodectx !== "view");
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return !Boolean(
            dependentFieldsValues?.VISIBLE_DUP_PAN?.value === "Y"
          );
        },
        GridProps: { xs: 6, sm: 4, md: 1, lg: 1, xl: 1 },
      },
      {
        render: { componentType: "checkbox" },
        name: "ADHAR_PAN_LINK",
        label: "aadharPanLink",
        dependentFields: ["FORM_60"],
        defaultValue: true,
        validationRun: "onChange",
        GridProps: { xs: 6, sm: 4, md: 2, lg: 1, xl: 1 },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          const FORM60 = dependentFieldsValues?.FORM_60?.value;
          if (formState?.state?.entityTypectx === "I") {
            return !Boolean(dependentFieldsValues?.FORM_60?.value === "N");
          } else if (formState?.state?.entityTypectx === "C") {
            return true;
          }
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        postValidationSetCrossFieldValues: async (currentField, formState) => {
          if (currentField?.value === false) {
            let btnName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "aadharPanLinkValidationMsg",
              icon: "WARNING",
            });
          }
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_UNIQUE_ID",
        label: "UIDAadhaar",
        placeholder: "UIDAadhaar",
        type: "text",
        maxLength: 12,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 3 },
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          const value = field?.value ?? "";
          const clearUniqueIdFields = {
            UNIQUE_ID: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            MASKED_UNIQUE_ID: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: true,
            },
          };
          const setUniqueIdFields = (val: string, isDuplicate: boolean) => ({
            MASKED_UNIQUE_ID: {
              value: isDuplicate ? val : "",
              isFieldFocused: !isDuplicate,
              ignoreUpdate: isDuplicate,
            },
            UNIQUE_ID: {
              value: isDuplicate ? val : "",
            },
          });
          if (value) {
            formState?.handleButtonDisable(true);
            const postData = await API.validateUniqueId(field);
            formState?.handleButtonDisable(false);
            const uidStatus = postData?.[0]?.UID_STATUS;
            if (uidStatus === "N") {
              const btnName = await formState.MessageBox({
                messageTitle: "ValidationFailed",
                message: "UniqueIDLength",
                icon: "ERROR",
              });
              if (btnName === "Ok") {
                return clearUniqueIdFields;
              }
            } else if (uidStatus === "I") {
              const btnName = await formState.MessageBox({
                messageTitle: "ValidationFailed",
                message: "UniqueIDisinvalid",
                icon: "ERROR",
              });
              if (btnName === "Ok") {
                return clearUniqueIdFields;
              }
            } else if (uidStatus === "Y") {
              formState?.handleButtonDisable(true);
              const dupValidateRes = await API.checkDuplication({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                CATEG_CD: formState?.CATEG_CD ?? "",
                CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
                DATAVALUE: value ?? "",
                CHECK_FOR: "4",
              });
              formState?.handleButtonDisable(false);
              let returnVal = false;
              if (dupValidateRes?.length > 0) {
                const response = await handleDisplayMessages(
                  dupValidateRes,
                  formState?.MessageBox
                );
                return setUniqueIdFields(
                  value,
                  (returnVal = Object.keys(response).length > 0)
                );
              }
            }
          } else if (value === "") {
            return {
              UNIQUE_ID: { value: "" },
            };
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_ELECTION_CARD_NO",
        label: "VoterId",
        placeholder: "VoterId",
        maxLength: 20,
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue) => {
          if (columnValue?.value?.includes(" ")) {
            return "SpaceNotAllowed";
          }
          if (columnValue?.value) {
            if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value) {
            formState?.handleButtonDisable(true);
            const dupValidateRes = await API.checkDuplication({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              CATEG_CD: formState?.CATEG_CD ?? "",
              CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
              DATAVALUE: field?.value ?? "",
              CHECK_FOR: "5",
            });
            formState?.handleButtonDisable(false);
            let returnVal;
            if (dupValidateRes?.length > 0) {
              const response = await handleDisplayMessages(
                dupValidateRes,
                formState?.MessageBox
              );

              if (Object.keys(response).length > 0) {
                returnVal = response;
              } else {
                returnVal = "";
              }
            }
            return {
              MASKED_ELECTION_CARD_NO: {
                value: returnVal !== "" ? field?.value : "",
                isFieldFocused: !returnVal,
                ignoreUpdate: returnVal,
              },
              ELECTION_CARD_NO: { value: returnVal !== "" ? field?.value : "" },
            };
          } else if (field?.value === "") {
            return {
              ELECTION_CARD_NO: { value: "" },
            };
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 3 },
      },
      {
        render: {
          componentType: "select",
        },
        name: "EXPLICIT_TDS",
        label: "ExplicitTDS",
        defaultValue: "N",
        placeholder: "ExplicitTDS",
        validationRun: "all",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        options: [
          { label: "Yes", value: "T" },
          { label: "No", value: "N" },
        ],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(field?.value)) {
            if (field?.value === "T") {
              const buttonName = await formState.MessageBox({
                messageTitle: "CONFIRMATION",
                message:
                  "SystemWillDeductTDSFromCustomersInterestEvenIfItIsUnderTDSLimit",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (buttonName === "No") {
                return {
                  EXPLICIT_TDS: {
                    value: "N",
                  },
                };
              }
              if (buttonName === "Yes") {
                return {
                  NREGA_JOB_CARD: {
                    value: "",
                    isFieldFocused: true,
                  },
                };
              }
            }
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_NREGA_JOB_CARD",
        label: "NREGA",
        maxLength: 20,
        placeholder: "NREGA",
        type: "text",
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue) => {
          if (columnValue?.value?.includes(" ")) {
            return "SpaceNotAllowed";
          }
          if (columnValue?.value) {
            if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentField
        ) => {
          if (formState?.isSubmitting) return {};
          return {
            NREGA_JOB_CARD: {
              value: currentField.value ?? "",
            },
          };
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "OTHER_DOC",
        label: "OtherPoI",
        placeholder: "OtherPoI",
        type: "text",
        txtTransform: "uppercase",
        maxLength: 50,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
        },
        validate: (columnValue) => {
          if (!/^[a-zA-Z\s]*$/.test(columnValue?.value)) {
            return "PleaseEnterCharacterValue";
          }
          return "";
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_OTHER_DOC_NO",
        label: "PoINo",
        placeholder: "PoINo",
        maxLength: 25,
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue, allField, flag) => {
          if (columnValue?.value?.includes(" ")) {
            return "SpaceNotAllowed";
          }
          if (columnValue?.value) {
            if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentField
        ) => {
          if (formState?.isSubmitting) return {};
          return {
            OTHER_DOC_NO: {
              value: currentField.value ?? "",
            },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },

      {
        render: {
          componentType: "autocomplete",
        },
        name: "RATE_CD",
        label: "Rating",
        placeholder: "Rating",
        options: async (dependentValue, formState, _, authState) =>
          await API.getRatingOpDTL(
            authState?.companyID,
            authState?.user?.branchCode
          ),
        _optionsKey: "ratingOpdtl",
        defaultOptionLabel: "Rating",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
      },

      {
        render: {
          componentType: "textField",
        },
        name: "GSTIN",
        label: "GSTIN",
        placeholder: "GSTIN",
        maxLength: 15,
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        validate: async (columnValue, allField, flag) => {
          const TIN_ISSUING_COUNTRY = flag?.TIN_ISSUING_COUNTRY;
          const TIN = flag?.TIN;
          if (!Boolean(columnValue?.value)) {
            if (Boolean(TIN_ISSUING_COUNTRY) && !Boolean(TIN)) {
              return "GSTINIsRequired";
            } else {
              return "";
            }
          } else {
            return await API.validateGSTIN(columnValue, allField, flag);
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },

      {
        render: {
          componentType: "numberFormat",
        },
        name: "DIN_NO",
        label: "DIN",
        placeholder: "DIN",
        maxLength: 8,
        type: "text",
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },

      {
        render: {
          componentType: "divider",
          sequence: 1,
        },
        name: "passportDivider",
        label: "PassportDetails",
        DividerProps: {
          sx: { color: "var(--theme-color1)", fontWeight: "500" },
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_PASSPORT_NO",
        label: "PassportNo",
        placeholder: "EnterPassportNo",
        maxLength: 20,
        type: "text",
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue, allField, flag) => {
          if (
            !Boolean(columnValue.value) &&
            Boolean(
              flag.RESIDENCE_STATUS &&
                (flag.RESIDENCE_STATUS === "02" ||
                  flag.RESIDENCE_STATUS === "03")
            )
          ) {
            return "PassportIsRequired";
          }
          if (columnValue?.value?.includes(" ")) {
            return "SpaceNotAllowed";
          }
          if (columnValue?.value) {
            if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value) {
            formState?.handleButtonDisable(true);
            const dupValidateRes = await API.checkDuplication({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              CATEG_CD: formState?.CATEG_CD ?? "",
              CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
              DATAVALUE: field?.value ?? "",
              CHECK_FOR: "2",
            });
            formState?.handleButtonDisable(false);
            let returnVal;
            if (dupValidateRes?.length > 0) {
              const response = await handleDisplayMessages(
                dupValidateRes,
                formState?.MessageBox
              );

              if (Object.keys(response).length > 0) {
                returnVal = response;
              } else {
                returnVal = "";
              }
            }
            return {
              MASKED_PASSPORT_NO: {
                value: returnVal !== "" ? field?.value : "",
                isFieldFocused: !returnVal,
                ignoreUpdate: returnVal,
              },
              PASSPORT_NO: { value: returnVal !== "" ? field?.value : "" },
              PASSPORT_AUTHORITY_CD: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              PASSPORT_ISSUE_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              PASSPORT_EXPIRY_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          } else if (field?.value === "") {
            return {
              PASSPORT_NO: { value: "", ignoreUpdate: false },
              PASSPORT_AUTHORITY_CD: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              PASSPORT_ISSUE_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              PASSPORT_EXPIRY_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "PASSPORT_AUTHORITY_CD",
        label: "Autho",
        placeholder: "Autho",
        dependentFields: ["MASKED_PASSPORT_NO"],
        options: async () => await API.getPMISCData("Authority"),
        _optionsKey: "passportAuthority",
        validate: (columnValue, allField, flag) => {
          if (!Boolean(columnValue.value)) {
            const passport = allField?.MASKED_PASSPORT_NO?.value;
            if (Boolean(passport)) {
              return "AuthoIsRequired";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          return {
            PASSPORT_ISSUE_DT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            PASSPORT_EXPIRY_DT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "PASSPORT_ISSUE_DT",
        label: "IssueDate",
        placeholder: "IssueDate",
        dependentFields: ["MASKED_PASSPORT_NO"],
        isMaxWorkingDate: true,
        validate: (columnValue, allField, flag) => {
          if (!Boolean(columnValue.value)) {
            const passport = allField?.MASKED_PASSPORT_NO?.value;
            if (Boolean(passport)) {
              return "IssueDateRequired";
            }
            return "";
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
          if (Boolean(currentField?.value)) {
            if (!isValid(new Date(currentField?.value))) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  PASSPORT_ISSUE_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (currentField?._maxDt) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("PassportIssueDateCantBeGreaterThanTodaysDate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  PASSPORT_ISSUE_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "PASSPORT_EXPIRY_DT",
        label: "ExpiryDate",
        placeholder: "ExpiryDate",
        dependentFields: ["MASKED_PASSPORT_NO", "PASSPORT_ISSUE_DT"],
        isMinWorkingDate: true,
        validate: (currentField, dependentField, formState, ...rest) => {
          const passport = dependentField?.MASKED_PASSPORT_NO?.value;
          if (Boolean(passport) && currentField?.value === "") {
            return "ExpiryDateRequired";
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
          if (Boolean(currentField?.value)) {
            if (!isValid(new Date(currentField?.value))) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  PASSPORT_EXPIRY_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              lessThanInclusiveDate(
                new Date(currentField?.value).setHours(0, 0, 0, 0),
                new Date(authState?.workingDate).setHours(0, 0, 0, 0)
              )
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t(
                  "PassportExpiryDatecantBeLessThanOrEqualToTodaysDate"
                ),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  PASSPORT_EXPIRY_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "divider",
          sequence: 1,
        },
        name: "drivingLicenseDivider",
        label: "DrivingLicenseDetails",
        DividerProps: {
          sx: { color: "var(--theme-color1)", fontWeight: "500" },
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "MASKED_DRIVING_LICENSE_NO",
        label: "drivingLiceneceNo",
        placeholder: "drivingLiceneceNo",
        maxLength: 20,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value) {
            formState?.handleButtonDisable(true);
            const dupValidateRes = await API.checkDuplication({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              CATEG_CD: formState?.CATEG_CD ?? "",
              CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
              DATAVALUE: field?.value ?? "",
              CHECK_FOR: "3",
            });
            formState?.handleButtonDisable(false);
            let returnVal;
            if (dupValidateRes?.length > 0) {
              const response = await handleDisplayMessages(
                dupValidateRes,
                formState?.MessageBox
              );

              if (Object.keys(response).length > 0) {
                returnVal = response;
              } else {
                returnVal = "";
              }
            }
            return {
              MASKED_DRIVING_LICENSE_NO: {
                value: returnVal !== "" ? field?.value : "",
                isFieldFocused: !returnVal,
                ignoreUpdate: returnVal,
              },
              DRIVING_LICENSE_NO: {
                value: returnVal !== "" ? field?.value : "",
              },
              DRIVING_LICENSE_AUTHORITY_CD: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              DRIVING_LICENSE_ISSUE_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              DRIVING_LICENSE_EXPIRY_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          } else if (field?.value === "") {
            return {
              DRIVING_LICENSE_NO: { value: "" },
              DRIVING_LICENSE_AUTHORITY_CD: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              DRIVING_LICENSE_ISSUE_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              DRIVING_LICENSE_EXPIRY_DT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        preventSpecialChars: () => {
          return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
        },
        validate: (columnValue) => {
          if (columnValue?.value?.includes(" ")) {
            return "SpaceNotAllowed";
          }
          if (columnValue?.value) {
            if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
        },
        type: "text",
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "DRIVING_LICENSE_AUTHORITY_CD",
        label: "Autho",
        options: async () => await API.getPMISCData("Authority"),
        _optionsKey: "drivingLicenseAuthority",
        dependentFields: ["MASKED_DRIVING_LICENSE_NO"],
        validate: (columnValue, allField, flag) => {
          if (!Boolean(columnValue?.value)) {
            const driving = allField?.MASKED_DRIVING_LICENSE_NO?.value;
            if (Boolean(driving)) {
              return "AuthoIsRequired";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          ___,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          return {
            DRIVING_LICENSE_ISSUE_DT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            DRIVING_LICENSE_EXPIRY_DT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        placeholder: "Autho",
        type: "text",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "DRIVING_LICENSE_ISSUE_DT",
        label: "IssueDate",
        dependentFields: ["MASKED_DRIVING_LICENSE_NO"],
        isMaxWorkingDate: true,
        validate: (columnValue, allField, flag) => {
          if (!Boolean(columnValue.value)) {
            const driving = allField?.MASKED_DRIVING_LICENSE_NO?.value;
            if (Boolean(driving)) {
              return "IssueDateRequired";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(currentField?.value)) {
            if (!isValid(new Date(currentField?.value))) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  DRIVING_LICENSE_ISSUE_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (currentField?._maxDt) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t(
                  "DrivingLicenseIssueDateCantBeGreaterThanTodaysDate"
                ),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  DRIVING_LICENSE_ISSUE_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        placeholder: "IssueDate",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "DRIVING_LICENSE_EXPIRY_DT",
        label: "ExpiryDate",
        dependentFields: ["MASKED_DRIVING_LICENSE_NO"],
        isMinWorkingDate: true,
        placeholder: "ExpiryDate",
        validate: (columnValue, allField, flag) => {
          if (!Boolean(columnValue?.value)) {
            const driving = allField?.MASKED_DRIVING_LICENSE_NO?.value;
            if (Boolean(driving)) {
              return "ExpiryDateRequired";
            }
          }
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (Boolean(currentField?.value)) {
            if (!isValid(new Date(currentField?.value))) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("Mustbeavaliddate"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  DRIVING_LICENSE_EXPIRY_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              lessThanInclusiveDate(
                new Date(currentField?.value).setHours(0, 0, 0, 0),
                new Date(authState?.workingDate).setHours(0, 0, 0, 0)
              )
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t(
                  "DrivingLicenseExpiryDateCantBeLessThanOrEqualToTodaysDate"
                ),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                return {
                  DRIVING_LICENSE_EXPIRY_DT: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          }
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx === "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx === "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "UDYAM_REG_NO",
        label: "URN/UAN",
        placeholder: "URN/UAN",
        type: "text",
        maxLength: 20,
        txtTransform: "uppercase",
        preventSpecialChars: () => {
          return sessionStorage.getItem("specialChar") || "";
        },
        postValidationSetCrossFieldValues: async (currentField, formState) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.value) {
            formState?.handleButtonDisable(true);
            const validationMSG = await getUdyamRegNoStatus(currentField.value);
            formState?.handleButtonDisable(false);
            if (Boolean(validationMSG)) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "UdyamValidationFailed",
                message: validationMSG ?? "",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  UDYAM_REG_NO: { value: "", ignoreUpdate: true },
                };
              }
            }
          }
          return {};
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.state?.entityTypectx !== "C";
        },
        ignoreInSubmit: (dependentField, formState, currentField) => {
          return formState?.state?.entityTypectx !== "C";
        },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      },
    ],
  };
};

export const kyc_proof_of_address_meta_data = {
  form: {
    name: "kyc_poa_individual_details_form",
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
        componentType: "divider",
        sequence: 1,
      },
      name: "currentAddDivider",
      label: "CurrentAddress",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ADDRESS_TYPE",
      label: "AddressType",
      placeholder: "SelectAddressType",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
      options: async () => await API.getPMISCData("ADDRESS_TYPE"),
      _optionsKey: "currentAddType",
      dependentFields: ["SAME_AS_PER"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFieldsValues?.SAME_AS_PER?.value) {
          return {
            LOC_ADD_TYPE: {
              value: field?.value ?? "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        }
        return {};
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "Line1",
      required: true,
      maxLength: 50,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      inputProps: {
        onInput: (e) => {
          e.target.value = e.target.value.replace(/  +/g, " ");
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Line1IsRequired"] }],
      },
      placeholder: "Address1",
      type: "text",
      txtTransform: "uppercase",
      dependentFields: ["SAME_AS_PER"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFieldsValues?.SAME_AS_PER?.value) {
          return {
            LOC_ADD1: {
              value: field?.value ?? "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        }
        return {};
      },
      GridProps: { xs: 12, sm: 5, md: 3.2, lg: 3.2, xl: 3.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD2",
      label: "Line2",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      placeholder: "Address2",
      maxLength: 50,
      type: "text",
      inputProps: {
        onInput: (e) => {
          e.target.value = e.target.value.replace(/  +/g, " ");
        },
      },
      txtTransform: "uppercase",
      dependentFields: ["SAME_AS_PER"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFieldsValues?.SAME_AS_PER?.value) {
          return {
            LOC_ADD2: {
              value: field?.value ?? "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        }
        return {};
      },
      GridProps: { xs: 12, sm: 5, md: 3.2, lg: 3.2, xl: 3.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD3",
      label: "Line3",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      placeholder: "Address3",
      maxLength: 50,
      inputProps: {
        onInput: (e) => {
          e.target.value = e.target.value.replace(/  +/g, " ");
        },
      },
      type: "text",
      txtTransform: "uppercase",
      dependentFields: ["SAME_AS_PER"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFieldsValues?.SAME_AS_PER?.value) {
          return {
            LOC_ADD3: {
              value: field?.value ?? "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        }
        return {};
      },
      GridProps: { xs: 12, sm: 5, md: 3.2, lg: 3.2, xl: 3.3 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PIN_CODE",
      label: "PIN",
      runPostValidationHookAlways: true,
      required: true,
      maxLength: 6,
      FormatProps: {
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      validate: (columnValue) => {
        const PIN = columnValue.value;
        if (!Boolean(PIN)) {
          return "PINIsRequired";
        } else if (Boolean(PIN) && PIN.length < 6) {
          return "PinCodeShouldBeOfSixDigits";
        }
      },
      placeholder: "EnterPinCode",
      type: "text",
      dependentFields: ["SAME_AS_PER"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        const pinValue = field?.value ?? "";
        if (!Boolean(pinValue) || pinValue.length < 6) {
          if (dependentFieldsValues?.SAME_AS_PER?.value) {
            return {
              AREA_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              CITY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              DISTRICT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              STATE: { value: "", ignoreUpdate: false, isFieldFocused: false },
              COUNTRY: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              STATE_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_PIN_CODE: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_AREA_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_CITY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_DISTRICT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_STATE: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_COUNTRY: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_STATE_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          } else {
            return {
              AREA_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              CITY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              DISTRICT: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              STATE: { value: "", ignoreUpdate: false, isFieldFocused: false },
              COUNTRY: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              STATE_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
            };
          }
        } else if (Boolean(pinValue) || pinValue.length === 6) {
          if (
            Boolean(formState?.state?.customerIDctx) ||
            Boolean(formState?.state?.req_cd_ctx)
          ) {
            const btnName = await formState.MessageBox({
              messageTitle: "Confirmation",
              message: "Doyouwanttopopulatearearelateddetails",
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnName === "No") {
              if (dependentFieldsValues?.SAME_AS_PER?.value) {
                return {
                  PIN_CODE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                  AREA_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  LOC_PIN_CODE: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: false,
                  },
                };
              } else {
                return {
                  PIN_CODE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                  AREA_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                };
              }
            }
            if (btnName === "Yes") {
              if (dependentFieldsValues?.SAME_AS_PER?.value) {
                return {
                  PIN_CODE: {
                    value: pinValue,
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                  LOC_PIN_CODE: {
                    value: pinValue,
                    isFieldFocused: false,
                    ignoreUpdate: false,
                  },
                  AREA_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              } else {
                return {
                  PIN_CODE: {
                    value: pinValue,
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                  AREA_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          } else {
            if (dependentFieldsValues?.SAME_AS_PER?.value) {
              return {
                PIN_CODE: {
                  value: pinValue,
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                LOC_PIN_CODE: {
                  value: pinValue,
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                AREA_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            } else {
              return {
                PIN_CODE: {
                  value: pinValue,
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                AREA_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
        return {};
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      runPostValidationHookAlways: true,
      name: "AREA_CD",
      label: "Area",
      dependentFields: ["PIN_CODE", "SAME_AS_PER"],
      disableCaching: true,
      options: async (...arg) =>
        await API.getAreaList({
          COMP_CD: arg?.[3]?.companyID ?? "",
          BRANCH_CD: arg?.[3]?.user?.branchCode ?? "",
          PIN_CODE: arg?.[2]?.PIN_CODE?.value ?? "",
          FLAG: "P",
          PARENT_AREA: "",
        }),
      _optionsKey: "indSubareaOp",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        const pin_code = dependentFields.PIN_CODE.value;
        if (!Boolean(pin_code)) {
          return true;
        } else if (Boolean(pin_code) && pin_code.length < 6) {
          return true;
        }
        return false;
      },
      postValidationSetCrossFieldValues: (
        field,
        formState,
        ___,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};

        if (field?.value) {
          const currentdata = field?.optionData?.[0];
          if (dependentFields?.SAME_AS_PER?.value) {
            return {
              CITY_CD: {
                value: currentdata?.CITY_CD ?? "",
                ignoreUpdate: false,
              },
              DISTRICT: {
                value: currentdata?.DISTRICT_NM ?? "",
                ignoreUpdate: false,
              },
              STATE: {
                value: currentdata?.STATE_NM ?? "",
                ignoreUpdate: false,
              },
              COUNTRY: {
                value: currentdata?.COUNTRY_NM ?? "",
                ignoreUpdate: false,
              },
              STATE_CD: {
                value: currentdata?.STATE_CD ?? "",
                ignoreUpdate: false,
              },
              COUNTRY_CD: {
                value: currentdata?.COUNTRY_CD ?? "",
                ignoreUpdate: false,
              },
              LOC_AREA_CD: {
                value: field?.value ?? "",
                ignoreUpdate: false,
              },
              LOC_CITY_CD: {
                value: currentdata?.CITY_CD ?? "",
                ignoreUpdate: false,
              },
              LOC_DISTRICT: {
                value: currentdata?.DISTRICT_NM ?? "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value: currentdata?.STATE_NM ?? "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value: currentdata?.COUNTRY_NM ?? "",
                ignoreUpdate: false,
              },
              LOC_STATE_CD: {
                value: currentdata?.STATE_CD ?? "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value: currentdata?.COUNTRY_CD ?? "",
                ignoreUpdate: false,
              },
            };
          } else {
            return {
              CITY_CD: {
                value: currentdata?.CITY_CD ?? "",
                ignoreUpdate: false,
              },
              DISTRICT: {
                value: currentdata?.DISTRICT_NM ?? "",
                ignoreUpdate: false,
              },
              STATE: {
                value: currentdata?.STATE_NM ?? "",
                ignoreUpdate: false,
              },
              COUNTRY: {
                value: currentdata?.COUNTRY_NM ?? "",
                ignoreUpdate: false,
              },
              STATE_CD: {
                value: currentdata?.STATE_CD ?? "",
                ignoreUpdate: false,
              },
              COUNTRY_CD: {
                value: currentdata?.COUNTRY_CD ?? "",
                ignoreUpdate: false,
              },
            };
          }
        } else if (!field?.value) {
          if (dependentFields?.SAME_AS_PER?.value) {
            return {
              CITY_CD: {
                value: "",
                ignoreUpdate: false,
              },
              DISTRICT: {
                value: "",
                ignoreUpdate: false,
              },
              STATE: {
                value: "",
                ignoreUpdate: false,
              },
              COUNTRY: {
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
              LOC_AREA_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_CITY_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_DISTRICT: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
              },
            };
          } else {
            return {
              CITY_CD: {
                value: "",
                ignoreUpdate: false,
              },
              DISTRICT: {
                value: "",
                ignoreUpdate: false,
              },
              STATE: { value: "", ignoreUpdate: false },
              COUNTRY: {
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
            };
          }
        }
        return {};
      },
      placeholder: "Area",
      defaultOptionLabel: "Area",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CITY_CD",
      label: "City",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CityIsRequired"] }],
      },
      // disableCaching: true,
      dependentFields: ["AREA_CD", "SAME_AS_PER"],
      isReadOnly: (formData, dependentFields) => {
        const areaOptions = dependentFields?.AREA_CD?.optionData;
        return Array.isArray(areaOptions) && areaOptions.length > 0;
      },
      options: async (dependentValue, formState, _, authState) =>
        await API.CityTypeOP(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "cityTypeOP",
      placeholder: "City",
      runPostValidationHookAlways: true,
      type: "text",
      postValidationSetCrossFieldValues: (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        const cityOptionData = currentField?.optionData?.[0] || [];
        if (currentField?.value) {
          if (dependentFieldsValues?.SAME_AS_PER?.value) {
            return {
              DISTRICT: {
                value:
                  cityOptionData?.DISTRICT ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]
                    ?.DISTRICT_NM ||
                  "",
                ignoreUpdate: false,
              },
              STATE: {
                value:
                  cityOptionData?.STATE ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.STATE_NM ||
                  "",
                ignoreUpdate: false,
              },
              COUNTRY: {
                value:
                  cityOptionData?.COUNTRY ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.COUNTRY_NM ||
                  "",
              },
              STATE_CD: {
                value:
                  cityOptionData?.STATE_CD ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.STATE_CD ||
                  "",
                ignoreUpdate: false,
              },
              COUNTRY_CD: {
                value:
                  cityOptionData?.COUNTRY_CD ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.COUNTRY_CD ||
                  "",
                ignoreUpdate: false,
              },
              LOC_CITY_CD: {
                value: currentField?.value ?? "",
                ignoreUpdate: false,
              },
              LOC_DISTRICT: {
                value:
                  cityOptionData?.DISTRICT ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]
                    ?.DISTRICT_NM ||
                  "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value:
                  cityOptionData?.STATE ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.STATE_NM ||
                  "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value:
                  cityOptionData?.COUNTRY ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.COUNTRY_NM ||
                  "",
              },
              LOC_STATE_CD: {
                value:
                  cityOptionData?.STATE_CD ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.STATE_CD ||
                  "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value:
                  cityOptionData?.COUNTRY_CD ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.COUNTRY_CD ||
                  "",
                ignoreUpdate: false,
              },
            };
          } else {
            return {
              DISTRICT: {
                value:
                  cityOptionData?.DISTRICT ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]
                    ?.DISTRICT_NM ||
                  "",
                ignoreUpdate: false,
              },
              STATE: {
                value:
                  cityOptionData?.STATE ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.STATE_NM ||
                  "",
                ignoreUpdate: false,
              },
              COUNTRY: {
                value:
                  cityOptionData?.COUNTRY ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.COUNTRY_NM ||
                  "",
              },
              STATE_CD: {
                value:
                  cityOptionData?.STATE_CD ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.STATE_CD ||
                  "",
                ignoreUpdate: false,
              },
              COUNTRY_CD: {
                value:
                  cityOptionData?.COUNTRY_CD ||
                  dependentFieldsValues?.AREA_CD?.optionData?.[0]?.COUNTRY_CD ||
                  "",
                ignoreUpdate: false,
              },
            };
          }
        } else if (!currentField?.value) {
          if (dependentFieldsValues?.SAME_AS_PER?.value) {
          }
          return {
            DISTRICT: {
              value: "",
              ignoreUpdate: false,
            },
            STATE: {
              value: "",
              ignoreUpdate: false,
            },
            COUNTRY: {
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
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DISTRICT",
      label: "District",
      isReadOnly: true,
      placeholder: "District",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE",
      label: "State",
      isReadOnly: true,
      placeholder: "State",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COUNTRY",
      label: "Country",
      isReadOnly: true,
      placeholder: "Country",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE_CD",
      label: "UnionTerritoriesCode",
      isReadOnly: true,
      placeholder: "UnionTerritoriesCode",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COUNTRY_CD",
      label: "CountryCode",
      isReadOnly: true,
      placeholder: "CountryCode",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PROOF_OF_ADD",
      label: "ProofofAdd",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ProofofAddressIsRequired"] }],
      },
      placeholder: "ProofofAdd",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
      options: async (dependentValue, formState, _, authState) => {
        return await API.getPMISCData("CKYC_ADD_PROOF", {
          CUST_TYPE: formState?.state?.entityTypectx,
        });
      },
      _optionsKey: "currentPoA",
      dependentFields: ["SAME_AS_PER"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (dependentFieldsValues?.SAME_AS_PER?.value) {
          return {
            LOC_PROOF_OF_ADD: {
              value: field?.value ?? "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        }
        return {};
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "OTHER_POA",
      label: "OthersPoA",
      placeholder: "OthersPoA",
      dependentFields: ["PROOF_OF_ADD"],
      runValidationOnDependentFieldsChange: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 75,
      validate: (columnValue, dependentFields) => {
        if (
          dependentFields?.PROOF_OF_ADD?.value?.trim() === "99" &&
          columnValue?.value === ""
        ) {
          return "OthersPoArequired";
        }
        return "";
      },
      type: "text",
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
        sequence: 1,
      },
      name: "localAddDivider",
      label: "CorrespondenceAddress",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: { componentType: "checkbox" },
      name: "SAME_AS_PER",
      label: "SameAsPermanentAddress",
      defaultValue: false,
      runPostValidationHookAlways: true,
      validationRun: "onChange",
      dependentFields: [
        "ADDRESS_TYPE",
        "ADD1",
        "ADD2",
        "ADD3",
        "PIN_CODE",
        "AREA_CD",
        "CITY_CD",
        "DISTRICT",
        "STATE",
        "COUNTRY",
        "STATE_CD",
        "COUNTRY_CD",
        "PROOF_OF_ADD",
      ],
      postValidationSetCrossFieldValues: (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (!Boolean(currentField?.value)) {
          return {
            LOC_ADD_TYPE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_ADD1: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_ADD2: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_ADD3: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_PIN_CODE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_AREA_CD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_CITY_CD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_DISTRICT: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_STATE: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_COUNTRY: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_STATE_CD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_COUNTRY_CD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_PROOF_OF_ADD: {
              value: "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        } else {
          return {
            LOC_ADD_TYPE: {
              value: dependentFieldsValues?.ADDRESS_TYPE?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_ADD1: {
              value: dependentFieldsValues?.ADD1?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_ADD2: {
              value: dependentFieldsValues?.ADD2?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_ADD3: {
              value: dependentFieldsValues?.ADD3?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_PIN_CODE: {
              value: dependentFieldsValues?.PIN_CODE?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_AREA_CD: {
              value: dependentFieldsValues?.AREA_CD?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_CITY_CD: {
              value: dependentFieldsValues?.CITY_CD?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_DISTRICT: {
              value: dependentFieldsValues?.DISTRICT?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_STATE: {
              value: dependentFieldsValues?.STATE?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_COUNTRY: {
              value: dependentFieldsValues?.COUNTRY?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_STATE_CD: {
              value: dependentFieldsValues?.STATE_CD?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_COUNTRY_CD: {
              value: dependentFieldsValues?.COUNTRY_CD?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
            LOC_PROOF_OF_ADD: {
              value: dependentFieldsValues?.PROOF_OF_ADD?.value || "",
              ignoreUpdate: false,
              isFieldFocused: false,
            },
          };
        }
      },

      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LOC_ADD_TYPE",
      label: "LocalAddressType",
      placeholder: "LocalAddressType",
      type: "text",
      dependentFields: ["SAME_AS_PER"],
      options: async () => await API.getPMISCData("ADDRESS_TYPE"),
      _optionsKey: "CurAddTypelocalOp",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.SAME_AS_PER?.value;
      },
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_ADD1",
      label: "Line1",
      required: true,
      maxLength: 50,
      dependentFields: ["SAME_AS_PER"],
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      inputProps: {
        onInput: (e) => {
          e.target.value = e.target.value.replace(/  +/g, " ");
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Line1IsRequired"] }],
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.SAME_AS_PER?.value;
      },
      placeholder: "Address1",
      type: "text",
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 5, md: 4, lg: 3.6, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_ADD2",
      label: "Line2",
      placeholder: "Address2",
      maxLength: 50,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      dependentFields: ["SAME_AS_PER"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.SAME_AS_PER?.value;
      },
      type: "text",
      inputProps: {
        onInput: (e) => {
          e.target.value = e.target.value.replace(/  +/g, " ");
        },
      },
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 5, md: 4, lg: 3.6, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_ADD3",
      label: "Line3",
      placeholder: "Address3",
      maxLength: 50,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      dependentFields: ["SAME_AS_PER"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.SAME_AS_PER?.value;
      },
      type: "text",
      inputProps: {
        onInput: (e) => {
          e.target.value = e.target.value.replace(/  +/g, " ");
        },
      },
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 5, md: 4, lg: 3.6, xl: 4 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "LOC_PIN_CODE",
      label: "PIN",
      placeholder: "EnterPinCode",
      type: "text",
      runPostValidationHookAlways: true,
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
      required: true,
      maxLength: 6,
      FormatProps: {
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["SAME_AS_PER"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.SAME_AS_PER?.value;
      },
      validate: (columnValue, allField, flag) => {
        const PIN = columnValue.value;
        if (!Boolean(PIN)) {
          return "PINIsRequired";
        } else if (Boolean(PIN) && PIN.length < 6) {
          return "PinCodeShouldBeOfSixDigits";
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        const pinValue = field?.value ?? "";
        if (!Boolean(dependentFieldsValues?.SAME_AS_PER?.value)) {
          if (!Boolean(pinValue) || pinValue.length < 6) {
            return {
              LOC_AREA_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_CITY_CD: {
                value: "",
                ignoreUpdate: false,
                isFieldFocused: false,
              },
              LOC_DISTRICT: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE: { value: "", ignoreUpdate: false },
              LOC_COUNTRY: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
              },
            };
          } else if (Boolean(pinValue) && pinValue.length === 6) {
            if (
              Boolean(formState?.state?.customerIDctx) ||
              Boolean(formState?.state?.req_cd_ctx)
            ) {
              const btnName = await formState.MessageBox({
                messageTitle: "Confirmation",
                message: "Doyouwanttopopulatearearelateddetails",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              return {
                LOC_PIN_CODE: {
                  value: btnName === "Yes" ? pinValue : "",
                  isFieldFocused: btnName === "Yes" ? false : true,
                  ignoreUpdate: btnName === "Yes" ? true : false,
                },
                LOC_AREA_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: btnName === "Yes" ? true : false,
                },
                LOC_CITY_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
                LOC_DISTRICT: {
                  value: "",
                  ignoreUpdate: false,
                },
                LOC_STATE: { value: "", ignoreUpdate: false },
                LOC_COUNTRY: {
                  value: "",
                  ignoreUpdate: false,
                },
                LOC_STATE_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
                LOC_COUNTRY_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
              };
            } else {
              return {
                LOC_PIN_CODE: {
                  value: pinValue ?? "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                LOC_AREA_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                LOC_CITY_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
                LOC_DISTRICT: {
                  value: "",
                  ignoreUpdate: false,
                },
                LOC_STATE: { value: "", ignoreUpdate: false },
                LOC_COUNTRY: {
                  value: "",
                  ignoreUpdate: false,
                },
                LOC_STATE_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
                LOC_COUNTRY_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LOC_AREA_CD",
      dependentFields: ["LOC_PIN_CODE", "SAME_AS_PER"],
      disableCaching: true,
      options: async (...arg) =>
        await API.getAreaList({
          COMP_CD: arg?.[3]?.companyID ?? "",
          BRANCH_CD: arg?.[3]?.user?.branchCode ?? "",
          PIN_CODE: arg?.[2]?.LOC_PIN_CODE?.value ?? "",
          FLAG: "P",
          PARENT_AREA: "",
        }),
      _optionsKey: "localSubAreaList",
      label: "Area",
      isReadOnly: (fieldValue, dependentFields, formState) => {
        const sameAsPer = dependentFields.SAME_AS_PER.value;
        const pin_code = dependentFields.LOC_PIN_CODE.value;
        if (Boolean(sameAsPer)) {
          return true;
        } else if (!Boolean(pin_code)) {
          return true;
        } else if (Boolean(pin_code) && pin_code.length < 6) {
          return true;
        }
        return false;
      },
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (!Boolean(dependentFieldsValues?.SAME_AS_PER?.value)) {
          if (field.value) {
            const currentdata = field?.optionData?.[0];
            return {
              LOC_CITY_CD: {
                value: currentdata?.CITY_CD ?? "",
                ignoreUpdate: false,
              },
              LOC_DISTRICT: {
                value: currentdata?.DISTRICT_NM ?? "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value: currentdata?.STATE_NM ?? "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value: currentdata?.COUNTRY_NM ?? "",
                ignoreUpdate: false,
              },
              LOC_STATE_CD: {
                value: currentdata?.STATE_CD ?? "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value: currentdata?.COUNTRY_CD ?? "",
                ignoreUpdate: false,
              },
            };
          } else if (!field?.value) {
            return {
              LOC_CITY_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_DISTRICT: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value: "",
                ignoreUpdate: false,
              },

              LOC_STATE_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
              },
            };
          }
        }
      },

      defaultOptionLabel: "Area",
      placeholder: "Area",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LOC_CITY_CD",
      label: "City",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CityIsRequired"] }],
      },
      // disableCaching: true,
      isReadOnly: (formData, dependentFields) => {
        const sameAsPer = dependentFields.SAME_AS_PER.value;
        const areaOptions = dependentFields?.LOC_AREA_CD?.optionData;
        return (
          Boolean(sameAsPer) ||
          (Array.isArray(areaOptions) && areaOptions.length > 0)
        );
      },
      options: async (dependentValue, formState, _, authState) =>
        await API.CityTypeOP(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "LoccityTypeOP",
      dependentFields: ["SAME_AS_PER", "LOC_AREA_CD"],
      placeholder: "City",
      type: "text",
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        const cityOptionData = currentField?.optionData?.[0] || [];

        if (!Boolean(dependentFieldsValues.SAME_AS_PER.value)) {
          if (currentField?.value) {
            return {
              LOC_DISTRICT: {
                value:
                  cityOptionData?.DISTRICT ||
                  dependentFieldsValues?.LOC_AREA_CD?.optionData?.[0]
                    ?.DISTRICT_NM ||
                  "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value:
                  cityOptionData?.STATE ||
                  dependentFieldsValues?.LOC_AREA_CD?.optionData?.[0]
                    ?.STATE_NM ||
                  "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value:
                  cityOptionData?.COUNTRY ||
                  dependentFieldsValues?.LOC_AREA_CD?.optionData?.[0]
                    ?.COUNTRY_NM ||
                  "",
                ignoreUpdate: false,
              },
              LOC_STATE_CD: {
                value:
                  cityOptionData?.STATE_CD ||
                  dependentFieldsValues?.LOC_AREA_CD?.optionData?.[0]
                    ?.STATE_CD ||
                  "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value:
                  cityOptionData?.COUNTRY_CD ||
                  dependentFieldsValues?.LOC_AREA_CD?.optionData?.[0]
                    ?.COUNTRY_CD ||
                  "",
                ignoreUpdate: false,
              },
            };
          } else if (!currentField?.value) {
            return {
              LOC_DISTRICT: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_STATE_CD: {
                value: "",
                ignoreUpdate: false,
              },
              LOC_COUNTRY_CD: {
                value: "",
                ignoreUpdate: false,
              },
            };
          }
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_DISTRICT",
      label: "District",
      placeholder: "District",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_STATE",
      label: "State",
      placeholder: "State",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_COUNTRY",
      label: "Country",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_STATE_CD",
      label: "UnionTerritoriesCode",
      placeholder: "UnionTerritoriesCode",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LOC_COUNTRY_CD",
      label: "CountryCode",
      placeholder: "CountryCode",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LOC_PROOF_OF_ADD",
      label: "ProofofAdd",
      placeholder: "ProofofAdd",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ProofofAddressIsRequired"] }],
      },
      dependentFields: ["SAME_AS_PER"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        return dependentFields?.SAME_AS_PER?.value;
      },
      options: async (dependentValue, formState, _, authState) => {
        return await API.getPMISCData("CKYC_LOC_POA", {
          CUST_TYPE: formState?.state?.entityTypectx,
        });
      },
      _optionsKey: "localPoA",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "divider",
        sequence: 1,
      },
      name: "contactDivider",
      label: "Contact",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT1",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT2",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT3",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT4",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT5",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "STD_1",
      label: "PhoneO",
      placeholder: "countryCode",
      type: "text",
      maxLength: 5,
      GridProps: { xs: 12, sm: 4, md: 0.7, lg: 0.8, xl: 0.7 },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          return true;
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT1",
      label: "",
      placeholder: "EnterPhoneO",
      maxLength: 10,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
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
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER1",
      GridProps: {
        xs: 0.1,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "STD_4",
      label: "PhoneR",
      placeholder: "countryCode",
      maxLength: 5,
      FormatProps: {
        decimalScale: 0,
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.state?.entityTypectx === "C");
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 0.7, lg: 0.8, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT4",
      label: "",
      placeholder: "EnterPhoneR",
      maxLength: 10,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.state?.entityTypectx === "C");
      },
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
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER2",
      GridProps: {
        xs: 0.1,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "STD_2",
      label: "MobileNo",
      maxLength: 3,
      required: true,
      defaultValue: "91",
      placeholder: "countryCode",
      FormatProps: {
        decimalScale: 0,
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 3) {
            return false;
          }
          return true;
        },
      },
      type: "text",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.state?.formmodectx === "edit") {
          if (formState?.CONTACT2_ENABLE === "Y") {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 0.7, lg: 0.8, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT2",
      label: "",
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      validate: (columnValue, allField, formState) => {
        if (columnValue?.value === "") {
          if (formState?.state?.formmodectx === "edit") {
            if (formState?.CONTACT2_ENABLE === "Y") {
              return "MobileNoisRequired";
            } else {
              return "";
            }
          } else {
            return "MobileNoisRequired";
          }
        }
        return "";
      },
      required: true,
      placeholder: "EnterMobileNo",
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
      dependentFields: ["STD_2"],
      type: "text",
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (formState?.state?.formmodectx === "edit") {
          if (formState?.CONTACT2_ENABLE === "Y") {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value) {
          formState?.handleButtonDisable(true);
          const postData = await API.validateMobileNo(
            field,
            dependentFieldsValues?.STD_2?.value,
            formState
          );
          formState?.handleButtonDisable(false);
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
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
              };
            }
          } else {
            formState?.handleButtonDisable(true);
            const dupValidateRes = await API.checkDuplication({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              CATEG_CD: formState?.CATEG_CD ?? "",
              CUSTOMER_ID: formState?.CUSTOMER_ID ?? "",
              DATAVALUE: field?.value ?? "",
              CHECK_FOR: "6",
            });
            formState?.handleButtonDisable(false);
            let returnVal;
            if (dupValidateRes?.length > 0) {
              const response = await handleDisplayMessages(
                dupValidateRes,
                formState?.MessageBox
              );

              if (Object.keys(response).length > 0) {
                returnVal = response;
              } else {
                returnVal = "";
              }
            }
            return {
              MASKED_CONTACT2: {
                value: returnVal !== "" ? field?.value : "",
                isFieldFocused: !returnVal,
                ignoreUpdate: returnVal,
              },
              CONTACT2: { value: returnVal !== "" ? field?.value : "" },
            };
          }
        } else if (field?.value === "") {
          return {
            CONTACT2: { value: "" },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER3",
      GridProps: {
        xs: 0.1,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "STD_5",
      label: "MobileNum2",
      placeholder: "countryCode",
      //remove default value as needed by Banas Bank/Aditya shah sir (this is not same as EBC)
      // defaultValue: "91",
      maxLength: 3,
      FormatProps: {
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 3) {
            return false;
          }
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.state?.entityTypectx === "I");
      },
      GridProps: { xs: 12, sm: 4, md: 0.7, lg: 0.8, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT5",
      label: "",
      required: true,
      placeholder: "EnterMobileNo2",
      maxLength: 10,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.state?.entityTypectx === "I");
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentField
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          CONTACT5: {
            value: currentField.value ?? "",
          },
        };
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "STD_3",
      label: "Fax",
      placeholder: "countryCode",
      maxLength: 5,
      FormatProps: {
        decimalScale: 0,
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          return true;
        },
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 0.7, lg: 0.8, xl: 0.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT3",
      label: "",
      placeholder: "Fax",
      maxLength: 10,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          return true;
        },
      },
      preventSpecialChars: () => {
        return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
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
      GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "E_MAIL_ID",
      label: "EmailId",
      placeholder: "EnterEmailID",
      maxLength: 60,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value) {
          formState?.handleButtonDisable(true);
          const postData = await API.validateEmailID(field?.value);
          formState?.handleButtonDisable(false);
          const EMAIL_ID_STATUS = postData?.[0]?.EMAIL_ID_STATUS;
          if (EMAIL_ID_STATUS === "0") {
            const btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "PleaseEnterValidEmailID",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                E_MAIL_ID: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
              };
            }
          }
        }
      },
      type: "text",
      txtTransform: "lowercase",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 2.4, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "E_MAIL_ID2",
      label: "EmailId2",
      maxLength: 60,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value) {
          formState?.handleButtonDisable(true);
          const postData = await API.validateEmailID(field?.value);
          formState?.handleButtonDisable(false);
          const EMAIL_ID_STATUS = postData?.[0]?.EMAIL_ID_STATUS;
          if (EMAIL_ID_STATUS === "0") {
            const btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "PleaseEnterValidEmailID",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                E_MAIL_ID: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
              };
            }
          }
        }
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return Boolean(formState?.state?.entityTypectx === "I");
      },
      placeholder: "EnterEmailId2",
      type: "text",
      txtTransform: "lowercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 3 },
    },
  ],
};
export const kyc_dup_reason_form = {
  form: {
    name: "kyc_dup_reason_form",
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
        componentType: "autocomplete",
      },
      name: "PAN_DUP_REASON_DDW",
      label: "reasonOfDuplicate",

      placeholder: "reasonOfDuplicate",
      options: async () => await API.getPMISCData("DUP_REASON"),
      _optionsKey: "dupReasonOptions",
      postValidationSetCrossFieldValues: async (currentField, formState) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          return {
            PAN_DUP_REASON: {
              value: currentField?.optionData?.[0]?.label ?? "",
              ignoreUpdate: false,
            },
          };
        }
        return {};
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAN_DUP_REASON",
      label: "reasonOfDuplicate",
      maxLength: 300,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["DupReasonIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
  ],
};
