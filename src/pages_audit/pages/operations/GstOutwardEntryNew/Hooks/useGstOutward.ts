import {
  ClearCacheContext,
  displayNumber,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { GstOutwardDetailGrid } from "../GstOutwardEntry/gstOutwardColumn";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { format, parse } from "date-fns";
import * as API from "../../gstOutwardEntry/api";
import * as APIs from "../../gstOutwardEntry/gstOutwardEntryConfirmation/api";
import { t } from "i18next";
import { GeneralAPI } from "registry/fns/functions";
import { validateGridAndGetData } from "components/agGridTable/utils/helper";

const useGstOutward = ({
  ClosedEventCall,
  defaultView,
  screenFlag,
  refetchData,
}) => {
  const { state: rows }: any = useLocation();

  const myRef = useRef<any>(null);
  const gridApi = useRef<any>();
  const oldDataRef = useRef<any>(null);

  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const [dilogueOpen, setDilogueOpen] = useState(false);
  const [totalTaxAmount, setTotalTaxAmount] = useState<number>(0);
  const [trancdjoin, setTrancdJoin] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const [saveButton, setSaveButton] = useState(true);
  const [previousValue, setPreviousValue] = useState([]);

  let currentPath = useLocation().pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  //* helper functions
  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  const getRowData = (): any[] => {
    if (!gridApi.current) return [];
    const rowData: any[] = [];
    gridApi.current.forEachNode((node) => rowData.push(node.data));

    return rowData;
  };

  const closeDialog = () => {
    if (ClosedEventCall) ClosedEventCall();
  };

  const formMetaData = cloneDeep(GstOutwardDetailGrid);
  const metaData = useMemo(() => {
    let myColumns = formMetaData.form.label;
    if (defaultView === "view" || defaultView === "edit") {
      myColumns = `${utilFunction?.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        true
      )}  TRAN-CD: ${rows?.[0]?.data?.REF_TRAN_CD} ACCT-NM: ${
        rows?.[0]?.data?.ACCT_NM
      }`;
    } else {
      myColumns = utilFunction?.getDynamicLabel(
        currentPath,
        authState?.menulistdata,
        true
      );
    }
    return {
      ...formMetaData,

      form: {
        ...formMetaData.form,
        label: myColumns,
      },
    };
  }, [defaultView, formMetaData]);

  //* Api calls
  const { isLoading, data, isError, error, refetch } = useQuery<any, any>(
    ["getGstOutwardGridRetrive", rows?.[0]?.data?.REF_TRAN_CD],
    () =>
      API.getGstOutwardGridRetrive({
        comp_cd: authState?.companyID,
        branch_cd: authState?.user?.branchCode,
        ref_tran_cd: rows?.[0]?.data?.REF_TRAN_CD,
      }),
    {
      enabled: defaultView === "view" || defaultView === "edit",
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          oldDataRef.current = data;
          gridApi.current.setGridOption("rowData", data);

          let totalChargeAmount = 0;
          let totalTaxAmount = 0;

          data.forEach((node) => {
            totalChargeAmount += parseFloat(node?.TAXABLE_VALUE ?? 0);
            totalTaxAmount += parseFloat(node?.TAX_AMOUNT ?? 0);
          });

          const totalFinalAmount = totalChargeAmount + totalTaxAmount;
          setTotalTaxAmount(totalFinalAmount);
          gridApi.current.setGridOption("pinnedBottomRowData", [
            {
              TEMP_DISP: "Total",
              TAXABLE_VALUE: displayNumber(totalChargeAmount),
              TAX_AMOUNT: displayNumber(totalTaxAmount),
              REMARKS: displayNumber(totalFinalAmount),
            },
          ]);
        }
      },
    }
  );

  const mutation = useMutation(API.getGstOutwardENtryDML, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (data?.[0]?.O_STATUS === "9") {
        const VoucherConfirmation = await MessageBox({
          messageTitle: data?.[0]?.O_MSG_TITLE,
          message: data?.[0]?.O_MESSAGE,
          buttonNames: ["Ok"],
        });
        if (VoucherConfirmation === "Ok") {
          CloseMessageBox();
          closeDialog();
          refetchData();
        }
      } else {
        CloseMessageBox();
        closeDialog();
        refetchData();
        enqueueSnackbar(t("Success"), {
          variant: "success",
        });
      }
    },
  });
  const { data: dateData } = useQuery<any, any>(["getBussinessDate"], () =>
    GeneralAPI.getBussinessDate({
      SCREEN_REF: docCD,
    })
  );
  const singleDeletemutation = useMutation(API.getGstOutwardENtryDML, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      CloseMessageBox();
      refetch();
      enqueueSnackbar(t("Success"), {
        variant: "success",
      });
    },
  });

  const viewVoucherMutate = useMutation(APIs.getVoucherDetail, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      const btnName = await MessageBox({
        message: data?.[0]?.VOUCHER_MESSAGE,
        messageTitle: "Voucher",
        buttonNames: ["Ok"],
      });
      if (btnName === "Ok") {
        CloseMessageBox();
      }
    },
  });

  const confirmationAccept = useMutation(API.gstOutwardEntryConfirmation, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      CloseMessageBox();
      closeDialog();
      refetchData();
      enqueueSnackbar(t("Success"), {
        variant: "success",
      });
    },
  });

  const onSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    //@ts-ignore
    endSubmit(true);
    if (defaultView === "new" && action === "Save") {
      const result = validateGridAndGetData(gridApi);
      const rowData = result?.rowData ?? [];
      const isError = result?.isError ?? false;
      const transformedData = {
        _isNewRow: true,
        BRANCH_CD: data?.BRANCH_CD?.trim() ?? "",
        ACCT_TYPE: data?.ACCT_TYPE?.trim() ?? "",
        ACCT_CD: data?.ACCT_CD?.trim() ?? "",
        MODE_OF_PAYMENT: data?.MODE ?? "",
        GST_DTL: rowData?.map((row: any) => {
          return {
            TEMPLATE_CODE: row?.TEMP_DISP?.value || row?.TEMP_DISP,
            TAXABLE_VALUE: row?.TAXABLE_VALUE ?? "",
            TAX_AMOUNT: row?.TAX_AMOUNT ?? "",
            CHEQUE_NO: row?.CHEQUE_NO ? row?.CHEQUE_NO : "0",
            CHEQUE_DT: row?.CHEQUE_DT
              ? format(
                  parse(row?.CHEQUE_DT, "dd/MM/yyyy", new Date()),
                  "dd-MMM-yyyy"
                )
              : "",
            REMARKS: row?.REMARKS ?? "",
          };
        }),
        SCREEN_REF: docCD ?? "",
      };

      if (isError) {
        return;
      } else if (transformedData?.GST_DTL?.length === 0) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: `Atleast one row must be in Detail.`,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
      } else {
        const btnName = await MessageBox({
          message: "SaveData",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
          loadingBtnName: ["Yes"],
        });
        if (btnName === "Yes") {
          mutation.mutate(transformedData);
        }
      }
    } else {
      const singleRowDeleteData = rows?.[0]?.data;
      if (
        new Date(singleRowDeleteData?.ENTERED_DATE).toDateString() !==
        new Date(authState?.workingDate).toDateString()
      ) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: "CannotDeleteBackDatedEntry",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      } else {
        const NewData = getRowData();
        const NewFilter = NewData.map((row) => ({
          ENTERED_BRANCH_CD: row.ENTERED_BRANCH_CD,
          ENTERED_COMP_CD: row.ENTERED_COMP_CD,
          TRAN_CD: row.TRAN_CD,
        }));
        const OldData = oldDataRef?.current;
        const OldFilter = OldData.map((row) => ({
          ENTERED_BRANCH_CD: row.ENTERED_BRANCH_CD,
          ENTERED_COMP_CD: row.ENTERED_COMP_CD,
          TRAN_CD: row.TRAN_CD,
        }));
        const CompareData = utilFunction.transformDetailDataForDML(
          OldFilter ?? [],
          NewFilter,
          ["TRAN_CD"]
        );
        const SingleRowdeleteDataFilter = {
          _isDeleteRow: true,
          ENTERED_BRANCH_CD: authState?.user?.branchCode,
          ENTERED_COMP_CD: authState?.companyID,
          REF_TRAN_CD: singleRowDeleteData?.REF_TRAN_CD,
          BRANCH_CD: singleRowDeleteData?.BRANCH_CD,
          ACCT_TYPE: singleRowDeleteData?.ACCT_TYPE,
          ACCT_CD: singleRowDeleteData?.ACCT_CD,
          AMOUNT: "",
          SCREEN_REF: "GST Outward Entry Screen",
          TRAN_TYPE: "Delete",
          CONFIRMED: singleRowDeleteData?.CONFIRMED,
          ENTERED_BY: singleRowDeleteData?.ENTERED_BY,
          DETAILS_DATA: { ...CompareData },
        };
        const btnName = await MessageBox({
          message: "SaveData",
          messageTitle: "Confirmation",
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });
        if (btnName === "Yes") {
          singleDeletemutation.mutate(SingleRowdeleteDataFilter);
        }
      }
    }
  };

  const handleRemove = async (event) => {
    const formDatass = rows?.[0]?.data;
    if (
      new Date(formDatass?.ENTERED_DATE).toDateString() !==
      new Date(authState?.workingDate).toDateString()
    ) {
      if (defaultView === "edit") {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: "CannotDeleteBackDatedEntry",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      } else {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: "BackDatedEntryCantBeReject",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      }
    } else {
      const deleteData = {
        _isDeleteRow: true,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        ENTERED_COMP_CD: authState?.companyID,
        REF_TRAN_CD: formDatass?.REF_TRAN_CD,
        BRANCH_CD: formDatass?.BRANCH_CD,
        ACCT_TYPE: formDatass?.ACCT_TYPE,
        ACCT_CD: formDatass?.ACCT_CD,
        AMOUNT: totalTaxAmount.toString(),
        SCREEN_REF: "GST Outward Entry Screen",
        TRAN_TYPE: "Delete",
        CONFIRMED: formDatass?.CONFIRMED,
        ENTERED_BY: formDatass?.ENTERED_BY,
        DETAILS_DATA: {
          isNewRow: [],
          isDeleteRow: [],
          isUpdatedRow: [],
        },
      };
      if (screenFlag === "gstEntry") {
        const confirmation = await MessageBox({
          message: "DeleteData",
          messageTitle: "Confirmation",
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });
        if (confirmation === "Yes") {
          mutation.mutate(deleteData);
        }
      } else {
        const confirmation = await MessageBox({
          message: "RejectDeleteRecord",
          messageTitle: "Confirmation",
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });
        if (confirmation === "Yes") {
          mutation.mutate(deleteData);
        }
      }
    }
  };
  const viewVoucher = () => {
    if (
      new Date(rows?.[0]?.data?.ENTERED_DATE).toDateString() !==
      new Date(authState?.workingDate).toDateString()
    ) {
      return "";
    } else {
      viewVoucherMutate.mutate({
        ENT_COMP_CD: rows?.[0]?.data?.ENTERED_COMP_CD,
        ENT_BRANCH_CD: rows?.[0]?.data?.ENTERED_BRANCH_CD,
        GD_DATE: authState?.workingDate,
        TRAN_CD: trancdjoin,
      });
    }
  };
  const Accept = async () => {
    if (
      new Date(rows?.[0]?.data?.ENTERED_DATE).toDateString() !==
      new Date(authState?.workingDate).toDateString()
    ) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "BackDatedEntryCantBeConfirm",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    } else if (rows?.[0]?.data?.LAST_ENTERED_BY === authState?.user?.id) {
      await MessageBox({
        messageTitle: "InvalidConfirmation",
        message: "ConfirmTransactionRestrictionMessage",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    } else if (authState?.role < "2") {
      await MessageBox({
        messageTitle: "InvalidConfirmation",
        message: "ConfirmRightsRestrictionMessage",
        icon: "WARNING",
        buttonNames: ["Ok"],
      });
    } else {
      const confirmation = await MessageBox({
        messageTitle: "Confirmation",
        message: "ConfirmRecord",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (confirmation === "Yes") {
        confirmationAccept.mutate({
          ENTERED_COMP_CD: rows?.[0]?.data?.ENTERED_COMP_CD,
          ENTERED_BRANCH_CD: rows?.[0]?.data?.ENTERED_BRANCH_CD,
          REF_TRAN_CD: rows?.[0]?.data?.REF_TRAN_CD,
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getGstOutwardGridRetrive"]);
    };
  }, [getEntries]);
  return {
    myRef,
    gridApi,
    authState,
    MessageBox,
    dilogueOpen,
    setDilogueOpen,
    disableButton,
    saveButton,
    setSaveButton,
    setPreviousValue,
    docCD,
    handleButtonDisable,
    closeDialog,
    metaData,
    isError,
    error,
    viewVoucherMutate,
    onSubmitHandler,
    handleRemove,
    viewVoucher,
    Accept,
    rows,
    isLoading,
    data,
    dateData,
  };
};

export default useGstOutward;
