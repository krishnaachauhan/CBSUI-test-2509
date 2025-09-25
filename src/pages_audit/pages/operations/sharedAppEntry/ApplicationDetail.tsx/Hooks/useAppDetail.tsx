import { usePopupContext, utilFunction } from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { AcctMSTContext } from "pages_audit/pages/operations/acct-mst/AcctMSTContext";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppDetailMetaData } from "../AppDetailMetaData";
import { format } from "date-fns";
import _ from "lodash";

const useAppDetail = () => {
  const {
    AcctMSTState,
    handlecustomerIDctx,
    handleCurrFormctx,
    handleStepStatusctx,
    handleFormDataonSavectx,
    handleCustFieldsReadOnlyctx,
    tabFormRefs,
    onFinalUpdatectx,
    handleColTabChangectx,
    handleUpdateLoader,
    submitRefs,
  } = useContext(AcctMSTContext);

  const { MessageBox } = usePopupContext();

  const [formStatus, setFormStatus] = useState<any[]>([]);
  const transferRef = useRef<any>(null);
  const formFieldsRef = useRef<any>([]);
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const stepStatusRef = useRef<any>("");
  const [isOpenAddBankForm, setOpenAddBankForm] = useState(false);
  const [bankData, setBankData] = useState<any>({});
  const [bankName, setBankName] = useState({ BANK_CD: "" });
  const [displayTransferTable, setDisplayTransferTable] = useState(false);

  const onSubmitAppHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (data && !hasError) {
      submitRefs.current = false;
      handleUpdateLoader(true);
      stepStatusRef.current = actionFlag;
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
      const dateFields: string[] = ["MEETING_DT"];
      dateFields.forEach((field) => {
        if (Object.hasOwn(formData, field)) {
          formData[field] = Boolean(formData[field])
            ? format(utilFunction.getParsedDate(formData[field]), "dd/MMM/yyyy")
            : "";
        }
      });
      const custID = formData?.CUSTOMER_ID ?? "";
      handlecustomerIDctx(custID);
      let newData = AcctMSTState?.formDatactx;
      const commonData = {
        IsNewRow: true,
      };

      let mainDetailObj = {
        ...newData["MAIN_DETAIL"],
        ...formData,
        ...commonData,
        CONFIRMED: AcctMSTState?.CONFIRMED,
      };

      newData["MAIN_DETAIL"] = _.omit(mainDetailObj, ["STATUS_FLAG"]);

      handleFormDataonSavectx(newData);

      setFormStatus((old) => [...old, true]);
    } else {
      setFormStatus((old) => [...old, false]);
      handleStepStatusctx({
        status: "error",
        coltabvalue: AcctMSTState?.colTabValuectx,
      });
      submitRefs.current = false;
    }
    endSubmit(true);
  };

  const onSubmitTransTableHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (data && !hasError) {
      submitRefs.current = false;

      stepStatusRef.current = actionFlag;
      const formData = [...data?.RECPAYTRANS];

      let newData = AcctMSTState?.formDatactx;

      newData["TRANSFER_DTL"] = formData;
      newData["MAIN_DETAIL"] = {
        ...newData["MAIN_DETAIL"],
        MODE_PAYMENT: "T",
      };
      handleFormDataonSavectx(newData);

      setFormStatus((old) => [...old, true]);
    } else {
      setFormStatus((old) => [...old, false]);

      handleStepStatusctx({
        status: "error",
        coltabvalue: AcctMSTState?.colTabValuectx,
      });
      submitRefs.current = false;
    }
    endSubmit(true);
  };

  const initialVal = useMemo(() => {
    const dateFields = ["MEETING_DT"];
    const userBranchCode = authState?.user?.branchCode ?? "";

    const retrievedData =
      AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"] ?? {};
    const contextData = AcctMSTState?.formDatactx?.["MAIN_DETAIL"] ?? {};
    const isFreshEntry = AcctMSTState?.isFreshEntryctx;

    let formData: any = { ...retrievedData };

    if (!isFreshEntry && Object.keys(contextData).length === 0) {
      dateFields.forEach((field) => {
        if (field in formData) {
          formData[field] = formData[field]
            ? utilFunction.getParsedDate(formData[field])
            : "";
        }
      });
    }
    const AcctMstMainTab = isFreshEntry
      ? { ...contextData }
      : Object.keys(contextData).length > 0
      ? { ...retrievedData, ...contextData }
      : { ...formData };

    const commonBranchFields = {
      MEM_BRANCH_CD: AcctMSTState?.DEF_BRANCH,
      SHARE_BRANCH_CD: userBranchCode,
      FEES_BRANCH_CD: userBranchCode,
      STNRY_BRANCH_CD: userBranchCode,
      DIV_CR_BRANCH_CD: userBranchCode,
      NEW_BRANCH_CD: AcctMSTState?.DEF_BRANCH,
    };

    return {
      ...AcctMstMainTab,
      ...commonBranchFields,
      // ...transTable,
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes,
    AcctMSTState?.formDatactx,
    authState?.user?.branchCode,
  ]);

  useEffect(() => {
    if (AcctMSTState?.formDatactx?.["TRANSFER_DTL"]?.length > 0) {
      setDisplayTransferTable(true);
    }
  }, [AcctMSTState?.formDatactx]);

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "APPLICATION_DETAIL"
    );

    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

  useEffect(() => {
    handleCustFieldsReadOnlyctx(AppDetailMetaData);

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
          AcctMSTState?.currentFormctx.currentFormRefctx.length > 0 &&
          AcctMSTState?.currentFormctx.currentFormRefctx.length ===
            formStatus.length
      ) &&
      Boolean(formStatus && formStatus.length > 0)
    ) {
      if (
        AcctMSTState?.currentFormctx.currentFormRefctx.length ===
        formStatus.length
      ) {
        const allSubmitted = formStatus.every(Boolean);

        if (allSubmitted) {
          let isTab = stepStatusRef.current?.split(" ");

          if (isTab[0] === "TabChange") {
            handleStepStatusctx({
              status: "completed",
              coltabvalue: AcctMSTState?.colTabValuectx,
            });

            handleColTabChangectx(Number(isTab[1]));
            handleUpdateLoader(false);
          } else {
            handleStepStatusctx({
              status: "completed",
              coltabvalue: AcctMSTState?.colTabValuectx,
            });
            onFinalUpdatectx(true);
            handleUpdateLoader(false);
          }
          handleUpdateLoader(false);

          handleCurrFormctx({
            currentFormSubmitted: true,
            isLoading: false,
          });
        } else {
          handleUpdateLoader(false);

          handleCurrFormctx({
            currentFormSubmitted: false,
            isLoading: false,
          });
        }
        setFormStatus([]);
        submitRefs.current = false;
      }
    }
  }, [formStatus]);

  return {
    formRef,
    onSubmitAppHandler,
    initialVal,
    AcctMSTState,
    bankName,
    MessageBox,
    setBankData,
    setOpenAddBankForm,
    docCD,
    setDisplayTransferTable,
    handleCurrFormctx,
    tabFormRefs,
    isOpenAddBankForm,
    displayTransferTable,
    transferRef,
    onSubmitTransTableHandler,
    bankData,
    setBankName,
  };
};

export default useAppDetail;
