import {
  AppBar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  Grid,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ExtractedHeader from "../c-kyc/formModal/ExtractedHeader";
import {
  GradientButton,
  queryClient,
  utilFunction,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import {
  Fragment,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined"; // sidebar-open-icon
import CancelIcon from "@mui/icons-material/Cancel"; // sidebar-`close`-icon
import { CustomTabLabel, TabPanel } from "../c-kyc/formModal/formModal";
import { CustomTab, useDialogStyles } from "./style";
import AcctHeaderForm from "./AcctHeaderForm";
import { AuthContext } from "pages_audit/auth";
import { AcctMSTContext } from "./AcctMSTContext";
import { useLocation, useNavigate } from "react-router-dom";
import * as API from "./api";
import MainTab from "./tabComponents/MainTab";
import JointTab from "./tabComponents/jointTabs/JointTab";
import NomineeJointTab from "./tabComponents/jointTabs/NomineeJointTab";
import GuardianJointTab from "./tabComponents/jointTabs/GuardianJointTab";
import GuarantorJointTab from "./tabComponents/jointTabs/GuarantorJointTab";
import CollateralJointTab from "./tabComponents/jointTabs/CollateralJointTab";
import SignatoryJointTab from "./tabComponents/jointTabs/SignatoryJointTab";
import IntroductorJointTab from "./tabComponents/jointTabs/IntroductorJointTab";
import TermLoanTab from "./tabComponents/TermLoanTab";
import SavingsDepositTab from "./tabComponents/SavingsDepositTab";
import HypothicationTab from "./tabComponents/HypothicationTab";
import CurrentTab from "./tabComponents/CurrentTab";
import FixDepositTab from "./tabComponents/FixDepositTab";
import LockerTab from "./tabComponents/LockerTab";
import RelativeDtlTab from "./tabComponents/RelativeDtlTab";
import ShareNominalTab from "./tabComponents/ShareNominalTab";
import OtherAddTab from "./tabComponents/OtherAddTab";
import Document from "./tabComponents/DocumentTab/Document";
import OverDraftTab from "./tabComponents/OverdraftTab";
import RecurringTab from "./tabComponents/RecurringTab";
// import Document from "./tabComponents/DocumentTab2/Document";
import { useMutation, useQuery } from "react-query";
import {
  Alert,
  RemarksAPIWrapper,
  usePopupContext,
} from "@acuteinfo/common-base";
import { enqueueSnackbar } from "notistack";
import { getdocCD } from "components/utilFunction/function";
import { AdvConfig } from "./tabComponents/AdvConfig/AdvConfig";
import { format } from "date-fns";
import DocumentUpdate from "./tabComponents/DocumentTab/AcctDocMainGrid";
import AcctDocMainGrid from "./tabComponents/DocumentTab/AcctDocMainGrid";
import i18n from "components/multiLanguage/languagesConfiguration";
import MobileRegTab from "./tabComponents/MobileRegTab";
import { AdvConfigTab } from "./tabComponents/AdvConfigTab";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
import UpdateAuditDetail from "./tabMetadata/AuditUpdateDetail";
import TabStepper from "./TabStepper";
import ApplicationDetail from "../sharedAppEntry/ApplicationDetail.tsx";
import _ from "lodash";
import { getFormattedDate } from "components/agGridTable/utils/helper";
import SITab from "./tabComponents/SITab";

const AcctModal = ({
  onClose = () => {},
  isCallFinalSaveRef = { current: false },
  asDialog = true,
  isHeaderDisplay = true,
  tabMappings = [],
  validateShareScreenApp,
  screenFlag = "AcctMst",
  title,
  rowData = {},
  fromState = "",
  formmodeState = "",
}: {
  onClose?: () => void;
  isCallFinalSaveRef?: any;
  asDialog?: boolean;
  rowData?: any;
  fromState?: string;
  formmodeState?: string;
  isHeaderDisplay?: boolean;
  tabMappings?: any[];
  validateShareScreenApp?: any;
  screenFlag?: string;
  title?: any;
}) => {
  const {
    AcctMSTState,
    handleFromFormModectx,
    handleFormModalOpenOnEditctx,
    handleFormDataonRetrievectx,
    handleFormModalClosectx,
    handleSidebarExpansionctx,
    handleColTabChangectx,
    handleFormModalOpenctx,
    handleCurrFormctx,
    onFinalUpdatectx,
    handleUpdatectx,
    handleModifiedColsctx,
    handleFormDataonSavectx,
    handleFormLoading,
    toNextTab,
    handleReqCDctx,
    handleStepStatusctx,
    handleCloseAcctStatus,
    tabFormRefs,
    handleUpdateLoader,
    submitRefs,
    deepRemoveKeysIfExist,
  } = useContext(AcctMSTContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const navigate = useNavigate();

  const { state, pathname }: any = useLocation();
  const row = state?.rows?.[0]?.data || state?.data || rowData || {};
  const formmode = state?.formmode || formmodeState;
  const classes = useDialogStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [openDilogue, setOpenDilogue] = useState(false);
  const reqCD =
    formmode === "new"
      ? ""
      : !isNaN(parseInt(row?.REQUEST_ID))
      ? parseInt(row?.REQUEST_ID)
      : "";
  let from = state?.from || fromState;

  // get account form details
  const {
    data: accountDetails,
    isLoading,
    isError: isAcctDtlError,
    error: AcctDtlError,
    refetch,
  } = useQuery<any, any>(
    ["getAccountDetails", row?.ACCT_TYPE],
    () =>
      API.getAccountDetails({
        ACCT_TYPE: row?.ACCT_TYPE ?? "",
        ACCT_CD: row?.ACCT_CD ?? "",
        REQUEST_CD: reqCD,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: row?.BRANCH_CD ?? "",
        SCREEN_REF: docCD,
      }),
    { enabled: false }
  );

  useEffect(() => {
    if (isLoading) {
      handleFormLoading(true);
    } else {
      handleFormLoading(false);
    }
    if (!isLoading && accountDetails) {
      handleFormDataonRetrievectx(accountDetails[0]);
      handleColTabChangectx(0);
      handleFormLoading(false);
    }
  }, [accountDetails, isLoading]);

  // validate new account entry
  const validateAcctMutation: any = useMutation(API.validateNewAcct, {
    onSuccess: async (data, variables) => {
      const filterdata = data?.[0]?.MSG;
      for (let i = 0; i < filterdata?.length; i++) {
        if (filterdata[i]?.O_STATUS === "999") {
          const btnName = await MessageBox({
            messageTitle: filterdata[i]?.O_MSG_TITLE
              ? filterdata[i]?.O_MSG_TITLE
              : "ValidationFailed",
            message: filterdata[i]?.O_MESSAGE,
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          if (btnName === "Ok") {
            onFinalUpdatectx(false);
            CloseMessageBox();
          }
        } else if (filterdata[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: filterdata[i]?.O_MSG_TITLE
              ? filterdata[i]?.O_MSG_TITLE
              : "Alert",
            message: filterdata[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (filterdata[i]?.O_STATUS === "99") {
          const btnName = await MessageBox({
            messageTitle: filterdata[i]?.O_MSG_TITLE
              ? filterdata[i]?.O_MSG_TITLE
              : "Confirmation",
            message: filterdata[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (btnName === "No") {
            onFinalUpdatectx(false);
            CloseMessageBox();
            return;
          }
        } else if (filterdata[i]?.O_STATUS === "0") {
          if (Boolean(variables?.IsNewRow)) {
            const reqPara = {
              IsNewRow: true,
              REQ_CD: AcctMSTState?.req_cd_ctx,
              REQ_FLAG: "F",
              SAVE_FLAG: "F",
              CUSTOMER_ID: AcctMSTState?.customerIDctx,
              ACCT_TYPE: AcctMSTState?.accTypeValuectx,
              ACCT_CD: AcctMSTState?.acctNumberctx,
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              formData: AcctMSTState?.formDatactx,
              OP_DATE: authState?.workingDate,
              SCREEN_REF: docCD,
              mainIntialVals: AcctMSTState?.mainIntialVals,
              btnData: AcctMSTState?.btnDatactx,
              documentData: AcctMSTState?.documentObj,
              deepRemoveKeysIfExist: variables?.deepRemoveKeysIfExist,
            };
            saveAcctMutation.mutate(reqPara);
          } else if (!Boolean(variables?.IsNewRow)) {
            const reqPara = {
              IsNewRow: !AcctMSTState?.req_cd_ctx ? true : false,
              REQ_CD: AcctMSTState?.req_cd_ctx,
              REQ_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
              SAVE_FLAG: "F",
              // Not getting Customer ID so i commented this code.
              // CUSTOMER_ID: AcctMSTState?.customerIDctx,
              CUSTOMER_ID:
                AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID,
              ACCT_TYPE: AcctMSTState?.accTypeValuectx,
              ACCT_CD: AcctMSTState?.acctNumberctx,
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: AcctMSTState?.rowBranchCodectx ?? "",
              IS_FROM_MAIN: "N",
              formData: AcctMSTState?.formDatactx,
              OP_DATE: authState?.workingDate,
              updated_tab_format: variables?.updated_tab_format,
              deepRemoveKeysIfExist: variables?.deepRemoveKeysIfExist,
            };
            modifyAcctMutation.mutate(reqPara);
          }
        }
      }
      // handleCurrFormctx({
      //   currentFormSubmitted: null,
      //   isLoading: false,
      // });
    },
    onError: (error: any) => {
      handleCurrFormctx({
        currentFormSubmitted: null,
        isLoading: false,
      });
      onFinalUpdatectx(false);
      CloseMessageBox();
    },
  });

  // save new account entry
  const saveAcctMutation: any = useMutation(API.accountSave, {
    onSuccess: async (data) => {
      if (data?.[0]?.REQ_CD && !isNaN(data?.[0]?.REQ_CD)) {
        handleReqCDctx(parseInt(data?.[0]?.REQ_CD));
        onFinalUpdatectx(false);
        const buttonName = await MessageBox({
          messageTitle: "SUCCESS",
          message: `${t("SavedSuccessfully")} Request ID - ${
            parseInt(data?.[0]?.REQ_CD) ?? ""
          }`,
          icon: "SUCCESS",
          buttonNames: ["Ok"],
        });
        if (buttonName === "Ok") {
          isCallFinalSaveRef.current = true;
          closeForm();
          CloseMessageBox();
          queryClient.invalidateQueries({
            queryKey: [
              "acct-mst",
              "getPendingTabData",
              authState?.user?.branchCode,
            ],
          });
        }
      }
    },
    onError: (error: any) => {
      onFinalUpdatectx(false);
      CloseMessageBox();
      handleCurrFormctx({
        currentFormSubmitted: null,
        isLoading: false,
      });
    },
  });

  // modify new account entry
  const modifyAcctMutation: any = useMutation(API.accountModify, {
    onSuccess: async (data) => {
      CloseMessageBox();
      // handleCurrFormctx({
      //   currentFormSubmitted: null,
      //   isLoading: false,
      // });
      onFinalUpdatectx(false);
      handleModifiedColsctx({});
      handleFormDataonSavectx({});
      // enqueueSnackbar("UpdatedSuccessfully", { variant: "success" });
      const buttonName = await MessageBox({
        messageTitle: "SUCCESS",
        message: `${t("UpdatedSuccessfully")} Request ID - ${
          !isNaN(parseInt(data?.[0]?.REQ_CD)) && data?.[0]?.REQ_CD !== ""
            ? parseInt(data?.[0]?.REQ_CD)
            : AcctMSTState?.req_cd_ctx ?? ""
        }`,
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });
      if (buttonName === "Ok") {
        isCallFinalSaveRef.current = true;
        closeForm();
        CloseMessageBox();
        queryClient.invalidateQueries({
          queryKey: [
            "acct-mst",
            "getPendingTabData",
            authState?.user?.branchCode,
          ],
        });
      }
      handleStepStatusctx({ reset: true });
      closeForm();
    },
    onError: (error: any) => {
      CloseMessageBox();
      handleCurrFormctx({
        currentFormSubmitted: null,
        isLoading: false,
      });
      onFinalUpdatectx(false);
      handleModifiedColsctx({});
      handleFormDataonSavectx({});
    },
  });

  // confirm acount entry
  const confirmMutation: any = useMutation(API.confirmAccount, {
    onSuccess: async (data, variables) => {
      setIsOpen(false);
      if (variables?.CONFIRMED === "R") {
        enqueueSnackbar(t("AccountRemoveSuccessfully"), { variant: "success" });
      } else if (
        variables?.CONFIRMED === "Y" &&
        Boolean(data?.[0]?.BRANCH_CD)
      ) {
        const btnName = await MessageBox({
          messageTitle: "Success",
          message: `Account Created - A/C No :- ${data?.[0]?.COMP_CD}-${data?.[0]?.BRANCH_CD}-${data?.[0]?.ACCT_TYPE}-${data?.[0]?.ACCT_CD}`,
          icon: "SUCCESS",
          buttonNames: ["Ok"],
        });
        if (btnName === "Ok") {
          CloseMessageBox();
        }
      } else {
        enqueueSnackbar(t("AccountConfirmSuccessfully"), {
          variant: "success",
        });
      }
      closeForm();
    },
    onError: async (error: any) => {
      //
      // setIsUpdated(true)
      setIsOpen(false);
      setConfirmAction(null);
      //
      // let buttonName = await MessageBox({
      //   messageTitle: "ERROR",
      //   message: "",
      //   buttonNames: ["Ok"],
      // });
    },
  });

  // Close A/C reopen validation API
  const acctReOpenValMutation: any = useMutation(API.validateAcctReOpen, {
    onSuccess: async (data) => {
      for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
        if (data?.[0]?.MSG?.[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle:
              data?.[0]?.MSG?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[0]?.MSG?.[i]?.O_MESSAGE,
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
        } else if (data?.[0]?.MSG?.[i]?.O_STATUS === "99") {
          const btn = await MessageBox({
            messageTitle: data?.[0]?.MSG?.[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[0]?.MSG?.[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (btn === "No") {
            break;
          }
        } else if (data?.[0]?.MSG?.[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[0]?.MSG?.[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[0]?.MSG?.[i]?.O_MESSAGE,
            icon: "WARNING",
            buttonNames: ["Ok"],
          });
        } else if (data?.[0]?.MSG?.[i]?.O_STATUS === "0") {
          handleCloseAcctStatus("O");
          handleFromFormModectx({ formmode: "edit" });
        }
      }
    },
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
    },
  });

  const handleAcctReOpenValid = async () => {
    const mainDetail =
      AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"] ?? {};
    const request = {
      COMP_CD: mainDetail?.COMP_CD ?? "",
      BRANCH_CD: mainDetail?.BRANCH_CD ?? "",
      ACCT_TYPE: mainDetail?.ACCT_TYPE ?? "",
      ACCT_CD: mainDetail?.ACCT_CD ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      CUSTOMER_ID: mainDetail?.CUSTOMER_ID ?? "",
      SCREEN_REF: docCD ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      DISPLAY_LANGUAGE: i18n.resolvedLanguage ?? "",
      LF_NO: mainDetail?.LF_NO ?? "",
      DAY_BOOK_GRP_CD: mainDetail?.DAY_BOOK_GRP_CD ?? "",
    };
    acctReOpenValMutation.mutate(request);
  };

  // Close A/C close validation API
  const acctCloseValidMutation: any = useMutation(API.validateAcctClose, {
    onSuccess: async (data) => {
      for (let i = 0; i < data?.length; i++) {
        if (data?.[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: data?.[i]?.O_MESSAGE,
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
        } else if (data?.[i]?.O_STATUS === "99") {
          const btn = await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "Confirmation",
            message: data?.[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (btn === "No") {
            break;
          }
        } else if (data?.[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
            message: data?.[i]?.O_MESSAGE,
            icon: "WARNING",
            buttonNames: ["Ok"],
          });
        } else if (data?.[i]?.O_STATUS === "0") {
          handleCloseAcctStatus("C");
        }
      }
    },
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
    },
  });

  const handleAcctCloseValidations = async () => {
    const btn = await MessageBox({
      messageTitle: "CloseAcctConfirmation",
      message: "WantToCloseAccount",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      icon: "CONFIRM",
    });
    if (btn === "Yes") {
      const mainDetail =
        AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"] ?? {};
      const request = {
        COMP_CD: mainDetail?.COMP_CD ?? "",
        BRANCH_CD: mainDetail?.BRANCH_CD ?? "",
        ACCT_TYPE: mainDetail?.ACCT_TYPE ?? "",
        ACCT_CD: mainDetail?.ACCT_CD ?? "",
        CONF_BAL: mainDetail?.CONF_BAL ?? "",
        TRAN_BAL: mainDetail?.TRAN_BAL ?? "",
        NPA_CD: mainDetail?.NPA_CD ?? "",
        OP_DATE: mainDetail?.OP_DATE
          ? format(
              utilFunction.getParsedDate(mainDetail?.OP_DATE),
              "dd/MMM/yyyy"
            )
          : "",
        LST_INT_COMPUTE_DT: mainDetail?.LST_INT_COMPUTE_DT
          ? format(
              utilFunction.getParsedDate(mainDetail?.LST_INT_COMPUTE_DT),
              "dd/MMM/yyyy"
            )
          : "",
        WORKING_DATE: authState?.workingDate ?? "",
        CUSTOMER_ID: mainDetail?.CUSTOMER_ID ?? "",
        SCREEN_REF: docCD ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      };
      acctCloseValidMutation.mutate({ ...request });
    }
  };

  useEffect(() => {
    handleFromFormModectx({
      formmode: formmode === "edit" ? "view" : formmode,
      from: from,
    });
    if (formmode === "new") {
      handleColTabChangectx(0);
      handleFormModalOpenctx();
    } else if (Boolean(row && typeof row === "object")) {
      handleFormModalOpenOnEditctx(row);
      screenFlag !== "ShareApp" && refetch();
    } else {
      handleFormModalClosectx();
      screenFlag === "AcctMst" && onClose();
    }

    return () => {
      handleFormModalClosectx();
      queryClient.removeQueries(["getAccountDetails", row?.ACCT_TYPE]);
    };
  }, []);

  const closeForm = () => {
    handleFormModalClosectx();
    screenFlag === "AcctMst" && onClose();
  };
  const onCancelForm = async () => {
    //
    if (
      Boolean(AcctMSTState?.formmodectx) &&
      AcctMSTState?.formmodectx !== "view"
    ) {
      if (Object.keys(AcctMSTState?.formDatactx).length > 0) {
        let buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: "YourChangesWillBeLostAreYouSure",
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          closeForm();
          handleFormModalClosectx();
        }
      } else {
        closeForm();
      }
    } else {
      closeForm();
    }
    if (screenFlag === "ShareApp") {
      const segments = pathname.split("/");
      segments.pop();
      const basePath = segments.join("/");

      navigate(basePath, { state: { fromClose: true } });
    }
  };

  // const updateData = _.throttle(
  //   (e) => {
  //     const prevTabIndex = AcctMSTState?.colTabValuectx;
  //     const prevTabRef = tabFormRefs.current[prevTabIndex];
  //     if (prevTabRef && prevTabRef.handleSubmit) {
  //       if (prevTabRef?.handleSubmit?.name === "handleSave") {
  //         prevTabRef.handleSubmit(e, "UpdateData");
  //       } else {
  //         prevTabRef.handleSubmit(e, "UpdateData", false);
  //       }
  //     }
  //   },
  //   2000,
  //   { leading: true, trailing: false }
  // );

  const updateData = _.throttle(
    async (e) => {
      handleUpdateLoader(true);
      const prevTabIndex = AcctMSTState?.colTabValuectx;
      const prevTabRef = tabFormRefs.current[prevTabIndex];
      if (Array?.isArray(prevTabRef)) {
        await Promise?.all(
          prevTabRef?.map((ref) =>
            ref && ref?.handleSubmit
              ? ref?.handleSubmit(e, "UpdateData")
              : Promise?.resolve()
          )
        );
        handleUpdateLoader(false);
        submitRefs.current = false;
      } else if (prevTabRef && prevTabRef.handleSubmit) {
        const submitPromise =
          prevTabRef?.handleSubmit?.name === "handleSave"
            ? prevTabRef.handleSubmit(e, "UpdateData")
            : prevTabRef.handleSubmit(e, "UpdateData", false);

        await submitPromise;

        handleUpdateLoader(false);
        submitRefs.current = false;
      } else {
        handleUpdateLoader(false);
        submitRefs.current = false;
      }
    },
    2000,
    { leading: true, trailing: false }
  );

  const ActionBTNs = useMemo(() => {
    //
    return AcctMSTState?.formmodectx == "view"
      ? AcctMSTState?.fromctx &&
          AcctMSTState?.fromctx === "confirmation-entry" && (
            <Fragment>
              <GradientButton
                onClick={() => openActionDialog("Y")}
                color="primary"
                disabled={AcctMSTState?.tabNameList?.length === 0}
              >
                {t("Confirm")}
              </GradientButton>
              <GradientButton
                onClick={() => openActionDialog("R")}
                color="primary"
                // disabled={mutation.isLoading}
              >
                {t("Reject")}
              </GradientButton>
              <GradientButton
                onClick={() => setOpenDilogue(true)}
                color="primary"
              >
                {t("UpdateDetails")}
              </GradientButton>
            </Fragment>
          )
      : (AcctMSTState?.formmodectx === "edit" ||
          AcctMSTState?.formmodectx === "new") && (
          <GradientButton
            // onClick={() => onFinalUpdatectx(true)}
            onClick={updateData}
            color="primary"
            disabled={AcctMSTState?.tabsApiResctx?.length === 0}
          >
            {/* {t("Update")} */}
            {AcctMSTState?.formmodectx === "new" ? t("Save") : t("Update")}
          </GradientButton>
        );
  }, [
    AcctMSTState?.currentFormctx.currentFormRefctx,
    formmode,
    AcctMSTState?.formmodectx,
    from,
    AcctMSTState?.fromctx,
    AcctMSTState?.modifiedFormCols,
    AcctMSTState?.tabsApiResctx,
  ]);

  useEffect(() => {
    if (
      AcctMSTState?.currentFormctx?.currentFormSubmitted ||
      Boolean(AcctMSTState?.isFinalUpdatectx)
    ) {
      const steps = AcctMSTState?.tabNameList.filter((tab) => tab.isVisible);
      const totalTab: any = Array.isArray(steps) && steps.length;
      // const isLastTab: boolean =AcctMSTState?.isFreshEntryctx
      //    &&
      //   totalTab - 1 === AcctMSTState?.colTabValuectx;
      const isLastTab: boolean = Boolean(
        totalTab - 1 === AcctMSTState?.colTabValuectx
      );
      if (formmode === "new") {
        if (AcctMSTState?.isFinalUpdatectx) {
          const getInsertTabs = async () => {
            if (Object.keys(AcctMSTState.formDatactx).length > 0) {
              let buttonName = await MessageBox({
                messageTitle: "Confirmation",
                message: "AreYouSureToSaveTheData",
                buttonNames: ["Yes", "No"],
                loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (buttonName === "Yes") {
                let newRequest = {
                  BRANCH_CD: authState?.user?.branchCode ?? "",
                  COMP_CD: authState?.companyID ?? "",
                };
                const transformedData = AcctMSTState?.documentObj?.map(
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
                      "VERIFIED_BY",
                      "VERIFIED_DATE",
                      "VERIFIED_MACHINE_NM",
                      "FORMMODE",
                      "REPORT_PERSONALIZATION_ID",
                    ]);
                    let updatedValues;
                    let detailsData;
                    const baseData: any = {
                      ...cleanedRow,
                      ACTIVE:
                        row?.ACTIVE === true || row?.ACTIVE === "Y" ? "Y" : "N",
                      SUBMIT:
                        row?.SUBMIT === true || row?.SUBMIT === "Y" ? "Y" : "N",
                      ENTERED_DATE:
                        getFormattedDate(
                          row?.ENTERED_DATE ?? "",
                          "dd/MMM/yyyy"
                        ) ?? "",
                      VALID_UPTO:
                        getFormattedDate(
                          row?.VALID_UPTO ?? "",
                          "dd/MMM/yyyy"
                        ) ?? "",
                    };

                    const payload = row?.payload?.map(
                      ({ saved, errors, ...rest }) => rest
                    );
                    const payloadCopy = payload ? [...payload] : undefined;
                    if (AcctMSTState?.isFreshEntryctx) {
                      updatedValues = utilFunction?.transformDetailsData(
                        cleanedRow,
                        []
                      );
                      detailsData = {
                        isNewRow: payloadCopy ?? [],
                        isDeleteRow: [],
                        isUpdatedRow: [],
                      };
                    }
                    const transformedCopy = { ...updatedValues };

                    // transformDetailDataForDML

                    return {
                      ...baseData,
                      DETAILS_DATA: detailsData,
                      ...transformedCopy,
                      IsNewRow: true,
                    };
                  }
                );
                const ValidatereqPara = {
                  IsNewRow: true,
                  formData: AcctMSTState?.formDatactx,
                  SCREEN_REF: docCD,
                  mainIntialVals: AcctMSTState?.mainIntialVals,
                  NEW_REQ_DATA: { ...newRequest },
                  deepRemoveKeysIfExist,
                  docObj: transformedData,
                };

                validateAcctMutation.mutate(ValidatereqPara);
                // saveAcctMutation.mutate(reqPara);
              } else {
                onFinalUpdatectx(false);
              }
            }
          };
          if (screenFlag === "ShareApp") {
            validateShareScreenApp();
          } else {
            getInsertTabs().catch((err) =>
              console.error("update error", err.message)
            );
          }
        }
      } else if (formmode === "edit") {
        if (AcctMSTState?.isFinalUpdatectx) {
          const getUpdatedTabs = async () => {
            const { updated_tab_format } = await handleUpdatectx({
              COMP_CD: row?.COMP_CD ?? "",
              BRANCH_CD: row?.BRANCH_CD ?? "",
              ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
              ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
            });
            if (typeof updated_tab_format === "object") {
              if (Object.keys(updated_tab_format)?.length === 0) {
                let buttonName = await MessageBox({
                  messageTitle: "Alert",
                  message: "YouHaveNotMadeAnyChangesYet",
                  buttonNames: ["Ok"],
                  icon: "WARNING",
                });
                if (buttonName === "Ok") {
                  handleCurrFormctx({
                    currentFormSubmitted: null,
                    isLoading: false,
                  });
                  onFinalUpdatectx(false);
                  handleModifiedColsctx({});
                  handleFormDataonSavectx({});
                  handleStepStatusctx({ reset: true });
                }
              } else if (Object.keys(updated_tab_format)?.length > 0) {
                let newRequest = {
                  BRANCH_CD: AcctMSTState?.rowBranchCodectx,
                  COMP_CD: authState?.companyID,
                  ACCT_TYPE: AcctMSTState?.accTypeValuectx,
                  ACCT_CD: AcctMSTState?.acctNumberctx,
                  CUSTOMER_ID:
                    AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL
                      ?.CUSTOMER_ID,
                  REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
                  REQ_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
                  SAVE_FLAG: "F",
                  ENTRY_TYPE: "",
                  IS_FROM_MAIN: "N",
                };
                let buttonName = await MessageBox({
                  messageTitle: "Confirmation",
                  message: "AreYouSureYouWantToApplyChangesAndUpdate",
                  buttonNames: ["Yes", "No"],
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
                if (buttonName === "Yes") {
                  const validateReq = {
                    IsNewRow: false,
                    SCREEN_REF: docCD,
                    NEW_REQ_DATA: { ...newRequest },
                    COMP_CD: authState?.companyID ?? "",
                    BRANCH_CD: authState?.user?.branchCode ?? "",
                    ACCT_TYPE: AcctMSTState?.accTypeValuectx,
                    formData: AcctMSTState?.formDatactx,
                    oldData:
                      AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"],
                    oldDocData:
                      AcctMSTState?.retrieveFormDataApiRes?.["DOC_MST"],
                    oldJointData:
                      AcctMSTState?.retrieveFormDataApiRes?.[
                        "JOINT_ACCOUNT_DTL"
                      ],
                    updated_tab_format: updated_tab_format,
                    REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
                    deepRemoveKeysIfExist,
                  };
                  validateAcctMutation.mutate(validateReq);
                } else {
                  onFinalUpdatectx(false);
                }
              }
            }
          };
          getUpdatedTabs().catch((err) =>
            console.error("update error", err.message)
          );
        }
      }
      // if (Boolean(!isLastTab && !AcctMSTState?.isFinalUpdatectx)) {
      //   toNextTab();
      // }
    }
  }, [
    // AcctMSTState?.currentFormctx.currentFormSubmitted,
    AcctMSTState?.isFinalUpdatectx,
  ]);

  const steps: any =
    (AcctMSTState?.tabsApiResctx?.length > 0 &&
      AcctMSTState?.tabsApiResctx.filter((tab) => tab.isVisible)) ||
    [];

  const getTabComp = (tabName: string) => {
    switch (tabName) {
      case "MAIN":
        return <MainTab />; // MAIN_DETAIL
      case "TL":
      case "GDL":
      case "LTL":
        return <TermLoanTab />; // MAIN_DETAIL
      case "SB":
      case "RECM":
        return <SavingsDepositTab />; // MAIN_DETAIL
      case "CC":
        return <HypothicationTab />; // MAIN_DETAIL
      case "CA":
        return <CurrentTab />; // MAIN_DETAIL
      case "SH":
        return <ShareNominalTab />; // MAIN_DETAIL
      case "FD":
        return <FixDepositTab />; // MAIN_DETAIL
      case "REC":
      case "RECD":
        return <RecurringTab />; // MAIN_DETAIL
      case "LOC":
        return <LockerTab />; // MAIN_DETAIL
      case "MOB_REG":
        return <MobileRegTab />; // MOBILE_REG_DTL
      case "REL_DTL":
        return <RelativeDtlTab />; // RELATIVE_DTL
      case "OTH_ADD":
        return <OtherAddTab />; // OTHER_ADDRESS_DTL
      case "DOC":
        return <AcctDocMainGrid />;
      case "JOINT":
        return <JointTab />; // JOINT_HOLDER_DTL
      case "NOMINEE":
        return <NomineeJointTab />; // JOINT_NOMINEE_DTL
      case "GUARDIAN":
        return <GuardianJointTab />; // JOINT_GUARDIAN_DTL
      case "GUARANTOR":
        return <GuarantorJointTab />; // JOINT_GUARANTOR_DTL
      case "COLL_DTL":
        return <CollateralJointTab />; // JOINT_HYPOTHICATION_DTL
      case "SIGNATORY":
        return <SignatoryJointTab />; // JOINT_SIGNATORY_DTL
      case "INTRODUCTOR":
        return <IntroductorJointTab />; // JOINT_INTRODUCTOR_DTL
      case "ADV_CONFIG":
        return <AdvConfigTab />;
      case "APPLICATION_DETAIL":
        return <ApplicationDetail />;
      case "SI":
        return <SITab />;
      default:
        return <p>Not Found - {tabName}</p>;
    }
  };

  const openActionDialog = async (state: string) => {
    const allTabsViewed = Array.isArray(AcctMSTState?.tabNameList)
      ? AcctMSTState.tabNameList
          .filter((tab) => tab.isVisible)
          .every((tab) => tab.isViewed === true)
      : false;
    if (
      row?.ALL_TAB_VIEW === "Y" &&
      !allTabsViewed &&
      row?.REQ_FLAG === "F" &&
      state === "Y"
    ) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "ViewBeforeConfirm",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
    } else {
      setIsOpen(true);
      setConfirmAction(state);
    }
  };

  const onEdit = () => {
    handleFromFormModectx({ formmode: "edit" });
  };

  const dialogContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "90vh",
      }}
    >
      {/* {isHeaderDisplay && <ExtractedHeader />} */}
      <AppBar
        position="sticky"
        color="secondary"
        style={{
          background: "var(--theme-color5)",
          zIndex: "99",
        }}
      >
        <Toolbar variant="dense" sx={{ display: "flex", alignItems: "center" }}>
          {screenFlag === "AcctMst" ? (
            <>
              {" "}
              <Typography
                className={classes.title}
                color="inherit"
                variant={"h6"}
                component="div"
              >
                {from === "new-entry"
                  ? t("newAcct")
                  : from === "confirmation-entry"
                  ? `${row?.REQ_FLAG_DISP ?? ""} ${t("confirmAcct")}`
                  : formmode === "edit" && AcctMSTState?.allowEditctx === "Y"
                  ? `${row?.REQ_FLAG_DISP ?? ""} ${t("AcctModification")}`
                  : t("viewAcct")}

                {Boolean(AcctMSTState?.formmodectx) && (
                  <Chip
                    style={{ color: "white", marginLeft: "8px" }}
                    variant="outlined"
                    color="primary"
                    size="small"
                    label={`${AcctMSTState?.formmodectx} mode`}
                  />
                )}
              </Typography>
              {AcctMSTState?.isFreshEntryctx && AcctMSTState?.lastAcctCdctx && (
                <Typography
                  sx={{ whiteSpace: "nowrap", mr: 3 }}
                  color="inherit"
                  variant="subtitle2"
                  component="div"
                >
                  {`${t("LastOpenedAccountNumber")} : ${
                    AcctMSTState?.lastAcctCdctx
                  }`}
                </Typography>
              )}
              {!AcctMSTState?.isFreshEntryctx &&
              AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                ?.ENTERED_DATE ? (
                <Typography
                  sx={{ whiteSpace: "nowrap", mr: "30px" }}
                  color="inherit"
                  variant="subtitle2"
                  component="div"
                >
                  {row?.CONFIRMED &&
                    row?.CONFIRMED === "P" &&
                    `${row?.CONFIRMED_FLAG ?? ""}\u00A0\u00A0||`}
                  {"\u00A0\u00A0"}

                  {"Status:"}
                  {"\u00A0"}
                  {AcctMSTState?.closeAcctStatus === "C" ? (
                    <span style={{ color: "#FC0015" }}>CLOSED</span>
                  ) : AcctMSTState?.closeAcctStatus === "O" ? (
                    "OPEN"
                  ) : AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL
                      ?.STATUS === "C" ? (
                    <span style={{ color: "#FC0015" }}>
                      {
                        AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                          ?.STATUS_DISP
                      }
                    </span>
                  ) : (
                    AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                      ?.STATUS_DISP
                  )}

                  {"\u00A0\u00A0||\u00A0Opening Date - "}
                  {AcctMSTState?.closeAcctStatus === "O"
                    ? authState?.workingDate
                      ? format(
                          utilFunction.getParsedDate(authState?.workingDate),
                          "dd/MM/yyyy"
                        )
                      : ""
                    : AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                        ?.OP_DATE
                    ? format(
                        utilFunction.getParsedDate(
                          AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                            ?.OP_DATE
                        ),
                        "dd/MM/yyyy"
                      )
                    : ""}
                  {AcctMSTState?.closeAcctStatus === "C" && (
                    <>
                      {"\u00A0\u00A0||\u00A0Close Date - "}
                      <span style={{ color: "#FC0015" }}>
                        {authState?.workingDate
                          ? format(
                              utilFunction.getParsedDate(
                                authState?.workingDate
                              ),
                              "dd/MM/yyyy"
                            )
                          : ""}
                      </span>
                    </>
                  )}
                  {AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                    ?.CLOSE_DT &&
                    AcctMSTState?.closeAcctStatus !== "O" && (
                      <>
                        {"\u00A0\u00A0||\u00A0Close Date - "}
                        <span style={{ color: "#FC0015" }}>
                          {AcctMSTState?.retrieveFormDataApiRes?.["MAIN_DETAIL"]
                            ?.CLOSE_DT
                            ? format(
                                utilFunction.getParsedDate(
                                  AcctMSTState?.retrieveFormDataApiRes?.[
                                    "MAIN_DETAIL"
                                  ]?.CLOSE_DT
                                ),
                                "dd/MM/yyyy"
                              )
                            : ""}
                        </span>
                      </>
                    )}
                </Typography>
              ) : AcctMSTState?.isFreshEntryctx ? (
                <Typography
                  sx={{ whiteSpace: "nowrap", mr: "30px" }}
                  color="inherit"
                  variant="subtitle2"
                  component="div"
                >{`Status: Open\u00A0\u00A0||\u00A0Opening Date - ${
                  Boolean(authState?.workingDate)
                    ? format(
                        utilFunction.getParsedDate(authState?.workingDate),
                        "dd/MM/yyyy"
                      )
                    : ""
                }`}</Typography>
              ) : null}
              {/* for checker, view-only */}
              {formmode === "edit" &&
                AcctMSTState?.allowReopenAcctctx === "Y" && (
                  <GradientButton
                    onClick={handleAcctReOpenValid}
                    color={"primary"}
                    disabled={
                      acctReOpenValMutation?.isLoading ||
                      AcctMSTState?.closeAcctStatus === "O"
                    }
                    endIcon={
                      acctReOpenValMutation?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    {t("Reopen A/c")}
                  </GradientButton>
                )}
              {formmode === "edit" &&
                AcctMSTState?.allowCloseAcctctx === "Y" &&
                AcctMSTState?.formmodectx === "edit" && (
                  <GradientButton
                    onClick={handleAcctCloseValidations}
                    color={"primary"}
                    disabled={AcctMSTState?.closeAcctStatus === "C"}
                    endIcon={
                      acctCloseValidMutation?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    {t("Close A/c")}
                  </GradientButton>
                )}
              {ActionBTNs}
              {formmode === "edit" &&
                AcctMSTState?.allowEditctx === "Y" &&
                AcctMSTState?.formmodectx !== "edit" && (
                  <GradientButton onClick={onEdit} color={"primary"}>
                    {t("Edit")}
                  </GradientButton>
                )}
            </>
          ) : typeof title === "function" ? (
            title()
          ) : (
            title
          )}

          <GradientButton onClick={onCancelForm} color={"primary"}>
            {t("Close")}
          </GradientButton>
        </Toolbar>
      </AppBar>
      {isHeaderDisplay && (
        <AcctHeaderForm formmode={formmode} from={from} rowData={row} />
      )}

      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
          minHeight: "100px",
        }}
      >
        <EnfinityLoader loading={AcctMSTState?.loader} />

        <Grid
          container
          sx={{
            transition: "all 0.4s ease-in-out",
            height: "100%",
            zIndex: 99,
          }}
          columnGap={(theme) => theme.spacing(1)}
        >
          {steps && steps?.length > 0 && (
            <Grid
              item
              xs={12}
              sx={{
                position: "sticky",
                top: asDialog ? 0 : 11, // ensures it sticks to the top
                zIndex: asDialog ? 1100 : "inherit",
                backgroundColor: "var(--theme-color2)",
                boxShadow: asDialog
                  ? "0px 4px 6px rgba(0,0,0,0.1)"
                  : "0px 2px 4px rgba(0,0,0,0.05)",
                minHeight: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: "1px",
              }}
            >
              <TabStepper allTabsteps={steps} asDialog={asDialog} />
            </Grid>
          )}

          <Grid
            item
            xs
            sx={{
              "& .MuiGrid-root": { padding: "0px" },
              height: "calc(100% - 68px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: asDialog ? "15px" : "0px",
              }}
            >
              {isAcctDtlError ? (
                <Alert
                  severity={AcctDtlError?.severity ?? "error"}
                  errorMsg={AcctDtlError?.error_msg ?? "Something went wrong.."}
                  errorDetail={AcctDtlError?.error_detail}
                  color="error"
                />
              ) : validateAcctMutation.isError ? (
                <Alert
                  severity={validateAcctMutation.error?.severity ?? "error"}
                  errorMsg={
                    validateAcctMutation.error?.error_msg ??
                    "Something went wrong.."
                  }
                  errorDetail={validateAcctMutation.error?.error_detail}
                  color="error"
                />
              ) : saveAcctMutation.isError ? (
                <Alert
                  severity={saveAcctMutation.error?.severity ?? "error"}
                  errorMsg={
                    saveAcctMutation.error?.error_msg ??
                    "Something went wrong.."
                  }
                  errorDetail={saveAcctMutation.error?.error_detail}
                  color="error"
                />
              ) : modifyAcctMutation.isError ? (
                <Alert
                  severity={modifyAcctMutation.error?.severity ?? "error"}
                  errorMsg={
                    modifyAcctMutation.error?.error_msg ??
                    "Something went wrong.."
                  }
                  errorDetail={modifyAcctMutation.error?.error_detail}
                  color="error"
                />
              ) : (
                confirmMutation.isError && (
                  <Alert
                    severity={confirmMutation.error?.severity ?? "error"}
                    errorMsg={
                      confirmMutation.error?.error_msg ??
                      "Something went wrong.."
                    }
                    errorDetail={confirmMutation.error?.error_detail}
                    color="error"
                  />
                )
              )}
              {/* 🔹 Component Rendering */}
              {steps &&
                steps.length > 0 &&
                steps.map((element, i) => {
                  return (
                    <TabPanel
                      key={i}
                      value={AcctMSTState?.colTabValuectx}
                      index={i}
                    >
                      {getTabComp(element?.TAB_NAME)}
                    </TabPanel>
                  );
                })}
            </div>
          </Grid>
        </Grid>

        <RemarksAPIWrapper
          key={confirmAction}
          TitleText={`${confirmAction === "Y" ? t("Confirm") : t("Reject")} ${
            row?.REQ_FLAG_DISP
          } Account ${t("Req Code")} - ${row?.REQUEST_ID}`}
          onActionNo={() => {
            setIsOpen(false);
            setConfirmAction(null);
          }}
          defaultValue={`${
            confirmAction === "Y" ? t("APPROVED BY") : t("REJECTED BY")
          } ${authState?.user?.name?.toUpperCase() ?? ""} ON ${
            authState?.workingDate
          }`}
          onActionYes={(val, rows) => {
            //
            confirmMutation.mutate({
              REQUEST_CD: AcctMSTState?.req_cd_ctx ?? "",
              REMARKS: val ?? "",
              CONFIRMED: confirmAction,
            });
          }}
          isLoading={confirmMutation.isLoading || confirmMutation.isFetching}
          isEntertoSubmit={true}
          AcceptbuttonLabelText={`${
            confirmAction === "Y" ? t("Confirm") : t("Reject")
          }`}
          CanceltbuttonLabelText="Cancel"
          open={isOpen}
          rows={{}}
          isRequired={confirmAction === "Y" ? false : true}
          // isRequired={false}
        />
      </Box>
    </Box>
  );

  return asDialog ? (
    <Dialog fullScreen={true} open={true}>
      {dialogContent}
    </Dialog>
  ) : (
    <>
      {dialogContent}{" "}
      {openDilogue ? (
        <UpdateAuditDetail
          rowsData={row}
          isopen={openDilogue}
          onClose={() => setOpenDilogue(false)}
          openActionDialog={openActionDialog}
          confirmMutation={confirmMutation}
        />
      ) : null}
    </>
  );
};

export default AcctModal;
