import { LoaderPaperComponent, usePopupContext } from "@acuteinfo/common-base";
import { format, isValid, parse } from "date-fns";
import { getdocCD, validateHOBranch } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { icon } from "@fortawesome/fontawesome-svg-core";
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import i18n from "components/multiLanguage/languagesConfiguration";

const initialState: any = {
  srNo: 1,
  unqID: 0,
  branch: { label: "", value: "", info: {} },
  bugMsgBranchCode: "",
  accType: { label: "", value: "", info: {} },
  bugMsgAccType: "",
  accNo: "",
  bugAccNo: false,
  bugMsgAccNo: "",
  trx: { label: "", value: "", code: "" }, //TYPE_CD
  bugMsgTrx: "",
  scroll: "", //token
  bugMsgScroll: "",
  sdc: { label: "", value: "", info: {} },
  bugMsgSdc: "",
  remark: "",
  bugMsgRemarks: "",
  cNo: "",
  bugCNo: false,
  bugMsgCNo: "",
  date: new Date(),
  bugDate: false,
  bugMsgDate: "",
  debit: "",
  bugMsgDebit: "",
  credit: "",
  bugMsgCredit: "",
  bug: false,
  isCredit: true,
  // viewOnly: false,
  cheqNoFlag: {},
  cheqDateFlag: {},
  acctNoFlag: {},
  isOpenContraCreditForm: false,
  accName: "",
  // focusFieldKey: "",
  branchPrevVal: "",
  accTypePrevVal: "",
  accNoPrevVal: "",
  trxPrevVal: "",
  scrollTokenPreVal: "",
  amountPreVal: "",
  TYPE_CD: "",
  cNoPreVal: "",
  datePreVal: "",
  trxFocusFlag: false,
  SET_REMARK: "",
  isAcctValid: false,
  scrollTally: "Y",
};

const updateRows = (rows, updUnqId, updateFn) => {
  if (typeof updateFn !== "function") {
    throw new Error("updateFn must be a function");
  }

  const updatedRows = rows?.map((row) =>
    row?.unqID === updUnqId ? updateFn(row) : row
  );

  return updatedRows;
};

export const RowsReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case "UPDATE_ROW":
      return {
        ...state,
        rows: updateRows(state.rows, payload.updUnqId, payload.updateFn),
      };
    case "INDVSUAL_UPDATE":
      return {
        ...state,
        [payload?.key]: payload?.data,
      };
    case "UPDATE_ROW_DIRECT":
      return {
        ...state,
        rows: state.rows.map((row) =>
          row.unqID === payload.updUnqId ? { ...row, ...payload.newRow } : row
        ),
      };
    case "ADD_NEW_ROW":
      return {
        ...state,
        rows: [...state.rows, payload.newData],
      };
    case "RESET_ROWS":
      return {
        ...state,
        rows: [initialState],
      };
    case "DELETE_ROW":
      return {
        ...state,
        rows: state?.rows
          ?.filter((row) => {
            return row?.unqID !== payload?.updUnqId;
          })
          ?.map((row, index) => ({
            ...row,
            srNo: index + 1,
          })),
      };
    default:
      return state;
  }
};

export const TRN001Context = createContext<any>(initialState);
const TRN001Provider = ({ children }) => {
  const [state, dispatch] = useReducer(RowsReducer, {
    rows: [initialState],
    setLoadingStates: [],
    trxOption: [],
    totalDebit: 0,
    totalCredit: 0,
    viewOnly: false,
    cardsData: [],
    reqData: {},
    selectedRow: null,
    open360: false,
    isSearchAcctOpen: false,
    isAcctMst: false,
    isJointDtlOpen: false,
    isPhotoSignature: false,
  });
  const { authState } = useContext(AuthContext);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const stateRef = useRef<any>(state);
  stateRef.current = state;
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();

  const focusOnField = (acctNoRef, rowUnqID, refrence) => {
    setTimeout(() => {
      if (acctNoRef) {
        acctNoRef.focusInput(rowUnqID, refrence);
      }
    }, 0);
  };
  //UPDATE_ROW function for all field
  const updateRow = (updUnqId, updateFn) => {
    dispatch({
      type: "UPDATE_ROW",
      payload: {
        updUnqId,
        updateFn,
      },
    });
  };
  const induvidualUpdate = (data, key) => {
    dispatch({
      type: "INDVSUAL_UPDATE",
      payload: { data, key },
    });
  };

  const updateRowDirect = (updUnqId, newRow) => {
    dispatch({
      type: "UPDATE_ROW_DIRECT",
      payload: { updUnqId, newRow },
    });
  };

  //For clear or set initial values for all fields
  const clearAllFields = (unqID, row, additionalFields = {}) => {
    const resetValues = {
      ...(children?.props?.screenFlag !== "contraEntry" && {
        trx: { label: "", value: "", code: "" },
      }),
      bugMsgTrx: "",
      cNo: "",
      bugMsgCNo: "",
      date:
        parse(authState?.workingDate, "dd/MMM/yyyy", new Date()) ?? new Date(),
      bugMsgDate: "",
      debit: "",
      bugMsgDebit: "",
      credit: "",
      bugMsgCredit: "",
      scroll: "",
      bugMsgScroll: "",
      cheqNoFlag: { [unqID]: false },
      cheqDateFlag: { [unqID]: false },
      trxPrevVal: "",
      scrollTokenPreVal: "",
      amountPreVal: "",
      cNoPreVal: "",
      datePreVal: "",
      // sdc: { label: "", value: "", info: {} },
      // remark: "",
    };

    const updatedRowData = {
      ...row,
      ...resetValues,
      ...additionalFields,
    };

    return updatedRowData;
  };

  const handleSetDefaultBranch = useCallback(
    (data, authState, updUnqId) => {
      if (Boolean(data)) {
        const updateFn = (row) => {
          const branch = data?.find(
            (branch) => branch?.value === authState?.user?.branchCode
          );
          return {
            ...row,
            branch: branch ?? row.branch,
            branchPrevVal: branch ?? row.branch,
          };
        };
        updateRow(updUnqId, updateFn);
      }
    },
    [state?.rows]
  );

  const handleSetDefSCD = useCallback(
    (data, updUnqId) => {
      if (Boolean(data) && children?.props?.screenFlag !== "TRNF_BATCH") {
        const updateFn = (row) => {
          const findSdc = data?.find((item) => {
            return children?.props?.screenFlag === "contraEntry"
              ? item?.value === "6   "
              : item?.value === "1   ";
          });
          return {
            ...row,
            sdc: findSdc ?? row?.sdc,
            remark: findSdc?.actLabel,
          };
        };
        updateRow(updUnqId, updateFn);
      }
    },
    [docCD]
  );

  const handleBranchChange = useCallback(
    ({ updUnqId, branchVal }) => {
      updateRow(updUnqId, (row) => ({ ...row, branch: branchVal }));
    },
    [state.rows]
  );

  const handleBranchBlur = useCallback(
    async ({ updUnqId, acctNoRef, setLoadingState }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      if (updUnqId === currVal?.unqID) {
        if (currVal?.branch?.value) {
          if (
            currVal?.branch?.value?.trim() !==
            currVal?.branchPrevVal?.value?.trim()
          ) {
            setLoadingState(updUnqId, "BRANCHCD", true);
            const isHOBranch = await validateHOBranch(
              currVal?.branch ?? "",
              MessageBox,
              authState,
              "ErrorMessageBox"
            );
            setLoadingState(updUnqId, "BRANCHCD", false);
            if (isHOBranch) {
              updateRow(updUnqId, (row) =>
                clearAllFields(updUnqId, row, {
                  branch: { label: "", value: "", info: {} },
                  bugMsgBranchCode: t("BranchCodeReqired"),
                  branchPrevVal: { label: "", value: "", info: {} },
                  accType: { label: "", value: "", info: {} },
                  bugMsgAccType: "",
                  accNo: "",
                  bugMsgAccNo: "",
                  acctNoFlag: { [updUnqId]: false },
                  // focusFieldKey: "BRANCH_FOC",
                })
              );
              focusOnField(acctNoRef?.current, updUnqId, "BRANCH_CD");
              return;
            }
            updateRow(updUnqId, (row) =>
              clearAllFields(updUnqId, row, {
                bugMsgBranchCode: "",
                branchPrevVal: currVal?.branch ?? "",
                accType: { label: "", value: "", info: {} },
                bugMsgAccType: "",
                accNo: "",
                bugMsgAccNo: "",
                acctNoFlag: { [updUnqId]: false },
                // focusFieldKey: "",
              })
            );
          }
        } else {
          updateRow(updUnqId, (row) =>
            clearAllFields(updUnqId, row, {
              bugMsgBranchCode: t("BranchCodeReqired"),
              branchPrevVal: { label: "", value: "", info: {} },
              accType: { label: "", value: "", info: {} },
              bugMsgAccType: "",
              accNo: "",
              bugMsgAccNo: "",
              acctNoFlag: { [updUnqId]: false },
            })
          );
          return;
        }
      }
    },
    [state?.rows]
  );

  const handleAccTypeChange = useCallback(
    ({ updUnqId, value }) => {
      updateRow(updUnqId, (row) => ({ ...row, accType: value }));
    },
    [state?.rows]
  );

  const handleAccTypeBlurCtx = useCallback(
    ({ updUnqId, mutationFn, setLoadingState }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      if (updUnqId === currVal?.unqID) {
        if (
          Boolean(currVal?.accType?.value) &&
          Boolean(currVal?.branch?.value)
        ) {
          if (
            currVal?.accType?.value?.trim() !== currVal?.accTypePrevVal?.trim()
          ) {
            const reqPara = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: currVal?.branch?.value ?? "",
              ACCT_TYPE: currVal?.accType?.value ?? "",
              SCREEN_REF: docCD ?? "",
              unqID: updUnqId,
            };
            setLoadingState(updUnqId, "ACCTTYPE", true);
            mutationFn?.mutate(reqPara);
          }
        } else {
          updateRow(updUnqId, (row) =>
            clearAllFields(updUnqId, row, {
              bugMsgAccType: "Account Type is Required",
              accNo: "",
              bugMsgAccNo: "",
              accTypePrevVal: "",
              acctNoFlag: { [updUnqId]: false },
            })
          );
          return;
        }
      }
    },
    [state?.rows]
  );

  const handleAcctNoChange = useCallback(
    ({ updUnqId, value }) => {
      updateRow(updUnqId, (row) => ({
        ...row,
        isAcctValid: false,
      }));
      const sanitizedValue = value?.replace(/[^0-9 ]/g, "");
      if (sanitizedValue?.length <= 20) {
        updateRow(updUnqId, (row) => ({ ...row, accNo: sanitizedValue ?? "" }));
      }
    },
    [state?.rows]
  );

  const handleAcctNoBlurCtx = useCallback(
    ({ updUnqId, newRow }) => {
      updateRowDirect(updUnqId, newRow);
    },
    [state?.rows]
  );

  const handleTrxCtx = useCallback(
    async ({ updUnqId, value, defSdc }) => {
      updateRow(updUnqId, (row) => ({
        ...row,
        trx: value ?? "",
        sdc: defSdc ?? { label: "", value: "", info: {} },
        bugMsgSdc: "",
        remark: defSdc?.actLabel ?? "",
        bugMsgRemarks: "",
        isCredit: ["1", "2", "3"]?.includes(value?.code),
      }));
    },
    [state?.rows]
  );

  const handleTrxBlurCtx = useCallback(
    ({ updUnqId, mutationFn, getBtnName, setLoadingState, parametres }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      const prevRow = state?.rows?.find(
        (row) => Number(row?.unqID) === Number(currVal?.unqID) - 1
      );
      const bugMsgTrx = currVal?.trx?.code ? "" : "Trx is Required";
      if (bugMsgTrx) {
        updateRow(updUnqId, (row) => ({
          ...row,
          bugMsgTrx,
          trxPrevVal: "",
        }));
        return;
      }

      let preData;

      if (currVal?.trx?.code?.trim() !== currVal?.trxPrevVal?.trim()) {
        updateRow(updUnqId, (row) => {
          if (
            Boolean(row?.branch?.value) &&
            Boolean(row?.accType?.value) &&
            Boolean(row?.accNo) &&
            Boolean(row?.trx?.value)
          ) {
            const apiReq = {
              A_ENT_COMP_CD: authState?.companyID ?? "",
              A_ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
              A_COMP_CD: authState?.companyID ?? "",
              A_BRANCH_CD: row?.branch?.value ?? "",
              A_ACCT_TYPE: row?.accType?.value ?? "",
              A_ACCT_CD: row?.accNo ?? "",
              A_INST_DUE_DT: format(new Date(), "dd/MMM/yyyy"),
              A_TYPE_CD: row?.trx?.value ?? "",
              A_AC_TYPE_CD: row?.TYPE_CD ?? "",
              A_GD_DATE: authState?.workingDate ?? "",
              A_SCREEN_REF: docCD,
              A_LANG: i18n.resolvedLanguage ?? "",
              A_USER: authState?.user?.id ?? "",
              A_USER_LEVEL: authState?.role ?? "",
              unqID: row?.unqID,
              PREV_TYPE_CD: prevRow?.trx?.code ?? "",
              PREV_SCROLL: prevRow?.scroll ?? "",
              PARA_24: parametres?.[0]?.PARA_24 ?? "",
              SCROLL_TALLY:
                children?.props?.screenFlag === "TRNF_BATCH"
                  ? state?.totalCredit === state?.totalDebit
                    ? "Y"
                    : "N"
                  : prevRow?.scrollTally ?? "Y",
            };

            if (Boolean(JSON?.stringify(apiReq) !== JSON?.stringify(preData))) {
              preData = apiReq;
              setLoadingState(updUnqId, "TRXVALID", true);
              mutationFn?.mutate(apiReq);
            }
          }
          return { ...row, bugMsgTrx, trxPrevVal: currVal?.trx?.code };
        });
      }
    },
    [state?.rows]
  );
  const handleScrollCtx = useCallback(
    ({ updUnqId, value }) => {
      const numericValue = value?.replace(/\D/g, "");
      if (!Boolean(numericValue?.length > 6)) {
        updateRow(updUnqId, (row) => ({
          ...row,
          scroll: numericValue,
        }));
      }
    },
    [state?.rows]
  );
  const handleScrollBlurCtx = useCallback(
    ({ updUnqId, value, mutationFn, authState, setLoadingState }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      let bugScroll;

      if (currVal?.scroll === "" && currVal?.scrollDisable !== "Y") {
        bugScroll =
          currVal?.trx?.code === "4"
            ? "Token is Required"
            : currVal?.trx?.code === "1"
            ? "Scroll is Required"
            : "";
      }

      if (bugScroll) {
        updateRow(updUnqId, (row) => ({
          ...row,
          bugMsgScroll: bugScroll,
          scrollTokenPreVal: "",
        }));
        return;
      }

      let preRequest;
      if (currVal?.scroll?.trim() !== currVal?.scrollTokenPreVal?.trim()) {
        updateRow(updUnqId, (row) => {
          if (row?.trx?.code === "4" || row?.trx?.code === "1") {
            const req = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: row?.branch?.value ?? "",
              ACCT_TYPE: row?.accType?.value ?? "",
              ACCT_CD: row?.accNo ?? "",
              ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
              SCROLL1: value ?? "",
              TYPE_CD: row?.trx?.value ?? "",
              AMOUNT: row?.debit || row?.credit || "0",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.name ?? "",
              USERROLE: authState?.role ?? "",
              DOC_CD: docCD,
              unqID: updUnqId,
            };
            if (Boolean(JSON?.stringify(req) !== JSON?.stringify(preRequest))) {
              preRequest = req;
              setLoadingState(updUnqId, "TOKEN", true);
              mutationFn?.mutate(req);
            }
          }
          return {
            ...row,
            bugMsgScroll: bugScroll,
          };
        });
      }
    },
    [state?.rows]
  );

  const getTokenValidation = useCallback(
    async ({ updUnqId, data, getBtnName, setLoadingState, acctNoRef }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      if (state?.rows?.length > 0) {
        for (let i = 0; i < data?.length; i++) {
          if (data?.length > 0) {
            const status: any = data[i]?.O_STATUS;
            const message = data[i]?.O_MESSAGE;
            const msgTitle = data[i]?.O_MSG_TITLE;
            if (status === "999") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "ValidationFailed",
                message,
                icon: "ERROR",
              });
              if (btnNm === "Ok") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  scroll: "",
                  scrollTokenPreVal: "",
                  bugMsgScroll:
                    row?.trx?.code === "4"
                      ? "Token is Required"
                      : row?.trx?.code === "1"
                      ? "Scroll is Required"
                      : "",
                }));
                focusOnField(acctNoRef?.current, updUnqId, "SCROLL");
              }
            } else if (status === "99") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Confirmation",
                message,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (btnNm === "No") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  scroll: "",
                  scrollTokenPreVal: "",
                  bugMsgScroll:
                    row?.trx?.code === "4"
                      ? "Token is Required"
                      : row?.trx?.code === "1"
                      ? "Scroll is Required"
                      : "",
                }));
                focusOnField(acctNoRef?.current, updUnqId, "SCROLL");
                break;
              }
            } else if (status === "9") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Alert",
                message,
                icon: "WARNING",
              });
            } else if (status === "0") {
              focusOnField(acctNoRef?.current, updUnqId, "SCROLL");
              updateRow(updUnqId, (row) => ({
                ...row,
                scrollTokenPreVal: currVal?.scroll ?? "",
              }));
              setTimeout(() => {
                focusOnField(acctNoRef?.current, updUnqId, "SDC");
              }, 1);
            }
          }
        }
        setLoadingState(updUnqId, "TOKEN", false);
      }
    },
    [state?.rows]
  );

  const handleSdcCtx = useCallback(
    ({ updUnqId, value, parametres }) => {
      updateRow(updUnqId, (row) => {
        return {
          ...row,
          sdc: value,
          remark:
            parametres?.[0]?.SET_REMARKS === "Y"
              ? value?.actLabel
              : row?.remark,
          bugMsgRemarks: "",
        };
      });
    },
    [state?.rows]
  );
  const handleSdcBlurCtx = useCallback(
    ({ updUnqId }) => {
      const bugMsgSdc = state?.rows?.find((row) => row?.unqID === updUnqId)?.sdc
        ?.value
        ? ""
        : "SDC is Required";

      updateRow(updUnqId, (row) => ({
        ...row,
        bugMsgSdc: bugMsgSdc,
      }));
    },
    [state?.rows]
  );

  const handleRemarkCtx = useCallback(
    ({ updUnqId, value }) => {
      updateRow(updUnqId, (row) => ({
        ...row,
        remark: value ?? "",
      }));
    },
    [state?.rows]
  );

  const handleRemarksBlurCtx = useCallback(
    ({ updUnqId }) => {
      const bugMsgRemarks = state?.rows?.find((row) => row?.unqID === updUnqId)
        ?.remark
        ? ""
        : "Remarks is Required";

      updateRow(updUnqId, (row) => ({
        ...row,
        bugMsgRemarks: bugMsgRemarks,
      }));
    },
    [state?.rows]
  );
  const handleCNoCtx = useCallback(
    ({ updUnqId, value }) => {
      updateRow(updUnqId, (row) => ({
        ...row,
        cNo: value,
      }));
    },
    [state?.rows]
  );

  const handleCNoBlurCtx = useCallback(
    ({ updUnqId, value, mutationFn, setLoadingState }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      const bugMsgCNo = currVal?.cNo ? "" : "Cheque No. is Required";
      if (bugMsgCNo) {
        updateRow(updUnqId, (row) => ({
          ...row,
          bugMsgCNo,
          cNoPreVal: "",
          datePreVal: "",
        }));
        return;
      }

      let preData;
      if (currVal?.cNo?.trim() !== currVal?.cNoPreVal?.trim()) {
        updateRow(updUnqId, (row) => {
          const currentRequest = {
            BRANCH_CD: row?.branch?.value ?? "",
            ACCT_TYPE: row?.accType?.value ?? "",
            ACCT_CD: row?.accNo ?? "",
            CHEQUE_NO: value ?? "",
            TYPE_CD: currVal?.TYPE_CD ?? "",
            SCREEN_REF: docCD ?? "",
            unqID: updUnqId,
          };

          // if (Boolean(value)) {
          const hasRequiredFields =
            Boolean(row?.accNo) &&
            Boolean(row?.accType?.value) &&
            Boolean(row?.branch?.value) &&
            Boolean(JSON.stringify(currentRequest) !== JSON.stringify(preData));

          if (
            children?.props?.screenFlag === "contraEntry" &&
            hasRequiredFields
          ) {
            preData = currentRequest;
            setLoadingState(updUnqId, "CHQNOVALID", true);
            mutationFn.mutate(currentRequest);
          } else if (
            hasRequiredFields &&
            !Boolean(row?.isCredit) &&
            Boolean(row?.trx?.value)
          ) {
            preData = currentRequest;
            setLoadingState(updUnqId, "CHQNOVALID", true);
            mutationFn.mutate(currentRequest);
          }
          // }
          return {
            ...row,
            cNo: value,
            bugMsgCNo: "",
            cNoPreVal: value,
            cheqNoFlag: { [updUnqId]: false },
            datePreVal: "",
          };
        });
      }
    },
    [state?.rows]
  );

  const getChqValidationCtx = useCallback(
    async ({
      updUnqId,
      data,
      getBtnName,
      chequeDate,
      setLoadingState,
      acctNoRef,
    }) => {
      if (state?.rows?.length > 0) {
        for (let i = 0; i < data?.length; i++) {
          if (data?.length > 0) {
            const status: any = data[i]?.O_STATUS;
            const message = data[i]?.O_MESSAGE;
            const msgTitle = data[i]?.O_MSG_TITLE;

            if (status === "999") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "ValidationFailed",
                message,
                icon: "ERROR",
              });
              if (btnNm === "Ok") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  cNo: "",
                  bugMsgCNo: "Cheque No. is Required",
                  date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                  bugMsgDate: "",
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqNoFlag: { [updUnqId]: false },
                  cheqDateFlag: { [updUnqId]: false },
                  // focusFieldKey: "CHQ_NO",
                  amountPreVal: "",
                  datePreVal: "",
                  cNoPreVal: "",
                }));
                focusOnField(acctNoRef?.current, updUnqId, "CHQ_NO");
              }
            } else if (status === "99") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Confirmation",
                message,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (btnNm === "No") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  cNo: "",
                  bugMsgCNo: "Cheque No. is Required",
                  date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                  bugMsgDate: "",
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqNoFlag: { [updUnqId]: false },
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                  cNoPreVal: "",
                }));
                focusOnField(acctNoRef?.current, updUnqId, "CHQ_NO");
                break;
              } else if (btnNm === "Yes") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                  bugMsgDate: "",
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqNoFlag: { [updUnqId]: true },
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                }));
              }
            } else if (status === "9") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Alert",
                message,
                icon: "WARNING",
              });
              if (btnNm === "Ok") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                  bugMsgDate: "",
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqNoFlag: { [updUnqId]: false },
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                }));
              }
            } else if (status === "0") {
              updateRow(updUnqId, (row) => ({
                ...row,
                date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                bugMsgDate: "",
                debit: "",
                bugMsgDebit: "",
                credit: "",
                bugMsgCredit: "",
                cheqNoFlag: { [updUnqId]: true },
                cheqDateFlag: { [updUnqId]: false },
                amountPreVal: "",
                datePreVal: "",
                cNoPreVal: row?.cNo,
              }));
              focusOnField(acctNoRef?.current, updUnqId, "CHQ_DT");
            }
          }
        }
      }
    },
    [state?.rows]
  );

  const handleDateCtx = useCallback(
    ({ updUnqId, date }) => {
      updateRow(updUnqId, (row) => ({
        ...row,
        date: date ?? "",
      }));
    },
    [state?.rows]
  );

  const handleDateBlurCtx = useCallback(
    ({ updUnqId, event, mutationFn, setLoadingState }) => {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      let preData;
      const date = event?.target?.value;
      const parsedDate = parse(date, "dd/MM/yyyy", new Date());

      if (currVal?.date !== currVal?.datePreVal) {
        updateRow(updUnqId, (row) => {
          const currentRequest = {
            BRANCH_CD: row?.branch?.value ?? "",
            TYPE_CD:
              children?.props?.screenFlag === "contraEntry"
                ? "6"
                : row?.trx?.value ?? "",
            CHEQUE_NO: row?.cNo ?? "",
            CHEQUE_DT: row?.date ?? "",
            unqID: updUnqId,
          };
          let bugMsgDate = "";
          let bugDate = false;
          if (isValid(parsedDate)) {
            if (new Date(parsedDate) < new Date(authState?.minDate)) {
              bugMsgDate = t("DateOutOfPeriod");
              bugDate = true;
            } else {
              bugMsgDate = "";
              bugDate = false;
              const hasRequiredFields =
                Boolean(row?.cNo) &&
                Boolean(row?.date) &&
                Boolean(row?.branch?.value) &&
                Boolean(
                  JSON?.stringify(currentRequest) !== JSON?.stringify(preData)
                );
              if (
                children?.props?.screenFlag === "contraEntry" &&
                hasRequiredFields
              ) {
                preData = currentRequest;
                setLoadingState(updUnqId, "CHQDATE", true);
                mutationFn?.mutate(currentRequest);
              } else if (Boolean(row?.trx?.value) && hasRequiredFields) {
                preData = currentRequest;
                setLoadingState(updUnqId, "CHQDATE", true);
                mutationFn?.mutate(currentRequest);
              }
            }
          } else {
            bugMsgDate = "Invalid Date";
            bugDate = true;
          }
          return {
            ...row,
            date: parsedDate,
            bugMsgDate,
            bugDate,
            cheqDateFlag: { [updUnqId]: false },
            datePreVal: parsedDate,
          };
        });
      }
    },
    [state?.rows]
  );

  const getDateValidationCtx = useCallback(
    async ({
      updUnqId,
      data,
      getBtnName,
      chequeDate,
      setLoadingState,
      acctNoRef,
    }) => {
      if (state?.rows?.length > 0) {
        for (let i = 0; i < data?.length; i++) {
          if (data?.length > 0) {
            const status: any = data[i]?.STATUS;
            const message = data[i]?.MESSAGE1;
            const msgTitle = data[i]?.O_MSG_TITLE;
            if (status === "999") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "ValidationFailed",
                message,
                icon: "ERROR",
              });
              if (btnNm === "Ok") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  date: "",
                  bugMsgDate: "Invalid Date",
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                }));
                focusOnField(acctNoRef?.current, updUnqId, "CHQ_DT");
              }
            } else if (status === "99") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Confirmation",
                message,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });
              if (btnNm === "No") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  date: "Invalid Date",
                  bugMsgDate: "",
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                }));
                focusOnField(acctNoRef?.current, updUnqId, "CHQ_DT");
                break;
              } else if (btnNm === "Yes") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                }));
              }
            } else if (status === "9") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Alert",
                message,
                icon: "WARNING",
              });
              if (btnNm === "Ok") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  debit: "",
                  bugMsgDebit: "",
                  credit: "",
                  bugMsgCredit: "",
                  cheqDateFlag: { [updUnqId]: false },
                  amountPreVal: "",
                  datePreVal: "",
                }));
              }
            } else if (status === "0") {
              updateRow(updUnqId, (row) => ({
                ...row,
                debit: "",
                bugMsgDebit: "",
                credit: "",
                bugMsgCredit: "",
                cheqDateFlag: { [updUnqId]: true },
                amountPreVal: "",
              }));
              focusOnField(acctNoRef?.current, updUnqId, "DBT_FLD");
            }
          }
        }
      }
      setLoadingState(updUnqId, "CHQDATE", false);
    },
    [state?.rows]
  );

  const handleDebitCtx = useCallback(
    ({ updUnqId, newRow }) => {
      updateRowDirect(updUnqId, newRow);
    },
    [state?.rows]
  );

  const handleDebitBlurCtx = useCallback(
    ({ updUnqId, value, setLoadingState, mutationFn, authState, cardData }) => {
      let preData;

      updateRow(updUnqId, (row) => {
        let bugMsgDebit =
          (children?.props?.screenFlag === "contraEntry" && value) ||
          (children?.props?.screenFlag !== "contraEntry" &&
            value &&
            !row?.isCredit)
            ? ""
            : "Debit Amount is Required";

        if (
          Boolean(value) &&
          Boolean(row) &&
          Object?.keys(row)?.length > 0 &&
          Object?.keys(cardData)?.length > 0
        ) {
          const reqPara = {
            BRANCH_CD: row?.branch?.value ?? "",
            ACCT_TYPE: row?.accType?.value ?? "",
            ACCT_CD: row?.accNo ?? "",
            TYPE_CD:
              children?.props?.screenFlag === "contraEntry"
                ? "6"
                : row?.trx?.code ?? "",
            COMP_CD: authState?.companyID ?? "",
            CHEQUE_NO: row?.cNo ?? "",
            AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "0",
            SHADOW_CL: cardData?.SHADOW_CLEAR ?? "0",
            HOLD_BAL: cardData?.HOLD_BAL ?? "0",
            LEAN_AMT: cardData?.LIEN_AMT ?? "0",
            AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "N",
            MIN_BALANCE: cardData?.MIN_BALANCE ?? "0",
            CONF_BAL: cardData?.CONF_BAL ?? "0",
            TRAN_BAL: cardData?.TRAN_BAL ?? "0",
            UNCL_BAL: cardData?.UNCL_BAL ?? "",
            LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "0",
            DRAWING_POWER: cardData?.DRAWING_POWER ?? "0",
            AMOUNT: row?.debit ?? "0",
            OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "N",
            OP_DATE: cardData?.OP_DATE ?? "",
            INST_NO: cardData?.INST_NO ?? "0",
            INST_RS: cardData?.INST_RS ?? "0",
            PENDING_AMOUNT: cardData?.PENDING_AMOUNT ?? "0",
            STATUS: cardData?.STATUS ?? "",
            TYPE: "C",
            SCREEN_REF: docCD ?? "",
            TRAN_CD: "",
            FLAG: "D",
            SCROLL1: row?.scroll ?? "",
            unqID: updUnqId,
          };

          if (Boolean(JSON?.stringify(reqPara) !== JSON?.stringify(preData))) {
            preData = reqPara;
            setLoadingState(updUnqId, "AMNTVALIDDR", true);
            mutationFn?.mutate(reqPara);
          }
        }
        return {
          ...row,
          bugMsgDebit,
          amountPreVal: "",
        };
      });
    },
    [state?.rows]
  );

  const handleCreditCtx = useCallback(
    ({ updUnqId, newRow }) => {
      updateRowDirect(updUnqId, newRow);
    },
    [state?.rows]
  );

  const handleCreditBlurCtx = useCallback(
    ({ updUnqId, value, setLoadingState, cardData, authState, mutationFn }) => {
      let preData;

      updateRow(updUnqId, (row) => {
        const bugMsgCredit =
          !value && Boolean(row?.isCredit) ? "Credit Amount is Required" : "";

        if (
          Boolean(value) &&
          Boolean(row) &&
          Object?.keys(row)?.length > 0 &&
          Object?.keys(cardData)?.length > 0
        ) {
          const reqPara = {
            BRANCH_CD: row?.branch?.value ?? "",
            ACCT_TYPE: row?.accType?.value ?? "",
            ACCT_CD: row?.accNo ?? "",
            TYPE_CD:
              children?.props?.screenFlag === "contraEntry"
                ? "6"
                : row?.trx?.code ?? "",
            COMP_CD: authState?.companyID ?? "",
            CHEQUE_NO: row?.cNo ?? "",
            AVALIABLE_BAL: cardData?.WITHDRAW_BAL ?? "0",
            SHADOW_CL: cardData?.SHADOW_CLEAR ?? "0",
            HOLD_BAL: cardData?.HOLD_BAL ?? "0",
            LEAN_AMT: cardData?.LIEN_AMT ?? "0",
            AGAINST_CLEARING: cardData?.AGAINST_CLEARING ?? "N",
            MIN_BALANCE: cardData?.MIN_BALANCE ?? "0",
            CONF_BAL: cardData?.CONF_BAL ?? "0",
            TRAN_BAL: cardData?.TRAN_BAL ?? "0",
            UNCL_BAL: cardData?.UNCL_BAL ?? "",
            LIMIT_AMOUNT: cardData?.LIMIT_AMOUNT ?? "0",
            DRAWING_POWER: cardData?.DRAWING_POWER ?? "0",
            AMOUNT: row?.credit ?? "0",
            OD_APPLICABLE: cardData?.OD_APPLICABLE ?? "N",
            OP_DATE: cardData?.OP_DATE ?? "",
            INST_NO: cardData?.INST_NO ?? "0",
            INST_RS: cardData?.INST_RS ?? "0",
            PENDING_AMOUNT: cardData?.PENDING_AMOUNT ?? "0",
            STATUS: cardData?.STATUS ?? "",
            TYPE: "C",
            SCREEN_REF: docCD ?? "",
            TRAN_CD: "",
            FLAG: "C",
            SCROLL1: row?.scroll ?? "",
            unqID: updUnqId,
          };

          if (Boolean(JSON?.stringify(reqPara) !== JSON?.stringify(preData))) {
            preData = reqPara;
            setLoadingState(updUnqId, "AMNTVALIDCR", true);
            mutationFn?.mutate(reqPara);
          }
        }
        return {
          ...row,
          bugMsgCredit,
          amountPreVal: "",
        };
      });
    },
    [state?.rows]
  );

  const getAmountValidationCtx = useCallback(
    async ({
      updUnqId,
      data,
      getBtnName,
      setLoadingState,
      totalDebit,
      totalCredit,
      handleAddRow,
      crDbFlag,
      handleScrollSave1,
      acctNoRef,
    }) => {
      if (state?.rows?.length > 0) {
        const rowData = state?.rows?.find((row) => row?.unqID === updUnqId);
        const validateRows = (rows) => {
          return rows?.every((row) => {
            const hasDebit = row.debit && row.debit.trim() !== "";
            const hasCredit = row.credit && row.credit.trim() !== "";
            return hasDebit || hasCredit;
          });
        };
        for (let i = 0; i < data?.length; i++) {
          if (data?.length > 0) {
            const status: any = data[i]?.O_STATUS;
            const message = data[i]?.O_MESSAGE;
            const msgTitle = data[i]?.O_MSG_TITLE;
            if (status === "999") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "ValidationFailed",
                message,
                icon: "ERROR",
              });
              if (btnNm === "Ok") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  debit: "",
                  credit: "",
                  bugMsgDebit:
                    crDbFlag === "D" ? "Debit Amount is Required" : "",
                  bugMsgCredit:
                    crDbFlag === "D" ? "" : "Credit Amount is Required",
                  // focusFieldKey: crDbFlag === "D" ? "DEBIT" : "CREDIT",
                  amountPreVal: "",
                }));

                focusOnField(
                  acctNoRef?.current,
                  updUnqId,
                  crDbFlag === "D" ? "DBT_FLD" : "CRDT_FLD"
                );
              }
            } else if (status === "99") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Confirmation",
                message,
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "No",
                icon: "CONFIRM",
              });
              if (btnNm === "No") {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  debit: "",
                  credit: "",
                  bugMsgDebit:
                    crDbFlag === "D" ? "Debit Amount is Required" : "",
                  bugMsgCredit:
                    crDbFlag === "D" ? "" : "Credit Amount is Required",
                  // focusFieldKey: crDbFlag === "D" ? "DEBIT" : "CREDIT",
                  amountPreVal: "",
                }));

                focusOnField(
                  acctNoRef?.current,
                  updUnqId,
                  crDbFlag === "D" ? "DBT_FLD" : "CRDT_FLD"
                );

                break;
              }
            } else if (status === "9") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Alert",
                message,
                icon: "WARNING",
              });
            } else if (status === "0") {
              if (Boolean(rowData)) {
                updateRow(updUnqId, (row) => ({
                  ...row,
                  amountPreVal: rowData?.debit
                    ? rowData?.debit
                    : rowData?.credit
                    ? rowData?.credit
                    : "",
                  scrollTally: data?.[i]?.SCROLL_TALLY ?? "",
                }));
                const { trx, debit: rowDebit, credit: rowCredit } = rowData;
                if (children?.props?.screenFlag === "contraEntry") {
                  const btnName = await MessageBox({
                    messageTitle: "Confirmation",
                    message: "ProceedToEnterCreditDetails",
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  if (btnName === "Yes") {
                    updateRow(updUnqId, (row) => ({
                      ...row,
                      isOpenContraCreditForm: true,
                    }));
                    CloseMessageBox();
                  } else {
                    focusOnField(acctNoRef?.current, updUnqId, "DBT_FLD");
                  }
                } else if (children?.props?.screenFlag === "TRNF_BATCH") {
                  if (
                    Boolean(totalDebit !== totalCredit) &&
                    Boolean(trx?.code === "3" || trx?.code === "6") &&
                    Boolean(rowCredit !== rowDebit)
                  ) {
                    handleAddRow();
                    focusOnField(acctNoRef?.current, updUnqId + 1, "ACC_TYPE");
                  } else if (validateRows(state?.rows)) {
                    handleScrollSave1(updUnqId, crDbFlag);
                  }
                } else if (children?.props?.screenFlag === "NPA_Entry") {
                  handleScrollSave1(updUnqId, crDbFlag);
                } else if (
                  children?.props?.screenFlag === "DAILY_TRN" &&
                  validateRows(state?.rows)
                ) {
                  handleScrollSave1(updUnqId, crDbFlag);
                }
              }
            }
          }
        }
        setLoadingState(
          updUnqId,
          crDbFlag === "D" ? "AMNTVALIDDR" : "AMNTVALIDCR",
          false
        );
      }
    },
    [state?.rows]
  );
  const deleteRowCtx = useCallback(
    ({ updUnqId, handleTotal }) => {
      dispatch({
        type: "DELETE_ROW",
        payload: {
          updUnqId,
        },
      });
      handleTotal(state?.rows?.filter((row) => row?.unqID !== updUnqId));
    },
    [state?.rows]
  );

  const checkErrorsFn = () => {
    return stateRef?.current?.rows?.some((row) => {
      const errorFields = [
        "bugMsgBranchCode",
        "bugMsgAccType",
        "bugMsgAccNo",
        "bugMsgTrx",
        "bugMsgScroll",
        "bugMsgSdc",
        "bugMsgRemarks",
        "bugMsgCNo",
        "bugMsgDate",
        "bugMsgDebit",
        "bugMsgCredit",
      ];

      const haveBug = errorFields?.some((field) => {
        return Boolean(row[field]);
      });

      return haveBug;
    });
  };

  const setFieldsError = useCallback(
    ({ updUnqId, payload }) => {
      updateRow(updUnqId, (row) => ({
        ...row,
        ...payload,
      }));
    },
    [state?.rows]
  );

  const getConfirmValidationCtx = useCallback(
    async ({ data, getBtnName }) => {
      let returnFlag = false;
      if (state?.rows?.length > 0) {
        for (let i = 0; i < data?.length; i++) {
          if (data?.length > 0) {
            const status: any = data[i]?.O_STATUS;
            const message = data[i]?.O_MESSAGE;
            const msgTitle = data[i]?.O_MSG_TITLE;
            if (status === "999") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "ValidationFailed",
                message,
                icon: "ERROR",
              });
              returnFlag = false;
            } else if (status === "99") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Confirmation",
                message,
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                // loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (btnNm === "No") {
                returnFlag = false;
                break;
              }
            } else if (status === "9") {
              const { btnNm, msgObj } = await getBtnName({
                messageTitle: msgTitle ?? "Alert",
                message,
                icon: "WARNING",
              });
            } else if (status === "0") {
              returnFlag = true;
            }
          }
        }
        return returnFlag;
      }
    },
    [state?.rows]
  );

  const trxValidationCtx = async ({
    updUnqId,
    data,
    getBtnName,
    chequeDate,
    cardData,
    acctNoRef,
    parametres,
  }) => {
    if (state?.rows?.length > 0) {
      const currVal = state?.rows?.find((row) => row?.unqID === updUnqId);
      const trxValues = ["1", "2", "3"];
      for (let i = 0; i < data?.length; i++) {
        if (data?.length > 0) {
          const status: any = data[i]?.O_STATUS;
          const message = data[i]?.O_MESSAGE;
          const title = data[i]?.O_MSG_TITLE;

          if (status === "999") {
            const { btnNm, msgObj } = await getBtnName({
              messageTitle: title ?? "ValidationFailed",
              message,
              icon: "ERROR",
            });
            if (btnNm === "Ok") {
              updateRow(updUnqId, (row) => ({
                ...row,
                cNo: "",
                bugMsgCNo: "",
                date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                bugMsgDate: "",
                debit: "",
                trx: { label: "", value: "", code: "" },
                bugMsgDebit: "",
                credit: "",
                bugMsgCredit: "",
                scroll: "",
                bugMsgScroll: "",
                cheqNoFlag: { [updUnqId]: false },
                bugMsgTrx: "Trx is Required",
                cheqDateFlag: { [updUnqId]: false },
                trxPrevVal: "",
                cNoPreVal: "",
                scrollTokenPreVal: "",
              }));
              focusOnField(acctNoRef?.current, updUnqId, "TRX");
            }
          } else if (status === "99") {
            const { btnNm, msgObj } = await getBtnName({
              messageTitle: title ?? "Confirmation",
              message,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnNm === "No") {
              updateRow(updUnqId, (row) => ({
                ...row,
                cNo: "",
                bugMsgCNo: "",
                date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                bugMsgDate: "",
                debit: "",
                trx: { label: "", value: "", code: "" },
                bugMsgDebit: "",
                credit: "",
                bugMsgCredit: "",
                scroll: "",
                bugMsgScroll: "",
                cheqNoFlag: { [updUnqId]: false },
                bugMsgTrx: "Trx is Required",
                cheqDateFlag: { [updUnqId]: false },
                trxPrevVal: "",
                cNoPreVal: "",
                scrollTokenPreVal: "",
              }));
              focusOnField(acctNoRef?.current, updUnqId, "TRX");
              break;
            } else if (btnNm === "Yes") {
              updateRow(updUnqId, (row) => ({
                ...row,
                cNo: !Boolean(trxValues?.includes(row?.trx?.value))
                  ? data?.[i]?.SET_CHQ_NO ?? ""
                  : "",
                bugMsgCNo: "",
                date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                bugMsgDate: "",
                debit: "",
                bugMsgDebit: "",
                credit:
                  trxValues.includes(row?.trx?.value) &&
                  data?.[i]?.SET_INST_AMOUNT === "Y"
                    ? cardData?.INST_RS ?? ""
                    : "",
                bugMsgCredit: "",
                scroll: "",
                bugMsgScroll: "",
                cheqNoFlag: { [updUnqId]: false },
                bugMsgTrx: "",
                cheqDateFlag: { [updUnqId]: false },
                cNoPreVal: "",
              }));
            }
          } else if (status === "9") {
            const { btnNm, msgObj } = await getBtnName({
              messageTitle: title ?? "Alert",
              message,
              icon: "WARNING",
            });
            if (btnNm === "Ok") {
              updateRow(updUnqId, (row) => ({
                ...row,
                cNo: !Boolean(trxValues?.includes(row?.trx?.value))
                  ? data?.[i]?.SET_CHQ_NO ?? ""
                  : "",
                bugMsgCNo: "",
                date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
                bugMsgDate: "",
                debit: "",
                bugMsgDebit: "",
                credit:
                  trxValues.includes(row?.trx?.value) &&
                  data?.[i]?.SET_INST_AMOUNT === "Y"
                    ? cardData?.INST_RS ?? ""
                    : "",
                bugMsgCredit: "",
                scroll: "",
                bugMsgScroll: "",
                cheqNoFlag: { [updUnqId]: false },
                bugMsgTrx: "",
                cheqDateFlag: { [updUnqId]: false },
                cNoPreVal: "",
              }));
            }
          } else if (status === "0") {
            updateRow(updUnqId, (row) => ({
              ...row,
              cNo: !Boolean(trxValues?.includes(row?.trx?.value))
                ? data?.[i]?.SET_CHQ_NO ?? ""
                : "",
              cNoPreVal: "",
              bugMsgCNo: "",
              date: parse(chequeDate, "dd/MMM/yyyy", new Date()),
              bugMsgDate: "",
              debit: "",
              bugMsgDebit: "",
              credit:
                trxValues.includes(row?.trx?.value) &&
                data?.[i]?.SET_INST_AMOUNT === "Y"
                  ? cardData?.INST_RS ?? ""
                  : "",
              bugMsgCredit: "",
              scroll: data?.[i]?.SCROLL1,
              scrollDisable: data?.[i]?.DISABLE_SCROLL1,
              bugMsgScroll: "",
              cheqNoFlag: { [updUnqId]: false },
              bugMsgTrx: "",
              cheqDateFlag: { [updUnqId]: false },
              trxPrevVal: currVal?.trx?.value,
            }));
            focusOnField(
              acctNoRef?.current,
              updUnqId,
              data?.[i]?.DISABLE_SCROLL1 === "Y"
                ? parametres?.[0]?.DIS_SDC === "Y"
                  ? "REMARKS"
                  : "SDC"
                : "SCROLL"
            );
          }
        }
      }
    }
  };

  const getBranchTypeValidCtx = useCallback(
    async ({ updUnqId, data, getBtnName, setLoadingState, acctNoRef }) => {
      let returnFlag = false;
      if (state?.rows?.length > 0) {
        for (let i = 0; i < data?.length; i++) {
          const status: any = data[i]?.O_STATUS;
          const message = data[i]?.O_MESSAGE;
          const msgTitle = data[i]?.O_MSG_TITLE;
          if (status === "999") {
            const { btnNm, msgObj } = await getBtnName({
              messageTitle: data[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message,
              icon: "ERROR",
            });
            if (btnNm === "Ok") {
              updateRow(updUnqId, (row) =>
                clearAllFields(updUnqId, row, {
                  bugMsgAccType: "Account Type is Required",
                  accType: { label: "", value: "", info: {} },
                  accNo: "",
                  bugMsgAccNo: "",
                  accTypePrevVal: "",
                  acctNoFlag: { [updUnqId]: false },
                })
              );
              returnFlag = false;
              focusOnField(acctNoRef?.current, updUnqId, "ACC_TYPE");
            }
          } else if (status === "99") {
            const { btnNm, msgObj } = await getBtnName({
              messageTitle: data[i]?.O_MSG_TITLE ?? "Confirmation",
              message,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (btnNm === "No") {
              updateRow(updUnqId, (row) =>
                clearAllFields(updUnqId, row, {
                  bugMsgAccType: "Account Type is Required",
                  accType: { label: "", value: "", info: {} },
                  accNo: "",
                  bugMsgAccNo: "",
                  accTypePrevVal: "",
                  acctNoFlag: { [updUnqId]: false },
                })
              );
              returnFlag = false;
              focusOnField(acctNoRef?.current, updUnqId, "ACC_TYPE");
              break;
            }
          } else if (status === "9") {
            const { btnNm, msgObj } = await getBtnName({
              messageTitle: data[i]?.O_MSG_TITLE ?? "Alert",
              message,
              icon: "WARNING",
            });
          } else if (status === "0") {
            updateRow(updUnqId, (row) =>
              clearAllFields(updUnqId, row, {
                bugMsgAccType: "",
                accTypePrevVal: row?.accType?.value ?? "",
                accNo: "",
                bugMsgAccNo: "",
                acctNoFlag: { [updUnqId]: false },
                SET_REMARK: data?.[0]?.SET_REMARKS ?? "",
              })
            );
            returnFlag = true;
            focusOnField(acctNoRef?.current, updUnqId, "ACCT_NO");
          }
          setLoadingState(updUnqId, "ACCTTYPE", false);
        }
        return returnFlag;
      }
    },
    [state?.rows]
  );

  return (
    <TRN001Context.Provider
      value={{
        state,
        stateRef: stateRef?.current,
        dispatch,
        handleSetDefaultBranch,
        handleBranchChange,
        handleBranchBlur,
        handleAccTypeChange,
        handleAccTypeBlurCtx,
        handleAcctNoChange,
        handleAcctNoBlurCtx,
        // getAcctNoValidationCtx,
        handleTrxCtx,
        handleTrxBlurCtx,
        handleScrollCtx,
        handleScrollBlurCtx,
        handleSdcCtx,
        handleSdcBlurCtx,
        handleRemarkCtx,
        handleRemarksBlurCtx,
        handleCNoCtx,
        handleCNoBlurCtx,
        getChqValidationCtx,
        handleDateCtx,
        handleDateBlurCtx,
        handleDebitCtx,
        handleDebitBlurCtx,
        handleCreditCtx,
        handleCreditBlurCtx,
        getDateValidationCtx,
        getAmountValidationCtx,
        deleteRowCtx,
        checkErrorsFn,
        getTokenValidation,
        setFieldsError,
        getConfirmValidationCtx,
        updateRow,
        trxValidationCtx,
        clearAllFields,
        getBranchTypeValidCtx,
        handleSetDefSCD,
        // resetInitRow,
        focusOnField,
        induvidualUpdate,
        updateRowDirect,
      }}
    >
      {children}
    </TRN001Context.Provider>
  );
};
export default TRN001Provider;
