import { AppBar, Dialog } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LienReasonMstFormMetaData } from "./metaData";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import {
  LoaderPaperComponent,
  usePopupContext,
  GradientButton,
  SubmitFnType,
  InitialValuesType,
  utilFunction,
  FormWrapper,
  MetaDataType,
  Alert,
} from "@acuteinfo/common-base";

export const LienReasonMstForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  gridData,
}) => {
  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(defaultView);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();

  const mutation = useMutation(API.lienReasonMstDataDML, {
    onError: (error: any) => {},
    onSuccess: (data, variables) => {},
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    //@ts-ignore
    // endSubmit(true);
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
        BRANCH_CD:
          defaultView === "new"
            ? authState?.user?.branchCode
            : rows?.[0]?.data?.BRANCH_CD ?? "",
        COMP_CD: authState?.companyID ?? "",
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
        mutation.mutate(
          {
            ...isErrorFuncRef.current?.data,
          },
          {
            onError: (error: any) => {
              CloseMessageBox();
            },
            onSuccess: (data, variables) => {
              enqueueSnackbar(
                Boolean(variables?._isNewRow)
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
          }
        );
      } else if (btnName === "No") {
        endSubmit(false);
      }
    }
  };

  return (
    <>
      {gridData ? (
        <>
          {mutation?.isError && (
            <>
              <AppBar position="relative" color="primary">
                <Alert
                  severity={mutation?.error?.severity ?? "error"}
                  errorMsg={
                    mutation?.error?.error_msg ?? "Something went to wrong.."
                  }
                  errorDetail={mutation?.error?.error_detail}
                  color="error"
                />
              </AppBar>
            </>
          )}
          <FormWrapper
            key={"lienReasonMstForm" + formMode}
            metaData={LienReasonMstFormMetaData as MetaDataType}
            displayMode={formMode}
            onSubmitHandler={onSubmitHandler}
            initialValues={rows?.[0]?.data as InitialValuesType}
            formStyle={{
              background: "white",
            }}
            formState={{
              gridData: gridData,
              rows: rows?.[0]?.data,
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
                      disabled={isSubmitting}
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
        </>
      ) : (
        <LoaderPaperComponent />
      )}
    </>
  );
};

export const LienReasonMstFormWrapper = ({
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
          width: "70%",
          overflow: "auto",
        },
      }}
      maxWidth="md"
      className="lienReasonMstDlg"
    >
      <LienReasonMstForm
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        gridData={gridData}
      />
    </Dialog>
  );
};
