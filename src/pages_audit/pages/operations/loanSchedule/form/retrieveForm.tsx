import { Dialog } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "pages_audit/auth";
import { RetrievalFormMetaData } from "./retrieveFormMetadata";
import {
  usePopupContext,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

export const RetrievalForm = ({ closeDialog, retrievalParaValues }) => {
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const retrieveDataRef = useRef<any>(null);
  const [disableButton, setDisableButton] = useState(false);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);
    if (Boolean(data)) {
      if (Boolean(data["ACCT_CD"])) {
        data["ACCT_CD"] = utilFunction.getPadAccountNumber(
          data["ACCT_CD"],
          data["ACCT_TYPE"]
        );
      }
      retrieveDataRef.current = data;
      retrievalParaValues({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: retrieveDataRef?.current?.BRANCH_CD ?? "",
        ACCT_TYPE: retrieveDataRef?.current?.ACCT_TYPE ?? "",
        ACCT_CD: retrieveDataRef?.current?.ACCT_CD ?? "",
        ALLOW_REGERATE: retrieveDataRef?.current?.ALLOW_REGERATE ?? "",
        ALLOW_RESCHEDULE: retrieveDataRef?.current?.ALLOW_RESCHEDULE ?? "",
      });
    }
  };

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  return (
    <>
      <FormWrapper
        key={"retrievalParameterForm"}
        metaData={RetrievalFormMetaData as MetaDataType}
        initialValues={{}}
        onSubmitHandler={onSubmitHandler}
        //@ts-ignore
        formStyle={{
          background: "white",
        }}
        formState={{
          MessageBox: MessageBox,
          CloseMessageBox: CloseMessageBox,
          handleButtonDisable: handleButtonDisable,
          docCD: docCD ?? "",
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        controlsAtBottom={true}
        containerstyle={{ padding: "10px" }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              disabled={isSubmitting || disableButton}
              color={"primary"}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={closeDialog} color={"primary"}>
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </>
  );
};

export const RetrievalFormWrapper = ({ closeDialog, retrievalParaValues }) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="md"
      className="retrieveDlg"
    >
      <RetrievalForm
        closeDialog={closeDialog}
        retrievalParaValues={retrievalParaValues}
      />
    </Dialog>
  );
};
