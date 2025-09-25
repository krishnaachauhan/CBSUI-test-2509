import { CircularProgress, Dialog } from "@mui/material";
import { Fragment, useContext } from "react";
import { returnChequeFormMetaData } from "./formMetaData";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import * as API from "./api";
import { useLocation } from "react-router-dom";
import {
  usePopupContext,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  Alert,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { t } from "i18next";
export const ReturnChequeForm = ({ open, onclose }) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const returnChequeMutation = useMutation(API.cheQueReturn, {
    onSuccess: (data) => {
      onclose();
      MessageBox({
        messageTitle: data[0]?.O_MSG_TITLE,
        message: data[0]?.O_MESSAGE ?? "",
        icon: "SUCCESS",
      });
      CloseMessageBox();
    },
    onError: (error: any) => {
      MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    if (data?.REASON === "") {
      MessageBox({
        message: "Please Enter Proper Reason",
        messageTitle: "Error",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
    } else {
      const reqPara: any = {
        // ...data,
        COMP_CD: rows[0]?.data?.COMP_CD,
        BRANCH_CD: rows[0]?.data?.BRANCH_CD,
        ACCT_CD: rows[0]?.data?.ACCT_CD,
        ACCT_TYPE: rows[0]?.data?.ACCT_TYPE,
        TRAN_CD: rows[0]?.data?.TRAN_CD,
        AMOUNT: rows[0]?.data?.AMOUNT,
        CHEQUE_NO: data?.CHEQUE_NO,
        CHEQUE_DATE: format(
          new Date(rows[0]?.data?.CHEQUE_DATE),
          "dd/MMM/yyyy"
        ),
        BANK_CD: rows[0]?.data?.BANK_CD,
        TRAN_TYPE: data?.ZONE_TRAN_TYPE,
        ZONE: data?.ZONE_CD,
        REASON: data?.REASON,
        CHQ_MICR_CD: rows[0]?.data?.CHQ_MICR_CD,
        ACCT_NM: data?.ACCT_NM,
        SLIP_CD: rows[0]?.data?.SLIP_CD,
        BRANCH: rows[0]?.data?.BRANCH,
        OW_ENT_BR: rows[0]?.data?.ENTERED_BRANCH_CD,
        DTL2_SR_CD: rows[0]?.data?.DTL2_SR_CD,
        DESCRIPTION: data?.DESCRIPTION,
        RBI_CLG_TRAN: "0",
        SCREEN_REF: docCD,
      };
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
        loadingBtnName: ["Yes"],
      });
      if (btnName === "Yes") {
        returnChequeMutation.mutate(reqPara);
      }
    }
    endSubmit(true);
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            width: "60%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        {returnChequeMutation?.isError && (
          <Alert
            severity="error"
            errorMsg={
              returnChequeMutation?.error?.error_msg ??
              t("Somethingwenttowrong")
            }
            errorDetail={returnChequeMutation?.error?.error_detail}
            color="error"
          />
        )}
        <FormWrapper
          key="retrieveForm"
          metaData={returnChequeFormMetaData as MetaDataType}
          initialValues={{
            ...rows?.[0]?.data,
            ZONE_TRAN_TYPE: rows?.[0]?.data?.TRAN_TYPE,
          }}
          onSubmitHandler={onSubmitHandler}
          controlsAtBottom={true}
          formStyle={{
            background: "white",
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={async (event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={isSubmitting}
                endIcon={
                  returnChequeMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color={"primary"}
              >
                Ok
              </GradientButton>
              <GradientButton
                onClick={() => {
                  onclose();
                }}
                color={"primary"}
              >
                Cancel
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>
    </Fragment>
  );
};
