import { Fragment, useContext, useRef, useState } from "react";
import { RecurringCalculatotMetaData, RecurringGridMetaData } from "./metaData";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import * as API from "./api";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { format } from "date-fns";
import { makeStyles } from "@mui/styles";
import logo from "assets/images/logo.jpg";
import {
  Box,
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ClearCacheProvider,
  GridWrapper,
  GradientButton,
  useDialogStyles,
  PrintButton,
  MetaDataType,
  utilFunction,
  FormWrapper,
  usePopupContext,
  extractMetaData,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
const useTypeStyles = makeStyles(() => ({
  tableCell: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "0px 2px 0px 3px",
    lineHeight: "34px",
    borderBottom: "0px",
  },
  cell1: {
    fontWeight: "bold",
  },
  root: {
    background: "var(--theme-color5)",
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
    borderRadius: "4px",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color2) !important",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));

const RecurringCalculatorForm = () => {
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [apiData, setApiData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [intRate, setIntRate] = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);
  const [printVisible, setPrintVisible] = useState(false);
  const bodyClasses = useTypeStyles();
  const classes = useDialogStyles();
  const [disableButton, setDisableButton] = useState(false);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  let a = 1;

  let currentPath = useLocation().pathname;
  const label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );
  RecurringCalculatotMetaData.form.label = label;

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  const showData = async () => {
    const formdata = await formRef?.current?.getFieldData();
    setIntRate(formdata?.INT_RATE);
    if (formdata.ACCT_TYPE && formdata.CATEG_CD && formdata.INST_NO) {
      mutation.mutate({
        ENT_COMP_CD: authState?.companyID,
        ENT_BRANCH_CD: authState?.user?.branchCode,
        INT_TYPE: formdata?.DATA_VAL,
        INST_NO: formdata?.INST_NO,
        INST_TYPE: formdata?.INSTALLMENT_TYPE,
        INST_AMT: formdata?.INST_AMT,
        INT_RATE: formdata?.INT_RATE,
        START_DT: format(new Date(formdata?.START_DT), "dd/MMM/yyyy"),
        SCREEN_REF: docCD ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      });
    }
  };
  const resetData = () => {
    let event: any = { preventDefault: () => {} };
    formRef?.current?.handleFormReset(event, "Reset");
    setApiData(null);
  };

  const mutation = useMutation(API.getRecurringCalculateData, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      setFormMode("add");
      setApiData(data);
      CloseMessageBox();
    },
  });

  const calculateTotals = (data: any[]) => {
    let totalInstAmt = 0;
    let totalBalanceAmt = 0;
    let totalMonthlyInt = 0;

    data.forEach((item) => {
      totalInstAmt += parseFloat(item.INST_AMT) || 0;
      totalBalanceAmt += parseFloat(item.BALANCE_AMT) || 0;
      totalMonthlyInt += parseFloat(item.MONTH_INT) || 0;
    });

    return {
      totalInstAmt,
      totalBalanceAmt,
      totalMonthlyInt,
    };
  };

  const totals = apiData
    ? calculateTotals(apiData)
    : {
        totalInstAmt: 0,
        totalBalanceAmt: 0,
        totalMonthlyInt: 0,
        totalCumulativeInt: 0,
      };

  return (
    <Fragment>
      <FormWrapper
        key={"RecurringCalculatotMetaData" + formMode}
        metaData={
          extractMetaData(RecurringCalculatotMetaData, formMode) as MetaDataType
        }
        formStyle={{
          background: "white",
        }}
        ref={formRef}
        initialValues={{
          START_DT: authState.workingDate,
          DUE_DATE: authState.workingDate,
          ENT_COMP_CD: authState.companyID,
          ENT_BRANCH_CD: authState.user.branchCode,
        }}
        formState={{
          MessageBox: MessageBox,
          docCd: "TRN/502",
          handleButtonDisable,
        }}
        onSubmitHandler={() => showData()}
      ></FormWrapper>
      <Box sx={{ paddingBottom: "10px" }}>
        <GradientButton onClick={showData} disabled={disableButton}>
          Calculate
        </GradientButton>
        <GradientButton onClick={resetData}>Reset</GradientButton>
        <PrintButton
          content={() => {
            setOpen(true);
            setPrintVisible(true);
            return printRef.current;
          }}
          buttonText="Print"
        />
      </Box>
      <GridWrapper
        key={"RecurringGridData"}
        finalMetaData={RecurringGridMetaData as GridMetaDataType}
        loading={mutation.isLoading}
        data={apiData ?? []}
        enableExport={true}
        setData={setApiData}
      />
      <Dialog
        open={open}
        //@ts-ignore
        PaperProps={{
          style: {
            width: "70%",
          },
        }}
        maxWidth="md"
        classes={{
          scrollPaper: classes.topScrollPaper,
          paperScrollBody: classes.topPaperScrollBody,
        }}
      >
        <Paper
          style={{
            width: "100%",
            padding: "10px",
            boxShadow: "none",
          }}
        >
          <Toolbar className={bodyClasses.root} variant={"dense"}>
            <Typography
              className={bodyClasses.title}
              color="inherit"
              variant={"h6"}
              component="div"
            >
              Detail Report
            </Typography>
            <PrintButton
              content={() => {
                return printRef.current;
              }}
              buttonText="Print"
            />
            <GradientButton onClick={() => setOpen(false)}>
              Close
            </GradientButton>
          </Toolbar>
        </Paper>
        {printVisible == true ? (
          <div ref={printRef} style={{ margin: 10 }}>
            <div className="nine">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "30%",
                  }}
                >
                  <img
                    src={logo}
                    alt="Logo"
                    width="auto"
                    height="auto"
                    style={{ marginRight: "10px" }}
                  />
                </div>
                <div
                  style={{
                    width: "70%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <h3>{authState.companyName}</h3>
                  <h5>
                    Branch:{" "}
                    {`${authState.user.branchCode} - ${authState.user.branch}`}
                  </h5>
                  <h5>Print Date: {`${authState.workingDate} ${label}`}</h5>
                </div>
              </div>
              <b>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginRight: "20px",
                  }}
                >
                  No. of Installment: {apiData?.length}
                  <div>Rate Of Interest (%) : {intRate} </div>
                </div>
              </b>
            </div>
            <TableContainer component={Paper}>
              <Table>
                <TableBody component="div">
                  <TableRow
                    component="div"
                    style={{ borderBottom: "2px dashed #000" }}
                  >
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      SR No.
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      Period
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      Installment Amount
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      Balance Amount
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      Interest Amt.
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      Running Int. Amt.
                    </TableCell>
                  </TableRow>
                  {apiData?.map((item, index) => (
                    <TableRow>
                      <TableCell className={`${bodyClasses.tableCell}`}>
                        {a++}
                      </TableCell>
                      <TableCell className={`${bodyClasses.tableCell} `}>
                        {format(new Date(item.INST_DT), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className={`${bodyClasses.tableCell} `}>
                        {" "}
                        {item.INST_AMT}
                      </TableCell>
                      <TableCell className={`${bodyClasses.tableCell}`}>
                        {item.BALANCE_AMT}
                      </TableCell>
                      <TableCell className={`${bodyClasses.tableCell}`}>
                        {item.MONTH_INT}
                      </TableCell>
                      <TableCell className={`${bodyClasses.tableCell} `}>
                        {item.CUM_INT}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    component="div"
                    style={{ borderTop: "2px dashed #000" }}
                  >
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                      colSpan={2}
                    >
                      Total Amount ={" "}
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      {totals.totalInstAmt.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      {parseFloat(apiData?.[0]?.DUE_AMT)?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    >
                      {totals.totalMonthlyInt.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`${bodyClasses.tableCell} ${bodyClasses.cell1}`}
                    ></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : (
          ""
        )}
      </Dialog>
    </Fragment>
  );
};

export const RecurringCalculatorFormWrapper = () => {
  return (
    <ClearCacheProvider>
      <RecurringCalculatorForm />
    </ClearCacheProvider>
  );
};
