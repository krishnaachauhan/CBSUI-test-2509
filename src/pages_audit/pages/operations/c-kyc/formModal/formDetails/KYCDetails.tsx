import { useRef, useState, useEffect, useContext, useMemo } from "react";
import { Grid, Typography, Collapse, IconButton, Dialog } from "@mui/material";
import { format } from "date-fns";
import {
  kyc_dup_reason_form,
  kyc_proof_of_address_meta_data,
  kyc_proof_of_identity_meta_data,
} from "./metadata/individual/kycdetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../CkycContext";
import { company_info_meta_data } from "./metadata/legal/legalcompanyinfo";
import _ from "lodash";
import { AuthContext } from "pages_audit/auth";
import TabNavigate from "./formComponents/TabNavigate";
import {
  usePopupContext,
  MetaDataType,
  FormWrapper,
  utilFunction,
  GradientButton,
  Alert,
  GridWrapper,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { getCkycPanDupDtl } from "../../api";
import { useMutation } from "react-query";
import { DupPanDetailGridMetaData } from "./dupPanDetailsGridMetadata";
import { Box } from "@mui/system";
import { ClonedCkycContext } from "./formComponents/legalComps/ClonedCkycContext";

const KYCDetails = ({ isModal }) => {
  const { t } = useTranslation();
  const {
    state,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    toNextTab,
    toPrevTab,
    handlePanDupReason,
    handleOtherExtDtlctx,
    handleColTabChangectx,
    tabFormRefs,
    handleUpdateLoader,
    handleFormDataonSavectxNew,
    handleFormOtherDtlData,
    handleButtonDisable,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [isPoIExpanded, setIsPoIExpanded] = useState(true);
  const [isCompanyInfoExpanded, setIsCompanyInfoExpanded] = useState(true);
  const [isPoAExpanded, setIsPoAExpanded] = useState(true);
  const KyCPoIFormRef = useRef<any>("");
  const KyCCompanyInfoFormRef = useRef<any>("");
  const KyCPoAFormRef = useRef<any>("");
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panDupDtlOpen, setPanDupDtlOpen] = useState(false);
  const [resolveDialog, setResolveDialog] = useState<any>("");
  const stepStatusRef = useRef<any>("");
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const { MessageBox } = usePopupContext();
  const handlePoIExpand = () => {
    setIsPoIExpanded(!isPoIExpanded);
  };
  const handlePoAExpand = () => {
    setIsPoAExpanded(!isPoAExpanded);
  };
  const handleCompanyInfoExpand = () => {
    setIsCompanyInfoExpanded(!isCompanyInfoExpanded);
  };

  const panDupDtl: any = useMutation(getCkycPanDupDtl, {
    onSuccess: (data) => {},
    onError: (error: any) => {},
  });

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "KYC Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] =
        state?.entityTypectx === "C"
          ? [
              KyCCompanyInfoFormRef.current,
              KyCPoIFormRef.current,
              KyCPoAFormRef.current,
            ]
          : [KyCPoIFormRef.current, KyCPoAFormRef.current];
    }
  }, [tabFormRefs, state?.tabNameList]);

  useEffect(() => {
    let refs =
      state?.entityTypectx === "C"
        ? [KyCCompanyInfoFormRef, KyCPoIFormRef, KyCPoAFormRef]
        : [KyCPoIFormRef, KyCPoAFormRef];
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
  const CompanyInfoSubmitHandler = (
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
      let newData = state?.formDatactx;
      newData["OTHER_DTL"] = {
        ...newData["OTHER_DTL"],
        ...data,
      };
      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx || state?.fromctx === "new-draft") {
        // on edit/view
        let tabModifiedCols: any = state?.modifiedFormCols;
        let updatedCols = tabModifiedCols.OTHER_DTL
          ? _.uniq([...tabModifiedCols.OTHER_DTL, ...formFieldsRef.current])
          : _.uniq([...formFieldsRef.current]);
        tabModifiedCols = {
          ...tabModifiedCols,
          OTHER_DTL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      let req = {
        ...data,
        ...utilFunction.transformDetailsData(
          data,
          optional?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {}
        ),
      };

      if (data && Object.keys(data).length > 0) {
        handleFormOtherDtlData({
          COMPANY_INFO:
            optional?.retrieveFormDataApiRes?.["OTHER_DTL"] &&
            Object.keys(optional.retrieveFormDataApiRes?.["OTHER_DTL"])
              ?.length > 0
              ? req
              : data,
        });
      }

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
  const PoISubmitHandler = (
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
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      let formData: any = _.pick(data, formFieldsRef.current);
      let newData = state?.formDatactx;
      newData["PERSONAL_DETAIL"] = {
        ...newData["PERSONAL_DETAIL"],
        ...formData,
      };
      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx || state?.fromctx === "new-draft") {
        // on edit/view
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
        PERSONAL_DETAIL_KYC_POI: Boolean(
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
  const PoASubmitHandler = (
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
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
      let formData = _.pick(data, formFieldsRef.current);
      let newData = state?.formDatactx;
      newData["PERSONAL_DETAIL"] = {
        ...newData["PERSONAL_DETAIL"],
        ...formData,
      };
      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx || state?.fromctx === "new-draft") {
        // on edit/view
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
        PERSONAL_DETAIL_KYC_POA: Boolean(
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
  const DupReasonFormubmitHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    endSubmit(true);
    const dupPanReason = data?.PAN_DUP_REASON ?? "";
    handlePanDupReason(dupPanReason);
    handleDialogClose("Saved");
  };

  const handleSave = async (e, btnFlag) => {
    const refs = await Promise.all([
      KyCPoAFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
      KyCPoIFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
      state?.entityTypectx === "C"
        ? KyCCompanyInfoFormRef.current.handleSubmit(
            e,
            btnFlag === "PREVIOUS" ? "savePre" : "save",
            false,
            state
          )
        : null,
    ]);
    handleSavectx(e, refs);
  };

  const openDialogandReturnValue = () => {
    return new Promise((resolve) => {
      setResolveDialog(() => resolve);
      setDialogOpen(true);
    });
  };

  const handleDialogClose = (result) => {
    setDialogOpen(false);
    if (resolveDialog) {
      resolveDialog(result);
      setResolveDialog("");
    }
  };
  const kycDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "KYC Details"
  );

  return (
    <Grid container rowGap={3}>
      {state?.entityTypectx === "C" ? (
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
          <Grid item>
            <Grid
              container
              item
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography
                sx={{ color: "var(--theme-color3)", pl: 2 }}
                variant={"h6"}
              >
                Company Info
              </Typography>
              <IconButton onClick={handleCompanyInfoExpand}>
                {!isCompanyInfoExpanded ? (
                  <ExpandMoreIcon />
                ) : (
                  <ExpandLessIcon />
                )}
              </IconButton>
            </Grid>
          </Grid>
          <Collapse in={isCompanyInfoExpanded}>
            <Grid item xs={12}>
              <FormWrapper
                ref={KyCCompanyInfoFormRef}
                onSubmitHandler={CompanyInfoSubmitHandler}
                initialValues={{
                  ...(state?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {}),
                  ...(state?.updatedOtherDtlReq?.["COMPANY_INFO"] ?? {}),
                }}
                displayMode={state?.formmodectx}
                key={
                  "compnayInfo-form-kyc" +
                  state?.retrieveFormDataApiRes["OTHER_DTL"] +
                  state?.formmodectx
                }
                metaData={company_info_meta_data(state) as MetaDataType}
                formStyle={{}}
                hideHeader={true}
                formState={{
                  MessageBox,
                }}
              />
            </Grid>
          </Collapse>
        </Grid>
      ) : null}

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
        <Grid item>
          <Grid
            container
            item
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography
              sx={{ color: "var(--theme-color3)", pl: 2 }}
              variant={"h6"}
            >
              {state?.entityTypectx === "I"
                ? kycDetailsTab?.subtitles[0]?.SUB_TITLE_NAME
                : t("ProofOfIdentity")}
            </Typography>
            <IconButton onClick={handlePoIExpand}>
              {!isPoIExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Grid>
        </Grid>
        <Collapse in={isPoIExpanded}>
          <Grid item xs={12}>
            <FormWrapper
              ref={KyCPoIFormRef}
              onSubmitHandler={PoISubmitHandler}
              initialValues={{
                ...(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.["PERSONAL_DETAIL_KYC_POI"] ?? {}),
              }}
              displayMode={state?.formmodectx}
              key={
                "poi-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={kyc_proof_of_identity_meta_data(state) as MetaDataType}
              formStyle={{}}
              hideHeader={true}
              formState={{
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                CATEG_CD: state?.categoryValuectx ?? "",
                CUSTOMER_ID: state?.customerIDctx ?? "",
                REQ_FLAG:
                  state?.isFreshEntryctx || state?.isDraftSavedctx ? "F" : "E",
                RESIDENCE_STATUS:
                  state?.formDatactx["PERSONAL_DETAIL"]?.RESIDENCE_STATUS ?? "",
                TIN_ISSUING_COUNTRY: state?.isFreshEntryctx
                  ? state?.formDatactx["PERSONAL_DETAIL"]
                      ?.TIN_ISSUING_COUNTRY ?? ""
                  : state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]
                      ?.TIN_ISSUING_COUNTRY ?? "",
                TIN: state?.isFreshEntryctx
                  ? state?.formDatactx["PERSONAL_DETAIL"]?.TIN ?? ""
                  : state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.TIN ??
                    "",
                MessageBox: MessageBox,
                asyncFunction: openDialogandReturnValue,
                state,
                handleButtonDisable,
              }}
              onFormButtonClickHandel={(fieldID, dependentFields) => {
                if (
                  fieldID === "PAN_DUP_DTL_BTN" &&
                  dependentFields?.PAN_NO?.value
                ) {
                  setPanDupDtlOpen(true);
                  DupPanDetailGridMetaData.gridConfig.gridLabel = `${t(
                    "PANDuplicationDetails"
                  )} ${dependentFields?.PAN_NO?.value}`;
                  panDupDtl?.mutate({
                    COMP_CD: authState?.companyID ?? "",
                    PAN_NO: dependentFields?.PAN_NO?.value ?? "",
                  });
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
          <Box sx={{ pl: 2 }}>
            <Typography sx={{ color: "var(--theme-color3)" }} variant="h6">
              {kycDetailsTab?.subtitles?.[1]?.SUB_TITLE_NAME ??
                t("ProofOfAddress")}
            </Typography>
            <Typography
              sx={{
                fontSize: "1.0rem",
                color: "var(--red-tab-error)",
                fontWeight: "bold",
              }}
            >
              {kycDetailsTab?.subtitles?.[1]?.SUB_TITLE_DESC ?? ""}
            </Typography>
          </Box>
          <IconButton onClick={handlePoAExpand}>
            {!isPoAExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>
        <Collapse in={isPoAExpanded}>
          <Grid item>
            <FormWrapper
              ref={KyCPoAFormRef}
              onSubmitHandler={PoASubmitHandler}
              initialValues={{
                ...(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.PERSONAL_DETAIL_KYC_POA ?? {}),
              }}
              displayMode={state?.formmodectx}
              key={
                "poa-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={kyc_proof_of_address_meta_data as MetaDataType}
              formStyle={{}}
              hideHeader={true}
              formState={{
                MessageBox: MessageBox,
                docCD: docCD,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                CATEG_CD: state?.categoryValuectx ?? "",
                CUSTOMER_ID: state?.customerIDctx ?? "",
                CONTACT2_ENABLE: state?.isValidateCustCtx?.ENABLE_CONTACT2,
                REQ_FLAG:
                  state?.isFreshEntryctx || state?.isDraftSavedctx ? "F" : "E",
                state,
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
        <Dialog
          open={dialogOpen}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            style: {
              maxWidth: "55%",
            },
          }}
        >
          <FormWrapper
            key={"kyc-dup-reason-form"}
            metaData={kyc_dup_reason_form as MetaDataType}
            initialValues={{}}
            hideTitleBar={false}
            onSubmitHandler={DupReasonFormubmitHandler}
            formStyle={{
              minHeight: "20vh",
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton
                  onClick={() => handleDialogClose("Clear")}
                  color={"primary"}
                  disabled={isSubmitting}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        </Dialog>
      )}
      {panDupDtlOpen && (
        <Dialog
          open={panDupDtlOpen}
          maxWidth="md"
          PaperProps={{
            style: {
              maxWidth: "100%",
              overflow: "auto",
            },
          }}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setPanDupDtlOpen(false);
            }
          }}
        >
          {panDupDtl?.error && (
            <Alert
              severity="error"
              errorMsg={
                panDupDtl?.error?.error_msg || t("Somethingwenttowrong")
              }
              errorDetail={panDupDtl?.error?.error_detail || ""}
              color="error"
            />
          )}
          <GridWrapper
            key={"PaidFD"}
            finalMetaData={DupPanDetailGridMetaData}
            data={panDupDtl?.data ?? []}
            setData={() => null}
            actions={[
              {
                actionName: "close",
                actionLabel: "Close",
                multiple: undefined,
                rowDoubleClick: false,
                alwaysAvailable: true,
              },
            ]}
            setAction={(data) => {
              if (data?.name === "close") {
                setPanDupDtlOpen(false);
              }
            }}
            loading={panDupDtl?.isLoading || panDupDtl?.isFetching}
          />
        </Dialog>
      )}
    </Grid>
  );
};

export default KYCDetails;
