import { useContext, useEffect, useMemo, useState } from "react";
import { WebSocketContext } from "pages_audit/pages/profile/chat/socketContext";
import { AuthContext } from "pages_audit/auth";

export const useNotification = () => {
  const { client, notifications } = useContext(WebSocketContext);
  const { authState } = useContext(AuthContext);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notiFication, setNotiFication] = useState("All");
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [showFullNotification, setShowFullNotification] =
    useState<boolean>(false);
  const [notifId, setNotifId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (notifications?.length > 0) {
      const newData = notifications[0]?.RESPONSE || [];
      const newArray = Array.isArray(newData) ? newData : [newData];

      const updatedMap = new Map();
      [...newArray, ...notificationList].forEach((item) =>
        updatedMap.set(item.ID, item)
      );

      setNotificationList(Array.from(updatedMap.values()));
    }
  }, [notifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleMarkAsRead = (notification: any) => {
    client?.publish({
      destination: "/app/read/notification",
      body: JSON.stringify({
        ID: notification.ID,
        CHECKER_ID: authState?.user?.id,
      }),
      headers: {
        Authorization: `Bearer ${authState.access_token}`,
      },
    });

    setNotificationList((prevList) =>
      prevList.filter((item) => item.ID !== notification.ID)
    );
  };

  const handleMarkAllAsRead = () => {
    const userId = authState?.user?.id;
    if (client?.connected && userId) {
      client.publish({
        destination: "/app/read/all/notifications",
        body: JSON.stringify({ CHECKER_ID: userId }),
        headers: {
          Authorization: `Bearer ${authState.access_token}`,
        },
      });
      setNotificationList([]);
    }
  };

  const filteredList = useMemo(() => {
    switch (notiFication) {
      case "New":
        return notificationList.filter((item) => item.IS_READ === "N");
      case "Read":
        return notificationList.filter((item) => item.IS_READ === "Y");
      default:
        return notificationList;
    }
  }, [notificationList, notiFication]);

  return {
    anchorEl,
    handleClick,
    handleClose,
    notiFication,
    setNotiFication,
    notificationList,
    filteredList,
    showFullNotification,
    setShowFullNotification,
    notifId,
    setNotifId,
    showNotification,
    setShowNotification,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
};
