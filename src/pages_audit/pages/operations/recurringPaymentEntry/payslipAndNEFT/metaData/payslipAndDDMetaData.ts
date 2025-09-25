import { commonTextFieldStyle } from "pages_audit/pages/operations/fix-deposit/fixDepositForm/metaData/trnsAcctDtlMetaData";
import * as API from "../api";
import { t } from "i18next";

export const PayslipAndDDFormMetaData = {
  form: {
    name: "PayslipAndDD",
    label: "PayslipAndDemandDraft",
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
          xl: 12,
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
      autocomplete: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      amountField: {
        fullWidth: true,
      },
    },
  },

  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER1",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 7.2,
        lg: 8.2,
        xl: 8.8,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PAYMENT_AMOUNT",
      label: "PaymentAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      textFieldStyle: commonTextFieldStyle,
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 4.4, md: 2.4, lg: 1.9, xl: 1.6 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalAmount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      dependentFields: ["PAYSLIPDD"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const amount = (
          Array.isArray(dependentFieldsValues?.["PAYSLIPDD"])
            ? dependentFieldsValues?.["PAYSLIPDD"]
            : []
        ).reduce(
          (accum, obj) =>
            accum +
            Number(obj?.AMOUNT?.value ?? 0) +
            Number(obj?.COMMISSION?.value ?? 0) +
            Number(obj?.OTHER_COMISSION?.value ?? 0) +
            Number(obj?.SERVICE_CHARGE?.value ?? 0),
          0
        );
        const formattedAmount = amount?.toFixed(2);
        return formattedAmount ?? "0";
      },
      textFieldStyle: commonTextFieldStyle,
      __VIEW__: { render: { componentType: "hidden" } },
      GridProps: { xs: 6, sm: 4.4, md: 2.4, lg: 1.9, xl: 1.6 },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ACCT_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
    },

    {
      render: {
        componentType: "arrayField",
      },
      name: "PAYSLIPDD",
      isScreenStyle: true,
      displayCountName: "Record",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      removeRowFn: "deleteFormArrayFieldData",
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.PAYSLIPDD) ? data?.PAYSLIPDD : [];
        if (dataArray?.length > 0) {
          for (let i = 0; i < dataArray?.length; i++) {
            const item = dataArray[0];
            if (
              item?.DEF_TRAN_CD?.trim() &&
              item?.INFAVOUR_OF?.trim() &&
              String(item?.AMOUNT)?.trim() &&
              item?.PAYSLIP_NO?.trim()
            ) {
              return true;
            }
          }
          return {
            reason: t("recurringPayslipFormRequiredMsgForArrayfield"),
          };
        } else {
          return true;
        }
      },

      _fields: [
        {
          render: {
            componentType: "autocomplete",
          },
          name: "DEF_TRAN_CD",
          label: "billType",
          placeholder: "SelectBillType",
          required: true,
          fullWidth: true,
          isFieldFocused: true,
          options: (dependentValue, formState, _, authState) => {
            return API.getCommTypeList({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              CODE: "DD",
            });
          },
          _optionsKey: "getCommonTypeList",
          defaultValueKey: "billTypeDefaultVal",
          runPostValidationHookAlways: true,
          dependentFields: ["PAYMENT_AMOUNT"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleDisableButton(true);
            try {
              if (
                currentField?.value &&
                formState?.accountDetailsForPayslip?.ACCT_TYPE &&
                formState?.accountDetailsForPayslip?.ACCT_CD &&
                dependentFieldsValues?.PAYMENT_AMOUNT?.value &&
                currentField?.optionData?.[0]?.TYPE_CD
              ) {
                const reqParams = {
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  ACCT_CD: formState?.accountDetailsForPayslip?.ACCT_CD ?? "",
                  ACCT_TYPE:
                    formState?.accountDetailsForPayslip?.ACCT_TYPE ?? "",
                  DEF_TRAN_CD: currentField?.value ?? "",
                  AMOUNT: dependentFieldsValues?.PAYMENT_AMOUNT?.value ?? "",
                  // TYPE_CD: currentField?.optionData?.[0]?.TYPE_CD ?? "",
                  COMM_TYPE: currentField?.optionData?.[0]?.TYPE_CD ?? "",
                  ENT_COMP: authState?.companyID ?? "",
                  ENT_BRANCH: authState?.user?.branchCode ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                  SCREEN_REF:
                    formState?.accountDetailsForPayslip?.SCREEN_REF ?? "",
                };
                const gstApiData = await API.getCalculateGstDtl(reqParams);

                let amountValue =
                  Number(dependentFieldsValues?.PAYMENT_AMOUNT?.value ?? 0) -
                  (Number(gstApiData?.[0]?.SERVICE_CHARGE ?? 0) +
                    Number(gstApiData?.[0]?.COMMISSION ?? 0));

                return {
                  SERVICE_CHARGE: {
                    value: gstApiData?.[0]?.SERVICE_CHARGE ?? "",
                    ignoreUpdate: true,
                  },
                  COMMISSION: {
                    value: gstApiData?.[0]?.COMMISSION ?? "",
                    ignoreUpdate: true,
                  },
                  OTHER_COMISSION: {
                    value: gstApiData?.[0]?.OTHER_COMISSION ?? "",
                    ignoreUpdate: true,
                  },
                  TAX_RATE: {
                    value: gstApiData?.[0]?.TAX_RATE ?? "",
                    ignoreUpdate: true,
                  },
                  GST_ROUND: {
                    value: gstApiData?.[0]?.GST_ROUND ?? "",
                    ignoreUpdate: true,
                  },
                  AMOUNT: {
                    value: amountValue ?? "",
                    ignoreUpdate: true,
                  },
                  AMOUNT_HIDDEN: {
                    value: amountValue ?? "",
                    ignoreUpdate: true,
                  },
                  COMM_TYPE_CD: {
                    value: currentField?.optionData?.[0]?.TYPE_CD ?? "",
                    ignoreUpdate: true,
                  },
                  PAYSLIP_NO: {
                    value: currentField?.optionData?.[0]?.MST_TRAN_CD ?? "",
                    ignoreUpdate: false,
                  },
                };
              } else if (!currentField?.value) {
                return {
                  SERVICE_CHARGE: {
                    value: "",
                    ignoreUpdate: true,
                  },
                  COMMISSION: {
                    value: "",
                    ignoreUpdate: true,
                  },
                  REGION: {
                    value: "",
                  },
                  SIGNATURE1_CD: {
                    value: "",
                  },
                  SIGNATURE2_CD: {
                    value: "",
                  },
                  COMM_TYPE_CD: {
                    value: "",
                  },
                  AMOUNT_HIDDEN: {
                    value: "",
                  },
                  PAYSLIP_NO: {
                    value: "",
                    ignoreUpdate: false,
                  },
                };
              }
              return {};
            } catch (error: any) {
              const btn = await formState.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg ?? "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btn === "Ok") {
                return {
                  DEF_TRAN_CD: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                  SERVICE_CHARGE: {
                    value: "",
                    ignoreUpdate: true,
                  },
                  COMMISSION: {
                    value: "",
                    ignoreUpdate: true,
                  },
                  REGION: {
                    value: "",
                  },
                  SIGNATURE1_CD: {
                    value: "",
                  },
                  SIGNATURE2_CD: {
                    value: "",
                  },
                  COMM_TYPE_CD: {
                    value: "",
                  },
                  AMOUNT_HIDDEN: {
                    value: "",
                  },
                  PAYSLIP_NO: {
                    value: "",
                    ignoreUpdate: false,
                  },
                };
              }
            } finally {
              formState?.handleDisableButton(false);
            }
            return {};
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["billtypeRequired"] }],
          },
          GridProps: {
            xs: 12,
            sm: 3,
            md: 2,
            lg: 2,
            xl: 1.5,
          },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "TAX_RATE",
          ignoreInSubmit: true,
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "GST_ROUND",
          ignoreInSubmit: true,
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "INFAVOUR_OF_OPTION",
          label: "SelectInfavourOf",
          placeholder: "SelectInfavourOf",
          options: API.getPayslipInfavourOfList,
          _optionsKey: "getPayslipInfavourOfList",
          enableVirtualized: true,
          ignoreInSubmit: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              return {
                REGION: {
                  value: currentField?.optionData?.[0]?.REGION_NM ?? "",
                  ignoreUpdate: false,
                },
                INFAVOUR_OF: {
                  value: currentField?.optionData?.[0]?.label ?? "",
                  ignoreUpdate: false,
                },
              };
            }
            return {};
          },
          GridProps: { xs: 12, sm: 3, md: 2, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "INFAVOUR_OF",
          label: "SelectInfavourOf",
          preventSpecialChars: () => {
            return sessionStorage.getItem("specialChar") || "";
          },
          placeholder: "EnterInfavourOf",
          defaultValue: (formState) => {
            return (
              formState?.accountDetailsForPayslip?.DEFAULT_INFAVOUR_OF || ""
            );
          },
          maxLength: 300,
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["InfavourOfRequired"] }],
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "INSTRUCTION_REMARKS",
          label: "instRemarks",
          placeholder: "EnterInstructionRemarks",
          defaultValue: (formState) => {
            return (
              formState?.accountDetailsForPayslip?.INSTRUCTION_REMARKS || ""
            );
          },
          type: "text",
          maxLength: 300,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "numberFormat",
          },
          name: "PAYSLIP_NO",
          label: "payslipNumber",
          placeholder: "EnterPayslipNumber",
          className: "textInputFromRight",
          maxLength: 12,
          dependentFields: ["DEF_TRAN_CD"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleDisableButton(true);
            try {
              if (
                currentField?.value &&
                dependentFieldsValues?.["PAYSLIPDD.DEF_TRAN_CD"]
                  ?.optionData?.[0]?.BRANCH_CD &&
                dependentFieldsValues?.["PAYSLIPDD.DEF_TRAN_CD"]
                  ?.optionData?.[0]?.TYPE_CD
              ) {
                let reqParameters = {
                  COMM_TYPE:
                    dependentFieldsValues?.["PAYSLIPDD.DEF_TRAN_CD"]
                      ?.optionData?.[0]?.TYPE_CD ?? "",
                  PAYSLIP_NO: currentField?.value ?? "",
                  SCREEN_REF:
                    formState?.accountDetailsForPayslip?.SCREEN_REF ?? "",
                  ENT_COMP_CD: authState?.companyID ?? "",
                  ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                };
                let postData = await API.validatePayslipNo(reqParameters);
                let returnVal;
                for (const obj of postData) {
                  const continueProcess = await formState?.showMessageBox(obj);
                  if (!continueProcess) {
                    break;
                  }
                  if (obj?.O_STATUS === "0") {
                    returnVal = postData;
                  }
                }
                return {
                  PAYSLIP_NO: returnVal
                    ? {
                        value: currentField?.value ?? "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                };
              }
              return {};
            } catch (error: any) {
              const btn = await formState.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg ?? "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btn === "Ok") {
                return {
                  PAYSLIP_NO: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                };
              }
            } finally {
              formState?.handleDisableButton(false);
            }
            return {};
          },
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["payslipNoRequired"] }],
          },
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              return !Boolean(
                values?.value?.startsWith("0") || values?.value?.length > 12
              );
            },
          },
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "Amount",
          placeholder: "EnterAmount",
          autoComplete: "off",
          required: true,
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              return !Boolean(
                values?.value?.startsWith("0") || values?.value?.length > 15
              );
            },
          },
          dependentFields: ["DEF_TRAN_CD", "AMOUNT_HIDDEN"],
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleDisableButton(true);
            try {
              if (
                parseFloat(currentField?.value).toFixed(2) ===
                parseFloat(
                  dependentFieldsValues?.["PAYSLIPDD.AMOUNT_HIDDEN"]?.value
                ).toFixed(2)
              ) {
                return {};
              }

              if (
                currentField?.value &&
                formState?.accountDetailsForPayslip?.ACCT_TYPE &&
                formState?.accountDetailsForPayslip?.ACCT_CD
              ) {
                const reqParams = {
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  ACCT_CD: formState?.accountDetailsForPayslip?.ACCT_CD ?? "",
                  ACCT_TYPE:
                    formState?.accountDetailsForPayslip?.ACCT_TYPE ?? "",
                  DEF_TRAN_CD:
                    dependentFieldsValues?.["PAYSLIPDD.DEF_TRAN_CD"]?.value ??
                    "",
                  AMOUNT: currentField?.value ?? "",
                  // TYPE_CD:
                  //   dependentFieldsValues?.["PAYSLIPDD.DEF_TRAN_CD"]
                  //     ?.optionData?.[0]?.TYPE_CD ?? "",
                  COMM_TYPE:
                    dependentFieldsValues?.["PAYSLIPDD.DEF_TRAN_CD"]
                      ?.optionData?.[0]?.TYPE_CD ?? "",
                  ENT_COMP: authState?.companyID ?? "",
                  ENT_BRANCH: authState?.user?.branchCode ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                  SCREEN_REF:
                    formState?.accountDetailsForPayslip?.SCREEN_REF ?? "",
                };
                const gstApiData = await API.getCalculateGstDtl(reqParams);
                return {
                  SERVICE_CHARGE: {
                    value: gstApiData?.[0]?.SERVICE_CHARGE ?? "",
                    ignoreUpdate: true,
                  },
                  COMMISSION: {
                    value: gstApiData?.[0]?.COMMISSION ?? "",
                    ignoreUpdate: true,
                  },
                  OTHER_COMISSION: {
                    value: gstApiData?.[0]?.OTHER_COMISSION ?? "",
                    ignoreUpdate: true,
                  },
                  TAX_RATE: {
                    value: gstApiData?.[0]?.TAX_RATE ?? "",
                    ignoreUpdate: true,
                  },
                  GST_ROUND: {
                    value: gstApiData?.[0]?.GST_ROUND ?? "",
                    ignoreUpdate: true,
                  },
                  AMOUNT_HIDDEN: {
                    value: currentField?.value ?? "",
                    ignoreUpdate: true,
                  },
                };
              } else if (!currentField?.value) {
                return {
                  COMMISSION: {
                    value: "",
                    ignoreUpdate: true,
                  },
                  REGION: {
                    value: "",
                  },
                  AMOUNT_HIDDEN: {
                    value: "",
                  },
                };
              }
              return {};
            } catch (error: any) {
              const btn = await formState.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg ?? "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btn === "Ok") {
                return {
                  AMOUNT: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                  COMMISSION: {
                    value: "",
                    ignoreUpdate: true,
                  },
                  REGION: {
                    value: "",
                  },
                  AMOUNT_HIDDEN: {
                    value: "",
                  },
                };
              }
            } finally {
              formState?.handleDisableButton(false);
            }
            return {};
          },

          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["amountRequired"] }],
          },
          validate: (currentField, dependentField) => {
            if (Number(currentField?.value) <= 0) {
              return "AmountShouldGreaterThanZero";
            }
            return "";
          },
          GridProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2.4,
            xl: 2.4,
          },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "AMOUNT_HIDDEN",
          ignoreInSubmit: true,
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "REGION",
          label: "region",
          placeholder: "SelectRegion",
          dependentFields: ["DEF_TRAN_CD"],
          disableCaching: true,
          options: (...arg) => {
            if (
              arg?.[3]?.user?.branchCode &&
              arg?.[3]?.companyID &&
              arg?.[2]?.["PAYSLIPDD.DEF_TRAN_CD"]?.optionData?.[0]?.TYPE_CD
            ) {
              return API.getPayslipRegionList({
                BRANCH_CD: arg?.[3]?.user?.branchCode ?? "",
                COMP_CD: arg?.[3]?.companyID ?? "",
                FLAG: "R",
                COMM_TYPE_CD:
                  arg?.[2]?.["PAYSLIPDD.DEF_TRAN_CD"]?.optionData?.[0]
                    ?.TYPE_CD ?? "",
              });
            } else {
              return [];
            }
          },

          _optionsKey: "getPayslipRegionList",
          GridProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2.4,
            xl: 2.4,
          },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "COMMISSION",
          label: "Commision",
          placeholder: "EnterCommision",
          autoComplete: "off",
          maxLength: 13,
          dependentFields: ["TAX_RATE", "GST_ROUND"],
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (currentField?.value) {
              let gstValue =
                dependentFieldsValues?.["PAYSLIPDD.GST_ROUND"]?.value === "3"
                  ? Math.floor(
                      (Number(currentField?.value) *
                        Number(
                          dependentFieldsValues?.["PAYSLIPDD.TAX_RATE"]?.value
                        )) /
                        100
                    ) ?? ""
                  : dependentFieldsValues?.["PAYSLIPDD.GST_ROUND"]?.value ===
                    "2"
                  ? Math.ceil(
                      (Number(currentField?.value) *
                        Number(
                          dependentFieldsValues?.["PAYSLIPDD.TAX_RATE"]?.value
                        )) /
                        100
                    ) ?? ""
                  : dependentFieldsValues?.["PAYSLIPDD.GST_ROUND"]?.value ===
                    "1"
                  ? Math.round(
                      (Number(currentField?.value) *
                        Number(
                          dependentFieldsValues?.["PAYSLIPDD.TAX_RATE"]?.value
                        )) /
                        100
                    ) ?? ""
                  : (Number(currentField?.value ?? 0) *
                      Number(
                        dependentFieldsValues?.["PAYSLIPDD.TAX_RATE"]?.value ??
                          0
                      )) /
                    100;
              return {
                SERVICE_CHARGE: {
                  value: gstValue ?? "",
                  ignoreUpdate: true,
                },
              };
            } else if (!currentField?.value) {
              return {
                SERVICE_CHARGE: {
                  value: "",
                },
              };
            }
            return {};
          },

          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              return !Boolean(
                values?.value?.startsWith("0") || values?.value?.length > 13
              );
            },
          },

          GridProps: {
            xs: 12,
            sm: 6,
            md: 3,
            lg: 2.4,
            xl: 2.4,
          },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "OTHER_COMISSION",
          label: "OtherCommision",
          placeholder: "EnterOtherCommision",
          autoComplete: "off",
          maxLength: 13,
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              return !Boolean(
                values?.value?.startsWith("0") || values?.value?.length > 13
              );
            },
          },
          GridProps: {
            xs: 12,
            sm: 6,
            md: 3,
            lg: 2.4,
            xl: 2.4,
          },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "SERVICE_CHARGE",
          label: "GST",
          isReadOnly: true,
          GridProps: {
            xs: 12,
            sm: 6,
            md: 3,
            lg: 2.4,
            xl: 2.4,
          },
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "COL_BANK_CD",
          label: "BankCode",
          placeholder: "SelectBankCode",
          options: API.getPayslipBankCodeList,
          _optionsKey: "getPayslipBankCodeList",
          GridProps: {
            xs: 12,
            sm: 6,
            md: 3,
            lg: 2.4,
            xl: 2.4,
          },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "BankName",
          type: "text",
          dependentFields: ["COL_BANK_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            return dependentFields?.["PAYSLIPDD.COL_BANK_CD"]?.optionData?.[0]
              ?.BANK_NM
              ? dependentFields?.["PAYSLIPDD.COL_BANK_CD"]?.optionData?.[0]
                  ?.BANK_NM
              : "";
          },
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3.6, xl: 3.6 },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "BRANCH_NM",
          dependentFields: ["COL_BANK_CD"],
          setValueOnDependentFieldsChange: (dependentFields) => {
            return dependentFields?.["PAYSLIPDD.COL_BANK_CD"]?.optionData?.[0]
              ?.BRANCH_NM
              ? dependentFields?.["PAYSLIPDD.COL_BANK_CD"]?.optionData?.[0]
                  ?.BRANCH_NM
              : "";
          },
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "SIGNATURE1_CD",
          label: "signature1",
          placeholder: "SelectSignature1",
          disableCaching: true,
          dependentFields: ["DEF_TRAN_CD"],
          options: (...arg) => {
            if (
              arg?.[3]?.user?.branchCode &&
              arg?.[3]?.companyID &&
              arg?.[2]?.["PAYSLIPDD.DEF_TRAN_CD"]?.optionData?.[0]?.TYPE_CD
            ) {
              return API.getPayslipSignatureList({
                BRANCH_CD: arg?.[3]?.user?.branchCode ?? "",
                COMP_CD: arg?.[3]?.companyID ?? "",
                COMM_TYPE_CD:
                  arg?.[2]?.["PAYSLIPDD.DEF_TRAN_CD"]?.optionData?.[0]
                    ?.TYPE_CD ?? "",
              });
            } else {
              return [];
            }
          },
          _optionsKey: "getPayslipSignatureList",
          GridProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
            xl: 3,
          },
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "SIGNATURE2_CD",
          label: "signature2",
          placeholder: "SelectSignature2",
          disableCaching: true,
          dependentFields: ["DEF_TRAN_CD"],
          options: (...arg) => {
            if (
              arg?.[3]?.user?.branchCode &&
              arg?.[3]?.companyID &&
              arg?.[2]?.["PAYSLIPDD.DEF_TRAN_CD"]?.optionData?.[0]?.TYPE_CD
            ) {
              return API.getPayslipSignatureList({
                BRANCH_CD: arg?.[3]?.user?.branchCode ?? "",
                COMP_CD: arg?.[3]?.companyID ?? "",
                COMM_TYPE_CD:
                  arg?.[2]?.["PAYSLIPDD.DEF_TRAN_CD"]?.optionData?.[0]
                    ?.TYPE_CD ?? "",
              });
            } else {
              return [];
            }
          },
          _optionsKey: "getPayslipSignatureList",
          GridProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
            xl: 3,
          },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "COMM_TYPE_CD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "FROM_CERTI_NO",
        },
        {
          render: {
            componentType: "hidden",
          },

          name: "FROM_ACCT_CD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "FROM_COMP_CD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "FROM_BRANCH_CD",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "FROM_ACCT_TYPE",
        },
      ],
    },
  ],
};
