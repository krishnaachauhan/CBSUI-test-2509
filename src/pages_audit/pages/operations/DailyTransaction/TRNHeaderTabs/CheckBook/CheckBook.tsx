import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import { ChequebookDtlGridMetaData } from "pages_audit/pages/operations/chequeBookTab/chequebookDetailMetadata";
import { ChequeDtlGrid } from "pages_audit/pages/operations/chequeBookTab/chequeDetail/chequeDetail";
import ChequeReturnHistoryGrid from "pages_audit/pages/operations/chequeBookTab/chequeReturnHistory/chequeReturnHistory";
import TodaysClearingGrid from "pages_audit/pages/operations/chequeBookTab/TodaysClearing/todaysClearingGrid";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import * as API from "./api";

const chequeActions: ActionTypes[] = [
  {
    actionName: "ViewDetails",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "todayClearing",
    actionLabel: "TodaysClearing",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "chequeReturnHistory",
    actionLabel: "ChequeReturnHistory",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const CheckBook = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const [chequebookIssueDtlOpen, setChequebookIssueDtlOpen] = useState(false);
  const [chequeReturnHistoryOpen, setChequebookReturnHistoryOpen] =
    useState(false);
  const [todayClearingOpen, setTodayClearingOpen] = useState(false);
  const [chequeDtlPara, seChequeDtlPara] = useState({});
  const hasRequiredFields = useRef<any>(false);
  hasRequiredFields.current = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getChequebookEntryList", { reqData }],
    () =>
      API.getChequebookDTL({
        COMP_CD: authState?.companyID ?? "",
        ACCT_CD: reqData?.ACCT_CD ?? "",
        ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
        BRANCH_CD: reqData?.BRANCH_CD ?? "",
      }),
    {
      enabled: Boolean(hasRequiredFields?.current),
    }
  );
  const handleRefetch = () => {
    if (hasRequiredFields?.current) {
      refetch();
    }
  };

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(ChequebookDtlGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = {
        min: "23.7vh",
        max: "23.7vh",
      };
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "Cheques";
      metadata.gridConfig.subGridLabel = "";
    }

    if (metadata?.columns) {
      metadata.columns = metadata?.columns?.map((column) => {
        if (column?.componentType === "buttonRowCell") {
          return {
            ...column,
            isVisible: false,
          };
        }
        if (column?.accessor === "REMARKS") {
          return {
            ...column,
            showTooltip: true,
          };
        }
        return column;
      });
    }
    return metadata;
  }, [data]);
  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "ViewDetails") {
        setChequebookIssueDtlOpen(true);
        seChequeDtlPara(data?.rows);
      } else if (data?.name === "todayClearing") {
        if (hasRequiredFields?.current) {
          setTodayClearingOpen(true);
        }
      } else if (data?.name === "chequeReturnHistory") {
        if (hasRequiredFields?.current) {
          setChequebookReturnHistoryOpen(true);
        }
      }
    },
    [reqData]
  );

  return (
    <>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`chequebookIssuedDetailForTrn`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        loading={isLoading || isFetching}
        setData={() => {}}
        actions={chequeActions}
        setAction={setCurrentAction}
        refetchData={handleRefetch}
        enableExport={true}
      />

      {chequebookIssueDtlOpen ? (
        <ChequeDtlGrid
          setChequebookIssueDtlOpen={setChequebookIssueDtlOpen}
          reqDataFromFlag={chequeDtlPara}
          screenFlag={"chequesDtlForTrn"}
        />
      ) : null}

      {chequeReturnHistoryOpen ? (
        <Dialog
          open={chequeReturnHistoryOpen}
          onKeyUp={(event) => {
            if (event.key === "Escape") setChequebookReturnHistoryOpen(false);
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <ChequeReturnHistoryGrid
            setChequebookReturnHistoryOpen={setChequebookReturnHistoryOpen}
            reqData={reqData}
          />
        </Dialog>
      ) : null}
      {todayClearingOpen ? (
        <Dialog
          open={todayClearingOpen}
          onKeyUp={(event) => {
            if (event.key === "Escape") setTodayClearingOpen(false);
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <TodaysClearingGrid
            setTodayClearingOpen={setTodayClearingOpen}
            reqData={reqData}
          />
        </Dialog>
      ) : null}
    </>
  );
};
