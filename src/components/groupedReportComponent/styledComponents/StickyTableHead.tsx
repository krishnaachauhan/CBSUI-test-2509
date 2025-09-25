import { withStyles } from "@mui/styles";
import TableHead from "@mui/material/TableHead";

export const StickyTableHead = withStyles(() => ({
  root: {
    position: "sticky",
    // zIndex: 10,
    top: 0,
    borderRadius: "8px",
    overflow: "hidden",
    "&>.MuiTableRow-root .MuiTableCell-head": {
      position: "relative",
      fontWeight: 600,
      color: "var(--theme-color1)",
      background: "var(--theme-color4)",
      "&::before": {
        position: "absolute",
        content: '""',
        top: "50%",
        transform: "translateY(-50%)",
        right: 0,
        height: "12px",
        width: "1.75px",
        background: "#ddd",
      },
      "&:first-child": {
        borderRadius: "8px 0 0 8px",
      },
      "&:last-child": {
        borderRadius: "0 8px 8px 0",
        "&::before": { display: "none" },
      },
    },
  },
}))(TableHead);
