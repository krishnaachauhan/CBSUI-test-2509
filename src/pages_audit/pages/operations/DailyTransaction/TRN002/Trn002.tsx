import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import "./Trn002.css";
import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { useSnackbar } from "notistack";

import { TRN002_TableMetaData } from "./gridMetadata";
import * as trn2Api from "./api";
import * as CommonApi from "../TRNCommon/api";
import { AuthContext } from "pages_audit/auth";
import DailyTransTabs from "../TRNHeaderTabs";
import { useCacheWithMutation } from "../TRNHeaderTabs/cacheMutate";
import { DynFormHelperText, PaperComponent } from "../TRN001/components";
import { TRN001Context } from "../TRN001/Trn001Reducer";
import {
  queryClient,
  RemarksAPIWrapper,
  GridWrapper,
  ActionTypes,
  usePopupContext,
  Alert,
  GradientButton,
  TextField,
  utilFunction,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useTranslation } from "react-i18next";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import {
  DialogProvider,
  useDialogContext,
} from "../../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";

let baseActions: ActionTypes[] = [
  {
    actionName: "confirm",
    actionLabel: "Confirm",
    actionIcon: "detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "Delete",
    actionLabel: "Remove",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "signature",
    actionLabel: "Signature",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "calculator",
    actionLabel: "Calculator",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "ViewAll",
    actionLabel: "ViewAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "VoucherSearch",
    actionLabel: "VoucherSearch",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "ScrollRemove",
    actionLabel: "ScrollRemove",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
type Trn002Props = {
  screenFlag?: string;
};
const Trn002Main: React.FC<Trn002Props> = ({ screenFlag }) => {
  const { authState } = useContext(AuthContext);
  const { getConfirmValidationCtx } = useContext(TRN001Context);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myGridRef = useRef<any>(null);
  const cardsDataRef = useRef<any>(null);
  const controllerRef = useRef<AbortController>();
  const [dataRow, setDataRow] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);
  const [cardsData, setCardsData] = useState([]);
  const [reqData, setReqData] = useState([]);
  const [gridData, setGridData] = useState<any>([]);
  const [filteredGridData, setFilteredGridData] = useState<any>([]);
  const [filteredbyScroll, setFilteredByScroll] = useState<any>([]);
  const [scrollDelDialog, setScrollDelDialog] = useState<any>(false);
  const [scrollConfDialog, setScrollConfDialog] = useState<any>(false);
  const [isConfirmed, setIsConfirmed] = useState<any>(false);
  const [scrollNo, setScrollNo] = useState<any>();
  const [voucherSearchDialog, setVoucherSearchDialog] = useState<any>(false);
  const [voucherNo, setVoucherNo] = useState<any>();
  const [openSignature, setOpenSignature] = useState(false);
  const [isOpenScrollList, setIsOpenScrollList] = useState(false);
  const isIgnoreScrollConfirmRef = useRef(true);
  const [action, setAction] = useState(baseActions);
  const [errors, setErrors] = useState<any>({
    scrollErr: "",
    remarkErr: "",
    voucherErr: "",
  });
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  const [remarks, setRemarks] = useState<any>(
    `WRONG ENTRY FROM ${utilFunction
      .getDynamicLabel(useLocation()?.pathname, authState?.menulistdata, true)
      ?.toUpperCase()}`
  );
  let currentPath = useLocation()?.pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const {
    clearCache: clearTabsCache,
    error: tabsErorr,
    data: tabsDetails,
    setData: setTabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  }: any = useCacheWithMutation(
    "getTabsByParentTypeKeyTrn002",
    CommonApi.getTabsByParentType
  );

  let dataObj = {
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState?.user?.branchCode,
  };

  let {
    data: trn2GridData,
    isLoading,
    isFetching,
    refetch,
    error,
    isError,
  } = useQuery<any, any>(
    ["getTrnListF2", { dataObj }],
    () =>
      screenFlag === "NPA_Entry_CONF"
        ? trn2Api?.getNPAList({
            ...dataObj,
            TRAN_DT: authState?.workingDate ?? "",
            FLAG: "O",
            USERNAME: authState?.user?.id ?? "",
          })
        : trn2Api?.getTRN002List(dataObj),
    {
      onSuccess: (data) => {
        setFilteredGridData(
          data?.filter((record) => {
            if (Boolean(record?.CONFIRMED === "0")) {
              return record;
            }
          })
        );
      },
    }
  );

  const handleFilterByScroll = (inputVal) => {
    if (!Boolean(inputVal)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: `${t("ScrollIsRequired")}`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: "",
      }));
      const result = filteredGridData?.filter(
        (item: any) =>
          item?.SCROLL1?.toString() === inputVal?.toString() &&
          (item?.TYPE_CD?.trim() === "3" || item?.TYPE_CD?.trim() === "6")
      );
      setFilteredGridData(result?.length > 0 ? result : []);
      const isConfirmed = result?.some((record) => record?.CONFIRMED === "Y");
      setIsConfirmed(isConfirmed);
    }
  };

  const getConfirmDataValidation = useMutation(
    trn2Api.getConfirmDataValidation,
    {
      onSuccess: async (data: any, variables: any) => {
        setScrollNo("");
        CloseMessageBox();
        const getBtnName = async (msgObj) => {
          let btnNm = await MessageBox(msgObj);
          return { btnNm, msgObj };
        };
        const returnFlg = await getConfirmValidationCtx({ data, getBtnName });
        if (Boolean(returnFlg) && screenFlag !== "NPA_Entry_CONF") {
          confirmScroll.mutate([
            {
              ENTERED_COMP_CD: dataRow?.COMP_CD ?? "",
              ENTERED_BRANCH_CD: dataRow?.ENTERED_BRANCH_CD ?? "",
              TRAN_CD: dataRow?.TRAN_CD ?? "",
              COMP_CD: dataRow?.COMP_CD ?? "",
              BRANCH_CD: dataRow?.BRANCH_CD ?? "",
              ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
              ACCT_CD: dataRow?.ACCT_CD ?? "",
              CONFIRMED: dataRow?.CONFIRMED ?? "",
              TYPE_CD: dataRow?.TYPE_CD ?? "",
              TRN_FLAG: dataRow?.TRN_FLAG ?? "",
              TRN_DT: dataRow?.TRAN_DT ?? "",
              TRAN_BAL: dataRow?.AMOUNT ?? "",
              AMOUNT: dataRow?.AMOUNT ?? "",
              SCREEN_REF: docCD,
            },
          ]);
        } else if (Boolean(returnFlg) && screenFlag === "NPA_Entry_CONF") {
          confirmScroll.mutate({
            ENTERED_COMP_CD: dataRow?.COMP_CD ?? "",
            ENTERED_BRANCH_CD: dataRow?.ENTERED_BRANCH_CD ?? "",
            BRANCH_CD: dataRow?.BRANCH_CD ?? "",
            ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
            ACCT_CD: dataRow?.ACCT_CD ?? "",
            STATUS: variables?.STATUS ?? "",
            TYPE_CD: dataRow?.TYPE_CD ?? "",
            REF_TRAN_CD: dataRow?.REF_TRAN_CD ?? "0",
            CHEQUE_NO: dataRow?.CHEQUE_NO ?? "",
            TRAN_CD: dataRow?.TRAN_CD ?? "",
            TYPE: "C",
            FLAG: "C",
            SCREEN_REF: docCD ?? "",
          });
        }
      },
      onError: (error: any) => {
        setScrollNo("");
        setConfirmDialog(false);
        CloseMessageBox();
      },
    }
  );

  const getCarousalCards = useMutation(CommonApi.getCarousalCards, {
    onSuccess: async (data, { row }) => {
      setCardsData(data);
      const cardData: any = getCardColumnValue(data);
      if (!Boolean(row)) return;
      if (row?.CONFIRMED === "0") {
        const cardDataReq = {
          CUSTOMER_ID: cardData?.CUSTOMER_ID ?? "",
          AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "",
          SHADOW_CL: cardData?.SHADOW_CLEAR ?? "",
          HOLD_BAL: cardData?.HOLD_BAL ?? "",
          LEAN_AMT: cardData?.LIEN_AMT ?? "",
          AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "",
          MIN_BALANCE: cardData?.MIN_BALANCE ?? "",
          CONF_BAL: cardData?.CONF_BAL ?? "",
          TRAN_BAL: cardData?.TRAN_BAL ?? "",
          UNCL_BAL: cardData?.UNCL_BAL ?? "",
          LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "",
          DRAWING_POWER: cardData?.DRAWING_POWER ?? "",
          OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "",
          INST_DUE_DT: cardData?.INST_DUE_DT ?? "",
          OP_DATE: cardData?.OP_DATE ?? "",
          STATUS: cardData?.STATUS ?? "",
        };
        getConfirmDataValidation?.mutate({ ...row, ...cardDataReq });
      } else {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: "RecordAlredyConfirmed",
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {
      setCardsData([]);
    },
  });

  const confirmScroll = useMutation(
    screenFlag === "NPA_Entry_CONF"
      ? CommonApi.deleteNPAEntry
      : trn2Api.confirmScroll,
    {
      onSuccess: (res, variables: any) => {
        if (Boolean(res?.[0]?.MSG)) {
          enqueueSnackbar(t("confirmMsg"), {
            variant: "success",
          });
          CloseMessageBox();
        }
        setConfirmDialog(false);
        refetch();
      },
      onError: (error: any, variables: any) => {
        setConfirmDialog(false);
        CloseMessageBox();
      },
    }
  );

  useEffect(() => {
    if (cardsData?.length > 0) {
      cardsDataRef.current = cardsData;
    }
  }, [cardsData]);
  useEffect(() => {
    setAction(
      // @ts-ignore
      !Boolean(isConfirmed) && screenFlag !== "NPA_Entry_CONF"
        ? [
            ...baseActions,
            {
              actionName: "ScrollConfirm",
              actionLabel: "ScrollConfirm",
              multiple: undefined,
              rowDoubleClick: false,
              alwaysAvailable: true,
            },
          ]
        : baseActions
    );
    setCardsData([]);
    setTabsDetails([]);
  }, [docCD]);

  const getCardColumnValue = useCallback((cards) => {
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
      "CUSTOMER_ID",
      "INST_DUE_DT",
      "OP_DATE",
      "STATUS",
      "SHADOW_CLEAR",
    ];

    const cardValues = keys?.reduce((acc, key) => {
      const item: any = cards?.find((entry: any) => entry?.COL_NAME === key);
      acc[key] = item?.COL_VALUE;
      return acc;
    }, {});
    return cardValues;
  }, []);

  const npaEntryRemove = useMutation(CommonApi?.deleteNPAEntry, {
    onSuccess: async (res) => {
      for (let i = 0; i < res?.data?.length; i++) {
        if (res?.data?.[i]?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: res?.data?.[i]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (res?.data?.[i]?.O_STATUS === "99") {
          const btnName = await MessageBox({
            messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "Confirmation",
            message: res?.data?.[i]?.O_MESSAGE,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (btnName === "No") {
            break;
          }
        } else if (res?.data?.[i]?.O_STATUS === "9") {
          await MessageBox({
            messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "Alert",
            message: res?.data?.[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (res?.data?.[i]?.O_STATUS === "0") {
          await MessageBox({
            messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
            message: res?.data?.[i]?.O_MESSAGE,
            icon: "SUCCESS",
          });
          setDeleteDialog(false);
          refetch();
        }
      }
      trackDialogClass("viewOnly");
      refetch();
    },
    onError: (error: any) => {
      setDeleteDialog(false);
      trackDialogClass("viewOnly");
    },
  });

  const deleteScrollByVoucher = useMutation(
    screenFlag === "NPA_Entry_CONF"
      ? CommonApi.deleteNPAEntry
      : CommonApi.deleteScrollByVoucherNo,
    {
      onSuccess: async (res, varieble) => {
        if (screenFlag === "NPA_Entry_CONF") {
          for (let i = 0; i < res?.data?.length; i++) {
            if (res?.data?.[i]?.O_STATUS === "999") {
              await MessageBox({
                messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                message: res?.data?.[i]?.O_MESSAGE,
                icon: "ERROR",
              });
            } else if (res?.data?.[i]?.O_STATUS === "99") {
              const btnName = await MessageBox({
                messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "Confirmation",
                message: res?.data?.[i]?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (btnName === "No") {
                break;
              }
            } else if (res?.data?.[i]?.O_STATUS === "9") {
              await MessageBox({
                messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "Alert",
                message: res?.data?.[i]?.O_MESSAGE,
                icon: "WARNING",
              });
            } else if (res?.data?.[i]?.O_STATUS === "0") {
              npaEntryRemove?.mutate({
                ...varieble,
                FLAG: "D",
              });
            }
          }
        } else {
          if (Boolean(res?.message)) {
            enqueueSnackbar(t("RecordRemovedMsg"), {
              variant: "success",
            });
          }
          setDeleteDialog(false);
          CloseMessageBox();
          refetch();
        }
      },
      onError: (error: any) => {
        setDeleteDialog(false);
        CloseMessageBox();
      },
    }
  );

  const setCurrentAction = useCallback(
    async (data) => {
      let row = data?.rows[0]?.data ?? {};
      setDataRow(row);
      if (data?.name === "_rowChanged") {
        let obj: any = {
          COMP_CD: row?.COMP_CD ?? "",
          ACCT_TYPE: row?.ACCT_TYPE ?? "",
          ACCT_CD: row?.ACCT_CD ?? "",
          PARENT_TYPE: row?.PARENT_TYPE ?? "",
          PARENT_CODE: row?.PARENT_CODE ?? "",
          BRANCH_CD: row?.BRANCH_CD ?? "",
        };
        setReqData(obj);
        let reqData = {
          COMP_CD: obj?.COMP_CD ?? "",
          ACCT_TYPE: obj?.ACCT_TYPE ?? "",
          BRANCH_CD: obj?.BRANCH_CD ?? "",
        };
        if (controllerRef.current) {
          controllerRef.current.abort();
        }
        // Create a new AbortController
        controllerRef.current = new AbortController();
        fetchTabsData({
          cacheId: reqData?.ACCT_TYPE,
          reqData: reqData,
          controllerFinal: controllerRef.current,
        });
        getCarousalCards.mutate({
          reqData: obj,
          controllerFinal: controllerRef.current,
        });
      }

      if (data?.name === "confirm") {
        let row = data?.rows[0]?.data ?? {};
        let obj: any = {
          COMP_CD: row?.COMP_CD ?? "",
          ACCT_TYPE: row?.ACCT_TYPE ?? "",
          ACCT_CD: row?.ACCT_CD ?? "",
          PARENT_TYPE: row?.PARENT_TYPE ?? "",
          PARENT_CODE: row?.PARENT_CODE ?? "",
          BRANCH_CD: row?.BRANCH_CD ?? "",
        };
        setReqData(obj);
        let reqData = {
          COMP_CD: obj?.COMP_CD ?? "",
          ACCT_TYPE: obj?.ACCT_TYPE ?? "",
          BRANCH_CD: obj?.BRANCH_CD ?? "",
        };
        if (controllerRef.current) {
          controllerRef.current.abort();
        }
        // Create a new AbortController
        controllerRef.current = new AbortController();
        fetchTabsData({
          cacheId: reqData?.ACCT_TYPE,
          reqData: reqData,
          controllerFinal: controllerRef.current,
        });
        await getCarousalCards.mutateAsync({
          reqData: obj,
          controllerFinal: controllerRef.current,
          row,
        });
      }
      if (data?.name === "signature") {
        setOpenSignature(true);
      }

      if (data?.name === "Delete") {
        setDeleteDialog(true);
      }
      if (data?.name === "calculator") {
        window.location.href = "Calculator:///";
      }
      if (data?.name === "ViewAll") {
        handleViewAll();
      }
      if (data?.name === "ScrollRemove") {
        setScrollDelDialog(true);
        trackDialogClass("ScrollRemove ");
      }
      if (data?.name === "ScrollConfirm") {
        setScrollConfDialog(true);
        trackDialogClass("ScrollRemove ");
      }
      if (data?.name === "VoucherSearch") {
        setVoucherSearchDialog(true);
        trackDialogClass("ScrollRemove ");
      }

      if (data?.name === "ScrollConfirm005") {
        let result = myGridRef?.current?.cleanData?.();
        handleConfirmByScroll(result?.[0]?.SCROLL1, result);
      }
    },
    [trn2GridData]
  );

  const handleViewAll = () => {
    if (trn2GridData?.length > 0) {
      setFilteredGridData(trn2GridData);
    }
  };

  const handleDeleteByVoucher = async (input) => {
    if (Boolean(input?.length < 5)) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "RemarksGreaterThenFive",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
    } else {
      setDeleteDialog(false);
      const msgBoxRes = await MessageBox({
        messageTitle: `Confirmed Voucher No. ${dataRow?.TRAN_CD ?? ""}`,
        message: `Voucher No. ${
          dataRow?.TRAN_CD ?? ""
        } is confirmed.\n Are you sure to Delete it?`,
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (msgBoxRes === "Yes") {
        if (screenFlag === "NPA_Entry_CONF") {
          let reqData = {
            COMP_CD: dataRow?.COMP_CD ?? "",
            ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
            ACCT_CD: dataRow?.ACCT_CD ?? "",
            PARENT_TYPE: dataRow?.PARENT_TYPE ?? "",
            PARENT_CODE: dataRow?.PARENT_CODE ?? "",
            BRANCH_CD: dataRow?.BRANCH_CD ?? "",
          };
          try {
            const data = await CommonApi.getCarousalCards({
              reqData,
              controllerFinal: controllerRef.current,
              row: dataRow,
            });
            if (data?.length > 0) {
              setCardsData(data);
              const cardData: any = getCardColumnValue(data);
              let obj = {
                ENTERED_COMP_CD: dataRow?.COMP_CD ?? "",
                ENTERED_BRANCH_CD: dataRow?.ENTERED_BRANCH_CD ?? "",
                BRANCH_CD: dataRow?.BRANCH_CD ?? "",
                ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
                ACCT_CD: dataRow?.ACCT_CD ?? "",
                STATUS: cardData?.STATUS ?? "",
                TYPE_CD: dataRow?.TYPE_CD ?? "",
                REF_TRAN_CD: dataRow?.REF_TRAN_CD ?? "0",
                CHEQUE_NO: dataRow?.CHEQUE_NO ?? "",
                TRAN_CD: dataRow?.TRAN_CD ?? "",
                TYPE: "C",
                FLAG: "V",
                SCREEN_REF: docCD ?? "",
              };
              deleteScrollByVoucher.mutate(obj);
            }
          } catch (error) {
            console.error("Error in API calls", error);
          }
        } else {
          let obj = {
            TRAN_CD: dataRow?.TRAN_CD ?? "",
            ENTERED_COMP_CD: dataRow?.COMP_CD ?? "",
            ENTERED_BRANCH_CD: dataRow?.ENTERED_BRANCH_CD ?? "",
            COMP_CD: dataRow?.COMP_CD ?? "",
            BRANCH_CD: dataRow?.BRANCH_CD ?? "",
            ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
            ACCT_CD: dataRow?.ACCT_CD ?? "",
            TRAN_AMOUNT: dataRow?.AMOUNT ?? "",
            ACTIVITY_TYPE: "DAILY TRANSACTION CONFIRMATION",
            TRAN_DT: dataRow?.TRAN_DT ?? "",
            CONFIRMED: dataRow?.CONFIRMED ?? "",
            USER_DEF_REMARKS: input ?? "",
            ENTERED_BY: dataRow?.ENTERED_BY ?? "",
          };

          deleteScrollByVoucher.mutate(obj);
        }
      } else {
        CloseMessageBox();
      }
    }
  };

  const handleConfirmByScroll = async (scrollNo, filteredGridData) => {
    isIgnoreScrollConfirmRef.current = true;
    if (!Boolean(scrollNo)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: `${t("ScrollIsRequired")}`,
      }));
    } else {
      setScrollConfDialog(false);
      trackDialogClass("main");
      if (filteredGridData?.length <= 0) return;
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: "",
      }));
      const msgBoxRes = await MessageBox({
        messageTitle: "Confirmation",
        message: `Are you sure you want to confirm ${
          filteredGridData?.length ?? ""
        } records?`,
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });

      if (msgBoxRes === "Yes") {
        for (let i = 0; i < filteredGridData.length; i++) {
          if (!Boolean(isIgnoreScrollConfirmRef?.current)) break;
          let row = {
            ...filteredGridData[i],
            IS_LAST: Boolean(i === filteredGridData.length - 1),
          };

          let obj = {
            COMP_CD: row?.COMP_CD ?? "",
            ACCT_TYPE: row?.ACCT_TYPE ?? "",
            ACCT_CD: row?.ACCT_CD ?? "",
            PARENT_TYPE: row?.PARENT_TYPE ?? "",
            PARENT_CODE: row?.PARENT_CODE ?? "",
            BRANCH_CD: row?.BRANCH_CD ?? "",
          };

          try {
            // Wait for getCarousalCards API to complete
            const data = await CommonApi.getCarousalCards({
              reqData: obj,
              controllerFinal: controllerRef.current,
              row,
            });

            // Extract relevant data from response
            if (data?.length > 0) {
              setCardsData(data);
              const cardData: any = getCardColumnValue(data);
              if (row?.CONFIRMED === "0") {
                const cardDataReq = {
                  CUSTOMER_ID: cardData?.CUSTOMER_ID ?? "",
                  AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "",
                  SHADOW_CL: cardData?.SHADOW_CLEAR ?? "",
                  HOLD_BAL: cardData?.HOLD_BAL ?? "",
                  LEAN_AMT: cardData?.LIEN_AMT ?? "",
                  AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "",
                  MIN_BALANCE: cardData?.MIN_BALANCE ?? "",
                  CONF_BAL: cardData?.CONF_BAL ?? "",
                  TRAN_BAL: cardData?.TRAN_BAL ?? "",
                  UNCL_BAL: cardData?.UNCL_BAL ?? "",
                  LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "",
                  DRAWING_POWER: cardData?.DRAWING_POWER ?? "",
                  OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "",
                  INST_DUE_DT: cardData?.INST_DUE_DT ?? "",
                  OP_DATE: cardData?.OP_DATE ?? "",
                  STATUS: cardData?.STATUS ?? "",
                };
                const ValidateMessage = await trn2Api.getConfirmDataValidation({
                  ...row,
                  ...cardDataReq,
                });
                for (let i = 0; i < ValidateMessage?.length; i++) {
                  if (ValidateMessage?.[i]?.O_COLUMN_NM === "SKIP") {
                    continue;
                  }
                  if (ValidateMessage?.[i]?.O_STATUS === "999") {
                    await MessageBox({
                      messageTitle:
                        ValidateMessage?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                      message: ValidateMessage?.[i]?.O_MESSAGE ?? "",
                      icon: "ERROR",
                    });
                    isIgnoreScrollConfirmRef.current = false;
                    break;
                  } else if (ValidateMessage?.[i]?.O_STATUS === "99") {
                    const btnName = await MessageBox({
                      messageTitle:
                        ValidateMessage?.[i]?.O_MSG_TITLE ?? "Confirmation",
                      message: ValidateMessage?.[i]?.O_MESSAGE ?? "",
                      buttonNames: ["Yes", "No"],
                      defFocusBtnName: "Yes",
                      icon: "CONFIRM",
                    });
                    if (btnName === "No") {
                      isIgnoreScrollConfirmRef.current = false;
                      break;
                    }
                  } else if (ValidateMessage?.[i]?.O_STATUS === "9") {
                    await MessageBox({
                      messageTitle:
                        ValidateMessage?.[i]?.O_MSG_TITLE ?? "Alert",
                      message: ValidateMessage?.[i]?.O_MESSAGE ?? "",
                      icon: "WARNING",
                    });
                  } else if (ValidateMessage?.[i]?.O_STATUS === "0") {
                    isIgnoreScrollConfirmRef.current = true;
                    if (Boolean(row?.IS_LAST)) {
                      const result = filteredGridData?.filter(
                        (item: any) =>
                          item?.SCROLL1?.toString() ===
                            row?.SCROLL1?.toString() &&
                          (item?.TYPE_CD?.trim() === "3" ||
                            item?.TYPE_CD?.trim() === "6")
                      );
                      const TotalCredit = result
                        ?.reduce((acc, item) => {
                          const trimmedTypeCd = item?.TYPE_CD?.trim();
                          return trimmedTypeCd === "3"
                            ? acc + Number(item?.AMOUNT || 0)
                            : acc;
                        }, 0)
                        ?.toString();
                      const TotalDebit = result
                        ?.reduce((acc, item) => {
                          const trimmedTypeCd = item?.TYPE_CD?.trim();
                          return trimmedTypeCd === "6"
                            ? acc + Number(item?.AMOUNT || 0)
                            : acc;
                        }, 0)
                        ?.toString();
                      let tranBal;
                      if (TotalCredit > 0 && TotalDebit > 0) {
                        tranBal =
                          TotalCredit < TotalDebit ? TotalCredit : TotalDebit;
                      } else if (TotalCredit === 0) {
                        tranBal = TotalDebit;
                      } else if (TotalDebit === 0) {
                        tranBal = TotalCredit;
                      }
                      const mappedData = result?.map((item) => {
                        return {
                          ENTERED_COMP_CD: item?.COMP_CD ?? "",
                          ENTERED_BRANCH_CD: item?.ENTERED_BRANCH_CD ?? "",
                          TRAN_CD: item?.TRAN_CD ?? "",
                          COMP_CD: item?.COMP_CD ?? "",
                          BRANCH_CD: item?.BRANCH_CD ?? "",
                          ACCT_TYPE: item?.ACCT_TYPE ?? "",
                          ACCT_CD: item?.ACCT_CD ?? "",
                          CONFIRMED: item?.CONFIRMED ?? "",
                          TYPE_CD: item?.TYPE_CD ?? "",
                          TRN_FLAG: item?.TRN_FLAG ?? "",
                          TRN_DT: item?.TRAN_DT ?? "",
                          TRAN_BAL: tranBal ?? "",
                          AMOUNT: item?.AMOUNT ?? "",
                          SCREEN_REF: docCD,
                        };
                      });
                      confirmScroll.mutate(mappedData);
                    }
                  }
                }
              } else {
                await MessageBox({
                  messageTitle: "ValidationFailed",
                  message: "RecordAlredyConfirmed",
                  icon: "ERROR",
                });
              }
            }
          } catch (error) {
            console.error("Error in API calls", error);
          }
        }
      } else if (msgBoxRes === "No") {
        CloseMessageBox();
      }
      setScrollNo("");
    }
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
      "getTrnListF2",
    ];
    return () => {
      clearTabsCache();
      queries?.forEach((query) => queryClient?.removeQueries(query));
    };
  }, [queryClient, docCD]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F9" && Object.keys(dataRow || {}).length > 0) {
        setOpenSignature(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dataRow]);

  const handleScroll = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, "");

    setScrollNo(newValue);
  };
  const handleVoucher = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, "");
    setVoucherNo(newValue);
  };
  const npaEntryRemoveByScroll = useMutation(
    CommonApi?.deleteNPAEntryByScrollNo,
    {
      onSuccess: async (res) => {
        for (let i = 0; i < res?.data?.length; i++) {
          if (res?.data?.[i]?.O_STATUS === "999") {
            await MessageBox({
              messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: res?.data?.[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (res?.data?.[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "Confirmation",
              message: res?.data?.[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnName === "No") {
              break;
            }
          } else if (res?.data?.[i]?.O_STATUS === "9") {
            await MessageBox({
              messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "Alert",
              message: res?.data?.[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (res?.data?.[i]?.O_STATUS === "0") {
            await MessageBox({
              messageTitle: res?.data?.[i]?.O_MSG_TITLE ?? "SUCCESS",
              message: res?.data?.[i]?.O_MESSAGE,
              icon: "SUCCESS",
            });
            setDeleteDialog(false);
            refetch();
          }
        }
        trackDialogClass("viewOnly");
        refetch();
      },
      onError: (error: any) => {
        setDeleteDialog(false);
        trackDialogClass("viewOnly");
      },
    }
  );

  const deleteByScrollNo = useMutation(
    screenFlag === "NPA_Entry_CONF"
      ? CommonApi.deleteNPAEntryByScrollNo
      : CommonApi.deleteScrollByScrollNo,
    {
      onSuccess: async (data: any, varieble: any) => {
        if (screenFlag === "NPA_Entry_CONF") {
          for (let i = 0; i < data?.data?.length; i++) {
            if (data?.data?.[i]?.O_STATUS === "999") {
              await MessageBox({
                messageTitle:
                  data?.data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                message: data?.data?.[i]?.O_MESSAGE,
                icon: "ERROR",
              });
            } else if (data?.data?.[i]?.O_STATUS === "99") {
              const btnName = await MessageBox({
                messageTitle: data?.data?.[i]?.O_MSG_TITLE ?? "Confirmation",
                message: data?.data?.[i]?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (btnName === "No") {
                break;
              }
            } else if (data?.data?.[i]?.O_STATUS === "9") {
              await MessageBox({
                messageTitle: data?.data?.[i]?.O_MSG_TITLE ?? "Alert",
                message: data?.data?.[i]?.O_MESSAGE,
                icon: "WARNING",
              });
            } else if (data?.data?.[i]?.O_STATUS === "0") {
              npaEntryRemoveByScroll?.mutate({
                ...varieble,
                FLAG: "D",
              });
            }
          }
        } else {
          if (Boolean(data?.message)) {
            enqueueSnackbar(t("RecordsRemovedMsg"), {
              variant: "success",
            });
          }
        }
        setScrollNo("");
        refetch();
        CloseMessageBox();
      },
      onError: (error: any) => {
        setScrollNo("");
        CloseMessageBox();
      },
    }
  );

  const handleDeletByScroll = async (scrollNo, filteredGridData) => {
    if (!Boolean(scrollNo)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: `${t("ScrollIsRequired")}`,
        remarkErr: "",
      }));
    } else if (Boolean(remarks?.length < 5)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        remarkErr: "Remarks should be greater than 5 characters",
        scrollErr: "",
      }));
    } else {
      setScrollDelDialog(false);
      trackDialogClass("main");
      setScrollNo("");
      if (filteredGridData?.length <= 0) return;
      const msgBoxRes = await MessageBox({
        messageTitle: "Confirmation",
        message: `Are you sure you want to remove ${
          filteredGridData?.length ?? ""
        } records?`,
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });

      if (msgBoxRes === "Yes") {
        if (screenFlag === "NPA_Entry_CONF") {
          let reqPara = {
            ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
            ENTERED_COMP_CD: authState?.companyID ?? "",
            SCROLL1: filteredGridData?.[0]?.SCROLL1,
            SCREEN_REF: docCD,
            TYPE: "O",
            FLAG: "V",
            TRAN_DTL: filteredGridData?.map(
              ({
                BRANCH_CD,
                ACCT_TYPE,
                ACCT_CD,
                CONFIRMED,
                CHEQUE_NO,
                TYPE_CD,
              }) => ({
                BRANCH_CD,
                ACCT_TYPE,
                ACCT_CD,
                CONFIRMED,
                CHEQUE_NO,
                TYPE_CD,
              })
            ),
          };
          deleteByScrollNo?.mutate(reqPara);
        } else {
          let reqPara = {
            COMP_CD: authState.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            SCROLL_NO: filteredGridData[0]?.SCROLL1 ?? "",
            USER_DEF_REMARKS: remarks ?? "",
            ACCT_TYPE: filteredGridData[0]?.ACCT_TYPE ?? "",
            ACCT_CD: filteredGridData[0]?.ACCT_CD ?? "",
            TRAN_AMOUNT: filteredGridData[0]?.AMOUNT ?? "",
            ENTERED_COMP_CD: filteredGridData[0]?.COMP_CD ?? "",
            ENTERED_BRANCH_CD: filteredGridData[0]?.ENTERED_BRANCH_CD ?? "",
            ACTIVITY_TYPE: "DAILY TRANSACTION CONFIRMATION",
            TRAN_DT: filteredGridData[0]?.TRAN_DT ?? "",
            CONFIRM_FLAG: filteredGridData[0]?.CONFIRMED ?? "",
            CONFIRMED: filteredGridData[0]?.CONFIRMED ?? "",
          };
          deleteByScrollNo?.mutate(reqPara);
        }
      } else if (msgBoxRes === "No") {
        CloseMessageBox();
        setScrollNo("");
      }
    }
  };
  const handleVoucherSearch = async () => {
    if (!Boolean(voucherNo)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        voucherErr: `${t("VoucherIsRequired")}`,
      }));
    } else {
      setVoucherSearchDialog(false);
      trackDialogClass("main");
      setErrors((prevErrors) => ({
        ...prevErrors,
        voucherErr: "",
      }));
      setFilteredGridData((prev: any) => {
        return prev.filter((item: any) => item.TRAN_CD === voucherNo);
      });
      setVoucherNo("");
    }
  };
  const onCancel = () => {
    trackDialogClass("main");
    if (Boolean(voucherSearchDialog)) {
      setVoucherSearchDialog(false);
      setVoucherNo("");
      setErrors((prevErrors) => ({
        ...prevErrors,
        voucherErr: "",
      }));
    }
    if (Boolean(scrollDelDialog)) {
      setScrollDelDialog(false);
      setScrollNo("");
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: "",
        remarkErr: "",
      }));
    } else {
      setScrollConfDialog(false);
      setScrollNo("");
      setErrors((prevErrors) => ({
        ...prevErrors,
        scrollErr: "",
        remarkErr: "",
      }));
    }
  };
  const handleClose = () => {
    setOpenSignature(false);
  };
  const [data, setData] = useState("");
  let className = localStorage.getItem("commonClass");

  useEffect(() => {
    const newData =
      className !== null
        ? className
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main"; // Default fallback

    setData(newData);
  }, [className, dialogClassNames]);
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
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "91vh",
        overflow: "auto",
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
        cardsData={cardsData}
        reqData={reqData}
        occupiedHeight={{ min: "620px", max: "620px" }}
        screenFlag={"TRN/002"}
      />
      <Paper sx={{ margin: "8px", padding: "8px" }}>
        {isError ||
        getConfirmDataValidation?.isError ||
        getCarousalCards?.isError ||
        confirmScroll?.isError ||
        deleteScrollByVoucher?.isError ||
        deleteByScrollNo?.isError ||
        npaEntryRemove?.isError ||
        npaEntryRemoveByScroll?.isError ||
        isTabsError ? (
          <div style={{ width: "100%", paddingTop: "10px" }}>
            <Alert
              severity={"error"}
              errorMsg={
                (error?.error_msg ||
                  getConfirmDataValidation?.error?.error_msg ||
                  getCarousalCards?.error?.error_msg ||
                  confirmScroll?.error?.error_msg ||
                  deleteScrollByVoucher?.error?.error_msg ||
                  deleteByScrollNo?.error?.error_msg ||
                  npaEntryRemove?.error?.error_msg ||
                  npaEntryRemoveByScroll?.error?.error_msg ||
                  tabsErorr?.error_msg) ??
                "Error"
              }
              errorDetail={
                (error?.error_detail ||
                  getConfirmDataValidation?.error?.error_detail ||
                  getCarousalCards?.error?.error_detail ||
                  confirmScroll?.error?.error_detail ||
                  deleteScrollByVoucher?.error?.error_detail ||
                  deleteByScrollNo?.error?.error_detail ||
                  npaEntryRemove?.error?.error_detail ||
                  npaEntryRemoveByScroll?.error?.error_detail ||
                  tabsErorr?.error_detail) ??
                ""
              }
            />
          </div>
        ) : null}
        <Box
          sx={{
            "&>.MuiPaper-root .MuiTableContainer-root .MuiTable-root .MuiTableBody-root .MuiTableRow-root.Mui-selected":
              {
                border: "2px solid #000 !important",
              },
          }}
          className="ENTRIES"
        >
          <GridWrapper
            key={`TRN002_TableMetaData${filteredGridData}`}
            finalMetaData={TRN002_TableMetaData}
            data={filteredGridData ?? []}
            setData={setFilteredGridData}
            loading={
              Boolean(isFetching) ||
              Boolean(isLoading) ||
              Boolean(getCarousalCards?.isLoading) ||
              Boolean(isTabsLoading) ||
              Boolean(getConfirmDataValidation?.isLoading) ||
              Boolean(confirmScroll.isLoading) ||
              Boolean(npaEntryRemoveByScroll.isLoading)
            }
            ref={myGridRef}
            refetchData={() => refetch()}
            actions={action}
            setAction={setCurrentAction}
            disableMultipleRowSelect={true}
            defaultSelectedRowId={
              filteredGridData?.length > 0 ? filteredGridData?.[0]?.TRAN_CD : ""
            }
          />
        </Box>
      </Paper>
      <Box padding={"8px"}>
        {Object?.keys(dataRow)?.length ? (
          <>
            <Typography
              variant="body1"
              display={"inline"}
              padding={"6px 8px"}
              margin={"5px"}
            >
              <Typography fontWeight={"bold"} display={"inline"}>
                {t("branch")} :
              </Typography>{" "}
              {dataRow?.BRANCH_NM ?? ""}
            </Typography>
            <Typography
              variant="body1"
              display={"inline"}
              padding={"6px 8px"}
              margin={"5px"}
            >
              <Typography fontWeight={"bold"} display={"inline"}>
                {t("AccountType")} :
              </Typography>{" "}
              {dataRow?.TYPE_NM ?? ""}
            </Typography>
            <Typography
              variant="body1"
              display={"inline"}
              padding={"6px 8px"}
              margin={"5px"}
            >
              <Typography fontWeight={"bold"} display={"inline"}>
                {t("Trx")} :
              </Typography>{" "}
              {dataRow?.TRX_NM ?? ""}
            </Typography>
            <Typography
              variant="body1"
              display={"inline"}
              padding={"6px 8px"}
              margin={"5px"}
            >
              <Typography fontWeight={"bold"} display={"inline"}>
                {t("VoucherNo")} :
              </Typography>{" "}
              {dataRow?.TRAN_CD ?? ""}
            </Typography>
          </>
        ) : null}
      </Box>
      {Boolean(scrollDelDialog) || Boolean(scrollConfDialog) ? (
        <Dialog
          maxWidth="lg"
          className="ScrollRemove "
          open={scrollDelDialog || scrollConfDialog}
          aria-describedby="alert-dialog-description"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
          onKeyUp={(event) => {
            if (event.key === "Escape") onCancel();
          }}
        >
          <DialogTitle
            style={{
              cursor: "move",
            }}
            id="draggable-dialog-title"
          >
            <Typography
              variant="h5"
              className="dialogTitle"
              style={{
                padding: "10px",
                fontSize: "1.5rem",
                letterSpacing: "1px",
                fontWeight: 500,
                color: "var(--theme-color2)",
              }}
            >
              {scrollDelDialog ? t("ScrollRemove") : t("ScrollConfirm")}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              style={{ minWidth: "300px" }}
              fullWidth={true}
              value={scrollNo}
              placeholder={t("EnterScrollNo")}
              type="number"
              onChange={(event) => handleScroll(event)}
              onBlur={(event) => handleFilterByScroll(event.target.value)}
              label={t("ScrollNo")}
              InputLabelProps={{ shrink: true }}
            />
            <DynFormHelperText msg={errors?.scrollErr} />
            {scrollDelDialog ? (
              <>
                <TextField
                  style={{ minWidth: "400px", marginTop: "20px" }}
                  fullWidth={true}
                  value={remarks}
                  placeholder={t("EnterRemarks")}
                  onChange={(event) => setRemarks(event?.target?.value ?? "")}
                  label={t("Remark")}
                  InputLabelProps={{ shrink: true }}
                />
                <DynFormHelperText msg={errors?.remarkErr} />
              </>
            ) : null}
          </DialogContent>
          <DialogActions className="dialogFooter">
            <GradientButton
              onClick={() =>
                Boolean(scrollDelDialog)
                  ? handleDeletByScroll(scrollNo, filteredGridData)
                  : handleConfirmByScroll(scrollNo, filteredGridData)
              }
            >
              {scrollDelDialog ? t("Delete") : t("Confirm")}
            </GradientButton>
            <GradientButton onClick={() => onCancel()}>
              {t("Cancel")}
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}

      {voucherSearchDialog ? (
        <Dialog
          maxWidth="lg"
          open={voucherSearchDialog}
          className="ScrollRemove"
          aria-describedby="alert-dialog-description"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
          onKeyUp={(event) => {
            if (event.key === "Escape") onCancel();
          }}
        >
          <DialogTitle
            style={{
              cursor: "move",
            }}
            id="draggable-dialog-title"
          >
            <Typography
              variant="h5"
              className="dialogTitle"
              style={{
                padding: "10px",
                fontSize: "1.5rem",
                letterSpacing: "1px",
                fontWeight: 500,
                color: "var(--theme-color2)",
              }}
            >
              {t("VoucherSearch")}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              style={{ minWidth: "300px" }}
              fullWidth={true}
              value={voucherNo}
              placeholder={t("EnterVoucher")}
              type="text"
              onChange={(event) => handleVoucher(event)}
              label={t("VoucherNo")}
              InputLabelProps={{ shrink: true }}
              autoComplete="off"
            />
            <DynFormHelperText msg={errors?.voucherErr} />
          </DialogContent>
          <DialogActions className="dialogFooter">
            <GradientButton onClick={() => handleVoucherSearch()}>
              {t("Search")}
            </GradientButton>
            <GradientButton onClick={() => onCancel()}>
              {t("Cancel")}
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}

      <>
        {Boolean(deleteDialog) ? (
          <RemarksAPIWrapper
            TitleText={
              "Do you want to remove the transaction - VoucherNo." +
              dataRow?.TRAN_CD +
              " ?"
            }
            defaultValue={`WRONG ENTRY FROM ${utilFunction
              .getDynamicLabel(currentPath, authState?.menulistdata, true)
              ?.toUpperCase()}
            `}
            onActionYes={(input) => handleDeleteByVoucher(input)}
            onActionNo={() => setDeleteDialog(false)}
            isLoading={deleteScrollByVoucher.isLoading}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={deleteDialog}
            rows={dataRow}
          />
        ) : null}
        {openSignature ? (
          <PhotoSignWithHistory
            data={{
              COMP_CD: dataRow?.COMP_CD ?? "",
              BRANCH_CD: dataRow?.BRANCH_CD ?? "",
              ACCT_TYPE: dataRow?.ACCT_TYPE ?? "",
              ACCT_CD: dataRow?.ACCT_CD ?? "",
            }}
            onClose={handleClose}
            screenRef={docCD}
          />
        ) : null}

        {/* {Boolean(confirmDialog) ? (
          <PopupMessageAPIWrapper
            MessageTitle="Transaction Confirmation"
            Message={
              "Do you wish to Confirm this Transaction - Voucher No. " +
              dataRow?.TRAN_CD +
              " ?"
            }
            onActionYes={() => handleConfirm()}
            onActionNo={() => setConfirmDialog(false)}
            rows={[]}
            open={confirmDialog}
            loading={confirmScroll.isLoading}
          />
        ) : null} */}
      </>
    </div>
  );
};
export const Trn002: React.FC<Trn002Props> = ({ screenFlag }) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <Trn002Main screenFlag={screenFlag} />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
