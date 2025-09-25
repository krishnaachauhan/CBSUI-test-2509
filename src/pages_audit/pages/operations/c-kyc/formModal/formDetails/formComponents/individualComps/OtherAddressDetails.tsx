import { useContext, useState, useEffect, useMemo, useRef } from "react";
import { Grid, Typography } from "@mui/material";
import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { other_address_meta_data } from "../../metadata/individual/otheraddressdetails";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../../../CkycContext";
import { AuthContext } from "pages_audit/auth";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";

const OtherAddressDetails = ({ isModal }) => {
  const { authState } = useContext(AuthContext);
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
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    handleFinalUpdateReq,
    checkArrFieldLength,
    addArrCommonData,
    handleSaveMultipleRowctx,
    handleButtonDisable,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { MessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const OtherAddDTLFormRef = useRef<any>("");
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const stepStatusRef = useRef<any>("");
  useEffect(() => {
    let refs = [OtherAddDTLFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Other Address"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = OtherAddDTLFormRef.current;
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

  const OtherAddDTLSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    if (!hasError) {
      handleUpdateLoader(true);
      stepStatusRef.current = actionFlag;
      let newData = state?.formDatactx;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "F",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      if (data.OTHER_ADDRESS) {
        let filteredCols: any[] = [];
        filteredCols = Object.keys(data.OTHER_ADDRESS[0]);

        let newFormatOtherAdd = data.OTHER_ADDRESS.map((formRow, i) => {
          let formFields = Object.keys(formRow);
          const formData = _.pick(data.OTHER_ADDRESS[i], formFields);
          return { ...formData, ...commonData };
        });

        newData["OTHER_ADDRESS"] = [...newFormatOtherAdd];
        handleFormDataonSavectx(newData);

        if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
          let tabModifiedCols: any = state?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            OTHER_ADDRESS: [...filteredCols],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
      } else {
        newData["OTHER_ADDRESS"] = [];
        handleFormDataonSavectx(newData);
        if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
          let tabModifiedCols: any = state?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            OTHER_ADDRESS: [],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
      }

      let req = {
        ...utilFunction.transformDetailDataForDML(
          optional?.retrieveFormDataApiRes?.["OTHER_ADDRESS"] ?? [],
          data?.["OTHER_ADDRESS"] ?? [],
          ["SR_CD"]
        ),
      };

      let otherAddReq;
      const reqCd = optional?.req_cd_ctx;
      const customerId = optional?.customerIDctx;
      if (!reqCd && !customerId) {
        otherAddReq =
          data?.["OTHER_ADDRESS"]?.map((row) => {
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
        otherAddReq = [
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
        otherAddReq = {
          DETAILS_DATA: {
            ...req,
          },
          IsNewRow: false,
          COMP_CD:
            optional?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.COMP_CD ?? "",
          BRANCH_CD:
            optional?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.BRANCH_CD ?? "",
          REQ_FLAG: Boolean(optional?.customerIDctx) ? "E" : "F",
          REQ_CD: reqCd ?? "",
          CUSTOMER_ID: customerId ?? "",
          IS_FROM_OTH_ADD: reqCd ? "N" : "Y",
        };
      }

      const commonDataAdd = await addArrCommonData(
        otherAddReq,
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
        handleSaveMultipleRowctx(data ?? []);
        handleFinalUpdateReq({
          OTHER_ADDRESS: commonDataAdd,
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
      OtherAddDTLFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
    ];
    handleSavectx(e, refs);
  };

  const otherAddressTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "Other Address"
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
            {otherAddressTab?.subtitles[0]?.SUB_TITLE_NAME ?? t("OtherAddress")}
          </Typography>
        </Grid>
        <Grid item>
          <FormWrapper
            ref={OtherAddDTLFormRef}
            onSubmitHandler={OtherAddDTLSubmitHandler}
            initialValues={{
              OTHER_ADDRESS:
                state?.multipleRows?.OTHER_ADDRESS?.length > 0
                  ? state?.multipleRows?.OTHER_ADDRESS
                  : [],
            }}
            displayMode={state?.formmodectx}
            key={
              "other-address-form-kyc" +
              state?.retrieveFormDataApiRes["OTHER_ADDRESS"] +
              state?.formmodectx
            }
            metaData={other_address_meta_data as MetaDataType}
            formState={{
              MessageBox: MessageBox,
              docCD: docCD,
              handleButtonDisable,
              state,
            }}
            formStyle={{}}
            hideHeader={true}
          />
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

export default OtherAddressDetails;
