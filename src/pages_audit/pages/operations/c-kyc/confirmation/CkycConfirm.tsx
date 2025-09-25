import { AuthContext } from "pages_audit/auth";
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useQuery } from "react-query";
import * as API from "../api";
import { format } from "date-fns";
import { ckyc_pending_req_meta_data } from "../metadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import FormModal from "../formModal/formModal";
import { Grid, Typography } from "@mui/material";
import { t } from "i18next";
import PhotoSignConfirmDialog from "../formModal/formDetails/formComponents/individualComps/PhotoSignConfirmDialog";
import { useSnackbar } from "notistack";
import UpdateDocument from "../formModal/formDetails/formComponents/update-document/Document";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import TDSSExemptionComp from "../TDSExemption2/TDSExemptionComp";
import { cloneDeep } from "lodash";
import CkycUpdAuditDetails from "./auditDetails/AuditUpdDetails";
import ConfirmRejectDialog from "../../acct-mst/ConfirmRejectDialog";
import { getdocCD } from "components/utilFunction/function";
import useCkycConfirmRejectHook from "./useCkycConfirmRejectHook";

export const CkycConfirm = () => {
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [rowsData, setRowsData] = useState<any[]>([]);
  const [auditData, setAuditData] = useState<any>({});
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const navigate = useNavigate();
  const location: any = useLocation();
  const { MessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const {
    data: PendingData,
    isError: isPendingError,
    isLoading: isPendingDataLoading,
    isFetching: isPendingDataFetching,
    refetch: PendingRefetch,
    error: PendingError,
  } = useQuery<any, any>(["ckyc", "getConfirmPendingData"], () =>
    API.getPendingData({
      A_COMP_CD: authState?.companyID ?? "",
      A_BRANCH_CD: authState?.user?.branchCode ?? "",
      A_FLAG: "P",
    })
  );
  const {
    isOpen,
    confirmAction,
    setIsOpen,
    setConfirmAction,
    confirmMutation,
    openActionDialog,
    state,
  } = useCkycConfirmRejectHook({ PendingRefetch, setOpenAuditDialog });

  const actions: ActionTypes[] = [
    {
      actionName: "view-detail",
      actionLabel: "View Detail",
      multiple: false,
      rowDoubleClick: true,
    },
  ];
  const setCurrentAction = useCallback(
    async (data) => {
      const maker = data.rows?.[0]?.data?.MAKER;
      const loggedinUser = authState?.user?.id;
      if (maker === loggedinUser) {
        let buttonName = await MessageBox({
          messageTitle: "InvalidConfirmation",
          message: "ConfirmRestrictMsg",
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
      } else {
        if (
          data.rows?.[0]?.data?.UPD_TAB_FLAG_NM === "P" ||
          data.rows?.[0]?.data?.UPD_TAB_FLAG_NM?.includes("P")
        ) {
          // P=EXISTING_PHOTO_MODIFY
          navigate("photo-signature", {
            state: data?.rows,
          });
        }
        if (
          data.rows?.[0]?.data?.UPD_TAB_FLAG_NM === "T" ||
          data.rows?.[0]?.data?.UPD_TAB_FLAG_NM?.includes("T")
        ) {
          // P=EXISTING_PHOTO_MODIFY
          navigate("tds-exemption", {
            state: data?.rows,
          });
        } else if (
          data.rows?.[0]?.data?.UPD_TAB_FLAG_NM === "D" ||
          data.rows?.[0]?.data?.UPD_TAB_FLAG_NM?.includes("D")
        ) {
          // D=EXISTING_DOC_MODIFY
          navigate("document", {
            state: { CUSTOMER_DATA: data?.rows },
          });
        } else if (
          data.rows?.[0]?.data?.UPD_TAB_NAME === "A" ||
          data.rows?.[0]?.data?.UPD_TAB_NAME?.includes("A") ||
          data.rows?.[0]?.data?.UPD_TAB_NAME === "M" ||
          data.rows?.[0]?.data?.UPD_TAB_NAME?.includes("M")
        ) {
          // A=FRESH_MODIFY, M=EXISTING_MODIFY
          navigate("view-detail", {
            state: data?.rows,
          });
        }
        //  else {
        //   setRowsData(data?.rows);
        //   navigate(data?.name, {
        //     state: data?.rows,
        //   });
        // }
      }
    },
    [navigate]
  );

  const gridMetadataUpdate = useMemo(() => {
    const clonedMeta = cloneDeep(ckyc_pending_req_meta_data);

    clonedMeta.gridConfig.gridLabel = "C-KYC Customer Confirmation (MST/710)";
    clonedMeta.gridConfig.containerHeight = {
      min: "42vh",
      max: "65vh",
    };

    clonedMeta.columns = [
      ...clonedMeta.columns,
      {
        columnName: "Updated Details",
        componentType: "buttonRowCell",
        accessor: "SIGN_PATH",
        sequence: 0,
        buttonLabel: "Update Details",
        isVisible: true,
        width: 120,
        minWidth: 150,
        maxWidth: 200,
        shouldExclude(value, original, optionalPara1, optionalPara2) {
          return (
            original?.REQ_FLAG === "F" ||
            original?.MAKER === authState?.user?.id
          );
        },
      },
    ];

    return clonedMeta;
  }, []);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["ckyc", "getConfirmPendingData"]);
    };
  }, []);

  return (
    <Grid sx={{ mx: "10px" }}>
      {isPendingError && (
        <Alert
          severity={PendingError?.severity ?? "error"}
          errorMsg={PendingError?.error_msg ?? "Something went to wrong.."}
          errorDetail={PendingError?.error_detail}
          color="error"
        />
      )}
      {!useLocation().pathname.includes("view-detail") && (
        <GridWrapper
          key={`ckycConfirmation`}
          finalMetaData={gridMetadataUpdate as GridMetaDataType}
          data={PendingData ?? []}
          setData={() => null}
          loading={isPendingDataLoading || isPendingDataFetching}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() => PendingRefetch()}
          onClickActionEvent={(index, id, data) => {
            setOpenAuditDialog(true);
            setAuditData(data);
          }}
          // ref={myGridRef}
        />
      )}
      {openAuditDialog ? (
        <CkycUpdAuditDetails
          rowsData={auditData}
          isopen={openAuditDialog}
          onClose={() => setOpenAuditDialog(false)}
          openActionDialog={openActionDialog}
          confirmMutation={confirmMutation}
        />
      ) : null}
      <ConfirmRejectDialog
        isOpen={isOpen}
        confirmAction={confirmAction}
        onActionNo={() => {
          setIsOpen(false);
          setConfirmAction(null);
        }}
        onActionYes={async (val, rows) => {
          confirmMutation.mutate({
            REQUEST_CD: state?.req_cd_ctx || auditData?.REQUEST_ID,
            REMARKS: val ?? "",
            CONFIRMED: confirmAction,
            REQ_FLAG: auditData?.REQ_FLAG ?? "",
            SCREEN_REF: docCD ?? "",
          });
        }}
        isLoading={confirmMutation.isLoading || confirmMutation.isFetching}
        authState={authState}
        row={rowsData}
        t={t}
      />
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <FormModal
              onClose={() => navigate(".")}
              formmode={"view"}
              from={"confirmation-entry"}
            />
          }
        />

        <Route
          path="photo-signature/*"
          element={
            <PhotoSignConfirmDialog
              open={true}
              onClose={() => {
                navigate(".");
              }}
              PendingRefetch={PendingRefetch}
            />
          }
        />

        <Route
          path="document/*"
          element={
            <UpdateDocument
              open={true}
              onClose={() => navigate(".")}
              viewMode={"view"}
              from={"ckyc-confirm"}
            />
          }
        />
        <Route
          path="tds-exemption/*"
          element={
            <TDSSExemptionComp
              open={true}
              onClose={() => {
                navigate(".");
              }}
              viewMode={"view"}
            />
          }
        />
      </Routes>
    </Grid>
  );
};
