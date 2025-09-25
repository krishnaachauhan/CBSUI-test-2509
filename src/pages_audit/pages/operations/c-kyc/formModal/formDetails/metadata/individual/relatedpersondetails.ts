import { isValid } from "date-fns";
import * as API from "../../../../api";
import { lessThanInclusiveDate } from "@acuteinfo/common-base";
import { t } from "i18next";
import { PREVENT_SPECIAL_CHAR, REGEX } from "components/utilFunction/constant";
import { handleDisplayMessages } from "components/utilFunction/function";

export const related_person_detail_data = {
  form: {
    name: "rel_person_details_form",
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
      divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "arrayField",
      },
      name: "RELATED_PERSON_DTL",
      hideRemoveIconOnSingleRecord: false,
      displayCountName: t("DetailsOfRelatedPerson"),
      addRowFn: (data) => {
        if (data?.RELATED_PERSON_DTL?.[0]?.REF_FIRST_NM === "") {
          return {
            allow: false,
            reason: t("PleaseEnterRelatedPersonFirstName"),
          };
        } else {
          return true;
        }
      },
      removeRowFn: (formState, name, data, index) => {
        let maxSRCD =
          formState?.state?.retrieveFormDataApiRes[
            "RELATED_PERSON_DTL"
          ]?.reduce((max, item) => {
            const srCdNum = parseInt(item.SR_CD, 10);
            return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
          }, 0) ?? 0;

        if (
          data?.RELATED_PERSON_DTL?.[index]?.SR_CD <= maxSRCD &&
          data?.RELATED_PERSON_DTL?.[index]?.SR_CD !== ""
        ) {
          return {
            allow: false,
            reason: t("NotAllowedToDelete"),
          };
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          label: "SrNo",
          placeholder: "SrNo",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "PASSPORT_NO",
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
          name: "DRIVING_LICENSE_NO",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "NREGA_JOB_CARD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "UNIQUE_ID",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ELECTION_CARD_NO",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "OTHER_DOC_NO",
        },
        {
          render: {
            componentType: "divider",
            sequence: 20,
          },
          name: "RelatedPersonDetailsDivider",
          label: "RelatedPersonDetails",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          options: () =>
            API.getPMISCData("CKYC_RELAT_PERS", { CUST_TYPE: "I" }),
          _optionsKey: "kycRelatedtype",
          name: "RELATED_PERSON_TYPE",
          label: "Type",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [
              { name: "required", params: ["RelatedPersonTypeIsRequired"] },
            ],
          },
          placeholder: "Type",
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFields
          ) => {
            if (formState?.isSubmitting) return {};
            if (formState?.BIRTH_DT === "") {
              const buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "PleaseEnterBirthDate",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  RELATED_PERSON_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }

            if (
              formState?.LF_NO !== "M" &&
              formState?.state?.entityTypectx !== "C" &&
              currentField?.value.trim() === "1"
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("GuardianTypeValidationMsg"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  RELATED_PERSON_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              formState?.LF_NO === "M" &&
              formState?.state?.entityTypectx !== "C" &&
              currentField?.value.trim() !== "1"
            ) {
              const hasActive = dependentFields?.RELATED_PERSON_DTL?.some(
                (item) =>
                  item?.RELATED_PERSON_TYPE?.value?.trim() === "1" &&
                  item?.ACTIVE?.value === true
              );
              if (hasActive) return;

              const buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "InCaseofMinorKYCGuardianTypeValidationMsg",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  RELATED_PERSON_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            } else if (
              formState?.LF_NO === "M" &&
              formState?.state?.entityTypectx !== "C" &&
              currentField?.value.trim() !== "1"
            ) {
              const hasActive = dependentFields?.RELATED_PERSON_DTL?.some(
                (item) =>
                  item?.RELATED_PERSON_TYPE?.value?.trim() === "1" &&
                  item?.ACTIVE?.value === true
              );
              if (hasActive) return;

              const buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "IncaseofMinorKYCguardianTypeValidationMsg",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  RELATED_PERSON_TYPE: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
          },
          dependentFields: ["ACTIVE", "RELATED_PERSON_DTL"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "REF_TYPE",
          label: "RefType",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["RefTypeIsRequired"] }],
          },
          placeholder: "RefType",
          options: [
            { label: "OTHER", value: "O" },
            { label: "C-KYC", value: "C" },
          ],
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};

            return {
              REF_CUST_ID: {
                value: "",
                ignoreUpdate: false,
              },
              PREFIX_CD: {
                value: "",
                ignoreUpdate: false,
              },
              REF_FIRST_NM: {
                value: "",
                ignoreUpdate: false,
              },
              REF_MIDDLE_NM: {
                value: "",
                ignoreUpdate: false,
              },
              REF_LAST_NM: {
                value: "",
                ignoreUpdate: false,
              },
              RELATED_PERSON_KYC: {
                value: "",
                ignoreUpdate: false,
              },
              REF_ACCT_NM: {
                value: "",
                ignoreUpdate: false,
              },
              PAN_NO: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_PAN_NO: {
                value: "",
                ignoreUpdate: false,
              },
              DRIVING_LICENSE_NO: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_DRIVING_LICENSE_NO: {
                value: "",
                ignoreUpdate: false,
              },
              DRIVING_LICENSE_EXPIRY_DT: {
                value: "",
                ignoreUpdate: false,
              },
              ELECTION_CARD_NO: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_ELECTION_CARD_NO: {
                value: "",
                ignoreUpdate: false,
              },
              PASSPORT_NO: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_PASSPORT_NO: {
                value: "",
                ignoreUpdate: false,
              },
              PASSPORT_EXPIRY_DT: {
                value: "",
                ignoreUpdate: false,
              },
              UNIQUE_ID: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_UNIQUE_ID: {
                value: "",
                ignoreUpdate: false,
              },
              NREGA_JOB_CARD: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_NREGA_JOB_CARD: {
                value: "",
                ignoreUpdate: false,
              },
              OTHER_DOC: {
                value: "",
                ignoreUpdate: false,
              },
              OTHER_DOC_NO: {
                value: "",
                ignoreUpdate: false,
              },
              MASKED_OTHER_DOC_NO: {
                value: "",
                ignoreUpdate: false,
              },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "HIDE_CHECK",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CONFIRMED",
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "ACTIVE",
          label: "Active",
          dependentFields: ["HIDE_CHECK"],
          defaultValue: true,
          validationRun: "all",
          shouldExclude(fieldData, dependentFields) {
            return (
              !Boolean(fieldData?.value) ||
              !Boolean(
                dependentFields?.["RELATED_PERSON_DTL.HIDE_CHECK"]?.value
              )
            );
          },

          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value === false) {
              const buttonName = await formState.MessageBox({
                messageTitle: "Confirmation",
                message: "RelatedPersonInActiveConfmMessage",
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              return {
                ACTIVE: {
                  value: buttonName === "Yes" ? false : true,
                  ignoreUpdate: false,
                },
              };
            }
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 1.5, xl: 1 },
        },
        {
          render: {
            componentType: "typography",
          },
          name: "RESET_FIELD",
          label: "Inactive",
          dependentFields: ["ACTIVE", "HIDE_CHECK"],

          shouldExclude(fieldData, dependentFields) {
            const hideCheck =
              dependentFields?.["RELATED_PERSON_DTL.HIDE_CHECK"]?.value;
            const isActive =
              dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;

            return !hideCheck || !!isActive;
          },

          TypographyProps: {
            variant: "subtitle2",
            sx: {
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              color: "var(--theme-color3)",
              fontWeight: "600",
              height: "34px",
              paddingTop: "42px",
            },
          },
          GridProps: { xs: 12, sm: 2, md: 2, lg: 1.5, xl: 1 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "REF_CUST_ID",
          label: "RefCustID",
          placeholder: "RefCustID",
          maxLength: 12,
          FormatProps: {
            allowNegative: false,
            decimalScale: 0,
            isAllowed: (values) => {
              return !Boolean(
                values.value.startsWith("0") || values?.value?.length > 12
              );
            },
          },
          type: "text",
          required: true,
          runPostValidationHookAlways: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["RefCustIDIsRequired"] }],
          },
          dependentFields: ["REF_TYPE", "RELATED_PERSON_DTL", "ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            return (
              dependentFieldsValues["RELATED_PERSON_DTL.REF_TYPE"]?.value !==
              "C"
            );
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (currentField?.value) {
              const currentIndex = Number(currentField?.name?.split("[")[1][0]);
              const isDuplicate = (item, index) =>
                index !== currentIndex &&
                item?.REF_CUST_ID?.value === currentField?.value &&
                (item?.ACTIVE?.value === true ||
                  item?.ACTIVE?.value === "true" ||
                  item?.ACTIVE?.value === "");

              const dupCustIDindex =
                dependentFieldValues?.RELATED_PERSON_DTL?.findIndex(
                  isDuplicate
                );
              if (dupCustIDindex !== -1) {
                await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: t("ReferenceCustomerIDError", {
                    row: dupCustIDindex + 1,
                  }),
                  icon: "ERROR",
                });
                return {
                  REF_CUST_ID: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                };
              }
              if (
                currentField?.value ===
                formState?.state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
                  ?.CUSTOMER_ID
              ) {
                await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "CustomerIDCannotbeAllowedasReferenceCustomerID",
                  icon: "ERROR",
                });
                return {
                  REF_CUST_ID: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                };
              }
              formState?.handleButtonDisable(true);
              const gstApiData = await API.getCkycRefCusDtl({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
                REF_CUST_ID: currentField?.value ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.name ?? "",
                REF_CUST_DTL: [],
              });
              formState?.handleButtonDisable(false);

              if (gstApiData?.status === "999") {
                await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: gstApiData?.messageDetails ?? "",
                  icon: "ERROR",
                });
                return;
              }

              let returnVal;
              if (gstApiData?.[0]?.MSG?.length > 0) {
                const response = await handleDisplayMessages(
                  gstApiData?.[0]?.MSG,
                  formState?.MessageBox
                );
                returnVal =
                  Object.keys(response).length > 0 ? gstApiData?.[0] : "";
              }
              return {
                REF_CUST_ID: {
                  value: returnVal?.CUSTOMER_ID ?? "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
                DRIVING_LICENSE_EXPIRY_DT: {
                  value: returnVal?.DRIVING_LICENSE_EXPIRY_DT ?? "",
                  ignoreUpdate: true,
                },
                ELECTION_CARD_NO: {
                  value: returnVal?.ELECTION_CARD_NO ?? "",
                  ignoreUpdate: false,
                },
                MASKED_ELECTION_CARD_NO: {
                  value: returnVal?.MASKED_ELECTION_CARD_NO ?? "",
                  ignoreUpdate: true,
                },
                RELATED_PERSON_KYC: {
                  value: returnVal?.RELATED_PERSON_KYC ?? "",
                  ignoreUpdate: true,
                },
                OTHER_DOC: {
                  value: returnVal?.OTHER_DOC ?? "",
                  ignoreUpdate: false,
                },
                CUSTOMER_TYPE: {
                  value: returnVal?.CUSTOMER_TYPE ?? "",
                  ignoreUpdate: false,
                },
                DRIVING_LICENSE_NO: {
                  value: returnVal?.DRIVING_LICENSE_NO ?? "",
                  ignoreUpdate: false,
                },
                MASKED_DRIVING_LICENSE_NO: {
                  value: returnVal?.MASKED_DRIVING_LICENSE_NO ?? "",
                  ignoreUpdate: true,
                },
                REF_ACCT_NM: {
                  value: returnVal?.REF_ACCT_NM ?? "",
                  ignoreUpdate: false,
                },
                UNIQUE_ID: {
                  value: returnVal?.UNIQUE_ID ?? "",
                  ignoreUpdate: false,
                },
                REF_LAST_NM: {
                  value: returnVal?.REF_LAST_NM ?? "",
                  ignoreUpdate: false,
                },
                PASSPORT_EXPIRY_DT: {
                  value: returnVal?.PASSPORT_EXPIRY_DT ?? "",
                  ignoreUpdate: true,
                },
                MASKED_UNIQUE_ID: {
                  value: returnVal?.MASKED_UNIQUE_ID ?? "",
                  ignoreUpdate: true,
                },
                REF_MIDDLE_NM: {
                  value: returnVal?.REF_MIDDLE_NM ?? "",
                  ignoreUpdate: false,
                },
                NREGA_JOB_CARD: {
                  value: returnVal?.NREGA_JOB_CARD ?? "",
                  ignoreUpdate: false,
                },
                MASKED_NREGA_JOB_CARD: {
                  value: returnVal?.MASKED_NREGA_JOB_CARD ?? "",
                  ignoreUpdate: true,
                },
                PASSPORT_NO: {
                  value: returnVal?.PASSPORT_NO ?? "",
                  ignoreUpdate: false,
                },
                MASKED_PASSPORT_NO: {
                  value: returnVal?.MASKED_PASSPORT_NO ?? "",
                  ignoreUpdate: true,
                },
                PREFIX_CD: {
                  value: returnVal?.PREFIX_CD ?? "",
                  ignoreUpdate: false,
                },
                OTHER_DOC_NO: {
                  value: returnVal?.OTHER_DOC_NO ?? "",
                  ignoreUpdate: false,
                },
                MASKED_OTHER_DOC_NO: {
                  value: returnVal?.MASKED_OTHER_DOC_NO ?? "",
                  ignoreUpdate: true,
                },
                REF_FIRST_NM: {
                  value: returnVal?.REF_FIRST_NM ?? "",
                  ignoreUpdate: false,
                },
                PAN_NO: {
                  value: returnVal?.PAN_NO ?? "",
                  ignoreUpdate: false,
                },
                MASKED_PAN_NO: {
                  value: returnVal?.MASKED_PAN_NO ?? "",
                  ignoreUpdate: true,
                },
              };
            } else if (currentField?.value === "") {
              return {
                DRIVING_LICENSE_EXPIRY_DT: {
                  value: "",
                  ignoreUpdate: false,
                },
                ELECTION_CARD_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_ELECTION_CARD_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                RELATED_PERSON_KYC: {
                  value: "",
                  ignoreUpdate: false,
                },
                OTHER_DOC: {
                  value: "",
                  ignoreUpdate: false,
                },
                CUSTOMER_TYPE: {
                  value: "",
                  ignoreUpdate: false,
                },
                DRIVING_LICENSE_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_DRIVING_LICENSE_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                REF_ACCT_NM: {
                  value: "",
                  ignoreUpdate: false,
                },
                REF_LAST_NM: {
                  value: "",
                  ignoreUpdate: false,
                },
                PASSPORT_EXPIRY_DT: {
                  value: "",
                  ignoreUpdate: false,
                },
                REF_MIDDLE_NM: {
                  value: "",
                  ignoreUpdate: false,
                },
                NREGA_JOB_CARD: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_NREGA_JOB_CARD: {
                  value: "",
                  ignoreUpdate: false,
                },
                PASSPORT_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_PASSPORT_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                PREFIX_CD: {
                  value: "",
                  ignoreUpdate: false,
                },
                OTHER_DOC_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_OTHER_DOC_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                REF_FIRST_NM: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAN_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_PAN_NO: {
                  value: "",
                  ignoreUpdate: false,
                },
                UNIQUE_ID: {
                  value: "",
                  ignoreUpdate: false,
                },
                MASKED_UNIQUE_ID: {
                  value: "",
                  ignoreUpdate: false,
                },
              };
            }
          },

          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "formbutton",
          },
          name: "SIGN_VIEW",
          label: "Signature",
          endsIcon: "",
          dependentFields: ["REF_CUST_ID", "REF_TYPE"],
          type: "text",
          rotateIcon: "scale(2)",
          placeholder: "",
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return formState?.state?.formmodectx === "view";
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            return (
              dependentFieldsValues["RELATED_PERSON_DTL.REF_TYPE"]?.value !==
              "C"
            );
          },
          ignoreInSubmit: true,
          fullWidth: true,
          GridProps: {
            xs: 12,
            sm: 1.5,
            md: 1.2,
            lg: 1.2,
            xl: 1.2,
          },
        },
        {
          render: {
            componentType: "autocomplete",
            sequence: 2,
          },
          name: "PREFIX_CD",
          label: "Prefix",
          placeholder: "Prefix",
          options: () => API.GetDynamicSalutationData("Salutation"),
          _optionsKey: "PDPrefix",
          type: "text",
          required: true,
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          GridProps: { xs: 12, sm: 4, md: 1.5, lg: 1, xl: 1 },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["PrefixIsRequired"] }],
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REF_FIRST_NM",
          label: "FirstName",
          placeholder: "FirstName",
          maxLength: 50,
          showMaxLength: false,
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["FirstNameIsRequired"] }],
          },
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
          },
          dependentFields: ["ACTIVE", "SR_CD"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          validate: (columnValue) => API?.validateCharValue(columnValue),
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (
              currentField?.value &&
              currentField?.value?.trim()?.length < 2
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("firstNmValidationMsg"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  REF_FIRST_NM: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
            const index = Number(currentField?.fieldKey?.split("[")[1][0]);
            if (
              currentField?.value &&
              currentField?.value?.trim()?.length >= 2 &&
              formState?.state?.isValidateCustCtx?.ALLOW_NAME_CHANGE === "N" &&
              formState?.state?.retrieveFormDataApiRes?.RELATED_PERSON_DTL?.[
                index
              ]?.REF_FIRST_NM !== currentField?.value &&
              Boolean(dependentFieldValues?.["RELATED_PERSON_DTL.SR_CD"]?.value)
            ) {
              formState?.handleButtonDisable(true);
              const postData = await API.validateName({
                COMP_CD: authState?.companyID ?? "",
                CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
              });
              formState?.handleButtonDisable(false);
              if (Number(postData?.[0]?.TRN_CNT) > 0) {
                const buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("TransactionsfoundNamecantbechanged"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  return {
                    REF_FIRST_NM: {
                      value:
                        formState?.state?.retrieveFormDataApiRes
                          ?.RELATED_PERSON_DTL?.[index]?.REF_FIRST_NM ?? "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                  };
                }
              }
            }
          },
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REF_MIDDLE_NM",
          label: "MiddleName",
          placeholder: "MiddleName",
          maxLength: 50,
          showMaxLength: false,
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
          },
          dependentFields: ["ACTIVE", "SR_CD"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          validate: (columnValue) => API?.validateCharValue(columnValue),
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            const index = Number(currentField?.fieldKey?.split("[")[1][0]);
            if (
              currentField?.value &&
              formState?.state?.isValidateCustCtx?.ALLOW_NAME_CHANGE === "N" &&
              formState?.state?.retrieveFormDataApiRes?.RELATED_PERSON_DTL?.[
                index
              ]?.REF_MIDDLE_NM !== currentField?.value &&
              Boolean(dependentFieldValues?.["RELATED_PERSON_DTL.SR_CD"]?.value)
            ) {
              formState?.handleButtonDisable(true);
              const postData = await API.validateName({
                COMP_CD: authState?.companyID ?? "",
                CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
              });
              formState?.handleButtonDisable(false);
              if (Number(postData?.[0]?.TRN_CNT) > 0) {
                const buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("TransactionsfoundNamecantbechanged"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  return {
                    REF_MIDDLE_NM: {
                      value:
                        formState?.state?.retrieveFormDataApiRes
                          ?.RELATED_PERSON_DTL?.[index]?.REF_MIDDLE_NM ?? "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                  };
                }
              }
            }
          },
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REF_LAST_NM",
          label: "LastName",
          placeholder: "LastName",
          maxLength: 50,
          showMaxLength: false,
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
          },
          dependentFields: ["ACTIVE", "SR_CD"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          validate: (columnValue) => API?.validateCharValue(columnValue),
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (
              currentField?.value &&
              currentField?.value?.trim()?.length < 2
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("lastNmValidationMsg"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  REF_LAST_NM: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
            const index = Number(currentField?.fieldKey?.split("[")[1][0]);
            if (
              currentField?.value &&
              currentField?.value?.trim()?.length >= 2 &&
              formState?.state?.isValidateCustCtx?.ALLOW_NAME_CHANGE === "N" &&
              formState?.state?.retrieveFormDataApiRes?.RELATED_PERSON_DTL?.[
                index
              ]?.REF_LAST_NM !== currentField?.value &&
              Boolean(dependentFieldValues?.["RELATED_PERSON_DTL.SR_CD"]?.value)
            ) {
              formState?.handleButtonDisable(true);
              const postData = await API.validateName({
                COMP_CD: authState?.companyID ?? "",
                CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
              });
              formState?.handleButtonDisable(false);
              if (Number(postData?.[0]?.TRN_CNT) > 0) {
                const buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("TransactionsfoundNamecantbechanged"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  return {
                    REF_LAST_NM: {
                      value:
                        formState?.state?.retrieveFormDataApiRes
                          ?.RELATED_PERSON_DTL?.[index]?.REF_LAST_NM ?? "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                  };
                }
              }
            }
          },
          type: "text",
          txtTransform: "uppercase",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "RELATED_PERSON_KYC",
          label: "CkycNo",
          placeholder: "CkycNo",
          maxLength: 14,
          showMaxLength: false,
          dependentFields: ["ACTIVE", "RELATED_PERSON_DTL"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: false,
            decimalScale: 0,
            isAllowed: (values) => {
              if (values?.value?.length > 14) {
                return false;
              }
              if (values?.value === "0") {
                return false;
              }
              return true;
            },
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              if (currentField?.value?.length < 14) {
                const buttonName = await formState?.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "KYCNoshouldbe14digits",
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (buttonName === "Ok") {
                  return {
                    RELATED_PERSON_KYC: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                  };
                }
              } else {
                const currentIndex = Number(
                  currentField?.name?.split("[")[1][0]
                );
                const isDuplicate = (item, index) =>
                  index !== currentIndex &&
                  item?.RELATED_PERSON_KYC?.value === currentField?.value;
                const dupCustIDindex =
                  dependentFieldValues?.RELATED_PERSON_DTL?.findIndex(
                    isDuplicate
                  );
                if (dupCustIDindex !== -1) {
                  await formState.MessageBox({
                    messageTitle: "ValidationFailed",
                    message: t("ReferenceKYCMessage", {
                      row: dupCustIDindex + 1,
                    }),
                    icon: "ERROR",
                  });
                  return {
                    RELATED_PERSON_KYC: {
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
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REF_ACCT_NM",
          label: "RefName",
          isReadOnly: true,
          placeholder: "RefName",
          maxLength: 100,
          showMaxLength: false,
          type: "text",
          dependentFields: ["REF_FIRST_NM", "REF_MIDDLE_NM", "REF_LAST_NM"],
          setValueOnDependentFieldsChange: (dependentFields, formState) => {
            let full_name =
              formState?.state?.tabsApiResctx?.[0]?.NAME_PARA === "Y"
                ? `${
                    dependentFields?.["RELATED_PERSON_DTL.REF_FIRST_NM"]
                      ?.value ?? ""
                  } ${
                    dependentFields?.["RELATED_PERSON_DTL.REF_MIDDLE_NM"]
                      ?.value ?? ""
                  } ${
                    dependentFields?.["RELATED_PERSON_DTL.REF_LAST_NM"]
                      ?.value ?? ""
                  }`
                : `${
                    dependentFields?.["RELATED_PERSON_DTL.REF_LAST_NM"]
                      ?.value ?? ""
                  } ${
                    dependentFields?.["RELATED_PERSON_DTL.REF_FIRST_NM"]
                      ?.value ?? ""
                  } ${
                    dependentFields?.["RELATED_PERSON_DTL.REF_MIDDLE_NM"]
                      ?.value ?? ""
                  }`;
            return full_name;
          },
          GridProps: { xs: 12, sm: 5, md: 3, lg: 5, xl: 2 },
        },

        {
          render: {
            componentType: "divider",
            sequence: 20,
          },
          name: "PoIOfRelatedPersonDivider_ignoreField",
          label: "PoIOfRelatedPerson",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_PAN_NO",
          label: "PAN",
          placeholder: "AAAAA1111A",
          type: "text",
          txtTransform: "uppercase",
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            ___,
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
                } else {
                  return {
                    MASKED_PAN_NO: {
                      value: value ?? "",
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    },
                    PAN_NO: {
                      value: value ?? "",
                      ignoreUpdate: false,
                      isFieldFocused: false,
                    },
                  };
                }
              }
            } else if (value === "") {
              return {
                PAN_NO: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: false,
                },
              };
            }
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_DRIVING_LICENSE_NO",
          label: "DrivingLicNo",
          placeholder: "DrivingLicNo",
          type: "text",
          maxLength: 20,
          showMaxLength: false,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
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
              DRIVING_LICENSE_NO: {
                value: currentField.value ?? "",
              },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "DRIVING_LICENSE_EXPIRY_DT",
          label: "DrivingLicExpDt",
          placeholder: "DrivingLicExpDt",
          isMinWorkingDate: true,
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentField
          ) => {
            if (formState?.isSubmitting) return {};

            if (Boolean(currentField.value)) {
              if (!isValid(currentField?.value)) {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "Mustbeavaliddate",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
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
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "DrivingLicenseExpiryDateShouldBeFutureDate",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
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
            return {};
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_ELECTION_CARD_NO",
          label: "VoterId",
          placeholder: "VoterId",
          type: "text",
          maxLength: 20,
          showMaxLength: false,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
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
              ELECTION_CARD_NO: {
                value: currentField.value ?? "",
              },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_PASSPORT_NO",
          label: "PassportNo",
          placeholder: "PassportNo",
          type: "text",
          maxLength: 20,
          showMaxLength: false,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
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
              PASSPORT_NO: {
                value: currentField.value ?? "",
              },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "PASSPORT_EXPIRY_DT",
          label: "PassportExpDt",
          placeholder: "PassportExpDt",
          dependentFields: ["ACTIVE"],
          isMinWorkingDate: true,
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentField
          ) => {
            if (formState?.isSubmitting) return {};

            if (Boolean(currentField.value)) {
              if (!isValid(currentField?.value)) {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "Mustbeavaliddate",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
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
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "PassportExpiryDateShouldBeFutureDate",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
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
            return {};
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_UNIQUE_ID",
          label: "UniqueId",
          placeholder: "UniqueId",
          type: "text",
          maxLength: 12,
          showMaxLength: false,
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
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
              if (uidStatus === "I") {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "PleaseEnterValidUniqueID",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return clearUniqueIdFields;
                }
              } else if (uidStatus === "N") {
                const btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "UniqueIDLength",
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
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_NREGA_JOB_CARD",
          label: "NREGAJobCard",
          placeholder: "NREGAJobCard",
          type: "text",
          txtTransform: "uppercase",
          maxLength: 20,
          showMaxLength: false,
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
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
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "OTHER_DOC",
          label: "OtherDoc",
          placeholder: "OtherDoc",
          type: "text",
          txtTransform: "uppercase",
          maxLength: 50,
          showMaxLength: false,
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHAR_WITH_NUMBER || "";
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          validate: (columnValue) => API?.validateCharValue(columnValue),
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "MASKED_OTHER_DOC_NO",
          label: "OtherDocNo",
          placeholder: "OtherDocNo",
          type: "text",
          maxLength: 25,
          showMaxLength: false,
          txtTransform: "uppercase",
          preventSpecialChars: () => {
            return PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER || "";
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
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
              OTHER_DOC_NO: {
                value: currentField.value ?? "",
              },
            };
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "divider",
            sequence: 20,
          },
          name: "AttesDetailsIPVByDivider",
          label: "AttesDetailsIPVBy",
          DividerProps: {
            sx: { color: "var(--theme-color1)", fontWeight: "500" },
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "RCV_DOC_TYPE",
          label: "DocReceived",
          options: () => API.getPMISCData("CKYC_RCVDOCTYPE"),
          _optionsKey: "kycDocReceivedType",
          placeholder: "DocReceived",
          // required: true,
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          // schemaValidation: {
          //   type: "string",
          //   rules: [{ name: "required", params: ["DocReceivedIsRequired"] }],
          // },
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          options: () => API.getRiskCateg({ CALLFROM: "RELPER" }),
          _optionsKey: "kycRiskCateg",
          name: "RISK_CATEG",
          label: "RiskCategory",
          placeholder: "SelectRiskCategory",
          type: "text",
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "IPV_FLAG",
          label: "IPVFlag",
          options: [
            { label: "YES", value: "Y" },
            { label: "NO", value: "N" },
          ],
          _optionsKey: "ipvFlag",
          placeholder: "selectIPVFlag",
          // required: true,
          dependentFields: ["ACTIVE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            return !dependentFields?.["RELATED_PERSON_DTL.ACTIVE"]?.value;
          },
          // schemaValidation: {
          //   type: "string",
          //   rules: [{ name: "required", params: ["IPVFlagIsRequired"] }],
          // },
          type: "text",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "IPV_DATE",
          label: "IPVDate",
          isReadOnly: true,
          placeholder: "IPVDate",
          format: "dd/MM/yyyy HH:mm:ss",
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.IPV_DATE;
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "IPV_EMP_CODE",
          label: "EmpCode",
          options: API.getEmpCodeList,
          _optionsKey: "getEmpCodeList",
          enableVirtualized: true,
          placeholder: "EmpCode",
          runPostValidationHookAlways: true,
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.IPV_EMP_CODE;
          },
          dependentFields: ["ACTIVE"],
          isReadOnly: (current, dependent, formState) => {
            return !Boolean(
              formState?.state?.tabsApiResctx?.[0]?.ENABLE_IPV_EMP_CODE === "Y"
            ) || dependent?.["RELATED_PERSON_DTL.ACTIVE"]?.value === false
              ? true
              : false;
          },

          postValidationSetCrossFieldValues: async (
            field,
            formState,
            ___,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            return {
              IPV_NAME: {
                value: field?.optionData?.[0]?.DESCRIPTION ?? "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
              IPV_EMP_DESIG: {
                value: field?.optionData?.[0]?.GROUP_NAME ?? "",
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          },
          validate: (columnValue, dependent, formState) => {
            if (
              Boolean(
                formState?.state?.tabsApiResctx?.[0]?.ENABLE_IPV_EMP_CODE ===
                  "Y"
              ) &&
              columnValue?.value === "" &&
              !Boolean(columnValue?.readOnly) &&
              formState?.state?.customerIDctx === ""
            ) {
              return "EmpCodeRequired";
            }
            return "";
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "IPV_NAME",
          label: "EmpName",
          isReadOnly: true,
          placeholder: "EmpName",
          type: "text",
          txtTransform: "uppercase",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.IPV_NAME;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "IPV_EMP_DESIG",
          label: "EmpDesig",
          isReadOnly: true,
          placeholder: "EmpDesig",
          type: "text",
          txtTransform: "uppercase",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.IPV_EMP_DESIG;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "IPV_BRANCH",
          label: "IPVBranch",
          isReadOnly: true,
          placeholder: "IPVBranch",
          type: "text",
          txtTransform: "uppercase",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.IPV_BRANCH;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ORG_NAME",
          label: "OrgName",
          isReadOnly: true,
          placeholder: "OrgName",
          type: "text",
          txtTransform: "uppercase",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.ORG_NAME;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ORG_CODE",
          label: "OrgCode",
          isReadOnly: true,
          placeholder: "OrgCode",
          type: "text",
          txtTransform: "uppercase",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.ORG_CODE;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "PLACE_OF_DECLARE",
          label: "DecPlace",
          isReadOnly: true,
          placeholder: "DecPlace",
          type: "text",
          txtTransform: "uppercase",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.PLACE_OF_DECLARE;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "DATE_OF_DECLARE",
          label: "DecDate",
          isReadOnly: true,
          format: "dd/MM/yyyy HH:mm:ss",
          defaultValue: (formState, currentField) => {
            if (Boolean(formState?.state?.customerIDctx === ""))
              return formState?.attestData?.DATE_OF_DECLARE;
          },
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        },
      ],
    },
  ],
};
