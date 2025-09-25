import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import NotificationInbox from "./notificationInbox";

const NotificationMessage = ({
  message,
  notificationList,
  msgId,
}: {
  message: string;
  notificationList: any;
  msgId: any;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifId, setNotifId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const [mainText, linkPath] = useMemo(() => {
    const splitIndex = message.indexOf("Check -");
    if (splitIndex !== -1) {
      const main = message.substring(0, splitIndex).trim();
      const link = message.substring(splitIndex + 7).trim();
      return [main, link];
    }
    return [message, ""];
  }, [message]);

  const wordCount = mainText.split(/\s+/).length;
  const shouldTruncate = wordCount > 30 && !isExpanded;

  // Open dialog automatically if message is truncated and msgId is provided
  useEffect(() => {
    if (notifId) {
      setShowNotification(true);
    }
  }, [notifId]);

  return (
    <>
      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: shouldTruncate ? 3 : "none",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "pre-wrap",
          }}
        >
          {mainText}
          {linkPath && (
            <>
              {" "}
              Check -{" "}
              <Typography
                component={Link}
                to={linkPath}
                sx={{
                  color: "blue",
                  textDecoration: "underline",
                  display: "inline",
                }}
              >
                Click here
              </Typography>
            </>
          )}
        </Typography>

        {shouldTruncate && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: "gray",
              cursor: "pointer",
              display: "inline-block",
              textDecoration: "underline",
              fontWeight: 500,
            }}
            onClick={() => setNotifId(msgId)}
          >
            Read more
          </Typography>
        )}
      </Box>

      {showNotification && (
        <NotificationInbox
          open={showNotification}
          closeDialog={() => {
            setShowNotification(false);
            setNotifId(null);
          }}
          data={notificationList}
          selectedNotification={notifId}
        />
      )}
    </>
  );
};

export default NotificationMessage;
