import { keyframes } from "@mui/material";

export const chatAppHeaderStyle = {
  appBar: {
    background: "var(--primary-bg)",
    boxShadow: "none",
    padding: "0 16px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "25px",
  },
  iconButton: {
    color: "#ffffff",
  },
};
export const chatStyles = {
  fabContainer: (topOffset: number) => ({
    position: "fixed",
    top: `${topOffset}px`,
    right: "1rem",
    zIndex: 10000,
    cursor: "grab",
  }),
  badge: {
    "& .MuiBadge-badge": {
      background: "var(--theme-color5)",
      color: "var(--theme-color2)",
      zIndex: 10000,
    },
  },
  fab: {
    background: "var(--theme-color2)",
    color: "var(--theme-color3)",
  },
  popoverPaper: {
    pointerEvents: "auto",
  },
  popover: {
    pointerEvents: "none",
  },
};
export const chatHeaderStyles = {
  appBar: {
    background: "var(--primary-bg)",
    height: 60,
    boxShadow: "none",
  },
  toolbar: {
    minHeight: 60,
    px: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    mr: 2,
    bgcolor: "#4CAF50",
    color: "#fff",
  },
  userName: {
    color: "white",
    fontWeight: 500,
  },
  statusText: {
    color: "#d0f0e0",
    fontSize: "0.75rem",
  },
};

export const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

export const chatMessageBoxstyles = {
  container: {
    display: "flex",
    height: "60vh",
    padding: "0px !important",
  },

  userList: {
    width: "18vw",
    boxShadow: 3,
  },

  chatPanel: {
    flex: 1,
    bgcolor: "#f9f9f9",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    width: "30vw",
  },

  messageArea: {
    flex: 1,
    overflowY: "auto",
    px: 2,
    py: 1,
  },

  emojiPickerWrapper: {
    position: "absolute",
    bottom: "64px",
    right: "12px",
    zIndex: 10,
  },

  typingIndicator: (isTyping: boolean) => ({
    position: "absolute",
    bottom: "75px",
    left: "25%",
    transform: isTyping
      ? "translateX(-50%) translateY(0px)"
      : "translateX(-50%) translateY(30px)",
    opacity: isTyping ? 1 : 0,
    backgroundColor: "#f5f5f5",
    borderRadius: "20px",
    px: 2,
    py: 1,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 0.5s ease-in-out",
    pointerEvents: "none",
    display: "flex",
  }),

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--theme-color2)",
    padding: "4px",
    borderRadius: "10px",
    m: 1.5,
    boxShadow:
      "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px",
  },

  textField: {
    mx: 1,
    backgroundColor: "#fff",
    borderRadius: "20px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      paddingRight: "8px",
    },
    "& fieldset": { border: "none" },
  },

  inputProps: {
    padding: "0px !important",
    fontSize: "20px !important",
    letterSpacing: "1px !important",
  },

  sendButton: {
    backgroundColor: "var(--theme-color3)",
    boxShadow:
      "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset",
    "&:hover": {
      backgroundColor: "var(--theme-color3)",
    },
    color: "#fff",
  },

  dot: (delay: string = "0s") => ({
    width: "8px",
    height: "8px",
    backgroundColor: "gray",
    borderRadius: "50%",
    margin: "0 4px",
    animation: `${bounce} 1.4s infinite both`,
    animationDelay: delay,
  }),
};
export const keepPhoneConnectedStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    width: "400px",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    padding: 3,
    margin: "auto",
  },
  avatar: {
    width: 90,
    height: 90,
    backgroundColor: "#25D366",
    marginBottom: 3,
  },
  wifiIcon: {
    fontSize: 45,
    color: "white",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  description: {
    color: "textSecondary",
    marginBottom: 3,
    fontSize: "14px",
    lineHeight: 1.5,
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: 3,
  },
  statusText: {
    fontWeight: "bold",
    marginRight: 2,
  },
  statusIconSuccess: {
    color: "#25D366",
    fontSize: 30,
  },
  statusIconError: {
    color: "red",
    fontSize: 30,
  },
  loader: {
    marginBottom: 3,
  },
};
export const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(50px); }
  100% { opacity: 1; transform: translateY(0); }
`;

export const startNewChatStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    animation: `${fadeIn} 1s ease-out`,
    textAlign: "center",
    padding: "0 20px",
  },
  icon: {
    fontSize: "75px",
    marginBottom: "10px",
  },
  heading: {
    fontWeight: 600,
    color: "#333333",
    marginBottom: 0,
    textShadow: "2px 2px 6px rgba(0, 0, 0, 0.3)",
  },
  description: {
    color: "#444444",
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: 1.6,
    maxWidth: "500px",
    margin: "10px auto",
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#25D366",
    color: "#ffffff",
    padding: "15px 30px",
    borderRadius: "50px",
    fontSize: "18px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    "&:hover": { backgroundColor: "#128C7E" },
    animation: `${fadeIn} 1.5s ease-out`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "auto",
  },
  buttonIcon: {
    fontSize: 25,
    marginRight: 1,
  },
};
