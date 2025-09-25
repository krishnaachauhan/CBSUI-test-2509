import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AcctMSTContext } from "../../AcctMSTContext";
import { AuthContext } from "pages_audit/auth";
import { advConfGridMetaData } from "./AdvConfigMetaData";
import { t } from "i18next";
import {
  displayCommonErrorOnSubmit,
  getGridRowData,
  validateGridRow,
} from "components/agGridTable/utils/helper";
import { usePopupContext, utilFunction } from "@acuteinfo/common-base";
import _ from "lodash";

const useAdvConfig = () => {
  const {
    AcctMSTState,
    handleFormDataonSavectx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleModifiedColsctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    handleUpdateAdvConfig,
    handleUpdateLoader,
    submitRefs,
    floatedValue,
  } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const [openDialog, setOpenDialg] = useState<boolean>(false);
  const [gridData, setGridData] = useState<any>([]);
  const { MessageBox } = usePopupContext();

  const [initialData, setInitialData] = useState({});
  const gridApiRef = useRef<any>();
  let retrieveValue = AcctMSTState.retrieveFormDataApiRes?.MAIN_DETAIL;

  let acountNum = () => {
    return `${authState?.companyID?.trim()} ${
      AcctMSTState?.isFreshEntryctx
        ? authState?.user?.branchCode?.trim() ?? ""
        : retrieveValue?.BRANCH_CD?.trim() ?? ""
    } ${
      AcctMSTState?.isFreshEntryctx
        ? AcctMSTState?.accTypeValuectx?.trim()
          ? AcctMSTState?.accTypeValuectx?.trim() ?? ""
          : " — "
        : retrieveValue?.ACCT_TYPE?.trim() ?? ""
    } ${
      AcctMSTState?.isFreshEntryctx
        ? AcctMSTState?.acctNumberctx?.trim()
          ? AcctMSTState?.acctNumberctx?.trim() ?? ""
          : " — "
        : retrieveValue?.ACCT_CD?.trim() ?? ""
    }`;
  };
  // Function to get account name based on context or retrieved value
  let AcctName = () => {
    return `${
      AcctMSTState?.isFreshEntryctx
        ? AcctMSTState?.formDatactx?.["MAIN_DETAIL"]
          ? AcctMSTState?.formDatactx?.["MAIN_DETAIL"]?.ACCT_NM?.trim() ?? ""
          : " — "
        : AcctMSTState?.formDatactx?.["MAIN_DETAIL"]
        ? AcctMSTState?.formDatactx?.["MAIN_DETAIL"]?.ACCT_NM?.trim() ?? ""
        : retrieveValue?.ACCT_NM?.trim() ?? ""
    }`;
  };
  advConfGridMetaData.GridMetaDataType.gridLabel = `${t(
    "Code"
  )} : ${acountNum()}
     \u00A0\u00A0   ${t("Name")} : ${AcctName()}`;

  const submitFunction = async (flag) => {
    const gridData = getGridRowData(gridApiRef) || [];
    const requiredFields = ["CODE", "FROM_EFF_DATE"];
    const missingFieldsWithIndex = await validateGridRow(
      gridData,
      requiredFields,
      MessageBox,
      gridApiRef
    );
    if (missingFieldsWithIndex?.length > 0) {
      submitRefs.current = false;

      return;
    }

    handleUpdateLoader(true);
    let data = await Promise.all(
      gridData?.map(
        async ({
          DISPLAY_CODE,
          DEF_DESC,
          CODE_OPT,
          errors,
          SR_CD_ID_NO,
          IsNewRow,
          ...rest
        }) => {
          const data = await floatedValue(["AMOUNT_UPTO"], rest);

          return {
            ...data,
            FLAG: data?.FLAG === true || data?.FLAG === "Y" ? "Y" : "N",
            AMOUNT_UPTO: data?.AMOUNT_UPTO ? data?.AMOUNT_UPTO : 0,
            SR_CD: data?.SR_CD ? data?.SR_CD : `${data?.SR_CD}-${data?.CODE}`,
          };
        }
      )
    );

    let newTabsData = AcctMSTState?.formDatactx;
    if (AcctMSTState?.isFreshEntryctx) {
      newTabsData["ADVANCE_CONFIG_DTL"] = data?.map((item) => ({
        ...item,
        IsNewRow: true,
      }));
    } else {
      const oldGridData =
        AcctMSTState?.retrieveFormDataApiRes?.ADVANCE_CONFIG_DTL?.map(
          ({ SR_CD_ID_NO, ...rest }) => rest
        );

      let updatedData = utilFunction.transformDetailDataForDML(
        oldGridData ?? [],
        data ?? [],
        ["SR_CD"]
      );
      const updatePayload = {
        ...updatedData,
        IsNewRow: false,
        REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_TYPE: AcctMSTState?.accTypeValuectx,
        ADV_CONFIG_MAIN_TABLE: AcctMSTState?.req_cd_ctx ? "N" : "Y",
      };
      newTabsData["ADVANCE_CONFIG_DTL"] = [updatePayload];
      let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
      const modifiedFields = Object.keys(data[0] || {});

      let updatedCols = tabModifiedCols["ADVANCE_CONFIG_DTL"]
        ? _.uniq([...tabModifiedCols["ADVANCE_CONFIG_DTL"], ...modifiedFields])
        : _.uniq([...modifiedFields]);

      tabModifiedCols = {
        ...tabModifiedCols,
        ADVANCE_CONFIG_DTL: updatedCols,
      };
      handleModifiedColsctx(tabModifiedCols);
    }
    handleFormDataonSavectx(newTabsData);
    handleUpdateAdvConfig({
      advConfig: gridData?.map(({ errors, ...item }) => ({
        ...item,
      })),
    });
    handleStepStatusctx({
      status: "completed",
      coltabvalue: AcctMSTState?.colTabValuectx,
    });
    handleCurrFormctx({
      currentFormSubmitted: true,
      isLoading: false,
    });
    handleUpdateLoader(false);
    let isTab = flag?.split(" ");
    if (isTab[0] === "TabChange") {
      handleStepStatusctx({
        status: "completed",
        coltabvalue: AcctMSTState?.colTabValuectx,
      });
      handleColTabChangectx(Number(isTab[1]));
    }
    if (flag === "UpdateData") {
      onFinalUpdatectx(true);
    }
    submitRefs.current = false;
  };

  const handleSave = useCallback(async (e, flag) => {
    const editingCells = gridApiRef.current?.getEditingCells()?.[0];
    if (editingCells) {
      await gridApiRef.current.startEditingCell({
        rowIndex: editingCells.rowIndex,
        colKey: editingCells?.column?.colId,
      });
      await gridApiRef.current?.tabToNextCell();
      await gridApiRef.current.api?.stopEditing(true);
    }
    await submitFunction(flag);
  }, []);

  useEffect(() => {
    if (AcctMSTState?.isFreshEntryctx) {
      const savedDocData = AcctMSTState?.advConfigObj;
      if (Array.isArray(savedDocData)) {
        setGridData(savedDocData);
      } else if (
        Array.isArray(AcctMSTState?.formDatactx?.["ADVANCE_CONFIG_DTL"])
      ) {
        setGridData([...AcctMSTState?.formDatactx["ADVANCE_CONFIG_DTL"]]);
      } else {
        setGridData([]);
      }
    } else {
      let retrieveData: any =
        AcctMSTState?.retrieveFormDataApiRes?.ADVANCE_CONFIG_DTL;
      const savedDocData = AcctMSTState?.advConfigObj;

      if (Array.isArray(savedDocData)) {
        setGridData(savedDocData);
      } else if (Array.isArray(retrieveData) && retrieveData?.length) {
        let trimValue = retrieveData.map((item) => {
          return {
            ...item,
            CODE: item?.CODE.trim(),
            SR_CD_ID_NO: item?.SR_CD + item?.ID_NO,
            FLAG: item?.FLAG === true || item?.FLAG === "Y" ? true : false,
          };
        });
        setGridData(trimValue);
      }
    }
  }, [gridApiRef?.current]);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "ADV_CONFIG"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = { handleSubmit: handleSave };
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList, handleSave]);

  useEffect(() => {
    let refs = [handleSave];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: AcctMSTState?.colTabValuectx,
      currentFormSubmitted: null,
      isLoading: false,
    });
  }, []);

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: advConfGridMetaData.columns({
      authState,
      setOpenDialg,
      setInitialData,
      gridApiRef,
      acctType: AcctMSTState?.accTypeValuectx,
    }),
    rowData: gridData,
  };

  useEffect(() => {
    if (gridData) {
      gridApiRef?.current?.setGridOption("rowData", gridData);
    }
  }, [gridData]);

  // ag grid Table functionality
  const handleAddNewRow = () => {
    gridApiRef.current?.applyTransaction?.({
      add: [
        {
          // FROM_EFF_DATE: authState?.workingDate ?? "",
          // TO_EFF_DATE: authState?.workingDate ?? "",
          FLAG: false,
          IsNewRow: true,
          _isNewRow: true,
          SR_CD_ID_NO: "",
        },
      ],
    });
  };
  return {
    agGridProps,
    gridApiRef,
    authState,
    AcctMSTState,
    handleAddNewRow,
    openDialog,
    setGridData,
    gridData,
    initialData,
    acountNum,
    setOpenDialg,
    handleSave,
  };
};

export default useAdvConfig;
