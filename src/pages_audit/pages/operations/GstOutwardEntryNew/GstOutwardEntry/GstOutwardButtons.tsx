import { CircularProgress } from "@mui/material";
import { t } from "i18next";

import { GradientButton } from "@acuteinfo/common-base";

const GstOutwardButtons = ({
  defaultView,
  handleSubmit,
  closeDialog,
  handleRemove,
  Accept,
  viewVoucher,
  isSubmitting,
  disableButton,
  saveButton,
  authState,
  rows,
  viewVoucherMutate,
}) => {
  return (
    <>
      {defaultView === "new" && (
        <>
          <GradientButton
            onClick={(event) => handleSubmit(event, "Save")}
            color={"primary"}
            disabled={isSubmitting || disableButton}
          >
            {t("Save")}
          </GradientButton>
          <GradientButton onClick={closeDialog} color={"primary"}>
            {t("Close")}
          </GradientButton>
        </>
      )}
      {defaultView === "edit" && (
        <>
          <GradientButton color={"primary"} onClick={handleRemove}>
            {t("Delete")}
          </GradientButton>
          <GradientButton
            onClick={(event) => handleSubmit(event, "SingleDelete")}
            color={"primary"}
            disabled={isSubmitting || saveButton}
          >
            {t("Save")}
          </GradientButton>
          <GradientButton onClick={closeDialog} color={"primary"}>
            {t("Close")}
          </GradientButton>
        </>
      )}
      {defaultView === "view" && (
        <>
          <GradientButton color={"primary"} onClick={Accept}>
            {t("Confirm")}
          </GradientButton>
          <GradientButton color={"primary"} onClick={handleRemove}>
            {t("Reject")}
          </GradientButton>
          <GradientButton
            color={"primary"}
            onClick={viewVoucher}
            disabled={
              new Date(rows?.[0]?.data?.ENTERED_DATE).toDateString() !==
              new Date(authState?.workingDate).toDateString()
            }
            endIcon={
              viewVoucherMutate.isLoading ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            View Voucher
          </GradientButton>
          <GradientButton onClick={closeDialog} color={"primary"}>
            Close
          </GradientButton>
        </>
      )}
    </>
  );
};

export default GstOutwardButtons;
