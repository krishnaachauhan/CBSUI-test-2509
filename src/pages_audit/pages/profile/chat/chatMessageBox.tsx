import {
  Box,
  TextField,
  Typography,
  IconButton,
  Container,
  Avatar,
  keyframes,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { MessageList } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { WebSocketContext } from "./socketContext";
import { AuthContext } from "pages_audit/auth";
import UserList from "./userList";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ChatHeader from "./chatHeader";
import KeepPhoneConnected from "./connectionError";
import StartNewChat from "./StartNewChat";
import ChatAppHeader from "./chatAppHeader";
import { bounce, chatMessageBoxstyles } from "./styles";

export const ChatMessageBox = ({ onClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [activeChat, setActiveChat] = useState<any>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socket: any = useContext(WebSocketContext);
  const { authState } = useContext(AuthContext);
  const typingTimeoutRef = useRef<any>(null);
  const messageListRef = useRef<any>(null);
  const inputMessageRef = useRef(null);
  const emojiPickerRef = useRef<any>(null);

  const handleEmojiClick = (emojiData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  const isOnline = useMemo(() => {
    if (
      Array.isArray(socket?.onlineUserList) &&
      socket?.onlineUserList?.length
    ) {
      let onlineUser = socket?.onlineUserList.some(
        (item) => item === activeChat?.value
      );
      return onlineUser;
    }
  }, [socket?.onlineUserList, activeChat?.value]);

  const offline = useMemo(() => {
    if (
      Array.isArray(socket?.offlineUserList) &&
      socket?.offlineUserList.length
    ) {
      const offlineUser = socket.offlineUserList.filter(
        (item) => item?.username === activeChat?.value
      );

      return offlineUser;
    }
    return [];
  }, [socket?.offlineUserList, activeChat?.value]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    socket.sendMessageData(
      JSON.stringify({
        USER_MSG: inputValue.trim(),
        RECEIVER_NAME: activeChat?.value,
        ENTERED_BY: authState?.user?.id,
        ENTERED_DATE: authState?.workingDate,
        _isNewRow: true,
        TYPING_STATUS: "SEND",
      })
    );
    if (document.readyState === "complete") {
      const send = new Audio("/sound/msgSend.mp3");

      send
        .play()
        .catch((err) => console.warn("🔇 Audio play failed:", err.message));
    }
    setShowEmojiPicker(false);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    socket.showTyping(
      JSON.stringify({
        ENTERED_BY: authState?.user?.id,
        TYPING_STATUS: "TYPING",
        RECEIVER_NAME: activeChat?.value,
        USER_MSG: value.trim(),
      })
    );

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.stopTyping(
        JSON.stringify({
          ENTERED_BY: authState?.user?.id,
          RECEIVER_NAME: activeChat?.value,
          USER_MSG: value.trim(),
        })
      );
    }, 2500);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    const hideStuff = () => {
      const el = document.querySelector(".epr_-kg0voo");
      if (el) (el as HTMLElement).style.display = "none";
    };

    if (showEmojiPicker) {
      // Attach outside click listener
      document.addEventListener("mousedown", handleClickOutside);

      // Periodically hide unwanted UI
      const interval = setInterval(hideStuff, 100);
      setTimeout(() => clearInterval(interval), 1000);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    if (activeChat?.value) {
      socket.setUnReadMsgCount((old) => {
        let updateCount = old.map((entry) => {
          if (entry.ENTERED_BY === activeChat?.value) {
            return {
              ...entry,
              USER_MSG_COUNT: 0,
            };
          }
          return entry;
        });
        return updateCount;
      });
    }
  }, [activeChat?.value]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [socket?.messagesData]);

  return (
    <>
      <ChatAppHeader onClose={onClose} />
      <Container maxWidth="lg" sx={chatMessageBoxstyles.container}>
        {socket?.client?.connected ? (
          <>
            {/* User List Panel */}
            <Box sx={chatMessageBoxstyles.userList}>
              <UserList
                setActiveChat={setActiveChat}
                activeChat={activeChat}
                inputMessageRef={inputMessageRef}
              />
            </Box>

            {/* Chat Panel */}
            <Box sx={chatMessageBoxstyles.chatPanel}>
              {!activeChat?.DESCRIPTION ? (
                <StartNewChat />
              ) : (
                <>
                  <ChatHeader
                    activeChat={activeChat}
                    isOnline={isOnline}
                    socket={socket}
                  />

                  {/* Message List */}
                  <Box sx={chatMessageBoxstyles.messageArea}>
                    <MessageList
                      referance={messageListRef}
                      className="message-list"
                      lockable={true}
                      toBottomHeight={"100%"}
                      dataSource={activeChat?.value ? socket?.messagesData : []}
                    />
                  </Box>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <Box
                      ref={emojiPickerRef}
                      sx={chatMessageBoxstyles.emojiPickerWrapper}
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        height={"48vh"}
                        width={"29vw"}
                        style={{ background: "var(--primary-bg)" }}
                      />
                    </Box>
                  )}

                  {/* Typing Indicator */}
                  <Box
                    sx={chatMessageBoxstyles.typingIndicator(
                      socket?.typing?.isTyping && activeChat?.value
                    )}
                  >
                    <Avatar sx={{ width: 24, height: 24, marginRight: 1 }} />
                    <Typography variant="body1" color="textSecondary">
                      {`${activeChat?.DESCRIPTION} is Typing`}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Dot delay="0s" />
                      <Dot delay="0.2s" />
                      <Dot delay="0.4s" />
                    </Box>
                  </Box>

                  {/* Input Field */}
                  <Box sx={{ position: "relative" }}>
                    <Box sx={chatMessageBoxstyles.inputWrapper}>
                      <TextField
                        fullWidth
                        inputRef={inputMessageRef}
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        variant="outlined"
                        size="small"
                        sx={chatMessageBoxstyles.textField}
                        InputProps={{ sx: chatMessageBoxstyles.inputProps }}
                      />

                      <IconButton
                        color="primary"
                        onClick={handleSend}
                        size="medium"
                        sx={chatMessageBoxstyles.sendButton}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </>
        ) : (
          <KeepPhoneConnected socket={socket} />
        )}
      </Container>
    </>
  );
};
const Dot = ({ delay = "0s" }) => <Box sx={chatMessageBoxstyles.dot(delay)} />;
