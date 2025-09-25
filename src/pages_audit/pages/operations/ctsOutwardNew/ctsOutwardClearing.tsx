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
  SlipJoinDetailGridMetaData,
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
  getGridRowData,
} from "@acuteinfo/common-base";
import getDynamicLabel from "components/common/custom/getDynamicLabel";
import { grid, Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { getdocCD } from "components/utilFunction/function";
import CtsOutWardTable from "./ctsOutwardTable";
import { isEmpty } from "lodash";
import { CUSTOM_DATE_FORMAT } from "components/utilFunction/constant";
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
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [zoneValue, setZoneValue] = useState<any>();
  const myFormRef: any = useRef(null);
  const myChequeFormRef: any = useRef(null);
  const slipFormDataRef: any = useRef(null);
  const finalReqDataRef: any = useRef(null);
  const retrieveDataRef: any = useRef(null);
  const gridApi: any = useRef(null);
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
      onSuccess: (data) => {},
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

  const submitHandler = async (
    formData: any,
    gridData: any,
    context: any,
    totalAmount: any,
    totalPendingAmount: any,
    node: any
  ) => {
    //@ts-ignore
    let newData = [];
    if (
      Boolean(chequeDetailData.chequeDetails[0]?.ECS_USER_NO) &&
      Array.isArray(chequeDetailData.chequeDetails)
    ) {
      newData = gridData?.map(({ errors = [], ...item }) => ({
        ...item,
        _isNewRow: formMode === "new" ? true : false,
        BRANCH_CD: slipFormDataRef?.current?.BRANCH_CD,
        PROCESSED: "N",
        REASON: zoneTranType === "S" ? "N" : item?.REASON,
        CLEARING_STATUS: "C",
      }));
    }

    if (gridData.some((row) => row.errors && row.errors.length > 0)) {
      context?.MessageBox({
        message: "Please enter required field",
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
      return;
    }

    if (!Boolean(formData?.AMOUNT) || parseFloat(formData?.AMOUNT ?? 0) <= 0) {
      context?.MessageBox({
        message: t("PleaseEnterSlipAmount"),
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
    } else if (
      newData &&
      newData.length > 0 &&
      parseFloat(totalAmount) === parseFloat(formData.AMOUNT)
    ) {
      finalReqDataRef.current = {
        DAILY_CLEARING: {
          ...slipFormDataRef?.current,
          TRAN_DT: slipFormDataRef?.current?.TRAN_DT
            ? format(
                new Date(slipFormDataRef?.current?.TRAN_DT),
                CUSTOM_DATE_FORMAT.APP_DATE_FORMAT
              )
            : undefined,
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
        TRAN_DT: slipFormDataRef?.current?.TRAN_DT
          ? format(
              new Date(slipFormDataRef?.current?.TRAN_DT),
              CUSTOM_DATE_FORMAT.APP_DATE_FORMAT
            )
          : undefined,
        PROCESSED: "N",
        SKIP_ENTRY: "N",
        _isNewRow: true,
        // endSubmit,
      };
      const buttonName = await context?.MessageBox({
        messageTitle: t("Confirmation"),
        message: t("ProceedGen"),
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes") {
        mutationOutward.mutate(finalReqDataRef.current);
        gridApi.current.setGridOption(
          "rowData",
          data?.map((item) => ({
            ...item,
            TRAN_DT: data?.[0]?.TRAN_DATE ?? "",
            RANGE_DT: data?.[0]?.RANGE_FROM_DT ?? "",
            CHQ_MICR_VISIBLE: data?.[0]?.CHQ_MICR_VISIBLE ?? "",
            PAYEE_AC_MANDATORY: data?.[0]?.PAYEE_AC_MANDATORY ?? "",
            CHQ_MICR_CD: 10,
          }))
        );
        gridApi.current.setGridOption("pinnedBottomRowData", []);
      }
      return;
    } else if (
      parseFloat(formData?.AMOUNT) > 0 &&
      Array.isArray(chequeDetailData?.chequeDetails) &&
      chequeDetailData?.chequeDetails?.length > 0 &&
      formData?.chequeDetails?.length > 0
    ) {
      setChequeDetailData((old) => ({
        ...old,
        chequeDetails: [
          {
            ECS_USER_NO: formData?.chequeDetails[0]?.ECS_USER_NO,
            ECS_SEQ_NO: "",
            CHEQUE_DATE: "",
          },

          ...formData.chequeDetails,
        ],
      }));
      setChequeDtlRefresh((old) => old + 1);
    } else if (
      parseFloat(formData?.AMOUNT) > 0 &&
      newData?.length &&
      newData.length === 0
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
        //
        //     return {
        //       ...item,
        //     };
        //   }),
        // ],
      }));
      setChequeDtlRefresh((old) => old + 1);
    } else if (totalPendingAmount < 0) {
      context?.MessageBox({
        message: t("PleaseCheckAmount"),
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });

      return;
    }
  };

  const handleCustomCellKeyDown = useCallback(
    async (params, lastColumn) => {
      const {
        event,
        column: { colDef },
        api,
        node,
        value,
        context,
      } = params;
      if (isEmpty(node.data?.ECS_USER_NO)) {
        await node.setDataValue(
          "ECS_USER_NO",
          chequeDetailData?.chequeDetails[0]?.ECS_USER_NO
        );
        await api.refreshCells({ rowNodes: [node], columns: ["ECS_USER_NO"] });
      }
      if (colDef.field === lastColumn.colDef?.field) {
        const data = await myFormRef.current?.getFieldData();
        const gridData = getGridRowData(gridApi);
        let totalAmount = 0;
        let totalSlipAmount = parseFloat(data?.AMOUNT ?? 0);

        gridApi.current.forEachNode((node) => {
          totalAmount += parseFloat(node.data?.AMOUNT ?? 0);
        });
        const totalPendingAmount = totalSlipAmount - totalAmount;

        if (totalAmount >= totalSlipAmount) {
          await submitHandler(
            data,
            gridData,
            context,
            totalAmount,
            totalPendingAmount,
            node
          );
          return true;
        }
        return false;
      }
    },
    [chequeDetailData]
  );
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
              gridApi: gridApi,
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
          <div>
            <CtsOutWardTable
              gridApi={gridApi}
              defaultView={formMode}
              formState={myFormRef}
              authState={authState}
              setOpenAddBankForm={setOpenAddBankForm}
              setBankData={setBankData}
              data={data}
              getOutwardClearingData={getOutwardClearingData}
              handleCustomCellKeyDown={handleCustomCellKeyDown}
              setCurrentRowIndex={setCurrentRowIndex}
              zoneTranType={zoneTranType}
              chequeReqData={chequeReqData}
            />
          </div>
          {isOpenAddBankForm ? (
            <AddNewBankMasterForm
              docCD={docCD}
              zoneTranType={zoneTranType}
              isOpen={isOpenAddBankForm}
              bankData={bankData}
              onClose={async (flag, rowsData) => {
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
                  const updatedRowData =
                    gridApi.current.getDisplayedRowAtIndex(
                      currentRowIndex
                    ).data;
                  updatedRowData.BANK_CD = rowsData[0].BANK_CD;
                  updatedRowData.BANK_NM = rowsData[0].BANK_NM;
                  await gridApi.current.applyTransaction({
                    update: [updatedRowData],
                  });
                  await gridApi.current.setFocusedCell(
                    currentRowIndex,
                    "ECS_SEQ_NO"
                  );
                  await gridApi.current.startEditingCell({
                    rowIndex: currentRowIndex,
                    colKey: "ECS_SEQ_NO",
                  });
                } else {
                  const updatedRowData =
                    gridApi.current.getDisplayedRowAtIndex(
                      currentRowIndex
                    ).data;
                  updatedRowData.BANK_CD = "";
                  updatedRowData.BANK_NM = "";
                  await gridApi.current.applyTransaction({
                    update: [updatedRowData],
                  });
                  await gridApi.current.setFocusedCell(
                    currentRowIndex,
                    "BANK_CD"
                  );
                  await gridApi.current.startEditingCell({
                    rowIndex: currentRowIndex,
                    colKey: "BANK_CD",
                  });
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
