import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FDContext } from "./context/fdContext";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  LoaderPaperComponent,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { Dialog } from "@mui/material";
import { SchemeSelectionGridMetaData } from "./schemeSelGridMetadata";
import { FixDepositForm } from "./fixDepositForm/fdStepperForm";
import { useDialogContext } from "../payslip-issue-entry/DialogContext";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { cloneDeep } from "lodash";

// List of actions to be displayed as buttons in the header
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
  {
    actionName: "new-entry",
    actionLabel: "New Entry",
    multiple: undefined,
    rowDoubleClick: true,
  },
];

export const SchemeSelectionGrid = ({
  handleDialogClose,
  isDataChangedRef,
}) => {
  const { t } = useTranslation();
  const {
    FDState,
    updateSchemeSelecRowData,
    updateIniDtlFormDataNewFD,
    updateInitialRenData,
  } = useContext(FDContext);
  const { authState } = useContext(AuthContext);
  const [openNewFdForScheme, setOpenNewFdForScheme] = useState<boolean>(false);
  const { trackDialogClass } = useDialogContext();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);

  // API call to fetch FD Scheme Selection data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getFDDoubleScheme"], () =>
    API.getFDDoubleScheme({
      COMP_CD: authState?.baseCompanyID ?? "",
      BRANCH_CD: authState?.user?.baseBranchCode ?? "",
      DOUBLE_TRAN_CD: FDState?.fdParaDetailData?.DOUBLE_TRAN ?? "",
      CATEG_CD: FDState?.acctNoData?.CATEG_CD ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
    })
  );

  const getFDParaDetailMutation: any = useMutation(
    "getFDParaDetails",
    API.getFDParaDetails,
    {
      onError: () => {},
      onSuccess: () => {},
    }
  );

  const getFDMatDtForSchemeMutation: any = useMutation(
    "getFDMaturityDtForScheme",
    API.getFDMaturityDtForScheme,
    {
      onError: async (error: any) => {
        CloseMessageBox();
      },
      onSuccess: (data) => {
        const matDateData = data;
        const reqParam = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
          ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
          SCREEN_REF: docCD ?? "",
        };
        getFDParaDetailMutation.mutate(
          { ...reqParam },
          {
            onSuccess: async (data) => {
              const iniDtlData = {
                ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
                BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
                ACCT_CD: FDState?.retrieveFormData?.ACCT_CD ?? "",
                FD_NO_DISABLED: data?.[0]?.FD_NO_DISABLED ?? "",
                INT_RATE_DISABLED: data?.[0]?.INT_RATE_DISABLED ?? "",
                MATURITY_AMT_DISABLED: data?.[0]?.MATURITY_AMT_DISABLED ?? "",
                TERM_CD_DISABLED: data?.[0]?.TERM_CD_DISABLED ?? "",
                TRAN_DT_DISABLED: data?.[0]?.TRAN_DT_DISABLED ?? "",
                FD_NO: data?.[0]?.FD_NO ?? "",
                TERM_CD: data?.[0]?.TERM_CD ?? "",
                SPL_AMT: data?.[0]?.SPL_AMT ?? "",
                DOUBLE_TRAN: data?.[0]?.DOUBLE_TRAN ?? "",
                COMP_CD: authState?.companyID ?? "",
                CATEG_CD: FDState?.acctNoData?.CATEG_CD ?? "",
                AGG_DEP_CUSTID:
                  FDState?.schemeSelecRowData?.MAX_IN_CUST_ID ?? "",
                DEP_FAC: FDState?.schemeSelecRowData?.FACTOR ?? "",
                PERIOD_CD: FDState?.schemeSelecRowData?.PERIOD_CD ?? "",
                PERIOD_NO: FDState?.schemeSelecRowData?.PERIOD_NO ?? "",
                NOMINEE_NM: FDState?.acctNoData?.NOMINEE_NM ?? "",
                MATURITY_DT: matDateData?.[0]?.MATURITY_DT ?? "",
              };
              updateIniDtlFormDataNewFD(iniDtlData);
              updateInitialRenData(iniDtlData);
              CloseMessageBox();
            },
          }
        );
        CloseMessageBox();
      },
    }
  );

  // Remove cached data for the API query to ensure fresh data is fetched
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFDDoubleScheme"]);
    };
  }, []);

  // Function to handle actions when a button is clicked
  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      handleDialogClose();
    }
    if (data?.name === "new-entry") {
      getFDMatDtForSchemeMutation?.mutate({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: FDState?.retrieveFormData?.BRANCH_CD ?? "",
        ACCT_TYPE: FDState?.retrieveFormData?.ACCT_TYPE ?? "",
        ACCT_CD: FDState?.retrieveFormData?.ACCT_CD ?? "",
        CATEG_CD: FDState?.acctNoData?.CATEG_CD ?? "",
        PERIOD_CD: FDState?.schemeSelecRowData?.PERIOD_CD ?? "",
        PERIOD_NO: FDState?.schemeSelecRowData?.PERIOD_NO ?? "",
        TRAN_DT: format(new Date(), "dd/MMM/yyyy") ?? "",
        TRSF_AMT: "",
        MATURITY_DT: "",
        PRE_INT_FLAG: "N",
        PRINCIPAL_AMT: "",
      });
      updateSchemeSelecRowData(data?.rows?.[0]?.data);
      trackDialogClass("fdCommDlg");
      setOpenNewFdForScheme(true);
    }
  }, []);

  // Set the header title for the grid, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    const cloned = cloneDeep(SchemeSelectionGridMetaData);
    cloned.gridConfig.gridLabel = `Category Name: ${data?.[0]?.CATEG_NM ?? ""}`;
    return cloned;
  }, [data?.[0]?.CATEG_NM]);

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
        maxWidth="lg"
        className="fdCommDlg"
      >
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg || t("Somethingwenttowrong")}
            errorDetail={error?.error_detail || ""}
            color="error"
          />
        )}
        {isLoading ? (
          <LoaderPaperComponent />
        ) : (
          <GridWrapper
            key={"SchemeSelectionGrid"}
            finalMetaData={memoizedMetadata as GridMetaDataType}
            data={data ?? []}
            setData={() => null}
            actions={actions}
            loading={isLoading || isFetching}
            setAction={setCurrentAction}
            refetchData={() => refetch()}
          />
        )}
      </Dialog>
      {openNewFdForScheme ? (
        getFDParaDetailMutation?.isLoading ||
        getFDMatDtForSchemeMutation?.isLoading ? (
          <Dialog
            open={true}
            fullWidth={true}
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
            maxWidth="md"
          >
            <LoaderPaperComponent />
          </Dialog>
        ) : (
          <FixDepositForm
            handleDialogClose={handleDialogClose}
            defaultView={"new"}
            openNewFdForScheme={openNewFdForScheme}
            isDataChangedRef={isDataChangedRef}
            getFDMatDtForSchemeMutation={getFDMatDtForSchemeMutation}
            getFDParaDetailMutation={getFDParaDetailMutation}
          />
        )
      ) : null}
    </>
  );
};
