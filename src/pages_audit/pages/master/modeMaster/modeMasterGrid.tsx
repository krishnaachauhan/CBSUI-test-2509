import {
  ActionTypes,
  GridMetaDataType,
  GridWrapper,
  Alert,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";

import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { gridMetadata } from "./gridMetadata";
import { Route, Routes, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { ModeMasterFormWrapper } from "./viewDetails/modeMasterViewDetails";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { useEnter } from "components/custom/useEnter";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "Delete",
    actionLabel: "Delete",
    multiple: false,
  },
];

const ModeMasterGrid = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const isDeleteDataRef = useRef<any>(null);
  const isDataChangedRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "Delete") {
        isDeleteDataRef.current = data?.rows?.[0];
        const btnName = await MessageBox({
          message: "DeleteData",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });
        if (btnName === "Yes") {
          deleteMutation.mutate({
            ...isDeleteDataRef.current?.data,
            _isDeleteRow: true,
          });
        }
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getModeMasterData"], () =>
    API.getModeMasterData({
      companyID: authState?.companyID,
      branchCode: authState?.user?.branchCode,
    })
  );
  const deleteMutation = useMutation(API.deleteModeMasterData, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      refetch();
      CloseMessageBox();
    },
  });

  const ClosedEventCall = () => {
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getModeMasterData"]);
    };
  }, []);
  useEnter("main");
  return (
    <div className="main">
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
          key={"modeMasterGrid"}
          finalMetaData={gridMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          actions={actions}
          loading={isLoading || isFetching}
          setAction={setCurrentAction}
          refetchData={() => refetch()}
          defaultSortOrder={[{ id: "LEAN_CD", desc: false }]}
          variant="contained"
        />
        <Routes>
          <Route
            path="add/*"
            element={
              <ModeMasterFormWrapper
                isDataChangedRef={isDataChangedRef}
                closeDialog={ClosedEventCall}
                defaultView={"add"}
                gridData={data}
              />
            }
          />
          <Route
            path="view-details/*"
            element={
              <ModeMasterFormWrapper
                isDataChangedRef={isDataChangedRef}
                closeDialog={ClosedEventCall}
                defaultView={"view"}
                gridData={data}
              />
            }
          />
        </Routes>
      </Fragment>
    </div>
  );
};

export default ModeMasterGrid;
