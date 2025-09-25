import { Dialog, AppBar, CircularProgress } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { form15GHEntryMetaData } from "./metaData";
import { cloneDeep } from "lodash";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { LoaderPaperComponent } from "@acuteinfo/common-base";

import {
  usePopupContext,
  Alert,
  PDFViewer,
  utilFunction,
  MasterDetailsMetaData,
  queryClient,
  MasterDetailsForm,
  GradientButton,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

interface Form15GHEntryFormWrapperProps {
  isDataChangedRef: any;
  closeDialog: () => void;
  retrieveData?: object;
  defaultView: string;
  screenFlag?: string;
}
const Form15GHEntry = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  retrieveData = {},
  screenFlag,
}) => {
  const [formMode, setFormMode] = useState(defaultView);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const isErrorFuncRef = useRef<any>(null);
  const tranCDRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { t } = useTranslation();
  const [state, setState] = useState<any>({
    fdGridData: [],
    fdDataOnViewMode: [],
    apiCalledInView: false,
    fetchData: false,
    fileBlob: null,
    openPrint: false,
    fileBlobOfAnnexure: null,
    openAnnexureForm: false,
  });
  const {
    fdGridData,
    fdDataOnViewMode,
    apiCalledInView,
    fetchData,
    fileBlob,
    openPrint,
    fileBlobOfAnnexure,
    openAnnexureForm,
  } = state;

  const [metadata, setMetadata] = useState(
    form15GHEntryMetaData as MasterDetailsMetaData
  );
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const formData =
    rows?.retrieveData && Object.keys(rows?.retrieveData).length > 0
      ? rows?.retrieveData
      : rows?.[0]?.data || {};

  useEffect(() => {
    if (formMode === "edit" || (formMode === "view" && formData)) {
      let label = utilFunction.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        false
      );
      const label2 = `${label ?? ""}\u00A0\u00A0||\u00A0 ${t(
        "ConfirmStatus"
      )}: ${formData?.CONFIRMED_DIS ?? ""}\u00A0\u00A0||\u00A0\u00A0${t(
        "Uploaded"
      )}: ${formData?.UPLOAD_DIS ?? ""}\u00A0\u00A0`;
      setMetadata((prevMetadata) => {
        const newMetadata = cloneDeep(prevMetadata);
        newMetadata.masterForm.form.label = label2;
        return newMetadata;
      });
    }
  }, []);

  const { data, isLoading, isError, error, isFetching } = useQuery(
    ["getRetrieveFDData", authState?.user?.branchCode],
    () =>
      API.getRetrieveFDData({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        TRAN_CD: formData?.TRAN_CD,
      }),
    {
      enabled: fetchData,
      onSuccess: (data) => {
        const updatedData = data.map((item) => ({
          ...item,
          INT_AMOUNT: Number(item?.INT_AMOUNT ?? 0).toFixed(2),
        }));
        setState((old) => ({
          ...old,
          fdDataOnViewMode: updatedData,
        }));
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getRetrieveFDData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  useEffect(() => {
    if (formMode === "view" && !apiCalledInView) {
      setState((old) => ({
        ...old,
        fetchData: true,
        apiCalledInView: true,
      }));
    } else if (formMode === "edit") {
      setState((old) => ({
        ...old,
        apiCalledInView: false,
      }));
    }
  }, [formMode, apiCalledInView]);

  const mutation = useMutation(API.form15GHEntryDML, {
    onError: (error: any) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      enqueueSnackbar(t("RecordInsertedMsg"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      if (isErrorFuncRef?.current?.data?.ALLOW_PRINT === "Y") {
        const confirmation = await MessageBox({
          messageTitle: "Confirmation",
          message: isErrorFuncRef?.current?.data?.PRINT_MSG,
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (confirmation === "Yes") {
          let newTranCD = data?.[0]?.TRAN_CD.endsWith(".00")
            ? parseInt(data?.[0]?.TRAN_CD).toString()
            : data?.[0]?.TRAN_CD.toString();
          tranCDRef.current = { newTranCD };
          handlePrintMutation();
        } else {
          closeDialog();
        }
      } else {
        closeDialog();
      }
    },
  });

  const deleteMutation = useMutation(API.form15GHEntryDML, {
    onError: (error: any, req) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const updateMutation = useMutation(API.form15GHEntryDML, {
    onError: (error: any) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("RecordUpdatedMsg"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const printForm15GMutation = useMutation(API.printForm15G, {
    onError: (error: any) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      let blobData = utilFunction.blobToFile(data, "");
      if (blobData) {
        setState((old) => ({
          ...old,
          fileBlob: blobData,
          openPrint: true,
          openAnnexureForm: false,
        }));
      }
      CloseMessageBox();
    },
  });

  const printForm15HMutation = useMutation(API.printForm15H, {
    onError: (error: any) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      let blobData = utilFunction.blobToFile(data, "");
      if (blobData) {
        setState((old) => ({
          ...old,
          fileBlob: blobData,
          openPrint: true,
          openAnnexureForm: false,
        }));
      }
      CloseMessageBox();
    },
  });

  const printAnnexureMutation = useMutation(API.printAnnexureForm, {
    onError: (error) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      setState((old) => ({
        ...old,
        openPrint: false,
      }));
      let blobData = utilFunction.blobToFile(data, "");
      if (blobData) {
        setState((old) => ({
          ...old,
          fileBlobOfAnnexure: blobData,
          openAnnexureForm: true,
          openPrint: false,
        }));
      }
      CloseMessageBox();
    },
  });

  const confirmRejectMutation = useMutation(API.form15GHConfirmationDML, {
    onError: (error: any) => {
      handleMutationError(error);
      CloseMessageBox();
    },
    onSuccess: (data, variables) => {
      if (variables?._isDeleteRow === false) {
        enqueueSnackbar(t("FormConfirmationMsg"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        CloseMessageBox();
        closeDialog();
      } else if (variables?._isDeleteRow === true) {
        enqueueSnackbar(t("RecordsDeletedMsg"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        CloseMessageBox();
        closeDialog();
      }
    },
  });

  const handleMutationError = (error) => {
    let errorMsg = t("Unknownerroroccured");
    if (typeof error === "object") {
      //@ts-ignore
      errorMsg = error?.error_msg ?? errorMsg;
    }
    enqueueSnackbar(errorMsg, {
      variant: "error",
    });
  };

  const totalPaidCnt: any = Array.isArray(fdDataOnViewMode)
    ? fdDataOnViewMode.reduce(
        (acc: number, obj: any) => acc + parseInt(obj.PAID_CNT ?? "0"),
        0
      )
    : 0;

  const fdGridDatawithNewRow = fdGridData.map((item: any) => {
    return {
      ...item,
      INT_AMOUNT: item?.FIN_INT_AMT,
    };
  });

  const onSubmitHandler = async ({
    data,
    displayData,
    resultValueObj,
    resultDisplayValueObj,
    endSubmit,
    setFieldError,
    actionFlag,
  }) => {
    //@ts-ignore
    endSubmit(true);
    if (actionFlag === "Save") {
      if (data._UPDATEDCOLUMNS.length > 0) {
        data._UPDATEDCOLUMNS = data._UPDATEDCOLUMNS.filter(
          (field) =>
            field !== "VALID_AMT" &&
            field !== "INT_AMT_LIMIT" &&
            field !== "FLAG" &&
            field !== "PRINT" &&
            field !== "FIN_INT_AMT" &&
            field !== "PRINT_MSG" &&
            field !== "ANNEXURE"
        );
      }

      if (Boolean(data["BIRTH_DT"])) {
        data["BIRTH_DT"] = format(new Date(data["BIRTH_DT"]), "dd/MMM/yyyy");
      }
      if (Boolean(data["LAST_ASS_YEAR"])) {
        data["LAST_ASS_YEAR"] = format(
          new Date(data["LAST_ASS_YEAR"]),
          "dd/MMM/yyyy"
        );
      }
      if (Boolean(data["INACTIVE_DT"])) {
        data["INACTIVE_DT"] = format(
          new Date(data["INACTIVE_DT"]),
          "dd/MMM/yyyy"
        );
      }
      if (Boolean(data["ACTIVE"] === true)) {
        data["ACTIVE"] = "Y";
      } else if (Boolean(data["ACTIVE"] === false)) {
        data["ACTIVE"] = "N";
      } else {
        data["ACTIVE"] = "";
      }

      if (Boolean(data["TOT_INCOME"] === "")) {
        data["TOT_INCOME"] = "0";
      } else {
        data["TOT_INCOME"] = data["TOT_INCOME"];
      }
      if (Boolean(data["FIN_INT_AMT"] === "")) {
        data["FIN_INT_AMT"] = "0";
      } else {
        data["FIN_INT_AMT"] = data["FIN_INT_AMT"];
      }

      if (formMode === "new") {
        let newData = fdGridDatawithNewRow.map((item: any) => {
          const { SR_CD, FIN_INT_AMT, ...rest } = item;
          const newItem = {
            ...rest,
            _isNewRow: true,
          };
          if (newItem.INT_AMOUNT) {
            newItem.INT_AMOUNT = newItem.INT_AMOUNT.endsWith(".00")
              ? parseInt(newItem.INT_AMOUNT).toString()
              : newItem.INT_AMOUNT.toString();
          }
          return newItem;
        });
        isErrorFuncRef.current = {
          data: {
            ...data,
            COMP_CD: authState?.companyID ?? "",
            ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
            ENT_COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            ENTERED_FROM: data?.ENTERED_FROM ?? "",
            _isNewRow: true,
            DETAILS_DATA: {
              ...data.DETAILS_DATA,
              isNewRow: newData,
            },
          },
          displayData,
          endSubmit,
          setFieldError,
        };
        mutation.mutate({
          ...isErrorFuncRef.current?.data,
        });
      }

      if (formMode === "edit") {
        if (
          data._UPDATEDCOLUMNS.length > 0 ||
          Object.keys(data._OLDROWVALUE).length > 0
        ) {
          data._UPDATEDCOLUMNS = data._UPDATEDCOLUMNS.filter(
            (field) =>
              field !== "OTH_BANK_AMT" &&
              field !== "TOT_INCOME" &&
              field !== "FIN_INT_AMT"
          );
          const filteredOldRowValue = Object.fromEntries(
            Object.entries(data._OLDROWVALUE).filter(
              ([key, value]) =>
                key !== "OTH_BANK_AMT" &&
                key !== "TOT_INCOME" &&
                key !== "FIN_INT_AMT" &&
                key !== "PRINT_MSG"
            )
          );
          data._OLDROWVALUE = filteredOldRowValue;
        }
        if (data._OLDROWVALUE && Boolean(data._OLDROWVALUE["ACTIVE"])) {
          if (data._OLDROWVALUE["ACTIVE"] === true) {
            data._OLDROWVALUE["ACTIVE"] = "Y";
          } else if (data._OLDROWVALUE["ACTIVE"] === false) {
            data._OLDROWVALUE["ACTIVE"] = "N";
          } else {
            data._OLDROWVALUE["ACTIVE"] = "";
          }
        }
        isErrorFuncRef.current = {
          data: {
            ACTIVE: data?.ACTIVE ?? "",
            INACTIVE_DT: data?.INACTIVE_DT ?? "",
            ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
            ENTERED_COMP_CD: authState?.companyID ?? "",
            TRAN_CD: formData?.TRAN_CD ?? "",
            _isNewRow: false,
            _OLDROWVALUE: data?._OLDROWVALUE,
            _UPDATEDCOLUMNS: data?._UPDATEDCOLUMNS,
            DETAILS_DATA: data?.DETAILS_DATA,
          },
          displayData,
          endSubmit,
          setFieldError,
        };
        if (isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length === 0) {
          setFormMode("view");
        } else {
          updateMutation.mutate({
            ...isErrorFuncRef.current?.data,
          });
        }
      }
    } else if (actionFlag === "Reject") {
      const rejectData = {
        _isDeleteRow: true,
        TRAN_CD: formData?.TRAN_CD,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        ENTERED_COMP_CD: authState?.companyID,
        DETAILS_DATA: {
          isNewRow: [],
          isDeleteRow: [...fdDataOnViewMode],
          isUpdatedRow: [],
        },
      };
      confirmRejectMutation.mutate(rejectData);
    } else if (actionFlag === "Confirm") {
      const confirmData = {
        _isDeleteRow: false,
        TRAN_CD: formData?.TRAN_CD,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        ENTERED_COMP_CD: authState?.companyID,
      };
      confirmRejectMutation.mutate(confirmData);
    }
  };

  const handleRemove = async (event) => {
    if (
      (formMode === "edit" || formMode === "view") &&
      formData?.CONFIRMED === "Y"
    ) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "CannotDeleteConfirmedForm",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
    } else {
      const confirmation = await MessageBox({
        message: "RejectFormMessage",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (confirmation === "Yes") {
        const deleteData = {
          _isDeleteRow: true,
          TRAN_CD: formData?.TRAN_CD,
          ENTERED_BRANCH_CD: authState?.user?.branchCode,
          ENTERED_COMP_CD: authState?.companyID,
          DETAILS_DATA: {
            isNewRow: [],
            isDeleteRow: [...fdDataOnViewMode],
            isUpdatedRow: [],
          },
        };
        deleteMutation.mutate(deleteData);
      }
    }
  };

  const handlePrintMutation = () => {
    if (
      formData?.FORM_NM ||
      isErrorFuncRef?.current?.data?.FORM_NM === "FORM 15G"
    ) {
      printForm15GMutation.mutate({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        TRAN_CD: formData?.TRAN_CD || tranCDRef?.current?.newTranCD,
      });
    } else if (
      formData?.FORM_NM === "FORM 15H" ||
      isErrorFuncRef?.current?.data?.FORM_NM
    ) {
      printForm15HMutation.mutate({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        TRAN_CD: formData?.TRAN_CD || tranCDRef?.current?.newTranCD,
      });
    }
  };

  const handleAnnexureFormData = () => {
    printAnnexureMutation.mutate({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
      TRAN_CD: formData?.TRAN_CD || tranCDRef?.current?.newTranCD,
    });
  };

  const printFormFileName = isErrorFuncRef?.current?.data
    ? (isErrorFuncRef?.current?.data?.FORM_NM ?? "") +
      " " +
      (isErrorFuncRef?.current?.data?.CUSTOMER_ID ?? "")
    : (formData?.FORM_NM ?? "") + " " + (formData?.CUSTOMER_ID ?? "");

  return (
    <>
      {isError && (
        <>
          <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                //@ts-ignore
                errorMsg={error?.error_msg ?? "Something went to wrong.."}
                //@ts-ignore
                errorDetail={error?.error_detail}
                color="error"
              />
            </AppBar>
          </div>
        </>
      )}
      <MasterDetailsForm
        key={"form15GHEntryForm" + formMode + fdGridData + fdDataOnViewMode}
        metaData={metadata}
        initialData={{
          ...formData,
          VALID_AMT: "",
          FLAG: "",
          TRAN_CD: "",
          INT_AMT_LIMIT: "",
          UPLOAD: "",
          CONFIRMED: "",
          PRINT: "",
          DETAILS_DATA:
            formMode === "new" ? fdGridDatawithNewRow : fdDataOnViewMode,
        }}
        displayMode={formMode}
        isLoading={isLoading || isFetching}
        onSubmitData={onSubmitHandler}
        formStyle={{
          background: "white",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        containerstyle={{ padding: "10px" }}
        formState={{
          MessageBox: MessageBox,
          totalPaidCnt: totalPaidCnt,
          formData: formData,
          screenFlag: screenFlag,
          formMode: formMode,
          docCD: docCD,
        }}
        setDataOnFieldChange={(action, payload) => {
          const statusCheck = payload.every(
            (item) =>
              item?.O_STATUS !== "9" &&
              item?.O_STATUS !== "99" &&
              item?.O_STATUS !== "999"
          );
          if (action === "GRID_DATA" && statusCheck) {
            const updatedData = payload.map((item) => ({
              ...item,
              FIN_INT_AMT: Number(item?.FIN_INT_AMT ?? 0).toFixed(2),
            }));
            setState((old) => ({
              ...old,
              fdGridData: updatedData,
            }));
          } else if (statusCheck === false) {
            setState((old) => ({
              ...old,
              fdGridData: [],
            }));
          }
        }}
        onFormButtonClickHandel={async (id) => {
          if (id === "PRINT") {
            handlePrintMutation();
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => {
          return (
            <>
              {formMode === "edit" ? (
                <>
                  <GradientButton
                    color={"primary"}
                    disabled={updateMutation?.isLoading}
                    onClick={handleRemove}
                  >
                    {t("Delete")}
                  </GradientButton>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    color={"primary"}
                    endIcon={
                      updateMutation?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    disabled={updateMutation?.isLoading}
                  >
                    {t("Save")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormMode("view");
                    }}
                    color={"primary"}
                    disabled={updateMutation?.isLoading}
                  >
                    {t("Cancel")}
                  </GradientButton>
                </>
              ) : formMode === "new" ? (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    color={"primary"}
                    endIcon={
                      mutation?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    disabled={mutation?.isLoading}
                  >
                    {t("Save")}
                  </GradientButton>
                  <GradientButton
                    onClick={closeDialog}
                    disabled={mutation?.isLoading}
                    color={"primary"}
                  >
                    {t("Close")}
                  </GradientButton>
                </>
              ) : screenFlag === "C" && formMode === "view" ? (
                <>
                  <GradientButton
                    disabled={isLoading || isFetching}
                    color={"primary"}
                    onClick={async (event) => {
                      if (formData?.LAST_ENTERED_BY === authState?.user?.id) {
                        await MessageBox({
                          messageTitle: "InvalidConfirmation",
                          message: "ConfirmRestrictionMessage",
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else {
                        const confirmation = await MessageBox({
                          message: "ConfirmFormData",
                          messageTitle: "Confirmation",
                          buttonNames: ["Yes", "No"],
                          loadingBtnName: ["Yes"],
                          icon: "CONFIRM",
                        });
                        if (confirmation === "Yes") {
                          handleSubmit(event, "Confirm");
                        }
                      }
                    }}
                  >
                    {t("Confirm")}
                  </GradientButton>
                  <GradientButton
                    disabled={isLoading || isFetching}
                    color={"primary"}
                    onClick={async (event) => {
                      const confirmation = await MessageBox({
                        messageTitle: "DeleteWarning",
                        message: "RejectFormMessage",
                        buttonNames: ["Yes", "No"],
                        loadingBtnName: ["Yes"],
                        icon: "CONFIRM",
                      });
                      if (confirmation === "Yes") {
                        handleSubmit(event, "Reject");
                      }
                    }}
                  >
                    {t("Reject")}
                  </GradientButton>
                  <GradientButton onClick={closeDialog} color={"primary"}>
                    {t("Close")}
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton
                    color={"primary"}
                    onClick={handleRemove}
                    disabled={isLoading || isFetching}
                  >
                    {t("Delete")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormMode("edit");
                    }}
                    color={"primary"}
                    disabled={isLoading || isFetching}
                  >
                    {t("Edit")}
                  </GradientButton>
                  <GradientButton onClick={closeDialog} color={"primary"}>
                    {t("Close")}
                  </GradientButton>
                </>
              )}
            </>
          );
        }}
      </MasterDetailsForm>
      {printForm15GMutation?.isLoading || printForm15HMutation?.isLoading ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              overflow: "auto",
              padding: "10px",
              width: "600px",
              height: "100px",
            },
          }}
          maxWidth="md"
        >
          <LoaderPaperComponent />
        </Dialog>
      ) : (
        Boolean(fileBlob && fileBlob?.type?.includes("pdf")) &&
        Boolean(openPrint) && (
          <Dialog
            open={true}
            PaperProps={{
              style: {
                width: "100%",
                overflow: "auto",
                padding: "10px",
                height: "100%",
              },
            }}
            maxWidth="xl"
          >
            <PDFViewer
              blob={fileBlob}
              fileName={`${printFormFileName}`}
              onClose={() =>
                formMode === "edit" && "view"
                  ? setState((old) => ({
                      ...old,
                      openPrint: false,
                    }))
                  : closeDialog()
              }
              optionalActionButton={{
                callback: handleAnnexureFormData,
                label: "Annexure",
              }}
            />
          </Dialog>
        )
      )}

      {printAnnexureMutation?.isLoading ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              overflow: "auto",
              padding: "10px",
              width: "600px",
              height: "100px",
            },
          }}
          maxWidth="md"
        >
          <LoaderPaperComponent />
        </Dialog>
      ) : (
        openAnnexureForm && (
          <Dialog
            open={openAnnexureForm}
            PaperProps={{
              style: {
                width: "100%",
                overflow: "auto",
                padding: "10px",
                height: "100%",
              },
            }}
            maxWidth="xl"
          >
            <PDFViewer
              blob={fileBlobOfAnnexure}
              fileName={`${printFormFileName} Annexure`}
              onClose={() =>
                formMode === "edit" && "view"
                  ? setState((old) => ({
                      ...old,
                      openAnnexureForm: false,
                    }))
                  : closeDialog()
              }
              optionalActionButton={{
                callback: () => {
                  setState((old) => ({
                    ...old,
                    openPrint: true,
                    openAnnexureForm: false,
                  }));
                  handlePrintMutation();
                },
                label: "Form",
              }}
            />
          </Dialog>
        )
      )}
    </>
  );
};

export const Form15GHEntryWrapper: React.FC<Form15GHEntryFormWrapperProps> = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  retrieveData = {},
  screenFlag,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "auto",
          overflow: "auto",
          padding: "5px",
        },
      }}
      maxWidth="xl"
      className="formDlg"
    >
      <Form15GHEntry
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        retrieveData={retrieveData}
        screenFlag={screenFlag}
      />
    </Dialog>
  );
};
