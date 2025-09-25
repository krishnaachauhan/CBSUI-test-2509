import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AcctDocMainGridMetaData } from "pages_audit/pages/operations/acct-mst/tabComponents/DocumentTab/AcctDocMainGridMetaData";
import { CkycContext } from "../../CkycContext";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import * as API from "./api";
import _ from "lodash";
import {
  displayCommonErrorOnSubmit,
  getFormattedDate,
  getGridRowData,
} from "components/agGridTable/utils/helper";
import { usePopupContext, utilFunction } from "@acuteinfo/common-base";
import { ClonedCkycContext } from "../formDetails/formComponents/legalComps/ClonedCkycContext";

const useCkycDocuments = ({ isModal }) => {
  const gridApiRef = useRef<any>();
  const initializedRef = useRef<any>(false);
  const gridRowData = useRef<any>();

  const { MessageBox } = usePopupContext();

  const {
    state: ckycState,
    handleFormDataonSavectx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleModifiedColsctx,
    toNextTab,
    toPrevTab,
    handleColTabChangectx,
    tabFormRefs,
    handleUpdateLoader,
    handleUpdateDocument,
    handleFinalUpdateReq,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);

  const [combinedGridData, setCombinedGridData] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentRowData, setCurrentRowData] = useState<any>({});
  const [loading, setloading] = useState(false);
  const { authState } = useContext(AuthContext);
  const displayMode = ckycState?.formmodectx ?? "new";

  let docTemplatePayload = {
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: authState?.user?.branchCode ?? "",
    CUST_TYPE: ckycState?.entityTypectx,
    CONSTITUTION_TYPE: ckycState?.constitutionValuectx ?? "",
  };
  const validateDocuments: any = useMutation(API.validateDocDate);
  const mutationRet: any = useMutation(API.getDocumentImagesList);

  const setUpdateGridData = async () => {
    setloading(true);
    let apiData = ckycState?.retrieveFormDataApiRes?.["DOC_MST"];
    if (Array.isArray(apiData)) {
      const formatted = await Promise.all(
        apiData?.map(async (row) => {
          const innerGridData = await mutationRet.mutateAsync({
            TRAN_CD: row?.TRAN_CD ?? "",
            SR_CD: row?.SR_CD ?? "",
            REQ_CD: ckycState?.req_cd_ctx ?? "",
          });
          const cleanedRow = _.omit(row, [
            "VERIFIED_MACHINE_NM",
            "VERIFIED_DATE",
            "VERIFIED_BY",
            "MACHINE_NM",
            "LAST_MODIFIED_DATE",
            "LAST_MACHINE_NM",
            "LAST_ENTERED_BY",
            "ENTERED_BY",
          ]);
          const filteredInnerGridData = innerGridData?.map(({ ...rest }) => ({
            ...rest,
          }));

          return row?.TRAN_CD && row?.SR_CD
            ? {
                ...cleanedRow,
                TRANSR_CD: `${row.TRAN_CD}${row.SR_CD}`,
                payload: innerGridData,

                DISPLAY_TEMPLATE_CD: row?.DOC_DESCRIPTION,
              }
            : {
                ...cleanedRow,
                payload: innerGridData,

                DISPLAY_TEMPLATE_CD: row?.DOC_DESCRIPTION,
              };
        })
      );

      setCombinedGridData(formatted);
      gridRowData.current = formatted;

      handleUpdateDocument({
        documents: formatted,
      });
    }
    setloading(false);
  };

  const setupInitialData = async () => {
    if (ckycState?.isFreshEntryctx) {
      const savedDocData = ckycState?.documentObj;

      if (Array.isArray(savedDocData) && savedDocData?.length > 0) {
        setCombinedGridData([...savedDocData]);
        gridRowData.current = [...savedDocData];
      }
    } else {
      const savedDocData = ckycState?.documentObj;
      if (Array.isArray(savedDocData) && savedDocData?.length > 0) {
        setCombinedGridData([...savedDocData]);
        gridRowData.current = [...savedDocData];
      } else {
        setUpdateGridData();
      }
    }
  };

  const handleSave = useCallback((e, flag) => {
    const rawData = getGridRowData(gridApiRef);
    if (
      rawData?.some(
        (row) => (row?.errors && row?.errors?.length > 0) || !row?.TEMPLATE_CD
      )
    ) {
      displayCommonErrorOnSubmit(gridApiRef, MessageBox);
      return;
    }

    const rowWithSrCd = rawData?.map((item) => item?.TEMPLATE_CD);
    const deletedRows = gridRowData?.current
      ?.filter((item) => !rowWithSrCd?.includes(item?.TEMPLATE_CD))
      ?.map((item) => ({
        TRAN_CD: item?.TRAN_CD,
        SR_CD: item?.SR_CD,
        DETAILS_DATA: {
          isDeleteRow: [],
          isNewRow: [],
          isUpdatedRow: [],
        },
        REQ_CD: ckycState?.req_cd_ctx,
        _isDeleteRow: true,
        IS_FROM_MAIN: !Boolean(ckycState?.customerIDctx)
          ? ""
          : !Boolean(item?.req_cd_ctx)
          ? "Y"
          : "N",
        NEW_FLAG: "N",
      }));

    const cleanedDeletedRow = deletedRows?.filter(Boolean);

    // if (AcctMSTState?.isFreshEntryctx) {
    const transformedData = rawData?.map(
      ({ DISPLAY_TEMPLATE_CD, ...row }, index) => {
        const cleanedRow = _.omit(row, [
          "errors",
          "payload",
          "loader",
          "DISPLAY_TEMPLATE_CD",
          "TRANSR_CD",
          "TEMPLATE_CD_OPT",
          "DISPLAY_DOCUMENT_TYPE",
          "CUSTOMER_ID",
        ]);
        let updatedValues;
        let detailsData;
        const baseData: any = {
          ...cleanedRow,
          ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
          SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
          ENTERED_DATE:
            getFormattedDate(row?.ENTERED_DATE ?? "", "dd/MMM/yyyy") ?? "",
          VALID_UPTO:
            getFormattedDate(row?.VALID_UPTO ?? "", "dd/MMM/yyyy") ?? "",
        };

        const payload = row?.payload?.map(({ saved, errors, ...rest }) => rest);
        const payloadCopy = payload ? [...payload] : undefined;
        if (ckycState?.isFreshEntryctx) {
          updatedValues = utilFunction?.transformDetailsData(cleanedRow, []);
          detailsData = {
            isNewRow: payloadCopy ?? [],
            isDeleteRow: [],
            isUpdatedRow: [],
          };
        } else {
          const retrivedData = gridRowData?.current;
          const matchSrCd = retrivedData?.find((item) => {
            return item?.TEMPLATE_CD === row?.TEMPLATE_CD;
          });

          let newCleanedData = _.omit(matchSrCd, [
            "errors",
            "payload",
            "loader",
            "DISPLAY_TEMPLATE_CD",
            "TRANSR_CD",
            "TEMPLATE_CD_OPT",
            "DISPLAY_DOCUMENT_TYPE",
            "CUSTOMER_ID",
          ]);
          const baseData: any = {
            ...cleanedRow,
            ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
            SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
            ENTERED_DATE:
              getFormattedDate(row?.ENTERED_DATE ?? "", "dd/MMM/yyyy") ?? "",
            VALID_UPTO:
              getFormattedDate(row?.VALID_UPTO ?? "", "dd/MMM/yyyy") ?? "",
            DOCUMENT_TYPE: row?.DOCUMENT_TYPE?.trim(),
          };

          updatedValues = utilFunction?.transformDetailsData(baseData, {
            ...newCleanedData,
            ACTIVE:
              newCleanedData?.ACTIVE === true || newCleanedData?.ACTIVE === "Y"
                ? "Y"
                : "N",
            SUBMIT:
              newCleanedData?.SUBMIT === true || newCleanedData?.SUBMIT === "Y"
                ? "Y"
                : "N",
            ENTERED_DATE:
              getFormattedDate(
                newCleanedData?.ENTERED_DATE ?? "",
                "dd/MMM/yyyy"
              ) ?? "",
            VALID_UPTO:
              getFormattedDate(
                newCleanedData?.VALID_UPTO ?? "",
                "dd/MMM/yyyy"
              ) ?? "",
            DOCUMENT_TYPE: row?.DOCUMENT_TYPE?.trim(),
          });
          const sanitizeOldUploadData = gridRowData?.current?.[
            index
          ]?.payload?.map(({ newRow, saved, errors, ...rest }) => ({
            ...rest,
          }));
          const sanitizeNewUploadData = row?.payload?.map(
            ({ newRow, saved, errors, ...rest }) => ({ ...rest })
          );
          detailsData = utilFunction.transformDetailDataForDML(
            sanitizeOldUploadData ?? [],
            sanitizeNewUploadData ?? [],
            ["LINE_CD"]
          );
          updatedValues = {
            ...updatedValues,
            REQ_CD: ckycState?.req_cd_ctx ?? "",
            IS_FROM_MAIN: !Boolean(ckycState?.customerIDctx)
              ? ""
              : !Boolean(row?.req_cd_ctx)
              ? "Y"
              : "N",
            NEW_FLAG: row?._isNewRow || row?.IsNewRow ? "Y" : "N",
            DOC_TYPE: "KYC",
            _isNewRow: Boolean(row?._isNewRow),
          };
        }
        const transformedCopy = { ...updatedValues };

        // transformDetailDataForDML

        return {
          ...baseData,
          DETAILS_DATA: detailsData,
          ...transformedCopy,
        };
      }
    );

    let newTabsData = ckycState?.formDatactx;
    if (ckycState?.customerIDctx || ckycState?.req_cd_ctx) {
      const filteredData = transformedData?.filter(
        (item) =>
          (item?._UPDATEDCOLUMNS && item?._UPDATEDCOLUMNS?.length > 0) ||
          (item?.DETAILS_DATA &&
            (item?.DETAILS_DATA?.isNewRow?.length > 0 ||
              item?.DETAILS_DATA?.isUpdatedRow?.length > 0 ||
              item?.DETAILS_DATA?.isDeleteRow?.length > 0))
      );

      newTabsData["DOC_MST"] = {
        doc_mst_payload: cleanedDeletedRow
          ? [...cleanedDeletedRow, ...filteredData]
          : [...filteredData],
      };
    } else {
      newTabsData["DOC_MST"] = { doc_mst_payload: [...transformedData] };
    }

    handleFormDataonSavectx(newTabsData);
    if (newTabsData["DOC_MST"]?.doc_mst_payload?.length > 0) {
      handleFinalUpdateReq({
        DOC_MST: newTabsData["DOC_MST"]?.doc_mst_payload ?? [],
      });
    }

    handleStepStatusctx({
      status: "completed",
      coltabvalue: ckycState?.colTabValuectx,
    });
    const formattedDocuments = getGridRowData(gridApiRef)?.map((item) => {
      const cleanedRow = _.omit(item, [
        "VERIFIED_MACHINE_NM",
        "VERIFIED_DATE",
        "VERIFIED_BY",
        "MACHINE_NM",
        "LAST_MODIFIED_DATE",
        "LAST_MACHINE_NM",
        "LAST_ENTERED_BY",
        "ENTERED_BY",
      ]);
      return {
        ...cleanedRow,
      };
    });
    handleUpdateDocument({
      documents: formattedDocuments,
    });

    handleCurrFormctx({
      currentFormSubmitted: true,
    });
    if (!ckycState?.isFreshEntryctx) {
      let tabModifiedCols: any = ckycState?.modifiedFormCols;
      const modifiedFields = Object.keys(rawData[0] || {});

      let updatedCols = tabModifiedCols["DOC_MST"]
        ? _.uniq([...tabModifiedCols["DOC_MST"], ...modifiedFields])
        : _.uniq([...modifiedFields]);

      tabModifiedCols = {
        ...tabModifiedCols,
        DOC_MST: updatedCols,
      };
      handleModifiedColsctx(tabModifiedCols);
    }
    if (flag && flag?.startsWith("TabChange")) {
      const tabIndex = parseInt(flag?.split(" ")[1], 10);
      handleStepStatusctx({
        status: "completed",
        coltabvalue: ckycState?.colTabValuectx,
      });
      handleColTabChangectx(tabIndex);
    } else if (
      !ckycState?.customerIDctx?.trim() &&
      !flag?.startsWith("UpdateData")
    ) {
      handleStepStatusctx({
        status: "completed",
        coltabvalue: ckycState?.colTabValuectx,
      });
      flag?.startsWith("PREVIOUS") ? toPrevTab() : toNextTab();
    }
    handleUpdateLoader(false);
    handleCurrFormctx({
      currentFormSubmitted: true,
    });
  }, []);

  useEffect(() => {
    if (!initializedRef?.current) {
      setupInitialData();
      initializedRef.current = true;
    }
    let refs = [handleSave];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: ckycState?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = ckycState?.tabNameList?.findIndex(
      (tab) => tab?.tabNameFlag === "KYC Document Upload"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = { handleSubmit: handleSave };
    }
  }, [tabFormRefs, ckycState?.tabNameList, handleSave]);

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: AcctDocMainGridMetaData?.columns({
      authState,
      formState: { workingDate: authState?.workingDate ?? "" },
      setIsOpen: setIsModalOpen,
      setCurrentRowData,
      gridApiRef,
      validateDocuments,
      AcctMSTState: ckycState,
      flag: "CKYCDocuments",
    }),
    rowData: combinedGridData ?? [],
  };

  // ag grid Table functionality
  const handleAddNewRow = () => {
    gridApiRef.current?.applyTransaction?.({
      add: [
        {
          ENTERED_DATE: authState?.workingDate ?? "",
          SUBMIT: false,
          _isNewRow: true,
        },
      ],
    });
  };

  useEffect(() => {
    if (combinedGridData && gridApiRef?.current) {
      gridApiRef?.current?.api?.setRowData(combinedGridData);
    }
  }, [combinedGridData, gridApiRef?.current]);

  return {
    agGridProps,
    gridApiRef,
    displayMode,
    authState,
    handleAddNewRow,
    docTemplatePayload,
    isModalOpen,
    setIsModalOpen,
    currentRowData,
    ckycState,
    validateDocuments,
    handleSave,
    loading,
  };
};

export default useCkycDocuments;
