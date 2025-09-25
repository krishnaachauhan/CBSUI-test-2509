import {
  AppBar,
  Box,
  Container,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
} from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StopPayEntryMetadata } from "./stopPayEntryMetadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { StopPayGridMetaData } from "./stopPayGridMetadata";
import { ReleaseCheque } from "./releaseCheque/releaseCheque";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  ClearCacheProvider,
  RemarksAPIWrapper,
  FormWrapper,
  MetaDataType,
  utilFunction,
  GradientButton,
} from "@acuteinfo/common-base";
import { StoppedChequeData } from "./stopped-cheque/stoppedCheque";
import { PrintDeatil } from "./print";
import { getdocCD } from "components/utilFunction/function";
import { useStyles } from "../style";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
const StopPaymentEntryCustom = () => {
  const [isData, setIsData] = useState({
    isDelete: false,
    isVisible: false,
    value: "tab1",
    closeAlert: true,
  });
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const myMasterRef = useRef<any>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const reqDataRef = useRef<any>({});
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const style = useStyles();
  const releaseActions: ActionTypes[] = [
    {
      actionName: "release-Cheque",
      actionLabel: `${t("ViewDetail")} / ${t("ReleaseCheque")}`,
      multiple: false,
      rowDoubleClick: true,
    },
  ];

  const getStopPayDetail: any = useMutation(
    "stopPayDetail",
    API.stopPayDetail,
    {
      onError: () => {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const validateInsertData: any = useMutation(
    "validateInsert",
    API.validateInsert,
    {
      onError: (error: any) => {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const crudStopPay: any = useMutation("crudStopPayment", API.crudStopPayment, {
    onSuccess: (data, variables) => {
      if (variables?._isDeleteRow) {
        setIsData((old) => ({ ...old, isDelete: false }));
        getStopPayDetail.mutate({
          COMP_CD: authState?.companyID,
          ACCT_CD: variables?.ACCT_CD,
          ACCT_TYPE: variables?.ACCT_TYPE,
          BRANCH_CD: variables?.BRANCH_CD,
          GD_TODAY: authState?.workingDate,
          USER_LEVEL: authState?.role,
        });
        enqueueSnackbar(t("deleteSuccessfully"), { variant: "success" });
      } else if (variables?._isNewRow) {
        CloseMessageBox();
        myMasterRef?.current?.handleFormReset({ preventDefault: () => {} });
        enqueueSnackbar(t("insertSuccessfully"), { variant: "success" });
        setIsData((old) => ({ ...old, isVisible: false }));
      }
    },
    onError: () => {
      setIsData((old) => ({ ...old, isDelete: false, closeAlert: true }));
      CloseMessageBox();
    },
  });

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.rows?.[0]?.data?.ALLOW_RELEASE === "Y") {
        let res = await MessageBox({
          messageTitle: "confirmation",
          message: "AreYouSureToRelease",
          buttonNames: ["Yes", "No"],
        });
        if (res === "Yes") {
          navigate(data?.name, {
            state: data?.rows,
          });
        }
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["stopPayDetail"]);
      queryClient.removeQueries(["validateInsert"]);
      queryClient.removeQueries(["crudStopPayment"]);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        myMasterRef?.current?.handleSubmit(
          { preventDefault: () => {} },
          "Save"
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onSubmitHandler = async (data: any, displayData, endSubmit) => {
    let insertReq = {
      ...data,
      CHEQUE_DATE: await GeneralAPI.getDateWithCurrentTime(data?.CHEQUE_DT),
      TRAN_DT: data?.TRAN_DT || data?.SURR_DT,
      _isNewRow: true,
    };
    validateInsertData.mutate(
      {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        CHQ_FRM: data?.CHEQUE_FROM ?? "",
        CHQ_TO: data?.CHEQUE_TO ?? "",
        RELEASE_DATE: "",
        SCREEN_REF: docCD ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
      },
      {
        onSuccess: (respdata) => {
          async function insertData() {
            if (respdata?.[0]?.O_STATUS !== "0") {
              MessageBox({
                messageTitle: "ValidationAlert",
                message: respdata?.[0]?.O_MESSAGE,
                defFocusBtnName: "Ok",
              });
            } else {
              let res = await MessageBox({
                messageTitle: "confirmation",
                message:
                  data?.FLAG === "P"
                    ? "InsertStopPaymentMsg"
                    : data?.FLAG === "S"
                    ? "InsertStopPaymentMsg2"
                    : data?.FLAG === "D"
                    ? "InsertStopPaymentMsg3"
                    : "",
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                loadingBtnName: ["Yes"],
              });
              if (res === "Yes") {
                crudStopPay.mutate(insertReq);
              }
            }
          }
          insertData();
        },
      }
    );

    //@ts-ignore
    endSubmit(true);
  };
  const [dataClass, setDataClass] = useState("");
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);
  return (
    <>
      <Container
        className="main"
        maxWidth={false}
        sx={{ px: "8px !important" }}
      >
        <Tabs
          className={style.tabStyle}
          value={isData.value}
          onChange={(event, newValue) => {
            setIsData((old) => ({
              ...old,
              value: newValue,
              closeAlert: false,
            }));
            getStopPayDetail.data = [];
            if (newValue === "tab2") {
              myMasterRef?.current?.getFieldData().then((res) => {
                if (res?.ACCT_CD && res?.ACCT_TYPE && res?.BRANCH_CD) {
                  StopPayGridMetaData.gridConfig.subGridLabel = `\u00A0\u00A0 ${(
                    authState?.companyID +
                    "-" +
                    res?.BRANCH_CD +
                    "-" +
                    res?.ACCT_TYPE +
                    "-" +
                    res?.ACCT_CD
                  ).replace(/\s/g, "")} -  ${res?.ACCT_NM}`;

                  const RequestPara = {
                    COMP_CD: authState?.companyID,
                    ACCT_CD: res?.ACCT_CD,
                    ACCT_TYPE: res?.ACCT_TYPE,
                    BRANCH_CD: res?.BRANCH_CD,
                    ENTERED_DATE: authState?.workingDate,
                    GD_TODAY: authState?.workingDate,
                    USER_LEVEL: authState?.role,
                  };
                  getStopPayDetail.mutate(RequestPara);
                }
              });
            }
          }}
          aria-label="secondary tabs example"
        >
          <Tab tabIndex={0} value="tab1" label={t("ChequeStopEntry")} />
          {isData.isVisible && (
            <Tab tabIndex={0} value="tab2" label={t("ChequeStopDetail")} />
          )}
        </Tabs>
      </Container>

      <Container maxWidth={false} sx={{ px: "8px !important" }}>
        <Grid
          sx={{
            backgroundColor: "var(--theme-color2)",
            padding: "0px",
            borderRadius: "10px",
            boxShadow:
              "rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;",
          }}
        >
          {validateInsertData.isLoading ? (
            <LinearProgress color="secondary" />
          ) : (crudStopPay?.isError && isData.closeAlert) ||
            (validateInsertData?.isError && isData.closeAlert) ||
            (getStopPayDetail?.isError && isData.closeAlert) ? (
            <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={
                    crudStopPay?.error?.error_msg ??
                    validateInsertData?.error?.error_msg ??
                    getStopPayDetail?.error?.error_msg ??
                    "Unknow Error"
                  }
                  errorDetail={
                    crudStopPay?.error?.error_detail ??
                    validateInsertData?.error?.error_detail ??
                    getStopPayDetail?.error?.error_detail ??
                    ""
                  }
                  color="error"
                />
              </AppBar>
            </div>
          ) : (
            <LinearProgressBarSpacer />
          )}
          <div
            className={`${isData?.value === "tab1" ? "main" : ""}`}
            style={{
              display: isData.value === "tab1" ? "inherit" : "none",
            }}
          >
            <FormWrapper
              key={"stopPayEntry"}
              metaData={StopPayEntryMetadata as MetaDataType}
              onSubmitHandler={onSubmitHandler}
              subHeaderLabel={utilFunction.getDynamicLabel(
                useLocation().pathname,
                authState?.menulistdata,
                true
              )}
              subHeaderLabelStyle={{ paddingLeft: "0px !important" }}
              formState={{
                MessageBox: MessageBox,
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
                if (action === "IS_VISIBLE") {
                  setIsData((old) => ({
                    ...old,
                    isVisible: payload.IS_VISIBLE,
                  }));
                }
                if (action === "STOPPED_CHEQUE") {
                  navigate("stopped-Cheque", {
                    state: {
                      ...payload,
                      COMP_CD: authState?.companyID,
                    },
                  });
                }
              }}
              ref={myMasterRef}
              formStyle={{}}
            >
              {({ isSubmitting, handleSubmit }) => (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting || !isData?.isVisible}
                    //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                </>
              )}
            </FormWrapper>
          </div>
          <div
            className={`${isData?.value === "tab2" ? "main" : ""}`}
            style={{
              display: isData.value === "tab2" ? "inherit" : "none",
            }}
          >
            <GridWrapper
              key={`stopPayGridData` + getStopPayDetail.isLoading}
              finalMetaData={StopPayGridMetaData as GridMetaDataType}
              data={getStopPayDetail.data ?? []}
              setData={() => {}}
              loading={getStopPayDetail.isLoading}
              actions={releaseActions}
              setAction={setCurrentAction}
              onClickActionEvent={(index, id, data) => {
                if (id === "ALLOW_DELETE") {
                  reqDataRef.current.deleteReq = data;
                  setIsData((old) => ({ ...old, isDelete: true }));
                } else if (id === "PRINT") {
                  navigate("print");
                }
              }}
            />
            <Routes>
              <Route
                path="release-Cheque/*"
                element={
                  <ReleaseCheque
                    navigate={navigate}
                    getStopPayDetail={getStopPayDetail}
                  />
                }
              />
              <Route
                path="stopped-Cheque/*"
                element={<StoppedChequeData navigate={navigate} />}
              />
              <Route
                path="print/*"
                element={<PrintDeatil navigate={navigate} />}
              />
            </Routes>
          </div>
        </Grid>
      </Container>

      {isData.isDelete && (
        <RemarksAPIWrapper
          TitleText={t("StopDeleteTitle", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          label="RemovalRemarks"
          onActionNo={() => setIsData((old) => ({ ...old, isDelete: false }))}
          onActionYes={(val, rows) => {
            let deleteReqPara = {
              _isNewRow: false,
              _isDeleteRow: true,
              BRANCH_CD: rows.BRANCH_CD,
              TRAN_CD: rows.TRAN_CD,
              ACCT_TYPE: rows.ACCT_TYPE,
              ACCT_CD: rows.ACCT_CD,
              TRAN_AMOUNT: rows.CHEQUE_AMOUNT,
              TRAN_DT: rows.TRAN_DT,
              CONFIRMED: rows.CONFIRMED,
              USER_DEF_REMARKS: val
                ? val
                : t("WrongStopPayment", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  }),

              ACTIVITY_TYPE: "STOP PAYMENT ENTRY SCREEN",
              ENTERED_BY: rows.ENTERED_BY,
            };
            crudStopPay.mutate(deleteReqPara);
          }}
          isLoading={crudStopPay?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isData.isDelete}
          rows={reqDataRef?.current?.deleteReq}
          defaultValue={t("WrongStopPayment", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </>
  );
};

export const StopPaymentEntry = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <StopPaymentEntryCustom />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
