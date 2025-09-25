import React, { useContext, useState } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { queryClient, usePopupContext } from "@acuteinfo/common-base";
import { CkycContext } from "../CkycContext";

const useCkycConfirmRejectHook = ({ PendingRefetch, setOpenAuditDialog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state } = useContext(CkycContext);
  const closeForm = () => {
    setOpenAuditDialog(false);
    PendingRefetch();
  };

  // confirm acount entry
  const confirmMutation: any = useMutation(API.ConfirmPendingCustomers, {
    onSuccess: async (data, variables: any) => {
      setIsOpen(false);
      const confirmed: string = variables?.CONFIRMED;
      const customerID = Boolean(
        data?.[0]?.CUSTOMER_ID && parseInt(data?.[0]?.CUSTOMER_ID)
      )
        ? parseInt(data?.[0]?.CUSTOMER_ID)
        : Boolean(state?.customerIDctx && parseInt(state?.customerIDctx))
        ? parseInt(state?.customerIDctx)
        : "";

      const reqId = Boolean(
        variables?.REQUEST_CD && parseInt(variables?.REQUEST_CD)
      )
        ? parseInt(variables?.REQUEST_CD)
        : Boolean(state?.req_cd_ctx && parseInt(state?.req_cd_ctx))
        ? parseInt(state?.req_cd_ctx)
        : "";
      const message =
        confirmed === "Y"
          ? `${t("ConfirmedSuccessfully")} Customer ID - ${customerID}`
          : confirmed === "M"
          ? `${t("SentForModificationSuccessfully")} Request ID - ${reqId}`
          : confirmed === "R"
          ? `${t("RejectedSuccessfully")} Request ID - ${reqId}`
          : "No Message";
      const buttonName = await MessageBox({
        messageTitle: "SUCCESS",
        message: message,
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });
      if (buttonName === "Ok") {
        closeForm();
        CloseMessageBox();
        queryClient.invalidateQueries({
          queryKey: ["ckyc", "getConfirmPendingData"],
        });
      }
      closeForm();
    },
    onError: (error: any) => {
      setIsOpen(false);
      setConfirmAction(null);
    },
  });

  const openActionDialog = async (state: string) => {
    setIsOpen(true);
    setConfirmAction(state);
  };

  return {
    isOpen,
    confirmAction,
    setIsOpen,
    setConfirmAction,
    confirmMutation,
    closeForm,
    openActionDialog,
    state,
  };
};

export default useCkycConfirmRejectHook;
