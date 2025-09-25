import { AuthContext } from "pages_audit/auth";
import { useContext, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import {
  commonDataRetrive,
  getJointDetailsList,
  headerDataRetrive,
} from "../payslip-issue-entry/api";

import { Dialog } from "@mui/material";
import JointDetails from "../payslip-issue-entry/JointDetails";

import { t } from "i18next";

import * as API from "./api";
import { enqueueSnackbar } from "notistack";
import { usePopupContext, ClearCacheProvider } from "@acuteinfo/common-base";
import { HeaderBar } from "./headerBar";
import { PayslipViewForms } from "./payslipForms";

type PayslipUiState = {
  isJointDetailOpen: boolean;
  isConfirmHistoryOpen: boolean;
  isPhotoSignOpen: boolean;
  isDeleteDialogOpen: boolean;
  photoSignReqPara: Record<string, any>;
  jointDtlData: Record<string, any>[];
};
function PayslipConfirmationForm({ closeDialog, isDataChangedRef }) {
  const { authState } = useContext(AuthContext);
  const { state: rows } = useLocation();
  const myChequeFormRef = useRef<any>(null);
  const { CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;
  const [payslipUiState, setPayslipUiState] = useState<PayslipUiState>({
    isJointDetailOpen: false,
    isConfirmHistoryOpen: false,
    isPhotoSignOpen: false,
    isDeleteDialogOpen: false,
    photoSignReqPara: {},
    jointDtlData: [],
  });

  const requestData = {
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState.user.branchCode,
    TRAN_CD: rows?.[0]?.data.TRAN_CD,
  };
  const {
    data: acctDtlData,
    isLoading: isAcctDtlLoading,
    isError: isAcctDtlError,
    error: acctDtlError,
  } = useQuery(
    ["headerData", requestData],
    () => headerDataRetrive(requestData),
    {}
  );

  const {
    data: draftDtlData,
    isLoading: isdraftDtlLoading,
    isError: isDraftDtlError,
    error: draftDtlError,
  } = useQuery(
    ["draftdata", requestData],
    () => commonDataRetrive(requestData),
    {}
  );

  const jointDetailMutation = useMutation(getJointDetailsList, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      updatePayslipUiState({
        jointDtlData: data,
      });
    },
  });
  const confirmMutation = useMutation(
    "confirmMutation",
    API.getEntryConfirmed,
    {
      onSuccess: (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });

        isDataChangedRef.current = true;
        CloseMessageBox();
        closeDialog();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  const rejectMutaion = useMutation("rejectMutaion", API.getEntryReject, {
    onSuccess: (data) => {
      updatePayslipUiState({ isDeleteDialogOpen: false });
      enqueueSnackbar(`${t("RecordRemovedMsg")}`, {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
    onError: async (error: any) => {
      CloseMessageBox();
    },
  });

  const updatePayslipUiState = (updates: Partial<PayslipUiState>) =>
    setPayslipUiState((prev) => ({ ...prev, ...updates }));

  const errorDataa: any = [
    {
      error: jointDetailMutation?.error,
      isError: jointDetailMutation?.isError,
    },
    {
      error: confirmMutation?.error,
      isError: confirmMutation?.isError,
    },
    {
      error: acctDtlError,
      isError: isAcctDtlError,
    },
    {
      error: draftDtlError,
      isError: isDraftDtlError,
    },
  ];

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={true}
      style={{ height: "100%" }}
      PaperProps={{
        style: { width: "100%", height: "100%", padding: "5px" },
      }}
    >
      <HeaderBar
        acctDtlData={acctDtlData}
        closeDialog={closeDialog}
        rows={rows}
        draftDtlData={draftDtlData}
        currentPath={currentPath}
        confirmMutation={confirmMutation}
        errorDataa={errorDataa}
        rejectMutaion={rejectMutaion}
        payslipUiState={payslipUiState}
        updatePayslipUiState={updatePayslipUiState}
      />

      <PayslipViewForms
        rows={rows}
        acctDtlData={acctDtlData}
        draftDtlData={draftDtlData}
        isAcctDtlLoading={isAcctDtlLoading}
        isdraftDtlLoading={isdraftDtlLoading}
        myChequeFormRef={myChequeFormRef}
        updatePayslipUiState={updatePayslipUiState}
        jointDetailMutation={jointDetailMutation}
      />
      <Dialog open={payslipUiState.isJointDetailOpen} fullWidth maxWidth="lg">
        <JointDetails
          data={payslipUiState?.jointDtlData}
          loading={jointDetailMutation.isLoading}
          onClose={() => {
            updatePayslipUiState({ isJointDetailOpen: false });
          }}
          hideHeader={false}
        />
      </Dialog>
    </Dialog>
  );
}

export const PayslipConfirmationFormDetails = ({
  closeDialog,
  isDataChangedRef,
}) => {
  return (
    <ClearCacheProvider>
      <PayslipConfirmationForm
        closeDialog={closeDialog}
        isDataChangedRef={isDataChangedRef}
      />
    </ClearCacheProvider>
  );
};
