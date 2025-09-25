import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import * as API from "./api";
import { FdInterestPaymentConfDetail } from "./FdInterestPaymentconfForm";
import { FdInterestPaymentConfmGridMetaData } from "./FdInterestPaymentConfmMetaData";
import {
  ActionTypes,
  GridWrapper,
  Alert,
  usePopupContext,
  queryClient,
  GridMetaDataType,
  Transition,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

export const FDInterestPaymentConfm = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [fDDetailsData, setFDDetailsData] = useState({});
  const [isFDDetailOpen, setIsFDDetailOpen] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const { t } = useTranslation();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getFDPaymentInstruConfAcctDtl", authState?.user?.branchCode ?? ""], () =>
    API.getFDPaymentInstruConfAcctDtl({
      USER_LEVEL: authState?.role ?? "",
      A_USER: authState?.user?.id ?? "",
      ENT_COMP_CD: authState?.companyID ?? "",
      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      FLAG: "FD",
    })
  );

  const getFDPaymentInstruDetail: any = useMutation(
    "fetchFDPaymentConfAcct",
    API.fetchFDPaymentConfAcct,
    {
      onSuccess: async (data) => {
        setFDDetailsData(data);
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        setIsFDDetailOpen(false);
        CloseMessageBox();
      },
    }
  );

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "view-details") {
        setIsFDDetailOpen(true);
        getFDPaymentInstruDetail.mutate({
          COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
          BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
          ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
          ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
          A_CONFIRMED: data?.rows?.[0]?.data?.CONFIRMED ?? "",
          A_LAST_ENT_BY: data?.rows?.[0]?.data?.LAST_ENTERED_BY ?? "",
          A_PARM: "FD",
        });
        setRowsData(data?.rows);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );
  const handleFDDetailClose = () => setIsFDDetailOpen(false);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFDPaymentInstruConfAcctDtl"]);
      queryClient.removeQueries(["fetchFDPaymentConfAcct"]);
    };
  }, []);

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail ?? ""}
          color="error"
        />
      )}
      <GridWrapper
        key={"FdInterestPaymentConfm"}
        finalMetaData={FdInterestPaymentConfmGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        enableExport={data?.length > 0 ? true : false}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />

      <Dialog
        open={isFDDetailOpen}
        onKeyUp={(event) => {
          if (event.key === "Escape") handleFDDetailClose();
        }}
        // @ts-ignore
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        {getFDPaymentInstruDetail?.isLoading ? (
          <LoaderPaperComponent />
        ) : (
          <FdInterestPaymentConfDetail
            closeDialog={handleFDDetailClose}
            fdDetails={fDDetailsData}
            loader={getFDPaymentInstruDetail?.isLoading ? true : false}
            rowsData={rowsData}
          />
        )}
      </Dialog>
    </Fragment>
  );
};
