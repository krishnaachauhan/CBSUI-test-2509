import { isValid } from "date-fns";
import * as API from "../api";
import { GeneralAPI } from "registry/fns/functions";
import { utilFunction } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";

export const retrieveFormMetaData = {
  form: {
    name: "atm-retrieve-metadata",
    label: "Retrieve Information",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
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
    {
      render: {
        componentType: "radio",
      },
      name: "A_RET_FLAG",
      label: "",
      RadioGroupProps: {
        row: true,
        display: "flex",
        justifyContent: "center",
        sx: {},
      },
      defaultValue: "A",
      options: [
        {
          label: "CustomerId",
          value: "C",
        },
        { label: "AccountNo", value: "A" },
        { label: "ApplicationDate", value: "D" },
      ],

      textFieldStyle: {
        display: "flex",
        justifyContent: "center",
      },
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        lg: 12,
        xl: 12,
      },
      validationRun: "onChange",
      dependentFields: ["ACCT_TYPE", "CUSTOMER_ID", "FROM_DT"],
      postValidationSetCrossFieldValues: (field) => {
        return {
          ACCT_TYPE: {
            value: "",
            isFieldFocused: field?.value === "A" ? true : false,
          },
          CUSTOMER_ID: {
            value: "",
            isFieldFocused: field?.value === "C" ? true : false,
          },
          FROM_DT: { isFieldFocused: field?.value === "D" ? true : false },
        };
      },
    },

    {
      render: {
        componentType: "_accountNumber",
      },

      branchCodeMetadata: {
        GridProps: {
          xs: 12,
          md: 2.5,
          sm: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        dependentFields: ["A_RET_FLAG"],
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
        validate: (columnValue, allField) => {
          if (
            columnValue.value.length <= 0 &&
            allField?.A_RET_FLAG.value === "A"
          ) {
            return "PleaseSelectBranchCode";
          }
          return "";
        },
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.A_RET_FLAG?.value === "A") {
            return false;
          } else {
            return true;
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
          const isHOBranch = await validateHOBranch(
            field,
            formState?.MessageBox,
            authState
          );
          if (isHOBranch) {
            return {
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          if (field.value) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
            };
          } else if (!field.value) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              ACCT_NM: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
      },
      accountTypeMetadata: {
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
        GridProps: {
          xs: 12,
          md: 2.5,
          sm: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        dependentFields: ["A_RET_FLAG"],
        validate: (columnValue, allField) => {
          if (
            columnValue.value.length <= 0 &&
            allField?.A_RET_FLAG.value === "A"
          ) {
            return "PleaseSelectAcctType";
          }
          return "";
        },
        shouldExclude(fieldData, dependentFieldsValues) {
          if (dependentFieldsValues?.A_RET_FLAG?.value === "A") {
            return false;
          } else {
            return true;
          }
        },
        isFieldFocused: true,
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: formState?.docCD,
          });
        },
        _optionsKey: "get_Account_Type",
        postValidationSetCrossFieldValues: () => {
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
      },
      accountCodeMetadata: {
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
        GridProps: {
          xs: 12,
          md: 2.5,
          sm: 2.5,
          lg: 2.5,
          xl: 2.5,
        },
        dependentFields: ["A_RET_FLAG", "BRANCH_CD", "ACCT_TYPE"],
        validate: (columnValue, allField, flag) => {
          let regex = /^[^!&]*$/;

          if (
            columnValue.value.length <= 0 &&
            allField?.A_RET_FLAG.value === "A"
          ) {
            return "PleaseEnterAcctNo";
          } else if (!regex.test(columnValue.value)) {
            return "Special Characters (!, &) not Allowed";
          }
          return "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (
            field?.value &&
            dependentValue?.BRANCH_CD?.value &&
            dependentValue?.ACCT_TYPE?.value
          ) {
            let otherAPIRequestPara = {
              COMP_CD: authState?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              GD_TODAY_DT: authState?.workingDate,
              SCREEN_REF: formState?.docCD,
            };
            let postData = await GeneralAPI.getAccNoValidation(
              otherAPIRequestPara
            );

            let apiRespMSGdata = postData?.MSG;
            let isReturn;
            const messagebox = async (
              msgTitle,
              msg,
              buttonNames,
              status,
              icon
            ) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon: icon,
              });
              return { buttonName, status };
            };
            if (apiRespMSGdata?.length) {
              for (let i = 0; i < apiRespMSGdata?.length; i++) {
                if (apiRespMSGdata[i]?.O_STATUS !== "0") {
                  let btnName = await messagebox(
                    apiRespMSGdata[i]?.O_MSG_TITLE
                      ? apiRespMSGdata[i]?.O_MSG_TITLE
                      : apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ValidationFailed"
                      : apiRespMSGdata[i]?.O_STATUS === "99"
                      ? "confirmation"
                      : "ALert",
                    apiRespMSGdata[i]?.O_MESSAGE,
                    apiRespMSGdata[i]?.O_STATUS === "99"
                      ? ["Yes", "No"]
                      : ["Ok"],
                    apiRespMSGdata[i]?.O_STATUS,
                    apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ERROR"
                      : apiRespMSGdata[i]?.O_STATUS === "99"
                      ? "CONFIRM"
                      : "WARNING"
                  );

                  if (btnName.buttonName === "No" || btnName.status === "999") {
                    formState.isAcccctValidate.current = {
                      flag: "A",
                      valid: false,
                    };
                    return {
                      ACCT_CD: {
                        value: "",
                        isFieldFocused: true,
                      },
                      ACCT_NM: { value: "" },
                    };
                  }
                } else {
                  isReturn = true;
                }
              }
            }

            if (Boolean(isReturn)) {
              formState.isAcccctValidate.current = {
                flag: dependentValue?.A_RET_FLAG?.value,
                valid: true,
              };
              return {
                ACCT_CD: {
                  value: utilFunction.getPadAccountNumber(
                    field?.value,
                    dependentValue?.ACCT_TYPE?.optionData
                  ),
                  ignoreUpdate: true,
                  // isFieldFocused: false,
                },
                ACCT_NM: {
                  value: postData?.ACCT_NM ?? "",
                },
                RETRIEVE: { value: "", isFieldFocused: true },
              };
            }
          } else if (!field?.value) {
            formState.isAcccctValidate.current = {
              flag: "A",
              valid: false,
            };
            return {
              ACCT_NM: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.A_RET_FLAG?.value === "A") {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      isReadOnly: true,
      dependentFields: ["A_RET_FLAG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.A_RET_FLAG?.value === "A") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        md: 4.5,
        sm: 4.5,
        lg: 4.5,
        xl: 4.5,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      dependentFields: ["A_RET_FLAG"],
      name: "SPACER",
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return dependentFieldsValues?.A_RET_FLAG?.value === "A" ? true : false;
      },
      GridProps: {
        xs: 2.5,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      placeholder: "EnterCustomerID",
      validationRun: "onChange",
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      dependentFields: ["A_RET_FLAG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.A_RET_FLAG?.value === "C") {
          return false;
        } else {
          return true;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependent
      ) => {
        if (dependent?.A_RET_FLAG?.value === "C") {
          formState.isAcccctValidate.current = {};
        }
      },

      runValidationOnDependentFieldsChange: true,
      validate: (columnValue, allField, flag) => {
        if (
          columnValue.value.length <= 0 &&
          allField?.A_RET_FLAG.value === "C"
        ) {
          return "CustomerIdisrequired";
        }
        return "";
      },
      required: true,
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
        lg: 4,
        xl: 4,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "GeneralFromDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      isWorkingDate: true,
      format: "dd/MM/yyyy",
      GridProps: {
        xs: 3.5,
        md: 3.5,
        sm: 3.5,
        lg: 3.5,
        xl: 3.5,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      validationRun: "onChange",

      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["A_RET_FLAG"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.A_RET_FLAG?.value === "D") {
          return false;
        } else {
          return true;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependent
      ) => {
        if (dependent?.A_RET_FLAG?.value === "D") {
          formState.isAcccctValidate.current = {};
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "GeneralToDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      isWorkingDate: true,
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateRequired"] }],
      },
      validationRun: "onChange",
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["FROM_DT", "A_RET_FLAG"],
      runValidationOnDependentFieldsChange: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.A_RET_FLAG?.value === "D") {
          return false;
        } else {
          return true;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependent
      ) => {
        if (dependent?.A_RET_FLAG?.value === "D") {
          formState.isAcccctValidate.current = {};
        }
      },
      GridProps: {
        xs: 3.5,
        md: 3.5,
        sm: 3.5,
        lg: 3.5,
        xl: 3.5,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACERS",
      dependentFields: ["A_RET_FLAG"],
      shouldExclude: (_, dependentFieldsValues, formState) => {
        return dependentFieldsValues?.A_RET_FLAG?.value === "D" ? false : true;
      },
      GridProps: {
        xs: 2.5,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACERSS",
      GridProps: {
        xs: 8,
        md: 8,
        sm: 8,
        lg: 8,
        xl: 8,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      // endsIcon: "YoutubeSearchedFor",
      // rotateIcon: "scale(1.5)",
      dependentFields: ["A_RET_FLAG", "ACCT_CD"],
      isReadOnly: (fieldData, dependentFields, formState) => {
        if (
          dependentFields?.ACCT_CD?.value?.length < 15 &&
          dependentFields?.A_RET_FLAG?.value === "A"
        ) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "CANCEL",
      label: "Cancel",
      // endsIcon: "YoutubeSearchedFor",
      // rotateIcon: "scale(1.5)",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
  ],
};
