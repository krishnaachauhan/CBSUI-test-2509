import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import india from "assets/images/india.png";
import chinese from "assets/images/china.png";
import english from "assets/images/united-states.png";
import spanish from "assets/images/spain.png";
import french from "assets/images/france.png";
import Indonesia from "assets/images/Indonesia.png";
import Philippines from "assets/images/Philippines.png";
import { useStyles } from "./style";
import { styled } from "@mui/material/styles";
import {
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Box,
  InputBase,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { AuthSDK } from "registry/fns/auth";

// Styled InputBase for custom look
const CustomInput = styled(InputBase)(({ theme }) => ({
  borderRadius: 4,
  backgroundColor: "#fff",
  padding: "4px 8px",
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingRight: "28px !important",
  },
}));

export const MultiLanguages = () => {
  const classes = useStyles();
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.resolvedLanguage);
  const handleChange = (event) => {
    let languageCode = event.target.value;
    setLanguage(languageCode);
    Cookies.set("enfinity.cbs.i18n.language.set.code", languageCode);
    i18n.changeLanguage(languageCode);
    AuthSDK.setDisplayLanguage(i18n.resolvedLanguage);
  };

  useEffect(() => {
    let languageCode = Cookies.get("enfinity.cbs.i18n.language.set.code");
    if (languageCode) {
      i18n.changeLanguage(languageCode);
    }
    AuthSDK.setDisplayLanguage(i18n.resolvedLanguage);
    setLanguage(i18n.resolvedLanguage);
  }, []);

  const menuItemsData = [
    { lable: "English", src: english, value: "en" },
    { lable: "ગુજરાતી", src: india, value: "guj" },
    { lable: "española", src: spanish, value: "sp" },
    { lable: "Français", src: french, value: "fr" },
    { lable: "Indonesia", src: Indonesia, value: "id" },
    { lable: "Philippines", src: Philippines, value: "fil" },
  ];

  return (
    <FormControl
      sx={{
        minWidth: 125,
        backgroundColor: "white",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
        borderRadius: 1,
        border: "none",
      }}
    >
      <Select
        value={language}
        onChange={handleChange}
        displayEmpty
        input={<CustomInput />}
        renderValue={(value) => {
          const langMap = {
            en: { label: "English", icon: english },
            guj: { label: "ગુજરાતી", icon: india },
            sp: { label: "española", icon: spanish },
            fr: { label: "Français", icon: french },
            id: { label: "Indonesia", icon: Indonesia },
            fil: { label: "Philippines", icon: Philippines },
          };
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.9rem",
              }}
            >
              <img
                src={langMap[value].icon}
                alt={langMap[value].label}
                style={{ width: 20, height: 20 }}
              />
              {langMap[value].label}
            </Box>
          );
        }}
      >
        {menuItemsData?.map((langEle) => (
          <MenuItem key={langEle?.value} value={langEle?.value}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={langEle?.src}
                alt={langEle?.lable}
                style={{ width: 20, height: 20 }}
              />
              {langEle?.lable}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
