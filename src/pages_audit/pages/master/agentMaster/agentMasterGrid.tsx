import { useRef, useCallback, useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AgentMasterGridMetaData } from "./gridMetadata";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { AgentMasterFormWrapper } from "./agentMasterForm";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  ClearCacheContext,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "delete",
    actionLabel: "Delete",
    multiple: false,
    rowDoubleClick: false,
  },
];

const AgentMasterGridMain = () => {
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const { getEntries } = useContext(ClearCacheContext);
  const isDeleteDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const [className, setClassName] = useState<string>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();

  //For Enter key
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  const deleteMutation = useMutation(API.agentMasterDML, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: () => {
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      CloseMessageBox();
      refetch();
    },
  });

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "delete") {
        isDeleteDataRef.current = data?.rows?.[0];
        const btnName = await MessageBox({
          message: "DeleteData",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          deleteMutation.mutate({
            ...isDeleteDataRef.current?.data,
            _isDeleteRow: true,
          });
        }
      } else if (data?.name === "add") {
        trackDialogClass("agentMstDlg");
        navigate(data?.name, {
          state: [],
        });
      } else {
        trackDialogClass("agentMstDlg");
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getAgentMasterGirdData", authState?.user?.branchCode], () =>
    API.getAgentMasterGirdData({
      companyID: authState?.companyID ?? "",
      branchCode: authState?.user?.branchCode ?? "",
    })
  );

  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries([
        "getAgentMasterGirdData",
        authState?.user?.branchCode,
      ]);
    };
  }, [getEntries]);

  const handleDialogClose = useCallback(() => {
    trackDialogClass("main");
    navigate(".");
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  useEnter(`${className}`);

  return (
    <>
      {(isError || deleteMutation.isError) && (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ||
            deleteMutation?.error?.error_msg ||
            t("Somethingwenttowrong")
          }
          errorDetail={
            error?.error_detail || deleteMutation?.error?.error_detail || ""
          }
          color="error"
        />
      )}
      <GridWrapper
        key={"agentMasterGrid"}
        finalMetaData={AgentMasterGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        enableExport={true}
      />
      <Routes>
        <Route
          path="add/*"
          element={
            <AgentMasterFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"new"}
              gridData={data}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <AgentMasterFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
              gridData={data}
            />
          }
        />
      </Routes>
    </>
  );
};

export const AgentMasterGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <AgentMasterGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
