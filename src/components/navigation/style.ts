// import { createTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
// const theme = createTheme();

export const useStylesBootstrapNav = makeStyles((theme: any) => ({
  navBarCSS: {
    padding: "4px 1rem ",
    backgroundColor: "#fff !important",
    minHeight: "64px",
    boxShadow: "0 3px 6px rgba(0,0,0,0.03)",
    margin: "10px",
  },
  headerDropdown: {
    backgroundColor: "#fff",
    minWidth: "205px",
    boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
    textDecoration: "none",
    borderBottom: "3px solid  #26A456",
  },
  navLinkHeader: {
    color: "#555",
    fontSize: "14px",
    lineHeight: "1.2",
    paddingTop: "4px",
    paddingBottom: "4px",
    paddingRight: ".5rem",
    paddingLeft: ".5rem",
    fontWeight: 600,
    textTransform: "capitalize",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",

    "& hover": {
      color: "#0b6fb8",
    },
  },
  productLink: {
    color: "#555",
    padding: "0 1rem 8px 1rem",
    display: "inline-block",
    verticalAlign: "middle",
    cursor: "pointer",
    textTransform: "capitalize",
  },
  font13: {
    fontSize: "13px",
  },
  loginDropdown: {
    width: "160px",
  },
}));

export const useStylesSideBar = makeStyles((theme: any) => ({
  root: {
    justifyContent: "center",
  },
  drawer: {
    margin: "5px",
  },
  item: {
    display: "flex",
    //borderBottom: "2px solid #93242433",
    borderRadius: "8px",
    marginLeft: "7px",
    marginTop: "6.5px",
    width: "90%",
    height: "50px",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    background: "var(--theme-color2)",
    boxShadow: "3px 6px 9px rgba(93, 95, 121, 0.26)",
    "& svg": {
      // color: theme.palette.primary.main,
      color: "var(--theme-color1)",
    },
    "&:hover": {
      boxShadow:
        "6px 6px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 0px 0px rgba(0,0,5,0.12)",
      background: "var(--theme-color4)",
      transition: "0.6s ease",
    },
  },
  drawerIconSize: {
    width: "50px",
    height: "50px",
    padding: "18px",
    justifyItems: "cenetr",
  },
  button: {
    color: "#0063A3",
    padding: "10px 8px",
    //justifyContent: "flex-start",
    textTransform: "none",
    letterSpacing: 0,
    width: "100%",
    textAlign: "left",
    "&:hover": {
      backgroundColor: "var(--theme-color1)",
      // boxShadow: "0px 15px 20px rgb(221 176 176 / 37%)",
    },
  },
  btnRoot: {
    paddingLeft: "24px",
    justifyContent: "left ",
  },
  navLinks: {
    // height: "calc(100vh - 78px)",
    overflowY: "auto",
    overflowX: "hidden",
    // height:"100px",
    backgroundColor: "rgba(250, 251, 255, 0.9);",
    // height: "calc(100vh - 230px)",
    //background: "var(--theme-color1)",
    // marginTop: "25px",
    // boxShadow: "0 3px 6px rgba(255, 99, 71, 0.3)",
    borderRadius: "10px",
    paddingTop: "5px",
    //margin: "5px",
  },
  navLinksforseparateView: {
    overflowY: "auto",
    overflowX: "hidden",
    height: "calc(100vh - 180px)",
    // height:"auto",
    paddingTop: "10px",
  },
  nestedMenuLevel1: {
    paddingLeft: "20px",
    marginTop:"11px",
    paddingRight: theme.spacing(3),
    height: "auto",
    fontSize: "13px",
    "& div > svg": {
      fontSize: "14px",
    },
  },
  nestedMenuLevel2: {
    paddingLeft: "20px",
    marginTop:"11px",
    fontSize: "12px",
    "& div > svg": {
      fontSize: "9px",
    },
  },
  listIcon: {
    minWidth: "30px !important",
    justifyItems: "center",
    color: "var(--theme-color6)",
    fontWeight: 700,
    fontSize: "18px",
  },
  link: {
    fontSize: "1rem ",
    marginTop: "2px",
    marginBottom: "2px",
    textOverflow: "ellipsis",
    color: "var(--theme-color1)",
    marginLeft: "15px",
    whiteSpace: "break-spaces",
    "& span": {
      fontWeight: 400,
      whiteSpace: "break-spaces",
    },
    "& p": {
      color: "var(--theme-color3)",
      fontweight: 400,
    },
  },
  linktext: {
    backgroundColor: "var(--theme-color2)",
    "&:hover": {
      background: "var(--theme-color1)",
      "& div": {
        color: "var(--theme-color2) !important",
      },
      "& div > svg": {
        color: "var(--theme-color2) !important",
      },
    },
  },
  faSmall: {
    fontSize: "13px ",
  },
  openList: {
    ":not(activeMenuItem)": {
      "& > div": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      "&  *": {
        color: "var(--theme-color2)",
      },
    },
  },
  openCurrent: {
    backgroundColor: "var(--theme-color1)",
    "&  *": {
      color: "var(--theme-color2)",
    },
    "&:hover": {
      backgroundColor: "var(--theme-color1)",
    },
  },
  slimList: {
    paddingTop: "15px",
    paddingBottom: "13px",
    height: "auto",
    paddingLeft: "15px",
    justifyItems: "center",
  },
  activeMenuItem: {
    backgroundColor: "var(--theme-color1)!important ", //"var(--theme-color2)!important",

    "& > div": {
      color: "var(--theme-color2)!important",
    },
    "& svg": {
      color: "var(--theme-color4)",
    },
    "& hover": {
      "& > div": {
        color: "var(--theme-color3)",
      },
    },
    "& p": {
      color: "var(--theme-color6)",
    },
  },
}));
