import * as API from "../../api";
import { GeneralAPI } from "registry/fns/functions";
import * as CommonApi from "pages_audit/pages/operations/DailyTransaction/TRNCommon/api";
import { utilFunction, components } from "@acuteinfo/common-base";
import { validateHOBranch } from "components/utilFunction/function";

export const TellerScreenMetadata: any = {
  form: {
    name: "TellerOperation",
    label: "",
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
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        dependentFields: ["SDC"],
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFields
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
          formState?.setCardDetails([]);
          formState?.setTabsDetails([]);
          return {
            ACCT_TYPE: { value: "", ignoreUpdate: false },
            SET_INST_AMOUNT: {
              value: "",
              ignoreUpdate: false,
            },
            ACCT_CD: { value: "", ignoreUpdate: false },
            RECEIPT: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: {
          xs: 6,
          sm: 4,
          md: 3,
          lg: 1.5,
          xl: 1.5,
        },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        isFieldFocused: true,
        dependentFields: ["BRANCH_CD"],
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            Boolean(currentField?.value) &&
            Boolean(dependentFieldValues?.BRANCH_CD?.value)
          ) {
            const reqPara = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              ACCT_TYPE: currentField?.value ?? "",
              SCREEN_REF: formState?.docCd ?? "",
            };
            const validPara = await API?.getBranch_TypeValidate(reqPara);

            let btn99, returnVal;
            for (let i = 0; i < validPara?.length; i++) {
              if (validPara[i]?.O_STATUS === "999") {
                await formState.MessageBox({
                  messageTitle: validPara[i]?.O_MSG_TITLE ?? "ValidationFailed",
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
                      value: currentField?.value ?? "",
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
              SET_INST_AMOUNT: {
                value: returnVal?.SET_INST_AMOUNT ?? "",
                ignoreUpdate: false,
              },
              ACCT_CD: { value: "", ignoreUpdate: false },
              RECEIPT: { value: "", ignoreUpdate: false },
            };
          } else if (!currentField?.value) {
            formState?.setCardDetails([]);
            formState?.setTabsDetails([]);
            return {
              ACCT_CD: { value: "", ignoreUpdate: false },
              RECEIPT: { value: "", ignoreUpdate: false },
            };
          }
          formState?.setCardDetails([]);
          return {
            ACCT_CD: { value: "", ignoreUpdate: false },
            RECEIPT: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: {
          xs: 6,
          sm: 4,
          md: 3,
          lg: 1.5,
          xl: 1.5,
        },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        dependentFields: ["BRANCH_CD", "ACCT_TYPE", "SDC", "SET_INST_AMOUNT"],
        autoComplete: "off",
        GridProps: {
          xs: 6,
          sm: 4,
          md: 3,
          lg: 2,
          xl: 2,
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

          const branchCode = dependentFieldValues?.BRANCH_CD?.value ?? "";
          const acctType = dependentFieldValues?.ACCT_TYPE?.value ?? "";
          const typeOptionData =
            dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {};

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
                SET_INST_AMOUNT: {
                  value: "",
                  ignoreUpdate: false,
                },
              };
            }
          } else if (currentField?.value && branchCode && acctType) {
            const reqParameters = {
              BRANCH_CD: branchCode,
              COMP_CD: authState?.companyID,
              ACCT_TYPE: acctType,
              ACCT_CD: utilFunction.getPadAccountNumber(
                currentField?.value,
                typeOptionData
              ),
              SCREEN_REF: formState?.docCd,
            };
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);

            let btn99,
              returnVal,
              shouldCallCarousalCards = false;

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
                  messageTitle: postData?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
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
            let getInstRS;
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

              const carousalCardData = await CommonApi.getCarousalCards({
                reqData: carousalCardDataReqParameters,
              });

              if (Boolean(carousalCardData?.length > 0)) {
                formState?.handleCardDetails(carousalCardData);
                getInstRS = carousalCardData?.filter((element) => {
                  return element?.COL_NAME === "INST_RS";
                });
              }

              formState?.setCardTabsReq({
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE: acctType ?? "",
                ACCT_CD:
                  utilFunction.getPadAccountNumber(
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
              SDC: {
                value: "1   ",
                ignoreUpdate: false,
              },
              RECEIPT: {
                value:
                  dependentFieldValues?.SET_INST_AMOUNT?.value === "Y"
                    ? getInstRS?.[0]?.COL_VALUE
                    : "",
                ignoreUpdate: true,
              },
            };
          } else if (!currentField?.value) {
            formState?.setCardDetails([]);
            return {
              RECEIPT: { value: "", ignoreUpdate: false },
            };
          }
        },
        schemaValidation: {},
        validate: (currentField, dependentFields, formState) => {
          if (!currentField?.value) {
            formState?.setCardDetails([]);
            return "AccountNumberReqired";
          }
        },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SET_INST_AMOUNT",
      label: "installment amount flag",
      placeholder: "",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SDC",
      label: "SDC",
      placeholder: "Select SDC",
      defaultValue: "1   ",
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
            REMARKS: {
              value: field?.optionData?.[0]?.defRemark ?? "",
              isFieldFocused: false,
              ignoreUpdate: false,
            },
          };
        }
      },
      GridProps: {
        xs: 6,
        sm: 4,
        md: 3,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remark",
      placeholder: "Enter Remark",
      defaultValue: "BY CASH -",
      maxLength: 100,
      GridProps: {
        xs: 6,
        sm: 4,
        md: 6,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "RECEIPT",
      label: "ReceiptAmount",
      placeholder: "Enter Receipt",
      required: true,
      dependentFields: ["BRANCH_CD", "ACCT_TYPE", "ACCT_CD", "CHEQUE_NO"],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Enter valid amount"] }],
      },
      AlwaysRunPostValidationSetCrossFieldValues: {
        touchAndValidate: true,
        alwaysRun: true,
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (
          !dependentFieldsValues?.ACCT_CD?.error &&
          Boolean(dependentFieldsValues?.ACCT_CD?.value) &&
          Boolean(dependentFieldsValues?.BRANCH_CD?.value) &&
          Boolean(dependentFieldsValues?.ACCT_TYPE?.value) &&
          Boolean(field?.value) &&
          Number(field?.value) !== 0
        ) {
          const cardData = await formState?.getCardColumnValue();
          const reqPara = {
            BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value ?? "",
            ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value ?? "",
            ACCT_CD: dependentFieldsValues?.ACCT_CD?.value ?? "",
            TYPE_CD: "1",
            COMP_CD: authState?.companyID ?? "",
            CHEQUE_NO: "",
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
            SCREEN_REF: formState?.docCd,
            TRAN_CD: "",
            SCROLL1: "",
          };
          const postData = await API?.getAmountValidation(reqPara);
          for (let i = 0; i < postData?.length; i++) {
            if (postData?.[i]?.O_STATUS === "999") {
              const btnName = await formState.MessageBox({
                messageTitle: postData?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                message: postData?.[i]?.O_MESSAGE,
                icon: "ERROR",
              });
              if (btnName === "Ok") {
                return {
                  RECEIPT: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                };
              }
            } else if (postData?.[i]?.O_STATUS === "99") {
              const btnName = await formState.MessageBox({
                messageTitle: postData?.[i]?.O_MSG_TITLE ?? "Confirmation",
                message: postData?.[i]?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (btnName === "No") {
                return {
                  RECEIPT: {
                    value: "",
                    ignoreUpdate: false,
                    isFieldFocused: true,
                  },
                };
              }
            } else if (postData?.[i]?.O_STATUS === "9") {
              const btnName = await formState.MessageBox({
                messageTitle: postData?.[i]?.O_MSG_TITLE ?? "Alert",
                message: postData?.[i]?.O_MESSAGE,
                icon: "WARNING",
              });
            } else if (postData?.[i]?.O_STATUS === "0") {
              formState.setDataOnFieldChange("RECEIPT", {
                field,
                dependentFieldsValues,
              });
              // return {
              //   RECEIPT: {
              //     isFieldFocused: true,
              //   },
              // };
            }
          }
        }
      },
      GridProps: {
        xs: 6,
        sm: 4,
        md: 6,
        lg: 2,
        xl: 2,
      },
      maxLength: 13,
      FormatProps: {
        allowNegative: false,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "Focus_Field",
      label: "",
      validate: () => {},
      schemaValidation: {},
      ignoreInSubmit: true,
      // textFieldStyle: {
      //   width: "0px",
      //   height: "0px",
      //   padding: "0px",
      //   margin: "0px",

      //   "& .MuiInputBase-root": {
      //     background: "white !important",
      //     color: "white !important",
      //     border: "none !important",
      //   },
      //   "& .MuiInputBase-input": {
      //     background: "white !important",
      //     color: "white !important",
      //     border: "none !important",
      //     "&.Mui-disabled": {
      //       color: "white !important",
      //       "-webkit-text-fill-color": "white !important",
      //       border: "none !important",
      //     },
      //   },
      // },
      textFieldStyle: {
        width: 0,
        height: 0,
        "& .MuiInputBase-root": {
          background: "#fff !important",
          border: "0 !important",
          outline: "0 !important",
          pointerEvents: "none",
        },
      },
      GridProps: {
        xs: 0,
        md: 0,
        sm: 0,
        lg: 0,
        xl: 0,
      },
    },
  ],
};

export const cashReportMetaData = {
  title: "ViewTransactions",
  disableGroupBy: "",
  hideFooter: false,
  hideAmountIn: true,
  retrievalType: "",
  groupBy: [""],
  columns: [
    {
      accessor: "BRANCH_CD",
      columnName: "BrCode",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 45,
      maxWidth: 200,
    },
    {
      accessor: "ACCT_TYPE",
      columnName: "AcctType",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 130,
      minWidth: 50,
      maxWidth: 240,
    },
    {
      accessor: "ACCT_CD",
      columnName: "ACNo",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 40,
      maxWidth: 200,
    },
    {
      accessor: "TRAN_DT",
      columnName: "TrnDate",
      sequence: 5,
      alignment: "left",
      Cell: components.DateCell,
      format: "dd/MM/yyyy",
      width: 120,
      minWidth: 60,
      maxWidth: 260,
    },
    {
      accessor: "CHEQUE_NO",
      columnName: "Chequeno",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 90,
      maxWidth: 200,
    },
    {
      accessor: "TYPE_CD",
      columnName: "Trx",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 60,
      maxWidth: 120,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 200,
      maxWidth: 400,
    },
    {
      accessor: "DEBIT",
      columnName: "DebitAmount",
      sequence: 5,
      alignment: "right",
      Cell: components.NumberCell,
      isTotalWithCurrency: true,
      width: 140,
      minWidth: 60,
      maxWidth: 220,
      color: "red",
    },
    {
      accessor: "CREDIT",
      columnName: "CreditAmount",
      sequence: 5,
      alignment: "right",
      Cell: components.NumberCell,
      isTotalWithCurrency: true,
      width: 140,
      minWidth: 60,
      maxWidth: 240,
      color: "green",
      // currencyRefColumn: "CURR_CD",
      // isCurrencyCode: true,
      // symbolPosi: "end",
    },
    {
      accessor: "TRAN_CD",
      columnName: "Vno",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 80,
      maxWidth: 220,
    },
    {
      accessor: "CONFIRMED",
      columnName: "Status",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 110,
      maxWidth: 220,
    },
    {
      accessor: "SCROLL1",
      columnName: "Scroll",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 110,
      minWidth: 110,
      maxWidth: 220,
    },
    {
      accessor: "SDC",
      columnName: "SDC",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 100,
      maxWidth: 220,
    },
    {
      accessor: "MAKER",
      columnName: "Maker",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 130,
      minWidth: 130,
      maxWidth: 220,
    },
    {
      accessor: "CHECKER",
      columnName: "Checker",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 130,
      minWidth: 130,
      maxWidth: 220,
    },
  ],
};
