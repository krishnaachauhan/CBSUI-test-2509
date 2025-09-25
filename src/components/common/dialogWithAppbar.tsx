import React from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { MyAppBar } from "pages_audit/appBar/appBar";
type ButtonProps = {
  label: string;
  onClick: () => void;
};

const DialogWithAppbar = ({
  open,
  paperProps,
  title,
  content,
  actions,
}: {
  open: boolean;
  paperProps?: any;
  title?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
}) => {
  return (
    <Dialog open={open} fullScreen PaperProps={paperProps}>
      <Box sx={{ minHeight: "57px", marginBottom: "3px" }}>
        <MyAppBar
          open={open}
          handleDrawerOpen={() => {}}
          handleDrawerClose={() => {}}
          columns={[]}
          hideActionBtns={true}
          hideSearchScreen={true}
          hideSidebarIcon={true}
          offProfileNavigate={true}
          isNewStyle={true}
        />
      </Box>
      {Boolean(title) && (
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            background: "var(--theme-color5)",
            margin: "10px 32px 0px 32px",
            alignItems: "center",
            height: "7vh",
            boxShadow:
              "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
          }}
        >
          {title}
        </DialogTitle>
      )}
      {Boolean(content) && (
        <DialogContent sx={{ paddingTop: "0px", paddingBottom: "0px" }}>
          {content}
        </DialogContent>
      )}
      {Boolean(actions) && <DialogActions>{actions}</DialogActions>}{" "}
    </Dialog>
  );
};
export default DialogWithAppbar;
