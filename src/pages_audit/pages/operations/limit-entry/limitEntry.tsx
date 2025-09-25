import {
  AppBar,
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
import { limitEntryGridMetaData } from "./limtEntryGridMetadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  limitEntryDynamicMetaData,
  limitEntryMetaData,
} from "./limitEntryMetadata";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { ForceExpire } from "./forceExpire/forceExpire";
import { useMutation } from "react-query";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import * as API from "./api";
import { FdDetails } from "./fdDetail/fdDetails";
import { NscDetails } from "./nscDetail/nscDetails";
import { useTranslation } from "react-i18next";
import { SecurityDetailForm } from "./securityDetail/securityDetail";

import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  ClearCacheProvider,
  RemarksAPIWrapper,
  MetaDataType,
  FormWrapper,
  utilFunction,
  GradientButton,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useStyles } from "../style";
import { format, isEqual, startOfDay } from "date-fns";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
const LimitEntryCustom = () => {
  const actions: ActionTypes[] = [
    {
      actionName: "forceExpire",
      actionLabel: "",
      multiple: false,
      rowDoubleClick: true,
      isNodataThenShow: true,
    },

    {
      actionName: "forceExpire",
      actionLabel: "ForceExpire",
      multiple: false,
      rowDoubleClick: false,
      shouldExclude: (data) => {
        if (data?.[0]?.data?.ALLOW_FORCE_EXP === "Y") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      actionName: "forceExpire",
      actionLabel: "ViewDetail",
      multiple: false,
      rowDoubleClick: false,
      shouldExclude: (data) => {
        if (data?.[0]?.data?.ALLOW_FORCE_EXP !== "Y") {
          return false;
        } else {
          return true;
        }
      },
    },
  ];

  const [isData, setIsData] = useState<any>({
    isDelete: false,
    isVisible: false,
    value: "tab1",
    newFormMTdata: limitEntryDynamicMetaData,
    closeAlert: true,
    formRefresh: 0,
    gridRefresh: 0,
    firstFormhasError: true,
    secondFormhasError: true,
  });
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myMasterRef = useRef<any>(null);
  const myRef = useRef<any>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const reqDataRef = useRef<any>({});
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const style = useStyles();
  const securityLimitData: any = useMutation(
    "securityLimitData",
    API.fieldData,
    {
      onSuccess: (data) => {
        if (data.length > 0) {
          let newData = { ...limitEntryDynamicMetaData, fields: data };
          setIsData((old) => ({
            ...old,
            newFormMTdata: newData,
            formRefresh: old.formRefresh + 1,
          }));
        }
      },
      onError() {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const getLimitDetail: any = useMutation(
    "getLimitDnewFormMTdataTL",
    API.getLimitDTL,
    {
      onError() {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const validateInsertData: any = useMutation(
    "validateInsert",
    API.validateInsert,
    {
      onSuccess: (data, variables) => {
        async function validData() {
          let apiReq = {
            ...variables,
            _isNewRow: true,
          };
          if (Array.isArray(data) && data?.length > 0) {
            const btnName = async (buttonNames, msg, msgTitle, icon) => {
              return await MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
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
                "confirmation",
                "CONFIRM"
              );
              if (buttonName === "Yes" && status["9"]) {
                btnName(["Ok"], concatenatedMessages["9"], "Alert", "WARNING");
              } else if (buttonName === "Yes") {
                crudLimitData.mutate(apiReq);
              }
            } else if (status["9"]) {
              btnName(["Ok"], concatenatedMessages["9"], "Alert", "WARNING");
            } else if (status["0"]) {
              let buttonName = await btnName(
                ["Yes", "No"],
                "AreYouSureToProceed",
                "confirmation",
                "CONFIRM"
              );
              if (buttonName === "Yes") {
                crudLimitData.mutate(apiReq);
              }
            }
          }
        }
        validData();
        setIsData((old) => ({
          ...old,
          firstFormhasError: true,
          secondFormhasError: true,
        }));
      },
      onError() {
        setIsData((old) => ({
          ...old,
          closeAlert: true,
          firstFormhasError: true,
          secondFormhasError: true,
        }));
      },
    }
  );

  const validateDeleteData: any = useMutation(
    "validateDelete",
    API.validateDelete,
    {
      onSuccess: async (data, variables) => {
        if (data?.[0]?.O_STATUS === "999" && data?.[0]?.O_RESTRICT) {
          MessageBox({
            messageTitle: "InvalidDeleteOperation",
            message: data?.[0]?.O_RESTRICT,
          });
        } else if (data?.[0]?.O_STATUS === "0") {
          reqDataRef.current.deleteReq = variables;
          trackDialogClass("remarks__wrapper__base");
          setIsData((old) => {
            return { ...old, isDelete: true };
          });
        }
      },
      onError() {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const crudLimitData: any = useMutation(
    "crudLimitEntryData",
    API.crudLimitEntryData,
    {
      onSuccess: (data, variables) => {
        if (variables?._isDeleteRow) {
          setIsData((old) => ({ ...old, isDelete: false }));
          getLimitDetail.mutate({
            COMP_CD: authState?.companyID,
            ACCT_CD: variables?.ACCT_CD,
            ACCT_TYPE: variables?.ACCT_TYPE,
            BRANCH_CD: variables?.BRANCH_CD,
            GD_TODAY_DT: authState?.workingDate,
            USER_LEVEL: authState?.role,
          });
          enqueueSnackbar(t("deleteSuccessfully"), { variant: "success" });
        } else if (variables?._isNewRow) {
          setIsData((old) => ({
            ...old,
            isVisible: false,
            newFormMTdata: limitEntryDynamicMetaData,
            formRefresh: old.formRefresh + 1,
          }));
          myMasterRef?.current?.handleFormReset({ preventDefault: () => {} });
          CloseMessageBox();
          enqueueSnackbar(t("insertSuccessfully"), { variant: "success" });
        }
      },
      onError() {
        setIsData((old) => ({ ...old, isDelete: false, closeAlert: true }));
      },
    }
  );
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();

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
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getLimitDTL"]);
      queryClient.removeQueries(["getLimitList"]);
      queryClient.removeQueries(["securityLimitData"]);
      queryClient.removeQueries(["crudLimitEntryData"]);
      queryClient.removeQueries(["validateInsert"]);
      queryClient.removeQueries(["validateDelete"]);
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

  useEffect(() => {
    if (!isData?.secondFormhasError && !isData?.firstFormhasError) {
      async function onSub() {
        const formData = await myMasterRef?.current?.getFieldData();
        const dynFormData = await myRef?.current?.getFieldData();
        let apiReq = {
          ...formData,
          ...dynFormData,
          ...reqDataRef.current.securityDetails,
        };
        validateInsertData.mutate({
          ...apiReq,
          COMP_CD: authState?.companyID ?? "",
          TRAN_DT: apiReq?.TRAN_DT
            ? format(new Date(apiReq?.TRAN_DT), "dd/MMM/yyyy")
            : "",
          EXPIRY_DT: apiReq.EXPIRY_DT
            ? format(new Date(apiReq.EXPIRY_DT), "dd/MMM/yyyy")
            : "",
          FORCE_EXP_DT: apiReq?.FORCE_EXP_DT
            ? format(new Date(apiReq?.FORCE_EXP_DT), "dd/MMM/yyyy")
            : "",
          WORKING_DATE: authState?.workingDate ?? "",
          SANC_LIMIT: apiReq?.SANCTIONED_AMT ?? "",
          FD_BRANCH: apiReq.FD_BRANCH_CD ?? "",
          FD_AC_TYP: apiReq.FD_TYPE ?? "",
          FD_AC_NO: apiReq.FD_ACCT_CD ?? "",
        });
      }
      onSub();
    }
  }, [isData?.secondFormhasError, isData?.firstFormhasError]);

  const setCurrentAction = useCallback(
    async (data) => {
      const areTimesEqual = isEqual(
        startOfDay(new Date(authState?.workingDate)) ?? "",
        startOfDay(new Date(data?.rows?.[0]?.data?.ENTERED_DATE)) ?? ""
      );
      // if (data?.name === "forceExpire") {
      //   navigate(data?.name, {
      //     state: data?.rows,
      //   });
      // } else
      if (data?.name === "close") {
        getLimitDetail.data = [];
      } else if (data?.name === "forceExpire" && areTimesEqual) {
        MessageBox({
          messageTitle: "ValidationFailed",
          message: "SamedayForceExpirenotallowed",
          icon: "ERROR",
        });
      } else if (data?.name === "forceExpire") {
        trackDialogClass("LimitDetail");
        if (data?.rows?.[0]?.data?.ALLOW_FORCE_EXP === "Y") {
          let res = await MessageBox({
            messageTitle: "confirmation",
            message: "AreYouSureForceExpLimit",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
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
      }
    },
    [navigate]
  );

  return (
    <>
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
              getLimitDetail.data = [];
              if (newValue === "tab2") {
                myMasterRef?.current?.getFieldData().then((res) => {
                  if (res?.ACCT_CD && res?.ACCT_TYPE && res?.BRANCH_CD) {
                    limitEntryGridMetaData.gridConfig.subGridLabel = `\u00A0 ${(
                      authState?.companyID +
                      "-" +
                      res?.BRANCH_CD +
                      "-" +
                      res?.ACCT_TYPE +
                      "-" +
                      res?.ACCT_CD
                    ).replace(/\s/g, "")} —  ${res?.ACCT_NM}`;

                    const limitDTLRequestPara = {
                      COMP_CD: authState?.companyID,
                      ACCT_CD: res?.ACCT_CD,
                      ACCT_TYPE: res?.ACCT_TYPE,
                      BRANCH_CD: res?.BRANCH_CD,
                      GD_TODAY_DT: authState?.workingDate,
                      USER_LEVEL: authState?.role,
                    };

                    getLimitDetail.mutate(limitDTLRequestPara);
                  }
                });
              }
            }}
            aria-label="secondary tabs example"
          >
            <Tab tabIndex={0} value="tab1" label={t("LimitEntry")} />
            {isData.isVisible && (
              <Tab tabIndex={0} value="tab2" label={t("LimitDetail")} />
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
            {securityLimitData.isLoading ||
            validateInsertData?.isLoading ||
            crudLimitData?.isLoading ||
            validateDeleteData.isLoading ? (
              <LinearProgress color="secondary" />
            ) : (securityLimitData?.isError && isData.closeAlert) ||
              (validateInsertData?.isError && isData.closeAlert) ||
              (crudLimitData?.isError && isData.closeAlert) ||
              (getLimitDetail?.isError && isData.closeAlert) ||
              (validateDeleteData?.isError && isData.closeAlert) ? (
              <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
                <AppBar position="relative" color="primary">
                  <Alert
                    severity="error"
                    errorMsg={
                      securityLimitData?.error?.error_msg ??
                      validateInsertData?.error?.error_msg ??
                      crudLimitData?.error?.error_msg ??
                      getLimitDetail?.error?.error_msg ??
                      validateDeleteData?.error?.error_msg ??
                      "Unknow Error"
                    }
                    errorDetail={
                      securityLimitData?.error?.error_detail ??
                      validateInsertData?.error?.error_detail ??
                      crudLimitData?.error?.error_detail ??
                      getLimitDetail?.error?.error_detail ??
                      validateDeleteData?.error?.error_detail ??
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
                key={"limitEntryForm"}
                metaData={limitEntryMetaData as MetaDataType}
                initialValues={{}}
                // onSubmitHandler={onSubmit}
                subHeaderLabel={utilFunction.getDynamicLabel(
                  useLocation().pathname,
                  authState?.menulistdata,
                  true
                )}
                subHeaderLabelStyle={{ paddingLeft: "0px !important" }}
                onSubmitHandler={(
                  data: any,
                  displayData,
                  endSubmit,
                  _,
                  __,
                  hasError
                ) => {
                  //@ts-ignore
                  endSubmit(true);
                  setIsData((old) => ({
                    ...old,
                    firstFormhasError: hasError,
                  }));
                }}
                hideHeader={false}
                ref={myMasterRef}
                formState={{
                  MessageBox: MessageBox,
                  CloseMessageBox: CloseMessageBox,
                  docCD: docCD,
                  acctDtlReqPara: {
                    ACCT_CD: {
                      ACCT_TYPE: "ACCT_TYPE",
                      BRANCH_CD: "BRANCH_CD",
                      SCREEN_REF: docCD ?? "",
                    },
                  },
                }}
                onFormButtonClickHandel={() => {
                  navigate("security-detail/");
                }}
                setDataOnFieldChange={(action, payload) => {
                  if (action === "SECURITY_CODE") {
                    setIsData((old) => ({
                      ...old,
                      closeAlert: false,
                      formRefresh: isData?.formRefresh + 1,
                      newFormMTdata: limitEntryDynamicMetaData,
                    }));
                    securityLimitData.mutate({
                      ...payload,
                      ...reqDataRef.current.acctValidData,
                      COMP_CD: authState?.companyID,
                      WORKING_DATE: authState?.workingDate,
                    });
                  }
                  if (action === "VALID_DATA") {
                    setIsData((old) => ({
                      ...old,
                      isVisible: payload?.VALID_DATA,
                      newFormMTdata: limitEntryDynamicMetaData,
                    }));
                    reqDataRef.current.acctValidData = payload;
                  }
                  if (action === "IS_VISIBLE") {
                    setIsData((old) => ({
                      ...old,
                      isVisible: payload?.IS_VISIBLE,
                    }));
                  }
                }}
                formStyle={{
                  background: "white",
                  // height: "calc(100vh - 568px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {({ isSubmitting, handleSubmit }) => {
                  return (
                    <>
                      {isData.isVisible ? (
                        <>
                          <GradientButton
                            color="primary"
                            onClick={() => {
                              navigate("fd-detail/");
                              trackDialogClass("fdDetail");
                            }}
                          >
                            {t("FDDetail")}
                          </GradientButton>
                          <GradientButton
                            color="primary"
                            onClick={() => {
                              navigate("nsc-detail");
                              trackDialogClass("nscDetail");
                            }}
                          >
                            {t("NSCDetail")}
                          </GradientButton>
                        </>
                      ) : null}

                      <GradientButton
                        onClick={(event) => {
                          myRef.current?.handleSubmit(event, "Save", false);
                          handleSubmit(event, "Save", false);
                        }}
                        disabled={isSubmitting || !isData?.isVisible}
                        color={"primary"}
                      >
                        {t("Save")}
                      </GradientButton>
                    </>
                  );
                }}
              </FormWrapper>

              <FormWrapper
                key={"limitEntryFormdy" + isData.formRefresh}
                metaData={isData.newFormMTdata as MetaDataType}
                initialValues={reqDataRef.current.securityDetails}
                formStyle={{
                  paddingTop: "0px",
                  background: "white",
                  height: "calc(100vh - 388px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
                // onSubmitHandler={onSubmit}
                onSubmitHandler={(
                  data: any,
                  displayData,
                  endSubmit,
                  _,
                  __,
                  hasError
                ) => {
                  //@ts-ignore
                  endSubmit(true);
                  setIsData((old) => ({
                    ...old,
                    secondFormhasError: hasError,
                  }));
                }}
                hideHeader={true}
                ref={myRef}
                formState={{
                  MessageBox: MessageBox,
                  CloseMessageBox: CloseMessageBox,
                  docCD: docCD,
                }}
              ></FormWrapper>

              <Routes>
                <Route
                  path="fd-detail/"
                  element={
                    <FdDetails navigate={navigate} myMasterRef={myMasterRef} />
                  }
                />
                <Route
                  path="nsc-detail/*"
                  element={
                    <NscDetails navigate={navigate} myMasterRef={myMasterRef} />
                  }
                />
                <Route
                  path="security-detail/*"
                  element={
                    <SecurityDetailForm
                      navigate={navigate}
                      myMasterRef={myMasterRef}
                      reqDataRef={reqDataRef}
                      myRef={myRef}
                      setIsData={setIsData}
                    />
                  }
                />
              </Routes>
            </div>

            <div
              className={`${isData?.value === "tab2" ? "main" : ""}`}
              style={{
                display: isData.value === "tab2" ? "inherit" : "none",
              }}
            >
              <GridWrapper
                key={
                  `limitentrygridMetaData` +
                  getLimitDetail.isSuccess +
                  isData.gridRefresh
                }
                finalMetaData={limitEntryGridMetaData as GridMetaDataType}
                data={getLimitDetail.data ?? []}
                loading={
                  getLimitDetail?.isLoading ?? validateDeleteData?.isLoading
                }
                setData={() => {}}
                actions={actions}
                setAction={setCurrentAction}
                onClickActionEvent={(index, id, data) => {
                  validateDeleteData.mutate({
                    ...data,
                    COMP_CD: authState?.companyID ?? "",
                    WORKING_DATE: authState?.workingDate ?? "",
                  });
                }}
              />
              <Routes>
                <Route
                  path="forceExpire/*"
                  element={
                    <ForceExpire
                      navigate={navigate}
                      getLimitDetail={getLimitDetail}
                    />
                  }
                />
              </Routes>
            </div>
          </Grid>
        </Container>

        {isData.isDelete && (
          <RemarksAPIWrapper
            TitleText={
              (t("LimitDeleteTitle"),
              {
                docCD: docCD,
                interpolation: { escapeValue: false },
              })
            }
            label="Removal Remarks"
            onActionNo={() => {
              trackDialogClass("main");
              setIsData((old) => ({
                ...old,
                isDelete: false,
              }));
            }}
            onActionYes={(val, rows) => {
              trackDialogClass("main");
              let deleteReqPara = {
                _isNewRow: false,
                _isDeleteRow: true,
                BRANCH_CD: rows.BRANCH_CD,
                TRAN_CD: rows.TRAN_CD,
                ACCT_TYPE: rows.ACCT_TYPE,
                ACCT_CD: rows.ACCT_CD,
                LIMIT_AMOUNT: rows.LIMIT_AMOUNT,
                ACTIVITY_TYPE: "LIMIT ENTRY SCREEN",
                TRAN_DT: rows.TRAN_DT,
                CONFIRMED: rows.CONFIRMED,
                ENTERED_BY: rows.ENTERED_BY,
                USER_DEF_REMARKS: val
                  ? val
                  : t("WrongLimitEntry", {
                      docCD: docCD,
                      interpolation: { escapeValue: false },
                    }),
              };
              crudLimitData.mutate(deleteReqPara);
            }}
            isLoading={crudLimitData?.isLoading}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={isData?.isDelete}
            rows={reqDataRef.current.deleteReq}
            defaultValue={t("WrongLimitEntry", {
              docCD: docCD,
              interpolation: { escapeValue: false },
            })}
          />
        )}
      </>
    </>
  );
};

export const LimitEntry = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <LimitEntryCustom />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
