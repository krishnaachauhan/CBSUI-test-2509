import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import * as API from "./api";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import {
  formatDateField,
  handleDisplayMessages,
  UnclaimPaymentMetaData,
} from "./UnclPaymentEntryMetaData";
import { t } from "i18next";
import { CircularProgress, Dialog } from "@mui/material";
import { UnclPaymentRetrieve } from "./UnclPaymentRetrieve";
import { useMutation } from "react-query";
import { PayslipAndDDForm } from "../recurringPaymentEntry/payslipAndNEFT/payslipAndDDForm";

const UnclPaymentEntryMain = ({ screenFlag, closeDialog, result }) => {
  let currentPath = useLocation().pathname;
  const retrievalParaRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();

  const [open, setOpen] = useState(true);
  const [accountDetails, setAccountDetails] = useState<any>([]);
  const [openDD, setOpenDD] = useState(false);
  const [columnNM, setColumnNM] = useState(false);
  const [disableButton, setDisableButton] = useState<boolean>(false);

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const rowsData = rows?.[0]?.data;
  const EnteredBy = rowsData?.PAYMENT_BY;

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  const unclaimConfirmationMutation = useMutation(API.unclaimConfirmationdata, {
    onSuccess: async (data, formState) => {
      await handleDisplayMessages(data, formState);

      await MessageBox({
        message: t(
          formState?.isConfirmed === true
            ? "confirmMsg"
            : formState?.isConfirmed === false
            ? "UnclaimedRejectMessage"
            : "paymentDone"
        ),
        messageTitle: "Success",
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });

      formRef?.current?.handleFormReset({ preventDefault: () => {} });
      setAccountDetails([]);
      closeDialog();
      result.mutate({
        screenFlag: "unclaimedCFM",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        workingDate: authState?.workingDate,
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        SCREEN_REF: docCD ?? "",
      });
    },
    onError: async (error: any) => {
      if (error?.error_msg) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      }
    },
  });

  // Retrieve Box
  const newEntry = () => {
    setColumnNM(false);
    setOpen(true);
  };

  const selectedDatas = (acctData, reqPara) => {
    setAccountDetails(acctData);
    if (acctData) retrievalParaRef.current = acctData;
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Confirm and Reject
  const handelChange = async (isConfirm) => {
    if (isConfirm === "C") {
      if (
        (EnteredBy || "").toLowerCase() ===
        (authState?.user?.id || "").toLowerCase()
      ) {
        await MessageBox({
          message: "NotOwnConfirm",
          messageTitle: "Warning",
          icon: "WARNING",
          buttonNames: ["Ok"],
        });
        return;
      } else {
        const Accept = await MessageBox({
          messageTitle: "Confirmation",
          message: "ConfirmRecord",
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });
        if (Accept === "Yes") {
          unclaimConfirmationMutation?.mutate({
            isConfirmed: true,
            TRAN_CD: rowsData?.TRAN_CD ?? "",
            ENTERED_COMP_CD: authState?.companyID ?? "",
            ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
            PAYSLIP: rowsData?.PAYSLIP ?? "",
            FLAG: "C",
            PAYMENT_DTL: {},
            DD_NEFT: [],
            SCREEN_REF: docCD ?? "",
          });
        }
      }
    } else if (isConfirm === "R") {
      const Accept = await MessageBox({
        messageTitle: "Confirmation",
        message: "DoYouWantDeleteRow",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (Accept === "Yes") {
        unclaimConfirmationMutation?.mutate({
          isConfirmed: false,
          TRAN_CD:
            screenFlag === "unclaimedCFM"
              ? rowsData?.TRAN_CD ?? ""
              : retrievalParaRef?.current?.[0]?.TRAN_CD ?? "",
          ENTERED_COMP_CD: authState?.companyID ?? "",
          ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
          PAYSLIP:
            screenFlag === "unclaimedCFM"
              ? rowsData?.PAYSLIP ?? ""
              : retrievalParaRef?.current?.[0]?.PAYSLIP ?? "",
          FLAG: "R",
          PAYMENT_DTL: {},
          DD_NEFT: [],
          SCREEN_REF: docCD ?? "",
        });
      }
    }
    CloseMessageBox();
  };

  // PayslipAndDDForm Save Button
  const paysBenefSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);
    const mainPaymentDtl = await formRef?.current?.getFieldData();
    const buttonName = await MessageBox({
      messageTitle: "Confirmation",
      message: "AreYouSureToContinue",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      unclaimConfirmationMutation.mutate({
        ENTERED_COMP_CD: authState?.companyID ?? "",
        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
        TRAN_CD: retrievalParaRef?.current?.[0]?.TRAN_CD,
        PAYSLIP: !data?.PAYSLIP ? "Y" : "N",
        FLAG: screenFlag === "entry" ? "P" : " ",
        PAYMENT_DTL: {
          ...mainPaymentDtl,
          INT_FROM_DT: formatDateField(mainPaymentDtl?.INT_FROM_DT),
          MOVE_DATE: formatDateField(mainPaymentDtl?.MOVE_DATE),
          PAYMENT_AMT: String(mainPaymentDtl?.PAYMENT_AMT),
          PAYSLIP: mainPaymentDtl?.PAYSLIP ? "Y" : "N",
          TOTAL: String(mainPaymentDtl?.TOTAL),
        },
        DD_NEFT: data?.PAYSLIPDD || [],
        SCREEN_REF: docCD ?? "",
      });
      endSubmit(true);
      setOpenDD(false);
    }
  };

  // Initial values for Payslip Form
  const accountDetailsForDD = {
    PAYSLIPDD: [
      {
        FROM_CERTI_NO: "",
      },
    ],
    INSTRUCTION_REMARKS: `Unclaimed A/C Payment:-${
      retrievalParaRef?.current?.[0]?.TO_BRANCH_CD?.trim() ?? ""
    }-${retrievalParaRef?.current?.[0]?.TO_ACCT_TYPE?.trim() ?? ""}-${
      retrievalParaRef?.current?.[0]?.TO_ACCT_CD?.trim() ?? ""
    }`,
    PAYMENT_AMOUNT: retrievalParaRef?.current?.[0]?.TRAN_BAL ?? 0,
    BRANCH_CD: retrievalParaRef?.current?.[0]?.TO_BRANCH_CD?.trim(),
    ACCT_TYPE: retrievalParaRef?.current?.[0]?.TO_ACCT_TYPE?.trim(),
    ACCT_CD: retrievalParaRef?.current?.[0]?.TO_ACCT_CD?.trim(),
    SCREEN_REF: docCD ?? "",
    SCREEN_NAME:
      utilFunction.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        false
      ) ?? "",
    COMP_CD: authState?.companyID ?? "",
  };

  // Filed Focus
  const trfAcctTypeIndex = UnclaimPaymentMetaData.fields.findIndex(
    (field) => field?.name === "TRF_COMP_CD"
  );
  const cashAmtIndex = UnclaimPaymentMetaData.fields.findIndex(
    (field) => field?.name === "TRF_AMT"
  );

  // Save Button
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    if (
      (data?.TRF_ACCT_TYPE === "" || data?.TRF_ACCT_CD === "") &&
      !data?.PAYSLIP
    ) {
      await MessageBox({
        message: t("accountNumber"),
        messageTitle: "ValidationFailed",
        icon: "ERROR",
      });
      endSubmit(true);
      if (trfAcctTypeIndex !== -1) {
        UnclaimPaymentMetaData.fields[trfAcctTypeIndex].isFieldFocused = true;
      }
      return;
    }

    if (data?.PAYMENT_AMT != data?.TOTAL) {
      await MessageBox({
        message: t("paymentAmount"),
        messageTitle: "ValidationFailed",
        icon: "ERROR",
      });
      endSubmit(true);
      if (cashAmtIndex !== -1) {
        UnclaimPaymentMetaData.fields[cashAmtIndex].isFieldFocused = true;
      }
      return;
    }

    // Validation passed, now proceed
    endSubmit(true);

    if (data?.PAYSLIP) {
      setOpenDD(true);
      return;
    } else {
      const buttonName = await MessageBox({
        messageTitle: "Confirmation",
        message: "AreYouSureToContinue",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        unclaimConfirmationMutation.mutate({
          ENTERED_COMP_CD: authState?.companyID ?? "",
          ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
          TRAN_CD: retrievalParaRef?.current?.[0]?.TRAN_CD,
          PAYSLIP: data?.PAYSLIP ? "Y" : "N",
          FLAG: screenFlag === "entry" ? "P" : " ",
          PAYMENT_DTL: {
            ...data,
            INT_FROM_DT: formatDateField(data?.INT_FROM_DT),
            MOVE_DATE: formatDateField(data?.MOVE_DATE),
            PAYMENT_AMT: String(data?.PAYMENT_AMT),
            PAYSLIP: data?.PAYSLIP ? "Y" : "N",
            TOTAL: String(data?.TOTAL),
          },
          DD_NEFT: [],
          SCREEN_REF: docCD ?? "",
        });
      }
    }
  };

  UnclaimPaymentMetaData.form.label = utilFunction.getDynamicLabel(
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

    // setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEffect(() => {
    if (open) {
      trackDialogClass("Retrieve");
    }
  }, [open]);

  return (
    <Fragment>
      <FormWrapper
        key={
          "unclaim_payment_MetaData" +
          accountDetails +
          (retrievalParaRef?.current?.[0]?.TRAN_CD || "")
        }
        metaData={UnclaimPaymentMetaData as MetaDataType}
        initialValues={
          screenFlag === "unclaimedCFM"
            ? {
                ...rowsData,
                TRF_ACCT_TYPE: rowsData?.TRF_ACCT_TYPE || "",
                TRF_AMT: rowsData?.TRF_AMT || "",
                PAYSLIP: rowsData?.PAYSLIP === "Y" ? true : false,
              }
            : {
                ...accountDetails?.[0],
                TRF_ACCT_TYPE: accountDetails?.[0]?.TRF_ACCT_TYPE || "",
                TRF_AMT: accountDetails?.[0]?.TRF_AMT || "",
                PAYSLIP: accountDetails?.[0]?.PAYSLIP === "Y" ? true : false,
              }
        }
        onSubmitHandler={onSubmitHandler}
        displayMode={screenFlag === "entry" ? "" : "view"}
        formStyle={{
          background: "white",
        }}
        formState={{
          MessageBox: MessageBox,
          docCD: docCD,
          acctDtlReqPara: {
            TRF_ACCT_CD: {
              ACCT_TYPE: "TRF_ACCT_TYPE",
              BRANCH_CD: "TRF_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
          columnNM: columnNM,
        }}
        ref={formRef}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {screenFlag === "entry" ? (
              <>
                <GradientButton
                  onClick={async () => {
                    newEntry();
                  }}
                  color={"primary"}
                >
                  {t("Retrieve")}
                </GradientButton>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  endIcon={
                    unclaimConfirmationMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>
              </>
            ) : (
              <>
                <GradientButton
                  onClick={() => handelChange("C")}
                  endIcon={
                    unclaimConfirmationMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  color={"primary"}
                  disabled={rowsData?.ALLOW_CONF === "N"}
                >
                  {t("confirm")}
                </GradientButton>
                <GradientButton
                  onClick={() => handelChange("R")}
                  color={"primary"}
                  disabled={rowsData?.ALLOW_DEL === "N"}
                >
                  {t("reject")}
                </GradientButton>
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </>
        )}
      </FormWrapper>

      {columnNM ? (
        <GradientButton
          color="primary"
          onClick={() => handelChange("R")}
          disabled={retrievalParaRef?.current?.[0]?.ALLOW_DEL === "N"}
        >
          {t("Reject")}
        </GradientButton>
      ) : (
        ""
      )}

      {openDD && (
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
        </Dialog>
      )}

      {screenFlag === "entry" && open && (
        <UnclPaymentRetrieve
          closeDialog={handleClose}
          retrievalParaValues={selectedDatas}
          setColumnNM={setColumnNM}
          columnNM={columnNM}
        />
      )}
    </Fragment>
  );
};

export const UnclPaymentEntry = ({ screenFlag, closeDialog, result }) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <UnclPaymentEntryMain
            closeDialog={closeDialog}
            screenFlag={screenFlag}
            result={result}
          />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
