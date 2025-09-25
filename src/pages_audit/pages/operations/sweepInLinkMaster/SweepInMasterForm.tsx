import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DialogProvider } from "../payslip-issue-entry/DialogContext";
import { useLocation } from "react-router-dom";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import {
  SweepInAgGridMetadata,
  SweepInMasterFormMetaData,
} from "./SweepInMasterFormMetaData";
import { t } from "i18next";
import * as API from "./api";
import { Dialog, Paper } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import {
  getGridRowData,
  validateGridAndGetData,
} from "components/agGridTable/utils/helper";
import { enqueueSnackbar } from "notistack";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const SweepInLinkMasterForm = ({
  closeDialog,
  defaultView,
  loading,
  isDataChangedRef,
  refresh,
}) => {
  const [formMode, setFormMode] = useState(defaultView);
  const [gridData, setGridData] = useState([]);
  const [gridLoading, setGridLoading] = useState(false);
  const gridApiRef = useRef<any>();
  const formRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  let currentPath = useLocation().pathname;
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { state: rows }: any = useLocation();
  const formData =
    rows?.retrieveData && Object.keys(rows?.retrieveData).length > 0
      ? rows?.retrieveData
      : rows?.[0]?.data || {};
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const savemutation = useMutation(API.submitdata, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data, variables) => {
      if (variables._isDeleteRow === true) {
        enqueueSnackbar(t("deleteSuccessfully"), {
          variant: "success",
        });
      } else {
        const message =
          defaultView === "new"
            ? t("RecordInsertedMsg")
            : t("RecordUpdatedMsg");
        enqueueSnackbar(message, {
          variant: "success",
        });
        closeDialog();
      }
      refresh?.();
      isErrorFuncRef.current?.endSubmit(true);
      isDataChangedRef.current = true;
      CloseMessageBox();
    },
  });

  const validationcheck = useMutation(API.savevalidation, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      handleDisplayMessages(data, MessageBox);
    },
  });

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getGriddata", authState?.user?.branchCode],
    async () =>
      await API.getGriddata({
        P_BRANCH_CD: authState?.user?.branchCode ?? "",
        P_COMP_CD: authState?.companyID ?? "",
        P_ACCT_TYPE: formData?.ACCT_TYPE ?? "",
        P_ACCT_CD: formData?.ACCT_CD ?? "",
      }),
    {
      enabled: false,
    }
  );

  // Row Delete
  const deleteRow = async ({ TRAN_CD }) => {
    setGridLoading(true); // START LOADING
    const data = await savemutation.mutate({
      _isNewRow: formMode === "new" ? true : false,
      _isDeleteRow: true,
      DETAILS_DATA: {
        isNewRow: [],
        isUpdatedRow: [],
        isDeleteRow: [
          {
            ENTERED_COMP_CD: authState?.companyID ?? "",
            ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
            TRAN_CD: TRAN_CD ?? "",
          },
        ],
      },
    });

    // Optional: Close dialog only if all rows deleted
    const remainingRows = getGridRowData(gridApiRef)?.filter(
      (row) => row?.TRAN_CD !== TRAN_CD
    );
    if (remainingRows?.length === 0) {
      closeDialog();
    }

    // REFETCH and STOP LOADING
    refetch?.().finally(() => {
      setGridLoading(false);
    });

    return data;
  };

  // New or Update
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);
    // AgGrid data is mandatory
    const AgGridData = getGridRowData(gridApiRef);
    const result = validateGridAndGetData(gridApiRef);
    const isError = result?.isError ?? false;
    if (!result?.rowData || result?.rowData?.length === 0) {
      return;
    }

    if (isError) {
      return;
    }

    const newFormData = { ...data };
    const oldFormData = { ...formData };

    const upd = utilFunction.transformDetailsData(
      newFormData,
      defaultView === "new" ? {} : oldFormData
    );

    const GridData = AgGridData.map(
      ({
        errors,
        loader,
        ACCT_FLAG_OPT,
        FD_SWEEP_IN_DEF_TRAN_CD_OPT,
        C_BRANCH_CD_ID,
        C_ACCT_TYPE_ID,
        DISPLAY_ACCT_FLAG,
        DISPLAY_FD_SWEEP_IN_DEF_TRAN_CD,
        ...rest
      }) => {
        return {
          ...rest,
          C_COMP_CD: authState?.companyID,
          P_COMP_CD: authState?.companyID,
          P_ACCT_CD: data?.ACCT_CD ?? "",
          P_ACCT_TYPE: data?.ACCT_TYPE ?? "",
          P_BRANCH_CD: data?.BRANCH_CD ?? "",
          ACTIVE_STATUS:
            rest.ACTIVE_STATUS === true
              ? "Y"
              : rest.ACTIVE_STATUS === false
              ? "N"
              : rest.ACTIVE_STATUS,
        };
      }
    );

    const ValidData = AgGridData.map(
      ({
        errors,
        loader,
        ACCT_FLAG_OPT,
        FD_SWEEP_IN_DEF_TRAN_CD_OPT,
        C_BRANCH_CD_ID,
        C_ACCT_TYPE_ID,
        DISPLAY_ACCT_FLAG,
        DISPLAY_FD_SWEEP_IN_DEF_TRAN_CD,
        C_ACCT_CD,
        ...rest
      }) => {
        return {
          ...rest,
          C_ACCT_CD: C_ACCT_CD ?? "",
          C_COMP_CD: authState?.companyID ?? "",
          SWEEP_TYPE: FD_SWEEP_IN_DEF_TRAN_CD_OPT?.FLAG ?? "",
          ACTIVE_STATUS:
            rest.ACTIVE_STATUS === true
              ? "Y"
              : rest.ACTIVE_STATUS === false
              ? "N"
              : rest.ACTIVE_STATUS,
        };
      }
    );

    const newData = [...GridData];
    let maxSRCD =
      initialData?.reduce((max, item) => {
        const srCdNum = parseInt(item.SR_CD, 10);
        return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
      }, 0) ?? 0;

    newData?.forEach((item) => {
      if (!item.SR_CD || item.SR_CD === "") {
        maxSRCD += 1;
        item.SR_CD = String(maxSRCD);
      }
    });
    const keyRowData = formMode === "new" ? "SR_CD" : "TRAN_CD";

    const updPara2 = utilFunction.transformDetailDataForDML(
      initialData ?? [],
      newData ?? [],
      [keyRowData]
    );

    const requestData = {
      _isNewRow: (updPara2?.isNewRow?.length ?? 0) > 0,
      ...upd,
      _isDeleteRow: false,
      DETAILS_DATA: {
        ...updPara2,
      },
    };

    isErrorFuncRef.current = {
      data: requestData,
      displayData,
      endSubmit,
      setFieldError,
    };

    if (AgGridData && AgGridData.length > 0) {
      const result = await validationcheck.mutateAsync({
        COMP_CD: authState?.companyID ?? "",
        SWEEP_DTL: ValidData,
        SCREEN_REF: docCD ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      });
      if (result?.[0].O_STATUS === "0") {
        const btnName = await MessageBox({
          message: "SaveData",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
          loadingBtnName: ["Yes"],
        });

        if (btnName === "Yes") {
          await savemutation.mutate({
            ...requestData,
          });
        }
      }
    }
  };

  const updatedData = useMemo(() => {
    const source: any = initialData ?? [];

    return source.map((item) => {
      let activeValue = false;

      if (item?.ACTIVE_STATUS === "Y") {
        activeValue = true;
      } else if (item?.ACTIVE_STATUS === "N") {
        activeValue = false;
      } else {
        activeValue = item.ACTIVE_STATUS;
      }

      return {
        ...item,
        ACTIVE_STATUS: activeValue,
      };
    });
  }, [initialData]);

  const agGridProps = {
    id: `SweepInGrid` + gridData,
    columnDefs:
      SweepInAgGridMetadata.columns?.({
        authState,
        formState: {
          workingDate: authState?.workingDate ?? "",
        },
        deleteRow,
        CloseMessageBox,
      }) ?? [],
    rowData: updatedData,
  };

  const handleAddNewRow = () => {
    gridApiRef?.current?.applyTransaction?.({
      add: [
        {
          C_BRANCH_CD: authState?.user?.branchCode ?? "",
          ACTIVE_STATUS: true,
        },
      ],
    });
  };

  SweepInMasterFormMetaData.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );

  useEffect(() => {
    if (initialData && !isLoading && !isFetching) {
      setGridData(initialData);
    }
  }, [initialData, isLoading, isFetching]);

  useEffect(() => {
    if (formData?.ROW_CD && formMode !== "new") {
      refetch();
    }
  }, [formData?.ROW_CD, formMode]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getGriddata", authState?.user?.branchCode]);
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
      maxWidth="xl"
    >
      {!loading ? (
        <>
          <FormWrapper
            key={"sweep-in-master-entry" + formMode}
            metaData={SweepInMasterFormMetaData as MetaDataType}
            initialValues={{
              ...formData,
            }}
            onSubmitHandler={onSubmitHandler}
            displayMode={formMode}
            formStyle={{
              background: "white",
            }}
            ref={formRef}
            formState={{
              MessageBox: MessageBox,
              docCD: docCD,
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "ACCT_TYPE",
                  BRANCH_CD: "BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
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
                      onClick={(event) => handleSubmit(event, "Save")}
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
          </FormWrapper>

          <AgGridTableWrapper
            agGridProps={agGridProps}
            gridConfig={SweepInAgGridMetadata.GridMetaDataType}
            getGridApi={gridApiRef}
            autoSelectFirst={true}
            defaultView={"new"}
            newButtonLabel="Add Row"
            height={"calc(100vh - 75vh)"}
            gridContext={{
              screenRef: docCD,
              mode: formMode,
              authState,
              formRef,
              gridApiRef,
              acctDtlReqPara: {
                C_ACCT_CD: {
                  ACCT_TYPE: "C_ACCT_TYPE",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            loading={gridLoading}
            handleAddNewRow={handleAddNewRow}
            isNewButtonVisible={formMode !== "view"}
            hideHeader={formMode === "view"}
          />
        </>
      ) : (
        <Paper sx={{ display: "flex", justifyContent: "center" }}>
          <LoaderPaperComponent />
        </Paper>
      )}
    </Dialog>
  );
};

export const SweepInMasterForm = ({
  closeDialog,
  defaultView,
  loading,
  isDataChangedRef,
  refresh,
}) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <SweepInLinkMasterForm
            isDataChangedRef={isDataChangedRef}
            defaultView={defaultView}
            closeDialog={closeDialog}
            loading={loading}
            refresh={refresh}
          />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
