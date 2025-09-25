import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Grid } from "@mui/material";
import { useQuery } from "react-query";
import { Route, Routes, useNavigate } from "react-router-dom";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { pendingAcctMetadata } from "./metadata/pendingAcctMetadata";
import { format } from "date-fns";
import AcctModal from "./AcctModal";

import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { AcctMSTContext } from "./AcctMSTContext";
const pendingActions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
];
const PendingAcct = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const { handleFromFormModectx } = useContext(AcctMSTContext);
  const isCallFinalSaveRef = useRef<boolean>(false);
  const {
    data: PendingAcct,
    isError: isPendingError,
    isLoading: isPendingAcctLoading,
    isFetching: isPendingAcctFetching,
    refetch: PendingRefetch,
    error: PendingError,
  } = useQuery<any, any>(
    ["acct-mst", "getPendingTabData", authState?.user?.branchCode],
    () =>
      API.getPendingAcct({
        A_COMP_CD: authState?.companyID ?? "",
        A_BRANCH_CD: authState?.user?.branchCode ?? "",
        A_FLAG: "A",
      })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getPendingData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const setCurrentAction = useCallback(
    (data) => {
      const confirmed = data?.rows?.[0]?.data?.CONFIRMED ?? "";
      const maker = data?.rows?.[0]?.data?.MAKER ?? "";
      const loggedinUser = authState?.user?.id;
      let formmode = "edit";
      if (Boolean(confirmed)) {
        if (confirmed.includes("P")) {
          if (maker === loggedinUser) {
            handleFromFormModectx({ formmode: "edit" });
          } else {
            formmode = "view";
            handleFromFormModectx({ formmode: "view" });
          }
        } else if (confirmed.includes("M")) {
        } else {
          formmode = "view";
        }
      }
      if (data.rows?.[0]?.data?.UPD_TAB_NAME === "EXISTING_PHOTO_MODIFY") {
        navigate("photo-signature", {
          state: data?.rows,
        });
      } else {
        // setRowsData(data?.rows);
        navigate(data?.name, {
          state: {
            rows: data?.rows ?? [{ data: null }],
            formmode: formmode,
            from: "pending-entry",
          },
        });
      }
    },
    [navigate]
  );
  const gridMetadataUpdate = useMemo(() => {
    return {
      ...pendingAcctMetadata,
      gridConfig: {
        ...pendingAcctMetadata?.gridConfig,
        gridLabel: "PendingAccounts",
      },
    };
  }, []);

  const handleDialogClose = useCallback(() => {
    navigate(".");
    if (isCallFinalSaveRef.current === true) {
      PendingRefetch();
      isCallFinalSaveRef.current = false;
    }
  }, [navigate]);

  return (
    <Grid>
      {isPendingError && (
        <Alert
          severity={PendingError?.severity ?? "error"}
          errorMsg={PendingError?.error_msg ?? "Something went to wrong.."}
          errorDetail={PendingError?.error_detail}
          color="error"
        />
      )}
      <Grid item>
        <GridWrapper
          key={`PendingAcctEntrties` + PendingAcct}
          finalMetaData={gridMetadataUpdate as GridMetaDataType}
          data={PendingAcct ?? []}
          setData={() => null}
          loading={isPendingAcctLoading || isPendingAcctFetching}
          actions={pendingActions}
          setAction={setCurrentAction}
          refetchData={() => PendingRefetch()}
          // ref={myGridRef}
        />
      </Grid>
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <AcctModal
              onClose={handleDialogClose}
              isCallFinalSaveRef={isCallFinalSaveRef}
              asDialog={false}
            />
          }
        />
        {/* <Route
          path="photo-signature/*"
          element={
              <PhotoSignatureCpyDialog
              open={true}
              onClose={() => {
                  navigate(".");
              }}
              viewMode={formMode ?? "edit"}
              />
          }
          /> */}
      </Routes>
    </Grid>
  );
};

export default PendingAcct;
