import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import SiExecuteDetailView from "pages_audit/pages/operations/standingInstruction/siExecuteDetailView";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { SIDetailGridMetaData } from "./gridMetadata";

const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetail",
    multiple: undefined,
    rowDoubleClick: true,
    alwaysAvailable: false,
  },
  {
    actionName: "view-All",
    actionLabel: "ViewAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const SIDetail = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rows, setRows] = useState<any>({});
  const viewAllRef = useRef<any>([]);
  const [gridData, setGridData] = useState([]);

  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getSIDetailList", { reqData }], () => API.getSIDetailList(reqData), {
    enabled: hasRequiredFields,
  });
  useEffect(() => {
    viewAllRef.current = data;
    setGridData(data?.filter((item: any) => Boolean(item?.DOC_STATUS)));
  }, [data?.length]);
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
      viewAllRef.current = data;
      setGridData(data?.filter((item: any) => Boolean(item?.DOC_STATUS)));
    }
  };

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "view-details") {
      setRows(data?.rows?.[0]?.data);
      setDetailsOpen(true);
    }
    if (data?.name === "view-All") {
      setGridData(viewAllRef.current);
    }
  }, []);

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(SIDetailGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.gridLabel =
        reqData?.TAB_DISPL_NAME ?? "StandingInstructionDetail";
    }
    return metadata;
  }, [data?.length]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getSIDetailList",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

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
        key={`SIDetailGridMetaData ${gridData?.length}`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        loading={isLoading || isFetching}
        data={gridData ?? []}
        setData={() => null}
        refetchData={handleRefetch}
        actions={actions}
        setAction={setCurrentAction}
        enableExport={true}
      />

      <SiExecuteDetailView
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        lineId={rows?.LINE_ID ?? ""}
        srCd={rows?.SR_CD ?? ""}
        tran_cd={rows?.TRAN_CD ?? ""}
        branch_cd={rows?.ENT_BRANCH_CD ?? ""}
        screenFlag={"SIDTL_TRN"}
      />
    </>
  );
};
