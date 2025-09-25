import {
  useState,
  Fragment,
  useEffect,
  lazy,
  useContext,
  memo,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Content } from "./content";
import { useStyles } from "./style";
import { Profile } from "./pages/profile";
import Dashboard from "./pages/dashboard/dashboard";
import { OperationsMenu } from "./pages/operations";
import { ETFOperationsMenu } from "./pages/EasyTradeFinance/operations";
import AccountDetails from "./pages/STATEMENT/accountDetails";
import { Configuration } from "./pages/configuration";
import DynamicGrids from "./pages/configuration/dynamicGrids";
import Master from "./pages/master/master";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
// import { AccDetailContext } from "./auth";
import { AuthContext } from "./auth";
import {
  AuthContextProvider,
  GradientButton,
  LoaderPaperComponent,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { MultiLanguages } from "./auth/multiLanguages";
import SearchScreen from "./appBar/searchScreen";
import { AppbarWrapper, SidebarWrapper } from "@acuteinfo/common-screens";
import useLogoPics from "components/logoPics/logoPics";
import { LogoutModal } from "./appBar/logoutModal";
import { AppBar } from "./appBar";
import { Quick_View } from "./appBar/quickView";
import {
  Alert,
  Box,
  Dialog,
  Drawer,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Accountinquiry } from "./acct_Inquiry/acct_inquiry";
import AllScreensGridWrapper from "./pages/allScreens/index";
import CloseScreen from "./appBar/closeScreen";
import AcctMSTProvider from "./pages/operations/acct-mst/AcctMSTContext";
import AcctMST from "./pages/operations/acct-mst/AcctMST";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import DailyTransTabs from "./pages/operations/DailyTransaction/TRNHeaderTabs";
import { useMutation } from "react-query";
import { LoadingTextAnimation } from "components/common/loader";
import { getCarousalCards } from "./pages/operations/AcctCardScaningEntry/api";
import { t } from "i18next";
import { getTabsByParentType } from "./pages/operations/denomination/api";
import SearchAcctGridMain from "components/common/custom/searchAccountMaster";
import JointDetails from "./pages/operations/DailyTransaction/TRNHeaderTabs/JointDetails";
import { useQuery } from "react-query";
import { getImageData } from "./auth/api";
import { isBase64 } from "components/utilFunction/function";
import Reports from "./pages/reports";
import { PaperComponent } from "./pages/operations/DailyTransaction/TRN001/components";
import ReqDecryptFormMain from "./pages/decryptRequest";
import "driver.js/dist/driver.css";
import { driver, DriveStep } from "driver.js";
import HelpIcon from "@mui/icons-material/Help";
import { Chat } from "./pages/profile/chat/chat";
import demoTour from "./demoTour.json";
import { Notification_App } from "./appBar/notification/notification";
import DynamicReports from "./pages/reports/dynamicReports";
import JasperReports from "./pages/jasperReport";
import NotHaveAccess from "../app/error/notHavAccess";
import AcctModal from "./pages/operations/acct-mst/AcctModal";
import LogoutIcon from "@mui/icons-material/Logout";
import ListIcon from "@mui/icons-material/List";

export const PagesAudit = (props, { columns }) => {
  const [acctInq, setAcctInq] = useState(false);
  const [drawerOpen, setDrawerState] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isOpenAcctInq, setIsOpenAcctInq] = useState(false);
  const [allScreensSection, setAllScreensSection] = useState("");
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const authController = useContext(AuthContext);
  const navigate = useNavigate();
  const logos = useLogoPics();
  const classes = useStyles();
  const isValidURL = props?.isValidURL ?? true;
  const { acctData } = props?.dialogsState || {};
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const above1300 = useMediaQuery("(min-width:1300px)");
  const [countdownMessage, setCountdownMessage] = useState("");
  const [blinker, setBlinker] = useState(0);
  const [openTimeoutDlg, setOpenTimeoutDlg] = useState(false);

  const getAccountDetails: any = useMutation(getCarousalCards, {
    onSuccess: (data) => {},
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });
  const getTabDetails: any = useMutation(getTabsByParentType, {
    onSuccess: (data) => {},
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });
  if (Boolean(props?.dialogsState?.isAcctDtlOpen)) {
    localStorage.setItem("commonClass", "AcctTab");
  }

  useEffect(() => {
    if (!props?.idleTimer) return;
    const updateCountdown = () => {
      const remainingTime = props?.idleTimer.getRemainingTime();
      const remainingSeconds = Math.floor(remainingTime / 1000); // Convert to seconds
      if (remainingSeconds <= 30 && remainingSeconds > 0) {
        setCountdownMessage(
          `Your session will time out in ${remainingSeconds} seconds`
        );
        setBlinker((prev) => prev + 1);
        setOpenTimeoutDlg(true);
      } else {
        setCountdownMessage(""); // Clear the message if more than 30 seconds
        setBlinker(0);
        setOpenTimeoutDlg(false);
      }
    };
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [props?.idleTimer]);

  useEffect(() => {
    if (props?.dialogsState?.isAcctDtlOpen && acctData) {
      getTabDetails?.mutate({
        reqData: acctData,
      });
      getAccountDetails.mutate({
        PARENT_TYPE: "",
        ACCT_TYPE: acctData?.ACCT_TYPE,
        ACCT_CD: acctData?.ACCT_CD,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
    }
  }, [props?.dialogsState?.isAcctDtlOpen]);
  const [dashboardLogoURL, setDashboardLogoURL] = useState<any | null>(null);
  const urlObj = useRef<any>(null);

  const handleDrawerOpen = () => {
    setDrawerState(true);
    handleCardStateUpdate();
  };
  const handleDrawerClose = () => {
    setDrawerState(false);
    handleCardStateUpdate();
  };
  const handleCardStateUpdate = () => {
    //to update the state once | carousal responsiveness
    let obj = { random: Math.random() };
    // setCardStore({ ...cardStore, obj });
  };

  useEffect(() => {
    if (location.pathname === "/EnfinityCore/dashboard") {
      handleDrawerOpen();
    } else if (location.pathname) {
      handleDrawerClose();
    } else {
      handleDrawerOpen();
    }
  }, [location.pathname]);

  const allMenuChildren = useMemo(() => {
    const menu = authController?.authState?.menulistdata;
    let allChild: any[] = [];
    if (Array.isArray(menu) && menu.length > 0) {
      menu.forEach((item) => {
        if (item?.children && item?.children.length > 0) {
          allChild = allChild.concat(item?.children);
        }
      });
    }
    return allChild;
  }, [authController?.authState?.menulistdata?.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key && e.key !== "Control") {
        const finalKey = "Ctrl+" + e.key?.toUpperCase();
        const isShortcutKeyExist: any = allMenuChildren.find(
          (child) => child?.short_cut_key === finalKey
        );
        if (isShortcutKeyExist?.short_cut_key && isShortcutKeyExist?.href) {
          e.preventDefault();
          navigate(`/EnfinityCore/${isShortcutKeyExist?.href}`);
        }
      } else if (e.key && e.key !== "Control") {
        const isShortcutKeyExist: any = allMenuChildren.find(
          (child) => child?.short_cut_key === e.key
        );
        if (isShortcutKeyExist?.short_cut_key && isShortcutKeyExist?.href) {
          e.preventDefault();
          navigate(`/EnfinityCore/${isShortcutKeyExist?.href}`);
        }
      }
      if (e.key === "F5") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const headingWithButton = useMemo(
    () => (
      <div
        className="AcctTab"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: "-1",
        }}
      >
        {"Account Details"}

        <GradientButton
          onClick={() => {
            props?.handleDialogClose();
            localStorage.removeItem("commonClass");
          }}
          color={"primary"}
        >
          {t("close")}
        </GradientButton>
      </div>
    ),
    [props?.handleDialogClose]
  );
  const {
    data: imageData,
    isLoading,
    isFetching,
  } = useQuery<any, any>(["getLoginImageData"], () => getImageData());
  useEffect(() => {
    if (Boolean(imageData && !isLoading)) {
      const logoUrl = imageData?.[0]?.DASHBOARD_APP_LOGO;
      if (isBase64(logoUrl)) {
        let blob = utilFunction.base64toBlob(logoUrl);
        urlObj.current =
          typeof blob === "object" && Boolean(blob)
            ? URL.createObjectURL(blob)
            : "";
        setDashboardLogoURL(urlObj.current);
      } else {
        setDashboardLogoURL(logoUrl);
      }
    }
  }, [imageData, isLoading]);

  // demo help
  const driverRef = useRef<any>(null);
  const [driverSteps, setDriverSteps] = useState<any>(null);
  useEffect(() => {
    // fetch(`${process.env.PUBLIC_URL}/config/configuration.json`)
    //   .then((res) => {
    //     if (!res.ok) {
    //       throw new Error("Issues while fetching public config!!");
    //     }
    //     return res.json();
    //   })
    //   .then((data) => setDriverSteps(data?.DEMO_TOUR ?? null))
    //   .catch((err) =>
    //     console.log("Error while fetching public config file!!", err)
    //   );
    setDriverSteps(demoTour?.DEMO_TOUR ?? null);
  }, []);

  // Handle initialization of Driver.js and start tour on button click
  const startTour = () => {
    if (!driverRef.current) {
      driverRef.current = driver({
        showProgress: true,
        animate: true,
        disableActiveInteraction: true,
      });
    }

    // Clean up active tooltips
    if (driverRef.current.isActive()) {
      driverRef.current.destroy();
    }

    // Get the current steps for the route
    const currentSteps: DriveStep[] = driverSteps?.[location.pathname];
    if (currentSteps && driverRef.current) {
      // replace title, desc with configured language
      const currentStepsWithLang = currentSteps.map((step) => {
        return {
          ...step,
          popover: {
            ...step.popover,
            title: t(step.popover?.title ?? ""),
            description: t(step.popover?.description ?? ""),
          },
        };
      });
      // filter steps is element is not present in DOM
      const filteredSteps = currentStepsWithLang.filter((step) =>
        Boolean(document.querySelector(`${step.element}`))
      );
      driverRef.current.setSteps(filteredSteps); // Set steps
      driverRef.current.drive(); // Start the tour
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy(); // Cleanup tour
      }
    };
  }, []);

  const MoreMenu = () => {
    return (
      <>
        <IconButton
          disableRipple
          onClick={(event) => {
            setMoreMenuOpen(true);
          }}
          size="medium"
          sx={{
            color: "var(--theme-color3)",
            position: "static",
            background: "transperant",
            "&:hover": {
              background: "var(--theme-color4)",
            },
          }}
        >
          <ListIcon fontSize="large" />
        </IconButton>

        <Drawer
          anchor="right"
          open={moreMenuOpen}
          onClose={() => setMoreMenuOpen(false)}
          PaperProps={{
            sx: { width: 250, padding: 2, gap: "10px" },
          }}
        >
          {!location.pathname.includes("dashboard") &&
          !location.pathname.includes("all-screens") ? (
            <CloseScreen />
          ) : null}
          <Tooltip title={t("AccountInquiry")} placement="bottom" arrow>
            <IconButton
              onClick={() => {
                setIsOpenAcctInq(true);
                setMoreMenuOpen(false);
              }}
              sx={{
                backgroundColor: "rgba(235, 237, 238, 0.45)",
                borderRadius: "10px",
                height: "36px",
                width: !above1300 ? "100%" : "auto",
                padding: "0 8px",
                "&:hover": {
                  background: "var(--theme-color2)",
                  boxShadow:
                    "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                  transition: "all 0.2s ease",
                },
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <PersonSearchOutlinedIcon
                fontSize="small"
                sx={{
                  color: "var(--theme-color3)",
                }}
              />
              {!above1300 && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "var(--theme-color3)",
                  }}
                >
                  {t("AccountInquiry")}
                </Typography>
              )}
            </IconButton>
          </Tooltip>
          <Quick_View />
          <Notification_App />
          {/* Logout */}
          <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }}>
            <Tooltip title={t("Logout")} placement="bottom" arrow>
              <IconButton
                onClick={() => {
                  setMoreMenuOpen(false);
                  setLogoutOpen(true);
                }}
                color="error"
                sx={{
                  backgroundColor: "rgba(235, 237, 238, 0.45)",
                  borderRadius: "10px",
                  height: "36px",
                  width: "100%",
                  padding: "0 8px",
                  "&:hover": {
                    background: "var(--theme-color2)",
                    boxShadow:
                      "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                    transition: "all 0.2s ease",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                aria-label="logout"
              >
                <LogoutIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {t("Logout")}
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>
      </>
    );
  };

  return (
    <Fragment>
      <AuthContextProvider authState={authState}>
        <div className={classes.root}>
          <div className="appbar-class">
            <AppbarWrapper
              authState={authController?.authState}
              handleDrawerClose={handleDrawerClose}
              handleDrawerOpen={handleDrawerOpen}
              navigate={navigate}
              open={drawerOpen}
              dashboardUrl="./dashboard"
              LanguageComponent={MultiLanguages}
              SearchComponent={SearchScreen}
              bankLogo={dashboardLogoURL}
              handleLogout={() => setLogoutOpen(true)}
              handleProfile={() => navigate("./profile")}
              logos={logos}
              profilePic={
                Boolean(authController?.getProfileImage)
                  ? authController?.getProfileImage
                  : logos?.profile
              }
              optionalComponents={
                !above1300
                  ? [{ Component: MoreMenu }]
                  : [
                      {
                        Component:
                          location.pathname.includes("dashboard") ||
                          location.pathname.includes("all-screens")
                            ? () => null
                            : CloseScreen,
                      },
                      {
                        Component: AcctEnqwrapper,
                        props: {
                          open: acctInq,
                          setAcctInq,
                        },
                      },
                      { Component: Quick_View },
                      { Component: Notification_App },
                    ]
              }
              hideGreetings={false}
              idleTimer={props?.idleTimer}
            />
          </div>
          {/* <AppBar
            handleDrawerOpen={handleDrawerOpen}
            handleDrawerClose={handleDrawerClose}
            open={drawerOpen}
            columns={undefined}
          /> */}
          <SidebarWrapper
            authState={authController?.authState ?? {}}
            handleDrawerOpen={handleDrawerOpen}
            open={drawerOpen}
            navigate={navigate}
            rootUrl="EnfinityCore"
            dashboardUrl="dashboard"
            handleListItemClick={(flag) => {
              setAllScreensSection(flag);
            }}
          />
          <Content>
            <Routes>
              {isValidURL ? (
                <>
                  {/* <Route
                  path="all-screens/*"
                  element={<AllScreensGridWrapper />}
                /> */}
                  <Route path="profile" element={<Profile />} />
                  <Route path="dashboard/*" element={<Dashboard />} />
                  <Route path="master/*" element={<Master />} />
                  <Route path="report/*" element={<Reports />} />
                  <Route path="jasperreport/*" element={<JasperReports />} />
                  <Route path="operation/*" element={<OperationsMenu />} />
                  <Route
                    path="easy-trade-finance/operation/*"
                    element={<ETFOperationsMenu />}
                  />
                  <Route path="view-statement/*" element={<AccountDetails />} />
                  <Route
                    path="all-screens/*"
                    element={<AllScreensGridWrapper />}
                  />
                  <Route path="configuration/*" element={<Configuration />} />
                  <Route path="dynamicgrid/:id/*" element={<DynamicGrids />} />
                  <Route
                    path="lowcode-reports/*"
                    element={<DynamicReports />}
                  />
                  <Route path="no-access/*" element={<NotHaveAccess />} />
                  {/* <Route
                  path="branch-selection/*"
                  element={<BranchSelectionGridWrapper  />}
                /> */}
                </>
              ) : null}
              <Route
                path="*"
                element={<RedirectComponent isValidURL={isValidURL} />}
              />
            </Routes>
            {/* <div
            style={{
              position: "absolute",
              right: "0px",
              bottom: "0px",
              zIndex: "1501",
            }}
          >
            <ChatMessageBox />Switch 
          </div> */}
            {logoutOpen ? (
              <LogoutModal
                logoutOpen={logoutOpen}
                setLogoutOpen={setLogoutOpen}
              />
            ) : null}
            {driverSteps?.[location.pathname] ? (
              <div
                style={{
                  position: "fixed",
                  bottom: 10,
                  left: 10,
                  zIndex: 10000,
                }}
              >
                <Tooltip title="Start tour">
                  <IconButton onClick={startTour} color="secondary">
                    <HelpIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              </div>
            ) : null}
            {isOpenAcctInq && (
              <AcctEnqwrapper
                open={isOpenAcctInq}
                setAcctInq={setIsOpenAcctInq}
                isHideIcon={true}
              />
            )}
            {Boolean(allScreensSection?.trim()) ? (
              <Dialog
                open={Boolean(allScreensSection?.trim())}
                maxWidth="xl"
                fullWidth
                onKeyUp={(e) => {
                  if (e.key === "Escape") {
                    setAllScreensSection("");
                  }
                }}
                PaperProps={{
                  style: {
                    padding: "5px",
                  },
                }}
              >
                <AllScreensGridWrapper
                  selectedSection={allScreensSection?.trim()}
                  onClose={() => setAllScreensSection("")}
                />
              </Dialog>
            ) : null}
            {Boolean(openTimeoutDlg) ? (
              <Snackbar
                open={openTimeoutDlg}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <Alert
                  severity="warning"
                  sx={{
                    fontWeight: "500",
                    fontSize: "0.9rem",
                    minWidth: "320px",
                  }}
                >
                  <Typography
                    key={blinker}
                    sx={{
                      animation: "blink 1s step-start infinite",
                      "@keyframes blink": { "50%": { opacity: 0.3 } },
                    }}
                  >
                    {countdownMessage}
                  </Typography>
                </Alert>
              </Snackbar>
            ) : null}
          </Content>
        </div>
      </AuthContextProvider>
      {sessionStorage.getItem("encReqDecFlag") === "Y" ? (
        <ReqDecryptFormMain />
      ) : null}
      {props?.shouldEnableWebSocket &&
        authState?.user?.id &&
        authState?.user?.allowChat === "Y" && <Chat />}

      {props?.dialogsState?.isAcctMstOpen ? (
        <Dialog
          open={props?.dialogsState?.isAcctMstOpen}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              props?.handleDialogClose();
            }
          }}
        >
          <AcctMSTProvider>
            <AcctModal
              onClose={props?.handleDialogClose}
              asDialog={false}
              rowData={props?.dialogsState?.acctData}
              formmodeState="view"
              fromState="pending-entry"
            />
          </AcctMSTProvider>
        </Dialog>
      ) : null}
      {props?.dialogsState?.isPhotoSignOpen ? (
        <PhotoSignWithHistory
          data={acctData}
          onClose={props.handleDialogClose}
          screenRef={acctData?.SCREEN_REF}
        />
      ) : null}
      {props?.dialogsState?.isAcctDtlOpen ? (
        <Dialog
          className="AcctTab"
          open={props?.dialogsState?.isAcctDtlOpen}
          PaperComponent={PaperComponent}
          id="draggable-dialog-title"
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              props?.handleDialogClose();
              localStorage.removeItem("commonClass");
            }
          }}
        >
          <div id="draggable-dialog-title" style={{ cursor: "move" }}>
            {getTabDetails?.isLoading || getAccountDetails?.isLoading ? (
              <LoaderPaperComponent />
            ) : (
              <DailyTransTabs
                //@ts-ignore
                heading={headingWithButton}
                tabsData={getTabDetails?.data}
                cardsData={getAccountDetails.data}
                reqData={acctData}
                hideCust360Btn={false}
                occupiedHeight={{ min: "327px", max: "327px" }}
                screenFlag="ACCTINQ"
              />
            )}
          </div>
        </Dialog>
      ) : null}
      {props?.dialogsState?.isSearchAcctOpen ? (
        <SearchAcctGridMain
          open={props?.dialogsState?.isSearchAcctOpen}
          close={props.handleDialogClose}
          reqPara={acctData}
        />
      ) : null}
      {props?.dialogsState?.isJointDtlOpen ? (
        <>
          <Dialog
            open={props?.dialogsState?.isJointDtlOpen}
            PaperComponent={PaperComponent}
            id="draggable-dialog-title"
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
            maxWidth="xl"
            onKeyUp={(event) => {
              if (event.key === "Escape") {
                props?.handleDialogClose();
              }
            }}
          >
            <div id="draggable-dialog-title" style={{ cursor: "move" }}></div>
            <JointDetails
              hideHeader={false}
              reqData={{
                ...acctData,
                BTN_FLAG: "Y",
                custHeader: true,
              }}
              height={"350px"}
              closeDialog={props?.handleDialogClose}
            />
          </Dialog>
        </>
      ) : null}
    </Fragment>
  );
};

const RedirectComponent = ({ isValidURL }) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/EnfinityCore") {
      navigate("/EnfinityCore/dashboard");
      // } else if (!isValidURL) {
      //   navigate("/error");
    } else {
      navigate(location.pathname);
    }
  }, [navigate, location.pathname]);
  return null;
};

interface AcctEnqwrapperProps {
  open: boolean;
  setAcctInq: React.Dispatch<React.SetStateAction<boolean>>;
  isHideIcon?: boolean;
}

const AcctEnqwrapper: React.FC<AcctEnqwrapperProps> = memo<any>(
  ({ open, setAcctInq, isHideIcon = false }) => {
    const above1300 = useMediaQuery("(min-width:1300px)");

    return (
      <>
        {!isHideIcon && (
          <Tooltip title={t("AccountInquiry")} placement="bottom" arrow>
            <IconButton
              // renderIcon="PersonSearchOutlined"
              onClick={() => setAcctInq(true)}
              sx={{
                backgroundColor: "rgba(235, 237, 238, 0.45)",
                borderRadius: "10px",
                height: "36px",
                width: !above1300 ? "100%" : "auto",
                padding: "0 8px",
                "&:hover": {
                  background: "var(--theme-color2)",
                  boxShadow:
                    "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                  transition: "all 0.2s ease",
                },
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <PersonSearchOutlinedIcon
                fontSize="small"
                sx={{
                  color: "var(--theme-color3)",
                }}
              />
              {!above1300 && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "var(--theme-color3)",
                  }}
                >
                  {t("AccountInquiry")}
                </Typography>
              )}
            </IconButton>
          </Tooltip>
        )}
        {open && (
          <Dialog
            open={open}
            onClose={() => setAcctInq(false)}
            fullWidth={true}
            PaperProps={{
              style: {
                maxWidth: "90%",
                maxHeight: "100%",
              },
            }}
            maxWidth="xl"
          >
            <Accountinquiry open={open} onClose={() => setAcctInq(false)} />
          </Dialog>
        )}
      </>
    );
  }
);
