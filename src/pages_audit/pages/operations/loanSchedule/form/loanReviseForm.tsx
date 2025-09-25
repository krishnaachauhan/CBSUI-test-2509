import { Dialog } from "@mui/material";
import { LoanReviseMetaData } from "./metadata";
import { t } from "i18next";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { saveUpdatedInterestRate } from "../api";
import { useContext, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import {
  GradientButton,
  MasterDetailsForm,
  MasterDetailsMetaData,
  usePopupContext,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

export const LoanReviseForm = ({
  isDataChangedRef,
  closeDialog,
  reviseData,
  previousRowData,
  selectedRowData,
}) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [masterGriddata, setMasterGriddata] = useState<any>([]);
  const [count, setCount] = useState<any>(0);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const saveMutation = useMutation(saveUpdatedInterestRate, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      closeDialog();
    },
    onSuccess: (data, variables) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });
  const onSubmitHandler = async ({
    data,
    displayData,
    resultValueObj,
    resultDisplayValueObj,
    endSubmit,
    setFieldError,
    actionFlag,
  }) => {
    //@ts-ignore
    if (data._UPDATEDCOLUMNS.length > 0) {
      data._UPDATEDCOLUMNS = data._UPDATEDCOLUMNS.filter(
        (field) =>
          field !== "VALIDATE_INST_RS" &&
          field !== "VALIDATE_INT_RATE" &&
          field !== "INST_NO"
      );
    }

    if (
      Boolean(data) &&
      masterGriddata.length > 0 &&
      data._UPDATEDCOLUMNS.length > 0
    ) {
      const filterData = masterGriddata.map((item: any) => {
        const { BEGIN_BAL, END_BAL, INS_START_DT, REPAY_PRIN_AMT, ...rest } =
          item;
        const filterItem = {
          ...rest,
        };
        return filterItem;
      });
      const updatedGridData = filterData.map((item) => ({
        ...item,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        TRAN_CD: data?.TRAN_CD ?? "",
      }));
      const reqPara = {
        DETAILS_DATA: {
          isUpdateRow: updatedGridData,
        },
      };
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        saveMutation.mutate(reqPara);
      }
      if (btnName === "No") {
        endSubmit(true);
      }
    } else {
      endSubmit(true);
    }
  };

  return (
    <>
      <MasterDetailsForm
        key={"loanReviseForm" + count}
        metaData={LoanReviseMetaData as MasterDetailsMetaData}
        initialData={{
          ...reviseData,
          VALIDATE_INT_RATE: null,
          VALIDATE_INST_RS: Boolean(reviseData?.INST_RS)
            ? Number(reviseData?.INST_RS).toFixed(2).toString()
            : "",
          HDR_DISBURSEMENT_DT: selectedRowData?.data?.DISBURSEMENT_DT ?? "",
          HDR_DISBURSEMENT_AMT: selectedRowData?.data?.DISBURSEMENT_AMT ?? "",
          HDR_INSTALLMENT_TYPE: selectedRowData?.data?.INST_TYPE_DIS ?? "",
          HDR_INST_NO: selectedRowData?.data?.INST_NO ?? "",
          HDR_INS_START_DT: selectedRowData?.data?.INS_START_DT ?? "",
          HDR_INST_RS: selectedRowData?.data?.INST_RS ?? "",
          DETAILS_DATA: masterGriddata,
        }}
        onSubmitData={onSubmitHandler}
        formStyle={{
          background: "white",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        containerstyle={{ padding: "10px" }}
        formState={{
          previousRowData: previousRowData,
          setCount: setCount,
          docCD,
        }}
        setDataOnFieldChange={(action, payload) => {
          if (action === "GRID_DATA") {
            if (Array.isArray(payload)) {
              const updatedData = payload.map((item) => ({
                ...item,
                BEGIN_BAL: Number(item?.BEGIN_BAL ?? 0).toFixed(2),
                INST_RS: Number(item?.INST_RS ?? 0).toFixed(2),
                PRIN_DEMAND_AMT: Number(item?.PRIN_DEMAND_AMT ?? 0).toFixed(2),
                INT_DEMAND_AMT: Number(item?.INT_DEMAND_AMT ?? 0).toFixed(2),
                END_BAL: Number(item?.END_BAL ?? 0).toFixed(2),
              }));
              setMasterGriddata(updatedData);
            }
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              color={"primary"}
            >
              {t("Save")}
            </GradientButton>
            <GradientButton onClick={closeDialog} color={"primary"}>
              {t("Cancel")}
            </GradientButton>
          </>
        )}
      </MasterDetailsForm>
    </>
  );
};

export const LoanReviseFormWrapper = ({
  isDataChangedRef,
  closeDialog,
  reviseData,
  previousRowData,
  selectedRowData,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
          height: "auto",
        },
      }}
      maxWidth="xl"
    >
      <LoanReviseForm
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        reviseData={reviseData}
        previousRowData={previousRowData}
        selectedRowData={selectedRowData}
      />
    </Dialog>
  );
};
