import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "react-query";
import {
  Box,
  CircularProgress,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { WebSocketContext } from "./socketContext";
import { userListData } from "../api";
import { AuthContext } from "pages_audit/auth";
import userLogo from "assets/images/userlogo.png";
import { ChatList } from "react-chat-elements";
import _ from "lodash";
import { Search as SearchIcon } from "@mui/icons-material";
import "./style.css";

const SEARCH_DEBOUNCE_MS = 200;

const UserList = ({ setActiveChat, inputMessageRef, activeChat }: any) => {
  const [filterData, setFilterData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State to hold search query
  const socket: any = useContext(WebSocketContext);
  const { authState } = useContext(AuthContext);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const { data: userList, isLoading } = useQuery("userListData", userListData);

  useEffect(() => {
    if (userList) {
      setFilterData(userList);
    }
  }, [userList]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Debounced search function
  const handleSearch = useMemo(
    () =>
      _.debounce((inputValue: string) => {
        const lowercasedValue = inputValue.toLowerCase();
        setFilterData(
          userList?.filter((user: any) =>
            user.label?.toLowerCase().includes(lowercasedValue)
          ) || []
        );
      }, SEARCH_DEBOUNCE_MS),
    [userList]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    handleSearch(event.target.value);
  };

  const formatChatListData = () => {
    return [...filterData]
      .sort((a, b) => {
        const getDate = (user: any) =>
          new Date(
            socket?.unReadMsgCount?.find(
              (x: any) => x.ENTERED_BY === user.value
            )?.ENTERED_DATE || 0
          ).getTime();
        return getDate(b) - getDate(a);
      })
      .map((item, index) => {
        const unreadInfo = socket?.unReadMsgCount?.find(
          (x: any) => x.ENTERED_BY === item.value
        );
        return {
          ...item,
          id: index,
          avatar: userLogo,
          alt: "No image found",
          title: item.DESCRIPTION,
          subtitle: item.value,
          date: unreadInfo?.ENTERED_DATE
            ? new Date(unreadInfo?.ENTERED_DATE)
            : null,
          unread: Number(unreadInfo?.USER_MSG_COUNT),
          className: activeChat?.value === item.value ? "chat-selected" : "",
        };
      });
  };

  const handleUserClick = (data: any) => {
    if (socket?.client?.connected) {
      socket.client.publish({
        destination: "/app/chat/history",
        body: JSON.stringify({
          RECEIVER_NAME: data?.value,
          SENDER_NAME: authState?.user?.id,
        }),
      });
      socket.client.publish({
        destination: "/app/chat/openChatBox",
        body: JSON.stringify({
          RECEIVER_NAME: data?.value,
          ENTERED_BY: authState?.user?.id,
        }),
      });

      setActiveChat(data);
      inputMessageRef.current?.focus();
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 1,
          backgroundColor: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 1,
          boxShadow: 0,
        }}
      >
        <TextField
          type="search"
          inputRef={searchInputRef}
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search User..."
          fullWidth
          sx={{
            border: "none",
            outline: "none",
            boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            borderRadius: "25px",
            backgroundColor: "#ffffff",

            "& .MuiOutlinedInput-root": {
              borderRadius: "25px",
            },
            "& .MuiOutlinedInput-input": {
              paddingLeft: "20px",
              paddingRight: "10px",
            },
            maxWidth: "500px",
            height: "50px",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton sx={{ color: "#25D366" }}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowX: "hidden" }}>
        {isLoading ? (
          <Box sx={{ justifyContent: "center", display: "flex" }}>
            <CircularProgress color="secondary" size="30px" />
          </Box>
        ) : filterData.length ? (
          <ChatList
            className="chat-list"
            id="main-chat-list"
            lazyLoadingImage="https://via.placeholder.com/150"
            dataSource={formatChatListData()}
            onClick={handleUserClick}
          />
        ) : (
          <MenuItem disabled>No users found</MenuItem>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(UserList);
