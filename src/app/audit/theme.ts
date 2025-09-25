import { createTheme } from "@mui/material/styles";
const getCssVariable = (variableName: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
export const theme = createTheme({
  palette: {
    //@ts-ignore
    primary: {
      main: "#fff",
    },
    //@ts-ignore
    secondary: {
      // main: "#07288e",
      main: getCssVariable("--theme-color3"),
      // }
    },
  },
  // breakpoints: {
  //   values: {
  //     xs: 600,
  //     sm: 960,
  //     md: 1024,
  //     lg: 1280,
  //     xl: 1920,
  //   },
  // },
  // components: {
  //   MuiTextField: {
  //     styleOverrides: {
  //       root: {
  //         "& .MuiOutlinedInput-root.Mui-focused": {
  //           "& > fieldset": {
  //             borderColor: "#07288e",
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "standard",
      },
    },
  },
});
export const theme2 = createTheme({
  palette: {
    //@ts-ignore
    primary: {
      main: "#07288e",
    },
    //@ts-ignore
    secondary: {
      main: "#fff",
    },
  },
  // breakpoints: {
  //   values: {
  //     xs: 600,
  //     sm: 960,
  //     md: 1024,
  //     lg: 1280,
  //     xl: 1920,
  //   },
  // },
});
