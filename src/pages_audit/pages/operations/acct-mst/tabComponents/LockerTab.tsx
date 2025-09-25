import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AcctMSTContext } from "../AcctMSTContext";
import { Grid } from "@mui/material";
import { locker_tab_metadata } from "../tabMetadata/lockerMetadata";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";

const LockerTab = () => {
  const {
    AcctMSTState,
    handleCurrFormctx,
    handleStepStatusctx,
    handleSavectx,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    handleUpdateLoader,
    submitRefs,
    handleCustFieldsReadOnlyctx,
    floatedValue,
  } = useContext(AcctMSTContext);
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const stepStatusRef = useRef<any>("");
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox } = usePopupContext();

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "LOC"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...locker_tab_metadata };
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
      await floatedValue(["DUE_AMT", "INT_RATE"], data);
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = ["OP_DATE", "INST_DUE_DT", "LAST_INST_DT"];
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
    const dateFields: string[] = ["OP_DATE", "INST_DUE_DT", "LAST_INST_DT"];
    let formData: any = {
      ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
      lf_no: AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.["LF_NO"],
      INT_SKIP_FLAG:
        AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.["INT_SKIP_FLAG"] ===
        true
          ? "Y"
          : "n",
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
    return AcctMSTState?.isFreshEntryctx
      ? AcctMSTState?.formDatactx["MAIN_DETAIL"]
      : AcctMSTState?.formDatactx["MAIN_DETAIL"]
      ? {
          ...(AcctMSTState?.retrieveFormDataApiRes["MAIN_DETAIL"] ?? {}),
          ...(AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {}),
        }
      : { ...formData };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx["MAIN_DETAIL"],
  ]);

  return (
    <Grid>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        key={
          "acct-mst-locker-tab-form" + initialVal + AcctMSTState?.formmodectx
        }
        metaData={UpdatedMetadata as MetaDataType}
        formStyle={{
          height: "auto !important",
        }}
        formState={{
          GPARAM155: AcctMSTState?.gparam155,
          docCD: docCD,
          formMode: AcctMSTState?.formmodectx,
          MessageBox,
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
      ></FormWrapper>
      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={isNextLoading}
      />
    </Grid>
  );
};

export default LockerTab;
