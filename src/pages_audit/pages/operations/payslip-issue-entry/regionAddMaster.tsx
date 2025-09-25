import React, { useEffect } from "react";
import { Dialog, CircularProgress } from "@mui/material";
import { GradientButton, MasterDetailsForm } from "@acuteinfo/common-base";
import { t } from "i18next";
import { addRegionData, getRegionDDData2 } from "./api";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { PayslipState } from "./PayslipIsuueEntryform";
import { regionMasterMetaData } from "./paySlipMetadata";

interface RegionAddMasterProps {
  open: boolean;
  onClose: () => void;
  requestData: Record<string, any>;
  authState: any;
  MessageBox: any;
  CloseMessageBox: any;
  payslipState: PayslipState;
  updatePayslipState: (updates: Partial<PayslipState>) => void;
}

const RegionAddMaster: React.FC<RegionAddMasterProps> = ({
  open,
  onClose,
  requestData,
  authState,
  MessageBox,
  CloseMessageBox,
  payslipState,
  updatePayslipState,
}) => {
  const { data: regionGridData, refetch: regionRefetch } = useQuery(
    ["regionData", requestData],
    () => getRegionDDData2(requestData),
    {
      enabled: payslipState?.formMode === "new",
    }
  );
  const regionmutation = useMutation(addRegionData, {
    onSuccess: () => {
      regionRefetch();
      updatePayslipState({
        refetchRegion: payslipState.refetchRegion + 1,
        regionDialouge: false,
      });
      enqueueSnackbar(t("insertSuccessfully"), { variant: "success" });
      CloseMessageBox();
    },
    onError: async (error: any) => {
      MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  useEffect(() => {
    return () => {
      regionmutation.reset();
    };
  }, [open]);
  return (
    <Dialog
      open={open}
      className="masterDtl"
      PaperProps={{ style: { width: "100%", padding: "7px" } }}
    >
      <MasterDetailsForm
        key={"regionMasterMetaData" + payslipState?.formMode}
        metaData={regionMasterMetaData}
        isError={regionmutation?.isError}
        errorObj={regionmutation?.error}
        formStyle={{ width: "100%" }}
        initialData={{
          _isNewRow: true,
          regionGridData,
          DETAILS_DATA: regionGridData,
        }}
        onSubmitData={({
          data,
          resultValueObj,
          resultDisplayValueObj,
          endSubmit,
        }) => {
          const { COMM_TYPE_CD, REGION_CD, REGION_NM } = data ?? {};

          if (!COMM_TYPE_CD || !REGION_CD) {
            endSubmit(false);
            return;
          }

          regionmutation.mutate({
            COMM_TYPE_CD,
            REGION_CD,
            REGION_NM,
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            _isNewRow: true,
          });

          endSubmit(true);
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={handleSubmit}
              color="primary"
              endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={onClose} color="primary">
              {t("Close")}
            </GradientButton>
          </>
        )}
      </MasterDetailsForm>
    </Dialog>
  );
};

export default RegionAddMaster;
