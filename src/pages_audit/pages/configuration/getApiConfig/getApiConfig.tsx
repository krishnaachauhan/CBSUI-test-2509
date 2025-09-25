import React, { useCallback, useContext, useEffect, useRef } from "react";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { getApiGridMetaData } from "./getApiGridMetadata";
import { Route, Routes, useNavigate } from "react-router-dom";
import { GetApiForm } from "./getApiFormData/getApiForm";
import {
  ClearCacheContext,
  queryClient,
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  Alert,
  usePopupContext,
} from "@acuteinfo/common-base";
import { AppBar } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "flush",
    actionLabel: "FlushAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
    isNodataThenShow: true,
  },
  {
    actionName: "flushKeys",
    actionLabel: "Flushkeys",
    multiple: true,
    rowDoubleClick: false,
    alwaysAvailable: false,
    shouldExclude: (data) => {
      if (data?.length > 1) {
        return false;
      }
      return true;
    },
  },
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: true,
    rowDoubleClick: true,
  },
];
export const GetApiConfig = () => {
  const navigate = useNavigate();
  const { getEntries } = useContext(ClearCacheContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getDynamicApiList"], () => API.getDynamicApiList());

  const flush: any = useMutation("flushRediskey", API.flushRediskey, {
    onSuccess(data, variables) {
      if (variables?.FLAG !== "S") {
        CloseMessageBox();
        refetch();
      }
      enqueueSnackbar(data?.[0]?.MESSAGE, { variant: "success" });
    },
    onError() {
      CloseMessageBox();
    },
  });

  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getDynamicApiList"]);
    };
  }, [getEntries]);
  const ClosedEventCall = useCallback(() => {
    navigate(".");
  }, [navigate]);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "view-details") {
        navigate(data?.name, {
          state: data?.rows?.[0]?.data,
        });
      } else if (data.name === "flush") {
        let buttonName = await MessageBox({
          messageTitle: "confirmation",
          message: "AreYouSureFlushAllKeys",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
          defFocusBtnName: "Yes",
          loadingBtnName: ["Yes"],
        });
        if (buttonName === "Yes") {
          flush.mutate({ FLUSHALL: true, DYNAMIC_ACTION: [] });
        }
      } else if (data.name === "flushKeys") {
        let filterData = data?.rows.some((item) => item?.data?.CACHING !== "Y");

        let actionKeys = data?.rows.map((item) =>
          item?.data?.CACHING === "Y" ? item?.data?.ACTION : null
        );

        const messagebox = async (
          messageTitle,
          message,
          buttonNames,
          icon,
          defFocusBtnName
        ) => {
          let buttonName = await MessageBox({
            messageTitle: messageTitle,
            message: message,
            buttonNames: buttonNames,
            icon: icon,
            defFocusBtnName: defFocusBtnName,
            loadingBtnName: ["Yes"],
          });
          if (buttonName === "Yes") {
            flush.mutate({ FLUSHALL: false, DYNAMIC_ACTION: actionKeys });
          }
        };

        if (!filterData) {
          messagebox(
            "confirmation",
            `${t("AreYouSureFlushKeys")} ${actionKeys} `,
            ["Yes", "No"],
            "CONFIRM",
            "Yes"
          );
        } else {
          messagebox(
            "Alert",
            "PleaseSelectProperKeys",
            ["Ok"],
            "WARNING",
            "Ok"
          );
        }
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );
  return (
    <>
      {isError || flush?.isError ? (
        <AppBar position="relative" color="primary">
          <Alert
            severity="error"
            errorMsg={
              error?.error_msg ?? flush?.error?.error_msg ?? "Unknow Error"
            }
            errorDetail={
              error?.error_detail ?? flush?.error?.error_detail ?? ""
            }
            color="error"
          />
        </AppBar>
      ) : null}
      <GridWrapper
        key={"dynGridConfigGrid"}
        finalMetaData={getApiGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
      <Routes>
        <Route
          path="add/*"
          element={
            <GetApiForm
              refetch={refetch}
              closeDialog={ClosedEventCall}
              defaultView={"add"}
              flush={flush}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <GetApiForm
              closeDialog={ClosedEventCall}
              refetch={refetch}
              defaultView={"edit"}
              flush={flush}
            />
          }
        />
      </Routes>
    </>
  );
};
