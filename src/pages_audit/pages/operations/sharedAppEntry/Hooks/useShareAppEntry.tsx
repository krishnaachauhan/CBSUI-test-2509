import {
  GradientButton,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AcctMSTContext } from "../../acct-mst/AcctMSTContext";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import _, { isEmpty } from "lodash";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { Chip, Typography } from "@mui/material";
import { useDialogStyles } from "../../acct-mst/style";

const useShareAppEntry = () => {
  const [parametersData, setParametersData] = useState([]);
  const [reRenderKey, setReRenderKey] = useState(false);
  const isCallFinalSaveRef = React.useRef<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const classes = useDialogStyles();
  const row = location.state?.rows?.[0]?.data; // your row data
  const from = location?.state?.form;
  const formmode = location?.state?.formmode;

  const {
    handleColTabChangectx,
    handleApiRes,
    AcctMSTState,
    onFinalUpdatectx,
    handleCurrFormctx,
    handleFormModalClosectx,
    handleFromFormModectx,
    handleFormDataonRetrievectx,
    tabFormRefs,
    handleUpdateLoader,
    deepRemoveKeysIfExist,
  } = useContext(AcctMSTContext);

  //* parameter API
  const result = useQuery(
    ["getShareAppPara"],
    () =>
      API.getShareAppPara({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
      }),
    {
      onSuccess: (data) => {
        setParametersData(data);
      },
    }
  );

  const retrieveJointTabData = useMutation(API.getJointTabData);

  const formatAllTabData = async () => {
    const data = await retrieveJointTabData.mutateAsync({
      COMP_CD: row?.NEW_COMP_CD ?? "",
      BRANCH_CD: row?.NEW_BRANCH_CD ?? "",
      TRAN_CD: row?.TRAN_CD ?? "",
    });

    const tabData = {
      MAIN_DETAIL: row,
      JOINT_ACCOUNT_DTL: data,
    };

    handleFormDataonRetrievectx(tabData);
    handleColTabChangectx(0);
  };

  useEffect(() => {
    if (formmode === "view" && !isEmpty(row)) {
      formatAllTabData();
    }
    return () => {
      queryClient.removeQueries(["getShareAppPara"]);
    };
  }, [formmode, row]);

  const tabMappings = React.useMemo(
    () => [
      {
        TAB_NAME: "MAIN",
        ICON: "Home",
        TAB_DISPL_NAME: "Main",
        icon: "Home",
        isVisible: true,
      },
      {
        TAB_NAME: "APPLICATION_DETAIL",
        ICON: "",
        TAB_DISPL_NAME: "Application Detail",
        icon: "",
        isVisible: true,
      },
      {
        TAB_NAME: "JOINT",
        ICON: "Diversity3",
        TAB_DISPL_NAME: "Joint",
        icon: "Diversity3",
        isVisible: true,
      },
      {
        TAB_NAME: "NOMINEE",
        ICON: "",
        TAB_DISPL_NAME: "Nominee",
        icon: "",
        isVisible: true,
      },
      {
        TAB_NAME: "GUARDIAN",
        ICON: "FamilyRestroom",
        TAB_DISPL_NAME: "Guardian",
        icon: "FamilyRestroom",
        isVisible: true,
      },
      {
        TAB_NAME: "SIGNATORY",
        ICON: "",
        TAB_DISPL_NAME: "Signatory",
        icon: "",
        isVisible: true,
      },
      {
        TAB_NAME: "INTRODUCTOR",
        ICON: "",
        TAB_DISPL_NAME: "Introducer",
        icon: "",
        isVisible: true,
      },
    ],
    []
  );

  //* save entry API
  const saveShareApp: any = useMutation(API.accountSave, {
    onSuccess: async (data) => {
      if (data?.[0]?.TRAN_CD && !isNaN(data?.[0]?.TRAN_CD)) {
        onFinalUpdatectx(false);
        const buttonName = await MessageBox({
          messageTitle: "SUCCESS",
          message: `${t("YourApplicationNoIs")}  - ${
            parseInt(data?.[0]?.TRAN_CD) ?? ""
          }`,
          icon: "SUCCESS",
          buttonNames: ["Ok"],
        });
        if (buttonName === "Ok") {
          isCallFinalSaveRef.current = true;
          handleFormModalClosectx();
          setTimeout(() => {
            setReRenderKey((prev) => !prev);
          }, 100);
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

  //* validate entry
  const validateShareEntryMutation: any = useMutation(API.validateShareEntry, {
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
          saveShareApp.mutate(reqPara);
        }
      }
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

  const validateShareScreenApp = async () => {
    if (Object.keys(AcctMSTState.formDatactx).length > 0) {
      let buttonName = await MessageBox({
        messageTitle: "Confirmation",
        message: "AreYouSureToSaveTheData",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        let removedKeysJointData: any[] = [];
        if (AcctMSTState?.formDatactx["JOINT_HOLDER_DTL"]) {
          const jointTabs = [
            "JOINT_HOLDER_DTL",
            "JOINT_NOMINEE_DTL",
            "JOINT_GUARDIAN_DTL",
            "JOINT_GUARANTOR_DTL",
            "JOINT_HYPOTHICATION_DTL",
            "JOINT_SIGNATORY_DTL",
            "JOINT_INTRODUCTOR_DTL",
          ];
          let JointDetailsData: any[] = [];
          jointTabs.forEach((jointTab) => {
            if (Object.hasOwn(AcctMSTState?.formDatactx, jointTab)) {
              JointDetailsData = [
                ...JointDetailsData,
                ...AcctMSTState?.formDatactx?.[jointTab].map((item: any) => ({
                  ...item,
                  // ACTIVE_FLAG: "Y",
                  ACTIVE_FLAG:
                    item?.ACTIVE === true || item?.ACTIVE === "Y" ? "Y" : "N",
                })),
              ];
            }
          });
          console.log("JointDetailsData: ", JointDetailsData);
          removedKeysJointData = await deepRemoveKeysIfExist(
            JointDetailsData,
            "JOINT"
          );
        }
        let newRequest = {
          BRANCH_CD: authState?.user?.branchCode ?? "",
          COMP_CD: authState?.companyID ?? "",
          SCREEN_REF: docCD,
          WORKING_DATE: authState?.workingDate,
          MAIN_DATA: AcctMSTState?.formDatactx["MAIN_DETAIL"] ?? {},
          JOINT_DATA: [...removedKeysJointData],
          TRN_DATA: AcctMSTState?.formDatactx["TRANSFER_DTL"] ?? [],
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
          deepRemoveKeysIfExist: deepRemoveKeysIfExist,
        };

        validateShareEntryMutation.mutate(newRequest);
      } else {
        onFinalUpdatectx(false);
      }
    }
  };

  //* confirm or reject entry
  const confirmShareAppEntry: any = useMutation(API.confirmShareEntry, {
    onSuccess: async (data) => {
      if (data?.status === "999") {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: data?.message ?? "",
          icon: "ERROR",
        });
      } else {
        enqueueSnackbar("success", { variant: "success" });
        CloseMessageBox();
        const segments = location?.pathname?.split("/");
        segments.pop();
        const basePath = segments.join("/");
        navigate(basePath, { state: { fromClose: true } });
      }
    },
    onError: () => {
      CloseMessageBox();
    },
  });

  const handleConfirmEntry = async ({ isConfirmed }) => {
    const finalConfirm = await MessageBox({
      messageTitle: "Confirmation",
      message: isConfirmed ? "AreYouSureToConfirm" : "AreYouSureToReject",
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });
    if (finalConfirm === "Yes") {
      confirmShareAppEntry.mutate({
        isConfirmed: isConfirmed,
        NEW_COMP_CD: row?.NEW_COMP_CD || "",
        NEW_BRANCH_CD: row?.NEW_BRANCH_CD || "",
        TRAN_CD: row?.TRAN_CD || "",
        MODE_PAYMENT: row?.MODE_PAYMENT || "",
      });
    } else {
      CloseMessageBox();
    }
  };

  useEffect(() => {
    // handleApiRes(tabMappings);
    // handleColTabChangectx(0);

    if (parametersData?.length > 0) {
      const combinedTabParaData = tabMappings?.map((item) => ({
        ...item,
        ...(typeof parametersData?.[0] === "object" &&
        parametersData?.[0] !== null
          ? parametersData[0]
          : {}),
        VISIBLE_TRADE_INFO: "Y",
        SCREEN_FLAG: "S",
        LF_NO: "Minor/Major",
      }));

      handleApiRes(combinedTabParaData);
      handleColTabChangectx(0);
      if (formmode !== "view") {
        handleFromFormModectx({
          formmode: "new",
          from: "new-entry",
        });
      }
    }
  }, [parametersData, reRenderKey, formmode]);

  const label = utilFunction.getDynamicLabel(
    useLocation().pathname,
    authState?.menulistdata,
    true
  );

  //* final save
  const updateData = _.throttle(
    async (e) => {
      const prevTabIndex = AcctMSTState?.colTabValuectx;
      const prevTabRef = tabFormRefs.current[prevTabIndex];

      if (Array?.isArray(prevTabRef)) {
        handleUpdateLoader(false);

        const results = await Promise?.all(
          prevTabRef?.map((ref) =>
            ref && ref?.handleSubmit
              ? ref?.handleSubmit(e, "UpdateData")
              : Promise?.resolve(true)
          )
        );
        const isErrorPresent = results?.some(
          (item) => item === null || item?.hasError === true
        );
        if (isErrorPresent) return;
        handleUpdateLoader(false);
      } else if (prevTabRef && prevTabRef.handleSubmit) {
        if (prevTabRef?.handleSubmit?.name === "handleSave") {
          prevTabRef.handleSubmit(e, "UpdateData");
        } else {
          prevTabRef.handleSubmit(e, "UpdateData", false);
        }
      }
    },
    2000,
    { leading: true, trailing: false }
  );

  const ActionBTNs = useMemo(() => {
    return AcctMSTState?.formmodectx == "view"
      ? AcctMSTState?.fromctx &&
          AcctMSTState?.fromctx === "confirmation-entry" && (
            <Fragment>
              <GradientButton
                onClick={() => handleConfirmEntry({ isConfirmed: true })}
                color="primary"
                disabled={confirmShareAppEntry?.isLoading}
              >
                {t("Confirm")}
              </GradientButton>
              <GradientButton
                onClick={() => handleConfirmEntry({ isConfirmed: false })}
                color="primary"
                disabled={confirmShareAppEntry?.isLoading}
              >
                {t("Reject")}
              </GradientButton>
            </Fragment>
          )
      : AcctMSTState?.formmodectx === "new" && (
          <GradientButton
            onClick={updateData}
            color="primary"
            //TODO
            disabled={saveShareApp?.isLoading}
          >
            {t("Save")}
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

  const screenHeader = () => {
    return (
      <>
        <Typography
          className={classes.title}
          color="inherit"
          variant={"h6"}
          component="div"
        >
          {label}
        </Typography>
        {Boolean(AcctMSTState?.formmodectx) && (
          <Chip
            style={{ color: "white", marginLeft: "8px" }}
            variant="outlined"
            color="primary"
            size="small"
            label={`${AcctMSTState?.formmodectx} mode`}
          />
        )}
        {ActionBTNs}
      </>
    );
  };

  const isError =
    saveShareApp?.isError ||
    result?.isError ||
    confirmShareAppEntry?.isError ||
    validateShareEntryMutation?.isError;

  const error =
    saveShareApp?.error ||
    result?.error ||
    confirmShareAppEntry?.error ||
    validateShareEntryMutation?.error;

  return {
    location,
    isError,
    error,
    retrieveJointTabData,
    isCallFinalSaveRef,
    tabMappings,
    validateShareScreenApp,
    screenHeader,
    result,
  };
};

export default useShareAppEntry;
