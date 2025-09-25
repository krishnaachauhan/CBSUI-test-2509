import {
  queryClient,
  PopupMessageAPIWrapper,
  FormWrapper,
  MasterDetailsForm,
  MetaDataType,
} from "@acuteinfo/common-base";
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { langWiseMsgMetaData } from "./metadata";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
} from "@mui/material";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import * as API from "../api";
import { useMutation, useQueries, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
interface editMasterDataType {
  data: object;
  displayData?: object;
  endSubmit?: any;
  setFieldError?: any;
  SetLoadingOWN?: any;
}

const editMasterFormDataFnWrapper =
  (editMasterData) =>
  async ({ data }: editMasterDataType) => {
    return editMasterData(data);
  };
const LangWiseMSGFormdataCustom: FC<{
  closeDialog?: any;
  defaultView?: any;
  readOnly?: boolean;
  transactionID: number;
  data: any;
  isDataChangedRef: any;
}> = ({
  defaultView,
  transactionID,
  closeDialog,
  data: reqData,
  isDataChangedRef,
}) => {
  const [openAccept, setopenAccept] = useState(false);
  const isErrorFuncRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const myRef = useRef<any>(null);

  let newref: any = myRef.current;

  const [formMode, setFormMode] = useState(defaultView);
  const moveToViewMode = useCallback(() => setFormMode("view"), [setFormMode]);
  const moveToEditMode = useCallback(() => setFormMode("edit"), [setFormMode]);
  const mutation = useMutation(
    editMasterFormDataFnWrapper(API.editLanguage()),
    {
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
        onActionCancel();
      },
      onSuccess: (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });

        isDataChangedRef.current = true;
        closeDialog();
      },
    }
  );
  const result = useQueries([
    {
      queryKey: ["getDetailsLeavesGridData", transactionID],
      queryFn: () => API.getLangMessageDTL(transactionID, formMode),
    },
  ]);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDetailsLeavesGridData", transactionID]);
    };
  }, [transactionID]);
  const loading = result[0].isLoading || result[0].isFetching;
  let isError = result[0].isError;
  //@ts-ignore
  let errorMsg = `${result[0].error?.error_msg}`;
  errorMsg = Boolean(errorMsg.trim()) ? errorMsg : "Unknown error occured";

  //@ts-ignore
  let error_detail = `${result[0]?.error?.error_detail}`;
  const AddNewRow = () => {
    myRef.current?.addNewRow(true);
  };
  const onPopupYesAccept = (rows) => {
    mutation.mutate({
      data: rows,
    });
  };
  const onActionCancel = () => {
    setopenAccept(false);
  };
  const onSubmitHandler = ({ data, displayData, endSubmit, setFieldError }) => {
    //@ts-ignore
    endSubmit(true);
    isErrorFuncRef.current = { data, displayData, endSubmit, setFieldError };
    setopenAccept(true);
  };

  const renderResult = loading ? (
    <div style={{ margin: "2rem" }}>
      <LoaderPaperComponent />
    </div>
  ) : isError === true ? (
    <div style={{ margin: "1.2rem" }}>
      <Alert
        severity="error"
        // errorMsg={errorMsg}
        // errorDetail={error_detail ?? ""}
      />
    </div>
  ) : formMode === "new" ? (
    <>
      <MasterDetailsForm
        key={"leavesMaster"}
        metaData={langWiseMsgMetaData}
        ref={myRef}
        initialData={{ _isNewRow: true }}
        displayMode={"new"}
        onSubmitData={onSubmitHandler}
        isNewRow={true}
        formStyle={{
          background: "white",
          height: "20vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {({ isSubmitting, handleSubmit }) => {
          return (
            <>
              {/* <Button
                onClick={AddNewRow}
                disabled={isSubmitting}
                color={"primary"}
              >
                Add Row
              </Button> */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                color={"primary"}
              >
                Save
              </Button>
              <Button
                onClick={closeDialog}
                disabled={isSubmitting}
                color={"primary"}
              >
                Cancel
              </Button>
            </>
          );
        }}
      </MasterDetailsForm>
      {openAccept ? (
        <PopupMessageAPIWrapper
          MessageTitle="Confirmation"
          Message="Do you want to save this Request?"
          onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
          onActionNo={() => onActionCancel()}
          rows={isErrorFuncRef.current?.data}
          open={openAccept}
          loading={mutation.isLoading}
        />
      ) : null}
    </>
  ) : formMode === "view" ? (
    <MasterDetailsForm
      key={"leavesMaster" + formMode}
      metaData={langWiseMsgMetaData}
      ref={myRef}
      initialData={{
        _isNewRow: false,
        ...reqData[0].data,
        DETAILS_DATA: result[0].data,
      }}
      displayMode={formMode}
      isLoading={true}
      onSubmitData={onSubmitHandler}
      isNewRow={false}
      formStyle={{
        background: "white",
        height: "20vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}
      containerstyle={{ padding: "10px" }}
    >
      {({ isSubmitting, handleSubmit }) => {
        return (
          <>
            <Button onClick={moveToEditMode} color={"primary"}>
              Edit
            </Button>
            <Button onClick={closeDialog} color={"primary"}>
              Close
            </Button>
          </>
        );
      }}
    </MasterDetailsForm>
  ) : formMode === "edit" ? (
    <>
      <MasterDetailsForm
        key={"leavesMaster" + formMode}
        metaData={langWiseMsgMetaData}
        ref={myRef}
        initialData={{
          _isNewRow: false,
          ...reqData[0].data,
          DETAILS_DATA: result[0].data,
        }}
        displayMode={formMode}
        isLoading={false}
        onSubmitData={onSubmitHandler}
        isNewRow={false}
        // isNewRow={formMode === "new"}
        formStyle={{
          background: "white",
          height: "20vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        containerstyle={{ padding: "10px" }}
      >
        {({ isSubmitting, handleSubmit }) => {
          return (
            <>
              {/* <Button
                onClick={AddNewRow}
                disabled={isSubmitting}
                color={"primary"}
              >
                Add Row
              </Button> */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                color={"primary"}
              >
                Save
              </Button>
              <Button
                onClick={moveToViewMode}
                disabled={isSubmitting}
                color={"primary"}
              >
                Cancel
              </Button>
            </>
          );
        }}
      </MasterDetailsForm>
      {openAccept ? (
        <PopupMessageAPIWrapper
          MessageTitle="Confirmation"
          Message="Do you want to save this Request?"
          onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
          onActionNo={() => onActionCancel()}
          rows={isErrorFuncRef.current?.data}
          open={openAccept}
          loading={mutation.isLoading}
        />
      ) : null}
    </>
  ) : null;

  return renderResult;
};

export const LangWiseMSGFormdata = ({
  defaultView,
  closeDialog,
  isDataChangedRef,
}) => {
  const { state: data }: any = useLocation();

  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        onClose={closeDialog}
        PaperProps={{
          style: {
            maxWidth: "1100px",
            // minHeight: "60vh",
            //height: "100vh",
          },
        }}
        maxWidth="md"
      >
        <LangWiseMSGFormdataCustom
          transactionID={data?.[0]?.data?.TRAN_CD}
          defaultView={defaultView}
          closeDialog={closeDialog}
          data={data}
          isDataChangedRef={isDataChangedRef}
        />
      </Dialog>
    </>
  );
};

export default LangWiseMSGFormdata;
