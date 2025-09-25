import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  MetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import React, { useContext, useMemo, useRef } from "react";
import { DialogProvider } from "../payslip-issue-entry/DialogContext";
import { Dialog } from "@mui/material";
import { t } from "i18next";
import { si_metadata } from "./SIEntryMetaData";
import { AuthContext } from "pages_audit/auth";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import * as API from "./api";
import { useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import { formatDateField } from "./DisburseEntryMetaData";
import { getGridRowData } from "components/agGridTable/utils/helper";

const SIEntryMain = ({
  closeDialog,
  dataRef,
  insertApiData,
  viewMemoMutation,
  viewMemoRequestParameter,
}) => {
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const SaveSIMutation = useMutation(API.saveSiCharge, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      const returnValue: any = handleDisplayMessages(
        data?.[0]?.MSG,
        MessageBox
      );
      if (returnValue) {
        closeDialog();
        await viewMemoMutation?.mutate({
          ...viewMemoRequestParameter,
          TRAN_CD: insertApiData?.[0]?.TRAN_CD ?? "",
        });
      }
    },
  });

  const onFormSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    const commonData = {
      DR_COMP_CD: data?.DR_COMP_CD ?? "",
      DR_BRANCH_CD: data?.DR_BRANCH_CD ?? "",
      DR_ACCT_TYPE: data?.DR_ACCT_TYPE ?? "",
      DR_ACCT_CD: data?.DR_ACCT_CD ?? "",
      CR_COMP_CD: data?.CR_COMP_CD ?? "",
      CR_BRANCH_CD: data?.CR_BRANCH_CD ?? "",
      CR_ACCT_TYPE: data?.CR_ACCT_TYPE ?? "",
      CR_ACCT_CD: data?.CR_ACCT_CD ?? "",
      EXECUTE_DAY: data?.EXECUTE_DAY ?? "",
      VALID_UPTO: formatDateField(data?.VALID_UPTO) ?? "",
      SI_AMOUNT: data?.SI_AMOUNT ?? "",
      REMARKS: data?.REMARKS ?? "",
      START_DT: formatDateField(data?.START_DT) ?? "",
      FEQ_TYPE: data?.FEQ_TYPE ?? "",
      SI_CHARGE: data?.SI_CHARGE ?? "",
    };
    SaveSIMutation?.mutate({ ...commonData });
  };

  const executeOnDay = () => {
    const datevalue = dataRef?.current?.INS_START_DT;
    const day: any = datevalue ? new Date(datevalue).getDate() : "";
    return parseFloat(day) > 28 ? 28 : day;
  };

  const initialVal = useMemo(() => {
    if (!dataRef?.current) return {};
    return {
      CR_COMP_CD: authState?.companyID ?? "",
      DR_COMP_CD: authState?.companyID ?? "",
      CR_BRANCH_CD: dataRef?.current?.BRANCH_CD ?? "",
      CR_ACCT_TYPE: dataRef?.current?.ACCT_TYPE ?? "",
      CR_ACCT_CD: dataRef?.current?.ACCT_CD ?? "",
      CR_ACCT_NM: dataRef?.current?.ACCT_NM ?? "",
      BRANCH_CD: dataRef?.current?.BRANCH_CD
        ? dataRef?.current?.BRANCH_CD
        : authState?.user?.branchCode,
      SI_AMOUNT: insertApiData?.[0]?.SI_AMOUNT ?? "0",
      FEQ_TYPE: dataRef?.current?.INSTALLMENT_TYPE ?? "M",
      START_DT: formatDateField(insertApiData?.[0]?.START_DT) ?? "",
      VALID_UPTO: insertApiData?.[0]?.VALID_UPTO ?? "",
      EXECUTE_DAY: executeOnDay(),
    };
  }, [dataRef?.current, authState, insertApiData]);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1335px",
        },
      }}
    >
      <FormWrapper
        key={"acct-mst-si-tab-form"}
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        initialValues={initialVal}
        metaData={si_metadata as MetaDataType}
        formStyle={{}}
        formState={{
          ACCT_TYPE: dataRef?.current?.ACCT_TYPE,
          ACCT_CD: dataRef?.current?.ACCT_CD,
          BRANCH_CD: dataRef?.current?.BRANCH_CD
            ? dataRef?.current?.BRANCH_CD
            : authState?.user?.branchCode,
          docCD: docCD,
          authState: authState,
          MessageBox: MessageBox,
          acctDtlReqPara: {
            DR_ACCT_CD: {
              ACCT_TYPE: "DR_ACCT_TYPE",
              BRANCH_CD: "DR_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        controlsAtBottom={false}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => handleSubmit(event, "Save")}
              color="primary"
            >
              {t("Save")}
            </GradientButton>
            <GradientButton
              onClick={() => {
                closeDialog();
                viewMemoMutation?.mutate({
                  ...viewMemoRequestParameter,
                  TRAN_CD: insertApiData?.[0]?.TRAN_CD ?? "",
                });
              }}
              color="primary"
            >
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};

export const SIEntry = ({
  closeDialog,
  dataRef,
  insertApiData,
  viewMemoMutation,
  viewMemoRequestParameter,
}) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <SIEntryMain
            dataRef={dataRef}
            closeDialog={closeDialog}
            insertApiData={insertApiData}
            viewMemoMutation={viewMemoMutation}
            viewMemoRequestParameter={viewMemoRequestParameter}
          />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
