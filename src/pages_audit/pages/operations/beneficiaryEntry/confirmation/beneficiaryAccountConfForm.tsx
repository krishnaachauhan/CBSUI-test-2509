import { FC, useContext, useEffect, useState } from "react";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { Dialog, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";
import { t } from "i18next";
import {
  usePopupContext,
  LoaderPaperComponent,
  queryClient,
  ClearCacheProvider,
  FormWrapper,
  MetaDataType,
  GradientButton,
  Alert,
} from "@acuteinfo/common-base";
import { AuditBenfiDetailFormMetadata } from "../gridMetaData";

const BeneficiaryAccountConfirmForm: FC<{
  formMode?: any;
  rowsData?: any;
  onClose?: any;
  isDataChangedRef?: any;
  handlePrev?: any;
  handleNext?: any;
  currentIndex?: number;
  totalData?: number;
  formLabel?: any;
}> = ({
  formMode,
  rowsData,
  onClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndex,
  totalData,
  formLabel,
}) => {
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getIfscBenDetail"], () =>
    API.getIfscBenDetail({
      IFSC_CODE: rowsData?.TO_IFSCCODE ?? "",
      ENTRY_TYPE: "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getIfscBenDetail"]);
    };
  }, []);

  const confirmation: any = useMutation(
    "doConfirmBenAccount",
    API.doConfirmBenAccount,
    {
      onSuccess: async (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });
        isDataChangedRef.current = true;
        onClose();

        CloseMessageBox();
      },
      onError: (error: any) => {
        CloseMessageBox();
      },
    }
  );
  AuditBenfiDetailFormMetadata.form.label = formLabel;
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "66%",
        },
      }}
      maxWidth="lg"
    >
      {isLoading || isFetching ? (
        <LoaderPaperComponent />
      ) : (
        <>
          {(isError || confirmation?.isError) && (
            <Alert
              severity="error"
              errorMsg={
                error?.error_msg ??
                confirmation?.error?.error_msg ??
                "Unknow Error"
              }
              errorDetail={
                error?.error_detail ?? confirmation?.error?.error_detail ?? ""
              }
              color="error"
            />
          )}
          <FormWrapper
            key={`AddNewBenfiDetailForm` + currentIndex}
            metaData={AuditBenfiDetailFormMetadata as MetaDataType}
            displayMode={"view"}
            onSubmitHandler={() => {}}
            initialValues={{
              ...data?.[0],
              ...rowsData,
            }}
            formStyle={{
              background: "white",
            }}
            formState={{
              MessageBox: MessageBox,
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={() => {
                    if (currentIndex && currentIndex !== totalData) {
                      handleNext();
                    }
                  }}
                >
                  {t("MoveForward")}
                </GradientButton>
                <GradientButton
                  onClick={(e) => {
                    if (currentIndex && currentIndex > 0) {
                      handlePrev();
                    }
                  }}
                >
                  {t("Previous")}
                </GradientButton>
                <GradientButton
                  onClick={async (event) => {
                    if (authState?.user?.id === rowsData?.ENTERED_BY) {
                      await MessageBox({
                        messageTitle: t("ValidationFailed"),
                        message: t("ConfirmRestrictMsg"),
                        buttonNames: ["Ok"],
                      });
                    } else if (rowsData?.CONFIRMED === "Y") {
                      await MessageBox({
                        messageTitle: t("InvalidConfirmation"),
                        message: t("RecordAlredyConfirmed"),
                        buttonNames: ["Ok"],
                      });
                    } else {
                      const buttonName = await MessageBox({
                        messageTitle: t("Confirmation"),
                        message: "Are you sure to confirm this record?",
                        buttonNames: ["Yes", "No", "Cancel"],
                        loadingBtnName: ["Yes", "No"],
                      });
                      if (buttonName === "Yes") {
                        confirmation.mutate({
                          COMP_CD: rowsData?.COMP_CD,
                          BRANCH_CD: rowsData?.BRANCH_CD,
                          ACCT_TYPE: rowsData?.ACCT_TYPE,
                          ACCT_CD: rowsData?.ACCT_CD,
                          TRAN_CD: rowsData?.TRAN_CD,
                          CONFIRM: true,
                          ALLOW_DELETE: rowsData?.ALLOW_DELETE,
                        });
                      } else if (buttonName === "No") {
                        if (rowsData?.ALLOW_DELETE === "Y") {
                          confirmation.mutate({
                            COMP_CD: rowsData?.COMP_CD,
                            BRANCH_CD: rowsData?.BRANCH_CD,
                            ACCT_TYPE: rowsData?.ACCT_TYPE,
                            ACCT_CD: rowsData?.ACCT_CD,
                            TRAN_CD: rowsData?.TRAN_CD,
                            CONFIRM: false,
                            ALLOW_DELETE: rowsData?.ALLOW_DELETE,
                            DELETE_ROW: {
                              TO_LEI_NO: rowsData?.TO_LEI_NO,
                              TO_EMAIL_ID: rowsData?.TO_EMAIL_ID,
                              REMARKS: rowsData?.REMARKS,
                              TO_CONTACT_NO: rowsData?.TO_CONTACT_NO,
                              TO_ADD1: rowsData?.TO_ADD1,
                              TO_ACCT_NM: rowsData?.TO_ACCT_NM,
                              TO_ACCT_NO: rowsData?.TO_ACCT_NO,
                              TO_ACCT_TYPE: rowsData?.TO_ACCT_TYPE,
                              TO_IFSCCODE: rowsData?.TO_IFSCCODE,
                              ACCT_NM: rowsData?.ACCT_NM,
                            },
                            _LABELS_MASTER: {
                              TO_LEI_NO: "LEINo",
                              TO_EMAIL_ID: "EmailID",
                              REMARKS: "Remarks",
                              TO_CONTACT_NO: "MobileNo",
                              TO_ADD1: "Address",
                              TO_ACCT_NM: "Account_Name",
                              TO_ACCT_NO: "ACNumber",
                              TO_ACCT_TYPE: "AcctType",
                              TO_IFSCCODE: "IFSCCode",
                              ACCT_NM: "AcctHolderName",
                            },
                          });
                        } else {
                          const buttonName = await MessageBox({
                            messageTitle: t("Confirmation"),
                            message: t(
                              "This record will be activated. Do you want to proceed ?"
                            ),
                            buttonNames: ["Yes", "No"],
                            loadingBtnName: ["Yes"],
                          });
                          if (buttonName === "Yes") {
                            confirmation.mutate({
                              COMP_CD: rowsData?.COMP_CD,
                              BRANCH_CD: rowsData?.BRANCH_CD,
                              ACCT_TYPE: rowsData?.ACCT_TYPE,
                              ACCT_CD: rowsData?.ACCT_CD,
                              TRAN_CD: rowsData?.TRAN_CD,
                              ALLOW_DELETE: rowsData?.ALLOW_DELETE,
                              CONFIRM: false,
                            });
                          }
                        }
                      }
                    }
                  }}
                  color={"primary"}
                >
                  {t("Confirm")}
                </GradientButton>

                <GradientButton
                  onClick={() => {
                    onClose();
                  }}
                  //disabled={isSubmitting}
                  color={"primary"}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        </>
      )}
    </Dialog>
  );
};

export const BeneficiaryAccountConfirmFormWrapper = ({
  handleDialogClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndexRef,
  totalData,
  formLabel,
}) => {
  const { state: rows } = useLocation();
  currentIndexRef.current = rows?.index;

  return (
    <ClearCacheProvider>
      <BeneficiaryAccountConfirmForm
        formMode={rows?.formMode}
        rowsData={rows?.gridData}
        onClose={handleDialogClose}
        handlePrev={handlePrev}
        handleNext={handleNext}
        currentIndex={rows.index}
        isDataChangedRef={isDataChangedRef}
        totalData={totalData}
        formLabel={formLabel}
      />
    </ClearCacheProvider>
  );
};
