import {
  Alert,
  extractMetaData,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { FdInterestPaymentFormMetaData } from "../FDInterestPayment/viewDetails/metaData";
import * as API from "./api";
import { useCommonFunctions } from "../fix-deposit/function";
import { getdocCD } from "components/utilFunction/function";

const RecInterestPaymentViewDetails = ({
  closeDialog,
  gridData,
  rows,
  defaultView,
  fdDetails,
  dataReset,
}) => {
  const { authState } = useContext(AuthContext);
  const [disableButton, setDisableButton] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [formMode, setFormMode] = useState(defaultView);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const { enqueueSnackbar } = useSnackbar();
  const isErrorFuncRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { focusRef, setFocus } = useCommonFunctions();

  const updateRecInterestPaymentEntry = useMutation(
    API.updateRecInterestPaymentEntry,
    {
      onSuccess: async (data, variables) => {
        {
          enqueueSnackbar(
            Boolean(rows?.[0]?.data?.PAYMENT_MODE)
              ? t("RecordUpdatedMsg")
              : t("RecordInsertedMsg"),
            {
              variant: "success",
            }
          );
        }
        closeDialog();
        CloseMessageBox();
        dataReset();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    // @ts-ignore
    endSubmit(true);
    if (
      (!data?.TO_IFSCCODE || !data?.TO_ACCT_NO) &&
      data?.PAYMENT_MODE === "NEFT"
    ) {
      const errors: any = {};
      if (!data.TO_IFSCCODE) {
        errors.TO_IFSCCODE = "IFSCCodeisRequired";
      }
      if (!data.TO_ACCT_NO) {
        errors.TO_ACCT_NO = "BeneficiaryAcctNumRequired";
      }
      setFieldError(errors);
      return;
    }
    if (
      (!data?.CR_BRANCH_CD || !data?.CR_ACCT_TYPE || !data?.CR_ACCT_CD) &&
      data?.PAYMENT_MODE === "BANKACCT"
    ) {
      const errors: any = {};
      if (!data.CR_BRANCH_CD) {
        errors.CR_BRANCH_CD = "BranchCodeReqired";
      }
      if (!data.CR_ACCT_TYPE) {
        errors.CR_ACCT_TYPE = "AccountTypeReqired";
      }
      if (!data.CR_ACCT_CD) {
        errors.CR_ACCT_CD = "AccountNumberRequired";
      }
      setFieldError(errors);
      return;
    }

    let newData = { ...data };
    let oldData = { ...rows?.[0]?.data };
    let upd = utilFunction.transformDetailsData(newData, oldData);

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
        COMP_CD: authState?.companyID,
        CR_COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user.branchCode,
        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
        ENTERED_COMP_CD: authState?.companyID ?? "",
        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
        _isNewRow: defaultView === "new" ? true : false,
      },
      displayData,
      endSubmit,
      setFieldError,
    };

    if (isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length !== 0) {
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        updateRecInterestPaymentEntry.mutate({
          data: { ...isErrorFuncRef.current?.data },
        });
      }
    }
  };
  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  if (FdInterestPaymentFormMetaData)
    FdInterestPaymentFormMetaData.form.label =
      utilFunction?.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        false
      ) +
      " " +
      rows?.[0]?.data?.FD_NO;

  return (
    <>
      {updateRecInterestPaymentEntry?.isError && (
        <Alert
          severity="error"
          errorMsg={
            updateRecInterestPaymentEntry?.error?.error_msg ??
            t("Somethingwenttowrong")
          }
          errorDetail={updateRecInterestPaymentEntry?.error?.error_detail ?? ""}
          color="error"
        />
      )}
      <FormWrapper
        key={"RecInterestPaymentFormDetails" + formMode}
        metaData={
          extractMetaData(
            FdInterestPaymentFormMetaData,
            formMode
          ) as MetaDataType
        }
        displayMode={formMode}
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          ...(rows?.[0]?.data ?? {}),
          HIDDEN_CR_BRANCH_CD: rows?.[0]?.data?.CR_BRANCH_CD
            ? rows?.[0]?.data?.CR_BRANCH_CD
            : rows?.[0]?.data?.CR_BRANCH_CD_1,
          HIDDEN_CR_ACCT_TYPE: rows?.[0]?.data?.CR_ACCT_TYPE
            ? rows?.[0]?.data?.CR_ACCT_TYPE
            : rows?.[0]?.data?.CR_ACCT_TYPE_1,
          NEFT_FORM_HIDDEN:
            rows?.[0]?.data?.PAYMENT_MODE === "NEFT" ||
            rows?.[0]?.data?.PAYMENT_MODE === ""
              ? "SHOW"
              : "HIDE",
          BANK_FORM_HIDDEN:
            rows?.[0]?.data?.PAYMENT_MODE === "BANKACCT" ||
            rows?.[0]?.data?.PAYMENT_MODE === ""
              ? "SHOW"
              : "HIDE",
        }}
        formStyle={{
          background: "white",
          margin: "10px 0",
        }}
        formState={{
          MessageBox: MessageBox,
          handleButtonDisable: handleButtonDisable,
          docCD: "FDINSTRCRTYPE",
          fdDetails:
            fdDetails.find((item) => item?.FD_NO === rows?.[0]?.data?.FD_NO) ||
            {},
          rowsData: rows,
          SCREEN_REF: docCD ?? "",
          SCREEN_FLAG: "REC_ENT",
          acctDtlReqPara: {
            CR_ACCT_CD: {
              ACCT_TYPE: "CR_ACCT_TYPE",
              BRANCH_CD: "CR_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
          setFocus: setFocus,
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {formMode === "edit" ? (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting || disableButton}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                  ref={focusRef}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            ) : formMode === "new" ? (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting || disableButton}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                  ref={focusRef}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            ) : (
              <>
                <GradientButton
                  onClick={() => {
                    setFormMode("edit");
                  }}
                  color={"primary"}
                >
                  {t("Edit")}
                </GradientButton>
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </>
        )}
      </FormWrapper>
    </>
  );
};

export const RecInterestPaymentDetail = ({
  closeDialog,
  gridData,
  rows,
  defaultView,
  dataReset,
  fdDetails,
}) => {
  return (
    <>
      {gridData ? (
        <RecInterestPaymentViewDetails
          closeDialog={closeDialog}
          gridData={gridData}
          dataReset={dataReset}
          rows={rows}
          defaultView={defaultView}
          fdDetails={fdDetails}
        />
      ) : (
        <LoaderPaperComponent />
      )}
    </>
  );
};
