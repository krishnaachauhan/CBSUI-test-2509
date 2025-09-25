import { GeneralAPI } from "registry/fns/functions";
import {
  getLockerAccountType,
  getLockerSizeDDWdata,
  getLockerTrxDDWdata,
  validateLockerNo,
} from "../../LockerOperationTrns/api";
import { t } from "i18next";
import { utilFunction } from "@acuteinfo/common-base";
import {
  getLockerRentPeriodData,
  validateAmountFields,
  validateLockerRentPeriod,
  validateLockerSize,
} from "../api";
import i18n from "components/multiLanguage/languagesConfiguration";
import { format } from "date-fns";
import { DefaultValue } from "recoil";

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data ?? []) {
    if (obj?.O_STATUS === "999") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
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
      return data;
    }
  }
};
export const entryFormMetadata: any = {
  form: {
    name: "locker Rent Entry Form",
    label: "",
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      isFieldFocused: true,
      runExternalFunction: true,
      defaultValueKey: "defaultAcType",
      placeholder: "AccountTypePlaceHolder",
      options: (dependentValue, formState, _, authState) => {
        return getLockerAccountType({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id,
          DOC_CD: formState?.docCD,
        });
      },
      _optionsKey: "getLockerTypeData",
      required: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        return {
          REMARKS: {
            value: "",
          },
          LOCKER_NO: {
            value: "",
          },
          LST_ACCT_CD: {
            value: "",
          },
        };
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AccountTypeReqired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LOC_SIZE_DEFAULT",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "LOCKER_NO",
      label: "lockerNumber",
      placeholder: "lockerNumber",
      dependentFields: ["ACCT_TYPE"],
      runPostValidationHookAlways: true,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 9) {
            return false;
          }

          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (
          field.value &&
          field.displayValue &&
          dependentFieldsValues?.ACCT_TYPE?.value.length
        ) {
          if (formState?.isSubmitting) return {};
          let postData = await validateLockerNo({
            ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value,
            COMP_CD: auth?.companyID ?? "",
            BRANCH_CD: auth?.user?.branchCode ?? "",
            LOCKER_NO: field.value,
            DOC_CD: formState?.docCD,
          });

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
                LOC_SIZE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                LOCKER_NO: {
                  value: "",
                },
              };
              break;
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
                LOC_SIZE_DEFAULT: {
                  value: postData[0]?.LOC_SIZE_CD ?? "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                LOC_SIZE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
        return {
          LOC_SIZE_CD: {
            value: "",
            isFieldFocused: false,
            ignoreUpdate: false,
          },
        };
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["lockerNoRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RENT_TO_DT",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RENT_FROM_DT",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RENT_PER_YEAR",
      label: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LST_ACCT_CD",
      label: "",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "LOC_SIZE_CD",
      label: "lockerSize",
      placeholder: "AccountTypePlaceHolder",
      disableCaching: true,
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: true,
      },
      required: true,
      defaultValueKey: "DEFAULT_VAL",
      dependentFields: ["LOCKER_NO", "ACCT_TYPE", "LOC_SIZE_DEFAULT"],
      options: (dependentFields, formState, _, authState) => {
        return getLockerSizeDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode ?? "",
          LOCKER_NO: dependentFields?.LOCKER_NO?.value ?? "",
          ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
          ALLOTED: "Y",
          DEFAULT_VAL: dependentFields?.LOC_SIZE_DEFAULT?.value ?? "",
        });
      },
      _optionsKey: "getLockerSizeDDWdata",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (currentField?.value) {
          const reqData = {
            ACCT_TYPE: currentField?.optionData[0]?.ACCT_TYPE,
            ACCT_CD: currentField?.optionData[0]?.LST_ACCT_CD,
            LOCKER_NO: currentField?.optionData[0]?.LOCKER_NO,
            LOC_SIZE_CD: currentField?.value,
            ACCT_NM: "",
          };
          const payload: any = {
            BRANCH_CD: authState?.user?.branchCode ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: currentField?.optionData[0]?.ACCT_TYPE,
            LST_ACCT_CD: currentField?.optionData[0]?.LST_ACCT_CD,
            SCREEN_REF: formState?.docCD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
            LOCKER_NO: dependentFieldValues?.LOCKER_NO?.value ?? "",
            TYPE_CD: "",
            AMOUNT: "",
            LOC_SIZE_CD: currentField?.value ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
            RENT_PERIOD: "",
          };
          const postData = await validateLockerSize(payload);

          for (const obj of postData ?? []) {
            if (obj?.O_STATUS === "999") {
              await formState.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : "ValidationFailed",
                message: obj?.O_MESSAGE ?? "",
                icon: "ERROR",
              });
              formState.setDataOnFieldChange("VIEWMST_PAYLOAD", {});
              return {
                LOC_SIZE_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
              break;
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
              formState.setDataOnFieldChange("VIEWMST_PAYLOAD", reqData);
              return {
                RECEIPT_NO: {
                  value: postData ? postData[0]?.RECEIPT_NO : "",
                },
                RENT_TO_DT: {
                  value: postData ? postData[0]?.RENT_TO_DT : "",
                },
                RENT_FROM_DT: {
                  value: postData ? postData[0]?.RENT_FROM_DT : "",
                },
                CONFIRMED: {
                  value: postData ? postData[0]?.CONFIRMED : "",
                },
                LST_ACCT_CD: {
                  value: currentField?.optionData[0]?.LST_ACCT_CD ?? "",
                },
              };
            }
          }
        } else if (!currentField?.value) {
          return {
            RECEIPT_NO: {
              value: "",
            },
            RENT_TO_DT: {
              value: "",
            },
            RENT_FROM_DT: {
              value: "",
            },
            CONFIRMED: {
              value: "",
            },
            LST_ACCT_CD: {
              value: "",
            },
          };
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectLockerSize"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRX_CD",
      label: "Type",
      placeholder: "Type",
      options: () => getLockerTrxDDWdata(),
      _optionsKey: "getLockerTrxDDWdata",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["typeRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.2, xl: 1.2 },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (currentField?.value) {
          return {
            REMARKS: {
              value:
                currentField?.value === "1" ? "Cash Rent" : "Transfer Rent",
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "Remarks",
      type: "text",
      dependentFields: ["OPER_STATUS"],
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2.7, xl: 2.7 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "RECEIPT_NO",
      label: "receiptNoL",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RENT_PERIOD",
      label: "rentPeriod",
      dependentFields: [
        "LOCKER_NO",
        "ACCT_TYPE",
        "RENT_PERIOD",
        "LOCKER_NO",
        "LOC_SIZE_CD",
        "LST_ACCT_CD",
        "TRX_CD",
        "ACCT_TYPE",
        "AMOUNT",
        "RENT_FROM_DT",
      ],
      runPostValidationHookAlways: true,
      options: (dependentValue, formState, _, authState) => {
        return getLockerRentPeriodData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      _optionKey: "lockerRentPeriod",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectRentPeriod"] }],
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (currentField?.value && formState?.refID?.current) {
          const { INST_DUE_DT, CATEG_CD } = formState?.refID?.current[0];
          const payload: any = {
            BRANCH_CD: authState?.user?.branchCode ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
            LST_ACCT_CD: dependentFieldValues?.LST_ACCT_CD?.value ?? "",
            SCREEN_REF: formState?.docCD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.name ?? "",
            USERROLE: authState?.role ?? "",
            LOCKER_NO: dependentFieldValues?.LOCKER_NO?.value ?? "",
            TYPE_CD: dependentFieldValues?.TRX_CD?.value ?? "",
            AMOUNT: dependentFieldValues?.AMOUNT?.value ?? "",
            LOC_SIZE_CD: dependentFieldValues?.LOC_SIZE_CD?.value ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
            RENT_PERIOD: currentField?.value ?? "",
            RENT_FROM_DT: dependentFieldValues?.RENT_FROM_DT?.value ?? "",
            CATEG_CD,
            INST_DUE_DT: format(new Date(INST_DUE_DT), "dd/MMM/yyyy"),
          };

          const postData = await validateLockerRentPeriod(payload);
          const returnValue = await handleDisplayMessages(postData, formState);
          if (returnValue) {
            return {
              GST_ROUND: {
                value: postData[0]?.GST_ROUND ?? "",
              },
              TAX_RATE: {
                value: postData[0]?.TAX_RATE ?? "",
              },
              SERVICE_TAX_AMT: {
                value: postData[0]?.SERVICE_TAX ?? "",
                isReadOnly: (fieldValue, dependentFields, formState) => {
                  if (postData[0]?.ENABLE_DISABLE === "Y") {
                    return true;
                  } else return false;
                },
              },
              RENT_TO_DT: {
                value: postData[0]?.RENT_TO_DT ?? "",
              },
              REMARKS: {
                value: postData[0]?.REMARKS ?? "",
              },
              PENALTY_AMT: {
                value: postData[0]?.PENALTY_AMT ?? "",
              },
              PENALTY_GST: {
                value: postData[0]?.PENALTY_GST ?? "",
              },
              AMOUNT: {
                value: postData[0]?.AMOUNT ?? "",
              },
              RENT_PER_YEAR: {
                value: postData[0]?.RENT_PER_YEAR ?? "",
              },
            };
          } else {
            return {
              RENT_PERIOD: {
                value: "",
              },
            };
          }
        } else if (!currentField?.value) {
          return {
            GST_ROUND: {
              value: "",
            },
            TAX_RATE: {
              value: "",
            },
            SERVICE_TAX_AMT: {
              value: "",
            },
            RENT_TO_DT: {
              value: "",
            },
            REMARKS: {
              value: "",
            },
            PENALTY_AMT: {
              value: "",
            },
            PENALTY_GST: {
              value: "",
            },
            AMOUNT: {
              value: "",
            },
            RENT_PER_YEAR: {
              value: "",
            },
          };
        }
      },

      GridProps: { xs: 12, sm: 4, md: 4, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TAX_RATE",
      label: "",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "GST_ROUND",
      label: "",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONFIRMED",
      label: "",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "Amount",
      dependentFields: [
        "TRX_CD",
        "RENT_PERIOD",
        "GST_ROUND",
        "LST_ACCT_CD",
        "ACCT_TYPE",
        "TAX_RATE",
      ],
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["PleaseEnterCollateralAmt"] }],
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFields
      ) => {
        if (field?.value) {
          const { INST_DUE_DT, CATEG_CD } = formState?.refID?.current[0];
          const payload: any = {
            BRANCH_CD: authState?.user?.branchCode ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
            LST_ACCT_CD: dependentFields?.LST_ACCT_CD?.value ?? "",
            SCREEN_REF: formState?.docCD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.name ?? "",
            USERROLE: authState?.role ?? "",
            TYPE_CD: dependentFields?.TRX_CD?.value ?? "",
            AMOUNT: field.value ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
            RENT_PERIOD: dependentFields?.RENT_PERIOD?.value ?? "",
            INST_DUE_DT: format(new Date(INST_DUE_DT), "dd/MMM/yyyy"),
            FLAG: "A",
          };
          const postData = await validateAmountFields(payload);
          const returnValue = await handleDisplayMessages(postData, formState);
          return {
            SERVICE_TAX_AMT: {
              value:
                dependentFields?.GST_ROUND?.value === "3"
                  ? Math.floor(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.TAX_RATE?.value)) /
                        100
                    ) ?? ""
                  : dependentFields?.GST_ROUND?.value === "2"
                  ? Math.ceil(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.TAX_RATE?.value)) /
                        100
                    ) ?? ""
                  : dependentFields?.GST_ROUND?.value === "1"
                  ? Math.round(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.TAX_RATE?.value)) /
                        100
                    ) ?? ""
                  : (parseInt(field?.value) *
                      parseInt(dependentFields?.TAX_RATE?.value)) /
                    100,
            },
            PENALTY_AMT: {
              value: postData[0]?.PENALTY_AMT ?? "",
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_TAX_AMT",
      label: "GST",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PENALTY_AMT",
      label: "penaltyAmt",
      dependentFields: [
        "TRX_CD",
        "AMOUNT",
        "RENT_PERIOD",
        "GST_ROUND",
        "LST_ACCT_CD",
        "ACCT_TYPE",
        "TAX_RATE",
      ],
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFields
      ) => {
        if (formState?.isSubmitting) return {};

        if (field?.value) {
          const { INST_DUE_DT, CATEG_CD } = formState?.refID?.current[0];
          const payload: any = {
            BRANCH_CD: authState?.user?.branchCode ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
            LST_ACCT_CD: dependentFields?.LST_ACCT_CD?.value ?? "",
            SCREEN_REF: formState?.docCD ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.name ?? "",
            USERROLE: authState?.role ?? "",
            TYPE_CD: dependentFields?.TRX_CD?.value ?? "",
            AMOUNT: field?.value ?? "",
            DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
            RENT_PERIOD: dependentFields?.RENT_PERIOD?.value ?? "",
            INST_DUE_DT: format(new Date(INST_DUE_DT), "dd/MMM/yyyy"),
            FLAG: "P",
          };
          const postData = await validateAmountFields(payload);
          const returnValue = await handleDisplayMessages(postData, formState);
          return {
            PENALTY_GST: {
              value:
                dependentFields?.GST_ROUND?.value === "3"
                  ? Math.floor(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.TAX_RATE?.value)) /
                        100
                    ) ?? ""
                  : dependentFields?.GST_ROUND?.value === "2"
                  ? Math.ceil(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.TAX_RATE?.value)) /
                        100
                    ) ?? ""
                  : dependentFields?.GST_ROUND?.value === "1"
                  ? Math.round(
                      (parseInt(field?.value) *
                        parseInt(dependentFields?.TAX_RATE?.value)) /
                        100
                    ) ?? ""
                  : (parseInt(field?.value) *
                      parseInt(dependentFields?.TAX_RATE?.value)) /
                    100,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PENALTY_GST",
      label: "gstOnPenalty",
      defaultValue: "0",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "TRN_BRANCH_CD",
        label: "DebitfromAC",
        disableCaching: true,
        dependentFields: ["TRX_CD"],
        shouldExclude: (val1, dependentFields) => {
          if (dependentFields?.TRX_CD?.value === "3") {
            return false;
          }
          return true;
        },
        GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "TRN_ACCT_TYPE",
        disableCaching: true,
        label: "",
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: dependentValue?.TRN_BRANCH_CD?.value,
            USER_NAME: authState?.user?.id,
            DOC_CD: "LOC_DR",
          });
        },
        _optionsKey: "getDebitAccountType",
        dependentFields: ["TRX_CD", "TRN_BRANCH_CD"],
        shouldExclude: (val1, dependentFields) => {
          if (dependentFields?.TRX_CD?.value === "3") {
            return false;
          }
          return true;
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          if (
            currentField?.value &&
            dependentFieldValues?.TRN_BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterBranchCode"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                TRN_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                TRN_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            TRN_ACCT_CD: { value: "", ignoreUpdate: false },
            ACCT_NM: { value: "" },
          };
        },
        GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "TRN_ACCT_CD",
        label: "",
        autoComplete: "off",
        maxLength: 20,
        dependentFields: [
          "TRX_CD",
          "TRN_ACCT_CD",
          "TRN_ACCT_TYPE",
          "TRN_BRANCH_CD",
          "OPER_STATUS",
        ],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.["TRN_BRANCH_CD"]?.value &&
            dependentFieldValues?.["TRN_ACCT_TYPE"]?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.TRN_BRANCH_CD?.value,
              COMP_CD: authState?.companyID,
              ACCT_TYPE: dependentFieldValues?.TRN_ACCT_TYPE?.value,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
              ),
              SCREEN_REF: formState?.docCD,
            };
            let postData = await GeneralAPI.getAccNoValidation(reqParameters);
            if (postData?.status === "999") {
              let btnName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: postData?.messageDetails?.length
                  ? postData?.messageDetails
                  : "Somethingwenttowrong",
                icon: "ERROR",
              });
              if (btnName === "Ok") {
                return {
                  ACCT_CD: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                  ACCT_NM: { value: "" },
                };
              }
            }
            let btn99, returnVal;
            for (const obj of postData?.MSG ?? []) {
              if (obj?.O_STATUS === "999") {
                await formState.MessageBox({
                  messageTitle: obj?.O_MSG_TITLE?.length
                    ? obj?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: obj?.O_MESSAGE ?? "",
                  icon: "ERROR",
                });
                returnVal = "";
                break;
              } else if (obj?.O_STATUS === "9") {
                await formState.MessageBox({
                  messageTitle: obj?.O_MSG_TITLE?.length
                    ? obj?.O_MSG_TITLE
                    : "Alert",
                  message: obj?.O_MESSAGE ?? "",
                  icon: "WARNING",
                });
              } else if (obj?.O_STATUS === "99") {
                if (obj?.O_COLUMN_NM === "FREEZE_AC") {
                  const buttonName = await formState.MessageBox({
                    messageTitle: obj?.O_MSG_TITLE?.length
                      ? obj?.O_MSG_TITLE
                      : "Confirmation",
                    message: obj?.O_MESSAGE ?? "",
                    buttonNames: ["Yes", "No"],
                    defFocusBtnName: "No",
                    loadingBtnName: ["Yes"],
                    icon: "CONFIRM",
                  });

                  if (buttonName === "Yes") {
                    try {
                      const freezeResponse = await GeneralAPI.doAccountFreeze({
                        ENT_COMP_CD: authState?.companyID ?? "",
                        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                        BRANCH_CD:
                          dependentFieldValues?.TRN_BRANCH_CD?.value ?? "",
                        COMP_CD: authState?.companyID ?? "",
                        ACCT_TYPE:
                          dependentFieldValues?.TRN_ACCT_TYPE?.value ?? "",
                        ACCT_CD: utilFunction.getPadAccountNumber(
                          currentField?.value,
                          dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                        ),
                      });

                      if (freezeResponse?.error) {
                        await formState.MessageBox({
                          messageTitle: "Error",
                          message:
                            freezeResponse?.errorMessage ??
                            "Unknownerroroccured",
                          icon: "ERROR",
                          buttonNames: ["OK"],
                        });
                      }
                    } catch (error: any) {
                      await formState.MessageBox({
                        messageTitle: "Error",
                        message: error?.error_msg ?? "Unknownerroroccured",
                        icon: "ERROR",
                        buttonNames: ["OK"],
                      });
                    }
                  }
                } else {
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
                }
              } else if (obj?.O_STATUS === "0") {
                returnVal = postData[0];
              }
            }
            btn99 = 0;

            return {
              TRN_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_NM: {
                value: postData?.ACCT_NM ?? "",
              },
            };
          } else if (!currentField?.value) {
            return {
              ACCT_NM: { value: "" },
            };
          }
        },
        shouldExclude: (val1, dependentFields) => {
          if (dependentFields?.TRX_CD?.value === "3") {
            return false;
          }
          return true;
        },
        fullWidth: true,
        GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "TYPE_CD",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "chequeNo",
      placeholder: "Cheque No.",
      type: "text",
      fullWidth: true,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }

          return true;
        },
      },
      GridProps: { xs: 6, sm: 6, md: 4, lg: 1, xl: 1 },
      dependentFields: [
        "TRN_ACCT_CD",
        "TYPE_CD",
        "TRN_ACCT_TYPE",
        "TRN_BRANCH_CD",
        "TRX_CD",
        "OPER_STATUS",
      ],
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ChequeNoisrequired"] }],
      },
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.TRX_CD?.value === "3") {
          return false;
        }
        return true;
      },
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: false,
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (
          field.value &&
          dependentFieldsValues?.TRN_ACCT_CD?.value.length === 0
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "Error",
            message: "Enter Account Information",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });

          if (buttonName === "Ok") {
            return {
              CHEQUE_NO: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: true,
              },
              TRN_ACCT_TYPE: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: true,
              },
            };
          }
        } else if (
          field.value &&
          dependentFieldsValues?.TRN_ACCT_CD?.value.length
        ) {
          if (formState?.isSubmitting) return {};
          let postData = await GeneralAPI.getChequeNoValidation({
            BRANCH_CD: dependentFieldsValues?.TRN_BRANCH_CD?.value,
            ACCT_TYPE: dependentFieldsValues?.TRN_ACCT_TYPE?.value,
            ACCT_CD: utilFunction.getPadAccountNumber(
              dependentFieldsValues?.TRN_ACCT_CD?.value,
              dependentFieldsValues?.TRN_ACCT_TYPE?.optionData?.[0] ?? {}
            ),
            CHEQUE_NO: field.value,
            TYPE_CD: dependentFieldsValues?.TYPE_CD?.value,

            SCREEN_REF: formState?.docCD,
          });

          let returnVal;
          for (const obj of postData) {
            if (
              obj?.O_STATUS === "999" ||
              obj?.O_STATUS === "99" ||
              obj?.O_STATUS === "9"
            ) {
              const buttonName = await formState?.MessageBox({
                messageTitle: obj?.O_MSG_TITLE?.length
                  ? obj?.O_MSG_TITLE
                  : obj?.O_STATUS === "9"
                  ? "Alert"
                  : obj?.O_STATUS === "99"
                  ? "Confirmation"
                  : "ValidationFailed",
                message: obj?.O_MESSAGE ?? "",
                buttonNames: obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                loadingBtnName: ["Yes"],
                icon:
                  obj?.O_STATUS === "999"
                    ? "ERROR"
                    : obj?.O_STATUS === "99"
                    ? "CONFIRM"
                    : obj?.O_STATUS === "9"
                    ? "WARNING"
                    : "INFO",
              });
              if (
                obj?.O_STATUS === "999" ||
                (obj?.O_STATUS === "99" && buttonName === "No")
              ) {
                break;
              }
            } else if (obj?.O_STATUS === "0") {
              returnVal = postData[0];
            }
          }
          return {
            CHEQUE_NO: returnVal
              ? {
                  value: field?.value,
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
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "accountName",
      isReadOnly: true,
      type: "text",
      fullWidth: true,
      dependentFields: ["TRX_CD"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.TRX_CD?.value === "3") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
  ],
};
