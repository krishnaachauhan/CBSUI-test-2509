import { getCutomerDetail, getFDDtl, getFinDate } from "../api";
import { format } from "date-fns";
import { isValid } from "date-fns";
import { t } from "i18next";

export const form15GHEntryMetaData = {
  masterForm: {
    form: {
      name: "form15GHEntryFormMetaData",
      label: "",
      resetFieldOnUnmount: false,
      validationRun: "onBlur",
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
        numberFormat: {
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
        label: "CustomerId",
        placeholder: "EnterCustomerID",
        type: "text",
        autoComplete: "off",
        maxLength: 12,
        isFieldFocused: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["CustomerIDisrequired"] }],
        },
        FormatProps: {
          isAllowed: (values) => {
            if (values?.value?.length > 12) {
              return false;
            }
            return true;
          },
        },
        __VIEW__: { isReadOnly: true },
        __EDIT__: { isReadOnly: true },
        __NEW__: {
          // isFieldFocused: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            const defaultFields = {
              ACCT_NM: { value: "" },
              ADD1: { value: "" },
              PIN_CODE: { value: "" },
              CITY_NM: { value: "" },
              FORM_NM: { value: "" },
              PAN_NO: { value: "" },
              BIRTH_DT: { value: "" },
              ADD2: { value: "" },
              AGE: { value: "" },
              AREA_NM: { value: "" },
              DISTRICT_NM: { value: "" },
              EXPLICIT_TDS: { value: "" },
              E_MAIL_ID: { value: "" },
              FORM_EXPIRY_DATE: { value: "" },
              STATE_NM: { value: "" },
              INT_AMT_LIMIT: { value: "" },
              VALID_AMT: { value: "" },
              UNIQUE_ID: { value: "" },
              ENTERED_FROM: { value: "" },
              CONFIRMED: { value: "" },
              ALLOW_PRINT: { value: "" },
              PRINT_MSG: { value: "" },
              TOT_INCOME: { isFieldFocused: false },
            };
            if (currentField?.value) {
              let postData = await getCutomerDetail({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.id ?? "",
                USERROLE: authState?.role ?? "",
                SCREEN_REF: formState?.docCD ?? "",
                CUSTOMER_ID: currentField?.value,
              });
              let returnVal;
              if (postData?.[0]?.O_STATUS === "999") {
                let buttonName = await formState?.MessageBox({
                  messageTitle: postData?.[0]?.O_MSG_TITLE
                    ? postData?.[0]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.[0]?.O_MESSAGE,
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                formState.setDataOnFieldChange("GRID_DATA", []);
                if (buttonName === "Ok") {
                  return {
                    ...defaultFields,
                    CUSTOMER_ID: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    BIRTH_DT: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (postData?.[0]?.O_STATUS === "99") {
                let buttonName = await formState?.MessageBox({
                  messageTitle: postData?.[0]?.O_MSG_TITLE
                    ? postData?.[0]?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData?.[0]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                formState.setDataOnFieldChange("GRID_DATA", []);
                if (buttonName === "No") {
                  return {
                    ...defaultFields,
                    CUSTOMER_ID: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    BIRTH_DT: {
                      value: "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (postData?.[0]?.O_STATUS === "9") {
                let buttonName = await formState?.MessageBox({
                  messageTitle: postData?.[0]?.O_MSG_TITLE
                    ? postData?.[0]?.O_MSG_TITLE
                    : "Alert",
                  message: postData?.[0]?.O_MESSAGE,
                  buttonNames: ["Ok"],
                  icon: "WARNING",
                });
              } else if (postData?.[0]?.O_STATUS === "0") {
                returnVal = postData?.[0];
                const postData2 = await getFDDtl({
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                  SCREEN_REF: formState?.docCD ?? "",
                  CUSTOMER_ID: currentField?.value,
                });

                let btn99;

                const getButtonName = async (obj) => {
                  let btnName = await formState.MessageBox(obj);
                  return { btnName, obj };
                };

                for (let j = 0; j < postData2.length; j++) {
                  if (postData2[j]?.O_STATUS === "999") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData2[j]?.O_MSG_TITLE
                        ? postData2[j]?.O_MSG_TITLE
                        : "ValidationFailed",
                      message: postData2[j]?.O_MESSAGE.startsWith("\n")
                        ? postData2[j]?.O_MESSAGE?.slice(1)
                        : postData2[j]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    formState.setDataOnFieldChange("GRID_DATA", []);
                  } else if (postData2[j]?.O_STATUS === "9") {
                    if (btn99 !== "No") {
                      const { btnName, obj } = await getButtonName({
                        messageTitle: postData2[j]?.O_MSG_TITLE
                          ? postData2[j]?.O_MSG_TITLE
                          : "Alert",
                        message: postData2[j]?.O_MESSAGE,
                        icon: "WARNING",
                      });
                    }
                  } else if (postData2[j]?.O_STATUS === "99") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData2[j]?.O_MSG_TITLE
                        ? postData2[j]?.O_MSG_TITLE
                        : "Confirmation",
                      message: postData2[j]?.O_MESSAGE,
                      buttonNames: ["Yes", "No"],
                      icon: "CONFIRM",
                    });
                    btn99 = btnName;
                    if (btnName === "No") {
                      formState.setDataOnFieldChange("GRID_DATA", []);
                    }
                  } else {
                    formState.setDataOnFieldChange("GRID_DATA", postData2);
                    const sumOfFinInterest = postData2
                      .reduce((acc, item) => {
                        const value = parseInt(item?.FIN_INT_AMT);
                        return acc + (isNaN(value) ? 0 : value);
                      }, 0)
                      .toString();

                    returnVal = {
                      ...postData?.[0],
                      FIN_INT_AMT: sumOfFinInterest,
                    };
                  }
                }
              }
              return {
                CUSTOMER_ID:
                  returnVal !== ""
                    ? {
                        value: currentField?.value,
                        ignoreUpdate: true,
                        isFieldFocused: false,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                ACCT_NM: { value: returnVal?.ACCT_NM ?? "" },
                INT_AMT_LIMIT: { value: returnVal?.INT_AMT_LIMIT ?? "" },
                TOT_INCOME: { value: "", isFieldFocused: true },
                VALID_AMT: { value: returnVal?.VALID_AMT ?? "" },
                FORM_NM: { value: returnVal?.FORM_NM ?? "" },
                ADD1: { value: returnVal?.ADD1 ?? "" },
                PIN_CODE: { value: returnVal?.PIN_CODE ?? "" },
                CITY_NM: { value: returnVal?.CITY_NM ?? "" },
                PAN_NO: { value: returnVal?.PAN_NO ?? "" },
                BIRTH_DT: {
                  value: returnVal?.BIRTH_DT ?? "",
                },
                ADD2: { value: returnVal?.ADD2 ?? "" },
                AGE: { value: returnVal?.AGE ?? "" },
                AREA_NM: { value: returnVal?.AREA_NM ?? "" },
                DISTRICT_NM: { value: returnVal?.DISTRICT_NM ?? "" },
                EXPLICIT_TDS: { value: returnVal?.EXPLICIT_TDS ?? "" },
                E_MAIL_ID: { value: returnVal?.E_MAIL_ID ?? "" },
                FORM_EXPIRY_DATE: {
                  value: returnVal?.FORM_EXPIRY_DATE ?? "",
                },
                STATE_NM: { value: returnVal?.STATE_NM ?? "" },
                UNIQUE_ID: { value: returnVal?.UNIQUE_ID ?? "" },
                ENTERED_FROM: { value: returnVal?.ENTERED_FROM ?? "" },
                CONFIRMED: { value: returnVal?.CONFIRMED ?? "" },
                ALLOW_PRINT: { value: returnVal?.ALLOW_PRINT ?? "" },
                PRINT_MSG: { value: returnVal?.PRINT_MSG ?? "" },
                FIN_INT_AMT: { value: returnVal?.FIN_INT_AMT ?? "" },
              };
            } else if (!currentField?.value) {
              return {
                ...defaultFields,
              };
            }
          },
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "PAN_NO",
        label: "PAN_NO",
        type: "text",
        isReadOnly: true,
        txtTransform: "uppercase",
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "FORM_NM",
        label: "FormName",
        isReadOnly: true,
        placeholder: "",
        type: "text",
        textFieldStyle: {
          "& .MuiInputBase-root": {
            background: "var(--theme-color7) !important",
          },
          "& .MuiInputBase-input": {
            fontWeight: "bold !important",
          },
        },
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "BIRTH_DT",
        label: "BirthDate",
        fullWidth: true,
        format: "dd/MM/yyyy",
        GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 1.5 },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ACCT_NM",
        label: "AccountName",
        type: "text",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 5, md: 4, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "UNIQUE_ID",
        label: "UIN",
        type: "text",
        txtTransform: "uppercase",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
      },
      {
        render: { componentType: "datePicker" },
        name: "FORM_EXPIRY_DATE",
        label: "FormTillDate",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 2.5, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ADD1",
        label: "Address1",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3, xl: 3.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ADD2",
        label: "Address2",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3, xl: 3.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "AREA_NM",
        label: "Area",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
      },
      {
        render: { componentType: "numberFormat" },
        name: "PIN_CODE",
        label: "PinCode",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "CITY_NM",
        label: "City",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 2.3, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "DISTRICT_NM",
        label: "District",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 2.3, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "STATE_NM",
        label: "State",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 2.4, lg: 2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "E_MAIL_ID",
        label: "Email",
        type: "text",
        autoComplete: "off",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 5, md: 6, lg: 2.5, xl: 3 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "FIN_INT_AMT",
        label: "EstimatedInterestForWhichDeclarationIsMade",
        placeholder: "",
        type: "text",
        isReadOnly: true,
        dependentFields: [
          "VALID_AMT",
          "INT_AMT_LIMIT",
          "OTH_BANK_AMT",
          "FORM_NM",
          "TOT_INCOME",
        ],
        __NEW__: {
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (
              currentField?.value &&
              dependentFieldValues?.FORM_NM?.value &&
              dependentFieldValues?.INT_AMT_LIMIT?.value
            ) {
              const sumOfAllDependentField = await Number(
                (parseFloat(dependentFieldValues?.TOT_INCOME?.value) || 0) +
                  (parseFloat(dependentFieldValues?.VALID_AMT?.value) || 0) +
                  (parseFloat(dependentFieldValues?.OTH_BANK_AMT?.value) || 0) +
                  (parseFloat(currentField?.value) || 0)
              );
              const formName = dependentFieldValues?.FORM_NM?.value || "";
              const interestAmtLimit =
                dependentFieldValues?.INT_AMT_LIMIT?.value || 0;
              if (sumOfAllDependentField > Number(interestAmtLimit)) {
                await formState.MessageBox({
                  messageTitle: "Validation Failed",
                  message: `${t(`TotalIncomeValidateMessage`, {
                    formName: formName,
                    interestAmtLimit: interestAmtLimit,
                  })}`,
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                await formState.setDataOnFieldChange("GRID_DATA", []);
                return {
                  FIN_INT_AMT: { value: "", ignoreUpdate: false },
                  CUSTOMER_ID: { value: "", ignoreUpdate: false },
                };
              }
            }
          },
        },
        GridProps: { xs: 12, sm: 6, md: 6, lg: 3.5, xl: 3 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "TOT_INCOME",
        label: "EstimatedOtherIncomeExceptAboveInterestAmount",
        placeholder: "",
        autoComplete: "off",
        type: "text",
        __VIEW__: { isReadOnly: true },
        __EDIT__: { isReadOnly: true },
        dependentFields: [
          "VALID_AMT",
          "INT_AMT_LIMIT",
          "FIN_INT_AMT",
          "OTH_BANK_AMT",
          "FORM_NM",
        ],
        __NEW__: {
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              const sumOfAllDependentField = Number(
                (parseFloat(dependentFieldValues?.FIN_INT_AMT?.value) || 0) +
                  (parseFloat(dependentFieldValues?.VALID_AMT?.value) || 0) +
                  (parseFloat(dependentFieldValues?.OTH_BANK_AMT?.value) || 0) +
                  (parseFloat(currentField?.value) || 0)
              );
              const formName = dependentFieldValues?.FORM_NM?.value || "";
              const interestAmtLimit =
                dependentFieldValues?.INT_AMT_LIMIT?.value || 0;

              if (sumOfAllDependentField > Number(interestAmtLimit)) {
                formState.MessageBox({
                  messageTitle: "Validation Failed",
                  message: `${t(`TotalIncomeValidateMessage`, {
                    formName: formName,
                    interestAmtLimit: interestAmtLimit,
                  })}`,
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                formState.setDataOnFieldChange("GRID_DATA", []);
                return {
                  TOT_INCOME: { value: "", ignoreUpdate: false },
                  CUSTOMER_ID: { value: "", ignoreUpdate: false },
                };
              }
            }
          },
        },
        GridProps: { xs: 12, sm: 6, md: 6, lg: 4, xl: 3 },
      },
      {
        render: {
          componentType: "numberFormat",
        },
        name: "OTH_BANK_FORM",
        label: "NoOfFormsSubmittedInOtherBanks",
        className: "textInputFromRight",
        autoComplete: "off",
        maxLength: 5,
        __VIEW__: { isReadOnly: true },
        __EDIT__: { isReadOnly: true },
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 5) {
              return false;
            }
            if (values?.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        GridProps: { xs: 12, sm: 6, md: 6, lg: 4, xl: 3 },
      },
      {
        render: {
          componentType: "amountField",
        },
        name: "OTH_BANK_AMT",
        label: "TotalIncomeOfFormsSubmittedInOtherBanks",
        autoComplete: "off",
        FormatProps: {
          allowNegative: false,
        },
        __VIEW__: { isReadOnly: true },
        __EDIT__: { isReadOnly: true },
        dependentFields: [
          "VALID_AMT",
          "INT_AMT_LIMIT",
          "FIN_INT_AMT",
          "TOT_INCOME",
          "FORM_NM",
        ],
        __NEW__: {
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              const sumOfAllDependentField = Number(
                (parseFloat(dependentFieldValues?.FIN_INT_AMT?.value) || 0) +
                  (parseFloat(dependentFieldValues?.VALID_AMT?.value) || 0) +
                  (parseFloat(dependentFieldValues?.TOT_INCOME?.value) || 0) +
                  (parseFloat(currentField?.value) || 0)
              );
              const formName = dependentFieldValues?.FORM_NM?.value || "";
              const interestAmtLimit =
                dependentFieldValues?.INT_AMT_LIMIT?.value || 0;

              if (sumOfAllDependentField > Number(interestAmtLimit)) {
                await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: `${t(`TotalIncomeValidateMessage`, {
                    formName: formName,
                    interestAmtLimit: interestAmtLimit,
                  })}`,
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                formState.setDataOnFieldChange("GRID_DATA", []);
                return {
                  OTH_BANK_AMT: { value: "", ignoreUpdate: false },
                  CUSTOMER_ID: { value: "", ignoreUpdate: false },
                };
              }
            }
          },
        },
        GridProps: { xs: 12, sm: 6, md: 5.5, lg: 4, xl: 3 },
      },

      {
        render: {
          componentType: "radio",
        },
        name: "ASSESSED",
        label: "WhetherAssessedToIncomeTaxAct",
        RadioGroupProps: { row: true },
        defaultValue: "N",
        options: [
          {
            label: "Yes",
            value: "Y",
          },
          { label: "No", value: "N" },
        ],
        validationRun: "all",
        __NEW__: {
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFields
          ) => {
            if (formState?.isSubmitting) return {};
            const getDate = await getFinDate({
              GD_DATE: authState?.workingDate,
            });
            if (currentField?.value === "Y") {
              return {
                LAST_ASS_YEAR: {
                  value: getDate?.[0]?.TO_DT
                    ? format(new Date(getDate?.[0]?.TO_DT), "dd/MMM/yyyy")
                    : "",
                },
              };
            } else {
              return {
                LAST_ASS_YEAR: {
                  value: "",
                },
              };
            }
          },
        },
        __EDIT__: { isReadOnly: true },
        __VIEW__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3, xl: 3 },
      },
      {
        render: { componentType: "datePicker" },
        name: "LAST_ASS_YEAR",
        label: "IfYesLatestAssessmentDate",
        placeholder: "DD/MM/YYYY",
        __EDIT__: { isReadOnly: true },
        __VIEW__: { isReadOnly: true },
        autoComplete: "off",
        dependentFields: ["ASSESSED"],
        runValidationOnDependentFieldsChange: true,
        isReadOnly: (_, dependentFields, __) => {
          if (dependentFields?.ASSESSED?.value === "N") {
            return true;
          }
          return false;
        },
        validate: (currentField, dependentFields, formState) => {
          if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
            return "Mustbeavaliddate";
          }
          if (currentField?.value && dependentFields?.ASSESSED?.value === "Y") {
            const date = new Date(currentField?.value);
            const day = date.getDate();
            const month = date.getMonth();

            if (day !== 31 || month !== 2) {
              return "LastAssessmentDateValidationMessage";
            }
          }
          return "";
        },
        validationRun: "all",
        GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "FLAG",
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "ACTIVE",
        label: "Active",
        __NEW__: {
          render: { componentType: "hidden" },
        },
        __VIEW__: { isReadOnly: true },
        validationRun: "all",
        __EDIT__: {
          isReadOnly: (_, dependentFields, formState) => {
            if (
              formState?.formData?.CONFIRMED === "N" ||
              formState?.formData?.UPLOAD === "Y" ||
              formState?.formData?.ACTIVE === false
            ) {
              return true;
            }
            return false;
          },
        },
        dependentFields: ["FLAG", "INACTIVE_DT"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (formState?.totalPaidCnt > 0 && currentField?.value === false) {
            const buttonName = await formState.MessageBox({
              messageTitle: "Validation Failed",
              message: "ActiveValidationMessage",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                ACTIVE: {
                  value: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (formState.totalPaidCnt <= 0) {
            return {
              FLAG: {
                value: String(formState.totalPaidCnt),
                ignoreUpdate: true,
              },
              INACTIVE_DT: {
                value: authState?.workingDate,
                ignoreUpdate: true,
              },
            };
          }
        },
        shouldExclude: (_, dependentFields, __) => {
          const flagValue = dependentFields["FLAG"]?.value;
          let convertedValue;
          if (
            flagValue !== "" &&
            flagValue !== null &&
            flagValue !== undefined
          ) {
            convertedValue = Number(flagValue);
            if (convertedValue > 0) {
              return false;
            } else {
              return true;
            }
          }
        },
        GridProps: { xs: 12, sm: 2, md: 2, lg: 1.5, xl: 1 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "INACTIVE_DT",
        label: "Inactive",
        __NEW__: {
          render: { componentType: "hidden" },
        },
        isReadOnly: true,
        dependentFields: ["ACTIVE", "FLAG"],
        shouldExclude: (_, dependentFields, __) => {
          const flagValue = dependentFields["FLAG"]?.value;
          let convertedValue;
          if (
            flagValue !== "" &&
            flagValue !== null &&
            flagValue !== undefined
          ) {
            convertedValue = Number(flagValue);
            if (convertedValue > 0) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "formbutton",
        },
        name: "PRINT",
        label: "PrintForm",
        endsIcon: "Print",
        type: "text",
        rotateIcon: "scale(2)",
        placeholder: "",
        iconStyle: {
          fontSize: "25px !important",
        },
        dependentFields: ["ALLOW_PRINT"],
        shouldExclude(fieldData, dependentFields, formState) {
          if (
            (formState?.screenFlag === "C" ||
              (formState?.screenFlag === "E" &&
                formState?.formMode === "edit")) &&
            dependentFields["ALLOW_PRINT"]?.value === "Y"
          ) {
            return false;
          } else {
            return true;
          }
        },
        GridProps: { xs: 3, sm: 3, md: 2, lg: 1.5, xl: 1.2 },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "TRAN_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "VALID_AMT",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ENTERED_FROM",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "CONFIRMED",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "UPLOAD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "INT_AMT_LIMIT",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ALLOW_PRINT",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "PRINT_MSG",
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Form 15G-HEntry",
      rowIdColumn: "SR_CD",
      defaultColumnConfig: {
        width: 350,
        minWidth: 300,
        maxWidth: 400,
      },
      allowColumnReordering: true,
      disableSorting: false,
      hideHeader: true,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "35vh", max: "40vh" },
      allowRowSelection: false,
      disableLoader: false,
      paginationText: "FDs",
    },
    columns: [
      {
        accessor: "SR_NO",
        columnName: "SrNo",
        sequence: 1,
        alignment: "left",
        componentType: "default",
        width: 60,
        minWidth: 50,
        maxWidth: 100,
        isAutoSequence: true,
      },
      {
        accessor: "BRANCH_CD",
        columnName: "Branch",
        sequence: 3,
        alignment: "left",
        componentType: "default",
        width: 80,
        minWidth: 50,
        maxWidth: 250,
      },
      {
        accessor: "ACCT_TYPE",
        columnName: "AccountType",
        sequence: 4,
        alignment: "left",
        componentType: "default",
        width: 100,
        minWidth: 50,
        maxWidth: 250,
      },
      {
        accessor: "ACCT_CD",
        columnName: "AccountNo",
        sequence: 5,
        alignment: "left",
        componentType: "default",
        width: 200,
        minWidth: 170,
        maxWidth: 250,
      },
      {
        accessor: "FD_NO",
        columnName: "FDNo",
        sequence: 6,
        alignment: "right",
        componentType: "default",
        width: 200,
        minWidth: 170,
        maxWidth: 250,
      },
      {
        accessor: "INT_AMOUNT",
        columnName: "FinInterest",
        sequence: 7,
        alignment: "right",
        componentType: "currency",
        currencyRefColumn: "CURRENCY_CD",
        width: 200,
        minWidth: 170,
        maxWidth: 250,
        isTotalWithCurrency: true,
        totalDecimalCount: 2,
      },
    ],
  },
};

export const RetrievalParameterFormMetaData = {
  form: {
    name: "retrievalParametersMetaData",
    label: "RetrievalParameters",
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
      datePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "FromDate",
      fullWidth: true,
      placeholder: "DD/MM/YYYY",
      required: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "ToDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToDateIsRequired"] }],
      },
      dependentFields: ["FROM_DT"],
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
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "A_CUSTOM_USER_NM",
      label: "CustomerId",
      fullWidth: true,
      placeholder: "EnterCustomerID",
      type: "text",
      required: true,
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["CustomerIDisrequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ],
};
