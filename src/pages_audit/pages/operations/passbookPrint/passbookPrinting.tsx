import {
  Alert,
  FormWrapper,
  GradientButton,
  InitialValuesType,
  MetaDataType,
  queryClient,
  SubmitFnType,
  Transition,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RetrieveIcon from "assets/icons/retrieveIcon";
import { useEnter } from "components/custom/useEnter";
import { getdocCD } from "components/utilFunction/function";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { PassbookPrintingInq } from "./passbookMetadata";

type PassbookPrintingCustomProps = {
  screenFlag?: any;
  PassbookPrintingData?: any;
  parameterFlagDate?: any;
  acctInqDetail?: any;
  handleClose?: any;
  onClose?: any;
};

export const PassbookPrint: React.FC<PassbookPrintingCustomProps> = ({
  screenFlag,
  PassbookPrintingData,
  parameterFlagDate,
  acctInqDetail,
  handleClose,
  onClose,
}) => {
  const [passbookDetail, setPassbookDetail] = useState<any>([]);
  const parameterRef = useRef<any>(null);
  const accountFromDateRef = useRef<any>();
  const printRef = useRef<any>(null);
  const divRef = useRef<any>(null);
  const [findAccount, setFindAccount] = useState(true);
  const [isPrinting, setIsPrinting] = useState<any>(false);
  const [disableButton, setDisableButton] = useState(false);
  const themes = useTheme();
  const fullScreen = useMediaQuery(themes.breakpoints.down("xs"));
  const [entriesToPrint, setEntriesToPrint] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState<any>();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [enterClassName, setEnterClassName] = useState<any>("MAIN");
  const [displayLoader, setDisplayLoader] = useState(false);
  useEnter(`${enterClassName}`);

  // Sett screenFlag data
  useEffect(() => {
    if (screenFlag && parameterFlagDate) {
      setPassbookDetail(PassbookPrintingData ?? []);
      accountFromDateRef.current = acctInqDetail ?? "";
      parameterRef.current = parameterFlagDate ?? "";
    }
  }, [screenFlag, parameterFlagDate, acctInqDetail, PassbookPrintingData]);
  useEffect(() => {
    if (!screenFlag) parameterRef.current = {};
  }, []);
  // Found maximum Page number
  const maxPage = Math.max(
    ...passbookDetail?.map((entry: any) => parseInt(entry?.PAGE_NO ?? "0"))
  );

  // Get passbook details
  const passbookInqData: any = useMutation(
    "getPassbookStatement",
    API.getPassbookStatement,
    {
      onSuccess: async (data) => {
        setPassbookDetail(data);
        setFindAccount(false);
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // Validate passbook account details
  const passbookValidation: any = useMutation(
    "passbookPrintingValidation",
    API.passbookPrintingValidation,
    {
      onSuccess: async (data: any) => {
        if (data?.[0]?.O_STATUS === "999") {
          const btnName = await MessageBox({
            messageTitle: "ValidationFailed",
            message: data?.[0]?.O_MESSAGE,
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else if (data?.[0]?.O_STATUS === "0") {
          passbookInqData?.mutate({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
            ENTERED_BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
            FROM_DT: parameterRef?.current?.PASS_BOOK_DT ?? "",
            TO_DT: parameterRef?.current?.PASS_BOOK_TO_DT ?? "",
            PRINT_PAGE: parameterRef?.current?.PID_DESCRIPION ?? "",
            TEMPL_TRAN_CD: parameterRef?.current?.TRAN_CD ?? "",
            LAST_LINE_NO: parameterRef?.current?.PASS_BOOK_LINE ?? "",
            REPRINT: parameterRef?.current?.REPRINT_VALUE ?? "",
          });
        }
        CloseMessageBox();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // Api for passbook printing completed
  const passbookPrintingCompleted: any = useMutation(
    "passbookPrintingCompleted",
    API.passbookPrintingCompleted,
    {
      onSuccess: async (data) => {
        const getButtonName = async (obj) => {
          let btnName = await MessageBox(obj);
          return { btnName, obj };
        };
        for (let i = 0; i < data.length; i++) {
          if (data[i]?.O_STATUS === "999") {
            await getButtonName({
              messageTitle: data[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (
            data[i]?.O_STATUS === "99" &&
            data[i]?.O_COLUMN_NM === "DUPLICATE_PASS"
          ) {
            const { btnName } = await getButtonName({
              messageTitle: data[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data[i]?.O_MESSAGE,
              icon: "CONFIRM",
              buttonNames: ["Duplicate", "Reprint"],
              loadingBtnName: ["Duplicate", "Reprint"],
            });
            const DUP_FLAG = btnName === "Reprint" ? "N" : "Y";
            const req_para = {
              SCREEN_REF: "RPT/430",
              A_PRINT_DTL: {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
                ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
                ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
                DUP_FLAG,
                PASSBOOK_DT: format(
                  new Date(parameterRef?.current?.PASS_BOOK_DT),
                  "dd/MMM/yyyy"
                ),
                USERNAME: authState?.user?.id ?? "",
                MAIN_TRN_TRAN_CD: passbookDetail?.[0]?.MAIN_TRN_TRAN_CD ?? "",
                LASTPASSBOOK_DT: format(
                  new Date(accountFromDateRef?.current?.PASS_BOOK_DT ?? ""),
                  "dd/MMM/yyyy"
                ),
                TRN_FLAG: data?.[i]?.TRN_FLAG ?? "",
                SR_CD: data?.[i]?.SR_CD ?? "",
                PASS_BOOK_LINE:
                  passbookDetail[passbookDetail?.length - 1]?.LINE_ID ?? "",
                LINE_PER_PAGE: parameterRef?.current?.LINE_PER_PAGE ?? "",
                DEFAULT_LINE: parameterRef?.current?.HIDDEN_DEFAULT_LINE ?? "",
              },
            };
            passbookPrintingCompleted?.mutate(req_para);
          } else if (data[i]?.O_STATUS === "9") {
            await getButtonName({
              messageTitle: data[i]?.O_MSG_TITLE ?? "Alert",
              message: data[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data[i]?.O_STATUS === "0") {
            if (!screenFlag) {
              setFindAccount(true);
            } else {
              handleClose(false);
            }
          }

          setPassbookDetail([]);
          CloseMessageBox();
        }
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );

  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);
    parameterRef.current = data;
    passbookValidation?.mutate({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
      ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
      ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
      TRAN_CD: parameterRef?.current?.TRAN_CD ?? "",
      FLAG: data?.PID_DESCRIPION ?? "",
      LINE_ID: data?.PASS_BOOK_LINE ?? "",
      LINE_PER_PAGE: data?.LINE_PER_PAGE ?? "",
      FROM_DT: (parameterRef.current["PASS_BOOK_DT"] = format(
        new Date(parameterRef?.current["PASS_BOOK_DT"]),
        "dd/MMM/yyyy"
      )),
      GD_DATE: (parameterRef.current["PASS_BOOK_TO_DT"] = format(
        new Date(parameterRef?.current["PASS_BOOK_TO_DT"]),
        "dd/MMM/yyyy"
      )),
      SCREEN_REF: docCD ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
    });
  };
  // Print the passbook details
  const handlePrintPage = useReactToPrint({
    content: () => printRef.current,
    copyStyles: false,
    onAfterPrint: async () => {
      setIsPrinting(true);
      if (currentPage !== maxPage) {
        const btnName = await MessageBox({
          messageTitle: "Confirmation",
          message: "NextPageAlert",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          setCurrentPage(currentPage + 1);
        }
        if (btnName === "No") {
          setCurrentPage(currentPage);
        }
      }

      if (currentPage === maxPage) {
        // setEntriesToPrint([]);
        setIsPrinting(false);
        setCurrentPage(1);
        if (parameterRef?.current?.PID_DESCRIPION === "D") {
          const btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: "PassbookPrintsuccessfully",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });

          if (btnName === "Yes") {
            passbookPrintingCompleted?.mutate({
              SCREEN_REF: "RPT/430",
              A_PRINT_DTL: {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
                ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
                ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
                DUP_FLAG: "N",
                PASSBOOK_DT:
                  format(
                    new Date(parameterRef?.current?.PASS_BOOK_DT),
                    "dd/MMM/yyyy"
                  ) ?? "",
                USERNAME: authState?.user?.id ?? "",
                MAIN_TRN_TRAN_CD: passbookDetail?.[0]?.MAIN_TRN_TRAN_CD ?? "",
                LASTPASSBOOK_DT:
                  format(
                    new Date(accountFromDateRef?.current?.PASS_BOOK_DT ?? ""),
                    "dd/MMM/yyyy"
                  ) ?? "",
                TRN_FLAG: "",
                SR_CD: "",
                PASS_BOOK_LINE:
                  passbookDetail[passbookDetail?.length - 1]?.LINE_ID ?? "",
                LINE_PER_PAGE: parameterRef?.current?.LINE_PER_PAGE ?? "",
                DEFAULT_LINE: parameterRef?.current?.HIDDEN_DEFAULT_LINE ?? "",
              },
            });
          }
        }
      }
    },
    pageStyle: `
      @font-face {
        font-family: 'CIDFont_F1';
        src: url('/extracted-0-CIDFont_F1.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
     
      @media print {
        body { margin: 0; background: white; }
 
        @page {
          margin: 0px;
           padding: ${
             parameterRef?.current?.PID_DESCRIPION === "A"
               ? "23px 0px 0px 20px"
               : parameterRef?.current?.PID_DESCRIPION === "F"
               ? "23px 0px 0px 15px"
               : parameterRef?.current?.PID_DESCRIPION === "D"
               ? "15px 0px 0px 15px"
               : "2px 0px 0px 2px"
           };
        }
      }
    `,
    onBeforeGetContent: async () => {
      const font = new FontFace(
        "CIDFont_F1",
        "url(/extracted-0-CIDFont_F1.ttf)"
      );
      await font.load();
      document.fonts.add(font);
    },
  });

  // Update the printing data page by page
  const updateEntriesToPrint = (page) => {
    const filteredEntries = passbookDetail?.filter(
      (entry: any) => entry?.PAGE_NO === page?.toString()
    );
    setEntriesToPrint(filteredEntries);
  };

  // Upadte passbook priniting page number
  useEffect(() => {
    if (currentPage !== lastPage) {
      updateEntriesToPrint(currentPage);
      setLastPage(currentPage);
    }
  }, [currentPage, passbookDetail, lastPage, MessageBox]);

  // Clear cache
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPassbookStatement"]);
      queryClient.removeQueries(["passbookPrintingCompleted"]);
      queryClient.removeQueries(["getAcctInqStatement"]);
      queryClient.removeQueries(["passbookPrintingValidation"]);
    };
  }, []);

  // Logic for print page dialog details
  useEffect(() => {
    if (
      (passbookDetail?.[0]?.LINE_ID !== "0" ||
        passbookDetail?.[0]?.PAGE_NO !== "0") &&
      passbookDetail?.length > 0
    ) {
      setIsPrinting(true);
      setEnterClassName("PRINT");
      setCurrentPage(1);
      updateEntriesToPrint(1);
    } else {
      setIsPrinting(false);
      setEnterClassName("PRINT");
      setCurrentPage(0);
      updateEntriesToPrint(0);
    }
  }, [passbookDetail]);

  const handleRetrieve = () => {
    setEnterClassName("MAIN");
    setFindAccount(true);
    setPassbookDetail([]);
  };
  const handlePrint = () => {
    setIsPrinting(true);
    setEnterClassName("PRINT");
    setCurrentPage(1);
    updateEntriesToPrint(1);
  };
  const handleButonDisable = (disable) => {
    setDisableButton(disable);
  };
  const handleDisplayLoader = (disable) => {
    setDisplayLoader(disable);
  };
  const closeAll = () => {
    handleClose(false);
    onClose();
  };

  const fontFamilyPassBook = useMemo(() => {
    return isPrinting && passbookDetail?.[0]
      ? GeneralAPI.getCssForFont(passbookDetail?.[0])
      : GeneralAPI.getCssForFont("");
  }, [isPrinting, passbookDetail]);

  return (
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
              currentPath,
              authState?.menulistdata,
              true
            )}
          </Typography>
          {(passbookDetail?.[0]?.LINE_ID !== "0" ||
            passbookDetail?.[0]?.PAGE_NO !== "0") &&
          passbookDetail?.length > 0 ? (
            <Tooltip title={t("Print")}>
              <GradientButton
                onClick={handlePrint}
                color={"primary"}
                endicon="Print"
                rotateIcon="scale(1.4) rotateY(360deg)"
              >
                {t("Print")}
              </GradientButton>
            </Tooltip>
          ) : null}
          {Boolean(screenFlag) ? (
            <Tooltip title={t("Close")}>
              <GradientButton
                onClick={closeAll}
                color={"primary"}
                endicon="CancelOutlined"
                rotateIcon="scale(1.4) rotateY(360deg)"
              >
                {t("Close")}
              </GradientButton>
            </Tooltip>
          ) : null}
          {!Boolean(screenFlag) ? (
            <Tooltip title={t("Retrieve")}>
              <GradientButton onClick={handleRetrieve} color={"primary"}>
                {t("Retrieve")}
                <RetrieveIcon />
              </GradientButton>
            </Tooltip>
          ) : null}
        </Toolbar>
      </AppBar>

      {/* Find passbook details */}
      {findAccount && !Boolean(screenFlag) && (
        <Dialog
          open={findAccount}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setFindAccount(false);
              setEnterClassName("PRINT_DTL");
            }
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
              position: "relative",
            },
          }}
          maxWidth="md"
          className="MAIN"
        >
          {(passbookValidation?.error || passbookInqData?.error) && (
            <Alert
              severity="error"
              errorMsg={
                passbookValidation?.error?.error_msg ||
                passbookInqData?.error?.error_msg ||
                t("Somethingwenttowrong")
              }
              errorDetail={
                passbookValidation?.error?.error_detail ||
                passbookInqData?.error?.error_detail ||
                ""
              }
              color="error"
            />
          )}
          <FormWrapper
            key={`PassbookPrintingInqForm`}
            metaData={PassbookPrintingInq as MetaDataType}
            initialValues={
              parameterRef?.current?.PID_DESCRIPION === "F" ||
              parameterRef?.current?.PID_DESCRIPION === "A"
                ? {
                    ...parameterRef?.current,
                    BRANCH_CD: parameterRef?.current?.BRANCH_CD
                      ? parameterRef?.current?.BRANCH_CD
                      : authState?.user?.branchCode ?? "",
                  }
                : ({} as InitialValuesType)
            }
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            controlsAtBottom={true}
            formState={{
              handleButonDisable: handleButonDisable,
              handleDisplayLoader,
              MessageBox: MessageBox,
              divRef,
              displayLoader,
              docCD: docCD,
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "ACCT_TYPE",
                  BRANCH_CD: "BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            setDataOnFieldChange={(action, payload) => {
              if (action === "accountFromDate") {
                accountFromDateRef.current = payload;
              }
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  style={{ marginRight: "5px" }}
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  color={"primary"}
                  disabled={
                    passbookInqData?.isLoading ||
                    passbookInqData?.isFetching ||
                    passbookValidation?.isLoading ||
                    passbookValidation?.isFetching ||
                    disableButton
                  }
                  endicon={
                    passbookInqData?.isLoading ||
                    passbookInqData?.isFetching ||
                    passbookValidation?.isLoading ||
                    passbookValidation?.isFetching
                      ? undefined
                      : "CheckCircleOutline"
                  }
                  rotateIcon="scale(1.4)"
                >
                  {passbookValidation?.isLoading ||
                  passbookInqData?.isLoading ? (
                    <CircularProgress size={25} thickness={4.6} />
                  ) : (
                    t("Ok")
                  )}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    setFindAccount(false);
                    setEnterClassName("PRINT_DTL");
                    parameterRef.current = {};
                  }}
                  color={"primary"}
                  endicon="CancelOutlined"
                  rotateIcon="scale(1.4) rotateY(360deg)"
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
          <div
            ref={divRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 999,
              display: "none",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={50} thickness={4} />
          </div>
        </Dialog>
      )}

      {/* Display/View passbook details */}
      {passbookDetail &&
      Array.isArray(passbookDetail) &&
      passbookDetail?.length > 0 ? (
        <>
          <div
            style={{
              display: "flex",
              minHeight: "50vh",
              minWidth: "100%",
            }}
          >
            <Box
              sx={{
                padding: "10px",
                border: "2px solid var(--theme-color3)",
                borderRadius: "8px",
                margin: "0px auto",
                overflowX: "auto",
              }}
            >
              <pre
                ref={printRef}
                style={{
                  ...fontFamilyPassBook,
                }}
              >
                {passbookDetail
                  ?.map((entry: any) => entry?.PASSBOOK_TEXT ?? "")
                  ?.join?.("\n")}
              </pre>
            </Box>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            fontStyle: "italic",
            fontWeight: "bold",
            color: "rgba(133, 130, 130, 0.8)",
          }}
        >
          {t("NoDataFound")}
        </div>
      )}

      {/* Print Passbook details */}
      {isPrinting ? (
        <Dialog
          open={isPrinting}
          // @ts-ignore
          TransitionComponent={Transition}
          fullScreen={fullScreen}
          maxWidth="md"
          PaperProps={{
            style: {
              borderRadius: "8px",
              padding: "10px",
            },
          }}
          className="PRINT"
        >
          <Box
            ref={printRef}
            sx={{
              width: "100%",
              overflowY: "auto",
            }}
          >
            <pre
              ref={printRef}
              style={{
                ...fontFamilyPassBook,
              }}
            >
              {entriesToPrint
                ?.map((entry: any) => entry?.PASSBOOK_TEXT ?? "")
                ?.join?.("\n")}
            </pre>
          </Box>

          {currentPage <=
            Math.max(
              ...passbookDetail?.map((entry: any) => parseInt(entry?.PAGE_NO))
            ) && (
            <Box
              sx={{
                position: "sticky",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                paddingTop: "10px",
              }}
            >
              <GradientButton
                onClick={handlePrintPage}
                color={"primary"}
                endicon="Print"
                rotateIcon="scale(1.4) rotateY(360deg)"
                style={{ alignSelf: "center" }}
              >
                {t("Print")}
              </GradientButton>
              <GradientButton
                onClick={() => {
                  setIsPrinting(false);
                  setEnterClassName("PRINT_DTL");
                }}
                color={"primary"}
                style={{ alignSelf: "center" }}
              >
                {t("Cancel")}
              </GradientButton>
            </Box>
          )}
        </Dialog>
      ) : null}
    </>
  );
};
