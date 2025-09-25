import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Dialog,
  IconButton,
  Avatar,
  Fade,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { t } from "i18next";
import { notificationInboxStyles } from "./styles";

interface Notification {
  ID: string;
  TITLE: string;
  MESSAGES: string;
  CREATED_AT: string;
  isRead: boolean;
}

const NotificationInbox = ({
  open,
  closeDialog,
  data,
  selectedNotification,
}: {
  open: boolean;
  closeDialog: () => void;
  data: Record<string, any>;
  selectedNotification: string | null;
}) => {
  const [selected, setSelected] = useState<Notification | null>(null);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (open && selectedNotification) {
      if (!selected || selected?.ID !== selectedNotification) {
        const match = data.find((item) => item.ID === selectedNotification);
        if (match) setSelected(match);
      }
    }
  }, [open, selectedNotification, data, selected]);

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      PaperProps={{ style: notificationInboxStyles.dialogPaper }}
      maxWidth="lg"
    >
      {/* Header */}
      <Box sx={notificationInboxStyles.headerBox}>
        <Typography variant="h6" fontWeight="bold">
          {t("Notifications")}
        </Typography>
        <IconButton onClick={closeDialog}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Grid container height="calc(100% - 64px)">
        {/* Notification List */}
        <Grid
          item
          xs={12}
          md={4}
          sx={notificationInboxStyles.notificationListGrid}
        >
          <List disablePadding>
            {data.map((noti) => {
              const isSelected = selected?.ID === noti.ID;
              return (
                <ListItemButton
                  key={noti.ID}
                  onClick={() => setSelected(noti)}
                  selected={isSelected}
                  sx={notificationInboxStyles.listItemButton(isSelected)}
                >
                  <Avatar sx={notificationInboxStyles.avatar}>
                    <NotificationsActiveIcon fontSize="small" />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight={noti.isRead ? 400 : 700}
                        sx={{ color: isSelected ? "#512da8" : "#333" }}
                      >
                        {noti.TITLE}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: isSelected ? 500 : 400 }}
                      >
                        {noti.CREATED_AT}
                      </Typography>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Grid>

        {/* Notification Details */}
        <Grid item xs={12} md={8}>
          <Box sx={notificationInboxStyles.notificationDetailsBox}>
            {selected ? (
              <Fade in={!!selected}>
                <Box width="100%" maxWidth={640}>
                  <Paper
                    elevation={4}
                    sx={notificationInboxStyles.paperDetails(isSmall)}
                  >
                    {/* Mark as Read Button */}
                    <Tooltip title="Mark as Read" arrow>
                      <IconButton
                        size="small"
                        sx={notificationInboxStyles.markAsReadBtn}
                        onClick={() => {}}
                      >
                        <DoneAllIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>

                    {/* Content */}
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selected.TITLE}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {selected.CREATED_AT}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1" sx={{ color: "#444" }}>
                      {selected.MESSAGES}
                    </Typography>
                  </Paper>
                </Box>
              </Fade>
            ) : (
              <Fade in={!selected}>
                <Box sx={notificationInboxStyles.noNotificationTextBox}>
                  <NotificationsActiveIcon
                    sx={notificationInboxStyles.notificationIconGlow}
                  />
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    {t("noNotificationTitle")}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "text.secondary", mb: 4 }}
                  >
                    {t("tapNotificationMsg")}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontStyle: "italic", color: "text.disabled" }}
                  >
                    {t("alertsSoonMsg")}
                  </Typography>
                  <style>{notificationInboxStyles.pulseGlowKeyframes}</style>
                </Box>
              </Fade>
            )}
          </Box>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default NotificationInbox;
