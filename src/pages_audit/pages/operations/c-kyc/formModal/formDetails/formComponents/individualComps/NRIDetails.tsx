import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Grid, Typography } from "@mui/material";
import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { nri_detail_meta_data } from "../../metadata/individual/nridetails";
import { CkycContext } from "../../../../CkycContext";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import { format } from "date-fns";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";

const NRIDetails = ({ isModal }) => {
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
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { t } = useTranslation();
  const NRIDTLFormRef = useRef<any>("");
  const { authState } = useContext(AuthContext);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const { MessageBox } = usePopupContext();
  const stepStatusRef = useRef<any>("");
  useEffect(() => {
    let refs = [NRIDTLFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "NRI Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = NRIDTLFormRef.current;
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

  const NRIDTLSubmitHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    let formFields = Object.keys(data); // array, get all form-fields-name
    if (data && !hasError) {
      handleUpdateLoader(true);
      stepStatusRef.current = actionFlag;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "F",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      let newData = state?.formDatactx;
      newData["NRI_DTL"] = { ...newData["NRI_DTL"], ...data, ...commonData };
      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
        let tabModifiedCols: any = state?.modifiedFormCols;
        let updatedCols = tabModifiedCols.NRI_DTL
          ? _.uniq([...tabModifiedCols.NRI_DTL, ...formFields])
          : _.uniq([...formFields]);
        tabModifiedCols = {
          ...tabModifiedCols,
          NRI_DTL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      setFormStatus((old) => [...old, true]);

      const commonDataAdded = {
        IsNewRow: Boolean(optional?.customerIDctx)
          ? !Boolean(optional?.req_cd_ctx)
          : !Boolean(
              Object?.keys(state?.retrieveFormDataApiRes?.["NRI_DTL"] ?? {})
                ?.length > 0
            ),
        COMP_CD: !Boolean(optional?.customerIDctx)
          ? authState?.companyID
          : optional?.retrieveFormDataApiRes["PERSONAL_DETAIL"]?.COMP_CD ?? "",
        BRANCH_CD: !Boolean(optional?.customerIDctx)
          ? authState?.user?.branchCode
          : optional?.retrieveFormDataApiRes["PERSONAL_DETAIL"]?.BRANCH_CD ??
            "",
        REQ_CD: state?.req_cd_ctx ?? "",
        REQ_FLAG: Boolean(optional?.customerIDctx) ? "E" : "F",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };

      let req = {
        ...data,
        ...utilFunction.transformDetailsData(
          data,
          optional?.retrieveFormDataApiRes?.["NRI_DTL"] ?? {}
        ),
      };
      if (
        Object?.keys(optional?.retrieveFormDataApiRes?.["NRI_DTL"] ?? {})
          ?.length > 0
      ) {
        if (Object?.keys(req?._OLDROWVALUE)?.length > 0) {
          handleFinalUpdateReq({
            NRI_DTL: { ...req, ...commonDataAdded },
          });
        }
      } else {
        handleFinalUpdateReq({
          NRI_DTL: { ...data, ...commonDataAdded },
        });
      }
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
  const handleSave = (e, btnFlag) => {
    const refs = [
      NRIDTLFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
    ];
    handleSavectx(e, refs);
  };

  const nriDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "NRI Details"
  );

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
            sx={{ color: "var(--theme-color3)", pl: 2, pt: "6px" }}
            variant={"h6"}
          >
            {nriDetailsTab?.subtitles[0]?.SUB_TITLE_NAME ?? t("NRIDetails")}
          </Typography>
        </Grid>
        <Grid container item>
          <Grid item xs={12}>
            <FormWrapper
              ref={NRIDTLFormRef}
              onSubmitHandler={NRIDTLSubmitHandler}
              key={
                "nri-details-form-kyc" +
                state?.retrieveFormDataApiRes["NRI_DTL"] +
                state?.formmodectx
              }
              metaData={nri_detail_meta_data as MetaDataType}
              initialValues={{
                ...(state?.retrieveFormDataApiRes["NRI_DTL"] ?? {}),
                ...(state?.finalUpdatedReq["NRI_DTL"] ?? {}),
              }}
              formState={{ state, MessageBox }}
              displayMode={state?.formmodectx}
              formStyle={{}}
              hideHeader={true}
            />
          </Grid>
        </Grid>
      </Grid>
      <TabNavigate
        handleSave={handleSave}
        displayMode={state?.formmodectx ?? "new"}
        isModal={isModal}
      />
    </Grid>
  );
};

export default NRIDetails;
