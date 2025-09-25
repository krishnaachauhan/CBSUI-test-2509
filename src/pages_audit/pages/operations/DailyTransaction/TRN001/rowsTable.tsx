import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {
  forwardRef,
  Fragment,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TRN001Context } from "./Trn001Reducer";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import "./Trn001.css";
import useAutocompleteHandlers, {
  CustomeAutocomplete,
  CustomAmountField,
  DynFormHelperText,
  CustomTextField,
} from "./components";
import { getCurrencySymbol, formatCurrency } from "@acuteinfo/common-base";
import { usePropertiesConfigContext } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { handleShortcuts } from "./acctNoShortcuts";

const RowsTable = forwardRef<any, any>(
  (
    {
      rows,
      queriesResult,
      handleAccTypeBlur,
      handleAccNoBlur,
      loadingStates,
      handleTrx,
      getChqValidation,
      getDateValidation,
      // viewOnly,
      handleDebit,
      handleDebitBlur,
      handleCredit,
      handleCreditBlur,
      setLoadingState,
      // totalDebit,
      // totalCredit,
      // cardsData,
      // tabsDetails,
      parametres,
      handleGetHeaderTabs,
      getCarousalCards,
      carousalCrdLastReq,
      // setReqData,
      isTabsLoading,
      checkLoading,
      isCardsLoading,
      removeRow,
      handleScrollBlur,
      onKeyUp,
      onDoubleClick,
      screenFlag,
      handleTrxBlur,
      // selectedRow,
      // setSelectedRow,
    },
    ref
  ) => {
    const accInputRef = useRef<any>(null);
    const justInputRef = useRef({});
    const trxInputRef = useRef<any>(null);
    const cqDateInputRef = useRef<any>(null);
    const debitInputRef = useRef<any>({});
    const chqNoInpRef = useRef<any>({});
    const branchInputRef = useRef<any>({});
    const lastRowRef = useRef<any>();
    const {
      state,
      handleBranchChange,
      handleBranchBlur,
      handleAccTypeChange,
      handleAcctNoChange,
      handleTrxBlurCtx,
      handleScrollCtx,
      handleScrollBlurCtx,
      handleSdcCtx,
      handleSdcBlurCtx,
      handleRemarkCtx,
      handleRemarksBlurCtx,
      handleCNoCtx,
      handleCNoBlurCtx,
      handleDateCtx,
      handleDateBlurCtx,
      handleSetDefaultBranch,
      // resetInitRow,
      dispatch,
      updateRow,
      induvidualUpdate,
    } = useContext(TRN001Context);
    const { authState } = useContext(AuthContext);
    const customParameter = usePropertiesConfigContext();
    let currentPath = useLocation()?.pathname;
    const docCD = getdocCD(currentPath, authState?.menulistdata);

    const {
      commonDateFormat,
      dynamicAmountSymbol,
      currencyFormat,
      decimalCount,
    } = customParameter;

    useEffect(() => {
      return () => {
        const clean = async () => {
          dispatch({
            type: "RESET_ROWS",
            payload: {},
          });
          handleSetDefaultBranch(queriesResult?.[0]?.data, authState, 0);
        };
        clean();
      };
    }, [docCD]);

    const {
      handleHighlightChange: branchHighlightChange,
      handleKeyDown: branchKeyDown,
    } = useAutocompleteHandlers(handleBranchChange);
    const {
      handleHighlightChange: acctTypeHighlightChange,
      handleKeyDown: acctTypeKeyDown,
    } = useAutocompleteHandlers(handleAccTypeChange);
    const {
      handleHighlightChange: trxHighlightChange,
      handleKeyDown: trxKeyDown,
    } = useAutocompleteHandlers(handleTrx);
    const {
      handleHighlightChange: sdcHighlightChange,
      handleKeyDown: sdcKeyDown,
    } = useAutocompleteHandlers(handleSdcCtx);

    const rowToFocus = rows?.find((row) => row?.focusFieldKey);
    useImperativeHandle(ref, () => ({
      // focusAcctInput: (unqID) => {
      //   if (accInputRef?.current) {
      //     accInputRef?.current?.focus();
      //   }
      // },
      // focusTrxInput: () => {
      //   if (trxInputRef?.current) {
      //     trxInputRef?.current?.[rowToFocus?.unqID]?.focus();
      //   }
      // },
      // focusCqDateInput: () => {
      //   if (cqDateInputRef?.current) {
      //     cqDateInputRef?.current?.focus();
      //   }
      // },
      // focusDebitInput: () => {
      //   if (debitInputRef?.current) {
      //     debitInputRef?.current?.focus();
      //   }
      // },
      focusInput: (unqID, fieldName) => {
        if (
          justInputRef?.current[unqID] &&
          justInputRef?.current[unqID][fieldName]
        ) {
          justInputRef?.current[unqID][fieldName]?.focus();
        }
      },
    }));

    // //Field focus for Account Number field
    // useEffect(() => {
    //   if (rowToFocus) {
    //     // if (
    //     //   rowToFocus?.focusFieldKey === "TRX_FOC" &&
    //     //   trxInputRef.current[rowToFocus.unqID]
    //     // ) {
    //     //   trxInputRef.current[rowToFocus.unqID]?.focus();
    //     // } else
    //     if (
    //       rowToFocus?.focusFieldKey === "BRANCH_FOC" &&
    //       branchInputRef.current[rowToFocus?.unqID]
    //     ) {
    //       branchInputRef.current[rowToFocus?.unqID]?.focus();
    //     }
    //     updateRow(rowToFocus.unqID, (row) => ({
    //       ...row,
    //       focusFieldKey: "",
    //     }));
    //     // dispatch({
    //     //   type: "UPDATE_ROW",
    //     //   payload: {
    //     //     updUnqId: rowToFocus.unqID,
    //     //     updateFn: (row) => ({
    //     //       ...row,
    //     //       focusFieldKey: "",
    //     //     }),
    //     //   },
    //     // });
    //   }
    // }, [rows]);

    const handleonFocus = (event) => {
      const input = event?.target;
      if (input.value) {
        input?.select();
      }
    };

    const handleAPIActions = ({
      authState,
      row,
      carousalCrdLastReq,
      getCarousalCards,
      handleGetHeaderTabs,
    }) => {
      if (Boolean(row?.accType?.value) && Boolean(row?.branch?.value)) {
        handleGetHeaderTabs({
          COMP_CD: authState?.companyID ?? "",
          ACCT_TYPE: row?.accType?.value ?? "",
          BRANCH_CD: row?.branch?.value ?? "",
        });
      }

      if (Boolean(row?.accType?.info?.PARENT_TYPE) && Boolean(row?.accNo)) {
        const currReq = {
          COMP_CD: row?.branch?.info?.COMP_CD ?? "",
          ACCT_TYPE: row?.accType?.value ?? "",
          ACCT_CD: row?.accNo ?? "",
          PARENT_TYPE: row?.accType?.info?.PARENT_TYPE ?? "",
          PARENT_CODE: row?.accType?.info?.PARENT_CODE ?? "",
          BRANCH_CD: row?.branch?.value ?? "",
          SCREEN_REF: docCD ?? "",
          unqID: row?.unqID,
        };

        if (
          JSON?.stringify(carousalCrdLastReq?.current) !==
          JSON?.stringify(currReq)
        ) {
          carousalCrdLastReq.current = currReq;
          getCarousalCards?.mutate({ reqData: currReq });
        }
      }
    };
    const handleRowAction = (event, row, isDoubleClick = false) => {
      if (Boolean(row?.isAcctValid)) {
        induvidualUpdate(row?.unqID, "selectedRow");
        // setSelectedRow(row?.unqID);
        if (isDoubleClick) {
          handleAPIActions({
            authState,
            row,
            carousalCrdLastReq,
            getCarousalCards,
            handleGetHeaderTabs,
          });
          onDoubleClick(event, row?.unqID);
        } else {
          setTimeout(() => {
            handleAPIActions({
              authState,
              row,
              carousalCrdLastReq,
              getCarousalCards,
              handleGetHeaderTabs,
            });
          }, 200);
        }
      }
    };
    // Scroll to the last row when rows update
    useEffect(() => {
      if (lastRowRef.current) {
        lastRowRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, [state]);

    return (
      <>
        <TableContainer component={Paper} style={{ maxHeight: "28vh" }}>
          <fieldset
            disabled={
              Boolean(isTabsLoading) ||
              Boolean(checkLoading) ||
              Boolean(isCardsLoading)
            }
            style={{ border: "none" }}
          >
            <Table aria-label="simple table" padding={"none"} stickyHeader>
              <TableHead>
                <TableRow id="topHead">
                  <TableCell id="head">{t("Sr")}</TableCell>
                  <TableCell id="head">{t("Branch")}*</TableCell>
                  <TableCell id="head">{t("AcctType")}*</TableCell>
                  <TableCell id="head">{t("ACNo")}*</TableCell>
                  <TableCell id="head">{t("Trx")}*</TableCell>
                  {screenFlag !== "contraEntry" && (
                    <TableCell id="head">
                      {rows[0]?.trx?.code == "4" ? "Token*" : t("Scroll")}
                    </TableCell>
                  )}
                  <TableCell id="head">{t("SDC")}*</TableCell>
                  <TableCell id="head">{t("Remarks")}*</TableCell>
                  <TableCell id="head">{t("ChequeNo")}*</TableCell>
                  <TableCell id="head">{t("ChequeDate")}*</TableCell>
                  <TableCell id="head">{t("DebitAmount")}*</TableCell>
                  {screenFlag !== "contraEntry" && (
                    <TableCell id="head">{t("CreditAmount")}*</TableCell>
                  )}
                  <TableCell id="head"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row, index) => (
                  <TableRow
                    key={"dailyTrnRow" + row?.unqID}
                    ref={index === rows.length - 1 ? lastRowRef : null}
                    onClick={(event) => handleRowAction(event, row, false)}
                    onDoubleClick={(event) => handleRowAction(event, row, true)}
                    onFocus={() => {
                      induvidualUpdate(row?.unqID, "selectedRow");
                      updateRow(row?.unqID, (row) => ({
                        ...row,
                        trxFocusFlag: false,
                      }));
                      // setSelectedRow(row?.unqID);
                    }}
                    sx={{
                      "& .MuiTextField-root": {
                        backgroundColor:
                          state?.selectedRow === row?.unqID
                            ? "var(--theme-color4) !important"
                            : "inherit !important",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <TableCell
                      style={{
                        verticalAlign: "baseline",
                        width: `2%`,
                        minWidth: "50px",
                      }}
                    >
                      <CustomTextField
                        value={row?.srNo}
                        type="text"
                        onChange={() => {}}
                        readOnly={true}
                        onBlur={() => {}}
                      />
                    </TableCell>

                    <Tooltip
                      disableInteractive={true}
                      title={
                        row?.branch?.label && (
                          <h3>{row?.branch?.info?.BRANCH_NM}</h3>
                        )
                      }
                    >
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: `${
                            screenFlag === "contraEntry" ? "9%" : "7%"
                          }`,
                          minWidth: "90px",
                        }}
                      >
                        <CustomeAutocomplete
                          value={row?.branch?.value ?? ""}
                          options={queriesResult?.[0]?.data ?? []}
                          onChange={(event: any, value: any) =>
                            handleBranchChange({
                              updUnqId: row?.unqID,
                              branchVal: value,
                            })
                          }
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={Boolean(checkLoading)}
                          onHighlightChange={(event, option, reason) =>
                            branchHighlightChange(event, option, reason)
                          }
                          popupIcon={null}
                          onBlur={() =>
                            handleBranchBlur({
                              updUnqId: row?.unqID,
                              acctNoRef: ref,
                              setLoadingState,
                            })
                          }
                          onKeyDown={(event) =>
                            branchKeyDown(event, row?.unqID, "BRANCH_CD")
                          }
                          isLoading={
                            queriesResult?.[0]?.isFetching ||
                            queriesResult?.[0]?.isLoading ||
                            loadingStates[row?.unqID]?.["BRANCHCD"]
                          }
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].BRANCH_CD = el;
                          }}
                          errorMsg={row?.bugMsgBranchCode}
                        />
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      disableInteractive={true}
                      title={
                        row?.accType?.info?.TYPE_NM && (
                          <h3>{row?.accType?.info?.TYPE_NM}</h3>
                        )
                      }
                    >
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: `${
                            screenFlag === "contraEntry" ? "9%" : "7%"
                          }`,
                          minWidth: "90px",
                        }}
                      >
                        <CustomeAutocomplete
                          value={row?.accType?.value ?? ""}
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={Boolean(checkLoading)}
                          options={queriesResult?.[1]?.data ?? []}
                          popupIcon={null}
                          autoFocus={true}
                          onChange={(e, value) =>
                            handleAccTypeChange({ updUnqId: row?.unqID, value })
                          }
                          onHighlightChange={(event, option, reason) =>
                            acctTypeHighlightChange(event, option, reason)
                          }
                          onBlur={() => handleAccTypeBlur(row?.unqID)}
                          onKeyDown={(event) =>
                            acctTypeKeyDown(event, row?.unqID, "ACCT_TYPE")
                          }
                          isLoading={
                            queriesResult?.[1]?.isFetching ||
                            queriesResult?.[1]?.isLoading ||
                            loadingStates[row?.unqID]?.["ACCTTYPE"]
                          }
                          errorMsg={row?.bugMsgAccType}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].ACC_TYPE = el;
                          }}
                        />
                      </TableCell>
                    </Tooltip>
                    <TableCell
                      style={{
                        verticalAlign: "baseline",
                        width: `${
                          screenFlag === "contraEntry" ? "12%" : "10%"
                        }`,
                        minWidth: "110px",
                      }}
                    >
                      <CustomTextField
                        value={row?.accNo}
                        type="text"
                        onChange={(event) =>
                          handleAcctNoChange({
                            updUnqId: row?.unqID,
                            value: event?.target?.value,
                          })
                        }
                        onKeyUp={(event) => onKeyUp(event, row?.unqID)}
                        onKeyDown={(event) => {
                          if (
                            Boolean(row?.branch?.value) &&
                            Boolean(row?.accType?.value)
                          ) {
                            handleShortcuts(
                              event,
                              induvidualUpdate,
                              row,
                              state
                            );
                          }
                        }}
                        readOnly={Boolean(
                          (screenFlag === "NPA_Entry" ||
                            screenFlag === "DAILY_TRN") &&
                            row?.unqID !== rows?.length - 1
                        )}
                        disabled={Boolean(checkLoading)}
                        onBlur={() => handleAccNoBlur(row?.unqID)}
                        loadingState={loadingStates[row?.unqID]?.["ACCTNO"]}
                        inputRef={(el) => {
                          if (!justInputRef?.current[row?.unqID]) {
                            justInputRef.current[row?.unqID] = {};
                          }
                          justInputRef.current[row?.unqID].ACCT_NO = el;
                        }}
                        errorMsg={row?.bugMsgAccNo}
                      />
                    </TableCell>
                    <Tooltip
                      disableInteractive={true}
                      title={
                        row?.trx?.label && (
                          <h3>{row?.trx?.info?.DESCRIPTION}</h3>
                        )
                      }
                    >
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: `${
                            screenFlag === "contraEntry" ? "9%" : "7%"
                          }`,
                          minWidth: "80px",
                        }}
                      >
                        <CustomeAutocomplete
                          value={
                            screenFlag === "contraEntry"
                              ? "6"
                              : row?.trx?.value ?? ""
                          }
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={
                            screenFlag !== "contraEntry"
                              ? Boolean(checkLoading)
                              : true
                          }
                          options={state?.trxOption ?? []}
                          onChange={(event, value) =>
                            handleTrx(event, value, row?.unqID)
                          }
                          onHighlightChange={(event, option, reason) =>
                            trxHighlightChange(event, option, reason)
                          }
                          popupIcon={null}
                          onBlur={(e) => {
                            if (Boolean(row?.acctNoFlag?.[row?.unqID]))
                              handleTrxBlur(row?.unqID, authState?.workingDate);
                          }}
                          onKeyDown={(event) =>
                            trxKeyDown(event, row?.unqID, "TRX")
                          }
                          isLoading={
                            queriesResult?.[3]?.isFetching ||
                            queriesResult?.[3]?.isLoadings ||
                            loadingStates[row?.unqID]?.["TRXVALID"]
                          }
                          errorMsg={row?.bugMsgTrx}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].TRX = el;
                          }}
                        />
                      </TableCell>
                    </Tooltip>
                    {screenFlag !== "contraEntry" && (
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: "7%",
                          minWidth: "80px",
                        }}
                      >
                        <CustomTextField
                          value={row?.scroll}
                          type="number"
                          onChange={(event) =>
                            handleScrollCtx({
                              updUnqId: row?.unqID,
                              value: event?.target?.value,
                            })
                          }
                          readOnly={
                            row?.scrollDisable === "Y" ||
                            Boolean(
                              (screenFlag === "NPA_Entry" ||
                                screenFlag === "DAILY_TRN") &&
                                row?.unqID !== rows?.length - 1
                            )
                          }
                          disabled={Boolean(checkLoading)}
                          onBlur={(event) =>
                            // handleScrollBlurCtx({ updUnqId: row?.unqID })
                            handleScrollBlur(event, row?.unqID)
                          }
                          errorMsg={row?.bugMsgScroll}
                          loadingState={loadingStates[row?.unqID]?.["TOKEN"]}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].SCROLL = el;
                          }}
                        />
                      </TableCell>
                    )}
                    <Tooltip
                      disableInteractive={true}
                      title={
                        row?.sdc?.label && (
                          <h3>{row?.sdc?.info?.DESCRIPTION}</h3>
                        )
                      }
                    >
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: `${
                            screenFlag === "contraEntry" ? "9%" : "7%"
                          }`,
                          minWidth: "80px",
                        }}
                      >
                        <CustomeAutocomplete
                          value={row?.sdc?.value ?? ""}
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={
                            Boolean(checkLoading) ||
                            Boolean(parametres?.[0]?.DIS_SDC === "Y")
                          }
                          options={queriesResult?.[2]?.data ?? []}
                          onChange={(e, value) =>
                            handleSdcCtx({
                              updUnqId: row?.unqID,
                              value,
                              parametres,
                            })
                          }
                          onHighlightChange={(event, option, reason) =>
                            sdcHighlightChange(event, option, reason)
                          }
                          popupIcon={null}
                          onBlur={(event) =>
                            handleSdcBlurCtx({ updUnqId: row?.unqID })
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Tab" && event.shiftKey) {
                              event.preventDefault();
                              const shouldFocusTrx = row?.scrollDisable === "Y";
                              const inputRefs =
                                justInputRef?.current?.[row?.unqID];
                              if (screenFlag === "contraEntry") {
                                inputRefs.ACCT_NO.focus();
                              }
                              if (shouldFocusTrx && inputRefs?.TRX) {
                                inputRefs.TRX.focus();
                              } else if (inputRefs?.SCROLL) {
                                inputRefs.SCROLL.focus();
                              }

                              return;
                            }
                            sdcKeyDown(event, row?.unqID, "SDC");
                          }}
                          isLoading={
                            queriesResult?.[2]?.isFetching ||
                            queriesResult?.[2]?.isLoading
                          }
                          errorMsg={row?.bugMsgSdc}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].SDC = el;
                          }}
                        />
                      </TableCell>
                    </Tooltip>
                    <Tooltip
                      disableInteractive={true}
                      title={
                        row?.sdc?.label && (
                          <h3>{row?.sdc?.info?.DESCRIPTION}</h3>
                        )
                      }
                    >
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: `${
                            screenFlag === "contraEntry" ? "19%" : "15%"
                          }`,
                          minWidth: "150px",
                        }}
                      >
                        <CustomTextField
                          value={row?.remark}
                          onChange={(event) =>
                            handleRemarkCtx({
                              updUnqId: row?.unqID,
                              value: event?.target?.value,
                            })
                          }
                          onBlur={() =>
                            handleRemarksBlurCtx({
                              updUnqId: row?.unqID,
                            })
                          }
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={Boolean(checkLoading)}
                          errorMsg={row?.bugMsgRemarks}
                          onKeyDown={(event) => {
                            if (event.key === "Tab" && event.shiftKey) {
                              event.preventDefault();
                              const scrollDisable = row?.scrollDisable === "Y";
                              const sdcDisable =
                                parametres?.[0]?.DIS_SDC === "Y";
                              const inputRefs =
                                justInputRef?.current?.[row?.unqID];
                              if (screenFlag === "contraEntry") {
                                if (sdcDisable) {
                                  inputRefs.ACCT_NO.focus();
                                } else {
                                  inputRefs.SDC.focus();
                                }
                              } else {
                                if (scrollDisable && sdcDisable) {
                                  inputRefs.TRX.focus();
                                } else if (sdcDisable) {
                                  inputRefs.SCROLL.focus();
                                } else {
                                  inputRefs.SDC.focus();
                                }
                              }
                              return;
                            }
                          }}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].REMARKS = el;
                          }}
                        />
                      </TableCell>
                    </Tooltip>
                    <TableCell
                      style={{
                        verticalAlign: "baseline",
                        width: `${screenFlag === "contraEntry" ? "10%" : "8%"}`,
                        minWidth: "100px",
                      }}
                    >
                      <CustomTextField
                        value={row?.cNo}
                        readOnly={Boolean(
                          (screenFlag === "NPA_Entry" ||
                            screenFlag === "DAILY_TRN") &&
                            row?.unqID !== rows?.length - 1
                        )}
                        disabled={
                          !Boolean(
                            screenFlag === "contraEntry" && row?.remark
                          ) || Boolean(checkLoading)
                            ? Boolean(row?.isCredit) ||
                              !Boolean(row?.remark) ||
                              Boolean(checkLoading)
                            : false
                        }
                        id="txtRight"
                        type="number"
                        onChange={(event) =>
                          handleCNoCtx({
                            updUnqId: row?.unqID,
                            value: event?.target?.value,
                          })
                        }
                        onBlur={(event) =>
                          handleCNoBlurCtx({
                            updUnqId: row?.unqID,
                            value: event?.target?.value,
                            mutationFn: getChqValidation,
                            setLoadingState,
                          })
                        }
                        loadingState={loadingStates[row?.unqID]?.["CHQNOVALID"]}
                        errorMsg={row?.bugMsgCNo}
                        alignment="left"
                        // inputRef={chqNoInpRef}
                        inputRef={(el) => {
                          if (!justInputRef?.current[row?.unqID]) {
                            justInputRef.current[row?.unqID] = {};
                          }
                          justInputRef.current[row?.unqID].CHQ_NO = el;
                        }}
                      />
                    </TableCell>
                    <TableCell
                      style={{
                        verticalAlign: "baseline",
                        width: `${screenFlag === "contraEntry" ? "10%" : "9%"}`,
                        minWidth: "110px",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          format={
                            Boolean(commonDateFormat)
                              ? commonDateFormat
                              : "dd/MM/yyyy"
                          }
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={
                            !Boolean(
                              screenFlag === "contraEntry" && row?.cNo
                            ) || Boolean(checkLoading)
                              ? Boolean(row?.isCredit) ||
                                !Boolean(row?.cNo) ||
                                Boolean(checkLoading)
                              : false
                          }
                          value={row?.date}
                          onChange={(event) =>
                            handleDateCtx({ updUnqId: row?.unqID, date: event })
                          }
                          slots={{ textField: TextField }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              style: {
                                backgroundColor:
                                  screenFlag === "contraEntry"
                                    ? !Boolean(row?.cNo)
                                      ? "rgb(238, 238, 238)"
                                      : "transparent"
                                    : Boolean(row?.isCredit) ||
                                      !Boolean(row?.cNo)
                                    ? "rgb(238, 238, 238)"
                                    : "transparent",
                              },
                              onBlur: (event) => {
                                //when call API on cheqNo of valida... so this API calling two(because of open msgBox in cheqNo) times so after cheqNo API make cheqNoFlag true f0r call this API
                                if (Boolean(row?.cheqNoFlag?.[row?.unqID])) {
                                  handleDateBlurCtx({
                                    updUnqId: row?.unqID,
                                    event,
                                    mutationFn: getDateValidation,
                                    setLoadingState,
                                  });
                                }
                              },
                              onFocus: (event) => {
                                handleonFocus(event);
                              },
                              inputProps: {
                                style: {
                                  height: "0.3em",
                                },
                              },
                              FormHelperTextProps: {
                                style: {
                                  display: "none",
                                },
                              },
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  "&.Mui-error": {
                                    "& fieldset": {
                                      borderColor: "inherit",
                                    },
                                  },
                                  "& fieldset": {
                                    borderColor: "gray",
                                    borderWidth: "1px",
                                  },
                                  "&:hover fieldset, &.Mui-focused fieldset": {
                                    borderColor: "#00458e",
                                    borderWidth: "1px",
                                  },
                                },
                              },
                              InputProps: {
                                endAdornment: (
                                  <Fragment>
                                    {Boolean(
                                      loadingStates[row?.unqID]?.["CHQDATE"]
                                    ) ? (
                                      <CircularProgress
                                        sx={{
                                          position: "absolute",
                                          right: "0.5rem",
                                        }}
                                        size={25}
                                        color="secondary"
                                        variant="indeterminate"
                                      />
                                    ) : null}
                                  </Fragment>
                                ),
                              },
                              variant: "outlined",
                            },
                          }}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].CHQ_DT = el;
                          }}
                        />
                      </LocalizationProvider>
                      {Boolean(row?.bugMsgDate) && (
                        <DynFormHelperText msg={row?.bugMsgDate} />
                      )}
                    </TableCell>
                    <TableCell
                      style={{
                        verticalAlign: "baseline",
                        width: `${
                          screenFlag === "contraEntry" ? "13%" : "10%"
                        }`,
                        minWidth: "140px",
                      }}
                    >
                      <CustomAmountField
                        value={row?.debit}
                        readOnly={Boolean(
                          (screenFlag === "NPA_Entry" ||
                            screenFlag === "DAILY_TRN") &&
                            row?.unqID !== rows?.length - 1
                        )}
                        disabled={
                          !Boolean(
                            screenFlag === "contraEntry" &&
                              row?.cNo &&
                              row?.date
                          ) || Boolean(checkLoading)
                            ? Boolean(row?.isCredit) ||
                              !Boolean(row?.cNo) ||
                              !Boolean(row?.date) ||
                              Boolean(state?.viewOnly) ||
                              Boolean(checkLoading)
                            : false
                        }
                        maxAmount={10000000000}
                        onChange={(event) => handleDebit(event, row?.unqID)}
                        onBlur={(event) => {
                          if (Boolean(row?.cheqDateFlag?.[row?.unqID])) {
                            handleDebitBlur(event, row?.unqID);
                          }
                        }}
                        inputRef={(el) => {
                          if (!justInputRef?.current[row?.unqID]) {
                            justInputRef.current[row?.unqID] = {};
                          }
                          justInputRef.current[row?.unqID].DBT_FLD = el;
                        }}
                        loadingState={
                          loadingStates[row?.unqID]?.["AMNTVALIDDR"]
                        }
                        errorMsg={row?.bugMsgDebit}
                        customParameter={customParameter}
                      />
                    </TableCell>
                    {screenFlag !== "contraEntry" && (
                      <TableCell
                        style={{
                          verticalAlign: "baseline",
                          width: "13%",
                          minWidth: "140px",
                        }}
                      >
                        <CustomAmountField
                          value={row?.credit}
                          readOnly={Boolean(
                            (screenFlag === "NPA_Entry" ||
                              screenFlag === "DAILY_TRN") &&
                              row?.unqID !== rows?.length - 1
                          )}
                          disabled={
                            !Boolean(row?.isCredit) ||
                            Boolean(state?.viewOnly) ||
                            !Boolean(row?.remark) ||
                            !Boolean(row?.branch?.value) ||
                            !Boolean(row?.accType?.value) ||
                            !Boolean(row?.accNo) ||
                            Boolean(checkLoading)
                          }
                          onChange={(event) => handleCredit(event, row?.unqID)}
                          maxAmount={10000000000}
                          onBlur={(event) =>
                            handleCreditBlur(event, row?.unqID)
                          }
                          loadingState={
                            loadingStates[row?.unqID]?.["AMNTVALIDCR"]
                          }
                          errorMsg={row?.bugMsgCredit}
                          customParameter={customParameter}
                          inputRef={(el) => {
                            if (!justInputRef?.current[row?.unqID]) {
                              justInputRef.current[row?.unqID] = {};
                            }
                            justInputRef.current[row?.unqID].CRDT_FLD = el;
                          }}
                        />
                      </TableCell>
                    )}
                    {(screenFlag !== "NPA_Entry" ||
                      screenFlag !== "DAILY_TRN") && (
                      <TableCell className="clearBtn">
                        {Boolean(state?.rows?.length > 1) && (
                          <CancelIcon onClick={() => removeRow(row?.unqID)} />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </fieldset>
        </TableContainer>
        <>
          <h3
            style={{
              fontSize: "small",
              padding: "7px",
              color: "#00458e",
              fontWeight: "600",
            }}
          >
            Total ( Debit:
            {formatCurrency(
              parseFloat(state?.totalDebit || "0"),
              getCurrencySymbol(dynamicAmountSymbol),
              currencyFormat,
              decimalCount
            )}
            | Credit:
            {formatCurrency(
              parseFloat(state?.totalCredit || "0"),
              getCurrencySymbol(dynamicAmountSymbol),
              currencyFormat,
              decimalCount
            )}
            )
          </h3>
        </>
      </>
    );
  }
);
export default RowsTable;
