import React, { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useStyles } from "./style";
import { AuthContext } from "../auth";
import IconButton from "@mui/material/IconButton";
import { Button, Popover, Typography } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
export const UserDetail = () => {
  const authController = useContext(AuthContext);
  const navigate = useNavigate();
  const classes = useStyles();
  const handleNavigate = () => {
    navigate("/EnfinityCore/profile");
    handleClose();
  };
  const [anchorEl1, setAnchorEl1] = useState(null);
  const handleClick = (event) => {
    setAnchorEl1(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl1(null);
  };
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        style={{
          backgroundColor: "rgba(235, 237, 238, 0.45)",
          borderRadius: "10px",
          height: "30px",
          width: "30px",
        }}
      >
        {/* <Badge badgeContent={3} color="info"> */}
        <PersonOutlineOutlinedIcon
          color="inherit"
          fontSize="small"
          sx={{ color: "var(--theme-color3)" }}
        />
        {/* </Badge> */}
      </IconButton>
      <Popover
        anchorEl={anchorEl1}
        open={Boolean(anchorEl1)}
        onClose={handleClose}
        elevation={8}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: { minWidth: "150px" },
        }}
      >
        <div style={{ padding: "16px" }}>
          <Typography variant="h6" className={classes.userName}>
            User Name :- {authController?.authState?.user?.name}
            {/* jklrrklklh;klhkl;kld;ldfkldfklmkldklkdkldmlmdlmdfklmdfmdmdkmdm;kdm;kldm;kdfmdfm;kldfm */}
          </Typography>
          {/* <Typography variant="h6" className={classes.userDesignation}>
            Bank Name :- {authController?.authState?.companyName}
          </Typography> */}
          <Typography variant="h6" className={classes.userDesignation}>
            Role :- {authController?.authState?.roleName}
          </Typography>
          <Typography variant="h6" className={classes.userDesignation}>
            User ID :- {authController?.authState?.user?.id}
          </Typography>
          <Typography variant="h6" className={classes.userDesignation}>
            Last UnSuccessful Login :-
          </Typography>
        </div>

        <div style={{ padding: "16px" }}>
          <Button
            onClick={handleNavigate}
            fullWidth
            variant="outlined"
            style={{
              background: "var(--theme-color5)",
              color: "white",
              display: "block",
              margin: "5px auto",
            }}
          >
            User Profile
          </Button>
          <Button
            onClick={() => {
              authController?.logout();
              handleClose();
            }}
            fullWidth
            variant="outlined"
            style={{
              background: "var(--theme-color5)",
              color: "white",
              display: "block",
              margin: "auto",
            }}
          >
            Logout
          </Button>
        </div>
      </Popover>
    </>
  );
};
