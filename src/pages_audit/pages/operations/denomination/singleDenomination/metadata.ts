import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../api";
import { GeneralAPI } from "registry/fns/functions";
import * as commonAPI from "../api";
import { format, isValid, parse } from "date-fns";
import i18n from "components/multiLanguage/languagesConfiguration";
import {
  getPadAccountNumber,
  validateHOBranch,
} from "components/utilFunction/function";

export const denoTableMetadataTotal: any = {
  form: {
    refID: 1667,
    name: "singleDenoRowTotal",
    label: "SingleDenomination",
    resetFieldOnUnmount: false,
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
        componentType: "arrayField",
      },
      name: "singleDenoRow",
      isRemoveButton: true,
      displayCountName: "row",
      isScreenStyle: true,
      addRowFn: (data) => {
        const rowsArray = Array.isArray(data?.singleDenoRow)
          ? data?.singleDenoRow
          : [];
        if (rowsArray?.length > 0) {
          const row = rowsArray[rowsArray?.length - 1];
          if (Boolean(row?.TRX)) {
            if (Boolean(row?.TRX === "1")) {
              if (
                Boolean(row?.BRANCH_CD) &&
                Boolean(row?.ACCT_TYPE) &&
                Boolean(row?.ACCT_CD) &&
                Boolean(row?.TRX) &&
                Boolean(row?.SDC) &&
                Boolean(row?.REMARK) &&
                Boolean(row?.RECEIPT)
              ) {
                return true;
              }
              return false;
            } else if (Boolean(row?.TRX === "4")) {
              if (
                Boolean(row?.BRANCH_CD) &&
                Boolean(row?.ACCT_TYPE) &&
                Boolean(row?.ACCT_CD) &&
                Boolean(row?.TRX) &&
                Boolean(row?.TOKEN) &&
                Boolean(row?.SDC) &&
                Boolean(row?.REMARK) &&
                Boolean(row?.CHQNO) &&
                Boolean(row?.CHQ_DT) &&
                Boolean(row?.PAYMENT)
              ) {
                return true;
              }
              return false;
            }
            return false;
          }
          return false;
        }
        return false;
      },
      disagreeButtonName: "No",
      agreeButtonName: "Yes",
      isDivider: false,
      errorTitle: "Are you Sure you want to delete this row?",
      removeRowFn: "deleteFormArrayFieldData",
      // changeRowOrder: true,
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      _fields: [
        {
          render: { componentType: "_accountNumber" },
          branchCodeMetadata: {
            postValidationSetCrossFieldValues: async (
              field,
              formState,
              authState,
              dependentFieldsValues
            ) => {
              if (formState?.isSubmitting) return {};
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
              formState?.setCardDetails([]);
              formState?.setTabsDetails([]);
              return {
                ACCT_TYPE: { value: "", ignoreUpdate: false },
                ACCT_CD: { value: "", ignoreUpdate: false },
                TRX: { value: "", ignoreUpdate: false },
                CHQNO: { value: "", ignoreUpdate: false },
                CHQ_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
                RECEIPT: { value: "", ignoreUpdate: false },
                PAYMENT: { value: "", ignoreUpdate: false },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
                TYPE_CD_FROM_ACCT: {
                  value: "",
                  ingoreUpdate: false,
                },
              };
            },
            GridProps: {
              xs: 6,
              sm: 3.5,
              md: 3,
              lg: 1.5,
              xl: 1.5,
            },
          },
          accountTypeMetadata: {
            dependentFields: ["BRANCH_CD"],
            isFieldFocused: true,
            postValidationSetCrossFieldValues: async (
              field,
              formState,
              authState,
              dependentFieldValues
            ) => {
              if (formState?.isSubmitting) return {};

              if (
                Boolean(field?.value) &&
                Boolean(
                  dependentFieldValues?.["singleDenoRow.BRANCH_CD"]?.value
                )
              ) {
                const reqPara = {
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD:
                    dependentFieldValues?.["singleDenoRow.BRANCH_CD"]?.value ??
                    "",
                  ACCT_TYPE: field?.value ?? "",
                  SCREEN_REF: formState?.docCD ?? "",
                };
                const validPara = await API?.getBranch_TypeValidate(reqPara);

                let btn99, returnVal;
                for (let i = 0; i < validPara?.length; i++) {
                  if (validPara[i]?.O_STATUS === "999") {
                    await formState.MessageBox({
                      messageTitle:
                        validPara[i]?.O_MSG_TITLE ?? "ValidationFailed",
                      message: validPara[i]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    returnVal = "";
                  } else if (validPara[i]?.O_STATUS === "99") {
                    const btnName = await formState.MessageBox({
                      messageTitle: validPara[i]?.O_MSG_TITLE ?? "Confirmation",
                      message: validPara[i]?.O_MESSAGE,
                      buttonNames: ["Yes", "No"],
                      icon: "CONFIRM",
                    });
                    if (btnName === "No") {
                      returnVal = "";
                      break;
                    }
                  } else if (validPara[i]?.O_STATUS === "9") {
                    await formState.MessageBox({
                      messageTitle: validPara[i]?.O_MSG_TITLE ?? "Alert",
                      message: validPara[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  } else if (validPara[i]?.O_STATUS === "0") {
                    if (btn99 !== "No") {
                      returnVal = validPara[i];
                      delete reqPara?.SCREEN_REF;
                      formState?.fetchTabsData({
                        cacheId: reqPara,
                        reqData: reqPara,
                      });
                    } else {
                      returnVal = "";
                    }
                  }
                }
                formState?.setCardDetails([]);

                return {
                  ACCT_TYPE:
                    returnVal !== ""
                      ? {
                          value: field?.value ?? "",
                          isFieldFocused: false,
                          ignoreUpdate: true,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: false,
                        },
                  ACCT_CD: { value: "", ignoreUpdate: false },
                  TRX: { value: "", ignoreUpdate: false },
                  CHQNO: { value: "", ignoreUpdate: false },
                  CHQ_DT: {
                    value: authState?.workingDate ?? "",
                    ignoreUpdate: true,
                  },
                  RECEIPT: { value: "", ignoreUpdate: false },
                  PAYMENT: { value: "", ignoreUpdate: false },
                  PAYMENT_VALID: { value: "", ignoreUpdate: false },
                  RECEIPT_VALID: { value: "", ignoreUpdate: false },
                  TYPE_CD_FROM_ACCT: {
                    value: "",
                    ingoreUpdate: false,
                  },
                };
              } else if (!field?.value) {
                formState?.setCardDetails([]);
                formState?.setTabsDetails([]);
                return {
                  ACCT_CD: { value: "", ignoreUpdate: false },
                  TRX: { value: "", ignoreUpdate: false },
                  CHQNO: { value: "", ignoreUpdate: false },
                  CHQ_DT: {
                    value: authState?.workingDate ?? "",
                    ignoreUpdate: true,
                  },
                  RECEIPT: { value: "", ignoreUpdate: false },
                  PAYMENT: { value: "", ignoreUpdate: false },
                  PAYMENT_VALID: { value: "", ignoreUpdate: false },
                  RECEIPT_VALID: { value: "", ignoreUpdate: false },
                  TYPE_CD_FROM_ACCT: {
                    value: "",
                    ingoreUpdate: false,
                  },
                };
              }
              formState?.setCardDetails([]);
              return {
                ACCT_CD: { value: "", ignoreUpdate: false },
                TRX: { value: "", ignoreUpdate: false },
                CHQNO: { value: "", ignoreUpdate: false },
                CHQ_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
                RECEIPT: { value: "", ignoreUpdate: false },
                PAYMENT: { value: "", ignoreUpdate: false },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
                TYPE_CD_FROM_ACCT: {
                  value: "",
                  ingoreUpdate: false,
                },
              };
            },
            GridProps: {
              xs: 6,
              sm: 3.5,
              md: 3,
              lg: 1.5,
              xl: 1.5,
            },
          },
          accountCodeMetadata: {
            dependentFields: ["BRANCH_CD", "ACCT_TYPE"],
            postValidationSetCrossFieldValues: async (
              currentField,
              formState,
              authState,
              dependentFieldValues
            ) => {
              const acctType =
                dependentFieldValues?.["singleDenoRow.ACCT_TYPE"]?.value ?? "";
              const branchCode =
                dependentFieldValues?.["singleDenoRow.BRANCH_CD"]?.value ?? "";
              const typeOptionData =
                dependentFieldValues?.["singleDenoRow.ACCT_TYPE"]
                  ?.optionData?.[0] ?? {};
              let btn99,
                returnVal,
                shouldCallCarousalCards = false;

              if (formState?.isSubmitting) return {};

              if (Boolean(currentField?.value) && !Boolean(acctType)) {
                let buttonName = await formState?.MessageBox({
                  messageTitle: "Alert",
                  message: "EnterAccountType",
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
                      ignoreUpdate: false,
                    },
                    TYPE_CD_FROM_ACCT: {
                      value: "",
                      ingoreUpdate: false,
                    },
                  };
                }
              } else if (currentField?.value && branchCode && acctType) {
                const reqParameters = {
                  BRANCH_CD: branchCode,
                  COMP_CD: authState?.companyID ?? "",
                  ACCT_TYPE: acctType,
                  ACCT_CD:
                    getPadAccountNumber(currentField?.value, typeOptionData) ??
                    "",
                  SCREEN_REF: formState?.docCD ?? "",
                };
                const postData = await GeneralAPI.getAccNoValidation(
                  reqParameters
                );

                for (let i = 0; i < postData?.MSG.length; i++) {
                  if (postData?.MSG[i]?.O_STATUS === "999") {
                    const btnName = await formState.MessageBox({
                      messageTitle:
                        postData?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
                      message: postData?.MSG[i]?.O_MESSAGE,
                      icon: "ERROR",
                    });
                    if (btnName === "Ok") {
                      if (postData?.MSG[i]?.O_COLUMN_NM === "NOTFOUND") {
                        shouldCallCarousalCards = true;
                        returnVal = "";
                      } else {
                        shouldCallCarousalCards = false;
                        returnVal = "";
                      }
                    }
                  } else if (postData?.MSG[i]?.O_STATUS === "99") {
                    const btnName = await formState.MessageBox({
                      messageTitle:
                        postData?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
                      message: postData?.MSG[i]?.O_MESSAGE,
                      buttonNames: ["Yes", "No"],
                      icon: "CONFIRM",
                      loadingBtnName: ["Yes"],
                      defFocusBtnName:
                        postData?.MSG[i]?.O_COLUMN_NM === "FREEZE_AC"
                          ? "No"
                          : "Yes",
                    });
                    if (postData?.MSG[i]?.O_COLUMN_NM !== "FREEZE_AC")
                      btn99 = btnName;
                    if (btnName === "No") {
                      returnVal = "";
                      if (postData?.MSG[i]?.O_COLUMN_NM !== "FREEZE_AC") break;
                    } else if (btnName === "Yes") {
                      if (postData?.MSG[i]?.O_COLUMN_NM === "FREEZE_AC") {
                        await new Promise<void>((resolve) => {
                          const postData = GeneralAPI.doAccountFreeze({
                            ENT_COMP_CD: authState?.companyID ?? "",
                            ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                            BRANCH_CD: branchCode,
                            COMP_CD: authState?.companyID,
                            ACCT_TYPE: acctType,
                            ACCT_CD: utilFunction.getPadAccountNumber(
                              currentField?.value,
                              typeOptionData
                            ),
                          }).then(
                            (data: any) => {
                              resolve();
                            },
                            (error: any) => {
                              formState
                                ?.MessageBox({
                                  messageTitle: "Alert",
                                  message: error?.error_msg ?? "Error",
                                  icon: "ERROR",
                                })
                                .then(() => {
                                  resolve();
                                });
                            }
                          );
                        });
                      }
                    }
                  } else if (postData?.MSG[i]?.O_STATUS === "9") {
                    const btnName = await formState.MessageBox({
                      messageTitle: postData?.MSG[i]?.O_MSG_TITLE ?? "Alert",
                      message: postData?.MSG[i]?.O_MESSAGE,
                      icon: "WARNING",
                    });
                  } else if (postData?.MSG[i]?.O_STATUS === "0") {
                    if (btn99 !== "No") {
                      returnVal = postData;
                      formState?.CloseMessageBox();
                    } else {
                      returnVal = "";
                      formState?.CloseMessageBox();
                    }
                  }
                }

                if (!Boolean(shouldCallCarousalCards)) {
                  const carousalCardDataReqParameters = {
                    COMP_CD: authState?.companyID,
                    ACCT_TYPE: acctType,
                    BRANCH_CD: branchCode,
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      typeOptionData
                    ),
                    PARENT_TYPE: typeOptionData?.[0]?.PARENT_TYPE ?? "",
                  };

                  const carousalCardData = await commonAPI.getCarousalCards({
                    reqData: carousalCardDataReqParameters,
                  });
                  if (carousalCardData?.length > 0) {
                    formState?.handleCardDetails(carousalCardData);
                  }

                  formState?.setCardTabsReq({
                    COMP_CD: authState?.companyID ?? "",
                    ACCT_TYPE: acctType ?? "",
                    ACCT_CD:
                      utilFunction?.getPadAccountNumber(
                        currentField?.value,
                        typeOptionData
                      ) ?? "",
                    PARENT_TYPE: typeOptionData?.[0]?.PARENT_TYPE ?? "",
                    PARENT_CODE: typeOptionData?.[0]?.PARENT_CODE ?? "",
                    BRANCH_CD: branchCode ?? "",
                    SCREEN_REF: formState?.docCD ?? "",
                    NPA_CD: returnVal?.NPA_CD ?? "",
                  });
                } else if (Boolean(shouldCallCarousalCards)) {
                  formState?.handleCardDetails(null);
                  formState?.setCardTabsReq({});
                }
                return {
                  ACCT_CD:
                    returnVal !== ""
                      ? {
                          value: utilFunction.getPadAccountNumber(
                            currentField?.value,
                            typeOptionData
                          ),
                          isFieldFocused: false,
                          ignoreUpdate: true,
                        }
                      : {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: false,
                        },
                  TRX: { value: "", ignoreUpdate: false },
                  CHQNO: { value: "", ignoreUpdate: false },
                  CHQ_DT: {
                    value: authState?.workingDate ?? "",
                    ignoreUpdate: true,
                  },
                  RECEIPT: { value: "", ignoreUpdate: false },
                  PAYMENT: { value: "", ignoreUpdate: false },
                  PAYMENT_VALID: { value: "", ignoreUpdate: false },
                  RECEIPT_VALID: { value: "", ignoreUpdate: false },
                  TYPE_CD_FROM_ACCT: {
                    value: returnVal?.TYPE_CD ?? "",
                    ingoreUpdate: false,
                  },
                };
              } else if (!currentField?.value) {
                formState?.setCardDetails([]);
                return {
                  TRX: { value: "", ignoreUpdate: false },
                  CHQNO: { value: "", ignoreUpdate: false },
                  CHQ_DT: {
                    value: authState?.workingDate ?? "",
                    ignoreUpdate: true,
                  },
                  RECEIPT: { value: "", ignoreUpdate: false },
                  PAYMENT: { value: "", ignoreUpdate: false },
                  PAYMENT_VALID: { value: "", ignoreUpdate: false },
                  RECEIPT_VALID: { value: "", ignoreUpdate: false },
                  TYPE_CD_FROM_ACCT: {
                    value: "",
                    ingoreUpdate: false,
                  },
                };
              }
            },
            GridProps: {
              xs: 6,
              sm: 5,
              md: 3,
              lg: 2,
              xl: 1.5,
            },
            schemaValidation: {},
            validate: (currentField, dependentFields, formState) => {
              if (!currentField?.value) {
                formState?.setCardDetails([]);
                return "Account code is required";
              }
            },
          },
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "TYPE_CD_FROM_ACCT",
          label: "type code",
          placeholder: "",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "CALL_DT_API",
          label: "Date api flag",
          placeholder: "",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "RECEIPT_VALID",
          label: "Receipt Valid",
          placeholder: "",
        },
        {
          render: {
            componentType: "hidden",
          },
          name: "PAYMENT_VALID",
          label: "Payment valid",
          placeholder: "",
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "TRX",
          label: "TRX",
          placeholder: "TRX",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["TRX is required"] }],
          },
          options: API.getTRXList,
          _optionKey: "TRXdata",
          dependentFields: [
            "BRANCH_CD",
            "ACCT_TYPE",
            "ACCT_CD",
            "TYPE_CD_FROM_ACCT",
          ],
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const branchCode =
              dependentFieldsValues?.["singleDenoRow.BRANCH_CD"]?.value ?? "";
            const acctType =
              dependentFieldsValues?.["singleDenoRow.ACCT_TYPE"]?.value ?? "";
            const acctCode =
              dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.value ?? "";
            const acctTypeCode =
              dependentFieldsValues?.["singleDenoRow.TYPE_CD_FROM_ACCT"]
                ?.value ?? "";
            const sdcValue = field?.value === "1" ? "1   " : "4   ";

            if (
              !dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.error &&
              Boolean(branchCode) &&
              Boolean(field?.value) &&
              Boolean(acctType) &&
              Boolean(acctCode)
            ) {
              const cardData = await formState?.getCardColumnValue();
              const apiReq = {
                A_ENT_COMP_CD: authState?.companyID ?? "",
                A_ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                A_COMP_CD: authState?.companyID ?? "",
                A_BRANCH_CD: branchCode ?? "",
                A_ACCT_TYPE: acctType ?? "",
                A_ACCT_CD: acctCode ?? "",
                A_INST_DUE_DT: isValid(
                  utilFunction.getParsedDate(cardData?.INST_DUE_DT)
                )
                  ? format(
                      utilFunction.getParsedDate(cardData?.INST_DUE_DT),
                      "dd/MMM/yyyy"
                    )
                  : "",
                A_TYPE_CD: field?.value ?? "",
                A_AC_TYPE_CD: acctTypeCode ?? "",
                A_GD_DATE: authState?.workingDate ?? "",
                A_SCREEN_REF: formState?.docCD,
                A_LANG: i18n.resolvedLanguage ?? "",
                A_USER: authState?.user?.id ?? "",
                A_USER_LEVEL: authState?.role ?? "",
                PREV_TYPE_CD: "",
                PREV_SCROLL: "",
                PARA_24: "",
                SCROLL_TALLY: "Y",
              };

              const trxnValidate: any = await API?.getTrxValidate(apiReq);

              let btn99, returnVal;
              for (let i = 0; i < trxnValidate?.length; i++) {
                if (trxnValidate[i]?.O_STATUS === "999") {
                  await formState.MessageBox({
                    messageTitle:
                      trxnValidate[i]?.O_MSG_TITLE ?? "ValidationFailed",
                    message: trxnValidate[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (trxnValidate[i]?.O_STATUS === "99") {
                  const btnName = await formState.MessageBox({
                    messageTitle:
                      trxnValidate[i]?.O_MSG_TITLE ?? "Confirmation",
                    message: trxnValidate[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "No") {
                    returnVal = "";
                    break;
                  }
                } else if (trxnValidate[i]?.O_STATUS === "9") {
                  await formState.MessageBox({
                    messageTitle: trxnValidate[i]?.O_MSG_TITLE ?? "Alert",
                    message: trxnValidate[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                } else if (trxnValidate[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = trxnValidate[i];
                  } else {
                    returnVal = "";
                  }
                }
              }

              return {
                TRX:
                  returnVal !== ""
                    ? {
                        value: field?.value ?? "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                TOKEN: { value: "", ignoreUpdate: false },
                SDC: { value: sdcValue ?? "", ignoreUpdate: false },
                REMARK: {
                  value: field?.value === "4" ? "TO CASH-" : "BY CASH-",
                  ignoreUpdate: false,
                },
                CHQ_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
                CHQNO: { value: "", ignoreUpdate: false },
                RECEIPT: { value: "", ignoreUpdate: false },
                PAYMENT: { value: "", ignoreUpdate: false },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            } else if (!Boolean(field?.value)) {
              return {
                TOKEN: { value: "", ignoreUpdate: false },
                SDC: { value: sdcValue ?? "", ignoreUpdate: false },
                CHQ_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
                CHQNO: { value: "", ignoreUpdate: false },
                RECEIPT: { value: "", ignoreUpdate: false },
                PAYMENT: { value: "", ignoreUpdate: false },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            }
          },
          GridProps: {
            xs: 6,
            sm: 4,
            md: 2,
            lg: 1,
            xl: 1,
          },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "TOKEN",
          label: "Token",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Token is required"] }],
          },
          placeholder: "Token",
          type: "text",
          GridProps: {
            xs: 6,
            sm: 4,
            md: 2,
            lg: 1,
            xl: 1.5,
          },
          FormatProps: {
            isAllowed: (values) => {
              if (values?.floatValue === 0) {
                return false;
              }
              if (values?.formattedValue?.includes(".")) {
                return false;
              }
              if (values?.value?.length > 4) {
                return false;
              }
              return true;
            },
          },
          dependentFields: [
            "TRX",
            "BRANCH_CD",
            "ACCT_TYPE",
            "ACCT_CD",
            "PAYMENT",
          ],
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (
              !dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.error &&
              Boolean(
                dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.value
              ) &&
              Boolean(
                dependentFieldsValues?.["singleDenoRow.BRANCH_CD"]?.value
              ) &&
              Boolean(
                dependentFieldsValues?.["singleDenoRow.ACCT_TYPE"]?.value
              ) &&
              Boolean(field?.value) &&
              !isNaN(field?.value)
            ) {
              const apiRequest = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD:
                  dependentFieldsValues?.["singleDenoRow.BRANCH_CD"]?.value ??
                  "",
                ACCT_TYPE:
                  dependentFieldsValues?.["singleDenoRow.ACCT_TYPE"]?.value ??
                  "",
                ACCT_CD:
                  dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.value ?? "",
                ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                SCROLL1: field?.value ?? "",
                TYPE_CD: dependentFieldsValues?.["singleDenoRow.TRX"]?.value,
                AMOUNT: dependentFieldsValues?.["singleDenoRow.PAYMENT"]?.value,
                WORKING_DATE: authState?.workingDate ?? "",
                USERNAME: authState?.user?.name ?? "",
                USERROLE: authState?.role ?? "",
                DOC_CD: formState?.docCD,
              };
              const tokenValidate: any = await GeneralAPI?.validateTokenScroll(
                apiRequest
              );

              let btn99, returnVal;
              for (let i = 0; i < tokenValidate?.length; i++) {
                if (tokenValidate[i]?.O_STATUS === "999") {
                  await formState.MessageBox({
                    messageTitle:
                      tokenValidate[i]?.O_MSG_TITLE ?? "ValidationFailed",
                    message: tokenValidate[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (tokenValidate[i]?.O_STATUS === "99") {
                  const btnName = await formState.MessageBox({
                    messageTitle:
                      tokenValidate[i]?.O_MSG_TITLE ?? "Confirmation",
                    message: tokenValidate[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "No") {
                    returnVal = "";
                    break;
                  }
                } else if (tokenValidate[i]?.O_STATUS === "9") {
                  await formState.MessageBox({
                    messageTitle: tokenValidate[i]?.O_MSG_TITLE ?? "Alert",
                    message: tokenValidate[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                } else if (tokenValidate[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = tokenValidate[i];
                  } else {
                    returnVal = "";
                  }
                }
              }

              return {
                TOKEN:
                  returnVal !== ""
                    ? {
                        value: field?.value ?? "",
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
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.["singleDenoRow.TRX"]?.value === "4") {
              return false;
            } else {
              return true;
            }
          },
        },
        {
          render: {
            componentType: "autocomplete",
          },
          name: "SDC",
          label: "SDC",
          placeholder: "SDC",
          defaultValueKey: "defSdc",
          defaultValue: "1   ",
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["SDC is required"] }],
          },
          options: API.getSDCList,
          _optionsKey: "getSDCList",
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (formState?.fetchParameter?.[0]?.SET_REMARKS === "N") {
              return {
                REMARK: {
                  value: field?.optionData?.[0]?.defRemark ?? "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          },
          GridProps: { xs: 6, sm: 4, md: 3, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARK",
          label: "Remarks",
          placeholder: "Remarks",
          maxLength: 200,
          required: true,
          defaultValue: "BY CASH -",
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Remark is required"] }],
          },
          GridProps: { xs: 6, sm: 4, md: 4, lg: 3, xl: 3 },
        },
        {
          render: {
            componentType: "numberFormat",
          },
          name: "CHQNO",
          label: "Chq.No",
          placeholder: "Chq.No",
          GridProps: { xs: 6, sm: 4, md: 2, lg: 1.5, xl: 1 },
          dependentFields: [
            "TRX",
            "BRANCH_CD",
            "ACCT_TYPE",
            "ACCT_CD",
            "TYPE_CD_FROM_ACCT",
          ],
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Cheque No. is required"] }],
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};

            const chequeNo = field?.value;
            const branchCd =
              dependentFieldValues?.["singleDenoRow.BRANCH_CD"]?.value;
            const acctCd = utilFunction?.getPadAccountNumber(
              dependentFieldValues?.["singleDenoRow.ACCT_CD"]?.value,
              dependentFieldValues?.["singleDenoRow.ACCT_TYPE"]?.optionData?.[0]
            );
            const acctyType =
              dependentFieldValues?.["singleDenoRow.ACCT_TYPE"]?.value;

            if (chequeNo && branchCd && acctyType && acctCd) {
              const reqParameters = {
                BRANCH_CD: branchCd,
                ACCT_TYPE: acctyType,
                ACCT_CD: acctCd,
                CHEQUE_NO: chequeNo,
                TYPE_CD:
                  dependentFieldValues?.["singleDenoRow.TYPE_CD_FROM_ACCT"]
                    ?.value,
                SCREEN_REF: formState?.docCD,
              };

              const apiResponse = await API?.getChqValidation(reqParameters);

              let btn99, returnVal;
              for (let i = 0; i < apiResponse?.length; i++) {
                if (apiResponse[i]?.O_STATUS === "999") {
                  await formState.MessageBox({
                    messageTitle:
                      apiResponse[i]?.O_MSG_TITLE ?? "ValidationFailed",
                    message: apiResponse[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (apiResponse[i]?.O_STATUS === "99") {
                  const btnName = await formState.MessageBox({
                    messageTitle: apiResponse[i]?.O_MSG_TITLE ?? "Confirmation",
                    message: apiResponse[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "No") {
                    returnVal = "";
                    break;
                  }
                } else if (apiResponse[i]?.O_STATUS === "9") {
                  await formState.MessageBox({
                    messageTitle: apiResponse[i]?.O_MSG_TITLE ?? "Alert",
                    message: apiResponse[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                } else if (apiResponse[i]?.O_STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = apiResponse[i];
                  } else {
                    returnVal = "";
                  }
                }
              }

              return {
                CHQNO:
                  returnVal !== ""
                    ? {
                        value: field?.value ?? "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                CALL_DT_API:
                  returnVal !== ""
                    ? {
                        value: "Y",
                        isFieldFocused: false,
                        ignoreUpdate: false,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                CHQ_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
                RECEIPT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            } else if (!Boolean(field?.value)) {
              return {
                CHQ_DT: {
                  value: authState?.workingDate ?? "",
                  ignoreUpdate: true,
                },
                RECEIPT: {
                  value: "",
                  ignoreUpdate: false,
                },
                CALL_DT_API: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            }
          },
          FormatProps: {
            isAllowed: (values) => {
              if (values?.formattedValue?.includes(".")) {
                return false;
              }
              if (values?.value?.length > 10) {
                return false;
              }
              return true;
            },
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.["singleDenoRow.TRX"]?.value === "4") {
              return false;
            } else {
              return true;
            }
          },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CHQ_DT",
          isWorkingDate: true,
          label: "Chq.Date",
          placeholder: "Chq.D",
          dependentFields: [
            "TRX",
            "CHQNO",
            "BRANCH_CD",
            "RECEIPT_VALID",
            "CALL_DT_API",
          ],
          required: true,
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Cheque Date is required"] }],
          },
          validate: (value) => {
            if (!isValid(value.value)) {
              return "invalid";
            }
            return "";
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const branchCode =
              dependentFieldsValues?.["singleDenoRow.BRANCH_CD"]?.value ?? "";
            const chequeNo =
              dependentFieldsValues?.["singleDenoRow.CHQNO"]?.value ?? "";
            const typeCd =
              dependentFieldsValues?.["singleDenoRow.TRX"]?.value ?? "";
            const chqNoValid =
              dependentFieldsValues?.["singleDenoRow.CALL_DT_API"]?.value ?? "";
            if (
              !dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.error &&
              Boolean(branchCode) &&
              Boolean(field?.value) &&
              Boolean(chequeNo) &&
              Boolean(chqNoValid === "Y")
            ) {
              const apiRequest = {
                BRANCH_CD: branchCode ?? "",
                TYPE_CD: typeCd ?? "",
                CHEQUE_NO: chequeNo ?? "",
                CHEQUE_DT: field?.value ?? "",
              };
              const chequeDateValidate: any = await API?.getChqDateValidation(
                apiRequest
              );
              let btn99, returnVal;
              for (let i = 0; i < chequeDateValidate?.length; i++) {
                if (chequeDateValidate[i]?.STATUS === "999") {
                  await formState.MessageBox({
                    messageTitle:
                      chequeDateValidate[i]?.O_MSG_TITLE ?? "ValidationFailed",
                    message: chequeDateValidate[i]?.MESSAGE1,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (chequeDateValidate[i]?.STATUS === "99") {
                  const btnName = await formState.MessageBox({
                    messageTitle:
                      chequeDateValidate[i]?.O_MSG_TITLE ?? "Confirmation",
                    message: chequeDateValidate[i]?.MESSAGE1,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "No") {
                    returnVal = "";
                    break;
                  }
                } else if (chequeDateValidate[i]?.STATUS === "9") {
                  await formState.MessageBox({
                    messageTitle: chequeDateValidate[i]?.O_MSG_TITLE ?? "Alert",
                    message: chequeDateValidate[i]?.MESSAGE1,
                    icon: "WARNING",
                  });
                } else if (chequeDateValidate[i]?.STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = chequeDateValidate[i];
                  } else {
                    returnVal = "";
                  }
                }
              }

              return {
                CHQ_DT:
                  returnVal !== ""
                    ? {
                        value: field?.value ?? "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                RECEIPT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            } else if (!Boolean(field?.value)) {
              return {
                RECEIPT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT: {
                  value: "",
                  ignoreUpdate: false,
                },
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            }
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.["singleDenoRow.TRX"]?.value === "4") {
              return false;
            } else {
              return true;
            }
          },
          GridProps: { xs: 6, sm: 4, md: 3, lg: 2, xl: 2 },
        },

        {
          render: {
            componentType: "amountField",
          },
          name: "RECEIPT",
          label: "Receipt",
          placeholder: "Receipt",
          required: true,
          maxLength: 13,
          FormatProps: {
            allowNegative: false,
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Receipt Is Required"] }],
          },
          dependentFields: [
            "ACCT_CD",
            "BRANCH_CD",
            "ACCT_TYPE",
            "TRX",
            "singleDenoRow",
            "CHQNO",
            "TOKEN",
          ],
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const branchCode =
              dependentFieldsValues?.["singleDenoRow.BRANCH_CD"]?.value ?? "";
            const acctType =
              dependentFieldsValues?.["singleDenoRow.ACCT_TYPE"]?.value ?? "";
            const acctCode =
              dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.value ?? "";
            const typeCode =
              dependentFieldsValues?.["singleDenoRow.TRX"]?.value ?? "";
            const chequeNo =
              dependentFieldsValues?.["singleDenoRow.CHQNO"]?.value ?? "";
            const tokenNo =
              dependentFieldsValues?.["singleDenoRow.TOKEN"]?.value ?? "";
            if (
              !dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.error &&
              Boolean(acctCode) &&
              Boolean(branchCode) &&
              Boolean(acctType) &&
              Boolean(field?.value) &&
              Number(field?.value) !== 0
            ) {
              const cardData = await formState?.getCardColumnValue();
              const apiRequest = {
                BRANCH_CD: branchCode ?? "",
                ACCT_TYPE: acctType ?? "",
                ACCT_CD: acctCode ?? "",
                TYPE_CD: typeCode ?? "",
                COMP_CD: authState?.companyID ?? "",
                CHEQUE_NO: chequeNo ?? "",
                AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "",
                SHADOW_CL: cardData?.SHADOW_CLEAR ?? "",
                HOLD_BAL: cardData?.HOLD_BAL ?? "",
                LEAN_AMT: cardData?.LIEN_AMT ?? "",
                AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "",
                MIN_BALANCE: cardData?.MIN_BALANCE ?? "",
                CONF_BAL: cardData?.CONF_BAL ?? "",
                TRAN_BAL: cardData?.TRAN_BAL ?? "",
                UNCL_BAL: cardData?.UNCL_BAL ?? "",
                LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "",
                DRAWING_POWER: cardData?.DRAWING_POWER ?? "",
                AMOUNT: field?.value ?? "",
                OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "",
                OP_DATE: cardData?.OP_DATE ?? "",
                INST_NO: cardData?.INST_NO ?? "",
                INST_RS: cardData?.INST_RS ?? "",
                PENDING_AMOUNT: cardData?.PENDING_AMOUNT ?? "",
                STATUS: cardData?.STATUS ?? "",
                TYPE: "C",
                SCREEN_REF: formState?.docCD ?? "",
                TRAN_CD: "",
                SCROLL1: Boolean(tokenNo) ? tokenNo : "",
              };
              const amountValidate: any = await API?.getAmountValidation(
                apiRequest
              );

              let btn99, returnVal;
              for (let i = 0; i < amountValidate?.length; i++) {
                if (amountValidate[i]?.O_STATUS === "999") {
                  await formState.MessageBox({
                    messageTitle:
                      amountValidate[i]?.O_MSG_TITLE ?? "ValidationFailed",
                    message: amountValidate[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (amountValidate[i]?.O_STATUS === "99") {
                  const btnName = await formState.MessageBox({
                    messageTitle:
                      amountValidate[i]?.O_MSG_TITLE ?? "Confirmation",
                    message: amountValidate[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "No") {
                    returnVal = "";
                    break;
                  }
                } else if (amountValidate[i]?.O_STATUS === "9") {
                  await formState.MessageBox({
                    messageTitle: amountValidate[i]?.O_MSG_TITLE ?? "Alert",
                    message: amountValidate[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                } else if (amountValidate[i]?.STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = amountValidate[i];
                  } else {
                    returnVal = "";
                  }
                }
              }
              return {
                RECEIPT:
                  returnVal !== ""
                    ? {
                        value: field?.value ?? "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                RECEIPT_VALID: { value: "ENABLE", ignoreUpdate: false },
              };
            } else if (!Boolean(field?.value)) {
              return {
                RECEIPT_VALID: { value: "", ignoreUpdate: false },
              };
            }
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.["singleDenoRow.TRX"]?.value !== "4") {
              return false;
            } else {
              return true;
            }
          },
          GridProps: { xs: 6, sm: 5, md: 4, lg: 2, xl: 1.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "PAYMENT",
          label: "Payment",
          placeholder: "Payment",
          required: true,
          maxLength: 13,
          FormatProps: {
            allowNegative: false,
          },
          schemaValidation: {
            type: "string",
            rules: [{ name: "required", params: ["Payment Is Required"] }],
          },
          dependentFields: [
            "ACCT_CD",
            "BRANCH_CD",
            "ACCT_TYPE",
            "TRX",
            "singleDenoRow",
            "CHQNO",
            "TOKEN",
          ],
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};
            const branchCode =
              dependentFieldsValues?.["singleDenoRow.BRANCH_CD"]?.value ?? "";
            const acctType =
              dependentFieldsValues?.["singleDenoRow.ACCT_TYPE"]?.value ?? "";
            const acctCode =
              dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.value ?? "";
            const typeCode =
              dependentFieldsValues?.["singleDenoRow.TRX"]?.value ?? "";
            const chequeNo =
              dependentFieldsValues?.["singleDenoRow.CHQNO"]?.value ?? "";
            const tokenNo =
              dependentFieldsValues?.["singleDenoRow.TOKEN"]?.value ?? "";
            if (
              !dependentFieldsValues?.["singleDenoRow.ACCT_CD"]?.error &&
              Boolean(acctCode) &&
              Boolean(branchCode) &&
              Boolean(acctType) &&
              Boolean(field?.value) &&
              Number(field?.value) !== 0
            ) {
              const cardData = await formState?.getCardColumnValue();
              const apiRequest = {
                BRANCH_CD: branchCode ?? "",
                ACCT_TYPE: acctType ?? "",
                ACCT_CD: acctCode ?? "",
                TYPE_CD: typeCode ?? "",
                COMP_CD: authState?.companyID ?? "",
                CHEQUE_NO: chequeNo ?? "",
                AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "",
                SHADOW_CL: cardData?.SHADOW_CLEAR ?? "",
                HOLD_BAL: cardData?.HOLD_BAL ?? "",
                LEAN_AMT: cardData?.LIEN_AMT ?? "",
                AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "",
                MIN_BALANCE: cardData?.MIN_BALANCE ?? "",
                CONF_BAL: cardData?.CONF_BAL ?? "",
                TRAN_BAL: cardData?.TRAN_BAL ?? "",
                UNCL_BAL: cardData?.UNCL_BAL ?? "",
                LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "",
                DRAWING_POWER: cardData?.DRAWING_POWER ?? "",
                AMOUNT: field?.value ?? "",
                OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "",
                OP_DATE: cardData?.OP_DATE ?? "",
                INST_NO: cardData?.INST_NO ?? "",
                INST_RS: cardData?.INST_RS ?? "",
                PENDING_AMOUNT: cardData?.PENDING_AMOUNT ?? "",
                STATUS: cardData?.STATUS ?? "",
                TYPE: "C",
                SCREEN_REF: formState?.docCD ?? "",
                TRAN_CD: "",
                SCROLL1: Boolean(tokenNo) ? tokenNo : "",
              };
              const amountValidate: any = await API?.getAmountValidation(
                apiRequest
              );
              let btn99, returnVal;
              for (let i = 0; i < amountValidate?.length; i++) {
                if (amountValidate[i]?.O_STATUS === "999") {
                  await formState.MessageBox({
                    messageTitle:
                      amountValidate[i]?.O_MSG_TITLE ?? "ValidationFailed",
                    message: amountValidate[i]?.O_MESSAGE,
                    icon: "ERROR",
                  });
                  returnVal = "";
                } else if (amountValidate[i]?.O_STATUS === "99") {
                  const btnName = await formState.MessageBox({
                    messageTitle:
                      amountValidate[i]?.O_MSG_TITLE ?? "Confirmation",
                    message: amountValidate[i]?.O_MESSAGE,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "No") {
                    returnVal = "";
                    break;
                  }
                } else if (amountValidate[i]?.O_STATUS === "9") {
                  await formState.MessageBox({
                    messageTitle: amountValidate[i]?.O_MSG_TITLE ?? "Alert",
                    message: amountValidate[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                } else if (amountValidate[i]?.STATUS === "0") {
                  if (btn99 !== "No") {
                    returnVal = amountValidate[i];
                  } else {
                    returnVal = "";
                  }
                }
              }
              return {
                PAYMENT:
                  returnVal !== ""
                    ? {
                        value: field?.value ?? "",
                        isFieldFocused: false,
                        ignoreUpdate: true,
                      }
                    : {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                PAYMENT_VALID: { value: "ENABLE", ignoreUpdate: false },
              };
            } else if (!Boolean(field?.value)) {
              return {
                PAYMENT_VALID: { value: "", ignoreUpdate: false },
              };
            }
          },
          shouldExclude(fieldData, dependentFieldsValues, formState) {
            if (dependentFieldsValues?.["singleDenoRow.TRX"]?.value === "4") {
              return false;
            } else {
              return true;
            }
          },
          GridProps: { xs: 6, sm: 5, md: 4, lg: 2, xl: 1.5 },
        },
      ],
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "RECEIPT_TOTAL",
      label: "ReceiptTotal",
      placeholder: "ReceiptTotal",
      dependentFields: ["singleDenoRow"],
      validationRun: "onBlur",
      defaultValue: "0",
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["singleDenoRow"])
            ? dependentFieldState?.["singleDenoRow"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.RECEIPT?.value), 0);

        return accumulatedTakeoverLoanAmount;
      },
      isReadOnly: true,
      GridProps: { xs: 6, sm: 4, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PAYMENT_TOTAL",
      label: "PaymentsTotal",
      placeholder: "PaymentsTotal",
      defaultValue: "0",
      dependentFields: ["singleDenoRow"],
      validationRun: "onBlur",
      setValueOnDependentFieldsChange: (dependentFieldState) => {
        let accumulatedTakeoverLoanAmount = (
          Array.isArray(dependentFieldState?.["singleDenoRow"])
            ? dependentFieldState?.["singleDenoRow"]
            : []
        ).reduce((accum, obj) => accum + Number(obj?.PAYMENT?.value), 0);

        return accumulatedTakeoverLoanAmount;
      },
      isReadOnly: true,
      GridProps: { xs: 6, sm: 4, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "FINAL_AMOUNT",
      label: "Final Total",
      placeholder: "FinalTotal",
      defaultValue: "0",
      FormatProps: {
        allowNegative: true,
      },
      dependentFields: ["RECEIPT_TOTAL", "PAYMENT_TOTAL"],
      isReadOnly: true,
      setValueOnDependentFieldsChange: (dependentFields) => {
        if (
          dependentFields?.RECEIPT_TOTAL?.value ||
          dependentFields?.PAYMENT_TOTAL?.value
        ) {
          const returnFinalAmount =
            dependentFields?.RECEIPT_TOTAL?.value -
            dependentFields?.PAYMENT_TOTAL?.value;

          return returnFinalAmount;
        } else {
          return "";
        }
      },
      GridProps: { xs: 6, sm: 4, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "DENOBTN",
      label: "Denomination",
      dependentFields: ["PAYMENT_VALID", "RECEIPT_VALID", "singleDenoRow"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (formState?.isLoading) {
          return true;
        }
        if (
          Array.isArray(dependentFields?.singleDenoRow) &&
          dependentFields?.singleDenoRow?.length > 0
        ) {
          const condition = !dependentFields?.singleDenoRow?.every(
            (ele) =>
              ele?.RECEIPT_VALID?.value === "ENABLE" ||
              ele?.PAYMENT_VALID?.value === "ENABLE"
          );
          return condition;
        }
        return true;
      },
      GridProps: {
        xs: 4,
        sm: 2.3,
        md: 1.5,
        lg: 1.5,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RELEASE",
      label: "Release",
      GridProps: {
        xs: 4,
        sm: 2,
        md: 1.5,
        lg: 1,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "OTHER_REC",
      label: "OtherReceipt",
      GridProps: {
        xs: 4,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "OTHER_PAY",
      label: "OtherPayment",
      GridProps: {
        xs: 4,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1,
      },
    },
  ],
};
