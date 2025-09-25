import { Dialog } from "@mui/material";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import { FDRetriveMetadata } from "./metaData/fdRetriveMetaData";
import { FDContext } from "../context/fdContext";
import {
  usePopupContext,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../function";

export const FDRetriveForm = ({ handleDialogClose, getFDViewDtlMutation }) => {
  const {
    FDState,
    updateRetrieveFormData,
    handleDisableButton,
    updateFDParaDetailData,
    updateAcctNoData,
  } = useContext(FDContext);
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { focusRef, setFocus } = useCommonFunctions();

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);
    updateRetrieveFormData(data);
    const reqParam = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: data?.BRANCH_CD ?? "",
      ACCT_TYPE: data?.ACCT_TYPE ?? "",
      ACCT_CD: data?.ACCT_CD ?? "",
      WORKING_DT: authState?.workingDate ?? "",
    };
    getFDViewDtlMutation?.mutate(reqParam);
    handleDialogClose();
  };

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="sm"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleDialogClose();
        }
      }}
      className="fdCommDlg"
    >
      <FormWrapper
        key={"fdRetriveForm"}
        metaData={FDRetriveMetadata as MetaDataType}
        onSubmitHandler={onSubmitHandler}
        formState={{
          MessageBox: MessageBox,
          handleDisableButton: handleDisableButton,
          docCD: docCD ?? "",
          setFocus: setFocus,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        formStyle={{
          background: "white",
        }}
        controlsAtBottom={true}
        setDataOnFieldChange={(action, payload) => {
          if (action === "GET_PARA_DATA") {
            updateFDParaDetailData(payload);
          }
          if (action === "ACCT_NO_DATA") {
            updateAcctNoData(payload);
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={handleSubmit}
              disabled={isSubmitting || FDState?.disableButton}
              color={"primary"}
              ref={focusRef}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={() => handleDialogClose(false)}>
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};
