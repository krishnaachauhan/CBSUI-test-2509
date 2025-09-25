import {
  AppBar,
  Box,
  Dialog,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { GeneralAPI } from "registry/fns/functions";
import { makeStyles, styled } from "@mui/styles";
import { PhotoSignHistoryMetadata } from "./photoSignHistoryGridMetadata";
import { useSnackbar } from "notistack";
import { t } from "i18next";
import {
  LoaderPaperComponent,
  ActionTypes,
  Alert,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  utilFunction,
  queryClient,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";
import i18n from "components/multiLanguage/languagesConfiguration";
import { getdocCD } from "components/utilFunction/function";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";
import ImageSectionViewer from "components/common/ImageSection";

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
    height: "90%",
    padding: "0 10px 10px 10px",
    "@media (max-width: 1024px)": {
      flex: "0 0 auto",
      width: "100%",
      margin: "8px 0",
      height: "350px",
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
    objectFit: "fill",
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
    width: "100%",
    height: "450px",
    flexDirection: "row",
    gap: "8px",
    padding: "0 8px",
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

const actions: ActionTypes[] = [
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
const PhotoSignWithHistory = ({
  data,
  onClose,
  screenRef,
}: {
  data: any;
  onClose?: any;
  screenRef?: any;
}) => {
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isHistoryGridVisible, setIsHistoryGridVisible] = useState<any>(false);
  const headerClasses = useTypeStyles();
  const [showAll, setShowAll] = useState(false);
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");
  const [AcCustLevel, setAcCustLevel] = useState<any>("");
  const navigate = useNavigate();
  const [openGridPhotoSign, setOpenGridPhotoSign] = useState<any>(false);
  const [rowData, setRowData] = useState<any>({});
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  //Latest photo/sign Api
  const {
    data: LatestPhotoSignData,
    isError: isLatestDtlError,
    isLoading: isLatestDtlLoading,
    isFetching: isLatestDtlFetching,
    refetch: LatestDtlRefetch,
    error: LatestDtlError,
  } = useQuery<any, any>(["getCustAccountLatestDtl", data, AcCustLevel], () =>
    GeneralAPI.getCustAccountLatestDtl({
      COMP_CD: data?.COMP_CD ?? "",
      BRANCH_CD: data?.BRANCH_CD ?? "",
      ACCT_TYPE: data?.ACCT_TYPE ?? "",
      ACCT_CD: data?.ACCT_CD ?? "",
      CUSTOMER_ID: data?.CUSTOMER_ID ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      BASE_BRANCH_CD: authState?.user?.branchCode ?? "",
      USERNAME: authState?.user?.id,
      USERROLE: authState?.role,
      DISPLAY_LANGUAGE: i18n.resolvedLanguage,
      AMOUNT: data?.AMOUNT ?? "",
      SCREEN_REF: docCD ?? "",
      AC_CUST_LEVEL: AcCustLevel ?? "",
    })
  );

  //Photo/sign history Api
  const getPhotoSignHistory: any = useMutation(GeneralAPI.getPhotoSignHistory, {
    onSuccess: (data, variables) => {},
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
  });

  useEffect(() => {
    localStorage.setItem("commonClass", "photoSign");
    return () => {
      queryClient.removeQueries(["getCustAccountLatestDtl", data, AcCustLevel]);
    };
  }, []);

  const setCurrentAction = useCallback(
    (data) => {
      if (data.name === "close") {
        setIsHistoryGridVisible(false);
      }
      if (data.name === "view-photoSign") {
        setOpenGridPhotoSign(true);
        setRowData(data?.rows?.[0]?.data);
      }
    },
    [navigate]
  );

  //Message for no data found
  const noImageMessage = (status, message) =>
    status === "999" ? message : t("NoImageFound");

  //Image section for main dialog
  const renderImageSection = (item, label, imageKey, altText) => (
    <Paper className={headerClasses.imgSecPaper}>
      <Typography
        variant="h6"
        component="div"
        className={headerClasses.imgLabel}
      >
        {label}
      </Typography>
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
            {noImageMessage(item?.O_STATUS, item?.O_MESSAGE)}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  //Customer data
  const renderDetailsSection = (item, index) => (
    <Paper className={headerClasses.tableContainer}>
      <TableContainer>
        <Table size="small">
          <TableBody>
            <TableRow className={headerClasses.tableRow}>
              <TableCell className={headerClasses.tableCell}>
                <Grid container alignItems="center">
                  <Box className={headerClasses.rowNumberBox}>
                    <Typography variant="body2">
                      {item?.O_STATUS !== "999" ? index + 1 : ""}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    className={headerClasses.boldText}
                  >
                    {t("Type")}:
                  </Typography>
                </Grid>
              </TableCell>
              <TableCell className={headerClasses.tableCell}>
                <Typography variant="body2">
                  {item?.J_TYPE_DESC ?? ""}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow className={headerClasses.tableRow}>
              <TableCell className={headerClasses.tableCell}>
                <Typography variant="body2" className={headerClasses.boldText}>
                  {t("Account_Name")}:
                </Typography>
              </TableCell>
              <TableCell className={headerClasses.tableCell}>
                <Typography variant="body2">
                  {item?.REF_PER_NAME ?? ""}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow className={headerClasses.tableRow}>
              <TableCell colSpan={2} className={headerClasses.tableCell}>
                <Box display="flex" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Typography className={headerClasses.boldText}>
                      {t("LimitFrom")}:
                    </Typography>
                    <Typography variant="body2" sx={{ marginLeft: 3 }}>
                      {parseFloat(item?.FROM_LIMIT || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ marginLeft: 4 }}
                  >
                    <Typography className={headerClasses.boldText}>
                      {t("To")}:
                    </Typography>
                    <Typography variant="body2" sx={{ marginLeft: 1 }}>
                      {parseFloat(item?.TO_LIMIT || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
            {[
              { label: t("CustID"), value: item?.CUSTOMER_ID ?? "" },
              { label: t("CustName"), value: item?.ACCT_NM ?? "" },
              { label: t("ScanBy"), value: item?.ENTERED_BY ?? "" },
              {
                label: t("ScanDate"),
                value: item?.MODIFIED_DATE
                  ? format(new Date(item?.MODIFIED_DATE), "dd/MM/yyyy")
                  : "",
              },
              { label: t("VerifiedBy"), value: item?.VERIFIED_BY ?? "" },
            ]?.map((row, index) => (
              <TableRow key={index} className={headerClasses.tableRow}>
                <TableCell className={headerClasses.tableCell}>
                  <Typography
                    variant="body2"
                    className={headerClasses.boldText}
                  >
                    {row.label}:
                  </Typography>
                </TableCell>
                <TableCell className={headerClasses.tableCell}>
                  <Typography variant="body2">{row.value}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {item?.HISTORY_BUTTON === "Y" && (
        <Box display="flex" justifyContent="flex-end" width="100%">
          <GradientButton
            onClick={() => {
              getPhotoSignHistory?.mutate({
                COMP_CD: authState?.companyID ?? "",
                CUSTOMER_ID: item?.CUSTOMER_ID ?? "",
              });
              setIsHistoryGridVisible(true);
            }}
          >
            {t("History")}
          </GradientButton>
        </Box>
      )}
    </Paper>
  );

  // Set the header title for the grid, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    PhotoSignHistoryMetadata.gridConfig.gridLabel = `Photo/Signature History for Customer ID: ${
      getPhotoSignHistory?.data?.[0]?.CUSTOMER_ID?.trim() ?? ""
    } || Customer Name: ${
      getPhotoSignHistory?.data?.[0]?.CUST_NM?.trim() ?? ""
    }`;
    return PhotoSignHistoryMetadata;
  }, [
    getPhotoSignHistory?.data?.[0]?.CUSTOMER_ID,
    getPhotoSignHistory?.data?.[0]?.CUST_NM,
  ]);

  return (
    <>
      <Dialog
        fullWidth
        open={true}
        className="photoSign"
        PaperComponent={PaperComponent}
        id="draggable-dialog-title"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
        }}
        key="photoSignDialog"
        PaperProps={{
          style: {
            overflow: "auto",
            maxWidth: "80%",
          },
        }}
      >
        <div id="draggable-dialog-title" style={{ cursor: "move" }}>
          {isLatestDtlLoading ? (
            <LoaderPaperComponent
              color="secondary"
              size={30}
              sx={{ marginRight: "8px" }}
              variant="indeterminate"
            />
          ) : (
            <>
              <AppBar
                className="form__header"
                position="relative"
                color="secondary"
                sx={{
                  padding: "0 8px",
                  backgroundColor: "var(--theme-color2)",
                  boxShadow: "none",
                }}
              >
                <Toolbar className={headerClasses.root} variant={"dense"}>
                  <Typography
                    className={headerClasses.title}
                    color="inherit"
                    variant={"h4"}
                    component="div"
                  >
                    {LatestPhotoSignData?.[0]?.TITLE || ""}
                  </Typography>
                  {Boolean(LatestPhotoSignData?.[0]?.BT_NAME) ? (
                    <GradientButton
                      onClick={() => {
                        setAcCustLevel(
                          LatestPhotoSignData?.[0]?.AC_CUST_LEVEL || null
                        );
                      }}
                    >
                      {LatestPhotoSignData?.[0]?.BT_NAME || ""}
                    </GradientButton>
                  ) : null}
                  {!(
                    LatestPhotoSignData?.length ===
                    LatestPhotoSignData?.filter(
                      (item) => item?.ROW_VISIBLE === "Y"
                    ).length
                  ) ? (
                    <GradientButton
                      onClick={() => {
                        showAll ? setShowAll(false) : setShowAll(true);
                        LatestDtlRefetch();
                      }}
                    >
                      {showAll ? t("Back") : t("ViewAll")}
                    </GradientButton>
                  ) : null}
                  <GradientButton
                    onClick={() => {
                      localStorage.removeItem("commonClass");
                      onClose();
                    }}
                  >
                    {t("Close")}
                  </GradientButton>
                </Toolbar>
              </AppBar>

              {isLatestDtlError && (
                <Alert
                  severity="error"
                  errorMsg={
                    LatestDtlError?.error_msg ?? t("Somethingwenttowrong")
                  }
                  errorDetail={LatestDtlError?.error_detail ?? ""}
                  color="error"
                />
              )}
              <Grid
                sx={{
                  overflow: "auto",
                  width: "100%",
                }}
              >
                {LatestPhotoSignData?.filter(
                  (item) => showAll || item?.ROW_VISIBLE === "Y"
                )?.map((item, index) => (
                  <Box className={headerClasses.contentContainer} key={index}>
                    {item?.O_STATUS !== "999"
                      ? renderDetailsSection(item, index)
                      : null}
                    {renderImageSection(
                      item,
                      t("CardPhotoImage"),
                      "ACCT_PHOTO",
                      "Photo Image"
                    )}
                    {renderImageSection(
                      item,
                      t("SignatureImage"),
                      "ACCT_SIGN",
                      "Signature Image"
                    )}
                  </Box>
                ))}
              </Grid>
            </>
          )}
        </div>
      </Dialog>

      {/* Open Photo/Sign image Canvas */}
      <Dialog
        open={isImgPhotoOpen}
        PaperComponent={PaperComponent}
        onClose={() => {
          setIsImagePhotoOpen(false);
          localStorage.removeItem("commonClass");
        }}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="lg"
      >
        <div id="draggable-dialog-title" style={{ cursor: "move" }}>
          <CanvasImageViewer
            imageUrl={selectedImageUrl}
            isOpen={isImgPhotoOpen}
            onClose={() => setIsImagePhotoOpen(false)}
            data={
              openGridPhotoSign
                ? {
                    CUSTOMER_ID: rowData?.CUSTOMER_ID ?? "",
                    CUST_NM: rowData?.CUST_NM ?? "",
                  }
                : {
                    CUSTOMER_ID: LatestPhotoSignData?.[0]?.CUSTOMER_ID ?? "",
                    CUST_NM: LatestPhotoSignData?.[0]?.ACCT_NM ?? "",
                  }
            }
            headerContent={`Photo/Signature History for Customer ID: ${
              openGridPhotoSign
                ? rowData?.CUSTOMER_ID?.trim()
                : LatestPhotoSignData?.[0]?.CUSTOMER_ID ?? ""
            } || Customer Name: ${
              openGridPhotoSign
                ? rowData?.CUST_NM?.trim()
                : LatestPhotoSignData?.[0]?.ACCT_NM ?? ""
            }`}
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
              >
                {`Photo/Signature History for Customer ID: ${
                  openGridPhotoSign
                    ? rowData?.CUSTOMER_ID?.trim()
                    : LatestPhotoSignData?.[0]?.CUSTOMER_ID?.trim() ?? ""
                } || Customer Name: ${
                  openGridPhotoSign
                    ? rowData?.CUST_NM?.trim()
                    : LatestPhotoSignData?.[0]?.ACCT_NM?.trim() ?? ""
                }`}
              </Typography>
            }
          />
        </div>
      </Dialog>

      {/* Open Photo/Sign History Grid */}
      {isHistoryGridVisible ? (
        <>
          <Dialog
            fullWidth
            maxWidth="lg"
            open={true}
            onKeyUp={(event) => {
              if (event.key === "Escape") {
                onClose();
              }
            }}
            key="rtgsConfirmDialog"
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
          >
            <div id="draggable-dialog-title" style={{ cursor: "move" }}>
              <GridWrapper
                key={`photoSignHistoryGrid` + getPhotoSignHistory?.data}
                finalMetaData={memoizedMetadata as GridMetaDataType}
                data={getPhotoSignHistory?.data ?? []}
                setData={() => null}
                loading={getPhotoSignHistory?.isLoading}
                actions={actions}
                setAction={setCurrentAction}
                // refetchData={() => assetDTLRefetch()}
              />
            </div>
          </Dialog>
        </>
      ) : null}

      {openGridPhotoSign ? (
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
            appBarTitle={`Photo/Signature History for Customer ID: ${
              rowData?.CUSTOMER_ID?.trim() ?? ""
            } || Customer Name: ${rowData?.CUST_NM?.trim() ?? ""}`}
            closeButtonText="Close"
            noImageMessage={noImageMessage}
          />
        </Dialog>
      ) : null}
    </>
  );
};

export default PhotoSignWithHistory;
