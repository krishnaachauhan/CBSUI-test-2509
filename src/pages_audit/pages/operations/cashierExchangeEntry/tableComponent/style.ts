import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

const useStyles = makeStyles({
  root: {
    "& .MuiInputBase-root": {
      margin: "0px",
      border: "none",
      borderRadius: "none",
      width: "100%",
      "& .MuiInputBase-input": {
        padding: "0px 7px",
        height: "22px",
        textAlign: "right",
      },
    },
  },
  leftTextAlign: {
    "& .MuiInputBase-root": {
      margin: "0px",
      border: "none",
      borderRadius: "none",
      width: "100%",
      "& .MuiInputBase-input": {
        padding: "0px 7px",
        height: "22px",
        textAlign: "right",
      },
    },
  },
  tableBordered: {
    borderCollapse: "separate",
  },
});
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: "var(--theme-color3)",
    color: theme.palette.common.white,
    padding: "5px 10px",
    border: "1px solid var(--theme-color6)",
  },
  [`&.${tableCellClasses.body}`]: {
    padding: "4px 10px",
    border: "1px solid var(--theme-color6)",
    width: "174px",
    "& .flipHorizontal": {
      animation: "flipHorizontal 2s infinite",
      display: "inline-block",
      transformOrigin: "center",
    },
  },
  "@keyframes flipHorizontal": {
    "0%": {
      transform: "scaleX(1)",
    },
    "50%": {
      transform: "scaleX(-1)",
    },
    "100%": {
      transform: "scaleX(1)",
    },
  },

  "& .cellBordered": {
    border: "1px solid #000",
    padding: "8px",
  },
}));

export { useStyles, StyledTableCell };
