import { isValid } from "date-fns";
import * as API from "../api";
import {
  greaterThanDate,
  lessThanDate,
  utilFunction,
} from "@acuteinfo/common-base";
import { t } from "i18next";
export const TDSAddNewFormMetadata = {
  form: {
    name: "tds_exemption_form",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
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
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FORM_TYPE",
      label: "ExemptionType",
      placeholder: "ExemptionType",
      options: () => API.getPMISCData("EXEMPTION_TYPE"),
      _optionsKey: "exemptionTypeOp",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ExemptionTypeRequired"] }],
      },
      __EDIT__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FORM_NM",
      label: "FormName",
      placeholder: "FormName",
      dependentFields: ["FORM_TYPE"],
      options: (...reqData) => {
        return API.getPMISCData(
          reqData?.[2]?.FORM_TYPE?.value
            ? reqData?.[2]?.FORM_TYPE?.value
            : "TDS_EXEMPTION",
          {
            ...reqData?.[2],
            ...reqData?.[3],
          }
        );
      },
      _optionsKey: "getPMISCData",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FormNameRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      disableCaching: true,
      __EDIT__: { isReadOnly: true },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "RECEIVED_DT",
      label: "ReceivedDate",
      placeholder: "ReceivedDate",
      defaultValue: (formstate) => {
        return formstate?.WORKING_DATE;
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        const receivedDateRaw = currentField?.value;
        const workingDateRaw = authState?.workingDate;

        const isReceivedDateValid = utilFunction?.isValidDate(receivedDateRaw);
        const isWorkingDateValid = utilFunction?.isValidDate(workingDateRaw);

        if (!isReceivedDateValid || !isWorkingDateValid) {
          return;
        }

        const receivedDate = new Date(receivedDateRaw);
        const workingDate = new Date(workingDateRaw);

        if (receivedDate > workingDate) {
          const buttonName = await formState?.MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("receivedDateValidationMsg"),
            buttonNames: ["Ok"],
            icon: "ERROR",
          });

          if (buttonName === "Ok") {
            return {
              RECEIVED_DT: {
                value: "",
                isFieldFocused: true,
              },
            };
          }
        }
      },
      __EDIT__: { isReadOnly: true },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "EFFECTIVE_DT",
      label: "EffectiveDate",
      placeholder: "EffectiveDate",
      __EDIT__: { isReadOnly: true },
      dependentFields: ["FORM_EXPIRY_DATE"],
      isMaxWorkingDate: true,
      validate: (currentField, dependentField, formState) => {
        const value = currentField?.value;
        const expiryDate = dependentField?.FORM_EXPIRY_DATE?.value;
        const effectiveDate = new Date(value);
        const workingDate = new Date(formState?.WORKING_DATE);

        if (!value) return;

        if (!isValid(effectiveDate)) {
          return t("Mustbeavaliddate");
        }

        if (greaterThanDate(effectiveDate, workingDate, { ignoreTime: true })) {
          return t("effectiveDateValidationMsg");
        }

        if (
          expiryDate &&
          isValid(new Date(expiryDate)) &&
          !lessThanDate(effectiveDate, new Date(expiryDate), {
            ignoreTime: true,
          })
        ) {
          return t("effectiveLessThanExpiryMsg");
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FORM_EXPIRY_DATE",
      label: "ExpiryDate",
      placeholder: "ExpiryDate",
      __EDIT__: {
        isReadOnly: true,
      },
      required: true,
      isMinWorkingDate: true,
      dependentFields: ["EFFECTIVE_DT"],
      runValidationOnDependentFieldsChange: true,
      validate: (currentField, dependentField, formState) => {
        const value = currentField?.value;
        const effectiveDate = dependentField?.EFFECTIVE_DT?.value;
        const expiryDate = new Date(value);
        const effectiveDateObj = new Date(effectiveDate);
        const workingDate = new Date(formState?.WORKING_DATE);

        if (!value) {
          return t("pleaseEnterExpiryDateMsg");
        }

        if (!isValid(expiryDate)) {
          return t("Mustbeavaliddate");
        }

        if (lessThanDate(expiryDate, workingDate, { ignoreTime: true })) {
          return t("expiryGreaterOrEqualWorkingMsg");
        }

        if (
          effectiveDate &&
          isValid(effectiveDateObj) &&
          !greaterThanDate(expiryDate, effectiveDateObj, { ignoreTime: true })
        ) {
          return t("expiryGreaterThanEffectiveMsg");
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TDS_LIMIT",
      label: "ExemptionLimit",
      placeholder: "ExemptionLimit",
      defaultValue: "0.00",
      autoComplete: "off",
      runPostValidationHookAlways: true,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          return true;
        },
      },
      __EDIT__: {
        isReadOnly: true,
        setValueOnDependentFieldsChange: (dependentFields) => {},
      },
      dependentFields: ["FORM_TYPE"],
      isReadOnly: (field, dependentFields, formState) => {
        const ExemptionType = dependentFields?.FORM_TYPE?.value;
        if (ExemptionType === "TDS_EXEMPTION") {
          return true;
        }
        return false;
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        const ExemptionType = dependentFields?.FORM_TYPE?.value;
        if (ExemptionType === "TDS_EXEMPTION") {
          return "";
        } else return null;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "TDS_RATE",
      label: "Rate",
      placeholder: "0.00",
      type: "text",
      fullWidth: true,
      decimalScale: 2,
      FormatProps: {
        allowLeadingZeros: false,
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["FORM_TYPE"],
      __EDIT__: {
        isReadOnly: true,
        setValueOnDependentFieldsChange: (dependentFields) => {},
      },
      isReadOnly: (field, dependentFields, formState) => {
        const ExemptionType = dependentFields?.FORM_TYPE?.value;
        if (ExemptionType === "TDS_EXEMPTION") {
          return true;
        }
        return false;
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        const ExemptionType = dependentFields?.FORM_TYPE?.value;
        if (ExemptionType === "TDS_EXEMPTION") {
          return "";
        } else return null;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TDS_CERTI_DETAILS",
      label: "ExemptionDetails",
      placeholder: "ExemptionDetails",
      type: "text",
      dependentFields: ["FORM_TYPE"],
      __EDIT__: {
        isReadOnly: true,
        setValueOnDependentFieldsChange: (dependentFields) => {},
      },
      isReadOnly: (field, dependentFields, formState) => {
        const ExemptionType = dependentFields?.FORM_TYPE?.value;
        if (ExemptionType === "TDS_EXEMPTION") {
          return true;
        }
        return false;
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        const ExemptionType = dependentFields?.FORM_TYPE?.value;
        if (ExemptionType === "TDS_EXEMPTION") {
          return "";
        } else return null;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 4.8, xl: 4 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FIN_INT_AMT",
      label: "ProjectedFinInt",
      placeholder: "ProjectedFinInt",
      defaultValue: "0.00",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 14) {
            return false;
          }
          return true;
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "SUBMISSION_DT",
      label: "SubmissiontoIT",
      placeholder: "SubmissiontoIT",
      __EDIT__: {
        isReadOnly: true,
      },
      isMinWorkingDate: true,
      validate: (currentField, dependentField, formState) => {
        const submissionDate = new Date(currentField?.value);
        const workingDate = new Date(formState?.WORKING_DATE);

        if (!currentField?.value) return;

        if (!isValid(submissionDate)) {
          return t("Mustbeavaliddate");
        }

        if (
          lessThanDate(submissionDate, workingDate, {
            ignoreTime: true,
          })
        ) {
          return t("submissionGreaterOrEqualWorkingMsg");
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datetimePicker",
      },
      name: "ENTERED_DATE",
      label: "EnteredDate",
      placeholder: "EnteredDate",
      isReadOnly: true,

      defaultValue: (fs) => {
        return fs.WORKING_DATE;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: "N",
      name: "UPLOAD",
    },
    {
      render: {
        componentType: "checkbox",
      },
      defaultValue: true,
      name: "ACTIVE",
      label: "Active",
      validationRun: "onChange",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 1, xl: 1 },
      __EDIT__: {
        isReadOnly: (fieldValue, dependentFields, formState) => {
          const isReadOnlyCondition = !fieldValue?.value;
          return isReadOnlyCondition;
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (!currentField?.value) {
            return {
              INACTIVE_DT: {
                value: authState?.workingDate ?? "",
                ignoreUpdate: true,
              },
            };
          }
        },
      },

      isReadOnly: (fieldValue, dependentFields, formState) => {
        const rowData = formState?.rowData ?? {};
        const ACTIVE = formState?.ACTIVE;

        const isReadOnlyCondition =
          ACTIVE === "N" ||
          rowData.CONFIRMED === "N" ||
          rowData.UPLOAD === "Y" ||
          !fieldValue?.value;

        return isReadOnlyCondition;
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "INACTIVE_DT",
      label: "InactiveDate",
      placeholder: "InactiveDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER9",
      label: "TDSExenotionFormNote",
      DividerProps: {
        sx: { color: "red", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ],
};
