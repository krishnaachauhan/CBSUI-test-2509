import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import { LoanScheduleDetailsGridMetadata } from "../gridMetadata";
import { Dialog } from "@mui/material";
import { ConfRejectLoanRescheduleData, getLoanRescheduleDetails } from "../api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { format } from "date-fns";
import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "confirm",
    actionLabel: "Confirm",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "reject",
    actionLabel: "Reject",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const LoanRescheduleConfForm = ({ closeDialog, isDataChangedRef }) => {
  const { authState } = useContext(AuthContext);
  const [detailsData, setDetailsData] = useState<any>([]);
  const { state: rows }: any = useLocation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const navigate = useNavigate();

  const { isLoading, isFetching, isError, error, refetch } = useQuery<any, any>(
    ["getLoanRescheduleDetailsData", authState?.user?.branchCode],
    () =>
      getLoanRescheduleDetails({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
        REF_TRAN_CD: rows?.[0]?.data?.REF_TRAN_CD ?? "",
        TRAN_CD: rows?.[0]?.data?.SR_CD ?? "",
      }),
    {
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const updatedData = data.map((item) => ({
            ...item,
            BEGIN_BAL: Number(item?.BEGIN_BAL ?? 0).toFixed(2),
            INT_RATE: Number(item?.INT_RATE ?? 0).toFixed(2),
            INST_RS: Number(item?.INST_RS ?? 0).toFixed(2),
            PRIN_DEMAND_AMT: Number(item?.PRIN_DEMAND_AMT ?? 0).toFixed(2),
            INT_DEMAND_AMT: Number(item?.INT_DEMAND_AMT ?? 0).toFixed(2),
            END_BAL: Number(item?.END_BAL ?? 0).toFixed(2),
          }));
          setDetailsData(updatedData);
        } else {
          setDetailsData([]);
        }
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getLoanRescheduleDetailsData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const confirmRejectDataMutation = useMutation(ConfRejectLoanRescheduleData, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "close") {
        closeDialog();
      } else if (data?.name === "confirm") {
        if (rows?.[0]?.data?.LAST_ENTERED_BY === authState?.user?.id) {
          await MessageBox({
            messageTitle: "InvalidConfirmation",
            message: "ConfirmRestrictionMsg",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else {
          const confirmation = await MessageBox({
            message: "ConfirmReschedulingMessage",
            messageTitle: "Confirmation",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (confirmation === "Yes") {
            const confirmData = {
              _isConfirmed: true,
              BRANCH_CD: authState?.user?.branchCode ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
              ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
              REF_TRAN_CD: rows?.[0]?.data?.REF_TRAN_CD ?? "",
              TRAN_CD: rows?.[0]?.data?.SR_CD ?? "",
              INST_RS: rows?.[0]?.data?.INST_RS ?? "",
              INT_RATE: rows?.[0]?.data?.INT_RATE ?? "",
              INST_NO: rows?.[0]?.data?.INST_NO ?? "",
              EFF_DATE:
                format(
                  new Date(rows?.[0]?.data?.DISBURSEMENT_DT),
                  "dd/MMM/yyyy"
                ) ?? "",
              FLAG: "M",
            };
            confirmRejectDataMutation.mutate(confirmData);
          } else {
            CloseMessageBox();
          }
        }
      } else if (data?.name === "reject") {
        const confirmation = await MessageBox({
          message: "RejectReschedulingMessage",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (confirmation === "Yes") {
          const rejectData = {
            _isConfirmed: false,
            BRANCH_CD: authState?.user?.branchCode ?? "",
            COMP_CD: authState?.companyID ?? "",
            ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE ?? "",
            ACCT_CD: rows?.[0]?.data?.ACCT_CD ?? "",
            REF_TRAN_CD: rows?.[0]?.data?.REF_TRAN_CD ?? "",
            TRAN_CD: rows?.[0]?.data?.SR_CD ?? "",
            INST_RS: rows?.[0]?.data?.INST_RS ?? "",
            INT_RATE: rows?.[0]?.data?.INT_RATE ?? "",
            INST_NO: rows?.[0]?.data?.INST_NO ?? "",
            EFF_DATE:
              format(
                new Date(rows?.[0]?.data?.DISBURSEMENT_DT),
                "dd/MMM/yyyy"
              ) ?? "",
            FLAG: "D",
          };
          confirmRejectDataMutation.mutate(rejectData);
        } else {
          CloseMessageBox();
        }
      }
    },
    [navigate]
  );

  useEffect(() => {
    LoanScheduleDetailsGridMetadata.gridConfig.hideHeader = false;
    LoanScheduleDetailsGridMetadata.columns[8].isVisible = false;
    LoanScheduleDetailsGridMetadata.gridConfig.gridLabel = `Loan Reschedule Confirmation for A/c No.: ${rows?.[0]?.data?.ACCT_NO} `;
    LoanScheduleDetailsGridMetadata.gridConfig.disableGlobalFilter = true;
    LoanScheduleDetailsGridMetadata.columns[2].width = 150;
    LoanScheduleDetailsGridMetadata.columns[5].width = 150;
    LoanScheduleDetailsGridMetadata.columns[6].width = 150;
    LoanScheduleDetailsGridMetadata.columns[7].width = 150;
    return () => {
      LoanScheduleDetailsGridMetadata.gridConfig.hideHeader = true;
      LoanScheduleDetailsGridMetadata.columns[8].isVisible = true;
      LoanScheduleDetailsGridMetadata.gridConfig.gridLabel = "";
      LoanScheduleDetailsGridMetadata.gridConfig.disableGlobalFilter = false;
      LoanScheduleDetailsGridMetadata.columns[2].width = 190;
      LoanScheduleDetailsGridMetadata.columns[5].width = 190;
      LoanScheduleDetailsGridMetadata.columns[6].width = 190;
      LoanScheduleDetailsGridMetadata.columns[7].width = 200;
    };
  }, []);
  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
            padding: "10px",
          },
        }}
        maxWidth="lg"
        className="loanReschConfFormDlg"
      >
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? "Something went to wrong.."}
            errorDetail={error?.error_detail}
            color="error"
          />
        )}
        <GridWrapper
          key={`LoanRescheduleConfForm`}
          finalMetaData={LoanScheduleDetailsGridMetadata as GridMetaDataType}
          data={detailsData ?? []}
          setData={setDetailsData}
          loading={isLoading || isFetching}
          actions={actions}
          setAction={setCurrentAction}
        />
      </Dialog>
    </>
  );
};
