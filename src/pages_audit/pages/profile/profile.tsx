import { AuthContext } from "pages_audit/auth";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import * as API from "./api";
import {
  AppBar,
  Avatar,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { ChangePassword } from "./changePassword";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import "./style.css";
import { ProfilePhotoUpdate } from "./profilePhotoUpload";
import Box from "@mui/material/Box";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import SettingsAccessibilityOutlinedIcon from "@mui/icons-material/SettingsAccessibilityOutlined";
import { useNavigate } from "react-router-dom";
import USER_PROFILE_DEFAULT from "assets/images/USER_PROFILE_DEFAULT.png";
import About from "./about";
import { useTranslation } from "react-i18next";
import { PersonalizeDash } from "./personalizeDash";
import { AllowedAccess } from "./allowedAccess";
import { UserDetail } from "./userDetail";
import DynamicTheme from "app/audit/dynamictheme";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import {
  Alert,
  utilFunction,
  MetaDataType,
  FormWrapper,
  GradientButton,
} from "@acuteinfo/common-base";
import { UserProfileMetaData } from "./Metadata/userProfile";

export const Profile = () => {
  const authController = useContext(AuthContext);
  const userID = authController.authState?.user?.id;
  const urlObj = useRef<any>(null);
  const fileUploadControl = useRef<any | null>(null);
  const [profileUpdate, setProfileUpdate] = useState(false);
  const [filesdata, setFilesData] = useState<any>([]);
  const [ProfilePictureURL, setProfilePictureURL] = useState<any | null>(null);
  const [value, setValue] = useState("tab1");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/EnfinityCore/dashboard");
  };
  const queryData: any = useMutation("GETEMPLOYEEDTL", () =>
    API.getUserDetails({ userID })
  );
  useEffect(() => {
    queryData.mutate();
  }, []);

  // useEffect(() => {
  //   // GeneralAPI.setDocumentName("Profile");
  //   return () => {
  //     queryClient.removeQueries(["GETEMPLOYEEDTL"]);
  //   };
  // }, []);

  useEffect(() => {
    if (Boolean(queryData.data?.PROFILE_PHOTO)) {
      let blob = utilFunction.base64toBlob(queryData.data?.PROFILE_PHOTO);
      urlObj.current =
        typeof blob === "object" && Boolean(blob)
          ? URL.createObjectURL(blob)
          : "";
      setProfilePictureURL(urlObj.current);
      authController?.setProfileImage(urlObj.current);
    }
  }, [queryData.data]);

  const handleProfileUploadClose = (flag, imgdata) => {
    if (
      Boolean(flag) &&
      flag === "Y" &&
      typeof imgdata === "object" &&
      Boolean(imgdata)
    ) {
      urlObj.current =
        typeof imgdata === "object" && Boolean(imgdata)
          ? URL.createObjectURL(imgdata)
          : "";
      setProfilePictureURL(urlObj.current);
      authController?.setProfileImage(urlObj.current);
    }
    setProfileUpdate(false);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    const filesArray = Array.from(files);
    if (filesArray.length > 0) {
      setFilesData(filesArray);
      setProfileUpdate(true);
    }
  };

  return (
    <Fragment>
      {
        <>
          <Grid
            key={"mainGrid"}
            container
            spacing={0}
            px={4}
            direction="column"
            style={{
              background: "rgba(250, 251, 255, 0.9)",
              display: "block",
            }}
          >
            <Container
              sx={{
                background: "white",
                borderRadius: "10px",
                p: "15px",
                boxShadow:
                  "rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;",
              }}
            >
              <Grid>
                <Box>
                  <Grid container sx={{ minHeight: "200px" }}>
                    <Grid
                      item
                      xs={2}
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <div
                        style={{
                          width: "190px",
                          height: "180px",
                          margin: "10px auto",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          // top: "-50%",
                        }}
                      >
                        <div className="image-data">
                          <Avatar
                            variant="rounded"
                            key={"ProfilePicture"}
                            alt="User"
                            src={
                              Boolean(ProfilePictureURL)
                                ? ProfilePictureURL
                                : USER_PROFILE_DEFAULT
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          ></Avatar>
                        </div>
                        <div
                          className="image-upload-icon"
                          onClick={() => fileUploadControl?.current?.click()}
                        >
                          <IconButton>
                            <AddAPhotoIcon htmlColor="white" />
                          </IconButton>
                          <Typography
                            component={"span"}
                            style={{
                              margin: "0",
                              color: "white",
                              lineHeight: "1.5",
                              fontSize: "0.75rem",
                              fontFamily: "Public Sans,sans-serif",
                              fontWeight: "400",
                            }}
                          >
                            {t("profileUpdatePhoto")}
                          </Typography>
                          <input
                            name="fileselect"
                            type="file"
                            style={{ display: "none" }}
                            ref={fileUploadControl}
                            onChange={handleFileSelect}
                            accept=".png,.jpg,.jpeg"
                            onClick={(e) => {
                              //to clear the file uploaded state to reupload the same file (AKA allow our handler to handle duplicate file)
                              //@ts-ignore
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs={10}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <Grid>
                        <AppBar
                          position="static"
                          sx={{
                            background: "#FFFFFF",
                            borderRadius: "10px",
                            margin: "10px",
                            width: "auto",
                          }}
                        >
                          <Toolbar style={{ minHeight: "48px" }}>
                            <Typography
                              variant="h5"
                              noWrap
                              component="div"
                              sx={{
                                display: { xs: "none", sm: "block" },
                                fontWeight: 500,
                              }}
                            >
                              {/* My Profile */}
                              {t("profileMyProfile")}
                            </Typography>

                            <Box sx={{ flexGrow: 1 }}></Box>
                            <Box sx={{ display: { xs: "none", md: "flex" } }}>
                              <GradientButton
                                onClick={handleNavigate}
                                endicon="CancelOutlined"
                                // rotateIcon="scale(1.4) rotateY(360deg)"
                                sx={{
                                  margin: "0 0  0 15px",
                                  "&:hover": {
                                    backgroundColor: "var(--theme-color3)",
                                    "& .MuiSvgIcon-root": {
                                      transform: "scale(1.4) rotateY(360deg)",
                                      transition: "transform 2s ease-in-out",
                                    },
                                  },
                                }}
                              >
                                {t("Close")}
                              </GradientButton>
                            </Box>
                          </Toolbar>
                        </AppBar>
                      </Grid>
                      <Grid container alignItems={"center"} height={"50px"}>
                        <Grid item xs={3} pl={3}>
                          <Typography
                            variant="h5"
                            fontWeight={500}
                            display={"inline"}
                            sx={{
                              textTransform: "capitalize",
                            }}
                          >
                            {queryData?.data?.USERNAME} -{" "}
                          </Typography>
                          <Typography display={"inline"}>
                            {queryData?.data?.USER_LEVEL}
                          </Typography>
                        </Grid>
                        <Grid item xs={9} style={{ marginTop: "10px" }}>
                          <About />
                          <Grid style={{ marginTop: "-40px" }}>
                            <DynamicTheme />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Box sx={{ width: "100%", marginTop: "auto" }}>
                        <Tabs
                          className="tabs"
                          value={value}
                          onChange={(event, newValue) => {
                            setValue(newValue);
                            if (newValue === "tab1") {
                              queryData.mutate();
                            }
                          }}
                          textColor="secondary"
                          indicatorColor="secondary"
                          aria-label="secondary tabs example"
                          variant="scrollable"
                          scrollButtons="auto"
                        >
                          <Tab
                            value="tab1"
                            label={t("profileUserProfile")}
                            icon={<AccountCircleOutlinedIcon />}
                            iconPosition="start"
                          />
                          <Tab
                            value="tab2"
                            label={t("profileActivityDetails")}
                            icon={<ArticleOutlinedIcon />}
                            iconPosition="start"
                          />
                          <Tab
                            value="tab3"
                            label={t("profileAllowedAccess")}
                            icon={<HowToRegOutlinedIcon />}
                            iconPosition="start"
                          />

                          <Tab
                            value="tab4"
                            label={t("profileChangePassword")}
                            icon={<LockResetOutlinedIcon />}
                            iconPosition="start"
                          />
                          <Tab
                            value="tab5"
                            label={t("profilePersonalizedashboard")}
                            icon={<SettingsAccessibilityOutlinedIcon />}
                            iconPosition="start"
                          />
                        </Tabs>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Container>
                      <Grid
                        sx={{
                          overflow: "scroll",
                          height: "calc(100vh - 335px)",
                          backgroundColor: "var(--theme-color2)",
                          padding: "0px",
                          borderRadius: "10px",
                          boxShadow:
                            "rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;",
                        }}
                      >
                        {value === "tab1" ? (
                          <>
                            {queryData?.isLoading ? (
                              <LinearProgress color="secondary" />
                            ) : queryData?.isError ? (
                              <Alert
                                severity="error"
                                errorMsg={
                                  queryData.error?.error_msg ??
                                  "Unknown Error occured"
                                }
                                errorDetail={
                                  queryData.error?.error_detail ?? ""
                                }
                              />
                            ) : (
                              <LinearProgressBarSpacer />
                            )}
                            <FormWrapper
                              key={"user-Login" + queryData.isSuccess}
                              metaData={UserProfileMetaData as MetaDataType}
                              initialValues={queryData.data}
                              onSubmitHandler={() => {}}
                              displayMode={"view"}
                              hideDisplayModeInTitle={true}
                              formStyle={{}}
                              hideHeader={true}
                            />
                          </>
                        ) : value === "tab2" ? (
                          <UserDetail />
                        ) : value === "tab4" ? (
                          <ChangePassword />
                        ) : value === "tab3" ? (
                          <AllowedAccess />
                        ) : value === "tab5" ? (
                          <PersonalizeDash />
                        ) : null}
                      </Grid>
                    </Container>

                    {profileUpdate && filesdata.length > 0 ? (
                      <ProfilePhotoUpdate
                        open={profileUpdate}
                        onClose={handleProfileUploadClose}
                        files={filesdata}
                        userID={userID}
                      />
                    ) : null}
                  </Grid>
                </Box>
              </Grid>
            </Container>
          </Grid>
        </>
      }
    </Fragment>
  );
};
