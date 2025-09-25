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
import { hypothication_metadata } from "../tabMetadata/hypoMetadata";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
import CurrentTabButtons from "../buttonComponent/CurrentTabButtons";
import { LetterOfContinuityButtonGrid } from "../buttonComponent/LetterofContinuityButtonGrid";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../function";
import { format } from "date-fns";

const HypothicationTab = () => {
  const {
    AcctMSTState,
    handleCurrFormctx,
    handleSavectx,
    handleStepStatusctx,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    handleCustFieldsReadOnlyctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    handleUpdateLoader,
    submitRefs,
    floatedValue,
  } = useContext(AcctMSTContext);
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const [openPTSGrid, setOpenPTSGrid] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [openLetterOfContDetails, setOpenLetterOfContDetails] = useState(false);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { showMessageBox } = useCommonFunctions();
  const stepStatusRef = useRef<any>("");
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...hypothication_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "CC"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

  const onFormSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    stepStatusRef.current = actionFlag;
    if (data && !hasError) {
      handleUpdateLoader(true);
      let formFields = Object.keys(data); // array, get all form-fields-name
      await floatedValue(
        [
          "SANCTIONED_AMT",
          "INT_RATE",
          "CR_INT",
          "AG_CLR_RATE",
          "PENAL_RATE",
          "INSURANCE_EXPIRY_PENAL_RT",
          "STOCK_EXPIRY_PENAL_RT",
        ],
        data
      );
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

      if (actionFlag === "UpdateData") {
        onFinalUpdatectx(true);
      }
    } else {
      handleStepStatusctx({
        status: "error",
        coltabvalue: AcctMSTState?.colTabValuectx,
      });
      submitRefs.current = false;

      // setIsNextLoading(false);
      // setFormStatus((old) => [...old, false]);
    }
    endSubmit(true);
  };

  const handleSave = (e) => {
    handleCurrFormctx({
      isLoading: true,
    });
    const refs = [formRef.current.handleSubmit(e, "save", false)];
    handleSavectx(e, refs);
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
          let isTab = stepStatusRef.current?.split(" ");
          if (isTab[0] === "TabChange") {
            submitted = true;
            handleStepStatusctx({
              status: "completed",
              coltabvalue: AcctMSTState?.colTabValuectx,
            });
            handleColTabChangectx(Number(isTab[1]));
          } else {
            submitted = true;
            handleStepStatusctx({
              status: "completed",
              coltabvalue: AcctMSTState?.colTabValuectx,
            });
          }
        }
        handleUpdateLoader(false);
        handleCurrFormctx({
          currentFormSubmitted: submitted,
          isLoading: false,
        });
        setFormStatus([]);
        submitRefs.current = false;
      }
    }
  }, [formStatus]);

  const initialVal = useMemo(() => {
    const dateFields: string[] = [
      "NPA_DT",
      "SANCTION_DT",
      "INST_DUE_DT",
      "RATE_WEF",
      "LST_INT_COMPUTE_DT",
      "DATE_OF_COMMENCEMENT",
    ];
    let formData: any = {
      ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
    };
    if (
      !Boolean(AcctMSTState?.isFreshEntryctx) &&
      !Boolean(AcctMSTState?.formDatactx["MAIN_DETAIL"])
    ) {
      dateFields.forEach((field) => {
        if (Object.hasOwn(formData, field)) {
          formData[field] = Boolean(formData[field])
            ? utilFunction.getParsedDate(formData[field])
            : "";
        }
      });
    }
    let AcctMstHypoTab = AcctMSTState?.isFreshEntryctx
      ? AcctMSTState?.formDatactx["MAIN_DETAIL"]
      : AcctMSTState?.formDatactx["MAIN_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {}),
        }
      : { ...formData };
    return {
      ...AcctMstHypoTab,
      INT_TYPE:
        AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]?.INT_TYPE ??
        AcctMSTState?.defaultInterestTypectx ??
        "",
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
    <Grid>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        key={
          "acct-mst-hypothication-tab-form" +
          initialVal +
          AcctMSTState?.formmodectx
        }
        metaData={
          extractMetaData(
            UpdatedMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{
          height: "auto !important",
        }}
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
          } else if (id === "PRIORITY_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("PRIORITY_CD");
          } else if (id === "letterofCont_ignoreField") {
            setOpenLetterOfContDetails(true);
          }
        }}
      ></FormWrapper>
      {openPTSGrid && (
        <CurrentTabButtons
          handleDialogClose={handleDialogClose}
          columnName={columnName}
        />
      )}
      {openLetterOfContDetails && (
        <LetterOfContinuityButtonGrid
          handleDialogClose={() => setOpenLetterOfContDetails(false)}
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

export default HypothicationTab;
