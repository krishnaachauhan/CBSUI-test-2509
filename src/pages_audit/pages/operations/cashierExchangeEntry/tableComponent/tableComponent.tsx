import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useStyles, StyledTableCell } from "./style";
import {
  TextField,
  usePropertiesConfigContext,
  formatCurrency,
  getCurrencySymbol,
  utilFunction,
} from "@acuteinfo/common-base";
import { CashierExchangeTableProps } from "./type";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { format } from "date-fns";
const CashierExchangeTable = forwardRef<any, CashierExchangeTableProps>(
  (
    {
      data,
      metadata,
      TableLabel,
      hideHeader = false,
      ignoreMinusValue = false,
      showFooter = true,
      tableState,
      onFooterUpdate,
      isCalculationZero = false,
      addExtraValue,
      displayMode = "new",
    },
    ref
  ) => {
    const customParameter = usePropertiesConfigContext();
    const [inputData, setInputData] = useState<any[]>(data ?? []);
    const [total, setTotal] = useState<any>({});
    const [remaining, setRemaining] = useState<any>({});
    const classes = useStyles();
    const inputRefs = useRef<any>({});
    const { dynamicAmountSymbol, currencyFormat, decimalCount } =
      customParameter;

    const updateField = useCallback(
      (prevData: any[], rowIndex: number, fieldName: string, newValue: any) => {
        return prevData.map((item, index) =>
          index === rowIndex ? { ...item, [fieldName]: newValue } : item
        );
      },
      []
    );

    const recalcFooter = useCallback(
      (dataArray: any[]) => {
        const newTotal = metadata?.fields.reduce((totals: any, field: any) => {
          if (field.isCalculation) {
            totals[field.name] = dataArray.reduce((sum, row) => {
              const value = parseFloat(row[field.name]) || 0;
              return sum + value;
            }, 0);
          }
          return totals;
        }, {});

        const newRemaining = metadata?.fields.reduce(
          (remainders: any, field: any) => {
            if (field.isCalculation) {
              const initialValue = Number(addExtraValue) || 0;
              const finalValue = dataArray.reduce((sum, row) => {
                const value = parseFloat(row[field.name]) || 0;
                return sum - value;
              }, initialValue);
              remainders[field.name] = finalValue;
            }
            return remainders;
          },
          {}
        );

        setTotal(newTotal);
        setRemaining(newRemaining);
        if (onFooterUpdate) {
          onFooterUpdate({ total: newTotal, remaining: newRemaining });
        }
      },
      [metadata, onFooterUpdate]
    );

    const sanitizedValue = useCallback(
      (inputValue: any) => {
        const strVal = String(inputValue);
        if (!strVal || strVal === "0") return "";
        if (ignoreMinusValue) {
          return strVal.replace(/[^0-9]/g, "");
        }
        if (strVal.startsWith("-")) {
          return "-" + strVal.replace(/[^0-9]/g, "");
        }
        return strVal.replace(/[^0-9]/g, "");
      },
      [ignoreMinusValue]
    );

    const handleInputChange = useCallback(
      async (event, rowIndex, fieldName) => {
        const newValue = event?.target?.value;
        const fieldMetadata = metadata?.fields.find(
          (field: any) => field.name === fieldName
        );
        const currentRow = inputData[rowIndex];

        if (fieldMetadata?.onChange && fieldMetadata.dependentValue) {
          const dependentValues = fieldMetadata.dependentValue.map(
            (depFieldName: string) => currentRow[depFieldName]
          );
          const setDependentValue = (targetFieldName: string, value: any) => {
            setInputData((prev) => {
              const updated = updateField(
                prev,
                rowIndex,
                targetFieldName,
                value
              );
              recalcFooter(updated);
              return updated;
            });
          };
          const updateCurrentField = (value: any) => {
            setInputData((prev) => {
              const updated = updateField(prev, rowIndex, fieldName, value);
              recalcFooter(updated);
              return updated;
            });
          };
          await fieldMetadata.onChange(
            newValue,
            currentRow,
            dependentValues,
            setDependentValue,
            tableState,
            updateCurrentField,
            total,
            remaining
          );
        }

        setInputData((prev) => {
          const updated = updateField(prev, rowIndex, fieldName, newValue);
          recalcFooter(updated);
          return updated;
        });
      },
      [metadata, inputData, tableState, updateField, recalcFooter]
    );

    const handleFieldBlur = useCallback(
      async (rowIndex: number, fieldName: string) => {
        const currentRow = inputData[rowIndex];
        const fieldMetadata = metadata?.fields.find(
          (field: any) => field.name === fieldName
        );
        const currentFieldValue = currentRow[fieldName];
        const TableDatas = inputData;
        const setDependentValue = (targetFieldName: string, value: any) => {
          setInputData((prev) => {
            const updated = updateField(prev, rowIndex, targetFieldName, value);
            recalcFooter(updated);
            return updated;
          });
          const inputRef = inputRefs.current[`${rowIndex}-${fieldName}`];
          if (!value && inputRef) {
            setTimeout(() => inputRef.focus(), 100);
          }
        };

        const updateCurrentField = (value: any) => {
          setInputData((prev) => {
            const updated = updateField(prev, rowIndex, fieldName, value);
            recalcFooter(updated);
            return updated;
          });
          const inputRef = inputRefs.current[`${rowIndex}-${fieldName}`];
          if (!value && inputRef) {
            setTimeout(() => inputRef.focus(), 100);
          }
        };

        if (fieldMetadata?.validation && fieldMetadata.dependentValue) {
          const dependentValues = fieldMetadata.dependentValue.map(
            (depFieldName: string) => currentRow[depFieldName]
          );
          await fieldMetadata.validation(
            currentFieldValue,
            currentRow,
            dependentValues,
            setDependentValue,
            tableState,
            updateCurrentField,
            total,
            remaining,
            TableDatas
          );
        }
        recalcFooter(inputData);
      },
      [inputData, metadata, tableState, updateField, recalcFooter]
    );

    const incrementArrow = useCallback(
      async (rowIndex: number, fieldName: string) => {
        const currentValue = Number(inputData[rowIndex]?.[fieldName]) || 0;
        const newValue = currentValue + 1;
        const syntheticEvent = { target: { value: newValue } };
        await handleInputChange(syntheticEvent, rowIndex, fieldName);
        const inputRef = inputRefs.current[`${rowIndex}-${fieldName}`];
        if (inputRef) inputRef.focus();
        await handleFieldBlur(rowIndex, fieldName);
      },
      [inputData, handleInputChange, handleFieldBlur]
    );

    const decrementArrow = useCallback(
      async (rowIndex: number, fieldName: string) => {
        const currentValue = Number(inputData[rowIndex]?.[fieldName]) || 0;
        const newValue = currentValue - 1;
        const syntheticEvent = { target: { value: newValue } };
        await handleInputChange(syntheticEvent, rowIndex, fieldName);
        const inputRef = inputRefs.current[`${rowIndex}-${fieldName}`];
        if (inputRef) inputRef.focus();
        await handleFieldBlur(rowIndex, fieldName);
      },
      [inputData, handleInputChange, handleFieldBlur]
    );

    useImperativeHandle(
      ref,
      () => ({
        saveData: () => {
          const recordsWithDenoQty = inputData.filter(
            (record) =>
              record?.DENO_QTY &&
              record?.DENO_QTY !== "undefined" &&
              record?.DENO_QTY !== "" &&
              record?.DENO_QTY !== "0"
          );
          return {
            tableData: recordsWithDenoQty,
            tableDisplayData: inputData,
            tablefooter: { total, remaining },
          };
        },
        getFooterTotals: () => ({ total, remaining }),
      }),
      [inputData, total, remaining]
    );
    useEffect(() => {
      if (data?.length > 0) {
        recalcFooter(data);
      }
    }, [data, recalcFooter]);

    const remainingValue = parseFloat(remaining?.DENO_AMOUNT);
    const label = remainingValue < 0 ? "Excess: " : "Remaining: ";
    const getFieldWithMode = (field: any) => {
      let override: any = {};
      if (displayMode === "new" && field.__NEW__) {
        override = field.__NEW__;
      } else if (displayMode === "view" && field.__VIEW__) {
        override = field.__VIEW__;
      } else if (displayMode === "edit" && field.__EDIT__) {
        override = field.__EDIT__;
      }
      return { ...field, ...override };
    };
    return (
      <Box>
        <Paper
          sx={{
            boxShadow: "none",
            borderRadius: "0px",
            margin: "0 10px",
            paddingBottom: "6px",
          }}
        >
          {inputData.length > 0 && (
            <>
              {!hideHeader && inputData.length > 0 && (
                <AppBar
                  position="static"
                  sx={{
                    background: "var(--theme-color5)",
                    margin: "10px",
                    width: "auto",
                  }}
                >
                  <Toolbar>
                    <Typography
                      variant="h6"
                      sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        color: "var(--theme-color2)",
                        fontSize: "1rem",
                      }}
                    >
                      {TableLabel}
                    </Typography>
                  </Toolbar>
                </AppBar>
              )}
              <TableContainer
                sx={{ maxHeight: "calc(90vh - 200px)", overflow: "auto" }}
                component={Paper}
              >
                <Table
                  sx={{ minWidth: "350px" }}
                  aria-label="simple table"
                  className={classes.tableBordered}
                >
                  <TableHead>
                    <TableRow
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "var(--theme-color4)",
                        border: "none",
                        zIndex: 999,
                      }}
                    >
                      {metadata?.fields?.map((meta: any, index: number) => (
                        <StyledTableCell
                          key={`${meta?.name}-${index}`}
                          align="center"
                        >
                          {meta?.label}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inputData?.map((row: any, rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {metadata?.fields?.map(
                          (meta: any, colIndex: number) => {
                            const field = getFieldWithMode(meta);
                            const isEditable = !field?.isReadOnly;
                            const value = row[field?.name];
                            const displayValue = field?.isCurrency
                              ? formatCurrency(
                                  parseFloat(value || "0"),
                                  getCurrencySymbol(dynamicAmountSymbol),
                                  currencyFormat,
                                  decimalCount
                                )
                              : value;
                            const inputMaxLength = field?.maxLength || "";
                            return (
                              <StyledTableCell
                                key={colIndex}
                                align={field?.align}
                                style={{
                                  background: !isEditable
                                    ? "#e9ecef"
                                    : undefined,
                                }}
                              >
                                {isEditable ? (
                                  <TextField
                                    variant="standard"
                                    fullWidth
                                    value={
                                      sanitizedValue(row[field?.name]) ?? value
                                    }
                                    autoComplete="off"
                                    placeholder="Enter value"
                                    InputProps={{
                                      readOnly: !isEditable,
                                      disableUnderline: true,
                                      endAdornment: (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            // gap: '0.5rem',
                                            alignItems: "center",
                                          }}
                                        >
                                          <IconButton
                                            onClick={() =>
                                              incrementArrow(
                                                rowIndex,
                                                field?.name
                                              )
                                            }
                                            sx={{
                                              padding: 0,
                                              minWidth: "auto",
                                              lineHeight: 0,
                                            }}
                                            size="small"
                                            tabIndex={-1}
                                          >
                                            <ArrowDropUpIcon
                                              sx={{ fontSize: "1rem" }}
                                            />
                                          </IconButton>
                                          <IconButton
                                            onClick={() =>
                                              decrementArrow(
                                                rowIndex,
                                                field?.name
                                              )
                                            }
                                            sx={{
                                              padding: 0,
                                              minWidth: "auto",
                                              lineHeight: 0,
                                            }}
                                            size="small"
                                            tabIndex={-1}
                                          >
                                            <ArrowDropDownIcon
                                              sx={{ fontSize: "1rem" }}
                                            />
                                          </IconButton>
                                        </Box>
                                      ),
                                    }}
                                    onChange={(e) =>
                                      handleInputChange(
                                        e,
                                        rowIndex,
                                        field?.name
                                      )
                                    }
                                    onBlur={() =>
                                      handleFieldBlur(rowIndex, field?.name)
                                    }
                                    classes={{ root: classes.leftTextAlign }}
                                    inputRef={(el) =>
                                      (inputRefs.current[
                                        `${rowIndex}-${field?.name}`
                                      ] = el)
                                    }
                                    inputProps={{ maxLength: inputMaxLength }}
                                  />
                                ) : (
                                  <Typography>{displayValue}</Typography>
                                )}
                              </StyledTableCell>
                            );
                          }
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableBody
                    style={{
                      position: "sticky",
                      bottom: "0px",
                      padding: "4px 10px",
                      background: "var(--theme-color4)",
                      border: "1px solid var(--theme-color6)",
                    }}
                  >
                    <TableRow>
                      {metadata?.fields?.map((meta: any, index: number) => (
                        <StyledTableCell
                          key={`${meta?.name}-${index}`}
                          align={meta?.align}
                        >
                          {meta?.isCalculation ? (
                            <Typography sx={{ fontWeight: "bold" }}>
                              {meta?.isTotalWord
                                ? "Total: "
                                : meta?.isCurrency
                                ? formatCurrency(
                                    parseFloat(total[meta?.name] || 0),
                                    getCurrencySymbol(dynamicAmountSymbol),
                                    currencyFormat,
                                    decimalCount
                                  )
                                : total[meta?.name] || 0}
                            </Typography>
                          ) : null}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                    {metadata?.fields?.some((meta: any) => meta?.isExcess) && (
                      <TableRow>
                        {metadata?.fields?.map((meta: any, index: number) => (
                          <StyledTableCell
                            key={`${meta?.name}-${index}`}
                            align={meta?.isCurrency ? "right" : "left"}
                          >
                            {meta?.isExcess ? (
                              <Typography sx={{ fontWeight: "bold" }}>
                                {meta?.isTotalWord
                                  ? label
                                  : meta?.isExcess
                                  ? formatCurrency(
                                      parseFloat(remaining[meta?.name] || 0),
                                      getCurrencySymbol(dynamicAmountSymbol),
                                      currencyFormat,
                                      decimalCount
                                    )
                                  : remaining[meta?.name] || 0}
                              </Typography>
                            ) : null}
                          </StyledTableCell>
                        ))}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Box>
    );
  }
);
export default CashierExchangeTable;
