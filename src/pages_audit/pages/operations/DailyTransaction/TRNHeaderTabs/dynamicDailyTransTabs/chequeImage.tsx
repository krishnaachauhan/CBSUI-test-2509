import { ChequeSignImage } from "pages_audit/pages/operations/inwardClearing/inwardClearingForm/chequeSignImage";
import { getInwardChequeSignFormData } from "pages_audit/pages/operations/inwardClearing/api";
import { format } from "date-fns";
import { Alert } from "reactstrap";
import { useQuery } from "react-query";
import { Dialog, DialogActions } from "@mui/material";
import { GradientButton, LoaderPaperComponent } from "@acuteinfo/common-base";
import { t } from "i18next";

export const ChequeImageWrapper = ({
  isOpen,
  reqData,
  authState,
  SCREEN_REF,
  onClose,
}) => {
  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["getSnapShotList", { reqData }],
    () => {
      return getInwardChequeSignFormData({
        ENTERED_BRANCH_CD: reqData?.current?.ENTERED_BRANCH_CD ?? "",
        COMP_CD: reqData?.current?.COMP_CD ?? "",
        BRANCH_CD: reqData?.current?.BRANCH_CD ?? "",
        ACCT_TYPE: reqData?.current?.ACCT_TYPE ?? "",
        ACCT_CD: reqData?.current?.ACCT_CD ?? "",
        TRAN_CD: reqData?.current?.REF_TRAN_CD ?? "",
        TRAN_DT: reqData?.current?.TRN_DATE
          ? format(new Date(reqData?.current?.TRN_DATE), "dd/MMM/yyyy")
          : "",
        WITH_SIGN: "N",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        SCREEN_REF: SCREEN_REF ?? "",
      });
    }
  );
  return (
    <Dialog
      open={isOpen}
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      maxWidth="md"
    >
      {isLoading ? <LoaderPaperComponent /> : null}
      {isError || error ? (
        <Alert
          severity="error"
          errorMsg={error?.error_msg || "Unknown error occured"}
          errorDetail={error?.error_detail || ""}
        />
      ) : null}
      {!isLoading && !isFetching && data && data.length > 0 && (
        <>
          <DialogActions>
            <GradientButton onClick={() => onClose()}>
              {t("Close")}
            </GradientButton>
          </DialogActions>
          <ChequeSignImage imgData={data} />
        </>
      )}
    </Dialog>
  );
};
