import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { GradientButton } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useContext } from "react";
import HelpIcon from "@mui/icons-material/Help";

export const LogoutModal = ({ setLogoutOpen, logoutOpen }) => {
  const authController = useContext(AuthContext);
  return (
    <Dialog
      open={true}
      maxWidth="md"
      PaperProps={{
        style: {
          minWidth: "25%",
          maxWidth: "50%",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "var(--theme-color5)",
          padding: "6px 15px !important",
          margin: "10px",
          color: "var(--theme-color2)",
          borderRadius: "4px",
          "& h2": {
            fontWeight: "500 !important",
          },
        }}
      >
        Logout
      </DialogTitle>
      <DialogContent>
        <Stack direction={"row"} gap={2} alignItems={"center"}>
          <span>
            <HelpIcon
              fontSize="medium"
              style={{
                color: "dodgerblue",
                width: "1.3em",
                height: "1.3em",
              }}
            />
          </span>
          <Typography
            style={{
              color: "black",
              whiteSpace: "pre-wrap",
              maxHeight: "60vh",
            }}
          >
            Are you sure want to logout ?
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions
        style={{
          justifyContent: "center",
          padding: "10px 20px",
          borderRadius: "5px",
          marginTop: "-15px",
        }}
      >
        <GradientButton onClick={() => authController?.logout()} autoFocus>
          Yes
        </GradientButton>
        <GradientButton onClick={() => setLogoutOpen(false)}>No</GradientButton>
      </DialogActions>
    </Dialog>
  );
};
