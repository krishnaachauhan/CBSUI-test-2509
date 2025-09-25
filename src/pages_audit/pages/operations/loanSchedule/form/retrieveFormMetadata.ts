import { utilFunction } from "@acuteinfo/common-base";
import { getAccCodeValidation, regenerateData } from "../api";

export const RetrievalFormMetaData = {
  form: {
    name: "retrieveFormMetadata",
    label: "Enter Parameter",
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
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        isReadOnly: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountTypeMetadata: {
        isFieldFocused: true,
        runPostValidationHookAlways: true,
        dependentFields: ["BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            BALANCE: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      },
      accountCodeMetadata: {
        autoComplete: "off",
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (
            currentField.value &&
            dependentFieldValues?.["ACCT_TYPE"]?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "Enter Account Type.",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });

            if (buttonName === "Ok") {
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
          } else if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                dependentFieldValues?.ACCT_TYPE?.optionData?.[0]
              ),
              SCREEN_REF: formState?.docCD ?? "",
              ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };
            formState.handleButtonDisable(true);
            const postData = await getAccCodeValidation(reqParameters);

            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.length; i++) {
              if (postData?.[i]?.O_STATUS === "999") {
                formState.handleButtonDisable(false);
                const { btnName, obj } = await getButtonName({
                  messageTitle: "ValidationFailed",
                  message: postData?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.[i]?.O_STATUS === "9") {
                formState.handleButtonDisable(false);
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: "Alert",
                    message: postData?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData?.[i];
              } else if (postData?.[i]?.O_STATUS === "99") {
                formState.handleButtonDisable(false);
                const { btnName, obj } = await getButtonName({
                  messageTitle: "Confirmation",
                  message: postData?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
                if (
                  btnName === "Yes" &&
                  postData?.[i]?.O_COLUMN_NM === "REGENERATE"
                ) {
                  const requestPara = {
                    COMP_CD: authState?.companyID ?? "",
                    BRANCH_CD: authState?.user?.branchCode ?? "",
                    ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value,
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.ACCT_TYPE?.optionData?.[0]
                    ),
                    LIMIT_AMOUNT: postData?.[i]?.LIMIT_AMOUNT ?? "",
                    INT_RATE: postData?.[i]?.INT_RATE ?? "",
                    INST_RS: postData?.[i]?.INST_RS ?? "",
                    INST_NO: postData?.[i]?.INST_NO ?? "",
                    INST_DUE_DT: postData?.[i]?.INST_DUE_DT ?? "",
                    DISBURSEMENT_DT: postData?.[i]?.DISBURSEMENT_DT ?? "",
                    INSTALLMENT_TYPE: postData?.[i]?.INSTALLMENT_TYPE ?? "",
                    INS_START_DT: postData?.[i]?.INS_START_DT ?? "",
                    TYPE_CD: postData?.[i]?.TYPE_CD ?? "",
                    SCREEN_REF: formState?.docCD,
                  };
                  const getApiData = await regenerateData(requestPara);
                  if (getApiData?.status === "999") {
                    const btnName = await formState.MessageBox({
                      messageTitle: "ValidationFailed",
                      message: getApiData?.messageDetails ?? "",
                      buttonNames: ["Ok"],
                      icon: "ERROR",
                    });
                    if (btnName === "Ok") {
                      formState.CloseMessageBox();
                      return {
                        ACCT_CD: {
                          value: "",
                          ignoreUpdate: true,
                          isFieldFocused: true,
                        },
                        ACCT_NM: { value: "" },
                        BALANCE: { value: "" },
                      };
                    }
                  } else if (getApiData?.status === "0") {
                    formState.CloseMessageBox();
                  }
                } else {
                  formState.CloseMessageBox();
                }
              } else if (postData?.[i]?.O_STATUS === "0") {
                formState.handleButtonDisable(false);
                if (btn99 !== "No") {
                  returnVal = postData?.[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;

            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.ACCT_TYPE?.optionData?.[0]
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
              BALANCE: {
                value: returnVal?.BALANCE ?? "",
              },
              ALLOW_RESCHEDULE: {
                value: returnVal?.ALLOW_RESCHEDULE ?? "",
              },
              ALLOW_REGERATE: {
                value: returnVal?.ALLOW_REGERATE ?? "",
              },
            };
          } else if (!currentField?.value) {
            formState.handleButtonDisable(false);
            return {
              ACCT_NM: { value: "" },
              BALANCE: { value: "" },
              ALLOW_RESCHEDULE: { value: "" },
              ALLOW_REGERATE: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "BALANCE",
      label: "Balance",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ALLOW_RESCHEDULE",
      label: "",
      placeholder: "",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ALLOW_REGERATE",
      label: "",
      placeholder: "",
    },
  ],
};
