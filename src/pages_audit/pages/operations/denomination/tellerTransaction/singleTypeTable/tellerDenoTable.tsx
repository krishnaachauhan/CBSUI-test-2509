import { Fragment, useEffect, useRef, useState } from "react";
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { useStyles, StyledTableCell } from "../style";
import {
  GradientButton,
  formatCurrency,
  TextField,
  usePropertiesConfigContext,
  getCurrencySymbol,
  Alert,
} from "@acuteinfo/common-base";
import Draggable from "react-draggable";
import { t } from "i18next";
const TellerDenoTable = ({
  displayTable,
  data,
  handleChange,
  displayError,
  inputValue,
  amount,
  availNotes,
  balance,
  handleonBlur,
  noteCntTotal,
  amountTotal,
  availNoteTotal,
  balanceTotal,
  remainExcessBal,
  finalLable,
  onCloseTable,
  textFieldRef,
  gridLable,
  saveDenominationData,
}) => {
  const fieldRef = useRef<any>([]);
  const classes = useStyles();
  const inputRefs = useRef<any>({});
  const [refsReady, setRefsReady] = useState(false);
  const customParameter = usePropertiesConfigContext();
  const { dynamicAmountSymbol, currencyFormat, decimalCount } = customParameter;

  // Focus the first input field when the table is displayed
  useEffect(() => {
    if (Object?.keys(inputRefs?.current)?.length > 0) {
      setRefsReady(true);
    }
  }, [data]);

  useEffect(() => {
    let timer;
    if (refsReady) {
      timer = setTimeout(() => {
        inputRefs?.current?.["0"]?.focus();
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [refsReady, displayTable, data]);

  //For highlight the input value when get focus on input field
  const handleonFocus = (event, index) => {
    const input = event?.target;
    if (input?.value) {
      input?.select();
    }
  };

  return (
    <Dialog
      open={displayTable && data?.length > 0}
      maxWidth={"md"}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          onCloseTable(false, "TABLE1");
        }
      }}
    >
      {saveDenominationData?.isError ? (
        <Fragment>
          <Alert
            severity={saveDenominationData?.error?.severity ?? "error"}
            errorMsg={saveDenominationData?.error?.error_msg ?? "Error"}
            errorDetail={saveDenominationData?.error?.error_detail ?? ""}
          />
        </Fragment>
      ) : null}
      <div className="denoTable">
        <AppBar
          position="static"
          sx={{
            height: "auto",
            background: "var(--theme-color5)",
            margin: "10px",
            width: "auto",
          }}
        >
          <Toolbar sx={{ minHeight: "48px !important" }}>
            <Typography
              variant="h6"
              style={{ flexGrow: 1 }}
              sx={{
                fontWeight: 700,
                color: "var(--theme-color2)",
                fontSize: "1rem",
              }}
            >
              {gridLable}
            </Typography>
            <GradientButton
              onClick={() => onCloseTable(false, "TABLE1")}
              color="primary"
              disabled={false}
            >
              Close
            </GradientButton>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ padding: "0px" }}>
          <Paper
            sx={{
              boxShadow: "none",
              borderRadius: "0px",
              margin: "0 10px",
              paddingBottom: "6px",
            }}
          >
            <Box
              borderRadius={"none"}
              boxShadow={"rgba(226, 236, 249, 0.5) 0px 11px 70px"}
              overflow={"hidden"}
              style={{ transform: "scale(90deg)" }}
            >
              <TableContainer
                sx={{
                  width: "auto",
                  overflow: "auto",
                  maxHeight: "calc(100vh - 200px)",
                }}
                component={Paper}
              >
                <Table
                  sx={{ minWidth: 650, borderCollapse: "unset !important" }}
                  aria-label="simple table"
                  className={classes.tableBordered}
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="left" className="cellBordered">
                        {t("Denomination")}
                        <Box
                          className="flipHorizontal"
                          style={{
                            animation: "flipHorizontal 2s infinite",
                            display: "inline-block",
                            transformOrigin: "center",
                            marginLeft: "10px",
                          }}
                        >
                          {
                            <Typography
                              style={{
                                border: "0.2px solid",
                                borderRadius: "50%",
                                height: "22px",
                                width: "22px",
                                textAlign: "center",
                              }}
                            >
                              {getCurrencySymbol(dynamicAmountSymbol)}
                            </Typography>
                          }
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell className="cellBordered" align="right">
                        {t("NoteCount")}
                      </StyledTableCell>
                      <StyledTableCell className="cellBordered" align="right">
                        {t("Amount")}
                      </StyledTableCell>
                      <StyledTableCell className="cellBordered" align="right">
                        {t("AvailableNote")}
                      </StyledTableCell>
                      <StyledTableCell align="right" className="cellBordered">
                        {t("Balance")}
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.map((row: any, index: any) => {
                      return (
                        <TableRow key={index}>
                          <StyledTableCell
                            component="th"
                            scope="row"
                            className="cellBordered"
                          >
                            {row?.DENO_LABLE}
                          </StyledTableCell>
                          <StyledTableCell
                            align="left"
                            sx={{
                              borderRight: "1px solid var(--theme-color6)",
                              borderLeft: "1px solid var(--theme-color6)",
                              maxWidth: "167px",
                            }}
                            className="cellBordered"
                          >
                            <TextField
                              classes={{ root: classes.leftTextAlign }}
                              placeholder={t("EnterValue")}
                              value={inputValue[index] || ""}
                              onChange={(event) => handleChange(event, index)}
                              onFocus={(event) => handleonFocus(event, index)}
                              onBlur={(event) => handleonBlur(event, index)}
                              helperText={displayError[index] || ""}
                              error={Boolean(displayError[index])}
                              type={"text"}
                              InputProps={{
                                style: { textAlign: "left" },
                              }}
                              // tabIndex={index + 2}
                              sx={{ width: "-webkit-fill-available" }}
                              inputRef={(input) => {
                                if (input) {
                                  inputRefs.current[index] = input;
                                  if (index === data?.length - 1) {
                                    // Check if the last input is set
                                    setRefsReady(true);
                                  }
                                }
                              }}
                              inputProps={{
                                maxLength: 10,
                              }}
                            />
                          </StyledTableCell>
                          <StyledTableCell
                            align="right"
                            className="cellBordered"
                          >
                            {" "}
                            {formatCurrency(
                              parseFloat(amount[index] || "0"),
                              getCurrencySymbol(dynamicAmountSymbol),
                              currencyFormat,
                              decimalCount
                            )}
                          </StyledTableCell>
                          <StyledTableCell
                            align="right"
                            className="cellBordered"
                          >
                            {row?.AVAIL_QTY}
                          </StyledTableCell>
                          <StyledTableCell
                            align="right"
                            className="cellBordered"
                          >
                            {formatCurrency(
                              parseFloat(row?.AVAIL_VAL),
                              getCurrencySymbol(dynamicAmountSymbol),
                              currencyFormat,
                              decimalCount
                            )}
                          </StyledTableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableBody>
                    <TableRow
                      sx={{
                        height: "32px",
                        position: "sticky",
                        bottom: 0,
                        background: "var(--theme-color4)",
                      }}
                    >
                      <StyledTableCell
                        component="th"
                        scope="row"
                        className="cellBordered"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        {t("Total")}
                      </StyledTableCell>

                      <StyledTableCell
                        align="right"
                        sx={{
                          maxWidth: "167px",
                          padding: "4px 17px !important",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                        className="cellBordered"
                      >
                        {noteCntTotal}
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        className="cellBordered"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        {formatCurrency(
                          parseFloat(amountTotal),
                          getCurrencySymbol(dynamicAmountSymbol),
                          currencyFormat,
                          decimalCount
                        )}
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        className="cellBordered"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        {availNoteTotal}
                      </StyledTableCell>
                      <StyledTableCell
                        align="right"
                        className="cellBordered"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        {formatCurrency(
                          parseFloat(balanceTotal),
                          getCurrencySymbol(dynamicAmountSymbol),
                          currencyFormat,
                          decimalCount
                        )}
                      </StyledTableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Paper
                sx={{
                  height: "auto",
                  width: "auto",
                  padding: "2px 8px",
                  borderBottom: "1px solid var(--theme-color6)",
                  borderLeft: "1px solid var(--theme-color6)",
                  borderRight: "1px solid var(--theme-color6)",
                  borderBottomLeftRadius: "none",
                  borderBottomRightRadius: "none",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  position: "sticky",
                  bottom: 0,
                  background: "var(--theme-color4)",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    padding: "10px 0px",
                    display: "flex",
                    background: "var(--theme-color4)",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {`${finalLable} :`}
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    {/* {remainExcessBal} */}
                    {formatCurrency(
                      parseFloat(remainExcessBal ?? "0"),
                      getCurrencySymbol(dynamicAmountSymbol),
                      currencyFormat,
                      decimalCount
                    )}
                  </Typography>
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default TellerDenoTable;
