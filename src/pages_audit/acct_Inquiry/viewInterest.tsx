import { Dialog } from "@mui/material";
import React from "react";

export const ViewInterest = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth={true}>
      <div>ViewInterest</div>
    </Dialog>
  );
};
