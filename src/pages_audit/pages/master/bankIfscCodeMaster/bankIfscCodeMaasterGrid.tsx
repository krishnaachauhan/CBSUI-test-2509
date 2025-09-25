import { useCallback, useContext, useEffect, useRef } from "react";
import { serverGridMetadata } from "./gridMetadata";
import { Route, Routes, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { BankIfscCdMasterFormWrapper } from "./viewDetails/bankIfscCodeMasterViewDetails";
import { useMutation } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import ImportData from "./fileupload/importData";
import {
  usePopupContext,
  ActionTypes,
  queryClient,
  ServerGridWrapper,
  utilFunction,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "Delete",
    actionLabel: "Delete",
    multiple: false,
  },
  {
    actionName: "Import",
    actionLabel: "Import",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const BankIfscCodeMaasterGrid = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDeleteDataRef = useRef<any>(null);
  const isDataChangedRef = useRef<any>(null);
  const sevrerGridRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "Delete") {
        isDeleteDataRef.current = data?.rows?.[0];
        const btnName = await MessageBox({
          message: t("DeleteData"),
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });
        if (btnName === "Yes") {
          deleteMutation.mutate({
            ...isDeleteDataRef.current?.data,
            _isDeleteRow: true,
          });
        }
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  // const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
  //   any,
  //   any
  // >(["getBankIfscCdData"], () =>
  //   API.getBankIfscCdData({
  //     companyID: authState?.companyID,
  //     branchCode: authState?.user?.branchCode,
  //   })
  // );
  const deleteMutation = useMutation(API.deleteupdateBankIfscCodeData, {
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
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      // refetch();
      sevrerGridRef?.current?.fetchData();
      CloseMessageBox();
    },
  });

  const ClosedEventCall = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      sevrerGridRef?.current?.fetchData();
      // refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getBankIfscCdData"]);
    };
  }, []);

  return (
    <div style={{ padding: "0px 10px" }}>
      {/* {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Somethingwenttowrong"}
          errorDetail={error?.error_detail}
          color="error"
        />
      )} */}
      <ServerGridWrapper
        dataGridKey={"bankMaster"}
        metaData={serverGridMetadata}
        getAPIFn={API.getBankIfscCdDataForServer}
        getAPIReqPara={{}}
        actions={actions}
        setAction={setCurrentAction}
        // defaultFilter,
        // defaultSortOrder,
        // dataTransformer,
        // autoRefreshInterval,
        ref={sevrerGridRef}
      />
      {/* <GridWrapper
        key={"getBankIfscCdDataGrid"}
        finalMetaData={gridMetadata}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      /> */}
      <Routes>
        <Route
          path="add/*"
          element={
            <BankIfscCdMasterFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={ClosedEventCall}
              defaultView={"add"}
              // gridData={data}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <BankIfscCdMasterFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={ClosedEventCall}
              defaultView={"view"}
              // gridData={data}
            />
          }
        />
        <Route
          path="Import/*"
          element={
            <ImportData
              CloseFileUpload={ClosedEventCall}
              refetchData={() => sevrerGridRef?.current?.fetchData()}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default BankIfscCodeMaasterGrid;
