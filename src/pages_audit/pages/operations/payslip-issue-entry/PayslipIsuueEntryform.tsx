import { useContext, useState } from "react";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import {
  commonDataRetrive,
  headerDataRetrive,
  getSlipTransCd,
  getSlipNo,
} from "./api";
import { useLocation } from "react-router-dom";
import { ClearCacheProvider, usePopupContext } from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useDialogContext } from "./DialogContext";
import { PaySlipEntryFormHeader } from "./PaySlipEntryFormHeader";
import PayslipFormsSection from "./payslipFormsSection";
import RegionAddMaster from "./regionAddMaster";
import { PayslipFunctions } from "./payslipFunctions";
import { usePayslip } from "./usePayslip";

export interface PayslipState {
  formMode: "new" | "edit" | "view";
  regionDialouge: boolean;
  jointDtl: boolean;
  OpenSignature: boolean;
  jointDtlData: any[];
  openForm: boolean;
  mstState: {
    PAYSLIP_MST_DTL: Record<string, any>[];
  };
  signBlob: File | any;
  openDltDialogue: boolean;
  refetchRegion: number;
  draftState: {
    PAYSLIP_DRAFT_DTL: Record<string, any>[];
  };
}
const PayslipIsuueEntryform = ({
  defaultView,
  closeDialog,
  slipdataRefetch,
}) => {
  let currentPath = useLocation().pathname;
  const { state: rows } = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { trackDialogClass } = useDialogContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const [payslipState, setPayslipState] = useState<PayslipState>({
    formMode: defaultView,
    regionDialouge: false,
    jointDtl: false,
    OpenSignature: false,
    jointDtlData: [],
    openForm: true,
    mstState: {
      PAYSLIP_MST_DTL: [
        {
          CHEQUE_DATE: authState?.workingDate ?? "",
          PENDING_FLAG: "Y",
          COMP_CD: authState?.companyID,
        },
      ],
    },
    signBlob: "",
    openDltDialogue: false,
    refetchRegion: 0,
    draftState: {
      PAYSLIP_DRAFT_DTL: [
        {
          PENDING_FLAG: "Y",
          ENTERED_COMP_CD: authState?.companyID,
          COMP_CD: authState?.companyID,
        },
      ],
    },
  });

  const updatePayslipState = (updates: Partial<typeof payslipState>) => {
    setPayslipState((prev: any) => ({
      ...prev,
      ...updates,
    }));
  };

  const requestData = {
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState.user.branchCode,
    TRAN_CD: rows?.[0]?.data.TRAN_CD,
  };

  const {
    data: slipnoData,
    isLoading: isslipnoDataLoading,
    isError: isSlipnoDataError,
    error: slipnoError,
  } = useQuery(
    ["getSlipNo", requestData],
    () =>
      getSlipNo({
        ENT_COMP_CD: authState?.companyID,
        ENT_BRANCH_CD: authState?.user?.branchCode,
        TRAN_DT: authState?.workingDate,
      }),
    {
      enabled: payslipState?.formMode == "new",
    }
  );

  const {
    data: acctDtlData,
    isLoading: isAcctDtlLoading,
    isError: isAcctDtlError,
    error: acctDtlError,
  } = useQuery(
    ["headerData", requestData],
    () => headerDataRetrive(requestData),
    {
      enabled: payslipState?.formMode !== "new",
    }
  );

  const {
    data: draftDtlData,
    isLoading: isdraftDtlLoading,
    isError: isdraftDtlError,
    error: draftDtlError,
  } = useQuery(
    ["draftdata", requestData],
    () => commonDataRetrive(requestData),
    {
      enabled: payslipState?.formMode !== "new",
    }
  );

  const {
    data: slipTransCd,
    isError: isSlipTranCdError,
    error: slipTransCdError,
  } = useQuery(
    ["getpaySliptranscd"],
    () =>
      getSlipTransCd({
        ENT_COMP_CD: authState?.companyID,
        ENT_BRANCH_CD: authState?.user?.branchCode,
      }),
    {
      enabled: payslipState?.formMode == "new",
    }
  );

  const updatedDraftDtlData = draftDtlData
    ? draftDtlData.map((item) => ({
        ...item,
        HIDDEN_PAYSLIPNO: item.PAYSLIP_NO,
      }))
    : [];

  const {
    onSubmitHandler,
    handleClick,
    myChequeFormRef,
    voucherMutation,
    jointDetailMutation,
    validDataNutation,
    PayslipSaveMutation,
  } = usePayslip({
    draftDtlData,
    acctDtlData,
    draftDtlError,
    payslipState,
    authState,
    MessageBox,
    closeDialog,
    CloseMessageBox,
    updatePayslipState,
    slipTransCd,
    slipdataRefetch,
    rows,
  });
  const errorDataa: any = [
    { error: draftDtlError, isError: isdraftDtlError },
    { error: acctDtlError, isError: isAcctDtlError },
    { error: slipnoError, isError: isSlipnoDataError },
    { error: slipTransCdError, isError: isSlipTranCdError },
    { error: validDataNutation?.error, isError: validDataNutation?.isError },
    {
      error: PayslipSaveMutation?.error,
      isError: PayslipSaveMutation?.isError,
    },
    { error: voucherMutation?.error, isError: voucherMutation?.isError },
  ];

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={true}
      style={{ height: "100%", width: "100%" }}
      PaperProps={{
        style: { maxWidth: "100%", height: "100%" },
      }}
    >
      <div className="form">
        <PaySlipEntryFormHeader
          rows={rows}
          currentPath={currentPath}
          isdraftDtlLoading={isdraftDtlLoading}
          isAcctDtlLoading={isAcctDtlLoading}
          validDataNutation={validDataNutation}
          PayslipSaveMutation={PayslipSaveMutation}
          handleClick={handleClick}
          closeDialog={closeDialog}
          payslipState={payslipState}
          updatePayslipState={updatePayslipState}
          authState={authState}
          MessageBox={MessageBox}
          errorDataa={errorDataa}
        />
        <PayslipFormsSection
          authState={authState}
          rows={rows}
          isslipnoDataLoading={isslipnoDataLoading}
          isAcctDtlLoading={isAcctDtlLoading}
          isdraftDtlLoading={isdraftDtlLoading}
          slipnoData={slipnoData}
          acctDtlData={acctDtlData}
          updatedDraftDtlData={updatedDraftDtlData}
          docCD={docCD}
          MessageBox={MessageBox}
          trackDialogClass={trackDialogClass}
          myChequeFormRef={myChequeFormRef}
          jointDetailMutation={jointDetailMutation}
          onSubmitHandler={onSubmitHandler}
          payslipState={payslipState}
          updatePayslipState={updatePayslipState}
        />
      </div>
      <RegionAddMaster
        open={payslipState?.regionDialouge}
        onClose={() => {
          updatePayslipState({ regionDialouge: false });
          trackDialogClass("");
        }}
        requestData={requestData}
        authState={authState}
        MessageBox={MessageBox}
        CloseMessageBox={CloseMessageBox}
        payslipState={payslipState}
        updatePayslipState={updatePayslipState}
      />
      <PayslipFunctions
        rows={rows}
        MessageBox={MessageBox}
        CloseMessageBox={CloseMessageBox}
        jointDetailLoading={jointDetailMutation?.isLoading}
        acctDtlData={acctDtlData}
        draftDtlData={draftDtlData}
        slipdataRefetch={slipdataRefetch}
        closeForm={closeDialog}
        payslipState={payslipState}
        updatePayslipState={updatePayslipState}
      />
    </Dialog>
  );
};

export const PaySlipIssueEntryData = ({
  defaultView,
  closeDialog,
  slipdataRefetch,
}) => {
  return (
    <ClearCacheProvider>
      <PayslipIsuueEntryform
        defaultView={defaultView}
        closeDialog={closeDialog}
        slipdataRefetch={slipdataRefetch}
      />
    </ClearCacheProvider>
  );
};
