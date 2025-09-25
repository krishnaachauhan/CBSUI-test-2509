import { Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const typographyTitleStyle = {
  fontFamily: "Roboto, sans-serif",
  backgroundColor: "var(--theme-color4)",
  padding: "12px",
  color: "var(--theme-color1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "10px",
  textTransform: "capitalize",
  fontWeight: "bold",
  fontSize: "1.3rem",
  borderRadius: "10px",
  cursor: "pointer",
};

const Title = ({ data, index, openBoxes, handleBoxToggle }) => {
  const { DISPLAY_TYPE, TITLE } = data;

  //

  return (
    <>
      {" "}
      {DISPLAY_TYPE !== "OnlyExport" && (
        <Typography
          variant="h5"
          sx={typographyTitleStyle}
          key={index}
          onClick={() => handleBoxToggle(index)}
        >
          {TITLE}
          {openBoxes[index] ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </Typography>
      )}
    </>
  );
};

export default Title;
