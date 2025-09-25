import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { FDContext } from "./context/fdContext";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { IntPaidDtlGridMetaData } from "./intPaidDtlGridMetaData";
import { Dialog, Paper } from "@mui/material";
import {
  Alert,
  GridWrapper,
  queryClient,
  ActionTypes,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { cloneDeep } from "lodash";

// List of actions to be displayed as buttons in the header
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
];

export const IntPaidDtlGrid = ({ handleDialogClose }) => {
  const { t } = useTranslation();
  const { FDState } = useContext(FDContext);
  const { authState } = useContext(AuthContext);
  const { BRANCH_CD, ACCT_TYPE, ACCT_CD, ACCT_NM } =
    FDState?.retrieveFormData || {};

  // Function to handle actions when a button is clicked
  const setCurrentAction = useCallback((data) => {
    if (data?.name === "close") {
      handleDialogClose();
    }
  }, []);

  // API call to fetch INT Paid Detail data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getFDIntDetail"], () =>
    API.getFDIntDetail({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: BRANCH_CD ?? "",
      ACCT_TYPE: ACCT_TYPE ?? "",
      ACCT_CD: ACCT_CD ?? "",
    })
  );

  // Remove cached data for the API query to ensure fresh data is fetched
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFDIntDetail"]);
    };
  }, []);

  // Set the header title for the grid, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    const cloned = cloneDeep(IntPaidDtlGridMetaData);
    cloned.gridConfig.gridLabel = `Int Paid Detail of A/c No.: ${
      BRANCH_CD?.trim() ?? ""
    }-${ACCT_TYPE?.trim() ?? ""}-${ACCT_CD?.trim() ?? ""} ${
      ACCT_NM?.trim() ?? ""
    }`;
    return cloned;
  }, [BRANCH_CD, ACCT_TYPE, ACCT_CD]);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          width: "100%",
          padding: "8px",
        },
      }}
      maxWidth="xl"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleDialogClose();
        }
      }}
      className="fdCommDlg"
    >
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"IntPaidDtlGrid"}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        enableExport={true}
      />
    </Dialog>
  );
};
