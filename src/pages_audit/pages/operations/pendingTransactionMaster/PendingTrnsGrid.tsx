import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  GridWrapper,
  usePopupContext,
  ActionTypes,
  queryClient,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { ViewEodReport } from "../dayEndProcess/viewEodReport";
import {
  getDocUrl,
  getpendingtrnReport,
  getPendingTrns,
} from "../dayEndProcess/api";
import {
  pendingTrnsEodReportMetaData,
  pendingTrnsMetadata,
} from "../dayEndProcess/gridMetadata";
import { format } from "date-fns";

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    alwaysAvailable: true,
    multiple: undefined,
  },
];

export const PendinGTransactionsGridWrapper = () => {
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();
  const navigate = useNavigate();

  const [uiState, setUiState] = useState({
    openReport: false,
    rowData: [] as any[],
    currentData: {} as any,
  });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getPendingTrns"], () =>
    getPendingTrns({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      BASE_BRANCH: authState?.user?.baseBranchCode,
      TRAN_DT: authState?.workingDate,
    })
  );

  const docurlMutation = useMutation(getDocUrl, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: async (data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        const url = `/EnfinityCore/${data[0]?.DOCUMENT_URL}`;
        const newWindow = window.open(url, "_blank");
        if (newWindow) {
          newWindow.focus();
          queryClient.removeQueries("getPendingTrns");
        }
      } else {
        await MessageBox({
          message: "screenNotFoundMsg",
          messageTitle: "Error",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      }
    },
  });

  const reportMutation = useMutation(getpendingtrnReport, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: (data: any) => {
      setUiState((prev) => ({ ...prev, rowData: data }));
    },
  });

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "close") {
        navigate("../dayend-process");
      } else {
        navigate(data?.name, { state: data?.rows });
      }
    },
    [navigate]
  );

  // transform report data
  const uniqueReportData = useMemo(
    () =>
      Array.isArray(data)
        ? data.map((item, index) => ({ ...item, INDEX: `${index}` }))
        : [],
    [data]
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPendingTrns"]);
    };
  }, []);

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went wrong"}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}

      <GridWrapper
        key={"getPendingTrns"}
        finalMetaData={pendingTrnsMetadata as GridMetaDataType}
        data={uniqueReportData}
        setData={() => {}}
        actions={rows?.BACK_FROM === "DAY_END" ? actions : []}
        onClickActionEvent={(_, id, currentData) => {
          if (id === "REPORT") {
            setUiState((prev) => ({ ...prev, currentData, openReport: true }));
            reportMutation.mutate({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              TRAN_DT: authState?.workingDate,
              VERSION: currentData?.VERSION,
              DOCU_CD: currentData?.DOCU_CD,
            });
          }
          if (id === "OPEN") {
            docurlMutation.mutate({
              BASE_COMP: authState?.baseCompanyID,
              BASE_BRANCH: authState?.user?.baseBranchCode,
              DOC_CD: currentData?.DOCU_CD,
            });
          }
        }}
        loading={isLoading || isFetching}
        enableExport
        setAction={setCurrentAction}
        refetchData={refetch}
      />

      {uiState.openReport && (
        <ViewEodReport
          open={uiState.openReport}
          close={() => setUiState((prev) => ({ ...prev, openReport: false }))}
          metaData={pendingTrnsEodReportMetaData}
          reportData={uiState.rowData}
          reportLabel={`Pending Transaction for: ${format(
            new Date(authState?.workingDate),
            "dd/MM/yyyy"
          )} , Version :${uiState.currentData?.VERSION} ${
            uiState.currentData?.SCREEN_NM
          }`}
          loading={reportMutation.isLoading}
        />
      )}

      {docurlMutation.isLoading && (
        <Dialog
          open
          PaperProps={{ style: { width: "60%", overflow: "auto" } }}
          maxWidth="lg"
        >
          <LoaderPaperComponent />
        </Dialog>
      )}
    </>
  );
};
