import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@mui/material";
import {
  extractMetaData,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { AcctMSTContext } from "../../AcctMSTContext";
import { AuthContext } from "pages_audit/auth";
import { introductorjoint_tab_metadata } from "../../tabMetadata/introductorJointMetadata";
import TabNavigate from "../../TabNavigate";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { CreditWorthinessBtnGrid } from "../../buttonComponent/CreditWorthinessGrid";
import { format } from "date-fns";
import { useJointDetailByTabName } from "../../function";

const IntroductorJointTab = () => {
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
    handleIntroAcct,
  } = useContext(AcctMSTContext);
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const [openCreditWorthGrid, setOpenCreditWorthGrid] =
    useState<Boolean>(false);
  const [accountNumberDetails, setAccountNumberDetails] = useState<Object>({
    A_COMP_CD: "",
    A_BRANCH_CD: "",
    A_ACCT_TYPE: "",
    A_ACCT_CD: "",
    TAB: "",
  });
  const stepStatusRef = useRef<any>("");
  const [isOpen, setIsOpen] = useState(false);
  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...introductorjoint_tab_metadata };
    handleCustFieldsReadOnlyctx(UpdateMeta);
    return UpdateMeta;
  }, []);
  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "INTRODUCTOR"
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
    handleIntroAcct();
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

  const onFormSubmitHandler = (
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
      let newData = AcctMSTState?.formDatactx;
      if (data?.JOINT_INTRODUCTOR_DTL) {
        let filteredCols: any[] = [];
        filteredCols = Object.keys(data.JOINT_INTRODUCTOR_DTL[0]);
        filteredCols = filteredCols.filter(
          (field) => !field.includes("_ignoreField")
        );
        if (AcctMSTState?.isFreshEntryctx) {
          filteredCols = filteredCols.filter(
            (field) => !field.includes("SR_CD")
          );
        }
        let newFormatOtherAdd = data?.JOINT_INTRODUCTOR_DTL?.map(
          (formRow, i) => {
            let formFields = Object.keys(formRow);
            formFields = formFields.filter(
              (field) => !field.includes("_ignoreField")
            );
            const formData = _.pick(data?.JOINT_INTRODUCTOR_DTL[i], formFields);
            const allFields = Object.keys(formData);
            const dateFields: string[] = ["BIRTH_DATE"];
            allFields.forEach((field) => {
              if (dateFields.includes(field)) {
                formData[field] = Boolean(formData[field])
                  ? format(
                      utilFunction.getParsedDate(formData[field]),
                      "dd-MMM-yyyy"
                    )
                  : "";
              }
            });
            return {
              ...formData,
              // J_TYPE: "I",
            };
          }
        );
        newData["JOINT_INTRODUCTOR_DTL"] = [...newFormatOtherAdd];
        handleFormDataonSavectx(newData);
        if (!AcctMSTState?.isFreshEntryctx) {
          let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            JOINT_INTRODUCTOR_DTL: [...filteredCols],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
      } else {
        newData["JOINT_INTRODUCTOR_DTL"] = [];
        handleFormDataonSavectx(newData);
        if (!AcctMSTState?.isFreshEntryctx) {
          let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            JOINT_INTRODUCTOR_DTL: [],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
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

      // setFormStatus((old) => [...old, false]);
    }
    endSubmit(true);
  };
  const jointDtlData = useJointDetailByTabName("INTRODUCTOR", AcctMSTState);
  const initialVal = useMemo(() => {
    const dateFields: string[] = ["BIRTH_DATE"];
    let formData =
      AcctMSTState?.formDatactx["JOINT_INTRODUCTOR_DTL"] ??
      AcctMSTState?.retrieveFormDataApiRes["JOINT_INTRODUCTOR_DTL"] ??
      jointDtlData;
    if (
      !Boolean(AcctMSTState?.isFreshEntryctx) &&
      !Boolean(AcctMSTState?.formDatactx["JOINT_INTRODUCTOR_DTL"])
    ) {
      formData = formData.map((row) => {
        dateFields.forEach((field) => {
          if (Object.hasOwn(row, field)) {
            row[field] = Boolean(row[field])
              ? utilFunction.getParsedDate(row[field])
              : "";
          }
        });
        return {
          ...row,
          HIDDEN_CUSTOMER_ID: row?.CUSTOMER_ID ?? "",
        };
      });
    }
    const finalFormData = formData.map((item) => ({
      ...item,
      COPY_ACCT_NO: item?.MEM_ACCT_CD,
    }));

    return {
      JOINT_INTRODUCTOR_DTL: AcctMSTState?.isFreshEntryctx
        ? finalFormData.length > 0
          ? [...finalFormData]
          : jointDtlData
        : [...finalFormData],
      HIDDEN_COMP_CD: authState?.companyID ?? "",
      HIDDEN_IsFreshEntry: AcctMSTState?.isFreshEntryctx ?? "",
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes["JOINT_INTRODUCTOR_DTL"],
    AcctMSTState?.formDatactx["JOINT_INTRODUCTOR_DTL"],
    authState?.companyID,
    jointDtlData,
  ]);

  return (
    <Grid>
      <FormWrapper
        key={
          "acct-mst-joint-introductor-form" +
          initialVal +
          AcctMSTState?.formmodectx
        }
        ref={formRef}
        metaData={
          extractMetaData(
            UpdatedMetadata,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        onSubmitHandler={onFormSubmitHandler}
        formStyle={{
          height: "67vh !important",
          overflow: "auto",
          background: "white",
          maxHeight: "62vh",
        }}
        formState={{
          docCD: docCD,
          PARAM320: AcctMSTState?.param320,
          ACCT_TYPE: AcctMSTState?.accTypeValuectx,
          MessageBox: MessageBox,
          formMode: AcctMSTState?.formmodectx,
          acctDtlReqPara: {
            MEM_ACCT_CD: {
              ACCT_TYPE: "JOINT_INTRODUCTOR_DTL.MEM_ACCT_TYPE",
              BRANCH_CD: "JOINT_INTRODUCTOR_DTL.PATH_SIGN",
              SCREEN_REF: docCD ?? "",
            },
          },
          maincustomerid:
            AcctMSTState?.formDatactx?.MAIN_DETAIL?.CUSTOMER_ID ??
            AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID ??
            "",
          initialVal: initialVal,
          setIsOpen: setIsOpen,
          diableIntroAcct: AcctMSTState?.diableIntroAcct ?? "",
        }}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        onFormButtonClickHandel={async (id, dependentFields) => {
          if (id.slice(id.indexOf(".") + 1) === "CRDT_WORTHINESS_ignoreField") {
            let acct_num =
              dependentFields?.[
                "JOINT_INTRODUCTOR_DTL.MEM_ACCT_CD"
              ]?.value?.trim();

            let retrieveAcctNum =
              AcctMSTState?.retrieveFormDataApiRes[
                "JOINT_INTRODUCTOR_DTL"
              ]?.[0]?.MEM_ACCT_CD?.trim();
            if ((acct_num !== "" && isOpen) || (retrieveAcctNum && isOpen)) {
              setOpenCreditWorthGrid(true);
              setAccountNumberDetails({
                A_COMP_CD:
                  dependentFields?.["JOINT_INTRODUCTOR_DTL.PATH_PHOTO"]
                    ?.value ?? "",
                A_BRANCH_CD:
                  dependentFields?.["JOINT_INTRODUCTOR_DTL.PATH_SIGN"]?.value ??
                  "",
                A_ACCT_TYPE:
                  dependentFields?.["JOINT_INTRODUCTOR_DTL.MEM_ACCT_TYPE"]
                    ?.value ?? "",
                A_ACCT_CD:
                  dependentFields?.["JOINT_INTRODUCTOR_DTL.MEM_ACCT_CD"]
                    ?.value ?? "",
                TAB: "JOINTTAB",
              });
            } else {
              MessageBox({
                messageTitle: "ValidationFailed",
                message: "PleaseentertheMemberAccountNumber",
                icon: "ERROR",
                defFocusBtnName: "Ok",
              });
            }
          }
        }}
      ></FormWrapper>
      {openCreditWorthGrid && (
        <CreditWorthinessBtnGrid
          handleDialogClose={() => {
            setOpenCreditWorthGrid(false);
            setAccountNumberDetails({
              A_COMP_CD: "",
              A_BRANCH_CD: "",
              A_ACCT_TYPE: "",
              A_ACCT_CD: "",
              TAB: "",
            });
          }}
          accountNumberDetails={accountNumberDetails}
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

export default IntroductorJointTab;
