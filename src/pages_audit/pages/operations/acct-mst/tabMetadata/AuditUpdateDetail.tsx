import { Box, Dialog } from "@mui/material";
import { AuditMetadata } from "../tabMetadata/AuditUpdateDetailMetdata";
import * as API from "../api";
import { PaperComponent } from "../../DailyTransaction/TRN001/components";
import { Alert, GradientButton, LayoutReport } from "@acuteinfo/common-base";
import { t } from "i18next";
const UpdateAuditDetail = ({
  isopen,
  rowsData,
  onClose,
  openActionDialog,
  confirmMutation,
}) => {
  return (
    <>
      <Dialog
        open={isopen}
        className="acctUpdDetailGrid"
        PaperComponent={PaperComponent}
        id="draggable-dialog-title"
        aria-labelledby="draggable-dialog-title"
        PaperProps={{
          style: {
            width: "90%",
          },
        }}
        maxWidth="lg"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            localStorage.removeItem("commonClass");
            onClose();
          }
        }}
      >
        <div id="draggable-dialog-title" style={{ cursor: "move" }}>
          {confirmMutation.isError && (
            <Alert
              severity={confirmMutation.error?.severity ?? "error"}
              errorMsg={
                confirmMutation.error?.error_msg ?? "Something went wrong.."
              }
              errorDetail={confirmMutation.error?.error_detail}
              color="error"
            />
          )}
          <LayoutReport
            key={"AcctMstConfirmAuditDetail"}
            title={`Confirmation Column Detail A/C Number: ${rowsData?.ACCT_CD}`}
            metaData={AuditMetadata}
            reportID="/enfinityCommonServiceAPI/GETDYNAMICDATA/GETACCTUPDDTL"
            dataFetcher={API.getAcctUpdateDTL}
            columns={AuditMetadata.columns}
            groups={AuditMetadata.groups}
            autoFetch
            otherAPIRequestPara={{
              COMP_CD: rowsData?.COMP_CD ?? "",
              BRANCH_CD: rowsData?.BRANCH_CD ?? "",
              ACCT_TYPE: rowsData?.ACCT_TYPE ?? "",
              ACCT_CD: rowsData?.ACCT_CD ?? "",
              REQ_CD: rowsData?.REQUEST_ID ?? "",
            }}
            onClose={onClose}
            allowRefetch
          />
        </div>
        <Box
          sx={{
            position: "fixed",
            right: 20,
            bottom: 15,
            zIndex: 1300,
            display: "flex",
            gap: 1,
          }}
        >
          <GradientButton onClick={() => openActionDialog("Y")} color="primary">
            {t("Confirm")}
          </GradientButton>
          <GradientButton onClick={() => openActionDialog("R")} color="primary">
            {t("Reject")}
          </GradientButton>
        </Box>
      </Dialog>
    </>
  );
};
export default UpdateAuditDetail;
