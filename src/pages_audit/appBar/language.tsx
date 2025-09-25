import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import romanian from "assets/images/romania.png";
import chinese from "assets/images/china.png";
import english from "assets/images/united-states.png";
import french from "assets/images/france.png";
import { useStyles } from "./style";
import { FormControl, Select, MenuItem } from "@mui/material";
export const Language_App = () => {
  const classes = useStyles();
  const [language, setLanguage] = useState("");

  const handleChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <>
      <FormControl size="small" style={{ marginLeft: "13px" }}>
        <Select
          style={{
            maxWidth: "100px",
            width: "100px",
            // display: "flex",
          }}
          disableUnderline
          variant="standard"
          value={language}
          onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          sx={{
            "& .MuiInput-input": {
              display: "contents",
              background: "red",
            },
            "& .MuiSelect-icon": {
              paddingBottom: "4px",
            },
          }}
        >
          <MenuItem
            style={{
              display: "flex",
            }}
            value=""
          >
            <div key="Language" style={{ display: "flex" }}>
              <img src={english} alt="" className={classes.lang_svg} />
            </div>
            English
          </MenuItem>

          {/* <MenuItem
            value="romanian"
            style={{
              display: "flex",
            }}
          >
            <div key="Language" style={{ display: "flex" }}>
              <img src={romanian} alt="" className={classes.lang_svg} />
            </div>
            Roman
          </MenuItem>
          <MenuItem
            value="french"
            style={{
              display: "flex",
            }}
          >
            <div key="Language" style={{ display: "flex" }}>
              <img src={french} alt="" className={classes.lang_svg} />
            </div>
            French
          </MenuItem>
          <MenuItem
            value="chinese"
            style={{
              display: "flex",
            }}
          >
            <div key="" style={{ display: "flex" }}>
              <img src={chinese} alt="" className={classes.lang_svg} />
            </div>
            Chinese
          </MenuItem> */}
        </Select>
      </FormControl>
    </>
  );
};
