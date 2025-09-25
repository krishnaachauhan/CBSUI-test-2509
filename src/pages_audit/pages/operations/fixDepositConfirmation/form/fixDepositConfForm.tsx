import {
  AppBar,
  Dialog,
  Toolbar,
  Typography,
  Theme,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { makeStyles } from "@mui/styles";
import {
  usePopupContext,
  GradientButton,
  SubmitFnType,
  InitialValuesType,
  FormWrapper,
  MetaDataType,
  extractMetaData,
  GridWrapper,
  GridMetaDataType,
  queryClient,
  LoaderPaperComponent,
  Alert,
  ActionTypes,
  RemarksAPIWrapper,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { ViewMasterForm } from "../../fix-deposit/fixDepositForm/viewMasterForm";
import { FixDepositDetailFormMetadata } from "../../fix-deposit/fixDepositForm/metaData/fdDetailMetaData";
import { FDPaymentMetadata } from "../../fix-deposit/fixDepositForm/metaData/fdPaymentMetadata";
import {
  FDConfDetailsGridMetadata,
  FDConfUpdatedtlMetadata,
} from "../gridMetadata";
import { useMutation, useQuery } from "react-query";
import {
  fdConfirmationDeleteFormData,
  fdConfirmFormData,
  getFdConfPaymentData,
  getFdConfPaymentDepositGridData,
  getFdConfUpdateGridData,
  ValidateFDConfirm,
  ValidateFDDelete,
} from "../api";
import { DualConfHistoryGridMetaData } from "../../rtgsEntry/confirmation/ConfirmationMetadata";
import { getConfirmHistoryData } from "../../rtgsEntry/confirmation/api";
import { format } from "date-fns";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { FdPaymentAdvicePrint } from "./fdPaymentAdvice";
import { getdocCD } from "components/utilFunction/function";
import i18n from "components/multiLanguage/languagesConfiguration";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  footerTypoG: {
    color: "var(--theme-color1)",
    fontSize: "1rem",
    fontWeight: "500",
    padding: "0px 0px 5px 10px",
  },
}));

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
export const FDConfirmationForm = ({
  isDataChangedRef,
  closeDialog,
  setClassName,
}) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [openViewMaster, setOpenViewMaster] = useState<any>(false);
  const headerClasses = useTypeStyles();
  const [displayPhotoSign, setDisplayPhotoSign] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState({});
  const [openConfHistoryForm, setOpenConfHistoryForm] = useState(false);
  const [openAdviceReport, setOpenAdviceReport] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [creditCount, setCreditCount] = useState(0);
  const [debitCount, setDebitCount] = useState(0);
  const [totDrAmt, setTotDrAmt] = useState(0);
  const [totCrAmt, setTotCrAmt] = useState(0);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      setOpenConfHistoryForm(false);
    }
  }, []);

  const {
    data: paymentData,
    isLoading: paymentIsLoading,
    isFetching: paymentIsFetching,
    isError: paymentIsError,
    error: paymentError,
  } = useQuery<any, any>(
    ["getFdConfPaymentData", authState?.user?.branchCode],
    () =>
      getFdConfPaymentData({
        BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
        FD_NO: rows?.[0]?.data?.FD_NO ?? "",
        A_FLAG: rows?.[0]?.data?.TRN_FLAG ?? "",
      }),
    {
      enabled:
        rows?.[0]?.data?.TRN_FLAG === "P" || rows?.[0]?.data?.TRN_FLAG === "I",
      onSuccess: (payData) => {
        payData.forEach((item) => {
          if (typeof item.PAY_DATA === "string" && item.PAY_DATA.length > 0) {
            item.PAY_DATA = JSON.parse(item.PAY_DATA);
          } else {
            item.PAY_DATA = item.PAY_DATA;
          }
        });
        return payData;
      },
    }
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["getFdConfPaymentDepositGridData", authState?.user?.branchCode],
    () =>
      getFdConfPaymentDepositGridData({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        REMARKS: rows?.[0]?.data?.REMARKS ?? "",
        TRN_FLAG: rows?.[0]?.data?.TRN_FLAG ?? "",
        FD_NO: rows?.[0]?.data?.FD_NO ?? "",
      }),
    {
      enabled:
        rows?.[0]?.data?.TRN_FLAG === "P" ||
        rows?.[0]?.data?.TRN_FLAG === "F" ||
        rows?.[0]?.data?.TRN_FLAG === "I",
    }
  );

  const {
    data: updateGridData,
    isLoading: updateIsLoading,
    isFetching: updateIsFetching,
    isError: updateIsError,
    error: updateError,
  } = useQuery<any, any>(
    ["getFdConfUpdateGridData", authState?.user?.branchCode],
    () =>
      getFdConfUpdateGridData({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
        FD_NO: rows?.[0]?.data?.FD_NO ?? "",
      }),
    {
      enabled: rows?.[0]?.data?.TRN_FLAG === "U",
    }
  );

  const {
    data: confHistoryData,
    isLoading: confHistoryIsLoading,
    isFetching: confHistoryIsFetching,
    isError: confHistoryIsError,
    error: confHistoryError,
    refetch: confHistoryRefetch,
  } = useQuery<any, any>(
    ["getFdConfirmHistoryData", authState?.user?.branchCode],
    () =>
      getConfirmHistoryData({
        ENTERED_COMP_CD: data?.[0]?.ENTERED_COMP_CD ?? "",
        ENTERED_BRANCH_CD: data?.[0]?.ENTERED_BRANCH_CD ?? "",
        TRAN_DT: data?.[0]?.TRAN_DT
          ? format(new Date(data?.[0]?.TRAN_DT), "dd/MMM/yyyy").toUpperCase()
          : "",
        TRAN_CD: data?.[0]?.TRAN_CD ?? "",
        SCREEN_REF: "FD_CONFIRM",
      }),
    {
      enabled: Boolean(openConfHistoryForm),
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getFdConfPaymentDepositGridData",
        authState?.user?.branchCode,
      ]);
      queryClient.removeQueries([
        "getFdConfPaymentData",
        authState?.user?.branchCode,
      ]);
      queryClient.removeQueries([
        "getFdConfUpdateGridData",
        authState?.user?.branchCode,
      ]);
      queryClient.removeQueries([
        "getFdConfirmHistoryData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const validateDelete = useMutation(ValidateFDDelete, {
    onError: (error: any) => {},
    onSuccess: (data) => {},
  });
  const deleteMutation = useMutation(fdConfirmationDeleteFormData, {
    onError: (error: any) => {},
    onSuccess: (data) => {},
  });
  const validateConfirm = useMutation(ValidateFDConfirm, {
    onError: (error: any) => {},
    onSuccess: (data) => {},
  });

  const confirmMutation = useMutation(fdConfirmFormData, {
    onError: (error: any) => {},
    onSuccess: (data) => {},
  });

  const reqPara = {
    A_LOG_BRANCH: authState?.user?.branchCode ?? "",
    A_LOG_COMP: authState?.companyID ?? "",
    A_BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
    A_ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
    A_ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
    A_FD_NO: rows?.[0]?.data?.FD_NO ?? "",
    A_TRN_FLAG: rows?.[0]?.data?.TRN_FLAG ?? "",
    WORKING_DATE: authState?.workingDate ?? "",
    A_SCREEN_REF: docCD ?? "",
    USERNAME: authState?.user?.id ?? "",
    USERROLE: authState?.role ?? "",
    DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
  };

  const handleDelete = async () => {
    validateDelete.mutate(reqPara, {
      onSuccess: async (data, variables) => {
        for (let i = 0; i < data?.length; i++) {
          if (data[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE
                ? data[i]?.O_MSG_TITLE
                : "ValidationFailed",
              message: data[i]?.O_MESSAGE,
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
          } else if (data[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE
                ? data[i]?.O_MSG_TITLE
                : "Alert",
              message: data[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE
                ? data[i]?.O_MSG_TITLE
                : "Confirmation",
              message: data[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnName === "No") {
              break;
            }
          } else if (data[i]?.O_STATUS === "0") {
            setIsDelete(true);
          }
        }
      },
      onError: async (data, variables) => {
        CloseMessageBox();
      },
    });
  };

  const handleConfirm = async () => {
    validateConfirm.mutate(
      {
        ...reqPara,
        A_REMARKS: rows?.[0]?.data?.REMARKS ?? "",
        A_ENTERED_BY: rows?.[0]?.data?.ENTERED_BY ?? "",
      },
      {
        onSuccess: async (data, variables) => {
          for (let i = 0; i < data?.length; i++) {
            if (data[i]?.O_STATUS === "999") {
              const btnName = await MessageBox({
                messageTitle: data[i]?.O_MSG_TITLE
                  ? data[i]?.O_MSG_TITLE
                  : "ValidationFailed",
                message: data[i]?.O_MESSAGE,
                buttonNames: ["Ok"],
                icon: "ERROR",
              });
            } else if (data[i]?.O_STATUS === "9") {
              const btnName = await MessageBox({
                messageTitle: data[i]?.O_MSG_TITLE
                  ? data[i]?.O_MSG_TITLE
                  : "Alert",
                message: data[i]?.O_MESSAGE,
                icon: "WARNING",
              });
            } else if (data[i]?.O_STATUS === "99") {
              const btnName = await MessageBox({
                messageTitle: data[i]?.O_MSG_TITLE
                  ? data[i]?.O_MSG_TITLE
                  : "Confirmation",
                message: data[i]?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (btnName === "No") {
                break;
              }
            } else if (data[i]?.O_STATUS === "0") {
              const confirmData = {
                A_BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
                A_ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
                A_ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
                A_FD_NO: rows?.[0]?.data?.FD_NO ?? "",
                TRN_FLAG: rows?.[0]?.data?.TRN_FLAG ?? "",
                REMARKS: rows?.[0]?.data?.REMARKS ?? "",
                SCREEN_REF: docCD ?? "",
              };
              confirmMutation.mutate(confirmData, {
                onSuccess: async (confirmdata) => {
                  for (let i = 0; i < confirmdata?.length; i++) {
                    if (confirmdata[i]?.O_STATUS === "999") {
                      const btnName = await MessageBox({
                        messageTitle: confirmdata[i]?.O_MSG_TITLE
                          ? confirmdata[i]?.O_MSG_TITLE
                          : "ValidationFailed",
                        message: confirmdata[i]?.O_MESSAGE,
                        buttonNames: ["Ok"],
                        icon: "ERROR",
                      });
                    } else if (confirmdata[i]?.O_STATUS === "9") {
                      const btnName = await MessageBox({
                        messageTitle: confirmdata[i]?.O_MSG_TITLE
                          ? confirmdata[i]?.O_MSG_TITLE
                          : "Alert",
                        message: confirmdata[i]?.O_MESSAGE,
                        icon: "WARNING",
                      });
                    } else if (confirmdata[i]?.O_STATUS === "99") {
                      const btnName = await MessageBox({
                        messageTitle: confirmdata[i]?.O_MSG_TITLE
                          ? confirmdata[i]?.O_MSG_TITLE
                          : "Confirmation",
                        message: confirmdata[i]?.O_MESSAGE,
                        buttonNames: ["Yes", "No"],
                        icon: "CONFIRM",
                      });
                      if (btnName === "No") {
                        break;
                      }
                    } else if (confirmdata[i]?.O_STATUS === "0") {
                      isDataChangedRef.current = true;
                      CloseMessageBox();
                      closeDialog();
                    }
                  }
                },
                onError: async (data, variables) => {
                  CloseMessageBox();
                },
              });
            }
          }
        },
        onError: async (data, variables) => {
          CloseMessageBox();
        },
      }
    );
  };

  const disableButton =
    confirmMutation?.isLoading ||
    validateDelete?.isLoading ||
    validateConfirm?.isLoading ||
    deleteMutation?.isLoading;

  DualConfHistoryGridMetaData.gridConfig.disableGlobalFilter = true;
  DualConfHistoryGridMetaData.gridConfig.enablePagination = false;
  DualConfHistoryGridMetaData.gridConfig.containerHeight = {
    min: "40vh",
    max: "40vh",
  };

  const label =
    rows?.[0]?.data?.TRN_FLAG === "I"
      ? `Interest Payment of FD : ${rows?.[0]?.data?.FD_NO ?? ""}`
      : rows?.[0]?.data?.TRN_FLAG === "P"
      ? `Payment of FD : ${rows?.[0]?.data?.FD_NO ?? ""}`
      : rows?.[0]?.data?.TRN_FLAG === "F"
      ? `Deposit of FD : ${rows?.[0]?.data?.FD_NO ?? ""}`
      : rows?.[0]?.data?.TRN_FLAG === "U"
      ? `Update of FD : ${rows?.[0]?.data?.FD_NO ?? ""}`
      : rows?.[0]?.data?.TRN_FLAG === "S"
      ? `Lien Mark of FD : ${rows?.[0]?.data?.FD_NO ?? ""}`
      : "";

  useEffect(() => {
    const creditArr = (Array.isArray(data) ? data : [])?.filter((item) =>
      ["1", "2", "3"].includes(item?.TYPE_CD?.trim())
    );
    setCreditCount(creditArr?.length);
    const totCrAmt = (Array.isArray(creditArr) ? creditArr : []).reduce(
      (accum, obj) => accum + Number(obj.AMOUNT),
      0
    );
    setTotCrAmt(totCrAmt);

    const debitArr = (Array.isArray(data) ? data : [])?.filter((item) =>
      ["4", "5", "6"].includes(item?.TYPE_CD?.trim())
    );
    setDebitCount(debitArr?.length);
    const totDrAmt = (Array.isArray(debitArr) ? debitArr : []).reduce(
      (accum, obj) => accum + Number(obj.AMOUNT),
      0
    );
    setTotDrAmt(totDrAmt);
  }, [data]);

  const handleClosePhotoSign = () => {
    setDisplayPhotoSign(false);
    setClassName("fdConfirmDlg");
  };

  return (
    <>
      {paymentIsFetching || paymentIsLoading ? (
        <div style={{ width: "100%", height: "100px" }}>
          <LoaderPaperComponent />
        </div>
      ) : (
        <>
          {paymentIsError ||
          validateDelete?.isError ||
          deleteMutation?.isError ||
          confirmMutation?.isError ||
          validateConfirm.isError ? (
            <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={
                    (paymentError?.error_msg ||
                      validateDelete.error?.error_msg ||
                      deleteMutation.error?.error_msg ||
                      confirmMutation.error?.error_msg ||
                      validateConfirm.error?.error_msg) ??
                    "Unknow Error"
                  }
                  errorDetail={
                    (paymentError?.error_detail ||
                      validateDelete.error?.error_detail ||
                      deleteMutation.error?.error_detail ||
                      confirmMutation.error?.error_detail ||
                      validateConfirm.error?.error_detail) ??
                    ""
                  }
                  color="error"
                />
              </AppBar>
            </div>
          ) : null}

          <AppBar position="relative" style={{ marginBottom: "10px" }}>
            <Toolbar className={headerClasses.root} variant="dense">
              <Typography
                className={headerClasses.title}
                color="inherit"
                variant={"h5"}
                component="div"
              >
                {`Fix Deposit Confirmation \u00A0\u00A0\u00A0\u00A0${label}`}
              </Typography>

              <GradientButton
                onClick={() => setOpenViewMaster(true)}
                color={"primary"}
                disabled={isLoading || isFetching || disableButton}
                style={{ width: "160px" }}
              >
                {t("ViewMaster")}
              </GradientButton>

              {rows?.[0]?.data?.TRN_FLAG === "P" ||
              rows?.[0]?.data?.TRN_FLAG === "F" ||
              rows?.[0]?.data?.TRN_FLAG === "I" ? (
                <GradientButton
                  onClick={() => {
                    setOpenConfHistoryForm(true);
                  }}
                  color={"primary"}
                  disabled={isLoading || isFetching || disableButton}
                  style={{ width: "250px" }}
                >
                  {t("ConfirmationHistory")}
                </GradientButton>
              ) : null}

              {rows?.[0]?.data?.TRN_FLAG === "P" ? (
                <GradientButton
                  onClick={() => {
                    setOpenAdviceReport(true);
                  }}
                  color={"primary"}
                  disabled={isLoading || isFetching}
                >
                  {t("Advice")}
                </GradientButton>
              ) : null}

              {rows?.[0]?.data?.ALLOW_CONFIRM === "Y" ? (
                <GradientButton
                  color={"primary"}
                  disabled={
                    isLoading ||
                    isFetching ||
                    disableButton ||
                    confirmMutation?.isError ||
                    validateConfirm?.isError
                  }
                  endIcon={
                    validateConfirm?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  onClick={handleConfirm}
                >
                  {t("Confirm")}
                </GradientButton>
              ) : null}

              {rows?.[0]?.data?.ALLOW_DELETE === "Y" ? (
                <GradientButton
                  onClick={handleDelete}
                  disabled={
                    isLoading ||
                    isFetching ||
                    disableButton ||
                    deleteMutation?.isError ||
                    validateDelete?.isError
                  }
                  endIcon={
                    validateDelete?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  color={"primary"}
                >
                  {t("Reject")}
                </GradientButton>
              ) : null}

              <GradientButton
                onClick={closeDialog}
                color={"primary"}
                disabled={
                  validateDelete?.isLoading || validateConfirm?.isLoading
                }
              >
                {t("Close")}
              </GradientButton>
            </Toolbar>
          </AppBar>

          <>
            {rows?.[0]?.data?.TRN_FLAG === "F" ||
            rows?.[0]?.data?.TRN_FLAG === "U" ? (
              <Paper
                sx={{
                  minHeight: "40vh",
                  overflow: "auto",
                  margin: "0 10px",
                  border: "1px solid var(--theme-color4)",
                  boxShadow: "none",
                }}
              >
                <FormWrapper
                  key={"fdConfirmationDeposit"}
                  metaData={
                    extractMetaData(
                      FixDepositDetailFormMetadata,
                      "view"
                    ) as MetaDataType
                  }
                  onSubmitHandler={() => {}}
                  displayMode={"view"}
                  initialValues={
                    {
                      ...rows?.[0]?.data,
                    } as InitialValuesType
                  }
                  formStyle={{
                    background: "white",
                  }}
                  hideHeader={true}
                ></FormWrapper>
              </Paper>
            ) : rows?.[0]?.data?.TRN_FLAG === "S" ? (
              <Paper
                sx={{
                  minHeight: "40vh",
                  overflow: "auto",
                  margin: "0 10px",
                  border: "1px solid var(--theme-color4)",
                  boxShadow: "none",
                }}
              >
                <FormWrapper
                  key={"fdConfirmationLien"}
                  metaData={
                    extractMetaData(
                      FixDepositDetailFormMetadata,
                      "view"
                    ) as MetaDataType
                  }
                  onSubmitHandler={() => {}}
                  displayMode={"view"}
                  initialValues={
                    {
                      ...rows?.[0]?.data,
                    } as InitialValuesType
                  }
                  formStyle={{
                    background: "white",
                  }}
                  hideHeader={true}
                  formState={{
                    screenFlag: "openLienForm",
                  }}
                ></FormWrapper>
              </Paper>
            ) : rows?.[0]?.data?.TRN_FLAG === "P" ||
              rows?.[0]?.data?.TRN_FLAG === "I" ? (
              <Paper
                sx={{
                  minHeight: "51vh",
                  overflow: "auto",
                  margin: "0 10px",
                  border: "1px solid var(--theme-color4)",
                  boxShadow: "none",
                }}
              >
                <FormWrapper
                  key={"fDConfirmationPayment"}
                  displayMode={"view"}
                  metaData={FDPaymentMetadata as MetaDataType}
                  onSubmitHandler={() => {}}
                  initialValues={
                    { ...paymentData?.[0].PAY_DATA } as InitialValuesType
                  }
                  formStyle={{
                    background: "white",
                    minWidth: "1200px",
                  }}
                  formState={{
                    flag: "FDCNF",
                    openIntPayment: Boolean(rows?.[0]?.data?.TRN_FLAG === "I"),
                  }}
                  hideHeader={true}
                ></FormWrapper>
              </Paper>
            ) : null}
          </>
          <Paper
            sx={{
              height: "22vh",
              overflow: "hidden",
              padding: "5px 10px 0px 10px",
              border: "none",
              boxShadow: "none",
            }}
          >
            {rows?.[0]?.data?.TRN_FLAG === "P" ||
            rows?.[0]?.data?.TRN_FLAG === "F" ||
            rows?.[0]?.data?.TRN_FLAG === "I" ? (
              <>
                {isError && (
                  <Alert
                    severity="error"
                    errorMsg={error?.error_msg ?? "Something went to wrong.."}
                    errorDetail={error?.error_detail}
                    color="error"
                  />
                )}
                <GridWrapper
                  key={`FDConfDetailsGridMetadata`}
                  finalMetaData={FDConfDetailsGridMetadata as GridMetaDataType}
                  data={data ?? []}
                  setData={() => {}}
                  loading={isLoading || isFetching}
                  onClickActionEvent={async (index, id, data) => {
                    if (id === "SIGNATURE") {
                      setDisplayPhotoSign(true);
                      setClassName("photoSign");
                      setSelectedAccount({
                        COMP_CD: data?.COMP_CD ?? "",
                        BRANCH_CD: data?.BRANCH_CD ?? "",
                        ACCT_TYPE: data?.ACCT_TYPE ?? "",
                        ACCT_CD: data?.ACCT_CD ?? "",
                        SCREEN_REF: docCD ?? "",
                        ACCT_NM: data?.ACCT_NM ?? "",
                        AMOUNT: data?.AMOUNT ?? "",
                      });
                    }
                  }}
                />
              </>
            ) : rows?.[0]?.data?.TRN_FLAG === "U" ? (
              <>
                {updateIsError && (
                  <Alert
                    severity="error"
                    errorMsg={
                      updateError?.error_msg ?? "Something went to wrong.."
                    }
                    errorDetail={updateError?.error_detail}
                    color="error"
                  />
                )}
                <GridWrapper
                  key={`FDConfUpdatedtlMetadata`}
                  finalMetaData={FDConfUpdatedtlMetadata as GridMetaDataType}
                  data={updateGridData ?? []}
                  setData={() => {}}
                  loading={updateIsLoading || updateIsFetching}
                />
              </>
            ) : null}
          </Paper>
          <div
            style={{
              minHeight: "25px",
              margin: "5px 0 0 15px",
              fontWeight: "bold",
              position: "sticky",
              fontFamily:
                '"Roboto", "Helvetica", "Arial", "sans-serif" !important',
              overflow: "auto",
            }}
          >
            {`Credit Count: ${creditCount || 0}\u00A0\u00A0 Debit Count: ${
              debitCount || 0
            }\u00A0\u00A0\u00A0\u00A0 Total Cr. Amount
                  : ${(totCrAmt || 0).toFixed(2)}\u00A0\u00A0 Total Dr. Amount
                  : ${(totDrAmt || 0).toFixed(2)}\u00A0\u00A0\u00A0\u00A0
                  Denomination Status: ${data?.[0]?.CASH_DENO_STATUS ?? "0"}`}
          </div>

          {openViewMaster && (
            <ViewMasterForm
              requestData={rows?.[0]?.data}
              handleDialogClose={() => {
                setOpenViewMaster(false);
              }}
            />
          )}

          {displayPhotoSign ? (
            <>
              <div style={{ paddingTop: 10 }}>
                <PhotoSignWithHistory
                  data={selectedAccount}
                  onClose={handleClosePhotoSign}
                  screenRef={docCD ?? ""}
                />
              </div>
            </>
          ) : null}

          {openConfHistoryForm ? (
            <>
              <Dialog
                open={openConfHistoryForm}
                fullWidth
                maxWidth="md"
                PaperProps={{
                  style: {
                    width: "100%",
                  },
                }}
              >
                {confHistoryIsError && (
                  <Alert
                    severity="error"
                    errorMsg={
                      confHistoryError?.error_msg ?? "Something went to wrong.."
                    }
                    errorDetail={confHistoryError?.error_detail}
                    color="error"
                  />
                )}
                <GridWrapper
                  key={"fdDualConfirmationForm"}
                  finalMetaData={
                    DualConfHistoryGridMetaData as GridMetaDataType
                  }
                  data={confHistoryData ?? []}
                  setData={() => null}
                  loading={confHistoryIsLoading || confHistoryIsFetching}
                  actions={actions}
                  setAction={setCurrentAction}
                />
              </Dialog>
            </>
          ) : null}
          {openAdviceReport && (
            <FdPaymentAdvicePrint
              closeDialog={() => setOpenAdviceReport(false)}
              requestData={{
                BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
                ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
                FD_NO: rows?.[0]?.data?.FD_NO ?? "",
                A_FLAG: rows?.[0]?.data?.TRN_FLAG ?? "",
              }}
              setOpenAdvice={setOpenAdviceReport}
              screenFlag={"FDCONF"}
            />
          )}

          {isDelete && (
            <RemarksAPIWrapper
              TitleText={
                "Enter Removal Remarks For Fix Deposit Confirmation (RPT/402)"
              }
              label={"RemovalRemarks"}
              onActionNo={() => setIsDelete(false)}
              onActionYes={(val, rows) => {
                const DeleteData = {
                  LOG_BR: authState?.user?.branchCode ?? "",
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: rows?.BRANCH_CD ?? "",
                  ACCT_TYPE: rows?.ACCT_TYPE ?? "",
                  ACCT_CD: rows?.ACCT_CD ?? "",
                  FD_NO: rows?.FD_NO ?? "",
                  REMARKS: rows?.REMARKS ?? "",
                  TRN_FLAG: rows?.TRN_FLAG ?? "",
                  USER_REMARKS: val
                    ? val
                    : "WRONG ENTRY FROM FIX DEPOSIT CONFIRMATION (RPT/402)",
                  AMOUNT: data?.[0]?.TOT_AMT ?? "",
                  CONFIRMED: rows?.CONFIRMED ?? "",
                  ENTERED_BY: rows?.ENTERED_BY ?? "",
                  GD_DATE: authState?.workingDate ?? "",
                  SCREEN_REF: docCD ?? "",
                };
                deleteMutation.mutate(DeleteData, {
                  onSuccess: async (deleteData) => {
                    for (let i = 0; i < deleteData?.length; i++) {
                      if (deleteData[i]?.O_STATUS === "999") {
                        const btnName = await MessageBox({
                          messageTitle: deleteData[i]?.O_MSG_TITLE
                            ? deleteData[i]?.O_MSG_TITLE
                            : "ValidationFailed",
                          message: deleteData[i]?.O_MESSAGE,
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else if (deleteData[i]?.O_STATUS === "9") {
                        const btnName = await MessageBox({
                          messageTitle: deleteData[i]?.O_MSG_TITLE
                            ? deleteData[i]?.O_MSG_TITLE
                            : "Alert",
                          message: deleteData[i]?.O_MESSAGE,
                          icon: "WARNING",
                        });
                      } else if (deleteData[i]?.O_STATUS === "99") {
                        const btnName = await MessageBox({
                          messageTitle: deleteData[i]?.O_MSG_TITLE
                            ? deleteData[i]?.O_MSG_TITLE
                            : "Confirmation",
                          message: deleteData[i]?.O_MESSAGE,
                          buttonNames: ["Yes", "No"],
                          icon: "CONFIRM",
                        });
                        if (btnName === "No") {
                          break;
                        }
                      } else if (deleteData[i]?.O_STATUS === "0") {
                        setIsDelete(false);
                        isDataChangedRef.current = true;
                        CloseMessageBox();
                        closeDialog();
                      }
                    }
                  },
                  onError: async (data, variables) => {
                    setIsDelete(false);
                    CloseMessageBox();
                  },
                });
              }}
              isLoading={deleteMutation?.isLoading}
              isEntertoSubmit={true}
              AcceptbuttonLabelText="Ok"
              CanceltbuttonLabelText="Cancel"
              open={isDelete}
              rows={rows?.[0]?.data}
              defaultValue={
                "WRONG ENTRY FROM FIX DEPOSIT CONFIRMATION (RPT/402)"
              }
            />
          )}
        </>
      )}
    </>
  );
};

export const FDConfirmationFormWrapper = ({
  isDataChangedRef,
  closeDialog,
  setClassName,
}) => {
  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          width: "100%",
          minHeight: "60vh",
          maxHeight: "100vh",
        },
      }}
      maxWidth="xl"
      className="fdConfirmDlg"
    >
      <FDConfirmationForm
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        setClassName={setClassName}
      />
    </Dialog>
  );
};
