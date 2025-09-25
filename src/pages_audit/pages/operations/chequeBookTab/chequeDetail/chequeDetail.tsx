import { AppBar, Dialog, Paper } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ChequeDtlGridMetaData } from "./chequeDetailGridMetadata";
import { useQuery } from "react-query";
import { chequeGridDTL } from "../api";
import Draggable from "react-draggable";

import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { cloneDeep } from "lodash";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

type ChequebookIssuedDtlCustomProps = {
  navigate?: any;
  setChequebookIssueDtlOpen?: any;
  screenFlag?: any;
  reqDataFromFlag?: any;
};

export const ChequeDtlGrid: React.FC<ChequebookIssuedDtlCustomProps> = ({
  navigate,
  setChequebookIssueDtlOpen,
  screenFlag,
  reqDataFromFlag,
}) => {
  const closeAction: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];
  const { state: rows }: any = useLocation();
  const { trackDialogClass } = useDialogContext();
  const chequeDTL = useQuery<any, any>(["chequeDTL"], () =>
    chequeGridDTL({
      BRANCH_CD: reqDataFromFlag
        ? reqDataFromFlag?.[0]?.data?.BRANCH_CD
        : rows?.[0]?.data?.BRANCH_CD ?? "",
      ACCT_TYPE: reqDataFromFlag
        ? reqDataFromFlag?.[0]?.data?.ACCT_TYPE
        : rows?.[0]?.data?.ACCT_TYPE ?? "",
      ACCT_CD: reqDataFromFlag
        ? reqDataFromFlag?.[0]?.data?.ACCT_CD
        : rows?.[0]?.data?.ACCT_CD ?? "",
      CHEQUE_FROM: reqDataFromFlag
        ? reqDataFromFlag?.[0]?.data?.CHEQUE_FROM
        : rows?.[0]?.data?.CHEQUE_FROM ?? "",
      CHEQUE_TO: reqDataFromFlag
        ? reqDataFromFlag?.[0]?.data?.CHEQUE_TO
        : rows?.[0]?.data?.CHEQUE_TO ?? "",
      SR_CD: reqDataFromFlag
        ? reqDataFromFlag?.[0]?.data?.SR_CD
        : rows?.[0]?.data?.SR_CD ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["chequeDTL"]);
    };
  }, []);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          if (screenFlag === "chequesDtlForTrn") {
            setChequebookIssueDtlOpen(false);
          } else {
            navigate(".");
          }
          trackDialogClass("main");
        }
      }}
      PaperProps={{
        style: {
          maxWidth: "905px",
          padding: "5px",
        },
      }}
      PaperComponent={(props) => (
        <Draggable
          handle="#draggable-dialog-title"
          cancel={'[class*="MuiDialogContent-root"]'}
        >
          <Paper {...props} />
        </Draggable>
      )}
    >
      <div id="draggable-dialog-title">
        {chequeDTL?.isError ? (
          <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={chequeDTL?.error?.error_msg ?? "Unknow Error"}
                errorDetail={chequeDTL?.error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          </div>
        ) : null}
        <div className="proccedCheque">
          <GridWrapper
            key={`ChequeDtlGrid`}
            finalMetaData={ChequeDtlGridMetaData as GridMetaDataType}
            data={chequeDTL?.data ?? []}
            setData={() => {}}
            loading={chequeDTL?.isLoading}
            actions={closeAction}
            setAction={(data) => {
              if (screenFlag === "chequesDtlForTrn") {
                setChequebookIssueDtlOpen(false);
                trackDialogClass("main");
              } else if (data.name === "close") {
                navigate(".");
                trackDialogClass("main");
              }
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};
