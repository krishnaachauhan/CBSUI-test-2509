import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Slide,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import { WebSocketContext } from "pages_audit/pages/profile/chat/socketContext";
import NotificationInbox from "./notificationInbox";
import {
  SlideContainer,
  PulseAvatar,
  NotificationPaper,
  ViewNowButton,
  LaterButton,
} from "./styles";
import { t } from "i18next";

// Types for props and notification object
interface Notification {
  ID: string;
  TITLE: string;
  IS_NEW: string;
  [key: string]: any;
}

interface NewNotificationPopupProps {
  msgList: Notification[];
}

const NewNotificationPopup: React.FC<NewNotificationPopupProps> = ({
  msgList,
}) => {
  const theme = useTheme();
  const { notifications } = useContext(WebSocketContext);

  const [queue, setQueue] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [notifId, setNotifId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract and queue unread notifications
  useEffect(() => {
    const list: Notification[] = notifications?.[0]?.RESPONSE ?? [];
    const unread = list.filter((n) => n.IS_NEW === "Y");
    if (unread.length > 0) {
      setQueue((prev) => [...prev, ...unread]);
    }
  }, [notifications]);

  // Display next queued notification
  useEffect(() => {
    if (!open && queue.length > 0) {
      const next = queue[0];
      setCurrent(next);
      setOpen(true);
    }
  }, [queue, open]);

  // Handle notification dismiss
  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
    setQueue((prev) => prev.slice(1));
    setCurrent(null);
  };

  // Handle "View Now" button
  const handleAccept = (id: string) => {
    setNotifId(id);
    setShowNotification(true);
    handleDismiss();
  };

  return (
    <>
      <Slide direction="up" in={open} mountOnEnter unmountOnExit timeout={500}>
        <SlideContainer>
          <PulseAvatar>🔔</PulseAvatar>
          <NotificationPaper elevation={10}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <NotificationsActiveRoundedIcon
                sx={{ color: "#ff4081", fontSize: 22 }}
              />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#333" }}
              >
                {t("newAlert")}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: "#444",
                fontSize: "14.5px",
                lineHeight: 1.6,
                zIndex: 1,
                position: "relative",
              }}
            >
              {current?.TITLE || t("getNotifMsg")}
            </Typography>

            <Stack direction="row" spacing={2}>
              <ViewNowButton
                onClick={() => current?.ID && handleAccept(current.ID)}
              >
                View Now
              </ViewNowButton>
              <LaterButton onClick={handleDismiss}>Later</LaterButton>
            </Stack>
          </NotificationPaper>
        </SlideContainer>
      </Slide>

      {showNotification && (
        <NotificationInbox
          open={showNotification}
          closeDialog={() => {
            setShowNotification(false);
            setNotifId(null);
          }}
          data={msgList}
          selectedNotification={notifId}
        />
      )}
    </>
  );
};

export default NewNotificationPopup;
