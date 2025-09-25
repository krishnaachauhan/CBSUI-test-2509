import {
  ClearCacheProvider,
  GradientButton,
  LoaderPaperComponent,
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
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import { Fragment } from "react/jsx-runtime";
import * as API from "./api";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useDialogContext } from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";

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

const SingleAccountInterestCustom = ({
  closeDialog,
  open,
  date,
  reportHeading,
  reportDetail,
  acctInfo,
  isLoader,
}) => {
  const classes = useStyles();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const printRef = useRef<any>(null);
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  useEffect(() => {
    trackDialogClass("Report");
  }, [open]);
  const applyAccountInt = useMutation(API.applyAccountInt, {
    onSuccess: async (data: any, variables: any) => {
      for (let i = 0; i < data?.length; i++) {
        if (data?.[i]?.O_STATUS === "999") {
          const btnName = await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[i]?.O_MESSAGE ?? "",
            icon: "ERROR",
          });
        } else if (data?.[i]?.O_STATUS === "99") {
          const btnName = await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[i]?.O_MESSAGE ?? "",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (btnName === "No") {
            const btnName = await MessageBox({
              messageTitle: "Failed",
              message: "InterestAppliedRevertBackFailed",
              buttonNames: ["Ok"],
            });
            if (btnName === "Ok") {
              break;
            }
          }
          if (btnName === "Yes") {
            await new Promise<void>((resolve) => {
              revertAccountInt.mutate(
                {
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: acctInfo?.BRANCH_CD ?? "",
                  SCROLL_NO: data?.[i]?.SCROLL_NO ?? "",
                  PAID: data?.[i]?.PAID ?? "",
                },
                {
                  onSuccess: async (data: any, variables: any) => {
                    for (let i = 0; i < data?.length; i++) {
                      if (data?.[i]?.O_STATUS === "999") {
                        const btnName = await MessageBox({
                          messageTitle:
                            data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                          message: data?.[i]?.O_MESSAGE ?? "",
                          icon: "ERROR",
                        });
                      } else if (data?.[i]?.O_STATUS === "99") {
                        const btnName = await MessageBox({
                          messageTitle:
                            data?.[i]?.O_MSG_TITLE ?? "Confirmation",
                          message: data?.[i]?.O_MESSAGE ?? "",
                          buttonNames: ["Yes", "No"],
                          icon: "CONFIRM",
                        });
                      } else if (data?.[i]?.O_STATUS === "9") {
                        const btnName = await MessageBox({
                          messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
                          message: data?.[i]?.O_MESSAGE ?? "",
                          icon: "WARNING",
                        });
                      } else if (data?.[i]?.O_STATUS === "0") {
                      }
                    }
                    resolve();
                  },
                  onError: async (error: any, variables: any) => {
                    const btnName = await MessageBox({
                      messageTitle: "Alert.",
                      message: error?.error_msg ?? "Error",
                      icon: "ERROR",
                    });
                    CloseMessageBox();
                    resolve();
                  },
                }
              );
            });
          }
        } else if (data?.[i]?.O_STATUS === "9") {
          const btnName = await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[i]?.O_MESSAGE ?? "",
            icon: "WARNING",
          });
        } else if (data?.[i]?.O_STATUS === "0") {
          const btnName = await MessageBox({
            messageTitle: "Success",
            message: "InterestAppliedRevertBack",
            icon: "SUCCESS",
          });
          closeDialog();
        }
      }
    },
    onError: (error: any, variables: any) => {
      enqueueSnackbar(error?.error_msg, {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

  const revertAccountInt = useMutation(API.revertAccountInt);
  const handleApplyRevertInt = async () => {
    const btnName = await MessageBox({
      message: "AreyousuretoApplyInterest",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (btnName === "Yes") {
      applyAccountInt.mutate({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: acctInfo?.BRANCH_CD ?? "",
        ACCT_TYPE: acctInfo?.ACCT_TYPE ?? "",
        ACCT_CD: acctInfo?.ACCT_CD ?? "",
        FROM_DT: date?.FROM_DT ?? "",
        TO_DT: date?.TO_DT ?? "",
        NPA_CD: reportDetail?.NPA_CD_PARENT ?? "00",
        SCREEN_REF: docCD ?? "",
      });
    }
  };

  const handlePrintPage = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <Fragment>
      <Dialog
        open={open}
        className="Report"
        fullWidth
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="md"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            closeDialog();
          }
        }}
      >
        {isLoader ? (
          <LoaderPaperComponent />
        ) : (
          <Box
            ref={printRef}
            sx={{
              margin: "20px",
              overflow: "auto",

              "@media print": {
                width: "200mm",
                margin: "5px auto",
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
              {reportHeading?.RPT_IMG ? (
                <Box
                  sx={{
                    width: "10%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <img
                    src={URL.createObjectURL(
                      utilFunction?.base64toBlob(reportHeading.RPT_IMG)
                    )}
                    style={{
                      objectFit: "contain",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  />
                </Box>
              ) : null}
              <Box
                sx={{
                  width: "90%",
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  paddingLeft: "5px",
                }}
              >
                <Typography className={classes?.typoStyle}>
                  {reportHeading?.LINE1 ?? ""}
                </Typography>
                <Typography className={classes?.typoStyle}>
                  {reportHeading?.LINE2 ?? ""}
                </Typography>
                <Divider sx={{ border: "1px dashed black" }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <pre className={classes?.typoStyle}>
                    {reportHeading?.LINE3_P1 ?? ""}
                  </pre>
                  <pre className={classes?.typoStyle}>
                    {reportHeading?.LINE3_P2 ?? ""}
                  </pre>
                </Box>
              </Box>
            </Box>
            <pre className={classes?.typoStyle}>
              {reportDetail?.RPT_HEADING ?? ""}
            </pre>

            {/* Display middle section */}
            <Box>
              <TableContainer>
                <Table
                  sx={{ minWidth: 300, width: 650 }}
                  aria-label="simple table"
                >
                  <TableBody>
                    <TableRow sx={{ padding: "0 !important" }}>
                      <TableCell
                        align="right"
                        sx={{
                          width: "25%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>Account No.:</pre>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          width: "75%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                        colSpan={5}
                      >
                        <pre>
                          {reportDetail?.ACCT_CD ? reportDetail?.ACCT_CD : ""}
                        </pre>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ padding: "0 !important" }}>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.74%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {acctInfo?.PARENT_TYPE?.trim() === "SB"
                            ? "Balance:"
                            : "OutStanding:"}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.60%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.TRAN_BAL
                            ? parseFloat(reportDetail?.TRAN_BAL).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.74%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.LIMIT_AMT_VISIBLE === "Y"
                            ? "Limit Amount:"
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.60%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.LIMIT_AMT_VISIBLE === "Y" &&
                          reportDetail?.LIMIT_AMOUNT
                            ? parseFloat(reportDetail?.LIMIT_AMOUNT).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.66%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      ></TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.66%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      ></TableCell>
                    </TableRow>
                    <TableRow sx={{ padding: "0 !important" }}>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.74%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>Provision Balance:</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.60%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.PROVISIONAL_BAL
                            ? parseFloat(reportDetail?.PROVISIONAL_BAL).toFixed(
                                2
                              )
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.74%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.DP_VISIBLE === "Y"
                            ? "Drawing Power:"
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.60%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.DP_VISIBLE === "Y" &&
                          reportDetail?.DRAWING_POWER
                            ? parseFloat(reportDetail?.DRAWING_POWER).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.66%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      ></TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.66%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      ></TableCell>
                    </TableRow>
                    <TableRow sx={{ padding: "0 !important" }}>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.74%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>Charge Balance:</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.60%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.CHARGE_BAL
                            ? parseFloat(reportDetail?.CHARGE_BAL).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          width: "16.74%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.NPA_CD_VISIBLE === "Y"
                            ? "NPA Code:"
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          width: "16.60%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.NPA_CD_VISIBLE === "Y" &&
                          reportDetail?.NPA_CD
                            ? reportDetail?.NPA_CD
                            : ""}
                        </pre>
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          width: "16.66%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.HOLD_AMT_VISIBLE === "Y"
                            ? "Hold Amount:"
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "16.66%",
                          padding: "0 !important",
                          borderBottom: "none !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.HOLD_AMT_VISIBLE === "Y" &&
                          reportDetail?.HOLD_AMT
                            ? parseFloat(reportDetail?.HOLD_AMT).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Display Interest details in table */}
            <Box>
              <TableContainer>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow sx={{ padding: "0 !important" }}>
                      <TableCell
                        align="right"
                        sx={{
                          width: "5%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      ></TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "17%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {reportDetail?.CR_INT_LABEL
                            ? reportDetail?.CR_INT_LABEL
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "17%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {acctInfo?.PARENT_TYPE?.trim() !== "SB"
                            ? "Ag Clg Int Amt"
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "17%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>
                          {acctInfo?.PARENT_TYPE?.trim() !== "SB"
                            ? "Penal Int Amt"
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "15%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>Interest Amt</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "10%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>Int Rate</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "19%",
                          padding: "0 !important",
                          borderBottom: "1px dashed black",
                        }}
                      >
                        <pre className={classes?.typoStyle}>Total Int Amt</pre>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportDetail?.INT_ROWS?.map((row) => (
                      <TableRow
                        key={row?.name}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                            padding: "0 !important",
                          },
                        }}
                      >
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                          }}
                        ></TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                          }}
                        >
                          <pre>
                            {reportDetail?.CR_INT_LABEL
                              ? parseFloat(row?.CT_INT).toFixed(2)
                              : ""}
                          </pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                          }}
                        >
                          <pre>
                            {acctInfo?.PARENT_TYPE?.trim() !== "SB"
                              ? parseFloat(row?.A_INT).toFixed(2)
                              : ""}
                          </pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                          }}
                        >
                          <pre>
                            {acctInfo?.PARENT_TYPE?.trim() !== "SB"
                              ? parseFloat(row?.P_INT).toFixed(2)
                              : ""}
                          </pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                          }}
                        >
                          <pre>{parseFloat(row?.N_INT).toFixed(2)}</pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                          }}
                        >
                          <pre>{parseFloat(row?.INT_RATE).toFixed(2)}</pre>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderBottom: "none !important",
                            padding: "0 !important",
                            fontWeight: "bold",
                          }}
                        >
                          <pre>{parseFloat(row?.TOT_INT).toFixed(2)}</pre>
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
                          padding: "0 !important",
                        }}
                      >
                        <pre>Total:</pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 !important",
                        }}
                      >
                        <pre>
                          {reportDetail?.CR_INT_LABEL
                            ? parseFloat(
                                reportDetail?.INT_ROWS?.reduce(
                                  (sum, row) =>
                                    sum + (Number(row?.CT_INT) || 0),
                                  0
                                ) || 0
                              ).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 !important",
                        }}
                      >
                        <pre>
                          {" "}
                          {acctInfo?.PARENT_TYPE?.trim() !== "SB"
                            ? parseFloat(
                                reportDetail?.INT_ROWS?.reduce(
                                  (sum, row) => sum + (Number(row?.A_INT) || 0),
                                  0
                                ) || 0
                              ).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 !important",
                        }}
                      >
                        <pre>
                          {acctInfo?.PARENT_TYPE?.trim() !== "SB"
                            ? parseFloat(
                                reportDetail?.INT_ROWS?.reduce(
                                  (sum, row) => sum + (Number(row?.P_INT) || 0),
                                  0
                                ) || 0
                              ).toFixed(2)
                            : ""}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 !important",
                        }}
                      >
                        <pre>
                          {parseFloat(
                            reportDetail?.INT_ROWS?.reduce(
                              (sum, row) => sum + (Number(row?.N_INT) || 0),
                              0
                            ) || 0
                          ).toFixed(2)}
                        </pre>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          padding: "0 !important",
                        }}
                      ></TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "none !important",
                          fontWeight: "bold",
                          padding: "0 !important",
                        }}
                      >
                        <pre>
                          {parseFloat(
                            reportDetail?.INT_ROWS?.reduce(
                              (sum, row) => sum + (Number(row?.TOT_INT) || 0),
                              0
                            ) || 0
                          ).toFixed(2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <pre>{reportDetail?.INT_REMARKS}</pre>
              <Box>
                <pre style={{ textAlign: "right" }}>
                  Total with Interest:{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {parseFloat(
                      Number(reportDetail?.TRAN_BAL || 0) +
                        Number(reportDetail?.PROVISIONAL_BAL || 0) +
                        Number(reportDetail?.CHARGE_BAL || 0) +
                        (acctInfo?.PARENT_TYPE?.trim() === "SB"
                          ? reportDetail?.INT_ROWS?.reduce(
                              (sum, row) => sum + (Number(row?.TOT_INT) || 0),
                              0
                            ) || 0
                          : -1 *
                              reportDetail?.INT_ROWS?.reduce(
                                (sum, row) => sum + (Number(row?.TOT_INT) || 0),
                                0
                              ) || 0)
                    ).toFixed(2)}
                  </span>
                </pre>
                {reportDetail?.HOLD_AMT_VISIBLE === "Y" && (
                  <pre style={{ textAlign: "right" }}>
                    Total with interest and Hold amount:
                    <span style={{ fontWeight: "bold" }}>
                      {parseFloat(
                        (reportDetail?.INT_ROWS?.reduce(
                          (sum, row) => sum + (Number(row?.TOT_INT) || 0),
                          0
                        ) ||
                          0 - reportDetail?.HOLD_AMT) ??
                          0
                      ).toFixed(2)}
                    </span>
                  </pre>
                )}
              </Box>
            </Box>
          </Box>
        )}
        <DialogActions>
          {isLoader ? (
            <GradientButton
              onClick={() => {
                closeDialog();
              }}
            >
              {t("Close")}
            </GradientButton>
          ) : (
            <>
              <GradientButton
                onClick={() => {
                  if (reportDetail?.REVERT_BUTTON !== "Y") {
                    handlePrintPage();
                  }
                }}
                disabled={reportDetail?.REVERT_BUTTON === "Y"}
              >
                {t("Print")}
              </GradientButton>

              {reportDetail?.REVERT_BUTTON === "Y" ? (
                <GradientButton
                  onClick={handleApplyRevertInt}
                  color={"primary"}
                >
                  {t("Revert")}
                </GradientButton>
              ) : (
                <GradientButton
                  onClick={handleApplyRevertInt}
                  color={"primary"}
                >
                  {t("Apply")}
                </GradientButton>
              )}
              <GradientButton
                onClick={() => {
                  closeDialog();
                }}
              >
                {t("Close")}
              </GradientButton>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

type SingleAccountInterestCustomProps = {
  closeDialog?: any;
  open?: any;
  reqData?: any;
  date?: any;
  reportHeading?: any;
  reportDetail?: any;
  acctInfo?: any;
  isLoader?: any;
};
export const SingleAccountInterestReport: React.FC<
  SingleAccountInterestCustomProps
> = ({
  closeDialog,
  open,
  date,
  reportHeading,
  reportDetail,
  acctInfo,
  isLoader,
}) => {
  return (
    <ClearCacheProvider>
      <SingleAccountInterestCustom
        closeDialog={closeDialog}
        open={open}
        date={date}
        reportHeading={reportHeading}
        reportDetail={reportDetail}
        acctInfo={acctInfo}
        isLoader={isLoader}
      />
    </ClearCacheProvider>
  );
};
