import {
  ClearCacheProvider,
  queryClient,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { DialogProvider } from "../payslip-issue-entry/DialogContext";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import { format, isValid } from "date-fns";
import { getGridRowData } from "components/agGridTable/utils/helper";
import AdvanceStockEntryBody from "./AdvanceStockEntryLayout";
import { DialogStateType } from "./types";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
export const requiredKeys = [
  "STOCK_AMT",
  "MARGIN_PERC",
  "DP_AMT",
  "GOOD_SR_CD",
  "INSURANCE_AMOUNT",
  "INSU_SECURITY_TYPE",
  "INSURANCE_TYPE_CD",
  "CONSIDER_DP",
  "DP_CLC_METHOD",
  "MAX_DP_PER_AMT",
  "A_PARA",
  "SR_CD",
];
type ScreenMode = "entry" | "view" | "confirm";
interface AdvanceStockEntryProps {
  isDataChangedRef?: React.MutableRefObject<boolean>;
  closeDialog: () => void;
  defaultView?: any;
  screenForUse: ScreenMode;
  otherScreenReqPara?: any;
  confirmedDataGridMutation?: any;
}

const AdvanceStockEntry: React.FC<AdvanceStockEntryProps> = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  screenForUse,
  otherScreenReqPara,
  confirmedDataGridMutation,
}) => {
  const [dialogState, setDialogState] = useState<DialogStateType>({
    formMode: defaultView,
    securityCd: "",
    gridData: [],
    reqData: [],
    acctDtlViewOpen: false,
    isErrorFuncRef: {},
  });

  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const { state: rows } = location;
  const gridApiRef = useRef(null);
  const isErrorFuncRef = useRef<any>(null);

  const docCD = getdocCD(location.pathname, authState?.menulistdata);

  const formData: Record<string, any> =
    screenForUse === "entry" || screenForUse === "confirm"
      ? rows?.retrieveData?.TRAN_CD
        ? rows.retrieveData
        : rows?.[0]?.data || { COMP_CD: authState?.companyID }
      : otherScreenReqPara || { COMP_CD: authState?.companyID };

  const { data: detailData, isLoading: isDetailLoading } = useQuery(
    ["getDetailsData", formData?.TRAN_CD],
    () =>
      API.getDetailsData({
        COMP_CD: formData?.COMP_CD,
        A_TRAN_CD: formData?.TRAN_CD,
        A_COMP_CD: formData?.COMP_CD,
        A_BRANCH_CD: formData?.BRANCH_CD,
      }),
    {
      enabled:
        screenForUse === "entry" || screenForUse === "confirm"
          ? dialogState.formMode !== "new" && !!formData?.TRAN_CD
          : !!otherScreenReqPara?.TRAN_CD,
    }
  );

  const { data: screenPara, isLoading: isParaLoading } = useQuery(
    ["getcreenPara", formData?.TRAN_CD],
    () =>
      API.getcreenPara({
        COMP_CD: formData?.COMP_CD ?? authState?.companyID,
        TRAN_CD: formData?.TRAN_CD ?? "",
        ENT_COMP_CD: formData?.ENTERED_COMP_CD ?? authState?.companyID,
        ENT_BRANCH_CD:
          formData?.ENTERED_BRANCH_CD ?? authState?.user?.branchCode,
      }),
    { enabled: true }
  );

  const saveDataMutation = useMutation(API.saveEntry, {
    onError: CloseMessageBox,
    onSuccess: () => {
      if (isDataChangedRef) isDataChangedRef.current = true;
      enqueueSnackbar(t("RecordInsertedMsg"), {
        variant: "success",
      });
      closeDialog();
      CloseMessageBox();
    },
  });

  const validateMutation = useMutation(API.validateEntry, {
    onError: CloseMessageBox,
    onSuccess: async (data, variables) => {
      const result = await handleDisplayMessages(data, MessageBox, {
        onYes: async () => {},
        onNo: () => variables.isErrorFuncRef?.endSubmit?.(true),
      });
      if (result) {
        saveDataMutation.mutate({
          ...isErrorFuncRef.current.data,
          DRAWING_POWER: defaultView === "new" ? data?.[0]?.DRAWING_POWER : "0",
        });
      }
      if (["999", "9"].includes(data?.[0]?.O_STATUS)) {
        isErrorFuncRef.current?.endSubmit?.(true);
      }
    },
  });

  const formatDateOrEmpty = (value?: string | Date, skip = false) => {
    if (skip) return "";
    if (!value) return "";
    const date = new Date(value);
    return isValid(date) ? format(date, "dd/MMM/yyyy") : "";
  };

  const onSubmitHandler: SubmitFnType = (
    data: Record<string, any>,
    displayData,
    endSubmit,
    setFieldError
  ) => {
    data = {
      ...data,
      TRAN_DT: formatDateOrEmpty(data.TRAN_DT),
      ASON_DT: formatDateOrEmpty(data.ASON_DT),
      RECEIVED_DT: formatDateOrEmpty(data.RECEIVED_DT),
      WITHDRAW_DT: formatDateOrEmpty(data.WITHDRAW_DT, defaultView === "new"),
    };
    const newData = {
      ...data,
      ...(defaultView === "edit" && { DRAWING_POWER: "0" }),
    };

    const updHeader = utilFunction.transformDetailsData(
      {
        ...newData,
      },
      defaultView === "new" ? {} : { ...formData }
    );

    const agGridData = getGridRowData(gridApiRef);

    if (agGridData) {
      const filteredGridData = Array.isArray(agGridData)
        ? agGridData.map((item) =>
            Object.fromEntries(
              requiredKeys.map((key) => {
                return [key, item?.[key] ?? ""];
              })
            )
          )
        : [];

      let maxSRCD =
        detailData?.reduce((max, item) => {
          const srCdNum = parseInt(item.SR_CD, 10);
          return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
        }, 0) ?? 0;

      filteredGridData.forEach((item) => {
        if (!item.SR_CD || item.SR_CD === "") {
          maxSRCD += 1;
          item.SR_CD = String(maxSRCD);
        }
      });

      const updPara: any = utilFunction.transformDetailDataForDML(
        detailData ?? [],
        filteredGridData ?? [],
        ["SR_CD"]
      );
      isErrorFuncRef.current = {
        data: {
          ...data,
          ...updHeader,
          ENTERED_BRANCH_CD:
            defaultView === "new"
              ? authState?.user?.branchCode
              : formData?.ENTERED_COMP_CD,
          CONFIRMED:
            dialogState?.formMode === "new"
              ? screenPara
                ? screenPara?.[0]?.CONFIRMED
                : "Y"
              : "Y",
          COMP_CD: authState?.companyID,
          ENTERED_COMP_CD:
            defaultView === "new"
              ? authState?.companyID
              : formData?.ENTERED_COMP_CD,
          BRANCH_CD: authState?.user?.branchCode,
          _isNewRow: defaultView === "new",
          ...(defaultView !== "new" && { TRAN_CD: formData?.TRAN_CD }),
          DETAILS_DATA:
            defaultView === "new"
              ? updPara
              : {
                  isNewRow: [],
                  isUpdatedRow: [],
                  isDeleteRow: [],
                },
        },
        displayData,
        endSubmit,
        setFieldError,
      };

      validateMutation.mutate({
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        WORKING_DATE: authState?.workingDate,
        TRN_DATE: data.TRAN_DT,
        ASON_DATE: data.ASON_DT,
        STOCK_DTL: filteredGridData,
        RECEIVE_DT: data.RECEIVED_DT,
        SCREEN_REF: docCD,
      });

      endSubmit(true);
    }
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getDetailsData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  return (
    <AdvanceStockEntryBody
      dialogState={dialogState}
      setDialogState={setDialogState}
      closeDialog={closeDialog}
      formData={formData}
      detailData={detailData}
      screenPara={screenPara}
      isLoading={isDetailLoading || isParaLoading}
      authState={authState}
      gridApiRef={gridApiRef}
      docCD={docCD}
      rows={rows}
      onSubmitHandler={onSubmitHandler}
      validateMutation={validateMutation}
      saveDataMutation={saveDataMutation}
      isErrorFuncRef={isErrorFuncRef}
      screenForUse={screenForUse}
      confirmedDataGridMutation={confirmedDataGridMutation}
    />
  );
};

export const AdvanceStockEntryForm = (props) => (
  <ClearCacheProvider>
    <DialogProvider>
      <AdvanceStockEntry {...props} />
    </DialogProvider>
  </ClearCacheProvider>
);
