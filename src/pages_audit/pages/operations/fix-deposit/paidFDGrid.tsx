import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PaidFDGridMetaData } from "./paidFDGridMetaData";
import { FDContext } from "./context/fdContext";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useQuery } from "react-query";
import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { Dialog, Paper } from "@mui/material";
import { FdPaymentAdvicePrint } from "../fixDepositConfirmation/form/fdPaymentAdvice";
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

export const PaidFDGrid = ({ handleDialogClose }) => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const { FDState } = useContext(FDContext);
  const [openPaymentAdvice, setOpenPaymentAdvice] = useState<boolean>(false);
  const requestDataRef = useRef<any>(null);
  const { BRANCH_CD, ACCT_TYPE, ACCT_CD, ACCT_NM } =
    FDState?.retrieveFormData || {};

  // Function to handle actions when a button is clicked
  const setCurrentAction = useCallback((data) => {
    if (data?.name === "close") {
      handleDialogClose();
    }
  }, []);

  // API call to fetch Paid FD data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getPaidFDViewDtl"], () =>
    API.getPaidFDViewDtl({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: BRANCH_CD ?? "",
      ACCT_TYPE: ACCT_TYPE ?? "",
      ACCT_CD: ACCT_CD ?? "",
      WORKING_DT: authState?.workingDate ?? "",
    })
  );

  // Remove cached data for the API query to ensure fresh data is fetched
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPaidFDViewDtl"]);
    };
  }, []);

  // Set the header title for the grid, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    const cloned = cloneDeep(PaidFDGridMetaData);
    cloned.gridConfig.gridLabel = `Paid FD Detail of A/c No.: ${
      BRANCH_CD?.trim() ?? ""
    }-${ACCT_TYPE?.trim() ?? ""}-${ACCT_CD?.trim() ?? ""} ${
      ACCT_NM?.trim() ?? ""
    }`;
    return cloned;
  }, [BRANCH_CD, ACCT_TYPE, ACCT_CD]);

  return (
    <>
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
          key={"PaidFDGrid"}
          finalMetaData={memoizedMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          actions={actions}
          loading={isLoading || isFetching}
          setAction={setCurrentAction}
          enableExport={true}
          refetchData={() => refetch()}
          onClickActionEvent={async (index, id, data) => {
            if (id === "VIEW_ADVICE") {
              requestDataRef.current = {
                COMP_CD: data?.COMP_CD ?? "",
                BRANCH_CD: data?.BRANCH_CD ?? "",
                ACCT_TYPE: data?.ACCT_TYPE ?? "",
                ACCT_CD: data?.ACCT_CD ?? "",
                FD_NO: data?.FD_NO ?? "",
              };
              setOpenPaymentAdvice(true);
            }
          }}
        />
      </Dialog>

      {/* Open the Payment Advice component when `openPaymentAdvice` is true */}
      {openPaymentAdvice && (
        <FdPaymentAdvicePrint
          closeDialog={() => setOpenPaymentAdvice(false)}
          requestData={{
            ...requestDataRef.current,
            A_FLAG: "P",
          }}
          setOpenAdvice={setOpenPaymentAdvice}
          screenFlag={"FDEntry"}
        />
      )}
    </>
  );
};
