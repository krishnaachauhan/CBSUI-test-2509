import React, { useCallback, useEffect, useRef } from "react";
import * as API from "./api";
import { useQuery } from "react-query";
import { DynamicGridConfigGridMData } from "./gridMetadata";
import { Route, Routes, useNavigate } from "react-router-dom";
import LangWiseMSGFormdata from "./LangWiseMSGFormdata/LangWiseMSGFormdata";
import {
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  queryClient,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "Edit Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  // {
  //   actionName: "add",
  //   actionLabel: "Add",
  //   multiple: undefined,
  //   rowDoubleClick: false,
  //   alwaysAvailable: true,
  // },
];
export const LangWiseMessageConfig = () => {
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getLangMessageHDR"], () => API.getLangMessageHDR());
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getLangMessageHDR"]);
    };
  }, []);

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
      // isDataChangedRef.current = false;
    }
    navigate(".");
  };
  return (
    <>
      <GridWrapper
        key={"dynGridConfigGrid"}
        finalMetaData={DynamicGridConfigGridMData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        // ref={myGridRef}
        // defaultSortOrder={[{ id: "TRAN_CD", desc: false }]}
      />
      <Routes>
        <Route
          path="add/*"
          element={
            <LangWiseMSGFormdata
              defaultView={"new"}
              closeDialog={handleDialogClose}
              isDataChangedRef={isDataChangedRef}
            />
          }
        />

        <Route
          path="view-details/*"
          element={
            <LangWiseMSGFormdata
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
            />
          }
        />
      </Routes>
    </>
  );
};
