import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Alert,
  extractMetaData,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";

import { AuthContext } from "pages_audit/auth";
import { dataContext, SaveEntryHandle } from "./lockerOperationTrns";
import { lockerTrnsEntryFormMetadata } from "./formMetaData";
import { getLockerOperationReciept, saveLockerOperationEntry } from "./api";
import { getVoucherList } from "../payslip-issue-entry/api";
import { RecieptPrint } from "./recieptPrint";
import { getdocCD } from "components/utilFunction/function";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";

/** ---------- Types ---------- */
interface EntryFormState {
  receiptData: any[];
  receiptPrint: boolean;
  signatureOpen: boolean;
  callCount: number;
}
interface ApiError {
  error_msg?: string;
  error_detail?: string;
}

export const LockerTrnsEntry = forwardRef<SaveEntryHandle>((_, ref) => {
  const { authState } = useContext(AuthContext);
  const { state, setState } = useContext(dataContext);
  const { payload } = state;
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [uiState, setUiState] = useState<EntryFormState>({
    receiptData: [],
    receiptPrint: false,
    signatureOpen: false,
    callCount: 0,
  });

  const formRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  const optionDataRef = useRef<any>(null);

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  /** ---------- Helpers ---------- */
  const handleReset = useCallback(() => {
    formRef.current?.handleFormReset?.({ preventDefault: () => {} }, "Reset");
    setUiState((p) => ({ ...p, callCount: p.callCount + 1 }));
    setState((p) => ({ ...p, payload: null, formData: null, gridData: null }));
  }, [setState]);

  /** ----------  Save Entry ---------- */
  useImperativeHandle(ref, () => ({
    saveEntry: async () => {
      formRef.current?.handleSubmit?.(
        { preventDefault: () => {} },
        "BUTTON_CLICK"
      );
    },
  }));

  /** ---------- Mutations ---------- */
  const receiptMutation = useMutation(getLockerOperationReciept, {
    onSuccess: async (data) => {
      if (isErrorFuncRef.current?.data?.OPER_STATUS === "I") {
        setUiState((p) => ({ ...p, receiptData: data }));
        const btn = await MessageBox({
          messageTitle: "Print",
          message: t("receiptPrintCnfmMsg"),
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (btn === "Yes") setUiState((p) => ({ ...p, receiptPrint: true }));
      }
      CloseMessageBox();
    },
    onError: CloseMessageBox,
  });

  const voucherMutation = useMutation(getVoucherList, {
    onSuccess: async (data: any) => {
      if (data?.[0]?.VOUCHER_MSG) {
        await MessageBox({
          message: data[0].VOUCHER_MSG,
          messageTitle: t("voucherConfirmationMSG"),
          icon: "INFO",
          buttonNames: ["Ok"],
        });
      }
      CloseMessageBox();
    },
  });

  const saveOperationMutation = useMutation(saveLockerOperationEntry, {
    onSuccess: async (data: any) => {
      handleReset();
      isErrorFuncRef.current?.endSubmit(false);
      setFormMode("add");

      if (data?.[0]?.TRAN_CD) {
        voucherMutation.mutate({
          A_ENT_COMP_CD: authState?.companyID,
          A_ENT_BRANCH_CD: authState?.user?.branchCode,
          A_TRAN_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
          A_TRAN_CD: data[0].TRAN_CD,
          A_TRN_FLAG: "IO",
          A_SDC: "LOCO",
          A_SR_CD: "0",
        });
      }

      enqueueSnackbar("Success", { variant: "success" });
      receiptMutation.mutate({
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        ACCT_TYPE: payload?.ACCT_TYPE,
        ACCT_CD: payload?.ACCT_CD,
        WORKING_DT: authState?.workingDate,
      });
    },
  });

  /** ---------- Handlers ---------- */
  const onSubmitHandler: SubmitFnType = async (
    data: Record<string, any>,
    displayData,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);
    const reqData = {
      _isNewRow: true,
      TRAN_DT: authState?.workingDate ?? "",
      ACCT_CD: data?.MAIN_ACCT_CD ?? "",
      ACCT_TYPE: data?.MAIN_ACCT_TYPE ?? "",
      ACCT_NM: data?.ACCT_NM ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
      CHEQUE_NO: data?.CHEQUE_NO ?? "",
      CHRG_AMT: data?.CHRG_AMT ?? "",
      CL_TIME: data?.CL_TIME ?? "",
      ST_TIME: data?.ST_TIME ?? "",
      CUST_SIGNATURE: "",
      EMP_ID: data?.EMP_ID ?? "",
      LOCKER_NO: data?.LOCKER_NO_ ?? "",
      LOC_SIZE_CD: data?.LOC_SIZE_CD ?? "",
      OPER_STATUS: data?.OPER_STATUS ?? "",
      REMARKS: data?.REMARKS ?? "",
      SERVICE_TAX: data?.SERVICE_CHRGE_AUTO ?? "",
      TRN_ACCT_CD: data?.TRF_ACCT_CD ?? "",
      TRN_ACCT_TYPE: data?.TRF_ACCT_TYPE ?? "",
      TRN_BRANCH_CD: data?.TRF_BRANCH_CD ?? "",
      TRN_COMP_CD: authState?.companyID ?? "",
      TYPE_CD: data?.TRX_CD ?? "",
    };

    isErrorFuncRef.current = {
      data: reqData,
      displayData,
      endSubmit,
      setFieldError,
    };

    const btn = await MessageBox({
      messageTitle: "Confirmation",
      message: `${t("Proceed")}?`,
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
      buttonNames: ["Yes", "No"],
    });

    if (btn === "Yes") saveOperationMutation.mutate(reqData);
  };

  /** Keyboard events (F9, Esc) */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F9" && payload?.ACCT_CD) {
        e.preventDefault();
        setUiState((p) => ({ ...p, signatureOpen: true }));
      } else if (e.key === "Escape") {
        e.preventDefault();
        setUiState((p) => ({ ...p, signatureOpen: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [payload]);

  /** Collect error states once */
  const errorStates = [receiptMutation, saveOperationMutation, voucherMutation];

  return (
    <>
      {errorStates.map(
        ({ error, isError }, idx) =>
          isError && (
            <Alert
              key={idx}
              severity="error"
              errorMsg={
                (error as ApiError)?.error_msg || t("Somethingwenttowrong")
              }
              errorDetail={(error as ApiError)?.error_detail ?? ""}
              color="error"
            />
          )
      )}

      {!saveOperationMutation?.isLoading && (
        <FormWrapper
          key="lockerTrnsEntryFormMetadata"
          ref={formRef}
          metaData={
            extractMetaData(
              lockerTrnsEntryFormMetadata,
              formMode
            ) as MetaDataType
          }
          displayMode={formMode}
          onSubmitHandler={onSubmitHandler}
          hideHeader
          formStyle={{ background: "white" }}
          onFormButtonClickHandel={(id) =>
            id === "SIGN" && setUiState((p) => ({ ...p, signatureOpen: true }))
          }
          initialValues={{}}
          formState={{
            MessageBox,
            Mode: formMode,
            saveFn: () =>
              ref &&
              (ref as React.RefObject<SaveEntryHandle>).current?.saveEntry(
                state?.formData,
                state?.gridData
              ),
            docCD,
            acctDtlReqPara: {
              TRF_ACCT_CD: {
                ACCT_TYPE: "TRF_ACCT_TYPE",
                BRANCH_CD: "TRF_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
          setDataOnFieldChange={(action, payload) => {
            if (action === "VIEWMST_PAYLOAD")
              setState((p) => ({ ...p, payload }));
            if (action === "DROPDOWN_DATA") optionDataRef.current = payload;
          }}
        />
      )}

      {uiState.receiptPrint && (
        <RecieptPrint
          cardData={uiState.receiptData}
          close={() => setUiState((p) => ({ ...p, receiptPrint: false }))}
        />
      )}

      {uiState.signatureOpen && (
        <PhotoSignWithHistory
          data={{
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            ACCT_TYPE: payload?.ACCT_TYPE ?? "",
            ACCT_CD: payload?.ACCT_CD ?? "",
          }}
          screenRef={docCD}
          onClose={() => setUiState((p) => ({ ...p, signatureOpen: false }))}
        />
      )}
    </>
  );
});
