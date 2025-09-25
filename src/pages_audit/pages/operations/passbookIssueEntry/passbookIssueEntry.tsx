import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import {
  Alert,
  GridWrapper,
  queryClient,
  ActionTypes,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import {} from "components/common/custom/dateRetrievalParaForm/dateRetrievalPara";
import { PassbookIssueEntryForm } from "./PassbookIssueEntryForm";
import { gridMetadata } from "./gridMetadata";

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

const PassbookIssueEntry = () => {
  const [gridData, setGridData] = useState([]);
  const [className, setClassName] = useState("main");
  const isDataChangedRef = useRef(false);
  const initialRender = useRef(true);
  const { authState } = useContext(AuthContext);
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const newData = commonClass ?? dialogClassNames ?? "main";
    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getIssuedPassbookData", authState?.user?.branchCode], () =>
    API.getIssuedPassbookData({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getPassbookIssueData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (
        location.pathname === "/EnfinityCore/operation/passbook-issue-entry"
      ) {
        trackDialogClass("formDlg");
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);

  const setCurrentAction = useCallback(
    (data) => {
      const { name, rows } = data || {};
      if (name === "add") {
        trackDialogClass("formDlg");
        navigate(name, { state: [] });
      } else {
        trackDialogClass("formDlg");
        navigate(name, { state: rows });
      }
    },
    [navigate, refetch]
  );

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
    if (isDataChangedRef.current) {
      refetch();
    }
    isDataChangedRef.current = false;
  }, [navigate, refetch]);

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
        finalMetaData={gridMetadata}
        data={data ?? []}
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
              <PassbookIssueEntryForm
                isDataChangedRef={isDataChangedRef}
                closeDialog={handleDialogClose}
                defaultView={view}
              />
            }
          />
        ))}
      </Routes>
    </>
  );
};

export const PassbookIssueEntryMain = () => (
  <ClearCacheProvider>
    <DialogProvider>
      <div className="main">
        <PassbookIssueEntry />
      </div>
    </DialogProvider>
  </ClearCacheProvider>
);
