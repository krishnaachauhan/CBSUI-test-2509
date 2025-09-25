import {
  ClearCacheProvider,
  GradientButton,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { Fragment } from "react/jsx-runtime";
import { useContext, useEffect, useRef, useState } from "react";
import { ResponseParametersFormWrapper } from "./responseParaForm";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { useMutation } from "react-query";
import * as API from "./api";
import i18n from "components/multiLanguage/languagesConfiguration";
import {
  AppBar,
  Chip,
  CircularProgress,
  Dialog,
  Grid,
  Paper,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { makeStyles } from "@mui/styles";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";
import WebCamImage from "./WebCamImage";
import { useLocation } from "react-router-dom";
import { Tabs } from "components/tabs";
import { Tab } from "components/tab";
import DailyTransTabs from "../DailyTransaction/TRNHeaderTabs";
import UploadImageDialogue from "../positivePayEntry/form/uploadImage";
import { PreviewScan, useScan } from "components/common/custom/scan/useScan";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.2rem",
  },
  refreshiconhover: {},
  paper: {
    padding: theme.spacing(1),
    height: "100%",
    borderRadius: "10px",
  },
  tableCell: {
    padding: theme.spacing(0.5),
  },
  boldText: {
    fontWeight: 800,
    color: "var(--theme-color3) !important",
    fontSize: "13px",
  },
  tableRow: {
    "&:last-child td, &:last-child th": { border: 0 },
  },
  printHidden: {
    "@media print": {
      display: "none !important",
    },
  },

  tableContainer: {
    flex: "0 0 25%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 8px",
    height: "90%",
    padding: "0 10px",
    "@media (max-width: 1024px)": {
      flex: "0 0 auto",
      width: "100%",
      margin: "8px 0",
      height: "300px",
    },
  },

  imgSecPaper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
    height: "100%",
    padding: "0 10px 10px 10px",
    "@media (max-width: 1024px)": {
      flex: "0 0 auto",
      width: "100%",
      margin: "8px 0",
      height: "370px",
    },
  },

  imgContainer: {
    flex: "1 1 90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    background: "var(--theme-color4)",
    "@media (max-width: 1024px)": {
      height: "100%",
    },
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "zoom-in",
  },

  imgLabel: {
    textAlign: "center",
    flex: "0 0 10%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  contentContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "97%",
    height: "250px",
    flexDirection: "row",
    "@media (max-width: 1024px)": {
      flexDirection: "column",
      height: "auto",
    },
  },

  rowNumberBox: {
    border: "2px solid var(--theme-color3)",
    height: "20px",
    width: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "8px",
  },
}));
const CardScaningEntry = () => {
  const [formMode, setFormMode] = useState("view");
  const [open, setOpen] = useState(true);
  const [data, setData] = useState<any>(null);
  const [accountDetails, setAccountDetails] = useState<any>([]);
  const { authState } = useContext(AuthContext);
  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");
  const headerClasses = useTypeStyles();
  const { MessageBox } = usePopupContext();
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);
  const [signatureSize, setSignatureSize] = useState<any>(null);
  const [openWebCam, setOpenWebCam] = useState<any>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedSign, setCapturedSign] = useState<string | null>(null);
  const retrievalParaRef = useRef<any>(null);
  const [importData, setImportData] = useState(false);
  const [photoSizeKB, setPhotoSizeKB] = useState<any>(null);

  const [tabValue, setTabValue] = useState("P");

  const capturedPhotoRef = useRef<any>(null);
  const ImportedPhotoRef = useRef<any>(null);
  const ImportedSignRef = useRef<any>(null);
  const ScannedSignRef = useRef<any>(null);
  const ScannedPhotoRef = useRef<any>(null);
  const [impotedPhoto, setImportPhoto] = useState<any | null>(null);
  const [impotedSign, setImportSign] = useState<any | null>(null);
  const { previewScan, handleScan, setPreviewScan, thumbnails } = useScan();
  const [scanImage, setScanImage] = useState<any>(null);
  const [scannedSign, setScannedSign] = useState<any>(null);
  const [scannedPhoto, setScannedPhoto] = useState<any>(null);
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const [dataClass, setDataClass] = useState("");
  useEffect(() => {
    if (
      ImportedPhotoRef.current === null ||
      (ImportedSignRef.current === null && capturedPhotoRef.current === null)
    ) {
      if (tabValue === "S" && ScannedPhotoRef.current === null) {
        setScannedSign(scanImage);
        ScannedSignRef.current = scanImage;
      } else {
        setScannedPhoto(scanImage);
        ScannedPhotoRef.current = scanImage;
      }
    }
  }, [scanImage]);
  useEffect(() => {
    if (open) {
      trackDialogClass("Retrieve");
    }
    if (importData) {
      trackDialogClass("MuiButton-colorSecondary");
    }
    return () => {
      trackDialogClass("main");
    };
  }, [open]);

  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleSavePhoto = (image: string) => {
    const base64Image = image.split(",")[1];
    if (tabValue === "P") {
      capturedPhotoRef.current = base64Image;
      setCapturedPhoto(base64Image);
    } else {
      ImportedSignRef.current = base64Image;
    }
  };
  const newEntry = () => {
    ImportedSignRef.current = null;
    capturedPhotoRef.current = null;
    ImportedPhotoRef.current = null;
    ScannedPhotoRef.current = null;
    ScannedSignRef.current = null;
    setImportPhoto(null);
    setImportSign(null);
    setCapturedPhoto(null);
    setAccountDetails(null);
    setFormMode("view");
    setData(null);
    setOpen(true);
    setSignatureSize(null);
    setPhotoSizeKB(null);
    setScanImage(null);
    setScannedSign(null);
  };
  const SaveDataMutation = useMutation(API.saveAccountPhotoDtl, {
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      newEntry();
    },
    onSuccess: (data) => {
      MessageBox({
        messageTitle: t("Success"),
        message: t("Success"),
        icon: "SUCCESS",
      });
      newEntry();
    },
  });

  const selectedDatas = (photoSignData, acctData, reqPara) => {
    setData(photoSignData);
    setAccountDetails([acctData, reqPara]);
    // setOpen(false);
    if (photoSignData) retrievalParaRef.current = photoSignData;
  };

  const renderImageSection = (item, label, imageKey, altText) => (
    <Paper className={headerClasses.imgSecPaper}>
      <Box className={headerClasses.imgContainer}>
        {item[imageKey] ? (
          <Tooltip
            title={t("ToZoomInOnTheImagesClickOnItOnce")}
            placement="top"
            arrow
          >
            <Box
              component="img"
              src={URL.createObjectURL(
                utilFunction.base64toBlob(item[imageKey])
              )}
              alt={altText}
              className={headerClasses.img}
              onClick={() => {
                setSelectedImageUrl(
                  URL.createObjectURL(utilFunction.base64toBlob(item[imageKey]))
                );
                setIsImagePhotoOpen(true);
              }}
            />
          </Tooltip>
        ) : (
          <Typography
            variant="h6"
            width="200px"
            fontSize="26px"
            margin="25px"
            sx={{ textAlign: "center" }}
          >
            {tabValue === "P"
              ? "Photo Not Available"
              : "Signature Not Available"}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  let Sign =
    ImportedSignRef.current !== null
      ? ImportedSignRef.current
      : ScannedSignRef.current !== null
      ? ScannedSignRef?.current
      : data && data[0]?.ACCT_SIGN;

  const Base64Photo = async (data) => {
    try {
      const base64Photo = await utilFunction.convertBlobToBase64(data);
      return base64Photo[1];
    } catch (error) {}
  };

  useEffect(() => {
    const calculatePhotoSize = async () => {
      let finalPhoto = "";
      let signatureSize: any;
      // Check which photo reference to use
      if (capturedPhotoRef.current) {
        finalPhoto = capturedPhotoRef.current;
      }
      if (ImportedPhotoRef.current) {
        finalPhoto = await Base64Photo(ImportedPhotoRef.current);
      }
      if (ScannedPhotoRef.current) {
        finalPhoto = ScannedPhotoRef?.current;
      } else {
        finalPhoto = (data && data[0]?.ACCT_PHOTO) ?? "";
      }

      if (finalPhoto) {
        const kb = Math.ceil((finalPhoto.length * 3) / 4 / 1024);
        setPhotoSizeKB(kb);
        console.log(kb, "kb");
      }

      if (Sign) {
        const base64Sign = ScannedSignRef?.current
          ? ScannedSignRef?.current
          : await Base64Photo(Sign);
        if (base64Sign) {
          signatureSize = Math.ceil((base64Sign.length * 3) / 4 / 1024);
          setSignatureSize(signatureSize);
          console.log(signatureSize, "signatureSize");
        } else {
          console.log("Error: Unable to generate base64 from Sign");
        }
      }
    };

    calculatePhotoSize();
  }, [
    capturedPhotoRef.current,
    ImportedPhotoRef.current,
    data,
    Sign,
    ImportedSignRef.current,
  ]);

  return (
    <Fragment>
      <AppBar
        position="static"
        sx={{ top: "50px", width: "100%" }}
        color="secondary"
      >
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {utilFunction.getDynamicLabel(
              useLocation().pathname,
              authState?.menulistdata,
              true
            )}
            <Chip
              style={{ color: "white", marginLeft: "8px" }}
              variant="outlined"
              color="primary"
              size="small"
              label={`${formMode} mode`}
            />
          </Typography>
          <GradientButton
            endIcon={
              SaveDataMutation?.isLoading ? (
                <CircularProgress size={20} />
              ) : null
            }
            onClick={async () => {
              setFormMode("edit");
              if (formMode === "edit") {
                let AcctSign = ScannedSignRef.current
                  ? ScannedSignRef.current
                  : await Base64Photo(Sign);
                let finalPhoto;
                if (capturedPhotoRef.current) {
                  finalPhoto = capturedPhotoRef.current;
                } else if (ImportedPhotoRef.current) {
                  finalPhoto = await Base64Photo(ImportedPhotoRef.current);
                } else if (ScannedPhotoRef?.current) {
                  finalPhoto = ScannedPhotoRef.current;
                } else {
                  finalPhoto = (data && data[0]?.ACCT_PHOTO) ?? "";
                }
                const kb = Math.ceil(
                  (finalPhoto && finalPhoto.length * 3) / 4 / 1024
                );

                const btnName = await MessageBox({
                  message: "AreYouSaveThisRecord",
                  messageTitle: "Confirmation",
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                  loadingBtnName: ["Yes"],
                });
                if (btnName === "Yes") {
                  SaveDataMutation?.mutate({
                    BRANCH_CD: authState?.user?.branchCode,
                    COMP_CD: authState?.companyID,
                    ACCT_TYPE: accountDetails[1]?.ACCT_TYPE,
                    ACCT_PHOTO: finalPhoto,
                    ACCT_SIGN: AcctSign ?? data[0]?.ACCT_SIGN,
                    ACCT_CD: accountDetails[1]?.ACCT_CD,
                  });
                }
              }
            }}
            color={"primary"}
          >
            {formMode === "view" ? "Edit" : "Save"}
          </GradientButton>

          <GradientButton
            onClick={async () => {
              newEntry();
            }}
            color={"primary"}
          >
            {t("Retrieve")}
          </GradientButton>
        </Toolbar>
      </AppBar>
      <DailyTransTabs
        //@ts-ignore
        heading={""}
        tabsData={[]}
        cardsData={accountDetails ? accountDetails[0] : []}
        reqData={[]}
        hideCust360Btn={true}
        occupiedHeight={{ min: "650px", max: "650px" }}
        screenFlag="CARDSCANING"
      />
      <Tabs
        value={tabValue}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        variant="scrollable"
      >
        <Tab tabIndex={0} label={t("Photo")} value="P" />
        {/* signature tab temporary comment as per discussed with Aditya sir */}
        {/* <Tab tabIndex={0} label={t("Signature")} value="S" /> */}
      </Tabs>
      <Dialog
        open={isImgPhotoOpen}
        onClose={() => setIsImagePhotoOpen(false)}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "hidden",
          },
        }}
        maxWidth="lg"
      >
        <CanvasImageViewer
          imageUrl={selectedImageUrl}
          headerContent={`
            A/c Number : ${accountDetails && accountDetails[1]?.COMP_CD}${
            accountDetails && accountDetails[1]?.BRANCH_CD.trim()
          }${accountDetails && accountDetails[1]?.ACCT_TYPE.trim()}${
            accountDetails && accountDetails[1]?.ACCT_CD
          } Name :${accountDetails && accountDetails[1]?.ACCT_NM}
            `}
          isOpen={isImgPhotoOpen}
          onClose={() => setIsImagePhotoOpen(false)}
          printContent={
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                margin: "20px 10px 10px 10px",
                "@media screen": {
                  display: "none !important",
                },
                "@media print": {
                  display: "block !important",
                },
              }}
            ></Typography>
          }
        />
      </Dialog>

      <Grid
        style={{
          display: "flex",
          width: "100%",
        }}
      >
        <Grid
          style={{
            width: "35%",
          }}
        >
          <Grid style={{ display: "flex", width: "100%" }}>
            <Grid style={{ width: "100%" }}>
              <Grid item xs={12} sm={8}>
                {!data &&
                ImportedPhotoRef.current === null &&
                capturedPhotoRef.current === null ? (
                  <Box className={headerClasses.imgContainer}>
                    <Typography
                      variant="h6"
                      width="200px"
                      fontSize="26px"
                      margin="25px"
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      height={"230px"}
                      sx={{ textAlign: "center" }}
                    >
                      {tabValue === "P" ? "Photo" : "Signature"}
                    </Typography>
                  </Box>
                ) : (
                  ""
                )}
                {tabValue === "P" ? (
                  capturedPhotoRef.current !== null ||
                  ScannedPhotoRef.current !== null ||
                  ImportedPhotoRef.current !== null ? (
                    <>
                      {capturedPhotoRef.current !== null &&
                        capturedPhoto !== null && (
                          <Box
                            component="img"
                            padding={"10px"}
                            src={URL.createObjectURL(
                              utilFunction.base64toBlob(capturedPhoto)
                            )}
                            style={{
                              width: "100%",
                              height: "250px",
                              objectFit: "fill",
                            }} // Set width and height
                            alt={"Captured Photo"}
                            className={headerClasses.contentContainer}
                            onClick={() => {
                              setSelectedImageUrl(
                                URL.createObjectURL(
                                  utilFunction.base64toBlob(capturedPhoto)
                                )
                              );
                              setIsImagePhotoOpen(true);
                            }}
                          />
                        )}
                      {ImportedPhotoRef.current !== null &&
                        impotedPhoto !== null && (
                          <Box
                            component="img"
                            padding={"10px"}
                            src={URL.createObjectURL(impotedPhoto)}
                            style={{
                              width: "100%",
                              height: "250px",
                              objectFit: "fill",
                            }} // Set width and height
                            alt={"Imported Photo"}
                            className={headerClasses.contentContainer}
                            onClick={() => {
                              setSelectedImageUrl(
                                URL.createObjectURL(impotedPhoto)
                              );
                              setIsImagePhotoOpen(true);
                            }}
                          />
                        )}
                      {ScannedPhotoRef.current !== null &&
                        scannedPhoto !== null && (
                          <Box
                            component="img"
                            padding={"10px"}
                            src={URL.createObjectURL(
                              utilFunction?.base64toBlob(scannedPhoto)
                            )}
                            style={{
                              width: "100%",
                              height: "250px",
                              objectFit: "fill",
                            }} // Set width and height
                            alt={"Imported Photo"}
                            className={headerClasses.contentContainer}
                            onClick={() => {
                              setSelectedImageUrl(
                                URL.createObjectURL(
                                  utilFunction?.base64toBlob(scannedPhoto)
                                )
                              );
                              setIsImagePhotoOpen(true);
                            }}
                          />
                        )}
                    </>
                  ) : data ? (
                    data.map((item, index) => (
                      <Box
                        key={index}
                        className={headerClasses.contentContainer}
                        style={{ width: "100%", height: "250px" }}
                      >
                        {renderImageSection(
                          item,
                          t("PhotoImage"),
                          "ACCT_PHOTO",
                          "Photo Image"
                        )}
                      </Box>
                    ))
                  ) : null
                ) : tabValue === "S" ? (
                  capturedSign !== null ||
                  impotedSign !== null ||
                  scannedSign !== null ? (
                    <>
                      {capturedSign !== null && (
                        <Box
                          component="img"
                          padding={"10px"}
                          src={URL.createObjectURL(
                            utilFunction.base64toBlob(capturedSign)
                          )}
                          style={{
                            width: "100%",
                            height: "250px",
                            objectFit: "fill",
                          }}
                          alt={"Captured Signature"}
                          className={headerClasses.contentContainer}
                          onClick={() => {
                            setSelectedImageUrl(
                              URL.createObjectURL(
                                utilFunction.base64toBlob(capturedSign)
                              )
                            );
                            setIsImagePhotoOpen(true);
                          }}
                        />
                      )}
                      {impotedSign !== null && (
                        <Box
                          component="img"
                          padding={"10px"}
                          src={URL.createObjectURL(impotedSign)}
                          style={{
                            width: "100%",
                            height: "250px",
                            objectFit: "fill",
                          }} // Set width and height
                          alt={"Imported Signature"}
                          className={headerClasses.contentContainer}
                          onClick={() => {
                            setSelectedImageUrl(
                              URL.createObjectURL(impotedSign)
                            );
                            setIsImagePhotoOpen(true);
                          }}
                        />
                      )}
                      {scannedSign !== null && (
                        <Box
                          component="img"
                          padding={"10px"}
                          src={URL.createObjectURL(
                            utilFunction?.base64toBlob(scannedSign)
                          )}
                          style={{
                            width: "100%",
                            height: "250px",
                            objectFit: "fill",
                          }} // Set width and height
                          alt={"Imported Photo"}
                          className={headerClasses.contentContainer}
                          onClick={() => {
                            setSelectedImageUrl(
                              URL.createObjectURL(
                                utilFunction?.base64toBlob(scannedSign)
                              )
                            );
                            setIsImagePhotoOpen(true);
                          }}
                        />
                      )}
                    </>
                  ) : data ? (
                    data.map((item, index) => (
                      <Box
                        key={index}
                        className={headerClasses.contentContainer}
                        style={{ width: "100%", height: "250px" }}
                      >
                        {renderImageSection(
                          item,
                          t("SignatureImage"),
                          "ACCT_SIGN",
                          "Signature Image"
                        )}
                      </Box>
                    ))
                  ) : null
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          style={{
            width: "5%",
          }}
        >
          <Grid
            style={{
              width: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "start",
              gap: "10px",
            }}
          >
            <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
              {tabValue === "P" ? "Photo Size" : "Sign Size"}{" "}
              {tabValue === "P"
                ? photoSizeKB && `${photoSizeKB} Kb`
                : signatureSize && `${signatureSize} Kb`}
            </Typography>
            <GradientButton
              onClick={() => {
                ImportedPhotoRef.current = null;
                ImportedSignRef.current = null;
                setImportSign(null);
                setCapturedSign(null);
                handleScan();
              }}
              disabled={formMode === "view"}
            >
              {t("scan")}
            </GradientButton>
            <GradientButton
              onClick={() => {
                if (tabValue === "P") {
                  capturedPhotoRef.current = null;
                  ScannedPhotoRef.current = null;
                  ScannedSignRef.current = null;
                  setCapturedPhoto(null);
                }
                setImportData(true);
              }}
              disabled={formMode === "view"}
            >
              {t("Import")}
            </GradientButton>
            {tabValue === "P" ? (
              <GradientButton
                disabled={formMode === "view"}
                onClick={() => {
                  ImportedPhotoRef.current = null;
                  ScannedPhotoRef.current = null;
                  ScannedSignRef.current = null;
                  setScanImage(null);
                  setOpenWebCam(true);
                }}
              >
                {t("Webcam")}
              </GradientButton>
            ) : (
              ""
            )}
            <GradientButton
              disabled={formMode === "view"}
              onClick={() => {
                if (tabValue === "P") {
                  capturedPhotoRef.current = null;
                  setImportPhoto(null);
                  setCapturedPhoto(null);
                  ImportedPhotoRef.current = null;
                } else if (tabValue === "S") {
                  ImportedSignRef.current = null;
                  setImportSign(null);
                }
              }}
            >
              {t("reset")}
            </GradientButton>

            <GradientButton
              disabled={formMode === "view"}
              style={{
                width: "120px",
              }}
            >
              {t("multipleAcctPhotoImport")}
            </GradientButton>
          </Grid>
        </Grid>
      </Grid>

      {open && (
        <ResponseParametersFormWrapper
          closeDialog={handleClose}
          retrievalParaValues={selectedDatas}
        />
      )}
      {openWebCam && (
        <WebCamImage
          isOpen={openWebCam}
          onActionNo={() => {
            setOpenWebCam(false);
          }}
          onSaveImage={handleSavePhoto}
        />
      )}
      {importData && (
        <UploadImageDialogue
          onClose={() => {
            setImportData(open);
          }}
          onUpload={(data) => {
            if (Boolean(data)) {
              if (tabValue === "P") {
                ImportedPhotoRef.current = utilFunction.base64toBlob(
                  data[0].blob
                );
                setImportPhoto(utilFunction.base64toBlob(data[0].blob));
              }
              if (tabValue === "S") {
                ImportedSignRef.current = utilFunction.base64toBlob(
                  data[0].blob
                );
                setImportSign(utilFunction.base64toBlob(data[0].blob));
              }
            }
            setImportData(false);
            trackDialogClass("main");
          }}
        />
      )}
      {previewScan ? (
        <PreviewScan
          previewScan={previewScan}
          imageData={thumbnails}
          setPreviewScan={setPreviewScan}
          setScanImage={setScanImage}
        />
      ) : null}
    </Fragment>
  );
};

export const CardScaningEntryMain = () => {
  return (
    <Fragment>
      <ClearCacheProvider>
        <DialogProvider>
          <div className="main">
            <CardScaningEntry />
          </div>
        </DialogProvider>
      </ClearCacheProvider>
    </Fragment>
  );
};
