import { CircularProgress, Dialog } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { PositivePayEntryFormMetadata } from "./metadata";
import UploadImageDialogue from "./uploadImage";
import * as API from "../api";
import { format } from "date-fns";
import {
  ImageViewer,
  RemarksAPIWrapper,
  GradientButton,
  usePopupContext,
  utilFunction,
  SubmitFnType,
  MetaDataType,
  FormWrapper,
  LoaderPaperComponent,
  PDFViewer,
  Alert,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
interface PositivePayEntryFormWrapperProps {
  isDataChangedRef: any;
  closeDialog: () => void;
  defaultView: string;
  screenFlag?: string;
}

export const PositivePayEntry = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  screenFlag,
}) => {
  const isErrorFuncRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const uploadImageDataRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(defaultView);
  const [openImage, setOpenImage] = useState(false);
  const [imageBlobData, setImageBlobData] = useState<any>(null);
  const [uploadImage, setUploadImage] = useState(false);
  const [loadingAction, setLoadingAction] = useState<any>(null);
  const [isReject, setReject] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const { trackDialogClass } = useDialogContext();
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const formData =
    rows?.retrieveData && Object.keys(rows?.retrieveData).length > 0
      ? rows?.retrieveData
      : rows?.[0]?.data || {};

  const validatePositivePayDtlMutation: any = useMutation(
    API.validatePositivePayEntryDetail,
    {
      onError: (error: any) => {},
      onSuccess: (data, variables) => {},
    }
  );

  const mutation = useMutation(API.positivePayEntryDML, {
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
    onSuccess: (data, variables) => {
      if (variables._isDeleteRow === true) {
        enqueueSnackbar(t("deleteSuccessfully"), {
          variant: "success",
        });
      } else {
        enqueueSnackbar(data, {
          variant: "success",
        });
      }
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const confirmRejectMutation = useMutation(API.positivePayConfirmation, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
      setReject(false);
      closeDialog();
    },
    onSuccess: (data, variables) => {
      if (variables?._isDeleteRow === false) {
        enqueueSnackbar(data, {
          variant: "success",
        });
        isDataChangedRef.current = true;
        CloseMessageBox();
        closeDialog();
      } else if (variables?._isDeleteRow === true) {
        setReject(false);
        enqueueSnackbar(t("RecordsDeletedMsg"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        CloseMessageBox();
        closeDialog();
      }
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    //@ts-ignore
    setLoadingAction(actionFlag);
    if (Boolean(data["CHEQUE_DT"])) {
      data["CHEQUE_DT"] = format(new Date(data["CHEQUE_DT"]), "dd/MMM/yyyy");
    }
    if (Boolean(data["TRAN_DT"])) {
      data["TRAN_DT"] = format(new Date(data["TRAN_DT"]), "dd/MMM/yyyy");
    }
    if (Boolean(data["CHEQUE_AMT"])) {
      data["CHEQUE_AMT"] = data["CHEQUE_AMT"].endsWith(".00")
        ? parseInt(data["CHEQUE_AMT"]).toString()
        : data["CHEQUE_AMT"].toString();
    }
    let newData = {
      ...data,
      CHEQUE_IMG: uploadImageDataRef?.current || data?.CHEQUE_IMG,
    };
    let oldData = {
      ...formData,
    };
    let upd = utilFunction.transformDetailsData(newData, oldData);

    if (upd._UPDATEDCOLUMNS.length > 0) {
      upd._UPDATEDCOLUMNS = upd._UPDATEDCOLUMNS.filter(
        (field) =>
          field !== "TYPE_CD" && field !== "VIEW" && field !== "UPLOAD_IMG"
      );
    }

    if (newData?.TYPE_CD || newData?.VIEW || newData?.UPLOAD_IMG) {
      delete newData["TYPE_CD"];
      delete newData["VIEW"];
      delete newData["UPLOAD_IMG"];
    }

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
        ENTERED_COMP_CD: authState?.companyID ?? "",
        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        TRAN_CD: newData?.TRAN_CD ?? "",
        INS_UPD:
          formMode === "new"
            ? "I"
            : formMode === "edit" && actionFlag === "Save"
            ? "U"
            : actionFlag === "Remove"
            ? "D"
            : "",
        GI_BRANCH: authState?.user?.branchCode ?? "",
        CHEQUE_IMG: (uploadImageDataRef.current || data?.CHEQUE_IMG) ?? "",
        TRAN_DT:
          formMode === "new"
            ? authState?.workingDate ?? ""
            : newData?.TRAN_DT ?? "",
        UPLOAD: formMode === "new" ? "N" : data.UPLOAD ?? "",
        CONFIRMED: formMode === "new" ? "N" : data.CONFIRMED ?? "",
        REQ_CHANNEL: formMode === "new" ? "B" : data.REQ_CHANNEL ?? "",
      },
      displayData,
      endSubmit,
      setFieldError,
    };

    if (
      actionFlag === "Save" &&
      isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length === 0
    ) {
      setFormMode("view");
    } else {
      validatePositivePayDtlMutation.mutate(
        {
          ...newData,
          ENT_COMP_CD: authState?.companyID ?? "",
          ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
          TRAN_CD: newData?.TRAN_CD ?? "",
          INS_UPD:
            formMode === "new"
              ? "I"
              : formMode === "edit" && actionFlag === "Save"
              ? "U"
              : actionFlag === "Remove"
              ? "D"
              : "",
          GI_BRANCH: authState?.user?.branchCode ?? "",
          SCREEN_REF: docCD ?? "",
          CHEQUE_IMG: (uploadImageDataRef.current || data?.CHEQUE_IMG) ?? "",
          UPLOAD: formMode === "new" ? "N" : data.UPLOAD ?? "",
          REQ_CHANNEL: formMode === "new" ? "B" : data.REQ_CHANNEL ?? "",
          WORKING_DATE: authState?.workingDate ?? "",
          LOGIN_BRANCH: authState?.user?.branchCode ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
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
                if (btnName === "Ok" && formMode !== "view") {
                  endSubmit(true);
                }
              } else if (data[i]?.O_STATUS === "9") {
                await MessageBox({
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
                if (btnName === "No" && formMode !== "view") {
                  endSubmit(true);
                  break;
                }
              } else if (data[i]?.O_STATUS === "0") {
                if (actionFlag === "Save") {
                  const btnName = await MessageBox({
                    message: "SaveData",
                    messageTitle: "Confirmation",
                    buttonNames: ["Yes", "No"],
                    loadingBtnName: ["Yes"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "Yes") {
                    mutation.mutate({
                      ...isErrorFuncRef.current?.data,
                      _isNewRow: formMode === "new" ? true : false,
                    });
                  } else if (btnName === "No") {
                    endSubmit(true);
                  }
                } else if (actionFlag === "Remove") {
                  const btnName = await MessageBox({
                    message: "DeleteData",
                    messageTitle: "Confirmation",
                    buttonNames: ["Yes", "No"],
                    loadingBtnName: ["Yes"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "Yes") {
                    mutation.mutate({
                      ...isErrorFuncRef.current?.data,
                      _isDeleteRow: true,
                    });
                  } else if (btnName === "No" && formMode === "edit") {
                    endSubmit(true);
                  }
                }
              }
            }
          },
        }
      );
    }
  };

  const getImageDataMutation = useMutation(API.getChequeImageData, {
    onMutate: () => {
      setLoadingFlag(true);
    },
    onSuccess: async (data) => {
      setLoadingFlag(false);
      if (Boolean(data?.[0]?.CHEQUE_IMG)) {
        trackDialogClass("imgDlg");
        const blob =
          data?.[0]?.IMG_TYPE?.toUpperCase() === "PDF"
            ? utilFunction.base64toBlob(
                data?.[0]?.CHEQUE_IMG,
                "application/pdf"
              )
            : data?.[0]?.IMG_TYPE.toUpperCase() === "JPEG" ||
              "JPG" ||
              "PNG" ||
              "TIFF" ||
              "GIF" ||
              "BMP"
            ? utilFunction.base64toBlob(
                data?.[0]?.CHEQUE_IMG,
                "image/" + data?.[0]?.IMG_TYPE
              )
            : "";
        if (blob) {
          setImageBlobData(blob);
          setOpenImage(true);
        }
      } else {
        MessageBox({
          messageTitle: "Information",
          message: "ChequeImageIsNotUploaded",
          buttonNames: ["Ok"],
          icon: "INFO",
        });
      }
    },
    onError: (error: any) => {
      setLoadingFlag(false);
      let errorMsg = "Unknownerroroccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };
  return (
    <>
      {validatePositivePayDtlMutation?.error && (
        <Alert
          severity="error"
          errorMsg={
            validatePositivePayDtlMutation?.error?.error_msg ??
            t("Somethingwenttowrong")
          }
          errorDetail={
            validatePositivePayDtlMutation?.error?.error_detail ?? ""
          }
          color="error"
        />
      )}
      <FormWrapper
        key={"positivePayEntryForm" + formMode}
        metaData={PositivePayEntryFormMetadata as MetaDataType}
        displayMode={formMode}
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          ...formData,
          CHEQUE_DT:
            formMode === "new" ? authState?.workingDate : formData?.CHEQUE_DT,
        }}
        formStyle={{
          background: "white",
        }}
        formState={{
          formMode: formMode,
          MessageBox: MessageBox,
          docCD: docCD,
          handleButtonDisable: handleButtonDisable,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        onFormButtonClickHandel={async (id) => {
          if (id === "VIEW") {
            getImageDataMutation?.mutate({
              ENT_COMP_CD: formData?.ENTERED_COMP_CD ?? "",
              ENT_BRANCH_CD: formData?.ENTERED_BRANCH_CD ?? "",
              TRAN_CD: formData?.TRAN_CD ?? "",
            });
          } else if (id === "UPLOAD_IMG") {
            setUploadImage(true);
            trackDialogClass("uploadImgDlg");
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {formMode === "edit" ? (
              <>
                <GradientButton
                  color={"primary"}
                  onClick={(event) => {
                    handleSubmit(event, "Remove");
                  }}
                  disabled={
                    validatePositivePayDtlMutation?.isLoading || disableButton
                  }
                  endIcon={
                    loadingAction === "Remove" &&
                    validatePositivePayDtlMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                >
                  {t("Delete")}
                </GradientButton>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  color={"primary"}
                  disabled={
                    validatePositivePayDtlMutation?.isLoading || disableButton
                  }
                  endIcon={
                    loadingAction === "Save" &&
                    validatePositivePayDtlMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    setFormMode("view");
                  }}
                  disabled={validatePositivePayDtlMutation?.isLoading}
                  color={"primary"}
                >
                  {t("Cancel")}
                </GradientButton>
              </>
            ) : formMode === "new" ? (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={
                    validatePositivePayDtlMutation?.isLoading || disableButton
                  }
                  endIcon={
                    loadingAction === "Save" &&
                    validatePositivePayDtlMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>

                <GradientButton
                  onClick={closeDialog}
                  disabled={validatePositivePayDtlMutation?.isLoading}
                  color={"primary"}
                >
                  {t("Close")}
                </GradientButton>
              </>
            ) : screenFlag === "C" && formMode === "view" ? (
              <>
                <GradientButton
                  color={"primary"}
                  onClick={async (event) => {
                    if (formData?.LAST_ENTERED_BY === authState?.user?.id) {
                      await MessageBox({
                        messageTitle: "InvalidConfirmation",
                        message: "PositivePayConfirmRestictionMessage",
                        buttonNames: ["Ok"],
                        icon: "WARNING",
                      });
                    } else {
                      const confirmation = await MessageBox({
                        message: "ConfirmMessage",
                        messageTitle: "Confirmation",
                        buttonNames: ["Yes", "No"],
                        loadingBtnName: ["Yes"],
                        icon: "CONFIRM",
                      });
                      if (confirmation === "Yes") {
                        const requestPara = {
                          BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
                          WORKING_DATE: authState?.workingDate ?? "",
                          LOGIN_BRANCH: authState?.user?.branchCode ?? "",
                          USERNAME: authState?.user?.id ?? "",
                          USERROLE: authState?.role ?? "",
                          ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
                          ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
                          ACCT_NM: rows?.[0]?.data?.ACCT_NM ?? "",
                          TYPE_CD: "",
                          CHEQUE_NO: rows?.[0]?.data?.CHEQUE_NO ?? "",
                          CHEQUE_DT:
                            format(
                              new Date(rows?.[0]?.data?.CHEQUE_DT),
                              "dd/MMM/yyyy"
                            ) ?? "",
                          CHEQUE_AMT: rows?.[0]?.data?.CHEQUE_AMT ?? "",
                          PAYEE_NM: rows?.[0]?.data?.PAYEE_NM ?? "",
                          REMARKS: rows?.[0]?.data?.REMARKS ?? "",
                          ENTERED_DATE:
                            format(
                              new Date(rows?.[0]?.data?.ENTERED_DATE),
                              "dd/MMM/yyyy"
                            ) ?? "",
                          TRAN_DT:
                            format(
                              new Date(rows?.[0]?.data?.TRAN_DT),
                              "dd/MMM/yyyy"
                            ) ?? "",
                          ENTERED_BY: rows?.[0]?.data?.ENTERED_BY ?? "",
                          VIEW: "",
                          ENT_COMP_CD: authState?.companyID ?? "",
                          ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                          TRAN_CD: rows?.[0]?.data?.TRAN_CD ?? "",
                          INS_UPD: "",
                          GI_BRANCH: authState?.user?.branchCode ?? "",
                          SCREEN_REF: docCD ?? "",
                          CHEQUE_IMG: rows?.[0]?.data?.CHEQUE_IMG ?? "",
                          UPLOAD: rows?.[0]?.data?.UPLOAD ?? "",
                          REQ_CHANNEL: rows?.[0]?.data?.REQ_CHANNEL ?? "",
                        };
                        validatePositivePayDtlMutation.mutate(requestPara, {
                          onSuccess: async (data, variables) => {
                            for (let i = 0; i < data?.length; i++) {
                              if (data[i]?.O_STATUS === "999") {
                                await MessageBox({
                                  messageTitle: data[i]?.O_MSG_TITLE
                                    ? data[i]?.O_MSG_TITLE
                                    : "ValidationFailed",
                                  message: data[i]?.O_MESSAGE,
                                  buttonNames: ["Ok"],
                                  icon: "ERROR",
                                });
                              } else if (data[i]?.O_STATUS === "9") {
                                await MessageBox({
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
                                });
                                if (btnName === "No") {
                                  break;
                                }
                              } else if (data[i]?.O_STATUS === "0") {
                                const confirmData = {
                                  ...rows?.[0]?.data,
                                  ENTERED_DATE: utilFunction.isValidDate(
                                    rows?.[0]?.data?.ENTERED_DATE
                                  )
                                    ? format(
                                        new Date(rows?.[0]?.data?.ENTERED_DATE),
                                        "dd/MMM/yyyy"
                                      ) ?? ""
                                    : "",
                                  TRAN_DT: utilFunction.isValidDate(
                                    rows?.[0]?.data?.TRAN_DT
                                  )
                                    ? format(
                                        new Date(rows?.[0]?.data?.TRAN_DT),
                                        "dd/MMM/yyyy"
                                      ) ?? ""
                                    : "",
                                  CHEQUE_DT: utilFunction.isValidDate(
                                    rows?.[0]?.data?.CHEQUE_DT
                                  )
                                    ? format(
                                        new Date(rows?.[0]?.data?.CHEQUE_DT),
                                        "dd/MMM/yyyy"
                                      ) ?? ""
                                    : "",
                                  ACTIVITY_DATE: utilFunction.isValidDate(
                                    authState?.workingDate
                                  )
                                    ? format(
                                        new Date(authState?.workingDate),
                                        "dd/MMM/yyyy"
                                      ) ?? ""
                                    : "",
                                  LAST_MODIFIED_DATE: utilFunction.isValidDate(
                                    rows?.[0]?.data?.LAST_MODIFIED_DATE
                                  )
                                    ? format(
                                        new Date(
                                          rows?.[0]?.data?.LAST_MODIFIED_DATE
                                        ),
                                        "dd/MMM/yyyy"
                                      ) ?? ""
                                    : "",
                                  TRAN_AMOUNT:
                                    rows?.[0]?.data?.CHEQUE_AMT ?? "",
                                  ACTIVITY_DONE_BY:
                                    rows?.[0]?.data?.ENTERED_BY ?? "",
                                  ENT_BRANCH_CD:
                                    authState?.user?.branchCode ?? "",
                                  ENT_COMP_CD: authState?.companyID ?? "",
                                  ENT_DATE: rows?.[0]?.data?.ENTERED_DATE ?? "",
                                  ACTIVITY_TYPE: "",
                                  TRAN_TYPE: "",
                                  USER_REMARKS: "",
                                  _isDeleteRow: false,
                                };
                                confirmRejectMutation.mutate(confirmData);
                              }
                            }
                          },
                        });
                      }
                    }
                  }}
                >
                  {t("Confirm")}
                </GradientButton>
                <GradientButton
                  color={"primary"}
                  endIcon={
                    validatePositivePayDtlMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  onClick={async (event) => {
                    const requestPara = {
                      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD ?? "",
                      WORKING_DATE: authState?.workingDate ?? "",
                      LOGIN_BRANCH: authState?.user?.branchCode ?? "",
                      USERNAME: authState?.user?.id ?? "",
                      USERROLE: authState?.role ?? "",
                      ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
                      ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
                      ACCT_NM: rows?.[0]?.data?.ACCT_NM ?? "",
                      TYPE_CD: "",
                      CHEQUE_NO: rows?.[0]?.data?.CHEQUE_NO ?? "",
                      CHEQUE_DT:
                        format(
                          new Date(rows?.[0]?.data?.CHEQUE_DT),
                          "dd/MMM/yyyy"
                        ) ?? "",
                      CHEQUE_AMT: rows?.[0]?.data?.CHEQUE_AMT ?? "",
                      PAYEE_NM: rows?.[0]?.data?.PAYEE_NM ?? "",
                      REMARKS: rows?.[0]?.data?.REMARKS ?? "",
                      ENTERED_DATE:
                        format(
                          new Date(rows?.[0]?.data?.ENTERED_DATE),
                          "dd/MMM/yyyy"
                        ) ?? "",
                      TRAN_DT:
                        format(
                          new Date(rows?.[0]?.data?.TRAN_DT),
                          "dd/MMM/yyyy"
                        ) ?? "",
                      ENTERED_BY: rows?.[0]?.data?.ENTERED_BY ?? "",
                      VIEW: "",
                      ENT_COMP_CD: authState?.companyID ?? "",
                      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                      TRAN_CD: rows?.[0]?.data?.TRAN_CD ?? "",
                      INS_UPD: "D",
                      GI_BRANCH: authState?.user?.branchCode ?? "",
                      SCREEN_REF: docCD ?? "",
                      CHEQUE_IMG: rows?.[0]?.data?.CHEQUE_IMG ?? "",
                      UPLOAD: rows?.[0]?.data?.UPLOAD ?? "",
                      REQ_CHANNEL: rows?.[0]?.data?.REQ_CHANNEL ?? "",
                    };
                    validatePositivePayDtlMutation.mutate(requestPara, {
                      onSuccess: async (data, variables) => {
                        for (let i = 0; i < data?.length; i++) {
                          if (data[i]?.O_STATUS === "999") {
                            await MessageBox({
                              messageTitle: data[i]?.O_MSG_TITLE
                                ? data[i]?.O_MSG_TITLE
                                : "ValidationFailed",
                              message: data[i]?.O_MESSAGE,
                              buttonNames: ["Ok"],
                              icon: "ERROR",
                            });
                          } else if (data[i]?.O_STATUS === "9") {
                            await MessageBox({
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
                            });
                            if (btnName === "No") {
                              break;
                            }
                          } else if (data[i]?.O_STATUS === "0") {
                            const confirmation = await MessageBox({
                              message: "RejectMessage",
                              messageTitle: "Confirmation",
                              buttonNames: ["Yes", "No"],
                              icon: "CONFIRM",
                            });
                            if (confirmation === "Yes") {
                              setReject(true);
                            }
                          }
                        }
                      },
                    });
                  }}
                >
                  {t("Reject")}
                </GradientButton>
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            ) : (
              <>
                <GradientButton
                  color={"primary"}
                  onClick={(event) => {
                    handleSubmit(event, "Remove");
                  }}
                  disabled={
                    validatePositivePayDtlMutation?.isLoading || disableButton
                  }
                  endIcon={
                    loadingAction === "Remove" &&
                    validatePositivePayDtlMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                >
                  {t("Delete")}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    setFormMode("edit");
                  }}
                  color={"primary"}
                  disabled={validatePositivePayDtlMutation?.isLoading}
                >
                  {t("Edit")}
                </GradientButton>
                <GradientButton
                  onClick={closeDialog}
                  disabled={validatePositivePayDtlMutation?.isLoading}
                  color={"primary"}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </>
        )}
      </FormWrapper>
      {loadingFlag && (
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
      )}
      {Boolean(openImage && imageBlobData) ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              width: "95%",
              overflow: "auto",
              height: "90%",
            },
          }}
          maxWidth="lg"
          className="imgDlg"
        >
          {imageBlobData?.type?.toUpperCase()?.includes("PDF") ? (
            <PDFViewer
              blob={imageBlobData}
              fileName={
                screenFlag === "C"
                  ? t("PositivePayConfirmation")
                  : t("PositivePayEntry")
              }
              onClose={() => {
                setOpenImage(false);
                trackDialogClass("formDlg");
              }}
            />
          ) : (
            <ImageViewer
              blob={imageBlobData}
              fileName={
                screenFlag === "C"
                  ? t("PositivePayConfirmation")
                  : t("PositivePayEntry")
              }
              onClose={() => {
                setOpenImage(false);
                trackDialogClass("formDlg");
              }}
            />
          )}
        </Dialog>
      ) : null}

      {uploadImage && (
        <UploadImageDialogue
          onClose={() => {
            setUploadImage(false);
            trackDialogClass("formDlg");
          }}
          onUpload={(data) => {
            if (Boolean(data)) {
              uploadImageDataRef.current = data?.[0]?.blob;
            }
            setUploadImage(false);
            trackDialogClass("formDlg");
          }}
        />
      )}
      {isReject && (
        <RemarksAPIWrapper
          TitleText={t("RemovalRemarksPositivePay", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          label={"RemovalRemarks"}
          onActionNo={() => setReject(false)}
          onActionYes={(val, rows) => {
            const rejectData = {
              ...rows,
              INS_UPD: "D",
              ENTERED_DATE: utilFunction.isValidDate(rows?.ENTERED_DATE)
                ? format(new Date(rows?.ENTERED_DATE), "dd/MMM/yyyy") ?? ""
                : "",
              TRAN_DT: utilFunction.isValidDate(rows?.TRAN_DT)
                ? format(new Date(rows?.TRAN_DT), "dd/MMM/yyyy") ?? ""
                : "",
              CHEQUE_DT: utilFunction.isValidDate(rows?.CHEQUE_DT)
                ? format(new Date(rows?.CHEQUE_DT), "dd/MMM/yyyy") ?? ""
                : "",
              ACTIVITY_DATE: utilFunction.isValidDate(authState?.workingDate)
                ? format(new Date(authState?.workingDate), "dd/MMM/yyyy") ?? ""
                : "",
              LAST_MODIFIED_DATE: utilFunction.isValidDate(
                rows?.LAST_MODIFIED_DATE
              )
                ? format(new Date(rows?.LAST_MODIFIED_DATE), "dd/MMM/yyyy") ??
                  ""
                : "",
              GI_BRANCH: authState?.user?.branchCode ?? "",
              ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
              ENT_COMP_CD: authState?.companyID ?? "",
              COMP_CD: authState?.companyID ?? "",
              TRAN_AMOUNT: rows?.CHEQUE_AMT ?? "",
              ACTIVITY_DONE_BY: rows?.ENTERED_BY ?? "",
              SCREEN_REF: docCD ?? "",
              TRAN_TYPE: "DELETE",
              ACTIVITY_TYPE: "POSITIVE PAY CONFIRMATION",
              USER_REMARKS: val
                ? val
                : t("WrongPositivePay", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  }),
              _isDeleteRow: true,
            };
            confirmRejectMutation.mutate(rejectData);
          }}
          isLoading={confirmRejectMutation?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isReject}
          rows={rows?.[0]?.data}
          defaultValue={t("WrongPositivePay", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </>
  );
};

export const PositivePayEntryFormWrapper: React.FC<
  PositivePayEntryFormWrapperProps
> = ({ isDataChangedRef, closeDialog, defaultView, screenFlag }) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
      className="formDlg"
    >
      <PositivePayEntry
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        screenFlag={screenFlag}
      />
    </Dialog>
  );
};
