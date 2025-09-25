import { useContext, useEffect, useRef, useState } from "react";
import DualPartTable from "./dualPartTable";
import { AuthContext } from "pages_audit/auth";
import { usePopupContext } from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import * as API from "../../api";
import { t } from "i18next";
import { useDialogContext } from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

const DualTableCalc = ({
  data,
  displayTableDual,
  onCloseTable,
  gridLable,
  formData,
  initRemainExcess,
  screenFlag,
  typeCode,
  setOpenDenoTable,
  resetForm,
  denoValidPara,
}) => {
  const columnDefinitions = [
    {
      label: "Denomination",
      fieldName: "DENO_LABLE",
      isTotalWord: true,
      uniqueID: "1",
    },
    {
      label: "Receipt",
      fieldName: "receipt",
      isEditable: true,
      uniqueID: "2",
    },
    { label: "Amount", fieldName: "amount", isCurrency: true, uniqueID: "3" },
    {
      label: "Denomination",
      fieldName: "DENO_LABLE",
      isTotalWord: true,
      uniqueID: "4",
    },
    {
      label: "Payment",
      fieldName: "payment",
      isEditable: true,
      uniqueID: "5",
    },
    { label: "Amount", fieldName: "amount2", isCurrency: true, uniqueID: "6" },
    { label: "AvailableNote", fieldName: "AVAIL_QTY", uniqueID: "7" },
    {
      label: "Balance",
      fieldName: "AVAIL_VAL",
      isCurrency: true,
      uniqueID: "8",
    },
  ];

  const [inputValues, setInputValues] = useState({});
  const [totalAmounts, setTotalAmounts] = useState({});
  type ErrorType = { index: number; fieldName: string; message: string };
  const [errors, setErrors] = useState<ErrorType[]>([]);
  const [remainExcess, setRemainExcess] = useState<any>(0);
  const fixedDataTotal: any = useRef({});
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  const docCD = getdocCD(useLocation()?.pathname, authState?.menulistdata);
  trackDialogClass("denoTable");

  //Get total of AVAIL_QTY and AVAIL_VAL column data
  useEffect(() => {
    const newTotalAmounts = { ...totalAmounts };

    ["AVAIL_QTY", "AVAIL_VAL"].forEach((fieldName) => {
      newTotalAmounts[fieldName] = data?.reduce((total, item) => {
        const value = item[fieldName] ?? "0";
        return total + parseFloat(value);
      }, 0);
    });

    fixedDataTotal.current = newTotalAmounts;
  }, [data]);

  //This useEffect set the initial remainExcess amount in state
  useEffect(() => {
    setRemainExcess(initRemainExcess);
  }, [formData, initRemainExcess]);

  //This function for manage the deno. table calculation and validations
  const handleBlur = (event, fieldName, index) => {
    if (data) {
      const newTotalAmounts = { ...totalAmounts };
      columnDefinitions?.forEach((column) => {
        const fieldName = column?.fieldName;
        newTotalAmounts[fieldName] = data?.reduce((total, item, index) => {
          const value =
            inputValues[index]?.[fieldName] || //For get Input value
            item?.[fieldName] || //For get API data field values
            "0";
          return total + parseFloat(value);
        }, 0);
      });
      if (denoValidPara === "Y") {
        // Check if the error exists so update the state accordingly
        if (
          fieldName === "payment" &&
          inputValues[index]?.amount2 > data[index]?.AVAIL_VAL
        ) {
          setErrors((prevErrors) => {
            const updatedErrors = [
              ...prevErrors,
              {
                index,
                fieldName,
                message: t("DenominationValidation", {
                  value: data?.[index]?.DENO_VAL,
                }),
              },
            ];
            performCalculation(newTotalAmounts, updatedErrors);
            return updatedErrors;
          });
        } else {
          setErrors((prevErrors) => {
            const updatedErrors = prevErrors?.filter(
              (error) =>
                !(error.index === index && error?.fieldName === fieldName)
            );
            performCalculation(newTotalAmounts, updatedErrors);
            return updatedErrors;
          });
        }
      }
      if (denoValidPara !== "Y") performCalculation(newTotalAmounts, []);
    }
  };

  const performCalculation = (newTotalAmounts, currentErrors) => {
    if (currentErrors.length === 0) {
      let calcRemainExcess;
      if (typeCode === "1") {
        calcRemainExcess =
          parseFloat(initRemainExcess) -
          parseFloat(newTotalAmounts["amount"]) +
          parseFloat(newTotalAmounts["amount2"]);
      } else if (typeCode === "4") {
        calcRemainExcess =
          parseFloat(initRemainExcess) +
          parseFloat(newTotalAmounts["amount"]) -
          parseFloat(newTotalAmounts["amount2"]);
      }
      setRemainExcess(calcRemainExcess);
    }
    setTotalAmounts(newTotalAmounts);
  };

  const saveDenominationData = useMutation(API.saveDenoData, {
    onSuccess: async (data: any, variables: any) => {
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
          await MessageBox({
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
    },
    onError: (error: any, variables: any) => {
      CloseMessageBox();
    },
  });

  const getRowData = () => {
    const getRowsViseData = data
      ?.map((apiRow, index) => {
        if (Object?.hasOwn(inputValues, index)) {
          const newRowsReceipt = {
            ...apiRow,
            DENO_QTY:
              typeCode === "1"
                ? inputValues[index]?.receipt
                : "-" + inputValues[index]?.receipt,
            AMOUNT:
              typeCode === "1"
                ? inputValues[index]?.amount?.toString()
                : "-" + inputValues[index]?.amount?.toString(),
          };
          const newRowsPayment = {
            ...apiRow,
            DENO_QTY:
              typeCode === "1"
                ? "-" + inputValues[index]?.payment
                : inputValues[index]?.payment,
            AMOUNT:
              typeCode === "1"
                ? "-" + inputValues[index]?.amount2?.toString()
                : inputValues[index]?.amount2?.toString(),
          };

          const resMinusPay = {
            ...apiRow,
            DENO_QTY:
              typeCode === "1"
                ? (
                    inputValues[index]?.receipt - inputValues[index]?.payment
                  )?.toString()
                : (
                    inputValues[index]?.payment - inputValues[index]?.receipt
                  )?.toString(),
            AMOUNT:
              typeCode === "1"
                ? (
                    inputValues[index]?.amount - inputValues[index]?.amount2
                  )?.toString()
                : (
                    inputValues[index]?.amount2 - inputValues[index]?.amount
                  )?.toString(),
          };
          if (
            Boolean(inputValues[index]?.receipt) &&
            Boolean(inputValues[index]?.payment)
          ) {
            return resMinusPay;
          } else if (inputValues[index]?.receipt) {
            return newRowsReceipt;
          } else if (inputValues[index]?.payment) {
            return newRowsPayment;
          }
        }
      })
      ?.filter((row) => {
        return Boolean(row);
      });
    return getRowsViseData?.flat();
  };
  const openConfirmation = async () => {
    if (remainExcess === 0 && displayTableDual) {
      const response = await MessageBox({
        messageTitle: "Confirmation",
        message: "AllTrnCompleteMsg",
        //@ts-ignore
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (response === "Yes") {
        const DDT = getRowData();

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
            REMARKS: Boolean(item?.REMARK) ? item?.REMARK : item?.REMARKS ?? "",
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

          DENO_DTL: DDT?.map((itemData) => {
            const data = {
              TYPE_CD: typeCode ?? "",
              DENO_QTY: itemData?.DENO_QTY ?? "",
              DENO_TRAN_CD: itemData?.TRAN_CD ?? "",
              DENO_VAL: itemData?.DENO_VAL ?? "",
              AMOUNT: itemData?.AMOUNT ?? "",
            };
            return data;
          }),
          SCREEN_REF: docCD ?? "",
          ENTRY_TYPE: screenFlag ?? "",
        };
        saveDenominationData?.mutate(reqData);
      } else if (response === "No") {
        CloseMessageBox();
      }
    } else {
      CloseMessageBox();
    }
  };

  useEffect(() => {
    if (Object?.keys(totalAmounts)?.length > 0) {
      openConfirmation();
    }
  }, [remainExcess]);

  const handleChange = (e, index, fieldName) => {
    const { value } = e.target;
    setInputValues((prevInputValues) => {
      const updatedValues = {
        ...prevInputValues,
        [index]: {
          receipt: prevInputValues[index]?.receipt || "",
          amount: prevInputValues[index]?.amount || 0,
          payment: prevInputValues[index]?.payment || "",
          amount2: prevInputValues[index]?.amount2 || 0,
          [fieldName]: value ?? "0",
        },
      };

      // Calculate the multiplied values
      if (fieldName === "receipt") {
        const denomination = parseFloat(data[index]["DENO_VAL"]);
        updatedValues[index]["amount"] =
          denomination * parseFloat(value || "0");
      } else if (fieldName === "payment") {
        const denomination = parseFloat(data[index]["DENO_VAL"]);
        updatedValues[index]["amount2"] =
          denomination * parseFloat(value || "0");
      }

      if (
        updatedValues[index]?.receipt === "" &&
        updatedValues[index]?.payment === ""
      ) {
        delete updatedValues[index];
      }

      return updatedValues;
    });
    if (denoValidPara === "Y") {
      if (
        errors?.some(
          (error) => error?.index === index && error?.fieldName === fieldName
        )
      ) {
        setErrors((prevErrors) =>
          prevErrors?.filter(
            (error) =>
              !(error?.index === index && error?.fieldName === fieldName)
          )
        );
      }
    }
  };

  return (
    <DualPartTable
      data={data || []}
      columnDefinitions={columnDefinitions}
      displayTableDual={displayTableDual}
      onCloseTable={onCloseTable}
      handleChange={handleChange}
      inputValues={inputValues}
      totalAmounts={
        Object?.keys(totalAmounts)?.length === 0
          ? fixedDataTotal?.current
          : totalAmounts
      }
      gridLable={gridLable}
      handleBlur={handleBlur}
      remainExcess={remainExcess}
      remainExcessLable={remainExcess >= 0 ? t("Remaining ") : t("Excess ")}
      errors={errors}
      saveDenominationData={saveDenominationData}
    />
  );
};

export default DualTableCalc;
