import { forwardRef, useContext } from "react";
import { FDContext } from "../context/fdContext";
import { FDPaymentMetadata } from "./metaData/fdPaymentMetadata";
import { useLocation } from "react-router-dom";
import {
  FormWrapper,
  InitialValuesType,
  MetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { useCommonFunctions } from "../function";

export const FDPayment = forwardRef<any, any>(
  (
    {
      openIntPayment,
      openPayment,
      openRenew,
      paymentFormSubmitHandler,
      reqParam,
    },
    ref
  ) => {
    const { FDState, handleDisableButton } = useContext(FDContext);
    const { MessageBox } = usePopupContext();
    const { state: rows }: any = useLocation();
    let currentPath = useLocation().pathname;
    const { authState } = useContext(AuthContext);
    const docCD = getdocCD(currentPath, authState?.menulistdata);
    const { showMessageBox } = useCommonFunctions();

    return (
      <FormWrapper
        key={"fdpayment"}
        metaData={FDPaymentMetadata as MetaDataType}
        onSubmitHandler={paymentFormSubmitHandler}
        hideHeader={true}
        initialValues={
          Object.keys(FDState?.fdSavedPaymentData).length
            ? { ...FDState?.fdSavedPaymentData }
            : ({
                ...FDState?.fdPaymentData,
                PAYSLIP: false,
                RTGS_NEFT: false,
                BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
                ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
                ACCT_CD: FDState?.retrieveFormData?.ACCT_CD ?? "",
                ACCT_NM: FDState?.retrieveFormData?.ACCT_NM ?? "",
                FD_NO: rows?.[0]?.data?.FD_NO ?? "",
                PERIOD_CD: rows?.[0]?.data?.PERIOD_CD ?? "",
                PERIOD_NO: rows?.[0]?.data?.PERIOD_NO ?? "",
                IS_PREMATURE:
                  FDState?.checkAllowFDPayApiData?.IS_PREMATURE ?? "",
                SPL_AMT: FDState?.fdParaDetailData?.SPL_AMT ?? "",
                PRE_RATE:
                  FDState?.checkAllowFDPayApiData?.IS_PREMATURE === "Y"
                    ? FDState?.prematureRateData?.INT_RATE
                    : "",
                TDS_METHOD: FDState?.fdParaDetailData?.TDS_METHOD ?? "",
                BAL_AMT: Boolean(openIntPayment)
                  ? 0
                  : FDState?.fdPaymentData?.BAL_AMT,
                PAY_CASH: Boolean(openIntPayment)
                  ? 0
                  : FDState?.fdPaymentData?.PAY_CASH,
                PAY_TRF: Boolean(openIntPayment)
                  ? 0
                  : FDState?.fdPaymentData?.PAY_TRF,
                DAYS_DTL: Boolean(openIntPayment)
                  ? ""
                  : FDState?.fdPaymentData?.DAYS_DTL,
                AFT_MAT_INT_TYPE: Boolean(openIntPayment)
                  ? ""
                  : FDState?.fdPaymentData?.AFT_MAT_INT_TYPE,
                AFT_MAT_INT_RATE: Boolean(openIntPayment)
                  ? ""
                  : FDState?.fdPaymentData?.AFT_MAT_INT_RATE,
                AFT_MAT_INT_AMT: Boolean(openIntPayment)
                  ? ""
                  : FDState?.fdPaymentData?.AFT_MAT_INT_AMT,
                FD_REMARK: Boolean(openIntPayment)
                  ? ""
                  : FDState?.fdPaymentData?.FD_REMARK,
              } as InitialValuesType)
        }
        formState={{
          MessageBox: MessageBox,
          handleDisableButton: handleDisableButton,
          reqParam: reqParam,
          openPayment: openPayment,
          openRenew: openRenew,
          intRateIniValue: FDState?.fdPaymentData?.INT_RATE_REST ?? "",
          paidDateIniValue: FDState?.fdPaymentData?.PAID_DT ?? "",
          isChangePaidDate: false,
          isChangeIntRate: false,
          openIntPayment: openIntPayment,
          docCD: docCD,
          showMessageBox: showMessageBox,
        }}
        ref={ref}
        formStyle={{
          background: "white",
          width: "100%",
        }}
      />
    );
  }
);
