import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { executeChecksumsReportMetaData } from "./gridMetadata";
import { useLocation, useNavigate } from "react-router-dom";
import { ViewEodReport } from "./viewEodReport";
import { Chip, Dialog, Paper, Typography } from "@mui/material";
import { LoaderPaperComponent, usePopupContext } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { GradientButton } from "@acuteinfo/common-base";
import { t } from "i18next";
import { LoadingTextAnimation } from "components/common/loader";
import {
  ClearCacheProvider,
  GridMetaDataType,
  GridWrapper,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useDayEndFunctions } from "./useDayEndFunctions";
import DayEndFooter from "./dayEndIndicatorFooter";

export const VerifyDayendChecksums = ({
  open,
  close,
  flag,
  processFlag,
  isHOLoggined,
  reqFlag,
}: {
  open: boolean;
  close: () => void;
  flag: string;
  reqFlag: string;
  processFlag: string;
  isHOLoggined: boolean;
}) => {
  const { authState } = useContext(AuthContext);

  const [state, setState] = useState({
    openReport: false,
    sessionStart: false as boolean,
    currentSRCD: 0 as string | number,
    rowData: [] as any[],
    reqData: {} as Record<string, any>,
    currentData: {} as Record<string, any>,
    loopStart: false as boolean,
    branchLoopStop: false as boolean,
    warningsObj: {} as Record<string, any>,
    switchBranchPara: true as boolean,
    batchCount: 0 as number,
  });

  const refs = useRef({
    warningCount: 0,
    errCount: 0,
    warningsObj: {} as Record<string, any>,
    branchArrayLength: [] as any[],
    allRecordsProcessed: null as any,
    npaCalc: null as any,
    newSession: null as any,
    result: null as any,
    index: 0,
    currentBranch: null as any,
  });

  useEffect(() => {
    refs.current.warningsObj = state.warningsObj;
  }, [state.warningsObj]);

  const gridRef = useRef<any>(null);
  const [gridData, setGridData] = useState<any[]>([]);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const handleAction = useCallback(
    async (data: any) => {
      navigate(data?.name, { state: data?.rows });
    },
    [navigate, close]
  );

  useEffect(() => {
    refs.current.warningsObj = state.warningsObj;
  }, [state.warningsObj]);

  const checkSumsDataMutation = useMutation(API.getCheckSums, {
    onError: (error: any) => {
      MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: async (data) => {
      if (data?.status === "999") {
        MessageBox({
          messageTitle: "Error",
          message: data?.message,
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        close();
      } else {
        setGridData(data);
        setState((prev) => ({ ...prev, loopStart: false }));

        const allRecordsProcessed = await processRecords(data);
        refs.current.allRecordsProcessed = allRecordsProcessed;

        if (flag === "C" && allRecordsProcessed) {
          setState((prev) => ({
            ...prev,
            switchBranchPara: true,
            loopStart: true,
          }));
          await MessageBox({
            messageTitle: "Success",
            message: t("eodCheckumsCompletedMsg"),
            buttonNames: ["Ok"],
            icon: "SUCCESS",
          });
        }

        if (flag === "D" && allRecordsProcessed) {
          if (refs.current.errCount === 0) {
            updateEodRunningStatus();

            const buttonNames = await MessageBox({
              messageTitle: `${t("ValidationFailed")}`,
              message:
                "At least one Mandatory CheckSum should be completed successfully.\nSorry for the inconvenience." +
                refs.current.errCount,
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonNames === "Ok") {
              const formData = gridRef?.current?.cleanData?.();
              if (
                refs.current.index === formData?.length - 1 &&
                refs.current.branchArrayLength.length === 1
              ) {
                updateEodRunningStatus();
                handleEodWarnings();
              }
            }
          } else {
            updateEodRunningStatus();
            handleEodWarnings();
          }
        }
        if (state?.branchLoopStop === false) {
          setState((prev) => ({
            ...prev,
            switchBranchPara: true,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            switchBranchPara: false,
          }));
        }
      }
    },
  });

  const { data: validatedData } = useQuery(
    ["getValidateEod"],
    () =>
      API.getValidateEod({
        SCREEN_REF: docCD,
        FLAG: flag === "D" ? reqFlag : flag,
      }),
    {
      onSuccess: async (data: any) => {
        const responseData = Array.isArray(data) ? data[0] : {};
        const responses = Array.isArray(responseData?.V_MSG)
          ? responseData.V_MSG
          : [responseData?.V_MSG];

        for (const response of responses) {
          const status = response.O_STATUS;
          const message = response.O_MESSAGE;
          const title = response.O_MSG_TITLE;

          if (status === "999") {
            const buttonName = await MessageBox({
              messageTitle: "Error",
              message: message,
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (buttonName === "Ok") close();
          } else if (status === "9") {
            await MessageBox({
              messageTitle: title,
              message: message,
              icon: "WARNING",
            });
          } else if (status === "99") {
            const buttonName = await MessageBox({
              messageTitle: title,
              message: message,
              icon: "CONFIRM",
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
            });
            if (buttonName === "No") {
              CloseMessageBox();
              close();
            } else if (buttonName === "Yes") {
              const branchList = data[0]?.BRANCH_LIST;

              refs.current.branchArrayLength = branchList;

              // Handle case where branchList length is 1
              if (branchList.length === 1) {
                const branch = branchList[0];
                refs.current.currentBranch = branch;
                refs.current.warningCount = 0;

                await checkSumsDataMutation.mutateAsync({
                  FLAG: flag,
                  SCREEN_REF: docCD,
                  FOR_BRANCH: branch,
                  EOD_EOS_FLG: data[0]?.EOD_EOS_FLG,
                });
              } else if (branchList.length > 1) {
                handleMulltipleBranchEod(data);
              }
            }
          }
        }
      },

      onError: async (error: any) => {
        await MessageBox({
          message: error?.error_msg,
          messageTitle: "Error",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      },
    }
  );

  const {
    memoizedMetaData,
    reportMutation,
    updateData,
    DoEodMutation,
    updateRunningMutation,
    updateEodRunningStatus,
    handleMulltipleBranchEod,
    sessionDtlMutation,
    handleEodWarnings,
    processRecords,
  } = useDayEndFunctions({
    state,
    setState,
    gridData,
    authState,
    refs,
    reqFlag,
    flag,
    checkSumsDataMutation,
    setGridData,
  });

  useEffect(() => {
    if (validatedData) {
      setState((prev) => ({
        ...prev,
        reqData: validatedData,
      }));
    }
  }, [validatedData]);

  const handleLoopStart = async () => {
    setGridData([]);
    // setLoopStart(false);
    if (refs.current.branchArrayLength.length === 1) {
      setState((prev) => ({ ...prev, loopStart: false }));
    }

    refs.current.result = null;
    refs.current.index = 0;

    await checkSumsDataMutation.mutateAsync({
      FLAG: flag,
      SCREEN_REF: docCD,
      FOR_BRANCH: refs.current.currentBranch,
      EOD_EOS_FLG: state.reqData[0]?.EOD_EOS_FLG,
    });

    if (refs.current.branchArrayLength.length > 1) {
      setState((prev) => ({ ...prev, loopStart: false }));
      handleMulltipleBranchEod(validatedData);
    }
  };

  return (
    <ClearCacheProvider>
      <Dialog
        open={open}
        fullWidth
        maxWidth="xl"
        style={{ height: "auto" }}
        PaperProps={{
          style: { width: "100%", padding: "7px" },
        }}
      >
        {gridData.length > 0 ? (
          <>
            <div style={{ height: "65%" }}>
              <GridWrapper
                ref={gridRef}
                key={`verifyDayendChecksumsMetaData` + state?.batchCount}
                finalMetaData={memoizedMetaData as GridMetaDataType}
                data={updateData(gridData)}
                setData={() => null}
                actions={[]}
                onClickActionEvent={(index, id, currentDataItem) => {
                  if (id === "REPORT") {
                    setState((prev) => ({
                      ...prev,
                      currentData: currentDataItem,
                      openReport: true,
                    }));

                    reportMutation.mutate({
                      COMP_CD: authState?.companyID,
                      BRANCH_CD: refs.current.currentBranch,
                      TRAN_DT: authState?.workingDate,
                      VERSION: currentDataItem?.EOD_VER_ID,
                      SR_CD: currentDataItem?.SR_CD,
                    });
                  }
                }}
                setAction={handleAction}
                // onlySingleSelectionAllow={false}
                defaultSelectedRowId={`${state?.currentSRCD}`}
              />
            </div>
            <DayEndFooter
              gridData={gridData}
              processFlag={processFlag}
              DoEodMutation={DoEodMutation}
              sessionDtlMutation={sessionDtlMutation}
              updateRunningMutation={updateRunningMutation}
              state={state}
              flag={flag}
              handleLoopStart={handleLoopStart}
              close={close}
            />
          </>
        ) : (
          <div style={{ width: "100%" }}>
            <LoaderPaperComponent />
          </div>
        )}

        {state?.openReport && (
          <ViewEodReport
            open={state?.openReport}
            close={() => {
              setState((prev) => ({ ...prev, openReport: false }));
            }}
            metaData={executeChecksumsReportMetaData}
            reportData={state?.rowData}
            reportLabel={`EOD Error Log : ${authState?.workingDate} and Version : ${state.currentData?.EOD_VER_ID} ${state.currentData?.DESCRIPTION}`}
            loading={reportMutation.isLoading}
          />
        )}
      </Dialog>
    </ClearCacheProvider>
  );
};
