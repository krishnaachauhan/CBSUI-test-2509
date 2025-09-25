import { CircularProgress, Dialog } from "@mui/material";
import { useContext, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import * as API from "./api";
import i18n from "components/multiLanguage/languagesConfiguration";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { retrievalFormMetadata } from "./retrievalFormMetadata";
export const RetrivalParaForm = ({ closeDialog, retrievalParaValues }) => {
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const retrieveDataRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const retrieveData: any = useMutation(
    "getDataToConfirm",
    API.getDataToConfirm,
    {
      onSuccess: (data) => {
        closeDialog();
        retrievalParaValues(data, retrieveDataRef.current);
      },
      onError: async (error: any) => {},
    }
  );

  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError
  ) => {
    if (data) {
      data.FROM_DT = format(new Date(data.FROM_DT), "dd/MMM/yyyy");
      data.TO_DT = format(new Date(data.TO_DT), "dd/MMM/yyyy");

      const reqData: any = {
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        WORKING_DATE: authState?.workingDate,
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        DOC_CD: docCD,
        DISPLAY_LANGUAGE: i18n.resolvedLanguage,
        SCREEN_REF: docCD,
        ACCT_TYPE: data?.flag !== "A" ? "" : data.ACCT_TYPE,
        ACCT_CD: data?.flag !== "A" ? "" : data.ACCT_CD,
      };
      retrieveDataRef.current = { ...reqData, ...data };
      retrieveData.mutate({
        ...reqData,
        ...data,
      });

      endSubmit(true);
    }
  };

  return (
    <FormWrapper
      key={"responseParameterForm"}
      metaData={retrievalFormMetadata as MetaDataType}
      initialValues={{ COMP_CD: authState?.companyID }}
      onSubmitHandler={onSubmitHandler}
      formStyle={{
        background: "white",
      }}
      controlsAtBottom={true}
      containerstyle={{ padding: "10px" }}
      formState={{
        MessageBox: MessageBox,
        workingDt: authState?.workingDate,
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
              retrieveData?.isLoading ? <CircularProgress size={20} /> : null
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
  );
};

export const RetrivalPara = ({ closeDialog, retrievalParaValues }) => {
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
      <RetrivalParaForm
        closeDialog={closeDialog}
        retrievalParaValues={retrievalParaValues}
      />
    </Dialog>
  );
};
