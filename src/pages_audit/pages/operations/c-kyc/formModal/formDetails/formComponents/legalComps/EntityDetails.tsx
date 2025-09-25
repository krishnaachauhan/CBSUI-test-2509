import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Grid, Typography, IconButton, Collapse, Dialog } from "@mui/material";
import {
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../../../CkycContext";
import { entity_detail_legal_meta_data } from "../../metadata/legal/legalentitydetails";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "../../../../api";
import { ckyc_retrieved_meta_data } from "pages_audit/pages/operations/c-kyc/metadata";
import _, { isEmpty } from "lodash";
import TabNavigate from "../TabNavigate";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import { legal_reference_detail_meta_data } from "../../metadata/legal/legal_reference_details";
import { useLocation } from "react-router-dom";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { getFormattedDate } from "components/agGridTable/utils/helper";
import { ClonedCkycContext } from "./ClonedCkycContext";
const actions = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const EntityDetails = ({ isModal }) => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const PDFormRef = useRef<any>("");
  const refFormRef = useRef<any>("");
  const formFieldsRef = useRef<any>([]);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const {
    state,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    handleApiRes,
    toNextTab,
    toPrevTab,
    handleAccTypeVal,
    handleColTabChangectx,
    tabFormRefs,
    handleUpdateLoader,
    handleFormDataonSavectxNew,
    handleUpdateDocument,
    handleFinalUpdateReq,
    handleButtonDisable,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const [isPDExpanded, setIsPDExpanded] = useState(true);
  const [isRefExpanded, setIsRefExpanded] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const acctNmRef = useRef("");
  const photoSignReqRef = useRef({});
  const [openPhotoSign, setOpenPhotoSign] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const stepStatusRef = useRef<any>("");
  const handlePDExpand = () => {
    setIsPDExpanded(!isPDExpanded);
  };
  const handleRefExpanded = () => {
    setIsRefExpanded(!isRefExpanded);
  };

  const mutation: any = useMutation(API.getRetrieveData, {
    onSuccess: (data) => {},
    onError: (error: any) => {},
  });

  const onCloseSearchDialog = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Entity Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = [PDFormRef.current, refFormRef.current];
    }
  }, [tabFormRefs, state?.tabNameList]);

  useEffect(() => {
    let refs = [PDFormRef, refFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    if (
      Boolean(
        state?.currentFormctx.currentFormRefctx &&
          state?.currentFormctx.currentFormRefctx.length > 0
      ) &&
      Boolean(formStatus && formStatus.length > 0)
    ) {
      if (
        state?.currentFormctx.currentFormRefctx.length === formStatus.length
      ) {
        let submitted;
        submitted = formStatus.filter((form) => !Boolean(form));
        if (submitted && Array.isArray(submitted) && submitted.length > 0) {
          submitted = false;
        } else {
          submitted = true;
          const lastActionFlag = stepStatusRef.current;
          if (lastActionFlag && lastActionFlag?.startsWith("TabChange")) {
            const tabIndex = parseInt(lastActionFlag?.split(" ")[1], 10);
            handleStepStatusctx({
              status: "completed",
              coltabvalue: state?.colTabValuectx,
            });
            handleColTabChangectx(tabIndex);
          } else if (
            !state?.customerIDctx?.trim() &&
            !lastActionFlag?.startsWith("UpdateData")
          ) {
            handleStepStatusctx({
              status: "completed",
              coltabvalue: state?.colTabValuectx,
            });
            lastActionFlag?.startsWith("savePre") ? toPrevTab() : toNextTab();
          } else {
            handleStepStatusctx({
              status: "completed",
              coltabvalue: state?.colTabValuectx,
            });
          }
        }
        handleUpdateLoader(false);
        handleCurrFormctx({
          currentFormSubmitted: submitted,
        });
        setFormStatus([]);
      }
    }
  }, [formStatus]);

  let docTemplatePayload = {
    COMP_CD: authState?.companyID ?? "",
    BRANCH_CD: authState?.user?.branchCode ?? "",
    CUST_TYPE: state?.entityTypectx,
    CONSTITUTION_TYPE: state?.constitutionValuectx ?? "",
  };
  const DocTemplateMutation: any = useMutation(API.getKYCDocumentGridData, {
    onSuccess: (data) => {
      if (Array.isArray(data) && data.length > 0) {
        let newData: any[] = data;
        newData = newData.map(({ DOC_TYPE, ...doc }) => {
          return {
            ...doc,
            TRANSR_CD: `${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y" ? true : false,
            ENTERED_DATE: authState?.workingDate ?? "",
            DISPLAY_TEMPLATE_CD: doc?.DOC_DESCRIPTION,
            _isNewRow: true,
          };
        });
        handleUpdateDocument({
          documents: [...newData],
        });
      }
    },
  });

  const handleDocSave = async () => {
    if (!isEmpty(state?.documentObj)) {
      const rawData = await state?.documentObj?.filter(
        (item) => item?.DOC_TYPE !== "KYC"
      );

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
          };
        }
      );

      let newTabsData = state?.formDatactx;

      newTabsData["DOC_MST"] = { doc_mst_payload: [...transformedData] };
      handleFinalUpdateReq({ DOC_MST: [...transformedData] });
    }
  };

  const onSubmitPDHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    if (data && !hasError) {
      handleUpdateLoader(true);
      stepStatusRef.current = actionFlag;
      optional.attestatioDtl.RISK_CATEG = data?.RISK_CATEG;
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, all form-fields-name, used to check modified columns
      let formData = _.pick(data, formFieldsRef.current);
      let newData = state?.formDatactx;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "",
        // REQ_CD: state?.req_cd_ctx,
        // SR_CD: "3",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        ENTRY_TYPE: "1",
      };
      newData["PERSONAL_DETAIL"] = {
        ...newData["PERSONAL_DETAIL"],
        ...formData,
        ...commonData,
      };
      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx) {
        let tabModifiedCols: any = state?.modifiedFormCols;
        let updatedCols = tabModifiedCols.PERSONAL_DETAIL
          ? _.uniq([
              ...tabModifiedCols.PERSONAL_DETAIL,
              ...formFieldsRef.current,
            ])
          : _.uniq([...formFieldsRef.current]);

        tabModifiedCols = {
          ...tabModifiedCols,
          PERSONAL_DETAIL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      let req = {
        ...data,
        ...utilFunction.transformDetailsData(
          data,
          optional?.retrieveFormDataApiRes["PERSONAL_DETAIL"] ?? {}
        ),
      };
      handleFormDataonSavectxNew({
        PERSONAL_DETAIL_PD: Boolean(
          Object?.keys(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {})
            ?.length > 0
        )
          ? req
          : data,
      });
      setFormStatus((old) => [...old, true]);
    } else {
      handleUpdateLoader(false);
      handleStepStatusctx({
        status: "error",
        coltabvalue: state?.colTabValuectx,
      });
      setFormStatus((old) => [...old, false]);
    }
    endSubmit(true);
  };

  const onSubmitRefHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    if (data && !hasError) {
      handleUpdateLoader(true);
      let formFields = Object.keys(data);
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]);
      let formData = _.pick(data, formFieldsRef.current);

      let newData = state?.formDatactx;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "",
        // REQ_CD: state?.req_cd_ctx,
        // SR_CD: "3",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        ENTRY_TYPE: "1",
      };
      newData["PERSONAL_DETAIL"] = {
        ...newData["PERSONAL_DETAIL"],
        ...formData,
        ...commonData,
      };

      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx) {
        let tabModifiedCols: any = state?.modifiedFormCols;
        let updatedCols = tabModifiedCols.PERSONAL_DETAIL
          ? _.uniq([
              ...tabModifiedCols.PERSONAL_DETAIL,
              ...formFieldsRef.current,
            ])
          : _.uniq([...formFieldsRef.current]);

        tabModifiedCols = {
          ...tabModifiedCols,
          PERSONAL_DETAIL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      let req = {
        ...data,
        ...utilFunction.transformDetailsData(
          data,
          optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
        ),
      };
      handleFormDataonSavectxNew({
        PERSONAL_ENTITY_REF: Boolean(
          Object?.keys(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {})
            ?.length > 0
        )
          ? req
          : data,
      });
      setFormStatus((old) => [...old, true]);
    } else {
      handleUpdateLoader(false);
      handleStepStatusctx({
        status: "error",
        coltabvalue: state?.colTabValuectx,
      });
      setFormStatus((old) => [...old, false]);
    }
    endSubmit(true);
  };

  const handleSave = async (e, btnFlag) => {
    const refs = await Promise.all([
      PDFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
      refFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
    ]);
    if (state?.customerIDctx === "" && state?.req_cd_ctx === "") {
      await handleDocSave();
    }
    handleSavectx(e, refs);
  };
  useEffect(() => {
    if (state?.formmodectx === "new") {
      DocTemplateMutation.mutate(docTemplatePayload);
    }
  }, [state?.formmodectx]);

  const entityDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "Entity Details"
  );
  const handleSignViewClick = async ({ id, dependentFields }) => {
    if (id !== "SIGN_VIEW") return;
    const referenceType = dependentFields?.REFERENCE_TYPE?.value ?? "";
    const showError = async (messageKey) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: messageKey,
        icon: "ERROR",
      });
    };
    const custId = dependentFields?.REFERENCE_CUST_ID?.value ?? "";
    const compCd = dependentFields?.MEM_COMP_CD?.value ?? "";
    const branchCd = dependentFields?.MEM_BRANCH_CD?.value ?? "";
    const acctType = dependentFields?.MEM_ACCT_TYPE?.value ?? "";
    const acctCd = dependentFields?.MEM_ACCT_CD?.value ?? "";
    if (referenceType === "O") {
      return await showError("PleaseenterReferenceAcCompanyCode");
    }
    if (!referenceType) {
      if (!custId && !compCd && !branchCd && !acctType && !acctCd) {
        return await showError("PleaseenterReferenceAcCompanyCode");
      }
      if (compCd && branchCd && acctType && acctCd) {
        photoSignReqRef.current = {
          COMP_CD: (compCd || authState?.companyID) ?? "",
          BRANCH_CD: (branchCd || authState?.user?.branchCode) ?? "",
          ACCT_TYPE: acctType,
          ACCT_CD: acctCd,
        };
        return setOpenPhotoSign(true);
      }
      if (custId) {
        photoSignReqRef.current = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          ACCT_TYPE: "",
          ACCT_CD: "",
          CUSTOMER_ID: custId,
        };
        return setOpenPhotoSign(true);
      }
    }
    if (referenceType === "C") {
      if (!custId) return await showError("PleaseenterReferenceCustID");
      photoSignReqRef.current = {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_TYPE: "",
        ACCT_CD: "",
        CUSTOMER_ID: custId,
      };
      return setOpenPhotoSign(true);
    }
    if (referenceType === "B") {
      if (!compCd) return await showError("PleaseenterReferenceAcCompanyCode");
      if (!branchCd) return await showError("PleaseenterReferenceAcBranchCode");
      if (!acctType) return await showError("PleaseenterReferenceAcTypeCode");
      if (!acctCd) return await showError("PleaseenterReferenceAcCode");
      photoSignReqRef.current = {
        COMP_CD: (compCd || authState?.companyID) ?? "",
        BRANCH_CD: (branchCd || authState?.user?.branchCode) ?? "",
        ACCT_TYPE: acctType,
        ACCT_CD: acctCd,
      };
      return setOpenPhotoSign(true);
    }
  };

  return (
    <Grid container rowGap={3}>
      <Grid
        sx={{
          backgroundColor: "var(--theme-color2)",
          padding: (theme) => theme.spacing(1),
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: "20px",
        }}
        container
        item
        xs={12}
        direction={"column"}
      >
        <Grid
          container
          item
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography
            sx={{ color: "var(--theme-color3)", pl: 2 }}
            variant={"h6"}
          >
            {entityDetailsTab?.subtitles[0]?.SUB_TITLE_NAME ??
              t("EntityDetails")}
          </Typography>
          <IconButton onClick={handlePDExpand}>
            {!isPDExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>
        <Collapse in={isPDExpanded}>
          <Grid item>
            <FormWrapper
              ref={PDFormRef}
              onSubmitHandler={onSubmitPDHandler}
              initialValues={{
                ...(state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.PERSONAL_DETAIL_PD ?? {}),
              }}
              key={
                "pd-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={entity_detail_legal_meta_data(state) as MetaDataType}
              formStyle={{}}
              formState={{
                MessageBox: MessageBox,
                TIN_ISSUING_COUNTRY: state?.isFreshEntryctx
                  ? state?.formDatactx["PERSONAL_DETAIL"]
                      ?.TIN_ISSUING_COUNTRY ?? ""
                  : state?.retrieveFormDataApiRes["PERSONAL_DETAIL"]
                      ?.TIN_ISSUING_COUNTRY ?? "",
                TIN: state?.isFreshEntryctx
                  ? state?.formDatactx["PERSONAL_DETAIL"]?.TIN ?? ""
                  : state?.retrieveFormDataApiRes["PERSONAL_DETAIL"]?.TIN ?? "",
                WORKING_DATE: authState?.workingDate,
                CustomerType: state?.entityTypectx,
                handleAccTypeVal: handleAccTypeVal,
                state,
                handleButtonDisable,
              }}
              hideHeader={true}
              displayMode={state?.formmodectx}
              controlsAtBottom={false}
              onFormButtonClickHandel={(fieldID, dependentFields) => {
                if (
                  fieldID === "SEARCH_BTN" &&
                  dependentFields?.SURNAME?.value
                ) {
                  if (dependentFields?.SURNAME?.value.trim().length > 0) {
                    if (
                      acctNmRef.current !==
                      dependentFields?.SURNAME?.value.trim()
                    ) {
                      acctNmRef.current =
                        dependentFields?.SURNAME?.value.trim();
                      let data = {
                        COMP_CD: authState?.companyID ?? "",
                        BRANCH_CD: authState?.user?.branchCode ?? "",
                        A_PARA: [
                          {
                            COL_NM: "ACCT_NM",
                            COL_VAL: dependentFields?.SURNAME?.value.trim(),
                          },
                        ],
                      };
                      mutation.mutate(data);
                    }
                    setDialogOpen(true);
                  } else {
                    acctNmRef.current = "";
                  }
                }
              }}
            />
          </Grid>
        </Collapse>
      </Grid>
      <Grid
        sx={{
          backgroundColor: "var(--theme-color2)",
          padding: (theme) => theme.spacing(1),
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: "20px",
        }}
        container
        item
        xs={12}
        direction={"column"}
      >
        <Grid
          container
          item
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography
            sx={{ color: "var(--theme-color3)", pl: 2 }}
            variant={"h6"}
          >
            {entityDetailsTab?.subtitles?.[1]?.SUB_TITLE_NAME ??
              t("ProofOfAddress")}
          </Typography>
          <IconButton onClick={handleRefExpanded}>
            {!isRefExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>
        <Collapse in={isRefExpanded}>
          <Grid item>
            <FormWrapper
              ref={refFormRef}
              onSubmitHandler={onSubmitRefHandler}
              initialValues={{
                ...(state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.PERSONAL_ENTITY_REF ?? {}),
              }}
              displayMode={state?.formmodectx}
              key={
                "ref-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={legal_reference_detail_meta_data as MetaDataType}
              formStyle={{}}
              onFormButtonClickHandel={async (id, dependentFields) =>
                handleSignViewClick({ id, dependentFields })
              }
              hideHeader={true}
              formState={{
                MessageBox: MessageBox,
                docCD: docCD,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                CUSTOMER_ID: state?.customerIDctx ?? "",
                state,
                acctDtlReqPara: {
                  MEM_ACCT_CD: {
                    ACCT_TYPE: "MEM_ACCT_TYPE",
                    BRANCH_CD: "MEM_BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                },
                handleButtonDisable,
              }}
            />
          </Grid>
        </Collapse>
      </Grid>
      <TabNavigate
        handleSave={handleSave}
        displayMode={state?.formmodectx ?? "new"}
        isModal={isModal}
      />

      {dialogOpen && (
        <SearchListdialog
          open={dialogOpen}
          onClose={onCloseSearchDialog}
          acctNM={acctNmRef.current}
        />
      )}

      {openPhotoSign ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <PhotoSignWithHistory
            data={{
              ...photoSignReqRef.current,
            }}
            onClose={() => {
              setOpenPhotoSign(false);
            }}
            screenRef={docCD ?? ""}
          />
        </Dialog>
      ) : null}
    </Grid>
  );
};

export const SearchListdialog = ({ open, onClose, acctNM }) => {
  const { authState } = useContext(AuthContext);

  // retrieve customer data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any,
    any
  >(["CustomerListAccountName", acctNM], () =>
    API.getRetrieveData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      A_PARA: [
        {
          COL_NM: "ACCT_NM",
          COL_VAL: acctNM,
        },
      ],
    })
  );

  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      onClose();
    }
  }, []);

  useEffect(() => {
    if (Boolean(ckyc_retrieved_meta_data.gridConfig.gridLabel)) {
      ckyc_retrieved_meta_data.gridConfig.gridLabel = "MatchNameCustomerID";
    }
  }, []);

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      // onClose={onClose}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      PaperProps={{
        style: {
          minWidth: "70%",
          width: "80%",
        },
      }}
    >
      {isError && (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`SearchListGrid`}
        finalMetaData={ckyc_retrieved_meta_data as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
    </Dialog>
  );
};

export default EntityDetails;
