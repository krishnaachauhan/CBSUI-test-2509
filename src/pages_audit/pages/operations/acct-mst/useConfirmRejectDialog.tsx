import React, { useContext, useState } from "react";
import { useMutation } from "react-query";
import * as API from "./api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { usePopupContext } from "@acuteinfo/common-base";

const useConfirmRejectDialog = ({
  rowsData,
  setOpenDilogue,
  PendingRefetch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const closeForm = () => {
    setOpenDilogue(false);
    PendingRefetch();
  };

  // confirm acount entry
  const confirmMutation: any = useMutation(API.confirmAccount, {
    onSuccess: async (data, variables) => {
      setIsOpen(false);
      if (variables?.CONFIRMED === "R") {
        enqueueSnackbar(t("AccountRemoveSuccessfully"), { variant: "success" });
        closeForm();
      } else if (
        variables?.CONFIRMED === "Y" &&
        Boolean(data?.[0]?.BRANCH_CD)
      ) {
        const btnName = await MessageBox({
          messageTitle: "Success",
          message: `Account Created - A/C No :- ${data?.[0]?.COMP_CD}-${data?.[0]?.BRANCH_CD}-${data?.[0]?.ACCT_TYPE}-${data?.[0]?.ACCT_CD}`,
          icon: "SUCCESS",
          buttonNames: ["Ok"],
        });
        if (btnName === "Ok") {
          CloseMessageBox();
          closeForm();
        }
      } else {
        enqueueSnackbar(t("AccountConfirmSuccessfully"), {
          variant: "success",
        });
        closeForm();
      }
      closeForm();
    },
    onError: async (error: any) => {
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
    MessageBox,
    CloseMessageBox,
    rowsData,
    t,
  };
};

export default useConfirmRejectDialog;
