import { utilFunction } from "@acuteinfo/common-base";
import { handleDisplayMessages } from "components/utilFunction/function";
import { isValid } from "date-fns";
import { GeneralAPI } from "registry/fns/functions";

const isFlag = (dependentFields: Record<string, any>, flagValue: string) =>
  dependentFields?.FLAG?.value === flagValue;

const showAlert = async (
  MessageBox: any,
  messageTitle: string,
  message: string
) => {
  const btn = await MessageBox({
    messageTitle,
    message,
    buttonNames: ["Ok"],
    icon: "WARNING",
  });
  return btn === "Ok";
};

const validateDate = (dateStr?: string) =>
  dateStr && !isValid(new Date(dateStr)) ? "Mustbeavaliddate" : "";

export const retrievalFormMetadata = {
  form: {
    name: "responseParameterData",
    label: "ResponseParameters",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: { xs: 12, sm: 4, md: 4 },
        container: { direction: "row", spacing: 0.5 },
      },
    },
    componentProps: {
      textField: { fullWidth: true },
      datePicker: { fullWidth: true },
    },
  },
  fields: [
    {
      render: { componentType: "radio" },
      name: "FLAG",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: "A",
      options: [
        { label: "accountWise", value: "A" },
        { label: "RegistrationNo", value: "R" },
        { label: "RegistrationDate", value: "D" },
      ],
      runValidationOnDependentFieldsChange: true,
      validationRun: "all",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: { componentType: "numberFormat" },
      name: "COMP_CD",
      label: "Bank",
      placeholder: "Bank",
      dependentFields: ["ACCT_TYPE_", "FLAG"],
      shouldExclude: (_fieldData, dependentFields) =>
        !isFlag(dependentFields, "L"),
      FormatProps: {
        isAllowed: (values) => values?.value?.length <= 9,
      },
      GridProps: { xs: 4, sm: 4, md: 4, lg: 3, xl: 3 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        dependentFields: ["FLAG"],
        runPostValidationHookAlways: true,
        shouldExclude: (_fieldData, dependentFields) =>
          !isFlag(dependentFields, "A"),
        validationRun: "onChange",
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          _authState,
          dependentFieldValues
        ) => {
          if (
            currentField?.value &&
            !dependentFieldValues?.BRANCH_CD?.value?.length
          ) {
            const okPressed = await showAlert(
              formState?.MessageBox,
              "Alert",
              "EnterAccountBranch"
            );
            if (okPressed) {
              return {
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
      },

      accountTypeMetadata: {
        dependentFields: ["FLAG", "BRANCH_CD"],
        name: "ACCT_TYPE",
        runPostValidationHookAlways: true,
        shouldExclude: (_fieldData, dependentFields) =>
          !isFlag(dependentFields, "A"),
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },

        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          _authState,
          dependentFieldValues
        ) => {
          // Clear account name if ACCT_TYPE changes - simple reset, no dialog here
          if (!currentField?.value) {
            return { ACCT_NM: { value: "" } };
          }
          return {};
        },
      },

      accountCodeMetadata: {
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "FLAG"],
        shouldExclude: (_fieldData, dependentFields) =>
          !isFlag(dependentFields, "A"),
        runPostValidationHookAlways: true,
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },

        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (
            currentField.value &&
            !dependentFieldValues?.ACCT_TYPE?.value?.length
          ) {
            const okPressed = await showAlert(
              formState?.MessageBox,
              "Alert",
              "EnterAccountType"
            );
            if (okPressed) {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }

          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues.BRANCH_CD.value,
              COMP_CD: authState?.companyID,
              ACCT_TYPE: dependentFieldValues.ACCT_TYPE.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField.value,
                dependentFieldValues.ACCT_TYPE.optionData?.[0] ?? {}
              ),
              SCREEN_REF: formState?.docCD ?? "",
            };

            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            const response: Record<string, any> = await handleDisplayMessages(
              postData?.MSG,
              formState.MessageBox,
              {
                onYes: () => postData,
                onNo: () => ({}),
              }
            );

            const isValidResponse = Object.keys(response || {}).length > 0;

            return {
              ACCT_CD: isValidResponse
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField.value,
                      dependentFieldValues.ACCT_TYPE.optionData
                    ),
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  }
                : {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
              ACCT_NM: { value: response?.ACCT_NM ?? "" },
            };
          }

          if (!currentField?.value) {
            return { ACCT_NM: { value: "" } };
          }

          return {};
        },
      },
    },

    {
      render: { componentType: "textField" },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      dependentFields: ["FLAG"],
      shouldExclude: (_fieldData, dependentFields) =>
        !isFlag(dependentFields, "A"),
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: { componentType: "spacer" },
      name: "LINE_NO_SPACER",
      GridProps: { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 },
    },

    {
      render: { componentType: "datePicker" },
      name: "FROM_DT",
      label: "GeneralFromDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      defaultValue: (formState) => formState?.workingDt,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateIsRequired"] }],
      },
      dependentFields: ["TO_DT", "FLAG"],
      validate: (currentField, dependentField) => {
        if (!currentField?.value) return "";
        if (!isValid(new Date(currentField.value))) return "Mustbeavaliddate";
        if (
          dependentField?.TO_DT?.value &&
          new Date(currentField.value) > new Date(dependentField.TO_DT.value)
        )
          return "FromDateValidationMsg";
        return "";
      },
      shouldExclude: (_fieldData, dependentFields) =>
        !isFlag(dependentFields, "D"),
      validationRun: "onChange",
      GridProps: { xs: 4, sm: 4, md: 2, lg: 4, xl: 4 },
    },

    {
      render: { componentType: "datePicker" },
      name: "TO_DT",
      label: "GeneralToDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      dependentFields: ["TO_DT", "FLAG"],
      defaultValue: (formState) => formState?.workingDt,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateIsRequired"] }],
      },
      validate: (currentField) => validateDate(currentField?.value),
      shouldExclude: (_fieldData, dependentFields) =>
        !isFlag(dependentFields, "D"),
      GridProps: { xs: 4, sm: 4, md: 2, lg: 4, xl: 4 },
    },

    {
      render: { componentType: "numberFormat" },
      name: "TRAN_CD",
      dependentFields: ["FLAG"],
      label: "RegistrationNumber",
      placeholder: "EnterRegistrationNo",
      fullWidth: true,
      shouldExclude: (_fieldData, dependentFields) =>
        !isFlag(dependentFields, "R"),
      GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
    },
  ],
};
