import { Button, CircularProgress, Dialog } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import { useSnackbar } from "notistack";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "pages_audit/auth";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { DynamicDropdownConfigMetaData } from "./metaData";
import {
  GradientButton,
  ProcessDetailsData,
  utilFunction,
  PopupMessageAPIWrapper,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  queryClient,
} from "@acuteinfo/common-base";
export const DynamicDropdownConfig = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  data: reqData,
}) => {
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isOpenSave, setIsOpenSave] = useState(false);
  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(defaultView);
  const mutation = useMutation(API.dynamiDropdownConfigDML, {
    onError: (error: any, { endSubmit }) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      endSubmit(false, errorMsg, error?.error_detail ?? "");
      enqueueSnackbar(errorMsg, { variant: "error" });
      onActionCancel();
    },
    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });

      isDataChangedRef.current = true;
      closeDialog();
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["dynamiDropdownConfigDML"]);
    };
  }, []);

  const convertJsonToParse = reqData?.[0]?.data.DDW_OPTION;
  const parsedDDWOption =
    convertJsonToParse && convertJsonToParse.trim() !== ""
      ? JSON.parse(convertJsonToParse)
      : [];

  const updatedReqData = {
    ...(reqData?.[0]?.data ?? {}),
    DDW_OPTION: parsedDDWOption,
  };

  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    // @ts-ignore
    endSubmit(true);

    let oldData = reqData?.[0]?.data;
    let newData = data;

    if (newData?.DDW_OPTION) {
      let newDataString = JSON.stringify(newData?.DDW_OPTION);
      newData.DDW_OPTION = newDataString;
    }
    let updatedValue: any = utilFunction.transformDetailsData(
      newData,
      oldData ?? {}
    );

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...updatedValue,
        COMP_CD: authState.companyID,
        BRANCH_CD: authState.user.branchCode,
        TRAN_CD: reqData?.[0]?.data?.TRAN_CD ?? "",
        _isNewRow: formMode === "add" ? true : false,
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    setIsOpenSave(true);

    // setFormMode("view");
  };

  const onPopupYes = (rows) => {
    mutation.mutate(rows);
  };
  const onActionCancel = () => {
    setIsOpenSave(false);
  };

  if (DynamicDropdownConfigMetaData.form.label) {
    DynamicDropdownConfigMetaData.form.label =
      formMode !== "add"
        ? "Flexible Dropdown Configuration" +
          " For " +
          (reqData?.[0]?.data?.DDLB_NAME ?? "")
        : "Flexible Dropdown Configuration";
  }
  return (
    <>
      {/* {mutation.isLoading ? (
        <LoaderPaperComponent />
      ) : ( */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={true}
        PaperProps={{
          style: {
            width: "100%",
            height: "100%",
          },
        }}
        key="PropsFormDialog"
      >
        <FormWrapper
          key={"DynamicDropdownConfigMetaData" + formMode}
          metaData={DynamicDropdownConfigMetaData as unknown as MetaDataType}
          displayMode={formMode}
          onSubmitHandler={onSubmitHandler}
          initialValues={{
            ...(reqData?.[0]?.data ?? {}),
            ...updatedReqData,
          }}
          // hideHeader={true}
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
                    //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    color={"primary"}
                  >
                    Save
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormMode("view");
                    }}
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
                    //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    color={"primary"}
                  >
                    Save
                  </GradientButton>

                  <GradientButton
                    onClick={closeDialog}
                    //disabled={isSubmitting}
                    color={"primary"}
                  >
                    Close
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton
                    onClick={() => {
                      setFormMode("edit");
                    }}
                    //disabled={isSubmitting}
                    color={"primary"}
                  >
                    Edit
                  </GradientButton>
                  <GradientButton
                    onClick={closeDialog}
                    //disabled={isSubmitting}
                    color={"primary"}
                  >
                    Close
                  </GradientButton>
                </>
              )}
            </>
          )}
        </FormWrapper>
        {isOpenSave ? (
          <PopupMessageAPIWrapper
            MessageTitle="Confirmation"
            Message="Do you want to save this Request?"
            onActionYes={(rowVal) => onPopupYes(rowVal)}
            onActionNo={() => onActionCancel()}
            rows={isErrorFuncRef.current?.data}
            open={isOpenSave}
            loading={mutation.isLoading}
          />
        ) : null}
      </Dialog>
      {/* )} */}
    </>
  );
};

export const DynamicDropdownConfigWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  const { state: data }: any = useLocation();
  return (
    <Dialog
      open={true}
      // fullScreen={true}
      PaperProps={{
        style: {
          width: "100%",
          // height: "110vh",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
    >
      <DynamicDropdownConfig
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        data={data}
      />
    </Dialog>
  );
};
