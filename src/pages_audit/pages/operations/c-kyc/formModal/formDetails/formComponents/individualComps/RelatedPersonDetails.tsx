import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Grid, Typography, Collapse, IconButton, Dialog } from "@mui/material";
import { related_person_detail_data } from "../../metadata/individual/relatedpersondetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../../../CkycContext";
import { AuthContext } from "pages_audit/auth";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import {
  FormWrapper,
  MetaDataType,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { format } from "date-fns";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";
const RelatedPersonDetails = ({ isModal }) => {
  const { t } = useTranslation();
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const {
    state,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    toNextTab,
    toPrevTab,
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    handleFinalUpdateReq,
    addArrCommonData,
    checkArrFieldLength,
    handleSaveMultipleRowctx,
    handleButtonDisable,
    handleAbortSubmit,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const RelPersonFormRef = useRef<any>("");
  const photoSignReqRef = useRef({});
  const [isRelatedPDExpanded, setIsRelatedPDExpanded] = useState(true);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const [openPhotoSign, setOpenPhotoSign] = useState<boolean>(false);
  const stepStatusRef = useRef<any>("");
  const handleRelatedPDExpand = () => {
    setIsRelatedPDExpanded(!isRelatedPDExpanded);
  };
  useEffect(() => {
    let refs = [RelPersonFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Details of Related Person"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = RelPersonFormRef.current;
    }
  }, [tabFormRefs, state?.tabNameList]);

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

  const RelPersonSubmitHandler2 = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    let hasValidationError = false;
    data?.RELATED_PERSON_DTL?.reverse();
    data?.RELATED_PERSON_DTL?.forEach((row, i) => {
      const dlKey = `RELATED_PERSON_DTL[${i}].DRIVING_LICENSE_EXPIRY_DT`;
      if (row.DRIVING_LICENSE_NO && !row.DRIVING_LICENSE_EXPIRY_DT) {
        handleAbortSubmit(true);
        setFieldError({ [dlKey]: "DrivingLicExpDtRequired" });
        hasValidationError = true;
      } else {
        setFieldError({ [dlKey]: "" });
      }
      const passportKey = `RELATED_PERSON_DTL[${i}].PASSPORT_EXPIRY_DT`;
      if (row.PASSPORT_NO && !row.PASSPORT_EXPIRY_DT) {
        handleAbortSubmit(true);
        setFieldError({ [passportKey]: "PassportExpDtRequired" });
        hasValidationError = true;
      } else {
        setFieldError({ [passportKey]: "" });
      }
    });
    if (hasError || hasValidationError) {
      handleUpdateLoader(false);
      handleStepStatusctx({
        status: "error",
        coltabvalue: state?.colTabValuectx,
      });
      setFormStatus((old) => [...old, false]);
      handleAbortSubmit(true);
      return endSubmit(true);
    }

    if (
      {
        ...(optional?.retrieveFormDataApiRes?.PERSONAL_DETAIL ?? {}),
        ...(optional?.updatedReq?.PERSONAL_DETAIL_OD ?? {}),
      }?.LF_NO?.trim() === "M"
    ) {
      const hasActive = data?.RELATED_PERSON_DTL?.some(
        (item) =>
          item?.RELATED_PERSON_TYPE?.trim() === "1" &&
          (item?.ACTIVE === true || item?.ACTIVE === "Y")
      );
      if (!hasActive) {
        handleAbortSubmit(true);
        await MessageBox({
          messageTitle: "HOBranchValidMessageTitle",
          message: `InCaseOfMinorKYCAtleastOneRelatedPersonShouldHaveAsAGuardianOfMinor`,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        handleStepStatusctx({
          status: "error",
          coltabvalue: optional?.colTabValuectx,
        });
        handleCurrFormctx({
          currentFormSubmitted: null,
        });
        setFormStatus((old) => [...old, false]);
        hasValidationError = true;
      } else {
        handleAbortSubmit(false);
      }
    }
    if (!hasError && !hasValidationError) {
      handleUpdateLoader(true);
      stepStatusRef.current = actionFlag;
      let newData = optional?.formDatactx;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "F",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      // "new entry" && "minor customer" && "no row with guardian type"
      if (
        state?.isFreshEntryctx &&
        state?.formDatactx["PERSONAL_DETAIL"]?.LF_NO === "M" &&
        !(
          Array.isArray(data?.RELATED_PERSON_DTL) &&
          data?.RELATED_PERSON_DTL?.filter(
            (row) => row?.RELATED_PERSON_TYPE?.trim() === "1"
          )?.length > 0
        )
      ) {
        handleStepStatusctx({
          status: "error",
          coltabvalue: state?.colTabValuectx,
        });
        let buttonName = await MessageBox({
          messageTitle: "HOBranchValidMessageTitle",
          message: `InCaseOfMinorKYCAtleastOneRelatedPersonShouldHaveAsAGuardianOfMinor`,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        setFormStatus((old) => [...old, false]);
      } else {
        if (data?.RELATED_PERSON_DTL) {
          let filteredCols: any[] = [];
          filteredCols = Object.keys(data?.RELATED_PERSON_DTL[0]);
          let newFormatRelPerDtl = data?.RELATED_PERSON_DTL?.map(
            (formRow, i) => {
              let formFields = Object.keys(formRow);
              const formData = _.pick(data?.RELATED_PERSON_DTL[i], formFields);
              return { ...formData, ...commonData };
            }
          );
          newData["RELATED_PERSON_DTL"] = [...newFormatRelPerDtl];
          handleFormDataonSavectx(newData);
          if (!optional?.isFreshEntryctx && optional?.fromctx !== "new-draft") {
            let tabModifiedCols: any = optional?.modifiedFormCols;
            tabModifiedCols = {
              ...tabModifiedCols,
              RELATED_PERSON_DTL: [...filteredCols],
            };
            handleModifiedColsctx(tabModifiedCols);
          }
        } else {
          newData["RELATED_PERSON_DTL"] = [];
          handleFormDataonSavectx(newData);
          if (!optional?.isFreshEntryctx && optional?.fromctx !== "new-draft") {
            let tabModifiedCols: any = optional?.modifiedFormCols;
            tabModifiedCols = {
              ...tabModifiedCols,
              RELATED_PERSON_DTL: [],
            };
            handleModifiedColsctx(tabModifiedCols);
          }
        }

        let req = {
          ...utilFunction.transformDetailDataForDML(
            optional?.retrieveFormDataApiRes?.["RELATED_PERSON_DTL"] ?? [],
            data?.["RELATED_PERSON_DTL"] ?? [],
            ["SR_CD"]
          ),
        };

        let relatedPersonDtl;
        const reqCd = optional?.req_cd_ctx;
        const customerId = optional?.customerIDctx;
        if (!reqCd && !customerId) {
          relatedPersonDtl =
            data?.["RELATED_PERSON_DTL"]?.map((row) => {
              return {
                ...row,
                IsNewRow: true,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                REQ_FLAG: Boolean(optional?.customerIDctx) ? "E" : "F",
                REQ_CD: reqCd ?? "",
                CUSTOMER_ID: customerId ?? "",
              };
            }) ?? [];
        } else if (reqCd && !customerId) {
          relatedPersonDtl = [
            {
              ...req,
              IsNewRow: false,
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              REQ_FLAG: Boolean(optional?.customerIDctx) ? "E" : "F",
              REQ_CD: reqCd ?? "",
              CUSTOMER_ID: customerId ?? "",
            },
          ];
        } else {
          relatedPersonDtl = {
            DETAILS_DATA: {
              ...req,
            },
            IsNewRow: false,
            COMP_CD:
              optional?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.COMP_CD ?? "",
            BRANCH_CD:
              optional?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.BRANCH_CD ??
              "",
            REQ_FLAG: Boolean(optional?.customerIDctx) ? "E" : "F",
            REQ_CD: reqCd ?? "",
            CUSTOMER_ID: customerId ?? "",
            IS_FROM_OTH_REF: reqCd ? "N" : "Y",
          };
        }

        const commonDataAdd = await addArrCommonData(
          relatedPersonDtl,
          optional,
          reqCd,
          customerId
        );
        const checkLength = await checkArrFieldLength(
          commonDataAdd,
          reqCd,
          customerId
        );

        if (checkLength) {
          handleAbortSubmit(false);
          handleSaveMultipleRowctx(data ?? []);
          handleFinalUpdateReq({
            RELATED_PERSON_DTL: commonDataAdd,
          });
        }
        setFormStatus((old) => [...old, true]);
      }
    }
    endSubmit(true);
  };

  const handleSave = (e, btnFlag) => {
    const refs = [
      RelPersonFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
    ];
    handleSavectx(e, refs);
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getAttestData"]);
    };
  }, []);

  const relatedDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "Details of Related Person"
  );

  const handleSignViewClick = async ({ id, dependentFields }) => {
    const custId =
      dependentFields?.["RELATED_PERSON_DTL.REF_CUST_ID"]?.value ?? "";
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
            {relatedDetailsTab?.subtitles[0]?.SUB_TITLE_NAME ??
              t("DetailsOfRelatedPerson")}
          </Typography>
          <IconButton onClick={handleRelatedPDExpand}>
            {!isRelatedPDExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>
        <Collapse in={isRelatedPDExpanded}>
          <Grid item>
            <FormWrapper
              ref={RelPersonFormRef}
              onSubmitHandler={RelPersonSubmitHandler2}
              initialValues={{
                RELATED_PERSON_DTL:
                  state?.multipleRows?.RELATED_PERSON_DTL?.length > 0
                    ? state?.multipleRows?.RELATED_PERSON_DTL
                    : [],
              }}
              displayMode={state?.formmodectx}
              key={
                "new-form-in-kyc" +
                state?.retrieveFormDataApiRes["RELATED_PERSON_DTL"] +
                state?.formmodectx
              }
              metaData={related_person_detail_data as MetaDataType}
              formStyle={{}}
              formState={{
                MessageBox: MessageBox,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                CATEG_CD: state?.categoryValuectx ?? "",
                CUSTOMER_ID: state?.customerIDctx ?? "",
                REQ_FLAG:
                  state?.isFreshEntryctx || state?.isDraftSavedctx ? "F" : "E",
                RESIDENCE_STATUS:
                  state?.formDatactx["PERSONAL_DETAIL"]?.RESIDENCE_STATUS ?? "",
                LF_NO:
                  {
                    ...(state?.retrieveFormDataApiRes?.PERSONAL_DETAIL ?? {}),
                    ...(state?.updatedReq?.PERSONAL_DETAIL_OD ?? {}),
                  }?.LF_NO ?? "",
                BIRTH_DT:
                  {
                    ...(state?.retrieveFormDataApiRes?.PERSONAL_DETAIL ?? {}),
                    ...(state?.updatedReq?.PERSONAL_DETAIL_OD ?? {}),
                  }?.BIRTH_DT ?? "",
                attestData: state?.attestatioDtl,
                state,
                handleButtonDisable,
              }}
              onFormButtonClickHandel={async (id, dependentFields) =>
                handleSignViewClick({ id, dependentFields })
              }
              hideHeader={true}
            />
          </Grid>
        </Collapse>
      </Grid>
      <TabNavigate
        handleSave={handleSave}
        displayMode={state?.formmodectx ?? "new"}
        isModal={isModal}
      />

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
          />
        </Dialog>
      ) : null}
    </Grid>
  );
};

export default RelatedPersonDetails;
