import { AppBar, Dialog, LinearProgress } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LoanRescheduleFormMetaData } from "./metadata";
import { useTranslation } from "react-i18next";
import {
  GridMetaDataType,
  GradientButton,
  GridWrapper,
  SubmitFnType,
  MetaDataType,
  FormWrapper,
} from "@acuteinfo/common-base";
import {
  LoanScheduleDetailsGridMetadata,
  LoanScheduleGridMetaData,
} from "../gridMetadata";
import {
  getLoanRescheduleGridData,
  getLoanRescheduleDetails,
  getRescheduleHeaderData,
  proceedData,
  deleteProceedData,
  saveProceedData,
} from "../api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import {
  Alert,
  LoaderPaperComponent,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { cloneDeep } from "lodash";
import { getdocCD } from "components/utilFunction/function";

export const LoanRescheduleForm = ({
  isDataChangedRef,
  closeDialog,
  handleFormClose,
  formFlag,
}) => {
  const isErrorFuncRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [detailsGridData, setDetailsGridData] = useState<any>([]);
  const [gridData, setGridData] = useState<any>([]);
  const [fetchData, setFetchData] = useState<any>(false);
  const [shouldFetchDetails, setShouldFetchDetails] = useState(false);
  const gridRef = useRef<any>(null);
  const controllerRef = useRef<AbortController>();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const {
    data: headerData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<any, any>(
    ["getRescheduleHeaderData", authState?.user?.branchCode],
    () =>
      getRescheduleHeaderData({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.ACCT_CD ?? "",
        ASON_DT: authState?.workingDate ?? "",
      })
  );

  const proceedDataMutation = useMutation(proceedData, {
    onError: (error: any) => {},
    onSuccess: (data, variables) => {},
  });

  const {
    isLoading: gridlsLoading,
    isError: gridIsError,
    error: gridError,
    isFetching: gridIsFetching,
  } = useQuery<any, any>(
    ["getLoanRescheduleGridData", authState?.user?.branchCode],
    () =>
      getLoanRescheduleGridData({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.ACCT_CD ?? "",
        ACTIVE: "N",
      }),
    {
      enabled: fetchData,
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          setGridData(data);
          gridRef.current = data;
          setShouldFetchDetails(true);
        } else {
          setGridData([]);
          setShouldFetchDetails(true);
        }
        setFetchData(false);
      },
    }
  );

  const {
    isLoading: detailsLoading,
    isError: detaiIsError,
    error: detaiError,
    isFetching: detaiIsFetching,
  } = useQuery<any, any>(
    ["getLoanRescheduleDetails", authState?.user?.branchCode],
    () =>
      getLoanRescheduleDetails({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: rows?.ACCT_TYPE ?? "",
        ACCT_CD: rows?.ACCT_CD ?? "",
        REF_TRAN_CD: gridData?.[0]?.REF_TRAN_CD ?? "",
        TRAN_CD: gridData?.[0]?.SR_CD ?? "",
      }),
    {
      enabled: shouldFetchDetails,
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const updatedData = data.map((item) => ({
            ...item,
            INT_RATE: Number(item?.INT_RATE ?? 0).toFixed(2),
          }));
          setDetailsGridData(updatedData);
        } else {
          setDetailsGridData([]);
        }
        setShouldFetchDetails(false);
      },
    }
  );

  const deleteMutation = useMutation(deleteProceedData, {
    onError: (error: any) => {},
    onSuccess: (data) => {},
  });

  const saveMutation = useMutation(saveProceedData, {
    onError: (error: any) => {},
    onSuccess: (data) => {},
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getRescheduleHeaderData",
        authState?.user?.branchCode,
      ]);
      queryClient.removeQueries([
        "getLoanRescheduleDetails",
        authState?.user?.branchCode,
      ]);
      queryClient.removeQueries([
        "getLoanRescheduleGridData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    if (Boolean(data) && data.length > 0) {
      delete data["VALIDATE_INT_AMT"];
      delete data["REMAINING_INST_NO"];
      delete data["PROCEED"];
      delete data["OUT_SUBSIDY"];
    }
    if (Boolean(data["INST_DUE_DT"])) {
      data["INST_DUE_DT"] = format(
        new Date(data["INST_DUE_DT"]),
        "dd/MMM/yyyy"
      );
    }

    if (Boolean(data["INST_START_DT"])) {
      data["INST_START_DT"] = format(
        new Date(data["INST_START_DT"]),
        "dd/MMM/yyyy"
      );
    }

    if (Boolean(data["RATE_WEF"])) {
      data["RATE_WEF"] = format(new Date(data["RATE_WEF"]), "dd/MMM/yyyy");
    }

    if (Boolean(data["IDEAL_BALANCE"])) {
      data["IDEAL_BALANCE"] = data["IDEAL_BALANCE"].endsWith(".00")
        ? parseInt(data["IDEAL_BALANCE"]).toString()
        : data["IDEAL_BALANCE"].toString();
    }

    if (Boolean(data["INST_RS"])) {
      data["INST_RS"] = data["INST_RS"].endsWith(".00")
        ? parseInt(data["INST_RS"]).toString()
        : data["INST_RS"].toString();
    }

    if (Boolean(data["OUTSTANDING_BAL"])) {
      data["OUTSTANDING_BAL"] = data["OUTSTANDING_BAL"].endsWith(".00")
        ? parseInt(data["OUTSTANDING_BAL"]).toString()
        : data["OUTSTANDING_BAL"].toString();
    }

    let newData = {
      ...data,
      EMI_AMT_CHANGE: Boolean(data?.EMI_AMT_CHANGE) ? "Y" : "N",
    };
    let oldData = {
      ...headerData?.[0],
      EMI_AMT_CHANGE: Boolean(headerData?.[0]?.EMI_AMT_CHANGE) ? "Y" : "N",
    };

    if (actionFlag === "PROCEED") {
      isErrorFuncRef.current = {
        data: {
          ...newData,
          BRANCH_CD: authState.user.branchCode ?? "",
          COMP_CD: authState.companyID ?? "",
          ACCT_TYPE: rows?.ACCT_TYPE ?? "",
          ACCT_CD: rows?.ACCT_CD ?? "",
          ORG_INT_RATE: oldData?.INT_RATE ?? "",
          CONFIMED_PARA: oldData?.CONFIMED_PARA ?? "",
          REF_TRAN_CD: Boolean(gridData?.[0]?.REF_TRAN_CD)
            ? gridData?.[0]?.REF_TRAN_CD
            : "",
          SCREEN_REF: docCD ?? "",
        },
        displayData,
        endSubmit,
        setFieldError,
      };
      proceedDataMutation.mutate(
        { ...isErrorFuncRef.current?.data },
        {
          onSuccess: async (data, variables) => {
            for (let i = 0; i < data?.length; i++) {
              if (data[i]?.O_STATUS === "999") {
                const btnName = await MessageBox({
                  messageTitle: "ValidationFailed",
                  message: data[i]?.O_MESSAGE,
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  endSubmit(true);
                }
              } else if (data[i]?.O_STATUS === "9") {
                const btnName = await MessageBox({
                  messageTitle: "Alert",
                  message: data[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              } else if (data[i]?.O_STATUS === "99") {
                const btnName = await MessageBox({
                  messageTitle: "Confirmation",
                  message: data[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                if (btnName === "No") {
                  endSubmit(true);
                  break;
                }
              } else if (data[i]?.O_STATUS === "0") {
                setFetchData(true);
                endSubmit(true);
              }
            }
          },
          onError: (error: any) => {
            let errorMsg = t("Unknownerroroccured");
            if (typeof error === "object") {
              errorMsg = error?.error_msg ?? errorMsg;
            }
            enqueueSnackbar(errorMsg, {
              variant: "error",
            });
            endSubmit(true);
          },
        }
      );
    } else if (actionFlag === "Save") {
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        const savePara = {
          BRANCH_CD: authState.user.branchCode ?? "",
          COMP_CD: authState.companyID ?? "",
          ACCT_TYPE: rows?.ACCT_TYPE ?? "",
          ACCT_CD: rows?.ACCT_CD ?? "",
          REF_TRAN_CD: gridData?.[0]?.REF_TRAN_CD ?? "",
          SR_CD: gridData?.[0]?.SR_CD ?? "",
          DISBURSEMENT_DT: gridData?.[0]?.DISBURSEMENT_DT ?? "",
          INST_RS: gridData?.[0]?.INST_RS ?? "",
          INT_RATE: gridData?.[0]?.INT_RATE ?? "",
          INST_NO: gridData?.[0]?.INST_NO ?? "",
          CONFIMED_PARA: oldData?.CONFIMED_PARA ?? "",
          SCREEN_REF: docCD ?? "",
        };
        saveMutation.mutate(savePara, {
          onSuccess: async (data) => {
            for (let i = 0; i < data?.length; i++) {
              if (data[i]?.O_STATUS === "999") {
                const btnName = await MessageBox({
                  messageTitle: "ValidationFailed",
                  message: data[i]?.O_MESSAGE,
                  buttonNames: ["Ok"],
                  icon: "ERROR",
                });
                if (btnName === "Ok") {
                  endSubmit(true);
                }
              } else if (data[i]?.O_STATUS === "9") {
                const btnName = await MessageBox({
                  messageTitle: "Alert",
                  message: data[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              } else if (data[i]?.O_STATUS === "99") {
                const btnName = await MessageBox({
                  messageTitle: "Confirmation",
                  message: data[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });
                if (btnName === "No") {
                  endSubmit(true);
                  break;
                }
              } else if (data[i]?.O_STATUS === "0") {
                isDataChangedRef.current = true;
                CloseMessageBox();
                closeDialog();
                handleFormClose();
              }
            }
          },
          onError: (error: any) => {
            let errorMsg = t("Unknownerroroccured");
            if (typeof error === "object") {
              errorMsg = error?.error_msg ?? errorMsg;
            }
            enqueueSnackbar(errorMsg, {
              variant: "error",
            });
            endSubmit(true);
            CloseMessageBox();
          },
        });
      } else if (btnName === "No") {
        endSubmit(true);
      }
    }
  };

  let headerGridMetadata: GridMetaDataType = {} as GridMetaDataType;
  headerGridMetadata = cloneDeep(LoanScheduleGridMetaData) as GridMetaDataType;
  let gridMetadata: GridMetaDataType = {} as GridMetaDataType;
  gridMetadata = cloneDeep(LoanScheduleDetailsGridMetadata) as GridMetaDataType;

  if (formFlag === "RESCHEDULE") {
    headerGridMetadata.gridConfig.hideHeader = true;
    headerGridMetadata.gridConfig.containerHeight = {
      min: "15vh",
      max: "15vh",
    };
    gridMetadata.gridConfig.containerHeight = {
      min: "25vh",
      max: "25vh",
    };
    gridMetadata.columns[8].isVisible = false;
  }

  const handleDeleteData = async () => {
    if (Array.isArray(gridData) && gridData.length > 0) {
      const confirmation = await MessageBox({
        messageTitle: "Confirmation",
        message: "DeleteProceedMessage",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (confirmation === "Yes") {
        const deletePara = {
          DETAILS_DATA: {
            isDeleteRow: gridData,
          },
        };
        deleteMutation.mutate(
          { apiReq: deletePara, controllerFinal: controllerRef.current },
          {
            onSuccess: (data) => {
              enqueueSnackbar(data, {
                variant: "success",
              });
              CloseMessageBox();
              closeDialog();
            },
            onError: (error: any) => {
              let errorMsg = t("Unknownerroroccured");
              if (typeof error === "object") {
                errorMsg = error?.error_msg ?? errorMsg;
              }
              enqueueSnackbar(errorMsg, {
                variant: "error",
              });
              CloseMessageBox();
              closeDialog();
            },
          }
        );
      }
    } else {
      closeDialog();
    }
  };

  const handleDeleteProceedData = () => {
    if (Array.isArray(gridRef?.current) && gridRef?.current.length > 0) {
      const deletePara = {
        DETAILS_DATA: {
          isDeleteRow: gridRef?.current,
        },
      };
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();
      deleteMutation.mutate(
        { apiReq: deletePara, controllerFinal: controllerRef.current },
        {
          onSuccess: (data) => {
            enqueueSnackbar(data, {
              variant: "success",
            });
            setFetchData(true);
            gridRef.current = null;
          },
          onError: (error: any) => {
            setFetchData(false);
          },
        }
      );
    }
  };

  return (
    <>
      {isLoading || isFetching ? (
        <div style={{ width: "100%", height: "100px" }}>
          <LoaderPaperComponent />
        </div>
      ) : (
        <>
          {(isError ||
            proceedDataMutation?.isError ||
            deleteMutation?.isError) && (
            <AppBar position="relative" color="secondary">
              <Alert
                severity="error"
                errorMsg={
                  //@ts-ignore
                  (error?.error_msg ||
                    proceedDataMutation.error?.error_msg ||
                    deleteMutation.error?.error_msg) ??
                  "Something went to wrong.."
                }
                errorDetail={
                  //@ts-ignore
                  (error?.error_detail ||
                    proceedDataMutation.error?.error_detail ||
                    deleteMutation.error?.error_detail) ??
                  ""
                }
                color="error"
              />
            </AppBar>
          )}
          {proceedDataMutation?.isLoading || deleteMutation?.isLoading ? (
            <LinearProgress color="secondary" />
          ) : (
            <LinearProgressBarSpacer />
          )}
          <FormWrapper
            key={"loanRescheduleForm"}
            metaData={LoanRescheduleFormMetaData as MetaDataType}
            onSubmitHandler={onSubmitHandler}
            initialValues={{
              ...headerData?.[0],
              VALIDATE_INT_AMT: Boolean(headerData)
                ? headerData[0]?.INST_RS
                : "0",
            }}
            formStyle={{
              background: "white",
              paddingBottom: "0px",
            }}
            onFormButtonClickHandel={() => {
              let event: any = { preventDefault: () => {} };
              formRef?.current?.handleSubmit(event, "PROCEED");
            }}
            formState={{
              headerData: headerData,
              MessageBox: MessageBox,
              flag: false,
              instAmtFlag: false,
              noOfInstFlag: false,
              disableCheckBox: deleteMutation.isLoading,
              disableButton:
                proceedDataMutation.isLoading ||
                detailsLoading ||
                gridIsFetching ||
                detaiIsFetching ||
                gridlsLoading ||
                deleteMutation.isLoading ||
                gridData.length > 0,
            }}
            ref={formRef}
            setDataOnFieldChange={(action, payload) => {
              if (action === "DELETE_DATA" && Boolean(payload?.DELETE_DATA)) {
                handleDeleteProceedData();
              }
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={
                    proceedDataMutation.isLoading ||
                    detailsLoading ||
                    gridlsLoading ||
                    deleteMutation.isLoading ||
                    gridIsFetching ||
                    detaiIsFetching
                  }
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton
                  onClick={handleDeleteData}
                  color={"primary"}
                  disabled={
                    proceedDataMutation.isLoading ||
                    detailsLoading ||
                    gridlsLoading ||
                    deleteMutation.isLoading ||
                    gridIsFetching ||
                    detaiIsFetching
                  }
                >
                  {t("Cancel")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
          {gridIsError && (
            <Alert
              severity={gridError?.severity ?? "error"}
              errorMsg={gridError?.error_msg ?? "Something went to wrong.."}
              errorDetail={gridError?.error_detail ?? ""}
              color="error"
            />
          )}
          <GridWrapper
            key={`loanRescheduleGridData`}
            finalMetaData={headerGridMetadata as GridMetaDataType}
            data={gridData ?? []}
            setData={setGridData}
            loading={gridlsLoading || gridIsFetching}
          />
          {detaiIsError && (
            <Alert
              severity={detaiError?.severity ?? "error"}
              errorMsg={detaiError?.error_msg ?? "Something went to wrong.."}
              errorDetail={detaiError?.error_detail ?? ""}
              color="error"
            />
          )}
          <GridWrapper
            key={`loanRescheduleDetailsData`}
            finalMetaData={gridMetadata as GridMetaDataType}
            data={detailsGridData ?? []}
            setData={setDetailsGridData}
            loading={detaiIsFetching || detailsLoading}
          />
        </>
      )}
    </>
  );
};

export const LoanRescheduleFormWrapper = ({
  isDataChangedRef,
  closeDialog,
  handleFormClose,
  formFlag,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
          height: "auto",
        },
      }}
      maxWidth="xl"
      className="rescheduleDlg"
    >
      <LoanRescheduleForm
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        handleFormClose={handleFormClose}
        formFlag={formFlag}
      />
    </Dialog>
  );
};
