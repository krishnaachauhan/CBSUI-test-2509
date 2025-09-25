import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

const EditableDiv = () => {
  const [text, setText] = useState("");
  const [updatedText, setUpdatedText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSave = () => {
    setUpdatedText(text);
    handleClose();
  };

  return (
    <div>
      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={500}
          display={"inline-block"}
        >
          {t("profileAbout")}:
        </Typography>
        <IconButton onClick={handleIconClick}>
          <EditIcon />
        </IconButton>
        <p
          style={{
            overflowWrap: "anywhere",
            width: "555px",
            display: "inline-block",
          }}
        >
          {updatedText}
        </p>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, width: "450px" }}>
          <TextField
            autoFocus
            margin="dense"
            label="About"
            type="text"
            fullWidth
            color="info"
            value={text}
            onChange={handleChange}
            InputProps={{
              inputProps: {
                maxLength: 120,
              },
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Button color="info" onClick={handleClose}>
                Cancel
              </Button>
              <Button color="info" onClick={handleSave}>
                Save
              </Button>
            </Box>
            {text.length} /120
          </Stack>
        </Box>
      </Popover>
    </div>
  );
};

export default EditableDiv;
