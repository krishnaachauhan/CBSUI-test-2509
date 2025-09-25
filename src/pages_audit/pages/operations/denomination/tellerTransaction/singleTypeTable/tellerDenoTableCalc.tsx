import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import TellerDenoTable from "./tellerDenoTable";
import {
  SingleTableDataReducer,
  SingleTableInititalState,
  SingleTableActionTypes,
} from "./denoTableActionTypes";
import { usePopupContext } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import * as API from "../../api";
import { t } from "i18next";
import { useDialogContext } from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

const TellerDenoTableCalc = ({
  displayTable,
  formData,
  data,
  onCloseTable,
  gridLable,
  initRemainExcess,
  setOpenDenoTable,
  screenFlag,
  typeCode,
  resetForm,
  denoValidPara,
}) => {
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  trackDialogClass("denoTable");

  const [state, dispatch] = useReducer(
    SingleTableDataReducer,
    SingleTableInititalState
  );
  const textFieldRef: any = useRef(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation()?.pathname, authState?.menulistdata);

  //for common function for set required table column totals
  const calculateTotals = useCallback((field) => {
    const finalTotal = {};

    for (let key in field) {
      const newTotalAmount = Object?.values(field[key] || "0")?.reduce(
        (acc: any, val: any) => acc + (parseFloat(val) || 0),
        0
      );

      if (Boolean(state?.inputVal)) {
        finalTotal[key] = newTotalAmount ?? "0";
      }
    }
    return finalTotal;
  }, []);

  useEffect(() => {
    // set initial values of available quntity and available balance
    let initAvailNote: any = [];
    let initBalance: any = [];
    data?.map((notes) => {
      initAvailNote.push(notes?.AVAIL_QTY);
      initBalance.push(notes?.AVAIL_VAL);
    });
    dispatch({
      type: SingleTableActionTypes?.SET_AVAIL_NOTE,
      payload: initAvailNote,
    });
    dispatch({
      type: SingleTableActionTypes?.SET_BAL_VAL,
      payload: initBalance,
    });
  }, [data, state?.openDeno]);

  //cleanup function
  useEffect(() => {
    return () => {
      // Set input values and amount on openDeno change(clear input value and amount)
      dispatch({
        type: SingleTableActionTypes?.SET_INPUT_VAL,
        payload: {},
      });
      dispatch({
        type: SingleTableActionTypes?.SET_AMOUNT_VAL,
        payload: [],
      });
    };
  }, []);

  //set initial totals of input value and amount
  useEffect(() => {
    const dataObj = {
      inputVal: "0",
      amount: "0",
      availNote: state?.availNote,
      balance: state?.balance,
    };
    const newValue = calculateTotals(dataObj);

    dispatch({
      type: SingleTableActionTypes?.SET_TOTAL_VAL,
      payload: newValue,
    });
  }, [state?.availNote, state?.balance, state?.openDeno, calculateTotals]);

  //for aceept only numbers (positive and negative) without decimal
  const sanitizedValue = useCallback((inputValue) => {
    if (inputValue?.startsWith("-")) {
      return "-" + inputValue?.replace(/[^0-9]/g, "");
    } else {
      return inputValue?.replace(/[^0-9]/g, "");
    }
  }, []);

  const handleChange = useCallback(
    (event, index) => {
      //set sanitized value returned by sanitizedValue function (new value have only numbers (positive and negative) without decimal)
      let userInput = event?.target?.value;
      const sanitValue = sanitizedValue(userInput);
      let updatedValue = { ...state?.inputVal };
      updatedValue[index] = sanitValue;
      dispatch({
        type: SingleTableActionTypes?.SET_INPUT_VAL,
        payload: updatedValue,
      });

      //display Amount column value (multiplied value of denomination * note count)
      const multipliedValue = [...state?.amount];
      multipliedValue[index] =
        parseFloat(sanitValue) * parseFloat(data?.[index]?.DENO_VAL);
      dispatch({
        type: SingleTableActionTypes?.SET_AMOUNT_VAL,
        payload: multipliedValue,
      });
    },
    [sanitizedValue, state?.inputVal, state?.amount, data]
  );

  //Handle blur logic for error remove
  const handleBlurErrLogic = useCallback((event, index) => {
    if (denoValidPara === "Y") {
      dispatch({
        type: SingleTableActionTypes?.SET_DIS_ERR_VAL,
        payload: {
          index: index,
          message: null,
        },
      });
    }
  }, []);

  // Handle blur event for input validation and calculation
  const handleonBlur = useCallback(
    async (event, index) => {
      //For clear input field value when get only '-' in input
      if (Boolean(event?.target?.value === "-")) {
        state.inputVal[index] = "";
      }

      // Recalculate totals and dispatch
      const dataForTotal = {
        inputVal: state?.inputVal || "0",
        amount: state?.amount || "0",
        availNote: state?.availNote || "0",
        balance: state?.balance || "0",
      };

      const newTotals = calculateTotals(dataForTotal);
      dispatch({
        type: SingleTableActionTypes?.SET_TOTAL_VAL,
        payload: newTotals,
      });

      if (denoValidPara === "Y") {
        // Validation logic based on typeCode
        const exceedBalance =
          typeCode === "1" &&
          state?.amount[index] < 0 &&
          Math.abs(state?.amount[index]) > data[index]?.AVAIL_VAL;

        const exceedPositive =
          typeCode === "4" &&
          state?.amount[index] > 0 &&
          state?.amount[index] > data[index]?.AVAIL_VAL;

        if (exceedBalance || exceedPositive) {
          dispatch({
            type: SingleTableActionTypes?.SET_DIS_ERR_VAL,
            payload: {
              index: index,
              message: t("DenominationValidation", {
                value: data?.[index]?.DENO_VAL,
              }),
            },
          });
        } else {
          //clear error when if condition is no true
          handleBlurErrLogic(event, index);
        }
      }
    },
    [
      state.inputVal,
      state?.amount,
      data,
      typeCode,
      handleBlurErrLogic,
      calculateTotals,
    ]
  );

  // Helper function to check for errors in displayError
  const hasError = useCallback(
    (obj) => Object?.values(obj)?.some((val) => val !== null),
    []
  );

  // Check for errors
  const haveError = hasError(state?.displayError);

  // Update remaining excess value after amount total calculation
  useEffect(() => {
    if (!Boolean(haveError)) {
      const calRemainExcess: any =
        parseFloat(initRemainExcess) - parseFloat(state?.columnTotal?.amount);
      dispatch({
        type: SingleTableActionTypes?.SET_REMAINEXCESS_VAL,
        payload: calRemainExcess,
      });
    }
  }, [state?.columnTotal?.amount, data, haveError, formData]);

  //Mutation for saving denomination data
  const saveDenominationData = useMutation(API.saveDenoData, {
    onSuccess: async (data) => {
      CloseMessageBox();
      setOpenDenoTable(false);
      let messages = "",
        msgTitle = "";
      for (let i = 0; i < data?.length; i++) {
        if (data[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data[i]?.O_MESSAGE,
            icon: "ERROR",
          });
          trackDialogClass("main");
        } else if (data[i]?.O_STATUS === "99") {
          const btnName = await MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
        } else if (data[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE ?? "Alert",
            message: data[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data[i]?.O_STATUS === "0") {
          messages = messages + (data[i]?.O_MESSAGE ?? "") + "\n";
          msgTitle = data?.[0]?.O_MSG_TITLE ?? "";
        }
      }
      if (Boolean(messages) && Boolean(msgTitle)) {
        await MessageBox({
          messageTitle: msgTitle ?? "Information",
          message: messages ?? "",
          icon: "INFO",
        });
        resetForm();
      }

      // if (data?.length) {
      //   if (data?.[0]?.hasOwnProperty("O_STATUS")) {
      //     for (const result of data) {
      //       const status = result?.O_STATUS;
      //       const message = result?.O_MESSAGE;

      //       if (status === "999" || status === "99" || status === "9") {
      //         setTimeout(async () => {
      //           await MessageBox({
      //             messageTitle:
      //               status === "999"
      //                 ? "Validation Failed"
      //                 : status === "99"
      //                 ? "Confirmation"
      //                 : status === "9"
      //                 ? "Alert"
      //                 : "",
      //             message,
      //             icon:
      //               status === "999"
      //                 ? "ERROR"
      //                 : status === "99"
      //                 ? "CONFIRM"
      //                 : status === "9"
      //                 ? "WARNING"
      //                 : undefined,
      //             buttonNames: status === "99" ? ["Yes", "No"] : ["Ok"],
      //           });
      //           resetForm();
      //         }, 0);
      //       }
      //     }
      //   } else {
      //     setTimeout(async () => {
      //       await MessageBox({
      //         messageTitle: "Generated Voucher No./Reference No.",
      //         message: `${data?.[0]?.TRAN_CD} / ${data?.[0]?.REFERENCE_NO}`,
      //         defFocusBtnName: "Ok",
      //         icon: "INFO",
      //       });
      //       resetForm();
      //     }, 0);
      //   }
      // }
    },
    onError: () => CloseMessageBox(),
  });

  //useEffect for open save confirmation and call the denomination save API
  useEffect(() => {
    const fetchData = async () => {
      if (state?.remainExcess === 0 && Boolean(displayTable)) {
        const res = await MessageBox({
          messageTitle: "Confirmation",
          message: "AllTrnCompleteMsg",
          buttonNames: ["Yes", "No"],
          defFocusBtnName: "Yes",
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (res === "Yes") {
          //For collect row data of deno. table
          const rowData = getDenoRowData();

          const mapFields = (item) => {
            const baseFields: any = {
              BRANCH_CD: item?.BRANCH_CD ?? "",
              ACCT_TYPE: item?.ACCT_TYPE ?? "",
              ACCT_CD: item?.ACCT_CD ?? "",
              TYPE_CD: Boolean(item?.TRX)
                ? item?.TRX
                : Boolean(item?.TYPE_CD)
                ? item?.TYPE_CD
                : typeCode ?? "",
              COMP_CD: Boolean(authState?.companyID)
                ? authState?.companyID
                : item?.COMP_CD ?? "",
              CHEQUE_NO: Boolean(item?.CHQNO)
                ? item?.CHQNO
                : item?.CHEQUE_NO ?? "",
              SDC: item?.SDC ?? "",
              SCROLL1: Boolean(item?.SCROLL)
                ? item?.SCROLL
                : Boolean(item?.SCROLL1)
                ? item?.SCROLL1
                : item?.TOKEN ?? "",
              CHEQUE_DT: Boolean(item?.CHEQUE_DT)
                ? item?.CHEQUE_DT
                : item?.CHQ_DT ?? "",
              REMARKS: Boolean(item?.REMARK)
                ? item?.REMARK
                : item?.REMARKS ?? "",
              AMOUNT: Boolean(item?.RECEIPT)
                ? item?.RECEIPT
                : Boolean(item?.PAYMENT)
                ? item?.PAYMENT
                : item?.AMOUNT ?? "0",
            };
            if (screenFlag === "SINGLEPAY" || screenFlag === "MULTIPAY") {
              return { ...baseFields, TRAN_CD: item?.TRAN_CD ?? "" };
            }

            if (screenFlag === "SINGLEOTHREC" || screenFlag === "MULTIOTHREC") {
              return {
                ...baseFields,
                TRAN_CD: item?.TRAN_CD ?? "",
                DAILY_TRN_CD: item?.DAILY_TRN_CD ?? "",
              };
            }

            return baseFields;
          };

          const reqData = {
            TRN_DTL:
              screenFlag === "MULTIRECPAY"
                ? (formData?.singleDenoRow ?? [])?.map(mapFields)
                : (formData ?? [])?.map(mapFields),
            DENO_DTL: rowData?.map((itemData) => ({
              TYPE_CD: typeCode ?? "",
              DENO_QTY: itemData?.INPUT_VALUE ?? "",
              DENO_TRAN_CD: itemData?.TRAN_CD ?? "",
              DENO_VAL: itemData?.DENO_VAL ?? "",
              AMOUNT: itemData?.MULTIPLIED_VALUE?.toString() ?? "",
            })),
            SCREEN_REF: docCD ?? "",
            ENTRY_TYPE: screenFlag ?? "",
          };

          //Mutate deno. save API
          saveDenominationData?.mutate(reqData);
        } else {
          CloseMessageBox();
        }
      }
    };

    fetchData();
  }, [state?.remainExcess]);

  const getDenoRowData = () =>
    data
      ?.map((apiRow, index) => {
        const inputAmount = state?.inputVal[index] || "";
        const multipliedValue = state?.amount[index] || "";

        if (
          Boolean(inputAmount) &&
          Boolean(multipliedValue) &&
          multipliedValue !== "NaN"
        ) {
          return {
            ...apiRow,
            INPUT_VALUE: inputAmount,
            MULTIPLIED_VALUE: multipliedValue,
          };
        }
      })
      ?.filter(Boolean);

  return (
    <TellerDenoTable
      displayTable={displayTable}
      data={data ?? []}
      handleChange={handleChange}
      inputValue={state?.inputVal}
      amount={state?.amount}
      availNotes={state?.availNote}
      balance={state?.balance}
      handleonBlur={handleonBlur}
      noteCntTotal={state?.columnTotal?.inputVal}
      amountTotal={state?.columnTotal?.amount}
      availNoteTotal={state?.columnTotal?.availNote}
      balanceTotal={state?.columnTotal?.balance}
      remainExcessBal={state?.remainExcess ?? "0"}
      finalLable={state?.remainExcess >= 0 ? t("Remaining ") : t("Excess ")}
      onCloseTable={onCloseTable}
      textFieldRef={textFieldRef}
      displayError={state?.displayError}
      gridLable={gridLable}
      saveDenominationData={saveDenominationData}
    />
  );
};

export default TellerDenoTableCalc;
