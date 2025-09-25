import { enqueueSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import { Route, Routes, useNavigate } from "react-router-dom";
import * as API from "./api";
import { EntryDescMasterGridMetaData } from "./gridMetadata";
import { EntryDescMasterWrapper } from "./viewDetails/entryDescMasterForm";

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

export const EntryDescMasterGrid = () => {
  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const isDeleteDataRef = useRef<any>(null);
  const { t } = useTranslation();
  const [enterClassName, setEnterClassName] = useState("main");
  useEnter(`${enterClassName}`);

  const deleteMutation = useMutation(API.updateEntryDescMasterData, {
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
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
        setEnterClassName("entryDescForm");
        navigate(data?.name, {
          state: [],
        });
      } else {
        setEnterClassName("entryDescForm");
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
  >(["getEntryDescMasterGridData", authState?.user?.branchCode ?? ""], () =>
    API.getEntryDescMasterGridData({
      companyID: authState?.companyID ?? "",
      branchCode: authState?.user?.branchCode ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getEntryDescMasterGridData",
        authState?.user?.branchCode,
      ]);
    };
  }, [getEntries]);

  const handleDialogClose = useCallback(() => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
    setEnterClassName("main");
  }, [navigate]);

  return (
    <Fragment>
      <div className="main">
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={error?.error_detail ?? ""}
            color="error"
          />
        )}

        <GridWrapper
          key={"entryDescMasterGrid"}
          finalMetaData={EntryDescMasterGridMetaData as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          loading={isLoading || isFetching}
          enableExport={data?.length > 0 ? true : false}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() => refetch()}
        />
        <Routes>
          <Route
            path="add"
            element={
              <EntryDescMasterWrapper
                isDataChangedRef={isDataChangedRef}
                closeDialog={handleDialogClose}
                defaultView={"new"}
                gridData={data}
              />
            }
          />
          <Route
            path="view-details"
            element={
              <EntryDescMasterWrapper
                isDataChangedRef={isDataChangedRef}
                closeDialog={handleDialogClose}
                defaultView={"view"}
                gridData={data}
              />
            }
          />
        </Routes>
      </div>
    </Fragment>
  );
};
