import { GradientButton, usePopupContext } from "@acuteinfo/common-base";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import { getCarousalCards } from "pages_audit/pages/operations/AcctCardScaningEntry/api";
import { getTabsByParentType } from "pages_audit/pages/operations/denomination/api";
import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useMutation } from "react-query";

const useGridHelper = (props) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  type AcctDataType = {
    ACCT_TYPE?: string;
    ACCT_CD?: string;
    BRANCH_CD?: string;
    COMP_CD?: string;
    SCREEN_REF?: string;
    [key: string]: any;
  };

  const [dialogState, setDialogState] = useState<{
    isAcctMstOpen: boolean;
    isPhotoSignOpen: boolean;
    acctData: AcctDataType;
    isAcctDtlOpen: boolean;
    isSearchAcctOpen: boolean;
    isJointDtlOpen: boolean;
    setValueOnDoubleClick: (_value: any) => void;
  }>({
    isAcctMstOpen: false,
    isPhotoSignOpen: false,
    acctData: {},
    isAcctDtlOpen: false,
    isSearchAcctOpen: false,
    isJointDtlOpen: false,
    setValueOnDoubleClick: (_value: any) => {},
  });

  const acctData = dialogState.acctData;

  const handleDialogClose = useCallback((screenFlag, data) => {
    localStorage.removeItem("commonClass");
    setDialogState((prevState) => {
      if (prevState.isAcctMstOpen)
        return { ...prevState, isAcctMstOpen: false };
      if (prevState.isPhotoSignOpen)
        return { ...prevState, isPhotoSignOpen: false };
      if (prevState.isAcctDtlOpen)
        return { ...prevState, isAcctDtlOpen: false };
      if (prevState.isSearchAcctOpen) {
        if (screenFlag) prevState?.setValueOnDoubleClick?.(screenFlag);
        return { ...prevState, isSearchAcctOpen: false };
      }
      if (prevState.isJointDtlOpen)
        return { ...prevState, isJointDtlOpen: false };
      return prevState;
    });
  }, []);

  // Shortcut: Ctrl+J for Joint Details dialog
  const handleCtrlJ = useCallback((e, gridApi) => {
    if (e.ctrlKey && e.key.toLowerCase() === "j") {
      e.preventDefault();
      const isInsideGrid = document.activeElement?.closest(".ag-root");
      if (!isInsideGrid) return;
      const api = gridApi?.current;
      const focusedCell = api?.getEditingCells?.()?.[0];
      if (!focusedCell) return;
      const context = focusedCell?.column?.beans?.gridOptions?.context;
      const rowIndex = focusedCell.rowIndex;
      const column = focusedCell.column;
      const colDef = column.getColDef();
      const node = api.getDisplayedRowAtIndex(rowIndex);
      const rowData = node?.data || {};
      const fieldName = colDef?.field || "";
      const acctDtlReqPara = context?.gridContext?.acctDtlReqPara || {};
      const acctObj = acctDtlReqPara[fieldName];
      const value = (document.activeElement as HTMLInputElement)?.value ?? "";
      const payload = {
        BRANCH_CD: rowData?.[acctObj?.BRANCH_CD] || acctObj?.BRANCH_CD || "",
        ACCT_TYPE: rowData?.[acctObj?.ACCT_TYPE] ?? "",
        ACCT_CD: value,
        COMP_CD: context?.gridContext?.authState?.companyID ?? "",
        SCREEN_REF: acctObj?.SCREEN_REF ?? "",
      };
      if (payload?.ACCT_TYPE)
        setDialogState((prevState) => ({
          ...prevState,
          acctData: { ...payload },
          isJointDtlOpen: true,
        }));
    }
  }, []);

  useEffect(() => {
    const listener = (e) => handleCtrlJ(e, props?.getGridApi);
    window.addEventListener("keydown", listener, true);
    return () => window.removeEventListener("keydown", listener, true);
  }, [handleCtrlJ, props?.getGridApi]);

  // Mutations
  const getAccountDetails = useMutation(getCarousalCards, {
    onSuccess: () => {},
    onError: async (error: { error_msg?: string }) => {
      await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  const getTabDetails = useMutation(getTabsByParentType, {
    onSuccess: () => {},
    onError: async (error: { error_msg?: string }) => {
      await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  // Fetch tab/account details when dialog opens
  useEffect(() => {
    if (dialogState.isAcctDtlOpen && acctData) {
      getTabDetails.mutate({ reqData: acctData });
      getAccountDetails.mutate({
        PARENT_TYPE: "",
        ACCT_TYPE: acctData?.ACCT_TYPE,
        ACCT_CD: acctData?.ACCT_CD,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      });
    }
    if (dialogState.isAcctDtlOpen) {
      localStorage.setItem("commonClass", "AcctTab");
    }
  }, [dialogState.isAcctDtlOpen]);

  //* Shortcut keys handler for grid cells
  const handleShortKeys = useCallback(async (params) => {
    const { event, column, api, node, context } = params;
    const setFieldDataFn = async (value) => {
      const field = column?.colDef?.field;
      if (field && value) {
        api.stopEditing(true);
        node.setData({ ...node.data, [field]: value });
        api.refreshCells({ rowNodes: [node], columns: [field], force: true });
        api.setFocusedCell(node.rowIndex, field);
        api.startEditingCell({ rowIndex: node.rowIndex, colKey: field });
        setTimeout(() => {
          const editorInstance = api.getCellEditorInstances?.()?.[0];
          if (editorInstance?.componentInstance?.setValue) {
            editorInstance.componentInstance.setValue(value);
          }
        }, 10);
      }
    };
    const { acctDtlReqPara } = context?.gridContext || {};
    const { value } = event.target || {};
    let fieldName = column?.colDef?.field || "";
    let acctObj = acctDtlReqPara?.[fieldName];
    const payload = {
      BRANCH_CD: node?.data?.[acctObj?.BRANCH_CD] || acctObj?.BRANCH_CD || "",
      ACCT_TYPE: node?.data?.[acctObj?.ACCT_TYPE] ?? "",
      ACCT_CD: value ?? "",
      COMP_CD: context?.gridContext?.authState?.companyID ?? "",
      SCREEN_REF: acctObj?.SCREEN_REF ?? "",
    };
    const openDialog = (dialogKey) => {
      if (payload?.ACCT_TYPE && value)
        setDialogState((prevState) => ({
          ...prevState,
          acctData: { ...payload },
          [dialogKey]: true,
        }));
    };
    if (event.key === "F6" && payload?.ACCT_CD) {
      event.preventDefault();
      setDialogState((prevState) => ({
        ...prevState,
        acctData: { ...payload },
        isAcctMstOpen: true,
      }));
    } else if (event.key === "F9") {
      event.preventDefault();
      if (payload?.ACCT_TYPE && value) openDialog("isPhotoSignOpen");
    } else if (event.shiftKey && event.key === "F4") {
      event.preventDefault();
      openDialog("isAcctDtlOpen");
    } else if (event.key === "F5" && payload?.ACCT_TYPE) {
      event.preventDefault();
      setDialogState((prevState) => ({
        ...prevState,
        acctData: { ...payload },
        isSearchAcctOpen: true,
        setValueOnDoubleClick: setFieldDataFn,
      }));
    }
  }, []);

  const headingWithButton = useMemo(
    () => (
      <div
        className="AcctTab"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: "-1",
        }}
      >
        {"Account Details"}
        <GradientButton
          onClick={() => {
            handleDialogClose(undefined, undefined);
            localStorage.removeItem("commonClass");
          }}
          color={"primary"}
        >
          {t("close")}
        </GradientButton>
      </div>
    ),
    [handleDialogClose]
  );

  return {
    headingWithButton,
    dialogState,
    handleDialogClose,
    handleShortKeys,
    acctData,
    getTabDetails,
    getAccountDetails,
  };
};

export default useGridHelper;
