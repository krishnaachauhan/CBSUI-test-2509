import * as React from "react";
import { useState, useContext, useEffect } from "react";
import {
  Typography,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import PersonalDetails from "./formDetails/formComponents/individualComps/PersonalDetails";
import KYCDetails from "./formDetails/KYCDetails";
import DeclarationDetails from "./formDetails/formComponents/individualComps/DeclarationDetails";
import RelatedPersonDetails from "./formDetails/formComponents/individualComps/RelatedPersonDetails";
import OtherDetails from "./formDetails/formComponents/individualComps/OtherDetails";
import OtherAddressDetails from "./formDetails/formComponents/individualComps/OtherAddressDetails";
import NRIDetails from "./formDetails/formComponents/individualComps/NRIDetails";
import AttestationDetails from "./formDetails/formComponents/individualComps/AttestationDetails";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../CkycContext";
import TabStepper from "./TabStepper";
import EntityDetails from "./formDetails/formComponents/legalComps/EntityDetails";
import ControllingPersonDTL from "./formDetails/formComponents/legalComps/ControllingPersonDTL";
import MenuIcon from "@mui/icons-material/Menu";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Alert,
  RemarksAPIWrapper,
  GradientButton,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";

import PhotoSign from "./formDetails/formComponents/individualComps/PhotoSign";
import { useDialogStyles } from "./style";
import { getdocCD } from "components/utilFunction/function";
import { enqueueSnackbar } from "notistack";
import HeaderFormNew from "./headerForm/HeaderFormNew";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
import PhotoSignatureCpyDialog from "./formDetails/formComponents/individualComps/PhotoSignCopyDialog";
import TDSSExemptionComp from "../TDSExemption2/TDSExemptionComp";
import i18n from "components/multiLanguage/languagesConfiguration";
import _ from "lodash";
import KycDocuments from "./NewDocumentTab";
import { ClonedCkycContext } from "./formDetails/formComponents/legalComps/ClonedCkycContext";
export const CustomTabLabel = ({
  IconName,
  isSidebarExpanded,
  tabLabel,
  subtext,
}) => {
  const ApiIcon = Icons[IconName] ?? Icons["HowToReg"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textTransform: "capitalize",
      }}
    >
      <div className="toggle_icon_container">
        <ApiIcon fontSize="large" />
      </div>
      {
        <div
          className="toggle_text_container"
          style={{
            display: isSidebarExpanded ? "block" : "none",
            transition: "width 0.4s, display 0.4s",
            transitionDelay: "0.5s",
          }}
        >
          <h4 style={{ margin: 0 }}>{tabLabel}</h4>
          {subtext.toString().length > 0 && (
            <p style={{ margin: 0 }}>{subtext}</p>
          )}
        </div>
      }
    </div>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other }: any = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Grid item xs sx={{ p: 1 }}>
          {children}
        </Grid>
      )}
    </div>
  );
}

interface FormModalProps {
  onClose: any;
  formmode: any;
  from: any;
  setRetFormData?: any;
  rowData?: any;
  isModal?: any;
  docCDExternal?: any;
}

export default function FormModal({
  onClose,
  formmode,
  from,
  setRetFormData,
  rowData,
  isModal,
  docCDExternal,
}: FormModalProps) {
  const {
    state,
    handleFormModalOpenctx,
    handleFormModalClosectx,
    handleColTabChangectx,
    handleFormDataonRetrievectx,
    handleFormModalOpenOnEditctx,
    onFinalUpdatectx,
    handleCurrFormctx,
    handleUpdatectx,
    handleFromFormModectx,
    handleModifiedColsctx,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleEnableContactStDFields,
    tabFormRefs,
    handleUpdCustRetData,
    mergePersonalDetailsInUpdatedReq,
    handleFormDataonSavectxNew,
    handleFinalUpdateReq,
    mergeOtherDtlFn,
    handleUpdateLoader,
    deepRemoveKeysIfExist,
    deepUpdateKeys,
    handleMinorMajorVal,
    handleSaveSelectedRowctx,
    handleAbortSubmit,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);

  const location: any = useLocation();
  const selectedRow = isModal
    ? rowData
    : location?.state?.[0]?.data
    ? location?.state?.[0]?.data
    : location?.state;
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const classes = useDialogStyles();
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const docCD = docCDExternal
    ? docCDExternal
    : getdocCD(location.pathname, authState?.menulistdata);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [formModalMode, setFormModalMode] = useState<any>(formmode);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const headerFormRef = React.useRef<any>(null);
  const stateRef = React.useRef<any>(state);
  const formFieldsRef = React.useRef<any>([]);
  const updReqRef = React.useRef<any>(null);
  stateRef.current = state;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const closeForm = () => {
    handleFormModalClosectx();
    onClose();
  };

  // get customer form details
  const mutation: any = useMutation(API.getCustomerDetailsonEdit, {
    onSuccess: (data) => {
      handleFormDataonRetrievectx(data[0]);
      handleMinorMajorVal(data[0]?.PERSONAL_DETAIL?.ACCT_TYPE ?? "");
    },
    onError: (error: any) => {},
  });
  useEffect(() => {
    if (mutation.isLoading || mutation.isFetching) {
      handleUpdateLoader(true);
    } else {
      handleUpdateLoader(false);
    }
  }, [mutation.isLoading, mutation.isFetching]);

  // modify customer
  const modifyCustMutation: any = useMutation(API.updateCustomerID, {
    onSuccess: async (data: any) => {
      const reqCD = Boolean(data?.[0]?.REQ_CD && parseInt(data?.[0]?.REQ_CD))
        ? parseInt(data?.[0]?.REQ_CD)
        : Boolean(state?.req_cd_ctx && parseInt(state?.req_cd_ctx))
        ? parseInt(state?.req_cd_ctx)
        : "";
      handleUpdateLoader(false);
      CloseMessageBox();
      handleCurrFormctx({
        currentFormSubmitted: null,
      });
      onFinalUpdatectx(false);
      handleModifiedColsctx({});
      handleFormDataonSavectx({});
      const buttonName = await MessageBox({
        messageTitle: "SUCCESS",
        message: `${t("DataUpdatedSuccessfully")} Request ID - ${reqCD}`,
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });
      if (buttonName === "Ok") {
        handleStepStatusctx({ reset: true });
        closeForm();
        handleUpdCustRetData([]);
        setRetFormData({});
        CloseMessageBox();
        queryClient.invalidateQueries({
          queryKey: ["ckyc", "getPendingTabData"],
        });
      }
    },
    onError: (error: any) => {
      CloseMessageBox();
      handleUpdateLoader(false);
      handleCurrFormctx({
        currentFormSubmitted: null,
      });
      onFinalUpdatectx(false);
    },
  });

  //validate customer Id on edit entry
  const validateCustIdMutation = useMutation(
    API.validateCustIdonEdit,

    {
      onError: (error: any) => {
        let errorMsg = t("Unknownerroroccured");
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
        CloseMessageBox();
      },
      onSuccess: (data) => {
        for (const obj of data ?? []) {
          if (obj?.O_STATUS === "999") {
            MessageBox({
              messageTitle: obj?.O_MSG_TITLE?.length
                ? obj?.O_MSG_TITLE
                : "ValidationFailed",
              message: obj?.O_MESSAGE ?? "",
              icon: "ERROR",
            });
          } else if (obj?.O_STATUS === "9") {
            MessageBox({
              messageTitle: obj?.O_MSG_TITLE?.length
                ? obj?.O_MSG_TITLE
                : "Alert",
              message: obj?.O_MESSAGE ?? "",
              icon: "WARNING",
            });
          } else if (obj?.O_STATUS === "99") {
            const buttonName = MessageBox({
              messageTitle: obj?.O_MSG_TITLE?.length
                ? obj?.O_MSG_TITLE
                : "Confirmation",
              message: obj?.O_MESSAGE ?? "",
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              icon: "CONFIRM",
            });

            if (buttonName === "No") {
              break;
            }
          } else if (obj?.O_STATUS === "0") {
            handleSaveSelectedRowctx({ ...selectedRow });
            handleFromFormModectx({
              formmode:
                selectedRow?.CONFIRMED === "P" &&
                (selectedRow?.UPD_TAB_FLAG_NM === "M" ||
                  selectedRow?.UPD_TAB_FLAG_NM === "A")
                  ? "edit"
                  : selectedRow?.CONFIRMED === "Y" ||
                    selectedRow?.CONFIRMED === "R" ||
                    selectedRow?.CONFIRMED === "M"
                  ? "edit"
                  : "view",
              from,
            });
            setFormModalMode("edit");
            handleEnableContactStDFields(obj);

            return data;
          }
        }
      },
    }
  );

  const confirmMutation: any = useMutation(API.ConfirmPendingCustomers, {
    onSuccess: async (data, variables) => {
      setIsOpen(false);
      const confirmed: string = variables?.CONFIRMED;
      const customerID = Boolean(
        data?.[0]?.CUSTOMER_ID && parseInt(data?.[0]?.CUSTOMER_ID)
      )
        ? parseInt(data?.[0]?.CUSTOMER_ID)
        : Boolean(state?.customerIDctx && parseInt(state?.customerIDctx))
        ? parseInt(state?.customerIDctx)
        : "";

      const reqId = Boolean(
        variables?.REQUEST_CD && parseInt(variables?.REQUEST_CD)
      )
        ? parseInt(variables?.REQUEST_CD)
        : Boolean(state?.req_cd_ctx && parseInt(state?.req_cd_ctx))
        ? parseInt(state?.req_cd_ctx)
        : "";
      const message =
        confirmed === "Y"
          ? `${t("ConfirmedSuccessfully")} Customer ID - ${customerID}`
          : confirmed === "M"
          ? `${t("SentForModificationSuccessfully")} Request ID - ${reqId}`
          : confirmed === "R"
          ? `${t("RejectedSuccessfully")} Request ID - ${reqId}`
          : "No Message";
      const buttonName = await MessageBox({
        messageTitle: "SUCCESS",
        message: message,
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });
      if (buttonName === "Ok") {
        closeForm();
        CloseMessageBox();
        queryClient.invalidateQueries({
          queryKey: ["ckyc", "getConfirmPendingData"],
        });
      }
    },
    onError: (error: any) => {
      setIsOpen(false);
      setConfirmAction(null);
    },
  });

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({
        queryKey: ["ckyc", "getPendingTabData"],
      });
    };
  }, []);

  useEffect(() => {
    handleFromFormModectx({
      formmode: formmode,
      from,
    });
    if (selectedRow) {
      if (formmode) {
        if (formmode == "new") {
          handleFormModalOpenctx(selectedRow?.entityType);
        } else {
          let data = isModal ? [{ data: rowData }] : location?.state;

          handleFormModalOpenOnEditctx(data);
          let payload = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            REQUEST_CD: selectedRow?.REQUEST_ID ?? "",
            CUSTOMER_ID: selectedRow?.CUSTOMER_ID ?? "",
            SCREEN_REF: docCD,
          };
          mutation.mutate(payload);
        }
      }
    }
  }, []);

  const getIndividualTabComp = (tabName: string) => {
    switch (tabName) {
      case "Personal Details":
        return <PersonalDetails isModal={isModal} />;

      case "KYC Details":
        return <KYCDetails isModal={isModal} />;

      case "Declaration Details":
        return (
          <DeclarationDetails headerFormRef={headerFormRef} isModal={isModal} />
        );

      case "KYC Document Upload":
        return (
          <KycDocuments
            isModal={isModal}
            formMode={
              Boolean(state?.customerIDctx)
                ? (state?.selectedRow?.CONFIRMED === "P" &&
                    state?.selectedRow?.UPD_TAB_FLAG_NM === "D") ||
                  state?.selectedRow?.CONFIRMED === "Y" ||
                  state?.selectedRow?.CONFIRMED === "R"
                  ? "edit"
                  : "view"
                : formModalMode
            }
          />
        );

      case "Photo & Signature Upload":
        return <PhotoSign isModal={isModal} />;

      case "Details of Related Person":
        return <RelatedPersonDetails isModal={isModal} />;

      case "More Details":
        return <OtherDetails isModal={isModal} />;

      case "Other Address":
        return <OtherAddressDetails isModal={isModal} />;

      case "NRI Details":
        return <NRIDetails isModal={isModal} />;

      case "Attestation Details":
        return (
          <AttestationDetails
            onFormClose={onClose}
            onUpdateForm={handleUpdateButtonClick}
            headerFormRef={headerFormRef}
            isModal={isModal}
          />
        );

      default:
        return <p>Not Found - {tabName}</p>;
    }
  };
  const getLegalTabComp = (tabName: string) => {
    switch (tabName) {
      case "Entity Details":
        return <EntityDetails isModal={isModal} />;

      case "KYC Details":
        return <KYCDetails isModal={isModal} />;

      case "Declaration Details":
        return (
          <DeclarationDetails headerFormRef={headerFormRef} isModal={isModal} />
        );

      case "KYC Document Upload":
        return (
          <KycDocuments
            isModal={isModal}
            formMode={
              Boolean(state?.customerIDctx)
                ? (state?.selectedRow?.CONFIRMED === "P" &&
                    state?.selectedRow?.UPD_TAB_FLAG_NM === "D") ||
                  state?.selectedRow?.CONFIRMED === "Y" ||
                  state?.selectedRow?.CONFIRMED === "R"
                  ? "edit"
                  : "view"
                : formModalMode
            }
          />
        );

      case "Photo & Signature Upload":
        return <PhotoSign isModal={isModal} />;

      case "Details of Controlling Persons":
        return <ControllingPersonDTL isModal={isModal} />;

      case "More Details":
        return <OtherDetails isModal={isModal} />;

      case "Other Address":
        return <OtherAddressDetails isModal={isModal} />;

      case "NRI Details":
        return <NRIDetails isModal={isModal} />;

      case "Attestation Details":
        return (
          <AttestationDetails
            onFormClose={onClose}
            onUpdateForm={handleUpdateButtonClick}
            headerFormRef={headerFormRef}
            isModal={isModal}
          />
        );

      default:
        return <p>Not Found - {tabName}</p>;
    }
  };

  const openActionDialog = async (flag: string) => {
    const allTabsViewed = Array.isArray(state?.tabNameList)
      ? state.tabNameList
          .filter((tab) => tab.isVisible)
          .every((tab) => tab.isViewed === true)
      : false;
    if (
      selectedRow?.ALL_TAB_VIEW === "Y" &&
      !allTabsViewed &&
      selectedRow?.REQ_FLAG === "F" &&
      flag === "Y"
    ) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "ViewBeforeConfirm",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
    } else {
      setIsOpen(true);
      setConfirmAction(flag);
    }
  };

  const customerValidate: any = useMutation(API.validateCustData, {
    onSuccess: async (data) => {
      if (data?.length > 0) {
        for (let i = 0; i < data?.length; i++) {
          if (data?.[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[i]?.O_MESSAGE,
              icon: "ERROR",
            });
            handleUpdateLoader(false);
            handleCurrFormctx({
              currentFormSubmitted: null,
            });
          } else if (data?.[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data?.[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });
            if (btnName === "No") {
              handleUpdateLoader(false);
              handleCurrFormctx({
                currentFormSubmitted: null,
              });
              CloseMessageBox();
              break;
            }
          } else if (data?.[i]?.O_STATUS === "9") {
            await MessageBox({
              messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
              message: data?.[i]?.O_MESSAGE,
              icon: "WARNING",
              loadingBtnName: ["Ok"],
            });
          } else if (data?.[i]?.O_STATUS === "0") {
            modifyCustMutation.mutate({
              reqPara: updReqRef.current?.finalUpdatedReq,
              state: updReqRef?.current,
              save_flag:
                Boolean(updReqRef.current?.finalUpdatedReq?.PERSONAL_DETAIL) &&
                Object?.keys(updReqRef.current?.finalUpdatedReq)?.length === 1
                  ? "D"
                  : "F",
              authState,
              deepRemoveKeysIfExist,
              deepUpdateKeys,
            });
          }
        }
      }
    },
    onError: (error: any) => {
      handleCurrFormctx({
        currentFormSubmitted: null,
      });
      handleUpdateLoader(false);
      CloseMessageBox();
    },
  });

  useEffect(() => {
    updReqRef.current = state;
  }, [state, state?.updatedReq]);

  const onUpdateForm = React.useCallback(
    async (e) => {
      const submitData = await headerFormRef?.current?.handleSubmit(
        e,
        "UPD",
        false
      );

      if (!Boolean(submitData?.hasError)) {
        let formFields = Object.keys(submitData?.data ?? {});
        formFieldsRef.current = _.uniq([
          ...formFieldsRef.current,
          ...formFields,
        ]);
        const formData = _.pick(submitData?.data, formFieldsRef.current);
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
          ...submitData?.data,
          ...utilFunction.transformDetailsData(
            submitData?.data,
            state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"] ?? {}
          ),
        };

        const personalDetailHeaderForm =
          Object.keys(state?.retrieveFormDataApiRes?.PERSONAL_DETAIL ?? {})
            .length > 0
            ? req
            : submitData?.data;

        handleFormDataonSavectxNew({
          PERSONAL_DETAIL_HEADER_FORM: personalDetailHeaderForm,
        });

        const patchedUpdatedReq = {
          ...(updReqRef.current?.updatedReq ?? {}),
          PERSONAL_DETAIL_HEADER_FORM: personalDetailHeaderForm,
        };

        const updatedMergedReq = await mergePersonalDetailsInUpdatedReq(
          patchedUpdatedReq
        );

        if (!updatedMergedReq || Object.keys(updatedMergedReq).length === 0) {
          delete updReqRef.current?.finalUpdatedReq?.PERSONAL_DETAIL;
        } else {
          await handleFinalUpdateReq(updatedMergedReq);
        }

        const updatedMergedOtherDtlReq = await mergeOtherDtlFn(
          updReqRef.current?.updatedOtherDtlReq
        );
        if (
          !updatedMergedOtherDtlReq ||
          Object.keys(updatedMergedOtherDtlReq).length === 0
        ) {
          delete updReqRef.current?.finalUpdatedReq?.OTHER_DTL;
        } else {
          await handleFinalUpdateReq(updatedMergedOtherDtlReq);
        }
        setTimeout(async () => {
          if (
            (Object.keys(updReqRef.current?.finalUpdatedReq)?.length === 0 ||
              (Object.keys(updReqRef.current?.finalUpdatedReq)?.length === 1 &&
                Object.keys(updReqRef.current?.finalUpdatedReq || {})[0] ===
                  "ATTESTATION_DTL" &&
                !updReqRef?.current?.isDraftSavedctx)) &&
            !Boolean(updReqRef?.current?.isAbortSubmit)
          ) {
            let buttonName = await MessageBox({
              messageTitle: "Alert",
              message: "YouHaveNotMadeAnyChangesYet",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });
            if (buttonName === "Ok") {
              handleUpdateLoader(false);
              handleCurrFormctx({
                currentFormSubmitted: null,
              });
              onFinalUpdatectx(false);
              handleModifiedColsctx({});
              handleFormDataonSavectx({});
              handleStepStatusctx({ reset: true });
            }
          } else if (
            Object.keys(updReqRef.current?.finalUpdatedReq)?.length > 0
          ) {
            const latestPerDetails = {
              ...(updReqRef.current?.retrieveFormDataApiRes?.PERSONAL_DETAIL ??
                {}),
              ...(updReqRef.current?.updatedReq?.PERSONAL_DETAIL_OD ?? {}),
            };
            const resStatus = {
              ...updReqRef.current?.retrieveFormDataApiRes?.PERSONAL_DETAIL,
              ...updReqRef.current?.updatedReq?.PERSONAL_DETAIL_OD,
            }?.RESIDENCE_STATUS;

            if (latestPerDetails?.LF_NO?.trim() === "M") {
              const relatedPersons =
                updReqRef.current?.multipleRows?.RELATED_PERSON_DTL || [];
              const hasGuardian = relatedPersons.some((item) => {
                return (
                  item?.RELATED_PERSON_TYPE?.trim() === "1" &&
                  (item?.ACTIVE === true || item?.ACTIVE === "Y")
                );
              });

              if (relatedPersons?.length === 0 || !hasGuardian) {
                const btnName = await MessageBox({
                  messageTitle: "HOBranchValidMessageTitle",
                  message:
                    "InCaseOfMinorKYCAtleastOneRelatedPersonShouldHaveAsAGuardianOfMinor",
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (btnName === "Ok") {
                  const tabList = updReqRef.current?.tabNameList || [];
                  const relatedTabIndex = tabList.findIndex(
                    (tab) => tab?.tabName === "Details of Related Person"
                  );
                  handleColTabChangectx(relatedTabIndex);
                  handleAbortSubmit(true);
                  return;
                }
              }
            }
            if (resStatus?.trim() === "02" || resStatus?.trim() === "03") {
              const nriDtl = {
                ...(updReqRef.current?.retrieveFormDataApiRes?.NRI_DTL || {}),
                ...(updReqRef.current?.finalUpdatedReq?.NRI_DTL || {}),
              };

              if (
                nriDtl?.VISA_DETAIL === "" ||
                nriDtl?.VISA_ISSUE_DT === "" ||
                nriDtl?.VISA_EXPIRY_DT === ""
              ) {
                const btnName = await MessageBox({
                  messageTitle: "HOBranchValidMessageTitle",
                  message: "fillRequiredFieldsInNRITab",
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });

                if (btnName === "Ok") {
                  const tabList = updReqRef.current?.tabNameList || [];
                  const relatedTabIndex = tabList.findIndex(
                    (tab) => tab?.tabName === "NRI Details"
                  );
                  handleColTabChangectx(relatedTabIndex);
                  handleAbortSubmit(true);
                  return;
                }
              }
            }
            if (
              Object?.keys(
                updReqRef.current?.finalUpdatedReq?.ATTESTATION_DTL ?? {}
              )?.length > 0 &&
              !Boolean(updReqRef?.current?.isAbortSubmit)
            ) {
              let proceed = false;
              if (
                updReqRef.current?.req_cd_ctx ||
                updReqRef.current?.customerIDctx
              ) {
                let buttonName = await MessageBox({
                  messageTitle: "CONFIRMATION",
                  message: "AreYouSureYouWantToApplyChangesAndUpdate",
                  buttonNames: ["Yes", "No"],
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
                proceed = buttonName === "Yes";
              } else {
                proceed = true;
              }
              if (proceed) {
                const { update_type } = await handleUpdatectx({
                  COMP_CD: authState?.companyID ?? "",
                });

                const updatedReqCopy = {
                  ...updReqRef.current?.finalUpdatedReq,
                  PERSONAL_DETAIL: {
                    ...updReqRef.current?.finalUpdatedReq?.PERSONAL_DETAIL,
                  },
                };

                // Now safely delete from the copy
                delete updatedReqCopy.PERSONAL_DETAIL._OLDROWVALUE;
                delete updatedReqCopy.PERSONAL_DETAIL._UPDATEDCOLUMNS;

                let personalDtl =
                  state?.retrieveFormDataApiRes?.PERSONAL_DETAIL ?? {};
                const personalDtlDateFields: string[] = [
                  "VERIFIED_DATE",
                  "LAST_MODIFIED_DATE",
                  "ENTERED_DATE",
                ];
                personalDtlDateFields.forEach((fieldNm) => {
                  if (Boolean(personalDtl[fieldNm])) {
                    personalDtl[fieldNm] = format(
                      utilFunction.getParsedDate(personalDtl[fieldNm]),
                      "dd-MMM-yyyy"
                    );
                  }
                });
                if (
                  updatedReqCopy.PERSONAL_DETAIL?.hasOwnProperty(
                    "ENTERED_DATE"
                  ) &&
                  Boolean(updatedReqCopy.PERSONAL_DETAIL?.ENTERED_DATE)
                ) {
                  updatedReqCopy.PERSONAL_DETAIL["ENTERED_DATE"] = format(
                    utilFunction.getParsedDate(
                      updatedReqCopy.PERSONAL_DETAIL["ENTERED_DATE"]
                    ),
                    "dd-MMM-yyyy"
                  );
                }

                const reqPara = {
                  COMP_CD: authState?.companyID ?? "",
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  MAIN_DATA: {
                    ...(personalDtl ?? {}),
                    ...updatedReqCopy.PERSONAL_DETAIL,
                    APPLICATION_TYPE: "01",
                    CUSTOMER_TYPE: state?.entityTypectx,
                    CONSTITUTION_TYPE: state?.constitutionValuectx,
                    COMP_CD: authState?.companyID ?? "",
                    BRANCH_CD: authState?.user?.branchCode ?? "",
                    ENT_COMP_CD: authState?.companyID ?? "",
                    ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                  },
                  REQ_CD: state?.req_cd_ctx ?? "",
                  ENTRY_TYPE: "1",
                  PAN_DUP_REASON: state?.panDuplicateReasonctx ?? "",
                  CUSTOMER_ID: state?.customerIDctx ?? "",
                  ENT_COMP_CD: authState?.companyID ?? "",
                  ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                  DOC_DATA: (
                    state?.formDatactx["DOC_MST"]?.["doc_mst_payload"] ?? []
                  )?.filter((item) => item?._isDeleteRow !== true),
                  SAVE_TYPE: state?.customerIDctx
                    ? "E"
                    : update_type == "full_save"
                    ? "F"
                    : update_type == "save_as_draft"
                    ? "D"
                    : "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  DISPLAY_LANGUAGE: i18n?.resolvedLanguage ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                };
                customerValidate.mutate({
                  reqPara: reqPara,
                  deepRemoveKeysIfExist,
                  deepUpdateKeys,
                  authState,
                });
              } else {
                onFinalUpdatectx(false);
                handleUpdateLoader(false);
              }
            } else if (!Boolean(updReqRef?.current?.isAbortSubmit)) {
              const attestationIndex =
                updReqRef.current?.tabNameList?.findIndex(
                  (tab) => tab?.tabName === "Attestation Details"
                );

              const btnName = await MessageBox({
                messageTitle: "ValidationFailed",
                message: "fillRequiredFieldsInAttestation",
                icon: "ERROR",
              });

              if (btnName === "Ok") {
                onFinalUpdatectx(false);
                handleUpdateLoader(false);
                handleModifiedColsctx({});
                handleFormDataonSavectx({});
                handleStepStatusctx({ reset: true });
                handleColTabChangectx(attestationIndex);
              }
            }
          }
        }, 10);
      } else {
        handleUpdateLoader(false);
      }
    },
    [
      state?.currentFormctx.currentFormRefctx,
      state?.modifiedFormCols,
      state?.formmodectx,
      state?.updatedReq,
      state?.updatedReq?.PERSONAL_DETAIL_HEADER_FORM,
    ]
  );

  const onCancelForm = async () => {
    if (Boolean(formModalMode) && formModalMode !== "view") {
      if (Object.keys(state?.formDatactx).length > 0) {
        let buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: "Your changes will be Lost. Are you Sure?",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          closeForm();
        }
      } else {
        closeForm();
      }
    } else {
      closeForm();
    }
  };
  const onEdit = () => {
    validateCustIdMutation?.mutate({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERROLE: authState?.role ?? "",
      CUSTOMER_ID: location?.state?.[0]?.data?.CUSTOMER_ID ?? "",
      USERNAME: authState?.user?.id,
    });
  };
  const handleUpdateButtonClick = async (e, btnFlag) => {
    let submitResult: any = null;
    const currentTabRef = tabFormRefs.current[state?.colTabValuectx];
    if (stateRef.current?.isButtonDisable) return;

    // Then submit current tab form(s)
    if (Array.isArray(currentTabRef)) {
      const results = await Promise.all(
        currentTabRef.map((ref) =>
          ref && typeof ref.handleSubmit === "function"
            ? ref.handleSubmit(e, "UpdateData", false, state)
            : Promise.resolve(true)
        )
      );
      const hasError = results.some((item) => item.hasError === true);
      if (hasError) return;
      submitResult = results;
    } else if (
      currentTabRef &&
      typeof currentTabRef.handleSubmit === "function"
    ) {
      let result;
      if (btnFlag === "PREVIOUS") {
        result = await currentTabRef.handleSubmit(e, "savePre", false, state);
      } else {
        result = await currentTabRef.handleSubmit(
          e,
          "UpdateData",
          false,
          state
        );
      }
      if (result?.hasError) return;
    }
    if (btnFlag === "PREVIOUS") return;

    // Now update after both header and tab forms are submitted
    setTimeout(async () => {
      await onUpdateForm(e);
    }, 50);
  };

  const ActionBTNs = React.useMemo(() => {
    return (
      <>
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            marginRight: "18px",
            paddingBottom: "0px",
          }}
        >
          {!isModal ? (
            formModalMode === "view" &&
            state?.fromctx === "confirmation-entry" ? (
              <>
                <GradientButton
                  onClick={() => openActionDialog("Y")}
                  color="primary"
                  style={{ minWidth: "fit-content" }}
                >
                  {t("Confirm")}
                </GradientButton>
                {!Boolean(state?.customerIDctx) && (
                  <GradientButton
                    onClick={() => openActionDialog("M")}
                    color="primary"
                    style={{ minWidth: "fit-content" }}
                  >
                    {t("Raise Query")}
                  </GradientButton>
                )}
                <GradientButton
                  onClick={() => openActionDialog("R")}
                  color="primary"
                  style={{ minWidth: "fit-content" }}
                >
                  {t("Reject")}
                </GradientButton>
              </>
            ) : formModalMode === "edit" && state?.fromctx !== "new-draft" ? (
              <>
                <GradientButton
                  onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                  }}
                  color="primary"
                  style={{ minWidth: "fit-content" }}
                >
                  <MenuIcon />
                </GradientButton>
                <GradientButton
                  onClick={(event) => handleUpdateButtonClick(event, "NEXT")}
                  color="primary"
                  style={{ minWidth: "fit-content" }}
                  disabled={stateRef?.current?.isButtonDisable}
                >
                  {t("Update")}
                </GradientButton>
              </>
            ) : formModalMode === "view" ? (
              // Show hamburger menu in view mode to allow access to PhotoSign
              <>
                <GradientButton
                  onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                  }}
                  color="primary"
                  style={{ minWidth: "fit-content" }}
                >
                  <MenuIcon />
                </GradientButton>
                {location?.state?.[0]?.data?.ALLOW_EDIT === "Y" && (
                  <GradientButton
                    onClick={onEdit}
                    disabled={validateCustIdMutation?.isLoading}
                    endIcon={
                      validateCustIdMutation?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    color="primary"
                    style={{ minWidth: "fit-content" }}
                  >
                    {t("Edit")}
                  </GradientButton>
                )}
              </>
            ) : (
              location?.state?.[0]?.data?.ALLOW_EDIT === "Y" && (
                <GradientButton
                  onClick={onEdit}
                  disabled={validateCustIdMutation?.isLoading}
                  endIcon={
                    validateCustIdMutation?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  color="primary"
                  style={{ minWidth: "fit-content" }}
                >
                  {t("Edit")}
                </GradientButton>
              )
            )
          ) : (
            <>
              <GradientButton
                onClick={(event) => {
                  setAnchorEl(event.currentTarget);
                }}
                color="primary"
                style={{ minWidth: "fit-content" }}
              >
                <MenuIcon />
              </GradientButton>
            </>
          )}

          {/* Always visible Close button */}
          <GradientButton
            onClick={onCancelForm}
            color="primary"
            style={{ minWidth: "fit-content" }}
          >
            {t("Close")}
          </GradientButton>
        </Box>
      </>
    );
  }, [
    state?.currentFormctx.currentFormRefctx,
    state?.formmodectx,
    formModalMode,
    from,
    state?.fromctx,
    state?.modifiedFormCols,
    validateCustIdMutation?.isLoading,
    state?.retrieveFormDataApiRes,
  ]);

  const HeaderContent = React.useMemo(() => {
    return (
      <React.Fragment>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            width: "58rem",
          }}
        >
          {!isModal &&
          state?.retrieveFormDataApiRes &&
          state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.ACCT_NM &&
          formModalMode !== "new" ? (
            <Typography
              sx={{ mr: "30px" }}
              color="inherit"
              variant="subtitle2"
              component="div"
            >
              {`Name :-${state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.ACCT_NM}`}
            </Typography>
          ) : (
            ""
          )}
          {isModal &&
          state?.retrieveFormDataApiRes &&
          state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.CUSTOMER_ID ? (
            <Typography>
              {`C-KYC Information - Customer ID :-
              ${
                state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]
                  ?.CUSTOMER_ID ?? ""
              } Name :- ${
                state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.ACCT_NM ??
                ""
              }`}
            </Typography>
          ) : (
            ""
          )}
          {!state?.isFreshEntryctx &&
          state?.fromctx !== "new-draft" &&
          state?.retrieveFormDataApiRes ? (
            <Typography
              sx={{ mr: "30px" }}
              color="inherit"
              variant="subtitle2"
              component="div"
            >
              {state?.entityTypectx === "I" &&
              state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.PHOTO_SIGN ===
                "P"
                ? "Photo/Signature yet not scanned"
                : state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]
                    ?.PHOTO_SIGN === "N"
                ? "Photo/Signature Confirmation Pending"
                : null}
            </Typography>
          ) : (
            ""
          )}

          {Boolean(location?.state?.[0]?.data?.MAKER) &&
            location?.state?.[0]?.data?.CONFIRMED === "P" && (
              <Typography
                sx={{ mr: "30px" }}
                color="inherit"
                variant="subtitle2"
                component="div"
              >
                {`${t("ModifiedBy")} : ${location?.state?.[0]?.data?.MAKER}`}
              </Typography>
            )}
          {Boolean(location?.state?.[0]?.data?.CONFIRMED_FLAG) &&
            location?.state?.[0]?.data?.CONFIRMED !== "Y" && (
              <Typography
                sx={{ mr: "30px" }}
                color="inherit"
                variant="subtitle2"
                component="div"
              >
                {location?.state?.[0]?.data?.CONFIRMED_FLAG}
              </Typography>
            )}

          {!state?.isFreshEntryctx &&
          state?.fromctx !== "new-draft" &&
          state?.retrieveFormDataApiRes &&
          state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.BRANCH_CD ? (
            <Typography
              sx={{ mr: "30px" }}
              color="inherit"
              variant="subtitle2"
              component="div"
            >{`Open from Branch - ${state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.BRANCH_CD}`}</Typography>
          ) : null}

          {!state?.isFreshEntryctx &&
          state?.fromctx !== "new-draft" &&
          state?.retrieveFormDataApiRes &&
          state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.ENTERED_DATE ? (
            <Typography
              sx={{ mr: "30px" }}
              color="inherit"
              variant="subtitle2"
              component="div"
            >{`Opening Date - ${format(
              utilFunction.getParsedDate(
                state?.retrieveFormDataApiRes?.["PERSONAL_DETAIL"]?.ENTERED_DATE
              ),
              "dd/MM/yyyy"
            )}`}</Typography>
          ) : (
            ""
          )}
        </Box>
      </React.Fragment>
    );
  }, [state?.retrieveFormDataApiRes]);
  const dialogRegistry: Record<
    string,
    {
      label: string;
      component: React.ComponentType<any>;
      allowed: (state: any, isModal: boolean) => boolean;
    }
  > = {
    "photo-signature": {
      label: "Photo/Signature",
      component: PhotoSignatureCpyDialog,
      allowed: (state, isModal) => (state?.customerIDctx ? true : !isModal),
    },
    "tds-exemption": {
      label: "TDS Exemption",
      component: TDSSExemptionComp,
      allowed: (state, isModal) =>
        formModalMode === "view"
          ? false
          : (state?.selectedRow?.CONFIRMED === "P" &&
              state?.selectedRow?.UPD_TAB_FLAG_NM === "TDS") ||
            state?.selectedRow?.CONFIRMED === "Y" ||
            state?.selectedRow?.CONFIRMED === "R" ||
            isModal,
    },
  };

  const ExtraOptionsMenu = ({ anchorEl, onClose, state }) => {
    const open = Boolean(anchorEl);

    const handleLinkClick = (dialogKey: string, allowed: boolean) => {
      if (!allowed) return;
      setOpenDialog(dialogKey);
      onClose();
    };

    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: { width: 200, mt: "5px" },
          },
        }}
      >
        {Object.entries(dialogRegistry).map(([key, { label, allowed }]) => {
          const isAllowed = allowed(state, isModal);
          return (
            <MenuItem
              key={key}
              onClick={() => handleLinkClick(key, isAllowed)}
              disabled={!isAllowed}
            >
              {label}
            </MenuItem>
          );
        })}
      </Menu>
    );
  };

  const steps: any = state?.tabsApiResctx.filter((tab) => tab.isVisible);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 100px)",
        }}
      >
        <AppBar
          position="sticky"
          color="secondary"
          style={{
            background: "var(--theme-color5)",
            zIndex: "99",
          }}
        >
          <Toolbar
            variant="dense"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {!isModal && (
              <Typography
                className={classes.title}
                color="inherit"
                variant={"h6"}
                component="div"
              >
                {state?.entityTypectx == "C"
                  ? t("LegalEntry")
                  : t("IndividualEntry")}
                <Chip
                  style={{ color: "white", marginLeft: "8px" }}
                  variant="outlined"
                  color="primary"
                  size="small"
                  label={`${formModalMode} mode`}
                />
              </Typography>
            )}
            {HeaderContent}
            {ActionBTNs}
          </Toolbar>
        </AppBar>
        <HeaderFormNew
          ref={headerFormRef}
          isModal={isModal}
          rowData={rowData}
        />
        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            position: "relative",
            minHeight: "100px",
          }}
        >
          <EnfinityLoader
            loading={
              state?.loader ||
              customerValidate?.isLoading ||
              modifyCustMutation?.isLoading
            }
          />
          <Grid
            container
            sx={{ transition: "all 0.4s ease-in-out" }}
            columnGap={(theme) => theme.spacing(1)}
          >
            {state?.tabsApiResctx && state?.tabsApiResctx?.length > 0 && (
              <Grid
                item
                xs={12}
                sx={{
                  position: "sticky",
                  top: 2,
                  zIndex: 1000,
                  backgroundColor: "var(--theme-color2)",
                  minHeight: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0px 0px 10px 0px",
                  paddingTop: "10px",
                }}
              >
                <TabStepper isModal={isModal} />
              </Grid>
            )}
            <Grid
              sx={{
                "& .MuiGrid-root": {
                  padding: "5px",
                },
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              item
              xs
            >
              <div
                style={{
                  overflowY: "auto",
                  height: "85%",
                }}
              >
                {mutation.isError ? (
                  <Alert
                    severity={mutation.error?.severity ?? "error"}
                    errorMsg={
                      mutation.error?.error_msg ?? "Something went to wrong.."
                    }
                    errorDetail={mutation.error?.error_detail}
                    color="error"
                  />
                ) : modifyCustMutation.isError ? (
                  <Alert
                    severity={modifyCustMutation.error?.severity ?? "error"}
                    errorMsg={
                      modifyCustMutation.error?.error_msg ??
                      "Something went to wrong.."
                    }
                    errorDetail={modifyCustMutation.error?.error_detail}
                    color="error"
                  />
                ) : (
                  confirmMutation.isError && (
                    <Alert
                      severity={confirmMutation.error?.severity ?? "error"}
                      errorMsg={
                        confirmMutation.error?.error_msg ??
                        "Something went to wrong.."
                      }
                      errorDetail={confirmMutation.error?.error_detail}
                      color="error"
                    />
                  )
                )}
                {steps &&
                  steps.length > 0 &&
                  steps.map((element, i) => {
                    return (
                      <TabPanel key={i} value={state?.colTabValuectx} index={i}>
                        {state?.entityTypectx === "I"
                          ? getIndividualTabComp(element?.TAB_NAME)
                          : getLegalTabComp(element?.TAB_NAME)}
                      </TabPanel>
                    );
                  })}
              </div>
            </Grid>
          </Grid>
          {Boolean(confirmAction) && (
            <RemarksAPIWrapper
              TitleText={
                confirmAction === "Y"
                  ? "Confirm"
                  : confirmAction === "M"
                  ? "Raise Query"
                  : confirmAction === "R" && "Rejection Reason"
              }
              onActionNo={() => {
                setIsOpen(false);
                setConfirmAction(null);
              }}
              defaultValue={`${
                confirmAction === "Y"
                  ? t("APPROVED BY")
                  : confirmAction === "M"
                  ? t("QUERY RAISED BY")
                  : confirmAction === "R"
                  ? t("REJECTED BY")
                  : ""
              } ${authState?.user?.name?.toUpperCase() ?? ""} ON ${
                authState?.workingDate ?? ""
              }`}
              onActionYes={(val, rows) => {
                confirmMutation.mutate({
                  REQUEST_CD: state?.req_cd_ctx ?? "",
                  REMARKS: val ?? "",
                  CONFIRMED: confirmAction,
                  REQ_FLAG: selectedRow?.REQ_FLAG ?? "",
                  SCREEN_REF: docCD ?? "",
                });
              }}
              isLoading={
                confirmMutation.isLoading || confirmMutation.isFetching
              }
              isEntertoSubmit={true}
              AcceptbuttonLabelText="Ok"
              CanceltbuttonLabelText="Cancel"
              open={isOpen}
              rows={{}}
              maxLength={300}
              showMaxLength={true}
              isRequired={confirmAction === "Y" ? false : true}
            />
          )}
          <ExtraOptionsMenu
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            state={state}
          />
        </Box>
      </Box>

      {openDialog &&
        (() => {
          const dialogConfig = dialogRegistry[openDialog];
          if (!dialogConfig) return null;
          const DialogComponent = dialogConfig.component;

          // Determine view mode based on form mode and dialog type
          let dialogViewMode = "edit";
          if (formModalMode === "view") {
            // In view mode, allow viewing photosign but restrict TDS exemption changes
            if (openDialog === "tds-exemption") {
              dialogViewMode = "view";
            } else if (openDialog === "photo-signature") {
              dialogViewMode = "view"; // Allow viewing photosign
            }
          }

          return (
            <DialogComponent
              open={true}
              onClose={() => setOpenDialog(null)}
              viewMode={dialogViewMode}
              isModal={isModal}
            />
          );
        })()}
    </>
  );
}
