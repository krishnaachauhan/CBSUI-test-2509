import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  extractGridMetaData,
  extractMetaData,
  FormWrapper,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  LoaderPaperComponent,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  Typography,
  IconButton,
  Collapse,
  Grid,
  AppBar,
  Toolbar,
  CircularProgress,
  Dialog,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { isBefore } from "date-fns";
import { t } from "i18next";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSnackbar } from "notistack";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as API from "../rtgsEntry/api";
import {
  IFSCBankDetailGridMetaData,
  RtgsEntryFormMetaData,
  SlipJoinDetailGridMetaData,
} from "../rtgsEntry/metaData";
import {
  getdocCD,
  handleDisplayMessages,
} from "components/utilFunction/function";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { Box } from "@mui/system";
import { BulkAccountDetailMetaData } from "./metaData";
import { Theme } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { RemarksAPIWrapper } from "@acuteinfo/common-base";
import { AddNewBeneficiaryDetail } from "../rtgsEntry/addNewBeneficiaryAcDetail";
import { RetrieveClearingForm } from "../rtgsEntry/retrieveClearing";
import ImportData from "./fileupload/importData";

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

const RtgsBulkEntryForm = () => {
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const navigate = useNavigate();
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();

  // Form Data
  const myFormRef: any = useRef(null);
  const formDataRef = useRef({});

  // Beneficiary Form Data
  const myBenFormRef = useRef<any>(null);
  const updatedGridDataRef = useRef<any>([]);

  // Final Request For Save
  const finalReqDataRef: any = useRef(null);

  // Retrieve Data
  const retrieveDataRef: any = useRef(null);

  // Account Details
  const acctDtlParaRef = useRef<any>(null);

  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const [beneficiaryDtlData, setBeneficiaryDtlData] = useState<any>({});

  const [updatedGridData, setUpdatedGridData] = useState<any>([]);
  updatedGridDataRef.current = updatedGridData;

  const [disableBtn, setDisableBtn] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [state, setState] = useState<any>({
    formMode: "new",
    isJointDtlExpand: false,
    gridData: [],
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
    ifscGrid,
    isIfscCode,
    isIfscCdData,
    isOpenAddBeneficiaryAc,
    isOpenRetrieve,
    isDeleteRemark,
  } = state;

  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "Close") {
      setState((old) => ({
        ...old,
        ifscGrid: false,
      }));
    }
  }, []);

  const verifymutation = useMutation(API.verifyButton, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      handleDisplayMessages(data, MessageBox);
    },
  });

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
      let sum = 0;
      const newData = data?.map((item) => {
        const amount = Number(item?.AMOUNT) || 0;
        sum += amount;
        return {
          ...item,
          FILED_HIDDEN: "Y",
          isOldRow: "Y",
        };
      });
      setBeneficiaryDtlData({
        beneficiaryAcDetails: newData,
        ORDERING_AMOUNT: String(sum),
        BENIFICIARY_AMOUNT: String(sum),
      });
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
            message: data?.[0]?.VOUCHER_MSG ?? "",
          });
        }
        if (data?.[0]?.UTR_MSG) {
          await MessageBox({
            messageTitle: t("UTRConfirmation"),
            message: data?.[0]?.UTR_MSG ?? "",
          });
        }
      }
      setState((old) => ({
        ...old,
        beneficiaryDtlRefresh: 0,
        formMode: "new",
      }));
      formDataRef.current = {};
      setUpdatedGridData([]);
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
        beneficiaryDtlRefresh: 0,
        isDeleteRemark: false,
        formMode: "new",
      }));
      formDataRef.current = {};
      setUpdatedGridData([]);
      myFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      myBenFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      CloseMessageBox();
    },
  });

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
    // @ts-ignore
    endSubmit(true);
    let benData = data;
    let newData: any = [];

    const dataForm = await myFormRef?.current?.getFieldData();
    let upd = utilFunction.transformDetailsData(
      dataForm,
      getRtgsOrderingData?.data?.[0] ?? {}
    );
    formDataRef.current = {
      ...upd,
      ...dataForm,
      SCREEN_REF: docCD,
    };

    const resolvedFormData = await formDataRef?.current;

    const beneficiaryBulkDtlData =
      formMode === "new"
        ? updatedGridDataRef?.current
        : beneficiaryDtlData?.beneficiaryAcDetails;

    const errorCount = beneficiaryBulkDtlData?.filter(
      (row) => row?.ERROR_FLAG === "Y"
    ).length;

    if (errorCount > 0) {
      await MessageBox({
        message: "ErroneousBulkImport",
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
    }

    if (
      Boolean(beneficiaryBulkDtlData) &&
      Array.isArray(beneficiaryBulkDtlData)
    ) {
      let srCount = utilFunction.GetMaxCdForDetails(
        getRtgsBenDetailData?.data,
        "SR_CD"
      );
      newData = beneficiaryBulkDtlData?.map((item, i) => ({
        ...item,
        BRANCH_CD: data?.BRANCH_CD ?? "",
        COMP_CD: authState?.companyID ?? "",
        TO_ACCT_NO: item?.TO_ACCT_NO ?? "",
        DEF_TRAN_CD: data?.DEF_TRAN_CD ?? "",
        _isNewRow: true,
        AMOUNT: formatAmount(item?.AMOUNT) ?? "",
        SR_CD: item?.isOldRow === "Y" ? item?.SR_CD : srCount++,
      }));
    }

    newData.forEach((item) => {
      delete item.isOldRow;
      delete item._isNewRow;
    });
    validateRtgsDetail.mutate(
      {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        ENTRY_TYPE: data?.ENTRY_TYPE ?? "",
        TRAN_TYPE: data?.TRAN_TYPE ?? "",
        DEF_TRAN_CD: data?.DEF_TRAN_CD ?? "",
        BR_IFSC_CODE: data?.BR_IFSCCODE,
        CHEQUE_NO: data?.CHEQUE_NO ?? "",
        ACCT_NM: data?.ACCT_NM ?? "",
        ADD1: data?.ADD1 ?? "",
        CONTACT_INFO: data?.CONTACT_INFO ?? "",
        AMOUNT: data?.AMOUNT ?? "",
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
                messageTitle: data[i]?.O_MSG_TITLE ?? "",
                message: data[i]?.O_MESSAGE,
                icon: "ERROR",
              });
            } else if (data[i]?.O_STATUS === "0") {
              if (newData && newData.length > 0) {
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
                  ...resolvedFormData,
                  ENTERED_COMP_CD:
                    getRtgsOrderingData?.data?.[0]?.ENTERED_COMP_CD ?? "",
                  ENTERED_BRANCH_CD:
                    getRtgsOrderingData?.data?.[0]?.ENTERED_BRANCH_CD ?? "",
                  TRAN_CD: getRtgsOrderingData?.data?.[0]?.TRAN_CD ?? "",
                  _isNewRow: formMode === "new" ? true : false,
                  COMP_CD: authState?.companyID ?? "",
                  SCREEN_REF: docCD ?? "",
                  FROM_FLAG: "B",
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

  const selectedDatas = async (dataObj) => {
    setBeneficiaryDtlData(dataObj);
    setUpdatedGridData(dataObj?.[0]?.FILE_DATA);
  };

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
  }, [navigate]);

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

  useEffect(() => {
    if (formMode === "new") {
      setBeneficiaryDtlData({});
      setUpdatedGridData([]);
    }
  }, [formMode]);

  const checking = useMemo(() => {
    const newMetadata = {
      ...RtgsEntryFormMetaData,
      form: { ...RtgsEntryFormMetaData.form, name: "Checking" },
    };
    return newMetadata;
  }, []);

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
                    "\u00A0" +
                    t("ConfirmStatus") +
                    "\u00A0" +
                    "-" +
                    "\u00A0" +
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
                  <GradientButton
                    onClick={(event) => {
                      myFormRef?.current?.handleSubmit(event, "SAVE");
                    }}
                    endIcon={
                      validateRtgsDetail?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    disabled={
                      !beneficiaryDtlData?.[0]?.FILE_DATA ||
                      Object.keys(beneficiaryDtlData?.[0]?.FILE_DATA).length ===
                        0
                    }
                  >
                    {t("Save")}
                  </GradientButton>
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
                        isBefore(
                          new Date(retrieveDataRef.current?.TRAN_DT),
                          new Date(authState?.workingDate)
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
                        formMode: "new",
                      }));
                      formDataRef.current = {};
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
                        isBefore(
                          new Date(retrieveDataRef.current?.TRAN_DT),
                          new Date(authState?.workingDate)
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
                  <GradientButton
                    onClick={(event) => {
                      myFormRef?.current?.handleSubmit(event, "SAVE");
                    }}
                    endIcon={
                      validateRtgsDetail?.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    {t("Save")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setState((old) => ({
                        ...old,
                        formMode: "new",
                      }));
                      formDataRef.current = {};
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
                        isBefore(
                          new Date(retrieveDataRef.current?.TRAN_DT),
                          new Date(authState?.workingDate)
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

          <FormWrapper
            key={"RtgsEntry12" + formMode + mutationRtgs?.isSuccess + checking}
            metaData={extractMetaData(checking, formMode) as MetaDataType}
            initialValues={
              formMode === "new"
                ? {
                    ...formDataRef?.current,
                    beneficiaryAcDetails:
                      beneficiaryDtlData?.[0]?.FILE_DATA ?? [],
                  }
                : {
                    ...getRtgsOrderingData?.data?.[0],
                    ...formDataRef?.current,
                    beneficiaryAcDetails:
                      beneficiaryDtlData?.beneficiaryAcDetails ?? [],
                  }
            }
            onSubmitHandler={onSubmitHandler}
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
              }
              if (action === "ACSHRTCTKEY_REQ") {
                acctDtlParaRef.current = payload;
              }
            }}
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
            <>
              <Grid
                sx={{
                  backgroundColor: "var(--theme-color2)",
                  margin: "0px 0px 10px 10px",
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

              <Box display="flex" alignItems="center" margin="10px">
                <GradientButton
                  onClick={() => setImportOpen(true)}
                  disabled={!acctDtlParaRef?.current}
                >
                  {t("Import")}
                </GradientButton>

                {isImportOpen && (
                  <ImportData
                    CloseFileUpload={(data) => {
                      handleDialogClose();
                      setImportOpen(false);
                    }}
                    refetchData={() => {}}
                    fromRef={myFormRef?.current?.getFieldData()}
                    selectedDatas={selectedDatas}
                  />
                )}
              </Box>
            </>
          ) : null}
          <GridWrapper
            key={`BeneficiaryDetails` + formMode + updatedGridData}
            finalMetaData={BulkAccountDetailMetaData as GridMetaDataType}
            data={
              (formMode === "new"
                ? updatedGridData
                : beneficiaryDtlData?.beneficiaryAcDetails) ?? []
            }
            setData={() => {}}
            loading={false}
            refetchData={() => {}}
            enableExport={false}
            onClickActionEvent={async (index, id, currentData) => {
              console.log("currentData: ", currentData);
              if (id === "VERIFY") {
                verifymutation.mutate({
                  ENTERED_COMP_CD: authState?.companyID ?? "",
                  ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
                  BRANCH_CD: acctDtlParaRef?.current?.BRANCH_CD ?? "",
                  ACCT_TYPE: acctDtlParaRef?.current?.ACCT_TYPE ?? "",
                  ACCT_CD: acctDtlParaRef?.current?.ACCT_CD ?? "",
                  TO_IFSCCODE: currentData?.TO_IFSCCODE ?? "",
                  TO_ACCT_NO: currentData?.TO_ACCT_NO ?? "",
                  TO_ACCT_NM: currentData?.TO_ACCT_NM ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  USERNAME: authState?.user?.id ?? "",
                  USERROLE: authState?.role ?? "",
                  MACHINE_NM: "",
                  SCREEN_REF: docCD ?? "",
                });
              }
              if (id === "ERROR") {
                if (currentData?.ERROR_FLAG === "Y") {
                  await MessageBox({
                    message: currentData?.ERROR_REMARKS ?? "",
                    messageTitle: t("ValidationFailed"),
                    icon: "ERROR",
                  });
                }
              }
              if (id === "DELETE") {
                if (currentData?.ERROR_FLAG === "Y") {
                  const btnName = await MessageBox({
                    message: "DeleteData",
                    messageTitle: "Confirmation",
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });

                  if (btnName === "Yes" && currentData?.SR_CD) {
                    const updatedData = updatedGridData?.filter(
                      (row) => row?.SR_CD !== currentData?.SR_CD
                    );
                    const reindexedData = updatedData?.map((row, index) => ({
                      ...row,
                      SR_CD: index + 1,
                    }));
                    setUpdatedGridData(reindexedData);
                  }
                }
              }
            }}
          />

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
                isBenAuditTrailData={formDataRef?.current}
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
                  }));
                  retrieveDataRef.current = rowsData?.[0]?.data ?? "";
                  if (flag === "action") {
                    getRtgsOrderingData.mutate({
                      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                      COMP_CD: rowsData?.[0]?.data?.COMP_CD ?? "",
                      BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD ?? "",
                      BRANCH_TRAN_CD: rowsData?.[0]?.data?.BRANCH_TRAN_CD ?? "",
                      FLAG_RTGSC: "",
                    });
                    getRtgsBenDetailData.mutate({
                      COMP_CD: rowsData?.[0]?.data?.COMP_CD ?? "",
                      BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD ?? "",
                      TRAN_CD: rowsData?.[0]?.data?.TRAN_CD ?? "",
                    });
                    setState((old) => ({
                      ...old,
                      formMode: "view",
                    }));
                  }
                }}
              />
            ) : null}
            {isDeleteRemark && (
              <RemarksAPIWrapper
                TitleText={t("RemovalRemarksForRTGS640", {
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
                      COMP_CD: retrieveDataRef.current?.COMP_CD ?? "",
                      ENTERED_COMP_CD:
                        retrieveDataRef.current?.ENTERED_COMP_CD ?? "",
                      ENTERED_BRANCH_CD:
                        retrieveDataRef.current?.ENTERED_BRANCH_CD ?? "",
                      TRAN_CD: retrieveDataRef.current?.TRAN_CD ?? "",
                      ENTERED_BY: retrieveDataRef.current?.ENTERED_BY ?? "",
                      BRANCH_CD: getRtgsOrderingData.data?.[0]?.BRANCH_CD ?? "",
                      ACCT_TYPE: getRtgsOrderingData.data?.[0]?.ACCT_TYPE ?? "",
                      ACCT_CD: getRtgsOrderingData.data?.[0]?.ACCT_CD ?? "",
                      AMOUNT: getRtgsOrderingData.data?.[0]?.AMOUNT ?? "",
                      TRAN_DT: getRtgsOrderingData.data?.[0]?.TRAN_DT ?? "",
                      SLIP_NO: getRtgsOrderingData.data?.[0]?.SLIP_NO ?? "",
                      HO_CONFIRMED:
                        getRtgsOrderingData.data?.[0]?.HO_CONFIRMED ?? "",
                      BR_CONFIRMED:
                        getRtgsOrderingData.data?.[0]?.BR_CONFIRMED ?? "",
                      USER_DEF_REMARKS: val
                        ? val
                        : t("WrongEntry640", {
                            docCD: docCD,
                            interpolation: { escapeValue: false },
                          }),

                      ACTIVITY_TYPE: t("RTGSNEFTBulkImport"),
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
                defaultValue={t("WrongEntry640", {
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

export const RtgsBulkEntryFormWrapper = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <RtgsBulkEntryForm />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
