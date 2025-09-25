import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Link,
  List,
  ListItemButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import NotificationMessage from "./notificationMessage";
import { StyledButton } from "./styles";

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  notificationList: any[];
  filteredList: any[];
  setNotifId: (id: string | null) => void;
  setShowNotification: (v: boolean) => void;
  handleMarkAsRead: (notification: any) => void;
  handleMarkAllAsRead: () => void;
  setShowFullNotification: (v: boolean) => void;
}

const getIcon = (icon: string) => {
  const icons: { [key: string]: JSX.Element } = {
    AccountCircleIcon: <AccountCircleIcon />,
    PersonIcon: <PersonIcon />,
    TaskAltIcon: <TaskAltIcon />,
  };
  return icons[icon] || null;
};

const getTimeDifference = (timestamp: string) => {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} mins ago`;
  const hours = Math.floor(diff / 60);
  return hours < 24
    ? `${hours} hours ago`
    : `${Math.floor(hours / 24)} days ago`;
};

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  anchorEl,
  handleClose,
  notificationList,
  filteredList,
  setNotifId,
  setShowNotification,
  handleMarkAsRead,
  handleMarkAllAsRead,
  setShowFullNotification,
}) => {
  return (
    <Popover
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      elevation={8}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: filteredList.length > 0 ? 500 : 350,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box boxShadow={1} sx={{ p: 2, pb: 0.5, background: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            All Notifications ({filteredList.length})
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{ boxShadow: 1 }}>
            <CloseIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>

      {!filteredList.length ? (
        <Box
          sx={{
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            No new notifications at the moment.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 400 }}>
          <List disablePadding>
            {filteredList.map((data) => (
              <ListItemButton key={data.ID} sx={{ px: 1 }}>
                <Card
                  sx={{
                    width: "100%",
                    background: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <CardContent sx={{ pb: "8px !important" }}>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <CardHeader
                          sx={{ p: 0 }}
                          avatar={
                            <Avatar sx={{ background: "var(--theme-color3)" }}>
                              {getIcon(data.icon)}
                            </Avatar>
                          }
                          title={
                            <Typography
                              noWrap
                              fontWeight="bold"
                              variant="subtitle1"
                            >
                              {data.TITLE}
                            </Typography>
                          }
                        />
                      </Grid>
                      <Grid item>
                        <Typography variant="caption">
                          {getTimeDifference(data.CREATED_AT)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      onClick={() => {
                        setNotifId(data.ID);
                        setShowNotification(true);
                      }}
                      sx={{ ml: 6 }}
                    >
                      <NotificationMessage
                        message={data.MESSAGES}
                        notificationList={notificationList}
                        msgId={data?.ID}
                      />
                    </Typography>

                    {data.IS_READ === "N" && (
                      <Box sx={{ mt: 1, ml: 6, textAlign: "end" }}>
                        <StyledButton onClick={() => handleMarkAsRead(data)}>
                          Mark as Read
                        </StyledButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      <Box
        sx={{
          p: 2,
          background: "white",
          boxShadow:
            "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
        }}
      >
        {!!filteredList.length && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="text"
              sx={{
                color: "black",
                textDecoration: "underline",
                fontSize: "0.875rem",
                textTransform: "none",
                minWidth: "auto",
              }}
              onClick={() => setShowFullNotification(true)}
            >
              View All
            </Button>
            <Link
              href="#"
              variant="body2"
              onClick={handleMarkAllAsRead}
              sx={{ textDecoration: "underline", color: "black" }}
            >
              Mark all as read
            </Link>
          </Box>
        )}
      </Box>
    </Popover>
  );
};

export default NotificationPopover;
