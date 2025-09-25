import { Box, Dialog } from "@mui/material";
import { CkycAuditMetadata } from "./AuditUpdDtlGridMetadata";
import { getCustUpdDtl } from "./api";
import i18n from "components/multiLanguage/languagesConfiguration";
import { Alert, GradientButton, LayoutReport } from "@acuteinfo/common-base";
import { t } from "i18next";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";

const CkycUpdAuditDetails = ({
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
        onKeyDown={(event) => {
          if (event?.key === "Escape") {
            onClose();
          }
        }}
        maxWidth="lg"
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
            key={"CkycConfirmAuditDetails"}
            title={`Confirmation Column Detail for Customer ID: ${rowsData?.CUSTOMER_ID}`}
            metaData={CkycAuditMetadata}
            reportID="/enfinityCommonServiceAPI/GETDYNAMICDATA/GETCUSTUPDDTL"
            dataFetcher={getCustUpdDtl}
            columns={CkycAuditMetadata.columns}
            groups={CkycAuditMetadata.groups}
            autoFetch
            otherAPIRequestPara={{
              COMP_CD: rowsData?.COMP_CD ?? "",
              BRANCH_CD: rowsData?.BRANCH_CD ?? "",
              CUSTOMER_ID: rowsData?.CUSTOMER_ID ?? "",
              REQ_CD: rowsData?.REQUEST_ID ?? "",
              DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
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
export default CkycUpdAuditDetails;
