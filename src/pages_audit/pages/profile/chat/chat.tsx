import React, { useState, useRef, useEffect, useContext } from "react";
import ForumIcon from "@mui/icons-material/Forum";
import { Badge, Box, Fab, Popover } from "@mui/material";
import { ChatMessageBox } from "pages_audit/pages/profile/chat/chatMessageBox";
import { WebSocketContext } from "./socketContext";
import { AuthContext } from "pages_audit/auth";
import { chatStyles } from "./styles";

export const Chat = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [topOffset, setTopOffset] = useState<number | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const { totalMsgCount }: any = useContext(WebSocketContext);
  const socket: any = useContext(WebSocketContext);
  const { authState } = useContext(AuthContext);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    if (anchorEl !== null && socket?.client?.connected) {
      socket.client.publish({
        destination: "/app/chat/closeChatbox",
        body: JSON.stringify({ ENTERED_BY: authState?.user?.id }),
      });
    }
  };

  useEffect(() => {
    const updateInitialTop = () => {
      const screenHeight = window.innerHeight;
      const initialFromBottom = 80;
      setTopOffset(screenHeight - initialFromBottom);
    };
    updateInitialTop();
    window.addEventListener("resize", updateInitialTop);
    return () => window.removeEventListener("resize", updateInitialTop);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && fabRef.current) {
        const newTop = e.clientY - dragStartY.current;
        const boundedTop = Math.max(
          0,
          Math.min(window.innerHeight - 60, newTop)
        );
        setTopOffset(boundedTop);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    isDragging.current = true;
    const rect = fabRef.current?.getBoundingClientRect();
    if (rect) dragStartY.current = e.clientY - rect.top;
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {topOffset !== null && (
        <Box
          ref={fabRef}
          onMouseDown={startDrag}
          sx={chatStyles.fabContainer(topOffset)}
        >
          <Badge sx={chatStyles.badge} badgeContent={totalMsgCount}>
            <Fab size="small" sx={chatStyles.fab} onClick={handleClick}>
              <ForumIcon />
            </Fab>
          </Badge>
        </Box>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
        PaperProps={{ sx: chatStyles.popoverPaper }}
        sx={chatStyles.popover}
      >
        <ChatMessageBox onClose={() => setAnchorEl(null)} />
      </Popover>
    </>
  );
};
