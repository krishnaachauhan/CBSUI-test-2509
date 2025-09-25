import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Grid, Typography, Collapse, IconButton } from "@mui/material";
import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { other_details_meta_data } from "../../metadata/individual/otherdetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { CkycContext } from "../../../../CkycContext";
import { useTranslation } from "react-i18next";
import { AuthContext } from "pages_audit/auth";
import _ from "lodash";
import { other_details_legal_meta_data } from "../../metadata/legal/legalotherdetails";
import TabNavigate from "../TabNavigate";
import { format } from "date-fns";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";

const OtherDetails = ({ isModal }) => {
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
    handleFormOtherDtlData,
    floatedValue,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { t } = useTranslation();
  const OtherDTLFormRef = useRef<any>("");
  const [isOtherDetailsExpanded, setIsOtherDetailsExpanded] = useState(true);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const { MessageBox } = usePopupContext();
  const stepStatusRef = useRef<any>("");
  const handleOtherDetailsExpand = () => {
    setIsOtherDetailsExpanded(!isOtherDetailsExpanded);
  };
  const otherDtlMetadata =
    state?.entityTypectx === "I"
      ? other_details_meta_data
      : other_details_legal_meta_data;

  useEffect(() => {
    let refs = [OtherDTLFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "More Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = OtherDTLFormRef.current;
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
      } else {
        handleCurrFormctx({
          currentFormSubmitted: null,
        });
        setFormStatus([]);
        handleStepStatusctx({
          status: "error",
          coltabvalue: state?.colTabValuectx,
        });
      }
    }
  }, [formStatus]);

  const OtherDTLSubmitHandler = async (
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
      const formData = _.pick(data, formFields);

      let newData = state?.formDatactx;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "F",
        // REQ_CD: state?.req_cd_ctx,
        // SR_CD: "3",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      newData["OTHER_DTL"] = {
        ...newData["OTHER_DTL"],
        ...formData,
        ...commonData,
      };
      handleFormDataonSavectx(newData);
      if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
        let tabModifiedCols: any = state?.modifiedFormCols;
        let updatedCols = tabModifiedCols.OTHER_DTL
          ? _.uniq([...tabModifiedCols.OTHER_DTL, ...formFields])
          : _.uniq([...formFields]);
        tabModifiedCols = {
          ...tabModifiedCols,
          OTHER_DTL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
      }
      await floatedValue(
        ["WORK_EXP", "THRESHOLD_AMT", "NON_FUNDED_AMT", "FUNDED_AMT"],
        data
      );

      let req = {
        ...data,
        ...utilFunction.transformDetailsData(
          data,
          optional?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {}
        ),
      };
      if (Object?.keys(data)?.length > 0) {
        handleFormOtherDtlData({
          MORE_DTL:
            Object?.keys(optional?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {})
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

  const handleSave = async (e, btnFlag) => {
    const refs = await [
      OtherDTLFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
    ];
    handleSavectx(e, refs);
  };

  const moreDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "More Details"
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
            sx={{ color: "var(--theme-color3)", pl: 2 }}
            variant={"h6"}
          >
            {moreDetailsTab?.subtitles[0]?.SUB_TITLE_NAME ?? t("MoreDetails")}
          </Typography>
          <IconButton onClick={handleOtherDetailsExpand}>
            {!isOtherDetailsExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>
        <Collapse in={isOtherDetailsExpanded}>
          <Grid item>
            <FormWrapper
              ref={OtherDTLFormRef}
              onSubmitHandler={OtherDTLSubmitHandler}
              key={
                "other-details-form-kyc" +
                state?.retrieveFormDataApiRes["OTHER_DTL"] +
                state?.formmodectx
              }
              metaData={otherDtlMetadata as MetaDataType}
              displayMode={state?.formmodectx}
              initialValues={{
                ...(state?.retrieveFormDataApiRes?.["OTHER_DTL"] ?? {}),
                ...(state?.updatedOtherDtlReq?.["MORE_DTL"] ?? {}),
              }}
              formStyle={{}}
              hideHeader={true}
              formState={{
                MessageBox: MessageBox,
                WORKING_DATE: authState?.workingDate,
                state,
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
    </Grid>
  );
};

export default OtherDetails;
