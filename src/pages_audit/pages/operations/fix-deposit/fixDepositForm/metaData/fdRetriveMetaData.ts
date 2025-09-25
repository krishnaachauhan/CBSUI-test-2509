import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../../api";
import { validateHOBranch } from "components/utilFunction/function";
import { GeneralAPI } from "registry/fns/functions";
let disableAcctField = false;

export const FDRetriveMetadata = {
  form: {
    name: "enterparameters",
    label: "EnterParameters",
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
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          const isHOBranch = await validateHOBranch(
            currentField,
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
          return {
            ACCT_NM: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        runPostValidationHookAlways: true,
        validationRun: "onChange",
        dependentFields: ["BRANCH_CD"],
        isFieldFocused: true,
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
              !dependentFieldsValues?.BRANCH_CD?.value
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
            } else if (
              dependentFieldsValues?.BRANCH_CD?.value &&
              currentField?.value
            ) {
              const reqParameters = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value ?? "",
                ACCT_TYPE: currentField?.value ?? "",
                SCREEN_REF: formState?.docCD ?? "",
              };
              disableAcctField = true;
              const postData = await API.getFDParaDetail(reqParameters);
              if (postData?.status === "999") {
                let btnName = await formState.MessageBox({
                  messageTitle: "ValidationFailed",
                  message: postData?.messageDetails?.length
                    ? postData?.messageDetails
                    : "Somethingwenttowrong",
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  return {
                    ACCT_TYPE: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
                    ACCT_CD: { value: "", ignoreUpdate: false },
                    ACCT_NM: { value: "" },
                  };
                }
              } else if (postData) {
                disableAcctField = false;
                formState.setDataOnFieldChange("GET_PARA_DATA", postData?.[0]);
                return {
                  DOUBLE_FAC: { value: postData?.[0]?.DOUBLE_FAC ?? "" },
                  TRAN_CD: { value: postData?.[0]?.DOUBLE_TRAN ?? "" },
                  ACCT_CD: {
                    value: "",
                    isFieldFocused: true,
                    ignoreUpdate: false,
                  },
                };
              }
            }
            return {
              ACCT_CD: { value: "", ignoreUpdate: false },
              ACCT_NM: { value: "" },
            };
          } catch (error: any) {
            const btn = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg ?? "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (btn === "Ok") {
              return {
                ACCT_TYPE: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                ACCT_CD: { value: "", ignoreUpdate: false },
                ACCT_NM: { value: "" },
              };
            }
          } finally {
            formState?.handleDisableButton(false);
          }
          return {};
        },
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD", "DOUBLE_FAC", "TRAN_CD"],
        runPostValidationHookAlways: true,
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
              currentField.value &&
              !dependentFieldsValues?.ACCT_TYPE?.value
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
            } else if (
              currentField?.value &&
              dependentFieldsValues?.BRANCH_CD?.value &&
              dependentFieldsValues?.ACCT_TYPE?.value
            ) {
              const reqParameters = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value ?? "",
                ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value ?? "",
                ACCT_CD: utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                ),
                SCREEN_REF: formState?.docCD ?? "",
                TRAN_CD: dependentFieldsValues?.TRAN_CD?.value ?? "",
                DOUBLE_FAC: dependentFieldsValues?.DOUBLE_FAC?.value ?? "",
              };
              const postData = await API.validateAcctDtl(reqParameters);

              if (postData.length) {
                formState.setDataOnFieldChange("ACCT_NO_DATA", postData?.[0]);
              }

              let returnVal;
              for (const obj of postData?.[0]?.MSG ?? []) {
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
                    buttonNames:
                      obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                    defFocusBtnName:
                      obj?.O_STATUS === "99" && obj?.O_COLUMN_NM === "FREEZE_AC"
                        ? "No"
                        : obj?.O_STATUS === "9" || obj?.O_STATUS === "999"
                        ? "Ok"
                        : "Yes",
                    icon:
                      obj?.O_STATUS === "999"
                        ? "ERROR"
                        : obj?.O_STATUS === "99"
                        ? "CONFIRM"
                        : obj?.O_STATUS === "9"
                        ? "WARNING"
                        : "INFO",
                  });
                  if (obj?.O_STATUS === "999") {
                    returnVal = "";
                    break;
                  } else if (obj?.O_STATUS === "99") {
                    if (
                      buttonName === "No" &&
                      obj?.O_COLUMN_NM !== "FREEZE_AC"
                    ) {
                      returnVal = "";
                      break;
                    } else if (
                      buttonName === "Yes" &&
                      obj?.O_COLUMN_NM === "FREEZE_AC"
                    ) {
                      try {
                        const freezeResponse = await GeneralAPI.doAccountFreeze(
                          {
                            ENT_COMP_CD: authState?.companyID ?? "",
                            ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                            COMP_CD: authState?.companyID ?? "",
                            BRANCH_CD:
                              dependentFieldsValues?.BRANCH_CD?.value ?? "",
                            ACCT_TYPE:
                              dependentFieldsValues?.ACCT_TYPE?.value ?? "",
                            ACCT_CD: utilFunction.getPadAccountNumber(
                              currentField?.value,
                              dependentFieldsValues?.ACCT_TYPE
                                ?.optionData?.[0] ?? ""
                            ),
                          }
                        );

                        if (freezeResponse?.error) {
                          await formState.MessageBox({
                            messageTitle: "Error",
                            message:
                              freezeResponse?.errorMessage ??
                              "Unknownerroroccured",
                            icon: "ERROR",
                            buttonNames: ["Ok"],
                          });
                        }
                      } catch (error: any) {
                        await formState.MessageBox({
                          messageTitle: "Error",
                          message: error?.error_msg ?? "Unknownerroroccured",
                          icon: "ERROR",
                          buttonNames: ["Ok"],
                        });
                      }
                    }
                  }
                } else if (obj?.O_STATUS === "0") {
                  returnVal = postData[0];
                  formState.setFocus();
                }
              }
              return {
                ACCT_CD:
                  returnVal !== ""
                    ? {
                        value: utilFunction.getPadAccountNumber(
                          currentField?.value,
                          dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ??
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
                ACCT_NM: {
                  value: returnVal?.ACCT_NM ?? "",
                },
                TRAN_BAL: {
                  value: returnVal?.TRAN_BAL ?? "",
                },
              };
            } else if (!currentField?.value) {
              return {
                ACCT_NM: { value: "" },
                TRAN_BAL: { value: "" },
              };
            }
            return {};
          } catch (error: any) {
            const btn = await formState.MessageBox({
              messageTitle: "Error",
              message: error?.error_msg || "Unknownerroroccured",
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (btn === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                ACCT_NM: { value: "" },
                TRAN_BAL: { value: "" },
              };
            }
          } finally {
            formState?.handleDisableButton(false);
          }
          return {};
        },
        isReadOnly(_, dependentFieldsValues, formState) {
          return Boolean(disableAcctField);
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 8, md: 8, lg: 8, xl: 8 },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Balance",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        sm: 4,
        md: 4,
        lg: 4,
        xl: 4,
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "DOUBLE_FAC",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_CD",
    },
  ],
};
