import {
  AppBar,
  Box,
  Dialog,
  Divider,
  Toolbar,
  Typography,
} from "@mui/material";
import { Alert, GradientButton } from "@acuteinfo/common-base";
import { useEffect, useRef, useState } from "react";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { FromUserMetadata, ToUserMetadata } from "./viewDetailMetadata";
import { InitialValuesType } from "@acuteinfo/common-base";
import { usePopupContext } from "@acuteinfo/common-base";
import CashierExchangeTable from "../../tableComponent/tableComponent";
import { CashierConfirmationMetaData } from "./viewTableMetadata";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { format } from "date-fns";

const CashierEntryViewDetail = ({
  open,
  onClose,
  stateData,
  rowsData,
  refetch,
}) => {
  const TableRef = useRef(null);
  const [isData, setIsData] = useState<any>({
    fromUserData: {},
    toUserData: {},
  });
  const [calculationzero, setCalculationZero] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isError, setIsError] = useState(false);
  const cashierEntryConf = useMutation(
    "getCashierExchangeEntryConfirmation",
    API.getCashierExchangeEntryConfirmation,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        CloseMessageBox();
        setIsError(true);
      },
      onSuccess: (data, variables) => {
        CloseMessageBox();
        onClose();
        refetch();
        const messageKey =
          variables?._isDeleteRow === "true"
            ? "DataRejectMessage"
            : "DataConfirmMessage";
        enqueueSnackbar(t(messageKey), { variant: "success" });
      },
    }
  );

  useEffect(() => {
    if (
      Array.isArray(stateData?.fromData) &&
      Array.isArray(stateData?.toData)
    ) {
      setIsData({
        fromUserData: stateData.fromData[0] ?? {},
        toUserData: stateData.toData[0] ?? {},
      });
    }
  }, [stateData]);
  const mapData = (data) => {
    return data?.map((row) => ({
      ENTERED_COMP_CD: row?.ENTERED_COMP_CD ?? "",
      ENTERED_BRANCH_CD: row?.ENTERED_BRANCH_CD ?? "",
      TRAN_CD: row?.TRAN_CD ?? "",
      DAILY_TRN_CD: row?.DAILY_TRN_CD ?? "",
      DENO_TRAN_CD: row?.DENO_TRAN_CD ?? "",
      TYPE_CD: row?.TYPE_CD ?? "",
    }));
  };

  const handleAction = async (isDelete = false) => {
    const MapFrom = mapData(stateData?.fromData ?? "");
    const MapTo = mapData(stateData?.toData ?? "");
    const Combine = [...MapFrom, ...MapTo];

    const request = isDelete
      ? {
          _isDeleteRow: "true",
          isDeleteRow: Combine ?? "",
        }
      : {
          _isDeleteRow: "false",
          FROM_USER: rowsData[0]?.data?.MODIFIED_BY ?? "",
          TO_USER: stateData.toData[0]?.MODIFIED_BY ?? "",
          AMOUNT: rowsData[0]?.data?.AMOUNT ?? "",
          DETAILS_DATA: { isUpdateRow: Combine ?? "" },
        };

    const confirmation = await MessageBox({
      message: isDelete ? "deleteTitle" : "SaveData",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });

    if (confirmation === "Yes") {
      cashierEntryConf.mutate(request);
    }
  };

  const handleConfirm = () => handleAction(false);
  const handleDelete = () => handleAction(true);

  const handleClose = () => {
    setIsData({ fromUserData: {}, toUserData: {} });
    setIsError(false);
    onClose();
  };
  const maker = rowsData?.[0]?.data?.ENTERED_BY ?? "";
  const DateTime = format(new Date(), "dd/MM/yyyy HH:mm:ss") ?? "";
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: "auto", height: "auto", padding: "8px" },
      }}
      maxWidth="lg"
    >
      {isError ? (
        <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={cashierEntryConf?.error?.error_msg ?? "Unknow Error"}
              errorDetail={cashierEntryConf?.error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        </div>
      ) : null}
      <AppBar
        position="static"
        sx={{ background: "var(--theme-color5)", minHeight: "44px" }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 700, color: "var(--theme-color2)" }}
          >
            {t("DenominationExchangeDetail")} ( {t("Maker")} :- {maker}{" "}
            {t("EnteredDate")} :- {DateTime} )
          </Typography>
        </Toolbar>
      </AppBar>

      <Box display="flex" justifyContent="center">
        <Box sx={{ flex: 1 }}>
          <FormWrapper
            key={"CashierExchangeEntryFormFrom"}
            metaData={FromUserMetadata as MetaDataType}
            hideHeader
            formStyle={{ height: "auto" }}
            onSubmitHandler={() => {}}
            initialValues={isData.fromUserData as InitialValuesType}
          />
          <CashierExchangeTable
            data={stateData?.fromData}
            metadata={CashierConfirmationMetaData}
            TableLabel={"Cashier Exchange Table"}
            hideHeader={true}
            showFooter={true}
            ref={TableRef}
            isCalculationZero={setCalculationZero}
          />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

        <Box sx={{ flex: 1 }}>
          <FormWrapper
            key={"CashierExchangeEntryFormTo"}
            metaData={ToUserMetadata as MetaDataType}
            hideHeader
            formStyle={{ height: "auto" }}
            onSubmitHandler={() => {}}
            initialValues={isData.toUserData as InitialValuesType}
          />
          <CashierExchangeTable
            data={stateData?.toData}
            metadata={CashierConfirmationMetaData}
            TableLabel={"Cashier Exchange Table"}
            hideHeader={true}
            showFooter={true}
            ref={TableRef}
            isCalculationZero={setCalculationZero}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
        {isData?.fromUserData?.ALLOW_CONFIRM !== "N" &&
          isData?.toUserData?.ALLOW_CONFIRM !== "N" && (
            <GradientButton onClick={handleConfirm}>{t("Ok")}</GradientButton>
          )}
        <GradientButton onClick={handleClose}>{t("Cancel")}</GradientButton>
        <GradientButton onClick={handleDelete}>{t("Remove")}</GradientButton>
      </Box>
    </Dialog>
  );
};

export default CashierEntryViewDetail;
