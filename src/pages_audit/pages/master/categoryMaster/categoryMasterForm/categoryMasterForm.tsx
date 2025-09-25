import { CircularProgress, Dialog } from "@mui/material";
import { useContext, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CategoryMasterFormMetaData } from "./metaData";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "react-query";
import * as API from "../api";
import { useTranslation } from "react-i18next";
import {
  LoaderPaperComponent,
  usePopupContext,
  GradientButton,
  InitialValuesType,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
  Alert,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

const CategoryMasterForm = ({
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
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  const mutation = useMutation(API.categoryMasterDML, {
    onError: async (error: any) => {
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

    let oldData = { ...rows?.[0]?.data };
    let upd = utilFunction.transformDetailsData(newData, oldData);

    if (upd._UPDATEDCOLUMNS.length > 0) {
      upd._UPDATEDCOLUMNS = upd._UPDATEDCOLUMNS.filter(
        (field) =>
          field !== "Surcharge" &&
          field !== "TDSPayable" &&
          field !== "TDSReceivable"
      );

      isErrorFuncRef.current = {
        data: {
          ...newData,
          ...upd,
          COMP_CD: authState?.companyID ?? "",
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
    } else {
      setFormMode("view");
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
          key={"categoryMasterForm" + formMode}
          metaData={
            extractMetaData(
              CategoryMasterFormMetaData,
              formMode
            ) as MetaDataType
          }
          displayMode={formMode}
          onSubmitHandler={onSubmitHandler}
          initialValues={
            formMode === "new"
              ? {
                  ...rows?.[0]?.data,
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                }
              : { ...(rows?.[0]?.data as InitialValuesType) }
          }
          formStyle={{
            background: "white",
          }}
          formState={{
            MessageBox: MessageBox,
            gridData: gridData,
            rows: rows?.[0]?.data,
            handleButtonDisable: handleButtonDisable,
            docCD: docCD,
            acctDtlReqPara: {
              TDS_ACCT_CD: {
                ACCT_TYPE: "TDS_ACCT_TYPE",
                BRANCH_CD: "TDS_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
              TDS_SUR_ACCT_CD: {
                ACCT_TYPE: "TDS_SUR_ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
              TDS_REC_ACCT_CD: {
                ACCT_TYPE: "TDS_REC_ACCT_TYPE",
                BRANCH_CD: "TDS_REC_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
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
                    disabled={isSubmitting || disableButton || mutation.isError}
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

export const CategoryMasterFormWrapper = ({
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
      className="categoryMstDlg"
    >
      <CategoryMasterForm
        closeDialog={closeDialog}
        defaultView={defaultView}
        isDataChangedRef={isDataChangedRef}
        gridData={gridData}
      />
    </Dialog>
  );
};
