import { useMutation } from "react-query";
import * as API from "./api";
import { verifyDayendChecksumsMetaData } from "./gridMetadata";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { queryClient, usePopupContext } from "@acuteinfo/common-base";
import { cloneDeep } from "lodash";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import LoaderImg from "./Loader.gif";

type UseDayEndFunctionsParams = {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  gridData: any[];
  authState: any;
  refs: any;
  reqFlag: string;
  flag: string;
  checkSumsDataMutation: any;
  setGridData: any;
};

export const useDayEndFunctions = ({
  state,
  setState,
  gridData,
  authState,
  refs,
  reqFlag,
  flag,
  checkSumsDataMutation,
  setGridData,
}: UseDayEndFunctionsParams) => {
  const { logout } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const { MessageBox, CloseMessageBox } = usePopupContext();
  const memoizedMetaData = useMemo(() => {
    let label = gridData
      ? `${gridData[0]?.TITLE} ${gridData[0]?.EOD_VER_ID}`
      : "Day End Process";
    const clonedMetaData = cloneDeep(verifyDayendChecksumsMetaData);
    clonedMetaData.gridConfig.gridLabel = label;
    return clonedMetaData;
  }, [verifyDayendChecksumsMetaData, gridData]);

  useEffect(() => {
    if (refs.current.currentBranch) {
      const updatedWarnings = {
        ...state.warningsObj,
        [refs.current.currentBranch]: [
          refs.current.warningCount,
          gridData[0]?.BRANCH_NM ?? "",
        ],
      };

      setState((prev) => ({
        ...prev,
        warningsObj: updatedWarnings,
      }));

      refs.current.warningsObj = updatedWarnings;
    }
  }, [refs.current.warningCount, gridData, refs.current.currentBranch]);
  //mutations
  const reportMutation = useMutation(API.getDayEnderrLog, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg ?? "Error occurred",
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: async (data: any) => {
      setState((prev) => ({
        ...prev,
        rowData: data,
      }));
    },
  });
  const DoEodMutation = useMutation(API.doEod, {
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      setState((prev) => ({ ...prev, loopStart: true }));
    },
    onSuccess: async (data) => {
      setState((prev) => ({ ...prev, loopStart: true }));

      for (const item of data ?? []) {
        const status = item?.O_STATUS;

        if (status === "999") {
          await MessageBox({
            messageTitle: t("ValidationFailed"),
            message: item?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (status === "99") {
          MessageBox({
            messageTitle: t("Confirmation"),
            message: item?.O_MESSAGE,
            icon: "CONFIRM",
            buttonNames: ["Yes", "No"],
          });
        } else if (status === "9") {
          await MessageBox({
            messageTitle: t("Alert"),
            message: item?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (status === "0") {
          const btnName = await MessageBox({
            messageTitle: item?.O_MSG_TITLE,
            message: item?.O_MESSAGE,
            buttonNames: ["Ok"],
            icon: "SUCCESS",
          });

          if (btnName === "Ok") {
            logout();
          }
        }
      }
    },
  });
  const updateRunningMutation = useMutation(API.updateEodRunningStatus, {
    onError: (error: any) => {
      MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      setState((prev) => ({ ...prev, loopStart: true }));
      CloseMessageBox();
    },
    onSuccess: (data) => {
      setState((prev) => ({ ...prev, loopStart: true }));
    },
  });
  const sessionDtlMutation = useMutation(API.getSessionDtl, {
    onError: (error: any) => {
      setState((prev) => ({ ...prev, loopStart: true }));
    },
    onSuccess: async (sessionDtl) => {
      for (const response of sessionDtl[0]?.MSG ?? []) {
        if (response?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: t("ValidationFailed"),
            message: response?.O_MESSAGE ?? "",
            icon: "ERROR",
          });
        } else if (response?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: "Alert",
            message: response?.O_MESSAGE ?? "",
            icon: "WARNING",
          });
        } else if (response?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: "Confirmation",
            message: response?.O_MESSAGE ?? "",
            icon: "CONFIRM",
            buttonNames: [t("openNewSession"), t("DayEnd")],
          });
          if (buttonName === "openNewSession") {
            if (response?.O_COLUMN_NM === "AUTO_NPA") {
              refs.current.npaCalc = "Y";
            } else {
              refs.current.npaCalc = "N";
            }

            if (response?.O_COLUMN_NM === "NEW_SESSION") {
              refs.current.newSession = sessionDtl[0]?.NEW_SESSION;
            } else {
              refs.current.newSession = sessionDtl[0]?.DEFAULT_SESSION;
            }
            if (flag === "D") {
              DoEodMutation.mutate({
                FLAG: reqFlag,
                SCREEN_REF: docCD,
                NPA_CALC: refs.current.npaCalc,
                NEW_SESSION: refs.current.newSession,
              });
            }
          } else if (buttonName === "DayEnd") {
            refs.current.npaCalc = "N";

            if (response?.O_COLUMN_NM === "NEW_SESSION") {
              refs.current.newSession = sessionDtl[0]?.DEFAULT_SESSION;
            } else {
              refs.current.newSession = sessionDtl[0]?.NEW_SESSION;
            }
            if (flag === "D") {
              DoEodMutation.mutate({
                FLAG: reqFlag,
                SCREEN_REF: docCD,
                NPA_CALC: refs.current.npaCalc,
                NEW_SESSION: refs.current.newSession,
              });
            }
          }
        } else if (response?.O_STATUS === "0") {
          if (
            response?.O_COLUMN_NM !== "AUTO_NPA" &&
            response?.O_COLUMN_NM !== "NEW_SESSION"
          ) {
            refs.current.npaCalc = "N";
            refs.current.newSession = sessionDtl[0]?.DEFAULT_SESSION;
          }
          if (flag === "D") {
            DoEodMutation.mutate({
              FLAG: reqFlag,
              SCREEN_REF: docCD,
              NPA_CALC: refs.current.npaCalc,
              NEW_SESSION: refs.current.newSession,
            });
          }
        }
      }
    },
  });

  const updateEodRunningStatus = async () => {
    const payload: any = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      FLAG: "N",
    };
    updateRunningMutation.mutate(payload);
  };

  //helper functions

  const updateData = (gridData) => {
    return gridData.map((item, index) => ({
      ...item,
      INDEX: `${index}`,
      _rowColor:
        item?.CLR === "N"
          ? "rgb(255, 0, 0)"
          : item.CLR === "P"
          ? "rgb(40, 180, 99)"
          : item.CLR === "Y"
          ? "rgb(130, 224, 170)"
          : item.CLR === "W"
          ? "rgb(244, 208, 63)"
          : item.CLR === "E"
          ? "rgb(241, 148, 138)"
          : undefined,
    }));
  };
  const startSession = () => {
    setState((prev) => ({
      ...prev,
      sessionStart: true,
    }));

    sessionDtlMutation.mutate({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      BASE_BRANCH_CD: authState?.baseCompanyID,
      BASE_COMP_CD: authState?.user?.baseBranchCode,
      WORKING_DATE: authState?.workingDate,
    });
    setState((prev) => ({
      ...prev,
      sessionStart: false,
    }));
  };
  const handleEodWarnings = async () => {
    if (flag === "D") {
      let message = "";
      for (let key in refs.current.warningsObj) {
        message += `${refs.current.warningsObj[key][1]} Warning= ${refs.current.warningsObj[key][0]}.\n`;
      }

      if (Object.keys(refs.current.warningsObj).length === 0) {
        startSession();
      } else {
        const confirmation = await MessageBox({
          messageTitle: t("eodChecksomWarningMsg"),
          message: `${message}\nAre you sure to Continue?`,
          icon: "WARNING",
          buttonNames: ["Yes", "No"],
        });

        if (confirmation === "Yes") {
          startSession();
        }
        if (confirmation === "No") {
          setState((prev) => ({ ...prev, loopStart: true }));
        }
      }
    }
  };
  const handleMulltipleBranchEod = async (data) => {
    if (refs.current.branchArrayLength.length > 1) {
      if (state.switchBranchPara) {
        setState((prev) => ({ ...prev, loopStart: false }));
        let callHandleEodWarnings = false;

        for (const branch of refs.current.branchArrayLength) {
          if (refs.current.result === "stop") return false;

          const lastBranch =
            refs.current.branchArrayLength[
              refs.current.branchArrayLength.length - 1
            ];

          refs.current.currentBranch = branch;
          refs.current.warningCount = 0;

          if (lastBranch === branch) callHandleEodWarnings = true;

          const processBranch = async (branch: string) => {
            await checkSumsDataMutation.mutateAsync({
              FLAG: flag,
              SCREEN_REF: docCD,
              FOR_BRANCH: branch,
              EOD_EOS_FLG: state.reqData[0]?.EOD_EOS_FLG,
            });
          };

          await processBranch(branch);
        }

        if (callHandleEodWarnings) {
          handleEodWarnings();
          callHandleEodWarnings = false;
        }
      }
    }
  };
  const executeDayEndStep = async (
    record: any,
    index: number
  ): Promise<string> => {
    const startTime = new Date();
    setState((prev) => ({ ...prev, currentSRCD: record.SR_CD ?? "" }));
    refs.current.index = index;

    setGridData((prevGridData) => {
      const updatedGridData = [...prevGridData];
      updatedGridData[index] = {
        ...updatedGridData[index],
        CLR: "P",
        PROCESS: LoaderImg,
        ST_TIME: formatTime(startTime),
        ED_TIME: "",
      };
      return updatedGridData;
    });

    const response = await API.executeChecksums({
      FLAG: flag,
      SCREEN_REF: docCD,
      FOR_BRANCH: refs.current.currentBranch,
      EOD_EOS_FLG: state.reqData[0]?.EOD_EOS_FLG,
      CHKSM_TYPE: record.CHKSM_TYPE,
      SR_CD: record.SR_CD,
      MENDETORY: record.MENDETORY,
      EOD_VER_ID: record.EOD_VER_ID,
    });

    const endTime = new Date();
    const elapsedTime = formatTime(endTime);

    if (response[0]?.CLR) {
      setGridData((prevGridData) => {
        const updatedGridData = [...prevGridData];
        updatedGridData[index] = {
          ...updatedGridData[index],
          CLR: response[0].CLR,
          PROCESS: "",
          ED_TIME: elapsedTime,
        };
        return updatedGridData;
      });
    }

    if (flag === "D" && response[0]?.CLR === "E" && record?.MENDETORY == "Y") {
      await MessageBox({
        messageTitle: "Error",
        message: response[0]?.MESSAGE,
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
      CloseMessageBox();
      setState((prev) => ({
        ...prev,
        loopStart: true,
        branchLoopStop: true,
        switchBranchPara: false,
      }));

      return "stop";
    }

    if (flag === "C" && response[0]?.MESSAGE !== "") {
      const buttonName = await MessageBox({
        messageTitle: "Error",
        message: response[0]?.MESSAGE,
        icon: "ERROR",
        buttonNames: ["Ok"],
      });

      if (buttonName !== "Ok") {
        return "stop";
      }
    }
    if (flag === "D" && response[0]?.CLR === "W") {
      const buttonName = await MessageBox({
        messageTitle: "Error",
        message: t("dayendWarningShowMsg"),
        icon: "WARNING",
        buttonNames: ["Yes", "No"],
      });
      if (buttonName === "Yes") {
        setState((prev) => ({ ...prev, loopStart: true }));

        return "stop";
      }
    }
    if (response[0]?.CLR === "W") {
      refs.current.warningCount += 1;
    }
    if (response[0]?.CLR === "Y" && record.MENDETORY === "Y") {
      refs.current.errCount += 1;
    }

    if (
      (index + 1) % 11 === 0 ||
      (index + 1) % 12 === 0 ||
      (index + 1) % 13 === 0 ||
      (index + 1) % 14 === 0 ||
      ((index + 1) % 20 === 0 || (index + 1) % 21) === 0
    ) {
      setState((prev) => ({ ...prev, batchCount: prev.batchCount + 1 }));
    }

    return "continue";
  };
  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
  const processRecords = async (records) => {
    for (let i = 0; i < records.length; i++) {
      const result = await executeDayEndStep(records[i], i);

      refs.current.result = result;

      if (result === "stop") {
        updateEodRunningStatus();
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getValidateEod"]);
    };
  }, []);

  return {
    memoizedMetaData,
    reportMutation,
    updateData,
    DoEodMutation,
    updateRunningMutation,
    updateEodRunningStatus,
    sessionDtlMutation,
    handleMulltipleBranchEod,
    handleEodWarnings,
    processRecords,
  };
};
