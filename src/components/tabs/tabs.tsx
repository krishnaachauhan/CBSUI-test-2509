import { Tabs } from "@mui/material";
import { withStyles } from "@mui/styles";

const StyledTabs: any = withStyles((theme) => ({
  root: {
    border: "none",
    borderRadius: "6px",
    background: "var(--theme-color2)",
    // boxShadow:
    //   "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  indicator: {
    // background:
    //   "linear-gradient(-90deg, rgba(94,231,131,1) 0%, rgba(74,205,159,1) 35%, rgba(33,150,218,1) 100%)",
    background: "var(--theme-color3)",
    bottom: 0,
    height: 3,
  },
}))(Tabs);

export default StyledTabs;
