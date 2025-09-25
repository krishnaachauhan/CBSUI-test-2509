import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme: any) => ({
  tabStyle: {
    paddingTop: "5px",
    marginLeft: "12px",
    "& .MuiButtonBase-root": {
      padding: "10px !important",
      borderRadius: "3px",
      minHeight: "38px",
      // fontSize: "13px",
      marginRight: "8px",
      background: "var(--theme-color2)",
      boxShadow:
        "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px",
      "&:hover": {
        // fontSize: "13.5px",
        padding: "9px !important",
        border: "1px solid var(--theme-color3)",
        color: "var(--theme-color3)",
        boxShadow: "none",
      },
    },
    "& .Mui-selected": {
      background: "var(--theme-color5)",
      color: "var(--theme-color2) !important",
      boxShadow: "none",
    },
    "& .MuiTabs-indicator": {
      background: "var(--theme-color3)",
    },
  },
}));
