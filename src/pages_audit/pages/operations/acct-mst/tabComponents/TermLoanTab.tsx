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
import { termLoan_metadata } from "../tabMetadata/termLoanMetadata";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
// import NextDisbursementButton from "../buttonComponent/NextDisbursementButton";
import CurrentTabButtons from "../buttonComponent/CurrentTabButtons";
import TermLoanButtons from "../buttonComponent/TermLoanButtons";
import { AuthContext } from "pages_audit/auth";
import { useCommonFunctions } from "../function";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { format } from "date-fns";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";

const TermLoanTab = () => {
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
    handleBtnDataonRetrievectx,
    submitRefs,
    floatedValue,
  } = useContext(AcctMSTContext);
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const [openPTSGrid, setOpenPTSGrid] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [buttonName, setButtonName] = useState("");
  const [openNextDisbursementDtl, setOpenNextDisbursementDtl] = useState(false);
  const { authState } = useContext(AuthContext);
  const { showMessageBox } = useCommonFunctions();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const stepStatusRef = useRef<any>("");
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [otherData, setOtherData] = useState({});
  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...termLoan_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);
  const currentTabIndex = AcctMSTState?.colTabValuectx ?? 0;
  const currentTabData = AcctMSTState?.tabsApiResctx?.[currentTabIndex] ?? {};
  const tabName = currentTabData.TAB_NAME;
  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) =>
        tab.tabNameFlag === "TL" ||
        tab.tabNameFlag === "GDL" ||
        tab.tabNameFlag === "LTL"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

  const getOtherSecurityBtnData = useMutation(API.getOtherSecurityBtnDetail, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
    onSuccess: (data) => {
      handleBtnDataonRetrievectx(data[0]);
    },
  });
  const getOrnamentBtnData = useMutation(API.getOrnamentGridData, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
    onSuccess: (data) => {
      handleBtnDataonRetrievectx(data, "ORNAMENT");
    },
  });
  // useEffect(() => {
  //   if (getOtherSecurityBtnData?.data) {
  //     handleBtnDataonRetrievectx(getOtherSecurityBtnData?.data[0]);
  //     // setOpenForm(true);
  //   }
  // }, [getOtherSecurityBtnData?.data]);
  // useEffect(() => {
  //   if (getOrnamentBtnData?.data) {
  //     handleBtnDataonRetrievectx(getOrnamentBtnData?.data, "ORNAMENT");
  //     // setOpenForm(true);
  //   }
  // }, [getOrnamentBtnData?.data]);
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
          "APPLIED_AMT",
          "SANCTIONED_AMT",
          "LIMIT_AMOUNT",
          "INST_RS",
          "DUE_AMT",
          "INT_RATE",
          "PENAL_RATE",
          "INSURANCE_EXPIRY_PENAL_RT",
        ],
        data
      );
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = [
        "NPA_DT",
        "APPLY_DT",
        "SANCTION_DT",
        "DISBURSEMENT_DT",
        "RATE_WEF",
        "INS_START_DT",
        "INST_DUE_DT",
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

  const initialVal = useMemo(() => {
    const dateFields: string[] = [
      "NPA_DT",
      "APPLY_DT",
      "SANCTION_DT",
      "DISBURSEMENT_DT",
      "RATE_WEF",
      "INS_START_DT",
      "INST_DUE_DT",
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
    let AcctMstTermLoanTab = AcctMSTState?.isFreshEntryctx
      ? {
          ...AcctMSTState?.formDatactx["MAIN_DETAIL"],
          INSTALLMENT_TYPE: AcctMSTState?.defaultInstallmentTypectx ?? "",
          TYPE_CD: AcctMSTState?.defaultTypeCdctx ?? "",
        }
      : AcctMSTState?.formDatactx["MAIN_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {}),
        }
      : { ...formData };
    return {
      ...AcctMstTermLoanTab,
      INT_TYPE: AcctMSTState?.defaultInterestTypectx ?? "",
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx["MAIN_DETAIL"],
  ]);
  // console.log("screenFlag", screenFlag); /// Remain to add functionality for Exclude field according to term loan and Gold Loan

  termLoan_metadata.fields[0].label = AcctMSTState?.changeRecommandedLabelctx
    ? "LeaderDetails"
    : "RecommendedBy";

  termLoan_metadata.fields[7].render.componentType =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "autocomplete"
      : "textField";
  termLoan_metadata.fields[7].placeholder =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "SelectRelationship"
      : "EnterRelationship";
  termLoan_metadata.fields[7].maxLength =
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
          "acct-mst-term-loan-tab-form" + initialVal + AcctMSTState?.formmodectx
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
          DISABLE_INT_TYPE: AcctMSTState?.disableInterestTypectx,
          DISABLE_INSTALLMENT_TYPE: AcctMSTState?.disableInstallmentTypectx,
          DISABLE_CLASS_CD: AcctMSTState?.disableRiskCategoryctx,
          DISABLE_INSU_DUE_RATE: AcctMSTState?.disableInsuDueRatectx,
          DISABLE_TYPE_CD: AcctMSTState?.disableTypeCdctx,
          OPEN_DATE:
            AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"]?.OP_DATE,
          WORKING_DATE: authState?.workingDate,
          showMessageBox: showMessageBox,
          INT_RATE_BASE_ON: AcctMSTState?.setInterestRatectx,
          PARA_297: AcctMSTState?.para_297ctx,
          ACCT_TYPE: AcctMSTState?.accTypeValuectx,
          ACCT_CD: AcctMSTState?.acctNumberctx,
          BRANCH_CD: AcctMSTState?.rowBranchCodectx,
          CUSTOMER_ID: AcctMSTState?.formDatactx["MAIN_DETAIL"]?.CUSTOMER_ID,
          docCD: docCD,
          SHARE_ACCT_TYPE:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.SHARE_ACCT_TYPE ?? "",
          SHARE_ACCT_CD:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.SHARE_ACCT_CD ?? "",
          formMode: AcctMSTState?.formmodectx,
          MessageBox: MessageBox,
          tabFlag: tabName,
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
        onFormButtonClickHandel={async (id, dependentFields) => {
          const securityCd = dependentFields?.SECURITY_CD?.value ?? "";
          if (id === "PTS_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("PTS");
          } else if (id === "PURPOSE_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("PURPOSE_CD");
          } else if (id === "NPA_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("NPA_CD");
          } else if (id === "SECURITY_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("SECURITY_CD");
          } else if (id === "PRIORITY_ignoreField") {
            setOpenPTSGrid(true);
            setColumnName("PRIORITY_CD");
          } else if (id === "machineryDTL_ignoreField") {
            if (
              !AcctMSTState?.isFreshEntryctx &&
              !AcctMSTState?.retrievebtnDataApiRes["TERMLOAN_BTN_MAC"]
            ) {
              getOtherSecurityBtnData.mutate({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
                SECURITY_CD: "",
                SR_CD: "1",
                SECURITY_TYPE: "N",
                REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
              });
            }
            setButtonName("MACHINERY");
            setOpenForm(true);
          } else if (id === "vhcleDTL_ignoreField") {
            if (
              !AcctMSTState?.isFreshEntryctx &&
              !AcctMSTState?.retrievebtnDataApiRes["TERMLOAN_BTN_VEH"]
            ) {
              getOtherSecurityBtnData.mutate({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
                SECURITY_CD: "",
                SR_CD: "1",
                SECURITY_TYPE: "V",
                REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
              });
            }
            setButtonName("VEHICLE");
            setOpenForm(true);
          } else if (id === "ornamentDTL_ignoreField") {
            const appliedAmtValue = dependentFields?.APPLIED_AMT?.value;
            const sanctionedAmtValue = dependentFields?.SANCTIONED_AMT?.value;
            if (!appliedAmtValue || !sanctionedAmtValue) {
              let message = "";
              if (!appliedAmtValue && !sanctionedAmtValue) {
                message = "PleaseAppliedSactionedAmount";
              } else if (!appliedAmtValue) {
                message = "PleaseAppliedAmount";
              } else if (!sanctionedAmtValue) {
                message = "PleaseSactionedAmount";
              }
              let buttonName = await MessageBox({
                messageTitle: "ValidationFailed",
                message: message,
                buttonNames: ["OK"],
                icon: "ERROR",
              });
              return;
            }
            if (
              !AcctMSTState?.isFreshEntryctx &&
              !AcctMSTState?.retrievebtnDataApiRes["ORNAMENT_BUTTON_DTL"]
            ) {
              getOrnamentBtnData.mutate({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: AcctMSTState?.rowBranchCodectx ?? "",
                PACKET_NO: dependentFields?.PACKET_NO?.value ?? "",
                REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
              });
            }
            setOpenForm(true);
            setButtonName("ORNAMENT");
            setOtherData(dependentFields);
          } else if (id === "nxtDisburse_ignoreField") {
            setOpenNextDisbursementDtl(true);
          }
        }}
      ></FormWrapper>

      {openForm && (
        <TermLoanButtons
          closeDialog={() => {
            setOpenForm(false);
            setButtonName("");
          }}
          openDilog={openForm}
          btnData={
            buttonName !== "ORNAMENT"
              ? getOtherSecurityBtnData
              : getOrnamentBtnData
          }
          buttonName={buttonName}
          otherData={otherData}
        />
      )}
      {/* {openNextDisbursementDtl && (
        <NextDisbursementButton
          closeDialog={() => {
            setOpenNextDisbursementDtl(false);
          }}
        />
      )} */}
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

export default TermLoanTab;
