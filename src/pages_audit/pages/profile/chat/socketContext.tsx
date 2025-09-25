import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthContext } from "pages_audit/auth";
import { AuthSDK } from "registry/fns/auth";
// import notificationSound from "../../../../assets/sound/notification.mp3";

// Context
export const WebSocketContext = createContext<any>({
  client: null,
  sendMessageData: () => {},
  showTyping: () => {},
  stopTyping: () => {},
  typing: {},
  unReadMsgCount: [],
  totalMsgCount: 0,
  onlineUserList: [],
  offlineUserList: [],
  userStatus: {},
});

const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useContext(AuthContext);
  const [client, setClient] = useState<Client | null>(null);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [unReadMsgCount, setUnReadMsgCount] = useState<any[]>([]);
  const [onlineUserList, setOnlineUserList] = useState<any[]>([]);
  const [offlineUserList, setOfflineUserList] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [userStatus, setUserStatus] = useState<any>({
    isOnline: false,
    userStatusData: {},
  });
  const [typing, setTyping] = useState<any>({
    isTyping: false,
    typingData: {},
  });

  const userId = authState?.user?.id;
  const token = authState?.access_token?.access_token;
  const response: any = AuthSDK?.getWebsocketURL();
  const socketUrl = `${response?.origin}/ws`;
  // const socketUrl = `http://10.55.6.138:8083/ws`;

  const destinationUser = `/user/${userId}/queue/messages`;
  const destinationOnline = `/topic/online-users`;

  const totalMsgCount = unReadMsgCount.reduce((sum, user) => {
    return sum + parseInt(user.USER_MSG_COUNT || "0");
  }, 0);

  useEffect(() => {
    if (!userId || !token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        USER_ID: authState?.user?.id,
      },
      debug: (str) => console.log(`[STOMP DEBUG]: ${str}`),
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      console.log("✅ Connected to STOMP WebSocket");
      // Subscribe: In-App Notifications
      stompClient.subscribe(
        `/user/${userId}/topic/notifications`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            // console.log("📥 Notification Received:", data);

            const audio = new Audio("/sound/notification.mp3");

            // Wait until full page is loaded before playing sound
            if (document.readyState === "complete") {
              audio.play();
              // .catch((err) =>
              //   console.warn("🔇 Audio play failed:", err.message)
              // );
            } else {
              window.addEventListener(
                "load",
                () => {
                  audio.play();
                  // .catch((err) =>
                  //   console.warn("🔇 Audio play failed on load:", err.message)
                  // );
                },
                { once: true }
              );
            }

            // Set notifications after processing
            setNotifications((prev) => [data, ...prev]);
          } catch (error) {
            // console.error("Failed to parse notification", error);
          }
        },
        {
          Authorization: `Bearer ${token}`,
          USER_ID: userId,
        }
      );

      // Subscribe: Online users
      stompClient.subscribe(
        destinationOnline,
        (message) => {
          const data = JSON.parse(message.body);
          // console.log("📥 Online User Event:", data);

          if (data?.eventType === "ONLINE_USERS") {
            setOnlineUserList(data?.users);
          }

          if (data?.eventType === "LAST_SEEN") {
            setOfflineUserList((prev) => {
              setOnlineUserList((online) =>
                online?.filter((u) => u !== data.username)
              );
              const exists = prev?.some((u) => u.username === data.username);
              return exists
                ? prev.map((u) => (u.username === data.username ? data : u))
                : [...prev, data];
            });
          }
        },
        {
          Authorization: `Bearer ${token}`,
          USER_ID: authState?.user?.id,
        }
      );

      // Subscribe: User messages
      stompClient.subscribe(
        destinationUser,
        (message) => {
          const data = JSON.parse(message.body);
          // console.log("📥 Message Event:", data);

          switch (data?.eventType) {
            case "USER_STATUS":
              setUserStatus({
                isOnline: data?.is_online,
                userStatusData: data,
              });
              break;

            case "UNREAD":
              setUnReadMsgCount(data?.RESPONSE || []);
              break;

            case "TYPING":
              setTyping({ isTyping: true, typingData: data });
              break;

            default:
              setTyping({ isTyping: false, typingData: data });
          }

          if (["MARK_AS_READ", "CHAT", "HISTORY"].includes(data?.eventType)) {
            if (document.readyState === "complete") {
              const receiveSound = new Audio("/sound/recieveNsg.mp3");

              receiveSound
                .play()
                .catch((err) =>
                  console.warn("🔇 Audio play failed:", err.message)
                );
            }

            const formattedMessages = data?.RESPONSE?.map((entry) => ({
              position:
                authState?.user?.id === entry?.ENTERED_BY ? "right" : "left",
              type: "text",
              text: entry?.USER_MSG,
              date: entry?.ENTERED_DATE,
              status: entry?.READ_FLAG === "Y" ? "read" : "sent",
              READ_FLAG: entry.READ_FLAG,
            }));
            setMessagesData(formattedMessages || []);
          }
        },
        {
          Authorization: `Bearer ${token}`,
          USER_ID: authState?.user?.id,
        }
      );
    };

    // stompClient.onWebSocketClose = (e) => {
    //   console.warn("🛑 WebSocket closed", e);
    // };

    // stompClient.onStompError = (frame) => {
    //   console.error("❌ STOMP Error:", frame.headers["message"], frame.body);
    // };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      // console.log("🧹 Cleaning up WebSocket");
      stompClient.deactivate();
    };
  }, [userId, token]);

  const showTyping = (user) => {
    if (client?.connected) {
      client.publish({
        destination: "/app/chat/typing",
        body: JSON.stringify(user),
      });
    }
  };

  const stopTyping = (user) => {
    if (client?.connected) {
      client.publish({
        destination: "/app/chat/stopTyping",
        body: JSON.stringify(user),
      });
    }
  };

  const sendMessageData = (message: string) => {
    if (client?.connected) {
      const payload = {
        sender: authState?.user?.id,
        content: message,
        timestamp: new Date().toISOString(),
      };

      client.publish({
        destination: "/app/chat/send",
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
      });
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        client,
        sendMessageData,
        messagesData,
        showTyping,
        stopTyping,
        typing,
        unReadMsgCount,
        totalMsgCount,
        userStatus,
        onlineUserList,
        offlineUserList,
        setUnReadMsgCount,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
