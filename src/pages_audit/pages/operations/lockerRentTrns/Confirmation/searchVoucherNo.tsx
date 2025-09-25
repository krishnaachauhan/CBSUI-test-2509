import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  DynFormHelperText,
  PaperComponent,
} from "../../DailyTransaction/TRN001/components";
import { GradientButton, TextField } from "@acuteinfo/common-base";
import { useEffect, useState } from "react";
import { t } from "i18next";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

export const SearchVoucherNo = ({ open, close, handleVoucherSearch }) => {
  const { trackDialogClass } = useDialogContext();
  const [state, setSta] = useState<any>({
    scrollErr: "",
    remarkErr: "",
    voucherNo: null,
  });

  const handleVoucher = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, "");
    setSta((prevState) => ({
      ...prevState,
      voucherNo: newValue,
    }));
  };

  useEffect(() => {
    if (open) {
      trackDialogClass("voucherSearch");
    }
    return () => {
      trackDialogClass("main");
    };
  }, [open]);
  return (
    <>
      <Dialog
        maxWidth="lg"
        className="voucherSearch"
        open={open}
        aria-describedby="alert-dialog-description"
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle
          style={{
            cursor: "move",
          }}
          id="draggable-dialog-title"
        >
          <Typography
            variant="h5"
            className="dialogTitle"
            style={{
              padding: "10px",
              fontSize: "1.5rem",
              letterSpacing: "1px",
              fontWeight: 500,
              color: "var(--theme-color2)",
            }}
          >
            {t("VoucherSearch")}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            style={{ minWidth: "300px" }}
            fullWidth={true}
            value={state?.voucherNo}
            placeholder={t("EnterVoucher")}
            type="text"
            onChange={(event) => handleVoucher(event)}
            label={t("VoucherNo")}
            InputLabelProps={{ shrink: true }}
          />
          {/* <DynFormHelperText msg={errors?.scrollErr} /> */}
        </DialogContent>
        <DialogActions className="dialogFooter">
          <GradientButton onClick={() => handleVoucherSearch(state?.voucherNo)}>
            {t("Search")}
          </GradientButton>
          <GradientButton onClick={() => close()}>{t("Cancel")}</GradientButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
