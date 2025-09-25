import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { chatAppHeaderStyle } from "./styles";

const ChatAppHeader = ({ onClose }) => {
  return (
    <AppBar position="static" sx={chatAppHeaderStyle.appBar}>
      <Toolbar sx={chatAppHeaderStyle.toolbar}>
        <Typography variant="h6" sx={chatAppHeaderStyle.title}>
          Enfinity Chat
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton sx={chatAppHeaderStyle.iconButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ChatAppHeader;
