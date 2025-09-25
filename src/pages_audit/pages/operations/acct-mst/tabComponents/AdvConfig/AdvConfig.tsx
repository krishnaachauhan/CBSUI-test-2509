import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "pages_audit/auth";
import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  utilFunction,
} from "@acuteinfo/common-base";
import { advConfGridMetaData } from "./advConfigGridMetaData";
import { AdvConfMstForm } from "../AdvConfigTab/advConfMstForm/advConfMstForm";
import { t } from "i18next";
import { AcctMSTContext } from "../../AcctMSTContext";
import TabNavigate from "../../TabNavigate";
import _ from "lodash";
import { format } from "date-fns";

export const AdvConfig = () => {
  const actions: ActionTypes[] = [
    {
      actionName: "add",
      actionLabel: "Add",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
      shouldExclude: () => true,
    },
    {
      actionName: "add",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
  ];
  const {
    AcctMSTState,
    handleFormDataonSavectx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleModifiedColsctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
  } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const myGridRef = useRef<any>(null);
  const [openDialog, setOpenDialg] = useState<boolean>(false);
  const [gridData, setGridData] = useState<any>([]);
  const [initialData, setInitialData] = useState({});
  const payloadData = useRef<any>([]);

  useEffect(() => {
    if (AcctMSTState?.isFreshEntryctx) {
      if (Array.isArray(AcctMSTState?.formDatactx?.["ADVANCE_CONFIG_DTL"])) {
        setGridData([...AcctMSTState?.formDatactx["ADVANCE_CONFIG_DTL"]]);
      } else {
        setGridData([]);
      }
    } else {
    }
  }, []);

  useEffect(() => {
    if (!AcctMSTState?.isFreshEntryctx) {
      let retrieveData: any =
        AcctMSTState?.retrieveFormDataApiRes?.ADVANCE_CONFIG_DTL;
      if (Array.isArray(retrieveData) && retrieveData?.length) {
        let trimValue = retrieveData.map((item) => {
          return {
            ...item,
            CODE: item?.CODE.trim(),
            SR_CD_ID_NO: item?.SR_CD + item?.ID_NO,
          };
        });
        setGridData(trimValue);
      }
    }
  }, []);

  useEffect(() => {
    let oldGridData: any =
      AcctMSTState?.retrieveFormDataApiRes?.ADVANCE_CONFIG_DTL ?? [];

    let newGridData =
      Array.isArray(gridData) && gridData?.length
        ? gridData?.map((item) => {
            const {
              SR_CD_ID_NO,
              _displaySequence,
              _error,
              _isTouchedCol,
              _oldData,
              _touched,
              DETAILS_DATA,
              // ID_NO,
              COMMON,
              _UPDATEDCOLUMNS,
              _OLDROWVALUE,
              ...rest
            } = item;
            return rest;
          })
        : [];

    if (!AcctMSTState?.isFreshEntryctx) {
      oldGridData?.forEach((item) => {
        if (item?.CODE) {
          item.CODE = item.CODE.trim();
        }
      });
    }
    let updateData = utilFunction.transformDetailDataForDML(
      oldGridData,
      newGridData,
      ["SR_CD", "ID_NO"]
    );

    if (updateData?.isNewRow && Array.isArray(updateData.isNewRow)) {
      updateData.isNewRow.forEach((row) => {
        row.TO_EFF_DATE = Boolean(row.TO_EFF_DATE)
          ? format(utilFunction.getParsedDate(row.TO_EFF_DATE), "dd/MMM/yyyy")
          : "";
        row.FROM_EFF_DATE = Boolean(row.FROM_EFF_DATE)
          ? format(utilFunction.getParsedDate(row.FROM_EFF_DATE), "dd/MMM/yyyy")
          : "";
        row.FLAG = Boolean(row.FLAG) ? "Y" : "N";
        row.AMOUNT_UPTO = Boolean(row.AMOUNT_UPTO) ? row.AMOUNT_UPTO : "0";
      });
    }

    if (updateData.isUpdatedRow && Array.isArray(updateData.isUpdatedRow)) {
      updateData.isUpdatedRow.forEach((row) => {
        row.TO_EFF_DATE = Boolean(row.TO_EFF_DATE)
          ? format(utilFunction.getParsedDate(row.TO_EFF_DATE), "dd/MMM/yyyy")
          : "";
        row.FROM_EFF_DATE = Boolean(row.FROM_EFF_DATE)
          ? format(utilFunction.getParsedDate(row.FROM_EFF_DATE), "dd/MMM/yyyy")
          : "";
        row.FLAG = Boolean(row.FLAG) ? "Y" : "N";
        row.AMOUNT_UPTO = Boolean(row.AMOUNT_UPTO) ? row.AMOUNT_UPTO : "0";
      });
    }

    if (updateData.isDeleteRow && Array.isArray(updateData.isDeleteRow)) {
      updateData.isDeleteRow.forEach((row) => {
        row.TO_EFF_DATE = Boolean(row.TO_EFF_DATE)
          ? format(utilFunction.getParsedDate(row.TO_EFF_DATE), "dd/MMM/yyyy")
          : "";
        row.FROM_EFF_DATE = Boolean(row.FROM_EFF_DATE)
          ? format(utilFunction.getParsedDate(row.FROM_EFF_DATE), "dd/MMM/yyyy")
          : "";
        row.FLAG = Boolean(row.FLAG) ? "Y" : "N";
        row.AMOUNT_UPTO = Boolean(row.AMOUNT_UPTO) ? row.AMOUNT_UPTO : "0";
      });
    }
    payloadData.current = updateData;
  }, [gridData]);

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

  advConfGridMetaData.gridConfig.subGridLabel = `${t("Code")} : ${acountNum()}
    \u00A0\u00A0   ${t("Name")} : ${
    AcctMSTState?.isFreshEntryctx ? " — " : retrieveValue?.ACCT_NM
  }`;

  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "add") {
      setInitialData(data?.rows?.[0]?.data);
      setOpenDialg(true);
    }
  }, []);

  const handleSave = async (e, flag) => {
    if (AcctMSTState?.isFreshEntryctx) {
      let newTabsData = AcctMSTState?.formDatactx;
      newTabsData["ADVANCE_CONFIG_DTL"] = [...payloadData?.current?.isNewRow];
      handleFormDataonSavectx(newTabsData);
    } else {
      // on edit
    }
    let isTab = typeof flag === "string" ? flag.split(" ") : [];
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
    handleCurrFormctx({
      currentFormSubmitted: true,
      isLoading: false,
    });
  };
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

  return (
    <>
      <GridWrapper
        key={`acct-adv-config`}
        finalMetaData={advConfGridMetaData as GridMetaDataType}
        data={gridData ?? []}
        setData={setGridData}
        loading={false}
        actions={actions}
        setAction={setCurrentAction}
        ref={myGridRef}
      />

      {openDialog && (
        <AdvConfMstForm
          setGridData={setGridData}
          gridData={gridData}
          initialData={initialData}
          acountNum={acountNum}
          closeDialog={() => setOpenDialg(false)}
        />
      )}

      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={false}
      />
    </>
  );
};
