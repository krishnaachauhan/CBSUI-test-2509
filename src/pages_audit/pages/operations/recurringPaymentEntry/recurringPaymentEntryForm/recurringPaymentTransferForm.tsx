import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import {
  Fragment,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RecurringContext } from "../context/recurringPaymentContext";
import { AuthContext } from "pages_audit/auth";
import { RecurringPaymentTransferFormMetaData } from "./metaData/recurringPmtTransferMetaData";
import { useTranslation } from "react-i18next";
import {
  InitialValuesType,
  SubmitFnType,
  extractMetaData,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../../fix-deposit/function";
import { cloneDeep } from "lodash";

export const RecurringPaymentTransferForm = forwardRef<any, any>(
  ({ defaultView, recurringPaymentEntrySaveMutation, saveDataRef }, ref) => {
    const [formMode, setFormMode] = useState(defaultView);
    const { MessageBox } = usePopupContext();
    const {
      rpState,
      updateRecurPmtTransferData,
      setActiveStep,
      updateBeneficiaryAcctData,
      updatePayslipAndDDData,
      handleDisableButton,
    } = useContext(RecurringContext);
    const { authState } = useContext(AuthContext);
    const { t } = useTranslation();
    let currentPath = useLocation().pathname;
    const docCD = getdocCD(currentPath, authState?.menulistdata);
    const { showMessageBox } = useCommonFunctions();

    const onSubmitHandler: SubmitFnType = async (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      action
    ) => {
      endSubmit(true);
      updateBeneficiaryAcctData({
        TRANS_ACCT_NM: "",
      });
      updatePayslipAndDDData({
        TRANS_ACCT_NM: "",
      });
      let totalTranAmount: any = data?.RECPAYTRANS?.reduce(
        (acc: number, obj: any) => acc + Number(obj.AMOUNT ?? "0"),
        0
      );
      totalTranAmount = totalTranAmount?.toFixed(2);
      if (
        Number(totalTranAmount) !== Number(rpState?.recurPmtEntryData?.TRF_AMT)
      ) {
        await MessageBox({
          messageTitle: "TransferPaymentNotTally",
          message: "PleaseDoFullTransferAmountToMoveForward",
          buttonNames: ["Ok"],
          icon: "WARNING",
        });
        return;
      } else if (
        Number(totalTranAmount) ===
          Number(rpState?.recurPmtEntryData?.TRF_AMT) &&
        !Boolean(rpState?.recurPmtEntryData?.PAYSLIP) &&
        !Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT)
      ) {
        updateRecurPmtTransferData([...data?.RECPAYTRANS]);
        const buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: "TransferPaymentAmountIsTallySureToContinue",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          defFocusBtnName: "Yes",
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          recurringPaymentEntrySaveMutation.mutate({
            ...saveDataRef.current?.data,
            TRAN_CD: rpState?.onSaveValidationData?.[0]?.TRAN_CD ?? "",
            CONFIRMED: rpState?.onSaveValidationData?.[0]?.CONFIRMED ?? "",
            SCROLL1: rpState?.onSaveValidationData?.[0]?.SCROLL1 ?? "",
            ACCOUNT_CLOSE: rpState?.onSaveValidationData?.ACCOUNT_CLOSE ?? "",
            PAY_SLIP_NEFT_DTL: [],
            PAYSLIP_NO: "",
            REC_DTL: [...data?.RECPAYTRANS],
          });
        }
      } else if (
        (Number(rpState?.recurPmtEntryData?.TRF_AMT) > 0 &&
          Boolean(rpState?.recurPmtEntryData?.PAYSLIP)) ||
        (Number(rpState?.recurPmtEntryData?.TRF_AMT) > 0 &&
          Boolean(rpState?.recurPmtEntryData?.RTGS_NEFT))
      ) {
        const buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: "TransferPaymentAmountIsTallySureToContinue",
          buttonNames: ["Yes", "No"],
          defFocusBtnName: "Yes",
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          updateRecurPmtTransferData([...data?.RECPAYTRANS]);
          setActiveStep(rpState.activeStep + 1);
        }
      }
    };

    // Memoized metadata with proper label handling
    const formMetaData = useMemo(() => {
      const clonedMetaData = cloneDeep(RecurringPaymentTransferFormMetaData);

      const branchCode = rpState?.recurPmtEntryData?.BRANCH_CD?.trim() ?? "";
      const accountType = rpState?.recurPmtEntryData?.ACCT_TYPE?.trim() ?? "";
      const accountNo = rpState?.recurPmtEntryData?.ACCT_CD?.trim() ?? "";
      const label2 = `${t(
        "RecurringPaymentTransfer"
      )} for A/C No.:\u00A0${branchCode}-${accountType}-${accountNo} `;
      clonedMetaData.form.label = label2;
      return clonedMetaData;
    }, [
      rpState?.recurPmtEntryData?.BRANCH_CD,
      rpState?.recurPmtEntryData?.ACCT_TYPE,
      rpState?.recurPmtEntryData?.ACCT_CD,
    ]);

    return (
      <Fragment>
        <FormWrapper
          key={"recurringPaymentTransferForm" + formMode}
          metaData={extractMetaData(formMetaData, formMode) as MetaDataType}
          initialValues={
            {
              ...rpState?.recurPmtTransferData,
              TRF_AMT: rpState?.recurPmtEntryData?.TRF_AMT ?? "",
              COMP_CD: authState?.companyID ?? "",
            } as InitialValuesType
          }
          onSubmitHandler={onSubmitHandler}
          ref={ref}
          formState={{
            MessageBox: MessageBox,
            handleDisableButton: handleDisableButton,
            docCD: "RECCRTYPE",
            screenRef: docCD,
            showMessageBox: showMessageBox,
            acctDtlReqPara: {
              DC_ACCT_CD: {
                ACCT_TYPE: "RECPAYTRANS.DC_ACCT_TYPE",
                BRANCH_CD: "RECPAYTRANS.DC_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
          displayMode={formMode}
          formStyle={{
            background: "white",
          }}
        />
      </Fragment>
    );
  }
);
