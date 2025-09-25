import { gstOutwardEntryGrid } from "./gridMetaData";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  ClearCacheContext,
  queryClient,
  ActionTypes,
  Alert,
  GridWrapper,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { GstOutwardMasterDetailFormNew } from "../GstOutwardEntryNew/GstOutwardEntry/gstOutWardMasterDetailFormNew";

const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: true,
    alwaysAvailable: true,
  },
];
export const GstOutwardGrid = ({ screenFlag }) => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const myGridRef = useRef<any>(null);
  const { getEntries } = useContext(ClearCacheContext);
  const location = useLocation();
  const initialRender = useRef(true);
  const isDataChangedRef = useRef(false);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getGstOutwardHeaderRetrive"], () =>
    API.getGstOutwardHeaderRetrive({
      comp_cd: authState?.companyID,
      branch_cd: authState?.user?.branchCode,
      flag: "A",
      gd_date: authState?.workingDate,
      user_level: authState?.role,
      user_name: authState?.user?.id,
    })
  );
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/operation/gst-outward-entry") {
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);
  const setCurrentAction = useCallback(
    (data) => {
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );
  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getGstOutwardHeaderRetrive"]);
    };
  }, [getEntries]);
  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`GstOutwardgrid`}
        finalMetaData={gstOutwardEntryGrid as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        ref={myGridRef}
      />
      <Routes>
        <Route
          path="add"
          element={
            <GstOutwardMasterDetailFormNew
              ClosedEventCall={handleDialogClose}
              screenFlag={screenFlag}
              defaultView={"new"}
              refetchData={refetch}
            />
          }
        />
        <Route
          path="view-details"
          element={
            <GstOutwardMasterDetailFormNew
              ClosedEventCall={handleDialogClose}
              defaultView={"edit"}
              screenFlag={screenFlag}
              refetchData={refetch}
            />
          }
        />
      </Routes>
    </Fragment>
  );
};
export default GstOutwardGrid;
