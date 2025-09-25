import { useRef } from "react";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import * as API from "./api";
import { SubmitFnType, utilFunction } from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import { getVoucherList } from "../api";
import { t } from "i18next";
import { handleDisplayMessages } from "components/utilFunction/function";
import { isEmpty } from "lodash";

// ---- Custom Hook
export const usePayslipDDTransactions = (
  rowsData: any,
  screenFlag: string,
  trans_type: string,
  apiReqFlag: string,
  authState: any,
  onClose: () => void,
  MessageBox: any,
  CloseMessageBox: any,
  updateEntryFormState: any,
  ddformRef: any,
  draftReqPara: any,
  draftDtlData: Record<string, any>[]
) => {
  const isErrorFuncRef = useRef<any>(null);

  //   mutations
  const voucherMutation = useMutation(getVoucherList, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_detail,
        messageTitle: "error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      isErrorFuncRef.current?.endSubmit(false);
    },
    onSuccess: async (data: any) => {
      if (data[0]?.VOUCHER_MSG === "") {
        return;
      } else {
        await MessageBox({
          message: data[0]?.VOUCHER_MSG,
          icon: "INFO",
          messageTitle: "Vouchers Confirmation",
          buttonNames: ["Ok"],
        });
      }
      CloseMessageBox();
    },
  });
  const mutation = useMutation(API.payslipRealizeEntrySave, {
    onError: async (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      const btnName = await MessageBox({
        message: `${errorMsg}`,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      if (btnName === "Ok") {
        onClose();
      }

      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("insertSuccessfully"), {
        variant: "success",
      });
      if (data[0]?.TRAN_CD) {
        voucherMutation.mutate({
          A_ENT_COMP_CD: authState?.companyID,
          A_ENT_BRANCH_CD: authState?.user?.branchCode,
          A_TRAN_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
          A_TRAN_CD: rowsData?.TRAN_CD,
          A_TRN_FLAG: "Y",
          A_SDC: "PSLP",
          A_SR_CD: rowsData?.SR_CD,
        });
      }
      CloseMessageBox();
      onClose();
    },
  });
  const confirmMutation = useMutation(API.DoddTransactionConfirmation, {
    onError: async (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_detail ?? errorMsg;
      }
      const btnName = await MessageBox({
        message: `${errorMsg}`,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      if (btnName === "Ok") {
        onClose();
      }

      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar("success", {
        variant: "success",
      });
      CloseMessageBox();
      onClose();
    },
  });
  const rejectMutaion = useMutation(
    "rejectMutaion",
    API.DoddTransactionConfirmation,
    {
      onSuccess: async (data) => {
        updateEntryFormState({ isDeleteRemark: false });
        CloseMessageBox();
        const message = data.O_MESSAGE;
        const msgDtl = await handleDisplayMessages(data, MessageBox);
        if (isEmpty(msgDtl)) {
          enqueueSnackbar(message, {
            variant: "success",
          });
          onClose();
        }
      },

      onError: async (error: any) => {
        let errorMsg = t("Unknownerroroccured");
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        const btnName = await MessageBox({
          message: `${errorMsg}`,
          messageTitle: "Error",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
        if (btnName === "Ok") {
          onClose();
        }

        CloseMessageBox();
      },
    }
  );
  //submit  entry
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    ddformRef.current = data;
    endSubmit(true);
    let buttonName = await MessageBox({
      messageTitle: t("Confirmatiopn"),
      message: t("AreYouSureToProceed"),
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
    });

    if (buttonName === "Yes") {
      if (
        trans_type === "TE" &&
        rowsData?.RETRIVE_ENTRY_MODE === "D" &&
        rowsData?.PARA_812 === "Y"
      ) {
        updateEntryFormState({ openNewDDForm: true });
        CloseMessageBox();
      } else {
        if (screenFlag === "REALIZEENTRY") {
          const newTransferAccountData = {
            TRF_COMP_CD: data?.TRF_COMP_CD_DISP,
            TRF_BRANCH_CD: data?.TRF_BRANCH_CD,
            TRF_ACCT_TYPE: data?.TRF_ACCT_TYPE,
            TRF_ACCT_CD: data?.TRF_ACCT_CD,
          };
          let newData = {
            COLLECT_COMISSION: data?.COLLECT_COMISSION,
            REALIZE_AMT: data?.REALIZE_AMT,
            C_C_T_SP_C: data?.C_C_T_SP_C,
            REALIZE_BRANCH_CD: authState?.user?.branchCode,
            REALIZE_COMP_CD: authState?.companyID,
            REALIZE_BY: authState?.user?.id,
            REALIZE_DATE:
              format(new Date(data?.REALIZE_DATE_DISP), "dd/MMM/yyyy") ?? "",
            PENDING_FLAG: "Y",
            ...(data?.C_C_T_SP_C !== "G" ? { CHEQUE_NO: data?.TOKEN_NO } : {}),
            ...(data?.C_C_T_SP_C === "T" ? newTransferAccountData : {}),
            ...(data.C_C_T_SP_C === "C" ? { PENDING_FLAG: "Y" } : {}),
            ...(rowsData?.PARA_243 === "Y"
              ? {
                  REALIZE_FLAG: "Y",
                }
              : {}),
          };

          const oldTransferAccountData = {
            TRF_COMP_CD: draftDtlData[0]?.TRF_COMP_CD,
            TRF_BRANCH_CD: draftDtlData[0]?.TRF_BRANCH_CD,
            TRF_ACCT_TYPE: draftDtlData[0]?.TRF_ACCT_TYPE,
            TRF_ACCT_CD: draftDtlData[0]?.TRF_ACCT_CD,
          };

          const oldData = {
            COLLECT_COMISSION: draftDtlData[0]?.COLLECT_COMISSION,
            REALIZE_AMT: draftDtlData[0]?.REALIZE_AMT,
            C_C_T_SP_C: draftDtlData[0]?.C_C_T_SP_C,
            ...(draftDtlData[0]?.C_C_T_SP_C !== "G"
              ? { CHEQUE_NO: draftDtlData[0]?.CHEQUE_NO }
              : {}),
            REALIZE_BY: draftDtlData[0]?.REALIZE_BY,
            REALIZE_DATE: draftDtlData[0]?.REALIZE_DATE,
            REALIZE_BRANCH_CD: draftDtlData[0]?.REALIZE_BRANCH_CD,
            REALIZE_COMP_CD: draftDtlData[0]?.REALIZE_COMP_CD,
            PENDING_FLAG: draftDtlData[0]?.PENDING_FLAG,
            ...(data?.C_C_T_SP_C === "T" ? oldTransferAccountData : {}),
            ...(rowsData?.PARA_243 === "Y"
              ? {
                  REALIZE_FLAG: rowsData.REALIZE_FLAG,
                }
              : {}),
          };

          let upd = utilFunction.transformDetailsData(newData, oldData);
          isErrorFuncRef.current = {
            data: {
              ...newData,
              ...upd,
              ENTERED_COMP_CD: authState?.companyID,
              ENTERED_BRANCH_CD: authState?.user?.branchCode,
              TRAN_CD: rowsData?.TRAN_CD,
              SR_CD: rowsData?.SR_CD,
              TRAN_TYPE: trans_type,
              COL_SER_CHARGE: data.COL_SER_CHARGE,
            },
            displayData,
            endSubmit,
            setFieldError,
          };

          mutation.mutate({
            ...isErrorFuncRef.current?.data,
          });
        } else if (screenFlag === "CANCELENTRY") {
          const newTransferAccountData = {
            TRF_COMP_CD: data?.TRF_COMP_CD_DISP,
            TRF_BRANCH_CD: data?.TRF_BRANCH_CD,
            TRF_ACCT_TYPE: data?.TRF_ACCT_TYPE,
            TRF_ACCT_CD: data?.TRF_ACCT_CD,
          };

          let newData = {
            COLLECT_COMISSION: data?.COLLECT_COMISSION,
            REALIZE_AMT: data?.REALIZE_AMT,
            C_C_T_SP_C: data?.C_C_T_SP_C,
            REALIZE_BRANCH_CD: authState?.user?.branchCode,
            REALIZE_COMP_CD: authState?.companyID,
            REALIZE_BY: authState?.user?.id,
            REALIZE_DATE:
              format(new Date(data?.REALIZE_DATE_DISP), "dd/MMM/yyyy") ?? "",
            PENDING_FLAG: "Y",
            ...(data?.C_C_T_SP_C !== "G" ? { CHEQUE_NO: data?.TOKEN_NO } : {}),
            ...(data?.C_C_T_SP_C === "T" ? newTransferAccountData : {}),
            ...(data.C_C_T_SP_C === "C" ? { PENDING_FLAG: "Y" } : {}),

            ...(rowsData?.PARA_243 === "Y"
              ? {
                  REALIZE_FLAG: "Y",
                }
              : {}),
          };

          const oldTransferAccountData = {
            TRF_COMP_CD: draftDtlData[0]?.TRF_COMP_CD,
            TRF_BRANCH_CD: draftDtlData[0]?.TRF_BRANCH_CD,
            TRF_ACCT_TYPE: draftDtlData[0]?.TRF_ACCT_TYPE,
            TRF_ACCT_CD: draftDtlData[0]?.TRF_ACCT_CD,
          };

          const oldData = {
            COLLECT_COMISSION: draftDtlData[0]?.COLLECT_COMISSION,
            REALIZE_AMT: draftDtlData[0]?.REALIZE_AMT,
            C_C_T_SP_C: draftDtlData[0]?.C_C_T_SP_C,
            ...(draftDtlData[0]?.C_C_T_SP_C !== "G"
              ? { CHEQUE_NO: draftDtlData[0]?.CHEQUE_NO }
              : {}),
            REALIZE_BY: draftDtlData[0]?.REALIZE_BY,
            REALIZE_DATE: draftDtlData[0]?.REALIZE_DATE,
            REALIZE_BRANCH_CD: draftDtlData[0]?.REALIZE_BRANCH_CD,
            REALIZE_COMP_CD: draftDtlData[0]?.REALIZE_COMP_CD,
            PENDING_FLAG: draftDtlData[0]?.PENDING_FLAG,
            ...(data?.C_C_T_SP_C === "T" ? oldTransferAccountData : {}),
            ...(rowsData?.PARA_243 === "Y"
              ? {
                  REALIZE_FLAG: rowsData.REALIZE_FLAG,
                }
              : {}),
          };

          let upd = utilFunction.transformDetailsData(newData, oldData);
          upd._UPDATEDCOLUMNS.push("COL_SER_CHARGE");

          isErrorFuncRef.current = {
            data: {
              ...newData,
              ...upd,
              ENTERED_COMP_CD: authState?.companyID,
              ENTERED_BRANCH_CD: authState?.user?.branchCode,
              TRAN_CD: rowsData?.TRAN_CD,
              PARA_812: rowsData?.PARA_812,
              PARA_243: rowsData?.PARA_243,
              TRAN_TYPE: trans_type,
              SR_CD: rowsData?.SR_CD,
              A_ENTRY_MODE: rowsData?.RETRIVE_ENTRY_MODE,
              COL_SER_CHARGE: data.COL_SER_CHARGE,
              PAY_SLIP_NEFT_DTL: [draftReqPara.current],
              DETAILS_DATA: {
                isNewRow: data.length > 0 ? data.CANCEL_REASON : [],
              },
              PAY_FOR: "",
              SDC: "",
              SCROLL1: "",
              THROUGH_CHANNEL: "",
              REQUEST_CD: "0",
              REMARKS: "",
              DD_NEFT: "DD",
              SCREEN_REF: apiReqFlag,
            },
            displayData,
            endSubmit,
            setFieldError,
          };

          mutation.mutate({
            ...isErrorFuncRef.current?.data,
          });
        } else if (screenFlag === "STOPPAYMENT") {
          let newData = {
            C_C_T_SP_C: data?.C_C_T_SP_C,
            STOP_PAY_DATE:
              format(new Date(data?.STOP_PAY_DATE), "dd/MMM/yyyy") ?? "",
            STOP_REMARKS: data?.STOP_REMARKS,
          };

          const oldData = {
            C_C_T_SP_C: draftDtlData[0]?.C_C_T_SP_C,
            STOP_PAY_DATE: draftDtlData[0]?.STOP_PAY_DATE,
            STOP_REMARKS: draftDtlData[0]?.STOP_REMARKS,
          };

          let upd = utilFunction.transformDetailsData(newData, oldData);

          isErrorFuncRef.current = {
            data: {
              ...newData,
              ...upd,
              ENTERED_COMP_CD: authState?.companyID,
              ENTERED_BRANCH_CD: authState?.user?.branchCode,
              TRAN_TYPE: trans_type,

              TRAN_CD: rowsData?.TRAN_CD,
              SR_CD: rowsData?.SR_CD,
              STOP_PAY_DATE:
                format(new Date(data?.STOP_PAY_DATE), "dd/MMM/yyyy") ?? "",
              STOP_REMARKS: data?.STOP_REMARKS,
              DETAILS_DATA: {
                isNewRow: data.length > 0 ? data.CANCEL_REASON : [],
              },
            },
            displayData,
            endSubmit,
            setFieldError,
          };

          mutation.mutate({
            ...isErrorFuncRef.current?.data,
          });
        }
      }
    }
  };
  return {
    onSubmitHandler,
    rejectMutaion,
    confirmMutation,
    mutation,
    voucherMutation,
  };
};
