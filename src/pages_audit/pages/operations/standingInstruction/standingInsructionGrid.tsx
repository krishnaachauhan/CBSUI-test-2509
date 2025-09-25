import { Fragment, useContext, useEffect, useState } from "react";
import { useRef, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { standingInsructionGridMetaData } from "./metaData/gridMetaData";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useQuery } from "react-query";
import { StandingInstructionFormWrapper } from "./standingInstructionTemplate";
import {
  ClearCacheProvider,
  usePopupContext,
  queryClient,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";
import SIAsExcutedGrid from "./siAsExcuted";
import SearchGrid from "./searchGrid";
import AddSubData from "./addSubdata";
import { t } from "i18next";
// import StadingInstructionViewData from "./viewDetail";

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
    multiple: undefined,
    rowDoubleClick: true,
  },

  {
    actionName: "search",
    actionLabel: "Search",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "si-as-executed",
    actionLabel: "SIasExecuted",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const StandingInstructionGrid = () => {
  const authController = useContext(AuthContext);
  const isDataChangedRef = useRef(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [opens, setOpens] = useState(false);
  const { state: rows } = useLocation();
  const tranCd = rows?.[0]?.data?.TRAN_CD;
  const initialRender = useRef(true);
  const location = useLocation();
  const navigate = useNavigate();
  const setCurrentAction = useCallback(
    async (data) => {
      if (
        data?.name === "si-as-executed" ||
        data?.name === "search" ||
        data?.name === "view-details"
      ) {
        setOpens(true);
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate, MessageBox]
  );
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: mainRefetch,
  } = useQuery<any, any>(["getStandingInstructionData"], () =>
    API.getStandingInstructionData({
      companyID: authController?.authState?.companyID,
      branchCode: authController?.authState?.user?.branchCode,
    })
  );
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (
        location.pathname ===
        "/EnfinityCore/operation/standing-instruction-entry"
      ) {
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);
  const ClosedEventCall = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      mainRefetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getStandingInstructionData"]);
    };
  }, []);
  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"standingInsructionGridMetaData"}
        finalMetaData={standingInsructionGridMetaData as GridMetaDataType}
        loading={isLoading || isFetching}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => mainRefetch()}
      />
      <Routes>
        <Route
          path="add/*"
          element={
            <StandingInstructionFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={ClosedEventCall}
              defaultView={"new"}
              data={data}
            />
          }
        />

        <Route
          path="si-as-executed/*"
          element={
            <SIAsExcutedGrid open={opens} onClose={() => setOpens(false)} />
          }
        />
        <Route
          path="search/*"
          element={
            <SearchGrid
              open={opens}
              onClose={() => setOpens(false)}
              mainRefetch={mainRefetch}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <AddSubData
              open={opens}
              onClose={() => setOpens(false)}
              mainRefetch={mainRefetch}
            />
          }
        />
      </Routes>
    </Fragment>
  );
};

export const StandingInstructionGridWrapper = () => {
  return (
    <ClearCacheProvider>
      <StandingInstructionGrid />
    </ClearCacheProvider>
  );
};
