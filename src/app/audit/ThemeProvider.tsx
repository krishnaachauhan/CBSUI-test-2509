import { createTheme } from "@mui/material";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";

type Theme = Record<string, string>;

type ThemeContextType = {
  themed: string;
  setTheme: (themeName: string) => void;
  themeObj: any;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const getCssVariable = (variableName: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

export const ThemeProviders: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themed, setTheme] = useState(
    () => localStorage.getItem("theme") || "theme1"
  );
  const [themeColor, setThemeColor] = useState("#000");

  const themes: Record<string, Theme> = {
    theme1: {
      "--theme-color1": "#07288e",
      "--theme-color2": "#ffffff",
      "--theme-color3": "#4263c7",
      "--theme-color4": "#eceff9",
      "--theme-color5":
        "linear-gradient(71.66deg, #4285f4 -2.97%, #885df5 111.3%)",
      "--primary-bg":
        "linear-gradient(71.66deg, #4285f4 -2.97%, #885df5 111.3%)",
      "--theme-color6": "rgba(148, 149, 151, 1)",
      "--theme-color7": "#e7e5e563",
      "--report-export-theme": "#07288e",
    },
    theme2: {
      "--theme-color1": "#075f2a",
      "--theme-color2": "#ffffff",
      "--theme-color3": "#3b694d",
      "--theme-color4": "#e8f5e9",
      "--theme-color5":
        "linear-gradient(71.66deg, #3b694d -2.97%, #98d19a 111.3%)",
      "--primary-bg":
        "linear-gradient(71.66deg, #3b694d -2.97%, #98d19a 111.3%)",
      "--theme-color6": "rgba(148, 149, 151, 1)",
      "--report-export-theme": "#075f2a",
    },
    theme3: {
      "--theme-color1": "#b12e44",
      "--theme-color2": "#ffffff",
      "--theme-color3": "#c91450",
      "--theme-color4": "#fce4ec",
      "--theme-color5":
        "linear-gradient(71.66deg, #b12e44 -2.97%, #fce4ec 111.3%)",
      "--primary-bg":
        "linear-gradient(71.66deg, #b12e44 -2.97%, #fce4ec 111.3%)",
      "--theme-color6": "rgba(148, 149, 151, 1)",
      "--report-export-theme": "#b12e44",
    },
    theme4: {
      "--theme-color1": "#0a5da0",
      "--theme-color2": "#ffffff",
      "--theme-color3": "#2196f3",
      "--theme-color4": "#e3f2fd",
      "--theme-color5":
        "linear-gradient(71.66deg, #2196f3 -2.97%, #eceff1 111.3%)",
      "--primary-bg":
        "linear-gradient(71.66deg, #2196f3 -2.97%, #eceff1 111.3%)",
      "--theme-color6": "rgba(148, 149, 151, 1)",
      "--report-export-theme": "#0a5da0",
    },
    theme5: {
      "--theme-color1": "#405864",
      "--theme-color2": "#ffffff",
      "--theme-color3": "#597380",
      "--theme-color4": "#eceff1",
      "--theme-color5":
        "linear-gradient(71.66deg, #597380 -2.97%, #eceff1 111.3%)",
      "--primary-bg":
        "linear-gradient(71.66deg, #597380 -2.97%, #eceff1 111.3%)",
      "--theme-color6": "rgba(148, 149, 151, 1)",
      "--report-export-theme": "#405864",
    },
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: "#fff",
          },
          secondary: {
            main: themeColor,
          },
        },
        components: {
          MuiButtonBase: {
            defaultProps: {
              sx: {
                textTransform: "capitalize !important",
              },
            },
          },
          MuiButton: {
            defaultProps: {
              sx: {
                "&.gradient-btn": {
                  boxShadow: "2px 2px 4px rgba(0,0,0,.2) !important",
                  "&:hover": {
                    boxShadow:
                      "rgba(0, 0, 0, 0.2) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px !important",
                  },
                },
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              variant: "standard",
            },
          },
        },
      }),
    [themed, themeColor]
  );

  useEffect(() => {
    localStorage.setItem("theme", themed);
    let selectedTheme = themes[themed];
    if (!selectedTheme) {
      selectedTheme = themes["theme1"];
    }
    Object.entries(selectedTheme).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    setThemeColor(getCssVariable("--theme-color1"));
  }, [themed]);

  return (
    <ThemeContext.Provider value={{ themed, setTheme, themeObj: theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
