import { AuthContext } from "pages_audit/auth";
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { pendingAcctMetadata } from "./metadata/pendingAcctMetadata";
import {
  ActionTypes,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AcctModal from "./AcctModal";
import { Grid } from "@mui/material";
import { useSnackbar } from "notistack";

import { Alert, GridMetaDataType, GridWrapper } from "@acuteinfo/common-base";
import UpdateAuditDetail from "./tabMetadata/AuditUpdateDetail";
import { AcctMSTContext } from "./AcctMSTContext";
import ConfirmRejectDialog from "./ConfirmRejectDialog";
import useConfirmRejectDialog from "./useConfirmRejectDialog";
import { t } from "i18next";

const AcctConfirm = () => {
  const { AcctMSTState } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const [rowsData, setRowsData] = useState<any[]>([]);
  const navigate = useNavigate();
  const location: any = useLocation();
  const { MessageBox } = usePopupContext();
  const [openDilogue, setOpenDilogue] = useState(false);
  const [auditData, setAuditData] = useState<any>({});
  const routeLocation = useLocation();
  const path = routeLocation.pathname;
  const shouldHideMainUI = path.includes("view-detail");

  const {
    data: PendingAcct,
    isError: isPendingError,
    isLoading: isPendingAcctLoading,
    isFetching: isPendingAcctFetching,
    refetch: PendingRefetch,
    error: PendingError,
  } = useQuery<any, any>(
    ["getConfirmPendingData", authState?.user?.branchCode],
    () =>
      API.getPendingAcct({
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
  } = useConfirmRejectDialog({ rowsData, setOpenDilogue, PendingRefetch });

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getConfirmPendingData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const actions: ActionTypes[] = [
    {
      actionName: "view-detail",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
    },
    // {
    //   actionName: "inactive-customer",
    //   actionLabel: "Inactivate Customer",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
  ];
  const setCurrentAction = useCallback(
    async (data) => {
      const maker = data.rows?.[0]?.data?.MAKER;
      const loggedinUser = authState?.user?.id;
      if (maker === loggedinUser) {
        let buttonName = await MessageBox({
          messageTitle: "InvalidConfirmation",
          message: "YouCanNotConfirmAccountModifiedByYourself",
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
      } else {
        if (data.rows?.[0]?.data?.UPD_TAB_NAME === "EXISTING_PHOTO_MODIFY") {
          navigate("photo-signature", {
            state: data?.rows,
          });
        } else if (data.rows?.[0]?.data?.UPD_TAB_NAME === "FRESH_MODIFY") {
          navigate("view-detail", {
            state: {
              rows: data?.rows ?? [{ data: null }],
              formmode: "view",
              from: "confirmation-entry",
            },
          });
        } else {
          setRowsData(data?.rows);
          navigate(data?.name, {
            state: {
              rows: data?.rows ?? [{ data: null }],
              formmode: "view",
              from: "confirmation-entry",
            },
          });
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    PendingRefetch();
  }, [location]);

  pendingAcctMetadata.gridConfig["containerHeight"] = {
    min: "60vh",
    max: "calc(100vh - 200px)",
  };
  const gridMetadataUpdate = useMemo(() => {
    return {
      ...pendingAcctMetadata,
      columns: [
        ...pendingAcctMetadata.columns,
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
      ],
    };
  }, []);
  return (
    <>
      <Grid sx={{ mx: "10px" }}>
        {isPendingError && (
          <Alert
            severity={PendingError?.severity ?? "error"}
            errorMsg={PendingError?.error_msg ?? "Something went to wrong.."}
            errorDetail={PendingError?.error_detail}
            color="error"
          />
        )}
        {/* <Typography
          sx={{
            color: (theme) => theme.palette.grey[700],
            mb: (theme) => theme.spacing(2),
            }}
            variant="h5"
            >
            {t("Confirmation Pending")}
            </Typography> */}
        {!shouldHideMainUI && (
          <GridWrapper
            key={`ckycConfirmation` + PendingAcct}
            finalMetaData={gridMetadataUpdate as GridMetaDataType}
            data={PendingAcct ?? []}
            setData={() => null}
            loading={isPendingAcctLoading || isPendingAcctFetching}
            actions={actions}
            setAction={setCurrentAction}
            refetchData={() => PendingRefetch()}
            onClickActionEvent={(index, id, data) => {
              setOpenDilogue(true);
              setAuditData(data);
            }}
            // ref={myGridRef}
          />
        )}
        {openDilogue ? (
          <UpdateAuditDetail
            rowsData={auditData}
            isopen={openDilogue}
            onClose={() => setOpenDilogue(false)}
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
            await confirmMutation.mutate({
              REQUEST_CD: AcctMSTState?.req_cd_ctx || auditData?.REQUEST_ID,
              REMARKS: val ?? "",
              CONFIRMED: confirmAction,
            });
          }}
          isLoading={confirmMutation.isLoading || confirmMutation.isFetching}
          authState={authState}
          row={auditData}
          t={t}
        />
        <Routes>
          <Route
            path="view-detail/*"
            element={
              <AcctModal
                onClose={() => navigate(".")}
                isCallFinalSaveRef={null}
                asDialog={false}
              />
            }
          />

          {/* <Route
            path="photo-signature/*"
            element={
              <PhotoSignConfirmDialog
                open={true}
                onClose={() => {
                  navigate(".");
                }}
              />
            }
          /> */}
        </Routes>
      </Grid>
    </>
  );
};

export default AcctConfirm;
