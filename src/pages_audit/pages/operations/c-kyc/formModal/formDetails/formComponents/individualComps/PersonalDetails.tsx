import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Grid, Typography, IconButton, Collapse } from "@mui/material";
import {
  extractMetaData,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import {
  personal_detail_prefix_data,
  personal_other_detail_meta_data,
} from "../../metadata/individual/personaldetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../../../CkycContext";
import _, { isEmpty } from "lodash";
import { AuthContext } from "pages_audit/auth";
import * as API from "../../../../api";
import { useMutation } from "react-query";
import { SearchListdialog } from "../legalComps/EntityDetails";
import TabNavigate from "../TabNavigate";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { getFormattedDate } from "components/agGridTable/utils/helper";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";
const PersonalDetails = ({ isModal }) => {
  const { t } = useTranslation();
  const PDFormRef = useRef<any>("");
  const PODFormRef = useRef<any>("");
  const acctNmRef = useRef("");
  const stepStatusRef = useRef<any>("");
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPDExpanded, setIsPDExpanded] = useState(true);
  const [isOtherPDExpanded, setIsOtherPDExpanded] = useState(true);
  const [formStatus, setFormStatus] = useState<any[]>([]);

  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const {
    state,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    handleApiRes,
    handleAccTypeVal,
    handleMinorMajorVal,
    toNextTab,
    handleFormDataonSavectxNew,
    handlepersonalOtherDtlLFno,
    handleColTabChangectx,
    tabFormRefs,
    handleUpdateLoader,
    handleUpdateDocument,
    handleFinalUpdateReq,
    handleButtonDisable,
    toPrevTab,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const personalDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "Personal Details"
  );

  const mutation: any = useMutation(API.getRetrieveData);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Personal Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = [PDFormRef.current, PODFormRef.current];
    }
  }, [tabFormRefs, state?.tabNameList]);

  useEffect(() => {
    handleCurrFormctx({
      currentFormRefctx: [PDFormRef, PODFormRef],
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    if (
      state?.currentFormctx?.currentFormRefctx?.length > 0 &&
      formStatus.length > 0 &&
      state?.currentFormctx.currentFormRefctx.length === formStatus.length
    ) {
      const allSubmitted = formStatus.every(Boolean);
      if (allSubmitted) {
        const lastActionFlag = stepStatusRef.current;
        handleStepStatusctx({
          status: "completed",
          coltabvalue: state?.colTabValuectx,
        });
        if (lastActionFlag?.startsWith("TabChange")) {
          const tabIndex = parseInt(lastActionFlag?.split(" ")[1], 10);
          handleColTabChangectx(tabIndex);
        } else if (
          !state?.customerIDctx?.trim() &&
          !lastActionFlag?.startsWith("UpdateData")
        ) {
          lastActionFlag?.startsWith("savePre") ? toPrevTab() : toNextTab();
        }
        handleUpdateLoader(false);
        handleCurrFormctx({ currentFormSubmitted: true });
      } else {
        handleUpdateLoader(false);
        handleCurrFormctx({ currentFormSubmitted: false });
      }
      setFormStatus([]);
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

  const handlePDExpand = () => {
    setIsPDExpanded(!isPDExpanded);
  };
  const handleOtherPDExpand = () => {
    setIsOtherPDExpanded(!isOtherPDExpanded);
  };
  const onCloseSearchDialog = () => {
    setDialogOpen(false);
  };

  const onSubmitPDHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    if (!data || hasError) {
      handleUpdateLoader(false);
      handleStepStatusctx({
        status: "error",
        coltabvalue: state?.colTabValuectx,
      });
      setFormStatus((old) => [...old, false]);
      return endSubmit(true);
    }
    handleUpdateLoader(true);
    stepStatusRef.current = actionFlag;
    let formFields = Object.keys(data); // array, get all form-fields-name
    formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
    const formData = _.pick(data, formFieldsRef.current);
    const commonData = {
      IsNewRow: !state?.req_cd_ctx ? true : false,
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      REQ_FLAG: state?.customerIDctx ? "E" : "F",
      REQ_CD: state?.req_cd_ctx ?? "",
    };
    let newData = state?.formDatactx;
    newData["PERSONAL_DETAIL"] = {
      ...newData["PERSONAL_DETAIL"],
      ...formData,
      ...commonData,
    };
    handleFormDataonSavectx(newData);
    if (!state?.isFreshEntryctx || state?.fromctx === "new-draft") {
      const prevCols = state?.modifiedFormCols?.PERSONAL_DETAIL ?? [];
      const updatedCols = _.uniq([...prevCols, ...formFieldsRef.current]);
      handleModifiedColsctx({
        ...state?.modifiedFormCols,
        PERSONAL_DETAIL: updatedCols,
      });
    }
    let req = {
      ...data,
      ...utilFunction.transformDetailsData(
        data,
        optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
      ),
    };
    handleFormDataonSavectxNew({
      PERSONAL_DETAIL_PD: Boolean(
        Object?.keys(
          optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
        )?.length > 0
      )
        ? req
        : data,
    });
    setFormStatus((old) => [...old, true]);
    endSubmit(true);
  };
  const onSubmitPODHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    if (!data || hasError) {
      handleUpdateLoader(false);
      handleStepStatusctx({
        status: "error",
        coltabvalue: state?.colTabValuectx,
      });
      setFormStatus((old) => [...old, false]);
      return endSubmit(true);
    }
    optional.attestatioDtl.RISK_CATEG = data?.RISK_CATEG;
    handleUpdateLoader(true);
    let formFields = Object.keys(data); // array, get all form-fields-name
    formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]); // array, added distinct all form-field names
    let formData: any = _.pick(data, formFieldsRef.current);
    let newData = state?.formDatactx;
    newData["PERSONAL_DETAIL"] = {
      ...newData["PERSONAL_DETAIL"],
      ...formData,
      IsNewRow: true,
    };
    handleFormDataonSavectx(newData);
    if (!state?.isFreshEntryctx || state?.fromctx === "new-draft") {
      const prevCols = state?.modifiedFormCols?.PERSONAL_DETAIL ?? [];
      const updatedCols = _.uniq([...prevCols, ...formFieldsRef.current]);
      handleModifiedColsctx({
        ...state?.modifiedFormCols,
        PERSONAL_DETAIL: updatedCols,
      });
    }
    let req = {
      ...data,
      ...utilFunction.transformDetailsData(
        data,
        optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
      ),
    };
    handleFormDataonSavectxNew({
      PERSONAL_DETAIL_OD: Boolean(
        Object?.keys(
          optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
        )?.length > 0
      )
        ? req
        : data,
    });
    setFormStatus((old) => [...old, true]);
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
      PODFormRef.current.handleSubmit(
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
            {personalDetailsTab?.subtitles[0].SUB_TITLE_NAME ??
              t("PersonalDetails")}
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
                ...(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.PERSONAL_DETAIL_PD ?? {}),
                ...(state?.customerIDctx === "" && {
                  MEM_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
                  MEM_COMP_CD: authState?.baseCompanyID ?? "",
                }),
              }}
              key={
                "pd-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={personal_detail_prefix_data(state) as MetaDataType}
              formState={{
                state,
                docCD,
                MessageBox,
                acctDtlReqPara: {
                  MEM_ACCT_CD: {
                    ACCT_TYPE: "MEM_ACCT_TYPE",
                    BRANCH_CD: "MEM_BRANCH_CD",
                    SCREEN_REF: docCD ?? "",
                  },
                },
                handleButtonDisable,
              }}
              formStyle={{}}
              hideHeader={true}
              displayMode={state?.formmodectx}
              controlsAtBottom={false}
              onFormButtonClickHandel={(fieldID, dependentFields) => {
                if (
                  fieldID === "SEARCH_BTN" &&
                  dependentFields?.ACCT_NM?.value
                ) {
                  if (dependentFields?.ACCT_NM?.value.trim().length > 0) {
                    if (
                      acctNmRef.current !==
                      dependentFields?.ACCT_NM?.value.trim()
                    ) {
                      acctNmRef.current =
                        dependentFields?.ACCT_NM?.value.trim();
                      let data = {
                        COMP_CD: authState?.companyID ?? "",
                        BRANCH_CD: authState?.user?.branchCode ?? "",
                        A_PARA: [
                          {
                            COL_NM: "ACCT_NM",
                            COL_VAL: dependentFields?.ACCT_NM?.value.trim(),
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
            {personalDetailsTab?.subtitles[1]?.SUB_TITLE_NAME ??
              t("OtherPersonalDetails")}
          </Typography>
          <IconButton onClick={handleOtherPDExpand}>
            {!isOtherPDExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>
        <Collapse in={isOtherPDExpanded}>
          <Grid item>
            <FormWrapper
              ref={PODFormRef}
              key={
                "pod-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={
                extractMetaData(
                  personal_other_detail_meta_data,
                  state?.formmodectx
                ) as MetaDataType
              }
              initialValues={{
                ...(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.PERSONAL_DETAIL_OD ?? {}),
              }}
              displayMode={state?.formmodectx}
              formStyle={{}}
              onFormDataChange={(_, field) => {
                handlepersonalOtherDtlLFno(field?.value);
              }}
              formState={{
                CustomerType: state?.entityTypectx,
                handleAccTypeVal: handleAccTypeVal,
                handleMinorMajorVal: handleMinorMajorVal,
                WORKING_DATE: authState?.workingDate,
                MessageBox,
                CloseMessageBox,
                state,
                handleButtonDisable,
              }}
              hideHeader={true}
              onSubmitHandler={onSubmitPODHandler}
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
    </Grid>
  );
};

export default PersonalDetails;
