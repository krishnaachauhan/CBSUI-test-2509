import { CircularProgress, Dialog } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { RetriveParameterFormMetaData } from "./formMetaData";
import {
  usePopupContext,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import * as API from "./api";
import i18n from "components/multiLanguage/languagesConfiguration";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
export const ResponseParametersForm = ({
  closeDialog,
  retrievalParaValues,
}) => {
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const retrieveDataRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const retrieveDataMutation = useMutation(API.getAcctPhotoSign, {
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  const getAccountDetails: any = useMutation(
    "getCarousalCards",
    API.getCarousalCards,
    {
      onSuccess: (data) => {},
      onError: async (error: any) => {},
    }
  );
  const onSubmitHandler: SubmitFnType = (
    data,
    displayData,
    endSubmit,
    setFieldError
  ) => {
    if (Boolean(data)) {
      retrieveDataRef.current = data;
      const reqData: any = {
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        //@ts-ignore
        ACCT_TYPE: data?.ACCT_TYPE,
        //@ts-ignore
        ACCT_CD: data?.ACCT_CD,
        WORKING_DATE: authState?.workingDate,
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        DOC_CD: docCD,
        DISPLAY_LANGUAGE: i18n.resolvedLanguage,
      };
      retrieveDataMutation.mutate(reqData);
      getAccountDetails.mutate({
        PARENT_TYPE: "",
        //@ts-ignore
        ACCT_TYPE: data?.ACCT_TYPE,
        //@ts-ignore
        ACCT_CD: data?.ACCT_CD,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
      endSubmit(true);
    }
  };

  useEffect(() => {
    if (retrieveDataMutation?.data && getAccountDetails?.data) {
      retrievalParaValues(
        retrieveDataMutation?.data,
        getAccountDetails?.data,
        retrieveDataRef?.current
      );
      closeDialog();
    }
  }, [
    closeDialog,
    retrievalParaValues,
    retrieveDataMutation?.data,
    getAccountDetails?.data,
  ]);

  return (
    <>
      <FormWrapper
        key={"responseParameterForm"}
        metaData={RetriveParameterFormMetaData as MetaDataType}
        initialValues={{ COMP_CD: authState?.companyID }}
        onSubmitHandler={onSubmitHandler}
        formStyle={{
          background: "white",
        }}
        controlsAtBottom={true}
        containerstyle={{ padding: "10px" }}
        formState={{
          MessageBox: MessageBox,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
          docCD: docCD,
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              color={"primary"}
              endIcon={
                retrieveDataMutation?.isLoading ||
                getAccountDetails?.isLoading ? (
                  <CircularProgress size={20} />
                ) : null
              }
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton
              onClick={closeDialog}
              disabled={isSubmitting}
              color={"primary"}
            >
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </>
  );
};

export const ResponseParametersFormWrapper = ({
  closeDialog,
  retrievalParaValues,
}) => {
  return (
    <Dialog
      open={true}
      className="Retrieve"
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="sm"
    >
      <ResponseParametersForm
        closeDialog={closeDialog}
        retrievalParaValues={retrievalParaValues}
      />
    </Dialog>
  );
};
