import {
  extractMetaData,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AcctMSTContext } from "../AcctMSTContext";
import { Dialog, Grid } from "@mui/material";
import { fixDeposit_tab_metadata } from "../tabMetadata/fixDepositMetadata";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useCommonFunctions } from "../function";
import { FDIntScheduleGrid } from "../../fix-deposit/fdIntScheduleGrid";
import JointDetails from "../../DailyTransaction/TRNHeaderTabs/JointDetails";

const FixDepositTab = () => {
  const {
    AcctMSTState,
    handleCurrFormctx,
    handleStepStatusctx,
    handleSavectx,
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
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { showMessageBox } = useCommonFunctions();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const stepStatusRef = useRef<any>("");
  const [openIntSchedule, setOpenIntSchedule] = useState<boolean>(false);
  const apiReqDataRef = useRef<any>({});
  const crAcctDtlsRef = useRef<any>({});
  const [openJointGrid, setOpenJointGrid] = useState<boolean>(false);

  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...fixDeposit_tab_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) =>
        tab.tabNameFlag === "FD" ||
        tab.tabNameFlag === "FCUM" ||
        tab.tabNameFlag === "DFD"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

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

  const onFormSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (data && !hasError) {
      handleUpdateLoader(true);
      stepStatusRef.current = actionFlag;
      await floatedValue(
        [
          "INST_RS",
          "APPLIED_AMT",
          "SANCTIONED_AMT",
          "TOTAL",
          "DUE_AMT",
          "INT_RATE",
        ],
        data
      );
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = ["INST_DUE_DT"];
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

  const initialVal = useMemo(() => {
    const dateFields: string[] = ["INST_DUE_DT"];
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
    let AcctMstSavingTab = AcctMSTState?.isFreshEntryctx
      ? AcctMSTState?.formDatactx["MAIN_DETAIL"]
      : AcctMSTState?.formDatactx["MAIN_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {}),
        }
      : { ...formData };
    return {
      ...AcctMstSavingTab,
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx["MAIN_DETAIL"],
  ]);

  fixDeposit_tab_metadata.fields[2].render.componentType =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "autocomplete"
      : "textField";
  fixDeposit_tab_metadata.fields[2].placeholder =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "SelectRelationship"
      : "EnterRelationship";
  fixDeposit_tab_metadata.fields[2].maxLength =
    AcctMSTState?.changeRelationshipCompctx === "Y" ? 0 : 27;

  return (
    <Grid>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        key={
          "acct-mst-fix-deposit-tab-form" +
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
          OPEN_FD: AcctMSTState?.displayFDDetailsctx,
          DISABLE_INT_RATE: AcctMSTState?.disableIntRatectx,
          DISABLE_PENAL_RATE: AcctMSTState?.disablePanelRatectx,
          DISABLE_AG_CLR_RATE: AcctMSTState?.disableAgClearingRatectx,
          DISABLE_INSU_DUE_RATE: AcctMSTState?.disableInsuDueRatectx,
          DISABLE_INT_TYPE: AcctMSTState?.fdDetailPara?.TERM_CD_DISABLED ?? "",
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
          PURPOSE_CD:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.PURPOSE_CD ?? "",
          PTS: AcctMSTState?.formDatactx["MAIN_DETAIL"]?.PTS ?? "",
          SANCTION_DT:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.SANCTION_DT ?? "",
          RECOMMENED_NM:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.RECOMMENED_NM ?? "",
          formMode: AcctMSTState?.formmodectx,
          MessageBox: MessageBox,
          showMessageBox: showMessageBox,
          FD_NUMBER: AcctMSTState?.fdDetailPara?.FD_NO ?? "",
          TRAN_DT: AcctMSTState?.fdDetailPara?.TRAN_DT ?? "",
          INT_TYPE: AcctMSTState?.fdDetailPara?.TERM_CD ?? "",
          fdParaData: AcctMSTState?.fdDetailPara,
          acctDtlReqPara: {
            REF_ACCT_CD: {
              ACCT_TYPE: "REF_ACCT_TYPE",
              BRANCH_CD: "REF_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
        onFormButtonClickHandel={async (flag, fields) => {
          if (flag === "INT_SCHEDULE") {
            if (
              AcctMSTState?.rowBranchCodectx?.trim()
                ? AcctMSTState?.rowBranchCodectx?.trim()
                : authState?.user?.branchCode?.trim() &&
                  AcctMSTState?.accTypeValuectx?.trim() &&
                  fields?.INST_DUE_DT?.value &&
                  Number(fields?.INT_RATE?.value) > 0 &&
                  AcctMSTState?.fdDetailPara?.TRAN_DT &&
                  fields?.INST_NO?.value?.trim() &&
                  fields?.INSTALLMENT_TYPE?.value?.trim() &&
                  fields?.INT_TYPE?.value?.trim() &&
                  (fields?.APPLIED_AMT?.value?.trim() ||
                    fields?.SANCTIONED_AMT?.value?.trim())
            ) {
              apiReqDataRef.current = {
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: AcctMSTState?.rowBranchCodectx
                  ? AcctMSTState?.rowBranchCodectx
                  : authState?.user?.branchCode ?? "",
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
                PERIOD_CD: fields?.INSTALLMENT_TYPE?.value ?? "",
                PERIOD_NO: fields?.INST_NO?.value ?? "",
                TERM_CD: fields?.INT_TYPE?.value ?? "",
                TRAN_DT: Boolean(AcctMSTState?.fdDetailPara?.TRAN_DT)
                  ? format(
                      utilFunction.getParsedDate(
                        AcctMSTState?.fdDetailPara?.TRAN_DT
                      ),
                      "dd-MMM-yyyy"
                    )
                  : "",
                TOT_AMT:
                  Number(fields?.SANCTIONED_AMT?.value ?? 0) +
                  Number(fields?.APPLIED_AMT?.value ?? 0),
                INT_RATE: fields?.INT_RATE?.value ?? "",
                MATURITY_DT: Boolean(fields?.INST_DUE_DT?.value)
                  ? format(
                      utilFunction.getParsedDate(fields?.INST_DUE_DT?.value),
                      "dd-MMM-yyyy"
                    )
                  : "",
              };
              setOpenIntSchedule(true);
            }
          } else if (flag === "JOINT_DTLS") {
            if (
              fields?.REF_BRANCH_CD?.value?.trim() &&
              fields?.REF_ACCT_TYPE?.value?.trim() &&
              fields?.REF_ACCT_CD?.value?.trim()
            ) {
              crAcctDtlsRef.current = {
                BRANCH_CD: fields?.REF_BRANCH_CD?.value ?? "",
                ACCT_TYPE: fields?.REF_ACCT_TYPE?.value ?? "",
                ACCT_CD: fields?.REF_ACCT_CD?.value ?? "",
                ACCT_NM: fields?.REF_ACCT_NM?.value ?? "",
              };
              setOpenJointGrid(true);
            }
          }
          return;
        }}
      ></FormWrapper>
      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={isNextLoading}
      />
      {openIntSchedule ? (
        <FDIntScheduleGrid
          setOpenIntSchedule={setOpenIntSchedule}
          apiReqData={apiReqDataRef.current}
        />
      ) : null}
      {openJointGrid ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="lg"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setOpenJointGrid(false);
            }
          }}
        >
          <JointDetails
            reqData={{
              ...crAcctDtlsRef.current,
              COMP_CD: authState?.companyID ?? "",
              BTN_FLAG: "Y",
              custHeader: true,
            }}
            closeDialog={() => setOpenJointGrid(false)}
          />
        </Dialog>
      ) : null}
    </Grid>
  );
};

export default FixDepositTab;
