import { Dialog } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";
import { Viewformmetadata } from "./metaData";
import * as API from "../api";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";

import {
  usePopupContext,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
export const Prorityform = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  data: reqData,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(defaultView);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const mutation = useMutation(API.updatePriorityMasterMainData, {
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
    onSuccess: () => {
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
    // @ts-ignore
    endSubmit(true);
    let oldData = {
      ...reqData?.[0]?.data,
      ACTIVE_FLAG: Boolean(reqData?.[0]?.data?.ACTIVE_FLAG) ? "Y" : "N",
      ACCT_PRIORITY_CD: reqData?.[0]?.data?.ACCT_PRIORITY_CD,
      HIERACHY_INFO: reqData?.[0]?.data?.HIERACHY_INFO,
    };
    let newData = {
      ...data,
      ACTIVE_FLAG: Boolean(data?.ACTIVE_FLAG) ? "Y" : "N",
      PRIORITY_CD: data?.PRIORITY_CD.trim(),
    };
    let upd: any = utilFunction.transformDetailsData(newData, oldData);
    upd._OLDROWVALUE = { ...oldData };
    if (upd._UPDATEDCOLUMNS.length > 0) {
      isErrorFuncRef.current = {
        data: {
          ...newData,
          ...upd,
          COMP_CD: authState?.companyID,
          BRANCH_CD:
            defaultView === "add"
              ? authState?.user?.branchCode
              : reqData?.[0]?.data?.BRANCH_CD ?? "",
          _isNewRow: defaultView === "add" ? true : false,
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
    } else {
      setFormMode("view");
    }
  };

  return (
    <>
      <FormWrapper
        key={"Prorityform" + formMode}
        metaData={extractMetaData(Viewformmetadata, formMode) as MetaDataType}
        displayMode={formMode}
        formStyle={{
          overflowX: "auto",
        }}
        onSubmitHandler={onSubmitHandler}
        initialValues={reqData?.[0]?.data ?? {}}
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
    </>
  );
};

export const ProrityformWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  const { state: data }: any = useLocation();
  return (
    <Dialog open={true} maxWidth="md">
      <Prorityform
        closeDialog={closeDialog}
        defaultView={defaultView}
        data={data}
        isDataChangedRef={isDataChangedRef}
      />
    </Dialog>
  );
};
