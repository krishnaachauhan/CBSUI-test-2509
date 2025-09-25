import { Dialog } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { prioritymastersubformmetadata } from "./metaData";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import * as API from "../api";
import { AuthContext } from "pages_audit/auth";
import { LoadingTextAnimation } from "components/common/loader";
import { t } from "i18next";
import {
  LoaderPaperComponent,
  usePopupContext,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";

export const Proritysubform = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  gridData = [],
}) => {
  const { authState } = useContext(AuthContext);
  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(defaultView);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows } = useLocation();

  const mutation = useMutation(API.updatePriorityMasterSubData, {
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
      enqueueSnackbar(t("insertSuccessfully"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    let oldData = {
      ...rows?.[0]?.data,
    };
    let newData = {
      ...data,
    };
    let updatedValue: any = utilFunction.transformDetailsData(
      newData,
      oldData ?? {}
    );

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...updatedValue,
        COMP_CD: authState.companyID,
        BRANCH_CD:
          defaultView === "add"
            ? authState?.user?.branchCode
            : rows?.[0]?.data?.BRANCH_CD ?? "",
        _isNewRow: formMode === "add" ? true : false,
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
        messageTitle: t("Confirmation"),
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
    <>
      {gridData ? (
        <FormWrapper
          key={"prioritymastersubformmetadata" + formMode}
          metaData={
            extractMetaData(
              prioritymastersubformmetadata,
              formMode
            ) as MetaDataType
          }
          displayMode={formMode}
          onSubmitHandler={onSubmitHandler}
          initialValues={{ ...rows?.[0]?.data }}
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
                    Save
                  </GradientButton>
                  <GradientButton
                    onClick={closeDialog}
                    color={"primary"}
                    disabled={isSubmitting}
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
      ) : (
        <LoaderPaperComponent />
      )}
    </>
  );
};

export const ProritymastersubformWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  gridData = [],
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
      <Proritysubform
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        gridData={gridData}
      />
    </Dialog>
  );
};
