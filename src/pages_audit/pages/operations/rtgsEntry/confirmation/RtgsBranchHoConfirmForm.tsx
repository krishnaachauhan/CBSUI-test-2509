import {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  BulkAccountDetailConfirmMetaData,
  DualConfHistoryGridMetaData,
  RtgsOrderingBranchConfirmFormMetaData,
  RtgsOrderingHOConfirmFormMetaData,
  rtgBenDetailConfirmFormMetaData,
} from "./ConfirmationMetadata";
import * as API from "./api";
import { useMutation, useQueries, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  AppBar,
  Dialog,
  DialogContent,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSnackbar } from "notistack";
import { isSameDay } from "date-fns";
import { useLocation } from "react-router-dom";
import { Box, Theme } from "@mui/system";
import { OTPModel } from "pages_audit/auth/otpPopup";
import { useStyles } from "pages_audit/auth/style";
import { rtgsVerifyOTP } from "./api";
import Draggable from "react-draggable";
import { t } from "i18next";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import {
  RemarksAPIWrapper,
  usePopupContext,
  GridWrapper,
  Alert,
  LoaderPaperComponent,
  ActionTypes,
  GradientButton,
  extractMetaData,
  MetaDataType,
  FormWrapper,
  ClearCacheProvider,
  queryClient,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
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
  refreshiconhover: {},
}));
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: t("Close"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const initialState = {
  OtpuserMessage: "",
  otpSentText: "",
  otpmodelClose: false,
  loading: false,
  otploading: false,
  isError: false,
  transactionID: "",
  comapanyCD: "",
  branchCD: "",
  username: "",
  otpValidFor: 60,
  recieveOtp: "",
  sentDate: "dd/mm/yyyy",
  contactUser: "",
  // Add other initial state properties
};
const reducer = (state, action) => {
  switch (action.type) {
    case "inititateOTPVerification": {
      return {
        ...state,
        loading: true,
        isError: false,
        isOTPError: false,
      };
    }
    case "OTPVerificationComplate": {
      return {
        ...state,
        loading: false,
        otploading: false,
        OtpuserMessage: "",
      };
    }
    case "OTPVerificationFailed":
      return {
        ...state,
        loading: false,
        otploading: false,
        OtpuserMessage: action.payload.error,
        otpmodelClose: action.payload.otpmodelclose,
      };
    case "OTPResendSuccess":
      return {
        ...state,
        transactionID: action.payload.transactionID,
      };
    // Other cases
    case "getNewOtpSuccessful": {
      return {
        ...state,
        transactionID: action?.payload?.transactionID,
        recieveOtp: action?.payload?.recieveOtp,
        comapanyCD: action?.payload?.comapanyCD,
        branchCD: action?.payload?.branchCD,
        username: action?.payload?.username,
        OtpuserMessage: "",
        otpSentText: action?.payload?.otpSentText,
        otpmodelClose: false,
        otpValidFor: action?.payload?.otpValidFor,
        sentDate: action?.payload?.sentDate,
        contactUser: action?.payload?.contactUser,
      };
    }
    default:
      return state;
  }
};
const RtgsBranchHoConfirmationForm: FC<{
  flag: any;
  screenFlag: any;
  formMode?: any;
  rowsData?: any;
  onClose?: any;
  isDataChangedRef?: any;
  handlePrev?: any;
  handleNext?: any;
  currentIndex?: number;
  totalData?: number;
  formLabel?: any;
}> = ({
  flag,
  screenFlag,
  formMode,
  rowsData,
  onClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndex,
  totalData,
  formLabel,
}) => {
  const { authState } = useContext(AuthContext);
  const headerClasses = useTypeStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isDeleteRemark, SetDeleteRemark] = useState(false);
  const [isConfHistory, setIsConfHistory] = useState(false);
  const [isPhotoSign, setIsPhotoSign] = useState(false);
  const [loginState, dispatch] = useReducer(reducer, initialState);
  const [isOTP, setIsOTP] = useState(false);
  const classes = useStyles();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      setIsConfHistory(false);
    }
  }, []);
  const result: any = useQueries([
    {
      queryKey: ["getRtgsBranchConfirmOrderingData", rowsData?.BRANCH_TRAN_CD],
      queryFn: () =>
        API.getRtgsBranchConfirmOrderingData({
          ENT_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD ?? "",
          COMP_CD: rowsData?.COMP_CD ?? "",
          BRANCH_CD: rowsData?.BRANCH_CD ?? "",
          BRANCH_TRAN_CD: rowsData?.BRANCH_TRAN_CD ?? "",
          FLAG_RTGSC: "",
        }),
    },
    {
      queryKey: ["getRtgsBenDetailBranchConfirmData", rowsData?.TRAN_CD],
      queryFn: () =>
        API.getRtgsBenDetailBranchConfirmData({
          COMP_CD: rowsData?.COMP_CD ?? "",
          BRANCH_CD: rowsData?.ENTERED_BRANCH_CD ?? "",
          TRAN_CD: rowsData?.TRAN_CD,
        }),
    },
  ]);
  let errorMsg =
    `${result[1]?.error?.error_msg}` || `${result[0]?.error?.error_msg}`;
  errorMsg = Boolean(errorMsg?.trim()) ? errorMsg : "UnknownErrorOccured";
  //@ts-ignore
  let error_detail =
    `${result[1]?.error?.error_detail}` || `${result[0]?.error?.error_detail}`;

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getRtgsBranchConfirmOrderingData"]);
      queryClient.removeQueries(["getRtgsBenDetailBranchConfirmData"]);
    };
  }, []);

  const confHistory: any = useMutation(
    "getConfirmHistoryData",
    API.getConfirmHistoryData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );

  const getGenerateOtp: any = useMutation(
    "getGenerateOtp",
    API.getGenerateOtp,
    {
      onSuccess: (data) => {
        dispatch({
          type: "getNewOtpSuccessful",
          payload: {
            comapanyCD: authState?.companyID,
            branchCD: authState?.user?.branchCode,
            transactionID: data?.[0]?.TRAN_CD,
            username: authState?.user?.id,
            otpValidFor: result[0]?.data?.acBalanceData?.OTP_VALID_SEC,
            recieveOtp: data?.[0]?.OTP,
            sentDate: data?.[0]?.SENT_DATE,
            contactUser: result[0]?.data?.hdrData?.CONTACT_INFO,
            otpSentText: data?.[0]?.OTP_SENT_TEXT,
          },
        });
        setIsOTP(true);
      },
      onError: (error: any) => {},
    }
  );
  const boConfirmation: any = useMutation(
    "getRtgsBranchConfirmtion",
    API.getRtgsBranchConfirmtion,
    {
      onSuccess: (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });
        isDataChangedRef.current = true;
        onClose();
        CloseMessageBox();
      },
      onError: (error: any) => {
        let errorMsg = "UnknownErrorOccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        CloseMessageBox();
      },
    }
  );
  const hoConfirmation: any = useMutation(
    "rtgsHoConfirmtionAndDelete",
    API.rtgsHoConfirmtionAndDelete,
    {
      onSuccess: (data) => {
        if (data?.[0]?.O_STATUS === "0") {
          enqueueSnackbar(t("ConfirmedSuccessfully"), {
            variant: "success",
          });
        }
        isDataChangedRef.current = true;
        onClose();
        CloseMessageBox();
      },
      onError: (error: any) => {
        let errorMsg = "UnknownErrorOccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        CloseMessageBox();
      },
    }
  );
  const deleteBrMutation = useMutation(
    "delteRtgsBranchConfirm",
    API.delteRtgsBranchConfirm,
    {
      onError: (error: any) => {
        let errorMsg = "UnknownErrorOccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
        CloseMessageBox();
        SetDeleteRemark(false);
      },
      onSuccess: (data) => {
        // isDataChangedRef.current = true;
        enqueueSnackbar(t("RecordSuccessfullyDeleted"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        onClose();
        CloseMessageBox();
        SetDeleteRemark(false);
      },
    }
  );
  const deleteHoMutation = useMutation(
    "rtgsHoConfirmtionAndDelete",
    API.rtgsHoConfirmtionAndDelete,
    {
      onError: (error: any) => {
        let errorMsg = "UnknownErrorOccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        CloseMessageBox();
        SetDeleteRemark(false);
      },
      onSuccess: async (data) => {
        handleDisplayMessages(data, MessageBox);
        isDataChangedRef.current = true;
        onClose();
        CloseMessageBox();
        SetDeleteRemark(false);
      },
    }
  );
  const VerifyOTP = async (OTPNumber) => {
    if (Boolean(OTPNumber) && OTPNumber.toString().length === 6) {
      dispatch({ type: "inititateOTPVerification" });
      const { status, data, message } = await rtgsVerifyOTP(
        loginState?.transactionID,
        loginState?.recieveOtp,
        OTPNumber,
        loginState?.otpValidFor,
        loginState?.sentDate
      );
      if (status === "0") {
        // Check the A_STATUS value and take action accordingly

        switch (data?.A_STATUS.trim()) {
          case "E":
            dispatch({
              type: "OTPVerificationFailed",
              payload: { error: data?.A_REMARKS, otpmodelclose: false },
            });
            break;
          case "T":
            dispatch({
              type: "OTPVerificationFailed",
              payload: { error: data?.A_REMARKS, otpmodelclose: false },
            });
            break;
          case "S":
            dispatch({ type: "OTPVerificationComplete" });
            // Call the other API or perform the necessary action
            hoConfirmation.mutate({
              _isDeleteRow: false,
              ENTERED_COMP_CD: result[0]?.data?.hdrData?.ENTERED_COMP_CD,
              ENTERED_BRANCH_CD: result[0]?.data?.hdrData?.ENTERED_BRANCH_CD,
              TRAN_CD: result[0]?.data?.hdrData?.TRAN_CD,
              CONF_REJECT: "C",
              ENTRY_TYPE: result[0]?.data?.hdrData?.ENTRY_TYPE,
            });
            break;

          case "F":
            dispatch({
              type: "OTPVerificationFailed",
              payload: { error: data?.A_REMARKS, otpmodelclose: false },
            });
            break;
        }
      } else if (status === "999") {
        dispatch({
          type: "OTPVerificationFailed",
          payload: { error: message, otpmodelclose: true },
        });
        CloseMessageBox();
      } else {
        dispatch({
          type: "OTPVerificationFailed",
          payload: { error: message, otpmodelclose: false },
        });
      }
    } else {
      dispatch({
        type: "OTPVerificationFailed",
        payload: { error: t("EnterOTPDigit") },
      });
    }
  };

  useEffect(() => {
    if (loginState.otpmodelClose) {
      setIsOTP(false);
    }
  }, [loginState.otpmodelClose]);
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.ctrlKey && (event.key === "D" || event.key === "d")) {
        event.preventDefault();
        if (rowsData?.CONFIRMED === "Y" && authState?.role < "2") {
          await MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("CannotDeleteConfirmedTransaction"),
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else if (
          !(
            new Date(rowsData?.TRAN_DT).toString() ===
            new Date(authState?.workingDate).toString()
          )
        ) {
          await MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("CannotDeleteBackDatedEntry"),
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else {
          SetDeleteRemark(true);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }, []);
  const errorDataa: any = [
    {
      error: result[1]?.error,
      isError: result[1]?.isError,
    },
    {
      error: result[0]?.error,
      isError: result[0]?.isError,
    },
    {
      error: boConfirmation?.error,
      isError: boConfirmation?.isError,
    },
    {
      error: deleteHoMutation?.error,
      isError: deleteHoMutation?.isError,
    },
    { error: deleteBrMutation?.error, isError: deleteBrMutation?.isError },
  ];
  const shouldHideButton =
    flag === "BO"
      ? rowsData?.BR_CONFIRMED === "Y" || rowsData?.BR_CONFIRMED === "T"
      : rowsData?.HO_CONFIRMED === "Y" ||
        rowsData?.HO_CONFIRMED === "T" ||
        result[0]?.data?.hdrData?.PI_ACKN_INDICATOR === "Y";

  return (
    <Fragment>
      <>
        <Dialog
          open={true}
          PaperProps={{
            style: {
              width: "100%",
              minHeight: "60vh",
              maxHeight: "95vh",
              height: "auto",
            },
          }}
          PaperComponent={(props) => (
            <Draggable
              handle="#draggable-dialog-title"
              cancel={'[class*="MuiDialogContent-root"]'}
            >
              <Paper {...props} />
            </Draggable>
          )}
          aria-labelledby="draggable-dialog-title"
          maxWidth="xl"
        >
          <div id="draggable-dialog-title" style={{ cursor: "move" }}>
            <AppBar
              position="static"
              sx={{
                height: "auto",
                background: "var(--theme-color5)",
                margin: "8px 8px 0px 8px",
                width: "auto",
              }}
            >
              <Toolbar>
                <Typography
                  variant="h6"
                  style={{ flexGrow: 1 }}
                  sx={{
                    fontWeight: 700,
                    color: "var(--theme-color2)",
                    fontSize: "1.2rem",
                  }}
                >
                  {flag === "BO" || flag === "HO"
                    ? formLabel +
                      " " +
                      t("SrNo") +
                      " :- " +
                      (rowsData?.SR_NO ?? "")
                    : null}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <>
                    {!shouldHideButton && (
                      <GradientButton
                        onClick={async () => {
                          if (rowsData?.BR_CONFIRMED === "T") {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t(
                                "BranchRejectedTransactionNotAllowConfirmed"
                              ),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (
                            rowsData?.BR_CONFIRMED !== "Y" &&
                            flag === "HO"
                          ) {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t(
                                "BranchConfirmationPendingTransactionNotAllowedToConfirm"
                              ),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (rowsData?.HO_CONFIRMED === "Y") {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t("TransationAlreadyConfirmed"),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (rowsData?.HO_CONFIRMED === "T") {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t(
                                "RejectedTransactionNotAllowToConfirm"
                              ),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (
                            !isSameDay(
                              new Date(rowsData?.TRAN_DT),
                              new Date(authState?.workingDate)
                            )
                          ) {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t("CannotConfirmBackDatedEntry"),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (
                            authState?.user?.id === rowsData?.ENTERED_BY
                          ) {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t("ConfirmRestrictMsg"),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (
                            rowsData?.VERIFIED_BY === authState?.user?.id
                          ) {
                            await MessageBox({
                              messageTitle: t("ValidationFailed"),
                              message: t(
                                "YouCantConfirmYourOwnBranchConfirmation"
                              ),
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else {
                            const buttonName = await MessageBox({
                              messageTitle: t("Confirmation"),
                              message: t("DoYouWantToAllowTheTransaction"),
                              buttonNames: ["Yes", "No"],
                              loadingBtnName: ["Yes"],
                              icon: "CONFIRM",
                            });
                            if (buttonName === "Yes") {
                              if (flag === "BO") {
                                boConfirmation.mutate({
                                  DETAILS_DATA: {
                                    isNewRow: [
                                      {
                                        ENTERED_COMP_CD:
                                          result[0]?.data?.hdrData
                                            ?.ENTERED_COMP_CD ?? "",
                                        ENTERED_BRANCH_CD:
                                          result[0]?.data?.hdrData
                                            ?.ENTERED_BRANCH_CD ?? "",
                                        TRAN_CD:
                                          result[0]?.data?.hdrData?.TRAN_CD ??
                                          "",
                                        ACCT_TYPE:
                                          result[0]?.data?.hdrData?.ACCT_TYPE ??
                                          "",
                                        ACCT_CD:
                                          result[0]?.data?.hdrData?.ACCT_CD ??
                                          "",
                                        AMOUNT:
                                          result[0]?.data?.hdrData?.AMOUNT ??
                                          "",
                                        TRAN_BAL:
                                          result[0]?.data?.hdrData?.TRAN_BAL ??
                                          "",
                                        COMP_CD:
                                          result[0]?.data?.hdrData?.COMP_CD ??
                                          "",
                                        BRANCH_CD:
                                          result[0]?.data?.hdrData?.BRANCH_CD ??
                                          "",
                                        TRN_DT:
                                          result[0]?.data?.hdrData?.TRAN_DT ??
                                          "",
                                        SCREEN_REF: docCD ?? "",
                                        CONFIRMED: "0",
                                        TRN_FLAG: "RTGS/NEFT",
                                        TYPE_CD: "",
                                      },
                                    ],
                                  },
                                });
                              } else if (
                                result[0]?.data?.acBalanceData
                                  ?.RTGS_HO_CONFIRM_OTP === "Y" &&
                                flag === "HO"
                              ) {
                                getGenerateOtp.mutate({
                                  TRN_TYPE: "RN_HO_CONF",
                                  CONTACT2:
                                    result[0]?.data?.hdrData?.CONTACT_INFO ??
                                    "",
                                  VALID_UPTO:
                                    result[0]?.data?.acBalanceData
                                      ?.OTP_VALID_SEC ?? "",
                                  COMP_CD: authState?.companyID ?? "",
                                  BRANCH_CD: authState?.user?.branchCode ?? "",
                                  USER_ID: authState?.user?.id ?? "",
                                });
                              } else {
                                hoConfirmation.mutate({
                                  _isDeleteRow: false,
                                  ENTERED_COMP_CD:
                                    result[0]?.data?.hdrData?.ENTERED_COMP_CD ??
                                    "",
                                  ENTERED_BRANCH_CD:
                                    result[0]?.data?.hdrData
                                      ?.ENTERED_BRANCH_CD ?? "",
                                  TRAN_CD:
                                    result[0]?.data?.hdrData?.TRAN_CD ?? "",
                                  CONF_REJECT: "C",
                                  ENTRY_TYPE:
                                    result[0]?.data?.hdrData?.ENTRY_TYPE ?? "",
                                });
                              }
                            }
                          }
                        }}
                        disabled={
                          result?.[0]?.isLoading || result?.[1]?.isLoading
                        }
                      >
                        {t("Confirm")}
                      </GradientButton>
                    )}
                  </>
                  {!shouldHideButton && (
                    <GradientButton
                      onClick={async () => {
                        if (rowsData?.HO_CONFIRMED === "Y") {
                          await MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message: t(
                              "YouCantDeleteRejectHOConfirmedTransaction"
                            ),
                            buttonNames: ["Ok"],
                            icon: "ERROR",
                          });
                        } else if (
                          rowsData?.HO_CONFIRMED === "T" ||
                          rowsData?.BR_CONFIRMED === "T"
                        ) {
                          await MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message: t("TransactionAlreadyRejected"),
                            buttonNames: ["Ok"],
                            icon: "ERROR",
                          });
                        } else if (
                          flag === "BO"
                            ? rowsData?.BR_CONFIRMED === "Y"
                            : rowsData?.HO_CONFIRMED === "Y"
                        ) {
                          await MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message:
                              flag === "BO"
                                ? t("YouCantDeleteConfirmedTransaction")
                                : t("YouCantRejectEntryAlreadyConfirmedByHO"),
                            buttonNames: ["Ok"],
                            icon: "ERROR",
                          });
                        } else if (
                          !(
                            new Date(rowsData?.TRAN_DT).toString() ===
                            new Date(authState?.workingDate).toString()
                          )
                        ) {
                          await MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message: t("CannotDeleteBackDatedEntry"),
                            buttonNames: ["Ok"],
                            icon: "ERROR",
                          });
                        } else if (flag === "BO") {
                          SetDeleteRemark(true);
                        } else if (flag === "HO") {
                          const buttonName = await MessageBox({
                            messageTitle: t("Confirmation"),
                            message: t("DoYouWantToRejectThisTransaction"),
                            buttonNames: ["Yes", "No"],
                            defFocusBtnName: "Yes",
                            loadingBtnName: ["Yes"],
                            icon: "CONFIRM",
                          });
                          if (buttonName === "Yes") {
                            deleteHoMutation.mutate({
                              _isDeleteRow: true,
                              ENTERED_COMP_CD:
                                result[0]?.data?.hdrData?.ENTERED_COMP_CD ?? "",
                              ENTERED_BRANCH_CD:
                                result[0]?.data?.hdrData?.ENTERED_BRANCH_CD ??
                                "",
                              TRAN_CD: result[0]?.data?.hdrData?.TRAN_CD ?? "",
                              CONF_REJECT: "R",
                              ENTRY_TYPE:
                                result[0]?.data?.hdrData?.ENTRY_TYPE ?? "",
                            });
                          }
                        }
                      }}
                      disabled={
                        result?.[0]?.isLoading || result?.[1]?.isLoading
                      }
                    >
                      {t("Remove")}
                    </GradientButton>
                  )}
                  <GradientButton
                    onClick={(e) => {
                      if (currentIndex && currentIndex > 0) {
                        handlePrev();
                      }
                    }}
                    disabled={result?.[0]?.isLoading || result?.[1]?.isLoading}
                  >
                    {t("Previous")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      if (currentIndex && currentIndex !== totalData) {
                        handleNext();
                      }
                    }}
                    disabled={result?.[0]?.isLoading || result?.[1]?.isLoading}
                  >
                    {t("MoveForward")}
                  </GradientButton>
                  {/* <GradientButton
                    onClick={() => {
                      if (currentIndex && currentIndex !== totalData)
                        handleNext();
                    }}
                    disabled={result?.[0]?.isLoading || result?.[1]?.isLoading}
                  >
                    {t("MoveForward")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      if (currentIndex && currentIndex !== totalData)
                        handlePrev();
                    }}
                    disabled={result?.[0]?.isLoading || result?.[1]?.isLoading}
                  >
                    {t("Previous")}
                  </GradientButton> */}
                  {/* {flag === "R" &&
                    data?.[0]?.CHEQUE_DETAIL?.[0]?.CP_TRAN_CD ===
                    undefined && ( */}
                  <>
                    <GradientButton
                      onClick={() => {
                        setIsPhotoSign(true);
                      }}
                      disabled={
                        result?.[0]?.isLoading || result?.[1]?.isLoading
                      }
                    >
                      {t("SignView")}
                    </GradientButton>
                  </>
                  {flag === "BO" &&
                  result[0]?.data?.hdrData?.TRAN_CONF === "Y" ? (
                    <GradientButton
                      onClick={() => {
                        confHistory.mutate({
                          ENTERED_COMP_CD:
                            result[0]?.data?.hdrData?.ENTERED_COMP_CD ?? "",
                          ENTERED_BRANCH_CD:
                            result[0]?.data?.hdrData?.ENTERED_BRANCH_CD ?? "",
                          TRAN_DT: result[0]?.data?.hdrData?.TRAN_DT ?? "",
                          TRAN_CD: result[0]?.data?.hdrData?.TRAN_CD ?? "",
                          SCREEN_REF: "RTGS_NEFT",
                        });
                        setIsConfHistory(true);
                      }}
                      disabled={
                        result?.[0]?.isLoading || result?.[1]?.isLoading
                      }
                    >
                      {t("ConfHistory")}
                    </GradientButton>
                  ) : null}
                  {result[0]?.data?.hdrData?.VIEW_MEMO === "Y" ? (
                    <GradientButton
                      onClick={() => {
                        // confHistory.mutate({
                        //   ENTERED_COMP_CD: data?.[0]?.ENTERED_COMP_CD,
                        //   ENTERED_BRANCH_CD: data?.[0]?.ENTERED_BRANCH_CD,
                        //   TRAN_DT: data?.[0]?.TRAN_DT,
                        //   TRAN_CD: data?.[0]?.TRAN_CD,
                        //   SCREEN_REF: "OW_CLG",
                        // });
                      }}
                    >
                      {" "}
                      {t("ViewMemo")}
                    </GradientButton>
                  ) : null}
                  <GradientButton
                    onClick={() => {
                      onClose();
                    }}
                  >
                    {t("Close")}
                  </GradientButton>
                </Box>
              </Toolbar>
            </AppBar>
            <DialogContent
              sx={{
                margin: "8px",
                padding: "0px",
                overflow: "auto",
                maxHeight: "calc(95vh - 120px)",
                border: "2px solid var(--theme-color4)",
              }}
            >
              {result?.[0]?.isLoading || result?.[1]?.isLoading ? (
                <LoaderPaperComponent />
              ) : errorDataa.some(({ isError }) => isError) ? (
                <>
                  {errorDataa.map(
                    ({ error, isError }, index) =>
                      isError && (
                        <Alert
                          key={index}
                          severity="error"
                          errorMsg={
                            error?.error_msg || t("Somethingwenttowrong")
                          }
                          errorDetail={error?.error_detail ?? ""}
                          color="error"
                        />
                      )
                  )}
                </>
              ) : (
                <>
                  <FormWrapper
                    key={"rtgsOrderingConfirm" + currentIndex}
                    metaData={
                      extractMetaData(
                        flag === "BO"
                          ? RtgsOrderingBranchConfirmFormMetaData
                          : RtgsOrderingHOConfirmFormMetaData,
                        formMode
                      ) as MetaDataType
                    }
                    initialValues={{
                      ...(flag === "BO"
                        ? { ...(result[0]?.data?.hdrData ?? "") }
                        : {
                            ...(result[0]?.data?.hdrData ?? ""),
                            ...(result[0]?.data?.acBalanceData ?? ""),
                          }),
                      ENTERED_BY:
                        "Enter by " + result[0]?.data?.hdrData?.ENTERED_BY,
                      VERIFIED_BY:
                        "Br.Confirmed by " +
                        result[0]?.data?.hdrData?.VERIFIED_BY,
                    }}
                    onSubmitHandler={() => {}}
                    displayMode={formMode}
                    hideHeader={true}
                    formStyle={{
                      background: "white",
                      width: "100%",
                    }}
                  />
                  {screenFlag === "RTGSBO" || screenFlag === "RTGSHO" ? (
                    <FormWrapper
                      key={`rtgBenDetailConfirm` + formMode + currentIndex}
                      metaData={
                        extractMetaData(
                          flag === "BO"
                            ? rtgBenDetailConfirmFormMetaData
                            : rtgBenDetailConfirmFormMetaData,
                          formMode
                        ) as MetaDataType
                      }
                      displayMode={formMode}
                      onSubmitHandler={() => {}}
                      initialValues={{
                        beneficiaryAcDetails: result?.[1]?.data ?? "",
                      }}
                      hideHeader={true}
                      formStyle={{
                        height: "65%",
                      }}
                    />
                  ) : (
                    <GridWrapper
                      key={`BeneficiaryDetails` + formMode}
                      finalMetaData={
                        flag === "BO"
                          ? BulkAccountDetailConfirmMetaData
                          : (BulkAccountDetailConfirmMetaData as GridMetaDataType)
                      }
                      data={result?.[1]?.data ?? []}
                      setData={() => {}}
                      loading={false}
                      refetchData={() => {}}
                      enableExport={false}
                    />
                  )}
                </>
              )}
            </DialogContent>
          </div>
        </Dialog>
        <>
          {isOTP ? (
            <>
              <Dialog
                fullWidth
                maxWidth="sm"
                open={true}
                onKeyUp={(event) => {
                  if (event.key === "Escape") {
                    onClose();
                  }
                }}
                key="rtgsConfirmDialog"
                PaperProps={{
                  style: {
                    width: "36%",
                    height: "55%",
                  },
                }}
              >
                <AppBar
                  position="static"
                  sx={{
                    height: "auto",
                    background: "var(--theme-color5)",
                    margin: "10px",
                    width: "auto",
                  }}
                >
                  <Toolbar>
                    <Typography
                      variant="h6"
                      style={{ flexGrow: 1 }}
                      sx={{
                        fontWeight: 700,
                        color: "var(--theme-color2)",
                        fontSize: "1.3rem",
                      }}
                    >
                      {t("RTGSHOConfirmation")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <>
                        {/* <GradientButton
                                    onClick={() => {
                                      setIsOTP(false)
                                      CloseMessageBox();
                                    }}
                                  >
                                    Close
                                  </GradientButton> */}
                      </>
                    </Box>
                  </Toolbar>
                  {(hoConfirmation?.isError || getGenerateOtp?.isError) && (
                    <Alert
                      severity="error"
                      errorMsg={
                        hoConfirmation?.error?.error_msg ??
                        getGenerateOtp?.error?.error_msg ??
                        "Unknow Error"
                      }
                      errorDetail={
                        hoConfirmation?.error?.error_detail ??
                        getGenerateOtp?.error?.error_detail ??
                        ""
                      }
                      color="error"
                    />
                  )}
                </AppBar>

                <OTPModel
                  classes={classes} // Pass actual classes if needed
                  open={isOTP}
                  handleClose={() => {
                    setIsOTP(false);
                  }}
                  loginState={loginState}
                  VerifyOTP={VerifyOTP}
                  OTPError={loginState.OtpuserMessage}
                  setOTPError={(error) => {
                    dispatch({
                      type: "OTPVerificationFailed",
                      payload: { error: error, otpmodelclose: false },
                    });
                  }}
                  previousStep={() => {
                    setIsOTP(false);
                    CloseMessageBox();
                  }}
                  resendFlag="RN_HO_CONF"
                  marginCondition={"0"}
                />
              </Dialog>
            </>
          ) : null}
        </>
        <>
          {isPhotoSign ? (
            <>
              <div style={{ paddingTop: 10 }}>
                <PhotoSignWithHistory
                  data={{
                    COMP_CD: result[0]?.data?.hdrData?.COMP_CD ?? "",
                    BRANCH_CD: result[0]?.data?.hdrData?.BRANCH_CD ?? "",
                    ACCT_TYPE: result[0]?.data?.hdrData?.ACCT_TYPE ?? "",
                    ACCT_CD: result[0]?.data?.hdrData?.ACCT_CD ?? "",
                  }}
                  onClose={() => {
                    setIsPhotoSign(false);
                  }}
                />
              </div>
            </>
          ) : null}
        </>
        <>
          {isConfHistory ? (
            <>
              <Dialog
                fullWidth
                maxWidth="md"
                open={true} // Assuming this is controlled by a state
                onKeyUp={(event) => {
                  if (event.key === "Escape") {
                    onClose();
                  }
                }}
                key="rtgsConfirmDialog"
                PaperProps={{
                  style: {
                    width: "100%",
                  },
                }}
              >
                <GridWrapper
                  key={"rtgsBrOrHoConfirmGrid"}
                  finalMetaData={DualConfHistoryGridMetaData}
                  data={confHistory?.data ?? []}
                  setData={() => null}
                  loading={confHistory.isLoading || confHistory.isFetching}
                  actions={actions}
                  setAction={setCurrentAction}
                />
              </Dialog>
            </>
          ) : null}
        </>
        {isDeleteRemark && (
          <RemarksAPIWrapper
            TitleText={
              screenFlag === "RTGSBO"
                ? t("EnterRemovalRemarksForRTGSBRANCHCONFIRMATION", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  })
                : t("EnterRemovalRemarksForRTGSBRANCHCONFIRMATION641", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  })
            }
            onActionNo={() => SetDeleteRemark(false)}
            onActionYes={async (val, rows) => {
              const buttonName = await MessageBox({
                messageTitle: t("Confirmation"),
                message: t("DoYouWantDeleteRow"),
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (buttonName === "Yes") {
                deleteBrMutation.mutate({
                  COMP_CD: result[0]?.data?.hdrData?.COMP_CD ?? "",
                  ENTERED_COMP_CD:
                    result[0]?.data?.hdrData?.ENTERED_COMP_CD ?? "",
                  ENTERED_BRANCH_CD:
                    result[0]?.data?.hdrData?.ENTERED_BRANCH_CD ?? "",
                  TRAN_CD: result[0]?.data?.hdrData?.TRAN_CD ?? "",
                  ENTERED_BY: result[0]?.data?.hdrData?.ENTERED_BY ?? "",
                  BRANCH_CD: result[0]?.data?.hdrData?.BRANCH_CD ?? "",
                  ACCT_TYPE: result[0]?.data?.hdrData?.ACCT_TYPE ?? "",
                  ACCT_CD: result[0]?.data?.hdrData?.ACCT_CD ?? "",
                  AMOUNT: result[0]?.data?.hdrData?.AMOUNT ?? "",
                  TRAN_DT: result[0]?.data?.hdrData?.TRAN_DT ?? "",
                  SLIP_NO: result[0]?.data?.hdrData?.SLIP_NO ?? "",
                  HO_CONFIRMED: result[0]?.data?.hdrData?.HO_CONFIRMED ?? "",
                  BR_CONFIRMED: result[0]?.data?.hdrData?.BR_CONFIRMED ?? "",
                  USER_DEF_REMARKS: val
                    ? val
                    : screenFlag === "RTGSBO"
                    ? t("Confirmation553")
                    : t("Confirmation641"),
                  ACTIVITY_TYPE: t("RTGSNEFTOutwardConfirm"),
                  DETAILS_DATA: {
                    isNewRow: [],
                    isDeleteRow: [...result?.[1]?.data],
                    isUpdatedRow: [],
                  },
                  _isDeleteRow: true,
                });
              }
            }}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={isDeleteRemark}
            defaultValue={
              screenFlag === "RTGSBO"
                ? t("Confirmation553", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  })
                : t("Confirmation641", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  })
            }
            rows={undefined}
          />
        )}
      </>
      {/* )} */}
    </Fragment>
  );
};

export const RTGSBranchHoConfirmFormWrapper = ({
  flag,
  screenFlag,
  handleDialogClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndexRef,
  totalData,
  formLabel,
}) => {
  const { state: rows } = useLocation();
  currentIndexRef.current = rows?.index;

  return (
    <ClearCacheProvider>
      <RtgsBranchHoConfirmationForm
        flag={flag}
        screenFlag={screenFlag}
        formMode={rows?.formMode}
        rowsData={rows?.gridData}
        onClose={handleDialogClose}
        handlePrev={handlePrev}
        handleNext={handleNext}
        currentIndex={rows.index}
        isDataChangedRef={isDataChangedRef}
        totalData={totalData}
        formLabel={formLabel}
      />
    </ClearCacheProvider>
  );
};
