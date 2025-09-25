import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AcctMSTContext } from "../../../AcctMSTContext";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import {
  displayCommonErrorOnSubmit,
  getGridRowData,
} from "components/agGridTable/utils/helper";
import { mobileRegMetaData } from "../MobileRegMetaData";
import _ from "lodash";
import { usePopupContext } from "@acuteinfo/common-base";
import { t } from "i18next";

const useMobileRegTab = () => {
  const {
    AcctMSTState,
    handleStepStatusctx,
    handleCurrFormctx,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    submitRefs,
    handleCustFieldsReadOnlyctx,
  } = useContext(AcctMSTContext);
  const { MessageBox } = usePopupContext();

  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const gridApi = useRef<any>();

  const displayMode = AcctMSTState?.formmodectx;
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  useEffect(() => {
    let refs = [formRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: AcctMSTState?.colTabValuectx,
      currentFormSubmitted: null,
      isLoading: false,
    });
  }, []);
  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...mobileRegMetaData };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  useEffect(() => {
    if (
      Boolean(
        AcctMSTState?.currentFormctx.currentFormRefctx &&
          AcctMSTState?.currentFormctx.currentFormRefctx.length > 0
      ) &&
      Boolean(formStatus && formStatus.length > 0)
    ) {
      if (
        AcctMSTState?.currentFormctx.currentFormRefctx.length ===
        formStatus.length
      ) {
        setIsNextLoading(false);
        let submitted;
        submitted = formStatus.filter((form) => !Boolean(form));
        if (submitted && Array.isArray(submitted) && submitted.length > 0) {
          submitted = false;
        } else {
          submitted = true;
          handleStepStatusctx({
            status: "completed",
            coltabvalue: AcctMSTState?.colTabValuectx,
          });
        }
        handleCurrFormctx({
          currentFormSubmitted: submitted,
          isLoading: false,
        });
        setFormStatus([]);
        submitRefs.current = false;
      }
    }
  }, [formStatus]);

  const onFormSubmitHandler = useCallback(async (e, flag) => {
    await gridApi.current?.stopEditing();
    const rowData: any[] = getGridRowData(gridApi) || [];

    if (rowData.some((row) => row.errors && row.errors.length > 0)) {
      submitRefs.current = false;
      displayCommonErrorOnSubmit(gridApi, MessageBox);

      return;
    }

    handleCurrFormctx({ currentFormSubmitted: true, isLoading: true });

    const isFresh = AcctMSTState?.isFreshEntryctx;
    const formData = { ...AcctMSTState?.formDatactx };
    const modifiedCols = { ...AcctMSTState?.modifiedFormCols };

    if (!rowData.length) {
      formData["MOBILE_REG_DTL"] = [];
      if (!isFresh) modifiedCols["MOBILE_REG_DTL"] = [];

      handleFormDataonSavectx(formData);
      if (!isFresh) handleModifiedColsctx(modifiedCols);

      setFormStatus((prev) => [...prev, true]);
    }

    const cleanedRows = rowData.map((row) => {
      const cleanedRow = _.omit(row, [
        "errors",
        "loader",
        "DISPLAY_EMAIL_TYPE",
        "DISPLAY_REG_TYPE",
      ]);

      return {
        ...cleanedRow,
        MOBILE_REG_FLAG:
          row.MOBILE_REG_FLAG === true || row.MOBILE_REG_FLAG === "Y"
            ? "Y"
            : "N",
        IsNewRow: !!row._isNewRow,
      };
    });

    formData["MOBILE_REG_DTL"] = cleanedRows;

    if (!isFresh) {
      const modifiedFields = [
        ...new Set(rowData.flatMap((obj) => Object.keys(obj))),
      ];
      modifiedCols["MOBILE_REG_DTL"] = modifiedFields;
      handleModifiedColsctx(modifiedCols);
    }

    handleFormDataonSavectx(formData);
    setFormStatus((prev) => [...prev, true]);
    submitRefs.current = false;

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
  }, []);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "MOB_REG"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = { handleSubmit: onFormSubmitHandler };
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList, onFormSubmitHandler]);

  const initialVal = useMemo(() => {
    const formMobileRegDtl = AcctMSTState?.formDatactx?.["MOBILE_REG_DTL"];
    const apiMobileRegDtl =
      AcctMSTState?.retrieveFormDataApiRes?.["MOBILE_REG_DTL"];
    const isFresh = AcctMSTState?.isFreshEntryctx;

    let data = [];

    if (isFresh) {
      data = formMobileRegDtl?.length > 0 ? formMobileRegDtl : [];
    } else {
      data = formMobileRegDtl ?? apiMobileRegDtl ?? [];
    }

    return { MOBILE_REG_DTL: [...data] };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.formDatactx?.["MOBILE_REG_DTL"],
    AcctMSTState?.retrieveFormDataApiRes?.["MOBILE_REG_DTL"],
  ]);

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: UpdatedMetadata.columns(),
    rowData: initialVal?.MOBILE_REG_DTL,
  };

  const handleAddNewRow = () => {
    gridApi.current?.applyTransaction?.({
      add: [
        {
          REG_TYPE: "M",
          MOBILE_REG_FLAG: false,
          _isNewRow: true,
        },
      ],
    });
  };
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
  UpdatedMetadata.GridMetaDataType.gridLabel = `${t("Code")} : ${acountNum()}
       \u00A0\u00A0   ${t("Name")} : ${AcctName()}`;
  return {
    agGridProps,
    gridApi,
    displayMode,
    docCD,
    handleAddNewRow,
    onFormSubmitHandler,
    AcctMSTState,
    isNextLoading,
  };
};

export default useMobileRegTab;
