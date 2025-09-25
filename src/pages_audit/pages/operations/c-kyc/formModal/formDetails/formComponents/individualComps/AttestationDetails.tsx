import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog, Grid, Typography } from "@mui/material";
import {
  attest_history_meta_data,
  attestation_detail_meta_data,
} from "../../metadata/individual/attestationdetails";
import { CkycContext } from "../../../../CkycContext";
import { useTranslation } from "react-i18next";
import * as API from "../../../../api";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import {
  utilFunction,
  Alert,
  GridWrapper,
  GridMetaDataType,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  queryClient,
  GradientButton,
} from "@acuteinfo/common-base";
import { format, isValid } from "date-fns";
import i18n from "components/multiLanguage/languagesConfiguration";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";
const actions = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const AttestationDetails = ({
  onFormClose,
  onUpdateForm,
  headerFormRef,
  isModal,
}) => {
  const [historyDialog, setHistoryDialog] = useState(false);
  const {
    state,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    handleReqCDctx,
    handleFormModalClosectx,
    toNextTab,
    toPrevTab,
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    handleUpdatectx,
    mergePersonalDetailsInUpdatedReq,
    handleFinalUpdateReq,
    mergeOtherDtlFn,
    deepRemoveKeysIfExist,
    deepUpdateKeys,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const AttestationDTLFormRef = useRef<any>("");
  const updReqRef = useRef<any>(null);
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const stepStatusRef = useRef<any>("");
  const onCloseSearchDialog = () => {
    setHistoryDialog(false);
  };

  useEffect(() => {
    let refs = [AttestationDTLFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Attestation Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = AttestationDTLFormRef.current;
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
            toPrevTab();
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

  const {
    data: historyData,
    isError: isHistoryDataError,
    isLoading: isHistoryDataLoading,
    error,
    refetch: historyDataRefetch,
  } = useQuery<any, any>(["getAttestHistory", state?.customerIDctx], () =>
    API.getAttestHistory({
      COMP_CD: authState?.companyID ?? "",
      CUSTOMER_ID: state?.customerIDctx,
    })
  );

  useEffect(() => {
    updReqRef.current = state;
  }, [state, state?.updatedReq]);

  const AttestationDTLSubmitHandler = async (
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
      const commonDataAdded = {
        ...data,
        IsNewRow: true,
        COMP_CD: !Boolean(optional?.customerIDctx)
          ? authState?.companyID
          : optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.COMP_CD ??
            "",
        BRANCH_CD: !Boolean(optional?.customerIDctx)
          ? authState?.user?.branchCode
          : optional?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.BRANCH_CD ??
            "",
        REQ_FLAG: Boolean(optional?.customerIDctx) ? "E" : "F",
        CONFIRMED: "N",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };

      handleFinalUpdateReq({
        ATTESTATION_DTL: commonDataAdded,
      });

      handleUpdateLoader(true);

      stepStatusRef.current = actionFlag;
      let formFields = Object.keys(data); // array, get all form-fields-name
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "F",
        CONFIRMED: "N",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      let newData = state?.formDatactx;
      newData["ATTESTATION_DTL"] = {
        ...newData["ATTESTATION_DTL"],
        ...data,
        ...commonData,
      };
      handleFormDataonSavectx(newData);
      handleStepStatusctx({
        status: "completed",
        coltabvalue: state?.colTabValuectx,
      });
      if (!state?.isFreshEntryctx && !state?.isDraftSavedctx) {
        let tabModifiedCols: any = state?.modifiedFormCols;
        let updatedCols = tabModifiedCols.ATTESTATION_DTL
          ? _.uniq([...tabModifiedCols.ATTESTATION_DTL, ...formFields])
          : _.uniq([...formFields]);
        tabModifiedCols = {
          ...tabModifiedCols,
          ATTESTATION_DTL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);

        // handleUpdateLoader(false);
        // setFormStatus((old) => [...old, true]);
      } else if (state?.isFreshEntryctx || state?.isDraftSavedctx) {
        let submittedDoc = state?.formDatactx["DOC_MST"]?.["doc_mst_payload"];
        if (Array.isArray(submittedDoc)) {
          submittedDoc = submittedDoc?.map((docRow) => {
            return docRow?.TEMPLATE_CD ?? "";
          });
          submittedDoc = submittedDoc.toString();
        }
        const { updated_tab_format, update_type } = await handleUpdatectx({
          COMP_CD: authState?.companyID ?? "",
        });

        const updatedMergedReq = await mergePersonalDetailsInUpdatedReq(
          updReqRef.current?.updatedReq
        );

        await handleFinalUpdateReq(updatedMergedReq);

        const updatedMergedOtherDtlReq = await mergeOtherDtlFn(
          updReqRef.current?.updatedOtherDtlReq
        );

        await handleFinalUpdateReq(updatedMergedOtherDtlReq);

        delete updatedMergedReq?.PERSONAL_DETAIL?._OLDROWVALUE;
        delete updatedMergedReq?.PERSONAL_DETAIL?._UPDATEDCOLUMNS;

        // handleUpdateLoader(false);
        // setFormStatus((old) => [...old, true]);
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

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getAttestData"]);
    };
  }, []);

  const attestationDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "Attestation Details"
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
          item
          container
          direction={"row"}
          style={{ justifyContent: "space-between" }}
        >
          <Typography
            sx={{ color: "var(--theme-color3)", pl: 2, pt: "6px" }}
            variant={"h6"}
          >
            {attestationDetailsTab?.subtitles[0]?.SUB_TITLE_NAME ??
              t("AttestationDetails")}
          </Typography>
          {!state?.isFreshEntryctx && !state?.isDraftSavedctx && (
            <GradientButton
              onClick={() => {
                if (!isHistoryDataLoading && historyData) {
                  setHistoryDialog(true);
                }
              }}
              color="primary"
            >
              {t("History")}
            </GradientButton>
          )}
        </Grid>
        <Grid container item>
          <Grid item xs={12}>
            <FormWrapper
              ref={AttestationDTLFormRef}
              onSubmitHandler={AttestationDTLSubmitHandler}
              initialValues={
                state?.formmodectx !== "view"
                  ? {
                      ...state?.attestatioDtl,
                      ...state?.finalUpdatedReq?.ATTESTATION_DTL,
                      RISK_CATEG: state?.attestatioDtl?.RISK_CATEG
                        ? state?.attestatioDtl?.RISK_CATEG
                        : state?.finalUpdatedReq?.ATTESTATION_DTL?.RISK_CATEG,
                    }
                  : {}
              }
              displayMode={state?.formmodectx}
              key={
                "att-details-form-kyc" +
                state?.retrieveFormDataApiRes["ATTESTATION_DTL"] +
                state?.formmodectx
              }
              metaData={attestation_detail_meta_data as MetaDataType}
              formStyle={{}}
              formState={{ state }}
              hideHeader={true}
            />
          </Grid>
        </Grid>
      </Grid>
      <TabNavigate
        handleSave={onUpdateForm}
        displayMode={state?.formmodectx ?? "new"}
        isModal={isModal}
      />
      {historyDialog && (
        <AttestHistory
          open={historyDialog}
          onClose={onCloseSearchDialog}
          data={historyData}
          isLoading={isHistoryDataLoading}
        />
      )}
    </Grid>
  );
};

const AttestHistory = ({ open, onClose, isLoading, data }) => {
  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      onClose();
    }
  }, []);
  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{
        style: {
          minWidth: "70%",
          width: "80%",
        },
      }}
    >
      <GridWrapper
        key={`AttestHistoryGrid`}
        finalMetaData={attest_history_meta_data as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading}
        actions={actions}
        setAction={setCurrentAction}
      />
    </Dialog>
  );
};

export default AttestationDetails;
