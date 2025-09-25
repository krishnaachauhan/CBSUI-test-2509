import React, { useCallback, useContext, useMemo, useState } from "react";
import { usePmbyRegMstGrid } from "./usePmbyRegMstGrid";
import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  GridWrapper,
} from "@acuteinfo/common-base";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { PmbyRegMstEntry } from "./pmbyRegMstEntry";
import { RetrivalPara } from "./retrivalParaForm";
import { gridMetadata } from "./gridmetadata";
import {
  DialogProvider,
  useDialogContext,
} from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import * as API from "./api";
import { getdocCD } from "components/utilFunction/function";

interface PmbyRegMstProps {
  screenType: string;
}

const baseActions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
];

const PmbyRegMstGrid: React.FC<PmbyRegMstProps> = ({ screenType }) => {
  const location = useLocation();

  const navigate = useNavigate();
  const { trackDialogClass } = useDialogContext();
  const { authState } = useContext(AuthContext);

  const [activeFlag, setActiveFlag] = useState<"P" | "ALL">("P");

  const docCD = getdocCD(location.pathname, authState?.menulistdata);

  const actionMenu = useMemo(() => {
    let actions = [...baseActions];

    if (screenType === "E") {
      actions.push(
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
        }
      );
    }

    if (screenType === "C") {
      actions.push({
        actionName: activeFlag === "P" ? "view-all" : "view-pending",
        actionLabel: activeFlag === "P" ? "View All" : "View Pending",
        alwaysAvailable: true,
        multiple: undefined,
      });
    }

    return actions;
  }, [screenType, activeFlag]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any[],
    Error
  >(
    ["getDataToConfirm", authState?.user?.branchCode, activeFlag],
    () =>
      API.getDataToConfirm({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        DOC_CD: docCD,
        SCREEN_REF: docCD,
        ACCT_TYPE: "",
        ACCT_CD: "",
        TRAN_CD: "",
        FROM_DT: authState?.workingDate ?? "",
        TO_DT: authState?.workingDate ?? "",
        FLAG: screenType === "C" ? activeFlag : "D",
      }),
    {
      enabled: true,
      retry: false,
    }
  );
  const {
    retrievedData,
    setRetrievedData,
    open,
    setOpen,
    retrieveData,
    handleDialogClose,
    retrievalParaRef,
    isDataChangedRef,
  } = usePmbyRegMstGrid({
    screenType,
    refetch: () => {
      void refetch();
    },
  });
  const setCurrentAction = useCallback(
    ({ name, rows }: { name: string; rows?: any[] }) => {
      if (name === "add") {
        trackDialogClass("formDlg");
        navigate(name, { state: [] });
        if (retrievalParaRef.current) {
          isDataChangedRef.current = false;
          setRetrievedData([]);
          refetch();
        }
      } else if (name === "retrieve") {
        setOpen(true);
      } else if (name === "view-all") {
        setActiveFlag("ALL"); // Fixed logic
      } else if (name === "view-pending") {
        setActiveFlag("P"); // Fixed logic
      } else {
        trackDialogClass("formDlg");
        navigate(name, { state: rows });
      }
    },
    [
      navigate,
      setActiveFlag,
      setRetrievedData,
      setOpen,
      retrievalParaRef,
      isDataChangedRef,
      trackDialogClass,
    ]
  );

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={(error as any)?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={(error as any)?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`pmbyMst-${activeFlag}`}
        finalMetaData={gridMetadata}
        data={retrievedData.length > 0 ? retrievedData : data ?? []}
        setData={() => {}}
        loading={isLoading || isFetching || retrieveData.isLoading}
        actions={actionMenu}
        setAction={setCurrentAction}
        refetchData={() => {
          if (
            retrievalParaRef.current &&
            Object.keys(retrievalParaRef.current).length > 0
          ) {
            retrieveData.mutate({ ...retrievalParaRef.current });
          } else {
            refetch();
          }
        }}
        enableExport={true}
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
              <PmbyRegMstEntry
                isDataChangedRef={isDataChangedRef}
                closeDialog={handleDialogClose}
                defaultView={view}
                screenType={screenType}
              />
            }
          />
        ))}
      </Routes>

      {open && (
        <RetrivalPara
          closeDialog={() => setOpen(false)}
          retrievalParaValues={(data, reqData) => {
            retrievalParaRef.current = reqData;
            setRetrievedData(data);
          }}
        />
      )}
    </>
  );
};

const PmbyRegMst = ({ screenType }: PmbyRegMstProps) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <PmbyRegMstGrid screenType={screenType} />
      </DialogProvider>
    </ClearCacheProvider>
  );
};

export default PmbyRegMst;
