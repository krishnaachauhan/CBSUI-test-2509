import * as API from "../api";
import { GeneralAPI } from "registry/fns/functions";
import {
  getDividendAccountDetail,
  getDividendViewMasterData,
  getInwardAccountDetail,
} from "../api";
import { GridMetaDataType, utilFunction } from "@acuteinfo/common-base";
import { isValid } from "date-fns";
import { getAccountSlipJoinDetail } from "../../ctsOutward/api";
export const chequeReturnPostFormMetaData = {
  form: {
    name: "InwardClearingChequeDetail",
    label: "InwardClearingChequeDetail",
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
        componentType: "hidden",
      },
      name: "DISABLE_RET_AC",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_CHQ_NO",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_MICR",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_MAIN_AC",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "POST_CONF",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "ChequeNo",
      type: "text",
      required: true,
      autoComplete: "off",
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
      dependentFields: ["DISABLE_CHQ_NO"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.DISABLE_CHQ_NO?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "TRAN_DATE",
    //   label: "",
    //   placeholder: "",
    //   format: "dd/MM/yyyy",

    //   GridProps: { xs: 12, sm: 2, md: 1.8, lg: 1.8, xl: 1.5 },
    // },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "RANGE_DATE",
    //   label: "",
    //   placeholder: "",
    //   format: "dd/MM/yyyy",

    //   GridProps: { xs: 12, sm: 2, md: 1.8, lg: 1.8, xl: 1.5 },
    // },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      placeholder: "DD/MM/YYYY",
      format: "dd/MM/yyyy",
      type: "text",
      fullWidth: true,
      isFieldFocused: true,
      defaultfocus: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      // dependentFields: ["TRAN_DATE", "RANGE_DATE"],
      // validate: (currentField, dependentField) => {
      //   const currentDate = new Date(currentField?.value);
      //   const rangeDate = new Date(dependentField?.RANGE_DATE?.value);
      //   const transDate = new Date(dependentField?.TRAN_DATE?.value);

      //   if (currentDate < rangeDate || currentDate > transDate) {
      //     return `Date should be between ${rangeDate.toLocaleDateString(
      //       "en-IN"
      //     )} - ${transDate.toLocaleDateString("en-IN")}`;
      //   }
      //   return "";
      // },

      maxLength: 6,

      GridProps: { xs: 12, sm: 2, md: 1.7, lg: 1.7, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "ChequeAmount",
      placeholder: "",
      required: true,
      isReadOnly: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      GridProps: { xs: 6, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        required: true,
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
        dependentFields: ["DISABLE_MAIN_AC"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.DISABLE_MAIN_AC?.value === "Y") {
            return true;
          } else {
            return false;
          }
        },
        // validate: (currentField, value) => {
        //   if (currentField?.value) {
        //     return;
        //   }
        // },
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: (field, formState) => {
          formState.setDataOnFieldChange("ACCT_CD_BLANK");
          formState?.setDataOnFieldChange("GET_ACCT_DATA");
          return {
            ACCT_CD: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_NM: { value: "" },
            WIDTH_BAL: { value: "" },
            OTHER_REMARKS: { value: "" },
          };
        },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
        validate: (currentField, value) => {
          if (currentField?.value) {
            return;
          }
        },
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "TRN/650",
          });
        },
        _optionsKey: "get_Account_Type",
        dependentFields: ["DISABLE_MAIN_AC", "BRANCH_CD"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.DISABLE_MAIN_AC?.value === "Y") {
            return true;
          } else {
            return false;
          }
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: "" }],
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          auth,
          dependentFieldValues
        ) => {
          formState.setDataOnFieldChange("ACCT_CD_BLANK");
          if (
            currentField?.value &&
            !dependentFieldValues?.BRANCH_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
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
          formState?.setDataOnFieldChange("GET_ACCT_DATA");
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            WIDTH_BAL: { value: "" },
            OTHER_REMARKS: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        fullWidth: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: "" }],
        },
        validate: (currentField, value) => {
          if (currentField?.value) {
            return;
          }
        },
        dependentFields: [
          "DISABLE_MAIN_AC",
          "ACCT_TYPE",
          "BRANCH_CD",
          "COMP_CD",
          "AMOUNT",
        ],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.DISABLE_MAIN_AC?.value === "Y") {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          formState?.setDisableBtn(true);
          try {
            if (
              field.value &&
              !dependentFieldsValues?.ACCT_TYPE?.value?.trim()
            ) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterAccountType",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
              if (buttonName === "Ok") {
                return {
                  ACCT_CD: {
                    value: "",
                    isFieldFocused: false,
                    ignoreUpdate: false,
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
              field.value &&
              dependentFieldsValues?.["ACCT_TYPE"]?.value.trim() &&
              dependentFieldsValues?.["BRANCH_CD"]?.value.trim()
            ) {
              let Apireq = {
                COMP_CD: dependentFieldsValues?.COMP_CD?.value,
                ACCT_CD: utilFunction.getPadAccountNumber(
                  field?.value,
                  dependentFieldsValues?.["ACCT_TYPE"]?.optionData?.[0] ?? ""
                ),
                ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
                BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
                SCREEN_REF: formState?.docCD,
              };

              let postData = await getInwardAccountDetail(Apireq);
              let btn99, returnVal;
              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };
              for (let i = 0; i < postData.length; i++) {
                if (postData[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "9") {
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "99") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });

                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
                  }
                } else if (postData[i]?.O_STATUS === "0") {
                  formState?.setDataOnFieldChange("GET_ACCT_DATA", {
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      field?.value,
                      dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                    ),
                    ACCT_TYPE:
                      dependentFieldsValues?.["ACCT_TYPE"]?.value ?? "",
                    BRANCH_CD:
                      dependentFieldsValues?.["BRANCH_CD"]?.value ?? "",
                    AMOUNT: dependentFieldsValues?.["AMOUNT"]?.value ?? "",
                  });
                  if (btn99 !== "No") {
                    returnVal = postData[i];
                  } else {
                    returnVal = "";
                  }
                }
                formState.setDataOnFieldChange("ACCT_CD_VALID", postData[i]);
              }
              btn99 = 0;
              return {
                // ACCT_CD: {
                //   value: postData?.[0]?.ACCT_NUMBER ?? "",
                //   ignoreUpdate: true,
                // },
                ACCT_CD:
                  returnVal !== ""
                    ? {
                        value: utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ??
                            ""
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
                  value: returnVal?.ACCT_NM ?? "",
                },
                WIDTH_BAL: { value: returnVal?.WIDTH_BAL ?? "" },
                OTHER_REMARKS: { value: returnVal?.OTHER_REMARKS ?? "" },
              };
            } else if (!field?.value) {
              formState?.setDataOnFieldChange("GET_ACCT_DATA");
              formState.setDataOnFieldChange("ACCT_CD_BLANK");
              return {
                ACCT_NM: { value: "" },
                WIDTH_BAL: { value: "" },
                OTHER_REMARKS: { value: "" },
              };
            }
          } catch (error: any) {
            const Msg = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Msg === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                ACCT_NM: { value: "" },
                WIDTH_BAL: { value: "" },
                OTHER_REMARKS: { value: "" },
              };
            }
          } finally {
            formState?.setDisableBtn(false);
          }
          return {};
        },
        // postValidationSetCrossFieldValues: async (
        //   field,
        //   formState,
        //   auth,
        //   dependentFieldsValues
        // ) => {
        //   if (formState?.isSubmitting) return {};
        //   if (
        //     field.value &&
        //     dependentFieldsValues?.["ACCT_TYPE"]?.value.trim() &&
        //     dependentFieldsValues?.["BRANCH_CD"]?.value.trim()
        //   ) {
        //     let Apireq = {
        //       COMP_CD: auth?.companyID,
        //       ACCT_CD: utilFunction.getPadAccountNumber(
        //         field?.value,
        //         dependentFieldsValues?.["ACCT_TYPE"]?.optionData
        //       ),
        //       ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
        //       BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
        //       SCREEN_REF: "ETRN/650",
        //     };

        //     let postData = await getInwardAccountDetail(Apireq);
        //     if (postData?.[0]?.MESSAGE1) {
        //       formState?.MessageBox({
        //         messageTitle: "Information",
        //         message: postData?.[0]?.MESSAGE1,
        //       });
        //     } else if (postData?.[0]?.RESTRICTION) {
        //       formState?.MessageBox({
        //         messageTitle: "Account Validation Failed",
        //         message: postData?.[0]?.RESTRICTION,
        //       });
        //       formState.setDataOnFieldChange("ACCT_CD_VALID", []);
        //       return {
        //         ACCT_CD: { value: "", isFieldFocused: true },
        //         ACCT_NM: { value: "" },
        //         WIDTH_BAL: { value: "" },
        //       };
        //     }
        //     formState.setDataOnFieldChange("ACCT_CD_VALID", postData);
        //     return {
        //       // ACCT_CD: {
        //       //   value: postData?.[0]?.ACCT_NUMBER ?? "",
        //       //   ignoreUpdate: true,
        //       // },
        //       ACCT_CD: {
        //         value: field?.value.padStart(6, "0")?.padEnd(20, " "),
        //         ignoreUpdate: true,
        //       },
        //       ACCT_NM: {
        //         value: postData?.[0]?.ACCT_NM ?? "",
        //       },
        //       WIDTH_BAL: { value: postData?.[0]?.WIDTH_BAL ?? "" },
        //       OTHER_REMARKS: { value: postData?.[0]?.OTHER_REMARKS ?? "" },
        //     };
        //   } else if (!field?.value) {
        //     formState.setDataOnFieldChange("ACCT_CD_BLANK");
        //     return {
        //       ACCT_NM: { value: "" },
        //       WIDTH_BAL: { value: "" },
        //       OTHER_REMARKS: { value: "" },
        //     };
        //   }
        // },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account_Name",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 2.3 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "MICR_TRAN_CD",
      label: "MICR",
      type: "text",
      placeholder: "MICR",
      fullWidth: true,
      required: true,
      dependentFields: ["DISABLE_MICR"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.DISABLE_MICR?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },

      GridProps: { xs: 6, sm: 0.5, md: 0.5, lg: 0.5, xl: 0.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ERR_DESC",
      label: "Error Description",
      type: "text",
      fullWidth: true,
      required: true,
      isReadOnly: true,
      placeholder: "Error Description",
      textFieldStyle: {
        "& .MuiInputBase-input": {
          color: "rgb(168, 0, 0) !important",
          "-webkit-text-fill-color": "rgb(168, 0, 0) !important",
        },
      },
      GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 1.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "OTHER_REMARKS",
      label: "ModeOfOperation",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.3, md: 2.3, lg: 2.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "WIDTH_BAL",
      label: "WithdrawBalance",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      type: "text",
      fullWidth: true,
      required: true,
      placeholder: "EnterRemarks",
      GridProps: { xs: 12, sm: 3.6, md: 3.6, lg: 3.6, xl: 3.6 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "POST",
      label: "Post",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      dependentFields: ["POST_CONF", "ZONE_CD"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (
          dependentFieldsValues?.ZONE_CD?.value.trim() ||
          dependentFieldsValues?.POST_CONF?.value === "C"
        ) {
          return true;
        } else if (
          dependentFieldsValues?.POST_CONF?.value === "P" ||
          dependentFieldsValues?.ZONE_CD?.value.trim() !== ""
        ) {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "CONFIRM",
      label: "Confirm",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      dependentFields: ["POST_CONF"],
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.POST_CONF?.value === "C") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "POSITIVE_PAY",
      label: "Positive Pay",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 1.1, md: 1.1, lg: 1.1, xl: 1.1 },
    },
    {
      render: {
        componentType: "typography",
      },
      name: "DIVIDER",
      label: "",
      TypographyProps: {
        style: {
          whiteSpace: "pre-line",
          color: "red",
          fontSize: "1rem",
          border: "1px solid black",
          borderStyle: "dashed",
          width: "100%",
          height: "0px",
        },
      },
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        style: { alignSelf: "center" },
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "ZONE_CD",
      label: "Zone",
      dependentFields: ["ACCT_CD", "BRANCH_CD", "ACCT_TYPE", "COMP_CD"],
      options: (dependentValue, formState, _, authState) => {
        let ApiReq = {
          BRANCH_CD: authState?.user?.branchCode,
          COMP_CD: authState?.companyID,
          ZONE_TRAN_TYPE: "R",
        };
        return API.getInwardZoneTypeList(ApiReq);
      },
      _optionsKey: "getInwardZoneTypeList",
      postValidationSetCrossFieldValues: (
        field,
        __,
        ___,
        dependentFieldsValues
      ) => {
        if (field.value && dependentFieldsValues?.ACCT_CD?.value.trim()) {
          return {
            RET_ACCT_CD: {
              value: dependentFieldsValues?.ACCT_CD?.value ?? "",
              ignoreUpdate: true,
            },
            RET_BRANCH_CD: {
              value: dependentFieldsValues?.BRANCH_CD?.value ?? "",
              ignoreUpdate: true,
            },
            RET_ACCT_TYPE: {
              value: dependentFieldsValues?.ACCT_TYPE?.value ?? "",
              ignoreUpdate: true,
            },
            RET_COMP_CD: { value: dependentFieldsValues?.COMP_CD?.value ?? "" },
          };
        } else if (
          field?.value &&
          field.optionData &&
          field.optionData.length > 0
        ) {
          return {
            RET_ACCT_CD: {
              value: field.optionData[0].OPP_ACCT_CD ?? "",
              ignoreUpdate: true,
            },
            RET_COMP_CD: { value: field.optionData[0].OPP_COMP_CD ?? "" },
            RET_BRANCH_CD: {
              value: field.optionData[0].OPP_BRANCH_CD ?? "",
              ignoreUpdate: true,
            },
            RET_ACCT_TYPE: {
              value: field.optionData[0].OPP_ACCT_TYPE ?? "",
              ignoreUpdate: true,
            },
          };
        }
      },
      runPostValidationHookAlways: true,
      placeholder: "SelectZone",
      type: "text",
      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RET_BRANCH_CD",
      label: "ReturnBranch",
      placeholder: "SelectReturnBranch",
      type: "text",
      required: true,
      options: GeneralAPI.getBranchCodeList,
      _optionsKey: "getBranchCodeList",
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
      dependentFields: ["DISABLE_RET_AC"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.DISABLE_RET_AC?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "RET_COMP_CD",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RET_ACCT_TYPE",
      label: "ReturnAccountType",
      placeholder: "SelectReturnAccountType",
      type: "text",
      required: true,
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
      dependentFields: ["DISABLE_RET_AC"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.DISABLE_RET_AC?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      options: (dependentValue, formState, _, authState) => {
        return GeneralAPI.get_Account_Type({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id,
          DOC_CD: "TRN/650",
        });
      },
      _optionsKey: "get_Account_Type",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RET_ACCT_CD",
      label: "ReturnACNumber",
      placeholder: "EnterReturnACNumber",
      type: "text",
      required: true,
      dependentFields: ["DISABLE_RET_AC", "RET_ACCT_TYPE", "RET_BRANCH_CD"],
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 6) {
            return false;
          }
          return true;
        },
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        formState?.setDisableBtn(true);
        try {
          if (
            currentField?.value &&
            !dependentFieldsValues?.RET_ACCT_TYPE?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                RET_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                RET_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldsValues?.RET_BRANCH_CD?.value &&
            dependentFieldsValues?.RET_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldsValues?.RET_BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldsValues?.RET_ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldsValues?.RET_ACCT_TYPE?.optionData?.[0] ?? ""
              ),
              SCREEN_REF: formState?.docCD ?? "",
              GD_TODAY_DT: authState?.workingDate ?? "",
            };
            let postData = await getAccountSlipJoinDetail(reqParameters);

            let returnVal;
            for (const obj of postData?.[0]?.MSG) {
              const continueProcess = await formState?.showMessageBox(obj);
              if (!continueProcess) {
                break;
              }
              if (obj?.O_STATUS === "0") {
                returnVal = postData;
              }
            }
            return {
              RET_ACCT_CD: returnVal
                ? {
                    value: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldsValues?.RET_ACCT_TYPE?.optionData?.[0] ??
                        ""
                    ),
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
        } catch (error: any) {
          const Msg = await formState.MessageBox({
            messageTitle: "Error",
            message: error?.error_msg ?? "Unknownerroroccured",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (Msg === "Ok") {
            return {
              RET_ACCT_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
        } finally {
          formState?.setDisableBtn(false);
        }
        return {};
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (dependentFields?.DISABLE_RET_AC?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "REASON_CD",
      label: "Reason",
      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
      skipDefaultOption: true,
      options: (dependentValue, formState, _, authState) => {
        let ApiReq = {
          BRANCH_CD: authState?.user?.branchCode,
          COMP_CD: authState?.companyID,
          RETURN_TYPE: "CLG",
        };
        return API.getInwardReasonTypeList(ApiReq);
      },
      _optionsKey: "getInwardReasonTypeList",
      placeholder: "SelectReason",
    },

    {
      render: {
        componentType: "textField",
      },
      name: "REASON",
      label: "OtherReason",
      type: "text",
      fullWidth: true,
      validate: (currentField, value) => {
        if (/[~`!@#$%^&*()-+={}:"<>?,._-]/g.test(currentField?.value)) {
          return "SpecialCharacterIsNotAllowed";
        }
        return "";
      },
      placeholder: "EnterOtherReason",
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RETURN",
      label: "Return",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 0.9, md: 0.9, lg: 0.9, xl: 0.9 },
    },
  ],
};
export const chequesignFormMetaData = {
  form: {
    name: "InwardClearingchequeSign",
    label: "InwardClearingChequeDetail",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    // allowColumnHiding: true,
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
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "ChequeNo",
      placeholder: "ChequeNo",
      type: "text",
      required: true,
      autoComplete: "off",
      isFieldFocused: true,
      defaultfocus: true,
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
      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "ChequeDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      type: "text",
      fullWidth: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ChequeDateRequired."] }],
      },
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "ChequeAmount",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      validationRun: "all",

      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "BranchCode",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNo",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account Name",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4.2, md: 4.2, lg: 4.2, xl: 4.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "OTHER_REMARKS",
      label: "Mode of Operation",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "typography",
      },
      name: "IMAGENOTE",
      label: "",
      defaultValue:
        "Note : To zoom in on the images, simply click on it once...",
      TypographyProps: {
        style: {
          color: "red",
          whiteSpace: "pre-line",
          fontSize: "1.1rem",
          marginLeft: "21px",
          marginTop: "30px",
        },
      },
      GridProps: { xs: 12, sm: 5, md: 5, lg: 5, xl: 5 },
    },
  ],
};
export const positivePayFormMetaData = {
  form: {
    name: "InwardClearingPositivePay",
    label: "Inward Clearing Cheque Detail",
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
        componentType: "textField",
      },
      name: "CONFIRMED",
      label: "Status ",
      type: "text",
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "Branch Code",
      type: "text",

      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNo",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account Name",
      type: "text",
      fullWidth: true,

      GridProps: { xs: 12, sm: 4.1, md: 4.1, lg: 4.1, xl: 4.1 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CHEQUE_NO",
      label: "Cheque No.",
      placeholder: "Cheque No.",
      type: "text",
      GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 1.7 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CHEQUE_DT",
      label: "Cheque Date",
      placeholder: "",
      format: "dd/MM/yyyy",
      type: "text",
      fullWidth: true,
      required: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 2.3, md: 2.3, lg: 2.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CHEQUE_AMT",
      label: "Cheque Amount",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },
      validationRun: "all",

      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "PAYEE_NM",
      label: "Payee Name",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4.3, md: 4.3, lg: 4.3, xl: 4.3 },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "Entery Date",
      type: "text",
      fullWidth: true,
      required: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 2.3, md: 2.3, lg: 2.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ENTERED_BY",
      label: "Enterd By",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.8, md: 1.8, lg: 1.8, xl: 1.8 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ENTERED_BRANCH_CD",
      label: "Enterd Branch",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.3, md: 1.3, lg: 1.3, xl: 1.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REQ_CHANNEL",
      label: "Received From",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.8, md: 2.8, lg: 2.8, xl: 2.8 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "VIEW",
      label: "View Image",
      type: "text",

      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
  ],
};
export const shareDividendMetaData = {
  form: {
    name: "InwardClearingProcessShareDividend",
    label: "Inward Clearing Process",
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
        componentType: "hidden",
      },
      name: "AMOUNT",
      label: "",
      type: "text",

      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "YEAR_CD",
      label: "Year",
      type: "text",
      postValidationSetCrossFieldValues: (field) => {
        return {
          WARRANT_NO: { value: "" },
          DIVIDEND_AMOUNT: { value: "" },
          ACCT_CD: { value: "", isFieldFocused: true },
        };
      },
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        required: true,
        GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },

        postValidationSetCrossFieldValues: (field) => {
          return {
            WARRANT_NO: { value: "" },
            DIVIDEND_AMOUNT: { value: "" },
            ACCT_CD: { value: "" },
          };
        },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
        isFieldFocused: true,
        defaultfocus: true,
        required: true,
        dependentFields: ["BRANCH_CD"],
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "DIV",
          });
        },
        _optionsKey: "getInwardDividendTypeList",
        postValidationSetCrossFieldValues: (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          return {
            WARRANT_NO: { value: "" },
            DIVIDEND_AMOUNT: { value: "" },
            ACCT_CD: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        label: "A/C Number",
        placeholder: "",
        fullWidth: true,
        required: true,
        FormatProps: {
          isAllowed: (values) => {
            if (values?.value?.length > 6) {
              return false;
            }
            return true;
          },
        },

        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "YEAR_CD", "AMOUNT"],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          formState?.setDisableBtn(true);
          try {
            if (
              field.value &&
              dependentFieldsValues?.["ACCT_TYPE"]?.value.trim() &&
              dependentFieldsValues?.["BRANCH_CD"]?.value.trim()
            ) {
              let Apireq = {
                ACCT_CD: utilFunction.getPadAccountNumber(
                  field?.value,
                  dependentFieldsValues?.["ACCT_TYPE"]?.optionData?.[0] ?? ""
                ),
                ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
                BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
                YEAR_CD: dependentFieldsValues?.["YEAR_CD"]?.value,
                // SCREEN_REF: "ETRN/650",
              };
              formState.setDataOnFieldChange("TAB_REQUEST", Apireq);

              let postData = await getDividendAccountDetail(Apireq);
              formState.setDataOnFieldChange("POST_DATA", postData);
              postData = postData.sort(
                (a, b) => parseInt(b.O_STATUS) - parseInt(a.O_STATUS)
              );

              let btn99, returnVal;

              const getButtonName = async (obj) => {
                let btnName = await formState.MessageBox(obj);
                return { btnName, obj };
              };
              for (let i = 0; i < postData.length; i++) {
                if (postData[i]?.O_STATUS === "999") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "9") {
                  formState.setDataOnFieldChange("TAB_CHANGED");
                  if (btn99 !== "No") {
                    const { btnName, obj } = await getButtonName({
                      messageTitle: postData[i]?.O_MSG_TITLE,
                      message: postData[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  }
                  returnVal = "";
                } else if (postData[i]?.O_STATUS === "99") {
                  formState.setDataOnFieldChange("TAB_CHANGED");
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData[i]?.O_MSG_TITLE,
                    message: postData[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  btn99 = btnName;
                  if (btnName === "No") {
                    returnVal = "";
                  }
                } else if (postData[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = postData[i];
                  } else {
                    returnVal = "";
                  }
                  if (postData[i]?.DIVIDEND_AMOUNT) {
                    if (
                      postData[i]?.DIVIDEND_AMOUNT !==
                      dependentFieldsValues?.["AMOUNT"]?.value
                    ) {
                      formState?.MessageBox({
                        messageTitle: "ValidationFailed",
                        message: "DividendAmountMatch",
                        buttonNames: ["Ok"],
                      });
                    }
                  }
                  if (postData[i]?.RET_FLAG === "Y") {
                    let viewMasterData = await getDividendViewMasterData({
                      ...Apireq,
                      A_ASON_DT: auth?.workingDate,
                      COMP_CD: auth?.companyID,
                    });
                    formState.setDataOnFieldChange(
                      "VIEW_MASTER",
                      viewMasterData
                    );
                  }
                }
              }
              btn99 = 0;
              return {
                ACCT_CD:
                  returnVal !== ""
                    ? {
                        value: utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ??
                            ""
                        ),
                        ignoreUpdate: true,
                        isFieldFocused: false,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: true,
                      },
                WARRANT_NO: {
                  value: returnVal?.WARRANT_NO ?? "",
                },
                DIVIDEND_AMOUNT: {
                  value: returnVal?.DIVIDEND_AMOUNT ?? "",
                },
              };
            } else if (!field?.value) {
              return {
                WARRANT_NO: { value: "" },
                DIVIDEND_AMOUNT: { value: "" },
              };
            }
          } catch (error: any) {
            const Msg = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Msg === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                WARRANT_NO: { value: "" },
                DIVIDEND_AMOUNT: { value: "" },
              };
            }
          } finally {
            formState?.setDisableBtn(false);
          }
          return {};
        },

        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "TYPE_CD",
      label: "Dr",
      type: "text",
      defaultValue: "5",
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "WARRANT_NO",
      label: "Warrant Number",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "DIVIDEND_AMOUNT",
      label: "Dividend Amount",
      placeholder: "",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "",
      defaultValue: "DEBIT CLEARING",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 1.7, md: 1.7, lg: 1.7, xl: 1.7 },
    },
  ],
};

export const ViewDetailGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Inward Clearing Process(TRN/650)",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [10, 20, 30, 50],
    defaultPageSize: 10,
    containerHeight: { min: "40vh", max: "40vh" },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  filters: [],

  columns: [
    {
      accessor: "ACCT_TYPE",
      columnName: "Type",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 90,
      minWidth: 100,
      maxWidth: 180,
    },
    {
      accessor: "ACCT_CD",
      columnName: "AccountNo",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "YEAR_CD",
      columnName: "Year",
      sequence: 2,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "WARRANT_NO",
      columnName: "WarrantNumber",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "TYPE_CD",
      columnName: "Dr.",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "DIVIDEND_AMOUNT",
      columnName: "Dividend Amount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isTotalWithCurrency: true,
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "NO_OF_SHARE",
      columnName: "Shares",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "SHARE_AMOUNT",
      columnName: "SharesAmount",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isTotalWithCurrency: true,
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "DIVIDEND_RATE",
      columnName: "Rate",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "PAID",
      columnName: "Paid",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "PAID_DATE",
      columnName: "PaidDate",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "CREDIT_ACCOUNT",
      columnName: "CreditAccount",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
  ],
};
export const PaidWarrantGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Inward Clearing Process(TRN/650)",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [10, 20, 30, 50],
    defaultPageSize: 10,
    containerHeight: { min: "40vh", max: "40vh" },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  filters: [],

  columns: [
    {
      accessor: "ACCT_TYPE",
      columnName: "Type",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 90,
      minWidth: 100,
      maxWidth: 180,
    },
    {
      accessor: "ACCT_CD",
      columnName: "AccountNo",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "YEAR_CD",
      columnName: "Year",
      sequence: 2,
      alignment: "right",
      componentType: "default",
      width: 100,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "WARRANT_NO",
      columnName: "WarrantNumber",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "TYPE_CD",
      columnName: "Dr.",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "DIVIDEND_AMOUNT",
      columnName: "DividendAmount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isTotalWithCurrency: true,
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "NO_OF_SHARE",
      columnName: "Shares",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "SHARE_AMOUNT",
      columnName: "SharesAmount",
      sequence: 5,
      alignment: "right",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 5,
      alignment: "right",
      componentType: "currency",
      currencyRefColumn: "CURRENCY_CD",
      isTotalWithCurrency: true,
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "DIVIDEND_RATE",
      columnName: "Rate",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "PAID",
      columnName: "Paid",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "PAID_DATE",
      columnName: "PaidDate",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "CREDIT_ACCOUNT",
      columnName: "CreditAccount",
      sequence: 5,
      alignment: "center",
      componentType: "default",
      width: 170,
      minWidth: 100,
      maxWidth: 250,
    },
  ],
};
export const ViewMasterMetaData = {
  form: {
    name: "ViewMasterMetaData",
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
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_CD",
      label: "BranchCode",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      type: "text",

      GridProps: { xs: 12, sm: 1.2, md: 1.2, lg: 1.2, xl: 1.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "AccountNo",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.5, md: 1.5, lg: 1.5, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUSTOMER_ID",
      label: "Id",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 1.4, md: 1.4, lg: 1.4, xl: 1.4 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "OP_DATE",
      label: "OpeningDate",
      placeholder: "",
      format: "dd/MM/yyyy",
      type: "text",
      fullWidth: true,
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["OpeningDateRequired"] }],
      },
      GridProps: { xs: 12, sm: 2.3, md: 2.3, lg: 2.3, xl: 2.3 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "JOINT1",
      label: "JointName",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "UNCL_BAL",
      label: "OpeningBalance",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },

      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "CONF_BAL",
      label: "ClosingBalance",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },

      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "ShadowBalance",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },

      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INST_RS",
      label: "NoOfShares",
      placeholder: "",
      isFieldFocused: true,
      required: true,
      type: "text",
      FormatProps: {
        allowNegative: false,
      },

      GridProps: { xs: 6, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "NOMI1",
      label: "Nominee",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.9, md: 3.9, lg: 3.9, xl: 3.9 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MODE_NM",
      label: "Mode Name",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CATEG_NM",
      label: "Category",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 3.4, md: 3.4, lg: 3.4, xl: 3.4 },
    },

    {
      render: {
        componentType: "divider",
      },
      dividerText: "Address",
      name: "Address",
      label: "Address",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "Address",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4.5, md: 4.5, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AREA_NM",
      label: "Area",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CITY_NM",
      label: "City",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PIN_CODE",
      label: "PinCode",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD2",
      label: "Address2",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 4.5, md: 4.5, lg: 4.5, xl: 4.5 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DIST_NM",
      label: "District",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE_NM",
      label: "State",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COUNTRY_NM",
      label: "Country",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "divider",
      },
      dividerText: "Contacts",
      name: "Contacts",
      label: "Contact",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT1",
      label: "PhoneO",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2.7, md: 2.7, lg: 2.7, xl: 2.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT4",
      label: "PhoneR",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2.7, md: 2.7, lg: 2.7, xl: 2.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT2",
      label: "MobileNo",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2.7, md: 2.7, lg: 2.7, xl: 2.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT3",
      label: "AlternatePhone",
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 2.7, md: 2.7, lg: 2.7, xl: 2.7 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ISSUED_BRANCH",
      label: "IssuedBranch",
      type: "text",
      fullWidth: true,
      required: true,

      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
  ],
};
