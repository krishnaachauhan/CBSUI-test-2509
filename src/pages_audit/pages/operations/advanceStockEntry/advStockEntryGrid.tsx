import { useAdvStockEntry } from "./hooks/useAdvStockEntry";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  GridWrapper,
  ClearCacheProvider,
  ActionTypes,
} from "@acuteinfo/common-base";
import { useEnter } from "components/custom/useEnter";
import { DialogProvider } from "../payslip-issue-entry/DialogContext";
import { AdvanceStockEntryForm } from "./advanceStockEntry";
import { gridMetadata } from "./gridMetadata/dataGridMetadata";
import { RetrivalParaForm } from "./RetrivalBox";
import { useEffect, useRef } from "react";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
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
const AdvStockEntryGrid = () => {
  const {
    state,
    setState,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    setCurrentAction,
    handleDialogClose,
    retrievalParaRef,
    retrieveDataMutation,
    isDataChangedRef,
  } = useAdvStockEntry();
  const initialRender = useRef(true);
  const location = useLocation();
  const navigate = useNavigate();
  const handleClose = () => {
    setState((prev) => ({ ...prev, open: false, isRetrieveMode: true }));
    if (!state.isDataRetrieved) refetch();
  };
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/operation/advstock-entry") {
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);

  useEnter(state.className);

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
        key={`StatementEmailRegistration_${JSON.stringify(state.gridData)}`}
        finalMetaData={gridMetadata}
        data={
          state.retrievedData.length > 0
            ? state.retrievedData
            : state.gridData ?? []
        }
        setData={(data) => setState((prev) => ({ ...prev, gridData: data }))}
        loading={isLoading || isFetching || retrieveDataMutation.isLoading}
        actions={actions ?? []}
        setAction={setCurrentAction}
        refetchData={() => {
          if (
            retrievalParaRef.current &&
            Object.keys(retrievalParaRef.current).length > 0
          ) {
            retrieveDataMutation.mutate({ ...retrievalParaRef.current });
          } else {
            refetch();
          }
        }}
        enableExport
      />
      <Routes>
        {[
          { path: "view-details/*", view: "edit" },
          { path: "add/*", view: "new" },
        ].map(({ path, view }) => (
          <Route
            key={path}
            path={path}
            element={
              <AdvanceStockEntryForm
                isDataChangedRef={isDataChangedRef}
                closeDialog={handleDialogClose}
                defaultView={view}
                screenForUse="entry"
                otherScreenReqPara={null}
                confirmedDataGridMutation={null}
              />
            }
          />
        ))}
      </Routes>
      {state.open && (
        <RetrivalParaForm
          closeDialog={handleClose}
          retrievalParaValues={(data, reqData) => {
            retrievalParaRef.current = reqData;
            setState((prev) => ({ ...prev, retrievedData: data }));
          }}
        />
      )}
    </>
  );
};

export const AdvStockEntry = () => (
  <ClearCacheProvider>
    <DialogProvider>
      <div className="main">
        <AdvStockEntryGrid />
      </div>
    </DialogProvider>
  </ClearCacheProvider>
);
