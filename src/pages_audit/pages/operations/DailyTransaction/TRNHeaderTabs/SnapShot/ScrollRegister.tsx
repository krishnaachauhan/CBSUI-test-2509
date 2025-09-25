import {
  Alert,
  GradientButton,
  LoaderPaperComponent,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  Dialog,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { Box } from "@mui/system";
import { format, isValid, parse } from "date-fns";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { useReactToPrint } from "react-to-print";
import { getHeaderDTL } from "../../TRN001/DateRetrival/api";
import { getDailyScrollRegister } from "./api";
import { AuthContext } from "pages_audit/auth";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    typoStyle: {
      fontWeight: "bold",
      fontSize: "14px",
    },
    headerRoot: {
      background: "var(--theme-color5)",
    },
  })
);

const ScrollRegisterReport = ({ rowData, handleClose, openReport }) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const [scrollRegisterData, setScrollRegisterData] = useState<any>([]);
  const [headingDtl, setHeadingDtl] = useState<any>([]);
  const printRef = useRef<any>(null);
  const classes = useStyles();
  const { t } = useTranslation();
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [creditCount, setCreditCount] = useState(0);
  const [debitCount, setDebitCount] = useState(0);
  const enteredDate = scrollRegisterData?.[0]?.ENTERED_DATE
    ? parse(
        scrollRegisterData?.[0]?.ENTERED_DATE,
        "yyyy-MM-dd HH:mm:ss.S",
        new Date()
      )
    : null;

  const { isLoading, isFetching } = useQuery<any, any>(
    ["getHeaderDTL", rowData?.index],
    () =>
      getHeaderDTL({
        SCREEN_REF: rowData?.docCD ?? "",
      }),
    {
      onSuccess: (data) => {
        setHeadingDtl(data?.[0]);
      },
      onError: async (error: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
      },
    }
  );
  const {
    isLoading: ScrollRegisterDtlisLoading,
    isFetching: ScrollRegisterDtlisFetching,
  } = useQuery<any, any>(
    ["getDailyScrollRegisterDtl", rowData?.index],
    () =>
      getDailyScrollRegister({
        COMP_CD: rowData?.COMP_CD ?? "",
        BRANCH_CD: rowData?.ENTERED_BRANCH_CD ?? "",
        TO_DT: rowData?.TRN_DATE
          ? format(new Date(rowData?.TRN_DATE), "dd/MMM/yyyy")
          : "",
        SCROLL1: rowData?.SCROLL1 ?? "",
        AS_FLAG: rowData?.TYPE_CD ?? "",
      }),
    {
      onSuccess: (data) => {
        setScrollRegisterData(data);
      },
      onError: async (error: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
      },
    }
  );

  useEffect(() => {
    if (scrollRegisterData) {
      const totals = scrollRegisterData.reduce(
        (acc, item) => {
          const credit = parseFloat(item?.CREDIT || 0);
          const debit = parseFloat(item?.DEBIT || 0);

          acc.totalCredit += credit;
          acc.totalDebit += debit;
          if (parseInt(item?.TYPE_CD?.trim()) < 4) acc.creditCount += 1;
          if (parseInt(item?.TYPE_CD?.trim()) > 3) acc.debitCount += 1;
          return acc;
        },
        { totalCredit: 0, totalDebit: 0, creditCount: 0, debitCount: 0 }
      );

      setTotalCredit(totals?.totalCredit.toFixed(2));
      setTotalDebit(totals?.totalDebit.toFixed(2));
      setCreditCount(totals?.creditCount);
      setDebitCount(totals?.debitCount);
    }
  }, [scrollRegisterData]);

  const handlePrintPage = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDailyScrollRegisterDtl", rowData?.index]);
      queryClient.removeQueries(["getHeaderDTL", rowData?.index]);
    };
  }, []);

  return (
    <>
      <Dialog
        open={openReport}
        onKeyUp={(event) => {
          if (event.key === "Escape") handleClose();
        }}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        {isLoading ||
        isFetching ||
        ScrollRegisterDtlisFetching ||
        ScrollRegisterDtlisLoading ? (
          <LoaderPaperComponent />
        ) : (
          <Box
            ref={printRef}
            sx={{
              margin: "20px",
              overflow: "auto",

              "@media print": {
                // width: "356mm",
                margin: "5px",
                pageBreakBefore: "always",
                overflow: "hidden",
                pageBreakInside: "auto",
              },
            }}
          >
            {/* Display header */}
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                verticalAlign: "middle",
                alignItems: "center",
              }}
            >
              {headingDtl?.RPT_IMG ? (
                <Box
                  sx={{
                    width: "6%",
                  }}
                >
                  <img
                    src={URL.createObjectURL(
                      utilFunction?.base64toBlob(headingDtl?.RPT_IMG ?? "")
                    )}
                    alt="Report Image"
                  />
                </Box>
              ) : null}
              <Box
                sx={{
                  width: "94%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  paddingLeft: "5px",
                }}
              >
                <Typography className={classes?.typoStyle}>
                  {headingDtl?.LINE1 ?? ""}
                </Typography>
                <Typography className={classes?.typoStyle}>
                  {headingDtl?.LINE2 ?? ""}
                </Typography>
                <Divider sx={{ border: "1px dashed black" }} />
                <Box>
                  <pre
                    className={classes?.typoStyle}
                    style={{ textAlign: "right" }}
                  >
                    {headingDtl?.LINE3_P2 ?? ""}
                  </pre>
                </Box>
              </Box>
            </Box>
            <pre className={classes?.typoStyle}>
              {`Transaction Detail of Scroll :${rowData?.SCROLL1} and Date : ${
                enteredDate && isValid(enteredDate)
                  ? format(enteredDate, "dd/MM/yyyy EEEE")
                  : ""
              }`}
            </pre>

            {/* Display Interest details in table */}
            <Box>
              <TableContainer>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow sx={{ padding: "0 !important" }}>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {t("Accountholder")}
                        </pre>
                        <pre className={classes?.typoStyle}>
                          {t("Narration")}
                        </pre>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          // width: "17%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {t("ChequeNo")}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          // width: "15%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>{t("Credit")}</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          // width: "10%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>{t("Debit")}</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          // width: "19%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {t("VoucherNo")}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          // width: "19%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {t("TrBranch")}
                        </pre>
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          // width: "19%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {t("EntryDate")}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          // width: "19%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>{t("Maker")}</pre>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          // width: "19%",
                          padding: "0 5px !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {t("CheckerDetails")}
                        </pre>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scrollRegisterData?.map((row: any) => (
                      <TableRow
                        key={row?.name}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                            padding: "0 5px !important",
                          },
                        }}
                      >
                        <TableCell
                          align="left"
                          sx={{
                            padding: "0 5px !important",
                            borderBottom: "none !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.AC_HOLDER_DISP}</pre>
                          <pre>{row?.REMARKS}</pre>
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.CHEQUE_NO}</pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{parseFloat(row?.CREDIT).toFixed(2)}</pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{parseFloat(row?.DEBIT).toFixed(2)}</pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.REF_TRAN_CD}</pre>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.ENTERED_BRANCH_CD}</pre>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.ENTERED_DATE}</pre>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.ENTERED_BY}</pre>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 5px !important",
                            verticalAlign: "top",
                          }}
                        >
                          <pre>{row?.VERIFIED_BY}</pre>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Display Total in row */}
                    <TableRow
                      sx={{
                        borderTop: "1px dashed black !important",
                        borderBottom: "1px dashed black !important",
                      }}
                    >
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 5px !important",
                          verticalAlign: "bottom",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {totalCredit !== totalDebit
                            ? `<-----Scroll ${rowData?.SCROLL1} not Tally----->`
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 5px !important",
                          verticalAlign: "top",
                        }}
                      >
                        <pre
                          className={classes?.typoStyle}
                        >{`Scroll No.:${rowData?.SCROLL1}`}</pre>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 5px !important",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {`${totalCredit}`}
                        </pre>
                        <pre className={classes?.typoStyle}>
                          {`${creditCount}`}
                        </pre>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 5px !important",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {`${totalDebit}`}
                        </pre>
                        <pre className={classes?.typoStyle}>
                          {`${debitCount}`}
                        </pre>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 5px !important",
                          verticalAlign: "bottom",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {totalCredit !== totalDebit
                            ? `${(totalCredit - totalDebit).toFixed(2)}`
                            : ""}
                        </pre>
                        <pre className={classes?.typoStyle}>
                          {`${creditCount + debitCount}`}
                        </pre>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box>
              <pre>{headingDtl?.SUMMARY_USER_NAME}</pre>
              <pre>{headingDtl?.SUMMARY_REMARK}</pre>
            </Box>
          </Box>
        )}
        <DialogActions>
          <GradientButton onClick={() => handlePrintPage()}>
            {t("Print")}
          </GradientButton>

          <GradientButton onClick={() => handleClose()}>
            {t("Close")}
          </GradientButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScrollRegisterReport;
