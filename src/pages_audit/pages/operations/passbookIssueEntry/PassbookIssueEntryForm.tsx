import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  GradientButton,
  LoaderPaperComponent,
  MasterDetailsForm,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog, Grid, Paper } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { masterDtlFormMetadata } from "./masterDtlFormMetadata";
import { t } from "i18next";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { enqueueSnackbar } from "notistack";
import { removeKeysFromUpdateRows } from "pages_audit/pages/master/equitableMortgageMain/api";
const actions: ActionTypes[] = [
  {
    actionName: "addNewRow",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
  },
];
const PassbookIssueEntry = ({ isDataChangedRef, closeDialog, defaultView }) => {
  const [formMode, setFormMode] = useState(defaultView);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const gridRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const hasRunRef = useRef(false);

  const AddNewRow = async () => {
    gridRef.current?.addNewRow(true);
  };

  const formData =
    rows?.retrieveData && Object.keys(rows?.retrieveData).length > 0
      ? rows?.retrieveData
      : rows?.[0]?.data || { COMP_CD: authState?.companyID };

  const {
    data: detailData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getPassbookDtlData", formData?.TRAN_CD],
    () =>
      API.getPassbookEntryDtl({
        BRANCH_CD: formData?.BRANCH_CD ?? "",
        COMP_CD: formData?.COMP_CD ?? "",
        TRAN_CD: formData?.TRAN_CD ?? "",
      }),
    {
      enabled: false,
    }
  );
  const mutation = useMutation(API.savePassbookIssueDtl, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data, variables) => {
      if (variables._isDeleteRow === true) {
        enqueueSnackbar(t("deleteSuccessfully"), {
          variant: "success",
        });
        closeDialog();
      } else {
        const message =
          defaultView === "new"
            ? t("RecordInsertedMsg")
            : t("RecordUpdatedMsg");
        enqueueSnackbar(message, {
          variant: "success",
        });
      }
      isDataChangedRef.current = true;
      isErrorFuncRef.current.endSubmit(true);
      CloseMessageBox();
      closeDialog();
    },
  });

  useEffect(() => {
    if (formData?.TRAN_CD && formMode !== "new") {
      refetch();
    }
  }, [formData?.TRAN_CD, formMode]);

  useEffect(() => {
    if (defaultView === "new" && !hasRunRef.current) {
      hasRunRef.current = true;
      setTimeout(() => {
        AddNewRow();
      }, 50);
    }
  }, [defaultView]);

  const onSubmitHandler = async ({
    data,
    resultValueObj,
    resultDisplayValueObj,
    endSubmit,
    setFieldErrors,
    actionFlag,
  }) => {
    if (
      formMode !== "new" &&
      data?._UPDATEDCOLUMNS?.length === 0 &&
      data?.DETAILS_DATA?.isDeleteRow?.length === 0 &&
      data?.DETAILS_DATA?.isNewRow?.length === 0 &&
      data?.DETAILS_DATA?.isUpdatedRow?.length === 0
    ) {
      setFormMode("view");
    } else {
      const filteredData = removeKeysFromUpdateRows(
        data?.DETAILS_DATA,
        ["_displaySequence", "NEW_SR_CD"],
        {}
      );
      const { DETAILS_DATA, ...rest } = data;
      const requestData = {
        ...rest,
        DETAILS_DATA: filteredData,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      };

      isErrorFuncRef.current = {
        data: requestData,
        endSubmit,
      };
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
        loadingBtnName: ["Yes"],
      });

      if (btnName === "Yes") {
        mutation.mutate({
          ...requestData,
        });
      }
    }
    endSubmit(true);
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getPassbookDtlData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          overflow: "auto",
          width: "100%",
          height: "auto",
        },
      }}
      maxWidth="lg"
    >
      <Grid item xs={8} sm={6} md={8}>
        {(isError || mutation?.isError) && (
          <Alert
            severity="error"
            errorMsg={mutation?.error?.error_msg ?? error?.error_msg}
            errorDetail={mutation?.error?.error_detail ?? error?.error_detail}
            color="error"
          />
        )}
        {!isLoading ? (
          <MasterDetailsForm
            key={"dynReportConfig" + formMode + detailData}
            formNameMaster={"masterDtlFormMetadata" + formMode}
            formName={formMode}
            metaData={masterDtlFormMetadata}
            ref={gridRef}
            initialData={{
              _isNewRow: formMode === "new",
              ...formData,
              DETAILS_DATA: detailData ?? [],
            }}
            displayMode={formMode}
            isLoading={isLoading || isFetching}
            onSubmitData={onSubmitHandler}
            actions={formMode === "view" ? [] : actions}
            isNewRow={formMode === "new"}
            containerstyle={{
              paddingRight: "10px",
              paddingLeft: "10px",
              paddingTop: "5px",
            }}
            formState={{
              docCD: docCD,
              MessageBox,
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
              padding: "10px",
            }}
            isDetailRowRequire={true}
            handelActionEvent={(data) => {
              if (data?.name === "addNewRow") {
                AddNewRow();
              }
            }}
            hideHeader={false}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {formMode === "new" && (
                  <>
                    <GradientButton
                      onClick={(event) => handleSubmit(event, "Save")}
                      color="primary"
                    >
                      {t("Save")}
                    </GradientButton>

                    <GradientButton onClick={closeDialog} color="primary">
                      {t("Close")}
                    </GradientButton>
                  </>
                )}

                {formMode === "edit" && (
                  <>
                    <GradientButton
                      onClick={async () => {
                        const btnName = await MessageBox({
                          message: "DoYouWantDeleteRow",
                          messageTitle: "Confirmation",
                          buttonNames: ["Yes", "No"],
                          icon: "CONFIRM",
                          loadingBtnName: ["Yes"],
                        });

                        if (btnName === "Yes") {
                          mutation?.mutate({
                            ...formData,
                            _isDeleteRow: true,
                          });
                        }
                      }}
                      color="primary"
                    >
                      {t("Delete")}
                    </GradientButton>
                    <GradientButton
                      onClick={(event) => handleSubmit(event, "Save")}
                      endIcon={
                        isSubmitting ? <CircularProgress size={20} /> : null
                      }
                      color="primary"
                    >
                      {t("Save")}
                    </GradientButton>

                    <GradientButton
                      onClick={() => setFormMode("view")}
                      color="primary"
                    >
                      {t("Cancel")}
                    </GradientButton>
                  </>
                )}

                {formMode === "view" && (
                  <>
                    <GradientButton
                      onClick={async () => {
                        const btnName = await MessageBox({
                          message: "DoYouWantDeleteRow",
                          messageTitle: "Confirmation",
                          buttonNames: ["Yes", "No"],
                          icon: "CONFIRM",
                          loadingBtnName: ["Yes"],
                        });

                        if (btnName === "Yes") {
                          mutation?.mutate({
                            ...formData,
                            _isDeleteRow: true,
                          });
                        }
                      }}
                      color="primary"
                    >
                      {t("Delete")}
                    </GradientButton>

                    <GradientButton
                      onClick={() => setFormMode("edit")}
                      color="primary"
                    >
                      {t("Edit")}
                    </GradientButton>

                    <GradientButton onClick={closeDialog} color="primary">
                      {t("Close")}
                    </GradientButton>
                  </>
                )}
              </>
            )}
          </MasterDetailsForm>
        ) : (
          <Paper sx={{ display: "flex", justifyContent: "center" }}>
            <LoaderPaperComponent />
          </Paper>
        )}
      </Grid>
    </Dialog>
  );
};

export const PassbookIssueEntryForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  return (
    <ClearCacheProvider>
      <PassbookIssueEntry
        defaultView={defaultView}
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
      />
    </ClearCacheProvider>
  );
};
