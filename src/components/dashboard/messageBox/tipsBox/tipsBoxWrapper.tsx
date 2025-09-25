import { useRef, useEffect, useContext, useState, useMemo } from "react";
import { Button, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import {
  InitialValuesType,
  SubmitFnType,
  LoaderPaperComponent,
  MetaDataType,
} from "@acuteinfo/common-base";
import * as API from "../../api";
import { TipsListMetadata } from "./metadata";
import { useSnackbar } from "notistack";
import { useMutation } from "react-query";
import {
  utilFunction,
  PopupMessageAPIWrapper,
  FormWrapper,
} from "@acuteinfo/common-base";

export const TipsWrapper = ({
  open,
  closeDialog,
  data: mainData,
  formView,
  isLoading,
  isDataChangedRef,
}) => {
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [isOpenSave, setIsOpenSave] = useState(false);
  const isErrorFuncRef = useRef<any>(null);

  const mutation = useMutation(API.updateTipsDetailsData, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      //endSubmit(false, errorMsg, error?.error_detail ?? "");
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
  const onPopupYes = (rows) => {
    mutation.mutate(rows);
  };
  const onActionCancel = () => {
    setIsOpenSave(false);
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

    let newData = {
      IS_VIEW_NEXT: Boolean(data?.IS_VIEW_NEXT) ? "Y" : "N" ?? "",
    };

    let oldData = {
      IS_VIEW_NEXT: mainData?.IS_VIEW_NEXT ?? "",
    };

    let upd: any = utilFunction.transformDetailsData(newData, oldData ?? {});

    // if (upd?._UPDATEDCOLUMNS?.length > 0) {
    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
        TRAN_CD: mainData?.TRAN_CD ?? "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        SR_CD: "1",
        _isNewRow: false,
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    setIsOpenSave(true);
    // }
  };
  return (
    <>
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={true}
          PaperProps={{
            style: {
              width: "100%",
              height: "50%",
            },
          }}
          key="filepreviewDialog"
        >
          <FormWrapper
            key={`TipsListMetadata`}
            metaData={TipsListMetadata as MetaDataType}
            onSubmitHandler={onSubmitHandler}
            initialValues={
              {
                ...mainData,
                IS_VIEW_NEXT: mainData?.IS_VIEW_NEXT === "Y" ? true : false,
              } as InitialValuesType
            }
            // hideHeader={true}
            formStyle={{
              background: "white",
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <Button
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  color={"primary"}
                >
                  Save
                </Button>
                <Button
                  onClick={closeDialog}
                  color={"primary"}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
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
      )}
    </>
  );
};
