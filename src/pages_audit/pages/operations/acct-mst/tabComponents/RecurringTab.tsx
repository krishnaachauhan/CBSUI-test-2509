import {
  extractMetaData,
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AcctMSTContext } from "../AcctMSTContext";
import { Grid } from "@mui/material";
import TabNavigate from "../TabNavigate";
import _ from "lodash";
import { recurring_tab_metadata } from "../tabMetadata/recurringMetadata";
import { format } from "date-fns";

const RecurringTab = () => {
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
  const stepStatusRef = useRef<any>("");
  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...recurring_tab_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) =>
        tab.tabNameFlag === "REC" ||
        tab.tabNameFlag === "RECD" ||
        tab.tabNameFlag === "RECM"
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
  const filteredDates = AcctMSTState?.tabsApiResctx
    .filter((item) => ["REC", "RECM", "RECD"].includes(item.TAB_NAME))
    .map((item) => ({
      TAB_NAME: item.TAB_NAME,
    }));
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
        ["INT_RATE", "PENAL_RATE", "INST_RS", "DUE_AMT"],
        data
      );
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      const formData = _.pick(data, formFieldsRef.current);
      const dateFields: string[] = [
        "INS_START_DT",
        "INST_DUE_DT",
        "LST_INT_COMPUTE_DT",
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
      "INS_START_DT",
      "INST_DUE_DT",
      "LST_INT_COMPUTE_DT",
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
    return AcctMSTState?.isFreshEntryctx
      ? {
          ...AcctMSTState?.formDatactx["MAIN_DETAIL"],
        }
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

  recurring_tab_metadata.fields[2].render.componentType =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "autocomplete"
      : "textField";
  recurring_tab_metadata.fields[2].placeholder =
    AcctMSTState?.changeRelationshipCompctx === "Y"
      ? "SelectRelationship"
      : "EnterRelationship";
  recurring_tab_metadata.fields[2].maxLength =
    AcctMSTState?.changeRelationshipCompctx === "Y" ? 0 : 27;

  return (
    <Grid sx={{ mb: 4 }}>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onFormSubmitHandler}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        key={
          "acct-mst-recurring-tab-form" + initialVal + AcctMSTState?.formmodectx
        }
        metaData={
          extractMetaData(
            UpdatedMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{}}
        formState={{
          GPARAM155: AcctMSTState?.gparam155,
          DISABLE_CLASS_CD: AcctMSTState?.disableRiskCategoryctx,
          DISABLE_INSTALLMENT_TYPE: AcctMSTState?.disableInstallmentTypectx,
          DISABLE_INT_RATE: AcctMSTState?.disableIntRatectx,
          DISABLE_PENAL_RATE: AcctMSTState?.disablePanelRatectx,
          DISABLE_DUE_AMT: AcctMSTState?.disableMaturityAmtctx,
          DISABLE_INS_START_DT: AcctMSTState?.disableInstStartDatectx,
          DISABLE_INST_DUE_DT: AcctMSTState?.disableInstDueDatectx,
          ACCT_TYPE: AcctMSTState?.accTypeValuectx,
          ACCT_TYPE_CONDITION: filteredDates,
          intialStartDt: AcctMSTState?.intialStartDt,
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

export default RecurringTab;
