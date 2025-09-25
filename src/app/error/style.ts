// import { createTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

// const theme = createTheme();

export const useStyles = makeStyles((theme: any) => ({
  wrapper: {
    marginTop: "120px",
    minHeight: "calc(100vh - 165px)",
    boxShadow: "0 3px 6px rgba(0,0,0,0.03)",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  successImg: {
    maxHeight: "calc(100vh - 400px)",
  },
  center: {
    textAlign: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
