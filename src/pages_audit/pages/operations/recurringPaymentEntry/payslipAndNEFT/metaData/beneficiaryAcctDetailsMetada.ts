import { t } from "i18next";
import * as API from "../api";
import { commonTextFieldStyle } from "pages_audit/pages/operations/fix-deposit/fixDepositForm/metaData/trnsAcctDtlMetaData";

export const BeneficiaryAcctDetailsFormMetaData = {
  form: {
    name: "BeneficiaryAcctDetails",
    label: "BeneficiaryACDetails",
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
      checkbox: {
        fullWidth: true,
      },
    },
  },

  fields: [
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER",
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
      textFieldStyle: commonTextFieldStyle,
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
      dependentFields: ["BENEFIACCTDTL"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const amount = (
          Array.isArray(dependentFieldsValues?.["BENEFIACCTDTL"])
            ? dependentFieldsValues?.["BENEFIACCTDTL"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.AMOUNT?.value ?? 0), 0);
        const formattedAmount = amount?.toFixed(2);
        return formattedAmount ?? "0";
      },

      textFieldStyle: commonTextFieldStyle,
      GridProps: { xs: 6, sm: 4.4, md: 2.4, lg: 1.9, xl: 1.6 },
    },

    {
      render: {
        componentType: "arrayField",
      },
      name: "BENEFIACCTDTL",
      isScreenStyle: true,
      displayCountName: "Record",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      addRowFn: (data) => {
        const dataArray = Array.isArray(data?.BENEFIACCTDTL)
          ? data?.BENEFIACCTDTL
          : [];
        if (dataArray?.length > 0) {
          for (let i = 0; i < dataArray?.length; i++) {
            const item = dataArray[0];
            if (item?.TO_ACCT_NO?.trim() && String(item?.AMOUNT)?.trim()) {
              return true;
            }
          }
          return {
            reason: t("recurringNEFTFormRequiredMsgForArrayfield"),
          };
        } else {
          return true;
        }
      },
      _fields: [
        {
          render: {
            componentType: "spacer",
          },
          name: "DD_REQUEST_SPACER",
          shouldExclude: (_, dependentFieldsValues, formState) => {
            return Boolean(
              formState?.NEFTFlagsData?.[0]?.DD_REQ_VISIBLE === "Y"
            );
          },
          GridProps: { xs: 12, sm: 6, md: 2.2, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "spacer",
          },
          name: "BENEFICIARY_SPACER",
          shouldExclude: (_, dependentFieldsValues, formState) => {
            return Boolean(
              formState?.NEFTFlagsData?.[0]?.VISIBLE_BNFCRY_YN === "Y"
            );
          },
          GridProps: { xs: 12, sm: 6, md: 1.8, lg: 1.5, xl: 1.5 },
        },
        {
          render: { componentType: "checkbox" },
          name: "DD_REQUEST",
          label: "DDRequest",
          defaultValue: false,
          shouldExclude: (_, dependentFieldsValues, formState) => {
            return Boolean(
              formState?.NEFTFlagsData?.[0]?.DD_REQ_VISIBLE === "N"
            );
          },
          GridProps: { xs: 12, sm: 6, md: 2.2, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "autocomplete",
          },
          name: "TO_ACCT_NO",
          label: "AccountNum",
          placeholder: "SelectAccountNumber",
          options: async (dependentValue, formState, _, authState) => {
            return API.getRtgsBenfDtlList({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: formState?.accountDetailsForBen?.BRANCH_CD ?? "",
              ACCT_TYPE: formState?.accountDetailsForBen?.ACCT_TYPE ?? "",
              ACCT_CD: formState?.accountDetailsForBen?.ACCT_CD ?? "",
              FLAG: "Y",
              WORKING_DATE: authState?.workingDate ?? "",
            });
          },
          _optionsKey: "getRtgsBenfDtlList",
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            auth,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            formState?.handleDisableButton?.(true);
            try {
              if (
                currentField?.value &&
                currentField?.optionData &&
                currentField?.optionData?.length > 0
              ) {
                let validateIFSC = await API.getIfscBenDetail({
                  IFSC_CODE: currentField?.optionData?.[0]?.TO_IFSCCODE ?? "",
                  ENTRY_TYPE: formState?.accountDetailsForBen?.ENTRY_TYPE ?? "",
                  USERNAME: auth?.user?.id ?? "",
                  USERROLE: auth?.role ?? "",
                });

                if (validateIFSC?.[0]?.O_STATUS === "999") {
                  let buttonName = await formState?.MessageBox({
                    messageTitle: "ValidationFailed",
                    message:
                      validateIFSC?.[0]?.O_MESSAGE ?? "Somethingwenttowrong",
                    buttonNames: ["Ok"],
                    icon: "ERROR",
                  });
                  if (buttonName === "Ok") {
                    return {
                      TO_ACCT_NO: {
                        value: "",
                        isFieldFocused: true,
                      },
                      TO_ACCT_NM: { value: "" },
                      TO_ACCT_TYPE: {
                        value: "",
                      },
                      CONTACT_NO: {
                        value: "",
                      },
                      TO_EMAIL_ID: { value: "" },
                      TO_ADD1: { value: "" },
                      TO_IFSCCODE: { value: "" },
                      BANK_NM: { value: "" },
                      BRANCH_NM: { value: "" },
                      CONTACT_DTL: { value: "" },
                      CENTRE_NM: { value: "" },
                      ADDR: { value: "" },
                      DISTRICT_NM: { value: "" },
                      STATE_NM: { value: "" },
                    };
                  }
                } else if (validateIFSC?.[0]?.O_STATUS === "0") {
                  let postData = await API.getIfscBankDetail({
                    AS_VALUE: currentField?.optionData?.[0]?.TO_IFSCCODE ?? "",
                    FLAG: "I",
                  });

                  return {
                    TO_ACCT_NM: {
                      value: currentField?.optionData[0]?.TO_ACCT_NM ?? "",
                    },
                    TO_ACCT_TYPE: {
                      value: currentField?.optionData[0]?.TO_ACCT_TYPE ?? "",
                    },
                    CONTACT_NO: {
                      value: currentField?.optionData[0]?.TO_CONTACT_NO ?? "",
                    },
                    TO_EMAIL_ID: {
                      value: currentField?.optionData[0]?.TO_EMAIL_ID ?? "",
                    },
                    TO_ADD1: {
                      value: currentField?.optionData[0]?.TO_ADD1 ?? "",
                    },
                    TO_IFSCCODE: { value: postData?.[0]?.IFSC_CODE ?? "" },
                    BANK_NM: { value: postData?.[0]?.BANK_NM ?? "" },
                    BRANCH_NM: { value: postData?.[0]?.BRANCH_NM ?? "" },
                    CONTACT_DTL: { value: postData?.[0]?.CONTACT_DTL ?? "" },
                    CENTRE_NM: { value: postData?.[0]?.CENTRE_NM ?? "" },
                    ADDR: { value: postData?.[0]?.ADD1 ?? "" },
                    DISTRICT_NM: { value: postData?.[0]?.DISTRICT_NM ?? "" },
                    STATE_NM: { value: postData?.[0]?.STATE_NM ?? "" },
                  };
                }
              } else if (!currentField?.value) {
                return {
                  TO_ACCT_NM: { value: "" },
                  TO_ACCT_TYPE: { value: "" },
                  CONTACT_NO: { value: "" },
                  TO_EMAIL_ID: { value: "" },
                  TO_ADD1: { value: "" },
                  TO_IFSCCODE: { value: "" },
                  BANK_NM: { value: "" },
                  BRANCH_NM: { value: "" },
                  CONTACT_DTL: { value: "" },
                  CENTRE_NM: { value: "" },
                  ADDR: { value: "" },
                  DISTRICT_NM: { value: "" },
                  STATE_NM: { value: "" },
                };
              }
            } catch (error: any) {
              const btn = await formState.MessageBox({
                messageTitle: "Error",
                message: error?.error_msg ?? "Unknownerroroccured",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });
              if (btn === "Ok") {
                return {
                  TO_ACCT_NO: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                  TO_ACCT_NM: { value: "" },
                  TO_ACCT_TYPE: { value: "" },
                  CONTACT_NO: { value: "" },
                  TO_EMAIL_ID: { value: "" },
                  TO_ADD1: { value: "" },
                  TO_IFSCCODE: { value: "" },
                  BANK_NM: { value: "" },
                  BRANCH_NM: { value: "" },
                  CONTACT_DTL: { value: "" },
                  CENTRE_NM: { value: "" },
                  ADDR: { value: "" },
                  DISTRICT_NM: { value: "" },
                  STATE_NM: { value: "" },
                };
              }
            } finally {
              formState?.handleDisableButton?.(false);
            }
          },
          runPostValidationHookAlways: true,
          disableCaching: true,
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["AccountNumberRequired"] }],
          },
          GridProps: {
            xs: 12,
            sm: 6,
            md: 3.4,
            lg: 3,
            xl: 3,
          },
        },

        {
          render: {
            componentType: "formbutton",
          },
          name: "BENEFICIARY",
          label: "Add",
          placeholder: "",
          iconStyle: {
            fontSize: "25px !important",
          },
          shouldExclude: (_, dependentFieldsValues, formState) => {
            return !Boolean(
              formState?.NEFTFlagsData?.[0]?.VISIBLE_BNFCRY_YN === "Y"
            );
          },
          GridProps: { xs: 12, sm: 6, md: 1.8, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_NM",
          label: "Name",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4.6, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_ACCT_TYPE",
          label: "accountType",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "CONTACT_NO",
          label: "MobileNo",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 1.9, xl: 1.9 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "TO_EMAIL_ID",
          label: "EmailID",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 6, lg: 2.5, xl: 2.5 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "Amount",
          placeholder: "EnterAmount",
          autoComplete: "off",
          FormatProps: {
            allowNegative: false,
            isAllowed: (values) => {
              return !Boolean(
                values?.value?.startsWith("0") || values?.value?.length > 12
              );
            },
          },
          required: true,
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
            md: 3,
            lg: 1.5,
            xl: 1.5,
          },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_ADD1",
          label: "Address",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 5, lg: 3.1, xl: 3.1 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "Remarks",
          placeholder: "EnterRemarks",
          defaultValue: (formState) => {
            return formState?.accountDetailsForBen?.DEFAULT_REMARKS || "";
          },
          autoComplete: "off",
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "divider",
          },
          label: "IFSCBankDetail",
          name: "IFSCBankDetail",
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "TO_IFSCCODE",
          label: "IFSC",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 1.5, xl: 1.5 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "BANK_NM",
          label: "Bank",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 5, xl: 5 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH_NM",
          label: "Branch",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 3.7, xl: 3.7 },
        },

        {
          render: {
            componentType: "numberFormat",
          },
          name: "CONTACT_DTL",
          label: "Contact",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 1.8, xl: 1.8 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "CENTRE_NM",
          label: "Center",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 3, lg: 2.2, xl: 2.2 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "ADDR",
          label: "Address",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 9, lg: 5.4, xl: 5.4 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "DISTRICT_NM",
          label: "District",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 6, lg: 2.2, xl: 2.2 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "STATE_NM",
          label: "State",
          isReadOnly: true,
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 6, lg: 2.2, xl: 2.2 },
        },

        {
          render: {
            componentType: "divider",
          },
          label: "FavouringDetail",
          name: "FavouringDetail",
          dependentFields: ["DD_REQUEST"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            return !Boolean(
              dependentFieldsValues?.["BENEFIACCTDTL.DD_REQUEST"]?.value
            );
          },
          GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
        },

        {
          render: {
            componentType: "numberFormat",
          },
          name: "PAYEE_ACCT_CD",
          label: "PayeeACNo",
          placeholder: "EnterPayeeACNo",
          maxLength: 20,
          fullWidth: true,
          autoComplete: false,
          dependentFields: ["DD_REQUEST"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            return !Boolean(
              dependentFieldsValues?.["BENEFIACCTDTL.DD_REQUEST"]?.value
            );
          },
          FormatProps: {
            allowNegative: false,
            allowLeadingZeros: true,
            isAllowed: (values) => {
              if (values?.value?.length > 20) {
                return false;
              }
              if (values.floatValue === 0) {
                return true;
              }
              return true;
            },
          },
          GridProps: {
            xs: 12,
            sm: 6,
            md: 6,
            lg: 3,
            xl: 3,
          },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "PAYEE_BANK",
          label: "PayeeBank",
          placeholder: "EnterPayeeBank",
          maxLength: 50,
          autoComplete: false,
          dependentFields: ["DD_REQUEST"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            return !Boolean(
              dependentFieldsValues?.["BENEFIACCTDTL.DD_REQUEST"]?.value
            );
          },
          FormatProps: {
            isAllowed: (values) => {
              return !Boolean(values?.value?.length > 50);
            },
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "PAYABLE_AT",
          label: "PayableAt",
          placeholder: "EnterPayableAt",
          maxLength: 50,
          autoComplete: false,
          dependentFields: ["DD_REQUEST"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            return !Boolean(
              dependentFieldsValues?.["BENEFIACCTDTL.DD_REQUEST"]?.value
            );
          },
          FormatProps: {
            isAllowed: (values) => {
              return !Boolean(values?.value?.length > 50);
            },
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "textField",
          },
          name: "PAYEE_NAME",
          label: "PayeeName",
          placeholder: "EnterPayeeName",
          maxLength: 50,
          autoComplete: false,
          dependentFields: ["DD_REQUEST"],
          shouldExclude: (_, dependentFieldsValues, __) => {
            return !Boolean(
              dependentFieldsValues?.["BENEFIACCTDTL.DD_REQUEST"]?.value
            );
          },
          FormatProps: {
            isAllowed: (values) => {
              return !Boolean(values?.value?.length > 50);
            },
          },
          GridProps: { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 },
        },

        {
          render: {
            componentType: "hidden",
          },
          name: "REQUEST_FOR_DD",
        },
      ],
    },
  ],
};
