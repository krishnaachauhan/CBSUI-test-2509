import React, { useMemo } from "react";
import { Dialog } from "@mui/material";
import {
  Alert,
  extractMetaData,
  FormWrapper,
  GradientButton,
  MetaDataType,
  SubmitFnType,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { t } from "i18next";
import { EntryFormState } from "./entryForm";
import { cloneDeep } from "lodash";
import { revalidateDDform } from "./generateDDFormmetaData";
import { CUSTOM_DATE_FORMAT } from "components/utilFunction/constant";

type NewDDFormProps = {
  entryFormState: EntryFormState;
  updateEntryFormState: (updates: Partial<EntryFormState>) => void;
  mutation: any;
  isErrorFuncRef: any;
  authState: any;
  screenFlag: string;
  ddformRef: React.RefObject<any>;
  acctDtlData: any[];
  draftDtlData: Record<string, any>;
  rowsData: any;
  trans_type: string;
  apiReqFlag: string;
  currentIndex: number;
};

const NewDDForm: React.FC<NewDDFormProps> = ({
  entryFormState,
  updateEntryFormState,
  mutation,
  isErrorFuncRef,
  authState,
  screenFlag,
  ddformRef,
  acctDtlData,
  draftDtlData,
  rowsData,
  trans_type,
  apiReqFlag,
  currentIndex,
}) => {
  const onSubmitHandler: SubmitFnType = async (
    data: Record<string, any>,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    if (screenFlag !== "CANCELENTRY") return;

    const cancleDraftData = ddformRef.current;

    // --- helpers ---
    const getTransferAccountData = (source: any) => ({
      TRF_COMP_CD: source?.TRF_COMP_CD,
      TRF_BRANCH_CD: source?.TRF_BRANCH_CD,
      TRF_ACCT_TYPE: source?.TRF_ACCT_TYPE,
      TRF_ACCT_CD: source?.TRF_ACCT_CD,
    });

    const buildRevalidatedDDObj = () => ({
      ACCT_TYPE: acctDtlData[0]?.ACCT_TYPE,
      ACCT_CD: acctDtlData[0]?.ACCT_CD,
      COMM_TYPE_CD: draftDtlData[0]?.COMM_TYPE_CD,
      TOT_DD_NEFT_AMT: data?.TOTAL_AMOUNT,
      DD_NEFT_PAY_AMT: data?.PAYMENT_AMOUNT,
    });

    const buildNewDraftData = () => {
      const base = {
        COLLECT_COMISSION: cancleDraftData?.COLLECT_COMISSION,
        REALIZE_AMT: cancleDraftData?.REALIZE_AMT,
        C_C_T_SP_C: cancleDraftData?.C_C_T_SP_C,
        REALIZE_BRANCH_CD: authState?.user?.branchCode,
        REALIZE_COMP_CD: authState?.companyID,
        REALIZE_BY: authState?.user?.id,
        REALIZE_DATE: cancleDraftData?.REALIZE_DATE_DISP
          ? format(
              new Date(cancleDraftData?.REALIZE_DATE_DISP),
              CUSTOM_DATE_FORMAT?.APP_DATE_FORMAT
            )
          : "",
        PENDING_FLAG: "Y",
      };

      return {
        ...base,
        ...(data?.C_C_T_SP_C !== "G"
          ? { CHEQUE_NO: cancleDraftData?.TOKEN_NO }
          : {}),
        ...(cancleDraftData?.C_C_T_SP_C === "T"
          ? getTransferAccountData(cancleDraftData)
          : {}),
        ...(cancleDraftData?.C_C_T_SP_C === "C" ? { PENDING_FLAG: "Y" } : {}),
        ...(rowsData?.PARA_243 === "Y" ? { REALIZE_FLAG: "Y" } : {}),
      };
    };

    const buildOldData = () => ({
      COLLECT_COMISSION: draftDtlData[0]?.COLLECT_COMISSION,
      REALIZE_AMT: draftDtlData[0]?.REALIZE_AMT,
      C_C_T_SP_C: draftDtlData[0]?.C_C_T_SP_C,
      ...(draftDtlData?.C_C_T_SP_C !== "G"
        ? { CHEQUE_NO: draftDtlData[0]?.CHEQUE_NO }
        : {}),
      REALIZE_BY: draftDtlData[0]?.REALIZE_BY,
      REALIZE_DATE: draftDtlData[0]?.REALIZE_DATE,
      REALIZE_BRANCH_CD: draftDtlData[0]?.REALIZE_BRANCH_CD,
      REALIZE_COMP_CD: draftDtlData[0]?.REALIZE_COMP_CD,
      PENDING_FLAG: draftDtlData[0]?.PENDING_FLAG,
      ...(data?.C_C_T_SP_C === "T"
        ? getTransferAccountData(draftDtlData[0])
        : {}),
      ...(rowsData?.PARA_243 === "Y"
        ? { REALIZE_FLAG: rowsData.REALIZE_FLAG }
        : {}),
    });

    // --- build objects ---
    const newdraftData = buildNewDraftData();
    const oldData = buildOldData();
    const revalidatedDDObj = buildRevalidatedDDObj();
    const upd = utilFunction.transformDetailsData(newdraftData, oldData);

    // cleanup
    delete data.SIGNATURE1_NM;
    delete data.SIGNATURE2_NM;
    delete data.REGION_NM;

    // --- final payload ---
    isErrorFuncRef.current = {
      data: {
        ...newdraftData,
        ...upd,
        ENTERED_COMP_CD: authState?.companyID,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        TRAN_CD: rowsData?.TRAN_CD,
        PARA_812: rowsData?.PARA_812,
        PARA_243: rowsData?.PARA_243,
        TRAN_TYPE: trans_type,
        SR_CD: draftDtlData[0]?.SR_CD,
        A_ENTRY_MODE: rowsData?.RETRIVE_ENTRY_MODE,
        COL_SER_CHARGE: cancleDraftData.COL_SER_CHARGE,
        PAY_SLIP_NEFT_DTL: [
          {
            ...data,
            COMM_TYPE_CD: draftDtlData[0]?.COMM_TYPE_CD,
            FROM_CERTI_NO: "",
            FROM_ACCT_CD: draftDtlData[0]?.ACCT_CD,
            FROM_COMP_CD: draftDtlData[0]?.COMP_CD,
            FROM_BRANCH_CD: draftDtlData[0]?.BRANCH_CD,
            FROM_ACCT_TYPE: draftDtlData[0]?.ACCT_TYPE,
            BRANCH_NM: draftDtlData[0]?.BRANCH_NM,
          },
        ],
        ...revalidatedDDObj,
        DETAILS_DATA: {
          isNewRow:
            cancleDraftData?.CANCEL_REASON?.length >= 0
              ? cancleDraftData.CANCEL_REASON
              : [],
        },
        PAY_FOR: "",
        SDC: "",
        SCROLL1: "",
        THROUGH_CHANNEL: "",
        REQUEST_CD: "0",
        REMARKS: "",
        DD_NEFT: "DD",
        SCREEN_REF: apiReqFlag,
      },
      displayData,
      endSubmit,
      setFieldError,
    };

    mutation.mutate({
      ...isErrorFuncRef.current?.data,
    });
  };
  const handleClose = () => {
    updateEntryFormState({
      openNewDDForm: false,
    });
  };
  const revalidateDDFormMeta = useMemo(() => {
    const cloned = cloneDeep(revalidateDDform);
    cloned.form.label = "Payslip & Demand Draft";
    return cloned;
  }, [revalidateDDform]);

  return (
    <Dialog
      open={entryFormState?.openNewDDForm}
      PaperProps={{
        style: {
          height: "auto",
          width: "100%",
        },
      }}
      maxWidth="lg"
    >
      {mutation.isError && (
        <Alert
          severity="error"
          errorMsg={mutation?.error?.error_msg || t("Somethingwenttowrong")}
          errorDetail={mutation.error?.error_detail}
          color="error"
        />
      )}

      <FormWrapper
        key={`revalidateDDForm${entryFormState?.formMode}${currentIndex}`}
        metaData={
          extractMetaData(
            revalidateDDFormMeta,
            entryFormState?.formMode
          ) as MetaDataType
        }
        displayMode="view"
        onSubmitHandler={onSubmitHandler}
        initialValues={{
          ...draftDtlData?.[0],
          INSTRUCTION_REMARKS: "Payslip Revalidated",
        }}
        formStyle={{
          background: "white",
          height: "auto",
        }}
      >
        {({ handleSubmit }) => (
          <>
            <GradientButton
              onClick={() => {
                let event: any = { preventDefault: () => {} };
                handleSubmit(event, "SAVE");
              }}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={handleClose}>{t("Close")}</GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};

export default NewDDForm;
