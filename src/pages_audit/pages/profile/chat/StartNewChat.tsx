import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { t } from "i18next";
import { startNewChatStyles } from "./styles";

const StartNewChat = () => {
  return (
    <Box sx={startNewChatStyles.container}>
      <ForumIcon
        fontSize="large"
        sx={startNewChatStyles.icon}
        color="secondary"
      />

      <Typography variant="h4" sx={startNewChatStyles.heading}>
        {t("noChatSelected")}
      </Typography>

      <Typography variant="body1" sx={startNewChatStyles.description}>
        {t("startNewChat")}
        <br />
        {t("startChatMsg")}
      </Typography>

      <Button
        variant="contained"
        color="success"
        sx={startNewChatStyles.button}
        disabled
      >
        <ArrowBackIcon sx={startNewChatStyles.buttonIcon} />
        {t("startChatBtnLabel")}
      </Button>
    </Box>
  );
};

export default StartNewChat;
