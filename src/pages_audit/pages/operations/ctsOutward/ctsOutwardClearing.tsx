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
  CTSOutwardClearingFormMetaData,
  ctsOutwardChequeDetailFormMetaData,
  SlipJoinDetailGridMetaData,
  inwardReturnChequeDetailFormMetaData,
  InwardReturnFormMetaData,
} from "./metaData";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  AppBar,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Typography,
  Toolbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { AddNewBankMasterForm } from "./addNewBank";
import { useSnackbar } from "notistack";
import { RetrieveClearingForm } from "./retrieveClearing";
import { format } from "date-fns";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  Alert,
  GridWrapper,
  RemarksAPIWrapper,
  ActionTypes,
  queryClient,
  LoaderPaperComponent,
  usePopupContext,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import getDynamicLabel from "components/common/custom/getDynamicLabel";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { getdocCD } from "components/utilFunction/function";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: t("ViewDetail"),
    multiple: undefined,
    rowDoubleClick: true,
  },
  {
    actionName: "close",
    actionLabel: t("Close"),
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
const CtsOutwardClearingForm: FC<{
  zoneTranType: any;
}> = ({ zoneTranType }) => {
  const { t } = useTranslation();
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [formMode, setFormMode] = useState("new");
  const [isJointDtlExpand, setJointDtlExpand] = useState(false);
  const [isOpenAddBankForm, setOpenAddBankForm] = useState(false);
  const [isOpenRetrieve, setIsOpenRetrieve] = useState(false);
  const [chequeDtlRefresh, setChequeDtlRefresh] = useState(0);
  const [gridData, setGridData] = useState<any>([]);
  const [bankData, setBankData] = useState<any>({});
  const [chequeReqData, setChequeReqData] = useState<any>({});
  const [isDeleteRemark, SetDeleteRemark] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [chequeDetailData, setChequeDetailData] = useState<any>({
    chequeDetails: [{ ECS_USER_NO: "" }],
    SLIP_AMOUNT: "0",
  });
  const [zoneValue, setZoneValue] = useState<any>();
  const myFormRef: any = useRef(null);
  const myChequeFormRef: any = useRef(null);
  const slipFormDataRef: any = useRef(null);
  const finalReqDataRef: any = useRef(null);
  const retrieveDataRef: any = useRef(null);
  const acctDtlParaRef = useRef<any>(null);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const setCurrentAction = useCallback((data) => {
    if (data.name === "view-details") {
      setChequeDetailData((old) => {
        return {
          ...old,
          chequeDetails: [
            ...old.chequeDetails.map((item) => {
              return {
                ...item,
                ECS_USER_NO: data?.rows?.[0]?.data?.REF_PERSON_NAME ?? "",
              };
            }),
          ],
        };
      });
      setChequeDtlRefresh((old) => old + 1);
      // setIsSlipJointDetail(data?.rows?.[0]?.data?.REF_PERSON_NAME ?? "");
    }
  }, []);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getBussinessDate", formMode, zoneTranType], () =>
    API.getBussinessDate({
      SCREEN_REF: docCD,
    })
  );
  const { data: slipData, isLoading: isSlipLoading } = useQuery(
    ["getSlipNumber"],
    () =>
      API.getSlipNumber({
        TRAN_DT: format(new Date(data?.[0]?.TRAN_DATE ?? ""), "dd/MMM/yyyy"),
        TRAN_TYPE: zoneTranType,
        ZONE: zoneValue ?? "0   ",
      }),
    {
      enabled: Boolean(data?.[0]?.TRAN_DATE),
    }
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getBussinessDate", formMode]);
      queryClient.removeQueries(["getSlipNumber"]);
    };
  }, [formMode]);
  const getOutwardClearingData: any = useMutation(
    API.getOutwardClearingConfigData,
    {
      onSuccess: (data) => {
        // isDataChangedRef.current = true;
      },
      onError: (error: any) => {},
    }
  );

  const mutationOutward = useMutation(API.outwardClearingConfigDML, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      setGridData([]);
      setChequeDetailData({
        chequeDetails: [{ ECS_USER_NO: "" }],
        SLIP_AMOUNT: "0",
      });
      setChequeDtlRefresh(0);
      myFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      myChequeFormRef?.current?.handleFormReset({ preventDefault: () => {} });
      CloseMessageBox();
    },
  });
  const deleteMutation = useMutation(API.outwardClearingConfigDML, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
      SetDeleteRemark(false);
    },
    onSuccess: (data) => {
      // isDataChangedRef.current = true;
      enqueueSnackbar(t("RecordSuccessfullyDeleted"), {
        variant: "success",
      });
      setFormMode("new");
      CloseMessageBox();
      SetDeleteRemark(false);
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    //@ts-ignore
    endSubmit(true);
    let newData = [];
    if (Boolean(data?.chequeDetails) && Array.isArray(data?.chequeDetails)) {
      newData = data?.chequeDetails?.map((item) => ({
        ...item,
        _isNewRow: formMode === "new" ? true : false,
        BRANCH_CD: slipFormDataRef?.current?.BRANCH_CD,
        PROCESSED: "N",
        REASON: zoneTranType === "S" ? "N" : item?.REASON,
        CLEARING_STATUS: "C",
      }));
    }

    if (
      !Boolean(data?.SLIP_AMOUNT) ||
      parseFloat(data?.SLIP_AMOUNT ?? 0) <= 0
    ) {
      MessageBox({
        message: t("PleaseEnterSlipAmount"),
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
    } else if (
      parseFloat(data?.TOTAL_AMOUNT) === 0 &&
      newData &&
      newData.length > 0
    ) {
      finalReqDataRef.current = {
        DAILY_CLEARING: {
          ...slipFormDataRef?.current,
          _isNewRow: true,
          REQUEST_CD: "",
          TRAN_TYPE: zoneTranType,
        },
        DETAILS_DATA: {
          isNewRow: [...newData],
          isUpdatedRow: [],
          isDeleteRow: [],
        },
        ...slipFormDataRef?.current,
        PROCESSED: "N",
        SKIP_ENTRY: "N",
        _isNewRow: true,
        endSubmit,
      };
      const buttonName = await MessageBox({
        messageTitle: t("Confirmation"),
        message: t("ProceedGen"),
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        mutationOutward.mutate(finalReqDataRef.current);
      }
    } else if (
      parseFloat(data?.TOTAL_AMOUNT) > 0 &&
      Array.isArray(chequeDetailData?.chequeDetails) &&
      chequeDetailData?.chequeDetails?.length > 0 &&
      data?.chequeDetails?.length > 0
    ) {
      setChequeDetailData((old) => ({
        ...old,
        chequeDetails: [
          {
            ECS_USER_NO: data?.chequeDetails[0]?.ECS_USER_NO,
            ECS_SEQ_NO: "",
            CHEQUE_DATE: "",
          },

          ...data.chequeDetails,
        ],
      }));
      setChequeDtlRefresh((old) => old + 1);
    } else if (
      (parseFloat(data?.TOTAL_AMOUNT) > 0 || newData?.length,
      newData.length === 0)
    ) {
      setChequeDetailData((old) => ({
        chequeDetails: [
          {
            ECS_USER_NO: gridData?.ACCT_NAME ?? "",
            // CHEQUE_DATE: authState?.workingDate ?? "",
          },
        ],
        // chequeDetails: [
        //   ...old.chequeDetails.map((item) => {
        //     console.log("old", old);
        //     return {
        //       ...item,
        //     };
        //   }),
        // ],
      }));
      setChequeDtlRefresh((old) => old + 1);
    } else if (parseFloat(data?.TOTAL_AMOUNT) < 0) {
      MessageBox({
        message: t("PleaseCheckAmount"),
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
    }
  };
  const handleDisableButton = (data) => {
    setDisableButton(data); // Update the state directly
  };
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.ctrlKey && (event?.key === "R" || event?.key === "r")) {
        event.preventDefault();
        setIsOpenRetrieve(true);
      } else if (formMode === "view") {
        if (event.ctrlKey && (event?.key === "D" || event?.key === "d")) {
          event.preventDefault();
          if (
            retrieveDataRef.current?.CONFIRMED === "Y" &&
            authState?.role < "2"
          ) {
            await MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("CannotDeleteConfirmedTransaction"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
          } else if (
            new Date(retrieveDataRef.current?.TRAN_DT) <
            new Date(authState?.workingDate)
          ) {
            await MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("CannotDeleteBackDatedEntry"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
          } else {
            SetDeleteRemark(true);
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }, [formMode]);

  CTSOutwardClearingFormMetaData.form.label = getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );

  return (
    <Fragment>
      {!data ||
      !slipData ||
      isLoading ||
      isSlipLoading ||
      isFetching ||
      getOutwardClearingData.isLoading ? (
        // {isLoading || isFetching || getOutwardClearingData.isLoading ? (
        <div style={{ height: 100, paddingTop: 10 }}>
          <div style={{ padding: 10 }}>
            <LoaderPaperComponent />
          </div>
        </div>
      ) : (
        <>
          {(isError ||
            getOutwardClearingData?.isError ||
            deleteMutation.isError) && (
            <Alert
              severity="error"
              errorMsg={
                error?.error_msg ??
                getOutwardClearingData?.error?.error_msg ??
                deleteMutation?.error?.error_msg ??
                "Unknow Error"
              }
              errorDetail={
                error?.error_detail ??
                getOutwardClearingData?.error?.error_detail ??
                deleteMutation?.error?.error_detail ??
                ""
              }
              color="error"
            />
          )}
          <FormWrapper
            key={
              "CTSOutwardForm" +
              formMode +
              mutationOutward?.isSuccess +
              zoneTranType
            }
            metaData={
              extractMetaData(
                zoneTranType === "S"
                  ? CTSOutwardClearingFormMetaData
                  : InwardReturnFormMetaData,
                formMode
              ) as MetaDataType
            }
            initialValues={
              formMode === "new"
                ? {
                    TRAN_DT: data?.[0]?.TRAN_DATE ?? "",
                    ZONE_TRAN_TYPE: zoneTranType,
                    WORKING_DT: authState?.workingDate ?? "",
                    DISABLE_TRAN_DATE: data?.[0]?.DISABLE_TRAN_DATE,
                    DISABLE_BATCH_ID: data?.[0]?.DISABLE_BATCH_ID,
                    BATCH_ID: data?.[0]?.BATCH_ID ?? "",
                    SLIP_CD: slipData?.[0]?.SLIP_NO ?? "",
                  }
                : {
                    ...getOutwardClearingData.data?.[0],
                  }
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
              slipFormDataRef.current = data;
              if (action === "CHEQUEDTL") {
                let event: any = { preventDefault: () => {} };
                myChequeFormRef?.current?.handleSubmit(event, "FINAL");
              }
            }}
            setDataOnFieldChange={(action, payload) => {
              if (action === "API_REQ") {
                setChequeReqData(payload);
                setChequeDetailData((old) => {
                  return {
                    ...old,
                    chequeDetails: [
                      ...old.chequeDetails.map((item) => {
                        return {
                          ...item,
                          ECS_USER_NO: payload?.[0]?.ACCT_NM ?? "",
                        };
                      }),
                    ],
                  };
                });
              } else if (action === "ACCT_CD_VALID") {
                setJointDtlExpand(true);
                setGridData(payload);
                setChequeDtlRefresh((old) => old + 1);
              } else if (action === "ACCT_CD_BLANK") {
                setGridData([]);
                setChequeDetailData(() => ({
                  chequeDetails: [
                    {
                      ECS_USER_NO: "",
                    },
                  ],
                  SLIP_AMOUNT: "0",
                }));
                setChequeDtlRefresh((old) => old + 1);
                // setIsSlipJointDetail("");
              } else if (action === "AMOUNT") {
                setChequeDetailData((old) => ({
                  ...old,
                  SLIP_AMOUNT: payload,
                }));
                setChequeDtlRefresh((old) => old + 1);
                let event: any = { preventDefault: () => {} };
                myFormRef?.current?.handleSubmit(event);
              }
              if (action === "ACSHRTCTKEY_REQ") {
                acctDtlParaRef.current = payload;
              }
              if (action === "ZONE_VALUE") {
                setZoneValue(payload);
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
              ZONE_TRAN_TYPE: zoneTranType,
              MessageBox: MessageBox,
              handleDisableButton: handleDisableButton,
              docCD: docCD,
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "ACCT_TYPE",
                  BRANCH_CD: "BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            ref={myFormRef}
            // hideHeader={true}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {formMode === "new" ? (
                  <>
                    <GradientButton
                      onClick={() => {
                        setIsOpenRetrieve(true);
                      }}
                    >
                      {t("Retrieve")}
                    </GradientButton>
                    <GradientButton
                      onClick={() => {
                        let event: any = { preventDefault: () => {} };
                        myFormRef?.current?.handleSubmit(event, "CHEQUEDTL");
                      }}
                      endIcon={
                        mutationOutward?.isLoading ? (
                          <CircularProgress size={20} />
                        ) : null
                      }
                      disabled={isSubmitting || disableButton}
                    >
                      {t("Save")}
                    </GradientButton>
                  </>
                ) : formMode === "view" ? (
                  <>
                    <GradientButton
                      onClick={() => {
                        setIsOpenRetrieve(true);
                      }}
                    >
                      {t("Retrieve")}
                    </GradientButton>

                    <GradientButton
                      onClick={() => {
                        setFormMode("new");
                        setChequeDetailData(() => ({
                          chequeDetails: [
                            {
                              ECS_USER_NO: "",
                            },
                          ],
                          SLIP_AMOUNT: "0",
                        }));
                        refetch();
                      }}
                    >
                      {t("New")}
                    </GradientButton>

                    <GradientButton
                      onClick={async () => {
                        if (
                          retrieveDataRef.current?.CONFIRMED === "Y" &&
                          authState?.role < "2"
                        ) {
                          await MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message: t("CannotDeleteConfirmedTransaction"),
                            buttonNames: ["Ok"],
                            icon: "ERROR",
                          });
                        } else if (
                          new Date(retrieveDataRef.current?.TRAN_DT) <
                          new Date(authState?.workingDate)
                        ) {
                          await MessageBox({
                            messageTitle: t("ValidationFailed"),
                            message: t("CannotDeleteBackDatedEntry"),
                            buttonNames: ["Ok"],
                            icon: "ERROR",
                          });
                        } else {
                          SetDeleteRemark(true);
                        }
                      }}
                    >
                      {t("Delete")}
                    </GradientButton>
                  </>
                ) : null}
              </>
            )}
          </FormWrapper>

          {formMode === "new" ? (
            <Grid
              sx={{
                backgroundColor: "var(--theme-color2)",
                margin: "0px 0px 0px 10px",
                padding:
                  gridData?.ACCT_JOIN_DETAILS &&
                  gridData?.ACCT_JOIN_DETAILS?.length > 0
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
                sx={{ alignItems: "center", justifyContent: "space-between" }}
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
                </Typography>
                <IconButton
                  onClick={() => setJointDtlExpand(!isJointDtlExpand)}
                >
                  {!isJointDtlExpand ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Grid>
              <Collapse in={isJointDtlExpand}>
                <Grid item>
                  {gridData?.ACCT_JOIN_DETAILS &&
                  gridData?.ACCT_JOIN_DETAILS?.length > 0 ? (
                    <GridWrapper
                      key={
                        "JoinDetailGridMetaData" + mutationOutward?.isSuccess
                      }
                      finalMetaData={SlipJoinDetailGridMetaData}
                      data={gridData?.ACCT_JOIN_DETAILS ?? []}
                      setData={() => null}
                      actions={actions}
                      setAction={setCurrentAction}
                    />
                  ) : null}
                </Grid>
              </Collapse>
            </Grid>
          ) : null}
          <div
            onKeyDown={(e) => {
              let target: any = e?.target;
              const charAtIndex = target?.name
                ?.split("")
                .find((char, index) => {
                  return index === 39;
                });
              if (e?.key === "Enter" || e?.key === "Tab") {
                let metaData;
                if (zoneTranType === "S") {
                  metaData = ctsOutwardChequeDetailFormMetaData;
                } else if (zoneTranType === "R") {
                  metaData = inwardReturnChequeDetailFormMetaData;
                }
                if (
                  (target?.name ?? "") ===
                  metaData?.form?.name +
                    "/" +
                    metaData?.fields[9]?.name +
                    `[${charAtIndex}]` +
                    ".AMOUNT"
                ) {
                  let event: any = { preventDefault: () => {} };
                  myFormRef?.current?.handleSubmit(event, "CHEQUEDTL");
                }
              }
            }}
          >
            <FormWrapper
              key={`ChequeDetails` + chequeDtlRefresh + formMode + zoneTranType}
              metaData={
                extractMetaData(
                  zoneTranType === "S"
                    ? ctsOutwardChequeDetailFormMetaData
                    : zoneTranType === "R"
                    ? inwardReturnChequeDetailFormMetaData
                    : inwardReturnChequeDetailFormMetaData,
                  formMode
                ) as MetaDataType
              }
              displayMode={formMode}
              onSubmitHandler={onSubmitHandler}
              initialValues={
                formMode === "new"
                  ? {
                      ...chequeDetailData,
                      TRAN_DT: data?.[0]?.TRAN_DATE ?? "",
                      RANGE_DT: data?.[0]?.RANGE_FROM_DT ?? "",
                      CHQ_MICR_VISIBLE: data?.[0]?.CHQ_MICR_VISIBLE ?? "",
                      PAYEE_AC_MANDATORY: data?.[0]?.PAYEE_AC_MANDATORY ?? "",
                    }
                  : {
                      chequeDetails: getOutwardClearingData.data ?? "",
                    }
              }
              hideHeader={true}
              containerstyle={{ padding: "0px !important" }}
              setDataOnFieldChange={async (action, paylod) => {
                if (action === "MESSAGE") {
                  setOpenAddBankForm(true);
                  setBankData(paylod);
                }
              }}
              onFormButtonClickHandel={() => {
                let event: any = { preventDefault: () => {} };
                myChequeFormRef?.current?.handleSubmit(event);
                setChequeDtlRefresh((old) => old + 1);
                // myFormRef?.current?.handleSubmit(event, "CHEQUEDTL");
              }}
              ref={myChequeFormRef}
              formStyle={{
                height: "65%",
              }}
              formState={{
                REQ_DATA: chequeReqData,
                ZONE_TRAN_TYPE: zoneTranType,
                MessageBox: MessageBox,
                docCD: docCD,
              }}
            />
          </div>
          {isOpenAddBankForm ? (
            <AddNewBankMasterForm
              zoneTranType={zoneTranType}
              isOpen={isOpenAddBankForm}
              bankData={bankData}
              onClose={(flag, rowsData) => {
                if (flag === "save") {
                  setOpenAddBankForm(false);
                  setChequeDetailData((old) => {
                    return {
                      ...old,
                      chequeDetails: [
                        ...old.chequeDetails.map((item) => {
                          return {
                            ...item,
                            BANK_CD: rowsData?.[0]?.BANK_CD ?? "",
                            // CHEQUE_DATE: authState?.workingDate ?? "",
                          };
                        }),
                      ],
                    };
                  });
                  setChequeDtlRefresh((old) => old + 1);
                }
                setOpenAddBankForm(false);
              }}
            />
          ) : null}
          {isOpenRetrieve ? (
            <RetrieveClearingForm
              zoneTranType={zoneTranType}
              onClose={(flag, rowsData) => {
                setIsOpenRetrieve(false);
                if (flag === "action") {
                  retrieveDataRef.current = rowsData?.[0]?.data ?? "";
                  getOutwardClearingData.mutate({
                    TRAN_CD: rowsData?.[0]?.data?.TRAN_CD ?? "",
                    COMP_CD: rowsData?.[0]?.data?.ENTERED_COMP_CD ?? "",
                    BRANCH_CD: rowsData?.[0]?.data?.ENTERED_BRANCH_CD ?? "",
                    // TRAN_TYPE: zoneTranType,
                  });
                  setFormMode("view");
                }
              }}
              bussinesDateData={data}
            />
          ) : null}
          {isDeleteRemark && (
            <RemarksAPIWrapper
              TitleText={
                zoneTranType === "S"
                  ? t("EnterRemovalRemarksForCTSOWCLEARING", {
                      docCD: docCD,
                      interpolation: { escapeValue: false },
                    })
                  : t("EnterRemovalRemarksINWARDRETURNENTRY", {
                      docCD: docCD,
                      interpolation: { escapeValue: false },
                    })
              }
              onActionNo={() => SetDeleteRemark(false)}
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
                    DAILY_CLEARING: {
                      _isNewRow: false,
                      _isDeleteRow: true,
                      _isUpdateRow: false,
                      ENTERED_COMP_CD: retrieveDataRef.current?.ENTERED_COMP_CD,
                      ENTERED_BRANCH_CD:
                        retrieveDataRef.current?.ENTERED_BRANCH_CD,
                      TRAN_CD: retrieveDataRef.current?.TRAN_CD,
                      CONFIRMED: retrieveDataRef.current?.CONFIRMED,
                      ENTERED_BY: retrieveDataRef.current?.ENTERED_BY,
                    },
                    BRANCH_CD:
                      getOutwardClearingData.data?.[0]?.BRANCH_CD ?? "",
                    SR_CD: retrieveDataRef.current?.SR_NO,
                    ACCT_TYPE: getOutwardClearingData.data?.[0]?.ACCT_TYPE,
                    ACCT_CD: getOutwardClearingData.data?.[0]?.ACCT_CD,
                    AMOUNT: getOutwardClearingData.data?.[0]?.AMOUNT,
                    TRAN_DT: getOutwardClearingData.data?.[0]?.TRAN_DT,
                    TRAN_CD: retrieveDataRef.current?.TRAN_CD,
                    USER_DEF_REMARKS: val
                      ? val
                      : zoneTranType === "S"
                      ? "WRONG ENTRY FROM CTS O/W CLEARING (TRN/559)"
                      : "WRONG ENTRY FROM INWARD RETURN ENTRY (TRN/028)",

                    ACTIVITY_TYPE:
                      zoneTranType === "S"
                        ? "CTS OW CLEARING ENTRY SCREEN"
                        : "INWARD RETURN ENTRY SCREEN",
                    DETAILS_DATA: {
                      isNewRow: [],
                      isDeleteRow: [
                        {
                          TRAN_CD: retrieveDataRef.current?.TRAN_CD,
                        },
                      ],
                      isUpdatedRow: [],
                    },
                    _isDeleteRow: true,
                  });
                }
              }}
              // isLoading={crudLimitData?.isLoading}
              isEntertoSubmit={true}
              AcceptbuttonLabelText="Ok"
              CanceltbuttonLabelText="Cancel"
              open={isDeleteRemark}
              // rows={deleteDataRef.current}
              defaultValue={
                zoneTranType === "S"
                  ? "WRONG ENTRY FROM CTS O/W CLEARING (TRN/559)"
                  : "WRONG ENTRY FROM INWARD RETURN ENTRY (TRN/028)"
              }
              rows={undefined}
            />
          )}
        </>
      )}
    </Fragment>
  );
};

export const CtsOutwardClearingFormWrapper = ({ zoneTranType }) => {
  return (
    <ClearCacheProvider>
      <CtsOutwardClearingForm
        key={zoneTranType + "-CtsOutwardClearingForm"}
        zoneTranType={zoneTranType}
      />
    </ClearCacheProvider>
  );
};
