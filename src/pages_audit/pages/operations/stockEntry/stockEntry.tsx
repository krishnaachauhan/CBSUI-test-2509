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
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { StockEditViewWrapper } from "./documents/documentViewUpload";
import { StockEntryMetaData } from "./stockEntryMetadata";
import { StockGridMetaData } from "./stockGridMetadata";
import { ForceExpireStock } from "./forceExpire/forceExpire";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "react-query";
import {
  ClearCacheProvider,
  FormWrapper,
  MetaDataType,
  queryClient,
  RemarksAPIWrapper,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  crudStockData,
  insertValidate,
  securityFieldDTL,
  stockGridData,
} from "./api";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  GradientButton,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { cloneDeep } from "lodash";
import { getdocCD } from "components/utilFunction/function";
import { useStyles } from "../style";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";

const StockEntryCustom = () => {
  const [isData, setIsData] = useState({
    isDelete: false,
    isVisible: false,
    value: "tab1",
    closeAlert: true,
    newFormMTdata: StockEntryMetaData,
  });
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const myMasterRef = useRef<any>(null);
  const reqDataRef = useRef<any>({});
  const { deleteReq } = reqDataRef.current;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const style = useStyles();
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const detailActions: ActionTypes[] = [
    {
      actionName: "force-view-details",
      actionLabel: "ForceExpViewDetail",
      multiple: false,
      rowDoubleClick: true,
    },
    {
      actionName: "view-upload",
      actionLabel: "UploadViewDocument",
      multiple: false,
      rowDoubleClick: false,
    },
  ];

  const securityStoclDTL: any = useMutation(
    "securityFieldDTL",
    securityFieldDTL,
    {
      onSuccess: (data) => {
        let newData;
        if (data.length > 0) {
          let newMetadata: any = [...StockEntryMetaData.fields, ...data];
          newData = { ...isData.newFormMTdata, fields: newMetadata };
        } else {
          newData = { ...StockEntryMetaData };
        }
        setIsData((old) => ({ ...old, newFormMTdata: newData }));
      },
      onError: () => {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const stockEntryGridData: any = useMutation("stockGridData", stockGridData, {
    onError: () => {
      setIsData((old) => ({ ...old, closeAlert: true }));
    },
  });

  const insertValidateData: any = useMutation(
    "insertValidate",
    insertValidate,
    {
      onSuccess: (data) => {
        async function insertData() {
          if (data?.[0]?.O_STATUS === "0") {
            let res = await MessageBox({
              messageTitle: "confirmation",
              message: "insertMessage",
              buttonNames: ["Yes", "No"],
              defFocusBtnName: "Yes",
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });

            if (res === "Yes") {
              stockDataCRUD.mutate({
                ...reqDataRef.current?.insertReq,
              });
            }
          } else if (data?.[0]?.O_STATUS === "999" && data?.[0]?.O_MESSAGE) {
            MessageBox({
              messageTitle: "ValidationFailed",
              message: data?.[0]?.O_MESSAGE,
              icon: "ERROR",
            });
          }
        }
        insertData();
      },
      onError: () => {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const stockDataCRUD: any = useMutation("crudStockData", crudStockData, {
    onSuccess: (data, variables) => {
      if (variables?._isDeleteRow) {
        if (data?.[0]?.STATUS === "999") {
          MessageBox({
            messageTitle: "Alert",
            message: data?.[0]?.MESSAGE,
            icon: "WARNING",
            defFocusBtnName: "Ok",
          });
        } else {
          enqueueSnackbar(t("deleteSuccessfully"), { variant: "success" });
        }
        setIsData((old) => ({ ...old, isDelete: false }));
        stockEntryGridData.mutate({
          COMP_CD: authState?.companyID,
          ACCT_CD: variables?.ACCT_CD,
          ACCT_TYPE: variables?.ACCT_TYPE,
          BRANCH_CD: variables?.BRANCH_CD,
          A_USER_LEVEL: authState?.role,
          A_GD_DATE: authState?.workingDate,
        });
      } else if (variables?._isNewRow) {
        CloseMessageBox();
        if (data?.[0]?.STATUS === "9") {
          MessageBox({
            messageTitle: "Alert",
            message: data?.[0]?.MESSAGE,
            icon: "WARNING",
            defFocusBtnName: "Ok",
          });
        }
        myMasterRef?.current?.handleFormReset({ preventDefault: () => {} });
        enqueueSnackbar(t("insertSuccessfully"), { variant: "success" });
        setIsData((old) => ({
          ...old,
          newFormMTdata: StockEntryMetaData,
          isVisible: false,
        }));
      }
    },
    onError: () => {
      setIsData((old) => ({ ...old, closeAlert: true, isDelete: false }));
      CloseMessageBox();
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["securityFieldDTL"]);
      queryClient.removeQueries(["insertValidate"]);
      queryClient.removeQueries(["stockGridData"]);
      queryClient.removeQueries(["crudStockData"]);
    };
  }, []);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "view-upload") {
        navigate(data?.name, {
          state: data?.rows,
        });
      } else if (data.name === "force-view-details") {
        trackDialogClass("force-view-details");
        let rowData = data?.rows?.[0]?.data;
        if (rowData?.ALLOW_FORCE_EXPIRE_FLAG === "Y") {
          let res = await MessageBox({
            messageTitle:
              rowData?.PARENT_TYPE.trim() === "SOD" ? "Alert" : "confirmation",
            message:
              rowData?.PARENT_TYPE.trim() === "SOD"
                ? "AreYouSureToWithdrawShare"
                : "forceExpDrawingPowerMSG",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });

          if (res === "Yes") {
            navigate(data?.name, {
              state: { ...rowData, formMode: "edit" },
            });
          }
        } else {
          navigate(data?.name, {
            state: { ...rowData, formMode: "view" },
          });
        }
      }
    },
    [navigate]
  );

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

            stockEntryGridData.data = [];
            if (newValue === "tab2") {
              //API calling for Grid-Details on tab-change, and account number and name set to inside the header of Grid-details
              myMasterRef?.current?.getFieldData().then((res) => {
                if (res?.ACCT_CD && res?.ACCT_TYPE && res?.BRANCH_CD) {
                  StockGridMetaData.gridConfig.subGridLabel = `\u00A0\u00A0 ${(
                    authState?.companyID +
                    "-" +
                    res?.BRANCH_CD +
                    "-" +
                    res?.ACCT_TYPE +
                    "-" +
                    res?.ACCT_CD
                  ).replace(/\s/g, "")} — ${res?.ACCT_NM}`;
                  const RequestPara = {
                    COMP_CD: authState?.companyID,
                    ACCT_CD: res?.ACCT_CD,
                    ACCT_TYPE: res?.ACCT_TYPE,
                    BRANCH_CD: res?.BRANCH_CD,
                    A_USER_LEVEL: authState?.role,
                    A_GD_DATE: authState?.workingDate,
                  };
                  stockEntryGridData.mutate(RequestPara);
                }
              });
            }
          }}
          aria-label="secondary tabs example"
        >
          <Tab value="tab1" tabIndex={0} label={t("stockEntry")} />
          {isData.isVisible && (
            <Tab value="tab2" tabIndex={0} label={t("stockDetail")} />
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
          {securityStoclDTL.isLoading || insertValidateData.isLoading ? (
            <LinearProgress color="secondary" />
          ) : (securityStoclDTL?.isError && isData.closeAlert) ||
            (stockEntryGridData?.isError && isData.closeAlert) ||
            (insertValidateData?.isError && isData.closeAlert) ||
            (stockDataCRUD?.isError && isData.closeAlert) ? (
            <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={
                    securityStoclDTL?.error?.error_msg ??
                    stockEntryGridData?.error?.error_msg ??
                    insertValidateData?.error?.error_msg ??
                    stockDataCRUD?.error?.error_msg ??
                    "Unknow Error"
                  }
                  errorDetail={
                    securityStoclDTL?.error?.error_detail ??
                    stockEntryGridData?.error?.error_detail ??
                    insertValidateData?.error?.error_detail ??
                    stockDataCRUD?.error?.error_detail ??
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
              key={"stockEntry"}
              metaData={(isData.newFormMTdata as MetaDataType) ?? {}}
              initialValues={{}}
              subHeaderLabel={utilFunction.getDynamicLabel(
                useLocation().pathname,
                authState?.menulistdata,
                true
              )}
              subHeaderLabelStyle={{ paddingLeft: "0px !important" }}
              onSubmitHandler={(data: any, displayData, endSubmit) => {
                let apiReq = {
                  COMP_CD: authState?.companyID ?? "",
                  WORKING_DATE: authState?.workingDate ?? "",
                  BRANCH_CD: data?.BRANCH_CD ?? "",
                  STOCK_VALUE: data?.STOCK_VALUE ?? "",
                  MARGIN: data?.MARGIN ?? "",
                  CREDITOR: data?.CREDITOR ? data?.CREDITOR : "",
                  SECURITY_CD: data?.SECURITY_CD ?? "",
                  STOCK_MONTH: data?.STOCK_MONTH ?? "",
                  TRN_DATE: data?.TRAN_DT
                    ? format(new Date(data?.TRAN_DT), "dd-MMM-yyyy")
                    : "",
                  ASON_DATE: data?.ASON_DT
                    ? format(new Date(data?.ASON_DT), "dd-MMM-yyyy")
                    : "",
                  RECEIVE_DT: data?.RECEIVED_DT
                    ? format(new Date(data?.RECEIVED_DT), "dd-MMM-yyyy")
                    : "",
                };
                reqDataRef.current.insertReq = {
                  ...data,
                  ...apiReq,
                  _isNewRow: true,
                };
                insertValidateData.mutate(apiReq);
                //@ts-ignore
                endSubmit(true);
              }}
              ref={myMasterRef}
              formState={{
                MessageBox: MessageBox,
                docCD: docCD,
                isVisible: isData?.isVisible,
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
                    newFormMTdata: StockEntryMetaData,
                  }));
                }
                if (action === "isVisible") {
                  setIsData((old) => ({
                    ...old,
                    isVisible: payload.isVisible,
                  }));
                }
                if (action === "SECURITY_CD") {
                  securityStoclDTL.mutate(payload);
                }
              }}
              formStyle={{}}
            >
              {({ isSubmitting, handleSubmit }) => (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting || !isData?.isVisible}
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
              key={`stockGridData` + stockEntryGridData.isSuccess}
              finalMetaData={StockGridMetaData as GridMetaDataType}
              data={stockEntryGridData?.data ?? []}
              setData={() => {}}
              loading={stockEntryGridData.isLoading}
              actions={detailActions}
              setAction={setCurrentAction}
              onClickActionEvent={(index, id, data) => {
                if (id === "DOC_FLAG") {
                  trackDialogClass("view-upload");
                  setCurrentAction({
                    rows: [{ data }],
                    name: "view-upload",
                  });
                }
                if (id === "ALLOW_DELETE_FLAG") {
                  trackDialogClass("remarks__wrapper__base");
                  reqDataRef.current.deleteReq = data;
                  setIsData((old) => ({ ...old, isDelete: true }));
                }
                if (id === "VIEW_DETAIL") {
                  trackDialogClass("force-view-details");
                  navigate("force-view-details", {
                    state: { ...data, formMode: "view" },
                  });
                }
              }}
            />

            <Routes>
              <Route
                path="view-upload/*"
                element={
                  <StockEditViewWrapper
                    navigate={navigate}
                    stockEntryGridData={stockEntryGridData}
                  />
                }
              />
              <Route
                path="force-view-details/*"
                element={
                  <ForceExpireStock
                    stockEntryGridData={stockEntryGridData}
                    navigate={navigate}
                  />
                }
              />
            </Routes>
          </div>
        </Grid>
      </Container>

      {isData.isDelete && (
        <RemarksAPIWrapper
          TitleText={t("StockDeleteTitle", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          onActionNo={() => {
            trackDialogClass("main");
            setIsData((old) => ({ ...old, isDelete: false }));
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
              TRAN_DT: rows.TRAN_DT,
              ENTERED_DATE: rows.ENTERED_DATE,
              CONFIRMED: rows.CONFIRMED,
              USER_DEF_REMARKS: val
                ? val
                : t("WrongStockEntry", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  }),

              ACTIVITY_TYPE: "STOCK ENTRY SCREEN",
              ENTERED_BY: rows.ENTERED_BY,
              STOCK_VALUE: rows?.STOCK_VALUE,
              ASON_DT: rows.ASON_DT,
            };
            stockDataCRUD.mutate(deleteReqPara);
          }}
          isLoading={stockDataCRUD?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText={t("Ok")}
          CanceltbuttonLabelText={t("Cancel")}
          open={isData.isDelete}
          rows={deleteReq}
          defaultValue={t("WrongStockEntry", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </>
  );
};

export const StockEntry = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <StockEntryCustom />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
