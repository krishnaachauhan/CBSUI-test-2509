import React from "react";
import { Box, Avatar, Typography, AppBar, Toolbar } from "@mui/material";
import { chatHeaderStyles } from "./styles";

interface ChatHeaderProps {
  socket: any;
  activeChat: any;
  isOnline: boolean;
  offline?: any[];
  onBack?: () => void;
}

const ChatHeader = ({
  socket,
  activeChat,
  isOnline,
  offline,
  onBack,
}: ChatHeaderProps) => {
  const renderLastSeen = () => {
    if (isOnline) return "Online";
    if (offline?.length || activeChat?.LST_LOGOUT) {
      return `Last seen: ${offline?.[0]?.sysDate || activeChat?.LST_LOGOUT}`;
    }
    return null;
  };

  return (
    <AppBar position="static" sx={chatHeaderStyles.appBar}>
      <Toolbar sx={chatHeaderStyles.toolbar}>
        {/* Avatar */}
        <Avatar
          src={activeChat?.avatarUrl || ""}
          alt={activeChat?.DESCRIPTION || "User"}
          sx={chatHeaderStyles.avatar}
        >
          {!activeChat?.avatarUrl &&
            (activeChat?.DESCRIPTION?.[0]?.toUpperCase() || "G")}
        </Avatar>

        {/* Name and Status */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={chatHeaderStyles.userName}>
            {socket?.client?.connected
              ? activeChat?.DESCRIPTION || "Select a user"
              : "⚠️ Client not connected ...!"}
          </Typography>
          {activeChat?.value && (
            <Typography variant="caption" sx={chatHeaderStyles.statusText}>
              {renderLastSeen()}
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
