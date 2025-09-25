import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DisburseEntryMetadata,
  formatDateField,
} from "./DisburseEntryMetaData";
import {
  ClearCacheProvider,
  FormWrapper,
  getGridRowData,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  PDFViewer,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { CircularProgress, Dialog, Paper } from "@mui/material";
import { t } from "i18next";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import LoanRepayment from "./Grid/LoanRepayment";
import TransactionDeatils from "./Grid/TransactionDetails";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { PayslipAndDDForm } from "../recurringPaymentEntry/payslipAndNEFT/payslipAndDDForm";
import { BeneficiaryAcctDetailsForm } from "../recurringPaymentEntry/payslipAndNEFT/beneficiaryAcctDetailsForm";
import { SIEntry } from "../disburseEntry/SIEntry";

const DisburseEntryMain = (closeDialog) => {
  const transactionApi = useRef<any>();
  const loanRepaymentApi = useRef<any>();
  const formRef = useRef<any>();
  const dataRef = useRef<any>();
  const formDeatilsRef = useRef(null);
  const confTrn = useRef<any>();

  let currentPath = useLocation().pathname;
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { commonClass, dialogClassNames } = useDialogContext();

  const [gridData, setGridData] = useState({
    firstGrid: [],
    secondGrid: [],
  });
  const [dataClass, setDataClass] = useState("");
  const [acctCd, setAcctCd] = useState(true);
  const [isProceedEnabled, setIsProceedEnabled] = useState(false);
  const [openNEFT, setOpenNEFT] = useState(false);
  const [openDD, setOpenDD] = useState(false);
  const [openSI, setOpenSI] = useState(false);
  const [siEntryData, setSiEntryData] = useState<any>([]);
  const [fileBlob, setFileBlob] = useState<any>(null);
  const [openPrint, setOpenPrint] = useState<any>(false);
  const [disableButton, setDisableButton] = useState(false);

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  const requestParameter = {
    ENT_BRANCH_CD: dataRef?.current?.ENT_BRANCH_CD,
    COMP_CD: dataRef?.current?.COMP_CD,
    BRANCH_CD: dataRef?.current?.BRANCH_CD,
    ACCT_TYPE: dataRef?.current?.ACCT_TYPE,
    ACCT_CD: dataRef?.current?.ACCT_CD,
    LIMIT_AMOUNT: dataRef?.current?.NEW_AMT,
    INT_RATE: dataRef?.current?.INT_RATE,
    INST_TYPE: dataRef?.current?.INSTALLMENT_TYPE,
    TYPE_CD: dataRef?.current?.TYPE_CD,
    INT_SKIP_FLAG: dataRef?.current?.INT_SKIP_FLAG,
    INT_SKIP_REASON_TRAN_CD: dataRef?.current?.INT_SKIP_REASON_TRAN_CD,
    PARA_162: dataRef?.current?.PARA_162,
    A_TRN_DTL: Array.isArray(getGridRowData(transactionApi))
      ? getGridRowData(transactionApi).map(({ errors, loader, ...item }) => {
          return {
            ...item,
            CHEQUE_NO: "",
            CHEQUE_DT: "",
            NEFT_THROUGH_BANK: item?.FROM_INST_ID || item?.FROM_INST || "",
          };
        })
      : [],
  };

  const getScheduleMutation = useMutation(API.getDisbSchedule, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
        if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            icon: "ERROR",
          });
          setOpenPrint(false);
        } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            break;
          }
        }
      }
      let blobData = utilFunction.blobToFile(data, "");
      if (blobData) {
        setOpenPrint(true);
        setFileBlob(blobData);
        setIsProceedEnabled(true);
      }
    },
  });

  const viewMemoRequestParameter = {
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: dataRef?.current?.BRANCH_CD ?? "",
    ACCT_TYPE: dataRef?.current?.ACCT_TYPE ?? "",
    ACCT_CD: dataRef?.current?.ACCT_CD ?? "",
    TRAN_DT: authState?.workingDate ?? "",
    SCREEN_REF: docCD ?? "",
  };

  const viewMemoMutation = useMutation(API.viewmemo, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
        if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            icon: "ERROR",
          });
          setOpenPrint(false);
        } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            break;
          }
        }
      }
      let blobData = utilFunction.blobToFile(data, "");
      if (blobData) {
        setFileBlob(blobData);
        setOpenPrint(true);
      }
    },
  });

  const InsertAPI = useMutation(API.insertAPi, {
    onSuccess: async (data) => {
      for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
        if (openDD) setOpenDD(false);
        if (openNEFT) setOpenNEFT(false);
        const msg = data?.[0]?.MSG[i];
        if (msg?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: msg?.O_MSG_TITLE ?? "ValidationFailed",
            message: msg?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (msg?.O_STATUS === "9") {
          const okButton = await MessageBox({
            messageTitle: msg?.O_MSG_TITLE ?? "Alert/Information",
            message: msg?.O_MESSAGE,
            buttonNames: ["Ok"],
            icon: "INFO",
          });
          if (okButton === "Ok") {
            const hasStatus99 = data?.[0]?.MSG?.some(
              (msg99) => msg99?.O_STATUS === "99"
            );
            if (hasStatus99) {
              const status99Msg = data?.[0]?.MSG?.find(
                (msg99) => msg99?.O_STATUS === "99"
              );
              const btnName = await MessageBox({
                messageTitle: status99Msg?.O_MSG_TITLE ?? "Confirmation",
                message: status99Msg?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (btnName === "No") {
                setOpenSI(false);
                setSiEntryData([]);
                setGridData({ firstGrid: [], secondGrid: [] });
                formDeatilsRef.current = null;
                setIsProceedEnabled(false);
                setAcctCd(true);
                viewMemoMutation?.mutate({
                  ...viewMemoRequestParameter,
                  TRAN_CD: data?.[0]?.TRAN_CD ?? "",
                });
                CloseMessageBox();
                return;
              } else {
                setOpenSI(true);
                setSiEntryData(data);
                setAcctCd(true);
                return;
              }
            }
            formRef?.current?.handleFormReset({ preventDefault: () => {} });
            setGridData({ firstGrid: [], secondGrid: [] });
            formDeatilsRef.current = null;
            setIsProceedEnabled(false);
          }
        } else {
          viewMemoMutation?.mutate({
            ...viewMemoRequestParameter,
            TRAN_CD: data?.[0]?.TRAN_CD ?? "",
          });
        }
      }
      CloseMessageBox();
    },
    onError: (error: any) => {
      const errorMsg = error?.error_msg ?? "Unknown Error occurred";
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
  });

  const DisbConfentry = useMutation(API.validateDisbentry, {
    onSuccess: async (data) => {
      confTrn.current = data?.[0];
      for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
        if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
          const confirmResponse = await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (confirmResponse === "Yes") {
            const type_cd = getGridRowData(transactionApi);
            if (type_cd?.[0]?.TYPE_CD === "DD") {
              setOpenDD(true);
            } else if (type_cd?.[0]?.TYPE_CD === "NEFT") {
              setOpenNEFT(true);
            } else {
              const secondgrid: any = getGridRowData(loanRepaymentApi);
              const rowData = secondgrid?.map((secondgrid) => ({
                INS_START_DT: formatDateField(secondgrid?.INS_START_DT),
                FROM_INST: secondgrid?.FROM_INST ?? "",
                TO_INST: secondgrid?.TO_INST ?? "",
                EMI_RS: secondgrid?.INST_RS ?? "",
              }));
              InsertAPI?.mutate({
                ...requestParameter,
                INST_NO: secondgrid?.[0]?.INST_NO,
                SCHEDULE_DTL: rowData ?? "",
                GEN_NEFT_DD: confTrn?.current?.GEN_NEFT_DD,
                A_NEFT_DD_DTL: [],
              });
            }
          }
        } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[0]?.MSG[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        }
      }
      CloseMessageBox();
    },
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  const handleGetSchedule = async () => {
    const formData = await dataRef?.current;
    const row: any = gridData?.secondGrid;

    // validate transaction details fields
    const transactionRow = getGridRowData(transactionApi);
    for (let i = 0; i < transactionRow.length; i++) {
      const row = transactionRow[i];

      if (row?.DEL_FLAG === "Y") continue;

      const type = row?.TYPE_CD;
      if (type === "NEFT" || type === "DD") {
        if (!row?.TYPE_CD || !row?.DISB_AMT || !row?.REMARKS) {
          MessageBox({
            message: `Please fill required fields in Transaction Details. Missing fields at row ${
              i + 1
            }`,
            messageTitle: "Validation Failed",
            icon: "ERROR",
          });
          return;
        }
      } else {
        if (
          !row?.TYPE_CD ||
          !row?.DISB_AMT ||
          !row?.REMARKS ||
          !row?.OPP_BRANCH_CD ||
          !row?.OPP_ACCT_TYPE ||
          !row?.OPP_ACCT_CD
        ) {
          MessageBox({
            message: `Please fill required fields in Disbursement Transaction Details. Missing fields at row ${
              i + 1
            }`,
            messageTitle: "Validation Failed",
            icon: "ERROR",
          });
          return;
        }
      }
    }

    // validate loan repayment fields
    const loanRow = getGridRowData(loanRepaymentApi);
    for (let i = 0; i < loanRow.length; i++) {
      const row = loanRow[i];
      if (!row?.FROM_INST || !row?.TO_INST) {
        MessageBox({
          message: `Please fill required fields in Loan Repayment Schedule. Missing fields at row ${
            i + 1
          }`,
          messageTitle: "Validation Failed",
          icon: "ERROR",
        });
        return;
      }
    }

    const SecondGrid = loanRow?.map((row: any) => ({
      INS_START_DT: formatDateField(row?.INS_START_DT),
      FROM_INST: row?.FROM_INST ?? "",
      TO_INST: row?.TO_INST ?? "",
      EMI_RS: row?.INST_RS ?? "",
    }));
    const reqParameters = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: formData?.BRANCH_CD ?? "",
      ACCT_TYPE: formData?.ACCT_TYPE ?? "",
      ACCT_CD: formData?.ACCT_CD ?? "",
      NEW_AMT: formData?.NEW_AMT ?? "",
      INT_RATE: formData?.INT_RATE ?? "",
      INST_NO: row?.[0]?.INST_NO ?? "",
      INSTALLMENT_TYPE: formData?.INSTALLMENT_TYPE ?? "",
      TYPE_CD: formData?.TYPE_CD ?? "",
      SCHEDULE_DTL: SecondGrid,
      INS_START_DT: formatDateField(loanRow?.[0]?.INS_START_DT),
      INT_SKIP_FLAG: formData?.INT_SKIP_FLAG ?? "",
      INT_SKIP_REASON_TRAN_CD: formData?.INT_SKIP_REASON_TRAN_CD ?? "",
      SANCTION_DT: formatDateField(formData?.SANCTION_DT),
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      SCREEN_REF: docCD ?? "",
    };
    getScheduleMutation.mutate({
      ...reqParameters,
    });
    formDeatilsRef.current = { ...formData, ...gridData?.secondGrid };
  };

  const handleProceed = async () => {
    const secondgrid: any = getGridRowData(loanRepaymentApi);
    const rowData = secondgrid?.map((secondgrid) => ({
      INS_START_DT: formatDateField(secondgrid?.INS_START_DT),
      FROM_INST: secondgrid?.FROM_INST ?? "",
      TO_INST: secondgrid?.TO_INST ?? "",
      EMI_RS: secondgrid?.INST_RS ?? "",
    }));
    DisbConfentry?.mutate({
      COMP_CD: dataRef?.current?.COMP_CD ?? "",
      BRANCH_CD: dataRef?.current?.BRANCH_CD ?? "",
      ACCT_TYPE: dataRef?.current?.ACCT_TYPE ?? "",
      ACCT_CD: dataRef?.current?.ACCT_CD ?? "",
      INST_NO: secondgrid?.[0]?.INST_NO ?? "",
      SCHEDULE_DTL: rowData ?? "",
      TRN_DTL: Array.isArray(getGridRowData(transactionApi))
        ? getGridRowData(transactionApi).map(
            ({ errors, loader, ...item }) => item
          )
        : "",
    });
  };

  const paysBenefSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);
    const secondgrid: any = getGridRowData(loanRepaymentApi);
    const rowData = secondgrid?.map((secondgrid) => ({
      INS_START_DT: formatDateField(secondgrid?.INS_START_DT),
      FROM_INST: secondgrid?.FROM_INST ?? "",
      TO_INST: secondgrid?.TO_INST ?? "",
      EMI_RS: secondgrid?.INST_RS ?? "",
    }));
    const type_cd = getGridRowData(transactionApi);
    const txnType = type_cd?.[0]?.TYPE_CD;

    if (txnType === "DD" || txnType === "NEFT") {
      if (Number(data?.TOTAL_AMOUNT) !== Number(data?.PAYMENT_AMOUNT)) {
        let msg =
          txnType === "DD"
            ? "PayslipAmountShouldTallyWithPaymentAmount"
            : "NEFTAmountShouldTallyWithPaymentAmount";

        let buttonName = await MessageBox({
          messageTitle: "PaymentAmountNotTally",
          message: msg,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });

        if (buttonName === "Ok") {
          CloseMessageBox();
        }
        return;
      }
    }
    const buttonName = await MessageBox({
      messageTitle: "Confirmation",
      message: "AreYouSureToContinue",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      InsertAPI?.mutate({
        ...requestParameter,
        INST_NO: secondgrid?.[0]?.INST_NO,
        SCHEDULE_DTL: rowData ?? "",
        GEN_NEFT_DD: confTrn?.current?.GEN_NEFT_DD,
        A_NEFT_DD_DTL:
          type_cd?.[0]?.TYPE_CD === "DD"
            ? [...(data?.PAYSLIPDD || [])]
            : [...(data?.BENEFIACCTDTL || [])],
      });
    }
  };

  //Initial values for Payslip Form
  const accountDetailsForDD = {
    PAYSLIPDD: [
      {
        FROM_CERTI_NO: "",
      },
    ],
    INSTRUCTION_REMARKS: `NEW DISBURSEMENT:-${
      dataRef?.current?.BRANCH_CD?.trim() ?? ""
    }-${dataRef?.current?.ACCT_TYPE?.trim() ?? ""}-${
      dataRef?.current?.ACCT_CD?.trim() ?? ""
    }`,
    DEFAULT_INFAVOUR_OF: dataRef?.current?.ACCT_NM ?? "",
    PAYMENT_AMOUNT: Number(getGridRowData(transactionApi)?.[0]?.DISB_AMT ?? 0),
    BRANCH_CD: dataRef?.current?.BRANCH_CD,
    ACCT_TYPE: dataRef?.current?.ACCT_TYPE,
    ACCT_CD: dataRef?.current?.ACCT_CD,
    SCREEN_REF: docCD ?? "",
    SCREEN_NAME:
      utilFunction.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        false
      ) ?? "",
    COMP_CD: authState?.companyID ?? "",
  };

  //Initial values For Beneficiary Form
  const accountDetailsForBen = {
    BENEFIACCTDTL: [
      {
        AMOUNT: Number(getGridRowData(transactionApi)?.[0]?.DISB_AMT ?? 0),
      },
    ],
    DEFAULT_REMARKS: `NEW DISBURSEMENT:-${
      dataRef?.current?.BRANCH_CD?.trim() ?? ""
    }-${dataRef?.current?.ACCT_TYPE?.trim() ?? ""}-${
      dataRef?.current?.ACCT_CD?.trim() ?? ""
    }`,
    PAYMENT_AMOUNT: getGridRowData(transactionApi)?.[0]?.DISB_AMT,
    ACCT_TYPE: dataRef?.current?.ACCT_TYPE ?? "",
    BRANCH_CD: dataRef?.current?.BRANCH_CD ?? "",
    ACCT_CD: dataRef?.current?.ACCT_CD ?? "",
    ENTRY_TYPE: "NEFT",
    SCREEN_NAME:
      utilFunction.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        false
      ) ?? "",
  };

  DisburseEntryMetadata.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );

  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);

  return (
    <Fragment>
      <FormWrapper
        key={"disburse-entry"}
        metaData={DisburseEntryMetadata as MetaDataType}
        initialValues={{}}
        onSubmitHandler={() => {}}
        formStyle={{
          background: "white",
        }}
        ref={formRef}
        setDataOnFieldChange={(action, payload) => {
          if (action === "NEW_AMT") {
            if (!payload?.value) {
              setGridData({ firstGrid: [], secondGrid: [] });
              setIsProceedEnabled(false);
              setAcctCd(true);
            }
          }
          if (action === "ACCT_CD") {
            setGridData({ firstGrid: [], secondGrid: [] });
            setIsProceedEnabled(false);
            setAcctCd(true);
          }
          if (action === "GRID_DATA") {
            setGridData((prev) => ({
              firstGrid: payload?.GRID_DATA?.[0]?.TRN_DTL,
              secondGrid: payload?.GRID_DATA?.map((row) => ({
                INST_NO: row?.INST_NO,
                INST_RS: row?.INST_RS,
                INS_START_DT: row?.INS_START_DT,
                TO_INST: row?.TO_INST,
                FROM_INST: row?.FROM_INST,
                DISABLE_INS_START_DT: row?.DISABLE_INS_START_DT,
              })),
            }));
            if (payload?.GRID_DATA && payload.GRID_DATA.length > 0) {
              setAcctCd(false);
            }
          }
        }}
        formState={{
          docCD: docCD,
          MessageBox: MessageBox,
          dataRef: dataRef,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
      />

      <TransactionDeatils
        formRef={formRef}
        gridData={gridData?.firstGrid}
        transactionApi={transactionApi}
      />

      <LoanRepayment
        formRef={dataRef}
        gridData={gridData?.secondGrid}
        loanRepaymentApi={loanRepaymentApi}
      />

      {(openDD || openNEFT) && (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              maxWidth: "1335px",
            },
          }}
        >
          {openDD && (
            <PayslipAndDDForm
              defaultView="new"
              accountDetailsForPayslip={accountDetailsForDD}
              onSubmitHandler={paysBenefSubmitHandler}
              handleDialogClose={() => setOpenDD(false)}
              hideHeader={false}
              handleDisableButton={handleButtonDisable}
            />
          )}
          {openNEFT && (
            <BeneficiaryAcctDetailsForm
              accountDetailsForBen={accountDetailsForBen}
              defaultView="new"
              onSubmitHandler={paysBenefSubmitHandler}
              handleDialogClose={() => setOpenNEFT(false)}
              hideHeader={false}
              handleDisableButton={handleButtonDisable}
            />
          )}
        </Dialog>
      )}

      {openSI && (
        <SIEntry
          closeDialog={() => setOpenSI(false)}
          dataRef={dataRef}
          insertApiData={siEntryData}
          viewMemoMutation={viewMemoMutation}
          viewMemoRequestParameter={viewMemoRequestParameter}
        />
      )}

      <Paper style={{ marginTop: "2px" }}>
        <GradientButton disabled={acctCd} onClick={handleGetSchedule}>
          {t("getSchedule")}
        </GradientButton>
        <GradientButton
          disabled={!isProceedEnabled || DisbConfentry?.isLoading}
          onClick={handleProceed}
          endIcon={
            DisbConfentry?.isLoading ? <CircularProgress size={20} /> : null
          }
        >
          {t("Proceed")}
        </GradientButton>
      </Paper>

      {getScheduleMutation.isLoading || viewMemoMutation?.isLoading ? (
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
            open={openPrint}
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
              fileName={`${"Disbursement Entry"}`}
              onClose={() => setOpenPrint(false)}
            />
          </Dialog>
        )
      )}
    </Fragment>
  );
};

export const DisburseEntry = (closeDialog) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <DisburseEntryMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
