import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { format } from "date-fns";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import { DetailInsuranceGridMetaData } from "pages_audit/pages/operations/insuranceEntry/insuranceEntryMetadata";
import { Fragment, useCallback, useContext, useMemo, useState } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { InsuranceDetails } from "./InsuranceDetails";
const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

export const Insurance = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const [openDetail, setOpenDetail] = useState(false);
  const [rowDetails, setRowDetails] = useState([]);

  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getInsuranceList", { reqData }],
    () =>
      API.getInsuranceList({
        ...reqData,
        A_GD_DATE: authState?.workingDate,
        USER_LEVEL: authState?.role,
      }),
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
    const enhanceColumns = (columns) => {
      const newColumn = {
        accessor: "EARLIEST_DUE_DT",
        columnName: "",
        sequence: 2,
        componentType: "date",
        dateFormat: "dd/MM/yyyy",
        isVisible: false,
      };
      if (!columns.some((col) => col?.accessor === newColumn?.accessor)) {
        columns.push(newColumn);
      }
      return columns;
    };

    const updateColumn = (column) => {
      if (column?.componentType === "buttonRowCell") {
        return { ...column, isVisible: false };
      }
      if (column?.accessor === "INSURANCE_DATE") {
        return {
          ...column,
          isTotalWithCurrency: true,
          footerLabel: "Earliest Due date:",
          setFooterValue: () => [""],
        };
      }
      if (
        column?.accessor === "DESCRIPTION" ||
        column?.accessor === "INS_DESCRIPTION"
      ) {
        return {
          ...column,
          showTooltip: true,
        };
      }
      if (
        column?.accessor === "SEC" ||
        column?.accessor === "CONFIRMED" ||
        column?.accessor === "CM_RENEW"
      ) {
        return {
          ...column,
          isVisible: false,
        };
      }
      if (column?.accessor === "DUE_DATE") {
        return {
          ...column,
          footerIsMultivalue: true,
          isTotalWithCurrency: true,
          footerLabel: "{0}",
          setFooterValue: (_, rows) => {
            const validDates = rows
              ?.map(
                (item) =>
                  item?.values?.EARLIEST_DUE_DT &&
                  new Date(item?.values?.EARLIEST_DUE_DT)
              )
              .filter((date) => date && !isNaN(date?.getTime()));
            const earliestDueDate =
              validDates?.length > 0
                ? format(
                    new Date(
                      Math.max(...validDates?.map((date) => date?.getTime()))
                    ),
                    "dd/MM/yyyy"
                  )
                : "";
            return [earliestDueDate || ""];
          },
        };
      }
      return column;
    };

    const metadata = cloneDeep(DetailInsuranceGridMetaData);
    metadata.columns = enhanceColumns(metadata?.columns || []).map(
      updateColumn
    );

    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = { min: "23.7vh", max: "23.7vh" };
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "Insurance";
    }

    return metadata;
  }, [data]);
  const handleClose = () => {
    setOpenDetail(false);
  };

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "view-detail") {
      setRowDetails(data?.rows?.[0]?.data);
      setOpenDetail(true);
    }
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
        key={`InsuranceGridMetaData`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={handleRefetch}
        enableExport={true}
        actions={actions}
        setAction={setCurrentAction}
      />

      <Dialog
        open={openDetail}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        onKeyUp={(e) => e.key === "Escape" && handleClose()}
        maxWidth="lg"
      >
        <InsuranceDetails rowData={rowDetails} setOpenDetail={setOpenDetail} />
      </Dialog>
    </Fragment>
  );
};
