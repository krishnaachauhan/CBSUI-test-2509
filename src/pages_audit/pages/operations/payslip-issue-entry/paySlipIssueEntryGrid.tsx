import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { DataRetrival } from "./DataRetrival";
import { RetrieveGridMetaData } from "./paySlipMetadata";
import { PaySlipIssueEntryData } from "./PayslipIsuueEntryform";
import {
  Alert,
  ClearCacheProvider,
  queryClient,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useEnter } from "components/custom/useEnter";
import { DialogProvider, useDialogContext } from "./DialogContext";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "Retrive",
    actionLabel: "Retrive",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "close",
    actionLabel: "close",
    alwaysAvailable: true,
    multiple: undefined,
  },
];

const RetriveDataGrid = ({ onClose }) => {
  const { authState } = useContext(AuthContext);
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  const navigate = useNavigate();
  const location = useLocation();
  const initialRender = useRef(true);

  // Single state object
  const [state, setState] = useState({
    retrievedData: [] as any[],
    openDataRetrivalForm: false,
    className: "mainGrid",
    commonClass: localStorage.getItem("F5"),
  });

  const updateUiState = (updates: Partial<typeof state>) =>
    setState((prev) => ({ ...prev, ...updates }));

  const docCD = getdocCD(location.pathname, authState?.menulistdata);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: slipdataRefetch,
  } = useQuery<any, any>(["getRetrievalPaySlipEntryData"], () =>
    API.getRetrievalPaySlipEntryData({
      companyID: authState?.companyID,
      branchCode: authState?.user?.branchCode,
      FROM_DT: authState?.workingDate,
      TO_DT: authState?.workingDate,
      USER_LEVEL: authState?.role,
      GD_DATE: authState?.workingDate,
      DOC_CD: docCD,
    })
  );

  useEffect(() => {
    if (data) updateUiState({ retrievedData: data });
  }, [data]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/operation/payslip-issue-entry") {
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "R" || e.key === "r")) {
        e.preventDefault();
        updateUiState({ openDataRetrivalForm: true });
      }
      if (e.key === "Escape") {
        e.preventDefault();
        updateUiState({ openDataRetrivalForm: false });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => queryClient.removeQueries(["getRetrievalPaySlipEntryData"]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => updateUiState({ commonClass: localStorage.getItem("commonClass") }),
      1000
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let newClass = "mainGrid";
    if (dialogClassNames?.[0]) newClass = dialogClassNames;
    else if (location.pathname.endsWith("add"))
      newClass = state.commonClass ?? "form";
    else if (state.openDataRetrivalForm) newClass = "Retrive";
    updateUiState({ className: newClass });
  }, [
    dialogClassNames,
    location.pathname,
    state.commonClass,
    state.openDataRetrivalForm,
  ]);

  useEnter(state.className);

  const setCurrentAction = useCallback(
    (data) => {
      if (data.name === "Retrive")
        updateUiState({ openDataRetrivalForm: true });
      else if (data.name === "close") onClose();
      else navigate(data?.name, { state: data?.rows });
    },
    [navigate, onClose]
  );

  const ClosedEventCall = () => {
    slipdataRefetch();
    navigate(".");
  };

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went wrong"}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}

      <div className="mainGrid">
        <GridWrapper
          key="retrieveGridMetaData"
          finalMetaData={RetrieveGridMetaData as GridMetaDataType}
          data={state.retrievedData ?? []}
          setData={() => null}
          actions={actions}
          loading={isLoading || isFetching}
          setAction={setCurrentAction}
          refetchData={slipdataRefetch}
          defaultSortOrder={[{ id: "LEAN_CD", desc: false }]}
        />
      </div>

      <Routes>
        <Route
          path="add/*"
          element={
            <PaySlipIssueEntryData
              defaultView="new"
              closeDialog={ClosedEventCall}
              slipdataRefetch={slipdataRefetch}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <PaySlipIssueEntryData
              defaultView="view"
              closeDialog={ClosedEventCall}
              slipdataRefetch={slipdataRefetch}
            />
          }
        />
      </Routes>

      <DataRetrival
        closeDialog={() => {
          updateUiState({ openDataRetrivalForm: false });
          trackDialogClass("");
        }}
        open={state.openDataRetrivalForm}
        onUpload={(result) => updateUiState({ retrievedData: result })}
      />
    </Fragment>
  );
};

export const PaySlipIssueEntry = ({ onClose }) => (
  <ClearCacheProvider>
    <DialogProvider>
      <RetriveDataGrid onClose={onClose} />
    </DialogProvider>
  </ClearCacheProvider>
);
