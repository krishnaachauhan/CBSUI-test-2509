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
import { collateraljoint_tab_metadata } from "../../tabMetadata/collateralJointMetadata";
import TabNavigate from "../../TabNavigate";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { CreditWorthinessBtnGrid } from "../../buttonComponent/CreditWorthinessGrid";
import { OtherSecurityButton } from "../../buttonComponent/otherSecurityButton";
import { useMutation, useQuery } from "react-query";
import * as API from "../../api";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { format } from "date-fns";
import { useJointDetailByTabName } from "../../function";
import ColletralButton from "../../buttonComponent/ColletralButton";
const CollateralJointTab = () => {
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
    handleColBtnData,
    handleRetrieveColBtnData,
    handleOldColBtnData,
  } = useContext(AcctMSTContext);

  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const formRef = useRef<any>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openSecBtn, setSecBtn] = useState(false);
  const [buttonName, setButtonName] = useState("");
  const [openCreditWorthGrid, setOpenCreditWorthGrid] = useState(false);
  const stepStatusRef = useRef<any>("");
  const [accountNumberDetails, setAccountNumberDetails] = useState<Object>({
    A_COMP_CD: "",
    A_BRANCH_CD: "",
    A_ACCT_TYPE: "",
    A_ACCT_CD: "",
    TAB: "",
  });
  const [formIndex, setFormIndex] = useState(0);
  const colBtnData = useRef<any[]>([]);
  const savecolBtnData = useRef<any[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [optionData, setOptionData] = useState("");
  const [otherSecurityData, setOtherSecurityData] = useState([]);
  const [isData, setIsData] = useState({
    securityCode: [],
    securityType: [],
    securityOption: [],
    accountType: [],
    accountCd: [],
  });

  // Helper function to get proper index-wise data from array
  const getIndexWiseButtonData = (index: number, buttonType: string) => {
    const retrieveData = AcctMSTState?.retrievecolBtnDatactx || [];
    return Array.isArray(retrieveData) &&
      retrieveData[index] &&
      retrieveData[index][buttonType]
      ? retrieveData[index][buttonType]
      : null;
  };

  // Helper function to set index-wise button data in array
  const setIndexWiseButtonData = (
    index: number,
    buttonType: string,
    data: any
  ) => {
    colBtnData.current[index] = {
      ...colBtnData.current[index],
      [buttonType]: data,
    };
    handleOldColBtnData([...colBtnData.current]);
    handleRetrieveColBtnData([...colBtnData.current]);
  };
  // Helper function to sync array length with form data
  const syncButtonDataLength = (formDataLength: number) => {
    if (savecolBtnData.current.length > formDataLength) {
      savecolBtnData.current.splice(formDataLength);
      handleColBtnData([...savecolBtnData.current]);
    }
  };

  // Add effect to handle form data changes and sync button data
  useEffect(() => {
    const formDataLength =
      AcctMSTState?.formDatactx?.JOINT_HYPOTHICATION_DTL?.length ||
      AcctMSTState?.retrieveFormDataApiRes?.JOINT_HYPOTHICATION_DTL?.length ||
      0;

    if (formDataLength < savecolBtnData?.current?.length) {
      syncButtonDataLength(formDataLength);
    }
  }, [
    AcctMSTState?.formDatactx?.JOINT_HYPOTHICATION_DTL?.length,
    AcctMSTState?.retrieveFormDataApiRes?.JOINT_HYPOTHICATION_DTL?.length,
  ]);

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
      setOtherSecurityData(data);
    },
  });

  useEffect(() => {
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab?.tabNameFlag === "COLL_DTL"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, AcctMSTState?.tabNameList]);

  const UpdatedMetadata = useMemo(() => {
    const UpdateMeta = { ...collateraljoint_tab_metadata };
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
  const buttonRef = useRef<any>();

  useEffect(() => {
    if (AcctMSTState?.colBtnDatactx) {
      // Initialize colBtnData with retrieved array data
      const retrievedData = AcctMSTState?.colBtnDatactx;
      if (Array?.isArray(retrievedData)) {
        savecolBtnData.current = retrievedData?.map((item) => {
          if (item && item?.OTHER_SECURITY_TYPE) {
            let otherSecType = item?.OTHER_SECURITY_TYPE;
            while (
              Array?.isArray(otherSecType) &&
              Array?.isArray(otherSecType[0]) &&
              !otherSecType[0]?.hasOwnProperty("SR_CD") &&
              !otherSecType[0]?.hasOwnProperty("isNewRow")
            ) {
              otherSecType = otherSecType[0];
            }
            return {
              ...item,
              OTHER_SECURITY_TYPE: otherSecType,
            };
          }
          return item;
        });
      } else if (typeof retrievedData === "object") {
        // Convert object format to array format for backward compatibility
        const arrayData: any[] = [];
        Object?.keys(retrievedData)?.forEach((key) => {
          const index = parseInt(key);
          if (!isNaN(index)) {
            while (arrayData?.length <= index) {
              arrayData?.push({});
            }
            arrayData[index] = retrievedData[key];
          }
        });
        savecolBtnData.current = arrayData;
      }
      buttonRef.current = savecolBtnData.current;
    }
  }, [AcctMSTState?.colBtnDatactx]);

  useEffect(() => {
    if (AcctMSTState?.retrievecolBtnDatactx) {
      // Initialize colBtnData with retrieved array data
      const retrievedData = AcctMSTState?.retrievecolBtnDatactx;
      if (Array?.isArray(retrievedData)) {
        colBtnData.current = retrievedData;
      } else if (typeof retrievedData === "object") {
        // Convert object format to array format for backward compatibility
        const arrayData: any[] = [];
        Object?.keys(retrievedData)?.forEach((key) => {
          const index = parseInt(key);
          if (!isNaN(index)) {
            while (arrayData?.length <= index) {
              arrayData?.push({});
            }
            arrayData[index] = retrievedData[key];
          }
        });
        colBtnData.current = arrayData;
      }
      buttonRef.current = colBtnData.current;
    }
  }, [AcctMSTState?.retrievecolBtnDatactx]);

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
      let jointInitData = AcctMSTState?.retrieveFormDataApiRes[
        "JOINT_HYPOTHICATION_DTL"
      ]
        ? AcctMSTState?.retrieveFormDataApiRes["JOINT_HYPOTHICATION_DTL"]
        : data.JOINT_HYPOTHICATION_DTL;
      let maxSRCD = 0;
      if (AcctMSTState?.isFreshEntryctx) {
        if (
          Array.isArray(data?.JOINT_HYPOTHICATION_DTL) &&
          data?.JOINT_HYPOTHICATION_DTL?.length > 0
        ) {
          data?.JOINT_HYPOTHICATION_DTL?.forEach((item, index) => {
            item.SR_CD = String(index + 1);
          });
        }
      } else {
        maxSRCD =
          jointInitData?.reduce((max, item) => {
            const srCdNum = Number(item?.SR_CD ?? 0);
            return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
          }, 0) ?? 0;

        if (
          Array.isArray(data?.JOINT_HYPOTHICATION_DTL) &&
          data?.JOINT_HYPOTHICATION_DTL?.length > 0
        ) {
          data?.JOINT_HYPOTHICATION_DTL?.forEach((item) => {
            if (!item.SR_CD || item.SR_CD === "") {
              maxSRCD += 1;
              item.SR_CD = String(maxSRCD);
            }
          });
        }
      }
      let newData = AcctMSTState?.formDatactx;
      if (data?.JOINT_HYPOTHICATION_DTL) {
        let filteredCols: any[] = [];
        filteredCols = Object?.keys(data.JOINT_HYPOTHICATION_DTL[0]);
        filteredCols = filteredCols?.filter(
          (field) => !field?.includes("_ignoreField")
        );
        if (AcctMSTState?.isFreshEntryctx) {
          filteredCols = filteredCols.filter(
            (field) => !field?.includes("SR_CD")
          );
        }
        let newFormatOtherAdd = data?.JOINT_HYPOTHICATION_DTL?.map(
          (formRow, i) => {
            let formFields = Object?.keys(formRow);
            formFields = formFields?.filter(
              (field) => !field?.includes("_ignoreField")
            );
            const formData = _.pick(
              data?.JOINT_HYPOTHICATION_DTL[i],
              formFields
            );
            const allFields = Object.keys(formData);
            const dateFields: string[] = [
              "BIRTH_DATE",
              "VALUATION_DT",
              "TITLE_CLEAR_DT",
            ];
            allFields?.forEach((field) => {
              if (dateFields.includes(field)) {
                formData[field] = Boolean(formData[field])
                  ? format(
                      utilFunction.getParsedDate(formData[field]),
                      "dd/MMM/yyyy"
                    )
                  : "";
              }
            });
            return {
              ...formData,
              // J_TYPE: "M",
            };
          }
        );

        newData["JOINT_HYPOTHICATION_DTL"] = [...newFormatOtherAdd];
        const mergeRows = (rows, templateData) => {
          if (rows?.isNewRow && Array?.isArray(rows.isNewRow)) {
            rows.isNewRow = rows.isNewRow?.map((val) => ({
              ...val,
              ...templateData,
            }));
          }
          if (rows?.isUpdatedRow && Array?.isArray(rows.isUpdatedRow)) {
            rows.isUpdatedRow = rows.isUpdatedRow?.map((val) => ({
              ...val,
              ...templateData,
            }));
          }
          if (rows?.isDeleteRow && Array?.isArray(rows.isDeleteRow)) {
            rows.isDeleteRow = rows.isDeleteRow?.map((val) => ({
              ...val,
              ...templateData,
            }));
          }
          return [rows];
        };
        // Sync button data array length with form data length
        syncButtonDataLength(newFormatOtherAdd.length);
        const merged = newFormatOtherAdd
          .map((item, index) => {
            let TemplateData = {
              SR_CD: item?.SR_CD ?? "",
              LETTER_DP_FLAG: "N",
              DOC_VALUE: "0",
              SUB_TYPE: item?.SUB_TYPE ?? "",
              CERSAI_REGI: "N",
              SECURITY_CD: item?.SECURITY_CD ?? "",
            };
            // Get the index-wise button data for the current row from array
            const indexButtonData = savecolBtnData?.current?.[index] || {};
            return {
              ...item,
              IsNewRow:
                AcctMSTState?.req_cd_ctx || AcctMSTState?.acctNumberctx
                  ? false
                  : true,
              PROPERTY_DETAILS:
                indexButtonData?.PROPERTY_DETAILS &&
                Object?.keys(indexButtonData?.PROPERTY_DETAILS)?.length > 0
                  ? {
                      ...(indexButtonData?.PROPERTY_DETAILS || {}),
                      SR_CD: item?.SR_CD,
                    }
                  : undefined,
              MACHINERY_DETAILS:
                indexButtonData?.MACHINERY_DETAILS &&
                Object?.keys(indexButtonData?.MACHINERY_DETAILS)?.length > 0
                  ? {
                      ...(indexButtonData?.MACHINERY_DETAILS || {}),
                      SR_CD: item?.SR_CD,
                    }
                  : undefined,
              OTHER_SECURITY_TYPE:
                indexButtonData?.OTHER_SECURITY_TYPE &&
                Object?.keys(indexButtonData?.OTHER_SECURITY_TYPE)?.length > 0
                  ? AcctMSTState?.formmodectx === "new"
                    ? indexButtonData?.OTHER_SECURITY_TYPE?.map((val) => ({
                        ...val,
                        SR_CD: item?.SR_CD ?? "",
                        LETTER_DP_FLAG: "N",
                        DOC_VALUE: "0",
                        CERSAI_REGI: "N",
                        SUB_TYPE: item?.SUB_TYPE ?? "",
                        SECURITY_CD: item?.SECURITY_CD ?? "",
                      }))
                    : mergeRows(
                        indexButtonData?.OTHER_SECURITY_TYPE,
                        TemplateData
                      )
                  : undefined,
            };
          })
          .filter(
            (obj) =>
              obj?.PROPERTY_DETAILS !== undefined ||
              obj?.MACHINERY_DETAILS !== undefined ||
              obj?.OTHER_SECURITY_TYPE !== undefined
          );

        newData["COLLATERAL_BUTTON_DTL"] = [...merged];
        handleFormDataonSavectx(newData);
        if (!AcctMSTState?.isFreshEntryctx) {
          let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            JOINT_HYPOTHICATION_DTL: [...filteredCols],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
      } else {
        newData["JOINT_HYPOTHICATION_DTL"] = [];
        handleFormDataonSavectx(newData);
        if (!AcctMSTState?.isFreshEntryctx) {
          let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            JOINT_HYPOTHICATION_DTL: [],
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
  const jointDtlData = useJointDetailByTabName("COLL_DTL", AcctMSTState);

  const initialVal = useMemo(() => {
    const dateFields: string[] = [
      "BIRTH_DATE",
      "VALUATION_DT",
      "TITLE_CLEAR_DT",
    ];
    let formData =
      AcctMSTState?.formDatactx["JOINT_HYPOTHICATION_DTL"] ??
      AcctMSTState?.retrieveFormDataApiRes["JOINT_HYPOTHICATION_DTL"] ??
      jointDtlData;
    if (
      !Boolean(AcctMSTState?.isFreshEntryctx) &&
      !Boolean(AcctMSTState?.formDatactx["JOINT_HYPOTHICATION_DTL"])
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
      JOINT_HYPOTHICATION_DTL: AcctMSTState?.isFreshEntryctx
        ? finalFormData.length > 0
          ? [...finalFormData]
          : jointDtlData
        : [...finalFormData],
      HIDDEN_COMP_CD: authState?.companyID ?? "",
      HIDDEN_IsFreshEntry: AcctMSTState?.isFreshEntryctx ?? "",
    };
  }, [
    AcctMSTState?.isFreshEntryctx,
    AcctMSTState?.retrieveFormDataApiRes["JOINT_HYPOTHICATION_DTL"],
    AcctMSTState?.formDatactx["JOINT_HYPOTHICATION_DTL"],
    authState?.companyID,
    jointDtlData,
  ]);
  const showErrorMessage = async (message) => {
    await MessageBox({
      messageTitle: "ValidationFailed",
      message: message,
      icon: "ERROR",
    });
  };
  useEffect(() => {
    if (
      buttonName === "OTHRSECURITY" &&
      getOtherSecurityBtnData?.data?.length > 0 &&
      !getIndexWiseButtonData(formIndex, "OTHER_SECURITY_TYPE")
    ) {
      setIndexWiseButtonData(
        formIndex,
        "OTHER_SECURITY_TYPE",
        getOtherSecurityBtnData?.data
      );
    } else if (
      buttonName === "PROPERTY" &&
      getOtherSecurityBtnData?.data?.length > 0 &&
      !getIndexWiseButtonData(formIndex, "PROPERTY_DETAILS")
    ) {
      setIndexWiseButtonData(
        formIndex,
        "PROPERTY_DETAILS",
        getOtherSecurityBtnData?.data?.[0]
      );
    } else if (
      buttonName === "MACHINERY" &&
      getOtherSecurityBtnData?.data?.length > 0 &&
      !getIndexWiseButtonData(formIndex, "MACHINERY_DETAILS")
    ) {
      setIndexWiseButtonData(
        formIndex,
        "MACHINERY_DETAILS",
        getOtherSecurityBtnData?.data?.[0]
      );
    }
  }, [buttonName, getOtherSecurityBtnData?.data, formIndex]);
  return (
    <Grid>
      <FormWrapper
        key={
          "acct-mst-joint-hypothication-form" +
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
          setIsOpen: setIsOpen,
          maincustomerid:
            AcctMSTState?.formDatactx?.MAIN_DETAIL?.CUSTOMER_ID ??
            AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID ??
            "",
          initialVal: initialVal,
          diableIntroAcct: AcctMSTState?.diableIntroAcct ?? "",
        }}
        // initialValues={AcctMSTState?.formDatactx["PERSONAL_DETAIL"] ?? {}}
        initialValues={initialVal}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        onFormButtonClickHandel={async (id, dependentFields) => {
          const securityCd =
            dependentFields?.["JOINT_HYPOTHICATION_DTL.SECURITY_CD"] ?? "";
          const sr_cd =
            dependentFields?.["JOINT_HYPOTHICATION_DTL.SR_CD"]?.value ?? "";
          const securityType =
            dependentFields?.["JOINT_HYPOTHICATION_DTL.SECURITY_TYPE"] ?? "";

          const securityOption =
            securityCd?.optionData?.[0]?.SECURITY_TYPE ?? "";
          const accountType =
            initialVal?.JOINT_HYPOTHICATION_DTL[0]?.ACCT_TYPE ?? "";
          const accountCd =
            initialVal?.JOINT_HYPOTHICATION_DTL[0]?.ACCT_CD ?? "";
          const SrCd = initialVal?.JOINT_HYPOTHICATION_DTL[0]?.SR_CD ?? "";
          setIsData({
            securityCode: securityCd,
            securityType: securityType?.value,
            securityOption: securityOption,
            accountType: accountType,
            accountCd: accountCd,
          });
          if (id.slice(id.indexOf(".") + 1) === "PROPERTY_ignoreField") {
            const currentIndex = parseInt(
              id.slice(id.indexOf("[") + 1, id.indexOf("]"))
            );
            setFormIndex(currentIndex);
            if (
              !AcctMSTState?.isFreshEntryctx &&
              !getIndexWiseButtonData(currentIndex, "PROPERTY_DETAILS")
            ) {
              getOtherSecurityBtnData.mutate({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
                SECURITY_CD: "",
                SR_CD: sr_cd ?? String(currentIndex + 1),
                SECURITY_TYPE: "PRT",
                REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
              });
            }
            setOpenForm(true);
            setButtonName("PROPERTY");
          } else if (
            id.slice(id.indexOf(".") + 1) === "MACHINERY_ignoreField"
          ) {
            const currentIndex = parseInt(
              id.slice(id.indexOf("[") + 1, id.indexOf("]"))
            );
            setFormIndex(currentIndex);
            if (
              !AcctMSTState?.isFreshEntryctx &&
              !getIndexWiseButtonData(currentIndex, "MACHINERY_DETAILS")
            ) {
              getOtherSecurityBtnData.mutate({
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
                SECURITY_CD: "",
                SR_CD: sr_cd ?? String(currentIndex + 1),
                SECURITY_TYPE: "MCH",
                REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
              });
            }
            setOpenForm(true);
            setButtonName("MACHINERY");
          } else if (
            id.slice(id.indexOf(".") + 1) === "CRDT_WORTHINESS_ignoreField"
          ) {
            let acct_num =
              dependentFields?.[
                "JOINT_HYPOTHICATION_DTL.MEM_ACCT_CD"
              ]?.value?.trim();

            let retrieveAcctNum =
              AcctMSTState?.retrieveFormDataApiRes[
                "JOINT_HYPOTHICATION_DTL"
              ]?.[0]?.MEM_ACCT_CD?.trim();
            if ((acct_num !== "" && isOpen) || (retrieveAcctNum && isOpen)) {
              setOpenCreditWorthGrid(true);
              setAccountNumberDetails({
                A_COMP_CD:
                  dependentFields?.["JOINT_HYPOTHICATION_DTL.PATH_PHOTO"]
                    ?.value ?? "",
                A_BRANCH_CD:
                  dependentFields?.["JOINT_HYPOTHICATION_DTL.PATH_SIGN"]
                    ?.value ?? "",
                A_ACCT_TYPE:
                  dependentFields?.["JOINT_HYPOTHICATION_DTL.MEM_ACCT_TYPE"]
                    ?.value ?? "",
                A_ACCT_CD:
                  dependentFields?.["JOINT_HYPOTHICATION_DTL.MEM_ACCT_CD"]
                    ?.value ?? "",
                TAB: "COLLATERALTAB",
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
          if (id.slice(id.indexOf(".") + 1) === "OTHRSECURITY_ignoreField") {
            if (!securityType?.value?.length) {
              await showErrorMessage("Please Select Security Type");
            } else if (!securityCd?.value?.length) {
              await showErrorMessage("Please Select Security");
            } else if (securityOption === "PRT") {
              await showErrorMessage(
                "User property button to enter Property details."
              );
            } else if (securityOption === "MCH") {
              await showErrorMessage(
                "User machinery button to enter Machinery details."
              );
            } else {
              const validSecurityOptions = [
                "VEH",
                "STK",
                "BDC",
                "SH",
                "OTH",
                "GOV",
                "LIC",
                "BRD",
                "BFD",
              ];
              if (validSecurityOptions.includes(securityOption)) {
                const currentIndex = parseInt(
                  id.slice(id.indexOf("[") + 1, id.indexOf("]"))
                );
                setFormIndex(currentIndex);
                if (
                  !AcctMSTState?.isFreshEntryctx &&
                  !getIndexWiseButtonData(currentIndex, "OTHER_SECURITY_TYPE")
                ) {
                  getOtherSecurityBtnData.mutate({
                    COMP_CD: authState?.companyID ?? "",
                    BRANCH_CD: authState?.user?.branchCode ?? "",
                    ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
                    ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
                    SECURITY_CD: securityCd?.value ?? "",
                    SR_CD: sr_cd ?? String(currentIndex + 1),
                    SECURITY_TYPE: securityOption ?? "",
                    REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
                  });
                }
                setSecBtn(true);
                setButtonName("OTHRSECURITY");
                setOptionData(securityOption ?? "");
              } else {
                setSecBtn(false);
              }
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
      {openForm && (
        <ColletralButton
          closeDialog={() => {
            setOpenForm(false);
            setButtonName("");
          }}
          optionData={""}
          buttonName={buttonName}
          isLoading={getOtherSecurityBtnData?.isLoading}
          otherSecurityData={otherSecurityData}
          isData={isData}
          colBtnData={colBtnData.current}
          savecolBtnData={savecolBtnData.current}
          formIndex={formIndex}
        />
      )}
      {openSecBtn && (
        <OtherSecurityButton
          closeDialog={() => {
            setSecBtn(false);
            setButtonName("");
          }}
          optionData={optionData}
          buttonName={buttonName}
          isLoading={getOtherSecurityBtnData?.isLoading}
          otherSecurityData={otherSecurityData}
          isData={isData}
          colBtnData={colBtnData.current}
          formIndex={formIndex}
          savecolBtnData={savecolBtnData.current}
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

export default CollateralJointTab;
