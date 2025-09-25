import {
  ActionTypes,
  ClearCacheProvider,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { Fragment } from "react/jsx-runtime";
import * as API from "./api";
import { useQuery } from "react-query";

import { Dialog } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { useDataContext } from "./DataContext";
import { searchLockerNoGridMetadata } from "./gridMetadata/searchLockerNoGridMetadata";
import { useDialogContext } from "../payslip-issue-entry/DialogContext";

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
  {
    actionName: "close-dbl",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: false,
    rowDoubleClick: true,
  },
];

const ViewLockerNoGrid = ({ open, close, acctType }) => {
  const { authState } = useContext(AuthContext);
  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      close();
    } else if (data?.name === "close-dbl") {
      close(data?.rows[0]?.data?.LOCKER_NO);
    }
  }, []);

  const {
    data: lockerData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(["getLockerInfoOnF5"], () =>
    API.getLockerInfoOnF5({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: acctType ?? "",
    })
  );
  const { trackDialogClass } = useDialogContext();
  useEffect(() => {
    trackDialogClass("searchLockerNo");
    return () => {
      trackDialogClass("main");
    };
  });
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getLockerInfoOnF5"]);
    };
  }, []);

  return (
    <Fragment>
      <ClearCacheProvider>
        <Dialog
          open={open}
          className="searchLockerNo"
          id="draggable-dialog-title"
          aria-labelledby="draggable-dialog-title"
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              localStorage.removeItem("commonClass");
              close();
            }
          }}
        >
          <div id="draggable-dialog-title" style={{ cursor: "move" }}>
            <GridWrapper
              key={"modeMasterGrid"}
              finalMetaData={searchLockerNoGridMetadata as GridMetaDataType}
              data={lockerData ?? []}
              setData={() => null}
              actions={actions ?? []}
              loading={isLoading || isFetching}
              setAction={setCurrentAction}
              refetchData={() => refetch()}
              variant="contained"
            />
          </div>
        </Dialog>
      </ClearCacheProvider>
    </Fragment>
  );
};

export const SearchLockerNoData = ({ open, close, acctType }) => {
  return (
    <ClearCacheProvider>
      <ViewLockerNoGrid open={open} close={close} acctType={acctType} />
    </ClearCacheProvider>
  );
};
