import {
  useState,
  useEffect,
  useContext,
  useRef,
  FC,
  useCallback,
} from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "../../../../api";
import { CkycContext } from "pages_audit/pages/operations/c-kyc/CkycContext";
import { AuthContext } from "pages_audit/auth";
import {
  AppBar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useStyles } from "../../../style";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { PhotoHistoryMetadata } from "../../metadata/photohistoryMetadata";
import _ from "lodash";
import { PreviewScan, useScan } from "components/common/custom/scan/useScan";
import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  queryClient,
  transformFileObject,
  utilFunction,
  usePopupContext,
  GradientButton,
} from "@acuteinfo/common-base";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import WebCamImage from "pages_audit/pages/operations/AcctCardScaningEntry/WebCamImage";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";
import { ImageUploadDisplay } from "components/common/ImageUploadDisplay";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";
import ImageSectionViewer from "components/common/ImageSection";
interface PhotoSignProps {
  open: boolean;
  onClose: any;
  viewMode: string;
  isModal: any;
}

const PhotoSignatureCpyDialog: FC<PhotoSignProps> = (props) => {
  const { open, onClose, viewMode, isModal } = props;

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
    >
      <PhotoSignCommonComp
        onClose={onClose}
        viewMode={viewMode}
        isModal={isModal}
      />
    </Dialog>
  );
};

export const PhotoSignCommonComp = ({ onClose, viewMode, isModal }) => {
  const { state, handlePhotoOrSignctx, deepRemoveKeysIfExist, deepUpdateKeys } =
    useContext(isModal ? ClonedCkycContext : CkycContext);
  const { authState } = useContext(AuthContext);
  const classes = useStyles();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const submitBtnRef = useRef<any | null>(null);
  const [filecnt, setFilecnt] = useState(0);
  const [scanPhoto, setScanPhoto] = useState<any>();
  const [scanSign, setScanSign] = useState<any>();
  const [activePreview, setActivePreview] = useState<any>(null);
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
  const photoFileURL = useRef<any | null>(null);
  const photoUploadControl = useRef<any | null>(null);
  const signUploadControl = useRef<any | null>(null);
  const photoFilesdata = useRef<any | null>("");
  const fileName = useRef<any | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const signFileURL = useRef<any | null>(null);
  const signFilesdata = useRef<any | null>("");
  const { t } = useTranslation();
  const [formMode, setFormMode] = useState<any>("view");
  const [isHistoryGridVisible, setIsHistoryGridVisible] =
    useState<boolean>(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true);
  const [openWebCam, setOpenWebCam] = useState<any>({
    openPhotoCam: "",
    openSignCam: "",
  });
  const [webCamType, setWebCamTye] = useState<string>("");
  const [photoSize, setPhotoSize] = useState<number>(0);
  const [signSize, setSignSize] = useState<number>(0);
  // const [customerData, setCustomerData] = useState<any>({});
  const [openGridPhotoSign, setOpenGridPhotoSign] = useState<any>(false);
  const [rowData, setRowData] = useState<any>({});
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  // to get photo/sign history, on edit
  const {
    data: PhotoHistoryData,
    isError: isPhotoHistoryError,
    isLoading: isPhotoHistoryLoading,
    isFetching: isPhotoHistoryFetching,
    refetch: photoHistoryRefetch,
    error: photoHistoryError,
  } = useQuery<any, any>(["getPhotoSignHistory"], () =>
    API.getPhotoSignHistory({
      COMP_CD: authState?.companyID ?? "",
      CUSTOMER_ID: state?.customerIDctx ?? "",
      REQ_CD: state?.req_cd_ctx ?? "",
    })
  );

  const {
    data: LatestPhotoSignData,
    isError: isLatestDtlError,
    isLoading: isLatestDtlLoading,
    isFetching: isLatestDtlFetching,
    refetch: LatestDtlRefetch,
    error: LatestDtlError,
  } = useQuery<any, any>(["getLatestPhotoSign"], () =>
    API.getCustLatestDtl({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      SCREEN_REF: docCD,
      CUSTOMER_ID: state?.customerIDctx ?? "",
      REQUEST_CD: state?.req_cd_ctx ?? "",
    })
  );

  useEffect(() => {
    if (previewPhotoScan && activePreview !== "photo") {
      setPhotoPreviewScan(false);
    } else if (previewSignScan && activePreview !== "sign") {
      setSignPreviewScan(false);
    }
  }, [activePreview, previewPhotoScan, previewSignScan]);

  useEffect(() => {
    if (LatestPhotoSignData && !isLatestDtlLoading) {
      let custPhoto = LatestPhotoSignData?.[0]?.CUST_PHOTO;
      let custSign = LatestPhotoSignData?.[0]?.CUST_SIGN;
      if (custPhoto) {
        handlePhotoOrSignctx(null, custPhoto, "photo");
        setPhotoImageURL(custPhoto, "photo");
        photoFilesdata.current = custPhoto;
        setPhotoSize(calculateBase64Size(custPhoto));
      }
      if (custSign) {
        handlePhotoOrSignctx(null, custSign, "sign");
        setPhotoImageURL(custSign, "sign");
        signFilesdata.current = custSign;
        setSignSize(calculateBase64Size(custSign));
      }
    }
  }, [LatestPhotoSignData, isLatestDtlLoading]);

  // Actions for grid double-click functionality
  const actions = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
    {
      actionName: "view-photoSign",
      actionLabel: "View Photo/Sign",
      multiple: undefined,
      rowDoubleClick: true,
    },
  ];

  // Handle grid actions
  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      setIsHistoryGridVisible(false);
    }
    if (data.name === "view-photoSign") {
      setOpenGridPhotoSign(true);
      setRowData(data?.rows?.[0]?.data);
    }
  }, []);

  //Message for no data found
  const noImageMessage = (status, message) =>
    status === "999" ? message : t("NoImageFound");

  const updateMutation: any = useMutation(API.updatePhotoSignData, {
    onSuccess: async (data, payload) => {
      if (data?.length > 0) {
        const response: any = await handleDisplayMessages(data, MessageBox);

        if (Object?.keys(response)?.length > 0 && response?.O_STATUS === "0") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE ?? "Success",
            message: response?.O_MESSAGE,
            icon: "SUCCESS",
          });
          handlePhotoOrSignctx(null, payload.PHOTO, "photo");
          handlePhotoOrSignctx(null, payload.SIGN, "sign");
          setIsSaveDisabled(true);
          setFormMode("view");
          LatestDtlRefetch();
          photoHistoryRefetch();
        }
      }
    },
    onError: (error: any) => {
      setFormMode("view");
    },
  });

  const freshUpdMutation: any = useMutation(API.updateCustomerID, {
    onSuccess: async (data, payload) => {
      if (Boolean(data?.[0]?.REQ_CD)) {
        await MessageBox({
          messageTitle: "Success",
          message: `Image has been uploaded successfully for Request ID : ${
            data?.[0]?.REQ_CD ?? ""
          } `,
          icon: "SUCCESS",
        });
        handlePhotoOrSignctx(
          null,
          payload?.reqPara?.PHOTO_MST?.CUST_PHOTO,
          "photo"
        );
        handlePhotoOrSignctx(
          null,
          payload?.reqPara?.PHOTO_MST?.CUST_SIGN,
          "sign"
        );
        setIsSaveDisabled(true);
        setFormMode("view");
        LatestDtlRefetch();
        photoHistoryRefetch();
      }
    },
    onError: (error: any) => {
      setFormMode("view");
    },
  });

  const onSave = () => {
    let tabModifiedCols: any = ["CUST_PHOTO", "CUST_SIGN"];
    let newFormData = {
      CUST_PHOTO: photoFilesdata.current ?? "",
      CUST_SIGN: signFilesdata.current ?? "",
    };
    let oldFormData = {
      CUST_PHOTO: state?.photoBase64ctx ?? "",
      CUST_SIGN: state?.signBase64ctx ?? "",
    };
    let upd;
    upd = utilFunction.transformDetailsData(newFormData, oldFormData);

    let newData = {};
    if (Boolean(state?.req_cd_ctx)) {
      const { SR_CD, COMP_CD } = LatestPhotoSignData[0] ?? {};
      if (Boolean(LatestPhotoSignData?.length > 0)) {
        newData = {
          // ENTRY_TYPE: "1",
          COMP_CD: authState?.companyID ?? "",
          CUSTOMER_ID: state?.customerIDctx ?? "",
          REQ_FLAG: "F",
          PHOTO_MST: {
            IsNewRow: false,
            COMP_CD: COMP_CD ?? "",
            REQ_CD: state?.req_cd_ctx ?? "",
            CUST_PHOTO: photoFilesdata.current ?? "",
            CUST_SIGN: signFilesdata.current ?? "",
            SR_CD: SR_CD ?? "",
            ...upd,
          },
        };
      } else {
        newData = {
          COMP_CD: authState?.companyID ?? "",
          CUSTOMER_ID: state?.customerIDctx ?? "",
          REQ_FLAG: "F",
          PHOTO_MST: {
            IsNewRow: true,
            COMP_CD: authState?.companyID ?? "",
            REQ_CD: state?.req_cd_ctx,
            CUST_PHOTO: photoFilesdata.current ?? "",
            CUST_SIGN: signFilesdata.current ?? "",
          },
        };
      }
    }
    const data = {
      CUSTOMER_ID: state?.customerIDctx ?? "",
      PHOTO: photoFilesdata.current ?? "",
      SIGN: signFilesdata.current ?? "",
      SCREEN_REF: docCD ?? "",
    };

    const freshModifyReq = {
      IsNewRow: false,
      COMP_CD: authState?.companyID ?? "",
      ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
      REQ_FLAG: "F",
      CUST_PHOTO: photoFilesdata.current ?? "",
      CUST_SIGN: signFilesdata.current ?? "",
      ENT_COMP_CD: authState?.companyID ?? "",
    };

    Boolean(state?.customerIDctx)
      ? updateMutation.mutate(data)
      : freshUpdMutation?.mutate({
          reqPara: newData,
          state,
          save_flag: "F",
          authState,
          deepRemoveKeysIfExist,
          deepUpdateKeys,
        });
  };

  // Helper function to check if there are actual changes made
  const hasUnsavedChanges = () => {
    const currentPhoto = photoFilesdata.current ?? "";
    const currentSign = signFilesdata.current ?? "";
    const originalPhoto = state?.photoBase64ctx ?? "";
    const originalSign = state?.signBase64ctx ?? "";

    return currentPhoto !== originalPhoto || currentSign !== originalSign;
  };

  const onClear = async () => {
    setFormMode("view");
    await setPhotoImageURL(state?.photoBase64ctx, "photo");
    await setPhotoImageURL(state?.signBase64ctx, "sign");
    const photoBlob = utilFunction.base64toBlob(
      state?.photoBase64ctx,
      "image/png"
    );
    const signBlob = utilFunction.base64toBlob(
      state?.signBase64ctx,
      "image/png"
    );
    setImageData(photoBlob, "photo");
    setImageData(signBlob, "sign");
    CloseMessageBox();
    setIsSaveDisabled(true);
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

  // Helper function to calculate base64 image size in kb (kilobits)
  const calculateBase64Size = (base64String: string): number => {
    if (!base64String) return 0;
    const base64Data = base64String.split(",")[1] || base64String;
    const sizeInBytes = (base64Data.length * 3) / 4;
    return (sizeInBytes * 8) / 1000;
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
            setFilecnt(filecnt + 1);
            if (isSaveDisabled) {
              setIsSaveDisabled(false);
            }
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

  useEffect(() => {
    const photoBlob = utilFunction.base64toBlob(scanPhoto, "image/png");
    if (scanPhoto) {
      // handlePhotoOrSignctx(null, scanPhoto, "photo");
      setPhotoImageURL(scanPhoto, "photo");
      photoFilesdata.current = scanPhoto;
      setImageData(photoBlob, "photo");
      setPhotoSize(calculateBase64Size(scanPhoto));
    }

    if (scanPhoto || photoBlob) {
      if (isSaveDisabled) {
        setIsSaveDisabled(false);
      }
    }
  }, [scanPhoto]);

  useEffect(() => {
    const signBlob = utilFunction.base64toBlob(scanSign, "image/png");
    if (scanSign) {
      // handlePhotoOrSignctx(null, scanSign, "sign");
      setPhotoImageURL(scanSign, "sign");
      signFilesdata.current = scanSign;
      setImageData(signBlob, "sign");
      setSignSize(calculateBase64Size(scanSign));
    }

    if (scanSign || signBlob) {
      if (isSaveDisabled) {
        setIsSaveDisabled(false);
      }
    }
  }, [scanSign]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPhotoSignHistory"]);
      queryClient.removeQueries(["getLatestPhotoSign"]);
    };
  }, []);

  const handleDataLostDialog = async () => {
    const buttonName = await MessageBox({
      messageTitle: "confirmation",
      message: "YourChangesWillBeRemoved",
      icon: "CONFIRM",
      defFocusBtnName: "Ok",
      buttonNames: ["Ok", "Cancel"],
    });
    if (buttonName === "Ok") {
      onClear();
    } else if (buttonName === "Cancel") {
      CloseMessageBox();
    }
  };

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

      if (photoCamBlob || spitBase64Data) {
        if (isSaveDisabled) {
          setIsSaveDisabled(false);
        }
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

      if (signCamBlob || spitBase64Data) {
        if (isSaveDisabled) {
          setIsSaveDisabled(false);
        }
      }
    }
  };

  const handleResetPhoto = () => {
    photoFileURL.current = null;
    photoFilesdata.current = "";
    setPhotoSize(0);
    setFilecnt(filecnt + 1);
    if (isSaveDisabled) {
      setIsSaveDisabled(false);
    }
  };

  const handleResetSign = () => {
    signFileURL.current = null;
    signFilesdata.current = "";
    setSignSize(0);
    setFilecnt(filecnt + 1);
    if (isSaveDisabled) {
      setIsSaveDisabled(false);
    }
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
      <DialogTitle sx={{ p: "8px 8px 0 8px" }}>
        <AppBar
          position="static"
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
              component="span"
              variant="h5"
              sx={{
                flex: "1 1 100%",
                color: "var(--theme-color2)",
                fontSize: "1.25rem",
                letterSpacing: "0.0075em",
              }}
            >
              {state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID?.trim()
                ? t("PhotoSignatureForCustomerID", {
                    customerId:
                      state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID?.trim(),
                    customerName:
                      state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.ACCT_NM?.trim(),
                  })
                : t("PhotoSignature")}
            </Typography>
            <Chip
              style={{ color: "white", marginLeft: "8px" }}
              variant="outlined"
              color="primary"
              size="small"
              label={formMode === "view" ? "view mode" : "edit mode"}
            />
            <div style={{ display: "flex", alignItems: "center" }}>
              {!isHistoryGridVisible && (
                <GradientButton
                  sx={{ textWrap: "nowrap" }}
                  onClick={() => setIsHistoryGridVisible(true)}
                >
                  {t("ViewHistory")}
                </GradientButton>
              )}
              {isHistoryGridVisible && (
                <GradientButton
                  sx={{ textWrap: "nowrap" }}
                  onClick={() => setIsHistoryGridVisible(false)}
                >
                  {t("CloseHistory")}
                </GradientButton>
              )}

              {formMode === "view" && viewMode === "edit" && !isModal && (
                <GradientButton onClick={() => setFormMode("edit")}>
                  Edit
                </GradientButton>
              )}
              {formMode === "edit" && (
                <GradientButton
                  disabled={
                    isSaveDisabled ||
                    updateMutation?.isLoading ||
                    isLatestDtlFetching ||
                    isLatestDtlLoading ||
                    isPhotoHistoryFetching ||
                    isPhotoHistoryLoading ||
                    freshUpdMutation?.isLoading
                  }
                  onClick={onSave}
                >
                  {t("Save")}
                </GradientButton>
              )}

              {formMode === "edit" && (
                <GradientButton
                  onClick={() => {
                    if (hasUnsavedChanges()) {
                      handleDataLostDialog();
                    } else {
                      setFormMode("view");
                    }
                  }}
                >
                  {t("Cancel")}
                </GradientButton>
              )}
              {formMode === "view" && (
                <GradientButton
                  onClick={() => {
                    handlePhotoOrSignctx(null, null, "photo");
                    handlePhotoOrSignctx(null, null, "sign");
                    onClose();
                  }}
                >
                  {t("Close")}
                </GradientButton>
              )}
            </div>
          </Toolbar>
          {updateMutation?.isLoading ||
          isLatestDtlFetching ||
          isLatestDtlLoading ||
          isPhotoHistoryFetching ||
          isPhotoHistoryLoading ||
          freshUpdMutation?.isLoading ? (
            <LinearProgress color="secondary" />
          ) : null}
        </AppBar>
      </DialogTitle>
      <DialogContent sx={{ p: "0 8px 8px 8px" }}>
        <>
          {updateMutation.isError ||
          isPhotoHistoryError ||
          isLatestDtlError ||
          freshUpdMutation?.isError ? (
            <Alert
              severity={
                (updateMutation.error?.severity ||
                  photoHistoryError?.severity ||
                  LatestDtlError?.severity ||
                  freshUpdMutation?.severity) ??
                "error"
              }
              errorMsg={
                (updateMutation.error?.error_msg ||
                  photoHistoryError?.error_msg ||
                  LatestDtlError?.error_msg ||
                  freshUpdMutation?.error_msg) ??
                "Something went to wrong.."
              }
              errorDetail={
                (updateMutation.error?.error_detail ||
                  photoHistoryError?.error_detail ||
                  LatestDtlError?.error_detail ||
                  freshUpdMutation?.error_detail) ??
                ""
              }
              color="error"
            />
          ) : null}
          <Grid container sx={{ px: "1" }}>
            {/* Photo Upload Section */}
            <ImageUploadDisplay
              type="photo"
              title={t("CardPhotoImage")}
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
              disabled={
                formMode !== "edit" ||
                updateMutation?.isLoading ||
                isLatestDtlFetching ||
                isLatestDtlLoading ||
                isPhotoHistoryFetching ||
                isPhotoHistoryLoading ||
                freshUpdMutation?.isLoading
              }
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

            {/* Signature Upload Section */}
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
              disabled={
                formMode !== "edit" ||
                updateMutation?.isLoading ||
                isLatestDtlFetching ||
                isLatestDtlLoading ||
                isPhotoHistoryFetching ||
                isPhotoHistoryLoading ||
                freshUpdMutation?.isLoading
              }
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

            {PhotoHistoryData && isHistoryGridVisible && (
              <GridWrapper
                key={`AssetDTLGrid`}
                finalMetaData={PhotoHistoryMetadata as GridMetaDataType}
                data={PhotoHistoryData ?? []}
                setData={() => null}
                loading={isPhotoHistoryLoading || isPhotoHistoryFetching}
                actions={actions}
                setAction={setCurrentAction}
              />
            )}
          </Grid>
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
              onClose={() => {
                setIsImagePhotoOpen(false);
              }}
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
                  CUSTOMER_ID: openGridPhotoSign
                    ? rowData?.CUSTOMER_ID ?? ""
                    : state?.retrieveFormDataApiRes?.PERSONAL_DETAIL
                        ?.CUSTOMER_ID ?? "",
                  CUST_NM: openGridPhotoSign
                    ? rowData?.CUST_NM ?? ""
                    : state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.ACCT_NM ??
                      "",
                }}
                headerContent={
                  (
                    openGridPhotoSign
                      ? rowData?.CUSTOMER_ID?.trim()
                      : state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID?.trim()
                  )
                    ? t("PhotoSignatureForCustomerID", {
                        customerId: openGridPhotoSign
                          ? rowData?.CUSTOMER_ID?.trim() ?? ""
                          : state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CUSTOMER_ID?.trim() ??
                            "",
                        customerName: openGridPhotoSign
                          ? rowData?.CUST_NM?.trim() ?? ""
                          : state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.ACCT_NM?.trim() ??
                            "",
                      })
                    : t("PhotoSignature")
                }
              />
            </Dialog>
          )}

          {/* Open Photo/Sign History ImageSectionViewer */}
          {openGridPhotoSign && (
            <Dialog
              maxWidth="lg"
              open={openGridPhotoSign}
              onClose={() => setOpenGridPhotoSign(false)}
              onKeyUp={(event) => {
                if (event.key === "Escape") {
                  setOpenGridPhotoSign(false);
                }
              }}
              PaperProps={{
                style: {
                  overflow: "hidden",
                  width: "100%",
                },
              }}
            >
              <ImageSectionViewer
                onClose={() => setOpenGridPhotoSign(false)}
                data={rowData}
                imageSections={[
                  {
                    label: t("CardPhotoImage"),
                    imageKey: "CUST_PHOTO",
                    altText: "Photo Image",
                  },
                  {
                    label: t("SignatureImage"),
                    imageKey: "CUST_SIGN",
                    altText: "Signature Image",
                  },
                ]}
                onImageClick={(imageUrl) => {
                  setSelectedImageUrl(imageUrl);
                  setIsImagePhotoOpen(true);
                }}
                showAppBar={true}
                appBarTitle={
                  rowData?.CUSTOMER_ID?.trim()
                    ? t("PhotoSignatureHistoryForCustomer", {
                        customerId: rowData?.CUSTOMER_ID?.trim() ?? "",
                        customerName: rowData?.CUST_NM?.trim() ?? "",
                      })
                    : t("PhotoSignatureHistory")
                }
                closeButtonText="Close"
                noImageMessage={noImageMessage}
              />
            </Dialog>
          )}
        </>
      </DialogContent>
    </>
  );
};

export default PhotoSignatureCpyDialog;
