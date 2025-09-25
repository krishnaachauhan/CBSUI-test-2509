import {
  AppBar,
  Box,
  Chip,
  Dialog,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import {
  CustomAmountField,
  CustomTextField,
} from "../DailyTransaction/TRN001/components";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  GradientButton,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { validateCheckEmiSchedule, validateDisburseDetail } from "./api";
import { Mutation, useMutation } from "react-query";
import i18n from "components/multiLanguage/languagesConfiguration";
import { AuthContext } from "pages_audit/auth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CustomGridTable } from "./emiScheduleSection";
import { format } from "date-fns";
import { CounterContext } from "./emiCalculatorForm";

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
    fontSize: "1.5rem",
  },
}));

interface RowData {
  FROM_DT?: string;
  TO_DT?: string;
  DISBURS_AMOUNT?: string;
  TABLEDATA?: any;
}

export const CustomRowTable = ({ totalInstallment, initialRows, resetDaa }) => {
  const { authState } = useContext(AuthContext);
  const { saveData } = useContext(CounterContext);
  const loanAmountRawsRef = useRef<any>([]);
  const [rows, setRows] = useState(() => {
    return Array.isArray(initialRows)
      ? [
          {
            ...initialRows[0],
            DISBURSEMENT_DT: authState?.workingDate
              ? new Date(authState?.workingDate)
              : new Date(),
            INST_START_DT: authState?.workingDate
              ? new Date(authState?.workingDate)
              : new Date(),
            LOAN_AMT: "",
          },
        ]
      : [];
  });

  useEffect(() => {
    if (resetDaa === true) {
      rowsRef.current = [];
      setRows([
        {
          ...initialRows[0],
          DISBURSEMENT_DT: authState?.workingDate
            ? new Date(authState?.workingDate)
            : new Date(),
          INST_START_DT: authState?.workingDate
            ? new Date(authState?.workingDate)
            : new Date(),
          LOAN_AMT: "",
        },
      ]);
    }
  }, [resetDaa, initialRows[0]?.LOAN_AMT_MAIN]);

  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = useState();
  const [selectedFlag, setSelectedFlag] = useState(null);
  const selectedIndexRef = useRef(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null); // Track selected row index
  const rowsRef = useRef<any>(initialRows);
  const dateInputRef = useRef<any>();
  const loanAmountInputRef = useRef<any>();
  const disbursementDateInputRef = useRef<any>();
  const selectedFlagRef = useRef(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const headerClasses = useTypeStyles();

  const mergedTableData = rowsRef.current
    .map((item) =>
      item?.TABLEDATA?.map((tableItem) => ({
        NO_OF_INST: tableItem?.NO_OF_INST,
        EMI_RS: tableItem?.EMI_RS,
        TOT_INST: initialRows[0]?.INSTALLMENT_NO,
      }))
    )
    .flat();

  const totalDisbursAmt = rowsRef.current.reduce((sum, row) => {
    const amt = Number(row.LOAN_AMT) || 0;
    return sum + amt;
  }, 0);

  const DisbursMentRaws = rowsRef.current.map((item) => ({
    INST_START_DT: Boolean(item.INST_START_DT)
      ? format(new Date(item.INST_START_DT), "dd/MMM/yyyy").toUpperCase()
      : "",
    DISBURSEMENT_DT: Boolean(item.DISBURSEMENT_DT)
      ? format(new Date(item.DISBURSEMENT_DT), "dd/MMM/yyyy").toUpperCase()
      : "",
    LOAN_AMT: item.LOAN_AMT,
    TOT_LOAN_AMT: `${totalDisbursAmt}`,
  }));

  const mutation = useMutation(validateDisburseDetail, {
    onError: async (error) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        //@ts-ignore
        errorMsg = error?.error_msg ?? errorMsg;
      }
      await MessageBox({
        messageTitle: "Error",
        message: errorMsg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data, variables) => {
      const index = selectedIndexRef.current;
      const flag = selectedFlagRef.current;
      if (data[0]?.O_STATUS !== "0") {
        const btnName = await MessageBox({
          message: data[0]?.O_MESSAGE,
          messageTitle: data[0]?.O_MSG_TITLE,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        if (btnName === "Ok") {
          if (flag === "INST_START_DT") {
            //@ts-ignore
            rows[index].INST_START_DT = "";
          }
          if (flag === "DISBURSEMENT_DT") {
          }
          if (flag === "LOAN_AMT") {
            //@ts-ignore
            rows[index].LOAN_AMT = "";
          }
        }
      } else {
        if (variables.A_FLAG === "LOAN_AMT" && data[0]?.O_STATUS === "0") {
          const newObj: any = {
            NO_OF_INST: data[0]?.TO_INST,
            EMI_RS: data[0]?.EMI_RS,
            TOT_INST: data[0]?.TO_INST,
            A_SR_CD: variables?.A_SR_CD,
          };
          const existingIndex = loanAmountRawsRef.current.findIndex(
            (item) => item.A_SR_CD === variables?.A_SR_CD
          );
          if (existingIndex !== -1) {
            loanAmountRawsRef.current[existingIndex] = newObj;
          } else loanAmountRawsRef.current.push(newObj);
        }
      }
    },
  });
  const loanAmountRawsRefData = loanAmountRawsRef.current.map((item) => {
    const { A_SR_CD, ...rest } = item;
    return rest;
  });
  console.log(loanAmountRawsRefData, "loanAmountRawsRefData");

  saveData([
    mergedTableData,
    DisbursMentRaws,
    loanAmountRawsRefData,
    {
      NO_OF_INST: initialRows[0]?.INSTALLMENT_NO,
      EMI_RS:
        !mutation?.isLoading && mutation?.isSuccess
          ? mutation?.data[0]?.EMI_RS
          : "0.00",
      TOT_INST: initialRows[0]?.INSTALLMENT_NO,
    },
  ]);

  const handleAddRow = () => {
    const updatedRows = [...rows];
    updatedRows.push({
      LOAN_AMT: "",
      DISBURSEMENT_DT: authState?.workingDate
        ? new Date(authState?.workingDate)
        : new Date(),
      INST_START_DT: authState?.workingDate
        ? new Date(authState?.workingDate)
        : new Date(),
    });
    setRows(updatedRows);
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleDeleteRow = (index: number) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const handleDialogCloseWithData = (stepUpData: any) => {
    if (selectedRowIndex !== null) {
      const updatedRows = [...rows];
      //@ts-ignore
      updatedRows[selectedRowIndex].TABLEDATA = stepUpData;
      setRows(updatedRows);
    }
    setOpen(false);
  };

  const selectedRowData =
    selectedRowIndex !== null
      ? //@ts-ignore
        rows[selectedRowIndex]?.TABLEDATA
      : {};

  const initialRow: any[] = [
    {
      ...(!mutation?.isLoading && mutation?.isSuccess ? mutation?.data[0] : {}),
      ...initialRows[0],
      FLAG: selectedFlagRef.current,
      NO_OF_INST: initialRows[0]?.INSTALLMENT_NO,
      newRowAdded: true,
    },
  ];

  const handleStepUpClick = (index: number) => {
    setSelectedRowIndex(index);
    setOpen(true);
  };

  const handleBlur = async (index, flag) => {
    selectedIndexRef.current = index;
    selectedFlagRef.current = flag;

    const updatedRows = [...rows];

    const DISBURSEMENT_DT = updatedRows[index]?.DISBURSEMENT_DT;
    const INST_START_DT = updatedRows[index]?.INST_START_DT;
    const LOAN_AMT = updatedRows[index]?.LOAN_AMT;

    if (LOAN_AMT || INST_START_DT) {
      const prevRow = index > 0 ? updatedRows[index - 1] : 0;
      const PREV_DISBUR_DT = prevRow?.DISBURSEMENT_DT ?? DISBURSEMENT_DT;

      const totalDisbursAmt = updatedRows.reduce((sum, row) => {
        const amt = Number(row.LOAN_AMT) || 0;
        return sum + amt;
      }, 0);

      mutation.mutate({
        A_FLAG:
          flag === "DISBURSEMENT_DT"
            ? "DISBURSEMENT_DT"
            : flag === "INST_START_DT"
            ? "INST_START_DT"
            : flag === "LOAN_AMT"
            ? "LOAN_AMT"
            : "",
        A_INST_NO: initialRows[0]?.INSTALLMENT_NO ?? "",
        A_INST_TYPE: initialRows[0]?.INST_TYPE ?? "1",
        A_INT_RATE: initialRows[0]?.INT_RATE ?? "",
        A_INST_PERIOD: initialRows[0]?.INST_PERIOD ?? "",
        A_INT_SKIP_FLAG: initialRows[0]?.DATA_VAL ?? "",
        A_SR_CD: `${index + 1}`,
        A_PREV_DISBUR_DT: PREV_DISBUR_DT
          ? format(new Date(PREV_DISBUR_DT), "dd/MMM/yyyy")
          : "",

        A_DISBURSEMENT_DT: DISBURSEMENT_DT
          ? format(new Date(DISBURSEMENT_DT), "dd/MMM/yyyy")
          : "",

        A_INST_START_DT: INST_START_DT
          ? format(new Date(INST_START_DT), "dd/MMM/yyyy")
          : "",
        A_DISBURS_AMT: LOAN_AMT ?? "",
        A_TOT_LOAN_AMT: `${totalDisbursAmt}`,
        A_GD_DATE: authState?.workingDate ?? "",
        A_SCREEN_REF: "RPT/1199",
        A_LANG: i18n.resolvedLanguage,
        A_USER: authState?.user?.id ?? "",
        A_USER_LEVEL: authState?.role ?? "",
      });
    }
  };

  return (
    <>
      <AppBar position="relative" color="secondary">
        <Toolbar
          className={headerClasses.root}
          variant="dense"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Chip
            style={{ color: "white", marginLeft: "8px" }}
            variant="outlined"
            color="primary"
            size="small"
            label={`Total Loan Amount: ${totalDisbursAmt.toFixed(2)}`}
          />
          <GradientButton
            onClick={handleAddRow}
            color={"primary"}
            style={{ width: "10%", margin: "5px" }}
          >
            {t("addRow")}
          </GradientButton>
        </Toolbar>
      </AppBar>

      {mutation.isLoading && <LinearProgress color="secondary" />}
      <TableContainer component={Paper} sx={{ p: 2 }}>
        <Table aria-label="simple table" padding="none">
          <TableHead>
            <TableRow id="topHead">
              <TableCell id="head">{t("SrNo")}</TableCell>
              <TableCell id="head">{t("DisburseDate")}</TableCell>
              <TableCell id="head">{t("InstStartDate")}</TableCell>
              <TableCell id="head">{t("LoanAmount")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.unqID}>
                <TableCell
                  sx={{
                    minWidth: 10,
                    width: 10,
                    maxWidth: 10,
                    padding: 0,
                  }}
                  style={{ verticalAlign: "baseline" }}
                >
                  <CustomTextField
                    value={index + 1}
                    onBlur={() => {}}
                    disabled={true}
                    type="number"
                    onChange={() => {}}
                  />
                </TableCell>
                <TableCell
                  sx={{ minWidth: 80, width: 80, maxWidth: 100 }}
                  style={{ verticalAlign: "baseline" }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      disabled={false}
                      value={row.DISBURSEMENT_DT}
                      format={"dd/MM/yyyy"}
                      onChange={(newValue) => {
                        if (utilFunction.isValidDate(newValue)) {
                          handleChange(index, "DISBURSEMENT_DT", newValue);
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          inputRef: dateInputRef,
                          onBlur: (event) => {
                            handleBlur(index, "DISBURSEMENT_DT");
                          },
                          inputProps: {
                            style: {
                              height: "0.3em",
                            },
                          },
                          FormHelperTextProps: {
                            style: {
                              display: "none",
                            },
                          },
                          variant: "outlined",
                        },
                      }}
                      onClose={() => {
                        setTimeout(() => {
                          handleBlur(index, "DISBURSEMENT_DT");
                        }, 10);
                      }}
                    />
                  </LocalizationProvider>
                </TableCell>

                <TableCell
                  sx={{ minWidth: 100, width: 80, maxWidth: 100 }}
                  style={{ verticalAlign: "baseline" }}
                >
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      disabled={false}
                      value={row.INST_START_DT}
                      format={"dd/MM/yyyy"}
                      onChange={(newValue) => {
                        if (utilFunction.isValidDate(newValue)) {
                          handleChange(index, "INST_START_DT", newValue);
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          inputRef: dateInputRef,
                          onBlur: (event) => {
                            handleBlur(index, "INST_START_DT");
                          },
                          inputProps: {
                            style: {
                              height: "0.3em",
                            },
                          },
                          FormHelperTextProps: {
                            style: {
                              display: "none",
                            },
                          },
                          variant: "outlined",
                        },
                      }}
                      onClose={() => {
                        setTimeout(() => {
                          handleBlur(index, "INST_START_DT");
                        }, 10);
                      }}
                    />
                  </LocalizationProvider>
                </TableCell>

                <TableCell
                  sx={{ minWidth: 80, width: 100, maxWidth: 110 }}
                  style={{ verticalAlign: "baseline" }}
                >
                  <CustomAmountField
                    value={row.LOAN_AMT}
                    inputRef={loanAmountInputRef}
                    placeHolder={"Enter Loan Amount"}
                    maxAmount={10000000000}
                    onBlur={() => {
                      handleBlur(index, "LOAN_AMT");
                    }}
                    onChange={(e) =>
                      handleChange(index, "LOAN_AMT", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell
                  style={{ width: "300px", verticalAlign: "baseline" }}
                >
                  <GradientButton
                    disabled={
                      // mutation.isLoading || initialRow[0]?.EMI_RS === ""
                      //@ts-ignore
                      // rows[selectedIndexRef.current]?.LOAN_AMT === "" ||
                      mutation?.isLoading
                    }
                    onClick={() => handleStepUpClick(index)}
                    style={{
                      transform: "translateY(11px)",
                    }}
                  >
                    {t("StepUpDown")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => handleDeleteRow(index)}
                    disabled={index === 0}
                    style={{
                      transform: "translateY(11px)",
                    }}
                  >
                    {t("Remove")}
                  </GradientButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {open && (
        <Dialog
          open={open}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              padding: "20px",
              borderRadius: "10px",
            },
          }}
        >
          <CustomGridTable
            close={() => setOpen(false)}
            onCloseWithData={handleDialogCloseWithData}
            initialData={
              Array.isArray(selectedRowData) ? selectedRowData : initialRow
            }
            //@ts-ignore
            totalInstallment={initialRows[0]?.INSTALLMENT_NO}
          />
        </Dialog>
      )}
    </>
  );
};
