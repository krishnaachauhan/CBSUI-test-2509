import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { t } from "i18next";
import {
  getGridRowData,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import { usePopupContext } from "@acuteinfo/common-base";
import { useMutation, useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { cashRemiReceiptMetadata } from "./CashRemiReceiptMetadata";
import { isEmpty } from "lodash";
import { enqueueSnackbar } from "notistack";

const useCashRemiReceipt = () => {
  const gridApiRef = useRef<any>();
  const codeRef = useRef<any>();
  const formDataRef = useRef<any>();
  const TableRef = useRef<any>();
  const currentRowData = useRef<any>();

  const [isOpenDenomination, setIsOpenDenomination] = useState(false);
  const [remainingAmt, setRemainingAmt] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [denoDisplayMode, setDenoDisplayMode] = useState("new");
  const [openCodeDialog, setOpenCodeDialog] = useState(false);

  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  //* get parameter to view denomination table
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

  //* retrieve 1st section form data
  const {
    mutate: formMutate,
    data: formData,
    error: formError,
    isError: formIsError,
    isLoading: formIsLoading,
  }: any = useMutation(API.getFirstSectionFormdata, {
    onSuccess: (data) => {
      formDataRef.current = data;
    },
  });

  //* retrieve 2nd section grid data
  const {
    mutateAsync: gridMutate,
    isError: gridIsError,
    error: gridError,
    isLoading: gridIsLoading,
  }: any = useMutation(API.getSecondSectionGridData, {
    onSuccess: (data) => {
      setRowData(data);
    },
  });

  //* confirm or reject records
  const {
    mutateAsync: confirmReject,
    isError: CRIsError,
    error: CRError,
  }: any = useMutation(API.confirmOrRejectEntry);

  //* get initially deno. data
  const {
    mutate: getData,
    isLoading: denoLoader,
    isError: denoIsError,
    error: denoError,
  }: any = useMutation(API.getInitialPendingDeno, {
    onSuccess: (data) => {
      const filteredData = data?.filter((item) => !isEmpty(item?.DENO_LABLE));
      setTableData(filteredData);
    },
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
  });

  //* amount column validate api
  const {
    mutateAsync: amountMutate,
    isError: amountIsError,
    error: amountError,
  }: any = useMutation(API.amountValidate);

  //* retrieve cash receipt data in confirmation screen
  const {
    mutate: retriveConfData,
    isLoading: retrieveConfLoader,
    isError: retrieveConfIsError,
    error: retrieveConfError,
  }: any = useMutation(API.retrieveCashReceiptData, {
    onSuccess: (data) => {
      setRowData(data);
    },
  });

  const confirmOrReject = async ({ TRAN_CD, FLAG, SR_CD, BRANCH_CD }) => {
    const data = await confirmReject({
      BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
      FLAG: FLAG ?? "",
      SR_CD: SR_CD ?? "",
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: BRANCH_CD || authState?.user?.branchCode,
      TRAN_CD: TRAN_CD ?? "",
      SCREEN_REF: docCD ?? "",
    });
    return data;
  };

  const setRowData = (data) => {
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
        TO_ACCT_CD: item?.TO_ACCT_CD,
        TO_ACCT_TYPE: item?.TO_ACCT_TYPE,
        TO_BRANCH_CD: item?.TO_BRANCH_CD,
        TO_COMP_CD: item?.TO_COMP_CD,
        REMARKS: item?.REMARKS,
        SEND_THROUGH: item?.SEND_THROUGH,
        TO_BRANCH: item?.TO_BRANCH,
        TRAN_CD: item?.TRAN_CD,
        TRAN_DT: item?.TRAN_DT,
        VISIBLE_DENO: item?.VISIBLE_DENO,
        CHEQUE_NO: item?.CHEQUE_NO,
        ENTERED_DATE: item?.ENTERED_DATE,
        SR_CD: item?.SR_CD,
        ALLOW_DEL: item?.ALLOW_DEL,
      };
    });

    const rowData =
      docCD === "TRN/624"
        ? [...formattedRowdata]
        : [
            ...formattedRowdata,
            {
              DENO_FLAG: parameterData?.[0]?.DENO_FLAG,
              REMARKS: "CASH RECEIPT",
              TO_BRANCH_CD: authState?.user?.branchCode,
            },
          ];
    //* set row data
    gridApiRef?.current?.setGridOption("rowData", rowData);
  };

  //* add new row with validations
  const handleAddNewRow = async () => {
    const rowData = getGridRowData(gridApiRef);
    const lastColumn = rowData?.[rowData?.length - 1];
    const missingField = validatePayload(lastColumn);
    if (missingField) {
      MessageBox({
        message: t(
          "PleaseFillInAllRequiredFieldsWithValidInformationToProceed"
        ),
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
    } else {
      gridApiRef.current.applyTransaction({
        add: [
          {
            DENO_FLAG: parameterData?.[0]?.DENO_FLAG,
            REMARKS: "CASH RECEIPT",
            TO_BRANCH_CD: authState?.user?.branchCode,
          },
        ],
      });
      if (currentRowData?.current) {
        let api = currentRowData.current?.api;
        let node = currentRowData.current?.node;
        await api?.setFocusedCell(node.rowIndex + 1, "TO_BRANCH_CD");
        await api?.startEditingCell({
          rowIndex: node.rowIndex + 1,
          colKey: "TO_BRANCH_CD",
        });
      }
    }
  };

  //* save records
  const saveCashRemiPayment: any = useMutation(API.saveCashRemiReciept, {
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

          if (btnName === "Yes") {
            currentRowData.current = {};
            handleAddNewRow();
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
          enqueueSnackbar(t("ReceiptSavedSuccessfully"), {
            variant: "success",
          });
          await gridMutate({
            TRAN_CD: formData?.[0]?.TRAN_CD,
            COMP_CD: formData?.[0]?.FROM_COMP_CD,
            LOGIN_BRANCH: authState.user?.branchCode,
            BRANCH_CD: formData?.[0]?.FROM_BRANCH_CD,
          });
        }
      }
    },
    onError: (error: any, variables?: any) => {},
  });

  const handleSaveData = async (node, api) => {
    const formData = await formDataRef?.current?.[0];

    const missingField = validatePayload(node.data);
    if (missingField) {
      const btnName = await MessageBox({
        message: t(
          "PleaseFillInAllRequiredFieldsWithValidInformationToProceed"
        ),
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      if (btnName === "Ok") {
        const rowIndex = node.rowIndex;

        const colKey = missingField;

        //* Focus the first error cell and start editing
        await api.setFocusedCell(node?.rowIndex, colKey);
        await api.startEditingCell({
          rowIndex,
          colKey,
        });
      }
    } else {
      const btnName = await MessageBox({
        message: t("Proceed ?"),
        messageTitle: t("Confirmation"),
        icon: "CONFIRM",
      });

      const formattedData = {
        ACCT_NM: node.data?.ACCT_NM,
        AMOUNT: node.data?.AMOUNT,
        TO_BRANCH_CD: node.data?.TO_BRANCH_CD,
        TO_ACCT_TYPE: node.data?.TO_ACCT_TYPE,
        TO_ACCT_CD: node.data?.TO_ACCT_CD,
        REMARKS: node.data?.REMARKS,
        DENO_FLAG: node.data?.DENO_FLAG ?? "",
      };

      const transformedData = {
        REMIT_DTL: formattedData,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
        SCREEN_REF: docCD ?? "",
        FROM_BRANCH: formData?.FROM_BRANCH_CD ?? "",
        TRAN_CD: formData?.TRAN_CD ?? "",
        DENO_DTL: currentRowData?.current?.node?.data?.DENO_DTL ?? [],
      };
      if (btnName === "Ok") {
        await saveCashRemiPayment.mutateAsync(transformedData);
      }
    }
  };

  const validatePayload = (payload) => {
    const requiredFields = [
      "TO_ACCT_TYPE",
      "TO_ACCT_CD",
      "AMOUNT",
      "TO_BRANCH_CD",
    ];
    let missingField;
    if (payload) {
      missingField = requiredFields.find(
        (key) =>
          !(key in payload) ||
          payload[key] === null ||
          payload[key] === undefined ||
          (typeof payload[key] === "string" && payload[key].trim() === "") ||
          (typeof payload[key] === "number" && isNaN(payload[key]))
      );
    }

    if (missingField) {
      return missingField;
    }
  };

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: cashRemiReceiptMetadata.columns({
      authState,
      setIsOpenDenomination,
      retrieveDenoData,
      confirmOrReject,
      CloseMessageBox,
      docCD,
      setDenoDisplayMode,
    }),
  };

  //* check error exist
  const isErrorExist =
    parameterIsError ||
    CRIsError ||
    saveCashRemiPayment?.isError ||
    formIsError ||
    gridIsError ||
    amountIsError ||
    retrieveConfIsError;

  //* check error messages
  const errorMessages =
    parameterError ||
    CRError ||
    saveCashRemiPayment?.error ||
    formError ||
    gridError ||
    amountError ||
    retrieveConfError;

  useEffect(() => {
    if (formData && codeRef?.current?.TRAN_CD) {
      gridMutate({
        TRAN_CD: codeRef?.current?.TRAN_CD ?? "",
        COMP_CD: formData?.[0]?.FROM_COMP_CD ?? "",
        LOGIN_BRANCH: authState.user?.branchCode ?? "",
        BRANCH_CD: formData?.[0]?.FROM_BRANCH_CD ?? "",
      });
    }
  }, [formData, codeRef?.current?.TRAN_CD]);

  useEffect(() => {
    if (docCD === "TRN/624") {
      gridApiRef?.current?.setGridOption("rowData", []);

      retriveConfData({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState.user?.branchCode ?? "",
      });
    } else {
      codeRef.current = {};
      setOpenCodeDialog(true);
      gridApiRef?.current?.setGridOption("rowData", []);
    }
  }, [docCD]);

  //* set table label
  cashRemiReceiptMetadata.GridMetaDataType.gridLabel =
    docCD === "TRN/624"
      ? `${t("CashRemittanceReceiptConfirmation")} (${docCD})`
      : "";

  const handleCustomCellKeyDown = useCallback(async (params, lastColumn) => {
    const {
      column: { colDef },
      api,
      node,
      context,
      value,
    } = params;

    if (lastColumn?.colId === colDef.field) {
      const codeData = context?.gridContext?.codeData;
      const formData = context?.gridContext?.formData?.[0];

      const data = await amountMutate({
        COMP_CD: formData?.FROM_COMP_CD ?? "",
        BRANCH_CD: formData?.FROM_BRANCH_CD ?? "",
        TRAN_CD: formData?.TRAN_CD ?? "",
        AMOUNT: value ?? "",
      });

      const response: any = await handleDisplayMessages(
        data,
        context.MessageBox
      );

      if (isEmpty(response)) {
        updateNodeDataAndFocus(node, { [colDef.field]: "" }, api, {
          isFieldFocused: true,
          focusedAccessor: colDef.field,
        });
      } else if (response?.O_STATUS === "0") {
        if (
          value &&
          node.data.DENO_FLAG === "Y" &&
          !currentRowData?.current?.node?.data?.DENO_DTL
        ) {
          const existingLoaders = node.data.loader || [];

          const updatedLoader = [
            ...existingLoaders.filter((err) => err.field !== colDef.field),
          ];

          node.setData({
            ...node.data,
            loader: [...updatedLoader, { field: colDef.field, loader: false }],
          });
          currentRowData.current = { node, api };
          setDenoDisplayMode("new");
          setIsOpenDenomination(true);
          setRemainingAmt(value);
          await getData({
            TO_BRANCH:
              node.data?.TO_BRANCH_CD || authState?.user?.branchCode || "",
            COMP_CD: authState?.companyID ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            FROM_BRANCH_CD: formData?.FROM_BRANCH_CD ?? "",
            TRAN_CD: codeData?.TRAN_CD ?? "",
            DAILY_TRN_CD: codeData?.DAILY_TRN_CD ?? "",
          });
        } else {
          if (value) await handleSaveData(node, api);
        }
      }
    }
    return true;
  }, []);

  return {
    isErrorExist,
    errorMessages,
    agGridProps,
    gridApiRef,
    authState,
    docCD,
    handleAddNewRow,
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
    setRemainingAmt,
    denoDisplayMode,
    setDenoDisplayMode,
    codeRef,
    formMutate,
    formData,
    amountMutate,
    handleSaveData,
    gridMutate,
    gridIsLoading,
    formIsLoading,
    openCodeDialog,
    setOpenCodeDialog,
    retriveConfData,
    retrieveConfLoader,
    handleCustomCellKeyDown,
  };
};

export default useCashRemiReceipt;
