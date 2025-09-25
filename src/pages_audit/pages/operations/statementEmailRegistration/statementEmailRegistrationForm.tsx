import { Dialog } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import * as API from "./api";
import { format } from "date-fns";
import {
  GradientButton,
  usePopupContext,
  utilFunction,
  SubmitFnType,
  MetaDataType,
  FormWrapper,
  Alert,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { formMetadata } from "./formMetaData";

export const StatementEmailRegistrationForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  screenFlag,
}) => {
  const isErrorFuncRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [formMode, setFormMode] = useState(defaultView);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const formData =
    rows?.retrieveData && Object.keys(rows?.retrieveData).length > 0
      ? rows?.retrieveData
      : rows?.[0]?.data || {};

  const mutation = useMutation(API.statementEmailRegDml, {
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
      }
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    data.REQ_DT = data?.REQ_DT
      ? format(new Date(data.REQ_DT), "dd/MMM/yyyy")
      : authState?.workingDate;

    if (typeof data["ZIP"] === "boolean") {
      data["ZIP"] = data["ZIP"] ? "Y" : "N";
    }

    const newData = { ...data };
    const oldData = { ...formData };

    const upd = utilFunction.transformDetailsData(
      newData,
      defaultView === "new" ? {} : oldData
    );

    const requestData = {
      ...newData,
      ...upd,
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      _isNewRow: defaultView === "new",
    };

    isErrorFuncRef.current = {
      data: requestData,
      displayData,
      endSubmit,
      setFieldError,
    };

    if (actionFlag === "Save" && requestData._UPDATEDCOLUMNS?.length === 0) {
      setFormMode("view");
      return;
    }

    const btnName = await MessageBox({
      message: "SaveData",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });

    if (btnName === "Yes") {
      mutation.mutate(requestData);
    }
  };

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
      maxWidth="md"
    >
      {mutation?.error && (
        <Alert
          severity="error"
          errorMsg={mutation?.error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={mutation?.error?.error_detail ?? ""}
          color="error"
        />
      )}
      <FormWrapper
        key={"positivePayEntryForm" + formMode}
        metaData={formMetadata as MetaDataType}
        displayMode={formMode}
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          ...formData,
          ZIP: defaultView === "new" || formData?.ZIP === "Y",
          REQ_DT: authState?.workingDate ?? "",
        }}
        formStyle={{
          background: "white",
          height: "470px",
        }}
        formState={{
          formMode: formMode,
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
                  onClick={(event) => handleSubmit(event, "Remove")}
                  color="primary"
                >
                  {t("Delete")}
                </GradientButton>
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
                  onClick={async () => {
                    const btnName = await MessageBox({
                      message: "deleteCmfmMsg",
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
      </FormWrapper>
    </Dialog>
  );
};
