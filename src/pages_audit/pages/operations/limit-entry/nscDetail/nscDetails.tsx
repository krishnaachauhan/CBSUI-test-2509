import React, { useCallback, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { getLimitNSCdetail } from "../api";
import { AppBar, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { nscDetailGridData } from "./nscDetailsGridMetadata";
import { Route, Routes, useNavigate } from "react-router-dom";
import { NSCFormDetail } from "./nscFormDetail/nscFormDetail";

import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

export const NscDetails = ({ navigate, myMasterRef }) => {
  const nscAction: ActionTypes[] = [
    {
      actionName: "nscFormDetail",
      actionLabel: "ViewDetail",
      multiple: false,
      rowDoubleClick: true,
    },
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];
  const { authState } = useContext(AuthContext);
  const navigateForm = useNavigate();
  const [isApiCall, setIsApiCall] = useState<any>({
    apiReq: {},
    isCall: false,
  });

  const { data, isError, error, isLoading, isFetching } = useQuery<any, any>(
    ["getNotificatioata"],
    () => getLimitNSCdetail({ ...isApiCall?.apiReq }),
    {
      enabled: isApiCall?.isCall,
      onSuccess() {
        isApiCall.isCall = false;
      },
    }
  );

  useEffect(() => {
    myMasterRef?.current?.getFieldData().then((res) => {
      if (res?.ACCT_CD && res?.ACCT_TYPE && res?.BRANCH_CD) {
        setIsApiCall({
          apiReq: {
            COMP_CD: authState?.companyID,
            ACCT_CD: res?.ACCT_CD,
            ACCT_TYPE: res?.ACCT_TYPE,
            BRANCH_CD: res?.BRANCH_CD,
          },
          isCall: true,
        });
      }
    });
  }, []);

  const { trackDialogClass } = useDialogContext();

  const setCurrentAction = useCallback(
    (data) => {
      if (data?.name === "nscFormDetail") {
        navigateForm(data?.name, {
          state: data?.rows,
        });
      } else if (data?.name === "close") {
        trackDialogClass("main");
        navigate(".");
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
      <Dialog
        open={true}
        className="nscDetail"
        PaperProps={{
          style: {
            maxWidth: "1385px",
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
            key={`nsc-Details-GridData`}
            finalMetaData={nscDetailGridData as GridMetaDataType}
            data={data ?? []}
            setData={() => {}}
            loading={isLoading || isFetching}
            actions={nscAction}
            setAction={setCurrentAction}
          />
          <Routes>
            <Route
              path="nscFormDetail"
              element={<NSCFormDetail navigate={navigateForm} />}
            />
          </Routes>
        </>
      </Dialog>
    </>
  );
};
