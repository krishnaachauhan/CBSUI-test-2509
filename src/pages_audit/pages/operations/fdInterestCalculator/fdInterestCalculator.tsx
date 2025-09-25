import {
  ClearCacheProvider,
  LoaderPaperComponent,
  PDFViewer,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { extractMetaData } from "@acuteinfo/common-base";
import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { metaData } from "./metaData";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useMutation } from "react-query";
import { AppBar, Dialog, Toolbar, Typography } from "@mui/material";
import { format } from "date-fns";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { FDIntScheduleGrid } from "../fix-deposit/fdIntScheduleGrid";

const useTypeStyles: any = makeStyles((theme: Theme) => ({
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
const FdInterestCalculator = () => {
  let currentPath = useLocation().pathname;
  const [formMode, setFormMode] = useState("add");
  const [calcSwitch, setCalcSwitch] = useState("P");
  const { authState } = useContext(AuthContext);
  const isErrorFuncRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const headerClasses = useTypeStyles();
  const [formKey, setFormKey] = useState(Date.now());
  const [fileBlob, setFileBlob] = useState<any>(null);
  const [openPrint, setOpenPrint] = useState<any>(null);
  const formRef = useRef<any>();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [openIntSchedule, setOpenIntSchedule] = useState<boolean>(false);
  const apiReqDataRef = useRef<any>({});
  const compareSheetReportMutation = useMutation(
    API.getCompareSheetReport,

    {
      onError: (error: any) => {},
      onSuccess: (data) => {
        let blobData = utilFunction.blobToFile(data, "");
        if (blobData) {
          setFileBlob(blobData);
          setOpenPrint(true);
        }
      },
    }
  );
  const recurringToFDReportMutation = useMutation(
    API.getRecurringFdReport,

    {
      onError: (error: any) => {},
      onSuccess: (data) => {
        let blobData = utilFunction.blobToFile(data, "");
        if (blobData) {
          setFileBlob(blobData);
          setOpenPrint(true);
        }
      },
    }
  );

  // Function to handle INT_SCHEDULE logic
  const handleIntSchedule = useCallback(
    (fields: any) => {
      const suffix = fields?.CALCSWITCH?.value === "D" ? "_D" : "_P";

      // safely get value with suffix
      const getVal = (key: string) => fields?.[`${key}${suffix}`]?.value;

      if (
        fields?.BRANCH_CD?.value?.trim() &&
        getVal("ACCT_TYPE")?.trim() &&
        getVal("MATURITY_DT") &&
        Number(getVal("INT_RATE")) > 0 &&
        getVal("TRAN_DT") &&
        getVal("PERIOD_NO") &&
        (fields?.CALCSWITCH?.value === "P"
          ? fields?.PERIOD_NO_DISP_P?.value
          : getVal("PERIOD_CD")?.trim()) &&
        getVal("TERM_CD")?.trim() &&
        getVal("PRINCIPAL_AMT")?.trim()
      ) {
        apiReqDataRef.current = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: fields?.BRANCH_CD?.value ?? "",
          ACCT_TYPE: getVal("ACCT_TYPE") ?? "",
          PERIOD_CD:
            fields?.CALCSWITCH?.value === "P"
              ? fields?.PERIOD_NO_DISP_P?.value
              : getVal("PERIOD_CD")?.trim(),
          PERIOD_NO: getVal("PERIOD_NO") ?? "",
          TERM_CD: getVal("TERM_CD") ?? "",
          TRAN_DT: getVal("TRAN_DT")
            ? format(getVal("TRAN_DT"), "dd-MMM-yyyy")
            : "",
          TOT_AMT: Number(getVal("PRINCIPAL_AMT") ?? 0),
          INT_RATE: getVal("INT_RATE") ?? "",
          MATURITY_DT: getVal("MATURITY_DT")
            ? format(getVal("MATURITY_DT"), "dd-MMM-yyyy")
            : "",
        };

        setOpenIntSchedule(true);
      }
    },
    [authState?.companyID, setOpenIntSchedule]
  );

  const handleButtonClick = async (id: string, fields: any) => {
    let event: any = { preventDefault: () => {} };
    if (id === "NEW_DATE_BTN") {
      setCalcSwitch("D");
      // setFormKey(Date.now());
      formRef.current?.handleFormReset(event, "Reset");
    } else if (id === "NEW_PERIOD_BTN") {
      setCalcSwitch("P");
      formRef.current?.handleFormReset(event, "Reset");
      // setFormKey(Date.now());
    } else if (id === "CAL_COMPARE_SHEET_BTN" || id === "CAL_FD_REPORT__BTN") {
      let event: any = { preventDefault: () => {} };
      formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
    } else if (id === "INT_SCHEDULE") {
      handleIntSchedule(fields);
    }
  };
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    if (data?.CALCSWITCH === "S") {
      isErrorFuncRef.current = {
        data: {
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          HANDBOOK_FLG: "Y",
          FR_DT: format(new Date(data?.TRAN_DT_S), "dd/MMM/yyyy"),
          PERIOD_CD:
            data?.PERIOD_NO_DISP_S === "D"
              ? "Day(s)"
              : data?.PERIOD_NO_DISP_S === "M"
              ? "Month(s)"
              : data?.PERIOD_NO_DISP_S === "Y"
              ? "Year(s)"
              : null,
          PERIOD_NO: data?.PERIOD_NO_S,
          AMOUNT: data?.PRINCIPAL_AMT_S,
          TO_DT: format(new Date(data?.MATURITY_DT_S), "dd/MMM/yyyy"),
          TRAN_CD: data?.RATE_DEFINATION_S,
          GD_TODAY: authState?.workingDate,
          SPL_AMT_FLG: "Y",
          SCREEN_REF: docCD,
        },
        displayData,
        endSubmit,
        setFieldError,
      };
      compareSheetReportMutation.mutate({
        ...isErrorFuncRef.current?.data,
      });
    } else {
      isErrorFuncRef.current = {
        data: {
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          ASON_DT: format(new Date(data?.TRAN_DT_F), "dd/MMM/yyyy"),
          TRAN_CD: data?.RATE_DEFINATION_F,
          CATEG_CD: data?.CATEG_CD_F,
          PROPOSED: data?.REMARK_F,
          SCREEN_REF: docCD,
        },
        displayData,
        endSubmit,
        setFieldError,
      };
      recurringToFDReportMutation.mutate({
        ...isErrorFuncRef.current?.data,
      });
    }
  };

  return (
    <>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {utilFunction.getDynamicLabel(
              currentPath,
              authState?.menulistdata,
              true
            )}
          </Typography>
        </Toolbar>
      </AppBar>
      <FormWrapper
        key={formKey}
        ref={formRef}
        metaData={extractMetaData(metaData, formMode) as MetaDataType}
        displayMode={formMode}
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          COMP_CD: authState.companyID,
          BRANCH_CD: authState.user.branchCode,
          CALCSWITCH: calcSwitch,
        }}
        onFormButtonClickHandel={handleButtonClick}
        formState={{
          MessageBox: MessageBox,
          docCD: docCD,
        }}
        hideHeader={true}
        formStyle={{
          background: "white",
        }}
      ></FormWrapper>
      {compareSheetReportMutation?.isLoading ||
      recurringToFDReportMutation?.isLoading ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              overflow: "auto",
              padding: "10px",
              width: "600px",
              height: "100px",
            },
          }}
          maxWidth="md"
        >
          <LoaderPaperComponent />
        </Dialog>
      ) : (
        Boolean(fileBlob && fileBlob?.type?.includes("pdf")) &&
        Boolean(openPrint) && (
          <Dialog
            open={true}
            PaperProps={{
              style: {
                width: "100%",
                overflow: "auto",
                padding: "10px",
                height: "100%",
              },
            }}
            maxWidth="xl"
          >
            <PDFViewer
              blob={fileBlob}
              fileName={`${"Fd Interest Calculator"}`}
              onClose={() => setOpenPrint(false)}
            />
          </Dialog>
        )
      )}
      {openIntSchedule ? (
        <FDIntScheduleGrid
          setOpenIntSchedule={setOpenIntSchedule}
          apiReqData={apiReqDataRef.current}
        />
      ) : null}
    </>
  );
};

export const FdInterestCalculatorMain = () => {
  return (
    <ClearCacheProvider>
      <FdInterestCalculator />
    </ClearCacheProvider>
  );
};
