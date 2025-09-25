import {
  WorkerContextProvider,
  PopupContextProvider,
  SnackbarProviderWrapper,
  queryClient,
} from "@acuteinfo/common-base";

import { RecoilRoot } from "recoil";
import { QueryClientProvider } from "react-query";
import "registry/fns/registerFnsCbsEnfinity";
import IndexPage from "pages_audit";
import "./pivot.css";
import "./index.css";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CustomSnackbarContent } from "components/customNotification/customNotistack";
import { useTheme } from "./ThemeProvider";

export const App = () => {
  const { themeObj } = useTheme();
  return (
    <RecoilRoot>
      <ThemeProvider theme={themeObj}>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <PopupContextProvider>
              <WorkerContextProvider>
                <SnackbarProviderWrapper
                  maxSnack={3}
                  autoHideDuration={5000}
                  Components={{ exportReportSnackbar: CustomSnackbarContent }}
                >
                  <IndexPage />
                </SnackbarProviderWrapper>
              </WorkerContextProvider>
              {/* {process.env.NODE_ENV !== "production" ? (
                <ReactQueryDevtools />
              ) : null} */}
            </PopupContextProvider>
          </QueryClientProvider>
        </StyledEngineProvider>
      </ThemeProvider>
    </RecoilRoot>
  );
};
