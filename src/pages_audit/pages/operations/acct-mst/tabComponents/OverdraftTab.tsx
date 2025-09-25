import {
  extractMetaData,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AcctMSTContext } from "../AcctMSTContext";
import { Grid } from "@mui/material";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
import { hypothication_metadata } from "../tabMetadata/hypoMetadata";
import CurrentTabButtons from "../buttonComponent/CurrentTabButtons";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useCommonFunctions } from "../function";

const OverDraftTab = () => {
  const {
    AcctMSTState,
    handleCurrFormctx,
    handleSavectx,
    handleStepStatusctx,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    handleCustFieldsReadOnlyctx,
  } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { showMessageBox } = useCommonFunctions();
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const [openPTSGrid, setOpenPTSGrid] = useState(false);
  const [columnName, setColumnName] = useState("");

  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...hypothication_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  const handleSave = (e) => {
    handleCurrFormctx({
      isLoading: true,
    });
    const refs = [formRef.current.handleSubmit(e, "save", false)];
    handleSavectx(e, refs);
  };

  const onFormSubmitHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (data && !hasError) {
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = [
        "NPA_DT",
        "SANCTION_DT",
        "INST_DUE_DT",
        "RATE_WEF",
        "LST_INT_COMPUTE_DT",
        "DATE_OF_COMMENCEMENT",
      ];
      const allFields = Object.keys(formData);
      allFields.forEach((field) => {
        if (dateFields.includes(field)) {
          formData[field] = Boolean(formData[field])
            ? format(utilFunction.getParsedDate(formData[field]), "dd/MMM/yyyy")
            : "";
        }
      });

      let newData = AcctMSTState?.formDatactx;
      const commonData = {
        IsNewRow: !AcctMSTState?.req_cd_ctx ? true : false,
        // COMP_CD: "",
        // BRANCH_CD: "",
        // REQ_FLAG: "",
        // REQ_CD: "",
        // SR_CD: "",
      };
      newData["MAIN_DETAIL"] = {
        ...newData["MAIN_DETAIL"],
        ...formData,
        ...commonData,
      };
      handleFormDataonSavectx(newData);
      if (!AcctMSTState?.isFreshEntryctx) {
        let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
        let updatedCols = tabModifiedCols.MAIN_DETAIL
          ? _.uniq([...tabModifiedCols.MAIN_DETAIL, ...formFieldsRef.current])
          : _.uniq([...formFieldsRef.current]);

        tabModifiedCols = {
          ...tabModifiedCols,
          MAIN_DETAIL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      // handleStepStatusctx({ status: "", coltabvalue: state?.colTabValuectx });
      setFormStatus((old) => [...old, true]);
      // if(state?.isFreshEntry) {
      // PODFormRef.current.handleSubmit(NextBtnRef.current, "save");
      // }
      // setIsNextLoading(false)
    } else {
      handleStepStatusctx({
        status: "error",
        coltabvalue: AcctMSTState?.colTabValuectx,
      });
      // setIsNextLoading(false);
      setFormStatus((old) => [...old, false]);
    }
    endSubmit(true);
  };

  useEffect(() => {
    let refs = [formRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: AcctMSTState?.colTabValuectx,
      currentFormSubmitted: null,
      isLoading: false,
    });
  }, []);
  useEffect(() => {
    // console.log("ikufhwheniufhiwehfhwf", formStatus);
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
      }
    }
  }, [formStatus]);

  const initialVal = useMemo(() => {
    let AcctMstOverDraftTab = AcctMSTState?.isFreshEntryctx
      ? AcctMSTState?.formDatactx["MAIN_DETAIL"]
      : AcctMSTState?.formDatactx["MAIN_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {}),
        }
      : { ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}) };
    return {
      ...AcctMstOverDraftTab,
      INT_TYPE: AcctMSTState?.defaultInterestTypectx ?? "",
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx["MAIN_DETAIL"],
  ]);

  hypothication_metadata.fields[0].label =
    AcctMSTState?.changeRecommandedLabelctx ? "LeaderDetails" : "RecommendedBy";

  hypothication_metadata.fields[7].render.componentType =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "autocomplete"
      : "textField";
  hypothication_metadata.fields[7].placeholder =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "SelectRelationship"
      : "EnterRelationship";
  hypothication_metadata.fields[7].maxLength =
    AcctMSTState?.changeRelationshipCompctx === "Y" ? 0 : 27;

  const handleDialogClose = useCallback(() => {
    setOpenPTSGrid(false);
    setColumnName("");
  }, []);

  return (
    <Grid sx={{ mb: 4 }}>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        key={
          "acct-mst-overdraft-tab-form" + initialVal + AcctMSTState?.formmodectx
        }
        /// used Hypo tab metadata for overDraft
        metaData={
          extractMetaData(
            UpdatedMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{}}
        formState={{
          GPARAM155: AcctMSTState?.gparam155,
          DISABLE_INT_RATE: AcctMSTState?.disableIntRatectx,
          DISABLE_PENAL_RATE: AcctMSTState?.disablePanelRatectx,
          DISABLE_AG_CLR_RATE: AcctMSTState?.disableAgClearingRatectx,
          DISABLE_INSU_DUE_RATE: AcctMSTState?.disableInsuDueRatectx,
          DISABLE_INT_TYPE: AcctMSTState?.disableInterestTypectx,
          DISABLE_CLASS_CD: AcctMSTState?.disableRiskCategoryctx,
          DISABLE_INST_DUE_DT: AcctMSTState?.disableInstDueDatectx,
          INT_RATE_BASE_ON: AcctMSTState?.setInterestRatectx,
          ACCT_TYPE: AcctMSTState?.accTypeValuectx,
          ACCT_CD: AcctMSTState?.acctNumberctx,
          BRANCH_CD: AcctMSTState?.rowBranchCodectx,
          CUSTOMER_ID: AcctMSTState?.formDatactx["MAIN_DETAIL"]?.CUSTOMER_ID,
          docCD: docCD,
          SHARE_ACCT_TYPE:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.SHARE_ACCT_TYPE ?? "",
          SHARE_ACCT_CD:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.SHARE_ACCT_CD ?? "",
          APPLIED_AMT:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.APPLIED_AMT ?? "",
          LIMIT_AMOUNT:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.LIMIT_AMOUNT ?? "",
          formMode: AcctMSTState?.formmodectx,
          MessageBox: MessageBox,
          showMessageBox: showMessageBox,
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
        onFormButtonClickHandel={async (id) => {
          if (id === "PTS_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("PTS");
          } else if (id === "PURPOSE_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("PURPOSE_CD");
          } else if (id === "NPA_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("NPA_CD");
          }
        }}
      ></FormWrapper>
      {openPTSGrid && (
        <CurrentTabButtons
          handleDialogClose={handleDialogClose}
          columnName={columnName}
        />
      )}
      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={isNextLoading}
      />
    </Grid>
  );
};

export default OverDraftTab;
