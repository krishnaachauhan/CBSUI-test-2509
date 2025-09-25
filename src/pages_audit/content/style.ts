import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme: any) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflowY: "auto",
    paddingTop: "24px",
    // paddingBottom: "24px",
    background: "rgba(250, 251, 255, 0.9)",
  },
  container: {
    // padding: theme.spacing(2),
    height: "100px",
    // changes from bhavyata for grid ui
    // marginTop: "70px",
    marginTop: "57px",

    // display: "auto",
    // height: `calc(100vh - 109px)`,
  },
}));
