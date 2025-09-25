import { useState, useEffect, useContext, useRef, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useStyles, StyledTableCell } from "../style";
import {
  formatCurrency,
  GradientButton,
  usePropertiesConfigContext,
  getCurrencySymbol,
  usePopupContext,
  Alert,
  TextField,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import Draggable from "react-draggable";
import { t } from "i18next";
const DualPartTable = ({
  data,
  columnDefinitions,
  displayTableDual,
  onCloseTable,
  handleChange,
  inputValues,
  totalAmounts,
  gridLable,
  handleBlur,
  remainExcess,
  remainExcessLable,
  errors,
  saveDenominationData,
}) => {
  const classes = useStyles();
  const inputRefs = useRef<any>({});
  const [refsReady, setRefsReady] = useState(false);
  const customParameter = usePropertiesConfigContext();
  const { dynamicAmountSymbol, currencyFormat, decimalCount } = customParameter;

  useEffect(() => {
    if (Object?.keys(inputRefs?.current)?.length > 0) {
      setRefsReady(true);
    }
  }, [data]);

  useEffect(() => {
    if (refsReady) {
      let timer = setTimeout(() => {
        inputRefs?.current?.["0"]?.focus();
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [refsReady, displayTableDual, data]);

  const renderTableHeader = () => {
    return (
      <TableHead>
        <TableRow>
          {columnDefinitions?.map((column, index) => (
            <StyledTableCell
              key={`${column?.fieldName}-${index}`}
              className="cellBordered"
              align={column?.isCurrency && "right"}
            >
              {t(column?.label)}
            </StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };
  const renderTableBody = () => {
    return (
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            {columnDefinitions?.map((column) => {
              const isEditable = column?.isEditable;
              const value =
                inputValues[index]?.[column?.fieldName] ||
                item[column?.fieldName] ||
                "";
              const displayValue = column?.isCurrency
                ? formatCurrency(
                    parseFloat(value || "0"),
                    getCurrencySymbol(dynamicAmountSymbol),
                    currencyFormat,
                    decimalCount
                  )
                : value;
              return (
                <StyledTableCell
                  key={column?.uniqueID}
                  align={column?.isCurrency && "right"}
                >
                  {Boolean(isEditable) ? (
                    <TextField
                      variant="standard"
                      fullWidth
                      value={value}
                      autoComplete="off"
                      onChange={(e) =>
                        isEditable && handleChange(e, index, column?.fieldName)
                      }
                      onBlur={(event) =>
                        handleBlur(event, column?.fieldName, index)
                      }
                      placeholder={t("EnterValue")}
                      InputProps={{
                        readOnly: !isEditable,
                      }}
                      inputProps={{
                        maxLength: 10,
                      }}
                      classes={{ root: classes?.leftTextAlign }}
                      error={errors.some(
                        (error) =>
                          error?.index === index &&
                          error?.fieldName === column?.fieldName
                      )}
                      helperText={
                        (
                          errors.find(
                            (error) =>
                              error?.index === index &&
                              error?.fieldName === column?.fieldName
                          ) || {}
                        )?.message || ""
                      }
                      onKeyPress={(event) => {
                        const keyCode = event?.keyCode || event?.which;
                        const keyValue = String?.fromCharCode(keyCode);
                        if (!/^[0-9]$/.test(keyValue)) event?.preventDefault();
                      }}
                      inputRef={(input) => {
                        if (input && column?.fieldName === "receipt") {
                          inputRefs.current[index] = input;
                          if (index === data?.length - 1) {
                            setRefsReady(true);
                          }
                        }
                      }}
                    />
                  ) : (
                    <Typography>{displayValue}</Typography>
                  )}
                </StyledTableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    );
  };

  const renderTableFooter = () => {
    return (
      <TableBody
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--theme-color4)",
          border: "none",
        }}
      >
        <TableRow>
          {columnDefinitions.map((column, index) => (
            <StyledTableCell
              key={`${column?.fieldName}--${index}`}
              align={column?.isCurrency && "right"}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {column?.isTotalWord
                  ? t("Total") + ":"
                  : column?.isCurrency
                  ? formatCurrency(
                      parseFloat(totalAmounts[column?.fieldName] || "0"),
                      getCurrencySymbol(dynamicAmountSymbol),
                      currencyFormat,
                      decimalCount
                    )
                  : totalAmounts[column?.fieldName] || "0"}
              </Typography>
            </StyledTableCell>
          ))}
        </TableRow>
      </TableBody>
    );
  };

  return (
    <Dialog
      open={displayTableDual && data?.length > 0}
      maxWidth={"xl"}
      className="denoTable"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          onCloseTable(false, "TABLE2");
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
            onClick={() => onCloseTable(false, "TABLE2")}
            color="primary"
            disabled={false}
          >
            Close
          </GradientButton>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ padding: 0 }}>
        <Paper
          sx={{
            boxShadow: "none",
            borderRadius: "0px",
            margin: "0 10px",
            paddingBottom: "6px",
          }}
        >
          <TableContainer
            sx={{
              width: "auto",
              maxHeight: "calc(100vh - 200px)",
              overflow: "auto",
            }}
            component={Paper}
          >
            <Table
              sx={{ minWidth: 650, borderCollapse: "unset !important" }}
              aria-label="simple table"
              className={classes.tableBordered}
            >
              {renderTableHeader()}
              <TableBody style={{ overflowY: "auto", display: "contents" }}>
                {renderTableBody()}
              </TableBody>
              {renderTableFooter()}
            </Table>
          </TableContainer>{" "}
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
                {`${remainExcessLable} :`}
              </Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {/* {formatCurrency(
                  parseFloat(remainExcess),
                  getCurrencySymbol(dynamicAmountSymbol),
                  currencyFormat,
                  decimalCount
                )} */}
                {formatCurrency(
                  isNaN(parseFloat(remainExcess)) || remainExcess === ""
                    ? 0
                    : parseFloat(remainExcess),
                  getCurrencySymbol(dynamicAmountSymbol),
                  currencyFormat,
                  decimalCount
                )}
              </Typography>
            </Typography>
          </Paper>{" "}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default DualPartTable;
