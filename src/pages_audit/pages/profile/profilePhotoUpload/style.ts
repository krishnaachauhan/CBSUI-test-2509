import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme: any) => ({
  uploadWrapper: {
    // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%232538584A' stroke-width='4' stroke-dasharray='8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e")`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
  },
}));
