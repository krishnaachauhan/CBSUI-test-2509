import {
  extractMetaData,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AcctMSTContext } from "../AcctMSTContext";
import { Grid } from "@mui/material";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { si_metadata } from "../tabMetadata/siMetadata";

const SITab = () => {
  const {
    AcctMSTState,
    handleCurrFormctx,
    handleSavectx,
    handleStepStatusctx,
    handleFormDataonSavectx,
    handleCustFieldsReadOnlyctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    handleUpdateLoader,
    submitRefs,
    floatedValue,
    handleModifiedColsctx,
  } = useContext(AcctMSTContext);
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const stepStatusRef = useRef<any>("");
  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...si_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "SI"
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
      await floatedValue(["SI_CHARGE", "SI_AMOUNT"], data);
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = ["START_DT", "VALID_UPTO"];
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
        REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
        ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
        ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
        BRANCH_CD: AcctMSTState?.rowBranchCodectx
          ? AcctMSTState?.rowBranchCodectx
          : authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
      };
      newData["SI_DETAIL"] = {
        ...formData,
        ...commonData,
      };
      handleFormDataonSavectx(newData);

      if (!AcctMSTState?.isFreshEntryctx) {
        let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
        let updatedCols = tabModifiedCols.SI_DETAIL
          ? _.uniq([...tabModifiedCols.SI_DETAIL, ...formFieldsRef.current])
          : _.uniq([...formFieldsRef.current]);

        tabModifiedCols = {
          ...tabModifiedCols,
          SI_DETAIL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      setFormStatus((old) => [...old, true]);
      if (actionFlag === "UpdateData") {
        onFinalUpdatectx(true);
      }
    } else {
      handleStepStatusctx({
        status: "error",
        coltabvalue: AcctMSTState?.colTabValuectx,
      });
      submitRefs.current = false;
    }
    endSubmit(true);
  };
  const executeOnDay = () => {
    const datevalue = AcctMSTState?.formDatactx["MAIN_DETAIL"]?.INS_START_DT;
    const day: any = datevalue ? new Date(datevalue).getDate() : "";
    if (parseFloat(day) > 28) {
      return 28;
    } else {
      return day;
    }
  };
  const initialVal = useMemo(() => {
    const dateFields: string[] = ["VALID_UPTO", "START_DT"];
    let formData: any = {
      ...(AcctMSTState?.retrieveFormDataApiRes["SI_DETAIL"] ?? {}),
    };
    if (
      !Boolean(AcctMSTState?.isFreshEntryctx) &&
      !Boolean(AcctMSTState?.formDatactx["SI_DETAIL"])
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
          ...AcctMSTState?.formDatactx["SI_DETAIL"],
          BRANCH_CD: AcctMSTState?.rowBranchCodectx
            ? AcctMSTState?.rowBranchCodectx
            : authState?.user?.branchCode,
          SI_AMOUNT: AcctMSTState?.formDatactx["MAIN_DETAIL"]?.INST_RS ?? "0",
          FEQ_TYPE:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.INSTALLMENT_TYPE ?? "M",
          START_DT:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.INS_START_DT ?? "",
          VALID_UPTO:
            AcctMSTState?.formDatactx["MAIN_DETAIL"]?.INST_DUE_DT ?? "",
          EXECUTE_DAY: executeOnDay(),
        }
      : AcctMSTState?.formDatactx["SI_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["SI_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["SI_DETAIL"] ?? {}),
        }
      : { ...formData };
    return {
      ...AcctMstTermLoanTab,
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx["SI_DETAIL"],
  ]);

  return (
    <Grid sx={{ mb: 4 }}>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        initialValues={initialVal}
        key={"acct-mst-si-tab-form" + initialVal + AcctMSTState?.formmodectx}
        metaData={
          extractMetaData(
            UpdatedMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{}}
        formState={{
          GPARAM155: AcctMSTState?.gparam155,
          formMode: AcctMSTState?.formmodectx,
          ACCT_TYPE: AcctMSTState?.accTypeValuectx,
          ACCT_CD: AcctMSTState?.acctNumberctx,
          BRANCH_CD: AcctMSTState?.rowBranchCodectx
            ? AcctMSTState?.rowBranchCodectx
            : authState?.user?.branchCode,
          docCD: docCD,
          CUSTOMER_ID: AcctMSTState?.formDatactx["MAIN_DETAIL"]?.CUSTOMER_ID,
          MessageBox: MessageBox,
          acctDtlReqPara: {
            DR_ACCT_CD: {
              ACCT_TYPE: "DR_ACCT_TYPE",
              BRANCH_CD: "DR_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
      ></FormWrapper>
      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={isNextLoading}
      />
    </Grid>
  );
};

export default SITab;
