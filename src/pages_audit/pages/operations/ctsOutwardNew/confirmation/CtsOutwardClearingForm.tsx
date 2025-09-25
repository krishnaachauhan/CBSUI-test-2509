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
  CTSOutwardClearingConfirmMetaData,
  DualConfHistoryGridMetaData,
  ctsOutwardChequeDetailConfirmMetaData,
  inwardReturnChequeDetailConfirmMetaData,
} from "./ConfirmationMetadata";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  AppBar,
  Collapse,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { ChequeSignImage } from "../../inwardClearing/inwardClearingForm/chequeSignImage";
import { Box } from "@mui/system";
import { t } from "i18next";
import {
  RemarksAPIWrapper,
  usePopupContext,
  GridWrapper,
  Alert,
  LoaderPaperComponent,
  ActionTypes,
  queryClient,
  ClearCacheProvider,
  FormWrapper,
  MetaDataType,
  GradientButton,
  extractMetaData,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import CtsOutWardTable from "../ctsOutwardTable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getAccountSlipJoinDetail } from "../api";
import { SlipJoinDetailGridMetaData } from "../metaData";
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
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: t("Close"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const CtsOutwardAndInwardReturnConfirm: FC<{
  zoneTranType: any;
  formMode?: any;
  rowsData?: any;
  onClose?: any;
  isDataChangedRef?: any;
  handlePrev?: any;
  handleNext?: any;
  currentIndex?: number;
  totalData?: number;
  formLabel?: any;
  chequeMicrVisible?: any;
}> = ({
  zoneTranType,
  formMode,
  rowsData,
  onClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndex,
  totalData,
  formLabel,
  chequeMicrVisible,
}) => {
  const { authState } = useContext(AuthContext);
  const headerClasses = useTypeStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isDeleteRemark, SetDeleteRemark] = useState(false);
  const [isChequeSign, setIsChequeSign] = useState<any>(false);
  const [isConfHistory, setIsConfHistory] = useState<any>(false);
  const [isJointDtlExpand, setJointDtlExpand] = useState(false);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { data, isLoading, isFetching, isError, error } = useQuery<any, any>(
    ["getOutwardConfirmViewDetailData", rowsData?.TRAN_CD],
    () =>
      API.getOutwardConfirmViewDetailData({
        TRAN_CD: rowsData?.TRAN_CD,
        ENTERED_COMP_CD: rowsData?.ENTERED_COMP_CD ?? "",
        ENTERED_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD ?? "",
        TRAN_TYPE: zoneTranType,
      })
  );

  const { data: gridData, mutate }: any = useMutation(
    "getAccountSlipJoinDetail",
    getAccountSlipJoinDetail
  );

  useEffect(() => {
    if (data?.length > 0) {
      let Apireq = {
        COMP_CD: authState?.companyID,
        ACCT_CD: data?.[0]?.ACCT_CD,
        ACCT_TYPE: data?.[0]?.ACCT_TYPE,
        BRANCH_CD: data?.[0]?.BRANCH_CD,
        GD_TODAY_DT: authState?.workingDate,
        SCREEN_REF: docCD,
      };
      mutate(Apireq);
    }
  }, [data]);

  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      setIsConfHistory(false);
    }
  }, []);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getOutwardConfirmViewDetailData"]);
    };
  }, []);
  const mutation: any = useMutation(
    "getInwardChequeSignFormData",
    API.getInwardChequeSignFormData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );
  const confHistory: any = useMutation(
    "getConfirmHistoryData",
    API.getConfirmHistoryData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );
  const confirmation: any = useMutation("ctsConfirmtion", API.ctsConfirmtion, {
    onSuccess: async (data) => {
      if (data[0]?.STATUS === "999") {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: data[0]?.MSG,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
      } else if (data[0]?.STATUS === "0") {
        enqueueSnackbar("success", {
          variant: "success",
        });
        isDataChangedRef.current = true;
        onClose();
      }
      CloseMessageBox();
    },
    onError: (error: any) => {
      CloseMessageBox();
    },
  });
  const outWardAndInwardconfirmation: any = useMutation(
    "outWardAndInwardConfirmtion",
    API.outWardAndInwardConfirmtion,
    {
      onSuccess: async (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });
        isDataChangedRef.current = true;
        onClose();
        CloseMessageBox();
      },
      onError: (error: any) => {
        CloseMessageBox();
      },
    }
  );
  const deleteMutation: any = useMutation(API.outwardClearingConfigDML, {
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
      isDataChangedRef.current = true;
      onClose();
      CloseMessageBox();
      SetDeleteRemark(false);
    },
  });

  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.ctrlKey && (event.key === "D" || event.key === "d")) {
        event.preventDefault();
        if (rowsData?.CONFIRMED === "Y" && authState?.role < "2") {
          await MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("CannotDeleteConfirmedTransaction"),
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else if (
          new Date(rowsData?.TRAN_DT) < new Date(authState?.workingDate)
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
    };
    document.addEventListener("keydown", handleKeyDown);
  }, []);
  const gridApi = useRef();
  const formRef = useRef();
  return (
    <Fragment>
      <>
        <Dialog
          open={true}
          PaperProps={{
            style: {
              // width: "100%",
              maxWidth: "90vw",
              overflowY: "hidden",
            },
          }}
          fullWidth
        >
          <AppBar
            position="sticky"
            sx={{
              height: "auto",
              background: "var(--theme-color5)",
              margin: "10px",
              width: "auto",
            }}
          >
            <Toolbar>
              <Typography
                variant="h6"
                style={{ flexGrow: 1 }}
                sx={{
                  fontWeight: 700,
                  color: "var(--theme-color2)",
                  fontSize: "1.2rem",
                }}
              >
                {formLabel + " " + t("SrNo") + " :- " + (rowsData?.SR_NO ?? "")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <GradientButton
                  disabled={
                    data?.[0]?.CONFIRMBUTTON === "Y" || isLoading || isFetching
                  }
                  onClick={async () => {
                    if (authState?.user?.id === data?.[0]?.ENTERED_BY) {
                      await MessageBox({
                        messageTitle: t("InvalidConfirmation"),
                        message: t("ConfirmRestrictMsg"),
                        buttonNames: ["Ok"],
                        icon: "ERROR",
                      });
                    } else {
                      const buttonName = await MessageBox({
                        messageTitle: t("Confirmation"),
                        message:
                          zoneTranType === "R" || zoneTranType === "W"
                            ? "Return Reason(s):" +
                              "\n" +
                              data?.[0]?.REASON_CODE_DESCRIPTION +
                              "\n" +
                              t(
                                t("DoYouWantToAllowTheTransaction") +
                                  " - " +
                                  "Slip No." +
                                  data?.[0]?.SLIP_CD +
                                  " " +
                                  "?"
                              )
                            : t(
                                t("DoYouWantToAllowTheTransaction") +
                                  " - " +
                                  "Slip No." +
                                  data?.[0]?.SLIP_CD +
                                  " " +
                                  "?"
                              ),
                        buttonNames: ["Yes", "No"],
                        loadingBtnName: ["Yes"],
                        icon: "CONFIRM",
                      });
                      if (buttonName === "Yes") {
                        if (zoneTranType === "S") {
                          confirmation.mutate({
                            ENTERED_COMP_CD: data?.[0]?.ENTERED_COMP_CD,
                            ENTERED_BRANCH_CD: data?.[0]?.ENTERED_BRANCH_CD,
                            BRANCH_CD: data?.[0]?.BRANCH_CD,
                            TRAN_DT: data?.[0]?.TRAN_DT,
                            TRAN_CD: data?.[0]?.TRAN_CD,
                            ACCT_TYPE: data?.[0]?.ACCT_TYPE,
                            ACCT_CD: data?.[0]?.ACCT_CD,
                            ENTERED_BY: data?.[0]?.ENTERED_BY,
                            AMOUNT: data?.[0]?.AMOUNT,
                            SCREEN_REF: docCD,
                          });
                        } else {
                          outWardAndInwardconfirmation.mutate({
                            TRAN_CD: data?.[0]?.TRAN_CD,
                            ENTERED_COMP_CD: data?.[0]?.ENTERED_COMP_CD,
                            ENTERED_BRANCH_CD: data?.[0]?.ENTERED_BRANCH_CD,
                          });
                        }
                      }
                    }
                  }}
                >
                  {t("Confirm")}
                </GradientButton>
                <GradientButton
                  onClick={async () => {
                    if (rowsData?.CONFIRMED === "Y" && authState?.role < "2") {
                      await MessageBox({
                        messageTitle: t("ValidationFailed"),
                        message: t("CannotDeleteConfirmedTransaction"),
                        buttonNames: ["Ok"],
                        icon: "ERROR",
                      });
                    } else if (
                      new Date(rowsData?.TRAN_DT) <
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
                  disabled={isLoading || isFetching}
                >
                  {t("Reject")}
                </GradientButton>
                <GradientButton
                  onClick={(e) => {
                    if (currentIndex && currentIndex > 0) {
                      handlePrev();
                    }
                  }}
                  disabled={isLoading || isFetching}
                >
                  {t("Previous")}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    if (currentIndex && currentIndex !== totalData) {
                      handleNext();
                    }
                  }}
                  disabled={isLoading || isFetching}
                >
                  {t("MoveForward")}
                </GradientButton>

                {zoneTranType === "R" &&
                  data?.[0]?.CP_TRAN_CD !== null &&
                  data?.[0]?.CP_TRAN_CD !== undefined && (
                    <>
                      <GradientButton
                        onClick={() => {
                          mutation.mutate({
                            COMP_CD: data?.[0]?.COMP_CD ?? authState?.companyID,
                            ENTERED_BRANCH_CD:
                              data?.[0]?.ENTERED_BRANCH_CD ?? "",
                            BRANCH_CD: data?.[0]?.BRANCH_CD ?? "",
                            ACCT_TYPE: data?.[0]?.ACCT_TYPE ?? "",
                            ACCT_CD: data?.[0]?.ACCT_CD ?? "",
                            TRAN_CD: data?.[0]?.CP_TRAN_CD ?? "",
                            TRAN_DT: Boolean(data?.[0]?.TRAN_DT)
                              ? format(
                                  new Date(data?.[0]?.TRAN_DT),
                                  "dd/MMM/yyyy"
                                )
                              : "",
                            WITH_SIGN: "N",
                            WORKING_DATE: authState?.workingDate ?? "",
                            USERNAME: authState?.user?.id ?? "",
                            USERROLE: authState?.role ?? "",
                            SCREEN_REF: docCD ?? "",
                          });
                          setIsChequeSign(true);
                        }}
                        disabled={isLoading || isFetching}
                      >
                        {t("ViewCheque")}
                      </GradientButton>
                    </>
                  )}
                <GradientButton
                  onClick={() => {
                    confHistory.mutate({
                      TRAN_CD: rowsData?.TRAN_CD,
                      ENTERED_COMP_CD: rowsData?.ENTERED_COMP_CD ?? "",
                      ENTERED_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD ?? "",
                      TRAN_DT: rowsData?.TRAN_DT,
                      SCREEN_REF: "OW_CLG",
                    });
                    setIsConfHistory(true);
                  }}
                  disabled={isLoading || isFetching}
                >
                  {t("ConfHistory")}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    onClose();
                  }}
                >
                  {t("Close")}
                </GradientButton>
              </Box>
            </Toolbar>
          </AppBar>
          <DialogContent sx={{ padding: "0px", maxHeight: "80vh" }}>
            {isLoading ? (
              <LoaderPaperComponent />
            ) : isError ||
              outWardAndInwardconfirmation?.isError ||
              deleteMutation?.isError ? (
              <>
                <div
                  style={{
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    height: 100,
                    paddingTop: 10,
                  }}
                >
                  <AppBar position="relative" color="primary">
                    <Alert
                      severity="error"
                      errorMsg={
                        error?.error_msg ??
                        outWardAndInwardconfirmation?.error?.error_msg ??
                        deleteMutation?.error?.error_msg ??
                        "Unknow Error"
                      }
                      errorDetail={
                        error?.error_detail ??
                        outWardAndInwardconfirmation?.error_detail ??
                        deleteMutation?.error_detail ??
                        ""
                      }
                      color="error"
                    />
                  </AppBar>
                </div>
              </>
            ) : (
              <>
                <FormWrapper
                  key={"CTSOutwardClearingConfirm" + currentIndex}
                  metaData={
                    extractMetaData(
                      CTSOutwardClearingConfirmMetaData,
                      formMode
                    ) as MetaDataType
                  }
                  initialValues={data?.[0] ?? {}}
                  onSubmitHandler={() => {}}
                  //@ts-ignore
                  displayMode={formMode}
                  hideHeader={true}
                  formStyle={{
                    background: "white",
                    width: "100%",
                  }}
                  formState={{
                    ZONE_TRAN_TYPE: zoneTranType,
                  }}
                  ref={formRef}
                />
                <Grid
                  sx={{
                    backgroundColor: "var(--theme-color2)",
                    margin: "0px 0px 0px 10px",
                    padding:
                      gridData?.[0]?.ACCT_JOIN_DETAILS &&
                      gridData?.[0]?.ACCT_JOIN_DETAILS?.length > 0
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
                    </Typography>
                    <IconButton
                      onClick={() => setJointDtlExpand(!isJointDtlExpand)}
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
                      {gridData?.[0]?.ACCT_JOIN_DETAILS &&
                      gridData?.[0]?.ACCT_JOIN_DETAILS?.length > 0 ? (
                        <GridWrapper
                          key={"JoinDetailGridMetaData" + mutate?.isSuccess}
                          finalMetaData={SlipJoinDetailGridMetaData}
                          data={gridData?.[0]?.ACCT_JOIN_DETAILS ?? []}
                          setData={() => null}
                          actions={actions}
                          setAction={setCurrentAction}
                        />
                      ) : null}
                    </Grid>
                  </Collapse>
                </Grid>
                <CtsOutWardTable
                  gridApi={gridApi}
                  defaultView={formMode}
                  authState={authState}
                  getOutwardClearingData={data}
                  zoneTranType={zoneTranType}
                  formState={formRef}
                  hiddenColumns={["DELETE_ROW"]}
                />

                {isDeleteRemark && (
                  <RemarksAPIWrapper
                    TitleText={
                      zoneTranType === "S"
                        ? t("EnterRemovalRemarksCTSOWCONFIRMATION", {
                            docCD: docCD,
                            interpolation: { escapeValue: false },
                          })
                        : zoneTranType === "R"
                        ? t("EnterRemovalRemarksINWARDRETURNCONFIRMATION", {
                            docCD: docCD,
                            interpolation: { escapeValue: false },
                          })
                        : t("EnterRemovalRemarksOUTWARDRETURNCONFIRMATION", {
                            docCD: docCD,
                            interpolation: { escapeValue: false },
                          })
                    }
                    label="RemovalRemarks"
                    isRequired={true}
                    onActionNo={() => SetDeleteRemark(false)}
                    onActionYes={async (val, rows) => {
                      const buttonName = await MessageBox({
                        messageTitle: t("DeleteWarning"),
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
                            ENTERED_COMP_CD: rowsData?.ENTERED_COMP_CD,
                            ENTERED_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD,
                            TRAN_CD: rowsData?.TRAN_CD,
                            CONFIRMED: rowsData?.CONFIRMED,
                            ENTERED_BY: rowsData?.ENTERED_BY,
                          },
                          BRANCH_CD: data?.[0]?.BRANCH_CD,
                          SR_CD: rowsData?.SR_NO,
                          ACCT_TYPE: data?.[0]?.ACCT_TYPE,
                          ACCT_CD: data?.[0]?.ACCT_CD,
                          AMOUNT: data?.[0]?.AMOUNT,
                          TRAN_DT: data?.[0]?.TRAN_DT,
                          TRAN_CD: rowsData?.TRAN_CD,
                          USER_DEF_REMARKS: val
                            ? val
                            : zoneTranType === "S"
                            ? "WRONG ENTRY FROM CTS O/W CONFIRMATION (TRN/560)"
                            : zoneTranType === "R"
                            ? "WRONG ENTRY FROM INWARD RETURN CONFIRMATION(TRN/332)"
                            : "WRONG ENTRY FROM OUTWARD RETURN CONFIRMATION(TRN/346)",

                          ACTIVITY_TYPE:
                            zoneTranType === "S"
                              ? "CTS O/W CONFIRMATION (TRN/560)"
                              : zoneTranType === "R"
                              ? "INWARD RETURN CONFIRMATION(TRN/332)"
                              : "OUTWARD RETURN CONFIRMATION(TRN/346)",
                          DETAILS_DATA: {
                            isNewRow: [],
                            isDeleteRow: [
                              {
                                TRAN_CD: rowsData?.TRAN_CD,
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
                        ? "WRONG ENTRY FROM CTS O/W CONFIRMATION (TRN/560)"
                        : zoneTranType === "R"
                        ? "WRONG ENTRY FROM INWARD RETURN CONFIRMATION(TRN/332)"
                        : "WRONG ENTRY FROM OUTWARD RETURN CONFIRMATION(TRN/346)"
                    }
                    rows={undefined}
                  />
                )}
              </>
            )}
            <>
              {isChequeSign ? (
                <>
                  <Dialog
                    fullWidth
                    maxWidth="md"
                    open={true} // Assuming this is controlled by a state
                    onKeyUp={(event) => {
                      if (event.key === "Escape") {
                        onClose();
                      }
                    }}
                    key="chequeSignDialog"
                    PaperProps={{
                      style: {
                        width: "100%",
                        // height: "78%",
                        // height: "70%",
                      },
                    }}
                  >
                    <AppBar position="relative" color="secondary">
                      <Toolbar className={headerClasses.root} variant={"dense"}>
                        <Typography
                          className={headerClasses.title}
                          color="inherit"
                          variant={"h6"}
                          component="div"
                        >
                          Inward Return Confirmation
                        </Typography>
                        <GradientButton
                          onClick={() => {
                            setIsChequeSign(false);
                          }}
                        >
                          {t("Close")}
                        </GradientButton>
                      </Toolbar>
                    </AppBar>

                    {mutation.isLoading ? (
                      <LoaderPaperComponent />
                    ) : mutation.isError ? (
                      <Alert
                        severity="error"
                        errorMsg={
                          mutation.error?.error_msg ?? "Unknown error occured"
                        }
                        errorDetail={mutation.error?.error_detail ?? ""}
                      />
                    ) : (
                      <div style={{ paddingTop: 10 }}>
                        <ChequeSignImage
                          imgData={mutation?.data}
                          formData={{ WITH_SIGN: "N" }}
                        />
                      </div>
                    )}
                  </Dialog>
                </>
              ) : null}
            </>
            <>
              {isConfHistory ? (
                <>
                  <Dialog
                    fullWidth
                    maxWidth="md"
                    open={true} // Assuming this is controlled by a state
                    onKeyUp={(event) => {
                      if (event.key === "Escape") {
                        onClose();
                      }
                    }}
                    key="chequeSignDialog"
                    PaperProps={{
                      style: {
                        width: "100%",
                        // height: "78%",
                        // height: "70%",
                      },
                    }}
                  >
                    {confHistory.isError && (
                      <Alert
                        severity="error"
                        errorMsg={
                          confHistory.error?.error_msg ??
                          "Something went to wrong.."
                        }
                        errorDetail={confHistory.error?.error_detail}
                        color="error"
                      />
                    )}
                    <GridWrapper
                      key={"CtsOutwardClearingConfirmGrid" + zoneTranType}
                      finalMetaData={DualConfHistoryGridMetaData}
                      data={confHistory?.data ?? []}
                      setData={() => null}
                      loading={confHistory.isLoading || confHistory.isFetching}
                      actions={actions}
                      setAction={setCurrentAction}
                    />
                  </Dialog>
                </>
              ) : null}
            </>
          </DialogContent>
        </Dialog>
      </>
      {/* )} */}
    </Fragment>
  );
};

export const CtsOutwardClearingConfirmForm = ({
  zoneTranType,
  handleDialogClose,
  isDataChangedRef,
  handlePrev,
  handleNext,
  currentIndexRef,
  totalData,
  formLabel,
  chequeMicrVisible,
}) => {
  const { state: rows } = useLocation();
  currentIndexRef.current = rows?.index;

  return (
    <ClearCacheProvider>
      <CtsOutwardAndInwardReturnConfirm
        zoneTranType={zoneTranType}
        formMode={rows?.formMode}
        rowsData={rows?.gridData}
        onClose={handleDialogClose}
        handlePrev={handlePrev}
        handleNext={handleNext}
        currentIndex={rows.index}
        isDataChangedRef={isDataChangedRef}
        totalData={totalData}
        formLabel={formLabel}
        chequeMicrVisible={chequeMicrVisible}
      />
    </ClearCacheProvider>
  );
};
