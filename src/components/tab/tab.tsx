import { Tab } from "@mui/material";
import { withStyles } from "@mui/styles";

const StyledTab = withStyles((theme: any) => ({
  root: {
    textTransform: "none",
    minWidth: 72,
    marginRight: 0,
    opacity: 1,
    color: "var(--theme-color1)",
    fontWeight: 600,
    fontFamily: [
      "Roboto",
      "Helvetica",
      "Arial",
      "Lucida",
      "sans-serif",
    ].join(","),
    "&:hover": {
      color: "var(--theme-color3)",
      opacity: 1,
    },
    "&$selected": {
      color: "var(--theme-color1)",
      fontWeight: "600",
      // background:
      //   "linear-gradient(-90deg, rgba(94,231,131,1) 0%, rgba(74,205,159,1) 35%, rgba(33,150,218,1) 100%)",
      background: "inherit",
    },
    "&:focus": {
      color: "var(--theme-color1)",
    },
    padding: "3px 8px 3px 8px",
    "&[aria-disabled='true']": {
      color: "gray",
      cursor: "not-allowed",
      pointerEvents: "none",
      opacity: 0.5,
    },
  },
  selected: {},
}))(Tab);

export default StyledTab;