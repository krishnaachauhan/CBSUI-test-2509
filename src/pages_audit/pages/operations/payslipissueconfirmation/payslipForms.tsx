import { Paper } from "@mui/material";
import {
  FormWrapper,
  LoaderPaperComponent,
  MetaDataType,
  extractMetaData,
} from "@acuteinfo/common-base";

import {
  DraftdetailsFormMetaData,
  TotaldetailsFormMetaData,
} from "../payslip-issue-entry/paySlipMetadata";
import {
  AccdetailsFormMetaData,
  PayslipdetailsFormMetaData,
} from "./confirmationFormMetaData";
import { useContext } from "react";
import { AuthContext } from "pages_audit/auth";

type PayslipViewFormsProps = {
  rows: any[];
  acctDtlData: any[];
  draftDtlData: any[];
  isAcctDtlLoading: boolean;
  isdraftDtlLoading: boolean;
  myChequeFormRef: React.Ref<any>;
  updatePayslipUiState: any;
  jointDetailMutation: any;
};

export const PayslipViewForms: React.FC<PayslipViewFormsProps> = ({
  rows,
  acctDtlData,
  draftDtlData,
  isAcctDtlLoading,
  isdraftDtlLoading,
  myChequeFormRef,
  updatePayslipUiState,
  jointDetailMutation,
}) => {
  const { authState } = useContext(AuthContext);
  if (isdraftDtlLoading || isAcctDtlLoading) {
    return (
      <Paper sx={{ display: "flex", justifyContent: "center" }}>
        <LoaderPaperComponent />
      </Paper>
    );
  }

  return (
    <>
      <FormWrapper
        ref={myChequeFormRef}
        key="basicinfoformview"
        metaData={
          extractMetaData(PayslipdetailsFormMetaData, "view") as MetaDataType
        }
        displayMode="view"
        onSubmitHandler={() => {}}
        hideHeader
        initialValues={{
          TRAN_DT: rows?.[0]?.data.TRAN_DT,
          SLIP_CD: rows?.[0]?.data?.SLIP_CD,
          PENDING_FLAG:
            rows?.[0]?.data.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        }}
        formStyle={{ background: "white" }}
      />

      {/* Account Details */}
      <FormWrapper
        key="accdetailsformst"
        metaData={
          extractMetaData(AccdetailsFormMetaData, "view") as MetaDataType
        }
        displayMode="view"
        onSubmitHandler={() => {}}
        onFormButtonClickHandel={async (id) => {
          const startIndex = id.indexOf("[") + 1;
          const endIndex = id.indexOf("]");
          const btnIndex = parseInt(id.substring(startIndex, endIndex));

          if (id === `PAYSLIP_MST_DTL[${btnIndex}].JOINT_DTL`) {
            const retrivedObj = acctDtlData ? acctDtlData[btnIndex] : [];
            const { ACCT_CD, ACCT_TYPE } = retrivedObj;
            jointDetailMutation.mutate({
              ACCT_CD,
              ACCT_TYPE,
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState.user.branchCode,
            });
            updatePayslipUiState({ isJointDetailOpen: true });
          }

          if (id === `PAYSLIP_MST_DTL[${btnIndex}].SIGN`) {
            const retrievedObject = acctDtlData ? acctDtlData[btnIndex] : [{}];
            updatePayslipUiState({ isPhotoSignOpen: true });
            updatePayslipUiState({
              isPhotoSignOpen: true,
              photoSignReqPara: {
                ...retrievedObject,
              },
            });
          }
        }}
        initialValues={{
          PAYSLIP_MST_DTL: acctDtlData ?? [],
        }}
        hideHeader
        formState={{
          Mode: "view",
        }}
        formStyle={{ background: "white", height: "31vh", overflow: "scroll" }}
      />

      {/* Draft Details */}
      <FormWrapper
        key="draftmstdetails"
        metaData={
          extractMetaData(DraftdetailsFormMetaData, "view") as MetaDataType
        }
        displayMode="view"
        onSubmitHandler={() => {}}
        initialValues={{
          PAYSLIP_DRAFT_DTL: draftDtlData ?? [],
          FORM_MODE: "view",
        }}
        hideHeader
        formStyle={{ background: "white", height: "40vh", overflow: "scroll" }}
      />

      {/* Total Details */}
      <FormWrapper
        key="totaldetaisformst"
        metaData={
          extractMetaData(TotaldetailsFormMetaData, "view") as MetaDataType
        }
        displayMode="view"
        onSubmitHandler={() => {}}
        initialValues={{}}
        hideHeader
        formStyle={{ background: "white", height: "auto" }}
      />
    </>
  );
};
