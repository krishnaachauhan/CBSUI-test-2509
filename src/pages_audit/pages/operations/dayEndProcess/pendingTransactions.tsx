import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { ViewEodReport } from "./viewEodReport";
import {
  Alert,
  GridWrapper,
  usePopupContext,
  ActionTypes,
  queryClient,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import {
  pendingTrnsEodReportMetaData,
  pendingTrnsMetadata,
} from "./gridMetadata";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { cloneDeep } from "lodash";

type PendingTrnsState = {
  openReport: boolean;
  rowData: any[];
  docData: any;
  openedWindow: Window | null;
  currentData: any;
  uniqueReportData: any[];
};

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
];

export const PendinGTrns = ({ open, close }) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const navigate = useNavigate();

  const [state, setState] = useState<PendingTrnsState>({
    openReport: false,
    rowData: [],
    docData: {},
    openedWindow: null,
    currentData: {},
    uniqueReportData: [],
  });

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "close") {
        close();
      } else {
        navigate(data?.name, { state: data?.rows });
      }
    },
    [navigate, close]
  );

  const { data, isLoading, isFetching, isError, error } = useQuery<any, any>(
    ["getPendingTrns"],
    () =>
      API.getPendingTrns({
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        BASE_BRANCH: authState?.user?.baseBranchCode,
        TRAN_DT: authState?.workingDate,
      })
  );

  const docurlMutation = useMutation(API.getDocUrl, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: async (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setState((prev) => ({ ...prev, docData: data }));
        const url = `/EnfinityCore/${data[0]?.DOCUMENT_URL}`;
        const newWindow = window.open(url, "_blank");

        if (newWindow) {
          setState((prev) => ({ ...prev, openedWindow: newWindow }));
          newWindow.focus();
          queryClient.removeQueries(["getDocUrl"]);
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

  const reportMutation = useMutation(API.getpendingtrnReport, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: (data: any) => {
      setState((prev) => ({ ...prev, rowData: data }));
    },
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      const updatedReportData: any = data.map((item, index) => ({
        ...item,
        INDEX: `${index}`,
      }));
      setState((prev) => ({ ...prev, uniqueReportData: updatedReportData }));
    }
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["pendingtrns"]);
    };
  }, []);

  const finalMetaData = useMemo(() => {
    const clonedMeta = cloneDeep(pendingTrnsMetadata);
    clonedMeta.gridConfig.gridLabel = "";
    return clonedMeta;
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
        key={"pendingtrns"}
        finalMetaData={finalMetaData as GridMetaDataType}
        data={state.uniqueReportData}
        setData={() => null}
        actions={actions}
        onClickActionEvent={(index, id, currentData) => {
          if (id === "REPORT") {
            setState((prev) => ({ ...prev, currentData }));
            reportMutation.mutate({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              TRAN_DT: authState?.workingDate,
              VERSION: currentData?.VERSION,
              DOCU_CD: currentData?.DOCU_CD,
            });
            setState((prev) => ({ ...prev, openReport: true }));
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
        enableExport={true}
        setAction={setCurrentAction}
      />
      {state.openReport && (
        <ViewEodReport
          open={state.openReport}
          close={() => setState((prev) => ({ ...prev, openReport: false }))}
          metaData={pendingTrnsEodReportMetaData}
          reportData={state.rowData}
          reportLabel={`Pending Transaction for: ${authState?.workingDate} , Version :${state.currentData?.VERSION} ${state.currentData?.SCREEN_NM} `}
          loading={reportMutation.isLoading}
        />
      )}
      {docurlMutation.isLoading && (
        <Dialog
          open={open}
          PaperProps={{
            style: { width: "60%", overflow: "auto" },
          }}
          maxWidth="lg"
        >
          <LoaderPaperComponent />
        </Dialog>
      )}
    </>
  );
};
