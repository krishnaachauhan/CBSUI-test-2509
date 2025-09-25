import { CircularProgress, Dialog } from "@mui/material";
import { ParaDetailMetadata } from "./metaData";
import { useContext, useMemo, useRef, useState } from "react";
import * as API from "./api";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import {
  usePopupContext,
  GradientButton,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
  SubmitFnType,
  Alert,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
const EditDetail = ({ open, onClose, rowsData, refetch, formView }) => {
  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(formView);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const result = useMutation(API.validateparavalue, {
    onSuccess: async (data) => {
      if (data?.[0]?.STATUS === "0") {
        const currentRowData = isErrorFuncRef?.current?.data;
        const Btn = await MessageBox({
          messageTitle: "Confirmation",
          message: "SaveData",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
          loadingBtnName: ["Yes"],
        });
        if (Btn === "Yes") {
          mutation.mutate({
            datatype_cd: currentRowData?.DATATYPE_CD ?? "",
            paraValue: currentRowData?.PARA_VALUE ?? "",
            old_datatype: rowsData?.[0].data?.DATATYPE_CD ?? "",
            old_paraValue: rowsData?.[0].data?.PARA_VALUE ?? "",
            remark: currentRowData?.REMARKS ?? "",
            old_remark: rowsData?.[0].data?.REMARKS ?? "",
            comp_cd: rowsData?.[0].data?.COMP_CD ?? "",
            branch_cd: rowsData?.[0].data?.BRANCH_CD ?? "",
            paraCode: currentRowData?.PARA_CD ?? "",
          });
        }
      } else if (data?.[0]?.STATUS === "999" && data?.[0]?.MESSAGE) {
        MessageBox({
          messageTitle: "Validation Alert..",
          message: data?.[0]?.MESSAGE,
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {},
  });
  const mutation = useMutation(API.updateParameterData, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      if (isErrorFuncRef.current == null) {
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
      } else {
        isErrorFuncRef.current?.endSubmit(
          false,
          errorMsg,
          error?.error_detail ?? ""
        );
      }
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      isErrorFuncRef.current = true;
      onClose();
      refetch();
      CloseMessageBox();
      setFormMode("view");
    },
  });
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    //@ts-ignore
    endSubmit(true);
    let newData = {
      ...data,
    };
    let oldData = {
      ...rowsData?.[0]?.data,
    };
    let upd = utilFunction.transformDetailsData(newData, oldData);
    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    if (isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length === 0) {
      CloseMessageBox();
      setFormMode("view");
    } else {
      result.mutate({
        PARA_CD: data?.PARA_CD ?? "",
        PARA_VALUE: data?.PARA_VALUE ?? "",
        BASE_COMP: authState?.baseCompanyID ?? "",
        BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
        COMP_CD: rowsData?.[0]?.data?.COMP_CD ?? "",
        BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      });
    }
  };
  const masterMetadata: MetaDataType = useMemo(
    () => extractMetaData(ParaDetailMetadata, formMode),
    [ParaDetailMetadata, formMode, ""]
  ) as MetaDataType;
  return (
    <>
      <Dialog
        open={open}
        fullWidth={true}
        PaperProps={{
          style: {
            maxWidth: "900px",
          },
        }}
      >
        {result?.error && (
          <Alert
            severity="error"
            errorMsg={result?.error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={result?.error?.error_detail ?? ""}
            color="error"
          />
        )}
        <FormWrapper
          key={`paraEditDetail` + formMode}
          metaData={masterMetadata as MetaDataType}
          initialValues={rowsData?.[0]?.data as InitialValuesType}
          onSubmitHandler={onSubmitHandler}
          //@ts-ignore
          displayMode={formMode}
          formStyle={{
            background: "white",
            height: "calc(53vh - 100px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
          containerstyle={{ padding: "10px" }}
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
                    endIcon={
                      result?.isLoading ? <CircularProgress size={20} /> : null
                    }
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
              ) : (
                <>
                  {rowsData?.[0]?.data?.CONFIRMED === "N" ||
                  rowsData?.[0]?.data?.ALLOW_VALUE_EDIT_FLAG === "N" ? null : (
                    <GradientButton
                      onClick={() => {
                        setFormMode("edit");
                      }}
                      color={"primary"}
                    >
                      Edit
                    </GradientButton>
                  )}
                  <GradientButton onClick={onClose} color={"primary"}>
                    Close
                  </GradientButton>
                </>
              )}
            </>
          )}
        </FormWrapper>
      </Dialog>
    </>
  );
};
export default EditDetail;
