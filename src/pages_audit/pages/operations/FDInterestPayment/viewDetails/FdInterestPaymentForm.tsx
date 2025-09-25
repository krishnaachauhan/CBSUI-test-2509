import { Box, CircularProgress } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { FdInterestPaymentFormMetaData } from "./metaData";
import {
  LoaderPaperComponent,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
  GradientButton,
  usePopupContext,
  utilFunction,
  extractMetaData,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../../fix-deposit/function";
const FdInterestPaymentForm = ({
  closeDialog,
  gridData,
  rows,
  defaultView,
  updateGrid,
  updateRow,
  fdDetails,
}) => {
  const { authState } = useContext(AuthContext);
  const [disableButton, setDisableButton] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [formMode, setFormMode] = useState(defaultView);
  const isCurrentErrorFuncRef = useRef<any>(null);
  const iscarryForwardErrorFuncRef = useRef<any>(null);
  const myFormRef = useRef<any>(null);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { focusRef, setFocus } = useCommonFunctions();

  const updateAndCheck = (newData, oldData) => {
    // Update oldData with newData
    for (const key in newData) {
      if (newData?.hasOwnProperty(key) && key !== "FD_NO") {
        oldData[key] = newData[key];
      }
    }
    // Call the updateGrid function with the updated oldData
    updateGrid(oldData);
  };
  const isLastRow = () => {
    const currentIndex = gridData?.findIndex(
      (item) => JSON.stringify(item) === JSON.stringify(rows?.[0]?.data)
    );
    return currentIndex === gridData?.length - 1;
  };

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

    const index = gridData?.findIndex(
      (item) => JSON.stringify(item) === JSON.stringify(rows?.[0]?.data)
    );
    let currentOldData = { ...rows?.[0]?.data };
    const currentfdNo = currentOldData?.FD_NO;
    let flagCheckData =
      fdDetails?.find((item) => item?.FD_NO === currentfdNo) || {};

    let currentNewData = {
      ...data,
      isNewRow: flagCheckData?.PAYMENT_MODE === "" ? true : false,
    };
    let currentUpd = utilFunction.transformDetailsData(
      currentNewData,
      currentOldData
    );
    if (actionFlag === "Save") {
      isCurrentErrorFuncRef.current = {
        data: {
          ...currentNewData,
          ...currentUpd,
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: currentOldData?.BRANCH_CD ?? "",
          ACCT_TYPE: currentOldData?.ACCT_TYPE ?? "",
          ACCT_CD: currentOldData?.ACCT_CD ?? "",
        },
        displayData,
        endSubmit,
        setFieldError,
      };
      if (isCurrentErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length !== 0) {
        const btnName = await MessageBox({
          message: "SaveData",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          updateAndCheck(currentNewData, currentOldData);
          updateRow(isCurrentErrorFuncRef.current?.data);
          CloseMessageBox();
          closeDialog();
        }
      }
    }
    if (actionFlag === "CarryForward") {
      let carryForwardData = { ...data };

      let nextRowData = gridData[index + 1];
      carryForwardData.FD_NO = nextRowData?.FD_NO;
      let carryForwardflagCheckData =
        fdDetails?.find((item) => item?.FD_NO === nextRowData?.FD_NO) || {};

      carryForwardData = {
        ...carryForwardData,
        isNewRow: carryForwardflagCheckData?.PAYMENT_MODE === "" ? true : false,
      };
      let carryForwardUpd = utilFunction.transformDetailsData(
        carryForwardData,
        carryForwardflagCheckData
      );

      iscarryForwardErrorFuncRef.current = {
        data: {
          ...carryForwardData,
          ...carryForwardUpd,
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: nextRowData?.BRANCH_CD ?? "",
          ACCT_TYPE: nextRowData?.ACCT_TYPE ?? "",
          ACCT_CD: nextRowData?.ACCT_CD ?? "",
        },
        displayData,
        endSubmit,
        setFieldError,
      };
      if (
        iscarryForwardErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length !== 0
      ) {
        let btnName = await MessageBox({
          messageTitle: "Confirmation",
          message: `${t(`CarryForwardmsg`, {
            CURRENT_FD_NO: currentOldData?.FD_NO,
            CARRYFORWARD_FD_NO: carryForwardData?.FD_NO,
          })}`,
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          updateAndCheck(carryForwardData, nextRowData);
          updateRow(iscarryForwardErrorFuncRef?.current?.data);
        }
      }
    }
  };
  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };
  useEffect(() => {
    FdInterestPaymentFormMetaData.form.label =
      utilFunction?.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        false
      ) +
      " " +
      rows?.[0]?.data?.FD_NO;
  }, [rows?.[0]?.data]);

  return (
    <>
      <FormWrapper
        key={"FdInterestPaymentFormDetails" + formMode}
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
          SCREEN_REF: docCD,
          acctDtlReqPara: {
            CR_ACCT_CD: {
              ACCT_TYPE: "CR_ACCT_TYPE",
              BRANCH_CD: "CR_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
          setFocus: setFocus,
        }}
        ref={myFormRef}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {formMode === "edit" ? (
              <>
                {!isLastRow() && (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "CarryForward");
                    }}
                    disabled={isSubmitting || disableButton}
                    color={"primary"}
                  >
                    {t("CarryForward")}
                  </GradientButton>
                )}
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
                {!isLastRow() && (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "CarryForward");
                    }}
                    color={"primary"}
                  >
                    {t("CarryForward")}
                  </GradientButton>
                )}
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

export const FdInterestPaymentDetail = ({
  closeDialog,
  gridData,
  rows,
  defaultView,
  updateGrid,
  updateRow,
  fdDetails,
}) => {
  return (
    <>
      {gridData ? (
        <FdInterestPaymentForm
          closeDialog={closeDialog}
          gridData={gridData}
          rows={rows}
          updateGrid={updateGrid}
          updateRow={updateRow}
          defaultView={defaultView}
          fdDetails={fdDetails}
        />
      ) : (
        <LoaderPaperComponent />
      )}
    </>
  );
};
