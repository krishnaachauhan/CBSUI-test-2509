import { useState, useRef, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";

import { AuthContext } from "pages_audit/auth";
import {
  usePopupContext,
  queryClient,
  utilFunction,
  SubmitFnType,
} from "@acuteinfo/common-base";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import * as API from "../api";

export const usePmbyRegForm = ({
  defaultView,
  screenType,
  closeDialog,
  isDataChangedRef,
  formref,
}: {
  defaultView: string;
  screenType: string;
  closeDialog: () => void;
  isDataChangedRef: React.MutableRefObject<boolean>;
  formref: React.MutableRefObject<any>;
}) => {
  const [formMode, setFormMode] = useState(defaultView);
  const [isDeleteRemark, setIsDeleteRemark] = useState(false);

  const { state: rows } = useLocation();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const formData = rows?.retrieveData?.COMP_CD
    ? rows.retrieveData
    : rows?.[0]?.data || { COMP_CD: authState?.companyID };

  const isErrorFuncRef = useRef<any>(null);

  useEffect(() => {
    return () =>
      queryClient.removeQueries([
        "getPassbookDtlData",
        authState?.user?.branchCode,
      ]);
  }, []);

  const handleMutationError = async (error: any) => {
    await MessageBox({
      messageTitle: "ValidationFailed",
      message: error?.error_msg ?? "",
      icon: "ERROR",
    });
    isErrorFuncRef.current?.endSubmit(true);
    CloseMessageBox();
  };

  const mutation = useMutation(API.savePmByEntry, {
    onError: handleMutationError,
    onSuccess: async (data, variables: any) => {
      const msg = variables._isDeleteRow
        ? t("deleteSuccessfully")
        : formMode === "new"
        ? t("insurancePolicyRegistreddMsg")
        : t("RecordUpdatedMsg");

      if (formMode === "new") {
        await MessageBox({
          messageTitle: "Success",
          message: `${msg} ${data[0]?.TRAN_CD}`,
          icon: "SUCCESS",
        });
      } else {
        enqueueSnackbar(msg, { variant: "success" });
      }

      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const validateEntry = useMutation(API.validatePmByEntry, {
    onError: handleMutationError,
    onSuccess: async (data) => {
      await handleDisplayMessages(data, MessageBox, {
        onYes: async () => {
          mutation.mutate({ ...isErrorFuncRef.current?.data });
        },
        onNo: () => {
          isErrorFuncRef.current?.endSubmit(true);
          return {};
        },
      });

      const firstStatus = data?.[0]?.O_STATUS;
      if (["999", "9"].includes(firstStatus)) {
        isErrorFuncRef.current?.endSubmit(true);
      }
    },
  });

  const confirmRejectMutation = useMutation(API.doEntryConfirm, {
    onError: handleMutationError,
    onSuccess: async (data) => {
      if (data?.status === "999") {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: data?.message ?? "",
          icon: "ERROR",
        });
      } else {
        isDataChangedRef.current = true;
        enqueueSnackbar("success", { variant: "success" });
        CloseMessageBox();
        closeDialog();
      }
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: Record<string, any>,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    data.REQ_DT = data?.REQ_DT
      ? format(new Date(data.REQ_DT), "dd/MMM/yyyy")
      : authState?.workingDate;
    data.BIRTH_DT = data?.BIRTH_DT
      ? format(new Date(data.BIRTH_DT), "dd/MMM/yyyy")
      : "";
    data.OP_DATE = data?.OP_DATE
      ? format(new Date(data.OP_DATE), "dd/MMM/yyyy")
      : "";
    data.TRAN_DT = data?.TRAN_DT
      ? format(new Date(data.TRAN_DT), "dd/MMM/yyyy")
      : authState?.workingDate;
    data.NOMINEE_BIRTH_DT = data?.NOMINEE_BIRTH_DT
      ? format(new Date(data.NOMINEE_BIRTH_DT), "dd/MMM/yyyy")
      : authState?.workingDate;
    data.ACTIVE = data.ACTIVE === "Y" || data.ACTIVE === true ? "Y" : "N";
    if (typeof data.DOC_DUP_CHECK === "boolean")
      data.DOC_DUP_CHECK = data.DOC_DUP_CHECK ? "Y" : "N";
    const allowedKeys = [
      "BRANCH_CD",
      "ACCT_TYPE",
      "ACCT_CD",
      "TRAN_CD",
      "INSURANCE_TRAN_CD",
      "PAN_NO",
      "UNIQUE_ID",
      "CONTACT2",
      "EMAIL_ID",
      "ACTIVE",
      "REMARKS",
      "APPOINTEE_NM",
      "APPLICANT_AGE_YEAR",
      "APPLICANT_AGE_MONTH",
      "APPLICANT_AGE_DAYS",
      "NOMINEE_NM",
      "NOMINEE_BIRTH_DT",
      "NOMINEE_AGE_YEAR",
      "NOMINEE_RELATION_TYPE",
      "DOC_DUP_CHECK",
      "PREMIUM_AMT",
      "TRAN_BAL",
      "APPOINTEE_RELATION_TYPE",
    ];

    const PMBY_DTL = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedKeys.includes(key))
    );
    const updatedData = {
      ...data,
      ...utilFunction.transformDetailsData(
        data,
        defaultView === "new" ? {} : formData
      ),
      COMP_CD: authState?.companyID,
      ENTERED_COMP_CD: authState?.companyID,
      MODIFIED_BRANCH_CD: authState?.user?.branchCode,
      TRAN_DT: authState?.workingDate,
      CONFIRMED: "0",
      BRANCH_CD: authState?.user?.branchCode,
      ENTERED_BRANCH_CD: authState?.user?.branchCode,
      _isNewRow: defaultView === "new",
    };

    isErrorFuncRef.current = {
      data: updatedData,
      displayData,
      endSubmit,
      setFieldError,
    };

    if (actionFlag === "Save" && !updatedData._UPDATEDCOLUMNS?.length)
      return setFormMode("view");

    const btnName = await MessageBox({
      message: "SaveData",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });

    if (btnName === "Yes")
      validateEntry.mutate({
        COMP_CD: authState?.companyID,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        BASE_BRANCH_CD: authState?.user?.baseBranchCode,
        FLAG: formMode === "new" ? "N" : "M",
        PMBY_DTL: PMBY_DTL,
        WORKING_DATE: authState?.workingDate,
        USERNAME: authState?.user?.id,
        USERROLE: authState?.role,
        SCREEN_REF: docCD,
      });
  };
  const handleSave = (e) => formref.current?.handleSubmit(e);

  const handleEdit = () => {
    if (formData?.ALLOW_MODIFY === "Y") {
      setFormMode("edit");
    } else {
      MessageBox({
        message: "pmbyEntryCnfrmRestrctMsg",
        messageTitle: "ValidationFailed",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    }
  };

  const handleDelete = async () => {
    const confirm = await MessageBox({
      message: "deleteCmfmMsg",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });
    if (confirm === "Yes") {
      mutation.mutate({ ...formData, _isDeleteRow: true });
    }
  };

  const handleReject = () => {
    if (formData?.ALLOW_REJECT === "Y") setIsDeleteRemark(true);
  };

  const handleConfirm = async () => {
    if (formData?.ALLOW_CONFIRM !== "Y") return;

    if (formData?.ENTERED_BY === authState?.user?.id) {
      return MessageBox({
        messageTitle: "ValidationFailed",
        message: "ConfirmRestrictMsg",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    }

    const nomineeCount = formData?.NOMINEE_NM?.length || 0;
    const msg = nomineeCount
      ? `Nominee is ${formData?.NOMINEE_NM}. Are you sure to proceed?`
      : "No Nominee is entered. Are you sure to proceed?";

    const proceed = await MessageBox({
      messageTitle: "Confirmation",
      message: msg,
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });
    if (proceed !== "Yes") return;

    const finalConfirm = await MessageBox({
      messageTitle: "Confirmation",
      message: t("AreYouSureToConfirm"),
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });
    if (finalConfirm !== "Yes") return;

    confirmRejectMutation.mutate({
      ACTIVE: formData?.ACTIVE,
      isConfirm: true,
      ENTERED_BRANCH_CD: formData?.ENTERED_BRANCH_CD,
      ENTERED_COMP_CD: formData?.ENTERED_COMP_CD,
      TRAN_CD: formData?.TRAN_CD,
    });
  };

  const handleCancel = () => setFormMode("view");

  const handleClose = () => closeDialog();
  return {
    formMode,
    setFormMode,
    formData,
    isDeleteRemark,
    setIsDeleteRemark,
    onSubmitHandler,
    mutation,
    validateEntry,
    confirmRejectMutation,
    docCD,
    MessageBox,
    CloseMessageBox,
    handleSave,
    handleEdit,
    handleDelete,
    handleConfirm,
    handleReject,
    handleCancel,
    handleClose,
  };
};
export const accountKeys = [
  "APPLICANT_AGE_YEAR",
  "APPLICANT_AGE_MONTH",
  "ACCT_NM",
  "UNIQUE_ID",
  "NOMINEE_AGE_DAYS",
  "ACCT_NO",
  "PIN_CODE",
  "ADD1",
  "ADD2",
  "APPLICANT_NM",
  "MASKED_UNIQUE_ID",
  "STATUS",
  "MASKED_CONTACT2",
  "BIRTH_DT",
  "STATE_CD",
  "GENDER",
  "TRAN_BAL",
  "CONFM_PARA",
  "AREA_CD",
  "CONTACT2",
  "OP_DATE",
  "NOMINEE_AGE_MONTH",
  "CUSTOMER_ID",
  "CITY_CD",
  "NOMINEE_NM",
  "MASKED_PAN_NO",
  "NOMINEE_BIRTH_DT",
  "NOMINEE_AGE_YEAR",
  "EMAIL_ID",
  "FATHER_NM",
  "APPLICANT_AGE_DAYS",
  "PAN_NO",
];
