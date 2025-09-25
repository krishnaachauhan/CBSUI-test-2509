import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ActionTakenMasterGridMetaData } from "./gridMetadata";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ActionTakenMasterFormWrapper } from "./actionTakenMasterForm";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  ClearCacheContext,
} from "@acuteinfo/common-base";
import { useEnter } from "components/custom/useEnter";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
    rowDoubleClick: false,
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

export const ActionTakenMasterGrid = () => {
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const { getEntries } = useContext(ClearCacheContext);
  const isDeleteDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const [className, setClassName] = useState<string>("main");

  const deleteMutation = useMutation(API.actionTakenMasterDML, {
    onError: (error: any) => {
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
        setClassName("actionTakenDlg");
        navigate(data?.name, {
          state: [],
        });
      } else {
        setClassName("actionTakenDlg");
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
  >(["getActionTakenMasterGridData", authState?.user?.branchCode], () =>
    API.getActionTakenMasterGridData({
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
        "getActionTakenMasterGridData",
        authState?.user?.branchCode,
      ]);
    };
  }, [getEntries]);

  const handleDialogClose = useCallback(() => {
    setClassName("main");
    navigate(".");
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  useEnter(`${className}`);

  return (
    <div className="main">
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
        key={"actionTakenMasterGrid"}
        finalMetaData={ActionTakenMasterGridMetaData as GridMetaDataType}
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
            <ActionTakenMasterFormWrapper
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
            <ActionTakenMasterFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
              gridData={data}
            />
          }
        />
      </Routes>
    </div>
  );
};
