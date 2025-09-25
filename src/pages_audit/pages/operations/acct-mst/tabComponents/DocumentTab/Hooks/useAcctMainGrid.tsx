import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AcctMSTContext } from "../../../AcctMSTContext";
import { AuthContext } from "pages_audit/auth";
import { usePopupContext, utilFunction } from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import * as API from "../../../api";
import { GeneralAPI } from "registry/fns/functions";
import {
  displayCommonErrorOnSubmit,
  getFormattedDate,
  getGridRowData,
} from "components/agGridTable/utils/helper";
import _ from "lodash";
import { AcctDocMainGridMetaData } from "../AcctDocMainGridMetaData";
import { t } from "i18next";

const useAcctMainGrid = () => {
  const {
    AcctMSTState,
    handleFormDataonSavectx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleUpdateDocument,
    handleModifiedColsctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    submitRefs,
    floatedValue,
  } = useContext(AcctMSTContext);

  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();

  const [combinedGridData, setCombinedGridData] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentRowData, setCurrentRowData] = useState<any>({});
  const [loading, setloading] = useState(false);
  const gridRowData = useRef<any>();
  const displayMode = AcctMSTState?.formmodectx;

  const gridApiRef = useRef<any>();
  const initializedRef = useRef(false);

  const docTemplatePayload: any = {
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: authState?.user?.branchCode ?? "",
    ACCT_TYPE: AcctMSTState?.accTypeValuectx,
    CONSTITUTION_TYPE: AcctMSTState?.constitutionValuectx ?? "",
  };

  const formatKYCData = async (CUSTOMER_ID) => {
    const data = await customerDocDataMutation.mutateAsync({
      REQ_CD: "",
      CUSTOMER_ID: CUSTOMER_ID,
    });
    let formattedData: any = [];
    if (Array.isArray(data) && data.length > 0) {
      formattedData = await Promise.all(
        data.map(async (doc) => {
          const innerGridData = await mutationRet.mutateAsync({
            TRAN_CD: doc?.TRAN_CD,
            SR_CD: doc?.SR_CD,
            REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
          });

          return {
            ...doc,
            TRANSR_CD: `${doc.TRAN_CD}${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y",
            DOCUMENT_TYPE: doc?.TEMPLATE_DOC_TYPE,
            FORMMODE: AcctMSTState?.formmodectx,
            ACTIVE: doc.ACTIVE === "Y",
            payload: innerGridData,
          };
        })
      );
    }
    return formattedData;
  };
  //* Api call
  const docTemplateMutation = useMutation(API.getKYCDocumentGridData, {
    onSuccess: async (data) => {
      setloading(true);
      if (Array.isArray(data) && data.length > 0) {
        const formattedTemplateData = data.map((doc) => {
          const cleanedRow = _.omit(doc, [
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
            TRANSR_CD: `${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y",
            DOC_TYPE: "ACCT",
            ACTIVE: true,
            ENTERED_DATE: authState?.workingDate ?? "",
            DISPLAY_TEMPLATE_CD: doc?.DOC_DESCRIPTION,
            IS_MANDATORY: doc?.IS_MANDATORY || doc?.MANDATORY,
            _isNewRow: true,
          };
        });
        if (AcctMSTState.customerIDctx) {
          const formatData = await formatKYCData(AcctMSTState.customerIDctx);

          // Create a Set of template_cd values from customerData
          const customerTemplateCds = new Set(
            formatData.map((item) => item.TEMPLATE_CD)
          );

          // Filter templateData to remove any items with template_cd in customerTemplateCds
          const filteredTemplateData = formattedTemplateData.filter(
            (item: any) => !customerTemplateCds.has(item.TEMPLATE_CD)
          );
          setCombinedGridData([...filteredTemplateData, ...formatData]);
          gridRowData.current = [...filteredTemplateData, ...formatData];
        } else {
          setCombinedGridData([...formattedTemplateData]);
          gridRowData.current = [...formattedTemplateData];
        }
      }
      setloading(false);
    },
    onError: async (error: any) => {
      setloading(false);
    },
  });

  const customerDocDataMutation = useMutation(GeneralAPI.getDocDetails);

  const mutationRet: any = useMutation(API.getDocumentImagesList);
  const validateDocuments: any = useMutation(API.validateDocDate);

  const setUpdateGridData = async () => {
    setloading(true);
    let apiData = AcctMSTState?.retrieveFormDataApiRes?.["DOC_MST"];
    if (Array.isArray(apiData)) {
      const kycFormattedData = await formatKYCData(
        AcctMSTState.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID
      );

      const formatted = await Promise.all(
        apiData.map(async (row) => {
          const innerGridData = await mutationRet.mutateAsync({
            TRAN_CD: row?.TRAN_CD,
            SR_CD: row?.SR_CD,
            REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
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

          return row?.TRAN_CD && row?.SR_CD
            ? {
                ...cleanedRow,
                TRANSR_CD: `${row.TRAN_CD}${row.SR_CD}`,
                payload: innerGridData,
                CUSTOMER_ID:
                  AcctMSTState.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID,
                DISPLAY_TEMPLATE_CD: row?.DOC_DESCRIPTION,
                IS_MANDATORY: row?.IS_MANDATORY || row?.MANDATORY,
              }
            : {
                ...cleanedRow,
                payload: innerGridData,
                CUSTOMER_ID:
                  AcctMSTState.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID,
                DISPLAY_TEMPLATE_CD: row?.DOC_DESCRIPTION,
                IS_MANDATORY: row?.IS_MANDATORY || row?.MANDATORY,
              };
        })
      );
      const customerTemplateCds = new Set(
        kycFormattedData.map((item) => item.TEMPLATE_CD)
      );

      // Filter templateData to remove any items with template_cd in customerTemplateCds
      const filteredTemplateData = formatted.filter(
        (item: any) => !customerTemplateCds.has(item?.TEMPLATE_CD)
      );
      setCombinedGridData([...filteredTemplateData, ...kycFormattedData]);
      gridRowData.current = [...filteredTemplateData, ...kycFormattedData];

      handleUpdateDocument({
        documents: [...filteredTemplateData, ...kycFormattedData],
      });
    }
    setloading(false);
  };

  const setupInitialData = () => {
    if (AcctMSTState?.isFreshEntryctx) {
      const savedDocData = AcctMSTState?.documentObj;

      if (Array.isArray(savedDocData) && savedDocData?.length > 0) {
        setCombinedGridData([...savedDocData]);
        gridRowData.current = [...savedDocData];
      } else {
        docTemplateMutation.mutate(docTemplatePayload);
      }
    } else {
      const savedDocData = AcctMSTState?.documentObj;
      if (Array.isArray(savedDocData) && savedDocData?.length > 0) {
        setCombinedGridData([...savedDocData]);
        gridRowData.current = [...savedDocData];
      } else {
        setUpdateGridData();
      }
    }
  };

  useEffect(() => {
    if (!initializedRef.current) {
      setupInitialData();
      initializedRef.current = true;
    }

    let refs = [handleSave];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: AcctMSTState?.colTabValuectx,
      currentFormSubmitted: null,
      isLoading: false,
    });
  }, []);

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
    const rawData = getGridRowData(gridApiRef)?.filter(
      (item) => item?.DOC_TYPE !== "KYC"
    );
    if (
      rawData.some(
        (row) => (row.errors && row.errors.length > 0) || !row.TEMPLATE_CD
      )
    ) {
      submitRefs.current = false;
      displayCommonErrorOnSubmit(gridApiRef, MessageBox);

      return;
    }

    const rowWithSrCd = rawData?.map((item) => item.TRAN_CD);
    const deletedRows = combinedGridData
      ?.filter((item) => item?.DOC_TYPE !== "KYC")
      ?.map((item) => {
        if (!rowWithSrCd?.includes(item.TRAN_CD)) {
          return {
            TRAN_CD: item?.TRAN_CD,
            SR_CD: item?.SR_CD,
            DETAILS_DATA: {
              isDeleteRow: [],
              isNewRow: [],
              isUpdatedRow: [],
            },
            REQ_CD: AcctMSTState.req_cd_ctx,
            _isDeleteRow: true,
          };
        }
      });
    const cleanedDeletedRow = deletedRows.filter(Boolean);

    // if (AcctMSTState?.isFreshEntryctx) {
    const transformedData = await Promise.all(
      rawData?.map(async ({ DISPLAY_TEMPLATE_CD, ...row }, index) => {
        await floatedValue(["DOC_AMOUNT"], row);

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
        if (AcctMSTState?.isFreshEntryctx) {
          updatedValues = utilFunction?.transformDetailsData(cleanedRow, []);
          detailsData = {
            isNewRow: payloadCopy ?? [],
            isDeleteRow: [],
            isUpdatedRow: [],
          };
        } else {
          const retrivedData = gridRowData?.current;
          const matchSrCd = retrivedData?.find((item) => {
            return item.TRAN_CD === row.TRAN_CD;
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
            ["TRAN_CD"]
          );
          updatedValues = {
            ...updatedValues,
            REQ_CD: AcctMSTState.req_cd_ctx,
          };
        }
        const transformedCopy = { ...updatedValues };

        // transformDetailDataForDML

        return {
          ...baseData,
          DETAILS_DATA: detailsData,
          ...transformedCopy,
        };
      })
    );

    let newTabsData = AcctMSTState?.formDatactx;
    if (!AcctMSTState?.isFreshEntryctx) {
      const filteredData = transformedData.filter(
        (item) =>
          (item._UPDATEDCOLUMNS && item._UPDATEDCOLUMNS.length > 0) ||
          (item.DETAILS_DATA &&
            (item.DETAILS_DATA.isNewRow.length > 0 ||
              item.DETAILS_DATA.isUpdatedRow.length > 0 ||
              item.DETAILS_DATA.isDeleteRow.length > 0))
      );

      newTabsData["DOC_MST"] = {
        doc_mst_payload: cleanedDeletedRow
          ? [...cleanedDeletedRow, ...filteredData]
          : [...filteredData],
      };
    } else {
      let filterData = transformedData.map((item) => ({
        ...item,
        _isNewRow: true,
      }));
      newTabsData["DOC_MST"] = { doc_mst_payload: [...filterData] };
    }

    handleFormDataonSavectx(newTabsData);

    handleStepStatusctx({
      status: "completed",
      coltabvalue: AcctMSTState?.colTabValuectx,
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
      isLoading: true,
    });
    if (!AcctMSTState?.isFreshEntryctx) {
      let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
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
      (tab) => tab.tabNameFlag === "DOC"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = { handleSubmit: handleSave };
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList, handleSave]);

  // ag grid Table functionality
  const handleAddNewRow = () => {
    gridApiRef.current?.applyTransaction?.({
      add: [
        {
          ENTERED_DATE: authState?.workingDate ?? "",
          SUBMIT: false,
          ACTIVE: true,
          DOC_TYPE: "ACCT",
          _isNewRow: true,
        },
      ],
    });
  };

  useEffect(() => {
    if (combinedGridData && gridApiRef.current) {
      gridApiRef?.current?.api?.setRowData(combinedGridData);
    }
  }, [combinedGridData, gridApiRef?.current]);

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: AcctDocMainGridMetaData.columns({
      authState,
      formState: { workingDate: authState?.workingDate ?? "" },
      setIsOpen: setIsModalOpen,
      setCurrentRowData,
      gridApiRef,
      validateDocuments,
      AcctMSTState,
      flag: "AcctDocuments",
    }),
    rowData: combinedGridData ?? [],
  };

  const updatePinnedBottomRow = () => {
    if (!gridApiRef) return;

    let totalWeight = 0;

    gridApiRef.current.forEachNode((node) => {
      if (node.data.SUBMIT) {
        const weightStr = node.data?.DOC_WEIGHTAGE ?? "0";
        const weight = parseFloat(weightStr) || 0; // fallback to 0 if NaN
        totalWeight += weight;
      }
    });

    gridApiRef.current.setGridOption("pinnedBottomRowData", [
      {
        TEMPLATE_CD: t("TotalSubmittedDocWeightage"),
        DOC_WEIGHTAGE: totalWeight,
      },
    ]);
  };
  return {
    isModalOpen,
    currentRowData,
    loading,
    displayMode,
    handleSave,
    handleAddNewRow,
    agGridProps,
    updatePinnedBottomRow,
    gridApiRef,
    authState,
    setIsModalOpen,
    docTemplatePayload,
    docTemplateMutation,
    validateDocuments,
    AcctMSTState,
  };
};

export default useAcctMainGrid;
