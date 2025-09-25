import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "registry"; //register functions to be used across application
import "typeface-roboto";
import "components/multiLanguage/languagesConfiguration";
import { FullScreenLoader } from "components/common/loaderPaper";
import { ThemeProviders } from "app/audit/ThemeProvider";
import { AuthSDK } from "registry/fns/auth";
const AUD = lazy(() => import("app/audit"));
const ErrorPage = lazy(() => import("app/error"));

const Redirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("EnfinityCore");
  }, [navigate]);
  return null;
};

const App = ({ API_URL, WEBSOCKET_URL, WEBSOCKET_ENABLED }) => {
  const apiBaseUrl = new URL("./", API_URL).href;

  const websocketBaseUrl = WEBSOCKET_URL
    ? `${new URL("./", WEBSOCKET_URL)}`
    : `${new URL("./", API_URL).origin}/ws`;

  AuthSDK.inititateAPI(
    apiBaseUrl,
    process?.env?.REACT_APP_API_PROJECT_NAME ?? ""
  );
  AuthSDK.initiateWebSocketEnableFlag(WEBSOCKET_ENABLED);

  AuthSDK.inititateWebSocketUrl(websocketBaseUrl);

  return (
    <StrictMode>
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <ThemeProviders>
            <Suspense fallback={<FullScreenLoader />}>
              {/* <ErrorBoundary> */}
              <Routes>
                <Route path="EnfinityCore/*" element={<AUD />} />
                <Route path="error/*" element={<ErrorPage />} />
                <Route path="*" element={<Redirect />} />
              </Routes>
              {/* </ErrorBoundary> */}
            </Suspense>
          </ThemeProviders>
        </BrowserRouter>
      </DndProvider>
    </StrictMode>
  );
};
const container: any = document.getElementById("root");
container.innerText = "Loading...";
fetch(`${new URL(window.location.href).origin}/config/configuration.json`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    const root = createRoot(container!); // createRoot(container!) if you use TypeScript
    root.render(
      <App
        API_URL={data.API_URL}
        WEBSOCKET_URL={data?.WEBSOCKET_URL}
        WEBSOCKET_ENABLED={data?.WEBSOCKET_ENABLED}
      />
    );
  })
  .catch((err) => {
    container.innerHTML = `<img src="${
      new URL(window.location.href).origin
    }/internal-server-error.svg"  style="aspect-ratio:2/0.9;"/>`;
  });

//ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster,yarh some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
