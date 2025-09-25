import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cashRemiPaymentMetadata } from "./CashRemiPaymentMetadata";
import { cashRemiPaymentConfMetadata } from "./CashRemiPaymentConfMetaData";
import { t } from "i18next";
import {
  setAgGridRowData,
  updateNodeDataAndFocus,
  validateGridAndGetData,
} from "components/agGridTable/utils/helper";
import {
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useMutation, useQuery } from "react-query";
import { getCashDeno } from "../customerExchangeEntry/api";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import * as API from "../CashRemittancePayment/api";
import { enqueueSnackbar } from "notistack";

const useCashRemiPayment = () => {
  const gridApiRef = useRef<any>();
  const TableRef = useRef<any>();
  const currentRowData = useRef<any>();

  const [isOpenDenomination, setIsOpenDenomination] = useState(false);
  const [remainingAmt, setRemainingAmt] = useState(0);

  const [openPdfViewer, setOpenPdfViewer] = useState(false);
  const [printBlob, setPrintBlob] = useState<any>();
  const [tableData, setTableData] = useState([]);
  const [denoDisplayMode, setDenoDisplayMode] = useState("new");
  const { authState } = useContext(AuthContext);

  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const { MessageBox, CloseMessageBox } = usePopupContext();

  //* Retrieve table data
  const {
    data: parameterData,
    error: parameterError,
    isError: parameterIsError,
  } = useQuery<any, any>(["getParameterData"], () =>
    API.getParameterData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState.user?.branchCode ?? "",
      USERROLE: authState?.role ?? "",
    })
  );

  //* get parameter to view denomination table
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getCashPaymentData"], () =>
    API.getCashPaymentData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState.user?.branchCode ?? "",
      USERROLE: authState?.role ?? "",
      SCREEN_REF: docCD ?? "",
      TRAN_DT: authState?.workingDate ?? "",
    })
  );

  //* confirm or reject records
  const {
    mutateAsync: confirmReject,
    isError: CRIsError,
    error: CRError,
  }: any = useMutation(API.confirmOrRejectEntry, {
    onSuccess: (data) => {},
    onError: (error: any, variables?: any) => {},
  });

  //* get initially deno. data
  const {
    mutate: getData,
    isLoading: denoLoader,
    isError: denoIsError,
    error: denoError,
  }: any = useMutation(getCashDeno, {
    onSuccess: (data) => {
      setTableData(data ?? []);
    },
    onError: (error: any, variables?: any) => {},
  });

  //* retrieve added denomination data
  const {
    mutate: retrieveDenoData,
    isLoading: retrieveDenoLoader,
    isError: retrieveIsError,
    error: retrieveError,
  }: any = useMutation(API.retrieveDenoDtl, {
    onSuccess: (data) => {
      const denoData = data?.map((item) => {
        return {
          ...item,
          DENO_LABLE: item?.DENO_LABEL,
          DENO_AMOUNT: Number(item?.DENO_VALUE) * Number(item?.DENO_QTY),
          AVAIL_QTY: item?.DENO_AVAIL,
          AVAIL_VAL: Number(item?.DENO_VALUE) * Number(item?.DENO_AVAIL),
          DENO_VAL: item?.ACTUAL_AMOUNT,
        };
      });
      setRemainingAmt(data?.[0]?.ACTUAL_AMOUNT ?? 0);
      setTableData(denoData);
    },
    onError: (error: any, variables?: any) => {},
  });

  //* save records
  const saveCashRemiPayment: any = useMutation(API.saveCashRemiPayment, {
    onSuccess: async (data) => {
      for (let i = 0; i < data?.length; i++) {
        if (data?.[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[i]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data?.[i]?.O_STATUS === "99") {
          const btnName = await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          handleAddNewRow();

          if (btnName === "Yes") {
            printLetterApiCall(data?.[i]?.TRAN_CD);
            setOpenPdfViewer(true);
            currentRowData.current = {};
            CloseMessageBox();
          }
          continue;
        } else if (data?.[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data?.[i]?.O_STATUS === "0") {
          enqueueSnackbar(t("EntrySavedSuccessfully"), {
            variant: "success",
          });
          await refetch();
        }
      }
    },
  });

  //* get report for Print
  const {
    mutate: printLetter,
    isLoading: printLoader,
    isError: printIsError,
    error: printError,
  }: any = useMutation(API.printReport, {
    onSuccess: (data) => {
      let blobData = utilFunction.blobToFile(data, "");
      setPrintBlob(blobData);
    },
    onError: (error: any, variables?: any) => {},
  });

  const confirmOrReject = async ({ TRAN_CD, FLAG, SR_CD, BRANCH_CD }) => {
    const data = await confirmReject({
      BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
      FLAG: FLAG ?? "",
      SR_CD: SR_CD ?? "",
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      TRAN_CD: TRAN_CD ?? "",
      SCREEN_REF: docCD ?? "",
    });
    return data;
  };

  const printLetterApiCall = (TRAN_CD) => {
    printLetter({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      TRAN_CD: TRAN_CD ?? "",
      SCREEN_REF: docCD ?? "",
    });
  };
  //* add new row with validations
  const handleAddNewRow = async () => {
    const result = validateGridAndGetData(gridApiRef);
    const isError = result?.isError ?? false;
    if (isError) {
      return;
    } else {
      gridApiRef.current?.applyTransaction({
        add: [
          { DENO_FLAG: parameterData?.[0]?.DENO_FLAG, REMARKS: "CASH PAYMENT" },
        ],
      });
      if (currentRowData?.current) {
        let api = currentRowData.current?.api;
        let node = currentRowData.current?.node;
        await api?.setFocusedCell(node.rowIndex + 1, "FROM_ACCT_TYPE");
        await api?.startEditingCell({
          rowIndex: node.rowIndex + 1,
          colKey: "FROM_ACCT_TYPE",
        });
      }
    }
  };

  const handleSaveData = async (node, api) => {
    const result = validateGridAndGetData(gridApiRef);
    const isError = result?.isError ?? false;
    if (isError) {
      return true;
    } else {
      const btnName = await MessageBox({
        message: t("Proceed ?"),
        messageTitle: t("Confirmation"),
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
      });

      const formattedData = {
        ACCT_NM: node.data?.ACCT_NM ?? "",
        AMOUNT: node.data?.AMOUNT ?? "",
        FROM_ACCT_CD: node.data?.FROM_ACCT_CD ?? "",
        FROM_ACCT_TYPE: node.data?.FROM_ACCT_TYPE ?? "",
        REMARKS: node.data?.REMARKS ?? "",
        SEND_THROUGH: node.data?.SEND_THROUGH ?? "",
        TO_BRANCH: node.data?.TO_BRANCH ?? "",
        DENO_FLAG: node.data?.DENO_FLAG ?? "",
      };

      const transformedData = {
        REMIT_DTL: formattedData,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
        SCREEN_REF: docCD ?? "",
        DENO_DTL: currentRowData?.current?.node?.data?.DENO_DTL ?? [],
      };
      if (btnName === "Yes") {
        const data = await saveCashRemiPayment.mutateAsync(transformedData);
      } else {
        updateNodeDataAndFocus(node, { AMOUNT: "" }, api, {
          focusedAccessor: "AMOUNT",
          isFieldFocused: true,
        });
      }
    }
  };

  const handleCustomCellKeyDown = useCallback(async (params, lastColumn) => {
    const {
      column: { colDef },
      api,
      node,
    } = params;

    if (lastColumn?.colId === colDef?.field) {
      await handleSaveData(node, api);
    }
    return true;
  }, []);

  const agGridProps = {
    id: "transactionGrid",
    columnDefs:
      docCD === "TRN/623"
        ? cashRemiPaymentConfMetadata.columns({
            authState,
            setIsOpenDenomination,
            getData,
            setRemainingAmt,
            handleSaveData,
            currentRowData,
            retrieveDenoData,
            printLetterApiCall,
            setOpenPdfViewer,
            confirmOrReject,
            CloseMessageBox,
            docCD,
          })
        : cashRemiPaymentMetadata.columns({
            authState,
            setIsOpenDenomination,
            getData,
            setRemainingAmt,
            handleSaveData,
            currentRowData,
            retrieveDenoData,
            printLetterApiCall,
            setOpenPdfViewer,
            confirmOrReject,
            CloseMessageBox,
            docCD,
            setDenoDisplayMode,
          }),
  };
  useEffect(() => {
    if (gridApiRef?.current && data) {
      const formattedRowdata = data?.map((item) => {
        return {
          ENTERED_BY: item?.ENTERED_BY,
          ACCT_NM: item?.ACCT_NM,
          AMOUNT: item?.AMOUNT,
          BRANCH_CD: item?.BRANCH_CD,
          COMP_CD: item?.COMP_CD,
          CONFIRMED: item?.CONFIRMED,
          DAILY_TRN_CD: item?.DAILY_TRN_CD,
          DENO_FLAG: item?.DENO_FLAG,
          FROM_ACC: item?.FROM_ACC,
          FROM_ACCT_CD: item?.FROM_ACCT_CD,
          FROM_ACCT_TYPE: item?.FROM_ACCT_TYPE,
          FROM_BRANCH_CD: item?.FROM_BRANCH_CD,
          FROM_COMP_CD: item?.FROM_COMP_CD,
          REMARKS: item?.REMARKS,
          SEND_THROUGH: item?.SEND_THROUGH,
          TO_BRANCH: item?.TO_BRANCH,
          TO_COMP_CD: item?.TO_COMP_CD,
          TRAN_CD: item?.TRAN_CD,
          TRAN_DT: item?.TRAN_DT,
          VISIBLE_DENO_PRINT: item?.VISIBLE_DENO_PRINT,
          CHEQUE_NO: item?.CHEQUE_NO,
          ENTERED_DATE: item?.ENTERED_DATE,
          SR_CD: item?.SR_CD,
        };
      });

      const rowData =
        docCD === "TRN/623"
          ? formattedRowdata
          : [
              ...formattedRowdata,
              {
                DENO_FLAG: parameterData?.[0]?.DENO_FLAG,
                REMARKS: "CASH PAYMENT",
              },
            ];
      //* set row data
      setAgGridRowData(gridApiRef, rowData);
      return () => {
        queryClient.removeQueries(["getCashPaymentData"]);

        gridApiRef?.current?.setGridOption("rowData", []);
      };
    }
  }, [data, docCD, parameterData]);

  //* check error exist
  const isErrorExist =
    isError || parameterIsError || CRIsError || saveCashRemiPayment?.isError;

  //* check error messages
  const errorMessages =
    error || parameterError || CRError || saveCashRemiPayment?.error;

  //* set table label
  cashRemiPaymentMetadata.GridMetaDataType.gridLabel =
    utilFunction.getDynamicLabel(
      useLocation().pathname,
      authState?.menulistdata,
      true
    );

  return {
    isErrorExist,
    errorMessages,
    agGridProps,
    gridApiRef,
    authState,
    docCD,
    isLoading,
    saveCashRemiPayment,
    refetch,
    handleAddNewRow,
    handleCustomCellKeyDown,
    TableRef,
    isOpenDenomination,
    tableData,
    setIsOpenDenomination,
    setTableData,
    currentRowData,
    remainingAmt,
    denoLoader,
    retrieveDenoLoader,
    denoIsError,
    retrieveIsError,
    denoError,
    retrieveError,
    openPdfViewer,
    printBlob,
    printLoader,
    setOpenPdfViewer,
    setPrintBlob,
    printIsError,
    printError,
    setRemainingAmt,
    isFetching,
    denoDisplayMode,
    setDenoDisplayMode,
  };
};

export default useCashRemiPayment;
