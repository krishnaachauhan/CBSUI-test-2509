import {
  Alert,
  ClearCacheProvider,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { headerDataRetrive } from "../api";
import { useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { t } from "i18next";
import i18n from "components/multiLanguage/languagesConfiguration";
import { revalidateDDform } from "./generateDDFormmetaData";
import { makeStyles } from "@mui/styles";
import NewDDForm from "./newDDForm";
import DDTransactionForm from "./payslipDDEntryForm.tsx";
import { usePayslipDDTransactions } from "./usePayslipDDTransactions";
import { getdocCD } from "components/utilFunction/function";

export type EntryFormState = {
  formMode: string;
  openNewDDForm: boolean;
  isDeleteRemark: boolean;
  draftReqPara: any;
};
const EntryFormView = ({
  onClose,
  currentIndex,
  handlePrev,
  handleNext,
  rowsData,
  headerLabel,
  screenFlag,
  trans_type,
  apiReqFlag,
  totalData,
  defaultView,
}) => {
  const [entryFormState, setEntryFormState] = useState<EntryFormState>({
    formMode: defaultView,
    openNewDDForm: false,
    isDeleteRemark: false,
    draftReqPara: null,
  });
  const updateEntryFormState = (updates: Partial<EntryFormState>) => {
    setEntryFormState((prev) => ({ ...prev, ...updates }));
  };
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const formRef = useRef<any>(null);
  const ddformRef = useRef<any>(null);
  const draftReqPara = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const requestData = {
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState.user.branchCode,
    TRAN_CD: rowsData?.TRAN_CD,
    SR_CD: rowsData?.SR_CD,
  };

  useEffect(() => {
    if (screenFlag === "CANCELCONFRM") {
      updateEntryFormState({ formMode: "edit" });
    } else if (
      rowsData?.RETRIVE_ENTRY_MODE === "E" ||
      rowsData?.RETRIVE_ENTRY_MODE === "D" ||
      rowsData?.RETRIVE_ENTRY_MODE === "S"
    ) {
      updateEntryFormState({ formMode: "new" });
    }
  }, [screenFlag]);
  const {
    data: acctDtlData,
    isLoading: isAcctDtlLoading,
    error: AcctDtlError,
    isError: IsAcctDtlError,
  } = useQuery(["headerData", requestData], () =>
    headerDataRetrive(requestData)
  );

  const {
    data: reasonData,
    isLoading: isReasonDataLoading,
    error: DraftDtlError,
    isError: IsDraftDtlError,
  } = useQuery(["getReasonData", requestData], () =>
    API.getReasonData(requestData)
  );

  const {
    data: draftDtlData,
    isLoading: isdraftDtlLoading,
    error: DraftDtlDataError,
    isError: IsDraftDtlDataError,
  } = useQuery(["draftdata", requestData], () =>
    API.getRealizedHeaderData(requestData)
  );

  const {
    data: stopPaymentHistory,
    isLoading: stopPaymentLoading,
    error: StopPaymentHistoryError,
    isError: IsStopPaymentHistoryError,
  } = useQuery(
    ["getPayslipStopPaymentHistory", {}],
    () =>
      API.getPayslipStopPaymentHistory({
        ENTERED_COMP_CD:
          draftDtlData?.[0]?.ENTERED_COMP_CD ?? authState?.companyID,
        ENTERED_BRANCH_CD:
          draftDtlData?.[0]?.ENTERED_BRANCH_CD ?? authState?.user?.branchCode,
        TRAN_CD: rowsData.TRAN_CD,
      }),
    {
      enabled: !isdraftDtlLoading,
    }
  );
  const {
    onSubmitHandler,
    rejectMutaion,
    confirmMutation,
    mutation,
    voucherMutation,
  } = usePayslipDDTransactions(
    rowsData,
    screenFlag,
    trans_type,
    apiReqFlag,
    authState,
    onClose,
    MessageBox,
    CloseMessageBox,
    updateEntryFormState,
    ddformRef,
    draftReqPara,
    draftDtlData
  );

  const { data: cancelChargeData, isLoading: IScanclChrgDtlLoading } = useQuery<
    any,
    any
  >(
    ["getPayslipCancelCharge"],
    () =>
      API.getPayslipCancelCharge({
        A_COMP_CD: authState?.companyID ?? "",
        A_BRANCH_CD: authState?.user?.branchCode ?? "",
        A_ACCT_TYPE: rowsData?.ACCT_TYPE ?? "",
        A_ACCT_CD: rowsData?.ACCT_CD ?? "",
        A_AMOUNT: rowsData?.AMOUNT ?? "",
        A_ENT_BRANCH: rowsData?.ENTERED_BRANCH_CD ?? "",
        A_BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
        A_TRAN_TYPE: trans_type ?? "",
        A_GD_DATE: authState?.workingDate ?? "",
        A_USER: authState?.user?.id ?? "",
        A_USER_LEVEL: authState?.role ?? "",
        A_SCREEN_REF: apiReqFlag ?? "",
        A_LANG: i18n.resolvedLanguage ?? "",
      }),
    {
      enabled: true,
    }
  );

  const errors: any = [
    // Queries
    { error: AcctDtlError, isError: IsAcctDtlError },
    { error: DraftDtlError, isError: IsDraftDtlError },
    { error: DraftDtlDataError, isError: IsDraftDtlDataError },
    { error: StopPaymentHistoryError, isError: IsStopPaymentHistoryError },
    { error: voucherMutation?.error, isError: voucherMutation?.isError },
    { error: rejectMutaion?.error, isError: rejectMutaion?.isError },
    { error: mutation?.error, isError: mutation?.isError },
    { error: confirmMutation?.error, isError: confirmMutation?.isError },
    { error: confirmMutation?.error, isError: confirmMutation?.isError },
  ];

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            height: "auto",
            width: "100%",
          },
        }}
        maxWidth="xl"
      >
        {errors.map(
          ({ error, isError }, index) =>
            isError && (
              <Alert
                key={error}
                severity="error"
                errorMsg={error?.error_msg || t("Somethingwenttowrong")}
                errorDetail={error?.error_detail ?? ""}
                color="error"
              />
            )
        )}
        <DDTransactionForm
          entryFormState={entryFormState}
          updateEntryFormState={updateEntryFormState}
          isLoading={
            isAcctDtlLoading ||
            isdraftDtlLoading ||
            stopPaymentLoading ||
            isReasonDataLoading ||
            IScanclChrgDtlLoading
          }
          onSubmitHandler={onSubmitHandler}
          MessageBox={MessageBox}
          screenFlag={screenFlag}
          apiReqFlag={apiReqFlag}
          trans_type={trans_type}
          draftDtlData={draftDtlData}
          acctDtlData={acctDtlData}
          cancelChargeData={cancelChargeData}
          rowsData={rowsData}
          stopPaymentHistory={stopPaymentHistory}
          reasonData={reasonData ?? []}
          authState={authState}
          formRef={formRef}
          handlePrev={handlePrev}
          handleNext={handleNext}
          totalData={totalData}
          currentIndex={currentIndex}
          mutation={mutation}
          confirmMutation={confirmMutation}
          onClose={onClose}
          rejectMutaion={rejectMutaion}
          headerLabel={headerLabel}
        />
      </Dialog>
      <NewDDForm
        entryFormState={entryFormState}
        updateEntryFormState={updateEntryFormState}
        ddformRef={ddformRef}
        draftDtlData={draftDtlData}
        acctDtlData={acctDtlData}
        rowsData={rowsData}
        trans_type={trans_type}
        apiReqFlag={apiReqFlag}
        authState={authState}
        mutation={mutation}
        isErrorFuncRef={isErrorFuncRef}
        screenFlag={screenFlag}
        currentIndex={currentIndex}
      />
    </>
  );
};

export const EntryForm = ({
  onClose,
  currentIndexRef,
  handleNext,
  handlePrev,
  headerLabel,
  screenFlag,
  trans_type,
  apiReqFlag,
  totalData,
  defaultView,
}) => {
  const { state: rows } = useLocation();
  currentIndexRef.current = rows?.index;

  return (
    <ClearCacheProvider>
      <EntryFormView
        onClose={onClose}
        rowsData={rows?.gridData}
        currentIndex={rows.index}
        handleNext={handleNext}
        handlePrev={handlePrev}
        headerLabel={headerLabel}
        screenFlag={screenFlag}
        trans_type={trans_type}
        apiReqFlag={apiReqFlag}
        totalData={totalData}
        defaultView={defaultView}
      />
    </ClearCacheProvider>
  );
};
