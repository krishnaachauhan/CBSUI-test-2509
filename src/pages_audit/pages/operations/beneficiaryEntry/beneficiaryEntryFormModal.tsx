import {
  extractMetaData,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { t } from "i18next";
import React from "react";
import { IfscAllListSearch } from "../rtgsEntry/ifscCodeAllListSearch";
import { AuditBenfiDetailFormMetadata } from "./gridMetaData";
import { useMutation } from "react-query";
import * as API from "./api";
import { enqueueSnackbar } from "notistack";
import { GeneralAPI } from "registry/fns/functions";
import { handleDisplayMessages } from "components/utilFunction/function";

const BeneficiaryEntryFormModal = ({
  getIfscBenAcDetail,
  retrieveDataRefresh,
  retrieveData,
  formMode,
  onSubmitHandler,
  gridData,
  MessageBox,
  setIfscAllList,
  setRetrieveData,
  setisAddOpen,
  ifscAllList,
  setRetrieveDataRefresh,
  docCD,
  authState,
  gridDataRef,
}) => {
  const verifyAccount: any = useMutation(GeneralAPI.verifyAccount, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },

    onSuccess: async (data) => {
      await handleDisplayMessages(data?.[0]?.MSG, MessageBox);
    },
  });
  const handleOnFormButtonClick = (id, dependentFields) => {
    if (id === "Verify_ignoreField") {
      const flag =
        formMode === "new"
          ? dependentFields?.FLAG
          : dependentFields?.ACTIVE_FLAG;
      verifyAccount.mutate({
        A_ISNEWROW: formMode === "new" ? "Y" : "N",
        ENTERED_COMP_CD: authState?.companyID ?? "",
        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
        ACTIVE_FLAG: flag?.value ? "Y" : "N",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: gridDataRef?.current?.BRANCH_CD || gridDataRef?.BRANCH_CD,
        ACCT_TYPE: gridDataRef?.current?.ACCT_TYPE || gridDataRef?.ACCT_TYPE,
        ACCT_CD: gridDataRef?.current?.ACCT_CD || gridDataRef?.ACCT_CD,
        A_BENF_IFSC: dependentFields?.TO_IFSCCODE?.value ?? "",
        A_BENF_ACCT: dependentFields?.TO_ACCT_NO?.value ?? "",
        DOC_CD: docCD,
      });
    }
  };

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="xl"
      >
        {getIfscBenAcDetail?.isLoading ? (
          <LoaderPaperComponent />
        ) : (
          <FormWrapper
            key={`BenfiDetailForm${retrieveDataRefresh}${retrieveData}`}
            metaData={
              extractMetaData(
                AuditBenfiDetailFormMetadata,
                formMode
              ) as MetaDataType
            }
            displayMode={formMode}
            onSubmitHandler={onSubmitHandler}
            initialValues={
              formMode === "edit"
                ? {
                    ...getIfscBenAcDetail?.data?.[0],
                    ...gridData,
                    INACTIVE: gridData?.ACTIVE_FLAG,
                    ACTIVE_FLAG: gridData?.ACTIVE_FLAG === "Y",
                  }
                : {
                    TO_IFSCCODE: retrieveData?.IFSC_CODE,
                  }
            }
            formStyle={{
              background: "white",
            }}
            formState={{
              MessageBox: MessageBox,
              retrieveData: retrieveData,
            }}
            setDataOnFieldChange={(action, payload) => {
              if (action === "F5") {
                setIfscAllList(true);
                setRetrieveData("");
              }
            }}
            onFormButtonClickHandel={handleOnFormButtonClick}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {formMode === "new" ? (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                  >
                    {t("Save")}
                  </GradientButton>
                ) : gridData?.ACTIVE_FLAG === "Y" ? (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                  >
                    {t("Save")}
                  </GradientButton>
                ) : null}
                <GradientButton
                  onClick={() => {
                    setisAddOpen(false);
                  }}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        )}
      </Dialog>
      <>
        {ifscAllList ? (
          <IfscAllListSearch
            onClose={(flag, rowsData) => {
              setIfscAllList(false);
              if (flag === "action") {
                setRetrieveData(rowsData?.[0]?.data);
                setRetrieveDataRefresh((prev) => prev + 1);
              }
            }}
          />
        ) : null}
      </>
    </>
  );
};

export default BeneficiaryEntryFormModal;
