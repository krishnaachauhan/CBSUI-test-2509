import * as React from "react";
// import { makeStyles } from "@material-ui/core/styles";
// import { makeStyles } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";
import { Tab, Theme } from "@mui/material";

export const useStyles = makeStyles((theme: any) => ({
  uploadWrapper: {
    // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%232538584A' stroke-width='4' stroke-dasharray='8' stroke-dashoffset='4' stroke-linecap='square'/%3e%3c/svg%3e")`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(1),
  },
}));

export const useDialogStyles = makeStyles((theme: Theme) => ({
  topScrollPaper: {
    alignItems: "center",
  },
  topPaperScrollBody: {
    verticalAlign: "top",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));

type Customtabprops = {
  isSidebarExpanded: boolean;
};
export const CustomTab = styled(Tab, {
  shouldForwardProp: (prop) => prop !== "isSidebarExpanded",
})<Customtabprops>(({ isSidebarExpanded, theme }) => ({
  minWidth: "60px",
  maxWidth: "250px",
  alignItems: "flex-start",
  // alignItems: isSidebarExpanded ? "flex-start" : "center",
  ...(isSidebarExpanded
    ? {
        // alignItems: "flex-start",
        width: "100%",
        transition: "width 0.2s ease-in-out",
      }
    : {
        // alignItems: "center",
        minWidth: "60px",
        width: "auto",
        transition: "width 0.2s ease-in-out",
      }),
  [theme.breakpoints.down("md")]: {
    // backgroundColor: "#ddd",
    maxWidth: "200px",
  },
}));
