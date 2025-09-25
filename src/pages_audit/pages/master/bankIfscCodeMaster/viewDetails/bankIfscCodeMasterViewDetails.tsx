import React, { useContext, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { metaData } from "./metaData";
import { CircularProgress, Dialog } from "@mui/material";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import {
  MetaDataType,
  usePopupContext,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
} from "@acuteinfo/common-base";

const BankIfscCdMasterForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  const [formMode, setFormMode] = useState(defaultView);
  const isErrorFuncRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const mutation = useMutation(
    API.updateBankIfscCodeData,

    {
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
      onSuccess: (data) => {
        enqueueSnackbar(t("RecordInsertedMsg"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        closeDialog();
        CloseMessageBox();
      },
    }
  );

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    let newData = {
      ...data,
    };
    let oldData = {
      ...rows?.[0]?.data,
    };
    let upd = utilFunction.transformDetailsData(newData, oldData);

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        _isNewRow: defaultView === "add",
      },
      displayData,
      endSubmit,
      setFieldError,
    };

    if (isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length === 0) {
      setFormMode("view");
    } else {
      const btnName = await MessageBox({
        message: t("SaveData"),
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (btnName === "Yes") {
        mutation.mutate({
          data: { ...isErrorFuncRef.current?.data },
        });
      }
    }
  };

  return (
    <FormWrapper
      key={"bankifsccodeMasterForm" + formMode}
      metaData={extractMetaData(metaData, formMode) as MetaDataType}
      initialValues={{
        ...(rows?.[0]?.data ?? {}),
      }}
      formState={{
        rows: rows?.[0]?.data,
      }}
      displayMode={formMode}
      onSubmitHandler={onSubmitHandler}
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
                disabled={isSubmitting}
                endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                color={"primary"}
              >
                Save
              </GradientButton>
              <GradientButton
                onClick={() => {
                  setFormMode("view");
                }}
                color={"primary"}
              >
                Cancel
              </GradientButton>
            </>
          ) : formMode === "add" ? (
            <>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={isSubmitting}
                endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                color={"primary"}
              >
                Save
              </GradientButton>
              <GradientButton onClick={closeDialog} color={"primary"}>
                Close
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
                Edit
              </GradientButton>
              <GradientButton onClick={closeDialog} color={"primary"}>
                Close
              </GradientButton>
            </>
          )}
        </>
      )}
    </FormWrapper>
  );
};

export const BankIfscCdMasterFormWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "auto",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
    >
      <BankIfscCdMasterForm
        closeDialog={closeDialog}
        defaultView={defaultView}
        isDataChangedRef={isDataChangedRef}
      />
    </Dialog>
  );
};
