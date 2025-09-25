import { Fragment, useContext, useState } from "react";
import { useRef, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { TradeMasterGridMetaData } from "./gridMetaData";
import { TradeMasterFormWrapper } from "./viewDetails/tradeMasterForm";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";

import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
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
  },
];

const TradeMaster = () => {
  const { authState } = useContext(AuthContext);
  const isDataChangedRef = useRef(false);
  const isDeleteDataRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const navigate = useNavigate();
  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "delete") {
        isDeleteDataRef.current = data?.rows?.[0];
        const btnName = await MessageBox({
          message: t("DeleteData"),
          messageTitle: t("Confirmation"),
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
  >(["getTradeMasterData", authState.user.branchCode], () =>
    API.getTradeMasterData({
      companyID: authState?.companyID,
      branchCode: authState?.user?.branchCode,
    })
  );

  const deleteMutation = useMutation(API.deleteTradeMasterData, {
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
      enqueueSnackbar(t("deleteSuccessfully"), {
        variant: "success",
      });
      refetch();
      CloseMessageBox();
    },
  });

  const ClosedEventCall = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

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
        key={"dynGridConfigGrid"}
        finalMetaData={TradeMasterGridMetaData as GridMetaDataType}
        loading={isLoading || isFetching}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
      <Routes>
        <Route
          path="add/*"
          element={
            <TradeMasterFormWrapper
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
            <TradeMasterFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={ClosedEventCall}
              defaultView={"view"}
              gridData={data}
            />
          }
        />
      </Routes>
    </Fragment>
  );
};

export default TradeMaster;
