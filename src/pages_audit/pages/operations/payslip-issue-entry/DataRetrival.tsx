import React, { useContext, useRef, useState } from "react";
import { Dialog, CircularProgress } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns/esm";
import { useMutation } from "react-query";
import { RetrievalParameterFormMetaData } from "./paySlipMetadata";
import * as API from "./api";
import {
  GradientButton,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  Alert,
} from "@acuteinfo/common-base";
import { t } from "i18next";

export const DataRetrival = ({ closeDialog, open, onUpload }) => {
  const formRef = useRef(null);
  const { authState } = useContext(AuthContext);
  const [buttonState, setButtonState] = useState("A");
  const { MessageBox } = usePopupContext();
  const mutation = useMutation(API.getRetrievalDateWise, {
    onSuccess: (data) => {
      onUpload(data);
      closeDialog();
    },
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
  });

  const onSubmitHandler = (data, displayData, endSubmit, setFieldError) => {
    endSubmit(true);

    const payload = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      TRAN_CD: data?.DESCRIPTION,
      FROM_DT: format(new Date(data?.FROM_DT), "dd/MMM/yyyy"),
      TO_DT: format(new Date(data?.TO_DT), "dd/MMM/yyyy"),
      USER_LEVEL: authState?.role,
      GD_DATE: authState?.workingDate,
      FLAG: buttonState,
    };

    mutation.mutate(payload);
  };

  const handleRetrieveClick = (handleSubmit) => {
    let event: any = { preventDefault: () => {} };
    setButtonState("R");
    handleSubmit(event, "BUTTON_CLICK");
  };

  const handleViewAllClick = (handleSubmit) => {
    setButtonState("A");
    let event: any = { preventDefault: () => {} };
    handleSubmit(event, "BUTTON_CLICK");
  };

  return (
    <Dialog
      open={open}
      fullWidth
      className="Retrive"
      PaperProps={{
        style: {
          width: "auto",
          height: "auto",
        },
      }}
    >
      {mutation?.isError && (
        <Alert
          severity="error"
          errorMsg={mutation?.error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={mutation?.error?.error_detail}
          color="error"
        />
      )}
      <FormWrapper
        key={"retrievalParameterForm"}
        metaData={RetrievalParameterFormMetaData as MetaDataType}
        onSubmitHandler={onSubmitHandler}
        formStyle={{
          background: "white",
        }}
        controlsAtBottom
        containerstyle={{ padding: "10px" }}
        ref={formRef}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={() => handleRetrieveClick(handleSubmit)} //
              endIcon={
                mutation.isLoading && buttonState == "R" ? (
                  <CircularProgress size={20} />
                ) : null
              }
            >
              {t("Retrieve")}
            </GradientButton>
            <GradientButton
              onClick={() => handleViewAllClick(handleSubmit)} //
              endIcon={
                mutation.isLoading && buttonState === "A" ? (
                  <CircularProgress size={20} />
                ) : null
              }
            >
              {t("ViewAll")}
            </GradientButton>
            <GradientButton onClick={() => closeDialog()}>
              {t("Cancel")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};
