import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useStyles } from "./style";
import { Drawer, IconButton } from "@mui/material";
export const MyDrawer = ({
  open,
  handleDrawerClose,
  handleDrawerOpen,
  children,
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
      }}
      open={open}
    >
      <div className={classes.toolbarIcon}></div>
      {children}
    </Drawer>
  );
};
