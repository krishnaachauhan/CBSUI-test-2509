import React, { useContext, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ActionTakenMasterFormMetaData } from "./metaData";
import { CircularProgress, Dialog } from "@mui/material";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  LoaderPaperComponent,
  usePopupContext,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
  Alert,
} from "@acuteinfo/common-base";

const ActionTakenMasterForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  gridData,
}) => {
  const [formMode, setFormMode] = useState(defaultView);
  const [disableButton, setDisableButton] = useState(false);
  const isErrorFuncRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();

  const mutation = useMutation(API.actionTakenMasterDML, {
    onError: (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (msg, data) => {
      enqueueSnackbar(
        Boolean(data?._isNewRow)
          ? t("RecordInsertedMsg")
          : t("RecordUpdatedMsg"),
        {
          variant: "success",
        }
      );
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const codeArr = gridData?.map((ele: any) => ele?.ACTION_TAKEN_CD);
  const filterNumbers = codeArr?.filter((ele) => !isNaN(ele));
  const codeIncrement =
    filterNumbers?.length > 0 ? Math.max(...filterNumbers) + 1 : "";
  const codeIncreByOne =
    String(codeIncrement)?.length < 5 ? String(codeIncrement) : "";

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    let newData = {
      ...data,
      LEGAL_PROCESS: Boolean(data?.LEGAL_PROCESS) ? "Y" : "N",
    };
    let oldData = {
      ...rows?.[0]?.data,
      LEGAL_PROCESS: Boolean(rows?.[0]?.data?.LEGAL_PROCESS) ? "Y" : "N",
    };
    let upd = utilFunction.transformDetailsData(newData, oldData);

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
        COMP_CD: authState?.companyID,
        BRANCH_CD:
          defaultView === "new"
            ? authState?.user?.branchCode
            : rows?.[0]?.data?.BRANCH_CD ?? "",
        _isNewRow: defaultView === "new" ? true : false,
      },
      displayData,
      endSubmit,
      setFieldError,
    };

    if (isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length === 0) {
      setFormMode("view");
    } else {
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        mutation.mutate({
          ...isErrorFuncRef.current?.data,
        });
      }
    }
  };

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  return (
    <>
      {mutation.isError && (
        <Alert
          severity="error"
          errorMsg={mutation?.error?.error_msg || t("Somethingwenttowrong")}
          errorDetail={mutation?.error?.error_detail ?? ""}
          color="error"
        />
      )}
      {gridData ? (
        <FormWrapper
          key={"actionTakenMasterForm" + formMode}
          metaData={
            extractMetaData(
              ActionTakenMasterFormMetaData,
              formMode
            ) as MetaDataType
          }
          displayMode={formMode}
          onSubmitHandler={onSubmitHandler}
          initialValues={
            formMode === "new"
              ? {
                  ...rows?.[0]?.data,
                  ACTION_TAKEN_CD: codeIncreByOne,
                }
              : { ...(rows?.[0]?.data as InitialValuesType) }
          }
          formState={{
            gridData: gridData,
            rows: rows?.[0]?.data,
            handleButtonDisable: handleButtonDisable,
          }}
          formStyle={{
            background: "white",
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              {formMode === "edit" ? (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting || disableButton}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormMode("view");
                    }}
                    color={"primary"}
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
                    disabled={isSubmitting || disableButton}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                  <GradientButton onClick={closeDialog} color={"primary"}>
                    {t("Close")}
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton
                    onClick={() => {
                      setFormMode("edit");
                    }}
                    color={"primary"}
                  >
                    {t("Edit")}
                  </GradientButton>
                  <GradientButton onClick={closeDialog} color={"primary"}>
                    {t("Close")}
                  </GradientButton>
                </>
              )}
            </>
          )}
        </FormWrapper>
      ) : (
        <LoaderPaperComponent />
      )}
    </>
  );
};

export const ActionTakenMasterFormWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  gridData,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          closeDialog();
        }
      }}
      className="actionTakenDlg"
    >
      <ActionTakenMasterForm
        closeDialog={closeDialog}
        defaultView={defaultView}
        gridData={gridData}
        isDataChangedRef={isDataChangedRef}
      />
    </Dialog>
  );
};
