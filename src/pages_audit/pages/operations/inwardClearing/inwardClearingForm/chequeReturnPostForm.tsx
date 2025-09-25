import { FC, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueries, useQuery } from "react-query";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Dialog from "@mui/material/Dialog";
import * as API from "../api";
import { chequeReturnPostFormMetaData } from "./metaData";
import { format } from "date-fns";
import { ChequeSignImage } from "./chequeSignImage";
import { AuthContext } from "pages_audit/auth";
import { useSnackbar } from "notistack";
import { PositivePayFormWrapper } from "./positvePayForm";
import { AppBar, CircularProgress } from "@mui/material";
import { ShareDividendFormWrapper } from "./shareDividendForm";
import { LoaderPaperComponent, GradientButton } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  utilFunction,
  GridMetaDataType,
  SubmitFnType,
  queryClient,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../../acct-mst/function";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";

export const ChequeReturnPostForm: FC<{
  onClose?: any;
  inwardGridData?: any;
  isDataChangedRef?: any;
  handlePrev?: any;
  handleNext?: any;
  currentIndex?: number;
  totalData?: number;
}> = ({
  onClose,
  inwardGridData,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndex,
  totalData,
}) => {
  const formRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { enqueueSnackbar } = useSnackbar();
  const [acImageData, setAcImageData] = useState<any>(null);
  const [isDividend, setIsDividend] = useState(false);
  const [isPositivePay, setIsPositvePay] = useState(false);
  const [isPositivePayData, setIsPositvePayData] = useState<any>({});
  // const [noFlag, setNoFlag] = useState(false);
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { showMessageBox } = useCommonFunctions();
  const [openPhotoSign, setOpenPhotoSign] = useState<boolean>(false);
  const [getAcctData, setGetAcctData] = useState<any>({});
  const { state: rows } = useLocation();
  const [disableBtn, setDisableBtn] = useState(false);
  const result: any = useQueries([
    {
      queryKey: ["getInwardChequeSignFormData"],
      queryFn: () =>
        API.getInwardChequeSignFormData({
          COMP_CD: inwardGridData?.COMP_CD,
          ENTERED_BRANCH_CD: inwardGridData?.ENTERED_BRANCH_CD,
          BRANCH_CD: inwardGridData?.BRANCH_CD,
          ACCT_TYPE: inwardGridData?.ACCT_TYPE,
          ACCT_CD: inwardGridData?.ACCT_CD,
          TRAN_CD: inwardGridData?.TRAN_CD,
          TRAN_DT: Boolean(inwardGridData?.TRAN_DT)
            ? format(new Date(inwardGridData?.TRAN_DT), "dd/MMM/yyyy")
            : "",
          WITH_SIGN: "Y",
          WORKING_DATE: authState?.workingDate ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
          SCREEN_REF: docCD ?? "",
        }),
    },
    // {
    //   queryKey: ["getBussinessDate"],
    //   queryFn: () => API.getBussinessDate(),
    // },
  ]);
  // let errorMsg = `${result[1].error?.error_msg}`;
  // errorMsg = Boolean(errorMsg.trim()) ? errorMsg : "Unknown error occured";
  // //@ts-ignore
  // let error_detail = `${result[1]?.error?.error_detail}`;
  let errorMsg = `${result[0].error?.error_msg}`;
  errorMsg = Boolean(errorMsg.trim()) ? errorMsg : "Unknown error occured";
  //@ts-ignore
  let error_detail = `${result[0]?.error?.error_detail}`;

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getInwardChequeSignFormData"]);
    };
  }, []);

  useEffect(() => {
    setGetAcctData({
      BRANCH_CD: rows?.gridData?.BRANCH_CD ?? "",
      ACCT_TYPE: rows?.gridData?.ACCT_TYPE ?? "",
      ACCT_CD: rows?.gridData?.ACCT_CD ?? "",
      AMOUNT: rows?.gridData?.AMOUNT ?? "",
    });
  }, [rows]);

  const oldReqData = {
    COMP_CD: inwardGridData?.COMP_CD ?? "",
    BRANCH_CD: inwardGridData?.BRANCH_CD ?? "",
    ACCT_TYPE: inwardGridData?.ACCT_TYPE ?? "",
    ACCT_CD: inwardGridData?.ACCT_CD ?? "",
    CHEQUE_NO: inwardGridData?.CHEQUE_NO ?? "",
    DRAFT_DIV: inwardGridData?.DRAFT_DIV ?? "",
    TRAN_CD: inwardGridData?.TRAN_CD,
    MICR_TRAN_CD: inwardGridData?.MICR_TRAN_CD ?? "",
  };
  const viewDetailValidatePostData: any = useMutation(API.validatePost, {
    onSuccess: async (data, variables) => {
      for (let i = 0; i < data?.length; i++) {
        if (data[i]?.O_STATUS === "999") {
          MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE,
            message: data[i]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data[i]?.O_STATUS === "9") {
          MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE,
            message: data[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data[i]?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE,
            message: data[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            break;
          }
        } else if (data[i]?.O_STATUS === "0") {
          const buttonName = await MessageBox({
            messageTitle: t("ValidationSuccessful"),
            message: t("AreYouSurePostThisCheque"),
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            const oldData = {
              ...oldReqData,
              CHEQUE_DT: inwardGridData?.CHEQUE_DT,
            };
            const newData = {
              COMP_CD: inwardGridData?.COMP_CD ?? "",
              BRANCH_CD: variables?.BRANCH_CD ?? "",
              ACCT_TYPE: variables?.ACCT_TYPE ?? "",
              ACCT_CD: variables?.ACCT_CD ?? "",
              CHEQUE_NO: variables?.CHEQUE_NO ?? "",
              TRAN_CD: inwardGridData?.TRAN_CD,
              MICR_TRAN_CD: variables?.MICR_TRAN_CD ?? "",
              CHEQUE_DT: variables?.CHEQUE_DT
                ? format(new Date(variables["CHEQUE_DT"]), "dd/MMM/yyyy")
                : "",
              DRAFT_DIV: inwardGridData?.DRAFT_DIV,
            };

            let upd: any = utilFunction.transformDetailsData(
              newData ?? {},
              oldData
            );
            postConfigDML.mutate({
              ...newData,
              ...upd,
              _isNewRow: true,
            });
          }
        }
      }
    },
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },
  });
  const viewDetailValidateReturnData: any = useMutation(API.validateReturn, {
    onSuccess: async (data, variables) => {
      if (data?.[0]?.O_STATUS === "0" && data?.[0]?.O_MESSAGE) {
        const buttonName = await MessageBox({
          messageTitle: t("ValidationSuccessful"),
          message: t("AreYouReturnThisCheque"),
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          const oldData = {
            TRAN_CD: inwardGridData?.TRAN_CD,
            COMP_CD: inwardGridData?.COMP_CD,
            BRANCH_CD: inwardGridData?.BRANCH_CD,
            RET_BRANCH_CD: inwardGridData?.RET_BRANCH_CD,
            RET_COMP_CD: inwardGridData?.RET_COMP_CD,
            RET_ACCT_TYPE: inwardGridData?.RET_ACCT_TYPE,
            RET_ACCT_CD: inwardGridData?.RET_ACCT_CD,
            ENTERED_BRANCH_CD: inwardGridData?.ENTERED_BRANCH_CD,
            CHEQUE_DT: inwardGridData?.CHEQUE_DT,
            CHEQUE_NO: inwardGridData?.CHEQUE_NO,
            ZONE_CD: inwardGridData?.ZONE_CD,
            REASON: inwardGridData?.REASON,
            REASON_CD: inwardGridData?.REASON_CD,
            DRAFT_DIV: inwardGridData?.DRAFT_DIV,
            ACCT_TYPE: inwardGridData?.ACCT_TYPE,
            ACCT_CD: inwardGridData?.ACCT_CD,
          };

          const newData = {
            TRAN_CD: inwardGridData?.TRAN_CD,
            COMP_CD: inwardGridData?.COMP_CD,
            BRANCH_CD: variables?.BRANCH_CD,
            RET_BRANCH_CD: variables?.RET_BRANCH_CD,
            RET_ACCT_TYPE: variables?.RET_ACCT_TYPE,
            RET_ACCT_CD: variables?.RET_ACCT_CD,
            ACCT_CD: variables?.ACCT_CD,
            ACCT_TYPE: variables?.ACCT_TYPE,
            RET_COMP_CD: variables?.RET_COMP_CD,
            ENTERED_BRANCH_CD: inwardGridData?.ENTERED_BRANCH_CD,
            CHEQUE_DT: variables?.CHEQUE_DT
              ? format(new Date(variables["CHEQUE_DT"]), "dd/MMM/yyyy")
              : "",
            CHEQUE_NO: variables?.CHEQUE_NO,
            ZONE_CD: variables?.ZONE_CD,
            REASON: variables?.REASON,
            REASON_CD: variables?.REASON_CD,
            DRAFT_DIV: inwardGridData?.DRAFT_DIV,
          };
          let upd: any = utilFunction.transformDetailsData(
            newData ?? {},
            oldData
          );
          returnConfigDML.mutate({
            ...newData,
            ...upd,
          });
        }
      } else if (data?.[0]?.O_STATUS === "999" && data?.[0]?.O_MESSAGE) {
        MessageBox({
          messageTitle: data[0]?.O_MSG_TITLE,
          message: data?.[0]?.O_MESSAGE,
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },
  });
  const validateConfirmData: any = useMutation(API.validateConfirm, {
    onSuccess: async (data, variables) => {
      const apiReq = {
        COMP_CD: inwardGridData?.COMP_CD ?? "",
        BRANCH_CD: variables?.BRANCH_CD ?? "",
        ENTERED_BY: inwardGridData?.ENTERED_BY,
        TRAN_CD: inwardGridData?.TRAN_CD,
        ACCT_TYPE: variables?.ACCT_TYPE ?? "",
        ACCT_CD: variables?.ACCT_CD ?? "",
        CHEQUE_NO: variables?.CHEQUE_NO ?? "",
        AMOUNT: variables?.AMOUNT,
        MICR_TRAN_CD: variables?.MICR_TRAN_CD,
        CHEQUE_DT: variables?.CHEQUE_DT
          ? format(new Date(variables["CHEQUE_DT"]), "dd/MMM/yyyy")
          : "",
        SCREEN_REF: docCD,
      };
      for (let i = 0; i < data?.length; i++) {
        if (data[i]?.O_STATUS === "999") {
          MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE,
            message: data[i]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data[i]?.O_STATUS === "9") {
          MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE,
            message: data[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data[i]?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: data[i]?.O_MSG_TITLE,
            message: data[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            break;
          }
        } else if (data[i]?.O_STATUS === "0") {
          const buttonName = await MessageBox({
            messageTitle: t("ValidationSuccessful"),
            message:
              t("DoYouWantAllowTransactionVoucherNo") +
              variables?.DAILY_TRN_CD +
              "?",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            confirmPostedConfigDML.mutate(apiReq);
          }
        }
      }
    },
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
  });
  const postConfigDML: any = useMutation(API.postConfigDML, {
    onSuccess: async (data, variables) => {
      let buttonName = await MessageBox({
        messageTitle: "Success",
        message: data,
        buttonNames: ["Ok"],
      });
      if (buttonName === "Ok") {
        isDataChangedRef.current = true;
        if (currentIndex && currentIndex !== totalData) handleNext();
        if (typeof onClose === "function") {
          onClose();
        }
        CloseMessageBox();
      }
      // isDataChangedRef.current = true;
      // if (currentIndex && currentIndex !== totalData) handleNext();
      // if (typeof onClose === "function") {
      //   onClose();
      // }
      CloseMessageBox();
    },

    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },
  });
  const returnConfigDML: any = useMutation(API.returnConfigDML, {
    onSuccess: (data, variables) => {
      enqueueSnackbar(data, { variant: "success" });
      isDataChangedRef.current = true;
      onClose();
      CloseMessageBox();
    },

    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },
  });
  const confirmPostedConfigDML: any = useMutation(API.confirmPostedConfigDML, {
    onSuccess: (data, variables) => {
      enqueueSnackbar(data, { variant: "success" });
      isDataChangedRef.current = true;
      onClose();
      CloseMessageBox();
    },
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldErrors,
    actionFlag
  ) => {
    endSubmit(true);
    if (Boolean(data["CHEQUE_DT"])) {
      data["CHEQUE_DT"] = format(new Date(data["CHEQUE_DT"]), "dd/MMM/yyyy");
    }
    if (actionFlag === "Save") {
      const oldData = {
        ...oldReqData,
        CHEQUE_DT: inwardGridData?.CHEQUE_DT,
      };
      const newData = {
        COMP_CD: inwardGridData?.COMP_CD ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        CHEQUE_NO: data?.CHEQUE_NO ?? "",
        TRAN_CD: inwardGridData?.TRAN_CD,
        MICR_TRAN_CD: data?.MICR_TRAN_CD ?? "",
        CHEQUE_DT: data?.CHEQUE_DT
          ? format(new Date(data["CHEQUE_DT"]), "dd/MMM/yyyy")
          : "",
        DRAFT_DIV: inwardGridData?.DRAFT_DIV,
      };
      let upd: any = utilFunction.transformDetailsData(newData ?? {}, oldData);
      if (
        upd?._UPDATEDCOLUMNS?.length > 0 &&
        data?.ACCT_TYPE.trim()?.length > 0 &&
        data?.ACCT_CD.trim()?.length > 0
      ) {
        const updateData = {
          ...newData,
          ...upd,
          _isNewRow: false,
        };
        endSubmit(true);
        postConfigDML.mutate(updateData);
      }
      if (data?.ACCT_TYPE.trim()?.length === 0) {
        setFieldErrors({
          ACCT_TYPE: t("PleaseEnterACType"),
        });
        return;
      } else if (data?.ACCT_CD.trim()?.length === 0) {
        setFieldErrors({
          ACCT_CD: t("PleaseEnterACNumber"),
        });
        return;
      }
    } else if (actionFlag === "POST" || actionFlag === "NO") {
      endSubmit(true);
      viewDetailValidatePostData.mutate({
        COMP_CD: inwardGridData?.COMP_CD ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        ERROR_STATUS: inwardGridData?.ERR_STATUS ?? "",
        SCREEN_REF: docCD,
        ENTERED_BY: inwardGridData?.ENTERED_BY ?? "",
        ENTERED_BRANCH_CD: inwardGridData?.ENTERED_BRANCH_CD ?? "",
        REMARKS: data?.REMARKS ?? "",
        CHEQUE_DT: data?.CHEQUE_DT,
        CHEQUE_NO: data?.CHEQUE_NO ?? "",
        AMOUNT: data?.AMOUNT ?? "",
        TRAN_CD: inwardGridData?.TRAN_CD,
        MICR_TRAN_CD: data?.MICR_TRAN_CD ?? "",
      });
    } else if (actionFlag === "RETURN") {
      viewDetailValidateReturnData.mutate({
        COMP_CD: inwardGridData?.COMP_CD ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        CHEQUE_NO: data?.CHEQUE_NO ?? "",
        CHEQUE_DT: data?.CHEQUE_DT,
        // ? format(new Date(data["CHEQUE_DT"]), "dd/MMM/yyyy")
        // : "",
        TRAN_CD: inwardGridData?.TRAN_CD,
        RET_COMP_CD: data?.RET_COMP_CD,
        ENTERED_BRANCH_CD: inwardGridData?.ENTERED_BRANCH_CD,
        ENTERED_BY: inwardGridData?.ENTERED_BY,
        LAST_MACHINE_NM: inwardGridData?.LAST_MACHINE_NM,
        REASON_CD: data?.REASON_CD ?? "",
        REASON: data?.REASON ?? "",
        ZONE_CD: data?.ZONE_CD ?? "",
        REMARKS: data?.REMARKS ?? "",
        RET_BRANCH_CD: data?.RET_BRANCH_CD ?? "",
        RET_ACCT_TYPE: data?.RET_ACCT_TYPE ?? "",
        RET_ACCT_CD: data?.RET_ACCT_CD ?? "",
      });
      if (data?.ACCT_TYPE.trim()?.length === 0) {
        setFieldErrors({});
        return;
      } else if (data?.ACCT_CD.trim()?.length === 0) {
        setFieldErrors({});
        return;
      }
    } else if (actionFlag === "CONFIRM") {
      validateConfirmData.mutate({
        COMP_CD: inwardGridData?.COMP_CD ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        DAILY_TRN_CD: inwardGridData?.DAILY_TRN_CD ?? "",
        ZONE_CD: data?.ZONE_CD ?? "",
        ENTERED_COMP_CD: inwardGridData?.ENTERED_COMP_CD ?? "",
        ENTERED_BY: inwardGridData?.ENTERED_BY ?? "",
        LAST_ENTERED_BY: inwardGridData?.LAST_ENTERED_BY ?? "",
        LAST_MACHINE_NM: inwardGridData?.LAST_MACHINE_NM ?? "",
        REMARKS: data?.REMARKS ?? "",
        CHEQUE_DT: data?.CHEQUE_DT ?? "",
        CHEQUE_NO: data?.CHEQUE_NO ?? "",
        AMOUNT: data?.AMOUNT ?? "",
        TRAN_CD: inwardGridData?.TRAN_CD,
        MICR_TRAN_CD: data?.MICR_TRAN_CD ?? "",
      });
    } else if (actionFlag === "POSITIVE_PAY") {
      setIsPositvePayData({ ...data, COMP_CD: inwardGridData?.COMP_CD ?? "" });
      setIsPositvePay(true);
    }
  };
  const errorDataa: any = [
    {
      error: viewDetailValidatePostData?.error,
      isError: viewDetailValidatePostData?.isError,
    },
    {
      error: viewDetailValidateReturnData?.error,
      isError: viewDetailValidateReturnData?.isError,
    },
    {
      error: validateConfirmData?.error,
      isError: validateConfirmData?.isError,
    },
    { error: postConfigDML?.error, isError: postConfigDML?.isError },
    { error: returnConfigDML?.error, isError: returnConfigDML?.isError },
  ];
  return (
    <>
      <>
        {errorDataa.map(
          ({ error, isError }, index) =>
            isError && (
              <Alert
                key={index}
                severity="error"
                errorMsg={error?.error_msg || t("Somethingwenttowrong")}
                errorDetail={error?.error_detail ?? ""}
                color="error"
              />
            )
        )}
        <FormWrapper
          key={`chequeReturnPost` + currentIndex}
          metaData={chequeReturnPostFormMetaData as unknown as MetaDataType}
          initialValues={inwardGridData}
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
          }}
          onFormButtonClickHandel={async (id) => {
            let event: any = { preventDefault: () => {} };
            if (id === "POST") {
              // if (!noFlag) {
              if (inwardGridData && inwardGridData?.DRAFT_DIV === "DRAFT") {
                // setIsDraft(true);

                const buttonName = await MessageBox({
                  messageTitle: t("Confirmation"),
                  message:
                    authState?.role < "2"
                      ? t("DoYouWantRealizeDraft")
                      : t("DoWantRealizeDraftOrDirectPostInGL"),
                  buttonNames:
                    authState?.role < "2"
                      ? ["Yes", "No"]
                      : ["Yes", "No", "Cancel"],
                  loadingBtnName: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                const postData = {
                  oldReqData,
                  _UPDATEDCOLUMNS: [],
                  _OLDROWVALUE: {},
                  _isNewRow: false,
                };
                if (authState?.role < "2" && buttonName === "Yes") {
                  postConfigDML.mutate(postData);
                } else if (buttonName === "Yes") {
                  postConfigDML.mutate(postData);
                } else if (buttonName === "No") {
                  let event: any = { preventDefault: () => {} };
                  formRef?.current?.handleSubmit(event, "NO");
                }
              } else if (
                inwardGridData &&
                inwardGridData?.DRAFT_DIV === "DIVIDEND"
              ) {
                setIsDividend(true);
              }
              // }
              else {
                formRef?.current?.handleSubmit(event, "POST");
              }
            } else if (id === "RETURN") {
              formRef?.current?.handleSubmit(event, "RETURN");
            } else if (id === "POSITIVE_PAY") {
              formRef?.current?.handleSubmit(event, "POSITIVE_PAY");
            } else if (id === "CONFIRM") {
              formRef?.current?.handleSubmit(event, "CONFIRM");
            }
          }}
          formState={{
            MessageBox: MessageBox,
            setDisableBtn: setDisableBtn,
            docCD: docCD,
            showMessageBox: showMessageBox,
            acctDtlReqPara: {
              RET_ACCT_CD: {
                ACCT_TYPE: "RET_ACCT_TYPE",
                BRANCH_CD: "RET_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
          ref={formRef}
          setDataOnFieldChange={(action, payload) => {
            let event: any = { preventDefault: () => {} };
            // if (action === "ACCT_CD_VALID") {
            setAcImageData(payload?.[0]?.SIGN_IMG);
            // }
            if (action === "ACCT_CD_BLANK") {
              setAcImageData("");
            }
            // else if (formRef?.current?.handleSubmit(event, "RETURN")) {
            //   setAcImageData(payload?.[0]?.SIGN_IMG);
            // }
            if (action === "GET_ACCT_DATA") {
              setGetAcctData(payload);
            }
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                style={{ minWidth: "110px" }}
                onClick={() => setOpenPhotoSign(true)}
                disabled={
                  !getAcctData?.BRANCH_CD?.trim() ||
                  !getAcctData?.ACCT_TYPE?.trim() ||
                  !getAcctData?.ACCT_CD?.trim()
                }
              >
                {t("ViewSignature")}
              </GradientButton>
              <GradientButton
                onClick={(e) => {
                  if (currentIndex && currentIndex > 0) {
                    handlePrev();
                  }
                }}
              >
                {t("Previous")}
              </GradientButton>
              {inwardGridData?.DRAFT_DIV.length === 0 ||
              inwardGridData?.DRAFT_DIV === "DRAFT" ? (
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting || disableBtn}
                  endIcon={
                    postConfigDML.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  color={"primary"}
                >
                  {t("SaveClose")}
                </GradientButton>
              ) : null}

              <GradientButton onClick={onClose}>{t("Close")}</GradientButton>
            </>
          )}
        </FormWrapper>
        {result?.[0]?.isLoading || result?.[0]?.isFetching ? (
          <LoaderPaperComponent />
        ) : result[0].isError ? (
          <Alert
            severity="error"
            errorMsg={errorMsg}
            errorDetail={error_detail ?? ""}
          />
        ) : (
          <>
            <ChequeSignImage
              imgData={result?.[0]?.data}
              acSignImage={acImageData}
              formData={inwardGridData}
            />
          </>
        )}

        {isPositivePay ? (
          <PositivePayFormWrapper
            onClose={() => {
              setIsPositvePay(false);
            }}
            positiveData={isPositivePayData}
          />
        ) : null}

        {isDividend ? (
          <ShareDividendFormWrapper
            onClose={() => {
              setIsDividend(false);
            }}
            dividendData={inwardGridData}
          />
        ) : null}

        {openPhotoSign &&
        getAcctData?.BRANCH_CD?.trim() &&
        getAcctData?.ACCT_TYPE?.trim() &&
        getAcctData?.ACCT_CD?.trim() ? (
          <Dialog
            open={true}
            fullWidth={true}
            PaperProps={{
              style: {
                width: "100%",
                overflow: "auto",
              },
            }}
            maxWidth="lg"
          >
            <PhotoSignWithHistory
              data={{
                ...getAcctData,
                COMP_CD: authState?.companyID ?? "",
                SCREEN_REF: docCD,
              }}
              onClose={() => {
                setOpenPhotoSign(false);
              }}
              screenRef={docCD ?? ""}
            />
          </Dialog>
        ) : null}
      </>
      {/* )} */}
    </>
  );
};
export const ChequeReturnPostFormWrapper = ({
  onClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndexRef,
  totalData,
}) => {
  const { state: rows } = useLocation();
  currentIndexRef.current = rows.index;
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "96%",
        },
      }}
      maxWidth="xl"
    >
      <ChequeReturnPostForm
        onClose={onClose}
        inwardGridData={rows?.gridData}
        handlePrev={handlePrev}
        handleNext={handleNext}
        currentIndex={rows.index}
        isDataChangedRef={isDataChangedRef}
        totalData={totalData}
      />
    </Dialog>
  );
};
