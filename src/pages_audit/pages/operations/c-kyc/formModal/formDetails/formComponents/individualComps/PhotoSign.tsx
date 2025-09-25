import { useState, useEffect, useContext, useRef } from "react";
import { CkycContext } from "pages_audit/pages/operations/c-kyc/CkycContext";
import { AuthContext } from "pages_audit/auth";
import { Box, Grid, Typography, Dialog } from "@mui/material";
import { useSnackbar } from "notistack";
import { useStyles } from "../../../style";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import {
  utilFunction,
  ActionTypes,
  transformFileObject,
  GradientButton,
} from "@acuteinfo/common-base";
import { PreviewScan, useScan } from "components/common/custom/scan/useScan";
import WebCamImage from "pages_audit/pages/operations/AcctCardScaningEntry/WebCamImage";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";
import { ImageUploadDisplay } from "components/common/ImageUploadDisplay/ImageUploadDisplay";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";
const PhotoSign = ({ isModal }) => {
  const {
    state,
    handleFormDataonSavectx,
    handlePhotoOrSignctx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleCurrFormctx,
    toNextTab,
    toPrevTab,
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    handleFinalUpdateReq,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { authState } = useContext(AuthContext);
  const classes = useStyles();
  const submitBtnRef = useRef<any | null>(null);
  const [filecnt, setFilecnt] = useState(0);
  const [scanPhoto, setScanPhoto] = useState<any>();
  const [scanSign, setScanSign] = useState<any>();
  const [activePreview, setActivePreview] = useState<any>(null);
  const [openWebCam, setOpenWebCam] = useState<any>({
    openPhotoCam: "",
    openSignCam: "",
  });
  const [webCamType, setWebCamTye] = useState<string>("");
  const [photoSize, setPhotoSize] = useState<number>(0);
  const [signSize, setSignSize] = useState<number>(0);
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");
  const {
    previewScan: previewPhotoScan,
    handleScan: handlePhotoScan,
    setPreviewScan: setPhotoPreviewScan,
    thumbnails: photoThumbnails,
  } = useScan();
  const {
    previewScan: previewSignScan,
    handleScan: handleSignScan,
    setPreviewScan: setSignPreviewScan,
    thumbnails: signThumbnails,
  } = useScan();
  const photoUploadControl = useRef<any | null>(null);
  const signUploadControl = useRef<any | null>(null);
  const fileName = useRef<any | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  // const headerClasses = useTypeStyles();

  const photoFileURL = useRef<any | null>(null);
  const photoFilesdata = useRef<any | null>(null);

  const signFileURL = useRef<any | null>(null);
  const signFilesdata = useRef<any | null>(null);
  const { t } = useTranslation();

  // useEffect(() => {
  //   setPhotoImageURL(state?.photoBase64ctx, "photo");
  //   photoFilesdata.current = state?.photoBase64ctx;
  //   setPhotoImageURL(state?.signBase64ctx, "sign");
  //   signFilesdata.current = state?.signBase64ctx;
  //   // handlePhotoOrSignctx(null, )
  // }, []);
  useEffect(() => {
    if (
      state?.formDatactx["PHOTO_MST"]?.CUST_PHOTO ||
      state?.formDatactx["PHOTO_MST"]?.CUST_SIGN
    ) {
      setPhotoImageURL(state?.formDatactx["PHOTO_MST"]?.CUST_PHOTO, "photo");
      photoFilesdata.current = state?.formDatactx["PHOTO_MST"]?.CUST_PHOTO;
      setPhotoImageURL(state?.formDatactx["PHOTO_MST"]?.CUST_SIGN, "sign");
      signFilesdata.current = state?.formDatactx["PHOTO_MST"]?.CUST_SIGN;
    } else if (
      state?.retrieveFormDataApiRes["PHOTO_MST"]?.CUST_PHOTO ||
      state?.retrieveFormDataApiRes["PHOTO_MST"]?.CUST_SIGN
    ) {
      setPhotoImageURL(
        state?.retrieveFormDataApiRes["PHOTO_MST"]?.CUST_PHOTO,
        "photo"
      );
      photoFilesdata.current =
        state?.retrieveFormDataApiRes["PHOTO_MST"]?.CUST_PHOTO;
      setPhotoImageURL(
        state?.retrieveFormDataApiRes["PHOTO_MST"]?.CUST_SIGN,
        "sign"
      );
      signFilesdata.current =
        state?.retrieveFormDataApiRes["PHOTO_MST"]?.CUST_SIGN;
    }
    // handlePhotoOrSignctx(null, )
  }, [
    state?.isFreshEntryctx["PHOTO_MST"],
    state?.retrieveFormDataApiRes["PHOTO_MST"],
  ]);

  // useEffect(() => {
  //     Boolean(photoFilesdata.current), photoFilesdata.current?.length,
  //     Boolean(signFilesdata.current), signFilesdata.current?.length)
  // }, [photoFilesdata.current, signFilesdata.current])

  useEffect(() => {
    let refs = [handleSavePhotoSign];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  // Helper function to calculate base64 image size in kb (kilobits)
  const calculateBase64Size = (base64String: string): number => {
    if (!base64String) return 0;
    const base64Data = base64String.split(",")[1] || base64String;
    const sizeInBytes = (base64Data.length * 3) / 4;
    return (sizeInBytes * 8) / 1000;
  };

  // set image url by getting response in base64, convert to blob;, on edit
  const setPhotoImageURL = async (filedata, img: string) => {
    if (filedata && filedata !== null && filedata.length > 6) {
      let blob = utilFunction.base64toBlob(filedata, "image/png");
      const sizeInBytes = blob?.size;
      if (img === "photo") {
        photoFileURL.current =
          typeof blob === "object" && Boolean(blob)
            ? await URL.createObjectURL(blob as any)
            : null;
        setPhotoSize(sizeInBytes / 1024);
      } else if (img === "sign") {
        signFileURL.current =
          typeof blob === "object" && Boolean(blob)
            ? await URL.createObjectURL(blob as any)
            : null;
        setSignSize(sizeInBytes / 1024);
      }
      setFilecnt(filecnt + 1);
    } else {
      if (img === "photo") {
        photoFileURL.current = null;
        setPhotoSize(0);
      } else if (img === "sign") {
        signFileURL.current = null;
        setSignSize(0);
      }
    }
  };

  // custom blob creation from selected file blob
  const customTransformFileObj = (currentObj) => {
    return transformFileObject({})(currentObj);
  };

  // get base64 from blob and save in store state
  const setImageData = async (blob, img: string) => {
    let base64 = await utilFunction.convertBlobToBase64(blob);
    if (img === "photo") {
      photoFilesdata.current = base64?.[1];
    } else if (img === "sign") {
      signFilesdata.current = base64?.[1];
    }
  };

  // on file selection/change
  const handleFileSelect = async (e, img: string) => {
    const files = e.target.files;
    const filesArray = Array.from(files);
    if (filesArray.length > 0) {
      let resdata = filesArray.map(
        async (one) => await customTransformFileObj(one)
      );
      if (resdata.length > 0) {
        let filesObj: any = await Promise.all(resdata);
        let fileExt = filesObj?.[0]?.fileExt?.toUpperCase();
        if (fileExt === "JPG" || fileExt === "JPEG" || fileExt === "PNG") {
          let fileSize = filesObj?.[0]?.size / 1024 / 1024;

          if (fileSize <= 5) {
            if (img === "photo") {
              photoFileURL.current =
                typeof filesObj?.[0]?.blob === "object" &&
                Boolean(filesObj?.[0]?.blob)
                  ? await URL.createObjectURL(filesObj?.[0]?.blob as any)
                  : null;
              setPhotoSize((filesObj?.[0]?.size * 8) / 1000);
            } else if (img === "sign") {
              signFileURL.current =
                typeof filesObj?.[0]?.blob === "object" &&
                Boolean(filesObj?.[0]?.blob)
                  ? await URL.createObjectURL(filesObj?.[0]?.blob as any)
                  : null;
              setSignSize((filesObj?.[0]?.size * 8) / 1000);
            }
            setImageData(filesObj?.[0]?.blob, img);

            fileName.current = filesObj?.[0]?.blob?.name;
            //submitBtnRef.current?.click?.();
            setFilecnt(filecnt + 1);
          } else {
            enqueueSnackbar(t("ImageSizeShouldBeLessThan5MB"), {
              variant: "warning",
            });
          }
        } else {
          enqueueSnackbar(t("PleaseSelectValidFormat"), {
            variant: "warning",
          });
        }
      }
    }
  };

  // format object for save api on save&next button
  const handleSavePhotoSign = (e, flag) => {
    handleUpdateLoader(true);
    // if(state?.isFreshEntryctx) {
    let data = {
      IsNewRow: true,
      COMP_CD: authState?.companyID ?? "",
      ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
      REQ_FLAG: "F",
      CUST_PHOTO: photoFilesdata.current ?? "",
      CUST_SIGN: signFilesdata.current ?? "",
      ENT_COMP_CD: authState?.companyID ?? "",
    };
    let newData = state?.formDatactx;
    newData["PHOTO_MST"] = { ...newData["PHOTO_MST"], ...data };
    handleFormDataonSavectx(newData);
    handleFinalUpdateReq({ PHOTO_MST: newData?.["PHOTO_MST"] });
    // } else
    if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
      // let newData = state?.formDatactx
      // let data = {
      //     CUST_PHOTO: state?.photoBase64ctx,
      //     CUST_SIGN: state?.signBase64ctx
      // }
      // newData["PHOTO_MST"] = {...newData["PHOTO_MST"], ...data}
      // handleFormDataonSavectx(newData)

      let tabModifiedCols: any = state?.modifiedFormCols;
      // for storing tab-wise updated cols
      // let updatedCols = tabModifiedCols.PHOTO_MST ? _.uniq([...tabModifiedCols.PHOTO_MST, ...upd._UPDATEDCOLUMNS]) : _.uniq([...upd._UPDATEDCOLUMNS])
      // let updatedCols = tabModifiedCols.PHOTO_MST ? _.uniq([...tabModifiedCols.PHOTO_MST, ...formFieldsRef.current]) : _.uniq([...formFieldsRef.current])
      let updatedCols = ["CUST_PHOTO", "CUST_SIGN"];
      tabModifiedCols = {
        ...tabModifiedCols,
        PHOTO_MST: [...updatedCols],
      };
      handleModifiedColsctx(tabModifiedCols);
    }

    if (flag && flag?.startsWith("TabChange")) {
      const tabIndex = parseInt(flag?.split(" ")[1], 10);
      handleStepStatusctx({
        status: "completed",
        coltabvalue: state?.colTabValuectx,
      });
      handleColTabChangectx(tabIndex);
    } else if (
      !state?.customerIDctx?.trim() &&
      !flag?.startsWith("UpdateData")
    ) {
      handleStepStatusctx({
        status: "completed",
        coltabvalue: state?.colTabValuectx,
      });
      flag === "PREVIOUS" ? toPrevTab() : toNextTab();
    }
    handleUpdateLoader(false);
    handleCurrFormctx({
      currentFormSubmitted: true,
    });
  };

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Photo & Signature Upload"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = { handleSubmit: handleSavePhotoSign };
    }
  }, [tabFormRefs, state?.tabNameList, handleSavePhotoSign]);

  useEffect(() => {
    if (previewPhotoScan && activePreview !== "photo") {
      setPhotoPreviewScan(false);
    } else if (previewSignScan && activePreview !== "sign") {
      setSignPreviewScan(false);
    }
  }, [activePreview, previewPhotoScan, previewSignScan]);

  useEffect(() => {
    if (scanPhoto) {
      // handlePhotoOrSignctx(null, scanPhoto, "photo");
      const photoBlob = utilFunction.base64toBlob(scanPhoto, "image/png");
      setPhotoImageURL(scanPhoto, "photo");
      photoFilesdata.current = scanPhoto;
      setImageData(photoBlob, "photo");
      setPhotoSize(calculateBase64Size(scanPhoto));
    }
  }, [scanPhoto]);

  useEffect(() => {
    if (scanSign) {
      // handlePhotoOrSignctx(null, scanSign, "sign");
      const signBlob = utilFunction.base64toBlob(scanSign, "image/png");
      setPhotoImageURL(scanSign, "sign");
      signFilesdata.current = scanSign;
      setImageData(signBlob, "sign");
      setSignSize(calculateBase64Size(scanSign));
    }
  }, [scanSign]);

  const handleWebCam = (webCamData) => {
    const spitBase64Data = webCamData.split(",")[1];
    if (webCamType === "photo") {
      const photoCamBlob = utilFunction.base64toBlob(
        spitBase64Data,
        "image/png"
      );
      if (spitBase64Data) {
        // handlePhotoOrSignctx(null, scanPhoto, "photo");
        setPhotoImageURL(spitBase64Data, "photo");
        photoFilesdata.current = spitBase64Data;
        setImageData(photoCamBlob, "photo");
        setPhotoSize(calculateBase64Size(spitBase64Data));
      }
    } else if (webCamType === "sign") {
      const signCamBlob = utilFunction.base64toBlob(
        spitBase64Data,
        "image/png"
      );
      if (spitBase64Data) {
        // handlePhotoOrSignctx(null, scanSign, "sign");
        setPhotoImageURL(spitBase64Data, "sign");
        signFilesdata.current = spitBase64Data;
        setImageData(signCamBlob, "sign");
        setSignSize(calculateBase64Size(spitBase64Data));
      }
    }
  };

  const handleResetPhoto = () => {
    photoFileURL.current = null;
    photoFilesdata.current = null;
    setPhotoSize(0);
    setFilecnt(filecnt + 1);
  };

  const handleResetSign = () => {
    signFileURL.current = null;
    signFilesdata.current = null;
    setSignSize(0);
    setFilecnt(filecnt + 1);
  };

  const handleOpenPhotoCam = () => {
    setWebCamTye("photo");
    setOpenWebCam((pre) => ({
      ...pre,
      openPhotoCam: true,
    }));
  };
  const handleOpenSignCam = () => {
    setWebCamTye("sign");
    setOpenWebCam((pre) => ({
      ...pre,
      openSignCam: true,
    }));
  };

  return (
    <>
      <Grid container>
        {/* photo */}
        <ImageUploadDisplay
          type="photo"
          title={t("PhotoImage")}
          fileURL={photoFileURL}
          fileSize={photoSize}
          uploadControlRef={photoUploadControl}
          submitBtnRef={submitBtnRef}
          filecnt={filecnt}
          classes={classes}
          onFileSelect={handleFileSelect}
          onImport={() => photoUploadControl?.current?.click()}
          onScan={() => {
            setActivePreview("photo");
            handlePhotoScan();
          }}
          onWebcam={handleOpenPhotoCam}
          onReset={handleResetPhoto}
          disabled={state?.formmodectx === "view"}
          t={t}
          variant="compact"
          showFileSize={true}
          onImageClick={
            photoFileURL.current
              ? () => {
                  if (photoFileURL.current) {
                    setSelectedImageUrl(photoFileURL.current);
                    setIsImagePhotoOpen(true);
                  }
                }
              : undefined
          }
        />

        {/* signature */}
        <ImageUploadDisplay
          type="sign"
          title={t("SignatureImage")}
          fileURL={signFileURL}
          fileSize={signSize}
          uploadControlRef={signUploadControl}
          submitBtnRef={submitBtnRef}
          filecnt={filecnt}
          classes={classes}
          onFileSelect={handleFileSelect}
          onImport={() => signUploadControl?.current?.click()}
          onScan={() => {
            setActivePreview("sign");
            handleSignScan();
          }}
          onWebcam={handleOpenSignCam}
          onReset={handleResetSign}
          disabled={state?.formmodectx === "view"}
          t={t}
          variant="compact"
          showFileSize={true}
          onImageClick={
            signFileURL.current
              ? () => {
                  if (signFileURL.current) {
                    setSelectedImageUrl(signFileURL.current);
                    setIsImagePhotoOpen(true);
                  }
                }
              : undefined
          }
        />
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          style={{ padding: "0px 10px 10px 10px" }}
        >
          <Box
            sx={{
              padding: "5px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              color="inherit"
              variant={"body2"}
              component="div"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                mb: 1,
                color: "#2c3e50",
              }}
            >
              {t("Note")}
            </Typography>
            <Typography
              color="inherit"
              variant={"body2"}
              component="div"
              sx={{
                fontSize: "0.8rem",
                lineHeight: 1.4,
                color: "#555",
              }}
            >
              <ul
                style={{
                  paddingLeft: "12px",
                  margin: 0,
                  listStyleType: "disc",
                }}
              >
                <li style={{ marginBottom: "2px" }}>
                  {t("UseImportButtonToUploadImage")}
                </li>
                <li style={{ marginBottom: "2px" }}>
                  {t("MaximumImageSizeShouldBe5MB")}
                </li>
                <li style={{ marginBottom: "2px" }}>
                  {t("ImageFormatShouldBeJPEGAndPNG")}
                </li>
                <li style={{ marginBottom: "2px" }}>
                  {t("UseScanButtonToScanDocuments")}
                </li>
                <li style={{ marginBottom: "2px" }}>
                  {t("UseWebcamButtonToTakePhotoFromCamera")}
                </li>
              </ul>
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <TabNavigate
        handleSave={handleSavePhotoSign}
        displayMode={state?.formmodectx ?? "new"}
        isModal={isModal}
      />
      {previewPhotoScan ? (
        <PreviewScan
          previewScan={previewPhotoScan}
          imageData={photoThumbnails}
          setPreviewScan={setPhotoPreviewScan}
          setScanImage={setScanPhoto}
        />
      ) : null}
      {previewSignScan ? (
        <PreviewScan
          previewScan={previewSignScan}
          imageData={signThumbnails}
          setPreviewScan={setSignPreviewScan}
          setScanImage={setScanSign}
        />
      ) : null}
      {Boolean(openWebCam?.openPhotoCam) && (
        <WebCamImage
          isOpen={openWebCam?.openPhotoCam}
          onActionNo={() => {
            setOpenWebCam((pre) => ({ ...pre, openPhotoCam: false }));
          }}
          onSaveImage={handleWebCam}
        />
      )}
      {Boolean(openWebCam?.openSignCam) && (
        <WebCamImage
          isOpen={openWebCam?.openSignCam}
          onActionNo={() => {
            setOpenWebCam((pre) => ({ ...pre, openSignCam: false }));
          }}
          onSaveImage={handleWebCam}
        />
      )}

      {/* Open Photo/Sign image Canvas */}
      {isImgPhotoOpen && (
        <Dialog
          open={isImgPhotoOpen}
          onClose={() => setIsImagePhotoOpen(false)}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="lg"
        >
          <CanvasImageViewer
            imageUrl={selectedImageUrl}
            isOpen={isImgPhotoOpen}
            onClose={() => setIsImagePhotoOpen(false)}
            data={{
              CUSTOMER_ID:
                state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID ??
                "",
              CUST_NM:
                state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.ACCT_NM ?? "",
            }}
            headerContent={
              state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID?.trim()
                ? t("PhotoSignatureForCustomerID", {
                    customerId:
                      state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID?.trim() ??
                      "",
                    customerName:
                      state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.ACCT_NM?.trim() ??
                      "",
                  })
                : t("PhotoSignature")
            }
          />
        </Dialog>
      )}
    </>
  );
};

export default PhotoSign;
