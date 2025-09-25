import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../../api";
import { t } from "i18next";
export const propertyAcctDetails = {
  form: {
    name: "propertyAcctDetails",
    label: "Property Holder Details",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      autocomplete: {
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
        componentType: "hidden",
      },
      name: "PARA_162",
    },

    {
      render: {
        componentType: "arrayField",
      },
      displayCountName: "Equitable Mortgage Details",
      name: "PROPERTY_DETAILS",
      removeRowFn: (fs, name, data, index) => {
        const rowData = data[name][index];

        if (rowData?.RAW_EXIST === "Y") {
          return {
            allow: false,
            reason: "Not Allowed To Delete.",
          };
        }
      },
      changeRowOrder: false,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: { componentType: "_accountNumber" },

          branchCodeMetadata: {
            name: "ACCT_BRANCH_CD",
            isReadOnly: true,
            GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          },
          accountTypeMetadata: {
            validationRun: "onChange",
            name: "ACCT_TYPE",
            GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
          },
          accountCodeMetadata: {
            name: "ACCT_CD",
            autoComplete: "off",
            maxLength: 20,
            dependentFields: [
              "PROPERTY_DETAILS",
              "ACCT_TYPE",
              "ACCT_BRANCH_CD",
              "TRAN_CD",
              "TOT_SANCTION_AMT",
              "SR_CD",
              "PARA_162",
            ],
            runPostValidationHookAlways: true,

            fullWidth: true,
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};
              const parsedIndex = Number(
                dependentFieldValues["PROPERTY_DETAILS.SR_CD"]?.value
              );
              const allRows = formState?.propertyRows?.[parsedIndex];
              const totalSanctionAmount = Array.isArray(allRows)
                ? allRows.reduce(
                    (sum, item) => sum + Number(item.SANCTION_AMT || 0),
                    0
                  )
                : 0;

              if (
                currentField.value &&
                dependentFieldValues["PROPERTY_DETAILS.ACCT_TYPE"]?.value
                  ?.length === 0
              ) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: t("ValidationFailed"),
                  message: t("enterAccountType"),
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (buttonName === "Ok") {
                  return {
                    ACCT_CD: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                    ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                  };
                }
              } else if (
                currentField?.value &&
                dependentFieldValues?.["PROPERTY_DETAILS.ACCT_BRANCH_CD"]
                  ?.value &&
                dependentFieldValues?.["PROPERTY_DETAILS.ACCT_TYPE"]?.value
              ) {
                const reqParameters = {
                  COMP_CD: authState?.companyID,
                  BRANCH_CD:
                    dependentFieldValues["PROPERTY_DETAILS.ACCT_BRANCH_CD"]
                      ?.value ?? "",
                  ACCT_TYPE:
                    dependentFieldValues["PROPERTY_DETAILS.ACCT_TYPE"]?.value ??
                    "",
                  ACCT_CD: utilFunction.getPadAccountNumber(
                    currentField?.value,
                    dependentFieldValues?.["PROPERTY_DETAILS.ACCT_TYPE"]
                      ?.optionData?.[0] ?? {}
                  ),
                  TRAN_CD: formState?.TRAN_CD,
                  PARA_162: dependentFieldValues?.PARA_162?.value,
                  TOT_SANCTION_AMT: `${totalSanctionAmount}`,
                  FARE_VALUE: formState?.fareValue,
                  SUBCNT: `${Array.isArray(allRows) ? allRows.length : "1"}`,
                  SCREEN_REF: formState?.docCD,
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                };
                let postData = await API.getAcctDetail(reqParameters);

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
                      ACCT_CD: {
                        value: "",
                        ignoreUpdate: false,
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
                      ACCT_CD:
                        postData[0] !== ""
                          ? {
                              value: utilFunction.getPadAccountNumber(
                                currentField?.value,
                                dependentFieldValues?.ACCT_TYPE
                                  ?.optionData?.[0] ?? {}
                              ),
                              ignoreUpdate: true,
                              isFieldFocused: false,
                            }
                          : {
                              value: "",
                              isFieldFocused: true,
                              ignoreUpdate: false,
                            },
                      HOLDER_NM: {
                        value: postData[0]?.HOLDER_NM,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                      OUTSTANDING_BAL: {
                        value: postData[0]?.OUTSTANDING_BAL,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                      SECURITY_PER: {
                        value: postData[0]?.SECURITY_PER,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                      SANCTION_AMT: {
                        value: postData[0]?.SANCTION_AMT,
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      },
                    };
                  }
                }

                if (!currentField?.value) {
                  return {
                    HOLDER_NM: {
                      value: "",
                      ignoreUpdate: true,
                    },
                    SANCTION_AMT: {
                      value: "",
                      ignoreUpdate: true,
                    },
                    SECURITY_PER: {
                      value: "",
                      ignoreUpdate: true,
                    },
                    OUTSTANDING_BAL: {
                      value: "",
                      ignoreUpdate: true,
                    },
                  };
                }
              }
            },
            GridProps: { xs: 12, sm: 6, md: 4, lg: 1, xl: 1 },
          },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "SR_CD",
          defaultValue: (formState) => {
            return formState?.srCd;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "LINE_ID",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "RAW_EXIST",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "UNIQUE_KEY",
          dependentFields: [
            "ACCT_BRANCH_CD",
            "TOT_SANCTION_AMT",
            "SANCTION_AMT",
            "SR_CD",
            "LINE_ID",
            "RAW_EXIST",
          ],
          setValueOnDependentFieldsChange: (
            dependentFields,
            formState,
            field
          ) => {
            const fieldKey =
              dependentFields?.["PROPERTY_DETAILS.SANCTION_AMT"]?.fieldKey;
            const match = fieldKey ? fieldKey.match(/\[(\d+)\]/) : "";
            const newNumber = parseInt(match[1]) + 1;
            if (
              dependentFields?.["PROPERTY_DETAILS.RAW_EXIST"]?.value !== "Y"
            ) {
              return `${dependentFields?.["PROPERTY_DETAILS.SR_CD"]?.value}${newNumber}`;
            } else
              return `${dependentFields?.["PROPERTY_DETAILS.SR_CD"]?.value}${dependentFields?.["PROPERTY_DETAILS.LINE_ID"]?.value}`;
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "ROW_ID",
          defaultValue: (formState) => {
            return formState?.srCd;
          },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "HOLDER_NM",
          label: "accountName",
          isReadOnly: true,
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "OUTSTANDING_BAL",
          label: "O/S Amount",
          required: true,
          fullWidth: true,
          isReadOnly: true,
          ignoreInSubmit: true,
          dependentFields: ["ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["PROPERTY_DETAILS.ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          placeholder: "",
          type: "text",
          maxLength: 17,
          FormatProps: {
            allowNegative: false,
            decimalScale: 2,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SANCTION_AMT",
          label: "Sanction Amount",
          required: true,
          isReadOnly: true,
          fullWidth: true,
          ignoreInSubmit: true,
          dependentFields: ["ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["PROPERTY_DETAILS.ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          placeholder: "",
          type: "text",
          maxLength: 17,
          FormatProps: {
            allowNegative: false,
            decimalScale: 2,
          },

          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "FARE_VALUE",
          isReadOnly: true,
          label: "fareValue",
          ignoreInSubmit: true,
          required: true,
          fullWidth: true,
          dependentFields: ["ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["PROPERTY_DETAILS.ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          placeholder: "",
          type: "text",
          maxLength: 17,
          FormatProps: {
            allowNegative: false,
            decimalScale: 2,
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SECURITY_PER",
          label: "Security",
          required: true,
          fullWidth: true,
          dependentFields: ["ACCT_TYPE"],
          StartAdornment: (dependentFields) => {
            return (
              dependentFields?.["PROPERTY_DETAILS.ACCT_TYPE"]?.optionData?.[0]
                ?.CURRENCY_CD ?? ""
            );
          },
          placeholder: "",
          type: "text",
          maxLength: 17,
          FormatProps: {
            allowNegative: false,
            decimalScale: 2,
          },
          setValueOnDependentFieldsChange: (
            dependentFields,
            formState,
            field
          ) => {
            return formState?.security_Per;
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.3, xl: 1.3 },
        },
        {
          render: {
            componentType: "checkbox",
          },
          name: "REALESE_FLAG",
          defaultValue: "N",
          label: "Release",
          validationRun: "onChange",
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (currentField?.value === true) {
              return {
                REALESE_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
              };
            } else {
              return {
                REALESE_DT: {
                  value: "",
                  ignoreUpdate: true,
                },
              };
            }
          },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "REALESE_DT",
          label: "Release Date",
          fullWidth: true,
          format: "dd/MM/yyyy",
          GridProps: { xs: 12, sm: 6, md: 6, lg: 1.5, xl: 1.5 },
        },
      ],
    },
  ],
};
export const TotalOfFieldsMetaData = {
  form: {
    name: "propertyAcctDetails",
    label: "Equitable Mortgage Header",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    hideHeader: true,
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      autocomplete: {
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
        componentType: "amountField",
      },
      name: "TOT_SANCTION_AMT",
      label: "Total Sanction Amount",
      isReadOnly: true,
      dependentFields: ["PROPERTY_DETAILS"],
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      GridProps: { xs: 6, sm: 6, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalAmount = 0;

        if (dependentFields && dependentFields.PROPERTY_DETAILS) {
          dependentFields.PROPERTY_DETAILS.forEach((item) => {
            if (item && item.SANCTION_AMT && item.SANCTION_AMT.value) {
              totalAmount += parseFloat(item.SANCTION_AMT.value);
            }
          });
        }

        return totalAmount;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOT_OUTSTANDING_BAL",
      label: "Total O/S Amount",
      isReadOnly: true,
      dependentFields: ["PROPERTY_DETAILS"],
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      GridProps: { xs: 6, sm: 6, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalAmount = 0;

        if (dependentFields && dependentFields.PROPERTY_DETAILS) {
          dependentFields.PROPERTY_DETAILS.forEach((item) => {
            if (item && item.OUTSTANDING_BAL && item.OUTSTANDING_BAL.value) {
              totalAmount += parseFloat(item.OUTSTANDING_BAL.value);
            }
          });
        }

        return totalAmount;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOT_SECURITY_PER",
      label: "Total Security %",
      isReadOnly: true,
      dependentFields: ["PROPERTY_DETAILS"],
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },
      GridProps: { xs: 6, sm: 6, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        let totalAmount = 0;

        if (dependentFields && dependentFields.PROPERTY_DETAILS) {
          dependentFields.PROPERTY_DETAILS.forEach((item) => {
            if (item && item.SECURITY_PER && item.SECURITY_PER.value) {
              totalAmount += parseFloat(item.SECURITY_PER.value);
            }
          });
        }

        return totalAmount;
      },
    },
  ],
};
