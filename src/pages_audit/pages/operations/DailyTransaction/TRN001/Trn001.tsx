import { Button, Card, Dialog, Toolbar, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LinearProgress from "@mui/material/LinearProgress";
import { format, parse } from "date-fns";
import { useEffect, useState, useContext, useRef, Fragment } from "react";
import { useMutation, useQueries, useQuery } from "react-query";
import * as API from "./api";
import * as CommonApi from "../TRNCommon/api";
import { AuthContext } from "pages_audit/auth";
import "./Trn001.css";
import TRN001_Table from "./Table";
import DailyTransTabs from "../TRNHeaderTabs";
import { GeneralAPI } from "registry/fns/functions";
import { useCacheWithMutation } from "../TRNHeaderTabs/cacheMutate";
import { TRN001Context } from "./Trn001Reducer";
import RowsTable from "./rowsTable";

import {
  queryClient,
  usePopupContext,
  Alert,
  GradientButton,
  utilFunction,
  ClearCacheProvider,
  ClearCacheContext,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { DateRetrival } from "./DateRetrival/DataRetrival";
import { SingleAccountInterestReport } from "./DateRetrival/singleAccountInterestReport";
import { ViewStatement } from "pages_audit/acct_Inquiry/viewStatement";
import { getdocCD } from "components/utilFunction/function";
import { CreditAccountForm } from "../../contraEntry/form/creditAccountForm";
import { t } from "i18next";
import AcctNoShortcuts from "./acctNoShortcuts";
import {
  getHeaderDTL,
  getInterestCalculateReportDTL,
} from "./DateRetrival/api";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "../../payslip-issue-entry/DialogContext";

type Trn001Props = {
  screenFlag?: string;
};

const Trn001Main: React.FC<Trn001Props> = ({ screenFlag }) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);

  const {
    state,
    dispatch,
    handleSetDefaultBranch,
    handleAccTypeBlurCtx,
    handleAcctNoBlurCtx,
    getAcctNoValidationCtx,
    handleTrxCtx,
    getChqValidationCtx,
    handleDebitBlurCtx,
    handleDebitCtx,
    handleCreditCtx,
    handleCreditBlurCtx,
    getDateValidationCtx,
    getAmountValidationCtx,
    checkErrorsFn,
    deleteRowCtx,
    handleScrollBlurCtx,
    getTokenValidation,
    setFieldsError,
    updateRow,
    handleTrxBlurCtx,
    trxValidationCtx,
    clearAllFields,
    getBranchTypeValidCtx,
    handleSetDefSCD,
    focusOnField,
    induvidualUpdate,
    updateRowDirect,
  } = useContext(TRN001Context);

  // const [totalDebit, setTotalDebit] = useState(0);
  // const [totalCredit, setTotalCredit] = useState(0);
  const [loadingStates, setLoadingStates] = useState<any>([]);
  // const [viewOnly, setViewOnly] = useState(false);
  // const [cardsData, setCardsData] = useState<any>([]);
  // const [reqData, setReqData] = useState<any>([]);
  // const [selectedRow, setSelectedRow] = useState(null);

  const lastRowUnqID = useRef(null);
  const isBatchEntry = useRef(false);
  const acctNoRef = useRef<any>(null);
  const interestCalculateParaRef = useRef<any>(null);
  const [interestCalReportDTL, setInterestCalReportDTL] = useState<any>([]);
  const carousalCrdLastReq = useRef<any>(null);
  const [dateDialog, setDateDialog] = useState(false);
  const [singleAccountInterest, setSingleAccountInterest] = useState(false);
  const [isOpenPassbookStatement, setOpenPassbookStatement] = useState(false);
  const [passbookStatementPara, setPassbookStatementPara] = useState<any>({});
  let currentPath = useLocation()?.pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { getEntries } = useContext(ClearCacheContext);
  const {
    clearCache: clearTabsCache,
    error: tabsErorr,
    data: tabsDetails,
    setData: setTabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  }: any = useCacheWithMutation(
    "getTabsByParentTypeKeyTrn001",
    CommonApi.getTabsByParentType
  );

  useEffect(() => {
    induvidualUpdate([], "cardsData");
    // setCardsData([]);
    setTabsDetails([]);
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_ROWS", payload: state?.initialState });
      induvidualUpdate([], "cardsData");
      setTabsDetails([]);
      handleSetDefaultBranch(queriesResult?.[0]?.data, authState, 0);
      handleSetDefSCD(queriesResult?.[2]?.data, 0);
      induvidualUpdate(false, "viewOnly");
    };
  }, [docCD]);

  const { id: userId, branchCode } = authState?.user ?? {};
  const { companyID } = authState ?? {};
  const queriesResult = useQueries([
    {
      queryKey: ["getBranchList"],
      queryFn: () =>
        API.getBranchList({
          COMP_CD: companyID ?? "",
        }),
    },
    {
      queryKey: ["getAccTypeList"],
      queryFn: () =>
        API.getAccTypeList({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          USER_NAME: authState?.user?.id ?? "",
          DOC_CD: docCD ?? "",
        }),
    },
    screenFlag === "NPA_Entry"
      ? {
          queryKey: ["getNPASDCList"],
          queryFn: () =>
            API.getNPASDCList({
              USER_ID: userId ?? "",
              A_ENT_BRANCH_CD: branchCode ?? "",
              A_ENT_COMP_CD: companyID ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              A_SCREEN_REF: docCD ?? "",
            }),
        }
      : {
          queryKey: ["getSDCList"],
          queryFn: () =>
            API.getSDCList({
              USER_ID: userId ?? "",
              BRANCH_CD: branchCode ?? "",
              COMP_CD: companyID ?? "",
            }),
        },
    screenFlag === "NPA_Entry"
      ? {
          queryKey: ["getNPATRXList"],
          queryFn: () =>
            API.getNPATRXList({
              USER_ID: userId ?? "",
              screenFlag: screenFlag,
            }),
        }
      : {
          queryKey: ["getTRXList"],
          queryFn: () =>
            API.getTRXList({
              USER_ID: userId ?? "",
              screenFlag: screenFlag,
            }),
        },
    {
      queryKey: ["getParameters"],
      queryFn: () =>
        API.getParameters({
          ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
          ENT_COMP_CD: authState?.companyID ?? "",
          SCREEN_REF: docCD ?? "",
          USERROLE: authState?.role ?? "",
        }),
    },
  ]);
  const parametres = queriesResult[4]?.data ?? [];

  useEffect(() => {
    if (queriesResult?.[0]?.data?.length > 0) {
      handleSetDefaultBranch(queriesResult?.[0]?.data, authState, 0);
    }
  }, [queriesResult?.[0]?.data, docCD, authState?.user?.branchCode]);
  useEffect(() => {
    if (queriesResult?.[1]?.data?.length > 0) {
      focusOnField(acctNoRef?.current, 0, "ACC_TYPE");
    }
  }, [queriesResult?.[1]?.data, docCD]);

  useEffect(() => {
    handleSetDefSCD(queriesResult?.[2]?.data, 0);
  }, [queriesResult?.[2]?.data]);

  useEffect(() => {
    if (queriesResult?.[3]?.data?.length > 0) {
      induvidualUpdate(queriesResult?.[3]?.data, "trxOption");
    }
  }, [queriesResult?.[3]?.data]);

  const getCarousalCards = useMutation(CommonApi?.getCarousalCards, {
    onSuccess: (data: any, variables: any) => {
      const currVal = state?.rows?.find(
        (row) => row?.unqID === variables?.reqData?.unqID
      );
      induvidualUpdate(data, "cardsData");
      induvidualUpdate(variables?.reqData, "reqData");

      if (Boolean(currVal?.trxFocusFlag) && Boolean(currVal?.accNo)) {
        focusOnField(
          acctNoRef?.current,
          variables?.reqData?.unqID,
          screenFlag === "contraEntry"
            ? parametres?.[0]?.DIS_SDC === "Y"
              ? "REMARKS"
              : "SDC"
            : "TRX"
        );
      } else {
        focusOnField(acctNoRef?.current, variables?.reqData?.unqID, "ACCT_NO");
      }
    },
    onError: (error: any, variables: any) => {
      induvidualUpdate([], "cardsData");
    },
  });

  const getAccNoValidation = useMutation(GeneralAPI?.getAccNoValidation, {
    onSuccess: async (data: any, variables: any) => {
      const rowUnqID = variables.unqID;
      let shouldCallCarousalCards = false;
      let openInsuranceTab = false;

      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      if (state?.rows?.length > 0) {
        for (let i = 0; i < data?.MSG?.length; i++) {
          if (data?.MSG?.length > 0) {
            const status: any = data?.MSG[i]?.O_STATUS;
            const message = data?.MSG[i]?.O_MESSAGE;
            const chequeNo = data?.CHEQUE_NO ?? "";
            if (status === "999") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: data?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
                message,
                icon: "ERROR",
              });
              if (btnNm === "Ok") {
                updateRow(rowUnqID, (row) =>
                  clearAllFields(rowUnqID, row, {
                    accNo: "",
                    accNoPrevVal: "",
                    bugMsgAccNo: t("AccountNumberRequired"),
                  })
                );
                focusOnField(acctNoRef?.current, rowUnqID, "ACCT_NO");

                if (data?.MSG[i]?.O_COLUMN_NM === "NOTFOUND") {
                  shouldCallCarousalCards = true;
                } else {
                  shouldCallCarousalCards = false;
                }
              }
            } else if (status === "99") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: data?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
                message,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
                loadingBtnName: ["Yes"],
                defFocusBtnName:
                  data?.MSG[i]?.O_COLUMN_NM === "FREEZE_AC" ? "No" : "Yes",
              });
              if (btnNm === "No") {
                if (data?.MSG[i]?.O_COLUMN_NM !== "FREEZE_AC") {
                  if (data?.MSG[i]?.O_COLUMN_NM === "INSUR") {
                    openInsuranceTab = true;
                  } else {
                    openInsuranceTab = false;
                  }
                  updateRow(rowUnqID, (row) =>
                    clearAllFields(rowUnqID, row, {
                      accNo: "",
                      accNoPrevVal: "",
                      bugMsgAccNo: t("AccountNumberRequired"),
                    })
                  );
                  focusOnField(acctNoRef?.current, rowUnqID, "ACCT_NO");
                  setLoadingState(rowUnqID, "ACCTNO", false);
                  break;
                }
              } else if (btnNm === "Yes") {
                if (data?.MSG[i]?.O_COLUMN_NM === "FREEZE_AC")
                  updateRow(rowUnqID, (row) =>
                    clearAllFields(rowUnqID, row, {
                      accNo: variables?.ACCT_CD,
                      accNoPrevVal: variables?.ACCT_CD,
                      bugMsgAccNo: "",
                    })
                  );

                if (data?.MSG[i]?.O_COLUMN_NM === "FREEZE_AC") {
                  await new Promise<void>((resolve) => {
                    const postData = GeneralAPI.doAccountFreeze({
                      ENT_COMP_CD: authState?.companyID ?? "",
                      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                      COMP_CD: variables?.COMP_CD ?? "",
                      BRANCH_CD: variables?.BRANCH_CD ?? "",
                      ACCT_TYPE: variables?.ACCT_TYPE ?? "",
                      ACCT_CD: variables?.ACCT_CD ?? "",
                    }).then(
                      (data: any) => {
                        resolve();
                      },
                      (error: any) => {
                        MessageBox({
                          messageTitle: "Alert",
                          message: error?.error_msg ?? "Error",
                          icon: "WARNING",
                        }).then(() => {
                          resolve();
                        });
                      }
                    );
                  });
                }
              }
            } else if (status === "9") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: data?.MSG[i]?.O_MSG_TITLE ?? "Alert",
                message,
                icon: "WARNING",
              });
            } else if (status === "0") {
              updateRow(rowUnqID, (row) => ({
                ...row,
                accNo: variables?.ACCT_CD,
                NPA_CD: data?.NPA_CD ?? "",
                cNo: chequeNo,
                TYPE_CD: data?.TYPE_CD ?? "",
                acctNoFlag: { [rowUnqID]: true },
                accName: data?.ACCT_NM ?? "",
                // focusFieldKey: "TRX_FOC",
                accNoPrevVal: variables?.ACCT_CD,
                trxFocusFlag: true,
                isAcctValid: true,
              }));
              // shouldCallCarousalCards = true;
            }
          }
          setLoadingState(rowUnqID, "ACCTNO", false);
        }

        if (!Boolean(shouldCallCarousalCards)) {
          variables = Boolean(openInsuranceTab)
            ? { ...variables, INSUR: true }
            : variables;
          induvidualUpdate(variables, "reqData");
          carousalCrdLastReq.current = variables;
          setTimeout(() => {
            getCarousalCards.mutate({ reqData: variables });
          }, 0);
        } else {
          induvidualUpdate({ ...variables, ACCT_CD: "" }, "reqData");

          induvidualUpdate([], "cardsData");
          carousalCrdLastReq.current = {};
        }
        CloseMessageBox();
        // return shouldCallCarousalCards;
      }
    },
    onError: (error: any, variables: any) => {
      // enqueueSnackbar(error?.error_msg, { variant: "error" });
      const rowUnqID = variables?.unqID;
      setLoadingState(rowUnqID, "ACCTNO", false);
      setFieldsError({
        updUnqId: rowUnqID,
        payload: { bugMsgAccNo: error?.error_msg },
      });
      CloseMessageBox();
    },
  });

  const getInterestCalculatePara = useMutation(API.getInterestCalculatePara, {
    onSuccess: async (data: any, variables: any) => {
      const rowUnqID = variables?.unqID;
      let currentRowData = state?.rows?.find(
        (item) => item?.unqID === rowUnqID
      );
      setLoadingState(rowUnqID, "ACCTNO", false);
      const combinedData = { ...currentRowData, ...data?.[0] };
      interestCalculateParaRef.current = [
        ...(interestCalculateParaRef.current || []),
        combinedData,
      ];
      if (data?.[0]?.OPEN_DATE_PARA === "Y") {
        setDateDialog(true);
        trackDialogClass("Retrieve");
      } else if (data?.[0]?.OPEN_DATE_PARA === "N") {
        setSingleAccountInterest(true);
        getInterestCalculateReport.mutate({
          COMP_CD: currentRowData?.branch?.info?.COMP_CD ?? "",
          BRANCH_CD: currentRowData?.branch?.value ?? "",
          ACCT_TYPE: currentRowData?.accType?.value ?? "",
          ACCT_CD: currentRowData?.accNo ?? "",
          WORKING_DATE: authState?.workingDate ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
          FROM_DT: data?.[0]?.FROM_DT
            ? format(new Date(data?.[0]?.FROM_DT), "dd/MMM/yyyy")
            : "",
          TO_DT: data?.[0]?.TO_DT
            ? format(new Date(data?.[0]?.TO_DT), "dd/MMM/yyyy")
            : "",
          PARENT_CODE: data?.[0]?.PARENT_CODE ?? "",
          PARENT_TYPE: data?.[0]?.PARENT_TYPE ?? "",
          GD_DATE: authState?.workingDate ?? "",
          SCREEN_REF: docCD ?? "",
        });
      }
    },
    onError: (error: any, variables: any) => {
      const rowUnqID = variables?.unqID;
      setLoadingState(rowUnqID, "ACCTNO", false);
      // enqueueSnackbar(error?.error_msg, {
      //   variant: "error",
      // });
    },
  });
  const getInterestCalculateReport = useMutation(
    getInterestCalculateReportDTL,
    {
      onSuccess: async (data: any, variables: any) => {
        for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
          if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle:
                data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "0") {
            getHeaderDtl.mutate({ SCREEN_REF: docCD ?? "" });
          }
        }
        CloseMessageBox();
      },
      onError: async (error: any, variables: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
        getHeaderDtl.mutate({ SCREEN_REF: docCD ?? "" });
      },
    }
  );
  const getHeaderDtl = useMutation(getHeaderDTL, {
    onSuccess: async (data: any, variables: any) => {
      CloseMessageBox();
    },
    onError: async (error: any, variables: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "Somethingwenttowrong",
        icon: "ERROR",
      });
    },
  });

  const getChqValidation = useMutation(GeneralAPI.getChequeNoValidation, {
    onSuccess: async (data: any, variables: any) => {
      const rowUnqID = variables?.unqID;
      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      await getChqValidationCtx({
        updUnqId: rowUnqID,
        data,
        getBtnName,
        chequeDate: authState?.workingDate,
        setLoadingState,
        acctNoRef,
      });
      setLoadingState(rowUnqID, "CHQNOVALID", false);
    },
    onError: (error: any, variables: any) => {
      // enqueueSnackbar(error?.error_msg, {
      //   variant: "error",
      // });
      const rowUnqID = variables?.unqID;
      setLoadingState(rowUnqID, "CHQNOVALID", false);
      setFieldsError({
        updUnqId: rowUnqID,
        payload: { bugMsgCNo: error?.error_msg },
      });
    },
  });

  const getAmountValidation = useMutation(API.getAmountValidation, {
    onSuccess: (data: any, variables: any) => {
      const rowUnqID = variables?.unqID;
      const crDbFlag = variables?.FLAG;
      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      getAmountValidationCtx({
        updUnqId: rowUnqID,
        data,
        getBtnName,
        setLoadingState,
        totalDebit: state?.totalDebit,
        totalCredit: state?.totalCredit,
        handleAddRow,
        crDbFlag,
        handleScrollSave1,
        acctNoRef,
      });
    },
    onError: (error: any, variables: any) => {
      // enqueueSnackbar(error?.error_msg, {
      //   variant: "error",
      // });
      const rowUnqID = variables?.unqID;
      const crDbFlag = variables?.FLAG;
      setLoadingState(
        rowUnqID,
        crDbFlag === "D" ? "AMNTVALIDDR" : "AMNTVALIDCR",
        false
      );
      setFieldsError({
        updUnqId: rowUnqID,
        payload: {
          bugMsgDebit: crDbFlag === "D" ? error?.error_msg : "",
          bugMsgCredit: crDbFlag === "D" ? "" : error?.error_msg,
        },
      });
    },
  });
  const getTrxValidation = useMutation(API.getTrxValidate, {
    onSuccess: async (data: any, variables: any) => {
      const cardData: any = await getCardColumnValue();
      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      setLoadingState(variables?.unqID, "TRXVALID", false);
      trxValidationCtx({
        updUnqId: variables?.unqID,
        data,
        getBtnName,
        chequeDate: authState?.workingDate,
        cardData,
        acctNoRef,
        parametres,
      });
    },
    onError: (error: any, variables: any) => {
      setLoadingState(variables?.unqID, "TRXVALID", false);
      setFieldsError({
        updUnqId: variables?.unqID,
        payload: { bugMsgTrx: error?.error_msg ?? "" },
      });
    },
  });

  const getDateValidation = useMutation(API.getChqDateValidation, {
    onSuccess: async (data: any, variables: any) => {
      const rowUnqID = variables?.unqID;

      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      await getDateValidationCtx({
        updUnqId: rowUnqID,
        data,
        getBtnName,
        chequeDate: authState?.workingDate,
        setLoadingState,
        acctNoRef,
      });
    },
    onError: (error: any, variables: any) => {
      const rowUnqID = variables?.unqID;
      setLoadingState(rowUnqID, "CHQDATE", false);
      // enqueueSnackbar(error?.error_msg, {
      //   variant: "error",
      // });
      setFieldsError({
        updUnqId: rowUnqID,
        payload: { bugMsgDate: error?.error_msg },
      });
    },
  });

  const saveScroll = useMutation(
    screenFlag === "NPA_Entry" ? API.saveNPAEntry : API.saveScroll,
    {
      onSuccess: async (res: any, varieble: any) => {
        let finalMessage;
        const dynamicMessage = res?.data
          ?.map((item) => `${item?.SCROLL1 ?? ""} / ${item?.TRAN_CD ?? ""}\n`)
          ?.join("");

        finalMessage =
          res?.data?.length > 0
            ? (finalMessage = `${t(`BatchEntSaveMsg`)}${dynamicMessage}`)
            : (finalMessage = "TransactionSuccessfullyPosted");

        setTimeout(async () => {
          const msgBoxRes = await MessageBox({
            messageTitle: "Success",
            message: finalMessage ?? "",
            defFocusBtnName: "Ok",
            icon: "SUCCESS",
          });
          if (msgBoxRes === "Ok") {
            if (
              screenFlag === "NPA_Entry" ||
              (screenFlag === "DAILY_TRN" &&
                (parametres?.[0]?.PARA_722 === "Y" ||
                  parametres?.[0]?.PARA_722 === "N"))
            ) {
              handleAddRow(varieble?.[0]?.unqId);
              if (parametres?.[0]?.PARA_722 === "Y") {
                focusOnField(
                  acctNoRef?.current,
                  varieble?.[0]?.unqId + 1,
                  "ACCT_NO"
                );
              } else {
                focusOnField(
                  acctNoRef?.current,
                  varieble?.[0]?.unqId + 1,
                  "ACC_TYPE"
                );
              }
            } else {
              handleReset("RESET");
            }
          }
        }, 50);
        CloseMessageBox();
      },
      onError: (error: any) => {
        CloseMessageBox();
      },
    }
  );

  const branchTypeValidate = useMutation(API?.getBranch_TypeValidate, {
    onSuccess: async (data: any, variables: any) => {
      const rowUnqID = variables?.unqID;

      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };

      const returnValue = await getBranchTypeValidCtx({
        updUnqId: rowUnqID,
        data,
        getBtnName,
        setLoadingState,
        acctNoRef,
      });

      if (Boolean(returnValue)) {
        const row = state?.rows?.find((row) => row?.unqID === rowUnqID);
        const reqData = {
          COMP_CD: row?.branch?.info?.COMP_CD ?? "",
          ACCT_TYPE: row?.accType?.value ?? "",
          BRANCH_CD: row?.branch?.value ?? "",
        };
        induvidualUpdate(reqData, "reqData");

        handleGetHeaderTabs(reqData);
      }
    },
    onError: (error: any, variables: any) => {
      const rowUnqID = variables?.unqID;
      setLoadingState(rowUnqID, "ACCTTYPE", false);
      setFieldsError({
        updUnqId: rowUnqID,
        payload: { bugMsgAccType: error?.error_msg },
      });
    },
  });

  const handleAccTypeBlur = (unqID) => {
    handleAccTypeBlurCtx({
      updUnqId: unqID,
      mutationFn: branchTypeValidate,
      setLoadingState,
    });
  };

  const handleAccNoBlur = (updUnqId) => {
    const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);

    if (updUnqId === currVal?.unqID) {
      if (currVal?.accNo) {
        if (currVal?.accNo?.trim() !== currVal?.accNoPrevVal?.trim()) {
          const paddedAcctNo = Boolean(currVal?.accNo)
            ? utilFunction?.getPadAccountNumber(
                currVal.accNo,
                currVal?.accType?.info
              )
            : "";

          updateRow(updUnqId, (row) =>
            clearAllFields(updUnqId, row, {
              bugMsgAccNo: "",
            })
          );

          if (
            Boolean(paddedAcctNo) &&
            Boolean(row?.accType?.value) &&
            Boolean(row?.branch?.value) &&
            !Boolean(dateDialog)
          ) {
            const data = {
              COMP_CD: row?.branch?.info?.COMP_CD ?? "",
              ACCT_TYPE: row?.accType?.value ?? "",
              ACCT_CD: paddedAcctNo ?? "",
              PARENT_TYPE: row?.accType?.info?.PARENT_TYPE ?? "",
              PARENT_CODE: row?.accType?.info?.PARENT_CODE ?? "",
              BRANCH_CD: row?.branch?.value ?? "",
              SCREEN_REF: docCD ?? "",
              unqID: updUnqId,
            };

            setLoadingState(updUnqId, "ACCTNO", true);
            getAccNoValidation?.mutate(data);
          }
        }
      } else {
        updateRow(updUnqId, (row) =>
          clearAllFields(updUnqId, row, {
            bugMsgAccNo: t("AccountNumberRequired"),
            bugAccNo: true,
            acctNoFlag: { [updUnqId]: false },
            accNoPrevVal: "",
            isAcctValid: false,
          })
        );
      }
    }
  };

  const handleTrx = (event, value, unqID) => {
    let defSdc = (queriesResult?.[2]?.data ?? []).find(
      (option) => option?.value?.trim() === value?.code?.trim()
    );
    if (value?.value === "3" || value?.value === "6") {
      isBatchEntry.current = true;
    } else {
      isBatchEntry.current = false;
    }

    handleTrxCtx({
      updUnqId: unqID,
      value,
      defSdc,
    });
  };

  const handleTrxBlur = async (updUnqId, chequeDate) => {
    const cardData: any = await getCardColumnValue();
    const getBtnName = async (msgObj) => {
      let btnNm = await MessageBox(msgObj);
      return { btnNm, msgObj };
    };
    handleTrxBlurCtx({
      updUnqId,
      mutationFn: getTrxValidation,
      getBtnName,
      setLoadingState,
      parametres,
    });
  };

  const handleDebit = async (event, unqID) => {
    const { value } = event?.target;
    if (state?.rows?.length > 0) {
      const newRows = (state?.rows ?? [])?.map((row) => {
        if (row?.unqID === unqID) {
          return { ...row, debit: value };
        }
        return row;
      });
      const newRow = newRows?.find((row) => row.unqID === unqID);
      handleDebitCtx({ updUnqId: unqID, newRow });
      handleTotal(newRows ?? []);
    }
  };

  const getCardColumnValue = () => {
    const keys = [
      "WITHDRAW_BAL",
      "TRAN_BAL",
      "LIEN_AMT",
      "CONF_BAL",
      "UNCL_BAL",
      "DRAWING_POWER",
      "LIMIT_AMOUNT",
      "HOLD_BAL",
      "AGAINST_CLEARING",
      "MIN_BALANCE",
      "OD_APPLICABLE",
      "INST_NO",
      "INST_RS",
      "OP_DATE",
      "PENDING_AMOUNT",
      "STATUS",
      "INST_DUE_DT",
      "SHADOW_CLEAR",
    ];

    const cardValues = keys?.reduce((acc, key) => {
      const item: any = state?.cardsData?.find(
        (entry: any) => entry?.COL_NAME === key
      );
      acc[key] = item?.COL_VALUE;
      return acc;
    }, {});
    return cardValues;
  };

  const handleDebitBlur = async (event, unqID) => {
    const currVal = state?.rows?.find((row) => row?.unqID === unqID);
    if (!Boolean(currVal?.debit?.trim())) {
      updateRow(unqID, (row) => ({
        ...row,
        bugMsgDebit: "Debit Amount is Required",
      }));
    }
    if (
      currVal?.debit?.trim() !== currVal?.amountPreVal?.trim() &&
      Number(currVal?.debit?.trim()) !== 0
    ) {
      const cardData: any = await getCardColumnValue();
      if (Boolean(cardData) && Number(state?.totalDebit) > 0) {
        lastRowUnqID.current = unqID;

        updateRow(unqID, (row) => ({
          ...row,
          amountPreVal: currVal?.debit ?? "",
        }));
        handleDebitBlurCtx({
          updUnqId: unqID,
          value: event?.target?.value,
          setLoadingState,
          mutationFn: getAmountValidation,
          authState,
          cardData,
        });
      }
    }
  };

  const handleCredit = (event, unqID) => {
    const { value } = event?.target;
    if (state?.rows?.length > 0) {
      const newRows = (state?.rows ?? [])?.map((row) => {
        if (row?.unqID === unqID) {
          return { ...row, credit: value };
        }
        return row;
      });
      const newRow = newRows?.find((row) => row?.unqID === unqID);
      handleCreditCtx({ updUnqId: unqID, newRow });
      handleTotal(newRows ?? []);
    }
  };

  const handleCreditBlur = async (event, unqID) => {
    const currVal = state?.rows?.find((row) => row?.unqID === unqID);
    if (!Boolean(currVal?.credit?.trim())) {
      updateRow(unqID, (row) => ({
        ...row,
        bugMsgCredit: "Credit Amount is Required",
      }));
    }
    if (
      currVal?.credit?.trim() !== currVal?.amountPreVal?.trim() &&
      Number(currVal?.credit?.trim()) !== 0
    ) {
      updateRow(unqID, (row) => ({
        ...row,
        amountPreVal: currVal?.credit ?? "",
      }));
      lastRowUnqID.current = unqID;
      const cardData: any = await getCardColumnValue();
      handleCreditBlurCtx({
        updUnqId: unqID,
        value: event?.target?.value,
        setLoadingState,
        cardData,
        authState,
        mutationFn: getAmountValidation,
      });
    }
  };

  const handleAddRow = async (unqId) => {
    const newDataFn = () => {
      const trx3 = queriesResult?.[3]?.data.find(
        (option) => option.code == "3"
      );
      const trx6 = queriesResult?.[3]?.data.find(
        (option) => option.code == "6"
      );
      const isCredit = state?.totalDebit > state?.totalCredit;
      const newRowTrx =
        screenFlag === "TRNF_BATCH" && state?.totalDebit !== state?.totalCredit
          ? trx3
          : "";
      let defSdc = (queriesResult?.[2]?.data ?? []).find(
        (option) => option?.value?.trim() === newRowTrx?.code?.trim()
      );
      const debitDefer = !isCredit ? state?.totalCredit - state?.totalDebit : 0;
      const cerditDefer = isCredit ? state?.totalDebit - state?.totalCredit : 0;

      const maxUnqID = (state?.rows ?? [])?.reduce(
        (maxID, row) => Math.max(maxID, row?.unqID),
        0
      );
      const maxSrNo = (state?.rows ?? [])?.reduce(
        (maxSr, row) => Math.max(maxSr, row?.srNo),
        0
      );

      const defBranch = (queriesResult?.[0]?.data ?? [])?.find(
        (branch) => branch?.value === authState?.user?.branchCode
      );
      const currVal = state?.rows?.find((row) => row?.unqID === unqId);

      return {
        srNo: maxSrNo + 1,
        unqID: maxUnqID + 1,
        branch:
          screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
            ? currVal?.branch
            : defBranch,
        bugMsgBranchCode: "",
        accType:
          screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
            ? currVal?.accType
            : { label: "", value: "", info: {} },
        accTypePrevVal:
          screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
            ? currVal?.accTypePrevVal
            : "",
        bugMsgAccType: "",
        accNo:
          screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
            ? currVal?.accNo
            : "",
        // accNoPrevVal:
        //   screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
        //     ? currVal?.accNoPrevVal
        //     : "",
        // acctNoFlag:
        //   screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
        //     ? { [unqId + 1]: true }
        //     : {},
        // isAcctValid:
        //   screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
        //     ? currVal?.isAcctValid
        //     : false,
        bugAccNo: false,
        bugMsgAccNo: "",
        trx: newRowTrx,
        bugMsgTrx: "",
        scroll: "", //token
        bugMsgScroll: "",
        sdc: defSdc,
        bugMsgSdc: "",
        remark: defSdc?.label,
        bugMsgRemarks: "",
        cNo: "",
        bugCNo: false,
        bugMsgCNo: "",
        date: parse(authState?.workingDate, "dd/MMM/yyyy", new Date()),
        bugDate: false,
        bugMsgDate: "",
        debit: debitDefer,
        bugMsgDebit: "",
        credit: cerditDefer,
        bugMsgCredit: "",
        bug: false,
        isCredit: isCredit,
        scrollTally: "Y",
        branchPrevVal:
          screenFlag === "DAILY_TRN" && parametres?.[0]?.PARA_722 === "Y"
            ? currVal?.branchPrevVal
            : defBranch,
        // viewOnly: false,
      };
    };
    const errors = await checkErrorsFn();
    if (!Boolean(errors)) {
      if (
        lastRowUnqID?.current === state?.rows[state?.rows?.length - 1]?.unqID
      ) {
        const newData = newDataFn();
        dispatch({
          type: "ADD_NEW_ROW",
          payload: {
            newData: newData,
          },
        });
      }
    } else {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "Arequiredvalueismissing",
        icon: "ERROR",
      });
    }
  };

  const handleTotal = (rows) => {
    const calculateSum = (key) =>
      rows.reduce((acc, row) => acc + Number(row[key]), 0);
    const sumDebit = calculateSum("debit");
    const sumCredit = calculateSum("credit");
    induvidualUpdate(Number(sumDebit?.toFixed(3)), "totalDebit");
    induvidualUpdate(Number(sumCredit?.toFixed(3)), "totalCredit");
  };

  const handleReset = async (flag) => {
    if (flag === "OPEN_BOX") {
      const msgBoxRes = await MessageBox({
        messageTitle: "confirmation",
        message: "Are you sure you want to reset the data?",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });

      if (msgBoxRes === "Yes") {
        dispatch({
          type: "RESET_ROWS",
          payload: {},
        });
        induvidualUpdate(0, "totalDebit");

        induvidualUpdate(0, "totalCredit");
        induvidualUpdate(queriesResult?.[3]?.data, "trxOption");
        induvidualUpdate(false, "viewOnly");
        setTabsDetails([]);
        induvidualUpdate({}, "reqData");
        induvidualUpdate([], "cardsData");

        CloseMessageBox();
        handleSetDefaultBranch(queriesResult?.[0]?.data, authState, 0);
        handleSetDefSCD(queriesResult?.[2]?.data, 0);
        focusOnField(acctNoRef?.current, 0, "ACC_TYPE");
      } else if (msgBoxRes === "No") {
        CloseMessageBox();
      }
    } else {
      dispatch({
        type: "RESET_ROWS",
        payload: {},
      });
      induvidualUpdate(0, "totalDebit");
      induvidualUpdate(0, "totalCredit");
      induvidualUpdate(queriesResult?.[3]?.data, "trxOption");
      induvidualUpdate(false, "viewOnly");
      setTabsDetails([]);
      induvidualUpdate({}, "reqData");
      induvidualUpdate([], "cardsData");
      handleSetDefaultBranch(queriesResult?.[0]?.data, authState, 0);
      focusOnField(acctNoRef?.current, 0, "ACC_TYPE");
      handleSetDefSCD(queriesResult?.[2]?.data, 0);
    }
  };

  const setLoadingState = (rowIndex, fieldId, isLoading) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [rowIndex]: {
        ...(prevState[rowIndex] || {}),
        [fieldId]: isLoading,
      },
    }));
  };

  const checkLoading = Object?.keys(loadingStates)?.some((key) => {
    const loadingItems = [
      "ACCTNO",
      "AMNTVALIDCR",
      "AMNTVALIDDR",
      "CHQDATE",
      "CHQNOVALID",
      "TRXVALID",
      "TOKEN",
      "ACCTTYPE",
    ];
    return loadingItems?.some((loadingItem) => {
      return Boolean(loadingStates[key][loadingItem]);
    });
  });

  const handleScrollSave1 = async (unqId, crDbFlag) => {
    const errors = await checkErrorsFn();

    if (Boolean(errors)) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "Arequiredvalueismissing",
        icon: "ERROR",
      });
      return;
    }
    if (screenFlag === "TRNF_BATCH") {
      if (
        Boolean(isBatchEntry?.current) &&
        Boolean(state?.totalDebit !== state?.totalCredit)
      ) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: "ForPostingDebitCreditMatch",
          icon: "ERROR",
        });
        return;
      }
    }

    if (state?.cardsData?.length > 0) {
      const msgBoxRes = await MessageBox({
        messageTitle: "confirmation",
        message: "Are you sure you want to save the data?",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (msgBoxRes === "Yes") {
        handleScrollSave2(unqId);
      } else {
        updateRow(unqId, (row) => ({
          ...row,
          debit: "",
          credit: "",
          bugMsgDebit: crDbFlag === "D" ? "Debit Amount is Required" : "",
          bugMsgCredit: crDbFlag === "D" ? "" : "Credit Amount is Required",
          amountPreVal: "",
        }));

        focusOnField(
          acctNoRef?.current,
          unqId,
          crDbFlag === "D" ? "DBT_FLD" : "CRDT_FLD"
        );
        CloseMessageBox();
      }
    }
  };

  const handleScrollSave2 = (unqId) => {
    const currVal = state?.rows?.find((row) => row?.unqID === unqId);
    let arr =
      screenFlag === "NPA_Entry"
        ? {
            ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
            ENTERED_COMP_CD: authState?.companyID ?? "",
            SCREEN_REF: docCD,
            _isNewRow: true,
            TRAN_DTL: [
              {
                BRANCH_CD: currVal?.branch?.value ?? "",
                ACCT_TYPE: currVal?.accType?.value ?? "",
                ACCT_CD: currVal?.accNo?.padStart(6, "0").padEnd(20, " "),
                TYPE_CD: currVal?.trx?.code + "   ",
                SDC: currVal?.sdc?.value ?? "",
                REMARKS: currVal?.remark ?? "",
                CHEQUE_NO: currVal?.cNo ? currVal?.cNo : "",
                L_INST_DT: format(currVal?.date, "dd-MMM-yyyy"),
                AMOUNT: currVal?.isCredit
                  ? currVal?.credit
                  : currVal?.debit ?? "",
                SCROLL1: currVal?.scroll ? currVal?.scroll : "0",
                TRN_FLAG: "",
              },
            ],
          }
        : screenFlag === "DAILY_TRN"
        ? [
            {
              ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
              ENTERED_COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: currVal?.accType?.value ?? "",
              ACCT_CD: currVal?.accNo?.padStart(6, "0").padEnd(20, " "),
              TYPE_CD: currVal?.trx?.code + "   ",
              SCROLL1: currVal?.scroll ? currVal?.scroll : "0",
              SDC: currVal?.sdc?.value ?? "",
              REMARKS: currVal?.remark ?? "",
              CHEQUE_NO: currVal?.cNo ? currVal?.cNo : "",
              VALUE_DT: format(currVal?.date, "dd-MMM-yyyy"),
              AMOUNT: currVal?.isCredit
                ? currVal?.credit
                : currVal?.debit ?? "",
              BRANCH_CD: currVal?.branch?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              CURRENCY_CD: "00  ",
              CONFIRMED: "0",
              ENTERED_DATE: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
              unqId,
              TRN_FLAG: "",
            },
          ]
        : state?.rows.map((row) => {
            return {
              ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
              ENTERED_COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: row?.accType?.value ?? "",
              ACCT_CD: row?.accNo?.padStart(6, "0").padEnd(20, " "),
              TYPE_CD: row?.trx?.code + "   ",
              SCROLL1: row?.scroll ? row?.scroll : "0",
              SDC: row?.sdc?.value ?? "",
              REMARKS: row?.remark ?? "",
              CHEQUE_NO: row?.cNo ? row?.cNo : "",
              VALUE_DT: format(row?.date, "dd-MMM-yyyy"),
              AMOUNT: row?.isCredit ? row?.credit : row?.debit ?? "",
              BRANCH_CD: row?.branch?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              CURRENCY_CD: "00  ",
              CONFIRMED: "0",
              ENTERED_DATE: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
              TRN_FLAG: screenFlag === "TRNF_BATCH" ? "BT" : "",
              unqId,
            };
          });
    saveScroll.mutate(arr);
  };

  const handleGetHeaderTabs = (data) => {
    if (data?.ACCT_TYPE && data?.BRANCH_CD) {
      fetchTabsData({
        cacheId: data,
        reqData: data,
      });
    }
    return {};
  };

  useEffect(() => {
    if (Boolean(tabsDetails?.length > 0)) {
      if (acctNoRef?.current) {
        acctNoRef?.current?.focusInput(state?.selectedRow, "ACCT_NO");
      }
    }
  }, [tabsDetails]);

  const handleSetCards = (row) => {
    induvidualUpdate(row, "cardsData");
  };
  const handleSetAccInfo = (row) => {
    induvidualUpdate(row, "reqData");
  };

  useEffect(() => {
    const queries = [
      "getSIDetailList",
      "getLienDetailList",
      "getOWChqList",
      "getTempList",
      "getATMList",
      "getASBAList",
      "getACH_IWList",
      "getACH_OWList",
      "getInstructionList",
      "getGroupList",
      "getAPYList",
      "getAPBSList",
      "getPMBYList",
      "getJointDetailsList",
      "getTodayTransList",
      "getCheckDetailsList",
      "getSnapShotList",
      "getHoldChargeList",
      "getDocTemplateList",
      "getStopPayList",
      "getInsuranceList",
      "getDisbursementList",
      "getSubsidyList",
      "getSearchList",
      "getLimitList",
      "getStockList",
      "getParameters",
      "getBranchList",
      "getAccTypeList",
      "getNPASDCList",
      "getSDCList",
      "getNPATRXList",
      "getTRXList",
    ];
    return () => {
      clearTabsCache();
      queries?.forEach((query) => queryClient?.removeQueries(query));
    };
  }, [getEntries, docCD]);

  const removeRow = async (unqID) => {
    const buttonName = await MessageBox({
      messageTitle: "Confirmation",
      message: "AreyouSureyouwanttodeletethisrecord",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      deleteRowCtx({ updUnqId: unqID, handleTotal });
      CloseMessageBox();
    }
  };

  const tokenValidate = useMutation(GeneralAPI?.validateTokenScroll, {
    onSuccess: (data: any, variables: any) => {
      const rowUpdID = variables?.unqID ?? "";
      const getBtnName = async (msgObj) => {
        let btnNm = await MessageBox(msgObj);
        return { btnNm, msgObj };
      };
      getTokenValidation({
        updUnqId: rowUpdID,
        data,
        getBtnName,
        setLoadingState,
        acctNoRef,
      });
    },
    onError: (error: any, variables: any) => {
      const rowUnqID = variables?.unqID ?? "";
      setFieldsError({
        updUnqId: rowUnqID,
        payload: { bugMsgScroll: error?.error_msg },
      });
    },
  });

  const handleScrollBlur = (event, unqID) => {
    handleScrollBlurCtx({
      updUnqId: unqID,
      value: event?.target?.value ?? "",
      mutationFn: tokenValidate,
      authState,
      setLoadingState,
    });
  };

  const handleKeyUp = (event, unqID) => {
    // Check if Ctrl + I is pressed
    let reqParaDtl = state?.rows?.find((item) => item?.unqID === unqID);

    if (
      event.ctrlKey &&
      (event.key === "i" || event.key === "I") &&
      Boolean(reqParaDtl?.isAcctValid)
    ) {
      setLoadingState(unqID, "ACCTNO", true);
      setInterestCalReportDTL([]);
      interestCalculateParaRef.current = [];
      getInterestCalculatePara?.mutate({
        A_COMP_CD: reqParaDtl?.branch?.info?.COMP_CD ?? "",
        A_BRANCH_CD: reqParaDtl?.branch?.value ?? "",
        A_ACCT_TYPE: reqParaDtl?.accType?.value ?? "",
        A_ACCT_CD: reqParaDtl?.accNo ?? "",
        A_SCREEN_REF: docCD ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        unqID: unqID,
      });
    }
  };
  const handleDoubleClick = (event, unqID) => {
    const reqParaDtl = state?.rows?.find((item) => item?.unqID === unqID);
    if (
      Boolean(reqParaDtl?.branch?.value) &&
      Boolean(reqParaDtl?.accType?.value) &&
      Boolean(reqParaDtl?.accNo)
    ) {
      setPassbookStatementPara(reqParaDtl);
      setOpenPassbookStatement(true);
    }
  };
  const handlePassbookStatementClose = () => {
    setOpenPassbookStatement(false);
    setPassbookStatementPara({});
    induvidualUpdate(false, "selectedRow");
  };

  const maxUnqID = (state?.rows ?? [])?.reduce(
    (maxID, row) => Math?.max(maxID, row?.unqID),
    0
  );

  const row = state?.rows?.find((row) => row?.unqID === maxUnqID);

  const setViewOnlyFn = (value) => {
    induvidualUpdate(value, "viewOnly");
  };
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  let className = localStorage.getItem("commonClass");
  const [data, setData] = useState("");
  useEffect(() => {
    if (state?.rows?.[0]?.isOpenContraCreditForm) {
      trackDialogClass("contraCreditForm");
    } else if (state?.viewOnly) {
      trackDialogClass("viewOnly");
    } else {
      trackDialogClass("main");
    }
  }, [state?.rows?.[0]?.isOpenContraCreditForm, state?.viewOnly]);
  useEffect(() => {
    const newData =
      className !== null
        ? className
        : isOpenPassbookStatement
        ? "passbookRetrival"
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main"; // Default fallback

    setData(newData);
  }, [className, isOpenPassbookStatement, dialogClassNames, state]);

  useEnter(`${data}`);

  const headingWithButton = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
        position: "sticky",
        top: 0,
        background: "var(--theme-color5)",
        margin: "2px",
        width: "auto",
        marginBottom: "10px",
        height: "3vh",
      }}
    >
      <Toolbar
        sx={{
          paddingLeft: "24px",
          paddingRight: "24px",
          minHeight: "48px !important",
        }}
      >
        <Typography
          style={{ flexGrow: 1 }}
          sx={{
            color: "var(--theme-color2)",
            fontSize: "1.25rem",
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            fontWeight: 500,
            lineHeight: "1.6px",
            letterSpacing: "0.0075em",
          }}
        >
          {utilFunction.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          )}
        </Typography>
      </Toolbar>

      <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
        {!state?.viewOnly && (
          <>
            <GradientButton
              elevate
              className="RESET"
              disabled={
                Boolean(isTabsLoading) ||
                Boolean(checkLoading) ||
                Boolean(getCarousalCards?.isLoading)
              }
              onClick={() => handleReset("OPEN_BOX")}
            >
              <RestartAltIcon /> {t("Reset")}
            </GradientButton>

            <GradientButton
              elevate
              className="CALCULATOR"
              onClick={() => (window.location.href = "Calculator:///")}
            >
              {t("Calculator")}
            </GradientButton>

            <GradientButton
              elevate
              className="VIEW_ALL"
              onClick={() => {
                induvidualUpdate(true, "viewOnly");
                induvidualUpdate([], "cardsData");
                setTabsDetails([]);
              }}
              disabled={
                Boolean(isTabsLoading) ||
                Boolean(checkLoading) ||
                Boolean(getCarousalCards?.isLoading)
              }
            >
              {t("ViewAll")}
            </GradientButton>
          </>
        )}
      </div>
    </div>
  );

  let maxHeight: string;

  if (window.innerHeight >= 900) {
    maxHeight = "92vh";
  } else if (window.innerHeight >= 700) {
    maxHeight = "90vh";
  } else {
    maxHeight = "88vh";
  }
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: maxHeight,
          overflow: "auto",
          marginTop: "-5px",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--theme-color5)",
            padding: "7px 3px 0 3px",
            margin: "4px",
            boxShadow:
              "rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px",
          }}
        >
          {headingWithButton}
        </div>
        <DailyTransTabs
          //@ts-ignore
          heading={undefined}
          tabsData={tabsDetails}
          cardsData={state?.cardsData}
          reqData={state?.reqData}
          parametres={parametres}
          occupiedHeight={{ min: "585px", max: "585px" }}
          screenFlag={"TRN/001"}
        />
        <div className="main" style={{ flex: 0.3 }}>
          {!Boolean(state?.viewOnly) && (
            <>
              {saveScroll.isError ||
              isTabsError ||
              getInterestCalculatePara?.isError ||
              (getCarousalCards?.isError &&
                (!getCarousalCards?.error?.error_msg?.includes("Timeout") ||
                  !getCarousalCards?.error?.error_msg?.includes(
                    "AbortError"
                  ))) ? (
                <Fragment>
                  <Alert
                    severity={"error"}
                    errorMsg={
                      (saveScroll.error?.error_msg ||
                        tabsErorr?.error_msg ||
                        getInterestCalculatePara?.error?.error_msg ||
                        getCarousalCards?.error?.error_msg) ??
                      t("Somethingwenttowrong")
                    }
                    errorDetail={
                      saveScroll?.error?.error_detail ||
                      tabsErorr?.error_detail ||
                      getInterestCalculatePara?.error?.error_detail ||
                      getCarousalCards?.error?.error_detail
                    }
                  />
                </Fragment>
              ) : null}
              <Card
                className="ACCOUNT_DTL"
                sx={{
                  boxShadow: "0px 1px 4px -1px #999999",
                  borderRadius: "5px",
                  padding: "8px",
                  margin: "4px",
                  marginBottom: "10px",
                  // overflow: "auto",
                  // flex: 0.3,
                }}
              >
                {Boolean(isTabsLoading) ||
                Boolean(getCarousalCards?.isLoading) ? (
                  <LinearProgress color="secondary" />
                ) : null}

                <RowsTable
                  rows={state?.rows ?? []}
                  queriesResult={queriesResult}
                  handleAccTypeBlur={handleAccTypeBlur}
                  handleAccNoBlur={handleAccNoBlur}
                  loadingStates={loadingStates}
                  handleTrx={handleTrx}
                  setLoadingState={setLoadingState}
                  getChqValidation={getChqValidation}
                  getDateValidation={getDateValidation}
                  // viewOnly={viewOnly}
                  handleDebit={handleDebit}
                  handleDebitBlur={handleDebitBlur}
                  handleCredit={handleCredit}
                  handleCreditBlur={handleCreditBlur}
                  // totalDebit={state?.totalDebit}
                  // totalCredit={state?.totalCredit}
                  // cardsData={state?.cardsData}
                  // tabsDetails={tabsDetails}
                  parametres={parametres}
                  handleGetHeaderTabs={handleGetHeaderTabs}
                  getCarousalCards={getCarousalCards}
                  carousalCrdLastReq={carousalCrdLastReq}
                  // setReqData={setReqData}
                  isTabsLoading={isTabsLoading}
                  checkLoading={checkLoading}
                  isCardsLoading={getCarousalCards?.isLoading}
                  ref={acctNoRef}
                  removeRow={removeRow}
                  handleScrollBlur={handleScrollBlur}
                  onKeyUp={handleKeyUp}
                  onDoubleClick={handleDoubleClick}
                  screenFlag={screenFlag}
                  handleTrxBlur={handleTrxBlur}
                  // setSelectedRow={setSelectedRow}
                  // selectedRow={selectedRow}
                />
              </Card>
            </>
          )}
        </div>
      </div>
      {state?.viewOnly && (
        <TRN001_Table
          handleGetHeaderTabs={handleGetHeaderTabs}
          handleSetCards={handleSetCards}
          handleSetAccInfo={handleSetAccInfo}
          setViewOnly={setViewOnlyFn}
          screenFlag={screenFlag}
          state={state}
          tabAPIData={{
            isTabsLoading,
            isTabsError,
            tabsErorr,
            setTabsDetails,
          }}
        />
      )}
      {dateDialog && (
        <DateRetrival
          closeDialog={() => {
            setDateDialog(false);
            focusOnField(
              acctNoRef?.current,
              interestCalculateParaRef?.current?.[0]?.unqID,
              "ACCT_NO"
            );
            trackDialogClass("");
          }}
          open={dateDialog}
          reqData={{
            COMP_CD:
              interestCalculateParaRef?.current?.[0]?.branch?.info?.COMP_CD ??
              "",
            BRANCH_CD:
              interestCalculateParaRef?.current?.[0]?.branch?.value ?? "",
            ACCT_TYPE:
              interestCalculateParaRef?.current?.[0]?.accType?.value ?? "",
            ACCT_CD: interestCalculateParaRef?.current?.[0]?.accNo ?? "",
            PARENT_CODE: getInterestCalculatePara?.data?.[0]?.PARENT_CODE ?? "",
            PARENT_TYPE: getInterestCalculatePara?.data?.[0]?.PARENT_TYPE ?? "",
            FROM_DT: getInterestCalculatePara?.data?.[0]?.FROM_DT ?? "",
            TO_DT: getInterestCalculatePara?.data?.[0]?.TO_DT ?? "",
            DISABLE_FROM_DT:
              getInterestCalculatePara?.data?.[0]?.DISABLE_FROM_DT ?? "",
            DISABLE_TO_DT:
              getInterestCalculatePara?.data?.[0]?.DISABLE_TO_DT ?? "",
          }}
          reportDTL={setInterestCalReportDTL}
          openReport={() => {
            setDateDialog(false);
            setSingleAccountInterest(true);
          }}
        />
      )}
      {singleAccountInterest && (
        <SingleAccountInterestReport
          open={singleAccountInterest}
          date={
            interestCalReportDTL?.[0] ?? getInterestCalculatePara?.data?.[0]
          }
          reportHeading={interestCalReportDTL?.[2] ?? getHeaderDtl?.data?.[0]}
          reportDetail={
            interestCalReportDTL?.[1] ?? getInterestCalculateReport?.data?.[0]
          }
          acctInfo={{
            BRANCH_CD:
              interestCalculateParaRef?.current?.[0]?.branch?.value ?? "",
            ACCT_TYPE:
              interestCalculateParaRef?.current?.[0]?.accType?.value ?? "",
            ACCT_CD: interestCalculateParaRef?.current?.[0]?.accNo ?? "",
            PARENT_TYPE: getInterestCalculatePara?.data?.[0]?.PARENT_TYPE ?? "",
          }}
          closeDialog={() => {
            setSingleAccountInterest(false);
            focusOnField(
              acctNoRef?.current,
              interestCalculateParaRef?.current?.[0]?.unqID,
              "ACCT_NO"
            );
            trackDialogClass("");
          }}
          isLoader={
            getInterestCalculateReport?.isLoading || getHeaderDtl?.isLoading
          }
        />
      )}
      {isOpenPassbookStatement ? (
        <Dialog
          open={isOpenPassbookStatement}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="md"
        >
          <ViewStatement
            rowsData={[
              {
                data: {
                  ACCT_CD: passbookStatementPara?.accNo ?? "",
                  ACCT_TYPE: passbookStatementPara?.accType?.value ?? "",
                  BRANCH_CD: passbookStatementPara?.branch?.value ?? "",
                  PARENT_CODE:
                    passbookStatementPara?.accType?.info?.PARENT_CODE,
                },
              },
            ]}
            open={isOpenPassbookStatement}
            onClose={handlePassbookStatementClose}
            screenFlag={"ACCT_INQ"}
            close={() => {}}
          />
        </Dialog>
      ) : null}

      {state?.rows?.[0]?.isOpenContraCreditForm ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="md"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              updateRow(0, (row) => ({
                ...row,
                isOpenContraCreditForm: false,
              }));
            }
          }}
        >
          <CreditAccountForm saveScroll={saveScroll} parametres={parametres} />
        </Dialog>
      ) : null}
      <AcctNoShortcuts state={state} unqId={state?.selectedRow} />
    </>
  );
};
export const Trn001: React.FC<Trn001Props> = ({ screenFlag }) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <Trn001Main screenFlag={screenFlag} />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
