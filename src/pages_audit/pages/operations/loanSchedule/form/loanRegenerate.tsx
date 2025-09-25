import { AppBar, CircularProgress, Dialog } from "@mui/material";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LoanRegenerateFormMetaData } from "./metadata";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import {
  usePopupContext,
  GradientButton,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
  SubmitFnType,
  LoaderPaperComponent,
  queryClient,
  Alert,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

export const LoanRegenerateForm = ({ isDataChangedRef, closeDialog }) => {
  const { state: rows }: any = useLocation();
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const {
    data: detailsData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<any, any>(
    ["getLoanRegenerateDetails", authState?.user?.branchCode],
    () =>
      API.getLoanRegenerateDetails({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.[0]?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.[0]?.ACCT_CD ?? "",
      })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getLoanRegenerateDetails",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const regenerateValidation = useMutation(API.validateRegenerateData, {
    onError: (error: any) => {},
    onSuccess: (data, variables) => {},
  });

  const regenerateDataMutation = useMutation(API.regenerateData, {
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
    onSuccess: async (data) => {},
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    let newData = {
      ...data,
    };
    let oldData = {
      ...detailsData?.[0],
    };

    if (Boolean(oldData["INST_DUE_DT"])) {
      oldData["INST_DUE_DT"] = format(
        new Date(oldData["INST_DUE_DT"]),
        "dd/MMM/yyyy"
      );
    }
    if (Boolean(oldData["RATE_WEF"])) {
      oldData["RATE_WEF"] = format(
        new Date(oldData["RATE_WEF"]),
        "dd/MMM/yyyy"
      );
    }
    if (Boolean(newData["RATE_WEF"])) {
      newData["RATE_WEF"] = format(
        new Date(newData["RATE_WEF"]),
        "dd/MMM/yyyy"
      );
    }
    if (Boolean(newData["INST_DUE_DT"])) {
      newData["INST_DUE_DT"] = format(
        new Date(newData["INST_DUE_DT"]),
        "dd/MMM/yyyy"
      );
    }
    const validateData = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: oldData?.ACCT_TYPE ?? "",
      ACCT_CD: oldData?.ACCT_CD ?? "",
      LIMIT_AMOUNT: newData?.LIMIT_AMOUNT ?? "",
      INT_RATE: newData?.INT_RATE ?? "",
      INST_RS: newData?.INST_RS ?? "",
      INST_NO: newData?.INST_NO ?? "",
      INST_DUE_DT: newData?.INST_DUE_DT ?? "",
      RATE_WEF: newData?.RATE_WEF ?? "",
      ORG_LIMIT_AMOUNT: oldData?.LIMIT_AMOUNT ?? "",
      ORG_INT_RATE: oldData?.INT_RATE ?? "",
      ORG_INST_RS: oldData?.INST_RS ?? "",
      ORG_INST_NO: oldData?.INST_NO ?? "",
      ORG_INST_DUE_DT: oldData?.INST_DUE_DT ?? "",
      ORG_RATE_WEF: oldData?.RATE_WEF ?? "",
      SCREEN_REF: docCD ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
    };

    regenerateValidation.mutate(validateData, {
      onSuccess: async (data, variables) => {
        for (let i = 0; i < data?.length; i++) {
          if (data[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: "ValidationFailed",
              message: data[i]?.O_MESSAGE,
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              endSubmit(true);
            }
          } else if (data[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: "Alert",
              message: data[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: "Confirmation",
              message: data[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });
            if (btnName === "No") {
              endSubmit(true);
              break;
            } else if (
              btnName === "Yes" &&
              data?.[0]?.O_COLUMN_NM === "REGENERATE"
            ) {
              const confirmData = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                ACCT_TYPE: oldData?.ACCT_TYPE ?? "",
                ACCT_CD: oldData?.ACCT_CD ?? "",
                INT_RATE: newData?.INT_RATE ?? "",
                INST_RS: newData?.INST_RS ?? "",
                INST_NO: newData?.INST_NO ?? "",
                LIMIT_AMOUNT: newData?.LIMIT_AMOUNT ?? "",
                DISBURSEMENT_DT: oldData?.DISBURSEMENT_DT ?? "",
                INSTALLMENT_TYPE: newData?.INSTALLMENT_TYPE ?? "",
                INS_START_DT: newData?.INS_START_DT ?? "",
                TYPE_CD: newData?.TYPE_CD ?? "",
                INST_DUE_DT: newData?.INST_DUE_DT ?? "",
              };
              regenerateDataMutation.mutate(confirmData, {
                onSuccess: async (data) => {
                  endSubmit(true);
                  if (data?.status === "999") {
                    const btnName = await MessageBox({
                      messageTitle: "ValidationFailed",
                      message: data?.message,
                      buttonNames: ["Ok"],
                      icon: "ERROR",
                    });
                    if (btnName === "Ok") {
                      endSubmit(true);
                      CloseMessageBox();
                    }
                  } else {
                    enqueueSnackbar(data, {
                      variant: "success",
                    });
                    isDataChangedRef.current = true;
                    CloseMessageBox();
                    closeDialog();
                  }
                },
              });
              break;
            }
          } else if (data[i]?.O_STATUS === "0") {
          }
        }
      },
      onError: (error: any) => {
        endSubmit(false);
      },
    });
  };

  const dtlData = detailsData?.[0];
  return (
    <>
      {isLoading || isFetching ? (
        <div style={{ width: "600px", height: "100px" }}>
          <LoaderPaperComponent />
        </div>
      ) : (
        <>
          {(isError || regenerateValidation?.isError) && (
            <AppBar position="relative" color="secondary">
              <Alert
                severity={
                  (error?.severity || regenerateValidation?.error?.severity) ??
                  "error"
                }
                //@ts-ignore
                errorMsg={
                  (error?.error_msg ||
                    regenerateValidation?.error?.error_msg) ??
                  "Something went to wrong.."
                }
                errorDetail={
                  (error?.error_detail ||
                    regenerateValidation?.error?.error_detail) ??
                  ""
                }
                color="error"
              />
            </AppBar>
          )}
          <FormWrapper
            key={"loanRegenerateForm"}
            metaData={LoanRegenerateFormMetaData as MetaDataType}
            onSubmitHandler={onSubmitHandler}
            initialValues={
              {
                ...detailsData?.[0],
                VALIDATE_LIMIT_AMT: detailsData?.[0]?.LIMIT_AMOUNT,
                VALIDATE_INT_RS: detailsData?.[0]?.INST_RS,
              } as InitialValuesType
            }
            formStyle={{
              background: "white",
            }}
            formState={{
              MessageBox: MessageBox,
              rows: rows,
              dtlData: dtlData,
              flag: false,
              intRateFlag: false,
              noOfInstFlag: false,
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  color={"primary"}
                  endIcon={
                    regenerateValidation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                >
                  {t("Regenerate")}
                </GradientButton>
                <GradientButton
                  onClick={closeDialog}
                  color={"primary"}
                  disabled={isSubmitting}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        </>
      )}
    </>
  );
};

export const LoanRegenerateFormWrapper = ({
  isDataChangedRef,
  closeDialog,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "auto",
          overflow: "auto",
        },
      }}
      maxWidth="md"
      className="regenerateDlg"
    >
      <LoanRegenerateForm
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
      />
    </Dialog>
  );
};
