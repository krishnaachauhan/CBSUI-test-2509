import React, { useContext, useEffect, useState } from "react";
import { ChequeBookEntryMetaData } from "./chequebookEntryMetadata";
import { AppBar, Box, Dialog, LinearProgress } from "@mui/material";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import {
  branchIsEditable,
  chequeBookCfm,
  saveChequebookData,
  validateCheqbkCfm,
  validateInsert,
} from "../api";
import { useMutation, useQuery } from "react-query";
import { Route, Routes, useLocation } from "react-router-dom";
import { MultipleChequebook } from "../multipleChequebook/multipleChequebook";
import { IssuedChequebook } from "../issuedChequebook/issuedChequebook";
import { enqueueSnackbar } from "notistack";
import {
  Alert,
  FormWrapper,
  GradientButton,
  MetaDataType,
  queryClient,
  RemarksAPIWrapper,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { getdocCD } from "components/utilFunction/function";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
import EnfinityLoader from "components/common/loader/EnfinityLoader";

export const EntryForm = (props) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isDelete, setIsDelete] = useState(false);
  const {
    reqDataRef,
    crudChequeData,
    navigate,
    myMasterRef,
    isData,
    setIsData,
    confirmData,
    closeDialog,
    result,
  } = props;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const label = utilFunction.getDynamicLabel(
    useLocation().pathname,
    authState?.menulistdata,
    true
  );
  // API calling function for validate data before Insert
  const validateInsertData: any = useMutation(
    "validateInsert",
    validateInsert,
    {
      onSuccess: (data) => {
        async function validData() {
          let insertReq = reqDataRef.current?.insertReq;
          let apiReq = {
            _isNewRow: true,
            _isDeleteRow: false,
            COMP_CD: authState?.companyID,
            BRANCH_CD: insertReq?.BRANCH_CD,
            ACCT_TYPE: insertReq?.ACCT_TYPE,
            ACCT_CD: insertReq?.ACCT_CD,
            CHEQUE_FROM: insertReq?.CHEQUE_FROM,
            CHEQUE_TOTAL: insertReq?.CHEQUE_TOTAL,
            CHARACTERISTICS: insertReq?.CHARACTERISTICS,
            PAYABLE_AT_PAR: insertReq?.PAYABLE_AT_PAR,
            REQUISITION_DT: insertReq?.REQUISITION_DT,
            REMARKS: insertReq?.REMARKS,
            SR_CD: insertReq?.SR_CD,
            NO_OF_CHQBK: insertReq?.NO_OF_CHQBK,
            AUTO_CHQBK_FLAG: insertReq?.AUTO_CHQBK_FLAG,
            SERVICE_TAX: insertReq?.SERVICE_TAX,
            AMOUNT: insertReq?.AMOUNT,
            ENTERED_BRANCH_CD: insertReq?.ENTERED_BRANCH_CD,
            REQUEST_CD: "",
          };
          // After validating data then inside the response multiple message with multiple statuses, so merge all the same status messages and conditionally display status-wise.
          if (Array.isArray(data) && data?.length > 0) {
            const btnName = async (buttonNames, msg, msgTitle, icon) => {
              return await MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                loadingBtnName: ["Yes"],
                icon: icon,
              });
            };
            let messages = { "999": [], "99": [], "9": [], "0": [] };
            let status = { "999": false, "99": false, "9": false, "0": false };

            data.forEach((item) => {
              if (messages[item.O_STATUS] !== undefined) {
                messages[item.O_STATUS].push(`⁕ ${item?.O_MESSAGE}`);
                status[item.O_STATUS] = true;
              }
            });
            let concatenatedMessages = {};
            for (let key in messages) {
              concatenatedMessages[key] = messages[key].join("\n");
            }
            if (status["999"]) {
              btnName(
                ["Ok"],
                concatenatedMessages["999"],
                "ValidationFailed",
                "ERROR"
              );
            } else if (status["99"]) {
              let buttonName = await btnName(
                ["Yes", "No"],
                concatenatedMessages["99"],
                "DoYouContinueWithRecord",
                "CONFIRM"
              );

              if (buttonName === "Yes" && status["9"]) {
                btnName(
                  ["Ok"],
                  concatenatedMessages["9"],
                  "ValidationAlert",
                  "WARNING"
                );
              } else if (
                buttonName === "Yes" &&
                data?.[0]?.RESTRICT_WINDOW === "N"
              ) {
                crudChequeData.mutate(apiReq);
              } else if (
                buttonName === "Yes" &&
                data?.[0]?.RESTRICT_WINDOW === "Y"
              ) {
                navigate("issuedChequebook/", {
                  state: {
                    ...apiReq,
                    CHEQUE_TO: insertReq?.CHEQUE_TO,
                    COMP_CD: authState?.companyID,
                  },
                });
                CloseMessageBox();
              } else if (buttonName === "Yes") {
                crudChequeData.mutate(apiReq);
              }
            } else if (status["9"]) {
              btnName(
                ["Ok"],
                concatenatedMessages["9"],
                "ValidationAlert",
                "WARNING"
              );
            } else if (status["0"]) {
              if (data?.[0]?.RESTRICT_WINDOW === "Y") {
                navigate("issuedChequebook/", {
                  state: {
                    ...apiReq,
                    CHEQUE_TO: insertReq?.CHEQUE_TO,
                    COMP_CD: authState?.companyID,
                  },
                });
                CloseMessageBox();
              } else if (data?.[0]?.RESTRICT_WINDOW === "N") {
                let buttonName = await btnName(
                  ["Yes", "No"],
                  "AreYouSureToProceed",
                  "confirmation",
                  "CONFIRM"
                );
                if (buttonName === "Yes") {
                  crudChequeData.mutate(apiReq);
                }
              }
            }
          }
        }
        validData();
      },
      onError() {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );
  // API calling function for validate data before confirm or reject
  const chequeBkValidateCfm: any = useMutation(
    "validateCheqbkCfm",
    validateCheqbkCfm
  );

  // API calling function for data confirm od reject
  const chequeBkCfm: any = useMutation("chequeBookCfm", chequeBookCfm, {
    onError: () => {
      CloseMessageBox();
    },
    onSuccess: (data, variables) => {
      CloseMessageBox();
      closeDialog();

      const resultData = {
        screenFlag: "chequebookCFM",
        COMP_CD: authState?.companyID,
        BRANCH_CD: confirmData?.BRANCH_CD,
        FROM_DATE: result?.variables?.FROM_DATE ?? authState.workingDate,
        TO_DATE: result?.variables?.TO_DATE ?? authState.workingDate,
        FLAG: variables?.FLAG ?? "",
      };

      if (data?.[0]?.STATUS === "999") {
        MessageBox({
          messageTitle: "InvalidConfirmation",
          message: data?.message || data?.[0]?.MESSAGE,
          icon: "ERROR",
        });
      } else {
        result.mutate(resultData);
        enqueueSnackbar(
          t(
            variables?.IS_CONFIMED ? "DataConfirmMessage" : "DataRejectMessage"
          ),
          { variant: "success" }
        );
      }
    },
  });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["GETCHEQUEBOOKPARA"],
    () =>
      branchIsEditable({
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
      }),
    {
      enabled: Boolean(confirmData?.FLAG !== "C"),
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["chequeBookCfm"]);
    };
  }, []);

  const chequeBkDeleteData: any = useMutation(
    "saveChequebookData",
    saveChequebookData,
    {
      onSuccess: (data, variables) => {
        setIsDelete(false);
        navigate(".");
        result.mutate({
          screenFlag: "chequebookCFM",
          COMP_CD: authState?.companyID,
          BRANCH_CD: confirmData?.BRANCH_CD,
          FROM_DATE: result?.variables?.FROM_DATE ?? authState.workingDate,
          TO_DATE: result?.variables?.TO_DATE ?? authState.workingDate,
          FLAG: confirmData?.REQ_FLAG ?? "",
        });
        enqueueSnackbar(t("deleteSuccessfully"), { variant: "success" });
      },
      onError: () => {
        setIsDelete(false);
      },
    }
  );
  const { trackDialogClass } = useDialogContext();
  // common function for calling the API of confirmation
  const onSubmitHandler: SubmitFnType = (data: any, displayData, endSubmit) => {
    // @ts-ignore
    endSubmit(true);
    let reqPara = {
      ...data,
      COMP_CD: authState?.companyID,
      NO_OF_CHQBK: data?.NO_OF_CHQBK ?? "1",
      CHEQUE_TOTAL: data?.CHEQUE_TOTAL ?? data?.CHEQUE_TOTALS,
      CHARACTERISTICS: data?.CHARACTERISTICS ?? "B",
      PAYABLE_AT_PAR: data?.PAYABLE_AT_PAR ?? "Y",
    };
    reqDataRef.current.insertReq = reqPara;

    if (Number(reqPara.NO_OF_CHQBK) > 1 && reqPara?.CHEQUE_TO) {
      navigate("multiChequebook/", {
        state: reqPara,
      });
      trackDialogClass("multiChequebook");
    } else {
      validateInsertData.mutate({
        COMP_CD: authState?.companyID,
        BRANCH_CD: reqPara?.BRANCH_CD,
        ACCT_TYPE: reqPara?.ACCT_TYPE,
        ACCT_CD: reqPara?.ACCT_CD,
        AMOUNT: reqPara?.AMOUNT,
        SERVICE_TAX: reqPara?.SERVICE_TAX,
        CHEQUE_FROM: reqPara?.CHEQUE_FROM,
        CHEQUE_TO: reqPara?.CHEQUE_TO,
        AUTO_CHQBK_FLAG: reqPara?.AUTO_CHQBK_FLAG,
        SR_CD: reqPara?.SR_CD,
        STATUS: reqPara?.STATUS,
        SCREEN_REF: docCD,
      });
    }
  };

  const handelChange = async (isConfirm) => {
    chequeBkValidateCfm.mutate(
      {
        AUTO_CHQBK_FLAG: confirmData?.AUTO_CHQBK_FLAG,
        AUTO_CHQBK_PRINT_FLAG: confirmData?.AUTO_CHQBK_PRINT_FLAG,
        FLAG: confirmData?.REQ_FLAG,
        SCREEN_REF: docCD,
      },
      {
        onSuccess: async (data) => {
          const messagebox = async (msgTitle, msg, buttonNames, icon) => {
            let buttonName = await MessageBox({
              messageTitle: msgTitle,
              message: msg,
              buttonNames: buttonNames,
              icon: icon,
            });
            return buttonName;
          };
          let apiReq = {
            IS_CONFIMED: isConfirm === "C" ? true : false,
            FLAG: confirmData?.REQ_FLAG,
            COMP_CD: authState?.companyID,
            BRANCH_CD: confirmData?.BRANCH_CD,
            TRAN_CD: confirmData?.TRAN_CD,
            AUTO_CHQBK_PRINT_FLAG: confirmData?.AUTO_CHQBK_PRINT_FLAG,
            LAST_ENTERED_BY: confirmData?.LAST_ENTERED_BY,
            AUTO_CHQBK_FLAG: confirmData?.AUTO_CHQBK_FLAG,
          };
          if (data?.length) {
            for (let i = 0; i < data?.length; i++) {
              if (data[i]?.O_STATUS !== "0") {
                let btnName = await messagebox(
                  data[i]?.O_MSG_TITLE
                    ? data[i]?.O_MSG_TITLE
                    : data[i]?.O_STATUS === "999"
                    ? "ValidationFailed"
                    : data[i]?.O_STATUS === "99"
                    ? "confirmation"
                    : "ALert",
                  data[i]?.O_MESSAGE,
                  data[i]?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                  data[i]?.O_STATUS === "999"
                    ? "ERROR"
                    : data[i]?.O_STATUS === "99"
                    ? "CONFIRM"
                    : "WARNING"
                );
                if (btnName === "No" || data[i]?.O_STATUS === "999") {
                  return;
                }
              } else {
                if (isConfirm === "C" && data[i]?.O_STATUS === "0") {
                  let res = await MessageBox({
                    messageTitle: t("confirmation"),
                    message: t("AreYouSureToConfirm"),
                    buttonNames: ["Yes", "No"],
                    defFocusBtnName: "Yes",
                    loadingBtnName: ["Yes"],
                    icon: "WARNING",
                  });
                  if (res === "Yes") {
                    chequeBkCfm.mutate(apiReq);
                  }
                } else if (isConfirm === "R" && data[i]?.O_STATUS === "0") {
                  setIsDelete(true);
                }
              }
            }
          }
        },
      }
    );
  };

  return (
    <>
      {validateInsertData?.isLoading || chequeBkValidateCfm.isLoading ? (
        <LinearProgress color="inherit" />
      ) : isError ||
        validateInsertData?.isError ||
        chequeBkCfm.isError ||
        chequeBkValidateCfm.isError ||
        chequeBkDeleteData?.isError ? (
        <AppBar position="relative" color="primary">
          <Alert
            severity="error"
            errorMsg={
              error?.error_msg ??
              validateInsertData?.error?.error_msg ??
              chequeBkValidateCfm?.error?.error_msg ??
              chequeBkCfm?.error?.error_msg ??
              chequeBkDeleteData?.error?.error_msg ??
              "Unknow Error"
            }
            errorDetail={
              error?.error_detail ??
              validateInsertData?.error?.error_detail ??
              chequeBkValidateCfm?.error?.error_detail ??
              chequeBkCfm?.error?.error_detail ??
              chequeBkDeleteData?.error?.error_detail ??
              ""
            }
            color="error"
          />
        </AppBar>
      ) : (
        <LinearProgressBarSpacer />
      )}
      <Box sx={{ position: "relative" }}>
        {isLoading ? (
          <Box sx={{ height: "50vh" }}>
            <EnfinityLoader loading={isLoading} />
          </Box>
        ) : (
          <FormWrapper
            key={"chequebooksEntry"}
            metaData={ChequeBookEntryMetaData as MetaDataType}
            initialValues={confirmData?.FLAG === "C" ? confirmData : {}}
            subHeaderLabel={label}
            subHeaderLabelStyle={{ paddingLeft: "0px !important" }}
            displayMode={confirmData?.FLAG === "C" ? "view" : null}
            formStyle={{}}
            onSubmitHandler={onSubmitHandler}
            ref={myMasterRef}
            formState={{
              MessageBox: MessageBox,
              workingDate: authState?.workingDate,
              isEditableBranch: data,
              docCD: docCD,
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "ACCT_TYPE",
                  BRANCH_CD: "BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            setDataOnFieldChange={(action, payload) => {
              if (action === "DTL_TAB") {
                setIsData((old) => ({ ...old, isVisible: payload.DTL_TAB }));
              }
              if (action === "NO_OF_CHQBK") {
                myMasterRef?.current?.handleSubmit(
                  { preventDefault: () => {} },
                  "Save"
                );
              }
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {confirmData?.FLAG === "C" ? (
                  <>
                    {confirmData?.CONFIRMED !== "N" && (
                      <>
                        <GradientButton
                          color="primary"
                          onClick={() => handelChange("C")}
                        >
                          {t("Confirm")}
                        </GradientButton>
                        <GradientButton
                          color="primary"
                          onClick={() => handelChange("R")}
                        >
                          {t("Reject")}
                        </GradientButton>
                      </>
                    )}
                    <GradientButton color="primary" onClick={closeDialog}>
                      {t("Close")}
                    </GradientButton>
                  </>
                ) : (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting || !isData?.isVisible}
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                )}
              </>
            )}
          </FormWrapper>
        )}
      </Box>
      {isDelete && (
        <RemarksAPIWrapper
          TitleText={"RemovalRemarksChequebookCfm"}
          label={"RemovalRemarks"}
          onActionNo={() => setIsDelete(false)}
          onActionYes={(val, rows) => {
            let deleteReqPara = {
              _isNewRow: false,
              _isDeleteRow: true,
              BRANCH_CD: rows.BRANCH_CD,
              COMP_CD: rows.COMP_CD,
              TRAN_CD: rows.TRAN_CD,
              ENTERED_COMP_CD: rows.ENTERED_COMP_CD,
              ENTERED_BRANCH_CD: rows.ENTERED_BRANCH_CD,
              ACCT_TYPE: rows.ACCT_TYPE,
              ACCT_CD: rows.ACCT_CD,
              ACTIVITY_TYPE: "CHEQUE BOOK CONFIRMATION",
              TRAN_DT: rows.TRAN_DT,
              CONFIRMED: rows.CONFIRMED,
              USER_DEF_REMARKS: val
                ? val
                : "WRONG ENTRY FROM CHEQUE BOOK CONFIRMATION (TRN/371)",
              ENTERED_BY: rows.ENTERED_BY,
              AMOUNT: rows.AMOUNT,
            };
            chequeBkDeleteData.mutate(deleteReqPara);
          }}
          isLoading={chequeBkDeleteData?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isDelete}
          rows={confirmData}
          defaultValue={"WRONG ENTRY FROM CHEQUE BOOK CONFIRMATION (TRN/371)"}
        />
      )}

      <Routes>
        <Route
          path="multiChequebook/*"
          element={
            <MultipleChequebook
              navigate={navigate}
              validateInsertData={validateInsertData}
            />
          }
        />
        <Route
          path="issuedChequebook/*"
          element={<IssuedChequebook navigate={navigate} />}
        />
      </Routes>
    </>
  );
};

export const ChequebookCfmForm = ({ closeDialog, result, navigate }) => {
  const { state: rows }: any = useLocation();
  const { trackDialogClass } = useDialogContext();

  useEffect(() => {
    trackDialogClass("form");
    return () => {
      trackDialogClass("main");
    };
  });

  return (
    <Dialog
      open={true}
      fullWidth={true}
      className="form"
      PaperProps={{
        style: {
          maxWidth: "1300px",
        },
      }}
    >
      <>
        <EntryForm
          confirmData={{ ...rows?.[0]?.data, FLAG: "C" }}
          closeDialog={closeDialog}
          result={result}
          navigate={navigate}
        />
      </>
    </Dialog>
  );
};
