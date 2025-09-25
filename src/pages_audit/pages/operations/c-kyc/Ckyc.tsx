import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Tab,
  AppBar,
  Toolbar,
  Dialog,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { Tabs, utilFunction } from "@acuteinfo/common-base";
import FormModal from "./formModal/formModal";
// import {Tabs} from '../../../../components/styledComponent/tabs';
// import {Tab} from '../../../../components/styledComponent/tab';
import CorporateFareIcon from "@mui/icons-material/CorporateFare"; // legal-entity-icon
import PersonIcon from "@mui/icons-material/Person"; // individual-person-icon
import { useTranslation } from "react-i18next";
import { CkycContext } from "./CkycContext";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PendingCustomer from "./PendingCustomer";
import RetrieveCustomer from "./RetrieveCustomer";
import { GradientButton } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import ClonedCkycProvider, {
  ClonedCkycContext,
} from "./formModal/formDetails/formComponents/legalComps/ClonedCkycContext";
import { PaperComponent } from "../DailyTransaction/TRN001/components";
export const CustomTabs: any = styled(Tabs)(({ orientation, theme }) => ({
  border: "unset !important",
  boxShadow: "unset !important",
  background: "unset !important",
  "& .MuiTabs-flexContainer .MuiButtonBase-root": {
    textTransform: "capitalize",
  },
  "& .MuiTabs-root .MuiTabs-scroller": {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
  },
  "& .MuiTabs-scroller .MuiTabs-indicator": {
    backgroundColor: "var(--theme-color1)",
    left: 0,
    display: orientation == "vertical" && "none",
  },
  // "&.MuiTabs-root.MuiTabs-vertical .MuiTabs-scroller .MuiTabs-indicator": {
  //   right: "auto !important",
  // },
  "& .MuiButtonBase-root.Mui-selected": {
    color: "var(--theme-color1)",
    "& .toggle_icon_container": {
      color: "#fff",
    },
  },
  "& .MuiButtonBase-root.MuiTab-root:not(.Mui-selected):hover": {
    color: "var(--theme-color3)",
    "& .toggle_icon_container": {
      color: "#fff",
    },
  },
  "& .MuiTabs-flexContainerVertical": {
    [theme.breakpoints.up("sm")]: {
      // padding: "10px"
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  "& .MuiTabs-flexContainerVertical .MuiButtonBase-root.MuiTab-root:hover": {
    border: `1.4px solid var(--theme-color1)`,
  },
  "& .MuiTabs-flexContainerVertical .MuiButtonBase-root.MuiTab-root": {
    border: `1.4px solid ${theme.palette.grey[600]}`,
    borderRadius: "10px",
    marginBottom: "10px",
    padding: "6px 16px",
    "&.tab-error": {
      border: `1.4px solid var(--red-tab-error)`,
      "&.Mui-selected": {
        border: `1.4px solid var(--red-tab-error)`,
        boxShadow: theme.shadows[4],
        "& .toggle_icon_container": {
          backgroundColor: "var(--red-tab-error)",
        },
      },
      "& .toggle_icon_container": {
        backgroundColor: "var(--red-lighter-tab-error)",
        color: "#fff",
      },
      "& .toggle_text_container": {
        color: "var(--red-tab-error)",
      },
    },
    "&.tab-error:hover": {
      "& .toggle_icon_container": {
        backgroundColor: "var(--red-tab-error)",
      },
    },
    "&.tab-modified": {
      border: `1.4px solid var(--green-tab-success)`,
      "&.Mui-selected": {
        border: `1.4px solid var(--green-tab-success)`,
        boxShadow: theme.shadows[4],
        "& .toggle_icon_container": {
          backgroundColor: "var(--green-tab-success)",
        },
      },
      "& .toggle_icon_container": {
        backgroundColor: "var(--green-lighter-tab-success)",
        color: "#fff",
      },
      "& .toggle_text_container": {
        color: "var(--green-tab-success)",
      },
    },
    "&.tab-modified:hover": {
      "& .toggle_icon_container": {
        backgroundColor: "var(--green-tab-success)",
      },
    },
  },
  "& .MuiTabs-flexContainerVertical .MuiButtonBase-root.MuiTab-root.Mui-selected":
    {
      border: `1.4px solid var(--theme-color1)`,
      boxShadow: theme.shadows[4],
      // borderRadius: "10px",
      // marginBottom: "10px"
    },
  "& .MuiButtonBase-root.MuiTab-root .toggle_icon_container": {
    backgroundColor: theme.palette.grey[400],

    minHeight: "40px",
    height: "40px",
    minWidth: "40px",
    width: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "5px",
    [theme.breakpoints.only("md")]: {
      minHeight: "30px",
      height: "30px",
      minWidth: "30px",
      width: "30px",
    },
  },
  "& .MuiButtonBase-root.MuiTab-root .toggle_icon_container .MuiSvgIcon-root": {
    [theme.breakpoints.only("md")]: {
      fontSize: "1.25rem",
    },
  },
  "& .MuiButtonBase-root.MuiTab-root:hover .toggle_icon_container": {
    // backgroundColor: "#07288e3b",
    backgroundColor: "var(--theme-color3)",
    transition: "background-color 0.5s ease-in-out",
  },
  "& .MuiButtonBase-root.MuiTab-root.Mui-selected .toggle_icon_container": {
    // backgroundColor: "#07288e82",
    backgroundColor: "var(--theme-color1)",
    // animation: `boxanima 1000ms ${theme.transitions.easing.easeInOut}`,
    // animationIterationCount: "infinite",
    // animationDirection: "alternate",
    // animationDelay: "5s",
    "& .MuiSvgIcon-root": {
      // animation: `anima 500ms ${theme.transitions.easing.easeInOut}`,
      // animationIterationCount: "infinite",
      // animationDirection: "alternate",
    },
    "@keyframes anima": {
      "0%": {
        fontSize: "1.2rem",
      },
      "100%": {
        fontSize: "1.8rem",
      },
    },
    "@keyframes boxanima": {
      "0%": {
        transform: "rotateY(5deg) rotateX(10deg)",
      },
      "100%": {
        transform: "rotateY(5deg) rotateX(360deg)",
        // borderRadius: "50%"
      },
    },
  },
  "& .MuiButtonBase-root.MuiTab-root .toggle_text_container": {
    paddingLeft: theme.spacing(1),
    textAlign: "left",
  },
}));

const StyledHeaderGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  // marginBottom: theme.spacing(1),
  backgroundColor: "var(--theme-color2)",
  paddingTop: "5px",
  paddingBottom: "5px",
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    position: "sticky",
    top: "56px",
    height: { xs: "100px", md: "50px" },
    paddingTop: "2px",
    zIndex: "999",
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {/* <Typography> */}
          {children}
          {/* </Typography> */}
        </Box>
      )}
    </div>
  );
}

export const Ckyc = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);
  const { authState } = useContext(AuthContext);
  const routeLocation = useLocation();
  const path = routeLocation.pathname;
  const shouldHideMainUI =
    path.includes("new-entry") || path.includes("view-detail");
  const [openCkycModal, setOpenCkycModal] = useState({
    isCkycModalOpen: false,
    ckycData: {},
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      setOpenCkycModal({
        isCkycModalOpen: true,
        ckycData: {
          ...event.detail.value,
          CUSTOMER_ID:
            event.detail.value?.REF_CUST_ID || event.detail.value?.CUSTOMER_ID,
          CUSTOMER_TYPE: event.detail.value?.REF_CUSTOMER_TYPE || "I",
        },
      });
    };

    window.addEventListener(
      "my-global-event",
      handleCustomEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "my-global-event",
        handleCustomEvent as EventListener
      );
    };
  }, []);

  return (
    <React.Fragment>
      {!shouldHideMainUI && (
        <>
          <AppBar
            position="static"
            className="PRINT_DTL"
            sx={{
              background: "var(--theme-color5)",
              margin: "2px",
              width: "auto",
              marginBottom: "10px",
            }}
          >
            <Toolbar
              sx={{
                paddingLeft: "24px",
                paddingRight: "24px",
                minHeight: "48px !important",
              }}
            >
              <Typography
                style={{ flexGrow: 1 }}
                sx={{
                  color: "var(--theme-color2)",
                  fontSize: "1.25rem",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  fontWeight: 500,
                  lineHeight: "1.6px",
                  letterSpacing: "0.0075em",
                }}
              >
                {utilFunction.getDynamicLabel(
                  routeLocation.pathname,
                  authState?.menulistdata,
                  true
                )}
              </Typography>
            </Toolbar>
          </AppBar>
          <StyledHeaderGrid
            container
            columnGap={(theme) => theme.spacing(2)}
            rowGap={(theme) => theme.spacing(2)}
          >
            <Grid item xs="auto">
              <CustomTabs
                textColor="secondary"
                value={tabValue}
                onChange={handleTabChange}
                aria-label="ant example"
              >
                {/* <Tab label="Add New" /> */}
                <Tab label={t("Retrieve")} />
                <Tab label={t("Pending")} />
              </CustomTabs>
            </Grid>
            {/* <Grid item xs={12} sm={12} md>
          <Typography variant="h6" gutterBottom={true}>C-KYC Individual/Legal Entry</Typography>
        </Grid> */}
            <Grid container item xs="auto" columnGap={1}>
              <Tooltip title={t("IndividualCustTooltip")}>
                <GradientButton
                  onClick={() => {
                    // handleFormModalOpenctx("I")
                    navigate("new-entry", {
                      state: {
                        entityType: "I",
                        isFreshEntry: true,
                      },
                    });
                  }}
                  sx={{
                    // height: "40px", width: "40px", minWidth:"40px", borderRadius: "50%",
                    height: "30px",
                    minWidth: "30px !important",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "5px",
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "1.5rem", md: "1.2rem" },
                    },
                  }}
                >
                  <PersonIcon
                    fontSize="medium"
                    sx={{ color: "var(--theme-color2)" }}
                  />
                </GradientButton>
              </Tooltip>
              <Tooltip title={t("LegalCustTooltip")}>
                <GradientButton
                  onClick={() => {
                    // handleFormModalOpenctx("C")
                    navigate("new-entry", {
                      state: {
                        entityType: "C",
                        isFreshEntry: true,
                      },
                    });
                  }}
                  sx={{
                    // height: "40px", width: "40px", minWidth:"40px", borderRadius: "50%",
                    height: "30px",
                    minWidth: "30px !important",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "5px",
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: "1.5rem", md: "1.2rem" },
                    },
                  }}
                >
                  <CorporateFareIcon
                    fontSize="medium"
                    sx={{ color: "var(--theme-color2)" }}
                  />
                </GradientButton>
              </Tooltip>
            </Grid>
          </StyledHeaderGrid>
        </>
      )}
      {!path.includes("new-entry") && (
        <>
          <TabPanel value={tabValue} index={0}>
            <RetrieveCustomer isModal={openCkycModal.isCkycModalOpen} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <PendingCustomer isModal={openCkycModal.isCkycModalOpen} />
          </TabPanel>
        </>
      )}
      <Routes>
        <Route
          path="new-entry/*"
          element={
            <FormModal
              onClose={() => navigate(".")}
              formmode={"new"}
              from={"new-entry"}
            />
          }
        />
      </Routes>
      {openCkycModal?.isCkycModalOpen && (
        <ClonedCkycProvider>
          <Dialog
            open={openCkycModal?.isCkycModalOpen}
            PaperComponent={PaperComponent}
            id="draggable-dialog-title"
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
            maxWidth="xl"
          >
            <FormModal
              key={`ckycFormModal-Dialog`}
              onClose={() => {
                setOpenCkycModal((prev) => ({
                  ...prev,
                  isCkycModalOpen: false,
                  ckycData: {},
                }));
              }}
              formmode={"view"}
              from={"pending-entry"}
              rowData={openCkycModal.ckycData}
              isModal={true}
            />
          </Dialog>
        </ClonedCkycProvider>
      )}
    </React.Fragment>
  );
};
