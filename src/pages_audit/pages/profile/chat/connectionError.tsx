import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Wifi as WifiIcon,
} from "@mui/icons-material";
import { keepPhoneConnectedStyles } from "./styles";
import { t } from "i18next";

interface KeepPhoneConnectedProps {
  socket: WebSocket | null;
}

const KeepPhoneConnected = ({ socket }: KeepPhoneConnectedProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        setIsConnected(true);
        setLoading(false);
      };

      socket.onmessage = (event) => {
        setMessage(event.data);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    }
  }, [socket]);

  const renderConnectionStatus = () => {
    if (!socket) return t("noSocketMsg");
    if (!isConnected) return t("notConnectedMsg");
    return message || t("waitingMsg");
  };

  return (
    <Box sx={keepPhoneConnectedStyles.container}>
      <Avatar sx={keepPhoneConnectedStyles.avatar}>
        <WifiIcon sx={keepPhoneConnectedStyles.wifiIcon} />
      </Avatar>

      <Typography variant="h5" sx={keepPhoneConnectedStyles.title}>
        {t("keepActiveMsg")}
      </Typography>

      <Typography variant="body1" sx={keepPhoneConnectedStyles.description}>
        {t("webSocketConnectionMsg")}
      </Typography>

      <Box sx={keepPhoneConnectedStyles.statusContainer}>
        <Typography
          variant="h6"
          sx={{
            ...keepPhoneConnectedStyles.statusText,
            color: !isConnected ? "red" : "#25D366",
          }}
        >
          {renderConnectionStatus()}
        </Typography>

        {isConnected ? (
          <CheckCircleIcon sx={keepPhoneConnectedStyles.statusIconSuccess} />
        ) : (
          <CancelIcon sx={keepPhoneConnectedStyles.statusIconError} />
        )}
      </Box>

      {loading && (
        <CircularProgress size={40} sx={keepPhoneConnectedStyles.loader} />
      )}
    </Box>
  );
};

export default KeepPhoneConnected;
