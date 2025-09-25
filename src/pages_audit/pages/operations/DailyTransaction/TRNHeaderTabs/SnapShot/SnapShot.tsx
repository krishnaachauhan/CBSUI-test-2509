import {
  ActionTypes,
  Alert,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  LoaderPaperComponent,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Dialog, DialogActions } from "@mui/material";
import i18n from "components/multiLanguage/languagesConfiguration";
import { format } from "date-fns";
import { t } from "i18next";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { getInwardChequeSignFormData } from "pages_audit/pages/operations/inwardClearing/api";
import { ChequeSignImage } from "pages_audit/pages/operations/inwardClearing/inwardClearingForm/chequeSignImage";
import { useStyles } from "pages_audit/style";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { snapShotGridMetaData } from "./gridMetadata";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalParaForm/dateRetrievalPara";
import ScrollRegisterReport from "./ScrollRegister";
import { cloneDeep } from "lodash";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
    alwaysAvailable: false,
  },
  {
    actionName: "back-date",
    actionLabel: "BackDate",
    multiple: false,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
export const SnapShot = ({ reqData, parameteres }) => {
  const { authState } = useContext(AuthContext);
  const [state, setState] = useState({
    dateDialog: false,
    isOpenChequeImg: false,
    isOpenReport: false,
    imgData: null,
    rowData: {},
  });
  const reqDataRef = useRef<any>();
  const { CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getSnapShotList", { reqData }],
    () => {
      const FromDate =
        reqData?.PARENT_TYPE?.trim() === "GL01"
          ? format(
              new Date(
                new Date(authState?.workingDate).setDate(
                  new Date(authState?.workingDate).getDate() - 1
                )
              ),
              "dd-MMM-yyyy"
            )
          : format(
              new Date(
                new Date(authState?.workingDate).setDate(
                  new Date(authState?.workingDate).getDate() - 31
                )
              ),
              "dd-MMM-yyyy"
            );

      return API.getSnapShotList({
        A_COMP_CD: reqData?.COMP_CD ?? "",
        A_BRANCH_CD: reqData?.BRANCH_CD ?? "",
        A_ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
        A_FROM_ACCT: reqData?.ACCT_CD ?? "",
        A_FR_DT: reqData.FROM_DATE ?? FromDate ?? "",
        A_TO_DT: reqData?.TO_DATE || format(new Date(), "dd-MMM-yyyy"),
        A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
        A_USER_NM: authState?.user?.id ?? "",
        A_GD_DATE: authState?.workingDate ?? "",
        A_USER_LEVEL: authState?.role ?? "",
        A_SCREEN_REF: reqData?.SCREEN_REF ?? "",
        A_LANG: i18n.resolvedLanguage,
      });
    },
    {
      enabled: hasRequiredFields,
    }
  );
  const handleRefetch = () => hasRequiredFields && refetch();
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(snapShotGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "Snapshot";
    }
    return metadata;
  }, [data]);
  const onClose = () => {
    setState((state) => ({
      ...state,
      isOpenReport: false,
    }));
  };

  const getChequeImg: any = useMutation(getInwardChequeSignFormData, {
    onSuccess: (data) => setState((state) => ({ ...state, imgData: data })),
    onError: (error: any, variables: any) => {
      enqueueSnackbar(error?.error_msg || "Unknown error", {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

  const setCurrentAction = useCallback((data) => {
    let row = data?.rows?.[0]?.data;
    if (data?.name === "back-date") {
      setState((state) => ({ ...state, dateDialog: true }));
    } else if (data?.name === "view-detail") {
      if (row?.SCROLL1 > 0) {
        setState((state) => ({ ...state, isOpenReport: true, rowData: row }));
      }
    }
  }, []);

  const classes = useStyles();
  const retrievalParaValues = (retrievalValues) => {
    reqData.FROM_DATE = retrievalValues?.FROM_DATE
      ? format(
          new Date(retrievalValues?.FROM_DATE ?? new Date()),
          "dd-MMM-yyyy"
        )
      : "";
    reqData.TO_DATE = retrievalValues?.TO_DATE
      ? format(new Date(retrievalValues?.TO_DATE ?? new Date()), "dd-MMM-yyyy")
      : "";
  };
  if (parameteres?.[0]?.VALUE_DT === "N") {
    snapShotGridMetaData.columns = snapShotGridMetaData?.columns?.map(
      (column) =>
        column?.accessor === "VALUE_DT"
          ? { ...column, isVisible: false }
          : column
    );
  }

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getSnapShotList",
        authState?.user?.branchCode,
      ]);
    };
  }, []);
  return (
    <>
      {isError || getChequeImg?.error ? (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ||
            getChequeImg?.error?.error_msg ||
            "Unknown error occured"
          }
          errorDetail={
            error?.error_detail || getChequeImg?.error?.error_detail || ""
          }
        />
      ) : null}

      <GridWrapper
        key={`snapShotGridMetaData` + snapShotGridMetaData}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={handleRefetch}
        actions={actions}
        setAction={setCurrentAction}
        disableMultipleRowSelect={false}
        variant={"standard"}
        enableExport={true}
        onClickActionEvent={(index, id, currentData) => {
          if (id === "CHEQUE_IMG") {
            setState((state) => ({ ...state, isOpenChequeImg: true }));
            reqDataRef.current = currentData;
            getChequeImg.mutate({
              ENTERED_BRANCH_CD: reqDataRef?.current?.ENTERED_BRANCH_CD ?? "",
              COMP_CD: reqDataRef?.current?.COMP_CD ?? "",
              BRANCH_CD: reqDataRef?.current?.BRANCH_CD ?? "",
              ACCT_TYPE: reqDataRef?.current?.ACCT_TYPE ?? "",
              ACCT_CD: reqDataRef?.current?.ACCT_CD ?? "",
              TRAN_CD: reqDataRef?.current?.REF_TRAN_CD ?? "",
              TRAN_DT: reqDataRef?.current?.TRN_DATE
                ? format(new Date(reqDataRef?.current?.TRN_DATE), "dd/MMM/yyyy")
                : "",
              WITH_SIGN: "N",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: docCD ?? "",
            });
          }
        }}
      />

      {state.dateDialog && (
        <DateRetrievalDialog
          handleClose={() =>
            setState((state) => ({ ...state, dateDialog: false }))
          }
          retrievalParaValues={retrievalParaValues}
          defaultData={{
            A_FROM_DT: format(
              new Date(
                new Date(authState?.workingDate).setDate(
                  new Date(authState?.workingDate).getDate() - 60
                )
              ),
              "dd-MMM-yyyy"
            ),
            A_TO_DT: authState?.workingDate ?? "",
          }}
          // classes={classes}
          // loginState={{}}
        />
      )}
      {state.isOpenReport && (
        <ScrollRegisterReport
          rowData={{
            ...state?.rowData,
            COMP_CD: reqData?.COMP_CD ?? "",
            BRANCH_CD: reqData?.BRANCH_CD ?? "",
            docCD: reqData?.SCREEN_REF ?? "",
          }}
          handleClose={onClose}
          openReport={state.isOpenReport}
        />
      )}
      {state.isOpenChequeImg ? (
        <>
          <Dialog
            open={state.isOpenChequeImg}
            PaperProps={{
              style: {
                width: "100%",
              },
            }}
            maxWidth="md"
          >
            {getChequeImg?.isLoading ? (
              <LoaderPaperComponent />
            ) : (
              <>
                <DialogActions>
                  <GradientButton
                    onClick={() =>
                      setState((state) => ({
                        ...state,
                        isOpenChequeImg: false,
                      }))
                    }
                  >
                    {t("Close")}
                  </GradientButton>
                </DialogActions>
                <ChequeSignImage imgData={state.imgData} />
              </>
            )}
          </Dialog>
        </>
      ) : null}
    </>
  );
};
