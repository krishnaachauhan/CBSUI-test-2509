import {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IFSCBankDetailGridMetaData,
  RtgsEntryFormMetaData,
  SlipJoinDetailGridMetaData,
  rtgsAccountDetailFormMetaData,
} from "./metaData";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  AppBar,
  Box,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
  IconButton,
  Collapse,
  Dialog,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSnackbar } from "notistack";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { AddNewBeneficiaryDetail } from "./addNewBeneficiaryAcDetail";
import { makeStyles } from "@mui/styles";
import { RetrieveClearingForm } from "./retrieveClearing";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useLocation } from "react-router-dom";
import {
  ColorlibStepIconRoot,
  ColorlibConnector,
  utilFunction,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { RemarksAPIWrapper } from "@acuteinfo/common-base";
import { usePopupContext, Alert, GridWrapper } from "@acuteinfo/common-base";
import {
  ActionTypes,
  LoaderPaperComponent,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import getDynamicLabel from "components/common/custom/getDynamicLabel";
import { Theme } from "@mui/system";
import { getdocCD } from "components/utilFunction/function";
import { DialogProvider } from "../payslip-issue-entry/DialogContext";

const actions: ActionTypes[] = [
  {
    actionName: "Close",
    actionLabel: t("Cancel"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  refreshiconhover: {},
}));
const RtgsEntryForm: FC<{}> = () => {
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myFormRef: any = useRef(null);
  const myBenFormRef: any = useRef(null);
  const finalReqDataRef: any = useRef(null);
  const retrieveDataRef: any = useRef(null);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const acctDtlParaRef = useRef<any>(null);
  const [beneficiaryDtlData, setBeneficiaryDtlData] = useState<any>({
    beneficiaryAcDetails: [{ AMOUNT: "", TO_ACCT_NO: "" }],
    ORDERING_AMOUNT: "0",
  });
  const [disableBtn, setDisableBtn] = useState(false);
  const [state, setState] = useState<any>({
    formMode: "new",
    isJointDtlExpand: false,
    gridData: [],
    beneficiaryDtlRefresh: 0,
    activeStep: 0,
    ifscGrid: false,
    isIfscCode: [],
    isIfscCdData: [],
    isOpenAddBeneficiaryAc: false,
    isOpenRetrieve: false,
    isDeleteRemark: false,
  });
  const {
    formMode,
    isJointDtlExpand,
    gridData,
    beneficiaryDtlRefresh,
    activeStep,
    ifscGrid,
    isIfscCode,
    isIfscCdData,
    isOpenAddBeneficiaryAc,
    isOpenRetrieve,
    isDeleteRemark,
  } = state;
  const [steps, setSteps] = useState<string[]>([
    t("NewRTGSEntry"),
    t("BeneficiaryACDetail"),
  ]);

  const [formData, setFormData] = useState<any>({});
  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "Close") {
      setState((old) => ({
        ...old,
        ifscGrid: false,
      }));
    }
  }, []);

  const getIfscBankGridData: any = useMutation(API.getIfscBankGridData, {
    onError: (error: any) => {
      let errorMsg = "UnknownErrorOccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },

    onSuccess: (data) => {},
  });
  const validateRtgsDetail: any = useMutation(API.validateRtgsDetail, {
    onError: (error: any) => {
      let errorMsg = "UnknownErrorOccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },

    onSuccess: (data, variables) => {},
  });
  const getRtgsOrderingData: any = useMutation(API.getRtgsOrderingData, {
    onSuccess: (data) => {},
    onError: (error: any) => {},
  });
  const getRtgsBenDetailData: any = useMutation(API.getRtgsBenDetailData, {
    onSuccess: (data) => {
      let sum = data
        ?.map((item) => Number(item?.AMOUNT))
        .reduce((acc, amount) => acc + amount, 0); // Sum the values
      let newData = data?.map((item, i) => ({
        ...item,
        FILED_HIDDEN: "Y",
        isOldRow: "Y",
      }));
      setBeneficiaryDtlData((old) => ({
        beneficiaryAcDetails: [...newData],
        ORDERING_AMOUNT: String(sum),
        BENIFICIARY_AMOUNT: String(sum),
      }));
    },
    onError: (error: any) => {},
  });

  const mutationRtgs = useMutation(API.getRtgsEntryDML, {
    onError: (error: any) => {
      let errorMsg = "UnknownErrorOccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (formMode === "edit") {
        enqueueSnackbar(t("RecordUpdatedSuccessfully"), {
          variant: "success",
        });
      } else {
        if (data?.[0]?.VOUCHER_MSG) {
          await MessageBox({
            messageTitle: t("VoucherConfirmation"),
            message: data?.[0]?.VOUCHER_MSG,
          });
        }
        if (data?.[0]?.UTR_MSG) {
          await MessageBox({
            messageTitle: t("UTRConfirmation"),
            message: data?.[0]?.UTR_MSG,
          });
        }
      }
      setState((old) => ({
        ...old,
        activeStep: 0,
        beneficiaryDtlRefresh: 0,
        formMode: "new",
      }));
      setFormData({});
      myFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      myBenFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      CloseMessageBox();
    },
  });

  const deleteMutation = useMutation(API.getRtgsEntryDML, {
    onError: (error: any) => {
      let errorMsg = "UnknownErrorOccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
      setState((old) => ({
        ...old,
        isDeleteRemark: false,
      }));
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("RecordSuccessfullyDeleted"), {
        variant: "success",
      });
      setState((old) => ({
        ...old,
        activeStep: 0,
        beneficiaryDtlRefresh: 0,
        isDeleteRemark: false,
        formMode: "new",
      }));
      setFormData({});
      myFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      myBenFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      CloseMessageBox();
    },
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && (event.key === "J" || event.key === "j")) {
        event.preventDefault();
        setState((old) => ({ ...old, isJointDtlExpand: true }));
      } else if (event.key === "Escape") {
        setState((old) => ({ ...old, isJointDtlExpand: false }));
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formMode]);

  function ColorlibStepIcon(props) {
    const { active, completed, className } = props;
    const icons: { [index: string]: React.ReactElement } = {
      1: <SettingsIcon />,
      2: <GroupAddIcon />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }
  const formatAmount = (value) => {
    return value ? String(parseFloat(value)) : "0";
  };
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    //@ts-ignore
    endSubmit(true);
    let benData = data;
    let newData: any = [];
    if (
      Boolean(data?.beneficiaryAcDetails) &&
      Array.isArray(data?.beneficiaryAcDetails)
    ) {
      let srCount = utilFunction.GetMaxCdForDetails(
        getRtgsBenDetailData?.data,
        "SR_CD"
      );
      newData = data?.beneficiaryAcDetails?.map((item, i) => ({
        ...item,
        BRANCH_CD: formData?.BRANCH_CD ?? "",
        COMP_CD: authState?.companyID ?? "",
        TO_ACCT_NO: item?.TO_ACCT_NO ?? "",
        DEF_TRAN_CD: formData?.DEF_TRAN_CD ?? "",
        _isNewRow: true,
        AMOUNT: formatAmount(item?.AMOUNT),
        SR_CD: item?.isOldRow === "Y" ? item?.SR_CD : srCount++,
      }));
    }
    newData.forEach((item) => {
      delete item.BENEFICIARY;
      delete item.IFSC;
      delete item.Address;
      delete item.FILED_HIDDEN;
      delete item.isOldRow;
      delete item._isNewRow;
    });
    validateRtgsDetail.mutate(
      {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: formData?.BRANCH_CD ?? "",
        ACCT_TYPE: formData?.ACCT_TYPE ?? "",
        ACCT_CD: formData?.ACCT_CD ?? "",
        ENTRY_TYPE: formData?.ENTRY_TYPE ?? "",
        TRAN_TYPE: formData?.TRAN_TYPE ?? "",
        DEF_TRAN_CD: formData?.DEF_TRAN_CD ?? "",
        BR_IFSC_CODE: formData?.BR_IFSCCODE,
        CHEQUE_NO: formData?.CHEQUE_NO ?? "",
        ACCT_NM: formData?.ACCT_NM ?? "",
        ADD1: formData?.ADD1 ?? "",
        CONTACT_INFO: formData?.CONTACT_INFO ?? "",
        AMOUNT: formData?.AMOUNT ?? "",
        RTGS_DTL_CLOB: [...newData],
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        SCREEN_REF: docCD ?? "",
      },
      {
        onSuccess: async (data, variables) => {
          for (let i = 0; i < data?.length; i++) {
            if (data[i]?.O_STATUS === "999") {
              await MessageBox({
                messageTitle: data[i]?.O_MSG_TITLE,
                message: data[i]?.O_MESSAGE,
                icon: "ERROR",
              });
            } else if (data[i]?.O_STATUS === "0") {
              if (
                parseFloat(benData?.TOTAL_AMOUNT) === 0 &&
                newData &&
                newData.length > 0
              ) {
                let updPara = utilFunction.transformDetailDataForDML(
                  getRtgsBenDetailData?.data ?? [],
                  newData ?? [],
                  ["SR_CD"]
                );
                if (updPara.isNewRow) {
                  updPara.isNewRow.forEach((item) => {
                    delete item.SR_CD;
                    delete item.TRAN_CD;
                  });
                }
                finalReqDataRef.current = {
                  ...formData,
                  ENTERED_COMP_CD:
                    getRtgsOrderingData?.data?.[0]?.ENTERED_COMP_CD ?? "",
                  ENTERED_BRANCH_CD:
                    getRtgsOrderingData?.data?.[0]?.ENTERED_BRANCH_CD ?? "",
                  TRAN_CD: getRtgsOrderingData?.data?.[0]?.TRAN_CD ?? "",
                  _isNewRow: formMode === "new" ? true : false,
                  COMP_CD: authState?.companyID ?? "",
                  SCREEN_REF: docCD ?? "",
                  DETAILS_DATA: {
                    ...updPara,
                  },
                  endSubmit,
                };
                endSubmit(true);
                const buttonName = await MessageBox({
                  messageTitle: t("Confirmation"),
                  message: t("ProceedGen"),
                  buttonNames: ["Yes", "No"],
                  loadingBtnName: ["Yes"],
                  defFocusBtnName: "Yes",
                  icon: "CONFIRM",
                });
                if (buttonName === "Yes") {
                  mutationRtgs.mutate(finalReqDataRef.current);
                }
              }
            }
          }
        },
      }
    );
  };

  return (
    <Fragment>
      {getRtgsOrderingData.isLoading || getRtgsBenDetailData?.isLoading ? (
        <div style={{ height: 100, paddingTop: 10 }}>
          <div style={{ padding: 10 }}>
            <LoaderPaperComponent />
          </div>
        </div>
      ) : (
        <>
          {(getRtgsOrderingData?.isError ||
            deleteMutation?.isError ||
            mutationRtgs?.isError ||
            validateRtgsDetail?.isError) && (
            <Alert
              severity="error"
              errorMsg={
                getRtgsOrderingData?.error?.error_msg ??
                deleteMutation?.error?.error_msg ??
                mutationRtgs?.error?.error_msg ??
                validateRtgsDetail?.error?.error_msg ??
                "Unknow Error"
              }
              errorDetail={
                getRtgsOrderingData?.error?.error_detail ??
                deleteMutation?.error?.error_detail ??
                mutationRtgs?.error?.error_detail ??
                validateRtgsDetail?.error?.error_detail ??
                ""
              }
              color="error"
            />
          )}
          <AppBar
            position="relative"
            color="secondary"
            style={{ marginBottom: "5px" }}
          >
            <Toolbar className={headerClasses.root} variant={"dense"}>
              <Typography
                className={headerClasses.title}
                color="inherit"
                variant={"h6"}
                component="div"
              >
                {formMode === "new"
                  ? utilFunction.getDynamicLabel(
                      currentPath,
                      authState?.menulistdata,
                      true
                    )
                  : utilFunction.getDynamicLabel(
                      currentPath,
                      authState?.menulistdata,
                      true
                    ) +
                    " " +
                    t("ConfirmStatus") +
                    " " +
                    "-" +
                    " " +
                    getRtgsOrderingData?.data?.[0]?.CONF_STATUS}
              </Typography>
              {formMode === "new" ? (
                <>
                  <GradientButton
                    onClick={() => {
                      setState((old) => ({
                        ...old,
                        isOpenRetrieve: true,
                      }));
                    }}
                  >
                    {t("Retrieve")}
                  </GradientButton>
                  {activeStep === 1 ? (
                    <>
                      <GradientButton
                        onClick={() => {
                          let event: any = { preventDefault: () => {} };
                          myBenFormRef?.current?.handleSubmit(event, "FINAL");
                        }}
                        endIcon={
                          validateRtgsDetail?.isLoading ? (
                            <CircularProgress size={20} />
                          ) : null
                        }
                        disabled={disableBtn}
                      >
                        {t("Save")}
                      </GradientButton>
                    </>
                  ) : null}
                </>
              ) : formMode === "view" ? (
                <>
                  <GradientButton
                    onClick={() => {
                      setState((old) => ({
                        ...old,
                        isOpenRetrieve: true,
                      }));
                    }}
                  >
                    {t("Retrieve")}
                  </GradientButton>
                  <GradientButton
                    onClick={async () => {
                      if (retrieveDataRef.current?.BR_CONFIRMED === "Y") {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("CannotModifyConfirmedTransaction"),
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else if (
                        !(
                          format(
                            new Date(retrieveDataRef.current?.TRAN_DT),
                            "dd/MMM/yyyy"
                          ) >=
                          format(
                            new Date(authState?.workingDate),
                            "dd/MMM/yyyy"
                          )
                        )
                      ) {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("CannotModifyBackDatedEntry"),
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else {
                        setState((old) => ({
                          ...old,
                          formMode: "edit",
                        }));
                      }
                    }}
                  >
                    {t("Edit")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setState((old) => ({
                        ...old,
                        activeStep: 0,
                        formMode: "new",
                      }));
                      setFormData({});
                      myFormRef?.current?.handleFormReset({
                        preventDefault: () => {},
                      });
                      myFormRef?.current?.handleFormClear({
                        preventDefault: () => {},
                      });
                      myBenFormRef?.current?.handleFormReset({
                        preventDefault: () => {},
                      });
                    }}
                  >
                    {t("New")}
                  </GradientButton>
                  <GradientButton
                    onClick={async () => {
                      if (retrieveDataRef.current?.BR_CONFIRMED === "Y") {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("CannotDeleteConfirmedTransaction"),
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else if (
                        !(
                          format(
                            new Date(retrieveDataRef.current?.TRAN_DT),
                            "dd/MMM/yyyy"
                          ) >=
                          format(
                            new Date(authState?.workingDate),
                            "dd/MMM/yyyy"
                          )
                        )
                      ) {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("CannotDeleteBackDatedEntry"),
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else {
                        setState((old) => ({
                          ...old,
                          isDeleteRemark: true,
                        }));
                      }
                    }}
                  >
                    {t("Delete")}
                  </GradientButton>
                </>
              ) : formMode === "edit" ? (
                <>
                  <GradientButton
                    onClick={() => {
                      setState((old) => ({
                        ...old,
                        isOpenRetrieve: true,
                      }));
                    }}
                  >
                    {t("Retrieve")}
                  </GradientButton>
                  {activeStep === 1 ? (
                    <>
                      <GradientButton
                        onClick={() => {
                          let event: any = { preventDefault: () => {} };
                          myBenFormRef?.current?.handleSubmit(event, "FINAL");
                        }}
                        endIcon={
                          validateRtgsDetail?.isLoading ? (
                            <CircularProgress size={20} />
                          ) : null
                        }
                        disabled={disableBtn}
                      >
                        {t("Save")}
                      </GradientButton>
                    </>
                  ) : null}
                  <GradientButton
                    onClick={() => {
                      setState((old) => ({
                        ...old,
                        formMode: "new",
                        activeStep: 0,
                      }));

                      setFormData({});
                      myFormRef?.current?.handleFormReset({
                        preventDefault: () => {},
                      });
                      myFormRef?.current?.handleFormClear({
                        preventDefault: () => {},
                      });
                      myBenFormRef?.current?.handleFormReset({
                        preventDefault: () => {},
                      });
                    }}
                  >
                    {t("New")}
                  </GradientButton>
                  <GradientButton
                    onClick={async () => {
                      if (retrieveDataRef.current?.BR_CONFIRMED === "Y") {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("CannotDeleteConfirmedTransaction"),
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else if (
                        !(
                          format(
                            new Date(retrieveDataRef.current?.TRAN_DT),
                            "dd/MMM/yyyy"
                          ) >=
                          format(
                            new Date(authState?.workingDate),
                            "dd/MMM/yyyy"
                          )
                        )
                      ) {
                        await MessageBox({
                          messageTitle: t("ValidationFailed"),
                          message: t("CannotDeleteBackDatedEntry"),
                          buttonNames: ["Ok"],
                          icon: "ERROR",
                        });
                      } else {
                        setState((old) => ({
                          ...old,
                          isDeleteRemark: true,
                        }));
                      }
                    }}
                  >
                    {t("Delete")}
                  </GradientButton>
                </>
              ) : null}
            </Toolbar>
          </AppBar>
          <Stack sx={{ width: "100%" }} spacing={4}>
            <Stepper
              alternativeLabel
              activeStep={activeStep}
              connector={<ColorlibConnector />}
            >
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconComponent={ColorlibStepIcon}
                    componentsProps={{
                      label: {
                        style: {
                          marginTop: "2px",
                          color: "var(--theme-color1)",
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <div style={{ marginTop: "0px" }}>
              {activeStep === 0 ? (
                <>
                  <FormWrapper
                    key={
                      "RtgsEntry" +
                      formMode +
                      mutationRtgs?.isSuccess +
                      formData
                    }
                    metaData={
                      extractMetaData(
                        RtgsEntryFormMetaData,
                        formMode
                      ) as MetaDataType
                    }
                    initialValues={
                      formMode === "new"
                        ? {
                            ...formData,
                          }
                        : { ...getRtgsOrderingData?.data?.[0], ...formData }
                    }
                    onSubmitHandler={async (
                      data: any,
                      displayData,
                      endSubmit,
                      setFieldError,
                      action
                    ) => {
                      //@ts-ignore
                      endSubmit(true);
                      delete data["ENABLE_DISABLE"];
                      delete data["TOTAL"];
                      if (Boolean(data["CHEQUE_DT"])) {
                        data["CHEQUE_DT"] = format(
                          new Date(data["CHEQUE_DT"]),
                          "dd/MMM/yyyy"
                        );
                      }
                      if (Boolean(data["TRAN_DT"])) {
                        data["TRAN_DT"] = format(
                          new Date(data["TRAN_DT"]),
                          "dd/MMM/yyyy"
                        );
                      }
                      let upd = utilFunction.transformDetailsData(
                        data,
                        getRtgsOrderingData?.data?.[0] ?? {}
                      );
                      setFormData({
                        ...upd,
                        ...data,
                        SCREEN_REF: docCD,
                      });
                      setState((old) => ({
                        ...old,
                        activeStep: old.activeStep + 1,
                      }));
                      if (formMode === "new") {
                        setBeneficiaryDtlData((old) => ({
                          beneficiaryAcDetails: [
                            { AMOUNT: "", TO_ACCT_NO: "" },
                          ],
                          ORDERING_AMOUNT: data?.AMOUNT,
                        }));
                        setState((old) => ({
                          ...old,
                          beneficiaryDtlRefresh: old.beneficiaryDtlRefresh + 1,
                        }));
                      } else {
                        setBeneficiaryDtlData((old) => ({
                          ...old,
                        }));
                      }
                    }}
                    setDataOnFieldChange={(action, payload) => {
                      if (action === "IFSC_DATA") {
                        setState((old) => ({
                          ...old,
                          isIfscCdData: payload,
                        }));
                      } else if (action === "JOINT_DETAIL") {
                        setState((old) => ({
                          ...old,
                          gridData: payload,
                        }));
                      } else if (action === "RTGS/NEFT") {
                        if (payload === "NEFT") {
                          setSteps([
                            t("NewNEFTEntry"),
                            t("BeneficiaryACDetail"),
                          ]);
                        } else {
                          setSteps([
                            t("NewRTGSEntry"),
                            t("BeneficiaryACDetail"),
                          ]);
                        }
                      }
                      if (action === "ACSHRTCTKEY_REQ") {
                        acctDtlParaRef.current = payload;
                      }
                    }}
                    //@ts-ignore
                    displayMode={formMode}
                    formStyle={{
                      background: "white",
                      width: "100%",
                      padding: "05px",
                    }}
                    formState={{
                      MessageBox: MessageBox,
                      docCD: docCD,
                      acctDtlReqPara: {
                        ACCT_CD: {
                          ACCT_TYPE: "ACCT_TYPE",
                          BRANCH_CD: "BRANCH_CD",
                          SCREEN_REF: docCD ?? "",
                        },
                      },
                      setDisableBtn: setDisableBtn,
                    }}
                    ref={myFormRef}
                    hideHeader={true}
                  />

                  {formMode === "new" ? (
                    <Grid
                      sx={{
                        backgroundColor: "var(--theme-color2)",
                        margin: "0px 0px 0px 10px",
                        padding:
                          gridData && gridData?.length > 0
                            ? isJointDtlExpand
                              ? "10px"
                              : "0px"
                            : "0px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: "20px",
                      }}
                      container
                      item
                      xs={11.8}
                      direction={"column"}
                    >
                      <Grid
                        container
                        item
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "var(--theme-color3)",
                            marginLeft: "15px",
                            marginTop: "6px",
                          }}
                          gutterBottom={true}
                          variant={"h6"}
                        >
                          {t("JointDetails")}
                          <Typography
                            sx={{
                              fontSize: "15px",
                              marginLeft: "20px",
                              display: "inline-block",
                            }}
                          >
                            {t("PressCtrlJToViewJointInformation")}
                          </Typography>
                        </Typography>

                        <IconButton
                          onClick={() => {
                            setState((old) => ({
                              ...old,
                              isJointDtlExpand: !old.isJointDtlExpand,
                            }));
                          }}
                        >
                          {!isJointDtlExpand ? (
                            <ExpandMoreIcon />
                          ) : (
                            <ExpandLessIcon />
                          )}
                        </IconButton>
                      </Grid>
                      <Collapse in={isJointDtlExpand}>
                        <Grid item>
                          {gridData && gridData?.length > 0 ? (
                            <GridWrapper
                              key={"JoinDetailGridMetaData"}
                              finalMetaData={SlipJoinDetailGridMetaData}
                              data={gridData ?? []}
                              setData={() => null}
                              actions={actions}
                              setAction={{}}
                            />
                          ) : null}
                        </Grid>
                      </Collapse>
                    </Grid>
                  ) : null}
                </>
              ) : activeStep === 1 ? (
                <>
                  <FormWrapper
                    key={
                      `BeneficiaryDetails` + formMode + beneficiaryDtlRefresh
                    }
                    metaData={
                      extractMetaData(
                        rtgsAccountDetailFormMetaData,
                        formMode
                      ) as MetaDataType
                    }
                    displayMode={formMode}
                    onSubmitHandler={onSubmitHandler}
                    initialValues={{ ...beneficiaryDtlData }}
                    hideHeader={true}
                    containerstyle={{ padding: "0px !important" }}
                    setDataOnFieldChange={async (action, paylod) => {
                      if (action === "IFSC_CD") {
                        setState((old) => ({
                          ...old,
                          isIfscCode: paylod,
                        }));
                      }
                    }}
                    onFormButtonClickHandel={(id) => {
                      if (id === "ADDNEWROW") {
                        let event: any = { preventDefault: () => {} };
                        myBenFormRef?.current?.handleSubmit(event, "FINAL");
                      } else if (
                        id.slice(id.indexOf(".") + 1) === "BENEFICIARY"
                      ) {
                        if (formData?.ACCT_CD.length === 0) {
                          MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message: t("PleaseEnterAcTypeForOrderingAcNo"),
                            icon: "ERROR",
                          });
                        } else {
                          setState((old) => ({
                            ...old,
                            isOpenAddBeneficiaryAc: true,
                          }));
                        }
                      } else if (id.slice(id.indexOf(".") + 1) === "IFSC") {
                        if (isIfscCode.length > 0) {
                          setState((old) => ({
                            ...old,
                            ifscGrid: true,
                          }));
                          getIfscBankGridData.mutate({
                            COMP_CD: authState?.companyID ?? "",
                            BRANCH_CD: authState?.user?.branchCode ?? "",
                            IFSC_CODE: isIfscCode ?? "",
                          });
                        }
                      }
                    }}
                    ref={myBenFormRef}
                    formState={{
                      MessageBox: MessageBox,
                      rtgsAcData: formData,
                      isIfscCdData: isIfscCdData.map((item) => {
                        return item?.VISIBLE_BNFCRY_YN;
                      }),
                      setDisableBtn: setDisableBtn,
                    }}
                  />
                  {/* </div> */}
                </>
              ) : null}
            </div>
            <Box
              sx={{
                display: "flex",
                margin: "3px 10px 0px 0px !important",
                justifyContent: "right",
                paddingBottom: "3px",
              }}
            >
              {activeStep === 0 ? null : (
                <GradientButton
                  tabIndex={-1}
                  onClick={() => {
                    setState((old) => ({
                      ...old,
                      activeStep: old.activeStep - 1,
                    }));
                  }}
                >
                  {t("Back")}
                </GradientButton>
              )}
              {activeStep !== steps.length && (
                <>
                  {activeStep !== steps.length - 1 ? (
                    <GradientButton
                      disabled={disableBtn}
                      onClick={(event) => {
                        formMode === "new" || "edit"
                          ? myFormRef?.current?.handleSubmit(event, "CHEQUEDTL")
                          : setState((old) => ({
                              ...old,
                              activeStep: old.activeStep + 1,
                            }));
                      }}
                    >
                      {t("Next")}
                    </GradientButton>
                  ) : null}
                </>
              )}
              {/* </div> */}
            </Box>
          </Stack>
          <>
            {ifscGrid ? (
              <Dialog
                open={true}
                PaperProps={{
                  style: {
                    width: "100%",
                  },
                }}
                maxWidth="lg"
              >
                {getIfscBankGridData?.isError && (
                  <Alert
                    severity="error"
                    errorMsg={
                      getIfscBankGridData?.error?.error_msg ??
                      "Somethingwenttowrong"
                    }
                    errorDetail={getIfscBankGridData?.error?.error_detail}
                    color="error"
                  />
                )}
                <GridWrapper
                  key={"IFSCBankDetailGridMetaData"}
                  finalMetaData={IFSCBankDetailGridMetaData}
                  data={getIfscBankGridData?.data ?? []}
                  setData={() => null}
                  actions={actions}
                  setAction={setCurrentAction}
                  loading={getIfscBankGridData?.isLoading}
                />
              </Dialog>
            ) : null}
          </>
          <>
            {isOpenAddBeneficiaryAc ? (
              <AddNewBeneficiaryDetail
                isOpen={true}
                onClose={() => {
                  setState((old) => ({
                    ...old,
                    isOpenAddBeneficiaryAc: false,
                  }));
                }}
                isBenAuditTrailData={formData}
                isRefresh={() => {
                  setState((old) => ({
                    ...old,
                    beneficiaryDtlRefresh: old.beneficiaryDtlRefresh + 1,
                  }));
                }}
              />
            ) : null}
            {isOpenRetrieve ? (
              <RetrieveClearingForm
                onClose={(flag, rowsData) => {
                  setState((old) => ({
                    ...old,
                    isOpenRetrieve: false,
                    activeStep: 0,
                  }));
                  retrieveDataRef.current = rowsData?.[0]?.data ?? "";
                  if (flag === "action") {
                    getRtgsOrderingData.mutate({
                      ENT_BRANCH_CD: authState?.user?.branchCode,
                      COMP_CD: rowsData?.[0]?.data?.COMP_CD ?? "",
                      BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD ?? "",
                      BRANCH_TRAN_CD: rowsData?.[0]?.data?.BRANCH_TRAN_CD ?? "",
                      FLAG_RTGSC: "",
                    });
                    getRtgsBenDetailData.mutate({
                      COMP_CD: rowsData?.[0]?.data?.COMP_CD ?? "",
                      BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD ?? "",
                      TRAN_CD: rowsData?.[0]?.data?.TRAN_CD,
                    });
                    setState((old) => ({
                      ...old,
                      formMode: "view",
                    }));
                  }
                  if (rowsData?.[0]?.data?.ENTRY_TYPE === "NEFT") {
                    setSteps([t("NewNEFTEntry"), t("BeneficiaryACDetail")]);
                  } else {
                    setSteps([t("NewRTGSEntry"), t("BeneficiaryACDetail")]);
                  }
                  // rowsData?.[0]?.data
                }}
              />
            ) : null}
            {isDeleteRemark && (
              <RemarksAPIWrapper
                TitleText={t("RemovalRemarksForRTGS", {
                  docCD: docCD,
                  interpolation: { escapeValue: false },
                })}
                onActionNo={() =>
                  setState((old) => ({
                    isDeleteRemark: false,
                  }))
                }
                onActionYes={async (val, rows) => {
                  const buttonName = await MessageBox({
                    messageTitle: t("Confirmation"),
                    message: t("DoYouWantDeleteRow"),
                    buttonNames: ["Yes", "No"],
                    defFocusBtnName: "Yes",
                    loadingBtnName: ["Yes"],
                    icon: "CONFIRM",
                  });
                  if (buttonName === "Yes") {
                    deleteMutation.mutate({
                      COMP_CD: retrieveDataRef.current?.COMP_CD,
                      ENTERED_COMP_CD: retrieveDataRef.current?.ENTERED_COMP_CD,
                      ENTERED_BRANCH_CD:
                        retrieveDataRef.current?.ENTERED_BRANCH_CD,
                      TRAN_CD: retrieveDataRef.current?.TRAN_CD,
                      ENTERED_BY: retrieveDataRef.current?.ENTERED_BY,
                      BRANCH_CD: getRtgsOrderingData.data?.[0]?.BRANCH_CD,
                      ACCT_TYPE: getRtgsOrderingData.data?.[0]?.ACCT_TYPE,
                      ACCT_CD: getRtgsOrderingData.data?.[0]?.ACCT_CD,
                      AMOUNT: getRtgsOrderingData.data?.[0]?.AMOUNT,
                      TRAN_DT: getRtgsOrderingData.data?.[0]?.TRAN_DT,
                      SLIP_NO: getRtgsOrderingData.data?.[0]?.SLIP_NO,
                      HO_CONFIRMED: getRtgsOrderingData.data?.[0]?.HO_CONFIRMED,
                      BR_CONFIRMED: getRtgsOrderingData.data?.[0]?.BR_CONFIRMED,
                      USER_DEF_REMARKS: val
                        ? val
                        : t("WrongEntry", {
                            docCD: docCD,
                            interpolation: { escapeValue: false },
                          }),

                      ACTIVITY_TYPE: t("RTGSNEFTOutward"),
                      DETAILS_DATA: {
                        isNewRow: [],
                        isDeleteRow: [...getRtgsBenDetailData?.data],
                        isUpdatedRow: [],
                      },
                      _isDeleteRow: true,
                    });
                  }
                }}
                isEntertoSubmit={true}
                AcceptbuttonLabelText="Ok"
                CanceltbuttonLabelText="Cancel"
                open={isDeleteRemark}
                defaultValue={t("WrongEntry552", {
                  docCD: docCD,
                  interpolation: { escapeValue: false },
                })}
                rows={undefined}
              />
            )}
          </>
        </>
      )}
    </Fragment>
  );
};

export const RtgsEntryFormWrapper = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <RtgsEntryForm key={"RtgsEntryForm"} />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
