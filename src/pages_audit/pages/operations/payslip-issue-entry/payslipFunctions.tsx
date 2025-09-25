import { Dialog } from "@mui/material";
import JointDetails from "./JointDetails";
import { useTranslation } from "react-i18next";
import { PayslipState } from "./PayslipIsuueEntryform";
import { ImageViewer, RemarksAPIWrapper } from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import { savePayslipEntry } from "./api";
import { enqueueSnackbar } from "notistack";

export interface PayslipFunctionsProps {
  payslipState: PayslipState;
  updatePayslipState: (updates: Partial<PayslipState>) => void;
  MessageBox: any;
  CloseMessageBox: any;
  jointDetailLoading: boolean;
  acctDtlData: Record<string, any>[];
  draftDtlData: Record<string, any>[];
  slipdataRefetch: any;
  closeForm: () => void;
  rows: Record<string, any>[];
}

export const PayslipFunctions = ({
  payslipState,
  updatePayslipState,
  MessageBox,
  CloseMessageBox,
  jointDetailLoading,
  acctDtlData,
  draftDtlData,
  slipdataRefetch,
  closeForm,
  rows,
}: PayslipFunctionsProps) => {
  const { t } = useTranslation();
  const deleteMutation = useMutation(savePayslipEntry, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      slipdataRefetch();
      CloseMessageBox();
      closeForm();
    },
  });
  return (
    <>
      {/* Joint Details */}
      <Dialog open={payslipState?.jointDtl} fullWidth maxWidth="lg">
        <JointDetails
          data={payslipState?.jointDtlData}
          loading={jointDetailLoading}
          onClose={() => updatePayslipState({ jointDtl: false })}
          hideHeader={false}
        />
      </Dialog>

      {/* Signature */}
      <Dialog
        open={payslipState.OpenSignature}
        PaperProps={{
          style: { height: "50%", width: "50%", overflow: "auto" },
        }}
        maxWidth="lg"
      >
        <ImageViewer
          blob={payslipState?.signBlob}
          fileName="Payslip Issue Entry"
          onClose={() => updatePayslipState({ OpenSignature: false })}
        />
      </Dialog>

      {/* Delete Remarks */}
      {payslipState?.openDltDialogue && (
        <RemarksAPIWrapper
          TitleText={"Enter Removal Remarks For PAYSLP ISSUE ENTRY RPT/14"}
          onActionNo={() => updatePayslipState({ openDltDialogue: false })}
          onActionYes={async (val, rows) => {
            const buttonName = await MessageBox({
              messageTitle: t("Confirmation"),
              message: t("DoYouWantDeleteRow"),
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
            });

            if (buttonName === "Yes") {
              let deleteReqPara = {
                REQ_FLAG: "A",
                TRAN_TYPE: "Delete",
                COMP_CD: acctDtlData[0].ENTERED_COMP_CD ?? "",
                BRANCH_CD: acctDtlData[0].ENTERED_BRANCH_CD ?? "",
                ACCT_CD: rows[0]?.data?.ACCT_CD ?? "",
                ACCT_TYPE: rows[0]?.data?.ACCT_TYPE ?? "",
                AMOUNT: `${rows[0].data?.TOTAL_AMT ?? ""}`,
                REMARKS: acctDtlData[0].REMARKS ?? "",
                SCREEN_REF: "RPT/14",
                CONFIRMED: rows[0]?.data?.CONFIRMED ?? "",
                USER_DEF_REMARKS: val ?? "",
                TRAN_CD: rows[0]?.data?.TRAN_CD ?? "",
                ENTERED_BY: draftDtlData[0].ENTERED_BY ?? "",
                PAYSLIP_NO: rows[0]?.data?.PAYSLIP_NO ?? "",
                DRAFT_MST_DATA: [
                  { COMP_CD: "", BRANCH_CD: "", ACCT_CD: "", ACCT_TYPE: "" },
                ],
                ADD_DRAFT_DATA: "N",
                _isNewRow: false,
              };

              deleteMutation.mutate(deleteReqPara);
            }
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={payslipState?.openDltDialogue}
          defaultValue={"WRONG ENTRY FROM PAYSLIP ISSUE ENTRY (RPT/14) "}
          rows={rows}
        />
      )}
    </>
  );
};
