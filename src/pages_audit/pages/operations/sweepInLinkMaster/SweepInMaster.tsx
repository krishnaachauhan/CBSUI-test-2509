import {
  ActionTypes,
  ClearCacheProvider,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useEnter } from "components/custom/useEnter";
import { Alert } from "reactstrap";
import * as API from "./api";
import { SweepInMasterForm } from "./SweepInMasterForm";
import { AuthContext } from "pages_audit/auth";
import { SweepInMasterMetaData } from "./SweepInMasterMetaData";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "view-details",
    actionLabel: "ViewDetail",
    multiple: false,
    rowDoubleClick: true,
  },
];

const SweepInMaster = () => {
  const [gridData, setGridData] = useState([]);
  const [className, setClassName] = useState("main");
  const [isDataRetrieved, setIsDataRetrieved] = useState(false);

  const isDataChangedRef = useRef(false);
  const initialRender = useRef(true);
  const retrievalParaRef = useRef<any>(null);

  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const newData = commonClass ?? dialogClassNames ?? "main";
    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  const {
    data: facility,
    isLoading: loading,
    isFetching: fetching,
    isError: restrictionIsError,
    error: errordata,
    refetch: refetchdata,
  } = useQuery<any, any>(
    ["sweepfacility", authState?.user?.branchCode],
    () =>
      API.sweepfacility({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
      }),
    {
      enabled: !!authState?.user?.branchCode,
      onSuccess: async (data) => {
        if (data[0]?.ALLOW !== "Y") {
          const buttonName = await MessageBox({
            messageTitle: "Options Not Allow",
            message: data[0]?.ALLOW ?? "",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (buttonName === "Ok") {
            navigate("/dashboard");
          }
        }
      },
      onError: (error) => {},
    }
  );

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(["retrievedata", authState?.user?.branchCode], () =>
    API.retrievedata({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["retrievedata", authState?.user?.branchCode]);
      queryClient.removeQueries(["sweepfacility", authState?.user?.branchCode]);
    };
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/operation/sweeplink-entry") {
        trackDialogClass("formDlg");
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (initialData && !isLoading && !isFetching) {
      setGridData(initialData);
      setIsDataRetrieved(false);
    }
  }, [initialData, isLoading, isFetching]);

  const setCurrentAction = useCallback(
    (data) => {
      const { name, rows } = data || {};
      if (name === "add") {
        trackDialogClass("formDlg");
        navigate(name, { state: [] });
        if (retrievalParaRef.current) {
          retrievalParaRef.current = null;
          setIsDataRetrieved(false);
          refetch();
        }
      } else {
        trackDialogClass("formDlg");
        navigate(name, { state: rows });
      }
    },
    [navigate]
  );

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
    if (isDataChangedRef.current) {
      refetch();
    }
    isDataChangedRef.current = false;
  }, [navigate, refetch, isDataRetrieved]);

  useEnter(className);
  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`StatementEmailRegistration${gridData}`}
        finalMetaData={SweepInMasterMetaData as GridMetaDataType}
        data={gridData ?? []}
        setData={setGridData}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={refetch}
        enableExport
      />
      <Routes>
        {[
          { path: "view-details/*", view: "view" },
          { path: "add/*", view: "new" },
        ].map(({ path, view }) => (
          <Route
            key={path}
            path={path}
            element={
              <SweepInMasterForm
                closeDialog={handleDialogClose}
                isDataChangedRef={isDataChangedRef}
                defaultView={view}
                loading={loading}
                refresh={refetch}
              />
            }
          />
        ))}
      </Routes>
    </>
  );
};

export const SweepInMasterMain = () => (
  <ClearCacheProvider>
    <DialogProvider>
      <div className="main">
        <SweepInMaster />
      </div>
    </DialogProvider>
  </ClearCacheProvider>
);
