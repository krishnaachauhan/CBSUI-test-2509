import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { AuthContext } from "pages_audit/auth";
import * as API from "../../api";
import { DocumentGridMetadata } from "./docGridmetadata";
import { DocMasterDTLForm } from "./DocMasterDTLForm";
import { AcctMSTContext } from "../../AcctMSTContext";
import TabNavigate from "../../TabNavigate";
import {
  PopupMessageAPIWrapper,
  GridWrapper,
  GradientButton,
  PDFViewer,
  utilFunction,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";

const actions: ActionTypes[] = [
  {
    actionName: "edit-details",
    actionLabel: "ViewDtl",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-all",
    actionLabel: "View All",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const Document = () => {
  const navigate = useNavigate();
  const {
    AcctMSTState,
    handleFormDataonSavectx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleModifiedColsctx,
  } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const reqCD = AcctMSTState?.req_cd_ctx ?? "";
  const custID = AcctMSTState?.customerIDctx ?? "";

  const [girdData, setGridData] = useState<any>([]);
  const [girdActiveData, setGridActiveData] = useState<any>([]);
  const [actionMenu, setActionMenu] = useState(actions);
  const [displayAction, setDisplayAction] = useState("active");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"view" | "new" | "edit">("view");
  const [isDelConfirm, setIsDelConfirm] = useState<boolean>(false);

  const myGridRef = useRef<any>(null);
  const currRowRef = useRef<any>({}); //current grid row
  const changedRowsRef = useRef<any[]>([]); // final api payload
  const isDataChangedRef = useRef(false);

  let docTemplatePayload = {
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: authState?.user?.branchCode ?? "",
    ACCT_TYPE: AcctMSTState?.accTypeValuectx,
    CONSTITUTION_TYPE: AcctMSTState?.constitutionValuectx ?? "",
  };

  useEffect(() => {
    let activeGridData = [];
    activeGridData = girdData.filter((row) =>
      Boolean(row?.ACTIVE && row?.ACTIVE !== "N")
    );
    setGridActiveData(activeGridData);
  }, [girdData]);

  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      // custDocMutation.mutate(payload);
      isDataChangedRef.current = false;
    }
    setIsOpen(false);
  };

  const DocTemplateMutation: any = useMutation(API.getKYCDocumentGridData, {
    onSuccess: async (data) => {
      if (Array.isArray(data) && data.length > 0) {
        let newData: any[] = data;
        newData = newData.map((doc) => {
          return {
            ...doc,
            TRANSR_CD: `${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y" ? true : false,
            DOC_TYPE: "ACCT",
            ACTIVE: true,
            ENTERED_DATE: authState?.workingDate ?? "",
          };
        });
        setGridData((old) => [...old, ...newData]);
      }
    },
  });
  const ExistCustDocDataMutation: any = useMutation(GeneralAPI.getDocDetails, {
    onSuccess: async (data) => {
      if (Array.isArray(data) && data.length > 0) {
        let newData: any[] = data;
        newData = newData.map((doc) => {
          return {
            ...doc,
            TRANSR_CD: `${doc.TRAN_CD}${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y" ? true : false,
            DOCUMENT_TYPE: doc?.TEMPLATE_DOC_TYPE,
            FORMMODE: AcctMSTState?.formmodectx,
          };
        });
        setGridData((old) => [...old, ...newData]);
      }
    },
  });

  const setCurrentAction = useCallback(
    (data) => {
      if (data?.name === "add") {
        setFormMode("new");
        setIsOpen(true);
        // currRowRef.current = {}; //should be clear if there is no row selcted
      } else if (data?.name === "edit-details") {
        currRowRef.current = data?.rows?.[0]?.data ?? {};
        setFormMode("view");
        setIsOpen(true);
      } else if (data?.name === "view-active") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "view-active"
              ? { ...item, actionName: "view-all", actionLabel: "View All" }
              : item
          )
        );
        setDisplayAction("active");
      } else if (data?.name === "view-all") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "view-all"
              ? {
                  ...item,
                  actionName: "view-active",
                  actionLabel: "View Active",
                }
              : item
          )
        );
        setDisplayAction("all");
      }
    },
    [navigate]
  );

  const onDeleteDocument = async () => {
    let mainDocDelPayload = {
      _isDeleteRow: true,
      TRAN_CD: currRowRef.current?.TRAN_CD,
      SR_CD: currRowRef.current?.SR_CD,
      REQ_CD: reqCD,
      // IS_FROM_MAIN:
      // currRowRef.current?.IS_FROM_MAIN ?? "N",
      // NEW_FLAG: "N",
      DETAILS_DATA: {
        isDeleteRow: [],
        isNewRow: [],
        isUpdatedRow: [],
      },
    };
    let newData = await myGridRef?.current?.cleanData?.();
    //
    if (!Array.isArray(newData)) {
      newData = [newData];
    }
    if (newData?.length > 0) {
      newData = newData?.filter(
        (row) => row.TRANSR_CD !== currRowRef?.current?.TRANSR_CD
      );
    }
    setGridData([...newData]);

    let changedRows = changedRowsRef.current;
    if (AcctMSTState?.isFreshEntryctx) {
      // remove from payload - deleted main row - for fresh entry
      changedRows = changedRowsRef.current?.filter(
        (row) => !Boolean(row?.SR_CD === mainDocDelPayload?.SR_CD)
      );
    } else {
      // add in payload - removed existing main row
      if (Boolean(currRowRef?.current?._isNewRow)) {
        changedRows = changedRowsRef.current?.filter(
          (row) => !Boolean(row?.TRANSR_CD === currRowRef?.current?.TRANSR_CD)
        );
      } else {
        changedRows = changedRowsRef.current?.filter(
          (row) => !Boolean(row?.TRANSR_CD === currRowRef?.current?.TRANSR_CD)
        );
        changedRows = [...changedRows, mainDocDelPayload];
      }
    }
    changedRowsRef.current = [...changedRows];
    setIsDelConfirm(false);
  };

  const handleSave = async () => {
    let newGridData = await myGridRef?.current?.cleanData?.();

    //

    if (AcctMSTState?.isFreshEntryctx) {
      let newGridDt = newGridData?.map((mainDocRow) => {
        let newMainDocRow = mainDocRow;

        let updateValue = utilFunction.transformDetailsData(newMainDocRow, []);

        if (typeof newMainDocRow.SUBMIT === "boolean") {
          if (Boolean(newMainDocRow.SUBMIT)) {
            newMainDocRow["SUBMIT"] = "Y";
          } else {
            newMainDocRow["SUBMIT"] = "N";
          }
        } else {
          newMainDocRow["SUBMIT"] = newMainDocRow.SUBMIT;
        }
        newMainDocRow = _.omit(newMainDocRow, [
          "SR_CD",
          "TRAN_CD",
          "docImages",
        ]);

        //
        return {
          ...newMainDocRow,
          DETAILS_DATA: {
            isNewRow: mainDocRow?.docImages ? [...mainDocRow?.docImages] : [],
            isDeleteRow: [],
            isUpdatedRow: [],
          },
          ...updateValue,
          _isNewRow: true,
          // REQ_CD: reqCD,
          // CUSTOMER_ID: custID,
          // COMP_CD: authState?.companyID ?? "",
          // BRANCH_CD: authState?.user?.branchCode ?? "",
          // REQ_FLAG: "F",
          // IsNewRow: Boolean(reqCD) ? false : true,
        };
      });
      //

      let newTabsData = AcctMSTState?.formDatactx;

      // newTabsData["DOC_MST"] = {
      //   DOC_MST: [...newGridDt],
      //   ...commonData
      // }
      newTabsData["DOC_MST"] = {
        doc_mst_payload: [...changedRowsRef.current],
        DOC_MST: [...newGridDt],
      };

      handleFormDataonSavectx(newTabsData);
    } else {
      let newTabsData = AcctMSTState?.formDatactx;
      // newTabsData["DOC_MST"] = [...changedRowsRef.current];
      newTabsData["DOC_MST"] = {
        doc_mst_payload: [...changedRowsRef.current],
        DOC_MST: [...newGridData],
      };
      handleFormDataonSavectx(newTabsData);

      let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
      tabModifiedCols = {
        ...tabModifiedCols,
        DOC_MST: {
          doc_mst_payload: [...changedRowsRef.current],
          DOC_MST: [...newGridData],
        },
      };
      handleModifiedColsctx(tabModifiedCols);
    }
    handleStepStatusctx({
      status: "completed",
      coltabvalue: AcctMSTState?.colTabValuectx,
    });
    handleCurrFormctx({
      currentFormSubmitted: true,
      isLoading: false,
    });
  };

  useEffect(() => {
    let refs = [handleSave];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: AcctMSTState?.colTabValuectx,
      currentFormSubmitted: null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    if (AcctMSTState?.isFreshEntryctx) {
      if (Array.isArray(AcctMSTState?.formDatactx?.["DOC_MST"]?.["DOC_MST"])) {
        setGridData([...AcctMSTState?.formDatactx["DOC_MST"]?.["DOC_MST"]]);
        changedRowsRef.current =
          AcctMSTState?.formDatactx["DOC_MST"]?.["doc_mst_payload"] ?? [];
      } else if (Boolean(AcctMSTState.customerIDctx)) {
        DocTemplateMutation.mutate(docTemplatePayload);
        ExistCustDocDataMutation.mutate({
          REQ_CD: "",
          CUSTOMER_ID: AcctMSTState.customerIDctx,
        });
      } else {
        DocTemplateMutation.mutate(docTemplatePayload);
      }
    } else {
      if (Array.isArray(AcctMSTState?.formDatactx?.["DOC_MST"]?.["DOC_MST"])) {
        setGridData([...AcctMSTState?.formDatactx["DOC_MST"]?.["DOC_MST"]]);
        changedRowsRef.current =
          AcctMSTState?.formDatactx["DOC_MST"]?.["doc_mst_payload"] ?? [];
      } else {
        let docData = AcctMSTState?.retrieveFormDataApiRes?.["DOC_MST"];
        if (Array.isArray(docData)) {
          docData = docData?.map((docRow) => {
            if (docRow?.TRAN_CD && docRow?.SR_CD) {
              return {
                ...docRow,
                TRANSR_CD: `${docRow?.TRAN_CD}${docRow?.SR_CD}`,
              };
            } else {
              return { ...docRow };
            }
          });
          setGridData(docData ?? []);
        }
      }
    }
  }, []);

  return (
    <Grid container>
      <GridWrapper
        key={
          `operatorMasterGrid` +
          girdData +
          displayAction +
          AcctMSTState?.formmodectx
        }
        finalMetaData={DocumentGridMetadata as GridMetaDataType}
        // data={girdData ?? []}
        data={
          displayAction === "active" ? girdActiveData ?? [] : girdData ?? []
        }
        setData={setGridData}
        loading={DocTemplateMutation.isLoading}
        actions={AcctMSTState?.formmodectx !== "view" ? actionMenu : []}
        setAction={setCurrentAction}
        ref={myGridRef}
        onClickActionEvent={(index, id, currentData) => {
          currRowRef.current = currentData;
          if (id === "_hidden") {
            setIsDelConfirm(true);
          } else if (id === "VIEW_DTL") {
            setFormMode("view");
            setIsOpen(true);
          }
        }}
      />
      <PopupMessageAPIWrapper
        MessageTitle="CONFIRM"
        Message="DoYouWantToDeleteThisDocument"
        onActionYes={(rowVal) => {
          onDeleteDocument();
        }}
        onActionNo={() => {
          setIsDelConfirm(false);
        }}
        rows={{}}
        open={isDelConfirm}
        // loading={mutation.isLoading}
      />
      {isOpen && (
        <DocMasterDTLForm
          isDataChangedRef={isDataChangedRef}
          ClosedEventCall={handleDialogClose}
          defaultmode={formMode ?? "new"}
          girdData={girdData}
          isOpen={isOpen}
          currentData={currRowRef}
          changedRowsRef={changedRowsRef}
          myGridRef={myGridRef}
          setGridData={setGridData}
        />
      )}

      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={false}
      />
    </Grid>
  );
};

export default Document;
