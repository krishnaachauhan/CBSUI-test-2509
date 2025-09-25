import React, { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { stoppedChequeDetailsdata } from "../api";
import { AppBar, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { stoppedChequeGridMetaData } from "./stoppedChequeMetaData";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";

export const StoppedChequeData = ({ navigate }) => {
  const action: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];
  const { state: apiReqData } = useLocation();
  const { data, isError, error, isLoading, isFetching } = useQuery<any, any>(
    ["stoppedChequeDetailsdata"],
    () =>
      stoppedChequeDetailsdata({
        ...apiReqData,
      }),
    {
      onSuccess() {},
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["stoppedChequeDetailsdata"]);
    };
  }, []);
  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            maxWidth: "850px",
            padding: "5px",
          },
        }}
      >
        <>
          {isError && (
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={error?.error_msg ?? "Unknow Error"}
                errorDetail={error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          )}
          <GridWrapper
            key={`stopped-GridData`}
            finalMetaData={stoppedChequeGridMetaData as GridMetaDataType}
            data={data ?? []}
            setData={() => {}}
            loading={isLoading || isFetching}
            actions={action}
            setAction={() => {
              navigate(".");
            }}
          />
        </>
      </Dialog>
    </>
  );
};
