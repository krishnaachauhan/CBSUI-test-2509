import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import { holdTrnsGridMetaData } from "./holdTrnsGridMetaData";
import {
  Alert,
  GridWrapper,
  usePopupContext,
  GridMetaDataType,
  ActionTypes,
  RemarksAPIWrapper,
  ClearCacheProvider,
  queryClient,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "confirm",
    actionLabel: "Confirm",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "reject",
    actionLabel: "Reject",
    multiple: false,
    rowDoubleClick: true,
  },
];
const HoldTrnsConfirmation = () => {
  const { authState } = useContext(AuthContext);
  const [openReport, setOpenReport] = useState(false);
  const [rowData, setRowData] = useState({});
  const [isDeleteRemark, SetDeleteRemark] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getHoldTrnsData"], () =>
    API.getHoldTrnsData({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
    })
  );
  const confRejectMutation = useMutation(
    "getTransactionConfmReject",
    API.getTransactionConfmReject,
    {
      onSuccess: async (data) => {
        const responses = Array.isArray(data) ? data : [data];

        for (const response of responses) {
          const status = response.STATUS;
          const message = response.MESSAGE;

          if (status === "999") {
            await MessageBox({
              messageTitle: "Validation Failed",
              message: message,
            });
          } else if (status === "9") {
            await MessageBox({
              messageTitle: "Alert",
              message: message,
            });
          } else if (status === "99") {
            const buttonName = await MessageBox({
              messageTitle: "Confirmation",
              message: message,
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
            });
            if (buttonName === "No") {
              break; // Exit the loop if "No" is selected
            }
          } else {
            enqueueSnackbar(message, {
              variant: "success",
            });
            SetDeleteRemark(false);
            refetch();
            CloseMessageBox();
          }
        }
      },

      onError: (error: any) => {
        let errorMsg = "Unknownerroroccured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
        CloseMessageBox();
      },
    }
  );

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "reject") {
        SetDeleteRemark(true);
        setRowData(data?.rows[0]?.data);
      }
      if (data?.name === "confirm") {
        if (authState?.user?.id === data?.rows[0]?.data?.ENTERED_BY) {
          await MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("ConfirmRestrictMsg"),
            buttonNames: ["Ok"],
          });
        } else {
          const btnName = await MessageBox({
            messageTitle: t("Confirmation"),
            message: t("DoYouWantToAllowTheTransaction"),
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
          });
          if (btnName === "Yes") {
            const confirmPara: any = {
              ...data?.rows[0]?.data,
              CONFIRM: "Y",
              ACTIVITY_DONE_BY: authState?.user?.id,
              ENT_BRANCH_CD: data?.rows[0]?.data?.ENTERED_BRANCH_CD,
              ENT_COMP_CD: data?.rows[0]?.data?.ENTERED_COMP_CD,
              ACTIVITY_DATE: authState?.workingDate,
              ACTIVITY_TYPE: "",
              TRAN_TYPE: "",
              TRAN_AMOUNT: "0",
            };

            confRejectMutation.mutate({ ...confirmPara });
          }
        }
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getHoldTrnsData"]);
    };
  }, []);

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Somethingwenttowrong"}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"holdtrnscnfData"}
        finalMetaData={holdTrnsGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        enableExport={true}
        setAction={setCurrentAction}
      />
      {isDeleteRemark && (
        <RemarksAPIWrapper
          TitleText={"WRONG ENTRY FROM HOLD TRANSACTION CONFIRMATION(TRN/579)"}
          onActionNo={() => SetDeleteRemark(false)}
          onActionYes={async (val, rows) => {
            const buttonName = await MessageBox({
              messageTitle: t("confirmation"),
              message: t("DoYouWantDeleteRow"),
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
            });
            if (buttonName === "Yes") {
              const deleteReqPara: any = {
                ...rowData,
                USER_DEF_REMARKS: val
                  ? val
                  : "WRONG ENTRY FROM HOLD TRANSACTION CONFIRMATION(TRN/579)",
                ACTIVITY_DONE_BY: authState?.user?.id,
                //@ts-ignore
                ENT_COMP_CD: rowData?.ENTERED_COMP_CD,
                //@ts-ignore
                ENT_BRANCH_CD: rowData?.ENTERED_BRANCH_CD,
                ACTIVITY_DATE: authState?.workingDate,
                ACTIVITY_TYPE: "Delete",
                TRAN_AMOUNT: "0",
                TRAN_TYPE: "Delete",
                CONFIRM: "N",
              };
              SetDeleteRemark(false);
              confRejectMutation.mutate({ ...deleteReqPara });
            }
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isDeleteRemark}
          defaultValue={
            "WRONG ENTRY FROM HOLD TRANSACTION CONFIRMATION (MST/553)"
          }
          rows={rowData}
        />
      )}
    </>
  );
};
export const HoldTrnsConfirmationMain = () => {
  return (
    <ClearCacheProvider>
      <HoldTrnsConfirmation />
    </ClearCacheProvider>
  );
};
