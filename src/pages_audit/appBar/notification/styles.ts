import { Avatar, Box, Button, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Slide container with animation keyframes
export const SlideContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2000,
  display: "flex",
  alignItems: "flex-end",
  animation: "fadeSlideIn 0.6s ease-out forwards",
  "@keyframes fadeSlideIn": {
    from: {
      opacity: 0,
      transform: "translateX(-50%) translateY(20px)",
    },
    to: {
      opacity: 1,
      transform: "translateX(-50%) translateY(0)",
    },
  },
  "@keyframes fadeSlideOut": {
    from: {
      opacity: 1,
      transform: "translateX(-50%) translateY(0)",
    },
    to: {
      opacity: 0,
      transform: "translateX(-50%) translateY(20px)",
    },
  },
}));

export const PulseAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  marginRight: theme.spacing(2),
  background: "linear-gradient(135deg, #ff4081, #ff8a65)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 28,
  border: "3px solid white",
  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
  animation: "pulse 1.6s infinite ease-in-out",
  "@keyframes pulse": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
}));

export const NotificationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  maxWidth: 350,
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)",
  border: "1px solid rgba(255,255,255,0.3)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    width: 90,
    height: 90,
    background: "radial-gradient(circle at 60% 30%, #ffc10744, transparent)",
    top: -20,
    right: -25,
    zIndex: 0,
  },
}));

export const ViewNowButton = styled(Button)({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "14px",
  background: "linear-gradient(to right, #7b1fa2, #e91e63)",
  color: "#fff",
  borderRadius: "12px",
  padding: "6px 24px",
  "&:hover": {
    background: "linear-gradient(to right, #6a1b9a, #d81b60)",
    boxShadow: "0 0 10px rgba(233,30,99,0.4)",
  },
});

export const LaterButton = styled(Button)({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "14px",
  borderColor: "#aaa",
  color: "#333",
  borderRadius: "12px",
  padding: "6px 20px",
  "&:hover": {
    backgroundColor: "#f0f0f0",
  },
});
export const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.8rem",
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  borderRadius: "8px",
  color: theme.palette.success.main,
  backgroundColor: "rgba(135, 178, 146, 0.2)",
  "&:hover": {
    backgroundColor: "rgba(135, 178, 146, 0.6)",
  },
}));

export const notificationInboxStyles = {
  dialogPaper: {
    width: "100%",
    height: "90%",
    maxHeight: "100%",
    overflow: "hidden",
    borderRadius: 20,
    background: "linear-gradient(to bottom right, #f3e5f5, #fffde7)",
  },
  headerBox: {
    px: 3,
    py: 2,
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bgcolor: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(8px)",
  },
  notificationListGrid: {
    background: "linear-gradient(to bottom, #ede7f6, #fffde7)",
    borderRight: "1px solid #ddd",
    p: 2,
    height: "100%",
    overflowY: "auto",
  },
  listItemButton: (isSelected: boolean) => ({
    mb: 1,
    borderRadius: 2,
    alignItems: "flex-start",
    transition: "all 0.3s ease",
    background: isSelected
      ? "linear-gradient(to right, #ede7f6, #d1c4e9)"
      : "transparent",
    boxShadow: isSelected
      ? "inset 4px 0 0 #7e57c2, 0 2px 8px rgba(126, 87, 194, 0.2)"
      : "none",
    "&:hover": {
      background: "linear-gradient(to right, #ede7f6, #d1c4e9)",
      boxShadow: "inset 4px 0 0 #7e57c2",
    },
  }),
  avatar: {
    background: "#7e57c2",
    mt: 0.5,
    mr: 2,
  },
  notificationDetailsBox: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to top left, #fffde7, #f3e5f5)",
    overflowY: "auto",
    px: 2,
  },
  paperDetails: (isSmall: boolean) => ({
    position: "relative",
    p: isSmall ? 2 : 4,
    borderRadius: 6,
    borderLeft: "6px solid #7e57c2",
    background: "#fff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  }),
  markAsReadBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    bgcolor: "#f3e5f5",
    color: "#7e57c2",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    "&:hover": {
      bgcolor: "#e1bee7",
    },
  },
  notificationIconGlow: {
    fontSize: 96,
    color: "#7e57c2",
    mb: 3,
    animation: "pulseGlow 2.5s infinite ease-in-out",
    filter: "drop-shadow(0 0 8px rgba(126,87,194,0.5))",
  },
  noNotificationTextBox: {
    textAlign: "center",
    p: 6,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "text.primary",
  },
  pulseGlowKeyframes: `
    @keyframes pulseGlow {
      0% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(126,87,194,0.5)); }
      50% { transform: scale(1.05); filter: drop-shadow(0 0 12px rgba(126,87,194,0.8)); }
      100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(126,87,194,0.5)); }
    }
  `,
};
