import { FC, useEffect, useRef, useState, useContext } from "react";
import {
  SubmitFnType,
  GradientButton,
  usePopupContext,
  extractMetaData,
  LoaderPaperComponent,
  queryClient,
  FormWrapper,
  MetaDataType,
  Alert,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import * as API from "./api";
import { useSnackbar } from "notistack";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { AuditBenfiDetailFormMetadata } from "./metaData";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { IfscAllListSearch } from "./ifscCodeAllListSearch";
import { useDialogContext } from "../payslip-issue-entry/DialogContext";
import BeneficiaryEntryFormModal from "../beneficiaryEntry/beneficiaryEntryFormModal";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";

export const AddNewBeneficiaryDetail: FC<{
  isOpen?: any;
  onClose?: any;
  isBenAuditTrailData?: any;
  isRefresh?: any;
}> = ({ isOpen, onClose, isBenAuditTrailData, isRefresh }) => {
  let currentPath = useLocation().pathname;
  const isErrorFuncRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const formRef = useRef<any>(null);
  const [retrieveData, setRetrieveData] = useState<any>({});
  const [retrieveDataRefresh, setRetrieveDataRefresh] = useState<any>(0);
  const [ifscAllList, setIfscAllList] = useState<any>(false);
  const { t } = useTranslation();
  const { trackDialogClass } = useDialogContext();
  const [disableBtn, setDisableBtn] = useState(false);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getRtgsBenfData", isOpen]);
    };
  }, []);

  const getAuditDml: any = useMutation(API.getAuditDml, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },

    onSuccess: (data) => {
      (isBenAuditTrailData?.SCREEN_REF === "MST/552" ||
        Boolean(isBenAuditTrailData?.isRefetch)) &&
        isRefresh();
      trackDialogClass("auditTrailGridDlg");
      enqueueSnackbar(data, {
        variant: "success",
      });
      onClose();
      CloseMessageBox();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    // @ts-ignore
    endSubmit(true);
    delete data["ACTIVE_FLAG"];
    delete data["INACTIVE"];

    isErrorFuncRef.current = {
      data: {
        _isNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: isBenAuditTrailData?.BRANCH_CD ?? "",
        TRAN_CD: "",
        ACCT_TYPE: isBenAuditTrailData?.ACCT_TYPE ?? "",
        ACCT_CD:
          isBenAuditTrailData?.ACCT_CD.padStart(6, "0")?.padEnd(20, " ") ?? "",
        ...data,
        FLAG: Boolean(data["FLAG"]) ? "Y" : "N",
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    const buttonName = await MessageBox({
      messageTitle: t("Confirmation"),
      message: t("AreYouSaveThisRecord"),
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      getAuditDml.mutate(isErrorFuncRef?.current?.data);
    }
  };

  return (
    <>
      <BeneficiaryEntryFormModal
        MessageBox={MessageBox}
        formMode={"new"}
        getIfscBenAcDetail={[]}
        gridData={[]}
        ifscAllList={ifscAllList}
        onSubmitHandler={onSubmitHandler}
        retrieveData={retrieveData}
        retrieveDataRefresh={retrieveDataRefresh}
        setIfscAllList={setIfscAllList}
        setRetrieveData={setRetrieveData}
        setRetrieveDataRefresh={setRetrieveDataRefresh}
        setisAddOpen={onClose}
        docCD={docCD}
        authState={authState}
        gridDataRef={isBenAuditTrailData}
      />
    </>
  );
};
