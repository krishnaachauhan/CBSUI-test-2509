import { FC, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Dialog from "@mui/material/Dialog";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { strLevelBranchEditFormMetaData } from "./metadata";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { StrMarkAsPerSuspiciousGrid } from "./suspiciousTransactionGrid";
import {
  usePopupContext,
  SubmitFnType,
  utilFunction,
  MetaDataType,
  FormWrapper,
  GradientButton,
  Alert,
} from "@acuteinfo/common-base";
export const StrBranchLevelForm: FC<{
  onClose?: any;
  rowsData?: any;
  isDataChangedRef?: any;
}> = ({ onClose, rowsData, isDataChangedRef }) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [suspiciousTran, IsSuspiciousTran] = useState<any>(false);
  const [suspiciousTranRefresh, setSuspiciousTranRefresh] = useState(0);
  const { t } = useTranslation();

  const updateBranhcDetailData: any = useMutation(API.updateBranhcDetailData, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },

    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      CloseMessageBox();
      isDataChangedRef.current = true;
      onClose();
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

    data["TRAN_BAL"] = data?.TRAN_BAL.toString().endsWith(".00")
      ? data.TRAN_BAL.toString().slice(0, -3)
      : data.TRAN_BAL.toString();

    let upd: any = utilFunction.transformDetailsData(data, rowsData ?? {});
    if (upd?._UPDATEDCOLUMNS?.length > 0) {
      const buttonName = await MessageBox({
        messageTitle: t("Confirmation"),
        message: t("ProceedGen"),
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        updateBranhcDetailData.mutate({
          ...data,
          ...upd,
          _isNewRow: false,
          ENTERED_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD,
          ENTERED_COMP_CD: rowsData?.ENTERED_COMP_CD,
          TRAN_CD: rowsData?.TRAN_CD,
          SR_CD: rowsData?.SR_CD,
        });
      }
    }
  };
  return (
    <>
      <>
        {updateBranhcDetailData?.isError && (
          <Alert
            severity="error"
            errorMsg={
              updateBranhcDetailData?.error?.error_msg ??
              "Something went to wrong.."
            }
            errorDetail={updateBranhcDetailData?.error?.error_detail ?? ""}
            color="error"
          />
        )}
        <FormWrapper
          key={`strBranchLevelForm` + suspiciousTranRefresh}
          metaData={strLevelBranchEditFormMetaData as unknown as MetaDataType}
          initialValues={rowsData ?? {}}
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
          }}
          formState={{ MessageBox: MessageBox, rowsData: rowsData }}
          setDataOnFieldChange={(action, payload) => {
            if (action === "IS_VISIBLE") {
              if (payload === "Y") {
                IsSuspiciousTran(true);
              }
            }
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton onClick={onClose}>{t("Close")}</GradientButton>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={isSubmitting}
                //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                color={"primary"}
              >
                {t("SaveClose")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </>
      {suspiciousTran ? (
        <>
          <StrMarkAsPerSuspiciousGrid
            onClose={(action) => {
              IsSuspiciousTran(false);
              if (action === "OC") {
                setSuspiciousTranRefresh((old) => old + 1);
              }
            }}
            rowsData={rowsData}
          />
        </>
      ) : null}
    </>
  );
};

export const StrBranchLevelFormWrapper = ({ onClose, isDataChangedRef }) => {
  const { state: rows } = useLocation();

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      maxWidth="md"
    >
      <StrBranchLevelForm
        onClose={onClose}
        rowsData={rows?.[0]?.data}
        isDataChangedRef={isDataChangedRef}
      />
    </Dialog>
  );
};
