import {
  AppBar,
  CircularProgress,
  Dialog,
  LinearProgress,
} from "@mui/material";
import React, { useContext, useState } from "react";

import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { forceExpireStockMetaData } from "./forceExpiredMetadata";
import { crudStockData } from "../api";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  utilFunction,
  Alert,
  FormWrapper,
  MetaDataType,
  GradientButton,
  extractMetaData,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
type StockDtlCustomProps = {
  navigate?: any;
  stockEntryGridData?: any;
};
export const ForceExpireStock: React.FC<StockDtlCustomProps> = ({
  navigate,
  stockEntryGridData,
}) => {
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const [formMode, setFormMode] = useState(rows?.formMode);
  const { t } = useTranslation();
  const { trackDialogClass } = useDialogContext();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const handleCloseDialog = () => {
    trackDialogClass("main");
    navigate(".");
  };

  let newInitialData = {
    ...rows,
    MARGIN: rows?.PARENT_TYPE.trim() === "SOD" ? 100 : rows?.MARGIN,
    WITHDRAW_DT: rows?.ASON_DT === "" ? authState?.workingDate : rows?.ASON_DT,
    DRAWING_POWER: "0",
    NET_VALUE: rows?.NET_VALUE && parseFloat(rows?.NET_VALUE).toFixed(2),
    STOCK_VALUE: rows?.STOCK_VALUE && parseFloat(rows?.STOCK_VALUE).toFixed(2),
  };

  const forceExpire: any = useMutation("crudStockData", crudStockData, {
    onSuccess: () => {
      CloseMessageBox();
      navigate(".");
      enqueueSnackbar(t("ForceExpSuccessfully"), { variant: "success" });
      stockEntryGridData.mutate({
        COMP_CD: rows?.COMP_CD,
        ACCT_CD: rows?.ACCT_CD,
        ACCT_TYPE: rows?.ACCT_TYPE,
        BRANCH_CD: rows?.BRANCH_CD,
        A_USER_LEVEL: authState?.role,
        A_GD_DATE: authState?.workingDate,
      });
    },
  });

  return (
    <Dialog
      open={true}
      fullWidth={true}
      className="force-view-details"
      PaperProps={{
        style: {
          maxWidth: "1250px",
        },
      }}
    >
      <>
        {forceExpire?.isError && (
          <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={forceExpire?.error?.error_msg ?? "Unknow Error"}
                errorDetail={forceExpire?.error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          </div>
        )}
        <FormWrapper
          key={"stock-force-exp" + formMode}
          metaData={
            extractMetaData(forceExpireStockMetaData, formMode) as MetaDataType
          }
          displayMode={formMode}
          subHeaderLabel={
            formMode === "edit" ? t("ForceExpStock") : t("stockDetail")
          }
          initialValues={formMode === "edit" ? newInitialData : rows ?? {}}
          onSubmitHandler={async (data: any, displayData, endSubmit) => {
            const formatDate = (date) =>
              date ? format(new Date(date), "dd/MMM/yyyy") : "";

            let newData = {
              WITHDRAW_DT: formatDate(data?.WITHDRAW_DT),
              REMARKS: data?.REMARKS,
              MARGIN: data?.MARGIN,
              DRAWING_POWER: data?.DRAWING_POWER,
              STOCK_DESC: data?.STOCK_DESC,
            };
            let oldData = {
              WITHDRAW_DT: formatDate(rows?.WITHDRAW_DT),
              REMARKS: rows?.REMARKS,
              MARGIN: rows?.MARGIN,
              DRAWING_POWER: rows?.DRAWING_POWER,
              STOCK_DESC: "",
            };
            let upd = utilFunction.transformDetailsData(newData, oldData);

            let apiReq = {
              _isNewRow: false,
              _isDeleteRow: false,
              COMP_CD: rows?.COMP_CD,
              BRANCH_CD: rows?.BRANCH_CD,
              ACCT_TYPE: rows?.ACCT_TYPE,
              ACCT_CD: rows?.ACCT_CD,
              PARENT_TYPE: rows?.PARENT_TYPE,
              TRAN_CD: rows?.TRAN_CD,
              WITHDRAW_DT: formatDate(data?.WITHDRAW_DT),
              REMARKS: data?.REMARKS,
              DRAWING_POWER: data?.DRAWING_POWER,
              STOCK_DESC: data?.STOCK_DESC,
              ASON_DT: rows?.ASON_DT,
              ...(data?.PARENT_TYPE.trim() === "SOD"
                ? { MARGIN: data?.MARGIN }
                : {}),
              ...upd,
            };

            let buttonName = await MessageBox({
              messageTitle: "Confirmation",
              message: "AreYouSureToProceed",
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              icon: "CONFIRM",
              loadingBtnName: ["Yes"],
            });

            if (buttonName === "Yes") {
              forceExpire.mutate(apiReq);
            }
            //@ts-ignore
            endSubmit(true);
          }}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                {formMode === "edit" && (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={forceExpire.isLoading}
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                )}
                <GradientButton color="primary" onClick={handleCloseDialog}>
                  {t("Close")}
                </GradientButton>
              </>
            );
          }}
        </FormWrapper>
      </>
    </Dialog>
  );
};
