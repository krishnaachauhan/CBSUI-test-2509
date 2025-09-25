import React from "react";
import {
  Badge,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import NotificationPopover from "./notificationPopover";
import NotificationPage from "./notificationInbox";
import NewNotificationPopup from "./newNotificationPopup";
import { useNotification } from "./hooks/useNotification";
import { t } from "i18next";

export const Notification_App = () => {
  const {
    anchorEl,
    handleClick,
    handleClose,
    notificationList,
    filteredList,
    setNotifId,
    setShowNotification,
    handleMarkAsRead,
    handleMarkAllAsRead,
    showNotification,
    notifId,
    showFullNotification,
    setShowFullNotification,
  } = useNotification();

  const above1300 = useMediaQuery("(min-width:1300px)");

  return (
    <>
      <Tooltip title={t("Notifications")} placement="bottom" arrow>
        <Badge
          badgeContent={
            notificationList.filter((n) => n.IS_READ === "N").length
          }
          sx={{ width: !above1300 ? "100%" : "auto" }}
          color="error"
        >
          <IconButton
            onClick={handleClick}
            sx={{
              backgroundColor: "rgba(235, 237, 238, 0.45)",
              borderRadius: "10px",
              height: "36px",
              width: !above1300 ? "100%" : "auto",
              padding: "0 8px",
              "&:hover": {
                background: "var(--theme-color2)",
                boxShadow:
                  "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                transition: "all 0.2s ease",
              },
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <NotificationsNoneIcon
              fontSize="small"
              sx={{
                color: "var(--theme-color3)",
              }}
            />
            {!above1300 && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "var(--theme-color3)",
                }}
              >
                {t("Notifications")}
              </Typography>
            )}
          </IconButton>
        </Badge>
      </Tooltip>

      <NotificationPopover
        anchorEl={anchorEl}
        handleClose={handleClose}
        notificationList={notificationList}
        filteredList={filteredList}
        setNotifId={setNotifId}
        setShowNotification={setShowNotification}
        handleMarkAsRead={handleMarkAsRead}
        handleMarkAllAsRead={handleMarkAllAsRead}
        setShowFullNotification={setShowFullNotification}
      />

      {showFullNotification && (
        <NotificationPage
          open={showFullNotification}
          closeDialog={() => setShowFullNotification(false)}
          data={notificationList}
          selectedNotification={null}
        />
      )}
      {showNotification && (
        <NotificationPage
          open={showNotification}
          closeDialog={() => {
            setShowNotification(false);
            setNotifId(null);
          }}
          data={notificationList}
          selectedNotification={notifId}
        />
      )}
      <NewNotificationPopup msgList={notificationList} />
    </>
  );
};
