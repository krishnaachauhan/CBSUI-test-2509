import {
  Collapse,
  Dialog,
  Grid,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Alert,
  LoaderPaperComponent,
  utilFunction,
} from "@acuteinfo/common-base";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import "jspdf-autotable";
import * as API from "./api";
import { useQuery } from "react-query";
import { GradientButton } from "@acuteinfo/common-base";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BackupTableIcon from "@mui/icons-material/BackupTable";
// import { ExcelForStatementExport } from "components/report/export/statementExcel";
import { AuthContext } from "pages_audit/auth";
import RetrieveIcon from "assets/icons/retrieveIcon";
import { ViewStatement } from "pages_audit/acct_Inquiry/viewStatement";
import SimpleType from "./simpleType";
import GridType from "./gridType";
import SimpleGridType from "./simpleGridType";
import Title from "./title";
// import ExportToPDF from "components/report/export/statementPdf";
import { format } from "date-fns";
import exportToPDF from "components/report/export/statementPdf";
import { ExcelForStatementExport } from "components/report/export/statementExcel";
import PrintIcon from "@mui/icons-material/Print";
import { isBase64 } from "components/utilFunction/function";
import { getImageData } from "pages_audit/auth/api";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import i18n from "components/multiLanguage/languagesConfiguration";

const AccountDetails = () => {
  const [open, setOpen] = useState(false);
  const [openViewStatement, setOpenViewStatement] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openBoxes, setOpenBoxes] = useState<any>([false]);
  const { authState, logout } = useContext(AuthContext);
  const rowsDataRef: any = useRef([]);
  const [bankLogo, setBankLogo] = useState<any | null>(null);
  const [bankLogoType, setBankLogoType] = useState<any>(null);
  const urlObj = useRef<any>(null);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  const {
    data: imageData,
    isLoading: imgIsLoading,
    isFetching: imgIsFetching,
  } = useQuery<any, any>(["getLoginImageData"], () => getImageData());

  useEffect(() => {
    document.title = "CBS - Statement";
    return () => {
      document.title = "CBS - Statement";
    };
  }, []);

  useEffect(() => {
    const dataString = sessionStorage.getItem("myData");
    if (dataString) {
      const rowsData = JSON.parse(dataString);
      rowsDataRef.current = rowsData;
    }
  }, []);

  useEffect(() => {
    const checkLocalStorage = () => {
      // Check if the key you're interested in is changed
      if (!sessionStorage.getItem("tokenchecksum")) {
        console.log("logout-due-to account details page");
        window.location.reload();
        logout();
      }
    };

    window.addEventListener("storage", checkLocalStorage);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("storage", checkLocalStorage);
    };
  }, [sessionStorage]);

  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["StatementDetailsData"],
    () =>
      API.StatementDetailsData({
        COMP_CD: authState?.companyID ?? "",
        ACCT_CD: rowsDataRef?.current?.FULL_ACCT_NO
          ? ""
          : rowsDataRef.current?.ACCT_CD ?? "",
        ACCT_TYPE: rowsDataRef?.current?.FULL_ACCT_NO
          ? ""
          : rowsDataRef.current?.ACCT_TYPE ?? "",
        BRANCH_CD: rowsDataRef?.current?.FULL_ACCT_NO
          ? ""
          : rowsDataRef.current?.BRANCH_CD ?? "",
        FULL_ACCT_NO: rowsDataRef?.current?.FULL_ACCT_NO
          ? rowsDataRef?.current?.FULL_ACCT_NO
          : "",
        FROM_DT: utilFunction.isValidDate(rowsDataRef.current?.STMT_FROM_DATE)
          ? format(
              new Date(rowsDataRef.current?.STMT_FROM_DATE),
              "dd-MMM-yyyy"
            ) ?? ""
          : format(new Date(), "dd-MMM-yyyy"),
        TO_DT: utilFunction.isValidDate(rowsDataRef.current?.WK_STMT_TO_DATE)
          ? format(
              new Date(rowsDataRef.current?.WK_STMT_TO_DATE),
              "dd-MMM-yyyy"
            ) ?? ""
          : format(new Date(), "dd-MMM-yyyy"),
        METADATA: "STMT",
        A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
        A_USER_NM: authState?.user?.id ?? "",
        A_GD_DATE: authState?.workingDate ?? "",
        A_USER_LEVEL: authState?.role ?? "",
        A_SCREEN_REF: docCD ?? "",
        A_LANG: i18n.resolvedLanguage,
      })
  );

  var branchData = data?.find((item) => item?.TITLE === "Branch Details");
  var barnchDtl = {
    branchName: "",
    branchAddress: "",
    ifscCode: "",
    branchPhoneNumber: "",
    bankName: "",
  };
  if (branchData) {
    branchData?.DETAILS?.forEach((detail) => {
      if (detail?.LABEL === "Branch Name") {
        barnchDtl.branchName = detail?.VALUE ?? "";
      } else if (detail?.LABEL === "Branch Address") {
        barnchDtl.branchAddress = detail?.VALUE ?? "";
      } else if (detail?.LABEL === "IFSC code") {
        barnchDtl.ifscCode = detail?.VALUE ?? "";
      } else if (detail?.LABEL === "Bank Name") {
        barnchDtl.bankName = detail?.VALUE ?? "";
      }
    });
  }

  let acctData = data?.find((item) => item?.TITLE === "Account Details");
  let acctDtl = {
    accountNumber: "",
    statementPeriod: "",
    customerName: "",
  };
  if (acctData) {
    acctData?.DETAILS?.forEach((detail) => {
      if (detail?.LABEL === "Account Number") {
        acctDtl.accountNumber = detail?.VALUE ?? "";
      } else if (detail?.LABEL === "Statement Period") {
        acctDtl.statementPeriod = detail?.VALUE ?? "";
      } else if (detail?.LABEL === "Customer Name") {
        acctDtl.customerName = detail?.VALUE ?? "";
      }
    });
  }

  const openPopover = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBoxToggle = (index) => {
    setOpenBoxes((prevOpenBoxes) => {
      const updatedOpenBoxes = [...prevOpenBoxes];
      updatedOpenBoxes[index] = !updatedOpenBoxes[index];
      return updatedOpenBoxes;
    });
  };

  const handleExpandAll = () => {
    setOpenBoxes((prevOpenBoxes) => prevOpenBoxes.map(() => true));
  };

  const handleCollapseAll = () => {
    setOpenBoxes((prevOpenBoxes) => prevOpenBoxes.map(() => false));
  };

  useEffect(() => {
    if (data) {
      const defaultOpenSections = data.map(
        (info) => info?.IS_DEFAULT_OPEN || false
      );
      setOpenBoxes(defaultOpenSections);
    }
  }, [data]);

  useEffect(() => {
    if (Boolean(imageData)) {
      const logoUrl = imageData?.[0]?.RPT_IMG;
      if (isBase64(logoUrl)) {
        let blob = utilFunction.base64toBlob(logoUrl);
        urlObj.current =
          typeof blob === "object" && Boolean(blob)
            ? URL.createObjectURL(blob)
            : "";
        setBankLogo(urlObj.current);
      } else {
        setBankLogo(logoUrl);
      }
      setBankLogoType(imageData?.[0]?.RPT_IMG_TYPE ?? "");
    }
  }, [imageData]);

  // useEffect(() => {
  //   if (data == null || undefined) {
  //     window.close();
  //   }
  // }, [data]);

  const companyName = authState?.user?.branch;
  const generatedBy = authState?.user?.id ?? "";
  const RequestingBranchCode = authState?.user?.branchCode ?? "";

  return (
    <Dialog fullScreen={true} open={true}>
      {isError || error ? (
        <Fragment>
          <div style={{ width: "100%", paddingTop: "10px" }}>
            <Alert
              severity={error?.severity ?? "error"}
              errorMsg={error?.error_msg ?? "Error"}
              errorDetail={error?.error_detail ?? ""}
            />
          </div>
        </Fragment>
      ) : null}
      <Grid
        container
        sx={{
          minHeight: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Grid
          item
          sx={{
            minHeight: "100vh",
            width: "90%",
            padding: "10px 0px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "Roboto, sans-serif",
              backgroundColor: "var(--theme-color3)",
              padding: "10px",
              textAlign: "center",
              marginBottom: "20px",
              color: "var(--theme-color2)",
              borderRadius: "10px",
              display: "flex",
              fontSize: "24px",
            }}
          >
            <Grid
              item
              xs={11}
              sm={11}
              md={11}
              lg={11}
              xl={11}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={
                openBoxes.every((value) => value === true)
                  ? handleCollapseAll
                  : handleExpandAll
              }
            >
              Account Statement{" "}
            </Grid>
            {isError || isLoading || isFetching || error ? null : (
              <Grid
                item
                xs={1}
                sm={1}
                md={1}
                lg={1}
                xl={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
              >
                {" "}
                <Tooltip title="Retrieve">
                  <IconButton
                    onClick={() => {
                      setOpenViewStatement(true);
                    }}
                  >
                    <RetrieveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton
                    onClick={() =>
                      exportToPDF(
                        data,
                        // companyName,
                        generatedBy,
                        RequestingBranchCode,
                        barnchDtl,
                        acctDtl,
                        true,
                        bankLogo,
                        bankLogoType
                      )
                    }
                  >
                    <PrintIcon sx={{ color: "var(--theme-color2)" }} />
                  </IconButton>
                </Tooltip>
                {openViewStatement && (
                  <ViewStatement
                    open={openViewStatement}
                    onClose={() => setOpenViewStatement(false)}
                    rowsData={null}
                    screenFlag={"STATEMENT"}
                    close={() => {}}
                  />
                )}
                <Tooltip title="Download">
                  <IconButton onClick={handleClick}>
                    <DownloadRoundedIcon
                      sx={{ color: "var(--theme-color2)" }}
                    />
                  </IconButton>
                </Tooltip>
                {/**/}
                {openBoxes.every((value) => value === true) ? (
                  <Tooltip title="Collapse All">
                    <IconButton
                      sx={{ color: "var(--theme-color2)" }}
                      onClick={handleCollapseAll}
                    >
                      <KeyboardDoubleArrowUpIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Expand All">
                    <IconButton
                      sx={{ color: "var(--theme-color2)" }}
                      onClick={handleExpandAll}
                    >
                      <KeyboardDoubleArrowDownIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {/**/}
                <Popover
                  id={id}
                  open={openPopover}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  // sx={styles.popover}
                  PaperProps={{
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      padding: "6px",
                    },
                  }}
                >
                  <GradientButton
                    onClick={() =>
                      exportToPDF(
                        data,
                        // companyName,
                        generatedBy,
                        RequestingBranchCode,
                        barnchDtl,
                        acctDtl,
                        false,
                        bankLogo,
                        bankLogoType
                      )
                    }
                    endIcon={<PictureAsPdfIcon />}
                  >
                    PDF
                  </GradientButton>
                  <GradientButton
                    onClick={() =>
                      ExcelForStatementExport({
                        data,
                        // companyName,
                        generatedBy,
                        RequestingBranchCode,
                        barnchDtl,
                        acctDtl,
                      })
                    }
                    endIcon={<BackupTableIcon />}
                  >
                    EXCEL
                  </GradientButton>
                </Popover>
              </Grid>
            )}
          </Typography>
          {isLoading || isFetching ? (
            <>
              <LoaderPaperComponent />
            </>
          ) : (
            data?.map((info, index) => (
              <>
                <Title
                  data={info}
                  index={index}
                  openBoxes={openBoxes}
                  handleBoxToggle={handleBoxToggle}
                />

                <Collapse
                  in={
                    openBoxes[index] ||
                    openBoxes.every((value) => value === true)
                  }
                >
                  {info.DISPLAY_TYPE === "simple" ? (
                    <SimpleType data={info} />
                  ) : info.DISPLAY_TYPE === "grid" ? (
                    <GridType data={info} />
                  ) : info.DISPLAY_TYPE === "simpleGrid" ? (
                    <SimpleGridType data={info} />
                  ) : null}
                </Collapse>
              </>
            ))
          )}
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default AccountDetails;
