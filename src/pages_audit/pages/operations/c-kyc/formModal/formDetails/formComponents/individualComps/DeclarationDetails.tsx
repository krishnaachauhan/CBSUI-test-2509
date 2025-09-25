import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Grid, Typography, IconButton, Collapse } from "@mui/material";
import { format, isValid } from "date-fns";
import { declaration_meta_data } from "../../metadata/individual/declarationdetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../../../CkycContext";
import * as API from "../../../../api";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import { getdocCD } from "components/utilFunction/function";
import {
  Alert,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { ClonedCkycContext } from "../legalComps/ClonedCkycContext";
const DeclarationDetails = ({ headerFormRef, isModal }) => {
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { t } = useTranslation();
  const {
    state,
    handleFromFormModectx,
    onDraftSavectx,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleReqCDctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    handleFormDataonRetrievectx,
    toNextTab,
    toPrevTab,
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    handleFormDataonSavectxNew,
    mergePersonalDetailsInUpdatedReq,
    handleUpdatectx,
    deepRemoveKeysIfExist,
    deepUpdateKeys,
    handleUpdateDocument,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const DeclarationFormRef = useRef<any>("");
  const formFieldsRef = useRef<any>([]); // array, all form-field to compare on update
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const stepStatusRef = useRef<any>("");
  useEffect(() => {
    let refs = [DeclarationFormRef];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Declaration Details"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = DeclarationFormRef.current;
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
            const tabIndex = parseInt(lastActionFlag.split(" ")[1], 10);
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

  const mutation: any = useMutation(API.updateCustomerID, {
    onSuccess: async (data) => {
      CloseMessageBox();
      if (data?.[0]?.REQ_CD) {
        let req_cd = parseInt(data?.[0]?.REQ_CD) ?? "";
        handleReqCDctx(req_cd);
        // handleFromFormModectx({ formmode: "edit", from: "new-draft" });
        onDraftSavectx();
        if (state?.finalUpdatedReq?.DOC_MST)
          delete state?.finalUpdatedReq?.DOC_MST;
        handleUpdateDocument({
          documents: state?.retrieveFormDataApiRes?.DOC_MST ?? [],
        });
        enqueueSnackbar(
          `${t(`SavedAsDraftSuccessfully`, {
            req_cd: parseInt(data?.[0]?.REQ_CD),
          })}`,
          { variant: "success" }
        );
        let payload = {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          REQUEST_CD: (req_cd || state?.req_cd_ctx) ?? "",
          CUSTOMER_ID: state?.customerIDctx ?? "",
          SCREEN_REF: docCD,
        };
        retrieveMutation.mutate(payload);
      } else {
        for (let i = 0; i < data?.length; i++) {
          if (data[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data[i]?.O_MESSAGE,
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              setFormStatus((old) => [...old, false]);
              handleUpdateLoader(false);
            }
          }
        }
      }
    },
    onError: (error: any) => {
      CloseMessageBox();
      setFormStatus((old) => [...old, false]);
      handleUpdateLoader(false);
    },
  });

  // get customer form details
  const retrieveMutation: any = useMutation(API.getCustomerDetailsonEdit, {
    onSuccess: (data) => {
      handleFormDataonRetrievectx(data[0]);
      handleFormDataonSavectx({});
      handleModifiedColsctx({});
      setFormStatus((old) => [...old, true]);
      handleUpdateLoader(false);
      toNextTab();
    },
    onError: (error: any) => {
      setFormStatus((old) => [...old, false]);
      handleUpdateLoader(false);
    },
  });

  const DeclarationSubmitHandler = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError,
    optional
  ) => {
    if (data && !hasError) {
      let event: any = { preventDefault: () => {} };
      const headerData = await headerFormRef?.current?.handleSubmit(
        event,
        "save",
        false,
        state
      );
      if (!Boolean(headerData?.hasError)) {
        handleUpdateLoader(true);
        stepStatusRef.current = actionFlag;
        let formFields = Object.keys(data); // array, get all form-fields-name
        formFieldsRef.current = _.uniq([
          ...formFieldsRef.current,
          ...formFields,
        ]); // array, added distinct all form-field names
        let formData: any = _.pick(data, formFieldsRef.current);
        let newData = state?.formDatactx ?? {};
        newData["PERSONAL_DETAIL"] = {
          ...newData["PERSONAL_DETAIL"],
          ...formData,
        };
        handleFormDataonSavectx(newData);
        if (!state?.isFreshEntryctx || state?.fromctx === "new-draft") {
          let tabModifiedCols: any = state?.modifiedFormCols;
          let updatedCols = tabModifiedCols.PERSONAL_DETAIL
            ? _.uniq([...tabModifiedCols.PERSONAL_DETAIL, ...formFields])
            : _.uniq([...formFields]);
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
        await handleFormDataonSavectxNew({
          PERSONAL_DETAIL_DEC: Boolean(
            Object?.keys(
              state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
            )?.length > 0
          )
            ? req
            : data,
        });

        if (
          !Boolean(state?.req_cd_ctx) &&
          !Boolean(state?.customerIDctx) &&
          Boolean(actionFlag !== "savePre")
        ) {
          const buttonName = await MessageBox({
            messageTitle: "Confirmation",
            message: "DoYouWantToSaveEntryAsDraft",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (buttonName === "Yes") {
            newData["PERSONAL_DETAIL"] = {
              ...newData["PERSONAL_DETAIL"],
              ...headerData?.data,
            };
            const updatedMergedReq = await mergePersonalDetailsInUpdatedReq({
              ...optional?.updatedReq,
              PERSONAL_DETAIL_DEC: req,
            });

            setTimeout(async () => {
              let payload = {
                PERSONAL_DETAIL: {
                  ...updatedMergedReq?.PERSONAL_DETAIL,
                  ...headerData?.data,
                  APPLICATION_TYPE: "Y",
                  REQ_FLAG: "F",
                  CUSTOMER_TYPE: state?.entityTypectx,
                  CONSTITUTION_TYPE: state?.constitutionValuectx,
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  ENT_COMP_CD: authState?.companyID ?? "",
                  ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                  IsNewRow: true,
                },
                DOC_MST: state?.finalUpdatedReq?.DOC_MST ?? [],
                OTHER_DTL:
                  state?.entityTypectx === "C"
                    ? optional?.updatedOtherDtlReq?.COMPANY_INFO
                    : {
                        COMP_CD: authState?.companyID ?? "",
                        BRANCH_CD: authState?.user?.branchCode ?? "",
                        REFERRED_BY_STAFF: "N",
                        BLINDNESS: "N",
                        POLITICALLY_CONNECTED: "N",
                      },
              };
              mutation.mutate({
                reqPara: payload,
                state: optional,
                save_flag: "D",
                authState,
                deepRemoveKeysIfExist,
                deepUpdateKeys,
              });
            }, 0);
          } else if (buttonName === "No") {
            if (optional?.finalUpdatedReq?.DOC_MST)
              delete optional?.finalUpdatedReq?.DOC_MST;
            handleUpdateLoader(false);
            setFormStatus((old) => [...old, true]);
            toNextTab();
          }
        } else {
          setFormStatus((old) => [...old, true]);
        }
      } else {
        handleUpdateLoader(false);
        setFormStatus((old) => [...old, false]);
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
  const handleSave = async (e, btnFlag) => {
    const refs = await Promise.all([
      DeclarationFormRef.current.handleSubmit(
        e,
        btnFlag === "PREVIOUS" ? "savePre" : "save",
        false,
        state
      ),
    ]);
    handleSavectx(e, refs);
  };

  const [isDeclarationExpanded, setIsDeclarationExpanded] = useState(true);
  const handleDeclarationExpand = () => {
    setIsDeclarationExpanded(!isDeclarationExpanded);
  };

  const declarationDetailsTab = state?.tabsApiResctx?.find(
    (tab) => tab.TAB_NAME === "Declaration Details"
  );

  return (
    <Grid container rowGap={3}>
      {mutation.isError ? (
        <Alert
          severity={mutation.error?.severity ?? "error"}
          errorMsg={mutation.error?.error_msg ?? "Something went to wrong.."}
          errorDetail={mutation.error?.error_detail}
          color="error"
        />
      ) : (
        retrieveMutation.isError && (
          <Alert
            severity={retrieveMutation.error?.severity ?? "error"}
            errorMsg={
              retrieveMutation.error?.error_msg ?? "Something went to wrong.."
            }
            errorDetail={retrieveMutation.error?.error_detail}
            color="error"
          />
        )
      )}
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
            {declarationDetailsTab?.subtitles[0]?.SUB_TITLE_NAME ??
              t("DeclarationDetails")}
          </Typography>
          <IconButton onClick={handleDeclarationExpand}>
            {!isDeclarationExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>

        <Collapse in={isDeclarationExpanded}>
          <Grid item>
            <FormWrapper
              ref={DeclarationFormRef}
              onSubmitHandler={DeclarationSubmitHandler}
              initialValues={{
                ...(state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}),
                ...(state?.updatedReq?.PERSONAL_DETAIL_DEC ?? {}),
              }}
              displayMode={state?.formmodectx}
              key={
                "declaration-form-kyc" +
                state?.retrieveFormDataApiRes["PERSONAL_DETAIL"] +
                state?.formmodectx
              }
              metaData={declaration_meta_data as MetaDataType}
              formStyle={{}}
              formState={{ state }}
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
    </Grid>
  );
};

export default DeclarationDetails;
