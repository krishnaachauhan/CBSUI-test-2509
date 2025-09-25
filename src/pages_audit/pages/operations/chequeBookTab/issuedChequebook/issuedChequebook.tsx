import { AppBar, Dialog } from "@mui/material";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
import { issuedChequeBkDTL } from "../api";
import { issuedChequeBkGridMetaData } from "./issuedCheqBkMetadata";
import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
export const IssuedChequebook = ({ navigate }) => {
  const closeAction: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: true,
    },
  ];
  const { state: rows }: any = useLocation();

  // API calling function for Already Issued Chequebook
  const issuedChequeDTL = useQuery<any, any>(["issuedissuedChequeDTL"], () =>
    issuedChequeBkDTL({
      COMP_CD: rows?.COMP_CD,
      BRANCH_CD: rows?.BRANCH_CD,
      ACCT_TYPE: rows?.ACCT_TYPE,
      ACCT_CD: rows?.ACCT_CD,
      CHEQUE_FROM: rows?.CHEQUE_FROM,
      CHEQUE_TO: rows?.CHEQUE_TO,
      SR_CD: rows?.SR_CD,
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["issuedissuedChequeDTL"]);
    };
  }, []);

  useEffect(() => {
    if (rows) {
      issuedChequeBkGridMetaData.gridConfig.subGridLabel = `\u00A0\u00A0
      ${(
        rows?.COMP_CD +
        rows?.BRANCH_CD +
        rows?.ACCT_TYPE +
        rows?.ACCT_CD
      ).replace(/\s/g, "")}`;
    }
  }, [rows]);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1115px",
          padding: "5px",
        },
      }}
    >
      {issuedChequeDTL?.isError ? (
        <AppBar position="relative" color="primary">
          <Alert
            severity="error"
            errorMsg={issuedChequeDTL?.error?.error_msg ?? "Unknow Error"}
            errorDetail={issuedChequeDTL?.error?.error_detail ?? ""}
            color="error"
          />
        </AppBar>
      ) : null}
      <GridWrapper
        key={`issuedChequeDTLGrid`}
        finalMetaData={issuedChequeBkGridMetaData as GridMetaDataType}
        data={issuedChequeDTL?.data ?? []}
        setData={() => {}}
        loading={issuedChequeDTL?.isLoading}
        actions={closeAction}
        setAction={() => navigate(".")}
      />
    </Dialog>
  );
};
