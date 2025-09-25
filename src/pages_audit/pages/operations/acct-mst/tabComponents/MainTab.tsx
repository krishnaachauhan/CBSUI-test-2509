import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  extractMetaData,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { main_tab_metadata } from "../tabMetadata/mainTabMetadata";
import { AcctMSTContext } from "../AcctMSTContext";
import { Grid } from "@mui/material";
import TabNavigate from "../TabNavigate";
import _, { isEmpty } from "lodash";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { format } from "date-fns";
import { useMutation } from "react-query";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "../api";
import { getFormattedDate } from "components/agGridTable/utils/helper";

const MainTab = () => {
  const {
    AcctMSTState,
    handlecustomerIDctx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    handleSavectx,
    handleCustFieldsReadOnlyctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    handleUpdateLoader,
    handleUpdateDocument,
    submitRefs,
    floatedValue,
    handleJointTypeDetails,
    handleTabIconDisable,
  } = useContext(AcctMSTContext);
  const { MessageBox } = usePopupContext();
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);

  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [ddwData, setDDWData] = useState([]);
  const statusRef = useRef<any>("");
  const stepStatusRef = useRef<any>("");
  const docRef = useRef<any>();
  const [refreshForm, setRefreshForm] = useState(AcctMSTState?.accTypeValuectx);

  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...main_tab_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "MAIN"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

  useEffect(() => {
    if (AcctMSTState?.closeAcctStatus === "C") {
      statusRef.current = "C";
    } else if (AcctMSTState?.closeAcctStatus === "O") {
      statusRef.current = "O";
    } else {
      statusRef.current = "";
    }
  }, [AcctMSTState?.closeAcctStatus]);

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
        // setIsNextLoading(false);
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

  const handleDocSave = async () => {
    const docs = docRef.current || AcctMSTState?.documentObj || [];
    if (!isEmpty(docs)) {
      const rawData = docs?.filter((item: any) => item?.DOC_TYPE !== "KYC");

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
          let baseData: any = {
            ...cleanedRow,
            ACTIVE: row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
            SUBMIT: row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
            ENTERED_DATE:
              getFormattedDate(row?.ENTERED_DATE ?? "", "dd/MMM/yyyy") ?? "",
            VALID_UPTO:
              getFormattedDate(row?.VALID_UPTO ?? "", "dd/MMM/yyyy") ?? "",
          };
          const payload = row?.payload?.map(
            ({ saved, errors, ...rest }) => rest
          );
          const payloadCopy = payload ? [...payload] : undefined;
          updatedValues = utilFunction?.transformDetailsData(cleanedRow, []);
          detailsData = {
            isNewRow: payloadCopy ?? [],
            isDeleteRow: [],
            isUpdatedRow: [],
          };

          const transformedCopy = { ...updatedValues };

          return {
            ...baseData,
            DETAILS_DATA: detailsData,
            ...transformedCopy,
            _isNewRow: true,
          };
        }
      );

      let newTabsData = AcctMSTState?.formDatactx;

      newTabsData["DOC_MST"] = { doc_mst_payload: [...transformedData] };

      handleFormDataonSavectx(newTabsData);
    }
  };
  useEffect(() => {
    if (AcctMSTState?.documentObj?.length > 0) {
      docRef.current = AcctMSTState?.documentObj;
    }
  }, [AcctMSTState?.documentObj]);

  useEffect(() => {
    if (AcctMSTState?.formmodectx === "new") {
      if (AcctMSTState?.accTypeValuectx !== refreshForm) {
        setRefreshForm(AcctMSTState?.accTypeValuectx);
      }
    }
  }, [refreshForm, AcctMSTState?.accTypeValuectx]);
  const onSubmitPDHandler = async (
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
        ["LEAN_AMT", "INVEST_IN_PLANT", "SECURITY_DEPOSIT"],
        data
      );
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([
        ...formFieldsRef.current,
        ...formFields,
        "CLOSE_DT",
      ]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = [
        "BIRTH_DT",
        "DATE_OF_RETIREMENT",
        "DATE_OF_DEATH",
        "UDYAM_REG_DT",
        "CLOSE_DT",
      ];
      const checkBoxFields: string[] = [
        "MOBILE_REG",
        "HANDICAP_FLAG",
        "SALARIED",
      ];
      dateFields.forEach((field) => {
        if (Object.hasOwn(formData, field)) {
          formData[field] = Boolean(formData[field])
            ? format(utilFunction.getParsedDate(formData[field]), "dd/MMM/yyyy")
            : "";
        }
      });
      checkBoxFields.forEach((field) => {
        if (Object.hasOwn(formData, field)) {
          formData[field] = Boolean(formData[field]) ? "Y" : "N";
        }
      });
      const custID = formData?.CUSTOMER_ID ?? "";
      handlecustomerIDctx(custID);
      let newData = AcctMSTState?.formDatactx;
      const commonData = {
        IsNewRow: !AcctMSTState?.req_cd_ctx ? true : false,
        // COMP_CD: "",
        // ACCT_TYPE: AcctMSTState?.accTypeValuectx,
        // ACCT_CD: AcctMSTState?.acctNumberctx,
        // OP_DATE: authState?.workingDate,
        // CLOSE_DT: "",
        // STATUS: "",
        // CUSTOMER_ID: AcctMSTState?.customerIDctx,
        // CONFIRMED: "",
        // MOBILE_REG: "Y",
        // LEAN_TYPE: "0",
        // LEAN_AMT: "0",
        // ENTERED_DATE: authState?.workingDate,
        // RECOMMENDED_DESG: "04",
        // APPLY_DT: authState?.workingDate,
        // INS_START_DT: authState?.workingDate,
        // APPLIED_AMT: "0",
        // INST_RS: "0",
        // LAST_INST_DT: authState?.workingDate,
        // INSTALLMENT_TYPE: "M",
        // LIMIT_AMOUNT: "0",
        // DRAWING_POWER: "0",
        // DUE_AMT: "6",
        // DISBURSEMENT_DT: "21-02-1995",
        // CLOSE_REASON_CD: "001 ",
        // LST_STATEMENT_DT: "21-09-2012",
        // PREFIX_CD: "1",
        // HANDICAP_DESCIRPTION: "12345678901",
        // DOCKET_NO: "0",
        // INT_SKIP_FLAG: "N",
        // INT_SKIP_REASON_TRAN_CD: "3",
        // LOCKER_KEY_NO: "000003",
        // REF_COMP_CD: "132 ",
        // REF_BRANCH_CD: "099 ",
        // REF_ACCT_TYPE: "0030",
        // REF_ACCT_CD: "000001              ",
        // CHEQUE_NO: "0",
        // ACTION_TAKEN_CD: "1",
        // REQUEST_CD: "",
        // THROUGH_CHANNEL: "MOBILE",
        // RENRE_CD: "01  ",
        // INDUSTRY_CODE: "01  ",
        // BRANCH_CD: "",
        // REQ_FLAG: "",
        // REQ_CD: "",
        // SR_CD: "",
      };

      let mainDetailObj = {
        ...newData["MAIN_DETAIL"],
        ...formData,
        ...commonData,
        ACCT_TYPE: AcctMSTState?.accTypeValuectx,
        STATUS:
          statusRef.current === "C"
            ? "C"
            : statusRef.current === "O"
            ? "O"
            : formData?.STATUS ?? "",
      };
      if (statusRef.current === "O" || statusRef.current === "C") {
        mainDetailObj.CLOSE_REASON_CD =
          statusRef.current === "O"
            ? ""
            : statusRef.current === "C"
            ? formData?.CLOSE_REASON_CD ?? ""
            : "";

        mainDetailObj = {
          ...mainDetailObj,
          CLOSE_DT:
            statusRef.current === "O"
              ? ""
              : statusRef.current === "C"
              ? authState?.workingDate ?? ""
              : "",
        };
      }
      newData["MAIN_DETAIL"] = _.omit(mainDetailObj, ["STATUS_FLAG"]);

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
      } else {
        await handleDocSave();
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
    const dateFields: string[] = [
      "BIRTH_DT",
      "DATE_OF_RETIREMENT",
      "DATE_OF_DEATH",
      "UDYAM_REG_DT",
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
    // console.log(
    //   AcctMSTState?.retrieveFormDataApiRes,
    //   "ewhfiuwhfwef",
    //   AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"]
    // );
    let AcctMstMainTab = AcctMSTState?.isFreshEntryctx
      ? {
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {
            GENDER: "M",
            MARITAL_STATUS: "03",
            FORM_60: "N",
          }),
          MEM_ACCT_TYPE: authState?.baseCompanyID ?? "",
          MEM_ACCT_CD: authState?.user?.baseBranchCode ?? "",
        }
      : AcctMSTState?.formDatactx["MAIN_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {}),
        }
      : { ...formData };
    return {
      ...AcctMstMainTab,
      // MEM_ACCT_TYPE: authState.companyID ?? "",
      // MEM_ACCT_CD: authState?.user?.branchCode ?? "",
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx["MAIN_DETAIL"],
  ]);

  main_tab_metadata.fields[10].label = AcctMSTState?.lf_noctx;
  main_tab_metadata.fields[10].render.componentType =
    AcctMSTState?.lf_noctx === "Minor/Major" ? "autocomplete" : "textField";
  main_tab_metadata.fields[10].isReadOnly =
    docCD === "MST/523"
      ? false
      : AcctMSTState?.lf_noctx === "Minor/Major"
      ? true
      : false;
  main_tab_metadata.fields[10].placeholder =
    AcctMSTState?.lf_noctx === "Minor/Major"
      ? "selectMinorMajor"
      : "EnterLedgerNo";
  main_tab_metadata.fields[10].maxLength =
    AcctMSTState?.lf_noctx === "Minor/Major" ? 0 : 8;
  const customerDocDataMutation = useMutation(GeneralAPI.getDocDetails);

  const mutationRet: any = useMutation(API.getDocumentImagesList);
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

  return (
    <Grid>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onSubmitPDHandler}
        initialValues={{
          ...initialVal,
          HIDDEN_CUSTOMER_ID: initialVal?.CUSTOMER_ID ?? "",
          AREA_PIN_FLAG: "iniFlagVal",
          NEW_CATEG_CD: initialVal?.CATEG_CD || undefined,
        }}
        key={
          "acct-mst-main-tab-form" +
          initialVal +
          AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] +
          AcctMSTState?.formmodectx +
          AcctMSTState?.accTypeValuectx +
          refreshForm
        }
        // metaData={main_tab_metadata as MetaDataType}
        metaData={
          extractMetaData(
            UpdatedMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{}}
        formState={{
          docCD: docCD,
          PARAM320: AcctMSTState?.param320,
          ACCT_TYPE: AcctMSTState?.accTypeValuectx,
          MessageBox: MessageBox,
          handlecustomerIDctx: handlecustomerIDctx,
          LF_NO: AcctMSTState?.lf_noctx,
          IS_NBFC: AcctMSTState?.is_nbfcctx,
          CCTLCA: AcctMSTState?.cctlcactx,
          ddwData: ddwData,
          ALLOW_STATUS_EDIT:
            AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"]
              ?.ALLOW_STATUS_EDIT,
          STATUS_DDDW:
            AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"]?.STATUS_DDDW,
          customerIdFlag: false,
          RetrieveCustomerId:
            AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"]?.CUSTOMER_ID,
          VISIBLE_TRADE_INFO: AcctMSTState?.visibleTradeInfoctx,
          closeAcctStatus: AcctMSTState?.closeAcctStatus ?? "",
          closeAcctStatusRetrieve:
            AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"]?.STATUS ?? "",
          workingDate: authState?.workingDate ?? "",
          acctDtlReqPara: {
            SHARE_ACCT_CD: {
              ACCT_TYPE: "SHARE_ACCT_TYPE",
              BRANCH_CD: "MEM_ACCT_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
          formatKYCData: formatKYCData,
          docTempData: AcctMSTState?.documentObj,
          handleUpdateDocument: handleUpdateDocument,
          displayMode: AcctMSTState?.formmodectx,
          SCREEN_FLAG: docCD === "MST/523" || docCD === "MST/524" ? "S" : "A",
          handleTabIconDisable: handleTabIconDisable,
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
        setDataOnFieldChange={async (action, payload, ...data) => {
          if (action === "DOC_DATA") {
            const formatData = await formatKYCData(payload?.customerId);
            if (formatData && AcctMSTState?.formmodectx === "new") {
              // Create a Set of template_cd values from customerData
              const customerTemplateCds = new Set(
                formatData.map((item) => item?.TEMPLATE_CD)
              );
              const savedDocData =
                docRef.current || AcctMSTState?.documentObj || [];

              console.log("savedDocData: ", savedDocData);
              // Filter templateData to remove any items with template_cd in customerTemplateCds
              const filteredTemplateData = savedDocData?.filter((item) => {
                return (
                  item?.DOC_TYPE !== "KYC" &&
                  !customerTemplateCds.has(item?.TEMPLATE_CD) &&
                  item?._isNewRow !== true
                );
              });

              handleUpdateDocument({
                documents: [...filteredTemplateData, ...formatData],
              });
              docRef.current = [...filteredTemplateData, ...formatData];
            }
          }
          if (action === "JOINT_DATA") {
            handleJointTypeDetails(payload);
          }
        }}
      ></FormWrapper>
      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={isNextLoading}
      />
    </Grid>
  );
};

export default MainTab;
