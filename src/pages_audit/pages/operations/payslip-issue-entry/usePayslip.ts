import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "react-query";
import { SubmitFnType, utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";
import {
  getJointDetailsList,
  getVoucherList,
  savePayslipEntry,
  validatePayslipData,
} from "./api";
import { PayslipState } from "./PayslipIsuueEntryform";
import { enqueueSnackbar } from "notistack";
import { handleDisplayMessages } from "components/utilFunction/function";

interface UsePayslipProps {
  draftDtlData: Record<string, any>[];
  acctDtlData: Record<string, any>[];
  draftDtlError: any;
  payslipState: PayslipState;
  authState: any;
  MessageBox: any;
  closeDialog: () => void;
  CloseMessageBox: any;
  updatePayslipState: (updates: Partial<PayslipState>) => void;
  slipTransCd: Record<string, any>[];
  slipdataRefetch: any;
  rows: Record<string, any>;
}

export const usePayslip = ({
  draftDtlData,
  acctDtlData,
  payslipState,
  authState,
  MessageBox,
  CloseMessageBox,
  closeDialog,
  updatePayslipState,
  slipTransCd,
  slipdataRefetch,
  rows,
}: UsePayslipProps) => {
  const queryClient = useQueryClient();
  const myChequeFormRef = useRef<any>(null);
  const formDataRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);

  /** prepare old draft/acct data */
  const olddraftData =
    draftDtlData?.map((item) => {
      const { REGION, AMOUNT, ...rest } = item;
      return {
        ...rest,
        REGION,
        AMOUNT: parseFloat(item.AMOUNT).toFixed(2),
      };
    }) ?? [];

  const oldaccttData =
    acctDtlData?.map((item) => {
      const { ...rest } = item;
      return rest;
    }) ?? [];
  /** mutations */

  /** submit handler */
  const onSubmitHandler: SubmitFnType = async (
    data: Record<string, any>,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);
    if (!formDataRef.current) {
      formDataRef.current = { data: {} };
    }

    let srCount = utilFunction.GetMaxCdForDetails(olddraftData, "SR_CD");
    let filteredDraftData =
      data?.PAYSLIP_DRAFT_DTL?.map((item) => ({
        ...item,
        SR_CD: item?.isOldRow === "Y" ? item?.SR_CD : srCount++,
        AMOUNT: parseFloat(item.AMOUNT).toFixed(2),
      })) ?? [];

    filteredDraftData.forEach((item) => {
      delete item.REGIONBTN;
      delete item.INS_FLAG;
      delete item.BILL_TYPE;
      delete item.DISP_REGION;
      delete item.DISP_SIGN1;
      delete item.DISP_SIGN2;
      delete item.PENDING_FLAG;
      delete item.HIDDEN_PAYSLIPNO;
      delete item.TAX_RATE;
      delete item.signature1;
      delete item.signature2;
      delete item.GST_ROUND;
      delete item.INFAVOUR_OF_OPTION;
      delete item.BALANCE;
    });

    let srCount1 = utilFunction.GetMaxCdForDetails(oldaccttData, "SR_CD");
    let filteredAcctData =
      data?.PAYSLIP_MST_DTL?.map((item) => ({
        ...item,
        SR_CD: item?.isOldRow === "Y" ? item?.SR_CD : srCount1++,
        DUMMY_CHECK: item["DUMMY_CHECK"] ? "Y" : "N",
      })) ?? [];

    filteredAcctData.forEach((item) => {
      delete item.TYPE_CD;
      delete item.JOINT_DTL;
      delete item.PENDING_FLAG;
      if (payslipState?.formMode === "edit") {
        delete item.DUMMY_CHECK;
      }
    });

    const validatePayslipReq = {
      ISSUE_DT: authState?.workingDate,
      PENDING_FLAG: data?.PENDING_FLAG === "Confirmed" ? "Y" : "N",
      SLIP_CD: data?.SLIP_CD,
      SCREEN_REF: "RPT/14",
      ENTRY_TYPE: payslipState?.formMode === "new" ? "N" : "M",
      ENT_COMP: authState?.companyID ?? "",
      ENT_BRANCH: authState?.user?.branchCode ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      DTL_CLOB: filteredAcctData ?? "",
      MST_CLOB: filteredDraftData ?? "",
    };
    isErrorFuncRef.current = {
      validatePayslipReq,
      displayData,
      endSubmit,
      setFieldError,
    };

    const updPara1 = utilFunction.transformDetailDataForDML(
      oldaccttData ?? [],
      filteredAcctData ?? [],
      ["SR_CD"]
    );

    const updPara2 = utilFunction.transformDetailDataForDML(
      olddraftData ?? [],
      filteredDraftData ?? [],
      ["SR_CD"]
    );

    if (
      data.MST_TOTAL !== data.FINAL_DRAFT_TOTAL &&
      payslipState?.formMode === "new"
    ) {
      await MessageBox({
        messageTitle: t("ValidationFailed"),
        message: t("amountCheckMsg"),
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    } else {
      validDataNutation.mutate({
        ...isErrorFuncRef.current?.validatePayslipReq,
      });
    }

    if (formDataRef.current) {
      formDataRef.current.data = {
        ISSUE_DT: format(new Date(data.TRAN_DT), "dd/MMM/yyyy"),
        SLIP_CD: data?.SLIP_CD ?? "",
        REQ_FLAG: "D",
        COMP_CD: authState?.companyID ?? "",
        _isNewRow: payslipState?.formMode === "new",
        BRANCH_CD: authState?.user?.baseBranchCode ?? "",
        PAYSLIP_DRAFT_DTL: updPara2,
        PAYSLIP_MST_DTL: payslipState?.formMode === "edit" ? [] : updPara1,
        ADD_DRAFT_DATA: updPara2?.isNewRow?.length !== 0 ? "Y" : "N",
      };
    }
  };

  /** Ctrl+S hotkey */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "s") || (e.ctrlKey && e.key === "S")) {
        e.preventDefault();
        myChequeFormRef.current?.handleSubmit(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "S") || (e.ctrlKey && e.key === "s")) {
        e.preventDefault();
        handleClick(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /** submit form */
  const handleClick = (e) => {
    myChequeFormRef.current.handleSubmit(e);
  };

  /** nutations  */

  const voucherMutation = useMutation(getVoucherList, {
    onError: async (error: any) => {
      isErrorFuncRef.current?.endSubmit(false);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (data[0]?.VOUCHER_MSG === "") {
        return;
      } else {
        await MessageBox({
          message: data[0]?.VOUCHER_MSG,
          messageTitle: t("voucherConfirmationMSG"),
          icon: "INFO",
          buttonNames: ["Ok"],
        });
      }
      closeDialog();
      CloseMessageBox();
    },
  });
  const jointDetailMutation = useMutation(getJointDetailsList, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      updatePayslipState({
        jointDtlData: data,
      });
    },
  });
  const PayslipSaveMutation = useMutation(savePayslipEntry, {
    onError: async (error: any) => {
      isErrorFuncRef.current?.endSubmit(false);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      isErrorFuncRef.current?.endSubmit(true);
      CloseMessageBox();
      if (data[0]?.TRAN_CD) {
        voucherMutation.mutate({
          A_ENT_COMP_CD: authState?.companyID ?? "",
          A_ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
          A_TRAN_DT:
            format(new Date(authState?.workingDate), "dd/MMM/yyyy") ?? "",
          A_TRAN_CD: data[0]?.TRAN_CD ?? "",
          A_TRN_FLAG: "N",
          A_SDC: "PSLP",
          A_SR_CD: "0",
        });
      }

      slipdataRefetch();
      enqueueSnackbar(t("success"), {
        variant: "success",
      });
      closeDialog();
      CloseMessageBox();
    },
  });
  const validDataNutation = useMutation(validatePayslipData, {
    onError: async (error: any) => {
      isErrorFuncRef.current?.endSubmit(false);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (!data || !formDataRef.current) return;

      const firstItem = data[0] ?? {};
      formDataRef.current.data = {
        ...formDataRef.current.data,
        DRAFT_MST_DATA: [
          {
            COMP_CD: firstItem.COMP_CD ?? "",
            BRANCH_CD: firstItem.BRANCH_CD ?? "",
            ACCT_CD: firstItem.ACCT_CD ?? "",
            ACCT_TYPE: firstItem.ACCT_TYPE ?? "",
          },
        ],
      };

      const msgDtl: any = await handleDisplayMessages(data, MessageBox, {
        onNo: async () => {
          if (payslipState?.formMode === "edit") {
            updatePayslipState({ formMode: "edit" });
          }
          return {};
        },
      });
      if (msgDtl?.O_STATUS === "0") {
        PayslipSaveMutation.mutate({
          ...formDataRef.current.data,
          TRAN_CD:
            payslipState?.formMode === "new"
              ? slipTransCd?.[0]?.TRAN_CD
              : rows?.[0]?.data?.TRAN_CD,
        });
      }
      isErrorFuncRef.current?.endSubmit(false);
    },
  });

  /** cleanup react-query cache */
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getpaySliptranscd"]);
      queryClient.removeQueries(["regionData"]);
      queryClient.removeQueries(["draftdata"]);
      queryClient.removeQueries(["headerData"]);
      queryClient.removeQueries(["getSlipNo"]);
    };
  }, [queryClient]);

  return {
    onSubmitHandler,
    myChequeFormRef,
    formDataRef,
    handleClick,
    voucherMutation,
    jointDetailMutation,
    validDataNutation,
    PayslipSaveMutation,
  };
};
