import { Grid } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { ckyc_pending_req_meta_data } from "./metadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import FormModal from "./formModal/formModal";

import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { CkycContext } from "./CkycContext";
import { ClonedCkycContext } from "./formModal/formDetails/formComponents/legalComps/ClonedCkycContext";
const PendingCustomer = ({ isModal }) => {
  const { authState } = useContext(AuthContext);
  const { onDraftSavectx } = useContext(
    isModal ? ClonedCkycContext : CkycContext
  );
  const navigate = useNavigate();

  const routeLocation = useLocation();
  const path = routeLocation.pathname;
  const shouldHideMainUI = path.includes("view-detail");

  const {
    data: PendingData,
    isError: isPendingError,
    isLoading: isPendingDataLoading,
    isFetching: isPendingDataFetching,
    refetch: PendingRefetch,
    error: PendingError,
  } = useQuery<any, any>(["ckyc", "getPendingTabData"], () =>
    API.getPendingData({
      A_COMP_CD: authState?.companyID ?? "",
      A_BRANCH_CD: authState?.user?.branchCode ?? "",
      A_FLAG: "A",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["ckyc", "getPendingTabData"]);
    };
  }, []);

  const pendingActions: ActionTypes[] = [
    {
      actionName: "view-detail",
      actionLabel: "View Detail",
      multiple: false,
      rowDoubleClick: true,
    },
  ];

  const setCurrentAction = useCallback(
    (data) => {
      const draftFlag = data?.rows?.[0]?.data?.SAVE_FLAG ?? "";
      if (draftFlag === "D") {
        onDraftSavectx();
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  ckyc_pending_req_meta_data.gridConfig.gridLabel = "Customer Searching";
  ckyc_pending_req_meta_data.gridConfig["containerHeight"] = {
    min: "42vh",
    max: "calc(100vh - 300px)",
  };

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
        {!shouldHideMainUI && (
          <GridWrapper
            key={`PendingCustEntrties` + PendingData}
            finalMetaData={ckyc_pending_req_meta_data as GridMetaDataType}
            data={PendingData ?? []}
            setData={() => null}
            loading={isPendingDataLoading || isPendingDataFetching}
            actions={pendingActions}
            setAction={setCurrentAction}
            refetchData={() => PendingRefetch()}
            // ref={myGridRef}
          />
        )}
      </Grid>
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <FormModal
              onClose={() => navigate(".")}
              formmode={"view"}
              from={"pending-entry"}
            />
          }
        />
      </Routes>
    </Grid>
  );
};

export default PendingCustomer;
