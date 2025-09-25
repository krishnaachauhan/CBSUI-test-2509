import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as API from "./api";
import { useMutation } from "react-query";
import {
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { lockerDeatilsViewMetadata } from "./gridMetaData";
import { enqueueSnackbar } from "notistack";
export const LockerViewDetailsGrid = ({ data, refetch, loading }) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const navigate = useNavigate();

  const setCurrentAction = useCallback(
    async (data) => {
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );
  interface TransactionData {
    TRAN_CD?: string;
    OUT_TRAN_CD?: string;
  }

  interface RequestData {
    COMP_CD: string | undefined;
    BRANCH_CD: string | undefined;
  }

  const processTransactionData = (
    obj: TransactionData
  ): {
    TRAN_CD: string;
    COMP_CD: string | undefined;
    BRANCH_CD: string | undefined;
  }[] => {
    let result: {
      TRAN_CD: string;
      COMP_CD: string | undefined;
      BRANCH_CD: string | undefined;
    }[] = [];

    const reqData: RequestData = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
    };

    if (obj.TRAN_CD && obj.OUT_TRAN_CD) {
      result.push({ TRAN_CD: obj.TRAN_CD, ...reqData });
      result.push({ TRAN_CD: obj.OUT_TRAN_CD, ...reqData });
    } else if (obj.TRAN_CD) {
      result.push({ TRAN_CD: obj.TRAN_CD, ...reqData });
    } else if (obj.OUT_TRAN_CD) {
      result.push({ TRAN_CD: obj.OUT_TRAN_CD, ...reqData });
    }

    return result;
  };

  const deleteMutation = useMutation(API.saveLockerOperationEntry, {
    onError: async (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      await MessageBox({
        messageTitle: "Error",
        message: errorMsg,
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      refetch();
      CloseMessageBox();
    },
  });
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getLockerDetails"]);
    };
  }, []);
  return (
    <GridWrapper
      key={"lockerDeatilsViewMetadata" + data}
      finalMetaData={lockerDeatilsViewMetadata as GridMetaDataType}
      data={data ?? []}
      setData={() => null}
      onClickActionEvent={async (index, id, data) => {
        const reqData = processTransactionData(data);

        if (id === "DELETE") {
          if (data?.OUT_TRAN_CD !== "") {
            const btnName = await MessageBox({
              message: t("lockerTrnsDeleMsg"),
              messageTitle: "Confirmation",
              buttonNames: ["Yes", "No"],
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });
            if (btnName === "Yes") {
              deleteMutation.mutate({
                _isDeleteRow: true,
                DELETERAWS: reqData,
              });
            }
          } else {
            const btnName = await MessageBox({
              message: t("lockerTrnsDltCnfmMsg"),
              messageTitle: "Confirmation",
              buttonNames: ["Yes", "No"],
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });
            if (btnName === "Yes") {
              deleteMutation.mutate({
                _isDeleteRow: true,
                DELETERAWS: reqData,
              });
            }
          }
        }
        if (id === "SIGN") {
        }
      }}
      hideHeader={true}
      actions={[]}
      loading={loading}
      setAction={setCurrentAction}
      refetchData={() => refetch()}
    />
  );
};
