import {
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  Stack,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import { useContext, useRef, useState, useEffect, useMemo } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { FDContext } from "../context/fdContext";
import { FDDetailForm } from "./fdDetailForm";
import { TransferAcctDetailForm } from "./trnsAcctDtlForm";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@mui/styles";
import {
  ColorlibConnector,
  ColorlibStepIconRoot,
  GradientButton,
  usePopupContext,
  utilFunction,
  SubmitFnType,
  lessThanDate,
  Alert,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import CommonSvgIcons from "assets/icons/commonSvg/commonSvgIcons";
import { getdocCD } from "components/utilFunction/function";
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
  formHeaderTitle: {
    margin: "0",
    fontWeight: "500",
    fontSize: "1.25rem",
    lineHeight: "1.6",
    letterSpacing: "0.0075em",
    color: "var(--theme-color2)",
  },
}));

type FixDepositFormProps = {
  defaultView?: string;
  handleDialogClose?: any;
  isDataChangedRef?: any;
  openNewFdForScheme?: boolean;
  getFDParaDetails?: any;
  getFDMatDtForSchemeMutation?: any;
  getFDParaDetailMutation?: any;
};

export const FixDepositForm: React.FC<FixDepositFormProps> = ({
  defaultView,
  handleDialogClose,
  isDataChangedRef,
  openNewFdForScheme,
  getFDParaDetails,
  getFDMatDtForSchemeMutation,
  getFDParaDetailMutation,
}) => {
  const { t } = useTranslation();
  const {
    FDState,
    setActiveStep,
    updateSourceAcctFormData,
    setIsBackButton,
    updateFDDetailArrayFGridData,
    handleDisableButton,
    updateSavedFormFieldData,
  } = useContext(FDContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;
  const [steps, setSteps] = useState([
    t("FixedDepositDetails"),
    t("SourceACDetails"),
  ]);
  const fdDetailsformRef = useRef<any>(null);
  const sourceAcctformRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const headerClasses = useTypeStyles();
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const [arrayFieldGridData, setArrayFieldGridData] = useState([]);

  // Sync arrayFieldGridData with context when navigating back
  useEffect(() => {
    if (
      FDState?.isBackButton &&
      Array.isArray(FDState?.fdDetailArrayFGridData)
    ) {
      setArrayFieldGridData(FDState.fdDetailArrayFGridData);
    }
  }, [FDState?.isBackButton, FDState?.fdDetailArrayFGridData]);

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    // Object mapping step numbers to corresponding icons
    const icons: { [index: string]: React.ReactElement } = {
      1: <CommonSvgIcons iconName={"LIEN"} />,
      2: <CommonSvgIcons iconName={"ACHOW"} />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  const formHeaderContent = useMemo(() => {
    return `${utilFunction.getDynamicLabel(
      currentPath,
      authState?.menulistdata,
      true
    )} of A/c No.: ${FDState?.retrieveFormData?.BRANCH_CD?.trim() ?? ""}-${
      FDState?.retrieveFormData?.ACCT_TYPE?.trim() ?? ""
    }-${FDState?.retrieveFormData?.ACCT_CD?.trim() ?? ""} ${
      FDState?.retrieveFormData?.ACCT_NM?.trim() ?? ""
    }`;
  }, [
    currentPath,
    authState?.menulistdata,
    FDState?.retrieveFormData?.BRANCH_CD,
    FDState?.retrieveFormData?.ACCT_TYPE,
    FDState?.retrieveFormData?.ACCT_CD,
    FDState?.retrieveFormData?.ACCT_NM,
  ]);

  //Mutation for Save new FD details
  const saveFDDetailsMutation = useMutation(API.saveFDDetails, {
    onError: async (error: any) => {
      let errorMsg = "Unknownerroroccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      await MessageBox({
        messageTitle: "Error",
        message: errorMsg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      for (const response of data ?? []) {
        if (response?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "ValidationFailed",
            message: response?.O_MESSAGE ?? "",
            icon: "ERROR",
          });
        } else if (response?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "Alert",
            message: response?.O_MESSAGE ?? "",
            icon: "WARNING",
          });
        } else if (response?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "Confirmation",
            message: response?.O_MESSAGE ?? "",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            break;
          }
        } else if (response?.O_STATUS === "0") {
          isDataChangedRef.current = true;
          CloseMessageBox();
          handleDialogClose();
        }
      }
    },
  });

  //Mutation for Validate new FD details
  const validateFDDetailsMutation = useMutation(API.validateFDDetails, {
    onError: async (error: any) => {
      let errorMsg = "Unknownerroroccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      await MessageBox({
        messageTitle: "Error",
        message: errorMsg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data, variables) => {
      for (const response of data ?? []) {
        if (response?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "ValidationFailed",
            message: response?.O_MESSAGE ?? "",
            icon: "ERROR",
          });
        } else if (response?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "Alert",
            message: response?.O_MESSAGE ?? "",
            icon: "WARNING",
          });
        } else if (response?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: response?.O_MSG_TITLE?.length
              ? response?.O_MSG_TITLE
              : "Confirmation",
            message: response?.O_MESSAGE ?? "",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            break;
          }
        } else if (response?.O_STATUS === "0") {
          let trsfAmt = 0;
          let cashAmt = 0;
          if (
            Array.isArray(variables?.FD_DETAIL_DATA) &&
            variables?.FD_DETAIL_DATA?.length > 0
          ) {
            variables?.FD_DETAIL_DATA?.forEach((obj) => {
              if (obj?.TRSF_AMT && obj.TRSF_AMT !== "") {
                trsfAmt += Number(obj?.TRSF_AMT);
              }
              if (obj?.CASH_AMT && obj.CASH_AMT !== "") {
                cashAmt += Number(obj?.CASH_AMT);
              }
            });
          }
          if (Number(trsfAmt) <= 0) {
            const buttonName = await MessageBox({
              messageTitle: "Confirmation",
              message: "Proceed?",
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });

            const fdDetailData = variables?.FD_DETAIL_DATA || [];
            const reorderedData = [...fdDetailData].sort((a, b) => {
              if (a.cd && !b.cd) return 1;
              if (!a.cd && b.cd) return -1;
              return 0;
            });

            if (buttonName === "Yes") {
              saveFDDetailsMutation.mutate({
                TRANSACTION_DTL: [],
                FD_DETAIL_DATA: reorderedData,
                SCREEN_REF: docCD ?? "",
              });
            }
          } else {
            setActiveStep(FDState.activeStep + 1);
          }
        }
      }
    },
  });
  // Detail form validate handler for new entry
  const detailsFormSubmitHandlerArrayField = async () => {
    // Always save current form field data before proceeding
    try {
      const currentFormData = await fdDetailsformRef?.current?.getFieldData();
      if (currentFormData && typeof currentFormData === "object") {
        updateSavedFormFieldData({
          ...currentFormData,
          TRAN_DT: currentFormData?.TRAN_DT
            ? format(new Date(currentFormData?.TRAN_DT), "dd/MMM/yyyy")
            : "",
          MATURITY_DT: currentFormData?.MATURITY_DT
            ? format(new Date(currentFormData?.MATURITY_DT), "dd/MMM/yyyy")
            : "",
        });
      }
    } catch (error) {
      console.warn("Could not save form field data:", error);
    }
    if (Array.isArray(arrayFieldGridData) && arrayFieldGridData.length > 0) {
      const newData: any = arrayFieldGridData;

      if (!Array.isArray(newData) || newData.length === 0) return;

      const updatedData = newData.map((obj) => ({
        ...obj,
        TRAN_DT: obj.TRAN_DT
          ? format(new Date(obj.TRAN_DT), "dd/MMM/yyyy")
          : "",
        MATURITY_DT: obj.MATURITY_DT
          ? format(new Date(obj.MATURITY_DT), "dd/MMM/yyyy")
          : "",
      }));

      const totalAmount = updatedData.reduce(
        (sum, { CASH_AMT = 0, TRSF_AMT = 0 }) =>
          sum + Number(CASH_AMT) + Number(TRSF_AMT),
        0
      );
      updateFDDetailArrayFGridData(updatedData);
      updateSourceAcctFormData([{ ACCT_NAME: "" }]);

      if (totalAmount <= 0) {
        MessageBox({
          messageTitle: t("ValidationFailed"),
          message: "TotalAmountCantbeZeroNegative",
          icon: "ERROR",
        });
      } else {
        await validateFDDetailsMutation.mutate({
          FD_DETAIL_DATA: updatedData,
          SCREEN_REF: docCD ?? "",
        });
      }
    } else {
      let formData = await fdDetailsformRef?.current?.getFieldData();

      if (
        !formData ||
        typeof formData !== "object" ||
        Object.keys(formData).length === 0
      ) {
        return;
      }
      const { ADDNEWROW, CANCEL, UPDATE, ...cleanedData } = formData;

      cleanedData.TRAN_DT = cleanedData.TRAN_DT
        ? format(new Date(cleanedData.TRAN_DT), "dd/MMM/yyyy")
        : "";

      cleanedData.MATURITY_DT = cleanedData.MATURITY_DT
        ? format(new Date(cleanedData.MATURITY_DT), "dd/MMM/yyyy")
        : "";

      const requiredFields = [
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "TRAN_DT",
        "PERIOD_CD",
        "PERIOD_NO",
        "INT_RATE",
        "TERM_CD",
        "MATURITY_AMT",
      ];

      for (const field of requiredFields) {
        const value = cleanedData[field]?.toString().trim();
        if (!value) {
          return;
        }
        if (field === "MATURITY_AMT" && parseFloat(value) <= 0) {
          MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("TotalAmountCantbeZeroNegative"),
            icon: "ERROR",
          });
          return;
        }
      }

      const tranDate = new Date(cleanedData.TRAN_DT);
      const workingDate = new Date(authState?.workingDate);

      if (lessThanDate(workingDate, tranDate, { ignoreTime: true })) {
        return;
      }
      updateSourceAcctFormData([{ ACCT_NAME: "" }]);
      await validateFDDetailsMutation.mutate({
        FD_DETAIL_DATA: [cleanedData],
        SCREEN_REF: docCD ?? "",
      });
    }
  };

  const handleComplete = (e) => {
    if (FDState.activeStep === 0) {
      detailsFormSubmitHandlerArrayField();
    } else if (FDState.activeStep === 1) {
      sourceAcctformRef.current?.handleSubmit(e);
    }
  };

  const finalOnSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);

    let newData = data?.TRNDTLS?.map((obj) => ({
      ...obj,
      CHEQUE_DT: obj.CHEQUE_DATE
        ? format(new Date(obj.CHEQUE_DATE), "dd/MMM/yyyy")
        : "",
    }));

    newData = newData.map((obj) => {
      delete obj.CHEQUE_DATE;
      return obj;
    });

    if (parseFloat(data?.TOTAL_DR_AMOUNT) <= 0) {
      MessageBox({
        messageTitle: "ValidationFailed",
        message: "TotalDebitAmountCantBeZeroNegative",
        icon: "ERROR",
      });
    } else if (
      parseFloat(data?.TOTAL_DR_AMOUNT) !== parseFloat(data?.TOTAL_FD_AMOUNT)
    ) {
      MessageBox({
        messageTitle: "ValidationFailed",
        message: "TotalDebitAmountShouldBeEqualToTotalFDAmount",
        icon: "ERROR",
      });
    } else if (parseFloat(data?.DIFF_AMOUNT) === 0) {
      const buttonName = await MessageBox({
        messageTitle: "Confirmation",
        message: "Proceed?",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });

      const fdDetailData = FDState?.fdDetailArrayFGridData || [];
      const reorderedData = [...fdDetailData].sort((a, b) => {
        if (a.cd && !b.cd) return 1;
        if (!a.cd && b.cd) return -1;
        return 0;
      });

      if (buttonName === "Yes") {
        saveFDDetailsMutation.mutate({
          TRANSACTION_DTL: [...newData],
          FD_DETAIL_DATA:
            FDState?.fdDetailArrayFGridData?.length > 0
              ? reorderedData
              : [FDState?.savedFormFieldData],
          SCREEN_REF: docCD ?? "",
        });
      }
    }
  };
  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "hidden",
            position: "relative",
            padding: "0 10px 10px 10px",
            minHeight: "52vh",
            maxHeight: "100%",
          },
        }}
        maxWidth="xl"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            handleDialogClose();
          }
        }}
        className="fdCommDlg"
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            minHeight: "118px",
            zIndex: 1,
            overflow: "hidden",
            borderBottom: "2px solid var(--theme-color4)",
            paddingBottom: "6px",
          }}
        >
          <AppBar
            className="form__header"
            style={{ marginBottom: "22px", position: "relative" }}
          >
            <Toolbar variant="dense" className={headerClasses.root}>
              <Typography
                component="span"
                variant="h5"
                className={headerClasses.title}
              >
                {formHeaderContent}
              </Typography>
              <GradientButton onClick={handleDialogClose}>
                {t("Close")}
              </GradientButton>
            </Toolbar>
          </AppBar>
          <Stack sx={{ width: "100%", position: "relative" }} spacing={4} />
          <Stepper
            alternativeLabel
            activeStep={FDState.activeStep}
            connector={<ColorlibConnector />}
          >
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  componentsProps={{
                    label: {
                      style: { marginTop: "2px", color: "var(--theme-color1)" },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {(getFDParaDetails?.isError ||
          getFDParaDetailMutation?.isError ||
          getFDMatDtForSchemeMutation?.isError) && (
          <Alert
            severity="error"
            errorMsg={
              getFDParaDetails?.error?.error_msg ||
              getFDParaDetailMutation?.error?.error_msg ||
              getFDMatDtForSchemeMutation?.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              getFDParaDetails?.error?.error_detail ||
              getFDParaDetailMutation?.error?.error_detail ||
              getFDMatDtForSchemeMutation?.error?.error_detail
            }
            color="error"
          />
        )}

        <div
          style={{
            marginTop: "0px",
            overflowY: "auto",
            maxHeight: "calc(90vh - 150px)",
            borderBottom: "2px solid var(--theme-color4)",
            overflow: "hidden",
          }}
        >
          {FDState.activeStep === 0 ? (
            <FDDetailForm
              ref={fdDetailsformRef}
              defaultView={defaultView}
              openNewFdForScheme={openNewFdForScheme}
              setArrayFieldGridData={setArrayFieldGridData}
            />
          ) : FDState.activeStep === 1 ? (
            <TransferAcctDetailForm
              onSubmitHandler={finalOnSubmitHandler}
              ref={sourceAcctformRef}
              handleDisableButton={handleDisableButton}
            />
          ) : (
            <></>
          )}
        </div>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row-reverse",
            margin: "0px !important",
            paddingTop: "10px",
          }}
        >
          {FDState?.activeStep !== steps.length && (
            <>
              {FDState?.activeStep !== steps.length - 1 ? (
                <GradientButton
                  onClick={handleComplete}
                  endIcon={
                    validateFDDetailsMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  disabled={
                    validateFDDetailsMutation?.isLoading ||
                    getFDParaDetails?.isError ||
                    getFDParaDetailMutation?.isError ||
                    getFDMatDtForSchemeMutation?.isError ||
                    FDState?.disableButton
                  }
                  color={"primary"}
                >
                  {t("Next")}
                </GradientButton>
              ) : (
                <GradientButton
                  disabled={FDState?.disableButton}
                  onClick={handleComplete}
                >
                  {t("Finish")}
                </GradientButton>
              )}
            </>
          )}
          {FDState?.activeStep === 0 ? null : (
            <GradientButton
              onClick={() => {
                setIsBackButton(true);
                setActiveStep(FDState?.activeStep - 1);
              }}
            >
              {t("Back")}
            </GradientButton>
          )}
        </Box>
      </Dialog>
    </>
  );
};
