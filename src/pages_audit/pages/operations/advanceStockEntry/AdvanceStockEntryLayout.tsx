import {
  Alert,
  extractMetaData,
  FormWrapper,
  GradientButton,
  usePopupContext,
  LoaderPaperComponent,
  RemarksAPIWrapper,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog, Paper } from "@mui/material";
import { EntryFormMetaData } from "./formMetaData/entryFormMetaData";
import { t } from "i18next";
import EntryGrid from "./entryGrid";
import { useRef, useState } from "react";
import { ViewAcctDtl } from "./viewAcctDetail";
import { AdvanceStockEntryBodyProps, APIError } from "./types";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import { crudStockData, stockConfirm } from "../stockEntry/api";

const AdvanceStockEntryBody = ({
  dialogState,
  setDialogState,
  closeDialog,
  formData,
  detailData,
  screenPara,
  isLoading,
  authState,
  gridApiRef,
  docCD,
  rows,
  onSubmitHandler,
  validateMutation,
  saveDataMutation,
  isErrorFuncRef,
  screenForUse,
  confirmedDataGridMutation,
}: AdvanceStockEntryBodyProps) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [gridDataRef, setGridDataRef] = useState<any[]>([]);
  const [deletePopup, setDeletePopup] = useState<boolean>(false);
  const isForceExpiredRef = useRef<boolean>(false);

  const handleDelete = async () => {
    if (formData?.ALLOW_DEL === "N") {
      await MessageBox({
        message: "backDateEntryDeleteRestrictionMsg",
        messageTitle: "Error",
        loadingBtnName: ["Yes"],
        icon: "ERROR",
      });
    } else {
      const btnName = await MessageBox({
        message: "DeleteData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        saveDataMutation.mutate({
          _isDeleteRow: true,
          TRAN_CD: formData?.TRAN_CD,
          COMP_CD: formData?.COMP_CD,
          BRANCH_CD: formData?.BRANCH_CD,
          CONFIRMED: screenPara,
          ...formData,
          DETAILS_DATA: {
            isNewRow: [],
            isUpdatedRow: [],
            isDeleteRow: detailData,
          },
        });
      }
    }
  };
  const handleForceExpire = async () => {
    const res = await MessageBox({
      messageTitle: "confirmation",
      message: "forceExpDrawingPowerMSG",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
    });
    if (res === "Yes") isForceExpiredRef.current = true;
  };

  const refetchStockConfirmGridData = () => {
    confirmedDataGridMutation.mutate({
      screenFlag: "stockCFM",
      COMP_CD: authState.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      workingDate: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      SCREEN_REF: docCD ?? "",
    });
  };
  const stockCfm: any = useMutation("stockConfirm", stockConfirm, {
    onError: () => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (data?.[0]?.STATUS === "9") {
        await MessageBox({
          messageTitle: "Alert",
          message: data?.[0]?.MESSAGE,
          icon: "WARNING",
          defFocusBtnName: "Ok",
        });
      }
      CloseMessageBox();
      closeDialog();
      refetchStockConfirmGridData();
      enqueueSnackbar(t("DataConfirmMessage"), {
        variant: "success",
      });
    },
  });
  const stockDataCRUD: any = useMutation("crudStockData", crudStockData, {
    onSuccess: (data) => {
      closeDialog();
      setDeletePopup(false);
      refetchStockConfirmGridData();
      if (data?.[0]?.STATUS === "999") {
        MessageBox({
          messageTitle: "Alert",
          message: data?.[0]?.MESSAGE,
          icon: "WARNING",
          defFocusBtnName: "Ok",
        });
      } else {
        enqueueSnackbar(t("DataRejectMessage"), {
          variant: "success",
        });
      }
    },
    onError: () => {
      setDeletePopup(false);
    },
  });
  return (
    <Dialog open fullWidth maxWidth="xl">
      {isLoading ? (
        <Paper sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <LoaderPaperComponent />
        </Paper>
      ) : (
        <>
          {(validateMutation?.isError || saveDataMutation?.isError) && (
            <Alert
              severity="error"
              errorMsg={
                (validateMutation.error as APIError)?.error_msg ??
                (saveDataMutation.error as APIError)?.error_msg ??
                t("Somethingwenttowrong")
              }
              errorDetail={
                (validateMutation.error as APIError)?.error_detail ??
                (saveDataMutation.error as APIError)?.error_detail
              }
              color="error"
            />
          )}
          <FormWrapper
            key={`advStockEntry-${dialogState.formMode}`}
            metaData={extractMetaData(EntryFormMetaData, dialogState.formMode)}
            displayMode={dialogState.formMode}
            onSubmitHandler={onSubmitHandler}
            formState={{
              authState,
              MessageBox,
              docCD,
              refId: isForceExpiredRef,
              formMode: dialogState.formMode,
              ALLOW_FORCE_EXPIRE_FLAG: formData?.ALLOW_FORCE_EXPIRE_FLAG ?? "N",
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "ACCT_TYPE",
                  BRANCH_CD: "BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            initialValues={
              dialogState.formMode === "new"
                ? {}
                : {
                    ...(formData ?? {}),
                    WITHDRAW_DT: formData?.ASON_DT || authState?.workingDate,
                    INSURANCE_AMOUNT: detailData?.[0]?.INSURANCE_AMOUNT ?? "",
                    FORM_MODE: dialogState?.formMode,
                    INSURANCE_TYPE_DESC:
                      detailData?.[0]?.INSURANCE_TYPE_DESC ?? "",
                  }
            }
            formStyle={{ background: "white" }}
            onFormDataChange={(_, field) =>
              setDialogState((s) => ({ ...s, securityCd: field?.value }))
            }
            onFormButtonClickHandel={async (id) => {
              if (id === "VIEW_ACCT_DTL") {
                setDialogState((s) => ({ ...s, acctDtlViewOpen: true }));
              } else if (id === "FPRCE_EXPIRED") {
                handleForceExpire();
              }
            }}
            setDataOnFieldChange={async (action, payload) => {
              if (action === "GRID_DATA") {
                setDialogState((s) => ({ ...s, gridData: payload }));
                setGridDataRef(payload);
              } else if (action === "VIEW_ACCT_DTK") {
                setDialogState((s) => ({ ...s, reqData: payload }));
              }
            }}
          >
            {({ handleSubmit }) => (
              <>
                {dialogState.formMode === "edit" && screenForUse === "entry" ? (
                  <>
                    <GradientButton onClick={handleDelete} color="primary">
                      {t("Delete")}
                    </GradientButton>

                    {!isForceExpiredRef.current &&
                    formData?.ALLOW_FORCE_EXPIRE_FLAG === "Y" ? (
                      <GradientButton
                        onClick={handleForceExpire}
                        color="primary"
                      >
                        {t("ForceExpire")}
                      </GradientButton>
                    ) : null}

                    <GradientButton
                      disabled={!isForceExpiredRef.current}
                      onClick={(e) => handleSubmit(e, "Save")}
                      endIcon={
                        validateMutation.isLoading ||
                        saveDataMutation.isLoading ? (
                          <CircularProgress size={20} />
                        ) : null
                      }
                      color="primary"
                    >
                      {t("Save")}
                    </GradientButton>

                    <GradientButton onClick={closeDialog} color="primary">
                      {t("Close")}
                    </GradientButton>
                  </>
                ) : dialogState.formMode === "new" &&
                  screenForUse === "entry" ? (
                  <>
                    <GradientButton
                      onClick={(e) => handleSubmit(e, "Save")}
                      color="primary"
                      disabled={validateMutation.isLoading}
                      endIcon={
                        validateMutation.isLoading ? (
                          <CircularProgress size={20} />
                        ) : null
                      }
                    >
                      {t("Save")}
                    </GradientButton>
                    <GradientButton onClick={closeDialog} color="primary">
                      {t("Close")}
                    </GradientButton>
                  </>
                ) : (
                  <>
                    {screenForUse === "entry" && (
                      <>
                        <GradientButton onClick={handleDelete} color="primary">
                          {t("Delete")}
                        </GradientButton>
                        <GradientButton
                          onClick={() =>
                            setDialogState((s) => ({ ...s, formMode: "edit" }))
                          }
                          color="primary"
                        >
                          {t("Edit")}
                        </GradientButton>
                      </>
                    )}

                    {screenForUse === "confirm" && (
                      <>
                        <GradientButton
                          color="primary"
                          onClick={async () => {
                            let buttonName = await MessageBox({
                              messageTitle: "confirmation",
                              message: "AreYouSureToConfirm",
                              buttonNames: ["Yes", "No"],
                              defFocusBtnName: "Yes",
                              loadingBtnName: ["Yes"],
                            });
                            if (buttonName === "Yes") {
                              stockCfm.mutate({
                                IS_CONFIMED: true,
                                COMP_CD: authState?.companyID,
                                BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
                                ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
                                ACCT_CD: rows?.[0]?.data?.ACCT_CD,
                                TRAN_CD: rows?.[0]?.data?.TRAN_CD,
                                LAST_ENTERED_BY:
                                  rows?.[0]?.data?.LAST_ENTERED_BY,
                                ASON_DT: rows?.[0]?.data?.ASON_DT,
                              });
                            }
                          }}
                        >
                          {t("Confirm")}
                        </GradientButton>
                        <GradientButton
                          color="primary"
                          onClick={() => setDeletePopup(true)}
                        >
                          {t("Reject")}
                        </GradientButton>
                      </>
                    )}

                    <GradientButton onClick={closeDialog} color="primary">
                      {t("Close")}
                    </GradientButton>
                  </>
                )}
              </>
            )}
          </FormWrapper>

          <EntryGrid
            formMode={dialogState.formMode}
            securityCd={
              dialogState.formMode === "new"
                ? dialogState.securityCd
                : formData?.SECURITY_CD
            }
            gridData={dialogState.formMode === "new" ? gridDataRef : detailData}
            screenPara={screenPara}
            gridApiRef={gridApiRef}
          />
        </>
      )}
      {deletePopup && (
        <RemarksAPIWrapper
          TitleText={t("StockConfirmDeleteTitle", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          onActionNo={() => setDeletePopup(false)}
          onActionYes={(val, rows) => {
            let deleteReqPara = {
              _isNewRow: false,
              _isDeleteRow: true,
              BRANCH_CD: rows.BRANCH_CD,
              TRAN_CD: rows.TRAN_CD,
              ACCT_TYPE: rows.ACCT_TYPE,
              ACCT_CD: rows.ACCT_CD,
              TRAN_DT: rows.TRAN_DT,
              ENTERED_DATE: rows.ENTERED_DATE,
              CONFIRMED: rows.CONFIRMED,
              USER_DEF_REMARKS:
                val ||
                t("WrongStockCnf", {
                  docCD,
                  interpolation: { escapeValue: false },
                }),
              ACTIVITY_TYPE: "STOCK CONFIRMATION SCREEN",
              ENTERED_BY: rows.ENTERED_BY,
              STOCK_VALUE: rows?.STOCK_VALUE,
              ASON_DT: rows.ASON_DT,
            };
            stockDataCRUD.mutate(deleteReqPara);
          }}
          isLoading={stockDataCRUD?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={deletePopup}
          rows={rows?.[0]?.data}
          defaultValue={t("WrongStockCnf", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}

      {dialogState.acctDtlViewOpen && (
        <ViewAcctDtl
          open={dialogState.acctDtlViewOpen}
          reqData={
            dialogState.formMode === "new" ? dialogState.reqData : formData
          }
          closeDialog={() =>
            setDialogState((s) => ({ ...s, acctDtlViewOpen: false }))
          }
        />
      )}
    </Dialog>
  );
};

export default AdvanceStockEntryBody;
