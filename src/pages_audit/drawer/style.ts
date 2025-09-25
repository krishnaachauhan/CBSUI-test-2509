import { makeStyles } from "@mui/styles";

const drawerWidth = 227;

export const useStyles = makeStyles((theme: any) => ({
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    border: "none",
    overflow: "hidden",
    zIndex: 120,
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(8),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(8),
    },
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    zIndex: 9999,
    ...theme.mixins.toolbar,
    background: "var(--theme-color2)",
    justifyContent: "center",
    height: "80px",
    // borderBottom: "1px dashed #949597",
  },
  hrCSS: {
    zIndex: 9999,
  },
  buttonLink: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    display: "inline",
    margin: 0,
    padding: 0,
    "&:focus": {
      textDecoration: "none",
    },
    "$:hover": {
      textDecoration: "none",
    },
  },
}));

/*
  
*/
