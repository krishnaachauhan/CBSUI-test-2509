import React, {
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
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Typography,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useStyles } from "../../../style";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { PhotoHistoryMetadata } from "../../metadata/photohistoryMetadata";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";
import ImageSectionViewer from "components/common/ImageSection";
interface PhotoSignProps {
  open: boolean;
  onClose: any;
  PendingRefetch: any;
}

const PhotoSignConfirmDialog: FC<PhotoSignProps> = (props) => {
  const { open, onClose, PendingRefetch } = props;

  const { state, handlePhotoOrSignctx, handleFormModalClosectx } =
    useContext(CkycContext);
  const { authState } = useContext(AuthContext);
  const classes = useStyles();
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const [filecnt, setFilecnt] = useState(0);
  const photoFileURL = useRef<any | null>(null);
  const photoFilesdata = useRef<any | null>("");
  const { enqueueSnackbar } = useSnackbar();

  const signFileURL = useRef<any | null>(null);
  const signFilesdata = useRef<any | null>("");
  const { t } = useTranslation();
  const location: any = useLocation();
  const formMode = "view";
  const [isHistoryGridVisible, setIsHistoryGridVisible] =
    useState<boolean>(true);
  const [openGridPhotoSign, setOpenGridPhotoSign] = useState<any>(false);
  const [rowData, setRowData] = useState<any>({});
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");

  const CUST_NM = location.state?.[0]?.data.CUSTOMER_NAME ?? "";
  const CUST_ID = location.state?.[0]?.data.CUSTOMER_ID ?? "";
  const REQUEST_CD = location.state?.[0]?.data.REQUEST_ID ?? "";
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  // useEffect(() => {
  //   console.log("photoBase64ctx, signBase64ctx", Boolean(state?.photoBase64ctx), Boolean(state?.signBase64ctx))
  // }, [state?.photoBase64ctx, state?.signBase64ctx])

  // photo/sign history
  const {
    data: PhotoHistoryData,
    isError: isPhotoHistoryError,
    isLoading: isPhotoHistoryLoading,
    isFetching: isPhotoHistoryFetching,
    refetch: photoHistoryRefetch,
    error: photoHistoryError,
  } = useQuery<any, any>(["getPhotoSignHistory", {}], () =>
    API.getPhotoSignHistory({
      COMP_CD: authState?.companyID ?? "",
      CUSTOMER_ID: location?.state?.[0]?.data.CUSTOMER_ID,
      REQ_CD: location?.state?.[0]?.data.REQUEST_ID ?? "",
    })
  );

  // latest photo/sign data
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
      CUSTOMER_ID: location?.state?.[0]?.data.CUSTOMER_ID,
      REQUEST_CD: location?.state?.[0]?.data.REQUEST_ID ?? "",
    })
  );

  // confirmation
  const confirmPhotoMutation: any = useMutation(API.ConfirmCustPhoto, {
    onSuccess: (data, req) => {
      PendingRefetch();
      CloseMessageBox();
      enqueueSnackbar(
        `Request ID ${REQUEST_CD} ${
          req?.CONFIRMED === "Y" ? "confirmed" : "rejected"
        } Successfully.`,
        {
          variant: "success",
        }
      );
      handleFormModalClosectx();
      handlePhotoOrSignctx(null, null, "photo");
      handlePhotoOrSignctx(null, null, "sign");
      onClose();
    },
    onError: (error: any) => {
      let errorMsg: string = t("UnknownErrorOccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

  useEffect(() => {
    if (LatestPhotoSignData && !isLatestDtlLoading) {
      let custPhoto = LatestPhotoSignData?.[0]?.CUST_PHOTO;
      let custSign = LatestPhotoSignData?.[0]?.CUST_SIGN;
      if (custPhoto) {
        handlePhotoOrSignctx(null, custPhoto, "photo");
        setPhotoImageURL(custPhoto, "photo");
        photoFilesdata.current = custPhoto;
      }
      if (custSign) {
        handlePhotoOrSignctx(null, custSign, "sign");
        setPhotoImageURL(custSign, "sign");
        signFilesdata.current = custSign;
      }
    }
  }, [LatestPhotoSignData, isLatestDtlLoading]);

  // Actions for grid double-click functionality
  const actions = [
    {
      actionName: "view-photoSign",
      actionLabel: "View Photo/Sign",
      multiple: undefined,
      rowDoubleClick: true,
    },
  ];

  // Handle grid actions
  const setCurrentAction = useCallback((data) => {
    if (data.name === "view-photoSign") {
      setOpenGridPhotoSign(true);
      setRowData(data?.rows?.[0]?.data);
    }
  }, []);

  //Message for no data found
  const noImageMessage = (status, message) =>
    status === "999" ? message : t("NoImageFound");

  // set image url by getting response in base64, convert to blob;, on edit
  const setPhotoImageURL = async (filedata, img: string) => {
    if (filedata && filedata !== null && filedata.length > 6) {
      let blob = utilFunction.base64toBlob(filedata, "image/png");
      if (img === "photo") {
        photoFileURL.current =
          typeof blob === "object" && Boolean(blob)
            ? await URL.createObjectURL(blob as any)
            : null;
      } else if (img === "sign") {
        signFileURL.current =
          typeof blob === "object" && Boolean(blob)
            ? await URL.createObjectURL(blob as any)
            : null;
      }
      setFilecnt(filecnt + 1);
    } else {
      if (img === "photo") {
        photoFileURL.current = null;
      } else if (img === "sign") {
        signFileURL.current = null;
      }
    }
  };

  const openActionDialog = async (state: string) => {
    // setActionDialog(true)
    // setConfirmAction(state)

    const buttonName = await MessageBox({
      messageTitle: "Confirmation",
      message: t("ConfirmRequestMessage", { action: state ?? "confirm" }),
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      confirmPhotoMutation.mutate({
        REQUEST_CD: REQUEST_CD,
        COMP_CD: authState?.companyID ?? "",
        CONFIRMED: state === "confirm" ? "Y" : "N",
      });
    }
  };

  const ActionBTNs = React.useMemo(() => {
    return (
      <React.Fragment>
        {!isHistoryGridVisible && (
          <Button
            sx={{ textWrap: "nowrap" }}
            onClick={() => setIsHistoryGridVisible(true)}
          >
            {t("ViewHistory")}
          </Button>
        )}
        {isHistoryGridVisible && (
          <Button
            sx={{ textWrap: "nowrap" }}
            onClick={() => setIsHistoryGridVisible(false)}
          >
            {t("CloseHistory")}
          </Button>
        )}
        <Button
          onClick={() => openActionDialog("confirm")}
          color="primary"
          // disabled={mutation.isLoading}
        >
          {t("Confirm")}
        </Button>
        <Button
          onClick={() => openActionDialog("reject")}
          color="primary"
          // disabled={mutation.isLoading}
        >
          {t("Reject")}
        </Button>
        <Button
          onClick={() => {
            handleFormModalClosectx();
            handlePhotoOrSignctx(null, null, "photo");
            handlePhotoOrSignctx(null, null, "sign");
            onClose();
          }}
        >
          {t("Close")}
        </Button>
      </React.Fragment>
    );
  }, [isHistoryGridVisible]);

  return (
    <React.Fragment>
      <Dialog
        open={open}
        maxWidth="lg"
        PaperProps={{
          style: {
            minWidth: "70%",
            width: "80%",
            // maxWidth: "90%",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "var(--theme-color3)",
            color: "var(--theme-color2)",
            letterSpacing: "1.3px",
            // margin: "10px",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;",
            fontWeight: "light",
            borderRadius: "inherit",
            minWidth: "450px",
            py: 1,
            // mx: "auto",
            display: "flex",
            // mx: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
          id="responsive-dialog-title"
        >
          <Grid container>
            <Typography variant="h6">
              {CUST_ID
                ? `Photo & Signature - ${CUST_NM} [Cust. ID : ${CUST_ID}]`
                : "Photo & Signature"}
            </Typography>
          </Grid>
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* {!isHistoryGridVisible && (
            <Button sx={{textWrap: "nowrap"}} onClick={() => setIsHistoryGridVisible(true)}>
              View History
            </Button>
          )}
          {isHistoryGridVisible && (
            <Button sx={{textWrap: "nowrap"}} onClick={() => setIsHistoryGridVisible(false)}>
              Close History
            </Button>
          )} */}
            {ActionBTNs}

            {/* {formMode === "view" && (
            <Button
              onClick={() => {
                handlePhotoOrSignctx(null, null, "photo")
                handlePhotoOrSignctx(null, null, "sign")          
                onClose();
              }}
            >
              Close
            </Button>
          )} */}
          </div>
        </DialogTitle>
        <DialogContent sx={{ px: "0" }}>
          <>
            {isLatestDtlLoading ? <LinearProgress color="secondary" /> : null}
            {isLatestDtlError ? (
              <Alert
                severity={LatestDtlError?.severity ?? "error"}
                errorMsg={
                  LatestDtlError?.error_msg ?? t("Somethingwenttowrong")
                }
                errorDetail={LatestDtlError?.error_detail}
                color="error"
              />
            ) : isPhotoHistoryError ? (
              <Alert
                severity={photoHistoryError?.severity ?? "error"}
                errorMsg={
                  photoHistoryError?.error_msg ?? t("Somethingwenttowrong")
                }
                errorDetail={photoHistoryError?.error_detail}
                color="error"
              />
            ) : (
              confirmPhotoMutation.isError && (
                <Alert
                  severity={confirmPhotoMutation.error?.severity ?? "error"}
                  errorMsg={
                    confirmPhotoMutation.error?.error_msg ??
                    t("Somethingwenttowrong")
                  }
                  errorDetail={confirmPhotoMutation.error?.error_detail}
                  color="error"
                />
              )
            )}
            <Grid container sx={{ px: "1" }}>
              {/* photo */}
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                style={{ paddingBottom: "10px" }}
              >
                <Typography
                  // className={headerClasses.title}
                  color="inherit"
                  variant={"h6"}
                  component="div"
                >
                  {t("PhotoImage")}
                </Typography>
                <div
                  className={classes.uploadWrapper}
                  style={{
                    // width: "100%",
                    width: "300px",
                    height: "190px",
                    background: "#cfcfcf",
                    cursor: "auto",
                    margin: "10px",
                    padding: "4px",
                  }}
                  key={"div" + filecnt}
                >
                  <Grid
                    container
                    spacing={0}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {Boolean(photoFileURL.current) ? (
                      <Tooltip
                        title={t("ToZoomInOnTheImagesClickOnItOnce")}
                        placement="top"
                        arrow
                      >
                        <img
                          src={photoFileURL.current}
                          alt={t("PhotoImage")}
                          style={{
                            maxWidth: "300px",
                            minWidth: "300px",
                            maxHeight: "190px",
                            minHeight: "190px",
                            cursor: "zoom-in",
                            transition: "transform 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onClick={() => {
                            if (photoFileURL.current) {
                              setSelectedImageUrl(photoFileURL.current);
                              setIsImagePhotoOpen(true);
                            } else {
                            }
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <img
                        src=""
                        style={{
                          maxWidth: "300px",
                          minWidth: "300px",
                          maxHeight: "190px",
                          minHeight: "190px",
                        }}
                      />
                    )}
                  </Grid>
                </div>
              </Grid>

              {/* signature */}
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                style={{ paddingBottom: "10px" }}
              >
                <Typography
                  // className={headerClasses.title}
                  color="inherit"
                  variant={"h6"}
                  component="div"
                >
                  {t("SignatureImage")}
                </Typography>
                <div
                  className={classes.uploadWrapper}
                  style={{
                    // width: "100%",
                    width: "300px",
                    height: "190px",
                    background: "#cfcfcf",
                    cursor: "auto",
                    margin: "10px",
                    padding: "4px",
                  }}
                  key={"div" + filecnt} //temp
                >
                  <Grid
                    container
                    spacing={0}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {Boolean(signFileURL.current) ? (
                      <Tooltip
                        title={t("ToZoomInOnTheImagesClickOnItOnce")}
                        placement="top"
                        arrow
                      >
                        <img
                          src={signFileURL.current}
                          alt={t("SignatureImage")}
                          style={{
                            maxWidth: "300px",
                            minWidth: "300px",
                            maxHeight: "190px",
                            minHeight: "190px",
                            cursor: "zoom-in",
                            transition: "transform 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onClick={() => {
                            if (signFileURL.current) {
                              setSelectedImageUrl(signFileURL.current);
                              setIsImagePhotoOpen(true);
                            } else {
                            }
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <img
                        src=""
                        style={{
                          maxWidth: "300px",
                          minWidth: "300px",
                          maxHeight: "190px",
                          minHeight: "190px",
                        }}
                      />
                    )}
                  </Grid>
                </div>
              </Grid>

              {isHistoryGridVisible && (
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
          </>
        </DialogContent>
      </Dialog>

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
                : CUST_ID ?? "",
              CUST_NM: openGridPhotoSign
                ? rowData?.CUST_NM ?? ""
                : CUST_NM ?? "",
            }}
            headerContent={
              (
                openGridPhotoSign
                  ? rowData?.CUSTOMER_ID?.trim()
                  : CUST_ID?.trim()
              )
                ? t("PhotoSignatureForCustomerID", {
                    customerId: openGridPhotoSign
                      ? rowData?.CUSTOMER_ID?.trim() ?? ""
                      : CUST_ID?.trim() ?? "",
                    customerName: openGridPhotoSign
                      ? rowData?.CUST_NM?.trim() ?? ""
                      : CUST_NM?.trim() ?? "",
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
    </React.Fragment>
  );
};

export default PhotoSignConfirmDialog;
