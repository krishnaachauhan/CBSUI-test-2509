import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { TRN001_TableMetaData } from "./gridMetadata";
import * as API from "../api";
import * as CommonApi from "../../TRNCommon/api";
import { useSnackbar } from "notistack";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";

import { AuthContext } from "pages_audit/auth";
import { useContext } from "react";

import Scroll from "pages_audit/pages/dashboard/Today'sTransactionGrid/openScroll/scroll";

import { useLocation } from "react-router-dom";
import { DynFormHelperText, PaperComponent } from "../components";
import {
  GridWrapper,
  GradientButton,
  Alert,
  ActionTypes,
  queryClient,
  GridMetaDataType,
  RemarksAPIWrapper,
  usePopupContext,
  TextField,
  utilFunction,
} from "@acuteinfo/common-base";
import { ViewStatement } from "pages_audit/acct_Inquiry/viewStatement";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { getdocCD } from "components/utilFunction/function";
import { useTranslation } from "react-i18next";
import { useDialogContext } from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
const actions: ActionTypes[] = [
  {
    actionName: "Delete",
    actionLabel: "Remove",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "Passbook-Statement",
    actionLabel: "Passbook/Statement",
    multiple: false,
    rowDoubleClick: false,
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
    actionName: "TransactionPosting",
    actionLabel: "TransactionPosting",
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
  {
    actionName: "VoucherSearch",
    actionLabel: "VoucherSearch",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const TRN001_Table = ({
  handleGetHeaderTabs,
  handleSetCards,
  handleSetAccInfo,
  setViewOnly,
  screenFlag,
  state,
  tabAPIData,
}) => {
  const { authState } = useContext(AuthContext);
  const [remarks, setRemarks] = useState<any>(
    `WRONG ENTRY FROM ${utilFunction
      .getDynamicLabel(useLocation()?.pathname, authState?.menulistdata, true)
      ?.toUpperCase()}`
  );
  const { trackDialogClass, dialogClassNames } = useDialogContext();

  const [dataRow, setDataRow] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [scrollDialog, setScrollDialog] = useState<boolean>(false);
  const [scrollNo, setScrollNo] = useState<any>();
  const [gridData, setGridData] = useState<any>([]);
  const [originalData, setOriginalData] = useState([]);
  const [errors, setErrors] = useState<any>({
    scrollErr: "",
    remarkErr: "",
  });
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myGridRef = useRef<any>(null);
  const controllerRef = useRef<AbortController>();
  const [isOpenPassbookStatement, setOpenPassbookStatement] = useState(false);
  const [passbookStatementPara, setPassbookStatementPara] = useState<any>({});
  const [selectedRow, setSelectedRow] = useState({});
  const [openPhotoSign, setOpenPhotoSign] = useState<any>();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [voucherSearchDialog, setVoucherSearchDialog] = useState<any>(false);
  const [voucherNo, setVoucherNo] = useState<any>();
  let currentPath = useLocation()?.pathname;
  const { t } = useTranslation();

  let objData = {
    USER_NAME: authState?.user?.id,
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState?.user?.branchCode,
  };

  useEffect(() => {
    if (scrollDialog) {
      trackDialogClass("scrollDialog");
    }
  }, [scrollDialog]);
  let {
    data: trnGridData,
    isLoading,
    isFetching,
    refetch,
    error,
    isError,
  } = useQuery<any, any>(["getTrnListF1", { objData }], () =>
    screenFlag === "NPA_Entry"
      ? API?.getNPAList({
          ...objData,
          TRAN_DT: authState?.workingDate ?? "",
          FLAG: "A",
          USERNAME: authState?.user?.id ?? "",
        })
      : API?.getTRN001List(objData)
  );

  useEffect(() => {
    return () => {
      queryClient?.removeQueries("getTrnListF1");
    };
  }, [queryClient]);

  const getCarousalCards = useMutation(CommonApi.getCarousalCards, {
    onSuccess: (data) => {
      if (Boolean(data?.length > 0)) {
        handleSetCards(data);
      }
    },
    onError: (error: any) => {
      handleSetCards([]);
    },
  });

  const getCardColumnValue = () => {
    const keys = ["STATUS"];
    const cardValues = keys?.reduce((acc, key) => {
      const item: any = getCarousalCards?.data?.find(
        (entry: any) => entry?.COL_NAME === key
      );
      acc[key] = item?.COL_VALUE;
      return acc;
    }, {});
    return cardValues;
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
  });
  const deleteScrollByVoucher = useMutation(
    screenFlag === "NPA_Entry"
      ? CommonApi.deleteNPAEntry
      : CommonApi.deleteScrollByVoucherNo,
    {
      onSuccess: async (res, varieble) => {
        if (screenFlag === "NPA_Entry") {
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
            enqueueSnackbar(
              res?.message ? `${res?.message}` : t("RecordRemovedMsg"),
              {
                variant: "success",
              }
            );
          }
          setDeleteDialog(false);
          refetch();
        }
      },
      onError: (error: any) => {
        setDeleteDialog(false);
      },
    }
  );

  const deleteByScrollNo = useMutation(
    screenFlag === "NPA_Entry"
      ? CommonApi.deleteNPAEntryByScrollNo
      : CommonApi.deleteScrollByScrollNo,
    {
      onSuccess: async (data: any, varieble: any) => {
        if (screenFlag === "NPA_Entry") {
          console.log("data", data);

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

  // fn define-----------------------------
  const setCurrentAction = useCallback(
    (data) => {
      let row = data?.rows[0]?.data ?? {};
      setDataRow(row);
      if (data.name === "Delete") {
        setDeleteDialog(true);
        trackDialogClass("css-hz1bth-MuiDialog-container");
      } else if (data.name === "_rowChanged") {
        let obj = {
          COMP_CD: row?.COMP_CD,
          ACCT_TYPE: row?.ACCT_TYPE,
          ACCT_CD: row?.ACCT_CD,
          PARENT_TYPE: row?.PARENT_TYPE ?? "",
          BRANCH_CD: row?.BRANCH_CD,
        };

        handleSetAccInfo(obj);
        if (controllerRef.current) {
          controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
        getCarousalCards.mutate({
          reqData: obj,
          controllerFinal: controllerRef.current,
        });
        handleGetHeaderTabs(obj ?? "");
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.key === "F9") {
            setOpenPhotoSign(true);
            setSelectedRow({
              COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
              BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
              ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
              ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
            });
          }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => {
          window.removeEventListener("keydown", handleKeyPress);
        };
      } else if (data?.name === "Passbook-Statement") {
        if (
          Boolean(row?.BRANCH_CD) &&
          Boolean(row?.ACCT_TYPE) &&
          Boolean(row?.ACCT_CD)
        ) {
          setPassbookStatementPara({
            BRANCH_CD: row?.BRANCH_CD,
            ACCT_TYPE: row?.ACCT_TYPE,
            ACCT_CD: row?.ACCT_CD,
          });
          setOpenPassbookStatement(true);
          trackDialogClass("passbookRetrival");
        }
      } else if (data?.name === "calculator") {
        window.location.href = "Calculator:///";
      } else if (data?.name === "TransactionPosting") {
        setViewOnly(false);
        tabAPIData?.setTabsDetails([]);
        handleSetCards([]);
      } else if (data?.name === "ScrollRemove") {
        setScrollDialog(true);
      } else if (data?.name === "VoucherSearch") {
        trackDialogClass("voucherSearchDialog");
        setVoucherSearchDialog(true);
      } else if (data?.name === "ViewAll") {
        handleViewAll();
      }
    },
    [trnGridData]
  );
  const handleViewAll = () => {
    setGridData(trnGridData);
  };
  const handlePassbookStatementClose = () => {
    setOpenPassbookStatement(false);
    trackDialogClass("viewOnly");
    setPassbookStatementPara({});
  };

  useEffect(() => {
    // if (trnGridData?.length > 0) {
    setGridData(trnGridData);
    setOriginalData(trnGridData);
    // }
  }, [trnGridData, scrollNo]);

  const handleFilterByScroll = (scroll?: any) => {
    if (!Boolean(scroll)) {
      setGridData(originalData);
    } else {
      const result = gridData?.filter(
        (item: any) =>
          item?.SCROLL1 &&
          typeof item?.SCROLL1 === "string" &&
          item?.SCROLL1?.toString()?.includes(scroll?.toString())
      );
      setGridData(result?.length > 0 ? result : []);
    }
  };

  const handleDelete = async (input) => {
    if (Boolean(input?.length < 5)) {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "RemarksGreaterThenFive",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
    } else {
      if (screenFlag === "NPA_Entry") {
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
            state.cardsData = data;
            const cardData: any = getCardColumnValue();
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
          ACTIVITY_TYPE:
            screenFlag === "contraEntry" ? "CONTRA ENTRY" : "DAILY TRANSACTION",
          TRAN_DT: dataRow?.TRAN_DT ?? "",
          CONFIRMED: dataRow?.CONFIRMED ?? "",
          USER_DEF_REMARKS: input ?? "",
          ENTERED_BY: dataRow?.ENTERED_BY ?? "",
        };
        deleteScrollByVoucher?.mutate(obj);
      }
    }
  };
  const handleScroll = (event) => {
    const { value } = event?.target;
    const stringVal = value?.toString();
    setScrollNo(stringVal);
  };

  const handleDeletByScroll = async () => {
    setScrollDialog(false);
    if (gridData?.length > 0) {
      const msgBoxRes = await MessageBox({
        messageTitle: `Confirm Removal of Scroll ${
          gridData?.[0]?.SCROLL1 ?? ""
        }`,
        message: `Are you sure you want to remove ${
          gridData?.length ?? ""
        } transaction?`,
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (msgBoxRes === "Yes") {
        let hasError = false;

        if (!Boolean(scrollNo)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            scrollErr: "Scroll Is Required",
          }));
          hasError = true;
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            scrollErr: "",
          }));
        }

        if (Boolean(remarks?.length < 5)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            remarkErr: "Remarks should be greater than 5 characters",
          }));
          hasError = true;
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            remarkErr: "",
          }));
        }
        if (!hasError) {
          if (screenFlag === "NPA_Entry") {
            let reqPara = {
              ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
              ENTERED_COMP_CD: authState?.companyID ?? "",
              SCROLL1: gridData?.[0]?.SCROLL1,
              SCREEN_REF: docCD,
              TYPE: "C",
              FLAG: "V",
              TRAN_DTL: gridData?.map(
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
              COMP_CD: authState.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              SCROLL_NO: gridData[0]?.SCROLL1,
              USER_DEF_REMARKS: remarks,
              ACCT_TYPE: gridData[0]?.ACCT_TYPE,
              ACCT_CD: gridData[0]?.ACCT_CD,
              TRAN_AMOUNT: gridData[0]?.AMOUNT,
              ENTERED_COMP_CD: gridData[0]?.COMP_CD,
              ENTERED_BRANCH_CD: gridData[0]?.ENTERED_BRANCH_CD,
              ACTIVITY_TYPE:
                screenFlag === "contraEntry"
                  ? "CONTRA ENTRY"
                  : "DAILY TRANSACTION",
              TRAN_DT: gridData[0]?.TRAN_DT,
              CONFIRM_FLAG: gridData[0]?.CONFIRMED,
              CONFIRMED: gridData[0]?.CONFIRMED,
            };
            deleteByScrollNo?.mutate(reqPara);
          }
        }
      } else if (msgBoxRes === "No") {
        CloseMessageBox();
        setScrollNo("");
      }
    } else {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: "NoRecordFound",
        icon: "ERROR",
      });
      setScrollNo("");
      trackDialogClass("viewOnly");
    }
  };
  const handleVoucherSearch = () => {
    setVoucherSearchDialog(false);
    setGridData((prev: any) => {
      return prev.filter((item: any) => item.TRAN_CD === voucherNo);
    });
    setVoucherNo("");
    trackDialogClass("viewOnly");
  };
  const handleVoucher = (event) => {
    const newValue = event.target.value.replace(/[^0-9]/g, "");
    setVoucherNo(newValue);
  };

  useEffect(() => {
    refetch();
  }, [state?.viewOnly]);
  const handleClose = () => {
    setOpenPhotoSign(false);
    setVoucherSearchDialog(false);
    trackDialogClass("viewOnly");
    setSelectedRow({});
  };

  TRN001_TableMetaData.gridConfig.gridLabel = `${t("TodayTransactionsBy")} ${
    authState?.user?.name
  }`;

  return (
    <>
      <div className="viewOnly">
        <Paper className="ENTRIES" sx={{ margin: "8px", padding: "8px" }}>
          {isError ||
          (getCarousalCards?.isError &&
            (!getCarousalCards?.error?.error_msg?.includes("Timeout") ||
              !getCarousalCards?.error?.error_msg?.includes("AbortError"))) ||
          deleteScrollByVoucher?.isError ||
          deleteByScrollNo?.isError ||
          npaEntryRemove?.isError ||
          npaEntryRemoveByScroll?.isError ||
          tabAPIData?.isTabsError ? (
            <Fragment>
              <div style={{ width: "100%", paddingTop: "10px" }}>
                <Alert
                  severity={"error"}
                  errorMsg={
                    (error?.error_msg ||
                      getCarousalCards?.error?.error_msg ||
                      deleteScrollByVoucher?.error?.error_msg ||
                      deleteByScrollNo?.error?.error_msg ||
                      npaEntryRemove?.error?.error_msg ||
                      npaEntryRemoveByScroll?.error?.error_msg ||
                      tabAPIData?.tabsErorr?.error_msg) ??
                    "Error"
                  }
                  errorDetail={
                    (error?.error_detail ||
                      getCarousalCards?.error?.error_detail ||
                      deleteScrollByVoucher?.error?.error_detail ||
                      deleteByScrollNo?.error?.error_detail ||
                      npaEntryRemove?.error?.error_detail ||
                      npaEntryRemoveByScroll?.error?.error_detail ||
                      tabAPIData?.tabsErorr?.error_detail) ??
                    ""
                  }
                />
              </div>
            </Fragment>
          ) : null}

          <GridWrapper
            key={`TRN001_TableMetaData${gridData}${isFetching}`}
            finalMetaData={TRN001_TableMetaData as GridMetaDataType}
            data={gridData ?? []}
            setData={setGridData}
            loading={
              Boolean(isLoading) ||
              Boolean(isFetching) ||
              Boolean(getCarousalCards.isLoading) ||
              Boolean(tabAPIData?.isTabsLoading) ||
              Boolean(npaEntryRemoveByScroll.isLoading)
            }
            refetchData={() => refetch()}
            ref={myGridRef}
            actions={actions}
            setAction={setCurrentAction}
            disableMultipleRowSelect={true}
            // variant={"outlined"}
            defaultSelectedRowId={
              trnGridData?.[0]?.TRAN_CD ? trnGridData?.[0]?.TRAN_CD : ""
            }
            // autoRefreshInterval={30}
          />
        </Paper>
      </div>

      {Boolean(deleteDialog) ? (
        <RemarksAPIWrapper
          // TitleText={`Do you want to remove the transaction - VoucherNo. ${dataRow?.TRAN_CD} ?`}
          TitleText={t("RemoveTransactionVoucher", {
            voucherNo: dataRow?.TRAN_CD,
          })}
          defaultValue={`WRONG ENTRY FROM ${utilFunction
            .getDynamicLabel(currentPath, authState?.menulistdata, true)
            ?.toUpperCase()}
          `}
          onActionYes={(input) => handleDelete(input)}
          onActionNo={() => {
            setDeleteDialog(false);
            trackDialogClass("viewOnly");
          }}
          isLoading={deleteScrollByVoucher?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={deleteDialog}
          rows={dataRow}
          isRequired={true}
        />
      ) : null}

      {Boolean(scrollDialog) ? (
        <Dialog
          maxWidth="lg"
          open={scrollDialog}
          className="scrollDialog"
          aria-describedby="alert-dialog-description"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle
            style={{
              cursor: "move",
              padding: "16px 24px 0px 24px",
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
              {t("ScrollRemove")}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              style={{ minWidth: "300px", marginTop: "10px" }}
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
            <TextField
              style={{ minWidth: "400px", marginTop: "15px" }}
              fullWidth={true}
              value={remarks}
              placeholder={t("EnterRemarks")}
              onChange={(event) => setRemarks(event?.target?.value ?? "")}
              label={t("Remark")}
              InputLabelProps={{ shrink: true }}
            />
            <DynFormHelperText msg={errors?.remarkErr} />
          </DialogContent>
          <DialogActions className="dialogFooter">
            <GradientButton onClick={() => handleDeletByScroll()}>
              {t("Delete")}
            </GradientButton>
            <GradientButton
              onClick={() => {
                setScrollDialog(false);
                setScrollNo("");
                trackDialogClass("viewOnly");
              }}
            >
              {t("Cancel")}
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}

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
                  ACCT_CD: passbookStatementPara?.ACCT_CD ?? "",
                  ACCT_TYPE: passbookStatementPara?.ACCT_TYPE ?? "",
                  BRANCH_CD: passbookStatementPara?.BRANCH_CD ?? "",
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
      {openPhotoSign ? (
        <PhotoSignWithHistory
          data={selectedRow}
          onClose={handleClose}
          screenRef={docCD}
        />
      ) : null}

      {Boolean(voucherSearchDialog) ? (
        <Dialog
          maxWidth="lg"
          className="voucherSearchDialog"
          open={voucherSearchDialog}
          aria-describedby="alert-dialog-description"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
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
            />
            <DynFormHelperText msg={errors?.scrollErr} />
          </DialogContent>
          <DialogActions className="dialogFooter">
            <GradientButton onClick={() => handleVoucherSearch()}>
              {t("Search")}
            </GradientButton>
            <GradientButton onClick={() => handleClose()}>
              {t("Cancel")}
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};
