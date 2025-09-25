import React, { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { AppBar, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { viewChangesData } from "../../api";
import { useLocation } from "react-router-dom";
import { viewChangesGridMetadata } from "./viewChangesMetadata";

export const ViewChanges = ({ navigate }) => {
  const fdAction: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();

  // APIu calling for view details of chnages in ATM and IMPS confirmation
  const { data, isError, error, isLoading, isFetching } = useQuery<any, any>(
    ["viewChangesData"],
    () =>
      viewChangesData({
        COMP_CD: rows?.COMP_CD,
        BRANCH_CD: rows?.BRANCH_CD,
        TRAN_CD: rows?.TRAN_CD,
        WORKING_DATE: authState?.workingDate,
        DOC_CD: rows?.DOC_CD,
      }),
    {
      retry: false,
      enabled: !!rows?.TRAN_CD,
      onSuccess(data) {
        if (!data?.length) {
          async function viewChangesMsg() {
            let buttonName = await MessageBox({
              messageTitle: "NoDataFound",
              message: "NoRecordFound",
              defFocusBtnName: "Ok",
              icon: "WARNING",
            });
            if (buttonName === "Ok") {
              navigate(".");
            }
          }
          viewChangesMsg();
        }
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["viewChangesData"]);
    };
  }, []);
  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1095px",
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
          key={`view-changes-cfm`}
          finalMetaData={viewChangesGridMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => {}}
          loading={isLoading || isFetching}
          actions={fdAction}
          setAction={() => {
            navigate(".");
          }}
        />
      </>
    </Dialog>
  );
};
