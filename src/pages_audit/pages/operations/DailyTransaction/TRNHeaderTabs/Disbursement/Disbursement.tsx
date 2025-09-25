import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { cloneDeep } from "lodash";
import { LoanScheduleGridMetaData } from "pages_audit/pages/operations/loanSchedule/gridMetadata";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import * as API from "./api";
import DetailDisbursement from "./DetailDisbursement";
import { AuthContext } from "pages_audit/auth";

const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

const enhanceColumns = (columns) => {
  const newColumns = [
    {
      accessor: "RATE_WEF",
      columnName: "EffectiveDate",
      sequence: 2,
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      alignment: "center",
      width: 140,
      minWidth: 140,
      maxWidth: 250,
    },
    {
      accessor: "INT_RATE",
      columnName: "IntRate",
      sequence: 8,
      componentType: "default",
      alignment: "right",
      width: 95,
      minWidth: 60,
      maxWidth: 120,
    },
    {
      accessor: "ENTERED_DATE",
      columnName: "EnteredDate",
      sequence: 9,
      componentType: "date",
      dateFormat: "dd/MM/yyyy HH:mm:ss a",
      alignment: "center",
      width: 170,
      minWidth: 140,
      maxWidth: 250,
    },
  ];
  newColumns?.forEach((col) => {
    if (
      !columns?.some((existingCol) => existingCol?.accessor === col?.accessor)
    ) {
      columns?.push(col);
    }
  });
  return columns;
};

export const Disbursement = ({ reqData }) => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const [rowDetails, setRowDetails] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getDisbursementList", { reqData }],
    () => API.getDisbursementList(reqData),
    {
      enabled: hasRequiredFields,
    }
  );
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(LoanScheduleGridMetaData);
    metadata.columns = enhanceColumns(metadata?.columns);
    metadata.gridConfig = {
      ...metadata?.gridConfig,
      containerHeight: { min: "21.4vh", max: "21.4vh" },
      footerNote: t("DisbursementFooterNote"),
      gridLabel: reqData?.TAB_DISPL_NAME ?? "disbursementDetails",
      enablePagination: true,
      hideFooter: false,
      pageSizes: [20, 30, 50],
      defaultPageSize: 20,
    };
    return metadata;
  }, [data]);

  const handleClose = () => {
    setOpenDetail(false);
  };

  const setCurrentAction = useCallback((action) => {
    if (action.name === "view-details") {
      setRowDetails(action.rows?.[0]?.data);
      setOpenDetail(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getDisbursementList",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  return (
    <Fragment>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key="DisbursementGrid"
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={handleRefetch}
        actions={actions}
        setAction={setCurrentAction}
        enableExport={true}
      />
      <Dialog
        open={openDetail}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        onKeyUp={(e) => e.key === "Escape" && handleClose()}
        maxWidth="lg"
      >
        <DetailDisbursement
          rowData={rowDetails}
          setOpenDetail={setOpenDetail}
        />
      </Dialog>
    </Fragment>
  );
};
